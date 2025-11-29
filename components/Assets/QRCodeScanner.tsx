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
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040]'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='fixed inset-0 z-[1050] flex items-center justify-center p-4 pointer-events-none'>
        <div
          className='bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden pointer-events-auto'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='p-4 border-b border-border flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-text-primary'>
              Scan QR Code
            </h3>
            <button
              onClick={onClose}
              className='p-2 hover:bg-bg-hover rounded-lg transition-colors'
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
              <div className='p-4 bg-danger-lighter border border-danger-light rounded-lg mb-4'>
                <p className='text-sm text-danger'>{error}</p>
              </div>
            )}

            {!error && (
              <div className='text-center py-8'>
                <Camera size={48} className='mx-auto text-text-tertiary mb-4' />
                <p className='text-sm text-text-secondary'>
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
    </>
  )
}
