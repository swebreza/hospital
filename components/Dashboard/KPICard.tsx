'use client'

import React from 'react'
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  color = '#0ea5e9',
}: KPICardProps) {
  const colorClasses: Record<
    string,
    { bg: string; text: string; shadow: string }
  > = {
    '#0ea5e9': {
      bg: 'bg-primary/15',
      text: 'text-primary',
      shadow: 'shadow-primary/20',
    },
    '#10b981': {
      bg: 'bg-success/15',
      text: 'text-success',
      shadow: 'shadow-success/20',
    },
    '#ef4444': {
      bg: 'bg-danger/15',
      text: 'text-danger',
      shadow: 'shadow-danger/20',
    },
    '#6366f1': {
      bg: 'bg-info/15',
      text: 'text-info',
      shadow: 'shadow-info/20',
    },
  }

  const colorClass = colorClasses[color] || colorClasses['#0ea5e9']

  return (
    <motion.div
      className='bg-white rounded-lg p-6 shadow-sm border border-border group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5'
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-info opacity-0 group-hover:opacity-100 transition-opacity'></div>
      <div className='flex justify-between items-start'>
        <div className='flex-1'>
          <p className='text-sm text-text-secondary mb-3 font-medium uppercase tracking-wide'>
            {title}
          </p>
          <h3 className='text-3xl font-bold mb-3 text-text-primary'>{value}</h3>
          {trend && (
            <div
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                trend.isPositive ? 'text-success' : 'text-danger'
              }`}
            >
              <div
                className={`p-1 rounded-md ${
                  trend.isPositive ? 'bg-success-light' : 'bg-danger-light'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUp size={14} />
                ) : (
                  <ArrowDown size={14} />
                )}
              </div>
              <span>{trend.value}%</span>
              <span className='text-xs text-text-secondary ml-1 font-normal'>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl flex-shrink-0 transition-all group-hover:scale-110 group-hover:rotate-3 ${colorClass.bg} ${colorClass.text} shadow-lg`}
        >
          <Icon size={28} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  )
}
