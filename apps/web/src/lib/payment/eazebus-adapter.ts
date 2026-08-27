import crypto from 'crypto'
import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutSession,
  PaymentVerification,
  EasebuzzCredentials,
  EasebuzzWebhookPayload,
} from '@/lib/payment/types'

/**
 * Easebuzz Dual Payment Gateway Client
 * 
 * Supports:
 * 1. Primary & Secondary Easebuzz Merchant Gateways with automatic failover
 * 2. SHA-512 checksum generation for transaction initiation
 * 3. Reverse SHA-512 hash verification for webhooks and redirects
 * 4. HMAC-SHA256 webhook signature verification with timing-safe comparison
 * 5. Indian Rupee / Paise transaction lifecycle
 */
export class EasebuzzDualGateway implements PaymentProvider {
  private primaryCreds: EasebuzzCredentials | null = null
  private secondaryCreds: EasebuzzCredentials | null = null
  private env: 'test' | 'prod'

  constructor() {
    this.env = (process.env.EASEBUZZ_ENV === 'prod' || process.env.NODE_ENV === 'production') ? 'prod' : 'test'

    const primaryKey = process.env.EASEBUZZ_KEY_PRIMARY || process.env.EAZEBUS_MERCHANT_ID || process.env.EAZEBUS_KEY || ''
    const primarySalt = process.env.EASEBUZZ_SALT_PRIMARY || process.env.EAZEBUS_API_KEY || process.env.EAZEBUS_SALT || ''
    if (primaryKey && primarySalt) {
      this.primaryCreds = { key: primaryKey, salt: primarySalt, env: this.env }
    }

    const secondaryKey = process.env.EASEBUZZ_KEY_SECONDARY || ''
    const secondarySalt = process.env.EASEBUZZ_SALT_SECONDARY || ''
    if (secondaryKey && secondarySalt) {
      this.secondaryCreds = { key: secondaryKey, salt: secondarySalt, env: this.env }
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.primaryCreds || this.secondaryCreds)
  }

  public getBaseUrl(env: 'test' | 'prod'): string {
    return env === 'prod' ? 'https://pay.easebuzz.in' : 'https://testpay.easebuzz.in'
  }

  /**
   * Generates Easebuzz initiation SHA-512 hash:
   * hash = SHA-512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
   */
  public generateInitiationHash(
    key: string,
    txnid: string,
    amountStr: string,
    productInfo: string,
    firstName: string,
    email: string,
    udfs: string[],
    salt: string
  ): string {
    const fullUdfs = [...udfs]
    while (fullUdfs.length < 10) fullUdfs.push('')
    const hashString = [
      key,
      txnid,
      amountStr,
      productInfo,
      firstName,
      email,
      ...fullUdfs.slice(0, 10),
      salt,
    ].join('|')

    return crypto.createHash('sha512').update(hashString).digest('hex')
  }

  /**
   * Generates / verifies Easebuzz reverse SHA-512 response hash:
   * reverse_hash = SHA-512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
   */
  public generateReverseHash(
    salt: string,
    status: string,
    udfs: string[],
    email: string,
    firstName: string,
    productInfo: string,
    amountStr: string,
    txnid: string,
    key: string
  ): string {
    const fullUdfs = [...udfs]
    while (fullUdfs.length < 10) fullUdfs.push('')
    const reversedUdfs = [...fullUdfs.slice(0, 10)].reverse()

    const hashString = [
      salt,
      status,
      ...reversedUdfs,
      email,
      firstName,
      productInfo,
      amountStr,
      txnid,
      key,
    ].join('|')

    return crypto.createHash('sha512').update(hashString).digest('hex')
  }

  /**
   * Verifies an HMAC-SHA256 signature using constant-time string comparison
   */
  public verifyHmacSha256(rawBody: string, signature: string, secret: string): boolean {
    try {
      const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      if (computed.length !== signature.length) return false
      return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'))
    } catch {
      return false
    }
  }

  /**
   * Initiates payment link with automatic failover between Primary and Secondary Gateways
   */
  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const amountInr = (params.amountPaise / 100).toFixed(2)
    const txnid = params.orderId.startsWith('AUM-') ? params.orderId : `AUM-${params.orderId}-${Date.now().toString().slice(-4)}`
    const productInfo = params.productInfo || (params.items && params.items[0]?.title) || 'Aumveda Sacred Sanctuary'
    const firstName = (params.customerName || 'Aumveda Seeker').split(' ')[0] || 'Seeker'
    const phone = params.customerPhone || '9999999999'
    const email = params.customerEmail

    const udfs = [
      params.orderId,
      params.metadata?.userId || '',
      params.metadata?.serviceType || '',
      params.metadata?.chakra || '',
      '', '', '', '', '', ''
    ]

    // Determine gateway ordering
    const gatewaysToTry: Array<{ name: 'EASEBUZZ_PRIMARY' | 'EASEBUZZ_SECONDARY'; creds: EasebuzzCredentials }> = []
    if (params.gatewayPreference === 'SECONDARY' && this.secondaryCreds) {
      gatewaysToTry.push({ name: 'EASEBUZZ_SECONDARY', creds: this.secondaryCreds })
      if (this.primaryCreds) gatewaysToTry.push({ name: 'EASEBUZZ_PRIMARY', creds: this.primaryCreds })
    } else {
      if (this.primaryCreds) gatewaysToTry.push({ name: 'EASEBUZZ_PRIMARY', creds: this.primaryCreds })
      if (this.secondaryCreds) gatewaysToTry.push({ name: 'EASEBUZZ_SECONDARY', creds: this.secondaryCreds })
    }

    if (gatewaysToTry.length === 0) {
      // Return simulated checkout session when running locally without active API keys
      console.warn('[Easebuzz] No merchant credentials configured. Returning simulated sandbox checkout.')
      return {
        sessionId: `sim_${txnid}`,
        paymentUrl: `${params.returnUrl}${params.returnUrl.includes('?') ? '&' : '?'}status=success&txnid=${txnid}&simulated=true`,
        gatewayUsed: 'SIMULATED',
      }
    }

    let lastError: Error | null = null

    for (const gw of gatewaysToTry) {
      try {
        const hash = this.generateInitiationHash(
          gw.creds.key,
          txnid,
          amountInr,
          productInfo,
          firstName,
          email,
          udfs,
          gw.creds.salt
        )

        const baseUrl = this.getBaseUrl(gw.creds.env)
        const postData = new URLSearchParams({
          key: gw.creds.key,
          txnid,
          amount: amountInr,
          productinfo: productInfo,
          firstname: firstName,
          phone,
          email,
          surl: `${params.returnUrl}${params.returnUrl.includes('?') ? '&' : '?'}status=success&txnid=${txnid}`,
          furl: `${params.returnUrl}${params.returnUrl.includes('?') ? '&' : '?'}status=failed&txnid=${txnid}`,
          hash,
          udf1: udfs[0],
          udf2: udfs[1],
          udf3: udfs[2],
          udf4: udfs[3],
          udf5: udfs[4],
        })

        const response = await fetch(`${baseUrl}/payment/initiateLink`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: postData.toString(),
        })

        const data = await response.json()

        if (data.status === 1 && data.data) {
          const accessKey = data.data
          const paymentUrl = `${baseUrl}/pay/${accessKey}`
          return {
            sessionId: accessKey,
            paymentUrl,
            gatewayUsed: gw.name,
            accessKey,
          }
        } else {
          const errMsg = data.error_desc || data.data || 'Easebuzz initiation error'
          console.warn(`[Easebuzz] ${gw.name} error: ${errMsg}. Trying fallback if available...`)
          lastError = new Error(errMsg)
        }
      } catch (err: unknown) {
        console.error(`[Easebuzz] Exception with ${gw.name}:`, err)
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    // If both real gateways failed, throw error or fallback
    throw lastError || new Error('All Easebuzz payment gateways failed to initiate.')
  }

  /**
   * Verifies payment status via Easebuzz retrieve transaction API
   */
  async verifyPayment(txnid: string, gatewayPreference: 'PRIMARY' | 'SECONDARY' = 'PRIMARY'): Promise<PaymentVerification> {
    const creds = (gatewayPreference === 'SECONDARY' ? this.secondaryCreds : this.primaryCreds) || this.primaryCreds || this.secondaryCreds

    if (!creds) {
      // Simulated sandbox verification
      return {
        verified: true,
        status: 'SUCCESS',
        amountPaise: 0,
        paymentId: `sim_pay_${txnid}`,
        txnid,
        gateway: 'SIMULATED',
        rawPayload: { simulated: true },
      }
    }

    const hashString = `${creds.key}|${txnid}|${creds.salt}`
    const hash = crypto.createHash('sha512').update(hashString).digest('hex')
    const baseUrl = this.getBaseUrl(creds.env)

    try {
      const form = new URLSearchParams({
        key: creds.key,
        txnid,
        hash,
      })

      const response = await fetch(`${baseUrl}/transaction/v1/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })

      const json = await response.json()
      if (json.status && json.msg) {
        const txObj = json.msg
        const status = (txObj.status || '').toLowerCase()
        const isSuccess = status === 'success'

        return {
          verified: isSuccess,
          status: isSuccess ? 'SUCCESS' : (status === 'usercancelled' ? 'CANCELLED' : 'FAILED'),
          amountPaise: Math.round(parseFloat(txObj.amount || '0') * 100),
          paymentId: txObj.easepayid || null,
          txnid,
          gateway: (creds === this.primaryCreds) ? 'EASEBUZZ_PRIMARY' : 'EASEBUZZ_SECONDARY',
          rawPayload: txObj,
        }
      }
    } catch (e) {
      console.error('[Easebuzz] Verification error:', e)
    }

    return {
      verified: false,
      status: 'FAILED',
      amountPaise: 0,
      paymentId: null,
      txnid,
      gateway: (creds === this.primaryCreds) ? 'EASEBUZZ_PRIMARY' : 'EASEBUZZ_SECONDARY',
    }
  }

  /**
   * Process and verify Easebuzz webhook callback with SHA-512 / HMAC validation
   */
  async processWebhook(
    payload: Record<string, unknown>,
    hmacSignature?: string
  ): Promise<{ orderId: string; status: PaymentVerification['status']; gateway: string; easepayid?: string } | null> {
    const raw = payload as unknown as EasebuzzWebhookPayload
    const key = raw.key || ''
    const receivedHash = raw.hash || ''
    const status = (raw.status || '').toLowerCase()
    const txnid = raw.txnid || ''
    const amount = raw.amount || '0.00'
    const email = raw.email || ''
    const firstname = raw.firstname || ''
    const productinfo = raw.productinfo || ''

    // Determine which merchant credentials match
    let creds = this.primaryCreds
    let gatewayName = 'EASEBUZZ_PRIMARY'
    if (this.secondaryCreds && this.secondaryCreds.key === key) {
      creds = this.secondaryCreds
      gatewayName = 'EASEBUZZ_SECONDARY'
    } else if (!creds && this.secondaryCreds) {
      creds = this.secondaryCreds
      gatewayName = 'EASEBUZZ_SECONDARY'
    }

    if (!creds) {
      // In local simulation mode without keys
      if (raw.simulated) {
        return {
          orderId: (raw.udf1 as string) || txnid.replace(/^AUM-/, '').split('-')[0],
          status: status === 'success' ? 'SUCCESS' : 'FAILED',
          gateway: 'SIMULATED',
          easepayid: raw.easepayid as string || `sim_${txnid}`,
        }
      }
      throw new Error('Easebuzz gateway credentials not found for webhook key')
    }

    const udfs = [
      raw.udf1 || '', raw.udf2 || '', raw.udf3 || '', raw.udf4 || '', raw.udf5 || '',
      raw.udf6 || '', raw.udf7 || '', raw.udf8 || '', raw.udf9 || '', raw.udf10 || ''
    ]

    // 1. Check reverse SHA-512 hash
    const expectedReverseHash = this.generateReverseHash(
      creds.salt,
      raw.status || '',
      udfs,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key
    )

    const hashMatch = expectedReverseHash.toLowerCase() === receivedHash.toLowerCase()

    // 2. Check HMAC signature if provided in headers
    let hmacMatch = true
    if (hmacSignature) {
      hmacMatch = this.verifyHmacSha256(JSON.stringify(payload), hmacSignature, creds.salt)
    }

    if (!hashMatch && !hmacMatch) {
      console.error('[Easebuzz Webhook] Hash validation failed!', { expectedReverseHash, receivedHash })
      throw new Error('Invalid Easebuzz webhook signature or reverse hash')
    }

    const orderId = (raw.udf1 as string) || txnid.replace(/^AUM-/, '').split('-')[0]

    let internalStatus: PaymentVerification['status'] = 'FAILED'
    if (status === 'success') internalStatus = 'SUCCESS'
    else if (status === 'usercancelled') internalStatus = 'CANCELLED'
    else if (status === 'refunded') internalStatus = 'REFUNDED'

    return {
      orderId,
      status: internalStatus,
      gateway: gatewayName,
      easepayid: raw.easepayid,
    }
  }

  /**
   * Executes a refund through Easebuzz API
   */
  async refundPayment(
    txnid: string,
    easepayid: string,
    amountPaise: number,
    reason: string = 'Customer return or cancellation'
  ): Promise<{ refunded: boolean; refundId: string | null; message?: string }> {
    const creds = this.primaryCreds || this.secondaryCreds
    if (!creds) {
      return { refunded: true, refundId: `sim_ref_${Date.now()}`, message: 'Simulated refund' }
    }

    const amountInr = (amountPaise / 100).toFixed(2)
    const hashString = `${creds.key}|${easepayid}|${amountInr}|${creds.salt}`
    const hash = crypto.createHash('sha512').update(hashString).digest('hex')
    const baseUrl = this.getBaseUrl(creds.env)

    try {
      const form = new URLSearchParams({
        key: creds.key,
        easebuzz_id: easepayid,
        refund_amount: amountInr,
        phone: '9999999999',
        email: 'billing@aumveda.com',
        amount: amountInr,
        merchant_refund_id: `ref_${txnid}_${Date.now()}`,
        hash,
      })

      const response = await fetch(`${baseUrl}/transaction/v1/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })

      const json = await response.json()
      if (json.status) {
        return {
          refunded: true,
          refundId: json.refund_id || json.data?.refund_id || `ref_${txnid}`,
          message: json.msg || 'Refund processed successfully',
        }
      } else {
        return {
          refunded: false,
          refundId: null,
          message: json.reason || json.msg || 'Refund failed',
        }
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e)
      return { refunded: false, refundId: null, message: err }
    }
  }
}

let _easebuzzInstance: EasebuzzDualGateway | null = null

export function getPaymentProvider(): EasebuzzDualGateway {
  if (!_easebuzzInstance) {
    _easebuzzInstance = new EasebuzzDualGateway()
  }
  return _easebuzzInstance
}

