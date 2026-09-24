import { defineTrack } from '../define'

export const mathAi = defineTrack({
  id: 'track-math-ai',
  title: 'Mathematics for AI',
  description: 'The linear algebra, calculus, probability, statistics, optimisation and numerical methods that machine learning actually uses, taught by computing each idea in numpy and connecting it to the algorithm that depends on it.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '∑',
  tags: ['mathematics', 'linear algebra', 'calculus', 'probability', 'statistics', 'optimisation', 'numpy'],
  languages: ['Python'],
  explainMode: 'math',
  code: { label: 'plain-text maths with numpy checks', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Linear Algebra: Vectors and Matrices',
      description: 'Data, weights and activations are all arrays; this is the grammar for manipulating them.',
      topics: [
        {
          title: 'Vectors, norms and distances',
          description: 'A vector is an ordered list of numbers that can represent a data point, a weight set or a direction. The L1, L2 and infinity norms measure its size and give the distances that nearest-neighbour search, regularisation and loss functions rely on.',
          concepts: ['Vectors as points and directions', 'Vector addition and scaling', 'L1, L2 and infinity norms', 'Euclidean and Manhattan distance', 'Unit vectors and normalisation'],
          quiz: [
            ['What is the L2 norm of [3, 4]?', '5, the square root of 9 + 16.'],
            ['Which norm counts the sum of absolute values?', 'The L1 norm.'],
            ['How do you turn a vector into a unit vector?', 'Divide it by its L2 norm.'],
          ],
        },
        {
          title: 'Dot products, cosine similarity and projections',
          description: 'The dot product sums element-wise products and equals the product of lengths times the cosine of the angle between two vectors. It is the single operation behind neurons, attention scores, embeddings search and projections onto a direction.',
          concepts: ['Dot product as a sum of products', 'Angle and cosine similarity', 'Projection of one vector onto another', 'Orthogonality and zero dot product'],
          quiz: [
            ['What does a dot product of zero mean geometrically?', 'The vectors are perpendicular.'],
            ['Why use cosine similarity for embeddings?', 'It compares direction while ignoring vector length.'],
            ['What is the dot product of [1, 2] and [3, 4]?', '11.'],
          ],
          prereqs: ['Vectors, norms and distances'],
        },
        {
          title: 'Matrices as linear maps',
          description: 'A matrix is a function that sends vectors to vectors while preserving addition and scaling: rotations, stretches, shears and projections. A dense neural layer is exactly such a map followed by a nonlinearity.',
          concepts: ['Matrix times vector as transformation', 'Rotation, scaling and shear examples', 'Columns as images of basis vectors', 'Linear layers as matrices'],
          quiz: [
            ['What do the columns of a matrix tell you?', 'Where each basis vector is sent by the transformation.'],
            ['Is translation a linear map?', 'No, it does not send the origin to the origin.'],
          ],
          prereqs: ['Dot products, cosine similarity and projections'],
        },
        {
          title: 'Matrix multiplication and shapes',
          description: 'Multiplying an m by n matrix with an n by p matrix composes two maps and yields m by p; each entry is a dot product of a row and a column. Getting the shape rule right prevents the most common bug in every ML codebase.',
          concepts: ['Row-times-column rule', 'Shape compatibility m×n by n×p', 'Composition of transformations', 'Non-commutativity', 'Batching as an extra dimension'],
          quiz: [
            ['What shape is (3×4) times (4×2)?', '3×2.'],
            ['Is AB always equal to BA?', 'No, matrix multiplication is not commutative.'],
            ['Which numpy operator performs matrix multiplication?', 'The @ operator (np.matmul).'],
          ],
          prereqs: ['Matrices as linear maps'],
        },
        {
          title: 'Transpose, inverse and special matrices',
          description: 'Transposing swaps rows and columns; the inverse undoes a map when one exists. Identity, diagonal, symmetric and orthogonal matrices have properties that make computations cheap and stable, which is why algorithms are designed around them.',
          concepts: ['Transpose and its rules', 'Inverse and when it fails', 'Identity and diagonal matrices', 'Symmetric matrices', 'Orthogonal matrices preserve lengths'],
          quiz: [
            ['What is (AB) transposed?', 'B transposed times A transposed.'],
            ['What is the inverse of an orthogonal matrix?', 'Its transpose.'],
            ['When does a square matrix have no inverse?', 'When its determinant is zero, meaning it squashes some direction to nothing.'],
          ],
          prereqs: ['Matrix multiplication and shapes'],
        },
        {
          title: 'Linear independence, rank and solving systems',
          description: 'Rank counts how many directions a matrix really spans; dependent columns mean redundant features and no unique solution. Solving Ax = b via elimination or least squares underlies linear regression and many fitting routines.',
          concepts: ['Span and linear independence', 'Rank and redundant features', 'Solving Ax = b', 'Least squares for overdetermined systems'],
          quiz: [
            ['What does rank-deficient mean for a feature matrix?', 'Some features are exact combinations of others.'],
            ['What does np.linalg.lstsq minimise?', 'The squared norm of Ax − b.'],
          ],
          prereqs: ['Transpose, inverse and special matrices'],
        },
      ],
    },
    {
      title: 'Linear Algebra: Decompositions',
      description: 'Factoring a matrix reveals its important directions; PCA, embeddings and compression follow.',
      topics: [
        {
          title: 'Eigenvalues and eigenvectors',
          description: 'An eigenvector keeps its direction under a matrix and is only scaled by its eigenvalue. They describe the axes along which a transformation stretches, which explains covariance structure, stability of iterative methods and PageRank.',
          concepts: ['Av = λv and its meaning', 'Finding eigenpairs with np.linalg.eig', 'Eigenvalues and stretching factors', 'Repeated multiplication and dominant eigenvector'],
          quiz: [
            ['What is special about an eigenvector?', 'The matrix only scales it; its direction does not change.'],
            ['What does an eigenvalue of 0 tell you?', 'The matrix collapses that direction, so it is not invertible.'],
          ],
          prereqs: ['Linear independence, rank and solving systems'],
        },
        {
          title: 'Eigendecomposition of symmetric matrices',
          description: 'Symmetric matrices such as covariance matrices have real eigenvalues and orthogonal eigenvectors, so they factor as Q Λ Qᵀ. This is why PCA yields uncorrelated components and why positive semidefinite matrices behave well in optimisation.',
          concepts: ['Spectral theorem intuition', 'Q Λ Qᵀ factorisation', 'Positive semidefinite matrices', 'Covariance matrices as symmetric matrices'],
          quiz: [
            ['Why are covariance matrices positive semidefinite?', 'Variance along any direction, vᵀΣv, cannot be negative.'],
            ['What is np.linalg.eigh for?', 'Eigendecomposition of symmetric or Hermitian matrices, faster and more stable than eig.'],
          ],
          prereqs: ['Eigenvalues and eigenvectors'],
        },
        {
          title: 'Singular value decomposition',
          description: 'Any matrix factors as U Σ Vᵀ: a rotation, a scaling by singular values and another rotation. SVD works for rectangular matrices, ranks them by importance and is the engine behind PCA, low-rank approximation and pseudo-inverses.',
          concepts: ['U Σ Vᵀ and its three parts', 'Singular values as importance', 'SVD versus eigendecomposition', 'Pseudo-inverse via SVD'],
          quiz: [
            ['Does SVD require a square matrix?', 'No, it works for any m×n matrix.'],
            ['How do singular values relate to eigenvalues?', 'They are square roots of the eigenvalues of AᵀA.'],
          ],
          prereqs: ['Eigendecomposition of symmetric matrices'],
        },
        {
          title: 'PCA as projection onto principal directions',
          description: 'Principal component analysis centres the data, finds the eigenvectors of the covariance matrix and projects onto the top few. It reduces dimensions while keeping the most variance, which makes it a standard first step for visualisation and noise reduction.',
          concepts: ['Centring and the covariance matrix', 'Principal components as eigenvectors', 'Explained variance ratio', 'Projecting and reconstructing', 'Choosing the number of components'],
          quiz: [
            ['Why must data be centred before PCA?', 'Otherwise the first component points at the mean instead of the direction of variance.'],
            ['What does explained variance ratio measure?', 'The fraction of total variance captured by each component.'],
          ],
          prereqs: ['Singular value decomposition'],
        },
        {
          title: 'Low-rank approximation and compression',
          description: 'Keeping only the largest k singular values gives the best rank-k approximation of a matrix. This compresses images, fills recommendation matrices and is the idea behind LoRA adapters that fine-tune large models cheaply.',
          concepts: ['Truncated SVD', 'Eckart–Young optimality intuition', 'Image compression demo', 'Low-rank adapters in deep learning'],
          quiz: [
            ['How many numbers does a rank-k approximation of an m×n matrix store?', 'k(m + n + 1), far fewer than mn when k is small.'],
            ['Why does LoRA use a product of two thin matrices?', 'To represent a weight update with few parameters by assuming it is low rank.'],
          ],
          prereqs: ['Singular value decomposition'],
        },
      ],
    },
    {
      title: 'Calculus for Learning',
      description: 'Learning is following derivatives downhill; these are the derivatives.',
      topics: [
        {
          title: 'Derivatives and slopes',
          description: 'A derivative is the rate of change of a function at a point, the slope of the tangent line. It tells an optimiser which way is downhill and by how much, which is the entire basis of training by gradient descent.',
          concepts: ['Limit definition and tangent slope', 'Derivative rules: power, product, quotient', 'Derivatives of exp, log and sigmoid', 'Numerical derivative by finite differences'],
          quiz: [
            ['What is the derivative of x³?', '3x².'],
            ['What is the derivative of the sigmoid σ(x)?', 'σ(x)(1 − σ(x)).'],
            ['What does a negative derivative say about the function?', 'It is decreasing at that point.'],
          ],
        },
        {
          title: 'Partial derivatives and gradients',
          description: 'A function of many inputs has one partial derivative per input; stacking them gives the gradient, which points in the direction of steepest increase. Loss functions over millions of weights are handled exactly this way.',
          concepts: ['Partial derivative holding others fixed', 'Gradient vector and its direction', 'Directional derivatives', 'Gradient of a loss with respect to weights'],
          quiz: [
            ['What direction does the gradient point?', 'The direction of steepest increase of the function.'],
            ['Why step against the gradient?', 'To decrease the loss as fast as possible locally.'],
          ],
          prereqs: ['Derivatives and slopes'],
        },
        {
          title: 'The chain rule',
          description: 'The derivative of a composition is the product of the derivatives along the chain. Neural networks are deep compositions, so backpropagation is nothing but the chain rule applied layer by layer from the loss backwards.',
          concepts: ['Composition and the product of derivatives', 'Multivariable chain rule', 'Computational graphs', 'Backpropagation as repeated chain rule'],
          quiz: [
            ['Derivative of sin(x²)?', '2x·cos(x²).'],
            ['Why does backpropagation go backwards?', 'Each layer\'s gradient needs the gradient of everything after it.'],
          ],
          prereqs: ['Partial derivatives and gradients'],
        },
        {
          title: 'Jacobians and Hessians intuition',
          description: 'The Jacobian collects all first derivatives of a vector-valued function; the Hessian collects second derivatives of a scalar function and describes curvature. Curvature explains why some loss surfaces are hard and motivates adaptive optimisers.',
          concepts: ['Jacobian matrix of a vector function', 'Hessian and curvature', 'Saddle points and eigenvalues of the Hessian', 'Why second-order methods are rarely used at scale'],
          quiz: [
            ['What shape is the Jacobian of f: Rⁿ → Rᵐ?', 'm×n.'],
            ['What does a Hessian with mixed-sign eigenvalues indicate?', 'A saddle point.'],
          ],
          prereqs: ['The chain rule'],
        },
        {
          title: 'Gradients of vector and matrix expressions',
          description: 'ML losses are written with dot products and matrix products, so you need the gradient of xᵀAx, of ||Ax − b||² and of a linear layer with respect to its weights. Shape-checking the result catches errors before they reach code.',
          concepts: ['Gradient of a dot product', 'Gradient of a quadratic form', 'Least squares gradient 2Aᵀ(Ax − b)', 'Shape rule: gradient matches the variable'],
          quiz: [
            ['What is the gradient of wᵀx with respect to w?', 'x.'],
            ['What is the gradient of ||Ax − b||² with respect to x?', '2Aᵀ(Ax − b).'],
          ],
          prereqs: ['Partial derivatives and gradients'],
        },
        {
          title: 'Taylor expansion and local approximation',
          description: 'Near a point, a smooth function looks like its value plus gradient times step plus half the Hessian quadratic. This approximation justifies gradient descent step sizes, Newton\'s method and trust regions, and explains why large learning rates diverge.',
          concepts: ['First-order approximation', 'Second-order approximation', 'Why small steps are safe', 'Newton\'s method from the quadratic model'],
          quiz: [
            ['What does the first-order Taylor term predict?', 'The change in the function for a small step, gradient dot step.'],
            ['Why can a large learning rate make the loss increase?', 'The linear approximation stops being accurate beyond a small neighbourhood.'],
          ],
          prereqs: ['Jacobians and Hessians intuition'],
        },
      ],
    },
    {
      title: 'Probability',
      description: 'Models output probabilities and are trained under uncertainty; this is the language for both.',
      topics: [
        {
          title: 'Random variables and distributions',
          description: 'A random variable assigns numbers to outcomes; its distribution says how likely each value is via a probability mass or density function. Reading and sampling from distributions with numpy grounds every later idea in something you can plot.',
          concepts: ['Sample spaces and events', 'Discrete versus continuous variables', 'PMF, PDF and CDF', 'Sampling with numpy.random'],
          quiz: [
            ['What must a probability density integrate to?', '1 over its whole domain.'],
            ['Can a density value exceed 1?', 'Yes, densities are not probabilities; only their integrals are.'],
          ],
        },
        {
          title: 'Joint, marginal and conditional probability',
          description: 'A joint distribution covers several variables at once; marginalising sums out the ones you do not care about; conditioning fixes what you know. Independence is when conditioning changes nothing, and it is the assumption most models quietly make.',
          concepts: ['Joint distributions and tables', 'Marginalisation', 'Conditional probability', 'Independence and conditional independence'],
          quiz: [
            ['How is P(A | B) defined?', 'P(A and B) divided by P(B).'],
            ['What does independence mean in terms of the joint?', 'P(A and B) = P(A)·P(B).'],
          ],
          prereqs: ['Random variables and distributions'],
        },
        {
          title: 'Bayes\' theorem',
          description: 'Bayes\' theorem turns a likelihood and a prior into a posterior, letting you update beliefs from evidence. It explains why a positive test for a rare disease is often a false alarm and is the foundation of naive Bayes and Bayesian inference.',
          concepts: ['Prior, likelihood, posterior, evidence', 'Base-rate fallacy', 'Naive Bayes classifier', 'Sequential updating'],
          quiz: [
            ['State Bayes\' theorem.', 'P(H | E) = P(E | H)·P(H) / P(E).'],
            ['Why is a positive result on a rare condition often wrong?', 'The low prior dominates unless the test is extremely specific.'],
          ],
          prereqs: ['Joint, marginal and conditional probability'],
        },
        {
          title: 'Expectation, variance and covariance',
          description: 'Expectation is the probability-weighted average, variance the expected squared deviation, and covariance how two variables move together. Losses are expectations, feature scaling uses variance, and PCA uses the covariance matrix.',
          concepts: ['Expected value and linearity', 'Variance and standard deviation', 'Covariance and correlation', 'Estimating them from samples'],
          quiz: [
            ['What is E[aX + b]?', 'a·E[X] + b.'],
            ['What is Var(aX)?', 'a²·Var(X).'],
            ['What does correlation of −1 mean?', 'A perfect decreasing linear relationship.'],
          ],
          prereqs: ['Random variables and distributions'],
        },
        {
          title: 'Common discrete distributions',
          description: 'Bernoulli models one yes/no, binomial counts successes over trials, categorical picks one of k classes and Poisson counts rare events. Classifiers output Bernoulli and categorical distributions, so their losses come straight from these formulas.',
          concepts: ['Bernoulli and binomial', 'Categorical and one-hot', 'Poisson for counts', 'Matching a distribution to an output type'],
          quiz: [
            ['What is the mean of a binomial(n, p)?', 'n·p.'],
            ['Which distribution does a softmax output describe?', 'A categorical distribution over k classes.'],
          ],
          prereqs: ['Expectation, variance and covariance'],
        },
        {
          title: 'Common continuous distributions',
          description: 'Uniform, normal (Gaussian), exponential and beta distributions cover initialisation, noise, waiting times and probabilities of probabilities. The normal distribution\'s role in the central limit theorem is why it appears everywhere.',
          concepts: ['Uniform distribution', 'Normal distribution and the 68–95–99.7 rule', 'Multivariate normal and covariance', 'Exponential and beta distributions'],
          quiz: [
            ['What fraction of a normal lies within two standard deviations?', 'About 95%.'],
            ['What does the covariance matrix of a multivariate normal control?', 'The shape and orientation of its elliptical contours.'],
          ],
          prereqs: ['Expectation, variance and covariance'],
        },
        {
          title: 'Entropy, cross-entropy and KL divergence',
          description: 'Entropy measures the uncertainty of a distribution, cross-entropy the cost of encoding one distribution with another, and KL divergence their difference. Cross-entropy loss is what classifiers and language models minimise.',
          concepts: ['Entropy in bits and nats', 'Cross-entropy as a loss', 'KL divergence and its asymmetry', 'Log-likelihood connection'],
          quiz: [
            ['What is the entropy of a fair coin in bits?', '1 bit.'],
            ['Why is KL divergence not a distance?', 'It is not symmetric: KL(P||Q) ≠ KL(Q||P).'],
            ['How does cross-entropy relate to negative log-likelihood?', 'Minimising cross-entropy against one-hot labels is maximising log-likelihood.'],
          ],
          prereqs: ['Common discrete distributions'],
        },
      ],
    },
    {
      title: 'Statistics',
      description: 'From a sample to a claim about the world, with honest uncertainty.',
      topics: [
        {
          title: 'Samples, estimators and bias',
          description: 'A statistic computed from a sample estimates a population quantity; it can be biased, noisy or both. Recognising that a validation score is itself an estimate with variance prevents overreacting to small differences.',
          concepts: ['Population versus sample', 'Estimator bias and variance', 'Sample mean and sample variance', 'Standard error'],
          quiz: [
            ['Why divide by n − 1 in the sample variance?', 'To make it an unbiased estimate of the population variance.'],
            ['How does the standard error of the mean shrink with sample size?', 'Proportionally to 1/√n.'],
          ],
          prereqs: ['Expectation, variance and covariance'],
        },
        {
          title: 'Maximum likelihood estimation',
          description: 'MLE picks the parameters that make the observed data most probable, usually by maximising the log-likelihood. Least squares, logistic regression and cross-entropy training are all MLE under a specific noise model.',
          concepts: ['Likelihood and log-likelihood', 'Solving MLE for a Gaussian mean', 'Least squares as Gaussian MLE', 'Logistic regression as Bernoulli MLE'],
          quiz: [
            ['Why maximise the log-likelihood instead of the likelihood?', 'Products become sums, which are numerically stable and easier to differentiate.'],
            ['Under what noise assumption is least squares the MLE?', 'Gaussian noise with constant variance.'],
          ],
          prereqs: ['Samples, estimators and bias', 'Entropy, cross-entropy and KL divergence'],
        },
        {
          title: 'Law of large numbers and the central limit theorem',
          description: 'Averages converge to expectations as samples grow, and the distribution of an average becomes normal regardless of the source distribution. This justifies mini-batch gradient estimates and confidence intervals on metrics.',
          concepts: ['Law of large numbers', 'Central limit theorem', 'Simulating convergence in numpy', 'Mini-batches as noisy estimates'],
          quiz: [
            ['What does the central limit theorem say about the sample mean?', 'It is approximately normal for large n, whatever the underlying distribution.'],
            ['Why is a mini-batch gradient an unbiased estimate?', 'Its expectation over random batches equals the full gradient.'],
          ],
          prereqs: ['Samples, estimators and bias'],
        },
        {
          title: 'Confidence intervals',
          description: 'A confidence interval gives a range that would contain the true value in a stated fraction of repeated experiments. Reporting an interval on accuracy or an A/B lift, and bootstrapping when formulas do not apply, keeps conclusions honest.',
          concepts: ['Interval for a mean', 'Interval for a proportion', 'Bootstrap intervals', 'Interpreting 95% correctly'],
          quiz: [
            ['What does a 95% confidence interval mean?', 'The procedure captures the true value in 95% of repeated samples.'],
            ['What is the bootstrap?', 'Resampling the data with replacement to estimate the variability of a statistic.'],
          ],
          prereqs: ['Law of large numbers and the central limit theorem'],
        },
        {
          title: 'Hypothesis testing and p-values',
          description: 'A test asks whether observed data would be surprising under a null hypothesis; the p-value quantifies that surprise. Used correctly it decides whether model B really beats model A; misused it manufactures results.',
          concepts: ['Null and alternative hypotheses', 'p-values and significance level', 'Type I and type II errors', 't-tests and permutation tests', 'Multiple comparisons'],
          quiz: [
            ['What is a p-value?', 'The probability of data at least this extreme if the null hypothesis were true.'],
            ['Why is running many tests and reporting the best one a problem?', 'Some will be significant by chance; corrections such as Bonferroni are needed.'],
          ],
          prereqs: ['Confidence intervals'],
        },
        {
          title: 'Correlation, causation and confounding',
          description: 'Correlation measures linear association, not cause; confounders and selection can flip conclusions, as Simpson\'s paradox shows. Knowing when data supports causal claims separates analysis from storytelling.',
          concepts: ['Pearson and Spearman correlation', 'Confounders and spurious correlation', 'Simpson\'s paradox', 'Randomised experiments as the fix'],
          quiz: [
            ['Does a correlation of 0 mean independence?', 'No, only no linear relationship.'],
            ['What is Simpson\'s paradox?', 'A trend that appears in groups reverses when the groups are combined.'],
          ],
          prereqs: ['Expectation, variance and covariance'],
        },
      ],
    },
    {
      title: 'Optimisation',
      description: 'How a loss and a gradient become trained weights.',
      topics: [
        {
          title: 'Loss landscapes and convexity',
          description: 'A loss function over parameters defines a surface; convex surfaces have one minimum, while neural network losses have many valleys and saddles. Knowing the shape tells you whether gradient descent is guaranteed to work or merely usually works.',
          concepts: ['Loss as a function of parameters', 'Convex functions and global minima', 'Local minima and saddles', 'Plotting a 2D loss surface'],
          quiz: [
            ['Is mean squared error in linear regression convex?', 'Yes, it is a quadratic bowl in the weights.'],
            ['Why is convexity a big deal for optimisation?', 'Any local minimum is the global minimum.'],
          ],
          prereqs: ['Partial derivatives and gradients'],
        },
        {
          title: 'Gradient descent',
          description: 'Repeatedly step against the gradient scaled by a learning rate until the loss stops falling. Implementing it by hand for linear regression makes every later optimiser a small variation instead of magic.',
          concepts: ['The update rule w ← w − η∇L', 'Convergence on a quadratic', 'Stopping criteria', 'Implementing it in numpy'],
          quiz: [
            ['Write the gradient descent update.', 'w = w − learning_rate × gradient.'],
            ['What happens with a learning rate of zero?', 'The weights never change.'],
          ],
          prereqs: ['Loss landscapes and convexity'],
        },
        {
          title: 'Learning rates and schedules',
          description: 'Too small a learning rate crawls, too large diverges, and the best value changes during training. Warm-up, step decay and cosine schedules trade exploration early for precision late.',
          concepts: ['Diverging versus crawling', 'Learning-rate range tests', 'Step, exponential and cosine decay', 'Warm-up for large models'],
          quiz: [
            ['What does a loss that oscillates and grows suggest?', 'The learning rate is too high.'],
            ['Why warm up the learning rate?', 'Early gradients are noisy; small initial steps avoid blowing up the weights.'],
          ],
          prereqs: ['Gradient descent', 'Taylor expansion and local approximation'],
        },
        {
          title: 'Stochastic and mini-batch gradient descent',
          description: 'Computing the gradient on a random subset gives a noisy but cheap estimate that scales to huge datasets and often generalises better. Batch size trades gradient noise against hardware utilisation.',
          concepts: ['Full-batch versus stochastic gradients', 'Mini-batch size trade-offs', 'Epochs and shuffling', 'Noise as implicit regularisation'],
          quiz: [
            ['Why shuffle data each epoch?', 'So batches are not correlated and the gradient estimate stays unbiased.'],
            ['What does a larger batch do to gradient noise?', 'Reduces it, roughly with the square root of the batch size.'],
          ],
          prereqs: ['Gradient descent', 'Law of large numbers and the central limit theorem'],
        },
        {
          title: 'Momentum, RMSProp and Adam',
          description: 'Momentum accumulates past gradients to push through flat regions and damp oscillation; RMSProp scales each parameter by its recent gradient size; Adam combines both. These are the optimisers actually used to train deep networks.',
          concepts: ['Momentum as a velocity term', 'Per-parameter scaling in RMSProp', 'Adam update and bias correction', 'Choosing an optimiser'],
          quiz: [
            ['What problem does momentum solve?', 'Slow progress along shallow directions and zig-zagging across steep ones.'],
            ['Why does Adam bias-correct its moving averages?', 'Early averages are biased toward zero because they start at zero.'],
          ],
          prereqs: ['Stochastic and mini-batch gradient descent'],
        },
        {
          title: 'Regularisation as a penalty on weights',
          description: 'Adding λ||w||² (L2) or λ||w||₁ (L1) to the loss shrinks weights toward zero, reducing variance and, for L1, producing sparse solutions. Weight decay in deep learning is the same idea applied in the optimiser step.',
          concepts: ['L2 penalty and ridge regression', 'L1 penalty and sparsity', 'Geometry of the L1 and L2 balls', 'Weight decay in the update rule'],
          quiz: [
            ['Why does L1 produce sparse weights?', 'Its diamond-shaped constraint region has corners on the axes where solutions land.'],
            ['What is the gradient of the L2 penalty λ||w||²?', '2λw.'],
          ],
          prereqs: ['Gradient descent'],
        },
        {
          title: 'Constrained optimisation and Lagrange multipliers',
          description: 'Many ML problems optimise under constraints, such as SVM margins or probability vectors summing to one. Lagrange multipliers turn a constrained problem into an unconstrained one and reveal why penalties and constraints are two views of the same thing.',
          concepts: ['Equality constraints and the Lagrangian', 'Interpreting the multiplier', 'Penalty versus constraint duality', 'KKT conditions intuition'],
          quiz: [
            ['What does the Lagrangian combine?', 'The objective plus each constraint multiplied by a multiplier.'],
            ['How does an L2 penalty relate to a norm constraint?', 'Each penalty strength corresponds to some constraint radius and vice versa.'],
          ],
          prereqs: ['Regularisation as a penalty on weights'],
        },
      ],
    },
    {
      title: 'Numerical Methods',
      description: 'Why correct maths still produces NaN, and how to make it fast and stable.',
      topics: [
        {
          title: 'Floating-point representation and error',
          description: 'float32 and float64 store a sign, exponent and mantissa, so they cannot represent most decimals and lose precision when adding numbers of very different sizes. Knowing the limits explains 0.1 + 0.2, overflow to inf and why float16 training needs care.',
          concepts: ['Sign, exponent and mantissa', 'Machine epsilon and rounding', 'Overflow, underflow and NaN', 'float16, bfloat16, float32, float64'],
          quiz: [
            ['What is machine epsilon for float32 roughly?', 'About 1.2 × 10⁻⁷.'],
            ['Why does bfloat16 keep float32\'s exponent range?', 'To avoid overflow and underflow in training even though it has fewer mantissa bits.'],
          ],
        },
        {
          title: 'Numerical stability: log-sum-exp and softmax',
          description: 'Exponentiating large logits overflows and small probabilities underflow to zero before the log. Subtracting the maximum before exp and working in log space are the tricks every framework uses to keep softmax and cross-entropy finite.',
          concepts: ['Overflow in naive softmax', 'The log-sum-exp trick', 'Log-space probabilities', 'Numerically safe cross-entropy'],
          quiz: [
            ['Why subtract the max before computing softmax?', 'It prevents overflow and leaves the result unchanged.'],
            ['What does log-sum-exp compute?', 'log Σ exp(xᵢ), stably.'],
          ],
          prereqs: ['Floating-point representation and error', 'Entropy, cross-entropy and KL divergence'],
        },
        {
          title: 'Conditioning and ill-posed problems',
          description: 'A large condition number means small input changes cause huge output changes, so inverting a nearly singular matrix amplifies noise. Feature scaling, regularisation and avoiding explicit inverses keep computations well conditioned.',
          concepts: ['Condition number of a matrix', 'Why not to invert matrices explicitly', 'Feature scaling and conditioning', 'Ridge as a conditioning fix'],
          quiz: [
            ['What does a huge condition number warn about?', 'Solutions will be very sensitive to rounding and noise.'],
            ['Why prefer np.linalg.solve over np.linalg.inv?', 'It is faster and more accurate; it never forms the inverse.'],
          ],
          prereqs: ['Transpose, inverse and special matrices', 'Floating-point representation and error'],
        },
        {
          title: 'Vectorisation and broadcasting in numpy',
          description: 'Expressing maths as whole-array operations runs in compiled loops that are orders of magnitude faster than Python loops, and broadcasting lets shapes like (n, 1) and (1, m) combine without copies. This is how every formula in this track becomes fast code.',
          concepts: ['Replacing loops with array operations', 'Broadcasting rules', 'Pairwise distances without loops', 'Einsum for index gymnastics'],
          quiz: [
            ['Can arrays of shape (3, 1) and (1, 4) be added?', 'Yes, broadcasting gives shape (3, 4).'],
            ['Why is a numpy loop over rows slow?', 'Each iteration goes through the Python interpreter instead of compiled code.'],
          ],
          prereqs: ['Matrix multiplication and shapes'],
        },
        {
          title: 'Gradient checking',
          description: 'Comparing an analytic gradient against a finite-difference estimate catches derivation and implementation mistakes before a model silently trains badly. It is the unit test for every hand-written gradient.',
          concepts: ['Central finite differences', 'Relative error tolerance', 'Checking a few random components', 'Why float64 is needed for the check'],
          quiz: [
            ['Why use the central difference instead of the forward one?', 'Its error shrinks with h² instead of h.'],
            ['What relative error suggests a correct gradient?', 'Around 1e-7 in float64; 1e-2 or worse means a bug.'],
          ],
          prereqs: ['Derivatives and slopes', 'Floating-point representation and error'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: PCA on face or digit images from scratch',
          description: 'Implement PCA with numpy only: centre a dataset of small images, compute the covariance or SVD, plot explained variance, show the top components as images and reconstruct samples with 10, 50 and 200 components, then compare against scikit-learn.',
          concepts: ['Load and centre the images', 'Compute components via SVD', 'Plot variance and eigen-images', 'Reconstruct and compare'],
          quiz: [
            ['Why use SVD of the data matrix rather than eig of the covariance?', 'It is more stable and avoids forming a large covariance matrix.'],
            ['What happens to reconstruction error as components increase?', 'It falls monotonically to zero at full rank.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: linear regression by gradient descent',
          description: 'Derive the MSE gradient, implement batch and mini-batch gradient descent in numpy, add L2 regularisation, verify with gradient checking, plot loss against learning rate, and match the closed-form least-squares solution.',
          concepts: ['Derive and implement the gradient', 'Add mini-batches and L2', 'Verify with gradient checking', 'Compare to the closed form'],
          quiz: [
            ['What is the closed-form solution to least squares?', 'w = (XᵀX)⁻¹Xᵀy, computed with solve or lstsq.'],
            ['How do you know the learning rate is too high?', 'The loss curve rises or oscillates instead of decreasing.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: naive Bayes spam filter from counts',
          description: 'Build a multinomial naive Bayes text classifier by hand: count words per class, apply Laplace smoothing, compute log posteriors, classify held-out messages, and study how smoothing and priors change precision and recall.',
          concepts: ['Tokenise and count per class', 'Smooth and compute log-probabilities', 'Classify with Bayes in log space', 'Analyse errors and priors'],
          quiz: [
            ['Why work with log-probabilities?', 'Products of many small probabilities underflow to zero.'],
            ['What does Laplace smoothing prevent?', 'A zero probability for a word never seen in a class.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: logistic regression with Adam and calibration',
          description: 'Implement logistic regression with cross-entropy loss, train it with SGD, momentum and Adam, compare their convergence curves, check gradients numerically, and plot a calibration curve of predicted probabilities against outcomes.',
          concepts: ['Implement the loss and gradient', 'Train with three optimisers', 'Compare convergence', 'Plot calibration'],
          quiz: [
            ['What is the gradient of cross-entropy for logistic regression?', 'Xᵀ(σ(Xw) − y) / n.'],
            ['What does a calibration curve show?', 'Whether predicted probabilities match observed frequencies.'],
          ],
          style: 'project',
        },
        {
          title: 'Maths interview questions for AI roles',
          description: 'The questions that come up: explain PCA and SVD, derive the logistic regression gradient, why cross-entropy, what an eigenvector is, Bayes with base rates, bias versus variance, and why Adam beats plain SGD.',
          concepts: ['Linear algebra explanations', 'Derivation questions', 'Probability puzzles', 'Optimisation intuition questions'],
          quiz: [
            ['Explain PCA in one sentence.', 'Rotate the data to the directions of largest variance and keep the top few.'],
            ['Why is cross-entropy preferred over MSE for classification?', 'It matches the likelihood of a categorical output and gives larger gradients when confidently wrong.'],
          ],
          style: 'reading',
        },
        {
          title: 'Whiteboard derivations under pressure',
          description: 'Practise writing short, correct derivations aloud: the gradient of a least-squares loss, the softmax derivative, the MLE of a Gaussian mean and the update rule for momentum, keeping shapes explicit at each step.',
          concepts: ['State shapes before deriving', 'Derive least squares and softmax', 'Explain each step aloud', 'Check the result with a tiny numpy example'],
          quiz: [
            ['What is the derivative of softmax output i with respect to logit j?', 'sᵢ(δᵢⱼ − sⱼ).'],
            ['What is the MLE of a Gaussian mean?', 'The sample mean.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
