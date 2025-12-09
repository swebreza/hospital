// Asset API functions

import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './client'
import type {
  Asset,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
  AssetHistory,
  MEAChecklist,
  AssetMove,
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
      ...(filters?.assetType && { assetType: filters.assetType }),
      ...(filters?.modality && { modality: filters.modality }),
      ...(filters?.criticality && { criticality: filters.criticality }),
      ...(filters?.oem && { oem: filters.oem }),
      ...(filters?.lifecycleState && { lifecycleState: filters.lifecycleState }),
      ...(filters?.isMinorAsset !== undefined && { isMinorAsset: String(filters.isMinorAsset) }),
      ...(filters?.farNumber && { farNumber: filters.farNumber }),
      ...(filters?.replacementRecommended !== undefined && {
        replacementRecommended: String(filters.replacementRecommended),
      }),
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

  // Bulk upload assets
  bulkUpload: async (
    file: File,
    options?: { skipDuplicates?: boolean; validateOnly?: boolean }
  ): Promise<ApiResponse<{
    total: number
    successful: number
    failed: number
    errors: Array<{ row: number; data: Record<string, unknown>; errors: string[] }>
    duplicates: number
  }>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.skipDuplicates) formData.append('skipDuplicates', 'true')
    if (options?.validateOnly) formData.append('validateOnly', 'true')

    return apiUpload<ApiResponse<{
      total: number
      successful: number
      failed: number
      errors: Array<{ row: number; data: Record<string, unknown>; errors: string[] }>
      duplicates: number
    }>>('/assets/bulk-upload', formData)
  },

  // Get asset history
  getHistory: async (
    id: string,
    options?: {
      eventType?: AssetHistory['eventType']
      groupBy?: 'type' | 'timeline' | 'stats'
      limit?: number
      skip?: number
    }
  ): Promise<ApiResponse<AssetHistory[] | Record<string, AssetHistory[]>>> => {
    const params = new URLSearchParams()
    if (options?.eventType) params.append('eventType', options.eventType)
    if (options?.groupBy) params.append('groupBy', options.groupBy)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.skip) params.append('skip', options.skip.toString())

    return apiGet<ApiResponse<AssetHistory[] | Record<string, AssetHistory[]>>>(
      `/assets/${id}/history?${params.toString()}`
    )
  },

  // Create asset move
  createMove: async (
    id: string,
    data: {
      toLocation?: string
      toDepartment?: string
      reason?: string
      movedBy?: string
    }
  ): Promise<ApiResponse<AssetMove>> => {
    return apiPost<ApiResponse<AssetMove>>(`/assets/${id}/moves`, data)
  },

  // Get asset moves
  getMoves: async (id: string): Promise<ApiResponse<AssetMove[]>> => {
    return apiGet<ApiResponse<AssetMove[]>>(`/assets/${id}/moves`)
  },

  // Get MEA checklists
  getMEAChecklists: async (id: string): Promise<ApiResponse<MEAChecklist[]>> => {
    return apiGet<ApiResponse<MEAChecklist[]>>(`/assets/${id}/mea-checklists`)
  },

  // Create MEA checklist
  createMEAChecklist: async (
    id: string,
    data: Partial<MEAChecklist>
  ): Promise<ApiResponse<MEAChecklist>> => {
    return apiPost<ApiResponse<MEAChecklist>>(`/assets/${id}/mea-checklists`, data)
  },

  // Update lifecycle state
  updateLifecycleState: async (
    id: string,
    data: {
      lifecycleState?: Asset['lifecycleState']
      totalDowntimeHours?: number
      totalServiceCost?: number
      utilizationPercentage?: number
      replacementRecommended?: boolean
      replacementReason?: string
      performedBy?: string
    }
  ): Promise<ApiResponse<Asset>> => {
    return apiPut<ApiResponse<Asset>>(`/assets/${id}/lifecycle`, data)
  },

  // Get lifecycle analysis
  getLifecycleAnalysis: async (
    type: 'recommendations' | 'endOfLife' | 'notifications',
    options?: {
      minAge?: number
      maxServiceCostRatio?: number
      minDowntimeHours?: number
      minUtilization?: number
      thresholdYears?: number
    }
  ): Promise<ApiResponse<unknown[]>> => {
    const params = new URLSearchParams({ type })
    if (options?.minAge) params.append('minAge', options.minAge.toString())
    if (options?.maxServiceCostRatio)
      params.append('maxServiceCostRatio', options.maxServiceCostRatio.toString())
    if (options?.minDowntimeHours)
      params.append('minDowntimeHours', options.minDowntimeHours.toString())
    if (options?.minUtilization)
      params.append('minUtilization', options.minUtilization.toString())
    if (options?.thresholdYears)
      params.append('thresholdYears', options.thresholdYears.toString())

    return apiGet<ApiResponse<unknown[]>>(`/assets/lifecycle-analysis?${params.toString()}`)
  },

  // Get QR details
  getQRDetails: async (
    id: string,
    format?: 'full' | 'mobile'
  ): Promise<ApiResponse<unknown>> => {
    const params = new URLSearchParams()
    if (format) params.append('format', format)

    return apiGet<ApiResponse<unknown>>(`/assets/${id}/qr-details?${params.toString()}`)
  },

  // Get minor assets
  getMinorAssets: async (
    page = 1,
    limit = 10,
    department?: string
  ): Promise<PaginatedResponse<Asset>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(department && { department }),
    })

    return apiGet<PaginatedResponse<Asset>>(`/assets/minor?${params.toString()}`)
  },
}
