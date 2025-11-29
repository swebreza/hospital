// API route handler for individual asset operations

import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse, Asset } from '@/lib/types'

// Mock data - replace with actual database queries
const mockAssets: Asset[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = mockAssets.find((a) => a.id === params.id)

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: asset,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const assetIndex = mockAssets.findIndex((a) => a.id === params.id)

    if (assetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Update asset
    const updatedAsset: Asset = {
      ...mockAssets[assetIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    mockAssets[assetIndex] = updatedAsset

    return NextResponse.json({
      success: true,
      data: updatedAsset,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetIndex = mockAssets.findIndex((a) => a.id === params.id)

    if (assetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    mockAssets.splice(assetIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
