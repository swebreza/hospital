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
    default: 'bg-white border border-border',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-transparent border-2 border-border',
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
        'rounded-lg transition-all relative overflow-hidden',
        variants[variant],
        paddings[padding],
        hover &&
          'hover:shadow-lg hover:border-primary cursor-pointer hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {hover && (
        <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-info opacity-0 group-hover:opacity-100 transition-opacity'></div>
      )}
      {children}
    </div>
  )
}
