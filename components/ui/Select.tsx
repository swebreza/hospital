'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  fullWidth = false,
  className,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id || generatedId

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className='text-sm font-medium text-text-primary'
        >
          {label}
          {props.required && (
            <span className='text-danger ml-1'>*</span>
          )}
        </label>
      )}

      <div className='relative'>
        <select
          id={selectId}
          className={clsx(
            'w-full px-4 py-2 text-sm rounded-lg border transition-all appearance-none bg-white shadow-sm hover:shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 pr-10',
            error
              ? 'border-border-error focus:ring-danger focus:border-danger'
              : 'border-border focus:ring-primary focus:border-primary',
            'disabled:bg-bg-tertiary disabled:cursor-not-allowed disabled:text-text-disabled',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value='' disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary'>
          <ChevronDown size={18} />
        </div>
      </div>

      {error && (
        <p className='text-xs text-danger font-medium'>{error}</p>
      )}

      {helperText && !error && (
        <p className='text-xs text-text-secondary'>{helperText}</p>
      )}
    </div>
  )
}
