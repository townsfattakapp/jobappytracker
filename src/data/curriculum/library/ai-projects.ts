import { defineTrack } from '../define'

export const aiProjects = defineTrack({
  id: 'track-ai-projects',
  title: 'AI Engineering Projects',
  description: 'A portfolio of buildable AI systems: chatbots, document Q&A, RAG assistants, coding and support agents, tool-using agents, evaluation dashboards, production AI APIs, fine-tuning, captioning and voice, each specified with what it must do and the steps to build it.',
  family: 'AI & Generative AI',
  kind: 'projects',
  icon: '🧪',
  tags: ['ai projects', 'portfolio', 'rag', 'agents', 'chatbot', 'evaluation', 'fine-tuning', 'llm apps'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-llm-apps'],
  style: 'project',
  categories: [
    {
      title: 'Conversational',
      description: 'Assistants that hold a conversation and get something done.',
      topics: [
        {
          title: 'AI chatbot with memory',
          description: 'Build a chat application with streaming responses, a persistent conversation store, a summarised long-term memory that survives context limits, and a system prompt with a defined persona. It must resume any past conversation and stay under the token budget.',
          concepts: ['Design the message schema and store', 'Stream responses over SSE', 'Implement rolling summary memory', 'Enforce token budgets per turn', 'Test persona and memory recall'],
          quiz: [
            ['How do you keep a long chat within the context window?', 'Summarise older turns into a memory block and keep only recent turns verbatim.'],
            ['What must be stored to resume a conversation?', 'The full message history plus the current memory summary.'],
          ],
        },
        {
          title: 'AI customer-support workflow',
          description: 'Build a support assistant that classifies incoming tickets, answers from a policy knowledge base with citations, drafts replies for agent approval, and escalates to a human when confidence is low or the topic is sensitive. It must never invent policy.',
          concepts: ['Ticket intake and classification', 'Grounded answers from the policy base', 'Draft-and-approve reply flow', 'Escalation rules and confidence', 'Measure deflection and accuracy'],
          quiz: [
            ['Why draft rather than send replies automatically?', 'A human approval step catches wrong or risky answers before customers see them.'],
            ['When must the assistant escalate?', 'Low retrieval confidence, refund or legal topics, or an angry customer signal.'],
          ],
        },
        {
          title: 'Voice assistant',
          description: 'Build a voice loop with speech-to-text, an LLM turn and text-to-speech, supporting barge-in and short-latency responses. It must transcribe accurately in noisy audio, answer within two seconds on typical prompts and read back long answers in chunks.',
          concepts: ['Capture audio and transcribe with Whisper', 'LLM turn with streaming', 'Text-to-speech in chunks', 'Handle barge-in and interruptions', 'Measure end-to-end latency'],
          quiz: [
            ['How do you reduce time to first spoken word?', 'Stream the LLM output and start synthesising the first sentence immediately.'],
            ['What is barge-in?', 'The user speaking over the assistant, which should stop playback and listen.'],
          ],
        },
        {
          title: 'Meeting summariser',
          description: 'Build a tool that takes a meeting recording or transcript, diarises speakers, produces a structured summary with decisions and action items with owners, and exports to markdown and a task tracker. It must handle hour-long inputs by chunking.',
          concepts: ['Transcribe and diarise speakers', 'Chunk and map-reduce summarise', 'Extract decisions and action items', 'Export to markdown and a tracker', 'Evaluate against human summaries'],
          quiz: [
            ['Why map-reduce for long transcripts?', 'The transcript exceeds the context window; summarise chunks, then combine.'],
            ['What is the risk in action item extraction?', 'Hallucinated owners or tasks; require quotes as evidence for each item.'],
          ],
        },
        {
          title: 'Email drafting assistant with tone control',
          description: 'Build an assistant that drafts replies to incoming emails using thread context, a tone selector and the user\'s past writing style, with a one-click edit loop. It must keep facts from the thread accurate and never send without confirmation.',
          concepts: ['Parse threads and extract context', 'Style examples from past emails', 'Tone-controlled generation', 'Edit and regenerate loop', 'Fact checks against the thread'],
          quiz: [
            ['How do you match a user\'s writing style?', 'Few-shot examples of their past emails in the prompt, or a light fine-tune.'],
            ['Why show the source thread facts next to the draft?', 'So the user can verify the draft did not alter dates, names or amounts.'],
          ],
        },
      ],
    },
    {
      title: 'Retrieval',
      description: 'Systems that answer from your data rather than the model\'s memory.',
      topics: [
        {
          title: 'Document Q&A application',
          description: 'Build an app where a user uploads PDFs and asks questions answered with page-level citations. It must parse text and tables, chunk sensibly, retrieve relevant passages, refuse when the answer is not in the documents, and show the cited page.',
          concepts: ['Parse PDFs including tables', 'Chunk with overlap and metadata', 'Embed and index chunks', 'Answer with page citations', 'Refuse when unsupported'],
          quiz: [
            ['Why store page numbers in chunk metadata?', 'To cite and display the exact source page for each answer.'],
            ['How do you make the model refuse gracefully?', 'Instruct it to answer only from context and test with unanswerable questions.'],
          ],
        },
        {
          title: 'RAG knowledge assistant',
          description: 'Build a multi-source assistant over a wiki, tickets and code docs with hybrid search, reranking, freshness-aware indexing and per-user access control. It must respect document permissions, update the index on change and report retrieval quality metrics.',
          concepts: ['Ingest connectors for several sources', 'Hybrid search with reranking', 'Permission-aware retrieval', 'Incremental index updates', 'Retrieval quality evaluation'],
          quiz: [
            ['Why combine keyword and vector search?', 'Vectors miss exact identifiers and keywords miss paraphrases; hybrid covers both.'],
            ['How do you enforce document permissions in RAG?', 'Filter retrieval by the user\'s allowed document ids before ranking.'],
          ],
          prereqs: ['Document Q&A application'],
        },
        {
          title: 'Semantic search over a codebase',
          description: 'Build a code search tool that indexes a repository by function and class with AST-aware chunking, answers natural-language questions with file and line references, and re-indexes on commit. It must return the right symbol for questions like "where is auth validated".',
          concepts: ['AST-aware chunking by symbol', 'Code embeddings and indexing', 'Query to file and line references', 'Re-index on commit hook', 'Evaluate on a question set'],
          quiz: [
            ['Why chunk code by symbol rather than by lines?', 'Functions and classes are coherent units; arbitrary line windows split logic.'],
            ['How do you measure search quality?', 'A set of questions with known target files, scored by recall at k.'],
          ],
        },
        {
          title: 'Structured-data extractor',
          description: 'Build a service that turns invoices, résumés or contracts into validated JSON with a fixed schema, confidence per field and a human review queue for low-confidence documents. It must reject documents that do not match the schema instead of guessing.',
          concepts: ['Define the schema with Pydantic', 'Extract with structured output', 'Per-field confidence and validation', 'Review queue for low confidence', 'Accuracy per field on a test set'],
          quiz: [
            ['How do you force schema-shaped output?', 'Structured output or function calling with the schema, validated with Pydantic.'],
            ['What goes to the review queue?', 'Documents with failed validation or fields below the confidence threshold.'],
          ],
        },
        {
          title: 'Natural-language questions over a SQL database',
          description: 'Build a text-to-SQL assistant with schema-aware prompting, read-only execution, query explanation and result charts. It must only run SELECTs, handle ambiguous questions by asking, and pass a test set of questions with known answers.',
          concepts: ['Schema and example queries in the prompt', 'Read-only execution sandbox', 'Clarify ambiguous questions', 'Explain and chart results', 'Test set of questions and answers'],
          quiz: [
            ['How do you prevent destructive queries?', 'A read-only database role plus a SQL parser that rejects anything but SELECT.'],
            ['What helps most with wrong-table errors?', 'Including table descriptions and sample rows in the prompt.'],
          ],
        },
      ],
    },
    {
      title: 'Agents',
      description: 'Systems that plan, call tools and act, with the controls that make that safe.',
      topics: [
        {
          title: 'Multi-step tool-using agent',
          description: 'Build an agent that plans and executes multi-step tasks with tools for search, calculator, calendar and email, with a step limit, tool-call logging and approval for consequential actions. It must complete a benchmark of ten tasks and never send email without confirmation.',
          concepts: ['Define tools with schemas', 'Planning and execution loop', 'Step limits and loop detection', 'Approval gate for side effects', 'Task benchmark and tracing'],
          quiz: [
            ['Why cap the number of steps?', 'To stop runaway loops that burn tokens and money.'],
            ['What should every tool call log?', 'Tool name, arguments, result summary, latency and the step number.'],
          ],
        },
        {
          title: 'AI coding assistant',
          description: 'Build a CLI assistant that reads a repository, proposes a change for a described task, runs the test suite in a sandbox and iterates until tests pass, producing a diff for review. It must never modify files outside the repo and must show its diff before applying.',
          concepts: ['Repository context retrieval', 'Generate a patch as a diff', 'Run tests in a sandbox', 'Iterate on failures', 'Review and apply flow'],
          quiz: [
            ['Why generate diffs rather than whole files?', 'Diffs are reviewable, smaller and less likely to clobber unrelated code.'],
            ['What limits the sandbox?', 'No network, the repo directory only, and a time limit per test run.'],
          ],
        },
        {
          title: 'Research agent with web browsing',
          description: 'Build an agent that answers a research question by searching, reading pages, taking notes and writing a cited report. It must track sources per claim, stop within a budget, and resist instructions found on web pages.',
          concepts: ['Search and fetch tools', 'Note-taking and source tracking', 'Budgeted iteration', 'Cited report generation', 'Injection resistance tests'],
          quiz: [
            ['How do you attach citations to claims?', 'Keep a notes store keyed by source URL and require each claim to reference one.'],
            ['Why test with pages containing hidden instructions?', 'Web content is untrusted; the agent must not follow instructions embedded in it.'],
          ],
          prereqs: ['Multi-step tool-using agent'],
        },
        {
          title: 'Data analysis agent',
          description: 'Build an agent that answers questions about a CSV or database by writing and running pandas code in a sandbox, producing tables and charts with an explanation. It must show the code it ran and recover from its own errors.',
          concepts: ['Load data and profile the schema', 'Generate and run pandas code safely', 'Error recovery loop', 'Charts and explanations', 'Show code for transparency'],
          quiz: [
            ['Why show the executed code to the user?', 'They can verify the analysis rather than trusting a number.'],
            ['How does the agent recover from a traceback?', 'The error is fed back and the code regenerated, with a retry limit.'],
          ],
          prereqs: ['Multi-step tool-using agent'],
        },
        {
          title: 'Workflow automation agent',
          description: 'Build an agent that triages an inbox or queue: classifies items, extracts fields, creates tickets or calendar entries through APIs, and drafts responses, with a dry-run mode and an audit log. It must be idempotent on re-runs.',
          concepts: ['Trigger and intake design', 'Classify and extract fields', 'Idempotent API actions', 'Dry-run and audit log', 'Monitor accuracy over time'],
          quiz: [
            ['What makes an automation idempotent?', 'Deduplication keys so re-processing an item does not create duplicate tickets.'],
            ['Why start in dry-run mode?', 'To review what the agent would do before letting it act.'],
          ],
          prereqs: ['Multi-step tool-using agent'],
        },
      ],
    },
    {
      title: 'Multimodal and Model Training',
      description: 'Projects that go beyond text prompts into images, audio and training your own weights.',
      topics: [
        {
          title: 'Image captioning service',
          description: 'Build an API that accepts an image and returns a caption and alt text using a vision-language model, with batching, size limits and caching by image hash. It must produce captions under a fixed length and flag images it cannot describe.',
          concepts: ['Vision-language model selection', 'Image validation and resizing', 'Batching and hash-based caching', 'Length and safety constraints', 'Caption quality evaluation'],
          quiz: [
            ['Why cache by image hash?', 'Identical uploads get the same caption without a second model call.'],
            ['How do you evaluate captions?', 'Human rating on a sample plus automatic metrics like CIDEr against references.'],
          ],
        },
        {
          title: 'Fine-tuning a small language model',
          description: 'Fine-tune a small open model with LoRA on a task-specific dataset such as support replies or SQL generation, evaluate against the base model and a hosted model, and serve the adapter. It must beat the base on the target eval without degrading safety refusals.',
          concepts: ['Build and clean the training set', 'LoRA fine-tuning run', 'Base versus tuned evaluation', 'Safety regression check', 'Serve the adapter'],
          quiz: [
            ['Why LoRA instead of full fine-tuning?', 'Far less memory and a small adapter artefact, with comparable quality for narrow tasks.'],
            ['What must the evaluation include besides task accuracy?', 'Refusal behaviour and general capability checks to catch regressions.'],
          ],
        },
        {
          title: 'Fine-tuning an embedding model for domain search',
          description: 'Improve retrieval on domain text by fine-tuning a sentence-embedding model on query-passage pairs mined from logs or generated synthetically. It must lift recall at k on a held-out set and be swapped into an existing RAG index.',
          concepts: ['Mine or generate training pairs', 'Contrastive fine-tuning', 'Recall at k evaluation', 'Re-index with the new model', 'Compare in the RAG app'],
          quiz: [
            ['Where do training pairs come from?', 'Click logs, labelled questions, or LLM-generated questions per passage.'],
            ['Why must the whole index be rebuilt?', 'Embeddings from different models are not comparable.'],
          ],
        },
        {
          title: 'Receipt and form parser with a vision model',
          description: 'Build a pipeline that extracts line items, totals and dates from photographed receipts using a vision model plus validation rules, with a correction UI. It must reconcile line items to the total and flag mismatches.',
          concepts: ['Image preprocessing and orientation', 'Vision model extraction to schema', 'Arithmetic reconciliation rules', 'Correction interface', 'Accuracy on a labelled set'],
          quiz: [
            ['What catches most extraction errors cheaply?', 'Checking that line items sum to the extracted total.'],
            ['Why keep a correction UI?', 'Corrections fix records and become training or evaluation data.'],
          ],
        },
        {
          title: 'Podcast transcription and chaptering',
          description: 'Build a pipeline that transcribes long audio, detects topic boundaries, generates chapter titles and a searchable transcript with timestamps. It must process a two-hour episode within a set budget and produce accurate timestamps.',
          concepts: ['Chunked transcription with timestamps', 'Topic boundary detection', 'Chapter title generation', 'Searchable transcript index', 'Cost and time budget'],
          quiz: [
            ['How do you keep timestamps accurate across chunks?', 'Track each chunk\'s offset and add it to segment times.'],
            ['What signals a topic boundary?', 'A drop in embedding similarity between consecutive transcript windows.'],
          ],
        },
      ],
    },
    {
      title: 'Evaluation and Ops',
      description: 'The projects that make the others trustworthy and shippable.',
      topics: [
        {
          title: 'Model evaluation dashboard',
          description: 'Build a dashboard that runs a golden set against several models and prompt versions, scores with rubrics and judges, stores results, and shows quality, cost and latency side by side with drill-down to individual outputs. It must detect regressions between versions.',
          concepts: ['Golden set and rubric design', 'Evaluation runner across models', 'Store results with versions', 'Comparison dashboard', 'Regression detection'],
          quiz: [
            ['Why show cost and latency next to quality?', 'Model choice is a trade-off; quality alone hides the operational price.'],
            ['How do you spot a regression?', 'Compare per-item scores between versions and flag items that dropped.'],
          ],
        },
        {
          title: 'Production AI API',
          description: 'Build an LLM-backed API with authentication, per-key rate limits, streaming, retries with fallbacks across providers, structured logging, tracing, cost accounting per request and a health endpoint. It must survive a provider outage with a fallback.',
          concepts: ['Auth and rate limiting', 'Streaming and timeouts', 'Provider fallbacks and retries', 'Tracing and cost per request', 'Load test and SLO check'],
          quiz: [
            ['What happens when the primary provider returns 5xx?', 'Retry with backoff, then fall back to a secondary model, and log the switch.'],
            ['How is cost per request computed?', 'Input and output tokens multiplied by the model\'s prices, recorded per trace.'],
          ],
        },
        {
          title: 'LLM cost and latency monitor',
          description: 'Build a monitoring service that ingests traces from AI apps and reports spend by feature, user and model, p95 latency, token growth over time and anomaly alerts. It must catch a prompt that doubled in size and a runaway agent loop.',
          concepts: ['Trace ingestion schema', 'Aggregation by feature and model', 'Latency and token dashboards', 'Anomaly alert rules', 'Budget caps per feature'],
          quiz: [
            ['What signals a runaway agent?', 'Many tool calls or tokens for one request far above the normal distribution.'],
            ['Why track prompt tokens over time?', 'Prompt growth silently raises cost and latency for every request.'],
          ],
          prereqs: ['Production AI API'],
        },
        {
          title: 'Prompt regression test suite',
          description: 'Build a test suite that runs on every prompt change: golden cases with assertions, judge-based rubric checks, safety probes and cost limits, integrated into CI with a report. It must block merges that lower scores below thresholds.',
          concepts: ['Case format and assertions', 'Judge rubrics and calibration', 'Safety probes in the suite', 'CI integration and thresholds', 'Report and history'],
          quiz: [
            ['How do you keep judge scores stable?', 'Fixed judge model and temperature, calibrated against a human-labelled subset.'],
            ['What should block a merge?', 'A score drop below the threshold or a failed safety probe.'],
          ],
          prereqs: ['Model evaluation dashboard'],
        },
        {
          title: 'Guardrails service',
          description: 'Build a service that screens inputs and outputs for prompt injection, PII, toxicity and off-topic requests with classifiers and rules, returning allow, block or redact decisions with reasons. It must run under 100 ms and log decisions for review.',
          concepts: ['Detector pipeline design', 'PII redaction and injection checks', 'Decision policy and reasons', 'Latency budget under 100 ms', 'Decision logging and review'],
          quiz: [
            ['Why return a reason with each decision?', 'Callers and reviewers need to know why a request was blocked to tune the policy.'],
            ['How do you keep the service fast?', 'Small classifiers, parallel detectors and caching of repeated inputs.'],
          ],
        },
      ],
    },
    {
      title: 'Capstone and Portfolio',
      description: 'Combine the pieces into one system and present it well.',
      topics: [
        {
          title: 'Capstone: knowledge-worker assistant',
          description: 'Combine retrieval, an agent with tools, memory, guardrails and evaluation into one assistant that answers from company documents, drafts emails and schedules meetings. It must pass the regression suite, respect permissions and expose a cost dashboard.',
          concepts: ['Architecture and component boundaries', 'Integrate retrieval, agent and memory', 'Guardrails and permissions end to end', 'Evaluation and monitoring wiring', 'Demo and documentation'],
          quiz: [
            ['What is the hardest integration problem?', 'Keeping permissions consistent across retrieval, memory and tools.'],
            ['How do you show the system is safe to ship?', 'Passing evals, guardrail metrics and a documented risk assessment.'],
          ],
          prereqs: ['RAG knowledge assistant', 'Multi-step tool-using agent', 'Guardrails service'],
        },
        {
          title: 'Capstone: internal AI platform with model routing',
          description: 'Build a platform other teams use: one API that routes to hosted and self-hosted models by task and cost, prompt registry, evaluation gates, per-team quotas and a usage dashboard. It must onboard a new model without client changes.',
          concepts: ['Routing rules by task and cost', 'Prompt registry and versions', 'Eval gates before promotion', 'Quotas and usage dashboard', 'Onboard a new model end to end'],
          quiz: [
            ['How does a new model get added without client changes?', 'Clients call an alias; the router maps the alias to the new backend.'],
            ['What gate protects users from a bad model update?', 'The evaluation gate on the golden set before the alias is moved.'],
          ],
          prereqs: ['Production AI API', 'Model evaluation dashboard'],
        },
        {
          title: 'Portfolio write-ups and demos',
          description: 'Document each project as a case study: problem, architecture diagram, key decisions, evaluation results, cost, and what you would do next, with a two-minute demo video and a clean README. It must let a hiring manager understand the work in five minutes.',
          concepts: ['Case-study structure', 'Architecture diagrams', 'Reporting evaluation and cost', 'Demo video and README', 'Presenting trade-offs in interviews'],
          quiz: [
            ['What do reviewers look for first in an AI project?', 'Evidence it works: evaluation results, not just screenshots.'],
            ['Why include what you would do next?', 'It shows judgement about limitations and priorities.'],
          ],
        },
      ],
    },
  ],
})
