import { defineTrack } from '../define'

export const dataQuality = defineTrack({
  id: 'track-data-quality',
  title: 'Data Quality and Governance',
  description: 'Making data trustworthy and accountable: quality dimensions and profiling, validation with Great Expectations, Soda and pandera, data contracts, tests in pipelines, anomaly detection, lineage and catalogues, ownership, master data, privacy and GDPR basics, retention, governance frameworks and data incident management.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '🛡️',
  tags: ['data-quality', 'governance', 'great-expectations', 'soda', 'pandera', 'lineage', 'gdpr', 'data-contracts'],
  languages: ['Python', 'SQL', 'YAML'],
  explainMode: 'data',
  code: { label: 'Python and SQL, whichever fits', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Foundations of Data Quality',
      description: 'What quality means, how to measure it, and where problems come from.',
      topics: [
        {
          title: 'Dimensions of data quality',
          description: 'Accuracy, completeness, consistency, timeliness, uniqueness and validity are separate failure modes with separate checks; naming which dimension a problem belongs to is the first step to fixing it.',
          concepts: ['Accuracy and validity', 'Completeness and uniqueness', 'Consistency across systems', 'Timeliness and freshness'],
          quiz: [
            ['A customer appears twice with different ids: which dimension?', 'Uniqueness.'],
            ['Orders arrive a day late: which dimension?', 'Timeliness.'],
          ],
        },
        {
          title: 'Where bad data comes from',
          description: 'Source system bugs, free-text entry, schema changes, integration mismatches, late or duplicated loads, and silent transformation errors; mapping each cause to the control that catches it earliest.',
          concepts: ['Source and entry errors', 'Schema drift', 'Load and integration failures', 'Transformation logic errors'],
          quiz: [
            ['Where is a schema change best caught?', 'At ingestion, before it propagates downstream.'],
            ['Why do duplicate loads happen?', 'Non-idempotent pipelines rerun after partial failures.'],
          ],
          prereqs: ['Dimensions of data quality'],
        },
        {
          title: 'Data profiling',
          description: 'Computing null rates, distinct counts, min and max, distributions and pattern frequencies per column to learn what the data actually looks like before writing any rule; profiling in SQL and with pandas or ydata-profiling.',
          concepts: ['Column statistics in SQL', 'Pattern and format frequencies', 'Profiling with pandas', 'Turning a profile into checks'],
          quiz: [
            ['What does a 40 percent null rate on a required column tell you?', 'The requirement is not enforced upstream or the load is losing data.'],
            ['Why profile before writing rules?', 'Rules based on assumptions instead of real distributions fire constantly or never.'],
          ],
          prereqs: ['Dimensions of data quality'],
        },
        {
          title: 'Quality metrics and scorecards',
          description: 'Turning checks into measurable rates (percent valid, percent complete, freshness lag) per dataset, tracking them over time, and presenting a scorecard that owners and consumers both read.',
          concepts: ['Pass rate per rule', 'Dataset quality score', 'Trend tracking', 'Scorecards for owners'],
          quiz: [
            ['Why track quality over time rather than per run?', 'Slow degradation is invisible in a single run.'],
            ['What should a scorecard show first?', 'Freshness and the checks that matter most to consumers.'],
          ],
          prereqs: ['Data profiling'],
        },
      ],
    },
    {
      title: 'Validation Frameworks',
      description: 'Turning rules into code that runs every time data moves.',
      topics: [
        {
          title: 'Great Expectations: expectations and suites',
          description: 'Expectations such as expect_column_values_to_not_be_null and expect_column_values_to_be_between grouped into suites; validating a batch of data and reading the validation result.',
          concepts: ['Expectation types', 'Expectation suites', 'Validating a batch', 'Reading validation results'],
          quiz: [
            ['What is an expectation suite?', 'A named collection of expectations applied to a dataset.'],
            ['What does mostly=0.99 do?', 'Passes if at least 99 percent of values meet the expectation.'],
          ],
        },
        {
          title: 'Great Expectations: data sources, checkpoints and Data Docs',
          description: 'Connecting to Pandas, Spark or SQL data sources, checkpoints that bundle a suite with a batch and actions, and Data Docs that render results as browsable HTML.',
          concepts: ['Data source and batch definitions', 'Checkpoints and actions', 'Data Docs output', 'Running in a pipeline step'],
          quiz: [
            ['What does a checkpoint do?', 'Runs a suite against a batch and executes actions such as building docs or notifying.'],
            ['Where would you run a checkpoint?', 'As a task in the pipeline right after loading.'],
          ],
          prereqs: ['Great Expectations: expectations and suites'],
        },
        {
          title: 'Soda and SodaCL',
          description: 'Declaring checks in YAML (row_count > 0, missing_count(email) = 0, freshness(updated_at) < 1d) and running soda scan against a warehouse; its fit for SQL-first teams.',
          concepts: ['SodaCL check syntax', 'Freshness and schema checks', 'soda scan in CI', 'Soda versus Great Expectations'],
          quiz: [
            ['How does Soda check a table is fresh?', 'freshness(column) < duration in a checks file.'],
            ['Where do Soda checks execute?', 'In the warehouse as SQL.'],
          ],
          prereqs: ['Great Expectations: expectations and suites'],
        },
        {
          title: 'pandera for DataFrame schemas',
          description: 'Defining a DataFrameSchema or DataFrameModel with column types, checks and nullability, validating pandas or Polars frames in code, and using it as a typed contract in Python pipelines.',
          concepts: ['DataFrameSchema and DataFrameModel', 'Column checks', 'Lazy validation and error reports', 'Decorating functions with schemas'],
          quiz: [
            ['What does lazy=True change?', 'All failures are collected and reported instead of stopping at the first.'],
            ['When is pandera the right tool?', 'Python transformations where validation belongs next to the code.'],
          ],
          prereqs: ['Great Expectations: expectations and suites'],
        },
        {
          title: 'Choosing and combining frameworks',
          description: 'Warehouse-native checks (dbt tests, Soda) for SQL layers, pandera for Python code, Great Expectations for cross-source suites; avoiding two tools checking the same thing.',
          concepts: ['Fit by layer and language', 'Avoiding duplicated checks', 'Operational overhead comparison', 'Results in one place'],
          quiz: [
            ['Which tool for checks inside a dbt project?', 'dbt tests, adding Soda or GX only for what they cannot express.'],
            ['Why centralise results?', 'One place to see what failed, regardless of which tool ran it.'],
          ],
          prereqs: ['Soda and SodaCL', 'pandera for DataFrame schemas'],
        },
      ],
    },
    {
      title: 'Data Contracts and Pipeline Testing',
      description: 'Agreeing what data should look like and enforcing it automatically.',
      topics: [
        {
          title: 'Data contracts',
          description: 'A contract states schema, semantics, SLAs and ownership of a dataset agreed between producer and consumer; versioned in the repo, enforced at the boundary, and changed through a review process rather than a surprise.',
          concepts: ['Contract contents', 'Producer and consumer roles', 'Versioning and change process', 'Enforcement at the boundary'],
          quiz: [
            ['Who owns a data contract?', 'The producing team, with consumers as reviewers.'],
            ['What does a contract add beyond a schema?', 'Semantics, freshness SLAs, ownership and a change process.'],
          ],
        },
        {
          title: 'Schema enforcement and evolution',
          description: 'Registering schemas (JSON Schema, Avro, Protobuf, dbt contracts), compatibility rules, and handling additive versus breaking changes with versions and deprecation windows.',
          concepts: ['Schema registration', 'Compatibility rules', 'Additive versus breaking changes', 'Deprecation windows'],
          quiz: [
            ['Is renaming a column a breaking change?', 'Yes, consumers referencing the old name fail.'],
            ['How do you ship a breaking change safely?', 'Publish a new version alongside the old with a deprecation date.'],
          ],
          prereqs: ['Data contracts'],
        },
        {
          title: 'Tests inside pipelines',
          description: 'Placing checks at ingestion, after transformation and before publishing; fail-fast versus warn-and-continue, quarantining bad rows, and blocking downstream tasks on failures.',
          concepts: ['Check placement by stage', 'Fail, warn or quarantine', 'Blocking downstream tasks', 'Row-level versus dataset-level checks'],
          quiz: [
            ['When should a failed check stop the pipeline?', 'When publishing bad data costs more than a delay.'],
            ['What is quarantining?', 'Routing failing rows to a separate table for review while good rows continue.'],
          ],
          prereqs: ['Data contracts'],
        },
        {
          title: 'Unit and regression tests for transformations',
          description: 'Testing transformation logic with small fixed inputs and expected outputs, golden datasets that catch regressions, and running these in CI so logic changes cannot silently alter results.',
          concepts: ['Fixture inputs and expected outputs', 'Golden dataset comparisons', 'CI for transformations', 'Testing edge cases'],
          quiz: [
            ['What is a golden dataset?', 'A saved expected output compared against each run of the logic.'],
            ['Why test with tiny inputs?', 'Fast, readable tests that pinpoint the failing rule.'],
          ],
          prereqs: ['Tests inside pipelines'],
        },
        {
          title: 'Reconciliation between systems',
          description: 'Comparing counts, sums and hashes between source and target after each load to catch lost or duplicated rows; tolerances for timing differences and automated reconciliation reports.',
          concepts: ['Count and sum reconciliation', 'Hash-based comparison', 'Tolerances and timing windows', 'Reconciliation reports'],
          quiz: [
            ['What is the cheapest reconciliation?', 'Row counts per partition on both sides.'],
            ['Why allow a tolerance?', 'Source and target snapshots are taken at slightly different times.'],
          ],
          prereqs: ['Tests inside pipelines'],
        },
      ],
    },
    {
      title: 'Anomaly Detection and Monitoring',
      description: 'Catching problems no one wrote a rule for.',
      topics: [
        {
          title: 'Metric-based anomaly detection',
          description: 'Tracking row counts, null rates, distinct counts and distributions per run and flagging deviations from history with z-scores, seasonal baselines or interquartile ranges instead of static thresholds.',
          concepts: ['Metrics per run', 'Z-score and IQR thresholds', 'Seasonal baselines', 'Static versus adaptive thresholds'],
          quiz: [
            ['Why not a fixed row count threshold?', 'Weekly and seasonal patterns make fixed limits fire falsely or miss drops.'],
            ['What does a sudden null rate jump usually mean?', 'An upstream field was renamed or stopped being populated.'],
          ],
        },
        {
          title: 'Distribution and drift checks',
          description: 'Comparing value distributions between runs or segments with population stability index and KS tests to detect drift in categories, ranges or proportions.',
          concepts: ['Population stability index', 'Kolmogorov-Smirnov test', 'Category share drift', 'Segment comparisons'],
          quiz: [
            ['What does PSI measure?', 'How much a distribution shifted between two periods.'],
            ['What might a new category value signal?', 'A source change or an upstream bug.'],
          ],
          prereqs: ['Metric-based anomaly detection'],
        },
        {
          title: 'Freshness and volume monitoring',
          description: 'Expected arrival times and volumes per dataset, detecting late or missing loads, and alerting on a partition that never arrived, which rule-based validation cannot see.',
          concepts: ['Expected arrival schedules', 'Volume baselines', 'Missing partition detection', 'Alerting on absence'],
          quiz: [
            ['Why can validation miss a missing load?', 'No data arrived, so no rows were checked.'],
            ['How do you detect a missing daily partition?', 'Check for the partition\'s existence after its expected arrival time.'],
          ],
          prereqs: ['Metric-based anomaly detection'],
        },
        {
          title: 'Alert design and noise reduction',
          description: 'Routing alerts to owners, severity tiers, grouping related failures, and tuning thresholds so alerts stay actionable; the cost of alert fatigue on a data team.',
          concepts: ['Routing to dataset owners', 'Severity tiers', 'Grouping and deduplication', 'Tuning for signal'],
          quiz: [
            ['What is the sign of a badly tuned alert?', 'It fires often and nobody acts on it.'],
            ['Who should receive a failed check alert?', 'The dataset owner, with consumers informed if delivery is affected.'],
          ],
          prereqs: ['Freshness and volume monitoring'],
        },
      ],
    },
    {
      title: 'Lineage, Catalogues and Metadata',
      description: 'Knowing where data came from, who uses it, and what it means.',
      topics: [
        {
          title: 'Data lineage',
          description: 'Table and column level lineage from ingestion to dashboard, captured from SQL parsing, orchestrator integrations or OpenLineage events; using it for impact analysis and root cause of quality issues.',
          concepts: ['Table and column lineage', 'Capture methods', 'OpenLineage standard', 'Impact and root cause analysis'],
          quiz: [
            ['How does lineage help during an incident?', 'It shows which downstream assets are affected and which upstream change caused it.'],
            ['What does OpenLineage emit?', 'Run events with input and output datasets.'],
          ],
        },
        {
          title: 'Metadata catalogues',
          description: 'DataHub, OpenMetadata, Amundsen and cloud catalogues index datasets with schemas, descriptions, owners, tags and usage so people can find and trust data; ingestion connectors and search.',
          concepts: ['Catalogue capabilities', 'Ingestion connectors', 'Search and discovery', 'DataHub and OpenMetadata overview'],
          quiz: [
            ['What makes a catalogue useful rather than a list?', 'Descriptions, owners, usage stats and lineage attached to each dataset.'],
            ['How does a catalogue learn about tables?', 'Connectors that ingest metadata from warehouses and tools.'],
          ],
          prereqs: ['Data lineage'],
        },
        {
          title: 'Business glossary and definitions',
          description: 'Agreed definitions for terms like active customer or net revenue linked to the columns that implement them, so the same word means the same thing in every report.',
          concepts: ['Glossary terms and owners', 'Linking terms to columns', 'Resolving conflicting definitions', 'Metrics as governed terms'],
          quiz: [
            ['Why does a glossary matter?', 'Two teams computing revenue differently produce conflicting reports.'],
            ['Where should a metric definition live?', 'In the glossary or semantic layer, linked to its implementation.'],
          ],
          prereqs: ['Metadata catalogues'],
        },
        {
          title: 'Tagging, classification and sensitivity labels',
          description: 'Tagging columns as PII, financial or confidential, automated classifiers that detect emails and card numbers, and using tags to drive masking and access policies.',
          concepts: ['Sensitivity tag scheme', 'Automated PII classifiers', 'Tag-driven policies', 'Keeping tags current'],
          quiz: [
            ['What can a PII tag automatically trigger?', 'Masking, restricted access and retention rules.'],
            ['Why automate classification?', 'New columns appear constantly and manual tagging lags.'],
          ],
          prereqs: ['Metadata catalogues'],
        },
      ],
    },
    {
      title: 'Ownership and Master Data',
      description: 'People and processes behind trustworthy data.',
      topics: [
        {
          title: 'Ownership and stewardship',
          description: 'Owners are accountable for a dataset\'s quality and access; stewards maintain definitions and resolve issues day to day; publishing ownership in the catalogue and in on-call rotations.',
          concepts: ['Owner versus steward roles', 'Ownership in the catalogue', 'Escalation paths', 'Ownership for shared datasets'],
          quiz: [
            ['What does a data owner decide?', 'Who may access the data and what quality it must meet.'],
            ['What happens to datasets with no owner?', 'Nobody fixes them; assign owners or retire them.'],
          ],
        },
        {
          title: 'Master data management',
          description: 'A single trusted record for customers, products and suppliers built by matching, merging and surviving attributes from multiple systems, and the golden record concept.',
          concepts: ['Golden records', 'Matching and merge rules', 'Survivorship rules', 'MDM architectures'],
          quiz: [
            ['What is a golden record?', 'The reconciled best version of an entity across systems.'],
            ['What is survivorship?', 'Rules deciding which source wins for each attribute in a merge.'],
          ],
          prereqs: ['Ownership and stewardship'],
        },
        {
          title: 'Reference data and code lists',
          description: 'Country codes, currencies, product categories and status codes managed centrally with versions and effective dates; mapping tables between systems that use different codes.',
          concepts: ['Central code lists', 'Versioning with effective dates', 'Cross-system mappings', 'Reference data in pipelines'],
          quiz: [
            ['Why version reference data?', 'Historical records must be interpreted with the codes valid at the time.'],
            ['What breaks when a status code list changes silently?', 'Downstream filters and joins drop or misclassify rows.'],
          ],
          prereqs: ['Master data management'],
        },
        {
          title: 'Entity resolution and deduplication',
          description: 'Deterministic and probabilistic matching of records that refer to the same entity, blocking to keep comparisons tractable, and tools such as Splink for scalable matching.',
          concepts: ['Deterministic matching rules', 'Probabilistic matching', 'Blocking strategies', 'Splink overview'],
          quiz: [
            ['Why is blocking needed?', 'Comparing every pair is quadratic; blocking limits candidates to plausible pairs.'],
            ['What does a probabilistic model output?', 'A match probability per pair, thresholded into matches.'],
          ],
          prereqs: ['Master data management'],
        },
      ],
    },
    {
      title: 'Privacy, Retention and Compliance',
      description: 'Handling personal data lawfully and deleting what should be gone.',
      topics: [
        {
          title: 'GDPR basics for engineers',
          description: 'Lawful basis, purpose limitation, data minimisation, data subject rights (access, erasure, portability), controllers versus processors, and what each obligation means for pipelines and storage.',
          concepts: ['Core principles', 'Data subject rights', 'Controllers and processors', 'Engineering obligations'],
          quiz: [
            ['What does a right-to-erasure request require of a pipeline?', 'Deleting or anonymising the person\'s data everywhere it was copied, including backups on schedule.'],
            ['What is data minimisation?', 'Collecting and keeping only what the purpose requires.'],
          ],
        },
        {
          title: 'PII classification and handling',
          description: 'Identifying direct and indirect identifiers, quasi-identifiers that re-identify in combination, and designing storage so PII is isolated, tagged and access-controlled.',
          concepts: ['Direct and indirect identifiers', 'Quasi-identifier risk', 'Isolating PII in storage', 'Access control for PII'],
          quiz: [
            ['Is a postcode plus birth date PII?', 'Together they are quasi-identifiers that can re-identify a person.'],
            ['Where should raw PII live?', 'In a restricted zone with tags and access limited to necessary roles.'],
          ],
          prereqs: ['GDPR basics for engineers'],
        },
        {
          title: 'Anonymisation, pseudonymisation and masking',
          description: 'Hashing with a secret salt, tokenisation, generalisation and k-anonymity, dynamic masking in warehouses, and why hashing alone is not anonymisation.',
          concepts: ['Pseudonymisation with tokens', 'Generalisation and k-anonymity', 'Dynamic masking', 'Limits of hashing'],
          quiz: [
            ['Why is a plain SHA-256 of an email not anonymous?', 'Anyone can hash a known email and match it.'],
            ['What is k-anonymity?', 'Each record is indistinguishable from at least k-1 others on quasi-identifiers.'],
          ],
          prereqs: ['PII classification and handling'],
        },
        {
          title: 'Retention and lifecycle policies',
          description: 'Retention periods per dataset driven by legal and business needs, automated deletion or archiving, and proving deletion happened, including in derived tables and backups.',
          concepts: ['Retention schedule per dataset', 'Automated expiry', 'Deletion in derived data', 'Evidence of deletion'],
          quiz: [
            ['Why is deletion hard in a data platform?', 'Copies exist in raw, curated, derived tables and backups.'],
            ['How do you prove a record was deleted?', 'Logged deletion jobs and verification queries across all stores.'],
          ],
          prereqs: ['GDPR basics for engineers'],
        },
        {
          title: 'Audit logging and access reviews',
          description: 'Logging who accessed which data, periodic access reviews that remove stale grants, and audit trails for changes to sensitive tables as evidence for compliance.',
          concepts: ['Access logs in warehouses', 'Periodic access reviews', 'Change audit trails', 'Evidence for auditors'],
          quiz: [
            ['What should an access review remove?', 'Grants to people or services that no longer need them.'],
            ['Where do warehouses expose access history?', 'Query and access history views such as Snowflake ACCESS_HISTORY.'],
          ],
          prereqs: ['Retention and lifecycle policies'],
        },
      ],
    },
    {
      title: 'Governance and Incident Management',
      description: 'Running quality as an operational discipline.',
      topics: [
        {
          title: 'Governance frameworks',
          description: 'DAMA-DMBOK knowledge areas, data mesh federated governance, and lightweight policy-as-code approaches; choosing enough structure for the organisation without a bureaucracy nobody follows.',
          concepts: ['DAMA-DMBOK overview', 'Federated governance in data mesh', 'Policy as code', 'Right-sizing governance'],
          quiz: [
            ['What does federated governance mean?', 'Global standards set centrally, applied by domain teams that own their data.'],
            ['What is policy as code?', 'Governance rules enforced by automated checks in pipelines and CI.'],
          ],
        },
        {
          title: 'Data quality SLAs',
          description: 'Committing to freshness, completeness and accuracy targets per dataset with measurable indicators and error budgets, and what happens when a target is missed.',
          concepts: ['Quality SLIs and SLOs', 'Error budgets for data', 'Publishing SLAs to consumers', 'Consequences of misses'],
          quiz: [
            ['What is a reasonable freshness SLO for a daily report table?', 'Available by an agreed hour, such as 07:00, on 99 percent of days.'],
            ['What does an error budget allow?', 'A tolerated number of misses before escalation or freezes.'],
          ],
          prereqs: ['Governance frameworks'],
        },
        {
          title: 'Data incident management',
          description: 'Detecting, triaging, communicating and resolving a data incident: severity levels, status updates to consumers, freezing downstream publishes, and backfilling corrected data.',
          concepts: ['Severity classification', 'Consumer communication', 'Containment and freezes', 'Correction and backfill'],
          quiz: [
            ['What is the first action after confirming bad data was published?', 'Tell consumers and stop further downstream propagation.'],
            ['When is an incident closed?', 'When corrected data is published and consumers are informed.'],
          ],
          prereqs: ['Data quality SLAs'],
        },
        {
          title: 'Postmortems and preventive controls',
          description: 'Blameless postmortems that trace the timeline and root cause, then convert findings into new checks, contracts or process changes; tracking action items to closure.',
          concepts: ['Blameless timeline', 'Root cause analysis', 'Turning findings into checks', 'Action item tracking'],
          quiz: [
            ['What should every postmortem produce?', 'At least one concrete control that would have caught the issue earlier.'],
            ['Why blameless?', 'People report honestly when they are not punished for mistakes.'],
          ],
          prereqs: ['Data incident management'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: Great Expectations gate in a pipeline',
          description: 'Profile a public dataset, write an expectation suite from the profile, run a checkpoint in an Airflow or script step that blocks the load on failure, quarantine bad rows, and publish Data Docs.',
          concepts: ['Profile and draft the suite', 'Wire a checkpoint into the pipeline', 'Quarantine failing rows', 'Publish and review Data Docs'],
          quiz: [
            ['What decides whether the load proceeds?', 'The checkpoint result: success continues, failure stops the task.'],
            ['Where do quarantined rows go?', 'A separate table with the failed expectation recorded.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: data contract with schema enforcement',
          description: 'Write a YAML contract for an events dataset with schema, SLAs and owner, generate a JSON Schema and pandera model from it, enforce it at ingestion, and add a CI check that rejects breaking changes to the contract.',
          concepts: ['Author the contract file', 'Generate validators from it', 'Enforce at ingestion', 'Breaking-change check in CI'],
          quiz: [
            ['How does CI detect a breaking change?', 'It diffs the contract against the last version and flags removed or retyped fields.'],
            ['Why generate validators from the contract?', 'One source of truth; the code cannot drift from the agreement.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: anomaly monitor for warehouse tables',
          description: 'A job that records row counts, null rates and distinct counts per table daily, computes seasonal baselines, flags anomalies with z-scores, and posts alerts to Slack with the affected owner from a catalogue file.',
          concepts: ['Collect metrics per table', 'Compute baselines', 'Flag and rank anomalies', 'Route alerts to owners'],
          quiz: [
            ['Why a seasonal baseline?', 'Weekend volumes differ from weekdays, so a single mean misfires.'],
            ['What should the alert include?', 'Table, metric, expected range, observed value and owner.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: PII discovery and erasure workflow',
          description: 'Scan a warehouse for PII columns with pattern classifiers, tag them in a catalogue, implement a right-to-erasure job that deletes or pseudonymises a subject across all tagged tables, and log evidence.',
          concepts: ['Classify PII columns', 'Tag in the catalogue', 'Implement the erasure job', 'Log and verify deletion'],
          quiz: [
            ['How does the erasure job know where to look?', 'From the PII tags on columns in the catalogue.'],
            ['What is the evidence of completion?', 'A log with tables, row counts affected and a verification query result.'],
          ],
          style: 'project',
        },
        {
          title: 'Data quality and governance interview questions',
          description: 'Explaining the quality dimensions, where to place checks, how contracts work, lineage tools, handling PII and GDPR requests, and how you ran a data incident.',
          concepts: ['Quality dimension questions', 'Validation and contract questions', 'Privacy and compliance questions', 'Incident experience questions'],
          quiz: [
            ['How would you handle an erasure request in a lake with many copies?', 'Use lineage and tags to locate copies, delete or pseudonymise each, and log evidence.'],
            ['Where do you put the first data quality check?', 'At ingestion, before anything downstream depends on the data.'],
          ],
          style: 'reading',
        },
        {
          title: 'Designing a quality programme for a case study',
          description: 'Given a company with a warehouse, several teams and no ownership, propose owners, contracts, checks by layer, monitoring, a catalogue and an incident process, with a phased rollout.',
          concepts: ['Assessing the current state', 'Prioritising datasets', 'Controls by layer', 'Phased rollout plan'],
          quiz: [
            ['Where do you start?', 'With the few datasets that drive the most decisions and assign owners.'],
            ['What is the risk of rolling out everything at once?', 'Alert noise and unowned failures that erode trust in the programme.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
