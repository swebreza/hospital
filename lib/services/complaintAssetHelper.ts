/**
 * Helper function to fetch asset data from Mongoose and merge with complaint data
 * Since assets are stored via Mongoose but complaints via Prisma, we need to fetch assets separately
 */

export async function enrichComplaintWithAsset(complaint: any): Promise<any> {
  if (!complaint.assetId) {
    return { ...complaint, asset: null }
  }

  try {
    const { default: connectDB } = await import('@/lib/db/mongodb')
    const { default: Asset } = await import('@/lib/models/Asset')
    await connectDB()
    const asset = await Asset.findOne({ id: complaint.assetId }).lean()
    
    if (asset) {
      return {
        ...complaint,
        asset: {
          id: asset.id,
          name: asset.name,
          model: asset.model,
          manufacturer: asset.manufacturer,
          department: asset.department,
          location: asset.location,
          status: asset.status,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching asset for complaint:', error)
  }

  return { ...complaint, asset: null }
}

export async function enrichComplaintsWithAssets(complaints: any[]): Promise<any[]> {
  if (!complaints || complaints.length === 0) {
    return complaints
  }

  try {
    const { default: connectDB } = await import('@/lib/db/mongodb')
    const { default: Asset } = await import('@/lib/models/Asset')
    await connectDB()

    // Get all unique asset IDs
    const assetIds = [...new Set(complaints.map(c => c.assetId).filter(Boolean))]
    
    if (assetIds.length === 0) {
      return complaints.map(c => ({ ...c, asset: null }))
    }

    // Fetch all assets in one query
    const assets = await Asset.find({ id: { $in: assetIds } })
      .select('id name model manufacturer department location status')
      .lean()

    // Create a map for quick lookup
    const assetMap = new Map(assets.map(a => [a.id, a]))

    // Merge assets with complaints
    return complaints.map(complaint => {
      if (!complaint.assetId) {
        return { ...complaint, asset: null }
      }

      const asset = assetMap.get(complaint.assetId)
      if (asset) {
        return {
          ...complaint,
          asset: {
            id: asset.id,
            name: asset.name,
            model: asset.model,
            manufacturer: asset.manufacturer,
            department: asset.department,
            location: asset.location,
            status: asset.status,
          },
        }
      }

      return { ...complaint, asset: null }
    })
  } catch (error) {
    console.error('Error enriching complaints with assets:', error)
    return complaints.map(c => ({ ...c, asset: null }))
  }
}

