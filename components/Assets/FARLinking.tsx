'use client'

import React, { useState } from 'react'
import { Link, Search, CheckCircle, XCircle } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Asset } from '@/lib/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface FARLinkingProps {
  asset: Asset
  onUpdate?: () => void
}

export default function FARLinking({ asset, onUpdate }: FARLinkingProps) {
  const [farNumber, setFarNumber] = useState(asset.farNumber || '')
  const [validating, setValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleValidate = async () => {
    if (!farNumber.trim()) {
      setIsValid(false)
      return
    }

    setValidating(true)
    try {
      // Check if FAR number already exists for another asset
      const response = await assetsApi.getAll(1, 1, { farNumber })
      if (response.data && response.data.length > 0) {
        const existingAsset = response.data[0]
        if (existingAsset.id !== asset.id) {
          setIsValid(false)
          return
        }
      }
      setIsValid(true)
    } catch (error) {
      setIsValid(false)
    } finally {
      setValidating(false)
    }
  }

  const handleSave = async () => {
    if (!isValid) {
      handleValidate()
      return
    }

    try {
      await assetsApi.update(asset.id, { farNumber })
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to update FAR number:', error)
    }
  }

  return (
    <div className='bg-white rounded-lg border border-border p-6'>
      <div className='flex items-center gap-2 mb-4'>
        <Link size={20} className='text-primary' />
        <h3 className='font-semibold text-text-primary'>FAR Number Linking</h3>
      </div>

      <p className='text-sm text-text-secondary mb-4'>
        Link this asset to its Fixed Asset Register (FAR) number for financial alignment and
        reporting.
      </p>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-semibold text-text-primary mb-2'>
            FAR Number
          </label>
          <div className='flex gap-2'>
            <Input
              value={farNumber}
              onChange={(e) => {
                setFarNumber(e.target.value)
                setIsValid(null)
              }}
              placeholder='Enter FAR number'
              className='flex-1'
            />
            <Button
              variant='outline'
              onClick={handleValidate}
              disabled={validating || !farNumber.trim()}
              leftIcon={Search}
            >
              Validate
            </Button>
          </div>
          {isValid !== null && (
            <div className='mt-2 flex items-center gap-2'>
              {isValid ? (
                <>
                  <CheckCircle size={16} className='text-success' />
                  <span className='text-xs text-success'>FAR number is available</span>
                </>
              ) : (
                <>
                  <XCircle size={16} className='text-danger' />
                  <span className='text-xs text-danger'>
                    FAR number already exists or is invalid
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {asset.farNumber && (
          <div className='bg-bg-secondary rounded-lg p-3'>
            <p className='text-xs text-text-secondary mb-1'>Current FAR Number</p>
            <p className='text-sm font-medium text-text-primary'>{asset.farNumber}</p>
          </div>
        )}

        <Button
          variant='primary'
          onClick={handleSave}
          disabled={!isValid || farNumber === asset.farNumber}
          className='w-full'
        >
          Save FAR Number
        </Button>
      </div>
    </div>
  )
}

