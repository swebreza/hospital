'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import Button from '@/components/ui/Button'
import { generateQRCodeData } from '@/lib/services/qrCodeClient'

interface QRCodeGeneratorProps {
  value: string
  assetName?: string
  size?: number
  showDownload?: boolean
}

export default function QRCodeGenerator({
  value,
  assetName,
  size = 200,
  showDownload = true,
}: QRCodeGeneratorProps) {
  const qrData = generateQRCodeData(value)

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `QR-${value}-${Date.now()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src =
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-lg border border-[var(--border-color)]'>
      <div className='p-4 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-[var(--border-color)]'>
        <QRCodeSVG
          id='qr-code-svg'
          value={qrData}
          size={size}
          level='H'
          includeMargin={true}
        />
      </div>

      {assetName && (
        <div className='text-center'>
          <p className='text-sm font-medium text-[var(--text-primary)]'>
            {assetName}
          </p>
          <p className='text-xs text-[var(--text-secondary)] mt-1'>{value}</p>
        </div>
      )}

      {showDownload && (
        <Button
          variant='outline'
          size='sm'
          onClick={downloadQR}
          leftIcon={Download}
        >
          Download QR Code
        </Button>
      )}
    </div>
  )
}
