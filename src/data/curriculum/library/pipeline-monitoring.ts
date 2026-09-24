import { defineTrack } from '../define'

export const pipelineMonitoring = defineTrack({
  id: 'track-pipeline-monitoring',
  title: 'Pipeline Monitoring',
  description: 'Operating data pipelines like production services: what to monitor (freshness, volume, schema, distribution, lineage), SLAs and SLOs for data, structured logging, Prometheus and Grafana, alerting and on-call, observability tools, cost monitoring, runbooks, postmortems and streaming lag.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '📡',
  tags: ['monitoring', 'observability', 'prometheus', 'grafana', 'alerting', 'on-call', 'sla', 'data-observability'],
  languages: ['Python', 'YAML', 'PromQL'],
  explainMode: 'devops',
  code: { label: 'Python, YAML and PromQL, whichever fits', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'What to Monitor',
      description: 'The five pillars of data observability and why each catches a different failure.',
      topics: [
        {
          title: 'Freshness',
          description: 'How long since a dataset last updated compared with its expected cadence; freshness is the first thing consumers notice and the easiest signal to compute from a max timestamp or last-run record.',
          concepts: ['Expected cadence per dataset', 'Measuring lag from max timestamp', 'Freshness from run metadata', 'Freshness alerts'],
          quiz: [
            ['How do you compute freshness for a table?', 'Now minus the max of its updated_at or load timestamp.'],
            ['Why is freshness not enough on its own?', 'A table can update on time with wrong or missing rows.'],
          ],
        },
        {
          title: 'Volume',
          description: 'Row counts and bytes per load compared with recent history; a sudden drop signals lost data, a spike signals duplicates or a runaway upstream, and both hide behind a successful job status.',
          concepts: ['Row counts per load', 'Baselines with seasonality', 'Drops versus spikes', 'Volume per partition'],
          quiz: [
            ['A job succeeds but wrote zero rows: which signal catches it?', 'Volume.'],
            ['Why compare volume per partition?', 'A total can look fine while one source is missing.'],
          ],
          prereqs: ['Freshness'],
        },
        {
          title: 'Schema changes',
          description: 'Detecting added, removed or retyped columns at the source and in the warehouse before they break transformations; comparing information_schema snapshots and registering expected schemas.',
          concepts: ['Schema snapshots', 'Diffing information_schema', 'Breaking versus additive changes', 'Schema change notifications'],
          quiz: [
            ['How do you detect a dropped column daily?', 'Snapshot column lists and diff them against yesterday.'],
            ['Which change is usually safe?', 'An added nullable column.'],
          ],
          prereqs: ['Freshness'],
        },
        {
          title: 'Distribution',
          description: 'Null rates, distinct counts, category shares and numeric ranges tracked over time; distribution shifts reveal upstream bugs and silent semantic changes that counts and freshness miss.',
          concepts: ['Column-level statistics over time', 'Null and distinct rate shifts', 'Range and category drift', 'Sampling for large tables'],
          quiz: [
            ['What does a null rate rising from 1 to 30 percent suggest?', 'An upstream field stopped being populated or was renamed.'],
            ['Why sample for distribution checks?', 'Full scans of large tables daily are expensive; a sample tracks shape well enough.'],
          ],
          prereqs: ['Volume'],
        },
        {
          title: 'Lineage as a monitoring signal',
          description: 'Knowing which upstream jobs feed a dataset lets a monitor explain a failure and predict which dashboards will be stale, turning isolated alerts into an impact map.',
          concepts: ['Upstream and downstream graph', 'Impact analysis on failure', 'Root cause via lineage', 'Lineage capture with OpenLineage'],
          quiz: [
            ['Why attach lineage to an alert?', 'The responder sees the cause upstream and the consumers affected downstream.'],
            ['What tool standard emits lineage from Airflow and Spark?', 'OpenLineage.'],
          ],
          prereqs: ['Schema changes'],
        },
      ],
    },
    {
      title: 'SLAs, SLOs and SLIs for Data',
      description: 'Turning expectations into numbers you can be held to.',
      topics: [
        {
          title: 'SLIs, SLOs and SLAs defined for data',
          description: 'An SLI is a measurement (freshness lag), an SLO is a target on it (under 2 hours 99 percent of days), an SLA is the agreement and consequence; applying the service reliability vocabulary to datasets.',
          concepts: ['SLI as a measurement', 'SLO as a target', 'SLA as an agreement', 'Common data SLIs'],
          quiz: [
            ['What is the SLI for a daily table?', 'The time the table became available relative to its deadline.'],
            ['What makes an SLO measurable?', 'A concrete indicator, a threshold and a time window.'],
          ],
        },
        {
          title: 'Choosing targets and error budgets',
          description: 'Setting targets from consumer needs and historical performance rather than aspiration, computing an error budget, and using budget burn to decide between shipping and fixing reliability.',
          concepts: ['Deriving targets from needs', 'Error budget calculation', 'Burn rate', 'Budget policy decisions'],
          quiz: [
            ['What is the error budget of a 99 percent daily SLO over 30 days?', 'About 0.3 days, so roughly one miss.'],
            ['What should happen when the budget is spent?', 'Reliability work takes priority over new features.'],
          ],
          prereqs: ['SLIs, SLOs and SLAs defined for data'],
        },
        {
          title: 'Measuring and reporting SLO compliance',
          description: 'Recording SLI values per run in a table or metric, computing compliance over rolling windows, and publishing a status page or dashboard that consumers can check themselves.',
          concepts: ['SLI recording per run', 'Rolling window compliance', 'Status page for datasets', 'Monthly SLO review'],
          quiz: [
            ['Where should SLI values be stored?', 'A metrics store or a small warehouse table with one row per run.'],
            ['Why publish a status page?', 'Consumers stop asking and start trusting the numbers.'],
          ],
          prereqs: ['Choosing targets and error budgets'],
        },
        {
          title: 'Tiering datasets by criticality',
          description: 'Not every table deserves paging: tiering by business impact assigns stricter SLOs, alert routes and on-call to critical datasets and best-effort monitoring to the rest.',
          concepts: ['Criticality tiers', 'SLOs per tier', 'Alert routing per tier', 'Reviewing tier assignments'],
          quiz: [
            ['What defines a tier-1 dataset?', 'Direct impact on revenue, customers or regulatory reporting if late or wrong.'],
            ['Should tier-3 datasets page anyone?', 'No, they generate tickets or dashboard warnings only.'],
          ],
          prereqs: ['SLIs, SLOs and SLAs defined for data'],
        },
      ],
    },
    {
      title: 'Logging for Data Jobs',
      description: 'Logs that answer questions during an incident instead of adding noise.',
      topics: [
        {
          title: 'Structured logging in pipelines',
          description: 'Emitting JSON logs with run id, dataset, stage, row counts and durations so they can be queried; Python logging configuration, structlog, and correlating logs across tasks with a shared run id.',
          concepts: ['JSON log format', 'Run id correlation', 'Python logging and structlog', 'Log levels for data jobs'],
          quiz: [
            ['Why include a run id in every log line?', 'To pull the full story of one run across tasks and workers.'],
            ['What should be logged at INFO for each stage?', 'Input and output row counts and duration.'],
          ],
        },
        {
          title: 'Centralised log collection',
          description: 'Shipping logs from Airflow, Spark and containers to Loki, Elasticsearch or CloudWatch; retention, indexing costs, and searching by run id and dataset during an incident.',
          concepts: ['Log shipping agents', 'Loki and Elasticsearch options', 'Retention and cost', 'Searching during incidents'],
          quiz: [
            ['Why not keep logs only on the worker?', 'Workers are ephemeral and logs vanish with them.'],
            ['What makes Loki cheaper than Elasticsearch?', 'It indexes labels only, not full text.'],
          ],
          prereqs: ['Structured logging in pipelines'],
        },
        {
          title: 'Run metadata and audit tables',
          description: 'Writing one row per pipeline run with start, end, status, rows processed and watermark to a table, giving a queryable history that powers freshness, volume and SLO reporting.',
          concepts: ['Run record schema', 'Writing run rows atomically', 'Deriving metrics from run tables', 'Retention of run history'],
          quiz: [
            ['What can you derive from a run table?', 'Freshness, volume trends, durations and SLO compliance.'],
            ['When should the run row be written?', 'At start with status running, updated at the end with the outcome.'],
          ],
          prereqs: ['Structured logging in pipelines'],
        },
        {
          title: 'Tracing across pipeline stages',
          description: 'OpenTelemetry traces that span extract, transform and load steps with timings, propagating context through orchestrators and services to see where time goes in a slow run.',
          concepts: ['Spans for pipeline stages', 'Context propagation', 'OpenTelemetry SDK for Python', 'Finding slow stages'],
          quiz: [
            ['What does a trace show that logs do not?', 'The timing relationship between stages in one view.'],
            ['How is context passed from Airflow to a job?', 'Trace ids in environment variables or headers.'],
          ],
          prereqs: ['Run metadata and audit tables'],
        },
      ],
    },
    {
      title: 'Metrics and Dashboards',
      description: 'Prometheus and Grafana concepts applied to pipelines.',
      topics: [
        {
          title: 'Prometheus data model',
          description: 'Time series identified by metric name and labels; counters, gauges, histograms and summaries; scraping versus pushing with the Pushgateway for batch jobs that finish before a scrape.',
          concepts: ['Metric names and labels', 'Counter, gauge, histogram, summary', 'Scrape model', 'Pushgateway for batch jobs'],
          quiz: [
            ['Which metric type for rows processed per run?', 'A counter, or a gauge pushed per run.'],
            ['Why use the Pushgateway?', 'Short-lived jobs are gone before Prometheus scrapes them.'],
          ],
        },
        {
          title: 'Instrumenting pipelines with the Python client',
          description: 'Using prometheus_client to expose or push job duration, rows in and out, failures and freshness, with labels for pipeline and dataset, and keeping label cardinality under control.',
          concepts: ['prometheus_client basics', 'Choosing labels', 'Label cardinality limits', 'Pushing at job end'],
          quiz: [
            ['Why not label by run id?', 'Unbounded cardinality creates a new series per run and overwhelms Prometheus.'],
            ['Which metric tracks how long a job took?', 'A histogram or a gauge of duration seconds.'],
          ],
          prereqs: ['Prometheus data model'],
        },
        {
          title: 'PromQL for pipeline questions',
          description: 'rate() on counters, time() minus a last-success timestamp for freshness, increase() over a day for volume, and histogram_quantile for duration percentiles; the queries behind pipeline dashboards and alerts.',
          concepts: ['rate and increase', 'Freshness from timestamps', 'histogram_quantile', 'Aggregating by label'],
          quiz: [
            ['How do you express hours since last success?', '(time() - last_success_timestamp_seconds) / 3600.'],
            ['What does rate(errors_total[5m]) give?', 'Errors per second averaged over five minutes.'],
          ],
          prereqs: ['Instrumenting pipelines with the Python client'],
        },
        {
          title: 'Grafana dashboards for data teams',
          description: 'Dashboard layout by pipeline tier, panels for freshness, volume, duration and failures, template variables per dataset, annotations for deployments, and keeping dashboards few and readable.',
          concepts: ['Panel selection', 'Template variables', 'Deployment annotations', 'Dashboard hygiene'],
          quiz: [
            ['What should the top row of a pipeline dashboard show?', 'Freshness and failure status for tier-1 datasets.'],
            ['Why annotate deployments?', 'To correlate regressions with the change that caused them.'],
          ],
          prereqs: ['PromQL for pipeline questions'],
        },
        {
          title: 'Exporters and integrations',
          description: 'Airflow StatsD metrics, Kafka lag exporters, warehouse query history and cloud monitoring exported into Prometheus so one system holds the whole picture.',
          concepts: ['Airflow StatsD to Prometheus', 'Kafka lag exporter', 'Warehouse metrics ingestion', 'Cloud monitoring bridges'],
          quiz: [
            ['How do Airflow metrics reach Prometheus?', 'Through the StatsD exporter or OpenTelemetry.'],
            ['Which exporter reports consumer group lag?', 'kafka-lag-exporter or Burrow.'],
          ],
          prereqs: ['Prometheus data model'],
        },
      ],
    },
    {
      title: 'Alerting and On-Call',
      description: 'Waking the right person for the right reason.',
      topics: [
        {
          title: 'Alerting rules in Prometheus',
          description: 'Rule files with expr, for and labels; severity labels, grouping by pipeline, and writing expressions that fire on sustained conditions rather than momentary spikes.',
          concepts: ['Alert rule syntax', 'for duration to avoid flapping', 'Severity labels', 'Testing rules with promtool'],
          quiz: [
            ['What does for: 15m do?', 'Requires the condition to hold for 15 minutes before firing.'],
            ['How do you unit test alert rules?', 'promtool test rules with a test file.'],
          ],
        },
        {
          title: 'Routing with Alertmanager',
          description: 'Routes by label to Slack, email or PagerDuty, grouping related alerts into one notification, inhibition so an upstream failure silences downstream ones, and silences during maintenance.',
          concepts: ['Routing tree by labels', 'Grouping and repeat intervals', 'Inhibition rules', 'Silences'],
          quiz: [
            ['What is inhibition for?', 'Suppressing downstream alerts when the upstream cause is already firing.'],
            ['Where should a tier-3 alert go?', 'A Slack channel or ticket, never a pager.'],
          ],
          prereqs: ['Alerting rules in Prometheus'],
        },
        {
          title: 'On-call for data teams',
          description: 'Rotations, escalation policies, handover notes, and the difference between business-hours and 24/7 coverage; what a data on-call is expected to do and not do at 3 a.m.',
          concepts: ['Rotation and escalation design', 'Business hours versus 24/7', 'Handover practice', 'Scope of on-call actions'],
          quiz: [
            ['Should the on-call fix the root cause overnight?', 'No, mitigate and hand off; root causes wait for daytime.'],
            ['What goes in a handover?', 'Open incidents, silenced alerts and known risks.'],
          ],
          prereqs: ['Routing with Alertmanager'],
        },
        {
          title: 'Alert quality and fatigue',
          description: 'Reviewing alert volume, acknowledgement rates and time to resolve; deleting or tuning alerts that never lead to action, and adding runbook links so every page is actionable.',
          concepts: ['Alert review metrics', 'Deleting noisy alerts', 'Runbook links on alerts', 'Actionability test'],
          quiz: [
            ['What is the test for keeping an alert?', 'Someone must act when it fires; otherwise remove or downgrade it.'],
            ['What should every page include?', 'A runbook link and the affected dataset.'],
          ],
          prereqs: ['On-call for data teams'],
        },
      ],
    },
    {
      title: 'Data Observability Tools',
      description: 'Platforms that automate the pillars, and how they work under the hood.',
      topics: [
        {
          title: 'Monte Carlo and automated anomaly monitors',
          description: 'How commercial data observability platforms learn baselines from warehouse metadata and query logs to alert on freshness, volume and schema without hand-written rules, plus their lineage and incident features.',
          concepts: ['Metadata-driven monitors', 'Learned baselines', 'Lineage and impact features', 'Cost and coverage trade-offs'],
          quiz: [
            ['What data does Monte Carlo mostly use?', 'Warehouse metadata, query logs and information_schema, not full table scans.'],
            ['What is the value of automated monitors?', 'Coverage of every table without writing rules for each.'],
          ],
        },
        {
          title: 'Elementary for dbt projects',
          description: 'An open-source package that stores dbt run and test results in the warehouse, adds anomaly tests, generates a report and sends alerts; observability that lives inside the dbt workflow.',
          concepts: ['Elementary models and artifacts', 'Anomaly detection tests', 'Elementary report', 'Slack alerts from dbt runs'],
          quiz: [
            ['Where does Elementary store results?', 'In tables in your warehouse populated by dbt on-run-end hooks.'],
            ['What does an Elementary volume anomaly test compare?', 'Current row counts with a learned baseline from history.'],
          ],
          prereqs: ['Monte Carlo and automated anomaly monitors'],
        },
        {
          title: 'Building your own observability layer',
          description: 'A metrics collector that samples freshness, volume and schema into a table, a baseline job, an alerting job and a Grafana dashboard; when the DIY route beats buying.',
          concepts: ['Collector job design', 'Baseline computation', 'Alert evaluation job', 'Build versus buy decision'],
          quiz: [
            ['What is the hidden cost of DIY observability?', 'Maintaining collectors and baselines as the platform changes.'],
            ['What is the minimal viable version?', 'A daily freshness and row count table with a threshold alert.'],
          ],
          prereqs: ['Elementary for dbt projects'],
        },
        {
          title: 'Warehouse-native monitoring features',
          description: 'Snowflake data metric functions, BigQuery INFORMATION_SCHEMA and audit logs, Databricks Lakehouse Monitoring; using what the warehouse already exposes before adding tools.',
          concepts: ['Snowflake data metric functions', 'BigQuery INFORMATION_SCHEMA views', 'Databricks Lakehouse Monitoring', 'Query history as a signal'],
          quiz: [
            ['What does BigQuery INFORMATION_SCHEMA.JOBS tell you?', 'Who ran what, bytes billed and durations for each job.'],
            ['What can a Snowflake data metric function measure?', 'Freshness, null counts, duplicates and row counts on a schedule.'],
          ],
          prereqs: ['Monte Carlo and automated anomaly monitors'],
        },
      ],
    },
    {
      title: 'Cost and Streaming Monitoring',
      description: 'Two specialised signals every data platform needs.',
      topics: [
        {
          title: 'Cost monitoring for pipelines',
          description: 'Attributing compute and query cost to pipelines via tags, query labels and job metadata, tracking cost per run and per dataset, and alerting on cost anomalies as you would on failures.',
          concepts: ['Cost attribution by tags and labels', 'Cost per run and per dataset', 'Cost anomaly alerts', 'Cost dashboards'],
          quiz: [
            ['How do you attribute a BigQuery query to a pipeline?', 'Set job labels from the orchestrator and group INFORMATION_SCHEMA.JOBS by label.'],
            ['What is a typical cost anomaly cause?', 'A query lost its partition filter after a change.'],
          ],
        },
        {
          title: 'Monitoring streaming consumer lag',
          description: 'Lag per partition and per group as the primary health metric for stream consumers, exporting it, alerting on sustained growth, and pairing lag with throughput to distinguish slow consumers from bursty producers.',
          concepts: ['Lag per partition and group', 'Lag versus throughput analysis', 'Sustained-growth alerts', 'Lag dashboards'],
          quiz: [
            ['What does lag growing on all partitions mean?', 'The consumer cannot keep up overall; scale or optimise it.'],
            ['What does lag on one partition mean?', 'A hot key or a stuck consumer instance for that partition.'],
          ],
          prereqs: ['Cost monitoring for pipelines'],
        },
        {
          title: 'Streaming job health metrics',
          description: 'Checkpoint duration and failures, restart counts, watermark progress, backpressure and end-to-end latency for Flink and Spark streaming jobs, and what each anomaly usually indicates.',
          concepts: ['Checkpoint metrics', 'Restart counts', 'Watermark and latency', 'Backpressure indicators'],
          quiz: [
            ['What does a stalled watermark suggest?', 'An idle source partition or a slow operator.'],
            ['What do frequent restarts hide?', 'A recurring failure the job recovers from but never fixes.'],
          ],
          prereqs: ['Monitoring streaming consumer lag'],
        },
        {
          title: 'Synthetic checks and canary records',
          description: 'Sending a known record through a pipeline and timing its arrival at the sink as an end-to-end latency probe, and heartbeat checks that prove a pipeline is alive when no real data flows.',
          concepts: ['Canary record injection', 'End-to-end latency probe', 'Heartbeat checks', 'Filtering canaries from data'],
          quiz: [
            ['Why send a canary record?', 'It measures true end-to-end latency and proves every stage works.'],
            ['How do you keep canaries out of reports?', 'Tag them and filter on the tag in consumers.'],
          ],
          prereqs: ['Streaming job health metrics'],
        },
      ],
    },
    {
      title: 'Incidents, Runbooks and Postmortems',
      description: 'Handling failures consistently and learning from them.',
      topics: [
        {
          title: 'Writing runbooks',
          description: 'A runbook per alert: what the alert means, how to confirm it, first mitigation steps, who to contact and how to verify recovery; kept next to the code and linked from the alert.',
          concepts: ['Runbook structure', 'Confirmation steps', 'Mitigation before root cause', 'Keeping runbooks current'],
          quiz: [
            ['What is the first section of a runbook?', 'What the alert means and how to confirm it is real.'],
            ['Where should runbooks live?', 'In the repository, linked from the alert definition.'],
          ],
        },
        {
          title: 'Data incident response',
          description: 'Declaring severity, assigning an incident lead, communicating to consumers, containing bad data, and tracking the timeline; adapting the software incident process to data.',
          concepts: ['Severity levels for data', 'Incident lead role', 'Consumer communication', 'Timeline tracking'],
          quiz: [
            ['What is a sev-1 data incident?', 'Wrong or missing data affecting customers, revenue or regulatory output.'],
            ['Who communicates status?', 'The incident lead, on a fixed cadence.'],
          ],
          prereqs: ['Writing runbooks'],
        },
        {
          title: 'Backfills and recovery',
          description: 'Recovering from an incident by re-running affected intervals safely: idempotent tasks, ordering of dependent backfills, throttling, and verifying corrected data before announcing recovery.',
          concepts: ['Identifying affected intervals', 'Ordered dependent backfills', 'Throttling backfill load', 'Verifying recovery'],
          quiz: [
            ['Why throttle a backfill?', 'To avoid starving normal runs and overloading sources.'],
            ['How do you know the backfill worked?', 'Freshness, volume and reconciliation checks pass for the intervals.'],
          ],
          prereqs: ['Data incident response'],
        },
        {
          title: 'Blameless postmortems',
          description: 'Reconstructing the timeline, finding contributing causes, deciding on monitoring and process changes, and tracking actions; postmortems as the main way monitoring improves.',
          concepts: ['Timeline reconstruction', 'Contributing causes', 'Monitoring gaps found', 'Action tracking'],
          quiz: [
            ['What question does a postmortem ask about detection?', 'How long until we noticed, and what would have told us sooner?'],
            ['What makes an action item useful?', 'An owner, a deadline and a specific change.'],
          ],
          prereqs: ['Data incident response'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: pipeline metrics with Prometheus and Grafana',
          description: 'Instrument an existing batch pipeline with prometheus_client, push duration, rows and last-success time to a Pushgateway, build a Grafana dashboard with freshness and volume panels, and add an alert rule for staleness.',
          concepts: ['Add metrics to the job', 'Run Pushgateway and Prometheus', 'Build the dashboard', 'Write and test the alert'],
          quiz: [
            ['Which metric drives the staleness alert?', 'A gauge of the last success timestamp.'],
            ['How do you test the alert without waiting?', 'promtool test rules with synthetic series.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: freshness and volume monitor with SLO reporting',
          description: 'A scheduled job that records freshness and row counts for every table in a schema, stores them in a run table, evaluates SLOs per tier, posts Slack alerts on breaches and renders a weekly compliance report.',
          concepts: ['Collect per-table metrics', 'Store history in a table', 'Evaluate tiered SLOs', 'Report compliance weekly'],
          quiz: [
            ['How do you compute 30-day compliance?', 'Days meeting the SLO divided by days observed.'],
            ['What triggers a page versus a message?', 'Tier-1 breaches page; others message.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: streaming lag dashboard and alerts',
          description: 'Deploy a Kafka lag exporter against a local cluster, run a deliberately slow consumer, chart lag and throughput in Grafana, alert on sustained lag growth with Alertmanager routing to Slack, and write the runbook.',
          concepts: ['Deploy the lag exporter', 'Simulate a slow consumer', 'Chart lag against throughput', 'Alert, route and document'],
          quiz: [
            ['What expression detects sustained growth?', 'deriv or increase of lag over 10 minutes above zero, with a for clause.'],
            ['What does the runbook tell the responder to check first?', 'Whether the consumer is running and its processing time per record.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: incident simulation and postmortem',
          description: 'Inject a schema change into a source, watch which monitors fire and how long detection took, run the incident process with a lead and consumer updates, backfill the fix, and write a postmortem with new monitors.',
          concepts: ['Inject the failure', 'Measure detection time', 'Run the incident process', 'Write the postmortem and add monitors'],
          quiz: [
            ['What if no monitor fired?', 'The postmortem\'s first action is a schema change monitor.'],
            ['What is the last step?', 'Verifying the backfill and closing the incident with consumers.'],
          ],
          style: 'project',
        },
        {
          title: 'Pipeline monitoring interview questions',
          description: 'What you would monitor first, how to define a freshness SLO, how alerting avoids noise, reading a Grafana panel, diagnosing rising lag, and how you handled a data incident.',
          concepts: ['Pillar and signal questions', 'SLO and alerting questions', 'Streaming lag questions', 'Incident experience questions'],
          quiz: [
            ['What do you monitor first on a new pipeline?', 'Freshness and volume, then failures and schema.'],
            ['How do you keep alerts actionable?', 'Sustained conditions, tiered routing, runbooks and regular pruning.'],
          ],
          style: 'reading',
        },
        {
          title: 'Designing monitoring for a case study',
          description: 'Given a platform with batch loads, dbt models and a Kafka stream, propose the metrics, SLOs, dashboards, alert routes, on-call model and runbooks, with costs and a rollout order.',
          concepts: ['Inventory pipelines and tiers', 'Metrics and SLOs per tier', 'Alert and on-call design', 'Rollout plan'],
          quiz: [
            ['How do you decide what pages?', 'Only tier-1 breaches with a runbook and a human action.'],
            ['What is the first thing to ship?', 'Freshness monitoring on tier-1 datasets.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
