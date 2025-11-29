'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { clsx } from 'clsx'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/assets': 'Assets',
  '/pm': 'Preventive Maintenance',
  '/calibration': 'Calibration',
  '/complaints': 'Complaints',
  '/inventory': 'Inventory',
  '/vendors': 'Vendors',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/capex': 'CAPEX Management',
  '/corrective-maintenance': 'Corrective Maintenance',
  '/demo': 'Demo Equipment',
  '/condemnation': 'Condemnation',
  '/recall': 'Recall Management',
  '/training': 'Training',
  '/utilization': 'Utilization Tracking',
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items

    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/' }]

    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const label =
        routeLabels[currentPath] || path.charAt(0).toUpperCase() + path.slice(1)
      breadcrumbs.push({
        label,
        href: index === paths.length - 1 ? undefined : currentPath,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav
      className={clsx('flex items-center gap-2 text-sm', className)}
      aria-label='Breadcrumb'
    >
      <ol className='flex items-center gap-2'>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li
              key={item.href || item.label}
              className='flex items-center gap-2'
            >
              {index === 0 ? (
                <Link
                  href={item.href || '/'}
                  className='flex items-center gap-1 text-text-secondary hover:text-primary transition-colors'
                >
                  <Home size={16} />
                </Link>
              ) : (
                <>
                  <ChevronRight
                    size={16}
                    className='text-text-tertiary'
                  />
                  {isLast ? (
                    <span className='text-text-primary font-medium'>
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className='text-text-secondary hover:text-primary transition-colors'
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
