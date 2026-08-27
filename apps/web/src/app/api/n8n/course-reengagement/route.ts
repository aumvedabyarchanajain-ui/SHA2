import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'

function verifyAuth(req: NextRequest): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET
  if (!secret) return true
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

/**
 * GET: Queries students with no lesson activity for >= days (default 4 days)
 */
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '4', 10)
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Find active enrollments where progress is active and last activity before cutoff
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

    const stalledStudents = enrollments
      .filter((e: any) => e.user?.phone)
      .map((e: any) => ({
        enrollmentId: e.id,
        userId: e.user.id,
        firstName: e.user.name?.split(' ')[0] || 'Student',
        email: e.user.email,
        phone: e.user.phone,
        courseId: e.course.id,
        courseTitle: e.course.title,
        lastCompletedLessonTitle: 'Module Checkpoint',
        nextLessonSlug: `/courses/${e.course.slug}/learn`,
        daysInactive: Math.floor((Date.now() - new Date(e.updatedAt).getTime()) / (24 * 60 * 60 * 1000)),
      }))

    return NextResponse.json({
      success: true,
      count: stalledStudents.length,
      stalledStudents,
    })
  } catch (error: any) {
    console.error('[n8n/course-reengagement GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stalled students' }, { status: 500 })
  }
}

/**
 * POST: Logs re-engagement nudge dispatch
 */
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { enrollmentId, userId, nudgeType, timestamp } = body

    await prisma.event.create({
      data: {
        eventName: 'course.reengagement_nudged',
        userId: userId || undefined,
        payload: {
          enrollmentId,
          nudgeType: nudgeType || 'whatsapp_voice_memo_reengagement',
          timestamp: timestamp || new Date().toISOString(),
        },
        source: 'n8n_wf5',
        forwarded: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[n8n/course-reengagement POST] Error:', error)
    return NextResponse.json({ error: 'Failed to record nudge' }, { status: 500 })
  }
}
