import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import type { Asset as IAsset } from '@/lib/types'
import { trackAssetUpdate } from '@/lib/services/assetHistory'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const asset = await Asset.findOne({ id }).populate('createdBy', 'name email').lean()

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Transform to match IAsset interface
    const transformedAsset: IAsset = {
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
    }

    return NextResponse.json({
      success: true,
      data: transformedAsset,
    })
  } catch (error: unknown) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const asset = await Asset.findOne({ id })

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Track changes for history
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    const performedBy = body.performedBy || body.updatedBy

    Object.keys(body).forEach((key) => {
      if (key !== 'performedBy' && key !== 'updatedBy' && key !== '_id' && key !== '__v') {
        const oldValue = asset.get(key)
        const newValue = body[key]
        if (oldValue !== newValue) {
          changes[key] = { old: oldValue, new: newValue }
        }
      }
    })

    // Update asset
    Object.assign(asset, body)
    await asset.save()

    // Create history entries for changes
    if (Object.keys(changes).length > 0 && performedBy) {
      await trackAssetUpdate(id, changes, performedBy)
    }

    return NextResponse.json({
      success: true,
      data: asset.toObject(),
    })
  } catch (error: unknown) {
    console.error('Error updating asset:', error)
    const err = error as { message?: string }
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const asset = await Asset.findOneAndDelete({ id })

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    })
  } catch (error: unknown) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
