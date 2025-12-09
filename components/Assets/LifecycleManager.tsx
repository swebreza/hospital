'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Asset, LifecycleState } from '@/lib/types'
import Button from '@/components/ui/Button'

interface LifecycleManagerProps {
  asset: Asset
  onUpdate?: () => void
}

export default function LifecycleManager({ asset, onUpdate }: LifecycleManagerProps) {
  const [lifecycleState, setLifecycleState] = useState<LifecycleState | ''>(
    asset.lifecycleState || ''
  )
  const [updating, setUpdating] = useState(false)

  const handleStateChange = async (newState: LifecycleState) => {
    setUpdating(true)
    try {
      await assetsApi.updateLifecycleState(asset.id, {
        lifecycleState: newState,
      })
      setLifecycleState(newState)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to update lifecycle state:', error)
    } finally {
      setUpdating(false)
    }
  }

  const states: LifecycleState[] = [
    'Active',
    'In-Service',
    'Spare',
    'Under-Service',
    'Demo',
    'Condemned',
    'Disposed',
  ]

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-text-primary mb-4'>
          Lifecycle Management
        </h3>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-bg-secondary rounded-lg p-4 border border-border'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar size={18} className='text-primary' />
              <span className='text-xs text-text-secondary'>Age</span>
            </div>
            <p className='text-xl font-bold text-text-primary'>
              {asset.ageYears?.toFixed(1) || 'N/A'} years
            </p>
          </div>

          <div className='bg-bg-secondary rounded-lg p-4 border border-border'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingDown size={18} className='text-warning' />
              <span className='text-xs text-text-secondary'>Downtime</span>
            </div>
            <p className='text-xl font-bold text-text-primary'>
              {asset.totalDowntimeHours?.toFixed(0) || 0} hrs
            </p>
          </div>

          <div className='bg-bg-secondary rounded-lg p-4 border border-border'>
            <div className='flex items-center gap-2 mb-2'>
              <DollarSign size={18} className='text-danger' />
              <span className='text-xs text-text-secondary'>Service Cost</span>
            </div>
            <p className='text-xl font-bold text-text-primary'>
              ₹ {asset.totalServiceCost?.toLocaleString() || '0'}
            </p>
          </div>

          <div className='bg-bg-secondary rounded-lg p-4 border border-border'>
            <div className='flex items-center gap-2 mb-2'>
              <AlertTriangle size={18} className='text-warning' />
              <span className='text-xs text-text-secondary'>Utilization</span>
            </div>
            <p className='text-xl font-bold text-text-primary'>
              {asset.utilizationPercentage?.toFixed(0) || 'N/A'}%
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-border p-4'>
          <label className='block text-sm font-semibold text-text-primary mb-2'>
            Lifecycle State
          </label>
          <div className='flex flex-wrap gap-2'>
            {states.map((state) => (
              <button
                key={state}
                onClick={() => handleStateChange(state)}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  lifecycleState === state
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text-primary hover:bg-bg-hover'
                } disabled:opacity-50`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {asset.replacementRecommended && (
          <div className='bg-warning-light border border-warning rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle size={20} className='text-warning flex-shrink-0 mt-0.5' />
              <div>
                <h4 className='font-semibold text-warning mb-1'>
                  Replacement Recommended
                </h4>
                {asset.replacementReason && (
                  <p className='text-sm text-text-secondary'>{asset.replacementReason}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

