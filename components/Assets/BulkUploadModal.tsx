'use client'

import React, { useState } from 'react'
import { X, Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { assetsApi } from '@/lib/api/assets'

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface UploadResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    data: Record<string, unknown>
    errors: string[]
  }>
  duplicates: number
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [validateOnly, setValidateOnly] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setResult(null)
      } else {
        toast.error('Please select a CSV file')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const response = await assetsApi.bulkUpload(file, {
        skipDuplicates,
        validateOnly,
      })

      if (response.success) {
        if (response.data) {
          setResult(response.data)
          if (response.data.successful > 0) {
            toast.success(
              `Successfully ${validateOnly ? 'validated' : 'uploaded'} ${response.data.successful} asset(s)`
            )
            if (onSuccess) onSuccess()
          }
          if (response.data.failed > 0) {
            toast.warning(`${response.data.failed} asset(s) failed to ${validateOnly ? 'validate' : 'upload'}`)
          }
          if (response.data.duplicates > 0) {
            toast.info(`${response.data.duplicates} duplicate asset(s) skipped`)
          }
        } else {
          toast.error('Invalid response from server')
        }
      } else {
        toast.error(response.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='fixed inset-0 bg-black z-40 backdrop-blur-sm'
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4'
          >
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl pointer-events-auto flex flex-col max-h-[90vh] border border-border overflow-hidden'>
              <div className='p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary-lighter to-transparent'>
                <h2 className='text-2xl font-bold text-text-primary'>Bulk Upload Assets</h2>
                <button
                  onClick={handleClose}
                  className='p-2 hover:bg-bg-hover rounded-lg transition-all hover:scale-110 text-text-secondary hover:text-text-primary'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='flex-1 overflow-y-auto p-6 bg-bg-secondary scrollbar-thin'>
                {!result ? (
                  <div className='space-y-6'>
                    <div>
                      <p className='text-sm text-text-secondary mb-4'>
                        Upload a CSV file with asset data. The file should include columns: name,
                        model, manufacturer, serialNumber, department, location, value, purchaseDate,
                        nextPmDate, assetType, modality, criticality, oem, farNumber, etc.
                      </p>

                      <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                        <input
                          type='file'
                          accept='.csv'
                          onChange={handleFileSelect}
                          className='hidden'
                          id='bulk-upload-file'
                        />
                        <label
                          htmlFor='bulk-upload-file'
                          className='cursor-pointer flex flex-col items-center gap-4'
                        >
                          <Upload size={48} className='text-text-tertiary' />
                          <div>
                            <p className='text-sm font-medium text-text-primary'>
                              {file ? file.name : 'Click to select CSV file'}
                            </p>
                            <p className='text-xs text-text-secondary mt-1'>
                              CSV files only
                            </p>
                          </div>
                        </label>
                      </div>

                      {file && (
                        <div className='flex items-center gap-2 p-3 bg-success-light rounded-lg'>
                          <FileText size={20} className='text-success' />
                          <span className='text-sm text-text-primary'>{file.name}</span>
                          <span className='text-xs text-text-secondary'>
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                      )}

                      <div className='space-y-3 pt-4'>
                        <label className='flex items-center gap-2 text-sm text-text-primary'>
                          <input
                            type='checkbox'
                            checked={skipDuplicates}
                            onChange={(e) => setSkipDuplicates(e.target.checked)}
                            className='w-4 h-4 rounded border-border'
                          />
                          Skip duplicate assets (by ID, serial number, or FAR number)
                        </label>

                        <label className='flex items-center gap-2 text-sm text-text-primary'>
                          <input
                            type='checkbox'
                            checked={validateOnly}
                            onChange={(e) => setValidateOnly(e.target.checked)}
                            className='w-4 h-4 rounded border-border'
                          />
                          Validate only (do not import)
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-4 gap-4'>
                      <div className='p-4 bg-bg-secondary rounded-lg border border-border'>
                        <p className='text-xs text-text-secondary mb-1'>Total</p>
                        <p className='text-2xl font-bold text-text-primary'>{result.total}</p>
                      </div>
                      <div className='p-4 bg-success-light rounded-lg border border-success'>
                        <p className='text-xs text-success mb-1'>Successful</p>
                        <p className='text-2xl font-bold text-success'>{result.successful}</p>
                      </div>
                      <div className='p-4 bg-danger-light rounded-lg border border-danger'>
                        <p className='text-xs text-danger mb-1'>Failed</p>
                        <p className='text-2xl font-bold text-danger'>{result.failed}</p>
                      </div>
                      <div className='p-4 bg-warning-light rounded-lg border border-warning'>
                        <p className='text-xs text-warning mb-1'>Duplicates</p>
                        <p className='text-2xl font-bold text-warning'>{result.duplicates}</p>
                      </div>
                    </div>

                    {result.errors.length > 0 && (
                      <div className='space-y-2'>
                        <h3 className='font-semibold text-text-primary flex items-center gap-2'>
                          <AlertCircle size={18} />
                          Errors ({result.errors.length})
                        </h3>
                        <div className='max-h-64 overflow-y-auto space-y-2'>
                          {result.errors.map((error, index) => (
                            <div
                              key={index}
                              className='p-3 bg-danger-light border border-danger rounded-lg'
                            >
                              <p className='text-sm font-medium text-danger mb-1'>
                                Row {error.row}
                              </p>
                              <ul className='text-xs text-text-secondary list-disc list-inside'>
                                {error.errors.map((err, errIndex) => (
                                  <li key={errIndex}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className='p-6 border-t border-border bg-bg-secondary flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='btn btn-outline px-6'
                  disabled={uploading}
                >
                  {result ? 'Close' : 'Cancel'}
                </button>
                {!result && (
                  <button
                    type='button'
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className='btn btn-primary gap-2 px-6 shadow-md hover:shadow-lg disabled:opacity-50'
                  >
                    {uploading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        {validateOnly ? 'Validating...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        {validateOnly ? 'Validate' : 'Upload'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

