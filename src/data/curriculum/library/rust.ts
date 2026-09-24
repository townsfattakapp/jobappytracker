import { defineTrack } from '../define'

export const rust = defineTrack({
  id: 'track-rust',
  title: 'Rust',
  description: 'Rust from rustup to production systems code: ownership, borrowing and lifetimes, enums and pattern matching, traits and generics, Result and Option, Cargo and crates, smart pointers, fearless concurrency, async with Tokio, unsafe boundaries and FFI, and projects such as a CLI search tool, a chat server, a key-value store and an allocator.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🦀',
  tags: ['rust', 'systems programming', 'ownership', 'borrow checker', 'cargo', 'async', 'tokio', 'memory safety'],
  languages: ['Rust'],
  explainMode: 'concept',
  code: { label: 'Rust', id: 'rust', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'The toolchain, Cargo and the helpers that make the compiler your pair programmer.',
      topics: [
        {
          title: 'Installing Rust with rustup',
          description: 'rustup installs and manages toolchains: stable versus nightly, updating, per-project overrides with rust-toolchain.toml, and editions (2015, 2018, 2021, 2024) that let the language evolve without breaking old crates.',
          concepts: ['rustup and toolchains', 'Stable versus nightly', 'rust-toolchain.toml overrides', 'Editions and edition migration'],
          quiz: [
            ['What does rustup update do?', 'Updates every installed toolchain to its latest release.'],
            ['Can a 2021-edition crate depend on a 2018-edition crate?', 'Yes, editions interoperate; they only change syntax rules per crate.'],
          ],
        },
        {
          title: 'Cargo: new, build, run and test',
          description: 'Cargo is the build tool, package manager and test runner in one: creating a project, the src/main.rs and src/lib.rs conventions, debug versus release builds, cargo run and cargo test, and the target directory.',
          concepts: ['cargo new and project layout', 'Debug versus release builds', 'cargo run and cargo check', 'cargo test basics', 'The target directory and Cargo.lock'],
          quiz: [
            ['Why run cargo check during development?', 'It type-checks without generating code, so it is much faster than build.'],
            ['Which flag produces an optimised binary?', 'cargo build --release'],
          ],
          prereqs: ['Installing Rust with rustup'],
        },
        {
          title: 'rustfmt, clippy and rust-analyzer',
          description: 'Letting tools enforce style and catch mistakes: cargo fmt for one canonical layout, cargo clippy for hundreds of lints with explanations, rust-analyzer for inline errors and refactoring, and cargo doc for local docs.',
          concepts: ['cargo fmt', 'clippy lints and levels', 'rust-analyzer in the editor', 'cargo doc --open'],
          quiz: [
            ['How do you make clippy warnings fail CI?', 'cargo clippy -- -D warnings'],
            ['What does rust-analyzer provide beyond errors?', 'Completion, go-to-definition, inline type hints and refactorings.'],
          ],
          prereqs: ['Cargo: new, build, run and test'],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'Anatomy of a Rust program',
          description: 'fn main, println! as a macro rather than a function, semicolons turning expressions into statements, blocks that return their last expression, and the compiler messages that explain what went wrong.',
          concepts: ['fn main and the entry point', 'Macros with the ! suffix', 'Blocks as expressions', 'Reading rustc error messages'],
          quiz: [
            ['Why does println! end with an exclamation mark?', 'It is a macro that expands at compile time to check the format string.'],
            ['What does the last expression in a block without a semicolon do?', 'It becomes the value of the block.'],
          ],
        },
        {
          title: 'Variables, mutability and shadowing',
          description: 'Bindings are immutable unless marked mut, shadowing with a second let can change the type, const and static for compile-time and global values, and why immutability by default makes reasoning easier.',
          concepts: ['let and immutability by default', 'mut bindings', 'Shadowing versus mutation', 'const and static'],
          quiz: [
            ['What does let x = x.trim(); rely on?', 'Shadowing: a new binding named x replaces the old one, possibly with a different type.'],
            ['Difference between const and static?', 'const is inlined at each use; static has one fixed memory address.'],
          ],
          prereqs: ['Anatomy of a Rust program'],
        },
        {
          title: 'Scalar types, operators and overflow',
          description: 'Integers of fixed width (i32, u8, usize), floats, bool and char as a Unicode scalar, arithmetic that panics on overflow in debug and wraps in release, explicit as casts, and the wrapping and checked method families.',
          concepts: ['Integer widths and usize', 'char as a Unicode scalar', 'Overflow behaviour in debug and release', 'as casts and their truncation', 'checked, wrapping and saturating methods'],
          quiz: [
            ['What happens when u8 255 + 1 runs in a debug build?', 'The program panics with an overflow error.'],
            ['What does 300i32 as u8 give?', '44, because the value is truncated modulo 256.'],
          ],
          prereqs: ['Variables, mutability and shadowing'],
        },
        {
          title: 'Tuples, arrays and compound types',
          description: 'Tuples for fixed heterogeneous groups with destructuring, arrays with a compile-time length and bounds checks, the unit type (), and how these differ from Vec and slices that come later.',
          concepts: ['Tuples and destructuring', 'Arrays with fixed length', 'Bounds checking on indexing', 'The unit type'],
          quiz: [
            ['What is the type of [0u8; 4]?', '[u8; 4], an array of four u8 initialised to zero.'],
            ['What happens on arr[10] when arr has 4 elements?', 'A panic at runtime, or a compile error if the index is a constant.'],
          ],
          prereqs: ['Scalar types, operators and overflow'],
        },
        {
          title: 'Conditions and loops as expressions',
          description: 'if without parentheses that must be a bool, if as an expression, loop with break carrying a value, while, for over ranges and iterators, and labelled breaks for nested loops.',
          concepts: ['if as an expression', 'loop with break value', 'for over ranges', 'Labelled breaks', 'while let preview'],
          quiz: [
            ['Why does if x { ... } fail when x is an integer?', 'Rust never coerces to bool; the condition must be a bool.'],
            ['What does let n = loop { break 5; }; assign?', '5.'],
          ],
          prereqs: ['Variables, mutability and shadowing'],
        },
        {
          title: 'Functions and return values',
          description: 'Typed parameters and return types, returning the final expression or with return, the unit return, functions as values, and why parameter types are never inferred.',
          concepts: ['Parameter and return type annotations', 'Implicit return of the last expression', 'Early return', 'Functions as values'],
          quiz: [
            ['Why does fn add(a: i32, b: i32) -> i32 { a + b; } fail?', 'The semicolon makes the body a statement returning (), not i32.'],
            ['Can Rust infer a function parameter type from its callers?', 'No, signatures are always explicit.'],
          ],
          prereqs: ['Conditions and loops as expressions'],
        },
      ],
    },
    {
      title: 'Ownership and Borrowing',
      topics: [
        {
          title: 'Ownership and moves',
          description: 'Every value has exactly one owner; assigning or passing a non-Copy value moves it and the old binding is unusable. Copy types, clone as an explicit deep copy, and drop at scope end.',
          concepts: ['One owner per value', 'Move semantics on assignment', 'Copy versus Clone', 'Drop at end of scope'],
          quiz: [
            ['What happens after let b = a; when a is a String?', 'a is moved and can no longer be used.'],
            ['Why is i32 Copy but String is not?', 'i32 lives entirely on the stack; String owns heap memory that would be double-freed.'],
          ],
          prereqs: ['Functions and return values'],
        },
        {
          title: 'References and borrowing',
          description: 'Borrowing with & and &mut instead of moving: any number of shared references or exactly one mutable reference at a time, no references to dropped data, and how this rules out data races and iterator invalidation.',
          concepts: ['Shared references', 'Mutable references', 'Aliasing XOR mutation rule', 'Borrows in function parameters'],
          quiz: [
            ['Can you hold a &mut and a & to the same value at once?', 'No, a mutable borrow must be exclusive.'],
            ['Why does pushing to a Vec while iterating it fail to compile?', 'The iterator holds a shared borrow and push needs a mutable one.'],
          ],
          prereqs: ['Ownership and moves'],
        },
        {
          title: 'Slices',
          description: 'Views into contiguous data: &[T] and &str carry a pointer and length, range syntax to slice, why functions should take slices rather than Vec or String, and the difference between a slice and an array reference.',
          concepts: ['&[T] and &str as views', 'Range slicing syntax', 'Slices as function parameters', 'Fat pointers'],
          quiz: [
            ['Why take &[i32] instead of &Vec<i32>?', 'It accepts arrays, vectors and sub-slices alike.'],
            ['What does &s[0..3] produce for a String?', 'A &str of the first three bytes, panicking if not on a char boundary.'],
          ],
          prereqs: ['References and borrowing'],
        },
        {
          title: 'Lifetimes and annotations',
          description: 'Every reference has a lifetime the compiler checks; annotations like <\'a> relate input and output references in signatures, elision rules cover most cases, and \'static marks data that lives for the whole program.',
          concepts: ['Lifetimes as scopes of validity', 'Lifetime annotations in signatures', 'Elision rules', 'The static lifetime', 'Lifetimes in structs'],
          quiz: [
            ['What does fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str promise?', 'The result lives no longer than the shorter of x and y.'],
            ['When do you not need to write lifetimes?', 'When elision applies, such as one input reference or a &self method.'],
          ],
          prereqs: ['Slices'],
        },
        {
          title: 'Borrow checker errors and fixes',
          description: 'Reading E0382, E0499, E0502 and E0597, the usual fixes (clone, restructure, shorten borrows, return owned data, use indices), non-lexical lifetimes, and knowing when the compiler is right about a real bug.',
          concepts: ['Use after move errors', 'Overlapping borrow errors', 'Does not live long enough errors', 'Non-lexical lifetimes', 'Restructuring instead of cloning'],
          quiz: [
            ['What does E0502 mean?', 'A value was borrowed mutably while also borrowed immutably.'],
            ['Is clone() always the wrong fix?', 'No; it is fine for small data, but often restructuring removes the need.'],
          ],
          prereqs: ['Lifetimes and annotations'],
        },
      ],
    },
    {
      title: 'Structs, Enums and Pattern Matching',
      topics: [
        {
          title: 'Structs and impl blocks',
          description: 'Named-field, tuple and unit structs, impl blocks with methods taking self, &self or &mut self, associated functions like new, update syntax, and deriving Debug to print them.',
          concepts: ['Named, tuple and unit structs', 'Methods and self receivers', 'Associated functions and constructors', 'Struct update syntax', 'Deriving Debug'],
          quiz: [
            ['Difference between &self and self in a method?', '&self borrows; self takes ownership and consumes the value.'],
            ['What does Point { x: 1, ..other } do?', 'Copies or moves the remaining fields from other.'],
          ],
          prereqs: ['Ownership and moves'],
        },
        {
          title: 'Enums and Option',
          description: 'Enums whose variants carry data are Rust\'s sum types; Option<T> replaces null with Some and None, forcing every absence to be handled, and enums with impl blocks model state machines cleanly.',
          concepts: ['Variants with data', 'Option instead of null', 'Methods on enums', 'Enums as state machines'],
          quiz: [
            ['Why is there no null in Rust?', 'Option<T> makes absence explicit in the type so it must be handled.'],
            ['What is the size of Option<Box<T>>?', 'Same as a pointer, thanks to niche optimisation.'],
          ],
          prereqs: ['Structs and impl blocks'],
        },
        {
          title: 'match and exhaustiveness',
          description: 'match compares a value against patterns in order and the compiler rejects missing cases; binding parts of variants, the wildcard _, match as an expression, and why exhaustiveness catches bugs when an enum grows.',
          concepts: ['Matching enum variants', 'Exhaustiveness checking', 'Wildcard and catch-all arms', 'match as an expression'],
          quiz: [
            ['What happens when you add a variant and forget a match arm?', 'A compile error listing the missing pattern.'],
            ['Are match arms tested in order?', 'Yes, the first matching arm wins.'],
          ],
          prereqs: ['Enums and Option'],
        },
        {
          title: 'if let, let else and while let',
          description: 'Concise handling of one pattern: if let for a single case, let else to diverge when a pattern fails, while let for draining iterators and stacks, and when a full match is clearer.',
          concepts: ['if let for one variant', 'let else with divergence', 'while let loops', 'Choosing between if let and match'],
          quiz: [
            ['What must the else block of let else do?', 'Diverge: return, break, continue or panic.'],
            ['Write a loop that pops until a stack is empty.', 'while let Some(x) = stack.pop() { ... }'],
          ],
          prereqs: ['match and exhaustiveness'],
        },
        {
          title: 'Pattern syntax in depth',
          description: 'Destructuring structs, tuples and nested enums, ranges and multiple patterns with |, match guards, @ bindings, ref and ref mut, and ignoring parts with .. and _.',
          concepts: ['Destructuring structs and tuples', 'Ranges and alternatives', 'Match guards', '@ bindings', 'Ignoring with .. and _'],
          quiz: [
            ['What does n @ 1..=9 bind?', 'The matched value into n when it is between 1 and 9.'],
            ['What is a match guard?', 'An extra if condition on an arm that must also hold.'],
          ],
          prereqs: ['match and exhaustiveness'],
        },
      ],
    },
    {
      title: 'Traits and Generics',
      topics: [
        {
          title: 'Defining and implementing traits',
          description: 'Traits declare shared behaviour; impl Trait for Type provides it, default methods reduce boilerplate, the orphan rule decides where impls may live, and traits replace inheritance as the way to share behaviour.',
          concepts: ['Trait declarations', 'impl Trait for Type', 'Default method implementations', 'The orphan rule', 'Traits instead of inheritance'],
          quiz: [
            ['Can you implement Display for Vec<T> in your crate?', 'No, both the trait and the type are foreign; wrap Vec in a newtype.'],
            ['What is a default method?', 'A trait method with a body that implementors may override.'],
          ],
          prereqs: ['Structs and impl blocks'],
        },
        {
          title: 'Generic functions and types',
          description: 'Type parameters on functions, structs and enums, monomorphisation that generates a specialised copy per type, turbofish syntax for explicit arguments, and const generics for array lengths.',
          concepts: ['Type parameters', 'Monomorphisation', 'Turbofish syntax', 'Const generics'],
          quiz: [
            ['What does monomorphisation cost?', 'Larger binaries and compile time, but zero runtime overhead.'],
            ['What does "1".parse::<i32>() use?', 'Turbofish to specify the target type.'],
          ],
          prereqs: ['Defining and implementing traits'],
        },
        {
          title: 'Trait bounds and where clauses',
          description: 'Constraining generics with T: Trait, combining bounds with +, where clauses for readability, impl Trait in argument and return position, and how bounds let generic code call methods.',
          concepts: ['T: Trait bounds', 'Multiple bounds with +', 'where clauses', 'impl Trait in arguments and returns', 'Blanket implementations'],
          quiz: [
            ['Why does fn print<T>(x: T) { println!("{x}") } fail?', 'T has no Display bound, so the compiler cannot format it.'],
            ['What does -> impl Iterator<Item = u32> hide?', 'The concrete iterator type while promising the trait.'],
          ],
          prereqs: ['Generic functions and types'],
        },
        {
          title: 'Trait objects and dynamic dispatch',
          description: 'dyn Trait behind a reference or Box for heterogeneous collections, vtables and the cost of dynamic dispatch, object safety rules, and choosing between generics and trait objects.',
          concepts: ['dyn Trait and Box<dyn Trait>', 'Vtables and dispatch cost', 'Object safety', 'Generics versus trait objects'],
          quiz: [
            ['Why is Vec<dyn Shape> invalid?', 'dyn Shape is unsized; use Vec<Box<dyn Shape>>.'],
            ['What makes a trait not object safe?', 'Methods returning Self or with generic parameters, among other rules.'],
          ],
          prereqs: ['Trait bounds and where clauses'],
        },
        {
          title: 'Derivable and conversion traits',
          description: 'The standard traits every type should consider: Debug, Clone, Copy, PartialEq, Eq, Hash, Ord and Default via derive, Display by hand, From and Into for conversions, and operator traits like Add.',
          concepts: ['derive for standard traits', 'Display versus Debug', 'From and Into', 'TryFrom for fallible conversion', 'Operator overloading via std::ops'],
          quiz: [
            ['If you implement From<A> for B, what do you get for free?', 'Into<B> for A.'],
            ['Which traits are needed to use a type as a HashMap key?', 'Eq and Hash.'],
          ],
          prereqs: ['Defining and implementing traits'],
        },
        {
          title: 'Closures and the Fn traits',
          description: 'Closures capture their environment by reference, mutable reference or move; the Fn, FnMut and FnOnce traits describe how they can be called, move closures for threads, and returning closures with impl Fn.',
          concepts: ['Capture modes', 'Fn, FnMut and FnOnce', 'move closures', 'Returning closures', 'Closures as function parameters'],
          quiz: [
            ['Which trait does a closure that consumes a captured String implement?', 'FnOnce only.'],
            ['Why do thread::spawn closures need move?', 'The thread may outlive the caller, so captures must be owned.'],
          ],
          prereqs: ['Trait bounds and where clauses'],
        },
      ],
    },
    {
      title: 'Collections, Iterators and Strings',
      topics: [
        {
          title: 'Vec and slices in practice',
          description: 'The growable array: push, pop, insert and remove costs, capacity and with_capacity, sorting and deduplication, slicing and windows, and the borrow rules that shape how you mutate while reading.',
          concepts: ['push, pop and capacity', 'Sorting and dedup', 'Slicing, windows and chunks', 'retain and drain', 'Mutating while iterating'],
          quiz: [
            ['What is the cost of Vec::remove(0)?', 'O(n), because remaining elements shift left.'],
            ['How do you sort floats?', 'sort_by(|a, b| a.partial_cmp(b).unwrap()) or total_cmp, since f64 is not Ord.'],
          ],
          prereqs: ['Slices'],
        },
        {
          title: 'HashMap, HashSet and BTreeMap',
          description: 'Hash-based maps and sets with the entry API for insert-or-update, ownership of keys, the default SipHash and faster alternatives, and BTreeMap when you need ordered keys or range queries.',
          concepts: ['HashMap and the entry API', 'Key ownership and borrowing lookups', 'HashSet operations', 'BTreeMap and ordered ranges', 'Choosing a hasher'],
          quiz: [
            ['What does *map.entry(k).or_insert(0) += 1 do?', 'Increments the count for k, inserting 0 first if absent.'],
            ['Why can you look up a HashMap<String, V> with a &str?', 'Lookup takes any Borrow<Q> where String: Borrow<str>.'],
          ],
          prereqs: ['Derivable and conversion traits'],
        },
        {
          title: 'String, &str and UTF-8',
          description: 'String owns UTF-8 bytes and &str borrows them; indexing by integer is forbidden, chars versus bytes versus grapheme clusters, push_str and format!, and converting between the two types.',
          concepts: ['String versus &str', 'UTF-8 and no integer indexing', 'chars, bytes and graphemes', 'Building strings', 'Converting with to_string and as_str'],
          quiz: [
            ['Why is s[0] not allowed on a String?', 'UTF-8 characters vary in byte length, so byte indexing could split a character.'],
            ['What does "héllo".len() return?', '6, the number of bytes, not characters.'],
          ],
          prereqs: ['Slices'],
        },
        {
          title: 'Formatting, Display and parsing',
          description: 'format! and the {} versus {:?} placeholders, width and precision, implementing Display for your types, parse::<T>() through FromStr, and splitting and trimming text.',
          concepts: ['Format placeholders and specs', 'Implementing Display', 'parse and FromStr', 'split, trim and lines', 'write! to strings and streams'],
          quiz: [
            ['What does {:>8.2} do?', 'Right-aligns in 8 characters with two decimal places.'],
            ['What type does "42".parse() return?', 'Result<T, T::Err>, so the target type must be known.'],
          ],
          prereqs: ['String, &str and UTF-8'],
        },
        {
          title: 'Iterators and adapters',
          description: 'iter, iter_mut and into_iter, lazy adapters such as map, filter, enumerate, zip and take, consumers like collect, sum and fold, and why iterator chains compile to the same code as hand-written loops.',
          concepts: ['iter, iter_mut and into_iter', 'Lazy adapters', 'collect and type inference', 'fold, sum and count', 'Zero-cost iteration'],
          quiz: [
            ['Does v.iter().map(f) do any work by itself?', 'No, adapters are lazy until a consumer runs them.'],
            ['How do you collect into a HashMap?', 'Iterate over (key, value) pairs and call collect::<HashMap<_, _>>().'],
          ],
          prereqs: ['Closures and the Fn traits'],
        },
        {
          title: 'Implementing Iterator',
          description: 'Writing your own iterator by implementing next, getting every adapter for free, IntoIterator so for loops work on your types, DoubleEndedIterator and ExactSizeIterator, and peekable iterators for parsers.',
          concepts: ['Implementing next', 'IntoIterator for custom types', 'DoubleEndedIterator and ExactSizeIterator', 'Peekable iterators', 'Iterator struct with lifetimes'],
          quiz: [
            ['What single method must Iterator implement?', 'next, returning Option<Self::Item>.'],
            ['Why implement IntoIterator for &MyType?', 'So for x in &my_value works without consuming it.'],
          ],
          prereqs: ['Iterators and adapters'],
        },
      ],
    },
    {
      title: 'Error Handling',
      topics: [
        {
          title: 'Result and the ? operator',
          description: 'Recoverable errors are values: Result<T, E>, matching or unwrapping, the ? operator that returns early and converts errors with From, and main returning Result.',
          concepts: ['Result<T, E> as a value', 'The ? operator', 'Error conversion via From', 'main returning Result'],
          quiz: [
            ['What does ? do on an Err?', 'Returns the error from the function after converting it with From.'],
            ['Can you use ? in a function returning ()?', 'No, the return type must be Result or Option.'],
          ],
          prereqs: ['Enums and Option'],
        },
        {
          title: 'Option combinators',
          description: 'Working with maybe-values without match: map, and_then, unwrap_or and unwrap_or_else, ok_or to convert into Result, filter, take and as_ref, and when combinator chains stop being readable.',
          concepts: ['map and and_then', 'unwrap_or family', 'ok_or and ok', 'as_ref and take', 'Readability limits of chains'],
          quiz: [
            ['What does opt.ok_or(err) produce?', 'Result: Ok(value) if Some, Err(err) if None.'],
            ['Difference between unwrap_or and unwrap_or_else?', 'unwrap_or_else takes a closure evaluated only on None.'],
          ],
          prereqs: ['Result and the ? operator'],
        },
        {
          title: 'Custom error types and the Error trait',
          description: 'An enum of failure cases per module, implementing Display and std::error::Error, wrapping sources for chains, From impls so ? converts automatically, and Box<dyn Error> for quick programs.',
          concepts: ['Error enums per module', 'Implementing std::error::Error', 'Error sources and chains', 'From impls for ?', 'Box<dyn Error>'],
          quiz: [
            ['Why implement From<io::Error> for MyError?', 'So ? converts io errors into MyError automatically.'],
            ['When is Box<dyn Error> acceptable?', 'In binaries and prototypes where callers do not need to match on the error.'],
          ],
          prereqs: ['Result and the ? operator'],
        },
        {
          title: 'thiserror, anyhow and panic policy',
          description: 'thiserror derives Error boilerplate for libraries, anyhow adds context and ergonomic errors for applications, unwrap and expect as deliberate choices, and when a panic is the correct response.',
          concepts: ['thiserror derive', 'anyhow and context', 'expect with a reason', 'When to panic', 'Unwinding versus abort'],
          quiz: [
            ['Which crate suits a library\'s public error type?', 'thiserror, so callers get a concrete enum.'],
            ['When is panic appropriate?', 'For programmer bugs and broken invariants, not for expected failures like missing files.'],
          ],
          prereqs: ['Custom error types and the Error trait'],
        },
      ],
    },
    {
      title: 'Modules, Crates and Application I/O',
      topics: [
        {
          title: 'Modules, visibility and use paths',
          description: 'mod declares modules in files or directories, pub controls visibility, use brings paths into scope, crate:: and super:: paths, pub(crate) for internal APIs, and re-exports that shape a public surface.',
          concepts: ['mod and file layout', 'pub and pub(crate)', 'use and paths', 'Re-exports with pub use', 'Prelude patterns'],
          quiz: [
            ['Are struct fields public when the struct is pub?', 'No, each field needs its own pub.'],
            ['What does pub use inner::Thing; achieve?', 'Exposes Thing at the current path, hiding the internal module structure.'],
          ],
          prereqs: ['Structs and impl blocks'],
        },
        {
          title: 'Crates, workspaces and Cargo.toml',
          description: 'Library and binary crates, the package manifest, multiple binaries, workspaces that share one Cargo.lock and target directory across related crates, and profiles for debug and release settings.',
          concepts: ['Library versus binary crates', 'Cargo.toml sections', 'Workspaces', 'Multiple binaries', 'Profiles'],
          quiz: [
            ['Why split an application into a lib and a bin crate?', 'Logic in the library is testable and reusable; main stays thin.'],
            ['What do workspace members share?', 'One Cargo.lock and one target directory.'],
          ],
          prereqs: ['Modules, visibility and use paths'],
        },
        {
          title: 'Dependencies, features and semver',
          description: 'Adding crates with cargo add, version requirements and how Cargo.lock pins them, optional dependencies and feature flags, semver compatibility rules, and cargo tree to inspect the graph.',
          concepts: ['cargo add and version requirements', 'Cargo.lock and reproducibility', 'Feature flags', 'Semver compatibility', 'cargo tree and duplicates'],
          quiz: [
            ['What does the version requirement "1.2" allow?', 'Any 1.x version at or above 1.2.0 (caret semantics).'],
            ['Should a library commit Cargo.lock?', 'It is optional for libraries; binaries should commit it.'],
          ],
          prereqs: ['Crates, workspaces and Cargo.toml'],
        },
        {
          title: 'Publishing, docs and build scripts',
          description: 'Doc comments with /// and //! that cargo doc renders, publishing to crates.io with metadata and a license, build.rs for code generation and native libraries, and cfg attributes for platform-specific code.',
          concepts: ['Doc comments and cargo doc', 'Publishing to crates.io', 'build.rs scripts', 'cfg and conditional compilation'],
          quiz: [
            ['What does //! document?', 'The enclosing item, typically the crate or module.'],
            ['What does #[cfg(target_os = "linux")] do?', 'Compiles the item only on Linux.'],
          ],
          prereqs: ['Dependencies, features and semver'],
        },
        {
          title: 'Reading and writing files',
          description: 'std::fs for whole-file reads and writes, BufReader and BufWriter for line-by-line and buffered I/O, the Read and Write traits, paths with PathBuf, and propagating io::Error with ?.',
          concepts: ['fs::read_to_string and fs::write', 'BufReader and lines', 'Read and Write traits', 'Path and PathBuf', 'Handling io::Error'],
          quiz: [
            ['Why wrap a File in BufReader?', 'Unbuffered reads issue a system call per small read; buffering batches them.'],
            ['What does BufReader::lines() yield?', 'An iterator of io::Result<String>.'],
          ],
          prereqs: ['Result and the ? operator'],
        },
        {
          title: 'Command-line apps with clap',
          description: 'Parsing arguments with clap derive, subcommands and flags with help generated automatically, reading stdin and environment variables, exit codes, and writing errors to stderr.',
          concepts: ['clap derive structs', 'Subcommands and flags', 'stdin and environment variables', 'Exit codes and stderr'],
          quiz: [
            ['What does #[derive(Parser)] generate?', 'An argument parser and help text from the struct fields.'],
            ['How do you exit with a non-zero status?', 'std::process::exit(1) or return an Err from main.'],
          ],
          prereqs: ['Reading and writing files'],
        },
        {
          title: 'Serialisation with serde',
          description: 'Deriving Serialize and Deserialize, JSON with serde_json, TOML and YAML through the same traits, field attributes for renaming and defaults, and validating on deserialisation.',
          concepts: ['Serialize and Deserialize derives', 'serde_json to and from strings', 'Field attributes', 'Untagged and tagged enums', 'Other formats via serde'],
          quiz: [
            ['What does #[serde(rename_all = "camelCase")] do?', 'Maps snake_case fields to camelCase keys.'],
            ['How is a Rust enum represented in JSON by default?', 'Externally tagged: {"Variant": data}.'],
          ],
          prereqs: ['Derivable and conversion traits'],
        },
      ],
    },
    {
      title: 'Memory and Resource Management',
      topics: [
        {
          title: 'Stack, heap and Box',
          description: 'Values live on the stack unless boxed; Box<T> owns a heap allocation, enables recursive types and trait objects, and moving a Box moves only the pointer. Sized types and why references to unsized data are fat.',
          concepts: ['Stack versus heap in Rust', 'Box<T> ownership', 'Recursive types with Box', 'Sized and unsized types'],
          quiz: [
            ['Why does enum List { Cons(i32, List), Nil } fail?', 'It has infinite size; box the recursive field.'],
            ['What does moving a Box copy?', 'Just the pointer; the heap data stays in place.'],
          ],
          prereqs: ['Ownership and moves'],
        },
        {
          title: 'Rc, Arc and reference counting',
          description: 'Shared ownership when one owner is impossible: Rc for single-threaded graphs, Arc for cross-thread sharing with atomic counts, Weak to break cycles, and the cost compared with borrowing.',
          concepts: ['Rc clone and strong counts', 'Arc and atomic counting', 'Weak references', 'Reference cycles and leaks'],
          quiz: [
            ['Why cannot Rc be sent to another thread?', 'Its reference count is not atomic, so it is not Send.'],
            ['What does Rc::clone do?', 'Increments the count and returns another handle to the same allocation.'],
          ],
          prereqs: ['Stack, heap and Box'],
        },
        {
          title: 'Drop, RAII and resource cleanup',
          description: 'The Drop trait runs when a value goes out of scope, in reverse declaration order; files, locks and sockets clean up without finally blocks, and std::mem::drop releases early.',
          concepts: ['The Drop trait', 'Drop order', 'Early release with mem::drop', 'Guards and scoped cleanup', 'Drop and moved values'],
          quiz: [
            ['Can you call .drop() directly?', 'No, use std::mem::drop(value).'],
            ['In what order do locals drop?', 'Reverse order of declaration.'],
          ],
          prereqs: ['Ownership and moves'],
        },
        {
          title: 'Interior mutability',
          description: 'Mutating through a shared reference under controlled rules: Cell for Copy values, RefCell with runtime borrow checking and panics on violation, the Rc<RefCell<T>> pattern, and OnceCell for lazy initialisation.',
          concepts: ['Cell for Copy values', 'RefCell and runtime borrow checks', 'Rc<RefCell<T>> pattern', 'OnceCell and lazy initialisation'],
          quiz: [
            ['What happens on a second borrow_mut() while one is live?', 'A panic at runtime.'],
            ['When is Cell preferable to RefCell?', 'For Copy values, since it never panics and has no borrow flag.'],
          ],
          prereqs: ['Rc, Arc and reference counting'],
        },
        {
          title: 'Deref and smart pointer ergonomics',
          description: 'The Deref trait lets Box, Rc and custom wrappers behave like references, deref coercion turns &String into &str at call sites, and Cow avoids allocation when data may or may not need owning.',
          concepts: ['Deref and DerefMut', 'Deref coercion', 'Newtype wrappers with Deref', 'Cow for borrowed-or-owned data'],
          quiz: [
            ['Why can you pass &String where &str is expected?', 'Deref coercion applies String: Deref<Target = str>.'],
            ['What does Cow<str> hold?', 'Either a borrowed &str or an owned String.'],
          ],
          prereqs: ['Stack, heap and Box'],
        },
      ],
    },
    {
      title: 'Concurrency and Async',
      topics: [
        {
          title: 'Threads and scoped threads',
          description: 'thread::spawn with move closures, joining handles to collect results, scoped threads that may borrow local data because they are joined before the scope ends, and panics inside threads.',
          concepts: ['thread::spawn and JoinHandle', 'Joining and collecting results', 'thread::scope for borrowed data', 'Panics in threads'],
          quiz: [
            ['Why can thread::scope closures borrow locals?', 'All scoped threads are joined before the scope returns.'],
            ['What does JoinHandle::join return?', 'A Result holding the thread\'s return value or its panic payload.'],
          ],
          prereqs: ['Closures and the Fn traits'],
        },
        {
          title: 'Send, Sync and thread safety',
          description: 'Two marker traits the compiler infers: Send for values that can move to another thread, Sync for references that can be shared, why Rc is neither and Arc<Mutex<T>> is both, and how this makes data races a compile error.',
          concepts: ['Send marker trait', 'Sync marker trait', 'Auto traits and inference', 'Why Rc and RefCell are not thread safe', 'Data races as compile errors'],
          quiz: [
            ['Is Arc<RefCell<T>> Send?', 'No, RefCell is not Sync, so Arc of it cannot be shared across threads.'],
            ['What does Sync mean formally?', 'T is Sync if &T is Send.'],
          ],
          prereqs: ['Threads and scoped threads'],
        },
        {
          title: 'Channels',
          description: 'Message passing with std::sync::mpsc: multiple producers cloning the sender, a single consumer, blocking and non-blocking receives, closing when senders drop, and crossbeam channels for multi-consumer patterns.',
          concepts: ['mpsc sender and receiver', 'Cloning senders', 'Blocking versus try_recv', 'Channel closure semantics', 'crossbeam channels'],
          quiz: [
            ['When does the receiver\'s iterator end?', 'When every sender has been dropped.'],
            ['Can values sent through a channel be borrowed?', 'They must be Send and usually owned, since the receiver may outlive the sender\'s scope.'],
          ],
          prereqs: ['Send, Sync and thread safety'],
        },
        {
          title: 'Shared state with Arc, Mutex and RwLock',
          description: 'Arc<Mutex<T>> for shared mutable state, lock guards that unlock on drop, poisoning after a panic, RwLock for many readers, atomics for counters, and keeping critical sections short to avoid contention.',
          concepts: ['Arc<Mutex<T>> pattern', 'MutexGuard and unlock on drop', 'Lock poisoning', 'RwLock trade-offs', 'Atomic types'],
          quiz: [
            ['Why does Rust\'s Mutex own its data?', 'You can only reach the data through lock(), so unsynchronised access is impossible.'],
            ['What is a poisoned mutex?', 'One whose holder panicked; lock() returns Err so you can decide whether to trust the data.'],
          ],
          prereqs: ['Send, Sync and thread safety'],
        },
        {
          title: 'async/await and futures',
          description: 'async fn returns a Future that does nothing until polled; await yields to the executor, futures are state machines compiled from your code, and why an executor such as Tokio is needed to run them.',
          concepts: ['async fn and Future', 'await and yielding', 'Futures as state machines', 'Executors and runtimes', 'Lazy futures'],
          quiz: [
            ['What happens if you call an async fn and never await it?', 'Nothing runs; the future is lazy.'],
            ['Why is there no built-in async runtime in std?', 'The language provides the Future trait; runtimes are libraries so that embedded and server use cases can differ.'],
          ],
          prereqs: ['Closures and the Fn traits'],
        },
        {
          title: 'Tokio runtime and tasks',
          description: 'The #[tokio::main] runtime, spawning tasks, async I/O with TcpListener and files, join! and select! for combining futures, timeouts, and async channels and mutexes from tokio::sync.',
          concepts: ['tokio::main and runtime flavours', 'tokio::spawn and JoinHandle', 'Async networking and I/O', 'join! and select!', 'tokio::sync primitives'],
          quiz: [
            ['What must a future passed to tokio::spawn be?', 'Send and \'static, since it may run on any worker thread.'],
            ['What does select! do?', 'Waits on several futures and runs the branch of the first to complete.'],
          ],
          prereqs: ['async/await and futures'],
        },
        {
          title: 'Async pitfalls: blocking, cancellation and Pin',
          description: 'Blocking calls that starve the executor and spawn_blocking as the fix, futures dropped mid-await and cancellation safety, holding a std Mutex across an await, and what Pin guarantees for self-referential futures.',
          concepts: ['Blocking in async code', 'spawn_blocking', 'Cancellation safety', 'Locks across await points', 'Pin and self-referential futures'],
          quiz: [
            ['Why is std::thread::sleep wrong inside async code?', 'It blocks the worker thread and every task scheduled on it.'],
            ['What happens when a future is dropped before completion?', 'It is cancelled; code after the current await never runs.'],
          ],
          prereqs: ['Tokio runtime and tasks'],
        },
      ],
    },
    {
      title: 'Unsafe Rust and FFI',
      topics: [
        {
          title: 'What unsafe unlocks',
          description: 'The five superpowers of an unsafe block: dereferencing raw pointers, calling unsafe functions, accessing mutable statics, implementing unsafe traits and accessing union fields, and the invariants you take responsibility for.',
          concepts: ['The five unsafe superpowers', 'unsafe blocks versus unsafe fn', 'Invariants the compiler no longer checks', 'Documenting safety with SAFETY comments'],
          quiz: [
            ['Does unsafe turn off the borrow checker?', 'No, it only allows the five extra operations; borrow rules still apply.'],
            ['What should precede every unsafe block?', 'A comment explaining why the invariants hold.'],
          ],
          prereqs: ['References and borrowing'],
        },
        {
          title: 'Raw pointers and safe abstractions',
          description: 'Creating *const T and *mut T, aliasing and validity rules, wrapping unsafe internals in a safe API whose types make misuse impossible, and how Vec and Mutex are built exactly this way.',
          concepts: ['Raw pointer creation and deref', 'Validity and aliasing rules', 'Safe wrappers around unsafe code', 'How std builds on unsafe', 'Undefined behaviour in Rust'],
          quiz: [
            ['Can you create a raw pointer in safe code?', 'Yes; only dereferencing it requires unsafe.'],
            ['What makes an abstraction sound?', 'No safe caller can trigger undefined behaviour no matter how it uses the API.'],
          ],
          prereqs: ['What unsafe unlocks'],
        },
        {
          title: 'FFI with C',
          description: 'Calling C from Rust with extern "C" blocks and linking, exposing Rust to C with #[no_mangle], repr(C) layouts, CString and CStr for strings, bindgen for headers, and ownership across the boundary.',
          concepts: ['extern "C" declarations', 'repr(C) and layout', 'CString and CStr', 'bindgen', 'Ownership across FFI'],
          quiz: [
            ['Why is repr(C) needed on structs passed to C?', 'Rust may reorder fields; repr(C) fixes the C layout.'],
            ['Who frees a CString passed to C?', 'Rust must, after C is done; never let C free Rust memory.'],
          ],
          prereqs: ['Raw pointers and safe abstractions'],
        },
        {
          title: 'Miri and auditing unsafe code',
          description: 'Running tests under Miri to detect undefined behaviour in unsafe code, cargo-geiger to count unsafe usage, reviewing dependencies for unsafe, and keeping the unsafe surface small and well-tested.',
          concepts: ['Running tests under Miri', 'What Miri detects', 'cargo-geiger and dependency review', 'Minimising the unsafe surface'],
          quiz: [
            ['What does Miri catch that tests alone do not?', 'Undefined behaviour such as invalid pointer use and data races, even when the test passes.'],
            ['Where should unsafe code live in a crate?', 'In small, isolated modules behind safe APIs.'],
          ],
          prereqs: ['Raw pointers and safe abstractions'],
        },
      ],
    },
    {
      title: 'Testing, Performance and Security',
      topics: [
        {
          title: 'Unit, integration and doc tests',
          description: '#[test] functions in a tests module, assert macros and should_panic, integration tests in the tests directory, doc tests that keep examples compiling, and running subsets with cargo test.',
          concepts: ['#[test] and the tests module', 'assert_eq and should_panic', 'Integration tests directory', 'Doc tests', 'Filtering and parallel test runs'],
          quiz: [
            ['Where do integration tests live?', 'In the tests/ directory next to src/, using the crate as an external dependency.'],
            ['What runs the code examples in doc comments?', 'cargo test compiles and runs them as doc tests.'],
          ],
          prereqs: ['Cargo: new, build, run and test'],
        },
        {
          title: 'Debugging Rust programs',
          description: 'dbg! for quick inspection, RUST_BACKTRACE for panics, logging with the log and tracing crates, stepping through with gdb, lldb or CodeLLDB, and reading compiler suggestions as the first debugger.',
          concepts: ['dbg! macro', 'RUST_BACKTRACE and panic messages', 'log and tracing crates', 'gdb and lldb with Rust', 'Compiler suggestions'],
          quiz: [
            ['What does dbg!(x) print?', 'The expression text, its value with Debug formatting, and the file and line.'],
            ['How do you see where a panic came from?', 'Run with RUST_BACKTRACE=1.'],
          ],
          prereqs: ['Unit, integration and doc tests'],
        },
        {
          title: 'Benchmarking and profiling',
          description: 'criterion for statistically sound benchmarks, black_box to stop the optimiser cheating, release profile settings like lto and codegen-units, cargo flamegraph and perf, and finding allocation hot spots.',
          concepts: ['criterion benchmarks', 'black_box', 'Release profile tuning', 'Flame graphs', 'Reducing allocations'],
          quiz: [
            ['Why benchmark only in release mode?', 'Debug builds skip optimisations and add overflow checks, so timings are meaningless.'],
            ['What does lto = "fat" trade?', 'Longer compile times for cross-crate inlining and smaller, faster binaries.'],
          ],
          prereqs: ['Unit, integration and doc tests'],
        },
        {
          title: 'Security in Rust',
          description: 'What memory safety does and does not cover: integer overflow, logic bugs, unsafe misuse and supply-chain risks; cargo audit and cargo deny, input validation, constant-time comparisons, and avoiding panics in servers.',
          concepts: ['What memory safety covers', 'cargo audit and cargo deny', 'Integer overflow as a security bug', 'Panics as denial of service', 'Constant-time comparisons'],
          quiz: [
            ['Does Rust prevent SQL injection?', 'No, memory safety says nothing about logic; use parameterised queries.'],
            ['What does cargo audit check?', 'Dependencies against the RustSec advisory database.'],
          ],
          prereqs: ['Dependencies, features and semver'],
        },
        {
          title: 'Idiomatic Rust and API design',
          description: 'Newtypes for meaning, builders for many options, typestate to make invalid states unrepresentable, accepting borrowed types and returning owned ones, the Rust API guidelines, and letting clippy shape style.',
          concepts: ['Newtype pattern', 'Builder pattern', 'Typestate pattern', 'Borrow in, own out', 'Rust API guidelines'],
          quiz: [
            ['Why wrap a u64 in struct UserId(u64)?', 'The type system stops mixing it up with other ids.'],
            ['What does the typestate pattern encode?', 'Valid state transitions as distinct types, so misuse fails to compile.'],
          ],
          prereqs: ['Derivable and conversion traits'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: CLI search tool',
          description: 'Build a ripgrep-style tool with clap that walks directories, searches files with regex or literal matching, colours matches, respects .gitignore, streams results line by line, and runs searches in parallel with rayon.',
          concepts: ['Argument parsing and configuration', 'Directory walking and ignore rules', 'Line-by-line matching with regex', 'Parallel search with rayon', 'Integration tests with fixtures'],
          quiz: [
            ['Why stream output instead of collecting all matches?', 'Results appear immediately and memory stays flat on huge trees.'],
            ['What does rayon\'s par_iter give you?', 'Data-parallel iteration over files with a work-stealing pool.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: async chat server',
          description: 'Write a TCP chat server on Tokio where clients join rooms, messages broadcast through tokio::sync::broadcast, disconnects clean up gracefully, and a load test with hundreds of clients proves it holds up.',
          concepts: ['Accept loop and per-client tasks', 'Framing lines over TCP', 'Broadcast channels', 'Graceful disconnect handling', 'Load testing with many clients'],
          quiz: [
            ['Why one task per client?', 'Tasks are cheap and each client\'s await points let others run.'],
            ['What happens when a broadcast receiver lags?', 'It gets a Lagged error with the number of missed messages.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: persistent key-value store',
          description: 'Build a store with an append-only log, an in-memory index rebuilt on start, compaction, a binary record format with checksums via serde or by hand, and property tests that check crash recovery.',
          concepts: ['Log record format with checksums', 'Index rebuild on startup', 'Compaction', 'Crash recovery tests', 'A small client CLI'],
          quiz: [
            ['Why checksum each record?', 'A crash mid-write leaves a torn record that must be detected and discarded.'],
            ['What does compaction remove?', 'Overwritten and deleted entries so the log stops growing forever.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: bytecode interpreter',
          description: 'Implement a small language: tokeniser, recursive-descent parser into an enum AST, a compiler to bytecode, a stack VM with a match-driven dispatch loop, and error messages with line numbers.',
          concepts: ['Tokeniser with peekable iterators', 'Recursive descent into an enum AST', 'Bytecode compiler', 'Stack VM dispatch loop', 'Error reporting with positions'],
          quiz: [
            ['Why compile to bytecode instead of walking the AST?', 'A flat instruction stream is faster to dispatch and easier to optimise.'],
            ['How does the VM represent its stack?', 'A Vec of values with push and pop.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: memory allocator',
          description: 'Implement a bump allocator and then a free-list allocator behind the GlobalAlloc trait using unsafe, respect alignment, test under Miri, benchmark against the system allocator, and document every safety invariant.',
          concepts: ['GlobalAlloc trait', 'Bump allocation', 'Free list with coalescing', 'Alignment handling', 'Miri and benchmarks'],
          quiz: [
            ['What does #[global_allocator] do?', 'Selects the allocator every Box, Vec and String uses.'],
            ['Why test the allocator under Miri?', 'It catches misaligned or out-of-bounds pointer use that would otherwise be silent UB.'],
          ],
          style: 'project',
        },
        {
          title: 'Rust interview questions',
          description: 'The questions that keep coming up: ownership versus borrowing, when to use lifetimes, Box versus Rc versus Arc, traits versus generics versus dyn, Send and Sync, how Rust prevents data races, and what unsafe really allows.',
          concepts: ['Ownership and lifetime questions', 'Smart pointer questions', 'Trait and generics questions', 'Concurrency safety questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['How does Rust prevent data races at compile time?', 'Aliasing XOR mutation plus Send and Sync bounds on thread APIs.'],
            ['When would you pick dyn Trait over generics?', 'For heterogeneous collections or to reduce code size and compile time.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Rust',
          description: 'Solving problems fast: reading stdin quickly, Vec and HashMap idioms, iterators instead of index loops, sorting with sort_unstable_by_key, BinaryHeap and Reverse, avoiding borrow fights with indices, and handling overflow.',
          concepts: ['Fast stdin parsing', 'Iterator-based solutions', 'BinaryHeap and Reverse', 'Working around borrow conflicts', 'Overflow-safe arithmetic'],
          quiz: [
            ['How do you make a min-heap?', 'BinaryHeap<Reverse<T>>.'],
            ['Why use i64 for sums in interview problems?', 'i32 overflows silently in release and panics in debug.'],
          ],
        },
      ],
    },
  ],
})
