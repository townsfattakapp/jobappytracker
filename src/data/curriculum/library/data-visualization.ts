import { defineTrack } from '../define'

export const dataVisualization = defineTrack({
  id: 'track-data-visualization',
  title: 'Data Visualization',
  description: 'Turning tables into charts people can read correctly: choosing the chart for the question, visual encoding principles, matplotlib, seaborn and plotly in practice, distributions, relationships, composition and maps, colour and accessibility, annotation and storytelling, the charts that mislead, and reproducible exports.',
  family: 'Data Science',
  kind: 'domain',
  icon: '📊',
  tags: ['data visualization', 'matplotlib', 'seaborn', 'plotly', 'charts', 'storytelling', 'dashboards', 'python'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-pandas'],
  style: 'practice',
  categories: [
    {
      title: 'Choosing the Chart',
      description: 'Start from the question, not the library.',
      topics: [
        {
          title: 'Matching the chart to the question',
          description: 'Every chart answers one of a few questions: how is a value distributed, how do groups compare, how do two variables relate, how does something change over time, what makes up a whole. Naming the question first picks the chart family and avoids decorative charts.',
          concepts: ['The five chart questions', 'Distribution versus comparison charts', 'Relationship versus trend charts', 'Composition charts', 'Sketching before coding'],
          quiz: [
            ['Which question does a scatter plot answer?', 'How two numeric variables relate.'],
            ['You want to compare revenue across 12 regions. Which chart?', 'A sorted horizontal bar chart.'],
          ],
        },
        {
          title: 'The grammar of a chart',
          description: 'A chart is data mapped to marks (points, lines, bars, areas) through encodings (position, length, colour, size, shape) on scales inside a coordinate system. Thinking in this grammar makes any library, from matplotlib to plotly, feel the same.',
          concepts: ['Marks and geometries', 'Encodings map columns to visual channels', 'Scales and coordinate systems', 'Layers and facets', 'Tidy data as chart input'],
          quiz: [
            ['What is an encoding?', 'A mapping from a data column to a visual channel such as x position or colour.'],
            ['Why does tidy (long) data make plotting easier?', 'Each column is one variable, so it maps directly to one encoding.'],
          ],
          prereqs: ['Matching the chart to the question'],
        },
        {
          title: 'Encoding effectiveness ranking',
          description: 'Cleveland and McGill showed people judge position on a common scale most accurately, then length, then angle and area, with colour hue last for quantities. Put the most important comparison on the most accurate channel.',
          concepts: ['Position on a common scale', 'Length and aligned baselines', 'Angle and area are read poorly', 'Colour hue for categories only', 'Ranking channels by accuracy'],
          quiz: [
            ['Why are pie slices harder to compare than bars?', 'Angle and area are judged less accurately than length on a common baseline.'],
            ['Which channel should carry the key quantity?', 'Position on an aligned axis.'],
          ],
          prereqs: ['The grammar of a chart'],
        },
        {
          title: 'Small multiples versus one busy chart',
          description: 'When more than four or five series share axes, lines tangle and colours run out. Small multiples (facets) repeat one simple chart per group on shared scales so the eye compares shapes instead of decoding a legend.',
          concepts: ['When a legend stops working', 'Facet grids with shared scales', 'Ordering panels meaningfully', 'Free versus fixed axes trade-off'],
          quiz: [
            ['When should facets share the y axis?', 'When comparing magnitudes across panels; free axes only when shapes matter more than levels.'],
            ['How many line series are usually readable on one axis?', 'Around four or five with distinct colours.'],
          ],
          prereqs: ['Encoding effectiveness ranking'],
        },
      ],
    },
    {
      title: 'Matplotlib Fundamentals',
      description: 'The library every other Python plotting tool sits on.',
      style: 'code',
      topics: [
        {
          title: 'Figure, Axes and the object-oriented API',
          description: 'A Figure holds one or more Axes; each Axes owns its artists, ticks and labels. Using fig, ax = plt.subplots() and ax.plot() instead of the pyplot state machine keeps multi-panel code and reuse predictable.',
          concepts: ['Figure and Axes hierarchy', 'plt.subplots and the ax object', 'pyplot state machine pitfalls', 'Artists: lines, patches and text', 'Saving and closing figures'],
          quiz: [
            ['What does plt.subplots() return?', 'A Figure and one or more Axes.'],
            ['Why prefer ax.set_title over plt.title?', 'It targets an explicit Axes, so it works with multiple panels and inside functions.'],
          ],
        },
        {
          title: 'Line, scatter and bar primitives',
          description: 'ax.plot for lines and markers, ax.scatter for per-point size and colour, ax.bar and ax.barh for categories, and the arguments (linestyle, marker, alpha, zorder) that control how they draw.',
          concepts: ['ax.plot format strings and kwargs', 'ax.scatter with s and c arrays', 'ax.bar and ax.barh', 'alpha, zorder and linewidth', 'Plotting straight from DataFrame columns'],
          quiz: [
            ['When use scatter instead of plot with markers?', 'When each point needs its own size or colour.'],
            ['What does zorder control?', 'Drawing order; higher values draw on top.'],
          ],
          prereqs: ['Figure, Axes and the object-oriented API'],
        },
        {
          title: 'Ticks, scales and axis formatting',
          description: 'Log and symlog scales, tick locators and formatters (FuncFormatter, PercentFormatter, date formatters), limits and margins, and rotated or thinned tick labels so axes read at a glance.',
          concepts: ['set_xscale log and symlog', 'Locators and formatters', 'PercentFormatter and currency labels', 'Date axes and mdates', 'Limits, margins and inverted axes'],
          quiz: [
            ['When is a log scale appropriate?', 'When values span orders of magnitude or ratios matter more than differences.'],
            ['How do you show y ticks as percentages?', 'ax.yaxis.set_major_formatter(PercentFormatter(1.0)).'],
          ],
          prereqs: ['Line, scatter and bar primitives'],
        },
        {
          title: 'Legends, titles and labels',
          description: 'Legend placement inside and outside the axes, handles and labels control, axis labels with units, and titles as sentences rather than variable names, all with the text sizes that survive shrinking.',
          concepts: ['ax.legend loc and bbox_to_anchor', 'Custom legend handles', 'Axis labels with units', 'Title versus suptitle', 'Font sizes that survive resizing'],
          quiz: [
            ['How do you place a legend outside the plot?', 'ax.legend(bbox_to_anchor=(1.02, 1), loc="upper left").'],
            ['What should an axis label always include for quantities?', 'The unit, such as revenue (USD millions).'],
          ],
          prereqs: ['Figure, Axes and the object-oriented API'],
        },
        {
          title: 'Subplots and layout',
          description: 'Grids of Axes with plt.subplots and GridSpec, sharing x or y axes, constrained_layout to stop labels colliding, and inset axes for zoomed detail.',
          concepts: ['subplots grids and sharex', 'GridSpec for uneven panels', 'constrained_layout and tight_layout', 'Inset axes', 'Iterating over a flattened axes array'],
          quiz: [
            ['What does sharex=True do?', 'Links x limits and ticks across panels so they zoom and align together.'],
            ['Why use constrained_layout?', 'It automatically spaces panels so titles and tick labels do not overlap.'],
          ],
          prereqs: ['Legends, titles and labels'],
        },
        {
          title: 'Styles, rcParams and figure sizing',
          description: 'Style sheets, rcParams for project-wide defaults (fonts, colours, spines), figsize and dpi for the target medium, and removing chart junk such as top and right spines.',
          concepts: ['plt.style.use and style sheets', 'rcParams defaults', 'figsize and dpi per medium', 'Removing spines and gridlines', 'A house style function'],
          quiz: [
            ['What does dpi change?', 'Pixel density of raster output; it does not change the figure size in inches.'],
            ['Why set a house style in rcParams?', 'Every chart in a project looks consistent without repeating styling code.'],
          ],
          prereqs: ['Subplots and layout'],
        },
      ],
    },
    {
      title: 'Seaborn Statistical Plots',
      description: 'Statistical graphics with sensible defaults on top of matplotlib.',
      style: 'code',
      topics: [
        {
          title: 'Seaborn data model and long format',
          description: 'Seaborn functions take a DataFrame plus column names for x, y, hue, size and style, so reshaping to long format with melt is often the whole job; wide data still works for quick plots.',
          concepts: ['data, x, y, hue arguments', 'melt to long format for seaborn', 'Semantic mappings: hue, size, style', 'Wide-form shortcuts'],
          quiz: [
            ['What does hue do?', 'Splits the data by a column and encodes each group with a colour.'],
            ['Why melt before plotting several columns?', 'Seaborn maps one column per encoding, so each variable needs its own column.'],
          ],
        },
        {
          title: 'histplot, kdeplot and ecdfplot',
          description: 'Histograms with control over bins and stat, kernel density estimates with bandwidth, and ECDFs that need no binning at all; how each answers the distribution question differently.',
          concepts: ['histplot bins, binwidth and stat', 'kdeplot bandwidth', 'ecdfplot for bin-free comparison', 'Overlaying multiple groups', 'Cumulative and normalised counts'],
          quiz: [
            ['Why can a KDE mislead?', 'Bandwidth choice can smooth away real features or invent bumps.'],
            ['What advantage does an ECDF have?', 'No bin or bandwidth choice, and quantiles read straight off the curve.'],
          ],
          prereqs: ['Seaborn data model and long format'],
        },
        {
          title: 'boxplot, violinplot and stripplot',
          description: 'Box plots summarise quartiles and outliers, violins add the density shape, strip and swarm plots show every point; combining them reveals sample sizes that summaries hide.',
          concepts: ['Box plot anatomy and whiskers', 'Violin plots and cut', 'stripplot and swarmplot overlays', 'Ordering categories by median', 'Showing n per group'],
          quiz: [
            ['What do the box whiskers usually extend to?', '1.5 times the interquartile range beyond the box.'],
            ['Why overlay a strip plot on a box plot?', 'To show sample size and individual values the summary hides.'],
          ],
          prereqs: ['histplot, kdeplot and ecdfplot'],
        },
        {
          title: 'relplot, scatterplot and lineplot',
          description: 'Relationship plots with hue, size and style semantics, automatic aggregation with confidence bands in lineplot, and relplot for facets by row and column.',
          concepts: ['scatterplot semantics', 'lineplot aggregation and errorbar', 'relplot facets by col and row', 'Controlling palettes per semantic'],
          quiz: [
            ['What does lineplot draw when several y values share an x?', 'The mean with a 95% confidence band by default.'],
            ['How do you facet a relplot by a category?', 'Pass col="category" (and optionally row).'],
          ],
          prereqs: ['Seaborn data model and long format'],
        },
        {
          title: 'Figure-level versus axes-level functions',
          description: 'Axes-level functions (scatterplot, boxplot) draw onto an Axes you control; figure-level functions (relplot, catplot, displot) own the whole figure and add facets, which changes how you size, title and combine them.',
          concepts: ['Axes-level functions and ax=', 'Figure-level functions and FacetGrid', 'Sizing with height and aspect', 'Mixing seaborn with matplotlib', 'catplot kinds'],
          quiz: [
            ['Can you pass ax= to relplot?', 'No; figure-level functions create their own figure.'],
            ['How do you set the size of a catplot?', 'height and aspect arguments, not figsize.'],
          ],
          prereqs: ['relplot, scatterplot and lineplot'],
        },
      ],
    },
    {
      title: 'Plotly Interactive Charts',
      description: 'Hover, zoom and share in the browser.',
      style: 'code',
      topics: [
        {
          title: 'plotly.express quick charts',
          description: 'One-line interactive charts from a DataFrame with px.scatter, px.line, px.bar and px.histogram, colour and facet arguments, and the Figure object every call returns.',
          concepts: ['px functions and DataFrame input', 'color, symbol and facet_col', 'Animation frames', 'fig.show and renderers', 'Updating layout after px'],
          quiz: [
            ['What does px.scatter return?', 'A plotly Figure object you can further customise.'],
            ['How do you facet in plotly express?', 'facet_col or facet_row arguments.'],
          ],
        },
        {
          title: 'graph_objects and traces',
          description: 'Building figures from go.Figure and traces (go.Scatter, go.Bar, go.Heatmap) when express cannot express it: multiple trace types, secondary axes and make_subplots.',
          concepts: ['go.Figure and add_trace', 'Trace types and their properties', 'make_subplots grids', 'Secondary y axes', 'update_traces and update_layout'],
          quiz: [
            ['When drop from express to graph_objects?', 'Mixed trace types, custom subplots or fine control express cannot reach.'],
            ['How do you add a second y axis?', 'make_subplots(specs=[[{"secondary_y": True}]]) and add_trace with secondary_y=True.'],
          ],
          prereqs: ['plotly.express quick charts'],
        },
        {
          title: 'Hover templates and tooltips',
          description: 'hovertemplate with formatted fields and customdata, hover_data in express, unified hover mode for time series, and removing the trace name noise.',
          concepts: ['hovertemplate syntax', 'customdata for extra columns', 'hover_data in express', 'hovermode x unified', 'Number and date formatting in hovers'],
          quiz: [
            ['How do you show a column not used in the chart in the tooltip?', 'Pass it via hover_data or customdata and reference it in hovertemplate.'],
            ['What does hovermode="x unified" do?', 'Shows all series values at the same x in one tooltip.'],
          ],
          prereqs: ['plotly.express quick charts'],
        },
        {
          title: 'Range sliders, zoom and linked views',
          description: 'Range sliders and selectors for time series, dragmode and zoom behaviour, shared axes across subplots, and crossfilter-style linking with Dash callbacks when needed.',
          concepts: ['rangeslider and rangeselector', 'dragmode and zoom options', 'Shared axes in subplots', 'Linked selection basics'],
          quiz: [
            ['How do you add preset date ranges like 1m, 6m, YTD?', 'layout.xaxis.rangeselector with buttons.'],
            ['What does matches="x" do on subplot axes?', 'Keeps the axes synchronised when zooming.'],
          ],
          prereqs: ['graph_objects and traces'],
        },
        {
          title: 'Exporting plotly figures',
          description: 'write_html for self-contained interactive files, kaleido for static PNG, SVG and PDF, controlling size and scale, and embedding figures in notebooks and web pages.',
          concepts: ['write_html and include_plotlyjs', 'Static export with kaleido', 'Width, height and scale', 'Embedding in notebooks and pages'],
          quiz: [
            ['What does include_plotlyjs="cdn" change?', 'The HTML loads plotly.js from a CDN instead of embedding 3 MB.'],
            ['Which package does write_image need?', 'kaleido.'],
          ],
          prereqs: ['plotly.express quick charts'],
        },
      ],
    },
    {
      title: 'Distributions and Comparisons',
      topics: [
        {
          title: 'Histogram binning choices',
          description: 'Bin count and width change what a histogram shows: too few hides modes, too many shows noise. Rules like Freedman-Diaconis, log-spaced bins for skewed data, and consistent bins across groups.',
          concepts: ['Bin width versus bin count', 'Freedman-Diaconis and Sturges', 'Log-spaced bins for skew', 'Same bins across groups', 'Density versus count normalisation'],
          quiz: [
            ['Why use identical bins when comparing two groups?', 'Different bins make the shapes incomparable.'],
            ['What does the Freedman-Diaconis rule use?', 'The interquartile range and sample size to set bin width.'],
          ],
        },
        {
          title: 'Comparing groups side by side',
          description: 'Choosing between grouped bars, dot plots, box plots and ridgeline plots for comparing distributions across categories, with ordering, shared scales and reference lines that make differences obvious.',
          concepts: ['Grouped versus stacked bars', 'Dot plots for many categories', 'Ridgeline plots', 'Reference lines for a baseline', 'Sorting categories by value'],
          quiz: [
            ['Why sort bars by value rather than alphabetically?', 'The eye reads rank instantly; alphabetical order hides it.'],
            ['When do dot plots beat bars?', 'Many categories or when the axis does not start at zero.'],
          ],
          prereqs: ['Histogram binning choices'],
        },
        {
          title: 'Showing uncertainty',
          description: 'Error bars, confidence bands, bootstrapped intervals and gradient bands, what each interval actually means, and why standard error bars on bars often mislead.',
          concepts: ['Error bars: SD, SE or CI', 'Confidence bands on lines', 'Bootstrap intervals in seaborn', 'Fan charts and quantile bands', 'Labelling what the interval is'],
          quiz: [
            ['What is the difference between SD and SE bars?', 'SD shows spread of the data; SE shows uncertainty of the mean.'],
            ['Why must the legend say which interval is drawn?', 'Readers cannot tell SD, SE and CI apart visually and interpret them differently.'],
          ],
          prereqs: ['Comparing groups side by side'],
        },
        {
          title: 'Ranked bars and lollipop charts',
          description: 'Horizontal bars with readable labels, lollipop and dumbbell charts for change between two states, highlighting one category, and truncating long tails to a top-N plus other.',
          concepts: ['Horizontal bars for long labels', 'Lollipop charts', 'Dumbbell charts for two states', 'Top-N with an other bucket', 'Highlighting one bar'],
          quiz: [
            ['When use a dumbbell chart?', 'To show change between two points in time per category.'],
            ['Why horizontal instead of vertical bars?', 'Long category labels stay readable without rotation.'],
          ],
          prereqs: ['Comparing groups side by side'],
        },
      ],
    },
    {
      title: 'Relationships and Trends',
      topics: [
        {
          title: 'Scatter plots and overplotting',
          description: 'Scatter plots for two numeric variables and the overplotting problem with large data: alpha, smaller markers, hexbin, 2D histograms and sampling, plus jitter for discrete values.',
          concepts: ['Alpha and marker size', 'Hexbin and 2D histograms', 'Jitter for discrete values', 'Sampling large data', 'Marginal distributions with jointplot'],
          quiz: [
            ['What does a hexbin show that a scatter cannot?', 'Point density where markers would overlap into a blob.'],
            ['Why add jitter?', 'To separate points that share identical discrete values.'],
          ],
        },
        {
          title: 'Correlation heatmaps and pair plots',
          description: 'Correlation matrices as diverging heatmaps with masked upper triangles, clustered ordering, and pair plots for a first look at many variables, plus the caveat that correlation only sees linear relationships.',
          concepts: ['sns.heatmap with a diverging map', 'Masking the upper triangle', 'Clustermap ordering', 'pairplot for many variables', 'Correlation limits'],
          quiz: [
            ['Why centre the colour map at zero for correlations?', 'So positive and negative values get opposite hues with white at no correlation.'],
            ['What relationship does Pearson correlation miss?', 'Non-linear ones such as a U shape.'],
          ],
          prereqs: ['Scatter plots and overplotting'],
        },
        {
          title: 'Time series lines and resampling',
          description: 'Line charts for time with a proper datetime axis, resampling to a sensible granularity, handling gaps honestly, and plotting many series with small multiples or a highlighted few.',
          concepts: ['Datetime index and axis', 'Resampling to weekly or monthly', 'Gaps shown as breaks', 'Highlight one series against grey', 'Indexed series for comparison'],
          quiz: [
            ['How should missing periods appear in a line chart?', 'As gaps, not interpolated lines that invent data.'],
            ['Why index series to 100 at a start date?', 'To compare growth of series with different magnitudes.'],
          ],
          prereqs: ['Scatter plots and overplotting'],
        },
        {
          title: 'Trend lines and smoothing',
          description: 'Rolling means, LOWESS fits and regression lines with confidence bands to show a trend without hiding the raw data, and the window and span choices that change the story.',
          concepts: ['Rolling means and windows', 'LOWESS with regplot', 'Regression line with band', 'Keep raw data visible', 'Seasonal decomposition plots'],
          quiz: [
            ['What is the risk of a long rolling window?', 'It lags and smooths away real turning points.'],
            ['What does regplot draw by default?', 'A scatter, a linear fit and a 95% confidence band.'],
          ],
          prereqs: ['Time series lines and resampling'],
        },
        {
          title: 'Slope charts and bump charts',
          description: 'Slope charts connect two periods per category to show who rose and fell; bump charts track rank over time; both replace tangled multi-line charts when rank or change is the point.',
          concepts: ['Slope chart construction', 'Bump charts for rank over time', 'Labelling line ends directly', 'When change beats levels'],
          quiz: [
            ['What question does a bump chart answer?', 'How rank changed over time.'],
            ['Why label line ends instead of using a legend?', 'Readers follow the line to its name without looking away.'],
          ],
          prereqs: ['Time series lines and resampling'],
        },
      ],
    },
    {
      title: 'Part-to-Whole and Composition',
      topics: [
        {
          title: 'Stacked and 100% stacked bars',
          description: 'Stacked bars for totals with a breakdown, 100% stacked bars for share, why only the bottom segment is easy to compare, and stacked areas for composition over time.',
          concepts: ['Stacked bars and totals', '100% stacked for shares', 'Bottom segment comparability', 'Stacked area over time', 'Ordering segments by size'],
          quiz: [
            ['Which stacked segment is easiest to compare across bars?', 'The bottom one, because it shares a baseline.'],
            ['When choose 100% stacked over stacked?', 'When share matters more than absolute totals.'],
          ],
        },
        {
          title: 'Pie and donut charts',
          description: 'Pies work for two or three slices where one dominates and fail beyond that; ordering slices, labelling percentages directly, and the bar chart that usually does the job better.',
          concepts: ['When a pie works', 'Slice ordering and labelling', 'Donuts and the centre label', 'Replacing a pie with bars'],
          quiz: [
            ['How many slices can a pie show clearly?', 'Two or three, ideally with one dominant.'],
            ['What is the best use of a donut centre?', 'The single headline number.'],
          ],
          prereqs: ['Stacked and 100% stacked bars'],
        },
        {
          title: 'Treemaps and sunbursts',
          description: 'Hierarchical part-to-whole with area: treemaps for two-level breakdowns of many items, sunbursts for deeper hierarchies with drill-down in plotly, and the area-reading limits to keep in mind.',
          concepts: ['px.treemap with path', 'Sunburst hierarchies', 'Area encoding limits', 'Colour as a second measure'],
          quiz: [
            ['When does a treemap beat a bar chart?', 'Hundreds of categories in a hierarchy where rough size is enough.'],
            ['What does path=["region", "country"] do in px.treemap?', 'Defines the nesting levels of the hierarchy.'],
          ],
          prereqs: ['Pie and donut charts'],
        },
        {
          title: 'Waterfall charts',
          description: 'Waterfalls show how a starting value becomes an end value through additions and subtractions, ideal for revenue to profit bridges; building one with plotly go.Waterfall or matplotlib bars.',
          concepts: ['Bridge from start to end', 'Increase, decrease and total bars', 'go.Waterfall', 'Manual waterfall with bar bottoms'],
          quiz: [
            ['What question does a waterfall answer?', 'How components add up from one total to another.'],
            ['How do you build a waterfall in matplotlib?', 'Bars with a bottom argument equal to the running total.'],
          ],
          prereqs: ['Stacked and 100% stacked bars'],
        },
      ],
    },
    {
      title: 'Geospatial Basics',
      topics: [
        {
          title: 'Choropleth maps with GeoPandas',
          description: 'Joining data to region geometries, plotting a choropleth with a classed or continuous colour scale, and the trap of large sparse regions dominating the picture.',
          concepts: ['GeoDataFrame and geometry column', 'Joining data to shapes', 'Classification schemes', 'Large-area bias', 'Plotly choropleth alternatives'],
          quiz: [
            ['Why can a choropleth mislead?', 'Large, sparsely populated regions dominate visually regardless of their value.'],
            ['What must a choropleth colour usually represent?', 'A rate or density, not a raw count.'],
          ],
        },
        {
          title: 'Point and bubble maps',
          description: 'Plotting events at coordinates with scatter_mapbox or GeoPandas, sizing bubbles by a measure with area not radius, clustering dense points, and basemap tiles.',
          concepts: ['Latitude and longitude scatter', 'Bubble size by area', 'Point clustering and density', 'Basemap tiles with contextily or mapbox'],
          quiz: [
            ['Why scale bubble area rather than radius?', 'Readers perceive area, so radius scaling exaggerates large values.'],
            ['What does contextily add?', 'Basemap tiles under a GeoPandas plot.'],
          ],
          prereqs: ['Choropleth maps with GeoPandas'],
        },
        {
          title: 'Projections and normalisation',
          description: 'Coordinate reference systems, why Mercator distorts area, choosing an equal-area projection for thematic maps, and normalising counts by population or area before colouring.',
          concepts: ['CRS and to_crs', 'Mercator area distortion', 'Equal-area projections', 'Normalising by population', 'Hexagonal and cartogram alternatives'],
          quiz: [
            ['Why avoid Mercator for a world choropleth?', 'It inflates high-latitude areas, distorting visual weight.'],
            ['How do you change projection in GeoPandas?', 'gdf.to_crs(epsg=...).'],
          ],
          prereqs: ['Choropleth maps with GeoPandas'],
        },
      ],
    },
    {
      title: 'Colour, Annotation and Storytelling',
      description: 'Where an accurate chart becomes a clear one.',
      topics: [
        {
          title: 'Sequential, diverging and categorical palettes',
          description: 'Sequential maps (viridis) for ordered magnitudes, diverging maps centred on a meaningful midpoint, categorical palettes with few distinguishable hues, and why rainbow and jet distort perception.',
          concepts: ['Sequential palettes and viridis', 'Diverging with a true midpoint', 'Categorical hue limits', 'Perceptual uniformity', 'Why jet misleads'],
          quiz: [
            ['When use a diverging palette?', 'When the data has a meaningful centre, such as zero change.'],
            ['What is wrong with the jet colour map?', 'Uneven perceived brightness creates false boundaries.'],
          ],
        },
        {
          title: 'Colour blindness and contrast',
          description: 'About 8% of men cannot separate red and green; colour-blind-safe palettes, redundant encodings (shape, label, pattern), sufficient contrast for text, and simulators to check a chart.',
          concepts: ['Deuteranopia-safe palettes', 'Redundant encoding with shape or label', 'Contrast for text and lines', 'Simulating colour vision deficiency', 'Grey plus one accent'],
          quiz: [
            ['Which colour pair should you avoid for two groups?', 'Red and green.'],
            ['How do you make a chart readable without colour?', 'Add direct labels, shapes or line styles as a second encoding.'],
          ],
          prereqs: ['Sequential, diverging and categorical palettes'],
        },
        {
          title: 'Direct labelling and annotation',
          description: 'Labels placed on the data with ax.annotate and text, arrows to the point that matters, value labels on bars, and avoiding label collisions with adjustText or manual offsets.',
          concepts: ['ax.annotate with arrows', 'Value labels with bar_label', 'Label collision handling', 'Annotating events on time series'],
          quiz: [
            ['What does ax.bar_label do?', 'Writes each bar value at its end.'],
            ['Why annotate an event on a time series?', 'Readers connect a change to its cause without a caption.'],
          ],
          prereqs: ['Colour blindness and contrast'],
        },
        {
          title: 'Highlighting and de-emphasising',
          description: 'One accent colour on the series that matters with the rest in light grey, thicker lines for the focus, and removing gridlines and borders that compete with data.',
          concepts: ['Grey context, accent focus', 'Line weight for emphasis', 'Data-ink ratio', 'Removing chart junk'],
          quiz: [
            ['How do you show one series among 30?', 'Draw the others in light grey and the focus in one strong colour.'],
            ['What is the data-ink ratio?', 'The share of ink that shows data rather than decoration.'],
          ],
          prereqs: ['Direct labelling and annotation'],
        },
        {
          title: 'Titles that state the takeaway',
          description: 'A title that says what the chart shows (Churn doubled after the price change) rather than what it is (Churn by month), subtitles for method and source notes for trust.',
          concepts: ['Takeaway titles', 'Subtitles for scope and method', 'Source and date notes', 'One message per chart'],
          quiz: [
            ['What makes a title a takeaway title?', 'It states the conclusion the reader should draw.'],
            ['Where does the data source belong?', 'A small note under the chart.'],
          ],
          prereqs: ['Highlighting and de-emphasising'],
        },
        {
          title: 'Building a narrative sequence',
          description: 'Ordering charts from context to detail to recommendation, keeping scales and colours consistent across a sequence, and building up one chart progressively for presentations.',
          concepts: ['Context, detail, recommendation order', 'Consistent scales across a story', 'Progressive reveal', 'Charts for slides versus reports'],
          quiz: [
            ['Why keep the same colour per category across all charts?', 'Readers learn the mapping once and stop reading legends.'],
            ['How does a slide chart differ from a report chart?', 'Fewer elements, larger text and one message.'],
          ],
          prereqs: ['Titles that state the takeaway'],
        },
      ],
    },
    {
      title: 'Dashboards, Honesty and Reproducibility',
      topics: [
        {
          title: 'Misleading charts to avoid',
          description: 'Truncated bar axes, dual y axes that invent correlation, cherry-picked windows, 3D effects, area-scaled icons and cumulative charts that hide decline; how to spot and fix each.',
          concepts: ['Truncated bar axes', 'Dual axis illusions', 'Cherry-picked time windows', '3D and perspective distortion', 'Cumulative charts hiding decline'],
          quiz: [
            ['Must a bar chart axis start at zero?', 'Yes; bar length encodes value, so a truncated axis exaggerates differences.'],
            ['Why are dual y axes risky?', 'Scale choices can make any two series look correlated.'],
          ],
        },
        {
          title: 'Dashboards with Streamlit and Dash',
          description: 'Turning charts into an app: Streamlit widgets and caching for quick internal tools, Dash callbacks for production interactivity, and layout principles that dashboard-design covers in depth.',
          concepts: ['Streamlit widgets and st.cache_data', 'Dash layout and callbacks', 'Choosing Streamlit versus Dash', 'Refresh and data loading'],
          quiz: [
            ['What does st.cache_data do?', 'Caches a function result so reruns do not reload data.'],
            ['What triggers a Dash callback?', 'A change in an Input component property.'],
          ],
        },
        {
          title: 'Exporting for print and web',
          description: 'Vector (SVG, PDF) for print and scaling, PNG at 2x for screens, transparent backgrounds, embedding fonts, and bbox_inches="tight" to keep labels inside the file.',
          concepts: ['Vector versus raster output', 'savefig dpi and bbox_inches', 'Transparent backgrounds', 'Font embedding', 'Sizes for slides and papers'],
          quiz: [
            ['Which format for a journal figure?', 'PDF or SVG for vector quality.'],
            ['What does bbox_inches="tight" fix?', 'Labels and legends being cut off at the figure edge.'],
          ],
        },
        {
          title: 'Reproducible figure scripts',
          description: 'Figures generated by scripts from raw data, not hand-tweaked in notebooks: a chart function per figure, fixed random seeds, versioned data inputs and a Makefile or script that rebuilds every figure.',
          concepts: ['One function per figure', 'Fixed seeds and inputs', 'Rebuilding all figures from a script', 'Notebook to module refactor', 'Image diff tests'],
          quiz: [
            ['Why generate figures from scripts?', 'Anyone can rebuild them when data changes and nothing is hand-edited.'],
            ['How do you test a chart function?', 'Compare its output image to a stored baseline.'],
          ],
          prereqs: ['Exporting for print and web'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: exploratory report on a public dataset',
          description: 'Take a public dataset (for example city bike trips), profile it, and produce a ten-chart report in matplotlib and seaborn covering distributions, comparisons and trends, each chart with a takeaway title and consistent styling, built by a script.',
          concepts: ['Profile and clean the data', 'Pick ten questions and charts', 'Apply a house style', 'Write takeaway titles', 'Build the report from a script'],
          quiz: [
            ['What should each chart in the report have?', 'A takeaway title, labelled axes with units and a source note.'],
            ['Why build from a script rather than a notebook?', 'The report regenerates when data updates.'],
          ],
        },
        {
          title: 'Project: interactive sales explorer in plotly',
          description: 'A plotly and Streamlit app over sales data with a time series of revenue, a sortable bar of products, a treemap of categories and a map of regions, linked by filters, with hover templates and an export button.',
          concepts: ['Design the four linked views', 'Build charts in plotly express', 'Add filters and caching', 'Write hover templates', 'Export HTML and PNG'],
          quiz: [
            ['How do filters reach every chart?', 'Filter the DataFrame once and pass it to each chart function.'],
            ['Why cache the data load?', 'Streamlit reruns the script on every interaction.'],
          ],
        },
        {
          title: 'Project: chart makeover',
          description: 'Collect five misleading or cluttered published charts, diagnose each problem (truncated axis, rainbow map, pie with ten slices), and redraw each one honestly with before-and-after images and a written rationale.',
          concepts: ['Collect and diagnose charts', 'Redraw with correct encodings', 'Fix colour and labels', 'Document the rationale'],
          quiz: [
            ['What is the first thing to check on a suspicious bar chart?', 'Whether the value axis starts at zero.'],
            ['What replaces a ten-slice pie?', 'A sorted horizontal bar chart.'],
          ],
        },
        {
          title: 'Project: geospatial analysis of a city',
          description: 'Map a city dataset (incidents, listings or stations): a choropleth of rates per district with GeoPandas, a density map of points, and an equal-area projection, with a written note on normalisation choices.',
          concepts: ['Load boundaries and join data', 'Normalise counts to rates', 'Choropleth and density map', 'Choose a projection', 'Present with annotations'],
          quiz: [
            ['Why normalise incidents per district?', 'Raw counts mostly reflect population, not risk.'],
            ['Which map shows clusters of points best?', 'A density or hexbin map rather than raw markers.'],
          ],
        },
        {
          title: 'Data visualization interview questions',
          description: 'Explaining chart choice for a given question, why pies and dual axes fail, colour accessibility, how to show uncertainty, and critiquing a chart on the spot with a fix.',
          concepts: ['Chart choice questions', 'Perception and colour questions', 'Chart critique on the spot', 'Library comparison questions'],
          quiz: [
            ['How would you show 20 product lines over time?', 'Small multiples or highlight a few with the rest in grey.'],
            ['What is the difference between seaborn and plotly?', 'Seaborn makes static statistical charts on matplotlib; plotly makes interactive browser charts.'],
          ],
          style: 'reading',
        },
        {
          title: 'Take-home visualization tasks',
          description: 'Typical take-home briefs: build a short analysis with charts from a CSV, explain each choice in a paragraph, and deliver a clean notebook or script that reviewers can run.',
          concepts: ['Reading the brief for the question', 'Prioritising three strong charts', 'Explaining choices in writing', 'Delivering runnable code'],
          quiz: [
            ['How many charts should a take-home contain?', 'A few strong ones that answer the brief, not a gallery.'],
            ['What do reviewers check first?', 'Whether the code runs and the charts answer the question.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
