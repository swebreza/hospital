// Asset API functions

import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './client'
import type {
  Asset,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../types'

export const assetsApi = {
  // Get all assets with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<Asset>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.department && { department: filters.department }),
    })

    return apiGet<PaginatedResponse<Asset>>(`/assets?${params.toString()}`)
  },

  // Get single asset by ID
  getById: async (id: string): Promise<Asset> => {
    return apiGet<Asset>(`/assets/${id}`)
  },

  // Create new asset
  create: async (data: Partial<Asset>): Promise<ApiResponse<Asset>> => {
    return apiPost<ApiResponse<Asset>>('/assets', data)
  },

  // Update asset
  update: async (
    id: string,
    data: Partial<Asset>
  ): Promise<ApiResponse<Asset>> => {
    return apiPut<ApiResponse<Asset>>(`/assets/${id}`, data)
  },

  // Delete asset
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/assets/${id}`)
  },

  // Generate QR code for asset
  generateQR: async (id: string): Promise<ApiResponse<{ qrCode: string }>> => {
    return apiPost<ApiResponse<{ qrCode: string }>>(`/assets/${id}/qr-code`)
  },

  // Upload asset document
  uploadDocument: async (
    id: string,
    file: File,
    type: string
  ): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return apiUpload<ApiResponse<{ url: string }>>(
      `/assets/${id}/documents`,
      formData
    )
  },

  // Get asset documents
  getDocuments: async (
    id: string
  ): Promise<
    ApiResponse<Array<{ url: string; type: string; name: string }>>
  > => {
    return apiGet<
      ApiResponse<Array<{ url: string; type: string; name: string }>>
    >(`/assets/${id}/documents`)
  },

  // Export assets to Excel/PDF
  export: async (
    format: 'excel' | 'pdf',
    filters?: FilterOptions
  ): Promise<Blob> => {
    const params = new URLSearchParams({
      format,
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.department && { department: filters.department }),
    })

    const response = await fetch(`/api/assets/export?${params.toString()}`)
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  },
}
