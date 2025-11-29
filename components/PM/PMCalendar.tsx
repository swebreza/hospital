"use client";

import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function PMCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { assets } = useStore();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return assets.filter(asset => isSameDay(new Date(asset.nextPmDate), day));
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Wrench size={20} className="text-primary" />
          Maintenance Schedule
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-lg w-32 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, dayIdx) => {
          const events = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString()} 
              className={`bg-white min-h-[100px] p-2 flex flex-col gap-1 hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? 'text-gray-300 bg-gray-50/50' : ''
              }`}
            >
              <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                isSameDay(day, new Date()) ? 'bg-primary text-white' : ''
              }`}>
                {format(day, 'd')}
              </span>
              
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px]">
                {events.map(asset => (
                  <motion.div 
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs p-1 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate cursor-pointer hover:bg-blue-100"
                    title={`${asset.name} (${asset.department})`}
                  >
                    {asset.name}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
