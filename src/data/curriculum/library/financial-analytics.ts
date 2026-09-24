import { defineTrack } from '../define'

export const financialAnalytics = defineTrack({
  id: 'track-financial-analytics',
  title: 'Financial Analytics Fundamentals',
  description: 'The finance an analyst needs to be useful to a CFO: reading the three statements, revenue recognition, cost structures and margins, budgets, forecasts and variance analysis, cohort revenue and SaaS finance metrics, pricing, break-even and sensitivity, spreadsheet financial models, NPV and IRR, and finance dashboards that survive month-end.',
  family: 'Data Analytics & BI',
  kind: 'domain',
  icon: '💹',
  tags: ['financial analysis', 'fp&a', 'forecasting', 'variance analysis', 'saas metrics', 'npv', 'financial modelling', 'margins', 'budgeting'],
  languages: ['SQL'],
  explainMode: 'tool',
  code: { label: 'SQL or spreadsheet formulas, whichever fits', id: 'sql', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Reading Financial Statements',
      description: 'The three statements, what each answers, and how they fit together.',
      topics: [
        {
          title: 'The income statement',
          description: 'The P&L shows revenue, cost of sales, gross profit, operating expenses, operating profit, interest, tax and net income for a period. Reading it top to bottom with margins at each level reveals where money is made and lost, which is the first thing an analyst is asked.',
          concepts: ['Revenue to net income structure', 'Gross, operating and net margin', 'Operating expense categories', 'EBITDA and its uses'],
          quiz: [
            ['Revenue $2M, COGS $800k, opex $900k. Gross and operating profit?', 'Gross profit $1.2M (60%), operating profit $300k (15%).'],
            ['What does EBITDA remove from net income?', 'Interest, tax, depreciation and amortisation, to approximate operating cash generation.'],
          ],
        },
        {
          title: 'The balance sheet',
          description: 'A snapshot of what the company owns (assets), owes (liabilities) and what is left for owners (equity), always balancing. Analysts use it for cash, receivables, deferred revenue and debt, and to compute working capital and liquidity ratios.',
          concepts: ['Assets = liabilities + equity', 'Current versus non-current items', 'Deferred revenue as a liability', 'Working capital and liquidity ratios'],
          quiz: [
            ['Why is deferred revenue a liability?', 'The company has taken cash but still owes the service; it is an obligation until delivered.'],
            ['Current assets $500k, current liabilities $400k. Current ratio?', '1.25.'],
          ],
        },
        {
          title: 'The cash flow statement',
          description: 'Cash from operations, investing and financing explains how cash moved when profit did not: profitable companies run out of cash through receivables and inventory, and loss-making ones survive on funding. Free cash flow is the number investors watch.',
          concepts: ['Operating, investing and financing sections', 'Reconciling net income to operating cash', 'Free cash flow', 'Profit versus cash timing'],
          quiz: [
            ['Net income is positive but operating cash flow is negative. Why?', 'Working capital absorbed cash: receivables or inventory grew, or payables shrank.'],
            ['How is free cash flow computed?', 'Operating cash flow minus capital expenditure.'],
          ],
          prereqs: ['The income statement'],
        },
        {
          title: 'How the three statements connect',
          description: 'Net income flows into equity via retained earnings and starts the cash flow statement; cash on the cash flow statement ends up on the balance sheet; depreciation reduces assets and profit. Knowing the links is what lets a model or a sanity check hang together.',
          concepts: ['Net income to retained earnings', 'Cash flow to balance sheet cash', 'Depreciation across the statements', 'Tracing one transaction through all three'],
          quiz: [
            ['A customer pays $12k up front for a year. What happens on each statement?', 'Cash up $12k (cash flow and balance sheet), deferred revenue up $12k, and $1k of revenue recognised per month on the P&L.'],
            ['Where does closing cash from the cash flow statement appear?', 'As cash on the balance sheet at period end.'],
          ],
          prereqs: ['The balance sheet', 'The cash flow statement'],
        },
      ],
    },
    {
      title: 'Revenue and Cost Fundamentals',
      description: 'When revenue counts, what costs are, and the margins built from them.',
      topics: [
        {
          title: 'Revenue recognition for analysts',
          description: 'Under accrual accounting revenue is recognised when the obligation is delivered, not when cash arrives: annual subscriptions are spread over twelve months, usage is recognised as consumed, and bookings are not revenue. Analysts must know this or their revenue queries will disagree with finance.',
          concepts: ['Accrual versus cash basis', 'Bookings, billings and revenue', 'Spreading subscriptions over the term', 'Deferred revenue roll-forward'],
          quiz: [
            ['A $24k two-year contract is signed and paid in January. January revenue?', '$1,000; the rest sits in deferred revenue.'],
            ['Which is larger in a growing subscription business, billings or revenue?', 'Billings, because they lead recognised revenue.'],
          ],
          prereqs: ['How the three statements connect'],
        },
        {
          title: 'Cost structures: fixed, variable and step costs',
          description: 'Fixed costs (rent, salaries) stay flat with volume, variable costs (materials, payment fees) scale with it, and step costs jump at thresholds (a new warehouse). Classifying costs correctly is the basis of margins, break-even and any forecast that involves growth.',
          concepts: ['Fixed versus variable classification', 'Step costs and capacity', 'Semi-variable costs', 'Operating leverage'],
          quiz: [
            ['Why does profit grow faster than revenue in a high-fixed-cost business?', 'Operating leverage: fixed costs are already covered, so each extra sale adds most of its margin to profit.'],
            ['Is customer support a fixed or variable cost?', 'Step or semi-variable: headcount grows in jumps as ticket volume rises.'],
          ],
        },
        {
          title: 'Gross, contribution and operating margin',
          description: 'Gross margin removes cost of sales, contribution margin removes all variable costs, operating margin removes fixed operating costs too. Each answers a different question (is the product viable, does each unit pay, is the company profitable) and they are compared across periods and peers.',
          concepts: ['What goes into cost of sales', 'Contribution margin per unit and in total', 'Operating margin and overhead', 'Margin benchmarks by business model'],
          quiz: [
            ['What gross margin is typical for software versus retail?', 'Software 70-85%, retail 25-45%.'],
            ['Contribution margin is positive but operating margin negative. Meaning?', 'Each sale pays, but not enough volume yet to cover fixed costs.'],
          ],
          prereqs: ['Cost structures: fixed, variable and step costs'],
        },
        {
          title: 'COGS versus opex and cost allocation',
          description: 'Whether hosting, support or payment fees sit in cost of sales or operating expenses changes gross margin by many points, and allocating shared costs to products or regions needs a documented driver. Analysts building product P&Ls live in these decisions.',
          concepts: ['COGS boundary decisions', 'Allocation drivers for shared costs', 'Product and segment P&Ls', 'Consistency across periods'],
          quiz: [
            ['Where do cloud hosting costs for a SaaS product belong?', 'In cost of sales, since they are incurred to deliver the service.'],
            ['What is an allocation driver?', 'A measurable basis (headcount, revenue share, usage) used to split a shared cost across units.'],
          ],
          prereqs: ['Gross, contribution and operating margin'],
        },
      ],
    },
    {
      title: 'Budgeting and Forecasting',
      description: 'Planning the numbers, and updating the plan as reality arrives.',
      topics: [
        {
          title: 'Annual budgets and rolling forecasts',
          description: 'The annual budget fixes targets and spending authority for the year; a rolling forecast re-projects the next 12 to 18 months each quarter as actuals land. Analysts maintain both, so the budget stays the yardstick while the forecast stays the best estimate.',
          concepts: ['Budget as target and authority', 'Rolling forecast mechanics', 'Budget versus forecast versus actual', 'Reforecast cadence'],
          quiz: [
            ['What is the difference between budget and forecast?', 'The budget is the fixed plan set before the year; the forecast is the current best estimate updated through the year.'],
            ['Why not just update the budget?', 'Targets lose meaning if they move; the forecast tracks reality while the budget measures performance.'],
          ],
        },
        {
          title: 'Driver-based forecasting',
          description: 'Instead of growing last year by a percentage, a driver-based forecast builds revenue from operational drivers (leads x conversion x price, or customers x ARPU) and costs from headcount plans and unit costs. It is testable, explainable and links the plan to what teams actually control.',
          concepts: ['Choosing forecast drivers', 'Revenue from volume x rate', 'Costs from headcount and unit costs', 'Validating drivers against history'],
          quiz: [
            ['Give a driver-based formula for subscription revenue.', 'Opening customers + new - churned, times ARPU, month by month.'],
            ['Why is a driver-based forecast easier to defend?', 'Each assumption is a number a team owns and can be checked against actuals.'],
          ],
          prereqs: ['Annual budgets and rolling forecasts'],
        },
        {
          title: 'Top-down versus bottom-up forecasts',
          description: 'Top-down starts from the market or a growth target and allocates down; bottom-up sums team plans and pipelines. Bottom-up is more grounded but optimistic on execution; top-down is faster but ignores capacity. Reconciling the two exposes the gap leadership must close.',
          concepts: ['Top-down allocation', 'Bottom-up aggregation', 'Reconciling the gap', 'Sandbagging and optimism biases'],
          quiz: [
            ['Bottom-up sums to $10M, top-down target is $12M. What do you report?', 'Both, with the $2M gap and what initiatives or assumptions would close it.'],
            ['Which method tends to sandbag?', 'Bottom-up from sales teams, who protect their targets.'],
          ],
          prereqs: ['Driver-based forecasting'],
        },
        {
          title: 'Scenario planning',
          description: 'Base, upside and downside scenarios change a few key drivers together (growth, churn, hiring) to show the range of outcomes and cash needs. Scenarios are built by switching driver sets in the same model, not by copying the workbook three times.',
          concepts: ['Base, upside and downside cases', 'Driver sets per scenario', 'Scenario switch in one model', 'Cash runway under each case'],
          quiz: [
            ['What must be the same across scenarios?', 'The model logic; only the input drivers change.'],
            ['Why include a downside case?', 'To know how long cash lasts and which costs to cut if growth stalls.'],
          ],
          prereqs: ['Driver-based forecasting'],
        },
      ],
    },
    {
      title: 'Variance Analysis',
      description: 'Explaining why actuals differed from the plan.',
      topics: [
        {
          title: 'Budget versus actual variance',
          description: 'Variance is actual minus budget, favourable or adverse, in absolute and percentage terms by line. The analyst\'s job is to flag material variances, separate timing from permanent differences, and trace each to its cause so the review discusses the few that matter.',
          concepts: ['Favourable and adverse sign conventions', 'Materiality thresholds', 'Timing versus permanent variances', 'Variance by line and by owner'],
          quiz: [
            ['Marketing spend is $50k under budget. Favourable?', 'On cost yes, but check whether it is a timing delay or under-investment that will hurt revenue.'],
            ['What is a materiality threshold?', 'The size (say 5% or $25k) above which a variance is investigated and explained.'],
          ],
        },
        {
          title: 'Price, volume and mix variance',
          description: 'A revenue variance splits into volume (sold more units), price (charged more per unit) and mix (sold more of the expensive products). The decomposition follows a fixed order and reconciles to the total, turning "revenue missed by 8%" into levers the business recognises.',
          concepts: ['Volume variance at budget price', 'Price variance at actual volume', 'Mix effect from product shares', 'Reconciling to total variance'],
          quiz: [
            ['Budget 1,000 units at $10; actual 1,100 at $9.50. Volume and price variance?', 'Volume +$1,000 (100 x $10), price -$550 (1,100 x -$0.50), total +$450.'],
            ['Why does order matter in the decomposition?', 'The interaction of price and volume changes must be assigned to one factor; fix the convention.'],
          ],
          prereqs: ['Budget versus actual variance'],
        },
        {
          title: 'Writing variance commentary',
          description: 'Commentary explains material variances in a sentence each: the line, the amount, the cause, whether it persists, and the action. Finance readers want the cause and the outlook, not a restatement of the numbers already in the table.',
          concepts: ['One sentence per material variance', 'Cause, persistence and action', 'Full-year impact statements', 'Avoiding restating the table'],
          quiz: [
            ['Write commentary for revenue $120k adverse due to a delayed launch.', 'Revenue $120k (6%) below budget as the Q2 product launch slipped to July; timing only, full-year forecast unchanged.'],
            ['What is missing from "opex was over budget by $30k"?', 'The cause, whether it continues, and what will be done.'],
          ],
          prereqs: ['Price, volume and mix variance'],
        },
      ],
    },
    {
      title: 'Cohort Revenue and SaaS Metrics',
      description: 'The revenue metrics of subscription businesses, computed from cohorts.',
      topics: [
        {
          title: 'Cohort-based revenue analysis',
          description: 'Grouping customers by start month and tracking their revenue over time separates the health of old and new cohorts from the blended total. A revenue cohort table shows expansion, decay and payback per cohort and is the basis of NRR and LTV.',
          concepts: ['Revenue cohort tables', 'Cohort revenue curves', 'Layer-cake revenue charts', 'Reading cohort quality over time'],
          quiz: [
            ['What does a layer-cake chart show?', 'Revenue stacked by cohort over time, so you see whether old cohorts hold and new ones add on top.'],
            ['Why analyse revenue by cohort rather than total?', 'Total growth can hide that recent cohorts decay faster than earlier ones.'],
          ],
        },
        {
          title: 'MRR movements and the MRR bridge',
          description: 'Ending MRR equals opening MRR plus new, expansion and reactivation, minus contraction and churn. The bridge shows whether growth comes from new logos or the base and must reconcile to the cent; it is the first table a SaaS finance team wants each month.',
          concepts: ['Classifying customer-month movements', 'Bridge reconciliation', 'New versus base-driven growth', 'MRR bridge in SQL'],
          quiz: [
            ['Opening 500k, new 40k, expansion 15k, contraction 5k, churn 20k. Ending MRR?', '530k.'],
            ['How do you classify a customer who upgrades in the same month they churned last month?', 'Reactivation, not expansion; their prior month MRR was zero.'],
          ],
          prereqs: ['Cohort-based revenue analysis'],
        },
        {
          title: 'Net and gross revenue retention',
          description: 'Gross revenue retention is the share of a cohort\'s starting revenue kept after churn and contraction; net revenue retention adds expansion. NRR above 100% means the base grows without new sales, and finance teams compute both on trailing-12-month cohorts.',
          concepts: ['GRR formula and cap', 'NRR formula and expansion', 'Trailing-12-month cohort method', 'Benchmarks for NRR'],
          quiz: [
            ['Cohort started at $200k; a year later $170k remains plus $50k expansion. GRR and NRR?', 'GRR 85%, NRR 110%.'],
            ['What NRR do strong B2B SaaS companies report?', 'Typically 110-130%.'],
          ],
          prereqs: ['MRR movements and the MRR bridge'],
        },
        {
          title: 'SaaS efficiency metrics',
          description: 'The magic number (net new ARR over prior-quarter sales and marketing spend), rule of 40 (growth rate plus profit margin), burn multiple (net burn over net new ARR) and CAC payback summarise how efficiently a SaaS company turns spend into recurring revenue.',
          concepts: ['Magic number', 'Rule of 40', 'Burn multiple', 'CAC payback from the P&L'],
          quiz: [
            ['Net new ARR $2M this quarter, S&M spend last quarter $2.5M. Magic number?', '0.8.'],
            ['Growth 25%, operating margin 10%. Rule of 40?', '35, below the 40 benchmark.'],
          ],
          prereqs: ['Net and gross revenue retention'],
        },
        {
          title: 'Bookings, billings and deferred revenue',
          description: 'Bookings are contracts signed, billings are invoices issued, revenue is recognised delivery, and deferred revenue is billed-not-yet-recognised. Tracking all four with a roll-forward stops a great bookings quarter being mistaken for revenue or cash.',
          concepts: ['Bookings versus billings versus revenue', 'Deferred revenue roll-forward table', 'Remaining performance obligations', 'Cash timing from billing terms'],
          quiz: [
            ['Billings $1.2M, revenue $1.0M this quarter. What happened to deferred revenue?', 'It grew by $200k.'],
            ['What does a shift from annual to monthly billing do to cash?', 'Cash arrives later; deferred revenue and up-front cash fall even if revenue is unchanged.'],
          ],
          prereqs: ['Revenue recognition for analysts'],
        },
      ],
    },
    {
      title: 'Pricing and Profitability',
      description: 'Whether prices, discounts and volumes add up to profit.',
      topics: [
        {
          title: 'Price elasticity basics',
          description: 'Elasticity is the percentage change in quantity for a percentage change in price; below -1 in magnitude a price rise increases revenue, above it revenue falls. Analysts estimate it from past price changes, tests or regional differences, with care for what else changed at the time.',
          concepts: ['Elasticity formula and interpretation', 'Elastic versus inelastic demand', 'Estimating from price changes and tests', 'Confounders in historical estimates'],
          quiz: [
            ['Price rose 10% and volume fell 4%. Elasticity and revenue effect?', 'Elasticity -0.4 (inelastic); revenue rose about 5.6%.'],
            ['Why is a historical elasticity estimate risky?', 'Price changes coincide with promotions, seasons or competitor moves that also shift demand.'],
          ],
        },
        {
          title: 'Discounting and price realisation',
          description: 'List price minus discounts, rebates and free periods gives realised price; the price waterfall shows where margin leaks between list and pocket. Discount analysis by rep, segment and deal size reveals whether discounts buy volume or just cost margin.',
          concepts: ['Price waterfall from list to pocket', 'Discount rate by segment and rep', 'Discount versus volume relationship', 'Discount governance'],
          quiz: [
            ['List $100, average discount 18%, plus 2% rebates. Pocket price?', 'About $80.'],
            ['What does a wide discount spread for similar deals suggest?', 'Discounts depend on negotiation, not value; pricing rules are missing.'],
          ],
          prereqs: ['Price elasticity basics'],
        },
        {
          title: 'Break-even analysis',
          description: 'Break-even volume is fixed costs divided by contribution margin per unit; break-even revenue divides by the contribution margin ratio. It answers how many units, customers or months are needed to cover costs, and the margin of safety says how far sales can fall first.',
          concepts: ['Break-even units and revenue', 'Contribution margin ratio', 'Margin of safety', 'Break-even under price changes'],
          quiz: [
            ['Fixed costs $300k, price $50, variable cost $20. Break-even units?', '10,000 units.'],
            ['What is the margin of safety?', 'How far current sales are above break-even, in units or percent.'],
          ],
          prereqs: ['Gross, contribution and operating margin'],
        },
        {
          title: 'Sensitivity and what-if analysis',
          description: 'Sensitivity analysis varies one input at a time to see which assumptions the result depends on most; data tables and tornado charts show it. It tells decision makers which numbers to scrutinise and shows where a forecast is fragile.',
          concepts: ['One-way sensitivity tables', 'Two-way data tables', 'Tornado charts of assumption impact', 'Identifying fragile assumptions'],
          quiz: [
            ['What does a two-way data table show?', 'The output for every combination of two inputs, such as price and churn.'],
            ['How is a tornado chart read?', 'Bars sorted by the swing each assumption causes; the widest bar is the assumption to test first.'],
          ],
          prereqs: ['Break-even analysis'],
        },
      ],
    },
    {
      title: 'Financial Modelling in Spreadsheets',
      description: 'Building models that others can audit and reuse.',
      topics: [
        {
          title: 'Model structure: inputs, calculations, outputs',
          description: 'A well-built model separates inputs (blue, on one sheet), calculations (formulas only, no hard-coded numbers) and outputs (summaries and charts), flowing in one direction. The structure is what makes a model auditable and lets anyone change an assumption safely.',
          concepts: ['Separate input, calc and output sheets', 'Colour coding and no hard-codes in formulas', 'One-direction flow', 'Consistent time axis across sheets'],
          quiz: [
            ['Why forbid numbers typed inside formulas?', 'They are invisible assumptions nobody can find or change.'],
            ['What colour convention do models use?', 'Blue for inputs, black for formulas, green for links to other sheets.'],
          ],
        },
        {
          title: 'Building a three-statement model',
          description: 'Revenue and cost drivers produce the P&L; working capital assumptions and capex produce the cash flow; both roll into the balance sheet, which must balance. Building one from scratch teaches the links and produces the model most finance teams start from.',
          concepts: ['Driver sheet to P&L', 'Working capital and capex schedules', 'Cash flow and balance sheet roll-forward', 'Balance check and circularity'],
          quiz: [
            ['What is the balance check?', 'Assets minus liabilities minus equity must equal zero in every period.'],
            ['Why can a model become circular?', 'Interest depends on cash, which depends on interest; break it with an average balance or a switch.'],
          ],
          prereqs: ['Model structure: inputs, calculations, outputs', 'How the three statements connect'],
        },
        {
          title: 'Modelling standards and error checks',
          description: 'Check rows (totals reconcile, balance sheet balances, no negative cash without a flag), consistent formulas across a row, named ranges for key inputs, and a version log catch the errors that make models wrong for months without anyone noticing.',
          concepts: ['Check rows and an error dashboard', 'Consistent formulas across columns', 'Named ranges and structured references', 'Version log and change control'],
          quiz: [
            ['What is the fastest way to find an inconsistent formula in a row?', 'Select the row and use the inconsistent-formula check or trace; the formula should be identical across columns.'],
            ['What goes on an error dashboard?', 'Every check row rolled up into one cell that shows OK or the count of failing checks.'],
          ],
          prereqs: ['Building a three-statement model'],
        },
        {
          title: 'Documenting assumptions',
          description: 'Every input carries its source, date and owner, and the model has a cover sheet stating purpose, structure and known limits. Documented assumptions turn the model from one analyst\'s spreadsheet into a shared artefact the business can challenge.',
          concepts: ['Source and date per assumption', 'Cover sheet and structure map', 'Known limitations list', 'Handover and reuse'],
          quiz: [
            ['What is the minimum documentation for an input?', 'Where the number came from, when, and who owns updating it.'],
            ['Why list known limitations?', 'So readers do not use the model for decisions it was not built to support.'],
          ],
          prereqs: ['Model structure: inputs, calculations, outputs'],
        },
      ],
    },
    {
      title: 'Time Value of Money',
      description: 'Comparing money across time so investments can be ranked.',
      topics: [
        {
          title: 'Present value and discounting',
          description: 'A dollar next year is worth less than a dollar today because of risk and opportunity cost; discounting at a rate converts future cash flows into today\'s value. The discount rate is the company\'s required return, and small changes in it move long-dated values a lot.',
          concepts: ['Discount factor formula', 'Choosing the discount rate', 'Present value of a cash flow stream', 'Sensitivity to rate and horizon'],
          quiz: [
            ['PV of $1,000 in two years at 10%?', '$826.45.'],
            ['What is the discount rate meant to represent?', 'The return investors require for the risk, often the weighted average cost of capital.'],
          ],
        },
        {
          title: 'NPV and IRR',
          description: 'Net present value sums discounted cash flows minus the initial outlay; positive means the project earns more than the required return. IRR is the rate at which NPV is zero. NPV ranks projects correctly; IRR misleads with unusual cash flow patterns or different scales.',
          concepts: ['NPV computation and rule', 'IRR and its interpretation', 'NPV versus IRR conflicts', 'Spreadsheet NPV and XNPV pitfalls'],
          quiz: [
            ['Outlay $10k, inflows $6k a year for two years, rate 10%. NPV?', 'About $413: 5,454.5 + 4,958.7 - 10,000.'],
            ['What is the classic mistake with the spreadsheet NPV function?', 'Including the initial outlay inside it; NPV() discounts every argument by one period.'],
          ],
          prereqs: ['Present value and discounting'],
        },
        {
          title: 'Payback and comparing investments',
          description: 'Payback period is the time until cumulative cash inflows cover the outlay; simple, cash-focused, but it ignores later flows and time value. Real comparisons combine NPV, payback and risk, and show the decision under a range of discount rates.',
          concepts: ['Simple and discounted payback', 'Ranking projects on NPV and payback', 'Capital rationing with profitability index', 'Presenting an investment case'],
          quiz: [
            ['Outlay $50k, inflows $20k a year. Simple payback?', '2.5 years.'],
            ['Why prefer NPV to payback for ranking?', 'Payback ignores everything after the payback date and the time value of money.'],
          ],
          prereqs: ['NPV and IRR'],
        },
      ],
    },
    {
      title: 'Financial Dashboards and Reporting',
      description: 'The recurring reporting finance teams depend on.',
      topics: [
        {
          title: 'Designing a finance dashboard',
          description: 'A finance dashboard leads with revenue, gross margin, operating profit and cash against budget and prior year, then drills into lines by department. It uses the ledger\'s chart of accounts as its hierarchy and shows actual, budget, variance and forecast on every line.',
          concepts: ['Headline P&L and cash tiles', 'Actual, budget, variance, forecast columns', 'Chart-of-accounts hierarchy', 'Department drill-downs'],
          quiz: [
            ['What four columns belong on each P&L line?', 'Actual, budget, variance and full-year forecast.'],
            ['Why base the dashboard on the chart of accounts?', 'It matches the ledger, so every number ties to what finance reports.'],
          ],
        },
        {
          title: 'Month-end close reporting',
          description: 'Month-end close locks the ledger after accruals and adjustments; reports run on the closed period, not on live data. Analysts automate the extract, reconcile totals to the ledger, and version each month\'s pack so restated numbers are traceable.',
          concepts: ['Close calendar and locked periods', 'Reconciling reports to the ledger', 'Automating the monthly extract', 'Restatements and versioning'],
          quiz: [
            ['Why must dashboards use the closed period rather than live ledger data?', 'Accruals and adjustments during close change the numbers; live data would show figures finance has not signed off.'],
            ['What is the reconciliation check for a revenue report?', 'Report total equals the ledger revenue account total for the period.'],
          ],
          prereqs: ['Designing a finance dashboard'],
        },
        {
          title: 'Working capital metrics',
          description: 'Days sales outstanding, days payable outstanding and days inventory outstanding measure how long cash is tied up in receivables, owed to suppliers and held in stock; the cash conversion cycle combines them. They explain why profit and cash diverge and are standard dashboard tiles.',
          concepts: ['DSO, DPO and DIO formulas', 'Cash conversion cycle', 'Ageing receivables analysis', 'Working capital improvement levers'],
          quiz: [
            ['DSO 45, DIO 30, DPO 40. Cash conversion cycle?', '35 days.'],
            ['Receivables ageing shows 20% over 90 days. What does it signal?', 'Collection problems or disputed invoices; expect bad-debt provisions and cash strain.'],
          ],
          prereqs: ['The balance sheet'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Finance deliverables built end to end, then the questions interviews ask about them.',
      topics: [
        {
          title: 'Project: three-statement model for a subscription business',
          description: 'Build a monthly three-statement model in a spreadsheet from drivers (customers, churn, ARPU, headcount, hosting cost per customer, billing terms): P&L, cash flow, balance sheet with deferred revenue, a balance check, an error dashboard and base, upside and downside scenarios.',
          concepts: ['Lay out inputs and driver sheet', 'Build P&L from drivers', 'Add deferred revenue and cash flow', 'Balance, check and add scenarios'],
          quiz: [
            ['Where does the deferred revenue balance come from in the model?', 'Opening balance plus billings minus recognised revenue each month.'],
            ['What proves the model is internally consistent?', 'The balance check is zero and the cash on the balance sheet equals the cash flow closing balance every month.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: budget versus actual variance pack',
          description: 'From a general ledger export and a budget file, build a monthly pack: P&L by department with actual, budget, variance and YTD, price-volume-mix decomposition for revenue, material variances flagged by threshold, and commentary for each in the required format.',
          concepts: ['Join ledger actuals to the budget', 'Compute variances and YTD', 'Decompose revenue into price, volume and mix', 'Flag and write up material variances'],
          quiz: [
            ['How do you match ledger accounts to budget lines?', 'A mapping table from account code to budget line, maintained as the single source.'],
            ['What do you do with a large timing variance?', 'Flag it as timing, state when it reverses, and leave the full-year forecast unchanged.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: SaaS metrics from a subscriptions table',
          description: 'In SQL, compute monthly MRR, the MRR bridge, GRR and NRR on trailing-12-month cohorts, a revenue cohort table and layer-cake chart, CAC payback by channel from a spend table, and reconcile the bridge to invoiced revenue with an explanation of every difference.',
          concepts: ['Normalise subscriptions to monthly MRR', 'Build the bridge and retention metrics', 'Produce cohort tables and charts', 'Reconcile to invoiced revenue'],
          quiz: [
            ['Why will MRR not equal recognised revenue?', 'MRR is a normalised run rate; revenue includes proration, usage, one-off fees and timing.'],
            ['Which cohort method do you use for NRR?', 'Customers active 12 months ago compared with their MRR today.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: pricing and break-even analysis',
          description: 'For a product with three price tiers, analyse discount realisation by segment, estimate elasticity from two past price changes with confounders noted, model break-even volume for a proposed new tier, and produce a sensitivity table of profit against price and churn with a recommendation.',
          concepts: ['Build the price waterfall by segment', 'Estimate elasticity from past changes', 'Model break-even for the new tier', 'Run sensitivity and recommend'],
          quiz: [
            ['What must accompany the elasticity estimate?', 'What else changed during each price change and how confident the estimate is.'],
            ['What does the sensitivity table show the decision maker?', 'Which combinations of price and churn keep the new tier profitable.'],
          ],
          style: 'project',
        },
        {
          title: 'Financial analytics interview questions',
          description: 'The expected fluency: walk through the three statements, where a $10 depreciation charge appears, deferred revenue, gross versus contribution margin, NPV versus IRR, the spreadsheet NPV pitfall, MRR versus revenue, NRR and GRR, and DSO.',
          concepts: ['Three-statement walk-through questions', 'Margin and cost questions', 'NPV and IRR questions', 'SaaS finance definitions'],
          quiz: [
            ['Walk through a $10 depreciation increase across the statements.', 'P&L: operating profit down $10, net income down $8 at 20% tax. Cash flow: net income -8, add back 10, cash +2. Balance sheet: PP&E -10, cash +2, equity -8.'],
            ['Why can a growing company be profitable and short of cash?', 'Receivables and inventory grow ahead of collections; cash is tied up in working capital.'],
          ],
          style: 'reading',
        },
        {
          title: 'Finance case questions',
          description: 'Cases such as "margin fell three points, why?", "should we invest $1M in this project?", or "the sales team wants to cut prices 15%". Structure: clarify, decompose (price, volume, mix, cost), model the decision with NPV or break-even, present with assumptions and sensitivities.',
          concepts: ['Decomposing a margin change', 'Framing an investment decision', 'Modelling a price cut with elasticity', 'Presenting with assumptions and ranges'],
          quiz: [
            ['Gross margin fell from 60% to 57%. What do you check first?', 'Mix shift toward lower-margin products, then unit cost increases, then price realisation and discounting.'],
            ['Sales wants a 15% price cut. What volume increase breaks even?', 'With 40% contribution margin, volume must rise 60%: 0.40 / (0.40 - 0.15) - 1.'],
          ],
          style: 'reading',
          prereqs: ['Financial analytics interview questions'],
        },
      ],
    },
  ],
})
