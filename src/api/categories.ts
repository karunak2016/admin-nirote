import { apiClient } from './client'
import type { Category } from '../types'

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export const categoriesApi = {
  list: (includeInactive = false) =>
    apiClient.get<Category[]>('/categories', { params: { includeInactive } }).then((r) => r.data),

  create: (data: { name: string; description?: string; imageUrl?: string; parentId?: number | null; showOnHomepage?: boolean }) =>
    apiClient.post<Category>('/categories', {
      name: data.name,
      slug: toSlug(data.name),
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      displayOrder: 0,
      parentId: data.parentId ?? null,
      showOnHomepage: data.showOnHomepage ?? false,
    }).then((r) => r.data),

  update: (id: number, data: { name: string; description?: string; imageUrl?: string; parentId?: number | null; isActive?: boolean; showOnHomepage?: boolean }) =>
    apiClient.post<Category>(`/categories/update/${id}`, {
      name: data.name,
      slug: toSlug(data.name),
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      displayOrder: 0,
      isActive: data.isActive ?? true,
      parentId: data.parentId ?? null,
      showOnHomepage: data.showOnHomepage ?? false,
    }).then((r) => r.data),

  remove: (id: number) =>
    apiClient.post(`/categories/delete/${id}`).then((r) => r.data),
}
