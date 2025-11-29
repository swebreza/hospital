"use client";

import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const activities = [
  {
    id: 1,
    title: 'MRI Scanner Breakdown',
    description: 'Reported by Radiology Dept.',
    time: '10 mins ago',
    type: 'danger',
    icon: AlertCircle
  },
  {
    id: 2,
    title: 'Ventilator PM Completed',
    description: 'Asset ID: V-1023',
    time: '1 hour ago',
    type: 'success',
    icon: CheckCircle
  },
  {
    id: 3,
    title: 'Calibration Due: Defibrillator',
    description: 'Expires in 3 days',
    time: '2 hours ago',
    type: 'warning',
    icon: Clock
  },
  {
    id: 4,
    title: 'New Asset Registered',
    description: 'Infusion Pump (B.Braun)',
    time: '4 hours ago',
    type: 'info',
    icon: CheckCircle
  }
];

export default function RecentActivity() {
  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Recent Activity & Alerts</h3>
        <button className="text-sm text-primary font-medium hover:underline">View All</button>
      </div>
      
      <div className="flex flex-col gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
            <div style={{
              padding: '0.5rem',
              borderRadius: '50%',
              backgroundColor: `var(--${activity.type})`,
              color: 'white',
              opacity: 0.9
            }}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">{activity.title}</h4>
              <p className="text-xs text-secondary">{activity.description}</p>
            </div>
            <span className="text-xs text-light">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
