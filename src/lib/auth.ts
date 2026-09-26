import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { and, eq, isNull } from "drizzle-orm"
import { db } from "./db"
import { accounts, sessions, users, verificationTokens } from "./db/schema"
import { hashPassword, verifyPassword } from "./password"
import { EMAIL_NOT_VERIFIED, MIN_PASSWORD_LENGTH, VERIFY_EMAIL_SENT } from "./authErrors"
import { isMailerConfigured } from "./server/mailer"
import { sendVerificationEmail } from "./server/verification"

class AuthError extends CredentialsSignin {
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim()
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim()

/** True when Google sign-in is configured for this deployment. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret)

import { checkAuthRateLimit, checkSignupRateLimit, recordAuthFailure, recordAuthSuccess } from "./server/rateLimit"

function extractClientIp(req?: any): string {
  if (!req) return 'unknown'
  if (typeof req.headers?.get === 'function') {
    const fwd = req.headers.get('x-forwarded-for')
    if (fwd) return fwd.split(',')[0].trim()
    return req.headers.get('x-real-ip') || 'unknown'
  }
  if (req.headers && typeof req.headers === 'object') {
    const fwd = req.headers['x-forwarded-for']
    if (typeof fwd === 'string') return fwd.split(',')[0].trim()
    return req.headers['x-real-ip'] || 'unknown'
  }
  return 'unknown'
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
      mode: {},
      name: {},
    },
    authorize: async (credentials, req) => {
      const email = String(credentials?.email || "").trim().toLowerCase()
      const password = String(credentials?.password || "")
      const mode = credentials?.mode === "signup" ? "signup" : "signin"
      const name = String(credentials?.name || "").trim()
      const clientIp = extractClientIp(req)

      if (mode === "signup") {
        const signupLimit = checkSignupRateLimit(clientIp)
        if (!signupLimit.allowed) throw new AuthError("rate_limited")
      } else {
        const signinLimit = checkAuthRateLimit(clientIp, email)
        if (!signinLimit.allowed) throw new AuthError("rate_limited")
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError("invalid_email")
      if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError("weak_password")

      const [existing] = await db.select().from(users).where(eq(users.email, email))
      const mustVerify = isMailerConfigured()

      if (mode === "signup") {
        if (existing?.passwordHash) throw new AuthError("account_exists")
        const passwordHash = await hashPassword(password)
        if (existing) {
          // Google-only (or legacy) account: add a password to it. Google
          // already proved the email, so no confirmation round-trip.
          const [updated] = await db
            .update(users)
            .set({ passwordHash, name: existing.name || name || email.split("@")[0] })
            .where(eq(users.id, existing.id))
            .returning()
          if (!updated.emailVerified && mustVerify) {
            await sendVerificationEmail(email, updated.name)
            throw new AuthError(VERIFY_EMAIL_SENT)
          }
          if (!updated.emailVerified) await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, updated.id))
          return { id: updated.id, email: updated.email, name: updated.name }
        }
        const [created] = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            email,
            name: name || email.split("@")[0],
            passwordHash,
            emailVerified: mustVerify ? null : new Date(),
          })
          .returning()
        if (mustVerify) {
          await sendVerificationEmail(email, created.name)
          throw new AuthError(VERIFY_EMAIL_SENT)
        }
        return { id: created.id, email: created.email, name: created.name }
      }

      if (!existing) {
        recordAuthFailure(clientIp, email)
        throw new AuthError("no_account")
      }
      if (!existing.passwordHash) throw new AuthError("password_not_set")
      if (!(await verifyPassword(password, existing.passwordHash))) {
        recordAuthFailure(clientIp, email)
        throw new AuthError("bad_credentials")
      }
      recordAuthSuccess(clientIp, email)
      if (!existing.emailVerified && mustVerify) throw new AuthError(EMAIL_NOT_VERIFIED)
      return { id: existing.id, email: existing.email, name: existing.name }
    },
  }),
]

if (googleEnabled) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      // Google verifies the address, so it is safe to attach to an existing
      // password account with the same email.
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { prompt: "select_account" } },
    }),
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  trustHost: true,
  providers,
  pages: {
    signIn: "/app",
    error: "/app",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  events: {
    async linkAccount({ user, account, profile }) {
      // An OAuth provider vouched for this email: mark it verified.
      if (account.provider !== "google" || !user.id) return
      const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified !== false
      if (!verified) return
      await db.update(users).set({ emailVerified: new Date() }).where(and(eq(users.id, user.id), isNull(users.emailVerified)))
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id && typeof token.id === 'string') {
        session.user.id = token.id
      }
      return session
    }
  }
})
