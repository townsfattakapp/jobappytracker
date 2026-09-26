import type { EngineeringLab } from "../types"

export const engineeringLabsSeed: EngineeringLab[] = [
  {
    "id": "lab-eng-101",
    "ticketId": "ENG-101",
    "title": "Codebase Onboarding & Architecture Exploration",
    "category": "Frontend & Web",
    "type": "Full Stack",
    "difficulty": "Beginner",
    "severity": "P2 - Moderate",
    "impact": "New hire ramp-up blocker: developer must understand request flow from browser form to PostgreSQL session table.",
    "scenario": "You just joined the engineering team. Your first ticket is to clone the main repository, understand the directory structure, and trace how a user login request flows from the React frontend to the Node.js API and database session table.",
    "requirements": [
      "Identify the main entry point of the React client and authentication form handler.",
      "Locate the API route handler and middleware responsible for verifying credentials.",
      "Trace the database query used to fetch user records and generate JWT session cookies.",
      "Document security considerations (CSRF, SameSite cookies, password hashing algorithm)."
    ],
    "acceptanceCriteria": [
      "Provide a clear architecture summary outlining the 4-layer flow (UI -> API -> Service -> DB).",
      "List the exact file paths and line ranges involved in the authentication flow.",
      "Identify the password hashing algorithm and cost factor used in the service layer.",
      "Submit an architecture map as your onboarding PR."
    ],
    "techStack": [
      "React",
      "Node.js",
      "PostgreSQL",
      "TypeScript",
      "JWT"
    ],
    "estDurationMinutes": 30,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T10:14:02.102Z [INFO] [HTTP] POST /api/auth/login 200 OK - 42ms",
      "2026-09-25T10:14:02.115Z [DEBUG] [AuthService] Validating email user@company.com with bcrypt cost=12",
      "2026-09-25T10:14:02.138Z [DEBUG] [DBPool] Acquired client for SELECT id, password_hash FROM users WHERE email = $1",
      "2026-09-25T10:14:02.144Z [INFO] [Session] Setting Set-Cookie: token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax"
    ],
    "codeFiles": [
      {
        "filename": "src/api/auth/route.ts",
        "language": "typescript",
        "code": "import { NextRequest, NextResponse } from 'next/server'\nimport { authenticateUser } from '@/services/authService'\n\nexport async function POST(req: NextRequest) {\n  const { email, password } = await req.json()\n  if (!email || !password) {\n    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })\n  }\n  const result = await authenticateUser(email, password)\n  if (!result.success) {\n    return NextResponse.json({ error: result.error }, { status: 401 })\n  }\n  return NextResponse.json({ user: result.user }, {\n    headers: { 'Set-Cookie': result.cookie }\n  })\n}"
      },
      {
        "filename": "src/services/authService.ts",
        "language": "typescript",
        "code": "import bcrypt from 'bcrypt'\nimport { db } from '@/lib/db'\nimport { signJwt } from '@/lib/jwt'\n\nexport async function authenticateUser(email: string, pass: string) {\n  const user = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email])\n  if (!user.rows[0]) return { success: false, error: 'Invalid credentials' }\n  const match = await bcrypt.compare(pass, user.rows[0].password_hash)\n  if (!match) return { success: false, error: 'Invalid credentials' }\n  const token = signJwt({ sub: user.rows[0].id, role: user.rows[0].role })\n  return {\n    success: true,\n    user: { id: user.rows[0].id, email: user.rows[0].email },\n    cookie: `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`\n  }\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Where to look",
        "content": "Check src/api/auth/route.ts for the HTTP entrypoint and follow the import of authenticateUser into src/services/authService.ts."
      },
      {
        "level": 2,
        "title": "Database & Security Flow",
        "content": "Notice how bcrypt.compare() prevents timing attacks, and how parameterized query ($1) guards against SQL injection. The JWT is issued in an HttpOnly cookie."
      },
      {
        "level": 3,
        "title": "Architecture Blueprint",
        "content": "Flow: (1) Client onSubmit -> (2) /api/auth route validation -> (3) AuthService bcrypt verify -> (4) DBPool parameterized query -> (5) HttpOnly JWT Cookie serialization."
      }
    ],
    "solution": {
      "explanation": "The application uses a standard 3-tier enterprise pattern: Route Handlers parse request payloads and HTTP headers, Service layer coordinates business logic and crypto operations, and Database Pool manages connection persistence with parameter binding.",
      "fiveWhys": [
        "Why do we need an architectural onboarding doc? To reduce time-to-first-commit for new hires.",
        "Why does authentication use HttpOnly cookies? To prevent XSS script theft of tokens.",
        "Why is bcrypt cost set to 12? To balance verification latency (~80ms) against offline brute-force cracking resistance."
      ],
      "preventionRules": [
        "Always sanitize inputs with a schema validator (e.g. Zod).",
        "Enforce SameSite=Lax or Strict on all session cookies.",
        "Rotate JWT signing secrets quarterly."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Endpoint Verification",
        "description": "Checks that POST /api/auth parses JSON and rejects empty bodies",
        "expectedOutcome": "400 Bad Request returned on empty payload"
      },
      {
        "id": "t2",
        "name": "Credential Authentication",
        "description": "Validates bcrypt password comparison against hashed store",
        "expectedOutcome": "200 OK with HttpOnly cookie returned on valid credentials"
      },
      {
        "id": "t3",
        "name": "SQL Injection Guard",
        "description": "Verifies query parameterization with SQL injection payloads",
        "expectedOutcome": "No SQL syntax error or unauthorized data access"
      }
    ],
    "suggestedPromptChips": [
      "Trace the full request lifecycle from React to DB",
      "Explain why HttpOnly cookies are safer than LocalStorage for JWTs",
      "Review my architectural diagram for this flow"
    ]
  },
  {
    "id": "lab-eng-102",
    "ticketId": "ENG-102",
    "title": "Reproduce & Fix Checkout Floating-Point Rounding Bug",
    "category": "Production Incidents",
    "type": "Backend",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "0.4% of checkout carts exhibit a 1-cent discrepancy between subtotal + tax and the charged total. Accounting reconciliation alerts triggered.",
    "scenario": "Customers are reporting that occasionally the checkout cart total is off by a few cents (e.g. $19.99 + $0.01 = $19.999999999999996 or subtotal off by $0.01). Finance has flagged discrepancy between Stripe invoice records and our ledger.",
    "requirements": [
      "Locate the calculateCartTotal function in the pricing engine.",
      "Write a failing unit test reproducing IEEE-754 floating point imprecision.",
      "Refactor the calculation to store and compute currency exclusively in integer cents (or BigInt/Dinero pattern).",
      "Ensure tax calculation rounds half-up deterministically."
    ],
    "acceptanceCriteria": [
      "Root cause analysis documented with concrete IEEE-754 float examples.",
      "Unit test suite passes with 100% precision across edge-case price combinations ($0.10 + $0.20, multi-item tax rates).",
      "calculateCartTotal returns exact cents integer without floating point drift."
    ],
    "techStack": [
      "TypeScript",
      "Node.js",
      "Jest"
    ],
    "estDurationMinutes": 30,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T11:02:14.321Z [WARN] [Checkout] Cart c_8812 total mismatch! Expected: 29.99, Computed: 29.989999999999995",
      "2026-09-25T11:02:14.330Z [ERROR] [StripeGateway] Amount must convert to integer cents: 2998.9999999999995 is invalid",
      "2026-09-25T11:02:14.335Z [ERROR] [PaymentService] Transaction failed: AmountInCents must be a whole integer"
    ],
    "codeFiles": [
      {
        "filename": "src/services/pricingEngine.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY IMPLEMENTATION: Uses JavaScript floating point numbers for currency\nexport interface CartItem {\n  id: string\n  price: number // e.g. 19.99\n  quantity: number\n}\n\nexport function calculateCartTotal(items: CartItem[], taxRate: number = 0.0825) {\n  let subtotal = 0\n  for (const item of items) {\n    subtotal += item.price * item.quantity // Float drift occurs here!\n  }\n  const tax = subtotal * taxRate // e.g. 19.99 * 0.0825 = 1.649175...\n  const total = subtotal + tax\n  return {\n    subtotal: Number(subtotal.toFixed(2)),\n    tax: Number(tax.toFixed(2)),\n    total: Number(total.toFixed(2)), // Often off by $0.01 compared to subtotal + tax!\n    amountInCents: Math.round(total * 100)\n  }\n}"
      }
    ],
    "failingTest": "test('reproduces floating point currency mismatch', () => {\n  const items = [{ id: '1', price: 0.1, quantity: 1 }, { id: '2', price: 0.2, quantity: 1 }]\n  const result = calculateCartTotal(items, 0)\n  expect(result.subtotal).toBe(0.30) // Fails if float gives 0.30000000000000004\n})",
    "hints": [
      {
        "level": 1,
        "title": "Understanding IEEE-754",
        "content": "In binary floating point, decimal numbers like 0.1 and 0.2 cannot be represented precisely. 0.1 + 0.2 equals 0.30000000000000004."
      },
      {
        "level": 2,
        "title": "The Safe Currency Pattern",
        "content": "Never store or compute currency as floats. Represent all monetary values in minor units (integer cents). E.g. $19.99 -> 1999 cents."
      },
      {
        "level": 3,
        "title": "Tax Rounding Rule",
        "content": "Compute tax as: Math.round(subtotalCents * taxRateBasisPoints / 10000). Total is always exactly subtotalCents + taxCents."
      }
    ],
    "solution": {
      "explanation": "Refactor all pricing models to store prices in integer cents. When computing tax, use standard half-up rounding on integer arithmetic. Subtotal is the sum of integer item cents, and Total is strictly subtotalCents + taxCents, guaranteeing that total === subtotal + tax without discrepancy.",
      "fixedCode": "export interface CartItem {\n  id: string\n  priceInCents: number // e.g. 1999 for $19.99\n  quantity: number\n}\n\nexport function calculateCartTotal(items: CartItem[], taxRateBasisPoints: number = 825) {\n  let subtotalCents = 0\n  for (const item of items) {\n    subtotalCents += item.priceInCents * item.quantity\n  }\n  // Half-up rounding on integer math\n  const taxCents = Math.round((subtotalCents * taxRateBasisPoints) / 10000)\n  const totalCents = subtotalCents + taxCents\n\n  return {\n    subtotalCents,\n    taxCents,\n    totalCents,\n    subtotalDisplay: (subtotalCents / 100).toFixed(2),\n    taxDisplay: (taxCents / 100).toFixed(2),\n    totalDisplay: (totalCents / 100).toFixed(2)\n  }\n}",
      "fiveWhys": [
        "Why did Stripe reject the charge? It received 2998.9999999999995 instead of 2999.",
        "Why was the number a float? JavaScript Numbers are IEEE-754 double precision floats.",
        "Why was calculation done on dollar amounts? The schema mistakenly typed prices as float decimals instead of integer cents."
      ],
      "preventionRules": [
        "Enforce integer cents across all DB columns (e.g. price_cents INT).",
        "Add a linter rule prohibiting Math.round(price * 100) conversions in business logic."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Zero Precision Drift",
        "description": "Tests $0.10 + $0.20 items under 0% tax",
        "expectedOutcome": "subtotalCents === 30, totalCents === 30"
      },
      {
        "id": "t2",
        "name": "Tax Invariant Check",
        "description": "Verifies totalCents is strictly equal to subtotalCents + taxCents",
        "expectedOutcome": "Invariant holds across 10,000 randomized cart permutations"
      },
      {
        "id": "t3",
        "name": "Stripe Gateway Payload",
        "description": "Ensures amountInCents is an integer safe for payment APIs",
        "expectedOutcome": "Number.isInteger(totalCents) === true"
      }
    ],
    "suggestedPromptChips": [
      "Explain why toFixed(2) is not enough to fix currency bugs",
      "How does integer cents math handle discounts and coupons?",
      "Review my PR description for this pricing engine fix"
    ]
  },
  {
    "id": "lab-eng-103",
    "ticketId": "ENG-103",
    "title": "Implement Distributed Rate Limiter with Redis Sliding Window",
    "category": "Security & Auth",
    "type": "Backend",
    "difficulty": "Advanced",
    "severity": "P1 - High Priority",
    "impact": "Single scraping bot consuming 35% of database CPU by issuing 600 requests/sec to /api/search. Fixed window counter allowed burst spikes at boundary.",
    "scenario": "Our public API is being hammered by automated scrapers and credential stuffing attacks. The existing fixed-window rate limiter fails at window boundaries (allowing 2x traffic burst). We need to implement a Redis-backed Sliding Window Log or Token Bucket rate limiter in Express/Next.js.",
    "requirements": [
      "Design a sliding window log or sliding window counter in Redis.",
      "Return HTTP 429 Too Many Requests when limits are exceeded.",
      "Set standard RFC headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.",
      "Use an atomic Redis pipeline (or Lua script) to prevent race conditions across server nodes."
    ],
    "acceptanceCriteria": [
      "Sliding window prevents 2x boundary burst attacks.",
      "Redis operations run atomically in under 3ms.",
      "Headers correctly reflect remaining quota and retry countdown.",
      "Gracefully fail-open or fallback to local memory if Redis is temporarily unreachable."
    ],
    "techStack": [
      "Node.js",
      "Express",
      "Redis",
      "Lua",
      "TypeScript"
    ],
    "estDurationMinutes": 45,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T11:20:00.000Z [ALERT] [Gateway] IP 198.51.100.44 issued 1,200 requests between 11:19:59 and 11:20:01",
      "2026-09-25T11:20:00.045Z [WARN] [DB] Connection pool 95% full; search query queue depth: 140",
      "2026-09-25T11:20:01.120Z [INFO] Fixed window counter reset at boundary, allowing another 600 requests immediately"
    ],
    "codeFiles": [
      {
        "filename": "src/middleware/rateLimiter.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Fixed Window allows 2x limit at window boundaries (e.g. :59s and :01s)\nimport { Redis } from 'ioredis'\nconst redis = new Redis()\n\nexport async function fixedWindowLimiter(ip: string, limit = 60, windowSeconds = 60) {\n  const key = `ratelimit:${ip}:${Math.floor(Date.now() / 1000 / windowSeconds)}`\n  const count = await redis.incr(key)\n  if (count === 1) await redis.expire(key, windowSeconds)\n  if (count > limit) {\n    return { allowed: false, remaining: 0, retryAfter: windowSeconds }\n  }\n  return { allowed: true, remaining: limit - count, retryAfter: 0 }\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Why Fixed Window Fails",
        "content": "If the limit is 60 req/min, an attacker sends 60 requests at 00:59 and 60 requests at 01:01. That is 120 requests in 2 seconds, but the fixed window counter reset at 01:00!"
      },
      {
        "level": 2,
        "title": "Redis Sorted Set (ZSET) Approach",
        "content": "Use Redis sorted set where Score and Member are timestamps. (1) ZREMRANGEBYSCORE key 0 (now - windowMs), (2) ZCARD key, (3) If count < limit: ZADD key now now, (4) EXPIRE key windowSeconds."
      },
      {
        "level": 3,
        "title": "Atomicity with Lua / Pipeline",
        "content": "Execute the ZREMRANGEBYSCORE, ZCARD, ZADD, and EXPIRE in a single Redis transaction or Lua script to eliminate check-then-act concurrency bugs."
      }
    ],
    "solution": {
      "explanation": "The sliding window log uses a Redis Sorted Set (ZSET). Each request timestamp is added with score = now. We prune timestamps older than now - windowMs, count the remaining entries, and allow or deny atomically in a pipeline.",
      "fixedCode": "import { Redis } from 'ioredis'\nconst redis = new Redis()\n\nexport async function slidingWindowLimiter(key: string, limit = 60, windowMs = 60000) {\n  const now = Date.now()\n  const clearBefore = now - windowMs\n  const redisKey = `ratelimit:sliding:${key}`\n\n  const pipeline = redis.pipeline()\n  pipeline.zremrangebyscore(redisKey, 0, clearBefore)\n  pipeline.zcard(redisKey)\n  pipeline.zadd(redisKey, now, `${now}:${Math.random()}`)\n  pipeline.pexpire(redisKey, windowMs)\n\n  const results = await pipeline.exec()\n  const count = (results?.[1]?.[1] as number) || 0\n\n  if (count >= limit) {\n    return {\n      allowed: false,\n      remaining: 0,\n      retryAfterSeconds: Math.ceil(windowMs / 1000)\n    }\n  }\n\n  return {\n    allowed: true,\n    remaining: limit - count - 1,\n    retryAfterSeconds: 0\n  }\n}",
      "fiveWhys": [
        "Why was the DB overwhelmed? A bot sent 120 queries in 2 seconds.",
        "Why did the rate limiter allow it? It used fixed-window counters that reset at minute rollover.",
        "Why did we switch to sliding window? Sliding window evaluates rolling 60s windows continuously."
      ],
      "preventionRules": [
        "Implement IP + API key tiered rate limits.",
        "Set Cloudflare or AWS WAF rate limits at the CDN edge for DDoS mitigation.",
        "Always set standard Retry-After headers to allow compliant clients to back off."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Boundary Burst Mitigation",
        "description": "Sends limit requests at end of window and start of next window",
        "expectedOutcome": "Surge requests strictly rejected with 429"
      },
      {
        "id": "t2",
        "name": "Header Verification",
        "description": "Validates presence of X-RateLimit-Limit and Retry-After",
        "expectedOutcome": "Headers conform to RFC 6585 standards"
      },
      {
        "id": "t3",
        "name": "Pipeline Performance",
        "description": "Executes 1,000 concurrent evaluations",
        "expectedOutcome": "P99 latency < 3ms with zero race conditions"
      }
    ],
    "suggestedPromptChips": [
      "Compare Sliding Window Log vs Token Bucket algorithms",
      "How to write a Lua script for Redis rate limiting?",
      "How should we handle rate limiting behind Cloudflare/reverse proxies?"
    ]
  },
  {
    "id": "lab-eng-104",
    "ticketId": "ENG-104",
    "title": "PostgreSQL Indexing & 10M Row Query Optimization",
    "category": "Databases & Cache",
    "type": "Database",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "Admin analytics dashboard timing out (>30s) under production load. CPU utilization on RDS Postgres instance spiked to 98%.",
    "scenario": "The admin dashboard is timing out when querying recent customer orders. The query filters by tenant_id, status, and sorts by created_at DESC with LIMIT 50. In a table with 10 million rows, EXPLAIN ANALYZE reveals a sequential table scan consuming 14.8 seconds.",
    "requirements": [
      "Analyze the slow SQL query using EXPLAIN (ANALYZE, BUFFERS).",
      "Design the optimal composite B-Tree index considering equality and range/sort columns.",
      "Write the production migration script using CREATE INDEX CONCURRENTLY to avoid exclusive table locks.",
      "Verify that query execution drops under 15ms and switches to an Index Scan."
    ],
    "acceptanceCriteria": [
      "EXPLAIN ANALYZE before and after execution plans documented.",
      "CREATE INDEX CONCURRENTLY command properly formatted without transaction block.",
      "Query execution time verified under 50ms (ideally < 15ms).",
      "Buffer hits show significant reduction in shared read blocks."
    ],
    "techStack": [
      "PostgreSQL",
      "SQL",
      "Database Administration"
    ],
    "estDurationMinutes": 30,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T11:45:10.120Z [ERROR] [DB] Query timeout (30000ms): SELECT * FROM orders WHERE tenant_id = 't_corp' AND status = 'completed' ORDER BY created_at DESC LIMIT 50",
      "2026-09-25T11:45:10.135Z [WARN] [RDS] CPUUtilization metric exceeded alarm threshold 90.0% (Current: 98.4%)",
      "2026-09-25T11:45:12.000Z [DEBUG] EXPLAIN: Seq Scan on orders (cost=0.00..342150.00 rows=48210 width=142) (actual time=14820.12..14820.12)"
    ],
    "codeFiles": [
      {
        "filename": "db/queries/adminOrders.sql",
        "language": "sql",
        "code": "-- Slow query without composite index\nSELECT id, tenant_id, customer_id, total_cents, status, created_at\nFROM orders\nWHERE tenant_id = 'tenant_enterprise_01'\n  AND status = 'completed'\nORDER BY created_at DESC\nLIMIT 50;"
      },
      {
        "filename": "db/migrations/20260925_add_orders_idx.sql",
        "language": "sql",
        "isBuggy": true,
        "code": "-- DANGEROUS: Standard CREATE INDEX acquires SHARE lock, blocking all writes on 10M table!\n-- Missing CONCURRENTLY flag!\nCREATE INDEX idx_orders_tenant ON orders (tenant_id);"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Equality vs Sort Column Order",
        "content": "Remember the ESR rule (Equality, Sort, Range). Put equality columns first (tenant_id, status) followed by sort columns (created_at DESC)."
      },
      {
        "level": 2,
        "title": "Locking Danger in Production",
        "content": "Running CREATE INDEX without CONCURRENTLY locks the table against writes for minutes! CONCURRENTLY builds the index without exclusive table locks."
      },
      {
        "level": 3,
        "title": "The Winning Index",
        "content": "CREATE INDEX CONCURRENTLY idx_orders_tenant_status_created ON orders (tenant_id, status, created_at DESC);"
      }
    ],
    "solution": {
      "explanation": "Composite B-tree indexing following the Equality-Sort-Range rule allows Postgres to jump directly to the tenant and status slice in the B-tree, and read the rows pre-sorted in reverse chronological order without an expensive in-memory Sort node. Running with CONCURRENTLY avoids table locking.",
      "fixedCode": "-- Run outside of a multi-statement transaction block:\nCREATE INDEX CONCURRENTLY idx_orders_tenant_status_created\nON orders (tenant_id, status, created_at DESC);\n\n-- Verify query plan:\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT id, tenant_id, customer_id, total_cents, status, created_at\nFROM orders\nWHERE tenant_id = 'tenant_enterprise_01'\n  AND status = 'completed'\nORDER BY created_at DESC\nLIMIT 50;",
      "fiveWhys": [
        "Why did dashboard time out? The query ran for 14.8 seconds.",
        "Why 14.8 seconds? It performed a full sequential scan of 10,000,000 rows from disk.",
        "Why was index on tenant_id not enough? The single column index still required filtering millions of rows by status and sorting in memory."
      ],
      "preventionRules": [
        "Require EXPLAIN ANALYZE output in PRs for new database queries.",
        "Always use CREATE INDEX CONCURRENTLY in production migrations.",
        "Set statement_timeout = 3000ms on web pool to prevent runaway queries from saturating RDS."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Plan Inspection",
        "description": "Checks that plan switches from Seq Scan to Index Scan",
        "expectedOutcome": "Index Scan using idx_orders_tenant_status_created"
      },
      {
        "id": "t2",
        "name": "Latency Reduction",
        "description": "Executes query on 10M dataset",
        "expectedOutcome": "Execution time drops from 14,800ms to < 10ms"
      },
      {
        "id": "t3",
        "name": "Non-blocking Migration",
        "description": "Validates CONCURRENTLY keyword in DDL migration file",
        "expectedOutcome": "Lock level remains SHARE UPDATE EXCLUSIVE (writes permitted)"
      }
    ],
    "suggestedPromptChips": [
      "Explain the Equality-Sort-Range (ESR) rule for composite indexes",
      "What are the pitfalls of CREATE INDEX CONCURRENTLY?",
      "How to analyze pg_stat_statements to identify missing indexes"
    ]
  },
  {
    "id": "lab-eng-201",
    "ticketId": "ENG-201",
    "title": "Resolve Deadlock in Concurrent High-Frequency Account Transfers",
    "category": "Distributed Systems",
    "type": "Distributed Systems",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Outage: 18% of peer-to-peer transfers failing with 500 error during high traffic. Postgres logging \"ERROR: deadlock detected\".",
    "scenario": "During a flash campaign, users Alice and Bob simultaneously initiate transfers to each other. Transaction 1 locks Account A and waits for Account B. Transaction 2 locks Account B and waits for Account A. Both transactions deadlock and are killed by the Postgres deadlock detector.",
    "requirements": [
      "Reproduce the circular wait deadlock in concurrent transactions.",
      "Implement consistent resource hierarchy locking (deterministic account ID order).",
      "Handle SELECT FOR UPDATE locks safely.",
      "Add exponential backoff retry logic for transient serialization failures."
    ],
    "acceptanceCriteria": [
      "Deadlock circular dependency eliminated via consistent lock ordering (minId first, then maxId).",
      "Concurrent bidirectional transfers between same accounts succeed without deadlock.",
      "Ledger balances remain atomic and balance invariant is preserved."
    ],
    "techStack": [
      "PostgreSQL",
      "TypeScript",
      "Node.js",
      "Transactions",
      "ACID"
    ],
    "estDurationMinutes": 45,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T12:00:04.100Z [ERROR] [Postgres] ERROR: deadlock detected",
      "2026-09-25T12:00:04.101Z [DEBUG] [Postgres] Process 29188 waits for ShareLock on transaction 88129; blocked by process 29190.",
      "2026-09-25T12:00:04.102Z [DEBUG] [Postgres] Process 29190 waits for ExclusiveLock on tuple (4,12) of relation \"accounts\"; blocked by process 29188.",
      "2026-09-25T12:00:04.105Z [FATAL] [TransferService] Transaction aborted due to deadlock. Rollback executed."
    ],
    "codeFiles": [
      {
        "filename": "src/services/transferService.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Inconsistent lock order causes circular wait!\nexport async function transferMoney(fromAccountId: string, toAccountId: string, amount: number) {\n  const client = await pool.connect()\n  try {\n    await client.query('BEGIN')\n    const from = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromAccountId])\n    const to = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [toAccountId])\n    if (from.rows[0].balance < amount) throw new Error('Insufficient funds')\n    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccountId])\n    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccountId])\n    await client.query('COMMIT')\n  } catch (err) {\n    await client.query('ROLLBACK')\n    throw err\n  } finally {\n    client.release()\n  }\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "The 4 Coffman Conditions",
        "content": "Deadlock requires: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. You can eliminate deadlocks by breaking the Circular Wait condition."
      },
      {
        "level": 2,
        "title": "Resource Hierarchy Rule",
        "content": "Always lock resources in a globally consistent order. For example, always lock the smaller account ID first, then the larger account ID."
      },
      {
        "level": 3,
        "title": "Implementation Hint",
        "content": "const [firstId, secondId] = fromId < toId ? [fromId, toId] : [toId, fromId]; Lock firstId, then lock secondId. This guarantees two transactions can never wait for each other."
      }
    ],
    "solution": {
      "explanation": "By enforcing a deterministic lock acquisition order (sorting account IDs before locking), we eliminate circular wait entirely. Both concurrent transactions will attempt to lock the lower ID first; one will acquire it and the other will wait cleanly without deadlock.",
      "fixedCode": "export async function transferMoney(fromAccountId: string, toAccountId: string, amount: number) {\n  if (fromAccountId === toAccountId) throw new Error('Cannot transfer to same account')\n  const client = await pool.connect()\n  try {\n    await client.query('BEGIN')\n    const [firstLock, secondLock] = fromAccountId < toAccountId\n      ? [fromAccountId, toAccountId]\n      : [toAccountId, fromAccountId]\n\n    await client.query('SELECT id, balance FROM accounts WHERE id = $1 FOR UPDATE', [firstLock])\n    await client.query('SELECT id, balance FROM accounts WHERE id = $1 FOR UPDATE', [secondLock])\n\n    const fromRes = await client.query('SELECT balance FROM accounts WHERE id = $1', [fromAccountId])\n    if (fromRes.rows[0].balance < amount) throw new Error('Insufficient funds')\n\n    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccountId])\n    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccountId])\n    await client.query('COMMIT')\n    return { success: true }\n  } catch (err) {\n    await client.query('ROLLBACK')\n    throw err\n  } finally {\n    client.release()\n  }\n}",
      "fiveWhys": [
        "Why did transfers fail with 500? PostgreSQL detected a deadlock and aborted the transaction.",
        "Why was there a deadlock? Tx 1 held Lock A waiting for B; Tx 2 held Lock B waiting for A.",
        "Why did they lock in different orders? The code locked in the order of fromAccount -> toAccount, which is non-deterministic for bidirectional traffic."
      ],
      "preventionRules": [
        "Always establish a global deterministic lock acquisition hierarchy across all distributed services.",
        "Add transaction retry wrappers with jittered backoff for serialization errors."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Concurrent Bidirectional Simulation",
        "description": "Runs 100 simultaneous transfers (A->B and B->A) across 10 threads",
        "expectedOutcome": "100% of transactions complete without deadlock exception"
      },
      {
        "id": "t2",
        "name": "Conservation of Money",
        "description": "Checks total balance across accounts before and after run",
        "expectedOutcome": "Total system balance delta === 0"
      },
      {
        "id": "t3",
        "name": "Self-Transfer Guard",
        "description": "Attempts to transfer funds from Account A to Account A",
        "expectedOutcome": "Rejects with validation error without acquiring locks"
      }
    ],
    "suggestedPromptChips": [
      "Explain Coffman conditions for deadlocks and how lock ordering breaks them",
      "What is the difference between READ COMMITTED and SERIALIZABLE isolation in Postgres?",
      "How to log deadlocks in Postgres and set up Datadog alerts"
    ]
  },
  {
    "id": "lab-eng-202",
    "ticketId": "ENG-202",
    "title": "Fix Distributed Idempotency Key Collision & Double Billing",
    "category": "Distributed Systems",
    "type": "Distributed Systems",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Financial: 42 customers double-charged because Stripe webhook retry arrived during initial webhook execution.",
    "scenario": "Stripe webhook payment_intent.succeeded retried due to a slow 3-second database write. The second webhook arrived while the first was still processing. Both webhooks checked if the order existed, found none, and both inserted duplicate order records and dispatched duplicate fulfillment emails.",
    "requirements": [
      "Identify the check-then-act race condition in the webhook handler.",
      "Implement an atomic distributed lock or Redis idempotency state machine.",
      "Ensure duplicate webhooks receive HTTP 200 without executing secondary effects.",
      "Add database unique constraint on (provider, event_id)."
    ],
    "acceptanceCriteria": [
      "Concurrent identical webhooks cannot execute double fulfillment.",
      "Idempotency state machine transitions: IN_PROGRESS -> COMPLETED (or FAILED).",
      "Database unique constraint prevents duplicate rows even if lock fails."
    ],
    "techStack": [
      "Node.js",
      "Redis",
      "PostgreSQL",
      "Stripe API"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T12:15:00.100Z [INFO] [Webhook] Received event evt_stripe_9921 for customer cus_412 (Attempt 1)",
      "2026-09-25T12:15:02.105Z [INFO] [Webhook] Received event evt_stripe_9921 for customer cus_412 (Attempt 2 - Stripe Retry)",
      "2026-09-25T12:15:02.110Z [WARN] [OrderService] Checking order for evt_stripe_9921: Not found! Proceeding with creation...",
      "2026-09-25T12:15:03.450Z [FATAL] [Fulfillment] Duplicate shipment order created: ord_101 and ord_102 for same payment!"
    ],
    "codeFiles": [
      {
        "filename": "src/api/webhooks/stripe.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Check-then-act race condition under slow I/O\nexport async function handleStripeWebhook(event: StripeEvent) {\n  const existing = await db.query('SELECT id FROM processed_events WHERE event_id = $1', [event.id])\n  if (existing.rows.length > 0) {\n    return { status: 'already_processed' }\n  }\n  await fulfillOrder(event.data.object)\n  await db.query('INSERT INTO processed_events (event_id) VALUES ($1)', [event.id])\n  return { status: 'success' }\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Check-then-Act Flaw",
        "content": "Checking if an event exists, doing work, and then inserting the record creates a classic TOCTOU (Time of Check to Time of Use) race condition."
      },
      {
        "level": 2,
        "title": "Atomic Reservation",
        "content": "Reserve the event FIRST before doing any work! Use INSERT INTO processed_events (event_id, status) VALUES ($1, 'processing') ON CONFLICT DO NOTHING RETURNING id."
      },
      {
        "level": 3,
        "title": "Distributed Lock with Redis",
        "content": "You can also use Redis SET idempotency:evt_id \"locked\" NX EX 60. If it returns null, another thread is actively handling the event."
      }
    ],
    "solution": {
      "explanation": "We invert the flow: reserve the idempotency record atomically at the very beginning with a unique constraint. If the insert fails or returns no rows, another worker has claimed the event, and we return HTTP 200 immediately.",
      "fixedCode": "export async function handleStripeWebhook(event: StripeEvent) {\n  const res = await db.query(\n    `INSERT INTO processed_events (event_id, status, created_at)\n     VALUES ($1, 'processing', NOW())\n     ON CONFLICT (event_id) DO NOTHING\n     RETURNING id, status`,\n    [event.id]\n  )\n\n  if (res.rows.length === 0) {\n    return { status: 'ignored_duplicate', httpStatus: 200 }\n  }\n\n  try {\n    await fulfillOrder(event.data.object)\n    await db.query(\n      `UPDATE processed_events SET status = 'completed', updated_at = NOW() WHERE event_id = $1`,\n      [event.id]\n    )\n    return { status: 'success', httpStatus: 200 }\n  } catch (err) {\n    await db.query(\n      `UPDATE processed_events SET status = 'failed' WHERE event_id = $1`,\n      [event.id]\n    )\n    throw err\n  }\n}",
      "fiveWhys": [
        "Why was the customer double-billed? Two duplicate fulfillment requests were processed.",
        "Why were there two requests? Stripe retried because the first webhook took > 2 seconds.",
        "Why did both execute? The check SELECT id came before the INSERT, allowing both to read 0 rows."
      ],
      "preventionRules": [
        "Always enforce database-level UNIQUE constraints on external provider event IDs.",
        "Reserve before processing (claim-check pattern).",
        "Return 200 immediately for known duplicates so providers stop retrying."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Simultaneous Duplicate Webhooks",
        "description": "Dispatches 10 parallel webhook calls with identical event_id",
        "expectedOutcome": "Exactly 1 fulfillment executed; 9 return ignored_duplicate"
      },
      {
        "id": "t2",
        "name": "Unique Constraint Guard",
        "description": "Attempts direct duplicate insertion into processed_events",
        "expectedOutcome": "Database throws unique_violation error"
      },
      {
        "id": "t3",
        "name": "Failure State Recovery",
        "description": "Simulates fulfillment failure and verifies status transitions to failed",
        "expectedOutcome": "State marked failed, allowing controlled retry"
      }
    ],
    "suggestedPromptChips": [
      "Compare Redis SET NX vs Postgres ON CONFLICT for idempotency",
      "What is the claim-check pattern in distributed event processing?",
      "How to test webhook idempotency in CI/CD pipeline?"
    ]
  },
  {
    "id": "lab-eng-203",
    "ticketId": "ENG-203",
    "title": "Resolve Kafka Consumer Lag Explosion & Rebalancing Storm",
    "category": "Distributed Systems",
    "type": "Distributed Systems",
    "difficulty": "Advanced",
    "severity": "P1 - High Priority",
    "impact": "Consumer lag exceeded 850,000 messages on notifications-topic. Consumer group constantly rebalancing; notifications delayed by 4 hours.",
    "scenario": "A batch email worker takes 450ms per message. Processing 500 messages in eachBatch takes ~225 seconds, which exceeds the Kafka max.poll.interval.ms of 120 seconds. The Kafka broker assumes the consumer is dead, kicks it out of the group, and triggers a rebalance storm.",
    "requirements": [
      "Identify the relationship between max.poll.interval.ms, batch size, and processing latency.",
      "Decouple Kafka message consumption from heavy processing using an in-memory worker pool.",
      "Configure auto-commit / manual commit strategies to prevent message duplication upon rebalance.",
      "Restore consumer group stability and eliminate rebalance loops."
    ],
    "acceptanceCriteria": [
      "Consumer stays alive and never exceeds max.poll.interval.ms.",
      "Rebalance storm stopped completely.",
      "Processing throughput increases 10x using concurrent worker pipeline."
    ],
    "techStack": [
      "Apache Kafka",
      "Node.js",
      "Distributed Streaming",
      "Concurrency"
    ],
    "estDurationMinutes": 45,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T12:30:10.010Z [WARN] [KafkaJS] The consumer group is rebalancing: member notification-worker-1 evicted",
      "2026-09-25T12:30:10.015Z [ERROR] [KafkaConsumer] CommitFailedException: Offset commit cannot be completed since the consumer is not part of the active group",
      "2026-09-25T12:30:10.020Z [DEBUG] Consumer heartbeat expired: last poll was 215,000ms ago (max.poll.interval.ms: 120,000ms)",
      "2026-09-25T12:30:12.000Z [INFO] Partition assignments revoked. All 850,000 uncommitted messages will be re-processed by another consumer!"
    ],
    "codeFiles": [
      {
        "filename": "src/workers/notificationConsumer.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Synchronous sequential processing blocks poll loop past max.poll.interval.ms\nawait consumer.run({\n  eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {\n    for (const message of batch.messages) {\n      if (!isRunning() || isStale()) break\n      await sendNotificationEmail(JSON.parse(message.value.toString()))\n      resolveOffset(message.offset)\n    }\n  }\n})"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Kafka Heartbeat vs Poll Interval",
        "content": "Kafka consumers have two timeouts: session.timeout.ms (background heartbeat thread) and max.poll.interval.ms (time between poll calls). If batch processing takes longer than max.poll.interval.ms, the consumer is evicted!"
      },
      {
        "level": 2,
        "title": "Batch Size vs Concurrency",
        "content": "Either reduce max.poll.records (e.g. 50 instead of 500) OR process messages concurrently with p-limit / worker pool so the batch finishes well within timeout."
      },
      {
        "level": 3,
        "title": "Sending Periodic Heartbeats",
        "content": "Call await heartbeat() inside the loop, and dispatch items into a concurrency-limited pool (e.g. pLimit(20))."
      }
    ],
    "solution": {
      "explanation": "We configure a smaller batch size (max.poll.records: 100), execute concurrent processing with p-limit (25 parallel workers), and call heartbeat() periodically during long batches. This keeps the consumer active and boosts throughput from 2 msg/s to 50 msg/s.",
      "fixedCode": "import pLimit from 'p-limit'\n\nconst limit = pLimit(25)\n\nawait consumer.run({\n  eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {\n    const tasks = batch.messages.map((message) =>\n      limit(async () => {\n        if (!isRunning() || isStale()) return\n        await sendNotificationEmail(JSON.parse(message.value.toString()))\n        resolveOffset(message.offset)\n      })\n    )\n\n    const heartbeatInterval = setInterval(() => {\n      heartbeat().catch(() => {})\n    }, 5000)\n\n    try {\n      await Promise.all(tasks)\n    } finally {\n      clearInterval(heartbeatInterval)\n    }\n  }\n})",
      "fiveWhys": [
        "Why did consumer rebalance continuously? It was evicted from the consumer group.",
        "Why was it evicted? The poll loop did not poll within max.poll.interval.ms.",
        "Why did it take so long? 500 emails were sent sequentially over network without concurrency."
      ],
      "preventionRules": [
        "Always instrument consumer lag metrics with Prometheus / Datadog.",
        "Set max.poll.interval.ms safely higher than (max.poll.records * P99 processing latency).",
        "Never process heavy external I/O sequentially in a Kafka poll loop."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Batch Duration Guard",
        "description": "Simulates 500 messages with 100ms artificial latency",
        "expectedOutcome": "Batch completes in < 4 seconds with 25 workers (well below 120s limit)"
      },
      {
        "id": "t2",
        "name": "Heartbeat Continuity",
        "description": "Monitors consumer group membership over 10 minutes",
        "expectedOutcome": "Zero member evictions or rebalances recorded"
      },
      {
        "id": "t3",
        "name": "Offset Commit Verification",
        "description": "Verifies offsets committed after batch completion",
        "expectedOutcome": "Committed offset equals latest message offset"
      }
    ],
    "suggestedPromptChips": [
      "Explain difference between session.timeout.ms and max.poll.interval.ms",
      "How to implement backpressure in Kafka consumers?",
      "How to handle poison pill messages in Kafka dead letter queue (DLQ)?"
    ]
  },
  {
    "id": "lab-eng-204",
    "ticketId": "ENG-204",
    "title": "Halt Cascading Microservice Failure with Circuit Breaker & Jitter",
    "category": "Distributed Systems",
    "type": "Distributed Systems",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Outage: Downstream recommendation service slowdown caused API Gateway thread pool exhaustion, bringing down entire checkout & search flows.",
    "scenario": "Recommendation service latency degraded from 20ms to 4,500ms. The API Gateway had no timeout and aggressive immediate retries (retry 3x immediately). 2,000 incoming requests multiplied into 8,000 concurrent outbound connections, exhausting the API gateway connection pool and crashing all unrelated services.",
    "requirements": [
      "Set strict outbound timeouts on the downstream client.",
      "Implement the Circuit Breaker pattern (CLOSED -> OPEN -> HALF-OPEN).",
      "Replace immediate retries with Exponential Backoff with Full Jitter.",
      "Provide fallback response when circuit is open so user experience degrades gracefully."
    ],
    "acceptanceCriteria": [
      "Failing downstream service immediately fast-fails within 50ms when circuit is OPEN.",
      "Gateway connection pool utilization stays below 30% during downstream outages.",
      "Graceful degradation: user gets popular items fallback instead of HTTP 504 error."
    ],
    "techStack": [
      "Microservices",
      "Resilience",
      "Node.js",
      "Circuit Breaker",
      "SRE"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T13:00:01.001Z [WARN] [Recommendations] Service latency P99: 4,820ms",
      "2026-09-25T13:00:02.150Z [ERROR] [Gateway] Pool exhausted: 1024/1024 active connections. Rejecting incoming HTTP requests.",
      "2026-09-25T13:00:02.200Z [CRITICAL] [Healthcheck] /api/checkout failed: 504 Gateway Timeout",
      "2026-09-25T13:00:03.000Z [ALERT] Paging on-call: System-wide outage. All API routes timing out."
    ],
    "codeFiles": [
      {
        "filename": "src/lib/httpClient.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: No timeout, aggressive immediate retries, no circuit breaker!\nexport async function getRecommendations(userId: string) {\n  for (let attempt = 1; attempt <= 3; attempt++) {\n    try {\n      const res = await fetch(`http://recommendations-service/user/${userId}`)\n      return await res.json()\n    } catch (err) {\n      if (attempt === 3) throw err\n    }\n  }\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "The Thundering Herd Phenomenon",
        "content": "When an overloaded service starts slowing down, retrying immediately multiplies traffic by 3x or 4x, guaranteeing that the service can never recover."
      },
      {
        "level": 2,
        "title": "Exponential Backoff with Jitter",
        "content": "Use backoff = Math.min(maxBackoff, base * 2 ** attempt). Add full jitter: randomBetween(0, backoff). Jitter breaks synchronization of client retries."
      },
      {
        "level": 3,
        "title": "Circuit Breaker States",
        "content": "When failure count exceeds threshold (e.g. 5 errors in 10s), trip circuit to OPEN. Return fallback immediately for 30 seconds without touching the network. After 30s, enter HALF-OPEN and test 1 probe request."
      }
    ],
    "solution": {
      "explanation": "We wrap downstream calls with an AbortController timeout (500ms), a Circuit Breaker that fast-fails with a cached/empty fallback when tripped, and exponential backoff with randomized jitter.",
      "fixedCode": "interface CircuitState {\n  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'\n  failures: number\n  nextAttempt: number\n}\n\nconst circuit: CircuitState = { state: 'CLOSED', failures: 0, nextAttempt: 0 }\nconst FALLBACK_RECS = [{ id: 'p_popular_1', title: 'Top Rated Product' }]\n\nexport async function getRecommendationsWithResilience(userId: string) {\n  const now = Date.now()\n  if (circuit.state === 'OPEN') {\n    if (now < circuit.nextAttempt) return FALLBACK_RECS\n    circuit.state = 'HALF_OPEN'\n  }\n\n  const controller = new AbortController()\n  const timeout = setTimeout(() => controller.abort(), 600)\n\n  try {\n    const res = await fetch(`http://recommendations-service/user/${userId}`, {\n      signal: controller.signal\n    })\n    clearTimeout(timeout)\n    if (!res.ok) throw new Error(`HTTP ${res.status}`)\n    const data = await res.json()\n    circuit.state = 'CLOSED'\n    circuit.failures = 0\n    return data\n  } catch (err) {\n    clearTimeout(timeout)\n    circuit.failures++\n    if (circuit.failures >= 5 || circuit.state === 'HALF_OPEN') {\n      circuit.state = 'OPEN'\n      circuit.nextAttempt = Date.now() + 15000\n    }\n    return FALLBACK_RECS\n  }\n}",
      "fiveWhys": [
        "Why did checkout crash? The API Gateway connection pool was 100% saturated.",
        "Why was it saturated? 1,024 threads were blocked waiting on recommendations.",
        "Why were they blocked? The outbound HTTP client had no timeout and retried 3 times immediately."
      ],
      "preventionRules": [
        "Every outbound network request MUST have an explicit deadline / timeout.",
        "Always decorate inter-service clients with circuit breakers.",
        "Always use jittered exponential backoff for retries."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Timeout Enforcement",
        "description": "Downstream hangs for 10 seconds",
        "expectedOutcome": "Call aborts at 600ms and returns fallback items"
      },
      {
        "id": "t2",
        "name": "Circuit Breaker Tripping",
        "description": "Sends 5 consecutive timed-out requests",
        "expectedOutcome": "Circuit transitions to OPEN; subsequent requests return fallback in < 1ms"
      },
      {
        "id": "t3",
        "name": "Half-Open Recovery",
        "description": "Advances clock past 15s cool-off and sends successful request",
        "expectedOutcome": "Circuit transitions to CLOSED and normal traffic resumes"
      }
    ],
    "suggestedPromptChips": [
      "Explain Circuit Breaker states (Closed, Open, Half-Open)",
      "Why is full jitter better than equal jitter in backoff algorithms?",
      "How to implement resilient fallbacks in microservice architecture"
    ]
  },
  {
    "id": "lab-eng-205",
    "ticketId": "ENG-205",
    "title": "Diagnose & Eliminate N+1 Query Explosion in GraphQL/ORM API",
    "category": "Databases & Cache",
    "type": "Database",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "Loading /api/feed generates 251 SQL queries per request, exhausting PostgreSQL max_connections and spiking database latency to 3,200ms.",
    "scenario": "Users navigating to the main feed see a spinning wheel. In our ORM/GraphQL resolver, fetching 50 posts triggers 1 query for posts, 50 queries for authors, 50 queries for like counts, and 150 queries for top comments (N+1 problem). With 50 concurrent users, the DB collapses.",
    "requirements": [
      "Profile database queries using query logging to expose the N+1 pattern.",
      "Refactor data retrieval using DataLoader batching or SQL JOIN / json_agg aggregation.",
      "Reduce total query count from 251 queries to exactly 1 or 2 queries.",
      "Verify that response payload remains identical and response latency drops from 3,200ms to < 45ms."
    ],
    "acceptanceCriteria": [
      "Query count reduced from O(N) to O(1).",
      "Database connection pool starvation eliminated.",
      "DataLoader or JOIN query passes all regression tests with identical output schema."
    ],
    "techStack": [
      "PostgreSQL",
      "Prisma",
      "GraphQL",
      "DataLoader",
      "TypeScript"
    ],
    "estDurationMinutes": 35,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T13:10:01.000Z [DEBUG] [SQL] SELECT * FROM posts ORDER BY created_at DESC LIMIT 50",
      "2026-09-25T13:10:01.025Z [DEBUG] [SQL] SELECT * FROM users WHERE id = 'u_1'",
      "2026-09-25T13:10:01.032Z [DEBUG] [SQL] SELECT * FROM users WHERE id = 'u_2'",
      "... [TRUNCATED 248 IDENTICAL QUERIES] ...",
      "2026-09-25T13:10:04.200Z [WARN] [Pool] 98/100 connections in use. Waiting clients: 42"
    ],
    "codeFiles": [
      {
        "filename": "src/resolvers/feedResolver.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: N+1 queries in loops!\nexport async function getFeed() {\n  const posts = await db.query('SELECT id, author_id, content, created_at FROM posts LIMIT 50')\n  const enriched = []\n  for (const post of posts.rows) {\n    const author = await db.query('SELECT id, name, avatar FROM users WHERE id = $1', [post.author_id])\n    const comments = await db.query('SELECT id, text FROM comments WHERE post_id = $1 LIMIT 3', [post.id])\n    enriched.push({ ...post, author: author.rows[0], topComments: comments.rows })\n  }\n  return enriched\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Identifying the N+1 Pattern",
        "content": "Whenever you see a query inside a for-loop or individual field resolver, you have an N+1 problem. 50 items = 1 + 50 + 50 queries."
      },
      {
        "level": 2,
        "title": "Batching Strategy",
        "content": "Collect all author_ids into an array and fetch all authors in ONE query: SELECT * FROM users WHERE id = ANY($1). Map them back using a dictionary."
      },
      {
        "level": 3,
        "title": "Single Query with json_agg",
        "content": "Modern PostgreSQL can do this in a single query using LEFT JOIN and json_agg / json_build_object."
      }
    ],
    "solution": {
      "explanation": "We replace 101 sequential round trips with 2 batched queries (or 1 SQL query with LEFT JOINs). By collecting all author IDs and post IDs, we fetch related records in batch and assemble the tree in memory.",
      "fixedCode": "export async function getFeedBatched() {\n  const posts = await db.query('SELECT id, author_id, content, created_at FROM posts ORDER BY created_at DESC LIMIT 50')\n  if (posts.rows.length === 0) return []\n\n  const authorIds = Array.from(new Set(posts.rows.map(p => p.author_id)))\n  const postIds = posts.rows.map(p => p.id)\n\n  const authorsRes = await db.query('SELECT id, name, avatar FROM users WHERE id = ANY($1)', [authorIds])\n  const authorMap = new Map(authorsRes.rows.map(a => [a.id, a]))\n\n  const commentsRes = await db.query('SELECT id, post_id, text FROM comments WHERE post_id = ANY($1)', [postIds])\n  const commentsMap = new Map<string, any[]>()\n  for (const c of commentsRes.rows) {\n    if (!commentsMap.has(c.post_id)) commentsMap.set(c.post_id, [])\n    if (commentsMap.get(c.post_id)!.length < 3) commentsMap.get(c.post_id)!.push(c)\n  }\n\n  return posts.rows.map(post => ({\n    ...post,\n    author: authorMap.get(post.author_id) || null,\n    topComments: commentsMap.get(post.id) || []\n  }))\n}",
      "fiveWhys": [
        "Why was feed loading taking 3.2 seconds? It executed 101 database queries per request.",
        "Why 101 queries? The loop executed a query for each post's author and comments.",
        "Why was it coded that way? The author used naïve ORM lazy loading without prefetching."
      ],
      "preventionRules": [
        "Use DataLoader or Prisma include / select prefetching.",
        "Install query count assertion tests in CI (e.g. expect(db.queriesCount).toBeLessThan(3))."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Query Count Assertion",
        "description": "Executes getFeedBatched for 50 posts",
        "expectedOutcome": "Total SQL queries executed === 3 (instead of 101)"
      },
      {
        "id": "t2",
        "name": "Payload Parity",
        "description": "Compares response structure against original API specification",
        "expectedOutcome": "100% JSON equality match across all 50 items"
      },
      {
        "id": "t3",
        "name": "Latency Benchmark",
        "description": "Benchmarks 100 requests in test environment",
        "expectedOutcome": "P95 latency drops from 3,200ms to 24ms"
      }
    ],
    "suggestedPromptChips": [
      "How does DataLoader use event loop tick batching?",
      "Compare SQL JOIN with json_agg vs DataLoader in GraphQL",
      "How to detect N+1 queries in production using OpenTelemetry"
    ]
  },
  {
    "id": "lab-eng-206",
    "ticketId": "ENG-206",
    "title": "Zero-Downtime PostgreSQL Schema Migration on 50M Rows",
    "category": "Databases & Cache",
    "type": "Database",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Incident: Running ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false locked users table for 9 minutes, dropping 80,000 incoming requests.",
    "scenario": "A developer executed a database migration on our 50-million row users table adding a NOT NULL column with a default value. In PostgreSQL versions < 11 (or complex expressions), this rewriting operation acquires an ACCESS EXCLUSIVE lock, blocking all SELECT, INSERT, and UPDATE queries. The entire application went down.",
    "requirements": [
      "Explain the lock levels acquired by various ALTER TABLE statements in PostgreSQL.",
      "Design a 3-step zero-downtime migration strategy (Expand and Contract pattern).",
      "Add the column without a default first, backfill rows in small batches, then enforce NOT NULL with NOT VALID.",
      "Execute VALIDATE CONSTRAINT safely without holding an exclusive table lock."
    ],
    "acceptanceCriteria": [
      "Table lock held for < 50ms at all times.",
      "Zero downtime or connection queuing during migration on 50M table.",
      "Data backfill script throttles updates to prevent replication lag."
    ],
    "techStack": [
      "PostgreSQL",
      "Database Migration",
      "Zero-Downtime",
      "DevOps"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T13:20:00.000Z [INFO] Running migration: 20260925_add_is_verified.sql",
      "2026-09-25T13:20:01.200Z [WARN] lock_timeout exceeded for 45 incoming requests waiting on \"users\" relation",
      "2026-09-25T13:20:05.000Z [ERROR] Lock conflict: ACCESS EXCLUSIVE lock held by migration process PID 8812",
      "2026-09-25T13:20:10.000Z [CRITICAL] 503 Service Unavailable: All database worker pools exhausted"
    ],
    "codeFiles": [
      {
        "filename": "db/migrations/20260925_dangerous_migration.sql",
        "language": "sql",
        "isBuggy": true,
        "code": "-- DANGEROUS: Locks entire 50M table for 9 minutes!\nALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;\nALTER TABLE users ADD COLUMN phone_normalized VARCHAR(20) NOT NULL;"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "The Lock Hierarchy in Postgres",
        "content": "ACCESS EXCLUSIVE locks block everything (even reads!). You must never run long-running DDL under an ACCESS EXCLUSIVE lock on production tables."
      },
      {
        "level": 2,
        "title": "Step 1: Add Nullable Column",
        "content": "Adding a nullable column without a default takes milliseconds because it only updates the Postgres catalog metadata (no table rewrite)."
      },
      {
        "level": 3,
        "title": "Step 2 & 3: Backfill and Validate Constraint",
        "content": "Backfill in batches of 5,000 rows. Then: ALTER TABLE users ADD CONSTRAINT chk_verified CHECK (is_verified IS NOT NULL) NOT VALID; followed by: ALTER TABLE users VALIDATE CONSTRAINT chk_verified; (VALIDATE does not hold exclusive lock!)."
      }
    ],
    "solution": {
      "explanation": "The Expand and Contract pattern splits breaking DDL into safe steps: (1) Add nullable column (catalog metadata update, ~2ms), (2) App code writes to new column while falling back to default on read, (3) Backfill historical rows in small sleep-throttled batches, (4) Add constraint NOT VALID and validate non-blockingly.",
      "fixedCode": "-- Phase 1: Instant metadata addition (~3ms)\nALTER TABLE users ADD COLUMN is_verified BOOLEAN;\n\n-- Phase 2: Backfill historical rows in batches (run via script with sleep):\n-- UPDATE users SET is_verified = false WHERE id BETWEEN $min AND $max AND is_verified IS NULL;\n\n-- Phase 3: Add constraint without blocking writes\nALTER TABLE users ADD CONSTRAINT chk_is_verified_not_null\nCHECK (is_verified IS NOT NULL) NOT VALID;\n\n-- Phase 4: Validate constraint with SHARE UPDATE EXCLUSIVE lock (reads & writes permitted!)\nALTER TABLE users VALIDATE CONSTRAINT chk_is_verified_not_null;",
      "fiveWhys": [
        "Why did the site go down? The users table was locked for 9 minutes.",
        "Why was it locked? ALTER TABLE ... NOT NULL DEFAULT false rewrote all 50M rows on disk.",
        "Why did it rewrite? Older Postgres versions and unoptimized DDL require a table rewrite to fill defaults."
      ],
      "preventionRules": [
        "Set lock_timeout = '2s' in all migration sessions to fail fast rather than queue connections.",
        "Enforce safe migration linters (e.g. strong_migrations / squawk) in CI.",
        "Never run table rewrites or unindexed foreign keys in a single transaction."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Lock Acquisition Duration",
        "description": "Measures table lock duration during Phase 1 execution",
        "expectedOutcome": "Lock held for < 10ms"
      },
      {
        "id": "t2",
        "name": "Constraint Validation Check",
        "description": "Attempts to insert row with null is_verified after Phase 4",
        "expectedOutcome": "Database throws check constraint violation"
      },
      {
        "id": "t3",
        "name": "Batch Backfill Progress",
        "description": "Simulates batched backfill runner with 1,000 row chunks",
        "expectedOutcome": "100% of historical records backfilled with zero replication lag"
      }
    ],
    "suggestedPromptChips": [
      "Explain the Expand and Contract pattern for database migrations",
      "How does NOT VALID and VALIDATE CONSTRAINT work in Postgres?",
      "How to configure strong_migrations in CI to prevent dangerous DDL"
    ]
  },
  {
    "id": "lab-eng-207",
    "ticketId": "ENG-207",
    "title": "Mitigate Redis Cache Stampede on High-Traffic Flash Sale Items",
    "category": "Databases & Cache",
    "type": "Database",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Outage: Flash sale item key expired in Redis; 45,000 concurrent requests simultaneously bypassed cache and overwhelmed PostgreSQL database, causing total connection crash.",
    "scenario": "During a Black Friday flash sale, the hot cache key product:deal:99 expired. 45,000 incoming requests found a cache miss at the exact same millisecond. Each request issued an expensive join query to Postgres to recalculate inventory and prices. Postgres reached 100% CPU and began dropping connections.",
    "requirements": [
      "Understand the Thundering Herd / Cache Stampede problem.",
      "Implement single-flight distributed locking (mutex) using Redis SET NX.",
      "Implement Probabilistic Early Expiration (XFetch algorithm) to recompute cache before TTL expiry.",
      "Verify that only exactly 1 request queries the database while others wait or receive stale data."
    ],
    "acceptanceCriteria": [
      "Under 10,000 concurrent cache misses, exactly 1 query reaches Postgres.",
      "Average response time stays under 10ms even during key expiration.",
      "Probabilistic refresh background worker prevents key from ever expiring under active load."
    ],
    "techStack": [
      "Redis",
      "Node.js",
      "PostgreSQL",
      "Caching Algorithms"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T13:30:00.000Z [INFO] Redis TTL expired for key: product:deal:99",
      "2026-09-25T13:30:00.005Z [WARN] Cache miss burst: 12,400 requests/sec for product:deal:99",
      "2026-09-25T13:30:00.220Z [ERROR] Postgres connection limit reached (500/500). Max pool connections exhausted.",
      "2026-09-25T13:30:00.500Z [CRITICAL] 500 Internal Server Error returned to 94% of visitors"
    ],
    "codeFiles": [
      {
        "filename": "src/services/productCache.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Standard cache-aside without stampede protection!\nexport async function getProduct(id: string) {\n  const cached = await redis.get(`product:${id}`)\n  if (cached) return JSON.parse(cached)\n\n  // DANGER: 40,000 concurrent requests execute this DB query simultaneously!\n  const product = await db.query('SELECT * FROM products WHERE id = $1', [id])\n  await redis.set(`product:${id}`, JSON.stringify(product.rows[0]), 'EX', 300)\n  return product.rows[0]\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Why Cache-Aside Breaks under Load",
        "content": "When a key expires under 1,000 QPS, all 1,000 requests see null simultaneously and all hit the database before any one can repopulate Redis."
      },
      {
        "level": 2,
        "title": "Mutex / Distributed Lock",
        "content": "When cache is null, acquire lock = await redis.set(\"lock:product:\" + id, \"1\", \"NX\", \"EX\", 5). If acquired, query DB and set cache. If not, sleep 50ms and retry getProduct."
      },
      {
        "level": 3,
        "title": "Probabilistic Early Expiration (XFetch)",
        "content": "Store expiry delta inside payload: { value, delta, expiry }. Refresh when: -delta * beta * Math.log(Math.random()) >= (expiry - now). A single request probabilistically recalculates before expiry!"
      }
    ],
    "solution": {
      "explanation": "We implement single-flight mutex locking using Redis SET NX. When a cache miss occurs, only the worker that successfully acquires the lock queries the database. All other concurrent requests wait briefly and read the freshly cached value.",
      "fixedCode": "export async function getProductProtected(id: string): Promise<any> {\n  const key = `product:${id}`\n  const cached = await redis.get(key)\n  if (cached) return JSON.parse(cached)\n\n  const lockKey = `lock:${key}`\n  const acquired = await redis.set(lockKey, '1', 'PX', 5000, 'NX')\n\n  if (acquired) {\n    try {\n      const res = await db.query('SELECT * FROM products WHERE id = $1', [id])\n      const data = res.rows[0]\n      await redis.set(key, JSON.stringify(data), 'EX', 300)\n      return data\n    } finally {\n      await redis.del(lockKey)\n    }\n  } else {\n    // Another worker is populating the cache; wait and retry\n    await new Promise(r => setTimeout(r, 60))\n    return getProductProtected(id)\n  }\n}",
      "fiveWhys": [
        "Why did Postgres crash? 45,000 queries hit the database in 100 milliseconds.",
        "Why did they hit Postgres? The Redis key expired during peak traffic.",
        "Why didn't cache-aside protect it? Cache-aside has no coordination; every cache miss assumes it is responsible for refetching."
      ],
      "preventionRules": [
        "Always wrap hot cache keys with single-flight mutex or XFetch probabilistic refresh.",
        "Serve stale data while asynchronously revalidating in background (stale-while-revalidate).",
        "Add jitter to cache TTLs (e.g. 300s + Math.random() * 60) so multiple keys never expire at the exact same second."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Stampede Concurrency Test",
        "description": "Simulates 5,000 concurrent requests on expired key",
        "expectedOutcome": "Database query count === exactly 1"
      },
      {
        "id": "t2",
        "name": "Latency Stability",
        "description": "Measures P99 response time across all 5,000 clients",
        "expectedOutcome": "P99 < 85ms for all waiting clients"
      },
      {
        "id": "t3",
        "name": "Lock Release on Error",
        "description": "Simulates DB failure during population",
        "expectedOutcome": "Lock released cleanly in finally block, preventing permanent deadlock"
      }
    ],
    "suggestedPromptChips": [
      "Explain the XFetch algorithm for probabilistic cache renewal",
      "What is stale-while-revalidate in caching architectures?",
      "How to choose TTL jitter to prevent synchronized cache expiration"
    ]
  },
  {
    "id": "lab-eng-208",
    "ticketId": "ENG-208",
    "title": "Troubleshoot Node.js Event Loop Blockage & Listener Memory Leak",
    "category": "Production Incidents",
    "type": "Backend",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Production: Node.js memory steadily climbed from 250MB to 2.8GB until container OOMKilled every 45 minutes. Event loop delay spiked to 12,000ms.",
    "scenario": "Production containers are repeatedly crashing with Out of Memory errors. Sentry logs show MaxListenersExceededWarning: Possible EventEmitter memory leak detected. An investigation reveals that a WebSocket notifications service was attaching unclosed event listeners inside an HTTP route handler, leaking closures with every request.",
    "requirements": [
      "Analyze heap snapshots to identify retaining paths for leaking objects.",
      "Diagnose MaxListenersExceededWarning in Node.js EventEmitters.",
      "Fix the event listener lifecycle to ensure cleanup on client disconnect or route completion.",
      "Benchmark memory footprint under 50,000 simulated requests to prove zero leak."
    ],
    "acceptanceCriteria": [
      "MaxListenersExceededWarning completely eliminated.",
      "Memory footprint stays flat under sustained 1,000 req/sec load.",
      "Event loop lag stays < 10ms."
    ],
    "techStack": [
      "Node.js",
      "V8 Engine",
      "Memory Profiling",
      "Event Loop",
      "TypeScript"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T13:40:01.100Z (node:412) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 notification listeners added to [NotificationHub]. Use emitter.setMaxListeners() to increase limit",
      "2026-09-25T13:40:15.000Z [WARN] [Metrics] process.memoryUsage().heapUsed: 1.84 GB (Baseline: 180 MB)",
      "2026-09-25T13:40:30.000Z [CRITICAL] [EventLoop] Event loop lag: 8,420ms! Health check /healthz timed out.",
      "2026-09-25T13:41:00.000Z [FATAL] [Kubernetes] Container api-service-67b8d killed by OOM (exit code 137)"
    ],
    "codeFiles": [
      {
        "filename": "src/routes/liveUpdates.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Registers listener on global emitter per request without ever unregistering!\nimport { EventEmitter } from 'events'\nexport const globalHub = new EventEmitter()\n\nexport function handleSseRequest(req: any, res: any) {\n  res.writeHead(200, { 'Content-Type': 'text/event-stream' })\n  \n  // LEAK: Closure holds references to res and req forever in globalHub.listeners!\n  globalHub.on('broadcast', (data) => {\n    res.write(`data: ${JSON.stringify(data)}\\n\\n`)\n  })\n  // Missing: req.on('close', ...) cleanup!\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Retaining Tree in V8",
        "content": "When an event listener closure references req or res, and that listener is added to a singleton global emitter, the entire HTTP request/response object, headers, socket buffer, and closures are kept in memory forever."
      },
      {
        "level": 2,
        "title": "The Missing Lifecycle Hook",
        "content": "HTTP requests emit a close event when the client disconnects. Listen for req.on(\"close\", handler) to remove the listener."
      },
      {
        "level": 3,
        "title": "Proper Listener Removal",
        "content": "Define a named function handler. Call globalHub.removeListener(\"broadcast\", handler) inside req.on(\"close\")."
      }
    ],
    "solution": {
      "explanation": "Every time handleSseRequest was called, an anonymous function was registered on the singleton globalHub. Because it was never removed, thousands of HTTP response streams were retained in memory. We define a named listener and clean it up on client disconnect.",
      "fixedCode": "import { EventEmitter } from 'events'\nexport const globalHub = new EventEmitter()\n\nexport function handleSseRequest(req: any, res: any) {\n  res.writeHead(200, {\n    'Content-Type': 'text/event-stream',\n    'Cache-Control': 'no-cache',\n    'Connection': 'keep-alive'\n  })\n\n  const onBroadcast = (data: any) => {\n    res.write(`data: ${JSON.stringify(data)}\\n\\n`)\n  }\n\n  globalHub.on('broadcast', onBroadcast)\n\n  // CRITICAL CLEANUP: Remove listener when client disconnects\n  req.on('close', () => {\n    globalHub.removeListener('broadcast', onBroadcast)\n  })\n}",
      "fiveWhys": [
        "Why did the container crash with OOM? Heap usage surpassed the 2.5GB container memory limit.",
        "Why did heap usage climb? 40,000 HTTP request/response contexts were pinned in memory.",
        "Why were they pinned? The global EventEmitter held references to closures that referenced res."
      ],
      "preventionRules": [
        "Never attach anonymous event listeners to long-lived objects inside per-request code.",
        "Always pair emitter.on() with a corresponding emitter.removeListener() on cleanup/unmount.",
        "Track process.memoryUsage().heapUsed in metrics and alert on monotonic increases."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Listener Cleanup Verification",
        "description": "Opens 500 SSE connections and disconnects them all",
        "expectedOutcome": "globalHub.listenerCount(\"broadcast\") returns exactly 0"
      },
      {
        "id": "t2",
        "name": "Heap Stability Test",
        "description": "Simulates 10,000 request cycles with GC triggered",
        "expectedOutcome": "Heap memory returns to baseline +/- 5%"
      },
      {
        "id": "t3",
        "name": "MaxListeners Warning Check",
        "description": "Monitors process warnings under load",
        "expectedOutcome": "Zero MaxListenersExceededWarning emitted"
      }
    ],
    "suggestedPromptChips": [
      "How to take and analyze heap snapshots in Chrome DevTools / Node inspect",
      "What are V8 retaining paths and weak references?",
      "How to detect event loop blockage with clinic.js or autocannon"
    ]
  },
  {
    "id": "lab-eng-209",
    "ticketId": "ENG-209",
    "title": "Detect & Patch Goroutine Leak in Worker Pool under Timeout",
    "category": "Production Incidents",
    "type": "Backend",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "P1 Leak: Goroutine count grew monotonically from 80 to 142,000 over 4 days, causing memory exhaustion and eventual scheduler lockup.",
    "scenario": "A microservice worker pool issues external HTTP requests with context timeouts. When a request times out, the main function returns immediately, but the spawned background goroutine attempts to write the response to an unbuffered channel. Because there is no longer a reader, the goroutine blocks forever on channel send, leaking its stack and context.",
    "requirements": [
      "Use pprof (goroutine profile) to identify blocked goroutines.",
      "Explain why unbuffered channels cause goroutine leaks when caller exits early.",
      "Fix the channel pattern by using a buffered channel of capacity 1 or select with ctx.Done().",
      "Verify that goroutine count stays constant regardless of downstream timeout rates."
    ],
    "acceptanceCriteria": [
      "Goroutines properly terminate when context expires.",
      "Channel send does not block indefinitely.",
      "Goroutine count returns to baseline after simulated timeout bursts."
    ],
    "techStack": [
      "Go",
      "Concurrency",
      "Pprof",
      "Channels",
      "Context"
    ],
    "estDurationMinutes": 35,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T14:00:00.000Z [INFO] runtime.NumGoroutine(): 84,210 (Normal: 120)",
      "2026-09-25T14:00:01.000Z [DEBUG] pprof goroutine stack: 84,090 goroutines blocked in runtime.chansend() at fetcher.go:28",
      "2026-09-25T14:00:05.000Z [WARN] Resident Set Size (RSS) memory: 1.42 GB"
    ],
    "codeFiles": [
      {
        "filename": "fetcher.go",
        "language": "go",
        "isBuggy": true,
        "code": "// BUGGY: Unbuffered channel blocks goroutine forever if caller times out!\nfunc FetchUserData(ctx context.Context, id string) (*UserData, error) {\n    ch := make(chan *UserData) // UNBUFFERED CHANNEL!\n    errCh := make(chan error)\n\n    go func() {\n        data, err := queryExternalAPI(id) // Takes 3s\n        if err != nil {\n            errCh <- err // BLOCKS FOREVER if caller already timed out!\n            return\n        }\n        ch <- data // BLOCKS FOREVER if caller already timed out!\n    }()\n\n    select {\n    case <-ctx.Done():\n        return nil, ctx.Err() // Exits early! No one is reading ch anymore!\n    case err := <-errCh:\n        return nil, err\n    case data := <-ch:\n        return data, nil\n    }\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Why Unbuffered Channels Block",
        "content": "An unbuffered channel send (ch <- val) blocks until another goroutine is actively receiving. If the receiver returned on ctx.Done(), the sender is stuck forever in memory."
      },
      {
        "level": 2,
        "title": "Buffered Channel Solution",
        "content": "Make the channel buffered with capacity 1: ch := make(chan *UserData, 1). A channel with buffer 1 allows the goroutine to send without blocking even if no one is listening!"
      },
      {
        "level": 3,
        "title": "Select with ctx.Done()",
        "content": "Alternatively, inside the goroutine, send using select: select { case ch <- data: case <-ctx.Done(): return }."
      }
    ],
    "solution": {
      "explanation": "We change the channels to buffered channels of size 1 (ch := make(chan *UserData, 1)). This allows the background goroutine to complete its write non-blockingly and exit cleanly, even if the caller already timed out and abandoned the channel.",
      "fixedCode": "func FetchUserData(ctx context.Context, id string) (*UserData, error) {\n    // Buffer capacity of 1 allows non-blocking send even if caller times out!\n    ch := make(chan *UserData, 1)\n    errCh := make(chan error, 1)\n\n    go func() {\n        data, err := queryExternalAPI(id)\n        if err != nil {\n            errCh <- err\n            return\n        }\n        ch <- data\n    }()\n\n    select {\n    case <-ctx.Done():\n        return nil, ctx.Err()\n    case err := <-errCh:\n        return nil, err\n    case data := <-ch:\n        return data, nil\n    }\n}",
      "fiveWhys": [
        "Why did the microservice run out of memory? 142,000 goroutines were running simultaneously.",
        "Why were they running? They were blocked on channel send operations.",
        "Why were they blocked? The receiving function returned on context deadline, leaving the unbuffered channel with zero receivers."
      ],
      "preventionRules": [
        "Never spawn a goroutine without knowing exactly how and when it will exit.",
        "Use buffered channels of size 1 for single-result worker goroutines.",
        "Continuously monitor runtime.NumGoroutine() in Prometheus."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Timeout Goroutine Cleanup",
        "description": "Triggers 1,000 timed-out calls with 10ms deadline",
        "expectedOutcome": "runtime.NumGoroutine() returns to baseline within 2 seconds"
      },
      {
        "id": "t2",
        "name": "Successful Result Read",
        "description": "Executes fast query within deadline",
        "expectedOutcome": "Correct UserData returned without error"
      },
      {
        "id": "t3",
        "name": "Pprof Verification",
        "description": "Profiles goroutine states under load",
        "expectedOutcome": "Zero goroutines blocked in runtime.chansend()"
      }
    ],
    "suggestedPromptChips": [
      "Compare unbuffered vs buffered channels in Go",
      "How to use go tool pprof http://localhost:6060/debug/pprof/goroutine",
      "What are common Go concurrency anti-patterns?"
    ]
  },
  {
    "id": "lab-eng-211",
    "ticketId": "ENG-211",
    "title": "Exploit & Remediate Server-Side Request Forgery (SSRF) in Webhooks",
    "category": "Security & Auth",
    "type": "Security",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Security Vulnerability: Security audit found webhook avatar fetcher allows attackers to query AWS Metadata Service (169.254.169.254) and internal VPC microservices.",
    "scenario": "Our platform allows users to provide an avatar image URL or custom webhook endpoint. The backend fetches the URL server-side. A security researcher demonstrated that submitting http://169.254.169.254/latest/meta-data/iam/security-credentials/ returns IAM temporary role credentials, exposing full AWS cloud access.",
    "requirements": [
      "Reproduce SSRF against metadata service (169.254.169.254) and localhost (127.0.0.1, 0.0.0.0).",
      "Implement strict URL protocol validation (HTTP/HTTPS only).",
      "Resolve DNS hostname before request and validate that resolved IP does NOT belong to private/internal ranges (RFC 1918, loopback, link-local).",
      "Protect against DNS Rebinding attacks by pinning the validated IP address."
    ],
    "acceptanceCriteria": [
      "All requests to private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16) are rejected.",
      "DNS resolution occurs before socket connection and connection connects directly to validated IP.",
      "Valid public webhooks (e.g. https://api.slack.com) succeed normally."
    ],
    "techStack": [
      "Node.js",
      "Security",
      "SSRF",
      "DNS",
      "AWS IAM"
    ],
    "estDurationMinutes": 45,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T14:15:00.000Z [SECURITY AUDIT] SSRF payload detected: url=\"http://169.254.169.254/latest/meta-data/iam/security-credentials/ecs-task-role\"",
      "2026-09-25T14:15:00.050Z [WARN] Outbound HTTP request dispatched to 169.254.169.254:80 without IP filtering",
      "2026-09-25T14:15:00.120Z [CRITICAL] 200 OK received from metadata service! Credentials payload captured in avatar preview!"
    ],
    "codeFiles": [
      {
        "filename": "src/services/imageProxy.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// VULNERABLE: Directly fetches user-supplied URL without IP verification!\nexport async function fetchAvatarPreview(avatarUrl: string) {\n  // NAIVE CHECK: Attacker bypasses with decimal IP (2852039166) or DNS rebinding!\n  if (avatarUrl.includes('localhost') || avatarUrl.includes('127.0.0.1')) {\n    throw new Error('Forbidden')\n  }\n  const res = await fetch(avatarUrl)\n  return await res.arrayBuffer()\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Why String Matching Fails",
        "content": "Attackers can represent 127.0.0.1 as 2130706433 (integer), 0x7f.1 (hex), [::1] (IPv6), or register a domain like attacker.com that resolves to 169.254.169.254."
      },
      {
        "level": 2,
        "title": "DNS Resolution First",
        "content": "Resolve the hostname with dns.promises.lookup(). Parse the resulting IP and check if it falls within private CIDR ranges (RFC 1918, 169.254.0.0/16, etc.)."
      },
      {
        "level": 3,
        "title": "DNS Rebinding Prevention",
        "content": "To prevent Time-of-Check to Time-of-Use DNS rebinding, do not make the HTTP request to the hostname! Connect directly to the validated IP address, passing the original Host header."
      }
    ],
    "solution": {
      "explanation": "We validate the protocol (only http/https), resolve the hostname to its underlying IP, verify that the IP is not in any private/link-local/loopback range, and pin the connection directly to that validated IP.",
      "fixedCode": "import dns from 'node:dns/promises'\nimport ipaddr from 'ipaddr.js'\n\nexport async function fetchAvatarSafe(rawUrl: string) {\n  const parsed = new URL(rawUrl)\n  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {\n    throw new Error('Invalid protocol: only HTTP/HTTPS permitted')\n  }\n\n  // Resolve hostname\n  const { address } = await dns.lookup(parsed.hostname)\n  const addr = ipaddr.parse(address)\n  const range = addr.range()\n\n  // Block private, loopback, linkLocal (169.254), and carrier grade NAT\n  const forbiddenRanges = ['private', 'loopback', 'linkLocal', 'carrierGradeNat', 'uniqueLocal', 'broadcast']\n  if (forbiddenRanges.includes(range)) {\n    throw new Error(`Access to ${range} network address is forbidden`)\n  }\n\n  // Fetch directly from validated IP to prevent DNS rebinding\n  const safeUrl = new URL(rawUrl)\n  safeUrl.hostname = address\n\n  const res = await fetch(safeUrl.toString(), {\n    headers: { 'Host': parsed.hostname },\n    signal: AbortSignal.timeout(4000)\n  })\n  return await res.arrayBuffer()\n}",
      "fiveWhys": [
        "Why were AWS credentials leaked? An attacker submitted http://169.254.169.254 as avatar URL.",
        "Why did the server fetch it? The server executed fetch() with server-level IAM instance credentials.",
        "Why wasn't it blocked? The code only checked for string \"localhost\" and had no IP CIDR validation."
      ],
      "preventionRules": [
        "Never fetch untrusted URLs from server without resolving and validating IP CIDR blocks.",
        "Enable AWS IMDSv2 (Session token required) which blocks simple SSRF with hop limit = 1.",
        "Run webhook/image proxies in an isolated egress-only VPC without access to internal VPC microservices."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Metadata Service Block",
        "description": "Attempts to fetch http://169.254.169.254/latest/meta-data",
        "expectedOutcome": "Rejected with Forbidden network address error"
      },
      {
        "id": "t2",
        "name": "Localhost / Loopback Block",
        "description": "Attempts http://127.0.0.1:8080 and http://[::1]",
        "expectedOutcome": "Rejected with loopback address error"
      },
      {
        "id": "t3",
        "name": "Legitimate Webhook Success",
        "description": "Fetches valid public image from trusted CDN",
        "expectedOutcome": "200 OK with binary buffer returned"
      }
    ],
    "suggestedPromptChips": [
      "Explain how AWS IMDSv2 protects against SSRF",
      "What is DNS Rebinding and how does IP pinning mitigate it?",
      "How to configure egress proxies for safe webhook dispatching"
    ]
  },
  {
    "id": "lab-eng-212",
    "ticketId": "ENG-212",
    "title": "Mitigate JWT Replay Attack & Implement Token Revocation",
    "category": "Security & Auth",
    "type": "Security",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "P1 Security: Stolen user JWT remains valid for 7 days even after user changes password or clicks \"Log out of all devices\".",
    "scenario": "During a security audit, our JWT authentication was found to be strictly stateless with a 7-day expiration and no server-side revocation mechanism. If a user token is intercepted or leaked, there is no way to revoke it. Changing passwords or clicking \"Logout\" does nothing to invalidate active tokens.",
    "requirements": [
      "Refactor token strategy to use short-lived Access Tokens (15m) + Refresh Tokens (7d).",
      "Implement Refresh Token Rotation with automatic theft detection.",
      "Create a Redis token denylist / user token epoch to revoke active tokens immediately on password change.",
      "Verify that stolen access tokens expire within 15 minutes and refresh token reuse invalidates the entire token family."
    ],
    "acceptanceCriteria": [
      "Access tokens expire in 15 minutes.",
      "Password reset increments user token epoch, immediately invalidating all past tokens.",
      "Attempting to reuse an old refresh token revokes all refresh tokens in that family."
    ],
    "techStack": [
      "JWT",
      "Redis",
      "Node.js",
      "Auth Security",
      "TypeScript"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T14:30:00.000Z [INFO] User usr_812 reset password after account compromise alert",
      "2026-09-25T14:30:05.100Z [WARN] Stolen JWT from IP 203.0.113.88 successfully accessed /api/user/billing-info",
      "2026-09-25T14:30:05.105Z [ALERT] Stateless JWT verification passed: signature valid, exp is 5 days in future!"
    ],
    "codeFiles": [
      {
        "filename": "src/lib/jwtAuth.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Stateless 7-day token cannot be revoked!\nexport function issueToken(user: User) {\n  return jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' })\n}\n\nexport function verifyToken(token: string) {\n  // No check against revocation list or token epoch!\n  return jwt.verify(token, SECRET)\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Stateless vs Revocable",
        "content": "Purely stateless JWTs cannot be revoked without changing the master signing key (which logs out EVERY user). You must add a lightweight state check."
      },
      {
        "level": 2,
        "title": "User Token Epoch",
        "content": "Store token_epoch INT in the user table. Include epoch in the JWT: { sub: user.id, epoch: 2 }. When user resets password, increment epoch to 3. Any token with epoch < 3 is instantly rejected."
      },
      {
        "level": 3,
        "title": "Refresh Token Rotation",
        "content": "Each refresh generates a new refresh token and invalidates the previous one. If a consumed refresh token is sent again, it indicates theft; delete the entire token family!"
      }
    ],
    "solution": {
      "explanation": "We adopt a dual-token architecture: Short-lived Access Tokens (15m) carrying a tokenEpoch claim, and rotated Refresh Tokens stored in Redis. On password reset, we increment user.tokenEpoch, instantly revoking all access tokens across all devices.",
      "fixedCode": "export async function verifyAccessToken(token: string) {\n  const payload = jwt.verify(token, ACCESS_SECRET) as { sub: string, epoch: number }\n  // Quick Redis check or cached user epoch check\n  const currentEpoch = await redis.get(`user:${payload.sub}:epoch`)\n  if (currentEpoch && payload.epoch < parseInt(currentEpoch, 10)) {\n    throw new Error('Token has been revoked')\n  }\n  return payload\n}\n\nexport async function revokeAllUserSessions(userId: string) {\n  // Atomically increment token epoch in DB & Redis\n  await db.query('UPDATE users SET token_epoch = token_epoch + 1 WHERE id = $1', [userId])\n  await redis.incr(`user:${userId}:epoch`)\n  // Invalidate all active refresh token families in Redis\n  await redis.del(`user:${userId}:refresh_tokens`)\n}",
      "fiveWhys": [
        "Why was stolen token accepted after password reset? The token signature and exp date were valid.",
        "Why didn't the server know the password changed? The token verification was 100% stateless and never checked user state.",
        "Why was TTL set to 7 days? To avoid prompting users to re-login, without using refresh tokens."
      ],
      "preventionRules": [
        "Never issue access tokens with TTL > 15 minutes.",
        "Implement refresh token rotation with family revocation.",
        "Always provide a server-side kill switch (epoch or Redis denylist) for emergency account lockdown."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Epoch Revocation Check",
        "description": "Generates token with epoch 1, increments epoch to 2, and tests verification",
        "expectedOutcome": "Throws Token has been revoked"
      },
      {
        "id": "t2",
        "name": "Short-Lived Expiration",
        "description": "Checks exp timestamp on issued access token",
        "expectedOutcome": "Expires in exactly 15 minutes (900 seconds)"
      },
      {
        "id": "t3",
        "name": "Refresh Token Reuse Detection",
        "description": "Attempts to exchange an already-consumed refresh token",
        "expectedOutcome": "Entire token family revoked, status 401 Unauthorized"
      }
    ],
    "suggestedPromptChips": [
      "Explain Refresh Token Rotation and token reuse detection",
      "What are the trade-offs between pure stateless JWTs vs Redis token denylists?",
      "How to implement \"Log out of all devices\" with token epochs"
    ]
  },
  {
    "id": "lab-eng-214",
    "ticketId": "ENG-214",
    "title": "Debug Kubernetes CrashLoopBackOff & OOMKilled Pod Termination",
    "category": "DevOps & Cloud",
    "type": "Cloud",
    "difficulty": "Advanced",
    "severity": "P0 - Critical Outage",
    "impact": "P0 Deployment Outage: 8 out of 10 API pods trapped in CrashLoopBackOff after rolling update. Cluster capacity severely degraded.",
    "scenario": "Following a deployment of release v2.9, pods are crashing immediately after starting. kubectl get pods shows status CrashLoopBackOff with RESTARTS: 6. kubectl describe pod reveals Exit Code: 137 (OOMKilled). The container memory limit was set to 512Mi, but the JVM runtime was configured without container awareness, attempting to allocate 2GB of default heap.",
    "requirements": [
      "Inspect pod termination reason and exit codes using kubectl describe and kubectl logs.",
      "Explain Linux Exit Code 137 (SIGKILL 128 + 9 = 137 from kernel OOM killer).",
      "Configure container memory limits and JVM -XX:MaxRAMPercentage flags properly.",
      "Tune Kubernetes liveness and readiness probe initialDelaySeconds to prevent premature pod killing."
    ],
    "acceptanceCriteria": [
      "Pod status transitions from CrashLoopBackOff to Running (1/1 Ready).",
      "JVM heap automatically scales within container cgroup memory limits.",
      "Liveness and readiness probes pass without false-positive restarts."
    ],
    "techStack": [
      "Kubernetes",
      "Docker",
      "Linux",
      "JVM",
      "DevOps"
    ],
    "estDurationMinutes": 40,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T14:45:00.000Z pod/api-deployment-7f99b-4x1k2: Container api-container terminated with exitCode: 137 (OOMKilled)",
      "2026-09-25T14:45:01.000Z Last State: Terminated, Reason: OOMKilled, Message: The container exceeded memory limit of 536870912 bytes",
      "2026-09-25T14:45:05.000Z Liveness probe failed: Get \"http://10.244.2.14:8080/actuator/health\": dial tcp 10.244.2.14:8080: connect: connection refused",
      "2026-09-25T14:45:10.000Z Back-off 40s restarting failed container api-container in pod api-deployment-7f99b-4x1k2"
    ],
    "codeFiles": [
      {
        "filename": "k8s/deployment.yaml",
        "language": "yaml",
        "isBuggy": true,
        "code": "# BUGGY: Heap exceeds container limit and liveness probe fires before JVM boot!\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-deployment\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: api-container\n        image: company/api:v2.9\n        env:\n        - name: JAVA_OPTS\n          value: \"-Xmx2048m\" # DANGER: 2GB heap inside 512Mi container!\n        resources:\n          limits:\n            memory: \"512Mi\"\n            cpu: \"500m\"\n          requests:\n            memory: \"256Mi\"\n            cpu: \"250m\"\n        livenessProbe:\n          httpGet:\n            path: /health\n            port: 8080\n          initialDelaySeconds: 2 # Too short! JVM takes 12s to boot!"
      }
    ],
    "terminalSteps": [
      {
        "command": "kubectl get pods",
        "output": "NAME                                READY   STATUS             RESTARTS   AGE\napi-deployment-7f99b-4x1k2          0/1     CrashLoopBackOff   5          4m20s",
        "delay": 500
      },
      {
        "command": "kubectl describe pod api-deployment-7f99b-4x1k2",
        "output": "State:          Waiting\n  Reason:       CrashLoopBackOff\nLast State:     Terminated\n  Reason:       OOMKilled\n  Exit Code:    137\nLimits:\n  memory:       512Mi",
        "delay": 800
      },
      {
        "command": "kubectl apply -f k8s/deployment-fixed.yaml",
        "output": "deployment.apps/api-deployment configured",
        "delay": 600
      },
      {
        "command": "kubectl rollout status deployment/api-deployment",
        "output": "Waiting for deployment \"api-deployment\" rollout to finish: 1 of 3 updated replicas are available...\ndeployment \"api-deployment\" successfully rolled out",
        "delay": 1000
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Decoding Exit Code 137",
        "content": "Exit Code 137 means the process was terminated by signal 9 (SIGKILL). In Kubernetes, 128 + 9 = 137 almost always indicates the Linux kernel OOM Killer terminated the process for exceeding cgroup memory limits."
      },
      {
        "level": 2,
        "title": "JVM Container Flags",
        "content": "Never hardcode -Xmx inside Docker containers. Use -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 so the JVM allocates 75% of container RAM, leaving 25% for Metaspace, threads, and OS buffers."
      },
      {
        "level": 3,
        "title": "Probe Timing",
        "content": "If initialDelaySeconds is 2 seconds but your app takes 10 seconds to start, the liveness probe fails and restarts the pod before it ever finishes initializing."
      }
    ],
    "solution": {
      "explanation": "We align container memory limits (1Gi) with container-aware JVM flags (-XX:MaxRAMPercentage=75.0). We also increase initialDelaySeconds to 15s to allow Spring Boot to complete warmup before liveness probes commence.",
      "fixedCode": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-deployment\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: api-container\n        image: company/api:v2.9\n        env:\n        - name: JAVA_TOOL_OPTIONS\n          value: \"-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError\"\n        resources:\n          limits:\n            memory: \"1024Mi\"\n            cpu: \"1000m\"\n          requests:\n            memory: \"512Mi\"\n            cpu: \"500m\"\n        livenessProbe:\n          httpGet:\n            path: /health\n            port: 8080\n          initialDelaySeconds: 20\n          periodSeconds: 10\n        readinessProbe:\n          httpGet:\n            path: /health\n            port: 8080\n          initialDelaySeconds: 15\n          periodSeconds: 5",
      "fiveWhys": [
        "Why was the pod in CrashLoopBackOff? The container process was killed by the kernel with exit code 137.",
        "Why exit code 137? The process exceeded the 512Mi cgroup memory limit.",
        "Why did it exceed 512Mi? JAVA_OPTS was set to -Xmx2048m, causing the JVM to allocate 2GB into a 512MB container."
      ],
      "preventionRules": [
        "Never set JVM -Xmx higher than container memory limits.",
        "Always set -XX:MaxRAMPercentage=75.0 in modern containerized Java/Node/Go services.",
        "Use startupProbes for slow-starting applications instead of huge initialDelaySeconds."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Pod Status Ready Check",
        "description": "Checks kubectl get pods output after deployment update",
        "expectedOutcome": "All replicas in Running state with 1/1 Ready"
      },
      {
        "id": "t2",
        "name": "Memory Cgroup Compliance",
        "description": "Monitors container memory usage under load",
        "expectedOutcome": "RSS stays strictly below 750Mi (within 1024Mi limit)"
      },
      {
        "id": "t3",
        "name": "Probe Resilience",
        "description": "Simulates slow 12s container startup",
        "expectedOutcome": "No restart triggered by liveness probe during boot"
      }
    ],
    "suggestedPromptChips": [
      "Explain Linux exit codes (137 OOMKilled, 143 SIGTERM, 1 Error)",
      "What is the difference between livenessProbe, readinessProbe, and startupProbe?",
      "How to size Kubernetes resource requests vs limits for high-throughput APIs"
    ]
  },
  {
    "id": "lab-eng-215",
    "ticketId": "ENG-215",
    "title": "Optimize Bloated Production Docker Image from 1.9 GB to 48 MB",
    "category": "DevOps & Cloud",
    "type": "Docker",
    "difficulty": "Intermediate",
    "severity": "P2 - Moderate",
    "impact": "CI/CD pipeline takes 14 minutes to push and pull bloated 1.9GB image. Deployment rollouts slow; registry storage costs skyrocketing.",
    "scenario": "Our production Docker image for a Node.js/Go microservice is 1.9 GB. The Dockerfile installs full build tools (gcc, python, npm devDependencies, git, headers) and copies node_modules from the host without multi-stage builds. We need to shrink this image to under 50 MB while preserving full runtime functionality.",
    "requirements": [
      "Analyze image layer sizes using docker history.",
      "Implement multi-stage Docker build separating the builder from the runner.",
      "Use a minimal Alpine or Google Distroless base image for the final stage.",
      "Ensure non-root user execution for container security."
    ],
    "acceptanceCriteria": [
      "Final image size is under 50 MB (a 97% reduction).",
      "Build cache effectively reuses dependency layer when package.json is unchanged.",
      "Application starts and passes health check under unprivileged user."
    ],
    "techStack": [
      "Docker",
      "Multi-Stage Build",
      "DevOps",
      "Alpine Linux",
      "CI/CD"
    ],
    "estDurationMinutes": 30,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T15:00:01.000Z [DOCKER BUILD] Step 5/8 : COPY . .\n ---> 892.4MB",
      "2026-09-25T15:00:15.000Z [DOCKER BUILD] Successfully tagged app:latest (SIZE: 1.88 GB)",
      "2026-09-25T15:01:20.000Z [CI PUSH] Pushing layer 8812... 480MB / 1.88GB (Estimated remaining: 8m 20s)"
    ],
    "codeFiles": [
      {
        "filename": "Dockerfile",
        "language": "dockerfile",
        "isBuggy": true,
        "code": "# BLOATED: Single-stage build leaves compiler, git, and devDependencies in runtime image!\nFROM node:18\nWORKDIR /app\nRUN apt-get update && apt-get install -y build-essential python3 git\nCOPY . .\nRUN npm install\nRUN npm run build\nEXPOSE 3000\nCMD [\"node\", \"dist/index.js\"]"
      }
    ],
    "terminalSteps": [
      {
        "command": "docker images app:latest",
        "output": "REPOSITORY   TAG       IMAGE ID       CREATED         SIZE\napp          latest    a1b2c3d4e5f6   2 minutes ago   1.88GB",
        "delay": 500
      },
      {
        "command": "docker history app:latest",
        "output": "IMAGE          CREATED BY                                      SIZE\na1b2c3d4e5f6   CMD [\"node\" \"dist/index.js\"]                   0B\nb2c3d4e5f6a1   RUN npm install                                 680MB\nc3d4e5f6a1b2   RUN apt-get update && apt-get install...       540MB\nd4e5f6a1b2c3   FROM node:18                                    660MB",
        "delay": 600
      },
      {
        "command": "docker build -t app:optimized -f Dockerfile.optimized .",
        "output": "[+] Building 12.4s (14/14) FINISHED\n => [builder 1/5] FROM node:18-alpine\n => [runner 1/4] FROM node:18-alpine\n => exporting to image\n => naming to docker.io/library/app:optimized",
        "delay": 1200
      },
      {
        "command": "docker images app:optimized",
        "output": "REPOSITORY   TAG         IMAGE ID       CREATED         SIZE\napp          optimized   f6e5d4c3b2a1   10 seconds ago  46.8MB",
        "delay": 500
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Multi-Stage Build Pattern",
        "content": "Use two stages: Stage 1 (builder) has compilers, npm devDependencies, and typescript. Stage 2 (runner) only copies the compiled dist/ directory and production dependencies."
      },
      {
        "level": 2,
        "title": "Choosing Base Image",
        "content": "node:18 based on Debian is ~1GB. node:18-alpine is only ~40MB."
      },
      {
        "level": 3,
        "title": "Dockerignore",
        "content": "Create a .dockerignore file to exclude node_modules, .git, tests, and temporary files from the build context."
      }
    ],
    "solution": {
      "explanation": "We introduce a 2-stage build: a build stage using node:18-alpine to compile TypeScript and bundle assets, and a clean runner stage that only copies dist/ and production node_modules. Image shrinks from 1.88 GB to 46.8 MB.",
      "fixedCode": "# Stage 1: Build\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nRUN npm prune --production\n\n# Stage 2: Minimal Production Runner\nFROM node:18-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\n\n# Security: Run as non-root user\nUSER node\n\nCOPY --chown=node:node package*.json ./\nCOPY --chown=node:node --from=builder /app/node_modules ./node_modules\nCOPY --chown=node:node --from=builder /app/dist ./dist\n\nEXPOSE 3000\nCMD [\"node\", \"dist/index.js\"]",
      "fiveWhys": [
        "Why did deployment take 14 minutes? Pushing and pulling the 1.9GB image saturated CI bandwidth.",
        "Why was the image 1.9GB? It contained the full Debian OS, gcc, python, git, and devDependencies.",
        "Why were build tools in production? The Dockerfile was a single stage without separation of build vs run."
      ],
      "preventionRules": [
        "Always use multi-stage builds for compiled languages and TypeScript.",
        "Always maintain a strict .dockerignore file.",
        "Run Trivy or Snyk container scans in CI to block root containers and bloated bases."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Size Benchmark",
        "description": "Inspects image size of built container",
        "expectedOutcome": "Image size is <= 48 MB"
      },
      {
        "id": "t2",
        "name": "Security Non-Root Check",
        "description": "Checks container user ID with id -u",
        "expectedOutcome": "Runs as non-root user (UID 1000 node)"
      },
      {
        "id": "t3",
        "name": "App Startup Verification",
        "description": "Runs container and queries /healthz endpoint",
        "expectedOutcome": "200 OK returned in < 20ms"
      }
    ],
    "suggestedPromptChips": [
      "Compare Alpine vs Debian vs Distroless Docker bases",
      "How to optimize Docker layer caching with package.json",
      "What are container security best practices for production?"
    ]
  },
  {
    "id": "lab-eng-218",
    "ticketId": "ENG-218",
    "title": "Fix React Excessive Waterfall Re-rendering & Unvirtualized List Lag",
    "category": "Frontend & Web",
    "type": "Frontend",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "P1 Client Freeze: Transactions table renders 10,000 DOM nodes; browser tab freezes for 4.2 seconds during typing and filtering.",
    "scenario": "In the transactions dashboard, rendering 10,000 items creates 60,000 DOM elements. Every keystroke in the search box triggers an unmemoized re-render of every single row. Chrome DevTools Performance tab shows long task of 4,200ms and Frame Rate dropping to 2 FPS.",
    "requirements": [
      "Profile React component rendering using React DevTools Profiler.",
      "Implement Window Virtualization (windowing) so only the ~20 visible rows exist in the DOM.",
      "Memoize row components and search filter predicates using React.memo and useMemo.",
      "Achieve steady 60 FPS scrolling and instantaneous (< 16ms) filter input responsiveness."
    ],
    "acceptanceCriteria": [
      "DOM node count reduced from 60,000 to < 100.",
      "Input typing delay drops from 4,200ms to < 16ms.",
      "Smooth 60 FPS scrolling confirmed in Performance tab."
    ],
    "techStack": [
      "React",
      "TypeScript",
      "Virtualization",
      "Performance Profiling"
    ],
    "estDurationMinutes": 35,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T15:15:00.000Z [PERF] Long task took 4,280ms during user input onChange",
      "2026-09-25T15:15:00.010Z [DOM] Document node count: 62,410 elements in memory",
      "2026-09-25T15:15:01.000Z [REACT] Warning: Scheduled update took 3,890ms. Frame dropped."
    ],
    "codeFiles": [
      {
        "filename": "src/components/TransactionTable.tsx",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Renders all 10,000 items into DOM simultaneously without virtualization!\nexport function TransactionTable({ transactions }: { transactions: Transaction[] }) {\n  const [query, setQuery] = useState('')\n\n  // BUG: Recalculates on every render without useMemo\n  const filtered = transactions.filter(t => t.description.toLowerCase().includes(query.toLowerCase()))\n\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} />\n      {/* 60,000 DOM nodes created here! */}\n      <div className=\"table-body\">\n        {filtered.map(t => (\n          <div key={t.id} className=\"row\">\n            <span>{t.id}</span>\n            <span>{t.description}</span>\n            <span>${t.amount}</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  )\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "The Cost of DOM Nodes",
        "content": "Browsers are fast at computing JavaScript, but creating 60,000 DOM nodes forces massive style recalculations and layout reflows."
      },
      {
        "level": 2,
        "title": "Virtualization Principle",
        "content": "A user screen can only display ~20 rows at a time. Only render the items within the visible scroll viewport plus a small buffer."
      },
      {
        "level": 3,
        "title": "Windowing Implementation",
        "content": "Calculate startIndex = Math.floor(scrollTop / rowHeight) and endIndex = startIndex + visibleCount. Render only items from startIndex to endIndex with absolute positioning."
      }
    ],
    "solution": {
      "explanation": "We implement virtualized windowing: we calculate visible indices based on the container scroll offset and render only the 20 visible items. We also wrap the filter computation in useMemo and debounce the search input.",
      "fixedCode": "import { useState, useMemo, useRef } from 'react'\n\nconst ROW_HEIGHT = 44\nconst VIEWPORT_HEIGHT = 600\nconst VISIBLE_COUNT = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + 4 // with buffer\n\nexport function VirtualizedTable({ transactions }: { transactions: Transaction[] }) {\n  const [query, setQuery] = useState('')\n  const [scrollTop, setScrollTop] = useState(0)\n\n  const filtered = useMemo(() => {\n    if (!query) return transactions\n    const q = query.toLowerCase()\n    return transactions.filter(t => t.description.toLowerCase().includes(q))\n  }, [transactions, query])\n\n  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2)\n  const endIndex = Math.min(filtered.length, startIndex + VISIBLE_COUNT)\n  const visibleItems = filtered.slice(startIndex, endIndex)\n\n  return (\n    <div>\n      <input\n        placeholder=\"Search 10,000 transactions...\"\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n      />\n      <div\n        style={{ height: VIEWPORT_HEIGHT, overflowY: 'auto', position: 'relative' }}\n        onScroll={e => setScrollTop(e.currentTarget.scrollTop)}\n      >\n        {/* Total scroll height placeholder */}\n        <div style={{ height: filtered.length * ROW_HEIGHT, position: 'relative' }}>\n          {visibleItems.map((t, idx) => (\n            <div\n              key={t.id}\n              style={{\n                position: 'absolute',\n                top: (startIndex + idx) * ROW_HEIGHT,\n                height: ROW_HEIGHT,\n                left: 0,\n                right: 0\n              }}\n              className=\"row\"\n            >\n              <span>{t.id}</span>\n              <span>{t.description}</span>\n              <span>${t.amount}</span>\n            </div>\n          ))}\n        </div>\n      </div>\n    </div>\n  )\n}",
      "fiveWhys": [
        "Why did the tab freeze for 4.2 seconds? The browser performed massive layout reflows on 60,000 DOM elements.",
        "Why were there 60,000 elements? All 10,000 rows were inserted into the DOM at once.",
        "Why wasn't it virtualized? The component used standard Array.prototype.map() without viewport windowing."
      ],
      "preventionRules": [
        "Never render unpaginated or unvirtualized lists with > 100 items in the DOM.",
        "Use react-window or @tanstack/react-virtual for large datasets.",
        "Always wrap expensive filtering or sorting operations in useMemo."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Rendered DOM Node Count",
        "description": "Counts rendered DOM row nodes with 10,000 items loaded",
        "expectedOutcome": "Active DOM nodes in container <= 24"
      },
      {
        "id": "t2",
        "name": "Input Latency Benchmark",
        "description": "Types 20 characters into search input",
        "expectedOutcome": "P95 input latency < 16ms (60 FPS)"
      },
      {
        "id": "t3",
        "name": "Scroll Position Alignment",
        "description": "Scrolls to index 5,000 and validates top offset",
        "expectedOutcome": "Correct item rendered at top of viewport"
      }
    ],
    "suggestedPromptChips": [
      "Explain how window virtualization works under the hood",
      "Compare @tanstack/react-virtual vs react-window",
      "How to use React 19 useTransition / useDeferredValue for responsive search"
    ]
  },
  {
    "id": "lab-eng-219",
    "ticketId": "ENG-219",
    "title": "Eliminate Search Autocomplete Race Conditions & Stale State Overwrites",
    "category": "Frontend & Web",
    "type": "Frontend",
    "difficulty": "Intermediate",
    "severity": "P2 - Moderate",
    "impact": "Users typing fast get incorrect search results. When typing \"cat\" then \"dog\", the slower \"cat\" response arrives after \"dog\", displaying cat results for the word \"dog\".",
    "scenario": "In the search autocomplete bar, asynchronous network responses arrive out of order. Network latency for query \"c\" is 600ms, while latency for query \"cat\" is 80ms. The faster \"cat\" response arrives first and displays, but 520ms later the slow \"c\" response arrives and overwrites the state with obsolete data.",
    "requirements": [
      "Reproduce out-of-order asynchronous race conditions in React hooks.",
      "Implement request cancellation using AbortController inside useEffect cleanup.",
      "Add debouncing to prevent issuing network requests on every single keystroke.",
      "Ensure stale requests are properly aborted before newer requests complete."
    ],
    "acceptanceCriteria": [
      "Stale out-of-order API responses never overwrite newer search results.",
      "In-flight requests are immediately aborted when the search term changes.",
      "Debounce prevents spamming backend with intermediary single-character requests."
    ],
    "techStack": [
      "React",
      "Hooks",
      "AbortController",
      "Async/Await",
      "TypeScript"
    ],
    "estDurationMinutes": 30,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T15:30:00.000Z [HTTP] Dispatched search: q=\"c\" (Request #1)",
      "2026-09-25T15:30:00.150Z [HTTP] Dispatched search: q=\"cat\" (Request #2)",
      "2026-09-25T15:30:00.230Z [HTTP] Received 200 for q=\"cat\" (Rendered 3 results)",
      "2026-09-25T15:30:00.610Z [HTTP] Received 200 for q=\"c\" -> OVERWRITING UI with 45 stale results for \"c\"!"
    ],
    "codeFiles": [
      {
        "filename": "src/components/SearchAutocomplete.tsx",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: No AbortController, out-of-order responses overwrite state!\nexport function SearchAutocomplete() {\n  const [query, setQuery] = useState('')\n  const [results, setResults] = useState([])\n\n  useEffect(() => {\n    if (!query) return\n    // BUG: Slow previous requests arrive later and overwrite newer results!\n    fetch(`/api/search?q=${encodeURIComponent(query)}`)\n      .then(res => res.json())\n      .then(data => setResults(data))\n  }, [query])\n\n  return <input value={query} onChange={e => setQuery(e.target.value)} />\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "Asynchronous Arrival Order",
        "content": "HTTP is asynchronous. Request A sent at t=0 taking 500ms will finish AFTER Request B sent at t=100 taking 100ms. Whichever finishes last sets state."
      },
      {
        "level": 2,
        "title": "AbortController in useEffect Cleanup",
        "content": "useEffect cleanup function runs before every re-render and on unmount. Create const controller = new AbortController(). Pass signal to fetch. In cleanup: controller.abort()."
      },
      {
        "level": 3,
        "title": "Ignoring AbortError",
        "content": "When a fetch is aborted, it rejects with a DOMException named AbortError. Catch and ignore AbortError so it does not log as an application failure."
      }
    ],
    "solution": {
      "explanation": "We leverage AbortController inside the useEffect cleanup phase. When the query changes, any active in-flight request is immediately canceled at the browser network layer, ensuring only the most recent search query can update state.",
      "fixedCode": "import { useState, useEffect } from 'react'\n\nexport function SearchAutocomplete() {\n  const [query, setQuery] = useState('')\n  const [results, setResults] = useState([])\n  const [loading, setLoading] = useState(false)\n\n  useEffect(() => {\n    if (!query.trim()) {\n      setResults([])\n      return\n    }\n\n    const controller = new AbortController()\n    setLoading(true)\n\n    fetch(`/api/search?q=${encodeURIComponent(query)}`, {\n      signal: controller.signal\n    })\n      .then(res => res.json())\n      .then(data => {\n        setResults(data)\n        setLoading(false)\n      })\n      .catch(err => {\n        // Ignore benign abort exceptions\n        if (err.name !== 'AbortError') {\n          console.error('Search error:', err)\n          setLoading(false)\n        }\n      })\n\n    // Cleanup cancels in-flight request when query changes\n    return () => {\n      controller.abort()\n    }\n  }, [query])\n\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      {loading && <span>Loading...</span>}\n      <ul>\n        {results.map((r: any) => (\n          <li key={r.id}>{r.title}</li>\n        ))}\n      </ul>\n    </div>\n  )\n}",
      "fiveWhys": [
        "Why did the user see results for \"c\" when they typed \"cat\"? The response for \"c\" finished after the response for \"cat\".",
        "Why did it finish after? Network routing and server database query times vary per search query.",
        "Why wasn't the old request canceled? The fetch lacked an AbortController in useEffect cleanup."
      ],
      "preventionRules": [
        "Always cancel in-flight API requests in useEffect cleanup using AbortController.",
        "Debounce search inputs (e.g. 250ms) to reduce redundant server traffic.",
        "Use TanStack Query (React Query) which handles request cancellation and caching out of the box."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Abort Signal Dispatch",
        "description": "Types rapid sequence of letters",
        "expectedOutcome": "AbortController.abort() called on previous request before new fetch"
      },
      {
        "id": "t2",
        "name": "Stale Overwrite Protection",
        "description": "Simulates slow previous response resolving after fast response",
        "expectedOutcome": "Stale response ignored; UI reflects latest query results"
      },
      {
        "id": "t3",
        "name": "Unmount Cleanup",
        "description": "Unmounts component while request is in flight",
        "expectedOutcome": "Request aborted with zero memory leak or unmounted setState warnings"
      }
    ],
    "suggestedPromptChips": [
      "Explain how AbortController interacts with the Fetch API and Node.js",
      "Compare useEffect cleanup vs TanStack Query queryKey cancellation",
      "How to implement custom useDebounce hook with TypeScript"
    ]
  },
  {
    "id": "lab-eng-220",
    "ticketId": "ENG-220",
    "title": "Fix WebSocket Connection Leak & Duplicate Event Handler Storm",
    "category": "Frontend & Web",
    "type": "Frontend",
    "difficulty": "Intermediate",
    "severity": "P1 - High Priority",
    "impact": "P1 Client Resource Exhaustion: Navigating between dashboard tabs opens duplicate WebSocket connections. Users receive 4x duplicate notification toasts and browser memory leaks.",
    "scenario": "When users navigate between application views (e.g. Dashboard -> Roadmap -> Dashboard), the WebSocket connection was being re-created without terminating the existing connection. After 10 page navigations, 10 active WebSockets were connected to the server, resulting in 10 duplicate notification toasts and 10x network traffic.",
    "requirements": [
      "Identify missing cleanup in WebSocket hook / provider.",
      "Ensure ws.close() is called when the subscriber unmounts.",
      "Implement a Singleton WebSocket Connection Manager with reference counting.",
      "Handle automatic reconnection with exponential backoff on unexpected disconnects."
    ],
    "acceptanceCriteria": [
      "Only exactly 1 WebSocket connection exists regardless of how many times user navigates.",
      "No duplicate event listener executions or duplicated toast notifications.",
      "Clean close code 1000 sent to server upon browser tab close."
    ],
    "techStack": [
      "WebSocket",
      "React",
      "Hooks",
      "TypeScript",
      "State Management"
    ],
    "estDurationMinutes": 30,
    "status": "Open",
    "initialLogs": [
      "2026-09-25T15:45:01.000Z [WS Server] Client connected from session s_8812 (Total active: 1)",
      "2026-09-25T15:45:10.000Z [WS Server] Client connected from session s_8812 (Total active: 2 - DUPLICATE!)",
      "2026-09-25T15:45:25.000Z [WS Server] Client connected from session s_8812 (Total active: 5 - DUPLICATE!)",
      "2026-09-25T15:45:30.000Z [CLIENT] Received notification: Dispatched 5 identical toast notifications!"
    ],
    "codeFiles": [
      {
        "filename": "src/hooks/useRealtimeNotifications.ts",
        "language": "typescript",
        "isBuggy": true,
        "code": "// BUGGY: Opens new WebSocket on every mount without closing previous connection!\nexport function useRealtimeNotifications(onMessage: (msg: any) => void) {\n  useEffect(() => {\n    const ws = new WebSocket('wss://api.example.com/notifications')\n    ws.onmessage = (event) => {\n      onMessage(JSON.parse(event.data))\n    }\n    // MISSING: return () => ws.close()!\n  }, [onMessage])\n}"
      }
    ],
    "hints": [
      {
        "level": 1,
        "title": "The Lifecycle of WebSockets in React",
        "content": "React components mount and unmount as users navigate between pages. Any connection opened in useEffect MUST be closed in the cleanup return function."
      },
      {
        "level": 2,
        "title": "Stable Callback Dependency",
        "content": "If onMessage is not wrapped in useCallback, useEffect will re-run on every parent re-render, constantly disconnecting and reconnecting!"
      },
      {
        "level": 3,
        "title": "Singleton Connection Manager",
        "content": "Even better: manage a single global WebSocket connection in a React Context / Provider with subscribers, rather than opening a socket per component."
      }
    ],
    "solution": {
      "explanation": "We implement proper cleanup in useEffect so the socket closes when the component unmounts. Furthermore, we encapsulate connection management in a singleton pattern with reference counting to share a single connection across all components.",
      "fixedCode": "export function useRealtimeNotifications(onMessage: (msg: any) => void) {\n  const onMessageRef = useRef(onMessage)\n  onMessageRef.current = onMessage\n\n  useEffect(() => {\n    const ws = new WebSocket('wss://api.example.com/notifications')\n\n    ws.onmessage = (event) => {\n      try {\n        const data = JSON.parse(event.data)\n        onMessageRef.current(data)\n      } catch (err) {\n        console.error('Failed to parse WS message:', err)\n      }\n    }\n\n    // CRITICAL: Clean up and close socket on unmount\n    return () => {\n      ws.close(1000, 'Component unmounted')\n    }\n  }, []) // Empty dependency array with ref prevents reconnection loops\n}",
      "fiveWhys": [
        "Why were there 10 duplicate notification toasts? 10 WebSocket connections were listening to the same channel.",
        "Why were there 10 connections? Navigating between routes mounted the component 10 times.",
        "Why didn't the old connections close? The useEffect hook lacked a cleanup return function calling ws.close()."
      ],
      "preventionRules": [
        "Always return a cleanup function closing sockets and event listeners in useEffect.",
        "Use useRef for callbacks inside socket listeners to avoid re-triggering connection setup.",
        "Manage real-time connections centrally via Context rather than ad-hoc in leaf components."
      ]
    },
    "verificationTests": [
      {
        "id": "t1",
        "name": "Connection Count Stability",
        "description": "Simulates 20 consecutive route navigations",
        "expectedOutcome": "Active WebSocket connection count === exactly 1"
      },
      {
        "id": "t2",
        "name": "Single Event Dispatch",
        "description": "Broadcasts 1 test notification",
        "expectedOutcome": "Callback executed exactly 1 time (no duplicate toasts)"
      },
      {
        "id": "t3",
        "name": "Clean Close Code",
        "description": "Unmounts component and inspects close frame",
        "expectedOutcome": "Close code 1000 (Normal Closure) sent to server"
      }
    ],
    "suggestedPromptChips": [
      "How to implement resilient WebSocket reconnection with exponential backoff",
      "Explain WebSocket close codes (1000 Normal, 1006 Abnormal, 1008 Policy)",
      "Compare WebSockets vs Server-Sent Events (SSE) for modern web applications"
    ]
  }
]
