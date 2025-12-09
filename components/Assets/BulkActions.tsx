'use client'

import React from 'react'
import { Download, Trash2, FileText, QrCode } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Asset } from '@/lib/types'

interface BulkActionsProps {
  selectedAssets: Asset[]
  onExport: (format: 'csv' | 'pdf') => void
  onDelete: () => void
  onGenerateQR: () => void
  onClearSelection: () => void
}

export default function BulkActions({
  selectedAssets,
  onExport,
  onDelete,
  onGenerateQR,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedAssets.length === 0) return null

  return (
    <div className='flex items-center gap-3 p-4 bg-primary-lighter border border-primary-light rounded-lg'>
      <div className='flex-1'>
        <p className='text-sm font-medium text-primary'>
          {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''}{' '}
          selected
        </p>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onGenerateQR}
          leftIcon={QrCode}
        >
          Generate QR
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onExport('csv')}
          leftIcon={Download}
        >
          Export CSV
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onExport('pdf')}
          leftIcon={FileText}
        >
          Export PDF
        </Button>

        <Button variant='danger' size='sm' onClick={onDelete} leftIcon={Trash2}>
          Delete
        </Button>

        <button
          onClick={onClearSelection}
          className='text-sm text-text-secondary hover:text-text-primary px-2 transition-colors'
        >
          Clear
        </button>
      </div>
    </div>
  )
}
