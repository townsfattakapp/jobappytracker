import { eq } from 'drizzle-orm'
import { db } from '../db'
import { jobPreparations, learnerJobPreferences, outreachContacts, resumeAnalyses, resumes, usageCounters } from '../db/schema'
import { logEvent } from './log'

/**
 * Learner-controlled deletion of Career OS data. Removes only records the
 * learner owns; shared job, company and source data is never touched.
 * Account deletion itself cascades the same tables through the users FK.
 */
export interface DeletionReport {
  resumes: number
  resumeAnalyses: number
  outreachContacts: number
  jobPreparations: number
  jobPreferences: number
  usageCounters: number
}

export async function deleteLearnerCareerData(userId: string): Promise<DeletionReport> {
  const analyses = await db.delete(resumeAnalyses).where(eq(resumeAnalyses.userId, userId)).returning({ id: resumeAnalyses.id })
  const res = await db.delete(resumes).where(eq(resumes.userId, userId)).returning({ id: resumes.id })
  const outreach = await db.delete(outreachContacts).where(eq(outreachContacts.userId, userId)).returning({ id: outreachContacts.id })
  const preps = await db.delete(jobPreparations).where(eq(jobPreparations.userId, userId)).returning({ id: jobPreparations.id })
  const prefs = await db.delete(learnerJobPreferences).where(eq(learnerJobPreferences.userId, userId)).returning({ userId: learnerJobPreferences.userId })
  const usage = await db.delete(usageCounters).where(eq(usageCounters.userId, userId)).returning({ key: usageCounters.key })
  const report: DeletionReport = { resumes: res.length, resumeAnalyses: analyses.length, outreachContacts: outreach.length, jobPreparations: preps.length, jobPreferences: prefs.length, usageCounters: usage.length }
  logEvent('info', 'account.career_data_deleted', { userId, ...report })
  return report
}
