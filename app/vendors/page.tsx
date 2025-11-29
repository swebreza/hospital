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
import Modal from '@/components/ui/Modal'
import { toast } from 'sonner'

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleAddVendor = () => {
    if (!vendorForm.name || !vendorForm.contactPerson || !vendorForm.email) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Vendor added successfully!', {
      description: `${vendorForm.name} has been added to the system`,
    })
    setIsAddModalOpen(false)
    setVendorForm({ name: '', contactPerson: '', email: '', phone: '', address: '' })
  }

  const handleViewDetails = (vendorId: string) => {
    setSelectedVendor(vendorId)
    setIsViewModalOpen(true)
  }

  const handleManageContracts = (vendorId: string) => {
    setSelectedVendor(vendorId)
    setIsContractModalOpen(true)
  }

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
          <h1 className='text-2xl font-bold text-text-primary'>
            Vendor Management
          </h1>
          <p className='text-sm text-text-secondary mt-1'>
            Manage vendors, contracts, and performance tracking
          </p>
        </div>
        <Button variant='primary' leftIcon={Plus} onClick={() => setIsAddModalOpen(true)}>
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
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} hover padding='md' className='flex flex-col'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg text-text-primary mb-1'>
                    {vendor.name}
                  </h3>
                  <div className='flex items-center gap-1 mb-2'>
                    {renderStars(vendor.rating)}
                    <span className='text-sm text-text-secondary ml-1'>
                      ({vendor.rating})
                    </span>
                  </div>
                </div>
                <Badge variant='success'>{vendor.status}</Badge>
              </div>

              <div className='space-y-2 mb-4'>
                <div className='flex items-center gap-2 text-sm text-text-secondary'>
                  <Users size={16} />
                  <span>{vendor.contactPerson}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-text-secondary'>
                  <Mail size={16} />
                  <span className='truncate'>{vendor.email}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-text-secondary'>
                  <Phone size={16} />
                  <span>{vendor.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-text-secondary'>
                  <MapPin size={16} />
                  <span>{vendor.address}</span>
                </div>
              </div>

              <div className='pt-4 border-t border-border space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-text-secondary'>
                    Performance Score
                  </span>
                  <div className='flex items-center gap-2'>
                    <TrendingUp size={16} className='text-success' />
                    <span className='font-semibold text-text-primary'>
                      {vendor.performanceScore}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-text-secondary'>
                    Active Contracts
                  </span>
                  <Badge variant='info'>{vendor.activeContracts}</Badge>
                </div>
                <div className='flex gap-2 pt-2'>
                  <Button 
                    variant='outline' 
                    size='sm' 
                    className='flex-1'
                    onClick={() => handleViewDetails(vendor.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant='primary' 
                    size='sm' 
                    className='flex-1'
                    onClick={() => handleManageContracts(vendor.id)}
                  >
                    Manage Contracts
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddVendor}>
              Add Vendor
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Vendor Name"
            placeholder="e.g. Siemens Healthineers"
            value={vendorForm.name}
            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
            required
          />
          <Input
            label="Contact Person"
            placeholder="e.g. John Smith"
            value={vendorForm.contactPerson}
            onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="contact@vendor.com"
            value={vendorForm.email}
            onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            placeholder="+91 98765 43210"
            value={vendorForm.phone}
            onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
          />
          <Input
            label="Address"
            placeholder="City, State"
            value={vendorForm.address}
            onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
          />
        </div>
      </Modal>

      {/* View Vendor Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedVendor(null)
        }}
        title="Vendor Details"
        size="md"
      >
        {selectedVendor && (
          <div className="space-y-4">
            {(() => {
              const vendor = vendors.find(v => v.id === selectedVendor)
              if (!vendor) return null
              return (
                <>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">{vendor.name}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-text-secondary">Contact:</span> {vendor.contactPerson}</p>
                      <p><span className="text-text-secondary">Email:</span> {vendor.email}</p>
                      <p><span className="text-text-secondary">Phone:</span> {vendor.phone}</p>
                      <p><span className="text-text-secondary">Address:</span> {vendor.address}</p>
                      <p><span className="text-text-secondary">Rating:</span> {vendor.rating}/5</p>
                      <p><span className="text-text-secondary">Performance Score:</span> {vendor.performanceScore}%</p>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </Modal>

      {/* Manage Contracts Modal */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false)
          setSelectedVendor(null)
        }}
        title="Manage Contracts"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsContractModalOpen(false)
              setSelectedVendor(null)
            }}>
              Close
            </Button>
            <Button variant="primary" onClick={() => {
              toast.success('Contract created successfully!')
              setIsContractModalOpen(false)
              setSelectedVendor(null)
            }}>
              Add New Contract
            </Button>
          </div>
        }
      >
        {selectedVendor && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Manage AMC/CMC contracts for {vendors.find(v => v.id === selectedVendor)?.name}
            </p>
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-text-secondary">Contract management interface coming soon...</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
