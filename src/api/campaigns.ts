import { apiClient } from './client'
import type { Campaign, CreateCampaignPayload } from '../types'

export const campaignsApi = {
  list: (): Promise<Campaign[]> =>
    apiClient.get<Campaign[]>('/campaigns').then((r) => r.data),

  create: (data: CreateCampaignPayload): Promise<Campaign> =>
    apiClient.post<Campaign>('/campaigns', data).then((r) => r.data),

  update: (id: number, data: CreateCampaignPayload & { isActive: boolean }): Promise<Campaign> =>
    apiClient.post<Campaign>(`/campaigns/update/${id}`, data).then((r) => r.data),
}
