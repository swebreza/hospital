"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <Sidebar />
      
      {/* Main Content Area - FULL WIDTH */}
      <div style={{ 
        flex: 1, 
        marginLeft: '260px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        width: 'calc(100vw - 260px)'
      }}>
        <Header />
        
        <main style={{ 
          flex: 1,
          overflow: 'auto',
          padding: '2rem 3rem',
          width: '100%'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', height: '100%' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
