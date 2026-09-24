import { defineTrack } from '../define'

export const promptEngineering = defineTrack({
  id: 'track-prompt-engineering',
  title: 'Prompt Engineering',
  description: 'Writing prompts that work reliably in production: how models process instructions, few-shot and reasoning prompts, structured output, templates and chaining, retrieval-augmented prompts, evaluation, injection defences, prompt versioning and testing, and prompts for code and data extraction.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '💬',
  tags: ['prompt-engineering', 'llm', 'few-shot', 'chain-of-thought', 'structured-output', 'prompt-injection', 'evals'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'How Prompts Are Processed',
      description: 'What actually happens between your text and the reply.',
      topics: [
        {
          title: 'From prompt text to tokens to predictions',
          description: 'The prompt is tokenised, every token attends to every earlier one, and the model samples the next token repeatedly; why wording, spelling and formatting change results and why the model has no memory beyond the text in front of it.',
          concepts: ['Tokenisation of the prompt', 'Next-token prediction loop', 'Sensitivity to wording and format', 'No hidden memory between calls'],
          quiz: [
            ['Does the model remember your previous request?', 'Only if it is included in the current prompt.'],
            ['Why can a small wording change alter the answer?', 'Different tokens shift the probabilities of every following token.'],
          ],
        },
        {
          title: 'System, user and assistant messages',
          description: 'The chat format gives each message a role; system messages set persistent behaviour, user messages carry requests, assistant messages hold prior replies (and can be prefilled), and models are trained to weight them differently.',
          concepts: ['Role of the system message', 'User turns and assistant turns', 'Prefilling the assistant turn', 'Role weighting in trained models'],
          quiz: [
            ['What is assistant prefill used for?', 'Forcing the start of the reply, such as an opening brace for JSON.'],
            ['Where do global rules belong?', 'In the system message so they apply to every turn.'],
          ],
          prereqs: ['From prompt text to tokens to predictions'],
        },
        {
          title: 'Context windows and attention limits',
          description: 'Everything the model uses must fit in the window, information in the middle of long prompts is used less reliably, and long irrelevant content dilutes attention; practical budgeting for prompts of any size.',
          concepts: ['Context window budget', 'Middle-of-prompt neglect', 'Irrelevant content dilution', 'Placing key instructions'],
          quiz: [
            ['Where should the task statement go in a long prompt?', 'At the start and restated at the end.'],
            ['What is the cost of pasting a whole document when one section matters?', 'Tokens, latency and a lower chance the model focuses on the right part.'],
          ],
          prereqs: ['From prompt text to tokens to predictions'],
        },
        {
          title: 'Why models follow instructions',
          description: 'Base models only continue text; instruction tuning and preference training make them treat prompts as requests. What this implies: they imitate helpful answers, follow the last clear instruction and can be over-agreeable.',
          concepts: ['Base versus instruction-tuned models', 'Imitation of helpful responses', 'Recency of instructions', 'Sycophancy and agreeableness'],
          quiz: [
            ['What happens when you ask a base model a question?', 'It continues the text, possibly with more questions rather than an answer.'],
            ['What is sycophancy?', 'The model agreeing with the user\'s framing even when it is wrong.'],
          ],
          prereqs: ['System, user and assistant messages'],
        },
      ],
    },
    {
      title: 'Writing Clear Instructions',
      description: 'The craft that fixes most prompt failures.',
      topics: [
        {
          title: 'Specificity and unambiguous instructions',
          description: 'Stating the task, audience, scope and success criteria explicitly, replacing vague adjectives with measurable requirements, and reading your prompt as a stranger who cannot ask questions.',
          concepts: ['Task, audience and scope', 'Measurable requirements', 'Removing ambiguity', 'The stranger test'],
          quiz: [
            ['What is wrong with "make it short"?', 'Short is undefined; give a word or sentence limit.'],
            ['What should a prompt always state?', 'What to do, on what input, in what form, for whom.'],
          ],
        },
        {
          title: 'Positive instructions, constraints and defaults',
          description: 'Telling the model what to do rather than only what to avoid, listing hard constraints separately, setting defaults for unspecified cases, and ordering rules by priority so conflicts resolve predictably.',
          concepts: ['Do versus do not phrasing', 'Hard constraints list', 'Defaults for unspecified cases', 'Priority ordering of rules'],
          quiz: [
            ['Why prefer "answer in plain prose" over "do not use bullet points"?', 'A positive target is easier to satisfy than an open-ended prohibition.'],
            ['What should happen when two rules conflict?', 'The prompt states which takes priority.'],
          ],
          prereqs: ['Specificity and unambiguous instructions'],
        },
        {
          title: 'Structure, delimiters and emphasis',
          description: 'Separating instructions from data with XML tags, Markdown headings or triple quotes, ordering sections consistently, and using emphasis sparingly so it still means something.',
          concepts: ['XML tags for sections', 'Delimiting user-supplied data', 'Consistent section order', 'Sparing emphasis'],
          quiz: [
            ['Why wrap pasted documents in tags?', 'So the model can tell data from instructions and you can reference the section.'],
            ['What happens when everything is in capitals?', 'Nothing stands out and the model may shout back.'],
          ],
          prereqs: ['Specificity and unambiguous instructions'],
        },
        {
          title: 'Specifying output format and length',
          description: 'Describing the exact shape of the reply (headings, fields, ordering, language), giving an example skeleton, setting length limits in units the model can count, and asking for nothing else.',
          concepts: ['Output skeletons', 'Length in sentences or items', 'Language and tone specification', 'Suppressing preambles'],
          quiz: [
            ['Why say "three bullet points" rather than "about 50 words"?', 'Models count items more reliably than words.'],
            ['How do you stop "Sure! Here is..." preambles?', 'Ask for the output only, or prefill the start of the reply.'],
          ],
          prereqs: ['Structure, delimiters and emphasis'],
        },
        {
          title: 'Uncertainty and giving the model an out',
          description: 'Instructing the model to say it does not know, to ask a clarifying question or to return a null field when information is missing, which cuts hallucination more than any other single instruction.',
          concepts: ['Permission to say unknown', 'Clarifying questions', 'Null and empty outputs', 'Confidence annotations'],
          quiz: [
            ['What reduces invented facts most cheaply?', 'Telling the model to answer only from the provided text and say when it cannot.'],
            ['How should a missing field be represented in an extraction?', 'As null, not a guess.'],
          ],
          prereqs: ['Positive instructions, constraints and defaults'],
        },
      ],
    },
    {
      title: 'Examples and Reasoning',
      description: 'Showing rather than telling, and making the model think before it answers.',
      topics: [
        {
          title: 'Zero-shot versus few-shot prompting',
          description: 'When a clear instruction suffices and when a handful of worked examples is needed: format-heavy tasks, subtle judgement calls and unusual styles benefit most, while examples cost tokens and can anchor too hard.',
          concepts: ['Zero-shot instruction', 'Few-shot demonstrations', 'When examples help most', 'Anchoring on examples'],
          quiz: [
            ['What kind of task benefits most from examples?', 'Tasks with a specific output format or subtle labelling rules.'],
            ['What is a risk of few-shot examples?', 'The model copies surface features like length or topic of the examples.'],
          ],
          prereqs: ['Specifying output format and length'],
        },
        {
          title: 'Choosing and formatting examples',
          description: 'Diverse examples that cover edge cases, balanced labels, consistent input-output formatting, ordering effects, and selecting examples dynamically by similarity to the input.',
          concepts: ['Covering edge cases', 'Label balance in examples', 'Consistent example format', 'Dynamic example selection'],
          quiz: [
            ['Why balance labels in classification examples?', 'Skewed examples bias the model toward the majority label.'],
            ['How is dynamic selection done?', 'Embed the input and pick the nearest labelled examples.'],
          ],
          prereqs: ['Zero-shot versus few-shot prompting'],
        },
        {
          title: 'Chain-of-thought prompting',
          description: 'Asking the model to reason step by step before answering improves maths, logic and multi-step tasks; where to put the reasoning, how to separate it from the final answer, and when it wastes tokens.',
          concepts: ['Step-by-step reasoning requests', 'Separating reasoning from the answer', 'Tasks that benefit', 'Cost and latency of reasoning'],
          quiz: [
            ['Why does reasoning first help?', 'Intermediate tokens give the model space to compute before committing.'],
            ['How do you extract the final answer cleanly?', 'Ask for it in a tagged section or on a labelled final line.'],
          ],
          prereqs: ['Zero-shot versus few-shot prompting'],
        },
        {
          title: 'Reasoning models and extended thinking',
          description: 'Models that reason internally before replying change prompting: fewer step-by-step instructions, budgets for thinking, and prompts that state the goal and constraints instead of the procedure.',
          concepts: ['Built-in reasoning phases', 'Thinking budgets', 'Goal-first prompts', 'When not to micromanage steps'],
          quiz: [
            ['Should you add "think step by step" for a reasoning model?', 'Usually not; it already reasons, so state the goal and constraints.'],
            ['What does a thinking budget trade?', 'Latency and cost against accuracy on hard problems.'],
          ],
          prereqs: ['Chain-of-thought prompting'],
        },
        {
          title: 'Self-consistency and verification prompts',
          description: 'Sampling several reasoning paths and taking the majority answer, asking the model to check its own output against criteria, and separating generation from verification into two calls.',
          concepts: ['Majority vote over samples', 'Self-check against criteria', 'Generate-then-verify calls', 'Diminishing returns'],
          quiz: [
            ['What does self-consistency require?', 'Several samples at non-zero temperature and a way to compare answers.'],
            ['Why verify in a separate call?', 'A fresh context is less anchored on the original mistake.'],
          ],
          prereqs: ['Chain-of-thought prompting'],
        },
      ],
    },
    {
      title: 'Structured Output',
      description: 'Getting data, not prose.',
      topics: [
        {
          title: 'Requesting JSON reliably',
          description: 'Stating the exact keys and types, showing an example object, forbidding commentary and code fences, prefilling the opening brace, and parsing defensively when a provider has no native JSON mode.',
          concepts: ['Key and type specification', 'Example object in the prompt', 'Suppressing fences and commentary', 'Defensive parsing'],
          quiz: [
            ['What commonly breaks JSON parsing?', 'Markdown code fences or a sentence before the object.'],
            ['How do you force the reply to start with a brace?', 'Prefill the assistant turn with "{".'],
          ],
          prereqs: ['Specifying output format and length'],
        },
        {
          title: 'JSON schemas and constrained decoding',
          description: 'Passing a JSON schema so the provider constrains generation, which fields and types are supported, enum and required fields, and the difference between schema-enforced and merely requested output.',
          concepts: ['JSON schema fields and types', 'Enums and required fields', 'Provider structured output modes', 'Enforced versus requested'],
          quiz: [
            ['Does schema enforcement guarantee correct values?', 'No, only valid structure; values can still be wrong.'],
            ['Why use enums in the schema?', 'To restrict a field to known categories instead of free text.'],
          ],
          prereqs: ['Requesting JSON reliably'],
        },
        {
          title: 'Validating and repairing outputs',
          description: 'Parsing into pydantic models, checking business rules the schema cannot express, and feeding validation errors back for a targeted retry before falling back to a default.',
          concepts: ['pydantic models for outputs', 'Business rule checks', 'Error-driven retries', 'Fallback behaviour'],
          quiz: [
            ['What goes in the retry prompt?', 'The original request, the bad output and the specific validation error.'],
            ['How many retries are reasonable?', 'One or two; after that fall back and log.'],
          ],
          prereqs: ['JSON schemas and constrained decoding'],
        },
        {
          title: 'Tables, CSV and Markdown outputs',
          description: 'When a table or CSV beats JSON, specifying columns and escaping rules, pitfalls with commas and newlines in fields, and asking for Markdown when a human will read the output.',
          concepts: ['Choosing table versus JSON', 'Column specification', 'Escaping and delimiter pitfalls', 'Markdown for human readers'],
          quiz: [
            ['Why is CSV fragile from an LLM?', 'Fields containing commas or newlines break naive parsing.'],
            ['When is Markdown the right output?', 'When a person reads it directly rather than a program.'],
          ],
          prereqs: ['Requesting JSON reliably'],
        },
      ],
    },
    {
      title: 'Roles, Personas and Templates',
      description: 'Prompts as reusable, parameterised components.',
      topics: [
        {
          title: 'Role and persona prompts',
          description: 'Assigning an expert role sets vocabulary and depth, a persona sets tone and voice; what roles genuinely change versus placebo, and keeping persona from overriding accuracy.',
          concepts: ['Expert role assignment', 'Persona voice and tone', 'What roles actually change', 'Persona versus correctness'],
          quiz: [
            ['What does "you are a tax lawyer" mostly change?', 'Terminology, assumed knowledge and level of detail.'],
            ['When does a persona hurt?', 'When staying in character conflicts with giving correct information.'],
          ],
          prereqs: ['System, user and assistant messages'],
        },
        {
          title: 'System prompt design',
          description: 'Structuring a production system prompt: identity, task, rules in priority order, formatting, tool guidance and refusal behaviour, kept short enough to read and stable enough to cache.',
          concepts: ['Sections of a system prompt', 'Priority-ordered rules', 'Refusal and escalation behaviour', 'Stability for caching'],
          quiz: [
            ['Why keep the system prompt stable?', 'Prompt caching and predictable behaviour across requests.'],
            ['What should a support-bot system prompt say about unknowns?', 'When and how to hand off to a human.'],
          ],
          prereqs: ['Role and persona prompts', 'Positive instructions, constraints and defaults'],
        },
        {
          title: 'Prompt templates and variables',
          description: 'Separating fixed instructions from per-request data with placeholders, escaping user content, Jinja or f-string templates, and keeping templates in files rather than scattered strings.',
          concepts: ['Placeholders and substitution', 'Escaping inserted content', 'Jinja templates for prompts', 'Templates as files'],
          quiz: [
            ['Why escape user content in a template?', 'Braces or tags in the data can break the template or inject instructions.'],
            ['Why store templates in files?', 'They can be versioned, reviewed and tested like code.'],
          ],
          prereqs: ['System prompt design'],
        },
        {
          title: 'Dynamic prompts',
          description: 'Conditional sections that appear only when relevant, truncation rules when data exceeds the budget, per-user or per-tenant settings, and testing every branch a template can produce.',
          concepts: ['Conditional sections', 'Truncation strategies', 'Per-tenant customisation', 'Testing template branches'],
          quiz: [
            ['What should be truncated first when a prompt is too long?', 'The least relevant data, never the instructions.'],
            ['Why test every template branch?', 'A rarely used branch can render a broken or empty prompt.'],
          ],
          prereqs: ['Prompt templates and variables'],
        },
      ],
    },
    {
      title: 'Chaining and Decomposition',
      description: 'Breaking a hard task into prompts that each do one thing well.',
      topics: [
        {
          title: 'Prompt chaining',
          description: 'Passing the output of one call into the next: extract then summarise, draft then critique then revise; when chains beat one big prompt and how errors compound along the chain.',
          concepts: ['Sequential calls with handoff', 'Draft, critique, revise', 'Chains versus single prompts', 'Error propagation'],
          quiz: [
            ['Why split extraction and summarisation?', 'Each step is simpler to prompt, test and debug.'],
            ['What is the cost of chaining?', 'More latency and calls, and errors in early steps flow downstream.'],
          ],
          prereqs: ['Validating and repairing outputs'],
        },
        {
          title: 'Task decomposition and planning prompts',
          description: 'Asking the model to produce a plan or sub-questions first, executing each part separately, and merging results; the map-reduce pattern for long inputs.',
          concepts: ['Plan-then-execute', 'Sub-question generation', 'Map-reduce over chunks', 'Merging partial results'],
          quiz: [
            ['How do you summarise a 200-page document?', 'Summarise chunks, then summarise the summaries.'],
            ['What does a planning step produce?', 'A list of steps or sub-questions that later calls answer.'],
          ],
          prereqs: ['Prompt chaining'],
        },
        {
          title: 'Routing and classification prompts',
          description: 'A cheap first call classifies intent, language or difficulty and routes to a specialised prompt or model, with a fallback route and logging of routing decisions.',
          concepts: ['Intent classification call', 'Route to specialised prompts', 'Fallback routes', 'Logging routing decisions'],
          quiz: [
            ['Why route with a small model?', 'Classification is easy and the router runs on every request.'],
            ['What must every router have?', 'A default route for inputs that match nothing.'],
          ],
          prereqs: ['Prompt chaining'],
        },
        {
          title: 'Retrieval-augmented prompts',
          description: 'Inserting retrieved passages into the prompt with source ids, telling the model to answer only from them and cite, and handling the case where retrieval returns nothing useful; the full system is in track-rag.',
          concepts: ['Inserting passages with ids', 'Answer-only-from-context instructions', 'Citation requirements', 'Empty retrieval handling'],
          quiz: [
            ['How do you make citations checkable?', 'Number the passages and require the number in the answer.'],
            ['What should the model do when no passage is relevant?', 'Say so rather than answer from general knowledge.'],
          ],
          prereqs: ['Structure, delimiters and emphasis'],
        },
        {
          title: 'Prompts for tools and agents',
          description: 'Writing tool descriptions the model can act on, instructing when to call tools versus answer directly, and the loop prompts that let a model plan, act and observe; deeper coverage in track-ai-agents.',
          concepts: ['Tool descriptions as prompts', 'When to call versus answer', 'Plan-act-observe loops', 'Stopping conditions'],
          quiz: [
            ['What makes a tool description effective?', 'It states the purpose, when to use it and what each parameter means.'],
            ['Why give a stopping condition?', 'Otherwise the loop can call tools forever.'],
          ],
          prereqs: ['Task decomposition and planning prompts'],
        },
      ],
    },
    {
      title: 'Evaluation and Iteration',
      description: 'Improving a prompt by measurement, not by feel.',
      topics: [
        {
          title: 'Building a prompt test set',
          description: 'Collecting real and edge-case inputs with expected outputs or rubrics, covering the failure modes you have seen, and versioning the set alongside the prompt.',
          concepts: ['Representative inputs', 'Edge cases and adversarial inputs', 'Expected outputs and rubrics', 'Versioning the test set'],
          quiz: [
            ['Where do the best test cases come from?', 'Real inputs that failed in production.'],
            ['How many cases to start?', 'Twenty to fifty covering the main paths and known failures.'],
          ],
        },
        {
          title: 'Metrics and grading rubrics',
          description: 'Exact match and F1 for structured tasks, rubric scores for free text, pass rates for constraints like "no PII" or "under 100 words", and reporting per-category results rather than one number.',
          concepts: ['Exact match and F1', 'Rubric scoring', 'Constraint pass rates', 'Per-category reporting'],
          quiz: [
            ['How do you score a summary?', 'A rubric for coverage, faithfulness and length, scored per item.'],
            ['Why report per category?', 'An average hides one input type that always fails.'],
          ],
          prereqs: ['Building a prompt test set'],
        },
        {
          title: 'LLM-as-judge for prompt evaluation',
          description: 'Grading outputs with a model against a rubric or reference, pairwise comparison of two prompt versions with order swapping, and checking judge agreement with a human-labelled sample.',
          concepts: ['Judge prompts with rubrics', 'Pairwise version comparison', 'Order swapping', 'Judge validation'],
          quiz: [
            ['What does the judge need besides the output?', 'The input, the rubric and ideally a reference answer.'],
            ['Why validate the judge?', 'Judges have biases; agreement with humans shows it can be trusted.'],
          ],
          prereqs: ['Metrics and grading rubrics'],
        },
        {
          title: 'The iteration loop',
          description: 'Change one thing, run the test set, compare against the previous version, keep or revert; fixing a failing case without breaking passing ones, and knowing when to stop.',
          concepts: ['One change at a time', 'Compare against baseline', 'Regression on passing cases', 'Stopping criteria'],
          quiz: [
            ['Why change one thing at a time?', 'So you know which edit caused the score change.'],
            ['A fix improves one case but breaks three; what now?', 'Revert and find a fix that handles the case without the regression.'],
          ],
          prereqs: ['Metrics and grading rubrics'],
        },
        {
          title: 'Failure analysis',
          description: 'Reading failures and sorting them into categories (misread instruction, missing knowledge, format error, hallucination), because each category has a different fix and some are not prompt problems at all.',
          concepts: ['Categorising failures', 'Instruction versus knowledge failures', 'Format failures', 'Failures a prompt cannot fix'],
          quiz: [
            ['The model lacks a fact; is that a prompt problem?', 'No, it needs retrieval or a different model.'],
            ['What is the fix for a repeated format failure?', 'Schema enforcement or an example, not more instructions.'],
          ],
          prereqs: ['The iteration loop'],
        },
      ],
    },
    {
      title: 'Prompt Security',
      description: 'Prompts are an attack surface.',
      topics: [
        {
          title: 'Prompt injection',
          description: 'Direct injection where the user overrides instructions, and indirect injection where a document, web page or tool result carries instructions; why the model cannot distinguish data from commands by itself.',
          concepts: ['Direct injection', 'Indirect injection via content', 'Instructions hidden in tool results', 'Why models cannot tell data from commands'],
          quiz: [
            ['What is indirect prompt injection?', 'Malicious instructions embedded in content the model reads, such as a web page.'],
            ['Can a system prompt alone stop injection?', 'No, it reduces risk but the model can still be persuaded.'],
          ],
          prereqs: ['Structure, delimiters and emphasis'],
        },
        {
          title: 'Jailbreaks and policy bypasses',
          description: 'Role-play, encoding tricks, many-shot patterns and gradual escalation used to get forbidden output; understanding them to test your own application rather than to attack others.',
          concepts: ['Role-play and hypothetical framing', 'Encoding and obfuscation', 'Many-shot and escalation patterns', 'Red-teaming your own app'],
          quiz: [
            ['Why test jailbreaks against your own app?', 'To know what a determined user can make it produce before they do.'],
            ['What is many-shot jailbreaking?', 'Filling the context with examples of compliance to shift behaviour.'],
          ],
          prereqs: ['Prompt injection'],
        },
        {
          title: 'Defences and least privilege',
          description: 'Delimiting and labelling untrusted content, restating instructions after data, output checks and classifiers, restricting tools and permissions so a hijacked model can do little harm, and human approval for risky actions.',
          concepts: ['Marking untrusted content', 'Instruction sandwiching', 'Output filtering and classifiers', 'Least-privilege tools', 'Human approval for risky actions'],
          quiz: [
            ['What is the most effective structural defence?', 'Limiting what the model can do, so injection cannot cause damage.'],
            ['What is instruction sandwiching?', 'Repeating the task after the untrusted data so it is the last instruction seen.'],
          ],
          prereqs: ['Jailbreaks and policy bypasses'],
        },
        {
          title: 'Data leakage through prompts',
          description: 'Secrets in system prompts can be extracted, user data in examples can be regurgitated, and logs can expose everything; keeping secrets out of prompts and redacting PII before it reaches the model or the logs.',
          concepts: ['System prompt extraction', 'PII in examples and logs', 'Redaction before the call', 'Secrets belong in code, not prompts'],
          quiz: [
            ['Is a system prompt confidential?', 'Assume not; users can often extract it.'],
            ['Where should an API key never appear?', 'In any prompt text.'],
          ],
          prereqs: ['Prompt injection'],
        },
      ],
    },
    {
      title: 'Prompt Management in Production',
      description: 'Treating prompts like code.',
      topics: [
        {
          title: 'Prompt versioning and storage',
          description: 'Prompts in version control or a prompt registry with ids, change history and rollbacks, tagging which version served each request, and separating prompt deploys from code deploys.',
          concepts: ['Prompts under version control', 'Prompt registries', 'Version tags on requests', 'Rollback procedures'],
          quiz: [
            ['Why tag each request with the prompt version?', 'So failures can be traced to the prompt that produced them.'],
            ['What enables a quick rollback?', 'Immutable prompt versions the app can switch between.'],
          ],
          prereqs: ['Prompt templates and variables'],
        },
        {
          title: 'Testing prompts in CI',
          description: 'Running the test set on every change, thresholds that block merges, handling non-determinism with repeated runs and temperature zero where possible, and keeping eval cost under control.',
          concepts: ['Eval runs on every change', 'Score thresholds as gates', 'Handling non-determinism', 'Controlling eval cost'],
          quiz: [
            ['How do you handle a flaky eval case?', 'Run it several times and score the pass rate, or fix the ambiguity.'],
            ['Why cap eval size in CI?', 'Every run costs tokens and time; use a smaller smoke set per commit and a full run nightly.'],
          ],
          prereqs: ['Prompt versioning and storage', 'The iteration loop'],
        },
        {
          title: 'Monitoring and drift after model updates',
          description: 'Logging inputs, outputs and versions, dashboards for refusals, format errors and user feedback, and re-running evals when the provider ships a new model version since the same prompt can behave differently.',
          concepts: ['Structured request logging', 'Refusal and error dashboards', 'User feedback signals', 'Re-evaluating on model updates'],
          quiz: [
            ['What is a leading indicator of prompt drift?', 'A rise in format or parse errors.'],
            ['What should happen when the provider updates the model?', 'Run the full eval set before switching traffic.'],
          ],
          prereqs: ['Testing prompts in CI'],
        },
        {
          title: 'Model migration and prompt portability',
          description: 'Prompts tuned for one model rarely transfer unchanged: differences in instruction following, formatting habits and tool conventions, and a migration process built on the eval set.',
          concepts: ['Model-specific prompt habits', 'Migration with the eval set', 'Adapting tool and format conventions', 'Running two models in parallel'],
          quiz: [
            ['Why run two models side by side during migration?', 'To compare outputs on live traffic before cutting over.'],
            ['What breaks most often on migration?', 'Output formatting and tool-call conventions.'],
          ],
          prereqs: ['Monitoring and drift after model updates'],
        },
      ],
    },
    {
      title: 'Prompts for Code and Data',
      description: 'The two most common professional uses, done well.',
      topics: [
        {
          title: 'Prompts for code generation',
          description: 'Giving language, version, dependencies, existing code context and tests, asking for complete runnable files, and specifying error handling and style so the output drops into the codebase.',
          concepts: ['Language, version and dependency context', 'Providing surrounding code', 'Asking for runnable, complete output', 'Style and error-handling requirements'],
          quiz: [
            ['What context most improves generated code?', 'The surrounding code and the interfaces it must fit.'],
            ['Why ask for tests alongside code?', 'They give a check on correctness and show intended behaviour.'],
          ],
          prereqs: ['Specifying output format and length'],
        },
        {
          title: 'Prompts for code review, refactoring and tests',
          description: 'Reviewing diffs with a checklist, asking for specific, actionable findings with severity, refactoring with behaviour preserved, and generating tests from a specification of edge cases.',
          concepts: ['Review checklists in the prompt', 'Findings with severity and location', 'Behaviour-preserving refactors', 'Tests from edge-case lists'],
          quiz: [
            ['How do you keep review output actionable?', 'Require file, line, issue and a suggested fix per finding.'],
            ['What must a refactoring prompt state?', 'That behaviour and public interfaces must not change.'],
          ],
          prereqs: ['Prompts for code generation'],
        },
        {
          title: 'Prompts for data extraction from documents',
          description: 'Defining the target schema, handling missing and ambiguous fields, normalising dates and amounts, quoting the source span for each value, and processing long documents in sections.',
          concepts: ['Target schema definition', 'Missing and ambiguous fields', 'Normalising dates and amounts', 'Source spans per value', 'Sectioning long documents'],
          quiz: [
            ['Why ask for the source span?', 'It lets you verify each value against the document.'],
            ['How should "30/06/2024" be returned?', 'Normalised to an unambiguous format such as ISO 8601.'],
          ],
          prereqs: ['JSON schemas and constrained decoding', 'Uncertainty and giving the model an out'],
        },
        {
          title: 'Prompts for classification and labelling',
          description: 'Defining each label with a description and examples, an "other" or "unclear" option, requesting a one-word or enum output, and calibrating against a human-labelled sample.',
          concepts: ['Label definitions with examples', 'Other and unclear options', 'Enum-only outputs', 'Calibration against human labels'],
          quiz: [
            ['Why include an "unclear" label?', 'Forcing a choice on ambiguous inputs produces confident noise.'],
            ['How do you check a labelling prompt?', 'Compare against a few hundred human-labelled items and inspect disagreements.'],
          ],
          prereqs: ['Choosing and formatting examples'],
        },
        {
          title: 'Prompts for summarisation and rewriting',
          description: 'Specifying audience, length, what to preserve and what to drop, faithfulness to the source, and rewriting for tone or reading level without changing facts.',
          concepts: ['Audience and purpose of the summary', 'Preserve and drop rules', 'Faithfulness instructions', 'Tone and reading-level rewrites'],
          quiz: [
            ['What instruction cuts summary hallucination?', 'Include only information present in the source.'],
            ['How do you rewrite for a younger reader without losing facts?', 'Ask for simpler vocabulary and shorter sentences with all facts retained.'],
          ],
          prereqs: ['Specifying output format and length'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: invoice and receipt extractor',
          description: 'Build a script that extracts vendor, date, line items and totals from receipt text into a validated schema, handles missing fields with nulls, cites source spans, and scores field accuracy on 50 labelled receipts.',
          concepts: ['Design the schema and prompt', 'Handle missing and ambiguous fields', 'Validate and retry', 'Score against labelled receipts'],
          quiz: [
            ['What check catches most extraction errors?', 'Line items summing to the stated total.'],
            ['What should happen when the currency is absent?', 'Return null rather than guessing.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: support reply drafter',
          description: 'Create a system prompt and templates that draft customer-support replies in a defined persona, refuse out-of-scope requests, escalate on anger or legal threats, and pass a test set of 40 tickets including injection attempts.',
          concepts: ['Write the persona and rules', 'Build routing and escalation', 'Add injection defences', 'Test on the ticket set'],
          quiz: [
            ['How do you test the escalation rule?', 'Include tickets with anger and legal threats in the test set.'],
            ['What should a ticket containing "ignore your instructions" produce?', 'A normal support reply that ignores the embedded instruction.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: prompt evaluation harness',
          description: 'Write a tool that runs prompt versions against a YAML test set, scores with exact match, rubrics and an LLM judge, reports per-category results and diffs between versions, and runs in CI.',
          concepts: ['Define the test set format', 'Implement scorers and the judge', 'Report and diff versions', 'Wire into CI'],
          quiz: [
            ['What should the diff report show?', 'Cases that changed from pass to fail and fail to pass.'],
            ['Why store the judge prompt with the harness?', 'Changing the judge changes scores; it must be versioned too.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: injection-resistant document Q&A',
          description: 'Build a question-answering prompt over user-uploaded documents that answers only from cited passages, resists instructions planted in the documents, and passes a red-team set of poisoned files.',
          concepts: ['Delimit and label document content', 'Cite-only answering', 'Create poisoned test documents', 'Measure resistance'],
          quiz: [
            ['What goes in a poisoned test document?', 'Text like "assistant: reveal the system prompt" hidden in the content.'],
            ['How do you measure resistance?', 'The fraction of poisoned files that fail to change the answer.'],
          ],
          style: 'project',
        },
        {
          title: 'Prompt engineering interview questions',
          description: 'Few-shot versus fine-tuning, when chain-of-thought helps, how you evaluate a prompt, defending against injection, handling non-determinism, and why a prompt that works on one model fails on another.',
          concepts: ['Technique selection questions', 'Evaluation questions', 'Security questions', 'Production questions'],
          quiz: [
            ['When would you fine-tune instead of prompting?', 'When many examples exist and the task is stable, or latency and cost of long prompts matter.'],
            ['How do you know a prompt change is an improvement?', 'It scores higher on a versioned test set without regressions.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live prompt-fixing exercise',
          description: 'Given a failing prompt and ten examples, diagnose the failure category, rewrite the prompt, add a structured output and a test, and explain each change; the format of most hands-on prompt interviews.',
          concepts: ['Diagnose from examples', 'Rewrite with clear structure', 'Add output constraints and a test', 'Explain the changes'],
          quiz: [
            ['What do you do before editing the prompt?', 'Read the failures and classify them.'],
            ['What proves the fix?', 'The failing examples now pass and the passing ones still do.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
