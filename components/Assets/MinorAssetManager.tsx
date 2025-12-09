'use client'

import React, { useState, useEffect } from 'react'
import { Package, Plus, Edit } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Asset, PaginatedResponse } from '@/lib/types'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

export default function MinorAssetManager() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadAssets()
  }, [page])

  const loadAssets = async () => {
    setLoading(true)
    try {
      const response = await assetsApi.getMinorAssets(page, 20)
      if (response.data) {
        setAssets(response.data)
        setTotal(response.pagination.total)
      }
    } catch (error) {
      console.error('Failed to load minor assets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2' />
        <p className='text-text-secondary'>Loading minor assets...</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-text-primary'>Minor Assets</h2>
          <p className='text-text-secondary'>
            Simplified tracking for low-value, frequently moved equipment
          </p>
        </div>
        <Button variant='primary' leftIcon={Plus}>
          Add Minor Asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title='No minor assets found'
          description='Get started by adding your first minor asset'
          actionLabel='Add Minor Asset'
          onAction={() => {}}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {assets.map((asset) => (
            <div
              key={asset.id}
              className='bg-white rounded-lg border border-border p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold text-text-primary'>{asset.name}</h3>
                <Button variant='outline' size='sm' leftIcon={Edit}>
                  Edit
                </Button>
              </div>
              <p className='text-sm text-text-secondary mb-2'>{asset.id}</p>
              <div className='space-y-1 text-xs text-text-secondary'>
                <p>
                  <span className='font-medium'>Department:</span> {asset.department}
                </p>
                <p>
                  <span className='font-medium'>Location:</span> {asset.location || 'N/A'}
                </p>
                {asset.value && (
                  <p>
                    <span className='font-medium'>Value:</span> ₹{' '}
                    {asset.value.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

