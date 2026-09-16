import { apiClient } from './client'

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  isRead: boolean
  submittedAt: string
}

export const contactsApi = {
  list: (page = 1, pageSize = 20, filter: 'all' | 'unread' | 'read' = 'all') =>
    apiClient.get<{ items: ContactMessage[]; total: number }>('/contact', { params: { page, pageSize, filter } }).then(r => r.data),
  markRead: (id: number) =>
    apiClient.patch(`/contact/${id}/read`).then(r => r.data),
  markAllRead: () =>
    apiClient.patch('/contact/read-all').then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/contact/${id}`).then(r => r.data),
  deleteBulk: (ids: number[]) =>
    apiClient.delete('/contact/bulk', { data: { ids } }).then(r => r.data),
  cleanup: (days = 30) =>
    apiClient.delete(`/contact/cleanup?days=${days}`).then(r => r.data),
  reply: (id: number, message: string) =>
    apiClient.post(`/contact/${id}/reply`, { message }).then(r => r.data),
}
