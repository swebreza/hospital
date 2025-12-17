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
      where.status = status.toUpperCase().replace(' ', '_')
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
        include: {
          asset: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { reportedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ])

    const response: PaginatedResponse<Complaint> = {
      data: complaints as any,
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
      include: {
        asset: true,
        reporter: true,
        assignee: true,
      },
    })

    // Send notification to assigned full access user
    if (assignedTo && role === 'normal') {
      const { notificationService } = await import('@/lib/services/notificationService')
      try {
        await notificationService.notifyComplaintAssigned(
          assignedTo,
          {
            complaintId: complaint.id,
            assetName: (complaint.asset as any)?.name || 'Unknown Asset',
            priority: complaint.priority,
            title: complaint.title,
          },
          {
            sendEmail: true,
            email: (complaint.assignee as any)?.email,
          }
        )
      } catch (notifError) {
        console.error('Error sending notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      data: complaint,
    })
  } catch (error: any) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create complaint' },
      { status: 500 }
    )
  }
}



