"use client";

import React, { useState } from 'react';
import { Check, X, Save, PenTool } from 'lucide-react';
import { toast } from 'sonner';

const checklistItems = [
  { id: 1, task: 'Visual inspection of exterior', type: 'boolean' },
  { id: 2, task: 'Check power cord and plug', type: 'boolean' },
  { id: 3, task: 'Verify battery backup function', type: 'boolean' },
  { id: 4, task: 'Clean filters and vents', type: 'boolean' },
  { id: 5, task: 'Run self-test diagnostic', type: 'boolean' },
  { id: 6, task: 'Verify alarm functionality', type: 'boolean' },
];

export default function PMChecklist({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<Record<number, 'pass' | 'fail' | null>>({});

  const handleToggle = (id: number, status: 'pass' | 'fail') => {
    setResults(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = () => {
    const allCompleted = checklistItems.every(item => results[item.id]);
    if (!allCompleted) {
      toast.error('Please complete all checklist items');
      return;
    }
    toast.success('PM Checklist submitted successfully');
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold text-lg">Maintenance Checklist</h3>
        <p className="text-xs text-gray-500">Asset: Ventilator (Servo-u)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {checklistItems.map((item) => (
          <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium">{item.task}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(item.id, 'pass')}
                className={`p-2 rounded-full transition-colors ${
                  results[item.id] === 'pass' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleToggle(item.id, 'fail')}
                className={`p-2 rounded-full transition-colors ${
                  results[item.id] === 'fail' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 border rounded-lg bg-gray-50 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 h-32">
          <PenTool size={24} className="mb-2" />
          <span className="text-sm">Technician Signature</span>
        </div>
      </div>

      <div className="p-4 border-t">
        <button 
          onClick={handleSubmit}
          className="w-full btn btn-primary py-3 text-base"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}
