'use client'

import React from 'react'
import Card from '@/components/ui/Card'
import ReportCharts from './ReportCharts'

interface ReportViewerProps {
  reportType: string
  reportData: unknown
  loading?: boolean
}

export default function ReportViewer({
  reportType,
  reportData,
  loading = false,
}: ReportViewerProps) {
  if (loading) {
    return (
      <Card padding="lg" className="text-center py-12">
        <p className="text-text-secondary">Loading report data...</p>
      </Card>
    )
  }

  if (!reportData) {
    return (
      <Card padding="lg" className="text-center py-12">
        <p className="text-text-secondary">No report data available</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <ReportCharts reportType={reportType} reportData={reportData} />
      
      {/* Report-specific content will be rendered here */}
      <Card padding="lg">
        <pre className="text-xs overflow-auto">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      </Card>
    </div>
  )
}

