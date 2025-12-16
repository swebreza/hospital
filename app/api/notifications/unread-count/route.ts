import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { notificationService } from '@/lib/services/notificationService'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const count = await notificationService.getUnreadCount(userId)

    return NextResponse.json({
      success: true,
      count,
    })
  } catch (error: any) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}
