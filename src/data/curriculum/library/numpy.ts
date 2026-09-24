import { defineTrack } from '../define'

export const numpy = defineTrack({
  id: 'track-numpy',
  title: 'NumPy',
  description: 'The array library underneath the whole Python data stack: ndarrays and dtypes, shapes and broadcasting, boolean and fancy indexing, ufuncs and axis reductions, linear algebra, the Generator random API, memory layout and views, and how to make code run without Python loops.',
  family: 'Data Science',
  kind: 'tooling',
  icon: '🔢',
  tags: ['numpy', 'arrays', 'vectorisation', 'linear algebra', 'broadcasting', 'python'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python'],
  style: 'code',
  categories: [
    {
      title: 'Arrays and dtypes',
      description: 'What an ndarray is, how to make one, and why its dtype and shape decide everything else.',
      topics: [
        {
          title: 'Why ndarray beats the Python list',
          description: 'A list holds pointers to boxed Python objects; an ndarray holds a contiguous block of fixed-size elements with one dtype. That layout is what lets numpy hand whole-array operations to compiled C loops and SIMD, giving 10 to 100x speedups over plain loops.',
          concepts: ['Contiguous homogeneous memory', 'Boxed objects versus raw elements', 'Vectorised operations in compiled code', 'Timing a list loop against an array op'],
          quiz: [
            ['Why is np.array([1, 2, 3]) * 2 fast?', 'The multiply runs in one compiled loop over contiguous memory, not per Python object.'],
            ['Can an ndarray hold mixed Python types?', 'Only as dtype object, which loses the speed advantage.'],
          ],
        },
        {
          title: 'Creating arrays: array, zeros, arange and linspace',
          description: 'The constructors you reach for daily: np.array from nested lists, zeros, ones, full and empty for preallocation, arange for integer steps, linspace when you want an exact count of points, and eye and identity for matrices.',
          concepts: ['np.array from nested sequences', 'zeros, ones, full and empty', 'arange versus linspace', 'eye, identity and diag'],
          quiz: [
            ['How many elements does np.linspace(0, 1, 5) have?', 'Five, including both endpoints: 0, 0.25, 0.5, 0.75, 1.'],
            ['Why avoid np.arange with float steps?', 'Floating-point accumulation can produce an unexpected extra or missing element.'],
          ],
          prereqs: ['Why ndarray beats the Python list'],
        },
        {
          title: 'dtypes, casting and precision',
          description: 'int64, float32, bool, complex, datetime64 and object each have a size and rules. Type promotion decides what int + float becomes, astype converts explicitly, and float32 versus float64 is a real memory and accuracy trade-off in ML work.',
          concepts: ['Numeric dtypes and their sizes', 'Type promotion rules', 'astype and safe casting', 'Integer overflow and float precision limits'],
          quiz: [
            ['What is np.array([1, 2]).dtype on a 64-bit machine?', 'int64.'],
            ['What does np.int8(127) + np.int8(1) give?', '-128, silent overflow (with a warning in recent versions).'],
          ],
          prereqs: ['Creating arrays: array, zeros, arange and linspace'],
        },
        {
          title: 'Shape, ndim, size and strides',
          description: 'shape is the tuple of lengths per axis, ndim its length, size the element count, and strides the byte steps per axis that map an index to a memory address. Understanding strides explains why transposes are free and why some slices are views.',
          concepts: ['shape, ndim and size attributes', 'Axis numbering conventions', 'Strides and address arithmetic', 'Row-major layout intuition'],
          quiz: [
            ['What are the strides of a C-ordered (3, 4) float64 array?', '(32, 8): 4 elements times 8 bytes per row, 8 bytes per column.'],
            ['What is the shape of np.zeros(5)?', '(5,), a one-dimensional array, not (5, 1).'],
          ],
          prereqs: ['dtypes, casting and precision'],
        },
        {
          title: 'Reshaping, flattening and transposing',
          description: 'reshape reinterprets the same data under a new shape (with -1 inferring one axis), ravel and flatten unroll it, T and transpose swap axes, and squeeze and expand_dims remove or add length-1 axes needed for broadcasting.',
          concepts: ['reshape and the -1 placeholder', 'ravel versus flatten', 'transpose, T and swapaxes', 'squeeze and expand_dims'],
          quiz: [
            ['What does a.reshape(-1, 3) do?', 'Reshapes to 3 columns and as many rows as fit.'],
            ['Difference between ravel and flatten?', 'ravel returns a view when possible; flatten always copies.'],
          ],
          prereqs: ['Shape, ndim, size and strides'],
        },
      ],
    },
    {
      title: 'Indexing and Slicing',
      topics: [
        {
          title: 'Basic indexing and slices as views',
          description: 'Integer indices and start:stop:step slices work per axis and return views into the original memory, so writing to a slice writes to the source. This is a feature for performance and a trap when you expected a copy.',
          concepts: ['Per-axis integer indexing', 'Slice syntax across dimensions', 'Slices return views', 'Negative indices and steps'],
          quiz: [
            ['After b = a[:3]; b[0] = 99, is a changed?', 'Yes, b is a view of a.'],
            ['What does a[::-1] return for a 1-D array?', 'A reversed view.'],
          ],
        },
        {
          title: 'Boolean masks',
          description: 'A comparison on an array yields a bool array of the same shape; using it as an index selects the True positions and returns a copy. Combining masks with &, | and ~ (with parentheses) replaces most filtering loops.',
          concepts: ['Comparisons produce bool arrays', 'Selecting and assigning with a mask', 'Combining masks with &, | and ~', 'np.any, np.all and count_nonzero'],
          quiz: [
            ['Why does a[a > 0 and a < 5] fail?', 'Python and cannot combine arrays; use (a > 0) & (a < 5).'],
            ['How do you set negative values to zero in place?', 'a[a < 0] = 0'],
          ],
          prereqs: ['Basic indexing and slices as views'],
        },
        {
          title: 'Fancy indexing with integer arrays',
          description: 'Indexing with an array of integers gathers arbitrary elements, in any order and with repeats, and always copies. Paired index arrays pick coordinates in 2-D, and assignment through fancy indexing scatters values back.',
          concepts: ['Gathering with integer arrays', 'Paired row and column index arrays', 'Fancy indexing copies', 'Scatter assignment and duplicate indices'],
          quiz: [
            ['What does a[[2, 0, 2]] return?', 'A new array of elements 2, 0 and 2 in that order.'],
            ['What does m[[0, 1], [2, 3]] select from a 2-D array?', 'Elements (0, 2) and (1, 3), not a 2 by 2 block.'],
          ],
          prereqs: ['Basic indexing and slices as views'],
        },
        {
          title: 'Multi-dimensional indexing, Ellipsis and newaxis',
          description: 'Mixing slices, integers and index arrays across axes, the ... shortcut for "all remaining axes", and None or np.newaxis to insert an axis so shapes line up for broadcasting. np.ix_ builds the open mesh for a rectangular block.',
          concepts: ['Mixing slices and integers per axis', 'Ellipsis for remaining axes', 'newaxis to insert axes', 'np.ix_ for block selection'],
          quiz: [
            ['What shape does a[:, None] give for a (5,) array?', '(5, 1).'],
            ['How do you select rows [0, 2] and columns [1, 3] as a 2 by 2 block?', 'm[np.ix_([0, 2], [1, 3])]'],
          ],
          prereqs: ['Fancy indexing with integer arrays'],
        },
        {
          title: 'np.where, take, put and nonzero',
          description: 'np.where with three arguments is a vectorised if-else; with one it returns the indices of True. take and put gather and scatter along an axis by position, and nonzero and argwhere convert masks to coordinates for further work.',
          concepts: ['np.where as vectorised if-else', 'Finding indices with where and nonzero', 'take and put along an axis', 'argwhere for coordinate lists'],
          quiz: [
            ['What does np.where(a > 0, a, 0) return?', 'a where positive, 0 elsewhere, as a new array.'],
            ['What does np.nonzero(a) return for a 2-D array?', 'A tuple of two index arrays, one per axis.'],
          ],
          prereqs: ['Boolean masks'],
        },
      ],
    },
    {
      title: 'Broadcasting and Vectorised Math',
      topics: [
        {
          title: 'Broadcasting rules',
          description: 'Two arrays combine element-wise when, aligning shapes from the right, each axis pair is equal or one of them is 1. The size-1 axis is stretched without copying. This is how a (3, 1) column meets a (1, 4) row to make a (3, 4) table.',
          concepts: ['Right-aligned shape comparison', 'Stretching size-1 axes', 'Common broadcasting failures', 'Outer products by broadcasting'],
          quiz: [
            ['Can shapes (3, 4) and (4,) broadcast?', 'Yes, giving (3, 4).'],
            ['Can shapes (3, 4) and (3,) broadcast?', 'No; reshape the second to (3, 1) first.'],
          ],
        },
        {
          title: 'Universal functions',
          description: 'ufuncs such as np.add, np.exp and np.maximum apply element-wise with broadcasting, accept an out= argument to avoid allocation, and expose reduce, accumulate and outer methods that generalise sum, cumsum and outer product to any binary operation.',
          concepts: ['Element-wise ufunc application', 'The out parameter and allocation', 'ufunc.reduce and accumulate', 'ufunc.outer'],
          quiz: [
            ['What does np.maximum.accumulate(a) compute?', 'The running maximum along the array.'],
            ['Why pass out=a to np.multiply?', 'To write results in place and avoid allocating a temporary array.'],
          ],
          prereqs: ['Broadcasting rules'],
        },
        {
          title: 'Arithmetic, comparison and logical operators',
          description: 'Operators on arrays map to ufuncs: +, -, *, / and ** element-wise, // and % with Python floor semantics, comparisons giving bool arrays, and & | ^ ~ for bitwise logic on bools. Integer division and dtype promotion decide the result type.',
          concepts: ['Element-wise arithmetic operators', 'Floor division and modulo on arrays', 'Comparison operators to bool arrays', 'Bitwise operators on bool arrays'],
          quiz: [
            ['What dtype does np.array([1, 2]) / 2 have?', 'float64, true division always returns floats.'],
            ['What is ~np.array([True, False])?', 'array([False, True]).'],
          ],
          prereqs: ['Universal functions'],
        },
        {
          title: 'Floating-point, NaN and infinity',
          description: 'NaN propagates through arithmetic and is never equal to itself, inf appears from overflow or division by zero, and np.isclose replaces == for floats. np.errstate controls whether these raise, warn or stay silent.',
          concepts: ['NaN semantics and isnan', 'inf from overflow and division', 'isclose and allclose for comparison', 'np.errstate and warnings'],
          quiz: [
            ['What does np.nan == np.nan return?', 'False; use np.isnan.'],
            ['How do you compare two float arrays for near equality?', 'np.allclose(a, b, rtol=..., atol=...).'],
          ],
          prereqs: ['Arithmetic, comparison and logical operators'],
        },
        {
          title: 'Vectorising conditional logic with select and clip',
          description: 'Replacing if-elif chains inside loops: np.select for several conditions with fall-through order, np.clip to bound values, np.piecewise for functions by region, and masks with in-place assignment for the rest.',
          concepts: ['np.select for multi-branch conditions', 'np.clip to bound values', 'np.piecewise by region', 'Rewriting a loop with masks'],
          quiz: [
            ['How do you bucket ages into child, adult, senior without a loop?', 'np.select([age < 18, age < 65], ["child", "adult"], default="senior").'],
            ['What does np.clip(a, 0, 1) do?', 'Limits every element to the range 0 to 1.'],
          ],
          prereqs: ['Floating-point, NaN and infinity'],
        },
      ],
    },
    {
      title: 'Aggregation and Axes',
      topics: [
        {
          title: 'Reductions along an axis',
          description: 'sum, mean, min, max, std and prod collapse an axis: axis=0 reduces down the rows to a per-column result, axis=1 across the columns to a per-row result, and no axis reduces everything. Getting the axis right is the most common numpy mistake.',
          concepts: ['axis=0 versus axis=1', 'Reducing over multiple axes', 'Result shape after a reduction', 'ddof for sample standard deviation'],
          quiz: [
            ['For a (3, 4) array, what shape does a.sum(axis=0) have?', '(4,), one sum per column.'],
            ['Why does np.std differ from pandas std?', 'numpy defaults to ddof=0 (population); pandas uses ddof=1.'],
          ],
        },
        {
          title: 'keepdims and normalising by group',
          description: 'keepdims=True leaves the reduced axis as length 1 so the result broadcasts straight back against the source, which is how you subtract row means, divide by column totals or compute softmax without reshaping by hand.',
          concepts: ['keepdims for broadcast-ready results', 'Centring rows and columns', 'Row-wise normalisation', 'Numerically stable softmax'],
          quiz: [
            ['How do you divide each row by its sum?', 'a / a.sum(axis=1, keepdims=True).'],
            ['Why subtract the max before exp in softmax?', 'To avoid overflow; the result is mathematically unchanged.'],
          ],
          prereqs: ['Reductions along an axis'],
        },
        {
          title: 'Cumulative operations and differences',
          description: 'cumsum and cumprod produce running totals along an axis, diff gives consecutive differences and is the basis of returns, deltas and change detection, and np.gradient estimates derivatives on a grid.',
          concepts: ['cumsum and cumprod', 'np.diff and periods', 'Running totals to compute rolling windows', 'np.gradient for numerical derivatives'],
          quiz: [
            ['What length does np.diff(a) have for a of length n?', 'n - 1.'],
            ['How do you get a rolling sum of window 3 from a cumsum?', 'c[3:] - c[:-3], with c = cumsum padded with a leading zero.'],
          ],
          prereqs: ['Reductions along an axis'],
        },
        {
          title: 'NaN-aware aggregation, argmax and percentiles',
          description: 'A single NaN poisons sum and mean, so nanmean, nansum and nanmax exist; argmax and argmin return the position of the extreme; percentile, quantile and median summarise distributions with interpolation options that matter at small n.',
          concepts: ['nanmean, nansum and nanmax', 'argmax and argmin positions', 'percentile and quantile', 'median and interpolation methods'],
          quiz: [
            ['What does np.mean([1, np.nan, 3]) return?', 'nan; use np.nanmean for 2.0.'],
            ['What does a.argmax() return for a 2-D array?', 'The flat index; use np.unravel_index to get (row, col).'],
          ],
          prereqs: ['Reductions along an axis'],
        },
      ],
    },
    {
      title: 'Linear Algebra',
      topics: [
        {
          title: 'dot, matmul and the @ operator',
          description: 'np.dot, np.matmul and @ all multiply matrices, but they differ on 1-D vectors and stacked batches: @ treats leading axes as batch dimensions, dot does not, and a 1-D array is promoted then squeezed. Knowing which one you called avoids shape surprises.',
          concepts: ['Matrix product with @', 'dot versus matmul differences', 'Batched matrix multiplication', 'Inner and outer products'],
          quiz: [
            ['Result shape of (2, 3) @ (3, 4)?', '(2, 4).'],
            ['What is a @ b for two 1-D arrays?', 'Their inner product, a scalar.'],
          ],
        },
        {
          title: 'Solving linear systems',
          description: 'np.linalg.solve(A, b) solves Ax = b by LU factorisation and is faster and more accurate than computing the inverse. Condition numbers warn when a system is nearly singular and answers cannot be trusted.',
          concepts: ['np.linalg.solve over inverse', 'LU factorisation intuition', 'Condition number and stability', 'Singular matrices and LinAlgError'],
          quiz: [
            ['Why prefer solve(A, b) over inv(A) @ b?', 'It avoids forming the inverse, which is slower and less numerically stable.'],
            ['What does a huge condition number indicate?', 'Small input errors produce large output errors; the system is ill-conditioned.'],
          ],
          prereqs: ['dot, matmul and the @ operator'],
        },
        {
          title: 'Inverse, determinant, rank and trace',
          description: 'inv, det, matrix_rank and trace answer whether a matrix is invertible and how it scales space. Rank tells you if columns are linearly dependent, which is the numerical form of collinear features in a regression.',
          concepts: ['np.linalg.inv and when it exists', 'Determinant meaning', 'Rank and linear dependence', 'Trace and diagonal extraction'],
          quiz: [
            ['What does a determinant of zero mean?', 'The matrix is singular and has no inverse.'],
            ['Rank of a 3 by 3 matrix whose third column is the sum of the first two?', '2.'],
          ],
          prereqs: ['Solving linear systems'],
        },
        {
          title: 'Eigendecomposition and SVD',
          description: 'eig and eigh find the directions a matrix stretches and by how much; svd factors any matrix into rotations and scalings. PCA is an eigendecomposition of the covariance matrix or an SVD of the centred data, so these two calls sit under a lot of data science.',
          concepts: ['Eigenvalues and eigenvectors', 'eigh for symmetric matrices', 'Singular value decomposition', 'PCA via SVD'],
          quiz: [
            ['Why use eigh instead of eig for a covariance matrix?', 'It exploits symmetry: faster, and returns real sorted eigenvalues.'],
            ['How do you get the first principal component from an SVD of centred X?', 'The first row of Vt.'],
          ],
          prereqs: ['Inverse, determinant, rank and trace'],
        },
        {
          title: 'Norms, distances and least squares',
          description: 'np.linalg.norm gives vector and matrix norms, broadcasting computes pairwise distances without loops, and lstsq fits an overdetermined system in the least-squares sense, which is linear regression in one call.',
          concepts: ['Vector and matrix norms', 'Pairwise distances by broadcasting', 'np.linalg.lstsq', 'Linear regression by least squares'],
          quiz: [
            ['How do you compute all pairwise Euclidean distances between rows of X?', 'np.linalg.norm(X[:, None, :] - X[None, :, :], axis=-1).'],
            ['What does lstsq return besides the solution?', 'Residuals, rank and singular values.'],
          ],
          prereqs: ['dot, matmul and the @ operator'],
        },
      ],
    },
    {
      title: 'Random Numbers',
      topics: [
        {
          title: 'The Generator API and seeding',
          description: 'np.random.default_rng(seed) returns a Generator with independent state; the legacy np.random.seed global is discouraged. Passing the rng into functions keeps simulations reproducible and lets tests fix the randomness.',
          concepts: ['default_rng and Generator objects', 'Why the legacy global API is discouraged', 'Seeding for reproducibility', 'Spawning independent streams'],
          quiz: [
            ['How do you create a seeded generator?', 'rng = np.random.default_rng(42)'],
            ['Why avoid np.random.seed in library code?', 'It mutates global state that other code shares.'],
          ],
        },
        {
          title: 'Sampling from distributions',
          description: 'Generator methods draw from uniform, normal, binomial, poisson, exponential and more, with a size argument for whole arrays at once. Vectorised draws are the basis of Monte Carlo estimates and synthetic data.',
          concepts: ['random and uniform draws', 'normal, binomial and poisson samplers', 'The size argument for arrays', 'Monte Carlo estimates from samples'],
          quiz: [
            ['How do you draw a (3, 4) array of standard normals?', 'rng.standard_normal((3, 4)) or rng.normal(size=(3, 4)).'],
            ['How do you estimate P(X > 2) for a standard normal by simulation?', '(rng.standard_normal(1_000_000) > 2).mean().'],
          ],
          prereqs: ['The Generator API and seeding'],
        },
        {
          title: 'Shuffling, choice and permutation',
          description: 'rng.shuffle reorders in place, rng.permutation returns a copy, and rng.choice samples with or without replacement and with weights, which gives train/test splits, bootstrap resamples and weighted sampling in one line.',
          concepts: ['shuffle in place versus permutation', 'choice with and without replacement', 'Weighted sampling with p', 'Random train and test splits'],
          quiz: [
            ['How do you draw a bootstrap resample of an array of length n?', 'rng.choice(a, size=n, replace=True).'],
            ['What is the difference between shuffle and permutation?', 'shuffle modifies the array in place; permutation returns a shuffled copy.'],
          ],
          prereqs: ['Sampling from distributions'],
        },
        {
          title: 'Vectorised simulations',
          description: 'Instead of a loop of trials, draw a (trials, steps) matrix in one call and reduce along axes: random walks with cumsum, bootstrap distributions with choice and a statistic along axis 1, and confidence bands from percentiles.',
          concepts: ['Trials as an extra axis', 'Random walks with cumsum', 'Bootstrap distributions along an axis', 'Percentile bands from simulations'],
          quiz: [
            ['How do you simulate 1000 random walks of 500 steps at once?', 'rng.choice([-1, 1], size=(1000, 500)).cumsum(axis=1).'],
            ['How do you get a 95% band from simulated outcomes?', 'np.percentile(results, [2.5, 97.5], axis=0).'],
          ],
          prereqs: ['Shuffling, choice and permutation'],
        },
      ],
    },
    {
      title: 'Sorting, Searching and Set Operations',
      topics: [
        {
          title: 'sort, argsort and lexsort',
          description: 'np.sort returns a sorted copy and a.sort() sorts in place; argsort gives the permutation that would sort, which lets you reorder other arrays to match; lexsort sorts by several keys with the last key primary.',
          concepts: ['sort copy versus in-place sort', 'argsort to reorder related arrays', 'Sorting along an axis', 'lexsort for multi-key sorts'],
          quiz: [
            ['How do you sort names by a parallel ages array?', 'names[np.argsort(ages)]'],
            ['Which key is primary in np.lexsort((b, a))?', 'a, the last key given.'],
          ],
        },
        {
          title: 'searchsorted and binning',
          description: 'searchsorted does binary search on a sorted array to find insertion points, which turns "which bucket does this value fall in" into O(log n) per lookup. np.digitize and np.histogram build on it for binning and counting.',
          concepts: ['Binary search with searchsorted', 'Left and right side semantics', 'np.digitize for bucket assignment', 'np.histogram and bin edges'],
          quiz: [
            ['What does np.searchsorted([1, 3, 5], 4) return?', '2, the index where 4 would be inserted.'],
            ['What does np.histogram return?', 'A tuple of counts and bin edges, with one more edge than counts.'],
          ],
          prereqs: ['sort, argsort and lexsort'],
        },
        {
          title: 'unique, counts and set operations',
          description: 'np.unique returns sorted distinct values with optional counts, inverse and first indices, and in1d, isin, intersect1d, union1d and setdiff1d do set algebra on arrays, which covers most "which ids appear in both" questions.',
          concepts: ['np.unique with return_counts', 'return_inverse for label encoding', 'isin for membership tests', 'intersect1d, union1d and setdiff1d'],
          quiz: [
            ['How do you count occurrences of each value?', 'values, counts = np.unique(a, return_counts=True).'],
            ['How do you keep only rows whose id is in a list?', 'rows[np.isin(ids, wanted)]'],
          ],
          prereqs: ['sort, argsort and lexsort'],
        },
        {
          title: 'Partial sorting with partition',
          description: 'When you need the k smallest or largest values, np.partition and argpartition place the k-th element correctly in O(n) without sorting everything, which is what top-k retrieval and nearest-neighbour code should use.',
          concepts: ['partition and the k-th element', 'argpartition for top-k indices', 'Top-k without a full sort', 'Cost comparison with sort'],
          quiz: [
            ['How do you get the indices of the 5 largest values?', 'np.argpartition(a, -5)[-5:], then sort those if order matters.'],
            ['Are the k smallest values from partition sorted?', 'No, only guaranteed to be the smallest k, in any order.'],
          ],
          prereqs: ['sort, argsort and lexsort'],
        },
      ],
    },
    {
      title: 'Structured Arrays and Memory',
      topics: [
        {
          title: 'Structured and record arrays',
          description: 'A structured dtype packs named fields of different types into each element, giving a lightweight table with field access by name. They map directly to C structs and binary file formats, and are what pandas replaces for everyday work.',
          concepts: ['Defining a structured dtype', 'Field access by name', 'Reading binary records with fromfile', 'When to move to pandas'],
          quiz: [
            ['How do you define a dtype with a name and an age?', 'np.dtype([("name", "U20"), ("age", "i4")]).'],
            ['How do you get all ages from a structured array?', 'arr["age"]'],
          ],
        },
        {
          title: 'Memory layout: C order versus Fortran order',
          description: 'C order stores rows contiguously, Fortran order stores columns; flags tell you which, and it decides whether iterating along an axis touches adjacent memory. Reductions and loops aligned with the layout are several times faster.',
          concepts: ['Row-major and column-major layouts', 'The flags attribute', 'np.ascontiguousarray', 'Cache-friendly axis order'],
          quiz: [
            ['Which order does numpy use by default?', 'C order, row-major.'],
            ['Why can a.sum(axis=1) be faster than a.sum(axis=0) on a C-ordered array?', 'Row elements are adjacent in memory, so the CPU cache is used well.'],
          ],
          prereqs: ['Structured and record arrays'],
        },
        {
          title: 'Views versus copies',
          description: 'Slicing, reshape and transpose usually return views sharing memory; fancy indexing, boolean masks and most arithmetic return copies. np.shares_memory and the base attribute tell you which you have, and copy() makes the intent explicit.',
          concepts: ['Which operations return views', 'Which operations copy', 'base and shares_memory checks', 'Explicit copy for safety'],
          quiz: [
            ['Does a[a > 0] return a view?', 'No, boolean indexing always copies.'],
            ['How do you check whether b shares memory with a?', 'np.shares_memory(a, b) or b.base is a.'],
          ],
          prereqs: ['Memory layout: C order versus Fortran order'],
        },
        {
          title: 'Stacking, concatenating and splitting',
          description: 'concatenate joins along an existing axis, stack adds a new one, vstack, hstack and column_stack cover the common 2-D cases, and split, array_split and hsplit undo them. Growing an array in a loop with append is O(n squared) and should be avoided.',
          concepts: ['concatenate along an axis', 'stack versus concatenate', 'vstack, hstack and column_stack', 'split and array_split'],
          quiz: [
            ['Shape of np.stack([a, b]) for two (3,) arrays?', '(2, 3).'],
            ['Why not np.append inside a loop?', 'Every call copies the whole array; collect in a list and concatenate once.'],
          ],
          prereqs: ['Views versus copies'],
        },
        {
          title: 'Memory mapping and arrays larger than RAM',
          description: 'np.memmap maps a file on disk as an array so only touched pages load, np.save and np.load with mmap_mode read .npy files lazily, and dtype choice (float32, int16, categorical codes) often halves memory before anything cleverer is needed.',
          concepts: ['np.save, np.load and .npy files', 'memmap for on-disk arrays', 'mmap_mode lazy loading', 'Shrinking dtypes to save memory'],
          quiz: [
            ['How much memory does a (10000, 10000) float64 array need?', '800 MB.'],
            ['What does np.load(path, mmap_mode="r") do?', 'Opens the array read-only from disk without loading it all into memory.'],
          ],
          prereqs: ['Stacking, concatenating and splitting'],
        },
      ],
    },
    {
      title: 'Performance and Interoperability',
      topics: [
        {
          title: 'Eliminating Python loops',
          description: 'The recipe: express the loop body as whole-array operations, push the loop into an extra axis, replace conditionals with masks or where, and use cumsum, diff or searchsorted for sequential logic. Loops remain only for true data dependencies.',
          concepts: ['Spotting loops that vectorise', 'Adding an axis instead of looping', 'Replacing conditionals with masks', 'Loops that cannot vectorise'],
          quiz: [
            ['How do you compute the distance of every point to the origin without a loop?', 'np.sqrt((points ** 2).sum(axis=1)).'],
            ['Which pattern resists vectorisation?', 'Recurrences where step i depends on the result of step i-1 in a non-linear way.'],
          ],
        },
        {
          title: 'Timing and profiling array code',
          description: 'timeit and perf_counter measure, line_profiler locates, and the usual culprits are temporaries from chained expressions, dtype conversions, non-contiguous inputs and unnecessary copies. Reducing allocations often beats clever maths.',
          concepts: ['timeit and %timeit in notebooks', 'Temporary arrays in chained expressions', 'In-place operations to avoid allocation', 'Contiguity and dtype effects on speed'],
          quiz: [
            ['Why does a = a * 2 + 1 allocate twice?', 'a * 2 makes a temporary, then + 1 makes another.'],
            ['How do you do the same in place?', 'np.multiply(a, 2, out=a); np.add(a, 1, out=a).'],
          ],
          prereqs: ['Eliminating Python loops'],
        },
        {
          title: 'einsum and stride tricks',
          description: 'np.einsum expresses sums of products over named axes, covering transposes, traces, batched matmul and tensor contractions in one readable string. sliding_window_view creates overlapping windows as a zero-copy view for rolling computations.',
          concepts: ['einsum subscript notation', 'Common einsum patterns', 'sliding_window_view for rolling windows', 'When stride tricks are dangerous'],
          quiz: [
            ['What does np.einsum("ij,jk->ik", A, B) compute?', 'The matrix product A @ B.'],
            ['How do you compute a rolling mean of window 5 with a view?', 'sliding_window_view(a, 5).mean(axis=1).'],
          ],
          prereqs: ['Timing and profiling array code'],
        },
        {
          title: 'Interoperability with pandas',
          description: 'A DataFrame column exposes its array through .to_numpy() and .values, numpy functions accept Series directly, and 2-D arrays become DataFrames with column names. Knowing when the conversion copies keeps pipelines fast.',
          concepts: ['Series and DataFrame to_numpy', 'Passing Series to numpy functions', 'DataFrame from a 2-D array', 'Copy semantics at the boundary'],
          quiz: [
            ['Does df.to_numpy() copy?', 'Not necessarily; for a single dtype it may return a view.'],
            ['What does np.log(df["price"]) return?', 'A Series, because pandas objects implement the array protocol.'],
          ],
          prereqs: ['Eliminating Python loops'],
        },
        {
          title: 'Interoperability with PyTorch and the array API',
          description: 'torch.from_numpy shares memory with a CPU tensor and .numpy() goes back; the DLPack protocol exchanges arrays with torch, jax and cupy without copying; and the array API standard lets code run on several backends.',
          concepts: ['torch.from_numpy and tensor.numpy', 'Shared memory and dtype mapping', 'DLPack zero-copy exchange', 'The array API standard'],
          quiz: [
            ['Does torch.from_numpy(a) copy the data?', 'No, the tensor shares memory with the array on CPU.'],
            ['What must you do before calling .numpy() on a CUDA tensor?', 'Move it to CPU with .cpu().'],
          ],
          prereqs: ['Interoperability with pandas'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: NYC taxi trip statistics in pure numpy',
          description: 'Load a month of NYC taxi trips into arrays, compute fare and distance percentiles per hour of day with argsort and searchsorted binning, find the top 10 pickup zones with unique counts, and time every step against a pandas equivalent.',
          concepts: ['Load columns into typed arrays', 'Bin trips by hour with digitize', 'Aggregate by group without loops', 'Benchmark against pandas'],
          quiz: [
            ['How do you compute a per-group mean in numpy without a loop?', 'np.bincount(groups, weights=values) / np.bincount(groups).'],
            ['Why choose float32 for fares here?', 'Halves memory with more than enough precision for currency to the cent.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: image processing with arrays',
          description: 'Treat a photo as a (height, width, 3) uint8 array: convert to greyscale with a weighted dot product, crop and flip with slicing, apply blur and edge kernels with sliding_window_view, and build a histogram equaliser with cumsum.',
          concepts: ['Load an image as an array', 'Greyscale by weighted channels', 'Convolution with window views', 'Histogram equalisation with cumsum'],
          quiz: [
            ['How do you flip an image horizontally?', 'img[:, ::-1]'],
            ['Why convert uint8 to float before filtering?', 'To avoid overflow and wraparound during arithmetic.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Monte Carlo retail demand simulation',
          description: 'From retail transaction history, estimate daily demand per product, simulate 10,000 futures of 30 days with a seeded Generator, compute stockout probabilities and reorder points from percentiles, and vectorise the whole thing with no Python loop over trials.',
          concepts: ['Estimate demand distributions', 'Simulate futures on a trials axis', 'Stockout probability from simulations', 'Reorder points from percentiles'],
          quiz: [
            ['Which sampler suits daily unit sales counts?', 'Poisson or negative binomial when overdispersed.'],
            ['How do you get the probability of stockout within 30 days?', 'Fraction of trials whose cumulative demand exceeds stock at any step.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: k-nearest neighbours from scratch',
          description: 'Implement k-NN on the Titanic or iris features with broadcasting for pairwise distances, argpartition for the k nearest, bincount for votes, and an accuracy score, then compare speed and results with scikit-learn.',
          concepts: ['Standardise features with axis reductions', 'Distance matrix for k-NN', 'Top-k with argpartition', 'Majority vote with bincount'],
          quiz: [
            ['Shape of the distance matrix between m test and n train points?', '(m, n).'],
            ['Why standardise before computing distances?', 'Otherwise features with large ranges dominate the distance.'],
          ],
          style: 'project',
        },
        {
          title: 'NumPy interview questions',
          description: 'What interviewers ask: explain broadcasting with an example, views versus copies, why numpy is fast, axis semantics, the difference between dot and matmul, how you would vectorise a given loop, and what changes with float32.',
          concepts: ['Explaining broadcasting on a whiteboard', 'View and copy questions', 'Axis and shape reasoning', 'Vectorise-this-loop questions'],
          quiz: [
            ['Explain why a[::2] is a view but a[[0, 2]] is a copy.', 'Slices are describable with strides; arbitrary index lists are not.'],
            ['What is the result shape of (5, 1) + (1, 3)?', '(5, 3).'],
          ],
          style: 'reading',
        },
        {
          title: 'Array puzzles under time pressure',
          description: 'Short coding tasks that come up in screens: one-hot encode labels, compute a moving average, find the row with the most NaNs, normalise columns, replace outliers by a mask, and build a distance matrix, each in a few lines without loops.',
          concepts: ['One-hot encoding with eye', 'Moving averages with cumsum', 'Row and column statistics quickly', 'Mask-based replacement'],
          quiz: [
            ['One-hot encode integer labels 0..k-1?', 'np.eye(k)[labels]'],
            ['Which row has the most NaNs?', 'np.isnan(a).sum(axis=1).argmax()'],
          ],
        },
      ],
    },
  ],
})
