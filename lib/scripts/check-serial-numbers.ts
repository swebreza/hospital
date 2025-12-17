/**
 * Quick script to check serialNumber values in database
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'mongodb+srv://swebreza_db_user:FVcpTVpbigdWu4pS@cluster0.j23odu6.mongodb.net/hospital?retryWrites=true&w=majority'
}

async function checkSerialNumbers() {
  const mongoose = (await import('mongoose')).default
  const { default: connectDB } = await import('../db/mongodb')

  try {
    await connectDB()
    const db = mongoose.connection.db
    if (!db) throw new Error('No DB connection')
    
    const collection = db.collection('assets')
    
    // Find all assets and their serialNumber values
    const assets = await collection.find({}).toArray()
    
    console.log(`\n📊 Found ${assets.length} total assets:\n`)
    
    assets.forEach((asset, idx) => {
      const serialValue = asset.serialNumber
      const serialType = serialValue === null ? 'null' : 
                        serialValue === undefined ? 'undefined' :
                        serialValue === '' ? 'empty string' :
                        typeof serialValue
      
      console.log(`${idx + 1}. Asset ID: ${asset.id || asset._id}`)
      console.log(`   Name: ${asset.name}`)
      console.log(`   serialNumber: ${JSON.stringify(serialValue)} (${serialType})`)
      console.log(`   Field exists: ${asset.hasOwnProperty('serialNumber')}`)
      console.log('')
    })
    
    // Check what sparse index will index
    const willBeIndexed = assets.filter(a => 
      a.serialNumber !== null && 
      a.serialNumber !== undefined && 
      a.serialNumber !== ''
    )
    
    console.log(`\n✅ Assets that WILL be indexed (have valid serialNumber): ${willBeIndexed.length}`)
    console.log(`⚠️  Assets that WON'T be indexed (null/empty/undefined): ${assets.length - willBeIndexed.length}`)
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkSerialNumbers()

