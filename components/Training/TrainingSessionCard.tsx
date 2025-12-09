'use client'

import React from 'react'
import { Calendar, Clock, Users, Building2, Stethoscope } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { TrainingSession } from '@/lib/types'

interface TrainingSessionCardProps {
  session: TrainingSession
  onClick?: () => void
}

export default function TrainingSessionCard({ session, onClick }: TrainingSessionCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success'
      case 'InProgress':
        return 'info'
      case 'Scheduled':
        return 'warning'
      case 'Cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card hover={!!onClick} onClick={onClick} className="cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1">{session.title}</h3>
          {session.description && (
            <p className="text-sm text-text-secondary line-clamp-2">{session.description}</p>
          )}
        </div>
        <Badge variant={getStatusVariant(session.status)}>{session.status}</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar size={16} />
          <span>{formatDate(session.sessionDate)}</span>
        </div>

        {session.asset && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Stethoscope size={16} />
            <span>{session.asset.name} {session.asset.model && `(${session.asset.model})`}</span>
          </div>
        )}

        {session.department && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Building2 size={16} />
            <span>{session.department}</span>
          </div>
        )}

        {session.durationMinutes && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={16} />
            <span>{session.durationMinutes} minutes</span>
          </div>
        )}

        {session.participants && session.participants.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Users size={16} />
            <span>
              {session.participants.length}{' '}
              {session.participants.length === 1 ? 'participant' : 'participants'}
            </span>
          </div>
        )}

        {session.trainer && (
          <div className="text-sm text-text-secondary mt-2">
            <span className="font-medium">Trainer:</span> {session.trainer.name}
          </div>
        )}
      </div>
    </Card>
  )
}

