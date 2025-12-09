'use client'

import React, { useState } from 'react'
import { Calendar, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Contract } from '@/lib/types'

interface ContractRenewalWorkflowProps {
  contract: Contract
  onRenew: (renewalData: {
    newStartDate: string
    newEndDate: string
    newValue?: number
    notes?: string
  }) => Promise<void>
  onCancel: () => void
}

export default function ContractRenewalWorkflow({
  contract,
  onRenew,
  onCancel,
}: ContractRenewalWorkflowProps) {
  const [renewalData, setRenewalData] = useState({
    newStartDate: new Date(contract.endDate).toISOString().split('T')[0],
    newEndDate: '',
    newValue: contract.value?.toString() || '',
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate suggested end date (1 year from new start date)
  const calculateEndDate = (startDate: string) => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1)
    return end.toISOString().split('T')[0]
  }

  const handleStartDateChange = (date: string) => {
    setRenewalData({
      ...renewalData,
      newStartDate: date,
      newEndDate: calculateEndDate(date),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renewalData.newStartDate || !renewalData.newEndDate) {
      alert('Please fill in all required dates')
      return
    }

    try {
      setIsSubmitting(true)
      await onRenew({
        newStartDate: renewalData.newStartDate,
        newEndDate: renewalData.newEndDate,
        newValue: renewalData.newValue ? parseFloat(renewalData.newValue) : undefined,
        notes: renewalData.notes || undefined,
      })
    } catch (error) {
      console.error('Error renewing contract:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
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

  const daysUntilExpiry = Math.ceil(
    (new Date(contract.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className='space-y-6'>
      {/* Current Contract Summary */}
      <Card padding='md' className='border-l-4 border-warning'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <h3 className='font-semibold text-lg text-text-primary mb-2'>
              Current Contract
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-text-secondary'>Type:</span>
                <Badge variant='info'>{contract.type}</Badge>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar size={16} className='text-text-secondary' />
                <span className='text-text-secondary'>Period:</span>
                <span className='text-text-primary'>
                  {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <DollarSign size={16} className='text-text-secondary' />
                <span className='text-text-secondary'>Value:</span>
                <span className='text-text-primary font-medium'>
                  {formatCurrency(contract.value || 0)}
                </span>
              </div>
              {daysUntilExpiry > 0 ? (
                <div className='flex items-center gap-2'>
                  <AlertCircle size={16} className='text-warning' />
                  <span className='text-warning font-medium'>
                    Expires in {daysUntilExpiry} days
                  </span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <XCircle size={16} className='text-danger' />
                  <span className='text-danger font-medium'>Contract Expired</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Renewal Form */}
      <Card padding='md'>
        <h3 className='font-semibold text-lg text-text-primary mb-4'>
          Renewal Details
        </h3>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='New Start Date'
              type='date'
              value={renewalData.newStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
              fullWidth
            />

            <Input
              label='New End Date'
              type='date'
              value={renewalData.newEndDate}
              onChange={(e) =>
                setRenewalData({ ...renewalData, newEndDate: e.target.value })
              }
              required
              fullWidth
            />
          </div>

          <Input
            label='New Contract Value (₹)'
            type='number'
            min='0'
            step='0.01'
            placeholder={contract.value?.toString() || '0.00'}
            value={renewalData.newValue}
            onChange={(e) =>
              setRenewalData({ ...renewalData, newValue: e.target.value })
            }
            helperText='Leave empty to keep current value'
            fullWidth
          />

          <div>
            <label className='text-sm font-medium text-text-primary mb-2 block'>
              Renewal Notes
            </label>
            <textarea
              value={renewalData.notes}
              onChange={(e) =>
                setRenewalData({ ...renewalData, notes: e.target.value })
              }
              rows={3}
              className='w-full px-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
              placeholder='Add any notes about this renewal...'
            />
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' variant='primary' isLoading={isSubmitting}>
              Renew Contract
            </Button>
          </div>
        </form>
      </Card>

      {/* Renewal Comparison */}
      {renewalData.newStartDate && renewalData.newEndDate && (
        <Card padding='md' className='bg-info/5'>
          <h3 className='font-semibold text-lg text-text-primary mb-4 flex items-center gap-2'>
            <CheckCircle size={20} className='text-info' />
            Renewal Preview
          </h3>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-text-secondary mb-1'>Current Period</p>
              <p className='font-medium text-text-primary'>
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </p>
            </div>
            <div>
              <p className='text-text-secondary mb-1'>Renewal Period</p>
              <p className='font-medium text-text-primary'>
                {formatDate(renewalData.newStartDate)} -{' '}
                {formatDate(renewalData.newEndDate)}
              </p>
            </div>
            <div>
              <p className='text-text-secondary mb-1'>Current Value</p>
              <p className='font-medium text-text-primary'>
                {formatCurrency(contract.value || 0)}
              </p>
            </div>
            <div>
              <p className='text-text-secondary mb-1'>Renewal Value</p>
              <p className='font-medium text-text-primary'>
                {renewalData.newValue
                  ? formatCurrency(parseFloat(renewalData.newValue))
                  : formatCurrency(contract.value || 0)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

