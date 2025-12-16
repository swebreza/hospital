// Calibration Schedule API route

import { NextRequest, NextResponse } from 'next/server'
import { calibrationScheduler } from '@/lib/services/calibrationScheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const calibration = await calibrationScheduler.scheduleCalibration({
      assetId: body.assetId,
      scheduledDate: new Date(body.scheduledDate),
      vendorId: body.vendorId,
    })

    return NextResponse.json({
      success: true,
      data: calibration,
    })
  } catch (error: any) {
    console.error('Error scheduling calibration:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to schedule calibration' },
      { status: 500 }
    )
  }
}



