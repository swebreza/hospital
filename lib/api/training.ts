// Training API functions

import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './client'
import type {
  TrainingSession,
  TrainingParticipant,
  TrainingAssessment,
  TrainingCertification,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../types'

export const trainingApi = {
  // Get all training sessions with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<TrainingSession>> => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    }
    
    if (filters?.search) paramsObj.search = filters.search
    if (filters?.status) paramsObj.status = filters.status
    if (filters?.department) paramsObj.department = filters.department
    if (filters?.dateFrom) paramsObj.dateFrom = filters.dateFrom
    if (filters?.dateTo) paramsObj.dateTo = filters.dateTo
    if (filters?.assetId) paramsObj.assetId = filters.assetId as string
    
    const params = new URLSearchParams(paramsObj)

    return apiGet<PaginatedResponse<TrainingSession>>(`/training?${params.toString()}`)
  },

  // Get single training session by ID
  getById: async (id: string): Promise<TrainingSession> => {
    const response = await apiGet<ApiResponse<TrainingSession>>(`/training/${id}`)
    return response.data!
  },

  // Create new training session
  create: async (data: Partial<TrainingSession>): Promise<ApiResponse<TrainingSession>> => {
    return apiPost<ApiResponse<TrainingSession>>('/training', data)
  },

  // Update training session
  update: async (
    id: string,
    data: Partial<TrainingSession>
  ): Promise<ApiResponse<TrainingSession>> => {
    return apiPut<ApiResponse<TrainingSession>>(`/training/${id}`, data)
  },

  // Delete training session
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/training/${id}`)
  },

  // Participant management
  getParticipants: async (sessionId: string): Promise<TrainingParticipant[]> => {
    const response = await apiGet<ApiResponse<TrainingParticipant[]>>(`/training/${sessionId}/participants`)
    return response.data || []
  },

  addParticipants: async (
    sessionId: string,
    userIds: string[]
  ): Promise<ApiResponse<TrainingParticipant[]>> => {
    return apiPost<ApiResponse<TrainingParticipant[]>>(`/training/${sessionId}/participants`, {
      userIds,
    })
  },

  updateParticipantStatus: async (
    sessionId: string,
    participantId: string,
    data: Partial<TrainingParticipant>
  ): Promise<ApiResponse<TrainingParticipant>> => {
    return apiPut<ApiResponse<TrainingParticipant>>(`/training/${sessionId}/participants`, {
      participantId,
      ...data,
    })
  },

  // Assessment management
  getAssessments: async (sessionId: string): Promise<TrainingAssessment[]> => {
    const response = await apiGet<ApiResponse<TrainingAssessment[]>>(`/training/${sessionId}/assessments`)
    return response.data || []
  },

  uploadAssessment: async (
    sessionId: string,
    data: Partial<TrainingAssessment>
  ): Promise<ApiResponse<TrainingAssessment>> => {
    return apiPost<ApiResponse<TrainingAssessment>>(`/training/${sessionId}/assessments`, data)
  },

  // User training profile
  getUserProfile: async (userId: string): Promise<ApiResponse<{
    userId: string
    trainingHistory: Array<{
      participant: TrainingParticipant
      session?: TrainingSession
    }>
    certifications: TrainingCertification[]
    assessments: TrainingAssessment[]
    summary: {
      totalSessions: number
      attendedSessions: number
      certifiedEquipment: number
      activeCertifications: number
      expiringCertifications: number
    }
  }>> => {
    return apiGet<ApiResponse<any>>(`/training/participants/${userId}`)
  },

  // Certification management
  getCertifications: async (
    page = 1,
    limit = 10,
    filters?: {
      userId?: string
      assetId?: string
      status?: string
      expiringSoon?: boolean
    }
  ): Promise<PaginatedResponse<TrainingCertification>> => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    }
    
    if (filters?.userId) paramsObj.userId = filters.userId
    if (filters?.assetId) paramsObj.assetId = filters.assetId
    if (filters?.status) paramsObj.status = filters.status
    if (filters?.expiringSoon !== undefined) paramsObj.expiringSoon = filters.expiringSoon.toString()
    
    const params = new URLSearchParams(paramsObj)

    return apiGet<PaginatedResponse<TrainingCertification>>(`/training/certifications?${params.toString()}`)
  },

  getCertificationById: async (id: string): Promise<TrainingCertification> => {
    const response = await apiGet<ApiResponse<TrainingCertification>>(`/training/certifications/${id}`)
    return response.data!
  },

  issueCertification: async (
    data: Partial<TrainingCertification>
  ): Promise<ApiResponse<TrainingCertification>> => {
    return apiPost<ApiResponse<TrainingCertification>>('/training/certifications', data)
  },

  updateCertification: async (
    id: string,
    data: Partial<TrainingCertification>
  ): Promise<ApiResponse<TrainingCertification>> => {
    return apiPut<ApiResponse<TrainingCertification>>(`/training/certifications/${id}`, data)
  },

  renewCertification: async (
    id: string,
    expiryDate?: string
  ): Promise<ApiResponse<TrainingCertification>> => {
    return apiPut<ApiResponse<TrainingCertification>>(`/training/certifications/${id}`, {
      status: 'Renewed',
      expiryDate,
    })
  },
}

