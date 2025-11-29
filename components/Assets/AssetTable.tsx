"use client";

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { useStore, Asset } from '@/lib/store';
import { toast } from 'sonner';
import AssetDrawer from './AssetDrawer';

export default function AssetTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { assets, deleteAsset } = useStore();

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this asset?')) {
      deleteAsset(id);
      toast.success('Asset deleted successfully');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Breakdown': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Asset List</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
            <button className="btn btn-outline gap-2">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="p-4 text-sm font-medium text-secondary">Asset ID</th>
                <th className="p-4 text-sm font-medium text-secondary">Asset Name</th>
                <th className="p-4 text-sm font-medium text-secondary">Department</th>
                <th className="p-4 text-sm font-medium text-secondary">Status</th>
                <th className="p-4 text-sm font-medium text-secondary">Next PM</th>
                <th className="p-4 text-sm font-medium text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr 
                  key={asset.id} 
                  className="border-b hover:bg-gray-50 transition-colors cursor-pointer" 
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <td className="p-4 text-sm font-medium">{asset.id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{asset.name}</span>
                      <span className="text-xs text-secondary">{asset.model}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{asset.department}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}
                      style={{ 
                        backgroundColor: asset.status === 'Active' ? '#d1fae5' : asset.status === 'Maintenance' ? '#fef3c7' : '#fee2e2',
                        color: asset.status === 'Active' ? '#065f46' : asset.status === 'Maintenance' ? '#92400e' : '#b91c1c'
                      }}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{asset.nextPmDate}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded text-secondary hover:text-primary">
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-200 rounded text-secondary hover:text-danger"
                        onClick={(e) => handleDelete(asset.id, e)}
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
  );
}
