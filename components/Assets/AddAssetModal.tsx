'use client'

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Asset } from '@/lib/store'
import { toast } from 'sonner'
import { assetsApi } from '@/lib/api/assets'

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
    nextCalibrationDate: '',
    warrantyExpiry: '',
    amcExpiry: '',
    // Enhanced fields
    assetType: '',
    modality: '',
    criticality: '',
    oem: '',
    farNumber: '',
    lifecycleState: 'Active',
    isMinorAsset: false,
    installationDate: '',
    commissioningDate: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const assetData = {
        ...formData,
        value: Number(formData.value) || 0,
        status: 'Active' as const,
        lifecycleState: formData.lifecycleState as Asset['lifecycleState'],
        criticality: formData.criticality as Asset['criticality'] | undefined,
        purchaseDate: formData.purchaseDate || undefined,
        nextPmDate: formData.nextPmDate || undefined,
        nextCalibrationDate: formData.nextCalibrationDate || undefined,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        amcExpiry: formData.amcExpiry || undefined,
        installationDate: formData.installationDate || undefined,
        commissioningDate: formData.commissioningDate || undefined,
      }

      const response = await assetsApi.create(assetData)
      if (response.success && response.data) {
        addAsset(response.data)
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
          nextCalibrationDate: '',
          warrantyExpiry: '',
          amcExpiry: '',
          assetType: '',
          modality: '',
          criticality: '',
          oem: '',
          farNumber: '',
          lifecycleState: 'Active',
          isMinorAsset: false,
          installationDate: '',
          commissioningDate: '',
        })
      } else {
        toast.error(response.error || 'Failed to create asset')
      }
    } catch (error) {
      toast.error('Failed to create asset')
      console.error(error)
    }
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

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Next Calibration Date
                    </label>
                    <input
                      type='date'
                      name='nextCalibrationDate'
                      value={formData.nextCalibrationDate}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Warranty Expiry
                    </label>
                    <input
                      type='date'
                      name='warrantyExpiry'
                      value={formData.warrantyExpiry}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      AMC Expiry
                    </label>
                    <input
                      type='date'
                      name='amcExpiry'
                      value={formData.amcExpiry}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Asset Type
                    </label>
                    <select
                      name='assetType'
                      value={formData.assetType}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    >
                      <option value=''>Select Type</option>
                      <option value='Diagnostic'>Diagnostic</option>
                      <option value='Therapeutic'>Therapeutic</option>
                      <option value='Life Support'>Life Support</option>
                      <option value='Monitoring'>Monitoring</option>
                      <option value='Surgical'>Surgical</option>
                      <option value='Laboratory'>Laboratory</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Modality
                    </label>
                    <input
                      name='modality'
                      value={formData.modality}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                      placeholder='e.g. MRI, CT, Ultrasound'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Criticality
                    </label>
                    <select
                      name='criticality'
                      value={formData.criticality}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    >
                      <option value=''>Select Criticality</option>
                      <option value='Critical'>Critical</option>
                      <option value='High'>High</option>
                      <option value='Medium'>Medium</option>
                      <option value='Low'>Low</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      OEM (Original Equipment Manufacturer)
                    </label>
                    <input
                      name='oem'
                      value={formData.oem}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      FAR Number
                    </label>
                    <input
                      name='farNumber'
                      value={formData.farNumber}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                      placeholder='Fixed Asset Register Number'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Lifecycle State
                    </label>
                    <select
                      name='lifecycleState'
                      value={formData.lifecycleState}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    >
                      <option value='Active'>Active</option>
                      <option value='In-Service'>In-Service</option>
                      <option value='Spare'>Spare</option>
                      <option value='Under-Service'>Under-Service</option>
                      <option value='Demo'>Demo</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Installation Date
                    </label>
                    <input
                      type='date'
                      name='installationDate'
                      value={formData.installationDate}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-text-primary mb-2'>
                      Commissioning Date
                    </label>
                    <input
                      type='date'
                      name='commissioningDate'
                      value={formData.commissioningDate}
                      onChange={handleChange}
                      className='w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm hover:shadow-md bg-white'
                    />
                  </div>

                  <div className='col-span-2'>
                    <label className='flex items-center gap-2 text-sm font-semibold text-text-primary mb-2'>
                      <input
                        type='checkbox'
                        name='isMinorAsset'
                        checked={formData.isMinorAsset}
                        onChange={handleChange}
                        className='w-4 h-4 rounded border-border'
                      />
                      Mark as Minor Asset (Low-value, frequently moved equipment)
                    </label>
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
