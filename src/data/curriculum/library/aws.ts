import { defineTrack } from '../define'

export const aws = defineTrack({
  id: 'track-aws',
  title: 'AWS',
  description: 'Amazon Web Services from the first IAM role to a well-architected, cost-aware system: compute, storage, databases, VPC networking, messaging, observability, infrastructure as code, security services, serverless designs and Solutions Architect Associate review.',
  family: 'Cloud, DevOps & Platform',
  kind: 'tooling',
  icon: '☁️',
  tags: ['aws', 'cloud', 'ec2', 's3', 'lambda', 'vpc', 'iam', 'serverless', 'solutions-architect'],
  languages: ['Shell', 'YAML'],
  explainMode: 'devops',
  code: { label: 'shell, YAML, HCL or Dockerfile, whichever fits', id: 'bash', fixed: true },
  supports: { labs: true, project: true },
  prerequisites: ['track-linux'],
  style: 'practice',
  categories: [
    {
      title: 'Accounts, Identity and Global Infrastructure',
      description: 'The account boundary, who can do what, and where resources physically live.',
      topics: [
        {
          title: 'Accounts, the root user and Organizations',
          description: 'An account is the billing and isolation boundary; the root user must be locked down with MFA and never used day to day, and AWS Organizations groups accounts under OUs with service control policies.',
          concepts: ['Account as the isolation boundary', 'Locking down the root user', 'Organizations, OUs and consolidated billing', 'Service control policies', 'Multi-account landing zones'],
          quiz: [
            ['What should you do with the root user after creating an account?', 'Enable MFA, remove access keys and use IAM identities instead.'],
            ['Can an SCP grant permissions?', 'No, SCPs only set the maximum permissions an account can use.'],
            ['Why use multiple accounts instead of one?', 'Blast-radius isolation, separate billing and simpler per-environment guardrails.'],
          ],
        },
        {
          title: 'IAM users, groups and roles',
          description: 'IAM users hold long-lived credentials, groups attach policies to many users, and roles are assumed temporarily by people, services or other accounts via STS, which is why roles are preferred for workloads.',
          concepts: ['Users and access keys', 'Groups for policy attachment', 'Roles and trust policies', 'AssumeRole and STS temporary credentials', 'Instance profiles and service roles'],
          quiz: [
            ['How does an EC2 instance get AWS permissions without keys?', 'Attach an IAM role through an instance profile; credentials come from the metadata service.'],
            ['What does a trust policy define?', 'Which principals are allowed to assume the role.'],
            ['Why prefer roles over access keys for applications?', 'Credentials are temporary and rotated automatically, so nothing long-lived leaks.'],
          ],
          prereqs: ['Accounts, the root user and Organizations'],
        },
        {
          title: 'IAM policies and least privilege',
          description: 'Policy documents with Effect, Action, Resource and Condition, how identity and resource policies combine, why an explicit Deny always wins, and using Access Analyzer and last-accessed data to trim permissions.',
          concepts: ['Policy JSON structure', 'Identity versus resource policies', 'Evaluation logic and explicit deny', 'Conditions and policy variables', 'Permission boundaries', 'Access Analyzer and last accessed'],
          quiz: [
            ['What happens when an Allow and a Deny both match?', 'The explicit Deny wins.'],
            ['What is a permission boundary?', 'A policy that caps the maximum permissions an identity can have, regardless of attached policies.'],
            ['Which condition key restricts a policy to one source IP range?', 'aws:SourceIp.'],
          ],
          prereqs: ['IAM users, groups and roles'],
        },
        {
          title: 'Regions, Availability Zones and edge locations',
          description: 'Regions are independent geographic areas, AZs are physically separate data centres inside them with low-latency links, and edge locations serve CloudFront and Route 53; choosing them drives latency, compliance and resilience.',
          concepts: ['Regions and data residency', 'Availability Zones and fault isolation', 'Edge locations and Local Zones', 'Regional versus global services', 'Choosing a region'],
          quiz: [
            ['Which services are global rather than regional?', 'IAM, Route 53, CloudFront and WAF for CloudFront, among others.'],
            ['Why spread instances across AZs?', 'An AZ failure then takes down only part of the fleet.'],
          ],
        },
        {
          title: 'AWS CLI, SDKs and credential configuration',
          description: 'Installing the CLI, named profiles in ~/.aws/config, the credential provider chain that SDKs and the CLI share, SSO login with IAM Identity Center, and reading JSON output with --query and --output.',
          concepts: ['Named profiles and config files', 'Credential provider chain order', 'IAM Identity Center and aws sso login', '--query with JMESPath', 'SDK clients and pagination'],
          quiz: [
            ['In what order does the CLI look for credentials?', 'Command-line options, environment variables, profile files, then container or instance metadata.'],
            ['How do you list only bucket names?', 'aws s3api list-buckets --query "Buckets[].Name" --output text'],
          ],
          prereqs: ['IAM users, groups and roles'],
        },
      ],
    },
    {
      title: 'Compute',
      topics: [
        {
          title: 'EC2 instances, AMIs and instance types',
          description: 'Launching virtual machines from an AMI, reading instance family names like m7g.large, user data for first-boot scripts, key pairs, the metadata service (IMDSv2) and instance lifecycle states.',
          concepts: ['AMIs and launch templates', 'Instance families and sizing', 'User data and cloud-init', 'IMDSv2 metadata service', 'Stop, hibernate and terminate'],
          quiz: [
            ['What does the letter g in m7g mean?', 'Graviton (ARM) processors.'],
            ['Why require IMDSv2?', 'It needs a session token, which blocks SSRF attacks from stealing role credentials.'],
            ['Does stopping an instance keep its EBS root volume?', 'Yes unless DeleteOnTermination applies at termination; stop keeps it.'],
          ],
          prereqs: ['Regions, Availability Zones and edge locations'],
        },
        {
          title: 'EC2 pricing models and Auto Scaling groups',
          description: 'On-Demand, Reserved, Savings Plans and Spot capacity, then Auto Scaling groups that keep a desired count healthy across AZs and scale on CloudWatch metrics with target tracking, step or scheduled policies.',
          concepts: ['On-Demand, Reserved and Spot trade-offs', 'Auto Scaling group min, max and desired', 'Target tracking and step scaling', 'Health checks and instance refresh', 'Warm pools and lifecycle hooks'],
          quiz: [
            ['When is Spot appropriate?', 'For interruption-tolerant work such as batch jobs or stateless workers.'],
            ['What does target tracking do?', 'Adds or removes instances to hold a metric such as CPU at a target value.'],
          ],
          prereqs: ['EC2 instances, AMIs and instance types'],
        },
        {
          title: 'Lambda functions and event sources',
          description: 'Functions that run on demand with memory-proportional CPU, the handler and execution role, synchronous versus asynchronous and poll-based invocation, cold starts, concurrency limits and layers for shared code.',
          concepts: ['Handler, runtime and execution role', 'Invocation models and event source mappings', 'Cold starts and provisioned concurrency', 'Timeouts, memory and pricing', 'Layers and container images', 'Destinations and dead-letter queues'],
          quiz: [
            ['What is the maximum Lambda timeout?', '15 minutes.'],
            ['How does Lambda read from SQS?', 'Through an event source mapping that polls the queue and invokes the function with batches.'],
            ['What does provisioned concurrency solve?', 'Cold-start latency by keeping initialised environments ready.'],
          ],
          prereqs: ['IAM policies and least privilege'],
        },
        {
          title: 'ECS and Fargate',
          description: 'Running containers with task definitions, services that keep tasks running behind a load balancer, Fargate for serverless capacity versus EC2 launch type, task roles, and ECR for image storage. Docker itself lives in track-docker.',
          concepts: ['Task definitions and containers', 'Services, desired count and deployments', 'Fargate versus EC2 launch type', 'Task role versus execution role', 'ECR repositories and image scanning'],
          quiz: [
            ['What is the difference between the task role and the execution role?', 'The execution role pulls images and writes logs; the task role is what the application code uses.'],
            ['When choose Fargate over EC2 launch type?', 'When you do not want to manage instances and workloads fit Fargate CPU and memory combinations.'],
          ],
          prereqs: ['Lambda functions and event sources'],
        },
        {
          title: 'EKS overview',
          description: 'How EKS runs the Kubernetes control plane for you, managed node groups and Fargate profiles, IAM roles for service accounts (IRSA and Pod Identity), and the add-ons for networking and storage. Kubernetes itself is covered in track-kubernetes.',
          concepts: ['Managed control plane', 'Managed node groups and Fargate profiles', 'IRSA and Pod Identity', 'VPC CNI and add-ons', 'eksctl and cluster access'],
          quiz: [
            ['How do pods on EKS get AWS permissions?', 'A Kubernetes service account mapped to an IAM role through IRSA or Pod Identity.'],
            ['What does the VPC CNI give pods?', 'Real VPC IP addresses so security groups and VPC routing apply to them.'],
          ],
          prereqs: ['ECS and Fargate'],
        },
      ],
    },
    {
      title: 'Storage',
      topics: [
        {
          title: 'S3 buckets, objects and consistency',
          description: 'Object storage with globally unique bucket names, flat key namespaces that only look like folders, strong read-after-write consistency, multipart uploads for large files, and the CLI verbs for syncing.',
          concepts: ['Buckets, keys and prefixes', 'Strong consistency model', 'Multipart upload', 'aws s3 cp and sync', 'Object metadata and tags'],
          quiz: [
            ['Are S3 folders real?', 'No, keys with slashes are just displayed as folders.'],
            ['Above what size is multipart upload recommended?', 'Around 100 MB, and required above 5 GB.'],
          ],
        },
        {
          title: 'S3 storage classes, lifecycle and versioning',
          description: 'Standard, Intelligent-Tiering, Standard-IA, One Zone-IA and the Glacier tiers with their retrieval times, lifecycle rules that transition or expire objects, and versioning plus Object Lock for protection.',
          concepts: ['Storage class trade-offs', 'Lifecycle transitions and expiry', 'Versioning and delete markers', 'Object Lock and retention', 'Replication rules'],
          quiz: [
            ['Which class needs no access-pattern knowledge?', 'S3 Intelligent-Tiering.'],
            ['What does deleting a versioned object do?', 'Adds a delete marker; older versions remain.'],
            ['Which Glacier class offers millisecond retrieval?', 'Glacier Instant Retrieval.'],
          ],
          prereqs: ['S3 buckets, objects and consistency'],
        },
        {
          title: 'S3 security and access patterns',
          description: 'Block Public Access as the default, bucket policies versus IAM policies, presigned URLs for temporary access, SSE-S3 and SSE-KMS encryption, access points, and static website hosting behind CloudFront.',
          concepts: ['Block Public Access', 'Bucket policies and ACL deprecation', 'Presigned URLs', 'SSE-S3 versus SSE-KMS', 'Access points and VPC-only access'],
          quiz: [
            ['How do you let a user download one private object for ten minutes?', 'Generate a presigned URL with a ten-minute expiry.'],
            ['Which encryption option lets you audit key usage per object?', 'SSE-KMS, because KMS logs every key use in CloudTrail.'],
          ],
          prereqs: ['S3 buckets, objects and consistency', 'IAM policies and least privilege'],
        },
        {
          title: 'EBS volumes and snapshots',
          description: 'Block storage attached to one instance in one AZ: gp3 versus io2 versus st1, provisioning IOPS and throughput independently on gp3, incremental snapshots to S3, and encryption by default.',
          concepts: ['Volume types and performance', 'gp3 IOPS and throughput tuning', 'Snapshots and cross-region copy', 'Encryption and Data Lifecycle Manager', 'Multi-attach and io2'],
          quiz: [
            ['Can an EBS volume be attached across AZs?', 'No, it lives in one AZ; use a snapshot to move it.'],
            ['Are snapshots full copies?', 'No, they are incremental after the first one.'],
          ],
          prereqs: ['EC2 instances, AMIs and instance types'],
        },
        {
          title: 'EFS and FSx shared file systems',
          description: 'NFS file systems that many instances and containers mount at once across AZs, elastic capacity and throughput modes, lifecycle tiering to Infrequent Access, and when FSx for Lustre or Windows fits better.',
          concepts: ['NFS mounts across AZs', 'Performance and throughput modes', 'EFS Infrequent Access tiering', 'Mount targets and security groups', 'FSx families'],
          quiz: [
            ['Which storage is shared by many EC2 instances at once?', 'EFS (or FSx), not EBS.'],
            ['What port must a security group allow for EFS?', 'TCP 2049 (NFS).'],
          ],
          prereqs: ['EBS volumes and snapshots'],
        },
      ],
    },
    {
      title: 'Databases',
      topics: [
        {
          title: 'RDS managed relational databases',
          description: 'Managed PostgreSQL, MySQL and other engines with automated backups, Multi-AZ standby for failover, read replicas for scale-out, parameter groups, and RDS Proxy to pool connections from Lambda.',
          concepts: ['Engines and instance classes', 'Multi-AZ failover', 'Read replicas', 'Backups, snapshots and point-in-time restore', 'Parameter and option groups', 'RDS Proxy'],
          quiz: [
            ['Does Multi-AZ improve read performance?', 'No, the standby is for failover; read replicas scale reads.'],
            ['What does RDS Proxy help with?', 'Connection pooling and faster failover for many short-lived clients like Lambda.'],
          ],
          prereqs: ['EBS volumes and snapshots'],
        },
        {
          title: 'Aurora',
          description: 'A cloud-native MySQL and PostgreSQL-compatible engine with a shared storage layer replicated six ways across three AZs, up to fifteen readers, fast cloning, Global Database and Serverless v2 autoscaling.',
          concepts: ['Shared storage architecture', 'Writer and reader endpoints', 'Aurora Serverless v2', 'Global Database', 'Fast cloning and backtrack'],
          quiz: [
            ['How many copies of data does Aurora keep?', 'Six across three Availability Zones.'],
            ['What is the reader endpoint?', 'A load-balanced endpoint across all read replicas.'],
          ],
          prereqs: ['RDS managed relational databases'],
        },
        {
          title: 'DynamoDB tables, keys and indexes',
          description: 'A key-value and document store designed around access patterns: partition and sort keys, single-table design, local and global secondary indexes, and query versus scan cost.',
          concepts: ['Partition key and sort key', 'Query versus Scan', 'Global and local secondary indexes', 'Single-table design', 'Item size and hot partitions'],
          quiz: [
            ['What is the maximum item size?', '400 KB.'],
            ['Can a GSI have a different partition key than the table?', 'Yes, that is its purpose; an LSI shares the partition key.'],
            ['Why avoid Scan on large tables?', 'It reads every item and consumes capacity for the whole table.'],
          ],
        },
        {
          title: 'DynamoDB capacity, streams and DAX',
          description: 'On-demand versus provisioned capacity with autoscaling, read and write capacity units, eventually versus strongly consistent reads, TTL, DynamoDB Streams for change events, and DAX as an in-memory cache.',
          concepts: ['On-demand versus provisioned capacity', 'RCU and WCU arithmetic', 'Consistent read choices', 'TTL and Streams', 'DAX caching', 'Transactions and conditional writes'],
          quiz: [
            ['How many RCUs does one strongly consistent 4 KB read cost per second?', 'One; an eventually consistent read costs half.'],
            ['What triggers a Lambda on item changes?', 'DynamoDB Streams with an event source mapping.'],
          ],
          prereqs: ['DynamoDB tables, keys and indexes'],
        },
        {
          title: 'ElastiCache for Redis and Memcached',
          description: 'Managed in-memory caches: cache-aside and write-through patterns, Redis replication groups with cluster mode, Memcached for simple multi-threaded caching, and TTLs to keep data from going stale.',
          concepts: ['Cache-aside and write-through', 'Redis versus Memcached', 'Replication groups and cluster mode', 'Eviction policies and TTLs', 'Sessions and leaderboards'],
          quiz: [
            ['Which engine supports persistence and replication?', 'Redis (and Valkey); Memcached does not.'],
            ['What is cache-aside?', 'The application checks the cache first and loads from the database on a miss, then stores the result.'],
          ],
          prereqs: ['RDS managed relational databases'],
        },
      ],
    },
    {
      title: 'Networking and Content Delivery',
      topics: [
        {
          title: 'VPC, subnets and route tables',
          description: 'A private network with a CIDR block split into public and private subnets per AZ, route tables that decide where traffic leaves, and the five reserved addresses per subnet.',
          concepts: ['CIDR planning', 'Public versus private subnets', 'Route tables and associations', 'Reserved addresses per subnet', 'Default VPC versus custom VPC'],
          quiz: [
            ['What makes a subnet public?', 'A route table entry sending 0.0.0.0/0 to an internet gateway.'],
            ['How many addresses does AWS reserve in each subnet?', 'Five: network, router, DNS, future use and broadcast.'],
          ],
          prereqs: ['Regions, Availability Zones and edge locations'],
        },
        {
          title: 'Internet gateways, NAT and VPC endpoints',
          description: 'Internet gateways for inbound and outbound public traffic, NAT gateways so private subnets can reach out without being reachable, gateway endpoints for S3 and DynamoDB, and interface endpoints via PrivateLink.',
          concepts: ['Internet gateway', 'NAT gateway placement and cost', 'Gateway endpoints for S3 and DynamoDB', 'Interface endpoints and PrivateLink', 'VPC peering and Transit Gateway'],
          quiz: [
            ['Why put a NAT gateway in each AZ?', 'So an AZ outage does not cut outbound access for the other AZs and to avoid cross-AZ charges.'],
            ['Which endpoint type is free for S3?', 'A gateway endpoint.'],
          ],
          prereqs: ['VPC, subnets and route tables'],
        },
        {
          title: 'Security groups and network ACLs',
          description: 'Security groups are stateful allow-lists attached to ENIs that can reference other groups; NACLs are stateless, ordered subnet-level rules that need explicit return-traffic entries.',
          concepts: ['Stateful security groups', 'Referencing groups instead of IPs', 'Stateless NACL rule ordering', 'Ephemeral port ranges', 'Layering both controls'],
          quiz: [
            ['Do you need an outbound rule for responses in a security group?', 'No, security groups are stateful.'],
            ['Why must a NACL allow ports 1024-65535 outbound?', 'Return traffic to clients uses ephemeral ports and NACLs are stateless.'],
          ],
          prereqs: ['VPC, subnets and route tables'],
        },
        {
          title: 'Elastic Load Balancing',
          description: 'Application Load Balancers route HTTP by host and path with target groups and health checks, Network Load Balancers pass TCP at layer 4 with static IPs, and Gateway Load Balancers insert appliances.',
          concepts: ['ALB listeners, rules and target groups', 'NLB and static IPs', 'Health checks and deregistration delay', 'Sticky sessions and cross-zone balancing', 'TLS termination with ACM'],
          quiz: [
            ['Which load balancer gives you a static IP per AZ?', 'The Network Load Balancer.'],
            ['Where does an ALB terminate TLS?', 'At the listener, using an ACM certificate.'],
          ],
          prereqs: ['Security groups and network ACLs', 'EC2 pricing models and Auto Scaling groups'],
        },
        {
          title: 'Route 53',
          description: 'Managed DNS with hosted zones, alias records that point at AWS resources for free, routing policies (weighted, latency, failover, geolocation) and health checks that drive automatic failover.',
          concepts: ['Hosted zones and record types', 'Alias versus CNAME', 'Routing policies', 'Health checks and failover', 'Domain registration and private zones'],
          quiz: [
            ['Why use an alias record for an ALB?', 'It works at the zone apex and the queries are free.'],
            ['Which policy sends users to the lowest-latency region?', 'Latency-based routing.'],
          ],
          prereqs: ['Elastic Load Balancing'],
        },
        {
          title: 'CloudFront',
          description: 'A global CDN that caches content at edge locations: distributions, origins and origin access control for private S3, cache policies and TTLs, invalidations, and Lambda@Edge or CloudFront Functions for request rewriting.',
          concepts: ['Distributions and origins', 'Origin access control for S3', 'Cache keys and TTL behaviour', 'Invalidations and versioned file names', 'CloudFront Functions and Lambda@Edge'],
          quiz: [
            ['How do you keep an S3 origin private behind CloudFront?', 'Use origin access control and a bucket policy that allows only the distribution.'],
            ['What is cheaper than invalidating on every deploy?', 'Versioned file names with long TTLs.'],
          ],
          prereqs: ['S3 security and access patterns', 'Route 53'],
        },
      ],
    },
    {
      title: 'Messaging and Integration',
      topics: [
        {
          title: 'SQS queues',
          description: 'Decoupling producers and consumers with standard queues (at-least-once, best-effort order) or FIFO queues, visibility timeouts, long polling, dead-letter queues and redrive policies.',
          concepts: ['Standard versus FIFO queues', 'Visibility timeout', 'Long polling', 'Dead-letter queues and redrive', 'Message retention and delay queues'],
          quiz: [
            ['What happens if a consumer does not delete a message in time?', 'It becomes visible again after the visibility timeout and is redelivered.'],
            ['What is the FIFO throughput limit without batching?', '300 messages per second per queue (3,000 with batching, more with high throughput mode).'],
          ],
        },
        {
          title: 'SNS topics and fan-out',
          description: 'Publish-subscribe topics that push messages to many subscribers at once (SQS, Lambda, HTTP, email, SMS), message filtering by attributes, FIFO topics, and the SNS-to-SQS fan-out pattern.',
          concepts: ['Topics and subscription types', 'Fan-out to SQS', 'Subscription filter policies', 'FIFO topics', 'Delivery retries and DLQs'],
          quiz: [
            ['Why fan out through SQS instead of invoking Lambda directly from SNS?', 'Queues buffer bursts and give retries and dead-lettering per consumer.'],
            ['How does a subscriber receive only some messages?', 'With a filter policy on message attributes.'],
          ],
          prereqs: ['SQS queues'],
        },
        {
          title: 'EventBridge',
          description: 'An event bus that routes JSON events by pattern to targets, schedules with cron or rate expressions, receives SaaS and AWS service events, archives and replays them, and validates shapes with a schema registry.',
          concepts: ['Event buses and rules', 'Event patterns', 'Scheduler and cron expressions', 'Archive and replay', 'Pipes and enrichment'],
          quiz: [
            ['What is the difference between SNS and EventBridge?', 'EventBridge routes by content patterns to many AWS targets; SNS is simpler push fan-out.'],
            ['How do you run a Lambda every day at 06:00 UTC?', 'An EventBridge Scheduler rule with cron(0 6 * * ? *).'],
          ],
          prereqs: ['SNS topics and fan-out'],
        },
        {
          title: 'Step Functions',
          description: 'Orchestrating multi-step workflows as state machines: Task, Choice, Parallel, Map and Wait states, retries and catches per step, Standard versus Express workflows, and direct service integrations.',
          concepts: ['State machine definitions', 'Choice, Parallel and Map states', 'Retry and Catch per task', 'Standard versus Express', 'Service integrations without Lambda'],
          quiz: [
            ['When choose Express workflows?', 'High-volume, short (under five minutes) workflows where at-least-once execution is acceptable.'],
            ['How long can a Standard workflow run?', 'Up to one year.'],
          ],
          prereqs: ['Lambda functions and event sources', 'EventBridge'],
        },
      ],
    },
    {
      title: 'Observability',
      topics: [
        {
          title: 'CloudWatch metrics and alarms',
          description: 'Namespaces, dimensions and periods for built-in and custom metrics, statistics like p99, alarms with evaluation periods and missing-data handling, composite alarms and actions to SNS or Auto Scaling.',
          concepts: ['Namespaces, dimensions and resolution', 'Custom metrics and embedded metric format', 'Alarm thresholds and evaluation periods', 'Composite alarms', 'Dashboards'],
          quiz: [
            ['What does an alarm do with missing data by default?', 'Treats it as missing and keeps the current state.'],
            ['Which EC2 metric needs the agent?', 'Memory utilisation; the hypervisor only reports CPU, network and disk I/O.'],
          ],
        },
        {
          title: 'CloudWatch Logs and Logs Insights',
          description: 'Log groups and streams, retention settings, the CloudWatch agent and Lambda auto-logging, metric filters that turn log lines into metrics, and Logs Insights queries for ad-hoc analysis.',
          concepts: ['Log groups, streams and retention', 'CloudWatch agent configuration', 'Metric filters', 'Logs Insights query syntax', 'Subscription filters to Kinesis or Lambda'],
          quiz: [
            ['What is the default log retention?', 'Never expire, so set retention explicitly.'],
            ['How do you alarm on the word ERROR in logs?', 'A metric filter that counts matches, then an alarm on that metric.'],
          ],
          prereqs: ['CloudWatch metrics and alarms'],
        },
        {
          title: 'X-Ray tracing',
          description: 'Distributed tracing across Lambda, ECS and API Gateway: segments and subsegments, sampling rules, the service map, annotations for filtering, and the OpenTelemetry route via ADOT.',
          concepts: ['Segments and subsegments', 'Sampling rules', 'Service map', 'Annotations and metadata', 'ADOT and OpenTelemetry'],
          quiz: [
            ['What does the X-Ray service map show?', 'Services as nodes with latency and error rates on the edges.'],
            ['Why sample traces?', 'To limit cost and overhead while keeping representative data.'],
          ],
          prereqs: ['CloudWatch Logs and Logs Insights'],
        },
        {
          title: 'CloudTrail and Config',
          description: 'CloudTrail records every API call for audit and incident response, with organisation trails and Lake for querying; AWS Config tracks resource configuration over time and evaluates compliance rules.',
          concepts: ['Management versus data events', 'Organisation trails and log validation', 'CloudTrail Lake queries', 'Config recorders and rules', 'Conformance packs and remediation'],
          quiz: [
            ['Who deleted the S3 bucket last night?', 'Search CloudTrail for the DeleteBucket event and its userIdentity.'],
            ['What does a Config rule do?', 'Evaluates resources against a condition and marks them compliant or not.'],
          ],
          prereqs: ['CloudWatch Logs and Logs Insights'],
        },
      ],
    },
    {
      title: 'Infrastructure as Code',
      topics: [
        {
          title: 'CloudFormation templates and stacks',
          description: 'Declaring resources in YAML with Parameters, Mappings, Conditions and Outputs, intrinsic functions like !Ref and !GetAtt, stack creation and rollback on failure, and cross-stack exports.',
          concepts: ['Template sections', 'Intrinsic functions', 'Stack lifecycle and rollback', 'Exports and cross-stack references', 'Deletion and update policies'],
          quiz: [
            ['What does !GetAtt Bucket.Arn return?', 'The ARN attribute of the Bucket resource.'],
            ['What happens when a stack creation fails?', 'CloudFormation rolls back and deletes the resources it created.'],
          ],
        },
        {
          title: 'Change sets, drift and nested stacks',
          description: 'Previewing updates with change sets, which updates replace resources, detecting drift when someone edited the console, nested stacks and StackSets for many accounts, and custom resources for gaps.',
          concepts: ['Change sets before updates', 'Replacement versus in-place updates', 'Drift detection', 'Nested stacks and StackSets', 'Custom resources'],
          quiz: [
            ['Why review a change set?', 'To see which resources will be replaced and lose data before applying.'],
            ['What do StackSets do?', 'Deploy one template across many accounts and regions.'],
          ],
          prereqs: ['CloudFormation templates and stacks'],
        },
        {
          title: 'AWS CDK',
          description: 'Defining infrastructure in TypeScript or Python that synthesises to CloudFormation: apps, stacks and constructs at levels L1 to L3, cdk diff and deploy, bootstrap, and testing constructs with assertions.',
          concepts: ['Apps, stacks and constructs', 'L1, L2 and L3 construct levels', 'cdk synth, diff and deploy', 'Bootstrap and environments', 'Assertions tests'],
          quiz: [
            ['What is an L2 construct?', 'An opinionated wrapper with sensible defaults and helper methods over a raw CloudFormation resource.'],
            ['Why run cdk bootstrap?', 'It creates the S3 bucket and roles CDK needs to deploy assets.'],
          ],
          prereqs: ['CloudFormation templates and stacks'],
        },
        {
          title: 'Terraform on AWS',
          description: 'The AWS provider with assume-role authentication, an S3 backend with state locking, the aws_ resource naming, data sources for AMIs and account ids, and when teams pick Terraform over CloudFormation. Terraform itself is taught in track-terraform.',
          concepts: ['AWS provider authentication', 'S3 backend and state locking', 'Common aws_ resources', 'Data sources for AMIs and caller identity', 'Terraform versus CloudFormation decision'],
          quiz: [
            ['How does Terraform lock S3-backed state?', 'With a DynamoDB table or S3 native lockfile (use_lockfile).'],
            ['Which data source finds the latest Amazon Linux AMI?', 'data "aws_ami" with most_recent = true and owner filters.'],
          ],
          prereqs: ['CloudFormation templates and stacks'],
        },
      ],
    },
    {
      title: 'Security Services',
      topics: [
        {
          title: 'KMS keys and envelope encryption',
          description: 'Customer managed versus AWS managed keys, key policies as the root of access, envelope encryption with data keys, automatic rotation, grants, and multi-region keys for replicated data.',
          concepts: ['Key types and key policies', 'Envelope encryption and data keys', 'Rotation and aliases', 'Grants and cross-account use', 'Multi-region keys'],
          quiz: [
            ['Why does KMS use envelope encryption?', 'KMS only encrypts up to 4 KB directly, so data keys encrypt the payload and KMS wraps the key.'],
            ['Who can use a KMS key?', 'Only principals allowed by both the key policy and their IAM policy.'],
          ],
          prereqs: ['IAM policies and least privilege'],
        },
        {
          title: 'Secrets Manager and Parameter Store',
          description: 'Storing credentials and configuration outside code: Secrets Manager with automatic RDS rotation and versions, Systems Manager Parameter Store with SecureString and hierarchies, and retrieving them at runtime with caching.',
          concepts: ['Secrets Manager rotation', 'Parameter Store hierarchies', 'SecureString and KMS', 'Runtime retrieval and caching', 'Choosing between the two'],
          quiz: [
            ['Which service rotates RDS passwords automatically?', 'Secrets Manager.'],
            ['Is Parameter Store free?', 'Standard parameters are free; advanced parameters and high throughput cost.'],
          ],
          prereqs: ['KMS keys and envelope encryption'],
        },
        {
          title: 'GuardDuty, Security Hub and Inspector',
          description: 'Threat detection from CloudTrail, VPC Flow Logs and DNS logs with GuardDuty, vulnerability scanning of instances and images with Inspector, and Security Hub aggregating findings against standards like CIS.',
          concepts: ['GuardDuty findings and data sources', 'Inspector for EC2, ECR and Lambda', 'Security Hub standards', 'Finding aggregation across accounts', 'Automated response with EventBridge'],
          quiz: [
            ['What does GuardDuty analyse?', 'CloudTrail events, VPC Flow Logs, DNS logs and optional data sources like EKS audit logs.'],
            ['How do you react automatically to a finding?', 'An EventBridge rule on the finding invokes Lambda or Systems Manager automation.'],
          ],
          prereqs: ['CloudTrail and Config'],
        },
        {
          title: 'WAF and Shield',
          description: 'Web ACLs with managed rule groups, rate-based rules and custom match conditions in front of CloudFront, ALB and API Gateway, plus Shield Standard for free DDoS protection and Shield Advanced for response support.',
          concepts: ['Web ACLs and rule groups', 'Managed rules and rate limits', 'Attaching WAF to CloudFront and ALB', 'Shield Standard versus Advanced', 'Logging and tuning false positives'],
          quiz: [
            ['How do you block a client sending 5,000 requests in five minutes?', 'A rate-based rule in a WAF web ACL.'],
            ['Is Shield Standard automatically on?', 'Yes, for all AWS customers at no cost.'],
          ],
          prereqs: ['CloudFront', 'Elastic Load Balancing'],
        },
      ],
    },
    {
      title: 'Cost, Architecture and Serverless Design',
      topics: [
        {
          title: 'Cost Explorer, budgets and tagging',
          description: 'Reading the bill by service and tag, budgets with alerts and actions, the Cost and Usage Report for detail, cost allocation tags, and the free-tier traps such as NAT gateways and cross-AZ data transfer.',
          concepts: ['Cost Explorer grouping and filters', 'Budgets and alerts', 'Cost allocation tags', 'Cost and Usage Report', 'Common surprise charges'],
          quiz: [
            ['What must you do before a tag shows in Cost Explorer?', 'Activate it as a cost allocation tag.'],
            ['Name a common surprise charge.', 'NAT gateway data processing or cross-AZ transfer.'],
          ],
        },
        {
          title: 'Savings Plans, Reserved Instances and rightsizing',
          description: 'Compute Savings Plans versus EC2 Instance Savings Plans and Reserved Instances, coverage and utilisation reports, Compute Optimizer recommendations, and stopping idle resources with schedules.',
          concepts: ['Savings Plan types', 'Reserved Instances and coverage reports', 'Compute Optimizer rightsizing', 'Scheduling non-production resources', 'Trusted Advisor checks'],
          quiz: [
            ['Which commitment applies across EC2, Fargate and Lambda?', 'Compute Savings Plans.'],
            ['What does Compute Optimizer recommend?', 'Better-fitting instance types based on observed utilisation.'],
          ],
          prereqs: ['Cost Explorer, budgets and tagging', 'EC2 pricing models and Auto Scaling groups'],
        },
        {
          title: 'The Well-Architected Framework',
          description: 'The six pillars (operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability), the review process with the Well-Architected Tool, and the design principles behind each pillar.',
          concepts: ['The six pillars', 'Design principles per pillar', 'Well-Architected Tool reviews', 'Lenses for serverless and SaaS', 'Trade-offs between pillars'],
          quiz: [
            ['Name the six pillars.', 'Operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability.'],
            ['What is a reliability design principle?', 'Test recovery procedures and scale horizontally to increase availability.'],
          ],
        },
        {
          title: 'Serverless APIs with API Gateway, Lambda and DynamoDB',
          description: 'HTTP APIs versus REST APIs, Lambda proxy integration, JWT and Cognito authorisers, stages and throttling, DynamoDB as the data store, and cold-start and connection-reuse considerations.',
          concepts: ['HTTP API versus REST API', 'Proxy integration and event shape', 'Cognito and Lambda authorisers', 'Stages, throttling and usage plans', 'Idempotency in serverless handlers'],
          quiz: [
            ['Which API Gateway type is cheaper and simpler?', 'HTTP API.'],
            ['How does a Lambda proxy integration return a 404?', 'By returning an object with statusCode 404 and a body.'],
          ],
          prereqs: ['Lambda functions and event sources', 'DynamoDB tables, keys and indexes'],
        },
        {
          title: 'Event-driven serverless patterns',
          description: 'Combining S3 events, EventBridge, SQS and Step Functions into loosely coupled pipelines, idempotent consumers, ordering and retries, the transactional outbox, and Lambda Powertools for logging and tracing.',
          concepts: ['S3 event notifications', 'Queue-based load levelling', 'Idempotent consumers', 'Saga with Step Functions', 'Lambda Powertools'],
          quiz: [
            ['How do you process uploaded images without polling S3?', 'S3 event notifications to SQS or EventBridge that trigger Lambda.'],
            ['Why must consumers be idempotent?', 'Standard queues and retries can deliver a message more than once.'],
          ],
          prereqs: ['Serverless APIs with API Gateway, Lambda and DynamoDB', 'Step Functions'],
        },
        {
          title: 'Highly available multi-tier architectures',
          description: 'The classic reference design: ALB in public subnets, Auto Scaling app tier in private subnets, Multi-AZ RDS, ElastiCache, S3 and CloudFront for static assets, plus multi-region options with Route 53 failover.',
          concepts: ['Three-tier VPC layout', 'Stateless app tier with Auto Scaling', 'Multi-AZ data tier', 'Static assets via S3 and CloudFront', 'Multi-region active-passive', 'RTO and RPO choices'],
          quiz: [
            ['Where do the application instances live?', 'Private subnets behind the load balancer.'],
            ['What gives multi-region failover for DNS?', 'Route 53 failover records with health checks.'],
          ],
          prereqs: ['Elastic Load Balancing', 'RDS managed relational databases', 'CloudFront'],
        },
      ],
    },
    {
      title: 'Projects and Certification Review',
      topics: [
        {
          title: 'Project: static site with CI to S3 and CloudFront',
          description: 'Host a site in a private S3 bucket behind CloudFront with origin access control, an ACM certificate and Route 53 alias, deployed by a GitHub Actions workflow that assumes a role through OIDC and invalidates the cache.',
          concepts: ['Create bucket, OAC and distribution', 'Issue the certificate and DNS records', 'OIDC role for the pipeline', 'Deploy and invalidate on push'],
          quiz: [
            ['Why OIDC instead of access keys in CI?', 'No long-lived secrets; the pipeline assumes a role with short-lived credentials.'],
            ['In which region must the ACM certificate be for CloudFront?', 'us-east-1.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: three-tier web app with Auto Scaling and RDS',
          description: 'Build a custom VPC across two AZs, an ALB, a launch template with user data, an Auto Scaling group on target tracking, Multi-AZ PostgreSQL on RDS, secrets in Secrets Manager and CloudWatch alarms, all in CloudFormation or Terraform.',
          concepts: ['Design the VPC and subnets', 'Provision ALB and Auto Scaling group', 'Add RDS and secrets', 'Alarms, load test and teardown'],
          quiz: [
            ['How does the app find the database password?', 'It reads it from Secrets Manager using its instance role.'],
            ['How do you prove Auto Scaling works?', 'Load test with a tool like hey and watch the group add instances.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: serverless order pipeline',
          description: 'An HTTP API that writes orders to DynamoDB, publishes to EventBridge, fans out to SQS consumers for invoicing and notification, uses a Step Functions saga for payment, with X-Ray tracing and a dead-letter queue dashboard.',
          concepts: ['Model the events and table', 'Build the API and writers', 'Fan out and add the saga', 'Trace, alarm and document'],
          quiz: [
            ['How do you avoid double invoices on retries?', 'Make the invoicing consumer idempotent using the order id.'],
            ['Where do poison messages end up?', 'In the dead-letter queue after maxReceiveCount attempts.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: account guardrails and cost controls',
          description: 'Set up an organisation with sandbox and production OUs, SCPs that block unsupported regions and root actions, CloudTrail and Config organisation-wide, GuardDuty, budgets with alerts, and a tagging policy checked by Config rules.',
          concepts: ['Create the organisation and OUs', 'Write and test SCPs', 'Enable audit and detection services', 'Budgets and tag compliance'],
          quiz: [
            ['How do you restrict all accounts to two regions?', 'An SCP with aws:RequestedRegion condition denying everything else.'],
            ['Which service proves a tag is missing on new resources?', 'AWS Config with the required-tags rule.'],
          ],
          style: 'project',
        },
        {
          title: 'Solutions Architect Associate review',
          description: 'The SAA-C03 domains (secure, resilient, high-performing and cost-optimised architectures), how questions are worded, elimination strategies, and the services that appear most: S3, EC2, VPC, RDS, Lambda, SQS, Route 53 and KMS.',
          concepts: ['Exam domains and weighting', 'Reading scenario questions', 'Service comparison tables', 'Elimination strategies', 'Practice exam routine'],
          quiz: [
            ['Which storage is the answer for shared POSIX access from many instances?', 'EFS.'],
            ['Which service decouples two tiers with buffering?', 'SQS.'],
            ['What word in a question hints at DynamoDB?', 'Single-digit millisecond latency at any scale or key-value access.'],
          ],
          style: 'reading',
        },
        {
          title: 'AWS interview questions',
          description: 'What interviewers ask cloud engineers: IAM role versus user, security group versus NACL, S3 consistency and classes, Multi-AZ versus read replica, choosing Lambda versus ECS, and explaining a design you built with its trade-offs.',
          concepts: ['Identity and networking questions', 'Storage and database comparisons', 'Compute choice questions', 'Explaining cost trade-offs', 'Walking through an architecture'],
          quiz: [
            ['Security group versus NACL in one sentence?', 'Security groups are stateful and instance-level; NACLs are stateless and subnet-level.'],
            ['When would you not use Lambda?', 'Long-running or steady high-throughput workloads where containers or instances are cheaper and simpler.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
