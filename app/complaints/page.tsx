"use client";

import React, { useState, useRef } from 'react';
import KanbanBoard from '@/components/Complaints/KanbanBoard';
import RaiseTicketModal from '@/components/Complaints/RaiseTicketModal';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ComplaintsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const kanbanBoardRef = useRef<{ refresh?: () => void }>(null);

  const handleComplaintCreated = () => {
    setIsModalOpen(false);
    // The KanbanBoard will auto-refresh via polling, but we can trigger immediate refresh
    if (kanbanBoardRef.current?.refresh) {
      kanbanBoardRef.current.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full min-h-0 max-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Complaint Management</h1>
          <p className="text-sm sm:text-base text-text-secondary">Track and resolve equipment breakdowns</p>
        </div>
        <Button 
          variant="primary"
          leftIcon={Plus}
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Raise Complaint
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden" style={{ maxHeight: '100%' }}>
        <KanbanBoard ref={kanbanBoardRef} />
      </div>

      <RaiseTicketModal 
        isOpen={isModalOpen} 
        onClose={handleComplaintCreated}
      />
    </div>
  );
}
