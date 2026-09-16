import { apiClient } from './client'
import type { ReturnRequest } from '../types'

export const returnsApi = {
  list: (): Promise<ReturnRequest[]> =>
    apiClient.get<ReturnRequest[]>('/returns').then((r) => r.data),

  updateStatus: (id: number, status: 'Approved' | 'Rejected', adminNote?: string): Promise<void> =>
    apiClient.post(`/returns/${id}/status`, { status, adminNote }).then(() => {}),

  issueRefund: (id: number): Promise<{ message: string; refundId?: string }> =>
    apiClient.post(`/returns/${id}/refund`).then((r) => r.data),
}
