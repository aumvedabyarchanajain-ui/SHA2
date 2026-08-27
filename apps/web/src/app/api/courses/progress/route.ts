import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSession } from '@/lib/session'
import { prisma } from '@aumveda/db'

export const dynamic = 'force-dynamic'

const schema = z.object({
  courseId: z.union([z.number(), z.string()]),
  moduleId: z.union([z.number(), z.string()]),
  progress: z.number().min(0).max(100).optional(),
  status: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getApiSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const { courseId, moduleId, progress, status } = parsed.data

  const modIdStr = String(moduleId)
  const courseIdStr = String(courseId)

  const courseModule = await prisma.courseModule.findFirst({
    where: {
      OR: [{ id: modIdStr }, { courseId: courseIdStr }],
    },
    select: { id: true, courseId: true, durationSec: true },
  })
  if (!courseModule) {
    return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: courseModule.courseId },
    },
    select: { id: true },
  })
  if (!enrollment) {
    return NextResponse.json({ success: false, error: 'Enrollment required' }, { status: 403 })
  }

  const watchedSec =
    progress != null && courseModule.durationSec
      ? Math.round((progress / 100) * courseModule.durationSec)
      : undefined

  // Upsert progress
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId: courseModule.id },
    },
    create: {
      userId: session.user.id,
      lessonId: courseModule.id,
      isCompleted: status === 'completed' || (progress != null && progress >= 85),
      completedAt: status === 'completed' || (progress != null && progress >= 85) ? new Date() : null,
      watchTimeSeconds: watchedSec ?? 0,
    },
    update: {
      ...(watchedSec != null && { watchTimeSeconds: watchedSec }),
      ...(status === 'completed' || (progress != null && progress >= 85) ? { isCompleted: true, completedAt: new Date() } : {}),
    },
  }).catch(() => null)

  return NextResponse.json({ success: true })
}
