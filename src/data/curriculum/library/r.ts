import { defineTrack } from '../define'

export const r = defineTrack({
  id: 'track-r',
  title: 'R',
  description: 'R the way analysts and statisticians use it: vectors, data frames and factors, the tidyverse with dplyr, tidyr and ggplot2, functions and purrr, R Markdown and Quarto reports, statistical modelling, S3 and R6 objects, testthat, CRAN packages, buildable analysis projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '📊',
  tags: ['r', 'tidyverse', 'statistics', 'data-analysis', 'ggplot2', 'quarto', 'cran'],
  languages: ['R'],
  explainMode: 'concept',
  code: { label: 'R', id: 'r', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'R, RStudio or Positron, a project folder and reproducible package installs.',
      topics: [
        {
          title: 'Installing R, RStudio and Positron',
          description: 'Installing R from CRAN, choosing RStudio or Positron as the IDE, the console versus scripts, and why the working directory and .Rprofile shape every session.',
          concepts: ['Installing R from CRAN', 'RStudio and Positron', 'Console versus scripts', 'Working directory and .Rprofile'],
          quiz: [
            ['Which function prints the working directory?', 'getwd()'],
            ['What does R.version.string report?', 'The installed R version.'],
          ],
        },
        {
          title: 'Packages, CRAN and library()',
          description: 'install.packages from CRAN, library versus require, the :: operator for a single function, checking loaded packages, and installing from GitHub with remotes or pak.',
          concepts: ['install.packages and CRAN mirrors', 'library, require and ::', 'sessionInfo and namespaces', 'Installing from GitHub with pak'],
          quiz: [
            ['What does dplyr::filter() do differently from filter()?', 'It calls the dplyr version explicitly, avoiding masking by stats::filter.'],
            ['Difference between library and require?', 'library errors when the package is missing; require returns FALSE.'],
          ],
          prereqs: ['Installing R, RStudio and Positron'],
        },
        {
          title: 'Projects and reproducible environments with renv',
          description: 'RStudio projects and the here package for stable paths, renv to snapshot package versions into a lockfile, and restoring the same environment on another machine.',
          concepts: ['RStudio projects and here::here()', 'renv::init and snapshot', 'renv.lock and restore', 'Avoiding setwd()'],
          quiz: [
            ['What does renv::snapshot() write?', 'renv.lock, recording exact package versions.'],
            ['Why use here("data", "raw.csv")?', 'It resolves from the project root regardless of the current directory.'],
          ],
          prereqs: ['Packages, CRAN and library()'],
        },
        {
          title: 'Getting help and reading documentation',
          description: 'The ? and ?? operators, vignettes, examples(), reading function signatures and argument matching rules, and the tidyverse and CRAN task views for finding packages.',
          concepts: ['? and ?? help', 'Vignettes and example()', 'Argument matching rules', 'CRAN task views'],
          quiz: [
            ['What does vignette("dplyr") open?', 'The long-form tutorial shipped with the package.'],
            ['Can arguments be matched by partial name?', 'Yes, but full names are safer and clearer.'],
          ],
        },
      ],
    },
    {
      title: 'Vectors and Basic Types',
      topics: [
        {
          title: 'Atomic vectors and vectorisation',
          description: 'Everything in R is a vector: logical, integer, double and character types, c() to combine, coercion rules, vectorised arithmetic and recycling of shorter vectors.',
          concepts: ['Atomic vector types', 'c() and coercion hierarchy', 'Vectorised arithmetic', 'Recycling rules', 'Assignment with <-'],
          quiz: [
            ['What is the type of c(1, "a", TRUE)?', 'character, because coercion goes to the most flexible type.'],
            ['What does 1:6 + 1:2 give?', '2 3 4 5 6 7, with the shorter vector recycled.'],
          ],
        },
        {
          title: 'Indexing and subsetting vectors',
          description: 'Positive, negative and logical indexing, names, which(), the difference between [ and [[, and how NA propagates through subsetting and comparisons.',
          concepts: ['Positive and negative indices', 'Logical subsetting', 'Named vectors', '[ versus [[', 'NA in comparisons'],
          quiz: [
            ['What does x[-1] return?', 'Everything except the first element.'],
            ['What is NA == NA?', 'NA; use is.na() to test for missing values.'],
          ],
          prereqs: ['Atomic vectors and vectorisation'],
        },
        {
          title: 'Missing values, NULL and special numbers',
          description: 'NA versus NULL versus NaN, na.rm arguments, Inf and -Inf, integer overflow to NA, and floating-point comparison with all.equal.',
          concepts: ['NA, NULL and NaN', 'na.rm in summaries', 'Inf and integer overflow', 'all.equal for floating point'],
          quiz: [
            ['What does mean(c(1, NA)) return?', 'NA, unless na.rm = TRUE.'],
            ['Is 0.1 + 0.2 == 0.3 TRUE in R?', 'No; use all.equal or isTRUE(all.equal()).'],
          ],
        },
        {
          title: 'Factors',
          description: 'Categorical data stored as integer codes with levels, controlling level order for models and plots, forcats helpers like fct_relevel and fct_lump, and the string-to-factor traps.',
          concepts: ['Levels and integer codes', 'Ordering levels', 'forcats helpers', 'Factor traps when converting'],
          quiz: [
            ['What does as.numeric(factor(c("10", "20"))) return?', 'The codes 1 2, not 10 20; convert via as.character first.'],
            ['Which level is the reference in a regression?', 'The first level.'],
          ],
          prereqs: ['Atomic vectors and vectorisation'],
        },
        {
          title: 'Lists and attributes',
          description: 'Lists as vectors of anything, nested lists, str() to inspect, attributes like names, dim and class, and how matrices are vectors with a dim attribute.',
          concepts: ['Creating and accessing lists', 'str() for inspection', 'Attributes and class', 'Matrices as vectors with dim', 'Arrays and apply'],
          quiz: [
            ['What does lst$a return when a is absent?', 'NULL.'],
            ['What makes a matrix different from a vector?', 'A dim attribute of length two.'],
          ],
          prereqs: ['Indexing and subsetting vectors'],
        },
        {
          title: 'Operators, conditions and loops',
          description: 'Vectorised & and | versus scalar && and ||, ifelse and dplyr::if_else, if/else, for and while loops, seq_along, and why vectorised code replaces most loops.',
          concepts: ['& versus &&', 'ifelse and if_else', 'if, for and while', 'seq_along and seq_len', 'Pre-allocating in loops'],
          quiz: [
            ['Why use seq_along(x) instead of 1:length(x)?', 'It gives an empty sequence when x is empty instead of 1:0.'],
            ['What does ifelse(x > 0, "pos", "neg") return?', 'A vector the same length as x.'],
          ],
          prereqs: ['Indexing and subsetting vectors'],
        },
      ],
    },
    {
      title: 'Functions and Functional Programming',
      topics: [
        {
          title: 'Writing functions',
          description: 'function() and the shorthand \\(x), default arguments, lazy evaluation, return values as the last expression, the ... argument, and lexical scoping.',
          concepts: ['function() and \\(x) shorthand', 'Default and lazy arguments', 'Dots ...', 'Lexical scoping', 'Returning invisibly'],
          quiz: [
            ['When is a default argument evaluated?', 'Lazily, only when it is first used.'],
            ['What does invisible(x) do?', 'Returns x without printing at the console.'],
          ],
        },
        {
          title: 'Environments and closures',
          description: 'Functions capture their defining environment, function factories and counters, <<- for modifying enclosing variables, and why global assignment is a smell.',
          concepts: ['Function environments', 'Function factories', '<<- assignment', 'Avoiding global state'],
          quiz: [
            ['What does <<- do?', 'Assigns in the nearest enclosing environment where the name exists, or global.'],
            ['Why do function factories work?', 'Each call creates a new environment captured by the returned function.'],
          ],
          prereqs: ['Writing functions'],
        },
        {
          title: 'The pipe operator',
          description: 'The native |> pipe and magrittr %>%, placeholder _ and ., when a pipeline reads better than nesting, and pipe-friendly function design with data first.',
          concepts: ['|> versus %>%', 'Placeholders _ and .', 'Data-first function design', 'When not to pipe'],
          quiz: [
            ['What does x |> f(y) expand to?', 'f(x, y)'],
            ['How do you pipe into a non-first argument with |>?', 'Use the _ placeholder with a named argument.'],
          ],
        },
        {
          title: 'purrr map functions',
          description: 'map, map_dbl, map_chr and map_lgl for typed output, map2 and pmap for several inputs, walk for side effects, anonymous function shorthand, and replacing lapply and sapply.',
          concepts: ['map and typed variants', 'map2 and pmap', 'walk for side effects', 'Anonymous function shorthand', 'lapply and sapply comparison'],
          quiz: [
            ['Why prefer map_dbl over sapply?', 'It guarantees a double vector or errors, instead of silently changing type.'],
            ['What does map(list, "name") do?', 'Extracts the name element from each list item.'],
          ],
          prereqs: ['Writing functions'],
        },
        {
          title: 'Reduce, accumulate and safe functions',
          description: 'reduce and accumulate for folds, safely and possibly to wrap failing functions, keep, discard and compact for filtering lists, and nested list wrangling.',
          concepts: ['reduce and accumulate', 'safely and possibly', 'keep, discard and compact', 'Flattening nested lists'],
          quiz: [
            ['What does safely(f)(x) return?', 'A list with result and error elements.'],
            ['What does reduce(list(a, b, c), left_join) do?', 'Joins the three data frames successively.'],
          ],
          prereqs: ['purrr map functions'],
        },
        {
          title: 'Tidy evaluation and writing dplyr functions',
          description: 'Why column names in dplyr are not strings, embracing arguments with {{ }}, .data and .env pronouns, dynamic column names with :=, and passing selections with across.',
          concepts: ['Data masking', 'Embracing with {{ }}', '.data and .env pronouns', 'Dynamic names with :=', 'across in functions'],
          quiz: [
            ['How do you pass a column name into a function that calls filter?', 'Wrap the argument with {{ }} inside the function.'],
            ['What does .data[[var]] do?', 'Selects a column by a string stored in var.'],
          ],
          prereqs: ['purrr map functions'],
        },
      ],
    },
    {
      title: 'Data Frames and the Tidyverse',
      topics: [
        {
          title: 'Data frames and tibbles',
          description: 'Rectangular data with columns as vectors, data.frame versus tibble printing and subsetting, $ and [[ access, glimpse, and stringsAsFactors history.',
          concepts: ['data.frame versus tibble', '$ and [[ on data frames', 'glimpse and str', 'Row names and why tibbles drop them'],
          quiz: [
            ['What does df[, "a"] return for a data.frame versus a tibble?', 'A vector for data.frame, a one-column tibble for tibble.'],
            ['Which function shows column types compactly?', 'glimpse()'],
          ],
          prereqs: ['Lists and attributes'],
        },
        {
          title: 'Importing and exporting data',
          description: 'readr::read_csv with column types, readxl for Excel, haven for SPSS and Stata, arrow for Parquet, write_csv, and diagnosing parsing problems.',
          concepts: ['read_csv and col_types', 'readxl and haven', 'arrow and Parquet', 'write_csv and problems()'],
          quiz: [
            ['Why specify col_types in read_csv?', 'Guessing from the first rows can mistype columns; explicit types are reproducible.'],
            ['Which function reads an Excel sheet?', 'readxl::read_excel(path, sheet = ...)'],
          ],
          prereqs: ['Data frames and tibbles'],
        },
        {
          title: 'dplyr verbs',
          description: 'filter, select, mutate, arrange and summarise, group_by and .by, n() and distinct, and rename and relocate, chained with the pipe.',
          concepts: ['filter and arrange', 'select and relocate', 'mutate and case_when', 'group_by and summarise', 'distinct and count'],
          quiz: [
            ['What does summarise(n = n(), .by = species) do?', 'Counts rows per species without leaving groups behind.'],
            ['Which verb creates or changes columns?', 'mutate()'],
          ],
          prereqs: ['Data frames and tibbles', 'The pipe operator'],
        },
        {
          title: 'Column-wise and row-wise operations',
          description: 'across for applying functions to many columns, where() for type selection, rowwise and c_across for per-row summaries, and window functions like lag and cumsum.',
          concepts: ['across and where', 'rowwise and c_across', 'lag, lead and cumsum', 'Ranking functions'],
          quiz: [
            ['What does mutate(across(where(is.numeric), scale)) do?', 'Standardises every numeric column.'],
            ['Why is rowwise slow on large data?', 'It evaluates per row instead of vectorised.'],
          ],
          prereqs: ['dplyr verbs'],
        },
        {
          title: 'Joins and set operations',
          description: 'left_join, inner_join, full_join and anti_join by keys, multiple-key joins, join_by for inequality joins, and checking for duplicate keys before joining; SQL joins are in the SQL track.',
          concepts: ['left, inner and full joins', 'anti_join and semi_join', 'join_by and inequality joins', 'Duplicate key checks', 'bind_rows and bind_cols'],
          quiz: [
            ['What does anti_join(a, b) return?', 'Rows of a with no match in b.'],
            ['Why check for duplicate keys before a join?', 'Duplicates multiply rows unexpectedly.'],
          ],
          prereqs: ['dplyr verbs'],
        },
        {
          title: 'Reshaping with tidyr',
          description: 'Tidy data principles, pivot_longer and pivot_wider, separate and unite, fill and complete for gaps, and nesting with nest and unnest.',
          concepts: ['Tidy data principles', 'pivot_longer and pivot_wider', 'separate and unite', 'fill and complete', 'nest and unnest'],
          quiz: [
            ['When do you pivot_longer?', 'When column headers are values, such as years.'],
            ['What does complete(year, region) add?', 'Missing combinations as rows with NA.'],
          ],
          prereqs: ['dplyr verbs'],
        },
        {
          title: 'Strings with stringr and regular expressions',
          description: 'str_detect, str_replace, str_extract and str_split, regex syntax, case and whitespace helpers, glue for interpolation, and encoding basics.',
          concepts: ['str_detect and str_replace', 'str_extract and str_split', 'Regex patterns in R', 'glue interpolation', 'Case and trimming helpers'],
          quiz: [
            ['What does str_extract("id_42", "\\\\d+") return?', '"42"'],
            ['Why double the backslashes in R regex strings?', 'The string parser consumes one level of escaping.'],
          ],
        },
        {
          title: 'Dates and times with lubridate',
          description: 'Parsing with ymd and dmy_hms, Date versus POSIXct, time zones, floor_date for binning, durations and intervals, and date arithmetic in pipelines.',
          concepts: ['ymd and dmy_hms parsing', 'Date versus POSIXct', 'Time zones', 'floor_date and binning', 'Durations, periods and intervals'],
          quiz: [
            ['What does ymd("2024-03-05") return?', 'A Date object.'],
            ['What does floor_date(x, "month") do?', 'Rounds each date down to the first of its month.'],
          ],
        },
      ],
    },
    {
      title: 'Visualisation with ggplot2',
      style: 'practice',
      topics: [
        {
          title: 'The grammar of graphics',
          description: 'Building a plot from data, aesthetics and geoms, layering, how ggplot maps columns to visual properties, and the difference between mapping and setting.',
          concepts: ['ggplot(), aes() and geoms', 'Layering with +', 'Mapping versus setting', 'Common geoms'],
          quiz: [
            ['Difference between aes(colour = grp) and colour = "red"?', 'The first maps data to colour; the second sets a constant.'],
            ['Which geom draws a histogram?', 'geom_histogram()'],
          ],
          prereqs: ['dplyr verbs'],
        },
        {
          title: 'Scales, facets and themes',
          description: 'Scales for axes and colours, log and date scales, facet_wrap and facet_grid for small multiples, labels and themes, and colour palettes that are readable and colour-blind safe.',
          concepts: ['scale_* functions', 'facet_wrap and facet_grid', 'labs and themes', 'Colour palettes'],
          quiz: [
            ['How do you put the y axis on a log scale?', 'scale_y_log10()'],
            ['What does facet_wrap(~ region) do?', 'Draws one panel per region.'],
          ],
          prereqs: ['The grammar of graphics'],
        },
        {
          title: 'Statistical layers and annotations',
          description: 'geom_smooth with methods, stat_summary, error bars, annotate and geom_text, position adjustments like dodge and jitter, and coordinate systems.',
          concepts: ['geom_smooth and methods', 'stat_summary and error bars', 'annotate and geom_text', 'Position adjustments', 'coord_flip and coord_cartesian'],
          quiz: [
            ['What does geom_smooth(method = "lm") add?', 'A linear regression line with a confidence band.'],
            ['Difference between xlim() and coord_cartesian(xlim)?', 'xlim drops data outside; coord_cartesian only zooms.'],
          ],
          prereqs: ['Scales, facets and themes'],
        },
        {
          title: 'Saving, combining and interactive plots',
          description: 'ggsave with size and DPI, patchwork for composing plots, plotly::ggplotly for interactivity, and choosing formats for print versus web.',
          concepts: ['ggsave sizes and DPI', 'patchwork composition', 'ggplotly', 'Output formats'],
          quiz: [
            ['How do you place two plots side by side with patchwork?', 'p1 + p2'],
            ['Which format keeps a plot crisp at any size?', 'A vector format such as SVG or PDF.'],
          ],
          prereqs: ['Scales, facets and themes'],
        },
      ],
    },
    {
      title: 'Statistics and Modelling',
      topics: [
        {
          title: 'Descriptive statistics and distributions',
          description: 'summary, quantile, sd and IQR, the d/p/q/r function families for distributions, set.seed for reproducible sampling, and skimr for quick overviews.',
          concepts: ['summary and quantile', 'dnorm, pnorm, qnorm, rnorm', 'set.seed and sampling', 'skimr overviews'],
          quiz: [
            ['What does qnorm(0.975) return?', 'About 1.96.'],
            ['Why call set.seed before sample()?', 'To make random results reproducible.'],
          ],
        },
        {
          title: 'Hypothesis tests',
          description: 't.test, wilcox.test, chisq.test and prop.test, reading htest output, p-values and confidence intervals, and tidying results with broom::tidy.',
          concepts: ['t.test and wilcox.test', 'chisq.test and prop.test', 'Reading htest output', 'broom::tidy'],
          quiz: [
            ['What does t.test(x, y, paired = TRUE) assume?', 'Each x is matched to a y measured on the same unit.'],
            ['What does broom::tidy return?', 'A tibble of the test or model results.'],
          ],
          prereqs: ['Descriptive statistics and distributions'],
        },
        {
          title: 'Linear models with lm',
          description: 'Formula syntax with + , : and *, factor contrasts, summary and coefficients, diagnostics with residual plots, predict with new data, and broom::augment and glance.',
          concepts: ['Formula syntax', 'Factor contrasts and dummies', 'summary and coef', 'Residual diagnostics', 'predict and augment'],
          quiz: [
            ['What does y ~ x * g fit?', 'Main effects of x and g plus their interaction.'],
            ['How do you drop the intercept?', 'y ~ x - 1 or y ~ 0 + x'],
          ],
          prereqs: ['Hypothesis tests'],
        },
        {
          title: 'Generalised linear models and glm',
          description: 'Logistic regression with family = binomial, Poisson for counts, link functions, odds ratios from coefficients, and model comparison with AIC and anova.',
          concepts: ['glm and families', 'Link functions', 'Odds ratios', 'AIC and anova comparison'],
          quiz: [
            ['How do you get odds ratios from a logistic model?', 'exp(coef(model))'],
            ['Which family models count data?', 'poisson (or quasipoisson for overdispersion).'],
          ],
          prereqs: ['Linear models with lm'],
        },
        {
          title: 'Tidymodels workflow',
          description: 'rsample for splits and cross-validation, recipes for preprocessing, parsnip model specs, workflows and tune, and yardstick metrics, as the tidy route into machine learning.',
          concepts: ['rsample splits and folds', 'recipes preprocessing', 'parsnip and workflows', 'tune and yardstick'],
          quiz: [
            ['Why fit preprocessing inside a recipe?', 'Steps are estimated on training data only, avoiding leakage.'],
            ['What does initial_split(df, prop = 0.8) create?', 'An 80/20 train-test split object.'],
          ],
          prereqs: ['Linear models with lm'],
        },
        {
          title: 'Time series basics in R',
          description: 'ts objects and tsibble, decomposition, rolling means with slider, ARIMA and ETS with fable, and plotting seasonal patterns.',
          concepts: ['ts and tsibble', 'Decomposition', 'Rolling windows with slider', 'fable ARIMA and ETS'],
          quiz: [
            ['What does a tsibble require?', 'An index column and optional keys uniquely identifying rows.'],
            ['What does STL decomposition separate?', 'Trend, seasonal and remainder components.'],
          ],
          prereqs: ['Dates and times with lubridate'],
        },
      ],
    },
    {
      title: 'Reports with R Markdown and Quarto',
      style: 'practice',
      topics: [
        {
          title: 'Quarto and R Markdown documents',
          description: 'Combining prose and code chunks in .qmd or .Rmd files, YAML headers, rendering to HTML, PDF and Word, and why literate reports beat copied screenshots.',
          concepts: ['Document structure and YAML', 'Code chunks', 'Rendering to HTML, PDF and Word', 'Quarto versus R Markdown'],
          quiz: [
            ['Which command renders a Quarto document?', 'quarto render file.qmd'],
            ['What does the YAML header control?', 'Title, output format and document options.'],
          ],
        },
        {
          title: 'Chunk options, caching and inline code',
          description: 'echo, eval, warning and fig options, caching slow chunks, inline r expressions in prose, and parameterised reports with params.',
          concepts: ['echo, eval and warning options', 'Figure options', 'Chunk caching', 'Inline code', 'Parameterised reports'],
          quiz: [
            ['How do you hide code but show output?', 'Set echo: false on the chunk.'],
            ['What does params allow?', 'Rendering the same report for different inputs such as a region or date.'],
          ],
          prereqs: ['Quarto and R Markdown documents'],
        },
        {
          title: 'Tables and publication-ready output',
          description: 'gt and kableExtra for formatted tables, gtsummary for model tables, cross-referencing figures and tables, and citations with a bibliography file.',
          concepts: ['gt and kableExtra', 'gtsummary model tables', 'Cross-references', 'Citations and bibliographies'],
          quiz: [
            ['Which package builds display tables with a grammar?', 'gt'],
            ['How do you cite in Quarto?', '[@key] with a bibliography entry in the YAML.'],
          ],
          prereqs: ['Chunk options, caching and inline code'],
        },
        {
          title: 'Dashboards and Shiny at a glance',
          description: 'Quarto dashboards for static layouts, Shiny apps with ui and server, reactive expressions, and when a report is enough versus an interactive app.',
          concepts: ['Quarto dashboards', 'Shiny ui and server', 'Reactive expressions', 'Report versus app'],
          quiz: [
            ['What does a reactive() expression do?', 'Recomputes only when its inputs change and caches the result.'],
            ['Where does Shiny UI code go?', 'In the ui object; logic goes in the server function.'],
          ],
        },
      ],
    },
    {
      title: 'Objects, Errors and Performance',
      topics: [
        {
          title: 'S3 classes and generics',
          description: 'R\'s lightweight object system: class attributes, generic functions with UseMethod, methods like print.myclass and summary.myclass, and inheritance through class vectors.',
          concepts: ['class attribute and structure()', 'UseMethod and generics', 'print and summary methods', 'Class vectors and inheritance', 'Constructors and validators'],
          quiz: [
            ['How is print(x) dispatched for class "money"?', 'R looks for print.money and falls back to print.default.'],
            ['What does inherits(x, "lm") test?', 'Whether "lm" is in the class vector of x.'],
          ],
          prereqs: ['Writing functions'],
        },
        {
          title: 'S4 and R6 objects',
          description: 'S4 with setClass, validity and setMethod for formal classes used in Bioconductor, and R6 for reference semantics with mutable fields and methods when state is unavoidable.',
          concepts: ['setClass and setMethod', 'S4 validity checks', 'R6Class with public and private', 'Reference versus copy semantics'],
          quiz: [
            ['When does R6 fit better than S3?', 'When an object must hold mutable state shared across references.'],
            ['What does an S4 validity function return?', 'TRUE or a character vector of error messages.'],
          ],
          prereqs: ['S3 classes and generics'],
        },
        {
          title: 'Conditions: errors, warnings and messages',
          description: 'stop, warning and message, tryCatch and withCallingHandlers, custom condition classes with rlang::abort, and informative error messages with cli.',
          concepts: ['stop, warning and message', 'tryCatch and finally', 'withCallingHandlers', 'Custom conditions with rlang::abort', 'cli-formatted messages'],
          quiz: [
            ['What does tryCatch(expr, error = function(e) NA) return on error?', 'NA'],
            ['Difference between tryCatch and withCallingHandlers?', 'tryCatch exits the code; withCallingHandlers runs the handler and continues.'],
          ],
        },
        {
          title: 'Debugging tools',
          description: 'traceback, browser() and debug(), options(error = recover), breakpoints in the IDE, and reprex for minimal reproducible examples.',
          concepts: ['traceback and rlang::last_trace', 'browser and debug', 'options(error = recover)', 'reprex'],
          quiz: [
            ['What does browser() do?', 'Pauses execution and opens an interactive debugger at that line.'],
            ['Why create a reprex?', 'A minimal example others can run makes bugs easy to diagnose.'],
          ],
          prereqs: ['Conditions: errors, warnings and messages'],
        },
        {
          title: 'Memory, copy-on-modify and vectorisation',
          description: 'Copy-on-modify semantics, tracemem to see copies, why growing vectors in loops is quadratic, pre-allocation, object.size and gc, and vectorised alternatives.',
          concepts: ['Copy-on-modify', 'tracemem', 'Growing vectors in loops', 'Pre-allocation', 'object.size and gc'],
          quiz: [
            ['Does y <- x copy x immediately?', 'No, only when one of them is modified.'],
            ['Why is x <- c(x, i) in a loop slow?', 'Each step copies the whole vector.'],
          ],
        },
        {
          title: 'Profiling and speeding up R',
          description: 'profvis and bench::mark, data.table and dtplyr for large data, arrow and duckdb for out-of-memory work, and Rcpp for hot loops.',
          concepts: ['profvis and bench::mark', 'data.table and dtplyr', 'arrow and duckdb', 'Rcpp for hot loops'],
          quiz: [
            ['What does bench::mark report?', 'Timing, memory allocation and iterations per second for expressions.'],
            ['When reach for Rcpp?', 'Loops that cannot be vectorised and dominate run time.'],
          ],
          prereqs: ['Memory, copy-on-modify and vectorisation'],
        },
        {
          title: 'Parallel computing with future and furrr',
          description: 'plan(multisession), future_map from furrr replacing map, parallel::mclapply on Unix, chunking work, and the overhead that makes small tasks slower in parallel.',
          concepts: ['plan and multisession', 'furrr::future_map', 'mclapply', 'Parallel overhead'],
          quiz: [
            ['How do you switch purrr code to parallel?', 'Set plan(multisession) and use furrr::future_map.'],
            ['Why can parallel code be slower?', 'Starting workers and transferring data cost more than tiny tasks save.'],
          ],
          prereqs: ['purrr map functions'],
        },
      ],
    },
    {
      title: 'Packages, Testing and Databases',
      topics: [
        {
          title: 'Creating a package with usethis and devtools',
          description: 'usethis::create_package, DESCRIPTION and NAMESPACE, R/ and man/ folders, roxygen2 documentation, load_all and check, and why packages are the unit of reusable R code.',
          concepts: ['create_package and DESCRIPTION', 'roxygen2 documentation', 'NAMESPACE exports and imports', 'load_all, document and check'],
          quiz: [
            ['What does devtools::check() run?', 'R CMD check: documentation, examples, tests and CRAN policy checks.'],
            ['Where does @export end up?', 'In NAMESPACE as an export() directive.'],
          ],
          prereqs: ['Writing functions'],
        },
        {
          title: 'Unit testing with testthat',
          description: 'test_that blocks and expect_ functions, use_test to scaffold, snapshot tests, testing errors with expect_error, and running tests with test() and in check.',
          concepts: ['test_that and expectations', 'expect_error and expect_warning', 'Snapshot tests', 'devtools::test'],
          quiz: [
            ['What does expect_equal do differently from expect_identical?', 'It allows small numeric tolerance.'],
            ['Where do tests live in a package?', 'tests/testthat/'],
          ],
          prereqs: ['Creating a package with usethis and devtools'],
        },
        {
          title: 'Releasing to CRAN and GitHub',
          description: 'Versioning and NEWS.md, pkgdown sites, GitHub Actions with R CMD check, CRAN submission policies, and licensing.',
          concepts: ['Versioning and NEWS.md', 'pkgdown sites', 'GitHub Actions for R CMD check', 'CRAN policies and licensing'],
          quiz: [
            ['What does usethis::use_github_action("check-standard") add?', 'A workflow running R CMD check on several platforms.'],
            ['What must a CRAN submission pass?', 'R CMD check with no errors, warnings or notes where possible.'],
          ],
          prereqs: ['Unit testing with testthat'],
        },
        {
          title: 'Databases with DBI and dbplyr',
          description: 'Connecting with DBI and drivers like RSQLite and RPostgres, parameterised queries, dbplyr translating dplyr to SQL lazily, collect(), and duckdb for local analytics.',
          concepts: ['DBI connections', 'Parameterised queries with dbBind', 'dbplyr lazy tables and collect', 'duckdb for local analytics'],
          quiz: [
            ['When does a dbplyr query run?', 'When collect(), print or another action forces it.'],
            ['Why use parameterised queries in R too?', 'To prevent SQL injection when values come from users.'],
          ],
          prereqs: ['dplyr verbs'],
        },
        {
          title: 'APIs, web data and security',
          description: 'httr2 for REST requests with authentication, jsonlite parsing, rvest scraping politely, keeping API keys in .Renviron, and never sourcing untrusted code.',
          concepts: ['httr2 requests', 'jsonlite parsing', 'rvest scraping', 'Secrets in .Renviron', 'Untrusted code risks'],
          quiz: [
            ['Where should an API key live?', 'In .Renviron, read with Sys.getenv().'],
            ['What does jsonlite::fromJSON return for an array of objects?', 'A data frame by default.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: exploratory analysis report',
          description: 'Take a public dataset, clean it with dplyr and tidyr, explore distributions and relationships with ggplot2, write findings in a Quarto report with cross-referenced figures, and render to HTML and PDF.',
          concepts: ['Import and clean the data', 'Explore with summaries and plots', 'Write the Quarto narrative', 'Render and share'],
          quiz: [
            ['Why keep raw data untouched?', 'The report can be re-run from source when data updates.'],
            ['Where do cleaning steps belong?', 'In a script or chunk that runs before analysis, never manual edits.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: reusable analysis package',
          description: 'Turn helper functions from a project into a package with roxygen docs, testthat tests, a vignette, GitHub Actions checks and a pkgdown site.',
          concepts: ['Extract functions into a package', 'Document with roxygen2', 'Write tests and a vignette', 'Set up CI and pkgdown'],
          quiz: [
            ['What does a vignette add over function docs?', 'A narrative example of using the functions together.'],
            ['How do you check the package locally?', 'devtools::check()'],
          ],
          style: 'project',
        },
        {
          title: 'Project: predictive model with tidymodels',
          description: 'Split data with rsample, build a recipe, compare a logistic regression and a random forest with cross-validation, tune hyperparameters, and report yardstick metrics and variable importance.',
          concepts: ['Split and resample', 'Recipe preprocessing', 'Compare model specs', 'Tune and evaluate', 'Report metrics'],
          quiz: [
            ['Why cross-validate instead of a single split?', 'Metrics are less sensitive to one lucky or unlucky split.'],
            ['Which metric for imbalanced classes?', 'ROC AUC or precision-recall rather than accuracy.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Shiny data explorer',
          description: 'Build a Shiny app that loads a dataset, filters with inputs, shows a reactive ggplot and table, downloads the filtered data, and is deployed to shinyapps.io or Posit Connect.',
          concepts: ['Design inputs and layout', 'Reactive filtering', 'Plot and table outputs', 'Download handler', 'Deploy the app'],
          quiz: [
            ['What does observeEvent do?', 'Runs code in response to an input change without returning a value.'],
            ['How do you avoid recomputing an expensive filter?', 'Put it in a reactive() used by several outputs.'],
          ],
          style: 'project',
        },
        {
          title: 'R interview questions',
          description: 'The recurring questions: vectors and recycling, NA handling, factors, apply versus purrr, copy-on-modify, S3 dispatch, tidy evaluation, long versus wide data, and R versus Python for analysis.',
          concepts: ['Data structure questions', 'Tidyverse questions', 'Statistics questions', 'Performance questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['What is the difference between [ and [[ on a list?', '[ returns a sub-list; [[ returns the element itself.'],
            ['What is tidy data?', 'Each variable is a column, each observation a row, each value a cell.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live data tasks in R',
          description: 'Take-home and live tasks: loading a messy CSV, summarising by group, joining tables, reshaping, plotting a trend, and explaining findings, all within a time limit and with clean code.',
          concepts: ['Fast loading and inspection', 'Group summaries under pressure', 'Reshape and join quickly', 'One clear plot', 'Explaining results'],
          quiz: [
            ['First thing to run on an unknown data frame?', 'glimpse() or skimr::skim()'],
            ['How do you count rows per group with NA-aware sums?', 'summarise(n = n(), total = sum(x, na.rm = TRUE), .by = g)'],
          ],
        },
      ],
    },
  ],
})
