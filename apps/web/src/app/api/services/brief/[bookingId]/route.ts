import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@aumveda/db'
import { getApiSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getApiSession()
    const { bookingId } = params

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })
    }

    const brief = await prisma.preSessionBrief.findFirst({
      where: {
        OR: [
          { bookingId },
          { id: bookingId },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            dob: true,
            sunSign: true,
            moonSign: true,
            risingSign: true,
          },
        },
      },
    })

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found for this consultation session' }, { status: 404 })
    }

    // Role check: Only the booked user or practitioner/admin can access the full brief
    if (session?.user?.id && brief.userId !== session.user.id && session.user.role !== 'practitioner' && session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      ok: true,
      brief,
    })
  } catch (err: unknown) {
    console.error('[PreSessionBrief API Error]:', err)
    return NextResponse.json({ error: 'Failed to retrieve pre-session brief' }, { status: 500 })
  }
}
