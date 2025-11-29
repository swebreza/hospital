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
      <div className='p-6 flex items-center gap-3 border-b border-[var(--border-color)]'>
        <div className='w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white flex-shrink-0'>
          <Activity size={24} />
        </div>
        {!isCollapsed && (
          <div className='flex-1 min-w-0'>
            <div className='font-bold text-lg text-[var(--primary)] truncate'>
              BME-AMS
            </div>
            <div className='text-xs text-[var(--text-secondary)] truncate'>
              Cybrox Solutions
            </div>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='p-1.5 hover:bg-[var(--bg-hover)] rounded-md transition-colors ml-auto flex-shrink-0'
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={18}
              className={`text-[var(--text-secondary)] transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <ul className='flex flex-col gap-1'>
          {menuItems.map((item) => {
            const active = isActive(item.href)
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const isExpanded = expandedItems.has(item.name)

            const menuItem = (
              <li key={item.name}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                      active
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className='flex-shrink-0'>
                      <item.icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className='flex-1 text-left'>{item.name}</span>
                        {item.badge && (
                          <span className='px-2 py-0.5 bg-[var(--danger)] text-white text-xs font-bold rounded-full'>
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative ${
                      active
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className='flex-shrink-0'>
                      <item.icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className='flex-1'>{item.name}</span>
                        {item.badge && (
                          <span className='px-2 py-0.5 bg-[var(--danger)] text-white text-xs font-bold rounded-full'>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {active && !isCollapsed && (
                      <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary)] rounded-r-full' />
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
                                ? 'bg-[var(--primary-light)] text-[var(--primary)] font-medium'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
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
      <div className='p-4 border-t border-[var(--border-color)]'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold flex-shrink-0'>
            JD
          </div>
          {!isCollapsed && (
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-bold text-[var(--text-primary)] truncate'>
                John Doe
              </div>
              <div className='text-xs text-[var(--text-secondary)] truncate'>
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
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className='fixed top-4 left-4 z-[var(--z-fixed)] p-2 bg-white rounded-lg shadow-md border border-[var(--border-color)] lg:hidden'
          aria-label='Toggle menu'
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`glass-panel fixed left-0 top-0 h-full flex flex-col border-r border-[var(--border-color)] bg-white transition-all z-[var(--z-fixed)] ${
          isMobile
            ? `${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
            : `${isCollapsed ? 'w-20' : 'w-64'}`
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-[var(--z-modal-backdrop)] lg:hidden'
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
