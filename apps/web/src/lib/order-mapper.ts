export interface OrderItemView {
  id: string
  name: string
  quantity: number
  price: number
  image: string
  type: 'PHYSICAL' | 'COURSE' | 'SESSION' | 'MICRO_LEARNING'
}

export interface OrderView {
  id: string
  createdAt: string
  total: number
  status: string
  paymentStatus: string
  shippingAddress: string
  paymentMethod: string
  items: OrderItemView[]
  trackingNumber?: string
}

export type OrderItemRow = {
  id: number | string
  title?: string | null
  name?: string | null
  quantity: number
  priceCents?: number | null
  product?: {
    images: string[]
    productType: string | null
  } | null
}

export type OrderRow = {
  id: number | string
  createdAt: Date
  totalCents?: number | null
  status: string
  paymentStatus?: string | null
  eazebusPaymentId?: string | null
  shippingAddress?: unknown
  trackingNumber?: string | null
  items?: OrderItemRow[]
}

export function mapOrderItem(item: OrderItemRow): OrderItemView {
  const productType = item.product?.productType ?? 'physical'
  let type: OrderItemView['type'] = 'PHYSICAL'
  if (productType === 'course') type = 'COURSE'
  else if (productType === 'digital') type = 'MICRO_LEARNING'
  return {
    id: String(item.id),
    name: item.title || item.name || 'Product',
    quantity: item.quantity,
    price: (item.priceCents ?? 0) / 100,
    image: item.product?.images?.[0] ?? '',
    type,
  }
}

export function mapOrder(order: any): OrderView {
  const shipping =
    order.shippingAddress && typeof order.shippingAddress === 'object'
      ? (order.shippingAddress as { address?: string; fullName?: string }).address ??
        JSON.stringify(order.shippingAddress)
      : null
  return {
    id: String(order.id),
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(order.createdAt).toISOString(),
    total: (order.totalCents ?? 0) / 100,
    status: order.status,
    paymentStatus: order.paymentStatus ?? 'PENDING',
    shippingAddress:
      shipping ?? 'Digital content — delivered instantly to your account.',
    paymentMethod: order.eazebusPaymentId || order.easebuzzPaymentId ? 'Easebuzz Secure' : 'Pending payment',
    trackingNumber: order.trackingNumber ?? undefined,
    items: (order.items ?? []).map(mapOrderItem),
  }
}
