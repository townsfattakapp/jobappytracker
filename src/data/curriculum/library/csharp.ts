import { defineTrack } from '../define'

export const csharp = defineTrack({
  id: 'track-csharp',
  title: 'C#',
  description: 'Modern C# on .NET from the dotnet CLI to idiomatic, tested code: the type system, LINQ, generics, records, pattern matching, nullable reference types, delegates and events, async/await, dependency injection, an ASP.NET Core overview, buildable projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🎯',
  tags: ['csharp', 'dotnet', 'linq', 'async', 'oop', 'backend', 'xunit'],
  languages: ['C#'],
  explainMode: 'concept',
  code: { label: 'C#', id: 'csharp', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'The .NET SDK, the dotnet CLI and a project layout you can build and run from any terminal.',
      topics: [
        {
          title: 'Installing the .NET SDK and dotnet CLI',
          description: 'What the SDK contains versus the runtime, how global.json pins an SDK version, and the dotnet new, build, run and test commands that drive every project without an IDE.',
          concepts: ['SDK versus runtime', 'dotnet new templates', 'dotnet build and dotnet run', 'Pinning versions with global.json'],
          quiz: [
            ['Which command creates a console project in the current folder?', 'dotnet new console'],
            ['What does global.json control?', 'Which installed SDK version the dotnet CLI uses for that directory tree.'],
            ['Do you need the SDK to run a published app?', 'No, the runtime alone is enough; the SDK is for building.'],
          ],
        },
        {
          title: 'Projects, solutions and the csproj file',
          description: 'How the SDK-style csproj declares the target framework, output type and properties, how a solution file groups projects, and why implicit usings and nullable are switched on in the project file.',
          concepts: ['SDK-style csproj properties', 'TargetFramework and OutputType', 'Solution files and dotnet sln', 'ImplicitUsings and Nullable settings'],
          quiz: [
            ['What does <TargetFramework>net8.0</TargetFramework> mean?', 'The project compiles against and runs on .NET 8.'],
            ['How do you add a project to a solution?', 'dotnet sln add path/to/Project.csproj'],
          ],
          prereqs: ['Installing the .NET SDK and dotnet CLI'],
        },
        {
          title: 'NuGet packages and package references',
          description: 'Adding libraries with dotnet add package, how PackageReference and the lock file record versions, transitive dependencies, and restoring packages in CI.',
          concepts: ['dotnet add package', 'PackageReference and version ranges', 'Transitive dependencies', 'dotnet restore and lock files'],
          quiz: [
            ['Where do restored packages live?', 'In the global packages folder (~/.nuget/packages), referenced by the project assets file.'],
            ['What does a floating version like 8.* do?', 'Resolves to the highest matching version at restore time.'],
          ],
          prereqs: ['Projects, solutions and the csproj file'],
        },
        {
          title: 'Editors, analyzers and dotnet format',
          description: 'Roslyn analyzers report style and correctness problems at compile time; .editorconfig settings and dotnet format keep the code base consistent whether you use Visual Studio, Rider or VS Code.',
          concepts: ['Roslyn analyzers and severity levels', '.editorconfig code style rules', 'dotnet format', 'Warnings as errors'],
          quiz: [
            ['What does TreatWarningsAsErrors do?', 'Fails the build on any compiler or analyzer warning.'],
            ['Which file stores code style settings shared across editors?', '.editorconfig'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'Top-level statements and Program.cs',
          description: 'Since C# 9 a program can start with plain statements instead of a Main method; how the compiler generates the entry point, where args come from, and when an explicit Main is still clearer.',
          concepts: ['Top-level statements', 'The generated Main and args', 'Statements, blocks and semicolons', 'Comments and XML doc comments'],
          quiz: [
            ['How do you read command-line arguments with top-level statements?', 'Through the implicit args string array.'],
            ['Can two files in a project both use top-level statements?', 'No, only one file may.'],
          ],
        },
        {
          title: 'Namespaces, usings and file organisation',
          description: 'File-scoped namespaces, using directives, global usings and static usings, and the convention of one type per file mirrored by the folder structure.',
          concepts: ['File-scoped namespaces', 'using and global using', 'using static', 'One type per file convention'],
          quiz: [
            ['What does namespace App.Services; (with a semicolon) do?', 'Declares a file-scoped namespace covering the whole file.'],
            ['What does using static System.Math; allow?', 'Calling Sqrt(x) without the Math prefix.'],
          ],
        },
        {
          title: 'Variables, var and value versus reference types',
          description: 'Declaring with explicit types or var, definite assignment rules, and the split between value types copied on assignment and reference types shared through references.',
          concepts: ['Declaration and definite assignment', 'var and type inference', 'Value types copied on assignment', 'Reference types and shared references', 'default values'],
          quiz: [
            ['Does var make a variable dynamically typed?', 'No, the compiler infers a fixed static type.'],
            ['What is default(int)?', '0'],
            ['Is string a value type?', 'No, it is a reference type with value-like equality.'],
          ],
        },
        {
          title: 'Numeric types, char, bool and conversions',
          description: 'int, long, double, decimal and their ranges, checked and unchecked overflow, implicit versus explicit casts, and Parse versus TryParse for text input.',
          concepts: ['Integer and floating types', 'decimal for money', 'checked and unchecked arithmetic', 'Implicit and explicit casts', 'Parse and TryParse'],
          quiz: [
            ['Why use decimal for currency?', 'It stores base-10 digits exactly, avoiding binary rounding errors.'],
            ['What happens to int.MaxValue + 1 by default?', 'It silently wraps to int.MinValue unless in a checked context.'],
          ],
        },
        {
          title: 'Operators and expressions',
          description: 'Precedence, the conditional operator, null-coalescing ?? and ??=, null-conditional ?., is and as, and switch expressions as expressions rather than statements.',
          concepts: ['Operator precedence', 'Null-coalescing ?? and ??=', 'Null-conditional ?.', 'is and as operators', 'Switch expressions'],
          quiz: [
            ['What does name ??= "anon" do?', 'Assigns "anon" only if name is null.'],
            ['What does list?.Count return when list is null?', 'null, as an int?.'],
          ],
          prereqs: ['Variables, var and value versus reference types'],
        },
      ],
    },
    {
      title: 'Control Flow and Methods',
      topics: [
        {
          title: 'Conditions and loops',
          description: 'if/else, the switch statement with case guards, for, foreach over any IEnumerable, while and do-while, and break, continue and goto case.',
          concepts: ['if and else chains', 'switch statements and case guards', 'for and foreach', 'while and do-while', 'break and continue'],
          quiz: [
            ['What does foreach require of the collection?', 'A GetEnumerator method, typically via IEnumerable<T>.'],
            ['Can you modify a List while foreach-ing it?', 'No, the enumerator throws InvalidOperationException.'],
          ],
        },
        {
          title: 'Methods, parameters and overloading',
          description: 'Defining methods, passing by value, ref, out and in, params arrays, optional and named arguments, and how the compiler picks an overload.',
          concepts: ['Method signatures and return types', 'ref, out and in parameters', 'params and optional arguments', 'Named arguments', 'Overload resolution'],
          quiz: [
            ['What must an out parameter do?', 'Be assigned before the method returns.'],
            ['What does in do for a large struct?', 'Passes it by reference without allowing modification.'],
          ],
          prereqs: ['Conditions and loops'],
        },
        {
          title: 'Expression-bodied members and local functions',
          description: 'Writing one-expression methods and properties with =>, nesting helper functions inside a method, and static local functions that cannot capture locals.',
          concepts: ['Expression-bodied members', 'Local functions', 'Static local functions', 'Local functions versus lambdas'],
          quiz: [
            ['What does static on a local function enforce?', 'It cannot capture variables from the enclosing method.'],
            ['Can a local function be recursive?', 'Yes, unlike a lambda assigned with var.'],
          ],
        },
        {
          title: 'Pattern matching',
          description: 'Type, constant, relational, property, positional and list patterns with is and switch, combining them with and, or and not, and Deconstruct for positional patterns.',
          concepts: ['Type and constant patterns', 'Property and positional patterns', 'Relational and logical patterns', 'List patterns', 'Deconstruct methods'],
          quiz: [
            ['What does if (obj is Circle { Radius: > 0 } c) do?', 'Matches a Circle with positive Radius and binds it to c.'],
            ['Which pattern matches an array of exactly two elements?', 'A list pattern like [var a, var b].'],
          ],
          prereqs: ['Operators and expressions'],
        },
        {
          title: 'Iterators with yield',
          description: 'Methods returning IEnumerable<T> that produce values lazily with yield return, how the compiler builds a state machine, and yield break for early termination.',
          concepts: ['yield return and lazy sequences', 'The iterator state machine', 'yield break', 'Infinite sequences'],
          quiz: [
            ['When does an iterator method body start running?', 'On the first MoveNext, not when the method is called.'],
            ['Can an iterator use ref or out parameters?', 'No.'],
          ],
        },
      ],
    },
    {
      title: 'Collections and LINQ',
      topics: [
        {
          title: 'Arrays and indices',
          description: 'Fixed-size arrays, multidimensional and jagged arrays, the index-from-end ^ and range .. operators, and Array helper methods.',
          concepts: ['Single and multidimensional arrays', 'Jagged arrays', 'Index ^ and range .. operators', 'Array.Sort and Array.IndexOf'],
          quiz: [
            ['What does arr[^1] return?', 'The last element.'],
            ['What is arr[1..3]?', 'A new array with elements at index 1 and 2.'],
          ],
        },
        {
          title: 'List, Dictionary and HashSet',
          description: 'The generic collections used in almost every program: List<T> growth and indexing, Dictionary<K,V> hashing and TryGetValue, HashSet<T> for membership, plus Queue and Stack.',
          concepts: ['List<T> operations and capacity', 'Dictionary<K,V> and TryGetValue', 'HashSet<T> and set operations', 'Queue<T> and Stack<T>', 'Collection expressions'],
          quiz: [
            ['What does dict[key] throw when key is missing?', 'KeyNotFoundException; use TryGetValue to avoid it.'],
            ['What does List<int> xs = [1, 2, 3]; use?', 'A collection expression (C# 12).'],
          ],
          prereqs: ['Arrays and indices'],
        },
        {
          title: 'IEnumerable and deferred execution',
          description: 'How IEnumerable<T> and IEnumerator<T> underpin foreach and LINQ, why queries run only when enumerated, and the multiple-enumeration trap.',
          concepts: ['IEnumerable and IEnumerator', 'Deferred execution', 'Multiple enumeration trap', 'Materialising with ToList and ToArray'],
          quiz: [
            ['When does Where run its predicate?', 'When the result is enumerated, not when Where is called.'],
            ['Why can enumerating a query twice give different results?', 'It re-executes against the source each time.'],
          ],
          prereqs: ['Iterators with yield'],
        },
        {
          title: 'LINQ query and method syntax',
          description: 'Where, Select, OrderBy, First and Single, Any and All, Take and Skip, chained fluently or written as query expressions, and how the compiler translates one into the other.',
          concepts: ['Where and Select', 'OrderBy and ThenBy', 'First, Single and their OrDefault variants', 'Any, All and Count', 'Query syntax translation'],
          quiz: [
            ['Difference between First and Single?', 'Single throws if more than one element matches; First returns the first.'],
            ['What does FirstOrDefault return for an empty int sequence?', '0, the default for int.'],
          ],
          prereqs: ['IEnumerable and deferred execution'],
        },
        {
          title: 'Grouping, joining and aggregating with LINQ',
          description: 'GroupBy with key selectors, Join and GroupJoin, SelectMany for flattening, Aggregate, Sum, Min and Max, and ToDictionary and ToLookup for indexed results.',
          concepts: ['GroupBy and IGrouping', 'Join and GroupJoin', 'SelectMany flattening', 'Aggregate and numeric folds', 'ToDictionary and ToLookup'],
          quiz: [
            ['What does SelectMany do?', 'Projects each element to a sequence and flattens the results.'],
            ['What does GroupBy return?', 'A sequence of IGrouping<TKey, TElement>.'],
          ],
          prereqs: ['LINQ query and method syntax'],
        },
        {
          title: 'Immutable and read-only collections',
          description: 'IReadOnlyList and IReadOnlyDictionary for exposing data without allowing mutation, System.Collections.Immutable, frozen collections, and choosing interfaces for method parameters.',
          concepts: ['IReadOnlyList and IReadOnlyDictionary', 'ImmutableList and ImmutableDictionary', 'FrozenSet and FrozenDictionary', 'Choosing parameter interfaces'],
          quiz: [
            ['Does IReadOnlyList<T> guarantee the underlying list never changes?', 'No, it only hides mutation from that caller.'],
            ['When choose a frozen collection?', 'Built once, read many times, where lookup speed matters.'],
          ],
        },
      ],
    },
    {
      title: 'Strings and Text Processing',
      topics: [
        {
          title: 'String immutability and StringBuilder',
          description: 'Strings cannot change, so every concatenation allocates; StringBuilder, string.Join and string.Concat avoid the quadratic cost, and string interning explains reference equality surprises.',
          concepts: ['Immutability and allocation', 'StringBuilder', 'string.Join and Concat', 'String interning'],
          quiz: [
            ['Why is s += x in a loop slow?', 'Each iteration copies the whole string into a new one.'],
            ['Does == on strings compare references?', 'No, string overloads == to compare contents.'],
          ],
        },
        {
          title: 'Interpolation, formatting and culture',
          description: 'Interpolated strings with alignment and format specifiers, composite formatting, raw string literals, and why CultureInfo changes how numbers and dates render.',
          concepts: ['Interpolated strings and format specifiers', 'Alignment and padding', 'Raw string literals', 'CultureInfo and invariant culture'],
          quiz: [
            ['What does $"{price:C2}" produce?', 'The price formatted as currency with two decimals in the current culture.'],
            ['Why use CultureInfo.InvariantCulture for logs and files?', 'The output stays identical regardless of the machine locale.'],
          ],
        },
        {
          title: 'Common string methods',
          description: 'Split, Trim, Replace, Contains, StartsWith, IndexOf and Substring, ordinal versus culture-aware comparison, and case-insensitive equality done properly.',
          concepts: ['Split, Trim and Replace', 'IndexOf and Substring', 'StringComparison.Ordinal', 'Case-insensitive comparisons'],
          quiz: [
            ['Which comparison should you use for identifiers and keys?', 'StringComparison.Ordinal or OrdinalIgnoreCase.'],
            ['What does "a,b,,c".Split(\',\', StringSplitOptions.RemoveEmptyEntries) give?', '["a", "b", "c"]'],
          ],
        },
        {
          title: 'Regular expressions in .NET',
          description: 'System.Text.RegularExpressions: Match, Matches, Replace and IsMatch, named groups, RegexOptions, timeouts against catastrophic backtracking, and source-generated regexes.',
          concepts: ['Regex.Match and Matches', 'Named groups and captures', 'Regex.Replace with evaluators', 'Timeouts and backtracking', 'GeneratedRegex source generator'],
          quiz: [
            ['How do you read a named group?', 'match.Groups["name"].Value'],
            ['Why add a match timeout?', 'To stop pathological patterns from running for a very long time on hostile input.'],
          ],
        },
        {
          title: 'Encodings, spans and parsing text',
          description: 'UTF-16 strings versus UTF-8 bytes, Encoding.UTF8 for conversion, ReadOnlySpan<char> for slicing without allocating, and int.Parse over spans for fast parsers.',
          concepts: ['UTF-16 strings and UTF-8 bytes', 'Encoding.GetBytes and GetString', 'ReadOnlySpan<char> slicing', 'Parsing numbers from spans'],
          quiz: [
            ['What is a C# char?', 'A 16-bit UTF-16 code unit, not necessarily a whole character.'],
            ['Why slice with AsSpan() instead of Substring?', 'A span references the existing memory without allocating a new string.'],
          ],
        },
      ],
    },
    {
      title: 'Errors and Nullability',
      topics: [
        {
          title: 'Exceptions and try, catch, finally',
          description: 'Throwing and catching, the exception class hierarchy, finally for cleanup, catching specific types first, and why swallowing Exception hides bugs.',
          concepts: ['throw and the exception hierarchy', 'Ordering catch blocks', 'finally for cleanup', 'Rethrowing with throw;', 'Reading a stack trace'],
          quiz: [
            ['Difference between throw; and throw ex;?', 'throw; keeps the original stack trace; throw ex; resets it.'],
            ['Does finally run when catch rethrows?', 'Yes.'],
          ],
        },
        {
          title: 'Custom exceptions and exception filters',
          description: 'Designing an exception type with useful data, the when clause that filters without unwinding, ArgumentException helpers, and AggregateException from parallel work.',
          concepts: ['Deriving from Exception', 'catch when filters', 'ArgumentNullException.ThrowIfNull', 'AggregateException and InnerExceptions'],
          quiz: [
            ['What does catch (HttpRequestException e) when (e.StatusCode == 404) do?', 'Catches only if the filter is true, without unwinding the stack for others.'],
            ['Which exception wraps failures from Task.WaitAll?', 'AggregateException.'],
          ],
          prereqs: ['Exceptions and try, catch, finally'],
        },
        {
          title: 'Nullable reference types',
          description: 'With <Nullable>enable</Nullable> the compiler tracks whether a reference may be null: string versus string?, the warnings that appear, the null-forgiving ! operator, and annotations like [NotNullWhen].',
          concepts: ['Enabling nullable context', 'string versus string? and flow analysis', 'Null-forgiving operator !', 'Nullability attributes', 'required members'],
          quiz: [
            ['Does string? change the runtime type?', 'No, it is only a compile-time annotation.'],
            ['What does [NotNullWhen(true)] tell the compiler?', 'The parameter is non-null when the method returns true.'],
          ],
        },
        {
          title: 'Nullable value types and guard clauses',
          description: 'int? as Nullable<int> with HasValue and Value, lifting operators over null, GetValueOrDefault, and validating inputs early with guard clauses so invalid state never spreads.',
          concepts: ['Nullable<T> and HasValue', 'Lifted operators', 'GetValueOrDefault', 'Guard clauses at method entry'],
          quiz: [
            ['What is (int?)null + 1?', 'null, because arithmetic is lifted over null.'],
            ['What does x.Value throw when x is null?', 'InvalidOperationException.'],
          ],
          prereqs: ['Nullable reference types'],
        },
      ],
    },
    {
      title: 'Object-Oriented C#',
      topics: [
        {
          title: 'Classes, constructors and properties',
          description: 'Fields versus auto-properties, init-only setters, constructor chaining with this, primary constructors, object initialisers and static members.',
          concepts: ['Fields and auto-properties', 'init setters and object initialisers', 'Constructor chaining', 'Primary constructors', 'Static members'],
          quiz: [
            ['What does an init accessor allow?', 'Setting the property only during construction or in an object initialiser.'],
            ['What does public int Count { get; private set; } expose?', 'Public read, writes only inside the class.'],
          ],
        },
        {
          title: 'Structs, records and value semantics',
          description: 'When a struct beats a class, readonly structs, record classes and record structs with generated equality, with expressions for non-destructive mutation, and positional records.',
          concepts: ['struct versus class', 'readonly struct', 'record and value equality', 'with expressions', 'Positional records and deconstruction'],
          quiz: [
            ['What does record Person(string Name, int Age) generate?', 'Constructor, properties, Equals, GetHashCode, ToString and Deconstruct.'],
            ['Does p with { Age = 31 } mutate p?', 'No, it creates a copy with Age changed.'],
          ],
          prereqs: ['Classes, constructors and properties'],
        },
        {
          title: 'Inheritance, virtual and abstract members',
          description: 'Base and derived classes, virtual and override, abstract classes that cannot be instantiated, sealed to stop further overriding, and the new modifier for hiding.',
          concepts: ['virtual and override', 'abstract classes and members', 'sealed classes and methods', 'Hiding with new', 'base calls'],
          quiz: [
            ['What happens if you override without virtual on the base?', 'A compile error; the base member must be virtual or abstract.'],
            ['Why seal a class?', 'To prevent inheritance and let the JIT devirtualise calls.'],
          ],
          prereqs: ['Classes, constructors and properties'],
        },
        {
          title: 'Interfaces and default implementations',
          description: 'Contracts with interfaces, explicit implementation to resolve clashes, default interface methods, static abstract members for generic maths, and interface segregation.',
          concepts: ['Declaring and implementing interfaces', 'Explicit interface implementation', 'Default interface methods', 'Static abstract interface members', 'Small focused interfaces'],
          quiz: [
            ['When must you cast to call an interface method?', 'When it is implemented explicitly.'],
            ['What enables T.Zero in generic code?', 'Static abstract members on the constraint interface (INumber<T>).'],
          ],
          prereqs: ['Inheritance, virtual and abstract members'],
        },
        {
          title: 'Generics and constraints',
          description: 'Generic classes and methods, where constraints (class, struct, new(), interface, notnull), covariance and contravariance with out and in, and how generics avoid boxing.',
          concepts: ['Generic types and methods', 'where constraints', 'Covariance and contravariance', 'Generics and boxing', 'Generic type inference'],
          quiz: [
            ['What does where T : new() require?', 'T has a public parameterless constructor.'],
            ['Why is IEnumerable<out T> covariant?', 'T appears only in output positions, so IEnumerable<Cat> converts to IEnumerable<Animal>.'],
          ],
        },
        {
          title: 'Delegates, lambdas and events',
          description: 'Delegates as typed method references, Func and Action, lambda capture, multicast delegates, and events as the encapsulated publish-subscribe form with the EventHandler pattern.',
          concepts: ['Delegate types', 'Func, Action and Predicate', 'Lambda capture and closures', 'Multicast delegates', 'Declaring and raising events', 'EventHandler and EventArgs'],
          quiz: [
            ['How does event differ from a public delegate field?', 'Outside code can only add or remove handlers, not invoke or reset the list.'],
            ['What does handler?.Invoke(this, args) guard against?', 'Invoking a null event with no subscribers.'],
          ],
          prereqs: ['Generics and constraints'],
        },
        {
          title: 'Extension methods, indexers and operator overloading',
          description: 'Adding methods to existing types with static classes and this parameters, custom indexers, overloading operators like + and ==, and implicit conversion operators used sparingly.',
          concepts: ['Extension methods', 'Indexers', 'Operator overloading', 'Implicit and explicit conversion operators', 'IEquatable and GetHashCode'],
          quiz: [
            ['What is required for an extension method?', 'A static method in a static class whose first parameter is marked this.'],
            ['If you overload ==, what else must you provide?', '!=, and normally Equals and GetHashCode.'],
          ],
        },
      ],
    },
    {
      title: 'Memory, Resources and Concurrency',
      topics: [
        {
          title: 'The garbage collector and object lifetimes',
          description: 'Generational garbage collection, the large object heap, finalisers versus deterministic cleanup, weak references, and reading allocation counts to find churn.',
          concepts: ['Generations 0, 1 and 2', 'Large object heap', 'Finalisers and their cost', 'Weak references', 'Measuring allocations'],
          quiz: [
            ['Why are short-lived objects cheap?', 'They die in gen 0, which is collected quickly and often.'],
            ['Should you rely on finalisers to release files?', 'No, finalisers run late and non-deterministically; use IDisposable.'],
          ],
        },
        {
          title: 'IDisposable and using',
          description: 'Deterministic release of files, sockets and database connections through Dispose, using statements and declarations, the dispose pattern, and IAsyncDisposable.',
          concepts: ['Implementing IDisposable', 'using statements and declarations', 'The dispose pattern', 'IAsyncDisposable and await using'],
          quiz: [
            ['When does a using declaration dispose its variable?', 'At the end of the enclosing scope.'],
            ['Why is calling Dispose twice safe?', 'Correct implementations are idempotent.'],
          ],
          prereqs: ['The garbage collector and object lifetimes'],
        },
        {
          title: 'Span, Memory and stackalloc',
          description: 'Span<T> and Memory<T> as views over arrays, strings and native memory, stackalloc for small buffers, ArrayPool for reuse, and the ref struct rules that keep spans safe.',
          concepts: ['Span<T> and ReadOnlySpan<T>', 'Memory<T> for async code', 'stackalloc buffers', 'ArrayPool<T>', 'ref struct restrictions'],
          quiz: [
            ['Why cannot a Span<T> be a class field?', 'It is a ref struct that must live on the stack.'],
            ['When use Memory<T> instead of Span<T>?', 'When the buffer must cross an await or be stored in a field.'],
          ],
        },
        {
          title: 'Threads, Task and the thread pool',
          description: 'Thread versus the pooled Task, Task.Run for CPU work, Wait and Result versus await, lock and Interlocked for shared state, and race conditions demonstrated.',
          concepts: ['Thread and the thread pool', 'Task and Task.Run', 'lock and Monitor', 'Interlocked operations', 'Race conditions and data races'],
          quiz: [
            ['What does Task.Run do?', 'Queues work to the thread pool and returns a Task for it.'],
            ['Why avoid task.Result on a UI or ASP.NET thread?', 'It blocks and can deadlock with a captured context.'],
          ],
        },
        {
          title: 'async and await',
          description: 'How the compiler rewrites an async method into a state machine, awaiting Task and Task<T>, exceptions in async code, ConfigureAwait, and why async void is only for event handlers.',
          concepts: ['Async state machine', 'Awaiting Task and Task<T>', 'Exceptions in async methods', 'ConfigureAwait(false)', 'async void dangers'],
          quiz: [
            ['What does await do while waiting?', 'Returns control to the caller and resumes the method when the task completes.'],
            ['Why is async void dangerous?', 'Exceptions cannot be observed by the caller and crash the process.'],
          ],
          prereqs: ['Threads, Task and the thread pool'],
        },
        {
          title: 'Cancellation, timeouts and async streams',
          description: 'CancellationToken and CancellationTokenSource, cooperative cancellation in loops and I/O, Task.WhenAll and WhenAny, ValueTask, and IAsyncEnumerable with await foreach.',
          concepts: ['CancellationToken plumbing', 'Task.WhenAll and WhenAny', 'Timeouts with CancelAfter', 'ValueTask', 'IAsyncEnumerable and await foreach'],
          quiz: [
            ['What exception does cancellation raise?', 'OperationCanceledException (or its subclass TaskCanceledException).'],
            ['How do you run three requests concurrently and await all?', 'await Task.WhenAll(t1, t2, t3)'],
          ],
          prereqs: ['async and await'],
        },
        {
          title: 'Parallelism and concurrent collections',
          description: 'Parallel.For and Parallel.ForEachAsync for CPU-bound loops, PLINQ, ConcurrentDictionary and ConcurrentQueue, and Channels for producer-consumer pipelines.',
          concepts: ['Parallel.For and ForEachAsync', 'PLINQ with AsParallel', 'ConcurrentDictionary', 'System.Threading.Channels', 'SemaphoreSlim for throttling'],
          quiz: [
            ['When does PLINQ help?', 'CPU-heavy work over large sequences where ordering does not matter or can be restored.'],
            ['What does ConcurrentDictionary.GetOrAdd guarantee?', 'Thread-safe add-if-missing, though the factory may run more than once.'],
          ],
          prereqs: ['Cancellation, timeouts and async streams'],
        },
      ],
    },
    {
      title: 'Modules, I/O and the Standard Library',
      topics: [
        {
          title: 'Assemblies, project references and access modifiers',
          description: 'How a project compiles to an assembly, referencing other projects and packages, public, internal, private, protected and file modifiers, and InternalsVisibleTo for tests.',
          concepts: ['Assemblies and DLLs', 'Project references', 'Access modifiers', 'InternalsVisibleTo', 'Multi-project layering'],
          quiz: [
            ['What does internal mean?', 'Visible anywhere inside the same assembly only.'],
            ['How do tests reach internal members?', 'With [assembly: InternalsVisibleTo("Project.Tests")].'],
          ],
        },
        {
          title: 'File and stream I/O',
          description: 'File.ReadAllText and ReadLines, FileStream and StreamReader, async file APIs, Path.Combine, Directory enumeration, and buffering for large files.',
          concepts: ['File and Directory helpers', 'Streams, readers and writers', 'Async file I/O', 'Path.Combine and cross-platform paths', 'Line-by-line reading'],
          quiz: [
            ['Why use Path.Combine rather than string concatenation?', 'It inserts the correct separator for the OS.'],
            ['Which method reads a huge file lazily?', 'File.ReadLines, which yields lines as they are read.'],
          ],
          prereqs: ['IDisposable and using'],
        },
        {
          title: 'JSON with System.Text.Json',
          description: 'Serialising and deserialising with JsonSerializer, JsonSerializerOptions for naming and enums, attributes for renaming and ignoring, source generation, and JsonNode for dynamic documents.',
          concepts: ['JsonSerializer.Serialize and Deserialize', 'JsonSerializerOptions', 'JsonPropertyName and JsonIgnore', 'Source-generated serializers', 'JsonNode and JsonDocument'],
          quiz: [
            ['How do you get camelCase property names?', 'Set PropertyNamingPolicy = JsonNamingPolicy.CamelCase.'],
            ['What does a missing required property produce?', 'JsonException when the member is marked required.'],
          ],
        },
        {
          title: 'Dates, times and identifiers',
          description: 'DateTime versus DateTimeOffset, DateOnly and TimeOnly, TimeSpan arithmetic, TimeZoneInfo, ISO 8601 round trips, Guid generation and Stopwatch for timing.',
          concepts: ['DateTime and DateTimeOffset', 'DateOnly and TimeOnly', 'TimeSpan and TimeZoneInfo', 'ISO 8601 formatting', 'Guid and Stopwatch'],
          quiz: [
            ['Why prefer DateTimeOffset for timestamps?', 'It carries the UTC offset so the instant is unambiguous.'],
            ['Which format string round-trips a DateTime?', '"o"'],
          ],
        },
        {
          title: 'Processes, environment and configuration',
          description: 'Environment variables and Environment.GetEnvironmentVariable, Process.Start for external commands, command-line parsing with System.CommandLine, and app settings via IConfiguration.',
          concepts: ['Environment variables', 'Process.Start and redirected output', 'System.CommandLine', 'IConfiguration and appsettings.json', 'User secrets in development'],
          quiz: [
            ['Where should development-only secrets go?', 'dotnet user-secrets, not appsettings.json.'],
            ['How do you capture a child process output?', 'Set RedirectStandardOutput = true and read StandardOutput.'],
          ],
        },
      ],
    },
    {
      title: 'Testing, Quality and Performance',
      topics: [
        {
          title: 'Unit testing with xUnit',
          description: 'Fact and Theory tests, InlineData and MemberData, Assert methods, test project setup, running with dotnet test and filtering by name or trait.',
          concepts: ['Fact and Theory', 'InlineData and MemberData', 'Assert methods', 'dotnet test and filters', 'Arrange, act, assert'],
          quiz: [
            ['What is a Theory?', 'A parameterised test that runs once per data row.'],
            ['How do you run tests matching a name?', 'dotnet test --filter "FullyQualifiedName~Orders"'],
          ],
        },
        {
          title: 'Test doubles and mocking',
          description: 'Designing for testability with interfaces, stubbing with NSubstitute or Moq, verifying calls, FluentAssertions for readable checks, and when a fake beats a mock.',
          concepts: ['Interfaces for testability', 'NSubstitute or Moq basics', 'Verifying calls', 'FluentAssertions', 'Fakes versus mocks'],
          quiz: [
            ['Why inject an IClock instead of calling DateTime.Now?', 'Tests can control time deterministically.'],
            ['What does substitute.Received().Send(Arg.Any<string>()) assert?', 'Send was called at least once with any string.'],
          ],
          prereqs: ['Unit testing with xUnit'],
        },
        {
          title: 'Debugging and diagnostics',
          description: 'Breakpoints, conditional breakpoints and watch windows, Debug.Assert, the dotnet-counters and dotnet-trace tools, and reading a crash dump with dotnet-dump.',
          concepts: ['Breakpoints and watches', 'Debug.Assert and Debugger.Break', 'dotnet-counters and dotnet-trace', 'Crash dumps with dotnet-dump'],
          quiz: [
            ['Is Debug.Assert compiled into Release builds?', 'No, it is removed when DEBUG is not defined.'],
            ['Which tool shows live GC and thread pool counters?', 'dotnet-counters'],
          ],
        },
        {
          title: 'Benchmarking and performance',
          description: 'BenchmarkDotNet for trustworthy measurements, allocation-free patterns with Span and struct enumerators, string and LINQ hot spots, and tiered JIT and ReadyToRun effects.',
          concepts: ['BenchmarkDotNet', 'Reducing allocations', 'LINQ in hot paths', 'Tiered compilation and ReadyToRun', 'Boxing costs'],
          quiz: [
            ['Why not time code with Stopwatch in a loop for benchmarks?', 'JIT warm-up, GC and noise distort results; BenchmarkDotNet controls them.'],
            ['What causes boxing?', 'Converting a value type to object or an interface.'],
          ],
        },
        {
          title: 'Security fundamentals for .NET code',
          description: 'Parameterised queries, validating and encoding inputs, hashing passwords with PBKDF2 or Argon2, System.Security.Cryptography for symmetric encryption, and keeping secrets out of source.',
          concepts: ['Parameterised database queries', 'Input validation and encoding', 'Password hashing', 'AES and RandomNumberGenerator', 'Secret management'],
          quiz: [
            ['Why never use MD5 or SHA-1 for passwords?', 'They are fast to brute force and offer no salting or work factor.'],
            ['Which class produces cryptographically secure random bytes?', 'RandomNumberGenerator.'],
          ],
        },
      ],
    },
    {
      title: 'Applications with ASP.NET Core',
      description: 'An overview of how C# is used on the server; the full framework has its own track (ASP.NET Core).',
      style: 'practice',
      topics: [
        {
          title: 'Minimal APIs and the request pipeline',
          description: 'WebApplication.CreateBuilder, MapGet and MapPost with route parameters, model binding from body and query, and how middleware forms a pipeline around each request.',
          concepts: ['WebApplication and endpoints', 'Route and query binding', 'Middleware pipeline', 'Results and status codes'],
          quiz: [
            ['What does app.MapGet("/items/{id:int}", ...) constrain?', 'The id segment must parse as an integer.'],
            ['In what order does middleware run?', 'In registration order on the way in, reverse on the way out.'],
          ],
        },
        {
          title: 'Dependency injection in .NET',
          description: 'The built-in container: registering services with AddSingleton, AddScoped and AddTransient, constructor injection, lifetimes and the captive dependency bug.',
          concepts: ['Registering services', 'Constructor injection', 'Singleton, scoped and transient lifetimes', 'Captive dependencies', 'Options pattern'],
          quiz: [
            ['What is a captive dependency?', 'A singleton holding a scoped or transient service, extending its life incorrectly.'],
            ['How long does a scoped service live in a web app?', 'For one HTTP request.'],
          ],
          prereqs: ['Interfaces and default implementations'],
        },
        {
          title: 'Configuration and logging',
          description: 'Layered configuration from appsettings.json, environment variables and user secrets, strongly typed options, and ILogger with structured message templates and log levels.',
          concepts: ['Configuration providers and precedence', 'IOptions<T> binding', 'ILogger<T> and message templates', 'Log levels and filtering'],
          quiz: [
            ['Which configuration source usually wins?', 'Environment variables and command-line arguments override appsettings.json.'],
            ['Why use message templates instead of string interpolation in logs?', 'Values become structured properties that can be searched.'],
          ],
          prereqs: ['Dependency injection in .NET'],
        },
        {
          title: 'Entity Framework Core essentials',
          description: 'DbContext and DbSet, mapping entities and relationships, LINQ translated to SQL, migrations with dotnet ef, and the N+1 and tracking pitfalls; deeper SQL lives in the SQL track.',
          concepts: ['DbContext and DbSet', 'Entity mapping and relationships', 'LINQ to SQL translation', 'Migrations with dotnet ef', 'AsNoTracking and Include'],
          quiz: [
            ['What does AsNoTracking do?', 'Skips change tracking for read-only queries, saving memory and time.'],
            ['What does Include(o => o.Lines) prevent?', 'N+1 queries by loading the related rows in one query.'],
          ],
          prereqs: ['Grouping, joining and aggregating with LINQ'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: console expense tracker',
          description: 'Build a CLI that records expenses, stores them as JSON in the user profile folder, lists and filters by month and category with LINQ, and exports a CSV, with xUnit tests around the storage and reporting code.',
          concepts: ['Design records and commands', 'Persist with System.Text.Json', 'Report with LINQ grouping', 'Test storage with temp folders'],
          quiz: [
            ['Why model an expense as a record?', 'Value equality and immutability make tests and comparisons simple.'],
            ['Where should the data file live?', 'Under Environment.SpecialFolder.ApplicationData, not the working directory.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent file indexer',
          description: 'Scan a directory tree, hash files in parallel with Parallel.ForEachAsync and bounded concurrency, detect duplicates with a ConcurrentDictionary, honour cancellation with Ctrl+C, and print a summary.',
          concepts: ['Enumerate files lazily', 'Hash with bounded parallelism', 'Collect results thread-safely', 'Cancel cleanly on Ctrl+C'],
          quiz: [
            ['How do you bound parallelism in Parallel.ForEachAsync?', 'ParallelOptions.MaxDegreeOfParallelism.'],
            ['How do you hook Ctrl+C?', 'Console.CancelKeyPress, cancelling a CancellationTokenSource.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: minimal REST API with EF Core',
          description: 'A todo API with minimal endpoints, EF Core over SQLite, migrations, validation, DI-registered services, integration tests with WebApplicationFactory, and a Dockerfile.',
          concepts: ['Model entities and endpoints', 'Migrations and SQLite', 'Validate and return ProblemDetails', 'Integration tests with WebApplicationFactory', 'Containerise the service'],
          quiz: [
            ['What does WebApplicationFactory give tests?', 'An in-memory server running the real app with an HttpClient.'],
            ['Which status code for a failed validation?', '400 Bad Request with ProblemDetails.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: event-driven order simulator',
          description: 'Model an order pipeline with records and pattern matching, publish state changes through events and Channels, run producers and consumers as background tasks, and assert ordering in tests.',
          concepts: ['Model states as records', 'Transitions with switch expressions', 'Publish through events and Channels', 'Background producers and consumers', 'Test ordering guarantees'],
          quiz: [
            ['Why use a Channel over a shared List?', 'It gives thread-safe, awaitable producer-consumer handoff.'],
            ['How do you represent a closed set of states?', 'An abstract record with sealed derived records.'],
          ],
          style: 'project',
        },
        {
          title: 'C# interview questions',
          description: 'The questions that recur in .NET interviews: value versus reference types, boxing, IDisposable versus finalisers, async pitfalls, deferred LINQ, interfaces versus abstract classes, and records versus classes.',
          concepts: ['Type system questions', 'Memory and GC questions', 'Async and threading questions', 'LINQ and collections questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['What is boxing?', 'Wrapping a value type in a heap object when converted to object or an interface.'],
            ['Interface or abstract class?', 'Abstract class shares implementation and state; interface defines a contract and allows multiple inheritance.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in C#',
          description: 'Solving problems quickly in C#: fast console input, Dictionary and HashSet tricks, PriorityQueue, StringBuilder, sorting with comparers, tuples for multiple returns, and hidden O(n) traps.',
          concepts: ['Fast console input', 'PriorityQueue<T, TPriority>', 'Sorting with Comparison delegates', 'Tuples and deconstruction', 'Hidden complexity traps'],
          quiz: [
            ['How do you get a min-heap in C#?', 'PriorityQueue<TElement, TPriority> with the priority as the key.'],
            ['What is the cost of list.Contains?', 'O(n); use a HashSet for O(1).'],
          ],
        },
      ],
    },
  ],
})
