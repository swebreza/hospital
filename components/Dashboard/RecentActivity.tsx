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
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'bg-danger'
      case 'success':
        return 'bg-success'
      case 'warning':
        return 'bg-warning'
      case 'info':
        return 'bg-info'
      default:
        return 'bg-primary'
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-border h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-text-primary">Recent Activity & Alerts</h3>
        <button className="text-sm text-primary font-medium hover:underline">View All</button>
      </div>
      
      <div className="flex flex-col gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-full ${getTypeColor(activity.type)} text-white opacity-90`}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-text-primary">{activity.title}</h4>
              <p className="text-xs text-text-secondary">{activity.description}</p>
            </div>
            <span className="text-xs text-text-tertiary">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
