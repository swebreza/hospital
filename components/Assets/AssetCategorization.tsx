'use client'

import React from 'react'
import { Filter, Tag } from 'lucide-react'
import type { Asset } from '@/lib/types'

interface AssetCategorizationProps {
  assets: Asset[]
  onCategoryChange?: (category: {
    type?: string
    modality?: string
    criticality?: string
    oem?: string
  }) => void
}

export default function AssetCategorization({
  assets,
  onCategoryChange,
}: AssetCategorizationProps) {
  // Extract unique values for each category
  const assetTypes = Array.from(new Set(assets.map((a) => a.assetType).filter(Boolean)))
  const modalities = Array.from(new Set(assets.map((a) => a.modality).filter(Boolean)))
  const criticalities = Array.from(
    new Set(assets.map((a) => a.criticality).filter(Boolean))
  )
  const oems = Array.from(new Set(assets.map((a) => a.oem).filter(Boolean)))

  return (
    <div className='bg-white rounded-lg border border-border p-6'>
      <div className='flex items-center gap-2 mb-4'>
        <Tag size={20} className='text-primary' />
        <h3 className='font-semibold text-text-primary'>Asset Categorization</h3>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div>
          <label className='text-xs text-text-secondary font-medium mb-2 block'>
            Asset Types ({assetTypes.length})
          </label>
          <div className='space-y-1'>
            {assetTypes.map((type) => (
              <div
                key={type}
                className='text-sm text-text-primary px-2 py-1 bg-bg-secondary rounded'
              >
                {type}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className='text-xs text-text-secondary font-medium mb-2 block'>
            Modalities ({modalities.length})
          </label>
          <div className='space-y-1'>
            {modalities.map((modality) => (
              <div
                key={modality}
                className='text-sm text-text-primary px-2 py-1 bg-bg-secondary rounded'
              >
                {modality}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className='text-xs text-text-secondary font-medium mb-2 block'>
            Criticality Levels ({criticalities.length})
          </label>
          <div className='space-y-1'>
            {criticalities.map((criticality) => (
              <div
                key={criticality}
                className='text-sm text-text-primary px-2 py-1 bg-bg-secondary rounded'
              >
                {criticality}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className='text-xs text-text-secondary font-medium mb-2 block'>
            OEMs ({oems.length})
          </label>
          <div className='space-y-1 max-h-32 overflow-y-auto'>
            {oems.map((oem) => (
              <div
                key={oem}
                className='text-sm text-text-primary px-2 py-1 bg-bg-secondary rounded'
              >
                {oem}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

