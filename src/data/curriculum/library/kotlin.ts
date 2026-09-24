import { defineTrack } from '../define'

export const kotlin = defineTrack({
  id: 'track-kotlin',
  title: 'Kotlin',
  description: 'Kotlin from the JDK and Gradle setup to idiomatic, coroutine-driven code: null safety, data and sealed classes, extension functions, the collections API, Java interoperability, coroutines and flows, testing with JUnit and MockK, Android and Ktor applications, projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🟣',
  tags: ['kotlin', 'jvm', 'android', 'ktor', 'coroutines', 'backend', 'mobile'],
  languages: ['Kotlin'],
  explainMode: 'concept',
  code: { label: 'Kotlin', id: 'kotlin', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A JDK, a build tool and an IDE that understands Kotlin, before the first real file.',
      topics: [
        {
          title: 'Installing Kotlin, a JDK and IntelliJ IDEA',
          description: 'Kotlin compiles to JVM bytecode, so you need a JDK (17 or 21 LTS) plus the Kotlin compiler bundled with IntelliJ IDEA or Android Studio; how the Kotlin plugin, SDK selection and language versions fit together.',
          concepts: ['Choosing a JDK and LTS versions', 'IntelliJ IDEA and the Kotlin plugin', 'Kotlin language and API versions', 'Project SDK and JVM target'],
          quiz: [
            ['Does Kotlin need a JDK installed?', 'Yes for JVM targets; the compiler and runtime use it.'],
            ['Which IDE has first-party Kotlin support?', 'IntelliJ IDEA (and Android Studio, which is built on it).'],
          ],
        },
        {
          title: 'Gradle with the Kotlin DSL and ktlint',
          description: 'build.gradle.kts declares the Kotlin plugin, JVM toolchain and dependencies in Kotlin itself; the Gradle wrapper pins the build tool version, and ktlint or detekt enforce the official code style in CI.',
          concepts: ['build.gradle.kts and the Kotlin plugin', 'The Gradle wrapper', 'jvmToolchain and dependencies', 'ktlint and detekt in CI'],
          quiz: [
            ['Why commit the Gradle wrapper?', 'Everyone builds with the same Gradle version without installing it.'],
            ['What does jvmToolchain(21) do?', 'Compiles and runs with JDK 21 regardless of the machine default.'],
          ],
          prereqs: ['Installing Kotlin, a JDK and IntelliJ IDEA'],
        },
        {
          title: 'Scripts, the REPL and Kotlin Playground',
          description: 'Running one-off code without a project: kotlinc for compiling single files, .main.kts scripts with dependency annotations, Kotlin Notebook inside IntelliJ, and the browser Playground for sharing snippets.',
          concepts: ['kotlinc and single-file compilation', 'main.kts scripts', 'Kotlin Notebook', 'Kotlin Playground'],
          quiz: [
            ['How do you run a Kotlin script file?', 'kotlinc -script file.main.kts'],
            ['What does @file:DependsOn do in a script?', 'Declares a Maven dependency the script can import.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'main, packages and top-level declarations',
          description: 'A Kotlin file can hold top-level functions, properties and classes without a wrapping class; main needs no arguments, packages need not match directories, semicolons are optional, and imports can alias names.',
          concepts: ['fun main and program entry', 'Top-level functions and properties', 'Packages and imports with aliases', 'Files versus classes'],
          quiz: [
            ['Must a Kotlin file contain a class?', 'No, functions and properties can live at the top level.'],
            ['How do you alias an import?', 'import java.util.Date as JDate'],
          ],
        },
        {
          title: 'Variables, basic types and inference',
          description: 'val for read-only references and var for mutable ones, type inference from initialisers, Int, Long, Double, Boolean, Char and String as objects, no implicit widening between numeric types, and unsigned integers.',
          concepts: ['val versus var', 'Type inference', 'Numeric types without implicit widening', 'Char, Boolean and unsigned types', 'const val and compile-time constants'],
          quiz: [
            ['Can you assign an Int to a Long variable directly?', 'No, call toLong(); Kotlin has no implicit widening.'],
            ['Does val make an object immutable?', 'No, only the reference cannot be reassigned.'],
          ],
        },
        {
          title: 'Operators and expressions',
          description: 'Arithmetic and comparison operators, == for structural equality versus === for identity, ranges with .., ..< and downTo, the in operator, and bitwise operations as named infix functions like shl and and.',
          concepts: ['== versus ===', 'Ranges with .. and ..<', 'in and !in', 'Bitwise infix functions shl, and, xor', 'Operator precedence'],
          quiz: [
            ['What does a == b call?', 'a?.equals(b) ?: (b === null)'],
            ['How do you write bitwise AND?', 'a and b'],
          ],
          prereqs: ['Variables, basic types and inference'],
        },
        {
          title: 'if and when as expressions',
          description: 'if returns a value so there is no ternary, when replaces switch and matches values, ranges, types and arbitrary conditions, and when over a sealed or enum type must be exhaustive.',
          concepts: ['if as an expression', 'when with values, ranges and types', 'when without a subject', 'Exhaustiveness and else'],
          quiz: [
            ['How do you write a ternary in Kotlin?', 'val x = if (cond) a else b'],
            ['When must a when expression have an else branch?', 'When it is used as an expression and the branches are not exhaustive.'],
          ],
          prereqs: ['Operators and expressions'],
        },
        {
          title: 'Loops, ranges and labels',
          description: 'for iterates anything with an iterator, including ranges with step and indices via withIndex, while and do-while, break and continue with labels for nested loops, and repeat for counted iteration.',
          concepts: ['for over ranges and collections', 'withIndex and indices', 'while and do-while', 'Labeled break and continue', 'repeat'],
          quiz: [
            ['How do you loop from 10 down to 0 in steps of 2?', 'for (i in 10 downTo 0 step 2)'],
            ['How do you break out of an outer loop?', 'Label it: outer@ for (...) { ... break@outer }'],
          ],
          prereqs: ['Operators and expressions'],
        },
      ],
    },
    {
      title: 'Null Safety and Functions',
      description: 'The two features that most change how Kotlin code is written.',
      topics: [
        {
          title: 'Nullable types and safe calls',
          description: 'String and String? are different types checked by the compiler; the safe call ?., the Elvis operator ?: for defaults or early returns, let for scoped null handling, and why !! is a code smell.',
          concepts: ['Nullable versus non-null types', 'Safe call ?.', 'Elvis operator ?:', '?.let scoping', 'The !! operator and when to avoid it'],
          quiz: [
            ['What does user?.address?.city return if address is null?', 'null, without throwing.'],
            ['What does x ?: return do?', 'Returns from the function when x is null, otherwise uses x.'],
          ],
        },
        {
          title: 'Smart casts and type checks',
          description: 'After an is check or null check the compiler treats a val as the narrower type automatically; as? casts safely to null, and smart casts fail on mutable vars or open properties because they could change underneath.',
          concepts: ['is checks and smart casts', 'as and as? casts', 'Why var blocks smart casts', 'Smart casts in when branches'],
          quiz: [
            ['What does "abc" as? Int give?', 'null instead of a ClassCastException.'],
            ['Why does a smart cast fail on a var?', 'Another thread or code path could change it between the check and the use.'],
          ],
          prereqs: ['Nullable types and safe calls'],
        },
        {
          title: 'lateinit, lazy and nullability strategies',
          description: 'lateinit for non-null properties initialised later such as in DI or tests, by lazy for deferred computation, when to choose nullable fields versus defaults, and isInitialized checks.',
          concepts: ['lateinit var rules', 'by lazy initialisation', 'Nullable field versus default value', 'isInitialized'],
          quiz: [
            ['Can lateinit be used with Int?', 'No, only with non-primitive, non-null types.'],
            ['Is by lazy thread-safe by default?', 'Yes, LazyThreadSafetyMode.SYNCHRONIZED.'],
          ],
          prereqs: ['Nullable types and safe calls'],
        },
        {
          title: 'Functions, default and named arguments',
          description: 'Single-expression functions, default parameter values that replace overloads, named arguments for readability, vararg with the spread operator, plus infix, operator overloading and tailrec functions.',
          concepts: ['Single-expression functions', 'Default and named arguments', 'vararg and the spread operator', 'infix functions', 'operator overloading', 'tailrec functions'],
          quiz: [
            ['How do you pass an array to a vararg parameter?', 'f(*array)'],
            ['What does tailrec guarantee?', 'The compiler turns the tail call into a loop, or errors if it cannot.'],
            ['Which function does a + b call on a class?', 'a.plus(b), declared with the operator modifier.'],
          ],
        },
        {
          title: 'Extension functions and properties',
          description: 'Adding members to existing types without inheritance: extensions are resolved statically on the declared type, cannot access private members, can be declared on nullable receivers, and are how much of the standard library works.',
          concepts: ['Declaring extensions', 'Static dispatch of extensions', 'Extensions on nullable receivers', 'Extension properties', 'Member wins over extension'],
          quiz: [
            ['Are extension functions dispatched virtually?', 'No, they are resolved statically by the declared type.'],
            ['Can an extension access a private field?', 'No, it sees only what the call site could.'],
          ],
          prereqs: ['Functions, default and named arguments'],
        },
        {
          title: 'Lambdas and function types',
          description: 'Function types like (Int) -> String, lambda syntax with it for a single parameter, trailing lambdas outside parentheses, function references with ::, anonymous functions, and closures capturing mutable variables.',
          concepts: ['Function types', 'Lambda syntax and it', 'Trailing lambda convention', 'Function references with ::', 'Closures capturing variables'],
          quiz: [
            ['What does list.filter { it > 2 } mean?', 'Keep elements for which the lambda returns true; it is the element.'],
            ['How do you reference a top-level function as a value?', '::functionName'],
          ],
          prereqs: ['Functions, default and named arguments'],
        },
        {
          title: 'Inline, reified and scope functions',
          description: 'inline copies a function and its lambdas into the call site to avoid allocation and allow non-local returns, reified type parameters survive erasure, and let, run, with, apply and also each differ by receiver and return value.',
          concepts: ['inline and lambda allocation', 'Non-local returns from lambdas', 'reified type parameters', 'let, run, with, apply, also', 'Choosing the right scope function'],
          quiz: [
            ['Which scope function returns the receiver?', 'apply and also.'],
            ['Why does inline enable reified?', 'The type argument is substituted at each call site, so it is known at runtime.'],
          ],
          prereqs: ['Lambdas and function types'],
        },
      ],
    },
    {
      title: 'Collections, Strings and Text',
      topics: [
        {
          title: 'Lists, sets, maps and arrays',
          description: 'Read-only List, Set and Map interfaces versus their Mutable counterparts, listOf and mutableListOf builders, buildList, the difference between Array and IntArray, and why read-only is not immutable.',
          concepts: ['Read-only versus mutable interfaces', 'listOf, mutableListOf and buildList', 'Map entries and access', 'Array and primitive arrays', 'Read-only is not immutable'],
          quiz: [
            ['Can a List be modified?', 'Not through the List interface, but the underlying object may be mutable.'],
            ['Why prefer IntArray over Array<Int>?', 'It stores primitives without boxing.'],
          ],
        },
        {
          title: 'Transforming collections',
          description: 'map, filter, flatMap, mapNotNull, associate and associateBy, zip and unzip, partition, take and drop, and the habit of chaining pure transformations instead of writing loops.',
          concepts: ['map, filter and flatMap', 'mapNotNull and filterIsInstance', 'associate and associateBy', 'zip, partition and windowed', 'take, drop and chunked'],
          quiz: [
            ['What does associateBy { it.id } produce?', 'A Map from id to element.'],
            ['Difference between map and flatMap?', 'flatMap flattens the lists each element produces into one list.'],
          ],
          prereqs: ['Lists, sets, maps and arrays', 'Lambdas and function types'],
        },
        {
          title: 'Sorting, grouping and aggregating',
          description: 'sortedBy and sortedWith with compareBy for multi-key ordering, groupBy and groupingBy for counts, fold and reduce, sumOf, maxByOrNull, and the OrNull family that avoids exceptions on empty input.',
          concepts: ['sortedBy, sortedWith and compareBy', 'groupBy and groupingBy', 'fold and reduce', 'sumOf, count and maxByOrNull', 'The OrNull naming convention'],
          quiz: [
            ['How do you sort by age descending then name?', 'sortedWith(compareByDescending<P> { it.age }.thenBy { it.name })'],
            ['What does reduce do on an empty list?', 'Throws; use fold with an initial value or reduceOrNull.'],
          ],
          prereqs: ['Transforming collections'],
        },
        {
          title: 'Sequences and lazy evaluation',
          description: 'asSequence turns eager chains into lazy element-by-element processing, which avoids intermediate lists on large data; generateSequence and sequence builders with yield create infinite or on-demand streams.',
          concepts: ['Eager versus lazy chains', 'asSequence and terminal operations', 'generateSequence', 'sequence builder with yield', 'When sequences are slower'],
          quiz: [
            ['When is asSequence worth it?', 'Large collections with several chained operations or early termination.'],
            ['Does a sequence run until you call a terminal operation?', 'No, it is lazy until first, toList, count or similar.'],
          ],
          prereqs: ['Transforming collections'],
        },
        {
          title: 'Destructuring, Pair and Triple',
          description: 'Destructuring declarations pull componentN values out of data classes, pairs and map entries; to creates a Pair, and destructuring in lambdas and for loops keeps code short without exposing tuples in APIs.',
          concepts: ['componentN functions', 'Pair, Triple and to', 'Destructuring map entries', 'Destructuring in lambdas', 'Underscore for unused components'],
          quiz: [
            ['What does for ((k, v) in map) rely on?', 'Map.Entry providing component1 and component2.'],
            ['Why avoid Pair in public APIs?', 'first and second carry no meaning; a data class does.'],
          ],
        },
        {
          title: 'String templates and raw strings',
          description: 'Strings are immutable; $name and ${expr} interpolate, triple-quoted raw strings keep newlines and backslashes with trimIndent or trimMargin, and escapes work only in regular strings.',
          concepts: ['$ and ${} templates', 'Raw strings with triple quotes', 'trimIndent and trimMargin', 'Escaping $ in templates'],
          quiz: [
            ['How do you put a literal $ in a template string?', 'Use \\$ or ${"$"}'],
            ['Do escape sequences work in raw strings?', 'No, \\n stays as two characters.'],
          ],
        },
        {
          title: 'String functions, StringBuilder and Regex',
          description: 'split, substringBefore, padStart, toIntOrNull and the other string extensions, buildString for efficient concatenation, and the Regex class with find, findAll, matchEntire and named groups.',
          concepts: ['Common string extensions', 'toIntOrNull and safe parsing', 'buildString and StringBuilder', 'Regex find, findAll and matchEntire', 'Regex groups and replace'],
          quiz: [
            ['What does "abc".toIntOrNull() return?', 'null.'],
            ['Why use buildString in a loop?', 'It appends to one buffer instead of allocating a string per step.'],
          ],
          prereqs: ['String templates and raw strings'],
        },
      ],
    },
    {
      title: 'Errors, Packages and I/O',
      topics: [
        {
          title: 'Exceptions and try as an expression',
          description: 'Kotlin has no checked exceptions, try/catch/finally is an expression that yields a value, the exception hierarchy comes from the JVM, and the @Throws annotation exists only for Java callers.',
          concepts: ['No checked exceptions', 'try as an expression', 'catch ordering and finally', '@Throws for Java callers', 'Reading a stack trace'],
          quiz: [
            ['Does Kotlin force you to catch IOException?', 'No, all exceptions are unchecked.'],
            ['What is the value of try { parse() } catch (e: Exception) { -1 }?', 'The result of parse(), or -1 if it threw.'],
          ],
        },
        {
          title: 'Result, runCatching and failure modelling',
          description: 'Result<T> with runCatching, getOrElse and fold captures success or failure as a value, sealed classes model domain errors explicitly, and when each style beats throwing.',
          concepts: ['runCatching and Result', 'getOrElse, getOrThrow and fold', 'Sealed classes for domain errors', 'Exceptions versus result types'],
          quiz: [
            ['What does runCatching { f() } return if f throws?', 'A failed Result wrapping the exception.'],
            ['When is a sealed result type better than an exception?', 'When failure is an expected outcome callers must handle.'],
          ],
          prereqs: ['Exceptions and try as an expression'],
        },
        {
          title: 'Preconditions, custom exceptions and Nothing',
          description: 'require for argument checks, check for state, error for impossible branches, defining exception classes with extra fields, and the Nothing type that lets a throwing function fit any expression.',
          concepts: ['require, check and error', 'Custom exception classes', 'The Nothing type', 'Fail fast at boundaries'],
          quiz: [
            ['Which exception does require throw?', 'IllegalArgumentException.'],
            ['What does the Nothing return type mean?', 'The function never returns normally.'],
          ],
          prereqs: ['Exceptions and try as an expression'],
        },
        {
          title: 'Packages, visibility modifiers and modules',
          description: 'public by default, private to a file or class, protected in subclasses, and internal for module-wide visibility that Java cannot express; how Gradle modules map to internal and how to structure a multi-module project.',
          concepts: ['public, private, protected, internal', 'File-private declarations', 'internal and Gradle modules', 'Multi-module project layout'],
          quiz: [
            ['What does internal mean?', 'Visible anywhere inside the same module (compilation unit).'],
            ['What is the default visibility in Kotlin?', 'public.'],
          ],
          prereqs: ['main, packages and top-level declarations'],
        },
        {
          title: 'File I/O and command-line programs',
          description: 'Reading and writing with File.readText, readLines, useLines for streaming, bufferedWriter, kotlin.io.path for Path helpers, readln for stdin, args in main, and exitProcess for exit codes.',
          concepts: ['File.readText and writeText', 'useLines for streaming', 'bufferedWriter and use', 'kotlin.io.path helpers', 'readln, args and exitProcess'],
          quiz: [
            ['Why useLines instead of readLines for a huge file?', 'It streams lazily instead of loading every line into memory.'],
            ['How do you read a line from stdin?', 'readln() or readlnOrNull().'],
          ],
        },
        {
          title: 'kotlinx.serialization and JSON',
          description: 'The compiler plugin generates serialisers for @Serializable classes, Json.encodeToString and decodeFromString round-trip data, and configuration handles default values, unknown keys, sealed hierarchies and custom serialisers.',
          concepts: ['@Serializable and the plugin', 'encodeToString and decodeFromString', 'ignoreUnknownKeys and defaults', 'Polymorphic sealed serialisation', 'Custom serialisers'],
          quiz: [
            ['What must be added for kotlinx.serialization to work?', 'The serialization Gradle plugin and the json runtime library.'],
            ['What happens with an unknown JSON key by default?', 'Decoding throws unless ignoreUnknownKeys = true.'],
          ],
          prereqs: ['Data classes'],
        },
      ],
    },
    {
      title: 'Object-Oriented and Idiomatic Kotlin',
      topics: [
        {
          title: 'Classes, constructors and properties',
          description: 'Primary constructors declare properties inline, init blocks run in order, secondary constructors delegate, and properties have generated getters and setters with custom accessors and the field backing identifier.',
          concepts: ['Primary constructor properties', 'init blocks and ordering', 'Secondary constructors', 'Custom getters and setters', 'Backing fields with field'],
          quiz: [
            ['What does class User(val name: String) generate?', 'A constructor, a private field and a getter for name.'],
            ['What does field refer to in a setter?', 'The backing field of the property.'],
          ],
        },
        {
          title: 'Inheritance, interfaces and abstract classes',
          description: 'Classes are final unless marked open, override is mandatory, abstract classes hold state, interfaces hold default method bodies but no state, and super<Interface> resolves diamond conflicts.',
          concepts: ['open and final by default', 'override and super', 'Abstract classes with state', 'Interface default methods', 'Resolving conflicts with super<T>'],
          quiz: [
            ['Why can you not subclass a plain Kotlin class?', 'Classes are final by default; mark them open.'],
            ['Can an interface have a property with a backing field?', 'No, only abstract or accessor-defined properties.'],
          ],
          prereqs: ['Classes, constructors and properties'],
        },
        {
          title: 'Data classes',
          description: 'data class generates equals, hashCode, toString, copy and componentN from the primary constructor, making value objects one line; the rules on constructor properties and why copy is shallow.',
          concepts: ['Generated equals, hashCode, toString', 'copy with named changes', 'componentN for destructuring', 'Only primary-constructor properties count', 'Data classes as map keys'],
          quiz: [
            ['Is copy() a deep copy?', 'No, nested objects are shared.'],
            ['Which properties feed equals in a data class?', 'Those declared in the primary constructor.'],
          ],
          prereqs: ['Classes, constructors and properties'],
        },
        {
          title: 'Sealed classes and interfaces',
          description: 'A sealed hierarchy lists every subtype at compile time, so when over it is exhaustive without else; the standard way to model states, results and events, with data objects for singleton cases.',
          concepts: ['Sealed hierarchies', 'Exhaustive when without else', 'Modelling UI state and results', 'data object cases', 'Sealed interfaces across files'],
          quiz: [
            ['What happens if you add a subclass to a sealed class?', 'Every exhaustive when without else stops compiling until updated.'],
            ['Where must sealed subclasses be declared?', 'In the same module and package.'],
          ],
          prereqs: ['Inheritance, interfaces and abstract classes'],
        },
        {
          title: 'Enum classes, objects and companion objects',
          description: 'Enum classes with properties, methods and entries, object declarations for singletons, companion objects as the place for factory functions and constants, and object expressions for anonymous implementations.',
          concepts: ['Enum entries with properties', 'object singletons', 'companion object factories', 'Object expressions', 'Enum.entries and valueOf'],
          quiz: [
            ['How do you write a static-like factory method?', 'Inside a companion object.'],
            ['Is an object declaration lazily initialised?', 'Yes, on first access, and it is thread-safe.'],
          ],
          prereqs: ['Classes, constructors and properties'],
        },
        {
          title: 'Delegation and property delegates',
          description: 'Class delegation with by forwards an interface to another object without boilerplate, and property delegates such as lazy, observable, vetoable and map-backed properties plus custom getValue and setValue operators.',
          concepts: ['Interface delegation with by', 'Delegates.observable and vetoable', 'Map-backed properties', 'Custom delegates with getValue and setValue', 'Delegation versus inheritance'],
          quiz: [
            ['What does class Logger(list: List<String>) : List<String> by list do?', 'Implements List by forwarding every call to list.'],
            ['Which operator functions does a property delegate need?', 'getValue, and setValue for var.'],
          ],
          prereqs: ['Inheritance, interfaces and abstract classes'],
        },
        {
          title: 'Generics and variance',
          description: 'Generic classes and functions, upper bounds with where, declaration-site variance with out and in, star projections, and why List<out E> lets a List<String> be a List<Any> while MutableList does not.',
          concepts: ['Generic classes and functions', 'Upper bounds and where', 'out and in declaration-site variance', 'Star projections', 'Type erasure on the JVM'],
          quiz: [
            ['Why is List<String> assignable to List<Any>?', 'List is declared List<out E>, covariant, because it only produces E.'],
            ['What does in T mean?', 'T appears only in input positions; the type is contravariant.'],
          ],
          prereqs: ['Inheritance, interfaces and abstract classes'],
        },
      ],
    },
    {
      title: 'Java Interoperability',
      description: 'Kotlin lives on the JVM beside Java; both directions have rules worth knowing.',
      topics: [
        {
          title: 'Calling Java from Kotlin',
          description: 'Java getters and setters appear as Kotlin properties, single-method interfaces accept lambdas through SAM conversion, Java collections map to Kotlin mutable types, and static members are called through the class name.',
          concepts: ['Getters and setters as properties', 'SAM conversions for lambdas', 'Java collections in Kotlin', 'Static members and Java varargs', 'Escaping Kotlin keywords with backticks'],
          quiz: [
            ['How does user.getName() appear in Kotlin?', 'As user.name.'],
            ['Can you pass a Kotlin lambda to a Java Runnable parameter?', 'Yes, through SAM conversion.'],
          ],
        },
        {
          title: 'Calling Kotlin from Java',
          description: 'Top-level functions become static methods on a FileNameKt class renamed with @JvmName, @JvmStatic exposes companion members statically, @JvmOverloads generates overloads for default arguments, and @JvmField skips accessors.',
          concepts: ['FileNameKt and @JvmName', '@JvmStatic on companions', '@JvmOverloads for defaults', '@JvmField and constants', 'Kotlin types as seen from Java'],
          quiz: [
            ['How does Java call a top-level fun in Utils.kt?', 'UtilsKt.functionName(), unless @file:JvmName renames it.'],
            ['What does @JvmOverloads generate?', 'One Java overload per omitted default parameter.'],
          ],
          prereqs: ['Calling Java from Kotlin'],
        },
        {
          title: 'Platform types and nullability annotations',
          description: 'Values from unannotated Java have platform types (String!) whose nullability Kotlin cannot check, so NPEs can surface at Kotlin call sites; @Nullable and @NotNull annotations fix that, and mixed builds need consistent JVM targets.',
          concepts: ['Platform types and the ! notation', '@Nullable and @NotNull', 'Where NPEs surface in mixed code', 'Consistent jvmTarget and toolchains', 'kapt versus KSP for annotation processors'],
          quiz: [
            ['What is a platform type?', 'A Java-sourced type whose nullability is unknown to the compiler.'],
            ['Why prefer KSP over kapt?', 'It is faster and does not generate Java stubs.'],
          ],
          prereqs: ['Calling Java from Kotlin', 'Nullable types and safe calls'],
        },
      ],
    },
    {
      title: 'Memory, Performance and Security',
      topics: [
        {
          title: 'JVM memory, boxing and value classes',
          description: 'Kotlin objects live on the JVM heap under the garbage collector, nullable Int? and generics box primitives, @JvmInline value classes wrap a single value with no allocation in most positions, and references not ownership decide lifetime.',
          concepts: ['Heap objects and the JVM garbage collector', 'Boxing of Int? and generics', '@JvmInline value classes', 'Memory leaks through long-lived references', 'Weak references and caches'],
          quiz: [
            ['Does Int? box its value?', 'Yes, it becomes java.lang.Integer.'],
            ['What does a value class compile to?', 'The underlying type where possible, boxed only when used generically.'],
          ],
        },
        {
          title: 'Resource management with use and Closeable',
          description: 'Files, sockets and streams implement Closeable or AutoCloseable; use { } closes them even on exceptions like Java try-with-resources, and try/finally handles resources without that interface.',
          concepts: ['Closeable and AutoCloseable', 'The use extension', 'try/finally for other resources', 'Closing in the right order'],
          quiz: [
            ['What does file.bufferedReader().use { } guarantee?', 'The reader is closed when the block ends, even if it throws.'],
            ['What Java construct does use correspond to?', 'try-with-resources.'],
          ],
          prereqs: ['File I/O and command-line programs'],
        },
        {
          title: 'Profiling and benchmarking Kotlin',
          description: 'Measure before optimising: JVM profilers such as IntelliJ Profiler and async-profiler, kotlinx-benchmark and JMH for micro-benchmarks that beat JIT warm-up, and common wins like sequences, primitive arrays and avoiding lambda allocation.',
          concepts: ['IntelliJ Profiler and async-profiler', 'kotlinx-benchmark and JMH', 'JIT warm-up and measurement pitfalls', 'Typical Kotlin hot-path fixes'],
          quiz: [
            ['Why not time code with System.nanoTime in a loop?', 'JIT compilation and GC distort naive timings; use JMH-style harnesses.'],
            ['What does inline save in a hot loop?', 'The allocation of a lambda object per call.'],
          ],
          prereqs: ['JVM memory, boxing and value classes'],
        },
        {
          title: 'Secure Kotlin code',
          description: 'Parameterised queries with JDBC or Exposed, validating and bounding input with require, avoiding deserialisation of untrusted classes, hashing passwords with bcrypt or argon2, and dependency scanning with OWASP or Gradle tooling.',
          concepts: ['Parameterised queries', 'Input validation at boundaries', 'Deserialisation risks', 'Password hashing and secrets', 'Dependency vulnerability scanning'],
          quiz: [
            ['Why never build SQL with string templates?', 'User input becomes executable SQL; use parameters.'],
            ['Where should secrets live?', 'Environment variables or a secrets manager, never in source.'],
          ],
        },
      ],
    },
    {
      title: 'Coroutines and Flows',
      description: 'Asynchronous code that reads sequentially: the kotlinx.coroutines library.',
      topics: [
        {
          title: 'Suspending functions and coroutine builders',
          description: 'suspend functions can pause without blocking a thread, launch starts fire-and-forget work, async returns a Deferred you await, runBlocking bridges to blocking code, and delay replaces Thread.sleep.',
          concepts: ['suspend functions', 'launch and Job', 'async and await', 'runBlocking at the boundary', 'delay versus Thread.sleep'],
          quiz: [
            ['Can you call a suspend function from a normal function?', 'No, only from another suspend function or a coroutine builder.'],
            ['What does async return?', 'A Deferred<T> whose result you get with await().'],
          ],
        },
        {
          title: 'Structured concurrency and cancellation',
          description: 'Coroutines form a parent-child tree through CoroutineScope and Job, so a parent waits for and cancels its children; cancellation is cooperative and checked at suspension points, with coroutineScope and supervisorScope for grouping.',
          concepts: ['CoroutineScope and Job hierarchy', 'coroutineScope and supervisorScope', 'Cooperative cancellation and isActive', 'CancellationException handling', 'withTimeout and withTimeoutOrNull'],
          quiz: [
            ['What happens to children when a parent is cancelled?', 'They are cancelled too.'],
            ['Why does a CPU-bound loop ignore cancel()?', 'Cancellation is only checked at suspension points; call ensureActive or yield.'],
          ],
          prereqs: ['Suspending functions and coroutine builders'],
        },
        {
          title: 'Dispatchers and withContext',
          description: 'Dispatchers.Default for CPU work, IO for blocking calls, Main on Android, withContext to switch threads inside a coroutine, and why blocking a Default thread starves everything else.',
          concepts: ['Dispatchers.Default, IO and Main', 'withContext for thread switching', 'Unconfined and custom dispatchers', 'Never block Default'],
          quiz: [
            ['Which dispatcher suits a JDBC call?', 'Dispatchers.IO.'],
            ['Does withContext create a new coroutine?', 'No, it suspends the current one and resumes on the new dispatcher.'],
          ],
          prereqs: ['Suspending functions and coroutine builders'],
        },
        {
          title: 'Exception handling in coroutines',
          description: 'Exceptions in launch propagate to the parent and cancel siblings, async exceptions surface at await, SupervisorJob isolates failures, CoroutineExceptionHandler catches uncaught ones, and try/catch must not swallow CancellationException.',
          concepts: ['Propagation in launch versus async', 'SupervisorJob isolation', 'CoroutineExceptionHandler', 'Do not swallow CancellationException'],
          quiz: [
            ['Where does an exception from async surface?', 'When await() is called.'],
            ['Why rethrow CancellationException in a catch block?', 'Otherwise the coroutine ignores cancellation and keeps running.'],
          ],
          prereqs: ['Structured concurrency and cancellation'],
        },
        {
          title: 'Channels and shared mutable state',
          description: 'Channels pass values between coroutines with suspension instead of locks, produce builds a producer coroutine, Mutex protects shared state suspendingly, and confining state to one coroutine avoids races.',
          concepts: ['Channel send and receive', 'produce and consumeEach', 'Buffered and rendezvous channels', 'Mutex.withLock', 'Thread confinement of state'],
          quiz: [
            ['Does Channel.send block a thread?', 'No, it suspends the coroutine.'],
            ['Why is a plain var counter unsafe across coroutines on Default?', 'They run on multiple threads; use Mutex, atomics or confinement.'],
          ],
          prereqs: ['Structured concurrency and cancellation'],
        },
        {
          title: 'Flow: cold streams and operators',
          description: 'A Flow emits values lazily each time it is collected, operators like map, filter, take and transform stay lazy, flowOn changes the upstream dispatcher, and catch and onCompletion handle errors and cleanup.',
          concepts: ['Cold flows and flow builders', 'map, filter, take and transform', 'flowOn and context preservation', 'catch and onCompletion', 'Backpressure by suspension'],
          quiz: [
            ['When does a flow start emitting?', 'When a terminal operator such as collect runs.'],
            ['Where does flowOn apply?', 'To the operators upstream of it.'],
          ],
          prereqs: ['Structured concurrency and cancellation'],
        },
        {
          title: 'StateFlow, SharedFlow and hot streams',
          description: 'StateFlow holds the latest value for UI state, SharedFlow broadcasts events with replay and buffering, stateIn and shareIn convert cold flows, and combine and flatMapLatest merge sources.',
          concepts: ['StateFlow for state', 'SharedFlow for events', 'stateIn and shareIn', 'combine and flatMapLatest', 'Collecting safely on Android lifecycles'],
          quiz: [
            ['Does StateFlow emit equal consecutive values?', 'No, it conflates duplicates.'],
            ['What does replay = 1 on a SharedFlow do?', 'New subscribers receive the most recent value.'],
          ],
          prereqs: ['Flow: cold streams and operators'],
        },
      ],
    },
    {
      title: 'Testing, Debugging and Build',
      topics: [
        {
          title: 'JUnit 5, kotlin.test and Kotest',
          description: 'Writing tests with JUnit 5 annotations or the kotlin.test wrappers, backtick test names, parameterised tests, assertion styles, and Kotest as an alternative with its spec styles and property testing.',
          concepts: ['JUnit 5 test structure', 'kotlin.test assertions', 'Backtick test names', 'Parameterised tests', 'Kotest specs'],
          quiz: [
            ['Can a Kotlin test function be named with spaces?', 'Yes, using backticks: fun `adds two numbers`()'],
            ['Which Gradle task runs tests?', './gradlew test'],
          ],
        },
        {
          title: 'MockK and fakes',
          description: 'MockK mocks Kotlin classes, final by default, with every { } stubs and verify { } checks, coEvery for suspend functions, relaxed mocks, and when a hand-written fake behind an interface is clearer.',
          concepts: ['every and verify', 'coEvery for suspend functions', 'Relaxed mocks and slots', 'Fakes behind interfaces', 'Over-mocking smells'],
          quiz: [
            ['How do you stub a suspend function in MockK?', 'coEvery { repo.load() } returns value'],
            ['Why can Mockito struggle with Kotlin classes?', 'Kotlin classes are final by default.'],
          ],
          prereqs: ['JUnit 5, kotlin.test and Kotest'],
        },
        {
          title: 'Testing coroutines and flows',
          description: 'runTest skips delays with virtual time, StandardTestDispatcher and advanceUntilIdle control scheduling, Turbine makes Flow assertions readable, and Main dispatcher replacement for Android tests.',
          concepts: ['runTest and virtual time', 'StandardTestDispatcher and advanceUntilIdle', 'Turbine for flows', 'Replacing Dispatchers.Main in tests'],
          quiz: [
            ['Does delay(1000) inside runTest wait a second?', 'No, virtual time skips it.'],
            ['What does Turbine\'s awaitItem do?', 'Suspends until the flow emits the next value and returns it.'],
          ],
          prereqs: ['StateFlow, SharedFlow and hot streams', 'JUnit 5, kotlin.test and Kotest'],
        },
        {
          title: 'Debugging in IntelliJ IDEA',
          description: 'Breakpoints with conditions and logging, evaluating expressions, stepping into inline and suspend functions, the Coroutines debugger tab, and decompiling to Java bytecode to see what the compiler generated.',
          concepts: ['Conditional and logging breakpoints', 'Evaluate expression', 'Coroutines debugger view', 'Show Kotlin bytecode and decompile'],
          quiz: [
            ['How do you see what a Kotlin construct compiles to?', 'Tools > Kotlin > Show Kotlin Bytecode, then Decompile.'],
            ['What does the Coroutines tab show?', 'Live coroutines with their state and stack traces.'],
          ],
        },
        {
          title: 'Gradle dependencies, version catalogs and packaging',
          description: 'implementation versus api scopes, version catalogs in libs.versions.toml, the Kotlin BOM, building runnable jars with the application plugin or shadow, and publishing libraries with maven-publish.',
          concepts: ['implementation versus api', 'libs.versions.toml catalogs', 'application plugin and distributions', 'Shadow jars', 'maven-publish'],
          quiz: [
            ['Difference between implementation and api?', 'api leaks the dependency to consumers; implementation keeps it internal.'],
            ['What does the application plugin give you?', 'run and installDist tasks with start scripts.'],
          ],
          prereqs: ['Gradle with the Kotlin DSL and ktlint'],
        },
      ],
    },
    {
      title: 'Kotlin for Android and Ktor',
      description: 'The two places Kotlin is used most; deeper coverage lives in track-android and the backend tracks.',
      style: 'practice',
      topics: [
        {
          title: 'Android: activities, ViewModel and lifecycle-aware coroutines',
          description: 'How an Activity or Fragment lifecycle interacts with Kotlin code, ViewModel surviving configuration changes, viewModelScope and lifecycleScope for coroutines, and repeatOnLifecycle for collecting flows safely.',
          concepts: ['Activity and Fragment lifecycle', 'ViewModel and viewModelScope', 'lifecycleScope and repeatOnLifecycle', 'Kotlin Android extensions and KTX'],
          quiz: [
            ['Why launch in viewModelScope?', 'It is cancelled automatically when the ViewModel is cleared.'],
            ['What does repeatOnLifecycle(STARTED) do?', 'Restarts the block when the lifecycle reaches STARTED and cancels it below that.'],
          ],
          prereqs: ['StateFlow, SharedFlow and hot streams'],
        },
        {
          title: 'Jetpack Compose fundamentals',
          description: 'Declarative UI in Kotlin: @Composable functions, state with remember and mutableStateOf, recomposition, state hoisting, and collecting a StateFlow with collectAsStateWithLifecycle.',
          concepts: ['@Composable functions', 'remember and mutableStateOf', 'Recomposition', 'State hoisting', 'collectAsStateWithLifecycle'],
          quiz: [
            ['What triggers recomposition?', 'A change to State read inside the composable.'],
            ['Why hoist state?', 'The composable becomes stateless, reusable and testable.'],
          ],
          prereqs: ['Android: activities, ViewModel and lifecycle-aware coroutines'],
        },
        {
          title: 'Ktor server: routing, plugins and content negotiation',
          description: 'embeddedServer with Netty or CIO, the routing DSL with route groups and parameters, plugins installed per application such as ContentNegotiation with kotlinx.serialization, CallLogging and StatusPages.',
          concepts: ['embeddedServer and engines', 'Routing DSL and parameters', 'Installing plugins', 'ContentNegotiation with JSON', 'StatusPages for errors'],
          quiz: [
            ['How does a Ktor handler read a JSON body?', 'call.receive<T>() with ContentNegotiation installed.'],
            ['How do you respond with a status and body?', 'call.respond(HttpStatusCode.Created, body)'],
          ],
          prereqs: ['kotlinx.serialization and JSON', 'Suspending functions and coroutine builders'],
        },
        {
          title: 'Ktor: persistence with Exposed and authentication',
          description: 'Exposed DSL and DAO for typed SQL, HikariCP pooling and transactions on Dispatchers.IO, the Authentication plugin with JWT or sessions, and configuration through application.conf or environment variables.',
          concepts: ['Exposed tables and queries', 'HikariCP and transactions', 'JWT authentication plugin', 'Sessions and cookies', 'Configuration and environment'],
          quiz: [
            ['Why wrap Exposed calls in withContext(Dispatchers.IO)?', 'JDBC blocks the thread and must not run on Default.'],
            ['What does the authenticate("auth-jwt") block do?', 'Protects the routes inside it with the named provider.'],
          ],
          prereqs: ['Ktor server: routing, plugins and content negotiation'],
        },
        {
          title: 'Ktor client and Kotlin Multiplatform',
          description: 'HttpClient with engines per platform, JSON via ContentNegotiation, timeouts and retries, and how Kotlin Multiplatform shares that code between Android, iOS, desktop and web with expect/actual declarations.',
          concepts: ['HttpClient and engines', 'Client ContentNegotiation and JSON', 'HttpTimeout and HttpRequestRetry', 'Multiplatform source sets', 'expect and actual declarations'],
          quiz: [
            ['How does one Ktor client run on both Android and iOS?', 'Common code uses HttpClient; each platform supplies an engine.'],
            ['What does expect/actual do?', 'Declares an API in common code with a platform-specific implementation.'],
          ],
          prereqs: ['Ktor server: routing, plugins and content negotiation'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: command-line expense tracker',
          description: 'Build a CLI that records expenses in a JSON file with kotlinx.serialization, models categories with a sealed class, aggregates monthly totals with groupingBy, and ships with kotlin.test coverage and a runnable distribution.',
          concepts: ['Model expenses and commands', 'Persist with kotlinx.serialization', 'Aggregate with the collections API', 'Test and package with the application plugin'],
          quiz: [
            ['How do you make categories exhaustive in when?', 'Model them as a sealed class or enum.'],
            ['Where should the JSON file live?', 'A per-user directory under the home folder.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Ktor REST API with Exposed and JWT',
          description: 'A Ktor service exposing CRUD routes for a resource, Exposed tables with migrations, JWT-protected endpoints, StatusPages error mapping, integration tests with testApplication, and a Dockerfile.',
          concepts: ['Design routes and DTOs', 'Persistence layer with Exposed', 'JWT auth and error mapping', 'Test with testApplication and containerise'],
          quiz: [
            ['What does testApplication give you?', 'An in-process Ktor server and client for integration tests.'],
            ['Where should validation of request bodies happen?', 'At the route boundary, before touching the database.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Android notes app with Compose and Room',
          description: 'A notes app with Jetpack Compose screens, a ViewModel exposing StateFlow, Room for local storage observed as a Flow, coroutine-backed repository, and unit tests with runTest and Turbine.',
          concepts: ['Screens and navigation in Compose', 'ViewModel state with StateFlow', 'Room DAO returning Flow', 'Test the ViewModel with runTest'],
          quiz: [
            ['Why return Flow<List<Note>> from a Room DAO?', 'The UI updates automatically when the table changes.'],
            ['How does Compose observe the ViewModel?', 'collectAsStateWithLifecycle on the StateFlow.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent web scraper with coroutines',
          description: 'Fetch many pages with the Ktor client and a bounded number of concurrent coroutines, parse with jsoup, stream results through a Flow into a CSV, handle timeouts and cancellation on Ctrl-C.',
          concepts: ['Bounded concurrency with Semaphore', 'Fetch and parse pages', 'Stream results with Flow', 'Timeouts, retries and cancellation'],
          quiz: [
            ['How do you limit concurrency to 10 coroutines?', 'kotlinx.coroutines.sync.Semaphore(10) around each fetch.'],
            ['Why use a Flow for results?', 'Consumers process pages as they arrive instead of waiting for all.'],
          ],
          style: 'project',
        },
        {
          title: 'Kotlin interview questions',
          description: 'What interviewers ask: val versus var, nullable types and !!, data versus regular classes, sealed classes, extension resolution, inline and reified, coroutines versus threads, structured concurrency, and Java interop pitfalls.',
          concepts: ['Null safety questions', 'Class and object model questions', 'Coroutine questions', 'Interop and JVM questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['How do coroutines differ from threads?', 'They are lightweight, suspend without blocking and are scheduled onto a thread pool.'],
            ['Why are extension functions not virtual?', 'They compile to static functions resolved by the declared type.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Kotlin',
          description: 'Solving problems fast in Kotlin: readLine and split parsing, IntArray and ArrayDeque, PriorityQueue from Java, sortedWith comparators, StringBuilder output, and avoiding boxing and hidden allocations in tight loops.',
          concepts: ['Fast input parsing', 'ArrayDeque and PriorityQueue', 'Comparators in interviews', 'Boxing traps in hot loops', 'Idiomatic helpers under time pressure'],
          quiz: [
            ['Which class gives a min-heap in Kotlin?', 'java.util.PriorityQueue.'],
            ['Why prefer IntArray in an interview loop?', 'No boxing, so it is faster and uses less memory.'],
          ],
        },
      ],
    },
  ],
})
