import connectDB from '@/lib/db/mongodb'
import Asset from '@/lib/models/Asset'
import {
  calculateUtilizationStats,
  identifyUtilizationIssues,
} from './utilization'
import {
  analyzeCriticalEquipmentDowntime,
  getDowntimeByVendor,
  getDowntimeByDepartment,
  identifyRecurringFaults,
  getLongRepairDurations,
} from './downtimeAnalysis'
import mongoose from 'mongoose'

// Note: These functions assume PM, Calibration, Complaint, and Inventory models exist
// They will need to be updated once those models are created

export interface PMComplianceReport {
  summary: {
    totalPMs: number
    completedPMs: number
    overduePMs: number
    scheduledPMs: number
    complianceRate: number
  }
  byDepartment: Array<{
    department: string
    total: number
    completed: number
    overdue: number
    complianceRate: number
  }>
  overduePMs: Array<{
    assetId: string
    assetName: string
    department: string
    scheduledDate: string
    daysOverdue: number
    status: string
  }>
  upcomingPMs: Array<{
    assetId: string
    assetName: string
    department: string
    scheduledDate: string
    daysUntil: number
  }>
}

export interface CalibrationComplianceReport {
  summary: {
    totalCalibrations: number
    completed: number
    expired: number
    overdue: number
    expiringSoon: number
    complianceRate: number
  }
  byDepartment: Array<{
    department: string
    total: number
    expired: number
    overdue: number
    expiringSoon: number
    complianceRate: number
  }>
  expired: Array<{
    assetId: string
    assetName: string
    department: string
    nextDueDate: string
    daysExpired: number
  }>
  overdue: Array<{
    assetId: string
    assetName: string
    department: string
    nextDueDate: string
    daysOverdue: number
  }>
  expiringSoon: Array<{
    assetId: string
    assetName: string
    department: string
    nextDueDate: string
    daysUntil: number
  }>
}

export interface DowntimeTrendsReport {
  summary: {
    totalDowntimeHours: number
    totalEvents: number
    averageDowntimeHours: number
    period: {
      from: string
      to: string
    }
  }
  trends: Array<{
    period: string
    downtimeHours: number
    eventCount: number
  }>
  byAsset: Array<{
    assetId: string
    assetName: string
    department: string
    downtimeHours: number
    eventCount: number
  }>
  byDepartment: Array<{
    department: string
    downtimeHours: number
    eventCount: number
  }>
  byVendor: Array<{
    vendorId?: string
    vendorName?: string
    downtimeHours: number
    eventCount: number
  }>
}

export interface AssetInsightsReport {
  summary: {
    totalAssets: number
    activeAssets: number
    totalValue: number
    averageAge: number
    totalDowntimeHours: number
    averageUtilization: number
  }
  byStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  byDepartment: Array<{
    department: string
    count: number
    totalValue: number
    averageAge: number
  }>
  byCriticality: Array<{
    criticality: string
    count: number
    totalValue: number
  }>
  topAssetsByValue: Array<{
    assetId: string
    assetName: string
    department: string
    value: number
  }>
  topAssetsByDowntime: Array<{
    assetId: string
    assetName: string
    department: string
    downtimeHours: number
  }>
  utilizationIssues: {
    underUtilized: number
    overUtilized: number
  }
}

export interface InventorySummaryReport {
  summary: {
    totalItems: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
  }
  byCategory: Array<{
    category: string
    itemCount: number
    totalValue: number
    lowStockCount: number
  }>
  lowStock: Array<{
    itemId: string
    itemName: string
    category: string
    currentStock: number
    minLevel: number
    unit: string
  }>
  outOfStock: Array<{
    itemId: string
    itemName: string
    category: string
    minLevel: number
    unit: string
  }>
  highValueItems: Array<{
    itemId: string
    itemName: string
    category: string
    stock: number
    unitCost: number
    totalValue: number
  }>
}

export interface CAPEXOverviewReport {
  summary: {
    totalProposals: number
    totalBudget: number
    approved: number
    pending: number
    rejected: number
    totalApprovedBudget: number
  }
  byStatus: Array<{
    status: string
    count: number
    totalBudget: number
  }>
  byDepartment: Array<{
    department: string
    count: number
    totalBudget: number
    approvedBudget: number
  }>
  topProposals: Array<{
    proposalId: string
    title: string
    department: string
    budget: number
    status: string
    roi?: number
  }>
}

/**
 * Generate PM Compliance Report
 */
export async function generatePMComplianceReport(
  dateFrom?: string,
  dateTo?: string
): Promise<PMComplianceReport> {
  await connectDB()

  // TODO: Query PreventiveMaintenance model once it exists
  // For now, return placeholder structure

  const summary = {
    totalPMs: 0,
    completedPMs: 0,
    overduePMs: 0,
    scheduledPMs: 0,
    complianceRate: 0,
  }

  return {
    summary,
    byDepartment: [],
    overduePMs: [],
    upcomingPMs: [],
  }
}

/**
 * Generate Calibration Compliance Report
 */
export async function generateCalibrationComplianceReport(
  dateFrom?: string,
  dateTo?: string
): Promise<CalibrationComplianceReport> {
  await connectDB()

  // Get assets with calibration dates
  const assets = await Asset.find({
    nextCalibrationDate: { $exists: true },
  }).lean()

  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  let total = 0
  let expired = 0
  let overdue = 0
  let expiringSoon = 0

  const expiredList: CalibrationComplianceReport['expired'] = []
  const overdueList: CalibrationComplianceReport['overdue'] = []
  const expiringSoonList: CalibrationComplianceReport['expiringSoon'] = []

  assets.forEach((asset) => {
    if (!asset.nextCalibrationDate) return

    total++
    const dueDate = new Date(asset.nextCalibrationDate)
    const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) {
      expired++
      expiredList.push({
        assetId: asset.id,
        assetName: asset.name,
        department: asset.department,
        nextDueDate: dueDate.toISOString().split('T')[0],
        daysExpired: Math.abs(daysDiff),
      })
    } else if (daysDiff <= 7) {
      overdue++
      overdueList.push({
        assetId: asset.id,
        assetName: asset.name,
        department: asset.department,
        nextDueDate: dueDate.toISOString().split('T')[0],
        daysOverdue: daysDiff,
      })
    } else if (daysDiff <= 30) {
      expiringSoon++
      expiringSoonList.push({
        assetId: asset.id,
        assetName: asset.name,
        department: asset.department,
        nextDueDate: dueDate.toISOString().split('T')[0],
        daysUntil: daysDiff,
      })
    }
  })

  const complianceRate = total > 0 ? ((total - expired - overdue) / total) * 100 : 0

  // Group by department
  const deptMap = new Map<string, {
    total: number
    expired: number
    overdue: number
    expiringSoon: number
  }>()

  assets.forEach((asset) => {
    if (!asset.nextCalibrationDate) return

    if (!deptMap.has(asset.department)) {
      deptMap.set(asset.department, { total: 0, expired: 0, overdue: 0, expiringSoon: 0 })
    }

    const dept = deptMap.get(asset.department)!
    dept.total++

    const dueDate = new Date(asset.nextCalibrationDate)
    const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) {
      dept.expired++
    } else if (daysDiff <= 7) {
      dept.overdue++
    } else if (daysDiff <= 30) {
      dept.expiringSoon++
    }
  })

  const byDepartment = Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    ...data,
    complianceRate: data.total > 0 ? ((data.total - data.expired - data.overdue) / data.total) * 100 : 0,
  }))

  return {
    summary: {
      totalCalibrations: total,
      completed: total - expired - overdue - expiringSoon,
      expired,
      overdue,
      expiringSoon,
      complianceRate: Math.round(complianceRate * 100) / 100,
    },
    byDepartment,
    expired: expiredList.sort((a, b) => b.daysExpired - a.daysExpired),
    overdue: overdueList.sort((a, b) => a.daysOverdue - b.daysOverdue),
    expiringSoon: expiringSoonList.sort((a, b) => a.daysUntil - b.daysUntil),
  }
}

/**
 * Generate Downtime Trends Report
 */
export async function generateDowntimeTrendsReport(
  dateFrom: string,
  dateTo: string
): Promise<DowntimeTrendsReport> {
  await connectDB()

  // Get downtime by vendor and department
  const byVendor = await getDowntimeByVendor(dateFrom, dateTo)
  const byDepartment = await getDowntimeByDepartment(dateFrom, dateTo)

  // Calculate summary
  const totalDowntimeHours = byVendor.reduce((sum, v) => sum + v.totalDowntimeHours, 0)
  const totalEvents = byVendor.reduce((sum, v) => sum + v.eventCount, 0)
  const averageDowntimeHours = totalEvents > 0 ? totalDowntimeHours / totalEvents : 0

  // Get trends (monthly)
  const trends: DowntimeTrendsReport['trends'] = []
  // TODO: Implement monthly trends grouping

  // Get by asset
  const byAsset: DowntimeTrendsReport['byAsset'] = []
  // TODO: Implement asset-level aggregation

  return {
    summary: {
      totalDowntimeHours,
      totalEvents,
      averageDowntimeHours: Math.round(averageDowntimeHours * 100) / 100,
      period: { from: dateFrom, to: dateTo },
    },
    trends,
    byAsset,
    byDepartment: byDepartment.map((d) => ({
      department: d.department,
      downtimeHours: d.totalDowntimeHours,
      eventCount: d.eventCount,
    })),
    byVendor: byVendor.map((v) => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName,
      downtimeHours: v.totalDowntimeHours,
      eventCount: v.eventCount,
    })),
  }
}

/**
 * Generate Asset Insights Report
 */
export async function generateAssetInsightsReport(): Promise<AssetInsightsReport> {
  await connectDB()

  const assets = await Asset.find({}).lean()

  const totalAssets = assets.length
  const activeAssets = assets.filter((a) => a.status === 'Active' || a.status === 'In-Service').length
  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0)
  const totalAge = assets.reduce((sum, a) => sum + (a.ageYears || 0), 0)
  const averageAge = totalAssets > 0 ? totalAge / totalAssets : 0
  const totalDowntimeHours = assets.reduce((sum, a) => sum + (a.totalDowntimeHours || 0), 0)
  const totalUtilization = assets.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0)
  const averageUtilization = totalAssets > 0 ? totalUtilization / totalAssets : 0

  // By status
  const statusMap = new Map<string, number>()
  assets.forEach((a) => {
    statusMap.set(a.status, (statusMap.get(a.status) || 0) + 1)
  })
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / totalAssets) * 100 * 100) / 100,
  }))

  // By department
  const deptMap = new Map<string, { count: number; totalValue: number; totalAge: number }>()
  assets.forEach((a) => {
    if (!deptMap.has(a.department)) {
      deptMap.set(a.department, { count: 0, totalValue: 0, totalAge: 0 })
    }
    const dept = deptMap.get(a.department)!
    dept.count++
    dept.totalValue += a.value || 0
    dept.totalAge += a.ageYears || 0
  })
  const byDepartment = Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    count: data.count,
    totalValue: data.totalValue,
    averageAge: data.count > 0 ? Math.round((data.totalAge / data.count) * 100) / 100 : 0,
  }))

  // By criticality
  const critMap = new Map<string, { count: number; totalValue: number }>()
  assets.forEach((a) => {
    const crit = a.criticality || 'Unknown'
    if (!critMap.has(crit)) {
      critMap.set(crit, { count: 0, totalValue: 0 })
    }
    const critData = critMap.get(crit)!
    critData.count++
    critData.totalValue += a.value || 0
  })
  const byCriticality = Array.from(critMap.entries()).map(([criticality, data]) => ({
    criticality,
    count: data.count,
    totalValue: data.totalValue,
  }))

  // Top assets by value
  const topAssetsByValue = assets
    .filter((a) => a.value && a.value > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 10)
    .map((a) => ({
      assetId: a.id,
      assetName: a.name,
      department: a.department,
      value: a.value || 0,
    }))

  // Top assets by downtime
  const topAssetsByDowntime = assets
    .filter((a) => a.totalDowntimeHours && a.totalDowntimeHours > 0)
    .sort((a, b) => (b.totalDowntimeHours || 0) - (a.totalDowntimeHours || 0))
    .slice(0, 10)
    .map((a) => ({
      assetId: a.id,
      assetName: a.name,
      department: a.department,
      downtimeHours: a.totalDowntimeHours || 0,
    }))

  // Utilization issues
  const issues = await identifyUtilizationIssues()
  const utilizationIssues = {
    underUtilized: issues.underUtilized.length,
    overUtilized: issues.overUtilized.length,
  }

  return {
    summary: {
      totalAssets,
      activeAssets,
      totalValue,
      averageAge: Math.round(averageAge * 100) / 100,
      totalDowntimeHours: Math.round(totalDowntimeHours * 100) / 100,
      averageUtilization: Math.round(averageUtilization * 100) / 100,
    },
    byStatus,
    byDepartment,
    byCriticality,
    topAssetsByValue,
    topAssetsByDowntime,
    utilizationIssues,
  }
}

/**
 * Generate Inventory Summary Report
 */
export async function generateInventorySummaryReport(): Promise<InventorySummaryReport> {
  await connectDB()

  // TODO: Query InventoryItem model once it exists
  // For now, return placeholder structure

  return {
    summary: {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    },
    byCategory: [],
    lowStock: [],
    outOfStock: [],
    highValueItems: [],
  }
}

/**
 * Generate CAPEX Overview Report
 */
export async function generateCAPEXOverviewReport(): Promise<CAPEXOverviewReport> {
  await connectDB()

  // TODO: Query CAPEXProposal model once it exists
  // For now, return placeholder structure

  return {
    summary: {
      totalProposals: 0,
      totalBudget: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      totalApprovedBudget: 0,
    },
    byStatus: [],
    byDepartment: [],
    topProposals: [],
  }
}

/**
 * Generate Equipment Utilization Report
 */
export async function generateUtilizationReport(
  dateFrom?: string,
  dateTo?: string
): Promise<{
  summary: {
    totalAssets: number
    trackedAssets: number
    averageUtilization: number
    underUtilized: number
    overUtilized: number
  }
  utilizationStats: Array<{
    assetId: string
    assetName: string
    department: string
    utilizationPercentage: number
    totalUsageHours: number
    status: string
  }>
  underUtilized: Array<{
    assetId: string
    assetName: string
    department: string
    utilizationPercentage: number
  }>
  overUtilized: Array<{
    assetId: string
    assetName: string
    department: string
    utilizationPercentage: number
  }>
}> {
  await connectDB()

  const assets = await Asset.find({
    utilizationPercentage: { $exists: true },
  }).lean()

  const issues = await identifyUtilizationIssues()

  const totalAssets = assets.length
  const trackedAssets = assets.filter((a) => a.utilizationPercentage !== undefined && a.utilizationPercentage !== null).length
  const totalUtilization = assets.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0)
  const averageUtilization = trackedAssets > 0 ? totalUtilization / trackedAssets : 0

  const utilizationStats = assets.map((a) => {
    const util = a.utilizationPercentage || 0
    let status = 'normal'
    if (util < 20) status = 'under-utilized'
    else if (util > 80) status = 'over-utilized'

    return {
      assetId: a.id,
      assetName: a.name,
      department: a.department,
      utilizationPercentage: util,
      totalUsageHours: 0, // TODO: Calculate from utilization records
      status,
    }
  })

  return {
    summary: {
      totalAssets,
      trackedAssets,
      averageUtilization: Math.round(averageUtilization * 100) / 100,
      underUtilized: issues.underUtilized.length,
      overUtilized: issues.overUtilized.length,
    },
    utilizationStats,
    underUtilized: issues.underUtilized.map((u) => ({
      assetId: u.assetId,
      assetName: u.assetName,
      department: u.department,
      utilizationPercentage: u.utilizationPercentage,
    })),
    overUtilized: issues.overUtilized.map((o) => ({
      assetId: o.assetId,
      assetName: o.assetName,
      department: o.department,
      utilizationPercentage: o.utilizationPercentage,
    })),
  }
}

/**
 * Generate Critical Equipment Downtime Analysis Report
 */
export async function generateCriticalDowntimeReport(
  dateFrom?: string,
  dateTo?: string
): Promise<{
  summary: {
    totalCriticalAssets: number
    assetsWithDowntime: number
    totalDowntimeHours: number
    averageDowntimeHours: number
  }
  analysis: Array<{
    assetId: string
    assetName: string
    department: string
    totalDowntimeHours: number
    totalEvents: number
    recurringFaults: Array<{
      rootCause: string
      count: number
    }>
    longRepairs: number
  }>
  recurringFaults: Array<{
    rootCause: string
    totalOccurrences: number
    affectedAssets: number
  }>
  byVendor: Array<{
    vendorId?: string
    vendorName?: string
    totalDowntimeHours: number
    eventCount: number
  }>
}> {
  const analysis = await analyzeCriticalEquipmentDowntime(dateFrom, dateTo)
  const recurringFaults = await identifyRecurringFaults(dateFrom, dateTo)
  const byVendor = await getDowntimeByVendor(dateFrom, dateTo)

  const totalCriticalAssets = analysis.length
  const assetsWithDowntime = analysis.filter((a) => a.totalDowntimeEvents > 0).length
  const totalDowntimeHours = analysis.reduce((sum, a) => sum + a.totalDowntimeHours, 0)
  const averageDowntimeHours = assetsWithDowntime > 0 ? totalDowntimeHours / assetsWithDowntime : 0

  return {
    summary: {
      totalCriticalAssets,
      assetsWithDowntime,
      totalDowntimeHours: Math.round(totalDowntimeHours * 100) / 100,
      averageDowntimeHours: Math.round(averageDowntimeHours * 100) / 100,
    },
    analysis: analysis.map((a) => ({
      assetId: a.assetId,
      assetName: a.assetName,
      department: a.department,
      totalDowntimeHours: a.totalDowntimeHours,
      totalEvents: a.totalDowntimeEvents,
      recurringFaults: a.recurringFaults.map((f) => ({
        rootCause: f.rootCause,
        count: f.count,
      })),
      longRepairs: a.longRepairs.length,
    })),
    recurringFaults: recurringFaults.map((f) => ({
      rootCause: f.rootCause,
      totalOccurrences: f.totalOccurrences,
      affectedAssets: f.affectedAssets,
    })),
    byVendor: byVendor.map((v) => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName,
      totalDowntimeHours: v.totalDowntimeHours,
      eventCount: v.eventCount,
    })),
  }
}

