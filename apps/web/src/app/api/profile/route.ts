import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSession } from '@/lib/session'
import { prisma } from '@aumveda/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getApiSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      profile: { select: { timezone: true, avatarUrl: true, progress: true } },
      packages: {
        orderBy: { purchasedAt: 'desc' },
        take: 1,
        select: { packageType: true },
      },
      subscription: { select: { plan: true, status: true } },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const activeSub = user.subscription && (user.subscription.status === 'active' || user.subscription.status === 'ACTIVE') ? user.subscription : null
  const membershipTier = activeSub?.plan || user.packages[0]?.packageType || 'Member'

  return NextResponse.json({
    displayName: user.name ?? 'Aumveda Member',
    timezone: user.profile?.timezone ?? 'Asia/Kolkata',
    membershipTier,
    avatarUrl: user.profile?.avatarUrl ?? null,
    progress: Math.round(user.profile?.progress ?? 0),
    email: user.email,
  })
}

const patchSchema = z.object({
  displayName: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  const session = await getApiSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.displayName },
  })

  return NextResponse.json({ ok: true, displayName: parsed.data.displayName })
}
