'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { trainingApi } from '@/lib/api/training'
import { assetsApi } from '@/lib/api/assets'
import { usersApi } from '@/lib/api/users'
import { toast } from 'sonner'
import type { TrainingSession, Asset, User } from '@/lib/types'

interface TrainingSessionFormProps {
  isOpen: boolean
  onClose: () => void
  session?: TrainingSession
  onSuccess?: () => void
}

export default function TrainingSessionForm({
  isOpen,
  onClose,
  session,
  onSuccess,
}: TrainingSessionFormProps) {
  const [formData, setFormData] = useState({
    assetId: '',
    sessionDate: '',
    trainerId: '',
    title: '',
    description: '',
    department: '',
    location: '',
    durationMinutes: '',
    status: 'Scheduled' as TrainingSession['status'],
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [trainers, setTrainers] = useState<User[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setFormErrors({})
      if (session) {
        setFormData({
          assetId: session.asset?.id || session.assetId || '',
          sessionDate: new Date(session.sessionDate).toISOString().slice(0, 16),
          trainerId: session.trainer?.email || session.trainerId || '',
          title: session.title,
          description: session.description || '',
          department: session.department,
          location: session.location || '',
          durationMinutes: session.durationMinutes?.toString() || '',
          status: session.status,
          notes: session.notes || '',
        })
      } else {
        setFormData({
          assetId: '',
          sessionDate: '',
          trainerId: '', // Will be set by loadTrainers
          title: '',
          description: '',
          department: '',
          location: '',
          durationMinutes: '',
          status: 'Scheduled',
          notes: '',
        })
      }
      loadAssets()
      loadTrainers()
    }
  }, [isOpen, session])

  const loadAssets = async () => {
    try {
      const response = await assetsApi.getAll(1, 100)
      setAssets(response.data)
    } catch (error) {
      console.error('Failed to load assets:', error)
      toast.error('Failed to load assets')
    }
  }

  const loadTrainers = async () => {
    try {
      const response = await usersApi.getAll()
      if (response.success && response.data) {
        setTrainers(response.data)
      }
    } catch (error) {
      console.error('Failed to load trainers:', error)
      toast.error('Failed to load trainers')
    }
  }

  // Set default trainer when trainers are loaded and form is for new session
  useEffect(() => {
    if (isOpen && !session && trainers.length > 0 && !formData.trainerId) {
      setFormData((prev) => ({
        ...prev,
        trainerId: trainers[0].email, // Use email as identifier
      }))
    }
  }, [trainers, isOpen, session])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.assetId) errors.assetId = 'Asset is required'
    if (!formData.sessionDate) errors.sessionDate = 'Training date is required'
    if (!formData.trainerId) errors.trainerId = 'Trainer is required'
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.department.trim()) errors.department = 'Department is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        assetId: formData.assetId,
        sessionDate: formData.sessionDate ? new Date(formData.sessionDate).toISOString() : '',
        trainerId: formData.trainerId, // This will be email or UUID
        title: formData.title.trim(),
        description: formData.description.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes, 10) : undefined,
        status: formData.status,
        notes: formData.notes.trim(),
      }

      if (session) {
        await trainingApi.update(session.id, submitData)
        toast.success('Training session updated successfully')
      } else {
        await trainingApi.create(submitData)
        toast.success('Training session created successfully')
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Error saving training session:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save training session'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={session ? 'Edit Training Session' : 'Create Training Session'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="primary" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            {session ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Equipment/Asset"
              options={[
                { value: '', label: 'Select Asset' },
                ...assets.map((asset) => ({
                  value: asset.id,
                  label: `${asset.name}${asset.model ? ` (${asset.model})` : ''}`,
                })),
              ]}
              value={formData.assetId}
              onChange={(e) => {
                setFormData({ ...formData, assetId: e.target.value })
                setFormErrors({ ...formErrors, assetId: '' })
              }}
              required
              fullWidth
            />
            {formErrors.assetId && (
              <p className="text-xs text-red-500 mt-1">{formErrors.assetId}</p>
            )}
          </div>

          <div>
            <Input
              label="Training Date & Time"
              type="datetime-local"
              value={formData.sessionDate}
              onChange={(e) => {
                setFormData({ ...formData, sessionDate: e.target.value })
                setFormErrors({ ...formErrors, sessionDate: '' })
              }}
              required
              fullWidth
              error={formErrors.sessionDate}
            />
          </div>
        </div>

        <Input
          label="Training Title"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value })
            setFormErrors({ ...formErrors, title: '' })
          }}
          placeholder="e.g., Ventilator Operation Training"
          required
          fullWidth
          error={formErrors.title}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Training description and objectives..."
          rows={3}
          fullWidth
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => {
                setFormData({ ...formData, department: e.target.value })
                setFormErrors({ ...formErrors, department: '' })
              }}
              placeholder="e.g., ICU, Radiology"
              required
              fullWidth
              error={formErrors.department}
            />
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Training venue"
            fullWidth
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Trainer"
              options={[
                { value: '', label: 'Select Trainer' },
                ...trainers.map((trainer) => ({
                  value: trainer.email, // Use email as identifier
                  label: `${trainer.name} (${trainer.email})`,
                })),
              ]}
              value={formData.trainerId}
              onChange={(e) => {
                setFormData({ ...formData, trainerId: e.target.value })
                setFormErrors({ ...formErrors, trainerId: '' })
              }}
              required
              fullWidth
            />
            {formErrors.trainerId && (
              <p className="text-xs text-red-500 mt-1">{formErrors.trainerId}</p>
            )}
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            placeholder="120"
            min="1"
            fullWidth
          />
        </div>

        <Select
          label="Status"
          options={[
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'InProgress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TrainingSession['status'] })}
          fullWidth
        />

        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={2}
          fullWidth
        />
      </form>
    </Modal>
  )
}

