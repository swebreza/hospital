import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import { getQRCodeAssetData } from '@/lib/services/qrCode'
import { formatQRDataForMobile } from '@/lib/services/qrCodeClient'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') // 'full' | 'mobile'

    const data = await getQRCodeAssetData(id)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    if (format === 'mobile') {
      const mobileData = formatQRDataForMobile(data)
      return NextResponse.json({
        success: true,
        data: mobileData,
      })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: unknown) {
    console.error('Error fetching QR details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR details' },
      { status: 500 }
    )
  }
}

