'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  showCloseButton?: boolean
  footer?: React.ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  showCloseButton = true,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040]'
          />

          {/* Modal */}
          <div className='fixed inset-0 z-[1050] flex items-center justify-center p-4 pointer-events-none'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={clsx(
                'bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] pointer-events-auto',
                sizes[size]
              )}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className='flex items-start justify-between p-6 border-b border-border'>
                  <div className='flex-1'>
                    {title && (
                      <h2 className='text-xl font-bold text-text-primary'>
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className='text-sm text-text-secondary mt-1'>
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className='ml-4 p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-secondary hover:text-text-primary'
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className='flex-1 overflow-y-auto p-6 scrollbar-thin'>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className='p-6 border-t border-border bg-bg-secondary'>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
