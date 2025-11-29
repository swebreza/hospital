"use client";

import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

export default function Header() {
  return (
    <header 
      className="glass-panel"
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)'
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search assets, PMs, or tickets..." 
          style={{
            width: '100%',
            padding: '0.625rem 1rem 0.625rem 2.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'white',
            outline: 'none',
            fontSize: '0.875rem',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button 
          className="btn-outline"
          style={{ border: 'none', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
        >
          <HelpCircle size={20} />
        </button>
        <button 
          className="btn-outline"
          style={{ border: 'none', padding: '0.5rem', borderRadius: 'var(--radius-md)', position: 'relative' }}
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger)'
          }} />
        </button>
      </div>
    </header>
  );
}
