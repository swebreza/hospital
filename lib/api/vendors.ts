// Vendor API functions

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type {
  Vendor,
  ApiResponse,
  PaginatedResponse,
  Contract,
} from '../types'

export const vendorsApi = {
  // Get all vendors with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: {
      search?: string
      status?: string
      minRating?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<PaginatedResponse<Vendor>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.minRating && { minRating: filters.minRating.toString() }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
    })

    return apiGet<PaginatedResponse<Vendor>>(`/vendors?${params.toString()}`)
  },

  // Get single vendor by ID
  getById: async (id: string): Promise<ApiResponse<Vendor & {
    activeContractsCount?: number
    totalContracts?: number
    expiredContractsCount?: number
    totalContractValue?: number
    contracts?: Contract[]
  }>> => {
    return apiGet<ApiResponse<Vendor & {
      activeContractsCount?: number
      totalContracts?: number
      expiredContractsCount?: number
      totalContractValue?: number
      contracts?: Contract[]
    }>>(`/vendors/${id}`)
  },

  // Create new vendor
  create: async (data: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    return apiPost<ApiResponse<Vendor>>('/vendors', data)
  },

  // Update vendor
  update: async (
    id: string,
    data: Partial<Vendor>
  ): Promise<ApiResponse<Vendor>> => {
    return apiPut<ApiResponse<Vendor>>(`/vendors/${id}`, data)
  },

  // Delete vendor
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/vendors/${id}`)
  },

  // Get vendor contracts
  getContracts: async (
    id: string,
    filters?: {
      status?: string
      type?: string
    }
  ): Promise<ApiResponse<Contract[]>> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)

    return apiGet<ApiResponse<Contract[]>>(
      `/vendors/${id}/contracts?${params.toString()}`
    )
  },

  // Get vendor performance metrics
  getPerformance: async (id: string): Promise<ApiResponse<{
    rating: number
    performanceScore: number
    totalContracts: number
    activeContracts: number
    expiredContracts: number
    totalContractValue: number
    expiringSoon: number
    expired: number
    averageContractValue: number
    contractRenewalRate: string
  }>> => {
    return apiGet<ApiResponse<{
      rating: number
      performanceScore: number
      totalContracts: number
      activeContracts: number
      expiredContracts: number
      totalContractValue: number
      expiringSoon: number
      expired: number
      averageContractValue: number
      contractRenewalRate: string
    }>>(`/vendors/${id}/performance`)
  },
}

