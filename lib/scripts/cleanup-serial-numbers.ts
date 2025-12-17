/**
 * Database Cleanup Script for Serial Numbers
 * 
 * This script fixes existing assets in the database that have:
 * - serialNumber: null
 * - serialNumber: "null" (string)
 * - serialNumber: "" (empty string)
 * 
 * It removes these invalid values, making serialNumber truly optional.
 * 
 * Run this once in production to clean up existing bad data.
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'mongodb+srv://swebreza_db_user:FVcpTVpbigdWu4pS@cluster0.j23odu6.mongodb.net/hospital?retryWrites=true&w=majority'
}

async function cleanupSerialNumbers() {
  const mongoose = (await import('mongoose')).default
  const { default: connectDB } = await import('../db/mongodb')
  const { default: Asset } = await import('../models/Asset')

  try {
    console.log('🔧 Starting serial number cleanup...')
    
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Find all assets with problematic serialNumber values
    const problematicAssets = await Asset.find({
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
        { serialNumber: { $exists: false } },
      ],
    })

    console.log(`📊 Found ${problematicAssets.length} assets with problematic serial numbers`)

    if (problematicAssets.length === 0) {
      console.log('✅ No assets need cleanup. Database is clean!')
      await mongoose.connection.close()
      return
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

    console.log(`✅ Cleaned up ${result.modifiedCount} assets`)
    console.log(`📝 Matched ${result.matchedCount} assets`)
    
    // Verify cleanup
    const remaining = await Asset.countDocuments({
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
      ],
    })

    if (remaining === 0) {
      console.log('✅ Cleanup successful! All problematic serial numbers have been removed.')
    } else {
      console.log(`⚠️  Warning: ${remaining} assets still have problematic serial numbers`)
    }

    await mongoose.connection.close()
    console.log('✅ Cleanup complete!')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Run cleanup
cleanupSerialNumbers()

