import AssetHistory from '@/lib/models/AssetHistory'
import type { AssetHistoryEventType, AssetHistory as IAssetHistory } from '@/lib/types'

/**
 * Create a history entry for an asset event
 */
export async function createAssetHistory(
  assetId: string,
  eventType: AssetHistoryEventType,
  data: {
    description?: string
    performedBy?: string
    oldValue?: string
    newValue?: string
    metadata?: Record<string, unknown>
    eventDate?: Date
  }
): Promise<IAssetHistory> {
  // Find asset by custom ID to get MongoDB ObjectId
  const Asset = (await import('@/lib/models/Asset')).default
  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    throw new Error(`Asset with ID ${assetId} not found`)
  }

  const history = new AssetHistory({
    assetId: asset._id,
    eventType,
    eventDate: data.eventDate || new Date(),
    description: data.description,
    performedBy: data.performedBy,
    oldValue: data.oldValue,
    newValue: data.newValue,
    metadata: data.metadata || {},
  })

  await history.save()
  return history.toObject() as IAssetHistory
}

/**
 * Get all history entries for an asset
 */
export async function getAssetHistory(
  assetId: string,
  options?: {
    eventType?: AssetHistoryEventType
    limit?: number
    skip?: number
    sortBy?: 'eventDate' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  }
): Promise<IAssetHistory[]> {
  // Find asset by custom ID to get MongoDB ObjectId
  const Asset = (await import('@/lib/models/Asset')).default
  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return []
  }

  const query: Record<string, unknown> = { assetId: asset._id }

  if (options?.eventType) {
    query.eventType = options.eventType
  }

  const sortField = options?.sortBy || 'eventDate'
  const sortOrder = options?.sortOrder === 'asc' ? 1 : -1

  const history = await AssetHistory.find(query)
    .populate('performedBy', 'name email')
    .sort({ [sortField]: sortOrder })
    .limit(options?.limit || 100)
    .skip(options?.skip || 0)
    .lean()

  return history as IAssetHistory[]
}

/**
 * Get history entries grouped by event type
 */
export async function getAssetHistoryByType(assetId: string): Promise<Record<AssetHistoryEventType, IAssetHistory[]>> {
  // Find asset by custom ID to get MongoDB ObjectId
  const Asset = (await import('@/lib/models/Asset')).default
  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return {
      Repair: [],
      Move: [],
      Calibration: [],
      StatusChange: [],
      PM: [],
      Complaint: [],
    }
  }

  const history = await AssetHistory.find({ assetId: asset._id })
    .populate('performedBy', 'name email')
    .sort({ eventDate: -1 })
    .lean()

  const grouped: Record<AssetHistoryEventType, IAssetHistory[]> = {
    Repair: [],
    Move: [],
    Calibration: [],
    StatusChange: [],
    PM: [],
    Complaint: [],
  }

  history.forEach((entry) => {
    const eventType = entry.eventType as AssetHistoryEventType
    if (grouped[eventType]) {
      grouped[eventType].push(entry as IAssetHistory)
    }
  })

  return grouped
}

/**
 * Get history timeline (grouped by date)
 */
export async function getAssetHistoryTimeline(
  assetId: string
): Promise<Array<{ date: string; events: IAssetHistory[] }>> {
  // Find asset by custom ID to get MongoDB ObjectId
  const Asset = (await import('@/lib/models/Asset')).default
  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return []
  }

  const history = await AssetHistory.find({ assetId: asset._id })
    .populate('performedBy', 'name email')
    .sort({ eventDate: -1 })
    .lean()

  const timelineMap = new Map<string, IAssetHistory[]>()

  history.forEach((entry) => {
    const date = new Date(entry.eventDate).toISOString().split('T')[0]
    if (!timelineMap.has(date)) {
      timelineMap.set(date, [])
    }
    timelineMap.get(date)!.push(entry as IAssetHistory)
  })

  return Array.from(timelineMap.entries())
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Automatically create history entry when asset is updated
 */
export async function trackAssetUpdate(
  assetId: string,
  changes: Record<string, { old: unknown; new: unknown }>,
  performedBy?: string
): Promise<void> {
  const historyEntries: Promise<IAssetHistory>[] = []

  Object.entries(changes).forEach(([field, values]) => {
    if (values.old !== values.new) {
      let eventType: AssetHistoryEventType = 'StatusChange'

      // Determine event type based on field
      if (field === 'location' || field === 'department') {
        eventType = 'Move'
      } else if (field === 'status' || field === 'lifecycleState') {
        eventType = 'StatusChange'
      }

      historyEntries.push(
        createAssetHistory(assetId, eventType, {
          description: `${field} changed from "${String(values.old)}" to "${String(values.new)}"`,
          performedBy,
          oldValue: String(values.old),
          newValue: String(values.new),
          metadata: { field, oldValue: values.old, newValue: values.new },
        })
      )
    }
  })

  await Promise.all(historyEntries)
}

/**
 * Create history entry for asset move
 */
export async function trackAssetMove(
  assetId: string,
  moveData: {
    fromLocation?: string
    toLocation?: string
    fromDepartment?: string
    toDepartment?: string
    reason?: string
    movedBy?: string
  }
): Promise<IAssetHistory> {
  const description = [
    moveData.fromLocation && moveData.toLocation
      ? `Moved from ${moveData.fromLocation} to ${moveData.toLocation}`
      : null,
    moveData.fromDepartment && moveData.toDepartment
      ? `Department changed from ${moveData.fromDepartment} to ${moveData.toDepartment}`
      : null,
    moveData.reason ? `Reason: ${moveData.reason}` : null,
  ]
    .filter(Boolean)
    .join('. ')

  return createAssetHistory(assetId, 'Move', {
    description,
    performedBy: moveData.movedBy,
    metadata: {
      fromLocation: moveData.fromLocation,
      toLocation: moveData.toLocation,
      fromDepartment: moveData.fromDepartment,
      toDepartment: moveData.toDepartment,
      reason: moveData.reason,
    },
  })
}

/**
 * Aggregate history statistics
 */
export async function getAssetHistoryStats(assetId: string): Promise<{
  totalEvents: number
  eventsByType: Record<AssetHistoryEventType, number>
  lastEventDate?: string
  firstEventDate?: string
}> {
  // Find asset by custom ID to get MongoDB ObjectId
  const Asset = (await import('@/lib/models/Asset')).default
  const asset = await Asset.findOne({ id: assetId })
  if (!asset) {
    return {
      totalEvents: 0,
      eventsByType: {
        Repair: 0,
        Move: 0,
        Calibration: 0,
        StatusChange: 0,
        PM: 0,
        Complaint: 0,
      },
    }
  }

  const history = await AssetHistory.find({ assetId: asset._id }).lean()

  const stats = {
    totalEvents: history.length,
    eventsByType: {
      Repair: 0,
      Move: 0,
      Calibration: 0,
      StatusChange: 0,
      PM: 0,
      Complaint: 0,
    } as Record<AssetHistoryEventType, number>,
    lastEventDate: undefined as string | undefined,
    firstEventDate: undefined as string | undefined,
  }

  if (history.length > 0) {
    const dates = history.map((h) => new Date(h.eventDate).getTime())
    stats.lastEventDate = new Date(Math.max(...dates)).toISOString()
    stats.firstEventDate = new Date(Math.min(...dates)).toISOString()

    history.forEach((entry) => {
      const eventType = entry.eventType as AssetHistoryEventType
      if (stats.eventsByType[eventType] !== undefined) {
        stats.eventsByType[eventType]++
      }
    })
  }

  return stats
}

