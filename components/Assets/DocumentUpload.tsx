'use client'

import React, { useCallback, useState } from 'react'
// import { useDropzone } from 'react-dropzone' // TODO: Install react-dropzone package
import { Upload, File, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentUploadProps {
  onUpload: (files: File[]) => Promise<void>
  acceptedTypes?: string[]
  maxSize?: number // in bytes
  maxFiles?: number
  existingDocuments?: Array<{ name: string; url: string; type: string }>
  onDelete?: (url: string) => Promise<void>
}

export default function DocumentUpload({
  onUpload,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  existingDocuments = [],
  onDelete,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)
      if (fileArray.length + existingDocuments.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      setUploading(true)
      try {
        await onUpload(fileArray)
        setUploadedFiles((prev) => [...prev, ...fileArray])
        toast.success(`${fileArray.length} file(s) uploaded successfully`)
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload files'
        toast.error(errorMessage)
      } finally {
        setUploading(false)
      }
    },
    [onUpload, maxFiles, existingDocuments.length]
  )

  // TODO: Implement dropzone when react-dropzone is installed
  const isDragActive = false

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word') || type.includes('document')) return '📝'
    return '📎'
  }

  return (
    <div className='space-y-4'>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-[var(--primary)] bg-[var(--primary-lighter)]'
            : 'border-[var(--border-color)] hover:border-[var(--primary)] hover:bg-[var(--bg-hover)]'
        }`}
      >
        <input
          type='file'
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className='hidden'
          id='file-upload'
        />
        <label htmlFor='file-upload' className='cursor-pointer'>
          <Upload
            size={32}
            className={`mx-auto mb-3 ${
              isDragActive
                ? 'text-[var(--primary)]'
                : 'text-[var(--text-tertiary)]'
            }`}
          />
          {isDragActive ? (
            <p className='text-sm font-medium text-[var(--primary)]'>
              Drop files here
            </p>
          ) : (
            <>
              <p className='text-sm font-medium text-[var(--text-primary)] mb-1'>
                Drag & drop files here, or click to select
              </p>
              <p className='text-xs text-[var(--text-secondary)]'>
                Accepted: {acceptedTypes.join(', ')} (Max{' '}
                {formatFileSize(maxSize)})
              </p>
            </>
          )}
        </label>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-[var(--text-primary)]'>
            New Uploads
          </h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-3 bg-[var(--success-lighter)] border border-[var(--success-light)] rounded-lg'
            >
              <File size={20} className='text-[var(--success)]' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                  {file.name}
                </p>
                <p className='text-xs text-[var(--text-secondary)]'>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Check
                size={16}
                className='text-[var(--success)] flex-shrink-0'
              />
            </div>
          ))}
        </div>
      )}

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-[var(--text-primary)]'>
            Existing Documents
          </h4>
          <div className='space-y-2'>
            {existingDocuments.map((doc, index) => (
              <div
                key={index}
                className='flex items-center gap-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors'
              >
                <span className='text-2xl'>{getFileIcon(doc.type)}</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                    {doc.name}
                  </p>
                  <p className='text-xs text-[var(--text-secondary)] capitalize'>
                    {doc.type}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <a
                    href={doc.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-1.5 hover:bg-[var(--bg-hover)] rounded transition-colors'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <File size={16} className='text-[var(--primary)]' />
                  </a>
                  {onDelete && (
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            'Are you sure you want to delete this document?'
                          )
                        ) {
                          try {
                            await onDelete(doc.url)
                            toast.success('Document deleted')
                          } catch (error: unknown) {
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : 'Failed to delete document'
                            toast.error(errorMessage)
                          }
                        }
                      }}
                      className='p-1.5 hover:bg-[var(--danger-lighter)] rounded transition-colors'
                    >
                      <X size={16} className='text-[var(--danger)]' />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
