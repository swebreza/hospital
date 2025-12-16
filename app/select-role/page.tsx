'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SelectRolePage() {
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'normal' | 'full_access' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (userLoaded && user) {
      // Check if user already has a role
      const existingRole = user.publicMetadata?.role as string | undefined
      if (existingRole === 'normal' || existingRole === 'full_access') {
        // User already has a role, redirect to dashboard
        router.push('/')
      }
    }
  }, [user, userLoaded, router])

  const handleRoleSelection = async (role: 'normal' | 'full_access') => {
    if (!user) return

    setSelectedRole(role)
    setIsSubmitting(true)

    try {
      const token = await getToken()
      
      // Update user metadata via API
      const response = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      // Update local user object
      await user.reload()
      
      toast.success('Role selected successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role. Please try again.')
      setIsSubmitting(false)
      setSelectedRole(null)
    }
  }

  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome to BME-AMS
            </h1>
            <p className="text-text-secondary">
              Please select your access level to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Normal User */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelection('normal')}
              disabled={isSubmitting}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selectedRole === 'normal'
                  ? 'border-primary bg-primary-lighter'
                  : 'border-border hover:border-primary hover:bg-bg-hover'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === 'normal'
                    ? 'bg-primary text-white'
                    : 'bg-primary-lighter text-primary'
                }`}>
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Normal User
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Access to core features for daily operations
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>✓ Assets Management</li>
                    <li>✓ Breakdowns & Complaints</li>
                    <li>✓ Preventive Maintenance</li>
                    <li>✓ Inventory</li>
                    <li>✓ Vendors</li>
                  </ul>
                </div>
              </div>
            </motion.button>

            {/* Full Access User */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelection('full_access')}
              disabled={isSubmitting}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selectedRole === 'full_access'
                  ? 'border-primary bg-primary-lighter'
                  : 'border-border hover:border-primary hover:bg-bg-hover'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === 'full_access'
                    ? 'bg-primary text-white'
                    : 'bg-primary-lighter text-primary'
                }`}>
                  <Shield size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Full Access User
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Complete access to all system features
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>✓ All Normal User features</li>
                    <li>✓ Calibration Management</li>
                    <li>✓ Training Management</li>
                    <li>✓ Reports & Analytics</li>
                    <li>✓ System Settings</li>
                  </ul>
                </div>
              </div>
            </motion.button>
          </div>

          {isSubmitting && (
            <div className="mt-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="text-sm text-text-secondary mt-2">Setting up your account...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

