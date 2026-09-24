import { defineTrack } from '../define'

export const cloudDataPlatforms = defineTrack({
  id: 'track-cloud-data-platforms',
  title: 'Cloud Data Platforms',
  description: 'The managed building blocks of a cloud data platform across AWS, GCP and Azure: object storage and lakes, warehouses, lakehouses, managed orchestration and ETL, serverless query engines, streaming services, IAM, networking, cost control, infrastructure as code and migrations.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '☁️',
  tags: ['cloud', 'aws', 'gcp', 'azure', 'snowflake', 'bigquery', 'databricks', 'terraform', 'data-platform'],
  languages: ['Shell', 'SQL', 'HCL'],
  explainMode: 'devops',
  code: { label: 'shell, SQL and Terraform, whichever fits', id: 'bash', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Object Storage and Data Lakes',
      description: 'The cheapest, most durable layer, and the foundation everything else reads from.',
      topics: [
        {
          title: 'S3, GCS and ADLS compared',
          description: 'Object storage stores immutable blobs under keys with no real directories; the three providers differ in consistency history, hierarchical namespace (ADLS Gen2), storage classes and access APIs, but the lake patterns are the same.',
          concepts: ['Objects, keys and buckets', 'Hierarchical namespace in ADLS Gen2', 'Storage classes and tiers', 'Consistency guarantees'],
          quiz: [
            ['Is a prefix a directory in S3?', 'No, it is part of the key; tools only render it as a folder.'],
            ['What does ADLS Gen2 add over plain Blob Storage?', 'A hierarchical namespace with real directories and POSIX-style ACLs.'],
          ],
        },
        {
          title: 'Lake layout: zones, prefixes and partitions',
          description: 'Raw, cleaned and curated zones as separate prefixes or buckets, Hive-style partition paths (dt=2024-01-01), and naming that keeps listing cheap and access policies simple.',
          concepts: ['Raw, cleaned and curated zones', 'Hive-style partition paths', 'Prefix design for listing performance', 'Bucket per zone versus per domain'],
          quiz: [
            ['Why partition by date in the path?', 'Query engines prune whole prefixes, reading only the needed days.'],
            ['Why keep raw data immutable?', 'It is the source of truth for reprocessing when logic changes.'],
          ],
          prereqs: ['S3, GCS and ADLS compared'],
        },
        {
          title: 'File formats and table formats',
          description: 'Parquet and ORC for columnar analytics, Avro for row-oriented streaming, and table formats (Delta Lake, Apache Iceberg, Hudi) that add ACID transactions, schema evolution and time travel on top of files.',
          concepts: ['Parquet and ORC columnar layout', 'Avro for row data', 'Delta, Iceberg and Hudi', 'Small files problem'],
          quiz: [
            ['What does a table format add to Parquet files?', 'A transaction log with ACID commits, schema evolution and time travel.'],
            ['Why are many small files a problem?', 'Listing and opening overhead dominates; compact into 128 MB to 1 GB files.'],
          ],
          prereqs: ['Lake layout: zones, prefixes and partitions'],
        },
        {
          title: 'Lifecycle rules, versioning and replication',
          description: 'Lifecycle policies move objects to cold tiers and expire them, versioning protects against accidental deletes, and cross-region replication supports DR; each affects cost and must be set deliberately per zone.',
          concepts: ['Lifecycle transitions and expiry', 'Object versioning', 'Cross-region replication', 'Cold tier retrieval costs'],
          quiz: [
            ['What does a lifecycle rule typically do to raw data after 90 days?', 'Move it to an infrequent-access or archive tier.'],
            ['What is the catch with archive tiers?', 'Retrieval takes minutes to hours and costs per GB.'],
          ],
          prereqs: ['Lake layout: zones, prefixes and partitions'],
        },
        {
          title: 'Working with storage from the shell',
          description: 'aws s3, gsutil and gcloud storage, az storage: syncing folders, copying with parallelism, listing large prefixes efficiently, presigned URLs, and scripting uploads in CI.',
          concepts: ['CLI sync and copy', 'Parallel transfers', 'Efficient listing', 'Presigned and signed URLs'],
          quiz: [
            ['Which command mirrors a local folder to S3?', 'aws s3 sync ./folder s3://bucket/prefix.'],
            ['What is a presigned URL?', 'A time-limited URL granting access to one object without credentials.'],
          ],
          prereqs: ['S3, GCS and ADLS compared'],
        },
      ],
    },
    {
      title: 'Cloud Data Warehouses',
      description: 'Managed analytical databases and what makes each one different.',
      topics: [
        {
          title: 'Snowflake architecture and virtual warehouses',
          description: 'Storage, compute and cloud services are separated; virtual warehouses are independent compute clusters sized by T-shirt sizes, billed per second while running, with auto-suspend and multi-cluster scaling.',
          concepts: ['Separated storage and compute', 'Virtual warehouse sizing', 'Auto-suspend and auto-resume', 'Micro-partitions and clustering'],
          quiz: [
            ['What happens to cost when a virtual warehouse is suspended?', 'Compute charges stop; only storage is billed.'],
            ['What is a micro-partition?', 'An immutable 50 to 500 MB chunk with metadata used for pruning.'],
          ],
        },
        {
          title: 'BigQuery: slots, partitioning and clustering',
          description: 'Serverless with on-demand pricing per byte scanned or reserved slots; partitioning by date and clustering by columns cut bytes scanned, and the dry-run flag tells you cost before running.',
          concepts: ['On-demand versus slot reservations', 'Partitioned tables', 'Clustered tables', 'Dry run and bytes billed'],
          quiz: [
            ['What is BigQuery on-demand billing based on?', 'Bytes scanned by the query.'],
            ['How do you avoid a full scan?', 'Filter on the partition column and select only needed columns.'],
          ],
          prereqs: ['Snowflake architecture and virtual warehouses'],
        },
        {
          title: 'Redshift and Synapse',
          description: 'Redshift as a provisioned or serverless MPP cluster with distribution and sort keys, Spectrum for querying S3; Synapse dedicated SQL pools with distribution styles and serverless pools over ADLS.',
          concepts: ['Distribution and sort keys', 'Redshift Serverless and Spectrum', 'Synapse dedicated and serverless pools', 'When these fit'],
          quiz: [
            ['What does a distribution key control in Redshift?', 'Which node stores each row, so joins on it avoid data movement.'],
            ['What does Redshift Spectrum query?', 'Files in S3 through the Glue Data Catalog.'],
          ],
          prereqs: ['Snowflake architecture and virtual warehouses'],
        },
        {
          title: 'Loading data into a warehouse',
          description: 'Bulk loading from object storage (COPY INTO, LOAD DATA, COPY from S3), staged files, external tables, and streaming inserts; why bulk loads beat row inserts and how to make loads idempotent.',
          concepts: ['COPY commands from storage', 'External tables', 'Streaming inserts', 'Idempotent loads with manifests'],
          quiz: [
            ['Why are single-row inserts a bad idea in warehouses?', 'They are slow and expensive; warehouses are built for bulk columnar loads.'],
            ['How does Snowflake avoid loading the same file twice?', 'COPY tracks loaded file names for 64 days.'],
          ],
          prereqs: ['BigQuery: slots, partitioning and clustering'],
        },
        {
          title: 'Choosing a warehouse',
          description: 'A comparison by pricing model, ecosystem fit, concurrency, governance features and lock-in; how to run a fair proof of concept with representative queries and data.',
          concepts: ['Pricing model comparison', 'Ecosystem and cloud alignment', 'Concurrency and workload isolation', 'Proof of concept design'],
          quiz: [
            ['What should a warehouse POC measure?', 'Cost and latency on your real queries and data volumes, not vendor benchmarks.'],
            ['Which pricing model favours spiky ad-hoc use?', 'Per-query or per-second billing with auto-suspend.'],
          ],
          prereqs: ['Redshift and Synapse'],
        },
      ],
    },
    {
      title: 'Lakehouse Platforms',
      description: 'Warehouse features on lake storage, mainly through Databricks.',
      topics: [
        {
          title: 'Databricks workspace and clusters',
          description: 'Workspaces, notebooks, jobs, all-purpose versus job clusters, serverless compute and cluster policies; how the control plane and data plane split across the vendor and your cloud account.',
          concepts: ['Control plane and data plane', 'All-purpose versus job clusters', 'Serverless compute', 'Cluster policies'],
          quiz: [
            ['Why use job clusters for scheduled work?', 'They start for the job and stop after, so no idle cost.'],
            ['Where does Databricks store your data?', 'In your own cloud storage account.'],
          ],
        },
        {
          title: 'Delta Lake on Databricks',
          description: 'Delta tables with ACID commits, MERGE, time travel, OPTIMIZE and Z-ORDER, VACUUM for old files, and change data feed; the medallion (bronze, silver, gold) layering it enables.',
          concepts: ['Delta transaction log', 'MERGE and time travel', 'OPTIMIZE, Z-ORDER and VACUUM', 'Medallion layers'],
          quiz: [
            ['What does VACUUM remove?', 'Files no longer referenced by the log, older than the retention threshold.'],
            ['What is the silver layer?', 'Cleaned, conformed data ready for joins and aggregation into gold.'],
          ],
          prereqs: ['Databricks workspace and clusters'],
        },
        {
          title: 'Unity Catalog',
          description: 'A cross-workspace catalogue with three-level namespaces, table and column grants, lineage capture, and external locations that map storage credentials to lake paths.',
          concepts: ['Metastore and three-level namespace', 'Grants on catalogues and tables', 'External locations and credentials', 'Automatic lineage'],
          quiz: [
            ['What does the three-level namespace look like?', 'catalog.schema.table.'],
            ['What is an external location?', 'A registered storage path tied to a credential that governs access.'],
          ],
          prereqs: ['Delta Lake on Databricks'],
        },
        {
          title: 'Open table formats across engines',
          description: 'Iceberg and Delta read by Spark, Trino, Snowflake, BigQuery and Athena; catalogues (Glue, Iceberg REST, Unity) as the shared metadata point; avoiding lock-in by choosing open formats.',
          concepts: ['Multi-engine reads', 'Catalogue as the point of truth', 'Iceberg REST catalogue', 'Format choice and lock-in'],
          quiz: [
            ['Why does the catalogue matter for multi-engine access?', 'Every engine must agree on the current table snapshot.'],
            ['Can Snowflake query Iceberg tables in your lake?', 'Yes, through Iceberg tables backed by an external volume.'],
          ],
          prereqs: ['Unity Catalog'],
        },
      ],
    },
    {
      title: 'Managed Orchestration and ETL Services',
      description: 'The provider-native tools for moving and transforming data.',
      topics: [
        {
          title: 'AWS Glue',
          description: 'Serverless Spark jobs, crawlers that populate the Glue Data Catalog, job bookmarks for incremental runs, and Glue Studio; DPU pricing and when a plain Spark job on EMR is cheaper.',
          concepts: ['Glue jobs and DPUs', 'Crawlers and the Data Catalog', 'Job bookmarks', 'Glue versus EMR'],
          quiz: [
            ['What does a Glue crawler do?', 'Scans storage, infers schemas and registers tables in the Data Catalog.'],
            ['What do job bookmarks track?', 'Which input files or rows were already processed.'],
          ],
        },
        {
          title: 'Google Cloud Dataflow and Dataproc',
          description: 'Dataflow runs Apache Beam pipelines serverlessly for batch and streaming with autoscaling; Dataproc is managed Spark and Hadoop; templates and when to pick each.',
          concepts: ['Beam pipelines on Dataflow', 'Autoscaling and streaming engine', 'Dataproc managed Spark', 'Dataflow templates'],
          quiz: [
            ['What programming model does Dataflow run?', 'Apache Beam.'],
            ['When choose Dataproc over Dataflow?', 'Existing Spark code or need for Spark-specific libraries.'],
          ],
          prereqs: ['AWS Glue'],
        },
        {
          title: 'Azure Data Factory and Synapse pipelines',
          description: 'Pipelines of activities with copy activity, mapping data flows on Spark, integration runtimes (Azure, self-hosted) for on-prem access, triggers and parameterisation.',
          concepts: ['Pipelines and activities', 'Copy activity and data flows', 'Integration runtimes', 'Triggers and parameters'],
          quiz: [
            ['What is a self-hosted integration runtime for?', 'Reaching on-premises or private network sources.'],
            ['What runs mapping data flows?', 'Managed Spark clusters spun up by Data Factory.'],
          ],
          prereqs: ['AWS Glue'],
        },
        {
          title: 'Managed Airflow and workflow services',
          description: 'MWAA, Cloud Composer, Step Functions and Cloud Workflows: when a managed Airflow is worth its baseline cost, and when a lighter state-machine service fits event-driven glue.',
          concepts: ['MWAA and Cloud Composer', 'Step Functions and Cloud Workflows', 'Baseline cost of managed Airflow', 'Event-driven glue'],
          quiz: [
            ['What is a downside of managed Airflow?', 'A fixed hourly cost even when idle.'],
            ['When does Step Functions fit better?', 'Short event-driven orchestration of Lambda and services without DAG complexity.'],
          ],
          prereqs: ['Google Cloud Dataflow and Dataproc'],
        },
        {
          title: 'Serverless functions in data pipelines',
          description: 'Lambda, Cloud Functions and Azure Functions triggered by storage events to validate, route or kick off jobs; limits on runtime and memory, and why heavy transforms belong elsewhere.',
          concepts: ['Storage event triggers', 'Runtime and memory limits', 'Function as a router', 'Retries and dead-letter queues for functions'],
          quiz: [
            ['What is a good use of a function in a pipeline?', 'Reacting to a new file by validating it and starting a job.'],
            ['Why not transform a 10 GB file in a function?', 'Time and memory limits; use Spark or a warehouse.'],
          ],
          prereqs: ['Managed Airflow and workflow services'],
        },
      ],
    },
    {
      title: 'Serverless Query Engines',
      description: 'SQL directly on the lake, paying per query.',
      topics: [
        {
          title: 'Amazon Athena',
          description: 'Presto/Trino-based SQL over S3 using the Glue Data Catalog, billed per TB scanned; partition projection, columnar formats and compression as the levers that make it cheap.',
          concepts: ['Athena and the Glue Catalog', 'Per-TB scanned pricing', 'Partition projection', 'CTAS and UNLOAD'],
          quiz: [
            ['How do you cut an Athena bill by 90 percent?', 'Convert CSV to Parquet with compression and partition the data.'],
            ['What does partition projection avoid?', 'Registering every partition in the catalogue and slow partition listing.'],
          ],
        },
        {
          title: 'Trino and Starburst',
          description: 'A distributed SQL engine that federates across object storage, warehouses and databases through connectors; coordinator and workers, memory limits, and running it yourself versus managed.',
          concepts: ['Connectors and federation', 'Coordinator and workers', 'Memory and spill settings', 'Self-hosted versus managed'],
          quiz: [
            ['What makes Trino useful beyond the lake?', 'One query can join data across Postgres, S3 and Kafka via connectors.'],
            ['What does the coordinator do?', 'Parses, plans and schedules queries across workers.'],
          ],
          prereqs: ['Amazon Athena'],
        },
        {
          title: 'BigQuery external tables and BigLake',
          description: 'Querying GCS files as external tables, BigLake for fine-grained access on lake data, and the performance gap between external and native tables.',
          concepts: ['External tables over GCS', 'BigLake access control', 'Native versus external performance', 'Object tables for unstructured data'],
          quiz: [
            ['What does BigLake add over plain external tables?', 'Row and column level security on lake files.'],
            ['Why load hot data natively?', 'Native storage is faster and supports clustering and caching.'],
          ],
          prereqs: ['Amazon Athena'],
        },
        {
          title: 'Query cost control and result caching',
          description: 'Workgroups with per-query byte limits, result caching, materialised views, and query auditing so ad-hoc analysts cannot accidentally scan petabytes.',
          concepts: ['Workgroup byte limits', 'Result cache reuse', 'Materialised views for repeated queries', 'Query audit logs'],
          quiz: [
            ['How do you stop a runaway Athena query?', 'Set a per-query data scanned limit on the workgroup.'],
            ['When is a result served from cache?', 'When the same query runs and the underlying data has not changed.'],
          ],
          prereqs: ['Trino and Starburst'],
        },
      ],
    },
    {
      title: 'Streaming Services',
      description: 'Managed event ingestion without running Kafka yourself.',
      topics: [
        {
          title: 'Amazon Kinesis Data Streams and Firehose',
          description: 'Shards as the unit of throughput and ordering, on-demand versus provisioned capacity, enhanced fan-out consumers, and Firehose for delivering streams to S3, Redshift or OpenSearch with buffering.',
          concepts: ['Shards and capacity modes', 'Enhanced fan-out', 'Firehose delivery and buffering', 'Retention and replay'],
          quiz: [
            ['What does one shard support?', '1 MB/s or 1000 records/s write and 2 MB/s read.'],
            ['What is Firehose for?', 'Delivering a stream to storage or a warehouse with batching and format conversion, no consumer code.'],
          ],
        },
        {
          title: 'Google Pub/Sub',
          description: 'Topics and subscriptions with at-least-once delivery, ack deadlines, ordering keys, dead-letter topics, and Pub/Sub to BigQuery subscriptions that skip a pipeline entirely.',
          concepts: ['Topics and subscriptions', 'Ack deadlines and redelivery', 'Ordering keys', 'BigQuery subscriptions'],
          quiz: [
            ['What happens if a message is not acked in time?', 'It is redelivered.'],
            ['How do you get ordering in Pub/Sub?', 'Set an ordering key and enable ordering on the subscription.'],
          ],
          prereqs: ['Amazon Kinesis Data Streams and Firehose'],
        },
        {
          title: 'Azure Event Hubs',
          description: 'Partitioned event ingestion with a Kafka-compatible endpoint, consumer groups, throughput units, capture to storage, and its place next to Service Bus for messaging.',
          concepts: ['Partitions and consumer groups', 'Kafka-compatible endpoint', 'Throughput units', 'Event Hubs Capture'],
          quiz: [
            ['Can Kafka clients talk to Event Hubs?', 'Yes, via the Kafka-compatible endpoint.'],
            ['What does Capture do?', 'Writes events to Blob Storage or ADLS on a schedule automatically.'],
          ],
          prereqs: ['Amazon Kinesis Data Streams and Firehose'],
        },
        {
          title: 'Managed Kafka: MSK and Confluent Cloud',
          description: 'MSK provisioned and serverless, Confluent Cloud with Schema Registry and connectors included; comparing operational burden, pricing per throughput and feature sets against native services.',
          concepts: ['MSK provisioned versus serverless', 'Confluent Cloud offering', 'Pricing by throughput', 'Managed Kafka versus native services'],
          quiz: [
            ['When choose managed Kafka over Kinesis?', 'Existing Kafka tooling, need for the Kafka ecosystem or portability.'],
            ['What does Confluent Cloud bundle that MSK does not?', 'Schema Registry, connectors and ksqlDB as managed services.'],
          ],
          prereqs: ['Google Pub/Sub'],
        },
      ],
    },
    {
      title: 'Identity, Access and Networking',
      description: 'Locking the platform down without blocking the people who need it.',
      topics: [
        {
          title: 'IAM for data services',
          description: 'Principals, roles and policies; service accounts and instance roles for jobs instead of keys; least-privilege policies scoped to bucket prefixes, datasets or tables, and how to read a deny.',
          concepts: ['Principals, roles and policies', 'Service accounts and instance roles', 'Prefix-scoped storage policies', 'Reading access denied errors'],
          quiz: [
            ['Why use an instance role instead of access keys?', 'Credentials are short-lived and rotated automatically.'],
            ['What does a policy scoped to arn:aws:s3:::bucket/raw/* allow?', 'Actions on objects under the raw prefix only.'],
          ],
        },
        {
          title: 'Warehouse access control',
          description: 'Role hierarchies in Snowflake, dataset and table IAM in BigQuery, row and column level security, dynamic data masking, and mapping business roles to warehouse roles.',
          concepts: ['Role hierarchies', 'Row and column level security', 'Dynamic data masking', 'Mapping teams to roles'],
          quiz: [
            ['What does a masking policy do?', 'Returns a redacted value for a column unless the role is allowed to see it.'],
            ['Why use a role hierarchy?', 'Grants are inherited, so permissions are managed at a few levels.'],
          ],
          prereqs: ['IAM for data services'],
        },
        {
          title: 'Encryption and key management',
          description: 'Encryption at rest by default, customer-managed keys in KMS, Cloud KMS or Key Vault for compliance, TLS in transit, and what key rotation and revocation actually do to data access.',
          concepts: ['Default versus customer-managed keys', 'Key rotation', 'Encryption in transit', 'Revoking a key'],
          quiz: [
            ['What happens if you disable a customer-managed key?', 'Data encrypted with it becomes unreadable until re-enabled.'],
            ['Why use a customer-managed key at all?', 'Auditability, control and compliance requirements.'],
          ],
          prereqs: ['IAM for data services'],
        },
        {
          title: 'Networking for data services',
          description: 'VPCs and subnets, private endpoints to storage and warehouses so traffic never crosses the internet, NAT and egress costs, and firewall rules for Spark clusters reaching databases.',
          concepts: ['VPC, subnets and security groups', 'Private endpoints and Private Link', 'NAT gateways and egress cost', 'Connectivity to on-prem sources'],
          quiz: [
            ['Why add a private endpoint for S3?', 'Traffic stays on the provider network with no NAT cost or public exposure.'],
            ['What causes a Spark cluster to fail connecting to RDS?', 'Usually a security group or subnet route missing.'],
          ],
          prereqs: ['Encryption and key management'],
        },
      ],
    },
    {
      title: 'Cost Management',
      description: 'The bill is a design input, not an afterthought.',
      topics: [
        {
          title: 'Where data platform money goes',
          description: 'Compute hours, bytes scanned, storage tiers, egress, and idle resources; reading the billing export and tagging resources so cost can be attributed to teams and pipelines.',
          concepts: ['Cost drivers by service', 'Billing export analysis', 'Tagging and labels for attribution', 'Idle resource detection'],
          quiz: [
            ['What is often the single biggest surprise cost?', 'Egress and idle compute such as running warehouses or clusters.'],
            ['How do you attribute warehouse spend to a team?', 'Tag or label resources and separate compute per team.'],
          ],
        },
        {
          title: 'Optimising compute spend',
          description: 'Auto-suspend and right-sizing warehouses, job clusters and spot instances for Spark, reserved capacity for steady workloads, and scheduling heavy jobs off-peak.',
          concepts: ['Auto-suspend and right-sizing', 'Spot and preemptible instances', 'Reservations and commitments', 'Workload scheduling'],
          quiz: [
            ['When are spot instances safe for Spark?', 'For workers when the job checkpoints or can tolerate retries.'],
            ['What does a slot reservation trade?', 'A fixed monthly cost for predictable BigQuery capacity.'],
          ],
          prereqs: ['Where data platform money goes'],
        },
        {
          title: 'Optimising storage and query spend',
          description: 'Columnar formats, partitioning, clustering, lifecycle tiers, compaction, and query patterns that avoid SELECT * so bytes scanned and stored both shrink.',
          concepts: ['Bytes scanned reduction', 'Storage tiering', 'Compaction schedules', 'Query pattern hygiene'],
          quiz: [
            ['Why does SELECT * cost more on columnar storage?', 'Every column is read instead of only the needed ones.'],
            ['What does compaction reduce?', 'File count and listing overhead, which lowers query time and cost.'],
          ],
          prereqs: ['Where data platform money goes'],
        },
        {
          title: 'Budgets, alerts and FinOps practices',
          description: 'Budgets with alerts, anomaly detection, showback reports per team, and a monthly review loop that turns cost findings into pipeline changes.',
          concepts: ['Budget alerts', 'Cost anomaly detection', 'Showback and chargeback', 'Monthly cost review'],
          quiz: [
            ['What should a cost anomaly alert trigger?', 'An investigation into which pipeline or query changed.'],
            ['What is showback?', 'Reporting costs per team without actually billing them.'],
          ],
          prereqs: ['Optimising compute spend'],
        },
      ],
    },
    {
      title: 'Infrastructure as Code and Migration',
      description: 'Repeatable platforms and moving onto them.',
      topics: [
        {
          title: 'Terraform for data platforms',
          description: 'Providers for AWS, GCP, Azure, Snowflake and Databricks; modules for buckets, IAM, warehouses and clusters; remote state, workspaces per environment and plan review in pull requests.',
          concepts: ['Providers for data services', 'Modules for platform components', 'Remote state and locking', 'Plan review in CI'],
          quiz: [
            ['Why store Terraform state remotely?', 'Shared, locked state so teams do not overwrite each other.'],
            ['Can Terraform manage Snowflake roles and warehouses?', 'Yes, through the Snowflake provider.'],
          ],
        },
        {
          title: 'Environments and promotion',
          description: 'Dev, staging and prod platforms from the same modules with different variables; separate accounts or projects for blast radius, and promoting changes through pull requests.',
          concepts: ['Environment separation', 'Account or project per environment', 'Variables per environment', 'Promotion via pull requests'],
          quiz: [
            ['Why separate accounts per environment?', 'Limits blast radius and simplifies IAM and cost boundaries.'],
            ['What should differ between staging and prod?', 'Only sizes, names and secrets, never the module code.'],
          ],
          prereqs: ['Terraform for data platforms'],
        },
        {
          title: 'Migration patterns',
          description: 'Lift-and-shift, re-platform and rebuild; running old and new in parallel with reconciliation, migrating consumers last, and cutover with a rollback path.',
          concepts: ['Lift-and-shift versus rebuild', 'Parallel run and reconciliation', 'Consumer migration order', 'Cutover and rollback'],
          quiz: [
            ['Why run old and new pipelines in parallel?', 'To compare outputs and build confidence before cutover.'],
            ['What is migrated last?', 'The consumers, once the new outputs are proven equal.'],
          ],
          prereqs: ['Environments and promotion'],
        },
        {
          title: 'On-premises to cloud data movement',
          description: 'Bulk transfer services (Snowball, Transfer Appliance, Data Box), online transfer with DataSync or Storage Transfer Service, database migration services with CDC, and bandwidth maths.',
          concepts: ['Offline appliances', 'Online transfer services', 'Database migration with CDC', 'Estimating transfer time'],
          quiz: [
            ['How long does 100 TB take at 1 Gbps?', 'Roughly nine to ten days, ignoring overhead.'],
            ['What keeps a migrated database in sync until cutover?', 'Change data capture from the source.'],
          ],
          prereqs: ['Migration patterns'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: a lake and Athena stack in Terraform',
          description: 'Provision raw and curated S3 buckets with lifecycle rules, a Glue database and crawler, an Athena workgroup with a byte limit, and IAM roles for a loader and an analyst, then load sample data and query it.',
          concepts: ['Write bucket and lifecycle modules', 'Provision Glue and Athena', 'Scope IAM for loader and analyst', 'Load Parquet and verify queries'],
          quiz: [
            ['How do you prove the analyst role cannot write?', 'Attempt an upload with that role and expect access denied.'],
            ['What does the workgroup byte limit protect?', 'The bill, by failing queries that scan too much.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: BigQuery warehouse with cost controls',
          description: 'Create datasets per environment, partitioned and clustered tables loaded from GCS, a scheduled query for a daily aggregate, custom quotas and a budget alert, and a report of bytes billed before and after clustering.',
          concepts: ['Datasets and IAM per environment', 'Partitioned and clustered loads', 'Scheduled aggregate query', 'Quota, budget and cost report'],
          quiz: [
            ['What is the expected effect of clustering on a filtered query?', 'Fewer bytes billed because blocks outside the filter are skipped.'],
            ['Where do you see bytes billed per query?', 'INFORMATION_SCHEMA.JOBS or the query job details.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: streaming ingestion with Kinesis and Firehose',
          description: 'A producer script writes events to a Kinesis stream, Firehose converts them to Parquet partitioned by hour into S3, a Glue table exposes them, and a Lambda validates each batch and reports bad records.',
          concepts: ['Provision stream and Firehose', 'Produce events from a script', 'Convert and partition to Parquet', 'Validate with a function'],
          quiz: [
            ['Why convert to Parquet in Firehose?', 'Cheaper, faster queries downstream without a separate job.'],
            ['What does the Lambda do with bad records?', 'Writes them to an error prefix and emits a metric.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: lakehouse medallion on Databricks',
          description: 'Bronze, silver and gold Delta tables from raw JSON with a job cluster, Unity Catalog grants for two groups, OPTIMIZE and VACUUM scheduled, and a comparison of query time before and after Z-ORDER.',
          concepts: ['Land bronze from raw files', 'Clean into silver with MERGE', 'Aggregate gold and grant access', 'Maintain with OPTIMIZE and VACUUM'],
          quiz: [
            ['Why MERGE into silver instead of overwriting?', 'Incremental updates keep the table current without rebuilding.'],
            ['What does Z-ORDER improve?', 'Data skipping on the ordered columns.'],
          ],
          style: 'project',
        },
        {
          title: 'Cloud data platform interview questions',
          description: 'Comparing warehouses, lake versus lakehouse, when to use Glue, Dataflow or Data Factory, IAM least privilege, cost levers, private networking, and how you have run a migration.',
          concepts: ['Service selection questions', 'Security and access questions', 'Cost optimisation questions', 'Migration experience questions'],
          quiz: [
            ['How would you cut a large BigQuery bill?', 'Partition and cluster tables, avoid SELECT *, use reservations for steady load.'],
            ['What is the difference between a lake and a lakehouse?', 'A lakehouse adds a table format with ACID, schema enforcement and governance on lake storage.'],
          ],
          style: 'reading',
        },
        {
          title: 'Designing a platform in an interview',
          description: 'Given a company profile, sketch the storage, ingestion, processing, serving and governance layers on one cloud, with the services chosen, the IAM model, the cost model and the migration path defended.',
          concepts: ['Layered platform sketch', 'Service choice justification', 'Access and governance model', 'Cost and growth estimates'],
          quiz: [
            ['What do you ask before choosing services?', 'Existing cloud, team skills, data volume, latency needs and compliance.'],
            ['How do you present cost?', 'Per layer with the main driver and the levers to reduce it.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
