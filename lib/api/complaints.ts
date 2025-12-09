// Complaints API functions

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type {
  Complaint,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../types'

export const complaintsApi = {
  // Get all complaints with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<Complaint>> => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    }
    
    if (filters?.search) paramsObj.search = filters.search
    if (filters?.status) paramsObj.status = filters.status
    if (filters?.priority && typeof filters.priority === 'string') paramsObj.priority = filters.priority
    if (filters?.department) paramsObj.department = filters.department
    
    const params = new URLSearchParams(paramsObj)

    return apiGet<PaginatedResponse<Complaint>>(`/complaints?${params.toString()}`)
  },

  // Get single complaint by ID
  getById: async (id: string): Promise<Complaint> => {
    return apiGet<Complaint>(`/complaints/${id}`)
  },

  // Create new complaint
  create: async (data: Partial<Complaint>): Promise<ApiResponse<Complaint>> => {
    return apiPost<ApiResponse<Complaint>>('/complaints', data)
  },

  // Update complaint
  update: async (
    id: string,
    data: Partial<Complaint>
  ): Promise<ApiResponse<Complaint>> => {
    return apiPut<ApiResponse<Complaint>>(`/complaints/${id}`, data)
  },

  // Delete complaint
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/complaints/${id}`)
  },

  // Create work order from complaint
  createWorkOrder: async (
    complaintId: string,
    data: any
  ): Promise<ApiResponse<{ id: string }>> => {
    return apiPost<ApiResponse<{ id: string }>>('/complaints/workorders', {
      complaintId,
      ...data,
    })
  },

  // Request acknowledgement for complaint closure
  requestAcknowledgement: async (
    complaintId: string,
    userId: string
  ): Promise<ApiResponse<void>> => {
    return apiPost<ApiResponse<void>>('/complaints/acknowledgements', {
      complaintId,
      userId,
    })
  },
}

