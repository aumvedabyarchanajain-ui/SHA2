import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@aumveda/db'
import { dispatchServerEvent, generateEventId, ServerEventPayload } from '@/lib/tracking/gtm-server'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { name, eventName, payload, customData, user, eventId: clientEventId, eventSourceUrl } = body

    const finalEventName = String(eventName || name || '').trim()
    if (!finalEventName) {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    const eventId = String(clientEventId || generateEventId())
    const userId = session?.user?.id || user?.userId || null
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null
    const userAgent = req.headers.get('user-agent') || null

    const eventRecord = await prisma.event.create({
      data: {
        eventId,
        userId: userId ?? undefined,
        eventName: finalEventName,
        payload: payload || customData || {},
        source: 'client',
        ipAddress: clientIp,
        userAgent,
        forwarded: false,
      },
    })

    // Server-Side GTM Dispatch Payload
    const serverPayload: ServerEventPayload = {
      eventName: finalEventName,
      eventId: eventRecord.eventId,
      eventSourceUrl: eventSourceUrl || req.headers.get('referer') || undefined,
      user: {
        userId,
        email: session?.user?.email || user?.email || null,
        phone: user?.phone || null,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        clientIp,
        userAgent,
        fbp: user?.fbp || null,
        fbc: user?.fbc || null,
        clientId: user?.clientId || null,
      },
      customData: customData || payload || {},
    }

    // Forward asynchronously to GTM Server Container / Meta CAPI / GA4
    dispatchServerEvent(serverPayload)
      .then(async (result) => {
        if (result.dispatchedToGtm || result.metaCapiSuccess || result.ga4Success) {
          await prisma.event.update({
            where: { id: eventRecord.id },
            data: { forwarded: true },
          }).catch(() => {})
        }
      })
      .catch((err) => {
        console.warn(`[Track Event API] Dispatch warning for ${finalEventName}:`, err)
      })

    return NextResponse.json({
      success: true,
      eventId: eventRecord.eventId,
    })
  } catch (error: any) {
    console.error('[Track Event API] Error:', error)
    return NextResponse.json({ error: 'Failed to record tracking event' }, { status: 500 })
  }
}
