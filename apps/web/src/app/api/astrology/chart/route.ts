import { NextRequest, NextResponse } from 'next/server'
import { computeVedicChart, type VedicChartResult } from '@/lib/astrology/vedicEngine'

interface ChartRequestBody {
  dob: string
  timeOfBirth?: string | null
  lat: number
  lng: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getProkeralaToken(): Promise<string | null> {
  const clientId = process.env.PROKERALA_CLIENT_ID
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error(`Prokerala token request failed: ${res.status}`)

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3000) * 1000 - 30_000,
  }
  return cachedToken.token
}

/** Calls Prokerala Astrology API v2 with fallback to local Vedic Ephemeris engine */
async function fetchFromProkerala(body: ChartRequestBody): Promise<VedicChartResult> {
  const token = await getProkeralaToken()
  if (!token) throw new Error('Prokerala credentials not configured')

  const datetime = `${body.dob}T${body.timeOfBirth || '12:00'}:00+05:30`
  const params = new URLSearchParams({
    ayanamsa: '1',
    coordinates: `${body.lat},${body.lng}`,
    datetime,
  })

  const res = await fetch(
    `https://api.prokerala.com/v2/astrology/planet-position?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 * 60 * 24 * 30 },
    }
  )

  if (!res.ok) throw new Error(`Prokerala chart request failed: ${res.status}`)

  const data = await res.json()
  const planetsData: Array<{
    name: string
    longitude?: number
    degree?: number
    rasi?: { name: string; id: number }
    nakshatra?: { name: string; lord: { name: string }; pada: number }
  }> = data?.data?.planet_positions ?? []

  const findPlanet = (planetName: string) =>
    planetsData.find((p) => p.name?.toLowerCase() === planetName)

  const sun = findPlanet('sun')
  const moon = findPlanet('moon')
  const asc = body.timeOfBirth ? findPlanet('ascendant') : null

  if (!sun?.rasi || !moon?.rasi) {
    throw new Error('Prokerala response missing expected planet data')
  }

  // Fallback / supplement with full Vedic engine computation for dasha & full chart
  const localChart = computeVedicChart(body)

  return {
    sunSign: sun.rasi.name,
    moonSign: moon.rasi.name,
    risingSign: asc?.rasi?.name ?? localChart.risingSign,
    nakshatra: moon.nakshatra?.name ?? localChart.nakshatra,
    nakshatraLord: moon.nakshatra?.lord?.name ?? localChart.nakshatraLord,
    nakshatraPada: moon.nakshatra?.pada ?? localChart.nakshatraPada,
    ayanamsa: localChart.ayanamsa,
    planets: localChart.planets,
    dashaTimeline: localChart.dashaTimeline,
    source: 'prokerala',
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChartRequestBody

    if (!body.dob) {
      return NextResponse.json({ ok: false, error: 'dob is required' }, { status: 400 })
    }

    try {
      const result = await fetchFromProkerala(body)
      return NextResponse.json({ ok: true, data: result })
    } catch (prokeralaError) {
      console.warn(
        '[astrology/chart] Prokerala API unavailable, using built-in high-precision Vedic astronomical engine:',
        prokeralaError
      )
      const fallbackResult = computeVedicChart(body)
      return NextResponse.json({ ok: true, data: fallbackResult })
    }
  } catch (error) {
    console.error('[astrology/chart] Fatal error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to calculate chart' }, { status: 500 })
  }
}
