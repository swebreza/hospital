import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/services/notificationService'
import { getUserRole } from '@/lib/auth/roles'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only normal users can confirm resolution
    const role = await getUserRole()
    if (role !== 'normal') {
      return NextResponse.json(
        { success: false, error: 'Only normal users can confirm resolution' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { confirmed, feedback } = body

    // Get complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    })

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    // Check if user is the reporter
    if (complaint.reportedBy !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only confirm resolution for your own complaints' },
        { status: 403 }
      )
    }

    // Check if complaint is in Resolved status
    if (complaint.status !== 'RESOLVED') {
      return NextResponse.json(
        { success: false, error: 'Complaint must be in Resolved status to confirm' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    if (confirmed) {
      // User confirms resolution - close the complaint
      updateData.status = 'Closed' // Prisma enum uses PascalCase
      updateData.resolvedAt = new Date()
    } else {
      // User rejects resolution - reopen the complaint
      updateData.status = 'Open' // Prisma enum uses PascalCase
      updateData.resolution = feedback || complaint.resolution
    }

    // Update complaint
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    })

    // Enrich with asset data from Mongoose
    const { enrichComplaintWithAsset } = await import('@/lib/services/complaintAssetHelper')
    const enrichedComplaint = await enrichComplaintWithAsset(updatedComplaint)

    // Notify full access user (assignee) about confirmation/rejection
    if (complaint.assignedTo) {
      try {
        const message = confirmed
          ? `Complaint ${id} has been confirmed as resolved by the reporter.`
          : `Complaint ${id} resolution has been rejected by the reporter. Feedback: ${feedback || 'No feedback provided'}`

        await notificationService.createNotification({
          userId: complaint.assignedTo as string,
          type: 'COMPLAINT_ASSIGNED' as any, // Using existing type, can be extended in schema
          title: confirmed
            ? `Complaint Resolved: ${complaint.id}`
            : `Complaint Reopened: ${complaint.id}`,
          message,
          entityType: 'complaint',
          entityId: id,
          sendEmail: false,
        })
      } catch (notifError) {
        console.error('Error notifying assignee:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedComplaint,
      message: confirmed
        ? 'Complaint confirmed as resolved and closed'
        : 'Complaint reopened for further action',
    })
  } catch (error: any) {
    console.error('Error confirming resolution:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm resolution' },
      { status: 500 }
    )
  }
}

