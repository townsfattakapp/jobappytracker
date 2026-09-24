import { defineTrack } from '../define'

export const batchStream = defineTrack({
  id: 'track-batch-stream',
  title: 'Batch and Stream Processing',
  description: 'How batch and streaming systems process data correctly at scale: partitioned batch patterns, event time and watermarks, windowing, stateful processing, exactly-once, joins and late data, backpressure, and how Flink, Spark Structured Streaming and Kafka Streams differ.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '🌊',
  tags: ['streaming', 'batch', 'flink', 'spark', 'kafka-streams', 'windowing', 'watermarks'],
  languages: ['Python', 'SQL'],
  explainMode: 'data',
  code: { label: 'Python and SQL, whichever fits', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-data-pipelines'],
  style: 'practice',
  categories: [
    {
      title: 'Batch Processing Patterns',
      description: 'The bounded case first: what makes a batch job correct and rerunnable.',
      topics: [
        {
          title: 'Bounded versus unbounded data',
          description: 'Batch works on a complete, finite input and can sort, count and join with full knowledge; streams never end, so every result is provisional. This single difference explains why streaming needs time, windows and watermarks at all.',
          concepts: ['Finite inputs and complete results', 'Unbounded inputs and provisional results', 'Latency versus completeness', 'When batch is enough'],
          quiz: [
            ['Why can a batch job compute an exact global count?', 'It sees the whole input before emitting anything.'],
            ['What does a streaming job give up?', 'Certainty that all input has arrived.'],
          ],
        },
        {
          title: 'Partitioned batch jobs',
          description: 'Splitting input by date, key range or file so partitions process in parallel and rerun independently; partition-aligned outputs (one folder per day) that overwrite cleanly and make backfills trivial.',
          concepts: ['Partitioning by time or key', 'Partition-aligned outputs', 'Parallelism across partitions', 'Skewed partitions'],
          quiz: [
            ['Why write output partitioned by the same key as the input?', 'A rerun of one partition replaces exactly its own output.'],
            ['What is partition skew?', 'One partition holding far more data, so it dominates run time.'],
          ],
          prereqs: ['Bounded versus unbounded data'],
        },
        {
          title: 'Idempotent and incremental batch',
          description: 'Overwrite-by-partition, merge on keys and high-watermark extraction so a job can be rerun or resumed without duplicates; the difference between reprocessing everything and processing only what changed.',
          concepts: ['Overwrite by partition', 'Merge on keys', 'High-watermark extraction', 'Full reprocess versus incremental'],
          quiz: [
            ['What makes a batch job safe to rerun?', 'Its output for an input partition is replaced, never appended.'],
            ['What is a high watermark in extraction?', 'The largest timestamp or id already processed, used as the next starting point.'],
          ],
          prereqs: ['Partitioned batch jobs'],
        },
        {
          title: 'Shuffles, joins and aggregation in batch',
          description: 'Wide operations move data between workers by key; how shuffle cost dominates job time, broadcast joins avoid it for small tables, and pre-aggregation reduces what must cross the network.',
          concepts: ['Narrow versus wide operations', 'Shuffle cost model', 'Broadcast joins', 'Pre-aggregation before shuffle'],
          quiz: [
            ['When is a broadcast join appropriate?', 'When one side fits comfortably in each worker\'s memory.'],
            ['Why does groupBy cause a shuffle?', 'All rows with the same key must land on the same worker.'],
          ],
          prereqs: ['Partitioned batch jobs'],
        },
        {
          title: 'Micro-batch as a middle ground',
          description: 'Running small batches every few seconds or minutes gives near-real-time results with batch semantics; Spark Structured Streaming\'s model, its latency floor and when it beats true record-at-a-time streaming.',
          concepts: ['Micro-batch execution model', 'Latency floor of micro-batches', 'Trigger intervals', 'Choosing micro-batch over streaming'],
          quiz: [
            ['What is the minimum practical latency of micro-batching?', 'Roughly the trigger interval plus batch overhead, typically seconds.'],
            ['Why might micro-batch be preferable?', 'Simpler semantics and higher throughput when sub-second latency is not needed.'],
          ],
          prereqs: ['Bounded versus unbounded data'],
        },
      ],
    },
    {
      title: 'Streaming Fundamentals',
      description: 'Events, time and the vocabulary every stream engine shares.',
      topics: [
        {
          title: 'Events, streams and event time',
          description: 'An event records something that happened at a moment; event time is when it happened, processing time is when the system saw it, and the gap between them (skew) is what every correctness problem in streaming comes from.',
          concepts: ['Event as an immutable fact', 'Event time versus processing time', 'Time skew and its causes', 'Ingestion time as a compromise'],
          quiz: [
            ['Why can processing time give wrong hourly totals?', 'Events delayed in transit are counted in the wrong hour.'],
            ['Where does event time come from?', 'A timestamp inside the event set by the producer.'],
          ],
        },
        {
          title: 'Watermarks',
          description: 'A watermark asserts that no events older than time T are expected; it lets the engine close windows and emit results, and choosing its lag trades completeness against latency.',
          concepts: ['Watermark as a completeness claim', 'Bounded out-of-orderness', 'Watermark propagation across operators', 'Idle sources and stalled watermarks'],
          quiz: [
            ['What does a watermark of 10:05 mean?', 'The engine assumes all events with timestamps before 10:05 have arrived.'],
            ['What happens if one source stops sending?', 'The watermark stalls and windows never close unless the source is marked idle.'],
          ],
          prereqs: ['Events, streams and event time'],
        },
        {
          title: 'Delivery from the source',
          description: 'How a stream engine reads from Kafka or Kinesis: partitions mapped to parallel readers, offsets as the replay position, and why source replayability is a precondition for any fault-tolerance guarantee.',
          concepts: ['Partition to reader mapping', 'Offsets as replay position', 'Replayable sources', 'Source parallelism limits'],
          quiz: [
            ['Why must a source be replayable?', 'After a failure the engine re-reads from the last checkpointed position.'],
            ['What bounds source parallelism?', 'The number of partitions or shards.'],
          ],
          prereqs: ['Events, streams and event time'],
        },
        {
          title: 'Keyed streams and partitioned state',
          description: 'Partitioning a stream by key routes all events for one key to one parallel instance, which is what allows per-key state and ordering; key skew and key cardinality shape performance.',
          concepts: ['keyBy and routing', 'Per-key ordering guarantee', 'State scoped to a key', 'Key skew and cardinality'],
          quiz: [
            ['Why key a stream before aggregating?', 'So every event for a key is processed by the same instance holding its state.'],
            ['What does a hot key cause?', 'One instance overloaded while others idle.'],
          ],
          prereqs: ['Delivery from the source'],
        },
      ],
    },
    {
      title: 'Windowing',
      description: 'Turning an infinite stream into finite groups you can aggregate.',
      topics: [
        {
          title: 'Tumbling windows',
          description: 'Fixed-size, non-overlapping windows aligned to the clock (every 5 minutes); each event belongs to exactly one window, results are emitted when the watermark passes the window end.',
          concepts: ['Fixed non-overlapping windows', 'Window alignment and offsets', 'Emission at watermark', 'Tumbling window in SQL'],
          quiz: [
            ['How many tumbling windows does one event belong to?', 'Exactly one.'],
            ['When is a tumbling window result emitted?', 'When the watermark passes the window end time.'],
          ],
        },
        {
          title: 'Sliding and hopping windows',
          description: 'Overlapping windows of fixed size that advance by a smaller step (a 10-minute window every minute); each event lands in several windows, multiplying state and output, which is the cost of smooth rolling metrics.',
          concepts: ['Size and slide parameters', 'Events in multiple windows', 'State multiplication cost', 'Rolling averages and rates'],
          quiz: [
            ['In a 10-minute window sliding every 2 minutes, how many windows does an event join?', 'Five.'],
            ['When is a sliding window worth its cost?', 'When a smooth rolling metric matters more than storage.'],
          ],
          prereqs: ['Tumbling windows'],
        },
        {
          title: 'Session windows',
          description: 'Windows defined by gaps in activity per key: a session ends when no event arrives for the gap duration, so lengths vary and windows merge when a late event bridges two sessions.',
          concepts: ['Gap-based session boundaries', 'Per-key variable length windows', 'Session merging', 'Session windows for user behaviour'],
          quiz: [
            ['What closes a session window?', 'A gap in events for the key longer than the configured timeout.'],
            ['Why can two sessions merge?', 'A late event falls in the gap between them.'],
          ],
          prereqs: ['Sliding and hopping windows'],
        },
        {
          title: 'Triggers, allowed lateness and window results',
          description: 'Triggers decide when a window emits (on watermark, early speculative results, or late updates), allowed lateness keeps a window open after the watermark, and the output mode determines whether updates or retractions are sent.',
          concepts: ['Trigger types', 'Allowed lateness', 'Early and late firings', 'Append, update and retract output'],
          quiz: [
            ['What does allowed lateness change?', 'How long window state is kept after the watermark, so late events can update the result.'],
            ['What is a retraction?', 'A message withdrawing a previously emitted result before sending the corrected one.'],
          ],
          prereqs: ['Session windows'],
        },
        {
          title: 'Global windows and custom windowing',
          description: 'A global window holds everything per key and relies on custom triggers (count-based, punctuation-based) to emit; when count windows or business-defined boundaries beat time windows.',
          concepts: ['Global window with triggers', 'Count-based windows', 'Punctuation-driven emission', 'Custom window assigners'],
          quiz: [
            ['When would you use a count window?', 'When batches of N events matter more than elapsed time.'],
            ['What is the risk of a global window?', 'Unbounded state unless a trigger clears it.'],
          ],
          prereqs: ['Triggers, allowed lateness and window results'],
        },
      ],
    },
    {
      title: 'Stateful Processing and Fault Tolerance',
      description: 'Keeping state across events without losing it when something fails.',
      topics: [
        {
          title: 'Operator state and keyed state',
          description: 'Stateful operators keep values (counts, last-seen, buffers) between events; keyed state is scoped per key and stored locally in memory or RocksDB, which is why stream jobs scale with keys not machines.',
          concepts: ['Value, list and map state', 'Local state backends', 'RocksDB for large state', 'State access patterns'],
          quiz: [
            ['Why store state locally rather than in a database?', 'Sub-millisecond access; the engine handles durability via checkpoints.'],
            ['When is RocksDB preferred over heap state?', 'When state exceeds available memory.'],
          ],
        },
        {
          title: 'Checkpoints and snapshots',
          description: 'Periodic consistent snapshots of all operator state plus source offsets, written to durable storage; on failure the job restores the last checkpoint and replays from its offsets, giving at-least-once at minimum.',
          concepts: ['Checkpoint barriers and alignment', 'Checkpoint interval trade-off', 'Restoring from a checkpoint', 'Incremental checkpoints'],
          quiz: [
            ['What does a checkpoint contain?', 'Every operator\'s state and the source read positions at a consistent point.'],
            ['What happens after restore?', 'Events since the checkpoint are replayed from the source.'],
          ],
          prereqs: ['Operator state and keyed state'],
        },
        {
          title: 'State TTL and unbounded growth',
          description: 'State that is never cleared grows forever (every user id ever seen); time-to-live, timers and explicit cleanup bound memory, and monitoring state size catches leaks before the job dies.',
          concepts: ['State TTL configuration', 'Timers for cleanup', 'Explicit state clearing', 'Monitoring state size'],
          quiz: [
            ['What is the symptom of unbounded state?', 'Checkpoint size and duration grow until the job fails.'],
            ['How do you bound per-key state?', 'Set a TTL or clear it with a timer after inactivity.'],
          ],
          prereqs: ['Checkpoints and snapshots'],
        },
        {
          title: 'Savepoints, upgrades and rescaling',
          description: 'A savepoint is a user-triggered checkpoint used to stop a job, change its code or parallelism, and resume; operator ids and state compatibility rules decide whether the restore succeeds.',
          concepts: ['Savepoint versus checkpoint', 'Stable operator ids', 'Rescaling with key groups', 'State schema evolution'],
          quiz: [
            ['Why assign uid to operators?', 'So state can be mapped back after code changes.'],
            ['How does rescaling redistribute keyed state?', 'Key groups are reassigned across the new parallel instances.'],
          ],
          prereqs: ['Checkpoints and snapshots'],
        },
      ],
    },
    {
      title: 'Exactly-Once and Delivery Guarantees',
      description: 'What exactly-once means in practice and what it costs.',
      topics: [
        {
          title: 'At-least-once and effectively-once',
          description: 'Replay after failure duplicates side effects unless the sink is idempotent; effectively-once means duplicates cannot change the outcome, which is often cheaper and simpler than true transactional exactly-once.',
          concepts: ['Replay causes duplicates', 'Idempotent sinks', 'Deduplication by event id', 'Effectively-once as a design goal'],
          quiz: [
            ['How does an upsert sink give effectively-once?', 'Replaying the same key overwrites the same row.'],
            ['What does dedupe by event id need?', 'A unique id per event and a bounded state of seen ids.'],
          ],
        },
        {
          title: 'End-to-end exactly-once with transactional sinks',
          description: 'Two-phase commit ties sink writes to checkpoints: data is pre-committed, then committed when the checkpoint completes; Kafka transactions and file sinks with atomic renames support this, most databases do not natively.',
          concepts: ['Two-phase commit with checkpoints', 'Transactional Kafka sinks', 'File sinks with atomic commit', 'Sinks that cannot do it'],
          quiz: [
            ['When is a transactional sink\'s data visible?', 'After the checkpoint that includes it completes.'],
            ['What is the latency cost?', 'Output visibility is delayed by up to one checkpoint interval.'],
          ],
          prereqs: ['At-least-once and effectively-once'],
        },
        {
          title: 'Choosing a guarantee per pipeline',
          description: 'A decision path: is the sink idempotent, do consumers tolerate duplicates, does the output feed money or alerts; matching the guarantee to the cost of being wrong instead of defaulting to the strictest.',
          concepts: ['Cost of duplicates per use case', 'Sink capabilities audit', 'Guarantee versus latency and throughput', 'Documenting the chosen guarantee'],
          quiz: [
            ['When is at-least-once acceptable?', 'When the sink is idempotent or duplicates are harmless, such as metrics counters with dedupe.'],
            ['What forces exactly-once?', 'Outputs where a duplicate changes a real-world outcome, like billing.'],
          ],
          prereqs: ['End-to-end exactly-once with transactional sinks'],
        },
      ],
    },
    {
      title: 'Engines and Architectures',
      description: 'Comparing the main engines and the shapes of systems built with them.',
      topics: [
        {
          title: 'Apache Flink',
          description: 'A true record-at-a-time engine with event-time semantics, rich keyed state, asynchronous checkpoints and Flink SQL; its DataStream and Table APIs, PyFlink, and the job manager and task manager runtime.',
          concepts: ['DataStream and Table APIs', 'Flink SQL and PyFlink', 'JobManager and TaskManagers', 'Where Flink excels'],
          quiz: [
            ['What makes Flink different from micro-batch engines?', 'It processes each record as it arrives with native event-time support.'],
            ['What runs a Flink job\'s tasks?', 'TaskManagers, coordinated by the JobManager.'],
          ],
        },
        {
          title: 'Spark Structured Streaming',
          description: 'Streaming as an unbounded DataFrame processed in micro-batches (or continuous mode) with the same API as batch; watermarks, output modes, checkpoint directories and its natural fit when Spark already runs batch.',
          concepts: ['Unbounded DataFrame model', 'Output modes: append, update, complete', 'Checkpoint location', 'Unified batch and stream code'],
          quiz: [
            ['Which output mode works with aggregations and watermarks?', 'Append after the watermark passes, or update for incremental results.'],
            ['Why is the checkpoint location mandatory?', 'It stores offsets and state needed to restart the query.'],
          ],
          prereqs: ['Apache Flink'],
        },
        {
          title: 'Kafka Streams and lightweight processors',
          description: 'Kafka Streams runs as a library inside your service with state backed by changelog topics; simpler to deploy, Kafka-only, and scaled by partitions; when a library beats a cluster.',
          concepts: ['Library not cluster', 'Changelog-backed state', 'Kafka-only sources and sinks', 'Choosing a library engine'],
          quiz: [
            ['How does Kafka Streams scale?', 'Run more instances; partitions are split among them.'],
            ['What is its main limitation?', 'Input and output must be Kafka topics.'],
          ],
          prereqs: ['Spark Structured Streaming'],
        },
        {
          title: 'Comparing engines for a workload',
          description: 'A matrix of latency, state size, SQL support, operational burden, language bindings and ecosystem; picking Flink, Spark, Kafka Streams or a managed service by the actual requirements rather than fashion.',
          concepts: ['Latency and throughput needs', 'State size and complexity', 'Team language and operations', 'Managed offerings'],
          quiz: [
            ['Which engine for sub-second per-event processing with large state?', 'Flink.'],
            ['Which engine if the team already runs Spark batch on Databricks?', 'Spark Structured Streaming.'],
          ],
          prereqs: ['Kafka Streams and lightweight processors'],
        },
        {
          title: 'Lambda architecture',
          description: 'A batch layer recomputes accurate views from all data while a speed layer serves recent results from a stream; the serving layer merges them, at the cost of maintaining two codebases with the same logic.',
          concepts: ['Batch, speed and serving layers', 'Merging batch and real-time views', 'Dual codebase problem', 'When lambda still fits'],
          quiz: [
            ['What is the main cost of lambda?', 'Two implementations of the same logic that must agree.'],
            ['Why did lambda exist?', 'Early stream engines could not be trusted for accuracy, so batch corrected them.'],
          ],
          prereqs: ['Comparing engines for a workload'],
        },
        {
          title: 'Kappa architecture',
          description: 'One streaming pipeline handles both real-time and historical data by replaying the log; requirements on retention, replay throughput and reprocessing strategy, and the cases where batch still wins.',
          concepts: ['Single stream codebase', 'Replay from a retained log', 'Reprocessing by parallel job', 'Kappa limits and hybrids'],
          quiz: [
            ['How does kappa recompute history?', 'Start a new job from the beginning of the log and switch consumers when it catches up.'],
            ['What does kappa require of the log?', 'Long retention and enough throughput for replays.'],
          ],
          prereqs: ['Lambda architecture'],
        },
      ],
    },
    {
      title: 'Joins, Late Data and Backpressure',
      description: 'The hard problems that separate toy streaming jobs from production ones.',
      topics: [
        {
          title: 'Stream-stream joins',
          description: 'Joining two streams needs both sides buffered in state within a time bound (orders joined to payments within 30 minutes); interval and window joins, and how the watermark clears the buffers.',
          concepts: ['Interval joins with time bounds', 'Windowed joins', 'State for both sides', 'Watermark-driven cleanup'],
          quiz: [
            ['Why must a stream-stream join have a time bound?', 'Without it both sides must be kept forever.'],
            ['What happens to an order whose payment never arrives?', 'It is dropped by an inner join or emitted with nulls by an outer join when the bound expires.'],
          ],
        },
        {
          title: 'Stream-table and enrichment joins',
          description: 'Enriching events with a changing reference table (user profiles, prices): temporal joins that pick the version valid at event time, versus lookup joins against an external store with caching.',
          concepts: ['Temporal join semantics', 'Changelog tables as state', 'Lookup joins with cache', 'Versioned reference data'],
          quiz: [
            ['What does a temporal join guarantee?', 'Each event is joined to the table version valid at its event time.'],
            ['When is a lookup join acceptable?', 'When the reference is small or slow-changing and slight staleness is fine.'],
          ],
          prereqs: ['Stream-stream joins'],
        },
        {
          title: 'Late and out-of-order data',
          description: 'Events arriving after the watermark are late: options are drop, side-output for reconciliation, update the result with allowed lateness, or correct later in batch; measuring lateness to tune the watermark.',
          concepts: ['Late event definition', 'Side outputs for late data', 'Updating results after emission', 'Measuring lateness distribution'],
          quiz: [
            ['What is the safest default for late events?', 'Route them to a side output so nothing is silently lost.'],
            ['How do you pick the watermark delay?', 'From the observed lateness distribution, such as the 99th percentile.'],
          ],
          prereqs: ['Stream-table and enrichment joins'],
        },
        {
          title: 'Backpressure',
          description: 'When a downstream operator is slower than upstream, buffers fill and the engine slows the source; recognising backpressure in metrics, finding the slow operator, and fixing it with parallelism, async I/O or batching.',
          concepts: ['Backpressure propagation', 'Spotting the slow operator', 'Async I/O for external calls', 'Scaling the bottleneck'],
          quiz: [
            ['What does high backpressure on an operator mean?', 'It is waiting to send because the next operator cannot keep up.'],
            ['Why is a synchronous database call in an operator a problem?', 'It blocks the thread per event, throttling the whole pipeline.'],
          ],
          prereqs: ['Late and out-of-order data'],
        },
        {
          title: 'Deduplication and ordering repair',
          description: 'Upstream retries create duplicates and network paths reorder events; dedupe by id with bounded state, and per-key reordering buffers that release events in event-time order after a delay.',
          concepts: ['Dedupe with bounded state', 'Reordering buffers per key', 'Trade-off between delay and order', 'Idempotent downstream design'],
          quiz: [
            ['How long should a dedupe state keep ids?', 'At least as long as the upstream retry window.'],
            ['What does a reordering buffer cost?', 'Added latency equal to the buffer delay.'],
          ],
          prereqs: ['Backpressure'],
        },
      ],
    },
    {
      title: 'Testing and Monitoring Streaming Jobs',
      description: 'Proving a job is right and knowing when it stops being right.',
      topics: [
        {
          title: 'Unit testing operators and functions',
          description: 'Testing window and state logic with test harnesses that feed events with explicit timestamps and watermarks, asserting outputs per firing without running a cluster.',
          concepts: ['Test harnesses for operators', 'Injecting timestamps and watermarks', 'Asserting per-firing output', 'Testing timers and TTL'],
          quiz: [
            ['How do you test a window closes correctly?', 'Feed events, advance the watermark past the window end and assert the emitted result.'],
            ['Why not test with wall-clock time?', 'Tests become slow and non-deterministic.'],
          ],
        },
        {
          title: 'Integration tests with embedded Kafka and mini-clusters',
          description: 'Running the job against a local Kafka in Docker or a mini-cluster with recorded input and expected output, including a failure injection to verify recovery from a checkpoint.',
          concepts: ['Embedded or Docker Kafka', 'Recorded input fixtures', 'Golden output comparison', 'Failure injection and recovery'],
          quiz: [
            ['What proves exactly-once in a test?', 'Killing the job mid-run and checking output matches an unbroken run.'],
            ['Why keep recorded input fixtures?', 'Reproducible tests for edge cases seen in production.'],
          ],
          prereqs: ['Unit testing operators and functions'],
        },
        {
          title: 'Consumer lag and end-to-end latency',
          description: 'Lag per partition shows the job is falling behind; end-to-end latency (event time to output time) shows what users experience; alerting on both trend and absolute values.',
          concepts: ['Lag per partition', 'Event-to-output latency', 'Alerting on trend', 'Correlating lag with backpressure'],
          quiz: [
            ['Can lag be zero while latency is high?', 'Yes, if the job is keeping up but the watermark delay is long.'],
            ['What does steadily rising lag indicate?', 'Throughput is below the input rate; the job needs scaling or fixing.'],
          ],
          prereqs: ['Integration tests with embedded Kafka and mini-clusters'],
        },
        {
          title: 'Checkpoint health and job metrics',
          description: 'Checkpoint duration, size and failure count, restart counts, watermark progress per operator and state size; the dashboard a streaming team watches and what each anomaly usually means.',
          concepts: ['Checkpoint duration and size', 'Restart and failure counts', 'Watermark progress per operator', 'Dashboard for a streaming job'],
          quiz: [
            ['What does a stalled watermark on one operator suggest?', 'An idle source partition or a slow upstream operator.'],
            ['What does growing checkpoint size mean?', 'State is growing, likely missing TTL or cleanup.'],
          ],
          prereqs: ['Consumer lag and end-to-end latency'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: clickstream sessionisation',
          description: 'Consume page-view events from Kafka, sessionise them per user with a 30-minute gap, compute session length and page count, route late events to a side topic, and write sessions to Postgres idempotently with PyFlink or Spark.',
          concepts: ['Generate and produce events', 'Implement session windows', 'Handle late events via side output', 'Upsert sessions to Postgres'],
          quiz: [
            ['Why upsert sessions by session id?', 'A merged or updated session overwrites its earlier version.'],
            ['How do you verify sessionisation?', 'Compare against a batch SQL sessionisation of the same data.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: real-time fraud rules with state',
          description: 'A keyed stream of card transactions with rules such as more than five transactions in two minutes or two countries within an hour, using keyed state and timers, exactly-once output to Kafka, and tests with a harness.',
          concepts: ['Model the rules as state', 'Use timers for expiry', 'Emit alerts transactionally', 'Harness tests per rule'],
          quiz: [
            ['What state does the velocity rule need?', 'Recent transaction timestamps per card, cleared by timer.'],
            ['Why exactly-once for alerts?', 'Duplicate alerts trigger duplicate actions on customers.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: batch and stream metrics that agree',
          description: 'Compute hourly revenue both as a Spark batch job over Parquet and as a streaming job with tumbling windows and watermarks, compare results, quantify late-data differences, and document a reconciliation process.',
          concepts: ['Batch hourly aggregation', 'Streaming hourly aggregation', 'Reconciliation query', 'Late-data policy write-up'],
          quiz: [
            ['Why might batch and stream totals differ?', 'Late events dropped or assigned differently by the stream job.'],
            ['How do you close the gap?', 'Increase allowed lateness or run a batch correction for closed hours.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: stream enrichment with a temporal join',
          description: 'Join a stream of orders to a CDC changelog of product prices using a temporal join in Flink SQL so each order uses the price valid at order time, then land results to Parquet with exactly-once file commits.',
          concepts: ['Ingest the price changelog', 'Write the temporal join', 'Sink to files with checkpoints', 'Validate historical correctness'],
          quiz: [
            ['What ensures the historical price is used?', 'The temporal join picks the version valid at the order\'s event time.'],
            ['When do output files become visible?', 'On checkpoint completion.'],
          ],
          style: 'project',
        },
        {
          title: 'Streaming interview questions',
          description: 'Explaining watermarks, why event time matters, window types and their state cost, exactly-once boundaries, how checkpoints work, backpressure diagnosis, and when batch is the better answer.',
          concepts: ['Time and watermark questions', 'Windowing and state questions', 'Fault tolerance questions', 'Explaining engine choice'],
          quiz: [
            ['Explain a watermark in one sentence.', 'A claim that no earlier events will arrive, letting windows close.'],
            ['What is the difference between a checkpoint and a savepoint?', 'Automatic periodic recovery point versus a manual one for upgrades and rescaling.'],
          ],
          style: 'reading',
        },
        {
          title: 'Streaming system design walkthroughs',
          description: 'Design exercises done aloud: real-time leaderboard, anomaly detection on sensor data, and order-to-shipment tracking, covering keys, windows, state, guarantees, late data and scale numbers.',
          concepts: ['Deriving keys and windows from requirements', 'State and guarantee decisions', 'Late data policy per design', 'Capacity and cost estimates'],
          quiz: [
            ['How would you design a top-10 leaderboard updated every second?', 'Keyed aggregation per player, windowed top-N, sliding window emitted every second.'],
            ['What do you ask about late data?', 'How late is possible and whether corrections are acceptable after emission.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
