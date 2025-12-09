'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { User, Award, Calendar, TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import CertificationCard from '@/components/Training/CertificationCard'
import { trainingApi } from '@/lib/api/training'
import { toast } from 'sonner'

interface UserTrainingProfile {
  userId: string
  trainingHistory: Array<{
    participant: any
    session?: any
  }>
  certifications: any[]
  assessments: any[]
  summary: {
    totalSessions: number
    attendedSessions: number
    certifiedEquipment: number
    activeCertifications: number
    expiringCertifications: number
  }
}

export default function TrainingProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const [profile, setProfile] = useState<UserTrainingProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await trainingApi.getUserProfile(userId)
      setProfile(response.data as UserTrainingProfile)
    } catch (error) {
      console.error('Failed to load training profile:', error)
      toast.error('Failed to load training profile')
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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Training profile not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Training Profile</h1>
        <p className="text-text-secondary">User ID: {userId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg">
              <Calendar className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Sessions</p>
              <p className="text-2xl font-bold text-text-primary">{profile.summary.totalSessions}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-light rounded-lg">
              <User className="text-success" size={20} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Attended</p>
              <p className="text-2xl font-bold text-text-primary">{profile.summary.attendedSessions}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-light rounded-lg">
              <Award className="text-info" size={20} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Certifications</p>
              <p className="text-2xl font-bold text-text-primary">{profile.summary.activeCertifications}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-light rounded-lg">
              <TrendingUp className="text-warning" size={20} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Equipment Certified</p>
              <p className="text-2xl font-bold text-text-primary">{profile.summary.certifiedEquipment}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="text-xl font-semibold mb-4">Active Certifications</h2>
          {profile.certifications.filter((c: any) => c.status === 'Active').length > 0 ? (
            <div className="space-y-3">
              {profile.certifications
                .filter((c: any) => c.status === 'Active')
                .map((cert: any) => (
                  <CertificationCard key={cert.id} certification={cert} />
                ))}
            </div>
          ) : (
            <p className="text-text-secondary">No active certifications</p>
          )}
        </Card>

        <Card padding="md">
          <h2 className="text-xl font-semibold mb-4">Training History</h2>
          {profile.trainingHistory.length > 0 ? (
            <div className="space-y-2">
              {profile.trainingHistory.map((item, index) => (
                <div key={index} className="p-3 bg-bg-secondary rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.session?.title || 'Training Session'}</p>
                      <p className="text-sm text-text-secondary">
                        {item.session?.sessionDate
                          ? new Date(item.session.sessionDate).toLocaleDateString()
                          : 'Date not available'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.participant.attendanceStatus === 'Attended' ? 'success' : 'warning'
                      }
                    >
                      {item.participant.attendanceStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No training history</p>
          )}
        </Card>
      </div>

      {profile.summary.expiringCertifications > 0 && (
        <Card padding="md" className="border-warning">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-light rounded-lg">
              <Award className="text-warning" size={20} />
            </div>
            <div>
              <p className="font-medium text-warning">
                {profile.summary.expiringCertifications} certification(s) expiring soon
              </p>
              <p className="text-sm text-text-secondary">
                Please review and renew certifications before expiry
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

