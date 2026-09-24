import { defineTrack } from '../define'

export const productAnalytics = defineTrack({
  id: 'track-product-analytics',
  title: 'Product Analytics',
  description: 'Measuring how people actually use a product: designing event taxonomies and tracking plans, keeping event data trustworthy, analysing activation, engagement, retention cohorts, funnels, feature adoption and segments, reading experiments, working in Amplitude, Mixpanel and GA4, and writing insights product teams act on.',
  family: 'Data Analytics & BI',
  kind: 'domain',
  icon: '🧭',
  tags: ['product analytics', 'event tracking', 'retention', 'funnels', 'cohorts', 'amplitude', 'mixpanel', 'ga4', 'activation'],
  languages: ['SQL'],
  explainMode: 'tool',
  code: { label: 'SQL or spreadsheet formulas, whichever fits', id: 'sql', fixed: true },
  supports: { project: true },
  prerequisites: ['track-sql'],
  style: 'practice',
  categories: [
    {
      title: 'Event Tracking Design',
      description: 'The data model behind every product metric, and how to design it before code is written.',
      topics: [
        {
          title: 'Events, properties and users',
          description: 'Product analytics stores a stream of events (what happened), each with properties (context such as plan, platform, item id) and a user or device identifier. Every funnel, retention curve and adoption chart is a query over this one table, so its shape decides what can be answered.',
          concepts: ['Event as verb with timestamp', 'Event properties versus user properties', 'Users, devices and sessions', 'The events table as the source of truth'],
          quiz: [
            ['What is the difference between an event property and a user property?', 'Event properties describe that occurrence (item id, price); user properties describe the actor and persist across events (plan, country).'],
            ['Why store events rather than aggregated counters?', 'Raw events can be re-aggregated into any metric later; counters cannot be decomposed.'],
          ],
        },
        {
          title: 'Designing an event taxonomy',
          description: 'A taxonomy decides which actions become events and at what granularity: too few and you cannot answer questions, too many and nobody trusts them. Start from the questions the team asks, map the core user journey, and track outcomes rather than every click.',
          concepts: ['Start from questions, not screens', 'Core journey and value events', 'Granularity: outcome over UI click', 'Object-action naming model'],
          quiz: [
            ['Should you track "button_clicked" with a label property or "checkout_started"?', 'checkout_started; name the outcome so the event survives UI redesigns.'],
            ['How many events does a typical tracking plan need at launch?', 'Usually 20 to 50 covering the core journey; more can be added when a question needs them.'],
          ],
          prereqs: ['Events, properties and users'],
        },
        {
          title: 'Naming conventions and tracking plans',
          description: 'A tracking plan is the spreadsheet or tool that lists every event, its properties, types, trigger and owner. Consistent naming (snake_case object_action, past tense or present, one choice) is what lets analysts find events without asking an engineer.',
          concepts: ['One naming convention, written down', 'Tracking plan columns', 'Property types and allowed values', 'Plan review before implementation'],
          quiz: [
            ['What must a tracking plan row include?', 'Event name, description, exact trigger, properties with types, platforms, and the owner.'],
            ['Why fix the case and tense of event names?', 'signup_completed, SignupComplete and signed_up become three events in the tool, splitting every metric.'],
          ],
          prereqs: ['Designing an event taxonomy'],
        },
        {
          title: 'Identity: anonymous ids, user ids and merging',
          description: 'Users arrive anonymous with a device id and later log in with a user id; identity resolution stitches these so pre-signup behaviour joins the account. Getting merge rules wrong double counts users or breaks funnels that span login.',
          concepts: ['Anonymous device ids', 'Identify calls and aliasing', 'Merge rules and their side effects', 'Cross-device and shared-device cases'],
          quiz: [
            ['What happens to a funnel that starts before login if identities are not merged?', 'The pre-login steps sit on the anonymous id and the later steps on the user id, so nobody appears to complete it.'],
            ['What breaks when two real users share a device without a merge guard?', 'Their histories merge into one profile, corrupting both.'],
          ],
          prereqs: ['Events, properties and users'],
        },
      ],
    },
    {
      title: 'Instrumentation and Data Quality',
      description: 'Getting the events into the pipeline correctly and keeping them that way.',
      topics: [
        {
          title: 'Client-side versus server-side tracking',
          description: 'Client SDKs see UI context and device details but lose events to ad blockers, offline states and app kills; server-side events are complete and trustworthy for money and state changes but lack UI context. Most plans send interaction events from the client and outcome events from the server.',
          concepts: ['What client SDKs can and cannot see', 'Event loss from blockers and offline', 'Server events for outcomes', 'Hybrid plans and shared ids'],
          quiz: [
            ['Where should "purchase_completed" be sent from?', 'The server, after payment confirms, so it is complete and cannot be faked.'],
            ['Why do client and server counts of the same event differ?', 'Ad blockers, network loss and page unloads drop client events; expect a gap and monitor it.'],
          ],
        },
        {
          title: 'Implementing and QA-ing events',
          description: 'Instrumentation ships like code: a ticket from the tracking plan, implementation behind a typed wrapper, a debug view to watch events fire, and a checklist per event (fires once, right properties, right user). Unverified events are the source of most later disputes.',
          concepts: ['Typed tracking wrappers', 'Debug and live event views', 'Per-event QA checklist', 'Release gating on tracking'],
          quiz: [
            ['What does a typed tracking wrapper prevent?', 'Misspelt event names and wrong property types, caught at compile or lint time.'],
            ['Name three things to verify when QA-ing an event.', 'It fires exactly once per action, properties are populated with the right types, and it attaches to the right user id.'],
          ],
          prereqs: ['Naming conventions and tracking plans'],
        },
        {
          title: 'Monitoring event data quality',
          description: 'Events break silently when releases ship: volume drops, a property goes null, a new version double fires. Daily checks on event volume by platform and version, null rates on key properties, and schema drift catch this before a dashboard misleads a roadmap decision.',
          concepts: ['Volume anomaly checks by version', 'Null and unexpected value rates', 'Schema drift and unknown events', 'Alert routing to event owners'],
          quiz: [
            ['A key event volume fell 60% on iOS only. First suspect?', 'The latest iOS release broke or renamed the event; compare by app version.'],
            ['Why check null rates on properties, not just event counts?', 'The event still fires but a null plan or null item id silently empties every breakdown.'],
          ],
          prereqs: ['Implementing and QA-ing events'],
        },
        {
          title: 'Privacy, consent and PII in event data',
          description: 'Event streams easily capture emails, free-text and precise locations that data protection law and platform policies forbid. Consent gating, allow-listed properties, hashing identifiers and retention windows keep analytics lawful and keep the data warehouse out of incident reports.',
          concepts: ['Consent gating of tracking', 'Property allow-lists', 'Hashing and pseudonymous ids', 'Retention and deletion requests'],
          quiz: [
            ['Should a free-text search query be an event property?', 'Only after scrubbing; users type emails and names into search boxes.'],
            ['What does a deletion request require from an analytics pipeline?', 'The ability to find and remove or anonymise every event tied to that user id.'],
          ],
        },
      ],
    },
    {
      title: 'Activation and Onboarding',
      description: 'Getting new users to the moment the product becomes valuable.',
      topics: [
        {
          title: 'Defining activation',
          description: 'Activation is the early behaviour that best separates users who retain from those who leave: Facebook\'s seven friends in ten days, Slack\'s 2,000 messages. It is found by comparing early actions against later retention, then chosen for causality and simplicity rather than the strongest correlation alone.',
          concepts: ['Activation as a retention predictor', 'Candidate actions and retention lift', 'Choosing a threshold and window', 'Sanity checks against reverse causality'],
          quiz: [
            ['How do you find an activation candidate?', 'For each early action, compare week-4 retention of users who did it versus those who did not, and look for large, plausible lifts.'],
            ['Why not pick the action with the highest correlation?', 'It may be a symptom of already-engaged users; pick something causal and achievable in onboarding.'],
          ],
        },
        {
          title: 'Onboarding funnel analysis',
          description: 'Break onboarding into its steps (sign-up, verification, setup, first value action), measure conversion between each within a window, and segment by platform and source. The biggest absolute drop-off, weighted by how many users reach it, is where the work goes.',
          concepts: ['Step definition and windows', 'Absolute versus relative drop-off', 'Platform and source segmentation', 'Prioritising the biggest leak'],
          quiz: [
            ['Step conversion is 90%, 40%, 85%. Which step gets attention?', 'The 40% step, unless few users reach it; weight by volume.'],
            ['Why set a completion window for the onboarding funnel?', 'Without one, late completions inflate conversion and make cohorts incomparable.'],
          ],
          prereqs: ['Defining activation'],
        },
        {
          title: 'Time to value and setup friction',
          description: 'Median time from sign-up to activation shows how fast the product delivers, and its distribution reveals who gets stuck. Friction analysis uses drop-off points, repeated attempts, error events and support contacts to find why.',
          concepts: ['Time-to-activation distribution', 'Repeated attempts and error events', 'Support contacts as friction signal', 'Segment comparison of time to value'],
          quiz: [
            ['Why report median time to value rather than mean?', 'A few users who activate weeks later drag the mean; the median describes the typical path.'],
            ['What does a rise in repeated attempts at a step indicate?', 'Users are trying and failing, so a bug or unclear UI rather than lack of interest.'],
          ],
          prereqs: ['Onboarding funnel analysis'],
        },
      ],
    },
    {
      title: 'Engagement and Frequency',
      description: 'How often and how deeply retained users come back.',
      topics: [
        {
          title: 'Active user metrics and stickiness',
          description: 'DAU, WAU and MAU count distinct users with a qualifying action; DAU/MAU measures how many days a month users show up. The qualifying action must reflect value, and the natural frequency of the product decides whether daily or weekly is the right lens.',
          concepts: ['Qualifying action for "active"', 'Natural frequency of the product', 'DAU/MAU interpretation', 'Rolling windows for smoothing'],
          quiz: [
            ['Is DAU meaningful for a tax-filing product?', 'No; its natural frequency is yearly or monthly, so use MAU or task-completion metrics.'],
            ['What DAU/MAU would a daily-habit product expect?', 'Above 50%, meaning users are active most days.'],
          ],
        },
        {
          title: 'Frequency and depth of use',
          description: 'Frequency is how many days or sessions per period; depth is how much a user does per session (actions, features, time). A user who visits daily for ten seconds and one who visits weekly for an hour look identical in MAU, so engagement needs both dimensions.',
          concepts: ['Sessions or active days per user', 'Actions per session as depth', 'Frequency-depth matrix', 'Engagement scores and their limits'],
          quiz: [
            ['What does a frequency-depth matrix show?', 'Users bucketed by how often they visit and how much they do, exposing casual, habitual and power groups.'],
            ['Why be cautious with composite engagement scores?', 'Weightings are arbitrary and hide which behaviour changed.'],
          ],
          prereqs: ['Active user metrics and stickiness'],
        },
        {
          title: 'Power user curves',
          description: 'A histogram of how many days in the last 28 each user was active (the L28 curve) shows the shape of engagement: a right-hand hump means a habitual core exists, a pure left-skew means most users try once. Tracking the curve over time reveals whether engagement deepens.',
          concepts: ['L7 and L28 active-day histograms', 'Reading a smile curve', 'Curve shifts over time', 'Power user share as a KPI'],
          quiz: [
            ['What does a hump at 25-28 days in the L28 curve mean?', 'A group of users is active nearly every day: a habitual core.'],
            ['How does the L28 curve differ from DAU/MAU?', 'DAU/MAU is the average of the curve; the curve shows the distribution behind it.'],
          ],
          prereqs: ['Frequency and depth of use'],
        },
        {
          title: 'Session analysis',
          description: 'Sessions group a user\'s events into visits using an inactivity timeout (30 minutes on web is the convention) so you can measure visit length, actions per visit and entry and exit points. Sessionising in SQL uses LAG on timestamps and a running sum of new-session flags.',
          concepts: ['Inactivity timeout rules', 'Sessionising with LAG and running sums', 'Entry and exit events', 'Session length distribution'],
          quiz: [
            ['How do you start a new session in SQL?', 'Flag an event when its gap from the previous event by the same user exceeds the timeout, then cumulative-sum the flags.'],
            ['Why is average session length a poor headline metric?', 'It is heavily skewed and idle tabs inflate it; use median and action counts.'],
          ],
        },
      ],
    },
    {
      title: 'Retention Curves and Cohorts',
      description: 'The metric that decides whether growth compounds or leaks.',
      topics: [
        {
          title: 'Retention definitions: N-day, unbounded and bracket',
          description: 'N-day retention asks whether a user returned exactly on day N, unbounded (rolling) asks whether they returned on or after day N, and bracket retention uses a window such as days 7 to 13. Each suits a different product frequency and yields different numbers for the same data.',
          concepts: ['N-day retention', 'Unbounded rolling retention', 'Bracket and week-based retention', 'Matching definition to product frequency'],
          quiz: [
            ['Which definition is higher for the same data, N-day or unbounded?', 'Unbounded, because any later return counts.'],
            ['Which definition suits a weekly-use product?', 'Week-based bracket retention, such as active in week 2 after sign-up.'],
          ],
        },
        {
          title: 'Building cohort retention tables in SQL',
          description: 'Assign each user a cohort by first-seen date, join their activity to compute period numbers since the cohort start, count distinct actives per cohort and period, and divide by cohort size. The result is the retention triangle every product tool draws.',
          concepts: ['First-seen cohort assignment', 'Period number since cohort start', 'Distinct actives per cohort-period', 'Pivoting into a triangle'],
          quiz: [
            ['How is the period number computed?', 'The difference in days or weeks between the activity date and the cohort start date, floored.'],
            ['Why join activity to a fixed cohort size rather than current users?', 'Retention is relative to who started; the denominator must not shrink as users churn.'],
          ],
          prereqs: ['Retention definitions: N-day, unbounded and bracket'],
        },
        {
          title: 'Reading a retention curve',
          description: 'A curve that flattens means a retained core exists and the product has fit for that group; one that keeps sliding to zero means it does not. Compare cohorts to see whether newer cohorts flatten higher, and read the diagonal to see the effect of a launch across all cohorts at once.',
          concepts: ['Flattening versus decaying curves', 'Comparing cohort curves', 'Reading the diagonal for launches', 'Benchmarks by product category'],
          quiz: [
            ['What does a curve that never flattens imply?', 'No group finds lasting value; growth only comes from constant acquisition.'],
            ['A vertical stripe of low values in the triangle. What happened?', 'Something affected every cohort in the same calendar period: an outage, a tracking break or a seasonal dip.'],
          ],
          prereqs: ['Building cohort retention tables in SQL'],
        },
        {
          title: 'User states: new, retained, resurrected and dormant',
          description: 'Classifying each user each period as new, retained, resurrected (back after absence) or dormant turns MAU into an accounting identity: MAU = new + retained + resurrected. Growth accounting shows whether MAU grows from acquisition, retention or win-back.',
          concepts: ['State transitions per period', 'Growth accounting identity', 'Resurrection versus new acquisition', 'Dormancy thresholds'],
          quiz: [
            ['MAU is flat while new users grow. What does growth accounting show?', 'Churned users roughly equal new plus resurrected, so retention is the problem.'],
            ['How is a resurrected user defined?', 'Active this period after at least one full period of inactivity.'],
          ],
          prereqs: ['Building cohort retention tables in SQL'],
        },
      ],
    },
    {
      title: 'Funnels and Conversion',
      description: 'Where users are lost between intent and outcome.',
      topics: [
        {
          title: 'Building a funnel',
          description: 'A funnel counts users who did step 1, then step 2 after step 1, and so on within a conversion window. Decisions about strict ordering, the window, counting users or sessions, and whether steps must be consecutive change the numbers, so they are stated with the result.',
          concepts: ['Step order and strictness', 'Conversion windows', 'Users versus sessions as the unit', 'Funnel SQL with conditional timestamps'],
          quiz: [
            ['How do you compute a two-step funnel in SQL?', 'For each user take the first step-1 time and the first step-2 time after it within the window; count non-null step-2 users over step-1 users.'],
            ['Why does a session-based funnel differ from a user-based one?', 'Users who convert in a later session count as dropped in the session funnel.'],
          ],
        },
        {
          title: 'Diagnosing funnel drop-off',
          description: 'A drop is explained by breaking the step down: by device and browser (bugs), by segment (fit), by property such as payment method (friction), and by time (releases). Error events, rage clicks and repeated attempts at the step turn a number into a cause.',
          concepts: ['Breakdowns by device and version', 'Property-level drop-off', 'Error and rage-click signals', 'Release timeline overlay'],
          quiz: [
            ['Conversion at the payment step fell only on Safari. What next?', 'Look for a client error at that step after the last web release; it is almost certainly a bug.'],
            ['What is a rage click?', 'Several rapid clicks on the same element, a signal that nothing happened when the user expected it to.'],
          ],
          prereqs: ['Building a funnel'],
        },
        {
          title: 'Conversion by segment and time to convert',
          description: 'Overall conversion hides that segments convert at very different rates and speeds. Reporting conversion and median time to convert per segment shows which groups need a shorter path and whether a change sped users up even when conversion held flat.',
          concepts: ['Segment conversion tables', 'Time-to-convert distributions', 'Speed as a secondary metric', 'Mix effects on overall conversion'],
          quiz: [
            ['Conversion held flat but median time to convert halved. Is that a win?', 'Usually yes; faster conversion often raises later conversion and satisfaction, so watch the next cohorts.'],
            ['Why can overall conversion fall when each segment improves?', 'The mix shifted toward a lower-converting segment (Simpson\'s paradox).'],
          ],
          prereqs: ['Building a funnel'],
        },
        {
          title: 'Path analysis and user flows',
          description: 'Instead of a fixed funnel, path analysis shows what users actually do before or after an event: the most common sequences, loops and exits. It reveals detours the funnel design missed and is the starting point when you do not yet know the steps.',
          concepts: ['Next-event and previous-event trees', 'Common sequences and loops', 'Exit points', 'Pruning noisy events from paths'],
          quiz: [
            ['When is path analysis better than a funnel?', 'When you do not know the expected route or suspect users take detours.'],
            ['Why exclude high-frequency events such as page_viewed from paths?', 'They swamp the tree and hide the meaningful actions.'],
          ],
        },
      ],
    },
    {
      title: 'Feature Adoption and Segmentation',
      description: 'Which features matter to which users.',
      topics: [
        {
          title: 'Measuring feature adoption',
          description: 'Adoption is the share of eligible users who used a feature within a window of exposure, tracked from launch as a curve. Eligibility (who could see it) and exposure (who did see it) are the two denominators that separate "nobody wants it" from "nobody found it".',
          concepts: ['Eligible versus exposed denominators', 'Adoption curve from launch', 'Breadth versus depth of adoption', 'Discoverability versus desirability'],
          quiz: [
            ['Exposure is 15% and adoption among exposed is 60%. What is the problem?', 'Discoverability; the feature works for those who find it but most never see it.'],
            ['Why track adoption as a curve rather than a single number?', 'The shape shows whether the feature keeps gaining users or plateaus after the launch spike.'],
          ],
        },
        {
          title: 'Feature retention and value',
          description: 'A feature is valuable if users who adopt it keep using it and retain better overall. Feature retention (share of adopters who use it again) and a matched comparison of adopters against similar non-adopters separate habit-forming features from one-time curiosities.',
          concepts: ['Feature-level retention', 'Adopter versus matched non-adopter retention', 'Selection bias in adopter comparisons', 'Feature usage versus overall retention'],
          quiz: [
            ['Adopters retain 20 points better. Did the feature cause it?', 'Not necessarily; engaged users adopt more features. Compare matched users or run an experiment.'],
            ['What is feature retention?', 'The share of users who used a feature in one period and use it again in the next.'],
          ],
          prereqs: ['Measuring feature adoption'],
        },
        {
          title: 'Behavioural segmentation',
          description: 'Segments defined by behaviour (what users do, how often, which features) explain more than demographics. Rule-based segments such as "weekly creators" or "read-only viewers" are transparent, easy to compute in SQL, and become the standard breakdown for every metric.',
          concepts: ['Behaviour-based segment rules', 'Persona segments from usage', 'Segment stability over time', 'Segments as standard breakdowns'],
          quiz: [
            ['Why prefer rule-based segments over statistical clusters for product teams?', 'Rules are explainable, reproducible in SQL and stable enough to target.'],
            ['What is a sign a segment definition is too narrow?', 'Membership churns week to week, so metrics per segment are noisy.'],
          ],
        },
        {
          title: 'Comparing segments and mix',
          description: 'Comparing a metric across segments needs the same definition and window in each, and a check that segment sizes support the comparison. Reporting the segment mix alongside per-segment metrics prevents a shifting mix being read as a behaviour change.',
          concepts: ['Like-for-like segment comparison', 'Minimum segment sizes', 'Mix reporting beside rates', 'Segment trend charts'],
          quiz: [
            ['A segment of 40 users shows 25% retention. Should it be reported?', 'Flag it as low confidence or merge it; a handful of users moves the rate by several points.'],
            ['What should accompany a per-segment conversion table?', 'Each segment\'s share of users so readers can see mix effects.'],
          ],
          prereqs: ['Behavioural segmentation'],
        },
      ],
    },
    {
      title: 'Experimentation and Tools',
      description: 'Reading experiments and working in the standard product analytics tools.',
      topics: [
        {
          title: 'Experimentation in product teams',
          description: 'A/B tests assign users randomly to variants and compare a primary metric with guardrails; product analysts define the metric, check sample ratio, read significance and confidence intervals, and stop teams from peeking. The statistics are covered in depth in the experimentation track; this is the product workflow.',
          concepts: ['Hypothesis and primary metric', 'Random assignment and exposure events', 'Sample ratio mismatch check', 'Reading a readout: lift, interval, guardrails'],
          quiz: [
            ['What is a sample ratio mismatch?', 'Variant sizes differ from the planned split more than chance allows, which means assignment or logging is broken.'],
            ['Why should the exposure event, not assignment, start the analysis?', 'Users assigned but never shown the change dilute the measured effect.'],
          ],
        },
        {
          title: 'Amplitude and Mixpanel concepts',
          description: 'Both tools are built on the same objects: events, user properties, cohorts, and charts for segmentation, funnels, retention and flows. Knowing how each handles identity merging, the "any active event" definition, and saved cohorts lets an analyst answer most questions without SQL.',
          concepts: ['Event segmentation charts', 'Funnel and retention chart settings', 'Behavioural cohorts and saving them', 'Where tool numbers diverge from SQL'],
          quiz: [
            ['Why might a tool\'s retention differ from your SQL?', 'Different retention definition (N-day versus unbounded), different active-event set, or identity merges the warehouse lacks.'],
            ['What is a behavioural cohort in these tools?', 'A saved, auto-updating group defined by events done or not done in a window, usable as a filter anywhere.'],
          ],
        },
        {
          title: 'GA4 event model and reports',
          description: 'GA4 replaced sessions and page views with an event model: every hit is an event with parameters, some auto-collected, some recommended, some custom, and conversions are flagged events. Its explorations (funnel, path, cohort) and BigQuery export are how analysts get beyond the standard reports.',
          concepts: ['Automatic, enhanced and custom events', 'Parameters and custom dimensions', 'Key events and conversions', 'Explorations and the BigQuery export'],
          quiz: [
            ['How do sessions exist in GA4?', 'As session_start events with a session id parameter; session metrics are derived from events.'],
            ['Why use the BigQuery export?', 'Raw, unsampled event rows you can join to product data and query with your own definitions.'],
          ],
        },
        {
          title: 'Choosing tooling and the warehouse',
          description: 'Teams pick between a product analytics tool (fast self-serve for product managers), the warehouse with BI (flexible, joinable with business data), or both via a CDP or warehouse-native tool. The decision turns on who asks questions, how often definitions change, and cost per event.',
          concepts: ['Self-serve tool versus warehouse', 'CDPs and event routing', 'Warehouse-native product analytics', 'Cost per event and sampling'],
          quiz: [
            ['When is a warehouse-first approach the better fit?', 'When product questions need joins to revenue, support or CRM data and the team has analysts who write SQL.'],
            ['What does a CDP add?', 'One collection point that routes the same events to the analytics tool, warehouse and marketing tools.'],
          ],
        },
      ],
    },
    {
      title: 'Dashboards and Insights',
      description: 'Getting the numbers in front of product teams in a form that changes what they build.',
      topics: [
        {
          title: 'Self-serve dashboards for product teams',
          description: 'A product dashboard shows the team\'s north star, activation, retention and adoption for what they own, with segment filters and a fixed set of definitions. Self-serve works when definitions are locked, charts answer known questions, and analysts stay available for the new ones.',
          concepts: ['Team-scoped metric sets', 'Locked definitions behind filters', 'Segment and platform filters', 'When self-serve fails'],
          quiz: [
            ['What belongs on a feature team\'s dashboard?', 'The metrics they can move: adoption, feature retention and their funnel, plus the north star for context.'],
            ['Why does self-serve often fail?', 'Unlocked definitions let every viewer build a different number, and nobody trusts any of them.'],
          ],
        },
        {
          title: 'Writing a product insight',
          description: 'An insight is a finding plus a recommendation: what users do, how big it is, why it matters, and what to do next, in that order and with the chart that proves it. Lead with the conclusion, quantify the opportunity, and name the decision it supports.',
          concepts: ['Conclusion-first structure', 'Quantifying the size of the finding', 'One chart that proves it', 'Recommendation and decision owner'],
          quiz: [
            ['What is the first sentence of an insight write-up?', 'The finding and its size, for example "Users who import contacts in week 1 retain 2x; only 18% do."'],
            ['What turns a finding into an insight?', 'A recommended action with an estimate of its impact.'],
          ],
        },
        {
          title: 'Sizing opportunities',
          description: 'Before a team builds anything, estimate the upside: users affected x plausible change in the metric x value per unit. Reach-impact estimates from funnel and adoption data rank the backlog and stop effort going to problems that look loud but touch few users.',
          concepts: ['Reach from funnel and adoption data', 'Plausible lift assumptions', 'Value per unit of the metric', 'Ranking the backlog'],
          quiz: [
            ['Step conversion is 40% for 10,000 weekly users. What is the upside of lifting it to 50%?', '1,000 more users per week reach the next step; multiply by the downstream value per user.'],
            ['Why state the lift assumption explicitly?', 'So the estimate can be challenged and checked after launch.'],
          ],
          prereqs: ['Writing a product insight'],
        },
        {
          title: 'Weekly product metrics reviews',
          description: 'A product team review looks at the north star, activation, retention and current experiments each week, reads changes against releases, and ends with decisions. The analyst pre-reads the moves, checks tracking health first, and keeps the review on decisions.',
          concepts: ['Fixed weekly metric set', 'Release annotations on charts', 'Tracking health check first', 'Decisions and follow-ups'],
          quiz: [
            ['What should be checked before discussing a metric drop in the review?', 'Whether event volume and tracking are healthy for the period.'],
            ['Why annotate releases on charts?', 'So changes can be read against what shipped instead of guessing.'],
          ],
          prereqs: ['Self-serve dashboards for product teams'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Analyses a product analyst ships in their first months, and the questions interviews ask about them.',
      topics: [
        {
          title: 'Project: tracking plan for a mobile app',
          description: 'Write a complete tracking plan for a habit-tracking app: 30 to 40 events covering onboarding, habit creation, check-ins, reminders and sharing, each with properties, types, trigger and platform, a naming convention document, and identity rules for anonymous-to-login merging.',
          concepts: ['Map the core user journey', 'Draft events and properties', 'Write the naming and identity rules', 'Review the plan with an engineer'],
          quiz: [
            ['Which events go server-side in this plan?', 'Account creation, subscription changes and anything that alters stored state.'],
            ['How do you decide an event is unnecessary?', 'No question in the plan\'s question list needs it.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: retention and activation analysis in SQL',
          description: 'On a public event dataset, build weekly cohort retention triangles, test five candidate activation actions against week-4 retention, choose and justify an activation metric, and present the activation rate by acquisition source with a recommendation.',
          concepts: ['Build weekly cohorts and triangles', 'Test activation candidates', 'Choose and defend the metric', 'Report activation by source'],
          quiz: [
            ['How do you present the activation candidate comparison?', 'A table of each action with share of users doing it and week-4 retention with and without it.'],
            ['What makes a candidate unusable even if it predicts well?', 'It happens too late to act on, or too few users can plausibly do it.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: signup funnel diagnosis',
          description: 'Take a multi-step signup funnel with a suspected drop, compute step conversion by device, browser, source and app version over eight weeks, overlay releases, find the cause of the drop, and write an insight with a sized fix.',
          concepts: ['Compute the funnel and windows', 'Break down by device and version', 'Overlay releases and errors', 'Write the sized recommendation'],
          quiz: [
            ['What is the fastest way to tell a bug from a behaviour change?', 'The drop is concentrated in one platform or version and starts on a release date.'],
            ['How do you size the fix?', 'Users reaching the step per week x the conversion gap x downstream value.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: feature launch dashboard and readout',
          description: 'For a newly launched feature, build a dashboard with exposure, adoption curve, feature retention, and adopter versus matched non-adopter retention, then write the 30-day launch readout with a keep, iterate or remove recommendation.',
          concepts: ['Define exposure and adoption events', 'Build the adoption and retention charts', 'Compare adopters to matched users', 'Write the launch readout'],
          quiz: [
            ['What is the risk in the adopter comparison?', 'Selection bias; adopters were more engaged before the feature existed.'],
            ['What decision does the readout support?', 'Keep, iterate or remove, with the evidence for each.'],
          ],
          style: 'project',
        },
        {
          title: 'Product analytics interview questions',
          description: 'The recurring questions: define activation, how would you compute retention, N-day versus unbounded, what is DAU/MAU, how to design tracking for a feature, client versus server events, and how a tool\'s numbers can differ from the warehouse.',
          concepts: ['Definition questions', 'SQL for cohorts and funnels', 'Tracking design questions', 'Tool versus warehouse questions'],
          quiz: [
            ['Sketch the SQL for 7-day retention.', 'Cohort users by first-seen date, join activity where the date difference is 7, count distinct over cohort size.'],
            ['How would you instrument a new share button?', 'share_clicked with channel and content id properties from the client, share_completed from the server.'],
          ],
          style: 'reading',
        },
        {
          title: 'Product metric case questions',
          description: 'Case prompts such as "DAU dropped 15% this week", "how would you measure the success of stories", or "which onboarding change should we build". Structure the answer: check data, decompose by segment and platform, form hypotheses, propose metrics with guardrails.',
          concepts: ['Data checks before causes', 'Segment and platform decomposition', 'Hypotheses ranked by evidence', 'Success metrics with guardrails'],
          quiz: [
            ['DAU dropped 15% this week. What are your first three checks?', 'Tracking volume by platform, a release or outage in the period, and whether one segment or region carries the drop.'],
            ['Success metrics for a stories feature?', 'Story creation and viewing rates, creator retention, and overall session frequency, with feed engagement as a guardrail.'],
          ],
          style: 'reading',
          prereqs: ['Product analytics interview questions'],
        },
      ],
    },
  ],
})
