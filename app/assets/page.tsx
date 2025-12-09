'use client'

import React, { useState } from 'react'
import { Grid, List, Plus, Upload, Download } from 'lucide-react'
import { useStore } from '@/lib/store'
import AssetTable from '@/components/Assets/AssetTable'
import AssetGridView from '@/components/Assets/AssetGridView'
import AddAssetModal from '@/components/Assets/AddAssetModal'
import BulkUploadModal from '@/components/Assets/BulkUploadModal'
import AssetFilters, { FilterState } from '@/components/Assets/AssetFilters'
import BulkActions from '@/components/Assets/BulkActions'
import Button from '@/components/ui/Button'
import { Asset } from '@/lib/types'
import { toast } from 'sonner'
import EmptyState from '@/components/ui/EmptyState'
import { Package } from 'lucide-react'

export default function AssetsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    manufacturer: '',
    dateFrom: '',
    dateTo: '',
    assetType: '',
    modality: '',
    criticality: '',
    oem: '',
    lifecycleState: '',
    isMinorAsset: '',
    farNumber: '',
    replacementRecommended: '',
  })

  const { assets } = useStore()

  // Apply filters
  const filteredAssets = assets.filter((asset) => {
    if (
      filters.search &&
      !(
        asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(filters.search.toLowerCase())
      )
    )
      return false

    if (filters.status && asset.status !== filters.status) return false
    if (filters.department && asset.department !== filters.department)
      return false
    if (
      filters.manufacturer &&
      asset.manufacturer.toLowerCase() !== filters.manufacturer.toLowerCase()
    )
      return false
    if (filters.assetType && asset.assetType !== filters.assetType) return false
    if (
      filters.modality &&
      asset.modality?.toLowerCase() !== filters.modality.toLowerCase()
    )
      return false
    if (filters.criticality && asset.criticality !== filters.criticality)
      return false
    if (filters.oem && asset.oem?.toLowerCase() !== filters.oem.toLowerCase())
      return false
    if (
      filters.lifecycleState &&
      asset.lifecycleState !== filters.lifecycleState
    )
      return false
    if (filters.isMinorAsset) {
      const isMinor = filters.isMinorAsset === 'true'
      if (asset.isMinorAsset !== isMinor) return false
    }
    if (
      filters.farNumber &&
      asset.farNumber?.toLowerCase() !== filters.farNumber.toLowerCase()
    )
      return false
    if (filters.replacementRecommended) {
      const shouldReplace = filters.replacementRecommended === 'true'
      if (asset.replacementRecommended !== shouldReplace) return false
    }

    return true
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleFilterReset = () => {
    setFilters({
      search: '',
      status: '',
      department: '',
      manufacturer: '',
      dateFrom: '',
      dateTo: '',
      assetType: '',
      modality: '',
      criticality: '',
      oem: '',
      lifecycleState: '',
      isMinorAsset: '',
      farNumber: '',
      replacementRecommended: '',
    })
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      // Get assets to export (use filtered assets if available, otherwise all)
      const assetsToExport = filteredAssets.length > 0 ? filteredAssets : assets

      if (assetsToExport.length === 0) {
        toast.error('No assets to export')
        return
      }

      if (format === 'csv') {
        // Export to CSV
        const headers = [
          'Asset ID',
          'Name',
          'Model',
          'Manufacturer',
          'Serial Number',
          'Department',
          'Location',
          'Status',
          'Type',
          'Criticality',
          'Lifecycle State',
          'FAR Number',
          'Purchase Date',
          'Next PM Date',
          'Value',
          'Age (Years)',
        ]

        // Convert data to CSV format
        const csvRows = [
          headers.join(','), // Header row
          ...assetsToExport.map((asset) => {
            const row = [
              asset.id,
              `"${(asset.name || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
              `"${(asset.model || '').replace(/"/g, '""')}"`,
              `"${(asset.manufacturer || '').replace(/"/g, '""')}"`,
              `"${(asset.serialNumber || '').replace(/"/g, '""')}"`,
              `"${(asset.department || '').replace(/"/g, '""')}"`,
              `"${(asset.location || '').replace(/"/g, '""')}"`,
              `"${(asset.status || '').replace(/"/g, '""')}"`,
              `"${(asset.assetType || '').replace(/"/g, '""')}"`,
              `"${(asset.criticality || '').replace(/"/g, '""')}"`,
              `"${(asset.lifecycleState || asset.status || '').replace(
                /"/g,
                '""'
              )}"`,
              `"${(asset.farNumber || '').replace(/"/g, '""')}"`,
              asset.purchaseDate || '',
              asset.nextPmDate || '',
              asset.value || 0,
              asset.ageYears ? asset.ageYears.toFixed(1) : '',
            ]
            return row.join(',')
          }),
        ]

        const csvContent = csvRows.join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute(
          'download',
          `assets_export_${new Date().toISOString().split('T')[0]}.csv`
        )
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success(`Exported ${assetsToExport.length} asset(s) to CSV`)
      } else if (format === 'pdf') {
        // Export to PDF
        const jsPDF = (await import('jspdf')).default

        const headers = [
          'ID',
          'Name',
          'Model',
          'Department',
          'Status',
          'Type',
          'Criticality',
          'Purchase Date',
          'Value',
        ]

        const data = assetsToExport.map((asset) => [
          asset.id,
          asset.name,
          asset.model || '',
          asset.department,
          asset.status,
          asset.assetType || '',
          asset.criticality || '',
          asset.purchaseDate || '',
          asset.value ? `₹${asset.value.toLocaleString('en-IN')}` : '',
        ])

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        })

        // Add title
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Assets Export', 14, 15)

        // Add date
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)

        // Add table using autoTable
        const autoTable = (await import('jspdf-autotable')).default
        autoTable(pdf, {
          head: [headers],
          body: data,
          startY: 28,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        })

        // Save PDF
        pdf.save(`assets_export_${new Date().toISOString().split('T')[0]}.pdf`)

        toast.success(`Exported ${assetsToExport.length} asset(s) to PDF`)
      }
    } catch (error: unknown) {
      console.error('Export error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Export failed'
      toast.error(errorMessage)
    }
  }

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedAssets.length} asset(s)?`
      )
    ) {
      // TODO: Implement bulk delete
      toast.success(`${selectedAssets.length} asset(s) deleted`)
      setSelectedAssets([])
    }
  }

  const handleBulkGenerateQR = () => {
    // TODO: Implement bulk QR generation
    toast.success(
      `Generating QR codes for ${selectedAssets.length} asset(s)...`
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2'>
        <div>
          <h1 className='text-3xl font-bold text-text-primary mb-2'>
            Asset Management
          </h1>
          <p className='text-base text-text-secondary'>
            Manage and track all biomedical equipment
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            leftIcon={Upload}
            onClick={() => setIsBulkUploadModalOpen(true)}
          >
            Import CSV
          </Button>
          <div className='relative'>
            <Button
              variant='outline'
              size='sm'
              leftIcon={Download}
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              Export
            </Button>
            {showExportMenu && (
              <>
                <div
                  className='fixed inset-0 z-40'
                  onClick={() => setShowExportMenu(false)}
                />
                <div className='absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border z-50'>
                  <button
                    onClick={() => {
                      handleExport('csv')
                      setShowExportMenu(false)
                    }}
                    className='w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-hover rounded-t-lg transition-colors'
                  >
                    Export to CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExport('pdf')
                      setShowExportMenu(false)
                    }}
                    className='w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-hover rounded-b-lg transition-colors'
                  >
                    Export to PDF
                  </button>
                </div>
              </>
            )}
          </div>
          <Button
            variant='primary'
            leftIcon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Asset
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <AssetFilters
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </div>
        <div className='flex items-center gap-1 bg-bg-tertiary p-1 rounded-lg border border-border'>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-md transition-all ${
              viewMode === 'table'
                ? 'bg-white shadow-md text-primary scale-105'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-md text-primary scale-105'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <BulkActions
          selectedAssets={selectedAssets}
          onExport={handleExport}
          onDelete={handleBulkDelete}
          onGenerateQR={handleBulkGenerateQR}
          onClearSelection={() => setSelectedAssets([])}
        />
      )}

      {/* Content */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={Package}
          title='No assets found'
          description={
            Object.values(filters).some((v) => v)
              ? 'Try adjusting your filters to see more results'
              : 'Get started by adding your first asset'
          }
          actionLabel='Add New Asset'
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        <AssetTable
          assets={filteredAssets}
          selectedAssets={selectedAssets}
          onSelectionChange={setSelectedAssets}
        />
      ) : (
        <AssetGridView
          assets={filteredAssets}
          onAssetClick={() => {
            // Open asset drawer - TODO: implement asset drawer
          }}
        />
      )}

      {/* Modals */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={() => {
          // Refresh assets list
          window.location.reload()
        }}
      />
    </div>
  )
}
