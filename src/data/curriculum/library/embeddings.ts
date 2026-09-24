import { defineTrack } from '../define'

export const embeddings = defineTrack({
  id: 'track-embeddings',
  title: 'Embeddings and Vector Search',
  description: 'How text, image and multimodal embeddings are produced, compared and indexed: similarity metrics, normalisation, FAISS, pgvector, Qdrant and Pinecone, IVF and HNSW indexes, hybrid search with BM25, reranking, retrieval evaluation and the cost of running vector search at scale.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🧭',
  tags: ['embeddings', 'vector search', 'faiss', 'pgvector', 'qdrant', 'hnsw', 'hybrid search', 'reranking', 'semantic search'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-llms'],
  style: 'practice',
  categories: [
    {
      title: 'Foundations of Embeddings',
      description: 'What a vector representation is, where it comes from and how to read one.',
      topics: [
        {
          title: 'What an embedding is',
          description: 'A fixed-length vector that places an input in a space where distance tracks meaning, so search, clustering and classification become geometry problems instead of string matching.',
          concepts: ['Dense vectors as meaning', 'Distance as relatedness', 'Embedding versus classification output', 'Where embeddings are used'],
          quiz: [
            ['What property makes an embedding useful for search?', 'Inputs with similar meaning land close together in the vector space.'],
            ['Is an embedding tied to one downstream task?', 'No; the same vector can serve search, clustering, deduplication and classification.'],
          ],
        },
        {
          title: 'From one-hot and TF-IDF to dense vectors',
          description: 'Sparse bag-of-words vectors count exact tokens and cannot see that "car" and "automobile" are related; dense embeddings compress meaning into a few hundred dimensions and generalise across vocabulary.',
          concepts: ['One-hot and bag-of-words vectors', 'TF-IDF weighting', 'Sparse versus dense representations', 'Vocabulary mismatch problem'],
          quiz: [
            ['Why does TF-IDF fail on synonyms?', 'Each word is its own dimension, so different words never overlap.'],
            ['What does "dense" mean for a vector?', 'Nearly every dimension carries a non-zero value that encodes some feature.'],
          ],
          prereqs: ['What an embedding is'],
        },
        {
          title: 'How embedding models are trained',
          description: 'Contrastive objectives pull matched pairs together and push unrelated pairs apart; in-batch negatives, hard negatives and temperature decide how sharp the resulting space is and why one model beats another on retrieval.',
          concepts: ['Contrastive loss and InfoNCE', 'In-batch and hard negatives', 'Positive pair mining', 'Pooling token states into one vector', 'Temperature in the softmax'],
          quiz: [
            ['What does a hard negative add to training?', 'A near-miss example that forces the model to separate confusingly similar texts.'],
            ['What is mean pooling?', 'Averaging the token hidden states into one sentence vector.'],
          ],
          prereqs: ['From one-hot and TF-IDF to dense vectors'],
        },
        {
          title: 'Reading an embedding space',
          description: 'Nearest neighbours, clusters and projections with UMAP or t-SNE show what a model has actually learned, which reveals biases, duplicate content and whether the space matches your domain before you build on it.',
          concepts: ['Nearest-neighbour inspection', 'Clustering with k-means', 'UMAP and t-SNE projections', 'Spotting domain mismatch'],
          quiz: [
            ['Can you trust distances in a 2-D UMAP plot?', 'Only locally; global distances in the projection are distorted.'],
            ['Quickest sanity check of a new embedding model?', 'Embed a handful of known-related and unrelated texts and inspect their neighbours.'],
          ],
          prereqs: ['What an embedding is'],
        },
        {
          title: 'Tokenisation and input length limits',
          description: 'Embedding models read tokens, not characters, and truncate silently at their context limit, so long inputs lose their tails and mixed-language or code inputs may cost far more tokens than expected.',
          concepts: ['Subword tokenisers', 'Maximum sequence length', 'Silent truncation risk', 'Token cost of code and non-English text'],
          quiz: [
            ['What happens to text past the model limit?', 'Most models drop it silently, so the embedding ignores the end.'],
            ['Why count tokens before embedding?', 'To detect truncation and estimate cost accurately.'],
          ],
          prereqs: ['What an embedding is'],
        },
      ],
    },
    {
      title: 'Embedding Models',
      description: 'The model families in use and how to choose between them.',
      topics: [
        {
          title: 'Text embedding models',
          description: 'Sentence-transformers models such as all-MiniLM and bge, and hosted APIs from OpenAI, Cohere and Voyage, differ in dimension, context length, language coverage and licence; knowing the trade-offs avoids paying for quality you do not need.',
          concepts: ['sentence-transformers library', 'Open models: MiniLM, bge, e5, gte', 'Hosted embedding APIs', 'Dimension and context trade-offs', 'Licensing and self-hosting'],
          quiz: [
            ['What does model.encode() in sentence-transformers return?', 'A NumPy array of one vector per input string.'],
            ['Why might a small local model beat a hosted one?', 'Lower latency and cost, no data leaving your network, and comparable quality on short text.'],
          ],
          prereqs: ['How embedding models are trained'],
        },
        {
          title: 'Choosing a model with MTEB',
          description: 'The MTEB leaderboard scores models across retrieval, clustering, classification and STS tasks; reading the retrieval column for your language and domain, then re-checking on your own data, beats picking the top overall score.',
          concepts: ['MTEB task groups', 'Retrieval versus STS scores', 'Multilingual coverage', 'Validating on your own data'],
          quiz: [
            ['Why not pick the highest average MTEB score?', 'Averages hide task and domain differences; retrieval on your data is what matters.'],
            ['What does STS measure?', 'How well cosine similarity tracks human-rated sentence similarity.'],
          ],
          prereqs: ['Text embedding models'],
        },
        {
          title: 'Image embeddings with CLIP',
          description: 'CLIP trains an image encoder and a text encoder in one space, so a caption and a photo can be compared directly; this enables zero-shot classification and text-to-image search without labelled data.',
          concepts: ['Dual-encoder architecture', 'Shared image-text space', 'Zero-shot classification with prompts', 'Image-to-image similarity'],
          quiz: [
            ['How does CLIP classify without training on labels?', 'It embeds the image and each label phrase, then picks the closest label.'],
            ['Why can a CLIP text vector be compared to an image vector?', 'Both encoders were trained to map matching pairs to nearby points.'],
          ],
          prereqs: ['How embedding models are trained'],
        },
        {
          title: 'Multimodal and cross-modal embeddings',
          description: 'Models that embed audio, video frames, documents with layout or image-plus-text into one space let a single index answer queries across formats; the cost is weaker per-modality quality and tricky evaluation.',
          concepts: ['Cross-modal retrieval', 'Audio and video embeddings', 'Document and screenshot embeddings', 'Modality gap'],
          quiz: [
            ['What is the modality gap?', 'Vectors from different modalities cluster apart even for matching content, distorting cross-modal distances.'],
            ['When is a multimodal model worth it?', 'When queries and content genuinely cross formats, such as searching screenshots by text.'],
          ],
          prereqs: ['Image embeddings with CLIP'],
        },
        {
          title: 'Fine-tuning an embedding model',
          description: 'Training on your own query-document pairs with MultipleNegativesRankingLoss or a similar objective adapts the space to domain vocabulary; a few thousand pairs often lift recall more than switching to a bigger base model.',
          concepts: ['Collecting query-document pairs', 'MultipleNegativesRankingLoss', 'Hard negative mining for fine-tuning', 'Avoiding catastrophic forgetting', 'Measuring the lift'],
          quiz: [
            ['What data does fine-tuning need?', 'Pairs of queries and the documents that answer them, ideally with hard negatives.'],
            ['Why keep the learning rate low?', 'To adapt the space without destroying the general semantics the base model learned.'],
          ],
          prereqs: ['Choosing a model with MTEB'],
        },
      ],
    },
    {
      title: 'Similarity, Normalisation and Dimensionality',
      description: 'The geometry that decides what "close" means.',
      topics: [
        {
          title: 'Cosine, dot product and Euclidean distance',
          description: 'The three metrics rank neighbours differently: cosine ignores magnitude, dot product rewards it and Euclidean mixes both; picking the one the model was trained with is what makes scores meaningful.',
          concepts: ['Cosine similarity formula', 'Dot product and magnitude', 'Euclidean and squared L2', 'Matching the metric to the model'],
          quiz: [
            ['When do cosine and dot product agree?', 'When all vectors are normalised to unit length.'],
            ['Which metric does FAISS IndexFlatL2 use?', 'Squared Euclidean distance.'],
          ],
          prereqs: ['What an embedding is'],
        },
        {
          title: 'Normalisation and score calibration',
          description: 'L2-normalising vectors makes dot product equal cosine and speeds indexing, but raw similarity scores are not probabilities; a threshold that works for one model is meaningless for another.',
          concepts: ['L2 normalisation', 'Score ranges per model', 'Thresholds are model-specific', 'Calibrating with labelled pairs'],
          quiz: [
            ['Why normalise before building an inner-product index?', 'So inner product equals cosine similarity and ranking is magnitude-independent.'],
            ['Is a cosine of 0.8 always "relevant"?', 'No; typical score distributions differ by model, so thresholds must be calibrated.'],
          ],
          prereqs: ['Cosine, dot product and Euclidean distance'],
        },
        {
          title: 'Dimensionality and the curse of distance',
          description: 'In high dimensions distances concentrate and nearest neighbours become less distinct, so more dimensions do not automatically mean better search, and they cost memory and latency linearly.',
          concepts: ['Distance concentration', 'Memory cost per dimension', 'Intrinsic versus nominal dimension', 'When 384 dimensions is enough'],
          quiz: [
            ['How does memory scale with dimensions?', 'Linearly: a 1536-d float32 vector is 6 KB, four times a 384-d one.'],
            ['What is distance concentration?', 'In high dimensions the nearest and farthest neighbours differ by little, weakening contrast.'],
          ],
          prereqs: ['Cosine, dot product and Euclidean distance'],
        },
        {
          title: 'Reducing dimensions: PCA and Matryoshka',
          description: 'PCA on your corpus or Matryoshka-trained models let you truncate vectors to 256 or 512 dimensions with a small recall loss, cutting index size and latency several-fold.',
          concepts: ['PCA on embedding matrices', 'Matryoshka representation learning', 'Truncation then renormalise', 'Recall loss versus savings'],
          quiz: [
            ['What makes Matryoshka embeddings truncatable?', 'They are trained so the leading dimensions carry the most information.'],
            ['What must you do after truncating a vector?', 'Renormalise it before cosine or inner-product search.'],
          ],
          prereqs: ['Dimensionality and the curse of distance'],
        },
        {
          title: 'Anisotropy and hubness',
          description: 'Many embedding spaces are anisotropic, with all vectors crowded into a narrow cone, and some points become hubs that appear in everyone\'s neighbour list; whitening and centering fix the worst of it.',
          concepts: ['Anisotropic embedding cones', 'Hub vectors in neighbour lists', 'Centering and whitening', 'Detecting hubness in results'],
          quiz: [
            ['What symptom does hubness cause?', 'The same few documents show up as neighbours for unrelated queries.'],
            ['What does centering do?', 'Subtracts the mean vector so cosine contrast improves.'],
          ],
          prereqs: ['Normalisation and score calibration'],
        },
      ],
    },
    {
      title: 'Vector Databases',
      description: 'Where vectors live and how the main stores differ.',
      topics: [
        {
          title: 'What a vector database provides',
          description: 'Beyond nearest-neighbour search, a vector store persists vectors with metadata, handles inserts and deletes, filters by attributes and replicates data; knowing which of those you need decides between a library and a database.',
          concepts: ['Library versus database', 'Payload and metadata storage', 'CRUD on vectors', 'Filtering and namespaces'],
          quiz: [
            ['When is FAISS alone enough?', 'For a static corpus that fits in one process with no filtering or multi-user access.'],
            ['What is a namespace or collection?', 'A logical partition that keeps one tenant or dataset separate from another.'],
          ],
          prereqs: ['Cosine, dot product and Euclidean distance'],
        },
        {
          title: 'FAISS in practice',
          description: 'Building IndexFlatIP, IndexIVFFlat and IndexHNSWFlat, training the index where required, adding vectors with ids and searching in batches; FAISS is the reference implementation the databases build on.',
          concepts: ['Index factory strings', 'Training an IVF index', 'IndexIDMap for external ids', 'Batch search and GPU indexes', 'Saving and loading indexes'],
          quiz: [
            ['Why must an IVF index be trained?', 'It needs to learn the centroids that partition the space before vectors are added.'],
            ['What does index.search(q, k) return?', 'Two arrays: distances and the ids of the k nearest vectors.'],
          ],
          prereqs: ['What a vector database provides'],
        },
        {
          title: 'pgvector in PostgreSQL',
          description: 'Storing vectors in a vector column next to relational data, querying with the <=> and <#> operators, and adding HNSW or IVFFlat indexes; it keeps one database and transactional consistency for small to mid-size corpora.',
          concepts: ['vector column type', 'Distance operators <->, <=>, <#>', 'HNSW and IVFFlat in pgvector', 'Combining SQL filters with kNN', 'Limits of Postgres for vectors'],
          quiz: [
            ['What does the <=> operator compute?', 'Cosine distance.'],
            ['Why put vectors in Postgres at all?', 'One store, ACID updates and joins against existing tables.'],
          ],
          prereqs: ['What a vector database provides'],
        },
        {
          title: 'Qdrant collections and payload filtering',
          description: 'Qdrant stores points with a vector and a JSON payload, supports filtered HNSW search that stays fast under selective filters, and offers quantisation and named vectors per point for multi-model setups.',
          concepts: ['Points, vectors and payloads', 'Filtered HNSW search', 'Named vectors per point', 'Scalar and binary quantisation in Qdrant'],
          quiz: [
            ['What is a payload in Qdrant?', 'JSON metadata attached to a point that can be filtered on.'],
            ['Why does filtered HNSW need special handling?', 'Naive filtering after search can return too few results when the filter is selective.'],
          ],
          prereqs: ['What a vector database provides'],
        },
        {
          title: 'Managed services: Pinecone and friends',
          description: 'Pinecone, Weaviate Cloud and similar services take away index tuning and scaling in exchange for per-vector pricing and vendor lock-in; the decision hinges on corpus size, update rate and data residency.',
          concepts: ['Serverless versus pod-based pricing', 'Namespaces and metadata filters', 'Upsert and delete semantics', 'Data residency and lock-in'],
          quiz: [
            ['What does upsert mean?', 'Insert the vector, or overwrite it if the id already exists.'],
            ['When does managed hosting pay off?', 'When the team lacks ops capacity and corpus size makes self-hosting risky.'],
          ],
          prereqs: ['What a vector database provides'],
        },
        {
          title: 'Metadata filtering: pre-filter versus post-filter',
          description: 'Filtering before the vector search guarantees enough results but can slow ANN indexes; filtering after is fast but may return fewer than k hits; modern engines blend both, and the choice affects recall on selective queries.',
          concepts: ['Pre-filtering with bitmaps', 'Post-filtering and empty results', 'Filter selectivity', 'Partition-per-tenant design'],
          quiz: [
            ['Failure mode of post-filtering?', 'A selective filter removes most of the top-k, leaving few or no results.'],
            ['When should a tenant get its own collection?', 'When isolation or very selective per-tenant filters dominate the workload.'],
          ],
          prereqs: ['Qdrant collections and payload filtering'],
        },
      ],
    },
    {
      title: 'Indexes and Approximate Nearest Neighbour Search',
      description: 'The data structures that make search over millions of vectors fast.',
      topics: [
        {
          title: 'Flat indexes and exact search',
          description: 'Brute-force comparison against every vector gives perfect recall and is the correctness baseline; with SIMD it is fine up to a few hundred thousand vectors, which is more than many products ever need.',
          concepts: ['Exact kNN by brute force', 'Latency versus corpus size', 'Flat as the recall baseline', 'When exact search is enough'],
          quiz: [
            ['What recall does a flat index give?', '100 percent; it compares against every vector.'],
            ['Roughly when does flat search become too slow?', 'Beyond a few hundred thousand to a million vectors per query in a single process.'],
          ],
          prereqs: ['FAISS in practice'],
        },
        {
          title: 'Inverted file indexes (IVF)',
          description: 'IVF clusters vectors around trained centroids and searches only the nprobe closest clusters, trading recall for speed; it is memory-light and simple but degrades when the data drifts from the training sample.',
          concepts: ['Centroids from k-means', 'nlist and nprobe parameters', 'Recall versus nprobe', 'Drift and retraining'],
          quiz: [
            ['What does increasing nprobe do?', 'Searches more clusters, raising recall and latency.'],
            ['Rule of thumb for nlist?', 'Around the square root of the number of vectors.'],
          ],
          prereqs: ['Flat indexes and exact search'],
        },
        {
          title: 'HNSW graphs',
          description: 'Hierarchical navigable small-world graphs link each vector to its neighbours across layers so a search greedily descends from coarse to fine; high recall at low latency, paid for in memory and slower inserts.',
          concepts: ['Layered proximity graph', 'M and ef_construction', 'ef_search at query time', 'Memory overhead of links', 'Deletes and graph degradation'],
          quiz: [
            ['What does M control in HNSW?', 'The number of links per node, trading memory for recall.'],
            ['Why are deletes awkward in HNSW?', 'Removing nodes breaks graph paths, so engines mark them deleted and rebuild later.'],
          ],
          prereqs: ['Flat indexes and exact search'],
        },
        {
          title: 'Product quantisation and compressed vectors',
          description: 'PQ splits each vector into sub-vectors and replaces each with a codebook id, shrinking storage 10 to 30 times so billion-scale indexes fit in RAM; combined with IVF it is the standard large-scale recipe.',
          concepts: ['Sub-vector codebooks', 'Asymmetric distance computation', 'IVF-PQ combination', 'Scalar and binary quantisation', 'Re-scoring with full vectors'],
          quiz: [
            ['What does PQ trade away?', 'Some accuracy, since distances are computed on approximations.'],
            ['How do you recover accuracy after PQ search?', 'Re-score the top candidates with their full-precision vectors.'],
          ],
          prereqs: ['Inverted file indexes (IVF)'],
        },
        {
          title: 'Tuning recall against latency',
          description: 'Measuring recall@k against a flat index while sweeping nprobe, ef_search and quantisation settings produces the curve you actually choose from; without it, index parameters are guesses.',
          concepts: ['Recall@k versus flat ground truth', 'Parameter sweeps', 'Latency percentiles', 'Choosing an operating point'],
          quiz: [
            ['How do you measure ANN recall?', 'Compare its top-k with the top-k from exact search on the same queries.'],
            ['Why report p99 latency, not mean?', 'Tail latency is what users and timeouts feel.'],
          ],
          prereqs: ['HNSW graphs', 'Inverted file indexes (IVF)'],
        },
      ],
    },
    {
      title: 'Search Pipelines',
      description: 'From raw documents to a ranked list a user trusts.',
      topics: [
        {
          title: 'Chunk embeddings versus document embeddings',
          description: 'One vector per document blurs many topics into an average; one vector per chunk keeps precision but multiplies storage and needs aggregation back to documents. Most systems embed chunks and return parents.',
          concepts: ['Averaging dilutes long documents', 'Chunk-level precision', 'Parent-document aggregation', 'Max versus mean chunk scoring'],
          quiz: [
            ['Why does a whole-document embedding underperform?', 'It averages across topics, so specific passages are lost.'],
            ['How do you rank documents from chunk hits?', 'Typically by the maximum chunk score per document.'],
          ],
          prereqs: ['Tokenisation and input length limits'],
        },
        {
          title: 'Chunking for embedding',
          description: 'Fixed-size windows with overlap, sentence or paragraph boundaries and structure-aware splits change what each vector represents; adding a title or section header to every chunk gives the model context it otherwise lacks.',
          concepts: ['Fixed windows with overlap', 'Structure-aware splitting', 'Contextual headers per chunk', 'Chunk size and recall trade-off'],
          quiz: [
            ['Why add overlap between chunks?', 'So a sentence cut at a boundary still appears whole in one chunk.'],
            ['What does prepending the section title do?', 'Gives the embedding topical context the chunk text alone lacks.'],
          ],
          prereqs: ['Chunk embeddings versus document embeddings'],
        },
        {
          title: 'BM25 and lexical search',
          description: 'BM25 scores exact term matches with saturation and length normalisation; it still wins on names, codes and rare words that embeddings smear, so it remains half of every serious search stack.',
          concepts: ['Term frequency saturation', 'Inverse document frequency', 'Length normalisation', 'Where lexical beats dense', 'rank_bm25 and Elasticsearch'],
          quiz: [
            ['Where does BM25 outperform embeddings?', 'Exact identifiers, product codes, names and rare terms.'],
            ['What does the k1 parameter control?', 'How quickly repeated term occurrences stop adding score.'],
          ],
          prereqs: ['From one-hot and TF-IDF to dense vectors'],
        },
        {
          title: 'Hybrid search and reciprocal rank fusion',
          description: 'Running BM25 and vector search in parallel and merging with RRF or weighted scores captures both exact and semantic matches; RRF needs no score calibration, which is why it is the default fusion method.',
          concepts: ['Parallel lexical and dense retrieval', 'Reciprocal rank fusion formula', 'Weighted score fusion', 'Sparse-dense in one engine'],
          quiz: [
            ['Why is RRF preferred over adding scores?', 'It uses ranks, so incomparable score scales do not matter.'],
            ['What is the RRF formula?', 'Sum over systems of 1 / (k + rank), with k around 60.'],
          ],
          prereqs: ['BM25 and lexical search', 'What a vector database provides'],
        },
        {
          title: 'Reranking with cross-encoders',
          description: 'A cross-encoder reads query and candidate together and scores relevance far more accurately than bi-encoder distance, so a cheap first stage retrieves 50 to 100 candidates and the reranker orders the top 5 to 10.',
          concepts: ['Bi-encoder versus cross-encoder', 'Two-stage retrieval', 'Rerankers: bge-reranker, Cohere Rerank', 'Latency budget for reranking'],
          quiz: [
            ['Why not rerank the whole corpus?', 'Cross-encoders score one pair at a time and are far too slow for millions of documents.'],
            ['What does a cross-encoder see that a bi-encoder cannot?', 'Token-level interactions between the query and the document.'],
          ],
          prereqs: ['Hybrid search and reciprocal rank fusion'],
        },
        {
          title: 'Query-side techniques',
          description: 'Asymmetric models expect instruction prefixes on queries, HyDE embeds a hypothetical answer instead of the question, and query expansion adds synonyms; each shifts the query closer to how documents are written.',
          concepts: ['Query and passage instruction prefixes', 'HyDE hypothetical documents', 'Query expansion with an LLM', 'Multi-query retrieval'],
          quiz: [
            ['What does HyDE embed?', 'An LLM-generated hypothetical answer, which resembles real documents more than the question does.'],
            ['Why do e5 and bge want a prefix?', 'They were trained with "query:" and "passage:" prefixes, so omitting them hurts accuracy.'],
          ],
          prereqs: ['Text embedding models'],
        },
        {
          title: 'Late interaction with ColBERT',
          description: 'ColBERT keeps one vector per token and scores with MaxSim, retaining fine-grained matching at a fraction of cross-encoder cost; the price is far larger indexes, which PLAID-style compression reduces.',
          concepts: ['Per-token embeddings', 'MaxSim scoring', 'Index size of late interaction', 'When ColBERT is worth it'],
          quiz: [
            ['How does MaxSim score a document?', 'For each query token, take the best-matching document token and sum those maxima.'],
            ['Main drawback of ColBERT?', 'Storing a vector per token makes indexes many times larger.'],
          ],
          prereqs: ['Reranking with cross-encoders'],
        },
      ],
    },
    {
      title: 'Evaluating Retrieval Quality',
      description: 'Numbers that tell you whether search actually improved.',
      topics: [
        {
          title: 'Recall, precision, MRR and nDCG',
          description: 'Recall@k asks whether the answer is in the top k, MRR rewards putting it first, and nDCG handles graded relevance; each answers a different product question, so pick the one that matches how results are consumed.',
          concepts: ['Recall@k and precision@k', 'Mean reciprocal rank', 'nDCG with graded labels', 'Choosing k for your UI'],
          quiz: [
            ['Which metric suits a RAG system that passes the top 5 chunks to an LLM?', 'Recall@5, because the LLM only needs the answer somewhere in the context.'],
            ['What does nDCG add over recall?', 'It rewards placing highly relevant results earlier and supports graded labels.'],
          ],
          prereqs: ['Tuning recall against latency'],
        },
        {
          title: 'Building a labelled evaluation set',
          description: 'A few hundred real queries with judged relevant documents, sampled from logs and covering hard cases, is the asset that makes every later tuning decision measurable; without it changes are opinions.',
          concepts: ['Sampling queries from logs', 'Relevance judgement guidelines', 'Pooling candidates for labelling', 'Versioning the eval set'],
          quiz: [
            ['Why pool candidates from several systems before labelling?', 'So the labels are not biased toward what one retriever happens to find.'],
            ['How many queries do you need to start?', 'A few hundred is enough to detect meaningful differences.'],
          ],
          prereqs: ['Recall, precision, MRR and nDCG'],
        },
        {
          title: 'Synthetic queries from documents',
          description: 'Asking an LLM to write questions each chunk answers produces a large, cheap test set that catches gross regressions; it is biased toward easy, well-phrased queries and must be spot-checked against real ones.',
          concepts: ['Generating questions per chunk', 'Filtering trivial synthetic queries', 'Bias of synthetic data', 'Mixing synthetic and real queries'],
          quiz: [
            ['Main weakness of synthetic queries?', 'They mirror document wording, so they overestimate recall on real user phrasing.'],
            ['What do synthetic sets do well?', 'Catch large regressions cheaply across the whole corpus.'],
          ],
          prereqs: ['Building a labelled evaluation set'],
        },
        {
          title: 'Retrieval error analysis',
          description: 'Reading the failures by category, such as wrong chunk boundaries, vocabulary mismatch, stale documents or filter mistakes, tells you which fix to make next; aggregate metrics only tell you that something is wrong.',
          concepts: ['Failure taxonomies', 'Comparing dense and lexical misses', 'Chunk boundary failures', 'Turning failures into tests'],
          quiz: [
            ['Retrieval finds the right document but the wrong chunk. Likely cause?', 'Chunk boundaries split the answer or the chunk lacks context.'],
            ['Dense search misses a product code. Fix?', 'Add lexical search via hybrid retrieval.'],
          ],
          prereqs: ['Building a labelled evaluation set'],
        },
      ],
    },
    {
      title: 'Scaling, Cost and Operations',
      description: 'Running vector search for real traffic and real budgets.',
      topics: [
        {
          title: 'Embedding throughput and batching',
          description: 'Embedding millions of chunks is a batch job: sort by length, batch to fill the GPU, run hosted APIs concurrently under their rate limits and checkpoint progress so a crash does not restart from zero.',
          concepts: ['Length-sorted batching', 'GPU utilisation for encoders', 'Concurrent API calls under limits', 'Checkpointing long jobs'],
          quiz: [
            ['Why sort inputs by length before batching?', 'It reduces padding, so each batch does less wasted work.'],
            ['What should a crashed embedding job be able to do?', 'Resume from the last checkpoint instead of re-embedding everything.'],
          ],
          prereqs: ['Text embedding models'],
        },
        {
          title: 'Storage cost and quantised vectors',
          description: 'Ten million 1536-d float32 vectors need about 60 GB before index overhead; int8 or binary quantisation plus dimension truncation cut that by 4 to 32 times with modest recall loss, often the difference between RAM and disk.',
          concepts: ['Estimating index memory', 'int8 and binary quantisation', 'Disk-backed indexes', 'Cost per million vectors'],
          quiz: [
            ['Memory for 1M 768-d float32 vectors?', 'About 3 GB before index overhead.'],
            ['What does binary quantisation keep?', 'One bit per dimension, the sign, with re-scoring to recover accuracy.'],
          ],
          prereqs: ['Product quantisation and compressed vectors'],
        },
        {
          title: 'Sharding, replication and query fan-out',
          description: 'Beyond one machine, collections are sharded by id or tenant and replicated for reads; queries fan out to every shard and merge, so latency follows the slowest shard and hot tenants need their own partitions.',
          concepts: ['Sharding strategies', 'Read replicas for throughput', 'Scatter-gather merging', 'Hot tenant isolation'],
          quiz: [
            ['Why does fan-out hurt p99 latency?', 'The query waits for the slowest shard to respond.'],
            ['When to shard by tenant?', 'When queries are always tenant-scoped, so they hit one shard.'],
          ],
          prereqs: ['Metadata filtering: pre-filter versus post-filter'],
        },
        {
          title: 'Re-embedding and model migration',
          description: 'Vectors from two models cannot be compared, so changing models means re-embedding the whole corpus; blue-green collections, versioned model ids in metadata and a recall comparison before cut-over make the swap safe.',
          concepts: ['Vectors are model-specific', 'Blue-green index swaps', 'Model version in metadata', 'Migration cost estimation'],
          quiz: [
            ['Can you mix vectors from two embedding models in one index?', 'No; their spaces are unrelated, so distances are meaningless.'],
            ['How do you switch models without downtime?', 'Build a second collection, validate it, then flip reads to it.'],
          ],
          prereqs: ['Embedding throughput and batching'],
        },
        {
          title: 'Freshness, updates and caching',
          description: 'Documents change, so ingestion must detect modified content by hash, update or delete their chunks and keep the index consistent; caching query embeddings and popular results cuts both cost and latency.',
          concepts: ['Content hashing for change detection', 'Updating and deleting chunks', 'Query embedding cache', 'Result cache invalidation'],
          quiz: [
            ['How do you avoid re-embedding unchanged documents?', 'Store a content hash and skip chunks whose hash is unchanged.'],
            ['What makes result caching risky?', 'Stale hits after the underlying documents change, unless invalidated.'],
          ],
          prereqs: ['Sharding, replication and query fan-out'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: semantic search over a documentation set',
          description: 'Ingest a project\'s Markdown docs, chunk with headers, embed with a sentence-transformers model, index in FAISS and serve a FastAPI search endpoint with a labelled eval set that reports recall@5 and MRR.',
          concepts: ['Ingest and chunk the docs', 'Embed and build the index', 'Serve the search endpoint', 'Measure recall on labelled queries'],
          quiz: [
            ['What must the eval report include?', 'Recall@k and MRR on a fixed set of labelled queries, versioned with the index.'],
            ['Why store the chunk header with each vector?', 'To show meaningful results and to give the embedding context.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: hybrid search with pgvector and BM25',
          description: 'Store chunks in PostgreSQL with a vector column and a tsvector column, run both searches per query, fuse with reciprocal rank fusion and rerank the top 50 with a cross-encoder; compare each stage on the eval set.',
          concepts: ['Schema with vector and tsvector', 'Two retrievers in one query', 'Fuse with RRF', 'Rerank and compare stages'],
          quiz: [
            ['Which stage should improve MRR most?', 'The cross-encoder rerank, since it orders the shortlist more accurately.'],
            ['Why keep both indexes in one database?', 'One transaction keeps text, vector and metadata consistent.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: image and text search with CLIP',
          description: 'Embed a photo collection with CLIP, store vectors in Qdrant with metadata payloads, and build a small app that searches by text query or by example image with date and tag filters.',
          concepts: ['Embed images in batches', 'Store with payload filters', 'Text-to-image and image-to-image queries', 'Package as a small web app'],
          quiz: [
            ['How does text search over images work?', 'The text query is embedded into the same space as the images and compared directly.'],
            ['Where do date filters run?', 'As payload filters inside Qdrant, combined with the vector search.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: ANN index benchmark',
          description: 'Benchmark flat, IVF, HNSW and IVF-PQ indexes on one million vectors: sweep parameters, record recall@10 against exact search, memory and p50 and p99 latency, and write up which operating point you would ship.',
          concepts: ['Generate or load a million vectors', 'Sweep index parameters', 'Record recall, memory and latency', 'Recommend an operating point'],
          quiz: [
            ['What is the ground truth for recall?', 'The top-10 from a flat exact index on the same queries.'],
            ['Why measure memory as well as latency?', 'HNSW may win on speed but exceed the RAM budget.'],
          ],
          style: 'project',
        },
        {
          title: 'Embeddings interview questions',
          description: 'Typical questions: cosine versus dot product, why normalise, how HNSW works, IVF versus HNSW trade-offs, why hybrid search, what a reranker adds, chunk size choices and how you would evaluate a retrieval change.',
          concepts: ['Explaining similarity metrics', 'Comparing index structures aloud', 'Justifying hybrid and rerank stages', 'Describing an evaluation plan'],
          quiz: [
            ['Explain HNSW in two sentences.', 'A layered graph where each node links to near neighbours; search starts at the top layer and greedily descends to finer layers.'],
            ['Why would you add BM25 to a vector search system?', 'To catch exact terms, codes and names that dense embeddings miss.'],
          ],
          style: 'reading',
        },
        {
          title: 'Retrieval system design exercise',
          description: 'Design search over 50 million support tickets with per-customer isolation, daily updates and 200 ms p99 latency: pick the store, index, sharding, filtering strategy and evaluation loop, and defend the costs.',
          concepts: ['Sizing memory and cost', 'Choosing index and filters for tenants', 'Update and freshness pipeline', 'Latency budget across stages'],
          quiz: [
            ['How would you isolate customers?', 'Tenant-scoped shards or collections so filters are cheap and data never mixes.'],
            ['What fits in a 200 ms budget?', 'ANN retrieval under 50 ms plus reranking a shortlist of about 30 candidates.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
