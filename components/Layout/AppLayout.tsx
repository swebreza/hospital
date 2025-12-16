'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Breadcrumb from './Breadcrumb'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import type { ClerkUserRole } from '@/lib/types'
import { hasAccessClient } from '@/lib/auth/client-roles'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
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
    if (!userLoaded) return

    const checkAccess = async () => {
      // Skip auth check for public routes
      const publicRoutes = ['/sign-in', '/sign-up', '/select-role']
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false)
        return
      }

      // If not signed in, Clerk will handle redirect
      if (!isSignedIn) {
        setIsLoading(false)
        return
      }

      // Check if user needs to select role
      const userRole = (user?.publicMetadata?.role as ClerkUserRole) || null
      if (!userRole && pathname !== '/select-role') {
        router.push('/select-role')
        return
      }

      // Check route access
      const access = hasAccessClient(pathname, userRole)
      if (!access && pathname !== '/select-role') {
        // Redirect to dashboard if no access
        router.push('/')
        return
      }

      setIsLoading(false)
    }

    checkAccess()
  }, [userLoaded, isSignedIn, user, pathname, router])

  useEffect(() => {
    // Trigger loading state on route change
    if (userLoaded) {
      const timer = setTimeout(() => setIsLoading(false), 100)
      return () => clearTimeout(timer)
    }
  }, [pathname, userLoaded])

  // Public routes that don't need authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/select-role']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (!isPublicRoute) {
    return (
      <>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <SignedIn>
          {isLoading ? (
            <div className='flex items-center justify-center h-screen bg-bg-secondary'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : (
            <div className='flex h-screen bg-bg-secondary overflow-hidden'>
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

                <main className='flex-1 overflow-auto scrollbar-thin'>
                  <div className='p-4 lg:p-6 xl:p-8'>
                    {/* Breadcrumb */}
                    <div className='mb-6'>
                      <Breadcrumb />
                    </div>

                    {/* Page Content */}
                    <motion.div
                      key={pathname}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className='w-full'
                    >
                      {children}
                    </motion.div>
                  </div>
                </main>
              </div>
            </div>
          )}
        </SignedIn>
      </>
    )
  }

  // Public routes (sign-in, sign-up, select-role)
  return <>{children}</>
}
