import { defineTrack } from '../define'

export const microservices = defineTrack({
  id: 'track-microservices',
  title: 'Microservices',
  description: 'Designing systems as independently deployable services: when to split and when not to, service boundaries from domain-driven design, synchronous and asynchronous communication, gateways and discovery, resilience patterns, data ownership with sagas and the outbox, observability, service-to-service security, contract testing, Kubernetes deployment and migrating a monolith.',
  family: 'Backend Frameworks',
  kind: 'domain',
  icon: '🧩',
  tags: ['microservices', 'distributed systems', 'architecture', 'ddd', 'kafka', 'kubernetes', 'saga', 'api gateway'],
  languages: [],
  explainMode: 'hld',
  code: { label: 'pseudo-code only', id: 'plaintext', fixed: true },
  supports: { design: true, project: true },
  prerequisites: ['track-rest-api'],
  style: 'design',
  categories: [
    {
      title: 'Monolith or Microservices',
      description: 'The decision itself, made with the real costs in view.',
      topics: [
        {
          title: 'What a microservice is and is not',
          description: 'Independently deployable services owning their data and talking over the network, versus a distributed monolith that shares a database and deploys in lockstep; the definition sets the bar for every later decision.',
          concepts: ['Independent deployability', 'Ownership of data and schema', 'The distributed monolith anti-pattern', 'Service size heuristics'],
          quiz: [
            ['What is the clearest sign of a distributed monolith?', 'Services that must be deployed together or share a database.'],
            ['Is small size the defining property of a microservice?', 'No, independent deployability and data ownership are.'],
          ],
        },
        {
          title: 'The costs of distribution',
          description: 'Network latency and partial failure, data consistency without transactions, operational overhead per service, and debugging across processes; these costs are paid on day one while the benefits arrive later.',
          concepts: ['Partial failure modes', 'Latency budget across hops', 'Operational cost per service', 'Fallacies of distributed computing'],
          quiz: [
            ['Name three fallacies of distributed computing.', 'The network is reliable, latency is zero, bandwidth is infinite.'],
            ['Why does a call chain of five services worry a designer?', 'Latency adds up and any hop can fail, multiplying failure probability.'],
          ],
          prereqs: ['What a microservice is and is not'],
        },
        {
          title: 'The modular monolith',
          description: 'One deployable with enforced module boundaries, in-process calls, a single database with per-module schemas and tests that fail on boundary violations; the default starting point for most teams.',
          concepts: ['Module boundaries in one deployable', 'Schema per module', 'Enforcing boundaries with tests', 'Extracting a module later'],
          quiz: [
            ['Why start with a modular monolith?', 'You keep transactions and simple debugging while learning the real boundaries.'],
            ['What makes a monolith module extractable later?', 'Communication only through a public API and no shared tables.'],
          ],
          prereqs: ['The costs of distribution'],
        },
        {
          title: 'When to split: signals and team structure',
          description: 'Independent scaling needs, differing release cadences, team autonomy and Conway\'s law, technology isolation and blast radius; and the signals that say the split is premature.',
          concepts: ['Conway\'s law and team topology', 'Independent scaling and cadence', 'Blast radius isolation', 'Signs of premature splitting'],
          quiz: [
            ['What does Conway\'s law predict?', 'System structure mirrors the communication structure of the organisation.'],
            ['How many teams justify microservices?', 'There is no number; it is about teams needing to deploy independently.'],
          ],
          prereqs: ['The modular monolith'],
        },
      ],
    },
    {
      title: 'Service Boundaries and Domain-Driven Design',
      description: 'Finding the seams before cutting.',
      topics: [
        {
          title: 'Bounded contexts and ubiquitous language',
          description: 'A model and vocabulary that are consistent within a boundary and deliberately different outside it; the same word meaning different things in sales and shipping is the seam between services.',
          concepts: ['Bounded context definition', 'Ubiquitous language per context', 'Same word, different models', 'Context boundaries as service boundaries'],
          quiz: [
            ['Why can "customer" be two models?', 'Sales cares about leads and credit; shipping cares about addresses; one model would serve neither.'],
            ['What is the risk of one shared canonical model?', 'Every change couples every team and the model fits nobody.'],
          ],
        },
        {
          title: 'Subdomains and decomposition strategies',
          description: 'Core, supporting and generic subdomains, decomposing by business capability or by subdomain, and why decomposing by technical layer or by entity creates chatty services.',
          concepts: ['Core versus supporting versus generic', 'Decompose by business capability', 'Decompose by subdomain', 'Anti-patterns: by layer or by entity'],
          quiz: [
            ['Where should the best engineers work?', 'On the core subdomain that differentiates the business.'],
            ['Why is an "Order entity service" a poor boundary?', 'Every use case needs it, creating a chatty, central dependency.'],
          ],
          prereqs: ['Bounded contexts and ubiquitous language'],
        },
        {
          title: 'Aggregates and consistency boundaries',
          description: 'An aggregate is the unit of transactional consistency; keeping aggregates small, referencing others by id, and accepting eventual consistency between them defines what a service can promise.',
          concepts: ['Aggregate root and invariants', 'Small aggregates by id reference', 'One transaction per aggregate', 'Eventual consistency between aggregates'],
          quiz: [
            ['How many aggregates should one transaction modify?', 'One, as a rule.'],
            ['How does an Order refer to a Customer in another aggregate?', 'By customer id, not by object reference.'],
          ],
          prereqs: ['Subdomains and decomposition strategies'],
        },
        {
          title: 'Context mapping and integration patterns',
          description: 'Customer-supplier, conformist, anti-corruption layer, shared kernel and published language; drawing the map shows which service bends to which and where translation layers belong.',
          concepts: ['Context map relationships', 'Anti-corruption layer', 'Shared kernel risks', 'Published language and schemas'],
          quiz: [
            ['What does an anti-corruption layer do?', 'Translates an external model into your own so its concepts do not leak in.'],
            ['When is a shared kernel acceptable?', 'For tiny, stable shared code owned jointly by both teams.'],
          ],
          prereqs: ['Bounded contexts and ubiquitous language'],
        },
        {
          title: 'Event storming a domain',
          description: 'A workshop that lays out domain events on a timeline, then commands, actors and aggregates, revealing pivotal events and boundaries faster than reading requirements.',
          concepts: ['Domain events on a timeline', 'Commands, actors and policies', 'Pivotal events as boundaries', 'From sticky notes to services'],
          quiz: [
            ['What is written on the orange notes first?', 'Domain events in past tense, such as OrderPlaced.'],
            ['What indicates a boundary in the timeline?', 'Pivotal events where language and actors change.'],
          ],
          prereqs: ['Subdomains and decomposition strategies'],
        },
      ],
    },
    {
      title: 'Communication',
      description: 'How services talk, and what each style costs.',
      topics: [
        {
          title: 'Synchronous calls with REST and gRPC',
          description: 'Request-response over HTTP or gRPC, when protobuf and streaming justify gRPC, and the coupling that synchronous chains create: the caller waits, so the callee\'s availability becomes the caller\'s.',
          concepts: ['REST versus gRPC trade-offs', 'Temporal coupling', 'Availability multiplication across chains', 'Timeouts as a contract'],
          quiz: [
            ['If three services in a chain each have 99.9% availability, what is the chain\'s?', 'About 99.7%.'],
            ['When does gRPC pay off?', 'High-throughput internal calls with typed contracts or streaming.'],
          ],
        },
        {
          title: 'Asynchronous messaging',
          description: 'Queues for work distribution, topics for fan-out, delivery guarantees, message ordering per key, and how a broker decouples availability but adds eventual consistency and duplicate delivery.',
          concepts: ['Queues versus topics', 'At-least-once and its duplicates', 'Ordering per partition key', 'Broker as availability buffer'],
          quiz: [
            ['What does at-least-once delivery force the consumer to do?', 'Be idempotent, since redelivery can happen.'],
            ['How do you keep events for one order in sequence?', 'Partition by order id so they land on one partition.'],
          ],
          prereqs: ['Synchronous calls with REST and gRPC'],
        },
        {
          title: 'Event notification versus event-carried state',
          description: 'A thin event that says "look it up" versus a fat event carrying the data, and event sourcing where the events are the store; each shifts coupling and consistency differently.',
          concepts: ['Thin event notification', 'Event-carried state transfer', 'Event sourcing as a store', 'Choosing event payload size'],
          quiz: [
            ['Downside of thin events?', 'Consumers call back to the producer, reintroducing synchronous coupling.'],
            ['Downside of fat events?', 'Consumers copy data that goes stale and schemas grow.'],
          ],
          prereqs: ['Asynchronous messaging'],
        },
        {
          title: 'Kafka and RabbitMQ as backbones',
          description: 'Log-based Kafka with retention and consumer groups versus RabbitMQ\'s queues and exchanges with per-message acks; choosing by replay needs, throughput and routing complexity.',
          concepts: ['Kafka partitions and retention', 'RabbitMQ exchanges and routing', 'Replay versus delete-on-ack', 'Consumer groups and scaling'],
          quiz: [
            ['Which broker lets a new consumer replay last week\'s events?', 'Kafka, within its retention window.'],
            ['Which suits complex routing rules per message?', 'RabbitMQ with exchange bindings.'],
          ],
          prereqs: ['Asynchronous messaging'],
        },
        {
          title: 'Schema evolution and contracts',
          description: 'Backward and forward compatibility for JSON, Avro and protobuf, a schema registry as gatekeeper, the tolerant reader rule, and versioning that never breaks running consumers.',
          concepts: ['Backward and forward compatibility', 'Schema registry checks', 'Tolerant reader', 'Additive-only changes'],
          quiz: [
            ['Which change is backward compatible?', 'Adding an optional field.'],
            ['What does a tolerant reader ignore?', 'Unknown fields, so producers can add data freely.'],
          ],
          prereqs: ['Asynchronous messaging'],
        },
        {
          title: 'CQRS and read models',
          description: 'Separating the write model from denormalised read models built from events, when the split pays off, and the staleness and rebuild questions it raises.',
          concepts: ['Command and query separation', 'Projections from events', 'Read model staleness', 'Rebuilding projections'],
          quiz: [
            ['Why maintain a separate read model?', 'Queries that would need joins across services become one lookup.'],
            ['How do you fix a corrupted projection?', 'Replay the events to rebuild it.'],
          ],
          prereqs: ['Event notification versus event-carried state'],
        },
      ],
    },
    {
      title: 'Gateway, Discovery and Configuration',
      description: 'The edge and the plumbing every service shares.',
      topics: [
        {
          title: 'API gateway responsibilities',
          description: 'One entry point handling routing, TLS, authentication, rate limiting and request shaping so services do not repeat them; and the risk of turning it into a business-logic monolith.',
          concepts: ['Routing and TLS termination', 'Edge authentication', 'Rate limiting at the edge', 'Keeping logic out of the gateway'],
          quiz: [
            ['What belongs in a gateway?', 'Cross-cutting concerns: routing, auth, limits, not business rules.'],
            ['What is the risk of a gateway team?', 'It becomes a bottleneck every service change must go through.'],
          ],
        },
        {
          title: 'Backend for frontend',
          description: 'A gateway per client type that aggregates and shapes responses for web, mobile or partners, owned by the client team, avoiding one gateway that serves nobody well.',
          concepts: ['BFF per client type', 'Aggregation and shaping', 'Ownership by the client team', 'Duplication versus fit'],
          quiz: [
            ['Who should own a mobile BFF?', 'The mobile team that consumes it.'],
            ['What problem does a BFF solve?', 'Different clients need different shapes and call patterns.'],
          ],
          prereqs: ['API gateway responsibilities'],
        },
        {
          title: 'Service discovery',
          description: 'Client-side discovery with a registry versus server-side via a load balancer or DNS, health-based registration, and why Kubernetes Services make a registry unnecessary for most teams.',
          concepts: ['Client-side versus server-side discovery', 'Registries and health checks', 'DNS-based discovery', 'Kubernetes Service as discovery'],
          quiz: [
            ['How does a Kubernetes Service find pods?', 'By label selector, keeping endpoints updated as pods change.'],
            ['What happens with stale registry entries?', 'Calls go to dead instances until health checks evict them.'],
          ],
          prereqs: ['API gateway responsibilities'],
        },
        {
          title: 'Configuration and secrets management',
          description: 'Environment-specific configuration outside the image, central config with versioning, secret stores with rotation, and feature flags for runtime behaviour changes.',
          concepts: ['Config outside the image', 'Central config service', 'Secret stores and rotation', 'Feature flags'],
          quiz: [
            ['Why not bake config into the image?', 'One image should run unchanged in every environment.'],
            ['What does secret rotation require from services?', 'Reloading credentials without a restart or tolerating a restart.'],
          ],
        },
        {
          title: 'API versioning across services',
          description: 'Additive changes, parallel versions and sunset periods, consumer inventory so you know who breaks, and why breaking changes need coordination rather than a version bump.',
          concepts: ['Additive change discipline', 'Parallel versions and sunset', 'Knowing your consumers', 'Coordinating breaking changes'],
          quiz: [
            ['What must you know before removing an old endpoint?', 'Which consumers still call it, from access logs or contracts.'],
            ['Why prefer additive changes?', 'No consumer breaks and no version fan-out to maintain.'],
          ],
          prereqs: ['Service discovery'],
        },
      ],
    },
    {
      title: 'Resilience',
      description: 'Failing partially instead of completely.',
      topics: [
        {
          title: 'Timeouts and deadlines',
          description: 'Every remote call gets a timeout shorter than the caller\'s own, deadlines propagated down the chain, and why a missing timeout is the most common cause of a cascading outage.',
          concepts: ['Connect versus read timeouts', 'Deadline propagation', 'Timeout budgets down the chain', 'Missing timeouts and thread exhaustion'],
          quiz: [
            ['If the gateway allows 2 seconds, what timeout should a downstream call get?', 'Less than the remaining budget, so the caller can still respond.'],
            ['What happens without a read timeout under a slow dependency?', 'Threads pile up waiting until the caller runs out.'],
          ],
        },
        {
          title: 'Retries, backoff and idempotency',
          description: 'Retrying only safe or idempotent operations, exponential backoff with jitter to avoid synchronised storms, retry budgets, and idempotency keys for writes.',
          concepts: ['What is safe to retry', 'Exponential backoff with jitter', 'Retry budgets', 'Idempotency keys for writes'],
          quiz: [
            ['Why add jitter to backoff?', 'Without it, all clients retry at the same instant and overload the server again.'],
            ['How do you make a payment POST retry-safe?', 'The client sends an idempotency key and the server deduplicates.'],
          ],
          prereqs: ['Timeouts and deadlines'],
        },
        {
          title: 'Circuit breakers and fallbacks',
          description: 'Tracking failure rates and opening the circuit to fail fast, half-open probes to recover, and fallbacks that degrade gracefully rather than pretend success.',
          concepts: ['Closed, open and half-open states', 'Failure rate thresholds', 'Fail fast versus fallback', 'Honest degradation'],
          quiz: [
            ['What does an open circuit do?', 'Rejects calls immediately without contacting the dependency.'],
            ['What is a bad fallback?', 'Returning fake success for a write the system did not perform.'],
          ],
          prereqs: ['Retries, backoff and idempotency'],
        },
        {
          title: 'Bulkheads and load shedding',
          description: 'Isolating thread pools or connection pools per dependency so one slow service cannot starve the rest, plus shedding excess load early with 503s and rate limits.',
          concepts: ['Bulkhead per dependency', 'Queue limits and rejection', 'Load shedding with 503', 'Priority for critical traffic'],
          quiz: [
            ['What does a bulkhead protect?', 'Other dependencies from a slow one exhausting shared resources.'],
            ['Why shed load early?', 'A server that accepts everything gets slow for everyone; rejecting some keeps the rest fast.'],
          ],
          prereqs: ['Circuit breakers and fallbacks'],
        },
        {
          title: 'Backpressure and queues',
          description: 'Bounded queues between producers and consumers, consumer lag as the signal, slowing producers rather than buffering forever, and the trade-off between latency and loss.',
          concepts: ['Bounded buffers', 'Consumer lag monitoring', 'Slowing the producer', 'Drop, block or shed decisions'],
          quiz: [
            ['What does growing consumer lag indicate?', 'Consumers cannot keep up with producers.'],
            ['Why are unbounded queues dangerous?', 'They hide overload until memory or disk runs out.'],
          ],
          prereqs: ['Bulkheads and load shedding'],
        },
        {
          title: 'Chaos engineering and failure drills',
          description: 'Injecting latency and failures on purpose in staging and then production, verifying breakers and fallbacks work, and game days that test people as well as systems.',
          concepts: ['Fault injection', 'Steady-state hypotheses', 'Game days', 'Blast radius control'],
          quiz: [
            ['What must be defined before a chaos experiment?', 'The steady state and the hypothesis that it holds under the fault.'],
            ['Why start with a small blast radius?', 'To learn without causing the outage you are trying to prevent.'],
          ],
          prereqs: ['Circuit breakers and fallbacks'],
        },
      ],
    },
    {
      title: 'Data Ownership and Consistency',
      description: 'Each service owns its data; everything else follows from that.',
      topics: [
        {
          title: 'Database per service',
          description: 'Private schemas accessed only through the owning service\'s API, why shared tables recreate coupling, and the joins and reports that stop being possible.',
          concepts: ['Private schema ownership', 'Why shared tables couple deploys', 'Cross-service queries', 'Reporting without joins'],
          quiz: [
            ['Can two services share one database server?', 'Yes, but not the same schema or tables.'],
            ['How do you build a report across services?', 'Aggregate events into a reporting store or read model.'],
          ],
        },
        {
          title: 'The dual-write problem',
          description: 'Writing to a database and publishing to a broker cannot be atomic, so a crash between them loses or duplicates events; recognising this is what motivates the outbox.',
          concepts: ['Non-atomic write and publish', 'Lost and phantom events', 'Two-phase commit limits', 'Motivation for the outbox'],
          quiz: [
            ['What goes wrong if you publish before committing?', 'Consumers may see an event for a transaction that rolls back.'],
            ['Why not use distributed transactions?', 'Brokers and databases rarely support them and they hurt availability.'],
          ],
          prereqs: ['Database per service'],
        },
        {
          title: 'Transactional outbox and CDC',
          description: 'Writing the event to an outbox table in the same transaction, relaying it with a poller or change data capture such as Debezium, and at-least-once delivery with deduplication downstream.',
          concepts: ['Outbox table in the transaction', 'Polling relay', 'Change data capture with Debezium', 'Deduplication on the consumer'],
          quiz: [
            ['What guarantees the outbox row exists if the order exists?', 'Both are written in one database transaction.'],
            ['What does CDC read?', 'The database transaction log, not the tables.'],
          ],
          prereqs: ['The dual-write problem'],
        },
        {
          title: 'Idempotent consumers and the inbox',
          description: 'Storing processed message ids, natural idempotency through upserts, the inbox pattern for exactly-once processing effects, and handling out-of-order delivery.',
          concepts: ['Processed-id tracking', 'Upserts for natural idempotency', 'Inbox table', 'Out-of-order handling with versions'],
          quiz: [
            ['What does exactly-once processing actually mean here?', 'At-least-once delivery plus an idempotent effect.'],
            ['How do you handle an older event arriving after a newer one?', 'Compare versions or timestamps and ignore the stale update.'],
          ],
          prereqs: ['Transactional outbox and CDC'],
        },
        {
          title: 'Sagas: choreography and orchestration',
          description: 'A multi-service business transaction as a sequence of local transactions with compensations; choreography through events versus an orchestrator that tracks state, and when each fits.',
          concepts: ['Local transactions and compensations', 'Choreography via events', 'Orchestrator state machine', 'Choosing by complexity'],
          quiz: [
            ['What replaces rollback in a saga?', 'Compensating transactions that undo earlier steps.'],
            ['When does choreography become hard to follow?', 'When many services react to each other and no one can see the whole flow.'],
          ],
          prereqs: ['Idempotent consumers and the inbox'],
        },
        {
          title: 'Compensation and semantic locks',
          description: 'Designing compensations that are not exact reversals, pending states that block conflicting actions until the saga ends, and countermeasures for anomalies between steps.',
          concepts: ['Compensations as new actions', 'Pending state semantic locks', 'Commutative and pivot steps', 'Anomaly countermeasures'],
          quiz: [
            ['Why is a compensation not a rollback?', 'Other transactions may have seen the intermediate state; you issue a new corrective action.'],
            ['What is a pivot transaction?', 'The step after which the saga can no longer be compensated and must complete.'],
          ],
          prereqs: ['Sagas: choreography and orchestration'],
        },
        {
          title: 'Data replication and reference data',
          description: 'Keeping local copies of another service\'s data via events for reads, accepting staleness, and the difference between owning data and caching it.',
          concepts: ['Local read copies via events', 'Accepting staleness', 'Owner versus cache', 'Reference data distribution'],
          quiz: [
            ['May a service update its copy of another service\'s data directly?', 'No, only the owner changes it; copies follow events.'],
            ['What is the risk of local copies?', 'Consumers act on stale data and drift when events are missed.'],
          ],
          prereqs: ['Database per service'],
        },
      ],
    },
    {
      title: 'Observability',
      description: 'Understanding one request across twenty processes; tooling detail lives in track-observability.',
      topics: [
        {
          title: 'Correlation ids and structured logs',
          description: 'A request id created at the edge and propagated through every call and message, structured JSON logs that carry it, and central aggregation so one search shows the whole path.',
          concepts: ['Propagating a correlation id', 'Structured log fields', 'Ids in message headers', 'Central log search'],
          quiz: [
            ['Where should a correlation id be created?', 'At the first entry point, usually the gateway.'],
            ['How does the id travel through a queue?', 'In a message header copied into the consumer\'s context.'],
          ],
        },
        {
          title: 'Distributed tracing',
          description: 'Traces and spans, W3C trace context propagation, sampling, and reading a trace waterfall to find the slow or failing hop.',
          concepts: ['Traces and spans', 'W3C traceparent propagation', 'Sampling strategies', 'Reading a trace waterfall'],
          quiz: [
            ['What is a span?', 'One timed operation with a parent, within a trace.'],
            ['Why sample traces?', 'Storing every trace is expensive; a fraction still shows patterns.'],
          ],
          prereqs: ['Correlation ids and structured logs'],
        },
        {
          title: 'Metrics, RED and SLOs',
          description: 'Rate, errors and duration per service, latency percentiles rather than averages, and service level objectives with error budgets that decide when to slow feature work.',
          concepts: ['RED metrics per service', 'Percentiles over averages', 'SLOs and error budgets', 'Alerting on symptoms'],
          quiz: [
            ['Why p99 rather than mean latency?', 'The mean hides the slow tail that users actually feel.'],
            ['What does an exhausted error budget trigger?', 'Prioritising reliability work over features.'],
          ],
          prereqs: ['Correlation ids and structured logs'],
        },
        {
          title: 'Health checks and dependency dashboards',
          description: 'Liveness versus readiness, why readiness must not fail on downstream outages, and dashboards that show dependency graphs and lag so incidents are located fast.',
          concepts: ['Liveness versus readiness', 'Downstream checks and cascades', 'Dependency graph dashboards', 'Consumer lag panels'],
          quiz: [
            ['Why should readiness ignore a slow downstream?', 'All instances would go unready at once and the outage spreads.'],
            ['What does a service map show during an incident?', 'Which edges have rising error rates or latency.'],
          ],
          prereqs: ['Metrics, RED and SLOs'],
        },
      ],
    },
    {
      title: 'Security Between Services',
      description: 'Trust nothing on the internal network; generic security concepts belong to track-spring-security and the cybersecurity tracks.',
      topics: [
        {
          title: 'Zero trust and mutual TLS',
          description: 'Authenticating both ends of every connection with certificates, automated issuance and rotation, and why a private network is not a security boundary.',
          concepts: ['Zero trust principle', 'Mutual TLS handshake', 'Certificate issuance and rotation', 'Network is not a boundary'],
          quiz: [
            ['What does mTLS add over TLS?', 'The client also presents a certificate, so the server knows who is calling.'],
            ['Who issues service certificates in practice?', 'An internal CA or the service mesh automatically.'],
          ],
        },
        {
          title: 'Propagating user identity',
          description: 'Passing the end-user token or a signed identity claim through the chain, token exchange for narrowed scopes, and never trusting a user id in a plain header.',
          concepts: ['Passing tokens downstream', 'Token exchange for narrowed scope', 'Signed identity headers', 'Untrusted plain headers'],
          quiz: [
            ['Why not pass X-User-Id as a plain header?', 'Any caller could set it; only a signed token proves identity.'],
            ['What does token exchange achieve?', 'A downstream token with only the scopes that hop needs.'],
          ],
          prereqs: ['Zero trust and mutual TLS'],
        },
        {
          title: 'Service-to-service authorization',
          description: 'Service identities and allow-lists for who may call what, policy engines such as OPA, and separating service permissions from user permissions.',
          concepts: ['Service identities', 'Call allow-lists', 'Policy engines and OPA', 'Service versus user permissions'],
          quiz: [
            ['Should the billing service accept calls from every service?', 'No, only from the identities allowed by policy.'],
            ['Where can a policy engine sit?', 'In a sidecar or gateway, evaluating requests against policy.'],
          ],
          prereqs: ['Propagating user identity'],
        },
        {
          title: 'Service mesh',
          description: 'Sidecar proxies that handle mTLS, retries, timeouts and telemetry outside application code, what a control plane configures, and the cost in latency and complexity.',
          concepts: ['Sidecar proxies', 'Control plane and data plane', 'Policies moved out of code', 'Latency and operational cost'],
          quiz: [
            ['What does a mesh remove from application code?', 'mTLS, retries, timeouts and basic telemetry.'],
            ['What does a sidecar add to every request?', 'Two extra proxy hops of latency.'],
          ],
          prereqs: ['Zero trust and mutual TLS'],
        },
      ],
    },
    {
      title: 'Testing',
      description: 'Confidence without booting the whole system.',
      topics: [
        {
          title: 'The testing pyramid for services',
          description: 'Unit and component tests inside a service, contract tests between services, a thin layer of end-to-end tests, and why big end-to-end suites become slow and flaky.',
          concepts: ['Component tests per service', 'Contract layer', 'Thin end-to-end layer', 'Flaky suite economics'],
          quiz: [
            ['Why keep end-to-end tests few?', 'They are slow, need every service up and fail for unrelated reasons.'],
            ['What does a component test include?', 'One service with its database and stubbed dependencies.'],
          ],
        },
        {
          title: 'Consumer-driven contract tests',
          description: 'Consumers record the requests and responses they rely on, providers verify against them in CI, and breaking changes fail before deployment; Pact and Spring Cloud Contract implement this.',
          concepts: ['Consumer expectations as contracts', 'Provider verification in CI', 'Pact broker workflow', 'Can-I-deploy checks'],
          quiz: [
            ['Who writes the contract?', 'The consumer, describing only what it uses.'],
            ['What does the provider build do with contracts?', 'Replays them against the real provider and fails on mismatch.'],
          ],
          prereqs: ['The testing pyramid for services'],
        },
        {
          title: 'Testing asynchronous flows',
          description: 'Message contracts, awaiting eventual outcomes with polling and timeouts, testing idempotency by redelivering, and verifying compensations in a saga.',
          concepts: ['Message contract tests', 'Awaiting eventual outcomes', 'Redelivery tests', 'Saga compensation tests'],
          quiz: [
            ['How do you assert something that happens eventually?', 'Poll with a timeout rather than sleeping a fixed time.'],
            ['How do you test idempotency?', 'Deliver the same message twice and assert one effect.'],
          ],
          prereqs: ['Consumer-driven contract tests'],
        },
        {
          title: 'Environments and testing in production',
          description: 'Ephemeral preview environments per change, shared staging drift, and safe production testing with feature flags, shadow traffic and synthetic checks.',
          concepts: ['Ephemeral environments', 'Staging drift', 'Shadow traffic', 'Synthetic monitoring'],
          quiz: [
            ['Why does a shared staging environment mislead?', 'It drifts from production in data, config and versions.'],
            ['What is shadow traffic?', 'Copying real requests to a new version without returning its responses.'],
          ],
          prereqs: ['The testing pyramid for services'],
        },
      ],
    },
    {
      title: 'Deployment and Kubernetes',
      description: 'Running many services safely; cluster mechanics are in track-kubernetes.',
      topics: [
        {
          title: 'One service, one pipeline',
          description: 'Independent build, test and deploy per service, immutable images tagged by commit, and the repository layout choices between monorepo and one repo per service.',
          concepts: ['Pipeline per service', 'Immutable image tags', 'Monorepo versus polyrepo', 'Shared pipeline templates'],
          quiz: [
            ['Why tag images by commit rather than latest?', 'Deployments become reproducible and rollbacks exact.'],
            ['What breaks independence in a monorepo?', 'A single pipeline that deploys everything together.'],
          ],
        },
        {
          title: 'Kubernetes primitives for services',
          description: 'Deployments for replicas and rollouts, Services for stable addresses, Ingress for the edge, ConfigMaps and Secrets, and resource requests and limits per container.',
          concepts: ['Deployments and ReplicaSets', 'Services and Ingress', 'ConfigMaps and Secrets mounting', 'Requests and limits'],
          quiz: [
            ['What gives a service a stable internal address?', 'A Kubernetes Service with a DNS name.'],
            ['What happens when a container exceeds its memory limit?', 'It is killed and restarted.'],
          ],
          prereqs: ['One service, one pipeline'],
        },
        {
          title: 'Rollouts: rolling, blue-green and canary',
          description: 'Rolling updates with readiness gates, blue-green for instant switch and rollback, canaries that shift a percentage of traffic while watching metrics, and automated rollback rules.',
          concepts: ['Rolling update parameters', 'Blue-green switching', 'Canary traffic shifting', 'Automated rollback on metrics'],
          quiz: [
            ['What does a canary require that a rolling update does not?', 'Traffic splitting and metric comparison between versions.'],
            ['Why must old and new versions coexist?', 'Any rollout strategy runs both for a while.'],
          ],
          prereqs: ['Kubernetes primitives for services'],
        },
        {
          title: 'Autoscaling and capacity',
          description: 'Horizontal pod autoscaling on CPU or custom metrics like queue lag, cluster autoscaling, and scaling limits set by databases and downstream services.',
          concepts: ['HPA on CPU and custom metrics', 'Scaling consumers on lag', 'Cluster autoscaler', 'Downstream capacity limits'],
          quiz: [
            ['What metric scales a queue consumer well?', 'Consumer lag or queue depth.'],
            ['Why can scaling a service out hurt?', 'More instances can overwhelm a database with more connections.'],
          ],
          prereqs: ['Kubernetes primitives for services'],
        },
        {
          title: 'GitOps and platform tooling',
          description: 'Declaring desired state in Git and letting Argo CD or Flux reconcile it, Helm charts or Kustomize for templating, and a platform team offering paved roads.',
          concepts: ['Git as source of truth', 'Reconciliation loops', 'Helm and Kustomize', 'Paved-road platforms'],
          quiz: [
            ['What does a GitOps controller do?', 'Continuously reconciles the cluster to match the manifests in Git.'],
            ['Why offer a service template?', 'New services start with logging, metrics, health and pipelines already correct.'],
          ],
          prereqs: ['One service, one pipeline'],
        },
      ],
    },
    {
      title: 'Migrating from a Monolith',
      description: 'Getting there incrementally and reversibly.',
      topics: [
        {
          title: 'The strangler fig pattern',
          description: 'Routing selected requests to a new service while the monolith keeps serving the rest, growing the new system at the edge until the old path can be removed.',
          concepts: ['Facade routing', 'Incremental replacement', 'Reversible cutovers', 'Retiring the old path'],
          quiz: [
            ['Where does the routing decision live?', 'In a proxy or gateway in front of the monolith.'],
            ['Why is the pattern low risk?', 'Each step can be reversed by routing back to the monolith.'],
          ],
        },
        {
          title: 'Choosing the first service to extract',
          description: 'Picking a module with clear boundaries, few dependencies and real benefit, avoiding the core until the team has practised, and measuring the win.',
          concepts: ['Boundary clarity', 'Dependency count', 'Business value of extraction', 'Learning on low-risk modules'],
          quiz: [
            ['Why not extract the core domain first?', 'It has the most coupling and the highest cost of mistakes.'],
            ['What makes a module a good first candidate?', 'Few incoming and outgoing dependencies and a clear owner.'],
          ],
          prereqs: ['The strangler fig pattern'],
        },
        {
          title: 'Splitting the database',
          description: 'Separating schemas, replacing joins with API calls or replicated data, migrating data with dual writes or CDC, and cutting the foreign keys last.',
          concepts: ['Schema separation first', 'Replacing cross-module joins', 'Dual-run data migration', 'Dropping foreign keys last'],
          quiz: [
            ['Why split the schema before the code?', 'It reveals every hidden join and shared table.'],
            ['How do you keep two stores in sync during migration?', 'Dual writes with reconciliation, or CDC from the source.'],
          ],
          prereqs: ['Choosing the first service to extract'],
        },
        {
          title: 'Parallel run and verification',
          description: 'Sending traffic to old and new implementations, comparing results before trusting the new one, and the metrics that decide when to switch.',
          concepts: ['Dual execution', 'Result comparison', 'Switch criteria', 'Handling divergent results'],
          quiz: [
            ['What does a parallel run compare?', 'Outputs of the old and new implementation for the same input.'],
            ['When is the new path trusted?', 'When divergence is understood and below an agreed threshold for long enough.'],
          ],
          prereqs: ['Splitting the database'],
        },
        {
          title: 'Organisational change and ownership',
          description: 'Teams aligned to services, on-call responsibility, documentation and runbooks per service, and knowing when to merge services back together.',
          concepts: ['Team per service ownership', 'On-call and runbooks', 'Service catalogue', 'Merging services back'],
          quiz: [
            ['What is the sign that two services should merge?', 'Every change touches both and they deploy together anyway.'],
            ['What does a service catalogue record?', 'Owner, dependencies, SLOs, runbooks and contact for each service.'],
          ],
          prereqs: ['Choosing the first service to extract'],
        },
      ],
    },
    {
      title: 'Design Projects',
      description: 'End-to-end designs to draw, defend and document.',
      style: 'project',
      topics: [
        {
          title: 'Project: decompose an e-commerce monolith',
          description: 'Map bounded contexts from a described monolith, produce a context map, choose the first three services to extract with a strangler plan, and document the data split and event flows.',
          concepts: ['Identify bounded contexts', 'Draw the context map', 'Plan the extraction order', 'Design the data split', 'Document event flows'],
          quiz: [
            ['What must the plan say about each extracted service?', 'Its data, its API, who calls it and how the cutover reverses.'],
            ['Which events cross the catalogue and order contexts?', 'Product changes and order placement, with ids not shared tables.'],
          ],
        },
        {
          title: 'Project: order saga with outbox and Kafka',
          description: 'Design checkout across order, payment and inventory services with an orchestrated saga, transactional outbox, idempotent consumers, compensations and a failure-mode table.',
          concepts: ['Checkout orchestration flow', 'Outbox and relay design', 'Idempotent consumer design', 'Compensation paths', 'Failure-mode table'],
          quiz: [
            ['What happens if payment succeeds but inventory fails?', 'The orchestrator issues a refund compensation and marks the order failed.'],
            ['How are duplicate PaymentCompleted events handled?', 'The order service records processed ids and ignores repeats.'],
          ],
        },
        {
          title: 'Project: resilient gateway and platform',
          description: 'Design the edge and platform for twenty services: gateway with auth and rate limits, discovery, timeouts and breaker budgets per hop, mTLS, tracing propagation and a canary rollout process.',
          concepts: ['Gateway and BFF design', 'Timeout and breaker budgets', 'Identity and mTLS design', 'Tracing and dashboards', 'Rollout process'],
          quiz: [
            ['How is the timeout budget allocated across three hops?', 'Each hop gets less than the caller\'s remaining budget.'],
            ['What metric gates the canary?', 'Error rate and p99 latency compared with the stable version.'],
          ],
        },
        {
          title: 'Project: monolith migration roadmap',
          description: 'A phased plan for a real or described legacy system: modular monolith first, first extraction, database split, parallel run, team changes and measurable milestones.',
          concepts: ['Phase the roadmap', 'Pick and justify the first extraction', 'Plan the database split', 'Define milestones and metrics', 'Present and defend'],
          quiz: [
            ['What is measured at each milestone?', 'Deploy frequency, lead time, failure rate and recovery time.'],
            ['What is the exit criterion for phase one?', 'Module boundaries enforced by tests with no shared tables.'],
          ],
        },
      ],
    },
  ],
})
