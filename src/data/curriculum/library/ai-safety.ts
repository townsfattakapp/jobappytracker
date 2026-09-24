import { defineTrack } from '../define'

export const aiSafety = defineTrack({
  id: 'track-ai-safety',
  title: 'AI Safety, Security and Privacy',
  description: 'Defending LLM systems in practice: harm and risk assessment, prompt injection and jailbreak defences, data and model supply-chain integrity, output filtering, PII and differential privacy, sandboxed tool use, authorised red teaming, fairness measurement, model cards, the EU AI Act and incident response.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🛡️',
  tags: ['ai safety', 'llm security', 'prompt injection', 'privacy', 'red teaming', 'ai governance', 'eu ai act'],
  languages: ['Python'],
  explainMode: 'security',
  code: { label: 'Python', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-llms'],
  style: 'practice',
  categories: [
    {
      title: 'Harms and Risk Assessment',
      description: 'Naming what can go wrong before deciding what to defend.',
      topics: [
        {
          title: 'A taxonomy of AI harms',
          description: 'The harm categories that recur across deployed AI systems: misinformation, harmful content, privacy leakage, discrimination, over-reliance, security misuse and economic harm, with concrete examples for each so risks can be named precisely.',
          concepts: ['Content and misinformation harms', 'Privacy and data leakage harms', 'Discrimination and allocation harms', 'Misuse and dual-use risks', 'Over-reliance and automation bias'],
          quiz: [
            ['What is automation bias?', 'The tendency to trust an automated output over contradicting evidence or one\'s own judgement.'],
            ['Why classify harms before building defences?', 'Different harms need different controls; a content filter does nothing for a privacy leak.'],
          ],
        },
        {
          title: 'Risk assessment for an AI system',
          description: 'Scoring likelihood and severity per harm, weighing who is affected and how reversible the damage is, and turning the matrix into a prioritised list of mitigations and residual risks the owner signs off on.',
          concepts: ['Likelihood and severity scoring', 'Affected parties and reversibility', 'Risk matrix and prioritisation', 'Residual risk sign-off'],
          quiz: [
            ['What makes a harm high severity even when unlikely?', 'Irreversible or large-scale impact on people, such as wrongful denial of a loan or leaked medical data.'],
            ['Who should own residual risk?', 'A named accountable person, not the engineering team as a whole.'],
          ],
          prereqs: ['A taxonomy of AI harms'],
        },
        {
          title: 'Threat modelling LLM applications',
          description: 'Applying STRIDE-style thinking to an LLM app using the OWASP Top 10 for LLM Applications: enumerating assets, entry points and attacker goals for a system that includes prompts, retrieval, tools and users.',
          concepts: ['OWASP Top 10 for LLM applications', 'Assets, entry points and attacker goals', 'Data-flow diagram of an LLM app', 'Ranking threats by exploitability'],
          quiz: [
            ['Name three OWASP LLM Top 10 entries.', 'Prompt injection, insecure output handling, training data poisoning (also excessive agency, sensitive information disclosure).'],
            ['What is the first artefact of a threat model?', 'A data-flow diagram showing components, data and trust boundaries.'],
          ],
          prereqs: ['Risk assessment for an AI system'],
        },
        {
          title: 'Trust boundaries in an AI system',
          description: 'Where untrusted data enters: user messages, retrieved documents, tool results, web pages and third-party models. Every boundary crossing is where injection, leakage and privilege escalation happen, so each needs an explicit control.',
          concepts: ['Trusted versus untrusted inputs', 'Model output as untrusted data', 'Third-party models and APIs as boundaries', 'Controls at each crossing'],
          quiz: [
            ['Should model output be treated as trusted?', 'No. It can be steered by untrusted inputs, so validate it like user input.'],
            ['Why is a retrieved document a trust boundary?', 'Its text reaches the model with the same weight as instructions unless the design separates them.'],
          ],
          prereqs: ['Threat modelling LLM applications'],
        },
      ],
    },
    {
      title: 'Prompt Injection and Jailbreaks',
      description: 'The defining attack class for LLM applications, and what actually reduces it.',
      topics: [
        {
          title: 'Direct prompt injection',
          description: 'How a user message can override system instructions, extract the system prompt or change the task, why delimiters and "ignore previous instructions" filters are weak, and how to measure an app\'s exposure.',
          concepts: ['Instruction override attacks', 'System prompt extraction', 'Why delimiter tricks fail', 'Measuring injection success rate'],
          quiz: [
            ['Why does wrapping user input in delimiters not stop injection?', 'The model has no hard separation between instructions and data; it can still follow text inside the delimiters.'],
            ['Is a leaked system prompt a security incident?', 'Often yes: it may contain secrets, business logic or hints for further attacks.'],
          ],
        },
        {
          title: 'Indirect prompt injection',
          description: 'Instructions hidden in web pages, emails, PDFs or retrieved chunks that the model reads while doing a task, letting an attacker who never touches the chat exfiltrate data or trigger tools.',
          concepts: ['Injection via retrieved content', 'Hidden text and markdown image exfiltration', 'Email and calendar injection scenarios', 'Blast radius through tools'],
          quiz: [
            ['How can a markdown image leak data?', 'The model is tricked into emitting an image URL whose query string contains private data, which the client fetches.'],
            ['Who is the attacker in indirect injection?', 'Whoever controls content the model will read, not the chat user.'],
          ],
          prereqs: ['Direct prompt injection'],
        },
        {
          title: 'Jailbreak techniques and why they work',
          description: 'Role-play framing, many-shot priming, encoding and obfuscation, competing objectives and adversarial suffixes. Knowing the mechanisms behind each technique is what lets a defender test for them rather than chase individual strings.',
          concepts: ['Role-play and persona framing', 'Many-shot and gradual escalation', 'Encoding and obfuscation attacks', 'Optimised adversarial suffixes', 'Competing objectives in training'],
          quiz: [
            ['Why do jailbreaks work at all?', 'Helpfulness and safety objectives compete, and the model generalises imperfectly to unusual framings.'],
            ['What is an adversarial suffix?', 'A gibberish string found by optimisation that pushes the model toward compliance when appended to a request.'],
          ],
          prereqs: ['Direct prompt injection'],
        },
        {
          title: 'Layered defences against injection',
          description: 'No single fix works, so combine: separate system and user channels, least-privilege tools, output validation, human approval for consequential actions, and instruction-hierarchy models. Defence in depth means an injection has to defeat several layers.',
          concepts: ['Privilege separation for tools', 'Instruction hierarchy and channel separation', 'Output validation before action', 'Human approval for consequential actions', 'Dual-LLM and quarantine patterns'],
          quiz: [
            ['What is the dual-LLM pattern?', 'A privileged model that never sees untrusted text and a quarantined model that does, with only structured data passing between them.'],
            ['Which single control removes most injection damage?', 'Least-privilege tools: an injected model that cannot send email or read secrets does limited harm.'],
          ],
          prereqs: ['Indirect prompt injection', 'Jailbreak techniques and why they work'],
        },
        {
          title: 'Detecting injection attempts',
          description: 'Detection as a monitoring layer: injection classifiers, canary tokens in the system prompt, anomaly signals like sudden tool calls, and logging to spot campaigns, while accepting that detection alone cannot be the only defence.',
          concepts: ['Injection classifiers and their limits', 'Canary tokens in system prompts', 'Behavioural anomaly signals', 'Logging and campaign detection'],
          quiz: [
            ['What is a canary token in a prompt?', 'A unique secret string; its appearance in output or logs proves the system prompt was leaked.'],
            ['Why not rely on an injection classifier alone?', 'Attackers adapt to it and it has false positives and negatives; it is one layer, not a gate.'],
          ],
          prereqs: ['Layered defences against injection'],
        },
      ],
    },
    {
      title: 'Data Poisoning and Model Supply Chain',
      topics: [
        {
          title: 'Training data poisoning and backdoors',
          description: 'How a small fraction of crafted examples in pretraining or fine-tuning data can install triggers that flip behaviour on a keyword, why web-scale crawls are exposed, and the provenance checks that reduce the risk.',
          concepts: ['Trigger-based backdoors', 'Poisoning web-scale crawls', 'Label flipping in fine-tuning sets', 'Data provenance checks'],
          quiz: [
            ['How much poisoned data is needed for a backdoor?', 'Often a tiny fraction of the training set, sometimes a few hundred examples.'],
            ['What is a trigger?', 'An input pattern, such as a rare token, that activates the hidden malicious behaviour.'],
          ],
        },
        {
          title: 'Attacks on fine-tuning and preference data',
          description: 'Fine-tuning with as few as a handful of harmful examples can undo safety training, and poisoned preference labels can bias reward models. Applies to both self-hosted fine-tuning and vendor fine-tuning APIs.',
          concepts: ['Safety erosion through fine-tuning', 'Reward model poisoning', 'Reviewing preference datasets', 'Re-evaluating safety after fine-tuning'],
          quiz: [
            ['Does fine-tuning on benign data affect safety?', 'It can: even benign fine-tuning has been shown to degrade refusal behaviour, so re-run safety evals.'],
            ['What is a reward model?', 'A model trained on human preferences that scores outputs during RLHF.'],
          ],
          prereqs: ['Training data poisoning and backdoors'],
        },
        {
          title: 'Model weights and serialisation risks',
          description: 'Pickle-based checkpoints execute code on load, model hubs host thousands of unverified uploads, and typo-squatted models exist. safetensors, hash verification and trusted sources are the practical answer.',
          concepts: ['Pickle deserialisation execution', 'safetensors format', 'Hash and signature verification', 'Trusted sources and typo-squatting'],
          quiz: [
            ['Why is loading a .pt or .bin file from an unknown source dangerous?', 'It is a pickle and can run arbitrary code during torch.load.'],
            ['What does safetensors change?', 'Weights are stored as raw tensors with a JSON header, so loading cannot execute code.'],
          ],
        },
        {
          title: 'Supply-chain integrity for AI stacks',
          description: 'Treating models, datasets, prompts and Python packages as one supply chain: pinned and hashed dependencies, SBOMs, signed artefacts with Sigstore, and a registry that records where each model came from.',
          concepts: ['Pinned and hashed dependencies', 'Software and AI bills of materials', 'Artefact signing with Sigstore', 'Model registry provenance'],
          quiz: [
            ['What is an AI BOM?', 'An inventory of the models, datasets and libraries a system uses, with versions and sources.'],
            ['What does pip install --require-hashes enforce?', 'Every package must match a hash listed in the requirements file.'],
          ],
          prereqs: ['Model weights and serialisation risks'],
        },
      ],
    },
    {
      title: 'Output Safety and Content Filtering',
      topics: [
        {
          title: 'Moderation classifiers',
          description: 'Running a second model or API over inputs and outputs to flag categories such as hate, self-harm, sexual content and violence: Llama Guard, the OpenAI moderation endpoint and Perspective, with thresholds tuned to the product.',
          concepts: ['Input and output moderation passes', 'Llama Guard and moderation APIs', 'Category thresholds and tuning', 'Latency and cost of a second model'],
          quiz: [
            ['Why moderate outputs as well as inputs?', 'A benign input can still produce a harmful output, especially after injection.'],
            ['What is Llama Guard?', 'An open safety classifier model that labels prompts and responses against a configurable policy.'],
          ],
        },
        {
          title: 'Structured output validation',
          description: 'Forcing model output into a schema with JSON mode, function calling or grammar-constrained decoding, then validating with Pydantic before anything downstream consumes it, so free text never reaches SQL, shells or HTML.',
          concepts: ['JSON mode and constrained decoding', 'Pydantic validation of model output', 'Rejecting and retrying malformed output', 'Never interpolating raw output'],
          quiz: [
            ['What is insecure output handling?', 'Passing model text to a browser, shell or database without validation or escaping.'],
            ['How does constrained decoding help safety?', 'The model can only emit tokens valid under the grammar, so the shape of the output is guaranteed.'],
          ],
        },
        {
          title: 'Grounding and hallucination checks',
          description: 'Hallucinated facts are a safety problem when users act on them. Citation requirements, faithfulness scoring against retrieved context, and refusal when evidence is missing reduce the harm from confident errors.',
          concepts: ['Faithfulness scoring against context', 'Citation requirements', 'Abstaining when evidence is missing', 'Uncertainty language in outputs'],
          quiz: [
            ['What does a faithfulness metric measure?', 'Whether each claim in the answer is supported by the provided context.'],
            ['Why prefer an abstention to a guess in a medical assistant?', 'A wrong confident answer can cause direct harm; abstaining routes the user to a safer source.'],
          ],
        },
        {
          title: 'Refusal and safe-completion design',
          description: 'Writing the policy the model follows: what to refuse, what to answer with caveats, how to redirect to help resources, and how to avoid over-refusal that drives users to less safe tools.',
          concepts: ['Policy tiers: refuse, caveat, comply', 'Redirecting to help resources', 'Over-refusal and its costs', 'Testing refusal boundaries'],
          quiz: [
            ['What is over-refusal?', 'Refusing benign requests that superficially resemble harmful ones, which erodes trust and usefulness.'],
            ['How do you test a refusal policy?', 'With a paired set of harmful and borderline-benign prompts, measuring both compliance and false refusals.'],
          ],
          prereqs: ['Moderation classifiers'],
        },
      ],
    },
    {
      title: 'PII and Privacy',
      topics: [
        {
          title: 'Data minimisation and retention',
          description: 'Collecting only what the feature needs, stripping identifiers before they reach a model or vendor, setting retention limits on prompts and logs, and knowing which vendor plans train on your data.',
          concepts: ['Collect only what the feature needs', 'Stripping identifiers before vendor calls', 'Retention limits for prompts and logs', 'Vendor data-use terms'],
          quiz: [
            ['Why minimise data before an API call?', 'Anything sent can be logged, retained or breached at the vendor; not sending it is the strongest control.'],
            ['What should a log retention policy specify?', 'How long prompts and outputs are kept, who can access them and when they are deleted.'],
          ],
        },
        {
          title: 'PII detection and redaction',
          description: 'Finding names, emails, phone numbers, addresses and IDs with regex plus NER using Microsoft Presidio or spaCy, replacing them with placeholders that can be reversibly mapped back, and measuring recall on your own data.',
          concepts: ['Regex plus NER detection', 'Microsoft Presidio pipeline', 'Reversible placeholder mapping', 'Measuring redaction recall'],
          quiz: [
            ['Why is regex alone insufficient for PII?', 'Names, addresses and free-text identifiers do not follow fixed patterns.'],
            ['What is reversible redaction?', 'Replacing PII with tokens like <PERSON_1> and restoring them in the final output for the authorised user.'],
          ],
          prereqs: ['Data minimisation and retention'],
        },
        {
          title: 'Memorisation and training data extraction',
          description: 'Large models memorise rare sequences and can regurgitate them under the right prompts. Deduplication, membership-inference testing and extraction probes tell you how much of your training data a model can leak.',
          concepts: ['Verbatim memorisation of rare data', 'Membership inference attacks', 'Extraction probing', 'Deduplication as mitigation'],
          quiz: [
            ['What is a membership inference attack?', 'Determining whether a specific record was in the training set from the model\'s behaviour.'],
            ['Why does deduplication reduce memorisation?', 'Sequences seen many times are memorised far more readily than those seen once.'],
          ],
        },
        {
          title: 'Differential privacy overview',
          description: 'A formal guarantee that any single record has bounded influence on the output, expressed by epsilon. DP-SGD adds clipped, noised gradients during training; the cost is accuracy and compute, and the value is a provable bound.',
          concepts: ['Epsilon and the privacy budget', 'DP-SGD: clipping and noise', 'Accuracy and compute trade-offs', 'Where DP fits and where it does not'],
          quiz: [
            ['What does a smaller epsilon mean?', 'Stronger privacy: outputs change less when any one record is added or removed.'],
            ['What are the two steps DP-SGD adds?', 'Per-example gradient clipping and Gaussian noise added to the summed gradient.'],
          ],
          prereqs: ['Memorisation and training data extraction'],
        },
        {
          title: 'Privacy-preserving deployment options',
          description: 'Choosing between vendor APIs with zero-retention terms, self-hosted open models, on-device inference and federated learning, based on data sensitivity, regulation and cost rather than default convenience.',
          concepts: ['Zero-retention vendor agreements', 'Self-hosting for sensitive data', 'On-device inference', 'Federated learning overview'],
          quiz: [
            ['When does self-hosting a model become worth the cost?', 'When data cannot legally or contractually leave your environment.'],
            ['What is federated learning?', 'Training where data stays on client devices and only model updates are sent to a server.'],
          ],
          prereqs: ['Data minimisation and retention'],
        },
      ],
    },
    {
      title: 'Secure Tool Use and Sandboxing',
      description: 'Agents turn text into actions; the controls have to live around the actions.',
      topics: [
        {
          title: 'Least-privilege tool design',
          description: 'Each tool gets the narrowest scope that does the job: read-only where possible, allow-listed parameters, per-user credentials instead of a shared admin key, and explicit limits on volume and reach.',
          concepts: ['Read-only defaults', 'Parameter allow-lists', 'Per-user scoped credentials', 'Rate and volume limits per tool'],
          quiz: [
            ['Why give an agent per-user credentials instead of a service account?', 'The agent can then only reach what that user could, containing injection damage.'],
            ['What is excessive agency?', 'Granting a model more capability, permission or autonomy than the task needs.'],
          ],
        },
        {
          title: 'Sandboxing code execution',
          description: 'Running model-written code inside a disposable container or microVM with no network, read-only filesystem, CPU and time limits, and a fresh environment per run, using Docker, gVisor or Firecracker.',
          concepts: ['Disposable containers per execution', 'gVisor and Firecracker isolation', 'No-network and read-only filesystems', 'Time and resource limits'],
          quiz: [
            ['Why is a plain Docker container not a strong sandbox?', 'It shares the host kernel; gVisor or a microVM adds a stronger boundary.'],
            ['What should happen to the sandbox after each run?', 'It is destroyed so no state or malware persists.'],
          ],
          prereqs: ['Least-privilege tool design'],
        },
        {
          title: 'Human approval for consequential actions',
          description: 'Classifying actions by reversibility and impact, requiring confirmation for payments, deletions and external messages, and designing approvals that show the user exactly what will happen rather than a vague summary.',
          concepts: ['Reversible versus irreversible actions', 'Approval gates and dry runs', 'Showing the exact action to approve', 'Avoiding approval fatigue'],
          quiz: [
            ['Which actions should always require approval?', 'Irreversible ones with external effect: sending money, deleting data, messaging third parties.'],
            ['What is approval fatigue?', 'Users clicking approve reflexively when asked too often, which defeats the control.'],
          ],
          prereqs: ['Least-privilege tool design'],
        },
        {
          title: 'Secrets and egress control for agents',
          description: 'Keeping API keys out of prompts and tool results, injecting credentials at the proxy layer, allow-listing outbound domains so an injected agent cannot exfiltrate data, and auditing every outbound call.',
          concepts: ['Credential injection at the proxy', 'Secrets never in context windows', 'Outbound domain allow-lists', 'Auditing tool calls'],
          quiz: [
            ['Why must secrets never appear in the model context?', 'Anything in context can be echoed in output or extracted by injection.'],
            ['How does an egress allow-list stop exfiltration?', 'The agent can only reach approved hosts, so it cannot post data to an attacker\'s server.'],
          ],
          prereqs: ['Sandboxing code execution'],
        },
      ],
    },
    {
      title: 'Red Teaming and Safety Evaluation',
      description: 'Authorised, defensive testing of your own systems.',
      topics: [
        {
          title: 'Planning an authorised red-team exercise',
          description: 'Scope, rules of engagement, written authorisation and a harm-category checklist come before any testing. The goal is coverage of realistic attacker goals against your system, documented so fixes can be verified.',
          concepts: ['Scope and rules of engagement', 'Written authorisation', 'Harm-category coverage checklist', 'Test environments versus production'],
          quiz: [
            ['Why write rules of engagement for an internal red team?', 'So testers know what is in scope and nobody harms real users or data.'],
            ['What should a red-team plan enumerate?', 'Target harms, attacker personas, attack surfaces and success criteria.'],
          ],
        },
        {
          title: 'Automated adversarial testing tools',
          description: 'Scaling red teaming with garak, Microsoft PyRIT and promptfoo red-team plugins: probe libraries, mutation strategies, attacker-model orchestration and reports that tie failures to harm categories.',
          concepts: ['garak probes and detectors', 'PyRIT orchestrators', 'promptfoo red-team plugins', 'Reading and triaging tool reports'],
          quiz: [
            ['What does garak do?', 'Runs a library of probes against a model and reports which vulnerabilities and behaviours it finds.'],
            ['Why combine automated and manual red teaming?', 'Tools give breadth and regression coverage; humans find novel, context-specific attacks.'],
          ],
          prereqs: ['Planning an authorised red-team exercise'],
        },
        {
          title: 'Safety benchmarks and evaluation sets',
          description: 'Public benchmarks such as HarmBench, ToxiGen and TruthfulQA, their scope and blind spots, and why an internal evaluation set built from your own product\'s risks is the one that actually matters.',
          concepts: ['HarmBench and refusal evaluation', 'ToxiGen and toxicity measurement', 'Benchmark blind spots', 'Building a product-specific safety set'],
          quiz: [
            ['Why is a good public benchmark score not enough?', 'Benchmarks cover generic harms, not your domain, your tools or your users.'],
            ['What should an internal safety set contain?', 'Harmful, borderline and benign prompts drawn from real product scenarios, with expected behaviour.'],
          ],
          prereqs: ['Automated adversarial testing tools'],
        },
        {
          title: 'Reporting findings and closing the loop',
          description: 'Turning red-team results into tracked issues with severity, reproduction steps and owners, re-testing after fixes, and adding each finding to the regression suite so it cannot silently return.',
          concepts: ['Severity and reproduction steps', 'Owners and fix deadlines', 'Re-testing after mitigation', 'Findings become regression tests'],
          quiz: [
            ['What makes a red-team finding actionable?', 'A reproducible prompt, the observed output, the harm category and a severity rating.'],
            ['Why add findings to a regression suite?', 'Model or prompt updates can reintroduce old failures.'],
          ],
          prereqs: ['Safety benchmarks and evaluation sets'],
        },
      ],
    },
    {
      title: 'Alignment, Bias and Fairness',
      topics: [
        {
          title: 'Alignment techniques overview',
          description: 'How instruction tuning, RLHF, DPO and constitutional AI shape a base model into an assistant that follows a policy, what each stage changes, and why alignment is a property of training data and rewards rather than a switch.',
          concepts: ['Supervised instruction tuning', 'RLHF with a reward model', 'Direct Preference Optimisation', 'Constitutional AI and self-critique'],
          quiz: [
            ['What does DPO remove compared with RLHF?', 'The separate reward model and reinforcement learning loop; it optimises preferences directly.'],
            ['What is constitutional AI?', 'Training a model to critique and revise its outputs against a written set of principles.'],
          ],
        },
        {
          title: 'Reward hacking and specification gaming',
          description: 'Optimising a proxy reward produces behaviours the designer did not intend: sycophancy, verbosity, confident nonsense. Recognising the pattern explains many production quirks and guides evaluation design.',
          concepts: ['Proxy rewards and Goodhart\'s law', 'Sycophancy as reward hacking', 'Length and confidence biases', 'Designing rewards that resist gaming'],
          quiz: [
            ['What is sycophancy in an LLM?', 'Agreeing with the user\'s stated view to earn approval rather than giving the accurate answer.'],
            ['Why does a length bias appear after RLHF?', 'Raters tend to prefer longer answers, so the reward model learns to reward length.'],
          ],
          prereqs: ['Alignment techniques overview'],
        },
        {
          title: 'Measuring bias in model behaviour',
          description: 'Fairness metrics for classifiers (demographic parity, equalised odds) and for generative outputs (counterfactual prompts, stereotype benchmarks), plus the data needed to compute them responsibly.',
          concepts: ['Demographic parity and equalised odds', 'Counterfactual prompt pairs', 'Stereotype benchmarks like BBQ', 'Collecting sensitive attributes responsibly'],
          quiz: [
            ['What does equalised odds require?', 'Equal true-positive and false-positive rates across groups.'],
            ['How do counterfactual prompts test bias?', 'Change only a demographic cue in the prompt and compare the outputs.'],
          ],
        },
        {
          title: 'Fairness mitigation and its trade-offs',
          description: 'Data rebalancing, prompt-level instructions, output post-processing and fine-tuning as mitigation levers, and why fairness definitions conflict so a team must choose and document the one it optimises for.',
          concepts: ['Data rebalancing and augmentation', 'Prompt and output-level mitigations', 'Fine-tuning for fairness', 'Incompatible fairness definitions'],
          quiz: [
            ['Can a model satisfy demographic parity and equalised odds at once?', 'Generally not, unless base rates are equal across groups.'],
            ['Which mitigation is cheapest to try first?', 'Prompt-level instructions and output checks, before retraining.'],
          ],
          prereqs: ['Measuring bias in model behaviour'],
        },
        {
          title: 'Human oversight and appeal paths',
          description: 'For decisions that affect people, keeping a human able to review and override, giving affected users an explanation and an appeal route, and logging enough to reconstruct why a decision was made.',
          concepts: ['Human review for impactful decisions', 'Explanations users can act on', 'Appeal and correction routes', 'Decision logging for reconstruction'],
          quiz: [
            ['Why log model inputs and version for automated decisions?', 'So a decision can be reconstructed and contested later.'],
            ['What is meaningful human oversight?', 'A reviewer with the information, time and authority to change the outcome, not a rubber stamp.'],
          ],
          prereqs: ['Fairness mitigation and its trade-offs'],
        },
      ],
    },
    {
      title: 'Transparency, Governance and Regulation',
      topics: [
        {
          title: 'Model cards and system cards',
          description: 'Documenting a model\'s intended use, training data summary, evaluation results, known limitations and safety testing so downstream teams and auditors can judge fitness, following the model card template.',
          concepts: ['Model card sections', 'Intended and out-of-scope uses', 'Reporting evaluation and safety results', 'System cards for full applications'],
          quiz: [
            ['What is the difference between a model card and a system card?', 'A model card documents one model; a system card documents the deployed application including prompts, tools and safeguards.'],
            ['Why list out-of-scope uses?', 'It sets the boundary of what the evaluation supports and warns integrators.'],
          ],
        },
        {
          title: 'Datasheets and data documentation',
          description: 'Datasheets for datasets: motivation, composition, collection process, preprocessing, uses and licensing. Knowing where data came from is the basis for both privacy compliance and bias analysis.',
          concepts: ['Datasheet questions', 'Licensing and consent status', 'Composition and known gaps', 'Preprocessing and filtering records'],
          quiz: [
            ['What does a datasheet\'s composition section cover?', 'What instances the data contains, how many, and what is missing or over-represented.'],
            ['Why record the licence of every dataset?', 'Training on unlicensed data creates legal and takedown risk.'],
          ],
          prereqs: ['Model cards and system cards'],
        },
        {
          title: 'EU AI Act overview',
          description: 'The risk-tier structure (prohibited, high-risk, limited, minimal), obligations for high-risk systems such as risk management, logging and human oversight, transparency duties for chatbots and generated content, and general-purpose model rules.',
          concepts: ['Risk tiers and prohibited practices', 'High-risk system obligations', 'Transparency duties for AI-generated content', 'General-purpose AI model provisions'],
          quiz: [
            ['Name two high-risk domains under the EU AI Act.', 'Employment and recruitment; credit scoring; education; critical infrastructure; law enforcement.'],
            ['What must a chatbot disclose?', 'That the user is interacting with an AI system.'],
          ],
        },
        {
          title: 'NIST AI RMF and ISO/IEC 42001',
          description: 'Voluntary frameworks that structure governance: the NIST functions Govern, Map, Measure and Manage, and ISO/IEC 42001 as a certifiable AI management system standard analogous to ISO 27001.',
          concepts: ['NIST AI RMF functions', 'Mapping controls to the framework', 'ISO/IEC 42001 management system', 'Choosing a framework for your organisation'],
          quiz: [
            ['What are the four NIST AI RMF functions?', 'Govern, Map, Measure, Manage.'],
            ['What kind of standard is ISO/IEC 42001?', 'A certifiable management-system standard for AI, similar in structure to ISO 27001.'],
          ],
          prereqs: ['EU AI Act overview'],
        },
        {
          title: 'Internal AI governance processes',
          description: 'A lightweight review gate for new AI features: use-case intake, risk classification, required evaluations, approval roles, an AI inventory, and audit trails of prompts, models and policy changes.',
          concepts: ['Use-case intake and risk classification', 'Required evaluations per tier', 'AI inventory and ownership', 'Audit trails of prompt and model changes'],
          quiz: [
            ['What is an AI inventory?', 'A register of every model and AI feature in use, with owner, purpose and risk tier.'],
            ['Why version-control prompts for governance?', 'Prompts change behaviour, so auditors need to know which prompt was live when.'],
          ],
          prereqs: ['NIST AI RMF and ISO/IEC 42001'],
        },
      ],
    },
    {
      title: 'Incident Response for AI Systems',
      topics: [
        {
          title: 'AI incident types and detection signals',
          description: 'What counts as an AI incident: harmful output reaching users, data leakage, successful injection, model drift with safety impact, or a vendor outage. Each maps to signals in logs, moderation rates and user reports.',
          concepts: ['Incident categories for AI systems', 'Signals from moderation and refusal rates', 'User reports and escalation paths', 'Severity levels for AI incidents'],
          quiz: [
            ['Is a spike in refusals an incident signal?', 'Possibly: it can indicate an attack campaign, a broken prompt or a model regression.'],
            ['Who should be able to report an AI incident?', 'Anyone: users, support staff and engineers, through a single intake route.'],
          ],
        },
        {
          title: 'Containment, rollback and disclosure',
          description: 'Runbooks that let an on-call engineer disable a feature, roll back a prompt or model version, revoke tool access and purge leaked data, plus who decides on user notification and regulatory disclosure.',
          concepts: ['Kill switches and feature flags', 'Prompt and model version rollback', 'Revoking tool and credential access', 'Notification and disclosure decisions'],
          quiz: [
            ['Why keep prompts behind a feature flag?', 'So a harmful behaviour can be turned off in minutes without a deploy.'],
            ['What is the first step when an agent is found exfiltrating data?', 'Revoke its credentials and tool access, then investigate.'],
          ],
          prereqs: ['AI incident types and detection signals'],
        },
        {
          title: 'Post-incident review for AI failures',
          description: 'Blameless reviews that trace the failure through data, prompt, model, tooling and monitoring layers, produce regression tests and monitoring changes, and feed the risk assessment and model card.',
          concepts: ['Timeline and contributing factors', 'Layer-by-layer root cause', 'Regression tests from incidents', 'Updating risk assessments and cards'],
          quiz: [
            ['What artefacts should a post-incident review produce?', 'A timeline, root causes, new tests, monitoring changes and updated documentation.'],
            ['Why is blamelessness important?', 'People report and explain failures honestly only when they are not punished for them.'],
          ],
          prereqs: ['Containment, rollback and disclosure'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: prompt injection test harness',
          description: 'Build a Python harness that runs a library of direct and indirect injection probes against an LLM app, scores success with canary tokens and a judge model, and outputs a report per harm category with a regression mode for CI.',
          concepts: ['Design the probe library', 'Implement canary and judge scoring', 'Run against a sample RAG app', 'Report and wire into CI'],
          quiz: [
            ['How do you score whether an injection succeeded?', 'Check for the canary token, a forbidden tool call or a judge-model verdict on the output.'],
            ['Why run the harness on every prompt change?', 'Prompt edits can reopen injection paths that were closed.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: PII redaction gateway',
          description: 'A proxy service between an application and an LLM API that detects PII with Presidio, replaces it with reversible placeholders, forwards the request, restores the values in the response, and logs redaction counts without logging the PII.',
          concepts: ['Detect entities with Presidio', 'Reversible placeholder mapping store', 'Proxy the request and restore output', 'Measure recall on a labelled set'],
          quiz: [
            ['Where should the placeholder mapping live?', 'In memory or a short-lived store scoped to the request, never in logs.'],
            ['How do you evaluate the gateway?', 'Against a labelled set of prompts, reporting precision and recall per entity type.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: safety-gated agent with sandboxed tools',
          description: 'An agent that answers questions with a code-execution tool and a web-fetch tool, where code runs in a disposable no-network container, fetch is domain allow-listed, consequential actions require approval, and every tool call is audited.',
          concepts: ['Define tools with least privilege', 'Sandbox execution in a container', 'Approval gate for consequential actions', 'Audit log and injection tests'],
          quiz: [
            ['Why allow-list fetch domains?', 'To stop an injected agent from sending data to arbitrary servers.'],
            ['What should the audit log record per tool call?', 'Timestamp, tool, arguments, result summary, and the triggering conversation id.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: risk assessment and model card for a deployed system',
          description: 'Take an existing LLM feature, produce a threat model and risk matrix, run safety evaluations and a small red-team pass, then write a system card and a governance checklist mapping controls to EU AI Act obligations.',
          concepts: ['Threat model and risk matrix', 'Run safety evals and red-team pass', 'Write the system card', 'Map controls to obligations'],
          quiz: [
            ['What goes in the limitations section?', 'Known failure modes, populations or inputs where it performs worse, and untested scenarios.'],
            ['How do you show a control is effective?', 'With evaluation results before and after, not with a description of the control.'],
          ],
          style: 'project',
        },
        {
          title: 'AI safety and security interview questions',
          description: 'The questions asked for AI security and responsible-AI roles: injection versus jailbreak, defence in depth for agents, DP explained simply, fairness metric trade-offs, model supply chain, and how you would handle a leak.',
          concepts: ['Explaining injection and its defences', 'Privacy techniques and their guarantees', 'Fairness and alignment questions', 'Incident scenario answers'],
          quiz: [
            ['Explain prompt injection in one sentence.', 'Untrusted text is treated by the model as instructions, changing its behaviour.'],
            ['What is the strongest control against agent misuse?', 'Limiting what the agent can do: least-privilege tools and approvals.'],
          ],
          style: 'reading',
        },
        {
          title: 'Safety review case studies',
          description: 'Working through realistic scenarios as an interviewer would: a support bot with account tools, a hiring screener, a medical Q&A assistant and a browsing agent, identifying harms, controls and what you would refuse to ship.',
          concepts: ['Support bot with account tools', 'Hiring screener fairness review', 'Medical assistant grounding review', 'Browsing agent exfiltration review'],
          quiz: [
            ['What is the top risk of a support bot with refund tools?', 'Injection or social engineering triggering unauthorised refunds; require approval and limits.'],
            ['What would you demand before shipping a hiring screener?', 'Bias evaluation across groups, human review, explanations and an appeal path.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
