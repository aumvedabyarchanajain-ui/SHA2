import { NextRequest, NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { enrollUserInCourse } from '@/lib/lms-data'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'

    await enrollUserInCourse(userId, params.slug)

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled into course sanctuary.',
      slug: params.slug,
    })
  } catch (err: any) {
    console.error('[Enroll Course Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
