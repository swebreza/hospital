'use client'

import React, { useState } from 'react'
import { Users, Mail, Phone, MapPin, Star, TrendingUp, FileText, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Vendor, Contract } from '@/lib/types'

interface VendorDetailsProps {
  vendor: Vendor & {
    activeContractsCount?: number
    totalContracts?: number
    expiredContractsCount?: number
    totalContractValue?: number
    contracts?: Contract[]
  }
  performance?: {
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

export default function VendorDetails({ vendor, performance }: VendorDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'performance'>('overview')

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className='space-y-6'>
      {/* Tabs */}
      <div className='border-b border-border'>
        <div className='flex gap-4'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contracts'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Contracts ({vendor.contracts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Performance
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className='space-y-4'>
          <Card padding='md'>
            <h3 className='font-semibold text-lg text-text-primary mb-4'>
              Basic Information
            </h3>
            <div className='space-y-3'>
              {vendor.contactPerson && (
                <div className='flex items-center gap-3'>
                  <Users size={18} className='text-text-secondary' />
                  <div>
                    <p className='text-sm text-text-secondary'>Contact Person</p>
                    <p className='text-text-primary font-medium'>{vendor.contactPerson}</p>
                  </div>
                </div>
              )}
              {vendor.email && (
                <div className='flex items-center gap-3'>
                  <Mail size={18} className='text-text-secondary' />
                  <div>
                    <p className='text-sm text-text-secondary'>Email</p>
                    <p className='text-text-primary font-medium'>{vendor.email}</p>
                  </div>
                </div>
              )}
              {vendor.phone && (
                <div className='flex items-center gap-3'>
                  <Phone size={18} className='text-text-secondary' />
                  <div>
                    <p className='text-sm text-text-secondary'>Phone</p>
                    <p className='text-text-primary font-medium'>{vendor.phone}</p>
                  </div>
                </div>
              )}
              {vendor.address && (
                <div className='flex items-center gap-3'>
                  <MapPin size={18} className='text-text-secondary' />
                  <div>
                    <p className='text-sm text-text-secondary'>Address</p>
                    <p className='text-text-primary font-medium'>{vendor.address}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {vendor.rating !== undefined && vendor.rating > 0 && (
              <Card padding='md'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-text-secondary'>Rating</span>
                  <div className='flex items-center gap-1'>
                    {renderStars(vendor.rating)}
                  </div>
                </div>
                <p className='text-2xl font-bold text-text-primary'>
                  {vendor.rating.toFixed(1)} / 5.0
                </p>
              </Card>
            )}

            {vendor.performanceScore !== undefined && (
              <Card padding='md'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-text-secondary'>Performance Score</span>
                  <TrendingUp size={18} className='text-success' />
                </div>
                <p className='text-2xl font-bold text-text-primary'>
                  {vendor.performanceScore}%
                </p>
              </Card>
            )}
          </div>

          {vendor.escalationMatrix && vendor.escalationMatrix.length > 0 && (
            <Card padding='md'>
              <h3 className='font-semibold text-lg text-text-primary mb-4'>
                Escalation Matrix
              </h3>
              <div className='space-y-3'>
                {vendor.escalationMatrix.map((contact, index) => (
                  <div
                    key={index}
                    className='p-3 border border-border rounded-lg'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-text-primary'>
                        Level {contact.level}
                      </span>
                    </div>
                    <div className='space-y-1 text-sm'>
                      <p className='text-text-primary'>{contact.name}</p>
                      <p className='text-text-secondary'>{contact.email}</p>
                      <p className='text-text-secondary'>{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className='space-y-4'>
          {vendor.contracts && vendor.contracts.length > 0 ? (
            vendor.contracts.map((contract) => (
              <Card key={contract.id} padding='md' hover>
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <h4 className='font-semibold text-text-primary mb-1'>
                      {contract.type} Contract
                    </h4>
                    <p className='text-sm text-text-secondary'>
                      {new Date(contract.startDate).toLocaleDateString()} -{' '}
                      {new Date(contract.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(contract.status)}>
                    {contract.status}
                  </Badge>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-text-secondary'>Contract Value</span>
                  <span className='font-semibold text-text-primary'>
                    {formatCurrency(contract.value || 0)}
                  </span>
                </div>
                {contract.assets && contract.assets.length > 0 && (
                  <div className='mt-3 pt-3 border-t border-border'>
                    <p className='text-sm text-text-secondary mb-2'>
                      Assets ({contract.assets.length})
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {contract.assets.slice(0, 3).map((asset) => (
                        <Badge key={asset.id} variant='info' size='sm'>
                          {asset.name}
                        </Badge>
                      ))}
                      {contract.assets.length > 3 && (
                        <Badge variant='default' size='sm'>
                          +{contract.assets.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card padding='md'>
              <p className='text-center text-text-secondary py-8'>
                No contracts found for this vendor
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performance && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Card padding='md'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Total Contracts</span>
              <FileText size={18} className='text-text-secondary' />
            </div>
            <p className='text-2xl font-bold text-text-primary'>
              {performance.totalContracts}
            </p>
          </Card>

          <Card padding='md'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Active Contracts</span>
              <Badge variant='success'>{performance.activeContracts}</Badge>
            </div>
            <p className='text-2xl font-bold text-text-primary'>
              {performance.activeContracts}
            </p>
          </Card>

          <Card padding='md'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Total Contract Value</span>
              <TrendingUp size={18} className='text-success' />
            </div>
            <p className='text-2xl font-bold text-text-primary'>
              {formatCurrency(performance.totalContractValue)}
            </p>
          </Card>

          <Card padding='md'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Average Contract Value</span>
            </div>
            <p className='text-2xl font-bold text-text-primary'>
              {formatCurrency(performance.averageContractValue)}
            </p>
          </Card>

          <Card padding='md'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-text-secondary'>Renewal Rate</span>
            </div>
            <p className='text-2xl font-bold text-text-primary'>
              {performance.contractRenewalRate}%
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
          </Card>
        </div>
      )}
    </div>
  )
}

