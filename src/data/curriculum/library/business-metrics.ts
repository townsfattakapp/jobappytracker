import { defineTrack } from '../define'

export const businessMetrics = defineTrack({
  id: 'track-business-metrics',
  title: 'Business Metrics and KPIs',
  description: 'How to design, define, compute and review the numbers a business runs on: leading and lagging indicators, north-star metrics and metric trees, revenue, growth, retention, LTV and CAC, unit economics, operational KPIs, metric dictionaries, the classic pitfalls, and KPI reviews that lead to decisions.',
  family: 'Data Analytics & BI',
  kind: 'domain',
  icon: '📈',
  tags: ['kpi', 'metrics', 'business analytics', 'unit economics', 'retention', 'churn', 'ltv', 'cac', 'reporting'],
  languages: ['SQL'],
  explainMode: 'tool',
  code: { label: 'SQL or spreadsheet formulas, whichever fits', id: 'sql', fixed: true },
  supports: { project: true },
  prerequisites: ['track-sql'],
  style: 'practice',
  categories: [
    {
      title: 'Metric Design Foundations',
      description: 'What separates a useful metric from a number on a slide.',
      topics: [
        {
          title: 'Measures, metrics and KPIs',
          description: 'A measure is a raw count or sum, a metric puts it in context (per user, per month, as a rate), and a KPI is a metric someone is accountable for. Keeping the three apart stops every number on a dashboard from being called a KPI.',
          concepts: ['Measures versus metrics', 'What makes a metric a KPI', 'Accountability and owners', 'How many KPIs a team can hold'],
          quiz: [
            ['Is "orders placed" a measure or a metric?', 'A measure; "orders per active customer per month" is a metric.'],
            ['What turns a metric into a KPI?', 'A target and a named owner accountable for moving it.'],
            ['Why limit a team to a handful of KPIs?', 'Attention is finite; too many KPIs means none is actually managed.'],
          ],
        },
        {
          title: 'Leading versus lagging indicators',
          description: 'Lagging indicators (revenue, churn) confirm what already happened; leading indicators (trial sign-ups, usage depth) move earlier and predict them. Pairing each lagging KPI with leading drivers is what lets a team act before the quarter closes.',
          concepts: ['Lagging indicators confirm outcomes', 'Leading indicators predict outcomes', 'Finding leading indicators with lagged correlation', 'Pairing each KPI with its drivers'],
          quiz: [
            ['Is quarterly revenue leading or lagging?', 'Lagging; it reports an outcome after the fact.'],
            ['Give a leading indicator of churn.', 'A drop in weekly logins or feature usage in the weeks before renewal.'],
            ['How do you test whether a candidate leads a KPI?', 'Shift it forward by k periods and check whether it correlates with the later KPI.'],
          ],
        },
        {
          title: 'Input versus output metrics',
          description: 'Output metrics (revenue, retention) are what the business wants but nobody can move directly; input metrics (calls made, pages shipped, delivery time) are the controllable levers. Teams should be judged on outputs but managed with inputs.',
          concepts: ['Outputs are results, inputs are levers', 'Controllability test', 'Amazon-style input metric flywheel', 'Balancing input targets against outcomes'],
          quiz: [
            ['Why set team goals on input metrics?', 'Inputs are directly controllable and give fast feedback; outputs move late and depend on many teams.'],
            ['What goes wrong with input-only goals?', 'Teams hit the input (more calls) without the output moving, so keep both in view.'],
          ],
          prereqs: ['Leading versus lagging indicators'],
        },
        {
          title: 'Counts, rates, ratios and averages',
          description: 'The four shapes a metric takes and how each misleads: counts grow with the business, rates need a clear denominator, ratios hide both terms, and averages hide distributions. Choosing the shape is the first design decision.',
          concepts: ['Counts scale with size', 'Rates and their denominators', 'Ratios that hide both terms', 'Medians and percentiles instead of means'],
          quiz: [
            ['What is wrong with reporting only total support tickets?', 'It grows with the customer base; tickets per 1,000 customers is comparable over time.'],
            ['When does a ratio like revenue per employee mislead?', 'When headcount and revenue both moved; the ratio hides which one changed.'],
          ],
        },
      ],
    },
    {
      title: 'North-Star Metrics and Metric Trees',
      description: 'One number that captures value delivered, and the tree of drivers underneath it.',
      topics: [
        {
          title: 'Choosing a north-star metric',
          description: 'A north-star metric measures the value customers get, leads revenue, and can be moved by the teams that own it: nights booked for Airbnb, weekly active teams for Slack. Picking the wrong one (revenue, sign-ups) optimises the company for the wrong behaviour.',
          concepts: ['Value exchange, not revenue', 'Criteria for a good north star', 'North-star examples by business model', 'Common bad choices'],
          quiz: [
            ['Why is revenue usually a poor north-star metric?', 'It lags customer value and can rise while the product gets worse (price increases, dark patterns).'],
            ['What is a plausible north star for a marketplace?', 'Completed transactions or GMV from repeat buyers, which capture value on both sides.'],
            ['Should a north star be a rate or a count?', 'Usually a count of value events so growth and depth both move it.'],
          ],
          prereqs: ['Measures, metrics and KPIs'],
        },
        {
          title: 'Building a metric tree',
          description: 'Decompose the north star into multiplicative or additive drivers (active users x sessions per user x conversion x order value) until each leaf is owned by a team. The tree makes trade-offs explicit and turns "grow revenue" into concrete levers.',
          concepts: ['Additive versus multiplicative decomposition', 'Stopping at ownable leaves', 'Mapping leaves to teams', 'Checking the tree reconciles'],
          quiz: [
            ['Decompose e-commerce revenue multiplicatively.', 'Visitors x conversion rate x average order value.'],
            ['When is an additive split better?', 'When segments are independent, such as revenue by region or by product line.'],
            ['Why must the tree reconcile?', 'If the leaves do not multiply or sum back to the top, the driver analysis will assign changes to the wrong branch.'],
          ],
          prereqs: ['Choosing a north-star metric'],
        },
        {
          title: 'Driver analysis: explaining a change',
          description: 'When a KPI moves, attribute the change to its drivers: hold each driver at its previous value and measure the effect of moving one at a time, then reconcile the residual interaction term. This is the SQL or spreadsheet workhorse behind "why did revenue drop 8%?".',
          concepts: ['One-driver-at-a-time attribution', 'Interaction residuals', 'Segment contribution to change', 'Presenting a bridge or waterfall'],
          quiz: [
            ['Revenue = users x ARPU. Users fell 5%, ARPU rose 3%. What happened to revenue?', 'About -2.2%: 0.95 x 1.03 = 0.9785.'],
            ['What is the interaction term in a two-driver bridge?', 'The part of the change caused by both drivers moving together, not attributable to either alone.'],
          ],
          prereqs: ['Building a metric tree'],
        },
        {
          title: 'Guardrail and counter-metrics',
          description: 'Every metric a team pushes can be gamed or can damage something else, so pair it with a guardrail that must not degrade: conversion rate with refund rate, support speed with resolution quality. Guardrails are how you keep a target from becoming a trap.',
          concepts: ['Why single metrics get gamed', 'Choosing a counter-metric', 'Guardrail thresholds', 'Guardrails in experiments and OKRs'],
          quiz: [
            ['Give a counter-metric for "emails sent per rep".', 'Reply rate or unsubscribe rate, so volume is not rewarded at the cost of quality.'],
            ['What is a guardrail threshold?', 'A level a secondary metric must stay above or below for the primary metric win to count.'],
          ],
        },
      ],
    },
    {
      title: 'Revenue and Growth Metrics',
      description: 'The recurring, transactional and growth numbers every finance and leadership team asks for.',
      topics: [
        {
          title: 'MRR and ARR',
          description: 'Monthly and annual recurring revenue normalise subscription contracts to a run rate: a $1,200 annual plan is $100 MRR. MRR excludes one-off fees and usage that does not recur, and its month-over-month change is the heartbeat of a subscription business.',
          concepts: ['Normalising contracts to monthly run rate', 'What is excluded from MRR', 'Computing MRR from a subscriptions table', 'ARR versus GAAP revenue'],
          quiz: [
            ['A customer pays $3,600 per year. What is their MRR?', '$300.'],
            ['Is a one-time setup fee part of MRR?', 'No, only recurring subscription value counts.'],
            ['Is ARR the same as annual revenue?', 'No; ARR is a forward run rate, revenue is what was recognised in the period.'],
          ],
        },
        {
          title: 'MRR movements: new, expansion, contraction and churn',
          description: 'MRR at month end equals last month plus new, plus expansion, minus contraction, minus churned, plus reactivation. Splitting the delta this way shows whether growth comes from new logos or from existing customers, and which bucket is leaking.',
          concepts: ['The MRR bridge identity', 'Classifying each customer month', 'Reactivation handling', 'Quick ratio of growth to loss'],
          quiz: [
            ['MRR went 100k to 108k with 15k new and 4k expansion. What was lost?', '11k in contraction plus churn.'],
            ['What is the SaaS quick ratio?', '(new + expansion) / (contraction + churn); above 4 is considered healthy.'],
          ],
          prereqs: ['MRR and ARR'],
        },
        {
          title: 'ARPU, ARPA and average selling price',
          description: 'Average revenue per user (or per account) divides revenue by the count of active payers in the period; average selling price divides new bookings by new deals. Each needs a precise denominator, and each is a mean that segments or medians often explain better.',
          concepts: ['ARPU denominator choices', 'ARPA for account-based businesses', 'ASP for new deals', 'Segmenting ARPU by plan and region'],
          quiz: [
            ['Why can ARPU rise while the business is shrinking?', 'Low-value users churn first, so the average of those remaining goes up.'],
            ['Should free users be in the ARPU denominator?', 'Only if the metric is defined as revenue per active user; state it explicitly either way.'],
          ],
          prereqs: ['Counts, rates, ratios and averages'],
        },
        {
          title: 'GMV, take rate and net revenue',
          description: 'Marketplaces and payment businesses report gross merchandise value (total transaction value) and the take rate (their share of it). Net revenue is what the company keeps, and confusing GMV with revenue overstates a business by an order of magnitude.',
          concepts: ['GMV definition and what it includes', 'Take rate and its drivers', 'Gross versus net revenue', 'Refunds, cancellations and GMV'],
          quiz: [
            ['GMV is $50M and take rate is 12%. What is revenue?', '$6M.'],
            ['Should cancelled orders be in GMV?', 'Define it; most report GMV net of cancellations and note refunds separately.'],
          ],
        },
        {
          title: 'Growth rates: MoM, YoY and compounding',
          description: 'Month-over-month growth is noisy and seasonal, year-over-year removes seasonality but lags, and compound monthly growth rate summarises a period. Reporting the right one, and the base it is computed from, keeps growth claims honest.',
          concepts: ['MoM and its noise', 'YoY to remove seasonality', 'CMGR over a period', 'Small-base and percentage-point traps'],
          quiz: [
            ['Revenue went from 100 to 150 over 12 months. What is the CMGR?', '(1.5)^(1/12) - 1, about 3.4% per month.'],
            ['Conversion went from 2% to 3%. Is that 1% or 50% growth?', 'One percentage point, which is 50% relative growth; say which.'],
          ],
        },
      ],
    },
    {
      title: 'Retention, Churn and Engagement',
      description: 'Whether customers stay, and how deeply they use what they bought.',
      topics: [
        {
          title: 'Customer churn and logo churn',
          description: 'Churn rate is customers lost in a period divided by customers at the start of it. The denominator, the treatment of customers who joined mid-period, and the period length all change the number, so churn is only comparable when its definition is fixed.',
          concepts: ['Start-of-period denominator', 'Handling mid-period joiners', 'Monthly versus annual churn conversion', 'Voluntary versus involuntary churn'],
          quiz: [
            ['Monthly churn is 3%. What is annual churn?', '1 - 0.97^12, about 30.6%, not 36%.'],
            ['What is involuntary churn?', 'Loss from failed payments or expired cards rather than a decision to leave.'],
          ],
        },
        {
          title: 'Revenue churn and net revenue retention',
          description: 'Gross revenue retention measures how much of a cohort\'s starting MRR survives without counting upsell; net revenue retention adds expansion and can exceed 100%. NRR above 100% means the existing base grows on its own, which is why investors watch it.',
          concepts: ['Gross revenue retention', 'Net revenue retention formula', 'Why NRR can exceed 100%', 'Cohort window for retention'],
          quiz: [
            ['A cohort started at $100k MRR; a year later it is $95k after $20k expansion. What are GRR and NRR?', 'GRR 75%, NRR 95%.'],
            ['Can GRR exceed 100%?', 'No, it caps at 100% because expansion is excluded.'],
          ],
          prereqs: ['MRR movements: new, expansion, contraction and churn'],
        },
        {
          title: 'Cohort retention curves',
          description: 'Group customers by their start month and track the share still active at month 1, 2, 3 and beyond. A curve that flattens shows a retained core; one that keeps sliding means the product leaks. Comparing cohorts shows whether retention improves for newer users.',
          concepts: ['Building a cohort table in SQL', 'Reading a flattening curve', 'Triangle charts and diagonal reading', 'Comparing cohorts over time'],
          quiz: [
            ['Why are recent cohorts incomplete in a retention triangle?', 'They have not lived long enough to reach later months, so later cells are empty.'],
            ['What does a curve flattening at 40% mean?', 'About 40% of a cohort becomes long-term retained; effort should go to raising the plateau or the early drop.'],
          ],
          prereqs: ['Customer churn and logo churn'],
        },
        {
          title: 'Active users: DAU, WAU, MAU and stickiness',
          description: 'Active-user metrics count distinct users who did a qualifying action in a window; the qualifying action decides everything. DAU/MAU (stickiness) shows how many days a month typical users show up, and is a better health signal than MAU alone.',
          concepts: ['Defining the qualifying action', 'Distinct counting across windows', 'DAU/MAU stickiness', 'Rolling versus calendar windows'],
          quiz: [
            ['DAU 200k, MAU 1M. What is stickiness and what does it mean?', '20%; an average user is active about 6 days a month.'],
            ['Why not count a page view as active?', 'It inflates MAU with users who got no value; use an action tied to the core use case.'],
          ],
        },
      ],
    },
    {
      title: 'Customer Economics',
      description: 'What a customer costs to win, what they are worth, and whether the maths works.',
      topics: [
        {
          title: 'Customer acquisition cost',
          description: 'CAC is sales and marketing spend divided by new customers acquired in the same window. Whether it includes salaries, tooling and brand spend, and whether organic customers are in the denominator, changes CAC by multiples, so the definition must be written down.',
          concepts: ['Fully loaded versus paid CAC', 'Matching spend window to acquisition window', 'Blended versus channel CAC', 'Organic customers in the denominator'],
          quiz: [
            ['Spend $120k, 300 new customers. What is CAC?', '$400.'],
            ['Why does blended CAC hide problems?', 'Cheap organic customers mask an expensive paid channel; report channel CAC too.'],
          ],
        },
        {
          title: 'Customer lifetime value',
          description: 'LTV estimates the gross profit a customer generates over their lifetime: ARPU x gross margin / churn rate in the simple model, or the sum of a cohort\'s margin curve for something more honest. Its assumptions (constant churn, infinite horizon) are where most LTV numbers go wrong.',
          concepts: ['Simple LTV from ARPU, margin and churn', 'Cohort-based LTV curves', 'Capping the horizon', 'Discounting future margin'],
          quiz: [
            ['ARPU $50/month, gross margin 80%, monthly churn 4%. Simple LTV?', '$50 x 0.8 / 0.04 = $1,000.'],
            ['Why cap LTV at 3 or 5 years?', 'Constant churn implies some customers live forever; a cap keeps the estimate defensible.'],
          ],
          prereqs: ['Customer churn and logo churn'],
        },
        {
          title: 'LTV:CAC and payback period',
          description: 'LTV:CAC compares value created with cost to acquire (3:1 is the conventional benchmark); CAC payback is the months of contribution margin needed to recover CAC. Payback matters more for cash-constrained businesses because it says when the money comes back.',
          concepts: ['LTV:CAC ratio and benchmarks', 'CAC payback in months', 'Payback by channel and segment', 'Why payback beats LTV:CAC for cash'],
          quiz: [
            ['CAC $600, monthly contribution margin $40. Payback?', '15 months.'],
            ['Is a 5:1 LTV:CAC always good?', 'Not necessarily; it may mean under-investing in growth, and it depends on the LTV assumptions.'],
          ],
          prereqs: ['Customer acquisition cost', 'Customer lifetime value'],
        },
        {
          title: 'Contribution margin and unit economics',
          description: 'Unit economics asks whether one unit (an order, a ride, a subscriber) makes money after its variable costs: price minus COGS, payment fees, delivery, support. A business with negative contribution margin loses more as it grows, whatever the top line says.',
          concepts: ['Choosing the unit', 'Variable costs per unit', 'Contribution margin per unit', 'Scaling with negative unit economics'],
          quiz: [
            ['Order value $30, goods $18, delivery $6, fees $1. Contribution?', '$5, about 17%.'],
            ['Why exclude fixed costs from contribution margin?', 'They do not change per unit; contribution shows what each extra unit adds toward covering them.'],
          ],
        },
      ],
    },
    {
      title: 'Operational Metrics',
      description: 'The KPIs of teams that ship, serve, stock and sell.',
      topics: [
        {
          title: 'Throughput, cycle time and lead time',
          description: 'Throughput is units completed per period, cycle time is how long each takes from start to done, and lead time adds queueing before work starts. Little\'s law links them (WIP = throughput x cycle time), which is why cutting work in progress speeds delivery.',
          concepts: ['Throughput per period', 'Cycle time versus lead time', 'Little\'s law', 'Percentile cycle times over averages'],
          quiz: [
            ['A team finishes 20 tickets a week with 60 in progress. Average cycle time?', '3 weeks, by Little\'s law.'],
            ['Why report the 85th percentile cycle time?', 'It tells stakeholders a delivery date most work will meet, unlike a mean skewed by outliers.'],
          ],
        },
        {
          title: 'Service metrics: SLA, resolution time, CSAT and NPS',
          description: 'Support and service teams track first response time, resolution time against an SLA, ticket backlog, CSAT after each interaction and NPS across the base. Each has a known distortion: NPS depends on who answers, CSAT on when it is asked.',
          concepts: ['SLA attainment rate', 'First response and resolution time', 'CSAT survey design and bias', 'NPS calculation and its critics'],
          quiz: [
            ['How is NPS computed?', 'Percent promoters (9-10) minus percent detractors (0-6), ignoring passives (7-8).'],
            ['What is SLA attainment?', 'Share of tickets resolved or answered within the promised time.'],
          ],
        },
        {
          title: 'Inventory and supply metrics',
          description: 'Inventory turnover, days of inventory, stock-out rate and fill rate show whether stock is working or sitting. Turnover that is too high means lost sales from stock-outs; too low means cash tied up and write-offs, so the pair must be read together.',
          concepts: ['Inventory turnover and days on hand', 'Fill rate and stock-out rate', 'Sell-through by SKU', 'Ageing stock and write-off risk'],
          quiz: [
            ['COGS $1.2M a year, average inventory $200k. Turnover?', '6 times a year, about 61 days on hand.'],
            ['What is fill rate?', 'Share of demand (orders or lines) fulfilled immediately from stock.'],
          ],
        },
        {
          title: 'Sales pipeline metrics',
          description: 'Pipeline coverage, stage conversion rates, win rate, average deal size and sales cycle length together forecast bookings: pipeline x win rate / cycle length is the velocity of revenue. Analysts keep these honest by fixing stage definitions and snapshotting the pipeline.',
          concepts: ['Stage conversion rates', 'Win rate and deal size', 'Sales velocity formula', 'Pipeline snapshots for history'],
          quiz: [
            ['Why snapshot the CRM pipeline daily?', 'CRM records are overwritten, so without snapshots you cannot reconstruct stage history or conversion.'],
            ['What is 3x pipeline coverage?', 'Open pipeline worth three times the quota for the period.'],
          ],
        },
      ],
    },
    {
      title: 'Defining Metrics Precisely',
      description: 'Turning a metric name into a definition two analysts would compute identically.',
      topics: [
        {
          title: 'Writing a metric definition',
          description: 'A usable definition states the numerator, denominator, grain, filters, time window, source tables and known exclusions, plus the SQL that computes it. "Active users" without those is a debate waiting to happen every time two dashboards disagree.',
          concepts: ['Numerator and denominator statements', 'Source tables and filters', 'Reference SQL as the definition', 'Worked example values'],
          quiz: [
            ['What must a definition of "conversion rate" include?', 'Which event counts as conversion, who is in the denominator, the window, and exclusions such as test users.'],
            ['Why include a worked example?', 'A concrete number for a known month lets anyone verify their implementation.'],
          ],
        },
        {
          title: 'Grain, filters and time windows',
          description: 'The same metric changes with grain (per user, per account, per order), with filters (test accounts, internal users, refunds) and with the window (calendar month, trailing 28 days). Naming these explicitly is how a "monthly active users" number becomes reproducible.',
          concepts: ['Choosing the grain', 'Standard exclusions', 'Calendar versus trailing windows', 'Time zone and cut-off rules'],
          quiz: [
            ['Why prefer a trailing 28-day window over calendar months for activity?', 'It removes month-length differences and weekday mix.'],
            ['What is the most common cause of two MAU numbers disagreeing?', 'Different time zones or cut-offs on the day boundary, or different exclusions.'],
          ],
          prereqs: ['Writing a metric definition'],
        },
        {
          title: 'Metric dictionaries and ownership',
          description: 'A metric dictionary (or semantic layer) is the single catalogue of definitions, owners, source queries and dashboards using each metric. It is the reference that ends "which number is right?" arguments and the place a new analyst learns the business.',
          concepts: ['Dictionary fields and templates', 'Owners and reviewers', 'Semantic layers and metric stores', 'Linking metrics to dashboards'],
          quiz: [
            ['Who should own a metric definition?', 'A named business owner for meaning and an analyst owner for the implementation.'],
            ['What does a semantic layer add over a wiki?', 'The definition is executable, so every tool computes the metric the same way.'],
          ],
          prereqs: ['Writing a metric definition'],
        },
        {
          title: 'Versioning and changing a metric',
          description: 'Definitions change when the product or data changes; without versioning, history silently breaks. Treat a change like a release: new version, restated history where possible, an annotation on every chart, and a note on which reports moved.',
          concepts: ['When to version versus fix', 'Restating history', 'Annotating charts at the change', 'Communicating the change'],
          quiz: [
            ['You exclude internal users from MAU starting today. What must happen?', 'Restate past months with the same rule, or annotate the break and report both for a while.'],
            ['Why keep the old definition available?', 'Board decks and targets were set on it; comparisons need the same basis.'],
          ],
          prereqs: ['Metric dictionaries and ownership'],
        },
      ],
    },
    {
      title: 'Metric Pitfalls and Judgement',
      description: 'The ways a correct calculation still gives the wrong answer.',
      topics: [
        {
          title: 'The trouble with averages',
          description: 'Means are pulled by outliers and hide bimodal populations: an average session of 8 minutes may be mostly 30-second bounces and a few hour-long users. Medians, percentiles and histograms describe what typical customers actually do.',
          concepts: ['Skew and outliers in means', 'Bimodal populations', 'Percentiles for skewed metrics', 'Showing the distribution'],
          quiz: [
            ['When is the mean the right choice?', 'When the total matters (revenue per user x users = revenue) or the distribution is roughly symmetric.'],
            ['Average order value rose after a change. What should you check first?', 'Whether a few large orders moved the mean; compare the median and the distribution.'],
          ],
          prereqs: ['Counts, rates, ratios and averages'],
        },
        {
          title: 'Vanity metrics',
          description: 'Cumulative sign-ups, page views and app downloads go up and to the right regardless of health, so they flatter without informing. Actionable metrics are comparable, rate-based, tied to a decision, and can go down when something is wrong.',
          concepts: ['Cumulative charts that only rise', 'Actionable versus vanity tests', 'Replacing counts with rates', 'Pairing reach with depth'],
          quiz: [
            ['Why is "total registered users" a vanity metric?', 'It never decreases and says nothing about who is active or paying.'],
            ['What would you report instead of app downloads?', 'Day-7 retained installs or weekly active users.'],
          ],
        },
        {
          title: 'Simpson\'s paradox and mix shifts',
          description: 'An aggregate can move opposite to every segment when the mix changes: conversion falls overall while rising in each channel because a low-converting channel grew. Always check the mix before explaining a change in a blended rate.',
          concepts: ['Simpson\'s paradox with a worked example', 'Detecting mix shifts', 'Mix-adjusted comparison', 'Reporting segment and blended rates'],
          quiz: [
            ['Conversion rose in mobile and desktop but fell overall. How?', 'Mobile, the lower-converting segment, became a bigger share of traffic.'],
            ['How do you compare two periods without mix effects?', 'Weight each period\'s segment rates by a fixed mix.'],
          ],
        },
        {
          title: 'Goodhart\'s law and gaming',
          description: 'When a measure becomes a target it stops being a good measure: call centres hit handle-time targets by hanging up, sales hits bookings with discounts that never renew. Anticipate the gaming path for every KPI and add the guardrail that closes it.',
          concepts: ['Goodhart\'s law in practice', 'Predicting the gaming path', 'Guardrails that close the loophole', 'Auditing for gamed data'],
          quiz: [
            ['A team is targeted on tickets closed per day. What do you expect?', 'Premature closes and reopens; add reopen rate as a guardrail.'],
            ['What is one signal of a gamed metric?', 'A sharp improvement with no change in the drivers beneath it.'],
          ],
          prereqs: ['Guardrail and counter-metrics'],
        },
        {
          title: 'Seasonality, denominators and small numbers',
          description: 'Weekly, monthly and annual cycles, holidays and month lengths create moves that look like trends; rates on tiny denominators swing wildly. Comparing like with like (YoY, same-weekday, minimum sample thresholds) keeps reviews from chasing noise.',
          concepts: ['Detecting seasonal patterns', 'Same-period comparisons', 'Minimum denominators for rates', 'Noise bands from historical variation'],
          quiz: [
            ['February revenue fell 9% from January. Is that alarming?', 'Not by itself; February has about 10% fewer days, so compare per-day or YoY.'],
            ['A region shows 100% conversion this week. What is the likely explanation?', 'A tiny denominator (one or two visitors); suppress rates below a minimum sample.'],
          ],
        },
      ],
    },
    {
      title: 'Reporting Cadence and KPI Reviews',
      description: 'Turning metrics into a rhythm of decisions.',
      topics: [
        {
          title: 'Choosing the reporting cadence',
          description: 'Match cadence to how fast the metric moves and how fast anyone can act: daily for operations and incidents, weekly for growth levers, monthly for finance, quarterly for strategy. Reporting a slow metric daily creates noise-chasing; reporting a fast one monthly hides problems.',
          concepts: ['Cadence by metric volatility', 'Cadence by decision speed', 'Daily, weekly, monthly, quarterly packs', 'Avoiding noise-chasing'],
          quiz: [
            ['Should churn be reviewed daily?', 'No; it moves slowly and daily figures are noise. Weekly or monthly with cohort views is better.'],
            ['Which metrics belong in a daily report?', 'Ones that can break and be fixed in a day: orders, uptime, payment failures, spend pacing.'],
          ],
        },
        {
          title: 'Targets, thresholds and OKRs',
          description: 'A target turns a metric into a commitment; setting it needs a baseline, a trend, a stretch and a rationale. OKRs frame outcomes with measurable key results, and thresholds (red, amber, green) let a review focus on what is off track.',
          concepts: ['Baselines and trend-based targets', 'Stretch versus committed targets', 'Key results that are metrics', 'RAG thresholds'],
          quiz: [
            ['How do you set a target for a metric with a clear trend?', 'Project the trend, then add the expected effect of planned initiatives.'],
            ['What makes a key result bad?', 'It is an activity ("launch feature") rather than a measurable outcome.'],
          ],
        },
        {
          title: 'Running a KPI review',
          description: 'A good review follows a fixed agenda: what moved, why (from the metric tree), what we will do, and what we decided last time. The analyst\'s role is to pre-investigate the big moves so the meeting spends its time on decisions, not on reading numbers aloud.',
          concepts: ['A fixed review agenda', 'Pre-investigating the moves', 'Decisions and owners log', 'Follow-through from last review'],
          quiz: [
            ['What should an analyst bring to a KPI review?', 'The two or three biggest moves already explained with drivers and a proposed action.'],
            ['Why keep a decisions log?', 'To check whether the actions from previous reviews happened and worked.'],
          ],
          prereqs: ['Driver analysis: explaining a change'],
        },
        {
          title: 'Anomalies and written commentary',
          description: 'Flag moves that exceed normal variation, separate data issues from real change, and write commentary that leads with the answer: what changed, by how much, why, and what it means. Numbers without narrative get ignored; narrative without numbers gets doubted.',
          concepts: ['Anomaly thresholds from history', 'Data issue or real change', 'Answer-first commentary', 'Quantified impact statements'],
          quiz: [
            ['Sign-ups dropped 40% on Tuesday. What is the first check?', 'Whether tracking or a pipeline broke; look at raw events and other sources before explaining a business cause.'],
            ['Write an answer-first sentence for a churn rise.', 'Churn rose to 4.1% (+0.8pt) in March, driven by failed payments in the EU after the gateway change; retries recover half.'],
          ],
          prereqs: ['Seasonality, denominators and small numbers'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'End-to-end deliverables an analyst would hand to a leadership team, then the questions interviews ask about them.',
      topics: [
        {
          title: 'Project: metric dictionary for a subscription business',
          description: 'Write the dictionary for a SaaS company from a sample subscriptions and events schema: MRR and its movements, churn, NRR, MAU, CAC and LTV, each with owner, grain, exclusions, reference SQL and a worked value for one month, then reconcile the MRR bridge to the totals.',
          concepts: ['Inventory the metrics leadership uses', 'Write each definition with reference SQL', 'Compute a worked month and reconcile', 'Publish with owners and review dates'],
          quiz: [
            ['How do you prove the MRR bridge is right?', 'Start MRR + new + expansion + reactivation - contraction - churn must equal end MRR to the cent.'],
            ['What goes in the exclusions field?', 'Test accounts, internal users, free plans, refunded periods, whatever the definition leaves out.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: north-star metric tree with driver SQL',
          description: 'Pick a north star for an e-commerce dataset, build a three-level metric tree, and write the SQL that computes every leaf monthly; then explain one month\'s change with a driver bridge and a waterfall chart that reconciles to the total.',
          concepts: ['Choose and justify the north star', 'Draw the tree and map owners', 'Compute leaves monthly in SQL', 'Bridge one month\'s change'],
          quiz: [
            ['Which driver do you attribute the interaction term to?', 'Show it as its own bar; do not hide it inside one driver.'],
            ['Why does the tree need a monthly reconciliation check?', 'A leaf definition drift (new filter) would make the branches stop adding up to the top.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: monthly KPI pack',
          description: 'Produce a repeatable monthly pack from a retail dataset: one page of headline KPIs with MoM, YoY and target variance, a page per metric-tree branch, RAG status, and answer-first commentary on the three largest moves, built so next month is a refresh, not a rebuild.',
          concepts: ['Design the pack layout', 'Build refreshable queries and sheets', 'Set thresholds and RAG rules', 'Write the month\'s commentary'],
          quiz: [
            ['What makes the pack refreshable?', 'Parameterised date logic and queries; no hard-coded months or pasted values.'],
            ['How many commentary points belong on the headline page?', 'Three to five, each with number, driver and action.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: churn and LTV cohort workbook',
          description: 'From a subscriptions table, build monthly cohorts, retention and revenue retention triangles, churn by plan and acquisition channel, cohort LTV curves capped at 36 months, and a CAC payback comparison by channel with a written recommendation on where to spend.',
          concepts: ['Build cohort and retention triangles', 'Segment churn by plan and channel', 'Compute capped cohort LTV', 'Compare payback and recommend'],
          quiz: [
            ['Why compute LTV from cohort curves rather than the simple formula?', 'Churn is not constant; early months churn faster, so the formula overstates value.'],
            ['Which channel gets more budget if its CAC is higher?', 'Possibly, if its payback is shorter or its LTV higher; decide on payback and LTV:CAC, not CAC alone.'],
          ],
          style: 'project',
        },
        {
          title: 'Business metrics interview questions',
          description: 'Definitions and calculations interviewers expect fluently: MRR from a contract, churn to annual, LTV from ARPU and churn, NRR versus GRR, CAC payback, DAU/MAU, why averages mislead, and the difference between a north star and a KPI.',
          concepts: ['Definition and formula questions', 'Quick mental calculations', 'Metric comparison questions', 'Explaining a metric to a non-analyst'],
          quiz: [
            ['Explain NRR to a sales leader in one sentence.', 'Of every $100 our existing customers paid a year ago, how much they pay now including upgrades and losses.'],
            ['What is the difference between a north star and a KPI?', 'The north star is the one value metric for the whole company; KPIs are the accountable metrics per team beneath it.'],
          ],
          style: 'reading',
        },
        {
          title: 'Metric case questions',
          description: 'Open-ended cases: "revenue dropped 10% last week, what do you do?", "how would you measure the success of feature X?", "define the KPIs for a food delivery app". A structured answer checks data, decomposes with a tree, segments, then proposes metrics with guardrails.',
          concepts: ['Clarify then check the data', 'Decompose with a tree', 'Segment and hypothesise', 'Propose metrics with guardrails'],
          quiz: [
            ['First step when told revenue dropped 10%?', 'Clarify the metric and period, then rule out data or tracking issues before looking for causes.'],
            ['How would you measure success for a new search feature?', 'Search-to-click rate and downstream conversion as primary, with zero-result rate and latency as guardrails.'],
          ],
          style: 'reading',
          prereqs: ['Business metrics interview questions'],
        },
      ],
    },
  ],
})
