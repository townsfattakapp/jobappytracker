import type {
  SystemDesignScaffold,
  SystemDesignReferenceBlueprint,
  SystemDesignAiReview,
  SystemDesignAiRubricCategory,
} from '../types'
import { chatWithAI, isAiAvailable } from '../lib/aiGatewayClient'

export const systemDesignScaffolds: Record<string, SystemDesignScaffold> = {
  'sd-design-a-url-shortener': {
    requirements: `### 1. Functional Requirements
- Shorten a long URL into a unique 7-character code (e.g., https://sho.rt/a8K2qZ).
- Redirect visitors entering the short URL to the original destination URL.
- Support custom short aliases (e.g., https://sho.rt/summer-sale) if available.
- Support link expiration date (default: 1 year, optional permanent).

### 2. Non-Functional Requirements
- High Availability: 99.99% uptime for the redirection path (reads cannot fail).
- Ultra-Low Latency: Redirection response < 15ms at p99.
- Unpredictability: Generated keys should not be sequentially guessable.

### 3. Capacity & Scale Estimations
- Write Volume: 100 Million new URLs / month = ~40 writes/sec (Peak: 120 writes/sec).
- Read Volume: 100:1 read-to-write ratio = 4,000 redirects/sec (Peak: 12,000 reads/sec).
- Storage: 100M URLs * 250 bytes/record = 25 GB/month = 300 GB/year (1.5 TB over 5 years).
- Cache Memory (80/20 rule): Cache top 20% URLs: 20% of 4,000 * 86,400 reads * 250 bytes = ~17.2 GB RAM needed.`,

    architectureDiagram: `graph TD
  User[Client Browser / Mobile] --> DNS[Route53 / Cloudflare CDN]
  DNS --> LB[Application Load Balancer]
  LB --> APIGW[API Gateway & Rate Limiter]
  APIGW --> ShortenSvc[URL Shortener Service]
  APIGW --> RedirectSvc[Redirect Service]
  ShortenSvc --> KGS[Key Generation Service / Token Bucket]
  ShortenSvc --> PrimaryDB[(PostgreSQL Primary DB)]
  RedirectSvc --> Cache[(Redis Cache Cluster)]
  Cache -. Cache Miss .-> ReplicaDB[(PostgreSQL Read Replicas)]
  RedirectSvc --> Kafka[Kafka Analytics Topic]
  Kafka --> AnalyticsWorker[Analytics Stream Consumer]
  AnalyticsWorker --> ClickHouse[(ClickHouse Analytics Store)]`,

    dataModel: `### Database Selection
Relational Database (PostgreSQL with read replicas) or NoSQL (DynamoDB). PostgreSQL is preferred here because:
1. Unique constraints on short_key are strictly enforced.
2. Read-heavy key-value lookups are extremely fast with B-Tree indexes.
3. Total 5-year dataset is ~1.5 TB, easily manageable with read-replicas or horizontal hash sharding.

### Schema Definition: urls
- id: BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
- short_key: VARCHAR(10) UNIQUE NOT NULL (Indexed via B-Tree)
- original_url: TEXT NOT NULL
- user_id: UUID NULL (Foreign key to users table)
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- expires_at: TIMESTAMP WITH TIME ZONE NULL (Indexed for batch purge)
- click_count: BIGINT DEFAULT 0

### Indexes
- CREATE UNIQUE INDEX idx_urls_short_key ON urls(short_key);
- CREATE INDEX idx_urls_user_created ON urls(user_id, created_at DESC);
- CREATE INDEX idx_urls_expires ON urls(expires_at) WHERE expires_at IS NOT NULL;`,

    apiDesign: `### 1. Create Short Link
POST /api/v1/urls
Headers:
  Authorization: Bearer <jwt_token> (optional)
  Content-Type: application/json
Request Body:
{
  "originalUrl": "https://example.com/products/deals/2026/special-offer?ref=newsletter",
  "customAlias": "spring-deal-26", // optional
  "expiresInDays": 30 // optional
}
Response 201 Created:
{
  "shortUrl": "https://sho.rt/spring-deal-26",
  "shortKey": "spring-deal-26",
  "originalUrl": "https://example.com/products/deals/2026/special-offer?ref=newsletter",
  "expiresAt": "2026-10-25T12:00:00Z"
}
Errors:
  400 Bad Request: Invalid URL format
  409 Conflict: Custom alias already taken
  429 Too Many Requests: Rate limit exceeded (100 req/min per IP)

### 2. Redirect to Original URL
GET /{shortKey}
Response 302 Found:
Headers:
  Location: https://example.com/products/deals/2026/special-offer?ref=newsletter
  Cache-Control: private, max-age=300
Errors:
  404 Not Found: URL expired or does not exist`,

    bottlenecks: `### 1. 301 vs 302 Redirect Trade-off
- 301 Permanent Redirect: Browser caches redirect locally. Fastest for subsequent visits, BUT our servers never see repeated clicks, destroying analytics accuracy.
- 302 Temporary Redirect: Browser checks our server on every click. Enables real-time click tracking, geolocation, and fraud detection. (We choose 302).

### 2. Hash Collision Resolution vs Key Generation Service (KGS)
- Traditional MD5/SHA256 Base62 hashing can collide. Checking the DB on every collision slows write latency.
- Solution: Key Generation Service (KGS) pre-computes unique 7-character Base62 keys in advance and stores loaded batches in Redis. The write path simply pops a key (O(1), zero collisions).

### 3. Caching Strategy & Thundering Herd
- Cache-Aside pattern: Redirect service checks Redis first. On miss, queries PostgreSQL replica and populates Redis with 24h TTL.
- Cache Eviction: LRU (Least Recently Used).
- Thundering Herd protection: Mutex / singleflight lock on cache misses for popular viral links so only one DB query runs.

### 4. Database Sharding
- Shard key: Hash(short_key) % num_shards.
- Evenly distributes reads and writes across database instances without hotspots.`
  },

  'sd-design-a-chat-application': {
    requirements: `### 1. Functional Requirements
- 1-on-1 direct messaging and group messaging (up to 500 members).
- Real-time message delivery with delivery receipts (sent, delivered, read).
- Offline messaging: store messages and deliver when recipient reconnects.
- Conversation history sync across multiple devices.

### 2. Non-Functional Requirements
- Low Latency: Sub-100ms real-time delivery for online users.
- High Concurrency: Support 10 Million Daily Active Users, 1 Million concurrent WebSocket connections.
- Message Ordering: Messages within a chat must appear in exact monotonic sequence.
- Reliability: Zero message loss; at-least-once delivery with client deduplication.

### 3. Scale Estimations
- 10M DAU * 50 messages/day = 500 Million messages / day.
- Ingestion QPS: ~6,000 msgs/sec average (Peak: ~25,000 msgs/sec).
- Storage: 500M * 200 bytes = 100 GB/day = 36.5 TB/year.`,

    architectureDiagram: `graph TD
  Client[Web / Mobile Clients] --> LB[Network Load Balancer / WAF]
  LB --> WSServer[WebSocket Gateway Fleet]
  LB --> RESTServer[REST API: Auth, History, Media]
  WSServer --> SessionStore[(Redis Session & Presence Registry)]
  WSServer --> PubSub[Kafka / Redis PubSub Message Bus]
  RESTServer --> DocDB[(Cassandra / ScyllaDB Message Store)]
  RESTServer --> MetaDB[(PostgreSQL Users & Groups)]
  RESTServer --> S3[AWS S3 Media Bucket]
  PubSub --> PushSvc[Push Notification Service: APNs / FCM]`,

    dataModel: `### Database Strategy
- PostgreSQL: User profiles, group metadata, membership tables (ACID required).
- Cassandra / ScyllaDB: Message history (Append-heavy, wide-column, partition by conversation_id).

### Schema: messages (Cassandra)
- conversation_id: UUID (Partition Key)
- message_id: TIMEUUID (Clustering Key, Ordered DESC)
- sender_id: UUID
- content: TEXT
- media_url: TEXT NULL
- status: INT (1=Sent, 2=Delivered, 3=Read)
- created_at: TIMESTAMP`,

    apiDesign: `### 1. WebSocket Protocol
- CLIENT_SEND: { "tempId": "uuid", "conversationId": "cid", "text": "hello" }
- SERVER_ACK: { "tempId": "uuid", "messageId": "timeuuid", "timestamp": 1720000000 }
- MESSAGE_DELIVERY: { "messageId": "timeuuid", "senderId": "uid", "content": "hello" }

### 2. REST Endpoints
- GET /api/v1/conversations/{id}/messages?cursor={last_message_id}&limit=50
- POST /api/v1/conversations/{id}/read-receipt { "lastReadMessageId": "timeuuid" }`,

    bottlenecks: `### 1. WebSocket Fleet State & Routing
- Problem: Senders and receivers connect to different WebSocket nodes.
- Solution: Maintain Redis Presence registry mapping user_id -> server_ip. Publish message to recipient's server via Redis Pub/Sub or Kafka topic.

### 2. Group Chat Fanout (The Celebrity Problem)
- For small groups (<= 50): Direct fanout to all active WebSocket connections.
- For large groups (500+): Avoid N writes. Write once to conversation partition in Cassandra; active members pull via message cursor or lightweight pub/sub topic.`
  },

  'sd-design-a-rate-limiter': {
    requirements: `### 1. Functional Requirements
- Limit client requests based on API Key or IP address (e.g. 100 req/minute).
- Support burst allowance for short spikes.
- Return HTTP 429 Too Many Requests with Retry-After header upon exhaustion.
- Allow configurable tiers (e.g., Free: 60 rpm, Pro: 1,000 rpm).

### 2. Non-Functional Requirements
- Ultra-Low Latency: Rate limiter overhead < 2ms per request.
- High Availability: If the rate limiter crashes, fail open (allow traffic) to protect business availability.
- Distributed Accuracy: Must coordinate limits across multiple API Gateway instances.`,

    architectureDiagram: `graph TD
  Client[Client Traffic] --> LB[Load Balancer]
  LB --> Gateway[Kong / Envoy API Gateway]
  Gateway --> RLWorker[Rate Limiter Middleware Plugin]
  RLWorker --> RedisCluster[(Redis Cluster / Memcached)]
  Gateway --> AppService[Application Backend Microservices]
  RLWorker -. Fallback Fail-Open .-> AppService`,

    dataModel: `### Redis Data Structure
- Algorithm: Sliding Window Counter with Redis sorted set (ZSET) or Lua script with atomic hash:
Key: ratelimit:{client_id}:{window_epoch_minute}
TTL: 120 seconds
Hash Fields:
  - count: INTEGER
  - last_reset: TIMESTAMP`,

    apiDesign: `### Rejection Contract
HTTP/1.1 429 Too Many Requests
Headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1727280060
  Retry-After: 42
Body:
{
  "error": "rate_limit_exceeded",
  "message": "Quota of 100 requests per minute exceeded. Retry in 42 seconds."
}`,

    bottlenecks: `### 1. Race Conditions in Distributed Counters
- Problem: Read-Modify-Write creates race conditions under high concurrency.
- Solution: Execute atomic Redis Lua script or Token Bucket with INCR and EXPIRE in a single pipeline.

### 2. Redis Latency & Failure Policy
- In-memory Redis cluster with local memory cache (L1 Guava cache, L2 Redis).
- Fail-open policy: If Redis is unreachable, log warning and let request pass through rather than blocking genuine customers.`
  }
}

export const systemDesignReferenceBlueprints: Record<string, SystemDesignReferenceBlueprint> = {
  'sd-design-a-url-shortener': {
    title: 'Staff-Level Reference Blueprint: Distributed URL Shortener',
    scaleAssumptions: [
      '100M URLs created/month (~40 writes/sec avg, 150 writes/sec peak)',
      '10B redirects/month (~4,000 reads/sec avg, 15,000 reads/sec peak)',
      '100:1 Read-to-Write ratio',
      'Target p99 redirect latency < 15ms',
      '5-year storage footprint: ~1.5 Terabytes'
    ],
    architectureDiagram: `graph TD
  User[Clients] --> CDN[Cloudflare Edge Anycast CDN]
  CDN --> ALB[AWS Application Load Balancer]
  ALB --> APIGateway[Kong API Gateway & Token Bucket Rate Limiter]
  APIGateway --> ShortenerSvc[URL Shortener Microservice]
  APIGateway --> RedirectSvc[Redirect Microservice]
  ShortenerSvc --> KGS[Key Generation Service / Zookeeper]
  ShortenerSvc --> PrimaryDB[(PostgreSQL Primary Multi-AZ)]
  RedirectSvc --> Redis[(Redis Sharded Cluster - LRU Cache)]
  Redis -. Miss .-> ReplicaDB[(PostgreSQL Read Replicas)]
  RedirectSvc --> KafkaTopic[Kafka Topic: url-redirect-events]
  KafkaTopic --> SparkWorker[ClickStream Analytics Worker]
  SparkWorker --> ClickHouse[(ClickHouse Analytics DB)]`,
    dataModel: `TABLE urls:
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  short_key VARCHAR(10) NOT NULL,
  original_url TEXT NOT NULL,
  user_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  click_count BIGINT NOT NULL DEFAULT 0

INDEXES:
  CREATE UNIQUE INDEX uq_urls_short_key ON urls(short_key);
  CREATE INDEX idx_urls_user_created ON urls(user_id, created_at DESC);
  CREATE INDEX idx_urls_expires ON urls(expires_at) WHERE expires_at IS NOT NULL;`,
    apiDesign: `POST /api/v1/urls
Request: { "originalUrl": "https://example.com/item", "customAlias": "sale", "expiresInDays": 30 }
Response 201 Created: { "shortUrl": "https://sho.rt/sale", "shortKey": "sale", "expiresAt": "2026-10-25T12:00:00Z" }

GET /{shortKey}
Response 302 Found
Headers:
  Location: https://example.com/item
  Cache-Control: private, max-age=300`,
    bottlenecksAndTradeoffs: `1. 302 vs 301 Redirect: 302 chosen to maintain accurate click metrics and geo-analytics.
2. Key Generation Service: Eliminates collision retries by allocating non-overlapping token ranges to shortener nodes.
3. 80/20 Caching: 20% of short links generate 80% of read traffic. A 32GB Redis Cluster comfortably caches active URLs.
4. Database Partitioning: Consistent hashing on short_key partitions data across independent database shards.`,
    deepDiveNotes: [
      'Pre-generating 7-character Base62 keys yields 62^7 = 3.5 Trillion unique identifiers.',
      'Using singleflight cache mutex prevents DB thundering herd during cache cold-starts for viral links.',
      'Asynchronous Kafka event logging ensures redirect latency is completely decoupled from analytical writes.'
    ]
  }
}

/**
 * Returns a scaffold template tailored for the given exercise.
 * If a custom scaffold exists, it returns it; otherwise, creates a robust default framework.
 */
export function getExerciseScaffold(exerciseId: string, title: string, type: 'HLD' | 'LLD'): SystemDesignScaffold {
  if (systemDesignScaffolds[exerciseId]) {
    return systemDesignScaffolds[exerciseId]
  }

  if (type === 'LLD') {
    return {
      requirements: `### 1. Core Use Cases & Actors
- Actor 1: User / Operator
- Primary Flow: Execute main system workflow with valid inputs.
- Secondary Flow: Handle cancellations, updates, and refunds.

### 2. Invariants & Business Rules
- Rule 1: No two entities can hold the same reserved state simultaneously.
- Rule 2: Operations must maintain thread safety under concurrent requests.
- Rule 3: Error handling must throw explicit domain exceptions.`,

      architectureDiagram: `classDiagram
  class Client
  class Controller {
    +executeAction()
  }
  class Service {
    -repository: Repository
    -strategy: PricingStrategy
    +process()
  }
  class Repository {
    <<interface>>
    +save()
    +findById()
  }
  class DomainModel {
    -id: UUID
    -status: StatusEnum
    +transitionState()
  }
  Client --> Controller
  Controller --> Service
  Service --> Repository
  Service --> DomainModel`,

      dataModel: `### Classes, Responsibilities & State
1. DomainModel: Holds business entity state and enforces state invariants.
2. Service: Coordinates use cases, delegates logic, orchestrates transactions.
3. Strategy Pattern: Decouples dynamic algorithms (pricing, matching, routing).
4. Repository: Encapsulates storage and persistence operations.`,

      apiDesign: `### Public Interface Contracts
interface IService {
  Result process(RequestDTO request);
  Status queryState(UUID entityId);
}`,

      bottlenecks: `### Design Trade-offs & Test Strategy
- Concurrency Strategy: Use ReentrantLock or ConcurrentHashMap for thread-safe state access.
- Test Coverage:
  1. Happy path: Valid complete execution.
  2. Edge case: Zero, negative, or invalid boundary inputs.
  3. Race condition: Two concurrent requests attempting to mutate the same resource.`,

      code: `// Core Domain Skeleton
public class Manager {
    private final Map<String, Resource> store = new ConcurrentHashMap<>();

    public synchronized BookingResult book(String userId, String resourceId) {
        Resource res = store.get(resourceId);
        if (res == null || !res.isAvailable()) {
            throw new IllegalStateException("Resource unavailable");
        }
        res.setReserved(true);
        return new BookingResult(true, UUID.randomUUID().toString());
    }
}`
    }
  }

  // Default HLD scaffold
  return {
    requirements: `### 1. Functional Requirements
- Core Feature 1: Main read and write workflows for ${title}.
- Core Feature 2: Search, notifications, or status tracking.
- Core Feature 3: Administrative or analytical reporting.

### 2. Non-Functional Requirements
- High Availability: 99.99% SLA (multi-region active-passive or active-active).
- Low Latency: Sub-100ms API response time at p95.
- Consistency: Eventual consistency for reads, strong consistency for critical financial/identity writes.

### 3. Capacity Estimations
- Daily Active Users (DAU): 10 Million users.
- Average QPS: ~2,000 requests/sec (Peak: ~6,000 requests/sec).
- Storage Growth: ~50 GB / day = ~18 TB / year.`,

    architectureDiagram: `graph TD
  Client[Web & Mobile Clients] --> CDN[CDN / Edge Network]
  CDN --> LB[Application Load Balancer]
  LB --> APIGW[API Gateway / Auth / Rate Limiter]
  APIGW --> CoreService[Core Application Service]
  CoreService --> Cache[(Redis Cache Cluster)]
  CoreService --> PrimaryDB[(Primary Database)]
  CoreService --> MessageQueue[Kafka / SQS Event Queue]
  MessageQueue --> AsyncWorker[Background Worker Fleet]
  AsyncWorker --> Storage[(Object Storage / Analytics)]`,

    dataModel: `### Database Strategy
- Relational (PostgreSQL) vs NoSQL (MongoDB / Cassandra / DynamoDB).
- Schema Entities:
  1. Core Entity Table (id, status, metadata, timestamps)
  2. Association Table (foreign keys, relations)
  3. Audit / History Table (immutable event log)`,

    apiDesign: `### API Specifications
1. POST /api/v1/resource
   Request: { "name": "example", "payload": {} }
   Response 201 Created: { "id": "uuid", "status": "ACTIVE" }

2. GET /api/v1/resource/{id}
   Response 200 OK: { "id": "uuid", "details": {} }
   Errors: 404 Not Found, 429 Rate Limited`,

    bottlenecks: `### Scalability & Fault Tolerance
1. Single Points of Failure (SPOF): Add redundant multi-AZ load balancers and database replicas.
2. Caching Strategy: Cache-aside with Redis using LRU eviction.
3. Database Sharding: Partition by customer_id or hash(id) once table exceeds 100M rows.
4. Rate Limiting: Token bucket algorithm at the API Gateway to prevent DDoS.`
  }
}

/**
 * Intelligent AI Review Engine:
 * 1. Checks if an LLM is available via AI Gateway.
 * 2. If available, prompts the model with a strict JSON system design rubric.
 * 3. If unavailable, falls back to a deterministic, high-fidelity heuristic scoring engine.
 */
export async function evaluateSystemDesign(params: {
  exerciseId: string
  exerciseTitle: string
  exerciseType: 'HLD' | 'LLD'
  requirements: string
  architectureDiagram: string
  dataModel: string
  apiDesign: string
  bottlenecks: string
  code?: string
}): Promise<SystemDesignAiReview> {
  const { exerciseTitle, exerciseType, requirements, architectureDiagram, dataModel, apiDesign, bottlenecks, code } = params

  const hasLiveAi = await isAiAvailable()

  if (hasLiveAi) {
    try {
      const prompt = `You are a Principal Software Architect conducting a FAANG System Design Interview for: "${exerciseTitle}" (${exerciseType}).
Review the candidate's design submission and return ONLY valid JSON matching this exact structure:
{
  "overallScore": number (0-100),
  "levelRating": "L4 - Needs Preparation" | "L4 - Solid Mid-Level" | "L5 - Strong Senior" | "L6 - Principal / Staff",
  "verdict": "Pass" | "Borderline" | "Needs Revision",
  "executiveSummary": "2-3 sentences summarizing the architectural maturity and core assessment.",
  "categories": [
    { "id": "scope", "name": "Requirements & Scope", "score": number (0-20), "maxScore": 20, "feedback": "concise feedback" },
    { "id": "architecture", "name": "Architecture & Flow", "score": number (0-20), "maxScore": 20, "feedback": "concise feedback" },
    { "id": "data_model", "name": "Data Model & Schema", "score": number (0-20), "maxScore": 20, "feedback": "concise feedback" },
    { "id": "api_design", "name": "API & Interface Contracts", "score": number (0-20), "maxScore": 20, "feedback": "concise feedback" },
    { "id": "resiliency", "name": "Scale, Resiliency & Bottlenecks", "score": number (0-20), "maxScore": 20, "feedback": "concise feedback" }
  ],
  "strengths": ["string", "string"],
  "criticalGaps": ["string", "string"],
  "recommendations": ["string", "string"]
}

Candidate Submission:
--- Requirements & Scope ---
${requirements || '(Empty)'}

--- Architecture Diagram (Mermaid) ---
${architectureDiagram || '(Empty)'}

--- Data Model & Schema ---
${dataModel || '(Empty)'}

--- API Design & Contracts ---
${apiDesign || '(Empty)'}

--- Bottlenecks & Trade-offs ---
${bottlenecks || '(Empty)'}

${exerciseType === 'LLD' ? `--- Implementation Code ---\n${code || '(Empty)'}` : ''}
`

      const raw = await chatWithAI({
        messages: [
          { role: 'system', content: 'You are a strict, constructive FAANG System Design Interviewer. Output only JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        json: true
      })

      const parsed = JSON.parse(raw) as SystemDesignAiReview
      if (parsed.overallScore && parsed.categories?.length) {
        return {
          ...parsed,
          reviewedAt: new Date().toISOString()
        }
      }
    } catch {
      // Fallback to local heuristic evaluation
    }
  }

  // Local Deterministic Heuristic Engine
  return evaluateLocally(params)
}

function evaluateLocally(params: {
  exerciseTitle: string
  exerciseType: 'HLD' | 'LLD'
  requirements: string
  architectureDiagram: string
  dataModel: string
  apiDesign: string
  bottlenecks: string
  code?: string
}): SystemDesignAiReview {
  const { exerciseTitle, requirements, architectureDiagram, dataModel, apiDesign, bottlenecks, code, exerciseType } = params

  // 1. Scope Evaluation (0-20)
  let scopeScore = 4
  const hasFunctional = /functional/i.test(requirements)
  const hasNonFunctional = /non-functional|latency|availability|consistency|uptime|sla/i.test(requirements)
  const hasNumbers = /\d+\s*(qps|rps|users|req|mb|gb|tb|ms|seconds|day|month)/i.test(requirements)
  if (requirements.length > 50) scopeScore += 4
  if (hasFunctional) scopeScore += 4
  if (hasNonFunctional) scopeScore += 4
  if (hasNumbers) scopeScore += 4
  scopeScore = Math.min(20, scopeScore)

  // 2. Architecture Diagram Evaluation (0-20)
  let archScore = 4
  const hasMermaid = /graph\s+(TD|LR)|classDiagram|sequenceDiagram/i.test(architectureDiagram)
  const hasLB = /lb|load\s*balancer|gateway|cdn|nginx/i.test(architectureDiagram)
  const hasCache = /cache|redis|memcached/i.test(architectureDiagram)
  const hasDB = /db|database|postgres|sql|mongo|dynamo/i.test(architectureDiagram)
  const hasQueue = /queue|kafka|pubsub|sqs|worker/i.test(architectureDiagram)
  if (hasMermaid) archScore += 4
  if (hasLB) archScore += 3
  if (hasCache) archScore += 3
  if (hasDB) archScore += 3
  if (hasQueue || architectureDiagram.length > 120) archScore += 3
  archScore = Math.min(20, archScore)

  // 3. Data Model Evaluation (0-20)
  let dataScore = 4
  const hasTables = /table|class|entity|schema|collection/i.test(dataModel)
  const hasKeys = /primary\s*key|foreign\s*key|pk|fk|index|unique/i.test(dataModel)
  const hasTypes = /varchar|bigint|uuid|text|timestamp|int|boolean/i.test(dataModel)
  const hasDbJustification = /sql|nosql|postgres|dynamo|cassandra|acid|relational/i.test(dataModel)
  if (dataModel.length > 40) dataScore += 4
  if (hasTables) dataScore += 3
  if (hasKeys) dataScore += 3
  if (hasTypes) dataScore += 3
  if (hasDbJustification) dataScore += 3
  dataScore = Math.min(20, dataScore)

  // 4. API Design Evaluation (0-20)
  let apiScore = 4
  const hasEndpoints = /(get|post|put|delete|patch)\s+\/[a-z0-9_/]+/i.test(apiDesign)
  const hasPayloads = /\{|\}|json|request|response|headers/i.test(apiDesign)
  const hasStatusCodes = /200|201|302|400|401|403|404|409|429|500/i.test(apiDesign)
  if (apiDesign.length > 40) apiScore += 4
  if (hasEndpoints) apiScore += 4
  if (hasPayloads) apiScore += 4
  if (hasStatusCodes) apiScore += 4
  apiScore = Math.min(20, apiScore)

  // 5. Bottlenecks & Scale Evaluation (0-20)
  let resScore = 4
  const hasSpof = /spof|single\s*point|redundancy|multi-az|replica/i.test(bottlenecks)
  const hasEviction = /lru|ttl|eviction|cache-aside|write-through/i.test(bottlenecks)
  const hasSharding = /shard|partition|consistent\s*hashing|fanout/i.test(bottlenecks)
  const hasTradeoff = /trade-off|versus|vs|301|302|acid|eventual/i.test(bottlenecks)
  if (bottlenecks.length > 40) resScore += 4
  if (hasSpof) resScore += 3
  if (hasEviction) resScore += 3
  if (hasSharding) resScore += 3
  if (hasTradeoff) resScore += 3
  resScore = Math.min(20, resScore)

  // LLD adjustment if code provided
  if (exerciseType === 'LLD' && code && code.length > 50) {
    archScore = Math.min(20, archScore + 2)
    dataScore = Math.min(20, dataScore + 2)
  }

  const overallScore = scopeScore + archScore + dataScore + apiScore + resScore

  let levelRating: SystemDesignAiReview['levelRating'] = 'L4 - Needs Preparation'
  let verdict: SystemDesignAiReview['verdict'] = 'Needs Revision'

  if (overallScore >= 82) {
    levelRating = overallScore >= 92 ? 'L6 - Principal / Staff' : 'L5 - Strong Senior'
    verdict = 'Pass'
  } else if (overallScore >= 65) {
    levelRating = 'L4 - Solid Mid-Level'
    verdict = 'Borderline'
  }

  const strengths: string[] = []
  const criticalGaps: string[] = []
  const recommendations: string[] = []

  if (hasFunctional && hasNumbers) {
    strengths.push('Crisp functional scope supported by explicit back-of-the-envelope capacity estimations.')
  } else {
    criticalGaps.push('Capacity math is either missing or lacks QPS and storage footprint projections.')
    recommendations.push('Explicitly calculate read/write QPS, annual storage growth, and cache RAM requirements.')
  }

  if (hasMermaid && hasLB && hasCache) {
    strengths.push('Well-decoupled architecture with distinct ingress, caching tier, and database layers.')
  } else {
    criticalGaps.push('Architectural diagram lacks key decoupling components like Load Balancers, API Gateway, or Redis cache.')
    recommendations.push('Add an explicit caching tier and explain cache-aside invalidation semantics.')
  }

  if (hasKeys && hasTypes) {
    strengths.push('Solid database schema specifying primary keys, indexed columns, and data types.')
  } else {
    criticalGaps.push('Data model is informal; specify table schemas, primary keys, and index access patterns.')
    recommendations.push('Define explicit database indexes to support the primary read queries efficiently.')
  }

  if (hasStatusCodes) {
    strengths.push('HTTP status codes and error conditions (400, 404, 429) clearly outlined.')
  } else {
    recommendations.push('Document concrete HTTP status codes (201 Created, 302 Found, 429 Rate Limited) for every endpoint.')
  }

  if (hasTradeoff || hasSharding) {
    strengths.push('Thoughtful examination of architectural trade-offs and horizontal scaling strategies.')
  } else {
    criticalGaps.push('Missing discussion of Single Points of Failure (SPOF) and database sharding / partitioning.')
    recommendations.push('Document how the system handles 10x traffic spikes and catastrophic node failures.')
  }

  const categories: SystemDesignAiRubricCategory[] = [
    {
      id: 'scope',
      name: 'Requirements & Scope',
      score: scopeScore,
      maxScore: 20,
      feedback: hasNumbers
        ? 'Good quantitative constraints and functional bounds.'
        : 'Scope is too high-level. Add explicit QPS and storage calculations.'
    },
    {
      id: 'architecture',
      name: 'Architecture & Flow',
      score: archScore,
      maxScore: 20,
      feedback: hasLB && hasCache
        ? 'Clean separation of concerns with appropriate caching and routing tiers.'
        : 'Architecture diagram needs clearer component boundaries and data flows.'
    },
    {
      id: 'data_model',
      name: 'Data Model & Schema',
      score: dataScore,
      maxScore: 20,
      feedback: hasKeys
        ? 'Table schemas and indexing strategies are well specified.'
        : 'Specify table entities, columns, primary keys, and secondary indexes.'
    },
    {
      id: 'api_design',
      name: 'API & Interface Contracts',
      score: apiScore,
      maxScore: 20,
      feedback: hasEndpoints && hasStatusCodes
        ? 'Well-structured REST/gRPC endpoints with clear HTTP status codes.'
        : 'Provide explicit request payloads, response bodies, and error codes.'
    },
    {
      id: 'resiliency',
      name: 'Scale, Resiliency & Bottlenecks',
      score: resScore,
      maxScore: 20,
      feedback: hasSharding || hasSpof
        ? 'Good identification of failure modes and horizontal scaling.'
        : 'Address Single Points of Failure, cache eviction policies, and database sharding.'
    }
  ]

  return {
    overallScore,
    levelRating,
    verdict,
    executiveSummary: overallScore >= 80
      ? `Strong, well-reasoned ${exerciseType} design demonstrating senior engineering maturity across traffic estimation, component decoupling, and fault tolerance.`
      : `Promising start on ${exerciseTitle}. To reach a senior interview standard, deepen your capacity calculations, add concrete schema indexes, and address failure recovery.`,
    categories,
    strengths: strengths.length ? strengths : ['Clear fundamental understanding of the core problem objectives.'],
    criticalGaps: criticalGaps.length ? criticalGaps : ['No critical architectural flaws detected.'],
    recommendations: recommendations.length ? recommendations : ['Consider adding multi-region failover and distributed tracing.'],
    reviewedAt: new Date().toISOString()
  }
}
