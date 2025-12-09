// PM API functions

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type {
  PreventiveMaintenance,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../types'

export const pmApi = {
  // Get all PMs with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<PreventiveMaintenance>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.department && { department: filters.department }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    })

    return apiGet<PaginatedResponse<PreventiveMaintenance>>(`/pm?${params.toString()}`)
  },

  // Get single PM by ID
  getById: async (id: string): Promise<PreventiveMaintenance> => {
    return apiGet<PreventiveMaintenance>(`/pm/${id}`)
  },

  // Create new PM
  create: async (data: Partial<PreventiveMaintenance>): Promise<ApiResponse<PreventiveMaintenance>> => {
    return apiPost<ApiResponse<PreventiveMaintenance>>('/pm', data)
  },

  // Update PM
  update: async (
    id: string,
    data: Partial<PreventiveMaintenance>
  ): Promise<ApiResponse<PreventiveMaintenance>> => {
    return apiPut<ApiResponse<PreventiveMaintenance>>(`/pm/${id}`, data)
  },

  // Delete PM
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/pm/${id}`)
  },

  // Auto-schedule PMs
  autoSchedule: async (assetIds?: string[]): Promise<ApiResponse<{ count: number }>> => {
    return apiPost<ApiResponse<{ count: number }>>('/pm/schedule', { assetIds })
  },

  // Get PM reminders
  getReminders: async (daysAhead = 7): Promise<ApiResponse<PreventiveMaintenance[]>> => {
    return apiGet<ApiResponse<PreventiveMaintenance[]>>(`/pm/reminders?daysAhead=${daysAhead}`)
  },

  // Update checklist
  updateChecklist: async (
    pmId: string,
    checklist: any[]
  ): Promise<ApiResponse<PreventiveMaintenance>> => {
    return apiPut<ApiResponse<PreventiveMaintenance>>(`/pm/checklist/${pmId}`, { checklist })
  },

  // Generate PM report
  generateReport: async (
    pmId: string,
    format: 'pdf' | 'excel'
  ): Promise<Blob> => {
    const response = await fetch(`/api/pm/reports/${pmId}?format=${format}`)
    if (!response.ok) throw new Error('Report generation failed')
    return response.blob()
  },

  // Request acknowledgement
  requestAcknowledgement: async (
    pmId: string,
    userId: string
  ): Promise<ApiResponse<void>> => {
    return apiPost<ApiResponse<void>>('/pm/acknowledgements', { pmId, userId })
  },

  // Create edit request
  createEditRequest: async (
    entityType: string,
    entityId: string,
    changes: any
  ): Promise<ApiResponse<{ id: string }>> => {
    return apiPost<ApiResponse<{ id: string }>>('/pm/edit-requests', {
      entityType,
      entityId,
      changes,
    })
  },
}

