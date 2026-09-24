import { defineTrack } from '../define'

export const eda = defineTrack({
  id: 'track-eda',
  title: 'Exploratory Data Analysis',
  description: 'How to interrogate a dataset before modelling or reporting: framing questions, univariate and multivariate analysis, segmentation, time patterns, spotting quality problems as you go, generating hypotheses, EDA aimed at a prediction target, automated tools, and writing notebooks that others can follow.',
  family: 'Data Science',
  kind: 'domain',
  icon: '🔍',
  tags: ['eda', 'exploratory analysis', 'pandas', 'seaborn', 'notebooks', 'hypotheses'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-pandas'],
  style: 'practice',
  categories: [
    {
      title: 'Framing the Analysis',
      description: 'Deciding what you are looking for so the exploration has a direction.',
      topics: [
        {
          title: 'Questions before code',
          description: 'EDA without a question produces a hundred plots and no insight. Writing the decision the analysis supports, three to five concrete questions, and what answer would change the decision keeps the notebook focused and finishable.',
          concepts: ['Naming the decision behind the analysis', 'Turning vague asks into concrete questions', 'What answer would change the decision', 'Time-boxing exploration'],
          quiz: [
            ['What is the first line of a good EDA notebook?', 'The question or decision the analysis serves.'],
            ['Why write questions before plotting?', 'Each plot then has a purpose and you know when you are done.'],
          ],
        },
        {
          title: 'Reading the data dictionary and provenance',
          description: 'Where each column came from, how it was collected, what the codes mean and when definitions changed. A column called revenue can be gross, net or booked, and the dictionary or the owner is the only way to know.',
          concepts: ['Column definitions and business meaning', 'Collection process and its biases', 'Code lists and definition changes', 'Finding the data owner'],
          quiz: [
            ['Why ask when a column definition last changed?', 'A step change in the data may be a definition change, not a real event.'],
            ['What does provenance tell you about missing values?', 'Whether they are unmeasured, not applicable or lost in transit.'],
          ],
          prereqs: ['Questions before code'],
        },
        {
          title: 'Grain, keys and the unit of analysis',
          description: 'One row per what? Orders, order lines, sessions or daily snapshots answer different questions. Confirming the grain, the key and how tables relate before aggregating prevents the double counting that ruins otherwise careful analyses.',
          concepts: ['Identifying the row grain', 'Verifying keys are unique', 'Relationships between tables', 'Choosing the unit of analysis for the question'],
          quiz: [
            ['You want average basket size but the table is one row per item: what first?', 'Aggregate to one row per order, then take the mean.'],
            ['Quick check that a column is a key?', 'df[col].is_unique'],
          ],
          prereqs: ['Reading the data dictionary and provenance'],
        },
        {
          title: 'Setting up the EDA notebook',
          description: 'A repeatable skeleton: imports and display options, a load function with dtypes, a quick profile, sections per question, and a findings list at the top updated as you go. Reusable helpers for profiling and plotting save an hour per dataset.',
          concepts: ['Notebook skeleton and sections', 'Display options for wide frames', 'Reusable profile helpers', 'A running findings list'],
          quiz: [
            ['Why keep a findings list at the top of the notebook?', 'Readers get the conclusions first and you see what is still unanswered.'],
            ['How do you show all columns of a wide frame?', 'pd.set_option("display.max_columns", None).'],
          ],
          prereqs: ['Questions before code'],
        },
      ],
    },
    {
      title: 'Univariate Analysis',
      topics: [
        {
          title: 'Numeric distributions',
          description: 'Histograms, KDEs, box plots and the empirical CDF each show something different: modes, skew, gaps, spikes at round numbers, and hard caps. Trying several bin widths and a log scale is part of looking, not a refinement.',
          concepts: ['Histogram bin choices', 'KDE and its smoothing', 'Box plots and quartiles', 'Log scales for skewed data'],
          quiz: [
            ['A spike at exactly 0 and a long tail: what does it suggest?', 'A mixture: many non-events plus a skewed distribution of events.'],
            ['Why plot skewed money data on a log axis?', 'The bulk and the tail become visible at once.'],
          ],
        },
        {
          title: 'Summary statistics that do not lie',
          description: 'Mean, median, trimmed mean, standard deviation, IQR, MAD, min, max and chosen percentiles together describe a column; any one alone can mislead. Reporting the percentiles that matter for the question beats a table of defaults.',
          concepts: ['Choosing centre and spread by shape', 'Percentiles that matter for the question', 'Robust statistics', 'describe versus a custom summary'],
          quiz: [
            ['Which summary for a delivery time SLA question?', 'The 90th or 95th percentile, not the mean.'],
            ['When is the standard deviation a poor spread measure?', 'With heavy tails or outliers; use IQR or MAD.'],
          ],
          prereqs: ['Numeric distributions'],
        },
        {
          title: 'Categorical frequencies',
          description: 'value_counts with and without normalisation, cardinality, the long tail of rare levels and the "other" bucket. High-cardinality columns need a top-n view plus a coverage figure: what share of rows do the top ten levels cover?',
          concepts: ['Counts and proportions', 'Cardinality and the long tail', 'Coverage of the top-n levels', 'Rare-level handling'],
          quiz: [
            ['How do you show proportions instead of counts?', 'value_counts(normalize=True).'],
            ['What does it mean if the top 5 categories cover 30% of rows?', 'The column is high-cardinality with a long tail; treat rare levels as a group.'],
          ],
        },
        {
          title: 'Transformations that reveal structure',
          description: 'Log, square root and Box-Cox transforms compress skew so structure and outliers become visible; ranks and quantile bins make heavy-tailed variables comparable. Transforms are for seeing here, not yet for modelling.',
          concepts: ['Log and log1p transforms', 'Square root and Box-Cox', 'Ranks and quantile bins', 'Interpreting transformed axes'],
          quiz: [
            ['Why log1p instead of log?', 'It handles zeros, since log(0) is undefined.'],
            ['What does a straight line on a log-log plot suggest?', 'A power-law relationship.'],
          ],
          prereqs: ['Numeric distributions'],
        },
        {
          title: 'Detecting multimodality and mixtures',
          description: 'Two humps in a histogram usually mean two populations mixed together: two products, two regions, two data sources. Splitting by candidate variables until the humps separate is a core EDA move and often finds a data issue.',
          concepts: ['Recognising multiple modes', 'Splitting by candidate variables', 'Mixtures from merged sources', 'KDE bandwidth and false modes'],
          quiz: [
            ['Trip distances show humps at 2 km and 20 km: first hypothesis?', 'Two trip types, such as city trips and airport trips.'],
            ['How can a KDE invent a mode?', 'A bandwidth that is too small follows noise in the sample.'],
          ],
          prereqs: ['Numeric distributions'],
        },
      ],
    },
    {
      title: 'Bivariate and Multivariate Analysis',
      topics: [
        {
          title: 'Correlation matrices and their limits',
          description: 'A Pearson correlation matrix and heatmap summarise linear relationships across many columns in one view; Spearman catches monotone ones. Correlations hide non-linearity, outliers and mixtures, so every strong or surprising value gets a scatter plot.',
          concepts: ['Pearson versus Spearman matrices', 'Clustered correlation heatmaps', 'What correlation misses', 'Following up surprising correlations'],
          quiz: [
            ['Two columns correlate at 0.98: what do you check?', 'Whether one is derived from the other, a leakage or duplication risk.'],
            ['Which correlation for ordinal ratings against spend?', 'Spearman.'],
          ],
        },
        {
          title: 'Scatter plots and pair plots',
          description: 'Scatter plots show the shape of a relationship; alpha, sampling and hexbin handle overplotting; pair plots survey every numeric pair at once and are worth the render time on datasets under twenty columns.',
          concepts: ['Scatter plot shapes', 'Overplotting: alpha, sampling and hexbin', 'Pair plots with hue', 'Reading non-linear relationships'],
          quiz: [
            ['How do you handle 2 million points on a scatter plot?', 'Sample, lower alpha, or use hexbin or 2-D histograms.'],
            ['What does hue add to a pair plot?', 'A colour per category, revealing group-wise relationships.'],
          ],
          prereqs: ['Correlation matrices and their limits'],
        },
        {
          title: 'Crosstabs and categorical associations',
          description: 'pd.crosstab with normalize by row or column shows how two categorical variables relate; a chi-square test and Cramer V quantify it. Normalising the right axis is what makes a crosstab answer the question asked.',
          concepts: ['Crosstabs with row and column normalisation', 'Stacked and grouped bar views', 'Chi-square and Cramer V', 'Choosing the normalisation axis'],
          quiz: [
            ['Survival rate by class needs which normalisation?', 'By row (index), so each class sums to 1.'],
            ['What does Cramer V of 0.05 mean for a significant chi-square?', 'The association is real but negligible in size.'],
          ],
        },
        {
          title: 'Numeric versus categorical comparisons',
          description: 'Box, violin and strip plots by group, grouped summary tables, and ECDFs overlaid per group show how a number differs across categories. Ordering groups by their median rather than alphabetically makes the pattern jump out.',
          concepts: ['Box and violin plots by group', 'Group summary tables', 'Overlaid ECDFs', 'Ordering groups by a statistic'],
          quiz: [
            ['Why order box plots by median?', 'The trend across groups becomes visible instead of hidden in alphabetical order.'],
            ['When is a violin plot better than a box plot?', 'When groups are multimodal, which a box plot hides.'],
          ],
          prereqs: ['Crosstabs and categorical associations'],
        },
        {
          title: 'Multivariate views: facets, colour and dimensionality reduction',
          description: 'Faceting by one variable and colouring by another shows three or four dimensions at once; PCA, t-SNE or UMAP projections give a glance at structure in dozens of columns, to be read as suggestions rather than results.',
          concepts: ['Facets and hue for extra dimensions', 'Bubble size as a fourth variable', 'PCA projection for a first look', 'Reading t-SNE and UMAP with caution'],
          quiz: [
            ['What does the first principal component explain?', 'The direction of greatest variance in the standardised data.'],
            ['Why not read distances between t-SNE clusters literally?', 'The method preserves local neighbourhoods, not global distances.'],
          ],
          prereqs: ['Scatter plots and pair plots'],
        },
        {
          title: "Simpson's paradox and confounding in EDA",
          description: 'A trend that reverses when you split by a third variable is not rare in business data: the overall admission rate favours one group while every department favours the other. Always check whether a headline comparison survives segmentation.',
          concepts: ["Simpson's paradox examples", 'Stratifying a comparison', 'Confounders visible in the data', 'Reporting the stratified result'],
          quiz: [
            ['Overall conversion is higher on mobile but lower on mobile within every country: what is happening?', 'Country mix differs by device; the within-country comparison is the honest one.'],
            ['What is the EDA habit that catches this?', 'Re-run every headline comparison inside the main segments.'],
          ],
          prereqs: ['Numeric versus categorical comparisons'],
        },
      ],
    },
    {
      title: 'Segmenting and Grouping',
      topics: [
        {
          title: 'Group comparisons with groupby',
          description: 'Multi-statistic group tables with agg, sorted and formatted, are the quickest way to compare segments. Adding counts next to means stops small groups with extreme averages from misleading the reader.',
          concepts: ['Group tables with several statistics', 'Counts alongside averages', 'Sorting and formatting group tables', 'Small-group caution'],
          quiz: [
            ['Why show the count next to a group mean?', 'A mean from 3 rows deserves less trust than one from 30,000.'],
            ['How do you get mean, median and count per group at once?', 'groupby(key)[col].agg(["mean", "median", "count"]).'],
          ],
        },
        {
          title: 'Binning continuous variables',
          description: 'cut and qcut turn age, income or distance into bands so you can compare rates across them; equal-width bins show shape, quantile bins give equal sample sizes, and domain bins match how the business talks about the variable.',
          concepts: ['Equal-width versus quantile bins', 'Domain-defined bins', 'Rates per bin', 'Bin count and stability'],
          quiz: [
            ['When use qcut rather than cut?', 'When you want equal-count bins so each rate is estimated from similar sample sizes.'],
            ['What goes wrong with 50 bins on 500 rows?', 'Ten rows per bin gives noisy rates that look like patterns.'],
          ],
          prereqs: ['Group comparisons with groupby'],
        },
        {
          title: 'Cohorts and first-event grouping',
          description: 'Grouping customers by the month they first appeared and tracking their behaviour over subsequent months separates changes in the customer base from changes in behaviour, which a plain monthly average cannot do.',
          concepts: ['Defining a cohort by first event', 'Cohort by period matrices', 'Retention curves', 'Mix effects versus behaviour effects'],
          quiz: [
            ['How do you compute the cohort of each customer?', 'groupby("customer")["date"].transform("min") truncated to the month.'],
            ['Why can average spend fall while every cohort spends more?', 'Newer, lower-spending cohorts make up a growing share of the base.'],
          ],
          prereqs: ['Group comparisons with groupby'],
        },
        {
          title: 'Small multiples for segment scanning',
          description: 'A grid of the same chart per segment (seaborn FacetGrid, catplot or relplot) lets the eye compare dozens of segments quickly and spot the one that behaves differently, which is usually where the story or the bug is.',
          concepts: ['FacetGrid and the col and row arguments', 'Shared versus free axes', 'Ordering facets meaningfully', 'Spotting the odd segment'],
          quiz: [
            ['Why share the y-axis across facets?', 'So differences in level are visible; free axes hide them.'],
            ['How many facets before a grid stops being readable?', 'Around 20 to 30; beyond that, summarise into a table or heatmap.'],
          ],
          prereqs: ['Binning continuous variables'],
        },
      ],
    },
    {
      title: 'Time-Based Patterns',
      topics: [
        {
          title: 'Trend, seasonality and noise',
          description: 'Resampling to a sensible frequency and plotting shows the trend; day-of-week and month-of-year profiles show seasonality; what is left is noise or events. A seasonal decomposition separates the three formally.',
          concepts: ['Resampling to the right frequency', 'Day-of-week and month profiles', 'Seasonal decomposition', 'Rolling averages to see trend'],
          quiz: [
            ['Why does a 7-day rolling mean smooth weekly seasonality?', 'Each window contains exactly one of each weekday.'],
            ['How do you plot a day-of-week profile?', 'groupby(ts.dt.dayofweek)[col].mean().plot().'],
          ],
        },
        {
          title: 'Calendar effects and holidays',
          description: 'Public holidays, paydays, month ends, school terms and daylight saving changes leave signatures in most business data. Joining a calendar table and plotting around known dates explains spikes that otherwise look like anomalies.',
          concepts: ['Holiday calendars and joins', 'Month-end and payday effects', 'Daylight saving and time zone artefacts', 'Annotating known events on plots'],
          quiz: [
            ['Hourly counts double for one hour in March: likely cause?', 'A daylight saving transition duplicated or shifted an hour.'],
            ['Which library provides holiday calendars for many countries?', 'The holidays package (or pandas holiday calendars).'],
          ],
          prereqs: ['Trend, seasonality and noise'],
        },
        {
          title: 'Event alignment and before-after views',
          description: 'Aligning series on an event (launch, outage, price change) and plotting relative days before and after shows the effect and its decay, and comparing to an unaffected control series separates the event from background trends.',
          concepts: ['Relative time since event', 'Before-after plots', 'Control series for comparison', 'Effect decay over time'],
          quiz: [
            ['How do you compute days since a per-user event?', '(df.date - df.event_date).dt.days.'],
            ['Why compare to a control region after a launch?', 'To rule out a market-wide change that happened at the same time.'],
          ],
          prereqs: ['Trend, seasonality and noise'],
        },
        {
          title: 'Drift and structural breaks',
          description: 'Distributions change over time: a step change in a mean, a new category appearing, a column going constant. Plotting summary statistics per period and comparing early to late distributions catches drift that a single overall histogram hides.',
          concepts: ['Per-period summary statistics', 'Early versus late distribution comparison', 'New and vanished categories over time', 'Step changes as definition changes'],
          quiz: [
            ['A column becomes constant from June: data issue or reality?', 'Almost certainly a pipeline or logging change; check with the owner.'],
            ['Quick test for drift between two periods?', 'A two-sample KS test or comparing quantiles side by side.'],
          ],
          prereqs: ['Calendar effects and holidays'],
        },
      ],
    },
    {
      title: 'Data Quality Issues Found During EDA',
      topics: [
        {
          title: 'Impossible and implausible values',
          description: 'Negative ages, future timestamps, prices of zero, 999 as a placeholder: EDA finds them as odd histogram spikes and range violations. Note each with its count, decide with the owner whether it is an error, and record the decision.',
          concepts: ['Range checks per column', 'Placeholder spikes in histograms', 'Future and pre-launch dates', 'Recording issues with counts'],
          quiz: [
            ['A spike at age 99 in a customer table suggests?', 'A placeholder for unknown age.'],
            ['What do you do with the 0.1% of negative prices?', 'Investigate the source; likely refunds or sign errors, not simply drop.'],
          ],
        },
        {
          title: 'Missingness patterns as findings',
          description: 'Which columns are missing together, for which segments and since when tells you about the systems that produced the data. A column missing for one region is a collection difference that must be explained before comparing regions.',
          concepts: ['Missingness by segment', 'Missingness over time', 'Columns missing together', 'Reporting collection differences'],
          quiz: [
            ['Why is missingness concentrated in one country a problem for comparisons?', 'Differences may reflect what was collected, not what happened.'],
            ['How do you plot missingness over time?', 'Resample isna() by period and plot the mean rate.'],
          ],
          prereqs: ['Impossible and implausible values'],
        },
        {
          title: 'Duplicates and leakage discovered in EDA',
          description: 'Repeated rows, identical feature vectors with different labels, and columns that perfectly predict the target (because they were recorded after it) all surface during EDA. Finding them here saves a model that would look great and fail in production.',
          concepts: ['Repeated rows and keys', 'Conflicting labels for identical rows', 'Target leakage through post-outcome columns', 'Suspiciously perfect predictors'],
          quiz: [
            ['A feature correlates 0.99 with the target: what is your first thought?', 'Leakage; check whether it is recorded after or derived from the outcome.'],
            ['Why are identical rows with different labels a problem?', 'They cap achievable accuracy and hint at missing features or bad joins.'],
          ],
          prereqs: ['Impossible and implausible values'],
        },
        {
          title: 'Sanity checks against known totals',
          description: 'Sum revenue by month and compare to the finance report; count users and compare to the dashboard. Reconciling to independent numbers is the single most convincing check that the dataset is the one you think it is.',
          concepts: ['Choosing external reference numbers', 'Reconciliation tables', 'Explaining acceptable differences', 'Escalating unexplained gaps'],
          quiz: [
            ['Monthly revenue is 8% below finance: what next?', 'Check refunds, currency, time zone and filters before trusting either number.'],
            ['Why reconcile early rather than at the end?', 'Every later finding depends on the dataset being complete and correct.'],
          ],
          prereqs: ['Duplicates and leakage discovered in EDA'],
        },
      ],
    },
    {
      title: 'Hypotheses and Target-Focused EDA',
      topics: [
        {
          title: 'Generating and ranking hypotheses',
          description: 'Each surprising plot becomes a written hypothesis with a proposed check and a note on what it would change. Ranking by impact and ease of testing keeps the notebook from chasing curiosities while the real question waits.',
          concepts: ['From observation to hypothesis', 'Proposing a check per hypothesis', 'Ranking by impact and effort', 'Closing hypotheses explicitly'],
          quiz: [
            ['What makes a hypothesis testable in EDA terms?', 'It names the variables, the expected pattern and the plot or test that would show it.'],
            ['Why write down rejected hypotheses?', 'So nobody re-explores them and the reasoning is auditable.'],
          ],
        },
        {
          title: 'EDA for a classification target',
          description: 'Class balance, positive rate by segment, feature distributions per class, and the ranking of features by a simple separation measure such as mutual information. The goal is to know which features matter and where the data is weak before modelling.',
          concepts: ['Class balance and base rate', 'Positive rate by segment', 'Feature distributions per class', 'Univariate feature ranking'],
          quiz: [
            ['Positive rate is 2%: what does that imply for EDA plots?', 'Compare distributions per class rather than raw counts, which the negatives swamp.'],
            ['What does a large mutual information between a feature and target mean?', 'Knowing the feature reduces uncertainty about the class a lot.'],
          ],
          prereqs: ['Generating and ranking hypotheses'],
        },
        {
          title: 'EDA for a regression target',
          description: 'The target distribution and whether to transform it, scatter and binned means of each feature against the target, residual patterns from a trivial baseline, and heteroscedasticity that will need handling. A log target often fixes half the problems.',
          concepts: ['Target distribution and transforms', 'Binned means of target by feature', 'Baseline residual analysis', 'Variance changing with the target'],
          quiz: [
            ['Why plot binned means rather than a raw scatter for a feature?', 'It shows the average relationship clearly even with heavy overplotting.'],
            ['Target is right-skewed with zeros: what transform?', 'log1p, or model the zeros separately.'],
          ],
          prereqs: ['Generating and ranking hypotheses'],
        },
        {
          title: 'Feature-target relationships and interactions',
          description: 'Partial views of the target against pairs of features (heatmaps of binned means, faceted scatter plots) show interactions such as discount effects that only exist for one product category, which single-feature plots miss.',
          concepts: ['Two-way binned target heatmaps', 'Faceted target plots', 'Spotting interaction effects', 'Non-monotone relationships'],
          quiz: [
            ['How do you show the mean target across two binned features?', 'pivot_table(values=target, index=bin_a, columns=bin_b, aggfunc="mean") as a heatmap.'],
            ['What does an interaction look like in facets?', 'The slope or shape differs between facets.'],
          ],
          prereqs: ['EDA for a classification target', 'EDA for a regression target'],
        },
        {
          title: 'Class imbalance and rare events',
          description: 'When positives are rare, EDA must check whether they are spread across time and segments or concentrated, whether enough exist per segment to say anything, and which features have signal despite the imbalance.',
          concepts: ['Positives over time and segments', 'Minimum positives per segment', 'Rate plots with confidence bands', 'Implications for evaluation'],
          quiz: [
            ['A segment has 3 positives out of 40: is its 7.5% rate meaningful?', 'Barely; the confidence interval spans roughly 2% to 20%.'],
            ['Why plot rates with confidence bands under imbalance?', 'Small segments produce extreme rates by chance.'],
          ],
          prereqs: ['EDA for a classification target'],
        },
      ],
    },
    {
      title: 'Communicating and Tooling',
      topics: [
        {
          title: 'Narrative notebooks',
          description: 'A readable notebook has a summary at the top, one finding per section with the plot that shows it, code folded or moved to a module, and a next-steps list. It is written for the reader who has five minutes, not for the author.',
          concepts: ['Summary first', 'One finding per section', 'Moving code to modules', 'Next steps and open questions'],
          quiz: [
            ['Where do the conclusions go?', 'At the top, before any code.'],
            ['Why move helper functions out of the notebook?', 'The narrative stays readable and the helpers are testable and reusable.'],
          ],
        },
        {
          title: 'Choosing the chart for each finding',
          description: 'Comparison, distribution, relationship, composition and change over time each have natural charts; the finding decides the chart, and the chart title states the finding. Detailed craft lives in the visualisation track; here the choice is what matters.',
          concepts: ['Matching chart type to the finding', 'Titles that state the finding', 'Removing what does not support the point', 'One message per chart'],
          quiz: [
            ['Best chart for how a share of categories changed over five years?', 'Stacked area or a line per category, not a series of pie charts.'],
            ['What should the title of an EDA chart say?', 'The finding, for example "Weekend trips are 30% longer".'],
          ],
          prereqs: ['Narrative notebooks'],
        },
        {
          title: 'Automated EDA tools',
          description: 'ydata-profiling, sweetviz, D-Tale and AutoViz produce a broad first pass in a minute, with distributions, correlations and warnings. Use them to get oriented and to catch what you forgot, then do the question-driven work by hand.',
          concepts: ['ydata-profiling reports', 'sweetviz comparisons of two datasets', 'Interactive exploration with D-Tale', 'Where automated reports stop'],
          quiz: [
            ['What is sweetviz especially good at?', 'Comparing two datasets such as train versus test side by side.'],
            ['Why not ship an automated report as the analysis?', 'It answers no question and buries the findings among hundreds of panels.'],
          ],
        },
        {
          title: 'Reproducible EDA',
          description: 'Pinned environments, data loaded from a fixed snapshot, notebooks that run top to bottom, and papermill or nbconvert to re-execute them. Restart-and-run-all before sharing is the minimum bar.',
          concepts: ['Restart and run all', 'Fixed data snapshots', 'Parameterised notebooks with papermill', 'Exporting to HTML for readers'],
          quiz: [
            ['Why does a notebook that works in your session fail for a colleague?', 'Cells were run out of order or depend on state that was later deleted.'],
            ['What does papermill add?', 'Running a notebook with parameters from the command line for repeatable reports.'],
          ],
          prereqs: ['Narrative notebooks'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: NYC taxi demand and fares',
          description: 'Explore a month of NYC yellow taxi trips: hourly and weekday demand patterns, fare and tip distributions by payment type, pickup zone hot spots, airport trips as a segment, and a findings notebook with five ranked hypotheses for a pricing team.',
          concepts: ['Frame questions for a pricing team', 'Time patterns of demand', 'Segment airport and city trips', 'Rank and present hypotheses'],
          quiz: [
            ['Why split airport trips out before analysing fares?', 'Flat rates and long distances make them a different population that distorts averages.'],
            ['What is one hypothesis the tip analysis could generate?', 'Card tips cluster at preset percentages while cash tips are underrecorded.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Titanic survival exploration',
          description: 'A full EDA on the Titanic passenger list: survival by sex, class, age band and family size, crosstabs and rate plots with confidence bands, checks for Simpson-style reversals, missingness in age and cabin, and a short notebook that a modeller can start from.',
          concepts: ['Univariate profile of passengers', 'Survival rates by segment', 'Check reversals under stratification', 'Missingness and leakage notes'],
          quiz: [
            ['Which column is a leakage risk in Titanic-style data?', 'Anything recorded after the outcome, such as lifeboat number.'],
            ['Why bin age before computing survival rates?', 'Rates need enough passengers per group to be stable.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: retail transactions and customer behaviour',
          description: 'Explore an online retail transaction log: revenue trend and seasonality, basket size distribution, product long tail, country mix, customer cohorts and retention, and returns as a data quality and business finding, ending in a memo for the marketing lead.',
          concepts: ['Revenue and seasonality', 'Basket and product distributions', 'Cohort retention analysis', 'Memo of findings and next steps'],
          quiz: [
            ['How do you identify returns in a transaction log?', 'Negative quantities or invoice numbers with a cancellation prefix.'],
            ['Why present cohort retention rather than monthly active users?', 'It separates acquisition from retention, which need different actions.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: air quality patterns across stations',
          description: 'Explore hourly air quality readings from multiple stations: daily and weekly cycles, seasonal differences, station comparisons with ECDFs, correlation between pollutants, weather effects, exceedance episodes, and drift or sensor faults found along the way.',
          concepts: ['Daily and weekly pollutant cycles', 'Compare stations with ECDFs', 'Pollutant and weather correlations', 'Flag exceedances and sensor faults'],
          quiz: [
            ['What would a flat line at one station for a week mean?', 'A stuck or offline sensor, a data quality finding to report.'],
            ['Why compare stations with ECDFs rather than means?', 'Whole distributions show tails and exceedances that means hide.'],
          ],
          style: 'project',
        },
        {
          title: 'EDA interview questions',
          description: 'Interviewers ask you to talk through exploring an unfamiliar dataset, what you check first, how you find data problems, how you decide a pattern is real, and how you would present three findings to a non-technical stakeholder.',
          concepts: ['Narrating your EDA process', 'What you check first and why', 'Deciding whether a pattern is real', 'Presenting to non-technical stakeholders'],
          quiz: [
            ['"You get a new dataset, what do you do in the first hour?"', 'Confirm grain and keys, profile every column, reconcile a total, then start on the questions.'],
            ['How do you decide a segment difference is real?', 'Check sample sizes, a confidence interval or test, and whether it survives stratification.'],
          ],
          style: 'reading',
        },
        {
          title: 'Timed EDA exercises',
          description: 'Take-home style drills: given a CSV and a question, produce three findings with plots in 45 minutes. Practise the sequence of load, profile, question, plot, finding, and the discipline of stopping when the question is answered.',
          concepts: ['Load and profile in ten minutes', 'One question, one plot, one finding', 'Stopping when the question is answered', 'Writing the findings summary'],
          quiz: [
            ['What is the most common take-home mistake?', 'Producing many plots with no findings or recommendation.'],
            ['How should each finding be phrased?', 'As a specific, quantified statement with the supporting chart.'],
          ],
        },
      ],
    },
  ],
})
