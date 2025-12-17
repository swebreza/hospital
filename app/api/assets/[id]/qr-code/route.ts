import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import { generateQRCodeData } from '@/lib/services/qrCode'
import { requireRole } from '@/lib/auth/api-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    await connectDB()
    const { id } = await params

    const asset = await Asset.findOne({ id })

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Generate QR code data
    const qrCodeData = generateQRCodeData(id)

    // Update asset with QR code
    asset.qrCode = qrCodeData
    await asset.save()

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrCodeData,
        assetId: id,
        assetName: asset.name,
      },
    })
  } catch (error: unknown) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    await connectDB()
    const { id } = await params

    const asset = await Asset.findOne({ id }).select('id name qrCode').lean()

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // If QR code doesn't exist, generate it
    let qrCode = asset.qrCode
    if (!qrCode) {
      qrCode = generateQRCodeData(id)
      // Update asset with QR code
      await Asset.updateOne({ id }, { qrCode })
    }

    return NextResponse.json({
      success: true,
      data: {
        qrCode,
        assetId: id,
        assetName: asset.name,
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR code' },
      { status: 500 }
    )
  }
}

