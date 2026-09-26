import type { SystemDesignExercise } from '../types'

export interface SystemDesignGuide {
  brief: string
  requirements: string[]
  hint: string
  review: string
  stretch: string
}

// Keep learning content separate from persisted exercise progress so existing
// learners receive updated briefs without overwriting their status or attempts.
export const systemDesignGuides: Record<string, SystemDesignGuide> = {
  'sd-design-a-url-shortener': {
    brief: 'Build a service that turns long URLs into short links and redirects visitors to the original destination.',
    requirements: ['Support link creation, redirects, and optional expiration.', 'Assume 1 million new links per day, 100 reads per write, and a 200-byte mapping. Estimate average requests per second and one year of raw storage.', 'Choose a redirect latency target and explain how you handle a popular link.'],
    hint: 'Separate identifier generation from redirects. Compare random codes with encoded sequence IDs; both need a collision or uniqueness strategy.',
    review: 'What happens on a cache miss, a code collision, or an expired link? Explain why your redirect status and cache policy fit expiration.',
    stretch: 'Add custom aliases and abuse reporting without slowing the redirect path.',
  },
  'sd-design-a-chat-application': {
    brief: 'Design direct and group messaging with reconnect support for mobile clients.',
    requirements: ['Send messages, show conversation history, and track delivery receipts.', 'Assume 100,000 concurrent connections and groups of up to 100 members.', 'Define ordering within a conversation and behavior while recipients are offline.'],
    hint: 'Give messages stable IDs and persist them before acknowledging acceptance. Separate connection routing from durable message history.',
    review: 'Can a reconnect create duplicates or gaps? Describe client deduplication and how the client resumes from its last received message.',
    stretch: 'Add multi-device synchronization and discuss how encryption changes server-side search.',
  },
  'sd-design-an-e-commerce-platform': {
    brief: 'Design a checkout flow that coordinates product inventory, orders, and an external payment provider.',
    requirements: ['Browse products, reserve stock, pay, and inspect order status.', 'Assume flash-sale demand of 10,000 checkout requests per second for a limited-stock item.', 'Define reservation expiry and recovery when payment succeeds but order confirmation fails.'],
    hint: 'Model checkout as explicit states with idempotent transitions. Identify which steps can be compensated and which require reconciliation.',
    review: 'Show how you prevent overselling and duplicate charges, including a delayed payment callback after reservation expiry.',
    stretch: 'Support split shipments and partial refunds with an audit trail.',
  },
  'sd-design-a-notification-system': {
    brief: 'Design email, push, and SMS delivery for product events and scheduled campaigns.',
    requirements: ['Respect channel preferences and distinguish transactional messages from marketing.', 'Assume 10 million notifications per day with a 10x peak over average.', 'Handle provider throttling, retries, and permanently invalid destinations.'],
    hint: 'Use channel-specific queues and provider adapters. Track a notification ID through retries and define a dead-letter recovery process.',
    review: 'Explain the limits of deduplication if a provider times out after accepting a message. How do urgent messages avoid campaign backlogs?',
    stretch: 'Add quiet hours across time zones and measure end-to-end delivery delay.',
  },
  'sd-design-a-parking-lot': {
    brief: 'Model a multi-floor parking lot with vehicle-specific spaces, tickets, and payment on exit.',
    requirements: ['Allocate a compatible free spot and issue a unique entry ticket.', 'Calculate a fee using a replaceable pricing policy and release the spot after successful payment.', 'Handle a full lot, invalid tickets, and simultaneous requests for the last spot.'],
    hint: 'Keep spot allocation and pricing separate. Make entry and exit operations preserve the invariant that one spot has at most one active ticket.',
    review: 'Walk through two concurrent entries and a repeated exit request. Can you introduce a new vehicle type without rewriting payment logic?',
    stretch: 'Add reservations and accessible spots with explicit allocation priorities.',
  },
  'sd-design-an-elevator-system': {
    brief: 'Model a bank of elevators that accepts hall calls and in-car floor selections.',
    requirements: ['Track each car position, direction, door state, and pending stops.', 'Separate dispatch policy from the movement and door state machine.', 'Handle capacity limits, emergency stops, and an out-of-service car.'],
    hint: 'Use explicit events for arrival and door closure. A dispatch strategy should choose a car without controlling its safety transitions.',
    review: 'Can a car move with doors open? Show how waiting requests avoid starvation when traffic favors one direction.',
    stretch: 'Implement a simulation comparing nearest-car and direction-aware dispatch.',
  },
  'sd-design-a-library-management-system': {
    brief: 'Model borrowing and returning physical copies of books in a small library.',
    requirements: ['Distinguish a book title from its individual lendable copies.', 'Support member borrowing limits, due dates, returns, and reservations.', 'Prevent two members from borrowing the same copy and reject duplicate returns.'],
    hint: 'Represent each loan as its own entity. Put borrowing rules in a policy instead of embedding them in the book record.',
    review: 'Trace an unavailable book reservation through a return. Which object owns the loan state and which enforces member eligibility?',
    stretch: 'Add renewal restrictions and different borrowing policies for students and staff.',
  },
  'sd-design-a-file-storage-service': {
    brief: 'Design a private file upload and download service with shareable, expiring access.',
    requirements: ['Upload files up to 1 GB, list metadata, and download only with authorization.', 'Assume 100,000 uploads per day at an average size of 10 MB; estimate daily storage growth.', 'Support interrupted uploads and prevent incomplete files appearing as ready.'],
    hint: 'Separate metadata from file bytes. Use an upload session and finalize only after validating all parts.',
    review: 'How do you clean up abandoned parts and revoke shared access? Explain how you keep metadata and object storage consistent.',
    stretch: 'Add version history and malware scanning before a file becomes downloadable.',
  },
  'sd-design-a-rate-limiter': {
    brief: 'Protect a public API with per-customer request limits across multiple gateway instances.',
    requirements: ['Allow 100 requests per minute per customer with a defined short burst allowance.', 'Return a clear rejection response and retry guidance.', 'Specify behavior if the shared counter store becomes unavailable.'],
    hint: 'Compare fixed windows, sliding windows, and token buckets. Counter updates must be atomic; document where your clock comes from.',
    review: 'Can clients bypass the limit by spreading requests across instances? Explain accuracy, latency, and availability trade-offs.',
    stretch: 'Add weighted endpoints and discuss regional versus global quotas.',
  },
  'sd-design-a-news-feed': {
    brief: 'Design a chronological feed of posts from accounts a user follows.',
    requirements: ['Create posts, follow accounts, and paginate a home feed.', 'Assume 10 million daily readers and a small number of accounts with millions of followers.', 'Define when new posts and deletions must become visible.'],
    hint: 'Compare fan-out on write with fan-out on read. A hybrid policy can treat high-follower accounts differently.',
    review: 'How does pagination behave when new posts arrive? Explain how private posts and unfollows affect cached feeds.',
    stretch: 'Introduce ranked feeds while keeping a stable pagination contract.',
  },
  'sd-design-a-job-scheduler': {
    brief: 'Design a service that runs one-time and recurring background jobs on a worker fleet.',
    requirements: ['Schedule, cancel, and inspect job execution history.', 'Assume 1 million scheduled jobs per day and execution times ranging from seconds to minutes.', 'Recover work after a worker crash and define whether overlapping recurring runs are allowed.'],
    hint: 'Distinguish scheduled time from a worker lease. Leases need expiry and stale workers may need fencing to avoid conflicting writes.',
    review: 'If a worker finishes but loses its acknowledgement, can a retry repeat a side effect? State the job handler idempotency contract.',
    stretch: 'Support tenant fairness and recurring schedules across daylight-saving transitions.',
  },
  'sd-design-a-video-streaming-platform': {
    brief: 'Design on-demand video upload, processing, and adaptive playback.',
    requirements: ['Accept uploads, produce multiple quality levels, and expose only playable videos.', 'Assume 100,000 concurrent viewers averaging 3 Mbps; estimate delivery bandwidth.', 'Handle failed transcoding tasks and geographically distributed viewers.'],
    hint: 'Separate the upload and processing pipeline from playback delivery. Track processing per rendition and deliver segments through a CDN.',
    review: 'What happens if only some renditions finish? Explain cache behavior, access control, and the cost of storing multiple encodings.',
    stretch: 'Add resumable playback across devices and a regional CDN outage strategy.',
  },
  'sd-design-a-ticket-booking-system': {
    brief: 'Design reserved-seat booking for high-demand events with a timed checkout window.',
    requirements: ['Show seat availability, hold selected seats, and confirm after payment.', 'Assume 50,000 users compete for 5,000 seats when sales open.', 'A hold expires after five minutes; resolve payment callbacks racing with expiry.'],
    hint: 'Treat available, held, and booked as explicit states. Use conditional transitions and stable booking identifiers.',
    review: 'Prove that two buyers cannot confirm the same seat. Describe refunds or reconciliation when payment arrives too late.',
    stretch: 'Add a waiting room and defend fairness against automated purchase bursts.',
  },
  'sd-design-a-vending-machine': {
    brief: 'Model a vending machine that takes payment, dispenses stock, and returns change.',
    requirements: ['Select an item, insert money, purchase, or cancel.', 'Handle insufficient credit, empty inventory, and unavailable change.', 'Define recovery if dispensing fails after payment is accepted.'],
    hint: 'Start with states and permitted transitions. Treat money as integer minor units and separate change calculation from transaction control.',
    review: 'Can cancellation or repeated purchase events dispense twice? Test that inventory and credit change together only on valid transitions.',
    stretch: 'Add a card-payment adapter without changing inventory rules.',
  },
  'sd-design-an-lru-cache': {
    brief: 'Implement a bounded in-memory cache that evicts the least recently used entry.',
    requirements: ['Expose get and put with average O(1) lookup and update.', 'Reading or updating a key must make it most recently used.', 'Define behavior for zero capacity, missing keys, and replacement of an existing value.'],
    hint: 'Combine a hash map with a doubly linked list. Every map entry should point to exactly one node in the recency list.',
    review: 'For capacity two, trace put A, put B, get A, put C. Verify that B is evicted and no duplicate list nodes remain.',
    stretch: 'Add time-to-live expiration and explain its effect on complexity and concurrency.',
  },
  'sd-design-a-split-expense-app': {
    brief: 'Model group expenses, unequal splits, and settlements between friends.',
    requirements: ['Record a payer and equal, exact-amount, or percentage splits.', 'Track balances and record settlements without losing the original expense history.', 'Validate that shares sum to the total and define a deterministic rounding policy.'],
    hint: 'Represent money in minor units with a currency. Separate split calculation from ledger entries and balance calculation.',
    review: 'Do balances sum to zero after each expense and settlement? Test rounding for 100 minor units split among three people.',
    stretch: 'Allow expense edits through reversing entries and calculate simplified settlement suggestions.',
  },
  'sd-design-a-logging-framework': {
    brief: 'Design a reusable logger with severity filtering, formatting, and multiple output destinations.',
    requirements: ['Expose debug, info, warn, and error events with structured context.', 'Support console and file outputs through interchangeable interfaces.', 'Define behavior when a destination fails or an asynchronous buffer is full.'],
    hint: 'Separate event creation, formatting, and output. Inject a clock and destination so tests need no real file system.',
    review: 'Can adding a JSON formatter avoid changes to output classes? Show how shutdown flushes buffered events without waiting forever.',
    stretch: 'Add sensitive-field redaction and per-destination severity thresholds.',
  },
  'sd-design-a-chess-game': {
    brief: 'Model a two-player chess game with legal moves, turn tracking, and end conditions.',
    requirements: ['Represent the board, pieces, moves, and active player.', 'Reject moves that leave the moving player in check; distinguish checkmate from stalemate.', 'State which special rules your first version includes and add tests for castling, promotion, and en passant as extensions.'],
    hint: 'Separate candidate move generation from king-safety validation. Represent a move with enough information to undo it.',
    review: 'Can you validate a move without corrupting the board? Test pinned pieces and a king moving into an attacked square.',
    stretch: 'Add move history and undo, including capture and promotion restoration.',
  },
  'sd-design-an-order-workflow': {
    brief: 'Model an extensible order lifecycle with payment, shipment, cancellation, and refunds.',
    requirements: ['Define valid transitions from created through paid, shipped, and completed.', 'Reject invalid transitions and handle duplicate or out-of-order events.', 'Keep external payment and shipping integrations behind testable interfaces.'],
    hint: 'Write a transition table before choosing a pattern. Persist event identity and state changes together when applying an event.',
    review: 'What happens when cancellation races with shipment? Explain which component owns the decision and how rejected events are recorded.',
    stretch: 'Support partial shipment and refund states without an explosion of conditional branches.',
  },
}

type ExerciseDefinition = [string, string, SystemDesignExercise['type'], SystemDesignExercise['difficulty'], string[]]

const additionalDefinitions: ExerciseDefinition[] = [
  ['sd-design-a-file-storage-service', 'Design a File Storage Service', 'HLD', 'Easy', ['Object Storage', 'Access Control', 'Uploads']],
  ['sd-design-a-rate-limiter', 'Design a Rate Limiter', 'HLD', 'Medium', ['Rate Limiting', 'Atomicity', 'Distributed State']],
  ['sd-design-a-news-feed', 'Design a News Feed', 'HLD', 'Medium', ['Fan-out', 'Caching', 'Pagination']],
  ['sd-design-a-job-scheduler', 'Design a Job Scheduler', 'HLD', 'Medium', ['Queues', 'Idempotency', 'Leases']],
  ['sd-design-a-video-streaming-platform', 'Design a Video Streaming Platform', 'HLD', 'Hard', ['CDN', 'Transcoding', 'Object Storage']],
  ['sd-design-a-ticket-booking-system', 'Design a Ticket Booking System', 'HLD', 'Hard', ['Concurrency', 'Reservations', 'Consistency']],
  ['sd-design-a-vending-machine', 'Design a Vending Machine', 'LLD', 'Easy', ['State Machine', 'OOP', 'Money']],
  ['sd-design-an-lru-cache', 'Design an LRU Cache', 'LLD', 'Easy', ['Hash Map', 'Linked List', 'Invariants']],
  ['sd-design-a-split-expense-app', 'Design a Split Expense App', 'LLD', 'Medium', ['Strategy Pattern', 'Ledger', 'Rounding']],
  ['sd-design-a-logging-framework', 'Design a Logging Framework', 'LLD', 'Medium', ['Interfaces', 'Dependency Injection', 'Buffering']],
  ['sd-design-a-chess-game', 'Design a Chess Game', 'LLD', 'Hard', ['OOP', 'Rules Engine', 'Testing']],
  ['sd-design-an-order-workflow', 'Design an Order Workflow', 'LLD', 'Hard', ['State Pattern', 'Idempotency', 'Concurrency']],
]

export const additionalSystemDesignExercises: SystemDesignExercise[] = additionalDefinitions.map(([id, title, type, difficulty, tags]) => ({
  id, title, type, difficulty, tags, status: 'Unattempted',
}))

export const systemDesignPaths = [
  { type: 'HLD', title: 'HLD: from one service to distributed systems', description: 'Practice requirements, capacity estimates, APIs, storage, and failure recovery.', ids: ['sd-design-a-url-shortener', 'sd-design-a-file-storage-service', 'sd-design-a-rate-limiter', 'sd-design-a-notification-system', 'sd-design-a-chat-application', 'sd-design-a-ticket-booking-system'] },
  { type: 'LLD', title: 'LLD: from objects to extensible behavior', description: 'Practice responsibilities, interfaces, state transitions, invariants, and tests.', ids: ['sd-design-a-library-management-system', 'sd-design-a-vending-machine', 'sd-design-a-parking-lot', 'sd-design-an-lru-cache', 'sd-design-a-logging-framework', 'sd-design-an-order-workflow'] },
] as const

export const systemDesignSteps = {
  HLD: [
    ['Scope • 5 min', 'List users, core actions, exclusions, and measurable latency and availability targets.'],
    ['Estimate • 5 min', 'Calculate average and peak requests per second, storage growth, and bandwidth. Write units and assumptions.'],
    ['Design • 15 min', 'Draw the request flow. Define API contracts, data ownership, indexes, and consistency needs.'],
    ['Stress-test • 10 min', 'Trace a hot key, dependency timeout, duplicate event, and regional failure. Explain recovery and monitoring.'],
    ['Review • 5 min', 'Compare an alternative, name the first bottleneck, and explain what changes at ten times the load.'],
  ],
  LLD: [
    ['Scope • 5 min', 'Write the core use cases, invalid operations, and rules that must always hold.'],
    ['Model • 10 min', 'Assign each class one responsibility. Sketch relationships, ownership, and public interfaces.'],
    ['Implement • 15 min', 'Trace one complete use case. Define state transitions, error handling, and replaceable dependencies.'],
    ['Test • 10 min', 'Cover a happy path, boundaries, invalid transitions, and concurrent operations where relevant.'],
    ['Review • 5 min', 'Add one new requirement. Explain which classes change and whether a pattern makes the change simpler.'],
  ],
} as const
