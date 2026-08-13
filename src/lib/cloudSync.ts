import { ID, Permission, Role } from 'appwrite'
import type { Models } from 'appwrite'
import {
  APPWRITE_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
  account,
  databases,
  isAppwriteConfigured,
} from './appwrite'
import {
  emptyGmailSyncState,
  type GmailSyncState,
  type JobApplication,
  type PrepNote,
  type Storage,
} from '../types'

export type AppUser = Models.User<Models.Preferences>

export type CloudPayload = {
  applications: JobApplication[]
  prepNotes: PrepNote[]
  version: number
  gmailSync?: GmailSyncState
}

function toPayload(
  storage: Pick<Storage, 'applications' | 'prepNotes' | 'version' | 'gmailSync'>,
): CloudPayload {
  return {
    applications: storage.applications,
    prepNotes: storage.prepNotes || [],
    version: storage.version ?? 1,
    gmailSync: storage.gmailSync || emptyGmailSyncState(),
  }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isAppwriteConfigured) return null
  try {
    return await account.get()
  } catch {
    return null
  }
}

export async function signUp(email: string, password: string, name?: string): Promise<AppUser> {
  await account.create({
    userId: ID.unique(),
    email,
    password,
    name: name || undefined,
  })
  await account.createEmailPasswordSession({ email, password })
  return account.get()
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  await account.createEmailPasswordSession({ email, password })
  return account.get()
}

export async function signOut(): Promise<void> {
  try {
    await account.deleteSession({ sessionId: 'current' })
  } catch {
    // already signed out
  }
}

export async function loadCloudState(userId: string): Promise<CloudPayload | null> {
  try {
    const doc = await databases.getDocument({
      databaseId: APPWRITE_DATABASE_ID,
      collectionId: APPWRITE_COLLECTION_ID,
      documentId: userId,
    })
    const raw = (doc as { data?: string }).data
    if (!raw) return null
    const parsed = JSON.parse(raw) as CloudPayload
    if (!parsed || !Array.isArray(parsed.applications)) return null
    return {
      applications: parsed.applications,
      prepNotes: Array.isArray(parsed.prepNotes) ? parsed.prepNotes : [],
      version: parsed.version ?? 1,
      gmailSync: parsed.gmailSync || emptyGmailSyncState(),
    }
  } catch {
    return null
  }
}

export async function saveCloudState(
  userId: string,
  storage: Pick<Storage, 'applications' | 'prepNotes' | 'version' | 'gmailSync'>,
): Promise<void> {
  const data = JSON.stringify(toPayload(storage))
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]

  await databases.upsertDocument({
    databaseId: APPWRITE_DATABASE_ID,
    collectionId: APPWRITE_COLLECTION_ID,
    documentId: userId,
    data: { data },
    permissions,
  })
}
