import { defineTrack } from '../define'

export const pythonAi = defineTrack({
  id: 'track-python-ai',
  title: 'Python for Data, Analytics and AI',
  description: 'The applied Python stack used in every data and AI job: numpy arrays and vectorisation, pandas for analysis, file and database formats, plotting with matplotlib, seaborn and plotly, reproducible notebooks, the scikit-learn and PyTorch APIs, calling AI services over HTTP, environments, performance and packaging analysis code.',
  family: 'AI & Generative AI',
  kind: 'language',
  icon: '📊',
  tags: ['python', 'numpy', 'pandas', 'matplotlib', 'scikit-learn', 'pytorch', 'polars', 'jupyter', 'data'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python'],
  style: 'code',
  categories: [
    {
      title: 'NumPy and Vectorisation',
      description: 'The array type that every other library is built on.',
      topics: [
        {
          title: 'ndarray, dtype and shape',
          description: 'A numpy array is a contiguous block of same-typed numbers with a shape and strides. Choosing dtypes deliberately (float32 versus float64, int8 for labels) halves memory and matches what GPUs and scikit-learn expect.',
          concepts: ['Creating arrays from lists and ranges', 'dtype and memory footprint', 'shape, ndim and size', 'reshape, ravel and newaxis', 'Views versus copies'],
          quiz: [
            ['What does np.zeros((3, 4), dtype=np.float32) allocate?', 'A 3 by 4 array of 32-bit floats, 48 bytes.'],
            ['Does reshape copy data?', 'Usually not; it returns a view when the memory layout allows.'],
            ['What is arr[:, None] for?', 'Adding a new axis so a 1-D array becomes a column.'],
          ],
        },
        {
          title: 'Indexing, slicing and boolean masks',
          description: 'Slices return views, integer arrays and boolean masks return copies, and combining them selects rows, columns and conditions without loops. Masking is how you filter and clean data at array speed.',
          concepts: ['Multi-dimensional slicing', 'Boolean masks and np.where', 'Fancy indexing with integer arrays', 'Assigning through a mask'],
          quiz: [
            ['What does arr[arr > 0] return?', 'A 1-D copy of the positive elements.'],
            ['How do you replace negatives with zero in place?', 'arr[arr < 0] = 0'],
          ],
          prereqs: ['ndarray, dtype and shape'],
        },
        {
          title: 'Broadcasting rules',
          description: 'Arrays of different shapes combine by aligning trailing dimensions and stretching size-1 axes, so subtracting a (n, d) matrix by its (d,) column means needs no loop. Knowing the rule prevents silent shape bugs that produce wrong numbers.',
          concepts: ['Trailing-dimension alignment', 'Stretching size-1 axes', 'Standardising columns with broadcasting', 'Diagnosing broadcast errors'],
          quiz: [
            ['Can shapes (5, 3) and (3,) be added?', 'Yes, the (3,) is broadcast across each of the 5 rows.'],
            ['Can shapes (5, 3) and (5,) be added?', 'No, trailing dimensions 3 and 5 do not match; reshape to (5, 1) first.'],
          ],
          prereqs: ['ndarray, dtype and shape'],
        },
        {
          title: 'Vectorised operations and ufuncs',
          description: 'Universal functions apply element-wise operations in compiled C, so np.exp(arr) beats a Python loop by a hundred times. Writing maths as whole-array expressions is the first habit that separates data code from scripting.',
          concepts: ['Arithmetic and comparison ufuncs', 'np.exp, np.log and friends', 'Replacing loops with array expressions', 'Conditional logic with np.where and np.select'],
          quiz: [
            ['Why is np.sqrt(arr) faster than [math.sqrt(x) for x in arr]?', 'The loop runs in compiled code, not the Python interpreter.'],
            ['What does np.where(cond, a, b) do?', 'Picks elements from a where cond is True and from b elsewhere.'],
          ],
          prereqs: ['Broadcasting rules'],
        },
        {
          title: 'Aggregations along axes',
          description: 'sum, mean, std, min and argmax take an axis argument that collapses one dimension; getting it right is the difference between column statistics and row statistics. keepdims keeps results broadcastable for the next step.',
          concepts: ['axis=0 versus axis=1', 'keepdims for later broadcasting', 'argmax, argsort and cumulative sums', 'NaN-aware aggregations'],
          quiz: [
            ['What does arr.mean(axis=0) compute on a (n, d) array?', 'The mean of each of the d columns.'],
            ['Which function ignores NaN when summing?', 'np.nansum.'],
          ],
          prereqs: ['Vectorised operations and ufuncs'],
        },
        {
          title: 'Random numbers and linear algebra helpers',
          description: 'np.random.default_rng gives reproducible, well-behaved random streams for sampling and shuffling, and np.linalg covers norms, solves, inverses and decompositions. Together they cover most of the maths a data script needs.',
          concepts: ['Generator and seeding', 'Sampling, choice and shuffling', 'np.linalg.norm and solve', 'Matrix products with @ and einsum'],
          quiz: [
            ['How do you create a seeded random generator?', 'rng = np.random.default_rng(42)'],
            ['Why prefer np.linalg.solve to computing an inverse?', 'It is faster and numerically more accurate.'],
          ],
          prereqs: ['Aggregations along axes'],
        },
      ],
    },
    {
      title: 'pandas for Analysis',
      description: 'Tables with labels: the tool for exploring, cleaning and summarising data.',
      topics: [
        {
          title: 'Series and DataFrame basics',
          description: 'A DataFrame is a dict of columns sharing an index; each column is a Series with a dtype. Reading dtypes, the index and info() first tells you what cleaning is needed before any analysis.',
          concepts: ['Constructing frames from dicts and records', 'Index, columns and dtypes', 'head, info and describe', 'Column access and dot notation pitfalls'],
          quiz: [
            ['What does df.info() show?', 'Column names, non-null counts, dtypes and memory usage.'],
            ['Why does df.count fail to return the column called count?', 'Attribute access resolves the method first; use df["count"].'],
          ],
        },
        {
          title: 'Selecting with loc and iloc',
          description: 'loc selects by label and iloc by position, and both accept rows and columns together. Mixing them up or chaining brackets causes the SettingWithCopyWarning and silent no-op assignments.',
          concepts: ['loc by label and iloc by position', 'Row and column selection together', 'Boolean row selection', 'Avoiding chained assignment'],
          quiz: [
            ['What does df.iloc[0] return?', 'The first row as a Series, regardless of its label.'],
            ['Why does df[df.a > 0]["b"] = 1 not work?', 'It assigns to a temporary copy; use df.loc[df.a > 0, "b"] = 1.'],
          ],
          prereqs: ['Series and DataFrame basics'],
        },
        {
          title: 'Filtering, sorting and derived columns',
          description: 'Combine boolean conditions with & and |, sort by one or many keys, and create columns with vectorised expressions or assign. This trio is the daily bread of data cleaning and feature building.',
          concepts: ['Combining conditions with & and |', 'query and isin', 'sort_values with multiple keys', 'assign and vectorised new columns', 'apply and why to avoid it'],
          quiz: [
            ['Why does df[df.a > 0 and df.b < 5] fail?', 'and works on scalars; use & with parentheses around each condition.'],
            ['What does df.query("age > 30 and city == \'Delhi\'") do?', 'Filters rows with a string expression.'],
          ],
          prereqs: ['Selecting with loc and iloc'],
        },
        {
          title: 'Handling missing data',
          description: 'Missing values appear as NaN, None or pd.NA depending on dtype, and most aggregations skip them silently. Counting, dropping, filling and flagging them explicitly is the first cleaning step in every analysis.',
          concepts: ['NaN, None and pd.NA', 'isna, notna and counting gaps', 'dropna and fillna strategies', 'Nullable dtypes', 'Missingness as a feature'],
          quiz: [
            ['What does df.isna().sum() return?', 'The number of missing values per column.'],
            ['Which dtype can hold missing integers?', 'The nullable Int64 dtype.'],
          ],
          prereqs: ['Filtering, sorting and derived columns'],
        },
        {
          title: 'GroupBy, aggregate and transform',
          description: 'Split-apply-combine: group rows by keys, then aggregate to one row per group or transform back to the original shape. Named aggregations and transform for group-wise normalisation replace most loops over categories.',
          concepts: ['groupby and named aggregations', 'Multiple aggregations per column', 'transform for group-wise values', 'Group filtering and iteration'],
          quiz: [
            ['What is the difference between agg and transform?', 'agg returns one row per group; transform returns a value for every original row.'],
            ['How do you compute each row\'s deviation from its group mean?', 'df.x − df.groupby("g").x.transform("mean")'],
          ],
          prereqs: ['Handling missing data'],
        },
        {
          title: 'Merging and concatenating',
          description: 'merge joins frames on keys with inner, left, right and outer semantics; concat stacks them along an axis. Checking row counts and using validate catches the many-to-many explosions that corrupt analyses.',
          concepts: ['merge on keys and join types', 'Validating one-to-one and one-to-many', 'concat along rows and columns', 'Indicator column for debugging'],
          quiz: [
            ['Which join keeps every row of the left frame?', 'A left join.'],
            ['What does validate="one_to_one" do?', 'Raises if either key column has duplicates.'],
          ],
          prereqs: ['GroupBy, aggregate and transform'],
        },
        {
          title: 'Reshaping with pivot, melt and stack',
          description: 'Wide tables are good for reading and long tables for analysis and plotting; pivot_table, melt, stack and unstack move between them. Knowing which shape a library wants saves hours of manual restructuring.',
          concepts: ['Wide versus long formats', 'pivot and pivot_table', 'melt to long format', 'stack, unstack and MultiIndex'],
          quiz: [
            ['What does melt do?', 'Turns columns into rows, producing variable and value columns.'],
            ['When does pivot fail but pivot_table work?', 'When there are duplicate index and column pairs that need aggregating.'],
          ],
          prereqs: ['Merging and concatenating'],
        },
        {
          title: 'Dates, times and resampling',
          description: 'Parsing strings to datetime64, using the dt accessor, setting a DatetimeIndex and resampling to daily or monthly buckets turn event logs into time series. Time zones and rolling windows are where most bugs hide.',
          concepts: ['to_datetime and parsing formats', 'dt accessor and components', 'resample and rolling windows', 'Time zones and localisation'],
          quiz: [
            ['How do you compute a 7-day rolling mean?', 'series.rolling("7D").mean() on a DatetimeIndex.'],
            ['What does df.resample("M").sum() need?', 'A DatetimeIndex or the on= argument naming a datetime column.'],
          ],
          prereqs: ['GroupBy, aggregate and transform'],
        },
      ],
    },
    {
      title: 'Loading Data and Formats',
      description: 'Getting data in and out correctly, whatever it arrives as.',
      topics: [
        {
          title: 'CSV, TSV and Excel files',
          description: 'read_csv has dozens of options for delimiters, encodings, dtypes, date parsing and bad lines, and Excel files add sheets and merged headers. Setting dtypes at load time avoids slow, memory-hungry object columns.',
          concepts: ['read_csv options that matter', 'Specifying dtypes and parse_dates', 'Encodings and bad lines', 'Excel sheets with openpyxl'],
          quiz: [
            ['Why pass dtype to read_csv?', 'To avoid type inference errors and reduce memory.'],
            ['Which engine reads .xlsx files?', 'openpyxl.'],
          ],
          prereqs: ['Series and DataFrame basics'],
        },
        {
          title: 'JSON and nested records',
          description: 'API responses and logs arrive as nested JSON; json_normalize flattens records and lists into columns, and orient options control how frames serialise back. Explode handles list-valued fields.',
          concepts: ['json.load versus pd.read_json', 'json_normalize for nesting', 'explode for list columns', 'Writing JSON lines'],
          quiz: [
            ['What does pd.json_normalize do with a nested dict?', 'Flattens it into dotted column names.'],
            ['Why use JSON lines for large logs?', 'Each line is a record, so files stream and append easily.'],
          ],
          prereqs: ['CSV, TSV and Excel files'],
        },
        {
          title: 'Parquet, Feather and Arrow',
          description: 'Columnar formats store dtypes, compress well and let readers load only the columns they need, which makes Parquet the default for anything beyond a few megabytes. Arrow is the in-memory format that lets pandas, polars and Spark share data without copying.',
          concepts: ['Columnar storage benefits', 'read_parquet and to_parquet', 'Partitioned datasets', 'pyarrow as a backend'],
          quiz: [
            ['Name two advantages of Parquet over CSV.', 'Preserved dtypes and much smaller, faster files with column selection.'],
            ['What does the pyarrow dtype backend change in pandas?', 'Columns are stored as Arrow arrays with proper null support and faster strings.'],
          ],
          prereqs: ['CSV, TSV and Excel files'],
        },
        {
          title: 'Reading from SQL databases',
          description: 'pd.read_sql runs a query through a SQLAlchemy engine and returns a frame; pushing filters and aggregations into SQL keeps memory in check. Writing back with to_sql needs care with dtypes and chunking. SQL itself is covered in track-sql.',
          concepts: ['SQLAlchemy engines and connection strings', 'read_sql with parameters', 'Filter in SQL, analyse in pandas', 'to_sql and chunksize'],
          quiz: [
            ['Why parametrise queries instead of f-strings?', 'To prevent SQL injection and quoting bugs.'],
            ['What should you do before loading a 100-million-row table into pandas?', 'Aggregate or filter it in SQL first.'],
          ],
          prereqs: ['CSV, TSV and Excel files'],
        },
        {
          title: 'Validating data on load',
          description: 'Schemas with pandera or pydantic models turn assumptions about columns, dtypes and ranges into checks that fail loudly. Validating at the boundary is far cheaper than debugging a wrong number three notebooks later.',
          concepts: ['pandera DataFrameSchema', 'pydantic models for records', 'Range and uniqueness checks', 'Failing fast versus quarantining rows'],
          quiz: [
            ['What does a pandera schema check?', 'Column presence, dtypes and value constraints on a DataFrame.'],
            ['Why validate at load rather than at the end?', 'Errors are caught near their source before they spread.'],
          ],
          prereqs: ['JSON and nested records'],
        },
      ],
    },
    {
      title: 'Visualisation',
      description: 'Seeing the data before modelling it, and communicating results afterwards.',
      topics: [
        {
          title: 'matplotlib figures and axes',
          description: 'The object-oriented API creates a Figure with one or more Axes and every plotting call targets an Axes. Learning it once instead of relying on pyplot state makes multi-panel figures and reuse straightforward.',
          concepts: ['plt.subplots and the Axes object', 'Plotting on a specific axis', 'Labels, titles, legends and grids', 'Figure size, DPI and saving'],
          quiz: [
            ['What does fig, ax = plt.subplots(2, 2) return?', 'A figure and a 2 by 2 array of axes.'],
            ['How do you save a figure at print quality?', 'fig.savefig("plot.png", dpi=300, bbox_inches="tight")'],
          ],
        },
        {
          title: 'Choosing the right chart',
          description: 'Line for trends, bar for comparisons, histogram and box for distributions, scatter for relationships, heatmap for matrices. Picking the chart from the question, then labelling axes and units, is most of good visualisation.',
          concepts: ['Trends, comparisons, distributions, relationships', 'Histograms and bin choice', 'Box and violin plots', 'Scatter plots and overplotting fixes', 'Log scales'],
          quiz: [
            ['Which chart shows the distribution of one numeric column?', 'A histogram or a box plot.'],
            ['What helps when a scatter plot is a solid blob?', 'Alpha transparency, smaller markers or a 2-D histogram.'],
          ],
          prereqs: ['matplotlib figures and axes'],
        },
        {
          title: 'seaborn statistical plots',
          description: 'seaborn takes tidy DataFrames and column names, adds statistical estimation and confidence bands, and handles hue, facets and colour palettes. It is the fastest way to explore relationships across groups.',
          concepts: ['Tidy data as input', 'hue, style and size encodings', 'FacetGrid and catplot', 'pairplot and heatmap of correlations'],
          quiz: [
            ['What does hue do in seaborn?', 'Colours marks by a categorical column.'],
            ['Which function draws small multiples by a category?', 'sns.relplot or catplot with col= or row=.'],
          ],
          prereqs: ['Choosing the right chart'],
        },
        {
          title: 'Interactive charts with plotly',
          description: 'plotly.express produces zoomable, hoverable charts from DataFrames in one call and exports to standalone HTML. It is the choice for dashboards and for exploring high-cardinality data where hovering beats labelling.',
          concepts: ['plotly.express one-liners', 'Hover data and tooltips', 'Exporting to HTML', 'When interactivity helps and hurts'],
          quiz: [
            ['How do you add extra columns to a plotly hover tooltip?', 'Pass hover_data=[...] to the express function.'],
            ['What is a downside of plotly for reports?', 'Static PDFs lose interactivity and need kaleido to export images.'],
          ],
          prereqs: ['Choosing the right chart'],
        },
        {
          title: 'Styling, annotation and figures for reports',
          description: 'Consistent colours, readable fonts, direct labels, annotated key points and removed chart junk turn a plot into an argument. Building a small helper module of styles keeps every figure in a project consistent.',
          concepts: ['Colour palettes and colour-blind safety', 'Annotations and reference lines', 'Removing chart junk', 'Reusable style helpers'],
          quiz: [
            ['Why avoid rainbow colour maps?', 'They distort perceived differences and fail for colour-blind readers.'],
            ['How do you mark a threshold on a plot?', 'ax.axhline(value) or ax.axvline(value) with a label.'],
          ],
          prereqs: ['seaborn statistical plots'],
        },
      ],
    },
    {
      title: 'Notebooks and Reproducibility',
      description: 'Notebooks are great for exploring and dangerous for delivering; here is how to have both.',
      topics: [
        {
          title: 'Jupyter and JupyterLab workflow',
          description: 'Kernels, cells, magics like %timeit and %%time, rich display of frames and figures, and keyboard shortcuts make Jupyter the fastest exploration loop. Knowing what runs where avoids most confusion.',
          concepts: ['Kernels and the execution model', 'Useful magics', 'Rich display of frames and plots', 'Keyboard-driven editing'],
          quiz: [
            ['What does %timeit do?', 'Runs an expression many times and reports the average time.'],
            ['What does restarting the kernel discard?', 'All variables and imports in memory.'],
          ],
        },
        {
          title: 'Notebook hygiene: order, state and restarts',
          description: 'Out-of-order execution and hidden state are why notebooks work for the author and fail for everyone else. Restart-and-run-all before sharing, keep cells idempotent and move stable code into modules.',
          concepts: ['Hidden state and execution order', 'Restart and run all', 'Idempotent cells', 'Moving code into modules with autoreload'],
          quiz: [
            ['Why run "Restart and Run All" before committing a notebook?', 'To prove it runs top to bottom without hidden state.'],
            ['What does %autoreload 2 do?', 'Reloads edited modules automatically so imported functions stay current.'],
          ],
          prereqs: ['Jupyter and JupyterLab workflow'],
        },
        {
          title: 'From notebook to script and module',
          description: 'Once an analysis stabilises, functions go into a package and the notebook becomes a thin driver or report. jupytext, nbconvert and papermill support this hand-off and make notebooks diffable and parametrisable.',
          concepts: ['Extracting functions from cells', 'jupytext paired scripts', 'nbconvert to execute and export', 'papermill for parametrised runs'],
          quiz: [
            ['Why are raw .ipynb files bad for code review?', 'They are JSON with outputs, so diffs are noisy.'],
            ['What does papermill add?', 'Running a notebook with injected parameters and saving the executed copy.'],
          ],
          prereqs: ['Notebook hygiene: order, state and restarts'],
        },
        {
          title: 'Seeds, determinism and environment capture',
          description: 'Reproducible results need fixed seeds in numpy, Python, torch and any library with randomness, plus a record of package versions and data versions. Nondeterministic GPU kernels are the caveat to know about.',
          concepts: ['Seeding every source of randomness', 'Recording package versions', 'Data hashes and versions', 'Limits of determinism on GPUs'],
          quiz: [
            ['Which libraries need seeding in a typical torch project?', 'random, numpy and torch, plus CUDA seeds.'],
            ['How do you capture the exact environment used?', 'pip freeze or a lock file committed alongside the results.'],
          ],
          prereqs: ['Notebook hygiene: order, state and restarts'],
        },
        {
          title: 'Sharing notebooks and results',
          description: 'Strip outputs before committing, export HTML or PDF for readers, and publish figures and tables from a script rather than screenshots. Choosing the right artefact for the audience is part of the job.',
          concepts: ['Clearing outputs with nbstripout', 'Exporting to HTML and PDF', 'Report notebooks versus exploration notebooks', 'Sharing data safely'],
          quiz: [
            ['What does nbstripout do as a git filter?', 'Removes outputs from notebooks on commit.'],
            ['Why keep exploration and report notebooks separate?', 'Reports stay clean and rerunnable while exploration stays messy.'],
          ],
          prereqs: ['From notebook to script and module'],
        },
      ],
    },
    {
      title: 'scikit-learn API Patterns',
      description: 'One consistent interface for hundreds of algorithms.',
      topics: [
        {
          title: 'The estimator API: fit, predict, transform',
          description: 'Every scikit-learn object is constructed with hyperparameters, fitted on arrays, and then predicts or transforms; fitted attributes end in an underscore. This uniformity is what lets you swap models with one line.',
          concepts: ['Constructor hyperparameters', 'fit, predict and predict_proba', 'Fitted attributes with trailing underscore', 'Input expectations: 2-D X, 1-D y'],
          quiz: [
            ['What does the trailing underscore in coef_ mean?', 'The attribute was learned during fit.'],
            ['What shape must X have?', 'Two dimensions, samples by features, even for one feature.'],
          ],
        },
        {
          title: 'Transformers and preprocessing',
          description: 'StandardScaler, OneHotEncoder, SimpleImputer and friends learn statistics with fit and apply them with transform. Fitting them on training data only, then transforming test data, is what prevents leakage.',
          concepts: ['fit_transform on train, transform on test', 'Scalers and encoders', 'Imputers', 'Getting feature names out'],
          quiz: [
            ['Why never call fit_transform on the test set?', 'It would learn statistics from the test data, leaking information.'],
            ['How do you see column names after one-hot encoding?', 'encoder.get_feature_names_out()'],
          ],
          prereqs: ['The estimator API: fit, predict, transform'],
        },
        {
          title: 'Pipeline and ColumnTransformer',
          description: 'A Pipeline chains transformers and a final estimator into one object with one fit and one predict; a ColumnTransformer applies different preprocessing to numeric and categorical columns. Together they make preprocessing part of the model.',
          concepts: ['Pipeline steps and naming', 'ColumnTransformer by column selection', 'Accessing steps and parameters', 'Pipelines inside cross-validation'],
          quiz: [
            ['Why put preprocessing inside the pipeline?', 'It is fitted per fold and per training set, so there is no leakage and one object to deploy.'],
            ['How do you set a nested parameter in a pipeline?', 'With double underscores, e.g. model__C=1.0.'],
          ],
          prereqs: ['Transformers and preprocessing'],
        },
        {
          title: 'Cross-validation and search helpers',
          description: 'cross_val_score, KFold, StratifiedKFold and GridSearchCV run the fit-evaluate loop for you and pick the best hyperparameters honestly. The detailed methodology lives in track-machine-learning; here the focus is the API.',
          concepts: ['cross_val_score and cross_validate', 'Splitter objects', 'GridSearchCV and RandomizedSearchCV', 'Scoring strings and custom scorers'],
          quiz: [
            ['What does cross_validate return that cross_val_score does not?', 'Fit times, multiple metrics and optionally train scores.'],
            ['How do you use a custom metric in GridSearchCV?', 'Wrap it with make_scorer and pass it as scoring.'],
          ],
          prereqs: ['Pipeline and ColumnTransformer'],
        },
        {
          title: 'Saving and loading models with joblib',
          description: 'joblib.dump serialises a fitted pipeline for later use; loading it requires the same library versions, so record them. Pickle files execute code on load, so only load artefacts you trust.',
          concepts: ['joblib.dump and load', 'Version pinning for artefacts', 'Security of pickle files', 'ONNX or skops as alternatives'],
          quiz: [
            ['What breaks when scikit-learn is upgraded after saving a model?', 'Loading can fail or behave differently; versions must match.'],
            ['Why is loading a pickle from an unknown source dangerous?', 'Unpickling can execute arbitrary code.'],
          ],
          prereqs: ['Pipeline and ColumnTransformer'],
        },
      ],
    },
    {
      title: 'PyTorch Basics',
      description: 'Enough PyTorch to read and run a training script; deep learning itself is its own track.',
      topics: [
        {
          title: 'Tensors and devices',
          description: 'torch.Tensor mirrors numpy arrays with a dtype and shape but can live on a GPU and track gradients. Converting to and from numpy and moving between CPU and CUDA are the everyday operations.',
          concepts: ['Creating tensors and dtypes', 'from_numpy and .numpy()', 'Moving tensors with .to(device)', 'Shape operations: view, permute, squeeze'],
          quiz: [
            ['How do you pick the GPU if available?', 'device = "cuda" if torch.cuda.is_available() else "cpu"'],
            ['Does torch.from_numpy copy the data?', 'No, it shares memory with the numpy array.'],
          ],
          prereqs: ['ndarray, dtype and shape'],
        },
        {
          title: 'Autograd essentials',
          description: 'Setting requires_grad=True records operations into a graph and loss.backward() fills .grad on every leaf. Zeroing gradients each step and using torch.no_grad for inference are the two habits that avoid subtle bugs.',
          concepts: ['requires_grad and the graph', 'backward and .grad', 'Zeroing gradients', 'no_grad and detach'],
          quiz: [
            ['Why call optimizer.zero_grad() each step?', 'Gradients accumulate by default.'],
            ['When should you wrap code in torch.no_grad()?', 'During evaluation or inference, to save memory and time.'],
          ],
          prereqs: ['Tensors and devices'],
        },
        {
          title: 'nn.Module and layers',
          description: 'A model is a class with layers declared in __init__ and computation in forward; parameters are registered automatically. nn.Sequential covers simple stacks, and torch.nn provides losses and activations.',
          concepts: ['Subclassing nn.Module', 'forward and parameter registration', 'nn.Sequential for simple stacks', 'Common layers and losses'],
          quiz: [
            ['Do you call model.forward(x) or model(x)?', 'model(x); it runs hooks and then forward.'],
            ['How do you count trainable parameters?', 'sum(p.numel() for p in model.parameters() if p.requires_grad)'],
          ],
          prereqs: ['Autograd essentials'],
        },
        {
          title: 'Datasets and DataLoader',
          description: 'A Dataset defines __len__ and __getitem__; a DataLoader batches, shuffles and loads in parallel workers. Writing one for a CSV or image folder is the first step of every PyTorch project.',
          concepts: ['Custom Dataset class', 'DataLoader batching and shuffling', 'num_workers and pin_memory', 'Collate functions'],
          quiz: [
            ['Which two methods must a map-style Dataset implement?', '__len__ and __getitem__.'],
            ['What does shuffle=True in DataLoader do?', 'Reshuffles the sample order every epoch.'],
          ],
          prereqs: ['Tensors and devices'],
        },
        {
          title: 'A minimal training loop',
          description: 'Forward, loss, backward, step, repeat over batches with an evaluation pass in eval mode. Writing this by hand once makes every high-level trainer understandable and debuggable.',
          concepts: ['The five-line training step', 'train and eval modes', 'Tracking loss and accuracy', 'Saving a state_dict'],
          quiz: [
            ['What does model.eval() change?', 'Layers like dropout and batch norm switch to inference behaviour.'],
            ['What should you save for later inference?', 'model.state_dict(), not the whole pickled object.'],
          ],
          prereqs: ['nn.Module and layers', 'Datasets and DataLoader'],
        },
      ],
    },
    {
      title: 'AI APIs and SDK Clients',
      description: 'Calling hosted models and services robustly from Python.',
      topics: [
        {
          title: 'HTTP requests with requests and httpx',
          description: 'GET and POST with headers and JSON bodies, status-code checks, timeouts and sessions cover most API work; httpx adds async and HTTP/2. REST concepts live in track-rest-api; here the focus is the Python client side.',
          concepts: ['GET, POST and JSON bodies', 'Status codes and raise_for_status', 'Sessions and connection reuse', 'httpx sync and async clients'],
          quiz: [
            ['Why always pass a timeout?', 'Without one a hung server blocks your program forever.'],
            ['What does response.raise_for_status() do?', 'Raises an exception for 4xx and 5xx responses.'],
          ],
        },
        {
          title: 'API keys and configuration',
          description: 'Secrets live in environment variables or a .env file loaded with python-dotenv, never in code or notebooks. Separate keys per environment and rotate them when a notebook leaks.',
          concepts: ['Environment variables and dotenv', 'Keeping secrets out of git', 'Per-environment configuration', 'Key rotation'],
          quiz: [
            ['How do you read an API key in Python?', 'os.environ["API_KEY"] or os.getenv with a clear error if missing.'],
            ['What should be in .gitignore for a data project?', '.env, data directories and credentials files.'],
          ],
          prereqs: ['HTTP requests with requests and httpx'],
        },
        {
          title: 'Calling an LLM API and parsing responses',
          description: 'Provider SDKs wrap a chat-style request: a list of messages, a model name and options, returning text plus usage counts. Reading tokens used and finish reasons lets you track cost and detect truncation.',
          concepts: ['Messages, roles and model selection', 'Reading text, usage and finish reason', 'System prompts as configuration', 'Handling truncated responses'],
          quiz: [
            ['What does a finish reason of "length" indicate?', 'The response hit the max token limit and was cut off.'],
            ['Why log usage.input_tokens and output_tokens?', 'To attribute cost per feature and catch prompt bloat.'],
          ],
          prereqs: ['API keys and configuration'],
        },
        {
          title: 'Streaming, retries and rate limits',
          description: 'Streaming yields tokens as they arrive for responsive UIs; retries with exponential backoff handle 429 and 5xx errors; a client-side limiter keeps you under quota. Libraries such as tenacity make the retry policy declarative.',
          concepts: ['Consuming a streamed response', 'Backoff and retry with tenacity', 'Respecting Retry-After headers', 'Concurrency with asyncio and semaphores'],
          quiz: [
            ['Which errors should be retried?', 'Transient ones: 429, 500, 502, 503, 504 and timeouts, not 400 or 401.'],
            ['How do you limit concurrent API calls in asyncio?', 'Acquire an asyncio.Semaphore around each call.'],
          ],
          prereqs: ['Calling an LLM API and parsing responses'],
        },
        {
          title: 'Structured outputs with pydantic',
          description: 'Asking a model for JSON and validating it against a pydantic model turns free text into typed data your program can trust. Validation errors become retry prompts instead of crashes.',
          concepts: ['Defining a pydantic response model', 'JSON mode and schema-guided output', 'Validating and retrying on errors', 'Typed results downstream'],
          quiz: [
            ['What does pydantic do that json.loads does not?', 'Checks types and required fields and converts values.'],
            ['What should happen on a ValidationError from model output?', 'Send the error back to the model and retry, up to a limit.'],
          ],
          prereqs: ['Calling an LLM API and parsing responses'],
        },
      ],
    },
    {
      title: 'Environments and Dependencies',
      description: 'Data projects have heavy, binary dependencies; environments must be deliberate.',
      topics: [
        {
          title: 'venv, conda and uv for data projects',
          description: 'venv plus pip covers pure-Python stacks, conda handles compiled scientific libraries and CUDA, and uv gives fast, lock-file-based installs. Picking one per project and documenting it saves onboarding pain.',
          concepts: ['When conda beats venv', 'uv for fast locked installs', 'Environment files and reproducibility', 'One environment per project'],
          quiz: [
            ['When is conda the better choice?', 'When you need compiled libraries or CUDA that pip cannot easily provide.'],
            ['What does uv sync do?', 'Installs exactly the versions in the lock file.'],
          ],
        },
        {
          title: 'Pinning and lock files',
          description: 'A requirements file with loose ranges drifts; a lock file records the exact resolved versions and hashes so results are reproducible months later. Upgrade deliberately and re-lock.',
          concepts: ['Direct versus transitive dependencies', 'Generating a lock file', 'Upgrading and re-locking', 'Separating dev and runtime dependencies'],
          quiz: [
            ['Why is numpy>=1.20 not enough for reproducibility?', 'Different installs resolve to different versions with different behaviour.'],
            ['Where do notebook-only tools like jupyter belong?', 'In a dev or optional dependency group.'],
          ],
          prereqs: ['venv, conda and uv for data projects'],
        },
        {
          title: 'CUDA, GPUs and binary packages',
          description: 'PyTorch wheels are built for specific CUDA versions and the driver must be new enough; mismatches produce cryptic errors. Checking torch.cuda.is_available and the CUDA version first saves hours.',
          concepts: ['Driver versus toolkit versions', 'Installing the right torch wheel', 'Verifying GPU availability', 'CPU-only fallbacks'],
          quiz: [
            ['How do you check which CUDA torch was built with?', 'torch.version.cuda'],
            ['What is a common cause of torch.cuda.is_available() returning False?', 'A driver too old for the CUDA version the wheel expects.'],
          ],
          prereqs: ['venv, conda and uv for data projects'],
        },
        {
          title: 'Project layout for analysis code',
          description: 'A src package for reusable code, a data directory ignored by git with a README on how to fetch it, notebooks separate from library code, and a Makefile or task runner for common steps. Structure lets others reproduce your work.',
          concepts: ['src package plus notebooks folder', 'Raw, interim and processed data', 'Config files for paths and parameters', 'Task runners for pipelines'],
          quiz: [
            ['Why keep raw data read-only?', 'So every processed result can be regenerated from the original source.'],
            ['Where should file paths live?', 'In a config file or environment variables, not hard-coded in notebooks.'],
          ],
          prereqs: ['Pinning and lock files'],
        },
      ],
    },
    {
      title: 'Performance',
      description: 'Making data code fast enough without rewriting it in another language.',
      topics: [
        {
          title: 'Profiling data code',
          description: 'Measure before optimising: %timeit for cells, cProfile and py-spy for scripts, and memory_profiler for allocations. The slow line is rarely where you expect.',
          concepts: ['Timing cells and functions', 'cProfile and snakeviz', 'py-spy on running processes', 'Memory profiling'],
          quiz: [
            ['Which tool profiles a running Python process without restarting it?', 'py-spy.'],
            ['What does %prun do?', 'Runs a statement under cProfile inside Jupyter.'],
          ],
        },
        {
          title: 'Vectorise and avoid row-wise apply',
          description: 'df.apply with axis=1 and iterrows run Python per row and are often a hundred times slower than column operations. Rewriting with vectorised expressions, np.where, string accessors and merges is the highest-value optimisation.',
          concepts: ['Why iterrows and apply are slow', 'Vectorised replacements', 'Vectorised string and datetime accessors', 'Using merge instead of lookups'],
          quiz: [
            ['What replaces a row-wise if/else in apply?', 'np.where or np.select on whole columns.'],
            ['Why is df.merge faster than a dictionary lookup per row?', 'It runs a hash join in compiled code.'],
          ],
          prereqs: ['Profiling data code', 'Filtering, sorting and derived columns'],
        },
        {
          title: 'Memory: dtypes and categoricals',
          description: 'Object columns and float64 everywhere waste memory; downcasting numerics and converting low-cardinality strings to category dtype often cuts a frame by 80% and speeds up groupby.',
          concepts: ['Measuring memory with memory_usage(deep=True)', 'Downcasting numeric columns', 'Category dtype for strings', 'Arrow-backed strings'],
          quiz: [
            ['When does category dtype help?', 'When a column has few unique values relative to its length.'],
            ['What does pd.to_numeric(col, downcast="integer") do?', 'Converts to the smallest integer dtype that fits.'],
          ],
          prereqs: ['Profiling data code'],
        },
        {
          title: 'polars for larger data',
          description: 'polars is a multi-threaded, Arrow-based DataFrame library with a lazy API that optimises whole query plans; it is often 5 to 20 times faster than pandas and uses less memory. The expression syntax differs, but the concepts map directly.',
          concepts: ['Expressions and the lazy API', 'select, filter, group_by and join', 'Reading Parquet and CSV lazily', 'Interoperating with pandas'],
          quiz: [
            ['What does polars\' lazy mode do?', 'Builds a query plan and optimises it before executing.'],
            ['How do you convert a polars frame to pandas?', 'df.to_pandas()'],
          ],
          prereqs: ['Vectorise and avoid row-wise apply'],
        },
        {
          title: 'Chunking and out-of-core processing',
          description: 'When data exceeds memory, process it in chunks with read_csv(chunksize=...), stream Parquet row groups with pyarrow, or push work to DuckDB or dask. Aggregations that can be combined across chunks are the key design constraint.',
          concepts: ['read_csv with chunksize', 'pyarrow row-group iteration', 'DuckDB queries over files', 'Combinable aggregations'],
          quiz: [
            ['Which statistic cannot be computed exactly by simple chunk combination?', 'The median; it needs all values or an approximation.'],
            ['What can DuckDB do with a folder of Parquet files?', 'Query them with SQL directly without loading into memory.'],
          ],
          prereqs: ['polars for larger data', 'Parquet, Feather and Arrow'],
        },
      ],
    },
    {
      title: 'Packaging Analysis Code',
      description: 'Turning analysis into something a colleague or a scheduler can run.',
      topics: [
        {
          title: 'From notebook to installable package',
          description: 'Move stable functions into a src package with pyproject.toml, install it in editable mode and import it from notebooks and scripts. This is the moment analysis becomes software.',
          concepts: ['pyproject.toml for a data package', 'Editable install', 'Public functions with docstrings', 'Importing from notebooks'],
          quiz: [
            ['What does pip install -e . give you?', 'An import that always reflects the current source.'],
            ['Why keep data loading functions in the package?', 'So notebooks, scripts and tests all load data the same way.'],
          ],
          prereqs: ['Project layout for analysis code'],
        },
        {
          title: 'CLI entry points and configuration',
          description: 'A typer or argparse command that runs the pipeline with parameters from a YAML or TOML config makes runs repeatable from a terminal or a scheduler without opening a notebook.',
          concepts: ['typer or argparse commands', 'Config files with pydantic-settings', 'Overriding config from the command line', 'Exit codes for schedulers'],
          quiz: [
            ['Why load config through pydantic-settings?', 'It validates types and merges environment variables with files.'],
            ['What should a failed pipeline return?', 'A non-zero exit code so the scheduler notices.'],
          ],
          prereqs: ['From notebook to installable package'],
        },
        {
          title: 'Testing data code with pytest',
          description: 'Test transformations on tiny hand-built frames, compare with pandas.testing.assert_frame_equal, and mark slow tests that need real data. Property-style checks such as row counts and no-NaN invariants catch regressions cheaply.',
          concepts: ['Fixtures with small DataFrames', 'assert_frame_equal and tolerances', 'Invariant checks on outputs', 'Marking slow and data-dependent tests'],
          quiz: [
            ['How do you compare two frames in a test?', 'pd.testing.assert_frame_equal(actual, expected)'],
            ['Why test on tiny synthetic frames?', 'They run fast and make expected outputs obvious.'],
          ],
          prereqs: ['From notebook to installable package'],
        },
        {
          title: 'Logging and reproducible runs',
          description: 'Log parameters, input hashes, row counts and timings at each stage and write outputs to a run-specific folder. When a number is questioned later, the log answers how it was produced.',
          concepts: ['Structured logging per stage', 'Run ids and output folders', 'Recording inputs and parameters', 'Idempotent reruns'],
          quiz: [
            ['What should the first log line of a pipeline contain?', 'Run id, code version, config and input data identifiers.'],
            ['Why write outputs to a folder named by run id?', 'So reruns never silently overwrite earlier results.'],
          ],
          prereqs: ['CLI entry points and configuration'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: sales analysis from raw CSVs to a report',
          description: 'Load a year of messy sales CSVs with explicit dtypes, clean and validate them with pandera, compute monthly revenue and top products with groupby, and produce a five-figure HTML report with matplotlib, all runnable from one command.',
          concepts: ['Load and validate the raw files', 'Clean and reshape with pandas', 'Aggregate and chart', 'Package as a command'],
          quiz: [
            ['Why validate before aggregating?', 'A bad row type or duplicate silently corrupts every total downstream.'],
            ['Which format should the cleaned data be saved in?', 'Parquet, to keep dtypes and speed up reruns.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: scikit-learn pipeline with evaluation',
          description: 'Build a ColumnTransformer plus gradient boosting pipeline on a tabular dataset, tune it with RandomizedSearchCV, report cross-validated metrics with confidence, save the fitted pipeline with joblib and load it in a separate prediction script.',
          concepts: ['Assemble the preprocessing pipeline', 'Tune with cross-validation', 'Report metrics honestly', 'Persist and reload'],
          quiz: [
            ['Why tune inside cross-validation?', 'To avoid selecting hyperparameters on the test set.'],
            ['What must the prediction script have to load the model?', 'The same library versions and the same feature columns.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: PyTorch image classifier with transfer learning',
          description: 'Write a Dataset for an image folder, fine-tune a pretrained torchvision ResNet on it with a hand-written training loop, evaluate on a held-out set, and save the state_dict plus a script that classifies a single image from the command line.',
          concepts: ['Dataset and transforms', 'Swap the head and train', 'Evaluate and save', 'Command-line inference'],
          quiz: [
            ['Why normalise images with ImageNet statistics?', 'The pretrained weights expect inputs in that distribution.'],
            ['What is saved with torch.save(model.state_dict())?', 'Only the parameters, which are reloaded into the same architecture.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: LLM-powered text classifier with structured output',
          description: 'Classify customer reviews into categories by calling an LLM API with a pydantic-validated JSON schema, add retries and rate limiting, cache responses on disk, and compare accuracy and cost against a TF-IDF logistic regression baseline.',
          concepts: ['Prompt and response schema', 'Robust client with caching', 'Baseline with scikit-learn', 'Compare accuracy and cost'],
          quiz: [
            ['Why cache LLM responses during development?', 'Reruns are free and deterministic instead of costing money each time.'],
            ['What does the baseline tell you?', 'Whether the LLM\'s extra cost buys meaningful accuracy.'],
          ],
          style: 'project',
        },
        {
          title: 'Python data stack interview questions',
          description: 'What interviewers ask: views versus copies, broadcasting, loc versus iloc, merge pitfalls, groupby transform, why apply is slow, pandas versus polars, seeding, and how you would load a file that does not fit in memory.',
          concepts: ['numpy semantics questions', 'pandas operation questions', 'Performance and memory questions', 'Reproducibility questions'],
          quiz: [
            ['What is the difference between loc and iloc?', 'loc selects by label, iloc by integer position.'],
            ['How would you process a 50 GB CSV on a laptop?', 'Chunk it, use polars lazy scanning or query it with DuckDB.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live pandas and numpy coding exercises',
          description: 'Timed exercises of the kind used in screens: clean a frame, compute a grouped metric, reshape wide to long, implement standardisation with broadcasting, and explain the complexity of each step while typing.',
          concepts: ['Cleaning and grouping under time', 'Reshaping on request', 'Broadcasting by hand', 'Narrating your approach'],
          quiz: [
            ['How do you standardise columns with numpy?', '(X − X.mean(axis=0)) / X.std(axis=0)'],
            ['How do you find the top 3 products per region?', 'Sort by sales then groupby("region").head(3).'],
          ],
        },
      ],
    },
  ],
})
