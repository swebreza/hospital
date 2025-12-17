// PM Edit Requests API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/services/notificationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityType, entityId, requestedBy, changes } = body

    const editRequest = await prisma.editRequest.create({
      data: {
        entityType,
        entityId,
        requestedBy,
        changes: changes as any,
        status: 'Pending',
      },
      include: {
        requester: true,
      },
    })

    // Notify supervisor (this would need supervisor lookup logic)
    // For now, we'll notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'manager'] } },
    })

    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Edit Request Pending Approval',
        message: `${editRequest.requester?.name} has requested to edit ${entityType} ${entityId}. Please review and approve.`,
        entityType: 'edit_request',
        entityId: editRequest.id,
        sendEmail: true,
        emailRecipients: admin.email ? [admin.email] : undefined,
      })
    }

    return NextResponse.json({
      success: true,
      data: editRequest,
    })
  } catch (error: any) {
    console.error('Error creating edit request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create edit request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, approvedBy, comments } = body

    const editRequest = await prisma.editRequest.findUnique({
      where: { id },
      include: {
        requester: true,
      },
    })

    if (!editRequest) {
      return NextResponse.json(
        { success: false, error: 'Edit request not found' },
        { status: 404 }
      )
    }

    // Update edit request
    const updated = await prisma.editRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: status === 'Approved' ? approvedBy : null,
        comments,
      },
      include: {
        approver: true,
        requester: true,
      },
    })

    // If approved, apply changes (this would need entity-specific logic)
    if (status === 'Approved' && editRequest.entityType === 'preventive_maintenance') {
      // Apply changes to PM
      await prisma.preventiveMaintenance.update({
        where: { id: editRequest.entityId },
        data: editRequest.changes as any,
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: approvedBy,
          action: 'EDIT_APPROVED',
          entityType: editRequest.entityType,
          entityId: editRequest.entityId,
          changes: editRequest.changes,
        },
      })
    }

    // Notify requester
    if (editRequest.requestedBy) {
      await notificationService.createNotification({
        userId: editRequest.requestedBy,
        type: 'SYSTEM',
        title: `Edit Request ${status}`,
        message: `Your edit request for ${editRequest.entityType} ${editRequest.entityId} has been ${status.toLowerCase()}.`,
        entityType: 'edit_request',
        entityId: id,
      })
    }

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Error updating edit request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update edit request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const editRequests = await prisma.editRequest.findMany({
      where,
      include: {
        requester: true,
        approver: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: editRequests,
    })
  } catch (error: any) {
    console.error('Error fetching edit requests:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch edit requests' },
      { status: 500 }
    )
  }
}





