'use client'

import React, { useEffect, useState } from 'react'
import KPICard from '@/components/Dashboard/KPICard'
import Charts from '@/components/Dashboard/Charts'
import RecentActivity from '@/components/Dashboard/RecentActivity'
import { Stethoscope, DollarSign, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardMetrics {
  pmCompliance: {
    rate: number
    totalPMs: number
    completedPMs: number
    overduePMs: number
  }
  calibrationStatus: {
    total: number
    expired: number
    expiringSoon: number
    compliant: number
  }
  complaintTrends: {
    open: number
    inProgress: number
    resolved: number
    byPriority: {
      low: number
      medium: number
      high: number
      critical: number
    }
  }
  downtimeStats: {
    totalHours: number
    totalEvents: number
    averageHours: number
    criticalAssetsAffected: number
  }
  inventoryAlerts: {
    lowStock: number
    outOfStock: number
    criticalItems: number
  }
  amcCmcUpdates: {
    expiringSoon: number
    expired: number
    renewalsNeeded: number
  }
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        const result = await response.json()
        if (result.success) {
          setMetrics(result.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    // Refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000)

    return () => clearInterval(interval)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div
      className='flex flex-col gap-8'
      style={{ width: '100%', height: '100%' }}
    >
      <div>
        <h1 className='text-3xl font-bold text-[var(--text-primary)] mb-2'>
          Dashboard
        </h1>
        <p className='text-[var(--text-secondary)] text-base'>
          Welcome back, here&apos;s an overview of your system
        </p>
      </div>

      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
        variants={container}
        initial='hidden'
        animate='show'
        style={{ width: '100%' }}
      >
        <motion.div variants={item}>
          <KPICard
            title='PM Compliance'
            value={loading ? '...' : `${metrics?.pmCompliance.rate.toFixed(1) || 0}%`}
            icon={CheckCircle}
            color='#6366f1'
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title='Calibration Status'
            value={loading ? '...' : `${metrics?.calibrationStatus.compliant || 0}/${metrics?.calibrationStatus.total || 0}`}
            icon={CheckCircle}
            color='#10b981'
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title='Open Complaints'
            value={loading ? '...' : metrics?.complaintTrends.open || 0}
            icon={AlertCircle}
            color='#ef4444'
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title='Downtime Hours'
            value={loading ? '...' : `${metrics?.downtimeStats.totalHours.toFixed(1) || 0}h`}
            icon={Clock}
            color='#f59e0b'
          />
        </motion.div>
      </motion.div>

      <div
        className='grid grid-cols-1 lg:grid-cols-3 gap-6'
        style={{ width: '100%' }}
      >
        <motion.div
          className='lg:col-span-2'
          style={{ width: '100%' }}
          variants={item}
          initial='hidden'
          animate='show'
        >
          <Charts />
        </motion.div>
        <motion.div
          style={{ width: '100%' }}
          variants={item}
          initial='hidden'
          animate='show'
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  )
}
