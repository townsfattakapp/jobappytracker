import { defineTrack } from '../define'

export const azure = defineTrack({
  id: 'track-azure',
  title: 'Azure',
  description: 'Microsoft Azure from the first subscription to a governed, observable, cost-aware platform: Entra ID and RBAC, compute, storage, databases, virtual networking, messaging, Azure Monitor, Bicep and Terraform, Key Vault and Policy, Azure DevOps and GitHub Actions, and AZ-104/AZ-204 review.',
  family: 'Cloud, DevOps & Platform',
  kind: 'tooling',
  icon: '🔷',
  tags: ['azure', 'cloud', 'entra-id', 'app-service', 'aks', 'bicep', 'azure-devops', 'az-104', 'az-204'],
  languages: ['Shell', 'YAML', 'Bicep'],
  explainMode: 'devops',
  code: { label: 'shell, YAML, HCL or Dockerfile, whichever fits', id: 'bash', fixed: true },
  supports: { labs: true, project: true },
  prerequisites: ['track-linux'],
  style: 'practice',
  categories: [
    {
      title: 'Subscriptions, Identity and Governance',
      description: 'The tenant, the billing boundary, who can do what, and how resources are grouped and governed.',
      topics: [
        {
          title: 'Tenants, subscriptions and resource groups',
          description: 'A tenant is the Entra ID directory, subscriptions are billing and policy boundaries inside it, and resource groups hold resources that share a lifecycle; understanding the hierarchy decides where you scope access, policy and cost.',
          concepts: ['Tenant as the identity boundary', 'Subscriptions as billing boundaries', 'Resource groups and shared lifecycle', 'Resource ids and ARM scopes', 'Regions and paired regions'],
          quiz: [
            ['Can a resource group contain resources from several regions?', 'Yes, the group has a location for its metadata but members can live anywhere.'],
            ['What happens when you delete a resource group?', 'Every resource inside it is deleted.'],
            ['What is a paired region for?', 'Sequential platform updates and geo-redundant replication targets.'],
          ],
        },
        {
          title: 'Entra ID users, groups and service principals',
          description: 'Entra ID holds users, security groups and app registrations; a service principal is the identity an app uses in a tenant, and guest (B2B) users let partners sign in with their own credentials.',
          concepts: ['Users, guests and B2B collaboration', 'Security groups and dynamic membership', 'App registrations and service principals', 'Conditional Access and MFA', 'Privileged Identity Management'],
          quiz: [
            ['What is the difference between an app registration and a service principal?', 'The registration is the global app definition; the service principal is its instance in a tenant.'],
            ['What does Conditional Access do?', 'Applies policies such as requiring MFA based on user, device, location or risk signals.'],
            ['What does PIM add?', 'Just-in-time, time-bound activation of privileged roles with approval and audit.'],
          ],
          prereqs: ['Tenants, subscriptions and resource groups'],
        },
        {
          title: 'Role-based access control',
          description: 'RBAC assigns a role definition (Owner, Contributor, Reader or custom) to a principal at a scope; assignments inherit downwards, deny assignments win, and data-plane roles like Storage Blob Data Reader differ from control-plane roles.',
          concepts: ['Role definitions and actions', 'Assignment scope and inheritance', 'Built-in versus custom roles', 'Control plane versus data plane roles', 'Deny assignments and evaluation order'],
          quiz: [
            ['What does Contributor lack compared with Owner?', 'The ability to assign roles (Microsoft.Authorization/roleAssignments/write).'],
            ['Where should a role be assigned to cover an entire subscription?', 'At the subscription scope; it inherits to all resource groups and resources.'],
            ['Which role lets an app read blobs without a storage key?', 'Storage Blob Data Reader.'],
          ],
          prereqs: ['Entra ID users, groups and service principals'],
        },
        {
          title: 'Azure CLI, PowerShell and the portal',
          description: 'Installing az, logging in with az login and device code, setting the active subscription, reading output with --query (JMESPath) and --output table, the Az PowerShell module, and Cloud Shell for a preconfigured terminal.',
          concepts: ['az login and subscription selection', '--query and output formats', 'Az PowerShell cmdlets', 'Cloud Shell', 'Resource Graph queries'],
          quiz: [
            ['How do you switch the active subscription?', 'az account set --subscription <name or id>'],
            ['How do you list VM names only?', 'az vm list --query "[].name" --output tsv'],
            ['What does Azure Resource Graph let you do?', 'Query resources across all subscriptions with a KQL-like language.'],
          ],
          prereqs: ['Tenants, subscriptions and resource groups'],
        },
        {
          title: 'Management groups, tags and naming conventions',
          description: 'Management groups nest subscriptions so policy and RBAC apply once at the top, tags carry owner, environment and cost-centre metadata, and a naming convention such as rg-app-prod-weu keeps hundreds of resources readable.',
          concepts: ['Management group hierarchy', 'Tag inheritance and enforcement', 'Cloud Adoption Framework naming', 'Landing zone layout', 'Resource locks'],
          quiz: [
            ['Why place policies on a management group instead of each subscription?', 'They apply once and are inherited by every subscription beneath it.'],
            ['What does a CanNotDelete lock do?', 'Blocks deletion of the resource even for Owners until the lock is removed.'],
          ],
          prereqs: ['Role-based access control'],
        },
      ],
    },
    {
      title: 'Compute',
      topics: [
        {
          title: 'Virtual machines and images',
          description: 'Creating VMs from Marketplace or Compute Gallery images, reading sizes such as Standard_D4s_v5, SSH keys and cloud-init for first boot, the Instance Metadata Service, and stop versus deallocate for billing.',
          concepts: ['VM sizes and series letters', 'Marketplace and Compute Gallery images', 'cloud-init and custom script extension', 'Instance Metadata Service', 'Stop versus deallocate'],
          quiz: [
            ['What does deallocating a VM change compared with stopping inside the OS?', 'Compute billing stops and the hardware is released; the disks remain.'],
            ['What does the s in Standard_D4s_v5 mean?', 'Premium SSD support.'],
            ['How does a VM learn its own resource id at runtime?', 'By calling the Instance Metadata Service at 169.254.169.254.'],
          ],
          prereqs: ['Azure CLI, PowerShell and the portal'],
        },
        {
          title: 'Availability sets, zones and Virtual Machine Scale Sets',
          description: 'Fault and update domains inside an availability set, availability zones for datacentre-level isolation, and scale sets with flexible orchestration that add instances on metrics and roll out new images with rolling upgrades.',
          concepts: ['Fault and update domains', 'Zonal and zone-redundant deployment', 'Scale set orchestration modes', 'Autoscale rules and profiles', 'Rolling upgrade policy'],
          quiz: [
            ['What SLA does spreading VMs across availability zones give?', '99.99% for the set of VMs.'],
            ['What is Flexible orchestration in a scale set?', 'A mode that mixes VM types and lets you manage instances individually.'],
          ],
          prereqs: ['Virtual machines and images'],
        },
        {
          title: 'App Service and deployment slots',
          description: 'A managed web host with App Service plans that set the compute tier, built-in deployment from Git, ZIP or containers, deployment slots for staged releases and slot swap, and app settings that override configuration.',
          concepts: ['App Service plans and tiers', 'Deployment methods and Kudu', 'Deployment slots and swap', 'App settings and connection strings', 'Custom domains and managed certificates'],
          quiz: [
            ['What does a slot swap do to warm-up?', 'The staging slot is warmed with production settings before routes flip, avoiding cold starts.'],
            ['Which setting stays with the slot rather than swapping?', 'Any app setting marked as a deployment slot setting.'],
            ['Can several apps share one App Service plan?', 'Yes, they share its compute and scale together.'],
          ],
          prereqs: ['Virtual machines and images'],
        },
        {
          title: 'Azure Functions',
          description: 'Event-driven code with triggers and bindings for HTTP, timers, queues and Cosmos DB, the Consumption, Flex Consumption and Premium hosting plans, Durable Functions for orchestrations, and the host.json settings that shape behaviour.',
          concepts: ['Triggers and bindings', 'Hosting plans and cold starts', 'Durable Functions orchestrations', 'host.json and function.json', 'Function keys and authorisation levels'],
          quiz: [
            ['What is an output binding?', 'A declarative way to write to a service such as a queue without SDK code.'],
            ['Which plan supports VNet integration and no cold starts?', 'Premium (and Flex Consumption with always-ready instances).'],
            ['What do Durable Functions add?', 'Stateful orchestrations with checkpoints, fan-out and timers.'],
          ],
          prereqs: ['App Service and deployment slots'],
        },
        {
          title: 'Container Apps',
          description: 'Serverless containers on a managed Kubernetes-based environment: revisions and traffic splitting, KEDA scale rules that reach zero, Dapr sidecars, ingress with built-in TLS, and jobs for batch work. Docker itself is taught in track-docker.',
          concepts: ['Environments and revisions', 'KEDA scale rules and scale to zero', 'Traffic splitting between revisions', 'Dapr building blocks', 'Container Apps jobs'],
          quiz: [
            ['How does a Container App scale on queue depth?', 'A KEDA scale rule targeting the Service Bus or Storage queue.'],
            ['What does a revision represent?', 'An immutable snapshot of the app configuration and image that can receive a share of traffic.'],
          ],
          prereqs: ['Azure Functions'],
        },
        {
          title: 'AKS overview',
          description: 'How AKS hosts the control plane for free, system and user node pools, Azure CNI versus kubenet networking, workload identity for pods, and the cluster autoscaler; Kubernetes itself is covered in track-kubernetes.',
          concepts: ['Managed control plane and node pools', 'Azure CNI versus kubenet', 'Workload identity for pods', 'AKS cluster autoscaler', 'Azure Container Registry integration'],
          quiz: [
            ['How do pods on AKS get Azure permissions without secrets?', 'Workload identity federates a Kubernetes service account with an Entra managed identity.'],
            ['What is a system node pool?', 'A pool reserved for core cluster pods like CoreDNS, separate from user workloads.'],
          ],
          prereqs: ['Container Apps'],
        },
      ],
    },
    {
      title: 'Storage',
      topics: [
        {
          title: 'Storage accounts and Blob Storage',
          description: 'A storage account groups blob, file, queue and table services under one namespace; block, append and page blobs, containers, redundancy options LRS, ZRS, GRS and GZRS, and az storage blob upload with SAS or Entra auth.',
          concepts: ['Storage account kinds and performance tiers', 'Block, append and page blobs', 'Redundancy options', 'Access keys, SAS and Entra authorisation', 'Static website hosting'],
          quiz: [
            ['What is the difference between ZRS and GRS?', 'ZRS replicates across zones in one region; GRS replicates asynchronously to the paired region.'],
            ['How do you grant time-limited access to one blob?', 'A shared access signature with an expiry and limited permissions.'],
            ['Which blob type suits log appends?', 'Append blobs.'],
          ],
        },
        {
          title: 'Blob access tiers, lifecycle and immutability',
          description: 'Hot, Cool, Cold and Archive tiers with their access costs and rehydration delays, lifecycle management rules that tier or delete by age, soft delete and versioning, and immutability policies for legal hold.',
          concepts: ['Hot, Cool, Cold and Archive trade-offs', 'Lifecycle management rules', 'Soft delete and blob versioning', 'Immutability policies and legal hold', 'Archive rehydration'],
          quiz: [
            ['Can you read an Archive blob directly?', 'No, it must be rehydrated to Hot or Cool first, which can take hours.'],
            ['What does soft delete keep?', 'Deleted blobs and versions for a retention period so they can be restored.'],
          ],
          prereqs: ['Storage accounts and Blob Storage'],
        },
        {
          title: 'Azure Files',
          description: 'SMB and NFS file shares mounted by many VMs or containers at once, premium versus standard tiers, identity-based access with Entra Kerberos, and Azure File Sync to cache shares on on-premises servers.',
          concepts: ['SMB and NFS share protocols', 'Premium versus standard shares', 'Mounting shares on Linux and Windows', 'Identity-based share access', 'Azure File Sync'],
          quiz: [
            ['Which port must be open to mount an SMB share?', 'TCP 445.'],
            ['When choose NFS shares?', 'For Linux workloads that need POSIX semantics on a premium account.'],
          ],
          prereqs: ['Storage accounts and Blob Storage'],
        },
        {
          title: 'Managed disks and snapshots',
          description: 'Block storage for VMs: Standard HDD, Standard SSD, Premium SSD, Premium SSD v2 and Ultra with adjustable IOPS, disk snapshots and images, encryption at host and customer-managed keys, and shared disks for clusters.',
          concepts: ['Disk types and performance tiers', 'OS versus data disks', 'Incremental snapshots', 'Encryption at host and customer-managed keys', 'Shared disks'],
          quiz: [
            ['Which disk type lets you tune IOPS and throughput independently of size?', 'Premium SSD v2 (and Ultra Disk).'],
            ['Are managed disk snapshots incremental?', 'Yes, incremental snapshots store only changed data since the last one.'],
          ],
          prereqs: ['Virtual machines and images'],
        },
      ],
    },
    {
      title: 'Databases',
      topics: [
        {
          title: 'Azure SQL Database and Managed Instance',
          description: 'Managed SQL Server: single databases and elastic pools with DTU or vCore purchasing, serverless auto-pause, Managed Instance for near-full compatibility, automated backups with point-in-time restore, and failover groups.',
          concepts: ['Single database versus elastic pool', 'DTU and vCore purchasing models', 'Serverless compute tier', 'Managed Instance compatibility', 'Failover groups and geo-replication'],
          quiz: [
            ['When choose Managed Instance over SQL Database?', 'When you need instance-level features such as SQL Agent, cross-database queries or CLR.'],
            ['What does an elastic pool share?', 'A pool of compute and storage across many databases with varying load.'],
            ['How long is point-in-time restore available by default?', 'Seven days, configurable up to 35.'],
          ],
          prereqs: ['Managed disks and snapshots'],
        },
        {
          title: 'Cosmos DB data modelling',
          description: 'A globally distributed multi-model database: choosing the NoSQL, MongoDB, PostgreSQL, Cassandra, Gremlin or Table API, partition keys that spread writes, embedding versus referencing documents, and request units as the cost unit.',
          concepts: ['API choices', 'Partition keys and logical partitions', 'Embedding versus referencing', 'Request units', 'Indexing policy'],
          quiz: [
            ['What is the maximum size of a logical partition?', '20 GB.'],
            ['What makes a good partition key?', 'High cardinality and even distribution of reads and writes.'],
            ['What does a request unit measure?', 'The normalised cost of a database operation combining CPU, IO and memory.'],
          ],
        },
        {
          title: 'Cosmos DB consistency and throughput',
          description: 'The five consistency levels from strong to eventual and their latency trade-offs, provisioned versus autoscale versus serverless throughput, multi-region writes, the change feed, and TTL for expiring items.',
          concepts: ['Five consistency levels', 'Provisioned, autoscale and serverless throughput', 'Multi-region writes and conflict resolution', 'Change feed', 'Time to live'],
          quiz: [
            ['What is the default consistency level?', 'Session.'],
            ['What does bounded staleness guarantee?', 'Reads lag writes by at most K versions or T seconds.'],
            ['What can consume the change feed?', 'Azure Functions triggers, the SDK change feed processor or Spark.'],
          ],
          prereqs: ['Cosmos DB data modelling'],
        },
        {
          title: 'Azure Database for PostgreSQL Flexible Server',
          description: 'Managed PostgreSQL with zone-redundant high availability, burstable and general purpose compute, server parameters, read replicas, PgBouncer built in, and Entra authentication; SQL itself lives in track-sql.',
          concepts: ['Flexible Server compute tiers', 'Zone-redundant HA and failover', 'Server parameters and extensions', 'Read replicas', 'Built-in PgBouncer and Entra auth'],
          quiz: [
            ['What does zone-redundant HA provide?', 'A synchronous standby in another zone with automatic failover.'],
            ['Why enable PgBouncer?', 'To pool connections for many short-lived clients like serverless functions.'],
          ],
          prereqs: ['Azure SQL Database and Managed Instance'],
        },
        {
          title: 'Azure Cache for Redis',
          description: 'Managed Redis for cache-aside, sessions and rate limiting: Basic, Standard, Premium and Enterprise tiers, clustering and geo-replication, data persistence, private endpoints, and eviction policies with TTLs.',
          concepts: ['Cache tiers and clustering', 'Cache-aside pattern', 'Persistence and geo-replication', 'Eviction policies', 'Private endpoint access to caches'],
          quiz: [
            ['Which tier supports clustering and persistence?', 'Premium and Enterprise.'],
            ['What is the default eviction policy?', 'volatile-lru.'],
          ],
          prereqs: ['Azure Database for PostgreSQL Flexible Server'],
        },
      ],
    },
    {
      title: 'Networking',
      topics: [
        {
          title: 'Virtual networks, subnets and peering',
          description: 'A VNet is an isolated address space split into subnets, with five reserved addresses per subnet, system routes plus user-defined routes, VNet peering for private connectivity across VNets, and service delegation for PaaS injection.',
          concepts: ['Address spaces and subnets', 'System and user-defined routes', 'VNet peering', 'Subnet delegation', 'Hub-and-spoke topology'],
          quiz: [
            ['How many addresses does Azure reserve per subnet?', 'Five: network, default gateway, two DNS and broadcast.'],
            ['Is VNet peering transitive?', 'No, spokes peered to a hub cannot reach each other without routing through an appliance.'],
          ],
          prereqs: ['Tenants, subscriptions and resource groups'],
        },
        {
          title: 'Network security groups and application security groups',
          description: 'Stateful rules with priority numbers from 100 to 4096 applied at subnet or NIC level, default rules that allow VNet and load balancer traffic, service tags such as Internet and AzureLoadBalancer, and ASGs to group NICs by role.',
          concepts: ['Rule priority and evaluation', 'Subnet versus NIC association', 'Default rules', 'Service tags', 'Application security groups'],
          quiz: [
            ['Which priority wins when two rules match?', 'The lower number.'],
            ['What does the AzureLoadBalancer service tag allow?', 'Health probe traffic from the platform load balancer.'],
            ['Why use an ASG?', 'To write rules by workload role instead of by IP address.'],
          ],
          prereqs: ['Virtual networks, subnets and peering'],
        },
        {
          title: 'Azure Load Balancer',
          description: 'Layer 4 distribution of TCP and UDP: Standard SKU with zone redundancy, frontend IPs, backend pools, health probes, load-balancing and inbound NAT rules, outbound rules, and the difference between public and internal balancers.',
          concepts: ['Standard SKU and zone redundancy', 'Backend pools and health probes', 'Load-balancing and NAT rules', 'Outbound rules and SNAT', 'Public versus internal balancers'],
          quiz: [
            ['At which OSI layer does Azure Load Balancer work?', 'Layer 4 (TCP/UDP).'],
            ['What happens when a health probe fails for a backend?', 'New flows stop being sent to that instance until it passes again.'],
          ],
          prereqs: ['Network security groups and application security groups'],
        },
        {
          title: 'Application Gateway and Web Application Firewall',
          description: 'Layer 7 routing with listeners, path- and host-based rules, backend pools, TLS termination and end-to-end TLS, autoscaling v2 SKU, and the WAF with OWASP core rule sets in detection or prevention mode.',
          concepts: ['Listeners and routing rules', 'Path-based and multi-site routing', 'TLS termination and end-to-end TLS', 'v2 SKU autoscaling', 'WAF policies and rule sets'],
          quiz: [
            ['What does Application Gateway need its own subnet for?', 'The gateway instances; the subnet cannot host other resources.'],
            ['Difference between WAF detection and prevention mode?', 'Detection only logs matches; prevention blocks them.'],
          ],
          prereqs: ['Azure Load Balancer'],
        },
        {
          title: 'Front Door and Traffic Manager',
          description: 'Global entry points: Front Door as an anycast layer 7 CDN, WAF and load balancer with origin groups and health probes; Traffic Manager as DNS-level routing with priority, weighted, performance and geographic profiles.',
          concepts: ['Front Door origins and routes', 'Caching and rules engine', 'Traffic Manager routing methods', 'Global failover design', 'Choosing Front Door versus Traffic Manager'],
          quiz: [
            ['Which service routes at the DNS level?', 'Traffic Manager.'],
            ['Which Traffic Manager method sends users to the lowest-latency region?', 'Performance.'],
          ],
          prereqs: ['Application Gateway and Web Application Firewall'],
        },
        {
          title: 'Azure DNS and private DNS zones',
          description: 'Public zones hosting a domain with alias records to Azure resources, private DNS zones that resolve names inside linked VNets with auto-registration, and the 168.63.129.16 resolver plus DNS Private Resolver for hybrid lookups.',
          concepts: ['Public zones and record sets', 'Alias records', 'Private DNS zones and VNet links', 'Auto-registration', 'DNS Private Resolver'],
          quiz: [
            ['What is 168.63.129.16?', 'The Azure-provided DNS and platform address used inside VNets.'],
            ['How do VMs get A records automatically in a private zone?', 'By linking the VNet with auto-registration enabled.'],
          ],
          prereqs: ['Virtual networks, subnets and peering'],
        },
        {
          title: 'Private endpoints, VPN Gateway and ExpressRoute',
          description: 'Private Link puts a PaaS service on a private IP in your VNet with a matching private DNS zone, service endpoints keep traffic on the backbone, and VPN Gateway or ExpressRoute connect on-premises networks with different bandwidth and SLA.',
          concepts: ['Private endpoints and Private Link', 'Service endpoints versus private endpoints', 'Site-to-site and point-to-site VPN', 'ExpressRoute circuits', 'Azure Bastion'],
          quiz: [
            ['Why does a private endpoint need a private DNS zone?', 'So the service hostname resolves to the private IP instead of the public one.'],
            ['What does Azure Bastion remove the need for?', 'Public IPs on VMs for SSH and RDP.'],
          ],
          prereqs: ['Azure DNS and private DNS zones'],
        },
      ],
    },
    {
      title: 'Messaging and Integration',
      topics: [
        {
          title: 'Service Bus queues and topics',
          description: 'Enterprise messaging with queues, topics and subscriptions, peek-lock versus receive-and-delete, sessions for ordered processing, dead-letter queues, scheduled and deferred messages, and duplicate detection.',
          concepts: ['Queues, topics and subscriptions', 'Peek-lock and message settlement', 'Sessions and ordering', 'Dead-lettering and TTL', 'Subscription filters and duplicate detection'],
          quiz: [
            ['What does peek-lock guarantee?', 'The message stays locked until completed or abandoned, giving at-least-once processing.'],
            ['How do you process messages from one customer in order?', 'Set the same session id and use a session-enabled queue.'],
            ['Which tier is required for topics?', 'Standard or Premium; Basic has queues only.'],
          ],
        },
        {
          title: 'Event Grid',
          description: 'A push-based event router: system topics from Azure services, custom topics, event subscriptions with filters, handlers such as Functions, webhooks and Service Bus, retry with dead-lettering, and the CloudEvents schema.',
          concepts: ['System and custom topics', 'Event subscriptions and filters', 'Handler types and webhook validation', 'Retry policy and dead-letter destination', 'CloudEvents schema'],
          quiz: [
            ['What is the difference between Event Grid and Service Bus?', 'Event Grid routes discrete push events; Service Bus queues messages for pull-based processing.'],
            ['How does Event Grid validate a webhook endpoint?', 'With a validation handshake event the endpoint must echo back.'],
          ],
          prereqs: ['Service Bus queues and topics'],
        },
        {
          title: 'Event Hubs',
          description: 'A high-throughput event streaming service with partitions, consumer groups and checkpointing, throughput units and the Kafka-compatible endpoint, Capture to Blob storage, and retention windows for replay.',
          concepts: ['Partitions and partition keys', 'Consumer groups and checkpoints', 'Throughput units and Premium tier', 'Kafka endpoint compatibility', 'Event Hubs Capture'],
          quiz: [
            ['How is Event Hubs different from Service Bus?', 'It streams high volumes with partitioned replay rather than individual message settlement.'],
            ['Where does a consumer store its checkpoint?', 'In Blob storage through the EventProcessorClient.'],
          ],
          prereqs: ['Event Grid'],
        },
      ],
    },
    {
      title: 'Monitoring',
      topics: [
        {
          title: 'Azure Monitor metrics and alerts',
          description: 'Platform metrics per resource with one-minute granularity, custom metrics, metric alert rules with dynamic thresholds, action groups that email, page or call a webhook, and alert processing rules for suppression.',
          concepts: ['Platform and custom metrics', 'Metric alert rules and dynamic thresholds', 'Action groups', 'Alert processing rules', 'Metrics explorer and dashboards'],
          quiz: [
            ['What does an action group contain?', 'Notification targets and actions such as email, SMS, webhook, Logic App or runbook.'],
            ['What is a dynamic threshold?', 'A machine-learned baseline that alerts on deviation instead of a fixed number.'],
          ],
        },
        {
          title: 'Log Analytics and KQL',
          description: 'Sending diagnostic settings and agent data into a Log Analytics workspace, querying tables with Kusto Query Language (where, summarize, join, render), log search alerts, and retention and commitment tiers that set cost.',
          concepts: ['Diagnostic settings and workspaces', 'KQL operators and summarize', 'Log search alert rules', 'Retention and pricing tiers', 'Azure Monitor Agent and data collection rules'],
          quiz: [
            ['Which KQL operator groups and aggregates?', 'summarize.'],
            ['How do platform logs reach a workspace?', 'A diagnostic setting on the resource that routes categories to the workspace.'],
            ['What does a data collection rule define?', 'Which data the Azure Monitor Agent collects and where it sends it.'],
          ],
          prereqs: ['Azure Monitor metrics and alerts'],
        },
        {
          title: 'Application Insights',
          description: 'Application performance monitoring: SDK or auto-instrumentation, requests, dependencies, exceptions and traces, the application map, live metrics, availability tests, sampling to control volume, and workspace-based resources.',
          concepts: ['Instrumentation and connection strings', 'Requests, dependencies and exceptions', 'Application map and live metrics', 'Availability tests', 'Sampling and OpenTelemetry'],
          quiz: [
            ['What does the application map show?', 'Components and their dependencies with call rates, latency and failures.'],
            ['Why use adaptive sampling?', 'To cap telemetry volume and cost while keeping statistically representative data.'],
          ],
          prereqs: ['Log Analytics and KQL'],
        },
        {
          title: 'Activity log, Service Health and workbooks',
          description: 'The subscription-level activity log records control-plane operations for audit, Service Health and Resource Health surface platform incidents, and workbooks combine KQL, metrics and parameters into shareable reports.',
          concepts: ['Activity log categories', 'Service Health and Resource Health alerts', 'Workbooks and parameters', 'Change Analysis', 'Exporting logs to Event Hubs'],
          quiz: [
            ['Who deleted the resource group last night?', 'Check the activity log for the Delete operation and its caller.'],
            ['What is the difference between Service Health and Resource Health?', 'Service Health reports platform incidents; Resource Health reports the state of your specific resource.'],
          ],
          prereqs: ['Log Analytics and KQL'],
        },
      ],
    },
    {
      title: 'Infrastructure as Code',
      topics: [
        {
          title: 'ARM templates and deployments',
          description: 'The JSON template format with parameters, variables, resources and outputs, deployment modes (incremental versus complete), what-if previews, deployment scopes, and reading the Resource Manager API versions that Bicep compiles to.',
          concepts: ['Template sections and functions', 'Incremental versus complete mode', 'What-if preview', 'Deployment scopes', 'API versions and resource providers'],
          quiz: [
            ['What does complete mode do?', 'Deletes resources in the group that are not in the template.'],
            ['How do you preview changes before deploying?', 'az deployment group what-if.'],
          ],
          prereqs: ['Tenants, subscriptions and resource groups'],
        },
        {
          title: 'Bicep language',
          description: 'A declarative DSL that compiles to ARM: resource declarations with symbolic names, parameters with decorators, variables, outputs, loops and conditions, existing resources, and az bicep build and decompile.',
          concepts: ['Resource declarations and symbolic names', 'Parameters and decorators', 'Loops and conditions', 'existing keyword and dependsOn inference', 'bicep build and decompile'],
          quiz: [
            ['How does Bicep know deployment order?', 'It infers dependsOn from references between symbolic names.'],
            ['What does the @secure() decorator do?', 'Marks a parameter so its value is not logged or stored in deployment history.'],
            ['How do you reference a resource not defined in the file?', 'Declare it with the existing keyword.'],
          ],
          prereqs: ['ARM templates and deployments'],
        },
        {
          title: 'Bicep modules, registries and deployment stacks',
          description: 'Splitting templates into modules with inputs and outputs, publishing versioned modules to an Azure Container Registry, the public module registry, parameter files in .bicepparam, and deployment stacks that track and clean up resources.',
          concepts: ['Module files and scopes', 'Private module registries', 'Azure Verified Modules', 'bicepparam parameter files', 'Deployment stacks and deny settings'],
          quiz: [
            ['How do you publish a Bicep module?', 'az bicep publish --target br:<registry>/<path>:<tag>'],
            ['What does a deployment stack add over a plain deployment?', 'Tracking of managed resources with deletion on removal and deny settings against drift.'],
          ],
          prereqs: ['Bicep language'],
        },
        {
          title: 'Terraform on Azure',
          description: 'The azurerm provider with service principal, OIDC or CLI authentication, the azurerm backend in a storage account with blob lease locking, azapi for new resources, and choosing Terraform when teams span clouds. Terraform itself is taught in track-terraform.',
          concepts: ['azurerm provider authentication', 'Storage account backend and lease locking', 'Common azurerm resources', 'azapi provider for gaps', 'Bicep versus Terraform decision'],
          quiz: [
            ['How does the azurerm backend lock state?', 'With a blob lease on the state file.'],
            ['Which environment variables authenticate as a service principal?', 'ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_TENANT_ID and ARM_SUBSCRIPTION_ID.'],
          ],
          prereqs: ['ARM templates and deployments'],
        },
      ],
    },
    {
      title: 'Security',
      topics: [
        {
          title: 'Managed identities',
          description: 'System-assigned identities that live and die with a resource and user-assigned ones shared across resources, how a VM or app gets a token from the identity endpoint, and why they replace stored client secrets.',
          concepts: ['System-assigned versus user-assigned', 'Token acquisition from the identity endpoint', 'Granting RBAC to an identity', 'DefaultAzureCredential', 'Federated credentials'],
          quiz: [
            ['When prefer a user-assigned identity?', 'When several resources need the same permissions or the identity must outlive a resource.'],
            ['How does DefaultAzureCredential help locally?', 'It falls back to az login credentials so code runs unchanged from laptop to cloud.'],
          ],
          prereqs: ['Role-based access control'],
        },
        {
          title: 'Key Vault',
          description: 'Central storage for secrets, keys and certificates with RBAC or access policies, soft delete and purge protection, Key Vault references from App Service and Functions, auto-rotation, and Managed HSM for FIPS 140-2 Level 3 keys.',
          concepts: ['Secrets, keys and certificates', 'RBAC versus access policy model', 'Soft delete and purge protection', 'Key Vault references', 'Managed HSM'],
          quiz: [
            ['How does an App Service read a secret without code changes?', 'An app setting with @Microsoft.KeyVault(SecretUri=...) resolved by its managed identity.'],
            ['What does purge protection prevent?', 'Permanent deletion of a soft-deleted vault or object during the retention period.'],
          ],
          prereqs: ['Managed identities'],
        },
        {
          title: 'Microsoft Defender for Cloud',
          description: 'Cloud security posture management with the secure score and recommendations, Defender plans for servers, storage, SQL, containers and Key Vault, regulatory compliance dashboards, and just-in-time VM access.',
          concepts: ['Secure score and recommendations', 'Defender plans per resource type', 'Regulatory compliance standards', 'Just-in-time VM access', 'Security alerts and workflow automation'],
          quiz: [
            ['What does just-in-time VM access do?', 'Opens SSH or RDP in the NSG only for an approved window and source.'],
            ['What is the secure score?', 'A percentage reflecting how many security recommendations are remediated.'],
          ],
          prereqs: ['Network security groups and application security groups'],
        },
        {
          title: 'Azure Policy',
          description: 'Policy definitions with effects such as Deny, Audit, DeployIfNotExists and Modify, initiatives that bundle them, assignments at management group or subscription scope, exemptions, and remediation tasks for existing resources.',
          concepts: ['Policy definitions and effects', 'Initiatives and built-in standards', 'Assignment scope and exemptions', 'Remediation tasks', 'Compliance reporting'],
          quiz: [
            ['Which effect blocks creation of a resource?', 'Deny.'],
            ['What does DeployIfNotExists do?', 'Deploys a related resource, such as a diagnostic setting, when it is missing.'],
            ['Which effect adds a tag automatically?', 'Modify.'],
          ],
          prereqs: ['Management groups, tags and naming conventions'],
        },
      ],
    },
    {
      title: 'DevOps Integration and Cost Management',
      topics: [
        {
          title: 'Azure Pipelines',
          description: 'YAML pipelines with stages, jobs and steps, Microsoft-hosted and self-hosted agents, service connections with workload identity federation, variable groups linked to Key Vault, environments with approvals, and templates for reuse.',
          concepts: ['Stages, jobs and steps', 'Agents and pools', 'Service connections', 'Variable groups and Key Vault links', 'Environments and approvals', 'Pipeline templates'],
          quiz: [
            ['How does a pipeline authenticate to Azure without a secret?', 'An Azure Resource Manager service connection using workload identity federation.'],
            ['What does an environment approval gate?', 'Deployment jobs targeting that environment wait for a named approver.'],
          ],
          prereqs: ['Managed identities'],
        },
        {
          title: 'GitHub Actions for Azure',
          description: 'The azure/login action with OIDC federated credentials on an app registration or managed identity, azure/webapps-deploy and azure/functions-action, deploying Bicep with azure/arm-deploy, and GitHub environments for approvals.',
          concepts: ['OIDC federated credentials', 'azure/login and azure/cli actions', 'Deploying App Service and Functions', 'Bicep deployment from a workflow', 'GitHub environments and secrets'],
          quiz: [
            ['What must exist in Entra for OIDC from GitHub?', 'A federated credential on the app or identity that trusts the repository and branch subject.'],
            ['Which permission does the workflow need for OIDC?', 'id-token: write.'],
          ],
          prereqs: ['Azure Pipelines'],
        },
        {
          title: 'Release strategies on Azure',
          description: 'Blue-green with deployment slots, canary with Front Door or Container Apps traffic weights, feature flags with App Configuration, and rollback paths that keep a previous revision or slot warm.',
          concepts: ['Blue-green with slot swap', 'Canary traffic splitting', 'App Configuration feature flags', 'Rollback paths', 'Release annotations in Monitor'],
          quiz: [
            ['How do you roll back a bad slot swap?', 'Swap again; the previous production build is still in the staging slot.'],
            ['Where do feature flags live?', 'In Azure App Configuration, read through the feature management libraries.'],
          ],
          prereqs: ['App Service and deployment slots', 'Container Apps'],
        },
        {
          title: 'Cost Management and budgets',
          description: 'Cost analysis grouped by service, resource group or tag, budgets with alert thresholds and action groups, cost exports to storage, the pricing calculator and TCO estimates, and common surprise charges such as public IPs and egress.',
          concepts: ['Cost analysis views and scopes', 'Budgets and alerts', 'Scheduled cost exports', 'Pricing calculator', 'Common surprise charges'],
          quiz: [
            ['Can a budget stop resources when exceeded?', 'Not directly; it triggers an action group that can run automation.'],
            ['Name a common unexpected charge.', 'Egress bandwidth, Standard public IPs or a stopped but not deallocated VM.'],
          ],
        },
        {
          title: 'Reservations, savings plans and Advisor',
          description: 'One- or three-year reserved instances and capacity for VMs, SQL and Cosmos DB, the compute savings plan across services, Azure Hybrid Benefit for Windows and SQL licences, spot VMs, and Advisor cost recommendations.',
          concepts: ['Reserved instances and instance size flexibility', 'Azure savings plan for compute', 'Azure Hybrid Benefit', 'Spot VMs', 'Advisor recommendations'],
          quiz: [
            ['What does instance size flexibility do?', 'Applies a reservation across sizes in the same VM family.'],
            ['When does a spot VM get evicted?', 'When Azure needs the capacity back or the price exceeds your maximum.'],
          ],
          prereqs: ['Cost Management and budgets', 'Virtual machines and images'],
        },
      ],
    },
    {
      title: 'Projects and Certification Review',
      topics: [
        {
          title: 'Project: web app with slots, Key Vault and Application Insights',
          description: 'Deploy an App Service app with a staging slot, secrets pulled from Key Vault through a managed identity, Application Insights instrumentation, a custom domain with a managed certificate, and a GitHub Actions workflow that deploys to staging and swaps on approval.',
          concepts: ['Provision the plan, app and slot in Bicep', 'Wire managed identity and Key Vault references', 'Instrument and add availability tests', 'Deploy, swap and roll back from CI'],
          quiz: [
            ['Why deploy to the staging slot first?', 'To warm the new build and verify it before swapping into production.'],
            ['How does the app read the database connection string?', 'From a Key Vault reference resolved with its managed identity.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: hub-and-spoke network with private PaaS',
          description: 'Build a hub VNet with Bastion and a firewall, two spoke VNets peered to it, a PostgreSQL Flexible Server and storage account reachable only through private endpoints, private DNS zones, and NSG flow logs into Log Analytics.',
          concepts: ['Design address spaces and peering', 'Add Bastion and private endpoints', 'Configure private DNS zones', 'Verify isolation and flow logs'],
          quiz: [
            ['How do you prove the database is not reachable from the internet?', 'Public network access is disabled and nslookup resolves the private IP from a spoke VM.'],
            ['Why route spoke-to-spoke traffic through the hub?', 'Peering is not transitive and the hub firewall inspects it centrally.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: event-driven order processing with Functions and Service Bus',
          description: 'An HTTP-triggered Function writes orders to Cosmos DB and publishes to a Service Bus topic; subscriptions drive invoicing and notification Functions with sessions for per-customer ordering, dead-letter alerts, and Application Insights tracing across hops.',
          concepts: ['Model the Cosmos container and partition key', 'Build the API and publisher', 'Add subscriptions and consumers', 'Trace, alert on dead letters and document'],
          quiz: [
            ['How do you keep one customer\'s orders in sequence?', 'Session-enabled subscriptions keyed on the customer id.'],
            ['How do you see the whole flow in one view?', 'Application Insights transaction search with the shared operation id.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: governed landing zone with Policy and budgets',
          description: 'Create management groups for platform and workloads, assign Policy initiatives that enforce tags, allowed regions and diagnostic settings, enable Defender plans, set budgets with action groups, and deploy everything with Bicep and a pipeline.',
          concepts: ['Create the management group tree', 'Author and assign policies', 'Enable Defender and budgets', 'Automate with Bicep and remediation'],
          quiz: [
            ['How do you block deployments outside two regions?', 'An Azure Policy with the allowed locations definition assigned at the management group.'],
            ['How do existing resources become compliant with DeployIfNotExists?', 'Create a remediation task for the assignment.'],
          ],
          style: 'project',
        },
        {
          title: 'AZ-104 and AZ-204 review',
          description: 'AZ-104 covers identity and governance, storage, compute, networking and monitoring for administrators; AZ-204 covers App Service, Functions, Cosmos DB, storage SDKs, Key Vault, Event Grid, Service Bus and API Management for developers; how questions are worded and where they overlap.',
          concepts: ['AZ-104 domains and weighting', 'AZ-204 domains and weighting', 'Reading scenario questions', 'Service comparison tables', 'Practice exam routine'],
          quiz: [
            ['Which exam asks about writing Functions bindings in code?', 'AZ-204.'],
            ['Which service is the answer for ordered, transactional messaging?', 'Service Bus.'],
            ['What word in a question hints at Azure Files?', 'SMB share mounted by multiple VMs.'],
          ],
          style: 'reading',
        },
        {
          title: 'Azure interview questions',
          description: 'What interviewers ask Azure engineers: managed identity versus service principal, NSG versus firewall, Blob tiers, App Service versus Container Apps versus AKS, Cosmos consistency levels, Bicep versus Terraform, and walking through a design you built.',
          concepts: ['Identity and access questions', 'Networking comparison questions', 'Compute choice questions', 'Data platform trade-offs', 'Walking through an architecture'],
          quiz: [
            ['Managed identity versus service principal in one sentence?', 'A managed identity is a service principal whose credentials Azure creates and rotates for you.'],
            ['When would you not use App Service?', 'When you need custom networking, sidecars or non-HTTP workloads that fit Container Apps or AKS better.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
