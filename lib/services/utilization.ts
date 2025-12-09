import connectDB from '@/lib/db/mongodb'
import EquipmentUtilization, {
  IEquipmentUtilization,
} from '@/lib/models/EquipmentUtilization'
import UtilizationUpload from '@/lib/models/UtilizationUpload'
import Asset from '@/lib/models/Asset'
import { parseUtilizationCSV, type UtilizationCSVRow } from '@/lib/utils/csvParser'
import mongoose from 'mongoose'

export interface UtilizationRecord {
  assetId: string
  date: string
  usageHours?: number
  usageCount?: number
  recordedBy?: string
  source: 'manual' | 'CSV'
  notes?: string
}

export interface UtilizationStats {
  assetId: string
  assetName: string
  totalUsageHours: number
  totalUsageCount: number
  averageUsageHours: number
  averageUsageCount: number
  utilizationPercentage: number
  recordCount: number
  dateRange: {
    from: string
    to: string
  }
}

export interface UnderOverUtilizedAsset {
  assetId: string
  assetName: string
  department: string
  utilizationPercentage: number
  status: 'under-utilized' | 'over-utilized' | 'normal'
  threshold: number
}

/**
 * Find asset by ID, name, or serial number
 */
async function findAsset(
  assetId?: string,
  assetName?: string,
  serialNumber?: string
): Promise<mongoose.Types.ObjectId | null> {
  await connectDB()

  let asset = null

  if (assetId) {
    asset = await Asset.findOne({ id: assetId })
  } else if (assetName) {
    asset = await Asset.findOne({ name: { $regex: assetName, $options: 'i' } })
  } else if (serialNumber) {
    asset = await Asset.findOne({ serialNumber })
  }

  return asset ? asset._id : null
}

/**
 * Record manual utilization entry
 */
export async function recordUtilization(
  data: UtilizationRecord
): Promise<IEquipmentUtilization> {
  await connectDB()

  // Find asset
  const assetObjectId = await findAsset(data.assetId)
  if (!assetObjectId) {
    throw new Error('Asset not found')
  }

  // Check for duplicate entry
  const existing = await EquipmentUtilization.findOne({
    assetId: assetObjectId,
    date: new Date(data.date),
  })

  if (existing) {
    // Update existing record
    existing.usageHours = data.usageHours
    existing.usageCount = data.usageCount
    existing.notes = data.notes
    if (data.recordedBy) {
      existing.recordedBy = new mongoose.Types.ObjectId(data.recordedBy)
    }
    await existing.save()
    return existing
  }

  // Create new record
  const utilization = new EquipmentUtilization({
    assetId: assetObjectId,
    date: new Date(data.date),
    usageHours: data.usageHours,
    usageCount: data.usageCount,
    recordedBy: data.recordedBy
      ? new mongoose.Types.ObjectId(data.recordedBy)
      : undefined,
    source: data.source || 'manual',
    notes: data.notes,
  })

  await utilization.save()

  // Update asset utilization percentage
  await updateAssetUtilization(assetObjectId.toString())

  return utilization
}

/**
 * Upload CSV utilization data
 */
export async function uploadCSVUtilization(
  file: File,
  uploadedBy: string
): Promise<{
  success: boolean
  uploadId: string
  successCount: number
  errorCount: number
  errors: Array<{ row: number; message: string; data?: Record<string, unknown> }>
}> {
  await connectDB()

  // Parse CSV
  const parsed = await parseUtilizationCSV(file)

  // Create upload record
  const upload = new UtilizationUpload({
    uploadedBy: new mongoose.Types.ObjectId(uploadedBy),
    uploadDate: new Date(),
    fileName: file.name,
    recordCount: parsed.valid.length,
    successCount: 0,
    errorCount: parsed.errors.length,
    status: 'processing',
    errors: parsed.errors,
  })

  await upload.save()

  const errors: Array<{ row: number; message: string; data?: Record<string, unknown> }> =
    [...parsed.errors]

  let successCount = 0

  // Process each valid row
  for (const row of parsed.valid) {
    try {
      // Find asset
      const assetObjectId = await findAsset(
        row.assetId,
        row.assetName,
        row.serialNumber
      )

      if (!assetObjectId) {
        errors.push({
          row: 0, // We don't have row number in parsed data
          message: `Asset not found: ${row.assetId || row.assetName || row.serialNumber}`,
          data: row,
        })
        continue
      }

      // Check for duplicate
      const existing = await EquipmentUtilization.findOne({
        assetId: assetObjectId,
        date: new Date(row.date),
      })

      if (existing) {
        // Update existing
        existing.usageHours = row.usageHours
        existing.usageCount = row.usageCount
        existing.notes = row.notes
        existing.source = 'CSV'
        await existing.save()
      } else {
        // Create new
        const utilization = new EquipmentUtilization({
          assetId: assetObjectId,
          date: new Date(row.date),
          usageHours: row.usageHours,
          usageCount: row.usageCount,
          source: 'CSV',
          notes: row.notes,
        })
        await utilization.save()
      }

      // Update asset utilization
      await updateAssetUtilization(assetObjectId.toString())

      successCount++
    } catch (error) {
      errors.push({
        row: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: row,
      })
    }
  }

  // Update upload record
  upload.successCount = successCount
  upload.errorCount = errors.length
  upload.status = errors.length === 0 ? 'completed' : 'completed'
  upload.errors = errors
  await upload.save()

  return {
    success: errors.length === 0,
    uploadId: upload._id.toString(),
    successCount,
    errorCount: errors.length,
    errors,
  }
}

/**
 * Calculate utilization statistics for an asset
 */
export async function calculateUtilizationStats(
  assetId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<UtilizationStats | null> {
  await connectDB()

  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return null
  }

  const query: Record<string, unknown> = {
    assetId: asset._id,
  }

  if (dateFrom || dateTo) {
    query.date = {}
    if (dateFrom) {
      query.date.$gte = new Date(dateFrom)
    }
    if (dateTo) {
      query.date.$lte = new Date(dateTo)
    }
  }

  const records = await EquipmentUtilization.find(query).sort({ date: 1 })

  if (records.length === 0) {
    return {
      assetId: asset.id,
      assetName: asset.name,
      totalUsageHours: 0,
      totalUsageCount: 0,
      averageUsageHours: 0,
      averageUsageCount: 0,
      utilizationPercentage: 0,
      recordCount: 0,
      dateRange: {
        from: dateFrom || new Date().toISOString(),
        to: dateTo || new Date().toISOString(),
      },
    }
  }

  const totalUsageHours = records.reduce(
    (sum, r) => sum + (r.usageHours || 0),
    0
  )
  const totalUsageCount = records.reduce(
    (sum, r) => sum + (r.usageCount || 0),
    0
  )

  const dateRange = {
    from: records[0].date.toISOString().split('T')[0],
    to: records[records.length - 1].date.toISOString().split('T')[0],
  }

  // Calculate utilization percentage
  // Assuming 24 hours per day as maximum possible usage
  const days = records.length
  const maxPossibleHours = days * 24
  const utilizationPercentage =
    maxPossibleHours > 0 ? (totalUsageHours / maxPossibleHours) * 100 : 0

  return {
    assetId: asset.id,
    assetName: asset.name,
    totalUsageHours,
    totalUsageCount,
    averageUsageHours: totalUsageHours / records.length,
    averageUsageCount: totalUsageCount / records.length,
    utilizationPercentage: Math.min(100, Math.round(utilizationPercentage * 100) / 100),
    recordCount: records.length,
    dateRange,
  }
}

/**
 * Get utilization trends over time
 */
export async function getUtilizationTrends(
  assetId: string,
  dateFrom: string,
  dateTo: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<Array<{ period: string; usageHours: number; usageCount: number }>> {
  await connectDB()

  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return []
  }

  const records = await EquipmentUtilization.find({
    assetId: asset._id,
    date: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  }).sort({ date: 1 })

  // Group by period
  const grouped = new Map<string, { usageHours: number; usageCount: number }>()

  records.forEach((record) => {
    const date = new Date(record.date)
    let period = ''

    if (groupBy === 'day') {
      period = date.toISOString().split('T')[0]
    } else if (groupBy === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      period = weekStart.toISOString().split('T')[0]
    } else if (groupBy === 'month') {
      period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!grouped.has(period)) {
      grouped.set(period, { usageHours: 0, usageCount: 0 })
    }

    const current = grouped.get(period)!
    current.usageHours += record.usageHours || 0
    current.usageCount += record.usageCount || 0
  })

  return Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    ...data,
  }))
}

/**
 * Update asset's utilization percentage
 */
export async function updateAssetUtilization(
  assetIdOrObjectId: string
): Promise<void> {
  await connectDB()

  let asset
  if (mongoose.Types.ObjectId.isValid(assetIdOrObjectId)) {
    asset = await Asset.findById(assetIdOrObjectId)
  } else {
    asset = await Asset.findOne({ id: assetIdOrObjectId })
  }

  if (!asset) {
    return
  }

  // Get last 30 days of utilization
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const records = await EquipmentUtilization.find({
    assetId: asset._id,
    date: { $gte: thirtyDaysAgo },
  })

  if (records.length === 0) {
    asset.utilizationPercentage = 0
    await asset.save()
    return
  }

  const totalUsageHours = records.reduce(
    (sum, r) => sum + (r.usageHours || 0),
    0
  )
  const maxPossibleHours = records.length * 24
  const utilizationPercentage =
    maxPossibleHours > 0 ? (totalUsageHours / maxPossibleHours) * 100 : 0

  asset.utilizationPercentage = Math.min(100, Math.round(utilizationPercentage * 100) / 100)
  await asset.save()
}

/**
 * Identify under-utilized and over-utilized assets
 */
export async function identifyUtilizationIssues(
  thresholdLow: number = 20,
  thresholdHigh: number = 80
): Promise<{
  underUtilized: UnderOverUtilizedAsset[]
  overUtilized: UnderOverUtilizedAsset[]
}> {
  await connectDB()

  const assets = await Asset.find({
    utilizationPercentage: { $exists: true },
  }).lean()

  const underUtilized: UnderOverUtilizedAsset[] = []
  const overUtilized: UnderOverUtilizedAsset[] = []

  assets.forEach((asset) => {
    const utilization = asset.utilizationPercentage || 0

    if (utilization < thresholdLow) {
      underUtilized.push({
        assetId: asset.id,
        assetName: asset.name,
        department: asset.department,
        utilizationPercentage: utilization,
        status: 'under-utilized',
        threshold: thresholdLow,
      })
    } else if (utilization > thresholdHigh) {
      overUtilized.push({
        assetId: asset.id,
        assetName: asset.name,
        department: asset.department,
        utilizationPercentage: utilization,
        status: 'over-utilized',
        threshold: thresholdHigh,
      })
    }
  })

  return { underUtilized, overUtilized }
}

