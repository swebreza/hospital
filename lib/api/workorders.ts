// Work Order API functions

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../types'

export interface WorkOrder {
  id: string
  complaintId?: string
  assetId: string
  assignedTo?: string
  assignedVendorId?: string
  status: string
  laborHours?: number
  totalCost?: number
  activities?: WorkOrderActivity[]
  spareParts?: WorkOrderSparePart[]
  createdAt: string
  updatedAt: string
}

export interface WorkOrderActivity {
  id: string
  workOrderId: string
  activity: string
  performedBy?: string
  createdAt: string
}

export interface WorkOrderSparePart {
  id: string
  workOrderId: string
  partId: string
  quantity: number
  unitCost: number
  totalCost: number
}

export const workOrdersApi = {
  // Get all work orders with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<WorkOrder>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.assetId && { assetId: filters.assetId }),
    })

    return apiGet<PaginatedResponse<WorkOrder>>(`/workorders?${params.toString()}`)
  },

  // Get single work order by ID
  getById: async (id: string): Promise<WorkOrder> => {
    return apiGet<WorkOrder>(`/workorders/${id}`)
  },

  // Create new work order
  create: async (data: Partial<WorkOrder>): Promise<ApiResponse<WorkOrder>> => {
    return apiPost<ApiResponse<WorkOrder>>('/workorders', data)
  },

  // Update work order
  update: async (
    id: string,
    data: Partial<WorkOrder>
  ): Promise<ApiResponse<WorkOrder>> => {
    return apiPut<ApiResponse<WorkOrder>>(`/workorders/${id}`, data)
  },

  // Delete work order
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/workorders/${id}`)
  },

  // Add activity to work order
  addActivity: async (
    workOrderId: string,
    activity: string
  ): Promise<ApiResponse<WorkOrderActivity>> => {
    return apiPost<ApiResponse<WorkOrderActivity>>(
      `/workorders/${workOrderId}/activities`,
      { activity }
    )
  },

  // Add spare part to work order
  addSparePart: async (
    workOrderId: string,
    data: {
      partId: string
      quantity: number
      unitCost: number
    }
  ): Promise<ApiResponse<WorkOrderSparePart>> => {
    return apiPost<ApiResponse<WorkOrderSparePart>>(
      `/workorders/${workOrderId}/spare-parts`,
      data
    )
  },
}

