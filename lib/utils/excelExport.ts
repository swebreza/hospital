import * as XLSX from 'xlsx'

export interface ExcelExportOptions {
  sheetName?: string
  headers?: string[]
  data: Array<Record<string, unknown> | unknown[]>
  fileName: string
}

/**
 * Export data to Excel file
 */
export function exportToExcel(options: ExcelExportOptions): Buffer {
  const { sheetName = 'Sheet1', headers, data, fileName } = options

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Convert data to worksheet
  let worksheet: XLSX.WorkSheet

  if (headers && data.length > 0 && Array.isArray(data[0])) {
    // If data is array of arrays, add headers
    const dataWithHeaders = [headers, ...(data as unknown[][])]
    worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders)
  } else if (headers) {
    // If data is array of objects with headers
    worksheet = XLSX.utils.json_to_sheet(data as Array<Record<string, unknown>>, {
      header: headers,
    })
  } else if (data.length > 0 && Array.isArray(data[0])) {
    // If data is array of arrays without headers
    worksheet = XLSX.utils.aoa_to_sheet(data as unknown[][])
  } else {
    // If data is array of objects, auto-detect headers
    worksheet = XLSX.utils.json_to_sheet(data as Array<Record<string, unknown>>)
  }

  // Set column widths
  const maxWidth = 50
  const colWidths: Array<{ wch: number }> = []

  if (worksheet['!ref']) {
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxLen = 10
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellAddress]
        if (cell && cell.v) {
          const cellLength = String(cell.v).length
          if (cellLength > maxLen) {
            maxLen = Math.min(cellLength, maxWidth)
          }
        }
      }
      colWidths.push({ wch: maxLen })
    }
    worksheet['!cols'] = colWidths
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate buffer
  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  })

  return buffer
}

/**
 * Export multiple sheets to Excel
 */
export function exportMultipleSheets(
  sheets: Array<{ name: string; headers?: string[]; data: Array<Record<string, unknown> | unknown[]> }>,
  fileName: string
): Buffer {
  const workbook = XLSX.utils.book_new()

  sheets.forEach((sheet) => {
    let worksheet: XLSX.WorkSheet

    if (sheet.headers && sheet.data.length > 0 && Array.isArray(sheet.data[0])) {
      const dataWithHeaders = [sheet.headers, ...(sheet.data as unknown[][])]
      worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders)
    } else if (sheet.headers) {
      worksheet = XLSX.utils.json_to_sheet(sheet.data as Array<Record<string, unknown>>, {
        header: sheet.headers,
      })
    } else if (sheet.data.length > 0 && Array.isArray(sheet.data[0])) {
      worksheet = XLSX.utils.aoa_to_sheet(sheet.data as unknown[][])
    } else {
      worksheet = XLSX.utils.json_to_sheet(sheet.data as Array<Record<string, unknown>>)
    }

    // Set column widths
    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref'])
      const colWidths: Array<{ wch: number }> = []
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxLen = 10
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = worksheet[cellAddress]
          if (cell && cell.v) {
            const cellLength = String(cell.v).length
            if (cellLength > maxLen) {
              maxLen = Math.min(cellLength, 50)
            }
          }
        }
        colWidths.push({ wch: maxLen })
      }
      worksheet['!cols'] = colWidths
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  })

  return buffer
}

/**
 * Format date for Excel
 */
export function formatDateForExcel(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format number for Excel
 */
export function formatNumberForExcel(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

