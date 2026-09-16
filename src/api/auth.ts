import { apiClient } from './client'
import type { AdminLoginRequest, AuthResponse } from '../types'

export const authApi = {
  login: (data: AdminLoginRequest) =>
    apiClient.post<AuthResponse>('/auth/admin/login', data).then((r) => r.data),
}
