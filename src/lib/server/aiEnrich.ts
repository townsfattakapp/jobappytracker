import { validateCoachSummary, validateFollowUp, validateInsights, validateNarrative, validateRefinedDraft } from '../ai/validators'
import type { InterviewQuestion, InterviewReport } from '../interview/jobInterview'
import type { Draft } from '../jobs/networking'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import type { JobDto } from '../jobs/types'
import { runAi } from './ai'

/**
 * Optional AI enrichment of deterministic results. Each helper returns null
 * on any failure (policy off, no provider, timeout, malformed or invalid
 * output) and the caller keeps its deterministic output. All of these send
 * learner content, so they are marked sensitive: one provider, no fallback.
 */
export interface AiNote {
  text: string
  provider: string
  requestId: string
}

const GUARD = 'Never claim or estimate hiring chances, never invent facts, projects, employers or numbers, and never mention that you are an AI.'

export async function refineFollowUp(userId: string, question: InterviewQuestion, answer: string, followUp: { intent: string; prompt: string }): Promise<AiNote | null> {
  const outcome = await runAi({
    feature: 'interview.followup',
    sensitivity: 'sensitive',
    userId,
    temperature: 0.4,
    maxTokens: 120,
    messages: [
      { role: 'system', content: `You are a calm, professional technical interviewer. Rephrase the follow-up question so it reacts naturally to the candidate's answer while keeping exactly the same intent (${followUp.intent}). One or two sentences, plain text, must end with a question mark. ${GUARD}` },
      { role: 'user', content: `Question asked: ${question.prompt}\n\nCandidate answer: ${answer.slice(0, 1500)}\n\nFollow-up to rephrase: ${followUp.prompt}` },
    ],
  })
  if (!outcome.ok) return null
  const text = validateFollowUp(outcome.result.content)
  return text ? { text, provider: `${outcome.result.provider}/${outcome.result.model}`, requestId: outcome.result.requestId } : null
}

export async function coachSummary(userId: string, report: InterviewReport, jobTitle: string): Promise<AiNote | null> {
  const facts = [`Strong areas: ${report.strongAreas.join('; ') || 'none'}`, `Needs improvement: ${report.needsImprovement.join('; ') || 'none'}`, `Missed concepts: ${report.missedConcepts.map((m) => m.concept).slice(0, 10).join(', ') || 'none'}`, `Communication: clarity ${report.communication.clarity}, structure ${report.communication.structure}, reasoning ${report.communication.reasoning}`].join('\n')
  const outcome = await runAi({
    feature: 'interview.feedback',
    sensitivity: 'sensitive',
    userId,
    temperature: 0.3,
    maxTokens: 260,
    messages: [
      { role: 'system', content: `You are an interview coach writing three or four sentences of practical advice for a candidate preparing for a ${jobTitle} role, based only on the evidence provided. Refer to the listed areas and concepts by name; do not add new ones. No scores, no percentages. ${GUARD}` },
      { role: 'user', content: facts },
    ],
  })
  if (!outcome.ok) return null
  const text = validateCoachSummary(outcome.result.content)
  return text ? { text, provider: `${outcome.result.provider}/${outcome.result.model}`, requestId: outcome.result.requestId } : null
}

export async function resumeInsights(userId: string, report: ResumeAnalysisReport, job: JobDto): Promise<{ items: string[]; provider: string; requestId: string } | null> {
  const known = [...report.skillsAlignment.map((r) => r.skill), ...report.projectRelevance.map((p) => p.name), ...report.keywords.map((k) => k.term)]
  const facts = {
    demonstrated: report.skillsAlignment.filter((r) => r.status === 'demonstrated').map((r) => ({ skill: r.skill, quote: r.evidence?.quote?.slice(0, 140) ?? null })),
    weak: report.skillsAlignment.filter((r) => r.status === 'weak').map((r) => r.skill),
    missing: report.skillsAlignment.filter((r) => r.status === 'missing').map((r) => ({ skill: r.skill, requirement: r.requirement })),
    projects: report.projectRelevance.map((p) => ({ name: p.name, matchedSkills: p.matchedSkills })),
    experience: report.experienceAlignment.verdict,
  }
  const outcome = await runAi<{ insights: string[] }>(
    {
      feature: 'resume.insights',
      sensitivity: 'sensitive',
      userId,
      json: true,
      temperature: 0.2,
      maxTokens: 500,
      messages: [
        { role: 'system', content: `You review a resume-versus-job analysis and write up to four short, specific insights (one sentence each) about how the candidate should present existing evidence for the ${job.title} role. Use only the facts given; name the skill or project each insight is about. Do not suggest adding skills the candidate does not have. Reply as JSON: {"insights": ["..."]}. ${GUARD}` },
        { role: 'user', content: JSON.stringify(facts) },
      ],
    },
    (data) => {
      const items = validateInsights(data, known)
      return items ? { insights: items } : null
    },
  )
  if (!outcome.ok || !outcome.result.data) return null
  return { items: outcome.result.data.insights, provider: `${outcome.result.provider}/${outcome.result.model}`, requestId: outcome.result.requestId }
}

export async function strategyNarrative(userId: string, job: JobDto, analysis: ResumeAnalysisReport | null): Promise<AiNote | null> {
  const facts = { job: { title: job.title, level: job.level, requiredSkills: job.requiredSkills, preferredSkills: job.preferredSkills }, resume: analysis ? { demonstrated: analysis.strongMatches.map((m) => m.skill), missing: analysis.missingOrWeak.map((m) => `${m.skill} (${m.status})`), projects: analysis.projectRelevance.map((p) => p.name), experience: analysis.experienceAlignment.verdict } : null }
  const outcome = await runAi({
    feature: 'strategy.narrative',
    sensitivity: 'sensitive',
    userId,
    temperature: 0.3,
    maxTokens: 320,
    messages: [
      { role: 'system', content: `Write a short application-guidance paragraph (four to six sentences) for a candidate applying to the ${job.title} role: what to lead with, what to address honestly, and the order to do things in. Only use the facts provided. ${GUARD}` },
      { role: 'user', content: JSON.stringify(facts) },
    ],
  })
  if (!outcome.ok) return null
  const text = validateNarrative(outcome.result.content)
  return text ? { text, provider: `${outcome.result.provider}/${outcome.result.model}`, requestId: outcome.result.requestId } : null
}

export async function refineDraft(userId: string, draft: Draft, jobTitle: string): Promise<AiNote | null> {
  const outcome = await runAi({
    feature: 'drafts.refine',
    sensitivity: 'sensitive',
    userId,
    temperature: 0.4,
    maxTokens: 400,
    messages: [
      { role: 'system', content: `Polish the wording of this outreach message for a ${jobTitle} application so it reads naturally and concisely. Keep every fact, every placeholder in square brackets exactly as written, the same meaning and roughly the same length. Do not add claims, names, numbers or relationships. Reply with the message text only. ${GUARD}` },
      { role: 'user', content: draft.body },
    ],
  })
  if (!outcome.ok) return null
  const text = validateRefinedDraft(outcome.result.content, draft.body, draft.placeholders)
  return text ? { text, provider: `${outcome.result.provider}/${outcome.result.model}`, requestId: outcome.result.requestId } : null
}
