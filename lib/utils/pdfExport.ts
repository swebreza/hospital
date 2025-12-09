import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFExportOptions {
  title: string
  subtitle?: string
  headers: string[]
  data: Array<Record<string, unknown> | unknown[]>
  fileName: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'letter'
  footer?: string
}

/**
 * Export data to PDF
 */
export function exportToPDF(options: PDFExportOptions): Uint8Array {
  const {
    title,
    subtitle,
    headers,
    data,
    fileName,
    orientation = 'portrait',
    pageSize = 'a4',
    footer,
  } = options

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  })

  // Add title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 20)

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, 14, 28)
  }

  // Convert data to array format for autoTable
  const tableData: unknown[][] = []

  if (data.length > 0) {
    if (Array.isArray(data[0])) {
      // Data is already array of arrays
      tableData.push(...(data as unknown[][]))
    } else {
      // Data is array of objects, convert to arrays
      data.forEach((row) => {
        const obj = row as Record<string, unknown>
        const rowData = headers.map((header) => {
          const value = obj[header]
          if (value === null || value === undefined) {
            return ''
          }
          if (value instanceof Date) {
            return value.toLocaleDateString()
          }
          return String(value)
        })
        tableData.push(rowData)
      })
    }
  }

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: subtitle ? 35 : 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 30 },
  })

  // Add footer if provided
  if (footer) {
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const pageHeight = doc.internal.pageSize.height
      doc.text(footer, 14, pageHeight - 10)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 14,
        pageHeight - 10,
        { align: 'right' }
      )
    }
  }

  // Generate PDF
  return doc.output('arraybuffer') as unknown as Uint8Array
}

/**
 * Format date for PDF
 */
export function formatDateForPDF(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format currency for PDF
 */
export function formatCurrencyForPDF(value: number, currency: string = '₹'): string {
  return `${currency} ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format percentage for PDF
 */
export function formatPercentageForPDF(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

