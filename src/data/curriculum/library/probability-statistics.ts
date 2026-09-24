import { defineTrack } from '../define'

export const probabilityStatistics = defineTrack({
  id: 'track-probability-statistics',
  title: 'Probability and Statistics',
  description: 'The statistics a data scientist actually uses: describing data, probability rules and Bayes, the common distributions, the central limit theorem, confidence intervals, hypothesis tests with their errors and power, regression basics, Bayesian and nonparametric thinking, all checked with numpy and scipy.',
  family: 'Data Science',
  kind: 'domain',
  icon: '🎲',
  tags: ['statistics', 'probability', 'hypothesis testing', 'distributions', 'bayes', 'scipy'],
  languages: ['Python'],
  explainMode: 'math',
  code: { label: 'plain-text maths with numpy checks', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Data and Descriptive Statistics',
      description: 'Summarising a column of numbers honestly before any inference.',
      topics: [
        {
          title: 'Data types and measurement scales',
          description: 'Nominal, ordinal, interval and ratio scales decide which summaries and tests are legal: a mean of postcodes is meaningless, a median of star ratings is not. Recognising the scale of each column comes before any calculation.',
          concepts: ['Nominal and ordinal data', 'Interval versus ratio scales', 'Discrete versus continuous variables', 'Which statistics each scale allows'],
          quiz: [
            ['Why is temperature in Celsius interval, not ratio?', 'Zero is arbitrary, so 20 degrees is not twice as hot as 10.'],
            ['Which average suits ordinal survey answers?', 'The median or mode; the mean assumes equal spacing between levels.'],
          ],
        },
        {
          title: 'Frequency tables and empirical distributions',
          description: 'Counting how often each value or bin occurs turns raw numbers into a distribution you can see: histograms, relative frequencies and the empirical CDF, and how bin width changes the story a histogram tells.',
          concepts: ['Frequency and relative frequency tables', 'Histogram bins and bin width', 'Empirical cumulative distribution', 'Reading a distribution shape from a plot'],
          quiz: [
            ['What does the empirical CDF at x give?', 'The fraction of observations less than or equal to x.'],
            ['What goes wrong with too few histogram bins?', 'Modes and gaps merge and the shape looks smoother than the data is.'],
          ],
          prereqs: ['Data types and measurement scales'],
        },
        {
          title: 'Central tendency: mean, median and mode',
          description: 'Three answers to "what is typical": the mean balances the data, the median splits it, the mode is the most common value. Skew and outliers pull the mean away from the median, which is why income is reported as a median.',
          concepts: ['Arithmetic mean and its sensitivity', 'Median as the robust centre', 'Mode for categorical data', 'Trimmed and weighted means'],
          quiz: [
            ['Salaries 30k, 35k, 40k, 45k, 500k: mean or median?', 'Median (40k); the mean (130k) is dragged up by one outlier.'],
            ['When are mean and median equal?', 'For a symmetric distribution.'],
          ],
        },
        {
          title: 'Spread: variance, standard deviation and IQR',
          description: 'How far values sit from the centre: variance and standard deviation in the units of the data, the n-1 correction for samples, and the interquartile range that ignores the tails. Standard deviation makes z-scores and confidence intervals possible.',
          concepts: ['Range and interquartile range', 'Variance and the n-1 correction', 'Standard deviation in data units', 'Coefficient of variation'],
          quiz: [
            ['Why divide by n-1 for a sample variance?', 'It corrects the downward bias from using the sample mean instead of the population mean.'],
            ['Which spread measure is unaffected by outliers?', 'The interquartile range.'],
          ],
          prereqs: ['Central tendency: mean, median and mode'],
        },
        {
          title: 'Shape: skewness, kurtosis and outliers',
          description: 'A distribution is more than centre and spread: right skew means a long tail of large values, heavy tails mean outliers are expected rather than rare, and the 1.5 IQR rule and z-scores give first-pass outlier flags.',
          concepts: ['Right and left skew', 'Kurtosis and heavy tails', 'The 1.5 IQR outlier rule', 'Percentiles and quantiles'],
          quiz: [
            ['In a right-skewed distribution, which is larger, mean or median?', 'The mean, pulled toward the long right tail.'],
            ['What does the 1.5 IQR rule flag?', 'Values below Q1 - 1.5 IQR or above Q3 + 1.5 IQR.'],
          ],
          prereqs: ['Spread: variance, standard deviation and IQR'],
        },
      ],
    },
    {
      title: 'Probability Foundations',
      topics: [
        {
          title: 'Sample spaces, events and the axioms',
          description: 'Probability is a measure on outcomes: the sample space lists what can happen, events are subsets, and three axioms (non-negative, total one, additive over disjoint events) generate every rule that follows. Simulating a sample space in numpy makes the definitions concrete.',
          concepts: ['Outcomes, sample spaces and events', 'The three probability axioms', 'Complement and disjoint events', 'Estimating probabilities by simulation'],
          quiz: [
            ['What is P(A) + P(not A)?', '1, because A and its complement partition the sample space.'],
            ['Two dice: how many outcomes in the sample space?', '36 ordered pairs.'],
          ],
        },
        {
          title: 'Addition and multiplication rules',
          description: 'P(A or B) = P(A) + P(B) - P(A and B) stops double counting the overlap; P(A and B) = P(A) P(B | A) chains events. These two rules solve most "what is the chance that" questions once you draw the Venn diagram or tree.',
          concepts: ['The general addition rule', 'The multiplication rule for joint events', 'Venn diagrams and probability trees', 'Sampling with and without replacement'],
          quiz: [
            ['P(A)=0.5, P(B)=0.4, P(A and B)=0.2: P(A or B)?', '0.7'],
            ['Probability of two aces drawn without replacement from 52 cards?', '4/52 * 3/51 = 1/221.'],
          ],
          prereqs: ['Sample spaces, events and the axioms'],
        },
        {
          title: 'Conditional probability and independence',
          description: 'P(A | B) restricts the world to cases where B happened; independence means learning B changes nothing about A. Confusing P(A | B) with P(B | A) is the most common probabilistic mistake in medicine, law and product analytics.',
          concepts: ['Definition of conditional probability', 'Independence and its test', 'The law of total probability', 'Confusing P(A given B) with P(B given A)'],
          quiz: [
            ['When are A and B independent?', 'When P(A and B) = P(A) P(B), equivalently P(A | B) = P(A).'],
            ['What is the law of total probability?', 'P(A) = sum over a partition B_i of P(A | B_i) P(B_i).'],
          ],
          prereqs: ['Addition and multiplication rules'],
        },
        {
          title: "Bayes' theorem",
          description: "Bayes' theorem flips a conditional: P(disease | positive test) from sensitivity, specificity and prevalence. The base rate dominates for rare conditions, which is why a 99% accurate test can still be wrong most of the time it says yes.",
          concepts: ['Prior, likelihood and posterior', 'The base rate fallacy', 'Medical test worked example', 'Sequential updating with new evidence'],
          quiz: [
            ['Prevalence 1%, sensitivity 99%, false positive rate 5%: P(disease | positive)?', 'About 0.0099 / (0.0099 + 0.0495) = 17%.'],
            ['What plays the role of the prior?', 'The probability before seeing the evidence, such as prevalence.'],
          ],
          prereqs: ['Conditional probability and independence'],
        },
        {
          title: 'Counting: permutations and combinations',
          description: 'Many probabilities are ratios of counts: permutations when order matters, combinations when it does not, and the multiplication principle for stages. math.comb and math.perm check the arithmetic; the reasoning about what counts as distinct is the skill.',
          concepts: ['The multiplication principle', 'Permutations and factorials', 'Combinations and n choose k', 'Birthday-problem style questions'],
          quiz: [
            ['How many 5-card hands from 52 cards?', 'C(52, 5) = 2,598,960.'],
            ['Permutation or combination for a committee of 3 from 10?', 'Combination, since order does not matter: 120.'],
          ],
        },
      ],
    },
    {
      title: 'Random Variables and Distributions',
      topics: [
        {
          title: 'Random variables, PMFs and PDFs',
          description: 'A random variable maps outcomes to numbers; discrete ones have a probability mass function, continuous ones a density where only areas are probabilities. The CDF works for both and is what scipy.stats uses for tail probabilities.',
          concepts: ['Random variables as functions of outcomes', 'Probability mass functions', 'Probability density functions and areas', 'Cumulative distribution functions'],
          quiz: [
            ['What is P(X = 2.5) for a continuous variable?', 'Zero; only intervals have positive probability.'],
            ['What does scipy.stats.norm.cdf(1.96) return?', 'About 0.975, the probability a standard normal is below 1.96.'],
          ],
        },
        {
          title: 'Expectation and variance',
          description: 'Expected value is the probability-weighted average, variance the expected squared deviation. Linearity of expectation works without independence; variance only adds for independent variables. These rules explain why averaging reduces noise.',
          concepts: ['Expected value of discrete and continuous variables', 'Linearity of expectation', 'Variance of a random variable', 'Variance of sums and independence'],
          quiz: [
            ['E[aX + b] equals?', 'a E[X] + b.'],
            ['Var(X + Y) when X and Y are independent?', 'Var(X) + Var(Y).'],
          ],
          prereqs: ['Random variables, PMFs and PDFs'],
        },
        {
          title: 'Bernoulli and binomial distributions',
          description: 'A Bernoulli trial is one yes/no with probability p; the binomial counts successes in n independent trials. Conversion rates, defect counts and coin flips all live here, with mean np and variance np(1-p).',
          concepts: ['Bernoulli trials', 'Binomial PMF and its parameters', 'Mean and variance of the binomial', 'Binomial probabilities with scipy.stats.binom'],
          quiz: [
            ['Mean and variance of Binomial(20, 0.3)?', 'Mean 6, variance 4.2.'],
            ['P(at least one success) in n trials?', '1 - (1-p)^n.'],
          ],
          prereqs: ['Expectation and variance'],
        },
        {
          title: 'Poisson distribution',
          description: 'Counts of rare events in a fixed window (support tickets per hour, typos per page) follow a Poisson with a single rate lambda, where mean equals variance. It is the limit of a binomial with many trials and small p.',
          concepts: ['Poisson process assumptions', 'Poisson PMF and the rate lambda', 'Mean equals variance', 'Poisson as a binomial limit'],
          quiz: [
            ['Calls arrive at 4 per minute: P(exactly 0 in a minute)?', 'e^-4, about 0.018.'],
            ['When does a Poisson fit poorly?', 'When the variance is much larger than the mean (overdispersion), for example clustered events.'],
          ],
          prereqs: ['Bernoulli and binomial distributions'],
        },
        {
          title: 'Normal distribution and z-scores',
          description: 'The bell curve defined by mean and standard deviation, the 68-95-99.7 rule, and standardising to z-scores so any normal question becomes a lookup. Many statistics are approximately normal because of the central limit theorem, not because raw data is.',
          concepts: ['Normal PDF parameters', 'The 68-95-99.7 rule', 'Standardising with z-scores', 'Normal probabilities and quantiles in scipy'],
          quiz: [
            ['What fraction of a normal lies within 2 standard deviations?', 'About 95%.'],
            ['z-score of 130 when mean is 100 and sd is 15?', '2.0'],
          ],
          prereqs: ['Random variables, PMFs and PDFs'],
        },
        {
          title: 'Exponential and geometric distributions',
          description: 'Waiting times: exponential for continuous time until the next Poisson event, geometric for trials until the first success. Both are memoryless, so having waited already tells you nothing about how much longer.',
          concepts: ['Exponential distribution and rate', 'Geometric distribution', 'The memoryless property', 'Modelling time between events'],
          quiz: [
            ['Mean of an Exponential with rate 0.5 per hour?', '2 hours.'],
            ['What does memoryless mean for a bus that "should" have arrived?', 'The remaining wait has the same distribution as when you first arrived.'],
          ],
          prereqs: ['Poisson distribution'],
        },
        {
          title: 'Joint distributions, covariance and uniform',
          description: 'Two variables together: joint and marginal distributions, covariance as the sign of co-movement, and the continuous and discrete uniform as the "no information" baseline that random number generators produce.',
          concepts: ['Joint and marginal distributions', 'Covariance and its units', 'Uniform distributions', 'Sampling any distribution from uniforms'],
          quiz: [
            ['What does zero covariance imply?', 'No linear relationship; the variables can still be dependent.'],
            ['Mean of Uniform(a, b)?', '(a + b) / 2.'],
          ],
          prereqs: ['Expectation and variance'],
        },
      ],
    },
    {
      title: 'Sampling and the Central Limit Theorem',
      topics: [
        {
          title: 'Populations, samples and sampling methods',
          description: 'Inference is about a population you cannot see from a sample you can. Simple random, stratified and cluster sampling give valid samples; convenience samples and survivorship bias do not, and no amount of data fixes a biased sample.',
          concepts: ['Population parameters versus sample statistics', 'Simple random and stratified sampling', 'Cluster and systematic sampling', 'Selection bias and survivorship bias'],
          quiz: [
            ['What is the difference between a parameter and a statistic?', 'A parameter describes the population; a statistic is computed from the sample.'],
            ['Why stratify by region before sampling customers?', 'To guarantee each region is represented in proportion and reduce variance.'],
          ],
        },
        {
          title: 'Sampling distributions and standard error',
          description: 'Repeat a sample many times and the statistic itself has a distribution. Its standard deviation, the standard error, shrinks with sqrt(n), which is why quadrupling the sample halves the uncertainty rather than quartering it.',
          concepts: ['The sampling distribution of the mean', 'Standard error and the sqrt(n) rule', 'Sampling distribution of a proportion', 'Simulating sampling distributions in numpy'],
          quiz: [
            ['Standard error of the mean with sd 10 and n 25?', '10 / sqrt(25) = 2.'],
            ['How does n need to change to halve the standard error?', 'Multiply by four.'],
          ],
          prereqs: ['Populations, samples and sampling methods'],
        },
        {
          title: 'The central limit theorem',
          description: 'Averages of enough independent draws are approximately normal whatever the original shape, which is what licenses z and t procedures on skewed data. Seeing it emerge from exponential or uniform draws in a simulation makes the rule of thumb about n = 30 concrete.',
          concepts: ['Statement of the CLT', 'Convergence for skewed source distributions', 'When the CLT fails or is slow', 'Demonstrating the CLT by simulation'],
          quiz: [
            ['Does the CLT say the data become normal?', 'No, the sampling distribution of the mean becomes normal.'],
            ['Which distributions break the CLT?', 'Those with infinite variance, such as the Cauchy.'],
          ],
          prereqs: ['Sampling distributions and standard error'],
        },
        {
          title: 'Law of large numbers and Monte Carlo',
          description: 'Sample means converge to the expected value, which justifies estimating any probability or integral by simulating it. Monte Carlo turns hard probability questions into a loop of random draws with an error that shrinks like 1/sqrt(n).',
          concepts: ['Weak law of large numbers', 'Monte Carlo estimation', 'Monte Carlo error and sample size', 'Seeding for reproducible simulations'],
          quiz: [
            ['How do you estimate pi with random points?', 'Fraction of uniform points in the unit square that land inside the quarter circle, times 4.'],
            ['Gambler has lost 10 times: does the law of large numbers say a win is due?', 'No; future draws are unaffected, the average only converges in the long run.'],
          ],
          prereqs: ['The central limit theorem'],
        },
      ],
    },
    {
      title: 'Estimation and Confidence Intervals',
      topics: [
        {
          title: 'Point estimators: bias, variance and consistency',
          description: 'An estimator is a recipe for guessing a parameter; bias is its systematic error, variance its wobble, and consistency whether it homes in with more data. The sample mean is unbiased; the plug-in variance is biased, which is where n-1 came from.',
          concepts: ['Estimators as random variables', 'Bias and unbiasedness', 'Estimator variance and efficiency', 'Consistency and mean squared error'],
          quiz: [
            ['Is the sample maximum an unbiased estimator of the population maximum?', 'No, it is always at or below it, so it is biased low.'],
            ['What does MSE combine?', 'Variance plus squared bias.'],
          ],
        },
        {
          title: 'Maximum likelihood estimation',
          description: 'Choose the parameter that makes the observed data most probable. Writing the likelihood, taking logs, and maximising by calculus or scipy.optimize gives the MLE, which is behind logistic regression and most fitted distributions.',
          concepts: ['Likelihood and log-likelihood', 'MLE for a Bernoulli or normal', 'Numerical maximisation with scipy.optimize', 'Properties of MLEs in large samples'],
          quiz: [
            ['MLE of p after 7 heads in 10 flips?', '0.7'],
            ['Why maximise the log-likelihood instead of the likelihood?', 'Products become sums, which are numerically stable and easier to differentiate.'],
          ],
          prereqs: ['Point estimators: bias, variance and consistency'],
        },
        {
          title: 'Confidence intervals for means and proportions',
          description: 'A 95% interval is a procedure that captures the true value in 95% of repeated samples; it is not a 95% chance the parameter is inside this one. z intervals when sigma is known, t intervals when it is not, and the Wilson interval for proportions.',
          concepts: ['Interpreting a confidence level correctly', 'z versus t intervals for a mean', 'Intervals for a proportion', 'Margin of error and sample size'],
          quiz: [
            ['Mean 50, sd 8, n 64: 95% z interval?', '50 +/- 1.96 * 1 = (48.04, 51.96).'],
            ['Why use t instead of z?', 'The sample standard deviation adds uncertainty, so the t distribution has heavier tails.'],
          ],
          prereqs: ['Sampling distributions and standard error'],
        },
        {
          title: 'Bootstrap confidence intervals',
          description: 'Resample the data with replacement thousands of times and read the interval from the distribution of the recomputed statistic. It works for medians, ratios and anything else without a formula, and takes ten lines of numpy.',
          concepts: ['Resampling with replacement', 'Percentile bootstrap intervals', 'Bootstrapping medians and ratios', 'Limits of the bootstrap'],
          quiz: [
            ['How many bootstrap resamples are typical?', 'Around 1,000 to 10,000.'],
            ['When does the percentile bootstrap misbehave?', 'With tiny samples or statistics like the maximum that depend on the tails.'],
          ],
          prereqs: ['Confidence intervals for means and proportions'],
        },
      ],
    },
    {
      title: 'Hypothesis Testing',
      topics: [
        {
          title: 'Null and alternative hypotheses',
          description: 'A test assumes the null (no effect) and asks whether the data would be surprising under it. Framing the null, choosing one- or two-sided alternatives, and picking the test statistic before looking at results is what keeps a test honest.',
          concepts: ['Framing the null and alternative', 'One-sided versus two-sided tests', 'Test statistics and their distributions', 'Pre-registering the analysis plan'],
          quiz: [
            ['Why choose the direction of a test before seeing data?', 'Choosing it afterwards doubles the effective false positive rate.'],
            ['Does failing to reject the null prove it?', 'No, it only means the data are not surprising under it.'],
          ],
        },
        {
          title: 'p-values and significance levels',
          description: 'The p-value is the probability of data at least this extreme if the null is true; it is not the probability the null is true. Alpha fixes the false positive rate in advance, and 0.05 is a convention rather than a law of nature.',
          concepts: ['Definition of the p-value', 'Choosing alpha in advance', 'Common misreadings of p-values', 'Reporting exact p-values and estimates'],
          quiz: [
            ['p = 0.03 means what?', 'A 3% chance of data this extreme if the null were true.'],
            ['Is p = 0.049 meaningfully different from p = 0.051?', 'No; the threshold is a convention and the evidence is nearly identical.'],
          ],
          prereqs: ['Null and alternative hypotheses'],
        },
        {
          title: 'Type I and Type II errors',
          description: 'Rejecting a true null is a Type I error (rate alpha); missing a real effect is Type II (rate beta). The two trade off for a fixed sample size, and which one is costlier depends on the decision, not on statistics.',
          concepts: ['Type I error and alpha', 'Type II error and beta', 'The error trade-off at fixed n', 'Choosing error rates for a decision'],
          quiz: [
            ['Which error is a false alarm?', 'Type I: rejecting a true null.'],
            ['How does lowering alpha affect beta?', 'It raises beta unless the sample grows.'],
          ],
          prereqs: ['p-values and significance levels'],
        },
        {
          title: 'One-sample and two-sample t-tests',
          description: "Comparing a mean to a benchmark or two group means to each other with Student's t, the assumptions that matter (independence, roughly normal means), Welch's correction for unequal variances, and scipy.stats.ttest_ind in practice.",
          concepts: ['One-sample t-test mechanics', 'Two-sample t-test and pooled variance', "Welch's t-test for unequal variances", 'Checking t-test assumptions'],
          quiz: [
            ["Why default to Welch's t-test?", 'It does not assume equal variances and loses almost nothing when they are equal.'],
            ['Degrees of freedom for a one-sample t-test with n = 15?', '14'],
          ],
          prereqs: ['Type I and Type II errors'],
        },
        {
          title: 'Paired tests and before-after designs',
          description: 'When each subject is measured twice, the differences are the data: a paired t-test removes between-subject variation and is far more powerful than treating the two measurements as independent groups.',
          concepts: ['Paired versus independent samples', 'Paired t-test on differences', 'Why pairing increases power', 'Blocking and matched designs'],
          quiz: [
            ['What does a paired t-test actually test?', 'Whether the mean of the within-pair differences is zero.'],
            ['What is lost by running an independent test on paired data?', 'Power, because subject-to-subject variation stays in the noise.'],
          ],
          prereqs: ['One-sample and two-sample t-tests'],
        },
        {
          title: 'Chi-square tests for categorical data',
          description: 'Goodness of fit compares observed counts to expected ones; the test of independence asks whether two categorical variables are related in a contingency table. Expected counts under 5 and the difference between association and effect size are the usual traps.',
          concepts: ['Chi-square goodness of fit', 'Contingency tables and independence', 'Expected counts and the small-cell rule', "Cramer's V and the strength of association"],
          quiz: [
            ['Degrees of freedom for a 3 by 4 contingency table?', '(3-1)(4-1) = 6.'],
            ['What does a significant chi-square independence test tell you?', 'The variables are associated, not how strongly or in which direction.'],
          ],
          prereqs: ['p-values and significance levels'],
        },
        {
          title: 'ANOVA and post-hoc comparisons',
          description: 'One-way ANOVA tests whether any of several group means differ by comparing between-group to within-group variance with an F statistic. A significant result needs post-hoc tests such as Tukey HSD to say which groups differ.',
          concepts: ['Between and within-group variance', 'The F statistic and its distribution', 'Tukey HSD post-hoc tests', 'Kruskal-Wallis when assumptions fail'],
          quiz: [
            ['Why not run many pairwise t-tests instead of ANOVA?', 'The family-wise false positive rate balloons with each extra test.'],
            ['What does F close to 1 suggest?', 'Group means vary no more than expected from within-group noise.'],
          ],
          prereqs: ['One-sample and two-sample t-tests'],
        },
      ],
    },
    {
      title: 'Effect Sizes, Power and Multiple Testing',
      topics: [
        {
          title: "Effect sizes: Cohen's d and friends",
          description: 'Significance says an effect is probably real; effect size says how big it is. Cohen d for mean differences, relative risk and odds ratios for proportions, and r-squared for explained variance make results comparable across studies and sample sizes.',
          concepts: ["Cohen's d and its benchmarks", 'Relative risk and odds ratios', 'r-squared as explained variance', 'Reporting effects with intervals'],
          quiz: [
            ["Cohen's d of 0.2, 0.5, 0.8 are conventionally called?", 'Small, medium and large.'],
            ['Can a tiny effect be highly significant?', 'Yes, with a large enough sample.'],
          ],
        },
        {
          title: 'Statistical power and sample size',
          description: 'Power is the chance of detecting a real effect of a given size; it rises with sample size, effect size and alpha. Computing the n needed before an experiment prevents both wasted traffic and studies that could never have found anything.',
          concepts: ['Power as one minus beta', 'Inputs to a power calculation', 'Sample size for a two-sample test', 'Power curves and minimum detectable effect'],
          quiz: [
            ['What power is conventional in experiment design?', '80%.'],
            ['Halving the minimum detectable effect changes required n how?', 'Roughly quadruples it.'],
          ],
          prereqs: ["Effect sizes: Cohen's d and friends"],
        },
        {
          title: 'Multiple comparisons and false discovery',
          description: 'Run 20 tests at alpha 0.05 and one false positive is expected. Bonferroni controls the family-wise rate bluntly; Benjamini-Hochberg controls the false discovery rate and keeps power when testing many metrics or features.',
          concepts: ['Family-wise error rate', 'Bonferroni correction', 'Benjamini-Hochberg false discovery rate', 'p-hacking and the garden of forking paths'],
          quiz: [
            ['Bonferroni threshold for 10 tests at alpha 0.05?', '0.005 per test.'],
            ['Why prefer FDR control for hundreds of tests?', 'Bonferroni becomes so strict that almost nothing can be detected.'],
          ],
          prereqs: ['Statistical power and sample size'],
        },
        {
          title: 'Practical versus statistical significance',
          description: 'A 0.1% lift can be significant and worthless; a 20% lift can be non-significant and worth a follow-up. Reading the interval, the cost of each decision and the effect size together is how analysts turn a test into a recommendation.',
          concepts: ['Minimum effect worth acting on', 'Confidence intervals as decision tools', 'Underpowered and overpowered studies', 'Writing a results recommendation'],
          quiz: [
            ['A 95% CI for lift is (-0.5%, 6%): what do you report?', 'Inconclusive: consistent with no effect and with a useful gain; consider more data.'],
            ['What does an interval far from zero but within the trivial range mean?', 'A real but practically irrelevant effect.'],
          ],
          prereqs: ['Multiple comparisons and false discovery'],
        },
      ],
    },
    {
      title: 'Relationships and Regression',
      topics: [
        {
          title: 'Correlation coefficients',
          description: 'Pearson r measures linear association, Spearman rho works on ranks and survives outliers and monotone curves. Both are bounded in [-1, 1], both ignore slope, and neither detects a U-shape, so always look at the scatter plot.',
          concepts: ['Pearson correlation and linearity', 'Spearman rank correlation', 'Correlation is not slope', 'Anscombe quartet and plotting first'],
          quiz: [
            ['Pearson r of y = x squared over symmetric x?', 'About 0, despite a perfect relationship.'],
            ['Which correlation suits ordinal ratings?', 'Spearman.'],
          ],
        },
        {
          title: 'Correlation versus causation',
          description: 'Confounders, reverse causation and selection effects all produce correlations without causation. Randomised experiments break confounding; observational data needs causal thinking such as controlling for variables, instruments or difference in differences.',
          concepts: ['Confounding variables', 'Reverse causation', 'Randomisation as the gold standard', 'Observational causal designs'],
          quiz: [
            ['Ice cream sales correlate with drownings: what is the confounder?', 'Hot weather.'],
            ['Why does randomisation solve confounding?', 'It balances all confounders, known and unknown, across groups on average.'],
          ],
          prereqs: ['Correlation coefficients'],
        },
        {
          title: 'Simple linear regression',
          description: 'Fitting y = a + bx by least squares, reading the slope as change in y per unit x, r-squared as explained variance, and the standard error and t-test on the slope. numpy.polyfit or statsmodels give the numbers; interpretation is the job.',
          concepts: ['Least squares and residuals', 'Interpreting slope and intercept', 'Residual standard error', 'Inference on the slope'],
          quiz: [
            ['What does the slope 2.5 mean for price on square metres?', 'Each extra square metre is associated with 2.5 more units of price on average.'],
            ['r-squared of 0.64 means?', '64% of the variance in y is explained by x; r is 0.8.'],
          ],
          prereqs: ['Correlation coefficients'],
        },
        {
          title: 'Multiple regression and interpretation',
          description: 'Adding predictors changes every coefficient because each is now "holding the others fixed". Dummy variables encode categories, interactions let slopes vary by group, and adjusted r-squared penalises pointless predictors.',
          concepts: ['Coefficients holding others constant', 'Dummy variables for categories', 'Interaction terms', 'Adjusted r-squared and model comparison'],
          quiz: [
            ['Why did the coefficient on age flip sign after adding income?', 'Age and income are correlated; the coefficient is now the effect of age at fixed income.'],
            ['How many dummy columns for a category with 4 levels?', 'Three, with one level as the baseline.'],
          ],
          prereqs: ['Simple linear regression'],
        },
        {
          title: 'Regression diagnostics',
          description: 'A regression is only as trustworthy as its assumptions: residual plots reveal non-linearity and heteroscedasticity, leverage and Cook distance reveal influential points, and VIF reveals multicollinearity that inflates standard errors.',
          concepts: ['Residual plots and non-linearity', 'Heteroscedasticity', 'Leverage and influential points', 'Multicollinearity and VIF'],
          quiz: [
            ['What pattern in residuals suggests a missing squared term?', 'A curved, U-shaped band.'],
            ['VIF above what value is a common warning?', 'Around 5 to 10.'],
          ],
          prereqs: ['Multiple regression and interpretation'],
        },
      ],
    },
    {
      title: 'Bayesian and Nonparametric Methods',
      topics: [
        {
          title: 'Bayesian thinking: priors, likelihoods and posteriors',
          description: 'Bayesian inference treats the parameter as uncertain and updates a prior with the likelihood to get a posterior distribution. It answers the question people actually ask, "what is the probability the new version is better", at the price of stating a prior.',
          concepts: ['Parameters as distributions', 'Choosing informative and weak priors', 'Posterior as prior times likelihood', 'Bayesian versus frequentist questions'],
          quiz: [
            ['What does the posterior combine?', 'The prior belief and the likelihood of the observed data.'],
            ['What happens to the prior as data grows?', 'Its influence fades and the posterior is dominated by the likelihood.'],
          ],
          prereqs: ["Bayes' theorem"],
        },
        {
          title: 'Conjugate priors and the Beta-binomial model',
          description: 'A Beta(a, b) prior on a conversion rate updated with s successes and f failures is Beta(a+s, b+f), so A/B results become a closed-form posterior. Plotting the two posteriors and sampling from them gives P(B > A) directly.',
          concepts: ['The Beta distribution as a prior', 'Beta-binomial conjugate update', 'Posterior probability that B beats A', 'Normal-normal conjugacy for means'],
          quiz: [
            ['Prior Beta(1,1), 30 successes in 100 trials: posterior?', 'Beta(31, 71).'],
            ['How do you compute P(rate_B > rate_A) from posteriors?', 'Sample both posteriors many times and take the fraction where B exceeds A.'],
          ],
          prereqs: ['Bayesian thinking: priors, likelihoods and posteriors'],
        },
        {
          title: 'Credible intervals and Bayesian decisions',
          description: 'A 95% credible interval really does contain the parameter with 95% posterior probability. Expected loss turns the posterior into a decision, which is how Bayesian A/B testing decides when to stop without a fixed sample size.',
          concepts: ['Credible versus confidence intervals', 'Highest density intervals', 'Expected loss and decision rules', 'Sequential decisions with posteriors'],
          quiz: [
            ['What does a 95% credible interval mean?', 'Given the data and prior, there is a 95% probability the parameter lies inside.'],
            ['Why can Bayesian tests be stopped early more safely?', 'The posterior is valid at any time; decisions are based on expected loss rather than a fixed alpha.'],
          ],
          prereqs: ['Conjugate priors and the Beta-binomial model'],
        },
        {
          title: 'Rank-based tests: Mann-Whitney and Wilcoxon',
          description: 'When data are skewed, ordinal or tiny, tests on ranks replace tests on means: Mann-Whitney U for two independent groups, Wilcoxon signed-rank for pairs, and the Kolmogorov-Smirnov test for whole distributions.',
          concepts: ['Why ranks resist outliers', 'Mann-Whitney U test', 'Wilcoxon signed-rank test', 'Kolmogorov-Smirnov distribution test'],
          quiz: [
            ['What does Mann-Whitney test, strictly?', 'Whether one group tends to have larger values than the other (stochastic dominance), not the means.'],
            ['Rank-based analogue of the paired t-test?', 'Wilcoxon signed-rank.'],
          ],
          prereqs: ['One-sample and two-sample t-tests'],
        },
        {
          title: 'Permutation tests and kernel density estimation',
          description: 'A permutation test shuffles group labels to build the null distribution of any statistic from the data itself, with no distributional assumption. KDE smooths a histogram into a density estimate whose bandwidth, not the data, drives the bumps you see.',
          concepts: ['Permutation test procedure', 'Choosing the test statistic freely', 'Kernel density estimation', 'Bandwidth selection'],
          quiz: [
            ['How is the permutation p-value computed?', 'The fraction of label shuffles giving a statistic at least as extreme as the observed one.'],
            ['What does a too-small KDE bandwidth produce?', 'A spiky, overfitted density that mirrors individual points.'],
          ],
          prereqs: ['Rank-based tests: Mann-Whitney and Wilcoxon'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: Titanic survival by the numbers',
          description: 'Using the Titanic passenger list, build contingency tables of survival by class and sex, run chi-square tests with effect sizes, compare ages of survivors and non-survivors with t and Mann-Whitney tests, and write a one-page statistical report.',
          concepts: ['Describe every column with the right summary', 'Test survival against class and sex', 'Compare age distributions between groups', 'Report estimates, intervals and effect sizes'],
          quiz: [
            ['Which test for survival versus passenger class?', 'Chi-square test of independence on the 3 by 2 table, with Cramer V for strength.'],
            ['Why report a confidence interval for the survival gap?', 'It shows the plausible size of the difference, not just that it exists.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: NYC taxi tips and fares',
          description: 'On a month of NYC yellow taxi trips, characterise tip percentage and trip distance distributions, bootstrap the median tip for card versus cash, model fare on distance and duration with regression, and check the residuals for airport trips.',
          concepts: ['Profile skewed fare and tip distributions', 'Bootstrap intervals for medians', 'Regress fare on distance and duration', 'Diagnose residuals and outliers'],
          quiz: [
            ['Why bootstrap the median tip instead of using a t interval?', 'Tips are heavily skewed with many zeros, so the median is the right centre and has no simple formula.'],
            ['What would a residual cluster at fixed fares indicate?', 'Flat-rate trips, such as airport rides, that the linear model does not capture.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: retail A/B test analysis',
          description: 'Analyse a two-variant checkout experiment from retail transaction logs: check the randomisation, compute conversion with Wilson intervals, run a two-proportion z-test and a Bayesian Beta-binomial comparison, then decide with a power check on the minimum detectable effect.',
          concepts: ['Validate the split and sample ratio', 'Frequentist two-proportion test', 'Bayesian probability of improvement', 'Power check and recommendation'],
          quiz: [
            ['What is a sample ratio mismatch and why check it?', 'The variant split deviates from the intended ratio, which signals broken assignment and invalidates the test.'],
            ['Both analyses agree B is likely better by 0.3%: what next?', 'Compare to the minimum effect worth shipping and the cost of the change before deciding.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: air quality distribution study',
          description: 'With hourly air quality readings from several stations, fit candidate distributions to PM2.5 by maximum likelihood, compare them with QQ plots and KS tests, estimate exceedance probabilities with intervals, and test whether stations differ with ANOVA and Kruskal-Wallis.',
          concepts: ['Fit lognormal and gamma by MLE', 'Compare fits with QQ plots and KS', 'Estimate threshold exceedance probabilities', 'Test station differences'],
          quiz: [
            ['Why might PM2.5 fit a lognormal better than a normal?', 'Concentrations are positive and right-skewed, and multiplicative processes produce lognormal shapes.'],
            ['When is Kruskal-Wallis preferred over ANOVA here?', 'When station distributions are skewed with unequal variances.'],
          ],
          style: 'project',
        },
        {
          title: 'Statistics interview questions',
          description: 'The questions that recur in data science interviews: explain a p-value to a manager, what the CLT gives you, confidence versus credible intervals, Type I versus Type II trade-offs, when to use which test, and how you would design and size an A/B test.',
          concepts: ['Explaining p-values and intervals plainly', 'Choosing the right test quickly', 'Experiment design questions', 'Bayesian versus frequentist framing'],
          quiz: [
            ['Explain a 95% confidence interval to a non-statistician.', 'If we repeated the study many times, 95% of the intervals built this way would contain the true value.'],
            ['Which test compares three group means?', 'One-way ANOVA, then post-hoc tests.'],
          ],
          style: 'reading',
        },
        {
          title: 'Probability puzzles and estimation problems',
          description: 'Short whiteboard problems: the Monty Hall and birthday problems, expected values of games, conditional probability with cards, and quick sample size estimates, each solved by enumeration and confirmed with a numpy simulation.',
          concepts: ['Enumerate then simulate', 'Monty Hall and birthday problems', 'Expected value of games and bets', 'Back-of-envelope sample sizes'],
          quiz: [
            ['Monty Hall: should you switch?', 'Yes, switching wins 2/3 of the time.'],
            ['How many people for a 50% chance of a shared birthday?', '23'],
          ],
        },
      ],
    },
  ],
})
