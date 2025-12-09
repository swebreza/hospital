'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { trainingApi } from '@/lib/api/training'
import { toast } from 'sonner'
import type { TrainingCertification } from '@/lib/types'

interface CertificationIssuerProps {
  isOpen: boolean
  onClose: () => void
  participantId: string
  assetId: string
  preTestScore?: number
  postTestScore?: number
  onSuccess?: () => void
}

export default function CertificationIssuer({
  isOpen,
  onClose,
  participantId,
  assetId,
  preTestScore,
  postTestScore,
  onSuccess,
}: CertificationIssuerProps) {
  const [formData, setFormData] = useState({
    expiryDate: '',
    certificateUrl: '',
    issuedBy: '', // In real app, get from auth context
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const certificationData: Partial<TrainingCertification> = {
        participantId,
        assetId,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        certificateUrl: formData.certificateUrl || undefined,
        issuedBy: formData.issuedBy,
        preTestScore,
        postTestScore,
        status: 'Active',
      }

      await trainingApi.issueCertification(certificationData)
      toast.success('Certification issued successfully')
      onSuccess?.()
      onClose()
      setFormData({ expiryDate: '', certificateUrl: '', issuedBy: '' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to issue certification'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Certification"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Issue Certification
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-info-light rounded-lg">
          <p className="text-sm text-info">
            <strong>Note:</strong> Certification number will be auto-generated
          </p>
        </div>

        {preTestScore !== undefined && (
          <Input
            label="Pre-test Score"
            type="number"
            value={preTestScore.toString()}
            disabled
            fullWidth
          />
        )}

        {postTestScore !== undefined && (
          <Input
            label="Post-test Score"
            type="number"
            value={postTestScore.toString()}
            disabled
            fullWidth
          />
        )}

        <Input
          label="Expiry Date (Optional)"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          fullWidth
        />

        <Input
          label="Certificate URL (Optional)"
          value={formData.certificateUrl}
          onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
          placeholder="https://..."
          fullWidth
        />

        <Input
          label="Issued By (User ID)"
          value={formData.issuedBy}
          onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
          placeholder="Issuer user ID"
          required
          fullWidth
        />
      </form>
    </Modal>
  )
}

