'use client'

import React, { useRef } from 'react'
// import { Html5Qrcode } from 'html5-qrcode' // TODO: Install html5-qrcode package
import { Camera, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface QRCodeScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export default function QRCodeScanner({
  onScan: _onScan,
  onClose,
}: QRCodeScannerProps) {
  // TODO: Implement QR scanning when html5-qrcode is installed
  // For now, this is a placeholder component
  const error = 'QR Code scanning requires html5-qrcode package to be installed'
  const containerRef = useRef<HTMLDivElement>(null)

  // Suppress unused parameter warning - will be used when implementing QR scanning
  void _onScan

  return (
    <div className='fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden'>
        <div className='p-4 border-b border-[var(--border-color)] flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-[var(--text-primary)]'>
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6'>
          <div
            id='qr-reader'
            ref={containerRef}
            className='w-full aspect-square bg-black rounded-lg overflow-hidden mb-4'
          />

          {error && (
            <div className='p-4 bg-[var(--danger-lighter)] border border-[var(--danger-light)] rounded-lg mb-4'>
              <p className='text-sm text-[var(--danger)]'>{error}</p>
            </div>
          )}

          {!error && (
            <div className='text-center py-8'>
              <Camera
                size={48}
                className='mx-auto text-[var(--text-tertiary)] mb-4'
              />
              <p className='text-sm text-[var(--text-secondary)]'>
                Position the QR code within the frame
              </p>
            </div>
          )}

          <div className='flex gap-3'>
            <Button variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
