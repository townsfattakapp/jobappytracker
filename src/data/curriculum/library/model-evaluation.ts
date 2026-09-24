import { defineTrack } from '../define'

export const modelEvaluation = defineTrack({
  id: 'track-model-evaluation',
  title: 'Model Evaluation',
  description: 'Measuring models honestly: split and cross-validation protocols, regression and classification metrics, thresholds and calibration, ranking and clustering metrics, imbalanced data, error analysis, statistical model comparison, fairness and evaluation reports, ending in projects.',
  family: 'Data Science',
  kind: 'domain',
  icon: '📏',
  tags: ['model evaluation', 'metrics', 'cross-validation', 'roc-auc', 'calibration', 'fairness', 'scikit-learn'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-machine-learning'],
  style: 'practice',
  categories: [
    {
      title: 'Evaluation Protocol',
      description: 'The rules that make a score mean something about future data.',
      topics: [
        {
          title: 'Generalisation and why evaluation exists',
          description: 'Training error measures memorisation, not usefulness; evaluation estimates performance on data the model has never seen, and every protocol choice is about making that estimate unbiased and low-variance enough to support a decision.',
          concepts: ['Training versus generalisation error', 'Overfitting shows in the gap', 'Estimates have variance', 'Evaluation as decision support'],
          quiz: [
            ['Why is training accuracy a poor guide?', 'A model can memorise training rows and still fail on new ones.'],
            ['What does a big gap between train and validation score indicate?', 'Overfitting.'],
          ],
        },
        {
          title: 'Train, validation and test splits',
          description: 'The validation split tunes hyperparameters and picks models, the test split is touched once at the end; reusing the test set for choices turns it into another validation set and makes its score optimistic.',
          concepts: ['Roles of the three splits', 'Touch the test set once', 'Split ratios and dataset size', 'Random state and reproducible splits'],
          quiz: [
            ['What happens if you tune on the test set?', 'The test score becomes optimistic because choices were fitted to it.'],
            ['Why fix a random_state for splits?', 'So results are reproducible and comparisons use the same rows.'],
          ],
          prereqs: ['Generalisation and why evaluation exists'],
        },
        {
          title: 'Leakage in evaluation',
          description: 'Duplicated rows across splits, preprocessing fit on all data, and features derived from the target quietly inflate scores; each split must be independent and all fitted steps must live inside the training fold.',
          concepts: ['Duplicates spanning splits', 'Preprocessing fit before splitting', 'Target-derived features', 'Pipelines as the safeguard'],
          quiz: [
            ['Why does scaling before splitting leak?', 'Test rows influence the mean and variance used to transform training rows.'],
            ['How do near-duplicate images leak?', 'Copies of a training image in the test set make recall of memorised examples look like generalisation.'],
          ],
          prereqs: ['Train, validation and test splits'],
        },
        {
          title: 'Baselines and sanity checks',
          description: 'Every score is meaningless without a reference: majority class, mean prediction, a simple rule or last year\'s value; DummyClassifier and DummyRegressor set the floor and expose problems like a 95% accuracy that a constant prediction also achieves.',
          concepts: ['DummyClassifier and DummyRegressor', 'Simple heuristic baselines', 'Previous model as baseline', 'Detecting trivially high scores'],
          quiz: [
            ['What accuracy does a majority baseline get on 95/5 data?', '95%, which is why accuracy alone misleads there.'],
            ['Why compare against last year\'s value in forecasting?', 'A naive seasonal forecast is often hard to beat and calibrates expectations.'],
          ],
        },
        {
          title: 'Choosing a metric that matches the decision',
          description: 'The metric should reflect the cost of each error and the way predictions are used: ranking for a recommendation list, calibrated probabilities for pricing, recall for screening; picking the metric before modelling prevents optimising the wrong thing.',
          concepts: ['Map errors to business cost', 'Ranking versus classification versus probability', 'Metric chosen before modelling', 'Offline metric versus online outcome'],
          quiz: [
            ['A fraud model blocks transactions automatically. What matters most?', 'Precision at the operating threshold, since false positives block good customers.'],
            ['Why might a better offline metric not improve the product?', 'The metric may not track the user outcome, or the online context differs from the test set.'],
          ],
        },
      ],
    },
    {
      title: 'Cross-Validation Strategies',
      description: 'Using every row for both training and testing without cheating.',
      topics: [
        {
          title: 'k-fold cross-validation',
          description: 'Splitting into k folds and rotating the held-out fold gives k estimates whose mean is less noisy than a single split; the spread across folds shows how much the score depends on which rows were held out.',
          concepts: ['KFold and cross_val_score', 'Choosing k', 'Mean and spread across folds', 'Cost of k model fits'],
          quiz: [
            ['What does a large spread across folds tell you?', 'The score estimate is unstable, often because the dataset is small or heterogeneous.'],
            ['Why is k = 5 or 10 typical?', 'It balances bias from smaller training sets against compute and variance.'],
          ],
        },
        {
          title: 'Stratified and repeated cross-validation',
          description: 'Stratified folds keep class proportions equal so rare classes appear in every fold; repeating cross-validation with different shuffles averages away the luck of one particular partition.',
          concepts: ['StratifiedKFold for classification', 'RepeatedStratifiedKFold', 'Shuffling before folding', 'Variance reduction from repeats'],
          quiz: [
            ['Why stratify with a 2% positive class?', 'Random folds could contain almost no positives, making metrics undefined or noisy.'],
            ['What does repeating cross-validation reduce?', 'The variance from a single random partition.'],
          ],
          prereqs: ['k-fold cross-validation'],
        },
        {
          title: 'Group-aware cross-validation',
          description: 'When several rows come from the same patient, customer or device, random folds put the same entity on both sides and the model recognises it; GroupKFold keeps every entity in one fold so the score reflects new entities.',
          concepts: ['Rows sharing an entity', 'GroupKFold and StratifiedGroupKFold', 'Leave-one-group-out', 'Defining the right group key'],
          quiz: [
            ['When must you use GroupKFold?', 'When multiple rows belong to one entity and the model will see new entities in production.'],
            ['What does a big drop from KFold to GroupKFold reveal?', 'The model was memorising entities rather than learning transferable patterns.'],
          ],
          prereqs: ['k-fold cross-validation'],
        },
        {
          title: 'Time-series cross-validation',
          description: 'Ordered data must be validated forward in time: TimeSeriesSplit trains on the past and tests on the next block, expanding or sliding the window, with a gap to mimic the delay between the last known label and the prediction.',
          concepts: ['TimeSeriesSplit expanding windows', 'Sliding windows', 'Gap between train and test', 'Never shuffle ordered data'],
          quiz: [
            ['Why is random k-fold wrong for time series?', 'The model would train on the future and test on the past.'],
            ['What does the gap parameter simulate?', 'The delay between the last available label and the first prediction.'],
          ],
          prereqs: ['k-fold cross-validation'],
        },
        {
          title: 'Nested cross-validation',
          description: 'Tuning hyperparameters inside the same folds used for scoring makes the score optimistic; an inner loop selects hyperparameters and an outer loop estimates performance, at the cost of many more fits.',
          concepts: ['Inner loop for selection', 'Outer loop for estimation', 'Optimism from tuning on test folds', 'Compute cost trade-offs'],
          quiz: [
            ['What bias does nested CV remove?', 'Optimism from selecting hyperparameters on the folds that report the score.'],
            ['How many fits does 5x5 nested CV with 20 configurations need?', '500 plus 5 final fits.'],
          ],
          prereqs: ['Stratified and repeated cross-validation'],
        },
      ],
    },
    {
      title: 'Regression Metrics',
      description: 'Measuring numeric error in units that mean something.',
      topics: [
        {
          title: 'MAE, MSE and RMSE',
          description: 'Mean absolute error weighs every unit of error equally and is robust to outliers; mean squared error and its root punish large misses more and match a Gaussian likelihood, so the choice states which errors you care about.',
          concepts: ['MAE and the median', 'MSE, RMSE and the mean', 'Sensitivity to outliers', 'Reporting in target units'],
          quiz: [
            ['Which metric is minimised by predicting the median?', 'MAE.'],
            ['Why is RMSE always at least as large as MAE?', 'Squaring weights large errors more, so the root mean square exceeds the mean absolute value.'],
          ],
        },
        {
          title: 'R squared and adjusted R squared',
          description: 'R squared compares the model to predicting the mean, so it can be negative on test data; adjusted R squared penalises extra features, and neither says whether the errors are small enough for the use case.',
          concepts: ['Variance explained versus the mean', 'Negative R squared on held-out data', 'Adjusted for feature count', 'Not a measure of error size'],
          quiz: [
            ['Can R squared be negative?', 'Yes, on held-out data when the model is worse than predicting the mean.'],
            ['Why report RMSE alongside R squared?', 'R squared is relative; RMSE says how large the errors are in real units.'],
          ],
          prereqs: ['MAE, MSE and RMSE'],
        },
        {
          title: 'Percentage and log-scale errors',
          description: 'MAPE reports error relative to the actual value but explodes near zero and favours under-prediction; sMAPE bounds it, and RMSLE measures ratio errors, which suits targets spanning orders of magnitude.',
          concepts: ['MAPE and division by small actuals', 'sMAPE symmetry and bounds', 'RMSLE for multiplicative error', 'When relative error misleads'],
          quiz: [
            ['Why does MAPE penalise over-prediction more?', 'The denominator is the actual value, so predicting high has no bound while predicting low is capped at 100%.'],
            ['When is RMSLE appropriate?', 'When the target ranges over orders of magnitude and ratio errors matter more than absolute ones.'],
          ],
          prereqs: ['MAE, MSE and RMSE'],
        },
        {
          title: 'Residual analysis',
          description: 'Plotting residuals against predictions and against each feature reveals heteroscedasticity, non-linearity and ranges where the model fails; a quantile plot of residuals checks the error distribution that interval estimates depend on.',
          concepts: ['Residuals versus fitted values', 'Residuals by feature range', 'Heteroscedasticity patterns', 'QQ plots of residuals'],
          quiz: [
            ['What does a funnel-shaped residual plot indicate?', 'Heteroscedasticity: error variance grows with the prediction.'],
            ['What does a curved trend in residuals suggest?', 'Non-linearity the model has not captured.'],
          ],
        },
      ],
    },
    {
      title: 'Classification Metrics',
      description: 'The confusion matrix and everything derived from it.',
      topics: [
        {
          title: 'Confusion matrix and accuracy',
          description: 'True and false positives and negatives are the raw material for every classification metric; accuracy collapses them into one number that hides which errors happen, which is why it misleads on imbalanced data.',
          concepts: ['The four cell counts', 'Accuracy and its blind spot', 'Normalised confusion matrices', 'ConfusionMatrixDisplay'],
          quiz: [
            ['Which cell is a false negative?', 'A positive example predicted as negative.'],
            ['Why normalise a confusion matrix by row?', 'To see per-class recall independent of class size.'],
          ],
        },
        {
          title: 'Precision, recall and F1',
          description: 'Precision asks how many flagged items were right, recall asks how many real positives were caught, and F1 is their harmonic mean; the F-beta variant tilts toward whichever matters more for the application.',
          concepts: ['Precision from the positive predictions', 'Recall from the actual positives', 'Harmonic mean and F-beta', 'Precision-recall trade-off'],
          quiz: [
            ['A spam filter must not lose real mail. Which metric to protect?', 'Precision on the spam class, since a false positive hides a real email.'],
            ['Why the harmonic mean for F1?', 'It penalises imbalance, so a high F1 needs both precision and recall to be high.'],
          ],
          prereqs: ['Confusion matrix and accuracy'],
        },
        {
          title: 'Multiclass averaging',
          description: 'With several classes, per-class metrics are combined by macro averaging, which treats every class equally, micro averaging, which counts every example equally, or weighted averaging, and the choice changes which classes dominate the score.',
          concepts: ['Macro average and rare classes', 'Micro average equals accuracy', 'Weighted average by support', 'classification_report'],
          quiz: [
            ['Which average is best when rare classes matter?', 'Macro, because each class counts equally.'],
            ['What does micro-averaged F1 equal in single-label multiclass?', 'Accuracy.'],
          ],
          prereqs: ['Precision, recall and F1'],
        },
        {
          title: 'ROC curves and AUC',
          description: 'The ROC curve traces true positive rate against false positive rate across thresholds, and its area is the probability a random positive scores above a random negative; it is threshold-free but can look good on imbalanced data where few negatives are misranked.',
          concepts: ['TPR versus FPR across thresholds', 'AUC as ranking probability', 'Threshold independence', 'Optimism under heavy imbalance'],
          quiz: [
            ['What does AUC of 0.5 mean?', 'The model ranks positives and negatives no better than chance.'],
            ['Why can ROC-AUC look fine on a 1% positive class?', 'False positive rate stays small even when most flagged items are wrong.'],
          ],
          prereqs: ['Precision, recall and F1'],
        },
        {
          title: 'Precision-recall curves and average precision',
          description: 'Plotting precision against recall across thresholds shows performance on the positive class directly, and average precision summarises it; on rare-event problems it separates models that ROC-AUC would rank almost equal.',
          concepts: ['Precision against recall sweep', 'Average precision', 'Baseline equals positive rate', 'Choosing PR-AUC over ROC-AUC'],
          quiz: [
            ['What is the PR-AUC of a random classifier?', 'Roughly the positive class rate.'],
            ['When prefer PR-AUC?', 'When positives are rare and precision on flagged items is what matters.'],
          ],
          prereqs: ['ROC curves and AUC'],
        },
        {
          title: 'Log loss and Brier score',
          description: 'Proper scoring rules evaluate the probabilities themselves: log loss punishes confident wrong predictions without bound, the Brier score is the mean squared error of probabilities, and both reward calibration as well as discrimination.',
          concepts: ['Log loss and confident mistakes', 'Brier score decomposition', 'Proper scoring rules', 'Clipping probabilities'],
          quiz: [
            ['What happens to log loss when a wrong prediction has probability 1?', 'It is infinite, which is why probabilities are clipped.'],
            ['Which is better: a model with higher AUC or lower log loss?', 'Depends on use: AUC measures ranking, log loss measures probability quality.'],
          ],
        },
      ],
    },
    {
      title: 'Thresholds, Calibration and Costs',
      description: 'Turning scores into decisions the business can live with.',
      topics: [
        {
          title: 'Threshold selection',
          description: 'A classifier outputs a score; the threshold decides the operating point, and choosing it by required precision, required recall, Youden\'s J or expected value replaces the default of 0.5 with one that matches the deployment.',
          concepts: ['Operating points on the curve', 'Threshold for a target recall', 'Youden\'s J and F1-optimal thresholds', 'TunedThresholdClassifierCV'],
          quiz: [
            ['Why is 0.5 rarely the right threshold?', 'It ignores class imbalance and the different costs of each error.'],
            ['How do you set a threshold for 90% recall?', 'Find the lowest score at which 90% of validation positives are captured.'],
          ],
          prereqs: ['Precision-recall curves and average precision'],
        },
        {
          title: 'Cost-sensitive evaluation',
          description: 'Assigning a cost to each confusion-matrix cell turns evaluation into expected cost, so a threshold or model is chosen by money saved rather than an abstract score; the cost matrix comes from the business, not the data.',
          concepts: ['Cost matrix per cell', 'Expected cost of a threshold', 'Profit curves', 'Eliciting costs from stakeholders'],
          quiz: [
            ['A false negative costs 100 and a false positive 5. Where does the threshold move?', 'Lower, to catch more positives at the expense of more false alarms.'],
            ['What is a profit curve?', 'Expected profit plotted against the fraction of instances flagged.'],
          ],
          prereqs: ['Threshold selection'],
        },
        {
          title: 'Calibration curves',
          description: 'A calibrated model\'s 70% predictions come true 70% of the time; reliability diagrams bin predictions and compare predicted to observed rates, and expected calibration error summarises the gap, which matters whenever probabilities feed a decision.',
          concepts: ['Reliability diagram binning', 'Expected calibration error', 'Over- and under-confidence patterns', 'Calibration versus discrimination'],
          quiz: [
            ['What does a reliability curve below the diagonal indicate?', 'Over-confidence: predicted probabilities exceed observed rates.'],
            ['Can a model have high AUC and poor calibration?', 'Yes; ranking can be right while the probability scale is off.'],
          ],
          prereqs: ['Log loss and Brier score'],
        },
        {
          title: 'Calibration methods',
          description: 'Platt scaling fits a logistic curve to the scores and isotonic regression fits a monotone step function; both are trained on held-out data through CalibratedClassifierCV, and isotonic needs more data to avoid overfitting.',
          concepts: ['Platt scaling with logistic fit', 'Isotonic regression', 'CalibratedClassifierCV', 'Calibration data must be held out'],
          quiz: [
            ['Which method needs more data?', 'Isotonic regression, because it fits a flexible step function.'],
            ['Why calibrate on data the model did not train on?', 'Training scores are overconfident and would produce a biased mapping.'],
          ],
          prereqs: ['Calibration curves'],
        },
      ],
    },
    {
      title: 'Ranking and Clustering Metrics',
      description: 'Evaluating outputs that are lists or groups rather than labels.',
      topics: [
        {
          title: 'Precision at k and mean average precision',
          description: 'For search and recommendation, only the top of the list is seen, so precision@k and recall@k score the first k results and mean average precision rewards placing relevant items early, averaged over queries.',
          concepts: ['Precision@k and recall@k', 'Average precision per query', 'MAP across queries', 'Choosing k from the interface'],
          quiz: [
            ['Why does precision@10 matter more than overall precision for search?', 'Users only see the first page of results.'],
            ['How does MAP reward ordering?', 'Relevant items ranked earlier contribute higher precision values to the average.'],
          ],
        },
        {
          title: 'NDCG and graded relevance',
          description: 'Normalised discounted cumulative gain handles relevance grades rather than binary labels and discounts positions logarithmically, then normalises by the ideal ordering so scores compare across queries with different numbers of relevant items.',
          concepts: ['Gain from graded relevance', 'Logarithmic position discount', 'Normalising by the ideal DCG', 'NDCG@k'],
          quiz: [
            ['Why normalise DCG?', 'So queries with many relevant items do not automatically score higher.'],
            ['What is the discount for position 2 in NDCG?', 'log2(3), roughly 1.58.'],
          ],
          prereqs: ['Precision at k and mean average precision'],
        },
        {
          title: 'Offline evaluation of recommenders',
          description: 'Recommendation logs only show outcomes for items that were shown, so offline metrics are biased toward the old policy; time-based splits, coverage and diversity measures and inverse propensity weighting narrow the gap before an online test.',
          concepts: ['Exposure bias in logged data', 'Time-based holdout per user', 'Coverage and diversity metrics', 'Inverse propensity scoring'],
          quiz: [
            ['Why do offline recommender metrics favour the current system?', 'Logged positives are items the current system chose to show.'],
            ['What does catalogue coverage measure?', 'The share of items the recommender ever recommends.'],
          ],
          prereqs: ['NDCG and graded relevance'],
        },
        {
          title: 'Internal clustering metrics',
          description: 'Without labels, silhouette score compares each point\'s cohesion to its separation, and Davies-Bouldin and Calinski-Harabasz score compactness against spread; they guide the number of clusters but favour convex, equal-sized clusters.',
          concepts: ['Silhouette score per point', 'Davies-Bouldin index', 'Calinski-Harabasz index', 'Elbow method and its limits'],
          quiz: [
            ['What silhouette value indicates a point on the boundary between clusters?', 'Around 0.'],
            ['Why can internal metrics mislead for density-based clusters?', 'They assume compact, roughly spherical clusters.'],
          ],
        },
        {
          title: 'External clustering metrics',
          description: 'When ground-truth groups exist, adjusted Rand index and normalised mutual information compare the clustering to them while correcting for chance agreement, and homogeneity and completeness diagnose which way the clustering errs.',
          concepts: ['Adjusted Rand index', 'Normalised mutual information', 'Homogeneity and completeness', 'Chance correction'],
          quiz: [
            ['What does an adjusted Rand index of 0 mean?', 'Agreement no better than random labelling.'],
            ['What does low completeness mean?', 'Members of one true class are spread across several clusters.'],
          ],
          prereqs: ['Internal clustering metrics'],
        },
      ],
    },
    {
      title: 'Imbalance, Error Analysis and Curves',
      description: 'Finding where and why the model fails.',
      topics: [
        {
          title: 'Evaluating imbalanced data',
          description: 'When positives are rare, accuracy and ROC-AUC flatter the model; stratified splits, PR-AUC, per-class recall and balanced accuracy show the true picture, and resampling must happen only inside the training fold.',
          concepts: ['Metrics that survive imbalance', 'Balanced accuracy', 'Resampling inside the fold only', 'Threshold matters more than resampling'],
          quiz: [
            ['Where must SMOTE or undersampling be applied?', 'Only to the training fold, never to validation or test data.'],
            ['What is balanced accuracy?', 'The mean of recall over classes.'],
          ],
          prereqs: ['Precision-recall curves and average precision'],
        },
        {
          title: 'Error analysis',
          description: 'Reading the worst mistakes by hand, grouping them by cause and estimating how much each cause costs turns a score into a work plan; it finds label noise, missing features and ambiguous cases faster than any metric.',
          concepts: ['Sampling and reading errors', 'Categorising failure causes', 'Estimating headroom per cause', 'Label noise discovery'],
          quiz: [
            ['What is the first step of error analysis?', 'Look at a sample of misclassified examples and label the reason for each.'],
            ['How does error analysis prioritise work?', 'By the share of errors each cause explains and how fixable it is.'],
          ],
        },
        {
          title: 'Slicing and subgroup performance',
          description: 'A model with 92% accuracy overall may be at 70% for one country or device; computing metrics per slice, with intervals that reflect small slice sizes, reveals where the model is unreliable and which groups need more data.',
          concepts: ['Metrics per segment', 'Small-slice uncertainty', 'Automatic slice discovery', 'Slice-based acceptance criteria'],
          quiz: [
            ['Why show a confidence interval for each slice?', 'Small slices produce noisy metrics that can look alarming or reassuring by chance.'],
            ['What should happen when one slice underperforms badly?', 'Investigate data coverage for that slice and set a per-slice acceptance threshold.'],
          ],
          prereqs: ['Error analysis'],
        },
        {
          title: 'Learning curves',
          description: 'Plotting training and validation score against training set size shows whether more data would help: converging curves at a low score mean high bias, a persistent gap means high variance, and a still-rising validation curve means collect more.',
          concepts: ['Score versus training size', 'Reading bias from the plateau', 'Reading variance from the gap', 'Deciding whether to collect data'],
          quiz: [
            ['Both curves plateau at a low score. What is the problem?', 'High bias; the model is too simple or the features are weak.'],
            ['The validation curve is still climbing at full size. Recommendation?', 'Collect more data; it is likely to help.'],
          ],
        },
        {
          title: 'Validation curves and bias-variance',
          description: 'Sweeping one hyperparameter and plotting train and validation scores shows where underfitting turns into overfitting; it explains why a complex model can lose to a simpler one and where the sweet spot lies.',
          concepts: ['validation_curve over a hyperparameter', 'Underfitting region', 'Overfitting region', 'Bias-variance decomposition'],
          quiz: [
            ['What does a rising training score with a falling validation score mean?', 'The model is starting to overfit as complexity grows.'],
            ['How does a validation curve differ from a learning curve?', 'It varies a hyperparameter; a learning curve varies the training size.'],
          ],
          prereqs: ['Learning curves'],
        },
      ],
    },
    {
      title: 'Comparing Models and Fairness',
      description: 'Deciding whether one model is really better, and for whom.',
      topics: [
        {
          title: 'Uncertainty in metric estimates',
          description: 'A 0.3 point AUC difference on a 2,000-row test set is often noise; bootstrapping the test set or using fold-level scores gives confidence intervals for a metric and for the difference between two models.',
          concepts: ['Bootstrap intervals for a metric', 'Interval for a difference', 'Fold scores as samples', 'Test set size and resolution'],
          quiz: [
            ['How do you get a confidence interval for AUC?', 'Bootstrap the test set and compute AUC on each resample.'],
            ['Why does a small test set limit what you can conclude?', 'The interval is wide, so small improvements cannot be distinguished from noise.'],
          ],
        },
        {
          title: 'Paired statistical tests for models',
          description: 'Two models evaluated on the same folds or examples are paired, so a paired t-test on fold scores, McNemar\'s test on disagreements or a Wilcoxon signed-rank test is more sensitive than treating scores as independent.',
          concepts: ['Paired t-test on fold scores', 'McNemar\'s test on disagreements', 'Wilcoxon signed-rank test', 'Correlated folds and inflated significance'],
          quiz: [
            ['Why use McNemar\'s test?', 'It compares two classifiers on the same examples using only the cases where they disagree.'],
            ['What is the issue with a t-test over cross-validation folds?', 'Folds share training data, so scores are correlated and variance is underestimated.'],
          ],
          prereqs: ['Uncertainty in metric estimates'],
        },
        {
          title: 'Comparing many models and configurations',
          description: 'Selecting the best of fifty configurations on validation data guarantees an optimistic winner; a held-out test set, correction for multiple comparisons, or a Friedman test with post-hoc Nemenyi across datasets keep the comparison honest.',
          concepts: ['Winner\'s curse in selection', 'Friedman and Nemenyi tests', 'Correcting for many comparisons', 'Confirming on a fresh test set'],
          quiz: [
            ['Why is the best of many validation scores optimistic?', 'Some configurations look good by chance, and selection picks them.'],
            ['When is a Friedman test used?', 'To compare several models across multiple datasets or folds at once.'],
          ],
          prereqs: ['Paired statistical tests for models'],
        },
        {
          title: 'Fairness metrics',
          description: 'Demographic parity compares positive rates across groups, equalised odds compares error rates, and calibration within groups checks probability meaning; these definitions conflict mathematically, so the choice is a policy decision measured with fairlearn or by hand.',
          concepts: ['Demographic parity difference', 'Equalised odds and equal opportunity', 'Calibration within groups', 'Impossibility of satisfying all'],
          quiz: [
            ['What does equal opportunity require?', 'Equal true positive rates across groups.'],
            ['Can a model satisfy demographic parity and equalised odds at once?', 'Generally not when base rates differ between groups.'],
          ],
          prereqs: ['Slicing and subgroup performance'],
        },
        {
          title: 'Evaluating fairness interventions',
          description: 'Reweighting, threshold adjustment per group and constrained training each shift the trade-off between accuracy and a fairness metric; evaluating them means plotting that trade-off, checking intersectional groups and documenting what was chosen and why.',
          concepts: ['Per-group thresholds', 'Reweighting and constrained training', 'Accuracy-fairness trade-off curves', 'Intersectional subgroups'],
          quiz: [
            ['What does adjusting thresholds per group do?', 'Equalises a chosen rate across groups at the cost of overall accuracy or consistency.'],
            ['Why check intersectional groups?', 'A model can be fair per attribute yet unfair for combinations like young women.'],
          ],
          prereqs: ['Fairness metrics'],
        },
      ],
    },
    {
      title: 'Reporting and Monitoring',
      description: 'Communicating evaluation and keeping it true after deployment.',
      topics: [
        {
          title: 'Evaluation reports and model cards',
          description: 'A report states the data and split, metrics with intervals, baselines, slice results, calibration, known failure modes and the intended use; a model card packages this so a reader can judge whether the model fits their situation.',
          concepts: ['Structure of an evaluation report', 'Model card sections', 'Reporting intervals and baselines', 'Documenting limitations'],
          quiz: [
            ['What must accompany every headline metric in a report?', 'The baseline, the data it was computed on and an uncertainty estimate.'],
            ['What is a model card?', 'A standard document describing a model\'s intended use, data, performance and limitations.'],
          ],
          prereqs: ['Uncertainty in metric estimates'],
        },
        {
          title: 'Reproducible evaluation',
          description: 'Fixed seeds, versioned data snapshots, pinned library versions and a scripted evaluation that runs from raw data to metrics make results checkable months later; experiment trackers record every run with its configuration.',
          concepts: ['Seeds and deterministic splits', 'Versioned datasets', 'Evaluation as a script', 'Experiment tracking tools'],
          quiz: [
            ['Why script the evaluation instead of running a notebook?', 'So it can be re-run identically and diffed when the data or model changes.'],
            ['What should an experiment tracker record?', 'Code version, data version, parameters, metrics and artefacts for each run.'],
          ],
        },
        {
          title: 'Post-deployment monitoring and drift',
          description: 'Offline scores age: input distributions shift, labels arrive late, and performance decays; monitoring feature drift, prediction distributions and delayed-label metrics tells you when to re-evaluate or retrain.',
          concepts: ['Feature and prediction drift', 'Delayed labels and proxy metrics', 'Retraining triggers', 'Shadow and champion-challenger evaluation'],
          quiz: [
            ['What can you monitor before labels arrive?', 'Input feature distributions and the distribution of predictions.'],
            ['What is a champion-challenger setup?', 'A new model scores live traffic alongside the current one and is compared before promotion.'],
          ],
          prereqs: ['Reproducible evaluation'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: credit scoring evaluation suite',
          description: 'Evaluate a default-risk classifier end to end: stratified CV, ROC and PR curves, calibration and Brier score, a cost-based threshold, slice metrics by income band and a fairness check by age group, all in one reproducible script.',
          concepts: ['Set up stratified evaluation', 'Compute discrimination and calibration', 'Choose the threshold by cost', 'Report slices and fairness'],
          quiz: [
            ['Why calibrate a credit model?', 'Its probabilities feed pricing and capital decisions, so they must mean what they say.'],
            ['Which fairness metric fits lending?', 'Often equal opportunity, so creditworthy applicants are approved at equal rates across groups.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: model comparison with statistical rigour',
          description: 'Compare logistic regression, random forest and gradient boosting on one dataset with repeated stratified CV, bootstrap intervals, paired tests and a nested-CV estimate for the tuned winner, then write the recommendation.',
          concepts: ['Run repeated cross-validation', 'Bootstrap the metric differences', 'Apply paired tests', 'Nested CV for the winner'],
          quiz: [
            ['Two models differ by 0.004 AUC with overlapping intervals. Conclusion?', 'No evidence of a real difference; choose on cost or simplicity.'],
            ['Why report the nested CV score rather than the best inner score?', 'The inner score is optimistic from selection.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: search ranking evaluation',
          description: 'Given a query log with graded relevance judgements, compute precision@k, MAP and NDCG@10 for two ranking functions, analyse per-query differences, and test whether the improvement is significant across queries.',
          concepts: ['Load judgements and rankings', 'Implement the ranking metrics', 'Per-query comparison', 'Significance across queries'],
          quiz: [
            ['Why compare per query rather than pooled?', 'Queries are the natural unit and a few easy queries can dominate pooled averages.'],
            ['What does NDCG@10 of 0.8 mean?', 'The top ten is 80% as good as the ideal ordering by discounted gain.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: error analysis and slice report',
          description: 'Take a trained text or tabular classifier, sample its errors, label failure causes, compute metrics per slice with intervals, produce learning curves and deliver a prioritised list of improvements with expected gains.',
          concepts: ['Sample and annotate errors', 'Build the slice table', 'Draw learning curves', 'Prioritise fixes with estimates'],
          quiz: [
            ['How do you estimate the gain from fixing one error category?', 'Assume those errors are corrected and recompute the metric.'],
            ['What does a large label-noise category imply?', 'Relabelling data may beat any modelling change.'],
          ],
          style: 'project',
        },
        {
          title: 'Model evaluation interview questions',
          description: 'The questions that recur: precision versus recall for a given product, why accuracy fails on imbalance, ROC-AUC versus PR-AUC, how to validate time-ordered data, what calibration is, and how to tell whether a new model is really better.',
          concepts: ['Metric choice case questions', 'Validation protocol questions', 'Calibration and threshold questions', 'Explaining uncertainty to stakeholders'],
          quiz: [
            ['A model has 99% accuracy on fraud data. Is it good?', 'Not necessarily; with 1% fraud a constant prediction gets the same, so check recall and PR-AUC.'],
            ['How do you validate a model for next month\'s data?', 'With time-ordered splits that train on the past and test on the following period.'],
          ],
          style: 'reading',
        },
        {
          title: 'Metric implementation drills',
          description: 'Implement precision, recall, F1, ROC-AUC via the rank formula, NDCG and log loss from scratch with numpy, verify against scikit-learn, and explain each edge case such as no positive predictions or a single class.',
          concepts: ['Metrics from confusion counts', 'AUC from ranks', 'NDCG by hand', 'Edge cases and zero division'],
          quiz: [
            ['How do you compute AUC from ranks?', 'Sum the ranks of positives, subtract n_pos(n_pos+1)/2, divide by n_pos times n_neg.'],
            ['What is precision when there are no positive predictions?', 'Undefined; scikit-learn returns 0 with a warning by default.'],
          ],
        },
      ],
    },
  ],
})
