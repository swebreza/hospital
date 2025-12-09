'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { trainingApi } from '@/lib/api/training'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import type { TrainingAssessment } from '@/lib/types'

interface AssessmentUploadProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  participantId: string
  assessmentType: 'PreTest' | 'PostTest'
  onSuccess?: () => void
}

export default function AssessmentUpload({
  isOpen,
  onClose,
  sessionId,
  participantId,
  assessmentType,
  onSuccess,
}: AssessmentUploadProps) {
  const [formData, setFormData] = useState({
    score: '',
    maxScore: '100',
    documentUrl: '',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const assessmentData: Partial<TrainingAssessment> = {
        participantId,
        assessmentType,
        score: formData.score ? parseFloat(formData.score) : undefined,
        maxScore: parseFloat(formData.maxScore) || 100,
        documentUrl: formData.documentUrl,
        notes: formData.notes || undefined,
        completedAt: new Date().toISOString(),
      }

      // TODO: Upload file if provided
      if (file) {
        // File upload logic would go here
        toast.info('File upload feature coming soon')
      }

      await trainingApi.uploadAssessment(sessionId, assessmentData)
      toast.success(`${assessmentType} uploaded successfully`)
      onSuccess?.()
      onClose()
      setFormData({ score: '', maxScore: '100', documentUrl: '', notes: '' })
      setFile(null)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload assessment'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upload ${assessmentType}`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Upload
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Score (%)"
            type="number"
            min="0"
            max="100"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            placeholder="85"
            fullWidth
          />
          <Input
            label="Max Score"
            type="number"
            value={formData.maxScore}
            onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Upload Assessment Document (PDF)
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Upload className="mx-auto mb-2 text-text-secondary" size={24} />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              Click to upload or drag and drop
            </label>
            {file && (
              <p className="mt-2 text-sm text-text-secondary">{file.name}</p>
            )}
          </div>
        </div>

        <Input
          label="Document URL (Alternative)"
          value={formData.documentUrl}
          onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
          placeholder="https://..."
          fullWidth
        />

        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the assessment..."
          rows={3}
          fullWidth
        />
      </form>
    </Modal>
  )
}

