'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import VendorCard from '@/components/Vendors/VendorCard'
import VendorForm from '@/components/Vendors/VendorForm'
import VendorDetails from '@/components/Vendors/VendorDetails'
import VendorFilters from '@/components/Vendors/VendorFilters'
import ContractForm from '@/components/Vendors/ContractForm'
import ContractList from '@/components/Vendors/ContractList'
import { vendorsApi } from '@/lib/api/vendors'
import { contractsApi } from '@/lib/api/contracts'
import { assetsApi } from '@/lib/api/assets'
import { toast } from 'sonner'
import type { Vendor, Contract, Asset } from '@/lib/types'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [vendorPerformance, setVendorPerformance] = useState<any>(null)
  const [vendorContracts, setVendorContracts] = useState<Contract[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])

  // Load vendors
  const loadVendors = async () => {
    try {
      setLoading(true)
      const response = await vendorsApi.getAll(pagination.page, pagination.limit, {
        search: searchTerm,
        status: statusFilter,
        minRating: minRating ? parseFloat(minRating) : undefined,
        sortBy,
        sortOrder,
      })

      setVendors(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error loading vendors:', error)
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendors()
  }, [pagination.page, searchTerm, statusFilter, minRating, sortBy, sortOrder])

  // Load vendor details
  const loadVendorDetails = async (vendorId: string) => {
    try {
      const [vendorResponse, contractsResponse, performanceResponse] = await Promise.all([
        vendorsApi.getById(vendorId),
        vendorsApi.getContracts(vendorId),
        vendorsApi.getPerformance(vendorId),
      ])

      if (vendorResponse.success && vendorResponse.data) {
        setSelectedVendor(vendorResponse.data as Vendor)
        setVendorContracts(contractsResponse.data || [])
        setVendorPerformance(performanceResponse.data)
      }
    } catch (error) {
      console.error('Error loading vendor details:', error)
      toast.error('Failed to load vendor details')
    }
  }

  // Load available assets for contract form
  const loadAssets = async () => {
    try {
      const response = await assetsApi.getAll(1, 100)
      setAvailableAssets(response.data)
    } catch (error) {
      console.error('Error loading assets:', error)
    }
  }

  const handleAddVendor = async (data: Partial<Vendor>) => {
    try {
      const response = await vendorsApi.create(data)
      if (response.success) {
        toast.success('Vendor added successfully!', {
          description: `${data.name} has been added to the system`,
        })
        setIsAddModalOpen(false)
        loadVendors()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vendor')
    }
  }

  const handleViewDetails = async (vendorId: string) => {
    await loadVendorDetails(vendorId)
    setIsViewModalOpen(true)
  }

  const handleManageContracts = async (vendorId: string) => {
    try {
      const vendorResponse = await vendorsApi.getById(vendorId)
      if (vendorResponse.success && vendorResponse.data) {
        setSelectedVendor(vendorResponse.data as Vendor)
        await loadAssets()
        setIsContractModalOpen(true)
      }
    } catch (error) {
      toast.error('Failed to load vendor information')
    }
  }

  const handleAddContract = async (data: Partial<Contract>) => {
    try {
      if (!selectedVendor) return

      const contractData = {
        ...data,
        vendorId: selectedVendor.id,
      }

      const response = await contractsApi.create(contractData)
      if (response.success) {
        toast.success('Contract created successfully!')
        setIsContractModalOpen(false)
        if (selectedVendor) {
          await loadVendorDetails(selectedVendor.id)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contract')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setMinRating('')
    setSortBy('name')
    setSortOrder('asc')
    setPagination((prev) => ({ ...prev, page: 1 }))
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
        <Button
          variant='primary'
          leftIcon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <VendorFilters
        search={searchTerm}
        status={statusFilter}
        minRating={minRating}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onMinRatingChange={setMinRating}
        onSortChange={(by, order) => {
          setSortBy(by)
          setSortOrder(order)
        }}
        onReset={handleResetFilters}
      />

      {/* Vendor Cards */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-64 bg-bg-secondary animate-pulse rounded-lg'
            />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Users}
          title='No vendors found'
          description='Add your first vendor to get started'
          actionLabel='Add Vendor'
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onViewDetails={handleViewDetails}
                onManageContracts={handleManageContracts}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <p className='text-sm text-text-secondary'>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} vendors
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title='Add New Vendor'
        size='lg'
      >
        <VendorForm
          onSubmit={handleAddVendor}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* View Vendor Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedVendor(null)
          setVendorPerformance(null)
          setVendorContracts([])
        }}
        title='Vendor Details'
        size='xl'
      >
        {selectedVendor && (
          <VendorDetails
            vendor={{
              ...selectedVendor,
              contracts: vendorContracts,
            }}
            performance={vendorPerformance}
          />
        )}
      </Modal>

      {/* Manage Contracts Modal */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false)
          setSelectedVendor(null)
          setAvailableAssets([])
        }}
        title={`Manage Contracts - ${selectedVendor?.name || ''}`}
        size='xl'
        footer={
          <div className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => {
                setIsContractModalOpen(false)
                setSelectedVendor(null)
                setAvailableAssets([])
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedVendor && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-text-primary mb-4'>
                Add New Contract
              </h3>
              <ContractForm
                vendorId={selectedVendor.id}
                assets={availableAssets}
                onSubmit={handleAddContract}
                onCancel={() => {}}
              />
            </div>

            {vendorContracts.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold text-text-primary mb-4'>
                  Existing Contracts
                </h3>
                <ContractList contracts={vendorContracts} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
