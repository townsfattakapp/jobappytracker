import { defineTrack } from '../define'

export const etlElt = defineTrack({
  id: 'track-etl-elt',
  title: 'ETL and ELT',
  description: 'Designing the extract, transform and load steps that move data between systems: full, incremental and CDC extraction, transformation layers, append, upsert and merge loads, idempotent reruns, late data, schema drift, data contracts, dead-letter handling, orchestration hand-off, testing and tuning.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '🔁',
  tags: ['etl', 'elt', 'cdc', 'incremental loads', 'idempotency', 'data contracts', 'transformations'],
  languages: ['Python', 'SQL'],
  explainMode: 'data',
  code: { label: 'Python and SQL, whichever fits', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python-data-engineering'],
  style: 'practice',
  categories: [
    {
      title: 'Foundations',
      description: 'The shape of a data movement job and the choices that fix it early.',
      topics: [
        {
          title: 'ETL versus ELT trade-offs',
          description: 'ETL transforms in a separate engine before loading; ELT lands raw data in the warehouse and transforms with SQL there. Warehouse compute, data sensitivity, transformation complexity and team skills decide which fits.',
          concepts: ['Where transformation runs', 'Warehouse compute economics', 'Sensitivity and pre-load masking', 'Hybrid ETLT patterns'],
          quiz: [
            ['What made ELT practical?', 'Cheap, elastic warehouse compute and columnar storage that can transform large data with SQL.'],
            ['When is a transform-before-load still required?', 'When PII must be masked or data reshaped before it may enter the target.'],
          ],
        },
        {
          title: 'Pipeline stages and boundaries',
          description: 'Splitting a job into extract, land, transform and publish steps with a durable artefact between each, so a failure in one stage can be retried without redoing the others and each stage can be tested alone.',
          concepts: ['Durable artefacts between stages', 'Retry scope per stage', 'Single responsibility per step', 'Naming and locating intermediate outputs'],
          quiz: [
            ['Why persist the extracted data before transforming it?', 'A transform bug can be fixed and rerun without hitting the source again.'],
            ['What is the sign that two stages should be merged?', 'They always fail and rerun together and share no reusable output.'],
          ],
        },
        {
          title: 'Batch windows and cadence',
          description: 'Choosing how often a pipeline runs and what interval each run covers, aligning windows to source timestamps and time zones, and understanding that latency, cost and complexity all rise as cadence increases.',
          concepts: ['Run frequency versus latency needs', 'Data intervals and window alignment', 'Time zones and day boundaries', 'Cost of higher cadence'],
          quiz: [
            ['Why define a run by its data interval rather than the wall clock?', 'Reruns and backfills must process the same interval regardless of when they execute.'],
            ['What goes wrong with a daily window that ignores time zones?', 'Events near midnight land in the wrong day compared with the business calendar.'],
          ],
          prereqs: ['Pipeline stages and boundaries'],
        },
        {
          title: 'Landing raw data immutably',
          description: 'Keeping an untouched copy of every extract, partitioned by arrival time, with source metadata attached, so any downstream logic can be reprocessed from truth and audits can see exactly what arrived.',
          concepts: ['Raw zone layout', 'Arrival-time partitioning', 'Source metadata columns', 'Retention of raw data'],
          quiz: [
            ['Which metadata columns should every raw row carry?', 'Source system, extraction time, file or batch id and a load run id.'],
            ['Why partition raw data by arrival time rather than event time?', 'Arrival time is known and monotonic; event time may be late or wrong.'],
          ],
          prereqs: ['Pipeline stages and boundaries'],
        },
      ],
    },
    {
      title: 'Extraction Patterns',
      description: 'Getting data out of sources without harming them or missing changes.',
      topics: [
        {
          title: 'Full extraction',
          description: 'Copying the whole source table each run is simple, self-healing and correct for deletes, but its cost grows with table size; snapshot diffs against the previous full copy can still derive changes.',
          concepts: ['When full loads are the right choice', 'Source load and read replicas', 'Deriving changes by snapshot diff', 'Growth limits of full loads'],
          quiz: [
            ['What is the main advantage of a full extract?', 'It naturally captures deletes and self-corrects any earlier error.'],
            ['How do you derive changed rows from two full snapshots?', 'Hash each row and compare hashes by key across the two snapshots.'],
          ],
        },
        {
          title: 'Incremental extraction with watermarks',
          description: 'Pulling rows where updated_at exceeds the last stored watermark, with an overlap to absorb clock skew and in-flight transactions, deduplicating the overlap, and persisting the watermark only after a successful load.',
          concepts: ['Choosing a watermark column', 'Overlap windows for skew', 'Persisting the watermark last', 'Missing updates and uncaught deletes'],
          quiz: [
            ['Why can a strictly-greater-than watermark miss rows?', 'Rows committed after the extract began but with earlier timestamps are skipped.'],
            ['Which change is invisible to an updated_at watermark?', 'Hard deletes.'],
          ],
          prereqs: ['Full extraction'],
        },
        {
          title: 'Change data capture',
          description: 'Reading the database transaction log (Debezium, native logical replication) streams every insert, update and delete with ordering, capturing deletes and intermediate states that timestamp polling misses, at the cost of operational complexity.',
          concepts: ['Log-based CDC mechanics', 'Debezium and logical replication', 'Trigger-based CDC alternatives', 'Applying change events in order', 'Initial snapshot plus stream'],
          quiz: [
            ['What does log-based CDC capture that polling cannot?', 'Deletes and every intermediate update between two polls.'],
            ['What must be true when applying CDC events to a target?', 'Events for the same key are applied in commit order.'],
          ],
          prereqs: ['Incremental extraction with watermarks'],
        },
        {
          title: 'Extracting from APIs',
          description: 'Cursor and offset pagination, rate limits and 429 handling, incremental parameters such as updated_since, and persisting page cursors so an interrupted extract resumes rather than restarts.',
          concepts: ['Offset versus cursor pagination', 'Rate limits and backoff', 'Incremental query parameters', 'Resumable extraction state'],
          quiz: [
            ['Why is offset pagination unsafe on changing data?', 'Inserts shift later pages, causing skipped or duplicated records.'],
            ['What should an extractor store between pages?', 'The last cursor, so a crash resumes from it.'],
          ],
        },
        {
          title: 'Extracting from files and SFTP drops',
          description: 'Detecting complete files (manifests, checksums, size stability), tracking processed files by name and hash, handling reprocessed or corrected files, and archiving inputs after a successful load.',
          concepts: ['Detecting complete files', 'Processed-file registry', 'Corrections and resends', 'Archiving inputs'],
          quiz: [
            ['How do you avoid reading a file still being uploaded?', 'Wait for a manifest or for the size to stay stable across checks.'],
            ['What identifies a file as already processed?', 'Its path plus a content hash, stored in a registry table.'],
          ],
        },
      ],
    },
    {
      title: 'Transformation Design',
      description: 'Turning raw records into trustworthy, joinable, aggregated data.',
      topics: [
        {
          title: 'Staging and cleaning transforms',
          description: 'A first layer that renames and types columns, trims and normalises strings, standardises nulls and timestamps, and does nothing else, so every later model starts from consistent inputs.',
          concepts: ['Type casting and naming', 'String and null normalisation', 'Timestamp and timezone standardisation', 'One staging model per source'],
          quiz: [
            ['What belongs in a staging model?', 'Renaming, casting and light cleaning, without joins or business logic.'],
            ['Why standardise empty strings to NULL?', 'So filters and joins treat missing values consistently.'],
          ],
        },
        {
          title: 'Deduplication and key resolution',
          description: 'Defining the business key, choosing a winner among duplicates (latest timestamp, highest version), and handling keys that arrive with different formats or from several sources.',
          concepts: ['Defining the business key', 'Latest-wins and version-wins rules', 'Cross-source key matching', 'Recording duplicate counts'],
          quiz: [
            ['How do you keep the latest record per key in SQL?', 'ROW_NUMBER over the key ordered by timestamp descending, keeping row 1.'],
            ['Why record how many duplicates were removed?', 'A sudden change signals a source problem.'],
          ],
          prereqs: ['Staging and cleaning transforms'],
        },
        {
          title: 'Joins and enrichment',
          description: 'Enriching events with reference data and dimensions, joining on the version valid at event time, guarding against fan-out with uniqueness checks, and deciding what to do with unmatched rows.',
          concepts: ['Reference and lookup joins', 'Point-in-time enrichment', 'Fan-out detection', 'Unmatched row policy'],
          quiz: [
            ['How do you detect a join that multiplied rows?', 'Compare row counts before and after, or assert uniqueness of the join key on the lookup side.'],
            ['What are the options for an event with no matching dimension?', 'Drop, keep with nulls, or attach an unknown member.'],
          ],
          prereqs: ['Deduplication and key resolution'],
        },
        {
          title: 'Aggregations and derived metrics',
          description: 'Building summary tables at declared grains, computing metrics once in a shared model rather than per report, and keeping components additive so rollups remain correct.',
          concepts: ['Declaring aggregation grain', 'Shared metric definitions', 'Additive components over ratios', 'Incremental aggregation'],
          quiz: [
            ['Why compute a metric in one model instead of in each dashboard?', 'One definition means one answer and one place to fix.'],
            ['What makes incremental aggregation possible?', 'Additive measures partitioned by the same key the increment uses.'],
          ],
          prereqs: ['Joins and enrichment'],
        },
        {
          title: 'SQL-first versus code transformations',
          description: 'SQL in the warehouse (dbt-style models) covers most set-based work; Python or Spark earns its place for complex logic, ML features and external calls. Mixing them needs clear boundaries and shared testing.',
          concepts: ['Strengths of SQL models', 'When code is necessary', 'Boundaries between SQL and code', 'dbt as a transformation framework'],
          quiz: [
            ['What does dbt add to SQL transformations?', 'Dependency ordering, testing, documentation and environments for SQL models.'],
            ['Give a transformation that SQL handles poorly.', 'Calling an external API or complex text parsing per record.'],
          ],
        },
      ],
    },
    {
      title: 'Loading Strategies',
      description: 'Writing to the target so the result is correct and repeatable.',
      topics: [
        {
          title: 'Append-only loads',
          description: 'Inserting new rows without touching old ones is fastest and keeps history, but needs a batch or run id to make reruns removable and a downstream dedup if the source can resend.',
          concepts: ['Insert-only tables', 'Batch ids for removal', 'History by accumulation', 'Dedup at read time'],
          quiz: [
            ['How do you undo a bad append?', 'Delete rows tagged with that run or batch id.'],
            ['When is append-only the natural choice?', 'For immutable events and logs.'],
          ],
        },
        {
          title: 'Upserts and merge loads',
          description: 'Insert-or-update by business key with MERGE or ON CONFLICT (see track-advanced-sql for syntax), handling deletes as soft flags or explicit delete branches, and limiting the merge to affected partitions.',
          concepts: ['Merge by business key', 'Handling deletes in merges', 'Change hashes to skip no-ops', 'Scoping merges by partition'],
          quiz: [
            ['What must the source have for a merge?', 'A unique business key with no duplicate rows.'],
            ['Why compare a hash before updating?', 'To avoid rewriting unchanged rows and inflating update counts.'],
          ],
          prereqs: ['Append-only loads'],
        },
        {
          title: 'Full refresh and partition overwrite',
          description: 'Rebuilding a whole table or replacing one partition per run with insert-overwrite or a staged swap gives simple, self-healing semantics and is often cheaper than merges for daily partitions.',
          concepts: ['Truncate-and-reload', 'Table swap for atomicity', 'Insert-overwrite by partition', 'Choosing overwrite over merge'],
          quiz: [
            ['Why is partition overwrite naturally idempotent?', 'Each run replaces its whole partition, so a rerun produces the same state.'],
            ['When does a full refresh stop being viable?', 'When the table is too large to rebuild inside the batch window.'],
          ],
          prereqs: ['Append-only loads'],
        },
        {
          title: 'Load ordering and referential integrity',
          description: 'Loading dimensions before facts, resolving surrogate keys at load time, handling facts whose dimension has not arrived, and ordering dependent tables so constraints or downstream models never see orphans.',
          concepts: ['Dimensions before facts', 'Key resolution at load', 'Placeholder members for missing keys', 'Dependency-ordered loads'],
          quiz: [
            ['What happens if facts load before their dimension?', 'Key lookups fail or produce orphans.'],
            ['How do you handle a fact whose customer is missing?', 'Assign an unknown or inferred member and fix it when the customer arrives.'],
          ],
          prereqs: ['Upserts and merge loads'],
        },
      ],
    },
    {
      title: 'Correctness Under Change',
      description: 'Reruns, late data and evolving sources.',
      topics: [
        {
          title: 'Idempotency and safe reruns',
          description: 'Every run must produce the same target state whether it runs once or five times: deterministic inputs by interval, overwrite or merge writes, state updated only after commit, and no reliance on wall-clock time.',
          concepts: ['Deterministic inputs per interval', 'Idempotent write patterns', 'State updates after commit', 'Removing wall-clock dependence'],
          quiz: [
            ['Name a common source of non-idempotency.', 'Using now() inside the job instead of the run interval.'],
            ['How do you prove a job is idempotent?', 'Run it twice on the same interval and diff the target.'],
          ],
          prereqs: ['Full refresh and partition overwrite'],
        },
        {
          title: 'Exactly-once semantics and deduplication',
          description: 'Delivery is at-least-once almost everywhere, so exactly-once is achieved at the sink through idempotency keys, unique constraints or dedup on event ids within a window.',
          concepts: ['At-least-once reality', 'Idempotency keys', 'Unique constraints as guards', 'Windowed dedup by event id'],
          quiz: [
            ['Where is exactly-once actually enforced?', 'At the sink, by rejecting or overwriting duplicates.'],
            ['Why limit dedup to a window?', 'Keeping every historical id forever is too expensive to check.'],
          ],
          prereqs: ['Idempotency and safe reruns'],
        },
        {
          title: 'Late and out-of-order data',
          description: 'Events arrive after their interval closed, so pipelines reprocess a lookback window, track event time separately from arrival time, and restate aggregates for affected periods rather than assuming closed periods are final.',
          concepts: ['Event time versus arrival time', 'Lookback windows', 'Restating affected periods', 'Lateness metrics'],
          quiz: [
            ['How do you handle an event that arrives three days late?', 'Reprocess its event-time partition within the lookback, or route it to a correction process.'],
            ['Why measure lateness?', 'To size the lookback window with evidence.'],
          ],
          prereqs: ['Idempotency and safe reruns'],
        },
        {
          title: 'Schema evolution and drift',
          description: 'Sources add, rename and retype columns without warning; pipelines detect drift by comparing incoming schemas to expected ones, handle additive changes automatically and fail loudly on breaking ones.',
          concepts: ['Detecting schema drift', 'Auto-handling additive changes', 'Failing on breaking changes', 'Evolving target tables'],
          quiz: [
            ['Which change is safe to absorb automatically?', 'A new nullable column.'],
            ['What should happen when a source column changes type?', 'Fail the run and alert, rather than silently casting.'],
          ],
        },
        {
          title: 'Data contracts',
          description: 'An agreement between producer and consumer stating schema, semantics, SLAs and change rules, enforced with schema registries or CI checks so producers cannot break consumers unknowingly.',
          concepts: ['Contract contents', 'Producer ownership', 'Schema registries and enforcement', 'Versioning and deprecation'],
          quiz: [
            ['Who owns a data contract?', 'The producing team, with consumers as parties.'],
            ['How is a contract enforced technically?', 'Schema validation at publish time and CI checks on schema changes.'],
          ],
          prereqs: ['Schema evolution and drift'],
        },
      ],
    },
    {
      title: 'Errors and Resilience',
      description: 'Failing well, isolating bad records and proving correctness.',
      topics: [
        {
          title: 'Error handling strategies',
          description: 'Choosing per error type whether to fail the run, skip the record, quarantine it or fall back to a default, and making that policy explicit and observable rather than buried in try/except blocks.',
          concepts: ['Fail fast versus continue', 'Error classification', 'Policy as configuration', 'Surfacing error rates'],
          quiz: [
            ['When should a single bad record fail the whole run?', 'When downstream correctness depends on completeness, such as financial totals.'],
            ['What is the risk of skipping bad records silently?', 'Data loss that nobody notices.'],
          ],
        },
        {
          title: 'Dead-letter queues and quarantine tables',
          description: 'Records that fail validation go to a dead-letter location with the error, original payload and run id, so the main load completes and the failures can be inspected, fixed and replayed.',
          concepts: ['Dead-letter structure', 'Storing payload and error reason', 'Replaying fixed records', 'Alerting on dead-letter growth'],
          quiz: [
            ['What must a dead-letter row contain?', 'The original record, the error, the run id and a timestamp.'],
            ['How do fixed records re-enter the pipeline?', 'A replay job that reads the dead-letter table and resubmits them.'],
          ],
          prereqs: ['Error handling strategies'],
        },
        {
          title: 'Retries and poison records',
          description: 'Retrying transient failures at the stage level, capping attempts, and recognising poison records that fail every time so they are quarantined instead of blocking the batch forever.',
          concepts: ['Stage-level retries', 'Attempt caps and backoff', 'Identifying poison records', 'Isolating failures from the batch'],
          quiz: [
            ['What is a poison record?', 'One that deterministically fails processing on every attempt.'],
            ['Why not retry a whole batch when one record fails?', 'The same record fails again; isolate it and continue.'],
          ],
          prereqs: ['Dead-letter queues and quarantine tables'],
        },
        {
          title: 'Auditing and reconciliation',
          description: 'Comparing row counts, sums and checksums between source and target per run, storing the results, and alerting on mismatches so silent losses and duplications are caught the same day.',
          concepts: ['Control totals per run', 'Source-to-target reconciliation queries', 'Storing audit results', 'Tolerances and alerts'],
          quiz: [
            ['What is a control total?', 'A count or sum computed at extraction and checked after load.'],
            ['Why store reconciliation results?', 'Trends reveal slow drift that a single check misses.'],
          ],
        },
      ],
    },
    {
      title: 'Orchestration Hand-off',
      description: 'Where a job ends and the scheduler begins.',
      topics: [
        {
          title: 'Task boundaries for an orchestrator',
          description: 'Packaging each stage as a task with explicit inputs, outputs and parameters so a scheduler can order, retry and backfill it, without the task knowing which scheduler runs it.',
          concepts: ['Inputs and outputs per task', 'Parameters instead of hidden state', 'Scheduler-agnostic tasks', 'Sensors and readiness checks'],
          quiz: [
            ['What should a task receive from the orchestrator?', 'The run interval and configuration, as parameters.'],
            ['Why keep tasks scheduler-agnostic?', 'They can be run locally, tested and migrated between tools.'],
          ],
          prereqs: ['Pipeline stages and boundaries'],
        },
        {
          title: 'Run metadata and parameters',
          description: 'Every run carries a run id, data interval and configuration version, writes them into outputs and audit tables, and reads nothing from the wall clock, which makes reruns traceable and reproducible.',
          concepts: ['Run ids and data intervals', 'Tagging outputs with run metadata', 'Configuration versions', 'Reproducing a past run'],
          quiz: [
            ['What lets you tell which run produced a row?', 'A run id column written with the data.'],
            ['Why record the configuration version?', 'To reproduce results after settings change.'],
          ],
          prereqs: ['Task boundaries for an orchestrator'],
        },
        {
          title: 'Environments and promotion',
          description: 'Running the same pipeline code against dev, staging and production targets by configuration only, with sampled data in lower environments and a promotion path through version control and CI.',
          concepts: ['Environment-specific configuration', 'Sampled data for lower environments', 'Promotion through CI', 'Avoiding environment-specific code'],
          quiz: [
            ['How should a pipeline learn which database to write to?', 'From environment configuration, never from code branches.'],
            ['Why sample data in dev?', 'Faster runs and lower cost while keeping realistic shapes.'],
          ],
        },
      ],
    },
    {
      title: 'Testing and Performance',
      description: 'Proving transformations and making them fast.',
      topics: [
        {
          title: 'Unit testing transformations',
          description: 'Isolating transformation logic into pure functions or models that take small fixture inputs and assert exact outputs, covering nulls, duplicates, boundaries and empty inputs.',
          concepts: ['Pure transformation functions', 'Fixture inputs and expected outputs', 'Edge cases to always cover', 'dbt unit tests'],
          quiz: [
            ['Why separate I/O from transformation logic?', 'So the logic can be tested without databases or files.'],
            ['What does a dbt unit test define?', 'Mock inputs for a model and the expected rows it should produce.'],
          ],
        },
        {
          title: 'Data quality tests',
          description: 'Assertions on real data after each run: not null, unique, accepted values, referential integrity, freshness and row-count bounds, run by dbt tests, Great Expectations or plain SQL, with clear severity levels.',
          concepts: ['Schema tests: unique, not null, accepted values', 'Referential and freshness tests', 'Volume and distribution checks', 'Severity: warn versus fail'],
          quiz: [
            ['Which test catches a broken join key?', 'A relationship (referential integrity) test.'],
            ['When should a quality test warn rather than fail?', 'When the issue is informative but should not block downstream consumers.'],
          ],
          prereqs: ['Unit testing transformations'],
        },
        {
          title: 'Golden datasets and regression tests',
          description: 'A curated input set with known correct outputs, run on every change, catches regressions that unit tests miss; diffing outputs between versions reveals unintended changes before deployment.',
          concepts: ['Building a golden dataset', 'Output diffing between versions', 'Handling expected changes', 'Keeping golden data current'],
          quiz: [
            ['What does an output diff show that tests do not?', 'Unintended changes in rows the tests never asserted.'],
            ['When must the golden output be updated?', 'When a deliberate logic change alters the expected result.'],
          ],
          prereqs: ['Data quality tests'],
        },
        {
          title: 'Tuning: pushdown and pruning',
          description: 'Filtering and aggregating as close to the source as possible, reading only needed columns and partitions, and avoiding pulling whole tables into Python when the database can do the work.',
          concepts: ['Predicate and projection pushdown', 'Partition pruning in extracts', 'Aggregating in the source', 'Avoiding row-by-row processing'],
          quiz: [
            ['What is predicate pushdown?', 'Applying filters in the source or storage layer before data moves.'],
            ['Why is a SELECT * extract slow even if the transform is fast?', 'Every column moves over the network and into memory.'],
          ],
        },
        {
          title: 'Tuning: batching, parallelism and file sizes',
          description: 'Sizing batches for bulk loads, parallelising independent partitions, writing files large enough to avoid the small-files problem, and measuring where time actually goes before optimising.',
          concepts: ['Batch sizing for loads', 'Partition-level parallelism', 'File size targets', 'Profiling stage durations'],
          quiz: [
            ['What is the first step in tuning a slow pipeline?', 'Measure per-stage durations to find the actual bottleneck.'],
            ['Why parallelise by partition rather than by row?', 'Partitions are independent units with no coordination overhead.'],
          ],
          prereqs: ['Tuning: pushdown and pruning'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Complete pipelines with the failure modes designed in, then the interview.',
      style: 'project',
      topics: [
        {
          title: 'Project: incremental ELT into a warehouse',
          description: 'Extract orders incrementally from PostgreSQL with a watermark and overlap, land raw JSON in object storage, load to a warehouse staging schema, transform with SQL models into a star schema, and make every step rerunnable.',
          concepts: ['Watermark extraction with overlap', 'Raw landing and staging load', 'SQL transformation layers', 'Rerun and reconciliation tests'],
          quiz: [
            ['How do you verify the incremental load matches the source?', 'Reconcile counts and sums per day against the source.'],
            ['What happens if the same interval runs twice?', 'The merge produces identical target state.'],
          ],
        },
        {
          title: 'Project: CDC replication with Debezium',
          description: 'Capture changes from a PostgreSQL table with Debezium into Kafka, apply inserts, updates and deletes to a target table in order with a Python consumer, handle the initial snapshot, and verify the tables match.',
          concepts: ['Configure the connector', 'Apply changes in order', 'Snapshot plus stream handling', 'Verify with reconciliation'],
          quiz: [
            ['How are deletes represented in a CDC stream?', 'As delete events, often with a tombstone message.'],
            ['Why apply changes per key in order?', 'Out-of-order updates would leave stale values.'],
          ],
        },
        {
          title: 'Project: API ingestion with dead letters',
          description: 'Ingest a paginated third-party API with retries and rate limiting, validate records against a contract, quarantine failures in a dead-letter table with reasons, and build a replay command that resubmits fixed records.',
          concepts: ['Resumable paginated extraction', 'Contract validation', 'Dead-letter storage', 'Replay tooling'],
          quiz: [
            ['What proves the pipeline handles poison records?', 'A malformed record lands in the dead-letter table and the run still succeeds.'],
            ['How does a replay avoid duplicates?', 'It upserts by the record id.'],
          ],
        },
        {
          title: 'Project: late data and restatement',
          description: 'Build daily aggregates from events that arrive up to seven days late: a lookback window that restates affected days, lateness metrics, and tests showing that totals converge to the correct values.',
          concepts: ['Event-time partitioning', 'Lookback restatement logic', 'Lateness measurement', 'Convergence tests'],
          quiz: [
            ['How wide should the lookback be?', 'Wide enough to cover the observed lateness distribution, with margin.'],
            ['Why restate rather than append corrections?', 'Consumers expect one correct value per day, not a series of deltas.'],
          ],
        },
        {
          title: 'ETL and ELT interview questions',
          description: 'ETL versus ELT, full versus incremental versus CDC, how you make a load idempotent, how you handle late data, what a data contract is, how you test transformations and what you do with bad records.',
          concepts: ['Architecture questions', 'Extraction and loading questions', 'Correctness and reliability questions', 'Testing questions'],
          quiz: [
            ['Explain idempotency to a non-engineer.', 'Running the job again does not change the result.'],
            ['When would you choose CDC over timestamp polling?', 'When deletes matter or every change must be captured.'],
          ],
          style: 'reading',
        },
        {
          title: 'Pipeline design exercises',
          description: 'Timed design prompts: move a 2 TB table nightly with a 4-hour window, replicate a SaaS API with rate limits, backfill two years of history safely, and design a load that tolerates duplicate and late events.',
          concepts: ['Sizing loads against windows', 'Designing for rate-limited sources', 'Backfill strategies', 'Duplicate and late-event handling'],
          quiz: [
            ['What do you ask first about the 2 TB nightly table?', 'Whether it has a reliable change column and how much changes per day.'],
            ['How do you backfill without disturbing daily runs?', 'Run backfill intervals separately with the same idempotent job and throttled concurrency.'],
          ],
          style: 'practice',
        },
      ],
    },
  ],
})
