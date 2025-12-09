'use client'

import React, { useState } from 'react'
import { Workflow, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Asset, LifecycleState } from '@/lib/types'
import Button from '@/components/ui/Button'

interface LifecycleStateManagerProps {
  asset: Asset
  onUpdate?: () => void
}

const stateTransitions: Record<LifecycleState, LifecycleState[]> = {
  Active: ['In-Service', 'Spare', 'Under-Service', 'Condemned', 'Disposed'],
  'In-Service': ['Active', 'Spare', 'Under-Service'],
  Spare: ['Active', 'In-Service'],
  'Under-Service': ['Active', 'In-Service', 'Condemned'],
  Demo: ['Active', 'Disposed'],
  Condemned: ['Disposed'],
  Disposed: [], // Terminal state
}

export default function LifecycleStateManager({
  asset,
  onUpdate,
}: LifecycleStateManagerProps) {
  const [selectedState, setSelectedState] = useState<LifecycleState | ''>(
    asset.lifecycleState || ''
  )
  const [updating, setUpdating] = useState(false)

  const currentState = asset.lifecycleState || 'Active'
  const availableTransitions = stateTransitions[currentState] || []

  const handleStateChange = async (newState: LifecycleState) => {
    if (!confirm(`Are you sure you want to change the lifecycle state to "${newState}"?`)) {
      return
    }

    setUpdating(true)
    try {
      await assetsApi.updateLifecycleState(asset.id, {
        lifecycleState: newState,
        performedBy: 'current-user-id', // TODO: Get from auth context
      })
      setSelectedState(newState)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to update lifecycle state:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className='bg-white rounded-lg border border-border p-6'>
      <div className='flex items-center gap-2 mb-4'>
        <Workflow size={20} className='text-primary' />
        <h3 className='font-semibold text-text-primary'>Lifecycle State Management</h3>
      </div>

      <div className='mb-4'>
        <p className='text-sm text-text-secondary mb-2'>Current State:</p>
        <div className='inline-flex items-center gap-2 px-3 py-1 bg-primary-light text-primary rounded-full'>
          <CheckCircle size={16} />
          <span className='font-medium'>{currentState}</span>
        </div>
      </div>

      {availableTransitions.length > 0 ? (
        <div>
          <p className='text-sm text-text-secondary mb-3'>Available Transitions:</p>
          <div className='flex flex-wrap gap-2'>
            {availableTransitions.map((state) => (
              <button
                key={state}
                onClick={() => handleStateChange(state)}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedState === state
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text-primary hover:bg-bg-hover'
                } disabled:opacity-50`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2 p-3 bg-warning-light border border-warning rounded-lg'>
          <AlertCircle size={18} className='text-warning' />
          <p className='text-sm text-warning'>
            No state transitions available. This is a terminal state.
          </p>
        </div>
      )}

      <div className='mt-4 pt-4 border-t border-border'>
        <p className='text-xs text-text-secondary mb-2'>State Change History</p>
        <p className='text-xs text-text-tertiary'>
          All state changes are logged in the asset history for audit purposes.
        </p>
      </div>
    </div>
  )
}

