// PM Auto-schedule API route

import { NextRequest, NextResponse } from 'next/server'
import { pmScheduler } from '@/lib/services/pmScheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetIds } = body

    const scheduledPMs = await pmScheduler.autoSchedulePMs(assetIds)

    return NextResponse.json({
      success: true,
      data: {
        count: scheduledPMs.length,
        pms: scheduledPMs,
      },
    })
  } catch (error: any) {
    console.error('Error auto-scheduling PMs:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to auto-schedule PMs' },
      { status: 500 }
    )
  }
}

