import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@aumveda/db'
import { calculateUserProgressScore } from '@/lib/scoring/progressEngine'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const doseId = parseInt(params.id, 10)
  if (isNaN(doseId)) {
    return NextResponse.json({ error: 'Invalid dose id' }, { status: 400 })
  }

  const userId = session.user.id

  // Check dose exists and is active
  const dose = await prisma.dailyDose.findFirst({
    where: { id: doseId, isActive: true },
    select: { id: true },
  })
  if (!dose) {
    return NextResponse.json({ error: 'Dose not found' }, { status: 404 })
  }

  // Upsert completion (idempotent)
  await prisma.dailyDoseCompletion.upsert({
    where: { userId_doseId: { userId, doseId } },
    create: { userId, doseId },
    update: {},
  })

  // Emit event
  await prisma.event.create({
    data: {
      userId,
      eventName: 'daily_dose.completed',
      payload: { doseId },
      source: 'server',
    },
  })

  // Recalculate canonical progress score in real time (P_t = 0.35*S_t + 0.30*A_t + 0.25*J_t + 0.10*W_t)
  const progress = await calculateUserProgressScore(userId)

  return NextResponse.json({ success: true, progress })
}
