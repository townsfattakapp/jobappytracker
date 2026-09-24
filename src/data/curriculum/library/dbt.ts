import { defineTrack } from '../define'

export const dbt = defineTrack({
  id: 'track-dbt',
  title: 'dbt',
  description: 'Transforming warehouse data with dbt: project structure, models and materialisations, sources and refs, Jinja and macros, generic and singular tests, docs and lineage, seeds, snapshots and incremental models, packages, environments, CI, the semantic layer, and running it in Core or Cloud.',
  family: 'Data Engineering',
  kind: 'tooling',
  icon: '🧱',
  tags: ['dbt', 'sql', 'analytics-engineering', 'transformation', 'warehouse', 'jinja'],
  languages: ['SQL', 'Jinja', 'YAML'],
  explainMode: 'sql',
  code: { label: 'SQL with Jinja (dbt)', id: 'sql', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-data-warehousing'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started',
      description: 'What dbt does, how a project is laid out, and the first run.',
      topics: [
        {
          title: 'What dbt does and does not do',
          description: 'dbt is the T in ELT: it compiles SELECT statements into tables and views inside the warehouse, orders them by dependency and tests them, but it does not move data in; why that narrow scope made it the standard transformation layer.',
          concepts: ['Transform inside the warehouse', 'Models as SELECT statements', 'Dependency graph from refs', 'dbt versus ETL tools'],
          quiz: [
            ['Does dbt extract data from sources?', 'No, it only transforms data already loaded into the warehouse.'],
            ['What does a model compile to?', 'A CREATE TABLE AS or CREATE VIEW AS wrapping your SELECT.'],
          ],
        },
        {
          title: 'Installing dbt Core and adapters',
          description: 'dbt Core plus one adapter per warehouse (dbt-postgres, dbt-snowflake, dbt-bigquery, dbt-databricks); installing in a venv, running dbt init, and checking connectivity with dbt debug.',
          concepts: ['dbt Core and adapter packages', 'dbt init and project scaffold', 'dbt debug connectivity check', 'Version pinning per project'],
          quiz: [
            ['Why does dbt need an adapter?', 'Each warehouse has its own SQL dialect and connection library.'],
            ['What does dbt debug verify?', 'The profile, connection and project files are valid.'],
          ],
          prereqs: ['What dbt does and does not do'],
        },
        {
          title: 'Project structure and dbt_project.yml',
          description: 'The folders (models, tests, macros, seeds, snapshots, analyses) and dbt_project.yml, where project-wide config such as materialisations and schemas per folder is set; the staging, intermediate and marts layering convention.',
          concepts: ['Folder layout and purpose', 'dbt_project.yml configuration', 'Config inheritance by folder', 'Staging, intermediate, marts layers'],
          quiz: [
            ['Where do you set every model in models/marts to be a table?', 'Under models: in dbt_project.yml with +materialized: table.'],
            ['What is the purpose of the staging layer?', 'One model per source table that renames, casts and lightly cleans.'],
          ],
          prereqs: ['Installing dbt Core and adapters'],
        },
        {
          title: 'profiles.yml and targets',
          description: 'Connection details live outside the project in profiles.yml with one or more targets (dev, prod) per profile; using env_var() for secrets and how the target schema keeps developers from overwriting each other.',
          concepts: ['Profiles and targets', 'env_var() for credentials', 'Per-developer schemas', 'Selecting a target on the command line'],
          quiz: [
            ['Why is profiles.yml not in the repo?', 'It holds credentials and machine-specific settings.'],
            ['How do you run against production?', 'dbt run --target prod.'],
          ],
          prereqs: ['Project structure and dbt_project.yml'],
        },
        {
          title: 'The core commands',
          description: 'dbt run, test, build, seed, snapshot, compile and docs; what each writes to the warehouse or target folder, and why dbt build is the command to use once tests matter.',
          concepts: ['run, test and build', 'compile and the target folder', 'seed, snapshot and docs', 'Exit codes and logs'],
          quiz: [
            ['What does dbt build do?', 'Runs models, tests, seeds and snapshots in DAG order, stopping downstream of failures.'],
            ['Where is compiled SQL written?', 'target/compiled and target/run.'],
          ],
          prereqs: ['profiles.yml and targets'],
        },
      ],
    },
    {
      title: 'Models and Materialisations',
      description: 'How SELECT statements become tables and views in the right order.',
      topics: [
        {
          title: 'Writing a model',
          description: 'A model is a .sql file with a single SELECT; naming, CTE structure (import CTEs, logical CTEs, final SELECT), and how the file name becomes the relation name in the target schema.',
          concepts: ['One SELECT per file', 'Import and logical CTEs', 'Naming conventions', 'File name to relation mapping'],
          quiz: [
            ['Can a model contain multiple statements?', 'No, one SELECT; use pre/post hooks for extra statements.'],
            ['Why start with import CTEs?', 'They make every dependency visible at the top of the file.'],
          ],
        },
        {
          title: 'ref() and the dependency graph',
          description: 'ref(\'model\') resolves to the correct schema-qualified name for the target and records an edge in the DAG, which is how dbt orders runs, builds lineage and supports selecting upstream and downstream.',
          concepts: ['ref() resolution', 'DAG construction from refs', 'Why hard-coded names break', 'Cross-project refs'],
          quiz: [
            ['What breaks if you write schema.table instead of ref()?', 'Ordering, lineage and environment switching.'],
            ['What does ref() compile to?', 'The fully qualified relation name for the current target.'],
          ],
          prereqs: ['Writing a model'],
        },
        {
          title: 'Sources and source freshness',
          description: 'Declaring raw tables in a sources YAML with source(\'schema\', \'table\') gives them lineage, tests and freshness checks (loaded_at_field with warn_after and error_after) so stale loads are caught before models run.',
          concepts: ['Source definitions in YAML', 'source() function', 'Freshness configuration', 'dbt source freshness command'],
          quiz: [
            ['Why declare sources rather than select from raw tables directly?', 'Lineage, documentation, tests and freshness checks on the raw layer.'],
            ['What does loaded_at_field do?', 'Names the timestamp column used to compute freshness.'],
          ],
          prereqs: ['ref() and the dependency graph'],
        },
        {
          title: 'View, table and ephemeral materialisations',
          description: 'Views cost nothing to build but run the query each time; tables are rebuilt in full on each run; ephemeral models are inlined as CTEs; choosing per layer for cost, freshness and query speed.',
          concepts: ['View materialisation trade-offs', 'Table full rebuilds', 'Ephemeral inlining', 'Choosing by layer'],
          quiz: [
            ['Which materialisation is common for staging models?', 'View, or ephemeral when only used by one downstream model.'],
            ['What is the downside of ephemeral models?', 'They cannot be queried directly and make compiled SQL harder to read.'],
          ],
          prereqs: ['Writing a model'],
        },
        {
          title: 'Model configuration and schemas',
          description: 'config() blocks, YAML properties and dbt_project.yml layers of configuration; custom schemas via generate_schema_name, aliases, tags and meta for routing models into the right place.',
          concepts: ['config() precedence', 'Custom schema generation', 'Aliases and tags', 'meta for downstream tools'],
          quiz: [
            ['What is the default custom schema behaviour?', 'target_schema plus underscore plus the custom schema name.'],
            ['How do you run only tagged models?', 'dbt run --select tag:finance.'],
          ],
          prereqs: ['View, table and ephemeral materialisations'],
        },
        {
          title: 'Node selection syntax',
          description: 'Selecting nodes by name, path, tag, source, state or graph operators (+model, model+, @model) to run exactly the subset you need, and excluding with --exclude.',
          concepts: ['Selectors by name, path and tag', 'Graph operators + and @', 'state:modified selection', 'YAML selectors'],
          quiz: [
            ['What does +orders+ select?', 'orders with all its ancestors and descendants.'],
            ['What does state:modified need?', 'A previous manifest to compare against via --state.'],
          ],
          prereqs: ['Model configuration and schemas'],
        },
      ],
    },
    {
      title: 'Jinja and Macros',
      description: 'The templating layer that turns SQL into a programmable language.',
      topics: [
        {
          title: 'Jinja in dbt models',
          description: 'Expressions, statements and comments; set, if and for inside SQL; how Jinja renders before the warehouse sees anything, and reading compiled output to understand what actually ran.',
          concepts: ['Jinja delimiters', 'Variables and control flow', 'Whitespace control', 'Reading compiled SQL'],
          quiz: [
            ['When is Jinja evaluated?', 'At compile time, before SQL is sent to the warehouse.'],
            ['What does {%- do?', 'Strips whitespace before the tag.'],
          ],
        },
        {
          title: 'Writing macros',
          description: 'Macros are Jinja functions in the macros folder that return SQL fragments; parameters, defaults, calling from models and tests, and keeping them generic across adapters.',
          concepts: ['Macro definition and arguments', 'Returning SQL fragments', 'Calling macros in models', 'Adapter-specific dispatch'],
          quiz: [
            ['What does a macro return?', 'A string of SQL text inserted where it was called.'],
            ['How do you make a macro warehouse-specific?', 'adapter.dispatch with per-adapter implementations.'],
          ],
          prereqs: ['Jinja in dbt models'],
        },
        {
          title: 'run_query and execute',
          description: 'Macros can query the warehouse at compile time with run_query, guarded by the execute flag because dbt parses twice; using it to build dynamic column lists or pivots.',
          concepts: ['run_query results as agate tables', 'The execute guard', 'Dynamic column pivots', 'Parse-time versus run-time'],
          quiz: [
            ['Why check {% if execute %}?', 'During parsing dbt does not run queries, so results are empty.'],
            ['What does run_query return?', 'An agate table you can iterate for column values.'],
          ],
          prereqs: ['Writing macros'],
        },
        {
          title: 'Variables, env_var and hooks',
          description: 'var() for run-time arguments passed with --vars, env_var() for environment values, and pre-hook, post-hook, on-run-start and on-run-end for grants and housekeeping statements.',
          concepts: ['var() and --vars', 'env_var() with defaults', 'pre-hook and post-hook', 'on-run-end operations'],
          quiz: [
            ['How do you pass a date into a run?', 'dbt run --vars \'{"run_date": "2024-01-01"}\' and read it with var().'],
            ['Where would you grant SELECT to a role after a build?', 'In a post-hook or the grants config.'],
          ],
          prereqs: ['Writing macros'],
        },
      ],
    },
    {
      title: 'Testing',
      description: 'Turning assumptions about data into assertions that run every build.',
      topics: [
        {
          title: 'Generic tests',
          description: 'unique, not_null, accepted_values and relationships declared in YAML on columns; how each compiles to a query that returns failing rows, and severity, where and store_failures configuration.',
          concepts: ['Built-in generic tests', 'Test compilation to failing rows', 'Severity and thresholds', 'store_failures for debugging'],
          quiz: [
            ['When does a test pass?', 'When its query returns zero rows.'],
            ['What does relationships check?', 'Every value in a column exists in a referenced model\'s column.'],
          ],
        },
        {
          title: 'Singular tests',
          description: 'A .sql file in the tests folder that selects rows violating a business rule (orders with negative totals, refunds larger than payments); when a one-off SQL assertion beats a generic test.',
          concepts: ['Singular test files', 'Business rule assertions', 'Referencing models in tests', 'Naming and organising tests'],
          quiz: [
            ['What must a singular test return to pass?', 'No rows.'],
            ['When is a singular test the right choice?', 'For a rule specific to one model that is not worth generalising.'],
          ],
          prereqs: ['Generic tests'],
        },
        {
          title: 'Custom generic tests',
          description: 'Writing a reusable test as a macro with the {% test %} block that takes model and column_name, parameterising it, and sharing it across projects via a package.',
          concepts: ['{% test %} macro block', 'model and column_name arguments', 'Extra parameters', 'Publishing tests in a package'],
          quiz: [
            ['What arguments does every generic test receive?', 'model and, for column tests, column_name.'],
            ['Where do custom generic tests live?', 'In tests/generic or macros.'],
          ],
          prereqs: ['Singular tests'],
        },
        {
          title: 'Unit tests for models',
          description: 'dbt unit tests define given input rows and expected output rows for a model in YAML, so transformation logic is verified without real data; when they complement data tests.',
          concepts: ['given and expect blocks', 'Mocking refs and sources', 'Testing edge cases in logic', 'Unit versus data tests'],
          quiz: [
            ['What does a unit test mock?', 'The models and sources the tested model reads.'],
            ['When do unit tests run?', 'With dbt test or dbt build, before the model is built.'],
          ],
          prereqs: ['Custom generic tests'],
        },
        {
          title: 'Testing packages: dbt_utils and dbt_expectations',
          description: 'Ready-made tests such as unique_combination_of_columns, not_accepted_values, expect_column_values_to_be_between and row count comparisons that cover most data quality needs without writing SQL.',
          concepts: ['dbt_utils test catalogue', 'dbt_expectations assertions', 'Composite key uniqueness', 'Choosing between packages'],
          quiz: [
            ['Which test checks a composite key?', 'dbt_utils.unique_combination_of_columns.'],
            ['What does expect_row_count_to_equal_other_table verify?', 'Two relations have the same number of rows.'],
          ],
          prereqs: ['Generic tests'],
        },
      ],
    },
    {
      title: 'Documentation and Lineage',
      description: 'Making the project understandable to people who did not write it.',
      topics: [
        {
          title: 'Descriptions and doc blocks',
          description: 'Model and column descriptions in YAML, reusable {% docs %} blocks in Markdown for shared definitions, and why documenting at the column level pays off when analysts search the catalogue.',
          concepts: ['YAML descriptions', 'Markdown doc blocks', 'Reusing definitions with doc()', 'Documentation coverage'],
          quiz: [
            ['How do you reuse a description across models?', 'Define a docs block and reference it with {{ doc(\'name\') }}.'],
            ['Where do column descriptions live?', 'Under columns: in the model\'s YAML properties.'],
          ],
        },
        {
          title: 'Generating and serving docs',
          description: 'dbt docs generate builds catalog.json and manifest.json; dbt docs serve renders the site with lineage graph, and hosting it statically for the team.',
          concepts: ['manifest.json and catalog.json', 'dbt docs serve', 'Lineage graph navigation', 'Hosting docs statically'],
          quiz: [
            ['What does catalog.json contain?', 'Column types and statistics queried from the warehouse.'],
            ['Which file holds the DAG?', 'manifest.json.'],
          ],
          prereqs: ['Descriptions and doc blocks'],
        },
        {
          title: 'Exposures and lineage to dashboards',
          description: 'Exposures declare downstream consumers (dashboards, notebooks, applications) that depend on models so lineage extends to end users and changes can be assessed for impact.',
          concepts: ['Exposure definitions', 'Owner and maturity fields', 'Impact analysis from lineage', 'Selecting by exposure'],
          quiz: [
            ['What is an exposure?', 'A declared downstream use of dbt models, such as a dashboard.'],
            ['How do you run everything a dashboard needs?', 'dbt run --select +exposure:name.'],
          ],
          prereqs: ['Generating and serving docs'],
        },
        {
          title: 'Model contracts and versions',
          description: 'Enforced contracts fix a model\'s column names and types so a build fails if they drift, and model versions let a breaking change ship alongside the old shape with a deprecation date.',
          concepts: ['contract enforced config', 'Column type declarations', 'Model versions and latest_version', 'Deprecation dates'],
          quiz: [
            ['What happens when a contracted model adds an undeclared column?', 'The build fails.'],
            ['How do consumers pin an older version?', 'ref(\'model\', v=1).'],
          ],
          prereqs: ['Exposures and lineage to dashboards'],
        },
      ],
    },
    {
      title: 'Seeds, Snapshots and Incremental Models',
      description: 'Beyond simple rebuilds: reference data, history and efficient updates.',
      topics: [
        {
          title: 'Seeds',
          description: 'CSV files in the seeds folder loaded with dbt seed for small, version-controlled reference data such as country codes or mapping tables; column type overrides and why seeds are not for large data.',
          concepts: ['Seed CSVs and dbt seed', 'Column type overrides', 'Referencing seeds with ref()', 'When seeds are the wrong tool'],
          quiz: [
            ['What is a seed good for?', 'Small, slowly changing lookup tables kept in version control.'],
            ['Why not seed a million-row file?', 'Loads are slow and the repo bloats; load it as a source instead.'],
          ],
        },
        {
          title: 'Snapshots for slowly changing dimensions',
          description: 'Snapshots record how rows change over time by adding valid_from and valid_to columns (type 2 SCD) using a timestamp or check strategy; scheduling them and querying history.',
          concepts: ['Type 2 SCD via snapshots', 'timestamp versus check strategy', 'dbt_valid_from and dbt_valid_to', 'Querying point-in-time state'],
          quiz: [
            ['What does the check strategy compare?', 'The listed columns\' values between runs.'],
            ['How do you get the current version of each row?', 'Filter where dbt_valid_to is null.'],
          ],
          prereqs: ['Seeds'],
        },
        {
          title: 'Incremental models',
          description: 'materialized=\'incremental\' processes only new or changed rows using is_incremental() and a watermark filter, cutting cost on large tables; the first run builds everything, later runs insert or merge.',
          concepts: ['is_incremental() filter', 'Watermark on a timestamp', 'First run versus later runs', 'Late-arriving data lookback'],
          quiz: [
            ['What does is_incremental() return on the first run?', 'False, so the full table is built.'],
            ['How do you catch late-arriving rows?', 'Filter with a lookback window instead of a strict max timestamp.'],
          ],
          prereqs: ['Snapshots for slowly changing dimensions'],
        },
        {
          title: 'Incremental strategies and unique keys',
          description: 'append, merge, delete+insert and insert_overwrite behave differently per adapter; unique_key drives merges, and on_schema_change controls whether new columns are added, ignored or fail the run.',
          concepts: ['append versus merge', 'delete+insert and insert_overwrite', 'unique_key semantics', 'on_schema_change options'],
          quiz: [
            ['Which strategy is typical for BigQuery partitioned tables?', 'insert_overwrite by partition.'],
            ['What does on_schema_change=\'append_new_columns\' do?', 'Adds new columns to the target table on incremental runs.'],
          ],
          prereqs: ['Incremental models'],
        },
        {
          title: 'Full refresh and rebuilding safely',
          description: 'dbt run --full-refresh drops and rebuilds incremental models and seeds; when logic changes require it, how to do it without downtime, and protecting production tables with full_refresh: false.',
          concepts: ['--full-refresh behaviour', 'When a refresh is required', 'Blue-green rebuilds', 'Guarding with full_refresh false'],
          quiz: [
            ['When must you full refresh an incremental model?', 'When the transformation logic or historical rows change.'],
            ['How do you prevent an accidental full refresh in prod?', 'Set full_refresh: false in the model config.'],
          ],
          prereqs: ['Incremental strategies and unique keys'],
        },
      ],
    },
    {
      title: 'Packages, Environments and CI',
      description: 'Running dbt like software: dependencies, environments and automated checks.',
      topics: [
        {
          title: 'Packages and packages.yml',
          description: 'Installing dbt_utils, codegen, audit_helper and others via packages.yml and dbt deps; pinning versions, private packages from git, and how a package\'s models and macros join the project.',
          concepts: ['packages.yml and dbt deps', 'Version pinning', 'Git and private packages', 'Useful community packages'],
          quiz: [
            ['What does dbt deps do?', 'Downloads packages into dbt_packages.'],
            ['Which package generates staging model YAML?', 'codegen.'],
          ],
        },
        {
          title: 'Environments and deployment targets',
          description: 'Dev, CI and prod targets pointing at separate schemas or databases; production runs on a schedule via an orchestrator, and promotion means the same code running against the prod target.',
          concepts: ['Dev, CI and prod separation', 'Scheduled production runs', 'Promoting code not data', 'Warehouse permissions per target'],
          quiz: [
            ['Why give each developer a schema?', 'Their builds never overwrite each other or production.'],
            ['What runs dbt in production?', 'An orchestrator such as Airflow, Dagster or dbt Cloud jobs.'],
          ],
          prereqs: ['Packages and packages.yml'],
        },
        {
          title: 'Slim CI with state and deferral',
          description: 'A CI job that builds only modified models and their descendants with --select state:modified+ and --defer against the production manifest, in a temporary schema dropped afterwards.',
          concepts: ['state:modified+ selection', '--defer to production', 'Temporary CI schemas', 'Cleaning up after CI'],
          quiz: [
            ['What does --defer do?', 'Resolves unbuilt refs to the production version instead of building them.'],
            ['Where does the comparison manifest come from?', 'The last production run, stored as an artifact.'],
          ],
          prereqs: ['Environments and deployment targets'],
        },
        {
          title: 'Linting, formatting and pre-commit',
          description: 'SQLFluff with the dbt templater lints and formats models, dbt-checkpoint hooks enforce descriptions and tests, and both run in pre-commit and CI to keep the project consistent.',
          concepts: ['SQLFluff with dbt templater', 'dbt-checkpoint hooks', 'Enforcing docs and test coverage', 'pre-commit configuration'],
          quiz: [
            ['Why does SQLFluff need the dbt templater?', 'To render Jinja before linting the SQL.'],
            ['What can dbt-checkpoint block?', 'Models without descriptions, tests or owners.'],
          ],
          prereqs: ['Slim CI with state and deferral'],
        },
      ],
    },
    {
      title: 'Semantic Layer, Cloud and Performance',
      description: 'Metrics as code, product choices, and keeping runs fast and cheap.',
      topics: [
        {
          title: 'Semantic models and metrics with MetricFlow',
          description: 'Semantic models declare entities, dimensions and measures on top of dbt models; metrics (simple, ratio, derived, cumulative) are defined once and queried consistently by BI tools through the semantic layer.',
          concepts: ['Semantic model definitions', 'Entities, dimensions and measures', 'Metric types', 'Querying metrics'],
          quiz: [
            ['Why define metrics in dbt instead of each dashboard?', 'One definition used consistently by every consumer.'],
            ['What is a ratio metric?', 'One metric divided by another, such as conversion rate.'],
          ],
        },
        {
          title: 'dbt Cloud versus dbt Core',
          description: 'Core is the open-source CLI you orchestrate yourself; Cloud adds a hosted IDE, job scheduler, CI integration, the semantic layer API and observability; the cost and control trade-offs when picking.',
          concepts: ['What Cloud adds', 'Self-hosting Core with an orchestrator', 'Cost and control trade-offs', 'Hybrid setups'],
          quiz: [
            ['Is the semantic layer API available in Core alone?', 'No, the hosted API is a dbt Cloud feature; MetricFlow definitions work in Core.'],
            ['What replaces Cloud jobs when using Core?', 'An orchestrator such as Airflow running dbt build.'],
          ],
          prereqs: ['Semantic models and metrics with MetricFlow'],
        },
        {
          title: 'Performance and cost optimisation',
          description: 'Reading run timings to find slow models, incrementalising them, right-sizing materialisations, using partitioning and clustering configs per adapter, and limiting threads to what the warehouse handles.',
          concepts: ['Model timing analysis', 'Partitioning and clustering configs', 'Threads and concurrency', 'Reducing warehouse spend'],
          quiz: [
            ['Where do you find per-model run times?', 'In run_results.json or the console output.'],
            ['What does threads control?', 'How many models build concurrently.'],
          ],
          prereqs: ['dbt Cloud versus dbt Core'],
        },
        {
          title: 'Python models and adapters that support them',
          description: 'On Snowflake, Databricks and BigQuery a model can be a Python file returning a DataFrame, run in the warehouse; when Python beats SQL (ML scoring, complex parsing) and its costs.',
          concepts: ['Python model signature', 'Supported adapters', 'When Python is justified', 'Mixing Python and SQL models'],
          quiz: [
            ['What must a Python model return?', 'A DataFrame that dbt materialises as a table.'],
            ['Does a Python model run on your laptop?', 'No, it runs on the warehouse platform\'s compute.'],
          ],
          prereqs: ['Performance and cost optimisation'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: e-commerce marts with tests and docs',
          description: 'Model a raw orders, customers and payments source into staging views, an intermediate layer and fact and dimension marts, with generic and singular tests, full column docs, an exposure for a dashboard, and a passing dbt build.',
          concepts: ['Declare sources with freshness', 'Build staging and intermediate layers', 'Build fact and dimension marts', 'Test, document and expose'],
          quiz: [
            ['What test belongs on a fact table\'s primary key?', 'unique and not_null.'],
            ['Why an exposure?', 'So the dashboard appears in lineage and can be selected for runs.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: incremental event pipeline with snapshots',
          description: 'Turn a large event table into an incremental fact with merge strategy and a lookback window, snapshot the customer dimension as type 2, and prove correctness with unit tests and a full-refresh comparison.',
          concepts: ['Design the watermark and lookback', 'Implement merge with unique_key', 'Snapshot the dimension', 'Compare incremental and full refresh'],
          quiz: [
            ['How do you show the incremental output matches a full rebuild?', 'Build both and compare with audit_helper.compare_relations.'],
            ['What triggers a new snapshot row?', 'A change in the tracked columns or updated_at.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: slim CI pipeline on GitHub Actions',
          description: 'A workflow that installs dbt, pulls the production manifest, runs dbt build --select state:modified+ with --defer in a PR schema, lints with SQLFluff, checks docs coverage with dbt-checkpoint and tears the schema down.',
          concepts: ['Workflow with cached manifest', 'Modified-only build in a PR schema', 'Lint and checkpoint gates', 'Schema cleanup step'],
          quiz: [
            ['Where does the PR schema name come from?', 'The pull request number, so runs never collide.'],
            ['What should fail the PR?', 'Any failed test, lint error or missing description.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: metrics layer for a revenue dashboard',
          description: 'Define semantic models for orders and customers, metrics for revenue, order count, average order value and 28-day cumulative revenue, and validate them with MetricFlow queries against the marts.',
          concepts: ['Define entities and measures', 'Write simple and derived metrics', 'Validate with MetricFlow', 'Document metric ownership'],
          quiz: [
            ['What kind of metric is average order value?', 'A ratio metric: revenue divided by order count.'],
            ['How do you check a metric definition?', 'mf validate-configs and mf query with a time grain.'],
          ],
          style: 'project',
        },
        {
          title: 'dbt interview questions',
          description: 'What interviewers ask: ref versus hard-coded names, materialisation choices, how incremental models work and fail, testing strategy, project layering, and how you would organise a dbt project for several teams.',
          concepts: ['Materialisation questions', 'Incremental and snapshot questions', 'Testing and documentation questions', 'Project organisation questions'],
          quiz: [
            ['Explain when to choose a view over a table.', 'Small or rarely queried models where freshness matters more than speed.'],
            ['What does is_incremental() check?', 'The model exists, is incremental and no full refresh was requested.'],
          ],
          style: 'reading',
        },
        {
          title: 'Modelling a case study in dbt',
          description: 'Given a raw schema and reporting questions, sketch sources, staging, intermediate and mart models, name the tests and materialisations, and explain the incremental and snapshot decisions aloud.',
          concepts: ['From raw schema to layers', 'Choosing keys and grain', 'Test plan for the case', 'Presenting the lineage'],
          quiz: [
            ['What is the first thing to fix in a fact table design?', 'Its grain: what one row represents.'],
            ['How do you decide what becomes a snapshot?', 'Dimensions whose history matters to reports.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
