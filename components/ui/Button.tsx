'use client'

import React from 'react'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'as'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  fullWidth?: boolean
  as?: React.ElementType
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  as: Component = 'button',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-bg-tertiary text-text-primary hover:bg-bg-hover focus:ring-primary',
    outline:
      'border border-border bg-transparent text-text-primary hover:bg-bg-secondary hover:border-primary focus:ring-primary hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-text-primary hover:bg-bg-hover focus:ring-primary',
    danger:
      'bg-danger text-white hover:bg-danger-hover focus:ring-danger shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  const ComponentProps = {
    className: clsx(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    ),
    ...(Component === 'button' && { disabled: disabled || isLoading }),
    ...props,
  }

  return (
    <Component {...ComponentProps}>
      {isLoading ? (
        <>
          <svg
            className='animate-spin h-4 w-4'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {LeftIcon && (
            <LeftIcon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
          )}
          {children}
          {RightIcon && (
            <RightIcon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
          )}
        </>
      )}
    </Component>
  )
}
