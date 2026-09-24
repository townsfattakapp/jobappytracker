import { defineTrack } from '../define'

export const featureEngineering = defineTrack({
  id: 'track-feature-engineering',
  title: 'Feature Engineering',
  description: 'Turning raw columns into signal a model can use: encoding categoricals, scaling and transforming numbers, date, text and aggregate features, selection, leakage discipline, scikit-learn pipelines and feature stores, ending in end-to-end projects.',
  family: 'Data Science',
  kind: 'domain',
  icon: '🧱',
  tags: ['feature engineering', 'scikit-learn', 'pandas', 'encoding', 'pipelines', 'feature selection', 'leakage'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-pandas'],
  style: 'practice',
  categories: [
    {
      title: 'Foundations and Discipline',
      description: 'What feature engineering changes about a model, and the rules that keep offline scores honest.',
      topics: [
        {
          title: 'What a feature is and why representation matters',
          description: 'A feature is any numeric view of a raw record that a model can weigh; the same data expressed as raw text, a count, or a ratio gives a linear model or a tree very different things to learn, so representation often beats algorithm choice.',
          concepts: ['Raw columns versus model inputs', 'Linear models need the right shape', 'Trees tolerate monotone transforms', 'Signal, noise and redundancy'],
          quiz: [
            ['Why can a feature matter more than the algorithm?', 'A model can only learn patterns its inputs expose; a good feature makes the pattern simple.'],
            ['Does log-transforming a feature help a decision tree?', 'Rarely; trees split on order, which a monotone transform does not change.'],
          ],
        },
        {
          title: 'Leakage and train/test discipline',
          description: 'Leakage is any information in a training feature that would not exist at prediction time, from target-derived columns to timestamps after the outcome; it inflates offline scores and collapses in production, so every feature is checked against the moment of prediction.',
          concepts: ['Target leakage through derived columns', 'Temporal leakage and future rows', 'Point-in-time correctness', 'Auditing suspiciously high scores'],
          quiz: [
            ['What is target leakage?', 'A feature that encodes the label or something only known after the label, so the model cheats offline.'],
            ['A churn model uses "days since account closed". What is wrong?', 'The value only exists after churn happened; it leaks the target.'],
            ['What does point-in-time correctness mean?', 'Each training row uses only data available at that row\'s prediction timestamp.'],
          ],
        },
        {
          title: 'Fitting transformers on training data only',
          description: 'Scalers, encoders and imputers learn statistics; computing them on the full dataset lets test rows influence training, so each transformer is fit on the training split and only applied to validation and test, which is exactly what a pipeline enforces.',
          concepts: ['fit versus transform', 'Statistics leak through the test split', 'Why pipelines prevent the mistake', 'Refit on all data before deployment'],
          quiz: [
            ['Why not call StandardScaler.fit on the whole dataset?', 'The test set\'s mean and variance would influence the training features, leaking information.'],
            ['When is it acceptable to fit on all labelled data?', 'For the final production model after the evaluation is finished.'],
          ],
          prereqs: ['Leakage and train/test discipline'],
        },
        {
          title: 'Imputation and missingness indicators',
          description: 'Missing values carry information as well as gaps: mean, median and mode imputation keep rows usable, KNN and iterative imputers borrow from similar rows, and a missing-indicator column lets the model learn that absence itself predicts the target.',
          concepts: ['Mean, median and mode imputation', 'KNN and iterative imputation', 'Missing indicator columns', 'Missingness that predicts the target'],
          quiz: [
            ['Why add a missing indicator alongside imputation?', 'The fact a value was missing may be predictive; imputation alone hides it.'],
            ['Which simple imputer is safest for skewed data?', 'The median, because it is not pulled by extreme values.'],
          ],
        },
      ],
    },
    {
      title: 'Encoding Categoricals',
      description: 'Getting strings into numbers without inventing order or exploding the column count.',
      topics: [
        {
          title: 'One-hot encoding',
          description: 'Each category becomes a binary column, which is exact and model-agnostic but multiplies width; handling unknown categories at inference, dropping one level for linear models and sparse output are the practical details that decide whether it works.',
          concepts: ['OneHotEncoder and sparse output', 'handle_unknown for unseen levels', 'Dummy trap and drop=first', 'Width blow-up with many levels'],
          quiz: [
            ['What does handle_unknown="ignore" do?', 'Encodes an unseen category as all zeros instead of raising.'],
            ['Why drop one column for linear regression?', 'The full set of dummies is perfectly collinear with the intercept.'],
          ],
        },
        {
          title: 'Ordinal and label encoding',
          description: 'Mapping categories to integers is compact and fine for trees, but implies an order; ordinal encoding with an explicit level list preserves real rankings like small/medium/large, while arbitrary integer codes mislead distance-based and linear models.',
          concepts: ['OrdinalEncoder with explicit categories', 'When integer codes are safe', 'Implied order and linear models', 'LabelEncoder is for targets'],
          quiz: [
            ['When is ordinal encoding the right choice?', 'When the categories have a genuine order, such as education level or size.'],
            ['Why is LabelEncoder not meant for features?', 'It is designed for the target column and assigns arbitrary order.'],
          ],
          prereqs: ['One-hot encoding'],
        },
        {
          title: 'Target encoding',
          description: 'Replacing a category with the mean of the target for that category compresses high-cardinality columns into one informative number, but it leaks the label unless done out-of-fold and smoothed toward the global mean for rare levels.',
          concepts: ['Category mean of the target', 'Smoothing toward the prior', 'Out-of-fold encoding to avoid leakage', 'TargetEncoder in scikit-learn'],
          quiz: [
            ['Why is naive target encoding leaky?', 'Each row\'s own label contributes to its feature value.'],
            ['How does smoothing help rare categories?', 'It blends the category mean with the global mean so a level with two rows is not trusted fully.'],
          ],
          prereqs: ['Leakage and train/test discipline'],
        },
        {
          title: 'Hashing trick',
          description: 'A hash function maps any category string to one of a fixed number of columns without a vocabulary, so memory is bounded and new levels need no refit; the cost is collisions and the loss of interpretability.',
          concepts: ['FeatureHasher and fixed width', 'Collisions and their effect', 'No vocabulary to store', 'Choosing the number of buckets'],
          quiz: [
            ['What is the main advantage of hashing over one-hot?', 'Fixed memory and no fitted vocabulary, so unseen values are handled for free.'],
            ['What happens when two categories collide?', 'They share one column and the model cannot tell them apart.'],
          ],
        },
        {
          title: 'Count and frequency encoding',
          description: 'Replacing a level with how often it appears turns rarity into a usable signal, is cheap to compute and leak-free, and pairs well with trees; it fails when two levels with equal counts should be distinguished.',
          concepts: ['Counts versus normalised frequency', 'Rarity as a signal', 'Ties between levels', 'Computing counts on train only'],
          quiz: [
            ['Is frequency encoding leaky?', 'Not with respect to the target, but counts should still come from the training data.'],
            ['What is the weakness of count encoding?', 'Different categories with the same frequency get the same value.'],
          ],
        },
        {
          title: 'Handling high cardinality and rare levels',
          description: 'Columns like zip code or product SKU have thousands of levels; grouping rare ones into "other", hierarchical rollups, target or count encoding, and entity embeddings each trade information for stability, and the choice depends on model type and inference constraints.',
          concepts: ['Rare-level grouping thresholds', 'Hierarchical rollups', 'Entity embeddings for categories', 'Choosing per model type'],
          quiz: [
            ['What does grouping rare levels achieve?', 'Fewer, better-supported categories so the model does not overfit to one-row levels.'],
            ['What is an entity embedding?', 'A learned dense vector per category, trained with a neural network.'],
          ],
          prereqs: ['Target encoding', 'Count and frequency encoding'],
        },
      ],
    },
    {
      title: 'Scaling and Numeric Transforms',
      description: 'Reshaping distributions so gradient-based and distance-based models behave.',
      topics: [
        {
          title: 'Standardisation and min-max scaling',
          description: 'StandardScaler centres to zero mean and unit variance, MinMaxScaler squashes to a range; both stop large-magnitude columns from dominating distance and gradient computations in k-NN, SVMs, logistic regression and neural networks.',
          concepts: ['StandardScaler and z-scores', 'MinMaxScaler and bounded ranges', 'Which models need scaling', 'Scaling and regularisation strength'],
          quiz: [
            ['Which models are insensitive to feature scaling?', 'Tree-based models such as random forests and gradient boosting.'],
            ['Why does scaling matter for L2-regularised regression?', 'The penalty treats all coefficients equally, so unscaled columns are penalised unevenly.'],
          ],
        },
        {
          title: 'Robust scaling and outliers',
          description: 'A single extreme value drags the mean and variance, so RobustScaler uses median and interquartile range; clipping, winsorising and rank-based scaling are the other tools for keeping a few outliers from warping every other row.',
          concepts: ['RobustScaler with median and IQR', 'Clipping and winsorising', 'Outliers in training versus serving', 'When to keep outliers'],
          quiz: [
            ['How does RobustScaler differ from StandardScaler?', 'It subtracts the median and divides by the interquartile range.'],
            ['What is winsorising?', 'Capping values beyond a percentile at that percentile instead of dropping them.'],
          ],
          prereqs: ['Standardisation and min-max scaling'],
        },
        {
          title: 'Log and power transforms',
          description: 'Skewed positives like income and page views become roughly symmetric under log1p, and Box-Cox or Yeo-Johnson learn the exponent that best normalises; this stabilises variance and makes linear relationships appear where multiplicative ones existed.',
          concepts: ['log1p for skewed positives', 'Box-Cox requires positive values', 'Yeo-Johnson handles zeros and negatives', 'PowerTransformer in pipelines'],
          quiz: [
            ['Why log1p instead of log?', 'log1p handles zeros and is numerically accurate for small values.'],
            ['When must you use Yeo-Johnson over Box-Cox?', 'When the data contains zero or negative values.'],
          ],
        },
        {
          title: 'Quantile and rank transforms',
          description: 'Mapping each value to its rank or quantile destroys magnitude but forces any distribution to uniform or normal, which tames heavy tails for distance-based models; QuantileTransformer does this while remembering the mapping for new rows.',
          concepts: ['Rank-based features', 'QuantileTransformer to uniform or normal', 'Losing magnitude information', 'Interpolation for unseen values'],
          quiz: [
            ['What does a quantile transform do to outliers?', 'It compresses them to the edge of the range, since only rank matters.'],
            ['When is losing magnitude a problem?', 'When the size of a value, not just its order, carries meaning for the target.'],
          ],
        },
        {
          title: 'Binning and discretisation',
          description: 'Cutting a continuous column into equal-width, equal-frequency or supervised bins lets linear models capture non-linear steps and makes thresholds explicit, at the cost of information inside each bin and sensitivity to edge placement.',
          concepts: ['Equal-width versus equal-frequency bins', 'KBinsDiscretizer strategies', 'Supervised binning with decision trees', 'Bins for linear models'],
          quiz: [
            ['Why bin a feature for logistic regression?', 'So the model can fit a different effect per range instead of one straight line.'],
            ['What is the risk of equal-width bins on skewed data?', 'Most rows land in one bin while others are nearly empty.'],
          ],
        },
      ],
    },
    {
      title: 'Date, Time and Text Features',
      description: 'Timestamps and free text hold most of the signal in real datasets; here is how to expose it.',
      topics: [
        {
          title: 'Calendar features from timestamps',
          description: 'Year, month, day of week, hour, is-weekend and holiday flags turn a datetime into columns a model can split on; extracting them from a pandas DatetimeIndex and aligning to the right time zone is a routine that pays off in almost every tabular problem.',
          concepts: ['dt accessor extractions', 'Weekend and holiday flags', 'Time zone alignment', 'Fiscal and business calendars'],
          quiz: [
            ['How do you get the day of week in pandas?', 'df["ts"].dt.dayofweek, with Monday as 0.'],
            ['Why convert to local time before extracting hour?', 'Hour of day patterns depend on where the event happened, not on UTC.'],
          ],
        },
        {
          title: 'Cyclical encoding of time',
          description: 'Hour 23 and hour 0 are neighbours, but integer encoding puts them far apart; mapping each cyclic feature to sine and cosine of its angle keeps the circle intact so distance-based and linear models see the wraparound.',
          concepts: ['Sine and cosine pairs', 'Period of hour, weekday, month', 'Why integers break the cycle', 'Trees and cyclical features'],
          quiz: [
            ['How do you encode hour of day cyclically?', 'sin(2*pi*hour/24) and cos(2*pi*hour/24) as two columns.'],
            ['Why two columns rather than one sine?', 'A single sine maps two different hours to the same value.'],
          ],
          prereqs: ['Calendar features from timestamps'],
        },
        {
          title: 'Elapsed time and recency features',
          description: 'Days since last purchase, account age and time until an event are often the strongest predictors; computing them requires a reference timestamp per row, and using the observation time rather than today keeps the features point-in-time correct.',
          concepts: ['Time since last event', 'Age and tenure at observation time', 'Time to next event', 'Reference timestamps per row'],
          quiz: [
            ['Why compute recency relative to the row timestamp, not now?', 'Using today leaks the future and makes training rows inconsistent with serving.'],
            ['What does account tenure capture?', 'How long an entity has existed, which correlates with loyalty and behaviour.'],
          ],
          prereqs: ['Leakage and train/test discipline'],
        },
        {
          title: 'Bag of words and TF-IDF',
          description: 'CountVectorizer turns documents into sparse term counts, and TF-IDF downweights words that appear everywhere so distinctive terms dominate; tokenisation, stop words, n-gram range and vocabulary limits are the settings that shape the matrix.',
          concepts: ['CountVectorizer and sparse matrices', 'TF-IDF weighting', 'n-gram ranges', 'min_df, max_df and vocabulary size'],
          quiz: [
            ['What does IDF downweight?', 'Terms that occur in many documents, since they discriminate poorly.'],
            ['What does ngram_range=(1, 2) produce?', 'Unigrams and bigrams as separate features.'],
          ],
        },
        {
          title: 'Text statistics and simple text features',
          description: 'Length, word count, punctuation ratio, uppercase share and keyword flags are cheap features that often add signal on top of TF-IDF, especially for spam, sentiment and quality tasks where style matters as much as vocabulary.',
          concepts: ['Length and count features', 'Character class ratios', 'Keyword and regex flags', 'Readability scores'],
          quiz: [
            ['Why add text length as a feature?', 'Length alone often correlates with quality, spam or effort.'],
            ['Give an example of a regex flag feature.', 'Whether the text contains a URL or a phone number.'],
          ],
        },
        {
          title: 'Text embeddings overview',
          description: 'Pretrained word and sentence embeddings map text to dense vectors that capture meaning, so similar phrasings land close together; averaging word vectors or using a sentence-transformer gives a fixed-width feature block that downstream models consume.',
          concepts: ['Word vectors and averaging', 'Sentence-transformer embeddings', 'Dense versus sparse text features', 'Dimensionality and downstream models'],
          quiz: [
            ['What does an embedding give you that TF-IDF does not?', 'Semantic similarity between different words and phrasings.'],
            ['How do you get one vector for a whole sentence?', 'Use a sentence encoder or average the word vectors.'],
          ],
          prereqs: ['Bag of words and TF-IDF'],
        },
      ],
    },
    {
      title: 'Interactions and Aggregations',
      description: 'Features built from combinations of columns and from groups of rows.',
      topics: [
        {
          title: 'Interaction and polynomial features',
          description: 'Products and powers of columns let linear models express that the effect of one variable depends on another; PolynomialFeatures generates them systematically, and regularisation keeps the resulting explosion of columns in check.',
          concepts: ['Pairwise products as interactions', 'PolynomialFeatures and degree', 'interaction_only flag', 'Combinatorial growth and regularisation'],
          quiz: [
            ['What does an interaction term x1*x2 model?', 'That the effect of x1 changes with the level of x2.'],
            ['How many features does degree 2 on 10 inputs create?', '66 including the bias, 65 without it.'],
          ],
        },
        {
          title: 'Ratios, differences and domain arithmetic',
          description: 'Debt-to-income, price per square metre and clicks per impression are hand-built features that encode domain knowledge in one column; they usually beat leaving the raw parts for the model to combine.',
          concepts: ['Ratios that normalise scale', 'Differences and deltas', 'Guarding division by zero', 'Encoding domain rules'],
          quiz: [
            ['Why is price per square metre better than price and area separately?', 'It directly encodes the relationship a model would otherwise have to learn.'],
            ['How do you handle division by zero in a ratio feature?', 'Add a small epsilon or set the result to a sentinel and add a flag.'],
          ],
        },
        {
          title: 'Group aggregations',
          description: 'Summarising rows by an entity, such as mean spend per customer or count of orders per store, creates features at the level the prediction is made; pandas groupby with transform broadcasts the statistic back onto every row.',
          concepts: ['groupby agg versus transform', 'Mean, count, std per group', 'Deviation from group mean', 'Aggregations over training rows only'],
          quiz: [
            ['What does groupby(...).transform("mean") return?', 'A series aligned to the original rows, each holding its group mean.'],
            ['Why express a value as deviation from its group mean?', 'It separates the entity effect from the individual effect.'],
          ],
        },
        {
          title: 'Window, lag and rolling features',
          description: 'For ordered data, the previous value, the rolling 7-day mean and the expanding maximum turn history into columns; shifting by at least one step keeps the current row from seeing itself and preserves point-in-time correctness.',
          concepts: ['shift for lag features', 'rolling and expanding windows', 'Shifting before rolling', 'Per-entity windows with groupby'],
          quiz: [
            ['Why shift before computing a rolling mean?', 'So the window excludes the current row and does not leak its own value.'],
            ['How do you compute a per-customer rolling sum?', 'groupby("customer")["amount"].transform(lambda s: s.shift(1).rolling(7).sum()).'],
          ],
          prereqs: ['Group aggregations', 'Elapsed time and recency features'],
        },
        {
          title: 'Entity features from event logs',
          description: 'Raw clickstreams and transactions must be rolled up to one row per entity per snapshot: counts in windows, last-N behaviour, first and last events, and diversity measures like distinct products, all computed as of the snapshot date.',
          concepts: ['Snapshot dates and observation windows', 'Counts in trailing windows', 'Distinct and diversity measures', 'First and last event features'],
          quiz: [
            ['What is a snapshot date?', 'The moment at which features are computed, using only events before it.'],
            ['Why build multiple window lengths?', 'Short windows capture recent change; long windows capture habit.'],
          ],
          prereqs: ['Window, lag and rolling features'],
        },
      ],
    },
    {
      title: 'Feature Selection',
      description: 'Keeping the features that help and removing the ones that only add noise, cost and variance.',
      topics: [
        {
          title: 'Filter methods',
          description: 'Ranking features by a statistic computed independently of the model, such as variance, correlation with the target, chi-square or mutual information, is fast and model-agnostic but ignores interactions between features.',
          concepts: ['Variance threshold', 'Correlation and mutual information', 'SelectKBest and scoring functions', 'Blind to interactions'],
          quiz: [
            ['What does mutual information capture that correlation misses?', 'Non-linear dependence between a feature and the target.'],
            ['What is the main limitation of filter methods?', 'They score features one at a time and miss combinations.'],
          ],
        },
        {
          title: 'Wrapper methods',
          description: 'Recursive feature elimination and sequential forward or backward selection train the model repeatedly on subsets and keep what improves validation score; they respect interactions but cost many fits and can overfit the selection.',
          concepts: ['Recursive feature elimination', 'Sequential forward and backward selection', 'Cross-validated selection with RFECV', 'Cost and selection overfitting'],
          quiz: [
            ['How does RFE decide what to drop?', 'It fits, removes the least important feature, and repeats.'],
            ['Why should wrapper selection use cross-validation?', 'Choosing features on one split overfits that split.'],
          ],
          prereqs: ['Filter methods'],
        },
        {
          title: 'Embedded methods',
          description: 'L1-regularised models zero out coefficients and tree ensembles report split importance, so selection happens inside training; SelectFromModel wraps either into a reusable pipeline step.',
          concepts: ['Lasso and sparse coefficients', 'Tree impurity importance', 'SelectFromModel thresholds', 'Bias toward high-cardinality features'],
          quiz: [
            ['Why does L1 regularisation select features?', 'The penalty drives small coefficients exactly to zero.'],
            ['What biases impurity importance?', 'Features with many unique values get more split opportunities.'],
          ],
        },
        {
          title: 'Permutation importance and stability',
          description: 'Shuffling one feature and measuring the drop in validation score gives a model-agnostic importance that is robust to cardinality bias; repeating across folds shows which features are consistently useful rather than lucky.',
          concepts: ['Permutation importance on held-out data', 'Correlated features share importance', 'Stability across folds', 'Importance is not causation'],
          quiz: [
            ['Why compute permutation importance on validation data?', 'Training data rewards memorised features; validation shows generalisable ones.'],
            ['What happens to permutation importance of two identical features?', 'Each looks unimportant because the other covers for it.'],
          ],
          prereqs: ['Embedded methods'],
        },
        {
          title: 'Multicollinearity and redundant features',
          description: 'Highly correlated features destabilise linear coefficients and dilute importance scores; correlation matrices, variance inflation factor and hierarchical clustering of features identify groups from which one representative is kept.',
          concepts: ['Correlation matrix pruning', 'Variance inflation factor', 'Clustering correlated features', 'Effect on coefficients and importance'],
          quiz: [
            ['What VIF value is usually considered problematic?', 'Above about 5 to 10.'],
            ['Does multicollinearity hurt prediction accuracy?', 'Usually little; it hurts coefficient interpretation and stability.'],
          ],
        },
      ],
    },
    {
      title: 'Pipelines and Production',
      description: 'Packaging feature logic so training and serving run the same code.',
      topics: [
        {
          title: 'The scikit-learn transformer API',
          description: 'Every transformer exposes fit, transform and fit_transform, and get_feature_names_out reports the columns it produced; understanding this contract is what lets encoders, scalers and selectors snap together into one estimator.',
          concepts: ['fit, transform, fit_transform', 'get_feature_names_out', 'Stateless versus stateful transformers', 'set_output to pandas'],
          quiz: [
            ['What does set_output(transform="pandas") change?', 'Transformers return DataFrames with column names instead of arrays.'],
            ['Which method learns parameters from data?', 'fit; transform only applies them.'],
          ],
          prereqs: ['Fitting transformers on training data only'],
        },
        {
          title: 'Pipeline composition',
          description: 'Pipeline chains transformers and a final estimator so fit and predict run every step in order; it prevents leakage in cross-validation, makes hyperparameter search cover preprocessing, and gives one object to save and deploy.',
          concepts: ['Pipeline steps and naming', 'Cross-validating the whole pipeline', 'Grid search over step parameters', 'Persisting one object'],
          quiz: [
            ['How do you refer to a step parameter in GridSearchCV?', 'With a double underscore, e.g. scaler__with_mean.'],
            ['Why does a pipeline prevent leakage in cross-validation?', 'Each fold refits the transformers on its own training portion.'],
          ],
          prereqs: ['The scikit-learn transformer API'],
        },
        {
          title: 'ColumnTransformer for mixed types',
          description: 'Real tables mix numbers, categories and text; ColumnTransformer routes each column group to its own transformer and concatenates the results, with remainder handling and column selectors for dtype-based routing.',
          concepts: ['Routing columns by name or dtype', 'remainder passthrough or drop', 'make_column_selector', 'Sparse and dense output mixing'],
          quiz: [
            ['What does remainder="passthrough" do?', 'Columns not listed are appended unchanged.'],
            ['How do you select all object columns automatically?', 'make_column_selector(dtype_include=object).'],
          ],
          prereqs: ['Pipeline composition'],
        },
        {
          title: 'Custom transformers and FunctionTransformer',
          description: 'Domain arithmetic and log features are wrapped in FunctionTransformer or a class inheriting BaseEstimator and TransformerMixin, so hand-written logic gets the same fit and transform contract and rides inside pipelines and searches.',
          concepts: ['FunctionTransformer for stateless steps', 'BaseEstimator and TransformerMixin', 'Storing learned state with trailing underscore', 'Testing a custom transformer'],
          quiz: [
            ['When is FunctionTransformer enough?', 'When the step needs no fitted state, like taking a log or a ratio.'],
            ['What naming convention marks fitted attributes?', 'A trailing underscore, such as means_.'],
          ],
          prereqs: ['The scikit-learn transformer API'],
        },
        {
          title: 'Feature stores overview',
          description: 'A feature store centralises feature definitions, computes them once for training and serving, and provides point-in-time joins so historical rows get the values that existed at the time; it solves consistency, reuse and freshness across teams.',
          concepts: ['Offline and online stores', 'Point-in-time joins', 'Feature definitions as code', 'When a store is overkill'],
          quiz: [
            ['What problem does an online store solve?', 'Low-latency lookup of the latest feature values at prediction time.'],
            ['Why is a point-in-time join essential for training data?', 'It prevents features computed after the label from leaking into rows.'],
          ],
          prereqs: ['Leakage and train/test discipline'],
        },
        {
          title: 'Training-serving skew and feature monitoring',
          description: 'When serving code recomputes features differently from training, predictions drift silently; sharing the pipeline object, logging served features, and comparing their distributions to training data catch skew and upstream changes early.',
          concepts: ['Sources of training-serving skew', 'Logging served feature values', 'Distribution comparison and drift alerts', 'Schema checks on inputs'],
          quiz: [
            ['What is the simplest way to avoid training-serving skew?', 'Serve the exact fitted pipeline used in training.'],
            ['What is a population stability index used for?', 'Measuring how much a feature\'s distribution has shifted between two periods.'],
          ],
          prereqs: ['Feature stores overview'],
        },
      ],
    },
    {
      title: 'Domain-Specific Features',
      description: 'Feature patterns that recur in particular data types and industries.',
      topics: [
        {
          title: 'Customer and transaction features (RFM)',
          description: 'Recency, frequency and monetary value summarise a purchase history in three numbers that predict churn, lifetime value and campaign response; extending them with trend, variability and product mix features covers most retail and subscription models.',
          concepts: ['Recency, frequency, monetary', 'Spend trend and variability', 'Product mix and category shares', 'Subscription and tenure features'],
          quiz: [
            ['What does the F in RFM measure?', 'How many purchases the customer made in the window.'],
            ['Why add a spend trend feature?', 'Declining spend often signals churn before a customer stops entirely.'],
          ],
          prereqs: ['Entity features from event logs'],
        },
        {
          title: 'Geospatial features',
          description: 'Latitude and longitude alone mean little to a model; haversine distance to landmarks, geohash cells, neighbourhood aggregates and density counts turn coordinates into features that capture location effects.',
          concepts: ['Haversine distance to points of interest', 'Geohash and grid cells', 'Neighbourhood aggregates', 'Density within a radius'],
          quiz: [
            ['Why not feed raw latitude and longitude to a linear model?', 'Location effects are not linear in coordinates.'],
            ['What is a geohash?', 'A string encoding of a rectangular map cell, where prefixes give coarser cells.'],
          ],
        },
        {
          title: 'Image and signal features overview',
          description: 'Before deep learning, images were summarised by colour histograms and edge descriptors and signals by spectral power; today a pretrained convolutional network or audio model produces embedding vectors that tabular models consume alongside other features.',
          concepts: ['Colour histograms and edge descriptors', 'Spectral features from signals', 'Pretrained network embeddings', 'Combining with tabular columns'],
          quiz: [
            ['What is transfer learning as a feature extractor?', 'Using a pretrained network\'s penultimate layer output as a fixed feature vector.'],
            ['What does an FFT give you for a signal?', 'Its energy at each frequency, usable as features.'],
          ],
          prereqs: ['Text embeddings overview'],
        },
        {
          title: 'User-item features for recommendation',
          description: 'Recommenders combine user history, item metadata and their crossing: user affinity to a category, item popularity in the last week, co-occurrence counts, and matrix-factorisation embeddings as features for a ranking model.',
          concepts: ['User affinity scores', 'Item popularity in windows', 'Co-occurrence and cross features', 'Factorisation embeddings as inputs'],
          quiz: [
            ['What is a cross feature in recommendation?', 'A feature built from a user attribute and an item attribute together, like user_country x item_genre.'],
            ['Why use windowed item popularity?', 'Popularity changes quickly; recent counts reflect current demand.'],
          ],
          prereqs: ['Customer and transaction features (RFM)'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: churn feature pipeline from event logs',
          description: 'Build a point-in-time feature pipeline from a transactions and sessions log: monthly snapshots, RFM and windowed activity features, categorical encodings inside a ColumnTransformer, and a leakage audit that proves no feature uses post-snapshot data.',
          concepts: ['Define snapshots and labels', 'Compute windowed entity features', 'Assemble the ColumnTransformer', 'Audit for leakage and document'],
          quiz: [
            ['How do you prove a feature is leak-free?', 'Show every input event timestamp is before the snapshot date.'],
            ['Why monthly snapshots rather than one row per customer?', 'They give many training examples per customer and reflect changing behaviour.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: house price feature engineering study',
          description: 'On a housing dataset, compare feature sets for a linear model and gradient boosting: log targets, ratio features, neighbourhood target encoding, distance features, and polynomial terms, with cross-validated results in a comparison table.',
          concepts: ['Baseline with raw features', 'Add transforms and ratios', 'Encode neighbourhood safely', 'Compare per model type'],
          quiz: [
            ['Why log-transform the price target?', 'Errors become relative and the distribution of residuals is more symmetric.'],
            ['Which feature set should help the linear model most?', 'Transforms and interactions, since it cannot learn non-linearity itself.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: text and metadata classifier',
          description: 'Classify product reviews or support tickets using TF-IDF, text statistics, sentence embeddings and metadata columns combined in one ColumnTransformer, and measure how much each feature block contributes with ablations.',
          concepts: ['Build the text feature blocks', 'Join metadata columns', 'Run feature block ablations', 'Report the best combination'],
          quiz: [
            ['What is an ablation study?', 'Removing one feature block at a time to measure its contribution.'],
            ['Why keep TF-IDF sparse in the ColumnTransformer?', 'Densifying tens of thousands of columns wastes memory.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: feature selection benchmark',
          description: 'On a wide dataset with hundreds of columns, compare filter, wrapper, embedded and permutation selection under the same cross-validation, plotting score against feature count and reporting which features every method agrees on.',
          concepts: ['Set up the shared evaluation', 'Run each selection method', 'Plot score versus feature count', 'Report stable features'],
          quiz: [
            ['Why must selection run inside each fold?', 'Selecting on all data lets validation rows influence the chosen features.'],
            ['What does agreement across methods suggest?', 'The feature carries genuine signal rather than being an artefact of one method.'],
          ],
          style: 'project',
        },
        {
          title: 'Feature engineering interview questions',
          description: 'The questions that recur: how to encode a column with ten thousand levels, how to spot leakage, when scaling matters, target encoding pitfalls, and how to design features for a churn or fraud problem from scratch.',
          concepts: ['Encoding decision questions', 'Leakage scenario questions', 'Designing features for a case', 'Explaining trade-offs clearly'],
          quiz: [
            ['How would you encode a zip code column?', 'Target or count encoding, hierarchical rollups, or grouping rare codes, depending on model and cardinality.'],
            ['Your validation AUC is 0.99 on a hard problem. First check?', 'Leakage: look for features derived from or dated after the target.'],
          ],
          style: 'reading',
        },
        {
          title: 'Hands-on feature engineering exercises',
          description: 'Timed exercises in the style of a take-home: build a ColumnTransformer for a mixed table, write a leak-free lag feature with groupby, implement smoothed target encoding out-of-fold, and explain each choice in comments.',
          concepts: ['Mixed-type preprocessing under time', 'Lag features with groupby and shift', 'Out-of-fold target encoding by hand', 'Commenting design choices'],
          quiz: [
            ['Write the pandas for a one-step lag per group.', 'df.groupby("id")["x"].shift(1)'],
            ['What must a hand-rolled target encoder do per fold?', 'Compute category means on the other folds only, then apply to the held-out fold.'],
          ],
        },
      ],
    },
  ],
})
