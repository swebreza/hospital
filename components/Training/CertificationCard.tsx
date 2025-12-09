'use client'

import React from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Award, Calendar, User, Stethoscope } from 'lucide-react'
import type { TrainingCertification } from '@/lib/types'

interface CertificationCardProps {
  certification: TrainingCertification
  onClick?: () => void
}

export default function CertificationCard({ certification, onClick }: CertificationCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Expired':
        return 'danger'
      case 'Renewed':
        return 'info'
      case 'Revoked':
        return 'danger'
      default:
        return 'default'
    }
  }

  const isExpiringSoon = () => {
    if (!certification.expiryDate || certification.status !== 'Active') return false
    const expiryDate = new Date(certification.expiryDate)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <Card hover={!!onClick} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-light rounded-lg">
            <Award className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{certification.certificationNumber}</h3>
            {certification.asset && (
              <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                <Stethoscope size={14} />
                {certification.asset.name}
              </p>
            )}
          </div>
        </div>
        <Badge variant={getStatusVariant(certification.status)}>
          {certification.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar size={16} />
          <span>
            Issued: {new Date(certification.issuedDate).toLocaleDateString()}
          </span>
        </div>

        {certification.expiryDate && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar size={16} />
            <span className={isExpiringSoon() ? 'text-warning font-medium' : ''}>
              Expires: {new Date(certification.expiryDate).toLocaleDateString()}
              {isExpiringSoon() && ' (Expiring Soon!)'}
            </span>
          </div>
        )}

        {certification.issuer && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <User size={16} />
            <span>Issued by: {certification.issuer.name}</span>
          </div>
        )}

        {(certification.preTestScore !== undefined || certification.postTestScore !== undefined) && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              {certification.preTestScore !== undefined && (
                <span className="text-text-secondary">
                  Pre-test: <span className="font-medium">{certification.preTestScore}%</span>
                </span>
              )}
              {certification.postTestScore !== undefined && (
                <span className="text-text-secondary">
                  Post-test: <span className="font-medium">{certification.postTestScore}%</span>
                </span>
              )}
              {certification.improvementPercentage !== undefined && (
                <span className="text-primary font-medium">
                  Improvement: {certification.improvementPercentage > 0 ? '+' : ''}
                  {certification.improvementPercentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

