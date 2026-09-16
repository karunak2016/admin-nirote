import { apiClient } from './client'
import type { ShipmentResponse } from '../types'

export const shippingApi = {
  createShipment: (orderId: number) =>
    apiClient.post<ShipmentResponse>('/shipping/create-shipment', orderId).then((r) => r.data),

  track: (awbCode: string) =>
    apiClient.get(`/shipping/track/${awbCode}`).then((r) => r.data),
}
