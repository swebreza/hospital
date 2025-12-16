import Asset from '@/lib/models/Asset'
import AssetHistory from '@/lib/models/AssetHistory'
import MEAChecklist from '@/lib/models/MEAChecklist'
import Document from '@/lib/models/Document'
import type { Asset as IAsset } from '@/lib/types'

/**
 * Generate QR code data for an asset
 * Returns a URL-safe string that can be encoded in QR code
 */
export function generateQRCodeData(assetId: string): string {
  // Simple encoding: just the asset ID
  // In production, you might want to encode more data or use a short URL
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/qr/${assetId}`
}

/**
 * Get comprehensive asset data for QR code scan
 * This is what gets displayed when someone scans the QR code
 */
export interface QRCodeAssetData {
  asset: IAsset
  pmStatus: {
    nextPmDate?: string
    overdue: boolean
    daysUntil: number | null
  }
  calibrationStatus: {
    nextCalibrationDate?: string
    overdue: boolean
    daysUntil: number | null
  }
  recentComplaints: Array<{
    id: string
    title: string
    status: string
    reportedAt: string
  }>
  documents: Array<{
    id: string
    fileName: string
    fileUrl: string
    documentCategory?: string
  }>
  trainingVideos: Array<{
    id: string
    fileName: string
    fileUrl: string
    thumbnailUrl?: string
  }>
  recentHistory: Array<{
    eventType: string
    eventDate: string
    description?: string
  }>
  meaChecklists: Array<{
    checklistType: string
    status: string
    performedDate: string
  }>
}

export async function getQRCodeAssetData(assetId: string): Promise<QRCodeAssetData | null> {
  const asset = await Asset.findOne({ id: assetId })
    .populate('createdBy', 'name email')
    .lean()

  if (!asset) {
    return null
  }

  // Get PM status
  const nextPmDate = asset.nextPmDate ? new Date(asset.nextPmDate) : null
  const pmDaysUntil = nextPmDate ? Math.ceil((nextPmDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  // Get calibration status
  const nextCalibrationDate = asset.nextCalibrationDate ? new Date(asset.nextCalibrationDate) : null
  const calDaysUntil = nextCalibrationDate
    ? Math.ceil((nextCalibrationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Get recent complaints (last 5) from Prisma
  // Note: We'll fetch from Prisma complaints table instead of AssetHistory
  let recentComplaints: any[] = []
  try {
    const { prisma } = await import('@/lib/prisma')
    const complaints = await prisma.complaint.findMany({
      where: { assetId: asset.id },
      orderBy: { reportedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        reportedAt: true,
      },
    })
    recentComplaints = complaints.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      reportedAt: c.reportedAt.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching complaints for QR:', error)
    // Fallback to AssetHistory if Prisma fails
    recentComplaints = await AssetHistory.find({
      assetId: asset._id,
      eventType: 'Complaint',
    })
      .sort({ eventDate: -1 })
      .limit(5)
      .lean()
      .then((histories) =>
        histories.map((h) => ({
          id: h._id.toString(),
          title: h.description || 'Complaint',
          status: 'Unknown',
          reportedAt: h.eventDate.toISOString(),
        }))
      )
  }

  // Get documents
  const documents = await Document.find({
    entityType: 'asset',
    entityId: asset.id, // Use custom ID for documents
    documentCategory: { $ne: 'Training_Video' },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  // Get training videos
  const trainingVideos = await Document.find({
    entityType: 'asset',
    entityId: asset.id, // Use custom ID for documents
    documentCategory: 'Training_Video',
  })
    .sort({ createdAt: -1 })
    .lean()

  // Get recent history (last 10 events)
  const recentHistory = await AssetHistory.find({ assetId: asset._id })
    .sort({ eventDate: -1 })
    .limit(10)
    .lean()

  // Get MEA checklists
  const meaChecklists = await MEAChecklist.find({ assetId: asset._id })
    .sort({ performedDate: -1 })
    .lean()

  return {
    asset: asset as IAsset,
    pmStatus: {
      nextPmDate: asset.nextPmDate?.toISOString(),
      overdue: pmDaysUntil !== null && pmDaysUntil < 0,
      daysUntil: pmDaysUntil,
    },
    calibrationStatus: {
      nextCalibrationDate: asset.nextCalibrationDate?.toISOString(),
      overdue: calDaysUntil !== null && calDaysUntil < 0,
      daysUntil: calDaysUntil,
    },
    recentComplaints,
    documents: documents.map((d) => ({
      id: d._id.toString(),
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      documentCategory: d.documentCategory,
    })),
    trainingVideos: trainingVideos.map((v) => ({
      id: v._id.toString(),
      fileName: v.fileName,
      fileUrl: v.fileUrl,
      thumbnailUrl: v.thumbnailUrl,
    })),
    recentHistory: recentHistory.map((h) => ({
      eventType: h.eventType,
      eventDate: h.eventDate.toISOString(),
      description: h.description,
    })),
    meaChecklists: meaChecklists.map((c) => ({
      checklistType: c.checklistType,
      status: c.status,
      performedDate: c.performedDate.toISOString(),
    })),
  }
}

/**
 * Format QR code data for mobile display
 */
export function formatQRDataForMobile(data: QRCodeAssetData): {
  title: string
  sections: Array<{
    title: string
    items: Array<{ label: string; value: string }>
  }>
  actions: Array<{ label: string; url: string }>
} {
  return {
    title: data.asset.name,
    sections: [
      {
        title: 'Asset Information',
        items: [
          { label: 'ID', value: data.asset.id },
          { label: 'Model', value: data.asset.model || 'N/A' },
          { label: 'Manufacturer', value: data.asset.manufacturer || 'N/A' },
          { label: 'Department', value: data.asset.department },
          { label: 'Location', value: data.asset.location || 'N/A' },
          { label: 'Status', value: data.asset.status },
        ],
      },
      {
        title: 'Maintenance Status',
        items: [
          {
            label: 'Next PM',
            value: data.pmStatus.nextPmDate
              ? `${new Date(data.pmStatus.nextPmDate).toLocaleDateString()} (${
                  data.pmStatus.daysUntil !== null
                    ? data.pmStatus.daysUntil < 0
                      ? `${Math.abs(data.pmStatus.daysUntil)} days overdue`
                      : `${data.pmStatus.daysUntil} days`
                    : 'N/A'
                })`
              : 'Not scheduled',
          },
          {
            label: 'Next Calibration',
            value: data.calibrationStatus.nextCalibrationDate
              ? `${new Date(data.calibrationStatus.nextCalibrationDate).toLocaleDateString()} (${
                  data.calibrationStatus.daysUntil !== null
                    ? data.calibrationStatus.daysUntil < 0
                      ? `${Math.abs(data.calibrationStatus.daysUntil)} days overdue`
                      : `${data.calibrationStatus.daysUntil} days`
                    : 'N/A'
                })`
              : 'Not scheduled',
          },
        ],
      },
    ],
    actions: [
      { label: 'View Full Details', url: `/assets/${data.asset.id}` },
      { label: 'Raise Complaint', url: `/complaints/new?assetId=${data.asset.id}` },
      { label: 'View History', url: `/assets/${data.asset.id}?tab=history` },
    ],
  }
}

