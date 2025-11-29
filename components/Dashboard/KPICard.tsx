"use client";

import React from 'react';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function KPICard({ title, value, icon: Icon, trend, color = 'var(--primary)' }: KPICardProps) {
  return (
    <motion.div 
      className="card"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-secondary mb-2">{title}</p>
          <h3 className="text-2xl font-bold mb-2">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-sm font-medium" style={{ 
              color: trend.isPositive ? 'var(--success)' : 'var(--danger)' 
            }}>
              {trend.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span>{trend.value}%</span>
              <span className="text-xs text-secondary ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: `${color}20`,
          color: color
        }}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
