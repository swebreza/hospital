import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import AssetMove from '@/lib/models/AssetMove'
import Asset from '@/lib/models/Asset'
import { trackAssetMove } from '@/lib/services/assetHistory'
import type { AssetMove as IAssetMove } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const moves = await AssetMove.find({ assetId: asset._id })
      .populate('movedBy', 'name email')
      .sort({ moveDate: -1 })
      .lean()

    const transformedMoves: IAssetMove[] = moves.map((move) => ({
      id: move._id.toString(),
      assetId: id,
      fromLocation: move.fromLocation,
      toLocation: move.toLocation,
      fromDepartment: move.fromDepartment,
      toDepartment: move.toDepartment,
      moveDate: move.moveDate.toISOString(),
      movedBy: move.movedBy ? (move.movedBy as { _id: { toString: () => string } })._id.toString() : undefined,
      reason: move.reason,
      createdAt: move.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: transformedMoves,
    })
  } catch (error: unknown) {
    console.error('Error fetching asset moves:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset moves' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    // Create move record
    const move = new AssetMove({
      assetId: asset._id,
      fromLocation: body.fromLocation || asset.location,
      toLocation: body.toLocation,
      fromDepartment: body.fromDepartment || asset.department,
      toDepartment: body.toDepartment,
      moveDate: body.moveDate || new Date(),
      movedBy: body.movedBy,
      reason: body.reason,
    })

    await move.save()

    // Update asset location/department
    if (body.toLocation) asset.location = body.toLocation
    if (body.toDepartment) asset.department = body.toDepartment
    await asset.save()

    // Create history entry
    await trackAssetMove(id, {
      fromLocation: move.fromLocation,
      toLocation: move.toLocation,
      fromDepartment: move.fromDepartment,
      toDepartment: move.toDepartment,
      reason: move.reason,
      movedBy: body.movedBy,
    })

    return NextResponse.json({
      success: true,
      data: move.toObject(),
    })
  } catch (error: unknown) {
    console.error('Error creating asset move:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create asset move' },
      { status: 500 }
    )
  }
}

