"use client";

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AlertCircle, Clock, CheckCircle, MoreHorizontal } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  asset: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
}

const initialData: Record<string, Ticket[]> = {
  open: [
    { id: 'T-101', title: 'MRI Cooling Failure', asset: 'MRI Scanner', priority: 'High', time: '2h ago' },
    { id: 'T-102', title: 'Display Glitch', asset: 'Patient Monitor', priority: 'Low', time: '4h ago' },
  ],
  inProgress: [
    { id: 'T-103', title: 'Calibration Error', asset: 'Ventilator', priority: 'Medium', time: '1d ago' },
  ],
  resolved: [
    { id: 'T-104', title: 'Battery Replacement', asset: 'Defibrillator', priority: 'Medium', time: '2d ago' },
  ],
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialData);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...columns[source.droppableId]];
    const destCol = [...columns[destination.droppableId]];
    const [removed] = sourceCol.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: sourceCol });
    } else {
      destCol.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: sourceCol, [destination.droppableId]: destCol });
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {Object.entries(columns).map(([colId, tickets]) => (
          <div key={colId} className="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold capitalize text-gray-700 flex items-center gap-2">
                {colId === 'open' && <AlertCircle size={18} className="text-red-500" />}
                {colId === 'inProgress' && <Clock size={18} className="text-orange-500" />}
                {colId === 'resolved' && <CheckCircle size={18} className="text-green-500" />}
                {colId.replace(/([A-Z])/g, ' $1').trim()}
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-2">
                  {tickets.length}
                </span>
              </h3>
              <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
            </div>

            <Droppable droppableId={colId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 flex flex-col gap-3"
                >
                  {tickets.map((ticket, index) => (
                    <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary rotate-2' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-400">{ticket.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm mb-1">{ticket.title}</h4>
                          <p className="text-xs text-gray-500 mb-3">{ticket.asset}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {ticket.time}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
