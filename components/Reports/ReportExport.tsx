'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

interface ReportExportProps {
  reportType: string
  reportTitle: string
  dateFrom?: string
  dateTo?: string
  disabled?: boolean
}

export default function ReportExport({
  reportType,
  reportTitle,
  dateFrom,
  dateTo,
  disabled = false,
}: ReportExportProps) {
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(format)

    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          format,
          dateFrom,
          dateTo,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${reportTitle}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${format.toUpperCase()} export completed`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to export report'
      )
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={exporting === 'excel' ? Loader2 : FileSpreadsheet}
        onClick={() => handleExport('excel')}
        disabled={disabled || exporting !== null}
        className={exporting === 'excel' ? 'animate-spin' : ''}
      >
        Export Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        leftIcon={exporting === 'pdf' ? Loader2 : FileText}
        onClick={() => handleExport('pdf')}
        disabled={disabled || exporting !== null}
        className={exporting === 'pdf' ? 'animate-spin' : ''}
      >
        Export PDF
      </Button>
    </div>
  )
}

