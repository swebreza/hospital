"use client";

import React, { useState } from 'react';
import AssetTable from '@/components/Assets/AssetTable';
import AddAssetModal from '@/components/Assets/AddAssetModal';

export default function AssetsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Asset Management</h1>
          <p className="text-secondary">Manage and track all biomedical equipment</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline">Import CSV</button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Add New Asset</button>
        </div>
      </div>

      <AssetTable />
      <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
