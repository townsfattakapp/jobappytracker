import { defineTrack } from '../define'

export const restApi = defineTrack({
  id: 'track-rest-api',
  title: 'REST API Engineering',
  description: 'Designing, securing, documenting and operating HTTP APIs in any language: HTTP semantics, caching and conditional requests, resource modelling and URL design, versioning, pagination, RFC 9457 errors, idempotency keys, rate limiting, API keys, OAuth 2.0 and JWT, OpenAPI, contract and load testing, OWASP API Top 10, webhooks and governance.',
  family: 'Backend Frameworks',
  kind: 'domain',
  icon: '🔗',
  tags: ['rest', 'http', 'api-design', 'openapi', 'oauth2', 'jwt', 'webhooks', 'api-security'],
  languages: [],
  explainMode: 'concept',
  supports: { design: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'HTTP Semantics',
      description: 'The protocol rules that make an API predictable to every client, proxy and cache in between.',
      topics: [
        {
          title: 'HTTP methods, safety and idempotency',
          description: 'GET, HEAD, POST, PUT, PATCH, DELETE and OPTIONS as defined in RFC 9110, which are safe (no side effects) and which are idempotent (repeatable), and why proxies and retry logic rely on those promises being kept.',
          concepts: ['Safe methods and their guarantees', 'Idempotent methods and retries', 'POST versus PUT semantics', 'HEAD and OPTIONS uses', 'Method override anti-patterns'],
          quiz: [
            ['Is DELETE idempotent?', 'Yes; deleting twice leaves the same state even if the second call returns 404.'],
            ['Why must GET never change server state?', 'Crawlers, prefetchers and caches issue GETs freely, assuming they are safe.'],
          ],
        },
        {
          title: 'Status codes that matter',
          description: 'The 2xx, 3xx, 4xx and 5xx classes and the specific codes a well-behaved API uses: 200, 201 with Location, 202, 204, 304, 400, 401, 403, 404, 409, 412, 422, 429, 500 and 503; picking the precise code is part of the contract.',
          concepts: ['Status classes and client behaviour', '201 Created with Location', '202 Accepted for async work', '401 versus 403 versus 404', '409, 412 and 422 distinctions', '429 and 503 with Retry-After'],
          quiz: [
            ['Which code says the request was valid but the current state forbids it?', '409 Conflict.'],
            ['What should a successful DELETE with no body return?', '204 No Content.'],
          ],
          prereqs: ['HTTP methods, safety and idempotency'],
        },
        {
          title: 'Headers and content negotiation',
          description: 'Content-Type declares what is sent, Accept declares what is wanted, and the server chooses a representation or returns 406 or 415; plus Content-Language, Vary, and custom headers that should stay rare.',
          concepts: ['Content-Type and charset', 'Accept and 406 Not Acceptable', '415 Unsupported Media Type', 'Vary and its effect on caches', 'Custom header naming'],
          quiz: [
            ['What does a client send to ask for JSON?', 'Accept: application/json.'],
            ['Why send Vary: Accept?', 'So caches store separate responses per requested representation.'],
          ],
          prereqs: ['HTTP methods, safety and idempotency'],
        },
        {
          title: 'HTTP caching with Cache-Control and ETag',
          description: 'Freshness (max-age, s-maxage, no-cache versus no-store, private versus public) and validation (ETag, Last-Modified) so browsers, CDNs and gateways can serve or revalidate without hitting the origin.',
          concepts: ['Cache-Control directives', 'no-cache versus no-store', 'Strong and weak ETags', 'Last-Modified and heuristics', 'stale-while-revalidate'],
          quiz: [
            ['What does Cache-Control: no-cache actually allow?', 'Storing the response, but revalidating with the origin before reuse.'],
            ['What distinguishes a weak ETag?', 'A W/ prefix meaning semantically equivalent, not byte-identical.'],
          ],
          prereqs: ['Headers and content negotiation'],
        },
        {
          title: 'Conditional requests and optimistic concurrency',
          description: 'If-None-Match for cheap 304 responses and If-Match for updates that fail with 412 when someone else changed the resource first, giving lost-update protection without server-side locks.',
          concepts: ['If-None-Match and 304', 'If-Match and 412 Precondition Failed', 'If-Modified-Since', 'Lost update problem', '428 Precondition Required'],
          quiz: [
            ['How does a client avoid overwriting a concurrent edit?', 'Send If-Match with the ETag it read; the server returns 412 if it no longer matches.'],
            ['What does 304 Not Modified contain?', 'No body; the client reuses its cached copy.'],
          ],
          prereqs: ['HTTP caching with Cache-Control and ETag'],
        },
        {
          title: 'HTTP/1.1, HTTP/2 and HTTP/3 for API developers',
          description: 'Head-of-line blocking in HTTP/1.1, multiplexing and header compression in HTTP/2, QUIC in HTTP/3, and what changes for API design (fewer reasons to batch, connection reuse) versus what stays the same. Networking depth lives in track-networking.',
          concepts: ['Connection reuse and head-of-line blocking', 'HTTP/2 multiplexing and HPACK', 'HTTP/3 over QUIC', 'TLS termination and ALPN', 'Impact on batching decisions'],
          quiz: [
            ['Why does HTTP/2 reduce the need for request batching?', 'Many requests share one connection concurrently without head-of-line blocking.'],
            ['Does HTTP/2 change the semantics of methods and status codes?', 'No, only the transport framing.'],
          ],
        },
      ],
    },
    {
      title: 'Resource Modelling and URL Design',
      style: 'design',
      topics: [
        {
          title: 'Resources, collections and identifiers',
          description: 'Modelling nouns rather than verbs, collection versus item resources, choosing identifiers (sequential ids, UUIDs, slugs, ULIDs) and why exposing sequential ids leaks information and invites enumeration.',
          concepts: ['Nouns not verbs', 'Collection and item resources', 'UUID, ULID and slug identifiers', 'Enumeration risks of sequential ids', 'Singleton resources'],
          quiz: [
            ['Why prefer /orders/{id} over /getOrder?', 'The method carries the verb; the URL names the resource.'],
            ['What is a benefit of ULIDs over UUIDv4?', 'They sort by creation time, which helps indexing and cursors.'],
          ],
        },
        {
          title: 'URL naming conventions',
          description: 'Plural nouns, lowercase with hyphens, no trailing slashes or file extensions, query strings for filtering not identification, and consistency enforced by a style guide.',
          concepts: ['Plural nouns and casing', 'Hyphens and lowercase paths', 'Path versus query parameter roles', 'No verbs or extensions in paths', 'Consistency across teams'],
          quiz: [
            ['Path or query: a filter by status?', 'Query, because it narrows a collection rather than identifying a resource.'],
            ['Which is preferred: /userProfiles or /user-profiles?', '/user-profiles, lowercase with hyphens.'],
          ],
          prereqs: ['Resources, collections and identifiers'],
        },
        {
          title: 'Relationships and sub-resources',
          description: 'When to nest (/customers/{id}/orders) versus link (/orders?customer=id), depth limits, embedding related data versus separate calls, and representing many-to-many links as resources.',
          concepts: ['Nesting versus top-level with filters', 'Nesting depth limits', 'Embedding and expansion parameters', 'Link relations as resources'],
          quiz: [
            ['When is nesting a bad idea?', 'When the child has an identity independent of the parent or nesting exceeds two levels.'],
            ['How do you let clients choose embedded relations?', 'An expand or include query parameter with an allow-list.'],
          ],
          prereqs: ['URL naming conventions'],
        },
        {
          title: 'Actions that are not CRUD',
          description: 'Modelling "cancel an order" or "send an invoice" as state transitions (PATCH status), sub-resources (POST /orders/{id}/cancellations) or controller endpoints, and picking the option that keeps semantics honest.',
          concepts: ['State transitions via PATCH', 'Action resources with POST', 'Controller endpoints as a last resort', 'Representing workflow state'],
          quiz: [
            ['How might you model "cancel order" restfully?', 'POST /orders/{id}/cancellations or PATCH status to cancelled.'],
            ['Why is POST /orders/{id}/cancel acceptable sometimes?', 'When the action is not naturally a resource and the trade-off is documented.'],
          ],
          prereqs: ['Relationships and sub-resources'],
        },
        {
          title: 'Hypermedia and the Richardson maturity model',
          description: 'Levels from tunnelling everything through POST to full hypermedia with links that tell clients what they can do next; where HAL, JSON:API and plain links fit, and how much HATEOAS is worth in practice.',
          concepts: ['Richardson maturity levels', 'Links and relations in responses', 'HAL and JSON:API formats', 'Pragmatic hypermedia'],
          quiz: [
            ['What defines maturity level 3?', 'Responses include hypermedia controls (links) that drive client behaviour.'],
            ['What is a practical benefit of including links?', 'Clients follow URLs instead of constructing them, so paths can change.'],
          ],
          prereqs: ['Resources, collections and identifiers'],
        },
      ],
    },
    {
      title: 'Requests and Responses',
      topics: [
        {
          title: 'Request and response body design',
          description: 'Consistent JSON conventions: camelCase or snake_case chosen once, envelopes only where needed, ISO 8601 timestamps with time zones, money as strings or minor units, nulls versus absent fields, and enums as strings.',
          concepts: ['Field naming convention', 'Envelopes versus bare objects', 'Dates, times and time zones', 'Money and precision', 'Null versus absent semantics', 'Enums as strings'],
          quiz: [
            ['Why send money as an integer of minor units or a string?', 'JSON numbers are floats in many parsers, so 0.1 + 0.2 style errors appear.'],
            ['What timestamp format should an API use?', 'ISO 8601 / RFC 3339 with an explicit offset, ideally UTC.'],
          ],
        },
        {
          title: 'Pagination: offset and cursor',
          description: 'Offset pagination is simple but slow and unstable on large or changing data; cursor (keyset) pagination encodes the last seen key, stays consistent under inserts and is index-friendly; both need clear metadata and links.',
          concepts: ['Offset and limit parameters', 'Keyset cursors and opaque tokens', 'Stability under concurrent writes', 'Page metadata and next links', 'Total counts and their cost'],
          quiz: [
            ['Why does offset pagination get slower on later pages?', 'The database scans and discards offset rows every time.'],
            ['Why make cursors opaque?', 'So clients cannot construct or tamper with them and the format can change.'],
          ],
          prereqs: ['Request and response body design'],
        },
        {
          title: 'Filtering, sorting and field selection',
          description: 'Query parameter grammars for equality, ranges and lists, multi-field sort with direction, sparse fieldsets to shrink payloads, and validating every parameter against an allow-list.',
          concepts: ['Filter parameter grammars', 'Range and list filters', 'Sort parameters and defaults', 'Sparse fieldsets', 'Allow-listing parameters'],
          quiz: [
            ['Why allow-list sortable fields?', 'Unindexed or sensitive columns would otherwise be exposed and slow.'],
            ['Give one common syntax for a range filter.', 'created_after=2024-01-01 or created[gte]=2024-01-01.'],
          ],
          prereqs: ['Pagination: offset and cursor'],
        },
        {
          title: 'Error responses with RFC 9457 problem details',
          description: 'One error shape for the whole API: application/problem+json with type, title, status, detail and instance, extension members such as errors[] for validation, and stable machine-readable codes.',
          concepts: ['Problem details members', 'type URIs and documentation', 'Validation errors as extensions', 'Stable error codes', 'Not leaking internals'],
          quiz: [
            ['Which media type does problem details use?', 'application/problem+json.'],
            ['What is the role of the type member?', 'A URI identifying the error category, ideally resolving to documentation.'],
          ],
          prereqs: ['Request and response body design'],
        },
        {
          title: 'Validation, 400 and 422',
          description: 'Syntactic failures (malformed JSON, wrong types) as 400, semantic failures (valid shape, invalid business rule) as 422, per-field error lists, and validating at the boundary before any side effect.',
          concepts: ['Syntactic versus semantic validation', '400 versus 422 choice', 'Per-field error lists', 'Validate before side effects', 'Unknown fields policy'],
          quiz: [
            ['A well-formed request with an end date before its start date: which status?', '422 Unprocessable Content (or 400 if the API standardises on it).'],
            ['Why return all field errors at once?', 'Clients fix everything in one round trip.'],
          ],
          prereqs: ['Error responses with RFC 9457 problem details'],
        },
        {
          title: 'Partial updates: PUT, PATCH and JSON Merge Patch',
          description: 'PUT replaces the whole representation, PATCH applies a change; JSON Merge Patch (RFC 7386) uses null to delete and cannot express array edits, JSON Patch (RFC 6902) lists operations and supports tests.',
          concepts: ['PUT as full replacement', 'JSON Merge Patch semantics', 'JSON Patch operations', 'Arrays and nulls in patches', 'Choosing a patch format'],
          quiz: [
            ['How does JSON Merge Patch remove a field?', 'By setting it to null.'],
            ['Which media type identifies JSON Patch?', 'application/json-patch+json.'],
          ],
          prereqs: ['Validation, 400 and 422'],
        },
      ],
    },
    {
      title: 'Reliability Patterns',
      topics: [
        {
          title: 'Idempotency keys',
          description: 'Letting clients retry POSTs safely: a unique Idempotency-Key header, storing the first response keyed by it, replaying it on retries, detecting key reuse with different payloads, and expiring keys.',
          concepts: ['Idempotency-Key header', 'Storing and replaying responses', 'Key reuse with different bodies', 'Concurrent duplicate requests', 'Key expiry'],
          quiz: [
            ['What should the server return if the same key arrives with a different body?', '422 or 409 indicating idempotency key reuse.'],
            ['Where must the idempotency record be written?', 'Atomically with the side effect, or before it with a lock, so a crash cannot double-charge.'],
          ],
        },
        {
          title: 'Rate limiting and quotas',
          description: 'Token bucket versus sliding window, limits per key, user or IP, communicating limits with RateLimit headers and 429 plus Retry-After, and quotas that cap monthly usage separately from burst protection.',
          concepts: ['Token bucket and sliding window', 'Limit dimensions: key, user, IP', 'RateLimit-* headers', '429 with Retry-After', 'Quotas versus rate limits'],
          quiz: [
            ['What does Retry-After tell the client?', 'How many seconds (or a date) to wait before retrying.'],
            ['Why limit per API key rather than per IP for authenticated APIs?', 'Many users share IPs (NAT), and one key can use many IPs.'],
          ],
        },
        {
          title: 'Timeouts, retries and backoff',
          description: 'Client and server timeouts that add up along a call chain, exponential backoff with jitter, retrying only idempotent or key-protected requests, and circuit breakers to stop hammering a failing dependency.',
          concepts: ['Timeout budgets per hop', 'Exponential backoff with jitter', 'Which requests are safe to retry', 'Circuit breakers', 'Retry storms'],
          quiz: [
            ['Why add jitter to backoff?', 'To spread retries so clients do not synchronise into thundering herds.'],
            ['Is retrying a POST safe?', 'Only with an idempotency key or if the operation is naturally idempotent.'],
          ],
          prereqs: ['Idempotency keys'],
        },
        {
          title: 'Bulk operations and long-running jobs',
          description: 'Batch endpoints with per-item results (207-style or an array of outcomes), async jobs that return 202 with a status resource to poll, and callbacks or webhooks when polling is wasteful.',
          concepts: ['Batch request design', 'Per-item results and partial success', '202 Accepted and status resources', 'Polling versus callbacks', 'Job cancellation'],
          quiz: [
            ['What should a batch endpoint return when 3 of 10 items fail?', 'A 200 with per-item statuses, not a single failure that hides the successes.'],
            ['How does a client learn a 202 job finished?', 'By polling the status URL in the Location header or receiving a webhook.'],
          ],
          prereqs: ['Idempotency keys'],
        },
      ],
    },
    {
      title: 'Versioning and Evolution',
      topics: [
        {
          title: 'Versioning strategies',
          description: 'URL versions (/v1), header versions (Accept or a custom header), date-based versions like Stripe, and no versioning with strict compatibility; their trade-offs for caching, routing and client simplicity.',
          concepts: ['URL path versioning', 'Header and media-type versioning', 'Date-based versions', 'Versioning per resource versus whole API', 'Caching implications'],
          quiz: [
            ['Why is URL versioning the most common?', 'It is visible, cacheable and trivial to route.'],
            ['What is a downside of header versioning?', 'Harder to explore in a browser and easy to forget; caches need Vary.'],
          ],
        },
        {
          title: 'Backwards-compatible change rules',
          description: 'What clients tolerate (new optional fields, new endpoints, new enum values only if documented) and what breaks them (renaming, removing, changing types, tightening validation), and tolerant reader expectations.',
          concepts: ['Additive changes are safe', 'Breaking change checklist', 'Tolerant reader principle', 'Enum growth and unknown values', 'Compatibility tests in CI'],
          quiz: [
            ['Is adding a required request field backwards compatible?', 'No; existing clients will start failing validation.'],
            ['Is adding a new response field compatible?', 'Yes, if clients ignore unknown fields.'],
          ],
          prereqs: ['Versioning strategies'],
        },
        {
          title: 'Deprecation and sunset',
          description: 'Announcing removal with Deprecation and Sunset headers, migration guides, usage analytics to find remaining callers, brownouts to flush stragglers, and finally returning 410 Gone.',
          concepts: ['Deprecation and Sunset headers', 'Migration guides and timelines', 'Measuring remaining usage', 'Brownouts', '410 Gone'],
          quiz: [
            ['What does the Sunset header carry?', 'The date after which the endpoint will stop working.'],
            ['What is a brownout?', 'Temporarily disabling a deprecated endpoint to surface clients that still use it.'],
          ],
          prereqs: ['Backwards-compatible change rules'],
        },
      ],
    },
    {
      title: 'Authentication and Authorization',
      description: 'The mechanisms APIs use to identify callers and decide what they may do. Identity systems in depth live in track-iam.',
      topics: [
        {
          title: 'API keys',
          description: 'Simple bearer secrets for machine clients: generation and storage as hashes, transmission in a header rather than the query string, scoping and rotation, and why they identify an application rather than a user.',
          concepts: ['Generating and hashing keys', 'Header transmission not query strings', 'Key scopes and rotation', 'Application versus user identity', 'Leak detection'],
          quiz: [
            ['Why not put API keys in the query string?', 'They end up in logs, browser history and referrers.'],
            ['How should keys be stored server-side?', 'Hashed, like passwords, with a prefix for lookup.'],
          ],
        },
        {
          title: 'OAuth 2.0 flows',
          description: 'Authorization code with PKCE for user-facing apps, client credentials for service-to-service, refresh tokens, scopes, and why implicit and password grants are deprecated.',
          concepts: ['Roles: resource owner, client, servers', 'Authorization code with PKCE', 'Client credentials grant', 'Refresh tokens and rotation', 'Deprecated grants'],
          quiz: [
            ['Which grant should a mobile app use?', 'Authorization code with PKCE.'],
            ['What does PKCE protect against?', 'Authorization code interception, since the token exchange needs the code verifier.'],
          ],
          prereqs: ['API keys'],
        },
        {
          title: 'JWT access tokens and validation',
          description: 'Structure and signing, validating signature, expiry, issuer and audience, JWKS for key discovery and rotation, short lifetimes plus refresh, and opaque tokens with introspection as the alternative.',
          concepts: ['Header, payload and signature', 'Validating exp, iss and aud', 'JWKS and key rotation', 'Opaque tokens and introspection', 'Revocation limits'],
          quiz: [
            ['Why check the aud claim?', 'So a token issued for another API cannot be replayed against yours.'],
            ['What is the main weakness of stateless JWTs?', 'They cannot be revoked before expiry without extra state.'],
          ],
          prereqs: ['OAuth 2.0 flows'],
        },
        {
          title: 'Scopes, roles and resource permissions',
          description: 'Scopes limit what a token may do, roles describe who a user is, and object-level checks decide whether this caller may touch this record; missing the last step is the top API vulnerability.',
          concepts: ['Scope design and granularity', 'Roles versus scopes', 'Object-level authorization', 'Property-level authorization', 'Centralising checks'],
          quiz: [
            ['Does a valid token with orders:read scope allow reading any order?', 'No; the server must still check the caller owns or may see that order.'],
            ['What do scopes describe?', 'What the client is permitted to do on behalf of the user.'],
          ],
          prereqs: ['JWT access tokens and validation'],
        },
        {
          title: 'CORS and browser clients',
          description: 'Why browsers block cross-origin reads, preflight OPTIONS requests, Access-Control-Allow-Origin with credentials, and what CORS does not protect against.',
          concepts: ['Same-origin policy and CORS', 'Simple versus preflighted requests', 'Allow-Origin with credentials', 'Max-Age for preflight caching', 'CORS is not authentication'],
          quiz: [
            ['Can you use Access-Control-Allow-Origin: * with credentials?', 'No; a specific origin is required when credentials are allowed.'],
            ['Which requests trigger a preflight?', 'Non-simple ones, such as JSON bodies with custom headers or PUT/DELETE.'],
          ],
        },
      ],
    },
    {
      title: 'OpenAPI and Documentation',
      topics: [
        {
          title: 'OpenAPI document structure',
          description: 'The OpenAPI 3.1 document: info, servers, paths with operations, parameters, requestBody, responses and security; writing one by hand well enough to review generated ones.',
          concepts: ['info, servers and paths', 'Operations and operationId', 'Parameters and requestBody', 'Responses per status code', 'Security schemes and requirements'],
          quiz: [
            ['What is operationId used for?', 'Stable method names in generated clients and links in documentation.'],
            ['What changed in OpenAPI 3.1 for schemas?', 'Full JSON Schema 2020-12 alignment.'],
          ],
        },
        {
          title: 'Schemas, components and reuse',
          description: 'Defining reusable schemas, parameters, responses and examples under components, $ref, composition with allOf and oneOf plus discriminators, and readOnly/writeOnly for asymmetric fields.',
          concepts: ['components and $ref', 'allOf, oneOf and discriminator', 'readOnly and writeOnly', 'Examples per schema and operation', 'Nullable and required semantics'],
          quiz: [
            ['How do you mark a field that appears in responses but not requests?', 'readOnly: true.'],
            ['What does a discriminator add to oneOf?', 'A property naming which variant applies, for faster and clearer parsing.'],
          ],
          prereqs: ['OpenAPI document structure'],
        },
        {
          title: 'Design-first, code-first and linting',
          description: 'Writing the spec before code and generating stubs versus generating the spec from annotations, keeping either in sync in CI, and enforcing style rules with Spectral.',
          concepts: ['Design-first workflow', 'Code-first generation', 'Spec drift detection in CI', 'Spectral rulesets', 'Reviewing API changes as diffs'],
          quiz: [
            ['What does Spectral do?', 'Lints OpenAPI documents against custom and built-in rules.'],
            ['How do you prevent spec drift in code-first setups?', 'Generate the spec in CI and fail if it differs from the committed one.'],
          ],
          prereqs: ['Schemas, components and reuse'],
        },
        {
          title: 'Client generation and documentation portals',
          description: 'Generating SDKs with openapi-generator or vendor tools, publishing docs with Redoc, Swagger UI or Stoplight, curl examples for every operation, and changelogs developers can subscribe to.',
          concepts: ['SDK generation tools', 'Redoc and Swagger UI', 'Examples and try-it consoles', 'Changelogs and release notes', 'Docs as part of the definition of done'],
          quiz: [
            ['Why include curl examples?', 'Developers can reproduce a call without an SDK or tooling.'],
            ['What input does an SDK generator need?', 'A valid OpenAPI document with operationIds and schemas.'],
          ],
          prereqs: ['OpenAPI document structure'],
        },
      ],
    },
    {
      title: 'Testing APIs',
      topics: [
        {
          title: 'The API test pyramid',
          description: 'Unit tests for handlers and validators, integration tests against a real database, end-to-end tests through the deployed API, and what each level is best at catching.',
          concepts: ['Unit tests for handlers', 'Integration tests with real dependencies', 'End-to-end smoke tests', 'Test data management', 'Choosing the level per risk'],
          quiz: [
            ['Which level catches a wrong SQL query?', 'Integration tests with a real database.'],
            ['Why keep end-to-end tests few?', 'They are slow, flaky and hard to diagnose.'],
          ],
        },
        {
          title: 'Contract testing with Pact',
          description: 'Consumers record the requests and responses they rely on, providers verify them in CI, and a broker tracks which versions are compatible so deployments cannot break a client.',
          concepts: ['Consumer-driven contracts', 'Pact files and matchers', 'Provider verification', 'Pact Broker and can-i-deploy', 'Contract versus schema tests'],
          quiz: [
            ['Who writes a Pact contract?', 'The consumer, describing the interactions it needs.'],
            ['What does can-i-deploy check?', 'Whether the version being deployed is verified against every consumer or provider it talks to.'],
          ],
          prereqs: ['The API test pyramid'],
        },
        {
          title: 'Schema validation against OpenAPI',
          description: 'Validating real responses against the spec in tests and in a middleware, fuzzing with Schemathesis, and treating a mismatch as a failing build.',
          concepts: ['Response validation middleware', 'Schemathesis property tests', 'Request validation from the spec', 'Handling examples as tests'],
          quiz: [
            ['What does Schemathesis do?', 'Generates requests from an OpenAPI spec to find crashes and spec violations.'],
            ['Why validate responses in CI rather than only requests?', 'To guarantee the documented contract is what the server actually returns.'],
          ],
          prereqs: ['Contract testing with Pact'],
        },
        {
          title: 'Load testing with k6',
          description: 'Scripting user journeys, ramping virtual users, thresholds on p95 latency and error rate, running against a staging environment, and reading results to find the first bottleneck.',
          concepts: ['k6 scripts and scenarios', 'Ramping and steady state', 'Thresholds and checks', 'Interpreting p95 and error rate', 'Load versus stress versus soak'],
          quiz: [
            ['What is a threshold in k6?', 'A pass/fail rule such as p(95)<300ms that fails the run.'],
            ['Why test with realistic data volumes?', 'Empty tables hide the queries that fall over at scale.'],
          ],
          prereqs: ['The API test pyramid'],
        },
      ],
    },
    {
      title: 'Performance and Security',
      description: 'Generic web security in depth lives in track-web-security; this is the API-specific view.',
      topics: [
        {
          title: 'Caching layers: CDN, gateway and application',
          description: 'Where a response can be cached (browser, CDN, API gateway, application cache), which headers each honours, cache keys and Vary, and invalidation strategies from TTLs to purge APIs.',
          concepts: ['Cache placement options', 'Cache keys and Vary', 'TTL versus explicit purge', 'Private data and public caches', 'Caching authenticated responses'],
          quiz: [
            ['Which directive stops a CDN caching a per-user response?', 'Cache-Control: private.'],
            ['What does s-maxage control?', 'Freshness for shared caches, overriding max-age for them.'],
          ],
        },
        {
          title: 'Payload size and compression',
          description: 'gzip and brotli negotiated via Accept-Encoding, sparse fieldsets and pagination to shrink bodies, avoiding over-fetching, and when the compression CPU cost is not worth it.',
          concepts: ['Accept-Encoding negotiation', 'gzip versus brotli', 'Trimming payloads', 'Compression thresholds', 'BREACH-style risks'],
          quiz: [
            ['How does a client request compressed responses?', 'Accept-Encoding: gzip, br.'],
            ['Why skip compression for tiny bodies?', 'The CPU cost exceeds the byte savings.'],
          ],
          prereqs: ['Caching layers: CDN, gateway and application'],
        },
        {
          title: 'Connection reuse and latency budgets',
          description: 'Keep-alive and connection pooling on clients, DNS and TLS handshake costs, tail latency, and setting latency budgets per endpoint that drive design decisions.',
          concepts: ['Keep-alive and pooling', 'Handshake costs', 'Tail latency and p99', 'Latency budgets per endpoint', 'Measuring from the client side'],
          quiz: [
            ['Why is the first request to a host slower?', 'DNS lookup and TLS handshake happen before any bytes of the request.'],
            ['Why track p99 rather than the mean?', 'The mean hides the slow requests users actually notice.'],
          ],
        },
        {
          title: 'OWASP API Top 10: authorization and authentication',
          description: 'Broken object-level authorization (BOLA), broken authentication, broken property-level authorization and broken function-level authorization: how each is exploited and the checks that prevent them.',
          concepts: ['BOLA and object ownership checks', 'Broken authentication patterns', 'Property-level exposure and mass assignment', 'Function-level authorization', 'Testing for authorization bugs'],
          quiz: [
            ['What is BOLA?', 'Accessing another user\'s object by changing an id, because ownership is never checked.'],
            ['How do you prevent mass assignment?', 'Bind only allow-listed fields from the request body.'],
          ],
          prereqs: ['Connection reuse and latency budgets'],
        },
        {
          title: 'OWASP API Top 10: resource consumption, SSRF and misconfiguration',
          description: 'Unrestricted resource consumption, unrestricted access to sensitive business flows, server-side request forgery through user-supplied URLs, security misconfiguration, improper inventory management and unsafe consumption of third-party APIs.',
          concepts: ['Resource consumption limits', 'Sensitive business flow abuse', 'SSRF from user-supplied URLs', 'Misconfiguration and inventory', 'Unsafe consumption of upstream APIs'],
          quiz: [
            ['Name two limits that mitigate resource consumption attacks.', 'Body size limits and pagination caps (also rate limits and timeouts).'],
            ['How do you mitigate SSRF when fetching a user-provided URL?', 'Allow-list destinations and block private IP ranges after DNS resolution.'],
          ],
          prereqs: ['OWASP API Top 10: authorization and authentication'],
        },
        {
          title: 'Input handling, injection and secrets',
          description: 'Parameterised queries, encoding output for the format, strict content-type checks, size limits, avoiding secrets in URLs and logs, and security headers relevant to APIs.',
          concepts: ['Parameterised queries', 'Strict Content-Type enforcement', 'Secrets in URLs and logs', 'Security headers for APIs', 'Dependency and secret scanning'],
          quiz: [
            ['Why reject requests whose Content-Type is not JSON on JSON endpoints?', 'It blocks form-based CSRF tricks and parser confusion.'],
            ['Which header stops browsers sniffing API responses as HTML?', 'X-Content-Type-Options: nosniff.'],
          ],
          prereqs: ['OWASP API Top 10: authorization and authentication'],
        },
      ],
    },
    {
      title: 'Webhooks, Gateways and Governance',
      topics: [
        {
          title: 'Webhook design',
          description: 'Event naming and payload shape, thin payloads with a fetch-back URL versus fat payloads, event ids for deduplication, ordering caveats, and subscription management endpoints.',
          concepts: ['Event types and naming', 'Thin versus fat payloads', 'Event ids and deduplication', 'Ordering and at-least-once delivery', 'Subscription management'],
          quiz: [
            ['Why include an event id?', 'Receivers deduplicate because delivery is at least once.'],
            ['What is a thin payload?', 'An event with ids and a URL to fetch the current state, avoiding stale data.'],
          ],
        },
        {
          title: 'Webhook security and delivery',
          description: 'HMAC signatures with timestamps to stop replay, retries with backoff and dead-lettering, receiver timeouts and fast acknowledgement, and secret rotation.',
          concepts: ['HMAC signatures and timestamps', 'Retry schedules and dead letters', 'Fast acknowledgement by receivers', 'Secret rotation', 'Delivery logs for debugging'],
          quiz: [
            ['How does a receiver verify a webhook?', 'Recompute the HMAC over the body with the shared secret and compare in constant time.'],
            ['Why should receivers respond 2xx quickly?', 'Long processing causes sender timeouts and duplicate retries.'],
          ],
          prereqs: ['Webhook design'],
        },
        {
          title: 'API gateways',
          description: 'What a gateway centralises (auth, rate limits, routing, TLS, logging), products like Kong, Apigee, AWS API Gateway and Envoy, and the risks of putting business logic in it.',
          concepts: ['Gateway responsibilities', 'Common gateway products', 'Routing and canary releases', 'Gateway versus service concerns', 'Latency added by the gateway'],
          quiz: [
            ['What belongs in a gateway?', 'Cross-cutting concerns such as authentication, throttling and routing.'],
            ['What should stay out of the gateway?', 'Business rules, which belong in services and their tests.'],
          ],
        },
        {
          title: 'API governance and style guides',
          description: 'A written style guide, automated linting, design reviews before implementation, an API catalogue, ownership and lifecycle stages, and metrics for adoption and quality.',
          concepts: ['Style guide contents', 'Design review process', 'API catalogue and ownership', 'Lifecycle stages', 'Governance without bottlenecks'],
          quiz: [
            ['Why automate style rules?', 'Reviews then focus on design rather than casing and naming.'],
            ['What does an API catalogue provide?', 'Discoverability, ownership and status of every API in the organisation.'],
          ],
        },
        {
          title: 'API observability and SLOs',
          description: 'Structured request logs with correlation ids, RED metrics per endpoint, distributed traces, SLOs on availability and latency, and dashboards per consumer. Deeper coverage lives in track-observability.',
          concepts: ['Request logs and correlation ids', 'RED metrics per endpoint', 'Traces across services', 'SLOs and error budgets', 'Per-consumer dashboards'],
          quiz: [
            ['What are RED metrics?', 'Rate, errors and duration per endpoint.'],
            ['Why measure per consumer?', 'One client can cause a spike that looks like a global problem.'],
          ],
          prereqs: ['API gateways'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: design and document an e-commerce API',
          description: 'Model products, carts, orders and payments; write the OpenAPI 3.1 document design-first with problem details, cursor pagination, idempotent checkout and versioning; lint it with Spectral and publish docs with Redoc.',
          concepts: ['Resource model and URL map', 'OpenAPI document with components', 'Idempotent checkout design', 'Error and pagination conventions', 'Linting and docs publishing'],
          quiz: [
            ['How should checkout be protected against duplicate submissions?', 'Require an Idempotency-Key and replay the stored response.'],
            ['Which status for a created order?', '201 Created with a Location header.'],
          ],
        },
        {
          title: 'Project: implement and test the API',
          description: 'Implement the e-commerce spec in any framework: validation, RFC 9457 errors, ETags with If-Match, rate limiting, JWT auth with object-level checks, response validation against the spec, and k6 thresholds in CI.',
          concepts: ['Handlers from the spec', 'ETags and conditional updates', 'Auth and object-level checks', 'Spec validation in tests', 'k6 thresholds in CI'],
          quiz: [
            ['What should updating an order without If-Match return if you require preconditions?', '428 Precondition Required.'],
            ['Which test proves the implementation matches the document?', 'Response validation against the OpenAPI schemas.'],
          ],
        },
        {
          title: 'Project: webhook delivery platform',
          description: 'A service that lets tenants subscribe to events, signs and delivers webhooks with retries and dead-letter queues, exposes delivery logs and a replay endpoint, and rotates secrets without downtime.',
          concepts: ['Subscription API', 'Signed delivery with retries', 'Delivery logs and replay', 'Rotate webhook signing secrets', 'Receiver test harness'],
          quiz: [
            ['How do you rotate a webhook secret without breaking receivers?', 'Sign with both old and new secrets during an overlap window.'],
            ['Where do failed deliveries go after the last retry?', 'A dead-letter store visible in the delivery log for manual replay.'],
          ],
        },
        {
          title: 'Project: public API with OAuth 2.0 and a developer portal',
          description: 'Add third-party access to an existing API: client registration, authorization code with PKCE, scopes, per-client rate limits, SDK generation and a portal with a changelog and deprecation policy.',
          concepts: ['Client registration and scopes', 'Authorization code with PKCE flow', 'Per-client limits and quotas', 'Generated SDKs', 'Portal, changelog and deprecation policy'],
          quiz: [
            ['Why per-client rate limits for a public API?', 'One misbehaving integration must not affect the others.'],
            ['What should a deprecation policy promise?', 'A minimum notice period, Sunset headers and a migration guide.'],
          ],
        },
        {
          title: 'REST API interview questions',
          description: 'The classics: PUT versus PATCH, idempotency, status code choices, pagination trade-offs, versioning, caching headers, JWT versus sessions, and how you would secure an endpoint.',
          concepts: ['HTTP semantics questions', 'Design trade-off questions', 'Security questions', 'Explaining decisions with examples'],
          quiz: [
            ['Explain idempotency in one sentence.', 'Repeating the same request produces the same server state as doing it once.'],
            ['When would you choose cursor pagination?', 'Large or frequently changing collections where stable, fast pages matter.'],
          ],
          style: 'reading',
        },
        {
          title: 'API design interview exercises',
          description: 'Whiteboard exercises: design the API for a ride-hailing app, a file-sharing service or a notification system, covering resources, auth, pagination, errors, rate limits and evolution in 30 minutes.',
          concepts: ['Structuring a design answer', 'Resource and endpoint sketching', 'Covering auth, errors and limits', 'Handling follow-up constraints'],
          quiz: [
            ['What should you clarify before sketching endpoints?', 'Consumers, scale, auth model and the core use cases.'],
            ['How do you show evolution thinking?', 'Mention versioning, additive changes and deprecation up front.'],
          ],
          style: 'design',
        },
      ],
    },
  ],
})
