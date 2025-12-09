'use client'

import React, { useState } from 'react'
import { Upload, File, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface DocumentUploadProps {
  contractId: string
  existingDocuments?: string[]
  onUploadComplete?: (url: string) => void
  onDelete?: (url: string) => void
}

export default function DocumentUpload({
  contractId,
  existingDocuments = [],
  onUploadComplete,
  onDelete,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<string[]>(existingDocuments)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, Word, or Image files.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/contracts/${contractId}/documents`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setDocuments([...documents, result.data.url])
        if (onUploadComplete) {
          onUploadComplete(result.data.url)
        }
      } else {
        alert(result.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDelete = async (url: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // TODO: Implement delete API endpoint
      // For now, just remove from local state
      setDocuments(documents.filter((doc) => doc !== url))
      if (onDelete) {
        onDelete(url)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Document'
  }

  return (
    <div className='space-y-4'>
      <div>
        <label className='text-sm font-medium text-text-primary mb-2 block'>
          Contract Documents
        </label>
        <div className='flex items-center gap-2'>
          <label className='flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors'>
            <Upload size={18} />
            <span className='text-sm'>Upload Document</span>
            <input
              type='file'
              className='hidden'
              onChange={handleFileUpload}
              accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
              disabled={uploading}
            />
          </label>
          {uploading && (
            <span className='text-sm text-text-secondary'>Uploading...</span>
          )}
        </div>
        <p className='text-xs text-text-secondary mt-1'>
          Supported formats: PDF, Word, Images (Max 10MB)
        </p>
      </div>

      {documents.length > 0 && (
        <div className='space-y-2'>
          {documents.map((doc, index) => (
            <Card key={index} padding='sm' className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <File size={18} className='text-text-secondary' />
                <div>
                  <p className='text-sm font-medium text-text-primary'>
                    {getFileName(doc)}
                  </p>
                  <a
                    href={doc}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-primary hover:underline'
                  >
                    View Document
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc)}
                className='p-1 hover:bg-danger-light rounded text-danger hover:text-danger-hover transition-colors'
              >
                <X size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

