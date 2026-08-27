import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'
import { getPaymentProvider } from '@/lib/payment/easebuzz'
import { syncBookingToGoogleCalendar } from '@/lib/calendar/google-calendar'
import { generatePreSessionBrief } from '@/lib/briefs/brief-generator'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    let payload: Record<string, unknown> = {}
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      formData.forEach((val, key) => {
        payload[key] = val.toString()
      })
    } else {
      payload = await req.json().catch(() => ({}))
    }

    const txnid = (payload.txnid as string) || (payload.order_id as string) || ''
    const easepayid = (payload.easepayid as string) || (payload.payment_id as string) || `tx_${txnid}`
    const eventId = easepayid || txnid

    if (!eventId) {
      return NextResponse.json({ error: 'Missing transaction identifier (txnid/easepayid)' }, { status: 400 })
    }

    // ── 1. IDEMPOTENCY GUARD ──────────────────────────────────────────
    // Check if this webhook event was already processed to prevent double fulfillment
    try {
      const existingLog = await prisma.webhookEventLog.findUnique({
        where: { eventId },
      })

      if (existingLog && existingLog.status === 'PROCESSED') {
        console.log(`[Easebuzz Webhook] Idempotent skip: Event ${eventId} already processed.`)
        return NextResponse.json({
          ok: true,
          status: 'ignored_duplicate',
          message: 'Webhook already processed idempotently',
        })
      }

      if (!existingLog) {
        await prisma.webhookEventLog.create({
          data: {
            gateway: (payload.key as string)?.includes('sec') ? 'EASEBUZZ_SECONDARY' : 'EASEBUZZ_PRIMARY',
            eventId,
            eventType: (payload.status as string) === 'success' ? 'payment.success' : 'payment.failed',
            payload: JSON.parse(JSON.stringify(payload)),
            status: 'PROCESSING',
          },
        }).catch(err => {
          console.warn('[Easebuzz Webhook] Warning creating WebhookEventLog:', err)
        })
      }
    } catch (dbErr) {
      console.warn('[Easebuzz Webhook] DB idempotency check warning:', dbErr)
    }

    // ── 2. SIGNATURE & HASH VERIFICATION ──────────────────────────────
    const hmacHeader = req.headers.get('x-easebuzz-signature') || req.headers.get('x-webhook-signature') || undefined
    const paymentProvider = getPaymentProvider()

    let webhookResult
    try {
      webhookResult = await paymentProvider.processWebhook(payload, hmacHeader)
    } catch (verifyErr: unknown) {
      console.error('[Easebuzz Webhook] Verification failed:', verifyErr)
      return NextResponse.json(
        { error: 'Webhook signature verification failed', details: verifyErr instanceof Error ? verifyErr.message : String(verifyErr) },
        { status: 400 }
      )
    }

    if (!webhookResult) {
      return NextResponse.json({ error: 'Unable to parse webhook payload' }, { status: 400 })
    }

    const { orderId, status, gateway } = webhookResult
    console.log(`[Easebuzz Webhook] Verified event for order ${orderId}, status=${status}, gateway=${gateway}`)

    // ── 3. STATE MACHINE TRANSITION ──────────────────────────────────
    const numericOrderId = parseInt(String(orderId), 10)
    let order: any = null
    try {
      order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(isNaN(numericOrderId) ? [] : [{ id: numericOrderId }]),
            { orderNumber: String(orderId) },
            { easebuzzOrderId: txnid },
            { gatewayOrderId: txnid },
          ],
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            include: {
              portalData: true,
            },
          },
        },
      })
    } catch (orderLookupErr) {
      console.warn('[Easebuzz Webhook] Order query warning:', orderLookupErr)
    }

    if (order) {
      if (status === 'SUCCESS') {
        // Update Order to PAID
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            easebuzzPaymentId: easepayid,
            gatewayPaymentId: easepayid,
            paymentGateway: gateway.includes('SECONDARY') ? 'EASEBUZZ_SECONDARY' : 'EASEBUZZ_PRIMARY',
            gateway,
            activationGuideSent: true,
            paymentMeta: JSON.parse(JSON.stringify(payload)),
          },
        }).catch(err => console.error('[Easebuzz Webhook] Failed to update order to PAID:', err))

        // Check for 1:1 Consultation / Service Booking items in Order
        const serviceItems = order.items.filter(
          (item: any) => item.itemType === 'SERVICE' || item.product?.productType === 'service'
        )

        for (const sItem of serviceItems) {
          try {
            const itemName: string = sItem.name ?? sItem.title ?? 'Consultation Session'
            const practitionerName: 'Archana Jain' | 'Sejal Jain' | 'Both (Dual Synergy)' = itemName.includes('Archana')
              ? 'Archana Jain'
              : itemName.includes('Sejal')
                ? 'Sejal Jain'
                : 'Both (Dual Synergy)'

            const serviceType = practitionerName === 'Archana Jain'
              ? 'ASTROLOGY_ARCHANA'
              : practitionerName === 'Sejal Jain'
                ? 'SOMATIC_SEJAL'
                : 'DUAL_SYNERGY'

            // Schedule session
            const startTime = new Date(Date.now() + 24 * 3600_000) // Default or client specified
            const endTime = new Date(startTime.getTime() + 60 * 60_000)

            const serviceBooking = await prisma.serviceBooking.create({
              data: {
                bookingReference: `BK-${order.orderNumber || order.id}-${Date.now().toString().slice(-4)}`,
                userId: order.userId || 'guest_user',
                practitionerName,
                serviceType: serviceType as any,
                status: 'SCHEDULED',
                scheduledStartTime: startTime,
                scheduledEndTime: endTime,
                feeINR: sItem.totalPriceINR || 3500,
                orderId: String(order.id),
              },
            })

            // Trigger Google Calendar Workspace synchronization
            const calendarResult = await syncBookingToGoogleCalendar({
              bookingId: serviceBooking.id,
              practitioner: practitionerName,
              serviceTitle: itemName,
              clientName: order.customerName || 'Aumveda Seeker',
              clientEmail: order.customerEmail || '',
              clientPhone: order.customerPhone || undefined,
              startTime,
              endTime,
              portalSummary: order.user?.portalData ? {
                chakra: order.user.portalData.chakraSelected || undefined,
                archetype: order.user.portalData.archetypeSelected || undefined,
                intention: order.user.portalData.intentionText || undefined,
              } : undefined,
            })

            if (calendarResult.meetingUrl) {
              await prisma.serviceBooking.update({
                where: { id: serviceBooking.id },
                data: {
                  meetingUrl: calendarResult.meetingUrl,
                  calEventId: calendarResult.calendarEventId,
                },
              })
            }

            // Generate Pre-Session Astrological / Somatic Brief
            if (order.userId) {
              await generatePreSessionBrief({
                bookingId: serviceBooking.id,
                orderId: String(order.id),
                userId: order.userId,
                practitionerName,
                serviceType,
                googleCalendarEventId: calendarResult.calendarEventId,
              })
            }
          } catch (sessionErr) {
            console.error('[Easebuzz Webhook] Error provisioning consultation session:', sessionErr)
          }
        }

        // Check for Course enrollments
        const courseItems = order.items.filter((item: any) => item.itemType === 'COURSE' || item.courseId)
        for (const cItem of courseItems) {
          if (cItem.courseId && order.userId) {
            await prisma.courseEnrollment.upsert({
              where: {
                userId_courseId: {
                  userId: order.userId,
                  courseId: cItem.courseId,
                },
              },
              create: {
                userId: order.userId,
                courseId: cItem.courseId,
                status: 'ACTIVE',
                orderId: String(order.id),
              },
              update: {
                status: 'ACTIVE',
              },
            }).catch(e => console.error('[Easebuzz Webhook] Course enrollment error:', e))
          }
        }
      } else if (status === 'CANCELLED' || status === 'FAILED') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
            paymentStatus: status === 'CANCELLED' ? 'CANCELLED' : 'FAILED',
            paymentMeta: JSON.parse(JSON.stringify(payload)),
          },
        }).catch(err => console.error('[Easebuzz Webhook] Failed to update failed order:', err))
      }
    }

    // ── 4. MARK WEBHOOK LOG AS PROCESSED ─────────────────────────────
    try {
      await prisma.webhookEventLog.update({
        where: { eventId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      })
    } catch {
      // Non-critical if table absent in local fallback
    }

    return NextResponse.json({
      ok: true,
      status: 'processed',
      orderId: order?.id || orderId,
      gateway,
      paymentStatus: status,
    })
  } catch (err: unknown) {
    console.error('[Easebuzz Webhook Exception]:', err)
    return NextResponse.json(
      { error: 'Internal webhook handling error', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Easebuzz callback redirect after completion can arrive as GET
  const searchParams = req.nextUrl.searchParams
  const txnid = searchParams.get('txnid') || ''
  const status = searchParams.get('status') || 'pending'
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aumveda.com'

  return NextResponse.redirect(`${siteUrl}/checkout/confirmation?txnid=${txnid}&status=${status}`)
}
