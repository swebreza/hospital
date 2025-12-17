'use client'

import React, { useState } from 'react'
import { X, AlertTriangle, Clock, User, Building2, FileText, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { complaintsApi } from '@/lib/api/complaints'
import type { Complaint } from '@/lib/types'
import { useClientUserRole } from '@/lib/auth/client-roles'
import StatusUpdateModal from './StatusUpdateModal'
import ResolutionConfirmation from './ResolutionConfirmation'
import { formatDistanceToNow } from 'date-fns'

interface ComplaintDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  complaint: Complaint | null
  onUpdate?: () => void
}

export default function ComplaintDetailsModal({
  isOpen,
  onClose,
  complaint,
  onUpdate,
}: ComplaintDetailsModalProps) {
  const router = useRouter()
  const { user } = useUser()
  const userRole = useClientUserRole()
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!complaint) return null

  const canUpdateStatus = userRole === 'full_access'
  const isReporter = user?.id === complaint.reportedBy
  const isResolved = complaint.status === 'RESOLVED'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800'
      case 'RESOLVED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const handleViewAsset = () => {
    if (complaint.assetId) {
      router.push(`/assets/${complaint.assetId}`)
      onClose()
    }
  }

  const handleViewQR = () => {
    if (complaint.assetId) {
      const qrUrl = `${window.location.origin}/qr/${complaint.assetId}`
      window.open(qrUrl, '_blank')
    }
  }

  return (
    <>
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
              <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto'>
                {/* Header */}
                <div className='p-6 border-b flex justify-between items-start bg-gray-50 sticky top-0 z-10'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h2 className='text-xl font-bold text-text-primary'>
                        {complaint.title}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                    <p className='text-sm text-text-secondary'>ID: {complaint.id}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className='p-2 hover:bg-gray-200 rounded-full'
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className='p-6 space-y-6'>
                  {/* Asset Information */}
                  <div className='bg-primary-light rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='font-semibold text-text-primary flex items-center gap-2'>
                        <Building2 size={18} />
                        Asset Information
                      </h3>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleViewAsset}
                        >
                          View Asset
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleViewQR}
                        >
                          View QR
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-text-secondary'>Asset Name:</span>
                        <p className='font-medium text-text-primary'>
                          {(complaint.asset as any)?.name || complaint.assetId}
                        </p>
                      </div>
                      <div>
                        <span className='text-text-secondary'>Department:</span>
                        <p className='font-medium text-text-primary'>
                          {(complaint.asset as any)?.department || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className='text-text-secondary'>Location:</span>
                        <p className='font-medium text-text-primary'>
                          {(complaint.asset as any)?.location || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className='font-semibold text-text-primary mb-2 flex items-center gap-2'>
                      <FileText size={18} />
                      Description
                    </h3>
                    <p className='text-sm text-text-secondary bg-bg-secondary p-3 rounded-lg'>
                      {complaint.description}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className='font-semibold text-text-primary mb-3 flex items-center gap-2'>
                      <Clock size={18} />
                      Timeline
                    </h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-text-secondary'>Reported:</span>
                        <span className='text-text-primary font-medium'>
                          {formatDistanceToNow(new Date(complaint.reportedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {complaint.respondedAt && (
                        <div className='flex justify-between'>
                          <span className='text-text-secondary'>Responded:</span>
                          <span className='text-text-primary font-medium'>
                            {formatDistanceToNow(new Date(complaint.respondedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      )}
                      {complaint.resolvedAt && (
                        <div className='flex justify-between'>
                          <span className='text-text-secondary'>Resolved:</span>
                          <span className='text-text-primary font-medium'>
                            {formatDistanceToNow(new Date(complaint.resolvedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      )}
                      {complaint.slaDeadline && (
                        <div className='flex justify-between'>
                          <span className='text-text-secondary'>SLA Deadline:</span>
                          <span className='text-text-primary font-medium'>
                            {new Date(complaint.slaDeadline).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* People */}
                  <div>
                    <h3 className='font-semibold text-text-primary mb-3 flex items-center gap-2'>
                      <User size={18} />
                      People
                    </h3>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-text-secondary block mb-1'>Reported By:</span>
                        <p className='font-medium text-text-primary'>
                          {(complaint.reporter as any)?.name ||
                            (complaint.reportedByUser as any)?.name ||
                            'Unknown'}
                        </p>
                      </div>
                      {complaint.assignedTo && (
                        <div>
                          <span className='text-text-secondary block mb-1'>Assigned To:</span>
                          <p className='font-medium text-text-primary'>
                            {(complaint.assignee as any)?.name ||
                              (complaint.assignedToUser as any)?.name ||
                              'Unassigned'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resolution Details */}
                  {complaint.rootCause && (
                    <div>
                      <h3 className='font-semibold text-text-primary mb-2'>Root Cause</h3>
                      <p className='text-sm text-text-secondary bg-bg-secondary p-3 rounded-lg'>
                        {complaint.rootCause}
                      </p>
                    </div>
                  )}

                  {complaint.resolution && (
                    <div>
                      <h3 className='font-semibold text-text-primary mb-2'>Resolution</h3>
                      <p className='text-sm text-text-secondary bg-bg-secondary p-3 rounded-lg'>
                        {complaint.resolution}
                      </p>
                    </div>
                  )}

                  {/* Resolution Confirmation for Normal Users */}
                  {isResolved && isReporter && userRole === 'normal' && (
                    <ResolutionConfirmation complaint={complaint} />
                  )}

                  {/* Actions */}
                  <div className='flex gap-3 pt-4 border-t'>
                    {canUpdateStatus && (
                      <Button
                        variant='primary'
                        onClick={() => setShowStatusUpdate(true)}
                        className='flex-1'
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      {showStatusUpdate && complaint && (
        <StatusUpdateModal
          isOpen={showStatusUpdate}
          onClose={() => {
            setShowStatusUpdate(false)
            if (onUpdate) onUpdate()
          }}
          complaint={complaint}
        />
      )}
    </>
  )
}

