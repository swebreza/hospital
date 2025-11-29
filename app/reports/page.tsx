'use client'

import React, { useState } from 'react'
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
// import Select from '@/components/ui/Select' // Not used yet
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

const reportTemplates = [
  {
    id: 'pm-compliance',
    name: 'PM Compliance Report',
    description: 'Preventive maintenance compliance and completion rates',
    icon: BarChart3,
    category: 'Maintenance',
  },
  {
    id: 'calibration-compliance',
    name: 'Calibration Compliance Report',
    description: 'Calibration status and expiry tracking',
    icon: Calendar,
    category: 'Compliance',
  },
  {
    id: 'downtime-trends',
    name: 'Downtime Trends',
    description: 'Equipment downtime analysis and trends',
    icon: TrendingUp,
    category: 'Analytics',
  },
  {
    id: 'asset-insights',
    name: 'Asset Insights',
    description: 'Comprehensive asset performance and utilization',
    icon: FileText,
    category: 'Assets',
  },
  {
    id: 'inventory-summary',
    name: 'Inventory Summary',
    description: 'Stock levels, valuation, and movement',
    icon: FileText,
    category: 'Inventory',
  },
  {
    id: 'capex-overview',
    name: 'CAPEX Overview',
    description: 'Capital expenditure status and ROI analysis',
    icon: FileText,
    category: 'Finance',
  },
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const categories = [
    'all',
    ...Array.from(new Set(reportTemplates.map((r) => r.category))),
  ]

  const filteredReports =
    selectedCategory === 'all'
      ? reportTemplates
      : reportTemplates.filter((r) => r.category === selectedCategory)

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId)
    const report = reportTemplates.find((r) => r.id === reportId)
    toast.success('Report generated successfully!', {
      description: `${report?.name} is ready for viewing`,
    })
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!selectedReport) {
      toast.error('Please generate a report first')
      return
    }
    const report = reportTemplates.find((r) => r.id === selectedReport)
    toast.success(`Exporting to ${format.toUpperCase()}...`, {
      description: `${report?.name} will be downloaded shortly`,
    })
    // Simulate download
    setTimeout(() => {
      toast.success('Export completed!', {
        description: 'Check your downloads folder',
      })
    }, 2000)
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-text-primary'>
            Reports & Analytics
          </h1>
          <p className='text-sm text-text-secondary mt-1'>
            Generate comprehensive reports and analytics
          </p>
        </div>
        {selectedReport && (
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              leftIcon={Download}
              onClick={() => handleExport('excel')}
            >
              Export Excel
            </Button>
            <Button
              variant='outline'
              size='sm'
              leftIcon={Download}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className='flex items-center gap-2 flex-wrap'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Report Templates */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredReports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} hover padding='md' className='flex flex-col'>
              <div className='flex items-start gap-4 mb-4'>
                <div className='p-3 bg-primary-light rounded-lg'>
                  <Icon size={24} className='text-primary' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-text-primary mb-1'>
                    {report.name}
                  </h3>
                  <p className='text-xs text-text-secondary'>
                    {report.description}
                  </p>
                </div>
              </div>
              <div className='mt-auto pt-4 border-t border-border'>
                <Button
                  variant='primary'
                  size='sm'
                  className='w-full'
                  onClick={() => handleGenerateReport(report.id)}
                >
                  Generate Report
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredReports.length === 0 && (
        <EmptyState
          icon={FileText}
          title='No reports found'
          description='Try selecting a different category'
        />
      )}
    </div>
  )
}
