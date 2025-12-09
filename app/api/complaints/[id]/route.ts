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
        asset: true,
        reporter: true,
        assignee: true,
        workOrders: true,
      },
    })

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: complaint,
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

    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status.toUpperCase().replace(' ', '_')
      
      // Track response and resolution times
      if (body.status === 'InProgress' && !body.respondedAt) {
        updateData.respondedAt = new Date()
      }
      if (body.status === 'Resolved' || body.status === 'Closed') {
        updateData.resolvedAt = new Date()
      }
    }

    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo
      
      // Notify assignee
      if (body.assignedTo) {
        const assignee = await prisma.user.findUnique({
          where: { id: body.assignedTo },
        })

        if (assignee) {
          await notificationService.notifyComplaintAssigned(
            body.assignedTo,
            {
              complaintId: id,
              assetName: '', // Will be filled from complaint
              priority: '', // Will be filled from complaint
              title: '', // Will be filled from complaint
            },
            {
              sendEmail: true,
              email: assignee.email || undefined,
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
      include: {
        asset: true,
        reporter: true,
        assignee: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: complaint,
    })
  } catch (error: any) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update complaint' },
      { status: 500 }
    )
  }
}

