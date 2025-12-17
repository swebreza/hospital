/**
 * One-time cleanup endpoint for serial numbers
 * 
 * This endpoint fixes existing assets in the database that have:
 * - serialNumber: null
 * - serialNumber: "null" (string)
 * - serialNumber: "" (empty string)
 * 
 * SECURITY: This should be protected and only run once in production.
 * Consider adding additional authentication or removing after use.
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import { requireRole } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  // Only allow full_access users to run cleanup
  const authResult = await requireRole(['full_access'])
  if (authResult.error) return authResult.error

  try {
    await connectDB()

    // Find all assets with problematic serialNumber values
    const problematicAssets = await Asset.find({
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
      ],
    })

    if (problematicAssets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No assets need cleanup. Database is clean!',
        cleaned: 0,
      })
    }

    // Remove serialNumber field from these assets
    const result = await Asset.updateMany(
      {
        $or: [
          { serialNumber: null },
          { serialNumber: 'null' },
          { serialNumber: '' },
        ],
      },
      {
        $unset: { serialNumber: '' },
      }
    )

    // Verify cleanup
    const remaining = await Asset.countDocuments({
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
      ],
    })

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      cleaned: result.modifiedCount,
      matched: result.matchedCount,
      remaining,
    })
  } catch (error: unknown) {
    console.error('Error during cleanup:', error)
    const err = error as { message?: string }
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to cleanup serial numbers',
      },
      { status: 500 }
    )
  }
}

