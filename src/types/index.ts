// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  name: string
  email: string
  role: string
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  name: string
  email: string
  role: string
  expiresAt: string
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parentId?: number | null
  imageUrl?: string
  displayOrder: number
  isActive: boolean
  showOnHomepage: boolean
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number
  url: string
  isDefault: boolean
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  discountedPrice?: number
  categoryId: number
  categoryName: string
  fabric: string
  color: string
  state?: string
  stockQuantity: number
  isActive: boolean
  images: ProductImage[]
  imageUrls: string[]
  defaultImageUrl?: string
  hasBlousePiece: boolean
  careInstructions?: string
  deliveryDays: number
  createdAt: string
}

export interface ProductRequest {
  name: string
  description: string
  price: number
  discountedPrice?: number
  categoryId: number
  fabric: string
  color: string
  occasion?: string
  state?: string
  stockQuantity: number
  hasBlousePiece?: boolean
  careInstructions?: string
  deliveryDays?: number
  videoUrl?: string
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'

export interface OrderItem {
  productId: number
  productName: string
  imageUrl?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: number
  userId: number
  customerName?: string
  customerEmail?: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  totalAmount: number
  discountAmount: number
  shippingFee: number
  finalAmount: number
  awbCode?: string
  items: OrderItem[]
  createdAt: string
}

export interface PaginatedOrders {
  items: Order[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface PaginatedCustomers {
  items: Customer[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface MonthlyStats {
  month: string
  revenue: number
  orders: number
}

export interface DashboardSummary {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
}

export interface DashboardStats {
  summary: DashboardSummary
  monthly: MonthlyStats[]
}

// ─── Shipping ────────────────────────────────────────────────────────────────

export interface ShipmentResponse {
  awbCode: string
  shipmentId: string
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export interface Coupon {
  id: number
  code: string | null
  description: string
  discountType: 'Percentage' | 'Fixed'
  discountValue: number
  minCartAmount: number | null
  maxDiscount: number | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  usageLimit: number | null
  usedCount: number
  festivalName: string | null
  bankName: string | null
  createdAt: string
}

export interface CreateCouponPayload {
  code?: string
  description: string
  discountType: 'Percentage' | 'Fixed'
  discountValue: number
  minCartAmount?: number
  maxDiscount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  festivalName?: string
  bankName?: string
}

// ─── Returns ─────────────────────────────────────────────────────────────────

export interface ReturnRequest {
  id: number
  orderId: number
  userId: number
  userName: string
  reason: string
  description?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  adminNote?: string
  refundStatus: 'None' | 'Processing' | 'Issued' | 'Failed'
  razorpayRefundId?: string
  createdAt: string
  updatedAt?: string
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: number
  productId: number
  userId: number
  userName: string
  rating: number
  title?: string
  body: string
  isApproved: boolean
  createdAt: string
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export interface Campaign {
  id: number
  name: string
  description?: string
  categoryId: number | null
  discountType: 'Percentage' | 'Fixed'
  discountValue: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateCampaignPayload {
  name: string
  description?: string
  categoryId?: number
  discountType: 'Percentage' | 'Fixed'
  discountValue: number
  startDate?: string
  endDate?: string
}
