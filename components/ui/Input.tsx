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
          className='text-sm font-medium text-text-primary'
        >
          {label}
          {props.required && <span className='text-danger ml-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        {LeftIcon && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary'>
            <LeftIcon size={18} />
          </div>
        )}

        <input
          id={inputId}
          className={clsx(
            'w-full px-4 py-2 text-sm rounded-lg border transition-all shadow-sm hover:shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error
              ? 'border-border-error focus:ring-danger focus:border-danger'
              : 'border-border focus:ring-primary focus:border-primary',
            'disabled:bg-bg-tertiary disabled:cursor-not-allowed disabled:text-text-disabled',
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary'>
            <RightIcon size={18} />
          </div>
        )}
      </div>

      {error && <p className='text-xs text-danger font-medium'>{error}</p>}

      {helperText && !error && (
        <p className='text-xs text-text-secondary'>{helperText}</p>
      )}
    </div>
  )
}
