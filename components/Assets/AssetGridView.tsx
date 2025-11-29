'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { QrCode, MapPin, Calendar, DollarSign } from 'lucide-react'
import { Asset } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

interface AssetGridViewProps {
  assets: Asset[]
  onAssetClick: (asset: Asset) => void
}

export default function AssetGridView({
  assets,
  onAssetClick,
}: AssetGridViewProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Maintenance':
        return 'warning'
      case 'Breakdown':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {assets.map((asset) => (
        <motion.div
          key={asset.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            hover
            padding='md'
            onClick={() => onAssetClick(asset)}
            className='h-full flex flex-col'
          >
            {/* Asset Image/Icon */}
            <div className='w-full h-40 bg-[var(--bg-tertiary)] rounded-lg mb-4 flex items-center justify-center overflow-hidden'>
              {asset.image ? (
                <img
                  src={asset.image}
                  alt={asset.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='text-6xl'>🏥</div>
              )}
            </div>

            {/* Asset Info */}
            <div className='flex-1 flex flex-col gap-3'>
              <div>
                <h3 className='font-semibold text-[var(--text-primary)] mb-1 line-clamp-1'>
                  {asset.name}
                </h3>
                <p className='text-sm text-[var(--text-secondary)] line-clamp-1'>
                  {asset.model} • {asset.manufacturer}
                </p>
              </div>

              <div className='flex items-center justify-between'>
                <Badge variant={getStatusVariant(asset.status) as any}>
                  {asset.status}
                </Badge>
                {asset.qrCode && (
                  <QrCode size={18} className='text-[var(--text-tertiary)]' />
                )}
              </div>

              <div className='space-y-2 pt-2 border-t border-[var(--border-color)]'>
                <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
                  <MapPin size={14} />
                  <span className='line-clamp-1'>{asset.location}</span>
                </div>
                <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
                  <Calendar size={14} />
                  <span>
                    PM: {new Date(asset.nextPmDate).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
                  <DollarSign size={14} />
                  <span>₹{asset.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
