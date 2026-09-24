import { defineTrack } from '../define'

export const dataWarehousing = defineTrack({
  id: 'track-data-warehousing',
  title: 'Data Warehousing',
  description: 'How analytical databases are designed, loaded and run: OLTP versus OLAP, Kimball, Inmon and Data Vault, columnar engines, Snowflake, BigQuery and Redshift concepts, Delta and Iceberg lakehouses, loading patterns, slowly changing dimensions, partitioning, cost, governance and semantic layers.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '🏛️',
  tags: ['data warehouse', 'olap', 'kimball', 'snowflake', 'bigquery', 'redshift', 'lakehouse', 'iceberg', 'delta lake', 'scd'],
  languages: ['SQL'],
  explainMode: 'sql',
  code: { label: 'SQL (warehouse dialects noted)', id: 'sql', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-sql'],
  style: 'practice',
  categories: [
    {
      title: 'Foundations and Architectures',
      description: 'Why a warehouse is not just a big database, and the schools of thought on how to build one.',
      topics: [
        {
          title: 'OLTP versus OLAP workloads',
          description: 'Transactional systems do many small reads and writes by key; analytical systems scan millions of rows for a few columns. Row stores, indexes and normalisation serve the first, columnar scans and denormalised schemas serve the second.',
          concepts: ['Access patterns of OLTP and OLAP', 'Why operational databases are poor for analytics', 'Read replicas versus a warehouse', 'Latency, throughput and concurrency goals'],
          quiz: [
            ['Why not run reports directly on the production database?', 'Long scans compete with transactions for I/O and locks and the schema is optimised for writes, not analysis.'],
            ['What does an analytical query typically touch?', 'Few columns across a very large number of rows.'],
          ],
        },
        {
          title: 'Warehouse layers: staging, core and marts',
          description: 'Raw data lands untouched in staging, is integrated and historised in a core layer, and is served through marts shaped for consumers. The medallion naming (bronze, silver, gold) describes the same progression in lakehouses.',
          concepts: ['Raw and staging zones', 'Integration or core layer', 'Data marts for consumers', 'Medallion naming'],
          quiz: [
            ['Why keep raw data unmodified?', 'It allows reprocessing when transformation logic changes or bugs are found.'],
            ['What distinguishes a mart from the core layer?', 'Marts are shaped for a specific audience or tool, often denormalised and aggregated.'],
          ],
          prereqs: ['OLTP versus OLAP workloads'],
        },
        {
          title: 'The Kimball dimensional approach',
          description: 'Kimball builds the warehouse bottom-up from business processes modelled as facts and dimensions, tied together by conformed dimensions listed in a bus matrix so marts can be joined across processes.',
          concepts: ['Business processes as fact tables', 'Conformed dimensions', 'The bus matrix', 'Bottom-up delivery in marts'],
          quiz: [
            ['What is the bus matrix?', 'A grid of business processes against the dimensions each one uses.'],
            ['What makes a dimension conformed?', 'It has the same keys and attributes wherever it is used, so facts from different processes can be compared.'],
          ],
        },
        {
          title: 'The Inmon corporate information factory',
          description: 'Inmon builds a normalised enterprise data warehouse first as the single integrated source, then derives departmental marts from it, trading faster initial delivery for consistency across the organisation.',
          concepts: ['Normalised enterprise warehouse', 'Marts derived from the EDW', 'Top-down delivery', 'Kimball versus Inmon trade-offs'],
          quiz: [
            ['In Inmon\'s approach, what form does the central warehouse take?', 'A normalised (3NF) integrated model.'],
            ['What is the main cost of the top-down approach?', 'Longer time before business users see usable marts.'],
          ],
          prereqs: ['The Kimball dimensional approach'],
        },
        {
          title: 'Data Vault overview',
          description: 'Data Vault separates business keys (hubs), relationships (links) and descriptive history (satellites) so new sources can be added without restructuring, at the cost of more joins that a presentation layer must hide.',
          concepts: ['Hubs, links and satellites', 'Hash keys and load metadata', 'Raw vault versus business vault', 'When Data Vault fits'],
          quiz: [
            ['What does a satellite table hold?', 'Descriptive attributes and their history for a hub or link.'],
            ['Why does Data Vault need a presentation layer?', 'Its many narrow tables are hard to query directly, so star schemas are built on top.'],
          ],
          prereqs: ['The Kimball dimensional approach'],
        },
      ],
    },
    {
      title: 'Storage and Query Engines',
      description: 'What happens under the hood when a warehouse runs a query.',
      topics: [
        {
          title: 'Columnar storage and compression',
          description: 'Storing each column contiguously lets a scan read only the columns requested and compress similar values with run-length, dictionary and delta encodings, which is why analytical queries run tens of times faster than on row stores.',
          concepts: ['Column-oriented layout', 'Run-length, dictionary and delta encoding', 'Column pruning', 'Zone maps and min-max skipping'],
          quiz: [
            ['Why does a low-cardinality column compress so well?', 'Dictionary and run-length encoding replace repeated values with small codes.'],
            ['What is a zone map?', 'Per-block min and max values that let the engine skip blocks that cannot match a filter.'],
          ],
        },
        {
          title: 'Distributed query execution',
          description: 'MPP warehouses split data across nodes, run vectorised operators in parallel and shuffle rows over the network for joins and aggregations; understanding where shuffles happen explains most slow queries.',
          concepts: ['Data distribution across nodes', 'Vectorised execution', 'Shuffles for joins and group by', 'Separation of storage and compute'],
          quiz: [
            ['When must rows move between nodes?', 'When a join or aggregation key is not the key the data is distributed on.'],
            ['What does separating storage from compute enable?', 'Scaling and paying for compute independently, and multiple clusters over the same data.'],
          ],
          prereqs: ['Columnar storage and compression'],
        },
        {
          title: 'Snowflake concepts',
          description: 'Virtual warehouses provide isolated compute over shared micro-partitioned storage; automatic clustering, time travel, zero-copy cloning and the result cache shape how work is organised and billed.',
          concepts: ['Virtual warehouses and sizing', 'Micro-partitions and pruning', 'Time travel and zero-copy clones', 'Result and metadata caches', 'Stages and COPY INTO'],
          quiz: [
            ['What is a micro-partition?', 'An immutable 50 to 500 MB compressed storage unit with column statistics used for pruning.'],
            ['What does a zero-copy clone cost initially?', 'Nothing beyond metadata; storage is only charged as the clone diverges.'],
          ],
          prereqs: ['Distributed query execution'],
        },
        {
          title: 'BigQuery concepts',
          description: 'A serverless engine that bills by bytes scanned or reserved slots, so partitioning, clustering and column selection directly change cost; nested and repeated fields model one-to-many data without joins.',
          concepts: ['Slots and on-demand versus capacity pricing', 'Bytes scanned as the cost driver', 'Partitioned and clustered tables', 'STRUCT and ARRAY fields', 'Storage Write API and streaming'],
          quiz: [
            ['Why does SELECT * cost more in BigQuery?', 'On-demand pricing charges per byte scanned across all selected columns.'],
            ['How do you avoid scanning a whole table by date?', 'Partition by the date column and filter on it.'],
          ],
          prereqs: ['Distributed query execution'],
        },
        {
          title: 'Redshift concepts',
          description: 'A provisioned or serverless MPP cluster where distribution style and sort keys decide how much data moves and is skipped; RA3 nodes separate storage, Spectrum queries S3, and VACUUM and ANALYZE remain part of operations.',
          concepts: ['Distribution styles: KEY, ALL, EVEN', 'Sort keys and zone maps', 'RA3 nodes and managed storage', 'Spectrum and external tables', 'VACUUM, ANALYZE and WLM'],
          quiz: [
            ['When is DISTSTYLE ALL appropriate?', 'For small dimension tables that join to large facts, so no shuffle is needed.'],
            ['What does a sort key improve?', 'Range filters and merge joins, by keeping rows ordered and enabling block skipping.'],
          ],
          prereqs: ['Distributed query execution'],
        },
      ],
    },
    {
      title: 'Lakehouse and Table Formats',
      description: 'Warehouse guarantees on top of files in object storage.',
      topics: [
        {
          title: 'Lakehouse architecture',
          description: 'Open file formats in object storage plus a transactional table layer give warehouse features (ACID, schema enforcement, time travel) with lake economics and multiple engines reading the same tables.',
          concepts: ['Lake versus warehouse versus lakehouse', 'Open formats and multi-engine access', 'Transactional metadata over files', 'When a lakehouse fits'],
          quiz: [
            ['What does a table format add to plain Parquet files?', 'Transactions, schema, partitioning metadata and snapshots.'],
            ['Name a downside of a plain data lake.', 'No atomic multi-file commits, so readers can see partial writes.'],
          ],
          prereqs: ['Warehouse layers: staging, core and marts'],
        },
        {
          title: 'Delta Lake',
          description: 'A JSON transaction log next to Parquet files records every commit, giving ACID writes, time travel, MERGE, schema enforcement and OPTIMIZE with Z-ordering for data skipping on lakes read by Spark and other engines.',
          concepts: ['The _delta_log transaction log', 'ACID commits and time travel', 'Schema enforcement and evolution', 'OPTIMIZE, Z-order and VACUUM'],
          quiz: [
            ['How does Delta achieve atomic commits on object storage?', 'A commit is a single new log file; readers only see it once it exists.'],
            ['What does VACUUM remove?', 'Data files no longer referenced by the log beyond the retention period.'],
          ],
          prereqs: ['Lakehouse architecture'],
        },
        {
          title: 'Apache Iceberg',
          description: 'Iceberg tracks snapshots, manifests and per-file statistics in a metadata tree, supports hidden partitioning and safe partition evolution, and is read natively by Spark, Trino, Flink, Snowflake and BigQuery.',
          concepts: ['Metadata, manifest lists and manifests', 'Snapshots and snapshot isolation', 'Hidden partitioning and partition evolution', 'Schema evolution by column id', 'Compaction and snapshot expiry'],
          quiz: [
            ['What is hidden partitioning?', 'Partitions derived from transforms such as days(ts) that queries on ts use automatically.'],
            ['Why are Iceberg schema changes safe?', 'Columns are tracked by id, not name or position.'],
          ],
          prereqs: ['Lakehouse architecture'],
        },
        {
          title: 'Catalogs and metastores',
          description: 'A catalog maps table names to current metadata and arbitrates commits: Hive Metastore, AWS Glue, Unity Catalog and Iceberg REST catalogs such as Apache Polaris let several engines agree on what a table is.',
          concepts: ['Role of a catalog in commits', 'Hive Metastore and Glue', 'Unity Catalog', 'Iceberg REST catalog'],
          quiz: [
            ['Why is the catalog critical for Iceberg writes?', 'It performs the atomic swap of the current metadata pointer.'],
            ['What does a catalog let two engines share?', 'A consistent view of table locations, schemas and current snapshots.'],
          ],
          prereqs: ['Apache Iceberg'],
        },
      ],
    },
    {
      title: 'Loading Patterns',
      description: 'Getting data into the warehouse correctly, repeatedly and at volume.',
      topics: [
        {
          title: 'Bulk loading from stages',
          description: 'Warehouses load fastest from files in object storage: Snowflake COPY INTO from stages, BigQuery load jobs from GCS, Redshift COPY from S3 with manifests, all parallel across files and far faster than row inserts.',
          concepts: ['Stages and external locations', 'COPY commands and file formats', 'Parallelism by file count', 'Load error handling options'],
          quiz: [
            ['Why is INSERT ... VALUES a poor way to load a warehouse?', 'It is row-at-a-time and creates many tiny write operations.'],
            ['How does file count affect COPY performance?', 'More similarly sized files allow more parallel loading, up to the compute available.'],
          ],
        },
        {
          title: 'Incremental loads and watermarks',
          description: 'Loading only rows changed since the last run using an updated_at high-water mark or a change sequence, with an overlap window and dedup to tolerate late updates and clock skew.',
          concepts: ['High-water mark columns', 'Overlap windows and dedup', 'Handling deletes in incremental loads', 'Storing load metadata'],
          quiz: [
            ['What does an incremental load miss if updated_at is not reliably set?', 'Rows changed without the timestamp advancing.'],
            ['How are deletes detected in an incremental extract?', 'Soft-delete flags, CDC events or periodic full reconciliation.'],
          ],
          prereqs: ['Bulk loading from stages'],
        },
        {
          title: 'MERGE in warehouses',
          description: 'MERGE INTO target USING source matches on keys and inserts, updates or deletes per branch in one statement; warehouses implement it by rewriting affected partitions or files, so limiting the matched range keeps it cheap.',
          concepts: ['MERGE syntax across dialects', 'Deduplicating the source', 'Partition-pruned merges', 'Cost of rewriting files'],
          quiz: [
            ['Why deduplicate the source before MERGE?', 'Most engines error or behave unpredictably when two source rows match one target row.'],
            ['How do you keep a MERGE from scanning the whole target?', 'Add a partition filter on the target in the ON or WHEN clauses.'],
          ],
          prereqs: ['Incremental loads and watermarks'],
        },
        {
          title: 'Streaming and continuous ingestion',
          description: 'Snowpipe, BigQuery Storage Write API and Kafka connectors land events within seconds, trading micro-batch efficiency for freshness, and require dedup keys because delivery is usually at-least-once.',
          concepts: ['Snowpipe and auto-ingest', 'BigQuery Storage Write API', 'Kafka connectors to warehouses', 'At-least-once delivery and dedup'],
          quiz: [
            ['Why do streamed rows often need deduplication?', 'Connectors retry on failure and may deliver the same event twice.'],
            ['What is the usual trade-off of streaming ingestion?', 'Higher per-row cost and small files in exchange for low latency.'],
          ],
        },
        {
          title: 'Idempotent and auditable loads',
          description: 'Each load records what it did (files, row counts, run id) in an audit table, writes to staging, and either swaps, overwrites a partition or merges, so any run can be repeated or reconciled without corrupting the target.',
          concepts: ['Load audit tables', 'Truncate-and-load versus swap', 'Partition overwrite', 'Reconciling counts against the source'],
          quiz: [
            ['What should a load audit row contain?', 'Run id, source identifier, start and end times, row counts and status.'],
            ['Why prefer a table swap to truncate-then-insert?', 'Readers never observe an empty table between the two steps.'],
          ],
          prereqs: ['MERGE in warehouses'],
        },
      ],
    },
    {
      title: 'Slowly Changing Dimensions',
      description: 'Keeping history when descriptive attributes change.',
      topics: [
        {
          title: 'SCD types 0, 1, 2 and 3',
          description: 'Type 0 never changes, Type 1 overwrites, Type 2 adds a new row per version with validity dates, Type 3 keeps a previous-value column. The choice decides whether reports show history as it was or as it is now.',
          concepts: ['Type 1 overwrite', 'Type 2 versioned rows', 'Type 3 previous-value columns', 'Choosing a type per attribute'],
          quiz: [
            ['Which type lets you report sales by the region a customer was in at the time?', 'Type 2.'],
            ['What is the storage cost of Type 2?', 'One new row per change, so dimension tables grow with churn.'],
          ],
        },
        {
          title: 'Implementing SCD Type 2 in SQL',
          description: 'A MERGE or two-step statement that closes the current row (sets end date and current flag) and inserts a new version when a hash of tracked attributes changes, with care for same-day changes and initial loads.',
          concepts: ['Effective and end dates', 'Current flag and version number', 'Attribute hashes for change detection', 'Closing and inserting in one transaction'],
          quiz: [
            ['How do you detect that a dimension row changed?', 'Compare a hash of the tracked attributes with the current row\'s hash.'],
            ['What end date does the current row usually carry?', 'NULL or a far-future sentinel such as 9999-12-31.'],
          ],
          prereqs: ['SCD types 0, 1, 2 and 3'],
        },
        {
          title: 'Surrogate keys and late-arriving dimensions',
          description: 'Facts reference the dimension version by surrogate key, not natural key; when a fact arrives before its dimension row, an inferred placeholder row is inserted and later updated, keeping referential integrity.',
          concepts: ['Surrogate versus natural keys', 'Key lookup at fact load time', 'Inferred members for late dimensions', 'Backdating facts to earlier versions'],
          quiz: [
            ['Why do facts store surrogate keys?', 'To point at a specific version of a Type 2 dimension row.'],
            ['What is an inferred member?', 'A placeholder dimension row created when a fact references a key not yet loaded.'],
          ],
          prereqs: ['Implementing SCD Type 2 in SQL'],
        },
        {
          title: 'Snapshots and history tables',
          description: 'Periodic full snapshots of a source table, or tool-managed snapshots such as dbt snapshots, give history when the source has no change tracking, at the cost of storage proportional to snapshot frequency.',
          concepts: ['Daily snapshot tables', 'Snapshot-derived SCD Type 2', 'dbt snapshot strategies', 'Storage versus fidelity trade-off'],
          quiz: [
            ['When are snapshots the only option for history?', 'When the source overwrites rows and exposes no change log.'],
            ['What do dbt snapshots use to detect changes?', 'A timestamp column or a check of selected columns.'],
          ],
          prereqs: ['SCD types 0, 1, 2 and 3'],
        },
      ],
    },
    {
      title: 'Performance and Cost',
      description: 'Making queries fast and bills predictable.',
      topics: [
        {
          title: 'Partitioning and clustering',
          description: 'Partitioning splits a table by a column such as date so queries skip whole partitions; clustering orders data within storage units so range filters skip blocks. Both only help when queries filter on the chosen columns.',
          concepts: ['Partition columns and granularity', 'Clustering keys and sort order', 'Automatic versus manual clustering', 'Choosing keys from query patterns'],
          quiz: [
            ['Which column is the most common partition key in a warehouse?', 'An event or load date.'],
            ['When does clustering stop helping?', 'When queries filter on columns other than the clustering keys, or after heavy unsorted inserts.'],
          ],
          prereqs: ['Columnar storage and compression'],
        },
        {
          title: 'Writing queries that prune',
          description: 'Pruning needs filters the engine can evaluate against metadata: literal or parameter comparisons on partition columns, no functions wrapping them, and joins that carry the partition predicate to the large table.',
          concepts: ['Sargable partition filters', 'Functions that defeat pruning', 'Pushing filters through joins', 'Checking bytes scanned or partitions read'],
          quiz: [
            ['Why does WHERE CAST(event_date AS STRING) LIKE \'2025%\' scan everything?', 'The function hides the partition column from the pruning logic.'],
            ['How do you verify pruning in BigQuery?', 'Compare bytes processed in the query plan or dry run with and without the filter.'],
          ],
          prereqs: ['Partitioning and clustering'],
        },
        {
          title: 'Materialised views and result caching',
          description: 'Warehouse materialised views maintain precomputed aggregates automatically and can rewrite queries to use them; result caches return identical queries free, which changes how dashboards should be written.',
          concepts: ['Automatic maintenance and query rewrite', 'Refresh cost and staleness', 'Result cache hit conditions', 'Aggregate tables as an alternative'],
          quiz: [
            ['What breaks a result cache hit?', 'Any change to the query text or underlying data, or non-deterministic functions.'],
            ['When is a scheduled aggregate table better than a materialised view?', 'When the logic is not supported by the view engine or refresh cost is too high.'],
          ],
        },
        {
          title: 'Cost models and controlling spend',
          description: 'Per-second compute (Snowflake), per-byte or slot reservations (BigQuery) and provisioned nodes (Redshift) reward different habits; auto-suspend, query limits, resource monitors and cost attribution tags keep bills predictable.',
          concepts: ['Compute-time versus bytes-scanned billing', 'Auto-suspend and right-sizing', 'Query limits and resource monitors', 'Tagging and cost attribution'],
          quiz: [
            ['What is the cheapest fix for an idle Snowflake warehouse?', 'A short auto-suspend timeout.'],
            ['How do you stop a runaway BigQuery query from costing thousands?', 'Set a maximum bytes billed limit per query or project.'],
          ],
        },
        {
          title: 'Workload management and concurrency',
          description: 'Separating ETL, BI and ad hoc workloads onto their own compute (warehouses, slot reservations, WLM queues) prevents a heavy load from stalling dashboards and makes each team\'s usage visible and limitable.',
          concepts: ['Isolating workloads by compute', 'Queues, priorities and timeouts', 'Multi-cluster scaling', 'Query monitoring rules'],
          quiz: [
            ['Why give ETL its own warehouse or queue?', 'So long loads do not queue behind or slow interactive dashboard queries.'],
            ['What does a multi-cluster warehouse do under load?', 'Adds clusters to absorb concurrent queries rather than queuing them.'],
          ],
          prereqs: ['Cost models and controlling spend'],
        },
      ],
    },
    {
      title: 'Security and Governance',
      description: 'Controlling who sees what, and proving it.',
      topics: [
        {
          title: 'Access control and masking',
          description: 'Role hierarchies grant privileges on schemas and tables; row access policies filter by user attributes, and dynamic data masking returns redacted values to unprivileged roles without duplicating tables.',
          concepts: ['Role-based grants and hierarchies', 'Row-level access policies', 'Column masking policies', 'Least privilege for service accounts'],
          quiz: [
            ['How do you show salaries only to HR without a second table?', 'A masking policy that returns the value for the HR role and a redaction otherwise.'],
            ['What should a pipeline service account be allowed to do?', 'Only the reads and writes its job needs, on its own schemas.'],
          ],
        },
        {
          title: 'PII, classification and retention',
          description: 'Tagging columns as PII or sensitive, tokenising or hashing identifiers, keeping raw PII out of marts, and enforcing retention and deletion so the warehouse can satisfy GDPR-style requests.',
          concepts: ['Data classification tags', 'Tokenisation and hashing', 'Keeping PII out of marts', 'Retention and deletion workflows'],
          quiz: [
            ['Why hash rather than encrypt an email used only as a join key?', 'It still joins consistently but cannot be reversed to the address.'],
            ['What complicates deletion requests in a warehouse?', 'Copies in snapshots, time travel and downstream extracts.'],
          ],
          prereqs: ['Access control and masking'],
        },
        {
          title: 'Lineage, catalogs and audit',
          description: 'Query history and information_schema views show who ran what; lineage tools trace a column from source to dashboard, and a data catalog documents owners and definitions so consumers trust and find data.',
          concepts: ['Query history and access logs', 'information_schema and account usage views', 'Column-level lineage', 'Data catalogs and ownership'],
          quiz: [
            ['Where do you find which tables a user queried last week?', 'The query history or account usage views.'],
            ['What question does lineage answer during an incident?', 'Which downstream tables and dashboards a broken source affects.'],
          ],
        },
        {
          title: 'Data sharing and marketplaces',
          description: 'Snowflake secure shares, BigQuery Analytics Hub and Iceberg tables in shared storage let organisations expose live tables to partners without copying, with the provider controlling scope and the consumer paying for compute.',
          concepts: ['Live sharing without copies', 'Provider and consumer roles', 'Sharing through open table formats', 'Governance of shared data'],
          quiz: [
            ['What is the advantage of a share over a nightly export?', 'Consumers query current data with no copy to maintain.'],
            ['Who pays for compute on a shared dataset?', 'The consumer running the queries.'],
          ],
          prereqs: ['Access control and masking'],
        },
      ],
    },
    {
      title: 'Semantic Layers and Serving',
      description: 'From tables to metrics people agree on.',
      topics: [
        {
          title: 'Semantic layers and metric definitions',
          description: 'A semantic layer (dbt Semantic Layer, LookML, Cube) defines metrics, dimensions and joins once so every tool computes revenue the same way, replacing per-dashboard SQL with governed definitions.',
          concepts: ['Metrics, dimensions and joins as definitions', 'dbt Semantic Layer and MetricFlow', 'LookML and Cube models', 'Consistency across tools'],
          quiz: [
            ['What problem does a semantic layer solve?', 'Different dashboards computing the same metric differently.'],
            ['Where does a semantic layer run the actual query?', 'On the warehouse, by generating SQL from the definitions.'],
          ],
        },
        {
          title: 'Aggregate tables and OLAP cubes',
          description: 'Pre-aggregating facts to common grains (daily, by region) cuts scan cost for dashboards; classic cubes and modern engines like Druid or ClickHouse serve sub-second slices when the warehouse is too slow or expensive for interactive use.',
          concepts: ['Aggregate fact tables by grain', 'Additivity constraints in rollups', 'Cube-style engines for interactive use', 'Keeping aggregates in sync'],
          quiz: [
            ['Which measures cannot be rolled up by summing daily aggregates?', 'Non-additive ones such as distinct counts and ratios.'],
            ['When does a serving engine make sense in front of a warehouse?', 'When many users need sub-second interactive queries on a bounded dataset.'],
          ],
        },
        {
          title: 'BI connectivity and query patterns',
          description: 'BI tools run either live queries or scheduled extracts; live mode needs well-partitioned marts and caching, extracts need refresh schedules, and both benefit from wide, flat views designed for the tool.',
          concepts: ['Live connections versus extracts', 'Views shaped for BI tools', 'Caching and query concurrency', 'Row-level security through BI'],
          quiz: [
            ['What is the risk of many live dashboards on a warehouse?', 'Concurrency spikes and cost from repeated scans.'],
            ['How does row-level security reach a BI tool?', 'Through the warehouse policies applied to the user or a mapped role.'],
          ],
          prereqs: ['Semantic layers and metric definitions'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Build a warehouse end to end, then defend its design in an interview.',
      style: 'project',
      topics: [
        {
          title: 'Project: retail star schema warehouse',
          description: 'Design a bus matrix for orders, shipments and returns, build conformed customer, product and date dimensions with SCD Type 2, load facts from staged CSV files, and verify totals against the source.',
          concepts: ['Bus matrix and grain decisions', 'Dimension tables with SCD Type 2', 'Fact loads with key lookups', 'Reconciliation queries'],
          quiz: [
            ['What is the grain of the orders fact?', 'One row per order line.'],
            ['How do you check the load is complete?', 'Compare row counts and summed amounts with the staged source per day.'],
          ],
        },
        {
          title: 'Project: incremental lakehouse table',
          description: 'Create an Iceberg or Delta table over object storage, load daily partitions with MERGE from a changing source, evolve the schema by adding a column, time-travel to a previous snapshot, and compact small files.',
          concepts: ['Create the table and catalog', 'Daily MERGE loads', 'Schema evolution and time travel', 'Schedule compaction and expiry'],
          quiz: [
            ['How do you query yesterday\'s version of the table?', 'With a snapshot id or timestamp in the time-travel clause.'],
            ['Why compact after many small merges?', 'Small files slow every read and inflate metadata.'],
          ],
        },
        {
          title: 'Project: cost and performance audit',
          description: 'Take a sample warehouse with slow, expensive queries: profile query history, add partitioning and clustering, rewrite non-pruning filters, create an aggregate table, and report the before-and-after cost and runtime.',
          concepts: ['Profile query history', 'Fix partitioning and filters', 'Add aggregates or materialised views', 'Measure and document savings'],
          quiz: [
            ['Which metric proves a partition fix worked?', 'Bytes scanned or partitions read per query dropping.'],
            ['Why measure cost per dashboard rather than per query?', 'Dashboards fire many queries; the total is what the business pays.'],
          ],
        },
        {
          title: 'Project: governed metrics layer',
          description: 'Define revenue, active customers and return rate in a semantic layer over the star schema, apply row-level and masking policies for two roles, and demonstrate that two BI tools return identical numbers.',
          concepts: ['Define metrics and dimensions', 'Apply access and masking policies', 'Connect two tools', 'Verify consistency'],
          quiz: [
            ['Where should the return-rate formula live?', 'In the semantic layer, not in each dashboard.'],
            ['How do you prove masking works?', 'Query as each role and compare the returned values.'],
          ],
        },
        {
          title: 'Data warehousing interview questions',
          description: 'Recurring questions: Kimball versus Inmon, star versus snowflake, how SCD Type 2 works, why columnar is faster, what a micro-partition is, how to cut BigQuery cost, and what a lakehouse adds over a lake.',
          concepts: ['Architecture questions', 'Dimensional modelling questions', 'Engine and cost questions', 'Lakehouse questions'],
          quiz: [
            ['Explain a star schema in one sentence.', 'A central fact table joined to denormalised dimension tables on surrogate keys.'],
            ['What makes a column store fast for aggregates?', 'It reads only the needed columns and compresses them well.'],
          ],
          style: 'reading',
        },
        {
          title: 'Warehouse design exercises',
          description: 'Timed design prompts: model a subscription business, choose partition and clustering keys for a 10 TB event table, design a load for late-arriving facts, and estimate the cost of a dashboard on BigQuery.',
          concepts: ['Modelling a business in 20 minutes', 'Choosing keys for a large table', 'Designing a load process', 'Estimating cost from bytes'],
          quiz: [
            ['What do you ask before choosing a partition key?', 'Which columns the most frequent queries filter on and how data arrives.'],
            ['How do you estimate a BigQuery query cost?', 'Bytes of the referenced columns in scanned partitions times the per-TB rate.'],
          ],
          style: 'practice',
        },
      ],
    },
  ],
})
