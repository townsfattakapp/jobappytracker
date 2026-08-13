/** Google Identity Services typings (subset). */
export type GoogleTokenResponse = {
  access_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

type TokenClient = {
  requestAccessToken: (override?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
            error_callback?: (err: unknown) => void
          }) => TokenClient
          revoke: (token: string, done?: () => void) => void
        }
      }
    }
  }
}

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
const GIS_SRC = 'https://accounts.google.com/gsi/client'

let gisLoadPromise: Promise<void> | null = null
let cachedToken: { accessToken: string; expiresAt: number } | null = null

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || ''
}

export function isGmailConfigured(): boolean {
  return Boolean(getGoogleClientId())
}

export function getCachedGmailAccessToken(): string | null {
  if (!cachedToken) return null
  if (Date.now() >= cachedToken.expiresAt - 60_000) {
    cachedToken = null
    return null
  }
  return cachedToken.accessToken
}

export function clearGmailAccessToken(): void {
  const token = cachedToken?.accessToken
  cachedToken = null
  if (token && window.google?.accounts.oauth2.revoke) {
    try {
      window.google.accounts.oauth2.revoke(token)
    } catch {
      // ignore
    }
  }
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisLoadPromise) return gisLoadPromise

  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')))
      if (window.google?.accounts?.oauth2) resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })

  return gisLoadPromise
}

/** Request a Gmail readonly access token via GIS popup (user gesture required). */
export async function requestGmailAccessToken(options?: {
  forceConsent?: boolean
}): Promise<string> {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID — add your Google OAuth Web client ID')
  }

  const existing = getCachedGmailAccessToken()
  if (existing && !options?.forceConsent) return existing

  await loadGisScript()
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services unavailable')
  }

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description || response.error || 'Gmail authorization was cancelled',
            ),
          )
          return
        }
        const expiresIn = Number(response.expires_in || 3600)
        cachedToken = {
          accessToken: response.access_token,
          expiresAt: Date.now() + expiresIn * 1000,
        }
        resolve(response.access_token)
      },
      error_callback: (err) => {
        reject(err instanceof Error ? err : new Error('Gmail authorization failed'))
      },
    })

    client.requestAccessToken({
      prompt: options?.forceConsent ? 'consent' : '',
    })
  })
}
