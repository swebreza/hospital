'use client'

import React from 'react'
import { TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface PerformanceMetricsProps {
  performance: {
    rating: number
    performanceScore: number
    totalContracts: number
    activeContracts: number
    expiredContracts: number
    totalContractValue: number
    expiringSoon: number
    expired: number
    averageContractValue: number
    contractRenewalRate: string
  }
}

export default function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 75) return 'text-info'
    if (score >= 60) return 'text-warning'
    return 'text-danger'
  }

  const getPerformanceBadgeVariant = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 75) return 'info'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  return (
    <div className='space-y-6'>
      {/* Main Performance Score */}
      <Card padding='lg' className='bg-gradient-to-br from-primary/5 to-info/5'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-sm font-medium text-text-secondary mb-1'>
              Overall Performance Score
            </h3>
            <p className={`text-4xl font-bold ${getPerformanceColor(performance.performanceScore)}`}>
              {performance.performanceScore}%
            </p>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <Badge variant={getPerformanceBadgeVariant(performance.performanceScore)}>
              {performance.performanceScore >= 90
                ? 'Excellent'
                : performance.performanceScore >= 75
                ? 'Good'
                : performance.performanceScore >= 60
                ? 'Fair'
                : 'Poor'}
            </Badge>
            <div className='flex items-center gap-1'>
              <TrendingUp size={20} className={getPerformanceColor(performance.performanceScore)} />
              <span className='text-sm text-text-secondary'>Rating: {performance.rating.toFixed(1)}/5</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card padding='md'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-text-secondary'>Total Contracts</span>
            <CheckCircle size={18} className='text-text-secondary' />
          </div>
          <p className='text-2xl font-bold text-text-primary'>
            {performance.totalContracts}
          </p>
          <div className='flex items-center gap-2 mt-2'>
            <Badge variant='success' size='sm'>
              {performance.activeContracts} Active
            </Badge>
            {performance.expiredContracts > 0 && (
              <Badge variant='default' size='sm'>
                {performance.expiredContracts} Expired
              </Badge>
            )}
          </div>
        </Card>

        <Card padding='md'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-text-secondary'>Total Contract Value</span>
            <DollarSign size={18} className='text-text-secondary' />
          </div>
          <p className='text-2xl font-bold text-text-primary'>
            {formatCurrency(performance.totalContractValue)}
          </p>
          <p className='text-xs text-text-secondary mt-1'>
            Avg: {formatCurrency(performance.averageContractValue)}
          </p>
        </Card>

        <Card padding='md'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-text-secondary'>Renewal Rate</span>
            <TrendingUp size={18} className='text-success' />
          </div>
          <p className='text-2xl font-bold text-text-primary'>
            {performance.contractRenewalRate}%
          </p>
          <p className='text-xs text-text-secondary mt-1'>
            Contract retention rate
          </p>
        </Card>

        <Card padding='md'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-text-secondary'>Expiring Soon</span>
            <Clock size={18} className='text-warning' />
          </div>
          <p className='text-2xl font-bold text-text-primary'>
            {performance.expiringSoon}
          </p>
          {performance.expired > 0 && (
            <p className='text-xs text-danger mt-1'>
              {performance.expired} expired
            </p>
          )}
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card padding='md'>
        <h3 className='text-lg font-semibold text-text-primary mb-4'>
          Performance Breakdown
        </h3>
        <div className='space-y-4'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-primary'>Contract Management</span>
              <span className='text-sm font-medium text-text-primary'>
                {performance.activeContracts > 0
                  ? Math.round(
                      (performance.activeContracts / performance.totalContracts) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className='w-full bg-bg-tertiary rounded-full h-2'>
              <div
                className='bg-success h-2 rounded-full transition-all'
                style={{
                  width: `${
                    performance.activeContracts > 0
                      ? Math.round(
                          (performance.activeContracts / performance.totalContracts) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-primary'>Renewal Success Rate</span>
              <span className='text-sm font-medium text-text-primary'>
                {performance.contractRenewalRate}%
              </span>
            </div>
            <div className='w-full bg-bg-tertiary rounded-full h-2'>
              <div
                className='bg-info h-2 rounded-full transition-all'
                style={{
                  width: `${parseFloat(performance.contractRenewalRate)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

