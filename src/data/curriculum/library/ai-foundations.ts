import { defineTrack } from '../define'

export const aiFoundations = defineTrack({
  id: 'track-ai-foundations',
  title: 'AI Engineering Foundations',
  description: 'The mental models an AI engineer needs before touching a framework: what AI, ML and deep learning actually are, how an AI application is put together, how data and models move through their lifecycles, how to pick between building, calling and fine-tuning a model, and how to evaluate, budget, secure and ship one responsibly.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🧠',
  tags: ['ai', 'machine learning', 'ai engineering', 'evaluation', 'mlops', 'responsible ai'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'What AI Is and Is Not',
      description: 'Precise vocabulary so every later decision rests on the right distinctions.',
      topics: [
        {
          title: 'AI, machine learning and deep learning',
          description: 'AI is the goal of machines performing tasks that need intelligence; ML is learning a function from data instead of writing rules; deep learning is ML with many-layered neural networks. Knowing which layer a problem sits in decides tooling, data needs and cost.',
          concepts: ['AI as a goal, ML as a method', 'Learning a function from examples', 'Deep learning as stacked representations', 'Where classic algorithms still win'],
          quiz: [
            ['Is every AI system a machine learning system?', 'No. Rule-based expert systems and search are AI without learned parameters.'],
            ['What makes deep learning "deep"?', 'Multiple layers that learn intermediate representations rather than one hand-designed feature step.'],
            ['When is a lookup table a better choice than a model?', 'When the mapping is small, fixed and fully known.'],
          ],
        },
        {
          title: 'Rule-based systems versus learned models',
          description: 'Hand-written rules are transparent and cheap when the logic is small and stable; learned models win when the rules are unknown, fuzzy or change with the data. Most real products combine both, with rules as guardrails around a model.',
          concepts: ['Rules: explicit, testable, brittle', 'Models: learned, adaptive, opaque', 'Hybrid designs with rule guardrails', 'Signs a rule system should become a model'],
          quiz: [
            ['Name one advantage of a rule-based system over a model.', 'Every decision can be traced to a readable rule.'],
            ['When do rules typically break down?', 'When inputs are noisy or the number of cases grows beyond what humans can enumerate.'],
          ],
        },
        {
          title: 'Supervised, unsupervised and reinforcement learning',
          description: 'The three learning set-ups differ by what signal the algorithm gets: labelled targets, no labels, or rewards from actions. Recognising the set-up tells you what data to collect and which family of algorithms applies.',
          concepts: ['Labelled targets in supervised learning', 'Finding structure without labels', 'Rewards and policies in reinforcement learning', 'Self-supervised pretraining', 'Matching a business problem to a set-up'],
          quiz: [
            ['What does a supervised dataset contain that an unsupervised one does not?', 'A target label for each example.'],
            ['What signal trains a reinforcement learning agent?', 'A reward received after taking actions in an environment.'],
            ['How do language models get labels for pretraining?', 'Self-supervision: the next token in existing text is the label.'],
          ],
          prereqs: ['AI, machine learning and deep learning'],
        },
        {
          title: 'Discriminative versus generative models',
          description: 'A discriminative model predicts a label or number from an input; a generative model produces new content such as text, images or audio. The distinction changes how you evaluate (accuracy versus quality and faithfulness) and how outputs can fail.',
          concepts: ['Predicting labels versus producing content', 'Classifier, regressor and generator outputs', 'Why generative outputs are harder to score', 'Combining a generator with a classifier'],
          quiz: [
            ['Is a spam filter discriminative or generative?', 'Discriminative: it maps an email to a spam/not-spam label.'],
            ['Why is accuracy a poor single metric for a text generator?', 'Many different outputs can be correct, so exact-match accuracy misses quality.'],
          ],
        },
        {
          title: 'Why AI works now: data, compute and transformers',
          description: 'The current wave comes from three things arriving together: web-scale datasets, GPUs that make matrix multiplication cheap, and the transformer architecture that scales predictably. Understanding this explains why capabilities and costs move the way they do.',
          concepts: ['Web-scale data and self-supervision', 'GPUs and parallel matrix maths', 'Transformers and scaling laws', 'Foundation models and reuse'],
          quiz: [
            ['What do scaling laws describe?', 'How loss falls predictably as model size, data and compute grow.'],
            ['What is a foundation model?', 'A large pretrained model adapted to many downstream tasks instead of trained per task.'],
          ],
        },
      ],
    },
    {
      title: 'Anatomy of an AI Application',
      description: 'The four moving parts of any AI product: model, data, serving and feedback.',
      topics: [
        {
          title: 'The four parts: model, data, serving, feedback',
          description: 'Every AI application is a model that turns inputs into outputs, the data that shaped it, the serving layer that puts it in a request path, and the feedback loop that tells you how it is doing. Diagramming these first prevents building a great model nobody can call.',
          concepts: ['Model as a function with weights', 'Data that trains and data that flows', 'Serving layer and request path', 'Feedback capture and loops'],
          quiz: [
            ['Which part of an AI app is usually missing in a demo?', 'The feedback loop that measures real-world performance.'],
            ['Where does a prompt template belong in the four-part picture?', 'In the serving layer, as part of turning a request into model input.'],
          ],
        },
        {
          title: 'Where the model sits in a request path',
          description: 'A model call is one step in a chain: validate input, fetch context, call the model, post-process, log and respond. Placing it deliberately decides latency, cost and what can be cached or retried.',
          concepts: ['Synchronous versus asynchronous inference', 'Pre-processing before the call', 'Batch scoring versus online scoring', 'Calling a model from an API handler'],
          quiz: [
            ['When is batch scoring preferable to online inference?', 'When predictions are needed on a schedule for many records, not per request.'],
            ['Why validate input before calling a model?', 'Bad input wastes a paid, slow call and can produce confident nonsense.'],
          ],
          prereqs: ['The four parts: model, data, serving, feedback'],
        },
        {
          title: 'Inputs: features, prompts and context',
          description: 'Classic models consume engineered feature vectors; language models consume prompts assembled from instructions, retrieved context and user text. Both are input contracts that must be versioned and tested because a silent change breaks the model without any error.',
          concepts: ['Feature vectors and schemas', 'Prompt templates as code', 'Retrieved context and grounding', 'Input drift and contract tests'],
          quiz: [
            ['Why treat a prompt template like source code?', 'Changing it changes model behaviour, so it needs versioning, review and tests.'],
            ['What is training-serving skew?', 'Features computed differently at training time than at inference time.'],
          ],
        },
        {
          title: 'Outputs: post-processing, thresholds and guardrails',
          description: 'Raw model output is rarely the final answer: probabilities need thresholds, generated text needs parsing and safety checks, and rejected outputs need a fallback. The post-processing layer is where product behaviour is actually tuned.',
          concepts: ['Thresholds and decision rules', 'Parsing structured output', 'Output validation and refusal', 'Fallback paths when checks fail'],
          quiz: [
            ['Why not always threshold a classifier at 0.5?', 'The right cut-off depends on the relative cost of false positives and false negatives.'],
            ['What should happen when generated JSON fails to parse?', 'Retry with a correction prompt or fall back to a safe default, never crash.'],
          ],
        },
        {
          title: 'Feedback loops and data flywheels',
          description: 'Logged predictions, user corrections and outcomes become tomorrow\'s training and evaluation data. Designing that capture from day one turns usage into a compounding advantage and exposes failures before they reach a dashboard.',
          concepts: ['Explicit and implicit feedback signals', 'Logging predictions with inputs', 'Turning feedback into eval sets', 'Risks of feedback contamination'],
          quiz: [
            ['Give an example of implicit feedback.', 'A user editing or ignoring a suggested reply.'],
            ['What is a data flywheel?', 'Usage generates data that improves the model, which drives more usage.'],
          ],
          prereqs: ['The four parts: model, data, serving, feedback'],
        },
      ],
    },
    {
      title: 'Data and Model Lifecycles',
      description: 'How data becomes a model and how a model ages.',
      topics: [
        {
          title: 'Data collection and labelling',
          description: 'Models are limited by the data they see, so sourcing, sampling and labelling are engineering work: writing labelling guidelines, measuring inter-annotator agreement and deciding what a representative sample is.',
          concepts: ['Sampling and representativeness', 'Labelling guidelines and edge cases', 'Inter-annotator agreement', 'Weak and programmatic labelling', 'Synthetic data and its limits'],
          quiz: [
            ['Why measure inter-annotator agreement?', 'Low agreement means the labels, not just the model, are noisy.'],
            ['What is weak supervision?', 'Generating noisy labels from heuristics or other models instead of humans.'],
          ],
        },
        {
          title: 'Train, validation and test splits',
          description: 'The training set fits parameters, the validation set steers choices, and the test set gives one honest final score. Splitting by time or by group instead of at random is what keeps that final score honest.',
          concepts: ['Purpose of each split', 'Random, stratified and grouped splits', 'Time-based splits', 'Keeping the test set untouched'],
          quiz: [
            ['Why is the test set used only once?', 'Every peek turns it into another validation set and inflates the score.'],
            ['When must you split by time?', 'When the model will predict the future from the past, such as forecasting or fraud.'],
          ],
          prereqs: ['Data collection and labelling'],
        },
        {
          title: 'Data quality and leakage',
          description: 'Duplicates, mislabelled rows and features that secretly encode the target produce models that look brilliant offline and fail in production. Leakage is the most common cause of a too-good-to-be-true result.',
          concepts: ['Target leakage through features', 'Duplicates across splits', 'Label noise and its cost', 'Data profiling checks'],
          quiz: [
            ['What is target leakage?', 'A feature that contains information about the label that would not be available at prediction time.'],
            ['Why are duplicates across train and test harmful?', 'The model has memorised the answer, so the test score is inflated.'],
          ],
          prereqs: ['Train, validation and test splits'],
        },
        {
          title: 'Training versus inference',
          description: 'Training runs backward passes over a whole dataset for hours on accelerators; inference runs a forward pass per request in milliseconds. They have different hardware, cost, latency and reliability profiles, and confusing them leads to mis-sized systems.',
          concepts: ['Forward pass versus backward pass', 'Compute and memory at each stage', 'Throughput versus latency goals', 'Separating training and serving code'],
          quiz: [
            ['Which stage needs gradients?', 'Training; inference only runs the forward pass.'],
            ['Why is inference often optimised for latency rather than throughput?', 'A user is waiting on each request.'],
          ],
        },
        {
          title: 'Model versioning and lineage',
          description: 'A model artefact is only reproducible if you can name the code, data snapshot, hyperparameters and environment that made it. A model registry ties these together so rollbacks and audits are possible.',
          concepts: ['What a model artefact contains', 'Registry entries and stages', 'Linking data snapshots to runs', 'Rollback to a previous version'],
          quiz: [
            ['What four things must be recorded to reproduce a model?', 'Code version, data snapshot, hyperparameters and environment.'],
            ['What does a model registry add over a file store?', 'Versioned metadata, lineage and promotion stages such as staging and production.'],
          ],
          prereqs: ['Training versus inference'],
        },
        {
          title: 'Drift and retraining triggers',
          description: 'The world changes after deployment: input distributions shift and the relationship to the target changes. Monitoring drift and defining when to retrain keeps a model from decaying quietly.',
          concepts: ['Data drift versus concept drift', 'Drift detection statistics', 'Scheduled versus triggered retraining', 'Shadow and canary evaluation'],
          quiz: [
            ['What is concept drift?', 'The relationship between inputs and the target changes, even if inputs look the same.'],
            ['Name one simple drift check.', 'Compare the distribution of a feature this week against the training distribution, for example with a PSI or KS test.'],
          ],
          prereqs: ['Model versioning and lineage'],
        },
      ],
    },
    {
      title: 'Choosing a Model: Build, Call or Fine-tune',
      description: 'The decision that shapes a project\'s budget, timeline and risk.',
      topics: [
        {
          title: 'Calling a hosted model API',
          description: 'A hosted API gives instant access to a strong model with no training, at the cost of per-call pricing, vendor dependence and sending data outside your boundary. It is the default first step for most language and vision tasks.',
          concepts: ['Pay-per-token economics', 'Vendor lock-in and abstraction', 'Data residency questions', 'Prototyping speed'],
          quiz: [
            ['What is the biggest advantage of starting with an API?', 'A working prototype in hours with no training data.'],
            ['Name a risk of relying on a hosted API.', 'Model deprecations or price changes you do not control.'],
          ],
        },
        {
          title: 'Training your own model',
          description: 'Training from scratch fits the model exactly to your data and keeps everything in-house, but demands labelled data, ML expertise and ongoing maintenance. It shines for tabular problems, tight latency budgets and domains far from public data.',
          concepts: ['When tabular models beat large models', 'Data and expertise requirements', 'Full control over latency and cost', 'Ongoing ownership burden'],
          quiz: [
            ['For a fraud model on transaction tables, what is usually best?', 'A gradient-boosted tree model trained on your own data.'],
            ['What hidden cost comes with owning a model?', 'Retraining, monitoring and on-call maintenance forever.'],
          ],
        },
        {
          title: 'Fine-tuning a pretrained model',
          description: 'Fine-tuning adapts a pretrained model with a smaller labelled set, giving domain behaviour without training from scratch. It is worth it for style, format and specialised vocabulary, and much less so for injecting facts that retrieval can supply.',
          concepts: ['What fine-tuning changes', 'Full versus parameter-efficient methods', 'Fine-tuning versus retrieval for knowledge', 'Data needed to see a gain'],
          quiz: [
            ['Should you fine-tune to teach a model your product documentation?', 'Usually not; retrieval-augmented prompting handles changing facts better.'],
            ['What does LoRA reduce?', 'The number of trainable parameters and memory needed to adapt a large model.'],
          ],
          prereqs: ['Calling a hosted model API', 'Training your own model'],
        },
        {
          title: 'Open-weights versus proprietary models',
          description: 'Open-weights models can be self-hosted, inspected and fine-tuned freely; proprietary models are often stronger and simpler to consume. Licence terms, hosting capacity and compliance decide which is viable.',
          concepts: ['Licence terms and permitted use', 'Self-hosting cost and capacity', 'Capability gaps and benchmarks', 'Portability between providers'],
          quiz: [
            ['What does "open weights" mean?', 'The trained parameters are downloadable, even if training data and code are not.'],
            ['Why check a model licence before shipping?', 'Some restrict commercial use or require attribution.'],
          ],
        },
        {
          title: 'The decision matrix: cost, data, control, latency',
          description: 'Score the options on data available, latency budget, cost per prediction, need for control and time to market, then start with the cheapest option that meets the bar. Most teams move from API to fine-tuned or custom models only when volume or requirements justify it.',
          concepts: ['Scoring options on five axes', 'Start simple, then specialise', 'Volume thresholds for switching', 'Writing the decision down'],
          quiz: [
            ['What usually justifies moving from an API to a self-hosted model?', 'High volume where per-call cost exceeds hosting cost, or strict data and latency needs.'],
            ['Why write the model decision down?', 'So it can be revisited when volume, price or requirements change.'],
          ],
          prereqs: ['Fine-tuning a pretrained model', 'Open-weights versus proprietary models'],
        },
      ],
    },
    {
      title: 'Evaluation Fundamentals',
      description: 'You cannot improve what you cannot measure, and most AI failures are measurement failures.',
      topics: [
        {
          title: 'Offline metrics and what they hide',
          description: 'Accuracy, F1, RMSE and BLEU summarise performance on a held-out set, but a single number hides class imbalance, subgroup failures and whether errors matter equally. Pick metrics that reflect the decision the model supports.',
          concepts: ['Choosing a metric from the decision', 'Accuracy under imbalance', 'Precision, recall and F1 intuition', 'Metric blind spots'],
          quiz: [
            ['Why can 99% accuracy be a bad model?', 'If 99% of examples share one class, predicting that class always scores 99%.'],
            ['Which metric matters most when missing a positive is costly?', 'Recall.'],
          ],
        },
        {
          title: 'Baselines and sanity checks',
          description: 'A majority-class predictor, a simple heuristic or last week\'s value tells you whether a model adds any value. Beating a baseline is the minimum bar and often reveals leakage or a broken split when the gap is implausibly large.',
          concepts: ['Majority and random baselines', 'Simple heuristic baselines', 'Implausible gains as a warning sign', 'Sanity checks on a tiny sample'],
          quiz: [
            ['What is the first baseline to compute for a classifier?', 'Always predict the most common class.'],
            ['What does a model that scores 100% on a hard task suggest?', 'Leakage or a bug in the evaluation, not a breakthrough.'],
          ],
          prereqs: ['Offline metrics and what they hide'],
        },
        {
          title: 'Evaluation sets and golden data',
          description: 'A curated, versioned evaluation set with known answers is the most valuable asset in an AI project. It should cover normal cases, edge cases and past failures, and be refreshed as feedback arrives without ever leaking into training.',
          concepts: ['Building a golden set', 'Covering edge cases and past failures', 'Versioning eval data', 'Keeping eval data out of training'],
          quiz: [
            ['How big does an initial golden set need to be?', 'Often 50 to 200 carefully chosen examples beat thousands of random ones.'],
            ['Where should the golden set live?', 'Under version control or a dataset registry, not in a notebook.'],
          ],
        },
        {
          title: 'Human evaluation and rubrics',
          description: 'For generative outputs, humans scoring against a written rubric is the ground truth that automatic metrics approximate. Clear criteria, calibration rounds and agreement checks make those scores usable.',
          concepts: ['Writing a scoring rubric', 'Pairwise versus absolute judgements', 'Calibrating raters', 'Model-as-judge and its biases'],
          quiz: [
            ['Why prefer pairwise comparisons for text quality?', 'People are more consistent choosing the better of two than assigning absolute scores.'],
            ['What is a known bias of model-as-judge scoring?', 'Preferring longer or more confident answers regardless of correctness.'],
          ],
          prereqs: ['Evaluation sets and golden data'],
        },
        {
          title: 'Online evaluation and A/B tests',
          description: 'Offline scores predict but do not prove product impact. Shadow deployments, canaries and A/B tests measure the model on real traffic against the metric the business cares about, with guardrail metrics to catch harm.',
          concepts: ['Shadow deployment', 'Canary rollouts', 'A/B tests with guardrail metrics', 'Offline-online metric gaps'],
          quiz: [
            ['What does a shadow deployment do?', 'Runs the new model on live traffic without showing its outputs to users.'],
            ['What is a guardrail metric?', 'A metric that must not degrade, such as latency or complaint rate, even if the primary metric improves.'],
          ],
          prereqs: ['Baselines and sanity checks'],
        },
      ],
    },
    {
      title: 'Latency, Cost and Reliability',
      description: 'The engineering constraints that decide whether a model can ship.',
      topics: [
        {
          title: 'Latency budgets and where time goes',
          description: 'End-to-end latency is network, queueing, pre-processing, model compute and post-processing added together. Measuring each segment at p50 and p99 shows what to optimise and whether a model can fit an interactive budget at all.',
          concepts: ['Breaking down a request timeline', 'p50 versus p99 latency', 'Time to first token in streaming', 'Setting a latency budget'],
          quiz: [
            ['Why track p99 latency and not just the average?', 'Averages hide the slow tail that users actually notice.'],
            ['What does streaming improve for a chat product?', 'Perceived latency, because the first tokens appear before the full answer is done.'],
          ],
        },
        {
          title: 'Token and compute cost models',
          description: 'Hosted models charge per input and output token; self-hosted models cost GPU-hours regardless of load. Estimating cost per request and per month from expected traffic prevents a prototype that is unaffordable at scale.',
          concepts: ['Input and output token pricing', 'GPU-hour cost and utilisation', 'Cost per request and per user', 'Prompt length as a cost lever'],
          quiz: [
            ['Why are output tokens usually priced higher than input tokens?', 'Generating each output token requires a full forward pass.'],
            ['How do you estimate monthly API spend?', 'Requests per month times average tokens per request times price per token.'],
          ],
        },
        {
          title: 'Caching, batching and routing',
          description: 'Reusing identical or similar responses, grouping requests into batches and sending easy requests to smaller models cut both latency and cost. Each has a correctness trade-off that must be checked against the evaluation set.',
          concepts: ['Exact and semantic caching', 'Dynamic batching on the server', 'Routing by difficulty or tier', 'Measuring savings without quality loss'],
          quiz: [
            ['What risk does semantic caching introduce?', 'Returning a cached answer for a question that is similar but not the same.'],
            ['What is model routing?', 'Sending each request to the cheapest model expected to answer it well.'],
          ],
          prereqs: ['Latency budgets and where time goes', 'Token and compute cost models'],
        },
        {
          title: 'Timeouts, retries and fallbacks',
          description: 'Model calls fail: providers rate-limit, GPUs run out of memory, networks drop. Bounded retries with backoff, sensible timeouts and a defined fallback answer keep the product working when the model does not.',
          concepts: ['Choosing timeouts per call', 'Exponential backoff with jitter', 'Idempotency of retried calls', 'Fallback models and defaults'],
          quiz: [
            ['Why add jitter to retry delays?', 'To stop many clients retrying at the same instant and overwhelming the service.'],
            ['What is a sensible fallback when the primary model is down?', 'A smaller model, a cached answer or an honest "try again" message.'],
          ],
        },
        {
          title: 'Rate limits and quotas',
          description: 'Providers cap requests and tokens per minute; your own GPUs cap concurrent batches. Client-side limiting, queueing and quota planning per feature avoid cascading failures when traffic spikes.',
          concepts: ['Requests and tokens per minute', 'Client-side rate limiting', 'Queueing and load shedding', 'Quota planning per feature'],
          quiz: [
            ['What HTTP status usually signals a rate limit?', '429 Too Many Requests.'],
            ['What is load shedding?', 'Rejecting low-priority requests early so high-priority ones still succeed.'],
          ],
          prereqs: ['Timeouts, retries and fallbacks'],
        },
        {
          title: 'Observability for AI systems',
          description: 'Beyond uptime, an AI system needs traces of each model call with inputs, outputs, latency, cost and quality signals. This is what lets you debug a bad answer a week later and see drift before users complain.',
          concepts: ['Tracing a model call end to end', 'Logging inputs and outputs safely', 'Quality signals in dashboards', 'Alerting on cost and error spikes'],
          quiz: [
            ['What should a trace of an LLM call include?', 'Prompt, response, model version, latency, token counts and any evaluation score.'],
            ['Why alert on token usage?', 'A prompt bug or abuse can multiply spend before anyone notices.'],
          ],
        },
      ],
    },
    {
      title: 'Privacy, Safety and Responsible Use',
      description: 'The failure modes that hurt people and companies, and how engineers reduce them.',
      topics: [
        {
          title: 'PII and data minimisation',
          description: 'Personal data in prompts, logs and training sets creates legal and ethical exposure. Collect only what the task needs, redact before logging, and know which providers retain or train on what you send.',
          concepts: ['Identifying PII in inputs', 'Redaction before logging', 'Provider retention and training policies', 'Consent and purpose limitation'],
          quiz: [
            ['What is data minimisation?', 'Collecting and keeping only the data the task actually requires.'],
            ['Why redact before logging rather than after?', 'Once PII is written to logs it spreads to backups and dashboards.'],
          ],
        },
        {
          title: 'Prompt injection and untrusted input',
          description: 'Any text a model reads, including documents and web pages, can contain instructions that hijack its behaviour. Treat model input as untrusted, limit what tools the model can trigger and validate outputs before acting on them.',
          concepts: ['Direct and indirect injection', 'Separating instructions from data', 'Least-privilege tool access', 'Output validation before actions'],
          quiz: [
            ['What is indirect prompt injection?', 'Malicious instructions hidden in content the model retrieves, such as a web page or email.'],
            ['Why is an LLM with a send-email tool risky?', 'Injected text could make it send data to an attacker.'],
          ],
        },
        {
          title: 'Bias, fairness and representativeness',
          description: 'Models reproduce the patterns in their data, including historical discrimination and under-representation. Measuring performance per subgroup and choosing a fairness definition explicitly are engineering tasks, not afterthoughts.',
          concepts: ['Sources of bias in data', 'Subgroup performance reports', 'Fairness definitions and their conflicts', 'Mitigation options'],
          quiz: [
            ['Why can removing a protected attribute fail to remove bias?', 'Other features such as postcode can proxy for it.'],
            ['Name one fairness metric.', 'Equal opportunity: equal true positive rates across groups.'],
          ],
        },
        {
          title: 'Hallucination and grounding',
          description: 'Generative models produce fluent text that can be false. Grounding answers in retrieved sources, asking for citations, constraining outputs and measuring faithfulness turn confident fiction into a checkable claim.',
          concepts: ['Why models fabricate', 'Grounding with retrieved sources', 'Citations and faithfulness checks', 'Abstaining when unsure'],
          quiz: [
            ['What is a hallucination in a language model?', 'Output that is fluent and confident but not supported by facts or the provided sources.'],
            ['How does retrieval reduce hallucination?', 'The model answers from supplied text instead of only from memory, and the text can be cited.'],
          ],
          prereqs: ['Prompt injection and untrusted input'],
        },
        {
          title: 'Governance: model cards, audits and regulation',
          description: 'Documenting what a model is for, how it was evaluated and where it fails, plus keeping audit trails, is now expected by customers and regulators such as the EU AI Act. Lightweight documentation done early is far cheaper than a retrofit.',
          concepts: ['Model cards and datasheets', 'Risk tiers in regulation', 'Audit trails for decisions', 'Human oversight requirements'],
          quiz: [
            ['What does a model card document?', 'Intended use, training data summary, evaluation results and known limitations.'],
            ['What does the EU AI Act base obligations on?', 'The risk level of the use case.'],
          ],
          prereqs: ['Bias, fairness and representativeness'],
        },
      ],
    },
    {
      title: 'The AI Engineering Role and Workflow',
      description: 'What the job is day to day and how work moves from idea to production.',
      topics: [
        {
          title: 'AI engineer, ML engineer and data scientist',
          description: 'Data scientists explore data and build models; ML engineers productionise training and serving; AI engineers build products on top of models, often pretrained ones, with a focus on prompts, retrieval, evaluation and integration. Knowing the boundaries clarifies what to learn.',
          concepts: ['Responsibilities by role', 'Overlap and hand-offs', 'Skills that transfer between roles', 'Typical team shapes'],
          quiz: [
            ['What distinguishes an AI engineer from an ML engineer?', 'AI engineers mostly build on pretrained models and focus on application, evaluation and integration.'],
            ['Which role owns the training pipeline in a mature team?', 'Usually the ML engineer.'],
          ],
        },
        {
          title: 'From idea to prototype: the notebook-first loop',
          description: 'Start with a small dataset and a notebook, get a baseline in a day, then iterate on data and prompts before touching architecture. The fastest teams shorten the loop between a change and a measured result.',
          concepts: ['Time-boxed feasibility spikes', 'Baseline in a day', 'Iterating on data before models', 'Knowing when to stop'],
          quiz: [
            ['What is the goal of a feasibility spike?', 'To learn quickly whether the problem is solvable at an acceptable quality.'],
            ['What should you change first when results are poor?', 'The data and the evaluation, before the model architecture.'],
          ],
        },
        {
          title: 'Experiment tracking and reproducibility',
          description: 'Every run should record its config, data version, metrics and artefacts so results can be compared and reproduced weeks later. Tools such as MLflow or Weights & Biases do this, but a disciplined folder and CSV is better than nothing.',
          concepts: ['What to log per run', 'Comparing runs fairly', 'Seeds and determinism', 'Tracking tools versus conventions'],
          quiz: [
            ['Why fix random seeds?', 'So differences between runs come from your changes, not from randomness.'],
            ['What is the minimum to log per experiment?', 'Code version, config, data version and the resulting metrics.'],
          ],
          prereqs: ['From idea to prototype: the notebook-first loop'],
        },
        {
          title: 'Defining success with stakeholders',
          description: 'Translate a business goal into a measurable target, agree what "good enough" means and what failures are unacceptable before building. This avoids shipping a model that meets a metric nobody cares about.',
          concepts: ['Business goal to model metric', 'Agreeing acceptance thresholds', 'Naming unacceptable failures', 'Communicating uncertainty'],
          quiz: [
            ['Why agree a threshold before training?', 'So the decision to ship is not moved to whatever score the model happens to reach.'],
            ['How should you present a model result to a non-technical stakeholder?', 'In terms of the decision it supports and its error costs, not the raw metric.'],
          ],
        },
        {
          title: 'Shipping and iterating an AI feature',
          description: 'Release behind a flag, roll out gradually, watch quality and cost dashboards, collect feedback, and schedule the next improvement. An AI feature is never finished; the process is the product.',
          concepts: ['Feature flags and staged rollout', 'Post-launch monitoring checklist', 'Feedback triage into a backlog', 'Deprecating a model safely'],
          quiz: [
            ['Why release an AI feature behind a flag?', 'To roll back instantly if quality or cost goes wrong.'],
            ['What should be reviewed in the first week after launch?', 'Error rates, latency, cost and samples of real outputs against the rubric.'],
          ],
          prereqs: ['Defining success with stakeholders', 'Experiment tracking and reproducibility'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: support ticket classifier with scikit-learn',
          description: 'Build a classifier that routes support tickets to teams: split data properly, compute a majority baseline, train TF-IDF plus logistic regression, report per-class precision and recall, pick thresholds per team and write a short model card.',
          concepts: ['Split and baseline first', 'Train and tune the classifier', 'Report per-class metrics', 'Write the model card'],
          quiz: [
            ['Why compute the majority baseline before training?', 'To know whether the model adds value over predicting the most common team.'],
            ['Why report per-class metrics rather than overall accuracy?', 'Small but important teams can be badly served while accuracy still looks fine.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: image classifier with a pretrained torchvision model',
          description: 'Fine-tune a pretrained ResNet on a small labelled image set with PyTorch: load and augment data, replace the head, train with a validation loop, measure accuracy and a confusion matrix, and export the model for inference.',
          concepts: ['Prepare and augment the dataset', 'Replace the head and fine-tune', 'Track validation metrics', 'Export for inference'],
          quiz: [
            ['Why start from a pretrained backbone?', 'It already knows general visual features, so far less data is needed.'],
            ['What does a confusion matrix show that accuracy does not?', 'Which classes are confused with which.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: document question-answering over an LLM API',
          description: 'Build a small assistant that answers questions from a folder of documents: chunk and embed text, retrieve relevant chunks, prompt a hosted model with citations, add timeouts and retries, and evaluate on a golden set of 30 questions.',
          concepts: ['Chunk and embed documents', 'Retrieve and build the prompt', 'Handle failures and cost', 'Evaluate against a golden set'],
          quiz: [
            ['Why cite the retrieved chunks in the answer?', 'So users can verify claims and hallucinations become visible.'],
            ['What should the golden set contain?', 'Questions with known answers, including some the documents cannot answer.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: evaluation harness for a model endpoint',
          description: 'Write a reusable harness that runs a versioned evaluation set against any model endpoint, records latency, cost and scores per example, compares two runs side by side, and fails a CI job when quality drops below a threshold.',
          concepts: ['Load and version the eval set', 'Run and record per-example results', 'Compare runs and flag regressions', 'Wire into CI'],
          quiz: [
            ['Why store per-example results rather than only an average?', 'To see which cases regressed and debug them.'],
            ['What makes an eval harness useful in CI?', 'A pass/fail threshold so a prompt change cannot silently degrade quality.'],
          ],
          style: 'project',
        },
        {
          title: 'AI foundations interview questions',
          description: 'The questions that test whether you think like an engineer: ML versus deep learning, leakage, why a test set is sacred, API versus fine-tune trade-offs, drift, and how to evaluate a generative model.',
          concepts: ['Definitions and distinctions', 'Data and evaluation questions', 'Build-versus-buy questions', 'Reliability and safety questions'],
          quiz: [
            ['How would you detect data leakage?', 'Check for features unavailable at prediction time and for implausibly high validation scores.'],
            ['When would you fine-tune instead of prompting?', 'When you need consistent style or format that prompting cannot reliably achieve.'],
          ],
          style: 'reading',
        },
        {
          title: 'Designing an AI system in an interview',
          description: 'A structured way to answer "design a system that does X with AI": clarify the decision and success metric, sketch model, data, serving and feedback, choose a model strategy, then cover evaluation, latency, cost, privacy and failure modes.',
          concepts: ['Clarify the decision and metric', 'Sketch the four parts', 'Justify the model strategy', 'Cover failure modes and monitoring'],
          quiz: [
            ['What should you ask before proposing a model?', 'What decision the output drives and what an error costs.'],
            ['Name two non-functional requirements to cover.', 'Latency budget and cost per request.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
