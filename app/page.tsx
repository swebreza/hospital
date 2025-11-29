'use client'

import React from 'react'
import KPICard from '@/components/Dashboard/KPICard'
import Charts from '@/components/Dashboard/Charts'
import RecentActivity from '@/components/Dashboard/RecentActivity'
import { Stethoscope, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
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
            title='Total Assets'
            value={245}
            icon={Stethoscope}
            trend={{ value: 12, isPositive: true }}
            color='var(--primary)'
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title='Asset Value'
            value='₹ 2.4 Cr'
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            color='#10b981'
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title='Compliance Rate'
            value='94%'
            icon={CheckCircle}
            trend={{ value: 3, isPositive: true }}
            color='#6366f1'
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title='Open Complaints'
            value={18}
            icon={AlertCircle}
            trend={{ value: 15, isPositive: false }}
            color='#ef4444'
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
