import { defineTrack } from '../define'

export const airflow = defineTrack({
  id: 'track-airflow',
  title: 'Apache Airflow',
  description: 'Orchestrating data pipelines with Airflow: the scheduler and executor model, DAGs written with the TaskFlow API, operators, sensors and hooks, scheduling and backfills, XCom and dynamic task mapping, secrets, testing, deployment on Docker and Kubernetes, and observability.',
  family: 'Data Engineering',
  kind: 'tooling',
  icon: '🌬️',
  tags: ['airflow', 'orchestration', 'dags', 'scheduling', 'data-pipelines', 'python'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python (Airflow DAGs)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-data-pipelines'],
  style: 'code',
  categories: [
    {
      title: 'Architecture and Setup',
      description: 'What the moving parts are and how to run them locally.',
      topics: [
        {
          title: 'Why an orchestrator',
          description: 'Cron scripts cannot express dependencies, retries, backfills or visibility; Airflow models pipelines as code with a scheduler that runs tasks in dependency order and a UI that shows every run, which is why it became the default for batch workflows.',
          concepts: ['Limits of cron and shell scripts', 'Workflows as code', 'Dependency-driven execution', 'Airflow versus other orchestrators'],
          quiz: [
            ['What does Airflow add over cron?', 'Dependencies, retries, backfills, parameterised runs and a UI with history.'],
            ['Is Airflow a data processing engine?', 'No, it orchestrates work that runs elsewhere; heavy compute belongs in Spark, a warehouse or a service.'],
          ],
        },
        {
          title: 'Scheduler, executor, workers and metadata database',
          description: 'The scheduler parses DAG files and decides what to run, the executor hands tasks to workers (local, Celery or Kubernetes), and the metadata database records every state; knowing which component owns what explains most failures.',
          concepts: ['Scheduler parsing and scheduling loop', 'Executor types compared', 'Workers and task execution', 'Metadata database role', 'Webserver and API server'],
          quiz: [
            ['Which component decides a task is ready to run?', 'The scheduler.'],
            ['Where is task state stored?', 'In the metadata database (Postgres or MySQL in production).'],
          ],
          prereqs: ['Why an orchestrator'],
        },
        {
          title: 'Running Airflow locally with Docker Compose',
          description: 'The official Compose file brings up scheduler, webserver, workers, Postgres and Redis; mounting the dags folder, setting AIRFLOW_UID, initialising the database, and using the Airflow CLI inside a container.',
          concepts: ['Official docker-compose layout', 'Mounting dags, logs and plugins', 'Database initialisation', 'Airflow CLI inside containers'],
          quiz: [
            ['Why set AIRFLOW_UID on Linux?', 'So files written to mounted volumes are owned by your user, not root.'],
            ['Which command creates the metadata schema?', 'airflow db migrate (airflow db init on older versions).'],
          ],
          prereqs: ['Scheduler, executor, workers and metadata database'],
        },
        {
          title: 'The web UI and CLI',
          description: 'Reading the Grid and Graph views, task logs, and the audit trail; pausing DAGs, clearing tasks, marking success, and the CLI equivalents (airflow dags list, airflow tasks test) used in scripts and debugging.',
          concepts: ['Grid and Graph views', 'Task instance actions', 'airflow dags and tasks commands', 'Pausing and unpausing DAGs'],
          quiz: [
            ['What does clearing a task instance do?', 'Resets its state so the scheduler runs it again, along with downstream tasks by default.'],
            ['Which command runs one task without the scheduler?', 'airflow tasks test <dag> <task> <date>.'],
          ],
          prereqs: ['Running Airflow locally with Docker Compose'],
        },
      ],
    },
    {
      title: 'DAGs and Tasks',
      description: 'The core abstractions and the modern way to write them.',
      topics: [
        {
          title: 'Defining a DAG',
          description: 'A DAG object with a dag_id, schedule, start_date, catchup and default_args; the DAG file is a Python script the scheduler imports repeatedly, so it must be fast and side-effect free at top level.',
          concepts: ['DAG constructor arguments', 'default_args inheritance', 'Top-level code rules', 'DAG file parsing and dag_id uniqueness'],
          quiz: [
            ['Why avoid database calls at the top level of a DAG file?', 'The scheduler re-parses the file every few seconds, so the call runs constantly.'],
            ['What happens if two files define the same dag_id?', 'One silently overrides the other; the UI shows only one DAG.'],
          ],
        },
        {
          title: 'Tasks, operators and task instances',
          description: 'A task is an operator instance in a DAG; a task instance is one execution of it for one logical date; state transitions (queued, running, success, failed, up_for_retry) and what each one means operationally.',
          concepts: ['Operator versus task versus task instance', 'Task instance states', 'task_id naming', 'Retries, retry_delay and timeouts'],
          quiz: [
            ['What is a task instance?', 'A single run of a task for a specific DAG run.'],
            ['What does up_for_retry mean?', 'The task failed and will be retried after retry_delay.'],
          ],
          prereqs: ['Defining a DAG'],
        },
        {
          title: 'The TaskFlow API',
          description: 'Decorating Python functions with @task turns them into operators whose return values flow to downstream tasks as XCom automatically; @dag builds the DAG from a function, which removes most boilerplate for Python-centred pipelines.',
          concepts: ['@dag and @task decorators', 'Return values as XCom', 'Calling tasks to wire dependencies', 'Mixing TaskFlow and classic operators'],
          quiz: [
            ['How do you pass a value from one @task to another?', 'Return it and pass the result into the next task call.'],
            ['Where does a large return value go?', 'Into XCom, so keep it small or use a custom XCom backend.'],
          ],
          prereqs: ['Tasks, operators and task instances'],
        },
        {
          title: 'Common operators',
          description: 'PythonOperator, BashOperator, EmptyOperator, BranchPythonOperator and provider operators such as SQLExecuteQueryOperator and S3 transfer operators; when to reach for a provider package instead of writing Python.',
          concepts: ['PythonOperator and BashOperator', 'EmptyOperator as a marker', 'Provider packages and their operators', 'Deferrable operators'],
          quiz: [
            ['Why use a provider operator instead of raw Python?', 'It handles connections, retries and idempotency conventions already.'],
            ['What is a deferrable operator?', 'One that releases its worker slot while waiting, using a trigger in the triggerer process.'],
          ],
          prereqs: ['Tasks, operators and task instances'],
        },
        {
          title: 'Sensors',
          description: 'Sensors wait for a condition (a file, a partition, an external task) before downstream work runs; poke versus reschedule mode, timeouts, and why long-running poke sensors starve worker pools.',
          concepts: ['Sensor poke and reschedule modes', 'FileSensor and S3KeySensor', 'ExternalTaskSensor', 'Sensor timeouts and soft_fail'],
          quiz: [
            ['Why prefer reschedule mode?', 'The worker slot is freed between checks instead of being held while sleeping.'],
            ['What does soft_fail do?', 'Marks the sensor skipped instead of failed when it times out.'],
          ],
          prereqs: ['Common operators'],
        },
        {
          title: 'Hooks and connections',
          description: 'Hooks wrap client libraries with authentication pulled from an Airflow Connection, so operators and tasks never hard-code credentials; using PostgresHook, S3Hook and HttpHook inside tasks.',
          concepts: ['Hook responsibilities', 'PostgresHook and S3Hook usage', 'Connection ids in code', 'Writing a small custom hook'],
          quiz: [
            ['What does a hook get from a Connection?', 'Host, login, password, port, schema and extras.'],
            ['Where should credentials live?', 'In Connections backed by a secrets backend, never in DAG code.'],
          ],
          prereqs: ['Common operators'],
        },
      ],
    },
    {
      title: 'Scheduling and Data Intervals',
      description: 'The part of Airflow most people get wrong the first time.',
      topics: [
        {
          title: 'Schedules, logical dates and data intervals',
          description: 'A run for a schedule interval starts after the interval ends: the logical date is the interval start, not when the run happened; how data_interval_start and data_interval_end feed queries so each run processes exactly its slice.',
          concepts: ['Logical date versus run time', 'data_interval_start and end', 'Cron and timedelta schedules', 'Timetables and datasets'],
          quiz: [
            ['When does the run for daily interval 2024-03-01 execute?', 'After midnight on 2024-03-02, once the interval closes.'],
            ['Which variable should a query filter on?', 'data_interval_start and data_interval_end.'],
          ],
        },
        {
          title: 'Catchup and backfills',
          description: 'With catchup=True the scheduler creates a run for every missed interval since start_date; airflow dags backfill reruns a date range deliberately; designing tasks so a backfill of a year is safe and idempotent.',
          concepts: ['catchup behaviour', 'airflow dags backfill', 'Idempotent tasks for reruns', 'max_active_runs during backfill'],
          quiz: [
            ['What happens with catchup=True and a start_date a year ago?', 'Airflow schedules 365 daily runs immediately.'],
            ['How do you limit backfill parallelism?', 'Set max_active_runs on the DAG.'],
          ],
          prereqs: ['Schedules, logical dates and data intervals'],
        },
        {
          title: 'Templating with Jinja and context',
          description: 'Operator fields marked template_fields are rendered with Jinja using the run context ({{ ds }}, {{ data_interval_start }}, params); reading rendered templates in the UI and writing macros for reusable expressions.',
          concepts: ['Context variables and macros', 'template_fields on operators', 'Params for user input', 'Rendered template view'],
          quiz: [
            ['What does {{ ds }} expand to?', 'The logical date as YYYY-MM-DD.'],
            ['Why did my SQL show literal {{ ds }}?', 'The field is not in the operator\'s template_fields.'],
          ],
          prereqs: ['Schedules, logical dates and data intervals'],
        },
        {
          title: 'Data-aware scheduling with datasets',
          description: 'Tasks declare outlets and DAGs schedule on datasets so a consumer runs when a producer updates, replacing time-based guessing with event-driven chaining across DAGs.',
          concepts: ['Declaring dataset outlets', 'Scheduling a DAG on datasets', 'Dataset events in the UI', 'Combining datasets and time'],
          quiz: [
            ['How does a DAG run when an upstream DAG finishes writing a table?', 'Schedule it on the dataset that the upstream task lists as an outlet.'],
            ['Does Airflow check the data changed?', 'No, the dataset event fires when the producing task succeeds.'],
          ],
          prereqs: ['Catchup and backfills'],
        },
      ],
    },
    {
      title: 'Dependencies, Branching and Data Passing',
      description: 'Controlling which tasks run and how values move between them.',
      topics: [
        {
          title: 'Setting dependencies',
          description: 'Bitshift operators, set_upstream/set_downstream, chain() and cross_downstream for fan-in and fan-out; keeping the graph readable and avoiding cycles the parser will reject.',
          concepts: ['>> and << operators', 'chain and cross_downstream', 'Fan-out and fan-in shapes', 'Cycle detection errors'],
          quiz: [
            ['What does [a, b] >> c mean?', 'c runs after both a and b succeed.'],
            ['What does chain(a, [b, c], d) do?', 'a before b and c, both before d.'],
          ],
        },
        {
          title: 'Trigger rules',
          description: 'all_success is the default; all_done, one_failed, none_failed_min_one_success and others let cleanup, notification and join tasks run after skips or failures, which is essential for branching DAGs.',
          concepts: ['Default all_success rule', 'all_done for cleanup', 'none_failed_min_one_success after branching', 'one_failed for alerts'],
          quiz: [
            ['Which rule makes a join run after a branch skipped one side?', 'none_failed_min_one_success.'],
            ['Which rule runs a task whatever happened upstream?', 'all_done.'],
          ],
          prereqs: ['Setting dependencies'],
        },
        {
          title: 'Branching and short-circuiting',
          description: 'BranchPythonOperator and @task.branch return the task_id(s) to follow and skip the rest; ShortCircuitOperator stops a chain when there is nothing to do, and both interact with trigger rules on the join.',
          concepts: ['@task.branch return values', 'Skipped state propagation', 'ShortCircuitOperator', 'Joining branches correctly'],
          quiz: [
            ['What does a branch task return?', 'The task_id or list of task_ids to run next.'],
            ['Why did my final task get skipped after a branch?', 'Its trigger rule was all_success and one branch was skipped.'],
          ],
          prereqs: ['Trigger rules'],
        },
        {
          title: 'XCom and passing data',
          description: 'XCom stores small values in the metadata database keyed by task and run; push and pull explicitly or via TaskFlow returns, and use a custom XCom backend (S3, GCS) when values are large.',
          concepts: ['xcom_push and xcom_pull', 'Size limits and the metadata DB', 'Custom XCom backends', 'Passing references not data'],
          quiz: [
            ['Should you pass a DataFrame through XCom?', 'No, pass a path or table name and let the next task load it.'],
            ['What does a custom XCom backend change?', 'Where the value is stored; the database keeps only a reference.'],
          ],
          prereqs: ['Setting dependencies'],
        },
        {
          title: 'Dynamic task mapping',
          description: 'expand() creates one mapped task instance per input at run time (one per file, partition or customer) so parallelism follows the data; partial() fixes shared arguments and map indexes show up in the UI.',
          concepts: ['expand and partial', 'Mapping over XCom output', 'Mapped task instance limits', 'Reducing after a map'],
          quiz: [
            ['How do you run one task per file discovered at run time?', 'Have a task return the file list and expand a downstream task over it.'],
            ['What caps mapped task fan-out?', 'max_map_length in the configuration.'],
          ],
          prereqs: ['XCom and passing data'],
        },
        {
          title: 'Task groups and SubDAG replacement',
          description: 'TaskGroup nests related tasks in the UI without the scheduling problems SubDAGs caused; using @task_group to build reusable sections and parameterising them for repeated stages.',
          concepts: ['TaskGroup and @task_group', 'Why SubDAGs were deprecated', 'Reusable parameterised groups', 'Group-level dependencies'],
          quiz: [
            ['Why were SubDAGs deprecated?', 'They ran as separate DAGs with their own scheduling and pool problems.'],
            ['Does a TaskGroup affect scheduling?', 'No, it only groups tasks visually and by id prefix.'],
          ],
          prereqs: ['Dynamic task mapping'],
        },
      ],
    },
    {
      title: 'Configuration, Variables and Secrets',
      description: 'Keeping environment-specific values and credentials out of DAG code.',
      topics: [
        {
          title: 'Variables',
          description: 'Airflow Variables hold JSON or string settings readable from DAGs; reading them inside tasks rather than at parse time, and the difference between Variable.get and the {{ var.value.x }} template.',
          concepts: ['Variable.get and deserialize_json', 'Variables in templates', 'Parse-time versus run-time reads', 'Environment variables as Variables'],
          quiz: [
            ['Why avoid Variable.get at the top level of a DAG file?', 'It hits the database on every scheduler parse.'],
            ['How do you set a Variable from the environment?', 'Export AIRFLOW_VAR_<NAME>.'],
          ],
        },
        {
          title: 'Connections',
          description: 'A Connection stores host, credentials and extras under a conn_id used by hooks; defining them via UI, CLI, environment variables (AIRFLOW_CONN_*) or URI form, and testing them.',
          concepts: ['Connection fields and extras', 'AIRFLOW_CONN_ environment variables', 'Connection URI format', 'Testing a connection'],
          quiz: [
            ['What does AIRFLOW_CONN_MY_DB do?', 'Defines a connection with conn_id my_db from an environment variable.'],
            ['Where should a private key for SSH go?', 'In the connection extras or a secrets backend, not the DAG.'],
          ],
          prereqs: ['Variables'],
        },
        {
          title: 'Secrets backends',
          description: 'Pointing Airflow at AWS Secrets Manager, HashiCorp Vault or GCP Secret Manager so Connections and Variables are fetched from a managed store with rotation and audit, with the metadata DB as fallback.',
          concepts: ['Secrets backend configuration', 'Lookup order and caching', 'Path conventions per backend', 'Rotation without redeploys'],
          quiz: [
            ['In what order are connections resolved?', 'Secrets backend, then environment variables, then the metadata database.'],
            ['Why use a secrets backend at all?', 'Central rotation, audit and no plaintext credentials in the Airflow database.'],
          ],
          prereqs: ['Connections'],
        },
        {
          title: 'Pools, priority and concurrency limits',
          description: 'Pools cap how many tasks hit a shared resource at once, priority_weight orders queued tasks, and DAG and task level concurrency settings stop one pipeline from consuming every worker slot.',
          concepts: ['Pools and slots', 'priority_weight and weight_rule', 'max_active_tasks and max_active_runs', 'parallelism at the cluster level'],
          quiz: [
            ['How do you limit concurrent connections to a warehouse?', 'Assign those tasks to a pool with a small slot count.'],
            ['What does max_active_runs=1 achieve?', 'Runs of the DAG execute one at a time, in order.'],
          ],
          prereqs: ['Variables'],
        },
      ],
    },
    {
      title: 'Testing and Code Quality',
      description: 'Catching DAG bugs before the scheduler does.',
      topics: [
        {
          title: 'DAG integrity tests',
          description: 'A pytest that imports every DAG file through the DagBag, asserts no import errors, checks every DAG has owners, tags, retries and no cycles, and runs in CI on every pull request.',
          concepts: ['DagBag import test', 'Asserting DAG conventions', 'Parse time budget checks', 'Running in CI'],
          quiz: [
            ['What does DagBag.import_errors contain?', 'File paths mapped to the exception raised while importing them.'],
            ['Why check parse time in tests?', 'Slow DAG files delay every scheduler loop.'],
          ],
        },
        {
          title: 'Unit testing tasks',
          description: 'Testing the Python behind @task functions directly with mocks for hooks, running a single operator with operator.execute(context), and building a context dict with a fixed logical date.',
          concepts: ['Calling task functions directly', 'Mocking hooks and connections', 'operator.execute with a context', 'Fixed dates for determinism'],
          quiz: [
            ['How do you unit test a @task function?', 'Call the underlying function via .function or invoke it inside a test DAG.'],
            ['Why mock the hook rather than the database?', 'Fast, deterministic tests that do not need infrastructure.'],
          ],
          prereqs: ['DAG integrity tests'],
        },
        {
          title: 'Local runs and dag.test()',
          description: 'dag.test() executes a whole DAG in-process for a logical date without a scheduler or workers; combining it with a local Postgres in Docker for integration tests that hit real SQL.',
          concepts: ['dag.test() end-to-end runs', 'airflow tasks test for one task', 'Integration tests with Docker services', 'Test data fixtures'],
          quiz: [
            ['What does dag.test() need?', 'Only a metadata database; it runs tasks sequentially in the current process.'],
            ['When is an integration test worth it?', 'When the task logic is SQL or file handling that mocks cannot verify.'],
          ],
          prereqs: ['Unit testing tasks'],
        },
        {
          title: 'Project structure and reusable code',
          description: 'A repository layout with dags/, plugins or a shared package for helpers, requirements pinned per environment, linting with ruff, and the import rules that keep helper code out of top-level parsing cost.',
          concepts: ['Repository layout for DAGs', 'Shared package for helpers', 'Pinning provider versions', 'Lint and format in CI'],
          quiz: [
            ['Where should shared functions live?', 'In an installed package or plugins folder, imported inside tasks where possible.'],
            ['Why pin provider package versions?', 'Provider upgrades change operator behaviour and can break DAGs silently.'],
          ],
          prereqs: ['DAG integrity tests'],
        },
      ],
    },
    {
      title: 'Deployment',
      description: 'Getting from a laptop to a production scheduler that stays up.',
      topics: [
        {
          title: 'Deploying with Docker Compose',
          description: 'A production-ish Compose deployment: a custom image with pinned requirements, CeleryExecutor with Redis, Postgres with backups, DAGs shipped in the image or synced from git, and health checks on each service.',
          concepts: ['Custom Airflow image', 'CeleryExecutor with Redis', 'DAG delivery: bake or sync', 'Health checks and restarts'],
          quiz: [
            ['Why build a custom image?', 'To pin providers and Python dependencies your DAGs need.'],
            ['How are DAGs updated without restarting?', 'Sync the dags folder (git-sync or volume); the scheduler picks up changes.'],
          ],
        },
        {
          title: 'Kubernetes executor and the Helm chart',
          description: 'The KubernetesExecutor launches a pod per task with its own image and resources; the official Helm chart deploys scheduler, webserver, triggerer and git-sync, and pod templates set requests, limits and secrets.',
          concepts: ['Pod per task model', 'Official Helm chart values', 'Pod template overrides', 'git-sync sidecar'],
          quiz: [
            ['What is the advantage of KubernetesExecutor?', 'Per-task isolation, custom images and resources, and no idle workers.'],
            ['What is a downside?', 'Pod start-up latency per task and cluster complexity.'],
          ],
          prereqs: ['Deploying with Docker Compose'],
        },
        {
          title: 'KubernetesPodOperator',
          description: 'Running any container as a task regardless of executor, with image, command, env from secrets, resources and log retrieval; the pattern that keeps Airflow workers free of heavy dependencies.',
          concepts: ['Image, command and arguments', 'Secrets and env injection', 'Resource requests and limits', 'Log streaming and pod cleanup'],
          quiz: [
            ['Why use KubernetesPodOperator instead of PythonOperator?', 'The task runs in its own image with its own dependencies and resources.'],
            ['What does is_delete_operator_pod control?', 'Whether the pod is removed after finishing.'],
          ],
          prereqs: ['Kubernetes executor and the Helm chart'],
        },
        {
          title: 'Managed Airflow services',
          description: 'MWAA, Cloud Composer and Astronomer run the control plane for you; what they manage, what you still own (DAG code, dependencies, IAM), and how to pick between managed and self-hosted.',
          concepts: ['MWAA, Cloud Composer, Astronomer', 'Dependency management on managed services', 'IAM and networking responsibilities', 'Cost and control trade-offs'],
          quiz: [
            ['How do you add a Python package on MWAA?', 'Via a requirements.txt in the environment\'s S3 bucket.'],
            ['What stays your responsibility on a managed service?', 'DAG code, dependencies, connections and access control.'],
          ],
          prereqs: ['Deploying with Docker Compose'],
        },
        {
          title: 'Upgrades and the metadata database',
          description: 'Airflow upgrades run schema migrations; checking provider compatibility, running airflow db migrate on a copy first, cleaning old task instance rows with airflow db clean, and backing up before every upgrade.',
          concepts: ['airflow db migrate', 'Provider compatibility matrix', 'airflow db clean for old rows', 'Backup and rollback plan'],
          quiz: [
            ['What grows unbounded in the metadata database?', 'Task instance, log and XCom rows unless cleaned.'],
            ['What should happen before an upgrade?', 'A database backup and a migration test on a copy.'],
          ],
          prereqs: ['Managed Airflow services'],
        },
      ],
    },
    {
      title: 'Observability and Alerting',
      description: 'Knowing a pipeline broke before the consumers do.',
      topics: [
        {
          title: 'Task logs and remote logging',
          description: 'Where task logs are written, configuring remote logging to S3 or GCS so logs survive worker restarts, and structuring log output so failures are searchable.',
          concepts: ['Log file layout per task instance', 'Remote logging configuration', 'Log levels and structure', 'Finding logs for mapped tasks'],
          quiz: [
            ['Why enable remote logging?', 'Worker pods and containers are ephemeral; logs would vanish otherwise.'],
            ['Where is the remote log path configured?', 'remote_base_log_folder and remote_log_conn_id in the logging section.'],
          ],
        },
        {
          title: 'Callbacks and notifications',
          description: 'on_failure_callback, on_success_callback and on_retry_callback plus SLA misses hook into Slack, email or PagerDuty; writing a callback once in default_args and using notifier classes from providers.',
          concepts: ['on_failure_callback and friends', 'Slack and email notifiers', 'SLA miss callbacks', 'Callbacks in default_args'],
          quiz: [
            ['Where does a failure callback run?', 'On the worker, right after the task fails.'],
            ['What triggers an SLA miss?', 'A task not finishing within sla after the DAG run\'s expected start.'],
          ],
          prereqs: ['Task logs and remote logging'],
        },
        {
          title: 'Metrics with StatsD and OpenTelemetry',
          description: 'Airflow emits scheduler heartbeat, DAG run duration, task failures and pool usage as StatsD or OTel metrics; shipping them to Prometheus and graphing scheduler health and run durations.',
          concepts: ['Key scheduler metrics', 'StatsD exporter setup', 'OpenTelemetry configuration', 'Dashboards for run duration'],
          quiz: [
            ['Which metric shows the scheduler is alive?', 'scheduler_heartbeat.'],
            ['What does a rising dagrun.duration signal?', 'Runs are taking longer, often from resource contention or slow upstream systems.'],
          ],
          prereqs: ['Task logs and remote logging'],
        },
        {
          title: 'Cluster policies and lineage',
          description: 'Cluster policies enforce rules on every DAG and task at parse time (owners, retries, pool assignment); OpenLineage integration emits run and dataset lineage events to a catalogue like Marquez.',
          concepts: ['dag_policy and task_policy', 'Enforcing conventions centrally', 'OpenLineage provider', 'Lineage in a catalogue'],
          quiz: [
            ['What can a task_policy do?', 'Mutate or reject any task at parse time, for example forcing a retry count.'],
            ['What does OpenLineage capture?', 'Which runs read and wrote which datasets.'],
          ],
          prereqs: ['Callbacks and notifications'],
        },
      ],
    },
    {
      title: 'Best Practices and Anti-patterns',
      description: 'The habits that keep Airflow reliable at scale.',
      topics: [
        {
          title: 'Idempotent and atomic tasks',
          description: 'A task must produce the same result when rerun for the same interval: delete-then-insert or upsert by interval, write to temp then rename, and never append blindly, so retries and backfills stay safe.',
          concepts: ['Rerun safety per interval', 'Delete-insert and upsert patterns', 'Atomic writes via staging', 'Avoiding blind appends'],
          quiz: [
            ['Why must a task be idempotent?', 'Retries and backfills rerun it; duplicates or partial writes would corrupt data.'],
            ['How do you make a file write atomic?', 'Write to a temp path then rename or move.'],
          ],
        },
        {
          title: 'Keeping heavy work out of Airflow',
          description: 'Workers are for coordination, not crunching: push transforms to the warehouse, Spark or a container, keep task code thin, and avoid loading big DataFrames on workers that were sized for orchestration.',
          concepts: ['Orchestrate versus compute', 'Pushing SQL to the warehouse', 'Offloading to containers and Spark', 'Worker sizing consequences'],
          quiz: [
            ['What goes wrong when tasks load large DataFrames?', 'Workers run out of memory and every other task on them fails.'],
            ['Where should a heavy transform run?', 'In the system that holds the data, such as the warehouse or Spark.'],
          ],
          prereqs: ['Idempotent and atomic tasks'],
        },
        {
          title: 'Common anti-patterns',
          description: 'Top-level API calls, giant monolithic DAGs, XCom used as a data bus, catchup left on by accident, dynamic DAG generation from a database at parse time, and sensors in poke mode everywhere.',
          concepts: ['Parse-time side effects', 'Monolithic DAG smells', 'Accidental catchup floods', 'Sensor pool starvation'],
          quiz: [
            ['What is wrong with generating DAGs from a database query at parse time?', 'Every parse hits the database and a failure hides all generated DAGs.'],
            ['How do you avoid a catchup flood on a new DAG?', 'Set catchup=False or a recent start_date.'],
          ],
          prereqs: ['Keeping heavy work out of Airflow'],
        },
        {
          title: 'Dynamic DAG generation done safely',
          description: 'Generating similar DAGs from a YAML or JSON config file in the repository via a factory function, keeping dag_ids stable, and validating the config in CI instead of trusting it at parse time.',
          concepts: ['DAG factory functions', 'Config files in the repo', 'Stable dag_id generation', 'Validating config in CI'],
          quiz: [
            ['Why generate from a file rather than a database?', 'Parsing stays fast and versioned; no runtime dependency.'],
            ['What must every generated DAG have?', 'A unique, stable dag_id assigned in the module globals.'],
          ],
          prereqs: ['Common anti-patterns'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: daily API ingestion with backfills',
          description: 'A DAG that pulls a paginated public API for its data interval, lands raw JSON in object storage, loads it into Postgres with an upsert, and supports a clean backfill of the last 90 days without duplicates.',
          concepts: ['Design the interval-driven extract', 'Land raw data idempotently', 'Upsert into Postgres', 'Run and verify a backfill'],
          quiz: [
            ['How does the task know which day to fetch?', 'From data_interval_start and data_interval_end in the context.'],
            ['How do you verify the backfill produced no duplicates?', 'Count rows per interval and compare against the source.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: file-triggered processing with dynamic mapping',
          description: 'A sensor waits for files in a bucket prefix, a task lists them, a mapped task validates and converts each to Parquet, and a join task publishes a dataset that triggers a downstream reporting DAG.',
          concepts: ['Sensor in reschedule mode', 'List and expand over files', 'Validate and convert per file', 'Publish a dataset outlet'],
          quiz: [
            ['Why map over files instead of looping in one task?', 'Parallelism, per-file retries and per-file logs.'],
            ['How does the reporting DAG start?', 'It is scheduled on the dataset the join task updates.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: warehouse ELT with dbt and Slack alerts',
          description: 'A DAG that loads staged data, runs dbt models via a container task, runs dbt tests, and posts a Slack summary; a failure callback pages with the failing task and a link to logs.',
          concepts: ['Load stage with a provider operator', 'Run dbt in a container task', 'Gate on dbt test results', 'Slack alerts with log links'],
          quiz: [
            ['Why run dbt in a container?', 'Its dependencies stay separate from the Airflow workers.'],
            ['What should a Slack alert include?', 'DAG id, task id, logical date and a link to the log.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Airflow on Kubernetes with CI',
          description: 'Deploy Airflow with the Helm chart using KubernetesExecutor and git-sync, add a GitHub Actions pipeline that runs DAG integrity tests and builds the image, and wire metrics into Prometheus with an alert on scheduler heartbeat.',
          concepts: ['Helm values for the executor', 'git-sync from the DAG repo', 'CI with integrity tests', 'Prometheus alert on heartbeat'],
          quiz: [
            ['What does git-sync give you?', 'DAGs deploy on merge without rebuilding the image.'],
            ['What alert catches a dead scheduler?', 'No scheduler_heartbeat increments for several minutes.'],
          ],
          style: 'project',
        },
        {
          title: 'Airflow interview questions',
          description: 'The staples: scheduler versus executor, why logical dates lag, idempotency, XCom limits, sensors and pools, how you would backfill safely, and what breaks first as a deployment grows.',
          concepts: ['Architecture questions', 'Scheduling semantics questions', 'Reliability and scaling questions', 'Explaining past pipeline decisions'],
          quiz: [
            ['Explain the logical date to a colleague.', 'It is the start of the data interval the run processes, not the wall-clock time it ran.'],
            ['How do you stop one DAG from starving others?', 'Pools, max_active_tasks and priority weights.'],
          ],
          style: 'reading',
        },
        {
          title: 'Designing a DAG in an interview',
          description: 'Take a spoken requirement (daily partner files, an hourly API, a monthly report) and sketch the DAG: schedule, tasks, dependencies, retries, idempotency and alerting, then defend the choices.',
          concepts: ['Turning requirements into tasks', 'Choosing schedule and catchup', 'Failure handling in the design', 'Explaining the trade-offs'],
          quiz: [
            ['What do you ask first when handed a pipeline requirement?', 'Freshness needs, data volume, source reliability and who consumes the output.'],
            ['How do you handle a partner file that arrives late?', 'A reschedule-mode sensor with a timeout and an alert on miss.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
