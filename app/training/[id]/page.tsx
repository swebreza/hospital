'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Users, FileText, Award } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ParticipantList from '@/components/Training/ParticipantList'
import { trainingApi } from '@/lib/api/training'
import { toast } from 'sonner'
import type { TrainingSession } from '@/lib/types'

export default function TrainingSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  const loadSession = async () => {
    try {
      setLoading(true)
      const data = await trainingApi.getById(sessionId)
      setSession(data)
    } catch (error) {
      console.error('Failed to load training session:', error)
      toast.error('Failed to load training session')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Training session not found</p>
        <Button variant="outline" onClick={() => router.push('/training')} className="mt-4">
          Back to Training
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/training')}
          leftIcon={ArrowLeft}
        >
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-primary">{session.title}</h1>
          <p className="text-text-secondary">{session.description}</p>
        </div>
        <Badge variant={
          session.status === 'Completed' ? 'success' :
          session.status === 'InProgress' ? 'info' :
          session.status === 'Scheduled' ? 'warning' :
          'danger'
        }>
          {session.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-text-secondary">Date & Time:</span>
                <p className="text-text-primary">
                  {new Date(session.sessionDate).toLocaleString()}
                </p>
              </div>
              {session.asset && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Equipment:</span>
                  <p className="text-text-primary">
                    {session.asset.name} {session.asset.model && `(${session.asset.model})`}
                  </p>
                </div>
              )}
              {session.department && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Department:</span>
                  <p className="text-text-primary">{session.department}</p>
                </div>
              )}
              {session.location && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Location:</span>
                  <p className="text-text-primary">{session.location}</p>
                </div>
              )}
              {session.durationMinutes && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Duration:</span>
                  <p className="text-text-primary">{session.durationMinutes} minutes</p>
                </div>
              )}
              {session.trainer && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Trainer:</span>
                  <p className="text-text-primary">{session.trainer.name}</p>
                </div>
              )}
              {session.notes && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Notes:</span>
                  <p className="text-text-primary">{session.notes}</p>
                </div>
              )}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users size={20} />
                Participants ({session.participants?.length || 0})
              </h2>
            </div>
            <ParticipantList participants={session.participants || []} />
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText size={20} />
                Assessments
              </h2>
            </div>
            {session.assessments && session.assessments.length > 0 ? (
              <div className="space-y-2">
                {session.assessments.map((assessment) => (
                  <div key={assessment.id} className="p-3 bg-bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{assessment.assessmentType}</span>
                      {assessment.score !== undefined && (
                        <Badge variant={assessment.score >= 70 ? 'success' : 'warning'}>
                          {assessment.score}%
                        </Badge>
                      )}
                    </div>
                    {assessment.completedAt && (
                      <p className="text-sm text-text-secondary mt-1">
                        Completed: {new Date(assessment.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No assessments recorded yet</p>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award size={20} />
                Certifications ({session.certifications?.length || 0})
              </h2>
            </div>
            {session.certifications && session.certifications.length > 0 ? (
              <div className="space-y-2">
                {session.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 bg-bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{cert.certificationNumber}</span>
                        <p className="text-sm text-text-secondary">
                          Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={cert.status === 'Active' ? 'success' : 'danger'}>
                        {cert.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No certifications issued yet</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="md">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" fullWidth leftIcon={Edit}>
                Edit Session
              </Button>
              <Button variant="outline" fullWidth leftIcon={Users}>
                Manage Participants
              </Button>
              <Button variant="outline" fullWidth leftIcon={FileText}>
                Add Assessment
              </Button>
              <Button variant="outline" fullWidth leftIcon={Award}>
                Issue Certification
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

