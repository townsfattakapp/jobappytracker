import { defineTrack } from '../define'

export const pandas = defineTrack({
  id: 'track-pandas',
  title: 'Pandas',
  description: 'Working tabular data in Python: Series and DataFrame anatomy, reading and writing files and databases, loc, iloc and query, missing data and dtypes, string and datetime accessors, groupby, pivot and merge, rolling and resampling, method chaining and the performance habits that keep notebooks fast.',
  family: 'Data Science',
  kind: 'tooling',
  icon: '🐼',
  tags: ['pandas', 'dataframes', 'data wrangling', 'groupby', 'time series', 'python'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-numpy'],
  style: 'code',
  categories: [
    {
      title: 'Series and DataFrame Anatomy',
      description: 'The two objects everything else is built on, and the index that ties them together.',
      topics: [
        {
          title: 'Series: a labelled array',
          description: 'A Series is a numpy array plus an index and a name. Values align by label rather than position in arithmetic, which is why adding two Series with different indexes produces NaN where labels do not match.',
          concepts: ['Series values, index and name', 'Constructing from lists and dicts', 'Label alignment in arithmetic', 'Series methods versus numpy functions'],
          quiz: [
            ['What does pd.Series([1, 2], index=["a", "b"]) + pd.Series([10], index=["b"]) give?', 'a: NaN, b: 12.'],
            ['How do you get the underlying array of a Series?', 's.to_numpy()'],
          ],
        },
        {
          title: 'DataFrame structure and the Index',
          description: 'A DataFrame is a dict-like collection of Series sharing one row index, with column labels along the other axis. The Index is immutable, can be non-unique, and set_index and reset_index move columns in and out of it.',
          concepts: ['Columns as Series sharing an index', 'Index objects and immutability', 'set_index and reset_index', 'Non-unique indexes and their pitfalls'],
          quiz: [
            ['What does df["price"] return?', 'A Series sharing the DataFrame row index.'],
            ['What does reset_index(drop=True) do?', 'Replaces the index with a default RangeIndex without keeping the old one as a column.'],
          ],
          prereqs: ['Series: a labelled array'],
        },
        {
          title: 'Index alignment and reindexing',
          description: 'Every binary operation and assignment aligns on the index first. reindex conforms a frame to a new set of labels with a fill value, and align pairs two frames, which is how pandas avoids position bugs but also how silent NaNs creep in.',
          concepts: ['Alignment on both axes', 'reindex and fill_value', 'align for two frames', 'Assigning a Series into a column aligns by index'],
          quiz: [
            ['Why did assigning a sorted Series to a column not change the order?', 'Assignment aligns by index, so values go back to their original labels.'],
            ['How do you add a Series to a column ignoring the index?', 'Use .to_numpy() on the Series first.'],
          ],
          prereqs: ['DataFrame structure and the Index'],
        },
        {
          title: 'Inspecting a DataFrame',
          description: 'head, tail, sample, info, describe, shape, dtypes, nunique and value_counts give a first picture of any dataset in a minute, and memory_usage(deep=True) reveals the true size of object columns.',
          concepts: ['head, tail and sample', 'info and dtypes', 'describe for numeric and object columns', 'value_counts and nunique'],
          quiz: [
            ['What does df.info() show that df.head() does not?', 'Non-null counts, dtypes and memory usage per column.'],
            ['How do you describe categorical columns too?', 'df.describe(include="all").'],
          ],
          prereqs: ['DataFrame structure and the Index'],
        },
      ],
    },
    {
      title: 'Reading and Writing Data',
      topics: [
        {
          title: 'CSV with read_csv',
          description: 'read_csv has dozens of parameters that matter: sep, header, names, usecols, dtype, parse_dates, na_values, encoding and nrows. Specifying dtypes and usecols up front makes loads faster and prevents silent type guesses.',
          concepts: ['Delimiters, headers and column names', 'usecols and dtype for speed', 'parse_dates and na_values', 'Encodings and bad lines'],
          quiz: [
            ['How do you read only two columns as specific types?', 'pd.read_csv(path, usecols=["a", "b"], dtype={"a": "int32", "b": "string"}).'],
            ['Why did an id column load as float?', 'It contains missing values, and integer dtype cannot hold NaN unless a nullable Int64 dtype is used.'],
          ],
        },
        {
          title: 'Excel, JSON and Parquet',
          description: 'read_excel needs openpyxl and a sheet name, read_json handles records and nested orientations with json_normalize, and Parquet keeps dtypes and compresses well, making it the right interchange format between pipeline steps.',
          concepts: ['read_excel and sheet selection', 'read_json orientations', 'json_normalize for nested records', 'Parquet for typed storage'],
          quiz: [
            ['Why prefer Parquet over CSV between pipeline stages?', 'It stores dtypes, compresses well and reads selected columns quickly.'],
            ['How do you flatten a list of nested JSON records?', 'pd.json_normalize(records).'],
          ],
          prereqs: ['CSV with read_csv'],
        },
        {
          title: 'SQL databases with read_sql and to_sql',
          description: 'read_sql runs a query through a SQLAlchemy engine or DBAPI connection and returns a frame; to_sql writes one with if_exists and chunksize options. Pushing filters into SQL and pulling only needed columns keeps memory in check.',
          concepts: ['Engines and connections', 'read_sql with parameters', 'to_sql and if_exists', 'Filtering in SQL before loading'],
          quiz: [
            ['How do you pass a parameter safely to read_sql?', 'Use the params argument, never string formatting.'],
            ['What does to_sql(if_exists="append") do?', 'Inserts rows into the existing table instead of replacing it.'],
          ],
          prereqs: ['CSV with read_csv'],
        },
        {
          title: 'Large files: chunking and selective loading',
          description: 'chunksize turns read_csv into an iterator of frames so you can aggregate a file that does not fit in memory; category and smaller numeric dtypes shrink what does fit, and pyarrow engines speed up parsing.',
          concepts: ['chunksize iteration', 'Aggregating chunk by chunk', 'Shrinking dtypes on load', 'The pyarrow engine'],
          quiz: [
            ['How do you sum a column across a file too big for memory?', 'sum(chunk["x"].sum() for chunk in pd.read_csv(path, chunksize=100_000)).'],
            ['Which dtype shrinks a low-cardinality string column most?', 'category.'],
          ],
          prereqs: ['CSV with read_csv'],
        },
      ],
    },
    {
      title: 'Selecting and Filtering',
      topics: [
        {
          title: 'loc versus iloc',
          description: 'loc selects by label and includes the end of a slice; iloc selects by integer position and excludes it. Both take row and column selectors and both are the only safe way to assign into a subset.',
          concepts: ['Label-based loc', 'Position-based iloc', 'Slice end inclusivity', 'Selecting rows and columns together'],
          quiz: [
            ['Does df.loc["a":"c"] include row c?', 'Yes, label slices are inclusive.'],
            ['How do you get the first three rows and last column?', 'df.iloc[:3, -1]'],
          ],
        },
        {
          title: 'Boolean indexing and masks',
          description: 'A comparison on a column gives a boolean Series that filters rows; combine with &, | and ~ in parentheses, use isin for membership and between for ranges, and remember that the mask aligns on the index, not position.',
          concepts: ['Boolean Series as row filters', 'Combining conditions with & and |', 'isin and between', 'Masks align on the index'],
          quiz: [
            ['Why does df[df.a > 1 & df.b < 5] raise?', 'Operator precedence: & binds before the comparisons; add parentheses.'],
            ['Select rows where city is one of three values?', 'df[df["city"].isin(["NYC", "LA", "SF"])]'],
          ],
          prereqs: ['loc versus iloc'],
        },
        {
          title: 'query and eval',
          description: 'df.query("fare > 10 and payment == @card") filters with a readable expression and @ references local variables; eval computes new columns from expressions. With the numexpr engine both can beat chained operators on large frames.',
          concepts: ['query expression syntax', 'Referencing variables with @', 'eval for computed columns', 'Backticks for awkward column names'],
          quiz: [
            ['How do you reference a Python variable inside query?', 'Prefix it with @, as in query("x > @threshold").'],
            ['How do you query a column named "total price"?', 'Wrap it in backticks: query("`total price` > 10").'],
          ],
          prereqs: ['Boolean indexing and masks'],
        },
        {
          title: 'Adding and deriving columns',
          description: 'Assigning a Series, scalar or array creates or replaces a column; assign returns a new frame and fits in chains; np.where, mask and where implement conditional columns; and drop and rename tidy up afterwards.',
          concepts: ['Column assignment semantics', 'assign for new columns in chains', 'Conditional columns with np.where', 'drop and rename'],
          quiz: [
            ['How do you add a column inside a method chain?', 'df.assign(total=lambda d: d.price * d.qty).'],
            ['What does df.where(df > 0) do?', 'Keeps values where the condition is True and sets the rest to NaN.'],
          ],
          prereqs: ['loc versus iloc'],
        },
        {
          title: 'Chained indexing and SettingWithCopy',
          description: 'df[mask]["col"] = value may modify a temporary copy, so pandas warns. The fix is a single loc call, df.loc[mask, "col"] = value. Copy-on-write in pandas 2 and 3 makes the rule strict: chained assignment never writes through.',
          concepts: ['Why chained indexing is ambiguous', 'The SettingWithCopyWarning', 'Single loc assignment', 'Behaviour under copy-on-write'],
          quiz: [
            ['How do you set fare to 0 where distance is 0?', 'df.loc[df["distance"] == 0, "fare"] = 0'],
            ['What does chained assignment do under copy-on-write?', 'Nothing to the original frame; it writes to a temporary.'],
          ],
          prereqs: ['Adding and deriving columns'],
        },
      ],
    },
    {
      title: 'Missing Data and Types',
      topics: [
        {
          title: 'Missing value sentinels: NaN, None, NaT and NA',
          description: 'Float columns use np.nan, object columns may hold None, datetimes use NaT, and the nullable dtypes use pd.NA which propagates through comparisons as unknown. Knowing which sentinel you have explains why == None never works.',
          concepts: ['np.nan in float columns', 'None in object columns', 'NaT for datetimes', 'pd.NA and three-valued logic'],
          quiz: [
            ['Why does df[df.x == np.nan] return nothing?', 'NaN is not equal to anything; use isna().'],
            ['What is pd.NA > 1?', 'pd.NA, the comparison is unknown.'],
          ],
        },
        {
          title: 'isna, dropna and fillna',
          description: 'isna and notna build masks, dropna removes rows or columns with thresholds and subsets, fillna fills with a scalar, a per-column dict or a method. Which to use is a modelling decision, not a syntax one.',
          concepts: ['isna and notna masks', 'dropna with subset and thresh', 'fillna with scalars and dicts', 'ffill and bfill'],
          quiz: [
            ['Drop rows missing either of two specific columns?', 'df.dropna(subset=["a", "b"]).'],
            ['How do you fill each column with its own median?', 'df.fillna(df.median(numeric_only=True)).'],
          ],
          prereqs: ['Missing value sentinels: NaN, None, NaT and NA'],
        },
        {
          title: 'Interpolation and time-aware filling',
          description: 'interpolate fills gaps linearly, by time, or with polynomial and spline methods, and limit and limit_direction bound how far a fill may travel. For sensor and price data it is usually better than a constant.',
          concepts: ['Linear interpolation', 'method="time" on datetime indexes', 'limit and limit_direction', 'When interpolation is misleading'],
          quiz: [
            ['When does method="time" differ from linear?', 'When observations are unevenly spaced; it weights by actual elapsed time.'],
            ['How do you stop a forward fill after two rows?', 'ffill(limit=2).'],
          ],
          prereqs: ['isna, dropna and fillna'],
        },
        {
          title: 'dtypes, astype and nullable types',
          description: 'Every column has one dtype; astype converts, to_numeric and to_datetime coerce with errors handling, and the nullable Int64, boolean and string dtypes allow missing values without falling back to float or object.',
          concepts: ['astype conversions', 'to_numeric with errors="coerce"', 'Nullable Int64, boolean and string', 'Arrow-backed dtypes'],
          quiz: [
            ['How do you convert a messy numeric column, turning bad values into NaN?', 'pd.to_numeric(s, errors="coerce").'],
            ['Which dtype holds integers with missing values?', '"Int64" (capital I), the nullable integer dtype.'],
          ],
          prereqs: ['Missing value sentinels: NaN, None, NaT and NA'],
        },
        {
          title: 'Categorical data',
          description: 'The category dtype stores codes plus a lookup of categories, cutting memory for repeated strings and enabling ordered comparisons and sorting by a defined order. cut and qcut produce categoricals from numeric bins.',
          concepts: ['category dtype and codes', 'Ordered categories', 'Adding and removing categories', 'cut and qcut binning'],
          quiz: [
            ['How do you make sizes sort S, M, L rather than alphabetically?', 'pd.Categorical(s, categories=["S", "M", "L"], ordered=True).'],
            ['Difference between cut and qcut?', 'cut uses fixed-width or given edges; qcut uses quantiles for equal-count bins.'],
          ],
          prereqs: ['dtypes, astype and nullable types'],
        },
      ],
    },
    {
      title: 'Strings and Datetimes',
      topics: [
        {
          title: 'The .str accessor',
          description: 'Vectorised string methods: lower, strip, replace, contains, startswith, split with expand, len, pad and slicing, all NaN-aware. They replace apply(lambda) for text columns and read as a pipeline.',
          concepts: ['Case and whitespace methods', 'contains, startswith and match', 'split with expand=True', 'String slicing and padding'],
          quiz: [
            ['How do you split "first last" into two columns?', 's.str.split(" ", expand=True).'],
            ['Does s.str.contains("a|b") use regex?', 'Yes by default; pass regex=False for literal matching.'],
          ],
        },
        {
          title: 'Regex extraction and cleaning',
          description: 'str.extract pulls capture groups into columns, str.extractall handles repeats, str.replace with regex normalises formats, and str.findall returns lists. Together they parse product codes, phone numbers and log lines without loops.',
          concepts: ['extract with named groups', 'extractall for multiple matches', 'Regex replace', 'findall and list columns'],
          quiz: [
            ['Extract a 4-digit year into a new column?', 's.str.extract(r"(\\d{4})").'],
            ['What does extract return with two groups?', 'A DataFrame with one column per group.'],
          ],
          prereqs: ['The .str accessor'],
        },
        {
          title: 'to_datetime and the .dt accessor',
          description: 'to_datetime parses strings with format and errors options and is far faster with an explicit format; the .dt accessor then exposes year, month, dayofweek, hour, date and strftime for feature building and grouping.',
          concepts: ['Parsing with an explicit format', 'errors="coerce" for bad dates', 'dt components and dayofweek', 'strftime for display'],
          quiz: [
            ['Why pass format to to_datetime?', 'It avoids per-value inference and is much faster and less ambiguous.'],
            ['How do you get the weekday name?', 's.dt.day_name()'],
          ],
          prereqs: ['The .str accessor'],
        },
        {
          title: 'Time zones, periods and timedeltas',
          description: 'tz_localize attaches a zone, tz_convert changes it, Period represents a month or quarter as a whole, and Timedelta arithmetic gives durations and offsets such as business days for date maths that respects calendars.',
          concepts: ['tz_localize versus tz_convert', 'Period and to_period', 'Timedelta arithmetic', 'DateOffset and business days'],
          quiz: [
            ['What is the difference between tz_localize and tz_convert?', 'localize assigns a zone to naive times; convert changes an aware time to another zone.'],
            ['How do you get the month of each timestamp as a period?', 's.dt.to_period("M")'],
          ],
          prereqs: ['to_datetime and the .dt accessor'],
        },
      ],
    },
    {
      title: 'Grouping and Aggregation',
      topics: [
        {
          title: 'groupby mechanics: split, apply, combine',
          description: 'groupby splits rows by key values into groups, applies a function to each, and combines the results with the keys as index. Understanding the GroupBy object, its lazy nature and iteration explains every method built on it.',
          concepts: ['Split-apply-combine model', 'The lazy GroupBy object', 'Iterating over groups', 'as_index and sort options'],
          quiz: [
            ['What does df.groupby("city") return before an aggregation?', 'A lazy GroupBy object, not a DataFrame.'],
            ['How do you keep the key as a column instead of the index?', 'groupby("city", as_index=False) or reset_index().'],
          ],
        },
        {
          title: 'agg and named aggregations',
          description: 'agg takes a function, a list of functions or a dict per column, and named aggregation syntax total=("fare", "sum") gives clean column names without a MultiIndex. Built-in string names run in Cython and beat lambdas.',
          concepts: ['agg with lists and dicts', 'Named aggregation syntax', 'Multiple statistics per column', 'Built-in versus lambda aggregations'],
          quiz: [
            ['Compute mean fare and trip count per zone with clean names?', 'groupby("zone").agg(mean_fare=("fare", "mean"), trips=("fare", "size")).'],
            ['Why prefer "mean" to lambda s: s.mean()?', 'The string dispatches to a fast Cython path.'],
          ],
          prereqs: ['groupby mechanics: split, apply, combine'],
        },
        {
          title: 'transform for group-wise broadcasting',
          description: 'transform returns a result the same length as the input, aligned to the original rows, which is how you add a group mean as a column, compute within-group z-scores or fill missing values with the group median.',
          concepts: ['transform returns same-length results', 'Group means as new columns', 'Within-group normalisation', 'Group-wise fillna'],
          quiz: [
            ['Add each row\'s share of its group total?', 'df["share"] = df["x"] / df.groupby("g")["x"].transform("sum").'],
            ['Difference between agg and transform?', 'agg returns one row per group; transform returns one value per original row.'],
          ],
          prereqs: ['agg and named aggregations'],
        },
        {
          title: 'filter, apply and custom group functions',
          description: 'filter keeps whole groups that satisfy a predicate, apply runs an arbitrary function per group DataFrame and is the slow, flexible fallback; head, nth, first and last cover the common "top of each group" needs faster.',
          concepts: ['filter to keep whole groups', 'apply on group DataFrames', 'head, nth, first and last per group', 'Cost of apply versus built-ins'],
          quiz: [
            ['Keep only customers with more than five orders?', 'df.groupby("customer").filter(lambda g: len(g) > 5).'],
            ['Get the top 3 rows of each group by amount?', 'df.sort_values("amount", ascending=False).groupby("g").head(3).'],
          ],
          prereqs: ['transform for group-wise broadcasting'],
        },
        {
          title: 'Multiple keys and MultiIndex results',
          description: 'Grouping by several columns yields a MultiIndex; selecting from it uses tuples, xs and level names, and unstack turns an inner level into columns. Grouping by a function, a Series or pd.Grouper(freq=) handles derived keys.',
          concepts: ['Grouping by several columns', 'Selecting from a MultiIndex', 'unstack to widen results', 'Grouping by functions and Grouper'],
          quiz: [
            ['How do you turn groupby(["year", "month"]).sum() into a year by month table?', 'Call .unstack("month").'],
            ['Group daily data by month without a resample?', 'groupby(pd.Grouper(key="date", freq="M")).'],
          ],
          prereqs: ['agg and named aggregations'],
        },
      ],
    },
    {
      title: 'Reshaping and Merging',
      topics: [
        {
          title: 'pivot and pivot_table',
          description: 'pivot reshapes unique long rows into a wide table; pivot_table aggregates duplicates with aggfunc, adds margins and fills missing cells. Cross-tabulations for reports and features for models both come from here.',
          concepts: ['pivot for unique index-column pairs', 'pivot_table and aggfunc', 'margins and fill_value', 'crosstab for counts'],
          quiz: [
            ['When does pivot raise and pivot_table not?', 'When index-column pairs repeat; pivot_table aggregates them.'],
            ['Count passengers by class and sex?', 'pd.crosstab(df["class"], df["sex"]).'],
          ],
        },
        {
          title: 'melt: wide to long',
          description: 'melt unpivots columns into variable and value rows, which is the shape plotting libraries and groupby want. id_vars keep identifiers, value_vars pick the columns, and var_name and value_name label the result.',
          concepts: ['Wide and long formats', 'id_vars and value_vars', 'Naming variable and value columns', 'wide_to_long for patterned columns'],
          quiz: [
            ['Why melt before plotting with seaborn?', 'seaborn expects one row per observation with a column for the variable.'],
            ['What does melt do with id_vars?', 'Repeats them for every melted column.'],
          ],
          prereqs: ['pivot and pivot_table'],
        },
        {
          title: 'stack, unstack and MultiIndex columns',
          description: 'stack moves the innermost column level into the row index and unstack does the reverse, which converts between long groupby output and wide tables. Flattening MultiIndex columns keeps downstream code simple.',
          concepts: ['stack and unstack levels', 'Round-tripping groupby output', 'Flattening MultiIndex columns', 'swaplevel and sort_index'],
          quiz: [
            ['What does unstack() do to a Series with a two-level index?', 'Moves the inner level into columns, giving a DataFrame.'],
            ['How do you flatten two-level columns?', 'df.columns = ["_".join(c) for c in df.columns].'],
          ],
          prereqs: ['melt: wide to long'],
        },
        {
          title: 'concat: stacking frames',
          description: 'concat glues frames along rows or columns, aligns on the other axis, and accepts keys to label the source. ignore_index resets the result index, and appending in a loop should become one concat of a list.',
          concepts: ['Row and column concatenation', 'Alignment and outer versus inner join', 'keys and ignore_index', 'Collecting frames then concatenating once'],
          quiz: [
            ['How do you stack monthly files vertically with a fresh index?', 'pd.concat(frames, ignore_index=True).'],
            ['Why does concat produce NaN columns?', 'Frames had different columns and the default join is outer.'],
          ],
          prereqs: ['pivot and pivot_table'],
        },
        {
          title: 'merge: SQL-style joins',
          description: 'merge joins on columns or indexes with how=inner, left, right, outer and cross, suffixes for clashing names, and indicator to see where each row came from. Join logic itself is the SQL track; here it is the pandas API and its traps.',
          concepts: ['on, left_on and right_on', 'how: inner, left, outer, cross', 'suffixes for overlapping columns', 'indicator for diagnostics'],
          quiz: [
            ['Which rows does a left merge keep?', 'All rows from the left frame, with NaN where the right has no match.'],
            ['How do you see which rows failed to match?', 'merge(..., how="outer", indicator=True) and filter _merge.'],
          ],
          prereqs: ['concat: stacking frames'],
        },
        {
          title: 'Validating joins and avoiding row explosions',
          description: 'A many-to-many key silently multiplies rows. validate="one_to_one" or "many_to_one" raises instead, duplicated checks on keys before merging, and merge_asof matches on the nearest key for time-ordered joins.',
          concepts: ['validate argument', 'Checking key uniqueness first', 'Row count checks after a merge', 'merge_asof for nearest-time joins'],
          quiz: [
            ['How do you guarantee a lookup join does not add rows?', 'merge(..., validate="many_to_one") and compare len before and after.'],
            ['What does merge_asof do?', 'Joins each left row to the most recent right row at or before its key.'],
          ],
          prereqs: ['merge: SQL-style joins'],
        },
      ],
    },
    {
      title: 'Time Series and Window Operations',
      topics: [
        {
          title: 'DatetimeIndex and partial string slicing',
          description: 'With a DatetimeIndex you can slice by "2024-03" or "2024-03-01":"2024-03-15", select with loc on dates, and use date_range and asfreq to create or regularise a calendar. Sorting the index first is required for slicing to work.',
          concepts: ['Building a DatetimeIndex', 'Partial string indexing', 'date_range and frequencies', 'asfreq to regularise'],
          quiz: [
            ['Select all rows in March 2024?', 'df.loc["2024-03"]'],
            ['What does asfreq("D") do to a series with gaps?', 'Reindexes to daily timestamps, inserting NaN for missing days.'],
          ],
          prereqs: [],
        },
        {
          title: 'resample: changing frequency',
          description: 'resample groups a time index into regular bins and aggregates them, downsampling minutes to hours or upsampling days to hours with a fill. label and closed decide which edge a bin is named after; origin and offset shift the grid.',
          concepts: ['Downsampling with aggregation', 'Upsampling and filling', 'label and closed edges', 'Multiple aggregations per bin'],
          quiz: [
            ['Monthly total from daily sales?', 'daily.resample("MS").sum() (or "ME" for month end).'],
            ['Difference between resample and groupby(Grouper)?', 'Nearly none; resample is a time-aware convenience over the same machinery.'],
          ],
          prereqs: ['DatetimeIndex and partial string slicing'],
        },
        {
          title: 'rolling windows',
          description: 'rolling(n) computes statistics over a sliding window of n rows or a time span like "7D"; min_periods controls the warm-up, center aligns the window, and win_type adds weights. Moving averages and rolling volatility come from here.',
          concepts: ['Fixed-count and time-based windows', 'min_periods and center', 'Rolling mean, std and custom functions', 'Rolling correlations between columns'],
          quiz: [
            ['7-day rolling mean on irregular timestamps?', 'df.rolling("7D", on="date")["x"].mean() with a sorted date column.'],
            ['Why are the first rows NaN after rolling(5)?', 'Fewer than min_periods (default 5) observations exist yet.'],
          ],
          prereqs: ['DatetimeIndex and partial string slicing'],
        },
        {
          title: 'expanding and exponentially weighted windows',
          description: 'expanding grows the window from the start for running totals and running records; ewm weights recent values more with a span or halflife, producing smoother and more responsive averages than a fixed window.',
          concepts: ['expanding for cumulative statistics', 'ewm span and halflife', 'EWMA versus simple moving average', 'adjust and bias parameters'],
          quiz: [
            ['Running maximum of a series?', 's.expanding().max() or s.cummax().'],
            ['What does span=10 mean in ewm?', 'A decay equivalent to a 10-period window; alpha = 2 / (span + 1).'],
          ],
          prereqs: ['rolling windows'],
        },
        {
          title: 'shift, diff and pct_change',
          description: 'shift moves values by rows or by a time offset for lags and leads, diff subtracts the shifted value, and pct_change computes returns. Lags within groups need groupby first, or values leak across entities.',
          concepts: ['Lags and leads with shift', 'diff for changes', 'pct_change for returns', 'Group-wise shifts'],
          quiz: [
            ['Previous day\'s value per stock?', 'df.groupby("ticker")["close"].shift(1).'],
            ['What is the first value of pct_change()?', 'NaN, because there is no previous value.'],
          ],
          prereqs: ['DatetimeIndex and partial string slicing'],
        },
      ],
    },
    {
      title: 'Performance and Style',
      topics: [
        {
          title: 'apply versus vectorisation',
          description: 'apply with a Python function runs a loop in disguise; the same logic with column arithmetic, np.where, str and dt accessors or map on a dict is usually 10 to 100 times faster. apply stays for genuinely row-wise logic with no vector form.',
          concepts: ['Why row-wise apply is slow', 'Rewriting apply with column operations', 'map with dicts and Series', 'When apply is still right'],
          quiz: [
            ['Replace df.apply(lambda r: r.a * r.b, axis=1)?', 'df["a"] * df["b"]'],
            ['Fast way to map codes to labels?', 's.map(lookup_dict).'],
          ],
        },
        {
          title: 'Method chaining and pipe',
          description: 'Chains of assign, query, rename, pipe and groupby read top to bottom like a recipe and avoid intermediate variables. pipe inserts custom functions into the chain, and parentheses let the chain span lines.',
          concepts: ['Chains inside parentheses', 'assign and query in chains', 'pipe for custom steps', 'Debugging a chain'],
          quiz: [
            ['How do you use a custom function in a chain?', '.pipe(my_function, extra_arg).'],
            ['Why prefer chains over df1, df2, df3?', 'No stale intermediates, clearer intent and easier reordering.'],
          ],
          prereqs: ['apply versus vectorisation'],
        },
        {
          title: 'Copy-on-write',
          description: 'Copy-on-write makes every derived object behave like a copy while sharing memory until a write happens. It removes SettingWithCopy ambiguity, makes chained assignment a no-op and is the default in pandas 3.',
          concepts: ['Lazy copies and shared buffers', 'Enabling and checking the option', 'Chained assignment under CoW', 'Migration checklist'],
          quiz: [
            ['How do you enable copy-on-write in pandas 2?', 'pd.options.mode.copy_on_write = True'],
            ['Under CoW, does df2 = df[["a"]] copy immediately?', 'No, it shares data until either object is modified.'],
          ],
          prereqs: ['Method chaining and pipe'],
        },
        {
          title: 'Memory usage and dtype tuning',
          description: 'memory_usage(deep=True) shows where bytes go; downcasting numbers, converting repeated strings to category, using Arrow string dtype and dropping unused columns typically cut a frame by two thirds before any bigger tool is needed.',
          concepts: ['memory_usage deep', 'Downcasting numeric columns', 'category and Arrow strings', 'Dropping columns early'],
          quiz: [
            ['Why does an object column use so much memory?', 'Each value is a separate Python string object with its own overhead.'],
            ['How do you downcast floats automatically?', 'pd.to_numeric(s, downcast="float").'],
          ],
          prereqs: ['Copy-on-write'],
        },
        {
          title: 'Plotting from DataFrames',
          description: 'df.plot wraps matplotlib: kind=line, bar, hist, box, scatter and area, with subplots, secondary_y and figsize. It is the fastest way to look at data during analysis; polished charts belong in the visualisation track.',
          concepts: ['df.plot kinds', 'Plotting groupby and pivot output', 'subplots and secondary_y', 'Returning the Axes for tweaks'],
          quiz: [
            ['Plot monthly totals as bars?', 'monthly.plot(kind="bar") or monthly.plot.bar().'],
            ['How do you add a title after df.plot?', 'Capture the Axes and call ax.set_title("...").'],
          ],
          prereqs: ['Method chaining and pipe'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: NYC taxi trip analysis',
          description: 'Load a month of yellow taxi trips from Parquet, fix dtypes and impossible values, compute revenue and tip rate per hour and pickup zone with groupby, join the zone lookup table, resample to daily demand and plot the weekly pattern.',
          concepts: ['Load Parquet with selected columns', 'Clean impossible fares and distances', 'Group by hour and zone', 'Join zone names and plot'],
          quiz: [
            ['How do you compute tip rate safely when fare can be zero?', 'Filter fare > 0 first or use np.where to avoid division by zero.'],
            ['Which join validates that zone lookup adds no rows?', 'merge(..., how="left", validate="many_to_one").'],
          ],
          style: 'project',
        },
        {
          title: 'Project: retail transactions to customer table',
          description: 'From an online retail transaction log, remove cancellations, build per-customer recency, frequency and monetary features with groupby and transform, segment customers with qcut, and pivot monthly revenue by country for a report.',
          concepts: ['Filter cancellations and returns', 'RFM features per customer', 'Segment with qcut', 'Monthly revenue pivot by country'],
          quiz: [
            ['How do you compute recency per customer?', 'reference_date minus groupby("customer")["date"].max().'],
            ['Why use qcut for RFM scores?', 'It assigns equal-count quintiles so scores are comparable across skewed metrics.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Titanic feature table',
          description: 'Turn the Titanic passenger list into a model-ready table: extract titles from names with regex, impute ages by title median with transform, build family size and cabin deck features, encode categoricals and write Parquet.',
          concepts: ['Extract titles with str.extract', 'Impute age by group median', 'Family and deck features', 'Encode and export'],
          quiz: [
            ['Impute age by the median of the same title?', 'df["age"].fillna(df.groupby("title")["age"].transform("median")).'],
            ['Why write Parquet rather than CSV at the end?', 'Category and datetime dtypes survive the round trip.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: air quality time series',
          description: 'Combine hourly air quality files from several stations with concat, parse timestamps with time zones, regularise gaps with asfreq and interpolate, compute 24-hour rolling PM2.5 and monthly resamples, and flag exceedance episodes per station.',
          concepts: ['Concatenate station files with keys', 'Parse and localise timestamps', 'Regularise and interpolate gaps', 'Rolling and monthly summaries'],
          quiz: [
            ['How do you compute a 24-hour rolling mean per station?', 'df.groupby("station")["pm25"].rolling("24h").mean() on a datetime index.'],
            ['Why localise timestamps before combining stations?', 'Stations in different zones would otherwise misalign by hours.'],
          ],
          style: 'project',
        },
        {
          title: 'Pandas interview questions',
          description: 'What gets asked: loc versus iloc, how groupby works, merge types and duplicate keys, why apply is slow, how to handle missing data, the SettingWithCopy warning and copy-on-write, and how you would profile a slow notebook.',
          concepts: ['Indexing and alignment questions', 'groupby and merge questions', 'Performance questions', 'Missing data strategy questions'],
          quiz: [
            ['What happens when merge keys are duplicated on both sides?', 'A many-to-many join multiplies rows for each matching pair.'],
            ['Why is df.apply(f, axis=1) slow?', 'It builds a Series per row and calls Python for each one.'],
          ],
          style: 'reading',
        },
        {
          title: 'Pandas coding exercises',
          description: 'Timed tasks from screens: second-highest salary per department, running total per customer, sessions from timestamp gaps, top-n per group, wide to long conversion and a deduplication that keeps the latest record.',
          concepts: ['Top-n per group', 'Running totals with cumsum in groups', 'Sessionising with diff and cumsum', 'Deduplicate keeping the latest'],
          quiz: [
            ['Keep the latest row per user?', 'df.sort_values("ts").drop_duplicates("user", keep="last").'],
            ['Start a new session when the gap exceeds 30 minutes?', '(df.ts.diff() > pd.Timedelta("30min")).cumsum()'],
          ],
        },
      ],
    },
  ],
})
