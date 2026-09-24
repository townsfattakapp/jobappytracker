import { defineTrack } from '../define'

export const mlops = defineTrack({
  id: 'track-mlops',
  title: 'MLOps and LLMOps',
  description: 'Running machine learning as an engineering discipline: experiment tracking with MLflow and W&B, dataset versioning with DVC and lakeFS, registries, feature stores, training pipelines, CI/CD for models, canaries and rollbacks, drift monitoring, cost control, and the LLM-specific layer of prompt versioning, eval gates and guardrail monitoring.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🔁',
  tags: ['mlops', 'llmops', 'mlflow', 'dvc', 'feature store', 'ci/cd', 'monitoring', 'drift'],
  languages: ['Python'],
  explainMode: 'devops',
  code: { label: 'Python, YAML and shell, whichever fits', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-machine-learning'],
  style: 'practice',
  categories: [
    {
      title: 'MLOps Foundations',
      description: 'Why models rot in production and the discipline that stops it.',
      topics: [
        {
          title: 'The ML lifecycle and where it breaks',
          description: 'Data collection, training, evaluation, deployment and monitoring as a loop rather than a line, and the classic failure points: untracked experiments, training-serving skew, silent drift and models nobody can rebuild.',
          concepts: ['The ML loop from data to monitoring', 'Hidden technical debt in ML systems', 'Training-serving skew', 'Why models decay after deployment'],
          quiz: [
            ['What is training-serving skew?', 'A difference between how features are computed in training and at inference, so the model sees data it was not trained on.'],
            ['Why does a model degrade without any code change?', 'The world changes: input distributions and the relationship to the label drift.'],
          ],
        },
        {
          title: 'MLOps maturity levels',
          description: 'Google\'s level 0 (manual notebooks), level 1 (automated training pipeline) and level 2 (automated CI/CD of pipelines) as a map for where a team is and which investment pays next.',
          concepts: ['Level 0: manual process', 'Level 1: pipeline automation', 'Level 2: CI/CD of pipelines', 'Choosing the next investment'],
          quiz: [
            ['What distinguishes level 1 from level 0?', 'Training runs as an automated, repeatable pipeline that can retrain on a trigger.'],
            ['Does every team need level 2?', 'No. A single stable model may be fine at level 1; invest when retraining or model count grows.'],
          ],
          prereqs: ['The ML lifecycle and where it breaks'],
        },
        {
          title: 'Reproducible environments',
          description: 'Lock files with uv, pip-tools or conda-lock, pinned CUDA and framework versions, Docker images for training, and fixed random seeds, so a run from six months ago can be rebuilt and compared.',
          concepts: ['Lock files for Python dependencies', 'Pinning CUDA and framework versions', 'Training images with Docker', 'Seeds and nondeterminism sources'],
          quiz: [
            ['Why is a requirements.txt without pins not reproducible?', 'Transitive dependencies resolve differently over time, changing behaviour.'],
            ['Does setting a seed guarantee identical results on GPU?', 'Not always; some CUDA kernels are nondeterministic unless deterministic mode is forced.'],
          ],
        },
        {
          title: 'Project structure and configuration management',
          description: 'A layout that separates data, code, configs and artefacts, with Hydra or Pydantic settings for composable configs, so every run is defined by a config file rather than edits to a script.',
          concepts: ['Separating code, config and artefacts', 'Hydra config composition', 'Overrides from the command line', 'Config files as the run record'],
          quiz: [
            ['Why put hyperparameters in config files rather than code?', 'Runs become diffable, reproducible and launchable without editing source.'],
            ['What does Hydra\'s composition give you?', 'Config groups you can mix (model, data, optimiser) and override from the CLI.'],
          ],
          prereqs: ['Reproducible environments'],
        },
      ],
    },
    {
      title: 'Experiment Tracking',
      topics: [
        {
          title: 'MLflow tracking',
          description: 'Logging parameters, metrics, artefacts and the environment for every run with mlflow.log_*, autologging for common frameworks, and a tracking server with an artefact store shared by the team.',
          concepts: ['Runs, params, metrics and artefacts', 'Autologging for sklearn and torch', 'Tracking server and artefact store', 'Nested runs for sweeps'],
          quiz: [
            ['What does mlflow.autolog() capture?', 'Parameters, metrics, the model and often the environment for supported frameworks, without manual log calls.'],
            ['Where do artefacts go when using a remote tracking server?', 'An artefact store such as S3 or a shared volume configured on the server.'],
          ],
        },
        {
          title: 'Weights & Biases',
          description: 'W&B runs and projects, logging media and tables, sweeps for hyperparameter search with a YAML config, and reports that turn runs into shareable analysis.',
          concepts: ['wandb.init and logging', 'Tables and media logging', 'Sweeps configuration', 'Reports for sharing results'],
          quiz: [
            ['What does a W&B sweep do?', 'Launches many runs over a search space defined in YAML, coordinated by a sweep controller.'],
            ['How do you log a confusion matrix image?', 'wandb.log({"cm": wandb.Image(fig)}) or a wandb.plot helper.'],
          ],
        },
        {
          title: 'Comparing runs and selecting a model',
          description: 'Filtering and sorting runs by metric, checking that comparisons use the same data split and seed policy, plotting metric curves, and recording why a candidate was chosen.',
          concepts: ['Filtering and sorting runs', 'Same-split comparisons', 'Metric curves and early stopping', 'Recording the selection rationale'],
          quiz: [
            ['Why is comparing runs on different validation splits misleading?', 'Differences may come from the split, not the model.'],
            ['What should be recorded when a model is picked?', 'The run id, the metrics compared, and the reason, so the decision can be audited.'],
          ],
          prereqs: ['MLflow tracking'],
        },
        {
          title: 'Logging model signatures and input examples',
          description: 'Attaching an input/output schema and a sample input to a logged model so the registry, serving layer and validation tools know exactly what the model expects and returns.',
          concepts: ['Model signature inference', 'Input examples', 'Schema enforcement at load time', 'Catching column drift early'],
          quiz: [
            ['What is a model signature in MLflow?', 'A declared schema of input columns and types and output types stored with the model.'],
            ['Why store an input example?', 'Serving tools can generate a test request and validate the schema before deployment.'],
          ],
          prereqs: ['MLflow tracking'],
        },
      ],
    },
    {
      title: 'Data Versioning and Feature Stores',
      topics: [
        {
          title: 'DVC for data and pipelines',
          description: 'Tracking large files in Git by pointer with dvc add, remote storage on S3 or GCS, and dvc.yaml stages that declare dependencies and outputs so dvc repro only reruns what changed.',
          concepts: ['dvc add and .dvc pointer files', 'Remotes and dvc push/pull', 'dvc.yaml stages and dependencies', 'dvc repro and caching'],
          quiz: [
            ['What does Git store when you dvc add a file?', 'A small .dvc file with the hash; the data goes to the DVC cache and remote.'],
            ['When does dvc repro skip a stage?', 'When none of its declared dependencies changed since the last run.'],
          ],
        },
        {
          title: 'lakeFS and git-like data lakes',
          description: 'Branching, committing and merging over an object store so an experiment works on an isolated branch of the lake, and a bad ingestion can be reverted like a commit.',
          concepts: ['Branches over object storage', 'Commits and reverts of data', 'Zero-copy branching', 'Hooks for data validation on merge'],
          quiz: [
            ['How does lakeFS branch a petabyte lake quickly?', 'Branches are metadata pointers; objects are not copied.'],
            ['What is the use of a pre-merge hook?', 'Running validation so bad data cannot land on the main branch.'],
          ],
        },
        {
          title: 'Data validation with Great Expectations and Pandera',
          description: 'Declaring expectations on schema, ranges, nulls and distributions, running them at ingestion and before training, and failing loudly so bad data never becomes a silently bad model.',
          concepts: ['Expectation suites', 'Pandera DataFrame schemas', 'Validation at ingestion and pre-training', 'Data docs and failure reports'],
          quiz: [
            ['Where should data validation run?', 'At ingestion and immediately before training and serving.'],
            ['What does a Pandera schema check?', 'Column types, value constraints and custom checks on a DataFrame.'],
          ],
        },
        {
          title: 'Feature stores with Feast',
          description: 'A registry of feature definitions with an offline store for training and an online store for low-latency serving, so the same transformation feeds both and point-in-time joins prevent label leakage.',
          concepts: ['Feature views and entities', 'Offline versus online stores', 'Point-in-time correct joins', 'Materialisation to the online store'],
          quiz: [
            ['What does a point-in-time join prevent?', 'Using feature values from after the label event, which leaks the future into training.'],
            ['Why have an online store at all?', 'Serving needs feature lookups in milliseconds, which a warehouse cannot provide.'],
          ],
        },
        {
          title: 'Preventing training-serving skew',
          description: 'Sharing transformation code between training and inference, logging served features for later training, and skew detection that compares training feature statistics with what the serving path actually computes.',
          concepts: ['Shared transformation code', 'Logging served features', 'Skew detection statistics', 'Feature contracts'],
          quiz: [
            ['What is the simplest skew prevention?', 'One transformation function imported by both the training and serving code.'],
            ['Why log the features seen at serving time?', 'To retrain on exactly what the model saw and to detect skew.'],
          ],
          prereqs: ['Feature stores with Feast'],
        },
      ],
    },
    {
      title: 'Model Registry and Packaging',
      topics: [
        {
          title: 'Model registries',
          description: 'Registered models with versions, aliases such as champion and challenger, stage transitions with approvals, and the metadata that links each version back to its run, data and code commit.',
          concepts: ['Registered models and versions', 'Aliases and stage transitions', 'Approval workflows', 'Linking versions to runs and commits'],
          quiz: [
            ['What is a champion alias?', 'A pointer to the version currently serving production, moved atomically on promotion.'],
            ['Why not just deploy from a file path?', 'A registry gives versioning, approvals, lineage and a stable name for serving to load.'],
          ],
        },
        {
          title: 'Packaging models for deployment',
          description: 'MLflow model flavours, ONNX export for framework-independent serving, safetensors for weights, and the dependency manifest that lets a model load in an environment it was not trained in.',
          concepts: ['MLflow model flavours', 'ONNX export', 'safetensors versus pickle', 'Dependency manifests for loading'],
          quiz: [
            ['Why export to ONNX?', 'To run the model with a fast runtime independent of the training framework.'],
            ['What does the pyfunc flavour give you?', 'A uniform predict interface for any model, useful for serving and batch scoring.'],
          ],
          prereqs: ['Model registries'],
        },
        {
          title: 'Model metadata and lineage records',
          description: 'What every registered model should carry: data version, code commit, config, metrics, evaluation report, owner and intended use, so a serving model can be traced to everything that produced it.',
          concepts: ['Required metadata fields', 'Linking data, code and config versions', 'Attaching evaluation reports', 'Ownership and intended use'],
          quiz: [
            ['What must you be able to answer about any production model?', 'Which data, code, config and run produced it, and who approved it.'],
            ['Where does the evaluation report belong?', 'Attached to the model version as an artefact, not in a chat thread.'],
          ],
          prereqs: ['Model registries'],
        },
      ],
    },
    {
      title: 'Training Pipelines and Orchestration',
      topics: [
        {
          title: 'Pipelines as DAGs',
          description: 'Breaking training into steps (ingest, validate, featurise, train, evaluate, register) with typed artefacts between them, so steps can be cached, rerun individually and reasoned about.',
          concepts: ['Steps and typed artefacts', 'Caching unchanged steps', 'Parameters versus artefacts', 'Idempotent steps'],
          quiz: [
            ['Why split a training script into pipeline steps?', 'For caching, parallelism, clearer failures and independent reruns.'],
            ['What makes a step cacheable?', 'Deterministic output given the same inputs and parameters.'],
          ],
        },
        {
          title: 'Kubeflow Pipelines and Vertex AI Pipelines',
          description: 'Defining components as containers with the KFP SDK, compiling to a pipeline spec, running on Kubernetes or Vertex AI, and passing artefacts through a metadata store.',
          concepts: ['KFP components and pipelines', 'Compiling and submitting runs', 'Artefact passing and metadata', 'Running on Vertex AI'],
          quiz: [
            ['What is a KFP component?', 'A containerised step with declared inputs and outputs, composed into a pipeline.'],
            ['How do KFP steps share large data?', 'Through artefacts written to storage and referenced by URI, not through memory.'],
          ],
          prereqs: ['Pipelines as DAGs'],
        },
        {
          title: 'Airflow, Prefect and Dagster for ML',
          description: 'General orchestrators used for ML: scheduling retraining DAGs, sensors that wait for data, retries and backfills, and Dagster\'s asset-oriented model that fits ML artefacts well.',
          concepts: ['Scheduling retraining DAGs', 'Sensors and data-arrival triggers', 'Retries and backfills', 'Dagster software-defined assets'],
          quiz: [
            ['What is a backfill?', 'Running a pipeline for past periods to fill in missing outputs.'],
            ['Why is an asset-based orchestrator a good fit for ML?', 'Models and datasets are assets with lineage, which Dagster tracks natively.'],
          ],
          prereqs: ['Pipelines as DAGs'],
        },
        {
          title: 'Retraining triggers and schedules',
          description: 'Retraining on a schedule, on new data volume, or on a drift or performance alert, with guardrails so a retrain cannot promote a worse model automatically.',
          concepts: ['Scheduled versus event-driven retraining', 'Volume and drift triggers', 'Automatic evaluation before promotion', 'Retraining cost limits'],
          quiz: [
            ['Should a retrained model deploy automatically?', 'Only if it passes evaluation gates against the current champion.'],
            ['Which trigger fits a fraud model?', 'Drift or performance alerts, since patterns change unpredictably.'],
          ],
          prereqs: ['Airflow, Prefect and Dagster for ML'],
        },
        {
          title: 'Hyperparameter tuning at scale',
          description: 'Optuna and Ray Tune for search with pruning of bad trials, parallel trials across machines, and logging every trial to the tracker so the search itself is reproducible.',
          concepts: ['Optuna studies and samplers', 'Trial pruning', 'Ray Tune for distributed trials', 'Logging trials to the tracker'],
          quiz: [
            ['What does trial pruning save?', 'Compute, by stopping trials that are clearly underperforming early.'],
            ['Why log each trial as a run?', 'So the best trial can be reproduced and the search analysed later.'],
          ],
        },
      ],
    },
    {
      title: 'CI/CD for ML',
      topics: [
        {
          title: 'Testing ML code',
          description: 'Unit tests for feature functions, tests that a model trains on a tiny dataset without error, invariance and directional tests on predictions, and data schema tests, all fast enough to run on every commit.',
          concepts: ['Feature function unit tests', 'Smoke training on tiny data', 'Invariance and directional tests', 'Schema tests in the test suite'],
          quiz: [
            ['What is a directional expectation test?', 'Checking that a prediction moves the expected way when an input changes, such as price up when size increases.'],
            ['Why train on a tiny dataset in CI?', 'To catch broken code paths in seconds without waiting for a full run.'],
          ],
        },
        {
          title: 'Continuous integration for ML repositories',
          description: 'GitHub Actions or GitLab CI running lint, type checks, tests and a small pipeline execution, with cached dependencies and data samples committed or fetched with DVC.',
          concepts: ['CI workflow for an ML repo', 'Caching dependencies in CI', 'Sample data via DVC in CI', 'Notebook checks with nbval or papermill'],
          quiz: [
            ['How do you get data into CI without committing it?', 'Pull a small sample from the DVC remote with credentials in CI secrets.'],
            ['Why lint notebooks in CI?', 'Notebooks rot silently; executing them catches broken cells.'],
          ],
          prereqs: ['Testing ML code'],
        },
        {
          title: 'Continuous training and delivery',
          description: 'CT pipelines that retrain and evaluate on triggers, and CD that packages, tests and deploys a registered model version, keeping the training pipeline and the serving deployment as separate release units.',
          concepts: ['Continuous training pipelines', 'Deploying a registry version', 'Pipeline release versus model release', 'Environment promotion dev to prod'],
          quiz: [
            ['What are the two things you deploy in MLOps?', 'The training pipeline (code) and the model (artefact), each with its own release process.'],
            ['Why separate pipeline release from model release?', 'A code change should not automatically change production predictions.'],
          ],
          prereqs: ['Continuous integration for ML repositories'],
        },
        {
          title: 'Promotion gates for models',
          description: 'Automated checks a candidate must pass before promotion: metric thresholds versus the champion, slice-level performance, fairness checks, latency budget and schema compatibility, with a human approval where the risk warrants it.',
          concepts: ['Champion-challenger comparison', 'Slice-level thresholds', 'Latency and size budgets', 'Human approval for high-risk models'],
          quiz: [
            ['Why check slices rather than only aggregate metrics?', 'A model can improve overall while getting worse for a critical segment.'],
            ['What is a champion-challenger test?', 'Evaluating the new candidate against the current production model on the same held-out data.'],
          ],
          prereqs: ['Continuous training and delivery'],
        },
      ],
    },
    {
      title: 'Serving, Release and Rollback',
      description: 'The deployment side in outline; the serving track goes deep.',
      topics: [
        {
          title: 'Serving patterns overview',
          description: 'Batch scoring to a table, online REST or gRPC endpoints, and streaming inference on event streams, and how the choice follows latency needs and data arrival. Detailed serving lives in the model serving track.',
          concepts: ['Batch scoring jobs', 'Online endpoints', 'Streaming inference', 'Choosing by latency and data arrival'],
          quiz: [
            ['When is batch scoring enough?', 'When predictions are consumed later, such as nightly churn scores.'],
            ['What does an online endpoint add?', 'Per-request predictions in milliseconds, at the cost of running a service.'],
          ],
        },
        {
          title: 'Canary releases and traffic splitting',
          description: 'Sending a small percentage of traffic to the new model version, watching error rates, latency and business metrics, and ramping up or aborting based on pre-agreed thresholds.',
          concepts: ['Percentage traffic splits', 'Canary success criteria', 'Ramp schedules', 'Automatic abort on threshold breach'],
          quiz: [
            ['What should a canary watch besides errors?', 'Latency, prediction distribution and a business metric such as conversion.'],
            ['Why define abort thresholds before the canary starts?', 'To avoid rationalising bad numbers in the moment.'],
          ],
          prereqs: ['Serving patterns overview'],
        },
        {
          title: 'Shadow deployments',
          description: 'Running the candidate on live traffic without returning its output, logging predictions side by side with the champion, and comparing agreement, latency and errors before any user sees it.',
          concepts: ['Mirroring live requests', 'Side-by-side prediction logging', 'Agreement and latency comparison', 'Cost of doubling inference'],
          quiz: [
            ['What does shadow mode reveal that offline eval cannot?', 'Behaviour on real, current traffic and real latency under load.'],
            ['Why is shadow mode expensive?', 'Every request is served twice.'],
          ],
          prereqs: ['Serving patterns overview'],
        },
        {
          title: 'Rollbacks and version pinning',
          description: 'Keeping the previous model version deployable, pinning serving to a registry alias so rollback is a pointer move, and rehearsing rollback so it takes minutes, not a war room.',
          concepts: ['Keeping previous versions warm', 'Alias-based rollback', 'Rollback rehearsals', 'Rolling back features and prompts too'],
          quiz: [
            ['What makes rollback fast?', 'Serving loads by alias, so rollback is reassigning the alias to the old version.'],
            ['Why keep the old version deployable rather than deleting it?', 'Rollback must not depend on rebuilding an artefact under pressure.'],
          ],
          prereqs: ['Canary releases and traffic splitting'],
        },
      ],
    },
    {
      title: 'Monitoring and Drift',
      topics: [
        {
          title: 'A monitoring stack for ML services',
          description: 'System metrics (latency, errors, throughput) plus ML metrics (prediction distributions, feature statistics, confidence) exported to Prometheus, dashboards in Grafana, and structured prediction logs for later analysis.',
          concepts: ['System versus ML metrics', 'Prometheus exporters for models', 'Grafana dashboards for predictions', 'Structured prediction logging'],
          quiz: [
            ['Why log predictions with their inputs?', 'Drift analysis and retraining need the exact inputs the model saw.'],
            ['Which metric shows a model silently breaking?', 'A shift in the prediction distribution, such as a positive rate jumping from 5% to 40%.'],
          ],
        },
        {
          title: 'Data drift detection',
          description: 'Comparing live feature distributions with the training reference using PSI, KS tests and Jensen-Shannon distance, with Evidently or whylogs, and setting thresholds that alert on real shifts without paging on noise.',
          concepts: ['Population stability index', 'KS test and Jensen-Shannon distance', 'Evidently and whylogs reports', 'Reference windows and thresholds'],
          quiz: [
            ['What PSI value is commonly treated as significant drift?', 'Above roughly 0.2; 0.1 to 0.2 warrants investigation.'],
            ['Why choose the reference window carefully?', 'Comparing against a seasonal peak makes normal data look drifted.'],
          ],
          prereqs: ['A monitoring stack for ML services'],
        },
        {
          title: 'Concept drift and delayed labels',
          description: 'When the relationship between inputs and outcomes changes, performance drops even without input drift; measuring it needs ground truth that often arrives days later, so proxies and label pipelines matter.',
          concepts: ['Concept drift versus data drift', 'Delayed ground truth', 'Proxy metrics while labels arrive', 'Label collection pipelines'],
          quiz: [
            ['Can a model have concept drift with no input drift?', 'Yes: the same inputs now map to different outcomes.'],
            ['How do you monitor a loan model when defaults arrive months later?', 'Track proxies like early delinquency and input drift, and backfill true performance when labels land.'],
          ],
          prereqs: ['Data drift detection'],
        },
        {
          title: 'Alerting and retraining triggers',
          description: 'Turning drift and performance signals into alerts with severity, routing them to owners, and connecting the serious ones to retraining or rollback actions with a runbook.',
          concepts: ['Alert thresholds and severity', 'Routing alerts to model owners', 'Runbooks for drift alerts', 'Linking alerts to retraining'],
          quiz: [
            ['What should a drift alert include?', 'Which features drifted, by how much, the window, and a link to the dashboard and runbook.'],
            ['Should every drift alert trigger retraining?', 'No; retrain when drift is confirmed and labels support it, otherwise investigate the data source.'],
          ],
          prereqs: ['Concept drift and delayed labels'],
        },
        {
          title: 'Evaluation pipelines',
          description: 'Offline evaluation as an automated pipeline: fixed held-out and slice datasets, regression suites of known hard cases, versioned metrics and a report that becomes the promotion decision record.',
          concepts: ['Held-out and slice datasets', 'Regression suites of hard cases', 'Versioned evaluation metrics', 'Evaluation reports as decision records'],
          quiz: [
            ['Why version the evaluation dataset?', 'Metric changes must be attributable to the model, not to a changed test set.'],
            ['What goes into a regression suite?', 'Past failures and critical cases the model must keep getting right.'],
          ],
        },
      ],
    },
    {
      title: 'Cost and Efficiency',
      topics: [
        {
          title: 'Cost attribution for ML workloads',
          description: 'Tagging training jobs, endpoints and storage by team and model, reading cloud cost reports per tag, and knowing the unit economics: cost per training run and cost per thousand predictions.',
          concepts: ['Tagging jobs and endpoints', 'Cost per run and per prediction', 'Storage and egress costs', 'Cost dashboards per model'],
          quiz: [
            ['Why compute cost per thousand predictions?', 'It ties infrastructure spend to business volume and makes over-provisioning visible.'],
            ['Which cost is most often forgotten?', 'Storage of old artefacts, datasets and logs that are never deleted.'],
          ],
        },
        {
          title: 'Spot instances and checkpointed training',
          description: 'Running training on preemptible capacity at a large discount by checkpointing regularly and resuming automatically, with a fallback to on-demand for deadlines.',
          concepts: ['Preemptible capacity economics', 'Checkpoint frequency trade-offs', 'Automatic resume on preemption', 'On-demand fallback'],
          quiz: [
            ['What makes training spot-safe?', 'Frequent checkpoints and a launcher that resumes from the latest one.'],
            ['Typical discount for spot GPUs?', 'Often 60 to 90 percent off on-demand, varying by region and demand.'],
          ],
          prereqs: ['Cost attribution for ML workloads'],
        },
        {
          title: 'Right-sizing endpoints and schedules',
          description: 'Matching instance type to model size, scaling to zero for sporadic endpoints, scheduled scaling for known traffic patterns, and moving low-latency-tolerant work to batch.',
          concepts: ['Instance type versus model size', 'Scale to zero', 'Scheduled scaling', 'Moving work to batch'],
          quiz: [
            ['When does scale-to-zero hurt?', 'When cold starts are slow and requests arrive unpredictably.'],
            ['What is the cheapest serving pattern?', 'Batch scoring, since it uses capacity only while running.'],
          ],
          prereqs: ['Cost attribution for ML workloads'],
        },
      ],
    },
    {
      title: 'LLMOps',
      description: 'What changes when the model is a prompted LLM rather than a trained classifier.',
      topics: [
        {
          title: 'Prompt versioning and registries',
          description: 'Prompts as versioned artefacts with ids, templates and metadata, stored outside application code, resolved at runtime by alias, and diffed and reviewed like code, because a prompt edit is a behaviour change.',
          concepts: ['Prompts as versioned artefacts', 'Prompt templates and variables', 'Runtime resolution by alias', 'Prompt review and diffing'],
          quiz: [
            ['Why not hard-code prompts in application code?', 'Prompt changes then need a deploy and cannot be rolled back independently.'],
            ['What metadata should a prompt version carry?', 'Model it was tested with, eval results, author and the change reason.'],
          ],
        },
        {
          title: 'LLM evaluation gates',
          description: 'Golden sets with expected outputs, LLM-as-judge rubrics, promptfoo or custom runners in CI, and thresholds a prompt or model change must pass before release, with cost per eval run kept in view.',
          concepts: ['Golden sets and expected outputs', 'LLM-as-judge rubrics', 'promptfoo in CI', 'Thresholds and eval cost'],
          quiz: [
            ['What is a golden set?', 'A curated set of inputs with reference answers or rubrics used for regression evaluation.'],
            ['What is the main risk of LLM-as-judge?', 'Judge bias and inconsistency; calibrate against human labels.'],
          ],
          prereqs: ['Prompt versioning and registries'],
        },
        {
          title: 'Guardrail monitoring',
          description: 'Tracking injection detections, PII leakage rate, toxicity flags, refusal rate, hallucination scores and tool-call anomalies as production metrics with alerts, so safety drifts are caught like latency drifts.',
          concepts: ['Safety metrics as production signals', 'Sampling outputs for review', 'Refusal and toxicity rate tracking', 'Alerting on guardrail breaches'],
          quiz: [
            ['Why track refusal rate?', 'A spike may mean an attack campaign or a regression; a drop may mean guardrails broke.'],
            ['How do you review outputs at scale?', 'Sample a percentage, score with classifiers or judges, and route flagged ones to humans.'],
          ],
        },
        {
          title: 'Tracing LLM applications',
          description: 'Capturing every step of a request (prompt, retrieval, tool calls, model responses, tokens, latency, cost) as a trace with Langfuse, LangSmith or OpenTelemetry, so failures can be replayed and debugged.',
          concepts: ['Spans for retrieval, tools and model calls', 'Token and cost accounting per trace', 'Langfuse and LangSmith', 'OpenTelemetry GenAI conventions'],
          quiz: [
            ['What does a trace let you do that logs do not?', 'See the whole request as a tree of steps with timing and cost.'],
            ['Why record token counts per span?', 'To attribute cost and to spot prompts that grew unexpectedly.'],
          ],
        },
        {
          title: 'Fine-tuning operations',
          description: 'Managing fine-tuning datasets as versioned artefacts, tracking LoRA adapter versions in the registry, evaluating against the base model, and deploying adapters with rollback like any model version.',
          concepts: ['Versioned fine-tuning datasets', 'Adapter versions in the registry', 'Base-versus-tuned evaluation', 'Adapter deployment and rollback'],
          quiz: [
            ['Why evaluate a fine-tuned model against the base?', 'To confirm the tune helped on target tasks and did not regress general or safety behaviour.'],
            ['What is a LoRA adapter?', 'A small set of low-rank weight deltas applied to a frozen base model.'],
          ],
          prereqs: ['LLM evaluation gates'],
        },
      ],
    },
    {
      title: 'Governance and Lineage',
      topics: [
        {
          title: 'Lineage graphs',
          description: 'Recording the edges from raw data to dataset version to run to model version to deployment, with tools like MLflow, OpenLineage or Dagster assets, so impact analysis and audits are queries rather than archaeology.',
          concepts: ['Lineage nodes and edges', 'OpenLineage events', 'Impact analysis from lineage', 'Lineage for prompts and evals'],
          quiz: [
            ['What question does lineage answer fastest?', 'Which production models were trained on this dataset version.'],
            ['What is OpenLineage?', 'An open standard for emitting lineage events from pipelines and orchestrators.'],
          ],
        },
        {
          title: 'Access control and audit trails',
          description: 'Who can register, promote and deploy models, separation of duties for high-risk models, and immutable audit logs of promotions, config changes and data access.',
          concepts: ['Roles for register, promote and deploy', 'Separation of duties', 'Immutable audit logs', 'Access to sensitive datasets'],
          quiz: [
            ['Why should the person who trains not be the only approver?', 'Separation of duties reduces both error and abuse.'],
            ['What should an audit log entry for a promotion contain?', 'Who, when, which version, evidence reviewed and the previous champion.'],
          ],
          prereqs: ['Lineage graphs'],
        },
        {
          title: 'Model documentation and compliance reporting',
          description: 'Generating model cards and evaluation reports from registry metadata, keeping an inventory of models with owners and risk tiers, and producing evidence for audits and regulations without a scramble.',
          concepts: ['Model cards from registry metadata', 'Model inventory with risk tiers', 'Evidence packs for audits', 'Retention of artefacts and logs'],
          quiz: [
            ['Why generate model cards automatically?', 'Hand-written cards go stale; generated ones stay tied to the actual version.'],
            ['What does an audit evidence pack contain?', 'Lineage, evaluation results, approvals, monitoring history and documentation for the model in question.'],
          ],
          prereqs: ['Access control and audit trails'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: tracked and versioned training pipeline',
          description: 'A DVC pipeline with ingest, validate, featurise, train and evaluate stages over a public tabular dataset, every run logged to MLflow with signature and artefacts, and the best model registered with an alias.',
          concepts: ['Define DVC stages and remote', 'Log runs and artefacts to MLflow', 'Validate data with Pandera', 'Register and alias the best model'],
          quiz: [
            ['How do you prove the pipeline is reproducible?', 'Clone the repo, dvc pull, dvc repro and compare metrics to the logged run.'],
            ['What should change when only the evaluate stage code changes?', 'Only that stage reruns; upstream stages are cached.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CI/CD for a scikit-learn model',
          description: 'GitHub Actions that run tests and a smoke training on every PR, a promotion job that compares the candidate with the champion on a fixed eval set, and a deploy job that ships a FastAPI service loading the model by alias.',
          concepts: ['PR workflow with tests and smoke training', 'Promotion job with champion comparison', 'Container build and deploy job', 'Rollback by alias'],
          quiz: [
            ['What blocks promotion in this project?', 'A candidate that fails the metric threshold or slice checks against the champion.'],
            ['How does the service pick up a new model?', 'It loads the champion alias at startup or on a reload signal.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: drift monitoring dashboard',
          description: 'A service that logs predictions and features, a scheduled Evidently job computing PSI and performance against a reference window, a Grafana dashboard, and an alert that opens a ticket when drift crosses the threshold.',
          concepts: ['Prediction and feature logging', 'Scheduled drift computation', 'Dashboard for drift and performance', 'Alert routing to a ticket'],
          quiz: [
            ['How do you simulate drift to test the alert?', 'Replay traffic with shifted feature distributions.'],
            ['Which window should the reference be?', 'The training data or a stable production period, chosen and documented.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: LLMOps eval gate for a RAG app',
          description: 'Versioned prompts in a registry, a golden set with rubric-based judge scoring, promptfoo running in CI on every prompt change, Langfuse tracing in production, and guardrail metrics on a dashboard.',
          concepts: ['Prompt registry and aliases', 'Golden set and judge rubric', 'promptfoo gate in CI', 'Tracing and guardrail metrics'],
          quiz: [
            ['What fails the gate?', 'A prompt change that lowers faithfulness or relevance below the threshold on the golden set.'],
            ['Why trace in production if you have evals?', 'Evals cover known cases; traces reveal what real users actually hit.'],
          ],
          style: 'project',
        },
        {
          title: 'MLOps interview questions',
          description: 'The recurring questions: training-serving skew, how you would version data, what a registry adds, drift versus concept drift, canary versus shadow, reproducing a run, and what changes for LLM applications.',
          concepts: ['Lifecycle and reproducibility questions', 'Deployment strategy questions', 'Monitoring and drift questions', 'LLMOps-specific questions'],
          quiz: [
            ['What is the difference between canary and shadow?', 'Canary serves real users a fraction of traffic; shadow processes traffic without returning results.'],
            ['How would you reproduce a model from a year ago?', 'From the registry: its run, data version, code commit, config and environment lock.'],
          ],
          style: 'reading',
        },
        {
          title: 'MLOps system design walkthroughs',
          description: 'Designing end-to-end platforms in an interview: a retrained-daily recommendation system, a fraud model with delayed labels, and an LLM feature with prompt gates, covering components, failure modes and cost.',
          concepts: ['Daily-retrained recommender design', 'Fraud model with delayed labels', 'LLM feature platform design', 'Trade-offs and cost discussion'],
          quiz: [
            ['Where does the feature store sit in a recommender design?', 'Between the data pipeline and both training and online serving, with point-in-time joins.'],
            ['What is the hardest part of monitoring a fraud model?', 'Labels arrive late, so performance monitoring lags and proxies are needed.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
