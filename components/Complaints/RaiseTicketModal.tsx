'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { X, QrCode, Camera, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { useUser } from '@clerk/nextjs'
import { assetsApi } from '@/lib/api/assets'
import type { Asset } from '@/lib/types'

interface RaiseTicketModalProps {
  isOpen: boolean
  onClose: () => void
  initialAssetId?: string
}

export default function RaiseTicketModal({
  isOpen,
  onClose,
  initialAssetId,
}: RaiseTicketModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [isScanning, setIsScanning] = useState(false)
  const [assetId, setAssetId] = useState(initialAssetId || searchParams.get('assetId') || '')
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loadingAsset, setLoadingAsset] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
  })

  // Fetch asset details when assetId changes
  useEffect(() => {
    if (assetId && isOpen) {
      fetchAssetDetails()
    }
  }, [assetId, isOpen])

  const fetchAssetDetails = async () => {
    if (!assetId) return
    setLoadingAsset(true)
    try {
      const response = await assetsApi.getById(assetId)
      if (response && 'id' in response) {
        setAsset(response as Asset)
      }
    } catch (error) {
      console.error('Error fetching asset:', error)
      toast.error('Failed to load asset details')
    } finally {
      setLoadingAsset(false)
    }
  }

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setAssetId('AST-001 (MRI Scanner)')
      toast.success('Asset scanned successfully')
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assetId) {
      toast.error('Please select or scan an asset')
      return
    }

    if (!user) {
      toast.error('Please sign in to raise a complaint')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          reportedBy: user.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Complaint raised successfully!')
        // Reset form
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
        })
        setAssetId('')
        setAsset(null)
        onClose()
        // Refresh the page to show new complaint
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to raise complaint')
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      toast.error('Failed to raise complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black z-40'
            style={{ backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'
          >
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden'>
              <div className='p-6 border-b flex justify-between items-center bg-gray-50'>
                <h2 className='text-lg font-bold'>Report Breakdown</h2>
                <button
                  onClick={onClose}
                  className='p-2 hover:bg-gray-200 rounded-full'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='p-6'>
                {isScanning ? (
                  <div className='aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white mb-6 relative overflow-hidden'>
                    <motion.div
                      className='absolute top-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#22c55e]'
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <Camera size={48} className='mb-2 opacity-50' />
                    <p className='text-sm'>Scanning QR Code...</p>
                  </div>
                ) : (
                  <div className='mb-6'>
                    <label className='block text-sm font-medium text-text-primary mb-2'>
                      Asset ID
                    </label>
                    <div className='flex gap-2'>
                      <input
                        value={assetId}
                        onChange={(e) => {
                          setAssetId(e.target.value)
                          setAsset(null)
                        }}
                        placeholder='Enter Asset ID or Scan QR'
                        className='flex-1 p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
                      />
                      <button
                        onClick={handleScan}
                        type='button'
                        className='p-2 bg-bg-tertiary hover:bg-bg-hover rounded-md text-text-primary border border-border transition-colors'
                        title='Scan QR Code'
                      >
                        <QrCode size={20} />
                      </button>
                    </div>
                    {loadingAsset && (
                      <div className='mt-2 flex items-center gap-2 text-sm text-text-secondary'>
                        <Loader2 size={14} className='animate-spin' />
                        Loading asset details...
                      </div>
                    )}
                    {asset && !loadingAsset && (
                      <div className='mt-2 p-3 bg-primary-light rounded-md'>
                        <p className='text-sm font-medium text-text-primary'>{asset.name}</p>
                        <p className='text-xs text-text-secondary'>
                          {asset.model} • {asset.department} • {asset.location}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-1'>
                      Issue Title
                    </label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
                      placeholder='e.g. System Overheating'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-1'>
                      Description
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
                      placeholder='Describe the issue...'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-1'>
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as 'Low' | 'Medium' | 'High' | 'Critical',
                        })
                      }
                      className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none bg-white'
                    >
                      <option value='Low'>Low</option>
                      <option value='Medium'>Medium</option>
                      <option value='High'>High</option>
                      <option value='Critical'>Critical</option>
                    </select>
                  </div>

                  <Button
                    type='submit'
                    variant='primary'
                    className='w-full mt-2'
                    disabled={submitting || !assetId}
                    isLoading={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
