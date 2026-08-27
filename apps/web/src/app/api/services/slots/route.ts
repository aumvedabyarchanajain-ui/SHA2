import { NextRequest, NextResponse } from 'next/server'
import { googleCalendarClient } from '@/lib/calendar/google-calendar'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const practitioner = searchParams.get('practitioner') || 'Archana Jain'
    const dateStr = searchParams.get('date')

    const date = dateStr ? new Date(dateStr) : new Date(Date.now() + 24 * 3600_000)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
    }

    const slots = await googleCalendarClient.getAvailabilitySlots(practitioner, date)

    return NextResponse.json({
      ok: true,
      practitioner,
      date: date.toISOString().split('T')[0],
      timezone: 'Asia/Kolkata (IST)',
      slots,
    })
  } catch (err: unknown) {
    console.error('[Slots API Error]:', err)
    return NextResponse.json(
      { error: 'Failed to fetch practitioner availability slots', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
