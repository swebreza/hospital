'use client'

import React, { useState } from 'react'
import {
  Search,
  Filter,
  AlertTriangle,
  Package,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const inventoryData = [
  {
    id: 'SP-001',
    name: 'ECG Leads (Set of 5)',
    category: 'Consumables',
    stock: 120,
    minLevel: 50,
    unit: 'Sets',
  },
  {
    id: 'SP-002',
    name: 'Ventilator Filter',
    category: 'Filters',
    stock: 15,
    minLevel: 20,
    unit: 'Pcs',
  },
  {
    id: 'SP-003',
    name: 'Defibrillator Pads',
    category: 'Consumables',
    stock: 8,
    minLevel: 10,
    unit: 'Pairs',
  },
  {
    id: 'SP-004',
    name: 'Ultrasound Gel (5L)',
    category: 'Gel',
    stock: 45,
    minLevel: 15,
    unit: 'Jars',
  },
  {
    id: 'SP-005',
    name: 'Oxygen Sensor',
    category: 'Sensors',
    stock: 5,
    minLevel: 5,
    unit: 'Pcs',
  },
  {
    id: 'SP-006',
    name: 'SPO2 Probe (Adult)',
    category: 'Probes',
    stock: 32,
    minLevel: 10,
    unit: 'Pcs',
  },
  {
    id: 'SP-007',
    name: 'NIBP Cuff (Adult)',
    category: 'Cuffs',
    stock: 28,
    minLevel: 15,
    unit: 'Pcs',
  },
]

export default function InventoryPage() {
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)
  const [poForm, setPOForm] = useState({
    vendor: '',
    items: '',
    priority: 'normal',
  })

  const handleExportReport = () => {
    toast.success('Exporting inventory report...', {
      description: 'Your report will be ready shortly',
    })
    // Simulate export
    setTimeout(() => {
      toast.success('Report exported successfully!', {
        description: 'Check your downloads folder',
      })
    }, 2000)
  }

  const handleCreatePO = () => {
    if (!poForm.vendor || !poForm.items) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Purchase Order created successfully!', {
      description: `PO-${Date.now()} has been generated`,
    })
    setIsPOModalOpen(false)
    setPOForm({ vendor: '', items: '', priority: 'normal' })
  }

  const handleReorder = (itemId: string, itemName: string) => {
    toast.success('Reorder request created!', {
      description: `Reorder request for ${itemName} has been submitted`,
    })
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min)
      return { color: 'bg-red-500', text: 'text-red-600', label: 'Low Stock' }
    if (current <= min * 1.5)
      return {
        color: 'bg-yellow-500',
        text: 'text-yellow-600',
        label: 'Medium',
      }
    return { color: 'bg-green-500', text: 'text-green-600', label: 'Good' }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-text-primary'>
            Inventory & Spare Parts
          </h1>
          <p className='text-text-secondary'>
            Monitor stock levels and reorder supplies
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleExportReport}>
            Export Report
          </Button>
          <Button
            variant='primary'
            leftIcon={ShoppingCart}
            onClick={() => setIsPOModalOpen(true)}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      <div className='bg-white rounded-lg p-6 shadow-sm border border-border'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex gap-4'>
            <div className='relative w-64'>
              <Search
                size={18}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              />
              <input
                type='text'
                placeholder='Search parts...'
                className='w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary'
              />
            </div>
            <Button variant='outline' leftIcon={Filter}>
              Category
            </Button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-border'>
                <th className='p-4 text-sm font-medium text-text-secondary'>
                  Part ID
                </th>
                <th className='p-4 text-sm font-medium text-text-secondary'>
                  Item Name
                </th>
                <th className='p-4 text-sm font-medium text-text-secondary'>
                  Category
                </th>
                <th className='p-4 text-sm font-medium text-text-secondary w-1/3'>
                  Stock Level
                </th>
                <th className='p-4 text-sm font-medium text-text-secondary'>
                  Status
                </th>
                <th className='p-4 text-sm font-medium text-text-secondary'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => {
                const status = getStockStatus(item.stock, item.minLevel)
                const percentage = Math.min(
                  (item.stock / (item.minLevel * 3)) * 100,
                  100
                )

                return (
                  <tr
                    key={item.id}
                    className='border-b border-border hover:bg-bg-hover transition-colors'
                  >
                    <td className='p-4 text-sm font-medium text-text-secondary'>
                      {item.id}
                    </td>
                    <td className='p-4 font-bold text-sm text-text-primary'>
                      {item.name}
                    </td>
                    <td className='p-4 text-sm text-text-secondary'>
                      {item.category}
                    </td>
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'>
                          <div
                            className={`h-full rounded-full ${status.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className='text-xs font-bold w-12 text-right'>
                          {item.stock} {item.unit}
                        </span>
                      </div>
                    </td>
                    <td className='p-4'>
                      {status.label === 'Low Stock' && (
                        <div className='flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit'>
                          <AlertTriangle size={12} />
                          Low Stock
                        </div>
                      )}
                      {status.label !== 'Low Stock' && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 ${status.text}`}
                        >
                          {status.label}
                        </span>
                      )}
                    </td>
                    <td className='p-4'>
                      <button
                        onClick={() => handleReorder(item.id, item.name)}
                        className='text-primary text-sm font-medium hover:underline'
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Order Modal */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        title='Create Purchase Order'
        size='md'
        footer={
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => setIsPOModalOpen(false)}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleCreatePO}>
              Create PO
            </Button>
          </div>
        }
      >
        <div className='space-y-4'>
          <Select
            label='Vendor'
            options={[
              { value: '', label: 'Select Vendor' },
              { value: 'siemens', label: 'Siemens Healthineers' },
              { value: 'getinge', label: 'Getinge India' },
              { value: 'stryker', label: 'Stryker Service' },
            ]}
            value={poForm.vendor}
            onChange={(e) => setPOForm({ ...poForm, vendor: e.target.value })}
            required
          />
          <Input
            label='Items (comma-separated)'
            placeholder='e.g. ECG Leads, Ventilator Filter, Defibrillator Pads'
            value={poForm.items}
            onChange={(e) => setPOForm({ ...poForm, items: e.target.value })}
            required
          />
          <Select
            label='Priority'
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            value={poForm.priority}
            onChange={(e) => setPOForm({ ...poForm, priority: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  )
}
