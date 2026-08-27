import { NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { prisma } from '@aumveda/db'
import { r2PublicUrl } from '@/lib/r2'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getApiSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [published, enrollments, progressRows] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnailKey: true,
        thumbnailUrl: true,
        isPaid: true,
        priceCents: true,
        modules: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            durationSec: true,
            isPreview: true,
            sortOrder: true,
            lessons: {
              select: {
                id: true,
                title: true,
                durationSeconds: true,
                isFreePreview: true,
              },
            },
          },
        },
      },
    }),
    prisma.courseEnrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: session.user.id },
      select: { lessonId: true, isCompleted: true, watchTimeSeconds: true },
    }),
  ])

  const enrolledSet = new Set(enrollments.map((e: { courseId: string }) => e.courseId))
  const progressByLesson = new Map(progressRows.map((p: { lessonId: string; isCompleted: boolean; watchTimeSeconds: number }) => [p.lessonId, p]))

  const courses = published.map((course: any) => {
    const enrolled = enrolledSet.has(course.id)
    const modules = course.modules.map((m: any) => {
      const lessons = (m.lessons || []).map((l: any) => {
        const prog = progressByLesson.get(l.id)
        return {
          id: l.id,
          title: l.title,
          durationSec: l.durationSeconds,
          isPreview: l.isFreePreview,
          completed: Boolean(prog?.isCompleted),
          watchedSec: prog?.watchTimeSeconds ?? 0,
        }
      })
      const isCompleted = lessons.length > 0 && lessons.every((l: any) => l.completed)
      return {
        id: m.id,
        title: m.title,
        durationSec: m.durationSec,
        isPreview: m.isPreview,
        sortOrder: m.sortOrder,
        completed: isCompleted,
        lessons,
      }
    })

    const completedModules = modules.filter((m: any) => m.completed).length
    const totalModules = modules.length
    const progress = totalModules ? Math.round((completedModules / totalModules) * 100) : 0
    const continueModule = enrolled
      ? modules.find((m: any) => !m.completed) ?? modules[modules.length - 1] ?? null
      : null

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl || (course.thumbnailKey ? r2PublicUrl(course.thumbnailKey) : null),
      isPaid: course.isPaid,
      priceCents: course.priceCents,
      enrolled,
      progress,
      completedModules,
      totalModules,
      continueModuleId: continueModule?.id ?? null,
      continueModuleTitle: continueModule?.title ?? null,
      modules: enrolled ? modules : modules.filter((m: any) => m.isPreview),
    }
  })

  return NextResponse.json({
    success: true,
    user: { id: session.user.id, email: session.user.email ?? '' },
    courses,
  })
}
