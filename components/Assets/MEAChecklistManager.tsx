'use client'

import React, { useState, useEffect } from 'react'
import { FileCheck, Upload, CheckCircle, XCircle, Clock } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { MEAChecklist } from '@/lib/types'
import Button from '@/components/ui/Button'

interface MEAChecklistManagerProps {
  assetId: string
}

export default function MEAChecklistManager({ assetId }: MEAChecklistManagerProps) {
  const [checklists, setChecklists] = useState<MEAChecklist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChecklists()
  }, [assetId])

  const loadChecklists = async () => {
    setLoading(true)
    try {
      const response = await assetsApi.getMEAChecklists(assetId)
      if (response.success && response.data) {
        setChecklists(response.data)
      }
    } catch (error) {
      console.error('Failed to load MEA checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusIcons = {
    Completed: CheckCircle,
    Pending: Clock,
    Failed: XCircle,
  }

  const statusColors = {
    Completed: 'text-success',
    Pending: 'text-warning',
    Failed: 'text-danger',
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h3 className='text-lg font-semibold text-text-primary flex items-center gap-2'>
            <FileCheck size={20} />
            MEA Checklists
          </h3>
          <p className='text-sm text-text-secondary'>
            Installation Qualification (IQ), Performance Qualification (PQ), Operational
            Qualification (OQ), Factory Calibration, and Training records
          </p>
        </div>
        <Button variant='primary' leftIcon={Upload}>
          Add Checklist
        </Button>
      </div>

      {loading ? (
        <div className='text-center py-8'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2' />
          <p className='text-text-secondary'>Loading checklists...</p>
        </div>
      ) : checklists.length === 0 ? (
        <div className='text-center py-8 bg-bg-secondary rounded-lg border border-border'>
          <FileCheck size={48} className='mx-auto mb-2 text-text-tertiary opacity-50' />
          <p className='text-text-secondary'>No MEA checklists found</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {checklists.map((checklist) => {
            const StatusIcon = statusIcons[checklist.status] || Clock
            const statusColor = statusColors[checklist.status] || 'text-text-secondary'

            return (
              <div
                key={checklist.id}
                className='bg-white rounded-lg border border-border p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h4 className='font-semibold text-text-primary'>{checklist.checklistType}</h4>
                    <p className='text-xs text-text-secondary'>
                      {new Date(checklist.performedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${statusColor}`}>
                    <StatusIcon size={18} />
                    <span className='text-sm font-medium'>{checklist.status}</span>
                  </div>
                </div>
                {checklist.notes && (
                  <p className='text-sm text-text-secondary mb-2'>{checklist.notes}</p>
                )}
                {checklist.documents && checklist.documents.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-xs text-text-secondary mb-1'>Documents:</p>
                    <div className='flex flex-wrap gap-2'>
                      {checklist.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.fileUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-primary hover:underline'
                        >
                          {doc.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

