import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import mongoose from 'mongoose'

// Note: These models may need to be created if they don't exist
// For now, we'll work with the data structure as defined in types

export interface DowntimeEvent {
  assetId: string
  assetName: string
  complaintId?: string
  startTime: Date
  endTime?: Date
  durationMinutes: number
  durationHours: number
  rootCause?: string
  vendorId?: string
  vendorName?: string
  department: string
  priority: string
  status: string
}

export interface CriticalDowntimeAnalysis {
  assetId: string
  assetName: string
  department: string
  criticality: string
  totalDowntimeHours: number
  totalDowntimeEvents: number
  averageDowntimeHours: number
  recurringFaults: Array<{
    rootCause: string
    count: number
    totalDowntimeHours: number
  }>
  vendors: Array<{
    vendorId?: string
    vendorName?: string
    totalDowntimeHours: number
    eventCount: number
  }>
  longRepairs: Array<{
    complaintId?: string
    startTime: Date
    durationHours: number
    rootCause?: string
  }>
}

export interface DowntimeByVendor {
  vendorId?: string
  vendorName?: string
  totalDowntimeHours: number
  eventCount: number
  averageDowntimeHours: number
  assets: Array<{
    assetId: string
    assetName: string
    downtimeHours: number
  }>
}

export interface DowntimeByDepartment {
  department: string
  totalDowntimeHours: number
  eventCount: number
  averageDowntimeHours: number
  criticalAssets: number
  assets: Array<{
    assetId: string
    assetName: string
    downtimeHours: number
  }>
}

/**
 * Calculate downtime from complaints
 * This assumes complaints have downtime field in minutes
 * For complaints without resolvedAt, calculate from reportedAt to now if still open
 */
export async function calculateDowntime(
  assetId?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<DowntimeEvent[]> {
  await connectDB()

  // This is a placeholder - we need to query complaints
  // Since we don't have a Complaint model yet, we'll create a structure
  // that can work once the model is created
  
  // For now, we'll use aggregation to get downtime from assets
  // The actual implementation will need to query the complaints collection
  
  const query: Record<string, unknown> = {}
  if (assetId) {
    const asset = await Asset.findOne({ id: assetId })
    if (asset) {
      query.assetId = asset._id
    }
  }

  // TODO: Once Complaint model exists, query it like this:
  /*
  const complaints = await Complaint.find({
    ...query,
    ...(dateFrom || dateTo ? {
      reportedAt: {
        ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { $lte: new Date(dateTo) } : {}),
      }
    } : {}),
  }).populate('assetId', 'name department criticality').lean()

  const events: DowntimeEvent[] = []

  complaints.forEach((complaint) => {
    const startTime = new Date(complaint.reportedAt)
    const endTime = complaint.resolvedAt ? new Date(complaint.resolvedAt) : new Date()
    const durationMinutes = complaint.downtime || 
      Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    const durationHours = durationMinutes / 60

    events.push({
      assetId: complaint.assetId.id,
      assetName: complaint.assetId.name,
      complaintId: complaint.id,
      startTime,
      endTime: complaint.resolvedAt ? endTime : undefined,
      durationMinutes,
      durationHours,
      rootCause: complaint.rootCause,
      department: complaint.assetId.department,
      priority: complaint.priority,
      status: complaint.status,
    })
  })

  return events
  */

  // Placeholder return - will be implemented when Complaint model exists
  return []
}

/**
 * Analyze downtime for critical equipment
 */
export async function analyzeCriticalEquipmentDowntime(
  dateFrom?: string,
  dateTo?: string
): Promise<CriticalDowntimeAnalysis[]> {
  await connectDB()

  // Get critical assets
  const criticalAssets = await Asset.find({
    criticality: 'Critical',
    status: { $in: ['Active', 'In-Service', 'Maintenance', 'Breakdown'] },
  }).lean()

  const analyses: CriticalDowntimeAnalysis[] = []

  for (const asset of criticalAssets) {
    // Get downtime events for this asset
    const events = await calculateDowntime(asset.id, dateFrom, dateTo)

    if (events.length === 0) {
      continue
    }

    const totalDowntimeHours = events.reduce(
      (sum, e) => sum + e.durationHours,
      0
    )
    const totalDowntimeEvents = events.length
    const averageDowntimeHours = totalDowntimeHours / totalDowntimeEvents

    // Identify recurring faults
    const rootCauseMap = new Map<string, { count: number; totalHours: number }>()
    events.forEach((event) => {
      const cause = event.rootCause || 'Unknown'
      if (!rootCauseMap.has(cause)) {
        rootCauseMap.set(cause, { count: 0, totalHours: 0 })
      }
      const current = rootCauseMap.get(cause)!
      current.count++
      current.totalHours += event.durationHours
    })

    const recurringFaults = Array.from(rootCauseMap.entries())
      .map(([rootCause, data]) => ({
        rootCause,
        count: data.count,
        totalDowntimeHours: data.totalHours,
      }))
      .sort((a, b) => b.count - a.count)

    // Group by vendor
    const vendorMap = new Map<
      string,
      { vendorId?: string; vendorName?: string; hours: number; count: number }
    >()
    events.forEach((event) => {
      const key = event.vendorId || 'Unknown'
      if (!vendorMap.has(key)) {
        vendorMap.set(key, {
          vendorId: event.vendorId,
          vendorName: event.vendorName,
          hours: 0,
          count: 0,
        })
      }
      const current = vendorMap.get(key)!
      current.hours += event.durationHours
      current.count++
    })

    const vendors = Array.from(vendorMap.values()).map((v) => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName,
      totalDowntimeHours: v.hours,
      eventCount: v.count,
    }))

    // Identify long repairs (more than 24 hours)
    const longRepairs = events
      .filter((e) => e.durationHours > 24)
      .map((e) => ({
        complaintId: e.complaintId,
        startTime: e.startTime,
        durationHours: e.durationHours,
        rootCause: e.rootCause,
      }))
      .sort((a, b) => b.durationHours - a.durationHours)

    analyses.push({
      assetId: asset.id,
      assetName: asset.name,
      department: asset.department,
      criticality: asset.criticality || 'Unknown',
      totalDowntimeHours,
      totalDowntimeEvents,
      averageDowntimeHours,
      recurringFaults,
      vendors,
      longRepairs,
    })
  }

  return analyses.sort((a, b) => b.totalDowntimeHours - a.totalDowntimeHours)
}

/**
 * Identify recurring faults across all assets
 */
export async function identifyRecurringFaults(
  dateFrom?: string,
  dateTo?: string
): Promise<
  Array<{
    rootCause: string
    totalOccurrences: number
    affectedAssets: number
    totalDowntimeHours: number
    assets: Array<{ assetId: string; assetName: string; count: number }>
  }>
> {
  const events = await calculateDowntime(undefined, dateFrom, dateTo)

  const rootCauseMap = new Map<
    string,
    {
      occurrences: number
      assets: Set<string>
      assetCounts: Map<string, { name: string; count: number }>
      totalHours: number
    }
  >()

  events.forEach((event) => {
    const cause = event.rootCause || 'Unknown'
    if (!rootCauseMap.has(cause)) {
      rootCauseMap.set(cause, {
        occurrences: 0,
        assets: new Set(),
        assetCounts: new Map(),
        totalHours: 0,
      })
    }

    const current = rootCauseMap.get(cause)!
    current.occurrences++
    current.assets.add(event.assetId)
    current.totalHours += event.durationHours

    if (!current.assetCounts.has(event.assetId)) {
      current.assetCounts.set(event.assetId, {
        name: event.assetName,
        count: 0,
      })
    }
    current.assetCounts.get(event.assetId)!.count++
  })

  return Array.from(rootCauseMap.entries())
    .map(([rootCause, data]) => ({
      rootCause,
      totalOccurrences: data.occurrences,
      affectedAssets: data.assets.size,
      totalDowntimeHours: data.totalHours,
      assets: Array.from(data.assetCounts.values()),
    }))
    .sort((a, b) => b.totalOccurrences - a.totalOccurrences)
}

/**
 * Get downtime aggregated by vendor
 */
export async function getDowntimeByVendor(
  dateFrom?: string,
  dateTo?: string
): Promise<DowntimeByVendor[]> {
  const events = await calculateDowntime(undefined, dateFrom, dateTo)

  const vendorMap = new Map<
    string,
    {
      vendorId?: string
      vendorName?: string
      hours: number
      count: number
      assets: Map<string, { name: string; hours: number }>
    }
  >()

  events.forEach((event) => {
    const key = event.vendorId || 'Unknown'
    if (!vendorMap.has(key)) {
      vendorMap.set(key, {
        vendorId: event.vendorId,
        vendorName: event.vendorName,
        hours: 0,
        count: 0,
        assets: new Map(),
      })
    }

    const current = vendorMap.get(key)!
    current.hours += event.durationHours
    current.count++

    if (!current.assets.has(event.assetId)) {
      current.assets.set(event.assetId, {
        name: event.assetName,
        hours: 0,
      })
    }
    current.assets.get(event.assetId)!.hours += event.durationHours
  })

  return Array.from(vendorMap.values())
    .map((v) => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName,
      totalDowntimeHours: v.hours,
      eventCount: v.count,
      averageDowntimeHours: v.hours / v.count,
      assets: Array.from(v.assets.entries()).map(([assetId, data]) => ({
        assetId,
        assetName: data.name,
        downtimeHours: data.hours,
      })),
    }))
    .sort((a, b) => b.totalDowntimeHours - a.totalDowntimeHours)
}

/**
 * Get downtime aggregated by department
 */
export async function getDowntimeByDepartment(
  dateFrom?: string,
  dateTo?: string
): Promise<DowntimeByDepartment[]> {
  const events = await calculateDowntime(undefined, dateFrom, dateTo)

  const deptMap = new Map<
    string,
    {
      hours: number
      count: number
      assets: Map<string, { name: string; hours: number; critical: boolean }>
    }
  >()

  events.forEach((event) => {
    if (!deptMap.has(event.department)) {
      deptMap.set(event.department, {
        hours: 0,
        count: 0,
        assets: new Map(),
      })
    }

    const current = deptMap.get(event.department)!
    current.hours += event.durationHours
    current.count++

    if (!current.assets.has(event.assetId)) {
      current.assets.set(event.assetId, {
        name: event.assetName,
        hours: 0,
        critical: false, // Will be updated when we have asset data
      })
    }
    current.assets.get(event.assetId)!.hours += event.durationHours
  })

  // Get asset criticality info
  await connectDB()
  const assets = await Asset.find({}).select('id name department criticality').lean()
  const assetMap = new Map(assets.map((a) => [a.id, a]))

  return Array.from(deptMap.entries())
    .map(([department, data]) => {
      const assetList = Array.from(data.assets.entries()).map(([assetId, assetData]) => {
        const asset = assetMap.get(assetId)
        return {
          assetId,
          assetName: assetData.name,
          downtimeHours: assetData.hours,
        }
      })

      const criticalAssets = assetList.filter((a) => {
        const asset = assetMap.get(a.assetId)
        return asset?.criticality === 'Critical'
      }).length

      return {
        department,
        totalDowntimeHours: data.hours,
        eventCount: data.count,
        averageDowntimeHours: data.hours / data.count,
        criticalAssets,
        assets: assetList.sort((a, b) => b.downtimeHours - a.downtimeHours),
      }
    })
    .sort((a, b) => b.totalDowntimeHours - a.totalDowntimeHours)
}

/**
 * Get repairs exceeding threshold duration
 */
export async function getLongRepairDurations(
  thresholdHours: number = 24,
  dateFrom?: string,
  dateTo?: string
): Promise<
  Array<{
    assetId: string
    assetName: string
    complaintId?: string
    startTime: Date
    durationHours: number
    rootCause?: string
    department: string
  }>
> {
  const events = await calculateDowntime(undefined, dateFrom, dateTo)

  return events
    .filter((e) => e.durationHours > thresholdHours)
    .map((e) => ({
      assetId: e.assetId,
      assetName: e.assetName,
      complaintId: e.complaintId,
      startTime: e.startTime,
      durationHours: e.durationHours,
      rootCause: e.rootCause,
      department: e.department,
    }))
    .sort((a, b) => b.durationHours - a.durationHours)
}

/**
 * Update asset's total downtime hours
 */
export async function updateAssetDowntime(assetId: string): Promise<void> {
  await connectDB()

  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return
  }

  const events = await calculateDowntime(assetId)
  const totalDowntimeHours = events.reduce(
    (sum, e) => sum + e.durationHours,
    0
  )

  asset.totalDowntimeHours = Math.round(totalDowntimeHours * 100) / 100
  await asset.save()
}

