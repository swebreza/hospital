'use client'

import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  complaint: {
    id: string
    title: string
    status: string
    assetId?: string
  }
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  complaint,
}: StatusUpdateModalProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    status: complaint.status || 'OPEN',
    rootCause: '',
    resolution: '',
    downtimeMinutes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const updatePayload: any = {
        status: formData.status,
      }

      if (formData.rootCause) {
        updatePayload.rootCause = formData.rootCause
      }

      if (formData.resolution) {
        updatePayload.resolution = formData.resolution
      }

      if (formData.downtimeMinutes) {
        updatePayload.downtimeMinutes = parseInt(formData.downtimeMinutes)
      }

      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Complaint status updated successfully!')
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update complaint status')
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
      toast.error('Failed to update complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black z-40'
            style={{ backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'
          >
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto'>
              <div className='p-6 border-b flex justify-between items-center bg-gray-50'>
                <h2 className='text-lg font-bold flex items-center gap-2'>
                  <AlertCircle size={20} />
                  Update Complaint Status
                </h2>
                <button
                  onClick={onClose}
                  className='p-2 hover:bg-gray-200 rounded-full'
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                <div>
                  <p className='text-sm text-text-secondary mb-2'>
                    Complaint: <span className='font-medium text-text-primary'>{complaint.title}</span>
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-text-primary mb-1'>
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none bg-white'
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.status === 'RESOLVED' && (
                  <>
                    <div>
                      <label className='block text-sm font-medium text-text-primary mb-1'>
                        Root Cause
                      </label>
                      <textarea
                        value={formData.rootCause}
                        onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                        rows={3}
                        className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
                        placeholder='Describe the root cause of the issue...'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-text-primary mb-1'>
                        Resolution *
                      </label>
                      <textarea
                        required
                        value={formData.resolution}
                        onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                        rows={4}
                        className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
                        placeholder='Describe how the issue was resolved...'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-text-primary mb-1'>
                        Downtime (minutes)
                      </label>
                      <input
                        type='number'
                        value={formData.downtimeMinutes}
                        onChange={(e) => setFormData({ ...formData, downtimeMinutes: e.target.value })}
                        className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
                        placeholder='e.g. 120'
                        min='0'
                      />
                    </div>
                  </>
                )}

                <div className='flex gap-3 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onClose}
                    className='flex-1'
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='primary'
                    className='flex-1'
                    disabled={submitting}
                    isLoading={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

