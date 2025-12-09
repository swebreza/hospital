import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import { identifyUtilizationIssues } from './utilization'
import {
  calculateDowntime,
  analyzeCriticalEquipmentDowntime,
} from './downtimeAnalysis'

export interface DashboardMetrics {
  pmCompliance: {
    rate: number
    totalPMs: number
    completedPMs: number
    overduePMs: number
  }
  calibrationStatus: {
    total: number
    expired: number
    expiringSoon: number
    compliant: number
  }
  complaintTrends: {
    open: number
    inProgress: number
    resolved: number
    byPriority: {
      low: number
      medium: number
      high: number
      critical: number
    }
  }
  downtimeStats: {
    totalHours: number
    totalEvents: number
    averageHours: number
    criticalAssetsAffected: number
  }
  inventoryAlerts: {
    lowStock: number
    outOfStock: number
    criticalItems: number
  }
  amcCmcUpdates: {
    expiringSoon: number
    expired: number
    renewalsNeeded: number
  }
}

/**
 * Get real-time PM compliance metrics
 */
export async function getPMComplianceMetrics(): Promise<DashboardMetrics['pmCompliance']> {
  await connectDB()

  // TODO: Query PreventiveMaintenance model once it exists
  // For now, return placeholder
  return {
    rate: 0,
    totalPMs: 0,
    completedPMs: 0,
    overduePMs: 0,
  }
}

/**
 * Get calibration status summary
 */
export async function getCalibrationStatus(): Promise<DashboardMetrics['calibrationStatus']> {
  await connectDB()

  const assets = await Asset.find({
    nextCalibrationDate: { $exists: true },
  }).lean()

  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  let expired = 0
  let expiringSoon = 0
  let compliant = 0

  assets.forEach((asset) => {
    if (!asset.nextCalibrationDate) return

    const dueDate = new Date(asset.nextCalibrationDate)
    const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) {
      expired++
    } else if (daysDiff <= 30) {
      expiringSoon++
    } else {
      compliant++
    }
  })

  return {
    total: assets.length,
    expired,
    expiringSoon,
    compliant,
  }
}

/**
 * Get complaint trends
 */
export async function getComplaintTrends(): Promise<DashboardMetrics['complaintTrends']> {
  await connectDB()

  // TODO: Query Complaint model once it exists
  // For now, return placeholder
  return {
    open: 0,
    inProgress: 0,
    resolved: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
  }
}

/**
 * Get current downtime statistics
 */
export async function getDowntimeStats(): Promise<DashboardMetrics['downtimeStats']> {
  await connectDB()

  // Get last 30 days of downtime
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const events = await calculateDowntime(
    undefined,
    thirtyDaysAgo.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  )

  const totalHours = events.reduce((sum, e) => sum + e.durationHours, 0)
  const totalEvents = events.length
  const averageHours = totalEvents > 0 ? totalHours / totalEvents : 0

  // Get critical assets affected
  const criticalAnalysis = await analyzeCriticalEquipmentDowntime(
    thirtyDaysAgo.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  )
  const criticalAssetsAffected = criticalAnalysis.filter((a) => a.totalDowntimeEvents > 0).length

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalEvents,
    averageHours: Math.round(averageHours * 100) / 100,
    criticalAssetsAffected,
  }
}

/**
 * Get inventory alerts
 */
export async function getInventoryAlerts(): Promise<DashboardMetrics['inventoryAlerts']> {
  await connectDB()

  // TODO: Query InventoryItem model once it exists
  // For now, return placeholder
  return {
    lowStock: 0,
    outOfStock: 0,
    criticalItems: 0,
  }
}

/**
 * Get AMC/CMC updates
 */
export async function getAMCCMCUpdates(): Promise<DashboardMetrics['amcCmcUpdates']> {
  await connectDB()

  const assets = await Asset.find({
    amcExpiry: { $exists: true },
  }).lean()

  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  let expiringSoon = 0
  let expired = 0

  assets.forEach((asset) => {
    if (!asset.amcExpiry) return

    const expiryDate = new Date(asset.amcExpiry)
    const daysDiff = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) {
      expired++
    } else if (daysDiff <= 30) {
      expiringSoon++
    }
  })

  return {
    expiringSoon,
    expired,
    renewalsNeeded: expired + expiringSoon,
  }
}

/**
 * Get all dashboard metrics
 */
export async function getAllDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    pmCompliance,
    calibrationStatus,
    complaintTrends,
    downtimeStats,
    inventoryAlerts,
    amcCmcUpdates,
  ] = await Promise.all([
    getPMComplianceMetrics(),
    getCalibrationStatus(),
    getComplaintTrends(),
    getDowntimeStats(),
    getInventoryAlerts(),
    getAMCCMCUpdates(),
  ])

  return {
    pmCompliance,
    calibrationStatus,
    complaintTrends,
    downtimeStats,
    inventoryAlerts,
    amcCmcUpdates,
  }
}

