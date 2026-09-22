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
import { authErrorMessage } from "./authErrors";
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

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<AppUser> {
  const res = await nextAuthSignIn("credentials", {
    redirect: false,
    email: email.trim().toLowerCase(),
    password,
    name: name || "",
    mode: "signup",
  });
  if (!res || res.error) throw new Error(authErrorMessage(res?.code || res?.error));
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign up failed");
  return user;
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
  if (!res || res.error) throw new Error(authErrorMessage(res?.code || res?.error));
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in failed");
  return user;
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

export function saveCloudState(
  userId: string,
  storage: Storage,
): Promise<void> {
  const serialized = JSON.stringify(storage);
  localStorage.setItem(pendingKey(userId), serialized);
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
