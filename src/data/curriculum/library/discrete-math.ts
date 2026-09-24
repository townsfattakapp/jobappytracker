import { defineTrack } from '../define'

export const discreteMath = defineTrack({
  id: 'track-discrete-math',
  title: 'Discrete Mathematics',
  description: 'The mathematics computer science is built on: logic and proof, sets and relations, counting, recurrences, number theory and RSA, graphs, Boolean algebra, discrete probability and a first look at automata, with every idea checked in small Python experiments.',
  family: 'Computer Science',
  kind: 'domain',
  icon: '🔢',
  tags: ['discrete mathematics', 'logic', 'proofs', 'combinatorics', 'graph theory', 'number theory', 'automata'],
  languages: ['Python'],
  explainMode: 'math',
  code: { label: 'plain-text maths with small Python checks', id: 'python', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Propositional and Predicate Logic',
      description: 'The language every definition, theorem and program specification is written in.',
      topics: [
        {
          title: 'Propositions and logical connectives',
          description: 'Statements that are true or false, the connectives not, and, or, xor, implication and biconditional, and why "p implies q" is true whenever p is false, the rule that trips up every beginner.',
          concepts: ['Propositions versus non-statements', 'Negation, conjunction and disjunction', 'Implication and its vacuous truth', 'Converse, inverse and contrapositive', 'Biconditional and exclusive or'],
          quiz: [
            ['When is p → q false?', 'Only when p is true and q is false.'],
            ['Is the converse of an implication equivalent to it?', 'No; only the contrapositive ¬q → ¬p is equivalent.'],
            ['Which connective does "unless" translate to?', 'p unless q means ¬q → p.'],
          ],
        },
        {
          title: 'Truth tables, tautologies and equivalences',
          description: 'Building a truth table for a compound proposition, spotting tautologies and contradictions, and the named equivalences (De Morgan, distributive, absorption) used to rewrite formulas without a table of 2^n rows.',
          concepts: ['Constructing truth tables', 'Tautology, contradiction and contingency', 'De Morgan and distributive laws', 'Proving equivalence by rewriting', 'Checking equivalences in Python with itertools.product'],
          quiz: [
            ['How many rows does a truth table with n variables have?', '2^n.'],
            ['State De Morgan\'s law for ¬(p ∧ q).', '¬p ∨ ¬q.'],
            ['Is p → q equivalent to ¬p ∨ q?', 'Yes; that is the standard rewrite of implication.'],
          ],
          prereqs: ['Propositions and logical connectives'],
        },
        {
          title: 'Predicates and quantifiers',
          description: 'Predicates as propositions with free variables, the universal and existential quantifiers, domains, nested quantifiers where order changes meaning, and negating quantified statements correctly.',
          concepts: ['Predicates and domains of discourse', 'Universal and existential quantifiers', 'Nested quantifiers and order', 'Negating quantified statements', 'Translating English into predicate logic'],
          quiz: [
            ['Negate ∀x P(x).', '∃x ¬P(x).'],
            ['Does ∀x ∃y L(x, y) mean the same as ∃y ∀x L(x, y)?', 'No; the second asserts one y that works for every x, which is stronger.'],
          ],
          prereqs: ['Propositions and logical connectives'],
        },
        {
          title: 'Rules of inference and valid arguments',
          description: 'Modus ponens, modus tollens, hypothetical syllogism, resolution and the quantifier instantiation rules, and how to check an argument is valid rather than merely persuasive, including the common fallacies.',
          concepts: ['Modus ponens and modus tollens', 'Hypothetical and disjunctive syllogism', 'Resolution rule', 'Universal instantiation and generalisation', 'Affirming the consequent and other fallacies'],
          quiz: [
            ['What does modus tollens conclude from p → q and ¬q?', '¬p.'],
            ['Which fallacy is: p → q, q, therefore p?', 'Affirming the consequent.'],
          ],
          prereqs: ['Predicates and quantifiers'],
        },
      ],
    },
    {
      title: 'Proof Techniques',
      description: 'How mathematicians and algorithm designers convince each other, with the same rigour a compiler demands of code.',
      topics: [
        {
          title: 'Direct proof and proof by contrapositive',
          description: 'Proving p → q by assuming p and deriving q, or by proving ¬q → ¬p when the contrapositive is easier, with the standard even/odd, divisibility and rational-number examples that appear in every exam.',
          concepts: ['Structure of a direct proof', 'Choosing the contrapositive', 'Definitions as the starting point', 'Writing proofs readers can follow'],
          quiz: [
            ['To prove "if n² is even then n is even" by contrapositive, what do you assume?', 'That n is odd, then show n² is odd.'],
            ['What must a direct proof of p → q begin with?', 'Assume p is true.'],
          ],
          prereqs: ['Rules of inference and valid arguments'],
        },
        {
          title: 'Proof by contradiction and by cases',
          description: 'Assuming the negation and deriving an impossibility, as in the classic proofs that √2 is irrational and that there are infinitely many primes, plus exhaustive case analysis and why every case must be covered.',
          concepts: ['Assuming the negation', 'Irrationality of √2', 'Infinitude of primes', 'Proof by cases and exhaustiveness', 'Existence and uniqueness proofs'],
          quiz: [
            ['What contradiction ends the proof that √2 is irrational?', 'Both p and q in the reduced fraction p/q turn out even.'],
            ['Why is a proof by cases invalid if a case is missing?', 'The conclusion has not been shown for inputs in the missing case.'],
          ],
          prereqs: ['Direct proof and proof by contrapositive'],
        },
        {
          title: 'Mathematical induction',
          description: 'The base case and inductive step, why together they cover every natural number, classic sums and inequalities, and the mistakes examiners look for: a missing base case or an inductive step that silently assumes n ≥ 2.',
          concepts: ['Base case and inductive hypothesis', 'Proving summation formulas', 'Inequalities by induction', 'Induction on divisibility claims', 'Spotting a broken induction'],
          quiz: [
            ['What does the inductive step prove?', 'That P(k) implies P(k+1) for every k at least the base.'],
            ['What is wrong with the "all horses are the same colour" proof?', 'The inductive step fails from n=1 to n=2 because the two subsets do not overlap.'],
          ],
          prereqs: ['Direct proof and proof by contrapositive'],
        },
        {
          title: 'Strong induction and well-ordering',
          description: 'Assuming P(j) for all j ≤ k rather than just P(k), which is what proofs about recursion, Fibonacci bounds and prime factorisation actually need, and the well-ordering principle that underlies both forms.',
          concepts: ['Strong induction hypothesis', 'Every integer above 1 has a prime factorisation', 'Structural induction on trees and strings', 'Well-ordering principle', 'Choosing weak versus strong induction'],
          quiz: [
            ['When do you need strong induction?', 'When P(k+1) depends on several earlier cases, not just P(k).'],
            ['What does the well-ordering principle state?', 'Every non-empty set of natural numbers has a least element.'],
          ],
          prereqs: ['Mathematical induction'],
        },
      ],
    },
    {
      title: 'Sets, Relations and Functions',
      description: 'The vocabulary for talking about collections, associations and mappings precisely.',
      topics: [
        {
          title: 'Sets and set operations',
          description: 'Roster and set-builder notation, membership versus subset, union, intersection, difference, complement and the set identities that mirror the logic laws, plus proving two sets equal by double inclusion.',
          concepts: ['Set-builder notation and membership', 'Subset versus element', 'Union, intersection, difference and complement', 'Set identities and Venn diagrams', 'Proving set equality by double inclusion'],
          quiz: [
            ['Is ∅ a subset of every set?', 'Yes, vacuously.'],
            ['How do you prove A = B?', 'Show A ⊆ B and B ⊆ A.'],
          ],
        },
        {
          title: 'Power sets, Cartesian products and cardinality',
          description: 'The set of all subsets and why it has 2^n elements, ordered pairs and Cartesian products as the foundation of relations, and counting the size of finite sets built from unions and products.',
          concepts: ['Power set and its size', 'Ordered pairs and Cartesian product', 'Cardinality of finite sets', 'Size of a union of two sets'],
          quiz: [
            ['How many elements does P({a, b, c}) have?', '8, which is 2³.'],
            ['What is |A × B| for finite sets?', '|A| times |B|.'],
          ],
          prereqs: ['Sets and set operations'],
        },
        {
          title: 'Relations and their properties',
          description: 'A relation as a subset of A × B, representing it as a matrix or digraph, and the reflexive, symmetric, antisymmetric and transitive properties that classify relations and let you check them programmatically.',
          concepts: ['Relations as sets of pairs', 'Matrix and digraph representations', 'Reflexive, symmetric and antisymmetric', 'Transitivity and closures', 'Composing relations'],
          quiz: [
            ['Can a relation be both symmetric and antisymmetric?', 'Yes, for example the equality relation.'],
            ['What is the transitive closure of a relation?', 'The smallest transitive relation containing it, computed by Warshall\'s algorithm.'],
          ],
          prereqs: ['Power sets, Cartesian products and cardinality'],
        },
        {
          title: 'Equivalence relations and partitions',
          description: 'Relations that are reflexive, symmetric and transitive, the equivalence classes they induce, and the one-to-one correspondence between equivalence relations and partitions, with congruence mod n as the running example.',
          concepts: ['Definition of an equivalence relation', 'Equivalence classes', 'Partitions of a set', 'Congruence modulo n as an equivalence'],
          quiz: [
            ['How many equivalence classes does congruence mod 5 have?', 'Five: the residues 0 to 4.'],
            ['Do distinct equivalence classes ever overlap?', 'No; they are either equal or disjoint.'],
          ],
          prereqs: ['Relations and their properties'],
        },
        {
          title: 'Partial orders and Hasse diagrams',
          description: 'Reflexive, antisymmetric, transitive relations such as divisibility and subset, drawing them as Hasse diagrams, minimal and maximal elements, lattices, and topological sorting as the computing payoff.',
          concepts: ['Partial and total orders', 'Drawing a Hasse diagram', 'Minimal, maximal, least and greatest elements', 'Lattices and bounds', 'Topological sort of a poset'],
          quiz: [
            ['Is divisibility on positive integers a total order?', 'No; 2 and 3 are incomparable.'],
            ['What does topological sorting produce?', 'A total order compatible with the partial order.'],
          ],
          prereqs: ['Relations and their properties'],
        },
        {
          title: 'Functions: injections, surjections and bijections',
          description: 'Functions as special relations, one-to-one and onto, inverses that exist only for bijections, composition, floor and ceiling, and countable versus uncountable sets via Cantor\'s diagonal argument.',
          concepts: ['Domain, codomain and image', 'Injective, surjective and bijective', 'Inverse functions and composition', 'Floor and ceiling functions', 'Countability and Cantor diagonalisation'],
          quiz: [
            ['When does a function have an inverse?', 'When it is a bijection.'],
            ['Is the set of real numbers countable?', 'No; Cantor\'s diagonal argument shows it is uncountable.'],
          ],
          prereqs: ['Relations and their properties'],
        },
      ],
    },
    {
      title: 'Counting and Combinatorics',
      description: 'Counting without listing, the skill behind complexity bounds and probability calculations.',
      topics: [
        {
          title: 'The sum and product rules',
          description: 'Counting sequential choices by multiplying and disjoint alternatives by adding, the subtraction rule for overlaps, and tree diagrams for small cases, applied to passwords, IP addresses and function counts.',
          concepts: ['Product rule for sequential choices', 'Sum rule for disjoint cases', 'Subtraction rule for overlapping cases', 'Counting strings and functions', 'Verifying counts by brute force in Python'],
          quiz: [
            ['How many 4-character passwords from 26 letters allow repeats?', '26⁴.'],
            ['How many functions are there from a 3-set to a 5-set?', '5³ = 125.'],
          ],
        },
        {
          title: 'Permutations and combinations',
          description: 'Ordered arrangements P(n, r) and unordered selections C(n, r), the factorial formulas behind them, permutations with repeated items and circular arrangements, and telling which one a word problem needs.',
          concepts: ['P(n, r) and factorials', 'C(n, r) and its symmetry', 'Permutations with indistinguishable items', 'Circular permutations', 'Order matters or not'],
          quiz: [
            ['What is C(10, 3)?', '120.'],
            ['How many arrangements of the letters in MISSISSIPPI?', '11! / (4! 4! 2!) = 34650.'],
          ],
          prereqs: ['The sum and product rules'],
        },
        {
          title: 'The binomial theorem and Pascal\'s triangle',
          description: 'Expanding (x + y)^n with binomial coefficients, Pascal\'s identity and the triangle it generates, and the identities such as the sum of a row being 2^n that fall out of counting subsets two ways.',
          concepts: ['Binomial theorem statement', 'Pascal\'s identity', 'Row sums and alternating sums', 'Vandermonde identity'],
          quiz: [
            ['What is the coefficient of x²y³ in (x + y)⁵?', 'C(5, 2) = 10.'],
            ['Why does Σ C(n, k) over k equal 2^n?', 'Both sides count all subsets of an n-element set.'],
          ],
          prereqs: ['Permutations and combinations'],
        },
        {
          title: 'Combinations with repetition and stars and bars',
          description: 'Choosing r items from n types when repeats are allowed, the stars-and-bars encoding that turns it into C(n + r - 1, r), and counting integer solutions to x₁ + ... + xₙ = r with and without lower bounds.',
          concepts: ['Stars and bars encoding', 'C(n + r - 1, r) formula', 'Integer solutions with bounds', 'Distributing identical objects into boxes'],
          quiz: [
            ['How many non-negative integer solutions has x + y + z = 10?', 'C(12, 2) = 66.'],
            ['How do you handle x ≥ 2 in such a problem?', 'Substitute x = x\' + 2 and reduce the total.'],
          ],
          prereqs: ['Permutations and combinations'],
        },
        {
          title: 'The pigeonhole principle',
          description: 'If n + 1 objects go into n boxes some box gets two, its generalised form with ceilings, and the surprisingly powerful existence proofs it gives about hash collisions, repeated remainders and monotone subsequences.',
          concepts: ['Basic and generalised pigeonhole', 'Choosing the pigeons and holes', 'Hash collisions are unavoidable', 'Erdős–Szekeres monotone subsequence'],
          quiz: [
            ['Minimum people to guarantee two share a birth month?', '13.'],
            ['Among any 5 integers, why do two have the same remainder mod 4?', 'Only 4 remainders exist for 5 numbers.'],
          ],
          prereqs: ['The sum and product rules'],
        },
        {
          title: 'The inclusion-exclusion principle',
          description: 'Counting a union by adding sizes, subtracting pairwise overlaps, adding triple overlaps and so on, with derangements and the number of onto functions as the two canonical applications.',
          concepts: ['Two-set and three-set inclusion-exclusion', 'General alternating-sum formula', 'Counting derangements', 'Counting surjections'],
          quiz: [
            ['State |A ∪ B ∪ C|.', '|A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|.'],
            ['How many derangements of 4 items?', '9.'],
          ],
          prereqs: ['Power sets, Cartesian products and cardinality', 'Permutations and combinations'],
        },
      ],
    },
    {
      title: 'Recurrence Relations',
      description: 'Describing sequences and algorithm costs by how each term depends on earlier ones, then finding closed forms.',
      topics: [
        {
          title: 'Modelling with recurrences',
          description: 'Turning a process into a recurrence: compound interest, Fibonacci rabbits, Tower of Hanoi moves and the number of bit strings with no consecutive zeros, plus iterating a recurrence in Python to guess a pattern.',
          concepts: ['Writing the recurrence and initial conditions', 'Tower of Hanoi recurrence', 'Fibonacci-style counting problems', 'Iterating to conjecture a closed form'],
          quiz: [
            ['Recurrence for Tower of Hanoi moves?', 'H(n) = 2H(n−1) + 1, H(1) = 1.'],
            ['Closed form of that recurrence?', '2^n − 1.'],
          ],
          prereqs: ['Strong induction and well-ordering'],
        },
        {
          title: 'Solving linear homogeneous recurrences',
          description: 'The characteristic equation method for constant-coefficient recurrences, distinct and repeated roots, and deriving Binet\'s formula for Fibonacci, which is why Fibonacci grows like φ^n.',
          concepts: ['Characteristic equation', 'Distinct roots solution form', 'Repeated roots and the n·rⁿ term', 'Binet\'s formula for Fibonacci'],
          quiz: [
            ['Characteristic equation of a(n) = a(n−1) + 2a(n−2)?', 'r² − r − 2 = 0, roots 2 and −1.'],
            ['Growth rate of Fibonacci numbers?', 'Θ(φⁿ) with φ ≈ 1.618.'],
          ],
          prereqs: ['Modelling with recurrences'],
        },
        {
          title: 'Divide-and-conquer recurrences',
          description: 'Recurrences of the form T(n) = aT(n/b) + f(n) that describe merge sort, binary search and Karatsuba, solving them by recursion trees and the Master theorem so the running time can be read off.',
          concepts: ['Recursion trees', 'Master theorem three cases', 'Binary search and merge sort recurrences', 'Karatsuba multiplication recurrence'],
          quiz: [
            ['What does T(n) = 2T(n/2) + n solve to?', 'Θ(n log n).'],
            ['What does T(n) = T(n/2) + 1 solve to?', 'Θ(log n).'],
          ],
          prereqs: ['Solving linear homogeneous recurrences'],
        },
      ],
    },
    {
      title: 'Number Theory and Cryptography',
      description: 'Integers, remainders and primes, from Euclid\'s algorithm to the mathematics inside public-key encryption.',
      topics: [
        {
          title: 'Divisibility and the division algorithm',
          description: 'a | b, the properties of divisibility, the unique quotient and remainder of the division algorithm, and why Python\'s % always returns a non-negative result for a positive modulus while C\'s may not.',
          concepts: ['Divisibility notation and properties', 'Division algorithm: quotient and remainder', 'Sign conventions of remainders', 'Base conversion by repeated division'],
          quiz: [
            ['What is −7 mod 3 in mathematics?', '2, because −7 = 3(−3) + 2.'],
            ['If a | b and a | c, does a | (b − c)?', 'Yes.'],
          ],
        },
        {
          title: 'GCD, the Euclidean algorithm and Bézout',
          description: 'Computing gcd(a, b) by repeated remainders in O(log) steps, the extended Euclidean algorithm that also finds x and y with ax + by = gcd, and the lcm and coprimality facts that follow.',
          concepts: ['Euclidean algorithm and its termination', 'Extended Euclidean algorithm', 'Bézout coefficients', 'lcm and the gcd·lcm identity', 'Coprime integers'],
          quiz: [
            ['What is gcd(252, 198)?', '18.'],
            ['Why does the Euclidean algorithm run in O(log min(a, b)) steps?', 'The remainder at least halves every two steps.'],
          ],
          prereqs: ['Divisibility and the division algorithm'],
        },
        {
          title: 'Modular arithmetic',
          description: 'Congruence mod m as an equivalence, adding and multiplying residues, fast modular exponentiation by repeated squaring, and why (a·b) mod m can be computed without ever forming the huge product.',
          concepts: ['Congruence and residue classes', 'Modular addition and multiplication', 'Fast exponentiation by squaring', 'Why overflow-free modular products matter'],
          quiz: [
            ['How many multiplications does repeated squaring need for a^1000?', 'About 2·log₂(1000) ≈ 20.'],
            ['Is 7 · 5 ≡ 1 (mod 17)?', 'Yes, 35 = 2·17 + 1.'],
          ],
          prereqs: ['Equivalence relations and partitions', 'Divisibility and the division algorithm'],
        },
        {
          title: 'Primes, factorisation and the sieve',
          description: 'The fundamental theorem of arithmetic, trial division up to √n, the sieve of Eratosthenes and its O(n log log n) cost, the prime number theorem as a density estimate, and why factoring large numbers is believed hard.',
          concepts: ['Fundamental theorem of arithmetic', 'Trial division to √n', 'Sieve of Eratosthenes', 'Prime density and the prime number theorem', 'Hardness of factoring'],
          quiz: [
            ['Why only test divisors up to √n?', 'Any factor above √n pairs with one below it.'],
            ['Roughly how many primes are below n?', 'About n / ln n.'],
          ],
          prereqs: ['Divisibility and the division algorithm'],
        },
        {
          title: 'Modular inverses, Fermat and Euler',
          description: 'When a has an inverse mod m and how the extended Euclidean algorithm finds it, Fermat\'s little theorem, Euler\'s totient and theorem, and the Chinese remainder theorem for solving simultaneous congruences.',
          concepts: ['Existence of modular inverses', 'Finding inverses with extended Euclid', 'Fermat\'s little theorem', 'Euler\'s totient function and theorem', 'Chinese remainder theorem'],
          quiz: [
            ['What is the inverse of 3 mod 7?', '5, because 15 ≡ 1 (mod 7).'],
            ['What is φ(15)?', '8, since φ(3)·φ(5) = 2·4.'],
          ],
          prereqs: ['GCD, the Euclidean algorithm and Bézout', 'Modular arithmetic'],
        },
        {
          title: 'RSA: the intuition and a worked example',
          description: 'Building an RSA key pair from two primes, why decryption undoes encryption by Euler\'s theorem, why the public exponent can be shared while factoring n stays hard, and a full small-number round trip in Python.',
          concepts: ['Key generation from p and q', 'Choosing e and computing d', 'Encrypt and decrypt with modular exponentiation', 'Why correctness follows from Euler', 'Security rests on factoring'],
          quiz: [
            ['What must e satisfy in RSA?', 'gcd(e, φ(n)) = 1.'],
            ['With p = 61, q = 53 and e = 17, what is d?', '2753, since 17·2753 ≡ 1 (mod 3120).'],
          ],
          prereqs: ['Modular inverses, Fermat and Euler', 'Primes, factorisation and the sieve'],
        },
      ],
    },
    {
      title: 'Graph Theory',
      description: 'Vertices and edges as the universal model for networks, dependencies, maps and state spaces.',
      topics: [
        {
          title: 'Graph terminology and representations',
          description: 'Simple, multi and directed graphs, degree and the handshaking lemma, special families (complete, bipartite, cycle, hypercube), and adjacency matrices versus lists with their memory and lookup trade-offs.',
          concepts: ['Undirected, directed and weighted graphs', 'Degree and the handshaking lemma', 'Complete, bipartite and cycle graphs', 'Adjacency matrix versus adjacency list', 'Graph isomorphism basics'],
          quiz: [
            ['Sum of degrees in a graph with 10 edges?', '20, by the handshaking lemma.'],
            ['How many edges does K₆ have?', '15.'],
          ],
          prereqs: ['Relations and their properties'],
        },
        {
          title: 'Paths, cycles and connectivity',
          description: 'Walks, trails, paths and cycles, connected components, strong and weak connectivity in digraphs, cut vertices and bridges, and how BFS or DFS answers reachability questions in linear time.',
          concepts: ['Walks, trails, paths and cycles', 'Connected components', 'Strong versus weak connectivity', 'Cut vertices and bridges', 'Reachability by BFS and DFS'],
          quiz: [
            ['What is a bridge?', 'An edge whose removal disconnects the graph.'],
            ['Minimum edges for a connected graph on n vertices?', 'n − 1.'],
          ],
          prereqs: ['Graph terminology and representations'],
        },
        {
          title: 'Euler and Hamilton paths',
          description: 'Euler\'s theorem characterising when every edge can be traversed once (all degrees even, or exactly two odd), Fleury and Hierholzer to find one, and why Hamilton cycles have no such neat test and are NP-complete.',
          concepts: ['Euler circuit and path conditions', 'Königsberg bridges', 'Hierholzer\'s algorithm', 'Hamilton paths and Dirac\'s theorem', 'Why Hamiltonicity is hard'],
          quiz: [
            ['When does a connected graph have an Euler circuit?', 'When every vertex has even degree.'],
            ['Does Dirac\'s theorem give a necessary or sufficient condition?', 'Sufficient: min degree ≥ n/2 guarantees a Hamilton cycle.'],
          ],
          prereqs: ['Paths, cycles and connectivity'],
        },
        {
          title: 'Trees and spanning trees',
          description: 'Trees as connected acyclic graphs with n − 1 edges, rooted trees and their vocabulary, counting labelled trees with Cayley\'s formula, and spanning trees found by DFS/BFS or minimised by Kruskal and Prim.',
          concepts: ['Equivalent definitions of a tree', 'Rooted trees, height and m-ary trees', 'Cayley\'s formula', 'Spanning trees by search', 'Minimum spanning trees with Kruskal and Prim'],
          quiz: [
            ['How many edges does a tree with 20 vertices have?', '19.'],
            ['Maximum leaves in a full binary tree with 15 vertices?', '8.'],
          ],
          prereqs: ['Paths, cycles and connectivity'],
        },
        {
          title: 'Graph colouring',
          description: 'Assigning colours so adjacent vertices differ, the chromatic number, greedy colouring and its bound Δ + 1, bipartite graphs as exactly the 2-colourable ones, and colouring as a model for scheduling and register allocation.',
          concepts: ['Chromatic number', 'Greedy colouring and Brooks\' bound', 'Bipartite means 2-colourable', 'Colouring for scheduling and register allocation', 'Edge colouring'],
          quiz: [
            ['Chromatic number of an odd cycle?', '3.'],
            ['How do you test if a graph is bipartite?', 'BFS 2-colouring; it fails only on an odd cycle.'],
          ],
          prereqs: ['Graph terminology and representations'],
        },
        {
          title: 'Planar graphs and Euler\'s formula',
          description: 'Graphs drawable without crossings, Euler\'s v − e + f = 2, the edge bound e ≤ 3v − 6 that proves K₅ and K₃,₃ are non-planar, Kuratowski\'s theorem and the four-colour theorem for planar maps.',
          concepts: ['Planar embeddings and faces', 'Euler\'s formula v − e + f = 2', 'Edge bounds and non-planarity of K₅ and K₃,₃', 'Kuratowski\'s theorem', 'Four-colour theorem'],
          quiz: [
            ['A connected planar simple graph with 6 vertices has at most how many edges?', '12, from e ≤ 3v − 6.'],
            ['Is K₃,₃ planar?', 'No; it violates e ≤ 2v − 4 for triangle-free planar graphs.'],
          ],
          prereqs: ['Graph colouring'],
        },
      ],
    },
    {
      title: 'Boolean Algebra',
      description: 'The algebra of true and false that becomes circuits, database predicates and compiler optimisations.',
      topics: [
        {
          title: 'Boolean functions and expressions',
          description: 'Boolean variables, the operations complement, product and sum, expressing any function of n variables as a table with 2^n rows, and counting how many distinct Boolean functions exist for a given n.',
          concepts: ['Boolean operations and precedence', 'Functions as truth tables', 'Number of Boolean functions of n variables', 'Literals, minterms and maxterms'],
          quiz: [
            ['How many Boolean functions of 3 variables exist?', '2⁸ = 256.'],
            ['What is a minterm?', 'A product containing every variable exactly once, complemented or not.'],
          ],
          prereqs: ['Truth tables, tautologies and equivalences'],
        },
        {
          title: 'Boolean identities and duality',
          description: 'The identity, complement, idempotent, absorption and De Morgan laws for Boolean algebra, the duality principle that swaps + with · and 0 with 1, and using the laws to simplify expressions by hand.',
          concepts: ['Boolean identities table', 'Absorption and consensus laws', 'Duality principle', 'Simplifying expressions algebraically'],
          quiz: [
            ['Simplify x + x·y.', 'x, by absorption.'],
            ['What is the dual of x·(y + 1) = x?', 'x + (y·0) = x.'],
          ],
          prereqs: ['Boolean functions and expressions'],
        },
        {
          title: 'Canonical forms and functional completeness',
          description: 'Sum-of-products and product-of-sums expansions from a truth table, why {AND, OR, NOT} is complete and why NAND alone suffices, and a first look at reducing terms with a Karnaugh map before the digital logic track goes deeper.',
          concepts: ['Sum-of-products expansion', 'Product-of-sums expansion', 'Functionally complete sets and NAND', 'Karnaugh map preview'],
          quiz: [
            ['Why is {NAND} functionally complete?', 'NOT, AND and OR can each be built from NAND gates alone.'],
            ['How do you read a sum-of-products from a truth table?', 'OR together the minterms of every row that outputs 1.'],
          ],
          prereqs: ['Boolean identities and duality'],
        },
      ],
    },
    {
      title: 'Discrete Probability',
      description: 'Probability over finite sample spaces, which is what randomised algorithms and hashing analyses actually use.',
      topics: [
        {
          title: 'Sample spaces and probability of events',
          description: 'Finite sample spaces with equally likely and weighted outcomes, events as subsets, the probability of unions and complements, and why counting skills from earlier categories do most of the work.',
          concepts: ['Sample spaces and events', 'Laplace probability by counting', 'Non-uniform probability distributions', 'Complement and union rules', 'Simulating events in Python'],
          quiz: [
            ['Probability of at least one six in two dice rolls?', '11/36.'],
            ['P(A ∪ B) for disjoint A and B?', 'P(A) + P(B).'],
          ],
          prereqs: ['Permutations and combinations'],
        },
        {
          title: 'Conditional probability, independence and Bayes',
          description: 'P(A | B) as restriction of the sample space, independence as P(A ∩ B) = P(A)P(B), Bayes\' theorem for inverting conditionals, and the false-positive paradox in spam filters and medical tests.',
          concepts: ['Conditional probability definition', 'Independent events', 'Bayes\' theorem', 'Base rates and the false-positive paradox', 'Bayesian spam filtering'],
          quiz: [
            ['State Bayes\' theorem.', 'P(A|B) = P(B|A)·P(A) / P(B).'],
            ['Are disjoint events with positive probability independent?', 'No; one occurring makes the other impossible.'],
          ],
          prereqs: ['Sample spaces and probability of events'],
        },
        {
          title: 'Random variables and expected value',
          description: 'Random variables as functions on the sample space, expectation and variance, the Bernoulli, binomial and geometric distributions, and computing the expected number of trials until success.',
          concepts: ['Random variables and distributions', 'Expected value and variance', 'Binomial and geometric distributions', 'Expected trials until first success'],
          quiz: [
            ['Expected number of heads in 10 fair coin flips?', '5.'],
            ['Expected rolls to get a six?', '6, the mean of a geometric distribution with p = 1/6.'],
          ],
          prereqs: ['Conditional probability, independence and Bayes'],
        },
        {
          title: 'Linearity of expectation and the probabilistic method',
          description: 'Expectation adds even when variables are dependent, which makes indicator variables the fastest way to analyse hashing, quicksort comparisons and birthday collisions, and proves existence results without constructing anything.',
          concepts: ['Indicator random variables', 'Linearity of expectation', 'Expected collisions and the birthday bound', 'Average-case analysis of quicksort', 'Probabilistic method existence proofs'],
          quiz: [
            ['Expected number of fixed points in a random permutation?', '1, regardless of n.'],
            ['Roughly how many people give a 50% chance of a shared birthday?', 'About 23.'],
          ],
          prereqs: ['Random variables and expected value'],
        },
      ],
    },
    {
      title: 'Automata and Formal Languages',
      description: 'The mathematical machines behind regular expressions, lexers and parsers.',
      topics: [
        {
          title: 'Alphabets, strings and languages',
          description: 'Alphabets, strings, the empty string, concatenation and Kleene star, languages as sets of strings and the operations on them, which is the vocabulary every later automata result is stated in.',
          concepts: ['Alphabets and strings', 'Concatenation and Kleene star', 'Languages as sets of strings', 'Operations on languages'],
          quiz: [
            ['What is Σ*?', 'The set of all finite strings over Σ, including the empty string.'],
            ['Is the empty language the same as {ε}?', 'No; one has no strings and the other has one.'],
          ],
          prereqs: ['Sets and set operations'],
        },
        {
          title: 'Deterministic and non-deterministic finite automata',
          description: 'DFAs as state machines that accept or reject strings, NFAs that may branch or take ε-moves, the subset construction proving they accept the same languages, and designing an automaton from a language description.',
          concepts: ['DFA definition and acceptance', 'Designing a DFA from a specification', 'NFAs and ε-transitions', 'Subset construction NFA to DFA', 'Simulating an automaton in Python'],
          quiz: [
            ['Are NFAs more powerful than DFAs?', 'No; every NFA has an equivalent DFA, possibly exponentially larger.'],
            ['How many states for a DFA accepting binary strings divisible by 3?', 'Three, one per remainder.'],
          ],
          prereqs: ['Alphabets, strings and languages'],
        },
        {
          title: 'Regular expressions and regular languages',
          description: 'Regular expressions as another description of the regular languages, Kleene\'s theorem linking them to automata, closure properties, and the pumping lemma for proving a language such as aⁿbⁿ is not regular.',
          concepts: ['Regular expression syntax and semantics', 'Kleene\'s theorem', 'Closure under union, concatenation and star', 'Pumping lemma for regular languages', 'Why aⁿbⁿ is not regular'],
          quiz: [
            ['Is the set of balanced parentheses regular?', 'No; a finite automaton cannot count unboundedly.'],
            ['What does the pumping lemma let you prove?', 'That a language is not regular.'],
          ],
          prereqs: ['Deterministic and non-deterministic finite automata'],
        },
        {
          title: 'Grammars and the Chomsky hierarchy',
          description: 'Phrase-structure grammars, context-free grammars generating aⁿbⁿ and arithmetic expressions, derivations and parse trees, and the hierarchy from regular to recursively enumerable that maps onto lexers, parsers and Turing machines.',
          concepts: ['Grammar productions and derivations', 'Context-free grammars and parse trees', 'Ambiguity in grammars', 'Chomsky hierarchy levels', 'Turing machines as the top level'],
          quiz: [
            ['Give a grammar for aⁿbⁿ.', 'S → aSb | ε.'],
            ['Which machine recognises context-free languages?', 'The pushdown automaton.'],
          ],
          prereqs: ['Regular expressions and regular languages'],
        },
      ],
    },
    {
      title: 'Applications to Computing',
      description: 'Where each earlier idea shows up in real programs and proofs about them.',
      topics: [
        {
          title: 'Program correctness and loop invariants',
          description: 'Hoare triples {P} S {Q}, loop invariants proved by induction on iterations, and using them to argue that binary search, insertion sort and gcd terminate with the right answer.',
          concepts: ['Hoare triples and specifications', 'Loop invariants and induction', 'Termination via a decreasing measure', 'Verifying binary search'],
          quiz: [
            ['What must a loop invariant satisfy?', 'True before the loop, preserved by each iteration, and useful at exit.'],
            ['Which measure proves the Euclidean algorithm terminates?', 'The second argument strictly decreases and is bounded below.'],
          ],
          prereqs: ['Mathematical induction'],
        },
        {
          title: 'Hashing, checksums and modular tricks',
          description: 'Polynomial rolling hashes and why a large prime modulus spreads keys, Rabin–Karp string search, Luhn and ISBN check digits, and the pigeonhole guarantee that collisions must be handled.',
          concepts: ['Polynomial rolling hash', 'Rabin–Karp substring search', 'Check digits with modular arithmetic', 'Choosing table sizes and moduli'],
          quiz: [
            ['Why choose a prime table size?', 'It reduces clustering when keys share common factors with the modulus.'],
            ['What does the Luhn algorithm check?', 'That a weighted digit sum is divisible by 10.'],
          ],
          prereqs: ['Modular arithmetic', 'The pigeonhole principle'],
        },
        {
          title: 'Graph models in software systems',
          description: 'Dependency graphs and topological build order, cycle detection for deadlock and import loops, state machines as directed graphs, and social or web graphs where degree distributions and connectivity drive design.',
          concepts: ['Dependency graphs and build order', 'Cycle detection for deadlocks', 'State diagrams as graphs', 'Web and social network graphs'],
          quiz: [
            ['What does a cycle in a dependency graph mean for a build?', 'No valid build order exists.'],
            ['Which traversal finds a topological order?', 'DFS with post-order reversal, or Kahn\'s in-degree algorithm.'],
          ],
          prereqs: ['Partial orders and Hasse diagrams', 'Paths, cycles and connectivity'],
        },
      ],
    },
    {
      title: 'Projects and Exam Preparation',
      description: 'Build the ideas into working tools, then rehearse the proofs and problems examiners and interviewers ask.',
      topics: [
        {
          title: 'Project: propositional logic toolkit',
          description: 'Write a Python parser for propositional formulas, evaluate them, generate truth tables, decide tautology and equivalence by brute force, convert to CNF, and add a simple DPLL SAT solver with unit propagation.',
          concepts: ['Parse formulas into a syntax tree', 'Evaluate and build truth tables', 'Convert to CNF', 'Implement DPLL with unit propagation', 'Test on known tautologies'],
          quiz: [
            ['Why convert to CNF before SAT solving?', 'DPLL works on clause sets and unit propagation needs clauses.'],
            ['What does unit propagation do?', 'Forces the literal of any single-literal clause and simplifies the rest.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: RSA and number theory library',
          description: 'Implement extended Euclid, modular inverse, fast exponentiation, Miller–Rabin primality testing and a sieve, then generate RSA keys with 512-bit primes and encrypt, decrypt and sign short messages, verifying each step with property tests.',
          concepts: ['Extended Euclid and modular inverse', 'Miller–Rabin primality test', 'Generate large random primes', 'RSA encrypt, decrypt and sign', 'Property tests for round trips'],
          quiz: [
            ['Why is Miller–Rabin used instead of trial division for big primes?', 'It runs in polynomial time and its error can be made negligible.'],
            ['What breaks if p and q are too close?', 'Fermat factorisation recovers them quickly.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: graph algorithms and colouring visualiser',
          description: 'Build a small graph library with adjacency lists, BFS/DFS, component and bridge detection, bipartiteness testing, greedy colouring and Kruskal MST, then render graphs and colourings as SVG and compare colour counts against known chromatic numbers.',
          concepts: ['Graph class with adjacency lists', 'Traversals, components and bridges', 'Bipartite test and greedy colouring', 'Kruskal with union-find', 'Render to SVG and check results'],
          quiz: [
            ['How does union-find help Kruskal?', 'It rejects edges that would form a cycle in near-constant time.'],
            ['Can greedy colouring exceed the chromatic number?', 'Yes, depending on vertex order.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: finite automaton simulator',
          description: 'Implement DFA and NFA classes, the subset construction, a regex-to-NFA Thompson construction and DFA minimisation, and use them to build a tiny lexer that tokenises arithmetic expressions.',
          concepts: ['DFA and NFA data structures', 'Thompson construction from regex', 'Subset construction implementation', 'DFA minimisation', 'A lexer built on the automata'],
          quiz: [
            ['What does Thompson\'s construction produce?', 'An NFA with ε-moves equivalent to the regex.'],
            ['Why minimise a DFA?', 'Fewer states mean smaller tables and faster matching.'],
          ],
          style: 'project',
        },
        {
          title: 'Exam-style proof drills',
          description: 'Timed practice on the proofs that recur in discrete maths exams: induction on sums and divisibility, contradiction on irrationality, pigeonhole existence claims, set identities by double inclusion and counting arguments explained in words.',
          concepts: ['Choosing a proof strategy quickly', 'Writing a complete induction', 'Bijective and double-counting proofs', 'Common marking-scheme deductions'],
          quiz: [
            ['What is the fastest way to prove Σ C(n, k)² = C(2n, n)?', 'Count n-subsets of a 2n-set by how many come from each half.'],
            ['What does an examiner deduct for first in an induction proof?', 'A missing or unverified base case.'],
          ],
          style: 'reading',
        },
        {
          title: 'Discrete maths interview questions',
          description: 'The questions software interviews borrow from this course: counting paths in a grid, expected values with indicator variables, modular arithmetic in hashing, why some problems are NP-hard, and explaining a graph model on a whiteboard.',
          concepts: ['Counting questions under time pressure', 'Probability puzzles with expectation', 'Number theory in system design', 'Explaining graph models aloud'],
          quiz: [
            ['How many monotone lattice paths from (0,0) to (m,n)?', 'C(m + n, m).'],
            ['Expected number of coin flips to see two heads in a row?', '6.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
