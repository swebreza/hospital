"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardMetrics {
  pmCompliance: {
    rate: number
    totalPMs: number
    completedPMs: number
    overduePMs: number
  }
  calibrationStatus: {
    total: number
    expired: number
    expiringSoon: number
    compliant: number
  }
  complaintTrends: {
    open: number
    inProgress: number
    resolved: number
    byPriority: {
      low: number
      medium: number
      high: number
      critical: number
    }
  }
  downtimeStats: {
    totalHours: number
    totalEvents: number
    averageHours: number
    criticalAssetsAffected: number
  }
  inventoryAlerts: {
    lowStock: number
    outOfStock: number
    criticalItems: number
  }
  amcCmcUpdates: {
    expiringSoon: number
    expired: number
    renewalsNeeded: number
  }
}

export default function Charts() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        const result = await response.json()
        if (result.success) {
          setMetrics(result.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    // Refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="card">
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const calibrationData = [
    { name: 'Compliant', value: metrics.calibrationStatus.compliant, color: '#10b981' },
    { name: 'Expired', value: metrics.calibrationStatus.expired, color: '#ef4444' },
    { name: 'Expiring Soon', value: metrics.calibrationStatus.expiringSoon, color: '#f59e0b' },
  ].filter((item) => item.value > 0)

  const complaintData = [
    { name: 'Open', value: metrics.complaintTrends.open, color: '#ef4444' },
    { name: 'In Progress', value: metrics.complaintTrends.inProgress, color: '#f59e0b' },
    { name: 'Resolved', value: metrics.complaintTrends.resolved, color: '#10b981' },
  ].filter((item) => item.value > 0)

  const priorityData = [
    { priority: 'Low', count: metrics.complaintTrends.byPriority.low },
    { priority: 'Medium', count: metrics.complaintTrends.byPriority.medium },
    { priority: 'High', count: metrics.complaintTrends.byPriority.high },
    { priority: 'Critical', count: metrics.complaintTrends.byPriority.critical },
  ].filter((item) => item.count > 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Calibration Status */}
      <div className="card">
        <h3 className="font-bold mb-4">Calibration Status</h3>
        {calibrationData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={calibrationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {calibrationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {calibrationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-text-secondary">{item.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-text-secondary">
            No calibration data available
          </div>
        )}
      </div>

      {/* Complaint Trends */}
      <div className="card">
        <h3 className="font-bold mb-4">Complaint Trends</h3>
        {priorityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" name="Complaints" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-text-secondary">
            No complaint data available
          </div>
        )}
      </div>
    </div>
  );
}
