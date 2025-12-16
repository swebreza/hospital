'use client'

import React, { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { Contract, Asset, ContractType, ContractStatus } from '@/lib/types'

interface ContractFormProps {
  contract?: Contract
  vendorId?: string
  assets?: Asset[]
  onSubmit: (data: Partial<Contract>) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ContractForm({
  contract,
  vendorId,
  assets = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: ContractFormProps) {
  const [formData, setFormData] = useState({
    vendorId: contract?.vendorId || vendorId || '',
    type: contract?.type || 'AMC',
    startDate: contract?.startDate
      ? new Date(contract.startDate).toISOString().split('T')[0]
      : '',
    endDate: contract?.endDate
      ? new Date(contract.endDate).toISOString().split('T')[0]
      : '',
    value: contract?.value?.toString() || '',
    renewalDate: contract?.renewalDate
      ? new Date(contract.renewalDate).toISOString().split('T')[0]
      : '',
    status: contract?.status || 'Active',
    notes: contract?.notes || '',
  })

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    contract?.assetIds || []
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Auto-calculate renewal date (30 days before end date)
    if (formData.endDate && !contract) {
      const endDate = new Date(formData.endDate)
      const renewalDate = new Date(endDate)
      renewalDate.setDate(renewalDate.getDate() - 30)
      setFormData((prev) => ({
        ...prev,
        renewalDate: renewalDate.toISOString().split('T')[0],
      }))
    }
  }, [formData.endDate, contract])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.vendorId) {
      newErrors.vendorId = 'Vendor is required'
    }

    if (!formData.type) {
      newErrors.type = 'Contract type is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    if (formData.value) {
      const value = parseFloat(formData.value)
      if (isNaN(value) || value < 0) {
        newErrors.value = 'Value must be a positive number'
      }
    }

    // For AMC and CMC, at least one asset is required
    if (
      (formData.type === 'AMC' || formData.type === 'CMC') &&
      selectedAssetIds.length === 0
    ) {
      newErrors.assets = 'At least one asset is required for AMC/CMC contracts'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const submitData: Partial<Contract> = {
      vendorId: formData.vendorId,
      type: formData.type as Contract['type'],
      startDate: formData.startDate,
      endDate: formData.endDate,
      value: formData.value ? parseFloat(formData.value) : 0,
      renewalDate: formData.renewalDate || undefined,
      status: formData.status as Contract['status'],
      assetIds: selectedAssetIds,
      notes: formData.notes || undefined,
    }

    onSubmit(submitData)
  }

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {!vendorId && (
        <Input
          label='Vendor ID'
          value={formData.vendorId}
          onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
          error={errors.vendorId}
          required
          fullWidth
        />
      )}

      <Select
        label='Contract Type'
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
        error={errors.type}
        options={[
          { value: 'AMC', label: 'AMC (Annual Maintenance Contract)' },
          { value: 'CMC', label: 'CMC (Comprehensive Maintenance Contract)' },
          { value: 'Warranty', label: 'Warranty' },
          { value: 'Service', label: 'Service' },
        ]}
        required
        fullWidth
      />

      <div className='grid grid-cols-2 gap-4'>
        <Input
          label='Start Date'
          type='date'
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={errors.startDate}
          required
          fullWidth
        />

        <Input
          label='End Date'
          type='date'
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          error={errors.endDate}
          required
          fullWidth
        />
      </div>

      <Input
        label='Contract Value (₹)'
        type='number'
        min='0'
        step='0.01'
        placeholder='0.00'
        value={formData.value}
        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
        error={errors.value}
        fullWidth
      />

      <Input
        label='Renewal Date'
        type='date'
        value={formData.renewalDate}
        onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
        helperText='Typically 30 days before end date'
        fullWidth
      />

      <Select
        label='Status'
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
        options={[
          { value: 'Active', label: 'Active' },
          { value: 'Expired', label: 'Expired' },
          { value: 'Renewed', label: 'Renewed' },
          { value: 'Cancelled', label: 'Cancelled' },
        ]}
        fullWidth
      />

      {/* Asset Selection */}
      {(formData.type === 'AMC' || formData.type === 'CMC') && (
        <div>
          <label className='text-sm font-medium text-text-primary mb-2 block'>
            Select Assets {formData.type === 'AMC' || formData.type === 'CMC' ? '*' : ''}
          </label>
          {errors.assets && (
            <p className='text-xs text-danger font-medium mb-2'>{errors.assets}</p>
          )}
          <div className='border border-border rounded-lg p-4 max-h-60 overflow-y-auto'>
            {assets.length === 0 ? (
              <p className='text-sm text-text-secondary text-center py-4'>
                No assets available
              </p>
            ) : (
              <div className='space-y-2'>
                {assets.map((asset) => (
                  <label
                    key={asset.id}
                    className='flex items-center gap-3 p-2 hover:bg-bg-secondary rounded cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedAssetIds.includes(asset.id)}
                      onChange={() => toggleAsset(asset.id)}
                      className='w-4 h-4 text-primary border-border rounded focus:ring-primary'
                    />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-text-primary'>
                        {asset.name}
                      </p>
                      <p className='text-xs text-text-secondary'>
                        {asset.department} • {asset.location}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedAssetIds.length > 0 && (
            <p className='text-xs text-text-secondary mt-2'>
              {selectedAssetIds.length} asset(s) selected
            </p>
          )}
        </div>
      )}

      <div>
        <label className='text-sm font-medium text-text-primary mb-2 block'>
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className='w-full px-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          placeholder='Additional notes about this contract...'
        />
      </div>

      <div className='flex justify-end gap-3 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' variant='primary' isLoading={isLoading}>
          {contract ? 'Update Contract' : 'Create Contract'}
        </Button>
      </div>
    </form>
  )
}

