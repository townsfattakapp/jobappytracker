import { defineTrack } from '../define'

export const dart = defineTrack({
  id: 'track-dart',
  title: 'Dart',
  description: 'Dart from the SDK and pub to idiomatic, asynchronous, tested code: sound null safety, classes and mixins, records and patterns, collections, Futures and Streams, isolates, dart:io, packages with pub, testing and DevTools, the Dart that Flutter apps are built on, projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🎯',
  tags: ['dart', 'flutter', 'mobile', 'async', 'streams', 'null-safety', 'pub'],
  languages: ['Dart'],
  explainMode: 'concept',
  code: { label: 'Dart', id: 'dart', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'The Dart SDK, its runners and analysers, before writing the first real program.',
      topics: [
        {
          title: 'Installing the Dart SDK and Flutter',
          description: 'The Dart SDK ships alone or bundled inside Flutter; checking dart --version, keeping SDK constraints in pubspec.yaml, and setting up VS Code or IntelliJ with the Dart plugin and DartPad for quick experiments.',
          concepts: ['Standalone SDK versus Flutter bundle', 'dart --version and SDK constraints', 'Editor plugins for Dart', 'DartPad'],
          quiz: [
            ['Do you need a separate Dart install with Flutter?', 'No, Flutter bundles its own Dart SDK.'],
            ['Where is the minimum SDK version declared?', 'The environment.sdk field in pubspec.yaml.'],
          ],
        },
        {
          title: 'dart run, dart compile and JIT versus AOT',
          description: 'dart run executes source on the JIT VM with hot reload-friendly startup, while dart compile exe, aot-snapshot, js and wasm produce ahead-of-time output; why the same code behaves differently in each mode.',
          concepts: ['dart run and the JIT VM', 'dart compile exe and aot-snapshot', 'dart compile js and wasm', 'JIT versus AOT trade-offs'],
          quiz: [
            ['Which command produces a standalone native binary?', 'dart compile exe main.dart'],
            ['Why is AOT used for release Flutter apps?', 'Fast startup and predictable performance without a JIT.'],
          ],
          prereqs: ['Installing the Dart SDK and Flutter'],
        },
        {
          title: 'dart analyze, dart format and lints',
          description: 'The analyzer reports errors and lint warnings before code runs, analysis_options.yaml enables package:lints or flutter_lints, and dart format applies the one official style so reviews never argue about layout.',
          concepts: ['dart analyze and the analysis server', 'analysis_options.yaml', 'package:lints and flutter_lints', 'dart format and trailing commas'],
          quiz: [
            ['What does dart format --set-exit-if-changed do?', 'Fails CI when files are not formatted.'],
            ['How do you enable the recommended lints?', 'include: package:lints/recommended.yaml in analysis_options.yaml.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'main, libraries and top-level code',
          description: 'Every Dart program starts at main, each file is a library with private members marked by a leading underscore, top-level functions and variables are normal, and semicolons are required.',
          concepts: ['main and program entry', 'Files as libraries', 'Underscore privacy', 'Top-level functions and variables', 'Comments and doc comments with ///'],
          quiz: [
            ['How do you make a class private to its library?', 'Prefix its name with an underscore.'],
            ['Are semicolons optional in Dart?', 'No, statements end with a semicolon.'],
          ],
        },
        {
          title: 'var, final, const and late',
          description: 'var infers a type, final sets once at runtime, const is a compile-time constant that is canonicalised, late defers initialisation of non-nullable fields, and the difference between a const variable and a const value.',
          concepts: ['var and type inference', 'final versus const', 'const values and canonicalisation', 'late initialisation', 'Definite assignment'],
          quiz: [
            ['Can a final list be modified?', 'Yes, final fixes the reference; const makes the list itself immutable.'],
            ['When does a late variable throw?', 'When read before it is assigned.'],
          ],
        },
        {
          title: 'Built-in types and records',
          description: 'int and double under num, bool, String, Symbol, dynamic versus Object, records as anonymous immutable tuples with positional and named fields, and why Dart has no implicit numeric conversion.',
          concepts: ['int, double and num', 'dynamic versus Object', 'Records with named fields', 'No implicit numeric conversion', 'Runes and code units'],
          quiz: [
            ['What is the type of (1, name: "x")?', 'A record type (int, {String name}).'],
            ['Does int / int give an int?', 'No, / returns double; use ~/ for integer division.'],
          ],
          prereqs: ['var, final, const and late'],
        },
        {
          title: 'Operators and expressions',
          description: 'Arithmetic including ~/ and %, comparison and logical operators, the cascade .. for chained calls on one object, ?? and ??= for defaults, is and as for types, and spread ... in collections.',
          concepts: ['~/ integer division', 'Cascade notation ..', '?? and ??= defaults', 'is, is! and as', 'Spread ... and ...?'],
          quiz: [
            ['What does a..b()..c() return?', 'a, after calling b and c on it.'],
            ['What does x ??= 5 do?', 'Assigns 5 only if x is null.'],
          ],
          prereqs: ['Built-in types and records'],
        },
        {
          title: 'Conditions, switch and loops',
          description: 'if and else, switch statements and switch expressions with patterns and guards, for and for-in, while and do-while, labeled break and continue, and exhaustiveness checking on sealed types.',
          concepts: ['if and else chains', 'switch expressions with patterns', 'Guards with when', 'for, for-in, while and do-while', 'Labeled break and continue'],
          quiz: [
            ['What does a switch expression return?', 'The value of the matching case arm.'],
            ['Does a Dart 3 switch statement need break?', 'No, cases do not fall through; empty cases can share bodies.'],
          ],
          prereqs: ['Operators and expressions'],
        },
      ],
    },
    {
      title: 'Sound Null Safety and Functions',
      description: 'The type system that removes null errors, and Dart\'s flexible function syntax.',
      topics: [
        {
          title: 'Nullable types and sound null safety',
          description: 'String and String? are distinct types checked by the compiler and trusted by the runtime, so a non-nullable variable can never hold null; how soundness lets the compiler skip null checks and why Dart 3 dropped unsound mode.',
          concepts: ['Non-nullable by default', 'The ? suffix', 'Soundness guarantees', 'Never and Null types'],
          quiz: [
            ['Can a String variable ever be null in Dart 3?', 'No, only String? can.'],
            ['What does soundness give the compiler?', 'It can omit null checks and optimise, because types are trustworthy.'],
          ],
          prereqs: ['Built-in types and records'],
        },
        {
          title: 'Null-aware operators and flow analysis',
          description: '?. for safe calls, ?? and ??=, the ! bang to assert non-null, and type promotion where the compiler narrows a local after a null check but not a field, which is why copying to a local or using a pattern is needed.',
          concepts: ['Null-aware ?. and ?..', 'The ! assertion and its risks', 'Type promotion of locals', 'Why fields do not promote', 'Null-aware collection elements'],
          quiz: [
            ['Why does if (obj.field != null) obj.field.length fail?', 'Fields cannot be promoted; copy to a local first.'],
            ['What does a?.b evaluate to if a is null?', 'null.'],
          ],
          prereqs: ['Nullable types and sound null safety'],
        },
        {
          title: 'required, late and nullability in classes',
          description: 'required for named parameters that must be passed, late for fields set after construction or expensive lazy initialisation, and choosing nullable fields versus defaults so classes stay sound.',
          concepts: ['required named parameters', 'late fields and lazy initialisation', 'Nullable field versus default value', 'Initialising in constructors'],
          quiz: [
            ['What does late final x = compute() do?', 'Runs compute only on first access, then stores the result.'],
            ['When must a non-nullable field be initialised?', 'At declaration, in an initialiser list, or via late.'],
          ],
          prereqs: ['Nullable types and sound null safety'],
        },
        {
          title: 'Functions, optional and named parameters',
          description: 'Positional optional parameters in square brackets, named parameters in braces with defaults or required, arrow syntax for one-expression bodies, and functions as first-class values with typed signatures.',
          concepts: ['Positional optional parameters', 'Named parameters with defaults', 'Arrow function syntax', 'Function types and typedef'],
          quiz: [
            ['How do you declare an optional positional parameter?', 'void f(int a, [int b = 0])'],
            ['What is typedef Callback = void Function(int)?', 'A named function type alias.'],
          ],
        },
        {
          title: 'Closures and lexical scope',
          description: 'Anonymous functions capture variables from their lexical scope by reference, loops create a fresh variable per iteration, and closures power callbacks, builders and stateful helpers throughout Flutter.',
          concepts: ['Anonymous functions', 'Capturing variables by reference', 'Per-iteration loop variables', 'Closures as counters and builders'],
          quiz: [
            ['Do closures created in a for loop share the loop variable?', 'No, each iteration has its own variable.'],
            ['What does a closure capture?', 'Variables from the enclosing scope, by reference.'],
          ],
          prereqs: ['Functions, optional and named parameters'],
        },
        {
          title: 'Higher-order functions and callbacks',
          description: 'Passing functions to map, where and forEach, returning functions, tear-offs like list.forEach(print), and designing callback parameters such as onPressed with typedefs and nullable function types.',
          concepts: ['Functions as arguments', 'Returning functions', 'Tear-offs', 'Nullable callback parameters', 'VoidCallback and ValueChanged'],
          quiz: [
            ['What is a tear-off?', 'Referencing a method without calling it, such as print, to pass as a function.'],
            ['How do you call an optional callback safely?', 'onDone?.call()'],
          ],
          prereqs: ['Closures and lexical scope'],
        },
        {
          title: 'Records, patterns and destructuring',
          description: 'Dart 3 patterns destructure records, lists, maps and objects in variable declarations, switch cases and if-case statements, with guards and exhaustiveness for sealed hierarchies, replacing chains of type checks.',
          concepts: ['Destructuring records and lists', 'Object patterns', 'if-case statements', 'Exhaustive switch over sealed types', 'Multiple returns with records'],
          quiz: [
            ['How do you return two values from a function?', 'Return a record: (int, String) f() => (1, "a");'],
            ['What does if (json case {"id": int id}) do?', 'Matches a map with an int id and binds it.'],
          ],
          prereqs: ['Conditions, switch and loops'],
        },
      ],
    },
    {
      title: 'Collections and Strings',
      topics: [
        {
          title: 'Lists',
          description: 'Growable and fixed-length lists, literals with type inference, indexing, add and insert costs, sublist and getRange, List.generate and List.filled, typed lists like Uint8List, and unmodifiable views.',
          concepts: ['List literals and generics', 'Growable versus fixed-length', 'add, insert and removeAt costs', 'List.generate and List.filled', 'Unmodifiable views'],
          quiz: [
            ['What does List.filled(3, []) share?', 'One list instance across all three slots; use List.generate instead.'],
            ['How do you make a read-only view?', 'List.unmodifiable(list)'],
          ],
        },
        {
          title: 'Sets and maps',
          description: 'Set literals and the {} ambiguity with maps, contains and set algebra, Map literals with typed keys, null-returning lookups, putIfAbsent and update, and insertion-ordered iteration of the default implementations.',
          concepts: ['Set literals and the empty {} trap', 'Set operations', 'Map lookups return null', 'putIfAbsent and update', 'Insertion order of LinkedHashMap'],
          quiz: [
            ['What type is var x = {};?', 'Map<dynamic, dynamic>, not a Set.'],
            ['What does map["missing"] return?', 'null.'],
          ],
        },
        {
          title: 'Collection if, for and spread',
          description: 'Building collections declaratively with if and for inside literals, spread and null-aware spread, and why this style dominates Flutter widget lists.',
          concepts: ['Collection if', 'Collection for', 'Spread and null-aware spread', 'Declarative widget lists'],
          quiz: [
            ['Write a list containing b only when flag is true.', '[a, if (flag) b, c]'],
            ['What does [...?maybeList] do?', 'Spreads the list if it is not null, otherwise adds nothing.'],
          ],
          prereqs: ['Lists'],
        },
        {
          title: 'Iterable and lazy methods',
          description: 'map, where, expand, take and skip return lazy Iterables evaluated on demand, fold and reduce aggregate, toList materialises, and sync* generators with yield produce sequences without building lists.',
          concepts: ['Lazy Iterable chains', 'map, where and expand', 'fold and reduce', 'toList and toSet materialisation', 'sync* generators'],
          quiz: [
            ['Is list.map(f) evaluated immediately?', 'No, it is lazy until iterated or toList is called.'],
            ['What does sync* mark?', 'A synchronous generator function that yields an Iterable.'],
          ],
          prereqs: ['Lists', 'Higher-order functions and callbacks'],
        },
        {
          title: 'Strings and StringBuffer',
          description: 'Immutable UTF-16 strings with interpolation, multi-line and raw literals, adjacent-literal concatenation, common methods like split and trim, runes for code points, and StringBuffer for building large text.',
          concepts: ['Interpolation with $ and ${}', 'Multi-line and raw strings', 'Common string methods', 'UTF-16 code units versus runes', 'StringBuffer'],
          quiz: [
            ['Why use StringBuffer in a loop?', 'Strings are immutable; += copies on every iteration.'],
            ['What does "a" "b" produce?', '"ab", adjacent literals concatenate.'],
          ],
        },
        {
          title: 'Parsing and RegExp',
          description: 'int.parse and int.tryParse, double.parse, RegExp with hasMatch, firstMatch and allMatches, named groups, and replaceAllMapped for transformations.',
          concepts: ['parse versus tryParse', 'RegExp and hasMatch', 'firstMatch, allMatches and groups', 'replaceAllMapped'],
          quiz: [
            ['What does int.tryParse("x") return?', 'null instead of throwing.'],
            ['How do you access a named group?', 'match.namedGroup("name")'],
          ],
          prereqs: ['Strings and StringBuffer'],
        },
      ],
    },
    {
      title: 'Errors, Packages and I/O',
      topics: [
        {
          title: 'Exceptions, try, on, catch and finally',
          description: 'Exception for recoverable failures versus Error for bugs, on to filter by type and catch to bind the object and stack trace, finally for cleanup, rethrow to preserve the trace, and that Dart has no checked exceptions.',
          concepts: ['Exception versus Error', 'on and catch clauses', 'Stack traces in catch', 'finally and rethrow', 'Unchecked exceptions'],
          quiz: [
            ['How do you catch only FormatException?', 'on FormatException catch (e) { ... }'],
            ['Difference between throw e and rethrow?', 'rethrow keeps the original stack trace.'],
          ],
        },
        {
          title: 'Custom exceptions and assert',
          description: 'Implementing Exception with a message and toString, modelling failures with sealed classes, assert statements that run only in debug mode, and ArgumentError and StateError for contract violations.',
          concepts: ['Implementing Exception', 'Sealed failure hierarchies', 'assert in debug mode', 'ArgumentError and StateError'],
          quiz: [
            ['Does assert run in a release build?', 'No, only in debug mode or with --enable-asserts.'],
            ['Which error suits a bad argument?', 'ArgumentError, or ArgumentError.value.'],
          ],
          prereqs: ['Exceptions, try, on, catch and finally'],
        },
        {
          title: 'Libraries, imports and exports',
          description: 'package: imports versus relative imports, show and hide, prefixes for name clashes, deferred loading for web, export to build a public API from several files, and part directives for code generation.',
          concepts: ['package: versus relative imports', 'show, hide and as prefixes', 'export for public APIs', 'deferred as for web', 'part and part of'],
          quiz: [
            ['How do you resolve two libraries exporting the same name?', 'Import one with a prefix: import "x.dart" as x;'],
            ['What does export do?', 'Re-exports a library\'s public members from another library.'],
          ],
          prereqs: ['main, libraries and top-level code'],
        },
        {
          title: 'Packages with pub',
          description: 'pubspec.yaml declares dependencies with caret constraints, dart pub add and get resolve them into pubspec.lock, dev_dependencies stay out of production, and publishing to pub.dev requires a score-friendly layout.',
          concepts: ['pubspec.yaml and caret constraints', 'dart pub add, get and upgrade', 'pubspec.lock and reproducibility', 'dev_dependencies and overrides', 'Publishing to pub.dev'],
          quiz: [
            ['What does ^1.2.3 allow?', 'Versions >=1.2.3 and <2.0.0.'],
            ['Should an application commit pubspec.lock?', 'Yes, for reproducible builds; libraries usually do not.'],
          ],
        },
        {
          title: 'Files and directories with dart:io',
          description: 'File.readAsString and readAsLines for whole files, openRead for streaming large files as bytes, writeAsString and IOSink, Directory listing, path manipulation with package:path, and Platform for OS details.',
          concepts: ['readAsString and readAsLines', 'openRead streaming', 'writeAsString and IOSink', 'Directory listing', 'package:path and Platform'],
          quiz: [
            ['How do you read a huge file without loading it all?', 'file.openRead() and process the byte stream.'],
            ['Why use package:path instead of string concatenation?', 'It handles separators correctly on every platform.'],
          ],
        },
        {
          title: 'JSON and encoding with dart:convert',
          description: 'jsonDecode into dynamic maps and lists, jsonEncode from maps, fromJson and toJson conventions, utf8 and base64 codecs, and generated serialisation with json_serializable or freezed.',
          concepts: ['jsonDecode and jsonEncode', 'fromJson and toJson conventions', 'utf8 and base64 codecs', 'json_serializable code generation', 'Handling dynamic safely'],
          quiz: [
            ['What type does jsonDecode return?', 'dynamic, typically Map<String, dynamic> or List<dynamic>.'],
            ['What does build_runner do for json_serializable?', 'Generates the .g.dart files with fromJson and toJson.'],
          ],
          prereqs: ['Sets and maps'],
        },
        {
          title: 'Command-line apps and processes',
          description: 'Reading arguments with package:args, stdin and stdout, exitCode, environment variables via Platform.environment, running other programs with Process.run and Process.start, and dart compile exe for distribution.',
          concepts: ['package:args parsing', 'stdin, stdout and stderr', 'exitCode and exit', 'Platform.environment', 'Process.run and Process.start'],
          quiz: [
            ['How do you read one line from the terminal?', 'stdin.readLineSync()'],
            ['Difference between Process.run and Process.start?', 'run waits and returns the result; start streams output as it runs.'],
          ],
          prereqs: ['Files and directories with dart:io'],
        },
      ],
    },
    {
      title: 'Object-Oriented Dart',
      topics: [
        {
          title: 'Classes, constructors and initialiser lists',
          description: 'Initialising formals with this.x, named and redirecting constructors, factory constructors that can return cached or subtype instances, const constructors, initialiser lists that run before the body, and super parameters.',
          concepts: ['Initialising formals this.x', 'Named and redirecting constructors', 'factory constructors', 'const constructors', 'Initialiser lists and super parameters'],
          quiz: [
            ['When does an initialiser list run?', 'Before the constructor body, after field initialisers.'],
            ['What can a factory constructor do that a generative one cannot?', 'Return an existing instance or a subtype.'],
          ],
        },
        {
          title: 'Getters, setters and operator overloading',
          description: 'Computed properties with get and set that look like fields, the uniform access principle, overloading operators such as +, == and [], and the rule that overriding == requires hashCode.',
          concepts: ['get and set accessors', 'Uniform access principle', 'Operator methods', '== and hashCode contract', 'toString overrides'],
          quiz: [
            ['What must you override alongside ==?', 'hashCode.'],
            ['How do you define indexing on a class?', 'operator [](int i) and operator []=(int i, value).'],
          ],
          prereqs: ['Classes, constructors and initialiser lists'],
        },
        {
          title: 'Inheritance, abstract classes and implicit interfaces',
          description: 'extends for subclassing with super calls, abstract classes with unimplemented members, every class defining an implicit interface you can implement, @override annotations, and covariant parameters.',
          concepts: ['extends and super', 'Abstract classes', 'Implicit interfaces and implements', '@override', 'covariant parameters'],
          quiz: [
            ['Difference between extends and implements?', 'extends inherits implementation; implements only takes the interface.'],
            ['Can a class implement another concrete class?', 'Yes, every class defines an implicit interface.'],
          ],
          prereqs: ['Classes, constructors and initialiser lists'],
        },
        {
          title: 'Mixins',
          description: 'mixin declarations that add behaviour to many classes without inheritance, applying several with with, the on clause to require a superclass, linearisation order when mixins override the same member, and mixin class.',
          concepts: ['mixin declarations', 'Applying with with', 'The on clause', 'Linearisation and override order', 'mixin class'],
          quiz: [
            ['In class A extends B with C, D, which override wins?', 'D, the last mixin applied.'],
            ['What does on Base restrict?', 'The mixin can only be applied to classes extending Base.'],
          ],
          prereqs: ['Inheritance, abstract classes and implicit interfaces'],
        },
        {
          title: 'Class modifiers and sealed classes',
          description: 'Dart 3 modifiers control how a class is used outside its library: sealed for exhaustive subtypes, final to forbid subtyping, base to forbid implements, interface to forbid extends, and abstract combinations.',
          concepts: ['sealed classes and exhaustiveness', 'final and base', 'interface and abstract interface', 'Combining modifiers', 'Modifiers apply across libraries'],
          quiz: [
            ['What does sealed guarantee?', 'All direct subtypes are in the same library, enabling exhaustive switch.'],
            ['Can a final class be extended in another library?', 'No.'],
          ],
          prereqs: ['Inheritance, abstract classes and implicit interfaces'],
        },
        {
          title: 'Enhanced enums',
          description: 'Enums with fields, constructors, methods and interfaces, values and byName lookup, the index property, using enums in switch expressions, and when a sealed class fits better.',
          concepts: ['Enum fields and constructors', 'Methods and interfaces on enums', 'values, byName and index', 'Enums in switch expressions', 'Enum versus sealed class'],
          quiz: [
            ['How do you look up an enum by string?', 'Color.values.byName("red")'],
            ['Can enum constructors be non-const?', 'No, enum values are compile-time constants.'],
          ],
        },
        {
          title: 'Extension methods and extension types',
          description: 'Extensions add methods and getters to existing types statically, named extensions can be imported selectively, and extension types (Dart 3.3) wrap a representation type with zero runtime cost for type-safe APIs.',
          concepts: ['Extension methods and getters', 'Static resolution of extensions', 'Named extensions and conflicts', 'Extension types', 'Zero-cost wrappers'],
          quiz: [
            ['Do extensions work on a dynamic-typed value?', 'No, they are resolved statically.'],
            ['What does an extension type compile to?', 'The representation type; there is no wrapper object.'],
          ],
        },
        {
          title: 'Generics and type inference',
          description: 'Generic classes and methods with bounded type parameters, covariance of Dart generics and its runtime checks, type inference from constructors and literals, and checking instantiated types with is at runtime.',
          concepts: ['Generic classes and methods', 'Bounded type parameters', 'Covariant generics and runtime checks', 'Inference from literals', 'Reified type arguments'],
          quiz: [
            ['Is List<int> assignable to List<num>?', 'Yes, Dart generics are covariant, with runtime checks on writes.'],
            ['Are type arguments available at runtime?', 'Yes, list is List<int> works because types are reified.'],
          ],
          prereqs: ['Classes, constructors and initialiser lists'],
        },
      ],
    },
    {
      title: 'Memory and Resource Management',
      topics: [
        {
          title: 'The Dart VM and garbage collection',
          description: 'A generational collector with a fast young space for short-lived objects, each isolate owning its own heap, allocation cost as the thing to minimise, and how const objects avoid allocation entirely.',
          concepts: ['Generational garbage collection', 'Per-isolate heaps', 'Allocation cost and object churn', 'const objects and canonicalisation'],
          quiz: [
            ['Do isolates share heap objects?', 'No, each has its own heap; data is copied or transferred.'],
            ['Why do const widgets help performance?', 'They are canonicalised once and never rebuilt or reallocated.'],
          ],
        },
        {
          title: 'Disposing subscriptions, controllers and sinks',
          description: 'StreamSubscriptions, StreamControllers, Timers and IOSinks hold resources until cancelled or closed; the dispose pattern in Flutter State objects and try/finally in scripts prevent leaks and stray callbacks.',
          concepts: ['Cancelling StreamSubscriptions', 'Closing StreamControllers and sinks', 'Timer cancellation', 'The dispose pattern'],
          quiz: [
            ['What happens if you forget to cancel a subscription in a widget?', 'Callbacks keep firing on a disposed widget, leaking memory.'],
            ['Where do Flutter resources get released?', 'In State.dispose().'],
          ],
        },
        {
          title: 'Immutability, equality and value classes',
          description: 'Immutable objects with final fields and const constructors, structural equality by overriding == and hashCode or using equatable, and freezed for generated value classes with copyWith and unions.',
          concepts: ['Immutable classes with final fields', 'Structural equality with equatable', 'copyWith patterns', 'freezed value classes', 'Identity versus equality'],
          quiz: [
            ['Are two records with equal fields ==?', 'Yes, records have structural equality.'],
            ['What does freezed generate?', 'Immutable classes with ==, hashCode, copyWith, toString and optional unions.'],
          ],
          prereqs: ['Getters, setters and operator overloading'],
        },
      ],
    },
    {
      title: 'Asynchronous Programming and Isolates',
      description: 'The single-threaded event loop, Futures, Streams and isolates for true parallelism.',
      topics: [
        {
          title: 'The event loop and microtasks',
          description: 'Dart runs one isolate on a single thread with an event queue and a higher-priority microtask queue; why long synchronous work freezes everything, and how await schedules continuations.',
          concepts: ['Single-threaded event loop', 'Event queue versus microtask queue', 'scheduleMicrotask and Future.microtask', 'Why synchronous work blocks the UI'],
          quiz: [
            ['Which runs first, a microtask or a Timer callback?', 'The microtask.'],
            ['Does await block the thread?', 'No, it suspends the function and lets the loop process other events.'],
          ],
        },
        {
          title: 'Futures and async/await',
          description: 'A Future completes once with a value or error, async functions return Futures and await unwraps them, Future.wait runs work in parallel, timeout adds deadlines, and errors propagate to try/catch around await.',
          concepts: ['Future completion and then', 'async and await', 'Future.wait and Future.any', 'timeout and Future.delayed', 'Error handling with try/catch around await'],
          quiz: [
            ['What does an async function return?', 'A Future of its declared type.'],
            ['How do you run three fetches concurrently?', 'await Future.wait([a(), b(), c()])'],
          ],
          prereqs: ['The event loop and microtasks'],
        },
        {
          title: 'Streams',
          description: 'A Stream delivers many values over time; single-subscription versus broadcast streams, listen with onError and onDone, await for consumption, StreamController to produce events, and async* generators.',
          concepts: ['Single-subscription versus broadcast', 'listen, onError and onDone', 'await for', 'StreamController', 'async* and yield'],
          quiz: [
            ['Can two listeners subscribe to a single-subscription stream?', 'No, use asBroadcastStream or a broadcast controller.'],
            ['What does async* declare?', 'A generator function that returns a Stream.'],
          ],
          prereqs: ['Futures and async/await'],
        },
        {
          title: 'Stream transformations',
          description: 'map, where, asyncMap, expand, take and distinct on streams, transform with StreamTransformer, combining and debouncing with rxdart, and handling backpressure with pause and resume.',
          concepts: ['map, where and asyncMap', 'StreamTransformer', 'rxdart combineLatest and debounce', 'pause and resume', 'first, last and toList on streams'],
          quiz: [
            ['What does asyncMap do?', 'Maps each event through an async function and waits for it before the next.'],
            ['How do you debounce text input events?', 'Use rxdart\'s debounceTime or a Timer-based transformer.'],
          ],
          prereqs: ['Streams'],
        },
        {
          title: 'Isolates and parallelism',
          description: 'Isolates run Dart code on separate threads with separate heaps; Isolate.run offloads a function and returns its result, Isolate.spawn with SendPort and ReceivePort handles long-lived workers, and Flutter\'s compute wraps it.',
          concepts: ['Isolate.run for one-off work', 'Isolate.spawn and ports', 'Message passing and copying', 'Flutter compute', 'When isolates are worth it'],
          quiz: [
            ['Why use an isolate instead of async for JSON parsing?', 'Parsing is CPU-bound; async alone still blocks the main isolate.'],
            ['How do isolates exchange data?', 'By sending messages through SendPort and ReceivePort.'],
          ],
          prereqs: ['Futures and async/await'],
        },
        {
          title: 'Cancellation, Completers and timeouts',
          description: 'Futures cannot be cancelled directly, so CancelableOperation from package:async, subscription cancel, timeout and Completer for bridging callback APIs into Futures are the tools.',
          concepts: ['Completer for callback bridging', 'CancelableOperation', 'Cancelling stream subscriptions', 'timeout on Futures'],
          quiz: [
            ['Can you cancel a plain Future?', 'No, wrap it in a CancelableOperation or cancel the underlying subscription.'],
            ['What does a Completer let you do?', 'Create a Future and complete it later from a callback.'],
          ],
          prereqs: ['Streams'],
        },
        {
          title: 'Zones and uncaught async errors',
          description: 'runZonedGuarded catches errors escaping async code that no try/catch sees, zones carry values and intercept print and timers, and Flutter and crash reporters rely on them for global error handling.',
          concepts: ['Uncaught async errors', 'runZonedGuarded', 'Zone values and interception', 'FlutterError.onError and crash reporting'],
          quiz: [
            ['Where do errors from an un-awaited Future go?', 'To the current zone\'s error handler, or the uncaught error handler.'],
            ['What does runZonedGuarded take?', 'A body and an onError callback receiving the error and stack trace.'],
          ],
          prereqs: ['Futures and async/await'],
        },
      ],
    },
    {
      title: 'Testing, Debugging, Build and Security',
      topics: [
        {
          title: 'Unit tests with package:test',
          description: 'test and group blocks, expect with matchers like equals, throwsA and isA, setUp and tearDown, tags and skip, and running with dart test including filtering by name.',
          concepts: ['test and group', 'expect and matchers', 'setUp and tearDown', 'throwsA and isA', 'dart test filtering'],
          quiz: [
            ['How do you assert a function throws FormatException?', 'expect(() => f(), throwsA(isA<FormatException>()))'],
            ['How do you run a single test file?', 'dart test test/my_test.dart'],
          ],
        },
        {
          title: 'Mocking with mockito and mocktail',
          description: 'mocktail creates mocks without code generation using when and verify, mockito with build_runner for generated mocks, registerFallbackValue for custom types, and fakes behind abstract classes.',
          concepts: ['mocktail when and verify', 'mockito generated mocks', 'registerFallbackValue', 'Fakes behind abstract classes'],
          quiz: [
            ['Why choose mocktail over mockito?', 'No code generation is needed.'],
            ['How do you stub an async method?', 'when(() => api.fetch()).thenAnswer((_) async => value)'],
          ],
          prereqs: ['Unit tests with package:test'],
        },
        {
          title: 'Testing async code and streams',
          description: 'Awaiting Futures in tests, expectLater with emitsInOrder and emitsError for streams, fakeAsync and FakeAsync to control time, and testing timeouts without real waiting.',
          concepts: ['Async test bodies', 'expectLater and emitsInOrder', 'emitsError and emitsDone', 'fakeAsync and elapsed time'],
          quiz: [
            ['How do you assert a stream emits 1 then 2?', 'expectLater(stream, emitsInOrder([1, 2]))'],
            ['What does fakeAsync give you?', 'Control over timers and microtasks so delays run instantly.'],
          ],
          prereqs: ['Streams', 'Unit tests with package:test'],
        },
        {
          title: 'Debugging with DevTools',
          description: 'Breakpoints and the debugger() call, the Dart DevTools suite for CPU profiling, memory snapshots and the network view, logging with dart:developer log, and reading async stack traces.',
          concepts: ['Breakpoints and debugger()', 'DevTools CPU profiler', 'Memory snapshots', 'dart:developer log', 'Async stack traces'],
          quiz: [
            ['How do you open DevTools for a command-line program?', 'Run with dart run --observe and open the printed URL.'],
            ['What does debugger() do?', 'Pauses at that line when a debugger is attached.'],
          ],
        },
        {
          title: 'Compilation targets and build_runner',
          description: 'dart compile exe for native CLIs, js and wasm for the web with tree shaking, aot-snapshot for servers, build_runner for code generation, and the environment declarations that String.fromEnvironment reads.',
          concepts: ['Native, JS and Wasm targets', 'Tree shaking', 'build_runner and generated files', 'String.fromEnvironment and --define', 'Release builds in CI'],
          quiz: [
            ['How do you regenerate code after editing an annotated class?', 'dart run build_runner build'],
            ['What does tree shaking remove?', 'Code that is never reachable from main.'],
          ],
          prereqs: ['dart run, dart compile and JIT versus AOT'],
        },
        {
          title: 'Performance tuning',
          description: 'Profiling before guessing, avoiding allocation in hot loops, const and final for cheap objects, typed_data for numeric work, keeping the main isolate free of heavy computation, and benchmark_harness for micro-benchmarks.',
          concepts: ['Profile first with DevTools', 'Allocation in hot loops', 'typed_data for numeric work', 'Offloading to isolates', 'benchmark_harness'],
          quiz: [
            ['Why is a Float64List faster than List<double>?', 'It stores unboxed doubles contiguously.'],
            ['What should you do before optimising?', 'Profile to find the actual hotspot.'],
          ],
          prereqs: ['Isolates and parallelism'],
        },
        {
          title: 'Secure Dart code',
          description: 'Validating and bounding input, avoiding dynamic where types can be checked, Random.secure for tokens, keeping secrets in the environment or platform secure storage, and dart pub outdated for vulnerable dependencies.',
          concepts: ['Input validation at boundaries', 'Avoiding dynamic', 'Random.secure', 'Secrets and secure storage', 'dart pub outdated and audits'],
          quiz: [
            ['Which class generates cryptographic randomness?', 'Random.secure().'],
            ['Where should API keys live in a Flutter app?', 'Not in source; use platform secure storage or a backend.'],
          ],
        },
      ],
    },
    {
      title: 'Dart for Flutter and Servers',
      description: 'The Dart features Flutter builds on, plus HTTP on both ends; full Flutter coverage lives in track-flutter.',
      style: 'practice',
      topics: [
        {
          title: 'Widgets and the widget tree',
          description: 'StatelessWidget and StatefulWidget as immutable descriptions, build returning a tree, BuildContext as the position in that tree, keys for identity, and how const constructors and named parameters shape widget code.',
          concepts: ['StatelessWidget and StatefulWidget', 'build and BuildContext', 'Keys and identity', 'const widgets and named parameters'],
          quiz: [
            ['Why are widgets immutable?', 'Flutter rebuilds descriptions cheaply and diffs them against the element tree.'],
            ['What does a Key change?', 'How Flutter matches widgets to elements across rebuilds.'],
          ],
          prereqs: ['Classes, constructors and initialiser lists'],
        },
        {
          title: 'State, setState and the widget lifecycle',
          description: 'State objects persist across rebuilds, setState schedules a rebuild, initState and dispose bracket resource use, didUpdateWidget handles new configuration, and async work must check mounted.',
          concepts: ['State objects and setState', 'initState and dispose', 'didUpdateWidget', 'mounted checks after await'],
          quiz: [
            ['Where do you cancel a stream subscription in a widget?', 'In dispose().'],
            ['Why check mounted after an await?', 'The widget may have been removed before the Future completed.'],
          ],
          prereqs: ['Widgets and the widget tree'],
        },
        {
          title: 'Layout with Row, Column and ListView',
          description: 'Rows and columns with main and cross axis alignment, Expanded and Flexible for space, Padding and SizedBox, ListView.builder for long lists, and reading the constraints-go-down sizes-go-up model.',
          concepts: ['Row and Column alignment', 'Expanded and Flexible', 'Padding and SizedBox', 'ListView.builder', 'Constraints go down, sizes go up'],
          quiz: [
            ['Why use ListView.builder over ListView?', 'It builds items lazily as they scroll into view.'],
            ['What does Expanded do?', 'Fills the remaining space along the main axis.'],
          ],
          prereqs: ['Widgets and the widget tree'],
        },
        {
          title: 'State management with ChangeNotifier and Riverpod',
          description: 'Lifting state up, ChangeNotifier with provider for observable models, Riverpod providers and ref.watch for compile-safe dependencies, and choosing a pattern that keeps widgets free of business logic.',
          concepts: ['Lifting state up', 'ChangeNotifier and notifyListeners', 'Riverpod providers and ref.watch', 'Separating UI from logic'],
          quiz: [
            ['What does notifyListeners do?', 'Tells listeners such as widgets to rebuild.'],
            ['Why does Riverpod not need BuildContext?', 'Providers are accessed through ref, which is independent of the widget tree.'],
          ],
          prereqs: ['State, setState and the widget lifecycle'],
        },
        {
          title: 'HTTP with package:http and shelf servers',
          description: 'Making requests with package:http or dio, decoding JSON responses into models, handling status codes and timeouts, and serving HTTP from Dart with shelf and shelf_router for small backends.',
          concepts: ['http.get and http.post', 'Decoding responses into models', 'Status codes and timeouts', 'shelf handlers and middleware', 'shelf_router'],
          quiz: [
            ['What does http.get return?', 'A Future<Response> with statusCode and body.'],
            ['What is a shelf Handler?', 'A function from Request to Response or Future<Response>.'],
          ],
          prereqs: ['Futures and async/await', 'JSON and encoding with dart:convert'],
        },
        {
          title: 'Platform channels and FFI',
          description: 'Calling platform code from Dart through MethodChannel, EventChannel for streams from native, dart:ffi for C libraries with ffigen, and when a package already wraps the platform for you.',
          concepts: ['MethodChannel calls', 'EventChannel streams', 'dart:ffi and ffigen', 'Choosing a package versus custom bridging'],
          quiz: [
            ['What does MethodChannel.invokeMethod return?', 'A Future with the platform result.'],
            ['When is dart:ffi the right tool?', 'For calling C libraries directly without a platform channel.'],
          ],
          prereqs: ['Futures and async/await'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: command-line note keeper',
          description: 'Build a CLI with package:args subcommands that stores notes as JSON with dart:convert, models commands with a sealed class and patterns, searches with RegExp, and ships as a dart compile exe binary with package:test coverage.',
          concepts: ['Design commands with sealed classes', 'Persist notes with dart:convert', 'Search and filter notes', 'Test and compile to a binary'],
          quiz: [
            ['Why model commands as a sealed class?', 'The switch over them is exhaustive and new commands cannot be missed.'],
            ['How do you run tests?', 'dart test'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Flutter weather app',
          description: 'A Flutter app fetching forecasts with package:http, models decoded from JSON, a ChangeNotifier or Riverpod view model with loading, success and error states as a sealed class, and widget tests with a fake client.',
          concepts: ['Model the API and state', 'Build the view model', 'Compose the widgets', 'Widget tests with a fake client'],
          quiz: [
            ['Why a sealed class for UI state?', 'Every state must be handled in the switch that builds the UI.'],
            ['Where do you inject the fake client?', 'Through the constructor or a provider override.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: shelf REST API with SQLite',
          description: 'A Dart backend using shelf_router for CRUD routes, sqlite3 or postgres packages for storage, JSON request validation, middleware for logging and errors, integration tests with an in-process server, and a Docker image.',
          concepts: ['Design routes and models', 'Storage layer and migrations', 'Validation and error middleware', 'Test in-process and containerise'],
          quiz: [
            ['How do you test a shelf handler without a socket?', 'Call the handler with a constructed Request.'],
            ['Which Docker base image runs a compiled Dart server?', 'A minimal image with the dart compile exe output, or the official dart runtime image.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent file processor with isolates',
          description: 'Process a folder of large CSV files by streaming each with dart:io, parsing in a pool of isolates, merging results through a Stream, reporting progress, and comparing timings against a single-isolate run.',
          concepts: ['Stream files with dart:io', 'Parse in an isolate pool', 'Merge results through streams', 'Measure and compare timings'],
          quiz: [
            ['Why not parse on the main isolate?', 'CPU-bound parsing blocks the event loop and any UI.'],
            ['How do you get results back from Isolate.run?', 'It returns a Future with the function\'s result.'],
          ],
          style: 'project',
        },
        {
          title: 'Dart interview questions',
          description: 'What interviewers ask: final versus const, sound null safety and promotion, mixins versus inheritance, factory constructors, the event loop and microtasks, Futures versus Streams, isolates versus threads, and why Flutter chose Dart.',
          concepts: ['Null safety and type questions', 'Class, mixin and constructor questions', 'Event loop and async questions', 'Isolate and performance questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Why can a field not be promoted after a null check?', 'Another call could reassign it; copy it to a local.'],
            ['How do isolates differ from threads?', 'They share no memory and communicate by message passing.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Dart',
          description: 'Solving problems fast in Dart: stdin parsing, List and Map with putIfAbsent, StringBuffer output, sorting with comparators and compareTo, a priority queue from package:collection, and avoiding hidden O(n) list operations.',
          concepts: ['Parsing stdin quickly', 'putIfAbsent for counting', 'Comparators and compareTo', 'PriorityQueue from package:collection', 'Hidden complexity traps'],
          quiz: [
            ['Where does a priority queue come from?', 'PriorityQueue in package:collection.'],
            ['What is the cost of list.removeAt(0)?', 'O(n); use a Queue or ListQueue for the front.'],
          ],
        },
      ],
    },
  ],
})
