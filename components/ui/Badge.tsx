'use client'

import React from 'react'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

export default function Badge({
  variant = 'default',
  size = 'md',
  icon: Icon,
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-bg-tertiary text-text-primary',
    success: 'bg-success-light text-success',
    danger: 'bg-danger-light text-danger',
    warning: 'bg-warning-light text-warning',
    info: 'bg-info-light text-info',
    primary: 'bg-primary-light text-primary',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
      {children}
    </span>
  )
}
