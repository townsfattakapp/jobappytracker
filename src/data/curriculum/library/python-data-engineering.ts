import { defineTrack } from '../define'

export const pythonDataEngineering = defineTrack({
  id: 'track-python-data-engineering',
  title: 'Python for Data Engineering',
  description: 'The Python that pipeline jobs are made of: Parquet and Arrow, object storage, bulk database loads, pandas and polars for transforms, streaming large data with generators, retries and idempotency, configuration and secrets, structured logging, packaging, CLIs and testing data code.',
  family: 'Data Engineering',
  kind: 'language',
  icon: '🐍',
  tags: ['python', 'data engineering', 'pyarrow', 'parquet', 'polars', 'pandas', 's3', 'pytest', 'pydantic'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python'],
  style: 'code',
  categories: [
    {
      title: 'File Formats and Arrow',
      description: 'The formats data arrives in and leaves in, and the in-memory model that connects them.',
      topics: [
        {
          title: 'CSV at scale',
          description: 'Reading multi-gigabyte CSVs without loading them whole: chunked pandas reads, explicit dtypes and encodings, dialect and quoting problems, and pyarrow.csv as a faster multi-threaded parser when the file is well formed.',
          concepts: ['Chunked reads with chunksize', 'Explicit dtypes and parse_dates', 'Encodings, BOMs and bad lines', 'Dialects, quoting and escaping', 'pyarrow.csv for speed'],
          quiz: [
            ['Why declare dtypes when reading a big CSV?', 'Inference reads the whole file and can guess wrong, for example zip codes as integers.'],
            ['What does on_bad_lines="warn" do in pandas?', 'Logs malformed rows and skips them instead of raising.'],
          ],
        },
        {
          title: 'JSON and JSON Lines',
          description: 'Newline-delimited JSON as the streaming-friendly alternative to a single array, parsing records one line at a time, flattening nested objects with json_normalize, and orjson for speed when volume matters.',
          concepts: ['JSON Lines versus JSON arrays', 'Line-by-line parsing', 'Flattening nested records', 'orjson and ujson for throughput'],
          quiz: [
            ['Why is JSON Lines easier to process than one big array?', 'Each line is a complete record, so files can be streamed, split and appended.'],
            ['What does pandas.json_normalize do with a nested dict?', 'Flattens nested keys into dotted column names.'],
          ],
        },
        {
          title: 'Parquet with pyarrow',
          description: 'Columnar storage with row groups, per-column statistics, dictionary encoding and compression: how these let readers skip data, why partition-aligned writes matter, and how to read only the columns and row groups a job needs.',
          concepts: ['Row groups and column chunks', 'Column projection and predicate pushdown', 'Compression codecs and dictionary encoding', 'Writing with pyarrow.parquet', 'Row group sizing'],
          quiz: [
            ['How does Parquet skip data without an index?', 'Row group statistics (min, max, null count) let readers skip groups that cannot match a filter.'],
            ['What does columns=["a", "b"] change when reading?', 'Only those column chunks are read from disk.'],
          ],
        },
        {
          title: 'Avro and schema evolution',
          description: 'Avro as a row-oriented format with an embedded schema, why Kafka and ingestion pipelines favour it, reading and writing with fastavro, and the schema resolution rules that let readers and writers evolve independently.',
          concepts: ['Row versus column formats', 'Embedded schemas and fastavro', 'Reader and writer schema resolution', 'Defaults and optional fields'],
          quiz: [
            ['When is Avro a better fit than Parquet?', 'For record-at-a-time writes and streaming, where whole rows are appended.'],
            ['What makes adding a field backward compatible in Avro?', 'Giving the new field a default value.'],
          ],
        },
        {
          title: 'Arrow tables and datasets',
          description: 'The Arrow in-memory format shared by pandas, polars, DuckDB and Spark: zero-copy conversions, pyarrow.compute for vectorised operations, and pyarrow.dataset for scanning partitioned directories with filters.',
          concepts: ['Arrow memory layout and zero-copy', 'pyarrow.Table and RecordBatch', 'pyarrow.compute kernels', 'pyarrow.dataset over partitioned paths', 'Converting to and from pandas'],
          quiz: [
            ['Why can polars and pandas exchange data cheaply?', 'Both can use Arrow buffers, avoiding serialisation.'],
            ['What does pyarrow.dataset add over parquet.read_table?', 'Discovery of partitioned directories, filter pushdown and lazy batch scanning.'],
          ],
          prereqs: ['Parquet with pyarrow'],
        },
        {
          title: 'Compression and file sizing',
          description: 'Choosing snappy, zstd or gzip by CPU cost and ratio, why gzip CSV cannot be split across workers, and the target file sizes (roughly 128 MB to 1 GB) that keep query engines from choking on thousands of tiny files.',
          concepts: ['Codec trade-offs', 'Splittable versus non-splittable files', 'The small files problem', 'Compaction jobs'],
          quiz: [
            ['Why is one 10 GB gzip CSV bad for parallel processing?', 'gzip streams cannot be split, so one worker must read the whole file.'],
            ['What size range is a common target for Parquet files in a lake?', 'Roughly 128 MB to 1 GB per file.'],
          ],
          prereqs: ['Parquet with pyarrow'],
        },
      ],
    },
    {
      title: 'Object Storage',
      description: 'S3-compatible buckets as the landing zone and lake.',
      topics: [
        {
          title: 'S3 with boto3',
          description: 'Clients versus resources, paginated listing, multipart uploads for big objects, presigned URLs, and the credential chain that makes the same code work locally, in CI and on a cloud runner without hard-coding keys.',
          concepts: ['Client configuration and endpoints', 'Paginated listing', 'Multipart upload and download', 'Credential resolution chain', 'Presigned URLs'],
          quiz: [
            ['Why must list_objects_v2 be paginated?', 'It returns at most 1000 keys per call.'],
            ['Where does boto3 look for credentials first?', 'Explicit parameters, then environment variables, then shared config, then instance metadata.'],
          ],
        },
        {
          title: 'fsspec, s3fs and MinIO',
          description: 'A filesystem abstraction that lets pandas, pyarrow and polars read s3:// paths directly, with MinIO as a local S3-compatible server for development and tests.',
          concepts: ['fsspec URLs and storage options', 's3fs with pandas and pyarrow', 'Running MinIO locally', 'Swapping local and remote paths by config'],
          quiz: [
            ['How do you pass an endpoint URL to s3fs through pandas?', 'storage_options={"client_kwargs": {"endpoint_url": ...}}.'],
            ['Why use MinIO in tests?', 'It behaves like S3 without cloud credentials or cost.'],
          ],
          prereqs: ['S3 with boto3'],
        },
        {
          title: 'Partitioned layouts and Hive paths',
          description: 'Organising a bucket as dataset/year=2025/month=03/part-0001.parquet so engines can prune by partition, choosing partition columns by cardinality and query patterns, and avoiding over-partitioning.',
          concepts: ['Hive-style key=value directories', 'Choosing partition columns', 'Over-partitioning and cardinality', 'Reading partition values as columns'],
          quiz: [
            ['Why is partitioning by user_id usually wrong?', 'High cardinality creates millions of tiny partitions and files.'],
            ['What does a reader infer from year=2025/month=03 in the path?', 'Columns year and month with those values, without reading file contents.'],
          ],
          prereqs: ['Compression and file sizing'],
        },
        {
          title: 'Consistency and atomic publishing in object stores',
          description: 'Object stores have no rename or append; a write is visible only when the whole PUT completes. Publishing a set of files atomically therefore needs a manifest, a _SUCCESS marker or a table format that commits metadata.',
          concepts: ['No rename, no append semantics', 'Read-after-write consistency', 'Manifest and success markers', 'Cleaning up partial writes'],
          quiz: [
            ['How do readers know a multi-file dataset is complete?', 'A marker or manifest written last, after all data files succeed.'],
            ['Why can a crashed job leave orphan files?', 'Each file upload is independent; there is no transaction across objects.'],
          ],
          prereqs: ['Partitioned layouts and Hive paths'],
        },
      ],
    },
    {
      title: 'Database Connectivity',
      description: 'Getting data in and out of relational databases fast and safely.',
      topics: [
        {
          title: 'DB-API drivers and connections',
          description: 'psycopg (PostgreSQL) and other DB-API 2 drivers: connection lifecycle, autocommit versus explicit transactions, parameterised queries to avoid injection, and connection pooling for jobs that open many short connections.',
          concepts: ['Connection and cursor lifecycle', 'Parameter binding', 'Autocommit and transactions', 'Connection pools'],
          quiz: [
            ['Why use cursor.execute(sql, params) instead of f-strings?', 'The driver escapes parameters, preventing SQL injection and quoting bugs.'],
            ['What happens to an open transaction when a connection is closed without commit?', 'It is rolled back.'],
          ],
        },
        {
          title: 'Bulk loading',
          description: 'executemany is slow because it round-trips per row; COPY through psycopg copy(), batched multi-row INSERTs, and warehouse-native loaders move millions of rows in seconds, especially when constraints are checked once at the end.',
          concepts: ['Why executemany is slow', 'COPY via psycopg copy()', 'Batched multi-row inserts', 'Load into staging, then swap', 'Disabling and rebuilding indexes for loads'],
          quiz: [
            ['What is the fastest way to load a large CSV into PostgreSQL from Python?', 'Stream it through COPY using psycopg cursor.copy().'],
            ['Why load into a staging table first?', 'It isolates failures and lets the final switch be one transaction.'],
          ],
          prereqs: ['DB-API drivers and connections'],
        },
        {
          title: 'SQLAlchemy Core for pipelines',
          description: 'Table metadata, the insert/select expression language and dialect-specific upserts (on_conflict_do_update) give portable, composable SQL without the ORM overhead that pipelines do not need.',
          concepts: ['Engine and metadata reflection', 'Expression language queries', 'Dialect-specific upserts', 'Core versus ORM for jobs'],
          quiz: [
            ['Why prefer SQLAlchemy Core over the ORM in a loader?', 'Set-based statements without per-object identity tracking are faster and simpler.'],
            ['How do you reflect an existing table?', 'Table("name", metadata, autoload_with=engine).'],
          ],
          prereqs: ['DB-API drivers and connections'],
        },
        {
          title: 'Streaming query results',
          description: 'Client-side cursors pull whole result sets into memory; server-side (named) cursors and fetchmany stream rows in batches so an extract of 50 million rows runs in constant memory.',
          concepts: ['Client versus server-side cursors', 'fetchmany and batch sizes', 'Streaming into Parquet writers', 'Keeping transactions open while streaming'],
          quiz: [
            ['Why can SELECT * FROM big_table exhaust memory in Python?', 'The default cursor fetches every row into the client before returning.'],
            ['What does a server-side cursor require in psycopg?', 'A name for the cursor and an open transaction for its lifetime.'],
          ],
          prereqs: ['Bulk loading'],
        },
      ],
    },
    {
      title: 'DataFrames for Pipelines',
      description: 'pandas and polars as transformation engines, and knowing when each fits.',
      topics: [
        {
          title: 'pandas dtypes and memory',
          description: 'Object columns cost ten times more than categoricals, float64 hides NULL-caused integer promotion, and nullable dtypes fix it; memory_usage(deep=True) shows where the bytes go so a job fits its container.',
          concepts: ['Object versus categorical columns', 'Nullable Int64 and string dtypes', 'Downcasting numerics', 'memory_usage and profiling frames', 'Arrow-backed pandas dtypes'],
          quiz: [
            ['Why does an integer column become float after a merge?', 'Missing values introduce NaN, which the default int dtype cannot hold.'],
            ['What does astype("category") save?', 'Memory, by storing codes plus a small dictionary of unique values.'],
          ],
        },
        {
          title: 'pandas transformations for ETL',
          description: 'Vectorised cleaning with str and dt accessors, merges with validate= and indicator= to catch fan-out, groupby aggregations, and method chaining with pipe and assign for readable, testable steps.',
          concepts: ['String and datetime accessors', 'merge with validate and indicator', 'groupby and named aggregation', 'Method chaining with pipe and assign', 'Avoiding row-wise apply'],
          quiz: [
            ['What does merge(validate="one_to_one") do?', 'Raises if either side has duplicate keys, catching accidental fan-out.'],
            ['Why avoid df.apply(func, axis=1)?', 'It runs Python per row and is far slower than vectorised operations.'],
          ],
          prereqs: ['pandas dtypes and memory'],
        },
        {
          title: 'polars lazy API',
          description: 'scan_parquet and LazyFrame build a query plan that polars optimises (projection and predicate pushdown, common subexpression reuse) before executing on all cores, with streaming mode for data larger than memory.',
          concepts: ['scan_* versus read_*', 'Query optimisation and explain', 'collect and streaming execution', 'Sink to Parquet without materialising'],
          quiz: [
            ['What does pl.scan_parquet return?', 'A LazyFrame with no data read yet.'],
            ['How do you see the optimised plan?', 'lf.explain().'],
          ],
        },
        {
          title: 'polars expressions and windows',
          description: 'Expressions are composable, parallel column operations: select and with_columns, when/then/otherwise, group_by aggregations and over() for window calculations, all without Python loops.',
          concepts: ['pl.col expressions', 'when, then and otherwise', 'group_by and agg', 'Window expressions with over', 'Struct and list columns'],
          quiz: [
            ['How do you compute a per-group running sum in polars?', 'pl.col("x").cum_sum().over("group").'],
            ['What is the difference between select and with_columns?', 'select returns only the listed expressions; with_columns adds or replaces them.'],
          ],
          prereqs: ['polars lazy API'],
        },
        {
          title: 'Choosing pandas, polars or DuckDB',
          description: 'pandas for breadth of libraries and small data, polars for multi-core speed and lazy plans, DuckDB for SQL over Parquet in-process; all three interoperate through Arrow, and none replaces Spark once data exceeds one machine.',
          concepts: ['Single-node limits', 'Ecosystem versus speed trade-offs', 'DuckDB for SQL on files', 'Interoperating through Arrow'],
          quiz: [
            ['When does DuckDB shine in a Python job?', 'Running analytical SQL directly over Parquet or CSV files without a server.'],
            ['What signals that a job has outgrown a single node?', 'Data that does not fit in memory even with streaming, or runtimes measured in hours.'],
          ],
          prereqs: ['polars expressions and windows', 'pandas transformations for ETL'],
        },
      ],
    },
    {
      title: 'Streaming and Memory',
      description: 'Processing more data than fits in RAM.',
      topics: [
        {
          title: 'Generator pipelines for large data',
          description: 'Chaining generator functions so each record flows through parse, clean and enrich stages one at a time, keeping memory flat regardless of file size, with itertools for grouping and windowing.',
          concepts: ['Composable generator stages', 'Pulling versus pushing records', 'itertools for windows and grouping', 'Early termination and cleanup'],
          quiz: [
            ['What is the memory profile of a chain of generators over a 100 GB file?', 'Roughly constant, since only the records in flight are held.'],
            ['Why put the file open in a context manager inside the generator?', 'So the file closes when the generator is exhausted or closed.'],
          ],
        },
        {
          title: 'Chunking and batching',
          description: 'Grouping records into batches of a few thousand for bulk writes, flushing on size or time, and choosing batch sizes that balance memory, round trips and the cost of retrying a failed batch.',
          concepts: ['Batching an iterator', 'Size and time based flushes', 'Batch size trade-offs', 'Retrying a failed batch safely'],
          quiz: [
            ['What does itertools.batched(it, 1000) yield?', 'Tuples of up to 1000 items each.'],
            ['Why not use one giant batch?', 'A failure loses all progress and memory spikes.'],
          ],
          prereqs: ['Generator pipelines for large data'],
        },
        {
          title: 'Memory profiling and leaks',
          description: 'tracemalloc and memray reveal which lines allocate, why DataFrame copies double memory, and how reference cycles and module-level caches keep data alive across a long-running job.',
          concepts: ['tracemalloc snapshots', 'memray flame graphs', 'Hidden DataFrame copies', 'Caches and reference cycles'],
          quiz: [
            ['Does df2 = df[cols] copy the data?', 'Usually yes for column selection, which doubles memory temporarily.'],
            ['What does tracemalloc.compare_to reveal?', 'Which allocations grew between two snapshots.'],
          ],
        },
        {
          title: 'Concurrency for I/O-bound jobs',
          description: 'ThreadPoolExecutor for parallel downloads and API calls, asyncio when thousands of requests are in flight, and multiprocessing only for CPU-heavy parsing, with bounded concurrency to respect rate limits.',
          concepts: ['Threads for blocking I/O', 'asyncio with httpx for many requests', 'Processes for CPU-bound parsing', 'Semaphores and rate limiting'],
          quiz: [
            ['Why do threads speed up S3 downloads despite the GIL?', 'The GIL is released during blocking I/O.'],
            ['How do you cap concurrent requests in asyncio?', 'Acquire an asyncio.Semaphore around each request.'],
          ],
        },
      ],
    },
    {
      title: 'Reliability',
      description: 'Jobs that survive flaky networks, reruns and partial failures.',
      topics: [
        {
          title: 'Retries with backoff and jitter',
          description: 'Retrying only transient errors, exponential backoff with jitter to avoid thundering herds, capped attempts, and the tenacity library for declaring all of it as a decorator.',
          concepts: ['Transient versus permanent errors', 'Exponential backoff and jitter', 'Retry budgets and caps', 'tenacity decorators'],
          quiz: [
            ['Why add jitter to backoff?', 'So many clients retrying after an outage do not hit the server at the same instant.'],
            ['Should a 400 Bad Request be retried?', 'No, it will fail again; retry 429, 5xx and connection errors.'],
          ],
        },
        {
          title: 'Idempotent writes and checkpoints',
          description: 'Designing every step so running it twice produces the same result: deterministic output paths, overwrite-by-partition, upserts on business keys, and checkpoint files or watermark tables that record what has been processed.',
          concepts: ['Deterministic output naming', 'Overwrite by partition', 'Upsert on business keys', 'Watermark and checkpoint state'],
          quiz: [
            ['What makes an append-only load non-idempotent?', 'Rerunning it inserts the same rows again.'],
            ['Where should a watermark be stored?', 'In durable state such as a metadata table, updated only after the load commits.'],
          ],
          prereqs: ['Retries with backoff and jitter'],
        },
        {
          title: 'Timeouts and resource limits',
          description: 'Every network call needs a timeout or a stuck job hangs forever; statement timeouts on the database, per-request timeouts on HTTP, and process-level limits on memory keep a bad run from blocking the schedule.',
          concepts: ['HTTP and database timeouts', 'Statement timeouts in SQL sessions', 'Overall job deadlines', 'Memory limits and OOM behaviour'],
          quiz: [
            ['What is the default timeout of a requests.get call?', 'None, it waits forever; always pass timeout=.'],
            ['How do you cap query time from Python for PostgreSQL?', 'SET statement_timeout on the session or connection options.'],
          ],
        },
        {
          title: 'Partial failure and cleanup',
          description: 'Writing to temporary locations and promoting on success, using context managers and try/finally to release connections and delete temp files, and recording failed records so the run can finish and report rather than abort.',
          concepts: ['Write-then-promote patterns', 'Cleanup with context managers', 'Collecting failures without aborting', 'Exit codes that reflect partial success'],
          quiz: [
            ['Why write to a temp prefix then copy to the final path?', 'Readers never see half-written output.'],
            ['What exit code should a run with quarantined records return?', 'A distinct non-zero code so the scheduler can flag it as degraded.'],
          ],
          prereqs: ['Idempotent writes and checkpoints'],
        },
      ],
    },
    {
      title: 'Configuration, Secrets and Logging',
      description: 'Running the same code in dev, CI and production without editing it.',
      topics: [
        {
          title: 'Configuration layering',
          description: 'Defaults in code, overrides from a TOML or YAML file, then environment variables, then CLI flags, validated once at startup with pydantic-settings so a typo fails fast instead of at hour three of a run.',
          concepts: ['Precedence of config sources', 'pydantic-settings models', 'Per-environment files', 'Failing fast on invalid config'],
          quiz: [
            ['Which source usually has the highest precedence?', 'Command-line flags, above environment variables and files.'],
            ['What does BaseSettings read automatically?', 'Environment variables (and .env files) matching its field names.'],
          ],
        },
        {
          title: 'Secrets handling',
          description: 'Secrets come from environment variables or a secret manager at runtime, never from the repository; masking them in logs, rotating credentials and using short-lived cloud roles reduce the blast radius when one leaks.',
          concepts: ['Environment variables and .env exclusion', 'Secret managers and runtime fetch', 'Masking secrets in logs and errors', 'Short-lived credentials and roles'],
          quiz: [
            ['Why should .env be in .gitignore?', 'It usually holds real credentials that must not enter version control.'],
            ['What is safer than a long-lived access key on a cloud runner?', 'An attached IAM role or workload identity that issues short-lived tokens.'],
          ],
          prereqs: ['Configuration layering'],
        },
        {
          title: 'Structured logging for jobs',
          description: 'JSON log lines with a run id, step name and counts, produced by logging with a JSON formatter or structlog, so log aggregators can search and correlate a failed run instead of grepping free text.',
          concepts: ['JSON formatters and structlog', 'Run ids and correlation fields', 'Log levels for batch jobs', 'Logging counts, not rows'],
          quiz: [
            ['Why include a run id in every log line?', 'To filter one execution out of interleaved logs from many runs.'],
            ['Why not log every record?', 'Volume and cost; log per-batch summaries and sample failures.'],
          ],
        },
        {
          title: 'Job metrics and run summaries',
          description: 'Emitting rows read, rows written, rejected rows, duration and freshness per run to a metrics table or Prometheus so dashboards and alerts detect silent failures such as zero rows loaded.',
          concepts: ['Which metrics a job must emit', 'Run summary tables', 'prometheus_client and pushgateway', 'Detecting silent failures'],
          quiz: [
            ['Which metric catches a job that succeeded but loaded nothing?', 'Rows written per run, alerted when zero or far below normal.'],
            ['Why does a batch job need a push gateway rather than a scrape endpoint?', 'It exits before a scraper would poll it.'],
          ],
          prereqs: ['Structured logging for jobs'],
        },
      ],
    },
    {
      title: 'Packaging and Command-Line Jobs',
      description: 'Turning scripts into installable, runnable, versioned tools.',
      topics: [
        {
          title: 'Packaging pipeline code',
          description: 'A src layout with a pyproject.toml, console script entry points, semantic versions and a private index or Git tags so every job runs a known version instead of whatever file was on the runner.',
          concepts: ['src layout for jobs', 'Console script entry points', 'Versioning and tagging releases', 'Shared libraries across pipelines'],
          quiz: [
            ['What does a console script entry point give you?', 'A command on PATH that calls a function in your package.'],
            ['Why version pipeline code?', 'To know exactly which logic produced a given output and to roll back.'],
          ],
        },
        {
          title: 'Dependency locking and images',
          description: 'Lock files from uv or pip-tools pin every transitive dependency; building a container image from the lock makes local runs, CI and production identical (see track-docker for image details).',
          concepts: ['Lock files with uv or pip-tools', 'Separating runtime and dev dependencies', 'Building a job image from the lock', 'Upgrading dependencies deliberately'],
          quiz: [
            ['What does a lock file contain that requirements.txt often does not?', 'Exact versions and hashes of every transitive dependency.'],
            ['Why install from the lock in the image build?', 'So production matches what tests ran against.'],
          ],
          prereqs: ['Packaging pipeline code'],
        },
        {
          title: 'CLI tools for jobs',
          description: 'typer or click commands that take a run date, a partition and flags like --dry-run and --limit, print usage, validate arguments, and exit with meaningful codes so orchestrators can invoke them uniformly.',
          concepts: ['typer and click commands', 'Run date and partition arguments', 'Dry-run and limit flags', 'Exit codes and error output'],
          quiz: [
            ['Why accept the run date as an argument instead of using today()?', 'Backfills and reruns must process a specific past date.'],
            ['What should --dry-run do?', 'Execute reads and validation but skip writes.'],
          ],
          prereqs: ['Packaging pipeline code'],
        },
        {
          title: 'Job entry points and orchestrator contracts',
          description: 'What a scheduler expects from a job: a single command, parameters by flags or environment, logs to stdout, status by exit code, and no interactive prompts, so the same package runs under cron, Airflow or Kubernetes.',
          concepts: ['One command per task', 'Stdout logs and stderr errors', 'Non-interactive execution', 'Signals and graceful shutdown'],
          quiz: [
            ['How does an orchestrator know a task failed?', 'By a non-zero exit code.'],
            ['What should a job do on SIGTERM?', 'Stop taking new work, finish or roll back the current batch, then exit.'],
          ],
          prereqs: ['CLI tools for jobs'],
        },
      ],
    },
    {
      title: 'Testing and Validation',
      description: 'Confidence that data code does what it claims.',
      topics: [
        {
          title: 'pytest for data code',
          description: 'Unit tests for transformation functions with small in-memory DataFrames, pandas.testing.assert_frame_equal and polars.testing.assert_frame_equal for tolerant comparisons, and tmp_path for file-based steps.',
          concepts: ['Tiny fixture DataFrames', 'assert_frame_equal and tolerances', 'tmp_path for file outputs', 'Parametrising edge cases'],
          quiz: [
            ['Why use assert_frame_equal over ==?', 'It compares dtypes, index and values with clear diffs and float tolerance.'],
            ['What edge cases should every transform test cover?', 'Empty input, nulls, duplicates and boundary values.'],
          ],
        },
        {
          title: 'Fixtures and fake data',
          description: 'Faker for realistic names, emails and dates, factory functions for records, and hypothesis for property-based tests that generate inputs you would not think of, keeping tests fast and free of production data.',
          concepts: ['Faker for realistic values', 'Factory functions for records', 'hypothesis property tests', 'Seeding for reproducibility'],
          quiz: [
            ['Why seed Faker in tests?', 'So generated data, and therefore failures, are reproducible.'],
            ['What does hypothesis do when it finds a failing input?', 'Shrinks it to a minimal failing example.'],
          ],
          prereqs: ['pytest for data code'],
        },
        {
          title: 'Testing against databases and S3',
          description: 'testcontainers spins up a real PostgreSQL per test session, moto fakes S3 in-process, and both beat SQLite substitutes that hide dialect differences; transactions rolled back per test keep runs isolated.',
          concepts: ['testcontainers for real databases', 'moto for S3 fakes', 'Why SQLite is a poor stand-in', 'Per-test rollback isolation'],
          quiz: [
            ['Why not test PostgreSQL code against SQLite?', 'Types, upserts and functions differ, so tests pass while production fails.'],
            ['What does moto.mock_aws provide?', 'In-memory fakes of AWS services that boto3 calls transparently.'],
          ],
          prereqs: ['pytest for data code'],
        },
        {
          title: 'pydantic models for records',
          description: 'Declaring record schemas as pydantic models validates and coerces incoming JSON at the boundary, produces clear error messages per field, and serialises back out; strict mode stops silent coercion when exactness matters.',
          concepts: ['BaseModel fields and types', 'Validation errors and reporting', 'Coercion versus strict mode', 'Custom validators', 'TypeAdapter for lists of records'],
          quiz: [
            ['What does pydantic do with "42" for an int field by default?', 'Coerces it to 42; strict mode would reject it.'],
            ['How do you validate a list of dicts efficiently?', 'TypeAdapter(list[Model]).validate_python(rows).'],
          ],
        },
        {
          title: 'Typing data code',
          description: 'Type hints on functions that pass DataFrames and Arrow tables, TypedDict for row dicts, Protocol for pluggable sources and sinks, mypy in CI, and pandera schemas that validate DataFrame columns at runtime.',
          concepts: ['Hints for DataFrame functions', 'TypedDict for row dicts', 'Protocols for sources and sinks', 'pandera DataFrame schemas'],
          quiz: [
            ['What does a pandera DataFrameSchema check?', 'Column presence, dtypes and value constraints at runtime.'],
            ['Why define a Source Protocol?', 'So tests can substitute a fake source with the same interface.'],
          ],
          prereqs: ['pydantic models for records'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Complete jobs built the way production teams build them, then the questions interviewers ask.',
      style: 'project',
      topics: [
        {
          title: 'Project: CSV drops to a Parquet lake',
          description: 'Watch an S3 prefix (MinIO locally) for daily CSV drops, validate each with pydantic, convert to Parquet partitioned by date with pyarrow, write a manifest, and make reruns overwrite the same partition without duplicates.',
          concepts: ['Discover and validate new files', 'Convert with typed schemas', 'Partitioned, idempotent writes', 'Manifest and run summary'],
          quiz: [
            ['How do you avoid reprocessing yesterday\'s files?', 'Track processed keys or ETags in a state table.'],
            ['What guarantees a rerun does not duplicate rows?', 'Overwriting the whole date partition.'],
          ],
        },
        {
          title: 'Project: incremental API extractor',
          description: 'Pull records from a paginated REST API with retries and rate limiting, keep a watermark of the last updated_at, upsert into PostgreSQL through a staging table and COPY, and expose the job as a CLI with --since and --dry-run.',
          concepts: ['Paginate with retries and limits', 'Watermark-driven extraction', 'Stage, COPY and upsert', 'CLI flags and exit codes'],
          quiz: [
            ['Where is the watermark updated relative to the load?', 'After the upsert commits, never before.'],
            ['Why a small overlap window on the watermark?', 'To catch records whose updated_at landed during the previous run.'],
          ],
        },
        {
          title: 'Project: polars transformation job with checks',
          description: 'Read partitioned Parquet lazily with polars, join orders to customers and products, compute daily metrics with window expressions, validate results with pandera-style assertions, and stream the output to Parquet with a metrics summary.',
          concepts: ['Lazy scan and joins', 'Window metrics', 'Result validation rules', 'Streaming output and metrics'],
          quiz: [
            ['Why validate row counts after the join?', 'Fan-out from duplicate keys would inflate every metric.'],
            ['What does sink_parquet avoid?', 'Materialising the whole result in memory.'],
          ],
        },
        {
          title: 'Project: packaged nightly job with tests',
          description: 'Package an existing script as an installable CLI with pyproject.toml, lock dependencies, add pytest coverage using testcontainers and moto, emit structured logs and metrics, and build a container image that runs it with one command.',
          concepts: ['Restructure into a package', 'Lock and containerise', 'Test with real services', 'Logs, metrics and a runbook'],
          quiz: [
            ['What proves the package works outside the repo?', 'Installing the built wheel in a clean environment and running the command.'],
            ['Which test would catch a broken COPY statement?', 'An integration test against a real PostgreSQL container.'],
          ],
        },
        {
          title: 'Python data engineering interview questions',
          description: 'The recurring questions: Parquet versus CSV, why executemany is slow, how to process a file bigger than RAM, what makes a job idempotent, pandas versus polars, where secrets live, and how you would test a loader.',
          concepts: ['File format questions', 'Memory and streaming questions', 'Reliability and idempotency questions', 'Testing and tooling questions'],
          quiz: [
            ['Explain how you would process a 50 GB CSV on a 4 GB machine.', 'Stream it in chunks or with generators, writing partial Parquet outputs, never holding it whole.'],
            ['What is the main advantage of Parquet for analytics?', 'Columnar layout lets queries read only needed columns and skip row groups by statistics.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding exercises for data roles',
          description: 'Timed implementations that interviewers ask for: dedupe a stream keeping the latest record, merge sorted files, batch an iterator, retry with backoff, parse JSON Lines with bad rows, and compute top-N per key without pandas.',
          concepts: ['Dedupe and latest-wins logic', 'Merging sorted inputs with heapq', 'Batching and retry helpers', 'Top-N per key in plain Python'],
          quiz: [
            ['How do you merge many sorted files lazily?', 'heapq.merge over the file iterators.'],
            ['How do you keep the latest record per key in one pass?', 'A dict keyed by id, replacing when the new timestamp is greater.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
