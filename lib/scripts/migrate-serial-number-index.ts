/**
 * Database Migration Script: Fix Serial Number Index
 * 
 * This script:
 * 1. Drops the existing serialNumber index
 * 2. Cleans all existing assets with null/empty serialNumber values
 * 3. Recreates the index with proper configuration
 * 
 * Run this ONCE in production to fix the duplicate key error.
 * 
 * Usage: npm run db:migrate:serial-index
 * Or: tsx lib/scripts/migrate-serial-number-index.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables FIRST
config({ path: resolve(process.cwd(), '.env.local') })

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'mongodb+srv://swebreza_db_user:FVcpTVpbigdWu4pS@cluster0.j23odu6.mongodb.net/hospital?retryWrites=true&w=majority'
}

async function migrateSerialNumberIndex() {
  const mongoose = (await import('mongoose')).default
  const { default: connectDB } = await import('../db/mongodb')

  try {
    console.log('🔧 Starting serial number index migration...')
    
    await connectDB()
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }

    const collection = db.collection('assets')

    // Step 1: Check current index status
    console.log('\n📊 Step 1: Checking current indexes...')
    const indexes = await collection.indexes()
    const serialIndex = indexes.find(idx => 
      idx.name === 'assets_serial_number_key' || 
      (idx.key && 'serialNumber' in idx.key)
    )
    
    if (serialIndex) {
      console.log(`   Found index: ${serialIndex.name}`)
      console.log(`   Index definition:`, JSON.stringify(serialIndex, null, 2))
    } else {
      console.log('   No serialNumber index found')
    }

    // Step 2: Drop existing index
    console.log('\n🗑️  Step 2: Dropping existing serialNumber index...')
    try {
      await collection.dropIndex('assets_serial_number_key')
      console.log('   ✅ Dropped index: assets_serial_number_key')
    } catch (err: any) {
      if (err.code === 27 || err.codeName === 'IndexNotFound') {
        console.log('   ℹ️  Index does not exist (already dropped or never created)')
      } else {
        // Try dropping by key pattern
        try {
          await collection.dropIndex({ serialNumber: 1 })
          console.log('   ✅ Dropped index by key pattern')
        } catch (err2: any) {
          if (err2.code === 27 || err2.codeName === 'IndexNotFound') {
            console.log('   ℹ️  Index does not exist')
          } else {
            throw err2
          }
        }
      }
    }

    // Step 3: Clean existing bad data
    console.log('\n🧹 Step 3: Cleaning existing assets with invalid serialNumber values...')
    
    // Find all assets with problematic serialNumber values
    const problematicQuery = {
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
        { serialNumber: { $exists: false } },
      ],
    }

    const problematicCount = await collection.countDocuments(problematicQuery)
    console.log(`   Found ${problematicCount} assets with problematic serialNumber values`)

    if (problematicCount > 0) {
      // Remove serialNumber field from these assets
      const updateResult = await collection.updateMany(
        problematicQuery,
        {
          $unset: { serialNumber: '' },
        }
      )

      console.log(`   ✅ Cleaned ${updateResult.modifiedCount} assets`)
      console.log(`   📝 Matched ${updateResult.matchedCount} assets`)
    } else {
      console.log('   ✅ No assets need cleaning')
    }

    // Step 4: Recreate index with proper configuration
    console.log('\n🔨 Step 4: Recreating index with proper configuration...')
    
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
      console.log('   ✅ Index created successfully')
    } catch (err: any) {
      console.error('   ❌ Error creating index:', err.message)
      throw err
    }

    // Step 5: Verify index and data
    console.log('\n✅ Step 5: Verifying migration...')
    
    // Check index exists
    const newIndexes = await collection.indexes()
    const newSerialIndex = newIndexes.find(idx => 
      idx.name === 'assets_serial_number_key'
    )
    
    if (newSerialIndex) {
      console.log('   ✅ Index exists:', newSerialIndex.name)
      console.log('   Index definition:', JSON.stringify(newSerialIndex, null, 2))
    } else {
      throw new Error('Index was not created')
    }

    // Verify no null values remain
    const remainingNull = await collection.countDocuments({
      $or: [
        { serialNumber: null },
        { serialNumber: 'null' },
        { serialNumber: '' },
      ],
    })

    if (remainingNull === 0) {
      console.log('   ✅ No null/empty serialNumber values remain')
    } else {
      console.log(`   ⚠️  Warning: ${remainingNull} assets still have null/empty serialNumber`)
    }

    // Count total assets
    const totalAssets = await collection.countDocuments({})
    console.log(`   📊 Total assets in collection: ${totalAssets}`)

    // Count assets with valid serialNumber
    const validSerialCount = await collection.countDocuments({
      serialNumber: { $exists: true, $ne: null, $ne: '' },
    })
    console.log(`   📊 Assets with valid serialNumber: ${validSerialCount}`)

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   - Index dropped and recreated`)
    console.log(`   - ${problematicCount} assets cleaned`)
    console.log(`   - Index now only contains valid serialNumber values`)
    console.log(`   - You can now create assets without serialNumber without errors`)

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateSerialNumberIndex()

