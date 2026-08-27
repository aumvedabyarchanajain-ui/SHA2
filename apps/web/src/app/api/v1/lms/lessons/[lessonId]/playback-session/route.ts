import { NextRequest, NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { getLessonById } from '@/lib/lms-data'
import {
  signPlaybackToken,
  generateForensicHash,
  maskEmail,
  getSanitizedYouTubeParams,
} from '@/lib/lms-security'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'
    const userEmail = session?.user?.email || 'dev@aumveda.com'
    const userName = session?.user?.name || 'Dev Seeker'

    const lessonId = params.lessonId
    const lessonInfo = await getLessonById(lessonId, userId)

    if (!lessonInfo) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 },
      )
    }

    const { course, module, lesson } = lessonInfo

    // Check entitlement: either course is free, user is enrolled, or lesson is marked as preview
    const hasAccess =
      !course.isPaid ||
      course.enrolled ||
      lesson.isFreePreview ||
      module.isPreview

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course enrollment required to view this lesson.',
          requiresEnrollment: true,
          courseId: course.id,
        },
        { status: 403 },
      )
    }

    // Generate signed 15-minute JWT (900 seconds TTL)
    const token = signPlaybackToken({
      sub: userId,
      userEmail,
      lessonId: lesson.id,
      courseId: course.id,
      videoId: lesson.youtubeVideoId,
    }, 900)

    // Generate anti-piracy forensic watermark payload
    const studentHash = generateForensicHash(userId, userEmail)
    const masked = maskEmail(userEmail)
    const timestampUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

    // Sanitized embed parameters
    const sanitizedParams = getSanitizedYouTubeParams()

    return NextResponse.json({
      success: true,
      token,
      expiresInSeconds: 900,
      videoId: lesson.youtubeVideoId,
      lessonTitle: lesson.title,
      courseTitle: course.title,
      durationSeconds: lesson.durationSeconds,
      sanitizedParams,
      forensicWatermark: {
        studentHash,
        maskedEmail: masked,
        studentName: userName,
        timestamp: timestampUtc,
      },
    })
  } catch (err: any) {
    console.error('[Playback Session Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
