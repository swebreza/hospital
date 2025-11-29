'use client'

import React, { useState } from 'react'
import { Settings, Users, Bell, Database, Shield, Mail } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { motion } from 'framer-motion'

const settingsTabs = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'system', label: 'System Config', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-[var(--text-primary)]'>
                User Management
              </h2>
              <Button variant='primary'>Add User</Button>
            </div>
            <Card padding='md'>
              <p className='text-[var(--text-secondary)]'>
                User management interface coming soon
              </p>
            </Card>
          </div>
        )
      case 'notifications':
        return (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold text-[var(--text-primary)]'>
              Notification Settings
            </h2>
            <Card padding='md'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-[var(--text-primary)]'>
                      Email Notifications
                    </p>
                    <p className='text-sm text-[var(--text-secondary)]'>
                      Receive email alerts for important events
                    </p>
                  </div>
                  <input type='checkbox' defaultChecked className='w-5 h-5' />
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-[var(--text-primary)]'>
                      SMS Notifications
                    </p>
                    <p className='text-sm text-[var(--text-secondary)]'>
                      Receive SMS for critical alerts
                    </p>
                  </div>
                  <input type='checkbox' className='w-5 h-5' />
                </div>
              </div>
            </Card>
          </div>
        )
      case 'system':
        return (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold text-[var(--text-primary)]'>
              System Configuration
            </h2>
            <Card padding='md'>
              <div className='space-y-4'>
                <Input label='System Name' defaultValue='BME-AMS' />
                <Input
                  label='Hospital Name'
                  defaultValue='Sakra World Hospital'
                />
                <Select
                  label='Time Zone'
                  options={[
                    { value: 'IST', label: 'Indian Standard Time (IST)' },
                    { value: 'UTC', label: 'UTC' },
                  ]}
                  value='IST'
                />
              </div>
            </Card>
          </div>
        )
      default:
        return (
          <Card padding='md'>
            <p className='text-[var(--text-secondary)]'>
              Settings for this section coming soon
            </p>
          </Card>
        )
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-[var(--text-primary)]'>
          Settings
        </h1>
        <p className='text-sm text-[var(--text-secondary)] mt-1'>
          Manage system configuration and preferences
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Sidebar */}
        <div className='lg:col-span-1'>
          <Card padding='none'>
            <nav className='p-2'>
              {settingsTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      activeTab === tab.id
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className='lg:col-span-3'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
