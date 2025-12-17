/**
 * Client-safe QR code utilities
 * These functions don't require server-side dependencies
 */

/**
 * Generate QR code data for an asset
 * Returns a URL-safe string that can be encoded in QR code
 */
export function generateQRCodeData(assetId: string): string {
  // Simple encoding: just the asset ID
  // In production, you might want to encode more data or use a short URL
  let baseUrl: string
  
  if (typeof window !== 'undefined') {
    // Client-side: use current origin (works in both dev and production)
    baseUrl = window.location.origin
  } else {
    // Server-side: use environment variable or fallback
    // NEXT_PUBLIC_APP_URL should be set in Vercel: https://hospital-sigma-five.vercel.app
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  return `${baseUrl}/qr/${assetId}`
}

/**
 * Format QR code data for mobile display
 */
export function formatQRDataForMobile(data: {
  asset: {
    id: string
    name: string
    model?: string
    manufacturer?: string
    department: string
    location?: string
    status: string
  }
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
}): {
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

