'use client'

import React, { useState } from 'react'
import { Search, Filter, Eye, Trash2 } from 'lucide-react'
import { useStore, Asset } from '@/lib/store'
import { toast } from 'sonner'
import AssetDrawer from './AssetDrawer'

interface AssetTableProps {
  assets?: Asset[]
  selectedAssets?: Asset[]
  onSelectionChange?: (selected: Asset[]) => void
}

export default function AssetTable(props: AssetTableProps = {}) {
  const {
    assets: propsAssets,
    selectedAssets: propsSelectedAssets,
    onSelectionChange,
  } = props
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const { assets: storeAssets, deleteAsset } = useStore()

  // Use props assets if provided, otherwise use store assets
  const assets = propsAssets || storeAssets

  // If props assets are provided, use them directly (parent handles filtering)
  // Otherwise, apply internal search filter
  const filteredAssets = propsAssets
    ? assets
    : assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.department.toLowerCase().includes(searchTerm.toLowerCase())
      )

  // Handle selection if onSelectionChange is provided
  const handleRowClick = (asset: Asset) => {
    setSelectedAsset(asset)
    if (onSelectionChange && propsSelectedAssets) {
      const isSelected = propsSelectedAssets.some((a) => a.id === asset.id)
      if (isSelected) {
        onSelectionChange(propsSelectedAssets.filter((a) => a.id !== asset.id))
      } else {
        onSelectionChange([...propsSelectedAssets, asset])
      }
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this asset?')) {
      deleteAsset(id)
      toast.success('Asset deleted successfully')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'Breakdown':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className='bg-white rounded-lg p-6 shadow-sm border border-border transition-all hover:shadow-md hover:-translate-y-0.5'>
        {!propsAssets && (
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-bold'>Asset List</h2>
            <div className='flex gap-3'>
              <div className='relative'>
                <Search
                  size={18}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                />
                <input
                  type='text'
                  placeholder='Search assets...'
                  className='pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className='btn btn-outline gap-2'>
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>
        )}

        <div className='overflow-x-auto rounded-lg border border-border'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gradient-to-r from-bg-secondary to-transparent border-b border-border'>
                <th className='p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                  Asset ID
                </th>
                <th className='p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                  Asset Name
                </th>
                <th className='p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                  Department
                </th>
                <th className='p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                  Status
                </th>
                <th className='p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                  Next PM
                </th>
                <th className='p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className='border-b border-border hover:bg-gradient-to-r hover:from-primary-lighter hover:to-transparent transition-all cursor-pointer group'
                  onClick={() => handleRowClick(asset)}
                >
                  <td className='p-4'>
                    <span className='text-sm font-semibold text-text-primary font-mono'>
                      {asset.id}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-sm font-bold text-text-primary group-hover:text-primary transition-colors'>
                        {asset.name}
                      </span>
                      <span className='text-xs text-text-secondary'>
                        {asset.model}
                      </span>
                    </div>
                  </td>
                  <td className='p-4'>
                    <span className='text-sm text-text-primary font-medium'>
                      {asset.department}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm ${getStatusColor(
                        asset.status
                      )}`}
                      style={{
                        backgroundColor:
                          asset.status === 'Active'
                            ? '#d1fae5'
                            : asset.status === 'Maintenance'
                            ? '#fef3c7'
                            : '#fee2e2',
                        color:
                          asset.status === 'Active'
                            ? '#065f46'
                            : asset.status === 'Maintenance'
                            ? '#92400e'
                            : '#b91c1c',
                      }}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          asset.status === 'Active'
                            ? 'bg-[#10b981]'
                            : asset.status === 'Maintenance'
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#ef4444]'
                        }`}
                      />
                      {asset.status}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='text-sm text-text-primary font-medium'>
                      {asset.nextPmDate}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity'>
                      <button 
                        className='p-2 hover:bg-primary-light rounded-lg text-text-secondary hover:text-primary transition-all hover:scale-110'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(asset)
                        }}
                        title='View Details'
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className='p-2 hover:bg-danger-light rounded-lg text-text-secondary hover:text-danger transition-all hover:scale-110'
                        onClick={(e) => handleDelete(asset.id, e)}
                        title='Delete Asset'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssetDrawer
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
      />
    </>
  )
}
