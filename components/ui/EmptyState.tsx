'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  size = 'md',
}: EmptyStateProps) {
  const iconSizes = {
    sm: 48,
    md: 64,
    lg: 80,
  }

  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
      {Icon && (
        <div className='mb-4 p-4 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'>
          <Icon size={iconSizes[size]} />
        </div>
      )}

      <h3 className='text-lg font-semibold text-[var(--text-primary)] mb-2'>
        {title}
      </h3>

      {description && (
        <p className='text-sm text-[var(--text-secondary)] max-w-md mb-6'>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} variant='primary'>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
