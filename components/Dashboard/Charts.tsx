"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const assetStatusData = [
  { name: 'Active', value: 210, color: '#10b981' },
  { name: 'Maintenance', value: 25, color: '#f59e0b' },
  { name: 'Breakdown', value: 10, color: '#ef4444' },
];

const maintenanceData = [
  { month: 'Jul', pm: 45, cm: 12 },
  { month: 'Aug', pm: 52, cm: 18 },
  { month: 'Sep', pm: 48, cm: 15 },
  { month: 'Oct', pm: 61, cm: 10 },
  { month: 'Nov', pm: 55, cm: 14 },
  { month: 'Dec', pm: 58, cm: 9 },
];

export default function Charts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Asset Status Distribution */}
      <div className="card">
        <h3 className="font-bold mb-4">Asset Status Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={assetStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {assetStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          {assetStatusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-secondary">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Trends */}
      <div className="card">
        <h3 className="font-bold mb-4">Maintenance Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={maintenanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="pm" fill="#0ea5e9" name="Preventive" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cm" fill="#f59e0b" name="Corrective" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
