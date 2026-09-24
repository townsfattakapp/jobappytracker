import { defineTrack } from '../define'

export const nlp = defineTrack({
  id: 'track-nlp',
  title: 'Natural Language Processing',
  description: 'Text as data, from tokenizers and TF-IDF through embeddings, sequence models and transformers, to classification, NER, question answering, summarisation and translation, fine-tuned and evaluated with the Hugging Face stack.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '📝',
  tags: ['nlp', 'transformers', 'bert', 'tokenization', 'hugging-face', 'text-classification', 'ner', 'summarisation'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-deep-learning'],
  style: 'practice',
  categories: [
    {
      title: 'Text Preprocessing and Tokenization',
      description: 'Turning raw strings into units a model can count or embed.',
      topics: [
        {
          title: 'Text normalisation and cleaning',
          description: 'Unicode normalisation, case folding, stripping HTML and boilerplate, handling emoji and punctuation, and why over-cleaning (removing negations, numbers) silently destroys signal for some tasks.',
          concepts: ['Unicode NFC and NFKC normalisation', 'Case folding and its trade-offs', 'Regex cleaning of markup and noise', 'Stop words and when to keep them'],
          quiz: [
            ['Why can removing stop words hurt sentiment analysis?', 'Words like "not" flip polarity and are usually on stop-word lists.'],
            ['What does NFKC do to the "fi" ligature?', 'Decomposes it into the two separate characters f and i.'],
          ],
        },
        {
          title: 'Word and sentence tokenization',
          description: 'Splitting text into words and sentences with rules and trained models: whitespace and regex tokenizers, spaCy and NLTK, and the edge cases (contractions, URLs, abbreviations) that break naive splitting.',
          concepts: ['Whitespace and regex tokenizers', 'Sentence boundary detection', 'spaCy tokenization pipeline', 'Contractions, URLs and abbreviations'],
          quiz: [
            ['Why is splitting on "." not enough for sentences?', 'Abbreviations, decimals and URLs contain periods that are not sentence ends.'],
            ['How does spaCy tokenize "don\'t"?', 'Into "do" and "n\'t" using its exception rules.'],
          ],
          prereqs: ['Text normalisation and cleaning'],
        },
        {
          title: 'Stemming and lemmatization',
          description: 'Reducing inflected forms to a shared base: Porter and Snowball stemmers chop suffixes crudely, lemmatizers use vocabulary and part of speech to return real words, and each suits different tasks.',
          concepts: ['Porter and Snowball stemming', 'Lemmatization with part of speech', 'Over-stemming and under-stemming', 'Choosing between them per task'],
          quiz: [
            ['What does a Porter stemmer return for "studies"?', '"studi", a non-word stem.'],
            ['Why does lemmatization need part-of-speech tags?', '"saw" lemmatizes to "see" as a verb but "saw" as a noun.'],
          ],
        },
        {
          title: 'Subword tokenization and BPE',
          description: 'Byte-pair encoding builds a vocabulary by repeatedly merging the most frequent adjacent pairs, so rare words split into known pieces and no word is out of vocabulary; the core of every modern tokenizer.',
          concepts: ['The out-of-vocabulary problem', 'BPE merge algorithm', 'Byte-level BPE', 'Vocabulary size trade-offs'],
          quiz: [
            ['How does BPE choose which pair to merge next?', 'The most frequent adjacent symbol pair in the corpus.'],
            ['Why byte-level BPE?', 'Any UTF-8 string can be encoded with a 256-symbol base and no unknown tokens.'],
          ],
          prereqs: ['Word and sentence tokenization'],
        },
        {
          title: 'WordPiece, SentencePiece and training a tokenizer',
          description: 'How BERT\'s WordPiece scores merges by likelihood, how SentencePiece treats whitespace as a symbol for language-agnostic tokenization, and how to train and inspect a tokenizer with the tokenizers library.',
          concepts: ['WordPiece scoring and ## prefixes', 'SentencePiece and the Unigram model', 'Training a tokenizer on a corpus', 'Inspecting token splits and ids'],
          quiz: [
            ['What does the ## prefix mean in WordPiece?', 'The token continues the previous word rather than starting a new one.'],
            ['Why does SentencePiece encode spaces as a symbol?', 'So tokenization is reversible and works for languages without spaces.'],
          ],
          prereqs: ['Subword tokenization and BPE'],
        },
      ],
    },
    {
      title: 'Classical NLP',
      description: 'Sparse representations and linear models that remain strong baselines.',
      topics: [
        {
          title: 'Bag of words and vocabulary construction',
          description: 'Representing a document as word counts over a fixed vocabulary with CountVectorizer, controlling vocabulary size with min_df and max_features, and why sparse matrices make this scale.',
          concepts: ['Document-term matrix', 'CountVectorizer parameters', 'Sparse matrix storage', 'Binary versus count features'],
          quiz: [
            ['What information does bag of words discard?', 'Word order.'],
            ['What does min_df=5 do?', 'Drops terms that appear in fewer than five documents.'],
          ],
        },
        {
          title: 'TF-IDF weighting',
          description: 'Term frequency times inverse document frequency down-weights words that appear everywhere and up-weights distinctive ones; the sublinear and smoothing variants, L2 normalisation and why it works for search and classification.',
          concepts: ['Term frequency variants', 'Inverse document frequency', 'Sublinear tf and smoothing', 'Row normalisation for cosine'],
          quiz: [
            ['What idf does a word appearing in every document get?', 'Close to zero, so it barely contributes.'],
            ['Why L2-normalise TF-IDF rows?', 'So dot products equal cosine similarity and long documents do not dominate.'],
          ],
          prereqs: ['Bag of words and vocabulary construction'],
        },
        {
          title: 'N-gram features and language models',
          description: 'Capturing local order with word and character n-grams, estimating n-gram probabilities with counts, and the smoothing (add-k, Kneser-Ney) that keeps unseen sequences from getting zero probability.',
          concepts: ['Word and character n-grams', 'Markov assumption in n-gram models', 'Add-k and Kneser-Ney smoothing', 'Perplexity of an n-gram model'],
          quiz: [
            ['Why add character n-grams to a classifier?', 'They capture morphology and survive typos and rare words.'],
            ['What does smoothing fix?', 'Zero probability for n-grams never seen in training.'],
          ],
        },
        {
          title: 'Text similarity and search',
          description: 'Comparing documents with cosine similarity on TF-IDF vectors, Jaccard on token sets, and BM25 as the ranking function behind most lexical search engines.',
          concepts: ['Cosine similarity on sparse vectors', 'Jaccard similarity', 'BM25 ranking function', 'Nearest documents with sklearn'],
          quiz: [
            ['Why cosine rather than Euclidean distance for text?', 'It ignores document length and compares direction only.'],
            ['What does BM25\'s saturation term do?', 'Stops repeated terms from increasing the score without bound.'],
          ],
          prereqs: ['TF-IDF weighting'],
        },
        {
          title: 'Linear classifiers for text',
          description: 'Multinomial Naive Bayes and logistic regression or linear SVMs on sparse features: fast, strong baselines that every transformer result should be compared against.',
          concepts: ['Multinomial Naive Bayes', 'Logistic regression on sparse features', 'Linear SVM with liblinear', 'Baselines before deep models'],
          quiz: [
            ['Why is Naive Bayes "naive"?', 'It assumes features are conditionally independent given the class.'],
            ['Which sklearn class trains a linear SVM fast on sparse text?', 'LinearSVC.'],
          ],
          prereqs: ['TF-IDF weighting'],
        },
        {
          title: 'Topic modelling with LDA',
          description: 'Latent Dirichlet Allocation treats each document as a mixture of topics and each topic as a distribution over words; fitting it with gensim or sklearn, choosing the topic count and reading the outputs.',
          concepts: ['Documents as topic mixtures', 'Fitting LDA with gensim', 'Choosing the number of topics', 'Coherence scores'],
          quiz: [
            ['What are the two distributions LDA learns?', 'Topic-per-document and word-per-topic.'],
            ['How do you judge topic quality automatically?', 'Coherence scores such as c_v.'],
          ],
        },
      ],
    },
    {
      title: 'Word Embeddings',
      description: 'Dense vectors that place similar words near each other.',
      topics: [
        {
          title: 'Distributional semantics',
          description: 'The idea that a word is characterised by the company it keeps: co-occurrence matrices, PMI weighting, and dimensionality reduction with SVD as the ancestor of learned embeddings.',
          concepts: ['Co-occurrence matrices', 'Pointwise mutual information', 'SVD-based embeddings', 'Context window size effects'],
          quiz: [
            ['What does the distributional hypothesis claim?', 'Words in similar contexts have similar meanings.'],
            ['What does a larger context window capture?', 'Topical similarity rather than syntactic similarity.'],
          ],
        },
        {
          title: 'word2vec: skip-gram and CBOW',
          description: 'Training shallow networks to predict context from a word (skip-gram) or a word from context (CBOW), with negative sampling to make the softmax affordable, and the vector arithmetic that results.',
          concepts: ['Skip-gram objective', 'CBOW objective', 'Negative sampling', 'Analogies by vector arithmetic'],
          quiz: [
            ['Why negative sampling?', 'A full softmax over the vocabulary is too expensive per training step.'],
            ['king - man + woman is closest to which word?', 'queen.'],
          ],
          prereqs: ['Distributional semantics'],
        },
        {
          title: 'GloVe and fastText',
          description: 'GloVe fits vectors to global co-occurrence statistics; fastText builds word vectors from character n-grams so misspelled and unseen words still get embeddings.',
          concepts: ['GloVe weighted least squares', 'fastText subword vectors', 'Pretrained embedding files', 'Out-of-vocabulary handling'],
          quiz: [
            ['How does fastText embed a word it never saw?', 'By summing the vectors of its character n-grams.'],
            ['What does GloVe train on?', 'A global word co-occurrence matrix.'],
          ],
          prereqs: ['word2vec: skip-gram and CBOW'],
        },
        {
          title: 'Using and evaluating embeddings',
          description: 'Loading pretrained vectors into an nn.Embedding layer, freezing or fine-tuning them, intrinsic tests (similarity, analogies), extrinsic tests on a downstream task, and visualising with t-SNE or UMAP.',
          concepts: ['Embedding layer initialisation', 'Freeze versus fine-tune', 'Intrinsic and extrinsic evaluation', 'Bias in embeddings', 't-SNE and UMAP plots'],
          quiz: [
            ['What is an extrinsic evaluation?', 'Measuring performance on a downstream task that uses the embeddings.'],
            ['Why can static embeddings encode bias?', 'They reflect co-occurrence patterns in the training corpus, including stereotypes.'],
          ],
          prereqs: ['GloVe and fastText'],
        },
      ],
    },
    {
      title: 'Sequence Models',
      description: 'Reading text one token at a time with recurrent networks.',
      topics: [
        {
          title: 'Recurrent networks for text',
          description: 'Feeding embedded tokens through an RNN that carries a hidden state, padding and packing variable-length batches in PyTorch, and why plain RNNs struggle with long dependencies.',
          concepts: ['Hidden state over a sequence', 'Padding and pack_padded_sequence', 'Vanishing gradients in RNNs', 'Many-to-one and many-to-many setups'],
          quiz: [
            ['Why pack padded sequences?', 'So the RNN ignores padding tokens instead of updating state on them.'],
            ['What limits a vanilla RNN on long text?', 'Gradients vanish or explode across many time steps.'],
          ],
        },
        {
          title: 'LSTM and GRU',
          description: 'Gated cells that decide what to keep, write and output, which lets gradients survive across long spans; the LSTM cell state versus the lighter GRU, and how to size and regularise them.',
          concepts: ['Forget, input and output gates', 'Cell state as long-term memory', 'GRU simplifications', 'Dropout in recurrent layers'],
          quiz: [
            ['What does the forget gate control?', 'How much of the previous cell state is kept.'],
            ['How many gates does a GRU have?', 'Two: reset and update.'],
          ],
          prereqs: ['Recurrent networks for text'],
        },
        {
          title: 'Bidirectional and stacked models',
          description: 'Running a second RNN backwards so each position sees both sides of its context, stacking layers for depth, and why bidirectionality helps tagging but is impossible for left-to-right generation.',
          concepts: ['Bidirectional encoding', 'Stacking recurrent layers', 'Concatenating forward and backward states', 'When bidirectionality is not allowed'],
          quiz: [
            ['Why can a generator not be bidirectional?', 'Future tokens do not exist yet at generation time.'],
            ['What is the output size of a BiLSTM with hidden 128?', '256 per position, forward and backward concatenated.'],
          ],
          prereqs: ['LSTM and GRU'],
        },
        {
          title: 'Sequence-to-sequence with attention',
          description: 'An encoder compresses the source and a decoder generates the target token by token; Bahdanau and Luong attention let the decoder look back at every source position instead of one fixed vector.',
          concepts: ['Encoder-decoder framing', 'Teacher forcing in training', 'Bahdanau additive attention', 'Attention weights as alignment'],
          quiz: [
            ['What problem did attention solve in seq2seq?', 'The single fixed-size context vector bottleneck.'],
            ['What is teacher forcing?', 'Feeding the true previous token to the decoder during training.'],
          ],
          prereqs: ['Bidirectional and stacked models'],
        },
      ],
    },
    {
      title: 'Transformers for NLP',
      description: 'The architecture behind every current state-of-the-art NLP system.',
      topics: [
        {
          title: 'Self-attention for language',
          description: 'Each token builds queries, keys and values and mixes information from every other token in one parallel step; multi-head attention, positional information and why this replaced recurrence for text.',
          concepts: ['Queries, keys and values', 'Multi-head attention over tokens', 'Positional embeddings in NLP models', 'Attention masks for padding'],
          quiz: [
            ['Why do transformers need positional information?', 'Self-attention is order-invariant on its own.'],
            ['What does an attention mask do for padded batches?', 'Sets padding positions to minus infinity before the softmax so they get zero weight.'],
          ],
          prereqs: ['Sequence-to-sequence with attention'],
        },
        {
          title: 'BERT and masked language modelling',
          description: 'Pretraining an encoder by predicting randomly masked tokens from both sides, the [CLS] and [SEP] conventions, next-sentence prediction, and the RoBERTa and DeBERTa refinements.',
          concepts: ['Masked language modelling objective', '[CLS], [SEP] and segment embeddings', 'RoBERTa training changes', 'DeBERTa disentangled attention'],
          quiz: [
            ['What fraction of tokens does BERT mask?', 'About 15 percent.'],
            ['What did RoBERTa drop from BERT pretraining?', 'Next-sentence prediction, while training longer with dynamic masking.'],
          ],
          prereqs: ['Self-attention for language'],
        },
        {
          title: 'GPT-style autoregressive models',
          description: 'Decoder-only transformers trained to predict the next token with a causal mask, why the same model handles many tasks through prompting, and how they differ from encoders for classification work.',
          concepts: ['Causal masking', 'Next-token prediction objective', 'In-context learning', 'Encoders versus decoders for tasks'],
          quiz: [
            ['What does the causal mask prevent?', 'A position attending to tokens that come after it.'],
            ['When is an encoder still preferable to a GPT-style model?', 'Cheap, high-accuracy classification and tagging with labelled data.'],
          ],
          prereqs: ['Self-attention for language'],
        },
        {
          title: 'Encoder-decoder transformers: T5 and BART',
          description: 'Full encoder-decoder models pretrained with span corruption (T5) or denoising (BART) that frame every task as text-to-text, the natural fit for summarisation and translation.',
          concepts: ['Text-to-text framing', 'T5 span corruption', 'BART denoising pretraining', 'Cross-attention from decoder to encoder'],
          quiz: [
            ['How does T5 express classification?', 'As generating the label text from a prefixed input string.'],
            ['Where does cross-attention appear?', 'In the decoder, attending over encoder outputs.'],
          ],
          prereqs: ['BERT and masked language modelling', 'GPT-style autoregressive models'],
        },
        {
          title: 'Sentence embeddings and Sentence-BERT',
          description: 'Why averaging BERT token vectors gives poor sentence similarity, how Sentence-BERT trains with siamese networks and contrastive objectives, and using sentence-transformers for semantic search and clustering.',
          concepts: ['Pooling strategies', 'Siamese training with contrastive loss', 'sentence-transformers library', 'Semantic search and clustering'],
          quiz: [
            ['Why not compare raw [CLS] vectors for similarity?', 'They are not trained to be comparable, so cosine scores are poor.'],
            ['What loss does SBERT commonly use?', 'MultipleNegativesRankingLoss or triplet loss on sentence pairs.'],
          ],
          prereqs: ['BERT and masked language modelling'],
        },
      ],
    },
    {
      title: 'Core NLP Tasks',
      description: 'The labelling and extraction problems that make up most applied NLP.',
      topics: [
        {
          title: 'Text classification',
          description: 'From TF-IDF baselines to a fine-tuned encoder with a classification head: label encoding, handling class imbalance, multi-label variants with sigmoid outputs, and measuring what actually matters.',
          concepts: ['Classification head on [CLS]', 'Multi-class versus multi-label', 'Class weights and imbalance', 'Threshold tuning'],
          quiz: [
            ['Which activation and loss for multi-label text?', 'Sigmoid outputs with binary cross-entropy per label.'],
            ['Why report macro F1 on imbalanced classes?', 'It weights every class equally, so minority classes are not hidden.'],
          ],
          prereqs: ['Linear classifiers for text', 'BERT and masked language modelling'],
        },
        {
          title: 'Sentiment analysis',
          description: 'Polarity and aspect-based sentiment, lexicon methods like VADER versus trained models, and the traps: negation, sarcasm, domain shift between product reviews and tweets.',
          concepts: ['Lexicon-based scoring with VADER', 'Aspect-based sentiment', 'Negation and sarcasm failures', 'Domain adaptation for sentiment'],
          quiz: [
            ['What is aspect-based sentiment?', 'Assigning polarity to specific aspects, like "battery" or "screen", within one review.'],
            ['Why does a model trained on movie reviews fail on tweets?', 'Vocabulary, length and style differ; this is domain shift.'],
          ],
          prereqs: ['Text classification'],
        },
        {
          title: 'Named entity recognition',
          description: 'Finding and typing spans such as people, organisations, dates and amounts; the BIO tagging scheme, token classification with transformers, and aligning subword predictions back to words.',
          concepts: ['Entity types and span boundaries', 'BIO and BILOU schemes', 'Token classification head', 'Aligning labels to subword tokens'],
          quiz: [
            ['What does B-ORG mean?', 'The first token of an organisation entity.'],
            ['How are labels assigned to subword pieces during fine-tuning?', 'Usually the first piece gets the label and the rest get -100 (ignored).'],
          ],
          prereqs: ['Text classification'],
        },
        {
          title: 'Sequence labelling and CRFs',
          description: 'Tagging every token in a sequence, why independent per-token predictions can produce invalid tag sequences, and how a conditional random field layer decodes the best globally consistent sequence with Viterbi.',
          concepts: ['Per-token prediction limits', 'Linear-chain CRF layer', 'Viterbi decoding', 'Transition constraints'],
          quiz: [
            ['What invalid sequence can a per-token tagger produce?', 'An I-PER tag directly after O with no preceding B-PER.'],
            ['What does Viterbi compute?', 'The single highest-scoring tag sequence under the CRF.'],
          ],
          prereqs: ['Named entity recognition'],
        },
        {
          title: 'Part-of-speech tagging and dependency parsing',
          description: 'Assigning grammatical categories and building dependency trees with spaCy, and why parse features still matter for rule-based extraction, negation scope and relation patterns.',
          concepts: ['Universal POS tags', 'Dependency relations and heads', 'spaCy parse tree navigation', 'Using parses for extraction rules'],
          quiz: [
            ['What is the head of a dependency arc?', 'The token that the dependent modifies or attaches to.'],
            ['How do you get a token\'s children in spaCy?', 'token.children.'],
          ],
          prereqs: ['Word and sentence tokenization'],
        },
        {
          title: 'Extractive question answering',
          description: 'Given a question and a passage, predicting start and end token positions of the answer span; the SQuAD format, handling unanswerable questions, and sliding windows over long contexts.',
          concepts: ['Start and end span prediction', 'SQuAD data format', 'Unanswerable questions', 'Long context striding'],
          quiz: [
            ['What two things does an extractive QA head output?', 'Logits for the answer start and end positions.'],
            ['How is "no answer" handled in SQuAD 2.0?', 'By predicting the span on the [CLS] token.'],
          ],
          prereqs: ['BERT and masked language modelling'],
        },
        {
          title: 'Information and relation extraction',
          description: 'Turning free text into structured records: entity linking to a knowledge base, relation classification between entity pairs, event and template extraction, and combining rules with models.',
          concepts: ['Entity linking and disambiguation', 'Relation classification', 'Pattern-based extraction with matchers', 'Building structured records from text'],
          quiz: [
            ['What does entity linking add over NER?', 'It maps a mention to a specific knowledge-base entry.'],
            ['Give an example relation triple.', '(Apple, founded_by, Steve Jobs).'],
          ],
          prereqs: ['Named entity recognition', 'Part-of-speech tagging and dependency parsing'],
        },
      ],
    },
    {
      title: 'Generation Tasks',
      description: 'Producing new text from an input: summaries, translations and the decoding that shapes them.',
      topics: [
        {
          title: 'Summarisation: extractive and abstractive',
          description: 'Extractive methods select and rank existing sentences (TextRank), abstractive models like BART and PEGASUS write new text; the hallucination risk of the latter and how input length limits force chunking.',
          concepts: ['TextRank sentence selection', 'Abstractive models: BART and PEGASUS', 'Faithfulness and hallucination', 'Chunking long documents'],
          quiz: [
            ['What is the main risk of abstractive summarisation?', 'Generating fluent content not supported by the source.'],
            ['What pretraining task does PEGASUS use?', 'Gap-sentence generation: predicting removed important sentences.'],
          ],
          prereqs: ['Encoder-decoder transformers: T5 and BART'],
        },
        {
          title: 'Machine translation',
          description: 'Neural translation with encoder-decoder transformers, multilingual models like mBART and NLLB, parallel corpora and back-translation for data, and the tokenization choices that make languages share a vocabulary.',
          concepts: ['Parallel corpora', 'Multilingual models and language tags', 'Back-translation augmentation', 'Shared vocabularies across languages'],
          quiz: [
            ['What is back-translation?', 'Translating monolingual target text to the source to create synthetic parallel data.'],
            ['What does NLLB stand for?', 'No Language Left Behind, a multilingual translation model family from Meta.'],
          ],
          prereqs: ['Encoder-decoder transformers: T5 and BART'],
        },
        {
          title: 'Decoding strategies',
          description: 'How the next token is chosen at generation time: greedy, beam search with length penalties, and sampling with temperature, top-k and nucleus (top-p), and why each suits different tasks.',
          concepts: ['Greedy decoding', 'Beam search and length penalty', 'Temperature and top-k sampling', 'Nucleus (top-p) sampling', 'Repetition penalties'],
          quiz: [
            ['Why does beam search favour short outputs?', 'Log-probabilities accumulate, so longer sequences score lower without a length penalty.'],
            ['What does temperature 0 do?', 'Makes sampling equivalent to greedy decoding.'],
          ],
          prereqs: ['GPT-style autoregressive models'],
        },
        {
          title: 'Handling long documents',
          description: 'Models have fixed input limits, so long inputs need striding, hierarchical processing or long-context architectures like Longformer; how to chunk, aggregate and keep the answer coherent.',
          concepts: ['Input length limits', 'Sliding window with overlap', 'Hierarchical summarisation', 'Longformer sparse attention'],
          quiz: [
            ['Why chunk with overlap?', 'So entities or sentences split at a boundary are seen whole in at least one chunk.'],
            ['How does Longformer scale to long inputs?', 'Sliding-window attention plus a few global tokens instead of full quadratic attention.'],
          ],
          prereqs: ['Summarisation: extractive and abstractive'],
        },
      ],
    },
    {
      title: 'Evaluation Metrics',
      description: 'Knowing whether a model is actually better, not just different.',
      topics: [
        {
          title: 'Precision, recall and F1 for NLP tasks',
          description: 'Computing per-class and averaged F1 for classification, entity-level F1 for NER with seqeval where a partially correct span counts as wrong, and why token accuracy is misleading on tagging.',
          concepts: ['Micro, macro and weighted averaging', 'Entity-level F1 with seqeval', 'Confusion matrix reading', 'Why token accuracy misleads'],
          quiz: [
            ['Why is token accuracy high but useless for NER?', 'Most tokens are O, so predicting O everywhere scores well.'],
            ['Does seqeval count a span with the right type but wrong boundary as correct?', 'No, the whole entity must match.'],
          ],
          prereqs: ['Named entity recognition'],
        },
        {
          title: 'BLEU for translation',
          description: 'Modified n-gram precision against reference translations with a brevity penalty, computed at corpus level with sacrebleu; what it rewards, what it misses, and why tokenization must be standardised.',
          concepts: ['Modified n-gram precision', 'Brevity penalty', 'Corpus-level BLEU with sacrebleu', 'Limits of BLEU'],
          quiz: [
            ['Why is there a brevity penalty?', 'Otherwise a very short output with correct words would score highly.'],
            ['Why use sacrebleu instead of your own implementation?', 'It fixes tokenization so scores are comparable across papers.'],
          ],
          prereqs: ['Machine translation'],
        },
        {
          title: 'ROUGE for summarisation',
          description: 'Recall-oriented overlap of n-grams (ROUGE-1, ROUGE-2) and longest common subsequence (ROUGE-L) between a summary and references; what it measures and why faithfulness needs other checks.',
          concepts: ['ROUGE-N recall', 'ROUGE-L and longest common subsequence', 'Computing ROUGE with rouge-score', 'ROUGE blind spots'],
          quiz: [
            ['What does ROUGE-2 count?', 'Bigram overlap between the candidate and the reference.'],
            ['Can a hallucinated summary score high on ROUGE?', 'Yes, if it shares many n-grams with the reference.'],
          ],
          prereqs: ['Summarisation: extractive and abstractive'],
        },
        {
          title: 'Perplexity, BERTScore and human evaluation',
          description: 'Perplexity as exponentiated cross-entropy for language models, embedding-based similarity with BERTScore, and designing human evaluations with clear rubrics and inter-annotator agreement.',
          concepts: ['Perplexity from cross-entropy', 'BERTScore', 'Human evaluation rubrics', 'Inter-annotator agreement with kappa'],
          quiz: [
            ['What does a perplexity of 20 mean?', 'On average the model is as uncertain as choosing among 20 equally likely tokens.'],
            ['What does Cohen\'s kappa measure?', 'Agreement between two annotators beyond chance.'],
          ],
          prereqs: ['N-gram features and language models'],
        },
      ],
    },
    {
      title: 'Hugging Face Ecosystem',
      description: 'The tools most NLP work actually runs on.',
      topics: [
        {
          title: 'The datasets library',
          description: 'Loading public and local datasets, Arrow-backed memory mapping, map and filter with batching, train/test splits, and streaming datasets that do not fit on disk.',
          concepts: ['load_dataset and the Hub', 'Arrow memory mapping', 'Batched map and filter', 'Streaming mode'],
          quiz: [
            ['Why is datasets.map(batched=True) faster?', 'The function receives batches and the tokenizer processes them in parallel Rust code.'],
            ['How do you use a dataset larger than disk?', 'load_dataset(..., streaming=True).'],
          ],
        },
        {
          title: 'AutoTokenizer and input encoding',
          description: 'Loading the tokenizer matched to a checkpoint, padding and truncation options, attention masks, return_offsets_mapping for span tasks, and handling text pairs for QA and NLI.',
          concepts: ['AutoTokenizer.from_pretrained', 'Padding, truncation and max_length', 'Offset mappings for spans', 'Encoding text pairs'],
          quiz: [
            ['Why must the tokenizer match the model checkpoint?', 'Token ids are only meaningful for the vocabulary the model was trained with.'],
            ['What does return_offsets_mapping give you?', 'Character start and end positions for each token.'],
          ],
          prereqs: ['WordPiece, SentencePiece and training a tokenizer'],
        },
        {
          title: 'Pipelines and AutoModel classes',
          description: 'The pipeline() shortcut for inference, the AutoModelFor* heads for classification, token classification, QA and seq2seq, and reading model cards to pick a checkpoint.',
          concepts: ['pipeline() for quick inference', 'AutoModelForSequenceClassification and friends', 'Reading model cards', 'Moving models to GPU'],
          quiz: [
            ['Which class loads a model for NER?', 'AutoModelForTokenClassification.'],
            ['What does pipeline("summarization") wrap?', 'A tokenizer, a seq2seq model and generation post-processing.'],
          ],
          prereqs: ['AutoTokenizer and input encoding'],
        },
        {
          title: 'Fine-tuning with the Trainer API',
          description: 'TrainingArguments, data collators, compute_metrics, evaluation strategy and checkpoints; learning rates and epochs that work for encoder fine-tuning, and when to write a plain PyTorch loop instead.',
          concepts: ['TrainingArguments essentials', 'Data collators with dynamic padding', 'compute_metrics callback', 'Checkpointing and early stopping', 'Learning rates for fine-tuning'],
          quiz: [
            ['Typical learning rate for fine-tuning BERT?', 'Between 2e-5 and 5e-5.'],
            ['What does DataCollatorWithPadding do?', 'Pads each batch to its longest example instead of a global maximum.'],
          ],
          prereqs: ['Pipelines and AutoModel classes', 'Text classification'],
        },
        {
          title: 'Parameter-efficient fine-tuning with PEFT',
          description: 'Training small adapter matrices (LoRA) instead of all weights, the peft library workflow, merging adapters for inference, and when full fine-tuning is still worth it.',
          concepts: ['LoRA adapters on attention weights', 'peft get_peft_model workflow', 'Merging adapters back', 'PEFT versus full fine-tuning'],
          quiz: [
            ['Roughly what fraction of parameters does LoRA train?', 'Often under 1 percent.'],
            ['Why merge a LoRA adapter before deployment?', 'To remove the extra matmul and serve a single standard model.'],
          ],
          prereqs: ['Fine-tuning with the Trainer API'],
        },
        {
          title: 'Sharing models on the Hub',
          description: 'push_to_hub for models and tokenizers, writing a model card with intended use, data and metrics, versioning with git-based revisions, and loading private models with tokens.',
          concepts: ['push_to_hub workflow', 'Writing a model card', 'Revisions and pinning versions', 'Private repos and access tokens'],
          quiz: [
            ['What should a model card include?', 'Intended use, training data, evaluation results and limitations.'],
            ['How do you load a specific model version?', 'Pass revision= with a commit hash or tag.'],
          ],
          prereqs: ['Fine-tuning with the Trainer API'],
        },
      ],
    },
    {
      title: 'Data and Production Concerns',
      description: 'The parts of NLP work that happen before and after training.',
      topics: [
        {
          title: 'Annotation and labelling text data',
          description: 'Writing annotation guidelines, using tools like Label Studio or doccano, measuring agreement, active learning to label the most useful examples, and weak supervision to bootstrap labels.',
          concepts: ['Annotation guidelines', 'Label Studio and doccano', 'Active learning selection', 'Weak supervision with labelling functions'],
          quiz: [
            ['Why write annotation guidelines before labelling?', 'So annotators make consistent decisions on ambiguous cases.'],
            ['What does active learning choose to label next?', 'Examples the model is most uncertain about.'],
          ],
        },
        {
          title: 'Multilingual and cross-lingual NLP',
          description: 'Models like XLM-R and mBERT that share one vocabulary across languages, zero-shot cross-lingual transfer, language detection, and the pitfalls of low-resource languages and script mixing.',
          concepts: ['XLM-R and shared multilingual vocabularies', 'Zero-shot cross-lingual transfer', 'Language identification', 'Low-resource language challenges'],
          quiz: [
            ['What is zero-shot cross-lingual transfer?', 'Fine-tuning on one language and applying to another with no labelled data.'],
            ['Which library does fast language detection?', 'fastText language identification or langdetect.'],
          ],
          prereqs: ['BERT and masked language modelling'],
        },
        {
          title: 'Inference optimisation for NLP models',
          description: 'Making fine-tuned models fast enough to serve: dynamic batching, ONNX Runtime export, int8 quantisation, distillation to DistilBERT-sized students, and measuring latency at the right percentile.',
          concepts: ['ONNX export and ONNX Runtime', 'Dynamic quantisation', 'Knowledge distillation', 'Latency percentiles and batching'],
          quiz: [
            ['What does knowledge distillation train?', 'A smaller student to match the outputs of a larger teacher.'],
            ['Why report p95 latency rather than the mean?', 'Users experience the tail; the mean hides slow requests.'],
          ],
          prereqs: ['Fine-tuning with the Trainer API'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: review sentiment classifier',
          description: 'Fine-tune a DistilBERT or RoBERTa classifier on a product-review dataset, compare it against a TF-IDF plus logistic regression baseline, report macro F1 and a confusion matrix, and expose it behind a small FastAPI endpoint.',
          concepts: ['Build the TF-IDF baseline', 'Fine-tune the encoder', 'Compare and analyse errors', 'Serve predictions'],
          quiz: [
            ['What must the baseline and the transformer share?', 'The exact same train and test split.'],
            ['Why inspect misclassified examples?', 'To find label noise, sarcasm and domain patterns metrics hide.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: résumé entity extractor',
          description: 'Annotate a few hundred résumés or job postings for skills, titles, companies and dates, fine-tune a token-classification model with BIO tags, evaluate with entity-level F1, and output structured JSON per document.',
          concepts: ['Define the entity schema and annotate', 'Align labels to subwords and train', 'Evaluate with seqeval', 'Emit structured JSON'],
          quiz: [
            ['Why does the annotation schema come first?', 'Inconsistent entity definitions make training labels contradictory.'],
            ['What is a reasonable minimum for a first NER model?', 'A few hundred annotated documents with clear guidelines.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: news summariser with evaluation',
          description: 'Fine-tune or prompt a seq2seq model to summarise news articles, chunk long inputs, score with ROUGE and a faithfulness check against the source, and build a small comparison page across decoding settings.',
          concepts: ['Prepare and chunk the corpus', 'Fine-tune or prompt the summariser', 'Score with ROUGE and faithfulness checks', 'Compare decoding settings'],
          quiz: [
            ['What does a faithfulness check add over ROUGE?', 'It flags claims not supported by the source.'],
            ['Which decoding setting usually gives more diverse summaries?', 'Sampling with a higher temperature or top-p.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: FAQ question-answering system',
          description: 'Index a company FAQ with sentence embeddings, retrieve the most similar passages for a question, run an extractive QA model over them, and return the answer with a confidence and source, with a no-answer path.',
          concepts: ['Embed and index the passages', 'Retrieve candidates', 'Extract answer spans', 'Handle no-answer cases'],
          quiz: [
            ['Why retrieve before running QA?', 'Extractive QA needs a short passage; retrieval narrows the candidates.'],
            ['How do you avoid confident wrong answers?', 'Threshold the span score and return no answer below it.'],
          ],
          style: 'project',
        },
        {
          title: 'NLP interview questions',
          description: 'The questions that come up: BPE versus WordPiece, why attention beat RNNs, BERT versus GPT, how to handle class imbalance in text, and what BLEU and ROUGE actually measure and miss.',
          concepts: ['Tokenization and embedding questions', 'Architecture comparison questions', 'Task and metric questions', 'Explaining trade-offs clearly'],
          quiz: [
            ['Why is BERT poor at text generation?', 'It is a bidirectional encoder trained on masked tokens, not next-token prediction.'],
            ['When would you still choose TF-IDF plus a linear model?', 'Small data, tight latency, or a strong enough baseline for the task.'],
          ],
          style: 'reading',
        },
        {
          title: 'Practical NLP coding exercises',
          description: 'Timed tasks interviewers actually set: implement BPE merges, compute TF-IDF by hand, write an evaluation for NER spans, tokenize and batch a dataset for a transformer, and debug a failing fine-tuning run.',
          concepts: ['Implement BPE from scratch', 'Hand-compute TF-IDF and cosine', 'Write an entity-level F1 scorer', 'Debug a fine-tuning run'],
          quiz: [
            ['What is the first thing to check when fine-tuning loss does not fall?', 'The learning rate and that labels are aligned with inputs.'],
            ['How do you compute idf for a term?', 'log of the document count divided by the documents containing the term, often with smoothing.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
