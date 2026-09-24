import { defineTrack } from '../define'

export const excel = defineTrack({
  id: 'track-excel',
  title: 'Excel and Spreadsheet Analytics',
  description: 'Excel as an analyst uses it: tables and references, the core function families, XLOOKUP and INDEX/MATCH, dynamic arrays with LET and LAMBDA, pivot tables, Power Query, the Data Model, charts and dashboards, what-if analysis, statistics and data cleaning, plus the Google Sheets differences.',
  family: 'Data Analytics & BI',
  kind: 'tooling',
  icon: '📊',
  tags: ['excel', 'spreadsheets', 'pivot tables', 'power query', 'xlookup', 'dynamic arrays', 'google sheets', 'analytics'],
  languages: ['Excel formulas'],
  explainMode: 'tool',
  code: { label: 'Excel formulas', id: 'excel', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Workbooks, Tables and References',
      description: 'How a workbook is organised and how formulas point at data without breaking.',
      topics: [
        {
          title: 'Workbook structure, ranges and named ranges',
          description: 'Workbooks hold sheets, sheets hold cells and ranges; the Name Manager turns a range into a readable name that formulas reference safely. Separating raw data, calculations and output sheets keeps a workbook auditable when it grows.',
          concepts: ['Sheets, cells and ranges', 'Raw, calc and output sheet layout', 'Name Manager and named ranges', 'Go To Special and selection tricks'],
          quiz: [
            ['Where do you create or edit a named range?', 'Formulas tab, Name Manager (or type a name in the Name Box).'],
            ['Why keep raw data on its own sheet?', 'So refreshes and pastes never overwrite formulas, and the audit trail stays clear.'],
            ['What does Ctrl+Shift+Down do on a column of data?', 'Extends the selection to the last filled cell before a blank.'],
          ],
        },
        {
          title: 'Excel Tables and structured references',
          description: 'Ctrl+T converts a range into a Table that auto-expands, keeps one formula per column and exposes structured references like Table1[Revenue]. Tables are the foundation for pivots, Power Query and reliable formulas.',
          concepts: ['Creating a Table with Ctrl+T', 'Auto-expansion and calculated columns', 'Structured references and @ row', 'Total row and table styles'],
          quiz: [
            ['What does =SUM(Sales[Amount]) reference?', 'The whole Amount column of the Sales table, growing as rows are added.'],
            ['What does [@Amount] mean inside a Table?', 'The Amount value on the same row as the formula.'],
            ['Why do pivots prefer Tables over ranges?', 'New rows are included on refresh without changing the source range.'],
          ],
          prereqs: ['Workbook structure, ranges and named ranges'],
        },
        {
          title: 'Relative, absolute and mixed references',
          description: 'A1 shifts when copied, $A$1 never moves, and $A1 or A$1 lock one axis; pressing F4 cycles between them. Getting this right is what makes a formula fill across a grid correctly instead of producing silent errors.',
          concepts: ['Relative references shift on copy', 'Absolute references with $', 'Mixed references for two-way grids', 'F4 to cycle reference types'],
          quiz: [
            ['You copy =B2*$E$1 from C2 to C3. What does it become?', '=B3*$E$1: the row shifts, the absolute reference stays.'],
            ['Which reference builds a multiplication table from one formula?', 'A mixed one, such as =$A2*B$1.'],
          ],
        },
        {
          title: 'Number formats and dates as serial numbers',
          description: 'Excel stores dates as day counts from 1 January 1900 and times as fractions of a day, so date arithmetic is plain subtraction. Custom number formats change display without changing the value, which is why formatting never fixes text-stored numbers.',
          concepts: ['Date serial numbers and time fractions', 'Custom number format codes', 'Format versus value', 'Percent, currency and thousands separators'],
          quiz: [
            ['What does =TODAY()-A2 return when A2 is a date?', 'The number of days between them, as a number.'],
            ['What does the format code 0.0,"k" show for 12345?', '12.3k'],
            ['Why does a number stored as text sort wrongly?', 'Text sorts alphabetically, so "10" comes before "9".'],
          ],
        },
      ],
    },
    {
      title: 'Core Functions',
      description: 'The function families every analysis workbook is built from.',
      topics: [
        {
          title: 'SUM, AVERAGE and COUNT families',
          description: 'SUM, AVERAGE, COUNT, COUNTA and COUNTBLANK, then their conditional forms SUMIFS, COUNTIFS and AVERAGEIFS with multiple criteria, wildcards and comparison operators inside strings. These replace most manual filtering.',
          concepts: ['COUNT versus COUNTA versus COUNTBLANK', 'SUMIFS with multiple criteria', 'COUNTIFS and AVERAGEIFS', 'Criteria strings with operators and wildcards', 'MIN, MAX, MINIFS and MAXIFS'],
          quiz: [
            ['How do you sum Amount where Region is "West" and Date is after 1 Jan 2025?', '=SUMIFS(Amount, Region, "West", Date, ">"&DATE(2025,1,1))'],
            ['Does COUNT count text cells?', 'No, only numbers; COUNTA counts any non-empty cell.'],
            ['What does the criterion "*corp" match in COUNTIFS?', 'Any text ending in "corp".'],
          ],
          prereqs: ['Relative, absolute and mixed references'],
        },
        {
          title: 'IF, IFS, AND, OR and nested logic',
          description: 'IF returns one of two values, IFS chains conditions in order, and AND/OR combine tests; SWITCH matches a value against a list. Knowing when to nest and when to use a lookup table keeps logic readable and testable.',
          concepts: ['IF and nested IF', 'IFS and first-match order', 'AND, OR, NOT and XOR', 'SWITCH for value matching', 'Replacing nested IFs with lookups'],
          quiz: [
            ['What does IFS return when no condition is TRUE?', '#N/A, so add a final TRUE, "Other" pair.'],
            ['Write a test for "score at least 50 and attendance above 80%".', '=AND(B2>=50, C2>0.8)'],
          ],
        },
        {
          title: 'Text functions for cleaning and building strings',
          description: 'LEFT, RIGHT, MID, LEN, FIND and SEARCH extract parts of text; TRIM, CLEAN, UPPER, PROPER and SUBSTITUTE normalise it; TEXTSPLIT, TEXTBEFORE, TEXTAFTER and TEXTJOIN handle delimited values; TEXT formats numbers as strings.',
          concepts: ['LEFT, RIGHT, MID and LEN', 'FIND versus SEARCH', 'TRIM, CLEAN and SUBSTITUTE', 'TEXTSPLIT, TEXTBEFORE and TEXTAFTER', 'TEXTJOIN and TEXT formatting'],
          quiz: [
            ['Difference between FIND and SEARCH?', 'FIND is case-sensitive and takes no wildcards; SEARCH is case-insensitive and allows them.'],
            ['How do you get the domain from an email in A2?', '=TEXTAFTER(A2, "@")'],
            ['What does =TEXT(A2, "yyyy-mm") return?', 'The date formatted as year and month text, such as 2025-03.'],
          ],
        },
        {
          title: 'Date and time functions',
          description: 'DATE, YEAR, MONTH, DAY, EOMONTH and EDATE build and shift dates; NETWORKDAYS and WORKDAY handle business days; DATEDIF, WEEKNUM and TEXT drive period grouping. Most reporting bugs come from month ends and fiscal calendars.',
          concepts: ['DATE, YEAR, MONTH and DAY', 'EOMONTH and EDATE for period ends', 'NETWORKDAYS and WORKDAY with holidays', 'DATEDIF and age calculations', 'Fiscal year and week grouping'],
          quiz: [
            ['How do you get the last day of the month for A2?', '=EOMONTH(A2, 0)'],
            ['What does =DATEDIF(A2, B2, "m") return?', 'Whole months between the two dates.'],
            ['How do you count working days excluding a holiday list?', '=NETWORKDAYS(start, end, Holidays)'],
          ],
          prereqs: ['Number formats and dates as serial numbers'],
        },
        {
          title: 'Rounding, math and error handling',
          description: 'ROUND, ROUNDUP, ROUNDDOWN, MROUND, INT and MOD control precision and bucketing, while IFERROR, IFNA and the IS functions stop one bad lookup from poisoning a report. Reading #N/A, #REF!, #VALUE! and #DIV/0! tells you what actually broke.',
          concepts: ['ROUND family and MROUND', 'INT, MOD and bucketing', 'IFERROR versus IFNA', 'ISBLANK, ISNUMBER and ISTEXT', 'Reading the error values'],
          quiz: [
            ['Why prefer IFNA over IFERROR around XLOOKUP?', 'IFNA only hides missing matches; IFERROR hides every error including real formula mistakes.'],
            ['What does #REF! mean?', 'The formula points to a cell that was deleted.'],
            ['What does =MOD(ROW(),2) give you?', '1 on odd rows and 0 on even rows, useful for banding.'],
          ],
        },
      ],
    },
    {
      title: 'Lookups and Reference Functions',
      description: 'Pulling values from other tables, the modern way and the legacy way you will still meet.',
      topics: [
        {
          title: 'XLOOKUP',
          description: 'XLOOKUP(lookup, lookup_array, return_array, [if_not_found], [match_mode], [search_mode]) looks left or right, returns a default when missing, supports exact or approximate matches and can return whole rows. It replaces VLOOKUP and most INDEX/MATCH uses.',
          concepts: ['XLOOKUP arguments', 'if_not_found instead of IFERROR', 'Match modes and wildcards', 'Returning multiple columns', 'Search from last for latest record'],
          quiz: [
            ['How does XLOOKUP look to the left?', 'Return array is any column, so it just works, unlike VLOOKUP.'],
            ['What does match_mode -1 do?', 'Exact match, or the next smaller item if none.'],
            ['How do you find the most recent price for a product?', 'search_mode -1 to search last-to-first.'],
          ],
          prereqs: ['Excel Tables and structured references'],
        },
        {
          title: 'INDEX and MATCH',
          description: 'MATCH finds a position and INDEX returns the value at that position, so the pair looks up in any direction, handles two-way grids with two MATCHes, and never breaks when columns are inserted. It remains the standard in older workbooks.',
          concepts: ['MATCH and match types', 'INDEX with row and column', 'Two-way lookup with two MATCHes', 'Why INDEX/MATCH survives inserted columns'],
          quiz: [
            ['Write a two-way lookup for product in A2 and month in B1.', '=INDEX(Grid, MATCH(A2, Products, 0), MATCH(B1, Months, 0))'],
            ['What does match type 0 mean?', 'Exact match.'],
          ],
          prereqs: ['XLOOKUP'],
        },
        {
          title: 'VLOOKUP and HLOOKUP legacy',
          description: 'VLOOKUP searches the first column and returns from a column index, which breaks when columns move and cannot look left; the fourth argument defaults to approximate match, a classic silent bug. You need to read it and fix it, not write it.',
          concepts: ['VLOOKUP arguments and col_index_num', 'The approximate-match default trap', 'HLOOKUP for horizontal tables', 'Migrating VLOOKUP to XLOOKUP'],
          quiz: [
            ['Why is =VLOOKUP(A2, Table, 3) risky?', 'Range_lookup defaults to TRUE, giving approximate matches on unsorted data.'],
            ['Can VLOOKUP return a column to the left of the key?', 'No; use XLOOKUP or INDEX/MATCH.'],
          ],
          prereqs: ['XLOOKUP'],
        },
        {
          title: 'Approximate matches and banded lookups',
          description: 'Tax bands, commission tiers and grade boundaries need the largest threshold not above the value: XLOOKUP with match_mode -1 or a sorted VLOOKUP with TRUE. XMATCH and binary search modes make this fast and explicit.',
          concepts: ['Banded lookup tables', 'XLOOKUP match_mode -1 and 1', 'XMATCH for positions', 'Sorted data requirements'],
          quiz: [
            ['What does a band lookup need from its table?', 'Thresholds sorted ascending, one row per band start.'],
            ['What does XMATCH return?', 'The position of the value in the array.'],
          ],
          prereqs: ['XLOOKUP'],
        },
        {
          title: 'OFFSET, INDIRECT and CHOOSE',
          description: 'OFFSET builds ranges from a starting cell and offsets, INDIRECT turns text into a reference, and CHOOSE picks from a list; all three enable dynamic ranges and sheet-switching but OFFSET and INDIRECT are volatile and recalculate constantly.',
          concepts: ['OFFSET for dynamic ranges', 'INDIRECT and sheet names from text', 'CHOOSE for indexed selection', 'Volatile functions and slowdowns'],
          quiz: [
            ['Why avoid INDIRECT in large workbooks?', 'It is volatile and recalculates on every change, and it breaks if the sheet is renamed.'],
            ['What does =INDIRECT("\'"&A1&"\'!B2") do?', 'Returns B2 from the sheet named in A1.'],
          ],
        },
      ],
    },
    {
      title: 'Dynamic Arrays and Modern Formulas',
      description: 'Formulas that return whole ranges, and the functions built on top of them.',
      topics: [
        {
          title: 'Spilling and the # operator',
          description: 'A formula that returns an array now spills into neighbouring cells; A2# refers to the whole spill range and #SPILL! means something is in the way. Understanding spill ranges is the basis for FILTER, UNIQUE and SORT.',
          concepts: ['Spill ranges and #SPILL!', 'The # spill operator', 'Implicit intersection and @', 'Arrays as function arguments'],
          quiz: [
            ['What causes #SPILL!?', 'A non-empty cell inside the range the result needs.'],
            ['What does =SUM(B2#) do?', 'Sums the entire spill range starting at B2, however long it is.'],
          ],
          prereqs: ['Relative, absolute and mixed references'],
        },
        {
          title: 'FILTER, SORT and SORTBY',
          description: 'FILTER returns rows matching a condition (multiply conditions for AND, add for OR), SORT orders by a column index and SORTBY sorts by other arrays. Together they build live extracts without helper columns or copy-paste.',
          concepts: ['FILTER with one condition', 'Combining conditions with * and +', 'SORT by column and direction', 'SORTBY with multiple keys', 'if_empty handling'],
          quiz: [
            ['Filter Sales where Region is "East" or "West".', '=FILTER(Sales, (Sales[Region]="East")+(Sales[Region]="West"))'],
            ['Sort a table by its third column descending.', '=SORT(Table1, 3, -1)'],
          ],
          prereqs: ['Spilling and the # operator'],
        },
        {
          title: 'UNIQUE and distinct counting',
          description: 'UNIQUE returns the distinct values of a range (or values that appear exactly once), which combined with COUNTA gives a distinct count and combined with SUMIFS builds a summary table from one formula.',
          concepts: ['UNIQUE by rows and by columns', 'Exactly-once mode', 'Distinct count with COUNTA(UNIQUE())', 'One-formula summary tables'],
          quiz: [
            ['How do you count distinct customers in a column?', '=COUNTA(UNIQUE(Customers))'],
            ['What does =UNIQUE(A2:A100, , TRUE) return?', 'Values that occur exactly once.'],
          ],
          prereqs: ['Spilling and the # operator'],
        },
        {
          title: 'SEQUENCE and array arithmetic',
          description: 'SEQUENCE generates numbered rows or grids, and arithmetic between arrays happens element by element, which builds date lists, amortisation schedules and running calculations without dragging formulas. TRANSPOSE, TAKE, DROP, VSTACK and HSTACK reshape results.',
          concepts: ['SEQUENCE rows, columns, start, step', 'Element-wise array arithmetic', 'TRANSPOSE, TAKE and DROP', 'VSTACK and HSTACK'],
          quiz: [
            ['How do you list the first 12 month starts from a date in A1?', '=EDATE(A1, SEQUENCE(12, 1, 0))'],
            ['What does VSTACK do?', 'Appends arrays vertically into one spill range.'],
          ],
          prereqs: ['Spilling and the # operator'],
        },
        {
          title: 'LET for readable formulas',
          description: 'LET names intermediate values inside a formula so a calculation runs once and reads like a small program, which cuts duplication in long IF and FILTER chains and makes complex formulas reviewable.',
          concepts: ['LET syntax and name pairs', 'Naming intermediate results', 'Avoiding repeated sub-expressions', 'Refactoring a long formula with LET'],
          quiz: [
            ['What is the last argument of LET?', 'The calculation that uses the named values.'],
            ['Why does LET improve performance?', 'Each named expression is evaluated once instead of every time it appears.'],
          ],
        },
        {
          title: 'LAMBDA and custom functions',
          description: 'LAMBDA defines a reusable function with parameters, saved under a name in the Name Manager; MAP, BYROW, BYCOL, REDUCE, SCAN and MAKEARRAY apply lambdas across arrays, replacing helper columns and VBA for many calculations.',
          concepts: ['LAMBDA parameters and body', 'Naming a LAMBDA in Name Manager', 'MAP, BYROW and BYCOL', 'REDUCE and SCAN for accumulation', 'Testing a LAMBDA inline'],
          quiz: [
            ['How do you test a LAMBDA before naming it?', 'Call it inline: =LAMBDA(x, x*2)(5)'],
            ['Which helper applies a lambda to each row and returns one value per row?', 'BYROW'],
          ],
          prereqs: ['LET for readable formulas'],
        },
      ],
    },
    {
      title: 'Formatting, Validation and Controls',
      description: 'Making workbooks self-explaining and hard to break.',
      topics: [
        {
          title: 'Conditional formatting rules',
          description: 'Highlight Cells, Top/Bottom, Data Bars, Colour Scales and Icon Sets cover common cases, while formula-based rules colour entire rows or flag exceptions using any logic. Rule order and Stop If True decide what wins when rules overlap.',
          concepts: ['Built-in highlight rules', 'Data bars, colour scales and icon sets', 'Formula-based rules on whole rows', 'Rule precedence and Stop If True', 'Managing rules across a workbook'],
          quiz: [
            ['How do you colour a whole row where Status is "Late"?', 'Select rows, new rule with formula =$D2="Late" (column locked, row relative).'],
            ['Where do you see all rules on a sheet?', 'Home, Conditional Formatting, Manage Rules, show for This Worksheet.'],
          ],
          prereqs: ['Relative, absolute and mixed references'],
        },
        {
          title: 'Data validation and dependent dropdowns',
          description: 'Data Validation restricts entries to lists, whole numbers, dates or custom formulas and shows input and error messages; a dependent dropdown uses INDIRECT or FILTER to change its list based on another cell.',
          concepts: ['List, number and date validation', 'Custom formula validation', 'Dependent dropdowns with INDIRECT or FILTER', 'Input messages and error alerts', 'Circling invalid data'],
          quiz: [
            ['How do you make a dropdown list from a Table column?', 'List validation with source =INDIRECT("Table1[Region]") or a spill reference like =$H$2#.'],
            ['Which validation stops duplicates in a column?', 'Custom with =COUNTIF($A:$A, A2)=1'],
          ],
        },
        {
          title: 'Protecting sheets and structuring inputs',
          description: 'Unlock input cells, then Protect Sheet so formulas cannot be overwritten; colour inputs consistently, use grouping and freeze panes for navigation, and set print areas so a workbook survives other people using it.',
          concepts: ['Locked cells and Protect Sheet', 'Input cell colour conventions', 'Freeze Panes and Group outline', 'Print areas and page setup'],
          quiz: [
            ['Why do all cells appear locked but still editable?', 'Locking only applies after Protect Sheet is turned on.'],
            ['What keeps headers visible when scrolling?', 'View, Freeze Panes.'],
          ],
        },
        {
          title: 'Auditing formulas and finding errors',
          description: 'Trace Precedents and Dependents draw arrows between cells, Evaluate Formula steps through a calculation, Show Formulas reveals every formula at once, and Error Checking finds inconsistent formulas in a column. This is how you review someone else\'s workbook.',
          concepts: ['Trace Precedents and Dependents', 'Evaluate Formula step by step', 'Show Formulas with Ctrl+`', 'Inconsistent formula warnings', 'Watch Window for far-away cells'],
          quiz: [
            ['How do you see which cells feed a result?', 'Formulas tab, Trace Precedents.'],
            ['What does the green triangle in a cell corner usually mean?', 'An error check flag, often a formula inconsistent with its neighbours or a number stored as text.'],
          ],
        },
      ],
    },
    {
      title: 'Pivot Tables and Pivot Charts',
      description: 'Summarising thousands of rows in seconds, and controlling exactly how.',
      topics: [
        {
          title: 'Building a pivot table',
          description: 'Insert, PivotTable from a Table puts fields into Rows, Columns, Values and Filters areas; the layout choices (compact, outline, tabular), subtotals and blank rows decide whether the result is readable or exportable.',
          concepts: ['Rows, Columns, Values and Filters areas', 'Compact, outline and tabular layouts', 'Subtotals and grand totals', 'Repeat item labels for export', 'Sorting and filtering pivot rows'],
          quiz: [
            ['Which layout is best when you will copy the pivot into another table?', 'Tabular with Repeat All Item Labels and subtotals off.'],
            ['Why does a numeric field default to Count instead of Sum?', 'The column contains text or blanks, so Excel treats it as non-numeric.'],
          ],
          prereqs: ['Excel Tables and structured references'],
        },
        {
          title: 'Value field settings and Show Values As',
          description: 'Summarize Values By switches Sum, Count, Average, Max and Distinct Count; Show Values As turns the same field into % of Column Total, % of Parent, Difference From, Running Total or Rank without any formulas.',
          concepts: ['Summarize Values By options', '% of Column, Row and Parent Total', 'Difference From and % Difference From', 'Running Total In and Rank', 'Number formatting inside the pivot'],
          quiz: [
            ['How do you show month-over-month change in a pivot?', 'Show Values As, Difference From, base field Month, base item (previous).'],
            ['What is needed for Distinct Count to appear?', 'Add this data to the Data Model when creating the pivot.'],
          ],
          prereqs: ['Building a pivot table'],
        },
        {
          title: 'Grouping, slicers and timelines',
          description: 'Group dates into months, quarters and years or numbers into bins directly in the pivot; slicers and timelines add clickable filters that can be connected to several pivots at once for a one-page report.',
          concepts: ['Grouping dates and numbers', 'Inserting slicers', 'Timeline filters for dates', 'Report Connections across pivots', 'Slicer settings and styles'],
          quiz: [
            ['How do you filter three pivots with one slicer?', 'Slicer, Report Connections, tick each pivot (they must share a cache).'],
            ['What does grouping a numeric field by 100 do?', 'Creates bins such as 0-99, 100-199.'],
          ],
          prereqs: ['Building a pivot table'],
        },
        {
          title: 'Calculated fields, calculated items and GETPIVOTDATA',
          description: 'Calculated Fields add a formula on summed fields, Calculated Items add a row from other rows, and GETPIVOTDATA pulls a specific pivot value into a report cell that keeps working when the pivot changes shape.',
          concepts: ['Calculated Field limitations', 'Calculated Items and double counting', 'GETPIVOTDATA arguments', 'Turning Generate GetPivotData on and off'],
          quiz: [
            ['Why is a calculated field such as Profit/Revenue correct at subtotal level?', 'Calculated fields operate on the summed fields, giving the ratio of sums, not an average of row ratios.'],
            ['What breaks a plain cell reference into a pivot?', 'The pivot growing or reordering, which GETPIVOTDATA avoids.'],
          ],
          prereqs: ['Value field settings and Show Values As'],
        },
        {
          title: 'Pivot charts and refreshing',
          description: 'A pivot chart stays linked to its pivot and its slicers, updates on Refresh, and can hide field buttons for a clean look. Refresh All, cache behaviour and "retain items deleted from the data source" explain most stale-data surprises.',
          concepts: ['Inserting a PivotChart', 'Hiding field buttons', 'Refresh and Refresh All', 'Pivot cache and stale items', 'Refresh on open setting'],
          quiz: [
            ['Why does a deleted category still appear in a filter list?', 'The pivot cache retains it; set Number of items to retain per field to None and refresh.'],
            ['Does editing source data update the pivot automatically?', 'No, you must Refresh.'],
          ],
          prereqs: ['Grouping, slicers and timelines'],
        },
      ],
    },
    {
      title: 'Power Query',
      description: 'Repeatable data import and cleaning without formulas.',
      topics: [
        {
          title: 'Get Data and the Power Query Editor',
          description: 'Data, Get Data connects to files, folders, databases and the web and opens the Power Query Editor, where every click becomes a recorded step. Loading to a Table, a connection only or the Data Model determines how the result is used.',
          concepts: ['Get Data sources', 'The Query Editor layout', 'Load to Table, connection or Data Model', 'Queries and Connections pane', 'Refreshing a query'],
          quiz: [
            ['What happens when you click Refresh All on a Power Query table?', 'The query re-runs every step against the source and reloads the result.'],
            ['When would you load as Connection Only?', 'For intermediate queries that only feed other queries.'],
          ],
        },
        {
          title: 'Applied Steps and the M behind them',
          description: 'Each transformation is a line of M in the Advanced Editor; steps can be renamed, reordered and deleted, and the formula bar shows the M call for the selected step so you can tweak arguments without learning the whole language.',
          concepts: ['Applied Steps pane', 'Formula bar and Advanced Editor', 'let expression structure', 'Renaming and reordering steps', 'Step-level errors'],
          quiz: [
            ['What does each Applied Step reference?', 'The previous step by name, in a let expression.'],
            ['Is M case-sensitive?', 'Yes; Table.SelectRows is not table.selectrows.'],
          ],
          prereqs: ['Get Data and the Power Query Editor'],
        },
        {
          title: 'Cleaning transforms: split, unpivot, fill and types',
          description: 'Use First Row as Headers, Change Type, Split Column, Fill Down, Unpivot Columns, Trim and Replace Values fix the usual report exports. Unpivot turns wide monthly columns into tidy rows, the single most useful reshaping move.',
          concepts: ['Change Type and locale', 'Split Column by delimiter', 'Fill Down for merged headers', 'Unpivot and Pivot columns', 'Replace Values and Trim'],
          quiz: [
            ['What does Unpivot Other Columns do?', 'Keeps selected columns and turns all others into Attribute and Value rows.'],
            ['Why set Change Type with locale?', 'So dd/mm/yyyy and decimal commas parse correctly.'],
          ],
          prereqs: ['Applied Steps and the M behind them'],
        },
        {
          title: 'Merge and Append queries',
          description: 'Merge joins two queries on keys with Left Outer, Inner, Left Anti and other join kinds, then expands the chosen columns; Append stacks queries with matching columns. This is how lookups and monthly files combine without VLOOKUP.',
          concepts: ['Merge join kinds', 'Expanding merged columns', 'Left Anti for finding missing rows', 'Append two or more queries', 'Fuzzy matching options'],
          quiz: [
            ['Which join kind returns rows in the first table with no match in the second?', 'Left Anti.'],
            ['What must Append have in common?', 'Column names; unmatched columns become null.'],
          ],
          prereqs: ['Cleaning transforms: split, unpivot, fill and types'],
        },
        {
          title: 'Combining files from a folder and parameters',
          description: 'From Folder combines every file with the same layout through a generated sample transform, and parameters make paths and filters editable from a cell, so the monthly export lands in the report with one refresh.',
          concepts: ['From Folder and Combine Files', 'Sample File transform function', 'Query parameters', 'Parameters from a worksheet cell', 'Handling new files and changed layouts'],
          quiz: [
            ['What does the Transform Sample File query do?', 'Defines the steps applied to every file in the folder.'],
            ['How do you let a user change the source path without opening the editor?', 'Bind a parameter to a named cell and read it with Excel.CurrentWorkbook.'],
          ],
          prereqs: ['Merge and Append queries'],
        },
      ],
    },
    {
      title: 'Power Pivot and the Data Model',
      description: 'Relating tables in Excel and writing measures.',
      topics: [
        {
          title: 'Loading to the Data Model and relationships',
          description: 'The Data Model stores tables in a compressed in-memory engine and lets you relate them in Diagram View, so a pivot can use fields from several tables without merging them first. Relationships need a one-side with unique keys.',
          concepts: ['Enabling Power Pivot', 'Add to Data Model', 'Diagram View and relationships', 'One-to-many and the unique side', 'Date tables in the model'],
          quiz: [
            ['Why does a pivot show the same total on every row after adding a second table?', 'No relationship exists, so the filter does not propagate.'],
            ['Which side of a relationship must have unique values?', 'The one (lookup) side.'],
          ],
          prereqs: ['Get Data and the Power Query Editor'],
        },
        {
          title: 'Measures with DAX in Excel',
          description: 'Measures are formulas evaluated in the pivot filter context, written in DAX from the Power Pivot tab: SUM, DIVIDE, CALCULATE and DISTINCTCOUNT cover most reporting, and they avoid the calculated field limitations of classic pivots.',
          concepts: ['Creating a measure', 'Implicit versus explicit measures', 'DIVIDE for safe ratios', 'CALCULATE with a filter', 'KPIs from measures'],
          quiz: [
            ['Where do you create a measure?', 'Power Pivot tab, Measures, New Measure (or right-click the table in the field list).'],
            ['How do you write a distinct customer count?', 'Customers := DISTINCTCOUNT(Sales[CustomerID])'],
          ],
          prereqs: ['Loading to the Data Model and relationships'],
        },
        {
          title: 'When Excel runs out and Power BI begins',
          description: 'Row limits, manual refresh, file sharing and no row-level security mark the point where a workbook should become a Power BI model; the same Power Query and DAX carry over, so the migration is mostly about publishing and governance.',
          concepts: ['Signs a workbook has outgrown Excel', 'What transfers to Power BI', 'Importing a workbook model into Power BI', 'Keeping Excel as a front end'],
          quiz: [
            ['What is the worksheet row limit?', '1,048,576 rows; the Data Model can hold far more.'],
            ['Can Power BI import an Excel Data Model?', 'Yes, via File, Import, Power Query, Power Pivot, Power View.'],
          ],
          prereqs: ['Measures with DAX in Excel'],
        },
      ],
    },
    {
      title: 'Charts, Dashboards and What-If Analysis',
      description: 'Turning numbers into visuals and models people can play with.',
      topics: [
        {
          title: 'Choosing and building charts in Excel',
          description: 'Clustered bar for comparison, line for time, scatter for relationships, stacked for composition and waterfall for bridges; Recommended Charts and Select Data control what series and categories are plotted.',
          concepts: ['Chart types by question', 'Select Data and series order', 'Waterfall and funnel charts', 'Switching rows and columns', 'Chart templates'],
          quiz: [
            ['Which chart shows how a starting value becomes an ending value through steps?', 'Waterfall.'],
            ['How do you make categories read top-down in a bar chart?', 'Format the vertical axis with Categories in reverse order.'],
          ],
        },
        {
          title: 'Chart formatting and combo charts',
          description: 'Axis bounds, number formats, data labels, secondary axes and combo charts (columns for volume, a line for rate) make a chart honest and readable; removing gridlines and legends that add nothing is half the job.',
          concepts: ['Axis bounds and units', 'Data labels from cells', 'Secondary axis and combo charts', 'Removing chart clutter', 'Dynamic chart titles from cells'],
          quiz: [
            ['How do you link a chart title to a cell?', 'Select the title, type = in the formula bar and click the cell.'],
            ['When is a secondary axis justified?', 'When two series have different units, such as revenue and margin %.'],
          ],
          prereqs: ['Choosing and building charts in Excel'],
        },
        {
          title: 'Building an Excel dashboard',
          description: 'A dashboard sheet reads from a calc sheet, uses slicers connected to pivots, sparklines for trends and aligned objects on a grid; it never contains raw data and refreshes with one click.',
          concepts: ['Dashboard sheet structure', 'Slicers driving multiple visuals', 'Sparklines in cells', 'Aligning and sizing objects', 'Refresh and protection for users'],
          quiz: [
            ['Why keep calculations off the dashboard sheet?', 'So layout changes never break formulas and users cannot edit logic.'],
            ['What does a sparkline show?', 'A tiny in-cell line, column or win/loss chart for one row of data.'],
          ],
          prereqs: ['Grouping, slicers and timelines', 'Chart formatting and combo charts'],
        },
        {
          title: 'Goal Seek and Scenario Manager',
          description: 'Goal Seek changes one input until a formula hits a target, answering "what price gives 20% margin"; Scenario Manager stores named sets of inputs and produces a summary report comparing outcomes side by side.',
          concepts: ['Goal Seek set cell and changing cell', 'Scenario Manager scenarios', 'Scenario Summary report', 'Solver for constrained problems'],
          quiz: [
            ['Where is Goal Seek?', 'Data, What-If Analysis, Goal Seek.'],
            ['When does Solver replace Goal Seek?', 'When several inputs change under constraints.'],
          ],
        },
        {
          title: 'Data tables and sensitivity analysis',
          description: 'A one- or two-variable Data Table recalculates a formula for a grid of input values, producing a sensitivity matrix such as NPV across discount rate and growth; combined with conditional formatting it becomes a heat map.',
          concepts: ['One-variable Data Table', 'Two-variable Data Table', 'Row and column input cells', 'Heat map with colour scales', 'Calculation mode and Data Table speed'],
          quiz: [
            ['What does a two-variable data table need in its top-left cell?', 'A reference to the output formula.'],
            ['Why can data tables slow a workbook?', 'They recalculate for every cell in the grid; set Automatic Except for Data Tables.'],
          ],
          prereqs: ['Goal Seek and Scenario Manager'],
        },
      ],
    },
    {
      title: 'Statistics and Data Cleaning in Excel',
      description: 'Describing data honestly and getting messy exports into shape.',
      topics: [
        {
          title: 'Descriptive statistics and the Analysis ToolPak',
          description: 'AVERAGE, MEDIAN, MODE.SNGL, STDEV.S versus STDEV.P, PERCENTILE.INC and QUARTILE.INC describe a distribution, and the Analysis ToolPak add-in produces a full Descriptive Statistics table and histogram in one dialog.',
          concepts: ['Mean, median and mode functions', 'STDEV.S versus STDEV.P', 'PERCENTILE.INC and QUARTILE.INC', 'Enabling the Analysis ToolPak', 'Histogram and bin ranges'],
          quiz: [
            ['When do you use STDEV.S?', 'When the data is a sample of a larger population.'],
            ['How do you enable the Analysis ToolPak?', 'File, Options, Add-ins, Manage Excel Add-ins, Go, tick Analysis ToolPak.'],
          ],
        },
        {
          title: 'Correlation, trendlines and forecasting',
          description: 'CORREL measures linear association, chart trendlines display R-squared, and FORECAST.LINEAR, TREND and FORECAST.ETS project values; the Forecast Sheet builds a seasonal forecast with confidence bounds from a date series.',
          concepts: ['CORREL and PEARSON', 'Trendlines and R-squared', 'FORECAST.LINEAR and TREND', 'FORECAST.ETS and seasonality', 'Forecast Sheet with confidence intervals'],
          quiz: [
            ['What does R-squared of 0.9 on a trendline mean?', 'The line explains 90% of the variance in the y values.'],
            ['Which function handles seasonal data?', 'FORECAST.ETS'],
          ],
          prereqs: ['Descriptive statistics and the Analysis ToolPak'],
        },
        {
          title: 'Cleaning data: Text to Columns, Remove Duplicates and Flash Fill',
          description: 'Text to Columns splits by delimiter or width and fixes dates, Remove Duplicates de-dupes on chosen columns, Flash Fill infers a pattern from examples, and Find and Replace with wildcards strips unwanted characters.',
          concepts: ['Text to Columns and date conversion', 'Remove Duplicates on selected columns', 'Flash Fill with Ctrl+E', 'Find and Replace wildcards', 'Sort and Filter for inspection'],
          quiz: [
            ['How do you convert text dates in dd/mm/yyyy to real dates in one go?', 'Text to Columns, Finish with column data format Date DMY.'],
            ['Which cleaning tool keeps the first occurrence and removes later ones?', 'Remove Duplicates.'],
          ],
        },
        {
          title: 'Numbers stored as text and other type traps',
          description: 'Numbers pasted from systems often arrive as text with non-breaking spaces or trailing characters; VALUE, NUMBERVALUE, --, Paste Special Multiply and Power Query Change Type convert them, and ISNUMBER checks the result.',
          concepts: ['Detecting text numbers with ISNUMBER', 'VALUE and NUMBERVALUE', 'Double unary and Paste Special Multiply', 'Non-breaking spaces and CHAR(160)', 'Leading zeros and IDs'],
          quiz: [
            ['Why does SUM return 0 on a column of visible numbers?', 'They are stored as text.'],
            ['How do you remove CHAR(160) from imported text?', '=SUBSTITUTE(A2, CHAR(160), "")'],
          ],
          prereqs: ['Cleaning data: Text to Columns, Remove Duplicates and Flash Fill'],
        },
        {
          title: 'Sampling, randomisation and rank functions',
          description: 'RAND, RANDBETWEEN and RANDARRAY draw samples or shuffle rows, RANK.EQ and RANK.AVG rank values with tie handling, and LARGE and SMALL pull the top or bottom N for leaderboards without sorting the data.',
          concepts: ['RAND and RANDARRAY sampling', 'Freezing random values', 'RANK.EQ versus RANK.AVG', 'LARGE, SMALL and top-N lists'],
          quiz: [
            ['How do you freeze a random sample?', 'Copy and Paste Special Values.'],
            ['What does =LARGE(Sales, 3) return?', 'The third-largest value in Sales.'],
          ],
        },
      ],
    },
    {
      title: 'Google Sheets Differences',
      description: 'What changes when the same analysis moves to Sheets.',
      topics: [
        {
          title: 'Sheets-only functions: QUERY, ARRAYFORMULA and IMPORTRANGE',
          description: 'QUERY runs SQL-like select, where, group by and pivot over a range; ARRAYFORMULA applies a formula down a whole column; IMPORTRANGE links workbooks, and IMPORTHTML and GOOGLEFINANCE pull live external data.',
          concepts: ['QUERY select, where and group by', 'ARRAYFORMULA over columns', 'IMPORTRANGE and permissions', 'IMPORTHTML and GOOGLEFINANCE', 'Sheets equivalents of XLOOKUP and LET'],
          quiz: [
            ['Write a QUERY that totals Amount by Region.', '=QUERY(A1:C, "select A, sum(C) group by A", 1)'],
            ['What must happen the first time IMPORTRANGE runs?', 'You must click Allow access to grant permission to the source sheet.'],
          ],
          prereqs: ['FILTER, SORT and SORTBY'],
        },
        {
          title: 'Collaboration, sharing and version history',
          description: 'Sheets is multi-user by default with comments, assigned tasks, protected ranges and named version history, while Excel co-authoring needs OneDrive or SharePoint; the sharing model changes how you design inputs and protect logic.',
          concepts: ['Sharing roles and link settings', 'Protected ranges and sheets', 'Version history and named versions', 'Comments and assignments', 'Excel co-authoring comparison'],
          quiz: [
            ['How do you stop collaborators editing a formula block in Sheets?', 'Data, Protect sheets and ranges.'],
            ['Where do you restore a previous version?', 'File, Version history, See version history.'],
          ],
        },
        {
          title: 'Pivots, Connected Sheets and Apps Script',
          description: 'Sheets pivot tables have fewer options than Excel, Connected Sheets queries BigQuery directly, and Apps Script (JavaScript) replaces VBA and Office Scripts for automation and scheduled refreshes.',
          concepts: ['Sheets pivot table differences', 'Connected Sheets for BigQuery', 'Apps Script basics and triggers', 'Excel Office Scripts comparison'],
          quiz: [
            ['What language does Apps Script use?', 'JavaScript.'],
            ['What is the Sheets equivalent of Power Query?', 'There is none built in; use QUERY, IMPORTRANGE, Connected Sheets or Apps Script.'],
          ],
          prereqs: ['Building a pivot table'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Complete workbooks to build end to end, then the questions hiring managers ask.',
      style: 'project',
      topics: [
        {
          title: 'Project: sales analysis workbook',
          description: 'Import twelve monthly CSV exports with Power Query, clean and append them, build a Data Model with a date table, and deliver a dashboard with region and product slicers, YTD and prior-year measures and a top-10 customers table.',
          concepts: ['Combine and clean the monthly files', 'Model with a date table', 'Write YTD and prior-year measures', 'Build the slicer-driven dashboard'],
          quiz: [
            ['Why use a separate date table?', 'So time intelligence measures and grouping work across every fact table.'],
            ['How does a new month get in?', 'Drop the file in the folder and Refresh All.'],
          ],
        },
        {
          title: 'Project: budget versus actual model',
          description: 'Build a driver-based budget with input cells, monthly phasing, a variance sheet using XLOOKUP against actuals, conditional formatting for over-spend, and a scenario summary comparing base, upside and downside cases.',
          concepts: ['Design inputs and drivers', 'Phase the budget by month', 'Variance analysis with lookups', 'Scenarios and sensitivity table'],
          quiz: [
            ['How do you show variance as favourable or adverse consistently?', 'Define the sign convention once and use a custom number format with colours.'],
            ['Where do assumptions live?', 'On a single inputs sheet, referenced absolutely.'],
          ],
        },
        {
          title: 'Project: customer cohort table',
          description: 'From an orders list, derive each customer\'s first-order month, build a cohort-by-month grid with COUNTIFS or a pivot, convert to retention percentages, and format it as a colour-scale triangle with a chart of the average curve.',
          concepts: ['Derive first-order month per customer', 'Build the cohort grid', 'Convert to retention percentages', 'Visualise with colour scales'],
          quiz: [
            ['How do you get first-order month per customer?', 'MINIFS on order date by customer, then EOMONTH or TEXT to the month.'],
            ['Why is the grid triangular?', 'Newer cohorts have fewer months of history.'],
          ],
        },
        {
          title: 'Project: survey results analysis',
          description: 'Take a raw survey export, unpivot the question columns in Power Query, code free-text answers with lookups, compute response distributions and cross-tabs with pivots, and produce a one-page summary with charts and a confidence note.',
          concepts: ['Unpivot the survey export', 'Code and categorise answers', 'Cross-tab with pivot tables', 'Summarise with charts and margins of error'],
          quiz: [
            ['Why unpivot before analysing?', 'One row per response and question makes pivots and filters trivial.'],
            ['What does a 5-point Likert average hide?', 'The distribution; show the percentage per option too.'],
          ],
        },
        {
          title: 'Excel interview questions',
          description: 'The questions that keep coming up: XLOOKUP versus VLOOKUP, absolute references, SUMIFS versus pivots, how you would clean a messy export, what Power Query is for, and how you keep a workbook auditable.',
          concepts: ['Formula and lookup questions', 'Pivot and Power Query questions', 'Data cleaning scenarios', 'Explaining workbook design choices'],
          quiz: [
            ['Explain the difference between XLOOKUP and VLOOKUP.', 'XLOOKUP looks in any direction, defaults to exact match and has a built-in not-found value.'],
            ['When would you use Power Query instead of formulas?', 'For repeatable imports and reshaping, especially unpivoting and combining files.'],
          ],
          style: 'reading',
        },
        {
          title: 'Timed Excel test practice',
          description: 'Practical screens give a messy dataset and thirty minutes: clean it, answer aggregation questions, build a pivot and a chart. Practising the sequence and keyboard shortcuts is what makes the difference under time pressure.',
          concepts: ['Reading the brief and planning steps', 'Shortcut-driven cleaning', 'Answering with SUMIFS and pivots', 'Checking answers before submitting'],
          quiz: [
            ['What do you check first on an unknown dataset?', 'Row count, blanks, duplicates and whether numbers and dates are real types.'],
            ['Which shortcut converts a range to a Table?', 'Ctrl+T'],
          ],
          style: 'practice',
        },
      ],
    },
  ],
})
