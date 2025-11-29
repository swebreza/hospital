'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
} from 'lucide-react'
// import { useStore } from '@/lib/store' // Not used yet
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PreventiveMaintenance, PMStatus } from '@/lib/types'

// Mock PM data - replace with API calls
const mockPMs: PreventiveMaintenance[] = [
  {
    id: 'PM-001',
    assetId: 'AST-001',
    asset: {
      id: 'AST-001',
      name: 'MRI Scanner',
      model: 'Magnetom Vida',
      manufacturer: 'Siemens',
      serialNumber: 'SN-001',
      department: 'Radiology',
      location: 'Room 101',
      status: 'Active',
      purchaseDate: '2023-01-15',
      nextPmDate: '2024-07-15',
      value: 12000000,
      createdAt: '2023-01-15',
      updatedAt: '2024-06-01',
    },
    scheduledDate: '2024-07-15',
    completedDate: undefined,
    status: 'Scheduled',
    checklist: [],
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'PM-002',
    assetId: 'AST-002',
    asset: {
      id: 'AST-002',
      name: 'Ventilator',
      model: 'Servo-u',
      manufacturer: 'Getinge',
      serialNumber: 'SN-002',
      department: 'ICU',
      location: 'Bed 4',
      status: 'Active',
      purchaseDate: '2022-05-20',
      nextPmDate: '2024-05-20',
      value: 1500000,
      createdAt: '2022-05-20',
      updatedAt: '2024-05-20',
    },
    scheduledDate: '2024-05-20',
    completedDate: '2024-05-20T14:30:00',
    status: 'Completed',
    checklist: [],
    createdAt: '2024-04-01',
    updatedAt: '2024-05-20',
  },
]

export default function PMListView() {
  const [pms] = useState(mockPMs)
  const [filter, setFilter] = useState<PMStatus | 'all'>('all')

  const filteredPMs =
    filter === 'all' ? pms : pms.filter((pm) => pm.status === filter)

  const getStatusVariant = (status: PMStatus) => {
    switch (status) {
      case 'Completed':
        return 'success'
      case 'Scheduled':
        return 'info'
      case 'In Progress':
        return 'primary'
      case 'Overdue':
        return 'danger'
      case 'Cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: PMStatus) => {
    switch (status) {
      case 'Completed':
        return CheckCircle
      case 'Scheduled':
        return Calendar
      case 'In Progress':
        return Clock
      case 'Overdue':
        return AlertCircle
      case 'Cancelled':
        return XCircle
      default:
        return Clock
    }
  }

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date()
  }

  return (
    <Card padding='none'>
      {/* Filters */}
      <div className='p-4 border-b border-[var(--border-color)] flex items-center gap-2 flex-wrap'>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          All
        </button>
        {(
          [
            'Scheduled',
            'In Progress',
            'Completed',
            'Overdue',
            'Cancelled',
          ] as PMStatus[]
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* PM List */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-[var(--bg-secondary)] border-b border-[var(--border-color)]'>
            <tr>
              <th className='p-4 text-left text-sm font-semibold text-[var(--text-primary)]'>
                Asset
              </th>
              <th className='p-4 text-left text-sm font-semibold text-[var(--text-primary)]'>
                Scheduled Date
              </th>
              <th className='p-4 text-left text-sm font-semibold text-[var(--text-primary)]'>
                Status
              </th>
              <th className='p-4 text-left text-sm font-semibold text-[var(--text-primary)]'>
                Technician
              </th>
              <th className='p-4 text-left text-sm font-semibold text-[var(--text-primary)]'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--border-color)]'>
            {filteredPMs.map((pm) => {
              const StatusIcon = getStatusIcon(pm.status)
              const overdue =
                isOverdue(pm.scheduledDate) && pm.status !== 'Completed'

              return (
                <tr
                  key={pm.id}
                  className={`hover:bg-[var(--bg-hover)] transition-colors ${
                    overdue ? 'bg-[var(--danger-lighter)]' : ''
                  }`}
                >
                  <td className='p-4'>
                    <div>
                      <p className='font-medium text-[var(--text-primary)]'>
                        {pm.asset?.name || 'Unknown Asset'}
                      </p>
                      <p className='text-xs text-[var(--text-secondary)]'>
                        {pm.asset?.department} • {pm.asset?.location}
                      </p>
                    </div>
                  </td>
                  <td className='p-4'>
                    <div>
                      <p className='text-sm font-medium text-[var(--text-primary)]'>
                        {format(new Date(pm.scheduledDate), 'MMM dd, yyyy')}
                      </p>
                      {pm.completedDate && (
                        <p className='text-xs text-[var(--text-secondary)]'>
                          Completed:{' '}
                          {format(new Date(pm.completedDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className='p-4'>
                    <Badge
                      variant={
                        getStatusVariant(pm.status) as
                          | 'default'
                          | 'success'
                          | 'danger'
                          | 'warning'
                          | 'info'
                          | 'primary'
                      }
                      icon={StatusIcon}
                    >
                      {pm.status}
                      {overdue && ' (Overdue)'}
                    </Badge>
                  </td>
                  <td className='p-4 text-sm text-[var(--text-secondary)]'>
                    {pm.technician?.name || 'Unassigned'}
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center gap-2'>
                      {pm.status === 'Scheduled' && (
                        <Button variant='outline' size='sm'>
                          Start PM
                        </Button>
                      )}
                      {pm.status === 'In Progress' && (
                        <Button variant='primary' size='sm'>
                          Complete
                        </Button>
                      )}
                      <button className='text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]'>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredPMs.length === 0 && (
        <div className='p-12 text-center'>
          <p className='text-[var(--text-secondary)]'>
            No preventive maintenances found
          </p>
        </div>
      )}
    </Card>
  )
}
