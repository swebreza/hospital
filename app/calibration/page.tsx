"use client";

import React, { useState } from 'react';
import { Calendar, List, Plus, AlertCircle, CheckCircle, Clock, FileText, Edit } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_DATE } from '@/lib/demoContext';

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
  const [calibrations, setCalibrations] = useState(mockCalibrations);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCalibration, setSelectedCalibration] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    assetId: '',
    vendor: '',
    scheduledDate: '',
    notes: '',
  });

  const handleScheduleCalibration = () => {
    if (!scheduleForm.assetId || !scheduleForm.vendor || !scheduleForm.scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Calibration scheduled successfully!', {
      description: `Calibration scheduled for ${scheduleForm.scheduledDate}`,
    });
    setIsScheduleModalOpen(false);
    setScheduleForm({ assetId: '', vendor: '', scheduledDate: '', notes: '' });
  };

  const handleViewCertificate = (certUrl: string | null) => {
    if (!certUrl) {
      toast.info('Certificate not available yet');
      return;
    }
    toast.success('Opening certificate...', {
      description: 'Certificate will open in a new tab',
    });
    // In real app, would open PDF
    window.open(certUrl, '_blank');
  };

  const handleEdit = (calId: string) => {
    setSelectedCalibration(calId);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    toast.success('Calibration updated successfully!');
    setIsEditModalOpen(false);
    setSelectedCalibration(null);
  };

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
    const daysUntilDue = Math.ceil((dueDate.getTime() - DEMO_DATE.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  });

  const overdueCalibrations = calibrations.filter(c => {
    const dueDate = new Date(c.nextDueDate);
    return dueDate < DEMO_DATE && c.status !== 'Completed';
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Calibration Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and manage equipment calibration schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-tertiary p-1 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded transition-colors ${
                view === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded transition-colors ${
                view === 'calendar'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Calendar size={18} />
            </button>
          </div>
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsScheduleModalOpen(true)}>
            Schedule Calibration
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(overdueCalibrations.length > 0 || upcomingCalibrations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueCalibrations.length > 0 && (
            <Card padding="md" className="border-danger-light bg-danger-lighter">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-danger" />
                <div>
                  <p className="font-semibold text-danger">
                    {overdueCalibrations.length} Overdue Calibration{overdueCalibrations.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Requires immediate attention
                  </p>
                </div>
              </div>
            </Card>
          )}
          {upcomingCalibrations.length > 0 && (
            <Card padding="md" className="border-warning-light bg-warning-lighter">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-warning" />
                <div>
                  <p className="font-semibold text-warning">
                    {upcomingCalibrations.length} Upcoming Calibration{upcomingCalibrations.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-text-secondary">
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
              onAction={() => setIsScheduleModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-text-primary">
                      Asset
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-text-primary">
                      Last Calibration
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-text-primary">
                      Next Due
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-text-primary">
                      Vendor
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-text-primary">
                      Status
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-text-primary">
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
                        className="hover:bg-bg-hover transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text-primary">{cal.assetName}</p>
                            <p className="text-xs text-text-secondary">{cal.assetId}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {new Date(cal.calibrationDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {new Date(cal.nextDueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {Math.ceil(
                                (new Date(cal.nextDueDate).getTime() - DEMO_DATE.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              days
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
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
                              <button 
                                onClick={() => handleViewCertificate(cal.certificateUrl)}
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <FileText size={14} />
                                View Certificate
                              </button>
                            )}
                            <button 
                              onClick={() => handleEdit(cal.id)}
                              className="text-sm text-text-secondary hover:text-primary flex items-center gap-1"
                            >
                              <Edit size={14} />
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
            <Calendar size={48} className="mx-auto text-text-tertiary mb-4" />
            <p className="text-text-secondary">Calendar view coming soon</p>
          </div>
        </Card>
      )}

      {/* Schedule Calibration Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Calibration"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleScheduleCalibration}>
              Schedule
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Asset"
            options={[
              { value: '', label: 'Select Asset' },
              { value: 'AST-001', label: 'AST-001 - MRI Scanner' },
              { value: 'AST-002', label: 'AST-002 - Ventilator' },
              { value: 'AST-003', label: 'AST-003 - Defibrillator' },
            ]}
            value={scheduleForm.assetId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, assetId: e.target.value })}
            required
          />
          <Select
            label="Vendor"
            options={[
              { value: '', label: 'Select Vendor' },
              { value: 'siemens', label: 'Siemens Service' },
              { value: 'stryker', label: 'Stryker Service' },
              { value: 'getinge', label: 'Getinge Service' },
            ]}
            value={scheduleForm.vendor}
            onChange={(e) => setScheduleForm({ ...scheduleForm, vendor: e.target.value })}
            required
          />
          <Input
            label="Scheduled Date"
            type="date"
            value={scheduleForm.scheduledDate}
            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
            required
          />
          <Input
            label="Notes (Optional)"
            placeholder="Additional notes or requirements"
            value={scheduleForm.notes}
            onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
          />
        </div>
      </Modal>

      {/* Edit Calibration Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCalibration(null);
        }}
        title="Edit Calibration"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setSelectedCalibration(null);
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Edit calibration details for {selectedCalibration}
          </p>
          <Input label="Calibration Date" type="date" defaultValue="2024-01-15" />
          <Input label="Next Due Date" type="date" defaultValue="2025-01-15" />
          <Select
            label="Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Expiring Soon', label: 'Expiring Soon' },
            ]}
            defaultValue="Active"
          />
        </div>
      </Modal>
    </div>
  );
}

