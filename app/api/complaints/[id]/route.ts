// Individual Complaint API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/services/notificationService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        workOrders: true,
      },
    })

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    // Enrich with asset data from Mongoose
    const { enrichComplaintWithAsset } = await import('@/lib/services/complaintAssetHelper')
    const enrichedComplaint = await enrichComplaintWithAsset(complaint)

    return NextResponse.json({
      success: true,
      data: enrichedComplaint,
    })
  } catch (error: any) {
    console.error('Error fetching complaint:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch complaint' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check authentication and role
    const { requireRole } = await import('@/lib/auth/api-auth')
    const authResult = await requireRole(['full_access'])
    if (authResult.error) {
      return authResult.error
    }

    // Get current complaint to check reporter
    const currentComplaint = await prisma.complaint.findUnique({
      where: { id },
    })

    if (!currentComplaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    const oldStatus = currentComplaint.status

    if (body.status) {
      updateData.status = body.status.toUpperCase().replace(' ', '_')
      
      // Track response and resolution times
      if (body.status === 'IN_PROGRESS' && !currentComplaint.respondedAt) {
        updateData.respondedAt = new Date()
      }
      if ((body.status === 'RESOLVED' || body.status === 'CLOSED') && !currentComplaint.resolvedAt) {
        updateData.resolvedAt = new Date()
      }
    }

    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo
      
      // Notify assignee
      if (body.assignedTo) {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        const assignee = await client.users.getUser(body.assignedTo)

        if (assignee) {
          // Fetch asset name from Mongoose
          let assetName = 'Unknown Asset'
          if (currentComplaint.assetId) {
            try {
              const { default: connectDB } = await import('@/lib/db/mongodb')
              const { default: Asset } = await import('@/lib/models/Asset')
              await connectDB()
              const asset = await Asset.findOne({ id: currentComplaint.assetId }).lean()
              if (asset) {
                assetName = asset.name
              }
            } catch (assetError) {
              console.error('Error fetching asset for notification:', assetError)
            }
          }

          await notificationService.notifyComplaintAssigned(
            body.assignedTo,
            {
              complaintId: id,
              assetName,
              priority: currentComplaint.priority,
              title: currentComplaint.title,
            },
            {
              sendEmail: true,
              email: assignee.emailAddresses[0]?.emailAddress,
            }
          )
        }
      }
    }

    if (body.downtimeMinutes !== undefined) {
      updateData.downtimeMinutes = body.downtimeMinutes
    }

    if (body.rootCause !== undefined) {
      updateData.rootCause = body.rootCause
    }

    if (body.resolution !== undefined) {
      updateData.resolution = body.resolution
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    })

    // Enrich with asset data from Mongoose
    const { enrichComplaintWithAsset } = await import('@/lib/services/complaintAssetHelper')
    const enrichedComplaint = await enrichComplaintWithAsset(complaint)

    // Notify reporter (normal user) if status changed
    if (body.status && body.status !== oldStatus && currentComplaint.reportedBy) {
      try {
        const reporterId = currentComplaint.reportedBy as string
        
        // Create notification for status change
        await notificationService.createNotification({
          userId: reporterId,
          type: 'COMPLAINT_ASSIGNED' as any, // Using existing type, can be extended in schema
          title: `Complaint Status Updated: ${complaint.id}`,
          message: `Your complaint "${complaint.title}" status has been changed to ${body.status}.`,
          entityType: 'complaint',
          entityId: id,
          sendEmail: false, // Can be enabled if needed
        })
      } catch (notifError) {
        console.error('Error notifying reporter:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedComplaint,
    })
  } catch (error: any) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update complaint' },
      { status: 500 }
    )
  }
}



