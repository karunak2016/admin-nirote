import { apiClient } from './client'
import type { Order, PaginatedOrders } from '../types'

export const ordersApi = {
  list: (page = 1, pageSize = 20) =>
    apiClient
      .get<PaginatedOrders>('/orders/admin', { params: { page, pageSize } })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Order>(`/orders/admin/${id}`).then((r) => r.data),

  updateStatus: (id: number, status: string, awbCode?: string) =>
    apiClient.post(`/orders/admin/${id}/update-status`, { status, awbCode }).then((r) => r.data),
}
