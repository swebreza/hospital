'use client'

import React, { useState, useEffect } from 'react'
import { Plus, List as ListIcon, Calendar as CalendarIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import TrainingSessionCard from '@/components/Training/TrainingSessionCard'
import TrainingSessionForm from '@/components/Training/TrainingSessionForm'
import SeedUsersButton from '@/components/Training/SeedUsersButton'
import { trainingApi } from '@/lib/api/training'
import { toast } from 'sonner'
import EmptyState from '@/components/ui/EmptyState'
import { GraduationCap } from 'lucide-react'
import type { TrainingSession } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function TrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | undefined>()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const router = useRouter()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await trainingApi.getAll(1, 100)
      setSessions(response.data)
    } catch (error) {
      console.error('Failed to load training sessions:', error)
      toast.error('Failed to load training sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedSession(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (session: TrainingSession) => {
    setSelectedSession(session)
    setIsFormOpen(true)
  }

  const handleSessionClick = (session: TrainingSession) => {
    router.push(`/training/${session.id}`)
  }

  const handleSuccess = () => {
    loadSessions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Training Management</h1>
          <p className="text-base text-text-secondary">
            Manage medical equipment training sessions and certifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeedUsersButton />
          <div className="flex bg-bg-tertiary p-1 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white shadow text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ListIcon size={16} />
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-white shadow text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <CalendarIcon size={16} />
              Calendar
            </button>
          </div>
          <Button variant="primary" leftIcon={Plus} onClick={handleCreate}>
            Create Session
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No training sessions found"
          description="Get started by creating your first training session"
          actionLabel="Create Session"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <TrainingSessionCard
              key={session.id}
              session={session}
              onClick={() => handleSessionClick(session)}
            />
          ))}
        </div>
      )}

      <TrainingSessionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        session={selectedSession}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

