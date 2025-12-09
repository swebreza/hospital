'use client'

import React from 'react'
import { AlertTriangle, Clock, XCircle, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Contract } from '@/lib/types'

interface ContractExpiryDashboardProps {
  contracts: Array<
    Contract & {
      daysUntilExpiry: number
      expiryLevel: 'critical' | 'warning' | 'info' | 'expired'
    }
  >
  summary?: {
    total: number
    critical: number
    warning: number
    info: number
    expired?: number
  }
}

export default function ContractExpiryDashboard({
  contracts,
  summary,
}: ContractExpiryDashboardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getExpiryBadgeVariant = (level: string) => {
    switch (level) {
      case 'expired':
        return 'danger'
      case 'critical':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'default'
    }
  }

  const getExpiryIcon = (level: string) => {
    switch (level) {
      case 'expired':
        return XCircle
      case 'critical':
        return AlertTriangle
      case 'warning':
        return Clock
      default:
        return CheckCircle
    }
  }

  const criticalContracts = contracts.filter((c) => c.expiryLevel === 'critical' || c.expiryLevel === 'expired')
  const warningContracts = contracts.filter((c) => c.expiryLevel === 'warning')
  const infoContracts = contracts.filter((c) => c.expiryLevel === 'info')

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card padding='md'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Total Expiring</span>
              <Clock size={18} className='text-text-secondary' />
            </div>
            <p className='text-2xl font-bold text-text-primary'>{summary.total}</p>
          </Card>

          <Card padding='md' className='border-l-4 border-danger'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Critical</span>
              <AlertTriangle size={18} className='text-danger' />
            </div>
            <p className='text-2xl font-bold text-danger'>
              {summary.critical + (summary.expired || 0)}
            </p>
            <p className='text-xs text-text-secondary mt-1'>
              {'<'}= 30 days or expired
            </p>
          </Card>

          <Card padding='md' className='border-l-4 border-warning'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Warning</span>
              <Clock size={18} className='text-warning' />
            </div>
            <p className='text-2xl font-bold text-warning'>{summary.warning}</p>
            <p className='text-xs text-text-secondary mt-1'>31-60 days</p>
          </Card>

          <Card padding='md' className='border-l-4 border-info'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Info</span>
              <CheckCircle size={18} className='text-info' />
            </div>
            <p className='text-2xl font-bold text-info'>{summary.info}</p>
            <p className='text-xs text-text-secondary mt-1'>61-90 days</p>
          </Card>
        </div>
      )}

      {/* Critical Contracts */}
      {criticalContracts.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
            <AlertTriangle size={20} className='text-danger' />
            Critical / Expired Contracts ({criticalContracts.length})
          </h3>
          <div className='space-y-3'>
            {criticalContracts.map((contract) => {
              const Icon = getExpiryIcon(contract.expiryLevel)
              return (
                <Card
                  key={contract.id}
                  padding='md'
                  className='border-l-4 border-danger'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h4 className='font-semibold text-text-primary'>
                          {contract.type} Contract
                        </h4>
                        <Badge
                          variant={getExpiryBadgeVariant(contract.expiryLevel)}
                          icon={Icon}
                        >
                          {contract.expiryLevel === 'expired'
                            ? 'Expired'
                            : `${contract.daysUntilExpiry} days left`}
                        </Badge>
                      </div>
                      {contract.vendor && (
                        <p className='text-sm text-text-secondary mb-1'>
                          Vendor: {contract.vendor.name}
                        </p>
                      )}
                      <p className='text-sm text-text-secondary'>
                        Expires: {formatDate(contract.endDate)}
                      </p>
                      <p className='text-sm font-medium text-text-primary mt-1'>
                        Value: {formatCurrency(contract.value || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Warning Contracts */}
      {warningContracts.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
            <Clock size={20} className='text-warning' />
            Warning ({warningContracts.length})
          </h3>
          <div className='space-y-3'>
            {warningContracts.map((contract) => (
              <Card
                key={contract.id}
                padding='md'
                className='border-l-4 border-warning'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h4 className='font-semibold text-text-primary'>
                        {contract.type} Contract
                      </h4>
                      <Badge variant='warning' icon={Clock}>
                        {contract.daysUntilExpiry} days left
                      </Badge>
                    </div>
                    {contract.vendor && (
                      <p className='text-sm text-text-secondary mb-1'>
                        Vendor: {contract.vendor.name}
                      </p>
                    )}
                    <p className='text-sm text-text-secondary'>
                      Expires: {formatDate(contract.endDate)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Contracts */}
      {infoContracts.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
            <CheckCircle size={20} className='text-info' />
            Upcoming ({infoContracts.length})
          </h3>
          <div className='space-y-3'>
            {infoContracts.map((contract) => (
              <Card
                key={contract.id}
                padding='md'
                className='border-l-4 border-info'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h4 className='font-semibold text-text-primary'>
                        {contract.type} Contract
                      </h4>
                      <Badge variant='info' icon={CheckCircle}>
                        {contract.daysUntilExpiry} days left
                      </Badge>
                    </div>
                    {contract.vendor && (
                      <p className='text-sm text-text-secondary mb-1'>
                        Vendor: {contract.vendor.name}
                      </p>
                    )}
                    <p className='text-sm text-text-secondary'>
                      Expires: {formatDate(contract.endDate)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {contracts.length === 0 && (
        <Card padding='md'>
          <p className='text-center text-text-secondary py-8'>
            No contracts expiring in the selected timeframe
          </p>
        </Card>
      )}
    </div>
  )
}

