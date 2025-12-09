'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Clock, Calendar, AlertCircle, FileText, Video, History } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Asset } from '@/lib/types'

export default function QRScanPage() {
  const params = useParams()
  const assetId = params.assetId as string
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assetsApi.getQRDetails(assetId, 'mobile')
        if (response.success && response.data) {
          setData(response.data)
        } else {
          setError(response.error || 'Failed to load asset data')
        }
      } catch (err) {
        setError('Failed to load asset data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (assetId) {
      fetchData()
    }
  }, [assetId])

  if (loading) {
    return (
      <div className='min-h-screen bg-bg-secondary flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-text-secondary'>Loading asset information...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className='min-h-screen bg-bg-secondary flex items-center justify-center p-4'>
        <div className='text-center'>
          <AlertCircle size={48} className='text-danger mx-auto mb-4' />
          <p className='text-text-primary font-semibold mb-2'>Asset Not Found</p>
          <p className='text-text-secondary'>{error || 'The asset you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-bg-secondary p-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-4'>
          <h1 className='text-2xl font-bold text-text-primary mb-2'>{data.title}</h1>
          <p className='text-sm text-text-secondary'>Asset ID: {assetId}</p>
        </div>

        {data.sections?.map((section: any, index: number) => (
          <div key={index} className='bg-white rounded-lg shadow-lg p-6 mb-4'>
            <h2 className='text-lg font-semibold text-text-primary mb-4'>{section.title}</h2>
            <div className='space-y-3'>
              {section.items?.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className='flex justify-between py-2 border-b border-border last:border-0'>
                  <span className='text-text-secondary'>{item.label}:</span>
                  <span className='text-text-primary font-medium'>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {data.actions && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-lg font-semibold text-text-primary mb-4'>Quick Actions</h2>
            <div className='space-y-2'>
              {data.actions.map((action: any, index: number) => (
                <a
                  key={index}
                  href={action.url}
                  className='block w-full p-3 bg-primary text-white rounded-lg text-center font-medium hover:bg-primary-dark transition-colors'
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

