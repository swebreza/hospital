"use client";

import React, { useState } from 'react';
import { X, FileText, Clock, File, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from '@/lib/store';
import Button from '@/components/ui/Button';

interface AssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export default function AssetDrawer({ isOpen, onClose, asset }: AssetDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'docs'>('info');

  if (!asset) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full bg-white shadow-2xl z-[1050] flex flex-col w-full sm:w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-start bg-bg-secondary">
              <div>
                <h2 className="text-xl font-bold text-text-primary">{asset.name}</h2>
                <p className="text-sm text-text-secondary">{asset.id} • {asset.department}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bg-hover rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-6">
              {[
                { id: 'info', label: 'Information', icon: FileText },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'docs', label: 'Documents', icon: File },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Manufacturer" value={asset.manufacturer} />
                    <InfoItem label="Model" value={asset.model} />
                    <InfoItem label="Serial Number" value={asset.serialNumber} />
                    <InfoItem label="Purchase Date" value={asset.purchaseDate} />
                    <InfoItem label="Next PM Date" value={asset.nextPmDate} />
                    <InfoItem label="Value" value={`₹ ${asset.value.toLocaleString()}`} />
                    <InfoItem label="Location" value={asset.location} />
                    <InfoItem label="Status" value={asset.status} isBadge />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 text-text-primary">Description</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      High-performance biomedical equipment used for critical patient care. 
                      Regular maintenance is required every 6 months.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <HistoryItem 
                    date="2024-01-15" 
                    title="Preventive Maintenance" 
                    user="John Doe" 
                    status="Completed" 
                  />
                  <HistoryItem 
                    date="2023-11-20" 
                    title="Calibration" 
                    user="External Vendor" 
                    status="Verified" 
                  />
                  <HistoryItem 
                    date="2023-08-05" 
                    title="Breakdown Repair" 
                    user="Sarah Smith" 
                    status="Resolved" 
                  />
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-3">
                  <DocItem name="User Manual.pdf" size="2.4 MB" />
                  <DocItem name="Installation Report.pdf" size="1.1 MB" />
                  <DocItem name="Warranty Certificate.pdf" size="850 KB" />
                  <DocItem name="Calibration Certificate.pdf" size="1.5 MB" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-bg-secondary flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button variant="primary">Edit Asset</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ label, value, isBadge = false }: { label: string, value: string | number, isBadge?: boolean }) {
  return (
    <div>
      <label className="text-xs text-text-secondary font-medium">{label}</label>
      {isBadge ? (
        <div className="mt-1">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-light text-success">
            {value}
          </span>
        </div>
      ) : (
        <p className="text-sm font-medium text-text-primary mt-1">{value}</p>
      )}
    </div>
  );
}

function HistoryItem({ date, title, user, status }: { date: string, title: string, user: string, status: string }) {
  return (
    <div className="flex gap-4 p-3 border border-border rounded-lg bg-bg-secondary">
      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-border text-text-tertiary">
        <Clock size={18} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-bold text-text-primary">{title}</h4>
          <span className="text-xs text-text-secondary">{date}</span>
        </div>
        <p className="text-xs text-text-secondary mt-1">Performed by {user}</p>
      </div>
      <span className="text-xs font-medium text-success self-center bg-success-light px-2 py-1 rounded">
        {status}
      </span>
    </div>
  );
}

function DocItem({ name, size }: { name: string, size: string }) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-bg-hover transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-info-light text-info rounded">
          <FileText size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <p className="text-xs text-text-secondary">{size}</p>
        </div>
      </div>
      <button className="p-2 text-text-tertiary hover:text-primary transition-colors">
        <Download size={18} />
      </button>
    </div>
  );
}
