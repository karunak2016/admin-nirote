import { apiClient } from './client'

export const settingsApi = {
  get: (key: string): Promise<{ key: string; value: string }> =>
    apiClient.get<{ key: string; value: string }>(`/settings/${key}`).then((r) => r.data),

  set: (key: string, value: string): Promise<{ key: string; value: string }> =>
    apiClient.post<{ key: string; value: string }>(`/settings/${key}`, { value }).then((r) => r.data),

  getShipping: (): Promise<{ shippingFee: number; freeShippingThreshold: number }> =>
    apiClient.get('/settings/shipping').then((r) => r.data),
}
