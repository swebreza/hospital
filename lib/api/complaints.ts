// Complaints API functions

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type { ApiResponse, PaginatedResponse, Complaint, ComplaintPriority, ComplaintStatus } from '../types'

export interface ComplaintFilters {
  status?: string
  priority?: string
  assetId?: string
  reportedBy?: string
  assignedTo?: string
  page?: number
  limit?: number
}

export const complaintsApi = {
  // Get all complaints with pagination and filters
  getAll: async (
    filters?: ComplaintFilters
  ): Promise<PaginatedResponse<Complaint>> => {
    const paramsObj: Record<string, string> = {}
    
    if (filters?.page) paramsObj.page = filters.page.toString()
    if (filters?.limit) paramsObj.limit = filters.limit.toString()
    if (filters?.status) paramsObj.status = filters.status
    if (filters?.priority) paramsObj.priority = filters.priority
    if (filters?.assetId) paramsObj.assetId = filters.assetId
    if (filters?.reportedBy) paramsObj.reportedBy = filters.reportedBy
    if (filters?.assignedTo) paramsObj.assignedTo = filters.assignedTo

    const params = new URLSearchParams(paramsObj)
    const response = await apiGet<PaginatedResponse<Complaint>>(`/complaints?${params.toString()}`)
    return response
  },

  // Get single complaint by ID
  getById: async (id: string): Promise<Complaint> => {
    return apiGet<Complaint>(`/complaints/${id}`)
  },

  // Create new complaint
  create: async (data: {
    assetId: string
    title: string
    description: string
    priority: ComplaintPriority
    reportedBy: string
    assignedTo?: string
  }): Promise<ApiResponse<Complaint>> => {
    const response = await apiPost<ApiResponse<Complaint>>('/complaints', data)
    return response
  },

  // Update complaint
  update: async (
    id: string,
    data: {
      status?: ComplaintStatus | string
      assignedTo?: string
      rootCause?: string
      resolution?: string
      downtimeMinutes?: number
    }
  ): Promise<ApiResponse<Complaint>> => {
    return apiPut<ApiResponse<Complaint>>(`/complaints/${id}`, data)
  },

  // Delete complaint
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/complaints/${id}`)
  },

  // Confirm resolution
  confirmResolution: async (
    id: string,
    confirmed: boolean,
    feedback?: string
  ): Promise<ApiResponse<Complaint>> => {
    return apiPost<ApiResponse<Complaint>>(`/complaints/${id}/confirm-resolution`, {
      confirmed,
      feedback,
    })
  },
}
