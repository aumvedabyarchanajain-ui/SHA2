import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

// Cloud Run / Hostinger (self-hosted) use the custom server + standalone output.
// Vercel must NOT build standalone — it conflicts with its serverless routing and
// middleware, causing broken/missing routes. Vercel sets VERCEL=1 at build time.
const isVercel = process.env.VERCEL === '1'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is only for self-hosted deployments (Cloud Run / Hostinger
  // via server.js). On Vercel we skip it and use the native serverless build.
  ...(isVercel ? {} : { output: 'standalone' }),
  reactStrictMode: true,
  experimental: {
    // Prevent Next.js from bundling Prisma / pg — Node.js requires them at runtime.
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@aumveda/db',
      '@prisma/adapter-pg',
      'pg',
      'pg-connection-string',
    ],
    // Limit worker processes — prevents EAGAIN on shared hosting
    workerThreads: false,
    cpus: 1,
    outputFileTracingRoot: path.join(__dirname, '../../'),
    // pnpm's symlinked layout hides Prisma query engines from Next.js file tracing.
    // Copy the generated `.prisma/client` (incl. the query-engine binaries) into the
    // traced server bundles for BOTH the self-hosted standalone output and the Vercel
    // serverless runtime, which otherwise fail with "could not locate the Query Engine".
    outputFileTracingIncludes: {
      '/**': [
        '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**',
      ],
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'assets.aumveda.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'astrotalk.store' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Google Places, Calendly widget, GTM/GA — needed by Portal Steps 6 & 8.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com maps.googleapis.com *.gstatic.com assets.calendly.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com assets.calendly.com",
              "font-src 'self' fonts.gstatic.com assets.calendly.com",
              "img-src 'self' data: blob: *.r2.cloudflarestorage.com assets.aumveda.com lh3.googleusercontent.com images.unsplash.com *.unsplash.com *.googleusercontent.com maps.gstatic.com *.gstatic.com",
              // blob: — the homepage's master film (MasterFilm.tsx) is fetched and
              // played from a same-origin-created object URL for reliable scroll-seeking.
              "media-src 'self' blob: *.r2.cloudflarestorage.com assets.aumveda.com",
              // Calendly booking embed lives in an iframe from calendly.com.
              "frame-src 'self' *.youtube.com *.youtube-nocookie.com calendly.com *.calendly.com",
              // Places autocomplete uses fetch to maps.googleapis.com; Calendly widget posts to calendly.com.
              "connect-src 'self' *.aumveda.com *.google-analytics.com *.supabase.co wss://*.supabase.co maps.googleapis.com *.googleapis.com calendly.com *.calendly.com",
            ].join('; '),
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.aumveda.com' }],
        destination: 'https://app.aumveda.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
