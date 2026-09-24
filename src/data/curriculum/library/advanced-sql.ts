import { defineTrack } from '../define'

export const advancedSql = defineTrack({
  id: 'track-advanced-sql',
  title: 'Advanced SQL',
  description: 'SQL beyond joins and GROUP BY for analytics and pipeline work: lateral and anti joins, window frames, recursive CTEs, JSON and arrays, gaps-and-islands, MERGE, EXPLAIN, indexing, partitioning, materialised views, locking for loads, and testable SQL.',
  family: 'Data Engineering',
  kind: 'language',
  icon: '🧮',
  tags: ['sql', 'postgresql', 'window functions', 'cte', 'query planning', 'indexing', 'analytics'],
  languages: ['SQL'],
  explainMode: 'sql',
  code: { label: 'SQL (PostgreSQL dialect)', id: 'sql', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-sql'],
  style: 'code',
  categories: [
    {
      title: 'Advanced Joins and Set Operations',
      description: 'Join forms that the basic track skips, and the set operators that combine whole result sets.',
      topics: [
        {
          title: 'LATERAL joins',
          description: 'A LATERAL subquery can reference columns from tables to its left, so it runs once per outer row. It replaces correlated subqueries that must return several columns or rows, such as the latest three orders per customer.',
          concepts: ['Correlated subqueries and their limits', 'CROSS JOIN LATERAL versus LEFT JOIN LATERAL', 'Top-N per group with LATERAL', 'Set-returning functions in LATERAL'],
          quiz: [
            ['What can a LATERAL subquery do that a plain derived table cannot?', 'Reference columns of tables that appear earlier in the FROM clause.'],
            ['Which join keeps outer rows with no LATERAL match?', 'LEFT JOIN LATERAL ... ON true.'],
            ['How do you get the newest 3 orders per customer with LATERAL?', 'LEFT JOIN LATERAL (SELECT ... WHERE o.customer_id = c.id ORDER BY created_at DESC LIMIT 3) o ON true.'],
          ],
        },
        {
          title: 'Semi-joins and anti-joins',
          description: 'EXISTS and NOT EXISTS express "has at least one match" and "has no match" without duplicating rows the way a join does. Anti-joins written with NOT IN silently return nothing when the subquery yields a NULL.',
          concepts: ['EXISTS as a semi-join', 'NOT EXISTS as an anti-join', 'The NOT IN and NULL trap', 'LEFT JOIN ... IS NULL versus NOT EXISTS'],
          quiz: [
            ['Why does NOT IN (SELECT col ...) return no rows when col contains a NULL?', 'x NOT IN (..., NULL) evaluates to NULL, never true, so every row is filtered out.'],
            ['Does EXISTS duplicate outer rows when there are many matches?', 'No, it returns each outer row at most once.'],
          ],
        },
        {
          title: 'Self-joins and non-equi joins',
          description: 'Joining a table to itself for pairs, predecessors and hierarchies, and joining on inequalities or BETWEEN for ranges, bands and versioned lookups. Non-equi joins cannot use hash joins, so their cost profile differs.',
          concepts: ['Self-join aliases and pair generation', 'Avoiding duplicate pairs with a < b', 'Range joins with BETWEEN', 'Cost of non-equi joins'],
          quiz: [
            ['How do you list each unordered pair of employees once?', 'Self-join with e1.id < e2.id.'],
            ['Which join algorithm cannot be used for a BETWEEN predicate?', 'Hash join; the planner falls back to nested loop or merge join.'],
          ],
        },
        {
          title: 'UNION, INTERSECT and EXCEPT',
          description: 'Set operators combine whole result sets by position, not by name. UNION deduplicates and costs a sort or hash, UNION ALL does not; INTERSECT and EXCEPT compare complete rows and treat NULLs as equal, unlike joins.',
          concepts: ['UNION versus UNION ALL cost', 'INTERSECT and EXCEPT semantics', 'Column alignment and type coercion', 'Set operators for table diffs'],
          quiz: [
            ['When should you prefer UNION ALL?', 'Whenever duplicates are impossible or acceptable, because it skips the deduplication step.'],
            ['Do INTERSECT and EXCEPT treat two NULLs as equal?', 'Yes, set operators use IS NOT DISTINCT FROM semantics.'],
          ],
        },
        {
          title: 'Join order and query shape',
          description: 'How the optimiser reorders inner joins but not outer joins, why filtering before joining shrinks intermediate results, and how join_collapse_limit and CTE boundaries change what the planner is allowed to reorder.',
          concepts: ['Inner versus outer join reordering', 'Pushing filters below joins', 'join_collapse_limit and from_collapse_limit', 'Materialised versus inlined CTEs'],
          quiz: [
            ['Can PostgreSQL reorder a LEFT JOIN with an INNER JOIN freely?', 'No, outer joins constrain the order because reordering can change results.'],
            ['Since PostgreSQL 12, when is a CTE inlined?', 'When it is referenced once, is not recursive and has no side effects, unless MATERIALIZED is specified.'],
          ],
          prereqs: ['LATERAL joins', 'Semi-joins and anti-joins'],
        },
      ],
    },
    {
      title: 'Window Functions in Depth',
      description: 'Frames, ordering subtleties and the analytic functions that drive most reporting SQL.',
      topics: [
        {
          title: 'Window frames: ROWS, RANGE and GROUPS',
          description: 'The frame clause decides which rows an aggregate sees relative to the current row. The default RANGE frame includes peers with equal ORDER BY values, which is why running sums over duplicate dates look wrong until you switch to ROWS.',
          concepts: ['Default frame with and without ORDER BY', 'ROWS BETWEEN for physical offsets', 'RANGE with numeric and interval offsets', 'GROUPS frames and peer rows', 'EXCLUDE CURRENT ROW and TIES'],
          quiz: [
            ['What is the default frame when ORDER BY is present?', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes peer rows.'],
            ['How do you sum the previous 7 days by date, not by row count?', 'RANGE BETWEEN INTERVAL \'7 days\' PRECEDING AND CURRENT ROW ordered by the date column.'],
            ['Why can a running total repeat values on tied dates?', 'The RANGE frame includes all peers of the current row, so tied rows get the same total.'],
          ],
        },
        {
          title: 'Ranking and distribution functions',
          description: 'ROW_NUMBER, RANK and DENSE_RANK handle ties differently; NTILE buckets rows; PERCENT_RANK and CUME_DIST give relative positions. Choosing the wrong one silently changes top-N and percentile reports.',
          concepts: ['ROW_NUMBER versus RANK versus DENSE_RANK', 'NTILE for quantile buckets', 'PERCENT_RANK and CUME_DIST', 'Deterministic ordering with tie-breakers'],
          quiz: [
            ['Two rows tie for first. What do RANK and DENSE_RANK give the next row?', 'RANK gives 3, DENSE_RANK gives 2.'],
            ['Why add a unique column to ORDER BY under ROW_NUMBER?', 'Without it the numbering of tied rows is arbitrary and can change between runs.'],
          ],
        },
        {
          title: 'Offset and value functions',
          description: 'LAG and LEAD read neighbouring rows, FIRST_VALUE, LAST_VALUE and NTH_VALUE read from the frame edges. LAST_VALUE surprises people because the default frame ends at the current row, so it returns the current value.',
          concepts: ['LAG and LEAD with offsets and defaults', 'FIRST_VALUE and NTH_VALUE', 'The LAST_VALUE frame pitfall', 'IGNORE NULLS workarounds in PostgreSQL'],
          quiz: [
            ['Why does LAST_VALUE return the current row by default?', 'The default frame stops at CURRENT ROW; use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.'],
            ['How do you compute day-over-day change?', 'value - LAG(value) OVER (ORDER BY day).'],
          ],
          prereqs: ['Window frames: ROWS, RANGE and GROUPS'],
        },
        {
          title: 'Running totals, moving averages and cumulative shares',
          description: 'Combining SUM, AVG and COUNT with frames to build cumulative sums, trailing windows, share-of-total and running distinct counts, and the PARTITION BY choices that reset them per customer, month or product.',
          concepts: ['Cumulative sums per partition', 'Trailing N-row moving averages', 'Share of partition total', 'Running distinct counts via DENSE_RANK'],
          quiz: [
            ['How do you compute each row as a percentage of its group total?', 'value * 100.0 / SUM(value) OVER (PARTITION BY group_col).'],
            ['How do you get a running count of distinct users?', 'DENSE_RANK over first-seen dates, or a MAX of ROW_NUMBER per first appearance.'],
          ],
          prereqs: ['Window frames: ROWS, RANGE and GROUPS'],
        },
        {
          title: 'Named windows and filtering window results',
          description: 'The WINDOW clause defines a window once for reuse; window functions run after WHERE and HAVING, so filtering on their output needs a subquery or CTE. FILTER (WHERE ...) restricts which rows feed an aggregate, including window aggregates.',
          concepts: ['WINDOW clause reuse', 'Evaluation order and why WHERE cannot see windows', 'Filtering window output through a CTE', 'FILTER clause on aggregates'],
          quiz: [
            ['Why is WHERE ROW_NUMBER() OVER (...) = 1 an error?', 'Window functions are evaluated after WHERE; wrap the query in a subquery or CTE first.'],
            ['What does COUNT(*) FILTER (WHERE status = \'paid\') do?', 'Counts only rows where status is paid, without a CASE expression.'],
          ],
          prereqs: ['Ranking and distribution functions'],
        },
      ],
    },
    {
      title: 'Recursive CTEs and Hierarchies',
      description: 'Iteration inside a single statement: trees, graphs and generated sequences.',
      topics: [
        {
          title: 'Recursive CTE mechanics',
          description: 'WITH RECURSIVE runs an anchor query, then repeats the recursive member on the previous iteration only until it returns no rows. Knowing that each step sees just the last batch explains both its power and its termination rules.',
          concepts: ['Anchor and recursive members', 'Working table iteration semantics', 'UNION versus UNION ALL termination', 'Depth counters and stop conditions'],
          quiz: [
            ['What does the recursive member see on each iteration?', 'Only the rows produced by the previous iteration, not the whole accumulated result.'],
            ['How does UNION (without ALL) help termination?', 'Duplicate rows are discarded, so cycles that regenerate seen rows stop producing new work.'],
          ],
        },
        {
          title: 'Trees, paths and levels',
          description: 'Walking parent-child tables such as org charts, categories and bills of materials: computing depth, building a materialised path string or array for ordering, and rolling quantities up the tree.',
          concepts: ['Walking parent_id chains', 'Depth and path columns', 'Ordering a tree by path array', 'Rolling up quantities and costs'],
          quiz: [
            ['How do you keep a breadcrumb path during recursion?', 'Carry an array column and append the current id on each step: path || id.'],
            ['How do you sort output in tree order?', 'ORDER BY the accumulated path array.'],
          ],
          prereqs: ['Recursive CTE mechanics'],
        },
        {
          title: 'Graph traversal and cycle detection',
          description: 'Reachability and shortest paths over edge tables, why cycles make a recursive CTE loop forever, and the CYCLE clause (PostgreSQL 14+) or an explicit visited array that stops it.',
          concepts: ['Reachability over an edges table', 'Detecting cycles with a visited array', 'The CYCLE clause', 'Shortest path with depth and LIMIT'],
          quiz: [
            ['What happens if the graph has a cycle and you use UNION ALL?', 'The recursion never terminates and the query runs until it hits memory or a statement timeout.'],
            ['What does CYCLE id SET is_cycle USING path add?', 'A boolean flag and a path column, and it stops expanding rows once a cycle is detected.'],
          ],
          prereqs: ['Recursive CTE mechanics'],
        },
        {
          title: 'Generating series and calendar tables',
          description: 'generate_series builds numbers, dates and timestamps on the fly, which lets you left-join to find missing days, build calendar dimensions, and densify sparse metrics before charting.',
          concepts: ['generate_series for numbers and dates', 'Filling gaps with a LEFT JOIN', 'Building a calendar dimension', 'Recursive CTEs when generate_series is unavailable'],
          quiz: [
            ['How do you list every day in March 2025?', 'SELECT d::date FROM generate_series(\'2025-03-01\', \'2025-03-31\', interval \'1 day\') d.'],
            ['Why join sales to a generated date series?', 'To produce zero rows for days with no sales instead of missing points.'],
          ],
        },
      ],
    },
    {
      title: 'Semi-structured and Text Data',
      description: 'JSON, arrays, strings and regular expressions inside the database.',
      topics: [
        {
          title: 'JSONB operators and indexing',
          description: 'jsonb stores parsed binary JSON with operators for path access (->, ->>, #>>), containment (@>), key existence (?) and jsonpath queries, and GIN indexes make containment queries fast without normalising the data first.',
          concepts: ['json versus jsonb storage', 'Access operators and text casting', 'Containment and existence operators', 'GIN indexes on jsonb', 'jsonpath queries'],
          quiz: [
            ['Difference between -> and ->>?', '-> returns jsonb; ->> returns text.'],
            ['Which index type speeds up data @> \'{"status":"paid"}\'?', 'A GIN index on the jsonb column.'],
            ['Why prefer jsonb over json?', 'It is pre-parsed, supports indexing and operators, and deduplicates keys.'],
          ],
        },
        {
          title: 'Building and unnesting JSON',
          description: 'Turning rows into JSON with jsonb_build_object and jsonb_agg, and JSON back into rows with jsonb_array_elements, jsonb_each and jsonb_to_recordset, so API payloads and event logs can be shredded into relational form.',
          concepts: ['jsonb_build_object and jsonb_agg', 'jsonb_array_elements in LATERAL', 'jsonb_to_recordset with column definitions', 'Updating nested keys with jsonb_set'],
          quiz: [
            ['How do you turn a JSON array column into one row per element?', 'CROSS JOIN LATERAL jsonb_array_elements(col) AS e.'],
            ['What does jsonb_to_recordset need that jsonb_array_elements does not?', 'An AS clause listing column names and types.'],
          ],
          prereqs: ['JSONB operators and indexing'],
        },
        {
          title: 'Arrays and unnest',
          description: 'PostgreSQL arrays as multi-valued columns: constructors, ANY and ALL, array_agg with ORDER BY, unnest WITH ORDINALITY to keep positions, and where arrays beat a junction table and where they do not.',
          concepts: ['Array literals and constructors', '= ANY and containment operators', 'array_agg with ORDER BY', 'unnest WITH ORDINALITY', 'Arrays versus junction tables'],
          quiz: [
            ['How do you test whether 5 is in an integer array column?', '5 = ANY(col).'],
            ['What does WITH ORDINALITY add to unnest?', 'A second column with the 1-based position of each element.'],
          ],
        },
        {
          title: 'String functions and aggregation',
          description: 'string_agg, split_part, format, concat_ws, position and substring with the right NULL behaviour, plus case-folding and trimming for joins on messy text keys.',
          concepts: ['string_agg with ordering and delimiters', 'split_part and substring', 'concat_ws and NULL handling', 'format() for templated text', 'Normalising keys with lower and btrim'],
          quiz: [
            ['What does \'a\' || NULL return?', 'NULL; use concat_ws or coalesce to skip NULLs.'],
            ['How do you build a comma list of names ordered alphabetically?', 'string_agg(name, \', \' ORDER BY name).'],
          ],
        },
        {
          title: 'Regular expressions in SQL',
          description: 'The ~ and ~* operators, regexp_replace, regexp_matches, regexp_split_to_table and (PostgreSQL 15+) regexp_count and regexp_substr, with the performance caveat that regex predicates cannot use ordinary B-tree indexes.',
          concepts: ['~, ~* and !~ operators', 'regexp_replace with flags', 'Extracting groups with regexp_matches', 'regexp_split_to_table', 'Index limits of regex predicates'],
          quiz: [
            ['How do you match case-insensitively with a regex?', 'Use the ~* operator or the i flag.'],
            ['Can WHERE col ~ \'^abc\' use a B-tree index?', 'Only with a text_pattern_ops index and a left-anchored pattern; general regexes force a scan.'],
          ],
        },
      ],
    },
    {
      title: 'Temporal Queries and Sequences',
      description: 'Dates, intervals, sessions and the classic gaps-and-islands family.',
      topics: [
        {
          title: 'Timestamps, time zones and intervals',
          description: 'timestamptz stores an instant and renders it in the session zone; timestamp stores wall-clock text. AT TIME ZONE converts between them, and interval arithmetic across DST boundaries and month ends is where reports go wrong.',
          concepts: ['timestamp versus timestamptz', 'AT TIME ZONE conversions', 'Interval arithmetic and month-end rules', 'age, extract and date_part'],
          quiz: [
            ['What does timestamptz actually store?', 'A UTC instant; the display zone comes from the session setting.'],
            ['What is \'2025-01-31\'::date + interval \'1 month\'?', '2025-02-28 00:00:00, because month addition clamps to the last valid day.'],
          ],
        },
        {
          title: 'Bucketing with date_trunc and date_bin',
          description: 'Rolling events into hours, days, weeks or arbitrary 15-minute bins with date_trunc and date_bin, choosing the week start, and why bucketing in the query beats bucketing in the BI tool.',
          concepts: ['date_trunc granularities', 'date_bin for custom buckets', 'Week starts and ISO weeks', 'Bucketing in the session time zone'],
          quiz: [
            ['How do you group timestamps into 15-minute bins?', 'date_bin(\'15 minutes\', ts, TIMESTAMP \'2000-01-01\').'],
            ['Which day does date_trunc(\'week\', ts) start on?', 'Monday.'],
          ],
          prereqs: ['Timestamps, time zones and intervals'],
        },
        {
          title: 'Gaps and islands',
          description: 'Finding runs of consecutive values or dates (islands) and the holes between them (gaps) using the ROW_NUMBER difference trick or LAG-based change flags, the pattern behind streaks, outages and contiguous-booking reports.',
          concepts: ['The ROW_NUMBER difference trick', 'Change flags with LAG plus running SUM', 'Finding gaps with LEAD', 'Islands over dates versus over integers'],
          quiz: [
            ['What does value - ROW_NUMBER() OVER (ORDER BY value) produce?', 'A constant for each run of consecutive values, which groups the island.'],
            ['How do you find gaps between islands?', 'LEAD(start) - end per island, keeping rows where the difference exceeds one unit.'],
          ],
          prereqs: ['Offset and value functions'],
        },
        {
          title: 'Sessionisation',
          description: 'Splitting event streams into sessions when the gap between consecutive events exceeds a timeout: flag new sessions with LAG, number them with a running SUM, then aggregate per session for duration and event counts.',
          concepts: ['New-session flags with LAG and a threshold', 'Session ids via cumulative SUM', 'Per-session aggregates', 'Session boundaries across day changes'],
          quiz: [
            ['How is a new session detected?', 'When ts - LAG(ts) exceeds the inactivity threshold, or LAG is NULL.'],
            ['Why use SUM(flag) OVER (...) after flagging?', 'The running count of flags gives each event a session number.'],
          ],
          prereqs: ['Gaps and islands'],
        },
        {
          title: 'Range types and point-in-time joins',
          description: 'daterange and tstzrange hold validity intervals; the && overlap operator, @> containment and exclusion constraints replace fragile pairs of start/end columns, and as-of joins pick the version valid at a given moment.',
          concepts: ['daterange and tstzrange literals', 'Overlap and containment operators', 'Exclusion constraints with GiST', 'As-of joins against versioned tables'],
          quiz: [
            ['How do you prevent two bookings of the same room from overlapping?', 'EXCLUDE USING gist (room WITH =, period WITH &&).'],
            ['How do you find the price valid on a given date?', 'JOIN prices p ON p.valid @> order_date with a daterange column.'],
          ],
          prereqs: ['Timestamps, time zones and intervals'],
        },
      ],
    },
    {
      title: 'Reshaping and Merging Data',
      description: 'Pivoting, unpivoting and writing data in idempotent, conflict-aware ways.',
      topics: [
        {
          title: 'Pivoting with conditional aggregation',
          description: 'Turning rows into columns with SUM(CASE WHEN ...) or the FILTER clause, the crosstab function from the tablefunc extension, and why a dynamic column list needs application code or PL/pgSQL.',
          concepts: ['CASE-based pivots', 'FILTER-based pivots', 'crosstab from tablefunc', 'Dynamic pivots and their limits'],
          quiz: [
            ['How do you pivot monthly totals into 12 columns without an extension?', 'One SUM(amount) FILTER (WHERE month = n) per column.'],
            ['Why cannot plain SQL pivot an unknown set of values?', 'Column names must be known at parse time.'],
          ],
        },
        {
          title: 'Unpivoting with VALUES and LATERAL',
          description: 'Turning wide columns back into rows with CROSS JOIN LATERAL (VALUES (...), (...)), or with unnest over parallel arrays, so metric columns become a tidy (key, value) table for further analysis.',
          concepts: ['LATERAL VALUES unpivot', 'unnest of parallel arrays', 'Preserving types in unpivoted values', 'When to unpivot in SQL versus in code'],
          quiz: [
            ['Write the core of an unpivot for columns q1..q4.', 'CROSS JOIN LATERAL (VALUES (\'q1\', q1), (\'q2\', q2), (\'q3\', q3), (\'q4\', q4)) v(quarter, amount).'],
            ['What must all VALUES rows share?', 'Compatible column types.'],
          ],
          prereqs: ['Arrays and unnest'],
        },
        {
          title: 'INSERT ... ON CONFLICT upserts',
          description: 'ON CONFLICT (key) DO UPDATE SET ... with the EXCLUDED pseudo-table gives atomic upserts, DO NOTHING gives idempotent inserts, and both need a unique index or constraint to arbitrate on.',
          concepts: ['Conflict targets and arbiter indexes', 'EXCLUDED and conditional updates', 'DO NOTHING for idempotent inserts', 'Partial unique indexes as targets'],
          quiz: [
            ['What does EXCLUDED refer to?', 'The row that was proposed for insertion but conflicted.'],
            ['Can ON CONFLICT DO UPDATE update only when data changed?', 'Yes, add WHERE t.col IS DISTINCT FROM EXCLUDED.col to the DO UPDATE clause.'],
          ],
        },
        {
          title: 'The MERGE statement',
          description: 'MERGE (PostgreSQL 15+) matches a source against a target and applies INSERT, UPDATE or DELETE per branch in one statement, which expresses dimension maintenance and SCD loads more readably than separate statements.',
          concepts: ['MERGE syntax and WHEN branches', 'MATCHED, NOT MATCHED and NOT MATCHED BY SOURCE', 'MERGE versus ON CONFLICT', 'Duplicate source rows and MERGE errors'],
          quiz: [
            ['What happens if two source rows match the same target row?', 'MERGE raises an error; deduplicate the source first.'],
            ['Which clause deletes target rows absent from the source?', 'WHEN NOT MATCHED BY SOURCE THEN DELETE (PostgreSQL 17+).'],
          ],
          prereqs: ['INSERT ... ON CONFLICT upserts'],
        },
      ],
    },
    {
      title: 'Query Planning and Performance',
      description: 'Reading plans, feeding the planner good statistics and choosing physical structures for analytical queries.',
      topics: [
        {
          title: 'Reading EXPLAIN ANALYZE',
          description: 'How to read a plan tree from the innermost node outward, compare estimated and actual rows, spot buffers and spills to disk, and use EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) as the first step of every tuning session.',
          concepts: ['Plan tree structure and node costs', 'Estimated versus actual rows', 'BUFFERS and shared hits', 'Sorts, hashes and disk spills', 'auto_explain for production plans'],
          quiz: [
            ['What does a large gap between estimated and actual rows suggest?', 'Stale or missing statistics, or correlated columns the planner cannot model.'],
            ['What does "Sort Method: external merge Disk" mean?', 'The sort exceeded work_mem and spilled to temporary files.'],
          ],
        },
        {
          title: 'Scan and join strategies',
          description: 'Sequential, index, index-only and bitmap scans, and nested loop, hash and merge joins: when the planner picks each, and what row counts and memory settings tip the decision.',
          concepts: ['Seq scan versus index scan crossover', 'Index-only scans and the visibility map', 'Bitmap heap scans', 'Nested loop, hash join and merge join', 'work_mem and hash batches'],
          quiz: [
            ['When is a sequential scan cheaper than an index scan?', 'When the query touches a large fraction of the table, because random I/O per row costs more.'],
            ['What does a hash join need to be fast?', 'The smaller input to fit in work_mem so it builds in one batch.'],
          ],
          prereqs: ['Reading EXPLAIN ANALYZE'],
        },
        {
          title: 'Statistics and row estimates',
          description: 'ANALYZE samples tables into pg_statistic, most-common-values and histograms drive estimates, and CREATE STATISTICS fixes correlated columns and functional dependencies that otherwise mislead the planner by orders of magnitude.',
          concepts: ['ANALYZE and autovacuum thresholds', 'MCV lists and histograms', 'default_statistics_target', 'Extended statistics for correlated columns'],
          quiz: [
            ['Why can city = X AND postcode = Y be badly underestimated?', 'The planner multiplies independent selectivities, but the columns are correlated.'],
            ['Which command creates multivariate statistics?', 'CREATE STATISTICS ... (dependencies, ndistinct, mcv) ON col1, col2 FROM table.'],
          ],
          prereqs: ['Reading EXPLAIN ANALYZE'],
        },
        {
          title: 'Indexing strategies for analytics',
          description: 'Composite index column order, covering indexes with INCLUDE, partial indexes for hot subsets, expression indexes for computed predicates, and BRIN for huge append-only tables where B-trees are too big.',
          concepts: ['Composite index column order', 'Covering indexes with INCLUDE', 'Partial indexes', 'Expression indexes', 'BRIN for append-only data'],
          quiz: [
            ['For WHERE a = 1 ORDER BY b, which composite order helps?', '(a, b), so the index satisfies both the filter and the order.'],
            ['When is BRIN a good choice?', 'On very large tables whose values correlate with physical order, such as timestamps in append-only logs.'],
          ],
          prereqs: ['Scan and join strategies'],
        },
        {
          title: 'Table partitioning and pruning',
          description: 'Declarative range, list and hash partitioning, how partition pruning removes partitions at plan or execution time, partition-wise joins, and the maintenance win of dropping old partitions instead of deleting rows.',
          concepts: ['Range, list and hash partitioning', 'Partition pruning conditions', 'Partition-wise joins and aggregates', 'Attaching and detaching partitions', 'Indexes and constraints on partitions'],
          quiz: [
            ['What must a query contain for pruning to work?', 'A predicate on the partition key that the planner can evaluate, ideally a constant or parameter.'],
            ['How do you delete a month of data instantly?', 'DETACH or DROP that month\'s partition.'],
          ],
          prereqs: ['Indexing strategies for analytics'],
        },
        {
          title: 'Materialised views',
          description: 'Precomputing expensive aggregates into a materialised view, refreshing it fully or CONCURRENTLY with a unique index, and designing incremental refresh by hand when the built-in refresh is too slow.',
          concepts: ['CREATE MATERIALIZED VIEW', 'REFRESH CONCURRENTLY requirements', 'Indexing a materialised view', 'Hand-rolled incremental refresh'],
          quiz: [
            ['What does REFRESH MATERIALIZED VIEW CONCURRENTLY require?', 'A unique index on the view, and it keeps readers unblocked during refresh.'],
            ['Does PostgreSQL refresh materialised views automatically?', 'No, refreshes are explicit or scheduled.'],
          ],
        },
        {
          title: 'Rewriting slow queries',
          description: 'Common rewrites that change plans: making predicates sargable, replacing OR with UNION ALL, turning correlated subqueries into joins or LATERAL, pre-aggregating before joining, and using EXISTS instead of DISTINCT after a join.',
          concepts: ['Sargable predicates', 'OR to UNION ALL', 'Pre-aggregating before joins', 'DISTINCT versus EXISTS', 'LIMIT with ORDER BY and indexes'],
          quiz: [
            ['Why does WHERE date(created_at) = \'2025-01-01\' avoid the index?', 'The function hides the column; use a range predicate on created_at instead.'],
            ['What is a common fix for a query that joins then DISTINCTs?', 'Replace the join with an EXISTS semi-join.'],
          ],
          prereqs: ['Scan and join strategies'],
        },
      ],
    },
    {
      title: 'Transactions and Locking for Pipelines',
      description: 'Loading data safely while readers and other jobs keep running.',
      topics: [
        {
          title: 'Atomic loads with staging and swaps',
          description: 'Loading into a staging table and swapping it in with ALTER TABLE RENAME inside one transaction gives readers an all-or-nothing switch, and truncating instead of deleting keeps the table small and fast.',
          concepts: ['Staging tables and COPY', 'Transactional rename swap', 'TRUNCATE versus DELETE in loads', 'Dependencies that break on rename'],
          quiz: [
            ['Why is TRUNCATE faster than DELETE for a full reload?', 'It deallocates pages instead of marking each row dead, and needs no vacuum.'],
            ['What breaks when you swap tables by renaming?', 'Views, foreign keys and prepared statements bound to the old table OID.'],
          ],
        },
        {
          title: 'Row locks and SKIP LOCKED queues',
          description: 'SELECT ... FOR UPDATE takes row locks that serialise writers; adding SKIP LOCKED lets many workers pull disjoint batches from a job table, which is the standard way to build a work queue in PostgreSQL.',
          concepts: ['FOR UPDATE and FOR SHARE', 'SKIP LOCKED and NOWAIT', 'Claiming a batch with UPDATE ... RETURNING', 'Lock scope and transaction length'],
          quiz: [
            ['What does SKIP LOCKED change?', 'Rows locked by other transactions are skipped rather than waited for.'],
            ['How do you claim 100 pending jobs safely?', 'UPDATE jobs SET status = \'running\' WHERE id IN (SELECT id FROM jobs WHERE status = \'pending\' FOR UPDATE SKIP LOCKED LIMIT 100) RETURNING *.'],
          ],
        },
        {
          title: 'Advisory locks and singleton jobs',
          description: 'pg_advisory_lock and pg_try_advisory_xact_lock coordinate application-level mutual exclusion, so two schedulers cannot run the same load at once and a job can hold a named lock without touching any row.',
          concepts: ['Session versus transaction advisory locks', 'try variants and non-blocking checks', 'Deriving lock keys from job names', 'Releasing locks on failure'],
          quiz: [
            ['What does pg_try_advisory_xact_lock(key) return if the lock is held?', 'false, immediately, without waiting.'],
            ['When is a transaction-level advisory lock released?', 'Automatically at commit or rollback.'],
          ],
        },
        {
          title: 'MVCC, long transactions and bloat',
          description: 'Multi-version concurrency keeps old row versions until no transaction needs them; long-running loads and idle-in-transaction sessions block vacuum, inflate tables and stall index-only scans, so pipeline transactions must stay short.',
          concepts: ['Row versions and xmin/xmax', 'Vacuum and dead tuples', 'Long transactions blocking cleanup', 'Batching large updates', 'Lock queues behind DDL'],
          quiz: [
            ['Why can a single open transaction bloat unrelated tables?', 'Vacuum cannot remove row versions newer than the oldest running transaction snapshot.'],
            ['How should a 100-million-row update be run?', 'In batches by key range, committing each batch.'],
          ],
          prereqs: ['Atomic loads with staging and swaps'],
        },
      ],
    },
    {
      title: 'SQL Style, Testing and Maintainability',
      description: 'Writing SQL that other people, and future you, can read, review and trust.',
      topics: [
        {
          title: 'Formatting and naming conventions',
          description: 'Consistent keyword case, one clause per line, leading commas or trailing commas but not both, snake_case identifiers, explicit aliases and no SELECT *, enforced with a formatter such as sqlfluff so reviews focus on logic.',
          concepts: ['Layout rules for long queries', 'Identifier and alias naming', 'Avoiding SELECT * in pipelines', 'sqlfluff linting and formatting'],
          quiz: [
            ['Why is SELECT * risky in a pipeline query?', 'Column additions or reorders upstream silently change the output shape.'],
            ['What does a SQL linter catch that a formatter does not?', 'Rule violations such as ambiguous columns, unused CTEs and implicit conversions.'],
          ],
        },
        {
          title: 'Structuring queries with CTEs and views',
          description: 'Breaking a 200-line query into named CTE steps that each answer one question, deciding when a step deserves a view or a table, and the readability versus performance trade-off of MATERIALIZED CTEs.',
          concepts: ['One responsibility per CTE', 'Naming intermediate results', 'Views for reuse and access control', 'When to materialise a step'],
          quiz: [
            ['What is a sign a CTE is doing too much?', 'It needs a comment explaining several unrelated filters or joins.'],
            ['When does a view hurt performance?', 'When it hides an expensive join or aggregate that callers repeat many times.'],
          ],
          prereqs: ['Join order and query shape'],
        },
        {
          title: 'Testing SQL',
          description: 'Asserting query results with small fixture tables, checking invariants such as uniqueness, referential completeness and row-count deltas, and using pgTAP or a pytest harness so SQL changes get regression coverage like any code.',
          concepts: ['Fixture tables and known outputs', 'Invariant checks: unique, not null, totals', 'Comparing before and after result sets', 'pgTAP and pytest harnesses'],
          quiz: [
            ['How do you compare two query results for equality in SQL?', 'Use EXCEPT in both directions and assert both are empty.'],
            ['Why test row counts across a transformation?', 'Unexpected fan-out or loss usually means a join key or filter bug.'],
          ],
        },
        {
          title: 'Dynamic SQL and PL/pgSQL safely',
          description: 'DO blocks and functions for loops over partitions or dynamic column lists, EXECUTE with format() and %I/%L quoting to prevent injection, and keeping dynamic SQL to the few cases plain SQL cannot express.',
          concepts: ['DO blocks and simple functions', 'EXECUTE with format() quoting', 'Looping over partitions or tables', 'Limits of dynamic SQL'],
          quiz: [
            ['What do %I and %L do in format()?', '%I quotes an identifier, %L quotes a literal, both safely.'],
            ['Why avoid string concatenation to build SQL?', 'It allows SQL injection and breaks on identifiers needing quotes.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'End-to-end SQL work on realistic data, then the questions interviewers ask about it.',
      style: 'project',
      topics: [
        {
          title: 'Project: web analytics from raw events',
          description: 'Load a clickstream table of page views, sessionise it with a 30-minute timeout, compute daily active users, retention cohorts and funnel conversion with window functions, and expose the results as materialised views refreshed by a script.',
          concepts: ['Load and profile the events', 'Sessionise and compute session metrics', 'Cohort retention with windows', 'Funnel and materialised views'],
          quiz: [
            ['How is a retention cohort defined?', 'Users grouped by first-seen date, tracked for activity in later periods.'],
            ['Why refresh the views concurrently?', 'Dashboards keep reading while the refresh runs.'],
          ],
        },
        {
          title: 'Project: hierarchical reporting',
          description: 'Model an organisation and a bill of materials as parent-child tables, then write recursive CTEs that produce indented org charts, roll up salaries and component costs, detect cycles and expose paths for filtering.',
          concepts: ['Design the hierarchy tables', 'Recursive walk with depth and path', 'Cost and headcount roll-ups', 'Cycle guards and tests'],
          quiz: [
            ['How do you indent an org chart in SQL?', 'repeat(\'  \', depth) || name using the depth from the recursion.'],
            ['What input would loop forever without a guard?', 'A row whose ancestor chain leads back to itself.'],
          ],
        },
        {
          title: 'Project: incremental MERGE pipeline',
          description: 'Build a partitioned fact table fed from a staging table: dedupe the source, MERGE inserts and updates with a change hash, add a partition per month automatically, and measure plans before and after adding indexes.',
          concepts: ['Partitioned target and staging design', 'Deduplicate and hash the source', 'MERGE with change detection', 'Partition management and plan review'],
          quiz: [
            ['Why hash the non-key columns?', 'To detect changed rows cheaply and skip no-op updates.'],
            ['What makes the load idempotent?', 'MERGE on the business key, so reruns change nothing.'],
          ],
        },
        {
          title: 'Project: query tuning lab',
          description: 'Take five deliberately slow queries against a multi-million-row dataset, capture EXPLAIN ANALYZE output, fix each with statistics, indexes, rewrites or partitioning, and document the before-and-after timings and plans.',
          concepts: ['Generate a large realistic dataset', 'Capture baseline plans', 'Apply one fix at a time', 'Write up findings'],
          quiz: [
            ['Why change one thing at a time?', 'So each timing difference can be attributed to a specific fix.'],
            ['What is the first thing to check on a slow plan?', 'Whether estimated and actual row counts agree.'],
          ],
        },
        {
          title: 'Advanced SQL interview questions',
          description: 'The questions that separate candidates: RANK versus DENSE_RANK, window frames, NOT IN with NULLs, when a CTE is materialised, how a hash join works, why an index is ignored, and how to make a load idempotent.',
          concepts: ['Window function questions', 'Join and NULL semantics questions', 'Planner and index questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Explain why an index might be ignored.', 'Low selectivity, a function on the column, stale statistics or a type mismatch.'],
            ['What is the difference between a CTE and a subquery for the planner?', 'Mostly none since PostgreSQL 12 unless the CTE is referenced multiple times or MATERIALIZED.'],
          ],
          style: 'reading',
        },
        {
          title: 'Whiteboard SQL problems',
          description: 'Timed practice on the recurring problems: top-N per group, consecutive-day streaks, running totals, deduplicating with ROW_NUMBER, year-over-year comparisons with LAG, and median with PERCENTILE_CONT.',
          concepts: ['Top-N per group patterns', 'Streaks and consecutive days', 'Dedup with ROW_NUMBER', 'Year-over-year with LAG', 'Median and percentiles'],
          quiz: [
            ['How do you compute a median in PostgreSQL?', 'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value).'],
            ['How do you delete duplicates keeping the newest?', 'Number rows per key by created_at DESC and delete where the number exceeds 1.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
