"use client";

import React, { useState } from 'react';
import KanbanBoard from '@/components/Complaints/KanbanBoard';
import RaiseTicketModal from '@/components/Complaints/RaiseTicketModal';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ComplaintsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Complaint Management</h1>
          <p className="text-text-secondary">Track and resolve equipment breakdowns</p>
        </div>
        <Button 
          variant="primary"
          leftIcon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Raise Complaint
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      <RaiseTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
