import { apiClient } from './client'
import type { Customer, PaginatedCustomers } from '../types'

export const customersApi = {
  list: (page = 1, pageSize = 20) =>
    apiClient
      .get<PaginatedCustomers>('/admin/customers', { params: { page, pageSize } })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Customer>(`/admin/customers/${id}`).then((r) => r.data),
}
