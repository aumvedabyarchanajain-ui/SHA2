import { createHmac, timingSafeEqual } from 'crypto'

const JWT_SECRET = process.env.COURSE_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'aumveda-lms-secure-jwt-key-2026'
const SEP = '.'

function b64url(data: string): string {
  return Buffer.from(data, 'utf8').toString('base64url')
}

export interface PlaybackTokenPayload {
  sub: string // userId
  userEmail: string
  lessonId: string
  courseId: string
  videoId: string
  iat: number
  exp: number
}

/**
 * Signs a 15-minute (900 seconds) cryptographically secure JWT token
 * for video playback session gating.
 */
export function signPlaybackToken(
  payload: Omit<PlaybackTokenPayload, 'iat' | 'exp'>,
  ttlSec = 900, // 15 minutes default
): string {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: PlaybackTokenPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSec,
  }
  const data = b64url(JSON.stringify(fullPayload))
  const sig = createHmac('sha256', JWT_SECRET).update(data).digest('base64url')
  return `${data}${SEP}${sig}`
}

/**
 * Verifies a playback JWT token and ensures it has not expired.
 */
export function verifyPlaybackToken(token: string): PlaybackTokenPayload | null {
  try {
    const idx = token.lastIndexOf(SEP)
    if (idx <= 0) return null
    const data = token.slice(0, idx)
    const sig = token.slice(idx + 1)
    if (!data || !sig) return null

    const expected = createHmac('sha256', JWT_SECRET).update(data).digest('base64url')
    const expectedBuf = Buffer.from(expected)
    const sigBuf = Buffer.from(sig)
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as PlaybackTokenPayload
    const now = Math.floor(Date.now() / 1000)
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

/**
 * Generates a non-reversible cryptographic forensic identifier hash for anti-piracy watermarking.
 */
export function generateForensicHash(studentId: string, email: string): string {
  const raw = `${studentId}:${email}:aumveda_forensic_salt`
  const hash = createHmac('sha256', JWT_SECRET).update(raw).digest('hex')
  return `AV-HASH-${hash.slice(0, 10).toUpperCase()}`
}

/**
 * Sanitizes email for display (e.g. "aashi***@gmail.com")
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'user@***.com'
  const [local, domain] = email.split('@')
  const maskedLocal = local.length <= 2 ? `${local}***` : `${local.slice(0, 3)}***`
  return `${maskedLocal}@${domain}`
}

/**
 * Returns strictly sanitized YouTube embed parameters.
 * Disables related videos, disables keyboard hotkeys, removes branding, enables JS API and inline playback.
 */
export function getSanitizedYouTubeParams() {
  return {
    autoplay: 1,
    modestbranding: 1,
    rel: 0,
    controls: 1,
    disablekb: 1,
    fs: 0, // disable fullscreen to prevent bypassing overlay
    iv_load_policy: 3, // hide annotations
    playsinline: 1,
    enablejsapi: 1,
    origin: typeof window !== 'undefined' ? window.location.origin : 'https://aumveda.com',
  }
}
