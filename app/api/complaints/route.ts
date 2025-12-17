// Complaints API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse, Complaint } from '@/lib/types'
import { addHours } from 'date-fns'
import { requireRole } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      // Map status to Prisma enum format (PascalCase)
      const statusMap: Record<string, string> = {
        'OPEN': 'Open',
        'IN_PROGRESS': 'InProgress',
        'IN PROGRESS': 'InProgress',
        'RESOLVED': 'Resolved',
        'CLOSED': 'Closed',
        'ESCALATED': 'Escalated',
        // Also accept already correct format
        'Open': 'Open',
        'InProgress': 'InProgress',
        'Resolved': 'Resolved',
        'Closed': 'Closed',
        'Escalated': 'Escalated',
      }
      const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_')
      where.status = statusMap[normalizedStatus] || statusMap[status] || status
    }
    if (priority) {
      where.priority = priority
    }
    // Filter by reportedBy if provided
    const reportedBy = searchParams.get('reportedBy')
    if (reportedBy) {
      where.reportedBy = reportedBy
    }
    // Filter by assignedTo if provided
    const assignedTo = searchParams.get('assignedTo')
    if (assignedTo) {
      where.assignedTo = assignedTo
    }
    // Filter by assetId if provided
    const assetId = searchParams.get('assetId')
    if (assetId) {
      where.assetId = assetId
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { reportedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ])

    // Enrich complaints with asset data from Mongoose
    const { enrichComplaintsWithAssets } = await import(
      '@/lib/services/complaintAssetHelper'
    )
    const enrichedComplaints = await enrichComplaintsWithAssets(complaints)

    const response: PaginatedResponse<Complaint> = {
      data: enrichedComplaints as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    const body = await request.json()
    const { userId, role } = authResult

    // Calculate SLA deadline based on priority
    let slaDeadline: Date | null = null
    const now = new Date()
    switch (body.priority) {
      case 'Critical':
        slaDeadline = addHours(now, 2)
        break
      case 'High':
        slaDeadline = addHours(now, 4)
        break
      case 'Medium':
        slaDeadline = addHours(now, 8)
        break
      case 'Low':
        slaDeadline = addHours(now, 24)
        break
    }

    // Auto-assign to full access user if complaint is from normal user
    let assignedTo = body.assignedTo || null
    if (role === 'normal' && !assignedTo) {
      // Find a full access user to assign
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()

      // Get all users and filter for full_access role
      const users = await client.users.getUserList({ limit: 100 })
      const fullAccessUsers = users.data.filter(
        (user) => user.publicMetadata?.role === 'full_access'
      )

      if (fullAccessUsers.length > 0) {
        // Assign to first available full access user (round-robin could be implemented)
        assignedTo = fullAccessUsers[0].id
      }
    }

    // Set reportedBy to current user if not provided
    const reportedBy = body.reportedBy || userId

    // Verify asset exists (assets are stored via Mongoose, not Prisma)
    if (body.assetId) {
      const { default: connectDB } = await import('@/lib/db/mongodb')
      const { default: Asset } = await import('@/lib/models/Asset')
      await connectDB()
      const asset = await Asset.findOne({ id: body.assetId }).lean()
      if (!asset) {
        return NextResponse.json(
          { success: false, error: `Asset with ID ${body.assetId} not found` },
          { status: 404 }
        )
      }
    }

    // Create complaint - NO includes because reporter/assignee are Clerk users, not Prisma users
    const complaint = await prisma.complaint.create({
      data: {
        id: body.id || `COMP-${Date.now()}`,
        assetId: body.assetId,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: 'Open',
        reportedBy,
        assignedTo,
        slaDeadline,
      },
    })

    // Fetch asset separately from Mongoose if needed
    let assetData = null
    if (body.assetId) {
      try {
        const { default: connectDB } = await import('@/lib/db/mongodb')
        const { default: Asset } = await import('@/lib/models/Asset')
        await connectDB()
        const asset = await Asset.findOne({ id: body.assetId }).lean()
        if (asset) {
          assetData = {
            id: asset.id,
            name: asset.name,
            model: asset.model,
            manufacturer: asset.manufacturer,
            department: asset.department,
            location: asset.location,
            status: asset.status,
          }
        }
      } catch (assetError) {
        console.error('Error fetching asset:', assetError)
        // Don't fail the request if asset fetch fails
      }
    }

    // Send notification to assigned full access user
    if (assignedTo && role === 'normal') {
      const { notificationService } = await import(
        '@/lib/services/notificationService'
      )
      try {
        // Get assignee email from Clerk (not Prisma - assignee relation doesn't exist)
        let assigneeEmail: string | undefined
        try {
          const { clerkClient } = await import('@clerk/nextjs/server')
          const client = await clerkClient()
          const assignee = await client.users.getUser(assignedTo)
          assigneeEmail = assignee.emailAddresses[0]?.emailAddress
        } catch (clerkError) {
          console.error('Error fetching assignee from Clerk:', clerkError)
        }

        await notificationService.notifyComplaintAssigned(
          assignedTo,
          {
            complaintId: complaint.id,
            assetName: assetData?.name || 'Unknown Asset',
            priority: complaint.priority,
            title: complaint.title,
          },
          {
            sendEmail: true,
            email: assigneeEmail,
          }
        )
      } catch (notifError) {
        console.error('Error sending notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...complaint,
        asset: assetData, // Include asset data from Mongoose
      },
    })
  } catch (error: any) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create complaint' },
      { status: 500 }
    )
  }
}
