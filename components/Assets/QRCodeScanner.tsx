'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'

interface QRCodeScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            onScan(decodedText)
            stopScanning()
            toast.success('QR Code scanned successfully')
          },
          (errorMessage: string) => {
            // Ignore scanning errors
          }
        )

        setIsScanning(true)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to start camera')
        toast.error('Failed to start camera')
      }
    }

    const stopScanning = async () => {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
          await scannerRef.current.clear()
        } catch (err) {
          // Ignore stop errors
        }
        scannerRef.current = null
      }
      setIsScanning(false)
    }

    startScanning()

    return () => {
      stopScanning()
    }
  }, [onScan])

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

          {!isScanning && !error && (
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
