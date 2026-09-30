import { defineTrack } from '../define'

export const dashboardDesign = defineTrack({
  id: 'track-dashboard-design',
  title: 'Dashboard Design',
  description: 'Designing clear, actionable, and executive-ready dashboards in Power BI, Tableau, and modern BI tools: preattentive visual attributes, the 5-second rule, cognitive load, visual hierarchy, choosing the right chart, color palettes and accessibility, KPI card anatomy, interactive UX, and data storytelling.',
  family: 'Data Analytics & BI',
  kind: 'domain',
  icon: '🎨',
  tags: ['dashboard-design', 'data-visualization', 'power-bi', 'tableau', 'ux', 'kpis', 'storytelling', 'business-intelligence'],
  languages: [],
  explainMode: 'tool',
  code: { label: 'DAX, SQL or spreadsheet formulas', id: 'sql', fixed: false },
  supports: { project: true },
  prerequisites: ['track-data-visualization'],
  style: 'practice',
  categories: [
    {
      title: 'Visual Perception and Cognitive Principles',
      description: 'How the human visual cortex processes information and how to minimize cognitive load.',
      topics: [
        {
          title: 'Preattentive attributes and visual processing',
          description: 'Preattentive visual attributes—color hue, position, size, and shape—are processed by the visual cortex in under 200 milliseconds before conscious attention. Leveraging these attributes directs executive attention instantly to outliers, anomalies, and critical performance shifts.',
          concepts: [
            'Preattentive categories: color, form, and position',
            'Pre-attentive speed versus serial search',
            'Using color as a deliberate visual cue',
            'Contrast and visual salience for outliers',
          ],
          quiz: [
            ['Which visual attribute is processed most accurately by the human eye for quantitative comparison?', 'Position along a common scale (e.g. standard bar chart).'],
            ['What happens when every card or chart on a dashboard uses bright accent colors?', 'Visual noise overwhelms the viewer, destroying preattentive contrast.'],
          ],
        },
        {
          title: 'The 5-Second Rule and Cognitive Load',
          description: 'An executive should understand the core message, status, and health of a dashboard within 5 seconds of opening it. Limiting cognitive load by eliminating chartjunk, excessive borders, unnecessary gridlines, and gratuitous 3D effects keeps focus on decision-making.',
          concepts: [
            'The 5-Second test for dashboard clarity',
            'Intrinsic, extraneous, and germane cognitive load',
            'Edward Tufte data-to-ink ratio principles',
            'Eliminating 3D charts and decorative backgrounds',
          ],
          quiz: [
            ['What is the primary objective of Edward Tufte’s data-to-ink ratio?', 'To ensure the vast majority of visual pixels are directly communicating data rather than ornamentation.'],
            ['What is an immediate indicator that a dashboard fails the 5-second rule?', 'The user must pause to read multiple legends or ask what a colored box represents.'],
          ],
          prereqs: ['Preattentive attributes and visual processing'],
        },
        {
          title: 'Visual Hierarchy and Scanning Patterns',
          description: 'Users scan screens in predictable paths: Western readers follow an F-pattern or Z-pattern, starting at the top-left corner. Placing top-level health KPIs and primary status indicators in the upper left and secondary breakdowns lower down matches natural reading habits.',
          concepts: [
            'F-pattern and Z-pattern scanning behaviors',
            'Top-left placement for primary status indicators',
            'Inverted pyramid layout from summaries to details',
            'Visual grouping with whitespace and cards',
          ],
          quiz: [
            ['Where on a dashboard should the most critical company KPI be located?', 'In the top-left area where users naturally begin reading.'],
            ['How should related metrics be grouped visually without adding heavy borders?', 'Using whitespace and subtle, low-contrast background cards.'],
          ],
          prereqs: ['The 5-Second Rule and Cognitive Load'],
        },
      ],
    },
    {
      title: 'Dashboard Archetypes and Audience Alignment',
      description: 'Aligning layout, refresh cadence, and complexity with specific user roles.',
      topics: [
        {
          title: 'Strategic and Executive Dashboards',
          description: 'C-suite and VP audiences need high-level summaries, variance against quarterly goals, and macro trends. Executive dashboards focus on high-level KPI cards, year-over-year deltas, and minimal slicers, answering "Are we on track?" in seconds.',
          concepts: [
            'Audience needs for executive decision makers',
            'Target vs actual variance and quarterly progress',
            'Monthly and quarterly refresh schedules',
            'Restricting complex drill-downs to prevent clutter',
          ],
          quiz: [
            ['What is the primary question an executive dashboard must answer?', '"Are we hitting our strategic targets, and where are the critical exceptions?"'],
            ['Why should executive dashboards minimize interactive slicers?', 'Executives need quick, definitive answers rather than spending 15 minutes slicing multidimensional tables.'],
          ],
        },
        {
          title: 'Operational Dashboards and Real-Time Monitoring',
          description: 'Front-line operators, support leads, and logistics managers require operational dashboards displaying current-day queues, live SLA thresholds, inventory alerts, and instant visual status indicators to trigger immediate tactical actions.',
          concepts: [
            'Operational monitoring for shift leads and managers',
            'Real-time queues, pending tickets, and thresholds',
            'Streaming and hourly refresh intervals',
            'Status cues for rapid tactical interventions',
          ],
          quiz: [
            ['How do operational dashboards differ from executive dashboards?', 'Operational dashboards monitor real-time tactical tasks and immediate bottlenecks; executive dashboards track long-term strategic health.'],
            ['What happens if an operational dashboard uses complex statistical charts?', 'Operators cannot make rapid decisions during active incidents; simple tables, counters, and gauges work better.'],
          ],
          prereqs: ['Strategic and Executive Dashboards'],
        },
        {
          title: 'Analytical Dashboards: Exploratory and Drill-Down',
          description: 'Analysts and product managers need rich exploratory environments: multi-select slicers, date-range pickers, drill-through to row-level transaction grains, cross-filtering, and statistical distributions to test hypotheses and discover root causes.',
          concepts: [
            'Analytical environments for product and BI specialists',
            'Multidimensional cross-filtering and cohort analysis',
            'Detailed drill-through paths to row-level records',
            'Query performance during heavy multi-filter slicing',
          ],
          quiz: [
            ['What capability defines an analytical dashboard?', 'Rich interactive filtering, drill-through to transaction-level details, and multidimensional parameter controls.'],
            ['What design challenge is unique to analytical dashboards?', 'Balancing analytical depth with fast visual responsiveness and query performance.'],
          ],
          prereqs: ['Operational Dashboards and Real-Time Monitoring'],
        },
        {
          title: 'Mobile BI and Tablet Dashboard Layouts',
          description: 'Executives and field managers frequently view reports on smartphones. Designing dedicated mobile layouts with single-column vertical scrolling, large tap targets (minimum 48px), simplified card summaries, and collapsed filters ensures clarity on small screens.',
          concepts: [
            'Single-column vertical scrolling layouts for phones',
            'Tap target sizing and touch ergonomics',
            'Simplified card views omitting crowded axis labels',
            'Power BI and Tableau mobile layout builders',
          ],
          quiz: [
            ['Why should mobile dashboards use a single-column layout?', 'Multi-column grids shrink visuals below legible font sizes on narrow smartphone viewports.'],
            ['What is the recommended minimum tap target size for mobile filters?', 'At least 48px by 48px to accommodate fingers accurately.'],
          ],
          prereqs: ['Analytical Dashboards: Exploratory and Drill-Down'],
        },
      ],
    },
    {
      title: 'Visual Selection and Chart Anatomy',
      description: 'Selecting the exact visual that communicates the relationship without distortion.',
      topics: [
        {
          title: 'Matching the Chart to the Analytical Question',
          description: 'Categorical comparisons belong in horizontal or vertical bar charts; changes over time belong in line or area charts; relationships between two numeric variables belong in scatter plots; part-to-whole compositions belong in 100% stacked bars or treemaps.',
          concepts: [
            'Horizontal bar charts with descending order',
            'Time series with continuous chronological axes',
            'Correlation analysis with scatter plots',
            'Part-to-whole compositions with stacked bars',
          ],
          quiz: [
            ['When should you choose a horizontal bar chart over a vertical column chart?', 'When category labels are long and would otherwise angle or truncate on a vertical chart.'],
            ['What chart type best shows the distribution and outliers of customer order values?', 'A box plot or a histogram.'],
          ],
        },
        {
          title: 'The Pitfalls of Pie Charts and Gauges',
          description: 'Human perception struggles to compare 2D angles and circular areas accurately; pie charts with more than 3 slices distort proportions, hide subtle differences, and force eye movement between legend and slices. Replacing pie charts with ordered bar charts.',
          concepts: [
            'Perceptual limitations of angles versus linear length',
            'Limiting pie charts to three slices maximum',
            'Radial gauge canvas waste and low density',
            'Replacing gauges with compact bullet graphs',
          ],
          quiz: [
            ['Why are bar charts superior to pie charts for comparing 5 categories?', 'The human visual system judges length and position along a common baseline with far greater precision than angles.'],
            ['What visual is a compact, superior replacement for a radial gauge meter?', 'A bullet graph, which displays actual, target, and qualitative bands in a compact bar.'],
          ],
          prereqs: ['Matching the Chart to the Analytical Question'],
        },
        {
          title: 'Dual-Axis Charts and Small Multiples',
          description: 'Dual-axis charts with different units (e.g. revenue in dollars on left, margin percentage on right) frequently mislead viewers into seeing spurious correlations where lines cross; using small multiples or stacked synchronized panels instead.',
          concepts: [
            'Scale distortion in dual-axis line charts',
            'Misleading intersection impressions when lines cross',
            'Small multiples sharing a synchronized time axis',
            'Indexing series to base 100 for comparisons',
          ],
          quiz: [
            ['Why are dual-axis charts considered risky in business reporting?', 'Changing the scale on either axis alters where the lines cross, creating misleading visual impressions.'],
            ['How do small multiples solve the multi-metric time series problem?', 'By giving each metric its own dedicated mini-chart with an independent y-axis, sharing a synchronized time axis.'],
          ],
          prereqs: ['The Pitfalls of Pie Charts and Gauges'],
        },
        {
          title: 'Tables, Sparklines and Heatmaps in Dashboards',
          description: 'Charts communicate patterns and trends; tables communicate exact precision. Embedding sparklines (word-sized trend lines) and color heatmaps directly into tabular rows combines precision text with immediate visual pattern recognition.',
          concepts: [
            'Tabular views for precision numerical data',
            'Sparkline trend micro-charts inside table cells',
            'In-cell data bars and divergent color formatting',
            'Pagination, search, and export hygiene for tables',
          ],
          quiz: [
            ['What is a sparkline?', 'A tiny, condensed trend line embedded directly within a table cell or KPI card without axes or gridlines.'],
            ['How does heatmap cell formatting improve reading large financial tables?', 'Color gradients immediately highlight positive and negative variances without forcing mental math on every number.'],
          ],
          prereqs: ['Dual-Axis Charts and Small Multiples'],
        },
      ],
    },
    {
      title: 'Color Theory and Accessibility',
      description: 'Using color with intention, adhering to accessibility standards, and supporting color blindness.',
      topics: [
        {
          title: 'Semantic Color Usage and the 60-30-10 Rule',
          description: 'Color must carry semantic meaning: Red/Green/Amber for status, blues or slates for neutral data. Applying the 60-30-10 rule: 60% neutral background (white/slate/dark), 30% structural content (cards, muted text), and 10% intentional accent color for data points.',
          concepts: [
            'Semantic color conventions: alert, positive, and warning',
            'The 60-30-10 color balance rule',
            'Restricting palettes to intentional accent hues',
            'Sequential versus diverging versus qualitative palettes',
          ],
          quiz: [
            ['What is the danger of using 7 different vibrant colors for 7 sales regions?', 'It implies distinct semantic meanings (alert, success) when none exist, causing visual confusion.'],
            ['When should a diverging color palette be used?', 'When data has a meaningful midpoint (e.g. zero or 100% budget target), shading into contrasting hues on either side.'],
          ],
        },
        {
          title: 'Designing for Color Blindness (WCAG Compliance)',
          description: 'Roughly 8% of men and 0.5% of women have color vision deficiency, predominantly red-green (deuteranopia and protanopia). Never relying on color alone to convey status: combining color with secondary indicators (icons, + / - signs, or text badges).',
          concepts: [
            'Deuteranopia, protanopia, and tritanopia vision deficiencies',
            'Color-safe palettes replacing red and green pairs',
            'Dual encoding with colors and icons',
            'WCAG contrast ratios for readable typography',
          ],
          quiz: [
            ['What is dual encoding in dashboard status indicators?', 'Using both a color and an icon/text badge (e.g. green circle with checkmark, red square with exclamation) so color-blind users can read it.'],
            ['What color pairing is universally safer for positive/negative variance than standard red/green?', 'Blue for positive and orange for negative.'],
          ],
          prereqs: ['Semantic Color Usage and the 60-30-10 Rule'],
        },
        {
          title: 'Dark Mode and Light Mode BI Themes',
          description: 'Designing dark and light theme variations: dark mode reduces eye fatigue in low-light environments (NOCs, trading floors) but requires desaturated accents and reduced contrast to prevent visual halation around pure white elements.',
          concepts: [
            'Dark mode ergonomics in continuous-monitoring environments',
            'Desaturating accent colors to prevent visual vibrations',
            'Off-white text (#E2E8F0) over pure white (#FFFFFF)',
            'Dynamic theme switching in modern BI tools',
          ],
          quiz: [
            ['Why should pure white text (#FFFFFF) on pure black (#000000) be avoided in dark mode?', 'Excessive contrast creates eye fatigue and visual halation; off-white on dark slate is gentler.'],
            ['In what environment is dark mode strongly preferred by users?', 'Operations centers, control rooms, and trading floors viewed in low ambient lighting.'],
          ],
          prereqs: ['Designing for Color Blindness (WCAG Compliance)'],
        },
      ],
    },
    {
      title: 'KPI Card Anatomy, Layout and Typography',
      description: 'Designing high-impact metric cards, grid structures, and typography.',
      topics: [
        {
          title: 'KPI Card Anatomy and Micro-Interactions',
          description: 'A professional KPI card contains five essential elements: the metric title, the primary current value formatted cleanly, the comparison benchmark (vs Target, vs Prior Year), the delta badge (absolute and % change), and a micro sparkline trend.',
          concepts: [
            'Five core components of executive KPI cards',
            'Formatting numerical units: thousands, millions, and percentages',
            'Delta calculations against targets and prior periods',
            'Contextual benchmarks for meaningful metric evaluation',
          ],
          quiz: [
            ['Why is displaying a raw metric like "Revenue: $4.2M" considered poor dashboard design?', 'Without a baseline (vs target, vs last month, vs prior year), the reader cannot tell whether $4.2M is good, bad, or expected.'],
            ['Where should the percentage variance badge be placed on a KPI card?', 'Adjacent to or beneath the primary metric value in smaller, distinct font with directional indicator.'],
          ],
        },
        {
          title: 'Grid Systems, Card Layouts and Whitespace',
          description: 'Organizing the canvas using an 8px or 12-column grid system. Maintaining consistent margins, padding, and gutter spacing between cards creates professional visual rhythm and separates unrelated sections without harsh visual borders.',
          concepts: [
            '12-column responsive layout structures',
            'The 8-point spatial grid for margins',
            'Card container design with subtle borders',
            'Whitespace usage to prevent visual overcrowding',
          ],
          quiz: [
            ['What visual rhythm problem happens when dashboard elements have inconsistent margins?', 'The dashboard looks messy and disjointed, increasing subconscious cognitive fatigue for the viewer.'],
            ['How does an 8-point grid simplify layout design?', 'All spacing, margins, and component dimensions are multiples of 8px, ensuring uniform alignment.'],
          ],
          prereqs: ['KPI Card Anatomy and Micro-Interactions'],
        },
        {
          title: 'Typography for Dashboards: Tabular Figures and Hierarchy',
          description: 'Choosing legible fonts (Inter, Roboto, Segoe UI) with proportional text hierarchy; utilizing tabular figures (monospaced numbers) so columns of numbers align precisely along decimals without staggering.',
          concepts: [
            'Tabular monospaced figures for aligned columns',
            'Type hierarchy from titles down to subtext',
            'Handling label truncation versus label wrapping',
            'Restricting font families to maintain consistency',
          ],
          quiz: [
            ['Why must numerical dashboard tables use tabular figures (monospaced numbers)?', 'So decimal points and digits align vertically in straight columns, allowing immediate visual magnitude scanning.'],
            ['What font size should secondary context labels have relative to the main metric value?', 'Approximately 1/3 to 1/2 of the primary metric size (e.g. 12px subtext under a 32px number).'],
          ],
          prereqs: ['Grid Systems, Card Layouts and Whitespace'],
        },
      ],
    },
    {
      title: 'Interactivity, UX and Navigation',
      description: 'Designing intuitive filter panels, drill-through flows, and tooltip micro-charts.',
      topics: [
        {
          title: 'Filter and Slicer UX: Placement, Hierarchy and Resets',
          description: 'Placing global filters consistently (top bar or collapsible left panel), differentiating global filters that affect the whole page from local chart slicers, and providing an explicit "Clear All Filters" button so users never get lost in filtered states.',
          concepts: [
            'Top horizontal filter bars versus side panels',
            'Global filters versus local chart slicers',
            'Default selections for current operating periods',
            'Reset buttons to restore baseline views',
          ],
          quiz: [
            ['What user experience problem occurs when slicers are scattered randomly across the canvas?', 'Users cannot track which filters are active and cannot diagnose why numbers changed.'],
            ['Why should a dashboard default to a specific time period on first load?', 'Loading all historical data simultaneously slows initial render and provides zero immediate focus.'],
          ],
        },
        {
          title: 'Cross-Filtering vs Cross-Highlighting',
          description: 'In Power BI and Tableau, clicking a chart element either filters all other visuals to that subset (cross-filtering) or dims non-matching data while keeping the full context visible (cross-highlighting); knowing when each interaction pattern is appropriate.',
          concepts: [
            'Cross-filtering: removing non-selected data from visuals',
            'Cross-highlighting: dimming non-selected data for context',
            'Configuring visual interactions in Power BI settings',
            'Preventing accidental cross-filtering confusion on pages',
          ],
          quiz: [
            ['What is the advantage of cross-highlighting over cross-filtering?', 'It retains the overall context so the user sees both the selected segment and the total population simultaneously.'],
            ['When should visual interaction between two charts be disabled?', 'When one chart represents an independent benchmark or target that should not be sliced by the other.'],
          ],
          prereqs: ['Filter and Slicer UX: Placement, Hierarchy and Resets'],
        },
        {
          title: 'Tooltips as Micro-Dashboards and Drill-Through',
          description: 'Replacing standard text tooltips with customized report-page tooltips: hovering over a bar shows a mini line-chart trend or customer breakdown without leaving the screen. Setting up drill-through target pages with pre-filtered context.',
          concepts: [
            'Custom report-page tooltips for hover details',
            'Contextual detail without adding canvas clutter',
            'Drill-through target page setup and breadcrumbs',
            'Back navigation buttons to return to summaries',
          ],
          quiz: [
            ['What is a "viz-in-tooltip"?', 'A miniature chart embedded inside the hover tooltip that renders dynamic context for the hovered data point.'],
            ['How does drill-through improve dashboard performance?', 'It defers loading granular row-level data until the user explicitly requests it for a specific entity.'],
          ],
          prereqs: ['Cross-Filtering vs Cross-Highlighting'],
        },
        {
          title: 'Bookmarks, Selection Panes and Modal Overlays',
          description: 'Using bookmarks and button actions to toggle between alternative chart perspectives (e.g. switching between Bar View and Table View), opening collapsible filter drawers, and creating pop-up help dialogs explaining metric definitions without cluttering the screen.',
          concepts: [
            'Bookmarks for state saving and view toggling',
            'Selection pane visibility management for elements',
            'Collapsible filter and navigation flyout drawers',
            'Metric definition popout modals and cards',
          ],
          quiz: [
            ['How do bookmarks enable view switching (e.g. Chart vs Table) on one page?', 'One bookmark shows the chart and hides the table, while the other inverts visibility on button click.'],
            ['Why are collapsible filter panels advantageous on complex dashboards?', 'They preserve full canvas width for charts until the user explicitly clicks to adjust filters.'],
          ],
          prereqs: ['Tooltips as Micro-Dashboards and Drill-Through'],
        },
      ],
    },
    {
      title: 'Storytelling, Performance and Metric Governance',
      description: 'Communicating insights to stakeholders, optimizing query performance, and maintaining data contracts.',
      topics: [
        {
          title: 'Data Storytelling and Executive Commentary',
          description: 'Dashboards show what happened; storytelling explains why it happened and what actions to take. Integrating narrative callouts, automated dynamic text summaries ("Revenue grew +12% driven by enterprise renewals in EMEA"), and contextual event annotations.',
          concepts: [
            'Transitioning from descriptive metrics to prescriptive actions',
            'Annotating spikes and anomalies with business milestones',
            'Dynamic text summaries using DAX and expressions',
            'Structuring executive presentation walkthroughs',
          ],
          quiz: [
            ['Why are event annotations on time-series charts valuable?', 'They explain anomalies (e.g. system outage, marketing blast) immediately, preventing redundant questions.'],
            ['What distinguishes a mature dashboard from a basic data dump?', 'Contextual annotations and clear links between metrics and strategic business decisions.'],
          ],
        },
        {
          title: 'Dashboard Performance Tuning: Reducing Visuals and Queries',
          description: 'A dashboard with 30 visuals generates 30 separate DAX/SQL queries on every filter click, causing multi-second lag. Optimizing performance by capping visuals per page (<10–12), aggregating measures, and using Performance Analyzer in Power BI to spot bottlenecks.',
          concepts: [
            'Visual query parallelism and rendering latency limits',
            'Performance Analyzer diagnostics for DAX and rendering',
            'Consolidating single cards into multi-row cards',
            'Pre-aggregating summary tables in the data warehouse',
          ],
          quiz: [
            ['What is the recommended maximum number of visuals on a single dashboard page for fast response?', 'Under 10 to 12 visuals.'],
            ['What does the Power BI Performance Analyzer measure for each visual?', 'DAX query time, Visual display rendering time, and queue wait times.'],
          ],
          prereqs: ['Data Storytelling and Executive Commentary'],
        },
        {
          title: 'Dashboard QA, Data Dictionaries and Metric Governance',
          description: 'Before publishing, validating numbers against production SQL queries, establishing clear data dictionary tooltips for acronyms (e.g. ARR, LTV, CAC), verifying row-level security (RLS), and instituting a feedback review loop with business champions.',
          concepts: [
            'Cross-checking dashboard metrics against SQL sources',
            'Embedded data dictionary tooltips for acronyms',
            'Row-Level Security testing for multi-tenant data',
            'Deprecating abandoned reports and quarterly reviews',
          ],
          quiz: [
            ['Why should every metric have an accessible definition tooltip on the dashboard?', 'Different departments frequently define metrics differently (e.g. "Active User"); explicit definitions eliminate disputes.'],
            ['What is the final acceptance check before rolling out a dashboard to executives?', 'Every single summary total is verified against an independent SQL query on the core source database.'],
          ],
          prereqs: ['Dashboard Performance Tuning: Reducing Visuals and Queries'],
        },
        {
          title: 'User Feedback Loops and Adoption Analytics',
          description: 'Monitoring dashboard usage in Power BI or Tableau Server metrics: tracking weekly active viewers, identifying abandoned pages, conducting structured 15-minute usability interviews with business champions, and implementing a change-request backlog.',
          concepts: [
            'Tracking report view counts and user frequency',
            'Conducting stakeholder usability observation sessions',
            'Managing feature request backlogs for dashboards',
            'Decommissioning redundant and outdated report versions',
          ],
          quiz: [
            ['Why should BI teams track dashboard view frequency in server metrics?', 'To identify unused reports that can be sunsetted and focus engineering effort on high-impact executive dashboards.'],
            ['What is the best way to uncover usability issues in a new dashboard?', 'Observe a business user attempting to answer three specific business questions without coaching.'],
          ],
          prereqs: ['Dashboard QA, Data Dictionaries and Metric Governance'],
        },
      ],
    },
  ],
})
