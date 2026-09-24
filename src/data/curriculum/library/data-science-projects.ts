import { defineTrack } from '../define'

export const dataScienceProjects = defineTrack({
  id: 'track-data-science-projects',
  title: 'Data Science Projects',
  description: 'End-to-end data science projects on realistic datasets: analyses, prediction models, segmentation and recommendation, forecasting and anomaly detection, experiment analysis, text work, and reports and pipelines that communicate results, each specifying what to build and what it must produce.',
  family: 'Data Science',
  kind: 'projects',
  icon: '🧰',
  tags: ['projects', 'portfolio', 'end-to-end', 'pandas', 'scikit-learn', 'forecasting', 'reporting'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-machine-learning'],
  style: 'project',
  categories: [
    {
      title: 'Analysis and Insight',
      description: 'Projects whose output is a finding, backed by data, that someone could act on.',
      topics: [
        {
          title: 'NYC taxi trip analysis',
          description: 'Analyse a month of NYC yellow taxi trips: clean impossible fares and coordinates, compute demand by hour and zone, tip rates by payment type and trip distance, and produce a notebook with five charts and three quantified findings about when and where demand peaks.',
          concepts: ['Load and validate the trip records', 'Remove invalid trips with stated rules', 'Aggregate by hour, zone and payment', 'Chart demand and tipping patterns', 'Write the findings with numbers'],
          quiz: [
            ['How should impossible fares be handled?', 'Removed under explicit, documented rules such as negative fares or zero-distance high fares.'],
            ['Why report demand per zone per hour rather than totals?', 'Operational decisions like driver positioning depend on when and where, not the overall count.'],
          ],
        },
        {
          title: 'Retail market basket analysis',
          description: 'Mine transaction data for product associations with the Apriori or FP-growth algorithm: build the basket matrix, compute support, confidence and lift, filter trivial rules, and deliver a ranked list of cross-sell pairs with their expected uplift.',
          concepts: ['Build the one-hot basket matrix', 'Run frequent itemset mining', 'Compute support, confidence and lift', 'Filter and rank actionable rules'],
          quiz: [
            ['What does lift above 1 mean?', 'The items co-occur more often than expected if independent.'],
            ['Why filter high-confidence rules with low lift?', 'They usually involve a very popular item and carry no real association.'],
          ],
        },
        {
          title: 'Cohort retention analysis',
          description: 'From a user activity log, build monthly signup cohorts, compute retention curves, compare cohorts over time and by acquisition channel, and deliver a retention heatmap plus a written diagnosis of which cohorts retain worse and a hypothesis for why.',
          concepts: ['Assign users to signup cohorts', 'Compute period-over-period retention', 'Build the retention heatmap', 'Compare by channel and explain'],
          quiz: [
            ['What is a cohort in retention analysis?', 'A group of users who started in the same period.'],
            ['Why are the latest cohorts\' late-period cells empty?', 'Those periods have not happened yet.'],
          ],
        },
        {
          title: 'E-commerce funnel and conversion analysis',
          description: 'Reconstruct the visit-to-purchase funnel from event data, measure drop-off at each step overall and by device and traffic source, identify the step with the largest addressable loss, and quantify the revenue gained from a stated improvement.',
          concepts: ['Sessionise the event stream', 'Compute step conversion rates', 'Segment the funnel by device and source', 'Size the opportunity in revenue'],
          quiz: [
            ['How do you define a session from raw events?', 'Group events per user separated by an inactivity gap, commonly 30 minutes.'],
            ['Why segment the funnel?', 'A single step may fail only on mobile or one source, which the overall rate hides.'],
          ],
        },
        {
          title: 'Global development indicators study',
          description: 'Using World Bank indicators, examine how life expectancy relates to income, health spending and education across countries and decades, handle missing years, and deliver a report with scatter, small multiples and a clear statement of what the data can and cannot claim.',
          concepts: ['Fetch and reshape indicator data', 'Handle gaps across countries and years', 'Explore relationships with plots', 'State limits of causal claims'],
          quiz: [
            ['Why is a log scale used for GDP per capita?', 'Income spans orders of magnitude and its relationship with outcomes is roughly log-linear.'],
            ['Can this analysis say health spending causes longer life?', 'No; it is observational and confounded by overall development.'],
          ],
        },
      ],
    },
    {
      title: 'Prediction',
      description: 'Supervised models built to a stated target metric, with honest validation.',
      topics: [
        {
          title: 'Customer churn prediction',
          description: 'Build a churn classifier from a telecom or subscription dataset: engineer tenure and usage features, compare logistic regression and gradient boosting with stratified cross-validation, choose a threshold by retention-offer cost, and deliver a scored list with feature explanations.',
          concepts: ['Define churn and the prediction window', 'Engineer usage and tenure features', 'Train and cross-validate models', 'Pick the threshold by cost', 'Explain predictions with SHAP'],
          quiz: [
            ['Why define the prediction window before modelling?', 'Features must use only data from before the window, or the model leaks the outcome.'],
            ['Why not use accuracy?', 'Churners are a minority; precision, recall and PR-AUC at the chosen threshold matter.'],
          ],
        },
        {
          title: 'House price regression',
          description: 'Predict sale prices from a housing dataset: log-transform the target, handle missing values and categoricals in a ColumnTransformer, compare regularised linear models with gradient boosting, and report RMSE in dollars with residual plots by price band.',
          concepts: ['Explore and log-transform the target', 'Build the preprocessing pipeline', 'Compare linear and boosting models', 'Report errors in original units'],
          quiz: [
            ['Why log-transform price?', 'It makes errors relative and stabilises variance across cheap and expensive homes.'],
            ['How do you report RMSE after a log target?', 'Back-transform predictions and compute the error in dollars.'],
          ],
        },
        {
          title: 'Credit risk scoring',
          description: 'Build a default-probability model from loan applications: weight-of-evidence binning or a boosting model, calibrated probabilities, a scorecard-style output, evaluation with AUC, KS and calibration plots, and a fairness check across protected groups.',
          concepts: ['Prepare application and repayment data', 'Bin features and train the model', 'Calibrate probabilities', 'Evaluate discrimination and calibration', 'Check fairness by group'],
          quiz: [
            ['Why is calibration essential in credit scoring?', 'Probabilities feed pricing and capital decisions, so they must be accurate, not just ranked.'],
            ['What does the KS statistic measure?', 'The maximum separation between cumulative distributions of good and bad scores.'],
          ],
        },
        {
          title: 'Employee attrition prediction',
          description: 'Predict which employees are likely to leave from HR data: handle the small, imbalanced dataset with repeated stratified CV, avoid leaky features such as exit interview fields, and deliver a ranked risk list with the top drivers for HR to act on.',
          concepts: ['Audit features for leakage', 'Handle small imbalanced data', 'Train an interpretable model', 'Present drivers for action'],
          quiz: [
            ['Name a leaky feature in attrition data.', 'Anything recorded at or after resignation, such as exit interview scores.'],
            ['Why prefer an interpretable model here?', 'HR needs to know why an employee is at risk to intervene.'],
          ],
        },
        {
          title: 'Flight delay prediction',
          description: 'Predict whether a flight departs more than fifteen minutes late using schedule, carrier, route and weather features: build point-in-time features, validate with a time-ordered split, and deliver per-airport performance and a calibrated probability output.',
          concepts: ['Join flight and weather data', 'Build features known before departure', 'Validate on later months', 'Report per-airport metrics'],
          quiz: [
            ['Why validate on later months rather than random rows?', 'Delays are seasonal and correlated within days; random splits leak.'],
            ['Which weather feature is legitimate?', 'The forecast available before departure, not the observed weather at departure time.'],
          ],
        },
        {
          title: 'Insurance claim severity regression',
          description: 'Model claim amounts with a heavy-tailed target: compare log-linear, Tweedie and gradient boosting objectives, evaluate with MAE and quantile errors, and deliver predictions with prediction intervals suitable for reserving.',
          concepts: ['Explore the heavy-tailed target', 'Compare loss functions', 'Evaluate with MAE and quantiles', 'Produce prediction intervals'],
          quiz: [
            ['Why is squared error a poor fit for claim amounts?', 'Rare huge claims dominate the loss and destabilise the model.'],
            ['What does a Tweedie objective handle?', 'Non-negative targets with many zeros and a long tail.'],
          ],
        },
      ],
    },
    {
      title: 'Segmentation and Recommendation',
      description: 'Unsupervised structure and personalisation, with outputs a business team can use.',
      topics: [
        {
          title: 'Customer segmentation with clustering',
          description: 'Segment customers from behavioural features: scale and reduce with PCA, choose the number of clusters with silhouette and business sense, profile each cluster with distinguishing statistics, and deliver named segments with a one-line description each.',
          concepts: ['Select and scale behavioural features', 'Choose k with silhouette and judgement', 'Fit and stabilise clusters', 'Profile and name the segments'],
          quiz: [
            ['Why scale features before k-means?', 'Distances would otherwise be dominated by the largest-magnitude feature.'],
            ['How do you check cluster stability?', 'Refit on bootstrap samples and compare assignments with adjusted Rand index.'],
          ],
        },
        {
          title: 'RFM segmentation and lifetime value',
          description: 'Compute recency, frequency and monetary scores from transactions, build quantile-based RFM segments, estimate customer lifetime value per segment, and deliver a table of segments with size, value and a recommended action.',
          concepts: ['Compute RFM from transactions', 'Score by quantiles', 'Estimate lifetime value', 'Map segments to actions'],
          quiz: [
            ['Which RFM segment is "at risk"?', 'High past frequency and value but low recency.'],
            ['How is a simple lifetime value estimated?', 'Average order value times purchase frequency times expected lifetime.'],
          ],
        },
        {
          title: 'Movie recommendation system',
          description: 'Build a recommender on the MovieLens ratings: a popularity baseline, item-based collaborative filtering and matrix factorisation, evaluated with a time-based holdout using precision@10 and NDCG, plus a function returning top-N titles for a user.',
          concepts: ['Load ratings and build the matrix', 'Implement baseline and item-based CF', 'Train matrix factorisation', 'Evaluate with ranking metrics', 'Serve top-N recommendations'],
          quiz: [
            ['Why evaluate with a time-based holdout?', 'It mimics recommending future ratings from past ones.'],
            ['What does matrix factorisation learn?', 'Low-dimensional user and item vectors whose dot product predicts ratings.'],
          ],
        },
        {
          title: 'Product recommendations from implicit feedback',
          description: 'Use views and purchases rather than ratings: build a confidence-weighted implicit model such as ALS, handle the cold-start case with popularity and content features, and evaluate hit rate and coverage on held-out purchases.',
          concepts: ['Turn events into implicit signals', 'Train an implicit ALS model', 'Handle cold-start users and items', 'Evaluate hit rate and coverage'],
          quiz: [
            ['How does implicit feedback differ from ratings?', 'It has no negatives; absence means unknown, not dislike.'],
            ['What is catalogue coverage?', 'The share of products that ever get recommended.'],
          ],
        },
        {
          title: 'Topic modelling of support tickets',
          description: 'Discover themes in a corpus of support tickets with TF-IDF and NMF or LDA, tune the number of topics by coherence, label each topic, and deliver a trend chart of topic volume by week to show which issues are growing.',
          concepts: ['Clean and vectorise ticket text', 'Fit NMF or LDA', 'Choose and label topics', 'Chart topic trends over time'],
          quiz: [
            ['How do you pick the number of topics?', 'Coherence scores plus manual inspection of whether topics are distinct and nameable.'],
            ['Why chart topic volume over time?', 'Rising topics signal emerging problems for the product team.'],
          ],
        },
      ],
    },
    {
      title: 'Forecasting and Anomalies',
      description: 'Ordered data: predicting what comes next and catching what should not.',
      topics: [
        {
          title: 'Demand forecasting for a retail chain',
          description: 'Forecast daily sales per store and product family: seasonal naive and Holt-Winters baselines, a LightGBM model with calendar, promotion and lag features, rolling-origin backtesting, and a forecast file with prediction intervals for the next 28 days.',
          concepts: ['Prepare the sales panel', 'Fit baselines and boosting', 'Backtest with rolling origins', 'Generate forecasts with intervals'],
          quiz: [
            ['What baseline must the model beat?', 'Seasonal naive, using the same weekday last week or last year.'],
            ['Why include promotions as a feature?', 'They cause spikes the model would otherwise treat as noise.'],
          ],
        },
        {
          title: 'Energy load forecasting',
          description: 'Forecast hourly electricity demand a day ahead from historical load and temperature forecasts: model daily and weekly seasonality and holidays, compare SARIMAX and gradient boosting, and report MAPE by hour of day with interval coverage.',
          concepts: ['Align load and weather series', 'Engineer seasonal features', 'Compare SARIMAX and boosting', 'Report error by hour and coverage'],
          quiz: [
            ['Why is the temperature forecast usable as a feature?', 'It is known before the target hour, so no leakage.'],
            ['Which hours usually have the largest error?', 'Morning and evening ramps where load changes fastest.'],
          ],
        },
        {
          title: 'Web traffic forecasting',
          description: 'Forecast daily page views for many Wikipedia-style pages with a global gradient boosting model: log-scale targets, lag and day-of-week features, handling of missing days and spikes, and an evaluation with sMAPE across pages.',
          concepts: ['Build the multi-page panel', 'Scale and engineer features', 'Train the global model', 'Evaluate sMAPE across pages'],
          quiz: [
            ['Why use a global model for thousands of pages?', 'Shared patterns transfer and short histories benefit from other pages.'],
            ['Why log-transform page views?', 'Traffic spans orders of magnitude across pages and errors should be relative.'],
          ],
        },
        {
          title: 'Air-quality anomaly detection',
          description: 'Detect unusual pollution readings from a sensor network: STL residuals and rolling z-scores per sensor, an isolation forest on multi-sensor windows, cross-sensor consistency checks to separate real events from faulty sensors, and a daily anomaly report.',
          concepts: ['Clean and align sensor streams', 'Detect with residuals and z-scores', 'Add a multivariate detector', 'Separate events from sensor faults', 'Produce the anomaly report'],
          quiz: [
            ['How do you tell a pollution event from a broken sensor?', 'Neighbouring sensors also rise for a real event; a lone sensor deviating suggests a fault.'],
            ['Why use residuals rather than raw readings?', 'Daily and seasonal cycles would otherwise be flagged as anomalies.'],
          ],
        },
        {
          title: 'Fraud detection in card transactions',
          description: 'Build a fraud classifier on highly imbalanced transaction data: time-ordered validation, velocity features per card, PR-AUC as the metric, threshold set by review capacity, and a report on the precision of the top flagged transactions per day.',
          concepts: ['Engineer velocity features per card', 'Validate in time order', 'Train with imbalance handling', 'Set the threshold by review capacity'],
          quiz: [
            ['Why PR-AUC rather than ROC-AUC?', 'Fraud is rare and precision among flagged transactions is what analysts care about.'],
            ['What is a velocity feature?', 'Count or sum of transactions on a card in a trailing window like the last hour.'],
          ],
        },
      ],
    },
    {
      title: 'Experiments and Causal Analysis',
      description: 'Measuring whether a change caused an effect.',
      topics: [
        {
          title: 'A/B test analysis of a product change',
          description: 'Analyse an experiment on a checkout redesign from raw exposure and order logs: sample ratio check, per-user conversion and revenue metrics, proportions and Welch tests with confidence intervals, guardrail review, and a readout with a ship or no-ship recommendation.',
          concepts: ['Validate assignments and exposure', 'Build per-user metrics', 'Run tests and compute intervals', 'Check guardrails and segments', 'Write the readout'],
          quiz: [
            ['What is the first check before computing lift?', 'Sample ratio mismatch between arms.'],
            ['Why aggregate to the user before testing?', 'Users were randomised, so observations must be per user.'],
          ],
        },
        {
          title: 'Experiment planning toolkit',
          description: 'Build a reusable module and notebook that computes sample size from baseline, MDE, power and alpha for means and proportions, estimates test duration from traffic, and simulates the false positive rate of peeking to justify a fixed-horizon plan.',
          concepts: ['Implement sample size formulas', 'Estimate duration from traffic', 'Simulate peeking inflation', 'Package as a reusable tool'],
          quiz: [
            ['What happens to sample size if MDE halves?', 'It roughly quadruples.'],
            ['Why include a peeking simulation?', 'To show stakeholders concretely why early stopping inflates false positives.'],
          ],
        },
        {
          title: 'Marketing campaign impact with diff-in-diff',
          description: 'Estimate the effect of a regional marketing campaign that was not randomised: select control regions, verify parallel pre-trends, fit a two-way fixed effects model, run placebo checks, and report the effect with assumptions stated.',
          concepts: ['Select and justify control regions', 'Check pre-period trends', 'Fit the diff-in-diff model', 'Placebo tests and reporting'],
          quiz: [
            ['What assumption does diff-in-diff rely on?', 'Parallel trends between treated and control groups absent the campaign.'],
            ['What is a placebo test here?', 'Applying the method to a fake campaign date or region to confirm no effect appears.'],
          ],
        },
        {
          title: 'Uplift model for a retention offer',
          description: 'Using data from a randomised retention offer, train an uplift model to find customers whose retention the offer actually changes, evaluate with a Qini curve, and deliver a targeting rule with the expected incremental retained customers per budget.',
          concepts: ['Prepare the randomised offer data', 'Train two-model or uplift-tree approaches', 'Evaluate with Qini curves', 'Translate to a targeting rule'],
          quiz: [
            ['Why not target customers with the highest churn probability?', 'Some will not respond to any offer; uplift finds those whose behaviour the offer changes.'],
            ['What does a Qini curve show?', 'Incremental gain from targeting the top fraction of customers by predicted uplift.'],
          ],
        },
      ],
    },
    {
      title: 'Text and Unstructured Data',
      description: 'Turning free text into measurable outputs.',
      topics: [
        {
          title: 'Sentiment analysis of product reviews',
          description: 'Classify review sentiment: TF-IDF with logistic regression as the baseline, a fine-tuned or embedding-based transformer as the challenger, error analysis on sarcasm and negation, and a dashboard-ready table of sentiment by product over time.',
          concepts: ['Clean and split the reviews', 'Train the TF-IDF baseline', 'Add an embedding-based model', 'Analyse errors by category', 'Aggregate sentiment by product'],
          quiz: [
            ['Why start with TF-IDF and logistic regression?', 'It is fast, strong and gives a baseline that justifies heavier models.'],
            ['What common failure should error analysis look for?', 'Negation and sarcasm, where word presence contradicts meaning.'],
          ],
        },
        {
          title: 'Resume and job description matching',
          description: 'Rank candidate resumes against job descriptions with sentence embeddings and skill extraction: parse documents, compute similarity, add a skills-overlap feature, evaluate with recruiter-labelled pairs, and deliver a ranked shortlist with explanations.',
          concepts: ['Parse and normalise documents', 'Extract skills with rules or NER', 'Compute embedding similarity', 'Evaluate against labelled pairs'],
          quiz: [
            ['Why combine embeddings with explicit skill overlap?', 'Embeddings capture meaning; explicit skills give interpretable, checkable evidence.'],
            ['How do you evaluate a matching system?', 'With labelled relevant pairs and ranking metrics like precision@k.'],
          ],
        },
        {
          title: 'News article classification',
          description: 'Classify news articles into topics: build a text pipeline with TF-IDF and n-grams, compare linear SVM and a small transformer, report macro F1 and a confusion matrix, and expose a predict function that returns the top three categories with probabilities.',
          concepts: ['Prepare the labelled corpus', 'Build the TF-IDF pipeline', 'Compare linear and transformer models', 'Report macro F1 and confusions'],
          quiz: [
            ['Why macro F1 for topic classification?', 'Rare topics matter equally and micro F1 would hide their errors.'],
            ['Which pair of topics is usually most confused?', 'Closely related ones such as business and technology; the confusion matrix shows which.'],
          ],
        },
      ],
    },
    {
      title: 'Communication and Reproducibility',
      description: 'Projects where the deliverable is a report, a tool or a pipeline someone else runs.',
      topics: [
        {
          title: 'Executive report with charts',
          description: 'Turn one of the analysis projects into a two-page executive report: three findings with quantified impact, one clear chart per finding following good visual practice, a recommendation section and an appendix with method and data caveats.',
          concepts: ['Select the three findings', 'Design one chart per finding', 'Write the recommendation', 'Document method and caveats'],
          quiz: [
            ['What goes on the first page of an executive report?', 'The findings and recommendation, not the method.'],
            ['Why one chart per finding?', 'Each chart makes exactly one point and can be read without explanation.'],
          ],
        },
        {
          title: 'Reproducible notebook-to-report pipeline',
          description: 'Convert an exploratory notebook into a scripted pipeline: parameterised notebook or script, data validation step, cached intermediate files, an environment file, and a Makefile or task runner that regenerates the report from raw data in one command.',
          concepts: ['Refactor the notebook into modules', 'Add data validation checks', 'Parameterise and cache steps', 'One-command regeneration'],
          quiz: [
            ['Why cache intermediate outputs?', 'Rerunning after a small change should not recompute everything.'],
            ['What should the environment file pin?', 'Exact versions of every dependency so the pipeline runs identically elsewhere.'],
          ],
        },
        {
          title: 'Interactive dashboard for a model',
          description: 'Build a Streamlit or Dash app around a trained model: input controls, prediction with explanation, a data-quality panel, and a performance-over-time chart driven by logged predictions, deployed with the model artefact versioned alongside.',
          concepts: ['Design the input and output panels', 'Load the versioned model artefact', 'Show explanations per prediction', 'Add monitoring charts'],
          quiz: [
            ['Why version the model artefact with the app?', 'So the dashboard\'s predictions can be traced to the exact model that made them.'],
            ['What should the data-quality panel show?', 'Missing rates, ranges and drift of the inputs against training data.'],
          ],
        },
        {
          title: 'Model card and evaluation report',
          description: 'Write a complete model card for one of the prediction projects: intended use, training data, evaluation with intervals and slices, calibration, fairness results, known failure modes and monitoring plan, produced from a script so it updates with the model.',
          concepts: ['Gather evaluation artefacts', 'Write intended use and limitations', 'Report slices and fairness', 'Generate the card from a script'],
          quiz: [
            ['Why generate the card from code?', 'It stays consistent with the model every time it is retrained.'],
            ['What belongs in known failure modes?', 'Slices or inputs where the model performs poorly, found in error analysis.'],
          ],
        },
      ],
    },
  ],
})
