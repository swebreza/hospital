'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export default function Textarea({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id || generatedId

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={textareaId}
          className='text-sm font-medium text-[var(--text-primary)]'
        >
          {label}
          {props.required && (
            <span className='text-[var(--danger)] ml-1'>*</span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        className={clsx(
          'w-full px-4 py-2 text-sm rounded-md border transition-all resize-y',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-[var(--border-error)] focus:ring-[var(--danger)] focus:border-[var(--danger)]'
            : 'border-[var(--border-color)] focus:ring-[var(--primary)] focus:border-[var(--primary)]',
          'disabled:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed disabled:text-[var(--text-disabled)]',
          className
        )}
        {...props}
      />

      {error && (
        <p className='text-xs text-[var(--danger)] font-medium'>{error}</p>
      )}

      {helperText && !error && (
        <p className='text-xs text-[var(--text-secondary)]'>{helperText}</p>
      )}
    </div>
  )
}
