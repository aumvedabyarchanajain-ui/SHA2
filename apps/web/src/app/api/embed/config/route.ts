import { NextRequest, NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { prisma } from '@aumveda/db'
import { verifyCourseToken } from '@/lib/course-token'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getApiSession()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
  }

  const payload = verifyCourseToken(token)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
  }

  if (payload.sub !== session.user.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const moduleId = String(payload.moduleId)
  if (!moduleId) {
    return NextResponse.json({ success: false, error: 'Malformed token' }, { status: 400 })
  }

  const courseModule = await prisma.courseModule.findFirst({
    where: { id: moduleId, course: { isPublished: true } },
    select: {
      id: true,
      courseId: true,
      title: true,
      durationSec: true,
      lessons: {
        select: {
          id: true,
          title: true,
          youtubeVideoId: true,
          durationSeconds: true,
        },
        take: 1,
      },
    },
  })

  if (!courseModule) {
    return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
  }

  const lesson = courseModule.lessons[0]
  const videoId = lesson?.youtubeVideoId || 'm1Lh0gZ_XQ8'

  return NextResponse.json({
    videoId,
    courseId: courseModule.courseId,
    moduleId: courseModule.id,
    lessonId: lesson?.id,
    title: lesson?.title || courseModule.title,
    durationSec: lesson?.durationSeconds || courseModule.durationSec || null,
  })
}
