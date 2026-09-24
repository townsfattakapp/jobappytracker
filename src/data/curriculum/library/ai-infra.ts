import { defineTrack } from '../define'

export const aiInfra = defineTrack({
  id: 'track-ai-infra',
  title: 'AI Infrastructure and Deployment',
  description: 'The platform under AI systems: GPUs and accelerators, CUDA and drivers, CUDA-enabled containers, Kubernetes GPU scheduling with KServe and Ray Serve, SageMaker, Vertex AI and Azure ML, storage and data lakes for training data, networking and secrets, Terraform for ML stacks, distributed training clusters, spot-instance cost control, security, compliance and deployment pipelines.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🏗️',
  tags: ['ai infrastructure', 'gpu', 'cuda', 'kubernetes', 'kserve', 'terraform', 'sagemaker', 'vertex ai', 'distributed training'],
  languages: ['Python'],
  explainMode: 'devops',
  code: { label: 'shell, YAML and Terraform, whichever fits', id: 'bash', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-docker'],
  style: 'practice',
  categories: [
    {
      title: 'GPUs and Accelerators',
      description: 'What the hardware is and how to tell whether it is being used.',
      topics: [
        {
          title: 'GPU architecture for machine learning',
          description: 'Streaming multiprocessors, tensor cores, HBM and the memory hierarchy, and why ML workloads are usually memory-bandwidth bound: the mental model behind every utilisation and sizing decision.',
          concepts: ['Streaming multiprocessors and tensor cores', 'HBM and memory bandwidth', 'Compute-bound versus memory-bound', 'GPU generations and their differences'],
          quiz: [
            ['Why does memory bandwidth matter more than FLOPS for LLM decoding?', 'Each token reads all the weights once, so the GPU waits on memory, not compute.'],
            ['What do tensor cores accelerate?', 'Matrix multiply-accumulate in reduced precision such as fp16, bf16 and fp8.'],
          ],
        },
        {
          title: 'Choosing accelerators',
          description: 'NVIDIA data-centre GPUs, AMD Instinct with ROCm, Google TPUs, AWS Inferentia and Trainium, and consumer cards, compared on memory, interconnect, software maturity and price per unit of work.',
          concepts: ['NVIDIA data-centre lineup', 'AMD ROCm ecosystem', 'TPUs, Inferentia and Trainium', 'Memory and interconnect as selectors'],
          quiz: [
            ['What usually decides whether a model fits a GPU?', 'Memory capacity, not compute.'],
            ['What is the main trade-off with non-NVIDIA accelerators?', 'Lower cost or better availability against a less mature software stack.'],
          ],
          prereqs: ['GPU architecture for machine learning'],
        },
        {
          title: 'CUDA toolkit, drivers and compatibility',
          description: 'The layering of kernel driver, CUDA runtime, cuDNN and framework builds, the compatibility matrix that decides which PyTorch wheel works with which driver, and how to diagnose "CUDA not available".',
          concepts: ['Driver versus CUDA runtime versions', 'cuDNN and NCCL libraries', 'Framework wheels and CUDA builds', 'Diagnosing CUDA not available'],
          quiz: [
            ['Does installing PyTorch install the GPU driver?', 'No. The wheel bundles the CUDA runtime, but the kernel driver must be installed on the host.'],
            ['What does nvidia-smi\'s CUDA version show?', 'The maximum CUDA runtime the installed driver supports, not what is installed.'],
          ],
          prereqs: ['GPU architecture for machine learning'],
        },
        {
          title: 'GPU monitoring with nvidia-smi and DCGM',
          description: 'Reading utilisation, memory, temperature and power with nvidia-smi, exporting fleet metrics with the DCGM exporter, and spotting the classic signs of a data-loading bottleneck or an idle reserved GPU.',
          concepts: ['nvidia-smi fields and queries', 'DCGM exporter metrics', 'Data-loader bottleneck signatures', 'Idle and underused GPU detection'],
          quiz: [
            ['What does low GPU utilisation with high CPU usage usually mean?', 'The data pipeline cannot feed the GPU fast enough.'],
            ['How do you export GPU metrics to Prometheus?', 'Run the DCGM exporter and scrape its metrics endpoint.'],
          ],
          prereqs: ['CUDA toolkit, drivers and compatibility'],
        },
        {
          title: 'Numeric precision and hardware',
          description: 'fp32, tf32, fp16, bf16, fp8 and int8: what each costs in memory and accuracy, which GPUs support them natively, and why bf16 became the default for training and fp8 matters for the newest hardware.',
          concepts: ['fp32 and tf32', 'fp16 versus bf16 range', 'fp8 and int8 support', 'Mixed precision and loss scaling'],
          quiz: [
            ['Why is bf16 preferred over fp16 for training?', 'It keeps fp32\'s exponent range, so overflow and loss scaling are less of a problem.'],
            ['Which GPUs support fp8 natively?', 'NVIDIA Hopper and later, such as H100.'],
          ],
          prereqs: ['GPU architecture for machine learning'],
        },
      ],
    },
    {
      title: 'Containers for ML',
      topics: [
        {
          title: 'CUDA base images and the NVIDIA Container Toolkit',
          description: 'How containers get GPU access: the toolkit injects the host driver at runtime, nvidia/cuda and framework images supply the CUDA runtime, and --gpus selects devices, so the driver never lives in the image.',
          concepts: ['NVIDIA Container Toolkit runtime', 'nvidia/cuda image variants', 'Framework base images', 'Selecting GPUs with --gpus'],
          quiz: [
            ['Why is the driver not in the Docker image?', 'It is a kernel component; the toolkit mounts the host driver libraries into the container.'],
            ['What is the difference between runtime and devel CUDA images?', 'devel includes compilers and headers for building extensions; runtime is smaller.'],
          ],
        },
        {
          title: 'Building lean ML images',
          description: 'Multi-stage builds, pinned dependency layers ordered for cache hits, no notebooks or datasets in the image, and a base image chosen for size, since a 15 GB image slows every deploy and autoscale event.',
          concepts: ['Layer ordering for cache hits', 'Multi-stage builds for ML', 'Slim base image selection', 'What never belongs in the image'],
          quiz: [
            ['Why install dependencies before copying source code?', 'Source changes then do not invalidate the cached dependency layer.'],
            ['Why keep model weights out of the image?', 'Images stay small and weights can change without a rebuild.'],
          ],
          prereqs: ['CUDA base images and the NVIDIA Container Toolkit'],
        },
        {
          title: 'Registries, scanning and image provenance',
          description: 'Pushing to ECR, GCR or GHCR, scanning images for vulnerabilities, signing them, pinning by digest in deployments, and cleanup policies so the registry does not fill with stale multi-gigabyte images.',
          concepts: ['Cloud registries and authentication', 'Vulnerability scanning', 'Signing and digest pinning', 'Retention and cleanup policies'],
          quiz: [
            ['Why deploy by digest rather than tag?', 'Tags can move; a digest identifies exactly one image.'],
            ['What does image scanning catch?', 'Known CVEs in OS packages and libraries inside the image.'],
          ],
          prereqs: ['Building lean ML images'],
        },
        {
          title: 'Local GPU stacks with Docker Compose',
          description: 'A Compose file that runs a model server, a vector database and a tracking server with GPU reservations, shared volumes for weights and a network, mirroring production closely enough to catch integration bugs.',
          concepts: ['GPU reservations in Compose', 'Volumes for weights and data', 'Service networking and health checks', 'Parity with production'],
          quiz: [
            ['How do you request a GPU in Compose?', 'Under deploy.resources.reservations.devices with driver nvidia and capabilities gpu.'],
            ['Why mount weights as a volume locally?', 'To avoid re-downloading gigabytes on every container rebuild.'],
          ],
          prereqs: ['CUDA base images and the NVIDIA Container Toolkit'],
        },
      ],
    },
    {
      title: 'Kubernetes for ML Workloads',
      description: 'Assumes core Kubernetes; this is what changes for GPUs.',
      topics: [
        {
          title: 'GPU scheduling on Kubernetes',
          description: 'The NVIDIA device plugin advertises GPUs as a resource, pods request nvidia.com/gpu, and node labels, selectors, taints and tolerations keep CPU-only work off expensive GPU nodes.',
          concepts: ['NVIDIA device plugin and GPU Operator', 'Requesting nvidia.com/gpu', 'Node selectors and taints for GPU pools', 'Whole-GPU allocation limits'],
          quiz: [
            ['Can a pod request half a GPU with the device plugin?', 'No. GPUs are whole units unless MIG or time-slicing is configured.'],
            ['What does the GPU Operator install?', 'Driver, device plugin, toolkit and monitoring components across the cluster.'],
          ],
        },
        {
          title: 'GPU sharing with MIG and time-slicing',
          description: 'Multi-Instance GPU partitions an A100 or H100 into isolated slices with their own memory, time-slicing shares one GPU between pods without isolation; each fits different inference workloads.',
          concepts: ['MIG profiles and isolation', 'Time-slicing configuration', 'When sharing hurts latency', 'Sharing for small inference models'],
          quiz: [
            ['What does MIG guarantee that time-slicing does not?', 'Memory and compute isolation between slices.'],
            ['When is time-slicing acceptable?', 'For bursty, latency-tolerant workloads that individually underuse the GPU.'],
          ],
          prereqs: ['GPU scheduling on Kubernetes'],
        },
        {
          title: 'Training jobs and queueing',
          description: 'Kubernetes Jobs for single-node training, the Kubeflow Training Operator for distributed PyTorch jobs, and Kueue for fair-share queueing so teams do not starve each other of GPUs.',
          concepts: ['Jobs with GPU requests', 'Kubeflow Training Operator', 'Kueue queues and quotas', 'Gang scheduling'],
          quiz: [
            ['What is gang scheduling?', 'Starting all pods of a distributed job together or none, to avoid partial jobs holding GPUs.'],
            ['What does Kueue add?', 'Queueing, quotas and fair sharing of cluster resources between teams.'],
          ],
          prereqs: ['GPU scheduling on Kubernetes'],
        },
        {
          title: 'KServe overview',
          description: 'InferenceService resources that deploy a model from a storage URI with a standard runtime, request-based autoscaling with scale to zero through Knative, canary traffic splits and transformers for pre and postprocessing.',
          concepts: ['InferenceService resource', 'Model storage URIs and runtimes', 'Knative autoscaling and scale to zero', 'Canary splits and transformers'],
          quiz: [
            ['What does a KServe InferenceService abstract?', 'Deployment, service, autoscaling and routing for a model behind a standard API.'],
            ['How does KServe achieve scale to zero?', 'Through Knative serving, which scales pods on request activity.'],
          ],
          prereqs: ['GPU scheduling on Kubernetes'],
        },
        {
          title: 'Ray on Kubernetes',
          description: 'KubeRay runs Ray clusters as custom resources; Ray Serve deployments and Ray Train jobs then scale across pods with autoscaling worker groups and GPU-aware placement.',
          concepts: ['KubeRay operator and RayCluster', 'Ray Serve on Kubernetes', 'Ray Train jobs', 'Autoscaling worker groups'],
          quiz: [
            ['What is a RayCluster resource?', 'A Kubernetes custom resource describing a Ray head and worker groups.'],
            ['Why run Ray on Kubernetes rather than VMs?', 'Shared scheduling, autoscaling and the same operational tooling as the rest of the platform.'],
          ],
          prereqs: ['Training jobs and queueing'],
        },
        {
          title: 'Helm and GitOps for ML services',
          description: 'Packaging model services and platform components as Helm charts, environment values per stage, and Argo CD or Flux syncing the cluster from Git so every change to the ML platform is reviewed and reversible.',
          concepts: ['Helm charts for model services', 'Values per environment', 'Argo CD or Flux sync', 'Reverting by Git revert'],
          quiz: [
            ['What does GitOps give an ML platform?', 'An audited, reviewable history of every deployment and a one-step revert.'],
            ['Where do environment-specific settings go in Helm?', 'In separate values files per environment.'],
          ],
          prereqs: ['KServe overview'],
        },
      ],
    },
    {
      title: 'Managed ML Platforms',
      topics: [
        {
          title: 'Amazon SageMaker overview',
          description: 'Training jobs, processing jobs, the model registry, real-time and serverless endpoints, batch transform and pipelines, and how IAM roles and S3 tie them together.',
          concepts: ['Training and processing jobs', 'Endpoints and batch transform', 'SageMaker Pipelines and registry', 'IAM roles and S3 integration'],
          quiz: [
            ['What is a SageMaker training job?', 'A managed run of a container on chosen instances with data from S3 and artefacts written back.'],
            ['When would you use batch transform?', 'For scoring a large dataset without keeping an endpoint running.'],
          ],
        },
        {
          title: 'Google Vertex AI overview',
          description: 'Custom training jobs, Vertex Pipelines built on KFP, the model registry, endpoints with traffic splitting, and the model garden for foundation models, all bound to GCS and IAM.',
          concepts: ['Custom training jobs', 'Vertex Pipelines', 'Registry and endpoints with traffic split', 'Model Garden and foundation models'],
          quiz: [
            ['What SDK do Vertex Pipelines use?', 'Kubeflow Pipelines (KFP) SDK, compiled to a pipeline spec.'],
            ['How does a Vertex endpoint do canaries?', 'Deploy multiple models to one endpoint and split traffic by percentage.'],
          ],
        },
        {
          title: 'Azure Machine Learning overview',
          description: 'Workspaces, compute clusters and instances, jobs defined in YAML, the model registry, managed online and batch endpoints, and integration with Azure OpenAI and Entra ID.',
          concepts: ['Workspaces and compute targets', 'YAML job definitions', 'Managed online and batch endpoints', 'Azure OpenAI integration'],
          quiz: [
            ['What is a compute cluster in Azure ML?', 'An autoscaling pool of VMs that runs jobs and scales to zero when idle.'],
            ['How are Azure ML jobs typically defined?', 'In YAML files submitted with the az ml CLI.'],
          ],
        },
        {
          title: 'Managed versus self-hosted decisions',
          description: 'Weighing operational load, cost at scale, lock-in, GPU availability and compliance to decide between managed platforms and a Kubernetes stack, and the hybrid that most mature teams end up with.',
          concepts: ['Operational load comparison', 'Cost at low and high scale', 'Lock-in and portability', 'Hybrid platform patterns'],
          quiz: [
            ['When does self-hosting on Kubernetes pay off?', 'At sustained high GPU usage where managed margins dominate, and when a platform team exists.'],
            ['What is a common hybrid?', 'Managed training and experimentation with self-hosted, cost-optimised inference, or the reverse.'],
          ],
          prereqs: ['Amazon SageMaker overview', 'Google Vertex AI overview', 'Azure Machine Learning overview'],
        },
      ],
    },
    {
      title: 'Storage and Data for Training',
      topics: [
        {
          title: 'Object storage for datasets and checkpoints',
          description: 'S3, GCS and Azure Blob as the system of record: bucket layout by dataset and version, object versioning, lifecycle rules to cold tiers, and multipart uploads for large checkpoints.',
          concepts: ['Bucket layout and naming', 'Object versioning', 'Lifecycle rules and cold tiers', 'Multipart upload for checkpoints'],
          quiz: [
            ['Why enable object versioning on a dataset bucket?', 'Accidental overwrites and deletions can be recovered and old versions referenced.'],
            ['What do lifecycle rules save?', 'Cost, by moving old checkpoints and datasets to cheaper storage classes.'],
          ],
        },
        {
          title: 'Data lakes and table formats',
          description: 'Parquet for columnar training data, Iceberg or Delta tables for schema evolution and time travel, and partitioning that lets a training job read only what it needs.',
          concepts: ['Parquet for training data', 'Iceberg and Delta tables', 'Time travel for reproducibility', 'Partitioning for selective reads'],
          quiz: [
            ['How does a table format help reproducibility?', 'A training run can pin a snapshot and read exactly the same data later.'],
            ['Why Parquet over CSV for training data?', 'Columnar, compressed and typed, so reads are faster and smaller.'],
          ],
          prereqs: ['Object storage for datasets and checkpoints'],
        },
        {
          title: 'High-throughput data loading',
          description: 'Feeding GPUs from remote storage: streaming datasets with WebDataset or MosaicML Streaming, local NVMe caching, parallel file systems like FSx for Lustre, and measuring loader throughput against GPU demand.',
          concepts: ['Streaming dataset formats', 'Local NVMe caching', 'Parallel file systems', 'Measuring loader throughput'],
          quiz: [
            ['What is the sign that data loading is the bottleneck?', 'GPU utilisation fluctuates or stays low while CPU or network is saturated.'],
            ['What does a shard-based streaming format enable?', 'Sequential reads of large chunks from object storage with many workers.'],
          ],
          prereqs: ['Data lakes and table formats'],
        },
        {
          title: 'Checkpoint and artefact storage strategy',
          description: 'How often to checkpoint, how many to keep, where they live, and async checkpointing so a multi-terabyte state does not stall training; plus artefact naming that ties checkpoints to runs.',
          concepts: ['Checkpoint frequency and retention', 'Asynchronous checkpointing', 'Naming and linking to runs', 'Restoring from checkpoints'],
          quiz: [
            ['Why keep only the last few checkpoints?', 'Large checkpoints consume storage fast; keep the latest plus milestone ones.'],
            ['What does async checkpointing avoid?', 'Blocking training while the checkpoint is written to storage.'],
          ],
          prereqs: ['Object storage for datasets and checkpoints'],
        },
      ],
    },
    {
      title: 'Networking and Secrets',
      topics: [
        {
          title: 'Exposing AI services',
          description: 'Ingress controllers and load balancers for model endpoints, private endpoints for internal services, long timeouts and body limits for large payloads and streaming, and TLS termination.',
          concepts: ['Ingress and load balancers', 'Private versus public endpoints', 'Timeouts and body size for ML traffic', 'TLS termination'],
          quiz: [
            ['Why do model endpoints need longer proxy timeouts?', 'Inference and streaming responses can take far longer than typical web requests.'],
            ['When should an endpoint be private?', 'When only internal services call it; it removes a whole class of exposure.'],
          ],
        },
        {
          title: 'Secrets management for AI services',
          description: 'API keys for model providers, database credentials and Hugging Face tokens stored in Vault or cloud secret managers, injected at runtime, rotated, and never in images, code or prompts.',
          concepts: ['Vault and cloud secret managers', 'Runtime injection into pods', 'Rotation and revocation', 'Secrets never in images or prompts'],
          quiz: [
            ['How should a pod receive an API key?', 'From a secret store via a CSI driver or environment injection, not baked into the image.'],
            ['What is the risk of a key in a prompt template?', 'It reaches the model context and can be leaked in output.'],
          ],
        },
        {
          title: 'Service-to-service authentication',
          description: 'Workload identity on AWS, GCP and Azure so pods get cloud credentials without static keys, mutual TLS through a service mesh, and short-lived tokens between the gateway, retrieval and model services.',
          concepts: ['Workload identity for pods', 'Mutual TLS with a service mesh', 'Short-lived service tokens', 'Least-privilege cloud roles'],
          quiz: [
            ['What replaces static cloud keys in pods?', 'Workload identity: the pod\'s service account maps to a cloud role.'],
            ['What does mTLS add between services?', 'Both sides prove identity and traffic is encrypted inside the cluster.'],
          ],
          prereqs: ['Secrets management for AI services'],
        },
        {
          title: 'API gateways and rate limiting for model endpoints',
          description: 'A gateway that authenticates callers, enforces per-client quotas in requests and tokens, adds retries and circuit breakers, and shields expensive GPU services from abuse and accidental floods.',
          concepts: ['Gateway authentication', 'Per-client request and token quotas', 'Retries and circuit breakers', 'Protecting GPU capacity'],
          quiz: [
            ['Why rate limit by tokens rather than requests for LLMs?', 'Cost and load scale with tokens; one request can be a thousand times another.'],
            ['What does a circuit breaker do for a model service?', 'Stops sending requests to a failing backend so it can recover.'],
          ],
          prereqs: ['Exposing AI services'],
        },
      ],
    },
    {
      title: 'Infrastructure as Code for ML',
      topics: [
        {
          title: 'Terraform for GPU clusters',
          description: 'Provisioning a Kubernetes cluster with a GPU node pool, remote state with locking, modules for reusable pieces, and variables for instance types and counts so a cluster can be recreated in another region.',
          concepts: ['GPU node pools in Terraform', 'Remote state and locking', 'Modules for cluster components', 'Variables for instance choices'],
          quiz: [
            ['Why remote state with locking?', 'Teams share one source of truth and cannot corrupt it with concurrent applies.'],
            ['How do you add GPU nodes to an EKS or GKE cluster in Terraform?', 'Define a node pool or node group with a GPU instance type and the required labels or taints.'],
          ],
        },
        {
          title: 'Provisioning managed ML resources',
          description: 'Terraform resources for SageMaker endpoints, Vertex AI endpoints and Azure ML workspaces, buckets and IAM roles alongside them, and where imperative deployment steps still belong in a pipeline.',
          concepts: ['SageMaker resources in Terraform', 'Vertex and Azure ML resources', 'Buckets and IAM alongside', 'Declarative versus pipeline steps'],
          quiz: [
            ['Should model version deployment be in Terraform?', 'Usually not; it changes often and belongs in a deployment pipeline, while the endpoint itself can be Terraform-managed.'],
            ['What should always be provisioned with the platform?', 'Buckets, roles and networking the ML services depend on.'],
          ],
          prereqs: ['Terraform for GPU clusters'],
        },
        {
          title: 'Kubernetes manifests, Helm and Kustomize',
          description: 'Templating model service manifests with Helm, overlaying environments with Kustomize, and keeping GPU requests, node selectors and resource limits explicit in the manifests.',
          concepts: ['Helm templates for inference services', 'Kustomize overlays', 'Explicit GPU requests and limits', 'Manifest linting and validation'],
          quiz: [
            ['When choose Kustomize over Helm?', 'For simple environment overlays without templating logic.'],
            ['Why lint manifests in CI?', 'A missing GPU request or wrong selector fails silently until the pod is pending forever.'],
          ],
          prereqs: ['Terraform for GPU clusters'],
        },
        {
          title: 'Environment promotion and drift detection',
          description: 'Separate dev, staging and production stacks, terraform plan in CI on every change, scheduled plans that detect manual drift, and policy checks that block risky changes to production.',
          concepts: ['Per-environment stacks', 'terraform plan in CI', 'Scheduled drift detection', 'Policy checks on plans'],
          quiz: [
            ['What is infrastructure drift?', 'The live infrastructure differing from what the code declares, usually after manual changes.'],
            ['Why run plan on a schedule?', 'To catch drift even when nobody is changing code.'],
          ],
          prereqs: ['Provisioning managed ML resources'],
        },
      ],
    },
    {
      title: 'Distributed Training Infrastructure',
      topics: [
        {
          title: 'Parallelism strategies and their infrastructure needs',
          description: 'Data parallel replicates the model and syncs gradients, tensor parallel splits layers, pipeline parallel splits stages, and FSDP shards parameters; each puts different demands on interconnect and memory.',
          concepts: ['Data parallel and gradient sync', 'Tensor and pipeline parallel', 'FSDP and ZeRO sharding', 'Matching strategy to hardware'],
          quiz: [
            ['What does FSDP shard?', 'Parameters, gradients and optimiser state across GPUs, gathering them only when needed.'],
            ['Which strategy needs the fastest interconnect?', 'Tensor parallelism, because every layer exchanges activations.'],
          ],
        },
        {
          title: 'Interconnects and collective communication',
          description: 'NVLink and NVSwitch inside a node, InfiniBand or RoCE with RDMA between nodes, and NCCL collectives like all-reduce whose throughput sets the ceiling on multi-node scaling.',
          concepts: ['NVLink and NVSwitch', 'InfiniBand, RoCE and RDMA', 'NCCL collectives', 'Diagnosing communication bottlenecks'],
          quiz: [
            ['What is all-reduce used for in training?', 'Averaging gradients across all workers after each step.'],
            ['How do you test inter-node bandwidth?', 'Run nccl-tests and compare to the expected link speed.'],
          ],
          prereqs: ['Parallelism strategies and their infrastructure needs'],
        },
        {
          title: 'Launching multi-node jobs',
          description: 'torchrun with rendezvous, Slurm on HPC-style clusters, and Kubernetes operators, each setting rank, world size and master address so every process finds the others.',
          concepts: ['torchrun and rendezvous', 'Slurm job scripts', 'Rank, world size and master address', 'Kubernetes operators for launch'],
          quiz: [
            ['What does torchrun set for each process?', 'RANK, LOCAL_RANK, WORLD_SIZE and the rendezvous endpoint.'],
            ['Why is Slurm still common for training?', 'Mature gang scheduling and fast interconnect support on HPC clusters.'],
          ],
          prereqs: ['Interconnects and collective communication'],
        },
        {
          title: 'Fault tolerance and elastic training',
          description: 'Long runs will lose nodes: checkpointing, automatic restart from the latest checkpoint, elastic worker counts with torchrun, and health checks that evict bad GPUs before they waste days.',
          concepts: ['Restart from checkpoint', 'Elastic worker counts', 'GPU health checks and eviction', 'Straggler detection'],
          quiz: [
            ['What does elastic training allow?', 'The job continues with fewer or more workers when nodes leave or join.'],
            ['Why run GPU health checks before a big job?', 'A single faulty GPU can slow or crash a multi-day run.'],
          ],
          prereqs: ['Launching multi-node jobs'],
        },
      ],
    },
    {
      title: 'Cost, Security and Compliance',
      topics: [
        {
          title: 'Cloud GPU pricing and capacity',
          description: 'On-demand, reserved and savings-plan pricing, capacity reservations for scarce GPUs, regional availability differences, and reading price per GPU-hour against throughput to compare instance types honestly.',
          concepts: ['On-demand versus reserved pricing', 'Capacity reservations', 'Regional availability', 'Price-performance comparison'],
          quiz: [
            ['Why compare price per unit of work rather than per hour?', 'A pricier GPU that finishes twice as fast is cheaper per job.'],
            ['What is a capacity reservation for?', 'Guaranteeing scarce GPU instances are available when a job needs them.'],
          ],
        },
        {
          title: 'Spot and preemptible instances',
          description: 'Running training and stateless inference on spot capacity with checkpointing, interruption handling, mixed on-demand baselines and node-pool configuration that fails over automatically.',
          concepts: ['Spot interruption notices', 'Checkpoint-and-resume for spot', 'Mixed spot and on-demand pools', 'Spot for stateless inference replicas'],
          quiz: [
            ['How much warning does AWS give before a spot interruption?', 'Two minutes.'],
            ['What keeps SLOs safe when using spot for inference?', 'An on-demand baseline of replicas sized for minimum traffic.'],
          ],
          prereqs: ['Cloud GPU pricing and capacity'],
        },
        {
          title: 'GPU utilisation and bin-packing',
          description: 'Measuring fleet-wide utilisation, packing small jobs onto shared GPUs, scheduling batch work into idle windows, and reclaiming reserved-but-idle capacity, since an idle GPU costs the same as a busy one.',
          concepts: ['Fleet utilisation dashboards', 'Packing small workloads', 'Scheduling into idle windows', 'Reclaiming idle reservations'],
          quiz: [
            ['What utilisation is typical in an unmanaged GPU fleet?', 'Often well below 30 percent, which is why measurement matters.'],
            ['What is bin-packing in this context?', 'Placing multiple workloads on one GPU or node to fill unused capacity.'],
          ],
          prereqs: ['Cloud GPU pricing and capacity'],
        },
        {
          title: 'Security hardening for AI infrastructure',
          description: 'Least-privilege IAM for training and serving, network isolation of GPU nodes, image scanning and non-root containers, protecting model weights as intellectual property, and audit logging of access.',
          concepts: ['Least-privilege IAM for ML roles', 'Network isolation of GPU pools', 'Non-root and scanned containers', 'Protecting model weights'],
          quiz: [
            ['Why treat model weights as sensitive?', 'They are expensive intellectual property and can encode training data.'],
            ['What is the minimum for a training job\'s cloud role?', 'Read on its input bucket, write on its output prefix, nothing else.'],
          ],
        },
        {
          title: 'Compliance and data residency',
          description: 'Keeping data and models in required regions, audit logs and retention, encryption at rest and in transit, and how SOC 2, HIPAA and GDPR requirements shape where training and inference may run.',
          concepts: ['Regional pinning of data and compute', 'Encryption at rest and in transit', 'Audit logs and retention', 'SOC 2, HIPAA and GDPR touchpoints'],
          quiz: [
            ['What does data residency constrain?', 'The regions where data may be stored and processed, including by model endpoints.'],
            ['Which log proves who accessed a training dataset?', 'Cloud audit logs on the storage bucket.'],
          ],
          prereqs: ['Security hardening for AI infrastructure'],
        },
      ],
    },
    {
      title: 'Deployment Pipelines',
      topics: [
        {
          title: 'CI/CD for model services',
          description: 'A pipeline that builds the serving image, scans and signs it, runs an inference smoke test with a sample request, pushes by digest and updates the deployment manifest in Git for the GitOps sync.',
          concepts: ['Build, scan and sign stage', 'Inference smoke test in CI', 'Push by digest', 'Manifest update for GitOps'],
          quiz: [
            ['What is an inference smoke test?', 'Starting the container and sending one real request to confirm the model loads and answers.'],
            ['How does a pipeline trigger a deployment in GitOps?', 'By committing the new image digest to the manifest repository.'],
          ],
        },
        {
          title: 'Progressive delivery with Argo Rollouts',
          description: 'Canary and blue-green rollouts for model services with analysis templates that query Prometheus for latency and error rates and automatically abort or promote.',
          concepts: ['Rollout resource and strategies', 'Analysis templates with Prometheus', 'Automated abort and promote', 'Blue-green for large models'],
          quiz: [
            ['Why blue-green for a large model?', 'A full second environment lets you warm it before switching traffic at once.'],
            ['What does an analysis template do?', 'Runs metric queries during a rollout and decides pass or fail.'],
          ],
          prereqs: ['CI/CD for model services'],
        },
        {
          title: 'Observability for the AI platform',
          description: 'Prometheus and Grafana with DCGM GPU metrics, logs shipped to a central store, traces across gateway and model services, and alerts on GPU errors, pending pods and cost anomalies.',
          concepts: ['GPU dashboards in Grafana', 'Central log shipping', 'Traces across platform services', 'Alerts on pending pods and GPU errors'],
          quiz: [
            ['Why alert on pods stuck pending?', 'It means GPUs are unavailable or misconfigured requests are blocking work.'],
            ['Which GPU metric indicates hardware trouble?', 'Xid errors and ECC error counts from DCGM.'],
          ],
          prereqs: ['CI/CD for model services'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: GPU-enabled inference stack with Docker Compose',
          description: 'A lean CUDA image for a model server, a Compose stack with GPU reservations, a vector database and a tracking server, weights on a volume, health checks, and a script proving the GPU is used inside the container.',
          concepts: ['Write the multi-stage CUDA Dockerfile', 'Compose with GPU reservations', 'Volumes, health checks and networking', 'Verify GPU use and measure image size'],
          quiz: [
            ['How do you prove the container sees the GPU?', 'Run nvidia-smi inside it or check torch.cuda.is_available().'],
            ['What is the target image size improvement?', 'Removing devel tooling and caches usually halves a naive image.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Terraform a GPU node pool and deploy KServe',
          description: 'Terraform a managed Kubernetes cluster with a tainted GPU node pool and remote state, install the GPU Operator and KServe, deploy an InferenceService from object storage, and demonstrate scale to zero and a canary split.',
          concepts: ['Cluster and GPU pool in Terraform', 'Install GPU Operator and KServe', 'Deploy an InferenceService', 'Scale to zero and canary demo'],
          quiz: [
            ['Why taint the GPU node pool?', 'So only pods that tolerate the taint, i.e. GPU workloads, land there.'],
            ['How do you confirm scale to zero?', 'Watch the pods disappear after idle and return on the next request.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: spot-instance training with checkpoint resume',
          description: 'A training job on a spot node pool that checkpoints to object storage every few minutes, handles the interruption notice, and resumes automatically from the latest checkpoint after a simulated preemption.',
          concepts: ['Spot node pool and job spec', 'Periodic checkpoints to storage', 'Handle interruption and restart', 'Simulate preemption and verify resume'],
          quiz: [
            ['How do you simulate a spot interruption?', 'Drain or delete the node mid-training and watch the job resume elsewhere.'],
            ['What is lost on interruption?', 'Only the work since the last checkpoint.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: secured model endpoint with gateway and monitoring',
          description: 'A private model service behind an API gateway with key authentication and token-based rate limits, secrets from a secret manager, workload identity for storage access, and Grafana dashboards with GPU and request metrics.',
          concepts: ['Private service and gateway routing', 'Auth and token rate limits', 'Secrets and workload identity', 'Dashboards and alerts'],
          quiz: [
            ['How does the pod read weights from the bucket without a key?', 'Through workload identity mapping its service account to a cloud role.'],
            ['What should an alert fire on first?', 'Error rate and latency SLO breaches, then GPU errors and pending pods.'],
          ],
          style: 'project',
        },
        {
          title: 'AI infrastructure interview questions',
          description: 'The questions asked for ML platform and infrastructure roles: driver versus runtime, why GPUs sit idle, MIG versus time-slicing, KServe versus a plain Deployment, spot strategies, and how you would cut a GPU bill in half.',
          concepts: ['GPU and CUDA questions', 'Kubernetes for ML questions', 'Cost optimisation questions', 'Security and compliance questions'],
          quiz: [
            ['Name three ways to cut a GPU bill.', 'Raise utilisation with batching and packing, use spot with checkpointing, and right-size instance types.'],
            ['When is MIG the right choice?', 'For isolating several small inference workloads on one large GPU with guaranteed memory.'],
          ],
          style: 'reading',
        },
        {
          title: 'Infrastructure design walkthroughs',
          description: 'Designing platforms on a whiteboard: a multi-team training cluster with fair sharing, an inference platform for a hundred models, and a compliant deployment in a regulated region, covering components, cost and failure modes.',
          concepts: ['Shared training cluster design', 'Inference platform for many models', 'Regulated-region deployment design', 'Cost and failure-mode narrative'],
          quiz: [
            ['What prevents one team from monopolising a shared training cluster?', 'Queueing with quotas and fair sharing, for example Kueue.'],
            ['How do you serve a hundred small models cheaply?', 'Pack them on shared GPUs with a multi-model server and scale to zero for idle ones.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
