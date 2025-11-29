"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Stethoscope, 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Activity
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Assets', icon: Stethoscope, href: '/assets' },
  { name: 'Preventive Maint.', icon: ClipboardCheck, href: '/pm' },
  { name: 'Calibration', icon: Activity, href: '/calibration' },
  { name: 'Breakdowns', icon: AlertTriangle, href: '/complaints' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Vendors', icon: Users, href: '/vendors' },
  { name: 'Reports', icon: FileText, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside 
      className="glass-panel" 
      style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)'
      }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          backgroundColor: 'var(--primary)', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Activity size={24} />
        </div>
        <div>
          <div className="font-bold" style={{ fontSize: '1.125rem', color: 'var(--primary)' }}>BME-AMS</div>
          <div className="text-xs text-secondary">Cybrox Solutions</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem'
                  }}
                  className={isActive ? '' : 'hover-nav-item'}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          }}>
            JD
          </div>
          <div>
            <div className="text-sm font-bold">John Doe</div>
            <div className="text-xs text-secondary">Biomedical Eng.</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-nav-item:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
      `}</style>
    </aside>
  );
}
