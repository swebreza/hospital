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

    // Step 2: Drop existing index (try all possible names)
    console.log('\n🗑️  Step 2: Dropping existing serialNumber indexes...')
    const indexNamesToTry = ['assets_serial_number_key', 'serialNumber_1', 'serialNumber_-1']
    let droppedAny = false
    
    for (const indexName of indexNamesToTry) {
      try {
        await collection.dropIndex(indexName)
        console.log(`   ✅ Dropped index: ${indexName}`)
        droppedAny = true
      } catch (err: any) {
        if (err.code === 27 || err.codeName === 'IndexNotFound') {
          // Index doesn't exist with this name, try next
          continue
        } else {
          throw err
        }
      }
    }
    
    // Also try dropping by key pattern
    if (!droppedAny) {
      try {
        await collection.dropIndex({ serialNumber: 1 })
        console.log('   ✅ Dropped index by key pattern')
        droppedAny = true
      } catch (err: any) {
        if (err.code === 27 || err.codeName === 'IndexNotFound') {
          console.log('   ℹ️  No serialNumber index found to drop')
        } else {
          throw err
        }
      }
    }

    // Step 3: Clean existing bad data
    console.log('\n🧹 Step 3: Cleaning existing assets with invalid serialNumber values...')
    
    // Clean each problematic value type separately for better reporting
    const problematicQueries = [
      { serialNumber: null },
      { serialNumber: '' },
      { serialNumber: 'null' },
      { serialNumber: 'undefined' },
      { serialNumber: 'none' },
      { serialNumber: 'n/a' },
      { serialNumber: 'na' },
    ]

    let totalCleaned = 0
    let totalMatched = 0

    for (const query of problematicQueries) {
      const count = await collection.countDocuments(query)
      if (count > 0) {
        const updateResult = await collection.updateMany(
          query,
          {
            $unset: { serialNumber: '' },
          }
        )
        totalCleaned += updateResult.modifiedCount
        totalMatched += updateResult.matchedCount
        if (updateResult.modifiedCount > 0) {
          console.log(`   ✅ Cleaned ${updateResult.modifiedCount} assets with serialNumber: ${JSON.stringify(query.serialNumber)}`)
        }
      }
    }

    if (totalCleaned > 0) {
      console.log(`   ✅ Total cleaned: ${totalCleaned} assets`)
      console.log(`   📝 Total matched: ${totalMatched} assets`)
    } else {
      console.log('   ✅ No assets need cleaning')
    }

    // Step 4: Recreate index with proper configuration
    // Use sparse index - it only indexes documents where serialNumber exists and is not null
    // This is simpler and works reliably
    console.log('\n🔨 Step 4: Recreating index with proper configuration...')
    
    try {
      await collection.createIndex(
        { serialNumber: 1 },
        {
          unique: true,
          sparse: true, // Only index documents where serialNumber exists and is not null
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
    console.log(`   - ${totalCleaned} assets cleaned`)
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

