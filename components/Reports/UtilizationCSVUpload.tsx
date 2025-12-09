'use client'

import React, { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { toast } from 'sonner'
import { parseUtilizationCSV, validateCSVFile, type ParsedUtilizationData } from '@/lib/utils/csvParser'

interface UtilizationCSVUploadProps {
  onUploadComplete?: (result: {
    success: boolean
    successCount: number
    errorCount: number
  }) => void
}

export default function UtilizationCSVUpload({
  onUploadComplete,
}: UtilizationCSVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedUtilizationData | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // Validate file
    const validation = validateCSVFile(selectedFile)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setFile(selectedFile)

    // Parse CSV to preview
    try {
      const parsed = await parseUtilizationCSV(selectedFile)
      setParsedData(parsed)

      if (parsed.errors.length > 0) {
        toast.warning(
          `Found ${parsed.errors.length} errors in CSV. Please review before uploading.`
        )
      } else {
        toast.success(`Parsed ${parsed.valid.length} valid records`)
      }
    } catch (error) {
      toast.error('Failed to parse CSV file')
      console.error(error)
    }
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleUpload = useCallback(async () => {
    if (!file || !parsedData) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadedBy', 'current-user-id') // TODO: Get from auth context

      const response = await fetch('/api/utilization/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          `Successfully uploaded ${result.data.successCount} records`
        )
        setFile(null)
        setParsedData(null)
        onUploadComplete?.({
          success: true,
          successCount: result.data.successCount,
          errorCount: result.data.errorCount,
        })
      } else {
        toast.error(result.error || 'Upload failed')
        onUploadComplete?.({
          success: false,
          successCount: result.data?.successCount || 0,
          errorCount: result.data?.errorCount || 0,
        })
      }
    } catch (error) {
      toast.error('Failed to upload file')
      console.error(error)
      onUploadComplete?.({
        success: false,
        successCount: 0,
        errorCount: 0,
      })
    } finally {
      setUploading(false)
    }
  }, [file, parsedData, onUploadComplete])

  const handleRemove = useCallback(() => {
    setFile(null)
    setParsedData(null)
  }, [])

  return (
    <Card padding="md" className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Upload Utilization CSV
        </h3>
        <p className="text-sm text-text-secondary">
          Upload a CSV file with utilization data. Expected columns: assetId/assetName/serialNumber, date, usageHours, usageCount
        </p>
      </div>

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary-light'
              : 'border-border hover:border-primary'
          }`}
        >
          <Upload
            size={48}
            className={`mx-auto mb-4 ${
              dragActive ? 'text-primary' : 'text-text-secondary'
            }`}
          />
          <p className="text-text-primary mb-2">
            Drag and drop your CSV file here, or click to browse
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Maximum file size: 10MB
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" size="sm" as="span">
              Select File
            </Button>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
            <div className="flex items-center gap-3">
              <File size={24} className="text-primary" />
              <div>
                <p className="font-medium text-text-primary">{file.name}</p>
                <p className="text-sm text-text-secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {parsedData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-text-primary">
                  {parsedData.valid.length} valid records
                </span>
              </div>
              {parsedData.errors.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-text-secondary">
                    {parsedData.errors.length} errors found
                  </span>
                </div>
              )}

              {parsedData.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg max-h-48 overflow-y-auto">
                  <p className="font-medium text-red-800 mb-2">Errors:</p>
                  <ul className="space-y-1 text-sm text-red-700">
                    {parsedData.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.message}
                      </li>
                    ))}
                    {parsedData.errors.length > 10 && (
                      <li className="text-red-600">
                        ... and {parsedData.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || !parsedData || parsedData.valid.length === 0}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
            <Button variant="outline" onClick={handleRemove} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

