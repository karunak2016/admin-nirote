import { apiClient } from './client'

export interface Subscriber {
  id: number
  email: string
  subscribedAt: string
  isActive: boolean
}

export const newsletterAdminApi = {
  list: (page = 1, pageSize = 50) =>
    apiClient.get<{ items: Subscriber[]; total: number }>('/newsletter/subscribers', { params: { page, pageSize } }).then(r => r.data),
  toggle: (id: number, isActive: boolean) =>
    apiClient.patch(`/newsletter/subscribers/${id}`, { isActive }).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/newsletter/subscribers/${id}`).then(r => r.data),
}
