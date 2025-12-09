'use client'

import React from 'react'
import { Clock, Wrench, Move, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import type { AssetHistory } from '@/lib/types'
import { format } from 'date-fns'

interface AssetHistoryTimelineProps {
  history: AssetHistory[]
  groupByDate?: boolean
}

const eventIcons: Record<AssetHistory['eventType'], typeof Clock> = {
  Repair: Wrench,
  Move: Move,
  Calibration: CheckCircle,
  StatusChange: AlertCircle,
  PM: FileText,
  Complaint: AlertCircle,
}

const eventColors: Record<AssetHistory['eventType'], string> = {
  Repair: 'text-warning',
  Move: 'text-info',
  Calibration: 'text-success',
  StatusChange: 'text-primary',
  PM: 'text-primary',
  Complaint: 'text-danger',
}

export default function AssetHistoryTimeline({
  history,
  groupByDate = true,
}: AssetHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className='text-center py-8 text-text-secondary'>
        <Clock size={48} className='mx-auto mb-2 opacity-50' />
        <p>No history available</p>
      </div>
    )
  }

  if (groupByDate) {
    const grouped = history.reduce((acc, event) => {
      const date = format(new Date(event.eventDate), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    }, {} as Record<string, AssetHistory[]>)

    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

    return (
      <div className='space-y-6'>
        {dates.map((date) => (
          <div key={date} className='relative'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex-1 h-px bg-border' />
              <div className='px-4 py-1 bg-bg-secondary rounded-full border border-border'>
                <span className='text-sm font-semibold text-text-primary'>
                  {format(new Date(date), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className='flex-1 h-px bg-border' />
            </div>

            <div className='space-y-3 pl-8 border-l-2 border-border'>
              {grouped[date].map((event) => (
                <HistoryItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {history.map((event) => (
        <HistoryItem key={event.id} event={event} />
      ))}
    </div>
  )
}

function HistoryItem({ event }: { event: AssetHistory }) {
  const Icon = eventIcons[event.eventType] || Clock
  const colorClass = eventColors[event.eventType] || 'text-text-secondary'

  return (
    <div className='flex gap-4 p-4 bg-bg-secondary rounded-lg border border-border hover:shadow-md transition-shadow'>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-border flex items-center justify-center ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2 mb-1'>
          <h4 className='font-semibold text-text-primary'>{event.eventType}</h4>
          <span className='text-xs text-text-secondary whitespace-nowrap'>
            {format(new Date(event.eventDate), 'HH:mm')}
          </span>
        </div>
        {event.description && (
          <p className='text-sm text-text-secondary mb-2'>{event.description}</p>
        )}
        {(event.oldValue || event.newValue) && (
          <div className='flex items-center gap-2 text-xs'>
            {event.oldValue && (
              <span className='px-2 py-1 bg-danger-light text-danger rounded'>
                {event.oldValue}
              </span>
            )}
            <span className='text-text-tertiary'>→</span>
            {event.newValue && (
              <span className='px-2 py-1 bg-success-light text-success rounded'>
                {event.newValue}
              </span>
            )}
          </div>
        )}
        {event.performedByUser && (
          <p className='text-xs text-text-tertiary mt-2'>
            By: {event.performedByUser.name || event.performedBy}
          </p>
        )}
      </div>
    </div>
  )
}

