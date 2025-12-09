'use client'

import React from 'react'
import { Users, Star, Phone, Mail, MapPin, TrendingUp, Eye, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Vendor } from '@/lib/types'

interface VendorCardProps {
  vendor: Vendor & {
    activeContractsCount?: number
    performanceScore?: number
  }
  onViewDetails: (id: string) => void
  onManageContracts: (id: string) => void
}

export default function VendorCard({
  vendor,
  onViewDetails,
  onManageContracts,
}: VendorCardProps) {
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

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'Pending':
        return 'warning'
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'default'
      case 'Suspended':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <Card hover padding='md' className='flex flex-col'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='font-semibold text-lg text-text-primary mb-1'>
            {vendor.name}
          </h3>
          {vendor.rating !== undefined && vendor.rating > 0 && (
            <div className='flex items-center gap-1 mb-2'>
              {renderStars(vendor.rating)}
              <span className='text-sm text-text-secondary ml-1'>
                ({vendor.rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
        <Badge variant={getStatusBadgeVariant(vendor.status as string)}>
          {vendor.status || 'Pending'}
        </Badge>
      </div>

      <div className='space-y-2 mb-4'>
        {vendor.contactPerson && (
          <div className='flex items-center gap-2 text-sm text-text-secondary'>
            <Users size={16} />
            <span>{vendor.contactPerson}</span>
          </div>
        )}
        {vendor.email && (
          <div className='flex items-center gap-2 text-sm text-text-secondary'>
            <Mail size={16} />
            <span className='truncate'>{vendor.email}</span>
          </div>
        )}
        {vendor.phone && (
          <div className='flex items-center gap-2 text-sm text-text-secondary'>
            <Phone size={16} />
            <span>{vendor.phone}</span>
          </div>
        )}
        {vendor.address && (
          <div className='flex items-center gap-2 text-sm text-text-secondary'>
            <MapPin size={16} />
            <span className='truncate'>{vendor.address}</span>
          </div>
        )}
      </div>

      <div className='pt-4 border-t border-border space-y-3'>
        {vendor.performanceScore !== undefined && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-text-secondary'>Performance Score</span>
            <div className='flex items-center gap-2'>
              <TrendingUp size={16} className='text-success' />
              <span className='font-semibold text-text-primary'>
                {vendor.performanceScore}%
              </span>
            </div>
          </div>
        )}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-text-secondary'>Active Contracts</span>
          <Badge variant='info'>
            {vendor.activeContractsCount || 0}
          </Badge>
        </div>
        <div className='flex gap-2 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            leftIcon={Eye}
            onClick={() => onViewDetails(vendor.id)}
          >
            View Details
          </Button>
          <Button
            variant='primary'
            size='sm'
            className='flex-1'
            leftIcon={FileText}
            onClick={() => onManageContracts(vendor.id)}
          >
            Contracts
          </Button>
        </div>
      </div>
    </Card>
  )
}

