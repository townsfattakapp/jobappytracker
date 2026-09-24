import { defineTrack } from '../define'

export const scala = defineTrack({
  id: 'track-scala',
  title: 'Scala',
  description: 'Scala 3 as a functional-first language on the JVM: immutability, pattern matching, case classes, Option and Either, for-comprehensions, traits, givens and variance, the collections library, Futures, sbt, testing with ScalaTest and MUnit, Spark for data engineering, buildable projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🔺',
  tags: ['scala', 'functional', 'jvm', 'sbt', 'spark', 'futures', 'type-system'],
  languages: ['Scala'],
  explainMode: 'concept',
  code: { label: 'Scala', id: 'scala', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A JDK, the Coursier installer, sbt and a REPL so every snippet can run.',
      topics: [
        {
          title: 'Installing Scala with Coursier and a JDK',
          description: 'Scala compiles to JVM bytecode, so a JDK comes first; the cs setup installer provides scala, scalac, sbt and scala-cli, and version managers keep several JDKs and Scala versions side by side.',
          concepts: ['JDK requirements', 'cs setup and Coursier', 'scala, scalac and scala-cli', 'Scala 2 versus Scala 3 versions'],
          quiz: [
            ['What does cs setup install?', 'A JDK if missing plus scala, scalac, sbt, scala-cli and other tools.'],
            ['Which command runs a single file quickly?', 'scala-cli run Hello.scala'],
          ],
        },
        {
          title: 'The REPL and scala-cli scripts',
          description: 'Experimenting in the REPL with :type and :load, worksheets in the editor, and scala-cli for single-file programs with using directives for dependencies.',
          concepts: ['REPL commands', 'Worksheets', 'scala-cli using directives', 'Running and packaging with scala-cli'],
          quiz: [
            ['How do you add a dependency to a scala-cli script?', 'A comment line such as //> using dep "org::name:version".'],
            ['What does :type expr do in the REPL?', 'Prints the static type without evaluating side effects.'],
          ],
          prereqs: ['Installing Scala with Coursier and a JDK'],
        },
        {
          title: 'sbt projects and build.sbt',
          description: 'The standard build tool: build.sbt settings, scalaVersion, libraryDependencies with %% for Scala-versioned artifacts, the interactive shell, and the src/main and src/test layout.',
          concepts: ['build.sbt and settings', 'libraryDependencies and %%', 'sbt shell and continuous ~compile', 'Standard directory layout', 'project/plugins.sbt'],
          quiz: [
            ['What does %% do in a dependency?', 'Appends the Scala binary version suffix to the artifact name.'],
            ['What does ~testQuick do?', 'Re-runs affected tests every time a source file changes.'],
          ],
          prereqs: ['Installing Scala with Coursier and a JDK'],
        },
        {
          title: 'Metals, scalafmt and scalafix',
          description: 'The Metals language server for editor support, scalafmt for consistent formatting via .scalafmt.conf, scalafix for lint rules and rewrites, and compiler flags like -Wunused.',
          concepts: ['Metals language server', 'scalafmt configuration', 'scalafix rules', 'Useful compiler warnings'],
          quiz: [
            ['Where does scalafmt read its settings?', '.scalafmt.conf at the project root.'],
            ['What does -Wunused:imports do?', 'Warns about unused imports at compile time.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'Values, variables and expressions',
          description: 'val for immutable bindings and var used sparingly, type inference, everything as an expression including if and blocks, and Unit as the type of side effects.',
          concepts: ['val versus var', 'Type inference and annotations', 'Blocks and if as expressions', 'Unit and side effects'],
          quiz: [
            ['What is the value of a block?', 'Its last expression.'],
            ['Why prefer val?', 'Immutability makes code easier to reason about and safe to share.'],
          ],
        },
        {
          title: 'Scala 3 syntax and program entry points',
          description: 'Optional braces with significant indentation, end markers, @main methods, objects as singletons holding main, packages and top-level definitions.',
          concepts: ['Indentation syntax and end markers', '@main entry points', 'Objects as singletons', 'Packages and top-level definitions', 'Imports and wildcards'],
          quiz: [
            ['How do you define an entry point in Scala 3?', 'Annotate a top-level method with @main.'],
            ['What does import scala.collection.mutable.* import?', 'Every member of the mutable package (Scala 3 wildcard).'],
          ],
          prereqs: ['Values, variables and expressions'],
        },
        {
          title: 'Basic types and literals',
          description: 'Int, Long, Double, Boolean, Char and String as unified types, BigInt and BigDecimal, string interpolators s, f and raw, and numeric widening and conversions.',
          concepts: ['Numeric types and widening', 'BigInt and BigDecimal', 's, f and raw interpolators', 'toInt, toDouble and toIntOption'],
          quiz: [
            ['What does f"$x%.2f" do?', 'Formats x with two decimals and checks the type at compile time.'],
            ['What does "42".toIntOption give?', 'Some(42), and None for non-numeric text.'],
          ],
        },
        {
          title: 'Operators, methods and infix notation',
          description: 'Operators are methods, infix calls like a max b, precedence by first character, right-associative methods ending in a colon, and unary prefix operators.',
          concepts: ['Operators as methods', 'Infix method calls', 'Precedence rules', 'Right-associative :: methods'],
          quiz: [
            ['What is 1 :: list actually calling?', 'list.::(1), because methods ending in : are right-associative.'],
            ['Does Scala have operator overloading?', 'Yes, any method with a symbolic name is an operator.'],
          ],
          prereqs: ['Basic types and literals'],
        },
        {
          title: 'Conditions and loops',
          description: 'if/else as expressions, while loops for rare imperative code, for loops with generators and guards, and why map, filter and fold usually replace loops.',
          concepts: ['if/else expressions', 'for loops with generators', 'Guards and multiple generators', 'while and when to avoid it'],
          quiz: [
            ['What does for (i <- 1 to 3; j <- 1 to 2 if j != i) yield (i, j) produce?', 'A Vector of pairs excluding equal values.'],
            ['Is there a break statement?', 'Not natively; use boundary/break in Scala 3 or restructure with recursion.'],
          ],
        },
      ],
    },
    {
      title: 'Functions and Functional Programming',
      topics: [
        {
          title: 'Methods and function values',
          description: 'def methods versus function values of type A => B, eta-expansion turning methods into functions, anonymous functions and placeholder syntax, and higher-order functions.',
          concepts: ['def versus function literals', 'Function types A => B', 'Eta-expansion', 'Placeholder _ syntax', 'Higher-order functions'],
          quiz: [
            ['What is the type of (x: Int) => x + 1?', 'Int => Int'],
            ['What does list.map(_ * 2) mean?', 'list.map(x => x * 2)'],
          ],
        },
        {
          title: 'Currying, partial application and by-name parameters',
          description: 'Multiple parameter lists, partially applying functions, by-name parameters that delay evaluation, and building control structures like retry or timed.',
          concepts: ['Multiple parameter lists', 'Partial application', 'By-name parameters', 'Custom control structures'],
          quiz: [
            ['What does def log(msg: => String) allow?', 'msg is evaluated only when used inside the method.'],
            ['Why put the function parameter in a second list?', 'Type inference from the first list improves lambda typing and reads like a block.'],
          ],
          prereqs: ['Methods and function values'],
        },
        {
          title: 'Immutability and pure functions',
          description: 'Referential transparency, functions without side effects, immutable data with copy, local mutability hidden inside pure functions, and why immutability simplifies concurrency.',
          concepts: ['Referential transparency', 'Pure functions', 'Immutable data and copy', 'Local mutation inside pure code'],
          quiz: [
            ['What makes a function pure?', 'Same inputs always give the same output with no observable side effects.'],
            ['Is a var inside a method a problem?', 'Not if it never escapes and the method stays referentially transparent.'],
          ],
        },
        {
          title: 'Recursion and tail calls',
          description: 'Recursive definitions over lists, the @tailrec annotation guaranteeing constant stack, accumulators, and converting between recursion and folds.',
          concepts: ['Structural recursion on lists', '@tailrec annotation', 'Accumulator parameters', 'Recursion versus foldLeft'],
          quiz: [
            ['What does @tailrec do if the call is not in tail position?', 'The compiler reports an error.'],
            ['Why does non-tail recursion over a million elements fail?', 'Each call adds a stack frame, causing StackOverflowError.'],
          ],
          prereqs: ['Methods and function values'],
        },
        {
          title: 'Option and Either',
          description: 'Option replaces null with Some and None, Either models failure with Left and Right, map, flatMap, fold and getOrElse, and Try for exception-throwing code.',
          concepts: ['Option, Some and None', 'Either and right-biased map', 'Try for exceptions', 'fold, getOrElse and toRight'],
          quiz: [
            ['What does opt.map(f).getOrElse(default) do?', 'Applies f if defined, otherwise returns default.'],
            ['Which side of Either is the success by convention?', 'Right.'],
          ],
        },
        {
          title: 'for-comprehensions',
          description: 'How for with yield desugars into flatMap, map and withFilter, chaining Options, Eithers and Futures, and why every generator must share the same effect type.',
          concepts: ['Desugaring to flatMap and map', 'Chaining Options and Eithers', 'Pattern bindings in generators', 'Mixing types errors'],
          quiz: [
            ['What does for (a <- fa; b <- fb) yield (a, b) desugar to?', 'fa.flatMap(a => fb.map(b => (a, b)))'],
            ['Can you mix Option and List generators in one for?', 'No, the types must line up; convert one first.'],
          ],
          prereqs: ['Option and Either'],
        },
        {
          title: 'Function composition and partial functions',
          description: 'compose and andThen, PartialFunction with isDefinedAt and collect, lifting to Option, and Function1 helpers like identity and Function.const.',
          concepts: ['compose and andThen', 'PartialFunction and collect', 'lift and unlift', 'identity and constant functions'],
          quiz: [
            ['What does f andThen g compute?', 'g(f(x))'],
            ['What does list.collect { case x: Int => x } do?', 'Keeps and casts elements matched by the partial function.'],
          ],
          prereqs: ['Methods and function values'],
        },
      ],
    },
    {
      title: 'Pattern Matching and Data Modelling',
      topics: [
        {
          title: 'Case classes and case objects',
          description: 'Immutable data with generated apply, unapply, equals, hashCode, toString and copy, named and default parameters, and case objects as singletons.',
          concepts: ['Generated apply and unapply', 'Structural equality', 'copy with named arguments', 'Case objects'],
          quiz: [
            ['Is Point(1, 2) == Point(1, 2)?', 'Yes, case classes compare structurally.'],
            ['What does p.copy(y = 5) return?', 'A new instance with y changed and everything else the same.'],
          ],
        },
        {
          title: 'Pattern matching essentials',
          description: 'match with constant, variable, constructor, tuple and sequence patterns, guards, type patterns, alternatives with | and the MatchError when nothing matches.',
          concepts: ['Constructor and tuple patterns', 'Guards and alternatives', 'Type patterns and erasure', 'Sequence patterns with _*', 'MatchError'],
          quiz: [
            ['What does case head :: tail match?', 'A non-empty list, binding its first element and the rest.'],
            ['Why cannot case xs: List[Int] check the element type?', 'Generic types are erased on the JVM.'],
          ],
          prereqs: ['Case classes and case objects'],
        },
        {
          title: 'Sealed hierarchies and enums',
          description: 'sealed traits with case class children for algebraic data types, exhaustiveness checking, Scala 3 enums with parameters and methods, and modelling states and commands.',
          concepts: ['sealed traits as ADTs', 'Exhaustiveness warnings', 'Scala 3 enums', 'Parameterised enum cases', 'Modelling state machines'],
          quiz: [
            ['What does sealed give the compiler?', 'Knowledge of all subtypes, so it can warn on missing match cases.'],
            ['How do you define a simple enum in Scala 3?', 'enum Color { case Red, Green, Blue }'],
          ],
          prereqs: ['Pattern matching essentials'],
        },
        {
          title: 'Extractors and custom patterns',
          description: 'Writing unapply and unapplySeq on objects to match anything, boolean extractors, regex patterns, and pattern matching in val definitions and lambdas.',
          concepts: ['unapply and unapplySeq', 'Boolean extractors', 'Regex patterns', 'Patterns in val and lambdas'],
          quiz: [
            ['What does val (a, b) = pair do?', 'Destructures the tuple into a and b.'],
            ['What must unapply return?', 'Option of the extracted values (or a Boolean for tests).'],
          ],
          prereqs: ['Pattern matching essentials'],
        },
        {
          title: 'Tuples and opaque types',
          description: 'Tuples for ad hoc grouping, _1 and destructuring, Scala 3 tuple operations, opaque type aliases for zero-cost wrappers, and when a case class is clearer.',
          concepts: ['Tuple creation and access', 'Opaque type aliases', 'Type aliases', 'Tuples versus case classes'],
          quiz: [
            ['What does an opaque type erase to at runtime?', 'Its underlying type, with no wrapper allocation.'],
            ['When choose a case class over a tuple?', 'When the fields have meaning that names should carry.'],
          ],
        },
      ],
    },
    {
      title: 'The Type System',
      topics: [
        {
          title: 'Classes, objects and companions',
          description: 'Class parameters and constructors, auxiliary constructors, companion objects sharing private access, apply factories, and the difference between object and class.',
          concepts: ['Class parameters and val fields', 'Auxiliary constructors', 'Companion objects', 'apply factory methods', 'Access modifiers and private[this]'],
          quiz: [
            ['Can a companion object read private members of its class?', 'Yes, and vice versa.'],
            ['What does class Person(name: String) create?', 'A constructor parameter that is only a field if used outside the constructor.'],
          ],
        },
        {
          title: 'Traits and mixin composition',
          description: 'Traits with abstract and concrete members, extending several traits, linearisation order, stackable modifications with abstract override, and self-types.',
          concepts: ['Abstract and concrete trait members', 'Mixing in multiple traits', 'Linearisation', 'Stackable traits', 'Self-types'],
          quiz: [
            ['In class A extends B with C with D, whose method runs first for super calls?', 'D, the right-most trait, per linearisation.'],
            ['What does a self-type declare?', 'That the trait can only be mixed into a type with the given members.'],
          ],
          prereqs: ['Classes, objects and companions'],
        },
        {
          title: 'Generics and variance',
          description: 'Type parameters on classes and methods, covariance +A, contravariance -A and invariance, why List is covariant and Function1 is contravariant in its input, and bounds.',
          concepts: ['Type parameters', 'Covariance and contravariance', 'Invariance and mutable containers', 'Upper and lower bounds'],
          quiz: [
            ['Why is Array[T] invariant?', 'Arrays are mutable; covariance would allow writing wrong types.'],
            ['What does B >: A mean in a method signature?', 'B is a supertype of A (a lower bound).'],
          ],
        },
        {
          title: 'Givens, using and type classes',
          description: 'Scala 3 given instances and using parameters replace Scala 2 implicits, defining type classes like Show or Ordering, context bounds, and resolution rules.',
          concepts: ['given and using', 'Type class pattern', 'Context bounds [T: Ordering]', 'Given resolution scope', 'Scala 2 implicit val and implicit def'],
          quiz: [
            ['What does def sort[T: Ordering](xs: List[T]) require?', 'A given Ordering[T] in scope at the call site.'],
            ['Where does the compiler look for givens?', 'Lexical scope, then companion objects of the involved types.'],
          ],
          prereqs: ['Generics and variance'],
        },
        {
          title: 'Extension methods and implicit conversions',
          description: 'Adding methods to existing types with extension in Scala 3, implicit classes in Scala 2, and why implicit conversions are discouraged and gated behind a language import.',
          concepts: ['extension methods', 'Scala 2 implicit classes', 'Implicit conversions and their risks', 'Enriching third-party types'],
          quiz: [
            ['How do you add isEven to Int in Scala 3?', 'extension (n: Int) def isEven: Boolean = n % 2 == 0'],
            ['Why are implicit conversions discouraged?', 'They make code surprising and hide errors; extension methods are explicit.'],
          ],
          prereqs: ['Givens, using and type classes'],
        },
        {
          title: 'Union, intersection and structural types',
          description: 'Scala 3 union types A | B, intersection types A & B, literal and singleton types, match types at a glance, and where these replace boilerplate wrappers.',
          concepts: ['Union types A | B', 'Intersection types A & B', 'Literal and singleton types', 'Match types overview'],
          quiz: [
            ['What does def f(x: Int | String) accept?', 'Either an Int or a String, checked with pattern matching inside.'],
            ['Is A & B the same as A with B?', 'Roughly, but & is commutative and a true type-level intersection.'],
          ],
        },
        {
          title: 'Type inference and Nothing, Null and Any',
          description: 'The top and bottom of the type lattice, why Nothing is the type of throw, AnyVal versus AnyRef, least upper bounds in inference, and explicit annotations on public members.',
          concepts: ['Any, AnyVal and AnyRef', 'Nothing and Null', 'Least upper bound inference', 'Annotating public signatures'],
          quiz: [
            ['What is the inferred type of List(1, "a")?', 'List[Int | String] in Scala 3 (List[Any] in Scala 2).'],
            ['Why is Nothing useful?', 'It is a subtype of everything, so throw and empty collections fit anywhere.'],
          ],
        },
      ],
    },
    {
      title: 'Collections',
      topics: [
        {
          title: 'The collections hierarchy',
          description: 'Iterable, Seq, Set and Map, immutable versus mutable packages, List, Vector, ArrayBuffer and Array, and how to choose by access pattern.',
          concepts: ['Iterable, Seq, Set and Map', 'Immutable versus mutable packages', 'List versus Vector', 'Array and ArrayBuffer'],
          quiz: [
            ['Which sequence has effectively constant indexed access?', 'Vector.'],
            ['What is the cost of list(n)?', 'O(n), because List is a linked list.'],
          ],
        },
        {
          title: 'Transforming collections',
          description: 'map, flatMap, filter, collect, zip, groupBy, partition, sliding, grouped, sortBy and distinct, and how the builder mechanism keeps result types precise.',
          concepts: ['map, flatMap and filter', 'groupBy and partition', 'sliding and grouped', 'zip and zipWithIndex', 'Result type preservation'],
          quiz: [
            ['What does List(1, 2, 3).sliding(2).toList give?', 'List(List(1, 2), List(2, 3))'],
            ['What type does Set(1, 2).map(_ % 2) return?', 'Set[Int], so Set(1, 0).'],
          ],
          prereqs: ['The collections hierarchy'],
        },
        {
          title: 'Folding and aggregation',
          description: 'foldLeft and foldRight, reduce and its empty-collection risk, scan for running totals, sum, product, min and maxBy, and aggregating maps with groupMapReduce.',
          concepts: ['foldLeft and foldRight', 'reduce versus fold', 'scanLeft', 'groupMapReduce', 'minBy and maxBy'],
          quiz: [
            ['What does List().reduce(_ + _) do?', 'Throws UnsupportedOperationException; fold needs a start value.'],
            ['What does words.groupMapReduce(identity)(_ => 1)(_ + _) compute?', 'A word count map.'],
          ],
          prereqs: ['Transforming collections'],
        },
        {
          title: 'Maps and Sets in depth',
          description: 'Map construction, get returning Option, getOrElse and updated, withDefaultValue, SortedMap and TreeSet, and mutable HashMap for hot loops.',
          concepts: ['Map get, getOrElse and updated', 'withDefaultValue', 'SortedMap and TreeSet', 'Mutable HashMap for performance'],
          quiz: [
            ['What does m + (k -> v) return?', 'A new immutable map with the entry added.'],
            ['What does m(k) do when k is absent?', 'Throws NoSuchElementException; use get for an Option.'],
          ],
          prereqs: ['The collections hierarchy'],
        },
        {
          title: 'Views, iterators and LazyList',
          description: 'Strict versus lazy evaluation, view for fusing transformations, Iterator for one-pass streams, LazyList for memoised infinite sequences, and avoiding intermediate collections.',
          concepts: ['view and lazy transformations', 'Iterator semantics', 'LazyList and #::', 'Avoiding intermediate allocations'],
          quiz: [
            ['What does xs.view.map(f).filter(p).take(3).toList avoid?', 'Building two intermediate collections.'],
            ['Can you traverse an Iterator twice?', 'No, it is consumed after one pass.'],
          ],
          prereqs: ['Transforming collections'],
        },
        {
          title: 'Strings and text processing in Scala',
          description: 'StringOps methods like split, stripMargin and toUpperCase, StringBuilder, regex with the r method and findAllIn, and multi-line and raw strings.',
          concepts: ['StringOps helpers', 'stripMargin and multi-line strings', 'StringBuilder', 'Regex with .r and findAllIn', 'Interpolators as patterns'],
          quiz: [
            ['What does "a b  c".split("\\\\s+").toList give?', 'List("a", "b", "c")'],
            ['What does """\\d+""".r.findAllIn("a1b22").toList return?', 'List("1", "22")'],
          ],
        },
      ],
    },
    {
      title: 'Errors, I/O and Modules',
      topics: [
        {
          title: 'Exceptions and Try',
          description: 'JVM exceptions and try/catch with pattern matching, finally, why Scala prefers Try, Option and Either at boundaries, and scala.util.Using for resources.',
          concepts: ['try, catch and finally with patterns', 'Try, Success and Failure', 'Exceptions at boundaries only', 'Using for resource safety'],
          quiz: [
            ['What does Try(parse(s)).toOption give?', 'Some(result) or None if parse threw.'],
            ['What does Using(Source.fromFile(p))(f) guarantee?', 'The source is closed after f, even on exceptions.'],
          ],
        },
        {
          title: 'Error modelling with Either and validation',
          description: 'Designing error ADTs, Either chains that short-circuit, accumulating validation errors, and mapping errors at module boundaries.',
          concepts: ['Error ADTs', 'Short-circuiting with Either', 'Accumulating errors', 'Translating errors between layers'],
          quiz: [
            ['Why model errors as a sealed trait?', 'Callers can match exhaustively and the compiler checks new cases.'],
            ['Does a for over Either accumulate errors?', 'No, it stops at the first Left.'],
          ],
          prereqs: ['Exceptions and Try'],
        },
        {
          title: 'Files and I/O',
          description: 'scala.io.Source for reading, java.nio.file for writing and paths, os-lib for ergonomic file work, reading stdin, and streaming large files line by line.',
          concepts: ['Source.fromFile and getLines', 'java.nio.file.Files', 'os-lib', 'Reading stdin', 'Streaming large files'],
          quiz: [
            ['Why must Source be closed?', 'It holds a file handle; use Using or close explicitly.'],
            ['What does os.read.lines(path) return?', 'An IndexedSeq of the file lines.'],
          ],
        },
        {
          title: 'JSON and serialisation libraries',
          description: 'Circe and uPickle for JSON with derived codecs, encoding case classes and enums, decoding into Either, and choosing a library by ecosystem.',
          concepts: ['Circe derivation', 'uPickle ReadWriter', 'Decoding to Either', 'Choosing a JSON library'],
          quiz: [
            ['What does decode[User](json) return in Circe?', 'Either[Error, User]'],
            ['How does uPickle derive a codec for a case class?', 'given rw: ReadWriter[User] = macroRW'],
          ],
        },
        {
          title: 'Packages, imports and Java interop',
          description: 'Package objects and top-level definitions, import renaming and hiding, calling Java libraries, converting collections with CollectionConverters, and Option from nullable Java values.',
          concepts: ['Package structure', 'Import renaming and hiding', 'Calling Java APIs', 'CollectionConverters asScala and asJava', 'Option(nullable)'],
          quiz: [
            ['How do you import List but hide Map?', 'import scala.collection.immutable.{List, Map => _, *}'],
            ['What does Option(javaMethod()) do?', 'Wraps the result as None if null, Some otherwise.'],
          ],
        },
      ],
    },
    {
      title: 'Concurrency and Futures',
      topics: [
        {
          title: 'Futures and ExecutionContext',
          description: 'Future runs work on a thread pool and completes once, ExecutionContext provided as a given, map and flatMap to chain, and why blocking inside a Future is dangerous.',
          concepts: ['Creating Futures', 'ExecutionContext as a given', 'map and flatMap on Futures', 'Blocking pitfalls'],
          quiz: [
            ['When does Future { work } start?', 'Immediately, on the execution context.'],
            ['Why avoid Await.result in production code?', 'It blocks a thread and can exhaust the pool.'],
          ],
          prereqs: ['for-comprehensions'],
        },
        {
          title: 'Composing and recovering Futures',
          description: 'Future.sequence and traverse, zip, recover and recoverWith, fallbackTo, onComplete, and sequential versus parallel execution in for-comprehensions.',
          concepts: ['Future.sequence and traverse', 'recover and recoverWith', 'Sequential versus parallel in for', 'onComplete and andThen'],
          quiz: [
            ['How do you run two futures in parallel and combine them?', 'Start both before the for-comprehension, then flatMap.'],
            ['What does Future.sequence do with one failure?', 'The resulting Future fails with that exception.'],
          ],
          prereqs: ['Futures and ExecutionContext'],
        },
        {
          title: 'Promises, timeouts and cancellation',
          description: 'Promise for completing a Future manually, wrapping callback APIs, implementing timeouts with a scheduler, and why Futures cannot be cancelled once started.',
          concepts: ['Promise and complete', 'Wrapping callback APIs', 'Timeouts', 'Non-cancellable Futures'],
          quiz: [
            ['What is a Promise?', 'A writable handle whose future completes when success or failure is called.'],
            ['Can you cancel a running Future?', 'No; use effect systems or cooperative flags.'],
          ],
          prereqs: ['Futures and ExecutionContext'],
        },
        {
          title: 'Threads, synchronisation and immutability',
          description: 'JVM threads under Scala, synchronized and volatile, java.util.concurrent atomics and executors, and how immutable data removes most locking.',
          concepts: ['JVM threads from Scala', 'synchronized and volatile', 'AtomicReference and executors', 'Immutability as a concurrency strategy'],
          quiz: [
            ['Why is an immutable Map safe to share across threads?', 'Nobody can change it, so there are no races.'],
            ['What does AtomicReference.updateAndGet do?', 'Applies a function atomically with compare-and-set.'],
          ],
        },
        {
          title: 'Effect systems overview',
          description: 'Why Cats Effect and ZIO describe effects as values, IO versus Future, fibers and structured concurrency, and when a plain Future is enough.',
          concepts: ['Effects as values', 'IO versus Future', 'Fibers and structured concurrency', 'Choosing Future, Cats Effect or ZIO'],
          quiz: [
            ['Does IO { println("x") } print anything?', 'Not until it is run; it is a description.'],
            ['What does referential transparency buy in Cats Effect?', 'Effects can be composed, retried and cancelled safely.'],
          ],
          prereqs: ['Composing and recovering Futures'],
        },
      ],
    },
    {
      title: 'Testing, Build and Performance',
      topics: [
        {
          title: 'Testing with MUnit and ScalaTest',
          description: 'MUnit test suites with assertEquals, ScalaTest styles like AnyFunSuite and AnyFlatSpec, matchers, running with sbt test and testOnly, and fixtures.',
          concepts: ['MUnit suites and assertions', 'ScalaTest styles and matchers', 'sbt test and testOnly', 'Fixtures and setup'],
          quiz: [
            ['How do you run a single suite?', 'sbt "testOnly com.example.MySuite"'],
            ['What does assertEquals(obtained, expected) show on failure?', 'A diff between the two values.'],
          ],
        },
        {
          title: 'Property-based testing with ScalaCheck',
          description: 'Generating inputs with Gen and Arbitrary, writing properties with forAll, shrinking failures to minimal cases, and properties for parsers, encoders and algebraic laws.',
          concepts: ['Gen and Arbitrary', 'forAll properties', 'Shrinking', 'Round-trip and law properties'],
          quiz: [
            ['What is shrinking?', 'Reducing a failing input to the smallest counterexample.'],
            ['Name a classic property for an encoder.', 'decode(encode(x)) == x'],
          ],
          prereqs: ['Testing with MUnit and ScalaTest'],
        },
        {
          title: 'Mocking and testing Futures',
          description: 'Designing with traits so fakes replace dependencies, ScalaTest async styles and futureValue, mockito-scala when needed, and deterministic execution contexts.',
          concepts: ['Fakes via traits', 'AsyncFunSuite and futureValue', 'mockito-scala', 'Deterministic ExecutionContexts'],
          quiz: [
            ['How does AsyncFunSuite handle a Future[Assertion]?', 'It awaits the future and reports the result.'],
            ['Why prefer a fake over a mock in Scala?', 'A trait implementation is type-checked and readable.'],
          ],
          prereqs: ['Testing with MUnit and ScalaTest', 'Futures and ExecutionContext'],
        },
        {
          title: 'sbt in depth: multi-module builds and plugins',
          description: 'Sub-projects with dependsOn, shared settings, cross-building Scala versions, sbt-assembly for fat jars, sbt-native-packager, and publishing artifacts.',
          concepts: ['Multi-module builds', 'Cross-building', 'sbt-assembly', 'sbt-native-packager', 'Publishing'],
          quiz: [
            ['What does crossScalaVersions do?', 'Lets +compile build against several Scala versions.'],
            ['What does sbt-assembly produce?', 'A single jar containing the app and its dependencies.'],
          ],
          prereqs: ['sbt projects and build.sbt'],
        },
        {
          title: 'JVM performance for Scala',
          description: 'Boxing in generic code and @specialized, allocation from closures and tuples, JMH benchmarks with sbt-jmh, choosing collections by cost, and GC tuning basics.',
          concepts: ['Boxing and specialisation', 'Closure and tuple allocation', 'JMH benchmarks', 'Collection cost tables', 'JVM flags and GC'],
          quiz: [
            ['Why can List[Int] be slower than Array[Int]?', 'Elements are boxed as java.lang.Integer.'],
            ['What does sbt-jmh add?', 'Reliable micro-benchmarks that handle JIT warm-up.'],
          ],
        },
        {
          title: 'Security and dependency hygiene',
          description: 'Never deserialising untrusted Java objects, validating input at boundaries, sbt-dependency-check or Scala Steward for updates, secrets from the environment, and safe regex use.',
          concepts: ['Java deserialisation risks', 'Validation at boundaries', 'Scala Steward and dependency checks', 'Secrets from configuration'],
          quiz: [
            ['Why avoid ObjectInputStream on network data?', 'It can execute gadget chains from crafted payloads.'],
            ['What does Scala Steward do?', 'Opens pull requests to update dependencies.'],
          ],
        },
      ],
    },
    {
      title: 'Scala for Data Engineering with Spark',
      description: 'Scala is the native language of Apache Spark; the engine itself is covered in the Spark track.',
      style: 'practice',
      topics: [
        {
          title: 'Spark setup and the SparkSession',
          description: 'Adding spark-sql to an sbt project, creating a local SparkSession, running in local[*] mode, and matching Scala and Spark versions.',
          concepts: ['spark-sql dependency', 'SparkSession.builder', 'local[*] mode', 'Version compatibility'],
          quiz: [
            ['What does master("local[*]") do?', 'Runs Spark in-process using all cores.'],
            ['Which Scala versions does Spark 3.5 support?', '2.12 and 2.13; Scala 3 uses the 2.13 artifacts.'],
          ],
        },
        {
          title: 'DataFrames and Datasets in Scala',
          description: 'Loading CSV, JSON and Parquet, column expressions with $ and col, select, filter, groupBy and agg, typed Datasets from case classes, and the Encoder requirement.',
          concepts: ['Reading files into DataFrames', 'Column expressions', 'groupBy and agg', 'Typed Datasets and Encoders'],
          quiz: [
            ['What does df.as[User] need?', 'An implicit Encoder, available via spark.implicits.'],
            ['Why is Parquet preferred over CSV?', 'Columnar storage with schema and compression.'],
          ],
          prereqs: ['Spark setup and the SparkSession'],
        },
        {
          title: 'Transformations, actions and lazy evaluation',
          description: 'Narrow versus wide transformations, actions that trigger jobs, caching, explain plans, partitions and shuffles, and user-defined functions and their cost.',
          concepts: ['Narrow and wide transformations', 'Actions trigger execution', 'cache and persist', 'explain and query plans', 'UDF costs'],
          quiz: [
            ['When does a DataFrame transformation run?', 'When an action such as count, show or write is called.'],
            ['Why avoid UDFs where built-ins exist?', 'UDFs block Catalyst optimisation and add serialisation.'],
          ],
          prereqs: ['DataFrames and Datasets in Scala'],
        },
        {
          title: 'Structuring a Spark job',
          description: 'Separating pure transformations from I/O, testing them with small local DataFrames, packaging with sbt-assembly, spark-submit and configuration through arguments.',
          concepts: ['Pure transformation functions', 'Local DataFrame tests', 'Packaging with assembly', 'spark-submit and configuration'],
          quiz: [
            ['How do you unit test a transformation?', 'Build a small DataFrame in a local session and compare collected rows.'],
            ['What does spark-submit --class set?', 'The main class inside the jar to run.'],
          ],
          prereqs: ['Transformations, actions and lazy evaluation', 'sbt in depth: multi-module builds and plugins'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: expression parser and evaluator',
          description: 'Model arithmetic expressions as a sealed ADT, write a tokenizer and recursive-descent parser returning Either, evaluate with pattern matching, and verify with ScalaCheck round-trip properties.',
          concepts: ['Design the expression ADT', 'Tokenizer and parser with Either', 'Evaluator with pattern matching', 'Pretty printer', 'Property tests'],
          quiz: [
            ['Why return Either from the parser?', 'Errors carry a message and position instead of throwing.'],
            ['Which property checks the pretty printer?', 'parse(print(e)) == Right(e)'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent web crawler with Futures',
          description: 'Fetch pages with sttp, bound concurrency with a semaphore or batches, track visited URLs immutably, handle failures with recover, and export a link graph as JSON.',
          concepts: ['HTTP fetch with sttp', 'Bounded concurrency', 'Immutable visited state', 'Failure recovery', 'JSON export with Circe'],
          quiz: [
            ['How do you limit concurrent fetches with Futures?', 'Process URLs in batches with Future.traverse or a Semaphore.'],
            ['Why keep visited URLs in an immutable Set behind an AtomicReference?', 'Safe updates without locks.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: bank ledger with type classes',
          description: 'Model accounts and transactions with opaque types and enums, enforce rules with Either-based validation, derive Show and JSON codecs, and expose a small HTTP API with http4s or Cask.',
          concepts: ['Opaque types for money and ids', 'Validation with Either', 'Type class instances', 'HTTP API with Cask or http4s', 'MUnit tests'],
          quiz: [
            ['Why an opaque type for Money?', 'Prevents mixing amounts with plain numbers at zero runtime cost.'],
            ['Which errors should be a sealed trait?', 'Domain failures like InsufficientFunds and UnknownAccount.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Spark log analytics job',
          description: 'Parse web server logs into a typed Dataset, compute top pages, error rates and hourly traffic, write Parquet partitioned by date, and test transformations locally.',
          concepts: ['Parse logs into a case class', 'Aggregate with groupBy', 'Write partitioned Parquet', 'Local transformation tests', 'Package and submit'],
          quiz: [
            ['Why partition output by date?', 'Downstream queries can skip irrelevant partitions.'],
            ['How do you handle malformed lines?', 'Parse into Option or Either and count the rejects.'],
          ],
          style: 'project',
        },
        {
          title: 'Scala interview questions',
          description: 'The recurring questions: val versus def versus lazy val, Option versus null, case classes, traits versus abstract classes, variance, givens and implicits, Future versus IO, and List versus Vector.',
          concepts: ['Language semantics questions', 'Type system questions', 'Functional design questions', 'Concurrency questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['What does lazy val do?', 'Evaluates once on first access, thread-safely.'],
            ['Trait or abstract class?', 'Traits can be mixed in multiply; abstract classes take constructor parameters and interoperate with Java.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Scala',
          description: 'Solving problems fast: reading stdin, mutable collections in hot paths, groupMapReduce and tally-style counts, sortBy with tuples, tail recursion, and avoiding List indexing traps.',
          concepts: ['Reading stdin quickly', 'Mutable collections in interviews', 'Sorting with tuple keys', 'Tail-recursive solutions', 'List indexing traps'],
          quiz: [
            ['How do you count frequencies in one line?', 'xs.groupMapReduce(identity)(_ => 1)(_ + _)'],
            ['Why not index into a List in a loop?', 'Each index is O(n); use Vector or Array.'],
          ],
        },
      ],
    },
  ],
})
