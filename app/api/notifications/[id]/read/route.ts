// Mark notification as read

import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/services/notificationService'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await notificationService.markAsRead(id)

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}




