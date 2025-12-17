import { apiGet } from './client'
import type { User, ApiResponse } from '../types'

export const usersApi = {
  getAll: async (options?: { role?: string; search?: string }): Promise<ApiResponse<User[]>> => {
    const params = new URLSearchParams()
    if (options?.role) params.append('role', options.role)
    if (options?.search) params.append('search', options.search)
    
    const query = params.toString()
    return apiGet<ApiResponse<User[]>>(`/users${query ? `?${query}` : ''}`)
  },
}







