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
import { exportToExcel, exportMultipleSheets } from '@/lib/utils/excelExport'
import { exportToPDF } from '@/lib/utils/pdfExport'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, format, dateFrom, dateTo } = body

    if (!reportType || !format) {
      return NextResponse.json(
        { success: false, error: 'reportType and format are required' },
        { status: 400 }
      )
    }

    if (!['excel', 'pdf'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'format must be "excel" or "pdf"' },
        { status: 400 }
      )
    }

    // Generate report data
    let reportData: unknown
    let reportTitle = ''

    switch (reportType) {
      case 'pm-compliance':
        reportTitle = 'PM Compliance Report'
        reportData = await generatePMComplianceReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      case 'calibration-compliance':
        reportTitle = 'Calibration Compliance Report'
        reportData = await generateCalibrationComplianceReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      case 'downtime-trends':
        reportTitle = 'Downtime Trends Report'
        if (!dateFrom || !dateTo) {
          return NextResponse.json(
            { success: false, error: 'dateFrom and dateTo are required for downtime trends' },
            { status: 400 }
          )
        }
        reportData = await generateDowntimeTrendsReport(dateFrom, dateTo)
        break

      case 'asset-insights':
        reportTitle = 'Asset Insights Report'
        reportData = await generateAssetInsightsReport()
        break

      case 'inventory-summary':
        reportTitle = 'Inventory Summary Report'
        reportData = await generateInventorySummaryReport()
        break

      case 'capex-overview':
        reportTitle = 'CAPEX Overview Report'
        reportData = await generateCAPEXOverviewReport()
        break

      case 'equipment-utilization':
        reportTitle = 'Equipment Utilization Report'
        reportData = await generateUtilizationReport(
          dateFrom || undefined,
          dateTo || undefined
        )
        break

      case 'critical-downtime':
        reportTitle = 'Critical Equipment Downtime Analysis'
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

    // Convert report data to export format
    if (format === 'excel') {
      const excelData = convertReportToExcel(reportData, reportType)
      const buffer = exportMultipleSheets(excelData.sheets, `${reportTitle}.xlsx`)

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${reportTitle}.xlsx"`,
        },
      })
    } else if (format === 'pdf') {
      const pdfData = convertReportToPDF(reportData, reportType, reportTitle)
      const buffer = exportToPDF(pdfData)

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportTitle}.pdf"`,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid format' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export report',
      },
      { status: 500 }
    )
  }
}

/**
 * Convert report data to Excel format
 */
function convertReportToExcel(
  reportData: unknown,
  reportType: string
): { sheets: Array<{ name: string; headers: string[]; data: unknown[][] }> } {
  const sheets: Array<{ name: string; headers: string[]; data: unknown[][] }> = []

  // This is a simplified conversion - each report type will need specific handling
  // For now, we'll create a basic structure

  if (reportType === 'calibration-compliance') {
    const data = reportData as Awaited<ReturnType<typeof generateCalibrationComplianceReport>>
    
    // Summary sheet
    sheets.push({
      name: 'Summary',
      headers: ['Metric', 'Value'],
      data: [
        ['Total Calibrations', data.summary.totalCalibrations],
        ['Completed', data.summary.completed],
        ['Expired', data.summary.expired],
        ['Overdue', data.summary.overdue],
        ['Expiring Soon', data.summary.expiringSoon],
        ['Compliance Rate', `${data.summary.complianceRate}%`],
      ],
    })

    // By Department sheet
    if (data.byDepartment.length > 0) {
      sheets.push({
        name: 'By Department',
        headers: ['Department', 'Total', 'Expired', 'Overdue', 'Expiring Soon', 'Compliance Rate'],
        data: data.byDepartment.map((d) => [
          d.department,
          d.total,
          d.expired,
          d.overdue,
          d.expiringSoon,
          `${d.complianceRate}%`,
        ]),
      })
    }

    // Expired sheet
    if (data.expired.length > 0) {
      sheets.push({
        name: 'Expired',
        headers: ['Asset ID', 'Asset Name', 'Department', 'Next Due Date', 'Days Expired'],
        data: data.expired.map((e) => [
          e.assetId,
          e.assetName,
          e.department,
          e.nextDueDate,
          e.daysExpired,
        ]),
      })
    }
  }

  // Add more report type conversions as needed
  // For now, return at least one sheet
  if (sheets.length === 0) {
    sheets.push({
      name: 'Report Data',
      headers: ['Data'],
      data: [['Report data will be formatted here']],
    })
  }

  return { sheets }
}

/**
 * Convert report data to PDF format
 */
function convertReportToPDF(
  reportData: unknown,
  reportType: string,
  title: string
): {
  title: string
  subtitle?: string
  headers: string[]
  data: unknown[][]
  fileName: string
  footer?: string
} {
  // This is a simplified conversion - each report type will need specific handling
  let headers: string[] = []
  let data: unknown[][] = []
  let subtitle: string | undefined

  if (reportType === 'calibration-compliance') {
    const report = reportData as Awaited<ReturnType<typeof generateCalibrationComplianceReport>>
    subtitle = `Generated on ${new Date().toLocaleDateString()}`
    headers = ['Department', 'Total', 'Expired', 'Overdue', 'Expiring Soon', 'Compliance Rate']
    data = report.byDepartment.map((d) => [
      d.department,
      d.total,
      d.expired,
      d.overdue,
      d.expiringSoon,
      `${d.complianceRate}%`,
    ])
  } else {
    headers = ['Data']
    data = [['Report data will be formatted here']]
  }

  return {
    title,
    subtitle,
    headers,
    data,
    fileName: `${title}.pdf`,
    footer: 'BME-AMS Reporting System',
  }
}

