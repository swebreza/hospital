'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'
import { apiPost, apiDelete } from '@/lib/api/client'

export default function SeedUsersButton() {
  const [loading, setLoading] = useState(false)

  const handleSeedUsers = async () => {
    setLoading(true)
    try {
      const response = await apiPost<{ success: boolean; message: string; users?: number }>('/seed')
      
      if (response.success) {
        toast.success(response.message || 'Users created successfully!')
        // Reload the page to refresh the trainer list
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error(response.message || 'Failed to seed users')
      }
    } catch (error: any) {
      console.error('Error seeding users:', error)
      toast.error(error?.response?.data?.error || error?.message || 'Failed to seed users')
    } finally {
      setLoading(false)
    }
  }

  const handleClearUsers = async () => {
    if (!confirm('Are you sure you want to delete all users? This cannot be undone!')) {
      return
    }

    setLoading(true)
    try {
      const response = await apiDelete<{ success: boolean; message: string }>('/seed')
      
      if (response.success) {
        toast.success(response.message || 'Users deleted successfully!')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error(response.message || 'Failed to delete users')
      }
    } catch (error: any) {
      console.error('Error deleting users:', error)
      toast.error(error?.response?.data?.error || error?.message || 'Failed to delete users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="primary"
        onClick={handleSeedUsers}
        isLoading={loading}
        size="sm"
      >
        Seed Demo Users
      </Button>
      <Button
        variant="outline"
        onClick={handleClearUsers}
        isLoading={loading}
        size="sm"
      >
        Clear Users
      </Button>
    </div>
  )
}

