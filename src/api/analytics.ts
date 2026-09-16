import { apiClient } from './client'

export const analyticsApi = {
  summary:        (days = 30) => apiClient.get(`/analytics/summary?days=${days}`).then(r => r.data),
  dailyViews:     (days = 30) => apiClient.get(`/analytics/daily-views?days=${days}`).then(r => r.data),
  dailyOrders:    (days = 30) => apiClient.get(`/analytics/daily-orders?days=${days}`).then(r => r.data),
  dailyRevenue:   (days = 30) => apiClient.get(`/analytics/daily-revenue?days=${days}`).then(r => r.data),
  topByViews:     (days = 30) => apiClient.get(`/analytics/top-products/views?days=${days}&top=8`).then(r => r.data),
  topBySales:     (days = 30) => apiClient.get(`/analytics/top-products/sales?days=${days}&top=8`).then(r => r.data),
  trafficSources: (days = 30) => apiClient.get(`/analytics/traffic-sources?days=${days}`).then(r => r.data),
  productViewers: (productId: number, days = 30) => apiClient.get(`/analytics/product/${productId}/viewers?days=${days}`).then(r => r.data),
}
