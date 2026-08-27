import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'

function verifyAuth(req: NextRequest): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET
  if (!secret) return true
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

/**
 * POST: Handles both triggering dispatch toward n8n and recording n8n fulfillment callbacks
 */
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, orderId, shiprocketOrderId, status, timestamp, triggerWebhook } = body

    // 1. If requested as internal trigger to dispatch to n8n WF-4
    if (triggerWebhook && orderId) {
      const numOrderId = typeof orderId === 'number' ? orderId : parseInt(String(orderId), 10)
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(isNaN(numOrderId) ? [] : [{ id: numOrderId }]),
            { orderNumber: String(orderId) },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              dominantChakra: true,
            },
          },
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

      const hasPhysicalCrystals = crystalItems.length > 0
      const n8nWebhookUrl = process.env.N8N_CRYSTAL_FULFILLMENT_WEBHOOK_URL

      const n8nPayload = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        hasPhysicalCrystals,
        totalAmountINR: order.totalAmountINR ? Number(order.totalAmountINR) : order.totalCents / 100,
        dominantChakra: order.user?.dominantChakra || 'Heart Chakra',
        customer: {
          name: order.customerName || order.user?.name || 'Valued Customer',
          email: order.customerEmail || order.user?.email || '',
          phone: order.customerPhone || order.user?.phone || '',
        },
        shippingAddress: {
          line1: (order.shippingAddress as any)?.addressLine1 || (order.shippingAddress as any)?.line1 || 'Primary Sanctum Address',
          city: (order.shippingAddress as any)?.city || 'Mumbai',
          state: (order.shippingAddress as any)?.state || 'Maharashtra',
          pincode: (order.shippingAddress as any)?.pincode || '400001',
        },
        orderItems: crystalItems.map((item) => ({
          name: item.product?.title || item.product?.name || item.name || 'Consecrated Crystal',
          sku: item.product?.sku || item.product?.slug || item.sku || 'SKU-CRYSTAL',
          units: item.quantity,
          selling_price: item.unitPriceINR ? Number(item.unitPriceINR) : (item.priceCents || 0) / 100,
        })),
      }

      if (n8nWebhookUrl) {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
          signal: AbortSignal.timeout(5000),
        }).catch((err) => console.warn('[n8n/crystal-fulfillment] Webhook dispatch warning:', err))
      }

      return NextResponse.json({ success: true, dispatched: Boolean(n8nWebhookUrl), payload: n8nPayload })
    }

    // 2. Callback from n8n logging Shiprocket dispatch & activation email
    if (action === 'log_fulfillment' && orderId) {
      await prisma.event.create({
        data: {
          eventName: 'order.crystal_fulfillment_dispatched',
          payload: {
            orderId,
            shiprocketOrderId,
            status: status || 'DISPATCHED_TO_COURIER',
            timestamp: timestamp || new Date().toISOString(),
          },
          source: 'n8n_wf4',
          forwarded: true,
        },
      })

      return NextResponse.json({ success: true, logged: true })
    }

    return NextResponse.json({ success: true, message: 'No action performed' })
  } catch (error: any) {
    console.error('[n8n/crystal-fulfillment POST] Error:', error)
    return NextResponse.json({ error: 'Failed to process crystal fulfillment' }, { status: 500 })
  }
}
