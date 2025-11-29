'use client'

import React, { useState } from 'react'
import {
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Plus,
  TrendingUp,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'

// Mock vendor data
const mockVendors = [
  {
    id: 'V-001',
    name: 'Siemens Healthineers',
    contactPerson: 'John Smith',
    email: 'john.smith@siemens.com',
    phone: '+91 98765 43210',
    address: 'Bangalore, Karnataka',
    rating: 4.5,
    performanceScore: 92,
    activeContracts: 5,
    status: 'Active',
  },
  {
    id: 'V-002',
    name: 'Getinge India',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.j@getinge.com',
    phone: '+91 98765 43211',
    address: 'Mumbai, Maharashtra',
    rating: 4.2,
    performanceScore: 88,
    activeContracts: 3,
    status: 'Active',
  },
]

export default function VendorsPage() {
  const [vendors] = useState(mockVendors)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={16} className='fill-yellow-400 text-yellow-400' />
      )
    }
    if (hasHalfStar) {
      stars.push(
        <Star
          key='half'
          size={16}
          className='fill-yellow-400/50 text-yellow-400'
        />
      )
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} size={16} className='text-gray-300' />)
    }
    return stars
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-[var(--text-primary)]'>
            Vendor Management
          </h1>
          <p className='text-sm text-[var(--text-secondary)] mt-1'>
            Manage vendors, contracts, and performance tracking
          </p>
        </div>
        <Button variant='primary' leftIcon={Plus}>
          Add Vendor
        </Button>
      </div>

      {/* Search */}
      <div className='max-w-md'>
        <Input
          placeholder='Search vendors...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Vendor Cards */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Users}
          title='No vendors found'
          description='Add your first vendor to get started'
          actionLabel='Add Vendor'
          onAction={() => {}}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} hover padding='md' className='flex flex-col'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg text-[var(--text-primary)] mb-1'>
                    {vendor.name}
                  </h3>
                  <div className='flex items-center gap-1 mb-2'>
                    {renderStars(vendor.rating)}
                    <span className='text-sm text-[var(--text-secondary)] ml-1'>
                      ({vendor.rating})
                    </span>
                  </div>
                </div>
                <Badge variant='success'>{vendor.status}</Badge>
              </div>

              <div className='space-y-2 mb-4'>
                <div className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                  <Users size={16} />
                  <span>{vendor.contactPerson}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                  <Mail size={16} />
                  <span className='truncate'>{vendor.email}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                  <Phone size={16} />
                  <span>{vendor.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                  <MapPin size={16} />
                  <span>{vendor.address}</span>
                </div>
              </div>

              <div className='pt-4 border-t border-[var(--border-color)] space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-[var(--text-secondary)]'>
                    Performance Score
                  </span>
                  <div className='flex items-center gap-2'>
                    <TrendingUp size={16} className='text-[var(--success)]' />
                    <span className='font-semibold text-[var(--text-primary)]'>
                      {vendor.performanceScore}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-[var(--text-secondary)]'>
                    Active Contracts
                  </span>
                  <Badge variant='info'>{vendor.activeContracts}</Badge>
                </div>
                <div className='flex gap-2 pt-2'>
                  <Button variant='outline' size='sm' className='flex-1'>
                    View Details
                  </Button>
                  <Button variant='primary' size='sm' className='flex-1'>
                    Manage Contracts
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
