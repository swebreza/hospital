'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

interface QRCodeScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export default function QRCodeScanner({
  onScan,
  onClose,
}: QRCodeScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const scannerId = `qr-scanner-${Date.now()}`

    const startScanning = async () => {
      if (!containerRef.current) return

      // Set unique ID for scanner container
      containerRef.current.id = scannerId

      try {
        const html5QrCode = new Html5Qrcode(scannerId)
        scannerRef.current = html5QrCode

        // Get available cameras
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          const backCamera = devices.find((d) => d.label.toLowerCase().includes('back')) || devices[0]
          setCameraId(backCamera.id)

          // Start scanning
          await html5QrCode.start(
            backCamera.id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // Successfully scanned
              if (isMounted) {
                // Extract asset ID from URL if it's a QR code URL
                let assetId = decodedText
                if (decodedText.includes('/qr/')) {
                  const match = decodedText.match(/\/qr\/([^/?]+)/)
                  if (match) {
                    assetId = match[1]
                  }
                }
                stopScanning().then(() => {
                  onScan(assetId)
                  toast.success('QR code scanned successfully!')
                })
              }
            },
            (errorMessage) => {
              // Scanning error (usually just means no QR code in view)
              // Don't show error for every frame
            }
          )
          setIsScanning(true)
          setError(null)
        } else {
          setError('No camera found. Please ensure your device has a camera.')
        }
      } catch (err: any) {
        console.error('Error starting QR scanner:', err)
        if (isMounted) {
          if (err.message?.includes('Permission denied') || err.message?.includes('NotAllowedError')) {
            setError('Camera permission denied. Please allow camera access and try again.')
          } else {
            setError(err.message || 'Failed to start camera. Please check permissions.')
          }
        }
      }
    }

    startScanning()

    return () => {
      isMounted = false
      stopScanning()
    }
  }, [onScan])

  const stopScanning = async (): Promise<void> => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        // Ignore errors when stopping (camera might already be stopped)
      }
      scannerRef.current = null
      setIsScanning(false)
    }
  }

  const handleClose = async () => {
    await stopScanning()
    onClose()
  }

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
              ref={containerRef}
              className='w-full aspect-square bg-black rounded-lg overflow-hidden mb-4'
            />

            {error && (
              <div className='p-4 bg-danger-lighter border border-danger-light rounded-lg mb-4 flex items-start gap-2'>
                <AlertCircle size={20} className='text-danger flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-danger mb-1'>Camera Error</p>
                  <p className='text-sm text-danger'>{error}</p>
                </div>
              </div>
            )}

            {!error && isScanning && (
              <div className='text-center py-4'>
                <p className='text-sm text-text-secondary flex items-center justify-center gap-2'>
                  <Camera size={16} className='animate-pulse' />
                  Position the QR code within the frame
                </p>
              </div>
            )}

            {!error && !isScanning && (
              <div className='text-center py-4'>
                <p className='text-sm text-text-secondary'>
                  Initializing camera...
                </p>
              </div>
            )}

            <div className='flex gap-3'>
              <Button variant='outline' onClick={handleClose} className='flex-1'>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
