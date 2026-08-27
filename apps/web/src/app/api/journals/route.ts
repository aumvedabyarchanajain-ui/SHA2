import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@aumveda/db'
import { z } from 'zod'

import { calculateUserProgressScore } from '@/lib/scoring/progressEngine'

async function recalculateProgress(userId: string) {
  try {
    await calculateUserProgressScore(userId)
  } catch (err) {
    console.warn('[journals] Progress recalculation warning:', err)
  }
}

const createSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  body: z.string().min(1).max(10000),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
  voiceNoteUrl: z.string().nullable().optional(),
  aiReflection: z.string().nullable().optional(),
  practitionerVisible: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  const journals = await prisma.journal.findMany({
    where: {
      userId: session.user.id,
      isDeleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } },
          { tags: { has: search.toLowerCase().replace(/\s+/g, '-') } }
        ]
      })
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, mood: true, createdAt: true, body: true, tags: true },
  })

  return NextResponse.json({ ok: true, data: journals })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const journal = await prisma.journal.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title ?? null,
      body: parsed.data.body,
      mood: parsed.data.mood ?? null,
      tags: parsed.data.tags ?? [],
      voiceNoteUrl: parsed.data.voiceNoteUrl ?? null,
      aiReflection: parsed.data.aiReflection ?? null,
      practitionerVisible: parsed.data.practitionerVisible ?? true,
    },
    select: { id: true, title: true, createdAt: true },
  })

  const uid = session.user.id

  // Await event logging, achievement check, and progress recalculation
  try {
    await Promise.allSettled([
      prisma.event.create({
        data: {
          userId: uid,
          eventName: 'journal.created',
          payload: { journalId: journal.id },
          source: 'server',
        },
      }),
      // FIRST_JOURNAL achievement
      prisma.achievement.upsert({
        where: { userId_key: { userId: uid, key: 'FIRST_JOURNAL' } },
        create: { userId: uid, key: 'FIRST_JOURNAL' },
        update: {},
      }),
      // Recalculate progress
      recalculateProgress(uid),
    ])
  } catch (err) {
    console.error('[journals] Background processing error:', err)
  }

  return NextResponse.json({ ok: true, data: journal }, { status: 201 })
}
