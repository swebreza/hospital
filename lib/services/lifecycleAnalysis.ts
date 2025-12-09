import Asset from '@/lib/models/Asset'
import type { Asset as IAsset } from '@/lib/types'

/**
 * Calculate asset age in years
 */
export function calculateAssetAge(purchaseDate: Date | string | undefined): number {
  if (!purchaseDate) return 0
  const purchase = typeof purchaseDate === 'string' ? new Date(purchaseDate) : purchaseDate
  const ageInMs = Date.now() - purchase.getTime()
  return Math.round((ageInMs / (1000 * 60 * 60 * 24 * 365)) * 100) / 100
}

/**
 * Calculate total downtime hours for an asset
 */
export async function calculateTotalDowntime(assetId: string): Promise<number> {
  // This would typically aggregate from complaints/breakdowns
  // For now, return the stored value or calculate from history
  const asset = await Asset.findOne({ id: assetId }).lean()
  return asset?.totalDowntimeHours || 0
}

/**
 * Calculate total service cost for an asset
 */
export async function calculateTotalServiceCost(assetId: string): Promise<number> {
  // This would typically aggregate from corrective maintenances
  // For now, return the stored value
  const asset = await Asset.findOne({ id: assetId }).lean()
  return asset?.totalServiceCost || 0
}

/**
 * Determine utilization percentage
 */
export async function calculateUtilization(assetId: string): Promise<number> {
  // This would typically calculate based on usage logs
  // For now, return the stored value
  const asset = await Asset.findOne({ id: assetId }).lean()
  return asset?.utilizationPercentage || 0
}

/**
 * Generate replacement recommendation based on multiple factors
 */
export interface ReplacementRecommendation {
  assetId: string
  assetName: string
  recommendation: 'Replace' | 'Monitor' | 'Maintain'
  priority: 'High' | 'Medium' | 'Low'
  score: number
  reasons: string[]
  estimatedReplacementCost?: number
  estimatedReplacementDate?: string
}

export async function generateReplacementRecommendations(
  options?: {
    minAge?: number // Minimum age in years to consider
    maxServiceCostRatio?: number // Max service cost as ratio of asset value
    minDowntimeHours?: number
    minUtilization?: number
  }
): Promise<ReplacementRecommendation[]> {
  const {
    minAge = 5,
    maxServiceCostRatio = 0.5,
    minDowntimeHours = 100,
    minUtilization = 20,
  } = options || {}

  const assets = await Asset.find({
    lifecycleState: { $ne: 'Disposed' },
    replacementRecommended: { $ne: true },
  }).lean()

  const recommendations: ReplacementRecommendation[] = []

  for (const asset of assets) {
    const age = calculateAssetAge(asset.purchaseDate)
    const serviceCostRatio = asset.value && asset.totalServiceCost
      ? asset.totalServiceCost / asset.value
      : 0
    const downtimeHours = asset.totalDowntimeHours || 0
    const utilization = asset.utilizationPercentage || 0

    const reasons: string[] = []
    let score = 0

    // Age factor
    if (age >= minAge) {
      reasons.push(`Asset age is ${age.toFixed(1)} years (threshold: ${minAge} years)`)
      score += Math.min(age / minAge, 2) * 20 // Max 40 points
    }

    // Service cost factor
    if (serviceCostRatio >= maxServiceCostRatio) {
      reasons.push(
        `Service cost ratio is ${(serviceCostRatio * 100).toFixed(1)}% (threshold: ${(maxServiceCostRatio * 100).toFixed(1)}%)`
      )
      score += Math.min(serviceCostRatio / maxServiceCostRatio, 2) * 20 // Max 40 points
    }

    // Downtime factor
    if (downtimeHours >= minDowntimeHours) {
      reasons.push(`Total downtime is ${downtimeHours} hours (threshold: ${minDowntimeHours} hours)`)
      score += Math.min(downtimeHours / minDowntimeHours, 1.5) * 10 // Max 15 points
    }

    // Utilization factor (low utilization suggests replacement)
    if (utilization < minUtilization && utilization > 0) {
      reasons.push(`Utilization is ${utilization.toFixed(1)}% (threshold: ${minUtilization}%)`)
      score += ((minUtilization - utilization) / minUtilization) * 5 // Max 5 points
    }

    if (score > 30) {
      // Only recommend if score is significant
      recommendations.push({
        assetId: asset.id,
        assetName: asset.name,
        recommendation: score >= 60 ? 'Replace' : score >= 40 ? 'Monitor' : 'Maintain',
        priority: score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low',
        score: Math.min(score, 100),
        reasons,
        estimatedReplacementCost: asset.value ? asset.value * 1.1 : undefined, // 10% inflation
        estimatedReplacementDate: asset.purchaseDate
          ? new Date(
              new Date(asset.purchaseDate).getTime() + (minAge + 2) * 365 * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined,
      })
    }
  }

  return recommendations.sort((a, b) => b.score - a.score)
}

/**
 * Update asset replacement recommendation flags
 */
export async function updateReplacementFlags(): Promise<void> {
  const recommendations = await generateReplacementRecommendations()

  const updatePromises = recommendations.map((rec) =>
    Asset.updateOne(
      { id: rec.assetId },
      {
        $set: {
          replacementRecommended: rec.recommendation === 'Replace',
          replacementReason: rec.reasons.join('; '),
        },
      }
    )
  )

  await Promise.all(updatePromises)
}

/**
 * Get assets nearing end of life
 */
export async function getAssetsNearingEndOfLife(
  thresholdYears: number = 5
): Promise<IAsset[]> {
  const thresholdDate = new Date()
  thresholdDate.setFullYear(thresholdDate.getFullYear() - thresholdYears)

  const assets = await Asset.find({
    purchaseDate: { $lte: thresholdDate },
    lifecycleState: { $ne: 'Disposed' },
  })
    .sort({ purchaseDate: 1 })
    .lean()

  return assets as IAsset[]
}

/**
 * Send notifications for assets nearing end of life
 */
export async function notifyEndOfLifeAssets(
  thresholdYears: number = 5
): Promise<Array<{ assetId: string; assetName: string; age: number; message: string }>> {
  const assets = await getAssetsNearingEndOfLife(thresholdYears)
  const notifications: Array<{ assetId: string; assetName: string; age: number; message: string }> = []

  assets.forEach((asset) => {
    const age = calculateAssetAge(asset.purchaseDate)
    notifications.push({
      assetId: asset.id,
      assetName: asset.name,
      age,
      message: `Asset "${asset.name}" is ${age.toFixed(1)} years old and may need replacement consideration.`,
    })
  })

  return notifications
}

