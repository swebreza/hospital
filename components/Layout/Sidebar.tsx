'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Stethoscope,
  ClipboardCheck,
  AlertTriangle,
  Package,
  Users,
  FileText,
  Settings,
  Activity,
  ChevronLeft,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip from '@/components/ui/Tooltip'

interface MenuItem {
  name: string
  icon: React.ComponentType<{ size?: number }>
  href: string
  badge?: number
  submenu?: { name: string; href: string }[]
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Assets', icon: Stethoscope, href: '/assets' },
  { name: 'Preventive Maint.', icon: ClipboardCheck, href: '/pm' },
  { name: 'Calibration', icon: Activity, href: '/calibration' },
  { name: 'Training', icon: GraduationCap, href: '/training' },
  { name: 'Breakdowns', icon: AlertTriangle, href: '/complaints', badge: 3 },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Vendors', icon: Users, href: '/vendors' },
  { name: 'Reports', icon: FileText, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSubmenu = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemName)) {
        newSet.delete(itemName)
      } else {
        newSet.add(itemName)
      }
      return newSet
    })
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className='p-6 flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary-lighter to-transparent'>
        <div className='w-12 h-12 bg-gradient-to-br from-primary to-info rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md'>
          <Activity size={24} />
        </div>
        {!isCollapsed && (
          <div className='flex-1 min-w-0'>
            <div className='font-bold text-xl text-primary truncate'>
              BME-AMS
            </div>
            <div className='text-xs text-text-secondary truncate font-medium'>
              Cybrox Solutions
            </div>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='p-2 hover:bg-bg-hover rounded-lg transition-all ml-auto flex-shrink-0 hover:scale-110'
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={18}
              className={`text-text-secondary transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto scrollbar-thin'>
        <ul className='flex flex-col gap-1.5'>
          {menuItems.map((item) => {
            const active = isActive(item.href)
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const isExpanded = expandedItems.has(item.name)

            const menuItem = (
              <li key={item.name}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative ${
                      active
                        ? 'bg-gradient-to-r from-primary-light to-transparent text-primary shadow-sm'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}
                  >
                    <div className='flex-shrink-0'>
                      <item.icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className='flex-1 text-left'>{item.name}</span>
                        {item.badge && (
                          <span className='px-2 py-0.5 bg-danger text-white text-xs font-bold rounded-full'>
                            {item.badge}
                          </span>
                        )}
                        <div
                          className={`transition-transform flex-shrink-0 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          <ChevronDown size={16} />
                        </div>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative group ${
                      active
                        ? 'bg-gradient-to-r from-primary-light to-transparent text-primary shadow-sm'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}
                  >
                    <div className='flex-shrink-0'>
                      <item.icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className='flex-1'>{item.name}</span>
                        {item.badge && (
                          <span className='px-2 py-0.5 bg-danger text-white text-xs font-bold rounded-full'>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {active && !isCollapsed && (
                      <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-info rounded-r-full shadow-sm' />
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isExpanded && !isCollapsed && (
                  <AnimatePresence>
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='ml-8 mt-1 space-y-1 overflow-hidden'
                    >
                      {item.submenu?.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            onClick={() => isMobile && setIsMobileOpen(false)}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              pathname === subItem.href
                                ? 'bg-primary-light text-primary font-medium'
                                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>
                )}
              </li>
            )

            return isCollapsed && !isMobile ? (
              <Tooltip key={item.name} content={item.name} position='right'>
                {menuItem}
              </Tooltip>
            ) : (
              menuItem
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className='p-4 border-t border-border bg-gradient-to-r from-bg-secondary to-transparent'>
        <div className='flex items-center gap-3'>
          <div className='w-11 h-11 rounded-full bg-gradient-to-br from-primary to-info text-white flex items-center justify-center font-semibold flex-shrink-0 shadow-md ring-2 ring-white/50'>
            JD
          </div>
          {!isCollapsed && (
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-bold text-text-primary truncate'>
                John Doe
              </div>
              <div className='text-xs text-text-secondary truncate font-medium'>
                Biomedical Eng.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Overlay - Must be behind sidebar but above everything else */}
      {isMobile && isMobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 lg:hidden'
          style={{ zIndex: 1035 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Must be above overlay */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col border-r border-border bg-white transition-all duration-300 shadow-xl ${
          isMobile
            ? `${
                isMobileOpen
                  ? 'translate-x-0 z-[1040]'
                  : '-translate-x-full z-fixed'
              } w-64`
            : `z-fixed ${isCollapsed ? 'w-20' : 'w-64'}`
        }`}
        style={
          isMobile && isMobileOpen
            ? { zIndex: 1040, position: 'fixed' }
            : undefined
        }
      >
        {sidebarContent}
      </aside>

      {/* Mobile Menu Button - Must be above sidebar when open */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`fixed top-4 left-4 p-2 bg-white rounded-lg shadow-md border border-border lg:hidden hover:bg-bg-hover transition-colors z-[1050] ${
            isMobileOpen ? 'left-[280px]' : 'left-4'
          }`}
          aria-label='Toggle menu'
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
    </>
  )
}
