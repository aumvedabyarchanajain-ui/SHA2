export interface DeviceNotificationPayload {
  token?: string | string[]
  userId?: string
  title: string
  body: string
  icon?: string
  badge?: string
  clickActionUrl?: string
  data?: Record<string, string>
}

export interface PushResult {
  success: boolean
  deliveredCount: number
  simulated: boolean
  error?: string
}

/**
 * Dispatches Push Notification to User Device (FCM v1 / Web Push / APNs)
 */
export async function sendDeviceNotification(
  payload: DeviceNotificationPayload
): Promise<PushResult> {
  const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY
  const defaultIcon = 'https://assets.aumveda.com/icons/icon-192x192.png'
  const defaultBadge = 'https://assets.aumveda.com/icons/badge-72x72.png'

  const targetTokens = Array.isArray(payload.token)
    ? payload.token
    : payload.token
    ? [payload.token]
    : []

  // If no FCM key is configured in dev/staging, simulate gracefully
  if (!fcmServerKey) {
    console.log('\n┌────────────────────────────────────────────────────────┐')
    console.log(`│ [DEVICE PUSH SIMULATOR]                                │`)
    console.log(`│ User ID:   ${(payload.userId || 'Broadcast').padEnd(42)} │`)
    console.log(`│ Title:     ${payload.title.padEnd(42)} │`)
    console.log(`│ Body:      ${payload.body.padEnd(42)} │`)
    console.log(`│ Target URL: ${(payload.clickActionUrl || '/').padEnd(41)} │`)
    console.log('└────────────────────────────────────────────────────────┘\n')
    return {
      success: true,
      deliveredCount: targetTokens.length || 1,
      simulated: true,
    }
  }

  try {
    const fcmPayload = {
      registration_ids: targetTokens.length > 0 ? targetTokens : undefined,
      to: targetTokens.length === 1 ? targetTokens[0] : undefined,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || defaultIcon,
        click_action: payload.clickActionUrl || 'https://app.aumveda.com',
      },
      data: {
        ...(payload.data || {}),
        badge: payload.badge || defaultBadge,
        url: payload.clickActionUrl || 'https://app.aumveda.com',
      },
      priority: 'high',
    }

    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify(fcmPayload),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`[Device Push] FCM response error (${res.status}):`, errText)
      return { success: false, deliveredCount: 0, simulated: false, error: errText }
    }

    const data = await res.json()
    return {
      success: (data.success ?? 0) > 0,
      deliveredCount: data.success ?? targetTokens.length,
      simulated: false,
    }
  } catch (err: any) {
    console.error('[Device Push] Send exception:', err)
    return { success: false, deliveredCount: 0, simulated: false, error: err.message }
  }
}
