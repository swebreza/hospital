// Asset Maintenance Dashboard

'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Calendar, Wrench, AlertCircle, CheckCircle } from 'lucide-react'
import type { PreventiveMaintenance, Calibration, Complaint } from '@/lib/types'

export default function AssetMaintenancePage() {
  const params = useParams()
  const assetId = params.id as string
  const [loading, setLoading] = useState(true)
  const [pms, setPMs] = useState<PreventiveMaintenance[]>([])
  const [calibrations, setCalibrations] = useState<Calibration[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])

  useEffect(() => {
    fetchMaintenanceData()
  }, [assetId])

  const fetchMaintenanceData = async () => {
    try {
      // Fetch PMs, calibrations, and complaints for this asset
      const [pmRes, calRes, compRes] = await Promise.all([
        fetch(`/api/pm?assetId=${assetId}`),
        fetch(`/api/calibrations?assetId=${assetId}`),
        fetch(`/api/complaints?assetId=${assetId}`),
      ])

      if (pmRes.ok) {
        const pmData = await pmRes.json()
        setPMs(pmData.data || [])
      }

      if (calRes.ok) {
        const calData = await calRes.json()
        setCalibrations(calData.data || [])
      }

      if (compRes.ok) {
        const compData = await compRes.json()
        setComplaints(compData.data || [])
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Maintenance Dashboard</h1>
        <p className="text-text-secondary">Asset ID: {assetId}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <Wrench size={24} className="text-primary" />
            <div>
              <p className="text-sm text-text-secondary">Preventive Maintenance</p>
              <p className="text-2xl font-bold">{pms.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-primary" />
            <div>
              <p className="text-sm text-text-secondary">Calibrations</p>
              <p className="text-2xl font-bold">{calibrations.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-primary" />
            <div>
              <p className="text-sm text-text-secondary">Complaints</p>
              <p className="text-2xl font-bold">{complaints.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* PM List */}
      <Card padding="md">
        <h2 className="text-lg font-bold mb-4">Preventive Maintenance</h2>
        {pms.length === 0 ? (
          <p className="text-text-secondary">No PM records found</p>
        ) : (
          <div className="space-y-2">
            {pms.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{new Date(pm.scheduledDate).toLocaleDateString()}</p>
                  <p className="text-sm text-text-secondary">Status: {pm.status}</p>
                </div>
                <Badge variant={pm.status === 'Completed' ? 'success' : 'default'}>
                  {pm.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Calibrations List */}
      <Card padding="md">
        <h2 className="text-lg font-bold mb-4">Calibrations</h2>
        {calibrations.length === 0 ? (
          <p className="text-text-secondary">No calibration records found</p>
        ) : (
          <div className="space-y-2">
            {calibrations.map((cal) => (
              <div key={cal.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Next Due: {new Date(cal.nextDueDate).toLocaleDateString()}</p>
                  <p className="text-sm text-text-secondary">Status: {cal.status}</p>
                </div>
                <Badge variant={cal.status === 'Completed' ? 'success' : 'default'}>
                  {cal.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Complaints List */}
      <Card padding="md">
        <h2 className="text-lg font-bold mb-4">Complaints</h2>
        {complaints.length === 0 ? (
          <p className="text-text-secondary">No complaint records found</p>
        ) : (
          <div className="space-y-2">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{complaint.title}</p>
                  <p className="text-sm text-text-secondary">
                    Priority: {complaint.priority} | Status: {complaint.status}
                  </p>
                </div>
                <Badge variant={complaint.status === 'Closed' ? 'success' : 'default'}>
                  {complaint.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

