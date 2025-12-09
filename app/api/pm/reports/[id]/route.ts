// PM Report Generation API route

import { NextRequest, NextResponse } from 'next/server'
import { reportService } from '@/lib/services/reportService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const format = (searchParams.get('format') || 'pdf') as 'pdf' | 'excel'

    const buffer = await reportService.generatePMReport(id, format)

    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const extension = format === 'pdf' ? 'pdf' : 'xlsx'

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="pm-report-${id}.${extension}"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating PM report:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}

