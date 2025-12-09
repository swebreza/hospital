import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import type { PaginatedResponse, Asset as IAsset, FilterOptions } from '@/lib/types'
import { createAssetHistory } from '@/lib/services/assetHistory'
import { calculateAssetAge } from '@/lib/services/lifecycleAnalysis'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const department = searchParams.get('department') || ''
    const assetType = searchParams.get('assetType') || ''
    const modality = searchParams.get('modality') || ''
    const criticality = searchParams.get('criticality') || ''
    const oem = searchParams.get('oem') || ''
    const lifecycleState = searchParams.get('lifecycleState') || ''
    const isMinorAsset = searchParams.get('isMinorAsset')
    const farNumber = searchParams.get('farNumber') || ''
    const replacementRecommended = searchParams.get('replacementRecommended')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ]
    }

    if (status) query.status = status
    if (department) query.department = department
    if (assetType) query.assetType = assetType
    if (modality) query.modality = modality
    if (criticality) query.criticality = criticality
    if (oem) query.oem = { $regex: oem, $options: 'i' }
    if (lifecycleState) query.lifecycleState = lifecycleState
    if (isMinorAsset !== null && isMinorAsset !== undefined) {
      query.isMinorAsset = isMinorAsset === 'true'
    }
    if (farNumber) query.farNumber = { $regex: farNumber, $options: 'i' }
    if (replacementRecommended !== null && replacementRecommended !== undefined) {
      query.replacementRecommended = replacementRecommended === 'true'
    }

    // Get total count
    const total = await Asset.countDocuments(query)

    // Get paginated results
    const assets = await Asset.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Transform to match IAsset interface
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
      // Enhanced fields
      assetType: asset.assetType,
      modality: asset.modality,
      criticality: asset.criticality as IAsset['criticality'],
      oem: asset.oem,
      farNumber: asset.farNumber,
      lifecycleState: asset.lifecycleState as IAsset['lifecycleState'],
      isMinorAsset: asset.isMinorAsset,
      ageYears: asset.ageYears,
      totalDowntimeHours: asset.totalDowntimeHours,
      totalServiceCost: asset.totalServiceCost,
      utilizationPercentage: asset.utilizationPercentage,
      replacementRecommended: asset.replacementRecommended,
      replacementReason: asset.replacementReason,
      specifications: asset.specifications as Record<string, unknown>,
      installationDate: asset.installationDate?.toISOString(),
      commissioningDate: asset.commissioningDate?.toISOString(),
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
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Generate ID if not provided
    if (!body.id) {
      body.id = `AST-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    }

    // Check for duplicate ID
    const existing = await Asset.findOne({ id: body.id })
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Asset with ID ${body.id} already exists` },
        { status: 400 }
      )
    }

    // Create asset
    const asset = new Asset({
      ...body,
      status: body.status || 'Active',
      lifecycleState: body.lifecycleState || 'Active',
      isMinorAsset: body.isMinorAsset || false,
      replacementRecommended: body.replacementRecommended || false,
    })

    await asset.save()

    // Create history entry for asset creation
    if (body.createdBy) {
      await createAssetHistory(asset.id, 'StatusChange', {
        description: 'Asset created',
        performedBy: body.createdBy,
        metadata: { action: 'create', assetData: body },
      })
    }

    return NextResponse.json({
      success: true,
      data: asset.toObject(),
    })
  } catch (error: unknown) {
    console.error('Error creating asset:', error)
    const err = error as { message?: string; code?: number }
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create asset' },
      { status: err.code || 500 }
    )
  }
}
