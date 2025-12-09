import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import { trackAssetUpdate } from '@/lib/services/assetHistory'
import type { LifecycleState } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const asset = await Asset.findOne({ id }).lean()

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        lifecycleState: asset.lifecycleState,
        ageYears: asset.ageYears,
        totalDowntimeHours: asset.totalDowntimeHours,
        totalServiceCost: asset.totalServiceCost,
        utilizationPercentage: asset.utilizationPercentage,
        replacementRecommended: asset.replacementRecommended,
        replacementReason: asset.replacementReason,
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching lifecycle data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lifecycle data' },
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

    const changes: Record<string, { old: unknown; new: unknown }> = {}
    const performedBy = body.performedBy

    // Track lifecycle state change
    if (body.lifecycleState && body.lifecycleState !== asset.lifecycleState) {
      changes.lifecycleState = {
        old: asset.lifecycleState,
        new: body.lifecycleState,
      }
    }

    // Update lifecycle fields
    if (body.lifecycleState) asset.lifecycleState = body.lifecycleState as LifecycleState
    if (body.totalDowntimeHours !== undefined) asset.totalDowntimeHours = body.totalDowntimeHours
    if (body.totalServiceCost !== undefined) asset.totalServiceCost = body.totalServiceCost
    if (body.utilizationPercentage !== undefined) asset.utilizationPercentage = body.utilizationPercentage
    if (body.replacementRecommended !== undefined) asset.replacementRecommended = body.replacementRecommended
    if (body.replacementReason !== undefined) asset.replacementReason = body.replacementReason

    await asset.save()

    // Create history entry
    if (Object.keys(changes).length > 0 && performedBy) {
      await trackAssetUpdate(id, changes, performedBy)
    }

    return NextResponse.json({
      success: true,
      data: asset.toObject(),
    })
  } catch (error: unknown) {
    console.error('Error updating lifecycle:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lifecycle' },
      { status: 500 }
    )
  }
}

