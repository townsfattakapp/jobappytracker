import { defineTrack } from '../define'

export const dataCleaning = defineTrack({
  id: 'track-data-cleaning',
  title: 'Data Cleaning',
  description: 'Turning raw exports into trustworthy tables: profiling, missing data mechanisms and imputation, duplicates and entity resolution, outliers, dates, numbers and currencies, text and category normalisation, units and cross-field checks, schema validation with pandera and Great Expectations, and pipelines you can rerun and explain.',
  family: 'Data Science',
  kind: 'domain',
  icon: '🧹',
  tags: ['data cleaning', 'data quality', 'missing data', 'validation', 'pandas', 'pandera'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-pandas'],
  style: 'practice',
  categories: [
    {
      title: 'Profiling Raw Data',
      description: 'Finding out what you actually received before changing anything.',
      topics: [
        {
          title: 'The first look at a raw file',
          description: 'Before pandas: open the file in a text viewer, check the encoding, delimiter, header rows, quoting and line endings, count rows with a shell tool, and look at the last lines. Half of all load failures are visible in the first hundred bytes.',
          concepts: ['Inspecting bytes and encoding', 'Delimiters, quoting and header rows', 'Row counts before and after load', 'Comparing to the data provider description'],
          quiz: [
            ['Why look at the end of a file as well as the head?', 'Trailing summary rows, footers and truncated lines live there.'],
            ['What does a byte order mark do to the first column name?', 'It prefixes it with an invisible character so lookups by name fail.'],
          ],
        },
        {
          title: 'Column-level profiling',
          description: 'For every column: dtype as loaded versus intended, null count, distinct count, min, max, most common values and a sample of odd ones. A one-screen profile table per dataset catches most problems before they hit a model.',
          concepts: ['Loaded versus intended dtype', 'Null and distinct counts', 'Value ranges and top values', 'Building a profile table function'],
          quiz: [
            ['Which pandas call gives non-null counts and dtypes together?', 'df.info()'],
            ['What does a numeric column loaded as object usually mean?', 'Some values are non-numeric: units, commas, placeholders or blanks.'],
          ],
          prereqs: ['The first look at a raw file'],
        },
        {
          title: 'Cardinality, keys and grain',
          description: 'Which columns identify a row, whether the supposed key is unique, and what one row represents (an order, an order line, a daily snapshot). Getting the grain wrong makes every later aggregation double count.',
          concepts: ['Identifying candidate keys', 'Checking uniqueness of keys', 'Row grain and what one row means', 'High-cardinality columns'],
          quiz: [
            ['How do you test whether order_id is a key?', 'df["order_id"].is_unique, or compare nunique to len.'],
            ['Why does joining a per-line table to a per-order table double count?', 'Each order row matches several line rows.'],
          ],
          prereqs: ['Column-level profiling'],
        },
        {
          title: 'Automated profiling reports',
          description: 'ydata-profiling, sweetviz and D-Tale generate interactive reports with distributions, correlations, missingness and warnings in one call. They are a starting checklist, not a substitute for reading the columns yourself.',
          concepts: ['Generating a ydata-profiling report', 'Reading the warnings section', 'Correlation and missingness panels', 'Limits of automated reports'],
          quiz: [
            ['What warning types does a profiling report raise?', 'High cardinality, high correlation, skew, constant columns, missing values and duplicates.'],
            ['Why sample a huge frame before profiling?', 'Full reports on millions of rows are slow and the summary rarely changes.'],
          ],
          prereqs: ['Column-level profiling'],
        },
      ],
    },
    {
      title: 'Missing Data',
      topics: [
        {
          title: 'Missingness mechanisms: MCAR, MAR and MNAR',
          description: 'Values missing completely at random can be dropped safely; missing at random depends on other observed columns and can be imputed from them; missing not at random depends on the hidden value itself and biases everything unless modelled.',
          concepts: ['MCAR and safe deletion', 'MAR and conditional imputation', 'MNAR and unavoidable bias', 'Diagnosing the mechanism'],
          quiz: [
            ['Income missing more often for high earners is which mechanism?', 'MNAR, the missingness depends on the value itself.'],
            ['Which mechanism does a random sensor dropout suggest?', 'MCAR.'],
          ],
        },
        {
          title: 'Visualising and testing missingness',
          description: 'Missingness matrices and heatmaps from missingno show whether gaps cluster by row, column or time, and comparing other columns between rows with and without the value tests whether missingness is related to them.',
          concepts: ['Missingness matrix and bar plots', 'Co-occurrence of missing columns', 'Comparing groups with and without values', 'Missingness over time'],
          quiz: [
            ['What does a vertical band in a missingness matrix mean?', 'A column that is missing across a run of rows, often a source or time-range issue.'],
            ['How do you test if age missingness relates to class?', 'Compare class distributions for rows with and without age, for example with a chi-square test.'],
          ],
          prereqs: ['Missingness mechanisms: MCAR, MAR and MNAR'],
        },
        {
          title: 'Deletion strategies',
          description: 'Listwise deletion drops any row with a gap and can throw away most of a dataset; column deletion removes fields that are mostly empty; pairwise deletion uses what exists per calculation. Each is a bias and sample-size trade-off.',
          concepts: ['Listwise and pairwise deletion', 'Dropping mostly-empty columns', 'Thresholds for dropping', 'Bias introduced by deletion'],
          quiz: [
            ['When is listwise deletion acceptable?', 'When data are MCAR and the loss is small.'],
            ['Drop columns more than 60% empty?', 'df.dropna(axis=1, thresh=int(0.4 * len(df))).'],
          ],
          prereqs: ['Missingness mechanisms: MCAR, MAR and MNAR'],
        },
        {
          title: 'Simple imputation',
          description: 'Mean, median and mode fills, constant sentinels with an indicator column, forward and backward fills for ordered data, and group-wise fills that respect structure. Always add a was_missing flag so models can use the information.',
          concepts: ['Mean, median and mode fills', 'Group-wise imputation', 'Forward and backward fills', 'Missing indicator columns'],
          quiz: [
            ['Why prefer the median over the mean for skewed columns?', 'The mean is pulled by outliers and would fill unrealistic values.'],
            ['Why add an indicator column when imputing?', 'Missingness itself may be predictive and the fill hides it otherwise.'],
          ],
          prereqs: ['Deletion strategies'],
        },
        {
          title: 'Model-based imputation',
          description: 'KNNImputer fills from similar rows, IterativeImputer models each column from the others in rounds, and multiple imputation keeps uncertainty by producing several completed datasets. Fit imputers on training data only to avoid leakage.',
          concepts: ['KNNImputer', 'IterativeImputer', 'Multiple imputation idea', 'Fitting imputers without leakage'],
          quiz: [
            ['Why fit the imputer only on the training set?', 'Fitting on all data leaks test information into the fills.'],
            ['What does IterativeImputer do in one round?', 'Predicts each column with missing values from the other columns, then repeats.'],
          ],
          prereqs: ['Simple imputation'],
        },
      ],
    },
    {
      title: 'Duplicates and Entity Resolution',
      topics: [
        {
          title: 'Exact duplicates',
          description: 'duplicated and drop_duplicates with subset and keep find repeated rows or repeated keys; the harder question is why they exist: re-exported batches, retries, or a grain misunderstanding. Count before dropping and keep the most complete copy.',
          concepts: ['duplicated and drop_duplicates', 'Duplicates on a key subset', 'Choosing which copy to keep', 'Diagnosing why duplicates exist'],
          quiz: [
            ['Keep the most recently updated of duplicate ids?', 'Sort by updated_at then drop_duplicates("id", keep="last").'],
            ['What does duplicated(keep=False) mark?', 'Every copy of a duplicated row, including the first.'],
          ],
        },
        {
          title: 'Near-duplicates',
          description: 'Rows that differ only by whitespace, case, punctuation or a trailing zero are duplicates in meaning. Normalising a comparison key, rounding numbers and hashing the result reveals them without changing the stored values.',
          concepts: ['Building a normalised comparison key', 'Rounding and trimming before comparison', 'Hashing rows to find repeats', 'Reviewing near-duplicate clusters'],
          quiz: [
            ['Why normalise into a separate key column rather than overwrite?', 'You keep the original values for audit and display.'],
            ['Which normalisations catch most near-duplicate names?', 'Lowercase, strip, collapse whitespace and remove punctuation.'],
          ],
          prereqs: ['Exact duplicates'],
        },
        {
          title: 'Fuzzy string matching',
          description: 'Levenshtein, Jaro-Winkler and token-set ratios from rapidfuzz score how similar two strings are, so "Jon Smith Ltd" and "John Smith Limited" can be matched with a threshold. Phonetic keys catch spelling variants of names.',
          concepts: ['Edit distance and Jaro-Winkler', 'Token-based ratios', 'Choosing a similarity threshold', 'Phonetic encodings like Soundex'],
          quiz: [
            ['Which ratio handles reordered words well?', 'Token set or token sort ratio.'],
            ['Why check matches near the threshold by hand?', 'That is where false merges concentrate; the threshold is a guess until validated.'],
          ],
          prereqs: ['Near-duplicates'],
        },
        {
          title: 'Record linkage and blocking',
          description: 'Matching records across sources compares candidate pairs on several fields; blocking on a cheap key such as postcode keeps the pair count manageable. The recordlinkage and splink libraries implement this with probabilistic scoring.',
          concepts: ['Candidate pairs and blocking keys', 'Comparing fields with per-field scores', 'Probabilistic matching', 'Clustering matches into entities'],
          quiz: [
            ['Why block before comparing?', 'Comparing all pairs is quadratic; blocking reduces it to pairs sharing a key.'],
            ['What is the risk of a blocking key that is often wrong?', 'True matches in different blocks are never compared.'],
          ],
          prereqs: ['Fuzzy string matching'],
        },
      ],
    },
    {
      title: 'Outliers',
      topics: [
        {
          title: 'Univariate outlier detection',
          description: 'z-scores flag values many standard deviations out but are distorted by the outliers themselves; the IQR rule and the median absolute deviation are robust. Plot the distribution first: some "outliers" are the real signal.',
          concepts: ['z-score thresholds and their weakness', 'IQR fences', 'Median absolute deviation', 'Plotting before flagging'],
          quiz: [
            ['Why can z-scores miss outliers?', 'Extreme values inflate the standard deviation, masking themselves.'],
            ['Which rule is robust to the outliers it is looking for?', 'The IQR fence or MAD, both based on medians and quartiles.'],
          ],
        },
        {
          title: 'Multivariate outlier detection',
          description: 'A 1.9 m tall person weighing 45 kg is normal on each axis and impossible together. Mahalanobis distance, Isolation Forest and Local Outlier Factor score rows by their joint unusualness.',
          concepts: ['Joint versus marginal outliers', 'Mahalanobis distance', 'Isolation Forest', 'Local Outlier Factor'],
          quiz: [
            ['Why does Isolation Forest isolate outliers quickly?', 'Random splits separate rare, distant points in few steps.'],
            ['What assumption does Mahalanobis distance make?', 'Roughly elliptical (multivariate normal) data.'],
          ],
          prereqs: ['Univariate outlier detection'],
        },
        {
          title: 'Treating outliers',
          description: 'Options are remove, cap (winsorise), transform (log), flag and keep, or fix if the value is a known error. The choice depends on whether the value is impossible, implausible or merely rare, and on the downstream use.',
          concepts: ['Impossible versus implausible versus rare', 'Winsorising and capping', 'Log transforms', 'Flag-and-keep strategy'],
          quiz: [
            ['A trip distance of 0 with a 40 dollar fare: remove or keep?', 'Investigate: likely a GPS failure, so fix or flag rather than silently remove.'],
            ['What does winsorising at 1% and 99% do?', 'Replaces values beyond those percentiles with the percentile values.'],
          ],
          prereqs: ['Multivariate outlier detection'],
        },
        {
          title: 'Domain rules and plausibility checks',
          description: 'Statistics cannot know that ages above 120 or negative prices are wrong; domain rules can. Encode them as explicit range and relationship checks that run on every load and report violation counts by source.',
          concepts: ['Hard ranges from the domain', 'Soft plausibility ranges', 'Rules as reusable check functions', 'Reporting violations by source'],
          quiz: [
            ['Why encode ranges as code rather than clean them once?', 'The next export will contain the same errors; checks catch them automatically.'],
            ['Hard or soft rule: delivery date before order date?', 'Hard; it is impossible and signals a data error.'],
          ],
          prereqs: ['Treating outliers'],
        },
      ],
    },
    {
      title: 'Types and Parsing',
      topics: [
        {
          title: 'Parsing dates and times',
          description: 'Mixed formats, day-month ambiguity, two-digit years, time zones and Excel serial dates all arrive in one column. Parse with explicit formats per pattern, coerce failures to NaT, and inspect what failed instead of trusting inference.',
          concepts: ['Explicit formats per pattern', 'Day-first versus month-first ambiguity', 'Excel serial dates', 'Inspecting parse failures'],
          quiz: [
            ['How do you convert Excel serial 45000 to a date?', 'pd.Timestamp("1899-12-30") + pd.to_timedelta(45000, "D").'],
            ['Why not rely on dayfirst inference?', '03/04/2024 is ambiguous; inference guesses per value and can mix conventions.'],
          ],
        },
        {
          title: 'Parsing numbers and currencies',
          description: 'Thousands separators, decimal commas, currency symbols, parentheses for negatives, percent signs and unit suffixes all block numeric conversion. Strip and normalise with regex, convert with to_numeric, and keep the currency in its own column.',
          concepts: ['Thousands and decimal separators', 'Currency symbols and codes', 'Accounting negatives and percentages', 'Separating amount from currency'],
          quiz: [
            ['Convert "(1,234.50)" to a number?', 'Detect parentheses as negative, remove the comma, then to_numeric: -1234.5.'],
            ['Why store currency separately from amount?', 'Amounts in different currencies are not comparable and need conversion rates.'],
          ],
          prereqs: ['Parsing dates and times'],
        },
        {
          title: 'Booleans, flags and enumerations',
          description: 'Yes/No, Y/N, 1/0, true/false, TRUE and blanks may all mean the same flag. Map to a nullable boolean explicitly, decide what blank means, and turn known code lists into categoricals with validation of unknown codes.',
          concepts: ['Mapping flag spellings', 'Blank as false versus unknown', 'Code lists to categoricals', 'Rejecting unknown codes'],
          quiz: [
            ['Which dtype holds true, false and missing?', 'The nullable "boolean" dtype.'],
            ['What should an unrecognised status code do in a pipeline?', 'Fail loudly or be logged and quarantined, not silently become NaN.'],
          ],
          prereqs: ['Parsing numbers and currencies'],
        },
        {
          title: 'Identifiers that look like numbers',
          description: 'Postcodes, phone numbers, account ids and product codes lose leading zeros and become floats or scientific notation when read as numbers. Read them as strings, validate with a pattern and pad back what was lost.',
          concepts: ['Reading ids as strings', 'Lost leading zeros', 'Pattern validation of identifiers', 'Restoring with zfill'],
          quiz: [
            ['How do you stop read_csv turning a zip code into an integer?', 'dtype={"zip": "string"}.'],
            ['What does "1.23E+11" in an id column indicate?', 'The id was read as a float and lost precision; reload as string.'],
          ],
          prereqs: ['Parsing numbers and currencies'],
        },
        {
          title: 'Encodings and file format quirks',
          description: 'Latin-1 bytes decoded as UTF-8, mojibake, BOMs, embedded newlines in quoted fields and Windows line endings corrupt data before you see it. Detect encodings with charset-normalizer and fix at load time, never with string replace later.',
          concepts: ['Detecting the encoding', 'Mojibake and how it arises', 'Embedded newlines and quoting', 'Fixing at load rather than after'],
          quiz: [
            ['What does "Ã©" instead of "é" indicate?', 'UTF-8 bytes decoded as Latin-1 (mojibake).'],
            ['Which read_csv argument handles a BOM?', 'encoding="utf-8-sig".'],
          ],
          prereqs: ['Parsing dates and times'],
        },
      ],
    },
    {
      title: 'Text and Categories',
      topics: [
        {
          title: 'Whitespace, case and punctuation normalisation',
          description: 'Trailing spaces, tabs, non-breaking spaces, inconsistent case and stray punctuation split one category into ten. A normalisation function applied consistently on load, with the raw value preserved, fixes most of it.',
          concepts: ['strip and collapsing whitespace', 'Non-breaking and zero-width characters', 'Case folding', 'Keeping raw and cleaned columns'],
          quiz: [
            ['Why does "Paris " not match "Paris"?', 'A trailing space; strip it before comparing.'],
            ['Which method handles case better than lower() for some languages?', 'casefold().'],
          ],
        },
        {
          title: 'Unicode normalisation',
          description: 'The same accented letter can be one code point or a base letter plus a combining mark, so equal-looking strings compare unequal. unicodedata.normalize with NFC or NFKC unifies them, and stripping accents may be needed for matching.',
          concepts: ['Composed and decomposed forms', 'NFC and NFKC normalisation', 'Stripping accents for matching', 'Homoglyphs and lookalike characters'],
          quiz: [
            ['Why can "café" != "café"?', 'One uses a precomposed é, the other e plus a combining accent.'],
            ['Which normalisation form also folds compatibility characters such as ligatures?', 'NFKC.'],
          ],
          prereqs: ['Whitespace, case and punctuation normalisation'],
        },
        {
          title: 'Inconsistent categories and canonical values',
          description: 'value_counts reveals "NY", "New York", "new york" and "N.Y." as separate labels. Build a mapping table to canonical values, apply it with map or replace, report unmapped values, and version the mapping alongside the code.',
          concepts: ['Finding variant spellings with value_counts', 'Mapping tables to canonical values', 'Reporting unmapped values', 'Versioning the mapping'],
          quiz: [
            ['Why keep the mapping in a file rather than inline dict?', 'Non-programmers can review it and it is versioned and reusable across datasets.'],
            ['What should happen to a value not in the mapping?', 'It is logged for review; silently passing it through recreates the mess.'],
          ],
          prereqs: ['Unicode normalisation'],
        },
        {
          title: 'Placeholder and sentinel values',
          description: 'Strings like "N/A", "-", "unknown", "null", "?", 0, -1, 9999 and 1900-01-01 are missing values in disguise. Find them with value_counts per column and convert them to real nulls so they stop distorting statistics.',
          concepts: ['Common textual placeholders', 'Numeric sentinels like -1 and 9999', 'Default dates as missing', 'na_values at load time'],
          quiz: [
            ['How do you treat "N/A" and "-" as missing on load?', 'read_csv(na_values=["N/A", "-"]).'],
            ['Why is a birth date of 1900-01-01 suspicious?', 'It is a common default for unknown dates in legacy systems.'],
          ],
          prereqs: ['Inconsistent categories and canonical values'],
        },
        {
          title: 'Free-text fields',
          description: 'Comments, addresses and product descriptions need different handling: extract structured parts with regex, normalise addresses with a parser, redact personal data, and decide whether the field is analysable at all.',
          concepts: ['Extracting structure from text', 'Address parsing', 'Redacting personal data', 'Deciding what to keep'],
          quiz: [
            ['How do you pull a postcode out of a free-text address?', 'A regex for the postcode pattern via str.extract.'],
            ['Why redact emails and phone numbers in comment fields?', 'Personal data obligations apply to analysis datasets too.'],
          ],
          prereqs: ['Placeholder and sentinel values'],
        },
      ],
    },
    {
      title: 'Units, Scales and Consistency',
      topics: [
        {
          title: 'Mixed units and conversions',
          description: 'A weight column mixing kg and lb, temperatures in C and F, or distances in miles and km produces silent nonsense. Detect from ranges, suffixes or a unit column, convert everything to one unit, and record the unit in the column name.',
          concepts: ['Detecting mixed units from ranges', 'Unit columns and suffixes', 'Converting to a single unit', 'Units in column names'],
          quiz: [
            ['A height column with values around 170 and around 5.7: what happened?', 'Centimetres and feet are mixed.'],
            ['Why name a column distance_km rather than distance?', 'The unit travels with the data and cannot be forgotten.'],
          ],
        },
        {
          title: 'Scale and magnitude errors',
          description: 'Values stored in thousands, cents versus dollars, percentages as 0.5 versus 50, and off-by-1000 file batches show up as bimodal distributions. Comparing to known totals and plotting by source date exposes them.',
          concepts: ['Cents versus units', 'Percent versus fraction', 'Bimodal distributions as a warning', 'Reconciling to known totals'],
          quiz: [
            ['How would a batch exported in cents look next to one in dollars?', 'A second cluster 100 times larger in the same column.'],
            ['What quick check catches percent versus fraction?', 'Max above 1 in a column that should be a fraction.'],
          ],
          prereqs: ['Mixed units and conversions'],
        },
        {
          title: 'Cross-field consistency',
          description: 'Rules that involve several columns: end after start, total equals sum of parts, quantity times price equals amount, child age below parent age. Each is a vectorised boolean check with a violation count and sample.',
          concepts: ['Temporal ordering rules', 'Sum and product reconciliation', 'Logical dependencies between fields', 'Violation counts and samples'],
          quiz: [
            ['How do you check amount equals qty times price with rounding?', 'np.isclose(df.amount, df.qty * df.price, atol=0.01).'],
            ['What to do with rows where dropoff precedes pickup?', 'Quarantine them for investigation; they indicate a clock or parsing issue.'],
          ],
          prereqs: ['Scale and magnitude errors'],
        },
        {
          title: 'Reference data and referential integrity',
          description: 'Codes must exist in the lookup table, foreign keys must resolve, and country or currency codes must be valid ISO values. Anti-joins and isin checks find orphans; reference tables need their own versioning.',
          concepts: ['Validating against lookup tables', 'Anti-joins to find orphans', 'ISO codes for countries and currencies', 'Versioning reference data'],
          quiz: [
            ['Find orders whose customer id is not in the customer table?', 'orders[~orders.customer_id.isin(customers.id)].'],
            ['Why version reference tables?', 'Codes change over time and old data must be interpreted with the codes valid then.'],
          ],
          prereqs: ['Cross-field consistency'],
        },
      ],
    },
    {
      title: 'Validation and Pipelines',
      topics: [
        {
          title: 'Schema validation with pandera',
          description: 'A pandera DataFrameSchema declares column dtypes, nullability, uniqueness and value checks, and validate raises with every failing row listed. Putting it at the boundary of each pipeline step turns assumptions into enforced contracts.',
          concepts: ['Declaring columns and dtypes', 'Checks: ranges, sets and regex', 'Unique and nullable constraints', 'Lazy validation and error reports'],
          quiz: [
            ['What does lazy=True do in schema.validate?', 'Collects all failures before raising instead of stopping at the first.'],
            ['How do you require fare to be positive?', 'pa.Column(float, pa.Check.gt(0)).'],
          ],
        },
        {
          title: 'Great Expectations overview',
          description: 'Great Expectations manages suites of expectations, runs them against batches of data and produces data docs, which suits recurring pipelines and teams. It is heavier than pandera and pays off when many datasets need monitored checks.',
          concepts: ['Expectations and suites', 'Validating batches', 'Data docs and reports', 'When to choose it over pandera'],
          quiz: [
            ['What is an expectation?', 'A declarative assertion about data, such as expect_column_values_to_be_between.'],
            ['When is Great Expectations overkill?', 'For a single notebook or a small one-off dataset.'],
          ],
          prereqs: ['Schema validation with pandera'],
        },
        {
          title: 'Assertions and tests in cleaning code',
          description: 'Cheap checks inside functions: row counts before and after each step, no new nulls introduced, keys still unique, totals reconciled. pytest tests on small fixture files keep cleaning functions from regressing when the source changes.',
          concepts: ['Row count assertions per step', 'No-new-nulls checks', 'Reconciliation totals', 'pytest with fixture files'],
          quiz: [
            ['Why assert the row count after a merge?', 'A key duplication silently multiplies rows; the assertion catches it.'],
            ['What makes a good fixture file for cleaning tests?', 'A tiny sample containing every known edge case.'],
          ],
          prereqs: ['Schema validation with pandera'],
        },
        {
          title: 'Building a cleaning pipeline',
          description: 'One function per step taking and returning a DataFrame, composed with pipe, with configuration such as mappings and thresholds passed in rather than hard-coded, so the same pipeline runs on every new export.',
          concepts: ['Small pure functions per step', 'Composing with pipe', 'Configuration over hard-coding', 'Separating raw, interim and clean layers'],
          quiz: [
            ['Why keep raw data untouched in its own folder?', 'You can always rerun from the source and audit what changed.'],
            ['What should a cleaning function never do?', 'Mutate its input in place or depend on global state.'],
          ],
          prereqs: ['Assertions and tests in cleaning code'],
        },
        {
          title: 'Idempotence and reproducibility',
          description: 'Running the pipeline twice must give identical output: fixed seeds for any sampling, deterministic ordering, pinned library versions, and outputs written atomically so a crash never leaves half a file.',
          concepts: ['Idempotent steps', 'Deterministic ordering and seeds', 'Pinned environments', 'Atomic writes of outputs'],
          quiz: [
            ['Why can a groupby result differ between runs?', 'Unstable ordering of groups or of input files; sort explicitly.'],
            ['How do you write a file atomically?', 'Write to a temporary path then rename over the target.'],
          ],
          prereqs: ['Building a cleaning pipeline'],
        },
        {
          title: 'Documenting cleaning decisions',
          description: 'Every dropped row, imputed value and remapped category is a judgement that changes results. A cleaning log with counts per rule, a data dictionary for the clean table and a changelog of rules let others trust and reproduce the work.',
          concepts: ['Logging counts per cleaning rule', 'Data dictionary for the clean table', 'Changelog of rule changes', 'Explaining decisions to stakeholders'],
          quiz: [
            ['What belongs in a cleaning log entry?', 'The rule, why it exists, how many rows it affected and when it was added.'],
            ['Why record imputation choices in the data dictionary?', 'Downstream users must know which values are observed and which are filled.'],
          ],
          prereqs: ['Idempotence and reproducibility'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: cleaning NYC taxi trip records',
          description: 'Take a raw month of yellow taxi trips: remove trips with zero distance and non-zero fare, impossible timestamps and out-of-city coordinates, fix payment type codes with the lookup, cap durations, validate with a pandera schema and log every rule count.',
          concepts: ['Profile and list suspicious patterns', 'Encode rules for impossible trips', 'Map codes with lookup tables', 'Validate and log rule counts'],
          quiz: [
            ['How do you decide a duration cap?', 'From the distribution and domain knowledge, such as 99.9th percentile or a 3-hour limit, documented as a rule.'],
            ['Should out-of-city coordinates be dropped or nulled?', 'Nulled with a flag, so the trip counts remain while location analyses exclude them.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: retail product catalogue deduplication',
          description: 'Merge product catalogues from two retail systems: normalise names and units, resolve near-duplicates with rapidfuzz, reconcile prices in different currencies, build a canonical product table with a mapping back to source ids and measure match precision on a hand-labelled sample.',
          concepts: ['Normalise names and units', 'Fuzzy match with blocking', 'Reconcile prices and currencies', 'Measure precision on a labelled sample'],
          quiz: [
            ['Why block on brand before fuzzy matching product names?', 'It cuts comparisons drastically and prevents cross-brand false matches.'],
            ['How do you estimate match precision?', 'Hand-label a random sample of proposed matches and count correct ones.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Titanic with injected mess',
          description: 'Start from a deliberately corrupted Titanic file with mixed date formats, placeholder ages, inconsistent embarkation codes, duplicate passengers and fares in two currencies; restore a clean table and prove it matches the reference with tests.',
          concepts: ['Diagnose every injected fault', 'Fix parsing and sentinels', 'Resolve duplicates and categories', 'Prove equality against the reference'],
          quiz: [
            ['How do you prove your cleaned frame matches the reference?', 'pd.testing.assert_frame_equal after aligning dtypes and order.'],
            ['Which fault is hardest to detect automatically?', 'Plausible but wrong values, such as swapped ages between passengers.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: air quality sensor pipeline',
          description: 'Build a rerunnable pipeline for hourly air quality feeds from several stations: unify timestamps and zones, treat negative and stuck-sensor readings, impute short gaps by interpolation and flag long ones, validate with a schema and publish a cleaning report.',
          concepts: ['Unify timestamps across stations', 'Detect stuck and negative readings', 'Gap policy: interpolate or flag', 'Schema and report per run'],
          quiz: [
            ['How do you detect a stuck sensor?', 'Runs of identical consecutive readings longer than a threshold.'],
            ['Why not interpolate gaps of several days?', 'The fill would invent a daily cycle that never happened; flag instead.'],
          ],
          style: 'project',
        },
        {
          title: 'Data cleaning interview questions',
          description: 'What interviewers probe: how you would profile an unfamiliar dataset, MCAR versus MAR versus MNAR, when to drop versus impute, handling duplicates across systems, outlier policy, and how you make cleaning reproducible and reviewable.',
          concepts: ['Walk-through of profiling a new dataset', 'Missing data reasoning', 'Outlier and duplicate policy questions', 'Reproducibility questions'],
          quiz: [
            ['Interviewer: "How would you handle 30% missing income?"', 'Diagnose the mechanism first; if MAR, impute with an indicator; if MNAR, model it or report the bias.'],
            ['Why is dropping duplicates before understanding the grain risky?', 'Legitimate repeated rows, such as repeat purchases, may be removed.'],
          ],
          style: 'reading',
        },
        {
          title: 'Cleaning exercises on messy samples',
          description: 'Timed tasks on small messy frames: parse mixed dates, convert currency strings, unify category spellings, find near-duplicates, write a pandera schema and explain each decision in one line, as done in take-home tests.',
          concepts: ['Fast parsing of mixed columns', 'Category unification under time pressure', 'Writing a schema quickly', 'One-line justification per decision'],
          quiz: [
            ['Convert "$1,200", "1200 USD" and "1.2k" to numbers?', 'Normalise with regex for symbols and suffixes, expand k, then to_numeric.'],
            ['What is the first thing to write in a take-home cleaning task?', 'A profile of each column and the list of problems found.'],
          ],
        },
      ],
    },
  ],
})
