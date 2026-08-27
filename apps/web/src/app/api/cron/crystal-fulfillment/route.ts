import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'
import { sendDeviceNotification } from '@/lib/notifications/device-push'
import { sendEmail } from '@/lib/email'
import { getCrystalActivationEmailHtml } from '@/lib/notifications/email-templates'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET
  if (!secret) return true
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const crystalItems = order.items.filter(
      (i) => (i.product && i.product.category?.toUpperCase() === 'CRYSTALS') || ((i.product?.title || i.product?.name || i.name || '').toLowerCase().includes('crystal'))
    )

    const customerName = order.user?.name || 'Valued Customer'
    const customerEmail = order.user?.email
    const dominantChakra = order.user?.dominantChakra || 'Heart Chakra'
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.aumveda.com'}/orders/${order.id}`

    // 1. Device Push Notification
    if (order.userId) {
      await sendDeviceNotification({
        userId: order.userId,
        title: '📦 Sacred Crystal Order Dispatched',
        body: `Your crystal order #${order.id} has been consecrated and dispatched with your activation ritual guide.`,
        clickActionUrl: trackingUrl,
      }).catch((err) => console.warn('[Crystal Push Error]:', err))
    }

    // 2. Email Hit: Consecrated Crystal Activation Ritual
    if (customerEmail) {
      const html = getCrystalActivationEmailHtml({
        name: customerName,
        orderId: String(order.id),
        dominantChakra,
        trackingUrl,
      })

      await sendEmail({
        to: customerEmail,
        subject: `🔮 Your Consecrated Crystal Activation Ritual • Order #${order.id}`,
        html,
      }).catch((err) => console.warn('[Crystal Email Error]:', err))
    }

    // 3. Log Fulfillment Event in DB
    await prisma.event.create({
      data: {
        eventName: 'order.crystal_fulfillment_completed',
        userId: order.userId || undefined,
        payload: {
          orderId: order.id,
          crystalCount: crystalItems.length,
          deliveredChannels: ['device_push', 'transactional_email'],
          timestamp: new Date().toISOString(),
        },
        source: 'automation_engine',
        forwarded: true,
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      crystalsFulfilled: crystalItems.length,
      notificationsSent: {
        push: Boolean(order.userId),
        email: Boolean(customerEmail),
      },
    })
  } catch (error: any) {
    console.error('[cron/crystal-fulfillment] Error:', error)
    return NextResponse.json({ error: 'Crystal fulfillment failed' }, { status: 500 })
  }
}
