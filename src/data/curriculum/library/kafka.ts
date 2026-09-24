import { defineTrack } from '../define'

export const kafka = defineTrack({
  id: 'track-kafka',
  title: 'Apache Kafka',
  description: 'Kafka as a durable, partitioned event log: topics and offsets, producers and consumer groups, delivery guarantees, Schema Registry, Connect, Streams and ksqlDB, retention and replication, security, operations, and the patterns (CDC, event sourcing) teams build on it.',
  family: 'Data Engineering',
  kind: 'tooling',
  icon: '📨',
  tags: ['kafka', 'streaming', 'event-driven', 'messaging', 'confluent', 'data-engineering'],
  languages: ['Python', 'Shell', 'YAML'],
  explainMode: 'data',
  code: { label: 'Python (confluent-kafka) with shell and YAML where needed', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Foundations and Setup',
      description: 'What Kafka is, how a cluster is put together, and a local setup to experiment against.',
      topics: [
        {
          title: 'Kafka as a distributed commit log',
          description: 'Kafka stores events in an append-only, partitioned log that many consumers read independently at their own pace; why that model decouples producers from consumers and replaces point-to-point queues and nightly file drops.',
          concepts: ['Append-only log versus a queue', 'Decoupling producers and consumers', 'Events, records and topics', 'Where Kafka fits in a data platform'],
          quiz: [
            ['How does Kafka differ from a traditional message queue?', 'Messages are retained in a log and can be read by many consumers; reading does not delete them.'],
            ['What is a record made of?', 'A key, a value, headers, a timestamp and, once written, a partition and offset.'],
          ],
        },
        {
          title: 'Brokers, clusters and KRaft',
          description: 'A cluster is a set of brokers that host partitions; how the controller assigns leadership, and how KRaft replaced ZooKeeper for cluster metadata so a cluster runs without a separate coordination service.',
          concepts: ['Brokers and the controller', 'Cluster metadata in KRaft', 'ZooKeeper legacy and migration', 'Broker ids and listeners'],
          quiz: [
            ['What does KRaft replace?', 'ZooKeeper, by storing cluster metadata in an internal Raft-replicated log.'],
            ['What does the controller do?', 'Elects partition leaders and tracks broker membership.'],
          ],
          prereqs: ['Kafka as a distributed commit log'],
        },
        {
          title: 'Running Kafka locally with Docker Compose',
          description: 'A single-broker KRaft cluster in Docker Compose with Schema Registry and a UI, the listener settings that trip everyone up (advertised.listeners), and how to reset the cluster between experiments.',
          concepts: ['Compose file for a KRaft broker', 'Advertised listeners and host access', 'Adding Schema Registry and a UI', 'Resetting data volumes'],
          quiz: [
            ['Why can a client connect to the broker but then time out?', 'The advertised listener points at a hostname the client cannot reach.'],
            ['Which port do clients usually use for a local broker?', '9092.'],
          ],
          prereqs: ['Brokers, clusters and KRaft'],
        },
        {
          title: 'CLI tools and first messages',
          description: 'kafka-topics, kafka-console-producer and kafka-console-consumer for creating topics, sending and reading records, describing partitions, and inspecting consumer groups before writing any application code.',
          concepts: ['Creating and describing topics', 'Console producer and consumer', 'Reading from the beginning', 'Inspecting consumer groups from the CLI'],
          quiz: [
            ['Which flag makes the console consumer read from the start?', '--from-beginning.'],
            ['Which tool lists consumer groups and their lag?', 'kafka-consumer-groups --describe.'],
          ],
          prereqs: ['Running Kafka locally with Docker Compose'],
        },
      ],
    },
    {
      title: 'Topics, Partitions and Offsets',
      description: 'The storage model that every guarantee in Kafka rests on.',
      topics: [
        {
          title: 'Topics and partitions',
          description: 'A topic is split into partitions, each an ordered, immutable sequence; partitions are the unit of parallelism, placement and ordering, so the count chosen at creation shapes throughput and consumer scaling.',
          concepts: ['Partitions as ordered logs', 'Partition leaders and followers', 'Parallelism bounded by partitions', 'Topic configuration overrides'],
          quiz: [
            ['Is ordering guaranteed across a whole topic?', 'No, only within a partition.'],
            ['What limits how many consumers in a group can work in parallel?', 'The number of partitions.'],
          ],
        },
        {
          title: 'Offsets and consumer position',
          description: 'Each record has a monotonically increasing offset within its partition; consumers track their position by committing offsets, which is what makes replay, resume and lag measurement possible.',
          concepts: ['Offset numbering per partition', 'Committed offset versus current position', 'Log-end offset and lag', 'Seeking to an offset or timestamp'],
          quiz: [
            ['What is consumer lag?', 'The difference between the log-end offset and the consumer\'s committed offset.'],
            ['Can you re-read old records?', 'Yes, by seeking to an earlier offset while they are still retained.'],
          ],
          prereqs: ['Topics and partitions'],
        },
        {
          title: 'Keys, partitioning and ordering',
          description: 'Records with the same key hash to the same partition, which gives per-key ordering (all events for one customer in sequence); null keys round-robin or stick to batches, and hot keys skew partition load.',
          concepts: ['Hash partitioning by key', 'Per-key ordering guarantee', 'Null keys and sticky partitioning', 'Hot keys and skew'],
          quiz: [
            ['How do you keep all events for one order in sequence?', 'Use the order id as the record key.'],
            ['What happens to ordering if partition count changes?', 'Existing keys may map to different partitions, breaking historical ordering per key.'],
          ],
          prereqs: ['Topics and partitions'],
        },
        {
          title: 'Choosing partition counts and replication factor',
          description: 'Sizing a topic: target throughput per partition, expected consumer parallelism, the cost of too many partitions on brokers, and why replication factor 3 with min.insync.replicas 2 is the usual production baseline.',
          concepts: ['Throughput per partition', 'Consumer parallelism target', 'Cost of excessive partitions', 'Replication factor baseline'],
          quiz: [
            ['Can you reduce a topic\'s partition count?', 'No, it can only be increased.'],
            ['What is a common production replication factor?', '3.'],
          ],
          prereqs: ['Keys, partitioning and ordering'],
        },
      ],
    },
    {
      title: 'Producers',
      description: 'Writing records with confluent-kafka and choosing the durability and throughput trade-offs deliberately.',
      topics: [
        {
          title: 'The producer API in confluent-kafka',
          description: 'Configuring a Producer, produce() as an asynchronous buffered call, delivery callbacks that report success or error per record, and why poll() and flush() must be called for callbacks to fire and buffers to drain.',
          concepts: ['Producer configuration dictionary', 'produce() and buffering', 'Delivery report callbacks', 'poll() and flush() semantics'],
          quiz: [
            ['Why do delivery callbacks never fire?', 'poll() or flush() was not called to service the delivery queue.'],
            ['What does flush() do?', 'Blocks until all buffered records are delivered or fail.'],
          ],
        },
        {
          title: 'acks, retries and durability',
          description: 'acks=0, 1 and all trade latency for safety: all waits for every in-sync replica, and with retries and delivery.timeout.ms the producer survives transient broker failures without losing acknowledged writes.',
          concepts: ['acks=0, 1 and all', 'retries and delivery.timeout.ms', 'In-sync replica acknowledgement', 'Choosing durability per topic'],
          quiz: [
            ['What does acks=all guarantee?', 'The record is written to all in-sync replicas before acknowledgement.'],
            ['Can retries reorder records?', 'Yes, unless max.in.flight is 1 or idempotence is enabled.'],
          ],
          prereqs: ['The producer API in confluent-kafka'],
        },
        {
          title: 'Idempotent producers',
          description: 'enable.idempotence assigns a producer id and sequence numbers so broker-side deduplication removes duplicates from retries, giving exactly-once per partition per producer session with ordering preserved.',
          concepts: ['Producer id and sequence numbers', 'Broker-side deduplication', 'Ordering with max.in.flight up to 5', 'Limits of idempotence'],
          quiz: [
            ['What does enable.idempotence prevent?', 'Duplicate records caused by producer retries.'],
            ['Does idempotence dedupe across producer restarts?', 'No, a restart gets a new producer id.'],
          ],
          prereqs: ['acks, retries and durability'],
        },
        {
          title: 'Batching, compression and linger',
          description: 'batch.size and linger.ms collect records into larger requests; compression.type (lz4, zstd, snappy, gzip) shrinks them on the wire and disk; the combination is where most producer throughput comes from.',
          concepts: ['batch.size and linger.ms', 'Compression codecs compared', 'Throughput versus latency trade-off', 'buffer.memory and backpressure'],
          quiz: [
            ['What does linger.ms do?', 'Waits up to that many milliseconds to fill a batch before sending.'],
            ['Which codec balances speed and ratio well for most workloads?', 'lz4 or zstd.'],
          ],
          prereqs: ['The producer API in confluent-kafka'],
        },
        {
          title: 'Headers, timestamps and custom partitioners',
          description: 'Record headers carry metadata such as trace ids and schema hints without touching the payload; CreateTime versus LogAppendTime timestamps; and when a custom partitioning function beats the default hash.',
          concepts: ['Record headers for metadata', 'CreateTime versus LogAppendTime', 'Custom partitioner functions', 'Tracing across producers and consumers'],
          quiz: [
            ['Where should a correlation id go?', 'In a record header.'],
            ['Which timestamp does the broker set?', 'LogAppendTime, when configured on the topic.'],
          ],
          prereqs: ['The producer API in confluent-kafka'],
        },
      ],
    },
    {
      title: 'Consumers and Delivery Semantics',
      description: 'Reading reliably: groups, rebalances, commits and the guarantees you can actually get.',
      topics: [
        {
          title: 'The consumer poll loop',
          description: 'A Consumer subscribes and loops on poll(); how max.poll.interval.ms and session.timeout.ms detect a dead or stuck consumer, and why heavy processing inside the loop causes surprise rebalances.',
          concepts: ['subscribe() and poll()', 'max.poll.interval.ms and session.timeout.ms', 'Handling errors in the loop', 'Graceful close and shutdown'],
          quiz: [
            ['What happens if poll() is not called within max.poll.interval.ms?', 'The consumer is removed from the group and a rebalance starts.'],
            ['Why call close() on shutdown?', 'It commits offsets and leaves the group promptly instead of waiting for a timeout.'],
          ],
        },
        {
          title: 'Consumer groups and rebalancing',
          description: 'Members of a group.id split a topic\'s partitions among themselves; how the group coordinator assigns partitions, why eager rebalances stop the world, and how cooperative sticky assignment reduces the pause.',
          concepts: ['group.id and the group coordinator', 'Partition assignment strategies', 'Eager versus cooperative rebalancing', 'Static membership with group.instance.id'],
          quiz: [
            ['What happens with more consumers than partitions?', 'Extra consumers sit idle.'],
            ['What does cooperative sticky assignment improve?', 'Only affected partitions are revoked, so the rest keep processing during a rebalance.'],
          ],
          prereqs: ['The consumer poll loop'],
        },
        {
          title: 'Offset commits: auto and manual',
          description: 'enable.auto.commit commits on a timer regardless of processing state; manual commit after processing (sync or async) is what makes at-least-once real, and commit granularity controls how much is reprocessed after a crash.',
          concepts: ['Auto commit and its gap', 'Synchronous and asynchronous commit', 'Committing per batch versus per record', 'Storing offsets outside Kafka'],
          quiz: [
            ['Why can auto commit lose messages?', 'Offsets may be committed before the records are actually processed.'],
            ['When should you commit synchronously?', 'On shutdown or before a rebalance, to be sure the commit landed.'],
          ],
          prereqs: ['Consumer groups and rebalancing'],
        },
        {
          title: 'At-most-once and at-least-once delivery',
          description: 'Commit-before-process yields at-most-once (may drop), process-before-commit yields at-least-once (may duplicate); why consumers should be idempotent and how a dedupe key or upsert makes duplicates harmless.',
          concepts: ['Commit order determines semantics', 'Idempotent consumer design', 'Deduplication keys and upserts', 'Choosing semantics per use case'],
          quiz: [
            ['Which is the default outcome with process-then-commit?', 'At-least-once.'],
            ['How does a sink stay correct under duplicates?', 'Upsert on a natural key so replays overwrite the same row.'],
          ],
          prereqs: ['Offset commits: auto and manual'],
        },
        {
          title: 'Exactly-once with transactions',
          description: 'A transactional producer writes output records and the consumer\'s offsets atomically; read_committed consumers skip aborted data, giving exactly-once for Kafka-to-Kafka pipelines but not for arbitrary external sinks.',
          concepts: ['transactional.id and fencing', 'send_offsets_to_transaction', 'read_committed isolation', 'Boundaries of exactly-once'],
          quiz: [
            ['What does a transactional producer commit atomically?', 'Output records plus the consumed offsets.'],
            ['Does Kafka give exactly-once into an external database?', 'No, that needs an idempotent or transactional sink of its own.'],
          ],
          prereqs: ['At-most-once and at-least-once delivery'],
        },
      ],
    },
    {
      title: 'Serialization and Schema Registry',
      description: 'Bytes on the wire need a contract; Schema Registry makes that contract enforceable.',
      topics: [
        {
          title: 'Serialization choices',
          description: 'JSON is readable but untyped and bulky; Avro and Protobuf are compact and schema-driven; how the serializer and deserializer must agree, and the wire format Confluent uses (magic byte plus schema id).',
          concepts: ['JSON versus binary formats', 'Serializer and deserializer pairing', 'Confluent wire format', 'Payload size and throughput impact'],
          quiz: [
            ['What do the first five bytes of a Confluent-serialized record contain?', 'A magic byte and the 4-byte schema id.'],
            ['Why not just use JSON everywhere?', 'No enforced schema, larger payloads and slower parsing.'],
          ],
        },
        {
          title: 'Schema Registry',
          description: 'A service that stores versioned schemas per subject and rejects incompatible changes at register time; how the serializer fetches and caches schemas by id so consumers always know how to decode a record.',
          concepts: ['Subjects and schema versions', 'Subject naming strategies', 'Registering via API and client', 'Schema caching in clients'],
          quiz: [
            ['What is the default subject name for a topic\'s value?', '<topic>-value.'],
            ['What does the registry return when a schema is registered?', 'A globally unique schema id.'],
          ],
          prereqs: ['Serialization choices'],
        },
        {
          title: 'Avro with confluent-kafka',
          description: 'Defining an Avro schema, using AvroSerializer and AvroDeserializer with to_dict and from_dict hooks, and how defaults and unions let a schema evolve without breaking old readers.',
          concepts: ['Avro schema definition', 'AvroSerializer and AvroDeserializer', 'Records, unions and defaults', 'Logical types for dates and decimals'],
          quiz: [
            ['How do you make a new field backward compatible in Avro?', 'Give it a default value.'],
            ['What is a union used for?', 'Optional or multi-type fields, typically ["null", "string"].'],
          ],
          prereqs: ['Schema Registry'],
        },
        {
          title: 'Protobuf and JSON Schema',
          description: 'Protobuf field numbers make evolution safe by design and generated classes give typed access; JSON Schema validates loosely typed payloads; when each is preferred and how Schema Registry handles them.',
          concepts: ['Protobuf messages and field numbers', 'Generated classes with protoc', 'JSON Schema validation', 'Picking a format for a team'],
          quiz: [
            ['Why must Protobuf field numbers never be reused?', 'Old data would be decoded into the wrong field.'],
            ['When is JSON Schema a good fit?', 'When producers already emit JSON and you need validation without a new format.'],
          ],
          prereqs: ['Schema Registry'],
        },
        {
          title: 'Schema evolution and compatibility',
          description: 'BACKWARD, FORWARD and FULL compatibility modes define which changes are allowed (add with default, remove optional); why backward is the default and how upgrade order of producers and consumers depends on the mode.',
          concepts: ['Compatibility modes compared', 'Safe versus breaking changes', 'Upgrade order of producers and consumers', 'Transitive compatibility'],
          quiz: [
            ['Under BACKWARD compatibility, who upgrades first?', 'Consumers.'],
            ['Is removing a required field backward compatible?', 'No, new readers cannot read old data without it.'],
          ],
          prereqs: ['Avro with confluent-kafka'],
        },
      ],
    },
    {
      title: 'Kafka Connect, Streams and ksqlDB',
      description: 'The ecosystem that moves data in and out and processes it without custom services.',
      topics: [
        {
          title: 'Kafka Connect architecture',
          description: 'Connect runs connectors as tasks across a cluster of workers, storing config, offsets and status in internal topics; distributed mode versus standalone, and the REST API that manages connectors.',
          concepts: ['Workers, connectors and tasks', 'Internal config and offset topics', 'Standalone versus distributed mode', 'Connect REST API'],
          quiz: [
            ['Where does Connect store source offsets?', 'In an internal Kafka topic (connect-offsets).'],
            ['How do you scale a connector?', 'Raise tasks.max and add workers.'],
          ],
        },
        {
          title: 'Source and sink connectors',
          description: 'JDBC and Debezium sources pull database changes into topics; S3, JDBC and Elasticsearch sinks write topics out; configuring converters, error tolerance and dead-letter topics for a resilient connector.',
          concepts: ['JDBC source and sink configuration', 'S3 sink partitioning and formats', 'Converters and Schema Registry', 'errors.tolerance and dead-letter topics'],
          quiz: [
            ['What does errors.tolerance=all do?', 'Skips bad records instead of failing the task, optionally routing them to a DLQ.'],
            ['Which converter emits Avro with a registry?', 'io.confluent.connect.avro.AvroConverter.'],
          ],
          prereqs: ['Kafka Connect architecture'],
        },
        {
          title: 'Single message transforms',
          description: 'SMTs modify records inside a connector pipeline (rename fields, mask values, route by topic, set keys) without a separate stream job; chaining transforms and knowing when logic has outgrown them.',
          concepts: ['Built-in transforms', 'Chaining transforms in order', 'Extracting keys and routing topics', 'Limits of SMTs'],
          quiz: [
            ['Which SMT sets the record key from a field?', 'ValueToKey followed by ExtractField.'],
            ['When should an SMT be replaced by a stream processor?', 'When the logic needs state, joins or aggregation.'],
          ],
          prereqs: ['Source and sink connectors'],
        },
        {
          title: 'Kafka Streams overview',
          description: 'A Java library for stateful stream processing inside a normal application: KStream and KTable, stateful operators backed by RocksDB and changelog topics, and how tasks scale with partitions.',
          concepts: ['KStream versus KTable', 'Stateful operators and state stores', 'Changelog topics for fault tolerance', 'Scaling by partitions and threads'],
          quiz: [
            ['Does Kafka Streams need a separate cluster?', 'No, it runs inside your application.'],
            ['How is local state recovered after a crash?', 'Replayed from its changelog topic.'],
          ],
        },
        {
          title: 'ksqlDB overview',
          description: 'SQL over topics: streams and tables, persistent queries that write derived topics, push and pull queries, and where ksqlDB is enough versus when a code-based processor is needed.',
          concepts: ['Streams and tables in ksqlDB', 'Persistent queries', 'Push versus pull queries', 'Choosing ksqlDB over code'],
          quiz: [
            ['What does a persistent query produce?', 'A new topic continuously populated from the query.'],
            ['What is a pull query?', 'A point-in-time lookup against a materialised table.'],
          ],
          prereqs: ['Kafka Streams overview'],
        },
      ],
    },
    {
      title: 'Storage, Retention and Replication',
      description: 'How records live on disk and how the cluster keeps them safe.',
      topics: [
        {
          title: 'Log segments and retention',
          description: 'Partitions are stored as rolled segment files with offset and time indexes; retention.ms and retention.bytes delete whole segments, so the active segment is never purged and data outlives the configured time slightly.',
          concepts: ['Segment files and indexes', 'retention.ms and retention.bytes', 'Segment rolling and deletion', 'Tiered storage overview'],
          quiz: [
            ['At what granularity is data deleted?', 'Whole segments, never individual records.'],
            ['Why might data outlive retention.ms?', 'The segment containing it is still active or not yet checked by the cleaner.'],
          ],
        },
        {
          title: 'Log compaction',
          description: 'cleanup.policy=compact keeps only the latest record per key, with tombstones for deletes, turning a topic into a changelog you can rebuild state from; how the cleaner works and its delay settings.',
          concepts: ['Latest value per key', 'Tombstones and delete retention', 'Cleaner threads and dirty ratio', 'Compacted topics as changelogs'],
          quiz: [
            ['How do you delete a key from a compacted topic?', 'Produce a record with that key and a null value (tombstone).'],
            ['Can a compacted topic also delete by time?', 'Yes, with cleanup.policy=compact,delete.'],
          ],
          prereqs: ['Log segments and retention'],
        },
        {
          title: 'Replication, ISR and leader election',
          description: 'Each partition has a leader and followers that fetch from it; the in-sync replica set tracks who is caught up, and a follower in the ISR is promoted when the leader fails so writes are not lost.',
          concepts: ['Leader and follower replicas', 'In-sync replica set', 'High watermark and visibility', 'Preferred leader election'],
          quiz: [
            ['What is the high watermark?', 'The offset up to which all ISR replicas have the data; consumers cannot read beyond it.'],
            ['What removes a follower from the ISR?', 'Falling behind by more than replica.lag.time.max.ms.'],
          ],
          prereqs: ['Log segments and retention'],
        },
        {
          title: 'min.insync.replicas and unclean elections',
          description: 'With acks=all, min.insync.replicas sets how many replicas must confirm a write or the producer gets an error; unclean.leader.election.enable trades data loss for availability when no in-sync replica is left.',
          concepts: ['min.insync.replicas with acks=all', 'NotEnoughReplicas errors', 'Unclean leader election trade-off', 'Durability configuration checklist'],
          quiz: [
            ['What does replication.factor=3 with min.insync.replicas=2 tolerate?', 'One broker failure without rejecting writes.'],
            ['What risk does unclean leader election carry?', 'An out-of-date replica becomes leader and acknowledged data is lost.'],
          ],
          prereqs: ['Replication, ISR and leader election'],
        },
      ],
    },
    {
      title: 'Security',
      description: 'Encrypting traffic, proving identity and limiting what each client may do.',
      topics: [
        {
          title: 'TLS encryption and listeners',
          description: 'Configuring SSL listeners with keystores and truststores, enabling client authentication with certificates, and the listener-per-protocol layout that keeps plaintext off the network.',
          concepts: ['Keystores and truststores', 'SSL listener configuration', 'Mutual TLS for clients', 'Listener and protocol mapping'],
          quiz: [
            ['What does the truststore hold?', 'The CA certificates the broker or client trusts.'],
            ['Which security.protocol value enables encryption only?', 'SSL.'],
          ],
        },
        {
          title: 'SASL authentication',
          description: 'SASL/PLAIN, SCRAM-SHA-512 and OAUTHBEARER authenticate clients with credentials rather than certificates; how SCRAM credentials are stored in cluster metadata and how confluent-kafka is configured for each mechanism.',
          concepts: ['SASL mechanisms compared', 'SCRAM user management', 'Client sasl.* configuration', 'OAuth with an identity provider'],
          quiz: [
            ['Why prefer SCRAM over PLAIN?', 'Passwords are stored and exchanged as salted hashes, not cleartext.'],
            ['Which security.protocol combines SASL and TLS?', 'SASL_SSL.'],
          ],
          prereqs: ['TLS encryption and listeners'],
        },
        {
          title: 'ACLs and authorization',
          description: 'The built-in authorizer grants principals operations (Read, Write, Create) on resources (topics, groups, cluster) with literal or prefixed patterns; least privilege for producers, consumers and Connect workers.',
          concepts: ['Principals, operations and resources', 'Literal and prefixed patterns', 'ACLs for producers and consumers', 'Super users and audit'],
          quiz: [
            ['Which ACLs does a consumer need?', 'Read on the topic and Read on its consumer group.'],
            ['What is a prefixed ACL good for?', 'Granting access to every topic under a team\'s naming prefix.'],
          ],
          prereqs: ['SASL authentication'],
        },
      ],
    },
    {
      title: 'Operations and Monitoring',
      description: 'Keeping a cluster and its clients healthy in production.',
      topics: [
        {
          title: 'Broker and client metrics',
          description: 'The JMX metrics that matter: under-replicated partitions, request latency, network and request handler idle ratios, producer record-error-rate and consumer fetch latency; exporting them with a JMX exporter to Prometheus.',
          concepts: ['Under-replicated partitions', 'Request and network handler idle', 'Producer and consumer client metrics', 'JMX exporter and dashboards'],
          quiz: [
            ['What does a non-zero under-replicated partition count mean?', 'Some followers have fallen out of the ISR, so durability is reduced.'],
            ['Which client metric signals producer overload?', 'A growing record-queue-time or buffer exhaustion.'],
          ],
        },
        {
          title: 'Consumer lag monitoring',
          description: 'Lag per partition is the primary health signal for a consumer: measuring it with kafka-consumer-groups, Burrow or exporters, alerting on trend rather than instantaneous values, and tracing lag to slow processing or rebalances.',
          concepts: ['Lag per partition and per group', 'Exporters for lag metrics', 'Alerting on lag trend', 'Diagnosing rising lag'],
          quiz: [
            ['Why alert on lag trend instead of a fixed number?', 'A burst can spike lag briefly; sustained growth is the real problem.'],
            ['What is a common cause of lag on one partition only?', 'A hot key concentrating traffic on that partition.'],
          ],
          prereqs: ['Broker and client metrics'],
        },
        {
          title: 'Partition reassignment and cluster changes',
          description: 'Adding brokers does not move data by itself: kafka-reassign-partitions generates and executes moves with throttles, and rolling restarts rely on preferred leader election to keep leadership balanced.',
          concepts: ['Generating a reassignment plan', 'Throttling replica movement', 'Rolling restarts safely', 'Rebalancing leadership'],
          quiz: [
            ['What happens to existing partitions when a broker is added?', 'Nothing until a reassignment moves them.'],
            ['Why throttle a reassignment?', 'To stop replication traffic from starving client requests.'],
          ],
          prereqs: ['Broker and client metrics'],
        },
        {
          title: 'Troubleshooting common failures',
          description: 'A diagnostic playbook: producers timing out, consumers rebalancing in loops, offsets reset unexpectedly, disks filling from misconfigured retention, and reading broker logs to find the actual cause.',
          concepts: ['Producer timeout diagnosis', 'Rebalance storms', 'Unexpected offset resets', 'Disk and retention incidents'],
          quiz: [
            ['What does auto.offset.reset=earliest do after a group loses its offsets?', 'Starts from the beginning of each partition, reprocessing everything.'],
            ['What usually causes a rebalance loop?', 'Processing longer than max.poll.interval.ms.'],
          ],
          prereqs: ['Consumer lag monitoring'],
        },
      ],
    },
    {
      title: 'Design Patterns and Performance',
      description: 'The architectures Kafka enables and the settings that make them fast.',
      topics: [
        {
          title: 'Event sourcing and event-driven services',
          description: 'Storing state changes as immutable events that services consume to build their own views; how compacted topics act as the source of truth and how the outbox pattern publishes events atomically with a database write.',
          concepts: ['Events as the source of truth', 'Rebuilding views from a log', 'Transactional outbox pattern', 'Event schema design'],
          quiz: [
            ['What problem does the outbox pattern solve?', 'Writing to a database and publishing an event atomically without dual writes.'],
            ['Why keep events immutable?', 'Consumers can replay history and derive new views deterministically.'],
          ],
        },
        {
          title: 'Change data capture with Debezium',
          description: 'Debezium reads a database\'s write-ahead log and emits row-level change events per table with before and after images; snapshotting, the envelope format, and handling schema changes and deletes downstream.',
          concepts: ['Log-based CDC versus polling', 'Debezium change event envelope', 'Initial snapshots', 'Deletes and schema changes downstream'],
          quiz: [
            ['Why is log-based CDC preferred over query polling?', 'It captures every change including deletes with low load on the source.'],
            ['What does the "op" field in a Debezium event mean?', 'The operation: c (create), u (update), d (delete) or r (snapshot read).'],
          ],
          prereqs: ['Event sourcing and event-driven services'],
        },
        {
          title: 'Retries, dead-letter topics and poison messages',
          description: 'A record that keeps failing must not block a partition: retry topics with backoff, a dead-letter topic with error headers for inspection, and a replay tool that resubmits fixed records.',
          concepts: ['Retry topics with backoff', 'Dead-letter topic design', 'Error metadata in headers', 'Replaying from a DLQ'],
          quiz: [
            ['Why not retry in place forever?', 'It stalls every other record behind it in the partition.'],
            ['What should a DLQ record carry?', 'The original payload plus headers describing the error, source topic and offset.'],
          ],
          prereqs: ['Event sourcing and event-driven services'],
        },
        {
          title: 'Producer and consumer performance tuning',
          description: 'Working through the levers in order: batching and compression on producers, fetch.min.bytes and max.poll.records on consumers, partition count, and measuring with kafka-producer-perf-test before and after.',
          concepts: ['Producer throughput levers', 'Consumer fetch tuning', 'Measuring with perf-test tools', 'Finding the bottleneck first'],
          quiz: [
            ['What does fetch.min.bytes do?', 'Makes the broker wait until that many bytes are available, trading latency for fewer requests.'],
            ['Which tool benchmarks producer throughput?', 'kafka-producer-perf-test.'],
          ],
          prereqs: ['Retries, dead-letter topics and poison messages'],
        },
        {
          title: 'Multi-cluster replication and disaster recovery',
          description: 'MirrorMaker 2 and Cluster Linking replicate topics across regions with offset translation; active-passive versus active-active layouts and what a failover actually requires from consumers.',
          concepts: ['MirrorMaker 2 basics', 'Offset translation across clusters', 'Active-passive versus active-active', 'Failover runbook'],
          quiz: [
            ['Why is offset translation needed?', 'Offsets differ between clusters, so consumers need mapped positions after failover.'],
            ['What does MirrorMaker 2 run on?', 'The Kafka Connect framework.'],
          ],
          prereqs: ['Producer and consumer performance tuning'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: order events pipeline with Schema Registry',
          description: 'Build a producer that emits Avro order events keyed by order id, a consumer group that enriches and upserts them into Postgres with manual commits, and a compatibility test that rejects a breaking schema change.',
          concepts: ['Design the topic and Avro schema', 'Write the keyed producer', 'Implement idempotent consumer with commits', 'Prove schema compatibility in CI'],
          quiz: [
            ['Why key by order id?', 'So all updates to one order stay ordered in one partition.'],
            ['How is the consumer safe under replay?', 'It upserts on order id, so duplicates overwrite the same row.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CDC from Postgres to a data lake',
          description: 'Run Debezium via Kafka Connect against a Postgres database, land change events in S3 (or MinIO) as Parquet with an S3 sink connector partitioned by date, and verify deletes and updates are represented.',
          concepts: ['Enable logical replication', 'Configure the Debezium connector', 'Configure the S3 sink and partitioning', 'Validate the landed data'],
          quiz: [
            ['What Postgres setting must be on for Debezium?', 'wal_level=logical.'],
            ['How does a delete appear in the lake?', 'As a change event with op=d and a before image.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: exactly-once enrichment service',
          description: 'A consume-transform-produce service that reads clickstream events, joins them to a compacted user-profile topic held in memory, and writes enriched events with a transactional producer, with a test that kills the service mid-batch.',
          concepts: ['Load a compacted topic into state', 'Transform inside a transaction', 'Commit offsets with the transaction', 'Chaos test the restart'],
          quiz: [
            ['What does the consumer need to see only committed output?', 'isolation.level=read_committed.'],
            ['What fences a zombie instance?', 'The transactional.id and its epoch.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: secured cluster with monitoring',
          description: 'A three-broker KRaft cluster in Docker Compose with SASL_SSL listeners, ACLs for a producer and consumer principal, the JMX exporter feeding Prometheus, and a Grafana dashboard with an alert on consumer lag.',
          concepts: ['Generate certificates and SCRAM users', 'Configure listeners and ACLs', 'Export metrics to Prometheus', 'Build the dashboard and alert'],
          quiz: [
            ['Which ACLs does the producer principal need?', 'Write and Describe on its topic.'],
            ['What should the lag alert key on?', 'Sustained growth over several minutes, not a single spike.'],
          ],
          style: 'project',
        },
        {
          title: 'Kafka interview questions',
          description: 'The recurring questions: why partitions matter, how consumer groups scale, what acks=all really guarantees, exactly-once boundaries, compaction versus retention, and how you would size and secure a cluster.',
          concepts: ['Partitioning and ordering questions', 'Delivery guarantee questions', 'Operations and sizing questions', 'Explaining trade-offs with examples'],
          quiz: [
            ['Explain when exactly-once applies.', 'For Kafka-to-Kafka flows with transactions and read_committed consumers.'],
            ['How do you scale consumption?', 'Add consumers to the group up to the partition count, or add partitions.'],
          ],
          style: 'reading',
        },
        {
          title: 'Kafka system design scenarios',
          description: 'Whiteboard exercises: a clickstream ingestion path, a CDC feed into a warehouse, a notification fan-out, and an audit log, each with topic layout, keys, retention and failure handling argued out loud.',
          concepts: ['Topic and key design for a scenario', 'Retention and compaction decisions', 'Failure and replay handling', 'Capacity estimation'],
          quiz: [
            ['How would you design an audit log topic?', 'Long retention, key by entity id, replication factor 3, read-only ACLs for consumers.'],
            ['Where would you put per-user fan-out?', 'A consumer group per downstream service reading the same topic.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
