"use client";

import React, { useState } from 'react';
import KanbanBoard from '@/components/Complaints/KanbanBoard';
import RaiseTicketModal from '@/components/Complaints/RaiseTicketModal';
import { Plus } from 'lucide-react';

export default function ComplaintsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Complaint Management</h1>
          <p className="text-secondary">Track and resolve equipment breakdowns</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <Plus size={18} />
          Raise Complaint
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      <RaiseTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
