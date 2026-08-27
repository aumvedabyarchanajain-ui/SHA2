import { NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { prisma } from '@aumveda/db'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: { courseId: string } },
) {
  const session = await getApiSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const courseId = params.courseId
  if (!courseId) {
    return NextResponse.json({ success: false, error: 'Invalid course id' }, { status: 400 })
  }

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: courseId }, { slug: courseId }],
    },
    select: { id: true, isPublished: true, isPaid: true, title: true },
  })
  if (!course || !course.isPublished) {
    return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
  }
  if (course.isPaid) {
    return NextResponse.json(
      { success: false, error: 'Paid courses require checkout' },
      { status: 403 },
    )
  }

  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    create: { userId: session.user.id, courseId: course.id, status: 'ACTIVE' },
    update: { status: 'ACTIVE' },
  })

  await prisma.event
    .create({
      data: {
        userId: session.user.id,
        eventName: 'course.enrolled',
        payload: { courseId, title: course.title },
        source: 'server',
      },
    })
    .catch(() => null)

  return NextResponse.json({ success: true, enrolled: true, courseId })
}
