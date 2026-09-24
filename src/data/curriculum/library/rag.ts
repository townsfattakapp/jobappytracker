import { defineTrack } from '../define'

export const rag = defineTrack({
  id: 'track-rag',
  title: 'Retrieval-Augmented Generation',
  description: 'Building RAG systems that answer from your own documents: ingestion and parsing, chunking, embedding and vector storage, hybrid retrieval and reranking, context assembly with citations, RAGAS-style evaluation, multi-tenant access control, caching, production architecture, failure modes and advanced patterns such as agentic RAG and GraphRAG.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '📚',
  tags: ['rag', 'retrieval', 'chunking', 'vector database', 'reranking', 'citations', 'ragas', 'graphrag', 'llm'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-embeddings'],
  style: 'practice',
  categories: [
    {
      title: 'RAG Foundations',
      description: 'Why retrieval sits in front of the model and what the pipeline looks like.',
      topics: [
        {
          title: 'Why retrieval augments generation',
          description: 'An LLM only knows its training data and its context window; retrieving relevant passages at query time gives it current, private and verifiable facts without retraining, and lets answers cite their sources.',
          concepts: ['Knowledge cut-off and private data', 'Grounding answers in sources', 'Retrieval as a cheap memory', 'What RAG cannot fix'],
          quiz: [
            ['What problem does RAG solve that prompting alone cannot?', 'Access to facts the model never saw, such as private or recent documents.'],
            ['Does RAG stop hallucination entirely?', 'No; it reduces it by supplying evidence, but the model can still misread or ignore the context.'],
          ],
        },
        {
          title: 'The RAG pipeline end to end',
          description: 'Ingest, parse, chunk, embed, store, retrieve, rerank, assemble context, generate, cite and evaluate: naming each stage matters because most quality problems trace to one specific stage, not to the model.',
          concepts: ['Offline indexing path', 'Online query path', 'Stage boundaries and contracts', 'Where quality is lost'],
          quiz: [
            ['Which stages run offline?', 'Ingestion, parsing, chunking, embedding and indexing.'],
            ['Answer is wrong but the right chunk was retrieved. Which stage failed?', 'Context assembly or generation, not retrieval.'],
          ],
          prereqs: ['Why retrieval augments generation'],
        },
        {
          title: 'RAG versus fine-tuning versus long context',
          description: 'Fine-tuning teaches style and skills but not facts that change; stuffing a million-token context is slow and expensive per query; RAG is the default for knowledge that updates, with the others layered on when needed.',
          concepts: ['Facts versus behaviour', 'Cost per query of long context', 'Combining RAG with fine-tuning', 'Decision criteria'],
          quiz: [
            ['When is fine-tuning the right tool?', 'To change tone, format or task skill, not to inject frequently changing facts.'],
            ['Why not just put every document in the context?', 'Cost and latency scale with tokens per query, and accuracy degrades in very long contexts.'],
          ],
          prereqs: ['Why retrieval augments generation'],
        },
        {
          title: 'Naive, advanced and modular RAG',
          description: 'Naive RAG embeds chunks and stuffs the top-k into a prompt; advanced RAG adds query rewriting, hybrid retrieval and reranking; modular RAG treats retrieval as a set of swappable components that an orchestrator or agent calls.',
          concepts: ['Naive top-k pipeline', 'Pre- and post-retrieval improvements', 'Modular retrieval components', 'Picking the level of complexity'],
          quiz: [
            ['What does advanced RAG add before retrieval?', 'Query rewriting, expansion or routing.'],
            ['Why start naive?', 'It establishes a baseline and eval set before adding components that may not help.'],
          ],
          prereqs: ['The RAG pipeline end to end'],
        },
      ],
    },
    {
      title: 'Document Ingestion and Parsing',
      description: 'Getting clean text and structure out of real-world sources.',
      topics: [
        {
          title: 'Loading documents from sources',
          description: 'Files, wikis, ticketing systems, databases and crawled pages each need a connector that yields documents with stable ids, source URLs and timestamps; the loader is where provenance for citations begins.',
          concepts: ['Connectors and document loaders', 'Stable document ids', 'Capturing source URL and timestamp', 'Incremental sync from sources'],
          quiz: [
            ['Why does every document need a stable id?', 'So updates and deletes can replace exactly its chunks in the index.'],
            ['What metadata should a loader always keep?', 'Source location, title and last-modified time for citations and freshness.'],
          ],
          prereqs: ['The RAG pipeline end to end'],
        },
        {
          title: 'Parsing PDFs and office documents',
          description: 'PDF text extraction breaks on columns, headers, footers and scanned pages; layout-aware parsers, OCR fallbacks and tools such as pdfplumber, PyMuPDF, Unstructured or Docling recover reading order that naive extraction scrambles.',
          concepts: ['Reading order and multi-column layouts', 'Headers, footers and page noise', 'OCR for scanned pages', 'pdfplumber, PyMuPDF and Docling', 'DOCX and PPTX extraction'],
          quiz: [
            ['Why does a two-column PDF confuse simple extractors?', 'They read line by line across both columns, interleaving unrelated text.'],
            ['When is OCR needed?', 'When pages are images with no text layer.'],
          ],
          prereqs: ['Loading documents from sources'],
        },
        {
          title: 'Cleaning HTML and Markdown',
          description: 'Web pages carry navigation, ads and boilerplate that pollute chunks; readability extraction, converting to Markdown and preserving heading hierarchy keep the signal and give chunkers structure to split on.',
          concepts: ['Boilerplate removal', 'HTML to Markdown conversion', 'Preserving heading hierarchy', 'Code blocks and lists'],
          quiz: [
            ['Why convert HTML to Markdown before chunking?', 'It keeps headings, lists and code as structure while dropping markup noise.'],
            ['What does boilerplate do to retrieval?', 'Repeated navigation text matches many queries and crowds out real content.'],
          ],
          prereqs: ['Loading documents from sources'],
        },
        {
          title: 'Tables, figures and images in documents',
          description: 'Tables flattened to prose lose their structure, and charts vanish entirely; serialising tables as Markdown or JSON, captioning images with a vision model and linking them to the surrounding text keeps that content retrievable.',
          concepts: ['Table serialisation formats', 'Captioning images with vision models', 'Linking figures to text', 'Multimodal chunks'],
          quiz: [
            ['How do you make a chart searchable?', 'Generate a text description or caption and index it with a reference to the image.'],
            ['Why keep tables as Markdown rather than plain text?', 'Row and column relationships survive, so the LLM can read values correctly.'],
          ],
          prereqs: ['Parsing PDFs and office documents'],
        },
        {
          title: 'Metadata extraction and enrichment',
          description: 'Titles, authors, dates, product versions and section paths extracted or inferred at ingestion power filtering, freshness rules and citations; an LLM can add summaries and keywords that improve both retrieval and display.',
          concepts: ['Structural metadata from documents', 'LLM-generated summaries and keywords', 'Version and date fields', 'Metadata schema design'],
          quiz: [
            ['Give a metadata field that improves retrieval directly.', 'Product version, so queries can filter to the right release.'],
            ['Why generate a document summary at ingestion?', 'It can be embedded for document-level retrieval and shown in citations.'],
          ],
          prereqs: ['Cleaning HTML and Markdown'],
        },
      ],
    },
    {
      title: 'Chunking Strategies',
      description: 'Deciding what unit of text gets embedded and returned.',
      topics: [
        {
          title: 'Fixed-size and recursive chunking',
          description: 'Token-window chunks with overlap are the baseline; recursive splitting tries paragraphs, then sentences, then words to stay near a target size without cutting mid-sentence, and chunk size is the single most tested knob.',
          concepts: ['Token windows and overlap', 'Recursive character splitting', 'Target size selection', 'Measuring chunk size effects'],
          quiz: [
            ['What does recursive splitting try first?', 'The largest separator, such as paragraph breaks, before falling back to sentences and words.'],
            ['Typical starting chunk size?', 'Around 256 to 512 tokens with 10 to 20 percent overlap, then tuned on the eval set.'],
          ],
          prereqs: ['Metadata extraction and enrichment'],
        },
        {
          title: 'Semantic and structure-aware chunking',
          description: 'Splitting on headings, sections, list items or code blocks keeps each chunk about one thing; semantic chunking uses embedding similarity between sentences to find topic shifts, at the cost of extra compute.',
          concepts: ['Heading-based splitting', 'Semantic boundary detection', 'Code and table-aware chunks', 'Variable chunk sizes'],
          quiz: [
            ['How does semantic chunking find boundaries?', 'It embeds consecutive sentences and splits where similarity drops.'],
            ['Why keep a code block whole?', 'Splitting code mid-function makes both halves meaningless to retrieval and generation.'],
          ],
          prereqs: ['Fixed-size and recursive chunking'],
        },
        {
          title: 'Contextual chunk enrichment',
          description: 'Prepending the document title, section path or an LLM-written one-line context to each chunk before embedding fixes the "orphan chunk" problem where a passage is meaningless without its surroundings.',
          concepts: ['Orphan chunks', 'Title and section path prefixes', 'LLM-generated chunk context', 'Cost of enrichment at scale'],
          quiz: [
            ['What is an orphan chunk?', 'A passage such as "it defaults to 30 seconds" that cannot be understood or retrieved without context.'],
            ['Cheapest form of enrichment?', 'Prepending the document title and section heading.'],
          ],
          prereqs: ['Semantic and structure-aware chunking'],
        },
        {
          title: 'Parent-child and small-to-big retrieval',
          description: 'Embedding small chunks for precise matching but returning their larger parent section to the LLM gives the best of both: sharp retrieval and enough context to answer, with sentence windows as a lighter variant.',
          concepts: ['Child chunks for matching', 'Parent context for generation', 'Sentence window retrieval', 'Deduplicating overlapping parents'],
          quiz: [
            ['Why embed small but return big?', 'Small chunks match precisely; larger context lets the model answer fully.'],
            ['What happens when several children share a parent?', 'Return the parent once, deduplicated.'],
          ],
          prereqs: ['Contextual chunk enrichment'],
        },
      ],
    },
    {
      title: 'Embedding and Storage for RAG',
      description: 'Applying vector search choices to a RAG index (see the Embeddings track for depth).',
      topics: [
        {
          title: 'Choosing embeddings for a RAG corpus',
          description: 'Model choice is driven by the corpus: language, domain vocabulary, chunk length and query style; testing two or three candidates on a small labelled set beats trusting leaderboards, and the choice is expensive to change later.',
          concepts: ['Corpus-driven model selection', 'Query-passage asymmetry', 'Testing candidates on labelled queries', 'Locking the model version'],
          quiz: [
            ['Why is changing the embedding model later costly?', 'Every chunk must be re-embedded and the index rebuilt.'],
            ['What matters more than the leaderboard score?', 'Recall on your own queries and documents.'],
          ],
          prereqs: ['Fixed-size and recursive chunking'],
        },
        {
          title: 'Vector store schema for RAG',
          description: 'A chunk record needs the vector, the text, document id, position, source URL, tenant, timestamp and any filter fields; designing that schema up front decides what citations, filters and updates are possible.',
          concepts: ['Chunk record fields', 'Filterable versus display metadata', 'Choosing the store for the workload', 'Index configuration for RAG'],
          quiz: [
            ['Why store chunk position?', 'To reassemble neighbours and show citations in document order.'],
            ['Which field enables per-customer isolation?', 'A tenant or owner id that every query must filter on.'],
          ],
          prereqs: ['Choosing embeddings for a RAG corpus'],
        },
        {
          title: 'Incremental indexing and deduplication',
          description: 'Re-embedding everything on each sync wastes money; hashing content per chunk, upserting changed chunks, deleting removed ones and collapsing near-duplicate documents keep the index accurate and the bill small.',
          concepts: ['Content hashes per chunk', 'Upsert and delete flows', 'Near-duplicate detection', 'Index rebuild versus patch'],
          quiz: [
            ['How do you detect a changed document cheaply?', 'Compare a hash of its content with the stored hash.'],
            ['Why remove near-duplicates?', 'They fill the top-k with the same content and starve other evidence.'],
          ],
          prereqs: ['Vector store schema for RAG'],
        },
        {
          title: 'Maintaining lexical and dense indexes together',
          description: 'Hybrid retrieval needs a BM25 or full-text index kept in lock-step with the vector index; a single store with both, or one ingestion transaction writing to two, avoids the drift that makes fusion return ghosts.',
          concepts: ['Dual-index consistency', 'Single-store hybrid options', 'Tokenisation for lexical index', 'Handling drift between indexes'],
          quiz: [
            ['What goes wrong when indexes drift?', 'One retriever returns chunks the other has deleted, producing missing or stale results.'],
            ['Name a store that keeps both in one place.', 'PostgreSQL with pgvector and tsvector, or Elasticsearch and OpenSearch with dense vectors.'],
          ],
          prereqs: ['Incremental indexing and deduplication'],
        },
      ],
    },
    {
      title: 'Retrieval and Ranking',
      description: 'Turning a question into the right handful of passages.',
      topics: [
        {
          title: 'Top-k retrieval and thresholds',
          description: 'Choosing k and a minimum similarity balances recall against context noise; too few chunks miss evidence, too many bury it, and a score floor lets the system say it found nothing instead of guessing.',
          concepts: ['Selecting k per use case', 'Similarity score floors', 'Empty-result handling', 'Diversity in the top-k'],
          quiz: [
            ['Why set a similarity threshold?', 'To detect queries the corpus cannot answer instead of passing irrelevant chunks.'],
            ['Downside of a large k?', 'More noise and cost, and the answer may be lost among weak chunks.'],
          ],
          prereqs: ['Vector store schema for RAG'],
        },
        {
          title: 'Hybrid retrieval for RAG',
          description: 'Combining BM25 and dense retrieval with reciprocal rank fusion covers both exact terms and paraphrases; for technical corpora full of identifiers and error codes it is usually the biggest single retrieval gain.',
          concepts: ['When hybrid helps most', 'Fusion weights per corpus', 'Lexical retrievers for identifiers', 'Evaluating hybrid versus dense'],
          quiz: [
            ['Which corpora benefit most from hybrid retrieval?', 'Technical ones with error codes, part numbers and product names.'],
            ['How do you merge the two ranked lists?', 'Reciprocal rank fusion or a tuned weighted score.'],
          ],
          prereqs: ['Maintaining lexical and dense indexes together', 'Top-k retrieval and thresholds'],
        },
        {
          title: 'Reranking in the RAG pipeline',
          description: 'A cross-encoder reranker over 30 to 100 candidates fixes ordering that bi-encoders get wrong and lets you send fewer, better chunks to the LLM, which lowers cost and raises faithfulness.',
          concepts: ['Reranker placement and candidate count', 'Cut-off after reranking', 'Latency and cost budget', 'LLM-based reranking'],
          quiz: [
            ['Why can reranking reduce total cost?', 'You can pass fewer chunks to the expensive generation call.'],
            ['How many candidates should feed a reranker?', 'Typically 30 to 100, enough for recall without excessive latency.'],
          ],
          prereqs: ['Hybrid retrieval for RAG'],
        },
        {
          title: 'Metadata filtering and scoped retrieval',
          description: 'Filtering by product, date, language or permission before ranking removes whole classes of wrong answers; routing a query to the right collection or namespace is often more effective than a smarter embedding.',
          concepts: ['Filter extraction from the query', 'Collection routing', 'Time-scoped retrieval', 'Filter selectivity and recall'],
          quiz: [
            ['How can a user query become a filter?', 'An LLM or rules extract entities such as product or version into structured filters.'],
            ['Why route to a collection instead of searching everything?', 'Smaller, on-topic candidate sets improve precision and latency.'],
          ],
          prereqs: ['Top-k retrieval and thresholds'],
        },
        {
          title: 'Retrieving from structured data',
          description: 'Not every question is answered by text: SQL tables, APIs and knowledge bases need text-to-SQL or tool calls, and a router decides whether to retrieve passages, query a database or both before generating.',
          concepts: ['Text-to-SQL retrieval', 'Routing between text and structured sources', 'Combining table results with passages', 'Guarding generated queries'],
          quiz: [
            ['When should a RAG system call SQL instead of vector search?', 'For aggregate or exact-value questions over tabular data.'],
            ['How do you keep text-to-SQL safe?', 'Read-only credentials, allow-listed tables and query validation before execution.'],
          ],
          prereqs: ['Metadata filtering and scoped retrieval'],
        },
      ],
    },
    {
      title: 'Context Assembly and Generation',
      description: 'Building the prompt that turns evidence into a trustworthy answer.',
      topics: [
        {
          title: 'Context window budgeting',
          description: 'System prompt, conversation history, retrieved chunks and the answer all share one token budget; allocating explicit limits per part and truncating chunks deliberately prevents silent overflow and cost spikes.',
          concepts: ['Token budget per prompt part', 'Chunk truncation policies', 'History compression', 'Counting tokens before the call'],
          quiz: [
            ['What overflows first in a long chat with RAG?', 'Conversation history, unless it is summarised or truncated.'],
            ['Why fix a per-chunk token cap?', 'One huge chunk should not crowd out the other evidence.'],
          ],
          prereqs: ['Reranking in the RAG pipeline'],
        },
        {
          title: 'Prompt construction for grounded answers',
          description: 'Delimited, numbered chunks with their sources, explicit instructions to answer only from them and a defined behaviour for missing evidence make the model\'s use of context predictable and its output checkable.',
          concepts: ['Delimiting and numbering chunks', 'Answer-only-from-context instructions', 'Behaviour when evidence is missing', 'Placing the question after the context'],
          quiz: [
            ['Why number the chunks in the prompt?', 'So the model can reference them in citations and you can verify which it used.'],
            ['Where should the question go relative to the context?', 'After the context, so the model reads the evidence first and has the task fresh.'],
          ],
          prereqs: ['Context window budgeting'],
        },
        {
          title: 'Citations and attribution',
          description: 'Asking for inline citation markers tied to chunk ids, then verifying that each cited chunk actually supports the claim, turns the answer into something users can check and lets you measure grounding automatically.',
          concepts: ['Inline citation markers', 'Mapping citations to sources', 'Verifying cited support', 'Displaying sources in the UI'],
          quiz: [
            ['How do you check a citation is real?', 'Confirm the cited chunk id exists and that its text supports the sentence.'],
            ['Why show sources even when the answer is good?', 'Users trust and verify answers they can trace, and it exposes errors.'],
          ],
          prereqs: ['Prompt construction for grounded answers'],
        },
        {
          title: 'Abstaining and answering "I don\'t know"',
          description: 'A grounded system must refuse when the evidence is absent or contradictory; thresholds, an explicit abstain instruction and a check that the answer overlaps the context stop it from inventing a confident reply.',
          concepts: ['Abstain instructions', 'Evidence sufficiency checks', 'Handling contradictory chunks', 'Suggesting alternatives on abstain'],
          quiz: [
            ['What should the model do with two chunks that disagree?', 'Surface the conflict and cite both rather than picking one silently.'],
            ['How can you detect an ungrounded answer automatically?', 'Check that its claims are supported by the retrieved context, with an NLI or judge model.'],
          ],
          prereqs: ['Citations and attribution'],
        },
        {
          title: 'Ordering context and lost-in-the-middle',
          description: 'Models attend most to the start and end of a long context, so the best evidence should sit at the edges; ordering by rank, grouping by document and removing redundant chunks measurably changes answer quality.',
          concepts: ['Lost-in-the-middle effect', 'Edge placement of top chunks', 'Grouping chunks by document', 'Redundancy removal'],
          quiz: [
            ['Where should the highest-ranked chunk go?', 'At the beginning or end of the context, not the middle.'],
            ['Why group chunks by document?', 'Adjacent passages read coherently and the model can follow the argument.'],
          ],
          prereqs: ['Prompt construction for grounded answers'],
        },
      ],
    },
    {
      title: 'Evaluating RAG Systems',
      description: 'Separating retrieval quality from answer quality and measuring both.',
      topics: [
        {
          title: 'Retrieval metrics for RAG',
          description: 'Context recall asks whether the needed evidence was retrieved and context precision whether the retrieved chunks were needed; tracking them per stage shows whether to fix chunking, the retriever or the reranker.',
          concepts: ['Context recall', 'Context precision', 'Hit rate at k', 'Attributing failures to a stage'],
          quiz: [
            ['Retrieval recall is high but precision is low. What does the LLM see?', 'The answer plus a lot of noise, which invites distraction.'],
            ['What does context recall need to compute?', 'Ground-truth evidence or answers to compare the retrieved chunks against.'],
          ],
          prereqs: ['Abstaining and answering "I don\'t know"'],
        },
        {
          title: 'Answer quality: faithfulness, relevance and correctness',
          description: 'Faithfulness checks that every claim is supported by the context, answer relevance that it addresses the question, and correctness that it matches a reference; a fluent answer can fail all three.',
          concepts: ['Claim-level faithfulness', 'Answer relevance to the question', 'Correctness against references', 'Completeness and conciseness'],
          quiz: [
            ['An answer is correct but not in the retrieved context. What is it?', 'Unfaithful: it came from the model\'s memory, which is unverifiable.'],
            ['How is faithfulness typically scored?', 'Split the answer into claims and check each against the context with a judge model.'],
          ],
          prereqs: ['Retrieval metrics for RAG'],
        },
        {
          title: 'RAGAS-style metric suites',
          description: 'RAGAS and similar suites compute faithfulness, answer relevance, context precision and recall with LLM judges over a dataset of questions, contexts, answers and references, giving a repeatable score per pipeline version.',
          concepts: ['RAGAS dataset format', 'Judge-based metric computation', 'Reading a metric report', 'Metric noise and repeat runs'],
          quiz: [
            ['What four columns does a RAGAS evaluation row usually have?', 'Question, retrieved contexts, generated answer and ground-truth reference.'],
            ['Why run judge-based metrics more than once?', 'LLM judges are noisy; averaging runs makes comparisons reliable.'],
          ],
          prereqs: ['Answer quality: faithfulness, relevance and correctness'],
        },
        {
          title: 'Building a RAG evaluation set',
          description: 'Real user questions, questions with no answer in the corpus, multi-document questions and adversarial phrasings, each with reference answers and evidence, form the regression suite that gates every pipeline change.',
          concepts: ['Question categories to cover', 'Unanswerable questions', 'Reference answers and evidence', 'Synthetic question generation'],
          quiz: [
            ['Why include unanswerable questions?', 'To measure whether the system abstains instead of hallucinating.'],
            ['What is the risk of a purely synthetic eval set?', 'It mirrors document wording and overstates real-world performance.'],
          ],
          prereqs: ['RAGAS-style metric suites'],
        },
        {
          title: 'Judge models and human review for RAG',
          description: 'LLM judges scale grading but favour verbose answers and their own style; a small, regularly refreshed human-labelled sample calibrates the judge and catches the errors it systematically misses.',
          concepts: ['Judge prompt design for RAG', 'Known judge biases', 'Calibrating against human labels', 'Sampling for human review'],
          quiz: [
            ['Name a common LLM-judge bias.', 'Preferring longer or more confident answers regardless of correctness.'],
            ['How do you trust a judge?', 'Measure its agreement with human labels on a calibration set.'],
          ],
          prereqs: ['Building a RAG evaluation set'],
        },
      ],
    },
    {
      title: 'Production RAG Architecture',
      description: 'Serving RAG to many users securely, quickly and affordably.',
      topics: [
        {
          title: 'Reference architecture for production RAG',
          description: 'An ingestion service writing to the index, a query API that retrieves, reranks and calls the LLM through a gateway, plus stores for chunks, conversations and traces; separating these lets each scale and fail on its own.',
          concepts: ['Ingestion service and queue', 'Query service and LLM gateway', 'Stores for chunks, chats and traces', 'Async versus synchronous paths'],
          quiz: [
            ['Why separate ingestion from query serving?', 'Bulk indexing load must not slow down user queries.'],
            ['What does an LLM gateway centralise?', 'Keys, rate limits, retries, logging and model routing.'],
          ],
          prereqs: ['Ordering context and lost-in-the-middle'],
        },
        {
          title: 'Access control and multi-tenancy',
          description: 'Every retrieval must enforce who may see which document, by tenant partition and per-document ACLs applied as filters before ranking; leaking one chunk across tenants is a security incident, not a quality bug.',
          concepts: ['Tenant partitioning of the index', 'Document-level ACL filters', 'Syncing permissions from sources', 'Testing for cross-tenant leakage'],
          quiz: [
            ['Where must permission filtering happen?', 'Inside retrieval, before ranking and before anything reaches the prompt.'],
            ['Why sync ACLs from the source system?', 'Permissions change; stale copies grant access that was revoked.'],
          ],
          prereqs: ['Reference architecture for production RAG'],
        },
        {
          title: 'Caching in RAG systems',
          description: 'Query embeddings, retrieval results and full answers can each be cached; semantic caches match paraphrased questions, but every cache must be keyed by tenant and invalidated when the underlying documents change.',
          concepts: ['Embedding cache', 'Retrieval result cache', 'Semantic answer cache', 'Tenant-aware cache keys and invalidation'],
          quiz: [
            ['What is a semantic cache?', 'A cache that returns a stored answer when a new question embeds close to a previous one.'],
            ['Biggest risk of an answer cache?', 'Serving another tenant\'s answer or a stale one after documents change.'],
          ],
          prereqs: ['Access control and multi-tenancy'],
        },
        {
          title: 'Latency and cost engineering',
          description: 'Retrieval, reranking and generation add up; streaming the answer, running retrievers in parallel, trimming context, choosing a smaller model for easy queries and batching embeddings keep p95 latency and cost per query in budget.',
          concepts: ['Latency budget by stage', 'Parallel retrievers', 'Model routing by difficulty', 'Cost per query tracking'],
          quiz: [
            ['Where does most RAG latency usually come from?', 'Generation, followed by reranking.'],
            ['What is the cheapest large latency win?', 'Streaming tokens so the user sees output immediately.'],
          ],
          prereqs: ['Reference architecture for production RAG'],
        },
        {
          title: 'Observability for RAG',
          description: 'Logging the query, retrieved chunk ids and scores, the assembled prompt, the answer and user feedback per request lets you replay failures, compute metrics on live traffic and see quality drift before users complain.',
          concepts: ['Per-request traces', 'Logging chunk ids and scores', 'Feedback capture', 'Dashboards for retrieval drift'],
          quiz: [
            ['Why log chunk ids rather than chunk text?', 'Smaller logs, and you can reconstruct exactly what was shown at that index version.'],
            ['What signals early quality drift?', 'Falling similarity scores, rising abstain rate or negative feedback.'],
          ],
          prereqs: ['Latency and cost engineering'],
        },
        {
          title: 'Index freshness and refresh strategy',
          description: 'Documents change hourly in some domains and yearly in others; scheduled syncs, change-data capture from sources and time-decayed ranking keep answers current and let the UI show how old the evidence is.',
          concepts: ['Sync schedules versus change events', 'Recency boosts in ranking', 'Surfacing evidence age', 'Full rebuild triggers'],
          quiz: [
            ['When is a full index rebuild required?', 'After changing the embedding model or the chunking strategy.'],
            ['How can ranking favour fresh content?', 'Apply a recency boost or filter based on the document timestamp.'],
          ],
          prereqs: ['Observability for RAG'],
        },
      ],
    },
    {
      title: 'Failure Modes and Mitigations',
      description: 'How RAG systems go wrong and what to do about each case.',
      topics: [
        {
          title: 'Hallucination despite retrieval',
          description: 'Models still invent details when chunks are weak, off-topic or partially relevant; tighter thresholds, abstain rules, claim verification and asking for quotes before answering cut these failures substantially.',
          concepts: ['Distraction by irrelevant chunks', 'Quote-then-answer prompting', 'Post-generation claim checks', 'Measuring hallucination rate'],
          quiz: [
            ['How does quote-then-answer help?', 'The model must first extract supporting quotes, anchoring the answer to real text.'],
            ['What makes irrelevant chunks dangerous?', 'The model treats them as evidence and blends them into the answer.'],
          ],
          prereqs: ['Judge models and human review for RAG'],
        },
        {
          title: 'Stale and conflicting information',
          description: 'Old versions, superseded policies and duplicate documents cause confident wrong answers; version metadata, deprecation flags, recency ranking and conflict-aware prompts turn silent errors into visible caveats.',
          concepts: ['Version and supersession metadata', 'Deprecating documents', 'Conflict-aware prompting', 'Detecting duplicates across versions'],
          quiz: [
            ['Two policy documents disagree. Best system behaviour?', 'Prefer the newer version by metadata and mention the conflict.'],
            ['How do you stop retired documents being retrieved?', 'Delete them or flag them and filter them out at query time.'],
          ],
          prereqs: ['Index freshness and refresh strategy'],
        },
        {
          title: 'Retrieval misses and vocabulary mismatch',
          description: 'Users say "reset password", the docs say "credential recovery"; hybrid search, query expansion, synonyms, fine-tuned embeddings and enriched chunks each attack this gap from a different side.',
          concepts: ['Diagnosing retrieval misses', 'Synonym and acronym expansion', 'Domain fine-tuning for recall', 'Adding FAQs and summaries to the index'],
          quiz: [
            ['First step when a query returns nothing useful?', 'Check whether the answer exists in the corpus and which stage lost it.'],
            ['Cheap fix for acronym mismatch?', 'Expand acronyms at query time and in chunk enrichment.'],
          ],
          prereqs: ['Hallucination despite retrieval'],
        },
        {
          title: 'Prompt injection through retrieved content',
          description: 'A document can contain instructions such as "ignore previous rules"; because retrieved text enters the prompt, it must be treated as untrusted data, delimited clearly, and never allowed to trigger tools or leak system prompts.',
          concepts: ['Indirect prompt injection', 'Treating retrieved text as data', 'Isolating tools from retrieved content', 'Scanning documents at ingestion'],
          quiz: [
            ['What is indirect prompt injection?', 'Malicious instructions hidden in content the model reads, such as a retrieved page or email.'],
            ['One structural defence?', 'Keep retrieved text in a clearly delimited data section and never let it authorise actions.'],
          ],
          prereqs: ['Hallucination despite retrieval'],
        },
      ],
    },
    {
      title: 'Advanced RAG Patterns',
      description: 'Techniques for questions a single retrieval pass cannot answer.',
      topics: [
        {
          title: 'Query rewriting and decomposition',
          description: 'Rewriting a vague or conversational question into a self-contained search query, and splitting compound questions into sub-queries, fixes the most common cause of poor retrieval in chat interfaces.',
          concepts: ['Conversational query rewriting', 'Sub-question decomposition', 'Step-back prompting', 'Multi-query generation'],
          quiz: [
            ['Why rewrite "what about the pro plan?" before retrieval?', 'It depends on chat history; the rewrite makes it self-contained, such as "pro plan pricing and limits".'],
            ['What is step-back prompting?', 'Asking a more general question first to retrieve background before the specific one.'],
          ],
          prereqs: ['Retrieval misses and vocabulary mismatch'],
        },
        {
          title: 'Multi-hop and iterative retrieval',
          description: 'Some answers need a chain: find the team that owns a service, then that team\'s on-call policy; iterative retrieve-read loops let the model issue follow-up searches guided by what it has read so far.',
          concepts: ['Multi-hop question structure', 'Retrieve-read-retrieve loops', 'Stopping criteria', 'Cost of extra hops'],
          quiz: [
            ['What makes a question multi-hop?', 'The second retrieval depends on information found in the first.'],
            ['How do you stop an iterative loop?', 'A maximum hop count or the model judging the evidence sufficient.'],
          ],
          prereqs: ['Query rewriting and decomposition'],
        },
        {
          title: 'Agentic RAG',
          description: 'An agent decides whether to retrieve, which source or tool to use, evaluates the results and retries with a new query when they are poor; it adapts to the question but costs more calls and needs guardrails and evaluation of its own.',
          concepts: ['Retrieval as a tool call', 'Self-reflective result checking', 'Source and tool selection', 'Bounding agent loops'],
          quiz: [
            ['What can agentic RAG do that a fixed pipeline cannot?', 'Judge that retrieval failed and search again differently or elsewhere.'],
            ['Main cost of agentic RAG?', 'More model calls, higher latency and harder-to-predict behaviour.'],
          ],
          prereqs: ['Multi-hop and iterative retrieval'],
        },
        {
          title: 'GraphRAG overview',
          description: 'Extracting entities and relations into a knowledge graph, then summarising communities, lets the system answer global questions such as "what are the main themes" that chunk retrieval cannot; it is expensive to build and best for stable corpora.',
          concepts: ['Entity and relation extraction', 'Community summaries', 'Local versus global queries', 'When GraphRAG pays off'],
          quiz: [
            ['What question type does GraphRAG handle better than vector RAG?', 'Corpus-wide or thematic questions that need aggregation across many documents.'],
            ['Why is GraphRAG costly?', 'Building the graph requires LLM extraction over the whole corpus, repeated on updates.'],
          ],
          prereqs: ['Agentic RAG'],
        },
        {
          title: 'Multimodal and long-context RAG',
          description: 'Retrieving images, tables and page screenshots into a vision-capable model, or retrieving whole documents into a long-context model and letting it read, extends RAG beyond text chunks at higher per-query cost.',
          concepts: ['Retrieving images and pages', 'Document-level retrieval for long context', 'Vision models as readers', 'Cost trade-offs of long context'],
          quiz: [
            ['When does document-level retrieval into a long-context model make sense?', 'When answers need whole-document reasoning and query volume is low enough to afford it.'],
            ['How can page screenshots be retrieved?', 'Embed them with a multimodal model such as ColPali or CLIP-style encoders and pass them to a vision model.'],
          ],
          prereqs: ['GraphRAG overview'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: document Q&A over a PDF library',
          description: 'Parse a folder of PDFs with layout-aware extraction, chunk by section, embed and store in pgvector, and answer questions with numbered citations that link back to page numbers; ship with a RAGAS report on 50 labelled questions.',
          concepts: ['Parse and chunk the PDFs', 'Index with metadata and page numbers', 'Answer with page-level citations', 'Evaluate with a RAGAS report'],
          quiz: [
            ['What metadata makes page citations possible?', 'Page number and document id stored on every chunk.'],
            ['Which metric shows citations are honest?', 'Faithfulness, checking each claim against the cited chunks.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: multi-tenant knowledge assistant',
          description: 'Build a RAG API where each organisation uploads its own documents; enforce tenant filters in every retrieval, sync per-document permissions, add a tenant-keyed cache, and write tests that prove no cross-tenant leakage.',
          concepts: ['Tenant-partitioned ingestion', 'Permission-filtered retrieval', 'Tenant-aware caching', 'Leakage tests'],
          quiz: [
            ['How do you test for leakage?', 'Query as tenant A for content only tenant B has and assert nothing returns.'],
            ['Where is the tenant id enforced?', 'Server-side in the retrieval filter, never trusted from the client prompt.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: conversational RAG with query rewriting',
          description: 'A chat assistant over product documentation that rewrites follow-up questions into standalone queries, runs hybrid retrieval with reranking, streams answers with sources and abstains when the corpus has no evidence.',
          concepts: ['Rewrite follow-ups from history', 'Hybrid retrieval and rerank', 'Stream answers with sources', 'Abstain on weak evidence'],
          quiz: [
            ['Why does chat need query rewriting?', 'Follow-ups depend on earlier turns and retrieve badly on their own.'],
            ['What should the UI show on an abstain?', 'A clear "not found in the documentation" message with suggested searches.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: RAG evaluation harness',
          description: 'Build a harness that runs a versioned question set through any pipeline configuration, computes context recall, precision, faithfulness and answer correctness, and produces a comparison table across chunk sizes, retrievers and rerankers.',
          concepts: ['Versioned question set', 'Pluggable pipeline configs', 'Compute retrieval and answer metrics', 'Comparison report'],
          quiz: [
            ['Why version the question set?', 'So scores across pipeline versions are comparable.'],
            ['What experiment usually gives the biggest gain?', 'Adding hybrid retrieval or a reranker, but the harness should show it rather than assume it.'],
          ],
          style: 'project',
        },
        {
          title: 'RAG interview questions',
          description: 'Expect questions on chunk size trade-offs, hybrid versus dense retrieval, when to rerank, how to cite sources, how to evaluate faithfulness, handling stale data, multi-tenancy, and RAG versus fine-tuning versus long context.',
          concepts: ['Explaining pipeline trade-offs', 'Evaluation questions', 'Security and tenancy questions', 'Comparing RAG alternatives'],
          quiz: [
            ['How would you reduce hallucination in a RAG system?', 'Better retrieval, thresholds with abstain, quote-then-answer prompting and faithfulness checks.'],
            ['Why prefer RAG over fine-tuning for a product knowledge base?', 'Facts change often and answers need citations, which fine-tuning cannot provide.'],
          ],
          style: 'reading',
        },
        {
          title: 'RAG system design exercise',
          description: 'Design an internal assistant over 2 million documents across wikis, tickets and PDFs for 10,000 employees with document-level permissions, hourly freshness and a p95 of 4 seconds; justify every component and its cost.',
          concepts: ['Ingestion and permission sync design', 'Retrieval architecture choices', 'Serving latency and cost targets', 'Evaluation and rollout plan'],
          quiz: [
            ['What is the hardest requirement here?', 'Document-level permissions synced from many sources and enforced in retrieval.'],
            ['How do you meet hourly freshness?', 'Change-driven incremental indexing rather than scheduled full rebuilds.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
