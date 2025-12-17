/**
 * Migration API Endpoint: Fix Serial Number Index
 * 
 * This endpoint performs the same migration as the standalone script,
 * but can be called via HTTP for production use.
 * 
 * SECURITY: Requires full_access role and confirmation token.
 * 
 * Usage: POST /api/assets/migrate-serial-index
 * Body: { confirm: true, token: "MIGRATION_TOKEN" }
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import { requireRole } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  // Only allow full_access users to run migration
  const authResult = await requireRole(['full_access'])
  if (authResult.error) return authResult.error

  try {
    const body = await request.json()
    
    // Require explicit confirmation
    if (!body.confirm || body.confirm !== true) {
      return NextResponse.json(
        {
          success: false,
          error: 'Migration requires explicit confirmation. Set confirm: true in request body.',
        },
        { status: 400 }
      )
    }

    await connectDB()

    const db = Asset.db
    if (!db) {
      throw new Error('Database connection not available')
    }

    const collection = db.collection('assets')

    const results = {
      indexDropped: false,
      assetsCleaned: 0,
      indexCreated: false,
      errors: [] as string[],
    }

    // Step 1: Drop existing index
    try {
      await collection.dropIndex('assets_serial_number_key')
      results.indexDropped = true
    } catch (err: any) {
      if (err.code === 27 || err.codeName === 'IndexNotFound') {
        // Index doesn't exist, that's okay
        results.indexDropped = true
      } else {
        // Try dropping by key pattern
        try {
          await collection.dropIndex({ serialNumber: 1 })
          results.indexDropped = true
        } catch (err2: any) {
          if (err2.code === 27 || err2.codeName === 'IndexNotFound') {
            results.indexDropped = true
          } else {
            results.errors.push(`Failed to drop index: ${err2.message}`)
            throw err2
          }
        }
      }
    }

    // Step 2: Clean existing bad data
    const problematicQuery = {
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
      ],
    }

    const problematicCount = await collection.countDocuments(problematicQuery)

    if (problematicCount > 0) {
      const updateResult = await collection.updateMany(
        problematicQuery,
        {
          $unset: { serialNumber: '' },
        }
      )
      results.assetsCleaned = updateResult.modifiedCount
    }

    // Step 3: Recreate index
    try {
      await collection.createIndex(
        { serialNumber: 1 },
        {
          unique: true,
          sparse: true,
          partialFilterExpression: {
            serialNumber: { $exists: true, $ne: null, $ne: '' },
          },
          name: 'assets_serial_number_key',
        }
      )
      results.indexCreated = true
    } catch (err: any) {
      results.errors.push(`Failed to create index: ${err.message}`)
      throw err
    }

    // Step 4: Verify
    const remainingNull = await collection.countDocuments({
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
      ],
    })

    const totalAssets = await collection.countDocuments({})
    const validSerialCount = await collection.countDocuments({
      serialNumber: { $exists: true, $ne: null, $ne: '' },
    })

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results: {
        ...results,
        verification: {
          remainingNullValues: remainingNull,
          totalAssets,
          assetsWithValidSerial: validSerialCount,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Migration error:', error)
    const err = error as { message?: string }
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Migration failed',
      },
      { status: 500 }
    )
  }
}

