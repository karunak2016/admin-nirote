import { apiClient } from './client'
import type { Coupon, CreateCouponPayload } from '../types'

export const couponsApi = {
  list: (): Promise<Coupon[]> =>
    apiClient.get<Coupon[]>('/coupons').then((r) => r.data),

  create: (data: CreateCouponPayload): Promise<Coupon> =>
    apiClient.post<Coupon>('/coupons', data).then((r) => r.data),

  update: (id: number, data: CreateCouponPayload & { isActive: boolean }): Promise<Coupon> =>
    apiClient.post<Coupon>(`/coupons/update/${id}`, data).then((r) => r.data),

  deactivate: (id: number): Promise<void> =>
    apiClient.post(`/coupons/delete/${id}`).then(() => undefined),

  sendEmail: (id: number): Promise<{ sent: number }> =>
    apiClient.post<{ sent: number }>(`/coupons/${id}/send-email`).then((r) => r.data),
}
