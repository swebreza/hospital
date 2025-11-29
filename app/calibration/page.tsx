"use client";

import React, { useState } from 'react';
import { Calendar, List, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Activity } from 'lucide-react';

// Mock data - replace with API calls
const mockCalibrations = [
  {
    id: 'CAL-001',
    assetId: 'AST-001',
    assetName: 'MRI Scanner',
    calibrationDate: '2024-01-15',
    nextDueDate: '2025-01-15',
    vendor: 'Siemens Service',
    status: 'Completed',
    certificateUrl: '/certificates/cal-001.pdf'
  },
  {
    id: 'CAL-002',
    assetId: 'AST-003',
    assetName: 'Defibrillator',
    calibrationDate: '2024-02-20',
    nextDueDate: '2024-12-20',
    vendor: 'Stryker Service',
    status: 'Active',
    certificateUrl: null
  },
  {
    id: 'CAL-003',
    assetId: 'AST-002',
    assetName: 'Ventilator',
    calibrationDate: '2023-11-10',
    nextDueDate: '2024-11-10',
    vendor: 'Getinge Service',
    status: 'Expiring Soon',
    certificateUrl: '/certificates/cal-003.pdf'
  }
];

export default function CalibrationPage() {
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [calibrations] = useState(mockCalibrations);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Active':
        return 'success';
      case 'Expiring Soon':
        return 'warning';
      case 'Expired':
      case 'Overdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Active':
        return CheckCircle;
      case 'Expiring Soon':
        return AlertCircle;
      case 'Expired':
      case 'Overdue':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const upcomingCalibrations = calibrations.filter(c => {
    const dueDate = new Date(c.nextDueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  });

  const overdueCalibrations = calibrations.filter(c => {
    const dueDate = new Date(c.nextDueDate);
    const today = new Date();
    return dueDate < today && c.status !== 'Completed';
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Calibration Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track and manage equipment calibration schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded transition-colors ${
                view === 'list'
                  ? 'bg-white shadow-sm text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded transition-colors ${
                view === 'calendar'
                  ? 'bg-white shadow-sm text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Calendar size={18} />
            </button>
          </div>
          <Button variant="primary" leftIcon={Plus}>
            Schedule Calibration
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(overdueCalibrations.length > 0 || upcomingCalibrations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueCalibrations.length > 0 && (
            <Card padding="md" className="border-[var(--danger-light)] bg-[var(--danger-lighter)]">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-[var(--danger)]" />
                <div>
                  <p className="font-semibold text-[var(--danger)]">
                    {overdueCalibrations.length} Overdue Calibration{overdueCalibrations.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Requires immediate attention
                  </p>
                </div>
              </div>
            </Card>
          )}
          {upcomingCalibrations.length > 0 && (
            <Card padding="md" className="border-[var(--warning-light)] bg-[var(--warning-lighter)]">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-[var(--warning)]" />
                <div>
                  <p className="font-semibold text-[var(--warning)]">
                    {upcomingCalibrations.length} Upcoming Calibration{upcomingCalibrations.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Due within 30 days
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Content */}
      {view === 'list' ? (
        <Card padding="none">
          {calibrations.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No calibrations found"
              description="Schedule your first calibration to get started"
              actionLabel="Schedule Calibration"
              onAction={() => {}}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Asset
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Last Calibration
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Next Due
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Vendor
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Status
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {calibrations.map((cal) => {
                    const StatusIcon = getStatusIcon(cal.status);
                    return (
                      <tr
                        key={cal.id}
                        className="hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{cal.assetName}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{cal.assetId}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[var(--text-secondary)]">
                          {new Date(cal.calibrationDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {new Date(cal.nextDueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {Math.ceil(
                                (new Date(cal.nextDueDate).getTime() - new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              days
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[var(--text-secondary)]">
                          {cal.vendor}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={getStatusVariant(cal.status) as any}
                            icon={StatusIcon}
                          >
                            {cal.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {cal.certificateUrl && (
                              <button className="text-sm text-[var(--primary)] hover:underline">
                                View Certificate
                              </button>
                            )}
                            <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card padding="lg">
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">Calendar view coming soon</p>
          </div>
        </Card>
      )}
    </div>
  );
}

