'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Video, 
  History, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Building2,
  Activity,
  Wrench
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Asset } from '@/lib/types'
import Button from '@/components/ui/Button'
import { useUser } from '@clerk/nextjs'

export default function QRScanPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const assetId = params.assetId as string
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assetsApi.getQRDetails(assetId, 'mobile')
        if (response.success && response.data) {
          setData(response.data)
        } else {
          setError(response.error || 'Failed to load asset data')
        }
      } catch (err) {
        setError('Failed to load asset data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (assetId) {
      fetchData()
    }
  }, [assetId])

  const handleRaiseComplaint = () => {
    router.push(`/complaints/new?assetId=${assetId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'breakdown':
        return 'bg-red-100 text-red-800'
      case 'condemned':
        return 'bg-gray-100 text-gray-800'
      case 'standby':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-bg-secondary flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-text-secondary'>Loading asset information...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className='min-h-screen bg-bg-secondary flex items-center justify-center p-4'>
        <div className='text-center'>
          <AlertCircle size={48} className='text-danger mx-auto mb-4' />
          <p className='text-text-primary font-semibold mb-2'>Asset Not Found</p>
          <p className='text-text-secondary'>{error || 'The asset you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  const asset = data.asset || data
  const status = asset?.status || 'Unknown'

  return (
    <div className='min-h-screen bg-bg-secondary p-4 pb-8'>
      <div className='max-w-2xl mx-auto space-y-4'>
        {/* Asset Header Card */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-text-primary mb-2'>
                {data.title || asset?.name || 'Asset Details'}
              </h1>
              <p className='text-sm text-text-secondary mb-3'>Asset ID: {assetId}</p>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                  {status}
                </span>
                {asset?.criticality && (
                  <span className='px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800'>
                    {asset.criticality} Priority
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Asset Information */}
          {data.sections?.map((section: any, index: number) => (
            <div key={index} className='mt-6'>
              <h2 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
                {section.title === 'Asset Information' && <Building2 size={18} />}
                {section.title === 'Maintenance Status' && <Activity size={18} />}
                {section.title}
              </h2>
              <div className='space-y-3'>
                {section.items?.map((item: any, itemIndex: number) => (
                  <div 
                    key={itemIndex} 
                    className='flex justify-between py-2 border-b border-border last:border-0'
                  >
                    <span className='text-text-secondary flex items-center gap-2'>
                      {item.label === 'Location' && <MapPin size={14} />}
                      {item.label === 'Department' && <Building2 size={14} />}
                      {item.label === 'Next PM' && <Calendar size={14} />}
                      {item.label === 'Next Calibration' && <Clock size={14} />}
                      {item.label}
                    </span>
                    <span className='text-text-primary font-medium text-right max-w-[60%]'>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Recent Complaints */}
          {data.recentComplaints && data.recentComplaints.length > 0 && (
            <div className='mt-6'>
              <h2 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
                <AlertTriangle size={18} className='text-orange-500' />
                Recent Complaints
              </h2>
              <div className='space-y-2'>
                {data.recentComplaints.slice(0, 3).map((complaint: any, index: number) => (
                  <div 
                    key={index} 
                    className='p-3 bg-orange-50 border border-orange-200 rounded-lg'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-text-primary'>{complaint.title}</p>
                        <p className='text-xs text-text-secondary mt-1'>
                          {new Date(complaint.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        complaint.status === 'Resolved' || complaint.status === 'Closed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-lg font-semibold text-text-primary mb-4'>Quick Actions</h2>
          <div className='space-y-3'>
            <Button
              variant='primary'
              className='w-full'
              onClick={handleRaiseComplaint}
              leftIcon={AlertTriangle}
            >
              Raise Complaint
            </Button>
            
            {data.actions?.map((action: any, index: number) => (
              <Button
                key={index}
                variant='outline'
                className='w-full'
                onClick={() => router.push(action.url)}
                leftIcon={
                  action.label.includes('History') ? History :
                  action.label.includes('Details') ? FileText :
                  undefined
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Maintenance Timeline */}
        {data.recentHistory && data.recentHistory.length > 0 && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
              <History size={18} />
              Recent Activity
            </h2>
            <div className='space-y-3'>
              {data.recentHistory.slice(0, 5).map((history: any, index: number) => (
                <div key={index} className='flex items-start gap-3 pb-3 border-b border-border last:border-0'>
                  <div className='mt-1'>
                    {history.eventType === 'Complaint' && <AlertTriangle size={16} className='text-orange-500' />}
                    {history.eventType === 'PM' && <CheckCircle size={16} className='text-green-500' />}
                    {history.eventType === 'Calibration' && <Activity size={16} className='text-blue-500' />}
                    {!['Complaint', 'PM', 'Calibration'].includes(history.eventType) && 
                      <Clock size={16} className='text-gray-500' />}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-text-primary'>{history.eventType}</p>
                    {history.description && (
                      <p className='text-xs text-text-secondary mt-1'>{history.description}</p>
                    )}
                    <p className='text-xs text-text-tertiary mt-1'>
                      {new Date(history.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

