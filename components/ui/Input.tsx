'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  fullWidth?: boolean
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className='text-sm font-medium text-[var(--text-primary)]'
        >
          {label}
          {props.required && (
            <span className='text-[var(--danger)] ml-1'>*</span>
          )}
        </label>
      )}

      <div className='relative'>
        {LeftIcon && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]'>
            <LeftIcon size={18} />
          </div>
        )}

        <input
          id={inputId}
          className={clsx(
            'w-full px-4 py-2 text-sm rounded-md border transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error
              ? 'border-[var(--border-error)] focus:ring-[var(--danger)] focus:border-[var(--danger)]'
              : 'border-[var(--border-color)] focus:ring-[var(--primary)] focus:border-[var(--primary)]',
            'disabled:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed disabled:text-[var(--text-disabled)]',
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]'>
            <RightIcon size={18} />
          </div>
        )}
      </div>

      {error && (
        <p className='text-xs text-[var(--danger)] font-medium'>{error}</p>
      )}

      {helperText && !error && (
        <p className='text-xs text-[var(--text-secondary)]'>{helperText}</p>
      )}
    </div>
  )
}
