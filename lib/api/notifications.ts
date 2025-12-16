// Notifications API functions

import { apiGet, apiPut } from './client'
import type {
  ApiResponse,
  PaginatedResponse,
} from '../types'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message?: string
  entityType?: string
  entityId?: string
  isRead: boolean
  createdAt: string
}

export const notificationsApi = {
  // Get user notifications
  getAll: async (
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<PaginatedResponse<Notification>> => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    }
    
    if (unreadOnly) paramsObj.unreadOnly = 'true'
    
    const params = new URLSearchParams(paramsObj)

    return apiGet<PaginatedResponse<Notification>>(`/notifications?${params.toString()}`)
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    return apiPut<ApiResponse<void>>(`/notifications/${id}/read`, {})
  },

  // Mark all as read
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return apiPut<ApiResponse<void>>('/notifications/read-all', {})
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiGet<ApiResponse<{ count: number }>>('/notifications/unread-count')
  },
}



