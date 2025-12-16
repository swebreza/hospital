// Contract API functions

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type {
  Contract,
  ApiResponse,
  PaginatedResponse,
} from '../types'

export const contractsApi = {
  // Get all contracts with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: {
      vendorId?: string
      type?: string
      status?: string
      expiringDays?: number
    }
  ): Promise<PaginatedResponse<Contract>> => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    }
    
    if (filters?.vendorId) paramsObj.vendorId = filters.vendorId
    if (filters?.type) paramsObj.type = filters.type
    if (filters?.status) paramsObj.status = filters.status
    if (filters?.expiringDays !== undefined) paramsObj.expiringDays = filters.expiringDays.toString()
    
    const params = new URLSearchParams(paramsObj)

    return apiGet<PaginatedResponse<Contract>>(`/contracts?${params.toString()}`)
  },

  // Get single contract by ID
  getById: async (id: string): Promise<ApiResponse<Contract>> => {
    return apiGet<ApiResponse<Contract>>(`/contracts/${id}`)
  },

  // Create new contract
  create: async (data: Partial<Contract>): Promise<ApiResponse<Contract>> => {
    return apiPost<ApiResponse<Contract>>('/contracts', data)
  },

  // Update contract
  update: async (
    id: string,
    data: Partial<Contract>
  ): Promise<ApiResponse<Contract>> => {
    return apiPut<ApiResponse<Contract>>(`/contracts/${id}`, data)
  },

  // Cancel contract
  cancel: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/contracts/${id}`)
  },

  // Get expiring contracts
  getExpiring: async (
    days = 30,
    vendorId?: string
  ): Promise<ApiResponse<Array<Contract & {
    daysUntilExpiry: number
    expiryLevel: 'critical' | 'warning' | 'info'
  }> & {
    summary?: {
      total: number
      critical: number
      warning: number
      info: number
    }
  }>> => {
    const paramsObj: Record<string, string> = {
      days: days.toString(),
    }
    
    if (vendorId) paramsObj.vendorId = vendorId
    
    const params = new URLSearchParams(paramsObj)

    return apiGet<ApiResponse<Array<Contract & {
      daysUntilExpiry: number
      expiryLevel: 'critical' | 'warning' | 'info'
    }> & {
      summary?: {
        total: number
        critical: number
        warning: number
        info: number
      }
    }>>(`/contracts/expiring?${params.toString()}`)
  },

  // Generate renewal reminders
  generateRenewalReminders: async (
    days = 30,
    vendorIds?: string[]
  ): Promise<ApiResponse<Array<{
    contractId: string
    vendorId: string
    vendorName: string
    vendorEmail?: string
    contractType: string
    endDate: string
    daysUntilExpiry: number
    renewalDate?: string
    message: string
  }> & {
    count: number
  }>> => {
    return apiPost<ApiResponse<Array<{
      contractId: string
      vendorId: string
      vendorName: string
      vendorEmail?: string
      contractType: string
      endDate: string
      daysUntilExpiry: number
      renewalDate?: string
      message: string
    }> & {
      count: number
    }>>('/contracts/expiring', { days, vendorIds })
  },
}

