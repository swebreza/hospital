// Report Generation API route

import { NextRequest, NextResponse } from 'next/server'
import { reportService } from '@/lib/services/reportService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, year, month, format = 'excel' } = body

    let reportData: any

    if (type === 'daily') {
      reportData = await reportService.generateDailyReport(date ? new Date(date) : new Date())
    } else if (type === 'monthly') {
      reportData = await reportService.generateMonthlyReport(year, month)
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid report type' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reportData,
    })
  } catch (error: any) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}





