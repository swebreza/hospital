'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
      if (showNotifications) {
        fetchNotifications()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [showNotifications])

  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const response = await fetch('/api/notifications?limit=10')
      const result = await response.json()
      if (result.success) {
        const formattedNotifications: Notification[] = result.data.map(
          (n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message || n.title,
            time: formatTimeAgo(new Date(n.createdAt)),
            type: mapNotificationType(n.type),
            read: n.isRead,
          })
        )
        setNotifications(formattedNotifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count')
      const result = await response.json()
      if (result.success) {
        setUnreadCount(result.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const mapNotificationType = (
    type: string
  ): 'info' | 'warning' | 'error' | 'success' => {
    if (type.includes('OVERDUE') || type.includes('CRITICAL')) return 'error'
    if (type.includes('REMINDER') || type.includes('ASSIGNED')) return 'warning'
    if (type.includes('RESOLVED') || type.includes('COMPLETED'))
      return 'success'
    return 'info'
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
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

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId: id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-danger-light text-danger'
      case 'warning':
        return 'bg-warning-light text-warning'
      case 'success':
        return 'bg-success-light text-success'
      default:
        return 'bg-info-light text-info'
    }
  }

  return (
    <header className='h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-white/98 backdrop-blur-xl sticky top-0 z-[1020] shadow-sm'>
      {/* Search */}
      <form onSubmit={handleSearch} className='flex-1 max-w-2xl mr-4'>
        <div
          ref={searchRef}
          className={`relative transition-all ${
            isSearchFocused
              ? 'ring-2 ring-primary ring-offset-2 rounded-lg'
              : ''
          }`}
        >
          <Search
            size={18}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder='Search assets, PMs, tickets, or anything...'
            className='w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-hover rounded transition-colors'
            >
              <X size={16} className='text-text-secondary' />
            </button>
          )}
        </div>
      </form>

      {/* Actions */}
      <div className='flex items-center gap-2'>
        {/* Help */}
        <Tooltip content='Help & Support' position='bottom'>
          <button className='p-2 hover:bg-bg-hover rounded-lg transition-all text-text-secondary hover:text-text-primary hover:scale-110'>
            <HelpCircle size={20} />
          </button>
        </Tooltip>

        {/* Notifications */}
        <div className='relative' ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className='relative p-2 hover:bg-bg-hover rounded-lg transition-all text-text-secondary hover:text-text-primary hover:scale-110'
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className='absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white shadow-sm animate-pulse' />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className='fixed inset-0 z-[1000]'
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className='absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-border z-[1000] max-h-96 overflow-hidden flex flex-col'
                >
                  <div className='p-4 border-b border-border flex items-center justify-between'>
                    <h3 className='font-semibold text-text-primary'>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className='text-xs text-primary hover:underline'
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className='overflow-y-auto flex-1 scrollbar-thin'>
                    {notifications.length === 0 ? (
                      <div className='p-8 text-center text-text-secondary text-sm'>
                        No notifications
                      </div>
                    ) : (
                      <div className='divide-y divide-border'>
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                            className={`w-full text-left p-4 hover:bg-bg-hover transition-colors ${
                              !notification.read ? 'bg-primary-lighter' : ''
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
                                <p className='text-sm font-medium text-text-primary'>
                                  {notification.title}
                                </p>
                                <p className='text-xs text-text-secondary mt-1 line-clamp-2'>
                                  {notification.message}
                                </p>
                                <p className='text-xs text-text-tertiary mt-2'>
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className='w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2' />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className='p-3 border-t border-border flex gap-2'>
                      <button
                        onClick={markAllAsRead}
                        className='flex-1 text-sm text-primary hover:underline text-center'
                      >
                        Mark all as read
                      </button>
                      <button className='flex-1 text-sm text-primary hover:underline text-center'>
                        View all
                      </button>
                    </div>
                  )}
                  {loadingNotifications && notifications.length === 0 && (
                    <div className='p-6 text-center text-text-secondary'>
                      Loading notifications...
                    </div>
                  )}
                  {!loadingNotifications && notifications.length === 0 && (
                    <div className='p-6 text-center text-text-secondary'>
                      No notifications
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu - Clerk UserButton */}
        <div className='relative'>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
                userButtonPopoverCard: 'shadow-xl',
              },
            }}
            afterSignOutUrl='/sign-in'
          />
        </div>
      </div>
    </header>
  )
}
