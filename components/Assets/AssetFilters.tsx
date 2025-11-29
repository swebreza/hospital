'use client'

import React, { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface AssetFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
}

export interface FilterState {
  search: string
  status: string
  department: string
  manufacturer: string
  dateFrom: string
  dateTo: string
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Breakdown', label: 'Breakdown' },
  { value: 'Condemned', label: 'Condemned' },
  { value: 'Standby', label: 'Standby' },
]

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'Radiology', label: 'Radiology' },
  { value: 'ICU', label: 'ICU' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'OT', label: 'OT' },
  { value: 'Pediatrics', label: 'Pediatrics' },
]

export default function AssetFilters({
  onFilterChange,
  onReset,
}: AssetFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    manufacturer: '',
    dateFrom: '',
    dateTo: '',
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const emptyFilters: FilterState = {
      search: '',
      status: '',
      department: '',
      manufacturer: '',
      dateFrom: '',
      dateTo: '',
    }
    setFilters(emptyFilters)
    onReset()
  }

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== ''
  ).length

  return (
    <>
      <Button
        variant='outline'
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={Filter}
      >
        Filters
        {activeFiltersCount > 0 && (
          <span className='ml-1 px-1.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full'>
            {activeFiltersCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-modal-backdrop bg-black/50'
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='fixed left-4 top-20 z-modal w-80'
            >
              <Card padding='md'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-text-primary'>
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className='p-1 hover:bg-bg-hover rounded transition-colors'
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className='space-y-4'>
                  <Input
                    label='Search'
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    placeholder='Search by name, ID, or serial...'
                  />

                  <Select
                    label='Status'
                    options={statusOptions}
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                  />

                  <Select
                    label='Department'
                    options={departmentOptions}
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange('department', e.target.value)
                    }
                  />

                  <Input
                    label='Manufacturer'
                    value={filters.manufacturer}
                    onChange={(e) =>
                      handleFilterChange('manufacturer', e.target.value)
                    }
                    placeholder='Filter by manufacturer...'
                  />

                  <div className='grid grid-cols-2 gap-3'>
                    <Input
                      label='From Date'
                      type='date'
                      value={filters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange('dateFrom', e.target.value)
                      }
                    />
                    <Input
                      label='To Date'
                      type='date'
                      value={filters.dateTo}
                      onChange={(e) =>
                        handleFilterChange('dateTo', e.target.value)
                      }
                    />
                  </div>

                  <div className='flex gap-2 pt-2'>
                    <Button
                      variant='outline'
                      onClick={handleReset}
                      className='flex-1'
                    >
                      Reset
                    </Button>
                    <Button
                      variant='primary'
                      onClick={() => setIsOpen(false)}
                      className='flex-1'
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
