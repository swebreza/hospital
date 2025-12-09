'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface VendorFiltersProps {
  search: string
  status: string
  minRating: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onMinRatingChange: (value: string) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onReset: () => void
}

export default function VendorFilters({
  search,
  status,
  minRating,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onMinRatingChange,
  onSortChange,
  onReset,
}: VendorFiltersProps) {
  return (
    <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-end'>
      <div className='flex-1 max-w-md'>
        <Input
          placeholder='Search vendors...'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={Search}
          fullWidth
        />
      </div>

      <Select
        label='Status'
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { value: '', label: 'All Status' },
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Suspended', label: 'Suspended' },
        ]}
        className='min-w-[150px]'
      />

      <Select
        label='Min Rating'
        value={minRating}
        onChange={(e) => onMinRatingChange(e.target.value)}
        options={[
          { value: '', label: 'All Ratings' },
          { value: '4', label: '4+ Stars' },
          { value: '3', label: '3+ Stars' },
          { value: '2', label: '2+ Stars' },
          { value: '1', label: '1+ Star' },
        ]}
        className='min-w-[130px]'
      />

      <Select
        label='Sort By'
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
          const [field, order] = e.target.value.split('-')
          onSortChange(field, order as 'asc' | 'desc')
        }}
        options={[
          { value: 'name-asc', label: 'Name (A-Z)' },
          { value: 'name-desc', label: 'Name (Z-A)' },
          { value: 'rating-desc', label: 'Rating (High)' },
          { value: 'rating-asc', label: 'Rating (Low)' },
          { value: 'performanceScore-desc', label: 'Performance (High)' },
          { value: 'performanceScore-asc', label: 'Performance (Low)' },
        ]}
        className='min-w-[180px]'
      />

      <Button
        variant='outline'
        size='sm'
        leftIcon={X}
        onClick={onReset}
        className='whitespace-nowrap'
      >
        Reset
      </Button>
    </div>
  )
}

