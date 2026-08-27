import { NextRequest, NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { getCourseBySlug } from '@/lib/lms-data'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'

    const course = await getCourseBySlug(params.slug, userId)
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      course,
    })
  } catch (err: any) {
    console.error('[Get Course Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
