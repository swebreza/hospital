'use client'

import React, { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface ResolutionConfirmationProps {
  complaint: {
    id: string
    title: string
    status: string
    resolution?: string
  }
}

export default function ResolutionConfirmation({
  complaint,
}: ResolutionConfirmationProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null)

  const handleConfirm = async () => {
    setAction('confirm')
    setSubmitting(true)

    try {
      const response = await fetch(`/api/complaints/${complaint.id}/confirm-resolution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmed: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Complaint confirmed as resolved and closed!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to confirm resolution')
      }
    } catch (error) {
      console.error('Error confirming resolution:', error)
      toast.error('Failed to confirm resolution. Please try again.')
    } finally {
      setSubmitting(false)
      setAction(null)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback when rejecting resolution')
      return
    }

    setAction('reject')
    setSubmitting(true)

    try {
      const response = await fetch(`/api/complaints/${complaint.id}/confirm-resolution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmed: false,
          feedback: feedback.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Complaint reopened for further action')
        setFeedback('')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to reject resolution')
      }
    } catch (error) {
      console.error('Error rejecting resolution:', error)
      toast.error('Failed to reject resolution. Please try again.')
    } finally {
      setSubmitting(false)
      setAction(null)
    }
  }

  if (complaint.status !== 'RESOLVED') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4'
    >
      <div className='flex items-start gap-3 mb-4'>
        <AlertCircle className='text-yellow-600 mt-0.5' size={20} />
        <div className='flex-1'>
          <h3 className='font-semibold text-text-primary mb-1'>
            Resolution Pending Confirmation
          </h3>
          <p className='text-sm text-text-secondary'>
            The complaint has been marked as resolved. Please review and confirm if the issue is actually resolved.
          </p>
          {complaint.resolution && (
            <div className='mt-3 p-3 bg-white rounded-md border border-yellow-200'>
              <p className='text-xs font-medium text-text-secondary mb-1'>Resolution Details:</p>
              <p className='text-sm text-text-primary'>{complaint.resolution}</p>
            </div>
          )}
        </div>
      </div>

      <div className='space-y-3'>
        <div>
          <label className='block text-sm font-medium text-text-primary mb-1'>
            Feedback (required if rejecting)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className='w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none'
            placeholder='Provide feedback about the resolution...'
          />
        </div>

        <div className='flex gap-3'>
          <Button
            variant='outline'
            onClick={handleReject}
            disabled={submitting || !feedback.trim()}
            isLoading={submitting && action === 'reject'}
            leftIcon={XCircle}
            className='flex-1'
          >
            Reject Resolution
          </Button>
          <Button
            variant='primary'
            onClick={handleConfirm}
            disabled={submitting}
            isLoading={submitting && action === 'confirm'}
            leftIcon={CheckCircle}
            className='flex-1'
          >
            Confirm Resolved
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

