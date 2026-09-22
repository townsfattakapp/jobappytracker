"use server";
import { auth } from "../../lib/auth";
import { db } from "../../lib/db";
import { careerState } from "../../lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { Storage } from "../../types";
export async function serverLoadCloudState() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const row = await db.query.careerState.findFirst({
    where: eq(careerState.userId, session.user.id),
  });
  return row ? { payload: row.payload, revision: row.revision } : null;
}
export async function serverSaveCloudState(
  storage: Storage,
  expectedRevision: number,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (
    !Array.isArray(storage.goals) ||
    !Array.isArray(storage.roadmap) ||
    !Array.isArray(storage.applications)
  )
    throw new Error("Invalid career data");
  const userId = session.user.id;
  if (expectedRevision === 0) {
    const rows = await db
      .insert(careerState)
      .values({ userId, payload: storage })
      .onConflictDoNothing()
      .returning({ revision: careerState.revision });
    if (rows.length) return rows[0].revision;
  } else {
    const rows = await db
      .update(careerState)
      .set({
        payload: storage,
        revision: expectedRevision + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(careerState.userId, userId),
          eq(careerState.revision, expectedRevision),
        ),
      )
      .returning({ revision: careerState.revision });
    if (rows.length) return rows[0].revision;
  }
  // A reload may interrupt the response after the write committed. Replay is idempotent.
  const same = await db.select({revision:careerState.revision}).from(careerState).where(and(eq(careerState.userId,userId),sql`${careerState.payload} = ${JSON.stringify(storage)}::jsonb`));
  if(same.length)return same[0].revision;
  // Another device wrote first. Hand back its copy so the client can merge and retry
  // rather than failing the request (a thrown error here surfaces as a 500 in the browser).
  const current = await db.query.careerState.findFirst({ where: eq(careerState.userId, userId) });
  return { conflict: true as const, revision: current?.revision ?? 0, payload: (current?.payload ?? null) as Storage | null };
}
