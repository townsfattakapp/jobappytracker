import { defineTrack } from '../define'

export const go = defineTrack({
  id: 'track-go',
  title: 'Go',
  description: 'Go from the toolchain and modules to production services: slices and maps, interfaces, errors as values, goroutines, channels, context, sync and atomic, net/http, database/sql, testing and pprof, containerised cloud-native deployment, projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🐹',
  tags: ['go', 'golang', 'backend', 'concurrency', 'cloud-native', 'microservices', 'net/http'],
  languages: ['Go'],
  explainMode: 'concept',
  code: { label: 'Go', id: 'go', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'The toolchain, modules and formatting conventions that every Go project relies on.',
      topics: [
        {
          title: 'Installing Go and the toolchain',
          description: 'Installing the go command, what GOROOT, GOPATH and the module cache are for today, checking go version and go env, and how the toolchain directive lets a module pin a newer Go automatically.',
          concepts: ['go version and go env', 'GOROOT, GOPATH and the module cache', 'The toolchain directive', 'Keeping multiple Go versions'],
          quiz: [
            ['Where does Go download dependencies to?', 'The module cache under GOMODCACHE, usually $GOPATH/pkg/mod.'],
            ['What does go env GOOS print?', 'The target operating system for builds, for example linux or windows.'],
            ['Do you still need to put code under GOPATH?', 'No, modules work from any directory.'],
          ],
        },
        {
          title: 'go run, go build and go install',
          description: 'The three ways to execute a program: compile-and-run for iteration, build for a binary in the current directory, and install for a tool placed on the PATH, plus the ./... package pattern.',
          concepts: ['go run for quick iteration', 'go build outputs and -o', 'go install and GOBIN', 'The ./... pattern'],
          quiz: [
            ['What does go build ./... do?', 'Compiles every package in the module tree, discarding non-main outputs.'],
            ['Where does go install put binaries?', 'GOBIN, or $GOPATH/bin when GOBIN is unset.'],
          ],
          prereqs: ['Installing Go and the toolchain'],
        },
        {
          title: 'Modules: go.mod, go.sum and go get',
          description: 'go mod init names a module by its import path, go get adds dependencies at a semantic version, go.sum records hashes so builds are verifiable, and go mod tidy keeps both files honest.',
          concepts: ['go mod init and the module path', 'go get and semantic versions', 'go.sum and checksum verification', 'go mod tidy'],
          quiz: [
            ['What is stored in go.sum?', 'Cryptographic hashes of each dependency version so downloads can be verified.'],
            ['How do you upgrade one dependency to its latest minor version?', 'go get example.com/pkg@latest'],
            ['Should go.sum be committed?', 'Yes, it guarantees reproducible, verified builds.'],
          ],
          prereqs: ['go run, go build and go install'],
        },
        {
          title: 'gofmt, go vet and linters',
          description: 'Formatting is not negotiable in Go: gofmt produces one canonical layout, go vet catches suspicious code such as bad Printf verbs and copied locks, and staticcheck or golangci-lint add deeper checks via gopls in the editor.',
          concepts: ['gofmt and goimports', 'go vet checks', 'staticcheck and golangci-lint', 'gopls editor integration'],
          quiz: [
            ['What does gofmt -l do?', 'Lists files whose formatting differs from the canonical output.'],
            ['Name one thing go vet catches.', 'Printf calls whose verbs do not match the arguments.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax, Control Flow and Functions',
      topics: [
        {
          title: 'Packages, main and imports',
          description: 'Every file starts with a package clause, an executable needs package main with func main, imports are paths not names, unused imports and variables are compile errors, and capitalised identifiers are exported.',
          concepts: ['package clause and package main', 'Import paths and aliases', 'Unused imports and variables fail to compile', 'Exported names by capitalisation'],
          quiz: [
            ['How does Go decide if an identifier is exported?', 'It starts with an uppercase letter.'],
            ['What happens with an unused import?', 'A compile error; use the blank identifier _ only for side-effect imports.'],
          ],
        },
        {
          title: 'Variables, constants and iota',
          description: 'var declarations versus := short declarations, why every variable has a usable zero value, typed and untyped constants, and iota for enumerated constants with bit flags.',
          concepts: ['var versus := short declaration', 'Zero values for every type', 'Typed and untyped constants', 'iota enumerations'],
          quiz: [
            ['What is the zero value of a string, an int and a pointer?', '"", 0 and nil.'],
            ['Can := be used at package level?', 'No, only inside functions; use var at package scope.'],
            ['What does iota do?', 'Counts from 0 within a const block, incrementing per line.'],
          ],
        },
        {
          title: 'Basic types and conversions',
          description: 'int and sized integers, float32 and float64, byte and rune aliases, bool and string, why Go has no implicit numeric conversion, and how untyped constants avoid most casts.',
          concepts: ['Sized integers and overflow', 'float64 and rounding', 'byte and rune aliases', 'Explicit conversions T(x)'],
          quiz: [
            ['Can you add an int and an int64 directly?', 'No, one must be converted explicitly.'],
            ['What is rune an alias for?', 'int32, representing a Unicode code point.'],
          ],
        },
        {
          title: 'Operators and expressions',
          description: 'Arithmetic, comparison and logical operators, bitwise operators including &^ (AND NOT), why ++ is a statement rather than an expression, integer division and modulo, and the absence of a ternary operator.',
          concepts: ['Arithmetic and integer division', 'Bitwise operators and &^', '++ and -- as statements', 'Short-circuit && and ||'],
          quiz: [
            ['What is 7 / 2 in Go with ints?', '3, integer division truncates toward zero.'],
            ['Why can you not write y := x++?', 'x++ is a statement, not an expression.'],
          ],
        },
        {
          title: 'Conditions, switch and loops',
          description: 'if with an init statement, switch without automatic fallthrough and with no-condition form, the single for keyword covering while and infinite loops, range over slices, maps, strings, integers and functions, and labeled break and continue.',
          concepts: ['if with init statement', 'switch and fallthrough', 'for as the only loop', 'range over collections and integers', 'Labeled break and continue'],
          quiz: [
            ['Does a switch case fall through by default?', 'No, use the fallthrough keyword explicitly.'],
            ['How do you write a while loop?', 'for condition { ... }'],
            ['What does for i := range 10 iterate?', 'The integers 0 through 9.'],
          ],
          prereqs: ['Operators and expressions'],
        },
        {
          title: 'Functions, multiple returns and variadics',
          description: 'Functions return several values, conventionally (result, error), named results document intent and enable bare returns, and variadic parameters collect trailing arguments as a slice expanded with ....',
          concepts: ['Multiple return values', 'Named results and bare returns', 'Variadic parameters and slice expansion', 'Functions as parameters'],
          quiz: [
            ['How do you pass a slice to a variadic function?', 'f(items...)'],
            ['What is the conventional position of the error return?', 'Last.'],
          ],
        },
        {
          title: 'Closures and function values',
          description: 'Function literals capture variables by reference, per-iteration loop variables since Go 1.22 remove the classic capture bug, and closures give you generators, memoisation and callbacks without classes.',
          concepts: ['Function literals', 'Capturing variables by reference', 'Loop variable semantics since Go 1.22', 'Closures as stateful generators'],
          quiz: [
            ['Does a closure copy the variables it uses?', 'No, it references them, so later changes are visible.'],
            ['What changed for loop variables in Go 1.22?', 'Each iteration gets its own variable, so closures no longer share one.'],
          ],
          prereqs: ['Functions, multiple returns and variadics'],
        },
        {
          title: 'defer and evaluation order',
          description: 'defer schedules a call to run when the surrounding function returns, in LIFO order, with arguments evaluated at the defer statement; it is how Go closes files, unlocks mutexes and adjusts named results.',
          concepts: ['defer runs at function exit', 'LIFO order of deferred calls', 'Arguments evaluated immediately', 'Modifying named results in defer'],
          quiz: [
            ['In what order do three defers run?', 'Reverse order: the last deferred runs first.'],
            ['When is the argument to defer fmt.Println(x) evaluated?', 'At the defer statement, not when the function returns.'],
          ],
          prereqs: ['Functions, multiple returns and variadics'],
        },
      ],
    },
    {
      title: 'Collections, Strings and Text',
      topics: [
        {
          title: 'Arrays and slices',
          description: 'Arrays are fixed-size values copied on assignment; slices are views onto an array with length and capacity, created with literals or make, extended with append and iterated with range.',
          concepts: ['Arrays as values', 'Slice literals and make', 'len and cap', 'append and range over slices'],
          quiz: [
            ['Is [3]int the same type as [4]int?', 'No, the length is part of an array type.'],
            ['What does make([]int, 0, 10) create?', 'An empty slice with capacity 10.'],
          ],
        },
        {
          title: 'Slice internals, append and aliasing',
          description: 'A slice header holds a pointer, length and capacity, so sub-slices share memory; append reallocates only when capacity runs out, which is why two slices can silently overwrite each other, and copy, full slice expressions and the slices package help.',
          concepts: ['The slice header', 'Growth and reallocation on append', 'Aliasing bugs from shared backing arrays', 'Full slice expressions a[lo:hi:max]', 'copy and the slices package', 'nil versus empty slices'],
          quiz: [
            ['Why can appending to a sub-slice overwrite the parent?', 'They share the backing array while capacity remains.'],
            ['What does a[1:3:3] guarantee?', 'Capacity 2, forcing append to allocate a new array.'],
            ['Does len(nil slice) panic?', 'No, it returns 0.'],
          ],
          prereqs: ['Arrays and slices'],
        },
        {
          title: 'Maps and the maps package',
          description: 'Hash maps created with make or literals, the comma-ok lookup, delete and clear, deliberately randomised iteration order, why maps are not safe for concurrent writes, and helpers in the maps package.',
          concepts: ['make and map literals', 'Comma-ok lookup', 'delete and clear', 'Randomised iteration order', 'maps.Keys and sorted iteration'],
          quiz: [
            ['What does v, ok := m[k] give when k is absent?', 'The zero value and ok == false.'],
            ['What happens if two goroutines write to a map concurrently?', 'The runtime detects it and crashes with a fatal error.'],
            ['Is map iteration order stable?', 'No, it is intentionally randomised.'],
          ],
        },
        {
          title: 'Structs, pointers and copies',
          description: 'Structs group named fields and are copied by value; pointers with & and * share one value, there is no pointer arithmetic, Go auto-dereferences p.field, and choosing value or pointer decides whether callers see mutations.',
          concepts: ['Struct literals and field tags', 'Value copies of structs', '& and * without arithmetic', 'Automatic dereference of p.field', 'Comparable structs'],
          quiz: [
            ['Does passing a struct to a function copy it?', 'Yes, unless you pass a pointer.'],
            ['Can you compare two structs with ==?', 'Yes, if all their fields are comparable.'],
          ],
        },
        {
          title: 'Strings, bytes and runes',
          description: 'Strings are immutable UTF-8 byte sequences: len counts bytes, indexing yields bytes, range yields runes with byte offsets, and conversions to []byte and []rune are how you edit or count characters.',
          concepts: ['Immutable UTF-8 strings', 'len counts bytes not characters', 'range yields runes', 'Converting to []byte and []rune', 'The unicode/utf8 package'],
          quiz: [
            ['What is len("héllo")?', '6, because é takes two bytes in UTF-8.'],
            ['How do you count characters?', 'utf8.RuneCountInString(s) or len([]rune(s)).'],
          ],
        },
        {
          title: 'strings, strconv and fmt',
          description: 'The strings package for searching, splitting and building text efficiently with strings.Builder, strconv for converting to and from numbers, and fmt verbs such as %v, %+v, %#v, %T and %q for output.',
          concepts: ['Split, Fields, Join and Contains', 'strings.Builder for efficient concatenation', 'strconv.Atoi and ParseFloat', 'fmt verbs %v %+v %T %q', 'The Stringer interface'],
          quiz: [
            ['What does %+v print for a struct?', 'Field names with their values.'],
            ['Why use strings.Builder instead of += in a loop?', 'It appends to one buffer instead of allocating a new string each time.'],
            ['What does strconv.Atoi return?', 'An int and an error.'],
          ],
          prereqs: ['Strings, bytes and runes'],
        },
        {
          title: 'Regular expressions with regexp',
          description: 'RE2 syntax with linear-time guarantees but no backreferences, compiling once with MustCompile at package level, Find and FindAll variants with submatches, and ReplaceAllString with $1 expansions.',
          concepts: ['RE2 syntax and its limits', 'MustCompile at package level', 'FindStringSubmatch and FindAll variants', 'ReplaceAllString and named groups'],
          quiz: [
            ['Why does Go regexp not support backreferences?', 'It uses RE2, which guarantees linear time and excludes them.'],
            ['Difference between Compile and MustCompile?', 'MustCompile panics on a bad pattern instead of returning an error.'],
          ],
        },
        {
          title: 'Sorting and searching with slices and sort',
          description: 'slices.Sort and slices.SortFunc with cmp.Compare for ordered and custom sorts, stable variants, slices.BinarySearch on sorted data, and the older sort.Slice and sort.Interface when you meet them in code.',
          concepts: ['slices.Sort and SortFunc', 'cmp.Compare and multi-key ordering', 'Stable sorting with SortStableFunc', 'slices.BinarySearch', 'Legacy sort.Slice and sort.Interface'],
          quiz: [
            ['How do you sort a slice of structs by a field?', 'slices.SortFunc(s, func(a, b T) int { return cmp.Compare(a.Field, b.Field) })'],
            ['Is slices.Sort stable?', 'No, use SortStableFunc when equal elements must keep order.'],
          ],
          prereqs: ['Slice internals, append and aliasing'],
        },
      ],
    },
    {
      title: 'Error Handling',
      topics: [
        {
          title: 'Errors as values',
          description: 'error is a one-method interface, functions return it as the last value, callers check if err != nil immediately, and errors.New and fmt.Errorf create messages; this explicit style replaces exceptions.',
          concepts: ['The error interface', 'Returning and checking errors', 'errors.New and fmt.Errorf', 'Handle once, do not log and return'],
          quiz: [
            ['What is the error type?', 'An interface with a single method Error() string.'],
            ['Why is logging an error and also returning it discouraged?', 'It gets reported twice; handle it once at the right layer.'],
          ],
        },
        {
          title: 'Wrapping, errors.Is and errors.As',
          description: 'fmt.Errorf with %w wraps a cause while adding context, errors.Is walks the chain to compare against sentinels, errors.As extracts a typed error, and errors.Join combines several failures.',
          concepts: ['Wrapping with %w', 'errors.Is against sentinel values', 'errors.As for typed errors', 'errors.Join and Unwrap'],
          quiz: [
            ['What does errors.Is(err, os.ErrNotExist) do?', 'Reports whether any error in the chain equals os.ErrNotExist.'],
            ['Difference between %v and %w in fmt.Errorf?', '%w keeps the wrapped error retrievable with Is and As; %v flattens it to text.'],
          ],
          prereqs: ['Errors as values'],
        },
        {
          title: 'Designing error types',
          description: 'Exported sentinel errors for expected conditions, struct error types carrying fields such as status codes, adding context at each layer without repeating it, and keeping messages lowercase and unpunctuated.',
          concepts: ['Sentinel errors as package variables', 'Struct error types with fields', 'Adding context per layer', 'Message conventions'],
          quiz: [
            ['When should you define a custom error type?', 'When callers need structured data such as a code or field name.'],
            ['Why start error messages in lowercase?', 'They are usually wrapped into longer messages.'],
          ],
          prereqs: ['Wrapping, errors.Is and errors.As'],
        },
        {
          title: 'panic, recover and when not to use them',
          description: 'panic unwinds the stack running deferred calls, recover inside a deferred function stops it, runtime errors such as nil map writes and index out of range panic, and panics are for programmer bugs rather than expected failures.',
          concepts: ['How panic unwinds', 'recover inside a deferred function', 'Runtime panics you will meet', 'Panics versus errors'],
          quiz: [
            ['Where must recover be called to work?', 'Directly inside a deferred function.'],
            ['Should a library panic on a bad network response?', 'No, return an error; panics are for bugs and unrecoverable state.'],
          ],
          prereqs: ['defer and evaluation order'],
        },
      ],
    },
    {
      title: 'Packages, Modules and I/O',
      topics: [
        {
          title: 'Designing packages and exported APIs',
          description: 'Short lowercase package names that read well at call sites, internal/ directories the compiler enforces, doc comments starting with the identifier, NewT constructors with useful zero values and functional options, and why import cycles are illegal.',
          concepts: ['Package naming conventions', 'internal/ visibility', 'Doc comments and go doc', 'NewT constructors and useful zero values', 'Functional options pattern', 'Avoiding util and import cycles'],
          quiz: [
            ['Who can import a package under internal/?', 'Only code rooted at the parent of the internal directory.'],
            ['How should a doc comment for func Parse begin?', 'With "Parse ..." naming the identifier.'],
            ['What is a functional option?', 'A func(*T) passed variadically to a constructor to set optional fields.'],
          ],
          prereqs: ['Packages, main and imports'],
        },
        {
          title: 'Module versions, replace and workspaces',
          description: 'Semantic version tags, the /v2 suffix rule for breaking changes, replace directives for local forks, go.work for multi-module development, vendoring, and how the module proxy and GOPRIVATE interact.',
          concepts: ['Semantic import versioning and /v2', 'replace directives', 'go.work workspaces', 'Vendoring and the module proxy', 'GOPRIVATE for private modules'],
          quiz: [
            ['What must change when a module releases v2?', 'The module path gains a /v2 suffix.'],
            ['When would you use go.work?', 'To develop several modules together without replace directives.'],
          ],
          prereqs: ['Modules: go.mod, go.sum and go get'],
        },
        {
          title: 'Files with os and bufio',
          description: 'os.ReadFile and os.WriteFile for whole files, os.Open with deferred Close for streams, bufio.Scanner for line-by-line reading with its token size limit, bufio.Writer with Flush, and file permissions.',
          concepts: ['os.ReadFile and os.WriteFile', 'os.Open and deferred Close', 'bufio.Scanner line reading', 'bufio.Writer and Flush', 'Permissions and os.MkdirAll'],
          quiz: [
            ['What is the default maximum line size for bufio.Scanner?', '64 KB; use scanner.Buffer to raise it.'],
            ['Why call Flush on a bufio.Writer?', 'Buffered bytes are not written until Flush or the buffer fills.'],
          ],
        },
        {
          title: 'io.Reader and io.Writer',
          description: 'Two tiny interfaces that compose the whole I/O ecosystem: files, sockets, gzip, HTTP bodies and buffers all implement them, so io.Copy, io.MultiWriter, io.TeeReader and io.LimitReader work everywhere.',
          concepts: ['The Reader and Writer contracts', 'io.Copy and streaming', 'MultiWriter, TeeReader and LimitReader', 'bytes.Buffer and strings.Reader', 'io.EOF handling'],
          quiz: [
            ['What does a Reader return at end of input?', 'n bytes read and io.EOF, possibly with n > 0 on the same call.'],
            ['How do you write to a file and stdout at once?', 'io.MultiWriter(file, os.Stdout).'],
          ],
          prereqs: ['Files with os and bufio'],
        },
        {
          title: 'JSON with encoding/json',
          description: 'Marshal and Unmarshal driven by struct tags, omitempty and the - tag, json.Decoder for streams and DisallowUnknownFields, custom MarshalJSON, and why unexported fields are silently skipped.',
          concepts: ['Marshal and Unmarshal', 'Struct tags, omitempty and -', 'json.Decoder and Encoder for streams', 'Custom MarshalJSON', 'Unexported fields are ignored'],
          quiz: [
            ['Why does a field not appear in JSON output?', 'It is unexported (lowercase) or tagged with "-".'],
            ['What does DisallowUnknownFields do?', 'Makes decoding fail when the input has fields not in the struct.'],
          ],
        },
        {
          title: 'Command-line tools with flag, os/exec and signals',
          description: 'Parsing options with the flag package, subcommands with flag.NewFlagSet, exit codes and stderr, running child processes with os/exec and capturing output, and cancelling on Ctrl-C with signal.NotifyContext.',
          concepts: ['flag definitions and Parse', 'Subcommands with FlagSet', 'Exit codes and stderr', 'os/exec and captured output', 'signal.NotifyContext'],
          quiz: [
            ['What does flag.Args() return?', 'The non-flag arguments remaining after parsing.'],
            ['How do you cancel a context on SIGINT?', 'ctx, stop := signal.NotifyContext(ctx, os.Interrupt)'],
          ],
        },
      ],
    },
    {
      title: 'Idiomatic Go Design',
      topics: [
        {
          title: 'Methods and receivers',
          description: 'Methods attach to any named type, value receivers copy and pointer receivers mutate, the method set rules decide which interfaces a type satisfies, and Go auto-addresses variables so v.Method() works with pointer receivers.',
          concepts: ['Methods on named types', 'Value versus pointer receivers', 'Method sets and interface satisfaction', 'Automatic addressing of receivers'],
          quiz: [
            ['Can a map value call a pointer-receiver method?', 'No, map elements are not addressable.'],
            ['Which receiver type should a type use?', 'Be consistent; use pointers if any method mutates or the struct is large.'],
          ],
          prereqs: ['Structs, pointers and copies'],
        },
        {
          title: 'Interfaces and implicit satisfaction',
          description: 'A type satisfies an interface just by having the methods, so interfaces are defined by consumers and kept small; accept interfaces and return structs, and beware the nil-pointer-inside-interface trap.',
          concepts: ['Implicit satisfaction', 'Small consumer-defined interfaces', 'Accept interfaces, return structs', 'Interface values and the typed nil trap', 'Compile-time checks var _ I = T{}'],
          quiz: [
            ['How do you declare that a type implements an interface?', 'You do not; it implements it by having the methods.'],
            ['Why can an interface holding a nil *T be non-nil?', 'The interface stores a type and a value; a typed nil still has a type.'],
          ],
          prereqs: ['Methods and receivers'],
        },
        {
          title: 'Type assertions and type switches',
          description: 'x.(T) recovers the concrete type with a comma-ok form to avoid panics, switch v := x.(type) branches on several types, and any (interface{}) is the empty interface every value satisfies.',
          concepts: ['x.(T) and the comma-ok form', 'Type switches', 'any and the empty interface', 'Assertion to another interface'],
          quiz: [
            ['What happens if x.(T) fails without ok?', 'It panics.'],
            ['What is any?', 'An alias for interface{}.'],
          ],
          prereqs: ['Interfaces and implicit satisfaction'],
        },
        {
          title: 'Composition and embedding',
          description: 'Go has no inheritance: embedding a struct or interface promotes its fields and methods, outer methods shadow inner ones, and embedding is how you extend types such as sync.Mutex or an http.Handler.',
          concepts: ['Struct embedding and promotion', 'Interface embedding', 'Shadowing promoted methods', 'Composition over inheritance in Go'],
          quiz: [
            ['Does embedding create an is-a relationship?', 'No, the outer type is not assignable to the inner type.'],
            ['What does embedding sync.Mutex in a struct allow?', 'Calling s.Lock() and s.Unlock() directly.'],
          ],
          prereqs: ['Methods and receivers'],
        },
        {
          title: 'Generics with type parameters',
          description: 'Type parameters on functions and types, constraints built from interfaces with type sets, comparable and cmp.Ordered, type inference at call sites, and choosing generics over interfaces only when it removes real duplication.',
          concepts: ['Type parameters on functions and types', 'Constraints and type sets', 'comparable and cmp.Ordered', 'Type inference at call sites', 'When generics beat interfaces'],
          quiz: [
            ['Write a generic Map signature.', 'func Map[T, U any](s []T, f func(T) U) []U'],
            ['What does the comparable constraint allow?', 'Using == and != on values of the type parameter.'],
          ],
          prereqs: ['Interfaces and implicit satisfaction'],
        },
      ],
    },
    {
      title: 'Memory, Performance and Security',
      topics: [
        {
          title: 'Stack, heap and escape analysis',
          description: 'The compiler decides per variable whether it lives on the goroutine stack or escapes to the heap; go build -gcflags=-m shows why, and returning pointers, storing in interfaces or capturing in closures are common causes.',
          concepts: ['Goroutine stacks grow dynamically', 'Escape analysis rules', 'Reading -gcflags=-m output', 'Common causes of escapes'],
          quiz: [
            ['Does returning a pointer to a local variable work in Go?', 'Yes, escape analysis moves it to the heap.'],
            ['How do you see what escapes?', 'go build -gcflags=-m'],
          ],
          prereqs: ['Structs, pointers and copies'],
        },
        {
          title: 'The garbage collector and GOGC',
          description: 'Go uses a concurrent tri-colour mark-and-sweep collector with tiny pauses; GOGC tunes how much the heap grows before a cycle, GOMEMLIMIT caps total memory, and allocation rate rather than heap size usually drives cost.',
          concepts: ['Concurrent mark and sweep', 'GOGC and heap growth', 'GOMEMLIMIT', 'Allocation rate as the real cost', 'runtime.MemStats and debug.SetGCPercent'],
          quiz: [
            ['What does GOGC=200 mean?', 'Let the heap grow to 200% of live data before collecting.'],
            ['What does GOMEMLIMIT do?', 'Sets a soft memory ceiling the GC works to respect.'],
          ],
        },
        {
          title: 'Reducing allocations and PGO',
          description: 'Preallocating slices with capacity, reusing buffers with sync.Pool, avoiding boxing into interfaces in hot loops, string and byte conversions, and profile-guided optimisation with a default.pgo file.',
          concepts: ['Preallocating with make', 'sync.Pool for reusable buffers', 'Interface boxing in hot paths', 'Avoiding string and []byte copies', 'Profile-guided optimisation'],
          quiz: [
            ['How do you enable PGO?', 'Place a CPU profile at default.pgo in the main package directory and build normally.'],
            ['What does sync.Pool guarantee about stored objects?', 'Nothing; they may be dropped at any GC.'],
          ],
          prereqs: ['Stack, heap and escape analysis'],
        },
        {
          title: 'Secure coding in Go',
          description: 'Parameterised queries against SQL injection, html/template contextual escaping against XSS, limiting request bodies, validating paths against traversal, crypto/rand and bcrypt for tokens and passwords, and govulncheck for vulnerable dependencies.',
          concepts: ['Parameterised queries', 'html/template contextual escaping', 'http.MaxBytesReader and input limits', 'Path traversal and filepath.Clean', 'crypto/rand, bcrypt and constant-time compare', 'govulncheck'],
          quiz: [
            ['Why use html/template instead of text/template for web pages?', 'It escapes output according to HTML, JS and URL context.'],
            ['Which package should generate session tokens?', 'crypto/rand, never math/rand.'],
            ['What does govulncheck report?', 'Known vulnerabilities in dependencies that your code actually calls.'],
          ],
        },
      ],
    },
    {
      title: 'Concurrency',
      description: 'Goroutines, channels, synchronisation and cancellation, the reasons most people pick Go.',
      topics: [
        {
          title: 'Goroutines and the scheduler',
          description: 'go f() starts a lightweight goroutine multiplexed onto OS threads by the M:N scheduler; GOMAXPROCS bounds parallelism, main returning kills everything, and sync.WaitGroup waits for a batch to finish.',
          concepts: ['Starting goroutines', 'The M:N scheduler and GOMAXPROCS', 'main exit terminates goroutines', 'sync.WaitGroup for fan-out'],
          quiz: [
            ['How much stack does a new goroutine start with?', 'A few kilobytes that grow as needed.'],
            ['What happens to running goroutines when main returns?', 'The program exits and they are killed.'],
          ],
        },
        {
          title: 'Channels',
          description: 'Unbuffered channels synchronise sender and receiver, buffered channels decouple them, close signals no more values, range drains until closed, nil channels block forever, and direction types document ownership.',
          concepts: ['Unbuffered versus buffered channels', 'close and the comma-ok receive', 'range over a channel', 'nil channels block forever', 'Send-only and receive-only types'],
          quiz: [
            ['What happens when you send on a closed channel?', 'A panic.'],
            ['Who should close a channel?', 'The sender, never the receiver.'],
            ['What does receiving from a closed channel return?', 'The zero value with ok == false.'],
          ],
          prereqs: ['Goroutines and the scheduler'],
        },
        {
          title: 'select, timers and tickers',
          description: 'select waits on several channel operations choosing randomly among ready ones, default makes it non-blocking, time.After and time.NewTimer add timeouts, and time.Ticker drives periodic work that must be stopped.',
          concepts: ['select semantics', 'Non-blocking select with default', 'Timeouts with time.After', 'Tickers and Stop', 'Done channels for shutdown'],
          quiz: [
            ['If two cases are ready, which does select pick?', 'One at random.'],
            ['Why stop a Ticker?', 'Otherwise it keeps firing and is never garbage collected.'],
          ],
          prereqs: ['Channels'],
        },
        {
          title: 'sync: Mutex, RWMutex, Once and WaitGroup',
          description: 'Protecting shared state with Mutex and RWMutex, the rule that locks must not be copied, sync.Once for one-time initialisation, sync.Map for specific read-heavy cases, and choosing channels versus mutexes.',
          concepts: ['Mutex and RWMutex', 'Never copy a lock', 'sync.Once and OnceValue', 'sync.Map use cases', 'Channels versus mutexes'],
          quiz: [
            ['When is RWMutex better than Mutex?', 'Many readers and few writers.'],
            ['What does go vet copylocks warn about?', 'Passing or assigning a struct containing a Mutex by value.'],
          ],
          prereqs: ['Goroutines and the scheduler'],
        },
        {
          title: 'The atomic package and the memory model',
          description: 'Lock-free counters and flags with atomic.Int64 and atomic.Bool, compare-and-swap, atomic.Pointer, and the happens-before rules of the Go memory model that define what a data race is.',
          concepts: ['atomic.Int64 and atomic.Bool', 'Compare-and-swap loops', 'atomic.Pointer and Value', 'Happens-before and data races'],
          quiz: [
            ['Is i++ safe from two goroutines?', 'No, it is a read-modify-write race; use atomic.Int64.Add or a mutex.'],
            ['What guarantees a channel receive sees a send?', 'The memory model: a send happens before the corresponding receive completes.'],
          ],
          prereqs: ['sync: Mutex, RWMutex, Once and WaitGroup'],
        },
        {
          title: 'Context for cancellation and deadlines',
          description: 'context.Context travels as the first parameter to carry cancellation, deadlines and request-scoped values; WithCancel, WithTimeout and WithDeadline derive children, and every long operation must watch ctx.Done().',
          concepts: ['ctx as the first parameter', 'WithCancel, WithTimeout and WithDeadline', 'ctx.Done and ctx.Err', 'WithValue and its limits', 'Always call the cancel func'],
          quiz: [
            ['What does ctx.Err() return after a timeout?', 'context.DeadlineExceeded.'],
            ['Why defer cancel() after WithTimeout?', 'To release the timer and resources even on early return.'],
          ],
          prereqs: ['select, timers and tickers'],
        },
        {
          title: 'Concurrency patterns',
          description: 'Worker pools bounded by a channel, pipelines of stages connected by channels, fan-out and fan-in, semaphores from buffered channels, and errgroup for running goroutines that share cancellation and the first error.',
          concepts: ['Worker pools', 'Pipelines and stages', 'Fan-out and fan-in', 'Semaphores with buffered channels', 'errgroup.WithContext'],
          quiz: [
            ['How do you limit concurrency to N with channels?', 'A buffered channel of capacity N acquired before work and released after.'],
            ['What does errgroup.Wait return?', 'The first non-nil error from any goroutine.'],
          ],
          prereqs: ['Context for cancellation and deadlines'],
        },
        {
          title: 'Race detector, deadlocks and goroutine leaks',
          description: 'go test -race instruments memory accesses to catch data races at runtime, the runtime reports all goroutines asleep as a deadlock, and leaked goroutines blocked on channels nobody reads are found with pprof or goleak.',
          concepts: ['go test -race', 'Reading a race report', 'All goroutines are asleep', 'Detecting goroutine leaks'],
          quiz: [
            ['Does the race detector find every race?', 'No, only races exercised at runtime.'],
            ['What causes "fatal error: all goroutines are asleep - deadlock!"?', 'Every goroutine is blocked, typically on channel operations.'],
          ],
          prereqs: ['Concurrency patterns'],
        },
      ],
    },
    {
      title: 'Testing, Debugging and Profiling',
      topics: [
        {
          title: 'Tests with the testing package',
          description: 'Tests live in _test.go files beside the code, functions named TestXxx take *testing.T, t.Errorf continues while t.Fatalf stops, t.Helper improves failure locations, and go test ./... runs everything with caching.',
          concepts: ['_test.go and TestXxx', 't.Errorf versus t.Fatalf', 't.Helper and t.Cleanup', 'go test flags and caching', 'External test packages'],
          quiz: [
            ['How do you run a single test?', 'go test -run TestName ./pkg'],
            ['What does -count=1 do?', 'Disables the test cache so the tests really run.'],
          ],
        },
        {
          title: 'Table-driven tests and subtests',
          description: 'A slice of cases with names and expected values, t.Run for each so failures are named and filterable, t.Parallel for independent cases, and golden files for large expected outputs.',
          concepts: ['Case tables', 't.Run subtests', 't.Parallel', 'Golden files and -update flags'],
          quiz: [
            ['How do you run one subtest?', 'go test -run "TestX/case_name"'],
            ['Why name each table case?', 'Failures point at the exact case.'],
          ],
          prereqs: ['Tests with the testing package'],
        },
        {
          title: 'Fakes, interfaces and httptest',
          description: 'Because interfaces are implicit, hand-written fakes are usually simpler than mocking frameworks; httptest.NewServer and NewRecorder test HTTP code without sockets, and testify or go-cmp help with assertions and diffs.',
          concepts: ['Hand-written fakes', 'httptest.NewRecorder', 'httptest.NewServer', 'go-cmp diffs and testify'],
          quiz: [
            ['What does httptest.NewRecorder capture?', 'The status, headers and body a handler writes.'],
            ['Why do interfaces make fakes easy?', 'Any struct with the right methods can replace the real dependency.'],
          ],
          prereqs: ['Interfaces and implicit satisfaction'],
        },
        {
          title: 'Benchmarks, examples and fuzzing',
          description: 'BenchmarkXxx with b.Loop or b.N and -benchmem to measure allocations, Example functions whose Output comment is verified by go test, and FuzzXxx with a seed corpus for randomised input testing.',
          concepts: ['BenchmarkXxx and b.Loop', '-benchmem and allocation counts', 'Example functions with Output comments', 'Fuzz tests and the corpus'],
          quiz: [
            ['How do you run benchmarks only?', 'go test -bench . -run ^$'],
            ['What makes an Example function a test?', 'A trailing // Output: comment compared against stdout.'],
          ],
          prereqs: ['Tests with the testing package'],
        },
        {
          title: 'Profiling and debugging with pprof, trace and Delve',
          description: 'CPU, heap, block and mutex profiles from go test -cpuprofile or net/http/pprof in a live service, reading them with go tool pprof and flame graphs, the execution tracer for scheduler and GC behaviour, and Delve for breakpoints and goroutine inspection.',
          concepts: ['CPU and heap profiles', 'net/http/pprof in services', 'go tool pprof and flame graphs', 'Block and mutex profiles', 'go tool trace', 'Delve breakpoints and goroutine inspection'],
          quiz: [
            ['How do you expose profiles from a server?', 'import _ "net/http/pprof" and serve the default mux.'],
            ['What does the heap profile show by default?', 'In-use allocations at the last GC (inuse_space).'],
            ['Which Delve command lists goroutines?', 'goroutines'],
          ],
        },
      ],
    },
    {
      title: 'HTTP Services and Cloud-Native Applications',
      description: 'Building the backend and cloud services Go is best known for; HTTP and REST fundamentals live in track-rest-api.',
      style: 'practice',
      topics: [
        {
          title: 'net/http servers and routing',
          description: 'The Handler interface and HandlerFunc, ServeMux with method and wildcard patterns since Go 1.22, path values, http.Server with read and write timeouts, and why the defaults without timeouts are unsafe in production.',
          concepts: ['Handler and HandlerFunc', 'ServeMux patterns with methods and wildcards', 'r.PathValue', 'http.Server timeouts', 'Serving static files'],
          quiz: [
            ['How do you register a route for GET only?', 'mux.HandleFunc("GET /items/{id}", handler)'],
            ['Why set ReadHeaderTimeout?', 'To stop slow clients holding connections open indefinitely.'],
          ],
        },
        {
          title: 'Middleware and handler composition',
          description: 'Wrapping handlers in functions that return handlers for logging, recovery, auth and request IDs, ordering the chain, passing data through context, and where chi or gorilla add value over the standard mux.',
          concepts: ['Handler-wrapping middleware', 'Ordering a middleware chain', 'Recover middleware', 'Request-scoped values via context', 'When to adopt chi'],
          quiz: [
            ['What is the signature of a typical middleware?', 'func(http.Handler) http.Handler'],
            ['Why should recovery middleware be outermost?', 'So it catches panics from every inner handler.'],
          ],
          prereqs: ['net/http servers and routing'],
        },
        {
          title: 'JSON APIs and request validation',
          description: 'Decoding bodies with size limits and unknown-field checks, validating fields explicitly, consistent error response shapes and status codes, content negotiation basics and setting Content-Type correctly.',
          concepts: ['Decoding with limits', 'Explicit field validation', 'Error response shapes', 'Status codes and Content-Type'],
          quiz: [
            ['Which status code fits a validation failure?', '400 Bad Request or 422 Unprocessable Content.'],
            ['Why limit request bodies?', 'To prevent memory exhaustion from oversized payloads.'],
          ],
          prereqs: ['JSON with encoding/json', 'net/http servers and routing'],
        },
        {
          title: 'HTTP clients with net/http',
          description: 'A shared http.Client with a Timeout, always closing response bodies, connection pooling in Transport, requests with context, checking status codes, and retries with exponential backoff and jitter.',
          concepts: ['http.Client with Timeout', 'Closing response bodies', 'Transport and connection pooling', 'Requests with context', 'Retries with backoff and jitter'],
          quiz: [
            ['Why must you close resp.Body?', 'To release the connection back to the pool.'],
            ['What is wrong with http.Get in production code?', 'It uses the default client with no timeout.'],
          ],
          prereqs: ['Context for cancellation and deadlines'],
        },
        {
          title: 'Databases with database/sql and pgx',
          description: 'sql.DB as a connection pool, QueryRow, Scan and Exec with placeholders, transactions with rollback on error, pool sizing, pgx for PostgreSQL features, sqlc for generated code and golang-migrate for schema changes.',
          concepts: ['sql.DB is a pool', 'Query, QueryRow, Exec and Scan', 'Transactions and rollback', 'Pool sizing settings', 'pgx, sqlc and migrations'],
          quiz: [
            ['Should you open sql.DB per request?', 'No, open once and share the pool.'],
            ['What does rows.Close prevent?', 'Leaking a pooled connection.'],
          ],
          prereqs: ['Secure coding in Go'],
        },
        {
          title: 'gRPC and Protocol Buffers',
          description: 'Defining services in .proto files, generating Go code with protoc and protoc-gen-go-grpc, unary and streaming RPCs, interceptors for logging and auth, deadlines through context, and when gRPC beats REST.',
          concepts: ['Proto definitions and code generation', 'Unary and streaming RPCs', 'Interceptors', 'Deadlines and status codes', 'gRPC versus REST'],
          quiz: [
            ['What does protoc-gen-go-grpc generate?', 'Client and server interfaces for the service.'],
            ['How does a client set a deadline?', 'Through a context with a timeout passed to the call.'],
          ],
          prereqs: ['Context for cancellation and deadlines'],
        },
        {
          title: 'Structured logging and observability',
          description: 'log/slog with JSON handlers, levels and attributes, logging with context, Prometheus metrics via promhttp, OpenTelemetry traces across services, and health and readiness endpoints.',
          concepts: ['slog handlers and levels', 'Attributes and groups', 'Prometheus metrics with promhttp', 'OpenTelemetry tracing', 'Health and readiness endpoints'],
          quiz: [
            ['Why prefer slog over log?', 'Structured key-value output that tools can index.'],
            ['Difference between liveness and readiness?', 'Liveness restarts a stuck process; readiness stops traffic until it can serve.'],
          ],
        },
        {
          title: 'Configuration, graceful shutdown and deployment',
          description: 'Twelve-factor configuration from environment variables, server.Shutdown with a context on SIGTERM so in-flight requests finish, static binaries with CGO_ENABLED=0 and cross-compilation, ldflags for versions, and distroless containers with Kubernetes probes.',
          concepts: ['Environment-based configuration', 'server.Shutdown on SIGTERM', 'Static binaries and CGO_ENABLED=0', 'GOOS, GOARCH and -ldflags -X', 'Distroless images and probes'],
          quiz: [
            ['How do you build for Linux on macOS?', 'GOOS=linux GOARCH=amd64 go build'],
            ['What does server.Shutdown do?', 'Stops accepting connections and waits for active requests up to the context deadline.'],
          ],
          prereqs: ['Command-line tools with flag, os/exec and signals', 'net/http servers and routing'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: CLI todo tool with JSON storage',
          description: 'Build a todo CLI with flag subcommands (add, list, done, rm), atomic JSON persistence in the user config directory, table-driven tests using t.TempDir, and a cross-compiled release with a version injected by ldflags.',
          concepts: ['Design subcommands and the data model', 'Implement atomic JSON storage', 'Test with t.TempDir', 'Cross-compile and inject a version'],
          quiz: [
            ['Where should the data file live?', 'Under os.UserConfigDir(), not the working directory.'],
            ['How do you make a file write atomic?', 'Write to a temp file then os.Rename over the target.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent web crawler',
          description: 'Crawl a site with a bounded worker pool, a visited set behind a mutex, per-request context timeouts, cancellation on Ctrl-C, and export a link graph; verify it with the race detector and httptest servers.',
          concepts: ['Frontier and visited set design', 'Bounded workers and rate limits', 'Cancellation and timeouts', 'Test with httptest and -race'],
          quiz: [
            ['How do you stop the crawler cleanly on Ctrl-C?', 'signal.NotifyContext cancels a context every worker watches.'],
            ['Why bound the number of workers?', 'To avoid exhausting sockets and hammering the server.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: REST API with PostgreSQL and Docker',
          description: 'A net/http service with a ServeMux, middleware for logging and recovery, database/sql or pgx with migrations, integration tests against a test database, graceful shutdown, and a multi-stage distroless Dockerfile.',
          concepts: ['Model resources and routes', 'Migrations and repository layer', 'Integration tests with a real database', 'Graceful shutdown and containerise'],
          quiz: [
            ['Why a multi-stage Dockerfile?', 'A tiny runtime image containing only the static binary.'],
            ['How do integration tests get a clean database?', 'Run migrations per test session and truncate or roll back per test.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: gRPC microservice with observability',
          description: 'Define a proto service, implement server and client with interceptors for logging and auth, add Prometheus metrics and OpenTelemetry traces, health checks, and deploy two instances behind a load balancer locally.',
          concepts: ['Define the proto contract', 'Implement server, client and interceptors', 'Add metrics, traces and health checks', 'Run multiple instances'],
          quiz: [
            ['How does gRPC propagate deadlines between services?', 'Through the context passed to outgoing calls.'],
            ['What does an interceptor let you do?', 'Run cross-cutting logic around every RPC.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: log processing pipeline',
          description: 'Stream a large log file with bufio.Scanner through a pipeline of goroutine stages (parse, filter, aggregate), fan out CPU-bound parsing, emit JSON summaries, and profile with pprof to remove allocations.',
          concepts: ['Design the stage pipeline', 'Fan out parsing with a worker pool', 'Aggregate and emit results', 'Profile and cut allocations'],
          quiz: [
            ['Why stream instead of os.ReadFile?', 'Memory stays constant regardless of file size.'],
            ['How do you know the pipeline is done?', 'Each stage closes its output channel when its input is drained.'],
          ],
          style: 'project',
        },
        {
          title: 'Go interview questions',
          description: 'The questions that come up in Go interviews: slices versus arrays, nil interfaces, value versus pointer receivers, goroutine leaks, channel semantics, select, context, GC behaviour and how Go compares to Java or Rust.',
          concepts: ['Slice and map internals questions', 'Interface and receiver questions', 'Goroutine and channel questions', 'Runtime and GC questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Explain why append may not modify the caller\'s slice.', 'The header is passed by value; a reallocation changes the callee\'s copy only.'],
            ['When does a goroutine leak?', 'When it blocks forever on a channel or lock nobody will release.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Go',
          description: 'Solving problems quickly in Go: bufio for fast input, slices and maps as the workhorses, container/heap, sort with custom comparators, strings.Builder for output, and avoiding common allocation and off-by-one traps.',
          concepts: ['Fast input with bufio', 'container/heap and priority queues', 'Custom comparators in interviews', 'Builder-based output', 'Common Go traps under time pressure'],
          quiz: [
            ['Which type is used for a heap in Go?', 'Any type implementing heap.Interface (Len, Less, Swap, Push, Pop).'],
            ['How do you read a million integers quickly?', 'bufio.Scanner with ScanWords or a bufio.Reader with fmt.Fscan.'],
          ],
        },
      ],
    },
  ],
})
