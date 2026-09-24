import { defineTrack } from '../define'

export const llmEvals = defineTrack({
  id: 'track-llm-evals',
  title: 'LLM Evaluation and Testing',
  description: 'Measuring whether language-model features actually work: building eval datasets, golden answers and rubrics, automatic metrics from exact match to BLEU and embedding similarity, LLM-as-judge and its biases, human evaluation, RAG and agent evals, regression testing and CI for prompts, A/B tests, drift monitoring, safety and red-team evals, benchmark literacy and the tooling that runs it all.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '📏',
  tags: ['evals', 'llm as judge', 'benchmarks', 'promptfoo', 'langfuse', 'regression testing', 'red teaming', 'metrics'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-llms'],
  style: 'practice',
  categories: [
    {
      title: 'Evaluation Foundations',
      description: 'Why model behaviour needs a different kind of testing and how to think about it.',
      topics: [
        {
          title: 'Why evals differ from unit tests',
          description: 'Model outputs are non-deterministic, open-ended and graded rather than right or wrong, so a single assertion cannot judge them; evals run many examples, score them and compare aggregates against thresholds.',
          concepts: ['Non-deterministic outputs', 'Graded rather than binary correctness', 'Aggregates over many examples', 'Thresholds instead of assertions'],
          quiz: [
            ['Why can a prompt pass once and fail the next run?', 'Sampling introduces variation, so behaviour must be measured over many runs.'],
            ['What replaces a pass/fail assertion in an eval?', 'A score aggregated across a dataset compared with a threshold or baseline.'],
          ],
        },
        {
          title: 'Kinds of evals',
          description: 'Capability evals ask what a model can do, regression evals catch what a change broke, safety evals probe harmful behaviour and product evals measure whether users are served; each needs its own dataset and cadence.',
          concepts: ['Capability evals', 'Regression evals', 'Safety evals', 'Product and business evals'],
          quiz: [
            ['Which eval type runs on every prompt change?', 'Regression evals on a fixed dataset.'],
            ['What does a product eval measure that a capability eval does not?', 'Whether the feature achieves its goal for real users, not just model skill.'],
          ],
          prereqs: ['Why evals differ from unit tests'],
        },
        {
          title: 'The eval-driven development loop',
          description: 'Write a small dataset before the prompt, run it on every change, read the failures, fix the prompt or pipeline and add the new failures back; this loop replaces guesswork with measurable iteration.',
          concepts: ['Dataset before prompt', 'Run on every change', 'Reading failures individually', 'Growing the dataset from failures'],
          quiz: [
            ['Why write the eval set before the prompt?', 'It forces you to define what good looks like and prevents fitting the test to the prompt.'],
            ['What do you do with a failure you fixed?', 'Keep it in the dataset as a regression case.'],
          ],
          prereqs: ['Kinds of evals'],
        },
        {
          title: 'Statistics for eval results',
          description: 'Small datasets and noisy scores make differences look real when they are not; confidence intervals, repeated runs, paired comparisons and a sense of the minimum detectable effect keep you from shipping noise.',
          concepts: ['Sample size and variance', 'Confidence intervals on scores', 'Paired comparisons per example', 'Repeated runs for noisy graders'],
          quiz: [
            ['Two prompts score 81 and 83 percent on 50 examples. Is B better?', 'Not demonstrably; the difference is within noise for that sample size.'],
            ['Why compare per example rather than only averages?', 'Paired comparison removes example difficulty variance and detects real changes sooner.'],
          ],
          prereqs: ['Why evals differ from unit tests'],
        },
      ],
    },
    {
      title: 'Building Eval Datasets',
      description: 'The examples and references everything else depends on.',
      topics: [
        {
          title: 'Sourcing examples from production and users',
          description: 'Real inputs from logs, support tickets and user feedback, stratified by intent, difficulty and edge case, make a dataset that predicts production behaviour; hand-written examples alone miss how users actually phrase things.',
          concepts: ['Sampling from production logs', 'Stratifying by intent and difficulty', 'Including edge cases and failures', 'Privacy when using real data'],
          quiz: [
            ['Why stratify the dataset?', 'So rare but important cases are represented rather than drowned by common ones.'],
            ['What must happen to real user data before it enters a dataset?', 'PII redaction and a check that its use is permitted.'],
          ],
          prereqs: ['The eval-driven development loop'],
        },
        {
          title: 'Golden answers and reference outputs',
          description: 'A golden answer is the reference an output is compared against; it must be correct, unambiguous and written to match the expected format, and for open tasks several acceptable references or key facts beat a single string.',
          concepts: ['Writing unambiguous references', 'Multiple acceptable answers', 'Key-fact references for open tasks', 'Reviewing golden answers'],
          quiz: [
            ['Why can a single golden string fail a correct answer?', 'Open tasks have many valid phrasings; the metric must allow for them.'],
            ['What is a key-fact reference?', 'A list of facts an answer must contain rather than one exact wording.'],
          ],
          prereqs: ['Sourcing examples from production and users'],
        },
        {
          title: 'Rubrics for graded outputs',
          description: 'A rubric lists the criteria an output must meet, each with a scale and examples of each score level, so humans and judge models grade consistently; vague criteria such as "high quality" produce noise.',
          concepts: ['Criteria with explicit scales', 'Anchor examples per score', 'Per-example rubric items', 'Testing rubric consistency'],
          quiz: [
            ['What makes a rubric usable by a judge model?', 'Concrete criteria with described score levels and examples.'],
            ['Why include per-example rubric items?', 'Different questions require different specific facts or behaviours to count as correct.'],
          ],
          prereqs: ['Golden answers and reference outputs'],
        },
        {
          title: 'Synthetic data generation for evals',
          description: 'Models can generate inputs, paraphrases, adversarial variants and references at scale; filtered by validators and spot-checked by humans, synthetic data fills gaps in coverage but must not be the only source.',
          concepts: ['Generating inputs and paraphrases', 'Adversarial variants', 'Validating synthetic examples', 'Mixing with real data'],
          quiz: [
            ['What is synthetic data good at?', 'Coverage of many variants cheaply, especially edge cases and paraphrases.'],
            ['Main risk of synthetic-only datasets?', 'They reflect the generator\'s style, not real users, and inflate scores.'],
          ],
          prereqs: ['Golden answers and reference outputs'],
        },
        {
          title: 'Dataset hygiene: versioning, splits and contamination',
          description: 'Datasets need versions, held-out splits that never touch prompt tuning and checks that examples did not leak into few-shot prompts or fine-tuning data; otherwise scores drift upward without real improvement.',
          concepts: ['Dataset versioning', 'Held-out versus development splits', 'Leakage into prompts and training', 'Retiring stale examples'],
          quiz: [
            ['Why keep a held-out split?', 'Tuning against every example overfits the prompt to the test set.'],
            ['What is contamination in evals?', 'Test examples appearing in training or prompt data, making scores meaningless.'],
          ],
          prereqs: ['Synthetic data generation for evals'],
        },
      ],
    },
    {
      title: 'Automatic Metrics',
      description: 'Cheap, deterministic scores and what each one can and cannot see.',
      topics: [
        {
          title: 'Exact and normalised match',
          description: 'Exact match after normalising case, whitespace and punctuation suits classification, short answers and extracted fields; it is fast and unambiguous but punishes any valid rephrasing.',
          concepts: ['Normalisation before comparison', 'Match on extracted fields', 'Accuracy on classification tasks', 'Where exact match is too strict'],
          quiz: [
            ['When is exact match appropriate?', 'Short factual answers, labels and structured fields with one correct value.'],
            ['What normalisation is standard?', 'Lowercasing, stripping punctuation and articles, collapsing whitespace.'],
          ],
          prereqs: ['Golden answers and reference outputs'],
        },
        {
          title: 'Token F1, precision and recall',
          description: 'Token-level F1 credits partial overlap between the answer and the reference, so "Paris, France" and "Paris" score close; it is the standard for extractive question answering and a useful loose check elsewhere.',
          concepts: ['Token overlap computation', 'Precision versus recall of tokens', 'F1 for extractive QA', 'Limits of bag-of-words scoring'],
          quiz: [
            ['What does token F1 ignore?', 'Word order and meaning; only overlap counts.'],
            ['Which task made token F1 standard?', 'Extractive question answering such as SQuAD.'],
          ],
          prereqs: ['Exact and normalised match'],
        },
        {
          title: 'BLEU and ROUGE',
          description: 'BLEU measures n-gram precision against references and ROUGE measures recall, born for translation and summarisation; they correlate weakly with quality for open generation and should be read as rough overlap signals.',
          concepts: ['n-gram precision in BLEU', 'ROUGE-N and ROUGE-L recall', 'Brevity penalty', 'Weak correlation with quality'],
          quiz: [
            ['What does ROUGE-L measure?', 'The longest common subsequence between the output and the reference.'],
            ['Why is BLEU poor for chat answers?', 'Valid answers share few n-grams with a reference, so the score is low regardless of quality.'],
          ],
          prereqs: ['Token F1, precision and recall'],
        },
        {
          title: 'Embedding similarity and BERTScore',
          description: 'Comparing embeddings of the output and reference, or token-level embeddings as BERTScore does, credits paraphrases that overlap metrics miss; the scores are model-dependent and cannot distinguish a subtle factual error.',
          concepts: ['Cosine similarity of outputs', 'BERTScore token matching', 'Model dependence of scores', 'Blindness to factual errors'],
          quiz: [
            ['What does embedding similarity capture that F1 does not?', 'Paraphrase and semantic closeness.'],
            ['Why can a wrong answer get high embedding similarity?', 'Changing one number or a negation barely moves the embedding.'],
          ],
          prereqs: ['BLEU and ROUGE'],
        },
        {
          title: 'Execution-based metrics and pass@k',
          description: 'For code, SQL and structured outputs, running the result against tests or a database is the most reliable grader; pass@k reports the chance that at least one of k samples passes and is the standard for code generation.',
          concepts: ['Test execution as a grader', 'pass@k estimation', 'Sandboxed execution for evals', 'Schema validity as a metric'],
          quiz: [
            ['What does pass@1 measure?', 'The fraction of problems solved by a single sample.'],
            ['Why is execution better than text comparison for code?', 'Many different programs are correct; tests judge behaviour, not wording.'],
          ],
          prereqs: ['Exact and normalised match'],
        },
      ],
    },
    {
      title: 'LLM-as-Judge',
      description: 'Using a model to grade model outputs, and knowing when to distrust it.',
      topics: [
        {
          title: 'Judge prompts and scoring scales',
          description: 'A judge prompt states the task, the rubric, the input, the output and asks for a structured verdict with a reason; small scales such as pass/fail or 1 to 5 with anchors are more reliable than fine-grained scores.',
          concepts: ['Judge prompt structure', 'Structured verdicts with reasons', 'Binary versus scaled grading', 'Reference-guided judging'],
          quiz: [
            ['Why ask the judge for reasons before a score?', 'Reasoning first improves consistency and makes verdicts auditable.'],
            ['Which scale is most reliable?', 'Binary or a short anchored scale; 1 to 100 scales are noise.'],
          ],
          prereqs: ['Rubrics for graded outputs'],
        },
        {
          title: 'Pairwise comparison judging',
          description: 'Asking which of two outputs is better is easier and more consistent than absolute scoring; swapping positions and aggregating over many pairs yields win rates that rank prompts or models reliably.',
          concepts: ['Pairwise preference format', 'Position swapping', 'Win rates and ties', 'Ranking from pairwise results'],
          quiz: [
            ['Why run each pair in both orders?', 'To cancel position bias in the judge.'],
            ['What does a win rate tell you?', 'How often one variant is preferred over another across the dataset.'],
          ],
          prereqs: ['Judge prompts and scoring scales'],
        },
        {
          title: 'Judge biases',
          description: 'Judge models prefer longer, more confident and more polished text, favour the first option, rate their own family higher and can be swayed by injected text in the output; every judge pipeline must be checked for these.',
          concepts: ['Verbosity bias', 'Position bias', 'Self-preference bias', 'Susceptibility to injection in outputs'],
          quiz: [
            ['What is self-preference bias?', 'A judge rating outputs from its own model family higher.'],
            ['How does verbosity bias distort results?', 'Longer answers win even when shorter ones are more correct.'],
          ],
          prereqs: ['Pairwise comparison judging'],
        },
        {
          title: 'Calibrating judges against humans',
          description: 'A judge is only trusted once its agreement with human labels on a calibration set is measured, reported as agreement rate or Cohen\'s kappa, and re-checked whenever the judge model or prompt changes.',
          concepts: ['Human calibration set', 'Agreement rate and kappa', 'Analysing disagreements', 'Re-calibrating after changes'],
          quiz: [
            ['What number tells you a judge is usable?', 'Agreement with human labels comparable to human-human agreement.'],
            ['When must a judge be re-calibrated?', 'After changing its model, prompt or the task distribution.'],
          ],
          prereqs: ['Judge biases'],
        },
        {
          title: 'Judge cost, latency and reliability',
          description: 'Grading thousands of outputs with a strong model costs real money and time; batching, cheaper models for easy criteria, caching verdicts and repeating only borderline cases keep judge pipelines affordable and stable.',
          concepts: ['Cost per graded example', 'Cheaper judges for simple criteria', 'Caching verdicts', 'Repeating borderline cases'],
          quiz: [
            ['How do you cut judge cost without losing quality?', 'Use a smaller model for simple binary criteria and the strong model only where needed.'],
            ['Why repeat borderline verdicts?', 'Noise is highest near the decision boundary; averaging stabilises them.'],
          ],
          prereqs: ['Calibrating judges against humans'],
        },
      ],
    },
    {
      title: 'Human Evaluation',
      description: 'The ground truth that automated graders are measured against.',
      topics: [
        {
          title: 'Designing annotation tasks',
          description: 'Clear instructions, a rubric, examples, a small pilot round and a UI that shows exactly what the model saw produce labels that mean something; ambiguous tasks yield labels that disagree with each other.',
          concepts: ['Annotation guidelines', 'Pilot rounds', 'Annotation interface design', 'Reducing annotator fatigue'],
          quiz: [
            ['Why run a pilot round?', 'To find ambiguous instructions before labelling thousands of examples.'],
            ['What should the annotator see?', 'The full input and context the model had, plus the output and rubric.'],
          ],
          prereqs: ['Rubrics for graded outputs'],
        },
        {
          title: 'Inter-annotator agreement',
          description: 'Having several people label the same items and measuring agreement with Cohen\'s or Fleiss\' kappa reveals whether the task is well-defined; low agreement means fixing the guidelines before trusting any score.',
          concepts: ['Overlapping labels across annotators', 'Cohen\'s and Fleiss\' kappa', 'Adjudicating disagreements', 'Agreement as a ceiling for judges'],
          quiz: [
            ['What does low kappa indicate?', 'The task or guidelines are ambiguous, not necessarily that annotators are careless.'],
            ['Why is human agreement a ceiling for judge accuracy?', 'A judge cannot be reliably more consistent than the labels it is measured against.'],
          ],
          prereqs: ['Designing annotation tasks'],
        },
        {
          title: 'Expert review versus crowd labelling',
          description: 'Domain experts are slow and expensive but essential for medical, legal or technical correctness; crowd workers scale for simple judgements; mixing them with targeted sampling gets accuracy where it matters.',
          concepts: ['When experts are required', 'Crowd labelling for simple criteria', 'Targeted sampling for review', 'Quality control checks'],
          quiz: [
            ['Which tasks need expert labels?', 'Those where correctness requires domain knowledge a layperson cannot judge.'],
            ['How do you keep crowd labels honest?', 'Insert gold questions with known answers and track each worker\'s accuracy.'],
          ],
          prereqs: ['Inter-annotator agreement'],
        },
      ],
    },
    {
      title: 'Evaluating RAG, Agents and Conversations',
      description: 'Scoring systems that retrieve, act and talk over many turns.',
      topics: [
        {
          title: 'Evaluating retrieval-augmented systems',
          description: 'RAG evals split into retrieval metrics such as context recall and precision and answer metrics such as faithfulness and correctness; scoring both per example shows whether to fix the retriever or the prompt.',
          concepts: ['Retrieval versus answer metrics', 'Faithfulness to context', 'Unanswerable question handling', 'Attributing failures to a stage'],
          quiz: [
            ['What does faithfulness measure?', 'Whether each claim in the answer is supported by the retrieved context.'],
            ['High answer correctness but low faithfulness means what?', 'The model answered from memory rather than the provided context.'],
          ],
          prereqs: ['Judge prompts and scoring scales'],
        },
        {
          title: 'Evaluating agents and trajectories',
          description: 'Agents are scored on whether the task was completed and on the path taken: correct tools, sensible order, no forbidden actions and bounded cost; final-state checks against a sandboxed environment are the most objective grader.',
          concepts: ['Task completion checks', 'Trajectory and tool-order scoring', 'Forbidden action detection', 'Cost and step budgets as metrics'],
          quiz: [
            ['How do you objectively grade a coding agent?', 'Run the tests in the final repository state.'],
            ['Why penalise a successful run that used a forbidden tool?', 'Unsafe paths are failures even when the outcome is right.'],
          ],
          prereqs: ['Evaluating retrieval-augmented systems'],
        },
        {
          title: 'Evaluating tool use',
          description: 'Tool-use evals check whether the model called the right tool, with correct arguments, at the right time, and whether it correctly declined to call one; argument-level exact match and schema validation make these largely automatic.',
          concepts: ['Tool selection accuracy', 'Argument correctness', 'Correctly not calling a tool', 'Handling tool errors in evals'],
          quiz: [
            ['What is a false positive in tool use?', 'Calling a tool when the request did not need one.'],
            ['How are tool arguments graded?', 'Exact or normalised match against expected values after schema validation.'],
          ],
          prereqs: ['Evaluating agents and trajectories'],
        },
        {
          title: 'Multi-turn conversation evals',
          description: 'Single-turn scores miss failures that appear over a dialogue, such as forgetting constraints or contradicting earlier answers; scripted or simulated users drive multi-turn scenarios that are graded on the whole transcript.',
          concepts: ['Scripted conversation scenarios', 'Simulated user models', 'Grading whole transcripts', 'Consistency across turns'],
          quiz: [
            ['What failure only shows in multi-turn evals?', 'Losing constraints or contradicting earlier turns as the conversation grows.'],
            ['What is a simulated user?', 'A model prompted to play a user persona and goal across turns.'],
          ],
          prereqs: ['Evaluating retrieval-augmented systems'],
        },
      ],
    },
    {
      title: 'Evals in the Engineering Process',
      description: 'Making evaluation continuous rather than a one-off report.',
      topics: [
        {
          title: 'Regression testing for prompts',
          description: 'Every prompt, model or pipeline change runs the regression set and is compared with the baseline per example; the review shows which cases improved, which regressed and whether the aggregate change is significant.',
          concepts: ['Baseline comparisons', 'Per-example diff of results', 'Significance before merging', 'Curating the regression set'],
          quiz: [
            ['Aggregate score rose but ten cases regressed. Ship it?', 'Review the regressed cases first; some may be critical even if the average improved.'],
            ['What should a regression set contain?', 'Past failures, critical paths and representative examples.'],
          ],
          prereqs: ['Statistics for eval results', 'Dataset hygiene: versioning, splits and contamination'],
        },
        {
          title: 'CI pipelines for LLM features',
          description: 'Evals run in CI on pull requests with a fast subset, a nightly full run, cached model responses where possible, cost caps and a gate that blocks merges when critical metrics fall below thresholds.',
          concepts: ['Fast subset on pull requests', 'Nightly full runs', 'Cost caps in CI', 'Merge gates on thresholds'],
          quiz: [
            ['Why not run the full eval set on every pull request?', 'Cost and time; a representative subset catches most regressions quickly.'],
            ['What should block a merge?', 'A critical metric falling below its threshold or a safety eval failing.'],
          ],
          prereqs: ['Regression testing for prompts'],
        },
        {
          title: 'A/B testing in production',
          description: 'Offline scores do not guarantee user impact, so variants are shipped to randomised user groups and compared on business and quality metrics with proper sample sizes; guardrail metrics stop harmful variants early.',
          concepts: ['Randomised assignment', 'Primary and guardrail metrics', 'Sample size planning', 'Early stopping rules'],
          quiz: [
            ['What is a guardrail metric?', 'A metric that must not degrade, such as error rate or complaints, regardless of the primary outcome.'],
            ['Why can an offline winner lose online?', 'Real users, inputs and interactions differ from the eval dataset.'],
          ],
          prereqs: ['CI pipelines for LLM features'],
        },
        {
          title: 'Monitoring and drift detection',
          description: 'Inputs, model versions and user expectations change; sampling live traffic into judge-graded evals, tracking score trends, refusal rates and feedback, and alerting on shifts catches quality drift before it becomes an incident.',
          concepts: ['Sampling live traffic for grading', 'Score trend dashboards', 'Input distribution shift', 'Alerts on quality drops'],
          quiz: [
            ['What causes drift without any code change?', 'Provider model updates or a shift in what users ask.'],
            ['How do you grade live traffic affordably?', 'Sample a small percentage and grade it with a judge on a schedule.'],
          ],
          prereqs: ['A/B testing in production'],
        },
        {
          title: 'Online evals and feedback signals',
          description: 'Thumbs ratings, edits, retries, escalations and task completion are online signals; linking them to traces and combining them with sampled judge scores gives a continuous quality picture that offline evals cannot.',
          concepts: ['Explicit user ratings', 'Implicit behavioural signals', 'Linking signals to traces', 'Feeding failures into datasets'],
          quiz: [
            ['Give an implicit signal of a bad answer.', 'The user immediately retries or rephrases the same request.'],
            ['Why link feedback to traces?', 'To reproduce the exact prompt and context for the failing case.'],
          ],
          prereqs: ['Monitoring and drift detection'],
        },
      ],
    },
    {
      title: 'Safety Evals and Benchmark Literacy',
      description: 'Probing for harm and reading public benchmarks with a critical eye.',
      topics: [
        {
          title: 'Safety evaluations',
          description: 'Safety evals test refusal of harmful requests, avoidance of toxic or biased output and adherence to policy across categories; both over-refusal and under-refusal are measured, because each harms users differently.',
          concepts: ['Harm category taxonomies', 'Refusal and over-refusal rates', 'Toxicity and bias probes', 'Policy adherence scoring'],
          quiz: [
            ['Why measure over-refusal?', 'Refusing benign requests frustrates users and hides real capability.'],
            ['How are safety evals typically graded?', 'By classifiers or judge models against a policy, with human review of edge cases.'],
          ],
          prereqs: ['Kinds of evals'],
        },
        {
          title: 'Red teaming and adversarial testing',
          description: 'Red teamers and automated attackers craft jailbreaks, prompt injections and role-play tricks to break the system; the found attacks become a permanent adversarial test set that must keep passing.',
          concepts: ['Manual red-team exercises', 'Automated attack generation', 'Jailbreak and injection suites', 'Turning attacks into regression tests'],
          quiz: [
            ['What is the output of a red-team exercise?', 'A set of attacks that worked, now added to the adversarial eval set.'],
            ['Why automate attack generation?', 'Manual red teaming cannot cover the variety of phrasings attackers will try.'],
          ],
          prereqs: ['Safety evaluations'],
        },
        {
          title: 'Public benchmarks: MMLU, HumanEval, GSM8K and friends',
          description: 'MMLU tests multiple-choice knowledge, HumanEval tests code by execution, GSM8K tests grade-school maths reasoning, and others such as ARC, HellaSwag and MATH each probe a narrow skill; knowing what each measures stops misuse.',
          concepts: ['MMLU knowledge questions', 'HumanEval and MBPP for code', 'GSM8K and MATH for reasoning', 'Commonsense benchmarks', 'Instruction-following benchmarks'],
          quiz: [
            ['What does HumanEval measure?', 'Whether generated Python functions pass hidden unit tests, reported as pass@k.'],
            ['What format is MMLU?', 'Multiple-choice questions across 57 academic subjects.'],
          ],
          prereqs: ['Execution-based metrics and pass@k'],
        },
        {
          title: 'Reading leaderboards critically',
          description: 'Benchmark scores depend on prompt format, few-shot count, sampling and possible contamination; human-preference arenas rank differently again, so a leaderboard position is a hint, not a verdict on your task.',
          concepts: ['Prompt and few-shot sensitivity', 'Contamination and saturation', 'Preference arenas versus static benchmarks', 'Benchmarks versus your own evals'],
          quiz: [
            ['Why do two reports give different MMLU scores for the same model?', 'Different prompt formats, few-shot counts or scoring rules.'],
            ['What does a preference arena measure?', 'Which model users prefer in blind pairwise chats, not correctness.'],
          ],
          prereqs: ['Public benchmarks: MMLU, HumanEval, GSM8K and friends'],
        },
        {
          title: 'Domain and agentic benchmarks',
          description: 'SWE-bench grades real repository fixes, tau-bench and similar test tool use in simulated domains, and long-context benchmarks probe retrieval inside the context; these approximate real work better but remain narrow.',
          concepts: ['SWE-bench style repository tasks', 'Tool-use benchmarks', 'Long-context benchmarks', 'Building a domain benchmark'],
          quiz: [
            ['What does SWE-bench require the model to do?', 'Produce a patch that makes failing tests in a real repository pass.'],
            ['Why build your own domain benchmark?', 'Public ones rarely match your data, tools and definition of success.'],
          ],
          prereqs: ['Reading leaderboards critically', 'Evaluating agents and trajectories'],
        },
      ],
    },
    {
      title: 'Eval Tooling',
      description: 'Tools that run, store and visualise evaluations.',
      topics: [
        {
          title: 'promptfoo',
          description: 'promptfoo defines prompts, providers, test cases and assertions in a YAML config, runs them in a matrix, supports built-in graders including model-graded checks and red-team scans, and produces a comparison view or CI exit code.',
          concepts: ['YAML config of prompts and providers', 'Assertion types', 'Model-graded assertions', 'Matrix runs and comparison view', 'CI integration'],
          quiz: [
            ['What does a promptfoo assertion do?', 'Checks each output with a rule such as contains, JSON validity or a model-graded rubric.'],
            ['How does promptfoo fit into CI?', 'It exits non-zero when assertions fail, so the pipeline can block the change.'],
          ],
          prereqs: ['CI pipelines for LLM features'],
        },
        {
          title: 'LangSmith and Langfuse concepts',
          description: 'Tracing platforms capture every call with inputs, outputs, latency and cost, store datasets, run evaluators over traces or datasets and show score trends; the concepts of traces, datasets, runs and scores transfer across tools.',
          concepts: ['Traces and spans', 'Datasets and experiment runs', 'Evaluators over traces', 'Score dashboards and annotation queues'],
          quiz: [
            ['How do you build a dataset from production in these tools?', 'Select traces and add their inputs and outputs to a dataset for later runs.'],
            ['What is an annotation queue?', 'A list of traces routed to humans for labelling inside the platform.'],
          ],
          prereqs: ['Online evals and feedback signals'],
        },
        {
          title: 'Building your own eval harness',
          description: 'A harness loads a versioned dataset, runs the system under test with a configuration, applies graders, stores results with metadata and compares against a baseline; a few hundred lines of Python often beat a heavy framework.',
          concepts: ['Dataset loading and versioning', 'Pluggable system under test', 'Grader interface', 'Result storage and baselines', 'Parallel execution with caching'],
          quiz: [
            ['What metadata must each stored result carry?', 'Dataset version, system configuration, model, grader version and timestamp.'],
            ['Why cache system outputs in the harness?', 'Re-grading with a new rubric should not require re-running the model.'],
          ],
          prereqs: ['Regression testing for prompts'],
        },
        {
          title: 'Reporting and dashboards',
          description: 'A useful eval report shows the aggregate score with its uncertainty, per-category breakdowns, examples of failures and a comparison to the baseline; dashboards over time turn reports into trend monitoring.',
          concepts: ['Aggregate scores with intervals', 'Category breakdowns', 'Failure galleries', 'Trend views over versions'],
          quiz: [
            ['Why include failure examples in a report?', 'Numbers say something is wrong; examples show what and suggest the fix.'],
            ['What makes a score comparison honest?', 'Same dataset version, same grader and reported uncertainty.'],
          ],
          prereqs: ['Building your own eval harness'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: model evaluation dashboard',
          description: 'Build a harness and web dashboard that runs a versioned dataset against several models and prompts, grades with exact match, F1 and a calibrated judge, stores results with metadata and shows scores with confidence intervals, breakdowns and failure examples.',
          concepts: ['Harness with pluggable graders', 'Judge calibration against a labelled sample', 'Result storage with metadata', 'Dashboard with intervals and failures'],
          quiz: [
            ['Why report confidence intervals on the dashboard?', 'So small differences are not mistaken for real improvements.'],
            ['How is the judge validated in this project?', 'By measuring its agreement with human labels on a calibration subset.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: prompt regression suite in CI',
          description: 'Take an existing LLM feature, build a regression dataset from real cases, define assertions and a model-graded rubric in promptfoo or a custom harness, and wire it into CI so pull requests show per-example diffs and block on regressions.',
          concepts: ['Curate the regression dataset', 'Define assertions and rubric', 'Wire into pull-request CI', 'Per-example diff reporting'],
          quiz: [
            ['What should the CI comment show?', 'Which examples improved or regressed and the aggregate change.'],
            ['How do you keep CI runs cheap?', 'A fast subset per pull request with cached responses and a nightly full run.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: RAG evaluation pipeline',
          description: 'Build an eval set of questions with evidence and reference answers over a document corpus, compute context recall, precision, faithfulness and correctness for several retriever and chunking configurations, and produce a comparison report.',
          concepts: ['Question set with evidence labels', 'Retrieval metric computation', 'Judge-based faithfulness scoring', 'Configuration comparison report'],
          quiz: [
            ['What does context recall need from the dataset?', 'The evidence passages or facts each question requires.'],
            ['Which configuration change should you test first?', 'Chunk size and hybrid retrieval, since they usually move recall most.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: red-team and safety eval suite',
          description: 'Assemble harmful, borderline and benign prompts across a harm taxonomy, generate adversarial variants automatically, grade refusals and over-refusals with a classifier and human review, and track results per model version.',
          concepts: ['Build the harm taxonomy set', 'Generate adversarial variants', 'Grade refusal and over-refusal', 'Track results per version'],
          quiz: [
            ['Why include benign prompts in a safety suite?', 'To measure over-refusal alongside harmful-request refusal.'],
            ['What do you do with a successful new jailbreak?', 'Add it to the suite so it is tested on every future version.'],
          ],
          style: 'project',
        },
        {
          title: 'LLM evaluation interview questions',
          description: 'Expect questions on why evals differ from tests, how to build a dataset, choosing metrics, judge biases and calibration, evaluating RAG and agents, running evals in CI, A/B testing and what MMLU or HumanEval actually measure.',
          concepts: ['Explaining metric choices', 'Judge reliability questions', 'System eval questions', 'Process and benchmark questions'],
          quiz: [
            ['How would you evaluate a summarisation feature?', 'A rubric-based judge calibrated with human labels, plus checks for omissions and invented facts.'],
            ['Why is ROUGE insufficient for chat quality?', 'It measures n-gram overlap, not correctness or helpfulness.'],
          ],
          style: 'reading',
        },
        {
          title: 'Evaluation strategy design exercise',
          description: 'Design the evaluation programme for a customer-facing assistant before launch and after: datasets, metrics, judges, human review, CI gates, A/B tests, drift monitoring and safety suites, with costs and owners for each part.',
          concepts: ['Pre-launch eval plan', 'Continuous eval design', 'Human review budget', 'Safety and drift coverage'],
          quiz: [
            ['What must exist before the first launch?', 'A regression set, a calibrated judge, safety suite results and CI gates.'],
            ['What changes after launch?', 'Live traffic sampling, drift monitoring and A/B tests become the primary signals.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
