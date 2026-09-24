import { defineTrack } from '../define'

export const sqlAnalytics = defineTrack({
  id: 'track-sql-analytics',
  title: 'SQL for Analytics',
  description: 'The SQL analysts write every day, in the PostgreSQL dialect: joins at the right grain, aggregation patterns, CTEs, window functions, date analysis, cohorts, funnels, sessionisation, pivoting, percentiles, data quality checks, query performance and working with BI semantic layers.',
  family: 'Data Analytics & BI',
  kind: 'language',
  icon: '🧮',
  tags: ['sql', 'postgresql', 'analytics', 'window functions', 'cohorts', 'funnels', 'cte', 'bi'],
  languages: ['SQL'],
  explainMode: 'sql',
  code: { label: 'SQL (PostgreSQL dialect)', id: 'sql', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-sql'],
  style: 'code',
  categories: [
    {
      title: 'Analytical Query Foundations',
      description: 'Turning a business question into a query at the right grain, assuming track-sql joins and basics.',
      topics: [
        {
          title: 'From question to query: grain first',
          description: 'Every analytical query answers a question at a grain (one row per order, per customer-month, per session); deciding the grain before writing SELECT prevents double counting and makes the output shape obvious to the reader.',
          concepts: ['Stating the question and the grain', 'One row per what', 'Sketching the output columns first', 'Sanity checks on row counts'],
          quiz: [
            ['What is the grain of a query?', 'What one output row represents, such as one customer per month.'],
            ['Why check the row count before the numbers?', 'A wrong grain (fan-out or missing rows) makes every number wrong.'],
          ],
        },
        {
          title: 'Join fan-out and duplicated measures',
          description: 'Joining a one-row-per-order table to a many-rows-per-order table multiplies the order amount by the number of line items; spotting fan-out with counts, pre-aggregating the many side, or joining on a distinct key fixes it.',
          concepts: ['Detecting fan-out with COUNT(*) before and after', 'Pre-aggregating the many side in a CTE', 'Joining on the correct key columns', 'COUNT(DISTINCT) as a symptom, not a fix'],
          quiz: [
            ['Total revenue doubles after adding a join. Most likely cause?', 'The joined table has more than one row per key, fanning out the measure.'],
            ['What is the clean fix for fan-out?', 'Aggregate the many-side table to the join grain first, then join.'],
          ],
          prereqs: ['From question to query: grain first'],
        },
        {
          title: 'Left joins, anti-joins and coverage questions',
          description: 'LEFT JOIN keeps every customer even without orders, WHERE right.id IS NULL turns it into an anti-join for "who never bought", and NOT EXISTS says the same thing more clearly; putting a filter in ON versus WHERE changes the result.',
          concepts: ['LEFT JOIN for keep-everything questions', 'Anti-join with IS NULL', 'NOT EXISTS versus NOT IN and NULLs', 'Filters in ON versus WHERE'],
          quiz: [
            ['Why can NOT IN return no rows unexpectedly?', 'If the subquery contains a NULL, NOT IN evaluates to unknown for every row.'],
            ['Where does a filter on the right table go to keep unmatched left rows?', 'In the ON clause, not WHERE.'],
          ],
          prereqs: ['Join fan-out and duplicated measures'],
        },
        {
          title: 'Self-joins and comparing rows in the same table',
          description: 'Joining a table to itself answers "which customers ordered on consecutive days" or "employees and their managers"; aliases keep the two roles apart and an inequality join condition compares rows without a window function.',
          concepts: ['Aliasing the same table twice', 'Hierarchies with manager_id', 'Inequality join conditions', 'When a window function is simpler'],
          quiz: [
            ['How do you list each employee with their manager name?', 'Join employees e to employees m ON e.manager_id = m.id.'],
            ['What does a join condition like a.date < b.date produce?', 'Every pair where a precedes b, often for before/after comparisons.'],
          ],
        },
      ],
    },
    {
      title: 'Aggregation Patterns',
      description: 'GROUP BY beyond the basics.',
      topics: [
        {
          title: 'GROUP BY at multiple grains',
          description: 'Aggregating by day, then by month from the daily result, or by customer then by segment, is the core of most reporting; a CTE per grain makes each step checkable and avoids averaging averages.',
          concepts: ['Stacked aggregation in CTEs', 'Averages of averages trap', 'HAVING for filtered groups', 'GROUP BY expressions and aliases'],
          quiz: [
            ['Average order value by month from an orders table: what is wrong with AVG of daily averages?', 'It weights every day equally regardless of order count; use SUM/COUNT over the month.'],
            ['Can you filter on an aggregate in WHERE?', 'No, use HAVING or an outer query.'],
          ],
          prereqs: ['From question to query: grain first'],
        },
        {
          title: 'Conditional aggregation with CASE and FILTER',
          description: 'SUM(CASE WHEN status = \'paid\' THEN amount END) and PostgreSQL\'s COUNT(*) FILTER (WHERE ...) compute several segmented metrics in one pass over the table, which is faster and clearer than one query per segment.',
          concepts: ['SUM(CASE WHEN ...) pattern', 'The FILTER clause in PostgreSQL', 'Ratios of conditional counts', 'One pass instead of many queries'],
          quiz: [
            ['Write a paid-order count in PostgreSQL without CASE.', 'COUNT(*) FILTER (WHERE status = \'paid\')'],
            ['What does SUM(CASE WHEN x THEN 1 ELSE 0 END) equal?', 'The count of rows where x is true.'],
          ],
          prereqs: ['GROUP BY at multiple grains'],
        },
        {
          title: 'Pivoting rows to columns and back',
          description: 'A wide report with one column per month is conditional aggregation over the month, and unpivoting is a UNION ALL or a LATERAL VALUES list; crosstab from tablefunc exists but conditional aggregation is portable and reads better.',
          concepts: ['Pivot with conditional aggregation', 'Unpivot with UNION ALL', 'Unpivot with LATERAL VALUES', 'crosstab from tablefunc'],
          quiz: [
            ['How do you pivot region into columns for revenue?', 'SUM(amount) FILTER (WHERE region = \'East\') AS east, and so on per region.'],
            ['Why keep data long rather than wide in the warehouse?', 'New categories need no schema change and BI tools pivot for free.'],
          ],
          prereqs: ['Conditional aggregation with CASE and FILTER'],
        },
        {
          title: 'GROUPING SETS, ROLLUP and CUBE',
          description: 'ROLLUP produces subtotals and a grand total in the same result, CUBE every combination, and GROUPING SETS exactly the combinations you list; GROUPING() distinguishes a real NULL from a subtotal row.',
          concepts: ['ROLLUP for hierarchical subtotals', 'CUBE for every combination', 'GROUPING SETS for chosen levels', 'GROUPING() to label total rows'],
          quiz: [
            ['What does GROUP BY ROLLUP(year, month) return?', 'Rows per year-month, per year, and a grand total.'],
            ['How do you tell a subtotal row from a row where the column is NULL?', 'GROUPING(column) returns 1 for subtotals.'],
          ],
          prereqs: ['GROUP BY at multiple grains'],
        },
        {
          title: 'Ratios, shares and safe division',
          description: 'Conversion rates and shares of total need decimal casting (integer division truncates), NULLIF to avoid division by zero, and a window SUM for the denominator so the share is computed in one query.',
          concepts: ['Integer division truncation', 'NULLIF for zero denominators', 'Share of total with SUM() OVER ()', 'ROUND and presentation precision'],
          quiz: [
            ['What does 3/4 return in PostgreSQL?', '0, because both operands are integers; cast one to numeric.'],
            ['How do you avoid division by zero?', 'Divide by NULLIF(denominator, 0), which yields NULL instead of an error.'],
          ],
          prereqs: ['Conditional aggregation with CASE and FILTER'],
        },
      ],
    },
    {
      title: 'CTEs and Subqueries',
      description: 'Structuring queries so each step can be read and tested.',
      topics: [
        {
          title: 'CTEs as named steps',
          description: 'WITH clauses name each intermediate result so a long analysis reads top to bottom, every step can be run alone with SELECT * FROM step, and the reviewer sees the grain change from raw rows to per-customer to per-segment.',
          concepts: ['WITH syntax and chaining CTEs', 'Naming CTEs by their grain', 'Debugging by selecting from a CTE', 'CTEs versus temporary tables'],
          quiz: [
            ['How do you check a middle step of a five-CTE query?', 'Replace the final SELECT with SELECT * FROM that_cte LIMIT 100.'],
            ['Can a CTE reference a later CTE?', 'No, only earlier ones (except in recursive CTEs).'],
          ],
        },
        {
          title: 'Correlated subqueries and EXISTS',
          description: 'A correlated subquery runs once per outer row, which is right for "does this customer have any refund" via EXISTS but slow for computing per-row aggregates that a join or window would do in one pass.',
          concepts: ['EXISTS and NOT EXISTS semantics', 'Scalar subqueries in SELECT', 'Rewriting correlated aggregates as joins', 'Subqueries in WHERE with IN'],
          quiz: [
            ['When is EXISTS preferable to a join?', 'When you only need to know a match exists and must avoid duplicating outer rows.'],
            ['What is the risk of a scalar subquery in SELECT on a large table?', 'It may execute per row; the planner often handles it, but a join is safer.'],
          ],
          prereqs: ['Left joins, anti-joins and coverage questions'],
        },
        {
          title: 'Derived tables, MATERIALIZED and inlining',
          description: 'PostgreSQL inlines CTEs referenced once unless you write AS MATERIALIZED, and a derived table in FROM behaves the same; choosing between them is about readability and forcing evaluation order when the planner picks badly.',
          concepts: ['Derived tables in FROM', 'CTE inlining rules since PostgreSQL 12', 'AS MATERIALIZED and NOT MATERIALIZED', 'Temporary tables for reuse across queries'],
          quiz: [
            ['What does AS MATERIALIZED do?', 'Forces the CTE to be computed once and stored rather than inlined into the outer query.'],
            ['When is a temp table better than a CTE?', 'When several separate queries reuse the same expensive intermediate result.'],
          ],
          prereqs: ['CTEs as named steps'],
        },
        {
          title: 'Recursive CTEs for hierarchies and date spines',
          description: 'WITH RECURSIVE walks org charts, category trees and bill-of-materials by repeatedly joining the previous iteration, and it also generates sequences such as every month between two dates when generate_series is unavailable.',
          concepts: ['Anchor and recursive members', 'Walking a parent-child hierarchy', 'Tracking depth and path', 'Guarding against cycles'],
          quiz: [
            ['What are the two parts of a recursive CTE?', 'The anchor query and the recursive query joined with UNION ALL.'],
            ['How do you stop infinite recursion on cyclic data?', 'Track visited ids in an array or limit depth.'],
          ],
          prereqs: ['CTEs as named steps'],
        },
      ],
    },
    {
      title: 'Window Functions',
      description: 'Calculations across rows without collapsing them.',
      topics: [
        {
          title: 'Window anatomy: OVER, PARTITION BY and ORDER BY',
          description: 'A window function computes a value per row from a set of related rows defined by OVER: PARTITION BY splits the set, ORDER BY sequences it, and rows are kept rather than grouped. Named windows with WINDOW avoid repeating the clause.',
          concepts: ['OVER () for whole-table windows', 'PARTITION BY versus GROUP BY', 'ORDER BY inside OVER', 'Named WINDOW clauses', 'Where window functions are allowed'],
          quiz: [
            ['Can you use a window function in WHERE?', 'No; wrap the query in a CTE or subquery and filter there.'],
            ['What is the difference between PARTITION BY and GROUP BY?', 'PARTITION BY keeps every row; GROUP BY collapses rows into one per group.'],
          ],
          prereqs: ['GROUP BY at multiple grains'],
        },
        {
          title: 'Ranking: ROW_NUMBER, RANK, DENSE_RANK and NTILE',
          description: 'ROW_NUMBER gives unique positions, RANK leaves gaps after ties, DENSE_RANK does not, and NTILE splits rows into equal buckets for quartiles and deciles; top-N-per-group is a ROW_NUMBER partition filtered in an outer query.',
          concepts: ['ROW_NUMBER versus RANK versus DENSE_RANK', 'Top N per group pattern', 'NTILE for quartiles and deciles', 'Tie handling and deterministic ordering'],
          quiz: [
            ['Ranks for values 10, 10, 9 with RANK and DENSE_RANK?', 'RANK: 1, 1, 3. DENSE_RANK: 1, 1, 2.'],
            ['How do you get the top 3 products per category?', 'ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) then WHERE rn <= 3.'],
          ],
          prereqs: ['Window anatomy: OVER, PARTITION BY and ORDER BY'],
        },
        {
          title: 'Running totals and window frames',
          description: 'SUM(amount) OVER (ORDER BY date) is a running total, but the default frame RANGE UNBOUNDED PRECEDING includes peers with the same date; ROWS BETWEEN makes the frame explicit and is what cumulative and trailing sums need.',
          concepts: ['Cumulative sums with ORDER BY', 'RANGE versus ROWS frames', 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'Cumulative share of total'],
          quiz: [
            ['Why can a running total show equal values for rows with the same date?', 'The default RANGE frame includes all peer rows; use ROWS.'],
            ['Write a running total per customer.', 'SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS UNBOUNDED PRECEDING)'],
          ],
          prereqs: ['Window anatomy: OVER, PARTITION BY and ORDER BY'],
        },
        {
          title: 'LAG and LEAD for period-over-period change',
          description: 'LAG reads the previous row in the window and LEAD the next, giving month-over-month growth, days since last order and next-event timing in one pass; the offset and default arguments handle gaps and first rows.',
          concepts: ['LAG and LEAD arguments', 'Percent change from the previous period', 'Days since previous event', 'Handling the first row with a default'],
          quiz: [
            ['How do you compute month-over-month growth?', '(revenue - LAG(revenue) OVER (ORDER BY month)) / NULLIF(LAG(revenue) OVER (ORDER BY month), 0)'],
            ['What does LAG return on the first row?', 'NULL unless a default is supplied as the third argument.'],
          ],
          prereqs: ['Window anatomy: OVER, PARTITION BY and ORDER BY'],
        },
        {
          title: 'Moving averages and trailing windows',
          description: 'AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) is a 7-day moving average; it assumes one row per day, so missing days must be filled first, and a RANGE frame with an interval handles irregular dates.',
          concepts: ['Trailing N rows frame', 'Filling gaps before rolling calculations', 'RANGE BETWEEN INTERVAL frames', 'Centred versus trailing windows'],
          quiz: [
            ['What goes wrong with a 7-row moving average when a day is missing?', 'The window spans more than 7 calendar days; fill the date gaps first.'],
            ['Write a 30-day trailing sum by date regardless of gaps.', 'SUM(x) OVER (ORDER BY day RANGE BETWEEN INTERVAL \'29 days\' PRECEDING AND CURRENT ROW)'],
          ],
          prereqs: ['Running totals and window frames'],
        },
        {
          title: 'FIRST_VALUE, LAST_VALUE and percent of total',
          description: 'FIRST_VALUE returns the first row of the window, LAST_VALUE needs an explicit frame to reach the end, and SUM() OVER (PARTITION BY ...) as a denominator gives share of group total with the detail rows kept.',
          concepts: ['FIRST_VALUE and NTH_VALUE', 'LAST_VALUE frame gotcha', 'Percent of group total', 'Comparing each row to its group maximum'],
          quiz: [
            ['Why does LAST_VALUE often return the current row?', 'The default frame ends at the current row; use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.'],
            ['How do you get each product\'s share of category revenue?', 'revenue / SUM(revenue) OVER (PARTITION BY category)'],
          ],
          prereqs: ['Running totals and window frames'],
        },
      ],
    },
    {
      title: 'Date and Time Analysis',
      description: 'Buckets, calendars and comparisons that survive time zones and month ends.',
      topics: [
        {
          title: 'Date types, time zones and timestamptz',
          description: 'timestamp stores wall-clock time with no zone, timestamptz stores an instant and renders in the session zone; mixing them or bucketing UTC events by a local day silently shifts totals across midnight.',
          concepts: ['date, timestamp and timestamptz', 'AT TIME ZONE conversions', 'Session time zone effects on grouping', 'Storing UTC, reporting local'],
          quiz: [
            ['What does ts AT TIME ZONE \'Asia/Kolkata\' do for a timestamptz?', 'Converts the instant to local wall-clock time as a plain timestamp.'],
            ['Why do daily totals differ between two analysts?', 'Different session time zones bucket the same events into different days.'],
          ],
        },
        {
          title: 'DATE_TRUNC, EXTRACT and bucketing',
          description: 'DATE_TRUNC(\'month\', ts) snaps timestamps to period starts for grouping, EXTRACT pulls year, quarter, dow or hour for slicing, and TO_CHAR formats labels; grouping by the truncated value keeps ordering correct, unlike text labels.',
          concepts: ['DATE_TRUNC for period grouping', 'EXTRACT and date_part fields', 'TO_CHAR for labels', 'ISO weeks and week starts'],
          quiz: [
            ['Why group by DATE_TRUNC rather than TO_CHAR(ts, \'Mon YYYY\')?', 'The truncated value sorts chronologically and stays a date type.'],
            ['What does EXTRACT(dow FROM d) return for Sunday?', '0'],
          ],
          prereqs: ['Date types, time zones and timestamptz'],
        },
        {
          title: 'Date spines and filling gaps',
          description: 'generate_series builds a complete calendar of days or months, and a LEFT JOIN from the spine to the aggregated data turns missing periods into explicit zeros, which running totals, moving averages and charts all need.',
          concepts: ['generate_series for dates', 'LEFT JOIN from the spine', 'COALESCE to zero', 'Spine cross product with dimensions'],
          quiz: [
            ['Generate every day in 2025.', 'SELECT generate_series(\'2025-01-01\'::date, \'2025-12-31\', \'1 day\')::date'],
            ['Why cross join the spine with the customer list?', 'To get a row per customer per period even when the customer had no activity.'],
          ],
          prereqs: ['DATE_TRUNC, EXTRACT and bucketing'],
        },
        {
          title: 'MTD, YTD and same period last year',
          description: 'Month-to-date and year-to-date are running totals within a period partition, and same-period-last-year compares against a row shifted by 12 months via LAG(12) or a self-join on the spine, which handles missing months correctly.',
          concepts: ['YTD as a partitioned running total', 'Prior year via LAG(12) on a full spine', 'Prior year via date arithmetic join', 'Comparable-days adjustments'],
          quiz: [
            ['Why is LAG(revenue, 12) risky for year-over-year?', 'It assumes no missing months; join on month - INTERVAL \'1 year\' or use a spine.'],
            ['Write YTD revenue per month.', 'SUM(revenue) OVER (PARTITION BY EXTRACT(year FROM month) ORDER BY month ROWS UNBOUNDED PRECEDING)'],
          ],
          prereqs: ['Date spines and filling gaps', 'LAG and LEAD for period-over-period change'],
        },
        {
          title: 'Intervals, durations and age',
          description: 'Subtracting timestamps yields an interval, EXTRACT(EPOCH FROM interval) converts to seconds for averaging, and AGE and date arithmetic compute tenure and time-to-event; averaging intervals directly works but formatting them for reports needs care.',
          concepts: ['Timestamp subtraction and intervals', 'EPOCH seconds for averages', 'AGE and tenure calculations', 'Business-hours durations'],
          quiz: [
            ['How do you get average resolution time in hours?', 'AVG(EXTRACT(EPOCH FROM resolved_at - opened_at)) / 3600'],
            ['What does AGE(\'2025-03-01\', \'2024-01-15\') return?', '1 year 1 month 14 days'],
          ],
          prereqs: ['Date types, time zones and timestamptz'],
        },
      ],
    },
    {
      title: 'Behavioural Analytics Queries',
      description: 'The queries product and growth teams ask for.',
      topics: [
        {
          title: 'Cohort tables and retention',
          description: 'Assign each user a cohort (first-activity month), join activity back to it, compute the month offset, and count distinct users per cohort and offset; dividing by cohort size gives the retention triangle behind every retention chart.',
          concepts: ['Cohort assignment with MIN() per user', 'Month offset between cohort and activity', 'Distinct users per cohort and offset', 'Retention percentage and triangle shape', 'Rolling versus classic retention'],
          quiz: [
            ['How do you compute the month offset in PostgreSQL?', '(EXTRACT(year FROM m) - EXTRACT(year FROM c)) * 12 + EXTRACT(month FROM m) - EXTRACT(month FROM c)'],
            ['What is the denominator of retention at offset 3?', 'The number of users in the cohort at offset 0.'],
          ],
          prereqs: ['DATE_TRUNC, EXTRACT and bucketing'],
        },
        {
          title: 'Funnel analysis with ordered steps',
          description: 'A funnel counts users who reached step N after step N-1, so each step needs the earliest timestamp per user and a condition that it happened after the previous step; conditional aggregation then reports counts and step conversion rates.',
          concepts: ['Earliest event per user per step', 'Enforcing step order with timestamps', 'Conversion rate between steps', 'Time-boxed funnels with a window'],
          quiz: [
            ['Why is COUNT(DISTINCT user) per event name not a funnel?', 'It ignores order and time; a user can view checkout without ever adding to cart first.'],
            ['How do you require step 2 within 7 days of step 1?', 'Filter step2_ts BETWEEN step1_ts AND step1_ts + INTERVAL \'7 days\'.'],
          ],
          prereqs: ['Conditional aggregation with CASE and FILTER', 'LAG and LEAD for period-over-period change'],
        },
        {
          title: 'Sessionisation with gaps and islands',
          description: 'Events become sessions by marking a new session whenever the gap from the previous event (via LAG) exceeds a timeout, then running a SUM over the flags to number sessions; the same gaps-and-islands trick finds streaks and contiguous ranges.',
          concepts: ['Gap detection with LAG', 'New-session flag and cumulative SUM', 'Session metrics: duration and events', 'Gaps and islands for streaks'],
          quiz: [
            ['How do you number sessions after flagging session starts?', 'SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY ts ROWS UNBOUNDED PRECEDING)'],
            ['What defines a new session with a 30-minute timeout?', 'ts - LAG(ts) > INTERVAL \'30 minutes\' or LAG is NULL.'],
          ],
          prereqs: ['LAG and LEAD for period-over-period change', 'Running totals and window frames'],
        },
        {
          title: 'DAU, WAU, MAU and stickiness',
          description: 'Daily active users is a distinct count per day, but weekly and monthly actives over a trailing window are not sums of daily values; a self-join or a spine-based distinct count over the window gives them, and DAU/MAU is the stickiness ratio.',
          concepts: ['Distinct actives per calendar period', 'Trailing 7 and 30 day actives', 'Why actives do not add up', 'Stickiness as DAU over MAU'],
          quiz: [
            ['Why can you not sum DAU to get WAU?', 'The same user active on several days would be counted multiple times.'],
            ['How do you get trailing-30-day actives per day?', 'Join a date spine to activity where activity_date BETWEEN day - 29 AND day and count distinct users.'],
          ],
          prereqs: ['Date spines and filling gaps'],
        },
        {
          title: 'Churn, reactivation and status transitions',
          description: 'Comparing each user\'s activity in consecutive periods classifies them as new, retained, churned or reactivated; a full outer join between period N and N-1 user sets, or LAG on a user-period spine, produces the transition counts a growth report needs.',
          concepts: ['User-period activity flags', 'FULL OUTER JOIN between periods', 'New, retained, churned, reactivated labels', 'Net growth reconciliation'],
          quiz: [
            ['How do you define churned for month M?', 'Active in M-1 and not active in M.'],
            ['What check confirms the transition table?', 'Actives(M) = new + retained + reactivated, and actives(M-1) = retained + churned.'],
          ],
          prereqs: ['Cohort tables and retention'],
        },
      ],
    },
    {
      title: 'Distributions and Data Quality',
      description: 'Percentiles, buckets, duplicates and the checks that keep numbers trustworthy.',
      topics: [
        {
          title: 'Percentiles and medians',
          description: 'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x) interpolates a median and PERCENTILE_DISC returns an actual value; p90 latency and median order value describe skewed data far better than averages, and MODE() gives the most common value.',
          concepts: ['PERCENTILE_CONT versus PERCENTILE_DISC', 'WITHIN GROUP ordered-set syntax', 'Median versus mean on skewed data', 'Percentiles per group'],
          quiz: [
            ['Write the median order value per region.', 'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) grouped by region'],
            ['When does PERCENTILE_DISC differ from PERCENTILE_CONT?', 'When the percentile falls between two values; DISC picks one, CONT interpolates.'],
          ],
          prereqs: ['GROUP BY at multiple grains'],
        },
        {
          title: 'Histograms and bucketing with WIDTH_BUCKET',
          description: 'WIDTH_BUCKET(x, low, high, n) assigns each value to one of n equal bins, FLOOR division builds custom buckets and CASE builds business bands; counting per bucket produces the histogram that shows whether an average is hiding two populations.',
          concepts: ['WIDTH_BUCKET arguments', 'FLOOR-based custom bins', 'CASE bands for business ranges', 'Empty buckets and spines'],
          quiz: [
            ['What does WIDTH_BUCKET(55, 0, 100, 10) return?', '6, the sixth bucket covering 50 to 60.'],
            ['Why join bucket counts to a generated list of buckets?', 'So empty buckets appear as zero rather than vanishing.'],
          ],
          prereqs: ['Date spines and filling gaps'],
        },
        {
          title: 'De-duplication with ROW_NUMBER',
          description: 'Exact duplicates are removed with DISTINCT, but near-duplicates (same key, different updated_at) need ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC) and keeping rn = 1, which is also how you pick the latest record per entity.',
          concepts: ['DISTINCT versus DISTINCT ON', 'Latest record per key with ROW_NUMBER', 'Choosing the tie-break order', 'Deleting duplicates in place'],
          quiz: [
            ['What is PostgreSQL\'s shortcut for latest row per key?', 'SELECT DISTINCT ON (key) ... ORDER BY key, updated_at DESC'],
            ['Why must the ORDER BY in the window be deterministic?', 'Otherwise different runs can keep different rows.'],
          ],
          prereqs: ['Ranking: ROW_NUMBER, RANK, DENSE_RANK and NTILE'],
        },
        {
          title: 'Data quality checks: nulls, orphans, ranges and duplicates',
          description: 'A handful of assertion queries catch most bad data: null rates per column, foreign keys with no parent, values outside valid ranges, future dates, and duplicate keys; running them before analysis is faster than explaining a wrong number afterwards.',
          concepts: ['Null rate per column', 'Orphan keys with anti-joins', 'Range and future-date checks', 'Duplicate key detection', 'Freshness: max timestamp checks'],
          quiz: [
            ['How do you compute the null rate for a column?', 'AVG(CASE WHEN col IS NULL THEN 1 ELSE 0 END) or COUNT(col)::numeric / COUNT(*)'],
            ['What is an orphan row?', 'A child row whose foreign key has no matching parent.'],
          ],
          prereqs: ['Left joins, anti-joins and coverage questions'],
        },
        {
          title: 'Reconciling totals between sources',
          description: 'When the warehouse total disagrees with finance, a reconciliation query aggregates both sides at a shared grain, full-outer-joins them and lists the differences, narrowing the cause to missing rows, time zone shifts or filter mismatches.',
          concepts: ['Aggregating both sides to a shared grain', 'FULL OUTER JOIN with COALESCE keys', 'Isolating the differing rows', 'Common causes: filters, zones, late data'],
          quiz: [
            ['Why FULL OUTER JOIN in a reconciliation?', 'To surface rows present in only one source.'],
            ['First thing to check when daily totals disagree slightly?', 'Time zone or cut-off differences in how days are defined.'],
          ],
          prereqs: ['Data quality checks: nulls, orphans, ranges and duplicates'],
        },
      ],
    },
    {
      title: 'Performance and BI Integration',
      description: 'Queries that run in seconds and feed dashboards reliably.',
      topics: [
        {
          title: 'Reading EXPLAIN ANALYZE as an analyst',
          description: 'EXPLAIN ANALYZE shows the plan the database actually ran: sequential versus index scans, hash versus nested loop joins, estimated versus actual rows; a large gap between estimates and actuals or a nested loop over millions of rows points to the fix.',
          concepts: ['Seq Scan versus Index Scan', 'Hash Join versus Nested Loop', 'Estimated versus actual rows', 'Finding the most expensive node'],
          quiz: [
            ['What does a Nested Loop with thousands of outer rows suggest?', 'A missing index or bad estimate; a hash join is usually expected for big joins.'],
            ['Difference between EXPLAIN and EXPLAIN ANALYZE?', 'ANALYZE actually runs the query and reports real timings and row counts.'],
          ],
        },
        {
          title: 'Sargable predicates, indexes and partitions',
          description: 'A filter the index can use (sargable) compares the raw column to a value; wrapping the column in a function, casting it or using a leading wildcard forces a full scan. Partition pruning on dates works the same way.',
          concepts: ['Sargable versus non-sargable filters', 'Functions on columns defeat indexes', 'Date range filters and partition pruning', 'Composite index column order'],
          quiz: [
            ['Why is WHERE DATE_TRUNC(\'day\', ts) = \'2025-01-01\' slow?', 'The function on ts prevents index use; write ts >= \'2025-01-01\' AND ts < \'2025-01-02\'.'],
            ['Can LIKE \'%abc\' use a B-tree index?', 'No, a leading wildcard cannot.'],
          ],
          prereqs: ['Reading EXPLAIN ANALYZE as an analyst'],
        },
        {
          title: 'Aggregate early, select less',
          description: 'Reducing rows before a join, selecting only needed columns from wide tables, filtering before window functions and avoiding DISTINCT as a bandage for fan-out cut runtime more than any tuning knob an analyst controls.',
          concepts: ['Pre-aggregating before joins', 'Column pruning on wide tables', 'Filtering before windows', 'DISTINCT as a smell', 'LIMIT for exploration'],
          quiz: [
            ['Why filter before a window function rather than after?', 'The window computes over fewer rows; filtering after only hides the work.'],
            ['What does SELECT * cost on a columnar warehouse?', 'Reading every column, often most of the I/O.'],
          ],
          prereqs: ['Join fan-out and duplicated measures'],
        },
        {
          title: 'Views, materialized views and semantic layers',
          description: 'A view stores a query, a materialized view stores its result until REFRESH, and a semantic layer (dbt metrics, LookML, Power BI dataset) stores metric definitions so every dashboard computes revenue the same way; analysts consume and contribute to all three.',
          concepts: ['Views for shared logic', 'Materialized views and REFRESH', 'Metric definitions in a semantic layer', 'One definition of revenue'],
          quiz: [
            ['When does a materialized view show stale data?', 'Until REFRESH MATERIALIZED VIEW runs.'],
            ['What problem does a semantic layer solve?', 'Different dashboards computing the same metric differently.'],
          ],
        },
        {
          title: 'SQL inside BI tools: live queries, extracts and parameters',
          description: 'Custom SQL in Tableau or Power BI becomes a subquery the tool wraps, so aggregations should be left to the tool; parameters and query folding change what runs on the database, and extracts trade freshness for speed.',
          concepts: ['Custom SQL as a wrapped subquery', 'Leaving aggregation to the tool', 'Parameterised queries and folding', 'Live connection versus extract trade-off'],
          quiz: [
            ['Why avoid ORDER BY in custom SQL for a BI tool?', 'The tool wraps the query and re-sorts; the ORDER BY is wasted work.'],
            ['What is an extract?', 'A snapshot of query results stored by the BI tool and refreshed on a schedule.'],
          ],
          prereqs: ['Views, materialized views and semantic layers'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Full analyses to write end to end, then the SQL screens and questions analysts face.',
      style: 'project',
      topics: [
        {
          title: 'Project: e-commerce revenue and retention report',
          description: 'From orders, order_items, customers and products tables, produce monthly revenue with growth and YTD, top products per category, a customer cohort retention triangle and a reconciliation against the finance total, all as reviewable CTE queries.',
          concepts: ['Model the grain and check fan-out', 'Monthly revenue with growth and YTD', 'Top products per category', 'Cohort retention triangle', 'Reconcile with finance'],
          quiz: [
            ['Which table drives revenue?', 'order_items aggregated to orders, never orders joined to items without aggregation.'],
            ['How do you present the retention output?', 'One row per cohort, one column per month offset as percentages.'],
          ],
        },
        {
          title: 'Project: product funnel and sessions',
          description: 'Sessionise a raw events table with a 30-minute timeout, build a four-step signup funnel with ordered timestamps and 7-day windows, report conversion by acquisition channel and device, and compute DAU, WAU, MAU and stickiness.',
          concepts: ['Sessionise the event stream', 'Ordered funnel with time windows', 'Conversion by channel and device', 'Active user metrics'],
          quiz: [
            ['What breaks if events arrive out of order?', 'Session boundaries and step ordering; sort by timestamp per user before LAG.'],
            ['Why segment the funnel by channel?', 'Overall conversion hides which channel underperforms.'],
          ],
        },
        {
          title: 'Project: subscription metrics (MRR, churn, expansion)',
          description: 'From a subscriptions table with start, end and plan changes, build a month spine per customer, compute MRR, new, expansion, contraction and churned MRR each month, and verify that the movements sum to the MRR change.',
          concepts: ['Customer-month spine', 'MRR from active subscriptions', 'Movements: new, expansion, contraction, churn', 'Reconcile movements to MRR change'],
          quiz: [
            ['How do you decide if a subscription is active in a month?', 'start <= month_end AND (end IS NULL OR end > month_start)'],
            ['What is the reconciliation check?', 'MRR(M) - MRR(M-1) = new + expansion - contraction - churn.'],
          ],
        },
        {
          title: 'Project: data quality audit',
          description: 'Write a suite of assertion queries for a warehouse schema: null rates, orphaned keys, duplicates, out-of-range values, freshness, and cross-source totals; output one row per check with pass/fail and the failing count.',
          concepts: ['Catalogue the checks per table', 'Write each check as one row', 'UNION ALL into a results table', 'Schedule and alert on failures'],
          quiz: [
            ['What shape should the audit output have?', 'check_name, table, failing_rows, passed boolean, run timestamp.'],
            ['Why UNION ALL the checks?', 'One query and one table for the dashboard and alerting.'],
          ],
        },
        {
          title: 'SQL analytics interview questions',
          description: 'The questions asked in analyst interviews: RANK versus DENSE_RANK, running totals, second-highest salary, top N per group, retention queries, why COUNT(DISTINCT) is not a fix, and how you would validate a number before sending it.',
          concepts: ['Window function questions', 'Join and grain questions', 'Cohort and funnel questions', 'Validation and reasoning aloud'],
          quiz: [
            ['Second-highest salary without LIMIT/OFFSET?', 'DENSE_RANK() OVER (ORDER BY salary DESC) and pick rank 2, or MAX where salary < MAX.'],
            ['Explain when RANK and DENSE_RANK differ.', 'After ties, RANK skips numbers and DENSE_RANK does not.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live SQL screen practice',
          description: 'Timed screens give a schema and four questions of rising difficulty; practise reading the schema for grain and keys, writing the simplest correct query first, checking counts, and narrating assumptions while typing.',
          concepts: ['Reading a schema for keys and grain', 'Simplest correct query first', 'Checking with counts and samples', 'Narrating assumptions'],
          quiz: [
            ['What do you do first with an unfamiliar schema?', 'Identify primary and foreign keys and the grain of each table.'],
            ['How do you handle an ambiguous question?', 'State the assumption aloud and write the query for it.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
