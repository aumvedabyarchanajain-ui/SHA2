import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSession } from '@/lib/session'
import { submitModuleQuiz } from '@/lib/lms-data'

export const dynamic = 'force-dynamic'

const quizSubmitSchema = z.object({
  answers: z.record(z.string(), z.number()), // questionId -> selectedIndex
})

export async function POST(
  req: NextRequest,
  { params }: { params: { quizId: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'

    const body = await req.json().catch(() => null)
    const parsed = quizSubmitSchema.safeParse(body ?? {})

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid quiz submission format' },
        { status: 400 },
      )
    }

    const { answers } = parsed.data
    const result = await submitModuleQuiz(userId, params.quizId, answers)

    return NextResponse.json({
      success: true,
      quizId: params.quizId,
      scorePct: result.scorePct,
      isPassed: result.isPassed,
      correctAnswers: result.correctAnswers,
      explanations: result.explanations,
      submittedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[Quiz Submit Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
