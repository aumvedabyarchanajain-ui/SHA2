export interface CreateCheckoutParams {
  amountPaise: number
  currency: string
  orderId: string
  customerEmail: string
  customerName?: string
  customerPhone?: string
  productInfo?: string
  metadata?: Record<string, string>
  returnUrl: string
  gatewayPreference?: 'PRIMARY' | 'SECONDARY' | 'AUTO'
  items?: Array<{
    title: string
    quantity: number
    priceCents: number
    productType?: 'physical' | 'service' | 'course' | 'bundle'
  }>
}

export interface CheckoutSession {
  sessionId: string
  paymentUrl: string
  gatewayUsed: 'EASEBUZZ_PRIMARY' | 'EASEBUZZ_SECONDARY' | 'SIMULATED'
  accessKey?: string
}

export interface PaymentVerification {
  verified: boolean
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  amountPaise: number
  paymentId: string | null
  txnid: string
  gateway: 'EASEBUZZ_PRIMARY' | 'EASEBUZZ_SECONDARY' | 'SIMULATED'
  rawPayload?: Record<string, unknown>
}

export interface EasebuzzCredentials {
  key: string
  salt: string
  env: 'test' | 'prod'
}

export interface EasebuzzWebhookPayload {
  txnid: string
  firstname: string
  email: string
  phone: string
  amount: string
  status: string
  hash: string
  key: string
  productinfo: string
  easepayid?: string
  bank_ref_num?: string
  error_Message?: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
  udf6?: string
  udf7?: string
  udf8?: string
  udf9?: string
  udf10?: string
  [key: string]: unknown
}

export interface PaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutSession>
  verifyPayment(txnid: string, gatewayPreference?: 'PRIMARY' | 'SECONDARY'): Promise<PaymentVerification>
  processWebhook(payload: Record<string, unknown>, signature?: string): Promise<{ orderId: string; status: PaymentVerification['status']; gateway: string; easepayid?: string } | null>
  refundPayment(txnid: string, easepayid: string, amountPaise: number, reason?: string): Promise<{ refunded: boolean; refundId: string | null; message?: string }>
}

export type PaymentProviderName = 'easebuzz' | 'eazebus'

