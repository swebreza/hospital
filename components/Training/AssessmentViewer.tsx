'use client'

import React from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { TrainingAssessment } from '@/lib/types'

interface AssessmentViewerProps {
  assessment: TrainingAssessment
}

export default function AssessmentViewer({ assessment }: AssessmentViewerProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'default'
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'danger'
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{assessment.assessmentType}</h3>
        {assessment.score !== undefined && (
          <Badge variant={getScoreColor(assessment.score)}>
            Score: {assessment.score}%
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {assessment.completedAt && (
          <div>
            <span className="text-sm font-medium text-text-secondary">Completed:</span>
            <p className="text-text-primary">
              {new Date(assessment.completedAt).toLocaleString()}
            </p>
          </div>
        )}

        {assessment.maxScore && (
          <div>
            <span className="text-sm font-medium text-text-secondary">Max Score:</span>
            <p className="text-text-primary">{assessment.maxScore}</p>
          </div>
        )}

        {assessment.grader && (
          <div>
            <span className="text-sm font-medium text-text-secondary">Graded By:</span>
            <p className="text-text-primary">{assessment.grader.name}</p>
          </div>
        )}

        {assessment.documentUrl && (
          <div>
            <span className="text-sm font-medium text-text-secondary">Document:</span>
            <a
              href={assessment.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Document
            </a>
          </div>
        )}

        {assessment.notes && (
          <div>
            <span className="text-sm font-medium text-text-secondary">Notes:</span>
            <p className="text-text-primary">{assessment.notes}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

