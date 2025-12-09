'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import Button from '@/components/ui/Button'

interface ReplacementRecommendation {
  assetId: string
  assetName: string
  recommendation: 'Replace' | 'Monitor' | 'Maintain'
  priority: 'High' | 'Medium' | 'Low'
  score: number
  reasons: string[]
  estimatedReplacementCost?: number
  estimatedReplacementDate?: string
}

export default function ReplacementRecommendations() {
  const [recommendations, setRecommendations] = useState<ReplacementRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const response = await assetsApi.getLifecycleAnalysis('recommendations', {
        minAge: 5,
        maxServiceCostRatio: 0.5,
      })
      if (response.success && response.data) {
        setRecommendations(response.data as ReplacementRecommendation[])
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    High: 'bg-danger-light text-danger border-danger',
    Medium: 'bg-warning-light text-warning border-warning',
    Low: 'bg-info-light text-info border-info',
  }

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2' />
        <p className='text-text-secondary'>Loading recommendations...</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-text-primary flex items-center gap-2'>
            <AlertTriangle size={24} className='text-warning' />
            Replacement Recommendations
          </h2>
          <p className='text-text-secondary'>
            Assets recommended for replacement based on age, service costs, and utilization
          </p>
        </div>
        <Button variant='outline' onClick={loadRecommendations}>
          Refresh
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <div className='text-center py-8 bg-bg-secondary rounded-lg border border-border'>
          <AlertTriangle size={48} className='mx-auto mb-2 text-text-tertiary opacity-50' />
          <p className='text-text-secondary'>No replacement recommendations at this time</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {recommendations.map((rec) => (
            <div
              key={rec.assetId}
              className='bg-white rounded-lg border border-border p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <h3 className='font-semibold text-text-primary'>{rec.assetName}</h3>
                  <p className='text-xs text-text-secondary'>{rec.assetId}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[rec.priority]}`}
                >
                  {rec.priority} Priority
                </div>
              </div>

              <div className='flex items-center gap-4 mb-3'>
                <div className='flex items-center gap-2'>
                  <TrendingUp size={16} className='text-primary' />
                  <span className='text-sm text-text-secondary'>Score:</span>
                  <span className='text-sm font-semibold text-text-primary'>{rec.score}/100</span>
                </div>
                {rec.estimatedReplacementCost && (
                  <div className='flex items-center gap-2'>
                    <DollarSign size={16} className='text-success' />
                    <span className='text-sm text-text-secondary'>Est. Cost:</span>
                    <span className='text-sm font-semibold text-text-primary'>
                      ₹ {rec.estimatedReplacementCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className='mb-3'>
                <p className='text-xs text-text-secondary mb-1'>Recommendation:</p>
                <p className='text-sm font-medium text-text-primary'>{rec.recommendation}</p>
              </div>

              {rec.reasons.length > 0 && (
                <div>
                  <p className='text-xs text-text-secondary mb-1'>Reasons:</p>
                  <ul className='list-disc list-inside text-sm text-text-secondary space-y-1'>
                    {rec.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

