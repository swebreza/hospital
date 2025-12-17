import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import type { PaginatedResponse, Asset as IAsset, FilterOptions } from '@/lib/types'
import { createAssetHistory } from '@/lib/services/assetHistory'
import { calculateAssetAge } from '@/lib/services/lifecycleAnalysis'
import { requireRole } from '@/lib/auth/api-auth'
import { generateQRCodeData } from '@/lib/services/qrCodeClient'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

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
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

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

    // Generate QR code for the asset
    const qrCode = generateQRCodeData(body.id)

    // Create asset
    // Handle serialNumber: MULTI-LAYER CLEANING to prevent any null/empty values
    const assetData: Record<string, unknown> = {
      ...body,
      qrCode,
      status: body.status || 'Active',
      lifecycleState: body.lifecycleState || 'Active',
      isMinorAsset: body.isMinorAsset || false,
      replacementRecommended: body.replacementRecommended || false,
    }
    
    // LAYER 1: Clean serialNumber with comprehensive validation
    let cleanedSerialNumber: string | undefined = undefined
    
    if (body.serialNumber !== null && body.serialNumber !== undefined) {
      const serialStr = String(body.serialNumber).trim()
      const lowerSerial = serialStr.toLowerCase()
      
      // Reject: empty, "null", "undefined", whitespace-only
      if (serialStr !== '' && 
          lowerSerial !== 'null' && 
          lowerSerial !== 'undefined' &&
          lowerSerial !== 'none' &&
          lowerSerial !== 'n/a' &&
          lowerSerial !== 'na') {
        cleanedSerialNumber = serialStr
      }
    }
    
    // LAYER 2: Only include if we have a valid value
    if (cleanedSerialNumber) {
      assetData.serialNumber = cleanedSerialNumber
    } else {
      // Explicitly remove to prevent any null/empty/undefined values
      delete assetData.serialNumber
    }
    
    const asset = new Asset(assetData)

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
    const err = error as { message?: string; code?: number; keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> }
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const duplicateField = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field'
      const duplicateValue = err.keyValue ? Object.values(err.keyValue)[0] : 'value'
      
      // Special handling for serialNumber null duplicates
      if (duplicateField === 'serialNumber' && (duplicateValue === null || duplicateValue === 'null')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Serial number cannot be empty. Please provide a unique serial number or leave it blank (it will be optional).' 
          },
          { status: 409 } // Conflict
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Asset with ${duplicateField} "${duplicateValue}" already exists. Please use a unique value.` 
        },
        { status: 409 } // Conflict
      )
    }
    
    // Validate status code is in valid range (200-599)
    let statusCode = 500
    if (err.code && err.code >= 200 && err.code <= 599) {
      statusCode = err.code
    }
    
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create asset' },
      { status: statusCode }
    )
  }
}
