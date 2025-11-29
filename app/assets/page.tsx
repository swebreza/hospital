"use client";

import React, { useState } from 'react';
import { Grid, List, Plus, Upload, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import AssetTable from '@/components/Assets/AssetTable';
import AssetGridView from '@/components/Assets/AssetGridView';
import AddAssetModal from '@/components/Assets/AddAssetModal';
import AssetFilters, { FilterState } from '@/components/Assets/AssetFilters';
import BulkActions from '@/components/Assets/BulkActions';
import Button from '@/components/ui/Button';
import { Asset } from '@/lib/types';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

export default function AssetsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    manufacturer: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const { assets } = useStore();

  // Apply filters
  const filteredAssets = assets.filter(asset => {
    if (filters.search && !(
      asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(filters.search.toLowerCase())
    )) return false;
    
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.department && asset.department !== filters.department) return false;
    if (filters.manufacturer && asset.manufacturer.toLowerCase() !== filters.manufacturer.toLowerCase()) return false;
    
    return true;
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({
      search: '',
      status: '',
      department: '',
      manufacturer: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      // TODO: Implement export functionality
      toast.success(`Exporting to ${format.toUpperCase()}...`);
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedAssets.length} asset(s)?`)) {
      // TODO: Implement bulk delete
      toast.success(`${selectedAssets.length} asset(s) deleted`);
      setSelectedAssets([]);
    }
  };

  const handleBulkGenerateQR = () => {
    // TODO: Implement bulk QR generation
    toast.success(`Generating QR codes for ${selectedAssets.length} asset(s)...`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Asset Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage and track all biomedical equipment
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={Upload}>
            Import CSV
          </Button>
          <Button variant="outline" size="sm" leftIcon={Download} onClick={() => handleExport('excel')}>
            Export
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add New Asset
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AssetFilters onFilterChange={handleFilterChange} onReset={handleFilterReset} />
        </div>
        <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'table'
                ? 'bg-white shadow-sm text-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white shadow-sm text-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <BulkActions
          selectedAssets={selectedAssets}
          onExport={handleExport}
          onDelete={handleBulkDelete}
          onGenerateQR={handleBulkGenerateQR}
          onClearSelection={() => setSelectedAssets([])}
        />
      )}

      {/* Content */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets found"
          description={Object.values(filters).some(v => v) 
            ? "Try adjusting your filters to see more results"
            : "Get started by adding your first asset"}
          actionLabel="Add New Asset"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        <AssetTable 
          assets={filteredAssets}
          selectedAssets={selectedAssets}
          onSelectionChange={setSelectedAssets}
        />
      ) : (
        <AssetGridView 
          assets={filteredAssets}
          onAssetClick={(asset) => {
            // Open asset drawer
          }}
        />
      )}

      {/* Modals */}
      <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
