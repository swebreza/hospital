'use client'

import React, { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

interface VendorRegistrationFormProps {
  onSuccess?: () => void
}

export default function VendorRegistrationForm({
  onSuccess,
}: VendorRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    companyDescription: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Company/Vendor name is required'
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsSuccess(true)
        toast.success('Application Submitted!', {
          description: result.message || 'Your vendor application has been submitted successfully.',
        })
        
        // Reset form
        setFormData({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          companyDescription: '',
        })
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(result.error || 'Failed to submit application')
        setErrors({ submit: result.error || 'Failed to submit application' })
      }
    } catch (error: any) {
      console.error('Error submitting vendor registration:', error)
      toast.error('Failed to submit application. Please try again.')
      setErrors({ submit: 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className='text-center py-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4'>
          <CheckCircle2 className='w-8 h-8 text-green-600' />
        </div>
        <h3 className='text-xl font-semibold text-text-primary mb-2'>
          Application Submitted Successfully!
        </h3>
        <p className='text-text-secondary mb-6'>
          Thank you for your interest in becoming a vendor. We have received your application and will review it shortly. You will be contacted via email once the review is complete.
        </p>
        <Button
          variant='primary'
          onClick={() => {
            setIsSuccess(false)
            setFormData({
              name: '',
              contactPerson: '',
              email: '',
              phone: '',
              address: '',
              companyDescription: '',
            })
          }}
        >
          Submit Another Application
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-text-primary mb-2'>
          Vendor Registration
        </h2>
        <p className='text-text-secondary'>
          Please fill out the form below to apply as a vendor. We will review your application and get back to you soon.
        </p>
      </div>

      <Input
        label='Company/Vendor Name'
        placeholder='e.g. ABC Medical Equipment Solutions'
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
        fullWidth
      />

      <Input
        label='Contact Person Name'
        placeholder='e.g. John Smith'
        value={formData.contactPerson}
        onChange={(e) =>
          setFormData({ ...formData, contactPerson: e.target.value })
        }
        error={errors.contactPerson}
        required
        fullWidth
      />

      <Input
        label='Email Address'
        type='email'
        placeholder='contact@company.com'
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
        fullWidth
      />

      <Input
        label='Phone Number'
        placeholder='+1 234 567 8900'
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        error={errors.phone}
        required
        fullWidth
      />

      <Textarea
        label='Company Address'
        placeholder='Street Address, City, State, ZIP Code'
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        error={errors.address}
        required
        fullWidth
        rows={3}
      />

      <Textarea
        label='Company Description (Optional)'
        placeholder='Brief description of your company and services...'
        value={formData.companyDescription}
        onChange={(e) =>
          setFormData({ ...formData, companyDescription: e.target.value })
        }
        fullWidth
        rows={4}
      />

      {errors.submit && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-600'>{errors.submit}</p>
        </div>
      )}

      <div className='flex justify-end gap-3 pt-4'>
        <Button
          type='submit'
          variant='primary'
          isLoading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        >
          Submit Application
        </Button>
      </div>

      <p className='text-xs text-text-secondary text-center'>
        By submitting this form, you agree to our terms and conditions. We will process your application and contact you via the provided email address.
      </p>
    </form>
  )
}

