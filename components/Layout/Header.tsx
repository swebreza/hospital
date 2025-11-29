'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Settings,
  ChevronDown,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Tooltip from '@/components/ui/Tooltip'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'PM Due Today',
    message: 'Ventilator (AST-002) requires preventive maintenance',
    time: '5 mins ago',
    type: 'warning',
    read: false,
  },
  {
    id: '2',
    title: 'Calibration Expiring',
    message: 'Defibrillator calibration expires in 3 days',
    time: '1 hour ago',
    type: 'info',
    read: false,
  },
  {
    id: '3',
    title: 'Complaint Resolved',
    message: 'MRI Scanner breakdown has been resolved',
    time: '2 hours ago',
    type: 'success',
    read: true,
  },
]

export default function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results or perform search
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsSearchFocused(false)
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-[var(--danger-light)] text-[var(--danger)]'
      case 'warning':
        return 'bg-[var(--warning-light)] text-[var(--warning)]'
      case 'success':
        return 'bg-[var(--success-light)] text-[var(--success)]'
      default:
        return 'bg-[var(--info-light)] text-[var(--info)]'
    }
  }

  return (
    <header className='glass-panel h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border-color)] bg-white sticky top-0 z-[var(--z-sticky)]'>
      {/* Search */}
      <form onSubmit={handleSearch} className='flex-1 max-w-2xl mr-4'>
        <div
          ref={searchRef}
          className={`relative transition-all ${
            isSearchFocused ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''
          }`}
        >
          <Search
            size={18}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder='Search assets, PMs, tickets, or anything...'
            className='w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-white focus:outline-none focus:border-[var(--primary)] transition-colors'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--bg-hover)] rounded'
            >
              <X size={16} className='text-[var(--text-secondary)]' />
            </button>
          )}
        </div>
      </form>

      {/* Actions */}
      <div className='flex items-center gap-2'>
        {/* Help */}
        <Tooltip content='Help & Support' position='bottom'>
          <button className='p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]'>
            <HelpCircle size={20} />
          </button>
        </Tooltip>

        {/* Notifications */}
        <div className='relative' ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className='relative p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className='absolute top-1 right-1 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-white' />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className='fixed inset-0 z-[var(--z-dropdown)]'
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className='absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-[var(--border-color)] z-[var(--z-dropdown)] max-h-96 overflow-hidden flex flex-col'
                >
                  <div className='p-4 border-b border-[var(--border-color)] flex items-center justify-between'>
                    <h3 className='font-semibold text-[var(--text-primary)]'>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className='text-xs text-[var(--primary)] hover:underline'
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className='overflow-y-auto flex-1'>
                    {notifications.length === 0 ? (
                      <div className='p-8 text-center text-[var(--text-secondary)] text-sm'>
                        No notifications
                      </div>
                    ) : (
                      <div className='divide-y divide-[var(--border-color)]'>
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                            className={`w-full text-left p-4 hover:bg-[var(--bg-hover)] transition-colors ${
                              !notification.read
                                ? 'bg-[var(--primary-lighter)]'
                                : ''
                            }`}
                          >
                            <div className='flex items-start gap-3'>
                              <div
                                className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(
                                  notification.type
                                )}`}
                              >
                                <Bell size={16} />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-[var(--text-primary)]'>
                                  {notification.title}
                                </p>
                                <p className='text-xs text-[var(--text-secondary)] mt-1 line-clamp-2'>
                                  {notification.message}
                                </p>
                                <p className='text-xs text-[var(--text-tertiary)] mt-2'>
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className='w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0 mt-2' />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className='p-3 border-t border-[var(--border-color)]'>
                      <button className='w-full text-sm text-[var(--primary)] hover:underline text-center'>
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className='relative' ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className='flex items-center gap-2 p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition-colors'
          >
            <div className='w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold text-sm'>
              JD
            </div>
            <ChevronDown
              size={16}
              className={`text-[var(--text-secondary)] transition-transform ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className='fixed inset-0 z-[var(--z-dropdown)]'
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className='absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-[var(--border-color)] z-[var(--z-dropdown)] overflow-hidden'
                >
                  <div className='p-4 border-b border-[var(--border-color)]'>
                    <p className='font-semibold text-[var(--text-primary)]'>
                      John Doe
                    </p>
                    <p className='text-xs text-[var(--text-secondary)]'>
                      john.doe@hospital.com
                    </p>
                  </div>
                  <div className='py-2'>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setShowUserMenu(false)
                      }}
                      className='w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors'
                    >
                      <User
                        size={18}
                        className='text-[var(--text-secondary)]'
                      />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setShowUserMenu(false)
                      }}
                      className='w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors'
                    >
                      <Settings
                        size={18}
                        className='text-[var(--text-secondary)]'
                      />
                      Settings
                    </button>
                  </div>
                  <div className='border-t border-[var(--border-color)] py-2'>
                    <button
                      onClick={() => {
                        // Handle logout
                        setShowUserMenu(false)
                      }}
                      className='w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-lighter)] transition-colors'
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
