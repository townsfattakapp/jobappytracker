/**
 * Public (browser-safe) configuration.
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` when the full name is written literally,
 * so every public variable must be read here with its exact name.
 */
export const publicEnv = {
  googleClientId: (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim(),
}
