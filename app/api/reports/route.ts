import { NextRequest, NextResponse } from 'next/server'
import {
  generatePMComplianceReport,
  generateCalibrationComplianceReport,
  generateDowntimeTrendsReport,
  generateAssetInsightsReport,
  generateInventorySummaryReport,
  generateCAPEXOverviewReport,
  generateUtilizationReport,
  generateCriticalDowntimeReport,
} from '@/lib/services/reportGeneration'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get('type')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'Report type is required' },
        { status: 400 }
      )
    }

    let reportData

    switch (reportType) {
      case 'pm-compliance':
        reportData = await generatePMComplianceReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      case 'calibration-compliance':
        reportData = await generateCalibrationComplianceReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      case 'downtime-trends':
        if (!dateFrom || !dateTo) {
          return NextResponse.json(
            { success: false, error: 'dateFrom and dateTo are required for downtime trends' },
            { status: 400 }
          )
        }
        reportData = await generateDowntimeTrendsReport(dateFrom, dateTo)
        break

      case 'asset-insights':
        reportData = await generateAssetInsightsReport()
        break

      case 'inventory-summary':
        reportData = await generateInventorySummaryReport()
        break

      case 'capex-overview':
        reportData = await generateCAPEXOverviewReport()
        break

      case 'equipment-utilization':
        reportData = await generateUtilizationReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      case 'critical-downtime':
        reportData = await generateCriticalDowntimeReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown report type: ${reportType}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      reportType,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    )
  }
}

