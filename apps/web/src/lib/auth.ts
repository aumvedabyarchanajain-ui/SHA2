import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@aumveda/db'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import crypto from 'crypto'
import type { UserRole } from '@aumveda/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding/step-1',
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@aumveda.com',
    }),

    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otpCode: { label: 'OTP Code', type: 'text' },
        action: { label: 'Action', type: 'text' }, // 'password' or 'otp'
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            throw new Error('Missing email')
          }

          const email = credentials.email.toLowerCase().trim()

          // ─── OTP ACTION ───────────────────────────────────────────
          if (credentials.action === 'otp') {
            if (!credentials.otpCode) {
              throw new Error('Missing OTP code')
            }

            const user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                otpCode: true,
                otpExpires: true,
              },
            })

            if (!user || !user.otpCode || !user.otpExpires) {
              throw new Error('OTP not requested or invalid')
            }

            if (new Date() > user.otpExpires) {
              throw new Error('OTP has expired')
            }

            if (user.otpCode !== credentials.otpCode.trim()) {
              throw new Error('Invalid OTP code')
            }

            // Clear OTP to prevent reuse and ensure emailVerified is set
            await prisma.user.update({
              where: { id: user.id },
              data: {
                otpCode: null,
                otpExpires: null,
                emailVerified: new Date(),
              },
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: (user.role === 'user' ? 'client' : user.role) as UserRole,
            }
          }

          // ─── PASSWORD ACTION ──────────────────────────────────────
          if (!credentials.password) {
            throw new Error('Missing password')
          }

          let user: any = null
          try {
            user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                passwordHash: true,
                emailVerified: true,
              },
            })
          } catch (dbErr) {
            console.warn('Prisma DB query skipped/failed, checking dev mode fallback:', dbErr)
          }

          // In dev mode or DEV_BYPASS, allow instant login with demo accounts
          if ((!user || !user.passwordHash) && (process.env.NODE_ENV !== 'production' || process.env.DEV_BYPASS === 'true')) {
            if (email.includes('coach') || email.includes('practitioner')) {
              return {
                id: user?.id || 'dev-coach-id',
                email,
                name: user?.name || 'Dr. Kabir Veda (Coach)',
                image: null,
                role: 'practitioner' as UserRole,
              }
            } else if (email.includes('admin')) {
              return {
                id: user?.id || 'dev-admin-id',
                email,
                name: user?.name || 'Aumveda Admin',
                image: null,
                role: 'admin' as UserRole,
              }
            } else {
              // Client Sanctuary member
              return {
                id: user?.id || 'dev-client-id',
                email,
                name: user?.name || 'Aria Sharma (Client)',
                image: null,
                role: 'client' as UserRole,
              }
            }
          }

          if (!user) {
            throw new Error('User not found')
          }

          if (!user.passwordHash) {
            throw new Error('This account uses Google or magic link sign-in')
          }

          // Enforce email verification for credentials provider signup
          if (!user.emailVerified) {
            throw new Error('email_not_verified')
          }

          const validPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!validPassword) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: (user.role === 'user' ? 'client' : user.role) as UserRole,
          }
        } catch (error: any) {
          console.error('AUTH AUTHORIZE ERROR:', error)
          // Rethrow to pass the specific error message (e.g. 'email_not_verified') to the frontend
          throw new Error(error.message || 'Authentication failed')
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Runs on initial sign-in only
      if (user) {
        // Under JWT strategy the OAuth `user.id` is the provider `sub`, not the real
        // DB id persisted by the signIn callback. Resolve the real id/role (by email)
        // so the session/downstream code keys off the actual users row.
        let resolvedId = user.id
        let resolvedRole = (user as any).role || 'client'
        if (user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true, role: true },
            })
            if (dbUser) {
              resolvedId = dbUser.id
              resolvedRole = dbUser.role
            }
          } catch (e) {
            // Non-blocking: fall back to the provided id/role.
          }
        }

        token.id = resolvedId
        const rawRole = resolvedRole
        token.role = (rawRole === 'user' ? 'client' : rawRole) as UserRole

        // Capture request metadata
        let userAgent = 'Unknown'
        let ipAddress = '127.0.0.1'
        try {
          const headersList = headers()
          userAgent = headersList.get('user-agent') || 'Unknown'
          ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0] ||
            headersList.get('x-real-ip') ||
            '127.0.0.1'
        } catch (e) {
          // Ignore headers() errors when out of request scope
        }

        // Generate a new session row in the database
        const sessionToken = crypto.randomUUID()
        try {
          await prisma.session.create({
            data: {
              sessionToken,
              userId: resolvedId,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              userAgent,
              ipAddress,
            },
          })
        } catch (dbError) {
          // Non-blocking in local development
        }
        token.sessionToken = sessionToken
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.sessionToken && process.env.DEV_BYPASS !== 'true' && process.env.NODE_ENV === 'production') {
          // Enforce session database check in production
          try {
            const dbSession = await prisma.session.findUnique({
              where: { sessionToken: token.sessionToken as string },
            })

            if (!dbSession) {
              return null as any
            }
          } catch (dbError) {
            console.error('FAILED TO VALIDATE SESSION IN DB:', dbError)
          }
        }

        session.user.id = (token.id as string) || 'dev-user-id'
        session.user.role = (token.role as UserRole) || 'client'
      }

      return session
    },

    async signIn({ user, account }) {
      try {
        if (account?.type === 'oauth' || account?.type === 'email') {
          if (!user.email) {
            // Cannot persist an OAuth identity without an email address.
            return false
          }
          // JWT session strategy does NOT persist OAuth users/accounts automatically,
          // so the Profile created below would have seen a non-existent userId (P2003 ->
          // AccessDenied). Persist the identity first, then create the Profile against the
          // real DB user id. Idempotent across repeat logins (no duplicate users/accounts).
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                googleId:
                  account?.provider === 'google'
                    ? account.providerAccountId
                    : null,
              },
            })
          } else if (
            account?.provider === 'google' &&
            !dbUser.googleId
          ) {
            // Link an existing (e.g. password-created) user to Google without duplicating.
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                googleId: account.providerAccountId,
                emailVerified: dbUser.emailVerified ?? new Date(),
              },
            })
          }

          if (account?.type === 'oauth') {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
              update: {},
            })
          }

          const existingProfile = await prisma.profile.findUnique({
            where: { userId: dbUser.id },
          })
          if (!existingProfile) {
            await prisma.profile.create({
              data: { userId: dbUser.id },
            })
          }
        }
        return true
      } catch (error) {
        console.error('SIGNIN CALLBACK ERROR:', error)
        return false
      }
    },
  },

  events: {
    async createUser({ user }) {
      try {
        await prisma.event.create({
          data: {
            userId: user.id,
            eventName: 'sign_up',
            payload: { email: user.email },
            source: 'server',
          },
        })
      } catch (error) {
        console.error('CREATE USER EVENT ERROR:', error)
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
}