'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Vendor, EscalationContact } from '@/lib/types'

interface VendorFormProps {
  vendor?: Vendor
  onSubmit: (data: Partial<Vendor>) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function VendorForm({
  vendor,
  onSubmit,
  onCancel,
  isLoading = false,
}: VendorFormProps) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    contactPerson: vendor?.contactPerson || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    rating: vendor?.rating?.toString() || '',
    performanceScore: vendor?.performanceScore?.toString() || '',
    status: (vendor?.status as string) || 'Active',
  })

  const [escalationMatrix, setEscalationMatrix] = useState<EscalationContact[]>(
    vendor?.escalationMatrix || []
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Vendor name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.rating) {
      const rating = parseFloat(formData.rating)
      if (isNaN(rating) || rating < 0 || rating > 5) {
        newErrors.rating = 'Rating must be between 0 and 5'
      }
    }

    if (formData.performanceScore) {
      const score = parseFloat(formData.performanceScore)
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.performanceScore = 'Performance score must be between 0 and 100'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const submitData: Partial<Vendor> = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      performanceScore: formData.performanceScore
        ? parseFloat(formData.performanceScore)
        : undefined,
      status: formData.status as 'Active' | 'Inactive' | 'Suspended',
      escalationMatrix: escalationMatrix.length > 0 ? escalationMatrix : undefined,
    }

    onSubmit(submitData)
  }

  const addEscalationContact = () => {
    setEscalationMatrix([
      ...escalationMatrix,
      {
        level: escalationMatrix.length + 1,
        name: '',
        email: '',
        phone: '',
      },
    ])
  }

  const removeEscalationContact = (index: number) => {
    setEscalationMatrix(escalationMatrix.filter((_, i) => i !== index))
  }

  const updateEscalationContact = (
    index: number,
    field: keyof EscalationContact,
    value: string | number
  ) => {
    const updated = [...escalationMatrix]
    updated[index] = { ...updated[index], [field]: value }
    setEscalationMatrix(updated)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <Input
        label='Vendor Name'
        placeholder='e.g. Siemens Healthineers'
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
        fullWidth
      />

      <Input
        label='Contact Person'
        placeholder='e.g. John Smith'
        value={formData.contactPerson}
        onChange={(e) =>
          setFormData({ ...formData, contactPerson: e.target.value })
        }
        fullWidth
      />

      <Input
        label='Email'
        type='email'
        placeholder='contact@vendor.com'
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        fullWidth
      />

      <Input
        label='Phone'
        placeholder='+91 98765 43210'
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        fullWidth
      />

      <Input
        label='Address'
        placeholder='City, State'
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        fullWidth
      />

      <div className='grid grid-cols-2 gap-4'>
        <Input
          label='Rating (0-5)'
          type='number'
          min='0'
          max='5'
          step='0.1'
          placeholder='4.5'
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          error={errors.rating}
          fullWidth
        />

        <Input
          label='Performance Score (0-100)'
          type='number'
          min='0'
          max='100'
          step='0.1'
          placeholder='92'
          value={formData.performanceScore}
          onChange={(e) =>
            setFormData({ ...formData, performanceScore: e.target.value })
          }
          error={errors.performanceScore}
          fullWidth
        />
      </div>

      <div>
        <label className='text-sm font-medium text-text-primary mb-2 block'>
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className='w-full px-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
        >
          <option value='Active'>Active</option>
          <option value='Inactive'>Inactive</option>
          <option value='Suspended'>Suspended</option>
        </select>
      </div>

      {/* Escalation Matrix */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='text-sm font-medium text-text-primary'>
            Escalation Matrix
          </label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            leftIcon={Plus}
            onClick={addEscalationContact}
          >
            Add Contact
          </Button>
        </div>

        {escalationMatrix.length === 0 && (
          <p className='text-sm text-text-secondary mb-2'>
            No escalation contacts added. Click "Add Contact" to add one.
          </p>
        )}

        <div className='space-y-3'>
          {escalationMatrix.map((contact, index) => (
            <div
              key={index}
              className='p-4 border border-border rounded-lg space-y-3'
            >
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-text-primary'>
                  Level {contact.level}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeEscalationContact(index)}
                >
                  <X size={16} />
                </Button>
              </div>

              <Input
                label='Name'
                placeholder='Contact name'
                value={contact.name}
                onChange={(e) =>
                  updateEscalationContact(index, 'name', e.target.value)
                }
                fullWidth
              />

              <Input
                label='Email'
                type='email'
                placeholder='email@example.com'
                value={contact.email}
                onChange={(e) =>
                  updateEscalationContact(index, 'email', e.target.value)
                }
                fullWidth
              />

              <Input
                label='Phone'
                placeholder='+91 98765 43210'
                value={contact.phone}
                onChange={(e) =>
                  updateEscalationContact(index, 'phone', e.target.value)
                }
                fullWidth
              />
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-end gap-3 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' variant='primary' isLoading={isLoading}>
          {vendor ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  )
}

