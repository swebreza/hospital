'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import Card from '@/components/ui/Card'

interface ReportChartsProps {
  reportType: string
  reportData: unknown
}

export default function ReportCharts({ reportType, reportData }: ReportChartsProps) {
  if (!reportData) return null

  // Calibration Compliance Charts
  if (reportType === 'calibration-compliance') {
    const data = reportData as {
      summary: {
        totalCalibrations: number
        expired: number
        overdue: number
        expiringSoon: number
        completed: number
      }
      byDepartment: Array<{
        department: string
        total: number
        expired: number
        overdue: number
        expiringSoon: number
        complianceRate: number
      }>
    }

    const pieData = [
      { name: 'Completed', value: data.summary.completed, color: '#10b981' },
      { name: 'Expired', value: data.summary.expired, color: '#ef4444' },
      { name: 'Overdue', value: data.summary.overdue, color: '#f59e0b' },
      { name: 'Expiring Soon', value: data.summary.expiringSoon, color: '#3b82f6' },
    ].filter((item) => item.value > 0)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="font-bold mb-4">Calibration Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h3 className="font-bold mb-4">Compliance by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="complianceRate" fill="#6366f1" name="Compliance Rate %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    )
  }

  // Asset Insights Charts
  if (reportType === 'asset-insights') {
    const data = reportData as {
      summary: {
        totalAssets: number
        activeAssets: number
        totalValue: number
      }
      byStatus: Array<{
        status: string
        count: number
        percentage: number
      }>
      byDepartment: Array<{
        department: string
        count: number
        totalValue: number
      }>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="font-bold mb-4">Assets by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.byStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {data.byStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h3 className="font-bold mb-4">Assets by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" name="Asset Count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    )
  }

  // Downtime Trends Charts
  if (reportType === 'downtime-trends') {
    const data = reportData as {
      trends: Array<{
        period: string
        downtimeHours: number
        eventCount: number
      }>
      byDepartment: Array<{
        department: string
        downtimeHours: number
        eventCount: number
      }>
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {data.trends.length > 0 && (
          <Card padding="md">
            <h3 className="font-bold mb-4">Downtime Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="downtimeHours"
                  stroke="#ef4444"
                  name="Downtime Hours"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="eventCount"
                  stroke="#3b82f6"
                  name="Event Count"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {data.byDepartment.length > 0 && (
          <Card padding="md">
            <h3 className="font-bold mb-4">Downtime by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="downtimeHours" fill="#ef4444" name="Downtime Hours" radius={[4, 4, 0, 0]} />
                <Bar dataKey="eventCount" fill="#3b82f6" name="Event Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    )
  }

  return null
}

