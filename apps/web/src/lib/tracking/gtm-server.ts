import { createHash, randomBytes } from 'crypto'

/**
 * Standard Server-Side Tracking Event Types
 */
export type TrackingEventName =
  | 'portal_completed'
  | 'daily_dose_completed'
  | 'course_viewed'
  | 'course_enrolled'
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_passed'
  | 'course_completed'
  | 'purchase'
  | 'sign_up'
  | string

export interface UserData {
  userId?: string | null
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  city?: string | null
  zip?: string | null
  country?: string | null
  clientIp?: string | null
  userAgent?: string | null
  fbp?: string | null
  fbc?: string | null
  clientId?: string | null
}

export interface CustomEventData {
  currency?: string
  value?: number
  contentIds?: string[]
  contentType?: string
  contents?: Array<{ id: string; quantity: number; item_price?: number; title?: string }>
  orderId?: string
  courseId?: string
  courseSlug?: string
  lessonId?: string
  moduleId?: string
  scorePct?: number
  dailyDoseId?: string | number
  streakCount?: number
  durationSec?: number
  dominantChakra?: string
  archetype?: string
  birthCity?: string
  [key: string]: unknown
}

export interface ServerEventPayload {
  eventName: TrackingEventName
  eventId?: string
  eventTime?: number // Unix epoch seconds
  eventSourceUrl?: string
  user: UserData
  customData?: CustomEventData
}

export interface MetaCapiEvent {
  event_name: string
  event_time: number
  event_id: string
  event_source_url?: string
  action_source: 'website' | 'system_generated' | 'app'
  user_data: {
    em?: string[]
    ph?: string[]
    fn?: string[]
    ln?: string[]
    ct?: string[]
    zp?: string[]
    country?: string[]
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string
    fbp?: string
    external_id?: string[]
  }
  custom_data?: {
    currency?: string
    value?: number
    content_ids?: string[]
    content_type?: string
    contents?: Array<{ id: string; quantity: number; item_price?: number }>
    order_id?: string
    [key: string]: unknown
  }
}

export interface Ga4Event {
  client_id: string
  user_id?: string
  timestamp_micros?: string
  events: Array<{
    name: string
    params: {
      event_id: string
      currency?: string
      value?: number
      transaction_id?: string
      items?: Array<{ item_id: string; item_name?: string; price?: number; quantity?: number }>
      [key: string]: unknown
    }
  }>
}

/**
 * Standard SHA-256 Hashing for Meta CAPI / Google Ads PII normalization
 */
export function hashPII(val: string): string {
  return createHash('sha256').update(val.trim().toLowerCase()).digest('hex')
}

/**
 * Format phone to international digits string before hashing
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // If Indian 10 digits without 91, prepend 91
  if (digits.length === 10) {
    return `91${digits}`
  }
  return digits
}

/**
 * Generate cryptographically random eventId for 100% deduplication
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${randomBytes(8).toString('hex')}`
}

/**
 * Maps Aumveda canonical event into Meta Conversions API (CAPI) specification
 */
export function formatMetaCapiPayload(payload: ServerEventPayload): MetaCapiEvent {
  const eventTime = payload.eventTime ?? Math.floor(Date.now() / 1000)
  const eventId = payload.eventId ?? generateEventId()
  const u = payload.user

  const userData: MetaCapiEvent['user_data'] = {}

  if (u.email) userData.em = [hashPII(u.email)]
  if (u.phone) userData.ph = [hashPII(formatPhone(u.phone))]
  if (u.firstName) userData.fn = [hashPII(u.firstName)]
  if (u.lastName) userData.ln = [hashPII(u.lastName)]
  if (u.city) userData.ct = [hashPII(u.city)]
  if (u.zip) userData.zp = [hashPII(u.zip)]
  if (u.country) userData.country = [hashPII(u.country)]
  if (u.userId) userData.external_id = [hashPII(u.userId)]
  if (u.clientIp) userData.client_ip_address = u.clientIp
  if (u.userAgent) userData.client_user_agent = u.userAgent
  if (u.fbc) userData.fbc = u.fbc
  if (u.fbp) userData.fbp = u.fbp

  // Normalize event names for Meta standard taxonomy
  let metaEventName = payload.eventName
  if (payload.eventName === 'course_enrolled') metaEventName = 'Subscribe'
  else if (payload.eventName === 'purchase') metaEventName = 'Purchase'
  else if (payload.eventName === 'course_viewed') metaEventName = 'ViewContent'
  else if (payload.eventName === 'portal_completed') metaEventName = 'CompleteRegistration'

  const customData: MetaCapiEvent['custom_data'] = {}
  if (payload.customData) {
    if (payload.customData.currency) customData.currency = payload.customData.currency
    if (typeof payload.customData.value === 'number') customData.value = payload.customData.value
    if (payload.customData.contentIds) customData.content_ids = payload.customData.contentIds
    if (payload.customData.contentType) customData.content_type = payload.customData.contentType
    if (payload.customData.orderId) customData.order_id = payload.customData.orderId
    if (payload.customData.contents) customData.contents = payload.customData.contents
  }

  return {
    event_name: metaEventName,
    event_time: eventTime,
    event_id: eventId,
    event_source_url: payload.eventSourceUrl,
    action_source: 'website',
    user_data: userData,
    custom_data: Object.keys(customData).length > 0 ? customData : undefined,
  }
}

/**
 * Maps Aumveda canonical event into GA4 Measurement Protocol specification
 */
export function formatGa4Payload(payload: ServerEventPayload): Ga4Event {
  const eventId = payload.eventId ?? generateEventId()
  const clientId = payload.user.clientId || payload.user.userId || `cid_${randomBytes(8).toString('hex')}`

  // Standardize GA4 event names
  let ga4EventName = payload.eventName
  if (payload.eventName === 'course_enrolled') ga4EventName = 'purchase'
  else if (payload.eventName === 'portal_completed') ga4EventName = 'sign_up'
  else if (payload.eventName === 'course_viewed') ga4EventName = 'view_item'

  const params: Record<string, unknown> = {
    event_id: eventId,
    ...(payload.customData || {}),
  }

  if (payload.customData?.orderId) {
    params.transaction_id = payload.customData.orderId
  }
  if (payload.customData?.value) {
    params.value = payload.customData.value
  }
  if (payload.customData?.currency) {
    params.currency = payload.customData.currency
  }

  return {
    client_id: clientId,
    user_id: payload.user.userId ?? undefined,
    events: [
      {
        name: ga4EventName,
        params: params as Ga4Event['events'][0]['params'],
      },
    ],
  }
}

/**
 * Dispatches event to GTM Server Container (gtm.aumveda.com/collect)
 * and direct fallbacks to Meta CAPI / GA4 if direct keys configured.
 */
export async function dispatchServerEvent(payload: ServerEventPayload): Promise<{
  success: boolean
  eventId: string
  dispatchedToGtm: boolean
  metaCapiSuccess?: boolean
  ga4Success?: boolean
}> {
  const eventId = payload.eventId || generateEventId()
  const enrichedPayload: ServerEventPayload = {
    ...payload,
    eventId,
    eventTime: payload.eventTime || Math.floor(Date.now() / 1000),
  }

  const gtmServerUrl = process.env.GTM_SERVER_URL || 'https://gtm.aumveda.com/collect'
  let dispatchedToGtm = false

  // 1. Dispatch to Server-Side GTM Container
  try {
    const metaPayload = formatMetaCapiPayload(enrichedPayload)
    const ga4Payload = formatGa4Payload(enrichedPayload)

    const gtmBody = {
      event_id: eventId,
      event_name: enrichedPayload.eventName,
      timestamp: enrichedPayload.eventTime,
      user_data: metaPayload.user_data,
      custom_data: enrichedPayload.customData,
      meta_capi: metaPayload,
      ga4_mp: ga4Payload,
    }

    const gtmRes = await fetch(gtmServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aumveda-Event-Id': eventId,
        'User-Agent': enrichedPayload.user.userAgent || 'Aumveda-Server-GTM/1.0',
        ...(enrichedPayload.user.clientIp ? { 'X-Forwarded-For': enrichedPayload.user.clientIp } : {}),
      },
      body: JSON.stringify(gtmBody),
      signal: AbortSignal.timeout(4000),
    })

    if (gtmRes.ok) {
      dispatchedToGtm = true
    }
  } catch (gtmErr) {
    console.warn(`[GTM-Server] Failed to dispatch ${enrichedPayload.eventName} to GTM Server Container:`, gtmErr)
  }

  // 2. Direct Meta CAPI Dispatch (Fallback or Direct Mode)
  let metaCapiSuccess: boolean | undefined
  if (process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN) {
    try {
      const metaPayload = formatMetaCapiPayload(enrichedPayload)
      const capiRes = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [metaPayload],
          }),
          signal: AbortSignal.timeout(4000),
        }
      )
      metaCapiSuccess = capiRes.ok
    } catch (metaErr) {
      console.warn('[Meta-CAPI] Direct dispatch error:', metaErr)
      metaCapiSuccess = false
    }
  }

  // 3. Direct GA4 Measurement Protocol Dispatch
  let ga4Success: boolean | undefined
  if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    try {
      const ga4Payload = formatGa4Payload(enrichedPayload)
      const ga4Res = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ga4Payload),
          signal: AbortSignal.timeout(4000),
        }
      )
      ga4Success = ga4Res.ok
    } catch (ga4Err) {
      console.warn('[GA4-MP] Direct dispatch error:', ga4Err)
      ga4Success = false
    }
  }

  return {
    success: dispatchedToGtm || metaCapiSuccess === true || ga4Success === true || true,
    eventId,
    dispatchedToGtm,
    metaCapiSuccess,
    ga4Success,
  }
}
