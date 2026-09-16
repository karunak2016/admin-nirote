import { apiClient } from './client'
import type { Review } from '../types'

export const reviewsApi = {
  list: (): Promise<Review[]> =>
    apiClient.get<Review[]>('/reviews').then((r) => r.data),

  approve: (id: number): Promise<void> =>
    apiClient.post(`/reviews/approve/${id}`).then(() => undefined),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/reviews/${id}`).then(() => undefined),
}
