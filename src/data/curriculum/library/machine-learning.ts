import { defineTrack } from '../define'

export const machineLearning = defineTrack({
  id: 'track-machine-learning',
  title: 'Machine Learning',
  description: 'Classical machine learning done properly with scikit-learn: preprocessing and features, regression and classification models from linear to gradient boosting, clustering and dimensionality reduction, honest model selection, metrics, calibration, tuning, imbalanced data, interpretability and production-ready pipelines.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🤖',
  tags: ['machine learning', 'scikit-learn', 'regression', 'classification', 'clustering', 'evaluation', 'xgboost'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python-ai', 'track-math-ai'],
  style: 'practice',
  categories: [
    {
      title: 'Learning Paradigms and Workflow',
      description: 'What machine learning is optimising and how a project is structured around it.',
      topics: [
        {
          title: 'Supervised learning: inputs, targets and hypotheses',
          description: 'Supervised learning fits a function from feature vectors to a target using labelled examples and a loss that scores mistakes. Framing a problem as regression or classification and choosing the target definition decides everything downstream.',
          concepts: ['Features, targets and examples', 'Regression versus classification targets', 'Hypothesis space and loss', 'Empirical risk minimisation'],
          quiz: [
            ['What distinguishes regression from classification?', 'Regression predicts a continuous value; classification predicts a category.'],
            ['What is empirical risk?', 'The average loss over the training examples.'],
          ],
        },
        {
          title: 'Unsupervised learning: structure without labels',
          description: 'Without targets, algorithms look for clusters, low-dimensional structure or anomalies. Because there is no ground truth, evaluation relies on internal measures and on whether the structure is useful for a downstream task.',
          concepts: ['Clustering, reduction and anomaly detection', 'Why evaluation is harder', 'Unsupervised outputs as features', 'Semi-supervised set-ups'],
          quiz: [
            ['Why is unsupervised evaluation harder?', 'There are no labels to compare predictions against.'],
            ['Give one use of clustering in a supervised project.', 'Cluster ids or distances as extra features.'],
          ],
        },
        {
          title: 'The ML project workflow',
          description: 'Define the decision and metric, gather and split data, build a baseline, iterate on features and models with validation, evaluate once on test, then deploy and monitor. Skipping the baseline or the honest test is where projects go wrong.',
          concepts: ['Decision, metric and acceptance bar', 'Baseline before modelling', 'Iterate on validation only', 'One final test evaluation'],
          quiz: [
            ['What is the first model to build?', 'A trivial baseline such as the mean or the majority class.'],
            ['How many times should the test set be evaluated?', 'Once, at the end.'],
          ],
          prereqs: ['Supervised learning: inputs, targets and hypotheses'],
        },
        {
          title: 'Train, validation and test protocol',
          description: 'train_test_split with stratification for classification, grouped splits when rows share an entity, and time-ordered splits for temporal data. The split must mimic how the model will meet new data in production.',
          concepts: ['train_test_split and stratify', 'GroupShuffleSplit for entities', 'Time-ordered splits', 'Split mimics deployment'],
          quiz: [
            ['Why stratify a classification split?', 'To keep class proportions equal across splits, especially for rare classes.'],
            ['When must rows of the same customer stay in one split?', 'Whenever the model will be applied to unseen customers.'],
          ],
          prereqs: ['The ML project workflow'],
        },
      ],
    },
    {
      title: 'Data Preprocessing',
      description: 'The transformations that make raw columns usable, and how to apply them without leaking.',
      topics: [
        {
          title: 'Handling missing values',
          description: 'Missing data can be dropped, imputed with a constant, mean, median or model, or flagged with an indicator column. The right choice depends on why values are missing and whether the model can use the missingness signal.',
          concepts: ['Missing at random or not', 'SimpleImputer strategies', 'Indicator columns for missingness', 'Tree models and native NaN handling'],
          quiz: [
            ['Why add a missing-indicator column?', 'Missingness itself can be predictive.'],
            ['Which scikit-learn models accept NaN directly?', 'HistGradientBoostingClassifier and Regressor.'],
          ],
        },
        {
          title: 'Scaling and normalisation',
          description: 'Distance- and gradient-based models need features on comparable scales; StandardScaler, MinMaxScaler and RobustScaler achieve that in different ways. Trees do not care, so scaling is a per-model decision.',
          concepts: ['StandardScaler and z-scores', 'MinMaxScaler and RobustScaler', 'Which models need scaling', 'Fit on train, apply to test'],
          quiz: [
            ['Does a random forest need scaled features?', 'No, splits are invariant to monotonic scaling.'],
            ['Which scaler resists outliers?', 'RobustScaler, using median and IQR.'],
          ],
        },
        {
          title: 'Encoding categorical variables',
          description: 'One-hot encoding for low cardinality, ordinal encoding when order exists, and target or frequency encoding for high-cardinality columns. Unknown categories at prediction time must be handled explicitly.',
          concepts: ['OneHotEncoder and handle_unknown', 'OrdinalEncoder for ordered categories', 'Target encoding with leakage control', 'High-cardinality strategies'],
          quiz: [
            ['What happens with an unseen category at prediction time?', 'OneHotEncoder errors unless handle_unknown="ignore" or "infrequent_if_exist".'],
            ['Why is naive target encoding risky?', 'It leaks the label into the feature unless done out-of-fold.'],
          ],
        },
        {
          title: 'Outliers and transformations',
          description: 'Log and Box-Cox transforms tame skewed distributions, clipping limits extreme values, and quantile transforms make features uniform or normal. Whether to remove outliers depends on whether they are errors or the phenomenon of interest.',
          concepts: ['Detecting outliers with IQR and z-scores', 'Log and power transforms', 'Clipping and winsorising', 'QuantileTransformer'],
          quiz: [
            ['When should you keep outliers?', 'When they are real events the model must handle, such as fraud.'],
            ['Why log-transform a target like price?', 'It makes multiplicative effects additive and reduces the influence of huge values.'],
          ],
        },
        {
          title: 'Leakage through preprocessing',
          description: 'Fitting a scaler, imputer or encoder on the whole dataset leaks test statistics into training. Every learned transformation belongs inside the pipeline so it is fitted per fold and per training set.',
          concepts: ['Where leakage sneaks in', 'Fit inside the cross-validation fold', 'Pipeline as the leakage guard', 'Auditing a suspiciously good score'],
          quiz: [
            ['Is fitting StandardScaler on all data before splitting leakage?', 'Yes, the test mean and variance influence training.'],
            ['What is the simplest way to prevent preprocessing leakage?', 'Put every transformer in a Pipeline and cross-validate the pipeline.'],
          ],
          prereqs: ['Scaling and normalisation', 'Encoding categorical variables'],
        },
      ],
    },
    {
      title: 'Feature Engineering Essentials',
      description: 'Where most of the accuracy in tabular problems actually comes from.',
      topics: [
        {
          title: 'Features from domain knowledge',
          description: 'Ratios, differences, rates and aggregates that encode what an expert would look at give models signal they cannot easily learn from raw columns. Writing down hypotheses before engineering keeps the effort focused.',
          concepts: ['Ratios and differences', 'Aggregates per entity', 'Counts and recency', 'Hypothesis-driven features'],
          quiz: [
            ['Why is debt-to-income better than debt and income separately for a linear model?', 'The linear model cannot form the ratio on its own.'],
            ['What is a recency feature?', 'Time since the last relevant event, such as days since last purchase.'],
          ],
        },
        {
          title: 'Binning, interactions and polynomial features',
          description: 'Discretising a numeric feature, multiplying pairs of features and adding polynomial terms let linear models capture non-linear and interaction effects. Tree ensembles find these themselves, so this matters most for linear and distance models.',
          concepts: ['KBinsDiscretizer', 'Interaction terms', 'PolynomialFeatures and its blow-up', 'Spline features'],
          quiz: [
            ['How many features does PolynomialFeatures(degree=2) create from 10 inputs?', '66 including the bias, so it grows quickly.'],
            ['Why bin a numeric feature for a linear model?', 'To let it fit a step-wise non-linear effect.'],
          ],
          prereqs: ['Features from domain knowledge'],
        },
        {
          title: 'Text and date features',
          description: 'TF-IDF and bag-of-words turn text into sparse vectors; dates become day of week, month, holiday flags and cyclical sine/cosine encodings. These are the standard first features for two very common column types.',
          concepts: ['CountVectorizer and TfidfVectorizer', 'n-grams and vocabulary limits', 'Calendar components from dates', 'Cyclical encoding with sine and cosine'],
          quiz: [
            ['Why encode hour of day with sine and cosine?', 'So 23:00 and 00:00 are close, which integer encoding breaks.'],
            ['What does TF-IDF down-weight?', 'Words that appear in most documents.'],
          ],
        },
        {
          title: 'Feature selection',
          description: 'Removing irrelevant or redundant features reduces overfitting, speeds training and simplifies explanation. Filter methods score features individually, wrapper methods use the model, and embedded methods such as L1 do it during fitting.',
          concepts: ['Variance and correlation filters', 'Univariate scores with SelectKBest', 'Recursive feature elimination', 'L1-based and importance-based selection'],
          quiz: [
            ['What is the risk of selecting features on the full dataset?', 'Leakage: the selection has seen the test labels.'],
            ['Which method uses the model itself to rank features?', 'Recursive feature elimination.'],
          ],
          prereqs: ['Binning, interactions and polynomial features'],
        },
      ],
    },
    {
      title: 'Regression',
      description: 'Predicting numbers, from the straight line to gradient boosting.',
      topics: [
        {
          title: 'Linear regression and least squares',
          description: 'Ordinary least squares fits weights that minimise squared error and has a closed-form solution. Its assumptions, coefficient interpretation and residual plots make it the reference model every other regressor is compared against.',
          concepts: ['OLS objective and solution', 'Interpreting coefficients', 'Residual plots and assumptions', 'Multicollinearity'],
          quiz: [
            ['What does a coefficient of 2.5 on square metres mean?', 'Each extra square metre adds 2.5 units to the prediction, holding others fixed.'],
            ['What does a funnel-shaped residual plot indicate?', 'Heteroscedasticity: error variance grows with the prediction.'],
          ],
        },
        {
          title: 'Ridge, Lasso and Elastic Net',
          description: 'Adding an L2 penalty (Ridge) shrinks coefficients and handles collinearity; L1 (Lasso) drives some to exactly zero for feature selection; Elastic Net mixes both. The penalty strength alpha is tuned by cross-validation.',
          concepts: ['Ridge and coefficient shrinkage', 'Lasso and sparsity', 'Elastic Net mixing', 'Tuning alpha with RidgeCV and LassoCV'],
          quiz: [
            ['Which penalty produces exact zeros?', 'L1, used by Lasso.'],
            ['Why scale features before Ridge or Lasso?', 'The penalty treats all coefficients equally, so unscaled features are penalised unfairly.'],
          ],
          prereqs: ['Linear regression and least squares'],
        },
        {
          title: 'Decision trees for regression',
          description: 'A regression tree splits the feature space into boxes and predicts the mean in each, chosen greedily to reduce squared error. Trees capture interactions and non-linearity with no scaling, but overfit unless depth or leaf size is limited.',
          concepts: ['Greedy splitting on squared error', 'Depth and min_samples_leaf', 'Piecewise-constant predictions', 'Extrapolation failure'],
          quiz: [
            ['What does a regression tree predict in a leaf?', 'The mean target of the training rows in that leaf.'],
            ['Can a tree predict values outside the training range?', 'No, it only outputs leaf means.'],
          ],
        },
        {
          title: 'Random forests',
          description: 'Averaging many deep trees trained on bootstrap samples with random feature subsets reduces variance dramatically. Forests are a strong, low-tuning default and provide out-of-bag error and feature importances for free.',
          concepts: ['Bootstrap sampling and bagging', 'Random feature subsets', 'Out-of-bag estimates', 'Impurity-based importance and its bias'],
          quiz: [
            ['Why does averaging trees reduce variance?', 'Errors of decorrelated trees partially cancel.'],
            ['What is the out-of-bag score?', 'Validation error from rows each tree did not see in its bootstrap sample.'],
          ],
          prereqs: ['Decision trees for regression'],
        },
        {
          title: 'Gradient boosting machines',
          description: 'Boosting fits shallow trees sequentially, each on the residuals of the ensemble so far, scaled by a learning rate. XGBoost, LightGBM and HistGradientBoosting are the strongest tabular models and the ones to tune carefully.',
          concepts: ['Sequential fitting on residuals', 'Learning rate and number of trees', 'Early stopping on validation', 'XGBoost, LightGBM and HistGradientBoosting'],
          quiz: [
            ['What does a smaller learning rate require?', 'More trees to reach the same fit.'],
            ['What is early stopping in boosting?', 'Stop adding trees when the validation loss stops improving.'],
          ],
          prereqs: ['Random forests'],
        },
      ],
    },
    {
      title: 'Classification',
      description: 'Predicting categories and probabilities.',
      topics: [
        {
          title: 'Logistic regression',
          description: 'A linear model passed through a sigmoid gives calibrated-ish class probabilities, trained by minimising cross-entropy. It is interpretable, fast and the baseline every classifier must beat; regularisation strength C controls overfitting.',
          concepts: ['Sigmoid and log-odds', 'Cross-entropy training', 'Regularisation parameter C', 'Multinomial classification'],
          quiz: [
            ['What does a coefficient of 0.7 mean in logistic regression?', 'A one-unit increase multiplies the odds by e^0.7 ≈ 2.'],
            ['Does a larger C mean more or less regularisation?', 'Less; C is the inverse of the penalty strength.'],
          ],
        },
        {
          title: 'Support vector machines',
          description: 'SVMs find the boundary with the largest margin and use the kernel trick to separate data that is not linearly separable. They work well on medium-sized, scaled data but do not scale to millions of rows or give probabilities directly.',
          concepts: ['Maximum margin and support vectors', 'Soft margins and C', 'RBF kernel and gamma', 'Scaling and computational limits'],
          quiz: [
            ['What are support vectors?', 'The training points closest to the decision boundary that define it.'],
            ['What happens with a very large gamma in an RBF SVM?', 'Each point influences only its neighbourhood, so the model overfits.'],
          ],
        },
        {
          title: 'k-nearest neighbours',
          description: 'Predict by majority vote of the k closest training points. It has no training phase, is sensitive to scaling and the curse of dimensionality, and shows why distance metrics and k matter.',
          concepts: ['Distance metrics and scaling', 'Choosing k', 'Curse of dimensionality', 'Prediction cost and indexing'],
          quiz: [
            ['Why does kNN need scaled features?', 'Distances are dominated by features with large ranges.'],
            ['What does a very small k cause?', 'High variance and noisy boundaries.'],
          ],
        },
        {
          title: 'Decision trees for classification',
          description: 'Trees split on Gini impurity or entropy to produce pure leaves and are read as if-then rules. They are the interpretable building block of forests and boosting and the model to reach for when rules must be explained.',
          concepts: ['Gini and entropy criteria', 'Reading a tree as rules', 'Pruning with max_depth and ccp_alpha', 'Class probabilities from leaves'],
          quiz: [
            ['What does Gini impurity measure?', 'How mixed the classes are in a node.'],
            ['What is cost-complexity pruning?', 'Removing subtrees whose gain does not justify their size, controlled by ccp_alpha.'],
          ],
        },
        {
          title: 'Naive Bayes',
          description: 'Naive Bayes applies Bayes\' theorem assuming features are conditionally independent given the class. Despite the wrong assumption it is fast and strong for text, and its failure modes teach how probabilistic classifiers work.',
          concepts: ['Conditional independence assumption', 'Multinomial and Bernoulli variants', 'Gaussian naive Bayes', 'Smoothing'],
          quiz: [
            ['Which naive Bayes variant suits word counts?', 'MultinomialNB.'],
            ['Why are naive Bayes probabilities often extreme?', 'Independence double-counts correlated evidence.'],
          ],
        },
        {
          title: 'Ensembles: bagging, boosting and stacking',
          description: 'Bagging averages models trained on resamples to cut variance, boosting adds models that fix previous errors to cut bias, and stacking learns how to combine different models. Knowing which problem each solves guides model choice.',
          concepts: ['Bagging reduces variance', 'Boosting reduces bias', 'Stacking with a meta-learner', 'Voting classifiers', 'Diversity as the key ingredient'],
          quiz: [
            ['Which ensemble method is most prone to overfitting noisy labels?', 'Boosting, because it keeps focusing on hard examples.'],
            ['Why must stacking use out-of-fold predictions?', 'Otherwise the meta-learner trains on overfitted base predictions.'],
          ],
          prereqs: ['Decision trees for classification', 'Logistic regression'],
        },
      ],
    },
    {
      title: 'Clustering and Dimensionality Reduction',
      description: 'Finding structure and compressing it.',
      topics: [
        {
          title: 'k-means clustering',
          description: 'k-means alternates assigning points to the nearest centroid and moving centroids to their mean until stable. It is fast and simple but assumes spherical clusters of similar size and needs k and scaled features.',
          concepts: ['Assign and update iterations', 'k-means++ initialisation', 'Inertia and its limits', 'Assumptions and failure shapes'],
          quiz: [
            ['What does k-means minimise?', 'The sum of squared distances from points to their centroids.'],
            ['Why run k-means with several initialisations?', 'It converges to local minima that depend on the start.'],
          ],
        },
        {
          title: 'Hierarchical clustering',
          description: 'Agglomerative clustering merges the closest clusters repeatedly and records the merges in a dendrogram, so the number of clusters can be chosen afterwards. Linkage choice changes the shapes it finds.',
          concepts: ['Agglomerative merging', 'Single, complete, average and Ward linkage', 'Reading a dendrogram', 'Cutting at a height'],
          quiz: [
            ['What does Ward linkage minimise?', 'The increase in within-cluster variance when merging.'],
            ['What advantage does hierarchical clustering have over k-means?', 'No need to fix k in advance; the dendrogram shows all levels.'],
          ],
          prereqs: ['k-means clustering'],
        },
        {
          title: 'DBSCAN',
          description: 'DBSCAN grows clusters from dense regions using eps and min_samples, labels sparse points as noise and finds arbitrarily shaped clusters. Choosing eps with a k-distance plot is the practical skill.',
          concepts: ['Core, border and noise points', 'eps and min_samples', 'k-distance plot for eps', 'HDBSCAN for varying density'],
          quiz: [
            ['What label does DBSCAN give noise points?', '-1.'],
            ['When does DBSCAN beat k-means?', 'For non-spherical clusters and data with outliers.'],
          ],
          prereqs: ['k-means clustering'],
        },
        {
          title: 'Choosing k and validating clusters',
          description: 'The elbow method, silhouette scores and stability across resamples give evidence for a number of clusters, but the final test is whether the clusters are interpretable and useful. Profiling each cluster on the original features is essential.',
          concepts: ['Elbow method', 'Silhouette score', 'Stability under resampling', 'Profiling and naming clusters'],
          quiz: [
            ['What does a silhouette score near 0 mean?', 'Points lie between clusters; the clustering is weak.'],
            ['What is the last step after clustering?', 'Describe each cluster in business terms using its feature averages.'],
          ],
          prereqs: ['Hierarchical clustering', 'DBSCAN'],
        },
        {
          title: 'PCA in practice',
          description: 'PCA reduces correlated features to a few uncorrelated components, speeds up models and helps visualise data. Scaling first, choosing components by explained variance and interpreting loadings are the practical steps; the maths is in track-math-ai.',
          concepts: ['Scaling before PCA', 'Choosing n_components by variance', 'Interpreting loadings', 'PCA as a pipeline step'],
          quiz: [
            ['Why standardise before PCA?', 'Otherwise high-variance features dominate the components.'],
            ['What does n_components=0.95 do in scikit-learn?', 'Keeps enough components to explain 95% of the variance.'],
          ],
        },
        {
          title: 't-SNE and UMAP for visualisation',
          description: 't-SNE and UMAP map high-dimensional data to two dimensions while preserving local neighbourhoods, producing the cluster pictures used to inspect embeddings. Distances and cluster sizes in the plot are not meaningful, and perplexity changes the picture.',
          concepts: ['Preserving local structure', 'Perplexity and n_neighbors', 'What the plot does not tell you', 'UMAP for new points'],
          quiz: [
            ['Can you read cluster distances off a t-SNE plot?', 'No, only local neighbourhoods are preserved.'],
            ['Why prefer UMAP over t-SNE for large data?', 'It is faster and can transform new points.'],
          ],
          prereqs: ['PCA in practice'],
        },
      ],
    },
    {
      title: 'Model Selection and Evaluation',
      description: 'Knowing whether a model is good, and why.',
      topics: [
        {
          title: 'Cross-validation strategies',
          description: 'k-fold cross-validation averages performance over several train/validation splits for a stabler estimate; stratified, grouped and time-series variants keep the folds honest. Nested CV is needed when tuning and evaluating at once.',
          concepts: ['KFold and StratifiedKFold', 'GroupKFold', 'TimeSeriesSplit', 'Nested cross-validation'],
          quiz: [
            ['Why use nested cross-validation?', 'To get an unbiased estimate of a model whose hyperparameters were tuned.'],
            ['What does TimeSeriesSplit guarantee?', 'Validation folds always come after their training folds in time.'],
          ],
          prereqs: ['Train, validation and test protocol'],
        },
        {
          title: 'Regression metrics',
          description: 'MAE, RMSE, MAPE and R² each punish errors differently: RMSE emphasises large misses, MAE is robust, MAPE fails near zero and R² compares against the mean. Pick the one that matches the cost of errors.',
          concepts: ['MAE versus RMSE', 'R² and adjusted R²', 'MAPE and its zero problem', 'Metrics on a log-transformed target'],
          quiz: [
            ['Which is more sensitive to outliers, MAE or RMSE?', 'RMSE.'],
            ['Can R² be negative?', 'Yes, when the model is worse than predicting the mean.'],
          ],
        },
        {
          title: 'Classification metrics',
          description: 'The confusion matrix yields accuracy, precision, recall, F1 and specificity; macro and micro averaging extend them to many classes. Reading a classification_report per class is the first evaluation step.',
          concepts: ['Confusion matrix', 'Precision, recall and F1', 'Macro versus micro averaging', 'classification_report'],
          quiz: [
            ['Define precision.', 'True positives divided by all predicted positives.'],
            ['When is macro F1 preferable to accuracy?', 'When classes are imbalanced and every class matters equally.'],
          ],
        },
        {
          title: 'ROC and precision-recall curves',
          description: 'ROC plots true positive rate against false positive rate over thresholds; the precision-recall curve is more informative when positives are rare. AUC summarises ranking quality independent of any single threshold.',
          concepts: ['ROC curve and AUC', 'Precision-recall curve and average precision', 'Choosing between ROC and PR', 'Comparing models by curves'],
          quiz: [
            ['What does an ROC AUC of 0.5 mean?', 'The model ranks positives no better than chance.'],
            ['Why prefer the PR curve for rare positives?', 'ROC looks optimistic because the false positive rate stays small when negatives dominate.'],
          ],
          prereqs: ['Classification metrics'],
        },
        {
          title: 'Thresholds and calibration',
          description: 'A classifier\'s probabilities are only useful if a 0.8 means 80%; calibration curves reveal over- or under-confidence and Platt scaling or isotonic regression fix it. The decision threshold is then chosen from costs, not left at 0.5.',
          concepts: ['Calibration curves and Brier score', 'Platt scaling and isotonic regression', 'CalibratedClassifierCV', 'Choosing a threshold from costs'],
          quiz: [
            ['Which common model is typically poorly calibrated?', 'Random forests and boosted trees tend to be overconfident or compressed; SVMs too.'],
            ['How do you pick a threshold?', 'Maximise expected value or hit a required precision or recall on validation data.'],
          ],
          prereqs: ['ROC and precision-recall curves'],
        },
        {
          title: 'Bias and variance',
          description: 'Expected error decomposes into bias from a model too simple to fit the pattern, variance from sensitivity to the training sample, and irreducible noise. Diagnosing which dominates tells you whether to add capacity, data or regularisation.',
          concepts: ['The decomposition', 'High bias symptoms', 'High variance symptoms', 'Remedies for each'],
          quiz: [
            ['Training error high and validation error similar: bias or variance?', 'High bias; the model underfits.'],
            ['What reduces variance without changing the model family?', 'More training data, regularisation or averaging models.'],
          ],
          prereqs: ['Cross-validation strategies'],
        },
        {
          title: 'Overfitting, underfitting and regularisation',
          description: 'Learning and validation curves show where a model sits between underfitting and overfitting, and regularisation, early stopping, pruning and simpler features move it back. Recognising the curves is a core diagnostic skill.',
          concepts: ['Learning curves', 'Validation curves over a hyperparameter', 'Regularisation and early stopping', 'Simplifying features'],
          quiz: [
            ['What does a learning curve with a persistent gap show?', 'Overfitting that more data would reduce.'],
            ['What does a validation curve plot?', 'Train and validation scores against one hyperparameter\'s values.'],
          ],
          prereqs: ['Bias and variance'],
        },
      ],
    },
    {
      title: 'Tuning, Hard Cases and Interpretation',
      description: 'Getting the last accuracy honestly, handling awkward data and explaining results.',
      topics: [
        {
          title: 'Hyperparameter search',
          description: 'Grid search is exhaustive and slow, random search finds good regions faster, and Bayesian optimisation with Optuna learns where to look. All must run inside cross-validation, and the search space matters more than the method.',
          concepts: ['GridSearchCV versus RandomizedSearchCV', 'Log-uniform search spaces', 'Bayesian optimisation with Optuna', 'Budgeting search time'],
          quiz: [
            ['Why is random search often better than grid search?', 'It explores more distinct values of the important parameters for the same budget.'],
            ['Which scale should a learning rate be searched on?', 'Logarithmic.'],
          ],
          prereqs: ['Cross-validation strategies'],
        },
        {
          title: 'Imbalanced data',
          description: 'When positives are 1% of rows, accuracy is meaningless and models ignore the minority class. Class weights, resampling such as SMOTE, threshold tuning and PR-based metrics are the toolkit, applied only to the training folds.',
          concepts: ['Why accuracy fails', 'class_weight="balanced"', 'Oversampling and SMOTE inside folds', 'Threshold and metric choice'],
          quiz: [
            ['Where must oversampling happen?', 'Only on the training fold, never before splitting.'],
            ['What does class_weight="balanced" do?', 'Weights each class inversely to its frequency in the loss.'],
          ],
          prereqs: ['Thresholds and calibration'],
        },
        {
          title: 'Error analysis and slicing',
          description: 'Looking at the worst predictions and at metrics per segment (region, device, class) finds the data problems and feature gaps that aggregate scores hide. It is the highest-leverage activity after the first model.',
          concepts: ['Inspecting the largest errors', 'Metrics per slice', 'Finding mislabelled data', 'Turning findings into features'],
          quiz: [
            ['What is the first thing to look at after training?', 'The rows with the largest errors and what they have in common.'],
            ['Why compute metrics per segment?', 'A model can be excellent on average and terrible for one important group.'],
          ],
          prereqs: ['Classification metrics'],
        },
        {
          title: 'Interpretability: importance, permutation and SHAP',
          description: 'Impurity importance is biased, permutation importance measures what the model actually depends on, and SHAP values explain individual predictions consistently. Partial dependence shows the shape of each effect.',
          concepts: ['Permutation importance', 'SHAP values for global and local explanations', 'Partial dependence and ICE plots', 'Limits of importance under correlation'],
          quiz: [
            ['Why is impurity importance biased?', 'It favours high-cardinality and continuous features that offer more split points.'],
            ['What does a SHAP value represent?', 'A feature\'s contribution to moving one prediction away from the average.'],
          ],
          prereqs: ['Gradient boosting machines'],
        },
        {
          title: 'Learning from limited and noisy labels',
          description: 'Small datasets and noisy labels need simpler models, strong regularisation, cross-validation with many folds, label cleaning and sometimes semi-supervised or active learning. Knowing these limits prevents chasing noise.',
          concepts: ['Simpler models for small data', 'Repeated cross-validation', 'Confident learning for label noise', 'Active learning loop'],
          quiz: [
            ['Why use repeated k-fold on small data?', 'A single split gives a very noisy estimate.'],
            ['What does active learning choose?', 'The unlabelled examples most worth labelling next.'],
          ],
          prereqs: ['Overfitting, underfitting and regularisation'],
        },
      ],
    },
    {
      title: 'scikit-learn Pipelines in Production',
      description: 'From an experiment to a single deployable object.',
      topics: [
        {
          title: 'End-to-end pipeline with ColumnTransformer',
          description: 'Numeric imputation and scaling, categorical encoding and a model combined into one Pipeline that fits and predicts on raw DataFrames. This is the object that gets cross-validated, tuned, saved and served.',
          concepts: ['Column selection by dtype', 'Numeric and categorical branches', 'Attaching the estimator', 'Predicting from raw frames'],
          quiz: [
            ['What does make_column_selector(dtype_include="number") do?', 'Selects numeric columns for a ColumnTransformer branch.'],
            ['Why should the pipeline accept raw DataFrames?', 'Serving code then needs no separate preprocessing.'],
          ],
          prereqs: ['Leakage through preprocessing'],
        },
        {
          title: 'Custom transformers',
          description: 'Subclassing BaseEstimator and TransformerMixin, or using FunctionTransformer, wraps domain feature logic so it is fitted and applied consistently. Implementing get_feature_names_out keeps downstream explanations readable.',
          concepts: ['BaseEstimator and TransformerMixin', 'FunctionTransformer for stateless steps', 'get_feature_names_out', 'Testing a transformer'],
          quiz: [
            ['Which methods must a custom transformer implement?', 'fit and transform; fit_transform comes from the mixin.'],
            ['When is FunctionTransformer enough?', 'When the transformation learns nothing from the data.'],
          ],
          prereqs: ['End-to-end pipeline with ColumnTransformer'],
        },
        {
          title: 'Tuning a whole pipeline',
          description: 'GridSearchCV over a pipeline can search preprocessing choices and model hyperparameters together using step__param names, and even swap estimators. Caching transformers avoids recomputing preprocessing per candidate.',
          concepts: ['Parameter grids with step names', 'Searching over alternative estimators', 'memory= caching', 'Refitting on all training data'],
          quiz: [
            ['How do you search over the imputer strategy and model depth at once?', 'One grid with keys like prep__num__imputer__strategy and model__max_depth.'],
            ['What does refit=True do after the search?', 'Retrains the best configuration on the full training set.'],
          ],
          prereqs: ['End-to-end pipeline with ColumnTransformer', 'Hyperparameter search'],
        },
        {
          title: 'Saving, versioning and serving a model',
          description: 'Persist the fitted pipeline with joblib alongside its metrics, feature list and library versions, then load it behind a small FastAPI endpoint or a batch scoring job. Model registries and deployment patterns continue in track-mlops.',
          concepts: ['Artefact plus metadata', 'Loading in a prediction service', 'Batch scoring jobs', 'Checking input schema at serving time'],
          quiz: [
            ['What metadata should be stored with a model file?', 'Training date, data version, metrics, feature names and library versions.'],
            ['Why validate the input schema at serving time?', 'Missing or renamed columns would otherwise produce silent garbage.'],
          ],
          prereqs: ['Tuning a whole pipeline'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: house price regression pipeline',
          description: 'Build a full regression pipeline on a housing dataset: engineer features, compare Ridge, random forest and gradient boosting with cross-validation, tune the winner, report RMSE and MAE with confidence intervals and explain the model with SHAP.',
          concepts: ['Explore and engineer features', 'Compare models with cross-validation', 'Tune and evaluate on test', 'Explain with SHAP'],
          quiz: [
            ['Why compare models under identical cross-validation folds?', 'So differences come from the models, not the splits.'],
            ['What should the final test report contain?', 'One evaluation of the chosen pipeline with metrics and error analysis.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: churn classifier with imbalance and calibration',
          description: 'Predict customer churn from account data where 5% churn: use stratified splits, class weights, PR-AUC as the metric, calibrate probabilities, choose a threshold from retention campaign costs and produce a per-segment performance report.',
          concepts: ['Split and baseline with imbalance', 'Train with class weights', 'Calibrate and pick a threshold', 'Report per-segment results'],
          quiz: [
            ['Why is PR-AUC the right headline metric here?', 'Positives are rare, so precision and recall on churners matter most.'],
            ['How does campaign cost set the threshold?', 'Pick the cut-off that maximises expected saved revenue minus contact cost.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: customer segmentation with clustering',
          description: 'Segment customers from transaction features: scale, reduce with PCA, compare k-means, hierarchical and DBSCAN, pick k with silhouette and stability, profile each segment and present them with a UMAP plot and a table of defining features.',
          concepts: ['Build and scale RFM features', 'Compare clustering methods', 'Validate the number of clusters', 'Profile and present segments'],
          quiz: [
            ['What are RFM features?', 'Recency, frequency and monetary value per customer.'],
            ['How do you show a segmentation is stable?', 'Recluster on bootstrap samples and check agreement.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: text classifier with TF-IDF and linear models',
          description: 'Classify news or reviews with a TfidfVectorizer plus logistic regression pipeline, tune n-grams and C, inspect the most important terms per class, compare with naive Bayes and a linear SVM, and evaluate with macro F1 and a confusion matrix.',
          concepts: ['Vectorise text in a pipeline', 'Tune n-grams and regularisation', 'Inspect learned terms', 'Compare models and report'],
          quiz: [
            ['Why put the vectoriser inside the pipeline?', 'Its vocabulary must be learned from training folds only.'],
            ['Which metric for a five-class balanced text task?', 'Macro F1 or accuracy with a confusion matrix.'],
          ],
          style: 'project',
        },
        {
          title: 'Machine learning interview questions',
          description: 'The staples: bias versus variance, precision versus recall, how gradient boosting differs from random forests, regularisation, leakage, cross-validation, handling imbalance, why calibration matters and when to use which model.',
          concepts: ['Model comparison questions', 'Evaluation and metric questions', 'Data leakage questions', 'Explaining trade-offs concisely'],
          quiz: [
            ['How does gradient boosting differ from a random forest?', 'Boosting fits trees sequentially on residuals; forests average independent trees on bootstraps.'],
            ['What would you do about 1% positives?', 'Use PR-based metrics, class weights or resampling inside folds and tune the threshold.'],
          ],
          style: 'reading',
        },
        {
          title: 'ML case-study interviews',
          description: 'Structured answers to "how would you build a model to predict X": clarify the decision and data, define the target and metric, propose features and a baseline, plan validation, name risks such as leakage and drift, and describe deployment.',
          concepts: ['Clarify target and metric', 'Propose features and baseline', 'Plan validation and risks', 'Describe deployment and monitoring'],
          quiz: [
            ['What is the first question in a case-study interview?', 'What decision the prediction drives and how errors cost.'],
            ['How do you handle a target that is only observed with delay?', 'Use time-based splits and only features available at prediction time.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
