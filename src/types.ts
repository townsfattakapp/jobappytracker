export interface JobApplication {
  id: string
  company: string
  role: string
  jobUrl: string
  location: string
  salary: string | null
  appliedDate: string | null
  source: string | null
  notes: string
  status: Status
  followUpDate: string | null
  createdAt: string
  updatedAt: string
  pinned: boolean
  interviewRounds: InterviewRound[]
  contacts: Contact[]
  /** Gmail message ids linked to this application */
  gmailMessageIds?: string[]
  gmailThreadId?: string | null
  recruiterName?: string | null
  recruiterEmail?: string | null
  interviewDate?: string | null
  /** Set when the application was created from a JobAppy job listing: canonical job and analysis references. */
  jobRef?: { jobId: string; companyId: string; resumeAnalysisId?: string | null } | null
}

export interface Contact {
  id: string
  name: string
  role: string
  email: string
  linkedin: string
}

export interface Attachment {
  id: string
  filename: string
  size: number
  type: string
}

export interface PrepNote {
  id: string
  title: string
  content: string
  attachments: Attachment[]
  updatedAt: string
  createdAt: string
  linkedEntityId?: string
  linkedEntityType?: string
}

export interface InterviewRound {
  id: string
  name: string
  date: string | null
  notes: string
  passed: boolean | null
}

export type Status =
  | 'Wishlist'
  | 'Applied'
  | 'Under Review'
  | 'Assessment'
  | 'Interview'
  | 'HR Round'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'

export const STATUS_ORDER: Status[] = [
  'Wishlist',
  'Applied',
  'Under Review',
  'Assessment',
  'Interview',
  'HR Round',
  'Offer',
  'Rejected',
  'Withdrawn',
]

export const ACTIVE_STATUSES: Status[] = [
  'Wishlist',
  'Applied',
  'Under Review',
  'Assessment',
  'Interview',
  'HR Round',
  'Offer',
]

export type GmailParseMethod = 'rules' | 'ai' | 'manual' | 'skipped'

export interface GmailSyncedEmail {
  messageId: string
  threadId: string
  subject: string
  from: string
  snippet: string
  internalDate: string
  processedAt: string
  applicationId: string | null
  company: string
  role: string
  status: Status | null
  confidence: 'high' | 'medium' | 'low'
  method: GmailParseMethod
  skipped: boolean
  skipReason?: string
  jobUrl?: string
  recruiterName?: string
  recruiterEmail?: string
  interviewDate?: string | null
}

export interface GmailSyncState {
  connectedEmail: string | null
  lastSyncAt: string | null
  /** Gmail history id from last successful list (informational) */
  lastHistoryId: string | null
  processedMessageIds: string[]
  syncedEmails: GmailSyncedEmail[]
}

export function emptyGmailSyncState(): GmailSyncState {
  return {
    connectedEmail: null,
    lastSyncAt: null,
    lastHistoryId: null,
    processedMessageIds: [],
    syncedEmails: [],
  }
}



// --- NEW ZERO-TO-MASTERY CURRICULUM TYPES ---
export type CurriculumTaskType = 'Concept' | 'Coding' | 'Practice' | 'Project' | 'Revision' | 'Assessment' | 'Interview';

export interface CurriculumTaskDef {
  id: string;
  title: string;
  type: CurriculumTaskType;
  estDurationMinutes: number;
  description?: string;
  links?: { title: string; url: string }[];
}

export interface TopicNote {
  id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  versionHistory?: { updatedAt: string; content: string }[];
}

export interface TopicExample {
  id: string;
  title: string;
  problemStatement: string;
  inputOutput: string;
  explanation: string;
  dryRun?: string;
  implementationCode?: string;
  implementationLanguage?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  commonMistakes?: string;
}

export interface TopicDiagram {
  id: string;
  title: string;
  type?: 'Class' | 'Sequence' | 'Activity' | 'State' | 'Use Case' | 'Object' | 'Component' | 'Deployment' | 'Package' | 'Communication' | 'ERD' | 'Flowchart' | 'Architecture' | 'DFD' | 'General';
  mermaidCode: string;
  visualState?: string;
  creationMethod?: 'visual' | 'code' | 'ai' | 'template';
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  versionHistory?: { updatedAt: string; mermaidCode: string; visualState?: string }[];
  linkedTaskId?: string;
}

export interface TopicCodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
}

export interface TopicFlashcard {
  id: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  dueDate: string;
}

export interface KnowledgeWorkspace {
  topicId: string;
  /** Set when this workspace belongs to an interview question rather than a topic. */
  questionId?: string;
  userAnswers?: { mode: 'Interview' | 'Quiz' | 'Coding'; answer: string; feedback?: string; date: string }[];
  learningStatus: 'Not Started' | 'Learning' | 'Practicing' | 'Needs Revision' | 'Mastered';
  quizAnswers?: Record<string, string>;
  bookmarked?: boolean;
  lastStudiedAt?: string;
  confidenceRating?: 1 | 2 | 3 | 4 | 5;
  lastRevisionDate?: string;
  nextRevisionDate?: string;
  notes: TopicNote[];
  examples: TopicExample[];
  diagrams: TopicDiagram[];
  codeSnippets: TopicCodeSnippet[];
  mistakes: string[];
  flashcards: TopicFlashcard[];
  linkedActivities: {
    type: 'DSA' | 'LeetCode' | 'SystemDesign' | 'Lab' | 'Mock';
    activityId: string;
    notes?: string;
  }[];
  customResources: { title: string; url: string }[];
}

export interface InterviewQuestionDef {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'Conceptual' | 'Practical' | 'Coding' | 'Scenario-Based' | 'Troubleshooting' | 'System Design';
  estDurationMinutes: number;
  prerequisites?: string[];
  relatedTopics?: string[];
  learningObjectives?: string[];
  interviewRelevance?: string;
  beginnerExplanation?: string;
  detailedExplanation?: string;
  realWorldExample?: string;
  interviewAnswer?: string;
  followUpQuestions?: { q: string; a: string }[];
  commonMistakes?: string[];
}

export interface InterviewQuestionWorkspace {
  questionId: string;
  learningStatus: 'Not Started' | 'Learning' | 'Practicing' | 'Needs Revision' | 'Mastered';
  bookmarked?: boolean;
  lastStudiedAt?: string;
  confidenceRating?: 1 | 2 | 3 | 4 | 5;
  lastRevisionDate?: string;
  nextRevisionDate?: string;
  notes: TopicNote[];
  diagrams: TopicDiagram[];
  codeSnippets: TopicCodeSnippet[];
  flashcards: TopicFlashcard[];
  userAnswers: { mode: 'Interview' | 'Quiz' | 'Coding'; answer: string; feedback?: string; date: string }[];
  customResources: { title: string; url: string }[];
}

export interface CurriculumSubtopic {
  id: string;
  title: string;
  description?: string;
  tasks: CurriculumTaskDef[];
  questions?: InterviewQuestionDef[];
}

export interface CurriculumTopic {
  prerequisites?: string[];
  quiz?: { question: string; answer: string }[];
  id: string;
  title: string;
  description?: string;
  subtopics: CurriculumSubtopic[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  topics: CurriculumTopic[];
}

export interface CurriculumCategory {
  id: string;
  title: string;
  description?: string;
  modules: CurriculumModule[];
}

export type CurriculumLevelName = 'Beginner' | 'Intermediate' | 'Advanced' | 'Interview Ready' | 'Mastery' | 'All Levels';

export interface CurriculumLevel {
  id: string;
  name: CurriculumLevelName;
  categories: CurriculumCategory[];
}

export type CurriculumFamily =
  | 'Software Engineering Interviews'
  | 'Programming Languages'
  | 'Backend Frameworks'
  | 'AI & Generative AI'
  | 'Data Science'
  | 'Data Analytics & BI'
  | 'Data Engineering'
  | 'Mobile Development'
  | 'Frontend & Web'
  | 'Cloud, DevOps & Platform'
  | 'Cybersecurity'
  | 'Computer Science'
  | 'Personal';

export type CurriculumTrackKind = 'language' | 'framework' | 'domain' | 'tooling' | 'interview' | 'projects' | 'custom';

/** How the AI explains topics of a track and which language its code uses. */
export type CurriculumExplainMode = 'concept' | 'react' | 'node' | 'sql' | 'devops' | 'cs' | 'hld' | 'lld' | 'data' | 'tool' | 'math' | 'security';

export interface CurriculumCodeProfile {
  /** Human wording used in prompts and button labels, e.g. "Python" or "SQL (PostgreSQL dialect)". */
  label: string;
  /** Highlighter / editor id for generated snippets. */
  id: string;
  /** True when the track dictates the language and the learner's preference is ignored. */
  fixed: boolean;
}

export type CurriculumStatus = 'draft' | 'review' | 'published' | 'archived';

export interface CurriculumTrack {
  id: string;
  title: string;
  description: string;
  /** Track ids that should be studied first. */
  prerequisites: string[];
  levels: CurriculumLevel[];
  // --- Metadata (optional; built-in tracks set it, personal tracks may not) ---
  family?: CurriculumFamily;
  kind?: CurriculumTrackKind;
  tags?: string[];
  /** Programming languages the track is taught in. */
  languages?: string[];
  explainMode?: CurriculumExplainMode;
  code?: CurriculumCodeProfile;
  /** Which linked activities make sense for this track. */
  supports?: { coding?: boolean; leetcode?: boolean; design?: boolean; labs?: boolean; project?: boolean; practice?: boolean };
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  icon?: string;
  /** Where the track comes from: shipped with the app, published by a curriculum admin, or created by this learner. */
  source?: 'builtin' | 'shared' | 'personal';
  status?: CurriculumStatus;
  version?: number;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerPath {
  id: string;
  title: string;
  family: CurriculumFamily;
  description: string;
  /** Suggested tracks in study order; the learner can add, remove and reorder. */
  tracks: { trackId: string; priority: GoalTrack['priority']; note?: string }[];
  languages?: string[];
  roles?: string[];
  icon?: string;
}

export interface CurriculumProgress {
  [curriculumTaskId: string]: 'Pending' | 'InProgress' | 'Completed' | 'Skipped';
}

export interface GoalTrack {
  trackId: string
  priority: 'High' | 'Medium' | 'Low'
  /** Explicit topic selection. Undefined means every topic of the track. */
  topicIds?: string[]
  /** Topics the learner removed from this goal. */
  excludedTopicIds?: string[]
  /** Study order among the goal's tracks (lower first). */
  order?: number
}

export type GoalOutcome = 'career' | 'language' | 'framework' | 'interview' | 'project' | 'custom'
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface LearningTrack {
  id: string
  name: string
  description: string
  prerequisites: string[]
  category: 'DSA' | 'Backend' | 'Frontend' | 'System Design' | 'CS Fundamentals' | 'DevOps' | 'Other'
  status: 'Active' | 'Paused' | 'Completed' | 'Archived'
  order: number
  topics: Topic[]
}

export interface Topic {
  id: string
  name: string
  description?: string
  activities: string[]
}

export interface StudyTask {
  id: string
  dayId: string
  title: string
  type: 'DSA' | 'SystemDesign' | 'Core' | 'App' | 'Mock' | 'Engineering' | 'InterviewQuestion' | 'Other' | CurriculumTaskType
  status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped'
  estDurationMinutes: number
  actualDurationMinutes: number
  priority: 'High' | 'Medium' | 'Low'
  topicId?: string
  trackId?: string
  categoryId?: string
  subtopicId?: string
  activity?: string
  description?: string
  completionCriteria?: string
  curriculumTaskId?: string
  linkedActivityId?: string
  /** Set when the task was added by a job-specific preparation plan (Career OS). */
  prepJobId?: string
}

export interface RoadmapDay {
  id: string
  goalId: string
  date: string
  dayNumber: number
  tasks: StudyTask[]
  notes?: string
  isRestDay?: boolean
}

export interface Goal {
  id: string
  targetRole: string
  companyType: string
  startDate: string
  /** Planning horizon in days. For ongoing goals this is a rolling window, not a deadline. */
  durationDays: number
  hoursPerDay: number
  /** Weekdays (0 = Sunday) with nothing scheduled. Empty means every day is a study day. */
  restDays: number[]
  tracks: GoalTrack[]
  status: 'Active' | 'Paused' | 'Completed' | 'Archived'
  goalType: 'Fixed' | 'Ongoing'
  createdAt: string
  updatedAt: string
  // --- Personalisation (all optional; older goals have none) ---
  name?: string
  description?: string
  outcome?: GoalOutcome
  careerPathId?: string
  experienceLevel?: ExperienceLevel
  /** Preferred programming languages for examples and practice. */
  languages?: string[]
  /** Optional deadline (YYYY-MM-DD). */
  targetDate?: string | null
  /** Topics the learner already knows; the roadmap skips them. */
  knownTopicIds?: string[]
  milestones?: { id: string; title: string; date: string }[]
}

export type DsaPattern =
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Fast & Slow Pointers'
  | 'Binary Search'
  | 'Stack & Monotonic Stack'
  | 'Linked List'
  | 'Trees (BFS & DFS)'
  | 'Binary Search Tree'
  | 'Tries'
  | 'Heap & Priority Queue'
  | 'Backtracking'
  | 'Graphs (BFS & DFS)'
  | 'Topological Sort'
  | '1D Dynamic Programming'
  | '2D Dynamic Programming'
  | 'Greedy & Intervals'
  | 'Bit Manipulation'
  | 'Union-Find'

export interface DsaExample {
  input: string
  output: string
  explanation?: string
}

export interface DsaHint {
  level: 1 | 2 | 3
  title: string
  content: string
}

export interface DsaSolution {
  approach: string
  intuition: string
  timeComplexity: string
  spaceComplexity: string
  keyTakeaway: string
  code: Record<string, string>
}

export interface DsaPatternBlueprint {
  whenToUse: string
  coreTemplate: string
  pitfalls: string
}

export interface DsaProblem {
  id: string
  title: string
  titleSlug?: string
  url?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  pattern?: DsaPattern | string
  tags: string[]
  languages: string[]
  status: 'Unattempted' | 'Attempted' | 'Solved'
  leetCodeStatus?: 'Accepted'
  linkedTaskId?: string
  // Enhanced curriculum fields
  companies?: string[]
  description?: string
  constraints?: string[]
  examples?: DsaExample[]
  starterCode?: Record<string, string>
  hints?: (string | DsaHint)[]
  solution?: DsaSolution
  patternBlueprint?: DsaPatternBlueprint
}

export interface DsaAttemptSummary {
  id: string
  problemId: string
  date: string
  hintsUsed: number
  outcome: 'Solved' | 'Solved with Hints' | 'Failed'
  confidence: 1 | 2 | 3 | 4 | 5
  timeSpentMinutes?: number
  language?: string
}

export interface DsaAttempt {
  id: string
  problemId: string
  date: string
  language: string
  code: string
  approach: string
  timeSpentMinutes: number
  timeComplexity: string
  spaceComplexity: string
  hintsUsed: number
  outcome: 'Solved' | 'Solved with Hints' | 'Failed'
  confidence: 1 | 2 | 3 | 4 | 5
  mistakesOrNotes?: string
}

export interface RevisionItem {
  id: string
  entityId: string
  entityType: 'DSA' | 'SystemDesign' | 'Concept'
  dueDate: string
  interval: number
  easeFactor: number
  topic?: string
}

export interface SystemDesignExercise {
  id: string
  title: string
  type: 'HLD' | 'LLD'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  status: 'Unattempted' | 'Attempted' | 'Solved'
}

export interface SystemDesignAiRubricCategory {
  id: string
  name: string
  score: number
  maxScore: number
  feedback: string
}

export interface SystemDesignAiReview {
  overallScore: number
  levelRating: 'L4 - Needs Preparation' | 'L4 - Solid Mid-Level' | 'L5 - Strong Senior' | 'L6 - Principal / Staff'
  verdict: 'Pass' | 'Borderline' | 'Needs Revision'
  executiveSummary: string
  categories: SystemDesignAiRubricCategory[]
  strengths: string[]
  criticalGaps: string[]
  recommendations: string[]
  reviewedAt: string
}

export interface SystemDesignScaffold {
  requirements: string
  architectureDiagram: string
  dataModel: string
  apiDesign: string
  bottlenecks: string
  code?: string
}

export interface SystemDesignReferenceBlueprint {
  title: string
  scaleAssumptions: string[]
  architectureDiagram: string
  dataModel: string
  apiDesign: string
  bottlenecksAndTradeoffs: string
  deepDiveNotes: string[]
  code?: string
}

export interface SystemDesignAttemptSummary {
  id: string
  exerciseId: string
  date: string
  rating?: 1 | 2 | 3 | 4 | 5
  outcome?: 'Solved' | 'Solved with Hints' | 'Failed' | 'Needs Review'
  notes?: string
  confidence?: number
  timeSpentMinutes?: number
  aiScore?: number
}

export interface SystemDesignAttemptDetail {
  id: string
  exerciseId: string
  date?: string
  architectureDiagram?: string
  componentNotes?: string
  tradeoffs?: string
  rating?: 1 | 2 | 3 | 4 | 5
  requirements?: string
  code?: string
  notes?: string
  dataModel?: string
  apiDesign?: string
  bottlenecks?: string
  timeSpentMinutes?: number
  aiReview?: SystemDesignAiReview
}

export interface LabVerificationTest {
  id: string
  name: string
  description: string
  expectedOutcome: string
}

export interface LabCodeFile {
  filename: string
  language: string
  code: string
  isBuggy?: boolean
  description?: string
}

export interface LabTerminalStep {
  command: string
  output: string
  delay?: number
}

export interface EngineeringLab {
  id: string
  ticketId: string
  title: string
  category?: 'Distributed Systems' | 'Databases & Cache' | 'Production Incidents' | 'Security & Auth' | 'DevOps & Cloud' | 'Frontend & Web' | 'API & System Architecture'
  type?: 'CI/CD' | 'Docker' | 'Cloud' | 'Security' | 'Frontend' | 'Backend' | 'Full Stack' | 'Distributed Systems' | 'Database' | 'SRE'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Easy' | 'Medium' | 'Hard'
  status: 'Open' | 'In Progress' | 'In Review' | 'Done' | 'Unattempted' | 'Attempted' | 'Solved'
  severity?: 'P0 - Critical Outage' | 'P1 - High Priority' | 'P2 - Moderate'
  impact?: string
  scenario: string
  estDurationMinutes: number
  requirements: string[]
  acceptanceCriteria: string[]
  techStack: string[]
  initialLogs?: string[]
  codeFiles?: LabCodeFile[]
  failingTest?: string
  hints?: {
    level: 1 | 2 | 3
    title: string
    content: string
  }[]
  solution?: {
    explanation: string
    fixedCode?: string
    fiveWhys?: string[]
    preventionRules?: string[]
  }
  verificationTests?: LabVerificationTest[]
  terminalSteps?: LabTerminalStep[]
  suggestedPromptChips?: string[]
}

export interface LabAttemptSummary {
  id: string
  labId: string
  date: string
  success?: boolean
  actualDurationMinutes: number
  outcome?: 'Done' | 'Failed' | 'In Progress' | 'In Review' | 'Solved' | 'Passed'
}

export interface LabAttemptDetail {
  id: string
  labId: string
  date?: string
  logs?: string
  success?: boolean
  investigationNotes?: string
  rootCause?: string
  solutionCode?: string
  testCases?: string
  prDescription?: string
  mentorTranscript?: any
}

export interface InterviewDimension {
  name: string
  /** 1 to 5 */
  score: number
  comment: string
}

export interface MockInterviewSummary {
  id: string
  date: string
  type?: 'Technical' | 'Behavioral' | 'System Design'
  category: string
  difficulty: string
  durationMinutes: number
  strengths: string[]
  improvementAreas: string[]
  recommendedRevisionTopics: string[]
  rating?: 1 | 2 | 3 | 4 | 5
  feedback?: string
  // --- Scorecard fields (AI interviews) ---
  roundId?: string
  personaId?: string
  plannedMinutes?: number
  overallScore?: number
  verdict?: 'Strong hire' | 'Hire' | 'Lean hire' | 'Lean no hire' | 'No hire'
  summary?: string
  dimensions?: InterviewDimension[]
  modelAnswers?: { question: string; answer: string }[]
  nextSteps?: string[]
  hintsUsed?: number
  questionsAsked?: number
  /** Present when the interview ended without a scorecard (AI failure or empty session). */
  incomplete?: boolean
}

export interface InterviewTurn {
  role: 'interviewer' | 'candidate'
  content: string
  code?: string
  language?: string
  diagram?: string
  /** Candidate turns: how the message was produced. */
  kind?: 'answer' | 'hint' | 'code' | 'diagram'
  /** Interviewer turns: conversation stage and private note for the scorecard. */
  stage?: 'intro' | 'question' | 'follow_up' | 'closing' | 'done'
  question?: number
  note?: string
  /** Milliseconds since the session started. */
  at?: number
}

export interface InterviewSessionTranscript {
  id: string
  sessionId?: string
  role?: 'user' | 'interviewer'
  content?: string
  transcript?: InterviewTurn[]
  roundId?: string
  level?: string
  personaId?: string
  plannedMinutes?: number
  startedAt?: string
}

export interface LeetCodeConfig {
  username: string
  lastSync: string | null
  totalSolved: number
}


export interface OnboardingState {
  completedAt: string | null
  skippedSteps: string[]
  careerPathId: string | null
  roleCategory: string | null
  experienceLevel: ExperienceLevel | null
  hoursPerDay: number | null
}

export interface UserPreferences {
  /** Preferred language for examples, snippets and the practice editor. */
  codeLanguage?: string
  /** First-time onboarding progress (Phase 8); synced with the account. */
  onboarding?: OnboardingState
}

export interface Storage {
  /** Serialised IndexedDB history (attempt details, transcripts, small attachments); filled in by cloud sync. */
  learningHistory?: string
  preferences?: UserPreferences
  applications: JobApplication[]
  version: number
  prepNotes?: PrepNote[]
  gmailSync?: GmailSyncState
  goals: Goal[]
  roadmap: RoadmapDay[]
  dsaProblems: DsaProblem[]
  dsaAttemptSummaries: DsaAttemptSummary[]
  revisionItems: RevisionItem[]
  engineeringLabs: EngineeringLab[]
  labAttemptSummaries: LabAttemptSummary[]
  mockInterviewSummaries: MockInterviewSummary[]
  leetCodeConfig: LeetCodeConfig
  systemDesignExercises: SystemDesignExercise[]
  systemDesignAttemptSummaries: SystemDesignAttemptSummary[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
  /** Learning tracks and topics this learner created (never public unless proposed and published). */
  customTracks?: CurriculumTrack[]
}

const STORAGE_KEY = 'job-app-tracker-v2'
const CORRUPT_BACKUP_KEY = 'job-app-tracker-v2.corrupt'

export function emptyLeetCodeConfig(): LeetCodeConfig {
  return { username: '', lastSync: null, totalSolved: 0 }
}

export function emptyStorage(): Storage {
  return {
    applications: [], version: 1, prepNotes: [], gmailSync: emptyGmailSyncState(), goals: [], roadmap: [],
    dsaProblems: [], dsaAttemptSummaries: [], revisionItems: [],
    engineeringLabs: [], labAttemptSummaries: [], mockInterviewSummaries: [],
    leetCodeConfig: emptyLeetCodeConfig(),
    systemDesignExercises: [], systemDesignAttemptSummaries: [], knowledgeWorkspaces: [], customTracks: [],
  }
}

/** Adds seed items that are missing from a stored collection (matched by id or slug) while enriching existing items with new seed properties and preserving user edits. */
export function mergeSeed<T extends { id: string; titleSlug?: string; ticketId?: string }>(stored: T[], seed: T[]): T[] {
  if (!stored.length) return seed
  const storedById = new Map<string, T>()
  const storedBySlug = new Map<string, T>()
  for (const item of stored) {
    storedById.set(item.id, item)
    if (item.titleSlug) storedBySlug.set(item.titleSlug, item)
    if (item.ticketId) storedBySlug.set(item.ticketId, item)
  }

  const merged: T[] = seed.map((seedItem) => {
    const existing =
      storedById.get(seedItem.id) ||
      (seedItem.titleSlug ? storedBySlug.get(seedItem.titleSlug) : undefined) ||
      (seedItem.ticketId ? storedBySlug.get(seedItem.ticketId) : undefined)
    if (existing) {
      return { ...seedItem, ...existing }
    }
    return seedItem
  })

  const seedIds = new Set(seed.map((s) => s.id))
  for (const item of stored) {
    if (!seedIds.has(item.id)) {
      merged.push(item)
    }
  }

  return merged
}

export function loadStorage(): Storage {
  let data: string | null = null
  try {
    data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as any
      if (parsed && Array.isArray(parsed.applications)) {
        
        // Backward compatibility migrations
        const goals = (parsed.goals || []).map((g: any) => ({
          ...g,
          targetRole: g.targetRole || g.role || 'Software Engineer',
          restDays: g.restDays || [],
          status: g.status || 'Active',
          goalType: g.goalType || 'Fixed',
          tracks: Array.isArray(g.tracks) 
            ? g.tracks.map((t: any) => typeof t === 'string' ? { trackId: t, priority: 'Medium' } : t) 
            : []
        }))

        const dsaProblems = (parsed.dsaProblems || []).map((p: any) => ({
          ...p,
          languages: p.languages || (p.language ? [p.language] : ['Java'])
        }))

        const revisionItems = (parsed.revisionItems || []).map((r: any) => ({
          ...r,
          entityId: r.entityId || r.problemId,
          entityType: r.entityType || 'DSA'
        }))

        return {
          applications: parsed.applications,
          version: parsed.version ?? 1,
          prepNotes: parsed.prepNotes || [],
          gmailSync: parsed.gmailSync || emptyGmailSyncState(),
          goals,
          roadmap: (parsed.roadmap || []).map((day: RoadmapDay) => {
            // Older goal previews used a new goal ID at save time. Recover only unambiguous ownership.
            if (goals.length === 1 && !goals.some((g: Goal) => g.id === day.goalId)) return {...day, goalId: goals[0].id}
            return day
          }),
          dsaProblems,
          dsaAttemptSummaries: parsed.dsaAttemptSummaries || [],
          revisionItems,
          engineeringLabs: parsed.engineeringLabs || [],
          labAttemptSummaries: parsed.labAttemptSummaries || [],
          mockInterviewSummaries: parsed.mockInterviewSummaries || [],
          leetCodeConfig: parsed.leetCodeConfig || emptyLeetCodeConfig(),
          systemDesignExercises: parsed.systemDesignExercises || [],
          systemDesignAttemptSummaries: parsed.systemDesignAttemptSummaries || [],
          knowledgeWorkspaces: parsed.knowledgeWorkspaces || [],
          customTracks: Array.isArray(parsed.customTracks) ? parsed.customTracks : [],
        }
      }
    }
  } catch {
    // Keep a copy of unreadable data so it is never silently overwritten.
    try {
      if (data) localStorage.setItem(CORRUPT_BACKUP_KEY, data)
    } catch {
      // nothing else we can do
    }
  }
  return emptyStorage()
}

export type StorageSaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' }

/** Persists to localStorage; never throws (quota / private mode are reported instead). */
export function saveStorage(storage: Storage): StorageSaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    return { ok: true }
  } catch (err) {
    const name = err instanceof Error ? err.name : ''
    return { ok: false, reason: /quota/i.test(name) ? 'quota' : 'unavailable' }
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export type NewJobApplication = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>

/** Parses 'YYYY-MM-DD' as a local calendar date (a bare ISO date is otherwise treated as UTC). */
export function parseLocalDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(value)
}

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isOverdue(followUpDate: string | null): boolean {
  if (!followUpDate) return false
  const due = parseLocalDate(followUpDate)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = parseLocalDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Prefer advancing statuses; still allow Rejected/Withdrawn updates. */
export function shouldApplyIncomingStatus(current: Status, incoming: Status): boolean {
  if (current === incoming) return false
  if (incoming === 'Rejected' || incoming === 'Withdrawn') return true
  if (current === 'Rejected' || current === 'Withdrawn') return false
  if (current === 'Offer' && incoming !== 'Offer') return false
  return STATUS_ORDER.indexOf(incoming) >= STATUS_ORDER.indexOf(current)
}
