'use client'

import React, { createContext, useContext } from 'react'

// Demo date: November 29, 2025
export const DEMO_DATE = new Date('2025-11-29')

interface DemoContextType {
  currentDate: Date
}

const DemoContext = createContext<DemoContextType>({
  currentDate: DEMO_DATE,
})

export function DemoProvider({ children }: { children: React.ReactNode }) {
  return (
    <DemoContext.Provider value={{ currentDate: DEMO_DATE }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoDate() {
  return useContext(DemoContext).currentDate
}
