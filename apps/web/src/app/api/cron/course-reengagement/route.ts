import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'
import { sendDeviceNotification } from '@/lib/notifications/device-push'
import { sendEmail } from '@/lib/email'
import { getCourseReengagementEmailHtml } from '@/lib/notifications/email-templates'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET
  if (!secret) return true
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '4', 10)
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        status: 'ACTIVE',
        updatedAt: {
          lte: cutoffDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      take: 100,
    })

    let pushCount = 0
    let emailCount = 0

    for (const enrollment of enrollments) {
      const user = enrollment.user
      const course = enrollment.course
      const firstName = user.name?.split(' ')[0] || 'Student'
      const resumeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.aumveda.com'}/courses/${course.slug}/learn`

      // 1. Device Push Notification
      await sendDeviceNotification({
        userId: user.id,
        title: `🧘 Return to Your Practice • ${course.title}`,
        body: `${firstName}, your somatic integration is calling you back. Resume your next lesson.`,
        clickActionUrl: resumeUrl,
      }).catch((err) => console.warn('[Course Nudge Push Error]:', err))
      pushCount++

      // 2. Email Hit
      if (user.email) {
        const html = getCourseReengagementEmailHtml({
          name: firstName,
          courseTitle: course.title,
          lastCompletedLessonTitle: 'Module Progress Checkpoint',
          resumeUrl,
        })

        await sendEmail({
          to: user.email,
          subject: `🧘 Reconnect with ${course.title} • Aumveda Wisdom`,
          html,
        }).catch((err) => console.warn('[Course Nudge Email Error]:', err))
        emailCount++
      }

      // 3. Log nudge in DB
      await prisma.event.create({
        data: {
          eventName: 'course.reengagement_nudged',
          userId: user.id,
          payload: {
            enrollmentId: enrollment.id,
            courseId: course.id,
            daysInactive: days,
            channel: 'push_and_email',
            timestamp: new Date().toISOString(),
          },
          source: 'cron_scheduler',
          forwarded: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      stalledCount: enrollments.length,
      pushCount,
      emailCount,
    })
  } catch (error: any) {
    console.error('[cron/course-reengagement] Error:', error)
    return NextResponse.json({ error: 'Course re-engagement cron failed' }, { status: 500 })
  }
}
