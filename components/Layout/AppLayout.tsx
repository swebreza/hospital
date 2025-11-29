'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Breadcrumb from './Breadcrumb'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setSidebarWidth(mobile ? 0 : 260)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Trigger loading state on route change
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className='flex h-screen bg-[var(--bg-secondary)] overflow-hidden'>
      <Sidebar />

      {/* Main Content Area */}
      <div
        className='flex-1 flex flex-col overflow-hidden transition-all duration-300'
        style={{
          marginLeft: isMobile ? '0' : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        <Header />

        <main className='flex-1 overflow-auto'>
          <div className='p-4 lg:p-6 lg:p-8'>
            {/* Breadcrumb */}
            <div className='mb-6'>
              <Breadcrumb />
            </div>

            {/* Page Content */}
            {isLoading ? (
              <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]'></div>
              </div>
            ) : (
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className='w-full'
              >
                {children}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
