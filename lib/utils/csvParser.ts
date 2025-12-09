import Papa from 'papaparse'

export interface UtilizationCSVRow {
  assetId?: string
  assetName?: string
  serialNumber?: string
  date: string
  usageHours?: number
  usageCount?: number
  notes?: string
}

export interface ParsedUtilizationData {
  valid: UtilizationCSVRow[]
  errors: Array<{
    row: number
    message: string
    data?: Record<string, unknown>
  }>
}

/**
 * Parse CSV file for utilization data
 * Expected columns: assetId (or assetName/serialNumber), date, usageHours (optional), usageCount (optional), notes (optional)
 */
export async function parseUtilizationCSV(
  file: File
): Promise<ParsedUtilizationData> {
  return new Promise((resolve) => {
    const text = ''
    const reader = new FileReader()

    reader.onload = (e) => {
      const csv = e.target?.result as string

      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalize header names
          const normalized = header.trim().toLowerCase()
          const mappings: Record<string, string> = {
            'asset id': 'assetId',
            'asset_id': 'assetId',
            'asset name': 'assetName',
            'asset_name': 'assetName',
            'serial number': 'serialNumber',
            'serial_number': 'serialNumber',
            'usage hours': 'usageHours',
            'usage_hours': 'usageHours',
            'usage count': 'usageCount',
            'usage_count': 'usageCount',
            'date': 'date',
          }
          return mappings[normalized] || normalized
        },
        complete: (results) => {
          const valid: UtilizationCSVRow[] = []
          const errors: ParsedUtilizationData['errors'] = []

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2 // +2 because index is 0-based and we skip header

            // Validate required fields
            if (!row.date) {
              errors.push({
                row: rowNumber,
                message: 'Date is required',
                data: row,
              })
              return
            }

            // Validate at least one identifier
            if (!row.assetId && !row.assetName && !row.serialNumber) {
              errors.push({
                row: rowNumber,
                message:
                  'Either assetId, assetName, or serialNumber is required',
                data: row,
              })
              return
            }

            // Validate date format
            const date = parseDate(row.date)
            if (!date || isNaN(date.getTime())) {
              errors.push({
                row: rowNumber,
                message: `Invalid date format: ${row.date}. Expected formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY`,
                data: row,
              })
              return
            }

            // Validate usageHours if provided
            if (row.usageHours !== undefined && row.usageHours !== '') {
              const hours = parseFloat(row.usageHours)
              if (isNaN(hours) || hours < 0) {
                errors.push({
                  row: rowNumber,
                  message: 'usageHours must be a non-negative number',
                  data: row,
                })
                return
              }
            }

            // Validate usageCount if provided
            if (row.usageCount !== undefined && row.usageCount !== '') {
              const count = parseInt(row.usageCount, 10)
              if (isNaN(count) || count < 0) {
                errors.push({
                  row: rowNumber,
                  message: 'usageCount must be a non-negative integer',
                  data: row,
                })
                return
              }
            }

            // At least one usage metric should be provided
            if (
              (row.usageHours === undefined || row.usageHours === '') &&
              (row.usageCount === undefined || row.usageCount === '')
            ) {
              errors.push({
                row: rowNumber,
                message: 'Either usageHours or usageCount must be provided',
                data: row,
              })
              return
            }

            // Add valid row
            valid.push({
              assetId: row.assetId?.trim(),
              assetName: row.assetName?.trim(),
              serialNumber: row.serialNumber?.trim(),
              date: date.toISOString().split('T')[0],
              usageHours:
                row.usageHours !== undefined && row.usageHours !== ''
                  ? parseFloat(row.usageHours)
                  : undefined,
              usageCount:
                row.usageCount !== undefined && row.usageCount !== ''
                  ? parseInt(row.usageCount, 10)
                  : undefined,
              notes: row.notes?.trim(),
            })
          })

          resolve({ valid, errors })
        },
        error: (error) => {
          resolve({
            valid: [],
            errors: [
              {
                row: 0,
                message: `CSV parsing error: ${error.message}`,
              },
            ],
          })
        },
      })
    }

    reader.onerror = () => {
      resolve({
        valid: [],
        errors: [
          {
            row: 0,
            message: 'Failed to read file',
          },
        ],
      })
    }

    reader.readAsText(file)
  })
}

/**
 * Parse date string in various formats
 */
function parseDate(dateString: string): Date | null {
  if (!dateString) return null

  const trimmed = dateString.trim()

  // Try ISO format (YYYY-MM-DD)
  let date = new Date(trimmed)
  if (!isNaN(date.getTime())) {
    return date
  }

  // Try DD/MM/YYYY or MM/DD/YYYY
  const parts = trimmed.split(/[\/\-]/)
  if (parts.length === 3) {
    const [part1, part2, part3] = parts.map((p) => parseInt(p, 10))

    // Try DD/MM/YYYY first (common in many countries)
    date = new Date(part3, part2 - 1, part1)
    if (!isNaN(date.getTime())) {
      return date
    }

    // Try MM/DD/YYYY (US format)
    date = new Date(part3, part1 - 1, part2)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

/**
 * Validate CSV file before parsing
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      valid: false,
      error: 'File must be a CSV file',
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    }
  }

  return { valid: true }
}

