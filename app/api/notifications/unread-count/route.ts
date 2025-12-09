// Get unread notification count

import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/services/notificationService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || ''

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const count = await notificationService.getUnreadCount(userId)

    return NextResponse.json({
      success: true,
      data: { count },
    })
  } catch (error: any) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}

