// Notifications API route

import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/services/notificationService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get user ID from auth (for now, using query param)
    const userId = searchParams.get('userId') || ''

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

