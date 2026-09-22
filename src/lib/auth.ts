import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"
import { hashPassword, verifyPassword } from "./password"

class AuthError extends CredentialsSignin {
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

import { MIN_PASSWORD_LENGTH } from "./authErrors"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        mode: {},
        name: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").trim().toLowerCase()
        const password = String(credentials?.password || "")
        const mode = credentials?.mode === "signup" ? "signup" : "signin"
        const name = String(credentials?.name || "").trim()

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError("invalid_email")
        if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError("weak_password")

        const [existing] = await db.select().from(users).where(eq(users.email, email))

        if (mode === "signup") {
          if (existing?.passwordHash) throw new AuthError("account_exists")
          const passwordHash = await hashPassword(password)
          if (existing) {
            // Legacy account created before passwords existed: claim it by setting the first password.
            const [updated] = await db
              .update(users)
              .set({ passwordHash, name: existing.name || name || email.split("@")[0] })
              .where(eq(users.id, existing.id))
              .returning()
            return { id: updated.id, email: updated.email, name: updated.name }
          }
          const [created] = await db
            .insert(users)
            .values({ id: crypto.randomUUID(), email, name: name || email.split("@")[0], passwordHash })
            .returning()
          return { id: created.id, email: created.email, name: created.name }
        }

        if (!existing) throw new AuthError("no_account")
        if (!existing.passwordHash) throw new AuthError("password_not_set")
        if (!(await verifyPassword(password, existing.passwordHash))) throw new AuthError("bad_credentials")
        return { id: existing.id, email: existing.email, name: existing.name }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
