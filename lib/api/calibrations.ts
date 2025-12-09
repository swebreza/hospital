// Calibration API functions

import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './client'
import type {
  Calibration,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../types'

export const calibrationsApi = {
  // Get all calibrations with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<Calibration>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    })

    return apiGet<PaginatedResponse<Calibration>>(`/calibrations?${params.toString()}`)
  },

  // Get single calibration by ID
  getById: async (id: string): Promise<Calibration> => {
    return apiGet<Calibration>(`/calibrations/${id}`)
  },

  // Create new calibration
  create: async (data: Partial<Calibration>): Promise<ApiResponse<Calibration>> => {
    return apiPost<ApiResponse<Calibration>>('/calibrations', data)
  },

  // Update calibration
  update: async (
    id: string,
    data: Partial<Calibration>
  ): Promise<ApiResponse<Calibration>> => {
    return apiPut<ApiResponse<Calibration>>(`/calibrations/${id}`, data)
  },

  // Delete calibration
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/calibrations/${id}`)
  },

  // Schedule calibration
  schedule: async (data: {
    assetId: string
    scheduledDate: string
    vendorId?: string
  }): Promise<ApiResponse<Calibration>> => {
    return apiPost<ApiResponse<Calibration>>('/calibrations/schedule', data)
  },

  // Upload certificate
  uploadCertificate: async (
    calibrationId: string,
    file: File
  ): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('calibrationId', calibrationId)

    return apiUpload<ApiResponse<{ url: string }>>(
      '/calibrations/certificates',
      formData
    )
  },

  // Bulk upload certificates
  bulkUploadCertificates: async (
    files: File[],
    mapping?: Record<string, string>
  ): Promise<ApiResponse<{ success: number; failed: number }>> => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    if (mapping) {
      formData.append('mapping', JSON.stringify(mapping))
    }

    return apiUpload<ApiResponse<{ success: number; failed: number }>>(
      '/calibrations/bulk-upload',
      formData
    )
  },
}

