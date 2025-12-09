import { NextRequest, NextResponse } from 'next/server'
import { getAllDashboardMetrics } from '@/lib/services/dashboardMetrics'

export async function GET(request: NextRequest) {
  try {
    const metrics = await getAllDashboardMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch dashboard metrics',
      },
      { status: 500 }
    )
  }
}

