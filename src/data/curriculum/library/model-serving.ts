import { defineTrack } from '../define'

export const modelServing = defineTrack({
  id: 'track-model-serving',
  title: 'Model Serving and Inference',
  description: 'Turning trained models into fast, reliable services: online, batch and streaming patterns, REST and gRPC APIs with FastAPI and BentoML, TorchServe and Triton, LLM inference with vLLM, TGI and llama.cpp, continuous batching, quantisation, KV cache and paged attention, autoscaling, SLOs, caching, A/B and shadow releases, observability and cost.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🚀',
  tags: ['model serving', 'inference', 'vllm', 'triton', 'fastapi', 'quantisation', 'autoscaling', 'llm inference'],
  languages: ['Python'],
  explainMode: 'devops',
  code: { label: 'Python and shell', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-mlops'],
  style: 'practice',
  categories: [
    {
      title: 'Serving Patterns',
      description: 'Where and when inference runs decides everything downstream.',
      topics: [
        {
          title: 'Online, batch and streaming inference',
          description: 'Online endpoints answer one request in milliseconds, batch jobs score millions of rows overnight, streaming scores events as they arrive. Each has its own latency, cost and freshness profile, and most systems mix them.',
          concepts: ['Online request-response serving', 'Batch scoring jobs', 'Streaming inference on event streams', 'Mixing patterns in one system'],
          quiz: [
            ['Which pattern gives the lowest cost per prediction?', 'Batch, because it saturates hardware and runs only when needed.'],
            ['When is streaming inference required?', 'When each event needs a decision within seconds, such as fraud checks on transactions.'],
          ],
        },
        {
          title: 'Anatomy of an inference request',
          description: 'Deserialise, validate, preprocess, run the model, postprocess, serialise. Each stage is a latency contributor and a failure point, and measuring them separately is how bottlenecks are found.',
          concepts: ['Preprocess, predict, postprocess stages', 'Per-stage latency measurement', 'Serialisation overhead', 'Failure modes per stage'],
          quiz: [
            ['Where does latency usually hide in a tabular model service?', 'In preprocessing and serialisation, not in the model call.'],
            ['Why measure stages separately?', 'A single total latency cannot tell you which stage to optimise.'],
          ],
          prereqs: ['Online, batch and streaming inference'],
        },
        {
          title: 'Choosing where inference runs',
          description: 'Server GPU, server CPU, edge device or the client browser, judged by model size, latency, privacy, connectivity and cost, with ONNX Runtime and TensorFlow Lite as the usual bridges to the edge.',
          concepts: ['Server versus edge versus client', 'Privacy and connectivity constraints', 'ONNX Runtime and TensorFlow Lite', 'Model size as the deciding factor'],
          quiz: [
            ['When does on-device inference win?', 'When latency, privacy or offline use matter more than model size.'],
            ['What does ONNX Runtime provide?', 'A fast, portable runtime for ONNX models on CPU, GPU and mobile.'],
          ],
        },
        {
          title: 'Packaging models for serving',
          description: 'Exporting to ONNX or TorchScript, storing weights as safetensors, freezing preprocessing into the artefact, and shipping a manifest with versions and schema so the serving container never guesses.',
          concepts: ['ONNX and TorchScript export', 'Bundling preprocessing with the model', 'Serving manifests and schemas', 'Loading weights outside the image'],
          quiz: [
            ['Why bundle preprocessing with the model artefact?', 'To prevent training-serving skew from a separately maintained transform.'],
            ['Should model weights be baked into the Docker image?', 'Usually not for large models; load them from object storage at startup to keep images small.'],
          ],
        },
      ],
    },
    {
      title: 'Model APIs',
      topics: [
        {
          title: 'REST model APIs with FastAPI',
          description: 'A predict endpoint with Pydantic request and response models, model loading at startup with a lifespan handler, worker processes with uvicorn or gunicorn, and health endpoints for the orchestrator.',
          concepts: ['Predict endpoint and Pydantic schemas', 'Loading the model in lifespan', 'Workers and process model', 'Health and readiness endpoints'],
          quiz: [
            ['Why load the model in a lifespan handler rather than per request?', 'Loading is slow; do it once per worker at startup.'],
            ['How many workers for a GPU model?', 'Usually one per GPU; multiple workers would duplicate the model in GPU memory.'],
          ],
        },
        {
          title: 'gRPC model APIs',
          description: 'Protobuf-defined request and response messages, binary encoding that beats JSON for tensors, streaming RPCs, and the KServe V2 inference protocol that Triton and others implement.',
          concepts: ['Protobuf service definitions', 'Binary tensor encoding', 'Streaming RPCs', 'KServe V2 inference protocol'],
          quiz: [
            ['When is gRPC clearly better than REST for inference?', 'For large numeric payloads and service-to-service calls where binary encoding saves time.'],
            ['What is the V2 inference protocol?', 'A standard REST and gRPC API for model servers, with infer, metadata and health endpoints.'],
          ],
          prereqs: ['REST model APIs with FastAPI'],
        },
        {
          title: 'Input validation and API versioning',
          description: 'Rejecting malformed input before it hits the model, versioning the request schema alongside the model version, and keeping old versions callable long enough for clients to migrate.',
          concepts: ['Schema validation before inference', 'Versioned endpoints and schemas', 'Model version in responses', 'Deprecating old versions'],
          quiz: [
            ['Why return the model version in every response?', 'So a prediction can be traced to the exact model that produced it.'],
            ['What happens without input validation?', 'Bad inputs crash the worker or produce silent garbage predictions.'],
          ],
          prereqs: ['REST model APIs with FastAPI'],
        },
        {
          title: 'Streaming token responses',
          description: 'Sending tokens as they are generated with server-sent events or WebSockets, handling client disconnects to stop generation, and keeping the OpenAI-style chunk format that clients already understand.',
          concepts: ['Server-sent events for tokens', 'WebSockets versus SSE', 'Cancelling on disconnect', 'OpenAI-compatible chunk format'],
          quiz: [
            ['Why stream tokens?', 'Time to first token drops from seconds to milliseconds, which users perceive as speed.'],
            ['What should happen when the client disconnects mid-stream?', 'Generation is cancelled to free the GPU.'],
          ],
          prereqs: ['REST model APIs with FastAPI'],
        },
      ],
    },
    {
      title: 'Serving Frameworks',
      topics: [
        {
          title: 'BentoML services',
          description: 'Defining a service with @bentoml.service, declaring runners and resources, building a bento that bundles model, code and dependencies, and containerising it with one command.',
          concepts: ['Service and API definitions', 'Model store and bentos', 'Adaptive batching in BentoML', 'bentoml containerize'],
          quiz: [
            ['What is a bento?', 'A self-contained bundle of model, code, configuration and dependencies ready to deploy.'],
            ['What does adaptive batching do?', 'Groups concurrent requests into one model call with a latency ceiling.'],
          ],
        },
        {
          title: 'TorchServe',
          description: 'Packaging a PyTorch model into a .mar archive with a custom handler for preprocessing and postprocessing, management and inference APIs, and multi-model serving with per-model workers.',
          concepts: ['Model archives and handlers', 'Inference and management APIs', 'Multi-model workers', 'Batching configuration'],
          quiz: [
            ['What does a TorchServe handler contain?', 'initialize, preprocess, inference and postprocess for one model.'],
            ['How do you register a model at runtime?', 'POST to the management API with the .mar path.'],
          ],
        },
        {
          title: 'NVIDIA Triton Inference Server',
          description: 'A high-performance server that runs TensorRT, ONNX, PyTorch and Python backends side by side, with a model repository layout, dynamic batching, concurrent model instances and ensemble pipelines.',
          concepts: ['Model repository and config.pbtxt', 'Multiple backends in one server', 'Instance groups and concurrency', 'Ensemble models'],
          quiz: [
            ['What is a Triton ensemble?', 'A DAG of models executed inside the server so preprocessing and the model run without leaving the GPU host.'],
            ['Why run multiple instances of one model?', 'To overlap execution and increase GPU utilisation under load.'],
          ],
        },
        {
          title: 'Ray Serve and model composition',
          description: 'Deployments as Python classes scaled across a Ray cluster, composing several models into one application graph, fractional GPU allocation, and autoscaling by queue length.',
          concepts: ['Deployments and replicas', 'Composing deployments into graphs', 'Fractional GPU allocation', 'Queue-based autoscaling'],
          quiz: [
            ['What does Ray Serve add over a plain FastAPI service?', 'Cluster-wide scaling, composition of multiple models and resource-aware placement.'],
            ['Can two small models share one GPU in Ray Serve?', 'Yes, with fractional num_gpus per deployment.'],
          ],
        },
      ],
    },
    {
      title: 'LLM Inference Servers',
      topics: [
        {
          title: 'vLLM',
          description: 'The de facto open LLM server: PagedAttention, continuous batching, tensor parallelism and an OpenAI-compatible API, with the flags that matter for memory and throughput such as max-model-len and gpu-memory-utilization.',
          concepts: ['Launching the OpenAI-compatible server', 'Engine arguments that matter', 'Tensor parallel across GPUs', 'Serving LoRA adapters'],
          quiz: [
            ['What does gpu-memory-utilization control?', 'The fraction of GPU memory vLLM reserves for weights plus KV cache.'],
            ['Why lower max-model-len?', 'It frees KV cache memory for more concurrent sequences.'],
          ],
        },
        {
          title: 'Text Generation Inference',
          description: 'Hugging Face\'s TGI server: Rust router with Python shards, flash attention and quantisation options, the generate and generate_stream endpoints, and its Messages API compatibility.',
          concepts: ['Router and shard architecture', 'Launcher options and quantisation', 'generate and generate_stream', 'Choosing TGI versus vLLM'],
          quiz: [
            ['What is the TGI router responsible for?', 'Receiving requests, batching them and dispatching to model shards.'],
            ['How do you serve a gated Hugging Face model with TGI?', 'Pass a token with read access via the HF token environment variable.'],
          ],
          prereqs: ['vLLM'],
        },
        {
          title: 'llama.cpp and GGUF',
          description: 'CPU and Apple-silicon inference with quantised GGUF weights, the llama-server binary with an OpenAI-compatible endpoint, and when a 4-bit 7B model on a laptop beats a GPU service.',
          concepts: ['GGUF quantisation levels', 'llama-server and its API', 'CPU threads and memory mapping', 'Partial GPU offload'],
          quiz: [
            ['What does Q4_K_M mean?', 'A 4-bit k-quant GGUF format balancing size and quality.'],
            ['When is llama.cpp the right choice?', 'For local, edge or low-cost deployments where a GPU is unavailable or unnecessary.'],
          ],
        },
        {
          title: 'OpenAI-compatible gateways and routing',
          description: 'Putting one API in front of many models and providers with LiteLLM or a custom router: model aliases, fallbacks, per-key rate limits, cost tracking and switching backends without changing clients.',
          concepts: ['One API for many backends', 'Model aliases and fallbacks', 'Per-key limits and cost tracking', 'LiteLLM proxy'],
          quiz: [
            ['Why standardise on the OpenAI API shape?', 'Every client library and tool already speaks it, so backends become swappable.'],
            ['What does a fallback route do?', 'Retries the request on another model or provider when the primary fails or times out.'],
          ],
          prereqs: ['vLLM'],
        },
        {
          title: 'Speculative decoding and decoding accelerations',
          description: 'A small draft model proposes tokens that the large model verifies in one pass, cutting latency without changing outputs; plus prefix caching and guided decoding as further server-side speedups.',
          concepts: ['Draft model and verification', 'Acceptance rate and speedup', 'Guided decoding costs', 'When speculation does not help'],
          quiz: [
            ['Does speculative decoding change the output distribution?', 'No, verification keeps it identical to the target model.'],
            ['When does speculation stop paying off?', 'Under heavy batching, where the GPU is already saturated by verification work.'],
          ],
          prereqs: ['vLLM'],
        },
      ],
    },
    {
      title: 'Batching, Memory and Quantisation',
      topics: [
        {
          title: 'Dynamic batching',
          description: 'Collecting concurrent requests into one forward pass with a maximum batch size and a wait window, trading a few milliseconds of queueing for much higher throughput on GPUs that are idle at batch size one.',
          concepts: ['Batch size and wait window', 'Throughput versus added latency', 'Padding and variable shapes', 'Batching in Triton and BentoML'],
          quiz: [
            ['Why is batch size one wasteful on a GPU?', 'The GPU is memory-bandwidth bound; extra rows cost almost nothing until compute saturates.'],
            ['What does the wait window control?', 'How long the server waits to fill a batch before running it.'],
          ],
        },
        {
          title: 'Continuous batching for LLMs',
          description: 'Instead of waiting for a whole batch to finish, finished sequences leave and new ones join at every decode step, keeping the GPU full despite wildly different output lengths.',
          concepts: ['Iteration-level scheduling', 'Prefill versus decode phases', 'Preemption and swapping', 'Chunked prefill'],
          quiz: [
            ['What problem does continuous batching solve?', 'Static batches idle the GPU while waiting for the longest sequence to finish.'],
            ['What is chunked prefill?', 'Splitting long prompt prefill into chunks so decode steps of other requests are not stalled.'],
          ],
          prereqs: ['Dynamic batching'],
        },
        {
          title: 'KV cache and paged attention',
          description: 'Generation caches keys and values for every token; the cache dominates memory at long contexts. PagedAttention allocates it in blocks like virtual memory, eliminating fragmentation and enabling prefix sharing.',
          concepts: ['KV cache size arithmetic', 'Fragmentation in contiguous caches', 'Block tables and paging', 'Prefix sharing across requests'],
          quiz: [
            ['How does KV cache size scale?', 'Linearly with sequence length, layers, heads and head dimension, per sequence.'],
            ['What does paging enable besides less waste?', 'Sharing cached prefix blocks between requests with the same prompt start.'],
          ],
          prereqs: ['Continuous batching for LLMs'],
        },
        {
          title: 'Quantisation for inference',
          description: 'int8 and 4-bit weights with GPTQ, AWQ, bitsandbytes and FP8, what each does to memory, speed and accuracy, and how to verify quality on your own eval set rather than trusting a benchmark table.',
          concepts: ['Weight-only versus activation quantisation', 'GPTQ and AWQ', 'bitsandbytes and FP8', 'Validating quality after quantisation'],
          quiz: [
            ['How much memory does 4-bit quantisation save versus fp16?', 'About four times less for the weights.'],
            ['Does quantisation always speed up inference?', 'Not always; some kernels dequantise on the fly and can be slower on compute-bound workloads.'],
          ],
        },
        {
          title: 'Distillation and pruning overview',
          description: 'Shrinking the model rather than its numbers: training a small student on a large teacher\'s outputs, structured pruning of heads and layers, and when a smaller fine-tuned model beats a quantised large one.',
          concepts: ['Knowledge distillation', 'Structured pruning', 'Small fine-tuned model trade-off', 'Compression evaluation'],
          quiz: [
            ['What is knowledge distillation?', 'Training a smaller model to match a larger model\'s outputs or logits.'],
            ['When is a small fine-tuned model preferable?', 'For narrow, high-volume tasks where it matches quality at a fraction of the cost.'],
          ],
          prereqs: ['Quantisation for inference'],
        },
      ],
    },
    {
      title: 'Hardware and Scaling',
      topics: [
        {
          title: 'GPU versus CPU serving',
          description: 'Deciding by model size, batch size and latency budget: small tabular and many ONNX models are cheaper on CPU, transformers beyond a few hundred million parameters need GPUs, and the break-even shifts with traffic.',
          concepts: ['Break-even by model size and traffic', 'CPU inference optimisations', 'GPU utilisation targets', 'Mixed fleets'],
          quiz: [
            ['When is CPU serving the right call?', 'Small models, low traffic or strict cost limits where GPU utilisation would stay low.'],
            ['What GPU utilisation should a serving fleet aim for?', 'High and steady, often above 60 to 70 percent, via batching.'],
          ],
        },
        {
          title: 'GPU memory planning',
          description: 'Adding up weights, KV cache, activations and framework overhead to pick a GPU and set concurrency limits, and why an out-of-memory error under load is a planning failure, not a bug.',
          concepts: ['Weights memory by precision', 'KV cache budget per request', 'Activation and overhead headroom', 'Concurrency limits from memory'],
          quiz: [
            ['How much memory do 7B fp16 weights need?', 'About 14 GB, before KV cache and overhead.'],
            ['What sets the max concurrent sequences on a GPU?', 'The memory left for KV cache divided by the cache per sequence.'],
          ],
          prereqs: ['GPU versus CPU serving'],
        },
        {
          title: 'Tensor and pipeline parallel serving',
          description: 'Splitting one model across GPUs when it does not fit: tensor parallelism shards each layer and needs fast interconnects, pipeline parallelism assigns layers to GPUs, and both add communication cost.',
          concepts: ['Tensor parallel sharding', 'Pipeline parallel stages', 'Interconnect requirements', 'Replicas versus parallelism'],
          quiz: [
            ['When should you replicate rather than shard?', 'When the model fits one GPU; replicas scale throughput without communication overhead.'],
            ['Why does tensor parallelism need NVLink?', 'Each layer exchanges activations between GPUs, so slow links dominate latency.'],
          ],
          prereqs: ['GPU memory planning'],
        },
        {
          title: 'Autoscaling inference services',
          description: 'Scaling on the right signal: requests per second for CPU services, queue depth or tokens in flight for LLMs, GPU utilisation as a lagging signal, and minimum replicas set by cold-start time.',
          concepts: ['Choosing the scaling signal', 'Queue depth and in-flight tokens', 'Kubernetes HPA and KEDA', 'Minimum replicas and cold starts'],
          quiz: [
            ['Why is GPU utilisation a poor primary autoscaling signal?', 'It lags and saturates; by the time it is high, latency has already degraded.'],
            ['What does KEDA add over HPA?', 'Scaling on external metrics such as queue length, including scale to zero.'],
          ],
        },
        {
          title: 'Cold starts and model loading',
          description: 'Loading tens of gigabytes of weights is the cold-start cost; reduce it with pre-warmed replicas, weights on fast local disk or in-cluster caches, memory-mapped safetensors and lazy loading.',
          concepts: ['Where cold-start time goes', 'Pre-warmed replicas', 'Local and in-cluster weight caches', 'Memory-mapped loading'],
          quiz: [
            ['Why is pulling weights from object storage at startup slow?', 'Bandwidth: tens of gigabytes can take minutes.'],
            ['What does memory-mapping safetensors help with?', 'Loading only the tensors needed, without copying the whole file into RAM first.'],
          ],
          prereqs: ['Autoscaling inference services'],
        },
      ],
    },
    {
      title: 'Performance and SLOs',
      topics: [
        {
          title: 'Latency and throughput metrics',
          description: 'Time to first token, time per output token, end-to-end latency percentiles, requests and tokens per second, and why p50 hides the problems that p99 reveals.',
          concepts: ['Time to first token', 'Time per output token', 'Percentiles and tail latency', 'Tokens per second per GPU'],
          quiz: [
            ['Why report p99 rather than average latency?', 'A small fraction of very slow requests ruins user experience and averages hide it.'],
            ['What does time per output token measure?', 'The decode speed once generation has started.'],
          ],
        },
        {
          title: 'Defining and meeting SLOs',
          description: 'Writing an SLO such as p95 time to first token under 500 ms at 100 requests per second, sizing capacity to meet it, and using error budgets to decide when to optimise versus ship features.',
          concepts: ['SLO statements with load conditions', 'Capacity from SLO and throughput', 'Error budgets', 'Latency budgets per stage'],
          quiz: [
            ['Why include a load level in an SLO?', 'Latency depends on load; a target without a load level is unmeasurable.'],
            ['What does an exhausted error budget imply?', 'Stop risky changes and invest in reliability until the budget recovers.'],
          ],
          prereqs: ['Latency and throughput metrics'],
        },
        {
          title: 'Load testing inference endpoints',
          description: 'Realistic load tests with Locust, k6 or genai-perf using real prompt length distributions, ramping concurrency until latency breaks, and finding the knee of the throughput-latency curve.',
          concepts: ['Locust and k6 scenarios', 'genai-perf for LLM endpoints', 'Realistic prompt and output lengths', 'Finding the saturation point'],
          quiz: [
            ['Why use real prompt length distributions?', 'Throughput and memory depend heavily on prompt and output lengths.'],
            ['What is the knee of the curve?', 'The concurrency beyond which latency rises sharply while throughput stops improving.'],
          ],
          prereqs: ['Defining and meeting SLOs'],
        },
        {
          title: 'Response and semantic caching',
          description: 'Exact-match caches for repeated requests, semantic caches that return a stored answer for a similar query above a similarity threshold, cache invalidation on model or prompt change, and the risk of wrong hits.',
          concepts: ['Exact-match response caching', 'Semantic cache with embeddings', 'Invalidation on version change', 'False hit risks'],
          quiz: [
            ['What is the main danger of a semantic cache?', 'Returning an answer to a question that is similar but not the same.'],
            ['What must invalidate a response cache?', 'Any change to the model, prompt template or retrieval index.'],
          ],
        },
        {
          title: 'Prompt and prefix caching',
          description: 'Reusing the KV cache for a shared system prompt or document prefix across requests, both in open servers and via provider prompt caching, cutting prefill cost and time to first token.',
          concepts: ['Prefix cache hits in vLLM', 'Provider prompt caching', 'Ordering prompts for cache reuse', 'Measuring cache hit rate'],
          quiz: [
            ['How should a prompt be structured to maximise prefix caching?', 'Static content first, variable content last.'],
            ['What does a prefix cache hit save?', 'The prefill compute for the shared prefix tokens.'],
          ],
          prereqs: ['Response and semantic caching'],
        },
        {
          title: 'Timeouts, backpressure and admission control',
          description: 'Bounded queues, rejecting or shedding load when full, per-client concurrency limits, and timeouts at every hop, so an overloaded model service degrades predictably instead of collapsing.',
          concepts: ['Bounded queues and load shedding', 'Per-client concurrency limits', 'Timeouts at every hop', 'Graceful degradation strategies'],
          quiz: [
            ['Why reject requests early under overload?', 'Serving them late wastes capacity on requests the client has already abandoned.'],
            ['What is a sensible degradation for an LLM service?', 'Falling back to a smaller model or shorter max tokens under load.'],
          ],
          prereqs: ['Defining and meeting SLOs'],
        },
      ],
    },
    {
      title: 'Release and Observability',
      topics: [
        {
          title: 'A/B testing models in production',
          description: 'Assigning users deterministically to model variants, measuring business and quality metrics per variant, running long enough for significance, and keeping assignment logs for analysis.',
          concepts: ['Deterministic user assignment', 'Metrics per variant', 'Sample size and duration', 'Assignment logging'],
          quiz: [
            ['Why assign by user rather than by request?', 'Consistent experience and correct attribution of outcomes to a variant.'],
            ['What goes wrong with stopping an A/B test early?', 'Peeking inflates false positives; decide the duration up front.'],
          ],
        },
        {
          title: 'Shadow and canary releases for models',
          description: 'Shadowing a candidate on mirrored traffic to compare outputs and latency without user impact, then a canary at a small percentage with automatic rollback on SLO or quality breach.',
          concepts: ['Traffic mirroring', 'Output diffing between versions', 'Canary thresholds and rollback', 'Promotion after canary'],
          quiz: [
            ['What does a shadow test catch that offline eval misses?', 'Latency under real load and behaviour on live inputs.'],
            ['What triggers an automatic canary rollback?', 'Breaching the error, latency or quality thresholds set before the release.'],
          ],
          prereqs: ['A/B testing models in production'],
        },
        {
          title: 'Metrics for inference services',
          description: 'Request rate, error rate, latency histograms, queue depth, batch sizes, GPU memory and utilisation, tokens per second, and cache hit rate, exported to Prometheus and graphed in Grafana.',
          concepts: ['RED metrics for the endpoint', 'Batch and queue metrics', 'GPU metrics via DCGM', 'Token and cache metrics'],
          quiz: [
            ['What are RED metrics?', 'Rate, Errors and Duration for a service.'],
            ['Which metric warns of a coming OOM?', 'GPU memory usage trending toward the limit as concurrency rises.'],
          ],
        },
        {
          title: 'Logging and tracing inference',
          description: 'Structured request logs with model version, latency per stage and token counts, sampled payload logging with PII care, and distributed traces that connect the gateway, retrieval and model calls.',
          concepts: ['Structured request logs', 'Sampling payloads safely', 'OpenTelemetry traces across services', 'Correlating logs with traces'],
          quiz: [
            ['Why sample rather than log every payload?', 'Volume, cost and privacy; a sample is enough for debugging and drift.'],
            ['What links a slow response to its cause?', 'A trace with spans for each stage and downstream call.'],
          ],
          prereqs: ['Metrics for inference services'],
        },
        {
          title: 'Health checks and graceful shutdown',
          description: 'Liveness versus readiness, a readiness check that only passes after the model is loaded and warmed, draining in-flight requests on shutdown, and rolling updates that never route to a cold replica.',
          concepts: ['Liveness versus readiness', 'Warm-up before ready', 'Draining in-flight requests', 'Rolling updates without cold routing'],
          quiz: [
            ['Why must readiness wait for model load?', 'Otherwise traffic hits a replica that cannot serve and errors spike.'],
            ['What does graceful drain do?', 'Stops accepting new requests, finishes current ones, then exits.'],
          ],
        },
      ],
    },
    {
      title: 'Cost Optimisation',
      topics: [
        {
          title: 'Unit economics of inference',
          description: 'Cost per prediction and per thousand tokens from GPU hourly price, utilisation and throughput, and how batching, quantisation and caching each move the number.',
          concepts: ['Cost per prediction formula', 'Utilisation as the lever', 'Effect of batching and quantisation', 'Cache hit rate savings'],
          quiz: [
            ['How do you compute cost per thousand tokens?', 'GPU cost per hour divided by tokens generated per hour, times a thousand.'],
            ['What doubles throughput for free most often?', 'Raising batch size on an under-utilised GPU.'],
          ],
        },
        {
          title: 'Model and hardware right-sizing',
          description: 'Routing simple requests to a small model, choosing the cheapest GPU that meets the SLO, using spot capacity for batch and stateless replicas, and measuring rather than assuming.',
          concepts: ['Routing by task difficulty', 'Cheapest GPU meeting the SLO', 'Spot capacity for stateless replicas', 'Benchmark-driven choices'],
          quiz: [
            ['What is model routing?', 'Sending each request to the smallest model likely to answer it well.'],
            ['Why is spot capacity acceptable for serving?', 'Stateless replicas can be replaced; keep an on-demand baseline for SLOs.'],
          ],
          prereqs: ['Unit economics of inference'],
        },
        {
          title: 'Multi-tenancy and adapter serving',
          description: 'Serving many fine-tuned variants from one base model by hot-swapping LoRA adapters per request, packing several small models on one GPU, and isolating tenants with quotas.',
          concepts: ['Multi-LoRA serving', 'Packing models on one GPU', 'Per-tenant quotas', 'Noisy neighbour mitigation'],
          quiz: [
            ['How does multi-LoRA serving save money?', 'One copy of the base weights serves many adapters instead of one GPU per fine-tune.'],
            ['What is a noisy neighbour?', 'A tenant whose load degrades latency for others sharing the hardware.'],
          ],
          prereqs: ['Model and hardware right-sizing'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: batched classifier service',
          description: 'A FastAPI or BentoML service for an ONNX text classifier with adaptive batching, Pydantic validation, readiness after warm-up, Prometheus metrics, and a Locust load test showing the throughput gain from batching.',
          concepts: ['Export and load the ONNX model', 'Implement adaptive batching', 'Readiness, metrics and logging', 'Load test with and without batching'],
          quiz: [
            ['What should the load test report?', 'Throughput and p95 latency at several concurrency levels, batched versus unbatched.'],
            ['Why validate input before batching?', 'One bad request must not fail the whole batch.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: streaming chat endpoint on vLLM',
          description: 'A vLLM server behind a small gateway with SSE streaming, prefix-cache-friendly prompt layout, semantic response caching, per-key rate limits and a dashboard of time to first token and tokens per second.',
          concepts: ['Launch and tune vLLM', 'Gateway with SSE and rate limits', 'Add semantic caching', 'Dashboard TTFT and throughput'],
          quiz: [
            ['How do you show prefix caching works?', 'Compare time to first token for requests sharing a system prompt versus unique prompts.'],
            ['What happens on client disconnect?', 'The gateway cancels the vLLM request.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: quantise and benchmark a 7B model',
          description: 'Convert a 7B model to GGUF at several quantisation levels, serve with llama-server on CPU, and compare memory, tokens per second and quality on a small eval set against the fp16 GPU baseline.',
          concepts: ['Convert to GGUF at multiple levels', 'Serve with llama-server', 'Benchmark speed and memory', 'Evaluate quality per level'],
          quiz: [
            ['Which quantisation level would you pick and why?', 'The smallest whose eval quality stays within an agreed margin of fp16.'],
            ['What limits CPU tokens per second?', 'Memory bandwidth more than compute.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: canary release with automatic rollback',
          description: 'Two model versions behind a Kubernetes service with weighted routing, shadow comparison logs, Prometheus alerts on latency and error thresholds, and a script that rolls back when a canary breaches them.',
          concepts: ['Deploy two versions with weights', 'Shadow logging and output diff', 'Alert rules for the canary', 'Automated rollback script'],
          quiz: [
            ['How do you test the rollback path?', 'Deploy a deliberately slow version as the canary and confirm it rolls back.'],
            ['Why keep the old version running after promotion?', 'Instant rollback if the promoted version misbehaves later.'],
          ],
          style: 'project',
        },
        {
          title: 'Model serving interview questions',
          description: 'The questions that come up: why batching helps GPUs, what continuous batching and PagedAttention fix, quantisation trade-offs, choosing a scaling signal, TTFT versus TPOT, and canary versus shadow.',
          concepts: ['Batching and GPU utilisation questions', 'LLM inference internals questions', 'Scaling and SLO questions', 'Release strategy questions'],
          quiz: [
            ['Explain PagedAttention in one sentence.', 'It stores the KV cache in fixed blocks mapped by a table, like virtual memory, removing fragmentation.'],
            ['What is the best autoscaling signal for an LLM server?', 'Queue depth or in-flight requests, not GPU utilisation.'],
          ],
          style: 'reading',
        },
        {
          title: 'Inference system design walkthroughs',
          description: 'Designing serving systems on a whiteboard: a chat assistant for a million users, a real-time recommendation scorer, and a document-processing batch pipeline, sizing GPUs, choosing patterns and stating SLOs and cost.',
          concepts: ['Chat assistant at scale', 'Real-time recommendation scoring', 'Batch document pipeline', 'Sizing, SLO and cost narrative'],
          quiz: [
            ['How do you size GPUs for a chat service?', 'From target concurrency, tokens per second per GPU at the SLO, and KV cache memory per sequence.'],
            ['What pattern fits nightly document processing?', 'Batch inference on spot capacity with checkpointed progress.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
