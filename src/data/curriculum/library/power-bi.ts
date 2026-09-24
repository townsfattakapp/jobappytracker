import { defineTrack } from '../define'

export const powerBi = defineTrack({
  id: 'track-power-bi',
  title: 'Power BI',
  description: 'Power BI from Desktop to the Service: connecting to data, Power Query and M, star-schema modelling, DAX measures with CALCULATE, filter context and time intelligence, visuals and interactions, row-level security, publishing, refresh and gateways, performance tuning, and three complete report projects.',
  family: 'Data Analytics & BI',
  kind: 'tooling',
  icon: '📈',
  tags: ['power bi', 'dax', 'power query', 'm', 'data modelling', 'dashboards', 'microsoft fabric', 'business intelligence'],
  languages: ['DAX', 'Power Query M'],
  explainMode: 'tool',
  code: { label: 'DAX and Power Query M', id: 'dax', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Power BI Desktop and Service',
      description: 'The pieces of Power BI and how a report moves between them.',
      topics: [
        {
          title: 'Desktop, Service, licences and Fabric',
          description: 'Power BI Desktop is the free authoring tool, the Power BI Service is where reports are shared, and Pro, Premium Per User and Fabric capacity licences decide who can view what; knowing the boundaries avoids building something nobody can open.',
          concepts: ['Desktop for authoring', 'Service for sharing and refresh', 'Pro, PPU and Fabric capacity', 'Power BI Mobile and Report Server'],
          quiz: [
            ['Can a free-licence user open a report in a Pro workspace?', 'No, unless the workspace is on Premium or Fabric capacity.'],
            ['Where are scheduled refreshes configured?', 'In the Service, on the semantic model settings.'],
          ],
        },
        {
          title: 'The Desktop interface: Report, Table and Model views',
          description: 'Report view builds pages of visuals, Table view shows loaded data with column tools, and Model view draws relationships; the Data, Visualizations, Filters and Format panes are where nearly every click happens, and DAX query view runs ad-hoc queries.',
          concepts: ['Report, Table and Model views', 'Data, Visualizations and Filters panes', 'Column tools and Measure tools ribbons', 'DAX query view'],
          quiz: [
            ['Where do you set a column\'s data type after loading?', 'Table view, Column tools ribbon.'],
            ['What does DAX query view do?', 'Runs EVALUATE queries against the model to inspect results.'],
          ],
          prereqs: ['Desktop, Service, licences and Fabric'],
        },
        {
          title: 'Report lifecycle: build, publish, share, app',
          description: 'A .pbix built in Desktop is published to a workspace, where the semantic model and the report become separate items; reports are bundled into an app for consumers, and the model can be reused by other reports through a live connection.',
          concepts: ['Semantic model and report as separate items', 'Workspaces as the deployment target', 'Apps for consumers', 'Reusing a published model'],
          quiz: [
            ['What two items appear in the workspace after publishing a .pbix?', 'A report and a semantic model.'],
            ['Why build a second report on a published semantic model?', 'One model, one set of measures, several reports without duplicating data.'],
          ],
          prereqs: ['Desktop, Service, licences and Fabric'],
        },
        {
          title: '.pbix, .pbip and the Power BI Project format',
          description: 'A .pbix is a single binary file, while a Power BI Project (.pbip) saves the model as TMDL text and the report as JSON, which makes diffs, code review and Git integration possible; templates (.pbit) share a model without data.',
          concepts: ['.pbix binary files', '.pbip and TMDL folders', 'Git integration in workspaces', '.pbit templates without data'],
          quiz: [
            ['Why save as .pbip?', 'Text files can be versioned and reviewed in Git.'],
            ['What does a .pbit contain?', 'The model, queries and report layout but no data.'],
          ],
          prereqs: ['Report lifecycle: build, publish, share, app'],
        },
      ],
    },
    {
      title: 'Connecting to Data',
      description: 'Choosing how data enters the model.',
      topics: [
        {
          title: 'Get Data connectors',
          description: 'Get Data lists hundreds of connectors: Excel, CSV, folder, SQL Server, PostgreSQL, SharePoint, Dataverse, web and OData; the choice determines authentication, whether transformations fold to the source and what a refresh needs.',
          concepts: ['File and folder connectors', 'Database connectors and native queries', 'SharePoint and OneDrive sources', 'Web and OData sources', 'Credentials and privacy levels'],
          quiz: [
            ['Why prefer a SharePoint or OneDrive path over a local file?', 'The Service can refresh it without a gateway.'],
            ['What do privacy levels control?', 'Whether data from one source may be sent to another during folding.'],
          ],
        },
        {
          title: 'Import, DirectQuery and Live connection',
          description: 'Import copies data into the VertiPaq engine for speed, DirectQuery sends every visual\'s query to the source for freshness and scale, and Live connection reuses a published model or Analysis Services; each changes what DAX and Power Query you can use.',
          concepts: ['Import mode and VertiPaq', 'DirectQuery trade-offs', 'Live connection to a shared model', 'Choosing a storage mode'],
          quiz: [
            ['When is DirectQuery the right choice?', 'When data must be real-time or is too large to import.'],
            ['Which mode has the fastest visuals?', 'Import.'],
          ],
          prereqs: ['Get Data connectors'],
        },
        {
          title: 'Composite models and Dual storage mode',
          description: 'A composite model mixes Import and DirectQuery tables and can extend a published model with local tables; Dual mode lets a dimension act as either, so slicers stay fast while facts stay live, and aggregations answer common queries from imported summaries.',
          concepts: ['Mixing Import and DirectQuery tables', 'Dual storage mode for dimensions', 'DirectQuery for Power BI semantic models', 'User-defined aggregations'],
          quiz: [
            ['What is Dual mode for?', 'Dimensions that should join both imported and DirectQuery facts efficiently.'],
            ['What happens to a relationship between an Import table and a DirectQuery table?', 'It becomes a limited relationship with weaker filtering guarantees.'],
          ],
          prereqs: ['Import, DirectQuery and Live connection'],
        },
        {
          title: 'Dataflows and shared semantic models',
          description: 'Dataflows run Power Query in the Service so several models reuse the same cleaned tables, and a shared semantic model with certified status is the single source of measures; both move logic out of individual .pbix files.',
          concepts: ['Dataflows Gen1 and Gen2', 'Reusing dataflow tables in models', 'Shared and certified semantic models', 'Endorsement: promoted and certified'],
          quiz: [
            ['Why put a transformation in a dataflow instead of the .pbix?', 'So every model that needs the table reuses one cleaned copy.'],
            ['What does certifying a semantic model mean?', 'An admin-approved label that marks it as the trusted source.'],
          ],
          prereqs: ['Report lifecycle: build, publish, share, app'],
        },
      ],
    },
    {
      title: 'Power Query Transformations',
      description: 'Shaping data before it reaches the model.',
      topics: [
        {
          title: 'Power Query Editor and Applied Steps',
          description: 'Transform data opens the Power Query Editor where every ribbon action becomes an Applied Step; steps are ordered, renamable and removable, and the query only loads to the model on Close & Apply, so mistakes are cheap to undo.',
          concepts: ['Editor layout and ribbons', 'Applied Steps ordering', 'Close & Apply versus Apply', 'Enable load and reference queries'],
          quiz: [
            ['How do you keep a helper query from loading as a table?', 'Uncheck Enable load in the query context menu.'],
            ['What is the difference between Reference and Duplicate?', 'Reference reuses the output of another query; Duplicate copies its steps.'],
          ],
          prereqs: ['Get Data connectors'],
        },
        {
          title: 'Data types, locale and column profiling',
          description: 'Column quality, distribution and profile in the View ribbon reveal errors, blanks and distinct counts before modelling; Change Type with Locale parses regional dates and numbers, and types set here decide what DAX can do later.',
          concepts: ['Column quality and distribution', 'Column profile statistics', 'Change Type with Locale', 'Type Any and the danger of untyped columns'],
          quiz: [
            ['Why are column profile stats based on 1,000 rows by default?', 'For speed; switch to the whole dataset from the status bar when needed.'],
            ['What happens if a column stays type Any?', 'It loads as text and cannot be aggregated or related properly.'],
          ],
          prereqs: ['Power Query Editor and Applied Steps'],
        },
        {
          title: 'Shaping: remove, rename, split, unpivot and pivot',
          description: 'Remove Other Columns, Rename, Split Column, Unpivot Columns, Pivot Column, Fill Down and Group By reshape report exports into tall, typed tables; unpivoting wide month columns and grouping to the right grain are the two most frequent moves.',
          concepts: ['Choose and Remove Columns', 'Split Column by delimiter or positions', 'Unpivot Columns and Unpivot Other Columns', 'Pivot Column with aggregation', 'Group By for pre-aggregation'],
          quiz: [
            ['Why use Remove Other Columns instead of removing columns one by one?', 'It survives new columns appearing in the source.'],
            ['Unpivot Columns versus Unpivot Other Columns?', 'Other Columns keeps working when new month columns are added.'],
          ],
          prereqs: ['Data types, locale and column profiling'],
        },
        {
          title: 'Merge Queries, Append Queries and join kinds',
          description: 'Merge Queries joins two queries on matching columns with Left Outer, Right Outer, Full Outer, Inner, Left Anti or Right Anti, then expands columns; Append Queries stacks rows, and both should happen before load rather than in DAX.',
          concepts: ['Merge join kinds', 'Expanding and aggregating merged columns', 'Append two or three or more', 'Fuzzy matching'],
          quiz: [
            ['Which join finds rows in the first table with no match?', 'Left Anti.'],
            ['Should lookups be done with Merge or with DAX RELATED?', 'Merge when the result is a physical column; RELATED when the model relationship already exists.'],
          ],
          prereqs: ['Shaping: remove, rename, split, unpivot and pivot'],
        },
        {
          title: 'The M language and the Advanced Editor',
          description: 'Every query is an M let expression: named steps, functions such as Table.SelectRows and Text.Trim, records, lists and tables; the Advanced Editor exposes it, and custom functions turn a query into something you can apply to many files.',
          concepts: ['let and in expression structure', 'Table, List, Record and Text functions', 'Custom functions with parameters', 'each and the _ placeholder', 'Error handling with try otherwise'],
          quiz: [
            ['What does each mean in M?', 'Shorthand for a one-parameter function whose parameter is _.'],
            ['How do you replace an error with null?', 'try [Column] otherwise null'],
          ],
          prereqs: ['Merge Queries, Append Queries and join kinds'],
        },
        {
          title: 'Query folding and parameters',
          description: 'When steps fold, Power Query translates them into a single native query the source executes, which is far faster and required for incremental refresh; View Native Query shows whether folding still holds, and parameters make sources and filters configurable.',
          concepts: ['What folding is and why it matters', 'View Native Query and step icons', 'Steps that break folding', 'Query parameters for sources and filters', 'Parameters in the Service'],
          quiz: [
            ['How do you check if a step folds?', 'Right-click the step and see if View Native Query is enabled, or use query diagnostics.'],
            ['Name a step that usually breaks folding.', 'Adding an index column or using a custom M function on each row.'],
          ],
          prereqs: ['The M language and the Advanced Editor'],
        },
      ],
    },
    {
      title: 'Data Modelling',
      description: 'The star schema that makes DAX simple and reports fast.',
      topics: [
        {
          title: 'Star schema: fact and dimension tables',
          description: 'Facts hold measurable events at one grain (a sale, a ticket), dimensions hold descriptive attributes (customer, product, date), and one-to-many relationships from dimensions to facts let every slicer filter every fact; flat tables and snowflakes both make DAX harder.',
          concepts: ['Fact tables and grain', 'Dimension tables and keys', 'Why one flat table fails', 'Snowflake versus star', 'Surrogate keys'],
          quiz: [
            ['Which table type do slicers usually come from?', 'Dimension tables.'],
            ['Why not keep customer name on the fact table?', 'Duplication, larger model, and slicers with inconsistent values.'],
          ],
          prereqs: ['Shaping: remove, rename, split, unpivot and pivot'],
        },
        {
          title: 'Relationships, cardinality and cross-filter direction',
          description: 'Model view relationships have cardinality (one-to-many, one-to-one, many-to-many) and a cross-filter direction; single direction from dimension to fact is the safe default, and bidirectional filtering should be a deliberate exception because it creates ambiguity.',
          concepts: ['One-to-many and the one side', 'Cross-filter direction single versus both', 'Ambiguous paths and inactive relationships', 'Assume referential integrity', 'Autodetect and its mistakes'],
          quiz: [
            ['Why avoid bidirectional filters by default?', 'They cause ambiguous filter paths and slower queries.'],
            ['What does the dotted line in Model view mean?', 'An inactive relationship.'],
          ],
          prereqs: ['Star schema: fact and dimension tables'],
        },
        {
          title: 'Date tables and Mark as date table',
          description: 'A dedicated date table with one row per day, marked as a date table, is required for time intelligence functions to work correctly; it can be built in Power Query, with DAX CALENDAR or CALENDARAUTO, and should carry fiscal columns and sort orders.',
          concepts: ['Building a date table with CALENDAR', 'Mark as date table', 'Fiscal year and period columns', 'Sort by column for month names', 'Disabling Auto date/time'],
          quiz: [
            ['Why turn off Auto date/time?', 'It creates hidden date tables per column, bloating the model.'],
            ['What does Mark as date table require?', 'A date column with unique, contiguous values and no blanks.'],
          ],
          prereqs: ['Relationships, cardinality and cross-filter direction'],
        },
        {
          title: 'Role-playing dimensions and USERELATIONSHIP',
          description: 'A fact with order date and ship date needs two relationships to one date table, but only one can be active; USERELATIONSHIP inside CALCULATE activates the other for a measure, or the date table is duplicated as a role-playing copy.',
          concepts: ['Multiple relationships to one dimension', 'USERELATIONSHIP inside CALCULATE', 'Duplicated role-playing dimensions', 'Choosing between the two approaches'],
          quiz: [
            ['Write a shipped-revenue measure using the inactive ship date relationship.', 'CALCULATE([Revenue], USERELATIONSHIP(Sales[ShipDate], Dates[Date]))'],
            ['When duplicate the date table instead?', 'When users need to slice by both dates at once on the same visual.'],
          ],
          prereqs: ['Date tables and Mark as date table'],
        },
        {
          title: 'Many-to-many and bridge tables',
          description: 'Customers with several accounts or products in several categories need a bridge table with one row per pair, related one-to-many to both sides; the native many-to-many relationship type exists but hides double counting risks that a bridge makes explicit.',
          concepts: ['Bridge table pattern', 'Filter propagation through a bridge', 'Native many-to-many relationships', 'Detecting double counting'],
          quiz: [
            ['How do you check a many-to-many model for double counting?', 'Compare a total with and without the bridge filter, or count distinct keys.'],
            ['What cardinality do bridge relationships have?', 'One-to-many from each dimension to the bridge.'],
          ],
          prereqs: ['Relationships, cardinality and cross-filter direction'],
        },
        {
          title: 'Model hygiene: hiding, folders, formats and descriptions',
          description: 'Hide key columns and raw fact columns, group measures into display folders or a dedicated measure table, set formats and default summarisation, and add descriptions so the Data pane guides report builders instead of confusing them.',
          concepts: ['Hiding columns from report view', 'Measure tables and display folders', 'Default summarisation and format strings', 'Descriptions and synonyms', 'Perspectives and Data pane organisation'],
          quiz: [
            ['Why set a numeric ID column to Don\'t summarize?', 'So dragging it into a visual does not sum IDs.'],
            ['How do you create a dedicated measure table?', 'Enter Data with one blank column, add measures, hide the column.'],
          ],
          prereqs: ['Star schema: fact and dimension tables'],
        },
      ],
    },
    {
      title: 'DAX Fundamentals',
      description: 'Measures that answer questions correctly in every filter combination.',
      topics: [
        {
          title: 'Calculated columns versus measures',
          description: 'A calculated column is computed row by row at refresh and stored, while a measure is computed at query time in the current filter context; columns are for slicing and grouping, measures for numbers, and using a column for a total wastes memory and breaks aggregation.',
          concepts: ['Row-by-row evaluation of columns', 'Query-time evaluation of measures', 'When a column is the right tool', 'Implicit measures and why to avoid them'],
          quiz: [
            ['Should profit margin % be a column or a measure?', 'A measure: a ratio must be computed from totals, not averaged from rows.'],
            ['Which is stored in the model?', 'The calculated column; measures are not.'],
          ],
          prereqs: ['Star schema: fact and dimension tables'],
        },
        {
          title: 'Row context and filter context',
          description: 'Row context exists inside calculated columns and iterators and points at one row; filter context is the set of filters from slicers, visual axes and CALCULATE that determine which rows a measure sees. Nearly every DAX bug is a confusion of the two.',
          concepts: ['Filter context from visuals and slicers', 'Row context in columns and iterators', 'Why a measure has no row context', 'RELATED and RELATEDTABLE'],
          quiz: [
            ['Why does Sales[Qty] * Sales[Price] fail inside a measure?', 'A measure has no row context; wrap it in SUMX over the table.'],
            ['What creates filter context in a matrix visual?', 'The rows, columns, slicers and filters applied to that cell.'],
          ],
          prereqs: ['Calculated columns versus measures'],
        },
        {
          title: 'CALCULATE and filter modification',
          description: 'CALCULATE evaluates an expression under a modified filter context: adding filters, overriding them, or removing them with ALL and REMOVEFILTERS; it is the single most important DAX function and the basis of every percent-of-total, comparison and time intelligence measure.',
          concepts: ['CALCULATE syntax and filter arguments', 'Overriding versus adding filters', 'Boolean filters versus table filters', 'Filter arguments on columns versus tables'],
          quiz: [
            ['What does CALCULATE([Revenue], Product[Colour] = "Red") return when the slicer selects Blue?', 'Red revenue; the argument overrides the slicer filter on that column.'],
            ['How do you add to the existing filter instead of overriding?', 'Wrap the filter in KEEPFILTERS.'],
          ],
          prereqs: ['Row context and filter context'],
        },
        {
          title: 'ALL, ALLSELECTED, REMOVEFILTERS and KEEPFILTERS',
          description: 'ALL removes filters from a table or column, ALLSELECTED keeps the user\'s slicer selection but drops the visual\'s own filters, REMOVEFILTERS is the readable name for ALL as a modifier, and KEEPFILTERS intersects rather than overrides; percent-of-total measures depend on picking the right one.',
          concepts: ['ALL on a table versus a column', 'ALLSELECTED and visual totals', 'REMOVEFILTERS as a CALCULATE modifier', 'KEEPFILTERS to intersect filters', 'ALLEXCEPT'],
          quiz: [
            ['Write percent of grand total revenue.', 'DIVIDE([Revenue], CALCULATE([Revenue], REMOVEFILTERS(Sales)))'],
            ['Which function gives percent of the visible total after slicers?', 'ALLSELECTED.'],
          ],
          prereqs: ['CALCULATE and filter modification'],
        },
        {
          title: 'Iterators: SUMX, AVERAGEX and context transition',
          description: 'SUMX, AVERAGEX, MAXX and COUNTX iterate a table with a row context and evaluate an expression per row; calling a measure inside the iteration triggers context transition, turning the current row into a filter, which is both powerful and a common source of slow or wrong results.',
          concepts: ['SUMX over a table expression', 'Row-level calculations in iterators', 'Context transition with measures', 'RANKX for rankings', 'Iterating over VALUES or SUMMARIZE'],
          quiz: [
            ['Write revenue from quantity and unit price.', 'SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])'],
            ['What does CALCULATE with no filter arguments do inside an iterator?', 'Performs context transition: the row becomes a filter.'],
          ],
          prereqs: ['Row context and filter context'],
        },
        {
          title: 'Time intelligence functions',
          description: 'TOTALYTD, SAMEPERIODLASTYEAR, DATEADD, DATESINPERIOD, PREVIOUSMONTH and DATESYTD shift or extend the date filter inside CALCULATE; they need a marked date table, and DATEADD with a full contiguous calendar handles most year-over-year and rolling-period questions.',
          concepts: ['TOTALYTD and DATESYTD with fiscal ends', 'SAMEPERIODLASTYEAR and DATEADD', 'DATESINPERIOD for rolling windows', 'PREVIOUSMONTH and PARALLELPERIOD', 'Blank handling at period edges'],
          quiz: [
            ['Write revenue for the same period last year.', 'CALCULATE([Revenue], SAMEPERIODLASTYEAR(Dates[Date]))'],
            ['Rolling 12-month revenue?', 'CALCULATE([Revenue], DATESINPERIOD(Dates[Date], MAX(Dates[Date]), -12, MONTH))'],
          ],
          prereqs: ['CALCULATE and filter modification', 'Date tables and Mark as date table'],
        },
        {
          title: 'Variables, DIVIDE and format strings',
          description: 'VAR stores an intermediate result once, making measures readable and faster; DIVIDE handles zero denominators with an alternate result; format strings and dynamic format strings control how a measure displays without changing its value.',
          concepts: ['VAR and RETURN', 'Variables evaluated in definition context', 'DIVIDE with alternate result', 'Format strings and dynamic format strings', 'BLANK versus zero'],
          quiz: [
            ['Why is a VAR not re-evaluated inside CALCULATE?', 'Variables are evaluated where defined, before the filter modification.'],
            ['What does DIVIDE(10, 0, 0) return?', '0'],
          ],
          prereqs: ['CALCULATE and filter modification'],
        },
        {
          title: 'Common measure patterns',
          description: 'Running totals, percent of parent, distinct customer counts, previous-period variance, new versus returning customers and cumulative targets are patterns built from CALCULATE, ALL and time intelligence; recognising the pattern is faster than inventing it each time.',
          concepts: ['Running total with FILTER and ALL', 'Percent of parent with ALLSELECTED', 'DISTINCTCOUNT and customer counts', 'Variance and variance percent', 'New versus returning customers'],
          quiz: [
            ['Write a running total by date.', 'CALCULATE([Revenue], FILTER(ALL(Dates[Date]), Dates[Date] <= MAX(Dates[Date])))'],
            ['How do you show variance as a percent safely?', 'DIVIDE([Revenue] - [Revenue PY], [Revenue PY])'],
          ],
          prereqs: ['ALL, ALLSELECTED, REMOVEFILTERS and KEEPFILTERS', 'Time intelligence functions'],
        },
      ],
    },
    {
      title: 'Visuals and Formatting',
      description: 'Choosing and configuring visuals in the Visualizations pane.',
      topics: [
        {
          title: 'Core visuals and when to use each',
          description: 'Clustered bar for comparison, line for trend, matrix for detail with hierarchy, card and KPI for headline numbers, scatter for relationships, map for geography and table for lists; each visual has field wells whose contents define the query it sends.',
          concepts: ['Bar, column and line visuals', 'Matrix and table visuals', 'Card, KPI and gauge', 'Scatter and map visuals', 'Field wells and the visual query'],
          quiz: [
            ['Which visual shows a hierarchy with expandable rows?', 'Matrix.'],
            ['What is the difference between a card and a KPI visual?', 'KPI adds a trend axis and a target with status colouring.'],
          ],
          prereqs: ['Calculated columns versus measures'],
        },
        {
          title: 'Format pane: titles, labels, axes and conditional formatting',
          description: 'The Format pane sets titles, data labels, axis ranges, gridlines and legends per visual, and conditional formatting drives colours, icons and data bars from a measure or a rule, which is how status colouring stays data-driven.',
          concepts: ['Visual and General format sections', 'Axis ranges and display units', 'Data labels and legends', 'Conditional formatting by rules, gradient or field value', 'Format painter and copy formatting'],
          quiz: [
            ['How do you colour bars by a measure?', 'Conditional formatting, Field value, pick a measure returning a colour string or use a gradient.'],
            ['Where do you set display units to millions?', 'Format pane, Y-axis or data labels, Display units.'],
          ],
          prereqs: ['Core visuals and when to use each'],
        },
        {
          title: 'Field parameters and calculation groups',
          description: 'Field parameters let a slicer switch which measure or dimension a visual shows, and calculation groups (created in Model view) apply a set of calculations such as YTD, PY and variance to any measure, removing dozens of near-duplicate measures.',
          concepts: ['Creating a field parameter', 'Slicer-driven measure switching', 'Calculation groups and SELECTEDMEASURE', 'Format string expressions in calculation items'],
          quiz: [
            ['What does a field parameter table contain?', 'A name, a NAMEOF reference to the field and an ordering column.'],
            ['Write a YTD calculation item.', 'CALCULATE(SELECTEDMEASURE(), DATESYTD(Dates[Date]))'],
          ],
          prereqs: ['Time intelligence functions', 'Format pane: titles, labels, axes and conditional formatting'],
        },
        {
          title: 'Themes, custom visuals and layout',
          description: 'A JSON theme sets colours, fonts and default visual formatting for the whole report, AppSource custom visuals add charts such as Gantt or Sankey with certification caveats, and gridlines, snap-to-grid and alignment tools keep pages tidy.',
          concepts: ['Report themes and theme JSON', 'AppSource and certified visuals', 'Page size, gridlines and snap to grid', 'Selection pane and layer order'],
          quiz: [
            ['Where do you import a theme?', 'View ribbon, Themes, Browse for themes.'],
            ['Why prefer certified custom visuals?', 'They have been reviewed by Microsoft and do not send data to external services.'],
          ],
          prereqs: ['Format pane: titles, labels, axes and conditional formatting'],
        },
        {
          title: 'Tooltips, report page tooltips and small multiples',
          description: 'Default tooltips show the fields on the visual, report page tooltips replace them with a designed mini-page filtered to the hovered point, and small multiples split one visual into a grid per category for comparison.',
          concepts: ['Tooltip field wells', 'Report page tooltips', 'Small multiples grid', 'Analytics pane: trend and reference lines'],
          quiz: [
            ['How do you turn a page into a tooltip?', 'Page information, Allow use as tooltip, then size to Tooltip and assign in the visual\'s tooltip settings.'],
            ['What does a small multiples field do?', 'Creates one copy of the visual per value of that field.'],
          ],
          prereqs: ['Core visuals and when to use each'],
        },
      ],
    },
    {
      title: 'Interactions and Navigation',
      description: 'Letting readers filter, drill and move around a report.',
      topics: [
        {
          title: 'Slicers and Sync slicers',
          description: 'Slicers filter a page with list, dropdown, tile, between, relative date or hierarchy styles; Sync slicers shares one slicer across pages, and slicer settings control single-select, select-all and search behaviour.',
          concepts: ['Slicer styles and settings', 'Relative date and between slicers', 'Sync slicers across pages', 'Hierarchy slicers'],
          quiz: [
            ['How do you show one slicer\'s selection on every page?', 'View, Sync slicers, tick sync and visible per page.'],
            ['What does a relative date slicer set to Last 3 Months do?', 'Filters to the three complete months before the current one, relative to today.'],
          ],
          prereqs: ['Core visuals and when to use each'],
        },
        {
          title: 'Filters pane and Edit interactions',
          description: 'The Filters pane holds visual-level, page-level and report-level filters that can be locked or hidden from readers; Edit interactions decides whether clicking one visual filters, highlights or ignores each other visual.',
          concepts: ['Visual, page and report filters', 'Locking and hiding filters', 'Edit interactions: filter, highlight, none', 'Cross-highlight versus cross-filter'],
          quiz: [
            ['Why lock a report-level filter?', 'Readers can see but not change it, enforcing scope.'],
            ['What is cross-highlighting?', 'The clicked selection dims the rest of a visual instead of removing it.'],
          ],
          prereqs: ['Slicers and Sync slicers'],
        },
        {
          title: 'Hierarchies, drill down and drill through',
          description: 'A hierarchy on a visual enables the drill buttons (down, up, expand all), and a drill-through page receives the clicked context as filters so a summary visual can jump to a detail page for that customer or product.',
          concepts: ['Building hierarchies in the Data pane', 'Drill down, expand and drill up buttons', 'Drill-through pages and fields', 'Keep all filters and the back button'],
          quiz: [
            ['How do you make a page a drill-through target?', 'Add fields to the Drill through well on that page.'],
            ['What is the difference between Expand and Drill down?', 'Expand shows the next level for all items; drill down shows only the clicked item.'],
          ],
          prereqs: ['Filters pane and Edit interactions'],
        },
        {
          title: 'Bookmarks, buttons and page navigation',
          description: 'Bookmarks capture filter, slicer and visibility state and buttons trigger them, which builds toggles, reset buttons and pop-up panels; the Page navigator and Bookmark navigator visuals generate menus automatically.',
          concepts: ['Creating and updating bookmarks', 'Bookmark data, display and current page options', 'Buttons and actions', 'Page navigator and Bookmark navigator', 'Selection pane for show and hide'],
          quiz: [
            ['How do you build a reset button?', 'Create a bookmark with slicers cleared and assign it to a button action.'],
            ['Which bookmark option keeps filters but changes visibility only?', 'Untick Data and keep Display.'],
          ],
          prereqs: ['Filters pane and Edit interactions'],
        },
        {
          title: 'Q&A visual and synonyms',
          description: 'The Q&A visual answers typed questions by mapping words to model fields; synonyms, the linguistic schema and hidden fields determine how well it works, and reviewing the questions users ask reveals what the report is missing.',
          concepts: ['Q&A visual setup', 'Synonyms in Model view', 'Review questions and teach Q&A', 'Limiting Q&A to curated fields'],
          quiz: [
            ['Where do you add synonyms?', 'Model view, select a field, Properties, Synonyms.'],
            ['Why hide technical columns for Q&A?', 'They confuse matching and expose raw keys.'],
          ],
          prereqs: ['Model hygiene: hiding, folders, formats and descriptions'],
        },
      ],
    },
    {
      title: 'Security, Publishing and Refresh',
      description: 'Getting reports to the right people with fresh data.',
      topics: [
        {
          title: 'Row-level security roles',
          description: 'Manage roles defines DAX filters per table, static (Region = "West") or dynamic with USERPRINCIPALNAME matched to a security table; View as tests them in Desktop, and members are assigned to roles in the Service.',
          concepts: ['Static role filters', 'Dynamic RLS with USERPRINCIPALNAME', 'Security tables and relationships', 'View as role testing', 'Assigning members in the Service'],
          quiz: [
            ['Why does RLS not apply to workspace members?', 'Members, contributors and admins bypass RLS; only viewers are filtered.'],
            ['Write a dynamic RLS filter on a Users table.', 'Users[Email] = USERPRINCIPALNAME()'],
          ],
          prereqs: ['Relationships, cardinality and cross-filter direction'],
        },
        {
          title: 'Workspaces, roles and apps',
          description: 'Workspaces hold reports and models with Admin, Member, Contributor and Viewer roles; apps package selected reports with audiences for consumers, separating development from consumption, and deployment pipelines promote content across dev, test and prod.',
          concepts: ['Workspace roles and permissions', 'Publishing an app with audiences', 'Deployment pipelines', 'Personal workspace versus shared'],
          quiz: [
            ['Which role can publish but not manage access?', 'Contributor.'],
            ['Why publish an app instead of sharing the workspace?', 'Consumers get a curated, read-only experience and updates on your schedule.'],
          ],
          prereqs: ['Report lifecycle: build, publish, share, app'],
        },
        {
          title: 'Sharing, sensitivity labels and export',
          description: 'Reports can be shared by link, embedded in Teams or SharePoint, or exported to PDF and PowerPoint; sensitivity labels and export settings control what leaves the tenant, and Build permission on the model governs who can create new reports on it.',
          concepts: ['Share links and direct access', 'Build permission on semantic models', 'Sensitivity labels', 'Export and Analyze in Excel'],
          quiz: [
            ['What does Build permission allow?', 'Creating new reports and using Analyze in Excel on the semantic model.'],
            ['How do you stop exporting underlying data?', 'Disable it in the report settings or tenant settings.'],
          ],
          prereqs: ['Workspaces, roles and apps'],
        },
        {
          title: 'Scheduled refresh and the on-premises data gateway',
          description: 'Cloud sources refresh directly, but on-premises databases and file shares need the on-premises data gateway installed on a machine that can reach them; refresh schedules, credentials and failure notifications are configured on the semantic model.',
          concepts: ['Gateway installation and clusters', 'Mapping data sources to the gateway', 'Refresh schedules and limits', 'Refresh failures and notifications'],
          quiz: [
            ['How many scheduled refreshes per day on Pro?', 'Eight; 48 on Premium or Fabric capacity.'],
            ['When is a gateway unnecessary?', 'When every source is cloud-reachable, such as SharePoint or Azure SQL.'],
          ],
          prereqs: ['Workspaces, roles and apps'],
        },
        {
          title: 'Incremental refresh',
          description: 'Incremental refresh loads only recent partitions using RangeStart and RangeEnd parameters, keeping years of history without reloading it every night; it requires query folding on the date filter and is configured per table in Desktop.',
          concepts: ['RangeStart and RangeEnd parameters', 'Archive and refresh windows', 'Folding requirement on the date filter', 'Partitions in the Service', 'Detect data changes'],
          quiz: [
            ['What must the RangeStart filter do?', 'Fold to the source so only the partition rows are queried.'],
            ['Where do you see the partitions created?', 'In the Service via XMLA endpoint tools such as SQL Server Management Studio or Tabular Editor.'],
          ],
          prereqs: ['Query folding and parameters', 'Scheduled refresh and the on-premises data gateway'],
        },
        {
          title: 'Dashboards versus reports, alerts and subscriptions',
          description: 'In the Service a dashboard is a single canvas of pinned tiles from several reports, while a report is multi-page and interactive; dashboards support data alerts on tiles and both support email subscriptions, so each has a distinct monitoring role.',
          concepts: ['Pinning tiles to a dashboard', 'Dashboard versus report capabilities', 'Data alerts on tiles', 'Email subscriptions', 'Metrics and scorecards'],
          quiz: [
            ['Can a dashboard have slicers?', 'No; dashboards are static tiles with a Q&A box.'],
            ['Which visuals support data alerts?', 'Card, KPI and gauge tiles pinned to a dashboard.'],
          ],
          prereqs: ['Workspaces, roles and apps'],
        },
      ],
    },
    {
      title: 'Performance Optimisation',
      description: 'Finding what is slow and fixing it.',
      topics: [
        {
          title: 'Performance Analyzer and DAX Studio',
          description: 'Performance Analyzer records DAX query, visual display and other time per visual so the slow one is obvious; DAX Studio runs the captured query with server timings and shows whether the storage engine or formula engine is the bottleneck.',
          concepts: ['Recording with Performance Analyzer', 'DAX query versus visual display time', 'DAX Studio server timings', 'Storage engine versus formula engine'],
          quiz: [
            ['A visual shows 5 seconds of DAX query time. What is the next step?', 'Copy the query into DAX Studio and check server timings.'],
            ['What does high formula engine time suggest?', 'Row-by-row DAX work that could be pushed to the storage engine or simplified.'],
          ],
          prereqs: ['Common measure patterns'],
        },
        {
          title: 'VertiPaq compression and reducing model size',
          description: 'VertiPaq compresses columns by dictionary and run-length encoding, so high-cardinality columns such as timestamps and GUIDs dominate size; removing unused columns, splitting date and time and reducing precision shrink models and speed everything.',
          concepts: ['Columnar storage and encoding', 'Cardinality as the size driver', 'Removing unused columns', 'Splitting datetime columns', 'VertiPaq Analyzer in DAX Studio'],
          quiz: [
            ['Which column type usually takes the most space?', 'High-cardinality columns such as datetime or unique IDs.'],
            ['Why split a datetime column into date and time?', 'Two low-cardinality columns compress far better than one high-cardinality column.'],
          ],
          prereqs: ['Import, DirectQuery and Live connection'],
        },
        {
          title: 'Writing efficient DAX',
          description: 'Filter columns rather than tables in CALCULATE, avoid iterating a large fact with a measure inside, use variables to avoid recomputation, prefer DIVIDE and avoid IF inside iterators; these habits turn multi-second measures into instant ones.',
          concepts: ['Column filters instead of table filters', 'Avoiding nested iterators with context transition', 'Variables to prevent recomputation', 'Measures returning BLANK for sparse results'],
          quiz: [
            ['Why is FILTER(Sales, Sales[Amount] > 100) inside CALCULATE slow?', 'It materialises the whole fact table; filter the column with KEEPFILTERS or a column predicate instead.'],
            ['Why return BLANK instead of 0?', 'Visuals skip blank rows, reducing query results and clutter.'],
          ],
          prereqs: ['Iterators: SUMX, AVERAGEX and context transition'],
        },
        {
          title: 'Report design for speed',
          description: 'Every visual is a query, so pages with thirty visuals, slicers on high-cardinality columns, bidirectional relationships and detailed tables load slowly; fewer visuals per page, drill-through for detail and simpler slicers make reports feel fast.',
          concepts: ['Visual count per page', 'High-cardinality slicers', 'Tables with many rows and columns', 'Apply-all-slicers button', 'Reduce interactions between visuals'],
          quiz: [
            ['How does the Apply button on slicers help?', 'Queries run once after selections instead of on every click.'],
            ['Why move detail tables to a drill-through page?', 'They only query when needed rather than on every landing page load.'],
          ],
          prereqs: ['Performance Analyzer and DAX Studio'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Three complete reports to build, then the questions asked in Power BI interviews.',
      style: 'project',
      topics: [
        {
          title: 'Project: sales dashboard',
          description: 'From orders, customers, products and a date table, build a star schema, measures for revenue, margin, YTD and prior year, a landing page with KPI cards and trend, a regional map page with drill-through to customer detail, and publish it with RLS by region.',
          concepts: ['Load and shape the source tables', 'Model the star schema and date table', 'Write the core and time intelligence measures', 'Design the landing and drill-through pages', 'Publish with row-level security'],
          quiz: [
            ['Which measure pattern gives prior-year revenue?', 'CALCULATE([Revenue], SAMEPERIODLASTYEAR(Dates[Date]))'],
            ['How do you test regional RLS before publishing?', 'View as role in Desktop.'],
          ],
        },
        {
          title: 'Project: HR analytics report',
          description: 'Model headcount snapshots, hires and leavers with a slowly changing department dimension, compute headcount at any date, attrition rate, tenure bands and diversity ratios, and build pages for executives and for HR business partners with bookmarks for views.',
          concepts: ['Model snapshots versus events', 'Headcount at a point in time', 'Attrition and tenure measures', 'Executive and partner pages with bookmarks'],
          quiz: [
            ['How do you compute headcount on a date from hire and leave dates?', 'Count employees where hire date <= date and (leave date is blank or leave date > date).'],
            ['What is the attrition rate denominator?', 'Average headcount over the period.'],
          ],
        },
        {
          title: 'Project: finance P&L report',
          description: 'Load a general ledger with an account hierarchy, build a matrix P&L with subtotals in the right order, budget versus actual variance with conditional icons, a calculation group for MTD, QTD and YTD, and a currency conversion using a rates table.',
          concepts: ['Account hierarchy and sort order', 'Matrix P&L with correct subtotals', 'Budget variance with icons', 'Calculation group for periods', 'Currency conversion with a rates table'],
          quiz: [
            ['How do you order accounts in a matrix?', 'A sort-order column with Sort by column on the account name.'],
            ['Why does a P&L need signs flipped for revenue?', 'Ledger credits are negative; a measure multiplies by a sign column for presentation.'],
          ],
        },
        {
          title: 'Power BI interview questions',
          description: 'The questions that keep coming up: calculated column versus measure, what CALCULATE does, filter context, Import versus DirectQuery, star schema reasons, how RLS works, refresh and gateways, and how you debugged a slow report.',
          concepts: ['DAX concept questions', 'Modelling and storage mode questions', 'Service, security and refresh questions', 'Describing a project end to end'],
          quiz: [
            ['Explain filter context in one sentence.', 'The set of filters from slicers, visuals and CALCULATE that determines which rows a measure evaluates.'],
            ['Why a star schema?', 'Simple relationships, fast VertiPaq queries and DAX that works without workarounds.'],
          ],
          style: 'reading',
        },
        {
          title: 'DAX whiteboard questions',
          description: 'Interviewers ask you to write measures aloud: percent of total, year-over-year growth, running total, top-N customers, customers with no sales; practise writing them correctly and explaining the filter context each one relies on.',
          concepts: ['Percent of total and percent of parent', 'Growth and variance measures', 'Running totals and rankings', 'Explaining the filter context'],
          quiz: [
            ['Write year-over-year growth percent.', 'DIVIDE([Revenue] - CALCULATE([Revenue], SAMEPERIODLASTYEAR(Dates[Date])), CALCULATE([Revenue], SAMEPERIODLASTYEAR(Dates[Date])))'],
            ['Count customers with no sales in the current filter.', 'COUNTROWS(Customer) - CALCULATE(DISTINCTCOUNT(Sales[CustomerID]))'],
          ],
          style: 'practice',
        },
      ],
    },
  ],
})
