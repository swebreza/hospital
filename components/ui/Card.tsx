'use client'

import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  children: React.ReactNode
}

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-[var(--bg-primary)] border border-[var(--border-color)]',
    elevated: 'bg-[var(--bg-primary)] shadow-md',
    outlined: 'bg-transparent border-2 border-[var(--border-color)]',
  }

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        'rounded-lg transition-all',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-lg hover:border-[var(--primary)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
