"use client";

import React, { useState } from 'react';
import { X, QrCode, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RaiseTicketModal({ isOpen, onClose }: RaiseTicketModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [assetId, setAssetId] = useState('');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setAssetId('AST-001 (MRI Scanner)');
      toast.success('Asset scanned successfully');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Complaint ticket raised successfully');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
            style={{ backdropFilter: 'blur(4px)' }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold">Report Breakdown</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {isScanning ? (
                  <div className="aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white mb-6 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#22c55e]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <Camera size={48} className="mb-2 opacity-50" />
                    <p className="text-sm">Scanning QR Code...</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asset ID</label>
                    <div className="flex gap-2">
                      <input 
                        value={assetId}
                        onChange={(e) => setAssetId(e.target.value)}
                        placeholder="Enter Asset ID or Scan QR"
                        className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                      />
                      <button 
                        onClick={handleScan}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 border border-gray-300"
                        title="Scan QR Code"
                      >
                        <QrCode size={20} />
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                    <input required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. System Overheating" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea required rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none" placeholder="Describe the issue..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none bg-white">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full btn btn-primary py-2.5 mt-2">
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
