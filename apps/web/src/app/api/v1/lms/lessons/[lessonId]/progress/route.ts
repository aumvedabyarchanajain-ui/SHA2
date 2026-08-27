import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSession } from '@/lib/session'
import { updateLessonProgress, getLessonById } from '@/lib/lms-data'
import { verifyPlaybackToken } from '@/lib/lms-security'

export const dynamic = 'force-dynamic'

const progressSchema = z.object({
  token: z.string().optional(),
  watchTimeSeconds: z.number().min(0),
  lastPositionSec: z.number().min(0).optional(),
  durationSeconds: z.number().min(0).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  try {
    const session = await getApiSession()
    let userId = session?.user?.id || 'demo-client-user'

    const body = await req.json().catch(() => null)
    const parsed = progressSchema.safeParse(body ?? {})

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid body' },
        { status: 400 },
      )
    }

    const { token, watchTimeSeconds, lastPositionSec = 0, durationSeconds } = parsed.data

    if (token) {
      const verified = verifyPlaybackToken(token)
      if (verified && verified.sub) {
        userId = verified.sub
      }
    }

    const lessonInfo = await getLessonById(params.lessonId, userId)
    if (!lessonInfo) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 },
      )
    }

    const duration = durationSeconds || lessonInfo.lesson.durationSeconds || 600

    const result = await updateLessonProgress(
      userId,
      params.lessonId,
      watchTimeSeconds,
      duration,
      lastPositionSec,
    )

    return NextResponse.json({
      success: true,
      lessonId: params.lessonId,
      watchTimeSeconds,
      progressPct: result.progressPct,
      isCompleted: result.isCompleted,
      completionThreshold: '85%',
    })
  } catch (err: any) {
    console.error('[Progress Sync Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
