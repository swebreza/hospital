import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import {
  getAssetHistory,
  getAssetHistoryByType,
  getAssetHistoryTimeline,
  getAssetHistoryStats,
} from '@/lib/services/assetHistory'
import type { AssetHistory } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const searchParams = request.nextUrl.searchParams

    const eventType = searchParams.get('eventType') as AssetHistory['eventType'] | null
    const groupBy = searchParams.get('groupBy') // 'type' | 'timeline' | 'stats'
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = parseInt(searchParams.get('skip') || '0')

    if (groupBy === 'type') {
      const history = await getAssetHistoryByType(id)
      return NextResponse.json({
        success: true,
        data: history,
      })
    }

    if (groupBy === 'timeline') {
      const timeline = await getAssetHistoryTimeline(id)
      return NextResponse.json({
        success: true,
        data: timeline,
      })
    }

    if (groupBy === 'stats') {
      const stats = await getAssetHistoryStats(id)
      return NextResponse.json({
        success: true,
        data: stats,
      })
    }

    // Default: return paginated history
    const history = await getAssetHistory(id, {
      eventType: eventType || undefined,
      limit,
      skip,
    })

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error: unknown) {
    console.error('Error fetching asset history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset history' },
      { status: 500 }
    )
  }
}

