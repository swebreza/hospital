import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import type { PaginatedResponse, Asset as IAsset } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department') || ''

    const query: Record<string, unknown> = {
      isMinorAsset: true,
    }

    if (department) {
      query.department = department
    }

    const total = await Asset.countDocuments(query)

    const assets = await Asset.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const transformedAssets: IAsset[] = assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      model: asset.model || '',
      manufacturer: asset.manufacturer || '',
      serialNumber: asset.serialNumber || '',
      department: asset.department,
      location: asset.location || '',
      status: asset.status as IAsset['status'],
      purchaseDate: asset.purchaseDate?.toISOString() || '',
      nextPmDate: asset.nextPmDate?.toISOString() || '',
      nextCalibrationDate: asset.nextCalibrationDate?.toISOString(),
      value: asset.value || 0,
      image: asset.imageUrl,
      qrCode: asset.qrCode,
      warrantyExpiry: asset.warrantyExpiry?.toISOString(),
      amcExpiry: asset.amcExpiry?.toISOString(),
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      isMinorAsset: asset.isMinorAsset,
      assetType: asset.assetType,
      modality: asset.modality,
      criticality: asset.criticality as IAsset['criticality'],
      oem: asset.oem,
      farNumber: asset.farNumber,
      lifecycleState: asset.lifecycleState as IAsset['lifecycleState'],
    }))

    const response: PaginatedResponse<IAsset> = {
      data: transformedAssets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Error fetching minor assets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch minor assets' },
      { status: 500 }
    )
  }
}

