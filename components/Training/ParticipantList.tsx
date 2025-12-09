'use client'

import React from 'react'
import { CheckCircle, XCircle, Clock, UserX } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import type { TrainingParticipant } from '@/lib/types'

interface ParticipantListProps {
  participants: TrainingParticipant[]
  onUpdateStatus?: (participantId: string, status: Partial<TrainingParticipant>) => void
}

export default function ParticipantList({ participants, onUpdateStatus }: ParticipantListProps) {
  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'Attended':
        return CheckCircle
      case 'Absent':
        return XCircle
      case 'Registered':
        return Clock
      case 'Cancelled':
        return UserX
      default:
        return Clock
    }
  }

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'Attended':
        return 'success'
      case 'Absent':
        return 'danger'
      case 'Registered':
        return 'warning'
      case 'Cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getCertificationColor = (status: string) => {
    switch (status) {
      case 'Certified':
        return 'success'
      case 'Expired':
        return 'danger'
      case 'RecertificationDue':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (participants.length === 0) {
    return (
      <Card padding="md">
        <p className="text-center text-text-secondary py-8">No participants registered</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const AttendanceIcon = getAttendanceIcon(participant.attendanceStatus)
        return (
          <Card key={participant.id} padding="md" hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  participant.attendanceStatus === 'Attended' ? 'bg-success-light' :
                  participant.attendanceStatus === 'Absent' ? 'bg-danger-light' :
                  'bg-warning-light'
                }`}>
                  <AttendanceIcon
                    size={20}
                    className={
                      participant.attendanceStatus === 'Attended' ? 'text-success' :
                      participant.attendanceStatus === 'Absent' ? 'text-danger' :
                      'text-warning'
                    }
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary">
                    {participant.user?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {participant.user?.email || participant.userId}
                  </div>
                  {participant.attendedAt && (
                    <div className="text-xs text-text-secondary mt-1">
                      Attended: {new Date(participant.attendedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getAttendanceColor(participant.attendanceStatus)}>
                  {participant.attendanceStatus}
                </Badge>
                <Badge variant={getCertificationColor(participant.certificationStatus)}>
                  {participant.certificationStatus}
                </Badge>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

