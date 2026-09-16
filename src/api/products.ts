import { apiClient } from './client'
import type { Product, ProductRequest } from '../types'

export const productsApi = {
  list: (page = 1, pageSize = 10, categoryId?: number, fabric?: string) =>
    apiClient.get<{ items: Product[]; totalCount: number }>('/products', {
      params: { page, pageSize, sortBy: 'newest', categoryId: categoryId || undefined, fabric: fabric || undefined }
    }).then((r) => r.data),

  search: (q: string, page = 1, pageSize = 10) =>
    apiClient.get<{ items: Product[]; totalCount: number }>('/products/search', {
      params: { q, page, pageSize }
    }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    apiClient.post<Product>('/products', data).then((r) => r.data),

  update: (id: number, data: ProductRequest) =>
    apiClient.post<Product>(`/products/update/${id}`, data).then((r) => r.data),

  deactivate: (id: number) =>
    apiClient.post(`/products/delete/${id}`).then((r) => r.data),

  addImage: (productId: number, imageUrl: string, isDefault: boolean): Promise<number> =>
    apiClient.post<{ imageId: number }>(`/products/${productId}/images`, { imageUrl, isDefault }).then((r) => r.data.imageId),

  removeImage: (productId: number, imageId: number) =>
    apiClient.post(`/products/${productId}/images/delete/${imageId}`).then((r) => r.data),
}
