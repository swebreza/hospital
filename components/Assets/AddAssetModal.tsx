'use client'

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Asset } from '@/lib/store'
import { toast } from 'sonner'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const { addAsset } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    department: '',
    location: '',
    value: '',
    purchaseDate: '',
    nextPmDate: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const now = new Date().toISOString()
    const newAsset: Asset = {
      id: `AST-${Math.floor(Math.random() * 10000)}`, // Mock ID generation
      ...formData,
      value: Number(formData.value),
      status: 'Active',
      image: '/assets/default.png', // Placeholder
      createdAt: now,
      updatedAt: now,
    }

    addAsset(newAsset)
    toast.success('New asset added successfully')
    onClose()
    setFormData({
      name: '',
      model: '',
      manufacturer: '',
      serialNumber: '',
      department: '',
      location: '',
      value: '',
      purchaseDate: '',
      nextPmDate: '',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black z-40 backdrop-blur-sm'
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4'
          >
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto flex flex-col max-h-[90vh] border border-border overflow-hidden'>
              <div className='p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary-lighter to-transparent'>
                <h2 className='text-2xl font-bold text-text-primary'>
                  Add New Asset
                </h2>
                <button
                  onClick={onClose}
                  className='p-2 hover:bg-bg-hover rounded-lg transition-all hover:scale-110 text-text-secondary hover:text-text-primary'
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className='flex-1 overflow-y-auto p-6 bg-bg-secondary scrollbar-thin'
              >
                <div className='grid grid-cols-2 gap-6'>
                  <div className='col-span-2'>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Asset Name
                    </label>
                    <input
                      required
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                      placeholder='e.g. MRI Scanner'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Manufacturer
                    </label>
                    <input
                      required
                      name='manufacturer'
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Model
                    </label>
                    <input
                      required
                      name='model'
                      value={formData.model}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Serial Number
                    </label>
                    <input
                      required
                      name='serialNumber'
                      value={formData.serialNumber}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Value (₹)
                    </label>
                    <input
                      required
                      type='number'
                      name='value'
                      value={formData.value}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Department
                    </label>
                    <select
                      required
                      name='department'
                      value={formData.department}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    >
                      <option value=''>Select Department</option>
                      <option value='Radiology'>Radiology</option>
                      <option value='ICU'>ICU</option>
                      <option value='Emergency'>Emergency</option>
                      <option value='OT'>OT</option>
                      <option value='Pediatrics'>Pediatrics</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Location
                    </label>
                    <input
                      required
                      name='location'
                      value={formData.location}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                      placeholder='e.g. Room 101'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Purchase Date
                    </label>
                    <input
                      required
                      type='date'
                      name='purchaseDate'
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Next PM Date
                    </label>
                    <input
                      required
                      type='date'
                      name='nextPmDate'
                      value={formData.nextPmDate}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>
                </div>

                <div className='mt-8 flex justify-end gap-3 pt-6 border-t border-border'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='btn btn-outline px-6'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary gap-2 px-6 shadow-md hover:shadow-lg'
                  >
                    <Save size={18} />
                    Save Asset
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
