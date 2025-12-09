import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import {
  generateReplacementRecommendations,
  getAssetsNearingEndOfLife,
  notifyEndOfLifeAssets,
} from '@/lib/services/lifecycleAnalysis'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'recommendations' | 'endOfLife' | 'notifications'

    if (type === 'recommendations') {
      const minAge = parseInt(searchParams.get('minAge') || '5')
      const maxServiceCostRatio = parseFloat(searchParams.get('maxServiceCostRatio') || '0.5')
      const minDowntimeHours = parseInt(searchParams.get('minDowntimeHours') || '100')
      const minUtilization = parseInt(searchParams.get('minUtilization') || '20')

      const recommendations = await generateReplacementRecommendations({
        minAge,
        maxServiceCostRatio,
        minDowntimeHours,
        minUtilization,
      })

      return NextResponse.json({
        success: true,
        data: recommendations,
      })
    }

    if (type === 'endOfLife') {
      const thresholdYears = parseInt(searchParams.get('thresholdYears') || '5')
      const assets = await getAssetsNearingEndOfLife(thresholdYears)

      return NextResponse.json({
        success: true,
        data: assets,
      })
    }

    if (type === 'notifications') {
      const thresholdYears = parseInt(searchParams.get('thresholdYears') || '5')
      const notifications = await notifyEndOfLifeAssets(thresholdYears)

      return NextResponse.json({
        success: true,
        data: notifications,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Error in lifecycle analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform lifecycle analysis' },
      { status: 500 }
    )
  }
}

