'use client'

import React, { useState, useEffect } from 'react'
import { X, FileText, Clock, File, Download, QrCode } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Asset } from '@/lib/store'
import Button from '@/components/ui/Button'
import AssetHistoryTimeline from './AssetHistoryTimeline'
import { assetsApi } from '@/lib/api/assets'
import type { AssetHistory } from '@/lib/types'
import QRCodeGenerator from './QRCodeGenerator'
import { toast } from 'sonner'

interface AssetDrawerProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset | null
}

export default function AssetDrawer({
  isOpen,
  onClose,
  asset,
}: AssetDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'docs' | 'qr'>(
    'info'
  )
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [loadingQR, setLoadingQR] = useState(false)
  const [history, setHistory] = useState<AssetHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const loadedAssetIdRef = React.useRef<string | null>(null)

  // Fetch QR code when QR tab is opened
  useEffect(() => {
    if (asset?.id && activeTab === 'qr' && !qrCodeData) {
      setLoadingQR(true)
      assetsApi
        .generateQR(asset.id)
        .then((response) => {
          if (response.success && response.data) {
            setQrCodeData(response.data.qrCode || asset.qrCode || null)
          }
        })
        .catch((error) => {
          console.error('Failed to load QR code:', error)
          // Fallback to asset.qrCode if available
          setQrCodeData(asset.qrCode || null)
        })
        .finally(() => {
          setLoadingQR(false)
        })
    } else if (asset?.qrCode && activeTab === 'qr' && !qrCodeData) {
      setQrCodeData(asset.qrCode)
    }
  }, [asset?.id, activeTab, qrCodeData, asset?.qrCode])

  useEffect(() => {
    // Only fetch if we have an asset ID, are on history tab, and haven't loaded this asset yet
    if (asset?.id && activeTab === 'history' && asset.id !== loadedAssetIdRef.current) {
      setLoadingHistory(true)
      loadedAssetIdRef.current = asset.id
      assetsApi
        .getHistory(asset.id, { groupBy: 'timeline' })
        .then((response) => {
          if (response.success && response.data) {
            if (Array.isArray(response.data)) {
              setHistory(response.data)
            } else {
              // If grouped by type, flatten it
              const allHistory: AssetHistory[] = []
              Object.values(response.data).forEach((events) => {
                if (Array.isArray(events)) {
                  allHistory.push(...events)
                }
              })
              setHistory(allHistory.sort((a, b) => 
                new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
              ))
            }
          }
        })
        .catch((error) => {
          console.error('Failed to load history:', error)
          loadedAssetIdRef.current = null // Reset on error so we can retry
        })
        .finally(() => {
          setLoadingHistory(false)
        })
    } else if (!asset?.id || activeTab !== 'history') {
      // Clear history when switching tabs or closing drawer
      setHistory([])
      loadedAssetIdRef.current = null
    }
  }, [asset?.id, activeTab])

  if (!asset) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040]'
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed right-0 top-0 h-full bg-white shadow-2xl z-[1050] flex flex-col w-full sm:w-[500px]'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='p-6 border-b border-border flex justify-between items-start bg-bg-secondary'>
              <div>
                <h2 className='text-xl font-bold text-text-primary'>
                  {asset.name}
                </h2>
                <p className='text-sm text-text-secondary'>
                  {asset.id} • {asset.department}
                </p>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-bg-hover rounded-full transition-colors'
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className='flex border-b border-border px-6'>
              {[
                { id: 'info', label: 'Information', icon: FileText },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'docs', label: 'Documents', icon: File },
                { id: 'qr', label: 'QR Code', icon: QrCode },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6 scrollbar-thin'>
              {activeTab === 'info' && (
                <div className='space-y-6'>
                  <div className='grid grid-cols-2 gap-4'>
                    <InfoItem label='Manufacturer' value={asset.manufacturer} />
                    <InfoItem label='Model' value={asset.model} />
                    <InfoItem
                      label='Serial Number'
                      value={asset.serialNumber}
                    />
                    <InfoItem
                      label='Purchase Date'
                      value={asset.purchaseDate}
                    />
                    <InfoItem label='Next PM Date' value={asset.nextPmDate} />
                    <InfoItem
                      label='Value'
                      value={`₹ ${asset.value.toLocaleString()}`}
                    />
                    <InfoItem label='Location' value={asset.location} />
                    <InfoItem label='Status' value={asset.status} isBadge />
                    {asset.assetType && (
                      <InfoItem label='Asset Type' value={asset.assetType} />
                    )}
                    {asset.modality && (
                      <InfoItem label='Modality' value={asset.modality} />
                    )}
                    {asset.criticality && (
                      <InfoItem
                        label='Criticality'
                        value={asset.criticality}
                        isBadge
                      />
                    )}
                    {asset.oem && <InfoItem label='OEM' value={asset.oem} />}
                    {asset.farNumber && (
                      <InfoItem label='FAR Number' value={asset.farNumber} />
                    )}
                    {asset.lifecycleState && (
                      <InfoItem
                        label='Lifecycle State'
                        value={asset.lifecycleState}
                        isBadge
                      />
                    )}
                    {asset.ageYears !== undefined && (
                      <InfoItem
                        label='Age'
                        value={`${asset.ageYears.toFixed(1)} years`}
                      />
                    )}
                  </div>

                  <div>
                    <h3 className='font-medium mb-2 text-text-primary'>
                      Description
                    </h3>
                    <p className='text-sm text-text-secondary leading-relaxed'>
                      High-performance biomedical equipment used for critical
                      patient care. Regular maintenance is required every 6
                      months.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className='space-y-4'>
                  {loadingHistory ? (
                    <div className='text-center py-8'>
                      <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2' />
                      <p className='text-text-secondary'>Loading history...</p>
                    </div>
                  ) : (
                    <AssetHistoryTimeline history={history} groupByDate={true} />
                  )}
                </div>
              )}

              {activeTab === 'docs' && (
                <div className='space-y-3'>
                  <DocItem name='User Manual.pdf' size='2.4 MB' />
                  <DocItem name='Installation Report.pdf' size='1.1 MB' />
                  <DocItem name='Warranty Certificate.pdf' size='850 KB' />
                  <DocItem name='Calibration Certificate.pdf' size='1.5 MB' />
                </div>
              )}

              {activeTab === 'qr' && (
                <div className='space-y-4'>
                  {loadingQR ? (
                    <div className='text-center py-8'>
                      <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2' />
                      <p className='text-text-secondary'>Loading QR code...</p>
                    </div>
                  ) : qrCodeData ? (
                    <div className='flex flex-col items-center'>
                      <QRCodeGenerator
                        value={qrCodeData}
                        assetName={asset.name}
                        size={250}
                        showDownload={true}
                      />
                      <div className='mt-4 p-3 bg-bg-secondary rounded-lg w-full'>
                        <label className='text-xs text-text-secondary font-medium mb-1 block'>
                          QR Code URL
                        </label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='text'
                            value={qrCodeData}
                            readOnly
                            className='flex-1 p-2 text-sm border border-border rounded-md bg-white font-mono text-xs'
                          />
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              navigator.clipboard.writeText(qrCodeData)
                              toast.success('QR code URL copied!')
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='text-sm text-text-secondary mb-2'>
                          Scan this QR code to view asset details
                        </p>
                        <Button
                          variant='outline'
                          onClick={() => {
                            window.open(qrCodeData, '_blank')
                          }}
                        >
                          Open QR Page
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <p className='text-text-secondary mb-4'>
                        QR code not available for this asset
                      </p>
                      <Button
                        variant='primary'
                        onClick={async () => {
                          setLoadingQR(true)
                          try {
                            const response = await assetsApi.generateQR(asset.id)
                            if (response.success && response.data) {
                              setQrCodeData(response.data.qrCode)
                              toast.success('QR code generated successfully!')
                            } else {
                              toast.error(response.error || 'Failed to generate QR code')
                            }
                          } catch (error: any) {
                            console.error('Failed to generate QR code:', error)
                            toast.error(error?.message || 'Failed to generate QR code. Please try again.')
                          } finally {
                            setLoadingQR(false)
                          }
                        }}
                      >
                        Generate QR Code
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-border bg-bg-secondary flex justify-end gap-3'>
              <Button variant='outline' onClick={onClose}>
                Close
              </Button>
              <Button variant='primary'>Edit Asset</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function InfoItem({
  label,
  value,
  isBadge = false,
}: {
  label: string
  value: string | number
  isBadge?: boolean
}) {
  return (
    <div>
      <label className='text-xs text-text-secondary font-medium'>{label}</label>
      {isBadge ? (
        <div className='mt-1'>
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-success-light text-success'>
            {value}
          </span>
        </div>
      ) : (
        <p className='text-sm font-medium text-text-primary mt-1'>{value}</p>
      )}
    </div>
  )
}


function DocItem({ name, size }: { name: string; size: string }) {
  return (
    <div className='flex items-center justify-between p-3 border border-border rounded-lg hover:bg-bg-hover transition-colors cursor-pointer group'>
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-info-light text-info rounded'>
          <FileText size={20} />
        </div>
        <div>
          <p className='text-sm font-medium text-text-primary'>{name}</p>
          <p className='text-xs text-text-secondary'>{size}</p>
        </div>
      </div>
      <button className='p-2 text-text-tertiary hover:text-primary transition-colors'>
        <Download size={18} />
      </button>
    </div>
  )
}
