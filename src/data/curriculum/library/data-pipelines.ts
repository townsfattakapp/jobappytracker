import { defineTrack } from '../define'

export const dataPipelines = defineTrack({
  id: 'track-data-pipelines',
  title: 'Data Pipelines',
  description: 'Running data workflows as reliable systems: DAG design, scheduling and dependencies, backfills, idempotent partitioned tasks, Airflow, Dagster and Prefect compared, configuration and secrets, observability and lineage, alerting and SLAs, cost control, testing, CI/CD and reliability patterns.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '🛠️',
  tags: ['data pipelines', 'orchestration', 'airflow', 'dagster', 'prefect', 'backfills', 'lineage', 'sla'],
  languages: ['Python', 'YAML'],
  explainMode: 'data',
  code: { label: 'Python and YAML, whichever fits', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-etl-elt'],
  style: 'practice',
  categories: [
    {
      title: 'Pipeline Architecture',
      description: 'How tasks, data and dependencies fit together.',
      topics: [
        {
          title: 'Pipelines as DAGs',
          description: 'A pipeline is a directed acyclic graph of tasks where edges are data dependencies; the DAG decides what can run in parallel, what a failure blocks and what a backfill must recompute.',
          concepts: ['Tasks and edges', 'Why cycles are forbidden', 'Parallelism from the graph shape', 'Failure propagation downstream'],
          quiz: [
            ['What does an edge from A to B mean?', 'B needs the output of A and cannot start until A succeeds.'],
            ['Why must the graph be acyclic?', 'A cycle has no valid execution order.'],
          ],
        },
        {
          title: 'Task granularity and boundaries',
          description: 'Tasks that are too small drown in scheduling overhead; too large and a failure repeats hours of work. Splitting at durable outputs, retry scope and ownership boundaries gives the right size.',
          concepts: ['Overhead of tiny tasks', 'Retry scope as a splitting rule', 'Splitting at durable outputs', 'Ownership boundaries'],
          quiz: [
            ['What is a good reason to split one task in two?', 'The second half fails often and should be retried without redoing the first.'],
            ['What is the cost of thousands of one-second tasks?', 'Scheduler latency and metadata overhead dominate the runtime.'],
          ],
          prereqs: ['Pipelines as DAGs'],
        },
        {
          title: 'Batch, micro-batch and streaming pipelines',
          description: 'Batch runs on a schedule over intervals, micro-batch runs every few minutes over small windows, streaming processes each event; latency needs, cost and complexity decide which, and many systems combine them.',
          concepts: ['Interval batch processing', 'Micro-batch trade-offs', 'Streaming characteristics', 'Combining batch and streaming'],
          quiz: [
            ['What is the practical latency floor of micro-batching?', 'A few minutes, bounded by startup and commit overhead.'],
            ['When is batch clearly the right choice?', 'When consumers need daily or hourly results and cost matters more than latency.'],
          ],
          prereqs: ['Pipelines as DAGs'],
        },
        {
          title: 'Passing data between tasks',
          description: 'Tasks should hand off through durable storage (tables, object paths) and pass only small metadata such as paths and counts through the orchestrator, because orchestrator metadata stores are not built for data.',
          concepts: ['Storage-based hand-off', 'Small metadata via XCom-style channels', 'Conventions for output locations', 'Contracts between tasks'],
          quiz: [
            ['Why not pass a DataFrame between Airflow tasks?', 'XCom stores in the metadata database, which is not sized for data and serialises poorly.'],
            ['What should a task pass downstream?', 'The location and summary of its output, not the output itself.'],
          ],
          prereqs: ['Task granularity and boundaries'],
        },
      ],
    },
    {
      title: 'Scheduling and Dependencies',
      description: 'When things run, what they wait for, and how the past gets recomputed.',
      topics: [
        {
          title: 'Schedules, intervals and logical dates',
          description: 'A scheduled run has a logical date or data interval distinct from the moment it executes; cron expressions, interval schedules and time zones define it, and every task should process that interval, not "now".',
          concepts: ['Cron and interval schedules', 'Logical date versus execution time', 'Time zones in schedules', 'Interval start and end parameters'],
          quiz: [
            ['A daily run for 2025-03-01 executes early on 2025-03-02. Which date should it process?', '2025-03-01, its data interval.'],
            ['What is the risk of scheduling in local time?', 'Daylight-saving shifts produce a missing or double run.'],
          ],
        },
        {
          title: 'Dependencies and sensors',
          description: 'Upstream task success, external dataset arrival and cross-pipeline dependencies are expressed as edges or sensors; sensors poll or defer until a condition holds, and poorly bounded ones waste workers.',
          concepts: ['Intra-DAG dependencies', 'Cross-pipeline dependencies', 'File and table sensors', 'Deferrable sensors and timeouts'],
          quiz: [
            ['What does a sensor do?', 'Waits for a condition, such as a file existing, before downstream tasks run.'],
            ['Why give every sensor a timeout?', 'A source that never arrives should fail visibly instead of blocking forever.'],
          ],
          prereqs: ['Schedules, intervals and logical dates'],
        },
        {
          title: 'Event-driven and asset-based triggering',
          description: 'Triggering runs when data arrives or an upstream asset materialises, rather than on a clock, cuts latency and avoids empty runs; asset-based orchestrators model this natively with dataset or asset dependencies.',
          concepts: ['Trigger on data arrival', 'Dataset and asset dependencies', 'Avoiding empty scheduled runs', 'Combining schedules and triggers'],
          quiz: [
            ['What triggers a downstream asset in an asset-based orchestrator?', 'The upstream asset being materialised.'],
            ['When is a clock schedule still needed?', 'When a result must exist by a deadline regardless of upstream activity.'],
          ],
          prereqs: ['Dependencies and sensors'],
        },
        {
          title: 'Catch-up and backfills',
          description: 'Backfills run a pipeline over past intervals to load history or repair bad logic; they need idempotent tasks, bounded concurrency, source rate limits respected and a way to exclude already-correct partitions.',
          concepts: ['Catch-up behaviour on deploy', 'Running ranges of intervals', 'Concurrency and rate limits during backfills', 'Selective backfills'],
          quiz: [
            ['What must be true before backfilling a year of data?', 'Tasks are idempotent and the source can handle the load.'],
            ['Why disable catch-up on a new DAG by default?', 'Otherwise it schedules every missed interval since the start date immediately.'],
          ],
          prereqs: ['Schedules, intervals and logical dates'],
        },
        {
          title: 'Reprocessing and partial reruns',
          description: 'Clearing a task and its downstream tasks for one interval, rerunning only failed tasks, and marking tasks as success when the output already exists, all without repeating unaffected work.',
          concepts: ['Clearing tasks and downstream state', 'Rerunning failed tasks only', 'Skipping work that already exists', 'Rerun etiquette and audit'],
          quiz: [
            ['What should a rerun of a mid-DAG task also rerun?', 'Everything downstream that consumed its previous output.'],
            ['Why record who reran what?', 'Reruns change data; the audit trail explains unexpected restatements.'],
          ],
          prereqs: ['Catch-up and backfills'],
        },
      ],
    },
    {
      title: 'Idempotency and Partitions',
      description: 'The properties that make reruns and backfills safe.',
      topics: [
        {
          title: 'Idempotent tasks',
          description: 'A task that can run any number of times for the same interval and leave the same result: deterministic inputs, overwrite or merge outputs, state changed after commit, and no dependence on prior runs having happened.',
          concepts: ['Deterministic input selection', 'Overwrite and merge outputs', 'Commit-then-update-state', 'Testing idempotency by double runs'],
          quiz: [
            ['What breaks idempotency in an append-only task?', 'Rerunning appends the same rows again.'],
            ['How do you test idempotency?', 'Run the task twice for one interval and assert the output is unchanged.'],
          ],
        },
        {
          title: 'Partition-based processing',
          description: 'Mapping each run to exactly one partition (a day, an hour, a region) of input and output makes work units independent, parallelisable and replaceable, and lets the orchestrator show which partitions exist and which are missing.',
          concepts: ['One run, one partition', 'Partition keys and definitions', 'Independent, parallel partitions', 'Partition status and gaps'],
          quiz: [
            ['What is the output of a partitioned task for 2025-03-01?', 'Exactly the 2025-03-01 partition, replaced in full.'],
            ['Why do partitions make backfills simple?', 'Each missing partition is an independent unit of work.'],
          ],
          prereqs: ['Idempotent tasks'],
        },
        {
          title: 'Watermarks and incremental state',
          description: 'Some tasks must track progress rather than partitions, storing a watermark or cursor in a metadata table; the state must be updated atomically with the output and be resettable for reprocessing.',
          concepts: ['State tables for cursors', 'Atomic output and state updates', 'Resetting state for reprocessing', 'Partitions versus watermarks'],
          quiz: [
            ['What goes wrong if the watermark updates before the load commits?', 'A failure after the update skips the uncommitted data forever.'],
            ['When is a watermark preferable to partitions?', 'When the source has no natural partition and changes continuously.'],
          ],
          prereqs: ['Partition-based processing'],
        },
        {
          title: 'Late data across partition boundaries',
          description: 'Events for a closed partition keep arriving, so pipelines reprocess a trailing set of partitions each run, choose the lookback from measured lateness, and expose which partitions were restated.',
          concepts: ['Trailing partition reprocessing', 'Lookback sizing from data', 'Signalling restated partitions', 'Cost of wide lookbacks'],
          quiz: [
            ['How do you decide the number of trailing partitions to reprocess?', 'From the observed distribution of event lateness.'],
            ['How do consumers learn a partition changed?', 'An updated-at marker or event per partition.'],
          ],
          prereqs: ['Partition-based processing'],
        },
      ],
    },
    {
      title: 'Orchestration Tools',
      description: 'Three widely used orchestrators and how to choose.',
      topics: [
        {
          title: 'Airflow essentials',
          description: 'DAG files in Python, operators and the TaskFlow API, the scheduler and executors (Local, Celery, Kubernetes), connections and variables, and the conventions that keep an Airflow deployment maintainable.',
          concepts: ['DAG definition and TaskFlow API', 'Operators, hooks and providers', 'Scheduler and executor types', 'Connections and variables', 'Common Airflow anti-patterns'],
          quiz: [
            ['What does the KubernetesExecutor do?', 'Runs each task in its own pod.'],
            ['Why keep top-level DAG code cheap?', 'The scheduler parses every DAG file repeatedly.'],
          ],
        },
        {
          title: 'Dagster essentials',
          description: 'Software-defined assets with lineage built in, partitions and backfills as first-class objects, resources for external systems, and the asset graph UI that shows freshness and materialisation history.',
          concepts: ['Software-defined assets', 'Partitions and backfills', 'Resources and configuration', 'Asset checks and freshness policies'],
          quiz: [
            ['What is an asset in Dagster?', 'A persistent object such as a table, defined by the function that produces it.'],
            ['How does Dagster represent a daily table?', 'A daily-partitioned asset with one materialisation per partition.'],
          ],
        },
        {
          title: 'Prefect essentials',
          description: 'Flows and tasks as decorated Python functions, deployments and work pools for scheduling and infrastructure, and a lighter model that suits teams who want orchestration close to ordinary Python.',
          concepts: ['Flows and tasks', 'Deployments and work pools', 'Retries and caching decorators', 'Prefect versus DAG-first tools'],
          quiz: [
            ['How is a Prefect flow defined?', 'A Python function decorated with @flow, calling @task functions.'],
            ['What does a work pool do?', 'Matches scheduled runs to infrastructure workers.'],
          ],
        },
        {
          title: 'Choosing an orchestrator',
          description: 'Task-first versus asset-first models, hosting and operational burden, ecosystem of integrations, developer experience and local testing, and how existing team skills weigh against each tool\'s strengths.',
          concepts: ['Task-first versus asset-first', 'Managed versus self-hosted', 'Integration ecosystem', 'Local development experience'],
          quiz: [
            ['Which model makes lineage automatic?', 'Asset-first, because dependencies are declared on data, not tasks.'],
            ['What is the strongest argument for Airflow in a new project?', 'Maturity, hosting options and the breadth of providers.'],
          ],
          prereqs: ['Airflow essentials', 'Dagster essentials', 'Prefect essentials'],
        },
      ],
    },
    {
      title: 'Configuration and Secrets',
      description: 'The same pipeline, many environments, no leaked credentials.',
      topics: [
        {
          title: 'Configuration and environments',
          description: 'Pipeline settings in versioned YAML or TOML per environment, validated at load time, with the pipeline code identical across dev, staging and production and only the configuration differing.',
          concepts: ['Per-environment config files', 'Validation on load', 'Config precedence rules', 'No environment branches in code'],
          quiz: [
            ['Where should the production database name live?', 'In production configuration, not in code.'],
            ['Why validate configuration at startup?', 'A bad value should fail immediately, not after hours of processing.'],
          ],
        },
        {
          title: 'Secrets management',
          description: 'Credentials from a secrets backend (Vault, AWS Secrets Manager, cloud KMS) injected at runtime, rotated without redeploying, never logged and never written into DAG files or repositories.',
          concepts: ['Secrets backends and injection', 'Rotation without redeploys', 'Masking in logs and UIs', 'Scoped credentials per pipeline'],
          quiz: [
            ['How does Airflow read secrets from Vault?', 'Through a configured secrets backend that resolves connections and variables.'],
            ['Why give each pipeline its own credentials?', 'To limit blast radius and make access auditable.'],
          ],
          prereqs: ['Configuration and environments'],
        },
        {
          title: 'Parameters and templating',
          description: 'Run-time parameters (interval, partition, flags) reach tasks through templated fields or typed configuration, letting the same DAG serve schedules, backfills and manual runs.',
          concepts: ['Templated fields and Jinja', 'Typed run configuration', 'Manual runs with parameters', 'Defaults and validation'],
          quiz: [
            ['What does {{ data_interval_start }} provide in Airflow?', 'The start of the run\'s data interval, rendered at runtime.'],
            ['Why prefer typed parameters over free-form strings?', 'Errors surface before the run starts.'],
          ],
          prereqs: ['Configuration and environments'],
        },
        {
          title: 'Pinning versions and dependencies',
          description: 'Pipeline images and environments pinned to exact library versions, orchestrator and provider versions upgraded deliberately, and a rollback path when an upgrade changes behaviour.',
          concepts: ['Locked pipeline environments', 'Separating orchestrator and task dependencies', 'Upgrade and rollback process', 'Reproducing an old run'],
          quiz: [
            ['Why run task code in its own image rather than the scheduler environment?', 'Task dependencies stop conflicting with the orchestrator\'s.'],
            ['What allows reproducing a run from six months ago?', 'The pinned image and configuration version recorded with the run.'],
          ],
        },
      ],
    },
    {
      title: 'Observability and Lineage',
      description: 'Knowing what ran, what it touched and whether it is on time.',
      topics: [
        {
          title: 'Logging and run metadata',
          description: 'Task logs with run and task ids, centralised in a log store, plus a metadata record per run (status, duration, rows, versions) that answers most operational questions without reading logs.',
          concepts: ['Task log conventions', 'Centralised log storage', 'Run metadata records', 'Correlating logs and metadata'],
          quiz: [
            ['What should every task log line include?', 'Run id, task id and the partition or interval.'],
            ['Why store run metadata separately from logs?', 'It is queryable for dashboards and trends.'],
          ],
        },
        {
          title: 'Pipeline metrics and dashboards',
          description: 'Duration, success rate, rows processed, freshness and queue times per pipeline, trended over time so degradation is visible before it becomes an outage.',
          concepts: ['Core pipeline metrics', 'Freshness as a metric', 'Trend dashboards', 'Baselines for anomaly detection'],
          quiz: [
            ['Which metric best signals silent failure?', 'Rows processed dropping far below the baseline while status is success.'],
            ['What is freshness?', 'The time since the latest data a consumer can see was produced.'],
          ],
          prereqs: ['Logging and run metadata'],
        },
        {
          title: 'Data lineage',
          description: 'Tracking which datasets each run read and wrote, at table or column level, with OpenLineage-style events, so impact analysis and root-cause investigation follow the graph instead of guesswork.',
          concepts: ['Run-level lineage events', 'Table and column lineage', 'OpenLineage and Marquez', 'Impact analysis'],
          quiz: [
            ['What question does lineage answer during an incident?', 'Which downstream tables and dashboards were built from the bad data.'],
            ['Where does lineage come from in asset-based orchestrators?', 'The declared asset dependencies.'],
          ],
        },
        {
          title: 'Alerting and on-call',
          description: 'Alerts on failures, SLA misses and anomalies routed to owners with context and runbooks, deduplicated and tiered by severity so people respond to real problems and not noise.',
          concepts: ['Alert conditions and severity', 'Routing to owners', 'Deduplication and grouping', 'Runbooks and escalation'],
          quiz: [
            ['What should an alert contain?', 'What failed, which partition, a link to logs and the runbook.'],
            ['Why tier alerts by severity?', 'So a warehouse outage pages someone while a warning waits for morning.'],
          ],
          prereqs: ['Pipeline metrics and dashboards'],
        },
        {
          title: 'SLAs and freshness checks',
          description: 'Defining when each dataset must be ready and how fresh it must be, measuring against those targets, and checking freshness at the data level so an SLA is judged on the output, not on task status.',
          concepts: ['Defining SLAs per dataset', 'Freshness checks on the data', 'SLA miss detection', 'Reporting SLA attainment'],
          quiz: [
            ['Why check freshness on the table rather than the task?', 'A task can succeed while writing stale or empty data.'],
            ['What is a reasonable SLA statement?', 'Orders mart ready by 06:00 UTC with data through the previous day.'],
          ],
          prereqs: ['Alerting and on-call'],
        },
      ],
    },
    {
      title: 'Cost and Reliability',
      description: 'Staying within budget and surviving failure.',
      topics: [
        {
          title: 'Cost control',
          description: 'Right-sizing workers and clusters, spot instances for retryable tasks, scheduling heavy jobs off-peak, limiting warehouse compute per pipeline and attributing cost to owners so waste has a name.',
          concepts: ['Right-sizing compute', 'Spot and preemptible workers', 'Off-peak scheduling', 'Cost attribution by pipeline'],
          quiz: [
            ['Which tasks suit spot instances?', 'Idempotent, retryable tasks that tolerate interruption.'],
            ['How do you find the most expensive pipeline?', 'Tag compute and warehouse queries with the pipeline name and aggregate cost.'],
          ],
        },
        {
          title: 'Retries, timeouts and circuit breakers',
          description: 'Retry policies per task with backoff, execution timeouts to kill hung tasks, and circuit-breaker behaviour that stops hammering a failing dependency across many tasks.',
          concepts: ['Per-task retry policies', 'Execution timeouts', 'Circuit breakers for dependencies', 'Retry storms'],
          quiz: [
            ['Why set an execution timeout on every task?', 'A hung task otherwise holds a worker slot indefinitely.'],
            ['What is a retry storm?', 'Many tasks retrying a failing dependency simultaneously and making it worse.'],
          ],
        },
        {
          title: 'Partial failure and compensation',
          description: 'Deciding whether downstream tasks run when an upstream partially succeeded, trigger rules such as all_done or one_failed, and compensating actions that clean up half-written outputs.',
          concepts: ['Trigger rules', 'Degraded runs and partial success', 'Cleanup and compensation tasks', 'Signalling partial results'],
          quiz: [
            ['When would you use a trigger rule of all_done?', 'For a cleanup or notification task that must run whether upstream succeeded or failed.'],
            ['What is a compensation task?', 'A step that undoes or cleans up the effects of a failed task.'],
          ],
          prereqs: ['Retries, timeouts and circuit breakers'],
        },
        {
          title: 'Concurrency limits and pools',
          description: 'Capping concurrent tasks per pipeline, per resource pool and per source system so backfills and busy periods do not overload databases, APIs or the orchestrator itself.',
          concepts: ['DAG and task concurrency limits', 'Resource pools', 'Protecting source systems', 'Priority weights'],
          quiz: [
            ['What does a pool of size 4 enforce?', 'At most four tasks assigned to that pool run at once.'],
            ['Why limit concurrency during a backfill?', 'To avoid overwhelming the source database and starving daily runs.'],
          ],
        },
        {
          title: 'Disaster recovery and replay',
          description: 'Backing up the orchestrator metadata database, keeping raw data so any layer can be rebuilt, documenting replay procedures and testing them, because the ability to recompute is the real backup.',
          concepts: ['Metadata database backups', 'Rebuilding from raw data', 'Replay runbooks', 'Testing recovery'],
          quiz: [
            ['What is lost if the orchestrator metadata database is lost?', 'Run history, state and connections, but not the data itself if raw is retained.'],
            ['How do you test recovery?', 'Periodically rebuild a downstream table from raw in a separate environment and compare.'],
          ],
          prereqs: ['Partial failure and compensation'],
        },
      ],
    },
    {
      title: 'Testing and CI/CD',
      description: 'Shipping pipeline changes with confidence.',
      topics: [
        {
          title: 'Unit testing pipeline code',
          description: 'Testing task logic as plain functions with fixtures, mocking external systems, and keeping orchestrator-specific wiring thin so most code is testable without a scheduler running.',
          concepts: ['Thin orchestrator wrappers', 'Testing task functions directly', 'Mocking external systems', 'Fast feedback loops'],
          quiz: [
            ['Why keep business logic out of operator definitions?', 'So it can be unit tested without importing the orchestrator.'],
            ['What should a unit test never do?', 'Connect to a real production system.'],
          ],
        },
        {
          title: 'DAG integrity tests',
          description: 'Tests that import every DAG file, assert no cycles, unique ids, owners and retries set, and reasonable parse time, catching broken deployments before the scheduler does.',
          concepts: ['Import-all DAG tests', 'Cycle and id checks', 'Policy checks: owners, retries, tags', 'Parse-time limits'],
          quiz: [
            ['What does a DAG integrity test catch?', 'Import errors, cycles and missing required attributes.'],
            ['Why test parse time?', 'Slow DAG files degrade the whole scheduler.'],
          ],
          prereqs: ['Unit testing pipeline code'],
        },
        {
          title: 'Integration tests with sample data',
          description: 'Running a pipeline end to end against small sample inputs in an isolated environment, asserting outputs and data quality checks, on every pull request or before promotion.',
          concepts: ['Isolated test environments', 'Sample datasets', 'End-to-end assertions', 'Running in CI'],
          quiz: [
            ['What proves a pipeline change is safe to merge?', 'An end-to-end run on sample data with quality checks passing.'],
            ['Why keep sample data small?', 'CI must finish in minutes.'],
          ],
          prereqs: ['DAG integrity tests'],
        },
        {
          title: 'CI/CD for pipelines',
          description: 'Lint, test and build images in CI, deploy DAGs and configuration through version control, promote through environments, and roll back by redeploying a previous version.',
          concepts: ['CI stages for pipelines', 'Deploying DAGs from git', 'Environment promotion', 'Rollback strategy'],
          quiz: [
            ['How should DAG files reach production?', 'Through a CI-driven deploy from a tagged commit, never by copying files.'],
            ['What is the rollback for a bad deploy?', 'Redeploy the previous tagged version.'],
          ],
          prereqs: ['Integration tests with sample data'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Operate pipelines like production, then discuss them like an engineer.',
      style: 'project',
      topics: [
        {
          title: 'Project: daily partitioned pipeline in Airflow',
          description: 'Build an Airflow DAG that extracts an API by data interval, lands raw files, loads a warehouse partition idempotently and runs quality checks, with retries, timeouts, an SLA and a tested backfill of 30 days.',
          concepts: ['DAG with interval parameters', 'Idempotent partition loads', 'Quality checks and SLA', 'Backfill and verification'],
          quiz: [
            ['How do you run 30 days of history?', 'Trigger a backfill over the date range with limited concurrency.'],
            ['What proves idempotency in this project?', 'Rerunning a day produces identical partition contents.'],
          ],
        },
        {
          title: 'Project: asset graph in Dagster',
          description: 'Model raw, staged and mart tables as partitioned Dagster assets with freshness policies and asset checks, backfill missing partitions from the UI, and show lineage from source to mart.',
          concepts: ['Define partitioned assets', 'Asset checks and freshness', 'Backfill from the UI', 'Inspect lineage'],
          quiz: [
            ['What does an asset check do?', 'Validates a materialised asset and records pass or fail.'],
            ['How is lineage produced?', 'From the declared upstream assets of each asset.'],
          ],
        },
        {
          title: 'Project: observability and alerting layer',
          description: 'Add structured logging, run metadata, metrics and lineage events to an existing pipeline, build a freshness dashboard, and wire alerts with runbooks that route failures and SLA misses to owners.',
          concepts: ['Instrument tasks', 'Metrics and freshness dashboard', 'Lineage events', 'Alerts and runbooks'],
          quiz: [
            ['Which alert should page at night?', 'A missed SLA on a business-critical dataset.'],
            ['What makes a runbook useful?', 'Concrete steps to diagnose and recover, kept next to the alert.'],
          ],
        },
        {
          title: 'Project: pipeline CI/CD and environments',
          description: 'Set up dev, staging and production configurations, DAG integrity and unit tests, an integration run on sample data, and a deploy that promotes tagged versions with a documented rollback.',
          concepts: ['Environment configuration', 'Test suites in CI', 'Promotion workflow', 'Rollback rehearsal'],
          quiz: [
            ['What blocks a merge?', 'Failing integrity, unit or integration tests.'],
            ['How do you rehearse rollback?', 'Deploy a previous tag to staging and verify runs succeed.'],
          ],
        },
        {
          title: 'Data pipeline interview questions',
          description: 'What a DAG is, logical date versus execution time, how you backfill safely, how you make tasks idempotent, Airflow versus Dagster, how you monitor freshness, and what you do when a pipeline is late.',
          concepts: ['Orchestration concept questions', 'Backfill and idempotency questions', 'Tool comparison questions', 'Operations questions'],
          quiz: [
            ['Explain the logical date in one sentence.', 'The data interval a run is responsible for, independent of when it executes.'],
            ['What is your first step when a pipeline misses its SLA?', 'Check which task is late or failed and whether the source arrived.'],
          ],
          style: 'reading',
        },
        {
          title: 'Pipeline operations exercises',
          description: 'Scenario drills: a backfill is overloading the source, a task hangs nightly, a partition was restated and dashboards changed, costs doubled last month; diagnose and propose fixes in ten minutes each.',
          concepts: ['Diagnosing overloaded sources', 'Hung task investigation', 'Explaining restated data', 'Cost spike analysis'],
          quiz: [
            ['A backfill overloads the source. What do you change first?', 'The pool or concurrency limit for that source.'],
            ['Where do you look when costs doubled?', 'Per-pipeline cost attribution to find which pipeline grew.'],
          ],
          style: 'practice',
        },
      ],
    },
  ],
})
