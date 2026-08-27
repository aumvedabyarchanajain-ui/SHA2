import { NextRequest, NextResponse } from 'next/server'
import { getApiSession } from '@/lib/session'
import { getOrGenerateCertificate } from '@/lib/lms-data'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'
    const studentName = session?.user?.name || 'Aumveda Disciple'

    const cert = await getOrGenerateCertificate(userId, params.slug, studentName)

    return NextResponse.json({
      success: true,
      certificate: cert,
    })
  } catch (err: any) {
    console.error('[Certificate Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getApiSession()
    const userId = session?.user?.id || 'demo-client-user'
    const studentName = session?.user?.name || 'Aumveda Disciple'

    const cert = await getOrGenerateCertificate(userId, params.slug, studentName)

    return NextResponse.json({
      success: true,
      certificate: cert,
      message: 'Certificate of Mastery generated successfully.',
    })
  } catch (err: any) {
    console.error('[Generate Certificate Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
