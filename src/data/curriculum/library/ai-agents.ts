import { defineTrack } from '../define'

export const aiAgents = defineTrack({
  id: 'track-ai-agents',
  title: 'AI Agents and Agentic Workflows',
  description: 'Designing LLM agents that perceive, plan and act: tool schemas and MCP, planning and decomposition, graph and state-machine orchestration, memory and checkpoints, human approval, error recovery, tracing, evaluation, sandboxing, cost control, multi-agent patterns and the LangGraph, OpenAI Agents SDK and Claude Agent SDK ways of building them.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🤖',
  tags: ['agents', 'tool use', 'langgraph', 'mcp', 'orchestration', 'multi-agent', 'function calling', 'llm'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-llms'],
  style: 'practice',
  categories: [
    {
      title: 'Agent Foundations',
      description: 'What turns a model call into an agent and when that is the wrong choice.',
      topics: [
        {
          title: 'What makes an LLM an agent',
          description: 'An agent is a model that chooses its next action from observations, calls tools and loops until a goal is met; the difference from a chatbot is that the model controls the flow, which brings power and unpredictability.',
          concepts: ['Model-directed control flow', 'Actions, observations and goals', 'Autonomy as a dial', 'Agent versus chatbot'],
          quiz: [
            ['What distinguishes an agent from a single prompt?', 'The model decides which actions to take and repeats until the task is done.'],
            ['Why is autonomy described as a dial?', 'Systems range from fixed workflows to fully model-driven loops, and you choose the level.'],
          ],
        },
        {
          title: 'The perceive-plan-act loop',
          description: 'Each iteration reads the current state and tool results, decides on a plan or the next step, executes an action and feeds the result back; every agent framework is a variation of this loop with different guard rails.',
          concepts: ['Observation gathering', 'Deciding the next step', 'Executing and recording results', 'Termination conditions'],
          quiz: [
            ['What ends an agent loop?', 'The model signalling completion, a step limit or an error policy.'],
            ['What is fed back into the model each iteration?', 'The results of the actions it took, appended to the conversation or state.'],
          ],
          prereqs: ['What makes an LLM an agent'],
        },
        {
          title: 'Workflows versus autonomous agents',
          description: 'A workflow fixes the sequence of LLM and tool steps in code; an agent lets the model choose; workflows are cheaper, testable and predictable, so they should be the default until the task genuinely needs open-ended decisions.',
          concepts: ['Predefined step sequences', 'Model-chosen sequences', 'Predictability and testability', 'Choosing between them'],
          quiz: [
            ['When is a fixed workflow enough?', 'When the steps are known in advance and only the content of each step varies.'],
            ['Cost of choosing an agent unnecessarily?', 'Higher latency, spend and variance for no gain in capability.'],
          ],
          prereqs: ['The perceive-plan-act loop'],
        },
        {
          title: 'When not to build an agent',
          description: 'Tasks with deterministic logic, strict compliance paths or tight latency budgets are better served by code and a single model call; recognising these early avoids expensive, fragile systems that a script would have replaced.',
          concepts: ['Deterministic tasks belong in code', 'Latency-critical paths', 'Compliance and audit needs', 'Single-call alternatives'],
          quiz: [
            ['A task is "validate this form and email a summary". Agent or code?', 'Code with one model call for the summary; the flow is fixed.'],
            ['Why do audits favour workflows?', 'Every step is known and logged in advance, so behaviour can be certified.'],
          ],
          prereqs: ['Workflows versus autonomous agents'],
        },
      ],
    },
    {
      title: 'Tool Use and Tool Schemas',
      description: 'Giving the model capabilities it can call reliably.',
      topics: [
        {
          title: 'Function calling and tool schemas',
          description: 'A tool is declared to the model as a name, description and JSON Schema of parameters; the model returns a structured call, your code runs it and returns the result, so the schema is the contract that decides how well the model uses it.',
          concepts: ['Tool declaration format', 'JSON Schema parameters', 'Tool call messages and results', 'Parallel tool calls'],
          quiz: [
            ['What does the model return when it wants to use a tool?', 'A structured call with the tool name and arguments, not natural language.'],
            ['Who executes the tool?', 'Your application code; the model only requests the call.'],
          ],
          prereqs: ['The perceive-plan-act loop'],
        },
        {
          title: 'Writing tool descriptions the model understands',
          description: 'The description is read like documentation by the model: say what the tool does, when to use it and when not to, name units and formats, and keep the parameter set small; poor descriptions are the top cause of wrong tool calls.',
          concepts: ['Purpose and usage guidance', 'Parameter naming and units', 'Examples inside descriptions', 'Keeping tool sets small'],
          quiz: [
            ['Why include "when not to use" in a description?', 'It stops the model reaching for a tool in cases where another is better.'],
            ['What happens with 40 overlapping tools?', 'The model confuses them and accuracy drops; group or gate them instead.'],
          ],
          prereqs: ['Function calling and tool schemas'],
        },
        {
          title: 'Executing tools and returning results',
          description: 'Tool results should be concise, structured and truncated to a token budget, with ids and pagination for large data; what you return shapes the next reasoning step as much as the prompt does.',
          concepts: ['Result formatting for the model', 'Truncation and pagination', 'Returning references instead of blobs', 'Validating arguments before execution'],
          quiz: [
            ['A tool returns a 5 MB CSV. What should the model see?', 'A summary or a handle with pagination, not the whole file.'],
            ['Why validate arguments before running a tool?', 'The model can produce malformed or unsafe values; validation prevents damage and gives useful errors.'],
          ],
          prereqs: ['Writing tool descriptions the model understands'],
        },
        {
          title: 'Tool errors as information',
          description: 'A failing tool should return a clear, actionable error message to the model rather than crash the loop; well-phrased errors let the model correct its arguments or choose another approach on the next step.',
          concepts: ['Error messages the model can act on', 'Distinguishing retryable failures', 'Surfacing partial results', 'Escalating unrecoverable errors'],
          quiz: [
            ['What makes a tool error useful to an agent?', 'It states what was wrong and what a valid call would look like.'],
            ['Should every tool exception be shown to the model?', 'No; retryable infrastructure faults are handled in code, semantic errors go to the model.'],
          ],
          prereqs: ['Executing tools and returning results'],
        },
        {
          title: 'Model Context Protocol for tools',
          description: 'MCP standardises how a client such as an agent discovers and calls tools, resources and prompts exposed by a server over stdio or HTTP, so one integration can serve many agents and hosts instead of bespoke adapters.',
          concepts: ['MCP servers and clients', 'Tools, resources and prompts', 'Transports: stdio and streamable HTTP', 'Tool discovery and listing', 'Trusting third-party servers'],
          quiz: [
            ['What problem does MCP solve?', 'Each tool integration was written per agent; MCP makes tools reusable across hosts.'],
            ['What are the three main things an MCP server exposes?', 'Tools, resources and prompts.'],
          ],
          prereqs: ['Function calling and tool schemas'],
        },
      ],
    },
    {
      title: 'Planning and Decomposition',
      description: 'How agents reason about what to do next.',
      topics: [
        {
          title: 'ReAct: reasoning interleaved with actions',
          description: 'The ReAct pattern alternates a short reasoning step with a tool call and an observation, so the model grounds each decision in fresh evidence; it is the base loop most tool-using agents run today.',
          concepts: ['Thought-action-observation cycle', 'Grounding decisions in observations', 'Reasoning verbosity trade-offs', 'ReAct failure patterns'],
          quiz: [
            ['What does ReAct alternate?', 'Reasoning, an action and the observed result.'],
            ['Typical ReAct failure?', 'Looping on the same failed action or hallucinating an observation.'],
          ],
          prereqs: ['Tool errors as information'],
        },
        {
          title: 'Plan-then-execute and task decomposition',
          description: 'Asking the model to write a plan of sub-tasks first, then executing each with fresh context, keeps long tasks on track and lets you show progress, replan on failure and parallelise independent steps.',
          concepts: ['Upfront plan generation', 'Sub-task execution with fresh context', 'Replanning after failures', 'Identifying parallel sub-tasks'],
          quiz: [
            ['Benefit of an explicit plan over pure ReAct?', 'Long tasks stay coherent and progress can be shown and checked.'],
            ['When must the plan be revised?', 'When a step fails or reveals information that invalidates later steps.'],
          ],
          prereqs: ['ReAct: reasoning interleaved with actions'],
        },
        {
          title: 'Reflection and self-critique',
          description: 'Having the model review its own output or a tool result against explicit criteria before continuing catches many errors cheaply; it works best with concrete checks such as tests or schema validation rather than vague "is this good".',
          concepts: ['Critique against explicit criteria', 'Verifying with tests and validators', 'Reflection loops and budgets', 'Limits of self-assessment'],
          quiz: [
            ['What makes reflection effective?', 'Concrete, checkable criteria such as tests passing, not general self-review.'],
            ['Why cap reflection loops?', 'Each pass costs tokens and models can oscillate without converging.'],
          ],
          prereqs: ['Plan-then-execute and task decomposition'],
        },
        {
          title: 'Routing and classification steps',
          description: 'A cheap classification step that sends a request to a specialised prompt, model or sub-workflow improves accuracy and cost; routing is the simplest agentic pattern and often removes the need for a general agent.',
          concepts: ['Intent classification', 'Routing to specialised handlers', 'Model tiering by difficulty', 'Fallback routes'],
          quiz: [
            ['Why route before answering?', 'Specialised prompts and models handle each category better and cheaper than one generalist.'],
            ['What should happen on an uncertain classification?', 'Fall back to a general handler or ask the user a clarifying question.'],
          ],
          prereqs: ['Workflows versus autonomous agents'],
        },
      ],
    },
    {
      title: 'Workflow Orchestration',
      description: 'Structuring multi-step LLM work as explicit graphs and state machines.',
      topics: [
        {
          title: 'Prompt chaining and parallelisation',
          description: 'Chaining splits a task into sequential calls with checks between them; parallelisation runs independent calls at once and merges results or votes; both are workflow patterns with fixed control flow that are easy to test.',
          concepts: ['Sequential chains with gates', 'Sectioning work in parallel', 'Voting and aggregation', 'Testing each stage in isolation'],
          quiz: [
            ['What is a gate in a prompt chain?', 'A programmatic check between steps that stops or reroutes on bad output.'],
            ['Give a parallelisation use.', 'Running several guardrail checks on the same input simultaneously.'],
          ],
          prereqs: ['Routing and classification steps'],
        },
        {
          title: 'Orchestrator-worker pattern',
          description: 'A central model breaks a task into sub-tasks, delegates each to worker calls with focused context and synthesises the results; it suits tasks where the sub-tasks cannot be known in advance, such as multi-file code changes.',
          concepts: ['Dynamic sub-task creation', 'Worker context isolation', 'Result synthesis', 'Orchestrator failure handling'],
          quiz: [
            ['How does orchestrator-worker differ from parallelisation?', 'The sub-tasks are decided by the model at run time rather than fixed in code.'],
            ['Why give workers narrow context?', 'Smaller, focused prompts are cheaper and less distracted.'],
          ],
          prereqs: ['Prompt chaining and parallelisation'],
        },
        {
          title: 'Graph-based orchestration',
          description: 'Modelling an agent as nodes that transform a shared state and edges that decide the next node, as LangGraph does, makes the control flow explicit, resumable and visualisable instead of hidden inside a loop.',
          concepts: ['Nodes as state transformers', 'Edges and conditional edges', 'Shared typed state', 'Cycles and loop detection'],
          quiz: [
            ['What is a conditional edge?', 'A function that inspects the state and returns which node runs next.'],
            ['Why express an agent as a graph?', 'Control flow becomes explicit, testable, resumable and easy to visualise.'],
          ],
          prereqs: ['Orchestrator-worker pattern'],
        },
        {
          title: 'State machines for agent control',
          description: 'Explicit states such as gathering, drafting, awaiting approval and done, with allowed transitions, stop an agent from wandering; each state has its own prompt, tools and exit conditions, which makes behaviour auditable.',
          concepts: ['Enumerated states and transitions', 'Per-state prompts and tool sets', 'Guarding illegal transitions', 'Auditing transitions'],
          quiz: [
            ['Why restrict tools per state?', 'The model cannot take actions that make no sense in the current phase.'],
            ['How do you detect an agent stuck in a state?', 'Count transitions and time in state, and escalate past a threshold.'],
          ],
          prereqs: ['Graph-based orchestration'],
        },
        {
          title: 'Evaluator-optimiser loops',
          description: 'One call produces a draft, another evaluates it against criteria and returns feedback, and the loop repeats until the evaluator accepts or a budget runs out; it works when evaluation is easier than generation.',
          concepts: ['Generator and evaluator roles', 'Feedback as structured output', 'Acceptance criteria', 'Iteration budgets'],
          quiz: [
            ['When does an evaluator-optimiser loop pay off?', 'When judging quality is clearly easier than producing it, such as translation or code with tests.'],
            ['What stops the loop?', 'The evaluator passing the draft or the iteration budget being exhausted.'],
          ],
          prereqs: ['Reflection and self-critique', 'Graph-based orchestration'],
        },
      ],
    },
    {
      title: 'State Management and Memory',
      description: 'What the agent remembers within a run and across runs.',
      topics: [
        {
          title: 'Designing agent state',
          description: 'State holds the messages, intermediate results, plan and metadata a run needs; typing it explicitly, keeping it serialisable and separating scratch from durable fields makes runs resumable and debuggable.',
          concepts: ['Typed state schemas', 'Messages versus structured fields', 'Serialisable state', 'Reducers for state updates'],
          quiz: [
            ['Why keep state serialisable?', 'So it can be checkpointed, resumed and inspected outside the process.'],
            ['What is a reducer in a graph state?', 'A rule for merging a node\'s update into the existing field, such as appending messages.'],
          ],
          prereqs: ['Graph-based orchestration'],
        },
        {
          title: 'Managing the context window during a run',
          description: 'Long runs fill the context with tool output; trimming old results, summarising completed steps and storing large artefacts outside the prompt keep the agent effective past the point where naive appending fails.',
          concepts: ['Context growth from tool results', 'Compaction and summarisation', 'Externalising large artefacts', 'Keeping the plan visible'],
          quiz: [
            ['What usually fills an agent\'s context first?', 'Verbose tool outputs from earlier steps.'],
            ['What must survive compaction?', 'The goal, the plan, decisions made and open items.'],
          ],
          prereqs: ['Designing agent state'],
        },
        {
          title: 'Long-term memory stores',
          description: 'Memory across sessions lives in a database: facts about the user, past outcomes and learned preferences retrieved by key or by embedding; deciding what to write, when to forget and how to avoid contaminating runs is the hard part.',
          concepts: ['Episodic and semantic memory', 'Writing memories selectively', 'Retrieving memories by relevance', 'Memory decay and correction'],
          quiz: [
            ['Risk of writing every interaction to memory?', 'Noise and outdated facts crowd out useful ones and mislead later runs.'],
            ['How is long-term memory usually retrieved?', 'By key for user profile fields and by embedding similarity for free-form notes.'],
          ],
          prereqs: ['Managing the context window during a run'],
        },
        {
          title: 'Checkpoints and resumable runs',
          description: 'Persisting state after each node lets a run survive crashes, pause for human input and be replayed from any point; checkpointing is what turns an agent script into a durable process.',
          concepts: ['Checkpoint after every step', 'Thread and run identifiers', 'Resuming from a checkpoint', 'Replay for debugging'],
          quiz: [
            ['What does a checkpoint enable besides crash recovery?', 'Pausing for approval and resuming later, and replaying runs for debugging.'],
            ['What identifies a resumable conversation in LangGraph?', 'A thread id passed in the configuration.'],
          ],
          prereqs: ['Designing agent state'],
        },
      ],
    },
    {
      title: 'Execution Control and Safety Rails',
      description: 'Keeping multi-step runs bounded, correct and under human control.',
      topics: [
        {
          title: 'Multi-step execution and loop limits',
          description: 'Every loop needs a maximum number of steps, a token budget and a wall-clock limit; without them a confused agent burns money and time, and with them failures become clean, reportable events.',
          concepts: ['Step and token budgets', 'Wall-clock limits', 'Detecting repeated actions', 'Graceful stop with summary'],
          quiz: [
            ['What should happen when the step limit is hit?', 'Stop, save state and report what was done and what remains.'],
            ['How do you catch an agent repeating itself?', 'Hash recent actions and stop when the same call recurs without new information.'],
          ],
          prereqs: ['Checkpoints and resumable runs'],
        },
        {
          title: 'Human approval and interrupts',
          description: 'Actions with real consequences, such as sending email or spending money, pause the run, present the proposed action and wait for approval; interrupts require checkpointed state and a resume path that carries the decision.',
          concepts: ['Approval gates on risky tools', 'Interrupt before or after a node', 'Presenting proposed actions', 'Resuming with the human decision'],
          quiz: [
            ['Which actions need approval?', 'Irreversible or costly ones: payments, deletions, external messages.'],
            ['What does the resume carry?', 'The approval, rejection or edited action, which the next node reads from state.'],
          ],
          prereqs: ['Multi-step execution and loop limits'],
        },
        {
          title: 'Error recovery and retries',
          description: 'Transient failures get bounded retries with backoff in code; semantic failures go back to the model with the error; persistent failures trigger fallbacks or escalation; a policy per error class keeps runs from either dying or looping.',
          concepts: ['Classifying errors by recoverability', 'Backoff for transient faults', 'Model-driven correction', 'Fallback and escalation policies'],
          quiz: [
            ['Should a 429 rate limit be shown to the model?', 'No; retry in code with backoff, the model cannot do anything useful with it.'],
            ['What is a fallback in an agent?', 'A simpler path, such as a fixed workflow or a human hand-off, used when the main path fails repeatedly.'],
          ],
          prereqs: ['Multi-step execution and loop limits'],
        },
        {
          title: 'Idempotency and side effects',
          description: 'Retries and replays can execute a tool twice, so writes need idempotency keys, dry-run modes and compensating actions; reads and writes should be separated so planning can happen without touching the world.',
          concepts: ['Idempotency keys for writes', 'Dry-run and preview modes', 'Compensating actions', 'Separating read and write tools'],
          quiz: [
            ['Why can a retried agent charge a card twice?', 'The tool ran but the result was lost, so the retry repeats the write.'],
            ['Fix for duplicate writes?', 'An idempotency key so the second call is recognised and ignored.'],
          ],
          prereqs: ['Error recovery and retries'],
        },
        {
          title: 'Timeouts, cancellation and cleanup',
          description: 'Users cancel, tools hang and budgets expire mid-run; propagating cancellation to in-flight tool calls, releasing resources and recording a partial result prevent zombie processes and inconsistent state.',
          concepts: ['Per-tool timeouts', 'Cooperative cancellation', 'Cleanup of resources', 'Recording partial outcomes'],
          quiz: [
            ['What happens without per-tool timeouts?', 'One hung call blocks the entire run indefinitely.'],
            ['What should a cancelled run leave behind?', 'A checkpoint with what was completed and no half-applied side effects.'],
          ],
          prereqs: ['Idempotency and side effects'],
        },
      ],
    },
    {
      title: 'Observability and Evaluation of Agents',
      description: 'Seeing what an agent did and measuring whether it works.',
      topics: [
        {
          title: 'Tracing agent runs',
          description: 'A trace captures every model call, tool call, arguments, results, latency and cost as a tree of spans; without it a failed run is unexplainable, and with it you can replay, compare and bill accurately.',
          concepts: ['Spans for model and tool calls', 'Trace trees per run', 'Capturing arguments and results', 'Cost and latency per span'],
          quiz: [
            ['What is the unit of an agent trace?', 'A span for each model or tool call, nested under the run.'],
            ['Why store tool arguments in traces?', 'To reproduce the exact call when debugging a wrong action.'],
          ],
          prereqs: ['Timeouts, cancellation and cleanup'],
        },
        {
          title: 'Evaluating task success and trajectories',
          description: 'Agent evals check the final outcome against a goal and the trajectory against expectations, such as which tools were called and in what order; outcome-only scoring misses dangerous paths that happened to succeed.',
          concepts: ['Outcome-based scoring', 'Trajectory comparison', 'Tool-call correctness', 'Partial credit and rubrics'],
          quiz: [
            ['Why evaluate the trajectory, not just the result?', 'An agent can reach the right answer via unsafe or wasteful actions.'],
            ['How do you grade an open-ended agent task?', 'A rubric or judge model scoring the outcome plus checks on required tool calls.'],
          ],
          prereqs: ['Tracing agent runs'],
        },
        {
          title: 'Simulated environments and test harnesses',
          description: 'Running agents against mocked tools, sandboxed copies of systems and scripted users lets you test many scenarios deterministically and cheaply before touching production data.',
          concepts: ['Mock tools with scripted responses', 'Sandboxed system copies', 'Simulated users', 'Scenario suites'],
          quiz: [
            ['Why mock tools during evaluation?', 'Deterministic responses make runs repeatable and avoid real side effects.'],
            ['What is a simulated user?', 'A model or script that plays the human side to test multi-turn behaviour.'],
          ],
          prereqs: ['Evaluating task success and trajectories'],
        },
        {
          title: 'Debugging failed agent runs',
          description: 'Reading the trace to find the first wrong step, checking whether the prompt, tool description, tool result or state was at fault, then adding a regression case, is the standard loop for improving agents.',
          concepts: ['Finding the first bad step', 'Prompt versus tool versus state faults', 'Replaying from a checkpoint', 'Turning failures into regression cases'],
          quiz: [
            ['First question when a run fails?', 'Which step first went wrong and what did the model see at that moment.'],
            ['Why replay from a checkpoint instead of rerunning?', 'It reproduces the exact state cheaply and isolates the failing step.'],
          ],
          prereqs: ['Simulated environments and test harnesses'],
        },
      ],
    },
    {
      title: 'Security, Cost and Latency',
      description: 'Bounding what an agent can do and what it can spend.',
      topics: [
        {
          title: 'Security boundaries and least privilege',
          description: 'An agent should hold only the credentials and tools its task needs, scoped per user and per run; permissions are enforced in the tool layer, never by the prompt, because the model can be persuaded to ignore instructions.',
          concepts: ['Per-run scoped credentials', 'Allow-listed tools and actions', 'Enforcement outside the model', 'Audit logs of actions'],
          quiz: [
            ['Why not enforce permissions in the system prompt?', 'Prompts can be overridden by injection; enforcement must sit in code.'],
            ['What is least privilege for an agent?', 'Only the tools and data scopes required for the current task and user.'],
          ],
          prereqs: ['Model Context Protocol for tools'],
        },
        {
          title: 'Sandboxing code execution',
          description: 'Agents that run generated code need containers or microVMs with no network by default, resource limits, ephemeral filesystems and no access to host secrets; the sandbox is what makes code execution a safe tool.',
          concepts: ['Container and microVM isolation', 'Network and filesystem restrictions', 'CPU, memory and time limits', 'Ephemeral execution environments'],
          quiz: [
            ['Minimum isolation for running model-written code?', 'A container or microVM with restricted network, resources and no host secrets.'],
            ['Why make sandboxes ephemeral?', 'Nothing persists between runs, so a compromised run cannot affect the next.'],
          ],
          prereqs: ['Security boundaries and least privilege'],
        },
        {
          title: 'Prompt injection against agents',
          description: 'Web pages, emails and documents an agent reads can contain instructions that hijack it into exfiltrating data or taking actions; treating all tool output as untrusted, confirming risky actions and limiting data flow are the defences.',
          concepts: ['Injection via tool outputs', 'Data exfiltration paths', 'Untrusted content handling', 'Confirmation for consequential actions'],
          quiz: [
            ['How does an agent get hijacked by a web page?', 'The page contains instructions the model follows as if they came from the user.'],
            ['Structural defence against exfiltration?', 'Limit which tools can send data out and require approval for them.'],
          ],
          prereqs: ['Security boundaries and least privilege'],
        },
        {
          title: 'Cost control for agents',
          description: 'Agents multiply calls, so cost is managed with per-run token budgets, smaller models for routine steps, prompt caching of stable prefixes, trimmed tool results and monitoring of cost per completed task.',
          concepts: ['Per-run spend budgets', 'Model tiering within a run', 'Prompt caching of stable context', 'Cost per successful task'],
          quiz: [
            ['What metric captures agent cost best?', 'Cost per successfully completed task, not cost per call.'],
            ['What does prompt caching help with in agents?', 'The long stable system prompt and tool definitions are reused across every step.'],
          ],
          prereqs: ['Tracing agent runs'],
        },
        {
          title: 'Latency control for agents',
          description: 'Sequential steps add up; parallel tool calls, streaming intermediate progress, speculative or cached results and cutting unnecessary reflection rounds keep agents responsive enough for interactive use.',
          concepts: ['Parallel tool execution', 'Streaming progress to users', 'Reducing round trips', 'Latency budget per step'],
          quiz: [
            ['Cheapest latency win in an agent?', 'Executing independent tool calls in parallel.'],
            ['Why stream intermediate steps?', 'Users tolerate long runs when they can see progress.'],
          ],
          prereqs: ['Cost control for agents'],
        },
      ],
    },
    {
      title: 'Multi-Agent Patterns and Frameworks',
      description: 'Coordinating several agents and the toolkits that package these ideas.',
      topics: [
        {
          title: 'Multi-agent patterns',
          description: 'Supervisor agents delegate to specialists, handoff patterns pass a conversation between agents, and debate or committee patterns compare outputs; each adds coordination cost that must be justified by better results.',
          concepts: ['Supervisor and specialists', 'Handoffs between agents', 'Debate and committee patterns', 'When one agent is enough'],
          quiz: [
            ['What is a handoff?', 'One agent transfers control and context to another better suited to the next part of the task.'],
            ['Main cost of multi-agent systems?', 'Coordination overhead, lost context between agents and harder debugging.'],
          ],
          prereqs: ['Orchestrator-worker pattern'],
        },
        {
          title: 'Subagents and context isolation',
          description: 'Spawning a subagent with its own fresh context for a bounded subtask keeps the main agent\'s context clean and lets work run in parallel; the subagent returns a summary, not its whole transcript.',
          concepts: ['Fresh context per subtask', 'Returning summaries not transcripts', 'Parallel subagents', 'Scoping subagent tools'],
          quiz: [
            ['Why does a subagent return a summary?', 'Its full transcript would flood the parent context with detail it does not need.'],
            ['When do subagents run in parallel?', 'When their subtasks are independent and share no mutable state.'],
          ],
          prereqs: ['Multi-agent patterns', 'Managing the context window during a run'],
        },
        {
          title: 'LangGraph',
          description: 'LangGraph builds agents as state graphs with typed state, nodes, conditional edges, checkpointers for persistence and interrupts for human input; it is the framework to know for explicit, resumable orchestration.',
          concepts: ['StateGraph and typed state', 'Adding nodes and edges', 'Checkpointers and threads', 'interrupt for human input', 'Prebuilt ReAct agent'],
          quiz: [
            ['What does a checkpointer give a LangGraph app?', 'Persistence per thread, enabling resume, interrupts and time travel.'],
            ['How does LangGraph express branching?', 'Conditional edges that route based on the state.'],
          ],
          prereqs: ['Graph-based orchestration', 'Checkpoints and resumable runs'],
        },
        {
          title: 'OpenAI Agents SDK',
          description: 'The OpenAI Agents SDK models agents with instructions, tools and handoffs, adds guardrails that run alongside the agent, and traces every run; it favours a small set of primitives over a graph abstraction.',
          concepts: ['Agents with instructions and tools', 'Handoffs as tools', 'Input and output guardrails', 'Built-in tracing'],
          quiz: [
            ['How does the Agents SDK implement handoffs?', 'As special tools an agent can call to transfer control to another agent.'],
            ['What are guardrails in this SDK?', 'Checks that run on inputs or outputs and can stop the run when they trip.'],
          ],
          prereqs: ['Multi-agent patterns'],
        },
        {
          title: 'Claude Agent SDK concepts',
          description: 'The Claude Agent SDK packages the agent loop used by Claude Code: tools including file and shell access, MCP servers, permission modes, hooks around tool calls, subagents and session persistence, so you build on a proven loop rather than writing one.',
          concepts: ['Built-in agent loop', 'Permission modes and tool allow-lists', 'Hooks around tool calls', 'Subagents and sessions in the SDK', 'Connecting MCP servers'],
          quiz: [
            ['What do hooks let you do in the Claude Agent SDK?', 'Run your own code before or after tool calls, for example to block or log actions.'],
            ['Why use a packaged agent loop?', 'It already handles tool execution, context management and permissions that are hard to get right.'],
          ],
          prereqs: ['Model Context Protocol for tools', 'Subagents and context isolation'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: research assistant agent',
          description: 'Build an agent that plans a research question, searches the web and a local document store through tools, reads and summarises sources, tracks what it has covered in state and produces a cited report with a step budget.',
          concepts: ['Define tools and their schemas', 'Plan and execute with a step budget', 'Track coverage in state', 'Produce the cited report'],
          quiz: [
            ['Why track visited sources in state?', 'To avoid re-reading the same pages and to show coverage.'],
            ['What stops the agent running forever?', 'A step and token budget with a graceful stop that still writes the report.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: approval-gated operations agent',
          description: 'An agent that triages incoming support tickets, drafts replies and proposed account actions, then pauses for human approval before any write; use a graph with checkpoints so a run can be resumed hours later.',
          concepts: ['Model the state machine', 'Read-only triage tools', 'Interrupt before write actions', 'Resume with the decision'],
          quiz: [
            ['Which tools are allowed before approval?', 'Only read-only ones; writes wait for the human decision.'],
            ['How does the run survive a delay of hours?', 'State is checkpointed and resumed by thread id when the approval arrives.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: coding agent in a sandbox',
          description: 'An agent that takes a task description, edits files and runs tests inside a container with no network, iterates until tests pass or a budget is hit, and opens a summary of changes; include traces and a scenario test suite.',
          concepts: ['Sandboxed file and shell tools', 'Test-driven iteration loop', 'Budgets and stop conditions', 'Trace and evaluate runs'],
          quiz: [
            ['What signal drives the iteration loop?', 'Test results returned by the sandboxed test tool.'],
            ['Why disable network in the sandbox?', 'To prevent exfiltration and uncontrolled downloads by generated code.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: multi-agent data analysis',
          description: 'A supervisor agent that routes analysis questions to a SQL agent and a charting agent with isolated contexts, merges their outputs into a report, and is evaluated on a scenario suite with mocked databases.',
          concepts: ['Supervisor routing logic', 'Specialist agents with scoped tools', 'Merge outputs into a report', 'Scenario suite with mocks'],
          quiz: [
            ['Why give the SQL agent its own context?', 'Schema details and query iterations would clutter the supervisor.'],
            ['How is the system evaluated?', 'Scenario tests with mocked databases checking outcomes and tool calls.'],
          ],
          style: 'project',
        },
        {
          title: 'AI agents interview questions',
          description: 'Expect questions on the agent loop, tool schema design, workflows versus agents, handling tool failures, human-in-the-loop design, memory strategies, prompt injection defences, evaluating agents and controlling cost.',
          concepts: ['Explaining the agent loop', 'Tool design questions', 'Safety and control questions', 'Evaluation and cost questions'],
          quiz: [
            ['How would you stop an agent from taking a harmful action?', 'Enforce permissions in the tool layer and require human approval for consequential actions.'],
            ['Workflow or agent for invoice processing?', 'A workflow: the steps are fixed and auditability matters.'],
          ],
          style: 'reading',
        },
        {
          title: 'Agent system design exercise',
          description: 'Design an agent that resolves customer refund requests end to end across CRM, payments and email, with a 2 percent error tolerance, full audit trail and human approval above a threshold; specify tools, states, checkpoints, evals and cost controls.',
          concepts: ['Tool and permission inventory', 'State machine with approval gates', 'Audit and observability design', 'Evaluation and rollout plan'],
          quiz: [
            ['Where does the approval threshold get enforced?', 'In the tool layer and the state machine, not in the prompt.'],
            ['How do you prove the 2 percent error tolerance?', 'A scenario suite plus shadow-mode runs against real tickets before enabling writes.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
