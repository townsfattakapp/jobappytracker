import { Account, Client, Databases } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined

export const APPWRITE_DATABASE_ID =
  (import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined) || 'jobappy'
export const APPWRITE_COLLECTION_ID =
  (import.meta.env.VITE_APPWRITE_COLLECTION_ID as string | undefined) || 'app_state'

export const isAppwriteConfigured = Boolean(endpoint && projectId)

export const client = new Client()

if (isAppwriteConfigured) {
  client.setEndpoint(endpoint!).setProject(projectId!)
}

export const account = new Account(client)
export const databases = new Databases(client)

/** Lightweight connectivity check (Appwrite "ping"). */
export async function pingAppwrite(): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  if (!isAppwriteConfigured) {
    return { ok: false, message: 'Missing VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID' }
  }

  try {
    await account.get()
    return { ok: true, message: 'Connected to Appwrite (signed in)' }
  } catch (err: unknown) {
    const code =
      typeof err === 'object' && err && 'code' in err ? Number((err as { code: number }).code) : null
    const message = err instanceof Error ? err.message : String(err)
    if (code === 401 || message.toLowerCase().includes('unauthorized')) {
      return { ok: true, message: 'Connected to Appwrite (not signed in yet)' }
    }
    return { ok: false, message }
  }
}
