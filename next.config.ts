import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Interview dictation needs microphone permission on this origin.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['pg', 'pdf-parse'],
  output: 'standalone',
  experimental: {
    // Cloud sync posts the learner's whole local state through a server action. The default 1 MB cap
    // made accounts with a year of history fail with an opaque "Minified React error #441"; 4 MB keeps
    // us under Vercel's 4.5 MB request-body limit, and cloudSync.ts refuses larger payloads with a clear message.
    serverActions: { bodySizeLimit: '4mb' },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
