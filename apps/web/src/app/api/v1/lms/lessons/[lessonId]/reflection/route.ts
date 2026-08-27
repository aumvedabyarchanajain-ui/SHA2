import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSession } from '@/lib/session'
import { saveLessonReflection, getLessonById } from '@/lib/lms-data'

export const dynamic = 'force-dynamic'

const reflectionSchema = z.object({
  reflectionText: z.string().min(1, 'Reflection cannot be empty'),
  mood: z.number().min(1).max(5).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'

    const body = await req.json().catch(() => null)
    const parsed = reflectionSchema.safeParse(body ?? {})

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid reflection input' },
        { status: 400 },
      )
    }

    const { reflectionText, mood } = parsed.data

    const lessonInfo = await getLessonById(params.lessonId, userId)
    if (!lessonInfo) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 },
      )
    }

    await saveLessonReflection(userId, params.lessonId, reflectionText, mood)

    return NextResponse.json({
      success: true,
      message: 'Micro-journal reflection saved to your sacred record.',
      savedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[Reflection Save Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
