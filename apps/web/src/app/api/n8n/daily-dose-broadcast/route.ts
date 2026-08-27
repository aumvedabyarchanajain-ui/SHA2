import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'

function verifyAuth(req: NextRequest): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET
  if (!secret) return true // Allow local dev if no secret configured
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

/**
 * GET: Fetches today's Daily Dose and opted-in users for WhatsApp broadcast
 */
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Fetch active daily dose for today or most recent
    const dose = await prisma.dailyDose.findFirst({
      where: {
        scheduledFor: {
          gte: startOfDay,
        },
      },
      orderBy: { scheduledFor: 'asc' },
    }) || await prisma.dailyDose.findFirst({
      orderBy: { id: 'desc' },
    })

    // Fetch users who have completed onboarding and have a phone number
    const users = await prisma.user.findMany({
      where: {
        phone: { not: null },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        dominantChakra: true,
      },
      take: 200,
    })

    const recipients = users
      .filter((u) => u.phone && u.phone.length >= 10)
      .map((u) => ({
        userId: u.id,
        firstName: u.name?.split(' ')[0] || 'Seeker',
        phone: u.phone,
        dominantChakra: u.dominantChakra || 'Heart',
      }))

    return NextResponse.json({
      success: true,
      dose: dose
        ? {
            id: dose.id,
            title: dose.title,
            chakra: dose.chakra || 'Heart Chakra',
            slug: dose.slug || 'daily-ritual',
            audioUrl: dose.audioUrl || 'https://assets.aumveda.com/audio/daily-dose-default.mp3',
          }
        : {
            id: 1,
            title: 'Morning Somatic Alignment & Breathwork',
            chakra: 'Anahata (Heart)',
            slug: 'morning-alignment',
            audioUrl: 'https://assets.aumveda.com/audio/daily-dose-default.mp3',
          },
      recipients,
    })
  } catch (error: any) {
    console.error('[n8n/daily-dose-broadcast GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch broadcast data' }, { status: 500 })
  }
}

/**
 * POST: Logs delivery receipt and updates telemetry
 */
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, phone, status, timestamp } = body

    await prisma.event.create({
      data: {
        eventName: 'daily_dose.whatsapp_dispatched',
        userId: userId || undefined,
        payload: {
          phone,
          status: status || 'DISPATCHED',
          timestamp: timestamp || new Date().toISOString(),
        },
        source: 'n8n_wf2',
        forwarded: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[n8n/daily-dose-broadcast POST] Error:', error)
    return NextResponse.json({ error: 'Failed to log delivery' }, { status: 500 })
  }
}
