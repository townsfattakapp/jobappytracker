import { defineTrack } from '../define'

export const llmApps = defineTrack({
  id: 'track-llm-apps',
  title: 'LLM Application Engineering',
  description: 'Shipping production features on top of language models: gateway and orchestration architecture, SDK and API design, structured outputs, streaming UIs, conversation state, RAG and tool integration, caching, rate limits, observability, guardrails, PII handling, testing, deployment and the product patterns behind chat, copilots, extraction and summarisation.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🛠️',
  tags: ['llm apps', 'structured outputs', 'streaming', 'guardrails', 'observability', 'caching', 'fastapi', 'production ai'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-llms'],
  style: 'practice',
  categories: [
    {
      title: 'Application Architecture',
      description: 'The moving parts of a production LLM feature and why they are separated.',
      topics: [
        {
          title: 'Anatomy of an LLM application',
          description: 'A client, an API layer, an orchestration layer that builds prompts and calls tools, a gateway to model providers and stores for conversations, prompts and vectors; drawing these boundaries first keeps the model call from leaking into every module.',
          concepts: ['Client, API and orchestration layers', 'Provider gateway', 'Stores for chats, prompts and vectors', 'Boundaries around the model call'],
          quiz: [
            ['Where should prompt construction live?', 'In the orchestration layer, not in request handlers or the UI.'],
            ['Why isolate the model call behind one module?', 'Providers, models and prompts change; one seam makes swapping and testing easy.'],
          ],
        },
        {
          title: 'The LLM gateway pattern',
          description: 'A single internal service or library that holds provider keys, normalises request and response formats, applies rate limits, retries, logging and cost accounting, and routes between models; every feature calls it instead of a vendor SDK directly.',
          concepts: ['Central key management', 'Request normalisation across providers', 'Routing and fallbacks', 'Per-feature cost accounting'],
          quiz: [
            ['What does a gateway centralise?', 'Keys, retries, rate limits, logging, cost tracking and model routing.'],
            ['Why route through a gateway even with one provider?', 'To add logging, budgets and fallbacks in one place and to make provider changes painless.'],
          ],
          prereqs: ['Anatomy of an LLM application'],
        },
        {
          title: 'Orchestration layer design',
          description: 'The orchestration layer turns a user request into prompts, retrievals, tool calls and post-processing; keeping it as plain, testable functions with explicit inputs avoids the tangled chains that frameworks encourage.',
          concepts: ['Request to prompt pipeline', 'Composable steps as functions', 'Framework versus plain code', 'Testing orchestration in isolation'],
          quiz: [
            ['Why prefer plain functions over deep framework abstractions?', 'They are easier to test, debug and reason about when behaviour goes wrong.'],
            ['What inputs does an orchestration step need explicitly?', 'The user request, retrieved context, conversation state and configuration.'],
          ],
          prereqs: ['The LLM gateway pattern'],
        },
        {
          title: 'Storage for LLM features',
          description: 'Conversations, message metadata, prompt versions, tool results, embeddings and feedback each need a home; choosing relational tables for state, a vector store for retrieval and object storage for large artefacts keeps queries simple.',
          concepts: ['Conversation and message tables', 'Prompt version storage', 'Vector and artefact stores', 'Feedback and annotation storage'],
          quiz: [
            ['Where do prompt versions belong?', 'In version control or a prompt registry with ids, referenced from logs.'],
            ['Why store tool results with messages?', 'To replay a conversation exactly and to debug what the model saw.'],
          ],
          prereqs: ['Anatomy of an LLM application'],
        },
      ],
    },
    {
      title: 'SDKs and API Design',
      description: 'Calling models correctly and exposing AI features through your own API.',
      topics: [
        {
          title: 'Provider SDKs and the messages API',
          description: 'Every major provider exposes a messages endpoint with roles, a system prompt, tools and parameters such as temperature and max tokens; reading the response object properly, including stop reasons and usage, avoids subtle bugs.',
          concepts: ['System, user and assistant roles', 'Temperature and max tokens', 'Stop reasons', 'Usage and token accounting', 'Error types from the SDK'],
          quiz: [
            ['What does a stop reason of max_tokens mean?', 'The output was cut off; the answer is incomplete and may need continuation.'],
            ['Why read usage from every response?', 'To track cost and detect prompt growth.'],
          ],
          prereqs: ['The LLM gateway pattern'],
        },
        {
          title: 'Provider abstraction and model routing',
          description: 'A thin internal interface over providers lets you route easy requests to cheap models and hard ones to strong models, fail over during outages and run A/B tests; over-abstracting hides provider-specific features you will want.',
          concepts: ['Minimal provider interface', 'Routing by task difficulty', 'Failover between providers', 'Keeping provider-specific features reachable'],
          quiz: [
            ['Danger of a fully generic provider abstraction?', 'It hides features such as prompt caching or structured outputs that differ per provider.'],
            ['When does model routing pay off?', 'When most requests are simple and a smaller model handles them at a fraction of the cost.'],
          ],
          prereqs: ['Provider SDKs and the messages API'],
        },
        {
          title: 'Designing your own AI API endpoints',
          description: 'Endpoints for AI features should accept explicit inputs, return structured results with confidence and sources, support streaming and idempotency, and version the prompt behind them so clients can depend on stable behaviour.',
          concepts: ['Explicit request schemas', 'Structured responses with metadata', 'Idempotency keys for generation', 'Versioning behaviour behind an endpoint'],
          quiz: [
            ['Why return sources and confidence alongside the answer?', 'Clients can display them and decide when to trust or verify the result.'],
            ['What should a client send to safely retry a generation request?', 'An idempotency key so the server returns the same result instead of regenerating.'],
          ],
          prereqs: ['Provider abstraction and model routing'],
        },
        {
          title: 'Async and concurrency for model calls',
          description: 'Model calls are slow I/O, so async clients, bounded concurrency with semaphores and task groups keep throughput high without exhausting provider rate limits or your own connections.',
          concepts: ['Async provider clients', 'Semaphores for bounded concurrency', 'Fan-out and gather', 'Backpressure under load'],
          quiz: [
            ['Why bound concurrency with a semaphore?', 'Unlimited parallel calls hit rate limits and timeouts.'],
            ['What is the risk of sync calls in a web server?', 'Each call blocks a worker for seconds, collapsing throughput.'],
          ],
          prereqs: ['Provider SDKs and the messages API'],
        },
        {
          title: 'Token counting and context budgets',
          description: 'Counting tokens before a call with the provider tokenizer or count endpoint prevents overflow errors and surprise bills; each feature should have a fixed budget for system prompt, history, context and output.',
          concepts: ['Tokenizers and count endpoints', 'Budget per prompt section', 'Truncation strategies', 'Output token limits'],
          quiz: [
            ['What breaks when the prompt exceeds the context window?', 'The request fails or the provider truncates, silently dropping content.'],
            ['Which section should be trimmed first in a long chat?', 'Old conversation history, summarised or dropped.'],
          ],
          prereqs: ['Provider SDKs and the messages API'],
        },
      ],
    },
    {
      title: 'Structured Outputs and Streaming',
      description: 'Getting machine-readable results and showing them as they arrive.',
      topics: [
        {
          title: 'Structured outputs with JSON Schema',
          description: 'Asking for JSON that matches a schema, via provider structured-output modes or tool definitions, turns free text into typed data; Pydantic models generate the schema and validate the result in one step.',
          concepts: ['Schema-constrained generation', 'Pydantic models as schemas', 'Tool calls as an output channel', 'Enums and required fields'],
          quiz: [
            ['Two ways to get structured output from a model?', 'A provider JSON-schema mode or defining a tool whose arguments are the schema.'],
            ['Why use Pydantic for this?', 'It generates the JSON Schema and validates and parses the response into typed objects.'],
          ],
          prereqs: ['Designing your own AI API endpoints'],
        },
        {
          title: 'Validating and repairing model output',
          description: 'Even schema-guided outputs can violate business rules; validate every field, reject or retry with the validation error in the prompt, and fall back to safe defaults so malformed output never reaches users or databases.',
          concepts: ['Business-rule validation', 'Retry with error feedback', 'Safe defaults and rejection', 'Logging validation failures'],
          quiz: [
            ['What do you send back on a validation failure retry?', 'The original request plus the specific validation error so the model can fix it.'],
            ['Why log validation failures?', 'They reveal prompt weaknesses and schema gaps to fix systematically.'],
          ],
          prereqs: ['Structured outputs with JSON Schema'],
        },
        {
          title: 'Streaming responses from the server',
          description: 'Streaming tokens over server-sent events or WebSockets cuts perceived latency from seconds to milliseconds; the server must forward chunks as they arrive, handle client disconnects and still record the full completion.',
          concepts: ['Server-sent events', 'Chunk forwarding without buffering', 'Handling disconnects', 'Recording the complete response'],
          quiz: [
            ['Why is SSE the usual choice for streaming text?', 'It is one-way, works over plain HTTP and is simple for browsers to consume.'],
            ['What must the server do when the client disconnects mid-stream?', 'Cancel or finish the upstream call and still log usage and the partial result.'],
          ],
          prereqs: ['Designing your own AI API endpoints'],
        },
        {
          title: 'Streaming UIs and partial rendering',
          description: 'Rendering Markdown as it streams, showing tool-call status, a stop button and skeletons for pending parts make long generations feel responsive; naive re-rendering of the whole message on each token is a common performance bug.',
          concepts: ['Incremental Markdown rendering', 'Tool status indicators', 'Stop and regenerate controls', 'Efficient token appends'],
          quiz: [
            ['Why show tool-call status during streaming?', 'Users otherwise see a frozen interface while tools run.'],
            ['What performance mistake do streaming UIs make?', 'Re-parsing and re-rendering the entire message on every token.'],
          ],
          prereqs: ['Streaming responses from the server'],
        },
        {
          title: 'Streaming structured data and tool calls',
          description: 'Streamed JSON arrives as fragments, so partial parsers or field-by-field emission let the UI update forms progressively; tool-call streams need the arguments assembled before execution.',
          concepts: ['Partial JSON parsing', 'Field-level progressive updates', 'Assembling streamed tool arguments', 'Event types in a stream'],
          quiz: [
            ['Can you parse a streamed JSON object before it finishes?', 'Only with a partial or incremental parser that tolerates incomplete input.'],
            ['When do you execute a streamed tool call?', 'After the arguments are complete and validated.'],
          ],
          prereqs: ['Streaming responses from the server', 'Structured outputs with JSON Schema'],
        },
      ],
    },
    {
      title: 'Conversation State and Memory',
      description: 'Keeping multi-turn interactions coherent, bounded and personal.',
      topics: [
        {
          title: 'Conversation state management',
          description: 'The server owns the canonical message list with roles, tool calls and metadata, keyed by conversation id; clients send only the new message, which prevents tampering and keeps history consistent across devices.',
          concepts: ['Server-owned message history', 'Conversation identifiers', 'Message metadata and ordering', 'Editing and branching turns'],
          quiz: [
            ['Why not let the client send the full history each turn?', 'It can be tampered with, grows unbounded and diverges between devices.'],
            ['What metadata should a stored message carry?', 'Role, timestamp, model, token counts and any tool calls or sources.'],
          ],
          prereqs: ['Storage for LLM features'],
        },
        {
          title: 'Summarisation and context windows',
          description: 'Long conversations exceed the context window, so older turns are summarised into a running memory while recent turns stay verbatim; the summary must preserve decisions, entities and open questions.',
          concepts: ['Rolling summaries of old turns', 'Keeping recent turns verbatim', 'What a summary must preserve', 'Triggering compaction'],
          quiz: [
            ['What must survive a conversation summary?', 'Decisions, named entities, constraints and unresolved questions.'],
            ['When should compaction trigger?', 'At a token threshold well below the context limit, leaving room for context and output.'],
          ],
          prereqs: ['Conversation state management', 'Token counting and context budgets'],
        },
        {
          title: 'User memory and personalisation',
          description: 'Storing durable facts about a user, such as preferences and past goals, and injecting the relevant ones per request makes assistants feel continuous; it needs consent, editability and rules about what is remembered.',
          concepts: ['Extracting durable facts', 'Selective injection per request', 'User control over memory', 'Consent and transparency'],
          quiz: [
            ['Why let users view and delete memories?', 'Trust and privacy law both require control over stored personal data.'],
            ['Should every message create a memory?', 'No; only durable, useful facts should be extracted and stored.'],
          ],
          prereqs: ['Summarisation and context windows'],
        },
        {
          title: 'Sessions across devices and resumption',
          description: 'Users switch between phone and laptop and expect the same conversation, so state must be persisted server-side, streamed generations must be resumable and concurrent edits handled without corrupting history.',
          concepts: ['Persisting in-flight generations', 'Resuming an interrupted stream', 'Concurrency on one conversation', 'Sync and conflict handling'],
          quiz: [
            ['How can a client resume a generation after a page reload?', 'The server keeps the in-flight result and lets the client re-subscribe by id.'],
            ['What prevents two tabs corrupting one conversation?', 'Optimistic locking or a per-conversation queue on the server.'],
          ],
          prereqs: ['Conversation state management'],
        },
      ],
    },
    {
      title: 'Retrieval and Tool Integration',
      description: 'Connecting the model to your data and your systems.',
      topics: [
        {
          title: 'RAG integration in an application',
          description: 'From the app\'s perspective, retrieval is a step that returns passages with sources before the model call; the interface, caching, citations in responses and evaluation hooks matter more than the retriever internals covered in the RAG track.',
          concepts: ['Retrieval as an orchestration step', 'Source metadata through to the UI', 'Retrieval caching in the app', 'Hooks for retrieval evaluation'],
          quiz: [
            ['What must the retrieval step return besides text?', 'Source identifiers and metadata for citations and logging.'],
            ['Where should retrieval live in the architecture?', 'In the orchestration layer, behind an interface the rest of the app calls.'],
          ],
          prereqs: ['Orchestration layer design'],
        },
        {
          title: 'Tool integration and function calling in apps',
          description: 'Exposing internal APIs as tools with strict schemas, executing them server-side with the user\'s permissions and returning trimmed results lets the model act on real data; the app, not the model, remains responsible for what runs.',
          concepts: ['Wrapping internal APIs as tools', 'Server-side execution under user permissions', 'Trimming tool results', 'Tool result rendering in the UI'],
          quiz: [
            ['Whose permissions should a tool call run under?', 'The authenticated user\'s, enforced by the application.'],
            ['Why trim tool results before returning them to the model?', 'Large payloads waste tokens and distract the model.'],
          ],
          prereqs: ['Structured outputs with JSON Schema'],
        },
        {
          title: 'Tool safety and confirmation flows',
          description: 'Read-only tools can run freely, but writes such as booking, paying or deleting need confirmation UI, allow-lists and audit logs; the model proposes, the user or policy approves, and the app executes.',
          concepts: ['Read versus write tool classes', 'Confirmation before writes', 'Allow-lists per feature', 'Auditing tool executions'],
          quiz: [
            ['Which tool calls need user confirmation?', 'Those with side effects that are costly or hard to reverse.'],
            ['What goes in the audit log?', 'Who, what tool, what arguments, the result and whether it was approved.'],
          ],
          prereqs: ['Tool integration and function calling in apps'],
        },
        {
          title: 'Lightweight agentic features',
          description: 'Many products need a bounded loop, such as "search, then answer" or "draft, check, revise", rather than a full agent; implementing these as small explicit loops with step limits keeps them predictable and cheap.',
          concepts: ['Bounded multi-step loops', 'Explicit step limits', 'Fallback to single-step answers', 'When to graduate to an agent framework'],
          quiz: [
            ['What is a bounded agentic loop?', 'A short, explicit sequence of model and tool steps with a hard limit.'],
            ['When is a full agent framework justified?', 'When the sequence of steps genuinely cannot be fixed in advance.'],
          ],
          prereqs: ['Tool safety and confirmation flows'],
        },
      ],
    },
    {
      title: 'Reliability, Cost and Performance',
      description: 'Keeping the feature fast, affordable and up when providers are not.',
      topics: [
        {
          title: 'Caching strategies for LLM calls',
          description: 'Exact-match caches for deterministic prompts, provider prompt caching for long stable prefixes and semantic caches for paraphrased queries each cut cost and latency; each has invalidation and correctness rules.',
          concepts: ['Exact-match response cache', 'Provider prompt caching', 'Semantic caching', 'Cache invalidation and staleness'],
          quiz: [
            ['What does provider prompt caching save?', 'Processing of a repeated prompt prefix such as a long system prompt or document.'],
            ['Risk of semantic caching?', 'Returning an answer for a question that is similar but not the same.'],
          ],
          prereqs: ['Token counting and context budgets'],
        },
        {
          title: 'Cost control and budgets',
          description: 'Cost is tokens times price per model, multiplied by retries and tool loops; tracking cost per request and per feature, setting budgets per user or tenant and routing to cheaper models keep the bill predictable.',
          concepts: ['Cost per request calculation', 'Budgets per user and tenant', 'Cheaper models for simple tasks', 'Alerting on cost anomalies'],
          quiz: [
            ['What multiplies LLM cost unexpectedly?', 'Retries, tool loops and growing conversation history.'],
            ['How do you enforce a per-tenant budget?', 'Meter tokens per tenant and reject or downgrade requests past the limit.'],
          ],
          prereqs: ['Caching strategies for LLM calls'],
        },
        {
          title: 'Rate limiting and backpressure',
          description: 'Providers limit requests and tokens per minute, and your own users can flood you; client-side token buckets, queues with fair scheduling and clear 429 responses keep the system stable instead of cascading failures.',
          concepts: ['Provider RPM and TPM limits', 'Token bucket rate limiting', 'Queues and fair scheduling', 'Returning 429 with retry hints'],
          quiz: [
            ['What are the two dimensions of provider rate limits?', 'Requests per minute and tokens per minute.'],
            ['Why queue instead of rejecting under load?', 'Short bursts are absorbed and users get results with a delay rather than errors.'],
          ],
          prereqs: ['Async and concurrency for model calls'],
        },
        {
          title: 'Retries, timeouts and fallbacks',
          description: 'Model calls fail with rate limits, overloads and timeouts; exponential backoff with jitter, sensible per-call timeouts, circuit breakers and a fallback model or cached response turn provider incidents into degraded rather than broken service.',
          concepts: ['Backoff with jitter', 'Per-call timeouts', 'Circuit breakers', 'Fallback models and responses'],
          quiz: [
            ['Which errors should be retried?', 'Rate limits, overloads and network timeouts, not validation or auth errors.'],
            ['What does a circuit breaker do?', 'Stops calling a failing provider for a period so the system fails fast and recovers.'],
          ],
          prereqs: ['Rate limiting and backpressure'],
        },
        {
          title: 'Latency optimisation',
          description: 'Time to first token, output length, model size and sequential steps dominate latency; streaming, shorter prompts and outputs, smaller models for simple work and parallel steps are the levers, measured at p95 not average.',
          concepts: ['Time to first token', 'Output length as a latency lever', 'Parallelising independent steps', 'Measuring p95 latency'],
          quiz: [
            ['What most affects total generation time?', 'The number of output tokens, since generation is sequential.'],
            ['Why measure p95 rather than average latency?', 'Averages hide the slow tail that users actually complain about.'],
          ],
          prereqs: ['Retries, timeouts and fallbacks'],
        },
      ],
    },
    {
      title: 'Observability and Testing',
      description: 'Knowing what the model was asked, what it said and whether it is getting better.',
      topics: [
        {
          title: 'Logging prompts and completions',
          description: 'Store the full rendered prompt, model, parameters, completion, token usage, latency and a prompt version id for every call, with PII redaction; these logs are the raw material for debugging, evals and cost analysis.',
          concepts: ['Full prompt and completion capture', 'Prompt version identifiers', 'Redaction before storage', 'Retention and access controls'],
          quiz: [
            ['Why log the rendered prompt rather than the template?', 'Only the rendered prompt shows exactly what the model saw.'],
            ['What links a log entry to the code that produced it?', 'A prompt version id or hash stored with the entry.'],
          ],
          prereqs: ['Storage for LLM features'],
        },
        {
          title: 'Tracing and metrics for LLM features',
          description: 'Traces tie retrieval, model calls and tools into one request timeline; metrics such as latency, token usage, error rate, cost and validation failures per feature reveal regressions before users report them.',
          concepts: ['Request-level traces', 'Per-feature metrics', 'Dashboards and alerts', 'Correlating cost with usage'],
          quiz: [
            ['Name three metrics worth alerting on.', 'Error rate, p95 latency and cost per request.'],
            ['What does a trace add over logs?', 'The causal timeline of all steps in one request.'],
          ],
          prereqs: ['Logging prompts and completions'],
        },
        {
          title: 'Testing LLM features',
          description: 'Deterministic code around the model gets unit tests; the model behaviour gets evals on a fixed dataset with rubrics or judges; contract tests check schemas; each catches a different class of regression.',
          concepts: ['Unit tests around the model call', 'Eval datasets for behaviour', 'Schema contract tests', 'Thresholds instead of exact assertions'],
          quiz: [
            ['Why can\'t you assert exact model output in tests?', 'Outputs vary; tests should check structure, constraints or a scored threshold.'],
            ['What does a contract test check?', 'That the output conforms to the expected schema and business rules.'],
          ],
          prereqs: ['Validating and repairing model output'],
        },
        {
          title: 'Mocking and recording model calls',
          description: 'Recording real responses once and replaying them in tests makes suites fast, cheap and deterministic; mocks cover error paths such as timeouts and malformed output that are hard to trigger on demand.',
          concepts: ['Record and replay fixtures', 'Mocking error scenarios', 'Keeping fixtures fresh', 'Live smoke tests'],
          quiz: [
            ['Why replay recorded responses in CI?', 'Speed, zero cost and deterministic results.'],
            ['What do mocks let you test that recordings do not?', 'Failure paths such as rate limits, timeouts and invalid JSON.'],
          ],
          prereqs: ['Testing LLM features'],
        },
        {
          title: 'Feedback loops and continuous improvement',
          description: 'Thumbs up and down, edits to generated text and follow-up behaviour are signals; capturing them with the trace id, mining them for failure cases and feeding those into eval datasets closes the loop.',
          concepts: ['Capturing explicit feedback', 'Implicit signals from behaviour', 'Mining failures into datasets', 'Prioritising fixes by impact'],
          quiz: [
            ['Why attach feedback to a trace id?', 'So you can see exactly what prompt and context produced the rated answer.'],
            ['Give an implicit negative signal.', 'The user rephrases the question immediately or abandons the session.'],
          ],
          prereqs: ['Tracing and metrics for LLM features'],
        },
      ],
    },
    {
      title: 'Safety, Privacy and Compliance',
      description: 'Protecting users and the business from what the model might say or leak.',
      topics: [
        {
          title: 'Guardrails and content filtering',
          description: 'Input classifiers catch abuse and off-topic requests, output checks catch harmful or off-brand content, and topic restrictions keep an assistant on task; guardrails run alongside the model and fail closed on high-risk categories.',
          concepts: ['Input classification', 'Output moderation checks', 'Topic and scope restrictions', 'Fail-closed policies'],
          quiz: [
            ['What does fail closed mean for a guardrail?', 'If the check cannot run or is uncertain, block the response.'],
            ['Why check outputs and not just inputs?', 'Harmless inputs can still produce harmful or off-policy outputs.'],
          ],
          prereqs: ['Orchestration layer design'],
        },
        {
          title: 'Prompt injection defence in applications',
          description: 'User text, retrieved documents and tool results can carry instructions; separating instructions from data, limiting tool privileges, sanitising outputs that become HTML or commands and detecting known patterns reduce the impact.',
          concepts: ['Instruction and data separation', 'Privilege limits on tools', 'Output sanitisation', 'Injection detection'],
          quiz: [
            ['Can prompt injection be fully prevented by prompting?', 'No; it must be limited structurally through privileges and data handling.'],
            ['Why sanitise model output rendered as HTML?', 'The model can emit scripts or links that become cross-site scripting.'],
          ],
          prereqs: ['Guardrails and content filtering'],
        },
        {
          title: 'PII handling and redaction',
          description: 'Personal data in prompts must be minimised, redacted or tokenised before it reaches a provider or a log, with re-identification only where necessary; this is both a privacy requirement and a data breach risk reducer.',
          concepts: ['PII detection in text', 'Redaction and tokenisation', 'Minimising data sent to providers', 'Re-identification controls'],
          quiz: [
            ['What is tokenisation of PII?', 'Replacing values with placeholders that can be mapped back only by your system.'],
            ['Should PII appear in prompt logs?', 'No; redact before logging or restrict access tightly.'],
          ],
          prereqs: ['Logging prompts and completions'],
        },
        {
          title: 'Data retention, residency and compliance',
          description: 'Provider data-use terms, regional hosting, retention periods for logs and conversations and user deletion requests must be designed in; zero-retention API options and data processing agreements are part of the architecture.',
          concepts: ['Provider data-use terms', 'Regional hosting choices', 'Retention and deletion policies', 'Handling deletion requests'],
          quiz: [
            ['What should you check in a provider\'s terms before sending customer data?', 'Whether it is retained or used for training and where it is processed.'],
            ['How do you honour a deletion request?', 'Delete conversations, logs and embeddings for the user across all stores.'],
          ],
          prereqs: ['PII handling and redaction'],
        },
      ],
    },
    {
      title: 'Deployment and Product Patterns',
      description: 'Getting features live safely and the shapes they usually take.',
      topics: [
        {
          title: 'Deploying and scaling LLM services',
          description: 'LLM endpoints are I/O bound with long requests, so async workers, streaming-friendly load balancers, generous timeouts, horizontal scaling and health checks that do not call the model are the deployment baseline.',
          concepts: ['Async workers and long requests', 'Load balancer streaming support', 'Horizontal scaling', 'Health checks and readiness'],
          quiz: [
            ['Why should a health check not call the model?', 'It would be slow, costly and fail on provider hiccups, causing false restarts.'],
            ['What load balancer setting matters for streaming?', 'Response buffering must be off and idle timeouts long enough.'],
          ],
          prereqs: ['Latency optimisation'],
        },
        {
          title: 'Prompt versioning and gradual rollout',
          description: 'Prompts are code: version them, ship behind feature flags, roll out to a percentage of traffic, compare metrics and roll back on regression; silent prompt edits in production are the most common cause of quality incidents.',
          concepts: ['Prompts under version control', 'Feature flags for prompt variants', 'Percentage rollouts', 'Rollback on regression'],
          quiz: [
            ['Why treat prompts as code?', 'Changes alter behaviour and need review, versioning and rollback like any deploy.'],
            ['What do you compare during a rollout?', 'Quality metrics, cost and latency between the old and new variants.'],
          ],
          prereqs: ['Deploying and scaling LLM services', 'Feedback loops and continuous improvement'],
        },
        {
          title: 'The chat assistant pattern',
          description: 'Open-ended chat needs history management, streaming, scope guardrails, source display and an escape hatch to humans; its hardest problems are keeping it on task and measuring whether it helps.',
          concepts: ['Scope definition', 'History plus streaming', 'Hand-off to a human', 'Measuring helpfulness'],
          quiz: [
            ['What is the hardest product problem with open chat?', 'Keeping it on task and proving it helps rather than merely answering.'],
            ['When should a chat assistant hand off?', 'When it is uncertain, the user is frustrated or the request needs authority it lacks.'],
          ],
          prereqs: ['Sessions across devices and resumption'],
        },
        {
          title: 'The copilot pattern',
          description: 'Copilots sit inside an existing workflow, suggest the next action or text in context and let the user accept, edit or ignore; latency, relevance of context and non-intrusive UI matter more than raw model power.',
          concepts: ['In-context suggestions', 'Accept, edit or ignore interactions', 'Gathering workflow context', 'Latency targets for suggestions'],
          quiz: [
            ['Why is latency critical for a copilot?', 'Suggestions slower than the user\'s own pace get ignored.'],
            ['What context makes a copilot useful?', 'The user\'s current document, selection and recent actions.'],
          ],
          prereqs: ['Streaming UIs and partial rendering'],
        },
        {
          title: 'The extraction pattern',
          description: 'Turning documents, emails or forms into structured records with schemas, validation, confidence and human review for low-confidence fields is one of the highest-value, most measurable LLM features.',
          concepts: ['Schema design for extraction', 'Confidence per field', 'Human review queues', 'Measuring field-level accuracy'],
          quiz: [
            ['How do you measure an extraction feature?', 'Field-level precision and recall against labelled documents.'],
            ['What happens to low-confidence fields?', 'They go to a human review queue instead of straight into the database.'],
          ],
          prereqs: ['Validating and repairing model output'],
        },
        {
          title: 'The summarisation pattern',
          description: 'Summaries of meetings, threads and documents need a defined audience, length and structure, chunking for long inputs with map-reduce or refinement, and checks for omitted facts and invented ones.',
          concepts: ['Audience and format specification', 'Map-reduce over long inputs', 'Refine-style summarisation', 'Checking for omissions and inventions'],
          quiz: [
            ['How do you summarise a document longer than the context?', 'Summarise chunks and then combine the summaries, or refine iteratively.'],
            ['What is the main quality risk in summaries?', 'Invented details and dropped key facts.'],
          ],
          prereqs: ['Token counting and context budgets'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: AI chatbot with streaming and memory',
          description: 'Build a FastAPI chat service with server-owned conversation state, SSE streaming, rolling summaries for long chats, a scope guardrail, prompt logging with redaction and a small web UI that renders Markdown as it streams.',
          concepts: ['Conversation store and API', 'Stream with SSE', 'Summarise long histories', 'Guardrail and logging'],
          quiz: [
            ['Where is the conversation history stored?', 'Server-side, keyed by conversation id, never trusted from the client.'],
            ['What triggers summarisation?', 'History exceeding a token threshold below the context limit.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: document Q&A application',
          description: 'A web app where users upload documents, ask questions and get streamed answers with citations; include a retrieval step behind an interface, a response cache, feedback buttons tied to trace ids and an eval dataset from real questions.',
          concepts: ['Upload and index documents', 'Retrieval behind an interface', 'Answer with citations and cache', 'Feedback into an eval set'],
          quiz: [
            ['Why capture feedback with the trace id?', 'To reproduce the exact prompt and context behind a bad answer.'],
            ['What should be cached?', 'Query embeddings and repeated question-answer pairs, keyed per user or tenant.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: AI customer-support workflow',
          description: 'Classify incoming tickets, draft replies grounded in a help centre, extract structured fields for the CRM, route low-confidence cases to a human queue and confirm any account action before it runs; measure deflection and accuracy.',
          concepts: ['Classification and routing', 'Grounded draft replies', 'Structured extraction to CRM', 'Confirmation and review queues'],
          quiz: [
            ['What decides whether a ticket goes to a human?', 'Low classifier confidence, sensitive categories or failed validation.'],
            ['Which action needs confirmation?', 'Any write to the customer account, such as a refund or plan change.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: production AI API',
          description: 'Ship a versioned generation endpoint behind an internal gateway with structured outputs, idempotency keys, rate limiting, retries with fallbacks, cost metering per tenant, tracing, recorded-response tests and a documented rollout plan.',
          concepts: ['Gateway with routing and fallbacks', 'Versioned structured endpoint', 'Rate limits and cost metering', 'Tests, tracing and rollout'],
          quiz: [
            ['How does a client safely retry?', 'By resending with the same idempotency key.'],
            ['What does the gateway log per call?', 'Prompt version, model, tokens, latency, cost and outcome.'],
          ],
          style: 'project',
        },
        {
          title: 'LLM application interview questions',
          description: 'Common questions: how you would structure an LLM service, getting reliable JSON, streaming design, managing context and cost, handling provider outages, testing non-deterministic features, prompt injection and PII.',
          concepts: ['Architecture questions', 'Reliability and cost questions', 'Testing and evaluation questions', 'Safety and privacy questions'],
          quiz: [
            ['How do you get reliable structured output?', 'Schema-constrained generation with Pydantic validation and retry on error.'],
            ['What happens in your design when the provider is down?', 'Circuit breaker opens, requests fail over to a fallback model or cached response.'],
          ],
          style: 'reading',
        },
        {
          title: 'LLM application design exercise',
          description: 'Design an AI writing assistant inside an email product for 5 million users: suggestions under 500 ms, per-user memory, strict PII rules, a 0.1 dollar per user monthly budget and safe rollout; specify the architecture, caching, guardrails and evaluation plan.',
          concepts: ['Latency and cost budget design', 'Privacy-first data flow', 'Caching and model routing choices', 'Evaluation and rollout strategy'],
          quiz: [
            ['How do you hit 500 ms for suggestions?', 'Small fast models, short prompts, prefix caching and streaming the first tokens.'],
            ['How is the budget enforced?', 'Per-user metering with routing to cheaper models and suggestion throttling near the cap.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
