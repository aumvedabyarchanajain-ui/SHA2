import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@aumveda/db'
import { z } from 'zod'

const schema = z.object({
  userId: z.string().optional().nullable(),
  eventName: z.string().min(1),
  payload: z.any().optional(),
  source: z.string().default('client'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }

    const { eventName, payload, source } = parsed.data

    const event = await prisma.event.create({
      data: {
        userId: session.user.id,
        eventName,
        payload: payload || {},
        source,
      },
    })

    // Task 5.3: n8n WhatsApp re-engagement for drop-offs at Steps 2-5.
    // Dispatch only when the webhook is configured — never log lead emails.
    if (eventName === 'portal.dropoff') {
      const step = payload?.step
      const email = payload?.email
      const sessionId = payload?.sessionId

      if (step >= 2 && step <= 5 && process.env.N8N_WHATSAPP_WEBHOOK && email && sessionId) {
        try {
          await fetch(process.env.N8N_WHATSAPP_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, step, sessionId }),
            signal: AbortSignal.timeout(8000),
          })
        } catch (webhookErr) {
          console.error('N8N RE-ENGAGEMENT DISPATCH FAILED:', webhookErr)
        }
      }
    }

    // Forward to GTM Server Container & Meta CAPI / GA4
    const { dispatchServerEvent } = await import('@/lib/tracking/gtm-server')
    dispatchServerEvent({
      eventName,
      eventId: event.eventId,
      user: {
        userId: session.user.id,
        email: session.user.email,
        clientIp: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
        userAgent: req.headers.get('user-agent') || null,
      },
      customData: payload || {},
    }).catch(() => {})

    return NextResponse.json({ ok: true, eventId: event.eventId })
  } catch (error: any) {
    console.error('ANALYTICS TRACK API ERROR:', error)
    return NextResponse.json({ error: 'Failed to record tracking event' }, { status: 500 })
  }
}
