'use client'

import React, { useState } from 'react'
import PMCalendar from '@/components/PM/PMCalendar'
import PMListView from '@/components/PM/PMListView'
import { List, Calendar as CalendarIcon } from 'lucide-react'

export default function PMPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  return (
    <div className='flex flex-col gap-6 h-[calc(100vh-100px)]'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-text-primary'>
            Preventive Maintenance
          </h1>
          <p className='text-text-secondary'>
            Schedule and track maintenance activities
          </p>
        </div>
        <div className='flex bg-bg-tertiary p-1 rounded-lg'>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
              view === 'calendar'
                ? 'bg-white shadow text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CalendarIcon size={16} />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
              view === 'list'
                ? 'bg-white shadow text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <List size={16} />
            List View
          </button>
        </div>
      </div>

      <div className='flex-1'>
        {view === 'calendar' ? <PMCalendar /> : <PMListView />}
      </div>
    </div>
  )
}
