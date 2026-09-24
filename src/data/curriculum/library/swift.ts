import { defineTrack } from '../define'

export const swift = defineTrack({
  id: 'track-swift',
  title: 'Swift',
  description: 'Swift from Xcode and the toolchain to idiomatic, safe, concurrent code: optionals, value versus reference types, protocol-oriented programming, generics, closures, error handling, ARC, async/await and actors, Swift Package Manager, testing and Instruments, iOS and server-side Vapor applications, projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🦅',
  tags: ['swift', 'ios', 'apple', 'swiftui', 'vapor', 'concurrency', 'mobile'],
  languages: ['Swift'],
  explainMode: 'concept',
  code: { label: 'Swift', id: 'swift', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'Toolchains on macOS and Linux, and the editors and formatters that go with them.',
      topics: [
        {
          title: 'Installing Xcode and Swift toolchains',
          description: 'Xcode bundles the compiler, simulators and SDKs on macOS, while swift.org toolchains and the swiftly manager install Swift on Linux and Windows; xcode-select and swift --version confirm which toolchain is active.',
          concepts: ['Xcode and command line tools', 'swift.org toolchains and swiftly', 'xcode-select and active toolchains', 'Swift versions and language modes'],
          quiz: [
            ['Do you need Xcode to write Swift on Linux?', 'No, the swift.org toolchain provides the compiler and SwiftPM.'],
            ['What does swift --version show?', 'The active compiler version and target triple.'],
          ],
        },
        {
          title: 'Xcode, Playgrounds and the swift REPL',
          description: 'Where to write Swift before a full app: Xcode projects and schemes, Playgrounds for live experimentation, the swift REPL for quick checks, and VS Code with the Swift extension on Linux.',
          concepts: ['Xcode projects, targets and schemes', 'Playgrounds for experiments', 'The swift REPL', 'VS Code with the Swift extension'],
          quiz: [
            ['How do you start the interactive shell?', 'Run swift with no arguments, or swift repl.'],
            ['What is a scheme in Xcode?', 'A named configuration of what to build, run, test and profile.'],
          ],
          prereqs: ['Installing Xcode and Swift toolchains'],
        },
        {
          title: 'swift-format, SwiftLint and API design guidelines',
          description: 'Consistent style from day one: swift-format or SwiftLint enforce layout and rules, and the Swift API Design Guidelines shape naming, argument labels and clarity at the point of use.',
          concepts: ['swift-format configuration', 'SwiftLint rules', 'API Design Guidelines naming', 'Clarity at the point of use'],
          quiz: [
            ['What do the API Design Guidelines say about naming?', 'Prioritise clarity at the call site over brevity.'],
            ['How do you run SwiftLint in a build?', 'Add a run-script build phase or a SwiftPM plugin.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'Files, main.swift and @main',
          description: 'Top-level code runs only in main.swift, @main marks a type whose static main starts the program, statements need no semicolons, and imports bring in Foundation and other modules.',
          concepts: ['main.swift top-level code', '@main entry point types', 'Imports and Foundation', 'Comments and documentation markup'],
          quiz: [
            ['Where is top-level executable code allowed?', 'Only in main.swift, or through @main on a type.'],
            ['What does @main require?', 'A static func main() on the annotated type.'],
          ],
        },
        {
          title: 'Constants, variables and basic types',
          description: 'let for constants and var for variables, type inference with explicit annotations where clarity helps, Int, Double, Bool, String and Character, no implicit numeric conversion, and typealias.',
          concepts: ['let versus var', 'Type inference and annotations', 'Int, Double, Bool, String, Character', 'No implicit numeric conversion', 'typealias'],
          quiz: [
            ['Can you add an Int and a Double directly?', 'No, convert one explicitly: Double(x) + y.'],
            ['What is the default integer type?', 'Int, which is 64-bit on modern platforms.'],
          ],
        },
        {
          title: 'Operators and expressions',
          description: 'Arithmetic that traps on overflow unless you use &+ style operators, comparison and logical operators, closed and half-open range operators, nil-coalescing ??, the ternary, and custom operators with precedence groups.',
          concepts: ['Overflow trapping and &+ operators', 'Ranges ..< and ...', 'Nil-coalescing ??', 'Ternary operator', 'Custom operators and precedence groups'],
          quiz: [
            ['What happens on Int.max + 1?', 'A runtime trap; use &+ for wrapping arithmetic.'],
            ['What does 1...5 contain?', 'Integers 1 through 5 inclusive.'],
          ],
          prereqs: ['Constants, variables and basic types'],
        },
        {
          title: 'if, guard and switch with pattern matching',
          description: 'if and guard for early exit with unwrapped bindings staying in scope, switch that must be exhaustive and supports ranges, tuples, value bindings and where clauses, plus if and switch as expressions.',
          concepts: ['guard for early exit', 'Exhaustive switch', 'Ranges, tuples and where in cases', 'Value binding patterns', 'if and switch expressions'],
          quiz: [
            ['What must a guard body do?', 'Exit the scope with return, break, continue or throw.'],
            ['Does switch fall through by default?', 'No, use the fallthrough keyword explicitly.'],
          ],
          prereqs: ['Operators and expressions'],
        },
        {
          title: 'Loops, stride and labels',
          description: 'for-in over ranges, collections and enumerated pairs, while and repeat-while, stride(from:to:by:) for stepped counts, and labeled statements to break or continue an outer loop.',
          concepts: ['for-in and enumerated', 'while and repeat-while', 'stride(from:to:by:)', 'Labeled break and continue'],
          quiz: [
            ['How do you count down from 10 to 0 by 2?', 'for i in stride(from: 10, through: 0, by: -2)'],
            ['How does repeat-while differ from while?', 'The body runs at least once before the condition is checked.'],
          ],
          prereqs: ['Operators and expressions'],
        },
      ],
    },
    {
      title: 'Optionals and Functions',
      description: 'Absence made explicit, and the function and closure syntax everything else builds on.',
      topics: [
        {
          title: 'Optionals and unwrapping',
          description: 'Optional<T> is an enum with .none and .some, so nil is a value not a crash; if let, guard let and the shorthand if let x, ?? for defaults, and why force unwrapping with ! belongs only where nil is a programmer error.',
          concepts: ['Optional as an enum', 'if let and guard let', 'Shorthand if let x', 'Defaults with ??', 'Force unwrap and implicitly unwrapped optionals'],
          quiz: [
            ['What does guard let x = maybe else { return } give after the guard?', 'A non-optional x in the rest of the scope.'],
            ['When is an implicitly unwrapped optional (T!) reasonable?', 'For outlets and values guaranteed set before first use.'],
          ],
        },
        {
          title: 'Optional chaining and map on optionals',
          description: 'a?.b?.c short-circuits to nil, assignments through chains, optional map and flatMap to transform without unwrapping, comparing optionals, and optional pattern matching in switch and if case.',
          concepts: ['Optional chaining ?.', 'Assignment through chains', 'map and flatMap on optionals', 'if case .some pattern matching'],
          quiz: [
            ['What type does user?.address?.city have?', 'String?, a single level of optional.'],
            ['What does maybeInt.map { $0 * 2 } return?', 'An Int? with the doubled value or nil.'],
          ],
          prereqs: ['Optionals and unwrapping'],
        },
        {
          title: 'Functions, argument labels and inout',
          description: 'External argument labels versus internal names, omitting labels with _, default values, variadic parameters, multiple returns with tuples, inout parameters with &, and functions as first-class values.',
          concepts: ['Argument labels and _', 'Default and variadic parameters', 'Tuples as return values', 'inout and &', 'Function types as values'],
          quiz: [
            ['How do you call func move(from a: Int, to b: Int)?', 'move(from: 1, to: 2)'],
            ['Is inout pass-by-reference?', 'No, copy-in copy-out; the caller sees the result after the call.'],
          ],
        },
        {
          title: 'Closures and capture lists',
          description: 'Closure expression syntax, shorthand arguments $0 and $1, trailing closures, escaping versus non-escaping, autoclosures, and capture lists with weak and unowned to control what a closure keeps alive.',
          concepts: ['Closure expression syntax and $0', 'Trailing closures', '@escaping versus non-escaping', 'Capture lists [weak self]', '@autoclosure'],
          quiz: [
            ['When must a closure parameter be marked @escaping?', 'When it is stored or called after the function returns.'],
            ['What does [weak self] do?', 'Captures self weakly so the closure does not keep it alive.'],
          ],
          prereqs: ['Functions, argument labels and inout'],
        },
        {
          title: 'map, filter, reduce and compactMap',
          description: 'The functional toolkit on sequences: map, filter, reduce with into, compactMap to drop nils, flatMap to flatten, contains(where:), first(where:) and allSatisfy, and when a for loop is clearer.',
          concepts: ['map and filter', 'reduce and reduce(into:)', 'compactMap and flatMap', 'first(where:) and allSatisfy', 'Readability limits of chaining'],
          quiz: [
            ['What does ["1", "x", "3"].compactMap(Int.init) give?', '[1, 3].'],
            ['Why prefer reduce(into:) for building a dictionary?', 'It mutates one accumulator instead of copying on each step.'],
          ],
          prereqs: ['Closures and capture lists'],
        },
      ],
    },
    {
      title: 'Collections and Strings',
      topics: [
        {
          title: 'Arrays',
          description: 'Ordered value-type collections with copy-on-write, literals and repeating initialisers, indexing that traps out of bounds, append, insert and remove costs, slices with ArraySlice, and reserveCapacity.',
          concepts: ['Array literals and initialisers', 'Indexing traps and first/last', 'append, insert and remove costs', 'ArraySlice and indices', 'reserveCapacity'],
          quiz: [
            ['What happens when you read array[10] on a 3-element array?', 'A runtime trap; use indices.contains or first/last.'],
            ['Do slices start at index 0?', 'No, they keep the parent\'s indices.'],
          ],
        },
        {
          title: 'Dictionaries and sets',
          description: 'Hash-based collections requiring Hashable keys, optional subscript results, default subscripts, grouping with Dictionary(grouping:by:), set algebra, and why iteration order is unspecified.',
          concepts: ['Dictionary subscripts return optionals', 'Default subscripts and updateValue', 'Dictionary(grouping:by:)', 'Set operations', 'Hashable and iteration order'],
          quiz: [
            ['What does dict["missing"] return?', 'nil, because the subscript returns an optional.'],
            ['How do you increment a count safely?', 'counts[key, default: 0] += 1'],
          ],
        },
        {
          title: 'Sequence, Collection and lazy',
          description: 'The protocol hierarchy behind every collection: Sequence for iteration, Collection with indices and subranges, BidirectionalCollection and RandomAccessCollection guarantees, and lazy for on-demand chains.',
          concepts: ['Sequence and IteratorProtocol', 'Collection indices and subranges', 'Bidirectional and RandomAccess guarantees', 'lazy sequences', 'Writing a custom Sequence'],
          quiz: [
            ['Why is String not RandomAccessCollection?', 'Grapheme clusters vary in size, so indexing is O(n).'],
            ['What does .lazy change?', 'Operations run on demand per element instead of building intermediate arrays.'],
          ],
          prereqs: ['Arrays'],
        },
        {
          title: 'Sorting and searching',
          description: 'sort and sorted with by closures, KeyPathComparator and sorted(using:), stability guarantees, min and max, binary search on sorted data with partition, and firstIndex(where:).',
          concepts: ['sort versus sorted', 'Comparators and KeyPathComparator', 'Stable sorting guarantees', 'partition(by:) as binary search', 'firstIndex and min/max'],
          quiz: [
            ['Is Swift\'s sort stable?', 'Yes, since Swift 5 the standard sort is stable.'],
            ['How do you sort by name then age?', 'sorted(using: [KeyPathComparator(\\.name), KeyPathComparator(\\.age)])'],
          ],
          prereqs: ['Arrays'],
        },
        {
          title: 'Strings, Characters and Unicode',
          description: 'Strings are collections of grapheme clusters, so count is O(n) and indices are String.Index rather than Int; unicodeScalars and utf8 views, comparison by canonical equivalence, and multi-line and raw string literals.',
          concepts: ['Grapheme clusters and count', 'String.Index and offsets', 'unicodeScalars and utf8 views', 'Canonical equivalence', 'Multi-line and raw literals'],
          quiz: [
            ['Why can you not write str[0]?', 'Indices are String.Index because characters vary in byte length.'],
            ['Are "é" (one scalar) and "e\\u{301}" equal?', 'Yes, Swift compares by canonical equivalence.'],
          ],
        },
        {
          title: 'String interpolation, formatting and Regex',
          description: 'Interpolation with \\(), custom interpolation types, formatted() with number, date and list styles, split and components, and Swift Regex literals with RegexBuilder for readable patterns and typed captures.',
          concepts: ['Interpolation and custom StringInterpolation', 'formatted() styles', 'split versus components(separatedBy:)', 'Regex literals and captures', 'RegexBuilder'],
          quiz: [
            ['What does 1234.5.formatted(.number.precision(.fractionLength(1))) give?', '"1,234.5" in a US locale.'],
            ['What does a Regex literal look like?', '/\\d+/ with typed captures available on matches.'],
          ],
          prereqs: ['Strings, Characters and Unicode'],
        },
      ],
    },
    {
      title: 'Error Handling',
      topics: [
        {
          title: 'throws, try and do-catch',
          description: 'Functions marked throws propagate errors explicitly at call sites with try, do-catch blocks pattern-match errors, try? converts to an optional and try! traps, and errors are ordinary values conforming to Error.',
          concepts: ['throws and try', 'do-catch with patterns', 'try? and try!', 'Error propagation through rethrows'],
          quiz: [
            ['What does try? parse() return on failure?', 'nil.'],
            ['Must every do-catch be exhaustive?', 'Only if the enclosing function does not itself throw.'],
          ],
        },
        {
          title: 'Custom error types',
          description: 'Enums with associated values as the natural error type, structs for errors carrying context, LocalizedError for user-facing text, and matching specific cases in catch clauses.',
          concepts: ['Enum errors with associated values', 'Struct errors with context', 'LocalizedError descriptions', 'Matching cases in catch'],
          quiz: [
            ['What must a type do to be thrown?', 'Conform to the Error protocol.'],
            ['How do you catch one case of an enum error?', 'catch NetworkError.timeout { ... }'],
          ],
          prereqs: ['throws, try and do-catch'],
        },
        {
          title: 'Result and typed throws',
          description: 'Result<Success, Failure> stores an outcome for later or for callbacks, get() rethrows, map and flatMap transform it, and Swift 6 typed throws (throws(MyError)) let callers know exactly which error type to expect.',
          concepts: ['Result and get()', 'map and flatMap on Result', 'Typed throws in Swift 6', 'Choosing throws versus Result'],
          quiz: [
            ['When is Result better than throws?', 'When the outcome must be stored or passed to a callback.'],
            ['What does func f() throws(ParseError) mean?', 'f can only throw ParseError, and catch blocks know that type.'],
          ],
          prereqs: ['Custom error types'],
        },
        {
          title: 'defer, preconditions and fatalError',
          description: 'defer runs cleanup when the scope exits in reverse order, assert is stripped from release builds while precondition is not, and fatalError marks unreachable paths and unrecoverable programmer errors.',
          concepts: ['defer and scope exit order', 'assert versus precondition', 'fatalError and Never', 'Crash early on programmer errors'],
          quiz: [
            ['Does precondition run in release builds?', 'Yes; assert does not.'],
            ['In what order do two defers run?', 'Reverse order of declaration.'],
          ],
        },
      ],
    },
    {
      title: 'Types, Protocols and Generics',
      description: 'Value semantics, protocol-oriented design and generics, the core of idiomatic Swift.',
      topics: [
        {
          title: 'Structs versus classes',
          description: 'Structs and enums are value types copied on assignment with copy-on-write for collections; classes are reference types with identity, inheritance and deinit. Swift prefers structs unless identity or sharing is required.',
          concepts: ['Value semantics and copying', 'Reference semantics and identity', 'Copy-on-write in the standard library', 'Memberwise initialisers', 'Choosing struct or class'],
          quiz: [
            ['What happens with var b = a when a is a struct?', 'b gets an independent copy.'],
            ['When should you choose a class?', 'When you need identity, shared mutable state or inheritance.'],
          ],
        },
        {
          title: 'Enums with associated values',
          description: 'Enums with raw values, associated values carrying payloads per case, exhaustive switching with let bindings, CaseIterable, recursive enums with indirect, and modelling state machines and results.',
          concepts: ['Raw values and CaseIterable', 'Associated values', 'Switching with let bindings', 'indirect recursive enums', 'Enums as state machines'],
          quiz: [
            ['What does CaseIterable provide?', 'A static allCases collection.'],
            ['How do you bind an associated value in switch?', 'case .success(let value):'],
          ],
          prereqs: ['Structs versus classes'],
        },
        {
          title: 'Classes, inheritance and initializers',
          description: 'Designated versus convenience initializers and their delegation rules, two-phase initialisation, required and failable initializers, override and final, and deinit for cleanup.',
          concepts: ['Designated and convenience initializers', 'Two-phase initialisation', 'Failable initializers init?', 'override, final and required', 'deinit'],
          quiz: [
            ['Can a convenience initializer call super.init?', 'No, it must delegate to a designated initializer of the same class.'],
            ['When does init? return nil?', 'When validation fails during initialisation.'],
          ],
          prereqs: ['Structs versus classes'],
        },
        {
          title: 'Properties, observers and property wrappers',
          description: 'Stored and computed properties, lazy stored properties, willSet and didSet observers, static and class properties, and property wrappers like @Published or a custom @Clamped that encapsulate storage behaviour.',
          concepts: ['Stored versus computed properties', 'lazy var', 'willSet and didSet', 'static and class members', 'Custom property wrappers'],
          quiz: [
            ['When does a lazy var initialise?', 'On first access.'],
            ['What does a property wrapper need?', 'A struct or class with a wrappedValue property, marked @propertyWrapper.'],
          ],
          prereqs: ['Structs versus classes'],
        },
        {
          title: 'Protocols and protocol extensions',
          description: 'Protocols declare requirements for properties, methods and initializers; extensions add default implementations and retroactive conformance, and conditional conformance applies where clauses to generic types.',
          concepts: ['Protocol requirements', 'Default implementations in extensions', 'Retroactive conformance', 'Conditional conformance', 'Protocol composition with &'],
          quiz: [
            ['Can you make Int conform to your protocol?', 'Yes, with extension Int: MyProtocol.'],
            ['What does extension Array: Describable where Element: Describable do?', 'Conforms Array only when its elements conform.'],
          ],
          prereqs: ['Structs versus classes'],
        },
        {
          title: 'Protocol-oriented programming',
          description: 'Composing behaviour from small protocols with default implementations instead of class hierarchies, protocol-based dependency injection, Equatable, Hashable and Comparable synthesis, and the dispatch rules for extension methods.',
          concepts: ['Composition over class hierarchies', 'Equatable, Hashable, Comparable synthesis', 'Static versus dynamic dispatch in extensions', 'Protocols for dependency injection', 'Identifiable and Codable conformances'],
          quiz: [
            ['Is a method defined only in a protocol extension dispatched dynamically?', 'No, statically; add it as a requirement for dynamic dispatch.'],
            ['When does the compiler synthesise Hashable?', 'When all stored properties are Hashable and you declare conformance.'],
          ],
          prereqs: ['Protocols and protocol extensions'],
        },
        {
          title: 'Generics, constraints and associated types',
          description: 'Generic functions and types, constraints with where clauses, associated types in protocols like Element in Collection, generic specialisation by the compiler, and parameter packs for variadic generics.',
          concepts: ['Generic functions and types', 'Constraints and where clauses', 'Associated types', 'Generic specialisation', 'Parameter packs'],
          quiz: [
            ['Write a generic swap signature.', 'func swapValues<T>(_ a: inout T, _ b: inout T)'],
            ['What is an associated type?', 'A placeholder type a protocol conformer must specify, such as Element.'],
          ],
          prereqs: ['Protocols and protocol extensions'],
        },
        {
          title: 'Opaque and existential types',
          description: 'some T hides a concrete type while keeping static dispatch, any T boxes any conformer with dynamic dispatch and a cost, why protocols with associated types needed some, primary associated types, and ~Copyable non-copyable types.',
          concepts: ['some for opaque return types', 'any and existential boxing', 'Primary associated types', 'Choosing some versus any', 'Non-copyable ~Copyable types'],
          quiz: [
            ['Difference between some View and any View?', 'some is one concrete type known to the compiler; any is a boxed existential.'],
            ['Why prefer some in performance-sensitive code?', 'It avoids boxing and enables specialisation.'],
          ],
          prereqs: ['Generics, constraints and associated types'],
        },
      ],
    },
    {
      title: 'Memory Management with ARC',
      topics: [
        {
          title: 'How ARC works',
          description: 'Automatic Reference Counting inserts retain and release calls at compile time for class instances; strong references keep objects alive, value types are not counted, and deinit runs when the count reaches zero.',
          concepts: ['Retain and release at compile time', 'Strong references and lifetime', 'Value types are not reference counted', 'deinit timing', 'ARC versus tracing garbage collection'],
          quiz: [
            ['When is a class instance deallocated?', 'When its strong reference count reaches zero.'],
            ['Does ARC handle reference cycles?', 'No, cycles leak unless one side is weak or unowned.'],
          ],
          prereqs: ['Classes, inheritance and initializers'],
        },
        {
          title: 'weak, unowned and retain cycles',
          description: 'Two objects strongly referencing each other never deallocate; weak references become nil automatically, unowned assume the target outlives them, and parent-child and delegate relationships set the pattern.',
          concepts: ['Retain cycles between objects', 'weak optional references', 'unowned references', 'Delegate pattern with weak', 'Ownership direction'],
          quiz: [
            ['Why must weak references be optional?', 'They are set to nil when the target deallocates.'],
            ['When is unowned safe?', 'When the referenced object is guaranteed to outlive the reference.'],
          ],
          prereqs: ['How ARC works'],
        },
        {
          title: 'Closure capture cycles',
          description: 'A closure stored by an object that captures self strongly forms a cycle; [weak self] with guard let self breaks it, and escaping callbacks, timers and Combine sinks are the usual culprits.',
          concepts: ['Closures capture self strongly', 'Breaking cycles with [weak self]', 'guard let self after weak capture', 'Timers, sinks and stored callbacks'],
          quiz: [
            ['Does a non-escaping closure need [weak self]?', 'No, it cannot outlive the call.'],
            ['What does guard let self = self else { return } do?', 'Exits if self was deallocated; otherwise gives a strong reference for the closure body.'],
          ],
          prereqs: ['weak, unowned and retain cycles', 'Closures and capture lists'],
        },
        {
          title: 'Finding leaks with Instruments and the Memory Graph',
          description: 'The Leaks and Allocations instruments, the Xcode Memory Graph Debugger for spotting cycles, deinit logging as a quick check, and Address Sanitizer for memory errors in unsafe code.',
          concepts: ['Leaks and Allocations instruments', 'Memory Graph Debugger', 'deinit logging as a check', 'Address Sanitizer'],
          quiz: [
            ['What does the Memory Graph Debugger show?', 'Live objects and the references keeping them alive.'],
            ['Which instrument tracks allocation growth over time?', 'Allocations.'],
          ],
          prereqs: ['weak, unowned and retain cycles'],
        },
      ],
    },
    {
      title: 'Concurrency',
      description: 'Structured concurrency with async/await, actors and Sendable, the Swift 6 model.',
      topics: [
        {
          title: 'async and await',
          description: 'async functions suspend at await instead of blocking a thread, async let runs work in parallel, and the cooperative thread pool schedules continuations; how to call async code from synchronous contexts with Task.',
          concepts: ['async functions and await', 'Suspension points', 'async let for parallel work', 'Task { } from synchronous code', 'The cooperative thread pool'],
          quiz: [
            ['What does await mark?', 'A point where the function may suspend and resume later.'],
            ['How do you run two async calls concurrently?', 'async let a = f(); async let b = g(); then await both.'],
          ],
        },
        {
          title: 'Tasks, task groups and structured concurrency',
          description: 'Child tasks live inside their parent scope, withTaskGroup fans out dynamic work and collects results, cancellation propagates down the tree and is cooperative, and Task.detached escapes the structure deliberately.',
          concepts: ['Task hierarchy and scope', 'withTaskGroup and withThrowingTaskGroup', 'Cooperative cancellation and Task.checkCancellation', 'Task priorities', 'Task.detached and when to avoid it'],
          quiz: [
            ['What happens to child tasks when a task group scope ends?', 'The group waits for all of them before returning.'],
            ['Does cancelling a task stop it immediately?', 'No, the task must check Task.isCancelled or call checkCancellation.'],
          ],
          prereqs: ['async and await'],
        },
        {
          title: 'Actors and isolation',
          description: 'Actors protect mutable state by serialising access; calls from outside require await, nonisolated exposes safe members, actor reentrancy means state can change across an await, and actors replace locks in most code.',
          concepts: ['actor keyword and isolation', 'await for cross-actor calls', 'nonisolated members', 'Actor reentrancy', 'Actors versus locks'],
          quiz: [
            ['Why do you need await to read an actor property from outside?', 'The call may suspend until the actor is free.'],
            ['What is actor reentrancy?', 'State may change while an actor method is suspended at an await.'],
          ],
          prereqs: ['Tasks, task groups and structured concurrency'],
        },
        {
          title: 'MainActor and UI updates',
          description: '@MainActor isolates types and functions to the main thread so UI updates are safe by construction; MainActor.run and Task { @MainActor in } hop explicitly, and global actors generalise the idea.',
          concepts: ['@MainActor on types and functions', 'MainActor.run', 'Hopping between actors', 'Global actors'],
          quiz: [
            ['What does marking a view model @MainActor guarantee?', 'Its state is only touched on the main thread.'],
            ['Can a nonisolated function update @MainActor state directly?', 'No, it must await a hop to the main actor.'],
          ],
          prereqs: ['Actors and isolation'],
        },
        {
          title: 'Sendable and Swift 6 strict concurrency',
          description: 'Sendable marks types safe to cross isolation boundaries; value types with Sendable members conform automatically, classes need immutability or @unchecked, and Swift 6 language mode turns data-race warnings into errors.',
          concepts: ['The Sendable protocol', 'Sendable closures', '@unchecked Sendable', 'Swift 6 language mode diagnostics', 'Migrating with -strict-concurrency'],
          quiz: [
            ['Is a struct with only Int and String properties Sendable?', 'Yes, implicitly.'],
            ['What changes in Swift 6 language mode?', 'Potential data races become compile errors.'],
          ],
          prereqs: ['Actors and isolation'],
        },
        {
          title: 'AsyncSequence and AsyncStream',
          description: 'for await over asynchronous sequences such as URL.lines, AsyncStream to wrap callback or delegate APIs into a stream, buffering policies, and async algorithms like map, filter and debounce.',
          concepts: ['for await loops', 'AsyncStream and continuations', 'Buffering policies', 'Swift Async Algorithms package'],
          quiz: [
            ['How do you turn a delegate callback into an async sequence?', 'Create an AsyncStream and yield from the callback.'],
            ['What does for try await do?', 'Iterates a throwing async sequence, propagating errors.'],
          ],
          prereqs: ['async and await'],
        },
        {
          title: 'Bridging callbacks, GCD and Combine',
          description: 'withCheckedContinuation wraps completion-handler APIs safely, resuming exactly once, DispatchQueue and locks still appear in older code, and Combine publishers convert to async sequences with values.',
          concepts: ['withCheckedContinuation', 'Resume exactly once', 'DispatchQueue in legacy code', 'Combine publisher.values', 'Mutex from the Synchronization module'],
          quiz: [
            ['What happens if a checked continuation is resumed twice?', 'A runtime crash with a diagnostic.'],
            ['How do you await a Combine publisher\'s next value?', 'for await value in publisher.values'],
          ],
          prereqs: ['async and await'],
        },
      ],
    },
    {
      title: 'Packages, Modules and I/O',
      topics: [
        {
          title: 'Swift Package Manager',
          description: 'Package.swift declares products, targets and dependencies with version rules, swift build and swift run drive the build, Package.resolved pins versions, and Xcode integrates packages directly.',
          concepts: ['Package.swift manifest', 'Targets, products and dependencies', 'Version rules and Package.resolved', 'swift build, run and test', 'Executable and library packages'],
          quiz: [
            ['How do you create a new library package?', 'swift package init --type library'],
            ['What does .upToNextMajor(from: "1.2.0") allow?', 'Any 1.x version at or above 1.2.0.'],
          ],
        },
        {
          title: 'Modules, access control and extensions',
          description: 'Each package target is a module; open, public, package, internal, fileprivate and private control visibility across and inside modules, and extensions organise conformances in separate files.',
          concepts: ['Modules and targets', 'open, public, package, internal', 'fileprivate and private', 'Extensions per conformance', '@testable import'],
          quiz: [
            ['Difference between open and public for a class?', 'open allows subclassing from other modules; public does not.'],
            ['What is the default access level?', 'internal.'],
          ],
          prereqs: ['Swift Package Manager'],
        },
        {
          title: 'Files, FileManager and Data',
          description: 'URLs for paths, FileManager for directories and enumeration, String(contentsOf:) and Data for whole-file reads, FileHandle for streams, and the sandboxed app directories on Apple platforms.',
          concepts: ['URL and file paths', 'FileManager operations', 'String and Data read and write', 'FileHandle streaming', 'App sandbox directories'],
          quiz: [
            ['How do you get the documents directory in an app?', 'URL.documentsDirectory or FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).'],
            ['What does try String(contentsOf: url, encoding: .utf8) do?', 'Reads the whole file into a String.'],
          ],
        },
        {
          title: 'Codable and JSON',
          description: 'Encodable and Decodable synthesis, JSONEncoder and JSONDecoder with key and date strategies, CodingKeys for renaming, custom init(from:) for awkward payloads, and nested and optional fields.',
          concepts: ['Codable synthesis', 'JSONDecoder strategies', 'CodingKeys renaming', 'Custom init(from:)', 'Optional and nested fields'],
          quiz: [
            ['How do you map snake_case JSON to camelCase properties?', 'decoder.keyDecodingStrategy = .convertFromSnakeCase'],
            ['What does a missing non-optional key cause?', 'A DecodingError.keyNotFound.'],
          ],
          prereqs: ['Enums with associated values'],
        },
        {
          title: 'Command-line tools with ArgumentParser',
          description: 'swift-argument-parser turns a struct into a CLI with @Argument, @Option and @Flag, subcommands, generated help, readLine for stdin, exit codes, and Process for running other programs.',
          concepts: ['ParsableCommand and @Argument', '@Option and @Flag', 'Subcommands', 'readLine and stdin', 'Exit codes and Process'],
          quiz: [
            ['What does @Flag produce?', 'A Bool switch such as --verbose.'],
            ['How does a command report failure?', 'Throw an error or call ExitCode.failure.'],
          ],
          prereqs: ['Swift Package Manager'],
        },
      ],
    },
    {
      title: 'Testing, Build, Performance and Security',
      topics: [
        {
          title: 'Swift Testing and XCTest',
          description: 'The Swift Testing framework with @Test, #expect and #require, parameterised tests and suites, alongside XCTest for legacy suites and UI tests; running with swift test or Xcode.',
          concepts: ['@Test and #expect', '#require and early exit', 'Parameterised tests and suites', 'XCTest and XCTAssert', 'Running with swift test'],
          quiz: [
            ['Difference between #expect and #require?', '#require stops the test on failure; #expect records it and continues.'],
            ['How do you run one test from the command line?', 'swift test --filter TestName'],
          ],
        },
        {
          title: 'Protocol-based mocking and dependency injection',
          description: 'Swift has no runtime mocking, so dependencies are abstracted behind protocols and replaced with test doubles; injecting through initialisers, capturing calls, and async test patterns.',
          concepts: ['Protocols as seams', 'Initialiser injection', 'Hand-written test doubles', 'Testing async code'],
          quiz: [
            ['Why is there no Mockito for Swift?', 'Swift lacks runtime reflection for method interception; use protocols and doubles.'],
            ['How do you test an async function in Swift Testing?', 'Mark the test function async and await inside it.'],
          ],
          prereqs: ['Swift Testing and XCTest', 'Protocol-oriented programming'],
        },
        {
          title: 'Debugging with LLDB and Xcode',
          description: 'Breakpoints with conditions and actions, po and p in the LLDB console, view hierarchy debugging, symbolicating crash logs, and os_log with Console.app for structured logging.',
          concepts: ['Breakpoints and conditions', 'po, p and expression in LLDB', 'Symbolicating crash logs', 'os_log and Logger'],
          quiz: [
            ['What does po print?', 'The object description of an expression.'],
            ['Why use Logger instead of print?', 'Structured, levelled logs that persist and can be filtered in Console.'],
          ],
        },
        {
          title: 'Performance tuning and Instruments',
          description: 'Time Profiler to find hot paths, copy-on-write and ContiguousArray for value-heavy code, avoiding existential boxing, @inlinable and whole-module optimisation, and release builds with -O.',
          concepts: ['Time Profiler', 'Copy-on-write costs and ContiguousArray', 'Avoiding existential overhead', 'Whole-module optimisation and -O', 'Unsafe buffers when justified'],
          quiz: [
            ['Why profile a release build?', 'Debug builds skip optimisations and mislead measurements.'],
            ['What does whole-module optimisation enable?', 'Cross-file inlining and specialisation.'],
          ],
          prereqs: ['Opaque and existential types'],
        },
        {
          title: 'Build configurations and cross-platform Swift',
          description: 'Debug and release configurations, conditional compilation with #if os and canImport, availability checks with @available and #available, and building the same package on macOS and Linux in CI.',
          concepts: ['Debug versus release', '#if os and canImport', '@available and #available', 'Linux CI with swift build'],
          quiz: [
            ['How do you guard code that only exists on iOS 17?', 'if #available(iOS 17, *) { ... }'],
            ['What does #if canImport(UIKit) check?', 'Whether the UIKit module is available for the target.'],
          ],
          prereqs: ['Swift Package Manager'],
        },
        {
          title: 'Security on Apple platforms',
          description: 'Keychain for credentials instead of UserDefaults, CryptoKit for hashing and encryption, App Transport Security for HTTPS, validating input at boundaries, and keeping secrets out of source.',
          concepts: ['Keychain versus UserDefaults', 'CryptoKit hashing and encryption', 'App Transport Security', 'Input validation at boundaries', 'Secrets out of source'],
          quiz: [
            ['Where should a session token be stored?', 'The Keychain.'],
            ['What does SHA256.hash(data:) return?', 'A digest you can convert to hex.'],
          ],
        },
      ],
    },
    {
      title: 'Swift Applications: iOS and Server-Side',
      description: 'Where Swift runs in practice; deeper coverage lives in track-ios.',
      style: 'practice',
      topics: [
        {
          title: 'SwiftUI fundamentals',
          description: 'Declarative views as structs, @State and @Binding for local state, @Observable models, layout with stacks and modifiers, lists and navigation, and how the framework diffs the view tree on state changes.',
          concepts: ['Views as value types', '@State and @Binding', '@Observable models', 'Stacks, modifiers and lists', 'NavigationStack'],
          quiz: [
            ['Why is a SwiftUI View a struct?', 'It is a cheap description of UI rebuilt on state changes, not a live object.'],
            ['What does @Binding provide?', 'Read-write access to state owned by a parent view.'],
          ],
          prereqs: ['Properties, observers and property wrappers'],
        },
        {
          title: 'App lifecycle and UIKit interop',
          description: 'The App protocol and scene phases, UIKit view controllers and their lifecycle for existing code, UIViewRepresentable to host UIKit in SwiftUI, and where AppDelegate still matters.',
          concepts: ['App protocol and scene phases', 'UIViewController lifecycle', 'UIViewRepresentable', 'AppDelegate adaptor'],
          quiz: [
            ['How do you use a UIKit view in SwiftUI?', 'Wrap it in a UIViewRepresentable.'],
            ['Which scene phase means the app went to the background?', '.background'],
          ],
          prereqs: ['SwiftUI fundamentals'],
        },
        {
          title: 'Networking with URLSession and async/await',
          description: 'URLSession.data(for:) with async/await, building URLRequests, decoding with Codable, HTTP status checks, cancellation with Task, and retry and caching strategies.',
          concepts: ['URLSession async APIs', 'URLRequest building', 'Decoding responses', 'Status codes and errors', 'Cancellation and retries'],
          quiz: [
            ['What does try await URLSession.shared.data(from: url) return?', 'A tuple of Data and URLResponse.'],
            ['How do you cancel an in-flight request?', 'Cancel the Task that awaits it.'],
          ],
          prereqs: ['async and await', 'Codable and JSON'],
        },
        {
          title: 'Persistence with SwiftData and UserDefaults',
          description: 'UserDefaults for small preferences, SwiftData with @Model classes, ModelContainer and @Query for local databases, migrations, and when Core Data or SQLite still fits.',
          concepts: ['UserDefaults and AppStorage', '@Model and ModelContainer', '@Query in views', 'Schema migrations', 'When to use Core Data or SQLite'],
          quiz: [
            ['What should not go in UserDefaults?', 'Large data or secrets.'],
            ['How does a SwiftUI view read SwiftData objects?', 'With the @Query property wrapper.'],
          ],
          prereqs: ['SwiftUI fundamentals'],
        },
        {
          title: 'Vapor: routing, Content and Fluent',
          description: 'Server-side Swift with Vapor on Linux: routes and route groups, Content for JSON in and out, Fluent models and migrations against PostgreSQL, and validation of incoming bodies.',
          concepts: ['Vapor routes and groups', 'Content and JSON', 'Fluent models and migrations', 'Validations'],
          quiz: [
            ['How does a Vapor route decode JSON?', 'try req.content.decode(MyType.self)'],
            ['What is Fluent?', 'Vapor\'s ORM with drivers for PostgreSQL, MySQL and SQLite.'],
          ],
          prereqs: ['Codable and JSON', 'async and await'],
        },
        {
          title: 'Vapor: middleware, authentication and deployment',
          description: 'Middleware for logging and CORS, JWT and session authentication, environment-based configuration, structured logging with swift-log, and deploying a release build in a Docker container.',
          concepts: ['Middleware chain', 'JWT and session auth', 'Environment configuration', 'swift-log', 'Docker deployment'],
          quiz: [
            ['How do you build Vapor for production?', 'swift build -c release, typically inside a Linux Docker image.'],
            ['Where do secrets come from in Vapor?', 'Environment.get("KEY") or a .env file in development.'],
          ],
          prereqs: ['Vapor: routing, Content and Fluent'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: command-line habit tracker',
          description: 'Build a CLI with ArgumentParser subcommands that stores habits and check-ins as JSON via Codable, computes streaks with the collections API, ships as a SwiftPM executable, and is covered by Swift Testing.',
          concepts: ['Design commands and data model', 'Persist with Codable', 'Compute streaks and reports', 'Test with Swift Testing'],
          quiz: [
            ['How do you make the tool installable?', 'swift build -c release and copy the binary from .build/release.'],
            ['Where should the data file live on macOS?', 'Under ~/Library/Application Support or a dotfolder in home.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: SwiftUI weather app',
          description: 'A SwiftUI app fetching forecasts from a public API with URLSession and async/await, an @Observable view model isolated to the MainActor, loading and error states with an enum, and unit tests with a fake client.',
          concepts: ['Model the API and state enum', 'Build the view model', 'Compose the views', 'Test with a fake network client'],
          quiz: [
            ['Why model loading state as an enum?', 'Exhaustive switching guarantees every state has UI.'],
            ['How do you keep the view model thread-safe?', 'Mark it @MainActor.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Vapor REST API with PostgreSQL',
          description: 'A Vapor service with CRUD routes for a resource, Fluent migrations, JWT-protected endpoints, validation, integration tests with XCTVapor, and a Dockerfile for Linux deployment.',
          concepts: ['Design routes and DTOs', 'Persistence layer with Fluent', 'JWT auth and validation', 'Test with XCTVapor and containerise'],
          quiz: [
            ['What does XCTVapor provide?', 'An in-process app for sending test requests to routes.'],
            ['Why run integration tests against a real database?', 'Migrations and queries are verified, not just handlers.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent image downloader',
          description: 'A tool that downloads a list of images with a task group bounded to a few concurrent tasks, reports progress through an AsyncStream, supports cancellation, and stores results through an actor-protected cache.',
          concepts: ['Bounded task group', 'Progress via AsyncStream', 'Actor-protected cache', 'Cancellation and error handling'],
          quiz: [
            ['How do you limit a task group to 4 concurrent downloads?', 'Add 4 tasks, then add one more each time a result is received.'],
            ['Why an actor for the cache?', 'Concurrent tasks mutate it safely without locks.'],
          ],
          style: 'project',
        },
        {
          title: 'Swift interview questions',
          description: 'What interviewers ask: optionals, structs versus classes, copy-on-write, protocols versus inheritance, some versus any, ARC and retain cycles, escaping closures, actors and Sendable, and Swift compared to Kotlin or Objective-C.',
          concepts: ['Optional and value type questions', 'Protocol and generics questions', 'ARC and memory questions', 'Concurrency questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Explain copy-on-write.', 'A value type shares storage until a mutation, then copies it.'],
            ['Why does [weak self] matter in an escaping closure stored by self?', 'Without it the closure and self form a retain cycle.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Swift',
          description: 'Solving problems fast in Swift: readLine parsing, arrays and dictionaries with default subscripts, Character arrays for strings, sorting with closures, a Heap from swift-collections, and avoiding O(n) string indexing.',
          concepts: ['Parsing readLine input', 'Character arrays for string problems', 'Default subscripts for counting', 'Heap and Deque from swift-collections', 'String indexing traps'],
          quiz: [
            ['Why convert a String to Array(s) in interviews?', 'Integer indexing becomes O(1).'],
            ['Where does a priority queue come from?', 'Heap in the swift-collections package.'],
          ],
        },
      ],
    },
  ],
})
