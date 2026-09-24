import { defineTrack } from '../define'

export const marketingAnalytics = defineTrack({
  id: 'track-marketing-analytics',
  title: 'Marketing Analytics',
  description: 'Measuring whether marketing works: the funnel and its channels, campaign metrics from CTR to ROAS, attribution models and their limits, incrementality and lift tests, CAC and payback, email and lifecycle programmes, SEO and content, GA4 and UTM tagging, RFM segmentation, a working understanding of marketing mix modelling, and reporting that marketing teams act on.',
  family: 'Data Analytics & BI',
  kind: 'domain',
  icon: '📣',
  tags: ['marketing analytics', 'attribution', 'roas', 'cac', 'ga4', 'utm', 'rfm', 'incrementality', 'email analytics', 'seo'],
  languages: ['SQL'],
  explainMode: 'tool',
  code: { label: 'SQL or spreadsheet formulas, whichever fits', id: 'sql', fixed: true },
  supports: { project: true },
  prerequisites: ['track-sql'],
  style: 'practice',
  categories: [
    {
      title: 'The Funnel and Its Channels',
      description: 'The map of how customers arrive, and the data each part of it produces.',
      topics: [
        {
          title: 'The marketing funnel from awareness to loyalty',
          description: 'Awareness, consideration, conversion, retention and advocacy each have their own metrics (reach, engaged visits, purchases, repeat rate, referrals) and their own data sources. Analysts use the funnel to place every metric and to see where spend and attention are mismatched.',
          concepts: ['Funnel stages and their metrics', 'Data source per stage', 'Upper versus lower funnel objectives', 'Spend distribution across stages'],
          quiz: [
            ['Which stage does a video view completion rate measure?', 'Awareness or consideration; it says nothing about conversion.'],
            ['Why map metrics to stages before reporting?', 'So a lower-funnel metric is not used to judge an upper-funnel campaign, and vice versa.'],
          ],
        },
        {
          title: 'Paid, owned and earned channels',
          description: 'Paid channels (search, social, display, affiliates) have spend and platform-reported results; owned channels (email, site, app) have full data but no spend; earned (organic search, PR, referrals) have neither and are hardest to measure. Each needs a different measurement approach.',
          concepts: ['Paid channel data and spend', 'Owned channel data completeness', 'Earned channel measurement gaps', 'Channel taxonomy for reporting'],
          quiz: [
            ['Why is organic search harder to measure than paid search?', 'No spend to compute return against and only aggregated query data from search consoles.'],
            ['What is a channel taxonomy?', 'A fixed list of channel and sub-channel names every source and campaign is mapped to for consistent reporting.'],
          ],
          prereqs: ['The marketing funnel from awareness to loyalty'],
        },
        {
          title: 'Marketing data sources and joins',
          description: 'A marketing dataset joins ad platform spend and clicks, web analytics sessions, CRM leads and deals, and order data, each at a different grain and with different ids. Building the joined model (campaign day, session, lead, customer) is the first job before any metric is trusted.',
          concepts: ['Platform APIs and spend exports', 'Web sessions and campaign parameters', 'CRM leads and closed deals', 'Grain and keys for joining'],
          quiz: [
            ['At what grain do ad platforms report spend?', 'Campaign, ad set or ad by day, not per user, so it joins to sessions only through campaign identifiers.'],
            ['Why do platform conversions not match CRM deals?', 'Platforms count their own attributed conversions with their windows; the CRM records actual outcomes.'],
          ],
          prereqs: ['Paid, owned and earned channels'],
        },
        {
          title: 'Source, medium and campaign mapping',
          description: 'Traffic is classified by source (google, newsletter), medium (cpc, email, organic) and campaign name, and channel groupings are rules over these. Analysts maintain the mapping rules and catch the untagged and misclassified traffic that lands in "direct" or "other".',
          concepts: ['Source and medium conventions', 'Channel grouping rules', 'Direct traffic as a catch-all', 'Auditing unclassified traffic'],
          quiz: [
            ['Why is "direct" traffic usually overstated?', 'Untagged links, app traffic, privacy-stripped referrers and some email clients all fall into direct.'],
            ['Where should channel grouping rules live?', 'In one maintained mapping table or config applied everywhere, not in each report.'],
          ],
          prereqs: ['Marketing data sources and joins'],
        },
      ],
    },
    {
      title: 'Campaign Measurement',
      description: 'The standard metrics for judging a campaign, and what they hide.',
      topics: [
        {
          title: 'Impressions, reach, frequency and CTR',
          description: 'Impressions count ad displays, reach counts distinct people, frequency is impressions per person, and click-through rate is clicks over impressions. CTR judges creative relevance; frequency shows ad fatigue; reach checks whether the same people are being paid for repeatedly.',
          concepts: ['Impressions versus reach', 'Frequency and ad fatigue', 'CTR as a creative signal', 'Viewability and invalid traffic'],
          quiz: [
            ['1,000,000 impressions reached 200,000 people. Frequency?', '5 impressions per person.'],
            ['CTR fell steadily over three weeks with the same audience. Likely cause?', 'Creative fatigue; frequency has climbed and the audience has seen the ad too often.'],
          ],
        },
        {
          title: 'CPC, CPM and CPA',
          description: 'Cost per click, cost per thousand impressions and cost per acquisition are spend divided by the respective count. Which one a campaign is bought on shapes what the platform optimises for, and CPA in particular depends entirely on how "acquisition" and its window are defined.',
          concepts: ['CPM for reach buys', 'CPC for traffic buys', 'CPA and the conversion definition', 'Comparing costs across platforms'],
          quiz: [
            ['Spend $5,000, 250,000 impressions, 2,500 clicks, 50 purchases. CPM, CPC, CPA?', 'CPM $20, CPC $2, CPA $100.'],
            ['Why is CPA not comparable between two platforms out of the box?', 'Each platform attributes conversions with its own window and view-through rules.'],
          ],
          prereqs: ['Impressions, reach, frequency and CTR'],
        },
        {
          title: 'ROAS, blended ROAS and MER',
          description: 'Return on ad spend divides attributed revenue by spend for a channel; marketing efficiency ratio (blended ROAS) divides total revenue by total marketing spend. Channel ROAS is inflated by attribution overlap, so MER is the check that the channel numbers add up to reality.',
          concepts: ['Channel ROAS from attributed revenue', 'MER as total revenue over total spend', 'Attribution overlap inflating ROAS', 'Break-even ROAS from margin'],
          quiz: [
            ['Gross margin is 40%. What ROAS breaks even?', '2.5; below that each dollar of ad spend loses money before other costs.'],
            ['Channel ROAS figures sum to more revenue than the company earned. Why?', 'Each platform claims the same conversions; check against MER.'],
          ],
          prereqs: ['CPC, CPM and CPA'],
        },
        {
          title: 'Comparing campaigns fairly',
          description: 'Campaigns differ in objective, audience, duration and spend, so raw metric comparisons mislead. Compare within objective, normalise by spend or reach, use statistical noise bands for small conversion counts, and separate creative, audience and bid effects when explaining a difference.',
          concepts: ['Comparing within objective', 'Normalising by spend and reach', 'Noise bands for small counts', 'Separating creative, audience and bid'],
          quiz: [
            ['Campaign A has 8 conversions from 200 clicks, B has 6 from 100. Is B better?', 'Not confidently; both counts are small and the difference is within noise.'],
            ['Why not compare a retargeting campaign\'s CPA with a prospecting campaign\'s?', 'Retargeting targets people already close to buying; its low CPA is not comparable.'],
          ],
          prereqs: ['ROAS, blended ROAS and MER'],
        },
      ],
    },
    {
      title: 'Attribution Models',
      description: 'Rules for sharing credit for a conversion across the touches before it.',
      topics: [
        {
          title: 'Last-click and first-click attribution',
          description: 'Single-touch models give all credit to the last (or first) touch before conversion. Last-click favours brand search and retargeting that close deals others opened; first-click favours awareness channels. Both are simple, common, and wrong in predictable directions.',
          concepts: ['Last-click mechanics and bias', 'First-click mechanics and bias', 'Last non-direct click', 'Why brand search wins last-click'],
          quiz: [
            ['Which channels look best under last-click?', 'Brand search, retargeting and email, which touch users who already intend to buy.'],
            ['What is last non-direct click?', 'Last-click that skips direct visits so an earlier marketing touch gets credit.'],
          ],
        },
        {
          title: 'Multi-touch: linear, time decay and position based',
          description: 'Multi-touch rules split credit across the path: linear gives equal shares, time decay weights touches closer to conversion, position-based gives 40% to first and last and 20% to the middle. They need a stitched user path, and the weights are still assumptions, not measurements.',
          concepts: ['Building the touchpoint path', 'Linear and time-decay weighting', 'Position-based (U-shaped) weighting', 'Rule choice as an assumption'],
          quiz: [
            ['A path has 4 touches. Under position-based, how much does touch 2 get?', '10%: the two middle touches share 20%.'],
            ['What data does multi-touch need that last-click does not?', 'A user-level sequence of touches across channels, which requires identity stitching.'],
          ],
          prereqs: ['Last-click and first-click attribution'],
        },
        {
          title: 'Data-driven attribution',
          description: 'Data-driven models estimate each touch\'s contribution from converting and non-converting paths, typically with Shapley-style or Markov removal-effect logic. They beat fixed rules but still only re-share observed conversions; they cannot see conversions that would have happened with no ads at all.',
          concepts: ['Converting versus non-converting paths', 'Removal effect intuition', 'Shapley-style credit sharing', 'What data-driven still cannot measure'],
          quiz: [
            ['What is a removal effect?', 'The drop in conversion probability when a channel is removed from every path that contained it.'],
            ['Does data-driven attribution measure incrementality?', 'No; it redistributes credit for observed conversions and still counts ones that would have happened anyway.'],
          ],
          prereqs: ['Multi-touch: linear, time decay and position based'],
        },
        {
          title: 'Attribution windows, view-through and walled gardens',
          description: 'Each platform counts conversions within its own click and view windows (7-day click, 1-day view is a common default), and user-level paths across Google, Meta and Apple are not shared. Privacy changes have widened the gaps, so analysts document windows and treat platform numbers as directional.',
          concepts: ['Click and view-through windows', 'Walled gardens and missing paths', 'Privacy changes and modelled conversions', 'Documenting windows in every report'],
          quiz: [
            ['What is a view-through conversion?', 'A conversion by someone who saw an ad but did not click, within the view window.'],
            ['Why did iOS privacy changes affect platform reporting?', 'Fewer users can be tracked across apps, so platforms model conversions instead of observing them.'],
          ],
        },
      ],
    },
    {
      title: 'Incrementality and Lift',
      description: 'Measuring what marketing caused, rather than what it touched.',
      topics: [
        {
          title: 'Why attribution overstates: incrementality',
          description: 'Attribution credits touches on conversions that may have happened anyway: retargeting people already in checkout, brand search for people who typed the name. Incrementality asks the counterfactual (what would have happened without the campaign) and is answered only by holding some people or places out.',
          concepts: ['Counterfactual framing', 'Cannibalised organic conversions', 'Incremental versus attributed conversions', 'Incremental CPA'],
          quiz: [
            ['A campaign reports 500 conversions; a holdout shows 380 would have happened anyway. Incremental conversions?', '120, and incremental CPA is spend divided by 120.'],
            ['Which campaigns are most likely to be non-incremental?', 'Retargeting and brand search, which reach people already about to convert.'],
          ],
          prereqs: ['Data-driven attribution'],
        },
        {
          title: 'Geo lift and holdout tests',
          description: 'A holdout test withholds the campaign from a random group of users; a geo test withholds it from matched regions when user-level holdouts are impossible. Both compare outcomes between treated and control, and both need a sample large enough to detect the expected lift.',
          concepts: ['User-level holdout groups', 'Matched-market geo tests', 'Sizing the test for detectable lift', 'Reading lift with confidence intervals'],
          quiz: [
            ['When do you need a geo test instead of a user holdout?', 'When the channel cannot target users individually, such as TV, radio, out-of-home or broad social.'],
            ['What makes a good control region?', 'Similar size, seasonality and historical trend to the treated region, with no spillover.'],
          ],
          prereqs: ['Why attribution overstates: incrementality'],
        },
        {
          title: 'Platform conversion lift studies',
          description: 'Ad platforms run their own lift studies with an internal control group of users who would have seen the ad, reporting incremental conversions and confidence. They are convenient and free but measured by the seller, so analysts read the confidence intervals and check against their own holdouts.',
          concepts: ['Platform-run lift study design', 'Reading incremental conversions and confidence', 'Seller-measured caveats', 'Triangulating with your own tests'],
          quiz: [
            ['A lift study reports 12% lift with a confidence interval from -3% to 27%. Conclusion?', 'Inconclusive; the interval includes zero, so the study was too small.'],
            ['Why triangulate a platform lift study with a geo test?', 'The platform measured itself; an independent test guards against optimistic design choices.'],
          ],
          prereqs: ['Geo lift and holdout tests'],
        },
      ],
    },
    {
      title: 'Acquisition Economics',
      description: 'Whether the customers marketing brings in are worth what it paid.',
      topics: [
        {
          title: 'CAC by channel',
          description: 'Channel CAC divides channel spend (media plus the people and tools that run it) by customers it acquired, over the same period, with a stated attribution basis. Fully loaded CAC is what finance wants; paid CAC is what a channel manager can act on; both need the definition in the header.',
          concepts: ['Fully loaded versus paid channel CAC', 'Matching spend and acquisition windows', 'Attribution basis for the denominator', 'Trend of CAC as a channel scales'],
          quiz: [
            ['Why does channel CAC rise as spend grows?', 'The cheapest audience is reached first; extra budget buys less responsive people.'],
            ['Should agency fees be in CAC?', 'In fully loaded CAC yes; state which version you report.'],
          ],
        },
        {
          title: 'Payback period and LTV:CAC for marketing',
          description: 'Payback is months until a channel\'s customers return their CAC in contribution margin; LTV:CAC compares lifetime value to cost. By channel these reveal that a cheap-looking channel brings low-value customers or an expensive one brings customers who stay for years.',
          concepts: ['Cohort payback curves by channel', 'LTV by acquisition channel', 'Channel LTV:CAC comparison', 'Choosing payback targets'],
          quiz: [
            ['Channel A: CAC $50, LTV $90. Channel B: CAC $200, LTV $800. Which is better?', 'B on LTV:CAC (4:1 versus 1.8:1), if the company can wait for the longer payback.'],
            ['What is a payback curve?', 'Cumulative contribution margin per acquired customer by month since acquisition, crossing CAC at the payback point.'],
          ],
          prereqs: ['CAC by channel'],
        },
        {
          title: 'Marginal CAC and budget allocation',
          description: 'Average CAC hides that the next dollar in a channel costs more than the last; marginal CAC is the cost of the extra customers from extra spend. Budgets shift toward channels with the lowest marginal CAC until they equalise, which is why spend curves and diminishing returns matter.',
          concepts: ['Average versus marginal CAC', 'Diminishing returns curves', 'Equalising marginal cost across channels', 'Reading budget tests'],
          quiz: [
            ['Spend rose from $10k to $15k and customers from 200 to 260. Marginal CAC?', '$5,000 / 60 = $83, versus an average of $58.'],
            ['When should you stop adding budget to a channel?', 'When its marginal CAC exceeds the marginal CAC of other channels or the payback target.'],
          ],
          prereqs: ['Payback period and LTV:CAC for marketing'],
        },
      ],
    },
    {
      title: 'Email and Lifecycle Analytics',
      description: 'Measuring the owned channels that talk to existing customers.',
      topics: [
        {
          title: 'Email metrics: deliverability, opens and clicks',
          description: 'Delivery rate, open rate, click rate, click-to-open rate, unsubscribe and complaint rate describe an email programme. Since mail-privacy features prefetch images, open rates are inflated and unreliable, so clicks and downstream conversions carry the weight.',
          concepts: ['Deliverability and bounce types', 'Open rate inflation from prefetching', 'Click and click-to-open rate', 'Unsubscribe and complaint thresholds'],
          quiz: [
            ['Why did open rates jump after 2021 for Apple Mail users?', 'Mail Privacy Protection preloads tracking pixels, registering opens that never happened.'],
            ['What complaint rate triggers deliverability problems?', 'Around 0.1% or higher is where mailbox providers start filtering.'],
          ],
        },
        {
          title: 'Lifecycle stages and triggered campaigns',
          description: 'Lifecycle marketing targets stages (new, activated, at risk, lapsed, won back) with triggered messages based on behaviour. Measuring it means defining the stages in data, tracking stage transitions, and measuring each trigger against a baseline rather than counting sends.',
          concepts: ['Lifecycle stage definitions in data', 'Trigger events and eligibility', 'Stage transition rates', 'Per-trigger performance tables'],
          quiz: [
            ['How is "at risk" typically defined?', 'A retained customer whose activity fell below their usual frequency for a set number of periods.'],
            ['Why measure transitions rather than sends?', 'The goal is moving customers between stages; send counts show activity, not effect.'],
          ],
          prereqs: ['Email metrics: deliverability, opens and clicks'],
        },
        {
          title: 'Measuring lifecycle programmes with holdouts',
          description: 'A win-back email looks effective because some lapsed customers return anyway. A permanent random holdout per programme (5 to 10% who never get the messages) measures true lift in retention and revenue and is the only defensible way to value lifecycle marketing.',
          concepts: ['Programme-level holdout groups', 'Lift in retention and revenue', 'Holdout size and duration', 'Reporting programme value'],
          quiz: [
            ['Win-back reactivated 8% of sends; the holdout reactivated 5%. Lift?', '3 percentage points, a 60% relative lift; value it on the 3 points.'],
            ['Why keep the holdout permanent rather than one-off?', 'Effects change as the programme changes; a standing holdout keeps the measurement current.'],
          ],
          prereqs: ['Lifecycle stages and triggered campaigns'],
        },
        {
          title: 'Push, SMS and in-app messaging',
          description: 'Mobile channels add opt-in rate, delivery, open and conversion, with tight limits on frequency before users disable notifications. Measuring them needs the opt-out rate beside conversion and a fatigue view of messages per user per week.',
          concepts: ['Opt-in and opt-out rates', 'Push delivery and open tracking', 'Frequency caps and fatigue', 'In-app message conversion'],
          quiz: [
            ['What is the guardrail metric for push campaigns?', 'Notification opt-out rate, because a disabled channel is lost for good.'],
            ['Why is SMS conversion measured differently from email?', 'No open tracking; measure clicks on short links and downstream conversions.'],
          ],
        },
      ],
    },
    {
      title: 'SEO, Content and Web Analytics',
      description: 'The organic and on-site side of the measurement picture.',
      topics: [
        {
          title: 'SEO metrics and search console data',
          description: 'Organic search is measured with impressions, clicks, average position and CTR by query and page from search consoles, plus organic sessions and conversions on site. Rankings move constantly, so trends by page group and query cluster matter more than single keywords.',
          concepts: ['Impressions, clicks and position by query', 'Page groups and query clusters', 'Organic sessions and conversions', 'Algorithm updates and annotations'],
          quiz: [
            ['A page\'s impressions rose but clicks fell. What happened?', 'It now ranks for more queries at lower positions, or a search feature pushed it down; check position and CTR.'],
            ['Why group pages rather than track individual URLs?', 'Hundreds of pages move at once; groups show which content type is gaining or losing.'],
          ],
        },
        {
          title: 'Content performance analysis',
          description: 'Content is judged on traffic, engagement (scroll depth, time, return visits) and assisted conversions, over its lifetime rather than launch week. Analysts build a content table with these per piece, group by topic and format, and find what earns links and leads months later.',
          concepts: ['Lifetime versus launch traffic', 'Engagement signals per piece', 'Assisted conversions from content', 'Topic and format comparison'],
          quiz: [
            ['Why is launch-week traffic a poor judge of a blog post?', 'Search traffic builds for months; evergreen pieces are judged over their lifetime.'],
            ['What is an assisted conversion for content?', 'A conversion whose path included a content visit before the converting touch.'],
          ],
          prereqs: ['SEO metrics and search console data'],
        },
        {
          title: 'GA4 events, key events and reports',
          description: 'GA4 records everything as events with parameters; conversions (key events) are flagged events, and traffic acquisition reports break sessions down by default channel grouping. Analysts set up custom events, mark key events, and use explorations or the BigQuery export for anything the standard reports cannot do.',
          concepts: ['Event and parameter setup', 'Key events and conversion counting', 'Acquisition reports and channel grouping', 'Explorations and export for deeper work'],
          quiz: [
            ['What is the difference between a user acquisition and traffic acquisition report?', 'User acquisition credits the first source that brought the user; traffic acquisition credits the source of each session.'],
            ['Why do GA4 counts differ from the backend order count?', 'Consent, blockers and client-side loss drop events; treat GA4 as a sample of true totals.'],
          ],
        },
        {
          title: 'UTM parameters and campaign tagging',
          description: 'utm_source, utm_medium, utm_campaign, utm_content and utm_term on links are how owned and paid traffic is attributed in web analytics. A tagging convention, a link builder and a validation check catch the inconsistent casing and missing tags that fragment every campaign report.',
          concepts: ['The five UTM parameters', 'Tagging conventions and link builders', 'Auto-tagging versus manual UTMs', 'Validating tags in the data'],
          quiz: [
            ['What breaks if utm_medium is "Email" in one campaign and "email" in another?', 'They become two mediums, splitting the channel in every report.'],
            ['Should UTMs be used on internal links?', 'No; they restart the session attribution and overwrite the original source.'],
          ],
          prereqs: ['GA4 events, key events and reports'],
        },
        {
          title: 'Landing pages and conversion rate optimisation',
          description: 'Landing page analysis pairs traffic by source with bounce or engagement rate, scroll depth and form conversion to find pages that waste paid clicks. CRO tests changes to copy, layout and forms with A/B tests, and the analyst sizes what each page could gain.',
          concepts: ['Landing page conversion by source', 'Engagement rate and scroll depth', 'Form abandonment analysis', 'Sizing CRO opportunities'],
          quiz: [
            ['A page gets 20% of paid clicks and converts at half the site average. What is the opportunity?', 'Bringing it to average would add conversions equal to 10% of paid clicks times the average rate; test changes there first.'],
            ['What replaced bounce rate in GA4?', 'Engagement rate: sessions over 10 seconds, with a conversion or 2+ page views; bounce is its inverse.'],
          ],
        },
      ],
    },
    {
      title: 'Segmentation and Modelling',
      description: 'Grouping customers, and the whole-budget view of what moves sales.',
      topics: [
        {
          title: 'Customer segmentation for marketing',
          description: 'Segments group customers by value, behaviour, lifecycle stage or acquisition source so that messaging, offers and budget can differ. Good marketing segments are sizeable, reachable, distinct in behaviour and stable enough to act on across campaigns.',
          concepts: ['Value, behaviour and stage segments', 'Segment size and reachability', 'Segment profiles', 'Segments as campaign audiences'],
          quiz: [
            ['What makes a segment actionable?', 'You can identify its members in your tools and reach them with a distinct message or offer.'],
            ['Why profile segments after building them?', 'To describe who they are (channels, products, tenure) so marketers can design for them.'],
          ],
        },
        {
          title: 'RFM analysis',
          description: 'Recency, frequency and monetary value scored into quintiles give each customer a code such as 555 (best) or 111 (lost). Computed in SQL with NTILE, RFM produces segments like champions, loyal, at risk and hibernating that drive retention and win-back campaigns.',
          concepts: ['Computing R, F and M per customer', 'Quintile scoring with NTILE', 'Named RFM segments', 'Campaign actions per segment'],
          quiz: [
            ['A customer scores R=1, F=5, M=5. Which segment?', 'At risk: a former high-value, frequent buyer who has not purchased recently.'],
            ['Why use quintiles rather than fixed cut-offs?', 'They adapt to the customer base and keep segment sizes comparable over time.'],
          ],
          prereqs: ['Customer segmentation for marketing'],
        },
        {
          title: 'Marketing mix modelling overview',
          description: 'MMM regresses weekly sales on spend by channel, with adstock (carry-over) and saturation transforms plus seasonality and price, to estimate each channel\'s contribution and return without user-level data. Analysts need to know its inputs, its outputs and where it is unreliable.',
          concepts: ['Sales decomposition by channel', 'Adstock and saturation intuition', 'Data requirements: two to three years weekly', 'Reading response curves and limits'],
          quiz: [
            ['What does adstock represent?', 'The carry-over effect of advertising into later weeks after the spend.'],
            ['Why does MMM struggle with a channel whose spend never varies?', 'With no variation there is nothing to estimate its effect from.'],
          ],
          prereqs: ['Why attribution overstates: incrementality'],
        },
        {
          title: 'Seasonality and baselines',
          description: 'Marketing results are read against a baseline: the sales expected from seasonality, promotions and trend without the campaign. Building a baseline from prior years and same-period comparisons stops a Black Friday campaign claiming Black Friday.',
          concepts: ['Seasonal patterns in marketing data', 'Year-over-year and same-period comparisons', 'Promotional calendar effects', 'Baseline versus campaign-driven sales'],
          quiz: [
            ['Sales rose 40% during a campaign week that was also a payday week. How do you judge it?', 'Compare with the same payday week last year or with a control region; not with the previous week.'],
            ['What is a baseline in marketing analysis?', 'The expected outcome with no campaign, from trend, seasonality and known events.'],
          ],
        },
      ],
    },
    {
      title: 'Reporting for Marketing Teams',
      description: 'Dashboards and reports marketers open on Monday morning.',
      topics: [
        {
          title: 'Marketing dashboard design',
          description: 'A marketing dashboard shows spend, results and efficiency by channel against targets, with MER at the top so channel numbers are anchored to reality. Filters for date, channel and campaign, and a stated attribution basis, keep it trusted.',
          concepts: ['Spend, results and efficiency layout', 'MER as the anchor', 'Attribution basis label', 'Channel and campaign drill-downs'],
          quiz: [
            ['Why put MER above channel ROAS on the dashboard?', 'Channel ROAS figures overlap; MER shows whether total marketing paid off.'],
            ['What must every conversion figure on the dashboard say?', 'Which attribution model and window produced it.'],
          ],
        },
        {
          title: 'Weekly performance reporting and commentary',
          description: 'The weekly report leads with what changed against target and why, by channel, with actions for the coming week. The analyst separates noise (small counts, day-of-week) from signal, checks spend pacing against the monthly budget, and flags tracking breaks first.',
          concepts: ['Change against target by channel', 'Spend pacing checks', 'Noise versus signal in weekly data', 'Actions for next week'],
          quiz: [
            ['Spend is 60% of monthly budget by day 12. What does pacing say?', 'Over-pacing; at this rate the budget is gone by day 20.'],
            ['What is the first line of a weekly marketing report?', 'The headline result against target and the biggest driver, for example "CAC $48 vs $45 target, driven by Meta CPM up 20%".'],
          ],
          prereqs: ['Marketing dashboard design'],
        },
        {
          title: 'Spend reconciliation and data quality',
          description: 'Platform spend, invoices and the finance ledger disagree through currency, timing, credits and fees; conversions disagree through attribution. Monthly reconciliation of spend to invoices and conversions to orders is what makes the marketing numbers acceptable to finance.',
          concepts: ['Spend versus invoice reconciliation', 'Currency and timing differences', 'Conversions versus orders reconciliation', 'Documenting known gaps'],
          quiz: [
            ['Platform spend is 3% below the invoice. Likely causes?', 'Currency conversion, fees or taxes on the invoice, or spend posted after the export date.'],
            ['Why reconcile conversions to orders monthly?', 'To keep the gap between attributed and actual known and stable so reports are read correctly.'],
          ],
          prereqs: ['Marketing data sources and joins'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Deliverables a marketing analyst produces, then the interview questions about them.',
      topics: [
        {
          title: 'Project: campaign performance report',
          description: 'From ad platform exports and an orders table, build a campaign report: spend, impressions, clicks, CTR, CPC, CPA and ROAS by channel and campaign for a quarter, blended MER, noise bands for small counts, and a written recommendation on where to shift budget.',
          concepts: ['Load and join platform exports to orders', 'Compute campaign metrics and MER', 'Add noise bands and pacing', 'Write the budget recommendation'],
          quiz: [
            ['How do you handle campaigns with under 30 conversions in the report?', 'Show them with a wide uncertainty band or pool them; do not rank them on CPA alone.'],
            ['What reconciliation must the report include?', 'Attributed revenue by channel against actual revenue, with MER.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: attribution model comparison',
          description: 'Stitch a user-level touchpoint path from web sessions with UTMs, then compute channel credit under last-click, first-click, linear and position-based models for the same conversions, and present how each channel\'s share changes and what the team should conclude.',
          concepts: ['Build the touchpoint path table', 'Implement four attribution rules in SQL', 'Compare channel credit across models', 'Present the conclusions and caveats'],
          quiz: [
            ['Which channel moves most between last-click and first-click?', 'Typically paid social or display gains under first-click and brand search loses.'],
            ['What is the key caveat on the comparison?', 'All four models re-share the same conversions; none measures incrementality.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: RFM segmentation and campaign plan',
          description: 'Score every customer in a retail orders table on recency, frequency and monetary value with NTILE, assign named segments, profile each by size, revenue share and acquisition channel, and propose a campaign and success metric per segment with a holdout design.',
          concepts: ['Compute RFM scores in SQL', 'Assign and profile segments', 'Propose campaigns per segment', 'Design the holdout measurement'],
          quiz: [
            ['What share of revenue do champions usually represent?', 'A large share from a small group, often 30-50% of revenue from under 15% of customers.'],
            ['How is the win-back campaign measured?', 'Reactivation rate of the at-risk segment against a random holdout.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: web analytics report from GA4 data',
          description: 'Using a GA4 BigQuery export sample, build a monthly web report: sessions and key events by channel grouping, landing page conversion by source, UTM tagging audit with a list of untagged campaigns, and a CRO opportunity sized for the worst high-traffic landing page.',
          concepts: ['Query the GA4 export events', 'Build channel and landing page tables', 'Audit UTM tagging', 'Size a CRO opportunity'],
          quiz: [
            ['How do you derive sessions from the GA4 export?', 'Count distinct user pseudo id plus ga_session_id combinations.'],
            ['What does the tagging audit output?', 'Campaign traffic with missing or inconsistent utm parameters, by source, with the fix.'],
          ],
          style: 'project',
        },
        {
          title: 'Marketing analytics interview questions',
          description: 'The expected fluency: CTR, CPC, CPA and ROAS calculations, break-even ROAS from margin, last-click versus multi-touch, what incrementality means, CAC and payback, how UTMs work, what RFM is, and what MMM does that attribution cannot.',
          concepts: ['Campaign metric calculations', 'Attribution versus incrementality questions', 'CAC and payback questions', 'Tooling and tagging questions'],
          quiz: [
            ['Explain incrementality to a marketer in one sentence.', 'The conversions that happened only because of the campaign, measured by comparing against people who did not see it.'],
            ['Margin 50%, ROAS 1.8. Is the campaign profitable?', 'No; break-even ROAS is 2.0.'],
          ],
          style: 'reading',
        },
        {
          title: 'Marketing case questions',
          description: 'Cases like "CAC rose 30% last quarter", "should we move budget from search to social", or "how would you measure a TV campaign". Structure: check data and attribution basis, decompose CAC into spend and conversions by channel, propose a test, recommend with caveats.',
          concepts: ['Decompose CAC changes', 'Channel shift reasoning with marginal CAC', 'Proposing a lift test', 'Recommendations with stated assumptions'],
          quiz: [
            ['CAC rose 30%. What decomposition do you do first?', 'Split into spend change and conversion change by channel, then check conversion rate versus CPC or CPM within each.'],
            ['How would you measure a TV campaign?', 'A matched-market geo test, supported by branded search and direct traffic lift in aired regions.'],
          ],
          style: 'reading',
          prereqs: ['Marketing analytics interview questions'],
        },
      ],
    },
  ],
})
