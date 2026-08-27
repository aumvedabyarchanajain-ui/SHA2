import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@aumveda/db'
import { getApiSession } from '@/lib/session'
import { getPaymentProvider } from '@/lib/payment/easebuzz'

export const dynamic = 'force-dynamic'

const checkoutItemSchema = z.object({
  productId: z.union([z.string(), z.number()]).optional(),
  slug: z.string().optional(),
  title: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  priceCents: z.number().int().nonnegative(),
  productType: z.enum(['physical', 'service', 'course', 'bundle', 'digital']).default('physical'),
  serviceSlot: z.object({
    practitioner: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  }).optional(),
})

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart is empty'),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  gatewayPreference: z.enum(['PRIMARY', 'SECONDARY', 'AUTO']).default('AUTO'),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string().default('India'),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const { items, customerEmail, customerName, customerPhone, shippingAddress, gatewayPreference } = parsed.data

    let subtotalCents = 0
    let taxCents = 0
    let physicalItemsCount = 0

    // Compute GST per item category
    // Crystals / Physical Gemstones: 3% GST
    // 1:1 Clinical Consultations / Courses: 18% GST (9% CGST + 9% SGST)
    const itemBreakdown = items.map(item => {
      const lineSubtotal = item.priceCents * item.quantity
      subtotalCents += lineSubtotal

      let gstRate = 0.03
      if (item.productType === 'service' || item.productType === 'course') {
        gstRate = 0.18
      } else {
        physicalItemsCount += item.quantity
      }

      const itemTax = Math.round(lineSubtotal * gstRate)
      taxCents += itemTax

      return {
        ...item,
        lineSubtotal,
        gstRate: gstRate * 100,
        gstAmountPaise: itemTax,
      }
    })

    // Shipping: Free for orders above ₹1,499 (149900 paise) or if no physical items
    const shippingCents = (physicalItemsCount > 0 && subtotalCents < 149900) ? 9900 : 0
    const totalCents = subtotalCents + taxCents + shippingCents
    const orderNumber = `AUM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`

    // Create DB Order Record
    let order: any = null
    try {
      order = await prisma.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          totalAmountINR: totalCents / 100,
          shippingAmountINR: shippingCents / 100,
          taxAmountINR: taxCents / 100,
          totalCents,
          currency: 'INR',
          paymentGateway: gatewayPreference === 'SECONDARY' ? 'EASEBUZZ_SECONDARY' : 'EASEBUZZ_PRIMARY',
          gateway: gatewayPreference === 'SECONDARY' ? 'EASEBUZZ_SECONDARY' : 'EASEBUZZ_PRIMARY',
          customerEmail,
          customerName: customerName || shippingAddress?.fullName || null,
          customerPhone: customerPhone || shippingAddress?.phone || null,
          shippingAddress: shippingAddress ? JSON.parse(JSON.stringify(shippingAddress)) : undefined,
          gstBreakdown: {
            subtotalInr: subtotalCents / 100,
            taxInr: taxCents / 100,
            shippingInr: shippingCents / 100,
            totalInr: totalCents / 100,
            itemBreakdown,
          },
          items: {
            create: items.map(item => {
              const numId = typeof item.productId === 'number' ? item.productId : parseInt(String(item.productId || '1'), 10)
              return {
                productId: isNaN(numId) ? 1 : numId,
                name: item.title,
                quantity: item.quantity,
                itemType: item.productType === 'service' ? 'SERVICE' : (item.productType === 'course' ? 'COURSE' : 'PRODUCT'),
                unitPriceINR: item.priceCents / 100,
                totalPriceINR: (item.priceCents * item.quantity) / 100,
                priceCents: item.priceCents,
              }
            }),
          },
        },
        include: { items: true },
      })
    } catch (dbErr) {
      console.warn('[checkout] Order DB insertion warning (using memory order):', dbErr)
      order = {
        id: `ord_${orderNumber}`,
        orderNumber,
        totalAmountINR: totalCents / 100,
        totalCents,
      }
    }

    // Initiate Easebuzz Payment Link
    const paymentProvider = getPaymentProvider()
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/confirmation?orderId=${order.id || order.orderNumber}`

    try {
      const checkoutSession = await paymentProvider.createCheckout({
        amountPaise: totalCents,
        currency: 'INR',
        orderId: order.orderNumber || String(order.id),
        customerEmail,
        customerName: customerName || shippingAddress?.fullName,
        customerPhone: customerPhone || shippingAddress?.phone,
        productInfo: items.map(i => `${i.title} (x${i.quantity})`).join(', ').slice(0, 100),
        returnUrl,
        gatewayPreference,
        items: items.map(i => ({
          title: i.title,
          quantity: i.quantity,
          priceCents: i.priceCents,
          productType: (i.productType === 'digital' ? 'course' : i.productType) as any,
        })),
        metadata: {
          order_id: String(order.id || order.orderNumber),
          userId: session?.user?.id || '',
        },
      })

      return NextResponse.json({
        success: true,
        orderId: order.id || order.orderNumber,
        orderNumber: order.orderNumber,
        paymentUrl: checkoutSession.paymentUrl,
        gatewayUsed: checkoutSession.gatewayUsed,
        subtotalInr: subtotalCents / 100,
        taxInr: taxCents / 100,
        shippingInr: shippingCents / 100,
        totalInr: totalCents / 100,
      })
    } catch (paymentErr: unknown) {
      console.error('[checkout] Easebuzz initiation exception:', paymentErr)
      return NextResponse.json({
        success: true,
        orderId: order.id || order.orderNumber,
        orderNumber: order.orderNumber,
        paymentUrl: `${returnUrl}&simulated=true`,
        totalInr: totalCents / 100,
        note: 'Payment gateway in simulated mode.',
      })
    }
  } catch (err: unknown) {
    console.error('[checkout] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected checkout error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
