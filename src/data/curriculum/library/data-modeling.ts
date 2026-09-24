import { defineTrack } from '../define'

export const dataModeling = defineTrack({
  id: 'track-data-modeling',
  title: 'Data Modeling',
  description: 'Designing schemas that hold up: conceptual to physical models, entity-relationship diagrams, normalisation and denormalisation, keys and constraints, dimensional modelling with facts, dimensions and grain, slowly changing dimensions, bridge and factless tables, events and time, application versus analytical models, schema evolution and documentation.',
  family: 'Data Engineering',
  kind: 'domain',
  icon: '📐',
  tags: ['data modeling', 'erd', 'normalization', 'dimensional modeling', 'star schema', 'scd', 'schema design'],
  languages: ['SQL'],
  explainMode: 'sql',
  code: { label: 'SQL (PostgreSQL dialect)', id: 'sql', fixed: true },
  supports: { design: true, project: true },
  prerequisites: ['track-sql'],
  style: 'design',
  categories: [
    {
      title: 'Modelling Levels and Process',
      description: 'From business conversation to CREATE TABLE.',
      topics: [
        {
          title: 'Conceptual, logical and physical models',
          description: 'The conceptual model names business things and relationships, the logical model adds attributes, keys and cardinalities independent of any database, and the physical model maps it to tables, types, indexes and partitions of one engine.',
          concepts: ['Conceptual model scope', 'Logical model with keys and attributes', 'Physical model per engine', 'Keeping the three in sync'],
          quiz: [
            ['Which level mentions data types and indexes?', 'The physical model.'],
            ['Why keep a logical model separate from the physical one?', 'It records business meaning independently of engine-specific choices, so it survives migrations.'],
          ],
        },
        {
          title: 'Gathering requirements and business questions',
          description: 'Models are shaped by the questions they must answer: interviewing stakeholders, collecting the reports and metrics they need, listing source systems, and writing the questions down so every table can be traced to one.',
          concepts: ['Stakeholder interviews', 'Cataloguing questions and metrics', 'Source system inventory', 'Traceability from question to table'],
          quiz: [
            ['What is the first artefact of a modelling engagement?', 'A list of the business questions and metrics the model must support.'],
            ['Why inventory source systems early?', 'Available keys and attributes constrain what the model can represent.'],
          ],
        },
        {
          title: 'Choosing the grain',
          description: 'Grain states exactly what one row represents (one order line, one daily balance per account). Declaring it first prevents mixed-grain tables that double-count and makes every later measure and dimension decision mechanical.',
          concepts: ['Declaring grain in one sentence', 'Atomic versus aggregated grain', 'Mixed-grain mistakes', 'Grain and row count estimates'],
          quiz: [
            ['What goes wrong when a table mixes order and order-line grain?', 'Sums double-count because order-level values repeat per line.'],
            ['Why prefer the most atomic grain?', 'Any coarser grain can be derived from it, but not the reverse.'],
          ],
          prereqs: ['Gathering requirements and business questions'],
        },
        {
          title: 'Notation and modelling tools',
          description: 'Crow\'s foot, Chen and IE notations for ER diagrams, UML class diagrams for application models, and text-first tools (dbdiagram, DBML, Mermaid erDiagram) that keep diagrams in version control next to the DDL.',
          concepts: ['Crow\'s foot cardinality symbols', 'Chen and IE notation', 'Mermaid and DBML diagrams as code', 'Generating DDL from models'],
          quiz: [
            ['What does the crow\'s foot symbol mean?', 'The "many" side of a relationship.'],
            ['Why keep diagrams as text?', 'They diff, review and version like code.'],
          ],
          prereqs: ['Conceptual, logical and physical models'],
        },
      ],
    },
    {
      title: 'Entity-Relationship Modelling',
      description: 'Entities, relationships and the shapes that recur in every domain.',
      topics: [
        {
          title: 'Entities, attributes and identifiers',
          description: 'Deciding what deserves to be an entity versus an attribute, choosing a stable identifier, separating identifying from descriptive attributes, and spotting hidden entities inside repeated or multi-valued columns.',
          concepts: ['Entity versus attribute decisions', 'Stable identifiers', 'Multi-valued attributes as entities', 'Naming conventions for entities'],
          quiz: [
            ['When should a colour column become a Colour entity?', 'When colours have their own attributes or must be maintained as a controlled list.'],
            ['What makes an identifier stable?', 'It never changes for the life of the entity and is never reused.'],
          ],
        },
        {
          title: 'Relationships and cardinality',
          description: 'One-to-one, one-to-many and many-to-many with minimum and maximum cardinality (optional or mandatory), where the foreign key lives in each case, and how optionality becomes nullability.',
          concepts: ['One-to-one and where the key lives', 'One-to-many foreign keys', 'Optional versus mandatory participation', 'Cardinality to nullability mapping'],
          quiz: [
            ['In a one-to-many relationship, which table holds the foreign key?', 'The many side.'],
            ['How is an optional relationship expressed physically?', 'A nullable foreign key column.'],
          ],
          prereqs: ['Entities, attributes and identifiers'],
        },
        {
          title: 'Resolving many-to-many relationships',
          description: 'An associative (junction) entity with a composite key or its own surrogate resolves many-to-many, and often turns out to be a real entity with dates and attributes, such as an enrolment or a subscription.',
          concepts: ['Junction tables and composite keys', 'Associative entities with attributes', 'Surrogate keys on junctions', 'Ternary relationships'],
          quiz: [
            ['What columns does a minimal junction table have?', 'The two foreign keys forming a composite primary key.'],
            ['When does a junction need its own surrogate key?', 'When other tables reference it or it carries its own history.'],
          ],
          prereqs: ['Relationships and cardinality'],
        },
        {
          title: 'Supertypes and subtypes',
          description: 'Modelling inheritance (Party as Person or Organisation): single table with a type column, one table per subtype with a shared parent, or one table per concrete type, and the query and constraint trade-offs of each.',
          concepts: ['Single-table with discriminator', 'Class-table inheritance', 'Concrete-table inheritance', 'Exclusive versus overlapping subtypes'],
          quiz: [
            ['What is the drawback of single-table inheritance?', 'Many nullable columns and weak constraints on subtype-specific fields.'],
            ['How do you enforce that a Party is exactly one subtype?', 'A type column checked by constraints, or a shared key with exclusive foreign keys.'],
          ],
          prereqs: ['Entities, attributes and identifiers'],
        },
        {
          title: 'Weak entities and identifying relationships',
          description: 'Entities that only exist within a parent (order lines, invoice items) take part of their key from the parent; identifying relationships model this and cascade deletes naturally.',
          concepts: ['Weak entity definition', 'Composite keys including the parent', 'Identifying relationship notation', 'Cascade behaviour'],
          quiz: [
            ['What is the natural key of an order line?', 'order_id plus line_number.'],
            ['What should happen to lines when an order is deleted?', 'They are deleted too, via ON DELETE CASCADE.'],
          ],
          prereqs: ['Relationships and cardinality'],
        },
      ],
    },
    {
      title: 'Normalisation, Keys and Constraints',
      description: 'The rules that keep data consistent, and when to bend them.',
      topics: [
        {
          title: 'Functional dependencies and normal forms',
          description: 'Working normalisation as a design tool: identify functional dependencies, split tables to reach 3NF or BCNF, and recognise the update, insert and delete anomalies each form removes (the basic definitions live in track-sql).',
          concepts: ['Identifying functional dependencies', 'Decomposing to 3NF and BCNF', 'Anomalies each form prevents', 'Lossless decomposition'],
          quiz: [
            ['What dependency violates 2NF?', 'A non-key attribute depending on part of a composite key.'],
            ['What does BCNF add over 3NF?', 'Every determinant must be a candidate key.'],
          ],
        },
        {
          title: 'Denormalisation trade-offs',
          description: 'Deliberately duplicating data for read speed: pre-joined columns, counters and summary tables, with the write-side cost of keeping copies consistent and the triggers, jobs or application logic that do so.',
          concepts: ['Read speed versus write complexity', 'Cached counters and summaries', 'Keeping copies consistent', 'Documenting derived columns'],
          quiz: [
            ['What must accompany every denormalised column?', 'A documented mechanism that keeps it in sync with its source.'],
            ['When is denormalisation clearly justified?', 'When read volume dominates and the joins measurably hurt.'],
          ],
          prereqs: ['Functional dependencies and normal forms'],
        },
        {
          title: 'Natural, surrogate and composite keys',
          description: 'Natural keys carry meaning but change and leak; surrogate integers or UUIDs are stable and compact; composite keys express identity but bloat child tables. Most designs use a surrogate primary key plus a unique natural key.',
          concepts: ['Natural key risks', 'Integer versus UUID surrogates', 'Composite keys in child tables', 'Unique constraints on natural keys'],
          quiz: [
            ['Why is an email address a poor primary key?', 'It changes, may be reused and is sensitive.'],
            ['What is a downside of random UUID primary keys?', 'Index fragmentation and larger keys in every child table.'],
          ],
        },
        {
          title: 'Constraints as model enforcement',
          description: 'Foreign keys, unique, check and exclusion constraints encode business rules in the database so bad data is rejected at write time, which is cheaper than finding it in a report months later.',
          concepts: ['Foreign key actions', 'CHECK constraints for domain rules', 'Exclusion constraints for overlaps', 'Deferrable constraints', 'Constraints versus application validation'],
          quiz: [
            ['How do you prevent negative quantities?', 'CHECK (quantity > 0).'],
            ['When are deferrable constraints needed?', 'When rows that reference each other must be inserted in the same transaction.'],
          ],
          prereqs: ['Natural, surrogate and composite keys'],
        },
        {
          title: 'Nullability, defaults and domains',
          description: 'Each nullable column is a design decision: what NULL means, whether a default or a sentinel is better, and whether an enum, lookup table or domain type should restrict values.',
          concepts: ['Meaning of NULL per column', 'Defaults versus sentinels', 'Enums versus lookup tables', 'Domain types'],
          quiz: [
            ['Why prefer a lookup table to a CHECK-list enum?', 'Values can change without a migration and can carry descriptions.'],
            ['What is the risk of a NOT NULL column with a default of 0?', 'Missing data becomes indistinguishable from a real zero.'],
          ],
        },
      ],
    },
    {
      title: 'Dimensional Modelling',
      description: 'The star schema and its vocabulary.',
      topics: [
        {
          title: 'Facts, dimensions and grain',
          description: 'Fact tables hold measurements at a declared grain with foreign keys to dimensions; dimensions hold the descriptive context used to filter and group. Getting grain and measure additivity right is most of the work.',
          concepts: ['Fact rows as measurements', 'Dimension rows as context', 'Foreign keys to dimensions', 'Additive, semi-additive and non-additive measures'],
          quiz: [
            ['Give an example of a semi-additive measure.', 'Account balance: it sums across accounts but not across time.'],
            ['Which table type is usually the widest?', 'Dimensions, with many descriptive columns.'],
          ],
          prereqs: ['Choosing the grain'],
        },
        {
          title: 'Star versus snowflake schemas',
          description: 'A star denormalises each dimension into one table for simple, fast queries; a snowflake normalises dimension hierarchies into several tables to save space and centralise maintenance, at the cost of more joins.',
          concepts: ['Denormalised dimensions', 'Normalised dimension hierarchies', 'Query and BI tool implications', 'Outrigger dimensions'],
          quiz: [
            ['Why do BI tools prefer star schemas?', 'Fewer joins and simpler paths from fact to attribute.'],
            ['What is an outrigger?', 'A secondary dimension table referenced from a dimension, a limited snowflake.'],
          ],
          prereqs: ['Facts, dimensions and grain'],
        },
        {
          title: 'Fact table types',
          description: 'Transaction facts record events at the moment they happen, periodic snapshots record state at regular intervals, and accumulating snapshots track a process through milestones with one row updated over time.',
          concepts: ['Transaction fact tables', 'Periodic snapshot facts', 'Accumulating snapshot facts', 'Choosing the type per process'],
          quiz: [
            ['Which fact type is updated after insertion?', 'The accumulating snapshot, as each milestone date fills in.'],
            ['How would you model daily inventory levels?', 'A periodic snapshot fact at day and product grain.'],
          ],
          prereqs: ['Facts, dimensions and grain'],
        },
        {
          title: 'Conformed dimensions and the bus matrix',
          description: 'Shared dimensions with identical keys and attributes across fact tables allow drill-across queries; the bus matrix documents which processes use which dimensions and drives the build order.',
          concepts: ['Shared keys and attributes', 'Drill-across queries', 'Bus matrix as a plan', 'Ownership of conformed dimensions'],
          quiz: [
            ['What is a drill-across query?', 'Combining measures from two fact tables through a shared conformed dimension.'],
            ['What breaks conformance?', 'Two copies of a dimension with different keys or attribute values.'],
          ],
          prereqs: ['Star versus snowflake schemas'],
        },
        {
          title: 'Degenerate, junk and role-playing dimensions',
          description: 'Order numbers stay in the fact as degenerate dimensions, low-cardinality flags are combined into a junk dimension, and one date dimension plays several roles (order date, ship date) through multiple foreign keys.',
          concepts: ['Degenerate dimensions', 'Junk dimensions for flags', 'Role-playing dimensions via views', 'Avoiding centipede fact tables'],
          quiz: [
            ['Why not create a dimension table for order number?', 'It has no attributes; keep it in the fact as a degenerate dimension.'],
            ['How does one date table serve order_date and ship_date?', 'Two foreign keys to the same dimension, often exposed through aliased views.'],
          ],
          prereqs: ['Facts, dimensions and grain'],
        },
        {
          title: 'Measures, ratios and counts',
          description: 'Storing components (numerator and denominator) rather than ratios, counting with a quantity column, handling currencies and units, and avoiding measures that cannot be aggregated across the dimensions users expect.',
          concepts: ['Store components not ratios', 'Count columns and row counts', 'Units and currency conversion', 'Distinct counts and their limits'],
          quiz: [
            ['Why store numerator and denominator instead of a percentage?', 'Percentages cannot be summed; components can be aggregated then divided.'],
            ['Can distinct customer counts be summed across months?', 'No, the same customer may appear in several months.'],
          ],
          prereqs: ['Facts, dimensions and grain'],
        },
      ],
    },
    {
      title: 'Advanced Dimensional Patterns',
      description: 'History, many-valued relationships and hierarchies.',
      topics: [
        {
          title: 'Slowly changing dimensions in the model',
          description: 'Choosing per attribute whether history is overwritten (Type 1), versioned (Type 2) or kept as a previous value (Type 3), and the surrogate key, effective dates and current flag a Type 2 dimension needs.',
          concepts: ['Per-attribute SCD decisions', 'Type 2 columns: dates, flag, version', 'Mixed-type dimensions', 'Impact on fact key lookups'],
          quiz: [
            ['Which columns identify the current version of a Type 2 row?', 'is_current = true, or end_date IS NULL.'],
            ['Can one dimension mix Type 1 and Type 2 attributes?', 'Yes; overwrite some columns and version on others.'],
          ],
          prereqs: ['Facts, dimensions and grain'],
        },
        {
          title: 'Bridge tables and many-valued dimensions',
          description: 'When a fact relates to many dimension rows (a patient with several diagnoses), a bridge table with an optional weighting factor connects them without exploding fact rows or double-counting totals.',
          concepts: ['Bridge table structure', 'Weighting factors', 'Group keys on the fact', 'Double-counting risks'],
          quiz: [
            ['What does a weighting factor do?', 'Splits a measure across bridged rows so totals still sum correctly.'],
            ['What happens if you join a fact to a bridge without weights and sum?', 'Measures are multiplied by the number of bridged rows.'],
          ],
          prereqs: ['Resolving many-to-many relationships'],
        },
        {
          title: 'Factless fact tables',
          description: 'Tables with only dimension keys record that an event happened (student attended class) or that a condition held (product on promotion), enabling coverage and "what did not happen" questions.',
          concepts: ['Event factless facts', 'Coverage factless facts', 'Answering negative questions', 'Counting rows as the measure'],
          quiz: [
            ['How do you find products on promotion that did not sell?', 'Left-join the coverage factless table to sales and keep rows with no match.'],
            ['What is the measure in a factless fact?', 'The count of rows.'],
          ],
          prereqs: ['Fact table types'],
        },
        {
          title: 'Hierarchies: fixed, ragged and parent-child',
          description: 'Fixed-depth hierarchies flatten into columns, ragged ones need padding or a bridge, and parent-child tables model arbitrary depth but need recursion or a closure table to query efficiently.',
          concepts: ['Flattened fixed-depth levels', 'Ragged hierarchies and padding', 'Parent-child self references', 'Hierarchy bridge and closure tables'],
          quiz: [
            ['What is a closure table?', 'A table of every ancestor-descendant pair with depth, precomputed for fast queries.'],
            ['Why flatten a fixed-depth hierarchy?', 'BI tools can group by level columns without recursion.'],
          ],
          prereqs: ['Star versus snowflake schemas'],
        },
        {
          title: 'Date and time dimensions',
          description: 'A date dimension with one row per day carries fiscal periods, holidays and weekday flags so queries never compute them; time of day is a separate dimension or a fact attribute, and timestamps stay on the fact.',
          concepts: ['One row per calendar day', 'Fiscal calendars and holidays', 'Separate time-of-day dimension', 'Smart date keys'],
          quiz: [
            ['Why is a date dimension better than date functions in queries?', 'Fiscal periods and holidays are business rules that functions cannot know.'],
            ['What is a smart date key?', 'An integer like 20250315 used as the dimension key.'],
          ],
          prereqs: ['Facts, dimensions and grain'],
        },
      ],
    },
    {
      title: 'Modelling Events and Time',
      description: 'Immutable histories and the two kinds of time.',
      topics: [
        {
          title: 'Event modelling',
          description: 'Storing what happened as immutable, timestamped event rows with a type and a payload, deriving current state from them, and the wide-event and activity-schema styles that keep analytics queries simple.',
          concepts: ['Immutable event rows', 'Event types and payloads', 'Deriving state from events', 'Wide events and activity schema'],
          quiz: [
            ['Why never update an event row?', 'Events are facts about the past; corrections are new events.'],
            ['How do you get the current status of an order from events?', 'Take the latest event per order by timestamp.'],
          ],
        },
        {
          title: 'Valid time and transaction time',
          description: 'Valid time is when a fact was true in the world; transaction time is when the database learned it. Bitemporal tables keep both so a report can be reproduced exactly as it looked on a past date.',
          concepts: ['Valid-time columns', 'Transaction-time columns', 'Bitemporal tables', 'As-of queries on both axes'],
          quiz: [
            ['A salary change effective 1 March is entered on 10 March. Which is which?', 'Valid time starts 1 March; transaction time starts 10 March.'],
            ['What question needs both times?', 'What did we believe on 5 March about the salary on 2 March?'],
          ],
          prereqs: ['Event modelling'],
        },
        {
          title: 'Modelling state changes',
          description: 'Status history tables with effective ranges, current-state columns maintained alongside them, and the choice between range columns, PostgreSQL range types and event logs for reconstructing state at any moment.',
          concepts: ['Status history with ranges', 'Current state plus history', 'Range types versus start and end', 'Reconstructing state at a time'],
          quiz: [
            ['Why keep a current_status column if history exists?', 'Cheap lookups without scanning history.'],
            ['How do you prevent overlapping status ranges for one entity?', 'An exclusion constraint on (entity_id, period).'],
          ],
          prereqs: ['Valid time and transaction time'],
        },
        {
          title: 'Aggregation and rollup tables',
          description: 'Designing summary tables at coarser grains, keeping them consistent with atomic facts, and modelling the time buckets and dimensions they preserve so they answer the questions that justified them.',
          concepts: ['Choosing rollup grains', 'Which dimensions to keep', 'Refresh strategies', 'Consistency with atomic tables'],
          quiz: [
            ['What must a rollup preserve to be useful?', 'The dimensions and time grain that common queries filter by.'],
            ['How do you check a rollup is consistent?', 'Compare its totals with the atomic fact for the same period.'],
          ],
          prereqs: ['Measures, ratios and counts'],
        },
      ],
    },
    {
      title: 'Application versus Analytical Models',
      description: 'The same business, two very different schemas.',
      topics: [
        {
          title: 'Schema design for applications',
          description: 'OLTP schemas optimise for correctness and fast writes: normalised tables, tight constraints, indexes matched to access paths, and avoiding wide tables that lock and bloat under frequent updates.',
          concepts: ['Normalised transactional tables', 'Indexes from access paths', 'Hot-row and wide-table pitfalls', 'Soft deletes and audit columns'],
          quiz: [
            ['Why avoid a single wide users table with 80 columns?', 'Every update rewrites a large row and unrelated features contend on it.'],
            ['What audit columns are standard on transactional tables?', 'created_at, updated_at and often created_by.'],
          ],
          prereqs: ['Constraints as model enforcement'],
        },
        {
          title: 'Analytical schemas and wide tables',
          description: 'Analytics favour star schemas or One Big Table: pre-joined wide tables with many columns that columnar engines scan cheaply, at the cost of duplication and refresh logic.',
          concepts: ['One Big Table pattern', 'Star schema versus OBT', 'Columnar storage changes the trade-off', 'Refreshing wide tables'],
          quiz: [
            ['Why is a wide denormalised table acceptable in a warehouse?', 'Columnar engines read only the columns used, so width costs little.'],
            ['What does OBT lose compared to a star?', 'Reusable dimensions and a single place to fix attribute values.'],
          ],
          prereqs: ['Star versus snowflake schemas'],
        },
        {
          title: 'Semi-structured columns in relational models',
          description: 'Using JSONB columns for sparse or fast-changing attributes next to fixed columns for everything queried and constrained, and the point where JSON should be promoted to real columns or tables.',
          concepts: ['Fixed columns versus JSON payloads', 'Constraints and indexes on JSON', 'Promoting keys to columns', 'Schema-on-read risks'],
          quiz: [
            ['When should a JSON key become a column?', 'When it is filtered, joined or constrained regularly.'],
            ['What is lost by putting everything in JSON?', 'Type safety, constraints and cheap column statistics.'],
          ],
          prereqs: ['Schema design for applications'],
        },
        {
          title: 'Modelling for document and key-value stores',
          description: 'Embedding versus referencing in document databases, designing around the queries rather than the entities, and the duplication and consistency trade-offs relational modellers must consciously accept.',
          concepts: ['Embedding versus referencing', 'Query-first design', 'Duplication and update fan-out', 'Migrating between models'],
          quiz: [
            ['When should a sub-document be embedded?', 'When it is always read with its parent and bounded in size.'],
            ['What is the cost of embedding a customer in every order?', 'Updating the customer requires touching every order.'],
          ],
          prereqs: ['Schema design for applications'],
        },
      ],
    },
    {
      title: 'Evolution and Documentation',
      description: 'Models change; making that safe and understandable.',
      topics: [
        {
          title: 'Schema evolution and migrations',
          description: 'Additive changes first, expand-and-contract for renames and type changes, backfills in batches, and never dropping a column while a consumer still reads it (migration tooling itself is covered in track-sql).',
          concepts: ['Backward-compatible changes', 'Expand and contract', 'Batched backfills', 'Deprecating columns safely'],
          quiz: [
            ['How do you rename a column without downtime?', 'Add the new column, dual-write, backfill, switch readers, then drop the old one.'],
            ['Which change is always safe for readers?', 'Adding a nullable column.'],
          ],
        },
        {
          title: 'Versioning models and data contracts',
          description: 'Publishing a schema as a contract with owners, semantics and compatibility rules, versioning it, and validating producers against it so downstream models break in CI rather than in production.',
          concepts: ['Schema as a contract', 'Compatibility rules', 'Semantic versioning of schemas', 'Contract checks in CI'],
          quiz: [
            ['What does a data contract contain beyond column types?', 'Ownership, meaning, constraints and change policy.'],
            ['Which change is breaking under a contract?', 'Removing or renaming a field, or narrowing a type.'],
          ],
          prereqs: ['Schema evolution and migrations'],
        },
        {
          title: 'Documenting models',
          description: 'A data dictionary with column meanings and units, ERDs kept as code, naming conventions, and tool-generated docs (dbt docs, schema comments) so the model explains itself to the next engineer.',
          concepts: ['Data dictionary content', 'Naming conventions', 'COMMENT ON in the database', 'Generated documentation'],
          quiz: [
            ['Where is the best place to store a column description?', 'In the database with COMMENT ON, so tools can extract it.'],
            ['What should a naming convention decide?', 'Case, singular or plural, key suffixes and date column patterns.'],
          ],
        },
        {
          title: 'Reviewing and validating a model',
          description: 'Walking the model against the business questions, writing sample queries for each, checking grain, keys, nullability and hierarchies, and hunting anti-patterns such as EAV tables, missing keys and fan traps.',
          concepts: ['Question-driven walkthroughs', 'Sample queries as tests', 'Anti-patterns: EAV, fan and chasm traps', 'Review checklists'],
          quiz: [
            ['What is a fan trap?', 'A join path through a one-to-many-to-many that multiplies measures.'],
            ['Why write a query for each business question during review?', 'It proves the model can answer it before any data is loaded.'],
          ],
          prereqs: ['Documenting models'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Model real domains end to end, then explain your choices.',
      style: 'project',
      topics: [
        {
          title: 'Project: application schema for a marketplace',
          description: 'Model buyers, sellers, listings, orders, payments and reviews for a marketplace: ERD in Mermaid, normalised DDL with constraints, indexes for the main screens, and a migration that adds a feature without downtime.',
          concepts: ['ERD and entity decisions', 'Normalised DDL with constraints', 'Indexes for the marketplace queries', 'A zero-downtime migration'],
          quiz: [
            ['How are order and payment related?', 'One-to-many if partial payments and refunds are allowed.'],
            ['Which constraint prevents a seller reviewing their own listing?', 'A CHECK or trigger comparing reviewer and seller ids.'],
          ],
        },
        {
          title: 'Project: dimensional model for the marketplace',
          description: 'Turn the application schema into a star schema: bus matrix, grain per fact, SCD Type 2 seller and listing dimensions, a date dimension, a bridge for listing categories, and SQL that answers ten business questions.',
          concepts: ['Bus matrix and grains', 'Dimensions with history', 'Bridge and factless tables', 'Question queries'],
          quiz: [
            ['What is the grain of the payments fact?', 'One row per payment transaction.'],
            ['Why a bridge for categories?', 'A listing can belong to several categories.'],
          ],
        },
        {
          title: 'Project: event and bitemporal model',
          description: 'Design an event log for subscription changes, derive a current-state table and a bitemporal history that can answer "what did we know on date X", with exclusion constraints preventing overlaps.',
          concepts: ['Event table design', 'Derived current state', 'Bitemporal history table', 'Overlap constraints and tests'],
          quiz: [
            ['How is a backdated correction stored?', 'A new event with an earlier valid time and the current transaction time.'],
            ['What guarantees no two valid periods overlap?', 'An exclusion constraint with a GiST index on the range.'],
          ],
        },
        {
          title: 'Project: model review and documentation pack',
          description: 'Take an existing messy schema, reverse-engineer its ERD, list anti-patterns, propose a refactored model with a migration plan, and deliver a data dictionary and diagrams as code.',
          concepts: ['Reverse-engineer the schema', 'Catalogue anti-patterns', 'Propose and plan the refactor', 'Dictionary and diagrams'],
          quiz: [
            ['What is the first thing to reverse-engineer?', 'Keys and relationships, from constraints or from join patterns in queries.'],
            ['How should a refactor be sequenced?', 'Additive changes first, then reader migration, then removals.'],
          ],
        },
        {
          title: 'Data modeling interview questions',
          description: 'Star versus snowflake, what grain means, how SCD Type 2 works, natural versus surrogate keys, when to denormalise, what a bridge table is, and how to model many-to-many and hierarchies.',
          concepts: ['Normalisation questions', 'Dimensional questions', 'Key and constraint questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Define grain in one sentence.', 'What a single row of a fact table represents.'],
            ['Why do warehouses use surrogate keys?', 'To version dimension rows and decouple from changing source keys.'],
          ],
          style: 'reading',
        },
        {
          title: 'Whiteboard modelling exercises',
          description: 'Timed prompts: model a ride-sharing trip, a hotel booking system, a music streaming service and a hospital admission, each in conceptual then dimensional form with grain, keys and history decisions stated.',
          concepts: ['Structuring a 30-minute answer', 'Stating grain and keys first', 'Handling history and hierarchies', 'Answering follow-up changes'],
          quiz: [
            ['What should you say first when asked to model a domain?', 'Clarify the business questions and state the grain of the main fact.'],
            ['A follow-up adds "trips can have multiple riders". What changes?', 'A bridge or a rider-trip fact at rider grain.'],
          ],
          style: 'design',
        },
      ],
    },
  ],
})
