import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'
import { sendDeviceNotification } from '@/lib/notifications/device-push'
import { sendEmail } from '@/lib/email'
import { getDailyDoseEmailHtml } from '@/lib/notifications/email-templates'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET
  if (!secret) return true // Allow local dev
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // 1. Fetch today's Daily Dose
    const dose = (await prisma.dailyDose.findFirst({
      where: { scheduledFor: { gte: startOfDay } },
      orderBy: { scheduledFor: 'asc' },
    })) || (await prisma.dailyDose.findFirst({ orderBy: { id: 'desc' } }))

    const doseTitle = dose?.title || 'Morning Somatic Alignment & Breathwork'
    const doseChakra = dose?.chakra || 'Anahata (Heart Chakra)'
    const doseSlug = dose?.slug || 'morning-alignment'
    const doseAudio = dose?.audioUrl || 'https://assets.aumveda.com/audio/daily-dose-default.mp3'
    const ritualUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.aumveda.com'}/daily-dose/${doseSlug}`

    // 2. Query users with verified accounts or phone/email
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dominantChakra: true,
      },
      take: 150,
    })

    let pushCount = 0
    let emailCount = 0

    for (const user of users) {
      const firstName = user.name?.split(' ')[0] || 'Seeker'

      // A. Device Push Notification Hit
      await sendDeviceNotification({
        userId: user.id,
        title: `✨ Your Daily Dose is Ready (${doseChakra})`,
        body: `${firstName}, begin your sacred morning practice: ${doseTitle}`,
        clickActionUrl: ritualUrl,
      }).catch((err) => console.warn('[Daily Dose Push Error]:', err))
      pushCount++

      // B. Email Hit
      if (user.email) {
        const html = getDailyDoseEmailHtml({
          name: firstName,
          chakra: doseChakra,
          title: doseTitle,
          audioUrl: doseAudio,
          ritualUrl,
        })

        await sendEmail({
          to: user.email,
          subject: `✨ Morning Alignment: ${doseTitle} • Aumveda Daily Dose`,
          html,
        }).catch((err) => console.warn('[Daily Dose Email Error]:', err))
        emailCount++
      }
    }

    // 3. Log event audit record in DB
    await prisma.event.create({
      data: {
        eventName: 'daily_dose.broadcast_completed',
        payload: {
          doseTitle,
          doseChakra,
          pushDispatched: pushCount,
          emailsDispatched: emailCount,
          timestamp: new Date().toISOString(),
        },
        source: 'cron_scheduler',
        forwarded: true,
      },
    })

    return NextResponse.json({
      success: true,
      doseTitle,
      doseChakra,
      recipients: users.length,
      pushCount,
      emailCount,
    })
  } catch (error: any) {
    console.error('[cron/daily-dose-broadcast] Error:', error)
    return NextResponse.json({ error: 'Daily dose broadcast failed' }, { status: 500 })
  }
}
