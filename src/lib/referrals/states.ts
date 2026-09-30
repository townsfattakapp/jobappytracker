/**
 * Referral request state machine. Every transition is validated here on the
 * server; clients only ask for actions, never set a status. Learner-facing
 * labels hide internal assignment mechanics (a learner never learns who was
 * assigned or how many referrers were tried).
 */

export const REQUEST_STATUSES = [
  'DRAFT',
  'READINESS_REQUIRED',
  'READY',
  'SUBMITTED',
  'SCREENING',
  'MATCHING',
  'ASSIGNED',
  'REFERRER_REVIEW',
  'CLARIFICATION_REQUESTED',
  'ACCEPTED',
  'DECLINED',
  'REASSIGNING',
  'REFERRAL_PENDING',
  'REFERRAL_SUBMITTED',
  'REFERRAL_CONFIRMED',
  'CLOSED',
  'CANCELLED',
  'EXPIRED',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  DRAFT: ['READINESS_REQUIRED', 'READY', 'CANCELLED'],
  READINESS_REQUIRED: ['READY', 'READINESS_REQUIRED', 'CANCELLED'],
  READY: ['SUBMITTED', 'READY', 'READINESS_REQUIRED', 'CANCELLED'],
  SUBMITTED: ['SCREENING', 'CANCELLED'],
  SCREENING: ['MATCHING', 'CLOSED', 'CANCELLED'],
  MATCHING: ['ASSIGNED', 'CLOSED', 'CANCELLED'],
  ASSIGNED: ['REFERRER_REVIEW', 'CLARIFICATION_REQUESTED', 'ACCEPTED', 'DECLINED', 'REASSIGNING', 'CANCELLED', 'EXPIRED', 'CLOSED'],
  REFERRER_REVIEW: ['CLARIFICATION_REQUESTED', 'ACCEPTED', 'DECLINED', 'REASSIGNING', 'CANCELLED', 'EXPIRED', 'CLOSED'],
  CLARIFICATION_REQUESTED: ['REFERRER_REVIEW', 'ACCEPTED', 'DECLINED', 'REASSIGNING', 'CANCELLED', 'EXPIRED', 'CLOSED'],
  ACCEPTED: ['REFERRAL_PENDING', 'CANCELLED', 'CLOSED'],
  DECLINED: ['REASSIGNING', 'CLOSED'],
  REASSIGNING: ['MATCHING', 'CLOSED'],
  REFERRAL_PENDING: ['REFERRAL_SUBMITTED', 'DECLINED', 'CANCELLED', 'EXPIRED', 'CLOSED'],
  REFERRAL_SUBMITTED: ['REFERRAL_CONFIRMED', 'CLOSED'],
  REFERRAL_CONFIRMED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: [],
}

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function assertTransition(from: RequestStatus, to: RequestStatus): void {
  if (!canTransition(from, to)) throw new Error(`Referral request cannot move from ${from} to ${to}`)
}

export const TERMINAL_STATUSES: RequestStatus[] = ['CLOSED', 'CANCELLED', 'EXPIRED']
export function isTerminal(status: RequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/** Statuses that count against the learner's "open requests" limit and hold a credit reservation. */
export const OPEN_STATUSES: RequestStatus[] = ['SUBMITTED', 'SCREENING', 'MATCHING', 'ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED', 'ACCEPTED', 'DECLINED', 'REASSIGNING', 'REFERRAL_PENDING']
export function isOpen(status: RequestStatus): boolean {
  return OPEN_STATUSES.includes(status)
}

/** Statuses in which a referrer holds the request and the learner may still cancel. */
export const LEARNER_CANCELLABLE: RequestStatus[] = ['DRAFT', 'READINESS_REQUIRED', 'READY', 'SUBMITTED', 'SCREENING', 'MATCHING', 'ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED']

/** What a learner sees. Internal states collapse so assignment mechanics stay private. */
export type LearnerStage = 'draft' | 'readiness' | 'ready' | 'submitted' | 'matching' | 'referrer_review' | 'needs_your_reply' | 'accepted' | 'referral_submitted' | 'closed' | 'cancelled' | 'expired'

export function learnerStage(status: RequestStatus): LearnerStage {
  switch (status) {
    case 'DRAFT':
      return 'draft'
    case 'READINESS_REQUIRED':
      return 'readiness'
    case 'READY':
      return 'ready'
    case 'SUBMITTED':
    case 'SCREENING':
      return 'submitted'
    case 'MATCHING':
    case 'DECLINED':
    case 'REASSIGNING':
      return 'matching'
    case 'ASSIGNED':
    case 'REFERRER_REVIEW':
      return 'referrer_review'
    case 'CLARIFICATION_REQUESTED':
      return 'needs_your_reply'
    case 'ACCEPTED':
    case 'REFERRAL_PENDING':
      return 'accepted'
    case 'REFERRAL_SUBMITTED':
    case 'REFERRAL_CONFIRMED':
      return 'referral_submitted'
    case 'CLOSED':
      return 'closed'
    case 'CANCELLED':
      return 'cancelled'
    case 'EXPIRED':
      return 'expired'
  }
}

export const LEARNER_STAGE_LABELS: Record<LearnerStage, string> = {
  draft: 'Draft',
  readiness: 'Readiness required',
  ready: 'Ready to submit',
  submitted: 'Request submitted',
  matching: 'Matching with verified employee',
  referrer_review: 'Under technical vetting & screening',
  needs_your_reply: 'Referrer screening question',
  accepted: 'Qualified & Referral approved',
  referral_submitted: 'Referral submitted internally',
  closed: 'Closed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

/** The ordered timeline shown to learners; the current stage is highlighted, later ones are pending. */
export const LEARNER_TIMELINE: { stage: LearnerStage; label: string }[] = [
  { stage: 'submitted', label: 'Requested' },
  { stage: 'matching', label: 'Matching' },
  { stage: 'referrer_review', label: 'Technical Screening' },
  { stage: 'accepted', label: 'Qualified' },
  { stage: 'referral_submitted', label: 'Endorsed & Submitted' },
]

export const DECLINE_REASONS = ['not_enough_context', 'profile_not_relevant', 'already_applied', 'policy_restriction', 'cannot_refer_role', 'capacity', 'other'] as const
export type DeclineReason = (typeof DECLINE_REASONS)[number]
export const DECLINE_REASON_LABELS: Record<DeclineReason, string> = {
  not_enough_context: 'Not enough context',
  profile_not_relevant: 'Profile not relevant for this role',
  already_applied: 'Candidate already applied',
  policy_restriction: 'Company policy restriction',
  cannot_refer_role: 'Cannot refer this role',
  capacity: 'No capacity right now',
  other: 'Other',
}

export const CLOSE_REASONS = ['no_referrer_available', 'company_referrals_disabled', 'job_expired', 'attempts_exhausted', 'referrer_unavailable', 'system_failure', 'completed', 'admin', 'learner_cancelled', 'request_expired'] as const
export type CloseReason = (typeof CLOSE_REASONS)[number]

/** Close reasons after which the reserved credit goes back to the learner. Completed requests consumed it when accepted. */
export const CREDIT_RELEASING_REASONS: CloseReason[] = ['no_referrer_available', 'company_referrals_disabled', 'job_expired', 'attempts_exhausted', 'referrer_unavailable', 'system_failure', 'learner_cancelled', 'request_expired', 'admin']

export const CLOSE_REASON_LABELS: Record<CloseReason, string> = {
  no_referrer_available: 'No verified referrer is currently available for this role.',
  company_referrals_disabled: 'This company does not take referral requests through JobAppy right now.',
  job_expired: 'The opening closed before a referral could be made.',
  attempts_exhausted: 'Every eligible referrer has reviewed this request; none could take it on.',
  referrer_unavailable: 'The assigned referrer is no longer available and no other referrer could take it on.',
  system_failure: 'Something went wrong on our side; the request was closed and your credit returned.',
  completed: 'Completed.',
  admin: 'Closed by JobAppy support.',
  learner_cancelled: 'Cancelled by you.',
  request_expired: 'The request expired without a referral.',
}
