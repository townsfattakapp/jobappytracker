import { defineTrack } from '../define'

export const llms = defineTrack({
  id: 'track-llms',
  title: 'Large Language Models',
  description: 'How large language models are built, trained, aligned and run: tokenization, the transformer, context windows, scaling laws, instruction tuning and RLHF, structured outputs and tool calling, model selection, context engineering, evaluation, and fast, cheap inference locally or in production.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🧠',
  tags: ['llm', 'transformers', 'attention', 'rlhf', 'tool-calling', 'quantisation', 'vllm', 'llama-cpp', 'inference'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-deep-learning'],
  style: 'practice',
  categories: [
    {
      title: 'Tokenization',
      description: 'The units a model actually reads and pays for.',
      topics: [
        {
          title: 'Why tokens rather than characters or words',
          description: 'Characters make sequences too long, words make vocabularies unbounded; subword tokens balance both, and every limit, price and quirk of an LLM is expressed in tokens rather than text.',
          concepts: ['Sequence length versus vocabulary size', 'Subword units', 'Tokens as the unit of cost and limits', 'Tokens per word rules of thumb'],
          quiz: [
            ['Roughly how many tokens is 100 English words?', 'About 130 to 140.'],
            ['Why not a character-level model?', 'Sequences become several times longer, making attention far more expensive.'],
          ],
        },
        {
          title: 'BPE tokenizers in practice',
          description: 'Byte-level BPE as used by GPT-style models and SentencePiece as used by Llama, inspecting splits with tiktoken and the tokenizers library, and why the same text tokenises differently across model families.',
          concepts: ['Byte-level BPE merges', 'SentencePiece for Llama-family models', 'Inspecting tokens with tiktoken', 'Vocabulary differences across models'],
          quiz: [
            ['Why does a byte-level tokenizer never produce unknown tokens?', 'Any byte sequence can fall back to 256 base byte tokens.'],
            ['Which library exposes OpenAI tokenizers?', 'tiktoken.'],
          ],
          prereqs: ['Why tokens rather than characters or words'],
        },
        {
          title: 'Token counting, cost and tokenizer quirks',
          description: 'Counting tokens before a request to stay under limits and budget cost, and the quirks that surprise people: numbers split oddly, non-English text costs more, whitespace and casing change token counts, code tokenises well or badly depending on the model.',
          concepts: ['Counting tokens before sending', 'Cost per input and output token', 'Numbers and arithmetic in tokens', 'Multilingual token inflation', 'Whitespace and formatting effects'],
          quiz: [
            ['Why is non-English text often more expensive?', 'Tokenizers trained mostly on English split other scripts into more pieces.'],
            ['Why do LLMs struggle to count letters in a word?', 'They see subword tokens, not individual characters.'],
          ],
          prereqs: ['BPE tokenizers in practice'],
        },
        {
          title: 'Special tokens and chat templates',
          description: 'Beginning and end of sequence markers, role delimiters and the chat template that turns a list of messages into one token sequence; why using the wrong template silently degrades an open model.',
          concepts: ['BOS, EOS and padding tokens', 'Role and turn delimiters', 'apply_chat_template', 'Template mismatch failures'],
          quiz: [
            ['What does apply_chat_template do?', 'Formats a message list into the exact token string the model was trained on.'],
            ['What happens if the EOS token is never generated?', 'The model rambles until max tokens is reached.'],
          ],
          prereqs: ['BPE tokenizers in practice'],
        },
      ],
    },
    {
      title: 'Transformer Architecture',
      description: 'What is inside the model, layer by layer.',
      topics: [
        {
          title: 'Embeddings and the residual stream',
          description: 'Token ids become vectors through an embedding matrix, every layer adds to a shared residual stream, and the final unembedding projects back to vocabulary logits; tied embeddings and why the stream is the model\'s working memory.',
          concepts: ['Token embedding matrix', 'Residual stream view', 'Unembedding and logits', 'Tied input-output embeddings'],
          quiz: [
            ['What does the final linear layer output?', 'One logit per vocabulary token for the next position.'],
            ['What is the residual stream?', 'The vector at each position that every layer reads from and adds to.'],
          ],
          prereqs: ['Why tokens rather than characters or words'],
        },
        {
          title: 'Scaled dot-product and multi-head attention',
          description: 'Queries score keys, softmax turns scores into weights, weights mix values; scaling by the square root of the head dimension, the causal mask, and multiple heads that attend to different relations in parallel.',
          concepts: ['Query, key, value projections', 'Scaling by sqrt(d_k)', 'Causal masking in decoders', 'Multiple heads and concatenation', 'Attention as weighted lookup'],
          quiz: [
            ['Why divide by sqrt(d_k)?', 'To keep dot products from growing with dimension and saturating the softmax.'],
            ['What does the causal mask set to minus infinity?', 'Scores for positions after the current token.'],
          ],
          prereqs: ['Embeddings and the residual stream'],
        },
        {
          title: 'Positional encodings',
          description: 'Attention has no notion of order, so position must be injected: sinusoidal and learned absolute encodings, rotary embeddings (RoPE) that encode relative position in the query-key rotation, and ALiBi biases.',
          concepts: ['Sinusoidal encodings', 'Learned absolute positions', 'Rotary position embeddings', 'ALiBi attention biases'],
          quiz: [
            ['What does RoPE rotate?', 'Query and key vectors by an angle proportional to position.'],
            ['Why do relative schemes generalise better to longer inputs?', 'They encode distances between tokens rather than absolute indices.'],
          ],
          prereqs: ['Scaled dot-product and multi-head attention'],
        },
        {
          title: 'Feed-forward blocks, normalisation and residuals',
          description: 'The MLP that follows attention (with SwiGLU in modern models), pre-norm with RMSNorm, residual connections that keep deep stacks trainable, and where most of the parameters and knowledge actually live.',
          concepts: ['MLP block and SwiGLU', 'Pre-norm versus post-norm', 'RMSNorm', 'Residual connections', 'Parameter budget by component'],
          quiz: [
            ['Where do most parameters in a transformer block sit?', 'The feed-forward MLP, usually two thirds of the block.'],
            ['Why pre-norm in modern LLMs?', 'It stabilises training of very deep stacks without warmup tricks.'],
          ],
          prereqs: ['Scaled dot-product and multi-head attention'],
        },
        {
          title: 'Decoder-only versus encoder-decoder',
          description: 'Why almost every modern LLM is a decoder-only stack trained on next-token prediction, what encoder-decoder models still do better, and how a decoder handles both the prompt and the generation.',
          concepts: ['Decoder-only design', 'Encoder-decoder design', 'Prefill versus decode phases', 'Why decoder-only won'],
          quiz: [
            ['What is the prefill phase?', 'Processing the whole prompt in one parallel pass to fill the cache.'],
            ['Name an encoder-decoder LLM.', 'T5 or Flan-T5.'],
          ],
          prereqs: ['Feed-forward blocks, normalisation and residuals'],
        },
        {
          title: 'The KV cache and autoregressive inference',
          description: 'Storing keys and values of previous tokens so each new token costs one step instead of recomputing the prefix, the memory it consumes per token and layer, and why long contexts are memory-bound at inference.',
          concepts: ['Caching keys and values', 'Per-token generation cost', 'KV cache memory formula', 'Memory-bound decoding'],
          quiz: [
            ['What does the KV cache avoid?', 'Recomputing attention keys and values for the entire prefix at every step.'],
            ['What grows KV cache memory?', 'Sequence length times layers times heads times head dimension times two.'],
          ],
          prereqs: ['Decoder-only versus encoder-decoder'],
        },
        {
          title: 'Attention variants: MQA, GQA and FlashAttention',
          description: 'Sharing keys and values across heads (multi-query, grouped-query) shrinks the KV cache, FlashAttention computes exact attention with fewer memory reads, and sliding-window attention bounds cost on long inputs.',
          concepts: ['Multi-query attention', 'Grouped-query attention', 'FlashAttention IO-aware kernels', 'Sliding-window attention'],
          quiz: [
            ['What does GQA reduce?', 'KV cache size and memory bandwidth by sharing KV heads across groups of query heads.'],
            ['Is FlashAttention an approximation?', 'No, it computes exact attention with better memory access patterns.'],
          ],
          prereqs: ['The KV cache and autoregressive inference'],
        },
      ],
    },
    {
      title: 'Context Windows',
      description: 'What the model can see at once, and what that costs.',
      topics: [
        {
          title: 'Context length and what fills it',
          description: 'The window covers system prompt, history, retrieved documents, tool results and the answer together; quadratic attention cost and linear KV memory in context, and budgeting the window like any scarce resource.',
          concepts: ['Everything shares the window', 'Quadratic compute in context', 'Token budgets per component', 'Reserving room for the answer'],
          quiz: [
            ['If the window is 128k and the prompt is 127k, what is wrong?', 'There is almost no room left for the model to answer.'],
            ['How does attention compute scale with context length?', 'Quadratically.'],
          ],
          prereqs: ['The KV cache and autoregressive inference'],
        },
        {
          title: 'Long-context behaviour and its limits',
          description: 'Models attend unevenly across long inputs (the lost-in-the-middle effect), needle-in-a-haystack tests versus real reasoning over long text, and why more context is not the same as better answers.',
          concepts: ['Lost-in-the-middle effect', 'Needle-in-a-haystack tests', 'Effective versus advertised context', 'Placing key information'],
          quiz: [
            ['Where in a long prompt is information most reliably used?', 'Near the beginning and the end.'],
            ['What does a needle test not measure?', 'Reasoning that combines many facts spread across the context.'],
          ],
          prereqs: ['Context length and what fills it'],
        },
        {
          title: 'Extending context length',
          description: 'How models trained on short windows are stretched: RoPE scaling and YaRN, continued pretraining on long documents, and the evaluation needed to check the extended range actually works.',
          concepts: ['RoPE scaling and YaRN', 'Continued pretraining on long data', 'Position interpolation', 'Validating extended ranges'],
          quiz: [
            ['What does position interpolation do?', 'Squeezes longer positions into the range seen during training.'],
            ['Why validate after extension?', 'Perplexity may stay fine while retrieval accuracy at long range collapses.'],
          ],
          prereqs: ['Positional encodings', 'Long-context behaviour and its limits'],
        },
      ],
    },
    {
      title: 'Pretraining and Scaling',
      description: 'Where the base model comes from.',
      topics: [
        {
          title: 'Pretraining objective and data pipeline',
          description: 'Next-token prediction over trillions of tokens of web text, code and books, the crawling, filtering, deduplication and mixing steps, and how document packing and sequence lengths shape what the model learns.',
          concepts: ['Next-token prediction at scale', 'Data sources and mixing ratios', 'Deduplication and quality filtering', 'Document packing'],
          quiz: [
            ['Why deduplicate pretraining data?', 'Repeated documents cause memorisation and waste compute.'],
            ['What is document packing?', 'Concatenating documents to fill fixed-length training sequences.'],
          ],
          prereqs: ['Decoder-only versus encoder-decoder'],
        },
        {
          title: 'Scaling laws and compute-optimal training',
          description: 'Loss falls predictably as a power law in parameters, data and compute; the Chinchilla finding that models were under-trained on data, and why smaller models trained on far more tokens now dominate deployment.',
          concepts: ['Power-law loss curves', 'Chinchilla compute-optimal ratio', 'Over-training for cheaper inference', 'Predicting loss from compute'],
          quiz: [
            ['What did Chinchilla show?', 'For a fixed compute budget, models should be smaller and trained on more tokens than earlier practice.'],
            ['Why over-train small models past compute-optimal?', 'Inference cost dominates, so a smaller model that is better per parameter pays off.'],
          ],
          prereqs: ['Pretraining objective and data pipeline'],
        },
        {
          title: 'Capabilities, emergence and benchmarks',
          description: 'How capabilities appear as models scale, why some "emergent" jumps are artefacts of discontinuous metrics, and the standard benchmark suites used to track pretraining progress.',
          concepts: ['Capability curves with scale', 'Emergence and metric artefacts', 'Standard pretraining benchmarks', 'Few-shot evaluation protocols'],
          quiz: [
            ['Why can emergence be a measurement artefact?', 'Exact-match metrics hide smooth improvement in partial correctness.'],
            ['What does few-shot evaluation add to the prompt?', 'A handful of solved examples before the test question.'],
          ],
          prereqs: ['Scaling laws and compute-optimal training'],
        },
        {
          title: 'Data quality and contamination',
          description: 'Synthetic and curated data, the effect of code and textbooks on reasoning, and benchmark contamination where test sets leak into training data and inflate scores.',
          concepts: ['Curated and synthetic data', 'Code data and reasoning', 'Benchmark contamination', 'Contamination detection'],
          quiz: [
            ['What is benchmark contamination?', 'Evaluation questions appearing in the training corpus.'],
            ['How can contamination be detected?', 'n-gram overlap checks or asking the model to complete test items verbatim.'],
          ],
          prereqs: ['Pretraining objective and data pipeline'],
        },
      ],
    },
    {
      title: 'Instruction Tuning and Alignment',
      description: 'Turning a text predictor into an assistant.',
      topics: [
        {
          title: 'Supervised fine-tuning on instructions',
          description: 'Training on prompt-response pairs so the model answers rather than continues, dataset sources from human-written to self-instruct, loss masking on the prompt, and how little data changes behaviour.',
          concepts: ['Instruction-response datasets', 'Loss masking on prompt tokens', 'Self-instruct and synthetic data', 'Data quality over quantity'],
          quiz: [
            ['Why mask the prompt tokens in the loss?', 'So the model learns to produce responses, not to predict the instructions.'],
            ['Roughly how many high-quality examples changed behaviour in LIMA?', 'About a thousand.'],
          ],
          prereqs: ['Pretraining objective and data pipeline'],
        },
        {
          title: 'Reward models and RLHF',
          description: 'Collecting human preferences between responses, training a reward model on them, and optimising the policy with PPO under a KL penalty to the reference model; what each part guards against.',
          concepts: ['Preference pair collection', 'Reward model training', 'PPO with a KL penalty', 'Reward hacking and over-optimisation'],
          quiz: [
            ['Why include a KL penalty?', 'To keep the policy from drifting far from the reference and exploiting the reward model.'],
            ['What does the reward model output?', 'A scalar score for a prompt-response pair.'],
          ],
          prereqs: ['Supervised fine-tuning on instructions'],
        },
        {
          title: 'DPO and direct preference methods',
          description: 'Direct Preference Optimisation rewrites the RLHF objective as a classification loss over preference pairs, removing the reward model and RL loop; its variants and the trade-offs against on-policy methods.',
          concepts: ['DPO loss on preference pairs', 'Implicit reward in DPO', 'Off-policy versus on-policy data', 'Variants: IPO, KTO, ORPO'],
          quiz: [
            ['What does DPO not need?', 'A separately trained reward model or an RL optimiser.'],
            ['What is a weakness of DPO?', 'It learns from fixed off-policy pairs and can overfit them.'],
          ],
          prereqs: ['Reward models and RLHF'],
        },
        {
          title: 'AI feedback and constitutional approaches',
          description: 'Replacing some human labels with model judgements guided by written principles (RLAIF, Constitutional AI), self-critique and revision loops, and where AI feedback is and is not trustworthy.',
          concepts: ['RLAIF', 'Principle-guided critique and revision', 'Scaling feedback with models', 'Limits of AI feedback'],
          quiz: [
            ['What guides the critique in Constitutional AI?', 'A written set of principles the model applies to its own outputs.'],
            ['Why is AI feedback risky on its own?', 'It inherits the judge model\'s biases and blind spots.'],
          ],
          prereqs: ['DPO and direct preference methods'],
        },
      ],
    },
    {
      title: 'Prompting and Structured Interaction',
      description: 'Talking to the model from code.',
      topics: [
        {
          title: 'Prompt design fundamentals',
          description: 'System versus user messages, clear instructions, few-shot examples and output format requests as the core toolkit; enough to work effectively here, with the full depth in track-prompt-engineering.',
          concepts: ['System and user message roles', 'Instruction clarity', 'Few-shot examples', 'Output format requests'],
          quiz: [
            ['What belongs in the system message?', 'Persistent behaviour, role and constraints for the whole conversation.'],
            ['What does a few-shot example fix?', 'Ambiguity about the expected format and style of the answer.'],
          ],
          prereqs: ['Special tokens and chat templates'],
        },
        {
          title: 'Structured outputs and JSON mode',
          description: 'Requesting JSON with a schema, provider structured-output modes that enforce it, validating with pydantic, and handling the refusals and edge cases that break parsers.',
          concepts: ['Schema-first output design', 'Provider structured output modes', 'Validation with pydantic', 'Handling parse failures'],
          quiz: [
            ['Why validate even with JSON mode?', 'The JSON can be syntactically valid but semantically wrong or missing fields.'],
            ['What should the code do on a parse failure?', 'Retry with the error message included, then fall back.'],
          ],
          prereqs: ['Prompt design fundamentals'],
        },
        {
          title: 'Tool calling and function calling',
          description: 'Describing functions with names, descriptions and JSON parameter schemas so the model emits a call instead of text, executing it, returning the result as a tool message and looping until done.',
          concepts: ['Tool schemas and descriptions', 'The call-execute-return loop', 'Parallel tool calls', 'Tool choice and forcing', 'Error results back to the model'],
          quiz: [
            ['Who executes a tool call?', 'Your code; the model only emits the call with arguments.'],
            ['What makes a tool description good?', 'It says when to use the tool and what each parameter means.'],
          ],
          prereqs: ['Structured outputs and JSON mode'],
        },
        {
          title: 'Streaming responses',
          description: 'Receiving tokens as they are generated over server-sent events, assembling partial JSON and tool calls from deltas, handling stop reasons, and the UX and cancellation patterns that make streaming useful.',
          concepts: ['Server-sent event streams', 'Assembling deltas', 'Streaming tool calls', 'Stop reasons and cancellation'],
          quiz: [
            ['What does a stop reason of "length" mean?', 'The output hit the max token limit before finishing.'],
            ['Why is streaming JSON tricky?', 'Partial chunks are not valid JSON until the object closes.'],
          ],
          prereqs: ['Tool calling and function calling'],
        },
        {
          title: 'Multi-turn conversations',
          description: 'The client sends the whole history every turn, so state lives in your code: message roles, trimming, injecting tool results and summaries, and the cost that grows with each turn.',
          concepts: ['Stateless API, stateful client', 'Message roles in history', 'Trimming and summarising history', 'Cost growth per turn'],
          quiz: [
            ['Does the API remember the previous turn?', 'No, the client resends the history each time.'],
            ['What happens to cost as a conversation grows?', 'Each turn resends more tokens, so cost grows roughly quadratically.'],
          ],
          prereqs: ['Prompt design fundamentals'],
        },
      ],
    },
    {
      title: 'Model Selection',
      description: 'Choosing the right model for the job and the budget.',
      topics: [
        {
          title: 'Open-weight versus hosted models',
          description: 'Hosted APIs give frontier quality and no ops; open weights give control, privacy and fixed cost at scale; how to decide with data sensitivity, volume, latency and team capacity.',
          concepts: ['Hosted API trade-offs', 'Open-weight trade-offs', 'Data privacy and residency', 'Total cost of ownership'],
          quiz: [
            ['When do open weights win on cost?', 'At high, steady volume where GPU utilisation stays high.'],
            ['What do hosted APIs give you that open models do not?', 'Frontier capability without operating GPUs.'],
          ],
        },
        {
          title: 'Size, quality and latency trade-offs',
          description: 'Bigger models are slower and costlier per token but reason better; small models suffice for extraction and classification; distilled and reasoning-mode models change the curve, and only your eval can settle it.',
          concepts: ['Parameter count versus quality', 'Latency per token by size', 'Small models for narrow tasks', 'Reasoning modes and their cost'],
          quiz: [
            ['What task usually works fine with a small model?', 'Classification or extraction with a clear format.'],
            ['Why not always use the largest model?', 'Latency and cost scale with size while many tasks do not need it.'],
          ],
          prereqs: ['Open-weight versus hosted models'],
        },
        {
          title: 'Pricing and cost estimation',
          description: 'Per-token input and output pricing, cached-input discounts, batch APIs, and building a spreadsheet estimate from tokens per request and requests per day before committing to a design.',
          concepts: ['Input versus output pricing', 'Cached input discounts', 'Batch API pricing', 'Estimating monthly spend'],
          quiz: [
            ['Which is usually more expensive per token?', 'Output tokens.'],
            ['What does a batch API trade for its discount?', 'Latency; results arrive within hours instead of seconds.'],
          ],
          prereqs: ['Size, quality and latency trade-offs'],
        },
        {
          title: 'Licences and deployment constraints',
          description: 'Reading model licences (Apache-2.0, MIT, Llama community licence, research-only), acceptable-use policies, and the regional and compliance constraints that rule models in or out.',
          concepts: ['Permissive versus custom licences', 'Acceptable-use policies', 'Regional and compliance rules', 'Attribution requirements'],
          quiz: [
            ['Is a "community licence" the same as open source?', 'No, it may carry use restrictions and user thresholds.'],
            ['Why check acceptable-use policies?', 'They can forbid your use case even if the weights are downloadable.'],
          ],
          prereqs: ['Open-weight versus hosted models'],
        },
      ],
    },
    {
      title: 'Context Engineering, Memory and State',
      description: 'Deciding what the model sees on every call.',
      topics: [
        {
          title: 'Context engineering',
          description: 'Treating the context window as a designed artefact: which instructions, examples, documents and tool outputs go in, in what order, with what budget, and how to measure whether each part earns its tokens.',
          concepts: ['Components of a context', 'Ordering and placement', 'Token budgeting per component', 'Ablating context components'],
          quiz: [
            ['How do you tell if a context section helps?', 'Remove it and rerun the evals.'],
            ['Where should the most important instruction go?', 'At the start or the end, where attention is most reliable.'],
          ],
          prereqs: ['Long-context behaviour and its limits', 'Prompt design fundamentals'],
        },
        {
          title: 'Retrieval as context',
          description: 'Pulling relevant documents into the prompt at request time so the model answers from your data rather than memory: the retrieve-then-generate pattern, chunk sizing and citing sources; the full treatment is in track-rag.',
          concepts: ['Retrieve-then-generate pattern', 'Chunking and relevance', 'Citing retrieved sources', 'When retrieval beats fine-tuning'],
          quiz: [
            ['What does retrieval fix that fine-tuning does not?', 'Access to fresh or private data without retraining.'],
            ['Why cite sources in the answer?', 'So users can verify claims and hallucinations become visible.'],
          ],
          prereqs: ['Context engineering'],
        },
        {
          title: 'Conversation memory strategies',
          description: 'Keeping recent turns verbatim, summarising older ones, extracting facts into a store and reinjecting them, and the failure modes: lost details, stale summaries, runaway cost.',
          concepts: ['Sliding window of turns', 'Rolling summaries', 'Fact extraction to a store', 'Memory failure modes'],
          quiz: [
            ['What does a rolling summary risk?', 'Dropping details that later turn out to matter.'],
            ['When should facts be extracted rather than summarised?', 'When precise values like names, dates or preferences must survive.'],
          ],
          prereqs: ['Multi-turn conversations'],
        },
        {
          title: 'State across sessions and tasks',
          description: 'Persisting user profiles and task state outside the model, scoping memory so one user\'s data never leaks into another\'s context, and letting the model read and write state through tools.',
          concepts: ['External state stores', 'Per-user scoping and isolation', 'State through tool calls', 'Consent and deletion of memory'],
          quiz: [
            ['Where should long-term user memory live?', 'In a database keyed by user, injected into the prompt as needed.'],
            ['Why is memory a privacy concern?', 'Stored facts persist and can leak across users or sessions if scoped wrongly.'],
          ],
          prereqs: ['Conversation memory strategies'],
        },
      ],
    },
    {
      title: 'Evaluation',
      description: 'Finding out whether it works before users do.',
      topics: [
        {
          title: 'Public benchmarks and their limits',
          description: 'What MMLU, GSM8K, HumanEval, MT-Bench and arena leaderboards measure, how contamination and prompt formatting swing scores, and why a benchmark ranking rarely predicts performance on your task.',
          concepts: ['Knowledge, maths and code benchmarks', 'Arena-style leaderboards', 'Prompt format sensitivity', 'Why benchmarks mislead'],
          quiz: [
            ['What does HumanEval measure?', 'Pass rate on Python programming problems with unit tests.'],
            ['Why can two labs report different MMLU scores for one model?', 'Different prompt formats, shots and answer parsing.'],
          ],
          prereqs: ['Capabilities, emergence and benchmarks'],
        },
        {
          title: 'Task-specific evals with golden sets',
          description: 'Building a labelled set from real inputs, choosing metrics that match the task (exact match, F1, rubric scores), running every model and prompt change against it, and keeping it out of any training data.',
          concepts: ['Collecting representative inputs', 'Choosing task metrics', 'Golden answers and rubrics', 'Keeping evals uncontaminated'],
          quiz: [
            ['How big should a first golden set be?', 'A few dozen to a few hundred diverse, real examples.'],
            ['What is the first metric for extraction tasks?', 'Field-level exact match or F1.'],
          ],
          prereqs: ['Public benchmarks and their limits'],
        },
        {
          title: 'LLM-as-judge for LLM outputs',
          description: 'Grading free-form answers with a stronger model against a rubric or reference, pairwise comparisons with swapped order, and measuring judge agreement with humans before trusting it.',
          concepts: ['Reference-guided grading', 'Pairwise comparison with order swaps', 'Judge bias and calibration', 'Agreement with human labels'],
          quiz: [
            ['Why swap the order in pairwise judging?', 'Judges show position bias toward the first or second answer.'],
            ['What agreement level makes a judge usable?', 'Comparable to human-human agreement on the same items.'],
          ],
          prereqs: ['Task-specific evals with golden sets'],
        },
        {
          title: 'Regression testing and eval harnesses',
          description: 'Running evals automatically on every prompt or model change, tracking scores over time, sampling variance across runs, and gating deployments; the deeper treatment lives in track-llm-evals.',
          concepts: ['Evals in CI', 'Tracking scores over versions', 'Variance across sampled runs', 'Deployment gates'],
          quiz: [
            ['Why run each eval item several times?', 'Sampling makes single runs noisy; averages are comparable.'],
            ['What should block a deployment?', 'A score drop beyond the measured run-to-run variance.'],
          ],
          prereqs: ['LLM-as-judge for LLM outputs'],
        },
      ],
    },
    {
      title: 'Latency and Cost Optimisation',
      description: 'Making each token cheaper and faster.',
      topics: [
        {
          title: 'Prompt caching',
          description: 'Reusing the KV cache for a shared prompt prefix across requests, provider cache discounts, structuring prompts so the stable part comes first, and measuring hit rates.',
          concepts: ['Prefix KV cache reuse', 'Stable prefix ordering', 'Provider cache pricing', 'Measuring cache hit rate'],
          quiz: [
            ['What must be true for a cache hit?', 'The prompt prefix is byte-identical up to the cached point.'],
            ['Where should dynamic content go for caching?', 'After the stable system prompt and examples.'],
          ],
          prereqs: ['The KV cache and autoregressive inference', 'Pricing and cost estimation'],
        },
        {
          title: 'Batching and continuous batching',
          description: 'GPUs are underused by one sequence at a time; static batching pads and waits, continuous batching admits new requests as others finish, which is why serving engines reach high throughput.',
          concepts: ['GPU utilisation and memory bandwidth', 'Static batching', 'Continuous batching', 'Throughput versus per-request latency'],
          quiz: [
            ['Why does batching raise throughput?', 'Decoding is memory-bound, so more sequences per weight read is nearly free.'],
            ['What does continuous batching change?', 'Requests join and leave the batch at token granularity.'],
          ],
          prereqs: ['The KV cache and autoregressive inference'],
        },
        {
          title: 'Quantisation',
          description: 'Storing weights in 8-bit or 4-bit (GPTQ, AWQ, GGUF, bitsandbytes) to cut memory and speed up memory-bound decoding, activation quantisation, and checking quality on your evals rather than trusting perplexity alone.',
          concepts: ['Weight-only int8 and int4', 'GPTQ, AWQ and GGUF formats', 'Activation quantisation', 'Quality checks after quantisation'],
          quiz: [
            ['Why does 4-bit speed up decoding?', 'Decoding is limited by reading weights from memory, and 4-bit weights are a quarter the size.'],
            ['What is GGUF?', 'The quantised model file format used by llama.cpp.'],
          ],
          prereqs: ['Batching and continuous batching'],
        },
        {
          title: 'Speculative decoding',
          description: 'A small draft model proposes several tokens and the large model verifies them in one pass, accepting the matching prefix; exact same output distribution with fewer large-model steps.',
          concepts: ['Draft and target models', 'Verification in one pass', 'Acceptance rate', 'Exactness guarantee'],
          quiz: [
            ['Does speculative decoding change the output distribution?', 'No, rejection sampling keeps it identical to the target model.'],
            ['What limits the speedup?', 'The acceptance rate of drafted tokens.'],
          ],
          prereqs: ['Batching and continuous batching'],
        },
        {
          title: 'Reducing tokens and routing',
          description: 'Shorter prompts, trimmed histories, compressed retrieved context, capped outputs and routing simple requests to small models; the cheapest optimisations because they need no infrastructure.',
          concepts: ['Prompt and history trimming', 'Context compression', 'Output length caps', 'Routing to cheaper models'],
          quiz: [
            ['What is the fastest way to cut cost by half?', 'Send half the tokens.'],
            ['How does a router decide?', 'A classifier or heuristic estimates difficulty and picks the smallest adequate model.'],
          ],
          prereqs: ['Prompt caching'],
        },
      ],
    },
    {
      title: 'Local Inference',
      description: 'Running models on hardware you control.',
      topics: [
        {
          title: 'Running models with llama.cpp',
          description: 'Loading GGUF models on CPU or GPU with llama.cpp, choosing a quantisation level, offloading layers to the GPU, and its OpenAI-compatible server; the go-to for laptops and small machines.',
          concepts: ['GGUF quantisation levels', 'GPU layer offloading', 'llama.cpp server mode', 'CPU inference performance'],
          quiz: [
            ['What does Q4_K_M denote?', 'A 4-bit k-quant mixed precision GGUF quantisation.'],
            ['What does -ngl control?', 'How many layers are offloaded to the GPU.'],
          ],
          prereqs: ['Quantisation'],
        },
        {
          title: 'Ollama for local model management',
          description: 'Pulling and running models with one command, Modelfiles for custom system prompts and parameters, the local REST API, and when Ollama is enough versus a proper serving engine.',
          concepts: ['Pulling and running models', 'Modelfiles', 'Local REST API', 'Limits of Ollama'],
          quiz: [
            ['What does a Modelfile define?', 'A base model plus system prompt, parameters and template.'],
            ['Is Ollama suited to high-concurrency serving?', 'No, it targets single-user local use.'],
          ],
          prereqs: ['Running models with llama.cpp'],
        },
        {
          title: 'vLLM and PagedAttention',
          description: 'A serving engine that manages the KV cache in pages like virtual memory, enabling continuous batching and high throughput on GPUs, with an OpenAI-compatible API and tensor parallelism across cards.',
          concepts: ['PagedAttention memory management', 'Continuous batching in vLLM', 'OpenAI-compatible serving', 'Tensor parallelism across GPUs'],
          quiz: [
            ['What problem does PagedAttention solve?', 'KV cache fragmentation and over-allocation that wasted GPU memory.'],
            ['When do you need tensor parallelism?', 'When the model does not fit in one GPU\'s memory.'],
          ],
          prereqs: ['Batching and continuous batching'],
        },
        {
          title: 'Hardware sizing for inference',
          description: 'Estimating VRAM from parameters times bytes per weight plus KV cache, GPU versus CPU versus Apple Silicon trade-offs, memory bandwidth as the real bottleneck, and choosing between one big card and several small ones.',
          concepts: ['VRAM estimation formula', 'Memory bandwidth as the bottleneck', 'GPU, CPU and Apple Silicon', 'Single versus multiple GPUs'],
          quiz: [
            ['How much VRAM for a 7B model in fp16 weights alone?', 'About 14 GB.'],
            ['Why is Apple Silicon usable for local LLMs?', 'Unified memory gives the GPU access to large RAM with decent bandwidth.'],
          ],
          prereqs: ['Running models with llama.cpp'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: a tiny GPT from scratch',
          description: 'Implement a character or BPE tokenizer, a decoder-only transformer with RoPE and a KV cache in PyTorch, train it on a small text corpus, and add temperature and top-p sampling with a perplexity report.',
          concepts: ['Tokenizer and data loader', 'Attention blocks and RoPE', 'Training loop and perplexity', 'Sampling with a KV cache'],
          quiz: [
            ['What confirms the KV cache is correct?', 'Cached and uncached generation produce identical tokens with greedy decoding.'],
            ['What should the loss start near for a vocabulary of size V?', 'ln(V).'],
          ],
          style: 'project',
        },
        {
          title: 'Project: structured extraction service',
          description: 'Build an API that turns messy emails or documents into a validated pydantic schema using structured outputs and tool calling, with retries on validation errors, a golden eval set and a cost report per document.',
          concepts: ['Design the schema and prompt', 'Structured output with validation', 'Retry and fallback logic', 'Evaluate accuracy and cost'],
          quiz: [
            ['What goes back to the model on a validation error?', 'The error message and a request to fix the specific field.'],
            ['How do you measure accuracy?', 'Field-level exact match against the golden set.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: local chat server with streaming',
          description: 'Serve a quantised open model with vLLM or llama.cpp behind an OpenAI-compatible endpoint, add a streaming web client, conversation memory with trimming, and load-test throughput at several concurrency levels.',
          concepts: ['Choose and quantise the model', 'Serve behind a compatible API', 'Stream to a web client', 'Load-test throughput'],
          quiz: [
            ['What metric shows batching is working?', 'Aggregate tokens per second rising as concurrency grows.'],
            ['Why an OpenAI-compatible endpoint?', 'Existing clients and SDKs work without changes.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: cost and latency benchmark harness',
          description: 'Write a harness that runs a golden set across several hosted and local models, records quality, p50 and p95 latency, tokens and cost per request, and produces a comparison table to justify a model choice.',
          concepts: ['Define the golden set and metrics', 'Run across models and providers', 'Measure latency percentiles and cost', 'Report the trade-offs'],
          quiz: [
            ['Why p95 and not just average latency?', 'Users experience the slow tail.'],
            ['What makes the comparison fair?', 'Identical prompts, sampling settings and repeated runs.'],
          ],
          style: 'project',
        },
        {
          title: 'LLM interview questions',
          description: 'Attention and the KV cache, RoPE versus absolute positions, why decoder-only won, Chinchilla, SFT versus RLHF versus DPO, quantisation effects, continuous batching, and how you would pick a model for a use case.',
          concepts: ['Architecture and inference questions', 'Training and alignment questions', 'Serving and cost questions', 'Model selection reasoning'],
          quiz: [
            ['Explain why decoding is memory-bound.', 'Each step reads all weights to produce one token, so bandwidth, not FLOPs, limits speed.'],
            ['What is the difference between SFT and RLHF?', 'SFT imitates demonstrations; RLHF optimises a learned preference reward.'],
          ],
          style: 'reading',
        },
        {
          title: 'Whiteboard: attention and memory maths',
          description: 'Derive attention FLOPs for a given context, size a KV cache for a model and batch, estimate VRAM for a quantised model, and write a minimal scaled dot-product attention and top-p sampler in NumPy.',
          concepts: ['Attention FLOP counting', 'KV cache sizing exercise', 'VRAM estimation exercise', 'Attention and top-p in NumPy'],
          quiz: [
            ['KV cache per token for 32 layers, 32 heads, head dim 128, fp16?', '2 * 32 * 32 * 128 * 2 bytes = 524,288 bytes, about 0.5 MB.'],
            ['What is the shape of the attention score matrix for n tokens?', 'n by n per head.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
