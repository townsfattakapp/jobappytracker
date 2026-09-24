import { defineTrack } from '../define'

export const statisticsAnalysts = defineTrack({
  id: 'track-statistics-analysts',
  title: 'Statistics for Analysts',
  description: 'Applied statistics for business analysis without machine learning: describing data, distributions in business metrics, sampling and confidence intervals, the hypothesis tests analysts actually run, correlation and regression for insight, seasonality and trend, reading A/B tests, the classic pitfalls and communicating uncertainty.',
  family: 'Data Analytics & BI',
  kind: 'domain',
  icon: '📐',
  tags: ['statistics', 'analytics', 'hypothesis testing', 'confidence intervals', 'regression', 'a/b testing', 'business analysis'],
  languages: ['Python'],
  explainMode: 'math',
  code: { label: 'plain-text maths with numpy checks', id: 'python', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Describing Data',
      description: 'Summaries that tell the truth about a column of numbers.',
      topics: [
        {
          title: 'Mean, median and mode: which one to report',
          description: 'The mean is pulled by extreme values, the median is the middle customer and the mode is the most common value; for skewed business data such as order value or salary, reporting the median beside the mean prevents a few whales from misrepresenting the typical case.',
          concepts: ['Mean and its sensitivity to outliers', 'Median as the typical case', 'Mode for categorical and discrete data', 'Choosing the centre for a business question', 'Weighted means'],
          quiz: [
            ['Ten customers spend 10 each and one spends 1000. Mean and median?', 'Mean 100, median 10.'],
            ['When is a weighted mean required?', 'When averaging rates or averages that come from groups of different sizes.'],
          ],
        },
        {
          title: 'Spread: range, IQR, variance and standard deviation',
          description: 'Two teams with the same average handle time can be wildly different; the interquartile range describes the middle half, variance is the average squared distance from the mean and standard deviation returns to the original units, which makes it the spread figure people quote.',
          concepts: ['Range and its fragility', 'Quartiles and the IQR', 'Variance and standard deviation', 'Sample versus population formulas', 'Coefficient of variation'],
          quiz: [
            ['Why divide by n-1 for a sample standard deviation?', 'It corrects the bias from estimating the mean from the same data.'],
            ['What does an IQR of 0 to 20 with a max of 900 tell you?', 'The bulk is small and there are extreme outliers on the high end.'],
          ],
          prereqs: ['Mean, median and mode: which one to report'],
        },
        {
          title: 'Skew, outliers and robust statistics',
          description: 'Right-skewed data has a long tail of large values, which is the norm for revenue, latency and time-on-site; the 1.5 x IQR rule and z-scores flag outliers, and trimmed means or medians give summaries that a single bad row cannot wreck.',
          concepts: ['Right and left skew', 'The 1.5 x IQR outlier rule', 'z-scores for flagging values', 'Trimmed and winsorised means', 'Investigating outliers before removing them'],
          quiz: [
            ['What does mean greater than median indicate?', 'Right skew: a tail of large values.'],
            ['Should outliers be deleted?', 'Not by default; first check whether they are errors or real extreme cases.'],
          ],
          prereqs: ['Spread: range, IQR, variance and standard deviation'],
        },
        {
          title: 'Percentiles and quantiles in reporting',
          description: 'p50, p90 and p99 describe what most, nearly all and the worst-served users experience; percentile-based SLAs and targets are more honest than averages because they cannot be met by improving the easy cases while the tail gets worse.',
          concepts: ['Percentile definitions and interpolation', 'p50, p90 and p99 in SLAs', 'Deciles and customer segmentation', 'Percentiles across groups of different sizes'],
          quiz: [
            ['Why report p95 latency rather than average latency?', 'The average hides the slow tail that a meaningful share of users experience.'],
            ['What is the 80th percentile of 1,2,3,4,5,6,7,8,9,10?', 'About 8.2 with linear interpolation, or 8 with the nearest-rank method.'],
          ],
          prereqs: ['Spread: range, IQR, variance and standard deviation'],
        },
        {
          title: 'Summarising categorical data',
          description: 'Counts, proportions and rates summarise categories, but a rate needs a clearly defined denominator and a minimum count to be stable; cross-tabulations show how two categories relate before any test is run.',
          concepts: ['Frequencies and proportions', 'Rates and defining the denominator', 'Small-count instability', 'Cross-tabulations and row percentages'],
          quiz: [
            ['A region converts at 100% from 2 visits. What is the problem?', 'Two observations cannot support a rate; show the count and suppress or pool tiny groups.'],
            ['What is the difference between row and column percentages in a cross-tab?', 'Row percentages sum to 100 across a row; column percentages down a column; they answer different questions.'],
          ],
        },
      ],
    },
    {
      title: 'Distributions in Business Data',
      description: 'The shapes data takes and what that means for the numbers you compute.',
      topics: [
        {
          title: 'The normal distribution and when business data is not normal',
          description: 'The bell curve is described by its mean and standard deviation, with 68, 95 and 99.7 percent of values within one, two and three deviations; heights and measurement error are normal, but revenue, session length and counts rarely are, which changes which methods are valid.',
          concepts: ['Mean and standard deviation parameters', 'The 68-95-99.7 rule', 'Checking normality with histograms and QQ plots', 'What breaks when data is not normal'],
          quiz: [
            ['What share of a normal distribution lies within two standard deviations?', 'About 95%.'],
            ['Is order value usually normal?', 'No, it is right-skewed with a long tail.'],
          ],
          prereqs: ['Skew, outliers and robust statistics'],
        },
        {
          title: 'Long-tailed distributions: revenue, sessions and order value',
          description: 'Log-normal and power-law shapes dominate customer spend, page views and file sizes: a small share of customers produce most revenue, averages are unstable, and the top few rows can flip a comparison; medians, percentiles and log scales are the working tools.',
          concepts: ['Log-normal and power-law shapes', 'Pareto concentration of revenue', 'Unstable means under heavy tails', 'Log scales for plotting'],
          quiz: [
            ['Why does adding one huge customer change the mean but not the median?', 'The median depends only on rank order, the mean on every value.'],
            ['What does a straight line on a log-log plot suggest?', 'A power-law relationship.'],
          ],
          prereqs: ['The normal distribution and when business data is not normal'],
        },
        {
          title: 'Binomial and Poisson for conversions and counts',
          description: 'A conversion rate is a binomial process (n trials, probability p) and counts of events per period such as support tickets follow a Poisson shape; knowing this gives the expected variance for free, which is what confidence intervals and tests for rates rely on.',
          concepts: ['Binomial trials and success probability', 'Variance of a proportion', 'Poisson counts and rate parameter', 'Overdispersion in real counts'],
          quiz: [
            ['What is the standard deviation of a proportion p from n trials?', 'sqrt(p(1-p)/n)'],
            ['A Poisson mean of 16 tickets per day implies what standard deviation?', '4, the square root of the mean.'],
          ],
        },
        {
          title: 'Log transforms and geometric means',
          description: 'Taking logs turns multiplicative growth into additive steps and compresses long tails so comparisons and regression behave; the geometric mean is the right average for growth rates and ratios, where the arithmetic mean overstates.',
          concepts: ['Log transform of skewed metrics', 'Interpreting log differences as percentages', 'Geometric mean for growth rates', 'Back-transforming results'],
          quiz: [
            ['Average of +100% and -50% growth: arithmetic versus geometric?', 'Arithmetic 25%, geometric 0%, and 0% is correct because 2 x 0.5 = 1.'],
            ['What does a difference of 0.1 in natural logs approximate?', 'About a 10% relative difference.'],
          ],
          prereqs: ['Long-tailed distributions: revenue, sessions and order value'],
        },
      ],
    },
    {
      title: 'Sampling and Uncertainty',
      description: 'Why a number from a sample is an estimate, and how wide the uncertainty is.',
      topics: [
        {
          title: 'Populations, samples and sampling frames',
          description: 'A survey of last month\'s buyers says nothing about people who did not buy; the sampling frame is who could have been picked, and every conclusion is limited to it. Random sampling is what lets a sample stand in for the population at all.',
          concepts: ['Population versus sample', 'The sampling frame', 'Simple random and stratified sampling', 'Convenience samples and their limits'],
          quiz: [
            ['What is a sampling frame?', 'The list of units that could be selected into the sample.'],
            ['Why stratify a sample?', 'To guarantee representation of small but important groups and reduce variance.'],
          ],
        },
        {
          title: 'Sampling bias and non-response',
          description: 'Who answers a survey, who opts into a beta and whose data gets logged are all selection processes; response rates below half make the responders a different population, and weighting can only partly correct for it.',
          concepts: ['Selection bias mechanisms', 'Non-response and self-selection', 'Weighting to known totals', 'Checking respondents against the population'],
          quiz: [
            ['An NPS survey has a 5% response rate. What is the concern?', 'Responders differ systematically from non-responders, so the score is not representative.'],
            ['How can you detect non-response bias?', 'Compare respondent demographics or behaviour to the full population.'],
          ],
          prereqs: ['Populations, samples and sampling frames'],
        },
        {
          title: 'The standard error and the central limit theorem',
          description: 'The standard error is the standard deviation of a statistic across repeated samples, equal to sd / sqrt(n) for a mean; the central limit theorem says the sampling distribution of a mean is close to normal for large enough samples even when the data is skewed, which is why intervals and tests work.',
          concepts: ['Standard error of the mean', 'Sampling distributions', 'Central limit theorem conditions', 'Square-root law of sample size'],
          quiz: [
            ['How does the standard error change when n quadruples?', 'It halves.'],
            ['Does the CLT make the data normal?', 'No, it makes the distribution of the sample mean approximately normal.'],
          ],
          prereqs: ['Populations, samples and sampling frames', 'The normal distribution and when business data is not normal'],
        },
        {
          title: 'Confidence intervals for means',
          description: 'A 95% interval is estimate plus or minus about 1.96 standard errors (t-multiplier for small n); it says where the true mean plausibly lies, not that there is a 95% chance the truth is inside this one interval, and its width is the honest statement of precision.',
          concepts: ['Estimate plus or minus margin of error', 'z versus t multipliers', 'Interpreting a 95% interval correctly', 'Width, sample size and confidence level'],
          quiz: [
            ['Mean 50, sd 20, n 100: 95% interval?', 'About 46.1 to 53.9 (50 plus or minus 1.96 x 2).'],
            ['Does a 95% interval mean 95% of customers fall inside it?', 'No; it is about the mean, not individual values.'],
          ],
          prereqs: ['The standard error and the central limit theorem'],
        },
        {
          title: 'Confidence intervals for proportions',
          description: 'A conversion rate of 5% from 400 visitors has a margin of error of about 2 points, which is why week-to-week wobbles are usually noise; the Wald interval is the quick formula, and the Wilson interval behaves properly for small counts and rates near 0 or 1.',
          concepts: ['Wald interval for a proportion', 'Wilson interval for small samples', 'Margin of error versus base rate', 'Sample size for a target margin'],
          quiz: [
            ['Approximate 95% margin of error for p = 0.5 and n = 1000?', 'About 3 percentage points.'],
            ['Why not use the Wald interval at 2 conversions from 50?', 'It can extend below zero and is too narrow; use Wilson.'],
          ],
          prereqs: ['Confidence intervals for means', 'Binomial and Poisson for conversions and counts'],
        },
      ],
    },
    {
      title: 'Hypothesis Tests Analysts Run',
      description: 'The handful of tests that cover most business questions, and how to read them.',
      topics: [
        {
          title: 'Null hypotheses, p-values and significance',
          description: 'A test assumes no difference (the null), computes how surprising the observed data would be under that assumption (the p-value), and rejects the null when the surprise crosses a threshold; a p-value is not the probability the null is true, and 0.05 is a convention, not a law.',
          concepts: ['Null and alternative hypotheses', 'What a p-value measures', 'Significance level and Type I error', 'Type II error and power', 'One-tailed versus two-tailed'],
          quiz: [
            ['p = 0.03 means what?', 'If there were no real effect, data this extreme would occur about 3% of the time.'],
            ['What is a Type I error?', 'Rejecting the null when it is actually true, a false positive.'],
          ],
          prereqs: ['Confidence intervals for means'],
        },
        {
          title: 'Two-proportion z-test for conversion rates',
          description: 'Comparing 5.1% versus 5.6% conversion between two groups uses a pooled proportion and standard error to get a z-statistic; it is the workhorse for A/B tests on binary outcomes and connects directly to the confidence interval for the difference.',
          concepts: ['Pooled proportion and standard error', 'z-statistic and p-value', 'Confidence interval for the difference', 'Minimum counts for validity'],
          quiz: [
            ['What is the pooled proportion?', 'Total successes over total trials across both groups.'],
            ['What sample size rule of thumb makes the z-test acceptable?', 'At least 10 successes and 10 failures in each group.'],
          ],
          prereqs: ['Null hypotheses, p-values and significance', 'Confidence intervals for proportions'],
        },
        {
          title: 't-tests for comparing means',
          description: 'The two-sample t-test compares average order value or handle time between groups, Welch\'s version drops the equal-variance assumption and should be the default, and the paired t-test handles before-and-after measurements on the same units.',
          concepts: ['One-sample, two-sample and paired designs', 'Welch\'s t-test as the default', 'Degrees of freedom', 'Effect size with Cohen\'s d'],
          quiz: [
            ['When do you use a paired t-test?', 'When each observation in one group matches one in the other, such as the same store before and after.'],
            ['Why prefer Welch\'s t-test?', 'It does not assume equal variances and loses almost nothing when they are equal.'],
          ],
          prereqs: ['Null hypotheses, p-values and significance'],
        },
        {
          title: 'Chi-square tests for independence',
          description: 'A chi-square test asks whether the distribution across categories differs between groups, such as plan choice by region, by comparing observed counts with those expected under independence; expected counts under 5 make it unreliable.',
          concepts: ['Observed versus expected counts', 'Chi-square statistic and degrees of freedom', 'Goodness-of-fit versus independence', 'Small expected counts and Fisher\'s exact test'],
          quiz: [
            ['How do you compute an expected count in a cross-tab?', 'Row total x column total / grand total.'],
            ['Degrees of freedom for a 3 x 4 table?', '(3-1) x (4-1) = 6'],
          ],
          prereqs: ['Summarising categorical data', 'Null hypotheses, p-values and significance'],
        },
        {
          title: 'Non-parametric tests for skewed metrics',
          description: 'When revenue per user is heavily skewed and samples are small, the Mann-Whitney U test compares distributions using ranks rather than means, and bootstrapping builds a confidence interval for any statistic by resampling the data.',
          concepts: ['Mann-Whitney U on ranks', 'What a rank test actually compares', 'Bootstrap confidence intervals', 'Choosing between t-test and rank test'],
          quiz: [
            ['What does the bootstrap do?', 'Resamples the data with replacement many times to estimate the sampling distribution of a statistic.'],
            ['Does Mann-Whitney compare medians?', 'Not exactly; it tests whether one group tends to have larger values.'],
          ],
          prereqs: ['t-tests for comparing means'],
        },
        {
          title: 'Power, sample size and minimum detectable effect',
          description: 'Before a test starts you choose the smallest effect worth detecting, and the required sample size follows from it, the baseline rate and the desired power (usually 80%); running a test without this calculation is how "no significant difference" becomes meaningless.',
          concepts: ['Statistical power and 80% convention', 'Minimum detectable effect', 'Sample size formula for proportions', 'Trading duration for sensitivity'],
          quiz: [
            ['Baseline 5%, MDE 0.5 points, 80% power: rough sample per group?', 'Around 30,000 per group.'],
            ['What does an underpowered test tell you when it fails to reject?', 'Almost nothing; the effect could still be there.'],
          ],
          prereqs: ['Two-proportion z-test for conversion rates'],
        },
      ],
    },
    {
      title: 'Correlation and Regression for Insight',
      description: 'Measuring relationships and controlling for other factors, without predicting anything.',
      topics: [
        {
          title: 'Pearson and Spearman correlation',
          description: 'Pearson\'s r measures linear association from -1 to 1, Spearman uses ranks and captures any monotonic relationship while shrugging off outliers; a correlation matrix is the fastest way to see which metrics move together before deciding what to investigate.',
          concepts: ['Pearson r and linearity', 'Spearman rank correlation', 'Correlation matrices and heat maps', 'Outliers and Anscombe\'s quartet'],
          quiz: [
            ['r = -0.8 between price and units sold means?', 'A strong negative linear relationship: higher price, fewer units.'],
            ['When prefer Spearman?', 'For ranked or heavily skewed data, or non-linear but monotonic relationships.'],
          ],
          prereqs: ['Skew, outliers and robust statistics'],
        },
        {
          title: 'Simple linear regression: slope, intercept and R-squared',
          description: 'Fitting y = a + bx by least squares gives a slope you can state in business units (each extra ad dollar adds 3.2 in revenue), an intercept that may be meaningless, and R-squared, the share of variance explained; residual plots reveal when a line is the wrong shape.',
          concepts: ['Least squares fit', 'Interpreting the slope in units', 'R-squared and what it does not say', 'Residual plots and misfit'],
          quiz: [
            ['What does R-squared of 0.25 mean?', 'The line explains 25% of the variance in y.'],
            ['Why check the residual plot?', 'A pattern in residuals shows a curve, changing variance or missing variable.'],
          ],
          prereqs: ['Pearson and Spearman correlation'],
        },
        {
          title: 'Multiple regression to control for factors',
          description: 'Adding variables such as region, season and campaign to the model estimates the effect of each while holding the others fixed, which is how an analyst separates the discount effect from the seasonal effect; categorical variables enter as dummy columns.',
          concepts: ['Holding other variables constant', 'Dummy variables for categories', 'Multicollinearity and unstable coefficients', 'Adjusted R-squared'],
          quiz: [
            ['What does a coefficient mean in multiple regression?', 'The change in y per unit of x with the other variables held constant.'],
            ['Why does adding correlated predictors make coefficients unstable?', 'Multicollinearity: the model cannot tell which one deserves the credit.'],
          ],
          prereqs: ['Simple linear regression: slope, intercept and R-squared'],
        },
        {
          title: 'Reading regression output',
          description: 'A regression table lists coefficients, standard errors, t-statistics, p-values and confidence intervals; the standard error says how precisely each effect is known, and a small p-value with a tiny coefficient is a precise estimate of an unimportant effect.',
          concepts: ['Coefficients and standard errors', 't-statistics and p-values per term', 'Confidence intervals for coefficients', 'Statistical versus practical size of an effect'],
          quiz: [
            ['A coefficient of 0.02 with p < 0.001: what do you conclude?', 'The effect is precisely estimated but you must judge whether 0.02 matters in business terms.'],
            ['What does a large standard error relative to the coefficient imply?', 'The effect is poorly determined; its interval likely spans zero.'],
          ],
          prereqs: ['Multiple regression to control for factors'],
        },
        {
          title: 'Correlation, causation and confounders',
          description: 'Ice cream sales and drownings both rise in summer; a confounder drives both and creates a correlation with no causal link. Only randomisation or careful controlling supports causal language, so analysts write "associated with" unless they can say why not.',
          concepts: ['Confounding variables', 'Reverse causation', 'Randomisation as the causal tool', 'Careful language: associated with'],
          quiz: [
            ['Users who use feature X retain better. Can you say X causes retention?', 'No; engaged users may adopt X and retain for the same underlying reason.'],
            ['What design supports a causal claim?', 'A randomised experiment.'],
          ],
          prereqs: ['Pearson and Spearman correlation'],
        },
      ],
    },
    {
      title: 'Seasonality and Trend Basics',
      description: 'Reading time series honestly before anyone forecasts anything.',
      topics: [
        {
          title: 'Trend, seasonality and noise',
          description: 'A metric over time is a trend plus a repeating seasonal pattern plus noise; separating them, even with simple averages, prevents celebrating a December spike as growth or panicking over a January dip.',
          concepts: ['Additive versus multiplicative components', 'Identifying the seasonal period', 'Simple decomposition by averaging', 'Residuals as the interesting part'],
          quiz: [
            ['Sales jump 40% in December every year. Is this December growth?', 'No, it is seasonality; compare with last December.'],
            ['When is a multiplicative model appropriate?', 'When seasonal swings grow with the level of the series.'],
          ],
        },
        {
          title: 'Moving averages and smoothing',
          description: 'A trailing 7-day moving average removes day-of-week noise and a 12-month average removes annual seasonality, at the cost of lag; exponential smoothing weights recent points more and reacts faster to real change.',
          concepts: ['Trailing moving averages', 'Window length and lag', 'Centred moving averages', 'Exponential smoothing'],
          quiz: [
            ['Why use a 7-day window for daily web traffic?', 'It contains each weekday once, cancelling the weekly cycle.'],
            ['What is the cost of a longer window?', 'More lag: changes show up later.'],
          ],
          prereqs: ['Trend, seasonality and noise'],
        },
        {
          title: 'Seasonal adjustment and year-over-year comparison',
          description: 'Comparing this month with the same month last year cancels seasonality but hides recent momentum; seasonal indices adjust each period to a comparable level so month-over-month change reflects real movement.',
          concepts: ['Year-over-year growth', 'Seasonal indices per period', 'Seasonally adjusted series', 'Calendar effects: working days and holidays'],
          quiz: [
            ['February revenue fell 10% from January. First check?', 'Fewer days in February; compare per-day or seasonally adjusted figures.'],
            ['How is a seasonal index computed simply?', 'Average of each period divided by the overall average.'],
          ],
          prereqs: ['Moving averages and smoothing'],
        },
        {
          title: 'Forecast baselines and their uncertainty',
          description: 'Naive (last value), seasonal naive (same period last year) and linear trend forecasts are the baselines any fancier method must beat; stating a forecast range rather than a point and tracking error after the fact keeps forecasting honest.',
          concepts: ['Naive and seasonal naive forecasts', 'Linear trend extrapolation', 'Forecast intervals', 'Measuring error with MAE and MAPE'],
          quiz: [
            ['What is the seasonal naive forecast for next March?', 'The value from last March, optionally scaled by the trend.'],
            ['Why report MAPE with caution?', 'It explodes when actual values are near zero and penalises under-forecasts more.'],
          ],
          prereqs: ['Seasonal adjustment and year-over-year comparison'],
        },
      ],
    },
    {
      title: 'Reading A/B Tests',
      description: 'How to read an experiment result, and the ways it goes wrong.',
      topics: [
        {
          title: 'Experiment design: randomisation, units and guardrails',
          description: 'Randomising users (not sessions) into control and variant is what makes a difference attributable to the change; a sample ratio mismatch check, guardrail metrics and a pre-registered primary metric are the design elements that make the result readable later.',
          concepts: ['Randomisation unit choice', 'Primary and guardrail metrics', 'Sample ratio mismatch check', 'Pre-registering the analysis'],
          quiz: [
            ['What is a sample ratio mismatch?', 'Group sizes differ from the planned split more than chance allows, signalling a broken assignment.'],
            ['Why randomise by user rather than session?', 'One user seeing both versions contaminates the comparison and inflates the sample.'],
          ],
          prereqs: ['Power, sample size and minimum detectable effect'],
        },
        {
          title: 'Reading an A/B test result',
          description: 'The result is an effect estimate with a confidence interval and a p-value; an interval spanning zero means inconclusive, not "no effect", and the lift should be reported as absolute and relative points with the sample sizes behind them.',
          concepts: ['Effect estimate with interval', 'Absolute versus relative lift', 'Inconclusive versus no effect', 'Reporting sample sizes and duration'],
          quiz: [
            ['Variant converts 5.4% versus 5.0%, interval -0.1 to 0.9 points. Conclusion?', 'Inconclusive: the interval includes zero, so more data or a larger effect is needed.'],
            ['What is the relative lift from 5.0% to 5.4%?', '8%'],
          ],
          prereqs: ['Experiment design: randomisation, units and guardrails', 'Two-proportion z-test for conversion rates'],
        },
        {
          title: 'Peeking, early stopping and sequential tests',
          description: 'Checking a running test daily and stopping the first time p dips below 0.05 inflates false positives several-fold; fix the sample size in advance or use a sequential method designed for continuous monitoring.',
          concepts: ['Why peeking inflates false positives', 'Fixed-horizon tests', 'Sequential testing methods', 'Setting a stopping rule up front'],
          quiz: [
            ['What happens to the false-positive rate if you check daily for 20 days and stop when significant?', 'It rises far above 5%, often to 20-30%.'],
            ['What is the simple defence against peeking?', 'Decide the sample size and end date before starting and analyse once.'],
          ],
          prereqs: ['Reading an A/B test result'],
        },
        {
          title: 'Novelty effects, segments and multiple comparisons',
          description: 'A new design wins in week one because it is new, segment slicing finds a "winning" group by chance if you look at enough of them, and testing ten metrics at 0.05 each almost guarantees a false positive; longer runs and corrections such as Bonferroni protect against all three.',
          concepts: ['Novelty and primacy effects', 'Post-hoc segment fishing', 'Multiple comparisons and Bonferroni', 'Pre-specifying segments and metrics'],
          quiz: [
            ['Testing 20 metrics at 0.05: expected false positives with no real effects?', 'About one.'],
            ['What is the Bonferroni correction?', 'Divide the significance level by the number of tests.'],
          ],
          prereqs: ['Reading an A/B test result'],
        },
      ],
    },
    {
      title: 'Statistical Pitfalls',
      description: 'The mistakes that produce confident wrong answers.',
      topics: [
        {
          title: 'Simpson\'s paradox',
          description: 'A treatment can look worse overall yet better in every subgroup when group sizes differ, because the aggregate mixes groups with different base rates; always check whether a headline comparison survives splitting by the obvious confounder.',
          concepts: ['Aggregation reversing a comparison', 'Unequal group sizes as the mechanism', 'Checking the comparison within groups', 'Deciding which level answers the question'],
          quiz: [
            ['Channel A converts better in mobile and desktop but worse overall. How?', 'Channel A has more mobile traffic, which converts worse for everyone.'],
            ['Which level is correct, aggregate or subgroup?', 'Usually the subgroup level when the split variable is a confounder.'],
          ],
          prereqs: ['Correlation, causation and confounders'],
        },
        {
          title: 'Survivorship bias',
          description: 'Analysing only customers who are still active, companies that still exist or planes that returned tells you about survivors, not about the process; the missing failures are often where the insight is.',
          concepts: ['Conditioning on survival', 'Missing failures in the data', 'Churned-customer analysis as the fix', 'Historical examples and business analogues'],
          quiz: [
            ['Surveying current customers about why they stay: what is missing?', 'Everyone who left, whose reasons may be entirely different.'],
            ['How do you correct for survivorship in a retention study?', 'Start from the full cohort at signup, not from today\'s active base.'],
          ],
        },
        {
          title: 'p-hacking and the garden of forking paths',
          description: 'Trying several metrics, date ranges, filters and outlier rules until something is significant produces results that will not replicate; pre-specifying the analysis, reporting everything tried, and holding out data are the protections.',
          concepts: ['Analytical degrees of freedom', 'Pre-registration of the analysis plan', 'Reporting all analyses performed', 'Replication on new data'],
          quiz: [
            ['Why is choosing the date range after seeing results a problem?', 'It lets noise pick the window that flatters the hypothesis.'],
            ['What is the simplest protection against p-hacking?', 'Write down the metric, window and test before looking at the data.'],
          ],
          prereqs: ['Null hypotheses, p-values and significance'],
        },
        {
          title: 'Regression to the mean',
          description: 'The worst-performing stores this quarter will improve next quarter even if nothing changes, because extreme values partly reflect luck; interventions targeted at extremes look effective without a control group.',
          concepts: ['Extremes partly reflect chance', 'Selection on extreme values', 'Control groups as the remedy', 'Spotting it in before-after claims'],
          quiz: [
            ['You coach the 10 lowest-scoring agents and they improve. Proof of coaching?', 'No; regression to the mean predicts improvement anyway. Compare with uncoached low scorers.'],
            ['What breaks regression to the mean?', 'Nothing; only a control group separates it from the real effect.'],
          ],
          prereqs: ['Experiment design: randomisation, units and guardrails'],
        },
        {
          title: 'Base rates, denominators and misleading percentages',
          description: 'A 50% increase from 2 to 3 incidents, a rate computed over the wrong population and a percentage change of a percentage all mislead; always show the counts behind a percentage and name the denominator.',
          concepts: ['Percentage change on small bases', 'Choosing the right denominator', 'Percentage points versus percent', 'Showing counts beside rates'],
          quiz: [
            ['Conversion moved from 2% to 3%. Percent or percentage points?', 'Up 1 percentage point, which is a 50% relative increase.'],
            ['Why show the count next to a rate?', 'So readers can judge whether the rate is stable.'],
          ],
          prereqs: ['Summarising categorical data'],
        },
      ],
    },
    {
      title: 'Communicating Uncertainty',
      description: 'Saying what the data supports, no more and no less.',
      topics: [
        {
          title: 'Error bars, ranges and interval language',
          description: 'Showing a range on a chart or writing "between 4 and 6 percent" changes decisions more than any p-value; error bars need a label saying what they are (standard error, 95% interval, or percentiles) because readers assume different things.',
          concepts: ['Labelled error bars', 'Ranges in prose', 'Fan charts for forecasts', 'Avoiding false precision'],
          quiz: [
            ['Why label what an error bar represents?', 'A standard error bar is about half the width of a 95% interval; readers cannot tell which they are seeing.'],
            ['Is "conversion is 5.237%" a good statement?', 'No, the precision is false; report 5.2% with a range.'],
          ],
          prereqs: ['Confidence intervals for means'],
        },
        {
          title: 'Practical versus statistical significance',
          description: 'With a million rows, a 0.01 point difference is statistically significant and commercially irrelevant; with a hundred rows, a large real effect may not reach significance. The decision depends on effect size and cost, with the p-value as one input.',
          concepts: ['Effect size in business units', 'Large samples and trivial effects', 'Small samples and real effects', 'Decision framing with costs'],
          quiz: [
            ['p = 0.001 for a lift of 0.02 points on a 20% rate. Ship it?', 'Only if the cost of shipping is near zero; the effect is negligible.'],
            ['p = 0.12 for a 15% lift with n = 80. Give up?', 'No; the test is underpowered, so collect more data.'],
          ],
          prereqs: ['Null hypotheses, p-values and significance'],
        },
        {
          title: 'Writing a statistical finding for a non-technical reader',
          description: 'Lead with the decision-relevant number, state the range, name the caveat that matters most, and drop the test name; a good finding reads "the new flow converts about 0.5 points better, likely between 0.1 and 0.9, based on four weeks and 60,000 users".',
          concepts: ['Lead with the number and the range', 'One caveat that matters', 'Removing jargon without losing precision', 'Recommending an action and its confidence'],
          quiz: [
            ['What goes first in a findings summary?', 'The effect and its plausible range in business terms.'],
            ['Should you mention the test used?', 'Only in an appendix or on request.'],
          ],
          prereqs: ['Error bars, ranges and interval language', 'Practical versus statistical significance'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Analyses to complete end to end, then the statistics questions asked in analyst interviews.',
      style: 'project',
      topics: [
        {
          title: 'Project: conversion A/B test analysis',
          description: 'Take raw assignment and conversion logs, check the sample ratio, compute conversion per group with Wilson intervals, run a two-proportion z-test, check pre-specified segments with a correction, and write a one-page recommendation with the range and caveats.',
          concepts: ['Validate assignment and sample ratio', 'Compute rates with intervals', 'Test and correct for segments', 'Write the recommendation'],
          quiz: [
            ['What do you check before any test statistic?', 'That the split matches the plan and users are not in both groups.'],
            ['How do you present the segment results?', 'As pre-specified checks with corrected thresholds, clearly separated from the primary result.'],
          ],
        },
        {
          title: 'Project: price and demand regression study',
          description: 'Using weekly sales across stores, model units against price with region, promotion and season as controls, report the price coefficient with its interval, check residuals and multicollinearity, and translate the elasticity into a revenue what-if table.',
          concepts: ['Assemble the weekly panel', 'Fit and control for confounders', 'Diagnose the fit', 'Translate to a business what-if'],
          quiz: [
            ['Why include promotion as a control?', 'Promotions coincide with price cuts and would otherwise be credited to price.'],
            ['What is the elasticity from a log-log model?', 'The coefficient on log price: percent change in units per percent change in price.'],
          ],
        },
        {
          title: 'Project: seasonal sales decomposition and baseline forecast',
          description: 'Decompose three years of monthly sales into trend, seasonal indices and residuals, produce a seasonally adjusted series, build naive, seasonal naive and trend baselines, and evaluate them on a held-out year with MAE.',
          concepts: ['Decompose into components', 'Seasonally adjust the series', 'Build baseline forecasts', 'Evaluate on held-out months'],
          quiz: [
            ['Why hold out the last year?', 'To measure forecast error on data the method did not see.'],
            ['Which baseline usually wins on strongly seasonal retail data?', 'Seasonal naive, often with a trend adjustment.'],
          ],
        },
        {
          title: 'Statistics interview questions for analysts',
          description: 'The recurring questions: explain a p-value to a manager, mean versus median, what a confidence interval is, how you would size an A/B test, correlation versus causation, and what Simpson\'s paradox looks like in a real dataset.',
          concepts: ['Explaining core ideas plainly', 'Test selection questions', 'Experiment design questions', 'Pitfall spotting questions'],
          quiz: [
            ['Explain a 95% confidence interval in one sentence.', 'A range built so that, across many repeated samples, 95% of such ranges contain the true value.'],
            ['Which test compares conversion between two groups?', 'A two-proportion z-test (or chi-square on the 2 x 2 table).'],
          ],
          style: 'reading',
        },
        {
          title: 'Case-style statistics questions',
          description: 'Interviewers present a scenario (a metric dropped, a test result, a claim from marketing) and ask what you would check; practise structuring the answer around data quality, denominator, seasonality, segments and uncertainty.',
          concepts: ['A checklist for a metric change', 'Questioning a test result', 'Challenging a causal claim', 'Stating what data you would need'],
          quiz: [
            ['Revenue fell 8% last week. Name three non-causal explanations to rule out.', 'Tracking outage, seasonality or calendar effects, and a mix shift in segments.'],
            ['Marketing says the campaign caused a lift. What do you ask first?', 'What the comparison group is and whether exposure was randomised.'],
          ],
          style: 'practice',
        },
      ],
    },
  ],
})
