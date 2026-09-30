import { defineTrack } from '../define'

export const spark = defineTrack({
  id: 'track-spark',
  title: 'Apache Spark',
  description: 'Distributed data processing at scale with Apache Spark and PySpark: cluster architecture, RDDs vs DataFrames, transformations vs actions, Catalyst optimizer, shuffle partitions, broadcast joins, memory management, Spark UI diagnostics, Structured Streaming, and Delta Lake integration.',
  family: 'Data Engineering',
  kind: 'tooling',
  icon: '⚡',
  tags: ['spark', 'pyspark', 'distributed-systems', 'big-data', 'catalyst', 'dataframes', 'structured-streaming', 'delta-lake'],
  languages: ['Python', 'SQL'],
  explainMode: 'data',
  code: { label: 'PySpark (Python)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python-data-engineering', 'track-advanced-sql'],
  style: 'code',
  categories: [
    {
      title: 'Architecture and Execution Model',
      description: 'How Spark runs distributed compute across clusters and coordinates jobs.',
      topics: [
        {
          title: 'The Spark cluster: Driver, Executors and Cluster Managers',
          description: 'A Spark application runs as independent processes on a cluster: the driver program creates the SparkSession, schedules tasks, and coordinates with cluster managers (Kubernetes, YARN, or Standalone) to launch worker executor JVMs that run compute and store cache.',
          concepts: [
            'Driver node responsibilities: DAGScheduler and TaskScheduler',
            'Executor processes: Cores and heap memory',
            'Cluster managers: Kubernetes, YARN, and Standalone',
            'Client mode versus Cluster mode deployment',
          ],
          quiz: [
            ['Where does main() execute in Cluster mode?', 'On one of the worker nodes inside the ApplicationMaster / Driver container.'],
            ['What happens when an executor crashes?', 'The driver requests a replacement from the cluster manager and recomputes missing partitions from lineage.'],
          ],
        },
        {
          title: 'SparkSession, SparkContext and configuration',
          description: 'SparkSession is the unified entry point introduced in Spark 2.0 replacing SQLContext and HiveContext, wrapping SparkContext. Initialising it with builder patterns, setting master URLs, and configuring executor memory and shuffle partitions.',
          concepts: [
            'SparkSession.builder pattern',
            'Accessing underlying SparkContext and SQLContext',
            'Runtime configuration via spark.conf.set',
            'Reading default configs from spark-defaults.conf',
          ],
          quiz: [
            ['How do you obtain a SparkSession in PySpark?', 'SparkSession.builder.appName("...").getOrCreate().'],
            ['Can multiple SparkSessions share one SparkContext?', 'Yes, multiple sessions can share the same underlying JVM SparkContext and cached tables.'],
          ],
          prereqs: ['The Spark cluster: Driver, Executors and Cluster Managers'],
        },
        {
          title: 'Transformations versus Actions and Lazy Evaluation',
          description: 'Transformations (map, filter, select, groupBy) build an execution plan lazily without moving data; actions (count, collect, show, write) trigger the computation graph to actually execute on cluster workers.',
          concepts: [
            'Lazy evaluation: building the DAG before computation',
            'Narrow transformations (filter, select, map)',
            'Wide transformations requiring network shuffles',
            'Actions returning data to the driver',
            'Actions writing to persistent storage',
          ],
          quiz: [
            ['Does df.filter(col("x") > 10) trigger a job?', 'No, filter is a transformation; computation begins only when an action like count() or write() is invoked.'],
            ['Why is df.collect() dangerous on large datasets?', 'It pulls all partition data across the cluster into the driver memory, risking Driver OutOfMemory (OOM).'],
          ],
          prereqs: ['SparkSession, SparkContext and configuration'],
        },
        {
          title: 'The Lineage Graph and Fault Tolerance',
          description: 'Spark tracks the history of transformations applied to datasets in a Directed Acyclic Graph (DAG) lineage. If a worker node crashes mid-job, lost partitions are recomputed automatically from upstream lineage without restarting the whole job.',
          concepts: [
            'Lineage tracking: RDD and DataFrame dependencies',
            'Recomputation of lost partitions',
            'Checkpoints vs cache for breaking lineage',
            'Inspection via rdd.toDebugString()',
          ],
          quiz: [
            ['How does Spark achieve fault tolerance without replicating intermediate data?', 'By recording lineage instructions so any lost partition can be recomputed from source.'],
            ['When should you call df.checkpoint() instead of df.cache()?', 'When lineage becomes too deep (e.g., in recursive or graph algorithms) and risks StackOverflowError.'],
          ],
          prereqs: ['Transformations versus Actions and Lazy Evaluation'],
        },
      ],
    },
    {
      title: 'PySpark DataFrames and Spark SQL',
      description: 'Structured operations, schemas, built-in functions, and SQL integration.',
      topics: [
        {
          title: 'Schemas and StructType: Enforcing types on read',
          description: 'Inferring schemas on multi-gigabyte files forces Spark to make a full pass over the data before processing; defining an explicit StructType with StructFields eliminates schema inference overhead and guarantees data type contracts.',
          concepts: [
            'StructType and StructField definitions',
            'Handling nullable fields and schema enforcement',
            'Reading files with explicit schemas',
            'Handling corrupt records via parsing modes',
          ],
          quiz: [
            ['Why avoid inferSchema=True in production jobs?', 'It forces an extra read pass over the entire dataset, degrading job runtime and memory.'],
            ['What does PERMISSIVE mode do with unparseable JSON rows?', 'Puts the raw unparseable string into a designated _corrupt_record column without crashing.'],
          ],
        },
        {
          title: 'DataFrame operations: Projections, filters and column expressions',
          description: 'Writing idiomatic PySpark with functions from pyspark.sql.functions: select, withColumn, withColumnRenamed, when/otherwise conditionals, regex extraction, array manipulation, and date calculations.',
          concepts: [
            'Column expressions with F.col() vs strings',
            'Conditional branching with F.when().otherwise()',
            'Working with arrays: explode, array_contains, size',
            'Date and timestamp parsing functions',
          ],
          quiz: [
            ['Why avoid chaining dozens of withColumn calls?', 'Each withColumn creates a new DataFrame projection node in the logical plan; use select with multiple expressions instead.'],
            ['What does F.explode(col("items")) do?', 'Generates a new row for each element in the given array or map column.'],
          ],
          prereqs: ['Schemas and StructType: Enforcing types on read'],
        },
        {
          title: 'Aggregations and Groupings in PySpark',
          description: 'Grouping distributed rows: groupBy, agg with sum, avg, min, max, countDistinct, approx_count_distinct with HyperLogLog, and multi-dimensional aggregations with rollup and cube.',
          concepts: [
            'groupBy with multiple aggregation functions',
            'Exact countDistinct versus approx_count_distinct',
            'Pivot tables in PySpark',
            'Rollup and cube for hierarchical rollups',
          ],
          quiz: [
            ['When should you use approx_count_distinct over countDistinct?', 'On massive datasets where a 1–2% error rate is acceptable, saving substantial shuffle memory and time.'],
            ['What does df.cube("country", "year").sum("sales") produce?', 'Aggregates for all combinations of (country, year), (country), (year), and total grand sum.'],
          ],
          prereqs: ['DataFrame operations: Projections, filters and column expressions'],
        },
        {
          title: 'Window Functions in PySpark',
          description: 'Computing rankings, running totals, and lead/lag calculations over partitioned windows without collapsing rows using pyspark.sql.window.Window with partitionBy, orderBy, and rangeBetween/rowsBetween frames.',
          concepts: [
            'Window specification with partitionBy and orderBy',
            'Ranking functions: row_number(), rank(), dense_rank()',
            'Value functions: lead(), lag(), first(), last()',
            'Frame definitions with rowsBetween and rangeBetween',
          ],
          quiz: [
            ['What happens if a Window has an orderBy but no rowsBetween frame specified?', 'It defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (running total).'],
            ['How do you find the top 2 highest-paid employees per department?', 'partitionBy("dept").orderBy(desc("salary")), compute row_number(), then filter row_number <= 2.'],
          ],
          prereqs: ['Aggregations and Groupings in PySpark'],
        },
        {
          title: 'Spark SQL queries and Temporary Views',
          description: 'Registering DataFrames as temporary views (createOrReplaceTempView) and querying them with ANSI SQL, combining Python data science workflows with SQL readability and catalog integration.',
          concepts: [
            'createOrReplaceTempView vs createGlobalTempView',
            'Executing queries via spark.sql()',
            'Catalog API: listTables and dropTempView',
            'Mixing PySpark DataFrame syntax with inline SQL',
          ],
          quiz: [
            ['What is the lifespan of createOrReplaceTempView?', 'Tied to the active SparkSession; it disappears when the session stops.'],
            ['Can you query a Hive metastore table directly via spark.sql()?', 'Yes, when SparkSession is created with .enableHiveSupport().'],
          ],
          prereqs: ['Window Functions in PySpark'],
        },
        {
          title: 'User-Defined Functions (UDFs) vs Pandas UDFs',
          description: 'Standard Python UDFs serialize data row-by-row between the JVM and Python worker, causing severe performance bottlenecks. Vectorized Pandas UDFs (pyarrow) operate on batches of Apache Arrow data, achieving near-native performance.',
          concepts: [
            'Standard @udf overhead: JVM serialization penalty',
            'Vectorized Pandas UDFs using Apache Arrow',
            'Series and Iterator Pandas UDF patterns',
            'Prioritizing built-in Spark SQL functions over UDFs',
          ],
          quiz: [
            ['Why are standard Python UDFs slower than built-in Spark SQL functions?', 'Data must be serialized from JVM memory into a Python process row-by-row, bypassing Catalyst optimizations.'],
            ['What technology enables fast vectorization in Pandas UDFs?', 'Apache Arrow columnar in-memory format.'],
          ],
          prereqs: ['Spark SQL queries and Temporary Views'],
        },
      ],
    },
    {
      title: 'Shuffling, Joins and Partitioning Strategies',
      description: 'Understanding network shuffles, optimizing join strategies, and handling data skew.',
      topics: [
        {
          title: 'Narrow vs Wide transformations and the Shuffle Phase',
          description: 'Narrow transformations (map, filter) execute within a single partition without network movement; wide transformations (groupByKey, join, repartition) trigger a shuffle that writes partition data to disk, pulls it across the network, and creates stage boundaries.',
          concepts: [
            'Narrow dependencies and pipelined execution',
            'Wide dependencies and shuffle boundaries',
            'Shuffle write, network fetch, and read mechanics',
            'Stage breaks in the DAG created by shuffles',
          ],
          quiz: [
            ['Why is a shuffle expensive in distributed computing?', 'It involves disk I/O, network data transfer between workers, and serialization/deserialization.'],
            ['Does df.select("user_id", "email") cause a shuffle?', 'No, select is a narrow transformation that runs purely within existing partition boundaries.'],
          ],
        },
        {
          title: 'Tuning Shuffle Partitions: spark.sql.shuffle.partitions',
          description: 'The default 200 shuffle partitions is either too high for small tables (causing hundreds of tiny tasks) or too low for terabyte workloads (causing executor out-of-memory errors); sizing partitions appropriately or leveraging Adaptive Query Execution (AQE).',
          concepts: [
            'The default value of 200 shuffle partitions',
            'Calculating partition target sizes: 100MB to 200MB',
            'Adaptive Query Execution (AQE) partition coalescing',
            'Setting spark.sql.adaptive.enabled=true',
          ],
          quiz: [
            ['What happens if spark.sql.shuffle.partitions is left at 200 for a 1 TB join?', 'Each partition holds ~5 GB of data, exceeding executor memory limits and causing heavy disk spill or OOMs.'],
            ['How does AQE dynamically adjust shuffle partitions?', 'It monitors post-shuffle partition sizes at runtime and coalesces adjacent small partitions automatically.'],
          ],
          prereqs: ['Narrow vs Wide transformations and the Shuffle Phase'],
        },
        {
          title: 'Broadcast Joins and Threshold Tuning',
          description: 'When joining a large table with a small dimension table, Broadcast Hash Join copies the small table to every executor, completely eliminating the expensive shuffle of the large table.',
          concepts: [
            'Broadcast Hash Join (BHJ) mechanics',
            'spark.sql.autoBroadcastJoinThreshold tuning',
            'Explicit hints with broadcast(df) function',
            'Driver OOM risks from large broadcast tables',
          ],
          quiz: [
            ['What join strategy is used when one table is smaller than the broadcast threshold?', 'Broadcast Hash Join (BHJ).'],
            ['Why does broadcast(df) risk crashing the driver?', 'The entire small dataset is collected to the driver node first before being broadcast to workers.'],
          ],
          prereqs: ['Tuning Shuffle Partitions: spark.sql.shuffle.partitions'],
        },
        {
          title: 'Sort Merge Join vs Shuffle Hash Join',
          description: 'How Spark handles large-to-large table joins: Sort Merge Join sorts both datasets by join key and merges them sequentially; Shuffle Hash Join builds an in-memory hash map of one partition and streams the other.',
          concepts: [
            'Sort Merge Join partition sorting and scanning',
            'Shuffle Hash Join: building hash tables per partition',
            'Enabling Shuffle Hash Join via configuration flags',
            'Cost-based optimization when choosing join strategies',
          ],
          quiz: [
            ['What is the default join strategy for two large tables in Spark?', 'Sort Merge Join (SMJ).'],
            ['What phase in Sort Merge Join often causes performance bottlenecks?', 'The sort phase, especially when partition keys are skewed.'],
          ],
          prereqs: ['Broadcast Joins and Threshold Tuning'],
        },
        {
          title: 'Data Skew Detection and Salting Techniques',
          description: 'A single dominant key (e.g., null values or a viral user id) routes the majority of records to one executor task, leaving other workers idle while that task runs for hours or crashes; mitigating skew with salting and AQE skew join handling.',
          concepts: [
            'Detecting task runtime skew in Spark UI',
            'Handling null join keys before joins',
            'Salting keys with random integers for joins',
            'Adaptive Query Execution automatic skew join splitting',
          ],
          quiz: [
            ['How do you spot data skew in the Spark UI?', 'One or two tasks in a stage run for minutes or hours while all other tasks finish in seconds.'],
            ['What is key salting in Spark joins?', 'Appending a random integer (0..N) to the skewed key in table A and replicating rows 0..N in table B.'],
          ],
          prereqs: ['Sort Merge Join vs Shuffle Hash Join'],
        },
        {
          title: 'Repartition versus Coalesce',
          description: 'repartition(N) performs a full shuffle across the network to produce exactly N uniformly sized partitions; coalesce(N) avoids a shuffle by merging adjacent partitions on the same executor, useful when reducing partition counts before writing.',
          concepts: [
            'repartition() with full network shuffle for balancing load',
            'coalesce() without shuffle for shrinking partition counts',
            'Partitioning by specific column expressions',
            'Avoiding single-partition bottlenecks on final writes',
          ],
          quiz: [
            ['Can coalesce() be used to increase the number of partitions?', 'No, coalesce can only decrease partitions without a shuffle; increasing requires repartition().'],
            ['Why run coalesce(10) before writing 100 small files to S3?', 'To prevent the small-file problem while avoiding a full network shuffle.'],
          ],
          prereqs: ['Data Skew Detection and Salting Techniques'],
        },
      ],
    },
    {
      title: 'Catalyst Optimizer, Execution Plans and Storage Formats',
      description: 'Understanding query plans, physical execution, and columnar storage efficiency.',
      topics: [
        {
          title: 'Catalyst Optimizer: Logical to Physical Plans',
          description: 'The Catalyst optimizer translates DataFrame and SQL code through four phases: Unresolved Logical Plan (syntax check), Resolved Logical Plan (catalog lookup), Optimized Logical Plan (predicate pushdown, projection pruning), and Physical Plan generation.',
          concepts: [
            'Abstract Syntax Trees (AST) and Catalyst rules',
            'Predicate pushdown: filtering data at storage layer',
            'Projection pruning: reading only requested columns',
            'Cost-Based Optimizer (CBO) and table statistics',
          ],
          quiz: [
            ['What is predicate pushdown?', 'Pushing WHERE/filter conditions down to the file format (Parquet/ORC) so non-matching row groups are skipped.'],
            ['What role does table statistics play in Catalyst?', 'It enables the Cost-Based Optimizer to choose the best join strategy and join order.'],
          ],
        },
        {
          title: 'Reading Execution Plans with explain()',
          description: 'Inspecting df.explain(mode="formatted") to audit physical operators: FileScan, BroadcastExchange, HashAggregate, SortMergeJoin, and detecting unintended shuffles or missing predicate pushdowns.',
          concepts: [
            'explain(mode="simple") vs explain(mode="formatted")',
            'Spotting WholeStageCodegen operators in plans',
            'Verifying PushedFilters in FileScan nodes',
            'Detecting Exchange nodes that indicate network shuffles',
          ],
          quiz: [
            ['What does an "Exchange" operator in an execution plan represent?', 'A network shuffle of data across executor nodes.'],
            ['What does "*" next to an operator name (e.g. *HashAggregate) mean?', 'Whole-stage Java bytecode generation (Tungsten) is enabled for that operator.'],
          ],
          prereqs: ['Catalyst Optimizer: Logical to Physical Plans'],
        },
        {
          title: 'Columnar Formats: Parquet and ORC in Spark',
          description: 'Parquet stores data in columnar row groups with dictionary encoding, run-length encoding, and min/max column statistics, enabling Spark to read only required byte offsets and skip whole row groups.',
          concepts: [
            'Row groups, column chunks, and dictionary encoding',
            'Min/max statistics for data skipping',
            'Snappy, GZIP, and Zstandard compression algorithms',
            'Handling schema evolution in Parquet reads',
          ],
          quiz: [
            ['Why is Parquet drastically faster than CSV for analytics queries?', 'Columnar format reads only queried columns and skips unneeded row groups using embedded statistics.'],
            ['What is the default compression codec for Parquet in Spark?', 'Snappy (balanced speed and compression ratio).'],
          ],
          prereqs: ['Reading Execution Plans with explain()'],
        },
        {
          title: 'Partitioning and Bucketing on Disk',
          description: 'partitionBy("year", "month") creates physical subdirectories on object storage for directory pruning; bucketBy(numBuckets, "col") pre-hashes and pre-sorts records into fixed buckets, eliminating shuffles in frequent joins.',
          concepts: [
            'Choosing low-to-medium cardinality partition keys',
            'Partition pruning during query planning',
            'Bucketing: pre-sorting and pre-partitioning tables by hash',
            'Avoiding excessive partitions (the small file problem)',
          ],
          quiz: [
            ['What happens if you partition a table by a high-cardinality column like user_id?', 'It creates millions of tiny directories and files, overwhelming cloud storage metadata and file listing performance.'],
            ['How does bucketing speed up subsequent joins between two tables?', 'If both tables are bucketed on the join key with the same number of buckets, Spark joins them without any shuffle.'],
          ],
          prereqs: ['Columnar Formats: Parquet and ORC in Spark'],
        },
      ],
    },
    {
      title: 'Memory Management, Spill and the Spark UI',
      description: 'Diagnosing executor bottlenecks, garbage collection, and memory architecture.',
      topics: [
        {
          title: 'The Unified Memory Manager: Execution vs Storage Memory',
          description: 'Spark reserves memory in each executor JVM divided into: Reserved Memory (300MB), User Memory (user data structures and UDFs), and Spark Memory (Execution for shuffles/joins and Storage for cached DataFrames), sharing a dynamic boundary.',
          concepts: [
            'spark.executor.memory and spark.memory.fraction tuning',
            'Execution memory for shuffles and joins',
            'Storage memory for cached data and broadcasts',
            'Dynamic borrowing between execution and storage memory',
          ],
          quiz: [
            ['Can Execution memory evict cached DataFrames from Storage memory?', 'Yes, if execution needs memory, cached partitions are dropped to disk or freed.'],
            ['What is the default value of spark.memory.fraction?', '0.6 (60% of available executor heap after reserved memory).'],
          ],
        },
        {
          title: 'Memory Spill: Detection, Causes and Remedies',
          description: 'When an aggregation or sort exceeds available execution memory, Spark spills intermediate partition data to disk (Spill Memory vs Spill Disk), degrading throughput by orders of magnitude; tuning partitions, reducing memory footprint, and avoiding Cartesian products.',
          concepts: [
            'Spill to disk from RAM exhaustion',
            'Compressed serialized bytes written to local disk',
            'Identifying spills in the Spark UI Stage view',
            'Increasing shuffle partitions to mitigate memory spill',
          ],
          quiz: [
            ['What does "Spill (Memory)" in the Spark UI indicate?', 'The size of data in RAM before it had to be written to disk due to insufficient execution memory.'],
            ['Why is Spill (Disk) usually smaller than Spill (Memory)?', 'Data is compressed and serialized before being written to disk.'],
          ],
          prereqs: ['The Unified Memory Manager: Execution vs Storage Memory'],
        },
        {
          title: 'Mastering the Spark UI for Performance Debugging',
          description: 'Navigating the Spark UI tabs: Jobs, Stages, Tasks, Storage, Environment, and Executors; interpreting event timelines, GC time, shuffle read/write sizes, and identifying the slowest 1% of tasks.',
          concepts: [
            'Reading Event Timeline for task and shuffle latency',
            'Diagnosing long Garbage Collection pauses in tasks',
            'Auditing Executor tab for failed task rates',
            'Storage tab cache inspection for memory residence',
          ],
          quiz: [
            ['What does high "Task Deserialization Time" signify?', 'Heavy dependencies, large broadcast variables, or closure size serialized from the driver.'],
            ['What percentage of task runtime spent in GC signals a problem?', 'More than 10% indicates heavy JVM GC pressure and requires heap tuning or off-heap memory.'],
          ],
          prereqs: ['Memory Spill: Detection, Causes and Remedies'],
        },
        {
          title: 'Diagnosing OutOfMemory (OOM) Errors in Spark',
          description: 'Troubleshooting Driver OOM (df.collect(), large broadcasts, unconstrained schema inference) versus Executor OOM (spill exhaustion, oversized partitions, container killed by YARN/K8s over memoryOverhead).',
          concepts: [
            'Driver OOM root causes and fixes',
            'Executor heap exhaustion during large groupBys',
            'Container killed by YARN: memoryOverhead limits',
            'Best practices for safe aggregation and writing',
          ],
          quiz: [
            ['What causes "Container killed by YARN for exceeding memory limits"?', 'Off-heap memory, Python worker memory, or JVM native memory exceeded spark.executor.memoryOverhead.'],
            ['How do you prevent driver OOM when sampling data?', 'Use df.take(100) or df.limit(100).collect() instead of df.collect().'],
          ],
          prereqs: ['Mastering the Spark UI for Performance Debugging'],
        },
      ],
    },
    {
      title: 'Structured Streaming and Lakehouse Integration',
      description: 'Real-time micro-batch processing, watermarking, and ACID lakehouses.',
      topics: [
        {
          title: 'Structured Streaming Fundamentals and Sources',
          description: 'Processing real-time streaming data with the same DataFrame API used for batch: reading from Kafka, Amazon Kinesis, or file directory sources with spark.readStream.',
          concepts: [
            'The stream as an unbounded table',
            'Micro-batch engine versus Continuous Processing engine',
            'Reading from Kafka with subscribe and offsets',
            'Output modes: Append, Update, Complete',
          ],
          quiz: [
            ['What output mode is allowed for streaming queries with no aggregations?', 'Append mode.'],
            ['Can you perform standard join operations on streaming DataFrames?', 'Yes, stream-to-static and stream-to-stream joins are both supported.'],
          ],
        },
        {
          title: 'Event-Time Processing and Watermarking',
          description: 'Handling out-of-order and late-arriving events in streaming pipelines: using withWatermark("timestamp", "10 minutes") to bound state store size and discard events older than the threshold.',
          concepts: [
            'Processing time vs Event time',
            'Windowed streaming aggregations over time frames',
            'Watermark threshold calculation',
            'State store memory cleanup: evicting expired state',
          ],
          quiz: [
            ['What is a watermark in Structured Streaming?', 'A threshold defining how long the engine waits for late-arriving data before dropping it from state memory.'],
            ['What happens to an event whose timestamp is older than current watermark?', 'It is dropped and excluded from the aggregation.'],
          ],
          prereqs: ['Structured Streaming Fundamentals and Sources'],
        },
        {
          title: 'Streaming Sinks and Checkpoint Directories',
          description: 'Writing stream outputs reliably: file sinks, Kafka sinks, Delta Lake sinks, and ensuring end-to-end fault tolerance and exactly-once processing using checkpointLocation and Write-Ahead Logs (WAL).',
          concepts: [
            'Configuring writeStream with format and checkpoint location',
            'Trigger types: default, ProcessingTime, and AvailableNow',
            'Restarting streams from saved offsets without duplication',
            'Idempotent sinks for end-to-end exactly-once guarantees',
          ],
          quiz: [
            ['Why is a checkpoint directory mandatory for production Structured Streaming?', 'It records processed offsets and state to durable storage for fault recovery and exactly-once guarantees.'],
            ['What does Trigger.AvailableNow() do?', 'Processes all available data in micro-batches and then terminates cleanly, ideal for cost-effective scheduled streaming.'],
          ],
          prereqs: ['Event-Time Processing and Watermarking'],
        },
        {
          title: 'Delta Lake & Lakehouse Integration: ACID, Time Travel and MERGE',
          description: 'Replacing raw Parquet lakes with Delta Lake on top of Spark: ACID transactions, transaction log (_delta_log), time travel queries (VERSION AS OF), schema enforcement, and atomic upserts with MERGE INTO.',
          concepts: [
            'The Delta transaction log: JSON commits and checkpoints',
            'ACID transactions: serializable isolation guarantees',
            'MERGE INTO syntax for SCD Type 2',
            'Time travel: querying historical table snapshots',
            'OPTIMIZE and Z-ORDER BY for file compaction',
          ],
          quiz: [
            ['What file manages ACID transactions in a Delta Lake table?', 'The _delta_log directory containing ordered JSON commit files and periodic checkpoints.'],
            ['What does the OPTIMIZE table ZORDER BY (col) command do in Delta Lake?', 'Compacts small files into ~1GB files and orders data along multidimensional curves to maximize file skipping.'],
          ],
          prereqs: ['Streaming Sinks and Checkpoint Directories'],
        },
      ],
    },
    {
      title: 'Production Deployment, Sizing and CI/CD',
      description: 'Sizing clusters, writing spark-submit scripts, and unit testing pipelines.',
      topics: [
        {
          title: 'Cluster Sizing and spark-submit Configuration',
          description: 'Sizing executors for optimal throughput: avoiding fat executors (memory overhead and GC pauses) and tiny executors (no broadcast efficiency); configuring --num-executors, --executor-cores (recommended 4–5), and --executor-memory.',
          concepts: [
            'The 5-cores per executor rule for I/O',
            'Calculating driver and executor memory overhead limits',
            'Dynamic Resource Allocation: scaling executors automatically',
            'Crafting production spark-submit commands',
          ],
          quiz: [
            ['Why is setting 16 or 32 cores per executor discouraged in Spark?', 'Executors with excessive cores suffer severe JVM garbage collection pauses that stall all running tasks.'],
            ['What does Dynamic Resource Allocation do?', 'Scales the number of running executors up during heavy stages and down when idle, minimizing cloud costs.'],
          ],
        },
        {
          title: 'Unit Testing PySpark Pipelines with Chispa and Pytest',
          description: 'Writing maintainable unit tests for data transformation logic: spinning up a shared local SparkSession with pytest fixtures, asserting DataFrame equality with chispa (assert_df_equality), and testing schema edge cases.',
          concepts: [
            'Creating a module-scoped local SparkSession test fixture',
            'Isolating pure transformation functions from I/O operations',
            'Testing DataFrame schemas, null values, and corner cases',
            'chispa assertion utilities for readable diffs',
          ],
          quiz: [
            ['Why should business logic transformations be written as pure functions taking and returning DataFrames?', 'So they can be unit-tested locally on sample data without connecting to production databases or cloud storage.'],
            ['How should SparkSession be managed in a pytest suite?', 'Created once with session scope or module scope and reused across tests to avoid repeated JVM startup overhead.'],
          ],
          prereqs: ['Cluster Sizing and spark-submit Configuration'],
        },
        {
          title: 'Continuous Integration and Deployment for Spark Applications',
          description: 'Packaging PySpark pipelines as Python wheels or zip archives, linting with ruff, running automated tests in GitHub Actions CI, and orchestrating deployment across development, staging, and production clusters.',
          concepts: [
            'Packaging dependencies with pyproject.toml and wheels',
            'Passing --py-files to spark-submit for custom modules',
            'Automated CI pipelines running pytest in containers',
            'Triggering production runs via Airflow SparkSubmitOperator',
          ],
          quiz: [
            ['How do you distribute custom Python utility modules to all Spark worker nodes?', 'Pass the packaged .zip or .whl file using the --py-files argument in spark-submit.'],
            ['What should a CI/CD pipeline for Spark validate before deployment?', 'Linting, type checks, and unit tests using a local SparkSession fixture.'],
          ],
          prereqs: ['Unit Testing PySpark Pipelines with Chispa and Pytest'],
        },
      ],
    },
  ],
})
