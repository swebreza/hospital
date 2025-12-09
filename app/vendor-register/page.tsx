'use client'

import React from 'react'
import VendorRegistrationForm from '@/components/Vendors/VendorRegistrationForm'
import { Building2 } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function VendorRegisterPage() {
  return (
    <div className='max-w-3xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4'>
          <Building2 className='w-8 h-8 text-primary' />
        </div>
        <h1 className='text-3xl font-bold text-text-primary mb-2'>
          Become a Vendor
        </h1>
        <p className='text-lg text-text-secondary'>
          Join our network of trusted vendors and start partnering with us today
        </p>
      </div>

      {/* Registration Form Card */}
      <Card padding='lg'>
        <VendorRegistrationForm />
      </Card>

      {/* Information Section */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card padding='md' className='text-center'>
          <div className='text-2xl font-bold text-primary mb-2'>1</div>
          <h3 className='font-semibold text-text-primary mb-1'>Submit Application</h3>
          <p className='text-sm text-text-secondary'>
            Fill out the registration form with your company details
          </p>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='text-2xl font-bold text-primary mb-2'>2</div>
          <h3 className='font-semibold text-text-primary mb-1'>Review Process</h3>
          <p className='text-sm text-text-secondary'>
            Our team will review your application within 3-5 business days
          </p>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='text-2xl font-bold text-primary mb-2'>3</div>
          <h3 className='font-semibold text-text-primary mb-1'>Get Started</h3>
          <p className='text-sm text-text-secondary'>
            Once approved, you'll receive access to start collaborating
          </p>
        </Card>
      </div>

      {/* Additional Information */}
      <div className='mt-8 p-6 bg-bg-secondary rounded-lg border border-border'>
        <h3 className='font-semibold text-text-primary mb-3'>What happens after you apply?</h3>
        <ul className='space-y-2 text-sm text-text-secondary'>
          <li className='flex items-start'>
            <span className='text-primary mr-2'>•</span>
            <span>You'll receive an email confirmation once your application is submitted</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary mr-2'>•</span>
            <span>Our procurement team will review your company profile and credentials</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary mr-2'>•</span>
            <span>We may contact you for additional information or documentation</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary mr-2'>•</span>
            <span>Upon approval, you'll be notified via email with next steps</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

