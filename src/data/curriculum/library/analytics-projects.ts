import { defineTrack } from '../define'

export const analyticsProjects = defineTrack({
  id: 'track-analytics-projects',
  title: 'Analytics Projects',
  description: 'Thirty-one portfolio projects for an aspiring data analyst, each with a defined deliverable: dashboards in Power BI, Tableau and Excel, SQL analyses of cohorts, funnels and data quality, growth and product deep-dives, marketing and customer work, operations and finance models, and the presentations and documentation that get the work used.',
  family: 'Data Analytics & BI',
  kind: 'projects',
  icon: '🗂️',
  tags: ['portfolio', 'projects', 'power bi', 'tableau', 'excel', 'sql', 'dashboards', 'cohort analysis', 'data analyst'],
  languages: ['SQL'],
  explainMode: 'tool',
  code: { label: 'SQL or spreadsheet formulas, whichever fits', id: 'sql', fixed: true },
  supports: { project: true },
  prerequisites: ['track-sql'],
  style: 'project',
  categories: [
    {
      title: 'Dashboards and Reporting',
      description: 'Interactive reports built in the tools analysts are hired for.',
      topics: [
        {
          title: 'Sales dashboard in Power BI from a retail dataset',
          description: 'Build a Power BI report on a public retail orders dataset (such as the Superstore or Online Retail data): a star schema with a date table, DAX measures for sales, profit, margin, YoY growth and top products, and pages for overview, regions and products with slicers and drill-through to order detail.',
          concepts: ['Model the orders data as a star schema', 'Write core DAX measures with time intelligence', 'Design overview, region and product pages', 'Add slicers, drill-through and tooltips', 'Test totals against a SQL cross-check'],
          quiz: [
            ['Why build a separate date table instead of using the order date column?', 'Time-intelligence DAX (YTD, same period last year) needs a contiguous date dimension marked as such.'],
            ['Where should the YoY calculation live?', 'In a measure using SAMEPERIODLASTYEAR, not in a calculated column.'],
            ['What is the acceptance check for the dashboard?', 'Every total on the overview page matches a SQL query on the source data.'],
          ],
        },
        {
          title: 'Executive KPI pack in Excel',
          description: 'Produce a monthly one-page executive pack in Excel from a data sheet: a KPI table with actual, prior month, prior year, target and RAG status, sparklines, a variance waterfall, and a commentary block, all driven by a single month selector so next month is a refresh.',
          concepts: ['Structure the data sheet as a table', 'Build the KPI table with lookup formulas', 'Add sparklines, RAG rules and a waterfall', 'Wire a month selector to every formula', 'Write the month\'s commentary block'],
          quiz: [
            ['How do you make the pack refresh by changing one cell?', 'Every formula references the selected month through INDEX/MATCH or XLOOKUP on the data table.'],
            ['Which conditional formatting drives RAG status?', 'Rules on the variance-to-target cell with thresholds held in a settings range, not typed into the rule.'],
          ],
        },
        {
          title: 'Customer support dashboard in Tableau',
          description: 'From a support tickets export, build a Tableau workbook: ticket volume by channel and category, first-response and resolution time distributions, SLA attainment as a calculated field, CSAT trend, and an agent view with parameters for the SLA threshold, published with a filter action between sheets.',
          concepts: ['Prepare the tickets extract and date parts', 'Create SLA and response-time calculated fields', 'Build volume, time and CSAT sheets', 'Assemble the dashboard with actions and parameters'],
          quiz: [
            ['How is SLA attainment expressed as a calculated field?', 'SUM(IF resolution_hours <= [SLA threshold] THEN 1 ELSE 0 END) / COUNT(tickets).'],
            ['Why show resolution time as a distribution rather than an average?', 'A few very old tickets skew the mean; the median and percentiles describe what customers experience.'],
          ],
        },
        {
          title: 'Web analytics report from a GA4 export',
          description: 'Using a GA4 BigQuery sample export, write SQL for sessions, users, engagement rate and key events by channel grouping and landing page, then build a monthly report with channel trends, top landing pages by conversion, and a device breakdown, with definitions stated on the page.',
          concepts: ['Derive sessions and users from GA4 events', 'Compute engagement rate and key events by channel', 'Rank landing pages by conversion', 'Lay out the monthly web report with definitions'],
          quiz: [
            ['How is a session identified in the export?', 'The combination of user_pseudo_id and the ga_session_id event parameter.'],
            ['What definition must the report state for engagement rate?', 'Engaged sessions (10+ seconds, a key event, or 2+ page views) divided by all sessions.'],
          ],
        },
        {
          title: 'Financial P&L dashboard with variance',
          description: 'Build a P&L dashboard in Power BI or Excel from a ledger export and a budget file: revenue, COGS, gross margin, opex by department and operating profit with actual, budget, variance and YTD, a chart-of-accounts hierarchy for drill-down, and a variance waterfall from budget to actual.',
          concepts: ['Map ledger accounts to P&L lines', 'Join actuals and budget on account and month', 'Build variance and YTD measures', 'Add hierarchy drill-down and the waterfall'],
          quiz: [
            ['How do you keep expense variances signed consistently?', 'Define variance as favourable positive: (budget - actual) for costs, (actual - budget) for revenue.'],
            ['What reconciliation must pass before publishing?', 'The dashboard operating profit equals the ledger\'s for every closed month.'],
          ],
        },
        {
          title: 'Automated weekly report with a scheduled query',
          description: 'Turn a weekly metrics report into an automated one: a parameterised SQL query that computes last week\'s KPIs with WoW change, a scheduled job (dbt, Airflow, a cloud scheduler or a cron script) that writes to a reporting table, and a templated email or Slack message with the headline numbers and a link.',
          concepts: ['Parameterise the weekly query by week start', 'Schedule the job and write a reporting table', 'Template the message with headline numbers', 'Add a freshness check that blocks bad sends'],
          quiz: [
            ['Why write to a reporting table instead of sending query results directly?', 'History is kept, the numbers are reproducible, and the send step can be retried without recomputing.'],
            ['What should stop the report from sending?', 'Source data not refreshed for the week or KPI counts outside a sanity range.'],
          ],
        },
      ],
    },
    {
      title: 'SQL Analysis Projects',
      description: 'Analyses done entirely in SQL, delivered as reproducible query sets.',
      topics: [
        {
          title: 'Cohort retention analysis in SQL',
          description: 'On a users and events table, write the SQL that assigns monthly cohorts by first activity, computes retention for months 0 to 12 per cohort, pivots it into a triangle, and produces a second triangle by acquisition channel, with a short write-up on which cohorts flatten and where.',
          concepts: ['Assign cohorts from first activity date', 'Compute month numbers and distinct actives', 'Pivot into retention triangles', 'Split the triangle by channel and interpret'],
          quiz: [
            ['What is the denominator for each cohort row?', 'The cohort size at month 0, fixed for every later month.'],
            ['Why do the newest cohorts have blank cells?', 'They have not yet reached those months; blanks are not zero retention.'],
          ],
        },
        {
          title: 'SQL data-quality audit',
          description: 'Audit a warehouse schema with SQL: for each key table, check row counts over time, primary-key uniqueness, null rates on required columns, orphaned foreign keys, out-of-range values and duplicate customers, then deliver a findings table with severity, example rows and the fix for each issue.',
          concepts: ['Profile row counts and freshness per table', 'Test uniqueness, nulls and referential integrity', 'Detect out-of-range and duplicate records', 'Write the findings table with severity and fixes'],
          quiz: [
            ['How do you find orphaned foreign keys?', 'LEFT JOIN the child to the parent and select rows where the parent key is null.'],
            ['What makes a finding high severity?', 'It changes a reported metric or blocks a join, such as duplicate order ids inflating revenue.'],
          ],
        },
        {
          title: 'Funnel analysis of a signup flow',
          description: 'From an events table, compute a five-step signup funnel with a 24-hour conversion window, then break each step\'s conversion down by device, source and week, identify the largest drop and when it started, and deliver the query set with a one-page diagnosis.',
          concepts: ['Define the steps and conversion window', 'Compute user-level step timestamps', 'Break conversion down by device, source and week', 'Diagnose the largest drop and its start date'],
          quiz: [
            ['Why take the first step-2 timestamp after step 1 rather than any step-2 event?', 'To enforce order and the window; earlier or unrelated events would inflate conversion.'],
            ['What indicates the drop is a bug rather than behaviour?', 'It is isolated to one device or version and begins on a specific date.'],
          ],
        },
        {
          title: 'Sessionising event logs with window functions',
          description: 'Turn a raw clickstream into sessions in SQL: order events per user, use LAG to compute gaps, start a new session when the gap exceeds 30 minutes, number sessions with a running sum, then compute session length, events per session and entry and exit pages with a validation of edge cases.',
          concepts: ['Compute inter-event gaps with LAG', 'Flag session starts and number them', 'Aggregate session length and depth', 'Validate midnight and single-event edge cases'],
          quiz: [
            ['How is the session number produced?', 'SUM of the new-session flag OVER (PARTITION BY user ORDER BY timestamp).'],
            ['What is a single-event session\'s length?', 'Zero; report it separately rather than letting it drag the median.'],
          ],
        },
        {
          title: 'Customer 360 table build',
          description: 'Build one row per customer from orders, support tickets, email engagement and web sessions: first and last order, lifetime revenue, order count, ticket count, last email click and last visit, with tested joins that do not fan out, documented column definitions and a freshness column.',
          concepts: ['Pre-aggregate each source to customer grain', 'Join without row fan-out', 'Test the table with row-count and sum checks', 'Document every column\'s definition'],
          quiz: [
            ['How do you prevent fan-out when joining orders and tickets?', 'Aggregate each source to one row per customer before joining.'],
            ['What test proves the table is correct?', 'Row count equals distinct customers and total lifetime revenue equals the orders table sum.'],
          ],
        },
        {
          title: 'Product performance analysis in SQL',
          description: 'For a retail orders dataset, rank products and categories by revenue, margin and return rate, compute each product\'s share of category revenue with window functions, find products whose sales are falling over the last six months, and deliver a ranked action list of products to promote, reprice or drop.',
          concepts: ['Compute revenue, margin and return rate per product', 'Rank and share within category with window functions', 'Detect six-month declining trends', 'Produce the promote, reprice or drop list'],
          quiz: [
            ['Which window function gives share of category revenue?', 'SUM(revenue) OVER (PARTITION BY category) as the denominator for each product.'],
            ['How do you flag a declining product robustly?', 'Compare the last three months to the prior three with a minimum sales threshold to avoid noise on tiny products.'],
          ],
        },
      ],
    },
    {
      title: 'Growth and Product Analysis',
      description: 'Deep-dives that answer a product or growth question end to end.',
      topics: [
        {
          title: 'Churn deep-dive with segments',
          description: 'Investigate rising churn in a subscription dataset: compute monthly churn correctly, split by plan, tenure, acquisition channel, region and usage level, separate voluntary from failed-payment churn, find the segments driving the rise, and deliver a report with two prioritised recommendations.',
          concepts: ['Compute monthly churn with a fixed denominator', 'Split churn by plan, tenure, channel and usage', 'Separate voluntary from involuntary churn', 'Rank segments by contribution to the rise', 'Write the recommendations'],
          quiz: [
            ['Which segments count most for the rise?', 'Those with the largest share of churned customers times their churn increase, not the highest churn rate alone.'],
            ['Why separate failed-payment churn?', 'It has a different fix (dunning and retries) from customers who chose to leave.'],
          ],
        },
        {
          title: 'A/B test readout',
          description: 'Analyse a completed A/B test from raw assignment and conversion data: check the sample ratio, compute conversion per variant with confidence intervals, check guardrail metrics, look for novelty effects over the test period, and write a one-page readout with a ship, iterate or stop recommendation.',
          concepts: ['Check the sample ratio and exposure', 'Compute lift with confidence intervals', 'Check guardrails and novelty effects', 'Write the ship or stop recommendation'],
          quiz: [
            ['The split is 52/48 on 200,000 users. What do you do?', 'Stop and investigate; that mismatch is far beyond chance and means assignment or logging is broken.'],
            ['Lift is +2% with an interval from -0.5% to +4.5%. Recommendation?', 'Not proven; either extend the test if the cost is low or decide on other evidence, but do not claim a win.'],
          ],
        },
        {
          title: 'Feature adoption analysis',
          description: 'For a feature launched three months ago, compute exposure, adoption among exposed, an adoption curve since launch, feature retention week over week, and a matched comparison of adopters and non-adopters on overall retention, delivered as a launch review with a keep, improve or remove call.',
          concepts: ['Define exposure and adoption from events', 'Chart the adoption curve since launch', 'Compute feature retention week over week', 'Compare adopters with matched non-adopters'],
          quiz: [
            ['Why match non-adopters on prior activity before comparing retention?', 'Adopters were already more engaged; matching reduces the selection bias.'],
            ['Exposure 20%, adoption 65% of exposed. What is the recommendation likely to be?', 'Improve discoverability; the feature works for those who find it.'],
          ],
        },
        {
          title: 'Activation metric definition',
          description: 'Find and define an activation metric for a product from its event data: list candidate early actions, compute week-4 retention with and without each, pick the action and threshold with the best lift that is achievable in onboarding, then report the activation rate by cohort and channel.',
          concepts: ['List candidate early actions', 'Compare week-4 retention per candidate', 'Choose the action, threshold and window', 'Report activation rate by cohort and channel'],
          quiz: [
            ['Why reject a candidate with the highest retention lift but done by 3% of users?', 'It is a symptom of already-engaged users and is not achievable at scale in onboarding.'],
            ['What window do you set for activation?', 'One short enough to act on in onboarding, typically the first 7 days.'],
          ],
        },
        {
          title: 'Pricing analysis for a subscription product',
          description: 'Analyse three price tiers on subscription and usage data: revenue and customers per tier, upgrade and downgrade flows, discount realisation, elasticity from a past price change with confounders noted, and a break-even and sensitivity model for a proposed new tier, with a recommendation.',
          concepts: ['Profile revenue and flows per tier', 'Measure discount realisation', 'Estimate elasticity from the past price change', 'Model the new tier\'s break-even and sensitivity'],
          quiz: [
            ['What confounder must be checked for the past price change?', 'Whether a promotion, product change or seasonal peak coincided with it.'],
            ['What does the sensitivity table show?', 'Profit for combinations of new-tier price and expected churn or cannibalisation.'],
          ],
        },
      ],
    },
    {
      title: 'Marketing and Customer Analysis',
      description: 'Projects that measure marketing and describe customers.',
      topics: [
        {
          title: 'Marketing campaign performance report',
          description: 'From ad platform exports and an orders table, build a quarterly campaign report with spend, impressions, clicks, CTR, CPC, CPA and ROAS by channel and campaign, blended MER, uncertainty bands for low-count campaigns, spend pacing against budget, and a written budget-shift recommendation.',
          concepts: ['Join platform exports to orders by campaign', 'Compute campaign metrics and blended MER', 'Add uncertainty bands and pacing', 'Recommend the budget shift'],
          quiz: [
            ['Why include MER when channel ROAS is already reported?', 'Channel ROAS figures overlap through attribution; MER anchors them to real revenue.'],
            ['A campaign has 5 conversions and the best CPA. Do you scale it?', 'Not on that evidence; five conversions is noise. Flag it for a larger test.'],
          ],
        },
        {
          title: 'Customer segmentation with RFM',
          description: 'Score every customer in a retail orders table on recency, frequency and monetary value using NTILE, assign named segments (champions, loyal, at risk, hibernating, lost), profile each by size, revenue share, products and channel, and propose a campaign with a holdout-based success metric per segment.',
          concepts: ['Compute R, F and M per customer in SQL', 'Score quintiles and assign named segments', 'Profile segments by size, revenue and channel', 'Propose campaigns with holdout metrics'],
          quiz: [
            ['How do you handle customers with one order in the frequency quintiles?', 'Ties fill the lowest quintiles; document that F=1 dominates the bottom bucket.'],
            ['How is the at-risk campaign judged?', 'Reactivation rate versus a random holdout of the same segment.'],
          ],
        },
        {
          title: 'Attribution model comparison',
          description: 'Build a user-level touchpoint path from web sessions with UTM data, compute channel credit under last-click, first-click, linear and position-based rules for the same set of conversions, present how each channel\'s share moves between models, and state what the team can and cannot conclude.',
          concepts: ['Assemble touchpoint paths per converting user', 'Implement four credit rules in SQL', 'Compare channel shares across models', 'State conclusions and the incrementality caveat'],
          quiz: [
            ['What determines position-based credit for a 3-touch path?', '40% first, 40% last, 20% to the middle touch.'],
            ['Which conclusion is not supported by the comparison?', 'That any channel caused conversions; all models re-share observed conversions.'],
          ],
        },
        {
          title: 'Email programme analysis',
          description: 'Analyse a year of email sends: deliverability, click and unsubscribe rates by campaign type, per-user send frequency against unsubscribes, lift of a lifecycle series against its holdout, and a send-frequency recommendation, with open rates flagged as unreliable and excluded from conclusions.',
          concepts: ['Compute rates by campaign type', 'Relate send frequency to unsubscribes', 'Measure lifecycle lift against the holdout', 'Recommend a frequency cap'],
          quiz: [
            ['Why exclude open rate from conclusions?', 'Mail privacy features prefetch images and inflate opens; clicks and conversions are reliable.'],
            ['What does the frequency analysis look for?', 'The send count per week above which unsubscribe rate rises faster than clicks.'],
          ],
        },
        {
          title: 'NPS and survey analysis',
          description: 'Analyse a customer survey export: compute NPS with confidence intervals by segment and period, check response bias against the customer base, code open-text comments into themes with counts, and link scores to retention and support tickets, delivered as a deck with three recommended actions.',
          concepts: ['Compute NPS and intervals by segment', 'Check respondent mix against the base', 'Code open-text comments into themes', 'Link scores to retention and tickets'],
          quiz: [
            ['NPS is 42 from 60 responses. How confident is it?', 'Not very; the interval is roughly plus or minus 15 points at that sample size.'],
            ['What does a response bias check compare?', 'The respondent mix (plan, tenure, region) against the full customer base.'],
          ],
        },
      ],
    },
    {
      title: 'Operations and Finance Analysis',
      description: 'Projects on stock, delivery, budgets and unit economics.',
      topics: [
        {
          title: 'Inventory analysis',
          description: 'On an inventory and sales dataset, compute turnover, days on hand, sell-through and stock-out rate per SKU, run an ABC classification by revenue, find slow-moving and ageing stock, and deliver a reorder-priority list plus a write-off candidate list with the cash tied up in each.',
          concepts: ['Compute turnover, days on hand and sell-through', 'Classify SKUs with ABC analysis', 'Find slow-moving and ageing stock', 'Deliver reorder and write-off lists'],
          quiz: [
            ['What is the ABC rule of thumb?', 'A items are the top ~20% of SKUs making ~80% of revenue; C items the long tail.'],
            ['How do you value stock tied up in slow movers?', 'Units on hand times unit cost for SKUs with days on hand above the threshold.'],
          ],
        },
        {
          title: 'Delivery performance analysis',
          description: 'From an orders and shipments dataset, measure on-time delivery rate, lead time distribution by carrier and region, late-delivery causes, and the link between lateness and returns or support tickets, delivered as a report with a carrier scorecard and two operational recommendations.',
          concepts: ['Compute on-time rate and lead-time percentiles', 'Break performance down by carrier and region', 'Attribute lateness to causes', 'Link lateness to returns and tickets'],
          quiz: [
            ['Why report the 90th percentile lead time?', 'The customer promise must hold for most orders; the mean hides the slow tail.'],
            ['What makes a carrier scorecard fair?', 'Comparing within the same region and service level, with minimum shipment counts.'],
          ],
        },
        {
          title: 'Budget versus actual variance workbook',
          description: 'Build an Excel workbook from a ledger export and a budget: P&L by department with actual, budget, variance and YTD, a price-volume-mix decomposition for revenue, variances flagged above a materiality threshold, and a commentary sheet with a sentence per flagged line in a fixed format.',
          concepts: ['Map accounts to budget lines in a table', 'Build variance and YTD formulas', 'Decompose revenue into price, volume and mix', 'Flag material variances and write commentary'],
          quiz: [
            ['Where should the materiality threshold live?', 'In a single settings cell referenced by the flag formulas.'],
            ['What must the PVM decomposition reconcile to?', 'The total revenue variance, to the cent.'],
          ],
        },
        {
          title: 'Sales forecast with seasonality in a spreadsheet',
          description: 'Forecast the next six months of sales from three years of monthly history using classical methods: a moving average trend, multiplicative seasonal indices, a seasonal-naive baseline for comparison, holdout accuracy measured with MAPE, and a chart with the forecast and a plausible range.',
          concepts: ['Estimate trend with moving averages', 'Compute seasonal indices per month', 'Compare against a seasonal-naive baseline', 'Measure holdout accuracy with MAPE', 'Present the forecast with a range'],
          quiz: [
            ['How is a monthly seasonal index computed?', 'The average ratio of actual to trend for that calendar month across the history.'],
            ['Why keep a seasonal-naive baseline?', 'If the method cannot beat "same month last year", it is not adding value.'],
          ],
        },
        {
          title: 'Unit economics model',
          description: 'Build a spreadsheet unit economics model for a delivery or subscription business: contribution margin per order or customer from price, COGS, fees and fulfilment cost, CAC by channel, payback and LTV:CAC, and a scenario switch for price and cost changes, with the assumptions sourced and documented.',
          concepts: ['Lay out revenue and variable costs per unit', 'Compute contribution margin and payback', 'Add CAC by channel and LTV:CAC', 'Build a scenario switch for price and costs'],
          quiz: [
            ['Contribution is $4 per order and CAC is $60. What is the payback?', '15 orders; convert to months using orders per customer per month.'],
            ['Why exclude fixed costs from the unit view?', 'They do not change per unit; the model asks whether each extra unit pays.'],
          ],
        },
      ],
    },
    {
      title: 'Communication and Portfolio',
      description: 'Making the work land, and making it visible.',
      topics: [
        {
          title: 'Stakeholder presentation of an analysis',
          description: 'Turn one of your analyses into a 10-slide stakeholder deck: an executive summary slide with the answer and the ask, one chart per slide with a takeaway title, a methods appendix, and a rehearsed five-minute delivery, then collect feedback from a non-analyst and revise it.',
          concepts: ['Write the answer-first executive summary', 'Give each chart a takeaway title', 'Move methods to an appendix', 'Rehearse and revise from feedback'],
          quiz: [
            ['What goes on the first slide?', 'The answer, its size, and what you want the audience to decide.'],
            ['Why a takeaway title rather than a descriptive one?', '"Churn is concentrated in month-2 monthly plans" tells the reader what to see; "Churn by plan" does not.'],
          ],
        },
        {
          title: 'Metric dictionary and documentation',
          description: 'Write the metric dictionary for a dataset you have analysed: 15 to 20 metrics with definition, grain, filters, source tables, reference SQL, owner and a worked value, published as a shared document and linked from every dashboard that uses them.',
          concepts: ['Inventory metrics used across your work', 'Write definitions with reference SQL', 'Verify each with a worked value', 'Publish and link from dashboards'],
          quiz: [
            ['What field prevents most "which number is right" arguments?', 'The reference SQL and a worked value that anyone can rerun.'],
            ['Who is listed as owner?', 'A business owner for meaning and an analyst owner for the implementation.'],
          ],
        },
        {
          title: 'Portfolio case study write-up',
          description: 'Write a public case study for a project: the business question, data and its limitations, method, findings with two or three charts, recommendation and what happened or would happen next, with code in a repository and a README that lets a reader rerun it.',
          concepts: ['Frame the business question', 'Describe data, limits and method', 'Show findings with charts', 'Publish a rerunnable repository'],
          quiz: [
            ['Why lead with the business question rather than the tools?', 'Hiring managers want to see how you think; tools are listed in the README.'],
            ['What makes the repository credible?', 'A README with setup steps, the data source, and a script that reproduces every chart.'],
          ],
        },
        {
          title: 'Ad hoc request triage and delivery',
          description: 'Practise the analyst\'s daily loop on five sample requests: clarify the question and decision, estimate effort, choose SQL or spreadsheet, deliver a scoped answer with caveats within a time box, and log the request, answer and follow-ups in a request tracker you design.',
          concepts: ['Clarify the decision behind the request', 'Time-box and scope the answer', 'Deliver with caveats and next steps', 'Log requests in a tracker'],
          quiz: [
            ['What is the first question to ask about a data request?', 'What decision will this inform, and by when?'],
            ['Why keep a request log?', 'To spot repeated questions that should become dashboards, and to show the team\'s workload.'],
          ],
        },
      ],
    },
  ],
})
