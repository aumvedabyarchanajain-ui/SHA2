/**
 * Aumveda Vedic Astronomical Engine
 * High-precision calculation of Vedic planetary positions, Lagna (Ascendant),
 * Moon Sign (Chandra Rasi), Nakshatras, and Vimshottari Dasha timeline.
 */

export const VEDIC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Mula', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishta', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' },
] as const

export const DASHA_LORDS = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
] as const

export interface PlanetPlacement {
  name: string
  longitude: number
  sign: string
  signDegree: number
  nakshatra: string
  nakshatraLord: string
  pada: number
  house: number
  isRetrograde?: boolean
}

export interface DashaPeriod {
  mahadasha: string
  antardasha: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface VedicChartResult {
  sunSign: string
  moonSign: string
  risingSign: string | null
  nakshatra: string
  nakshatraLord: string
  nakshatraPada: number
  ayanamsa: number
  planets: PlanetPlacement[]
  dashaTimeline: DashaPeriod[]
  source: 'vedic_engine' | 'prokerala'
}

/** Converts Gregorian Date & Time to Julian Day (JD) */
export function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  second = 0,
  timezoneOffsetHours = 5.5 // Default IST +5:30
): number {
  let y = year
  let m = month
  if (m <= 2) {
    y -= 1
    m += 12
  }
  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)
  const universalTimeHours = hour + minute / 60 + second / 3600 - timezoneOffsetHours
  const dayFraction = universalTimeHours / 24.0

  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    dayFraction +
    b -
    1524.5
  )
}

/** High precision Lahiri Ayanamsa (Chitra Paksha) */
export function calculateLahiriAyanamsa(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0
  return 23.8576 + 1.396042 * t + 0.000308 * t * t
}

function normalize360(deg: number): number {
  let result = deg % 360
  if (result < 0) result += 360
  return result
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI
}

/** Compute sidereal Ascendant / Lagna */
export function calculateAscendant(
  jd: number,
  lat: number,
  lng: number,
  ayanamsa: number
): { degree: number; sign: string; signDegree: number; houseDegree: number } {
  const d = jd - 2451545.0
  const t = d / 36525.0

  // Greenwich Mean Sidereal Time (GMST) in degrees
  let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000.0
  gmst = normalize360(gmst)

  // Local Sidereal Time (LST)
  const lst = normalize360(gmst + lng)
  const ramc = toRadians(lst)
  const eps = toRadians(23.4392911 - 0.0130042 * t)
  const phi = toRadians(lat)

  // Ascendant formula
  const y = Math.cos(ramc)
  const x = -Math.sin(ramc) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps)
  const tropicalAsc = normalize360(toDegrees(Math.atan2(y, x)))
  const siderealAsc = normalize360(tropicalAsc - ayanamsa)

  const signIndex = Math.floor(siderealAsc / 30) % 12
  const sign = VEDIC_SIGNS[signIndex]
  const signDegree = Math.round((siderealAsc % 30) * 100) / 100

  return {
    degree: Math.round(siderealAsc * 100) / 100,
    sign,
    signDegree,
    houseDegree: siderealAsc,
  }
}

/** Compute 9 Vedic planetary longitudes */
export function calculatePlanetaryPositions(
  jd: number,
  ayanamsa: number,
  ascendantDegree: number | null
): PlanetPlacement[] {
  const d = jd - 2451545.0
  const t = d / 36525.0

  // Sun
  const L0 = 280.46646 + 36000.76983 * t
  const M_sun = 357.52911 + 35999.05029 * t
  const C_sun = (1.914602 - 0.004817 * t) * Math.sin(toRadians(M_sun)) + 0.019993 * Math.sin(toRadians(2 * M_sun))
  const sunTrop = normalize360(L0 + C_sun)
  const sunSidereal = normalize360(sunTrop - ayanamsa)

  // Moon
  const Lp = 218.3164477 + 481267.88123421 * t
  const D = 297.8501921 + 445267.1114034 * t
  const M_moon = 134.9633964 + 477198.8675055 * t
  const F = 93.272095 + 483202.0175233 * t
  const moonTrop =
    Lp +
    6.288774 * Math.sin(toRadians(M_moon)) +
    1.274027 * Math.sin(toRadians(2 * D - M_moon)) +
    0.658314 * Math.sin(toRadians(2 * D)) +
    0.213618 * Math.sin(toRadians(2 * M_moon)) -
    0.185116 * Math.sin(toRadians(M_sun)) -
    0.114332 * Math.sin(toRadians(2 * F))
  const moonSidereal = normalize360(moonTrop - ayanamsa)

  // Mars
  const marsTrop = normalize360(355.433 + 19140.299 * t + 10.69 * Math.sin(toRadians(19.37 + 19140.3 * t)))
  const marsSidereal = normalize360(marsTrop - ayanamsa)

  // Mercury
  const mercuryTrop = normalize360(252.25 + 149472.67 * t + 6.34 * Math.sin(toRadians(174.8 + 149472.7 * t)))
  const mercurySidereal = normalize360(mercuryTrop - ayanamsa)

  // Jupiter
  const jupiterTrop = normalize360(34.35 + 3034.905 * t + 5.55 * Math.sin(toRadians(20.38 + 3034.9 * t)))
  const jupiterSidereal = normalize360(jupiterTrop - ayanamsa)

  // Venus
  const venusTrop = normalize360(181.98 + 58517.815 * t + 0.78 * Math.sin(toRadians(50.4 + 58517.8 * t)))
  const venusSidereal = normalize360(venusTrop - ayanamsa)

  // Saturn
  const saturnTrop = normalize360(50.08 + 1222.114 * t + 6.35 * Math.sin(toRadians(317.0 + 1222.1 * t)))
  const saturnSidereal = normalize360(saturnTrop - ayanamsa)

  // Rahu (Mean Node)
  const rahuTrop = normalize360(125.04452 - 1934.136261 * t)
  const rahuSidereal = normalize360(rahuTrop - ayanamsa)

  // Ketu (Opposite Rahu)
  const ketuSidereal = normalize360(rahuSidereal + 180)

  const planetsData = [
    { name: 'Sun', lon: sunSidereal },
    { name: 'Moon', lon: moonSidereal },
    { name: 'Mars', lon: marsSidereal },
    { name: 'Mercury', lon: mercurySidereal },
    { name: 'Jupiter', lon: jupiterSidereal },
    { name: 'Venus', lon: venusSidereal },
    { name: 'Saturn', lon: saturnSidereal },
    { name: 'Rahu', lon: rahuSidereal },
    { name: 'Ketu', lon: ketuSidereal },
  ]

  const asc = ascendantDegree ?? sunSidereal

  return planetsData.map((p) => {
    const signIndex = Math.floor(p.lon / 30) % 12
    const sign = VEDIC_SIGNS[signIndex]
    const signDegree = Math.round((p.lon % 30) * 100) / 100

    // Nakshatra calculation (13°20' = 13.3333° per nakshatra)
    const nakshatraIndex = Math.floor(p.lon / (360 / 27)) % 27
    const nakshatra = NAKSHATRAS[nakshatraIndex]
    const nakshatraDegree = p.lon % (360 / 27)
    const pada = Math.floor(nakshatraDegree / (360 / 108)) + 1 // 3°20' per pada

    // House calculation (Whole Sign / Equal from Ascendant)
    const ascSignIndex = Math.floor(asc / 30) % 12
    const house = ((signIndex - ascSignIndex + 12) % 12) + 1

    return {
      name: p.name,
      longitude: Math.round(p.lon * 100) / 100,
      sign,
      signDegree,
      nakshatra: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      pada,
      house,
    }
  })
}

/** Computes Vimshottari Dasha Timeline from Moon's Nakshatra & longitude */
export function calculateVimshottariDasha(
  birthDate: Date,
  moonLongitude: number
): DashaPeriod[] {
  const nakshatraSpan = 360 / 27
  const nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan) % 27
  const moonDegreeInNakshatra = moonLongitude % nakshatraSpan

  const birthNakshatraLord = NAKSHATRAS[nakshatraIndex].lord
  const startingLordIndex = DASHA_LORDS.findIndex((d) => d.planet === birthNakshatraLord)

  const fractionElapsed = moonDegreeInNakshatra / nakshatraSpan
  const fractionRemaining = Math.max(0, Math.min(1, 1 - fractionElapsed))

  const periods: DashaPeriod[] = []
  const now = new Date()

  let currentDate = new Date(birthDate.getTime())

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const lordIdx = (startingLordIndex + i) % DASHA_LORDS.length
    const mahaLord = DASHA_LORDS[lordIdx]
    const mahaDurationYears = i === 0 ? mahaLord.years * fractionRemaining : mahaLord.years

    for (let j = 0; j < DASHA_LORDS.length; j++) {
      const antarLordIdx = (lordIdx + j) % DASHA_LORDS.length
      const antarLord = DASHA_LORDS[antarLordIdx]

      const antarDurationYears = (mahaDurationYears * antarLord.years) / mahaLord.years
      const antarDurationMs = antarDurationYears * 365.2425 * 24 * 60 * 60 * 1000

      const startDate = new Date(currentDate.getTime())
      const endDate = new Date(currentDate.getTime() + antarDurationMs)
      currentDate = endDate

      const isCurrent = now >= startDate && now < endDate

      if (
        isCurrent ||
        periods.length < 12 ||
        Math.abs(now.getTime() - startDate.getTime()) < 365 * 24 * 60 * 60 * 1000 * 4
      ) {
        periods.push({
          mahadasha: mahaLord.planet,
          antardasha: antarLord.planet,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          isCurrent,
        })
      }
    }
  }

  return periods
}

/** Master Vedic Chart Calculator */
export function computeVedicChart(params: {
  dob: string
  timeOfBirth?: string | null
  lat?: number
  lng?: number
}): VedicChartResult {
  const parts = params.dob.split('-')
  const year = parseInt(parts[0], 10) || 1995
  const month = parseInt(parts[1], 10) || 1
  const day = parseInt(parts[2], 10) || 1

  let hour = 12
  let minute = 0
  if (params.timeOfBirth) {
    const timeParts = params.timeOfBirth.split(':')
    hour = parseInt(timeParts[0], 10) || 12
    minute = parseInt(timeParts[1], 10) || 0
  }

  const lat = params.lat ?? 28.6139
  const lng = params.lng ?? 77.209

  const jd = calculateJulianDay(year, month, day, hour, minute)
  const ayanamsa = calculateLahiriAyanamsa(jd)

  let risingSign: string | null = null
  let ascDegree: number | null = null

  if (params.timeOfBirth) {
    const asc = calculateAscendant(jd, lat, lng, ayanamsa)
    risingSign = asc.sign
    ascDegree = asc.degree
  }

  const planets = calculatePlanetaryPositions(jd, ayanamsa, ascDegree)
  const sun = planets.find((p) => p.name === 'Sun') ?? planets[0]
  const moon = planets.find((p) => p.name === 'Moon') ?? planets[1]

  const birthDate = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const dashaTimeline = calculateVimshottariDasha(birthDate, moon.longitude)

  return {
    sunSign: sun.sign,
    moonSign: moon.sign,
    risingSign,
    nakshatra: moon.nakshatra,
    nakshatraLord: moon.nakshatraLord,
    nakshatraPada: moon.pada,
    ayanamsa: Math.round(ayanamsa * 100) / 100,
    planets,
    dashaTimeline,
    source: 'vedic_engine',
  }
}
