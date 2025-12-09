'use client'

import React from 'react'
import { Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Contract } from '@/lib/types'

interface ContractListProps {
  contracts: Contract[]
  onViewDetails?: (id: string) => void
  onRenew?: (id: string) => void
  onCancel?: (id: string) => void
}

export default function ContractList({
  contracts,
  onViewDetails,
  onRenew,
  onCancel,
}: ContractListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryStatus = (contract: Contract) => {
    if (contract.status !== 'Active') return null

    const days = getDaysUntilExpiry(contract.endDate)
    if (days < 0) {
      return { level: 'expired', label: 'Expired', variant: 'danger' as const }
    } else if (days <= 30) {
      return { level: 'critical', label: `${days} days left`, variant: 'danger' as const }
    } else if (days <= 60) {
      return { level: 'warning', label: `${days} days left`, variant: 'warning' as const }
    } else if (days <= 90) {
      return { level: 'info', label: `${days} days left`, variant: 'info' as const }
    }
    return null
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Expired':
        return 'danger'
      case 'Renewed':
        return 'info'
      case 'Cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  if (contracts.length === 0) {
    return (
      <Card padding='md'>
        <p className='text-center text-text-secondary py-8'>
          No contracts found
        </p>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {contracts.map((contract) => {
        const expiryStatus = getExpiryStatus(contract)

        return (
          <Card key={contract.id} padding='md' hover={!!onViewDetails}>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <h4 className='font-semibold text-text-primary'>
                    {contract.type} Contract
                  </h4>
                  <Badge variant={getStatusBadgeVariant(contract.status)}>
                    {contract.status}
                  </Badge>
                  {expiryStatus && (
                    <Badge variant={expiryStatus.variant} icon={AlertCircle}>
                      {expiryStatus.label}
                    </Badge>
                  )}
                </div>
                {contract.vendor && (
                  <p className='text-sm text-text-secondary mb-1'>
                    Vendor: {contract.vendor.name}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar size={16} className='text-text-secondary' />
                <div>
                  <p className='text-text-secondary'>Start Date</p>
                  <p className='font-medium text-text-primary'>
                    {formatDate(contract.startDate)}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 text-sm'>
                <Calendar size={16} className='text-text-secondary' />
                <div>
                  <p className='text-text-secondary'>End Date</p>
                  <p className='font-medium text-text-primary'>
                    {formatDate(contract.endDate)}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 text-sm'>
                <DollarSign size={16} className='text-text-secondary' />
                <div>
                  <p className='text-text-secondary'>Value</p>
                  <p className='font-medium text-text-primary'>
                    {formatCurrency(contract.value || 0)}
                  </p>
                </div>
              </div>
            </div>

            {contract.assets && contract.assets.length > 0 && (
              <div className='mb-4 pt-4 border-t border-border'>
                <p className='text-sm text-text-secondary mb-2'>
                  Assets ({contract.assets.length})
                </p>
                <div className='flex flex-wrap gap-2'>
                  {contract.assets.slice(0, 5).map((asset) => (
                    <Badge key={asset.id} variant='info' size='sm'>
                      {asset.name}
                    </Badge>
                  ))}
                  {contract.assets.length > 5 && (
                    <Badge variant='default' size='sm'>
                      +{contract.assets.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {(onViewDetails || onRenew || onCancel) && (
              <div className='flex gap-2 pt-4 border-t border-border'>
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(contract.id)}
                    className='text-sm text-primary hover:underline'
                  >
                    View Details
                  </button>
                )}
                {onRenew && contract.status === 'Active' && (
                  <button
                    onClick={() => onRenew(contract.id)}
                    className='text-sm text-info hover:underline'
                  >
                    Renew
                  </button>
                )}
                {onCancel && contract.status === 'Active' && (
                  <button
                    onClick={() => onCancel(contract.id)}
                    className='text-sm text-danger hover:underline'
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

