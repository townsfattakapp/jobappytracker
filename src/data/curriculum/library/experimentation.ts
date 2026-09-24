import { defineTrack } from '../define'

export const experimentation = defineTrack({
  id: 'track-experimentation',
  title: 'Experimentation and A/B Testing',
  description: 'Designing, running and analysing online experiments: hypotheses and metrics, randomisation and power, t-tests and proportions, CUPED, sequential testing, interference and switchbacks, bandits, and causal inference when you cannot randomise, ending in analysis projects.',
  family: 'Data Science',
  kind: 'domain',
  icon: '🧪',
  tags: ['a/b testing', 'experimentation', 'causal inference', 'statistics', 'hypothesis testing', 'cuped', 'bandits'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-probability-statistics'],
  style: 'practice',
  categories: [
    {
      title: 'Why Experiments',
      description: 'What a randomised experiment buys you that observational data cannot.',
      topics: [
        {
          title: 'Correlation, confounding and the case for randomisation',
          description: 'Users who adopt a feature differ from those who do not, so comparing them measures selection as much as effect; random assignment makes the groups exchangeable in expectation, which is why an A/B test can claim causation and a dashboard cannot.',
          concepts: ['Selection bias in observational comparisons', 'Confounders and spurious lift', 'Exchangeability through random assignment', 'What randomisation does not fix'],
          quiz: [
            ['Why does randomisation allow causal claims?', 'It makes treatment independent of every user characteristic, observed or not.'],
            ['Users who use the new feature retain better. Is the feature causing it?', 'Not necessarily; engaged users may self-select into using it.'],
          ],
        },
        {
          title: 'Potential outcomes and treatment effects',
          description: 'Each user has an outcome under treatment and one under control, but only one is observed; the average treatment effect is the mean difference across users, and an experiment estimates it because random groups have equal expected potential outcomes.',
          concepts: ['Potential outcomes per unit', 'Fundamental problem of causal inference', 'Average treatment effect', 'ATE versus effect on the treated'],
          quiz: [
            ['What is the fundamental problem of causal inference?', 'You never observe both potential outcomes for the same unit.'],
            ['What does the difference in group means estimate in an A/B test?', 'The average treatment effect over the population.'],
          ],
          prereqs: ['Correlation, confounding and the case for randomisation'],
        },
        {
          title: 'Types of online experiments',
          description: 'A/B tests compare two variants, A/A tests validate the system, multivariate tests vary several factors at once, holdouts measure the cumulative value of a series of launches, and each fits a different question and traffic budget.',
          concepts: ['A/B and A/B/n tests', 'A/A tests as system checks', 'Multivariate and factorial designs', 'Long-running holdout groups'],
          quiz: [
            ['What does an A/A test check?', 'That the assignment and analysis pipeline reports no effect when there is none.'],
            ['When is a factorial design better than sequential A/B tests?', 'When you need to measure interactions between two changes.'],
          ],
        },
        {
          title: 'When not to run an experiment',
          description: 'Some changes cannot be randomised for ethical, legal or practical reasons, some effects are too small or slow to detect with available traffic, and some decisions are cheap enough to make without a test; recognising these saves effort and credibility.',
          concepts: ['Ethical and legal constraints', 'Insufficient traffic for the effect', 'Slow-moving outcomes', 'Cheap reversible decisions'],
          quiz: [
            ['Give a case where an A/B test is inappropriate.', 'Testing a price increase on a randomly selected half of customers may be unfair or illegal.'],
            ['What is the alternative when an effect is too small to detect?', 'Accept the uncertainty, use a proxy metric, or estimate from observational data with caveats.'],
          ],
        },
      ],
    },
    {
      title: 'Hypotheses and Metrics',
      description: 'A test is only as good as the question and the number that answers it.',
      topics: [
        {
          title: 'Writing a testable hypothesis',
          description: 'A useful hypothesis names the change, the population, the metric and the expected direction and size, so the analysis plan is fixed before data arrives and the result cannot be reinterpreted afterwards to look like a win.',
          concepts: ['Change, population, metric, direction', 'Pre-registration of the analysis plan', 'Null and alternative hypotheses', 'One-sided versus two-sided tests'],
          quiz: [
            ['Why write the hypothesis before launch?', 'To prevent redefining success after seeing the data.'],
            ['When is a one-sided test justified?', 'When only one direction of effect would change the decision and this was decided in advance.'],
          ],
        },
        {
          title: 'Primary metrics and the overall evaluation criterion',
          description: 'The primary metric is the single number the decision hinges on; it should move within the test window, reflect long-term value, and be hard to game, and when several matter they are combined into one overall evaluation criterion with agreed weights.',
          concepts: ['One primary metric per test', 'Short-term proxies for long-term value', 'Overall evaluation criterion', 'Metric gaming and proxies'],
          quiz: [
            ['Why avoid several primary metrics?', 'Multiple chances to win inflate false positives and blur the decision.'],
            ['What makes a good proxy metric?', 'It moves within the test and is causally linked to the long-term outcome.'],
          ],
          prereqs: ['Writing a testable hypothesis'],
        },
        {
          title: 'Guardrail metrics',
          description: 'Guardrails are metrics that must not degrade, such as latency, error rate, revenue or unsubscribe rate; they are monitored with a non-inferiority framing so a win on the primary metric does not ship a hidden regression.',
          concepts: ['Choosing guardrails per launch', 'Non-inferiority margins', 'Performance and reliability guardrails', 'Automated guardrail alerts'],
          quiz: [
            ['How is a guardrail tested differently from a primary metric?', 'As non-inferiority: the effect must not be worse than a pre-set margin.'],
            ['Give two typical guardrails.', 'Page latency and revenue per user.'],
          ],
        },
        {
          title: 'Metric sensitivity and ratio metrics',
          description: 'A metric that barely moves needs enormous samples; sensitivity depends on variance and on how directly the change affects it, and ratio metrics like clicks per session need the delta method because sessions are not the randomisation unit.',
          concepts: ['Variance and detectable effect', 'Per-user versus per-event metrics', 'Ratio metrics and unit mismatch', 'Capping and winsorising heavy tails'],
          quiz: [
            ['Why is revenue per user hard to move significantly?', 'It has heavy tails and high variance, so the standard error is large.'],
            ['Why not compute a t-test on click-through rate per session?', 'Sessions from the same user are correlated; the unit of analysis must match the unit of randomisation.'],
          ],
          prereqs: ['Primary metrics and the overall evaluation criterion'],
        },
        {
          title: 'Minimum detectable effect',
          description: 'The minimum detectable effect is the smallest lift worth acting on, set by business value not by what is easy to detect; it anchors the sample size calculation and forces a conversation about whether the test is feasible before it starts.',
          concepts: ['Business-relevant effect sizes', 'Relative versus absolute MDE', 'Trade-off with sample size', 'Documenting the MDE decision'],
          quiz: [
            ['Who decides the minimum detectable effect?', 'The product owner, based on what lift would justify shipping.'],
            ['What happens to sample size when the MDE halves?', 'It roughly quadruples.'],
          ],
        },
      ],
    },
    {
      title: 'Designing the Experiment',
      description: 'Assignment, units, power and timing before a single user is exposed.',
      topics: [
        {
          title: 'Randomisation units',
          description: 'Assigning by user, session, page view or device changes what the test measures and how consistent the experience is; user-level assignment is the default because it gives independent observations and a stable experience across visits.',
          concepts: ['User, session and request units', 'Consistency of experience', 'Independence of observations', 'Anonymous users and identity stitching'],
          quiz: [
            ['Why is session-level assignment risky for a UI change?', 'The same user sees different variants on different visits, confusing them and correlating observations.'],
            ['What problem does identity stitching cause?', 'One user may be assigned to both variants across devices before login.'],
          ],
        },
        {
          title: 'Assignment by hashing',
          description: 'Deterministic assignment hashes the unit id with an experiment salt into a bucket, so the same user always gets the same variant without storing state, and different experiments with different salts are independent.',
          concepts: ['Hash of id and experiment salt', 'Bucket ranges to variants', 'Independence across experiments', 'Traffic ramps and exposure logging'],
          quiz: [
            ['Why include an experiment-specific salt in the hash?', 'So assignment in one experiment is independent of assignment in another.'],
            ['What does an exposure event record?', 'That a unit actually encountered the variant, which defines the analysis population.'],
          ],
          prereqs: ['Randomisation units'],
        },
        {
          title: 'Stratification and blocking',
          description: 'Balancing known covariates such as country or platform across variants reduces variance and prevents unlucky imbalance; stratified randomisation does it at assignment time, and post-stratification corrects for it in analysis.',
          concepts: ['Stratified random assignment', 'Blocking on high-variance covariates', 'Post-stratification adjustment', 'Checking covariate balance'],
          quiz: [
            ['What does stratification improve?', 'Precision, by removing variance explained by the stratifying variable.'],
            ['How do you check whether randomisation balanced a covariate?', 'Compare its distribution across variants; large differences suggest a bug.'],
          ],
        },
        {
          title: 'Sample size and power',
          description: 'Power is the probability of detecting the minimum detectable effect if it exists; sample size follows from the MDE, metric variance, significance level and power, and computing it up front avoids tests that could never have shown anything.',
          concepts: ['Type I and Type II error', 'Power formula for two means', 'Sample size for proportions', 'Power analysis in statsmodels'],
          quiz: [
            ['What does 80% power mean?', 'An 80% chance of a significant result when the true effect equals the MDE.'],
            ['Which four inputs determine sample size?', 'Effect size, variance, significance level and desired power.'],
          ],
          prereqs: ['Minimum detectable effect'],
        },
        {
          title: 'Duration, seasonality and ramp-up',
          description: 'Running for whole weeks captures weekday and weekend behaviour, ramping from one percent catches bugs before they hurt many users, and the test must run long enough for the required sample and for slow-acting effects to appear.',
          concepts: ['Full weekly cycles', 'Gradual traffic ramps', 'Time for effects to materialise', 'Holidays and campaign interference'],
          quiz: [
            ['Why run a test for at least one full week?', 'Behaviour differs by day of week; partial weeks bias the sample.'],
            ['What is the purpose of a one percent ramp?', 'To detect crashes or broken flows before exposing most users.'],
          ],
          prereqs: ['Sample size and power'],
        },
      ],
    },
    {
      title: 'Running the Test',
      description: 'Keeping the experiment valid while it is live.',
      topics: [
        {
          title: 'Sample ratio mismatch',
          description: 'When the observed split differs from the intended one by more than chance, something is losing or duplicating users in one arm, such as a redirect bug or bot filtering; a chi-square check on counts catches it and invalidates results until fixed.',
          concepts: ['Chi-square test on arm counts', 'Common causes of mismatch', 'Why results are invalid under SRM', 'Automated SRM alerts'],
          quiz: [
            ['You expected 50/50 and see 50.5/49.5 with a million users. Problem?', 'Yes; with that sample the deviation is far outside chance and signals a bug.'],
            ['Name a common cause of sample ratio mismatch.', 'The treatment page loads slower so more users bounce before exposure is logged.'],
          ],
        },
        {
          title: 'The peeking problem',
          description: 'Checking a fixed-horizon test daily and stopping when it crosses significance multiplies the false positive rate far above five percent; the fix is to pre-commit to the sample size or to use a sequential method designed for repeated looks.',
          concepts: ['Inflated false positives from early stopping', 'Simulating the peeking effect', 'Pre-committed sample sizes', 'Reporting only at the planned end'],
          quiz: [
            ['Why does peeking inflate false positives?', 'Each look is another chance for noise to cross the threshold.'],
            ['What is the right response to a significant result on day two?', 'Keep running to the planned sample size unless a sequential test was planned.'],
          ],
        },
        {
          title: 'Monitoring, instrumentation and kill switches',
          description: 'Live dashboards for guardrails, exposure counts and data completeness catch broken logging or harmful variants early; a kill switch stops the experiment without a deploy, and the incident is recorded so the analysis knows what happened.',
          concepts: ['Exposure and event logging checks', 'Guardrail monitoring in real time', 'Kill switch and rollback', 'Recording incidents for analysis'],
          quiz: [
            ['What should you verify on day one of a test?', 'That exposures and events are logged for both arms at the expected rates.'],
            ['Why record when a kill switch was used?', 'The affected period must be excluded or flagged in the analysis.'],
          ],
          prereqs: ['Sample ratio mismatch'],
        },
      ],
    },
    {
      title: 'Analysing Results',
      description: 'From raw logs to an effect estimate with honest uncertainty.',
      topics: [
        {
          title: 'Two-sample t-test for means',
          description: 'Welch\'s t-test compares mean revenue or time-on-site between arms without assuming equal variances; with tens of thousands of users the central limit theorem makes it robust even for skewed metrics, and the p-value answers how surprising the observed difference is under no effect.',
          concepts: ['Welch versus Student t-test', 'p-values and their meaning', 'Central limit theorem and skewed metrics', 'scipy.stats.ttest_ind'],
          quiz: [
            ['Why prefer Welch\'s t-test by default?', 'It does not assume equal variances in the two arms.'],
            ['What does a p-value of 0.03 mean?', 'If there were no effect, a difference this large or larger would occur 3% of the time.'],
          ],
        },
        {
          title: 'Tests for proportions',
          description: 'Conversion rates are proportions, so the two-proportion z-test or chi-square test of independence applies; the standard error uses the pooled rate under the null, and a small absolute lift on a large base can be significant yet immaterial.',
          concepts: ['Two-proportion z-test', 'Chi-square test of independence', 'Pooled standard error', 'Statistical versus practical significance'],
          quiz: [
            ['Which test compares 4.1% versus 4.3% conversion?', 'A two-proportion z-test, or equivalently a chi-square test on the 2x2 table.'],
            ['Can a result be significant but not worth shipping?', 'Yes, when the lift is real but smaller than the cost of the change.'],
          ],
          prereqs: ['Two-sample t-test for means'],
        },
        {
          title: 'Confidence intervals and effect sizes',
          description: 'A confidence interval for the lift says how large or small the effect plausibly is, which is what a decision needs; reporting relative lift with its interval replaces a bare p-value and shows when a test was underpowered.',
          concepts: ['Interval for a difference in means', 'Relative lift and its interval', 'Interpreting width and sign', 'Intervals over p-values in reports'],
          quiz: [
            ['What does a 95% interval of [-0.2%, +1.4%] tell you?', 'The effect is uncertain and could be zero; the test was likely underpowered.'],
            ['Why report relative lift?', 'Stakeholders compare changes by percentage, and it is comparable across metrics.'],
          ],
          prereqs: ['Two-sample t-test for means'],
        },
        {
          title: 'The delta method for ratio metrics',
          description: 'Metrics like clicks per session or revenue per order are ratios of two per-user sums, so their variance is not a simple sample variance; the delta method approximates it from the variances and covariance of numerator and denominator.',
          concepts: ['Ratio of sums per unit', 'Variance via delta method', 'Covariance of numerator and denominator', 'Implementing in pandas'],
          quiz: [
            ['Why does clicks per session need the delta method?', 'The unit of randomisation is the user, not the session, so session-level variance is wrong.'],
            ['What inputs does the delta method need?', 'Means, variances and covariance of the per-user numerator and denominator.'],
          ],
          prereqs: ['Metric sensitivity and ratio metrics'],
        },
        {
          title: 'Bootstrap and permutation tests',
          description: 'Resampling users with replacement gives intervals for any statistic, including medians and percentiles, and permuting arm labels gives an exact null distribution; both cost compute but avoid formulas that break on unusual metrics.',
          concepts: ['Bootstrap confidence intervals', 'Permutation test on arm labels', 'Statistics without closed-form variance', 'Compute cost and vectorisation'],
          quiz: [
            ['When would you bootstrap instead of using a t-test?', 'For a metric like the 90th percentile of latency, which has no simple variance formula.'],
            ['What does a permutation test assume?', 'That under the null the arm labels are exchangeable.'],
          ],
        },
        {
          title: 'Multiple comparisons',
          description: 'Testing many metrics, segments or variants raises the chance that one is significant by luck; Bonferroni controls the family-wise rate strictly, Benjamini-Hochberg controls the false discovery rate, and the primary metric stays exempt by design.',
          concepts: ['Family-wise error rate', 'Bonferroni correction', 'Benjamini-Hochberg false discovery rate', 'Exploratory versus confirmatory metrics'],
          quiz: [
            ['With 20 metrics at alpha 0.05, how many false positives on average under no effect?', 'About one.'],
            ['What does Benjamini-Hochberg control?', 'The expected proportion of false discoveries among significant results.'],
          ],
          prereqs: ['Tests for proportions'],
        },
      ],
    },
    {
      title: 'Advanced Analysis Methods',
      description: 'Getting more precision, faster decisions and finer effects from the same traffic.',
      topics: [
        {
          title: 'CUPED variance reduction',
          description: 'Using each user\'s pre-experiment metric as a covariate, CUPED subtracts the part of the outcome that was predictable before the test, cutting variance by the squared correlation and often halving the required sample without bias.',
          concepts: ['Pre-period covariate', 'Adjusted metric with theta', 'Variance reduction proportional to correlation', 'Users without pre-period data'],
          quiz: [
            ['What is the CUPED adjusted outcome?', 'Y minus theta times (X minus mean of X), where X is the pre-period metric.'],
            ['Does CUPED bias the treatment effect?', 'No; the covariate is independent of assignment.'],
          ],
          prereqs: ['Confidence intervals and effect sizes'],
        },
        {
          title: 'Regression adjustment and covariates',
          description: 'Regressing the outcome on treatment plus pre-experiment covariates generalises CUPED to many covariates and categorical strata; with interaction terms it stays unbiased and improves precision, and robust standard errors handle heteroscedasticity.',
          concepts: ['OLS with treatment indicator', 'Multiple pre-period covariates', 'Interaction terms for unbiasedness', 'Robust standard errors'],
          quiz: [
            ['Why include only pre-experiment covariates?', 'Post-treatment variables can be affected by treatment and would bias the estimate.'],
            ['How does regression adjustment relate to CUPED?', 'CUPED is regression adjustment with a single continuous covariate.'],
          ],
          prereqs: ['CUPED variance reduction'],
        },
        {
          title: 'Sequential testing',
          description: 'Always-valid methods such as the mixture sequential probability ratio test and group sequential designs let you look at results continuously and stop early while keeping the false positive rate controlled, at the price of somewhat wider intervals.',
          concepts: ['Always-valid p-values', 'Mixture SPRT', 'Group sequential boundaries', 'Cost in interval width'],
          quiz: [
            ['What does a sequential test allow that a fixed-horizon test forbids?', 'Checking and stopping at any time with valid error control.'],
            ['What is the trade-off of sequential methods?', 'Less power at a given sample size, so intervals are wider.'],
          ],
          prereqs: ['The peeking problem'],
        },
        {
          title: 'Bayesian A/B analysis',
          description: 'A Beta-Binomial or normal model yields the posterior probability that treatment beats control and the expected loss of choosing either, which communicates naturally to stakeholders; priors and decision thresholds must be chosen and documented.',
          concepts: ['Beta-Binomial conjugate model', 'Probability of being best', 'Expected loss decision rule', 'Prior choice and sensitivity'],
          quiz: [
            ['What does "probability B beats A is 96%" mean?', 'Under the model and prior, 96% of posterior mass has B\'s rate above A\'s.'],
            ['What is expected loss in a Bayesian test?', 'The average amount you would lose by choosing a variant if it is actually worse.'],
          ],
        },
        {
          title: 'Heterogeneous treatment effects',
          description: 'An average lift can hide a gain for new users and a loss for power users; pre-specified segment analysis, interaction tests and causal forests estimate how the effect varies, while guarding against the multiple comparisons that segment hunting creates.',
          concepts: ['Pre-specified segments', 'Treatment by covariate interactions', 'Causal forests and uplift trees', 'Segment hunting and false discoveries'],
          quiz: [
            ['Why pre-specify segments?', 'Searching segments after the fact finds spurious effects by chance.'],
            ['What does a significant treatment-by-platform interaction mean?', 'The effect differs between platforms.'],
          ],
          prereqs: ['Multiple comparisons'],
        },
        {
          title: 'Multi-armed bandits overview',
          description: 'Bandits shift traffic toward better-performing arms while the experiment runs, trading statistical clarity for less regret; they suit many short-lived variants like headlines, and suit poorly the cases that need an unbiased estimate of every arm.',
          concepts: ['Explore versus exploit', 'Regret as the objective', 'Epsilon-greedy and UCB', 'When bandits beat A/B tests'],
          quiz: [
            ['What is regret in a bandit?', 'The reward lost by not always playing the best arm.'],
            ['Why are bandits poor for measuring a precise lift?', 'Traffic is unbalanced and adaptive, which biases naive estimates.'],
          ],
        },
        {
          title: 'Thompson sampling and contextual bandits',
          description: 'Thompson sampling draws a rate from each arm\'s posterior and plays the winner, balancing exploration automatically; contextual bandits condition the choice on user features, moving from picking one best arm to personalising the choice.',
          concepts: ['Sampling from the posterior per arm', 'Automatic exploration', 'Contextual arms with user features', 'Off-policy evaluation of logged data'],
          quiz: [
            ['How does Thompson sampling choose an arm?', 'It samples a value from each arm\'s posterior and picks the largest.'],
            ['What does a contextual bandit add?', 'The chosen arm depends on features of the current user or request.'],
          ],
          prereqs: ['Multi-armed bandits overview', 'Bayesian A/B analysis'],
        },
      ],
    },
    {
      title: 'Threats to Validity',
      description: 'The ways a correctly analysed test still gives the wrong answer.',
      topics: [
        {
          title: 'Novelty and primacy effects',
          description: 'Users try a new feature because it is new, or resist it because it is unfamiliar, so early lifts fade and early losses recover; comparing effects for new versus returning users and over test weeks reveals whether the effect is settling.',
          concepts: ['Novelty inflating early lift', 'Primacy suppressing early lift', 'New versus returning user comparison', 'Effect trajectories over time'],
          quiz: [
            ['How do you detect a novelty effect?', 'The lift shrinks over successive weeks, or is absent for brand-new users.'],
            ['Why does a primacy effect matter for a redesign?', 'Existing users need time to relearn, so a short test undercounts the long-run effect.'],
          ],
        },
        {
          title: 'Network effects and spillover',
          description: 'When treated users interact with control users, through messaging, sharing or shared content, the control arm is contaminated and the measured difference shrinks; cluster-level randomisation of connected groups limits the spillover.',
          concepts: ['Stable unit treatment value assumption', 'Spillover through social links', 'Cluster randomisation of communities', 'Ego-cluster designs'],
          quiz: [
            ['What does SUTVA require?', 'That one unit\'s outcome does not depend on other units\' treatment.'],
            ['How does cluster randomisation reduce spillover?', 'Connected users get the same variant, so treated and control rarely interact.'],
          ],
        },
        {
          title: 'Interference in marketplaces and switchback tests',
          description: 'In two-sided markets, giving treated users more drivers or discounts takes them from control users, so both arms shift; switchback designs alternate the whole market between variants over time windows and analyse with the time block as the unit.',
          concepts: ['Supply competition between arms', 'Switchback time windows', 'Carryover between windows', 'Analysing with blocks as units'],
          quiz: [
            ['Why does a delivery-time test with user randomisation mislead?', 'Treated orders take couriers away from control orders, so control looks worse than it would at launch.'],
            ['What is the analysis unit in a switchback test?', 'The time window in which the whole market was in one variant.'],
          ],
          prereqs: ['Network effects and spillover'],
        },
        {
          title: 'Cluster-randomised analysis',
          description: 'When assignment happens by city, store or community, observations within a cluster are correlated and the effective sample size is the number of clusters; cluster-robust standard errors or aggregating to the cluster level keep the inference honest.',
          concepts: ['Intra-cluster correlation', 'Effective sample size', 'Cluster-robust standard errors', 'Power with few clusters'],
          quiz: [
            ['Why is a ten-city test underpowered despite millions of users?', 'The effective sample is ten clusters, and city-level variation dominates.'],
            ['What goes wrong if you ignore clustering?', 'Standard errors are too small and false positives inflate.'],
          ],
          prereqs: ['Network effects and spillover'],
        },
        {
          title: 'Segment mix shifts and Simpson\'s paradox',
          description: 'A treatment that changes who reaches a page changes the mix of users measured there, so a per-page metric can improve in every segment yet fall overall; analysing at the randomisation unit and checking segment shares prevents the paradox.',
          concepts: ['Simpson\'s paradox in experiments', 'Treatment changing the population', 'Analysing at the assignment unit', 'Checking segment shares'],
          quiz: [
            ['What causes Simpson\'s paradox in a funnel metric?', 'The treatment changes the mix of users reaching the step being measured.'],
            ['How do you avoid it?', 'Measure at the randomisation unit, including users who never reached the step.'],
          ],
          prereqs: ['Randomisation units'],
        },
      ],
    },
    {
      title: 'Causal Inference Without Randomisation',
      description: 'Estimating effects from observational data when a test is impossible.',
      topics: [
        {
          title: 'Difference-in-differences',
          description: 'When a change hits one region or group at a known time, comparing its before-after change to that of an untouched group removes shared trends; the parallel trends assumption is checked on pre-period data and the estimate comes from a two-way regression.',
          concepts: ['Parallel trends assumption', 'Two-way fixed effects regression', 'Pre-trend checks', 'Staggered adoption pitfalls'],
          quiz: [
            ['What does diff-in-diff assume?', 'That without treatment the groups would have followed parallel trends.'],
            ['How do you check parallel trends?', 'Plot both groups over the pre-period and test whether their trends differ.'],
          ],
        },
        {
          title: 'Synthetic control',
          description: 'With a single treated unit such as one country, a weighted combination of untreated units that matched it before the change serves as the counterfactual, and the gap after the change is the effect, with placebo tests providing inference.',
          concepts: ['Weighted donor pool', 'Pre-period fit quality', 'Placebo in-space tests', 'Single treated unit setting'],
          quiz: [
            ['When is synthetic control preferred over diff-in-diff?', 'When there is one treated unit and no single control matches its trend.'],
            ['How is uncertainty assessed in synthetic control?', 'By running placebo tests on untreated units and comparing gaps.'],
          ],
          prereqs: ['Difference-in-differences'],
        },
        {
          title: 'Propensity scores and matching',
          description: 'Modelling the probability of treatment from observed covariates lets you match or weight treated and untreated units so they compare like with like; it removes bias from measured confounders only, and overlap must be checked before trusting the estimate.',
          concepts: ['Estimating the propensity score', 'Matching and inverse probability weighting', 'Checking overlap and balance', 'Unmeasured confounding remains'],
          quiz: [
            ['What does propensity matching adjust for?', 'Observed confounders only; hidden ones still bias the result.'],
            ['What is the overlap assumption?', 'Every unit has a non-zero probability of being in either group.'],
          ],
          prereqs: ['Potential outcomes and treatment effects'],
        },
        {
          title: 'Uplift modelling',
          description: 'Instead of predicting who converts, uplift models predict who converts because of the treatment, using experiment data with treatment as a feature or two-model and class-transformation approaches; they target campaigns at persuadables, not sure things.',
          concepts: ['Persuadables versus sure things', 'Two-model approach', 'Class transformation and uplift trees', 'Qini curves for evaluation'],
          quiz: [
            ['Why not target a campaign at users most likely to convert?', 'Many would convert anyway; the goal is users whose behaviour the treatment changes.'],
            ['How is an uplift model evaluated?', 'With a Qini or uplift curve on held-out experiment data.'],
          ],
          prereqs: ['Heterogeneous treatment effects'],
        },
        {
          title: 'Instrumental variables and regression discontinuity',
          description: 'An instrument that shifts treatment but affects the outcome only through it, such as random encouragement, identifies a local effect; regression discontinuity uses a threshold rule, like a score cutoff, and compares units just either side of it.',
          concepts: ['Instrument relevance and exclusion', 'Encouragement designs', 'Cutoff rules and local effects', 'Bandwidth choice at the threshold'],
          quiz: [
            ['What makes a valid instrument?', 'It affects treatment and influences the outcome only through treatment.'],
            ['What does regression discontinuity estimate?', 'The effect for units near the cutoff.'],
          ],
          prereqs: ['Propensity scores and matching'],
        },
      ],
    },
    {
      title: 'Platforms, Reporting and Decisions',
      description: 'Turning a valid result into an organisational decision, repeatedly.',
      topics: [
        {
          title: 'Experiment platforms',
          description: 'A platform standardises assignment, exposure logging, metric definitions, SRM and guardrail checks and result computation, so hundreds of tests run consistently; understanding its components helps you trust, extend or debug one.',
          concepts: ['Assignment service and feature flags', 'Metric definitions as code', 'Automated checks pipeline', 'Open-source and vendor options'],
          quiz: [
            ['Why define metrics centrally?', 'So every experiment computes conversion the same way and results are comparable.'],
            ['What separates a feature flag system from an experiment platform?', 'The platform adds exposure logging, statistics and standardised analysis.'],
          ],
        },
        {
          title: 'Reporting results',
          description: 'A good readout states the hypothesis, the population and dates, the primary metric with its interval, guardrails, checks passed, segments examined and a recommendation; it separates confirmatory from exploratory findings and records what was learned.',
          concepts: ['Structure of a readout', 'Lift with interval, not just p', 'Confirmatory versus exploratory sections', 'Recommendation and next steps'],
          quiz: [
            ['What must a readout include beyond the lift?', 'The confidence interval, guardrail results and validity checks.'],
            ['How should an exploratory segment finding be labelled?', 'As a hypothesis for a follow-up test, not as a result.'],
          ],
          prereqs: ['Confidence intervals and effect sizes', 'Guardrail metrics'],
        },
        {
          title: 'Launch decisions and decision rules',
          description: 'Agreeing before the test what combination of primary, guardrail and cost outcomes leads to ship, iterate or abandon removes politics from the readout; flat results are a decision too, and a small significant loss may still ship for strategic reasons if documented.',
          concepts: ['Pre-agreed decision matrix', 'Handling flat results', 'Shipping despite a metric loss', 'Cost of the change'],
          quiz: [
            ['What should happen with a flat primary metric and no guardrail loss?', 'Decide based on cost and strategy, as the test found no evidence either way.'],
            ['Why agree decision rules before the test?', 'To avoid rationalising any result into a launch after the fact.'],
          ],
          prereqs: ['Reporting results'],
        },
        {
          title: 'Institutional memory and meta-analysis',
          description: 'Storing every experiment with its hypothesis and result lets a team learn which kinds of changes work, calibrate expected effect sizes, estimate the false discovery rate across tests and avoid rerunning the same idea.',
          concepts: ['Experiment repository', 'Distribution of historical effects', 'Empirical false discovery rate', 'Priors from past experiments'],
          quiz: [
            ['What does a low historical win rate imply for a new significant result?', 'A higher chance it is a false positive, so require stronger evidence.'],
            ['Why keep failed experiments in the repository?', 'They prevent repeats and calibrate expectations.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: end-to-end A/B test analysis',
          description: 'From raw exposure and event logs, build the analysis: SRM check, per-user metrics, Welch t-test and proportions tests, confidence intervals, delta-method ratio metric, guardrails and a written readout with a recommendation.',
          concepts: ['Validate assignment and exposures', 'Build per-user metrics', 'Compute tests and intervals', 'Write the readout'],
          quiz: [
            ['What is the first check before any statistics?', 'Sample ratio mismatch on exposure counts.'],
            ['Why aggregate events to the user before testing?', 'The user is the randomisation unit, so observations must be per user.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: power and peeking simulator',
          description: 'Write a simulation that generates A/A and A/B data under chosen effect sizes, measures power for a sample size calculator, and demonstrates the inflated false positive rate from daily peeking versus a sequential test.',
          concepts: ['Simulate outcomes under a null and alternative', 'Estimate power by repetition', 'Show peeking inflation', 'Compare a sequential rule'],
          quiz: [
            ['How do you estimate power by simulation?', 'Generate many experiments with the true effect and count how often the test is significant.'],
            ['What false positive rate does daily peeking over four weeks produce roughly?', 'Well above 5%, often 20% or more.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CUPED and regression adjustment study',
          description: 'On a dataset with pre-period metrics, implement CUPED and a covariate regression, measure the variance reduction, translate it into saved sample size, and show the estimates stay unbiased on an A/A split.',
          concepts: ['Compute theta from pre-period data', 'Apply the adjustment', 'Measure variance reduction', 'Verify no bias on A/A data'],
          quiz: [
            ['How do you turn variance reduction into saved runtime?', 'Required sample size scales with variance, so a 40% reduction saves 40% of the sample.'],
            ['What pre-period length should you use?', 'Long enough to correlate strongly with the outcome, typically the same length as the test.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: marketing campaign impact with diff-in-diff',
          description: 'Estimate the effect of a regional campaign that could not be randomised: build a control region set, check pre-trends, fit a two-way fixed effects model, run placebo tests and report the effect with its assumptions stated.',
          concepts: ['Select and justify control regions', 'Check parallel pre-trends', 'Fit the diff-in-diff model', 'Placebo tests and reporting'],
          quiz: [
            ['What would make you distrust the diff-in-diff estimate?', 'Diverging pre-trends between treated and control regions.'],
            ['What is a placebo-in-time test?', 'Pretending the campaign started earlier and checking that no effect appears.'],
          ],
          style: 'project',
        },
        {
          title: 'Experimentation interview questions',
          description: 'The case questions asked in product data science interviews: design a test for a checkout change, pick metrics and guardrails, size the sample, explain what to do with a flat result, and handle a two-sided marketplace.',
          concepts: ['Test design case questions', 'Metric selection questions', 'Interpreting results aloud', 'Marketplace and interference cases'],
          quiz: [
            ['The test is flat after two weeks. What do you do?', 'Check power against the MDE, check SRM and instrumentation, then decide on cost and strategy rather than extending indefinitely.'],
            ['How would you test a new ride-pricing algorithm?', 'With a switchback design by city and time window, because rider-level randomisation interferes through shared driver supply.'],
          ],
          style: 'reading',
        },
        {
          title: 'Statistics drills for experiment interviews',
          description: 'Short numeric drills: compute a sample size from an MDE and baseline rate, a two-proportion z statistic by hand, a confidence interval for lift, and explain a p-value and Type I and II errors in plain language under time pressure.',
          concepts: ['Sample size arithmetic', 'z statistic by hand', 'Explaining p-values plainly', 'Type I and II error scenarios'],
          quiz: [
            ['Baseline 10%, MDE 1 point absolute, 80% power, alpha 0.05: roughly how many per arm?', 'About 14,700 per arm.'],
            ['Explain a Type II error in one sentence.', 'Failing to detect an effect that is really there.'],
          ],
        },
      ],
    },
  ],
})
