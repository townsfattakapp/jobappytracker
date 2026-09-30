import { defineTrack } from '../define'

export const dataEngineeringProjects = defineTrack({
  id: 'track-data-engineering-projects',
  title: 'Data Engineering Projects',
  description: 'Twenty-five end-to-end, resume-grade data engineering capstone projects covering batch data pipelines, real-time Kafka streaming, lakehouse architectures with Apache Iceberg and Delta Lake, Airflow orchestration, dbt transformations, and cloud infrastructure as code.',
  family: 'Data Engineering',
  kind: 'projects',
  icon: '🛠️',
  tags: ['projects', 'portfolio', 'data-engineering', 'spark', 'kafka', 'airflow', 'dbt', 'lakehouse', 'iceberg', 'aws', 'snowflake'],
  languages: ['Python', 'SQL'],
  explainMode: 'data',
  code: { label: 'Python or SQL data engineering code', id: 'python', fixed: false },
  supports: { coding: true, project: true },
  prerequisites: ['track-python-data-engineering', 'track-advanced-sql', 'track-airflow', 'track-dbt'],
  style: 'project',
  categories: [
    {
      title: 'Batch Pipelines and Data Warehousing',
      description: 'End-to-end batch ingestion, dimensional modeling, and warehouse loading.',
      topics: [
        {
          title: 'E-commerce transactional data pipeline with PostgreSQL, S3 and Snowflake',
          description: 'Extract raw transactions from PostgreSQL, stage chunked columnar Parquet files into Amazon S3, and load them into a Snowflake staging layer using COPY INTO. Transform the staging data into a Kimball Star Schema with dimension and fact tables, verified with reconciliation tests.',
          concepts: [
            'Incremental extraction using updated_at watermarks',
            'Converting JSON to Parquet with pyarrow',
            'S3 partition structure by year and month',
            'Snowflake COPY INTO automated staging loads',
            'Star Schema modeling for orders and products',
          ],
          quiz: [
            ['How do you make the ingestion step idempotent?', 'Using watermark filtering (updated_at >= :last_watermark) and deduplicating on primary keys during merge.'],
            ['Why stage data as Parquet in S3 instead of writing directly into Snowflake?', 'S3 acts as an immutable data lake backup and decouples extract workloads from warehouse compute costs.'],
          ],
        },
        {
          title: 'Slowly Changing Dimensions (SCD Type 2) financial ledger in dbt',
          description: 'Build a production SCD Type 2 dimension model for employee departments or customer addresses using dbt snapshots. Track historical state transitions with valid_from, valid_to, and is_current boolean flags, guaranteeing point-in-time financial audit reporting.',
          concepts: [
            'dbt snapshot configuration with timestamp strategy',
            'Generating surrogate keys with dbt_utils',
            'Managing valid_from and valid_to timestamp ranges',
            'Writing point-in-time join queries for audits',
          ],
          quiz: [
            ['What strategy in dbt snapshots detects changes by comparing hash values of specific columns?', 'The "check" strategy.'],
            ['What value should valid_to hold for the currently active record?', 'Either NULL or a far-future sentinel timestamp (e.g. 9999-12-31).'],
          ],
        },
        {
          title: 'Daily flight delay and weather dimensional warehouse',
          description: 'Ingest flight delay datasets and public weather observation data. Normalize timestamps to UTC, map weather coordinates to nearest airport codes using Haversine distance, and populate a Star Schema warehouse answering how precipitation impacts turnaround times.',
          concepts: [
            'Ingesting multi-gigabyte public CSV datasets',
            'Geographic coordinate matching and spatial join',
            'Forward-fill window functions for missing sensor readings',
            'Modeling flight operations facts and dimensions',
          ],
          quiz: [
            ['Why convert all flight timestamps (departure, arrival) to UTC?', 'Airports span multiple time zones; calculating true flight duration requires a unified temporal reference.'],
            ['How do you handle missing sensor observations in weather metrics?', 'Using window functions with LAG() IGNORE NULLS or forward-filling within a bounded time threshold.'],
          ],
        },
        {
          title: 'Serverless AWS data lake with S3, AWS Glue and Athena',
          description: 'Deploy a serverless data lake ingestion pipeline: raw JSON records arrive in an S3 landing bucket, an AWS Glue Crawler infers the schema and updates the AWS Glue Data Catalog, and analytics users query partitioned Parquet datasets directly using Amazon Athena.',
          concepts: [
            'S3 bucket structure with Hive partitioning',
            'AWS Glue Crawler configuration and schema evolution',
            'Glue ETL jobs converting JSON to Parquet',
            'Athena partition projection to eliminate metastore throttling',
          ],
          quiz: [
            ['What is the benefit of Athena partition projection over standard Glue partitions?', 'It computes partition locations directly from configured patterns, bypassing slow metastore partition API calls on tables with thousands of partitions.'],
            ['How do you minimize Amazon Athena scan costs?', 'Convert data to columnar Parquet and enforce WHERE clauses on partitioned columns.'],
          ],
        },
        {
          title: 'Customer 360 identity resolution pipeline in PySpark',
          description: 'Resolve fragmented customer profiles across web visits, mobile app events, and CRM databases into a unified Golden Record. Use exact email matching and fuzzy phone/name similarity matching to link disparate customer IDs into a single master identity table.',
          concepts: [
            'Deterministic matching on hashed emails and phones',
            'Probabilistic matching with Jaro-Winkler string similarity',
            'Graph connected components for identity clustering',
            'Producing master customer dim tables for analytics',
          ],
          quiz: [
            ['How does connected components clustering help identity resolution?', 'It links indirect relationships (e.g. Account A shares phone with B, B shares email with C) into one cluster.'],
            ['Why use normalized and hashed emails during matching?', 'To eliminate whitespace/case discrepancies while protecting PII privacy during pipeline stages.'],
          ],
        },
      ],
    },
    {
      title: 'Streaming, Event-Driven and Real-Time Architectures',
      description: 'High-throughput event streaming, Kafka pipelines, and micro-batch processing.',
      topics: [
        {
          title: 'Real-time e-commerce clickstream ingestion with Kafka and PySpark',
          description: 'Simulate high-velocity user clickstream events produced to an Apache Kafka topic. Consume the stream with PySpark Structured Streaming, parse JSON payloads, compute rolling 5-minute product view counts with watermarks, and write to a Delta Lake sink.',
          concepts: [
            'Kafka producer script emitting JSON payloads',
            'PySpark readStream with Kafka subscription options',
            'Parsing JSON schemas with from_json function',
            'Watermarking to bound late event state stores',
            'Writing streaming aggregates into Delta Lake sinks',
          ],
          quiz: [
            ['What happens to click events that arrive 15 minutes late if watermark is 10 minutes?', 'They are dropped and excluded from the windowed aggregation.'],
            ['Why is checkpointLocation mandatory when writing to Delta Lake streaming sinks?', 'To guarantee fault tolerance and exactly-once processing state recovery across restarts.'],
          ],
        },
        {
          title: 'Live transaction fraud scoring pipeline with Redis and Kafka',
          description: 'Build a low-latency fraud detection pipeline: payment transactions stream through Kafka; a Python consumer verifies card usage frequency against a 60-second sliding count in Redis cache, flags high-velocity anomalies, and emits fraud alerts to an alerts topic.',
          concepts: [
            'Kafka consumer group with manual offset commits',
            'Redis sorted sets for sliding window counters',
            'Velocity calculations for card transaction rate checks',
            'Dead-letter queue pattern for malformed payloads',
          ],
          quiz: [
            ['How does a Redis sorted set implement a 60-second sliding window counter?', 'Scores are epoch timestamps; ZREMRANGEBYSCORE removes timestamps older than now - 60s, and ZCARD counts remaining events.'],
            ['Why use manual offset commits instead of auto-commit in payment fraud processing?', 'To ensure offsets are committed only after the transaction has been evaluated and successfully dispatched.'],
          ],
        },
        {
          title: 'Change Data Capture (CDC) with Debezium, Kafka and Apache Iceberg',
          description: 'Capture row-level database changes (INSERT, UPDATE, DELETE) from PostgreSQL WAL logs using Debezium CDC. Stream change events into Kafka, and consume them into an Apache Iceberg table using Iceberg MERGE capabilities, maintaining a replica of production state.',
          concepts: [
            'PostgreSQL WAL logical replication and Debezium connector',
            'Debezium envelope schema: before, after, and op',
            'Handling schema drift and DDL changes in Kafka',
            'Merging CDC events into Apache Iceberg tables',
          ],
          quiz: [
            ['Why is CDC via WAL logs superior to polling SELECT * WHERE updated_at > :t?', 'WAL CDC captures hard DELETEs, avoids query load on production databases, and cannot miss rapid updates.'],
            ['What operation does Debezium op="d" signify?', 'A row DELETE in the source database, with the prior state captured in the "before" block.'],
          ],
        },
        {
          title: 'IoT sensor telemetry pipeline with MQTT, Kafka and TimescaleDB',
          description: 'Ingest streaming temperature, vibration, and pressure readings from simulated IoT devices via an MQTT broker, bridge to Apache Kafka, process anomalies in Python, and store raw time-series metrics in TimescaleDB hypertables with automated compression.',
          concepts: [
            'MQTT to Kafka bridge architecture for IoT protocols',
            'Partitioning Kafka topics by device identifier',
            'TimescaleDB hypertables with automated chunking by time',
            'Setting up continuous aggregates and downsampling policies',
          ],
          quiz: [
            ['Why partition an IoT Kafka topic by device_id?', 'To guarantee that messages from any single device are delivered in strict chronological order to a single partition.'],
            ['What is a TimescaleDB hypertable?', 'An abstraction over standard PostgreSQL tables that automatically partitions data into time-based chunks under the hood.'],
          ],
        },
        {
          title: 'Event-driven serverless data ingestion with AWS Lambda and Kinesis',
          description: 'Build an event-driven serverless pipeline on AWS: mobile app metrics ingest into Amazon Kinesis Data Streams; an AWS Lambda consumer validates payloads, dead-letters invalid events into SQS, batches records, and writes snappy Parquet partitions into S3.',
          concepts: [
            'Kinesis Data Streams sharding and throughput capacity',
            'Lambda event source mapping with batching window',
            'Dead-letter queue routing with Amazon SQS',
            'Writing compressed Parquet files directly from Lambda',
          ],
          quiz: [
            ['How do you control write batch size in AWS Lambda Kinesis triggers?', 'By configuring the BatchSize and MaximumBatchingWindowInSeconds settings.'],
            ['What prevents poison-pill records from blocking a Kinesis shard?', 'BisectBatchOnFunctionError and DeadLetterConfig routing bad records to SQS.'],
          ],
        },
      ],
    },
    {
      title: 'Lakehouse Architecture and Large-Scale Processing',
      description: 'Building modern lakehouses with Delta Lake, Apache Iceberg, and PySpark optimizations.',
      topics: [
        {
          title: 'Open Data Lakehouse with Apache Iceberg and PySpark',
          description: 'Build a production-grade Apache Iceberg data lakehouse on object storage: configure the REST catalog, write partitioned datasets with hidden partitioning, demonstrate schema evolution without rewriting data, and query historical table states using time travel.',
          concepts: [
            'Apache Iceberg architecture: Catalog and Metadata files',
            'Hidden partitioning without synthetic partition columns',
            'Schema evolution tracking column identifiers',
            'Time travel queries using table snapshot IDs',
            'Table maintenance: snapshot expiration and compaction',
          ],
          quiz: [
            ['How does Iceberg solve the file listing bottleneck on large S3 tables?', 'Metadata files maintain exact lists of data files, eliminating S3 LIST requests during query planning.'],
            ['What is hidden partitioning in Apache Iceberg?', 'Iceberg derives partition keys automatically from timestamp or identity functions, so users do not write synthetic partition predicates in SQL.'],
          ],
        },
        {
          title: 'Multi-terabyte log aggregation and sessionization with Spark',
          description: 'Process raw web server access logs: parse unstructured log lines using regular expressions, sessionize user interactions with a 30-minute inactivity cutoff, aggregate bounce rates and top paths, and optimize Spark shuffle partitions and broadcast joins.',
          concepts: [
            'Regex parsing of unstructured web log strings',
            'Sessionization algorithm using lag and running sums',
            'Resolving data skew caused by search engine crawlers',
            'Writing output to partitioned columnar Parquet files',
          ],
          quiz: [
            ['How is sessionization achieved in SQL / PySpark?', 'Compute the time gap since the previous event with LAG(); if > 30 minutes, flag 1 else 0; take the running SUM() of the flags as the session_id.'],
            ['How do bot crawlers cause data skew in web log processing?', 'A single bot IP can account for millions of requests, causing its partition key to crash an executor during a groupBy.'],
          ],
        },
        {
          title: 'Social graph analytics and PageRank using GraphFrames',
          description: 'Construct a large-scale directed graph of user follower relationships using GraphFrames on Spark. Compute connected components to discover communities, find influential user nodes using distributed PageRank, and identify shortest paths for recommendations.',
          concepts: [
            'GraphFrames vertices and edges DataFrames',
            'Motif finding: searching for structural graph patterns',
            'Connected components algorithm for community detection',
            'PageRank algorithm execution and convergence thresholds',
          ],
          quiz: [
            ['What two DataFrames form the foundation of a GraphFrame?', 'A vertices DataFrame containing a unique "id" column, and an edges DataFrame containing "src" and "dst" columns.'],
            ['What does PageRank measure on a directed follower graph?', 'The relative influence or importance of a node based on incoming edges from other influential nodes.'],
          ],
        },
        {
          title: 'Automated lakehouse compaction and table maintenance service',
          description: 'Build an automated maintenance daemon for Apache Iceberg and Delta Lake: detect small-file accumulation, trigger rewrite_data_files compaction into target 512MB files, vacuum orphaned files older than retention thresholds, and optimize query read times.',
          concepts: [
            'Small file problem in continuous streaming ingestion',
            'Bin-pack compaction versus sort and Z-order compaction',
            'Expiring stale metadata snapshots and transaction logs',
            'Scheduled maintenance jobs running via cron or Airflow',
          ],
          quiz: [
            ['Why is vacuuming and expiring snapshots essential in a lakehouse?', 'Unmaintained tables accumulate millions of historical metadata JSON files and obsolete Parquet files, bloating storage costs.'],
            ['What is bin-pack compaction in Apache Iceberg?', 'Combining small adjacent files into target-sized larger files without sorting or reorganizing row orders.'],
          ],
        },
        {
          title: 'Distributed geospatial pipeline with Apache Sedona and Spark',
          description: 'Process millions of mobile delivery GPS telemetry coordinates using Apache Sedona (GeoSpark). Spatially index polygons using R-trees, perform distributed spatial joins against municipal boundary polygons, and compute neighborhood delivery density heatmaps.',
          concepts: [
            'Spatial RDDs and Sedona spatial SQL functions',
            'R-tree spatial indexing for point-in-polygon checks',
            'Handling coordinate reference systems (WGS84 vs UTM)',
            'Distributed spatial range and KNN queries',
          ],
          quiz: [
            ['Why are standard relational joins slow for geospatial polygon queries?', 'Without spatial indexes (like R-trees), checking points against complex polygons requires an expensive Cartesian product.'],
            ['What coordinate reference system is standard for GPS latitude and longitude?', 'WGS 84 (EPSG:4326).'],
          ],
        },
      ],
    },
    {
      title: 'Orchestration, Data Quality and Governance',
      description: 'Production workflows, pipeline testing, monitoring, and data contracts.',
      topics: [
        {
          title: 'Enterprise Airflow DAG suite with Slack alerting and dynamic task mapping',
          description: 'Author a modular Apache Airflow DAG suite using the TaskFlow API: dynamically fan out tasks across tables using dynamic task mapping (expand()), implement custom on_failure_callback functions posting rich error cards to Slack, and enforce task retries with backoff.',
          concepts: [
            'TaskFlow API decorators with Python type hints',
            'Dynamic task mapping using .expand() across tables',
            'Custom Slack webhook on_failure_callback error alerts',
            'Configuring retries, retry_delay, and exponential_backoff',
          ],
          quiz: [
            ['What is the benefit of dynamic task mapping in Airflow 2.3+?', 'It generates task instances dynamically at runtime based on the output of an upstream task without modifying the DAG code.'],
            ['How do you prevent notification spam when a task retries multiple times?', 'Use on_failure_callback (fires only after all retries are exhausted) rather than on_retry_callback.'],
          ],
        },
        {
          title: 'Automated data quality gatekeeper with Great Expectations',
          description: 'Integrate automated data quality validation into an ingestion pipeline: define Great Expectations expectation suites (nullability, uniqueness, range boundaries), validate incoming batches, and halt downstream transformations if validation fails.',
          concepts: [
            'Expectation Suites and Data Context setup',
            'Critical checks: nullability, uniqueness, and integrity',
            'Data Docs: generating automated HTML quality reports',
            'Gatekeeper pattern: fail-fast abort versus quarantine',
          ],
          quiz: [
            ['What is the gatekeeper pattern in data engineering?', 'Running automated validation on newly arrived data and halting downstream jobs (or diverting bad rows to quarantine) before data reaches consumers.'],
            ['What are Data Docs in Great Expectations?', 'Human-readable HTML documentation automatically rendered from validation results showing test passes, failures, and statistics.'],
          ],
        },
        {
          title: 'End-to-end dbt production modeling with Jinja macros and generic tests',
          description: 'Build a comprehensive dbt project on Snowflake or BigQuery: structure models into staging, intermediate, and marts layers; write custom Jinja macros for reusable transformations; configure generic schema tests; and generate interactive dbt documentation.',
          concepts: [
            'Project layout: staging, intermediate, and marts',
            'Jinja macros for reusable SQL transformations',
            'Custom generic schema tests for data contracts',
            'Incremental models with is_incremental() merge strategies',
            'Generating and hosting interactive dbt documentation',
          ],
          quiz: [
            ['What does the is_incremental() macro condition do in a dbt model?', 'Applies filter logic (e.g. event_time > (select max(event_time) from {{ this }})) only on subsequent runs, avoiding full table recomputes.'],
            ['Why separate models into staging, intermediate, and marts layers?', 'Staging cleans and types 1:1 with source tables; intermediate handles business logic; marts delivers clean star-schema models to BI users.'],
          ],
        },
        {
          title: 'Data lineage and metadata catalog with OpenLineage and Marquez',
          description: 'Implement end-to-end data lineage across Spark, Airflow, and dbt: emit OpenLineage events on task execution, collect lineage in Marquez or DataHub, and visualize column-level lineage from raw source files through to final dashboard consumption.',
          concepts: [
            'OpenLineage standard specification for pipeline metadata',
            'Airflow OpenLineage provider for DAG extraction',
            'Spark OpenLineage listener tracking inputs and outputs',
            'Conducting upstream impact analysis before schema changes',
          ],
          quiz: [
            ['What problem does column-level data lineage solve?', 'It maps precisely which downstream dashboards, reports, and models will break if a specific column is renamed or removed.'],
            ['How does OpenLineage integrate with Apache Airflow?', 'Via an OpenLineage plugin/provider that intercepts DAG and task lifecycle events and emits JSON payloads to a metadata backend.'],
          ],
        },
        {
          title: 'Data contract enforcement and schema governance',
          description: 'Enforce producer-consumer data contracts: define JSON Schema or Protobuf contracts for source systems, validate incoming payloads at the API gateway layer, and establish schema evolution policies that prevent breaking changes from reaching analytics.',
          concepts: [
            'Data contract definitions using JSON Schema and YAML',
            'Producer versus consumer responsibilities in contracts',
            'Schema Registry compatibility modes: backward, forward, full',
            'Automated contract validation in CI/CD pull requests',
          ],
          quiz: [
            ['What is a data contract?', 'A formal agreement between data producers and consumers specifying schema, semantics, quality expectations, and SLA guarantees.'],
            ['What does backward compatibility mean in a Kafka Schema Registry?', 'Consumers using the new schema can still read messages written with the old schema.'],
          ],
        },
      ],
    },
    {
      title: 'Infrastructure as Code and Local Development',
      description: 'Reproducible cloud environments and local containerized platforms.',
      topics: [
        {
          title: 'Terraform deployment of an AWS data platform',
          description: 'Define an enterprise AWS analytics infrastructure as code using Terraform: create raw, staging, and curated S3 buckets with encryption and lifecycle rules; provision an IAM role with least-privilege policies; and manage remote state in an S3 backend with DynamoDB locking.',
          concepts: [
            'Terraform resource definitions for S3 and IAM',
            'S3 lifecycle rules: transitioning cold partitions',
            'IAM least privilege scoping for bucket ARN prefixes',
            'Terraform modules, variables, and DynamoDB state locking',
          ],
          quiz: [
            ['Why is remote state locking with DynamoDB essential in Terraform data platform management?', 'It prevents concurrent apply runs from corrupting the Terraform state file when multiple engineers deploy changes.'],
            ['What security setting should be enabled by default on all analytics S3 buckets?', 'Block Public Access and default server-side encryption (SSE-S3 or SSE-KMS).'],
          ],
        },
        {
          title: 'Full local data engineering stack with Docker Compose',
          description: 'Spin up a complete local development environment using Docker Compose: PostgreSQL, Apache Kafka with Zookeeper, MinIO S3-compatible local object storage, Apache Spark master/workers, and Apache Airflow with LocalExecutor for offline pipeline development.',
          concepts: [
            'Docker Compose multi-container networking and volumes',
            'MinIO configuration as an S3 endpoint locally',
            'Kafka container setup with internal/external listeners',
            'Local Airflow executor configured with local Postgres',
          ],
          quiz: [
            ['Why is MinIO useful in data engineering local testing?', 'It provides a 100% S3-compatible API locally, allowing pipelines to read and write s3a:// paths without incurring AWS charges.'],
            ['Why must Kafka containers configure advertised.listeners carefully in Docker Compose?', 'To differentiate internal Docker network communication between containers from host-machine connections.'],
          ],
        },
        {
          title: 'Reverse ETL data activation pipeline from Snowflake to CRM',
          description: 'Sync calculated customer metrics (churn risk score, lifetime spend, product tier) from the analytics data warehouse back into operational business tools (HubSpot, Salesforce) using Python or Census/Hightouch patterns, closing the loop from data to business action.',
          concepts: [
            'Reverse ETL concept: warehouse as operational source',
            'Incremental extraction of calculated customer scores',
            'Bulk API rate limiting and batch update strategies',
            'Idempotent upserting into operational CRM endpoints',
          ],
          quiz: [
            ['What is Reverse ETL?', 'The practice of copying enriched analytics data from the central data warehouse back into operational tools (CRMs, marketing tools).'],
            ['How do you handle API rate limits during bulk CRM synchronization?', 'Chunk updates into batch endpoints (e.g. Salesforce Bulk API) with exponential backoff on HTTP 429.'],
          ],
        },
        {
          title: 'SaaS revenue analytics capstone: Stripe webhooks to executive BI',
          description: 'Synthesize all skills into a flagship portfolio capstone: ingest real-time Stripe billing webhooks via an API endpoint, buffer events in Kafka, process idempotently into an Iceberg lakehouse using Spark, model MRR and churn with dbt, orchestrate with Airflow, and expose metrics to BI.',
          concepts: [
            'Handling webhook verification and idempotency keys',
            'CDC and event ingestion into cloud object storage',
            'Modeling SaaS metrics: MRR, Churn, and LTV',
            'End-to-end orchestration, alerting, and documentation',
          ],
          quiz: [
            ['What is the golden rule when ingesting webhook events from external billing providers?', 'Every event must be handled idempotently because webhooks guarantee at-least-once delivery and can re-send identical events.'],
            ['What makes this capstone project compelling to hiring managers?', 'It demonstrates the complete lifecycle: raw webhook ingestion, streaming, data modeling, automated orchestration, data quality testing, and executive metric delivery.'],
          ],
        },
        {
          title: 'Continuous integration and automated testing for data pipelines',
          description: 'Build a production CI/CD pipeline using GitHub Actions: run SQLFluff linting on dbt models, execute pytest unit tests with local PySpark fixtures, build Docker images, and automate Blue/Green deployment of Airflow DAGs to production environments.',
          concepts: [
            'SQLFluff linting in automated pull request checks',
            'Pytest fixtures with in-memory SQLite and Spark',
            'Docker container image building and tag versioning',
            'Blue/Green deployment patterns for Airflow DAGs',
          ],
          quiz: [
            ['Why run SQLFluff linting in CI?', 'To enforce consistent SQL formatting, naming conventions, and prevent syntax errors before code merges to main.'],
            ['How do you test dbt transformations in a CI pipeline without affecting production data?', 'Run dbt build against an ephemeral, isolated schema named after the pull request branch (e.g. pr_123_staging).'],
          ],
        },
      ],
    },
  ],
})
