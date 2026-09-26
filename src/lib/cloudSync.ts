import { exportLocalHistory, importLocalHistory } from "../db";
import { mergeStorage } from './mergeStorage';
import type {
  GmailSyncState,
  JobApplication,
  PrepNote,
  Goal,
  RoadmapDay,
  DsaProblem,
  DsaAttemptSummary,
  RevisionItem,
  EngineeringLab,
  LabAttemptSummary,
  MockInterviewSummary,
  LeetCodeConfig,
  LearningTrack,
  SystemDesignExercise,
  SystemDesignAttemptSummary,
  KnowledgeWorkspace,
  Storage,
} from "../types";
import {
  serverLoadCloudState,
  serverSaveCloudState,
} from "../app/actions/cloud";
// next-auth client
import { authErrorMessage, EMAIL_NOT_VERIFIED, VERIFY_EMAIL_SENT } from "./authErrors";
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  getSession,
} from "next-auth/react";

export type AppUser = {
  $id: string;
  name: string;
  email: string;
};

export type CloudPayload = {
  applications: JobApplication[];
  prepNotes: PrepNote[];
  version: number;
  gmailSync?: GmailSyncState;
  goals?: Goal[];
  roadmap?: RoadmapDay[];
  dsaProblems?: DsaProblem[];
  dsaAttemptSummaries?: DsaAttemptSummary[];
  revisionItems?: RevisionItem[];
  engineeringLabs?: EngineeringLab[];
  labAttemptSummaries?: LabAttemptSummary[];
  mockInterviewSummaries?: MockInterviewSummary[];
  leetCodeConfig?: LeetCodeConfig;
  learningTracks?: LearningTrack[];
  systemDesignExercises?: SystemDesignExercise[];
  systemDesignAttemptSummaries?: SystemDesignAttemptSummary[];
  knowledgeWorkspaces?: KnowledgeWorkspace[];
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getSession().catch(() => null);
  if (session?.user) {
    return {
      $id: session.user.id || "",
      name: session.user.name || "",
      email: session.user.email || "",
    };
  }
  return null;
}

export interface SignUpResult {
  user: AppUser | null
  /** True when a confirmation email was sent and there is no session yet. */
  verificationSent: boolean
}

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<SignUpResult> {
  const res = await nextAuthSignIn("credentials", {
    redirect: false,
    email: email.trim().toLowerCase(),
    password,
    name: name || "",
    mode: "signup",
  });
  const code = res?.code || res?.error;
  if (code === VERIFY_EMAIL_SENT) return { user: null, verificationSent: true };
  if (!res || res.error) throw new Error(authErrorMessage(code));
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign up failed");
  return { user, verificationSent: false };
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super(authErrorMessage(EMAIL_NOT_VERIFIED));
    this.name = "EmailNotVerifiedError";
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AppUser> {
  const res = await nextAuthSignIn("credentials", {
    redirect: false,
    email: email.trim().toLowerCase(),
    password,
    mode: "signin",
  });
  const code = res?.code || res?.error;
  if (code === EMAIL_NOT_VERIFIED) throw new EmailNotVerifiedError();
  if (!res || res.error) throw new Error(authErrorMessage(code));
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in failed");
  return user;
}

/** Starts the Google OAuth redirect; the browser leaves the page. */
export async function signInWithGoogle(): Promise<void> {
  await nextAuthSignIn("google", { callbackUrl: "/app" });
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const res = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error || "Could not resend the email");
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirect: false });
}

let saveQueue: Promise<void> = Promise.resolve();
const revisionKey = (id: string) => `jobappy-cloud-revision:${id}`;
const pendingKey = (id: string) => `jobappy-cloud-pending:${id}`;
export async function loadCloudState(
  userId: string,
): Promise<CloudPayload | null> {
  const pending = localStorage.getItem(pendingKey(userId));
  if (pending) await saveCloudState(userId, JSON.parse(pending));
  const state = await serverLoadCloudState();
  localStorage.setItem(revisionKey(userId), String(state?.revision || 0));
  if (state?.payload.learningHistory)
    await importLocalHistory(state.payload.learningHistory);
  return state?.payload as CloudPayload | null;
}
/** Fired on window with the merged snapshot after a conflict was resolved automatically. */
export const CLOUD_MERGED_EVENT = 'jobappy:cloud-merged';
export const CLOUD_CONFLICT_MESSAGE =
  'Another device has newer changes. Your local work is kept. Export a backup before resolving the cloud conflict.';

const MAX_MERGE_ATTEMPTS = 3;

/** Server actions accept 4 MB (next.config.ts); the learning history is added on top of the snapshot, so stop a little earlier. */
export const CLOUD_SYNC_LIMIT_BYTES = 3_500_000;
export const CLOUD_TOO_LARGE_MESSAGE = (bytes: number) =>
  `Your data (${(bytes / 1_000_000).toFixed(1)} MB) is above the ${(CLOUD_SYNC_LIMIT_BYTES / 1_000_000).toFixed(1)} MB cloud sync limit. It stays saved on this device; export a backup from Settings and clear old history to resume syncing.`;

/**
 * Turns a failed sync into words a learner can act on. In production a server
 * action that throws (or a request the server refused, e.g. an oversized body)
 * reaches the browser as React's masked "Minified React error #441 … Server
 * Components render" message, which says nothing useful.
 */
export function syncErrorMessage(err: unknown, fallback = 'Cloud sync failed'): string {
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!message) return fallback;
  if (/Minified React error #441|Server Components render|digest/i.test(message))
    return 'The server could not save your data just now. Your work is kept on this device; use Retry sync, or export a backup from Settings if it keeps failing.';
  if (/Not authenticated|Unauthorized/i.test(message)) return 'Your session has ended. Sign in again to resume cloud sync; your work is kept on this device.';
  if (/Failed to fetch|NetworkError|Load failed|network/i.test(message)) return 'No connection to the server. Your work is kept on this device and will sync when you are back online.';
  return message;
}

export function saveCloudState(
  userId: string,
  storage: Storage,
): Promise<void> {
  const serialized = JSON.stringify(storage);
  localStorage.setItem(pendingKey(userId), serialized);
  if (serialized.length > CLOUD_SYNC_LIMIT_BYTES) {
    const tooLarge = Promise.reject(new Error(CLOUD_TOO_LARGE_MESSAGE(serialized.length)));
    tooLarge.catch(() => {});
    return tooLarge;
  }
  const operation = saveQueue
    .catch(() => {})
    .then(async () => {
      let revision = Number(localStorage.getItem(revisionKey(userId)) || 0);
      let current: Storage = storage;
      let merged = false;
      for (let attempt = 0; attempt < MAX_MERGE_ATTEMPTS; attempt += 1) {
        const learningHistory = await exportLocalHistory();
        const result = await serverSaveCloudState(
          { ...current, learningHistory },
          revision,
        );
        if (typeof result === 'number') {
          localStorage.setItem(revisionKey(userId), String(result));
          if (localStorage.getItem(pendingKey(userId)) === serialized)
            localStorage.removeItem(pendingKey(userId));
          if (merged)
            window.dispatchEvent(
              new CustomEvent(CLOUD_MERGED_EVENT, { detail: current }),
            );
          return;
        }
        // Someone else saved first: fold their copy into ours and try again with their revision.
        revision = result.revision;
        if (result.payload) {
          if (result.payload.learningHistory)
            await importLocalHistory(result.payload.learningHistory);
          current = mergeStorage(current, result.payload);
          merged = true;
        }
      }
      throw new Error(CLOUD_CONFLICT_MESSAGE);
    });
  saveQueue = operation;
  return operation;
}
