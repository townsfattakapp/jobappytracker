import { defineTrack } from '../define'

export const cpp = defineTrack({
  id: 'track-cpp',
  title: 'C++',
  description: 'Modern C++ from the compiler flags up: value semantics, RAII and smart pointers, classes and templates, the STL and ranges, move semantics, C++11 to C++23 features, multithreading, performance engineering, competitive programming, and projects such as a vector clone, a thread pool and an HTTP server.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '⚙️',
  tags: ['c++', 'cpp', 'systems programming', 'stl', 'templates', 'raii', 'multithreading', 'performance', 'competitive programming'],
  languages: ['C++'],
  explainMode: 'concept',
  code: { label: 'C++', id: 'cpp', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A modern compiler, a build system and the tools that catch mistakes before you run.',
      topics: [
        {
          title: 'Installing a compiler and CMake',
          description: 'Getting gcc, clang or MSVC with C++20 support, installing CMake and Ninja, checking versions, and choosing the standard with -std=c++20 so the features you learn actually compile.',
          concepts: ['gcc, clang and MSVC support levels', 'CMake and Ninja installation', 'Selecting the language standard', 'Verifying the setup with a test build'],
          quiz: [
            ['Which flag enables C++20 in gcc and clang?', '-std=c++20'],
            ['Why use CMake instead of calling the compiler directly?', 'It generates portable builds for any compiler and IDE from one description.'],
          ],
        },
        {
          title: 'Compilation model and compiler flags',
          description: 'Translation units, headers pasted by the preprocessor, object files and linking, plus the flags that matter: -Wall -Wextra -Wpedantic, -O2 versus -O0 -g, and why a warning-free build is the baseline.',
          concepts: ['Translation units and headers', 'Object files and the linker', 'Warning flags to always enable', 'Debug and release builds', 'Reading compiler error messages'],
          quiz: [
            ['What does the preprocessor do with #include?', 'Pastes the header text into the translation unit.'],
            ['Why do template errors produce huge messages?', 'The compiler reports every instantiation layer; read the first line and the "required from" chain.'],
          ],
          prereqs: ['Installing a compiler and CMake'],
        },
        {
          title: 'Editors, formatters and static tools',
          description: 'clang-format for one canonical style, clang-tidy for modernisation and bug checks, compile_commands.json so editors understand the build, and language servers like clangd for navigation and diagnostics.',
          concepts: ['clang-format configuration', 'clang-tidy checks', 'compile_commands.json', 'clangd and editor integration'],
          quiz: [
            ['What does clang-tidy modernize-use-auto suggest?', 'Replacing verbose repeated types with auto where the type is obvious.'],
            ['How does CMake export compile_commands.json?', 'Set CMAKE_EXPORT_COMPILE_COMMANDS=ON.'],
          ],
          prereqs: ['Compilation model and compiler flags'],
        },
      ],
    },
    {
      title: 'Syntax, Types and Program Structure',
      topics: [
        {
          title: 'Anatomy of a C++ program',
          description: 'main, #include <iostream>, namespaces and using declarations, std::cout versus printf, and the split between declarations in headers and definitions in source files that shapes every project.',
          concepts: ['main and program exit', 'Namespaces and using declarations', 'iostream basics', 'Declarations versus definitions'],
          quiz: [
            ['Why avoid using namespace std; in headers?', 'It pollutes every file that includes the header and can cause name clashes.'],
            ['What does std::endl do beyond a newline?', 'It flushes the stream, which is slow in loops.'],
          ],
        },
        {
          title: 'Fundamental types, auto and initialisation',
          description: 'Integer and floating types, bool and char, brace initialisation that rejects narrowing, the difference between int x; int x{}; and int x = 0;, and auto for deduced types without losing readability.',
          concepts: ['Fundamental types and sizes', 'Brace initialisation and narrowing', 'Default versus value initialisation', 'auto type deduction', 'Fixed-width integers from cstdint'],
          quiz: [
            ['What does int x{3.5}; do?', 'Fails to compile: brace initialisation rejects narrowing conversions.'],
            ['What is the value of int x; inside a function?', 'Indeterminate; int x{}; gives 0.'],
          ],
          prereqs: ['Anatomy of a C++ program'],
        },
        {
          title: 'const, constexpr and references',
          description: 'const for values that must not change, constexpr for values computed at compile time, lvalue references as aliases, const references for cheap read-only parameters, and why references cannot be reseated.',
          concepts: ['const variables and const correctness', 'constexpr constants', 'Lvalue references as aliases', 'const references for parameters', 'References versus pointers'],
          quiz: [
            ['Can a reference be rebound to another object?', 'No, it aliases one object for its whole lifetime.'],
            ['When should a function take const T&?', 'For read-only parameters that are expensive to copy.'],
          ],
          prereqs: ['Fundamental types, auto and initialisation'],
        },
        {
          title: 'Operators and expressions',
          description: 'Arithmetic and integer division, bitwise operators, precedence, integer promotion and mixed signed-unsigned comparisons, the three-way comparison operator <=>, and the sequencing rules that make some expressions undefined.',
          concepts: ['Arithmetic and integer division', 'Bitwise operators and masks', 'Signed and unsigned mixing', 'Three-way comparison', 'Evaluation order rules'],
          quiz: [
            ['What does -1 < 1u evaluate to?', 'false, because -1 is converted to a large unsigned value.'],
            ['What does a <=> b return for integers?', 'A std::strong_ordering value: less, equal or greater.'],
          ],
          prereqs: ['Fundamental types, auto and initialisation'],
        },
      ],
    },
    {
      title: 'Control Flow and Functions',
      topics: [
        {
          title: 'Conditions, switch and init-statements',
          description: 'if/else and switch, C++17 if-with-initialiser to scope a variable to the condition, if constexpr for compile-time branches, enum class in switch, and [[fallthrough]] to mark intentional fallthrough.',
          concepts: ['if with initialiser', 'switch on enum class', 'Intentional fallthrough attribute', 'if constexpr', 'Ternary and short-circuit evaluation'],
          quiz: [
            ['What does if (auto it = m.find(k); it != m.end()) achieve?', 'Scopes it to the if statement so it cannot leak or be misused after.'],
            ['When is if constexpr evaluated?', 'At compile time, discarding the untaken branch.'],
          ],
        },
        {
          title: 'Loops and range-for',
          description: 'for, while and do-while, range-based for over containers and arrays, choosing auto, auto& or const auto& in the loop head to avoid copies, and iterating with indices when you need the position.',
          concepts: ['Range-based for', 'auto& versus copies in loops', 'Index loops with size_t', 'break, continue and labels via flags', 'Iterating maps with structured bindings'],
          quiz: [
            ['Why write for (const auto& s : strings) instead of for (auto s : strings)?', 'auto s copies every string; const auto& iterates without copying.'],
            ['What does for (auto& [k, v] : map) do?', 'Destructures each pair into k and v by reference.'],
          ],
          prereqs: ['Conditions, switch and init-statements'],
        },
        {
          title: 'Functions, overloading and default arguments',
          description: 'Declaring and defining functions, overload resolution by parameter types, default arguments, inline and constexpr functions, trailing return types, and [[nodiscard]] to stop callers ignoring results.',
          concepts: ['Overload resolution', 'Default arguments', 'inline and constexpr functions', 'Trailing return types', 'nodiscard and other attributes'],
          quiz: [
            ['Can two functions differ only by return type?', 'No, overloads must differ in parameters.'],
            ['What does [[nodiscard]] do?', 'Makes the compiler warn when a call\'s result is ignored.'],
          ],
        },
        {
          title: 'Lambdas and captures',
          description: 'Anonymous function objects: capture by value or reference, mutable lambdas, generic lambdas with auto parameters, storing lambdas in std::function versus templates, and the dangling-reference capture trap.',
          concepts: ['Capture by value and by reference', 'mutable lambdas', 'Generic lambdas', 'std::function versus templates', 'Dangling captures'],
          quiz: [
            ['What does [=] capture?', 'All used outer variables by value.'],
            ['Why is returning a lambda that captures a local by reference dangerous?', 'The local dies with the function and the capture dangles.'],
          ],
          prereqs: ['Functions, overloading and default arguments'],
        },
      ],
    },
    {
      title: 'Pointers, Memory and RAII',
      topics: [
        {
          title: 'Raw pointers, arrays and the free store',
          description: 'Addresses, dereferencing and nullptr, C-style arrays and decay, new and delete with their array forms, and why every raw new is a leak waiting to happen when an exception or early return skips delete.',
          concepts: ['Pointers and nullptr', 'C arrays versus std::array', 'new, delete and delete[]', 'Leaks on early exit', 'Pointer arithmetic'],
          quiz: [
            ['What must pair with new T[n]?', 'delete[] p, not delete p.'],
            ['Why prefer nullptr to NULL?', 'nullptr has its own type and cannot be mistaken for an integer in overload resolution.'],
          ],
          prereqs: ['const, constexpr and references'],
        },
        {
          title: 'RAII and deterministic destruction',
          description: 'Resource Acquisition Is Initialisation: acquire in the constructor, release in the destructor, and let scope exit, including exceptions, clean up. The idiom behind smart pointers, lock guards and file streams.',
          concepts: ['Constructor acquires, destructor releases', 'Scope exit and exceptions', 'RAII wrappers for C handles', 'Destruction order', 'Why RAII beats finally'],
          quiz: [
            ['When does a local object\'s destructor run?', 'When control leaves its scope, including by exception.'],
            ['How do you wrap a FILE* safely?', 'A class that fopens in the constructor and fcloses in the destructor, or unique_ptr with a custom deleter.'],
          ],
          prereqs: ['Raw pointers, arrays and the free store'],
        },
        {
          title: 'unique_ptr',
          description: 'Sole ownership with zero overhead: make_unique, move-only semantics, transferring ownership through returns and parameters, custom deleters, and how it replaces almost every new/delete pair.',
          concepts: ['make_unique', 'Move-only ownership transfer', 'Custom deleters', 'unique_ptr in containers', 'get, release and reset'],
          quiz: [
            ['Can you copy a unique_ptr?', 'No, only move it.'],
            ['What does release() do?', 'Gives up ownership and returns the raw pointer without deleting.'],
          ],
          prereqs: ['RAII and deterministic destruction'],
        },
        {
          title: 'shared_ptr and weak_ptr',
          description: 'Reference-counted shared ownership with make_shared, the control block and its atomic cost, weak_ptr to break cycles and observe without owning, and why shared_ptr is not the default choice.',
          concepts: ['make_shared and the control block', 'Reference count cost', 'weak_ptr and lock()', 'Breaking ownership cycles', 'enable_shared_from_this'],
          quiz: [
            ['Why can two shared_ptrs pointing at each other leak?', 'Each keeps the other\'s count above zero, so neither is destroyed.'],
            ['What does weak_ptr::lock() return?', 'A shared_ptr, empty if the object is gone.'],
          ],
          prereqs: ['unique_ptr'],
        },
        {
          title: 'Rule of zero, three and five',
          description: 'If a class manages a resource it needs a destructor, copy and move operations; if it uses RAII members it needs none. The rule of zero as the goal, =default and =delete, and what the compiler generates.',
          concepts: ['Rule of zero', 'Rule of three and five', '=default and =delete', 'Implicitly generated special members', 'Copy-and-swap'],
          quiz: [
            ['If you declare a destructor, what happens to move operations?', 'They are not generated; copies are used instead.'],
            ['How do you make a class non-copyable?', 'Declare the copy constructor and copy assignment as = delete.'],
          ],
          prereqs: ['unique_ptr'],
        },
      ],
    },
    {
      title: 'Classes and Object-Oriented Design',
      topics: [
        {
          title: 'Classes, constructors and destructors',
          description: 'Members, access specifiers, member initialiser lists, delegating and explicit constructors, static members, and const member functions that document which operations observe versus mutate.',
          concepts: ['Access specifiers and struct versus class', 'Member initialiser lists', 'explicit constructors', 'const member functions', 'Static members'],
          quiz: [
            ['Why initialise members in the initialiser list?', 'Members are constructed once with the right value rather than default-constructed and assigned.'],
            ['What does explicit prevent?', 'Implicit conversions through a one-argument constructor.'],
          ],
          prereqs: ['RAII and deterministic destruction'],
        },
        {
          title: 'Copy and move semantics',
          description: 'Copy constructors and assignment that duplicate resources, move constructors that steal them, rvalue references, std::move as a cast, and the moved-from state a class must leave valid.',
          concepts: ['Copy constructor and assignment', 'Rvalue references', 'Move constructor and assignment', 'std::move as a cast', 'Valid moved-from state'],
          quiz: [
            ['Does std::move move anything?', 'No, it casts to an rvalue so a move constructor or assignment can be chosen.'],
            ['What state must a moved-from object be in?', 'Valid but unspecified: safe to destroy or assign.'],
          ],
          prereqs: ['Rule of zero, three and five'],
        },
        {
          title: 'Operator overloading',
          description: 'Making types feel built-in: arithmetic and comparison operators, member versus free functions, operator<< for streams, defaulted <=> and ==, subscript and call operators, and the operators you should not overload.',
          concepts: ['Member versus non-member operators', 'Stream insertion operator', 'Defaulted comparisons', 'Subscript and call operators', 'Overloading restraint'],
          quiz: [
            ['Why is operator<< a free function?', 'Its left operand is the stream, not your type.'],
            ['What does auto operator<=>(const T&) const = default; generate?', 'All six comparison operators via memberwise comparison.'],
          ],
          prereqs: ['Classes, constructors and destructors'],
        },
        {
          title: 'Inheritance and virtual functions',
          description: 'Public inheritance as is-a, virtual dispatch through vtables, override and final, virtual destructors for polymorphic deletion, and object slicing when a derived object is copied into a base.',
          concepts: ['Public inheritance', 'Virtual dispatch and vtables', 'override and final', 'Virtual destructors', 'Object slicing'],
          quiz: [
            ['Why must a polymorphic base have a virtual destructor?', 'Deleting through a base pointer otherwise runs only the base destructor.'],
            ['What does override protect against?', 'Silently creating a new function when the signature does not match the base.'],
          ],
          prereqs: ['Classes, constructors and destructors'],
        },
        {
          title: 'Abstract classes and interfaces',
          description: 'Pure virtual functions to define interfaces, factories returning unique_ptr<Base>, dependency injection through interfaces for testability, and dynamic_cast as a last resort.',
          concepts: ['Pure virtual functions', 'Factories returning base pointers', 'Interfaces for testability', 'dynamic_cast and RTTI', 'Non-virtual interface idiom'],
          quiz: [
            ['Can you instantiate a class with a pure virtual function?', 'No, it is abstract.'],
            ['What does dynamic_cast return on failure for pointers?', 'nullptr.'],
          ],
          prereqs: ['Inheritance and virtual functions'],
        },
        {
          title: 'Value semantics and composition',
          description: 'C++ prefers values to hierarchies: types that copy and compare like ints, composition over inheritance, std::variant as a closed alternative to virtual dispatch, and where polymorphism still earns its place.',
          concepts: ['Regular types', 'Composition over inheritance', 'variant instead of hierarchies', 'When to use runtime polymorphism', 'Type erasure preview'],
          quiz: [
            ['What makes a type regular?', 'It is default constructible, copyable, movable and equality comparable with value semantics.'],
            ['When is std::variant better than a class hierarchy?', 'When the set of alternatives is closed and known at compile time.'],
          ],
          prereqs: ['Abstract classes and interfaces'],
        },
      ],
    },
    {
      title: 'Templates and Generic Programming',
      topics: [
        {
          title: 'Function and class templates',
          description: 'Writing code once for many types: template parameters, instantiation on use, why definitions live in headers, non-type template parameters, and how the compiler type-checks at instantiation time.',
          concepts: ['Template parameters and instantiation', 'Why templates live in headers', 'Non-type template parameters', 'Two-phase lookup', 'Member templates'],
          quiz: [
            ['Why cannot a template be defined in a .cpp file used from another file?', 'The compiler needs the definition at each instantiation site.'],
            ['What does std::array<int, 5> use as its second parameter?', 'A non-type template parameter of type size_t.'],
          ],
          prereqs: ['Functions, overloading and default arguments'],
        },
        {
          title: 'Specialisation and argument deduction',
          description: 'Full and partial specialisation to customise templates for particular types, how arguments are deduced from calls, class template argument deduction in C++17, and when overloading beats specialisation.',
          concepts: ['Full specialisation', 'Partial specialisation', 'Template argument deduction', 'Class template argument deduction', 'Overloading versus specialising'],
          quiz: [
            ['Can function templates be partially specialised?', 'No, only class templates; use overloading.'],
            ['What does std::pair p{1, 2.0}; rely on?', 'Class template argument deduction (CTAD).'],
          ],
          prereqs: ['Function and class templates'],
        },
        {
          title: 'Variadic templates and fold expressions',
          description: 'Parameter packs that accept any number of arguments, expanding packs with ..., fold expressions for sums and prints, sizeof..., and perfect forwarding of packs into constructors and emplace.',
          concepts: ['Parameter packs', 'Pack expansion', 'Fold expressions', 'Perfect forwarding with std::forward', 'Recursive versus fold implementations'],
          quiz: [
            ['What does (args + ...) compute?', 'A right fold summing all arguments in the pack.'],
            ['Why use std::forward<Args>(args)... when forwarding?', 'To preserve whether each argument was an lvalue or rvalue.'],
          ],
          prereqs: ['Specialisation and argument deduction'],
        },
        {
          title: 'Concepts and constraints',
          description: 'C++20 concepts express what a template requires, turning pages of instantiation errors into one clear message: requires clauses, standard concepts, defining your own, and constrained auto.',
          concepts: ['requires clauses', 'Standard library concepts', 'Defining custom concepts', 'Constrained auto parameters', 'Subsumption and overload ranking'],
          quiz: [
            ['What does template<std::integral T> restrict?', 'T must be an integer type.'],
            ['Why prefer concepts to SFINAE?', 'Readable constraints and clear compiler errors.'],
          ],
          prereqs: ['Function and class templates'],
        },
        {
          title: 'Type traits and SFINAE',
          description: 'Inspecting and transforming types at compile time with <type_traits>, substitution failure as an overload filter, enable_if and void_t idioms in pre-C++20 code, and reading the older library code you will meet.',
          concepts: ['type_traits queries', 'Type transformations', 'SFINAE mechanics', 'enable_if idioms', 'decltype and declval'],
          quiz: [
            ['What does std::is_same_v<int, const int> give?', 'false; use remove_cv to compare underlying types.'],
            ['What does SFINAE stand for?', 'Substitution failure is not an error.'],
          ],
          prereqs: ['Concepts and constraints'],
        },
        {
          title: 'constexpr and compile-time programming',
          description: 'constexpr functions and variables that run at compile time, consteval for immediate functions, constexpr containers and algorithms in C++20, and using static_assert to check computed values.',
          concepts: ['constexpr functions', 'consteval and constinit', 'Compile-time containers', 'static_assert on computed values', 'Limits of constant evaluation'],
          quiz: [
            ['Can a constexpr function also run at runtime?', 'Yes, when its arguments are not constant expressions.'],
            ['What does consteval require?', 'Every call must be evaluated at compile time.'],
          ],
          prereqs: ['const, constexpr and references'],
        },
      ],
    },
    {
      title: 'The Standard Library',
      topics: [
        {
          title: 'Sequence containers',
          description: 'std::vector as the default container with its capacity and reallocation rules, std::array for fixed sizes, deque for both ends, list and forward_list for stable nodes, and iterator invalidation on each.',
          concepts: ['vector, capacity and reallocation', 'reserve and emplace_back', 'array and deque', 'list and forward_list', 'Iterator invalidation rules'],
          quiz: [
            ['What happens to iterators when a vector reallocates?', 'All of them are invalidated.'],
            ['Why is vector usually faster than list even for insertions?', 'Contiguous memory and cache locality outweigh the shifting cost for most sizes.'],
          ],
          prereqs: ['Loops and range-for'],
        },
        {
          title: 'Associative containers and hashing',
          description: 'map and set as balanced trees with ordered iteration, unordered_map and unordered_set with hashing, custom comparators and hash functions, heterogeneous lookup, and the try_emplace and insert_or_assign helpers.',
          concepts: ['map and set ordering', 'unordered_map and hashing', 'Custom comparators and hashers', 'Heterogeneous lookup', 'try_emplace and insert_or_assign'],
          quiz: [
            ['What does map::operator[] do for a missing key?', 'Inserts a default-constructed value.'],
            ['When choose map over unordered_map?', 'When you need ordered iteration or range queries.'],
          ],
          prereqs: ['Sequence containers'],
        },
        {
          title: 'Iterators and iterator categories',
          description: 'The glue between containers and algorithms: begin and end, input through random-access categories and what each allows, iterator adaptors like back_inserter and reverse_iterator, and writing an iterator for your type.',
          concepts: ['begin, end and half-open ranges', 'Iterator categories', 'Iterator adaptors', 'Writing a custom iterator', 'Const iterators'],
          quiz: [
            ['Why do algorithms take [first, last) ranges?', 'Half-open ranges make empty ranges and length arithmetic natural.'],
            ['What does std::back_inserter do?', 'Creates an output iterator that calls push_back on the container.'],
          ],
          prereqs: ['Sequence containers'],
        },
        {
          title: 'Algorithms',
          description: 'The <algorithm> and <numeric> toolkit: sort, stable_sort and partial_sort, find_if and count_if, transform and accumulate, the erase-remove idiom and its C++20 replacement, and binary search on sorted ranges.',
          concepts: ['Sorting algorithms', 'Searching and counting', 'transform and accumulate', 'erase-remove and std::erase_if', 'Binary search functions'],
          quiz: [
            ['Why does std::remove not shrink the container?', 'It only shifts kept elements forward; erase must follow.'],
            ['What does std::lower_bound require?', 'A sorted range.'],
          ],
          prereqs: ['Iterators and iterator categories'],
        },
        {
          title: 'Ranges and views',
          description: 'C++20 ranges: algorithms that take whole containers, lazy views such as filter, transform and take composed with |, projections, and how views avoid building intermediate containers.',
          concepts: ['Range algorithms', 'Lazy views and composition', 'Projections', 'Views versus owning containers', 'Converting views with ranges::to'],
          quiz: [
            ['What does v | std::views::filter(pred) | std::views::transform(f) create?', 'A lazy pipeline evaluated on iteration.'],
            ['What is a projection?', 'A function applied to each element before the algorithm compares or uses it.'],
          ],
          prereqs: ['Algorithms'],
        },
        {
          title: 'Utilities: pair, tuple, optional and variant',
          description: 'Vocabulary types for values without custom structs: pair and tuple with structured bindings, optional for maybe-a-value, variant with std::visit for type-safe unions, and any for the rare open case.',
          concepts: ['pair and tuple', 'Structured bindings', 'optional and value_or', 'variant and visit', 'any and its trade-offs'],
          quiz: [
            ['What does std::optional<T> replace?', 'Sentinel values or pointers used to mean "no value".'],
            ['How do you handle every alternative of a variant?', 'std::visit with an overloaded set of lambdas.'],
          ],
          prereqs: ['Sequence containers'],
        },
      ],
    },
    {
      title: 'Strings, I/O and Error Handling',
      topics: [
        {
          title: 'std::string and string_view',
          description: 'Owning strings with small-string optimisation, non-owning string_view for parameters and slices, the dangling view trap, substr and find, and converting to and from C strings.',
          concepts: ['std::string operations', 'Small string optimisation', 'string_view parameters', 'Dangling string_view', 'c_str and C interop'],
          quiz: [
            ['Why take std::string_view instead of const std::string&?', 'It accepts literals and substrings without allocating a temporary string.'],
            ['What is wrong with std::string_view v = std::string("tmp");?', 'The temporary dies at the end of the statement, leaving v dangling.'],
          ],
          prereqs: ['Sequence containers'],
        },
        {
          title: 'Text conversions and parsing',
          description: 'Numbers to text and back with to_string, stoi and the faster, locale-free from_chars and to_chars, splitting strings, std::regex for patterns and its performance cost, and character classification.',
          concepts: ['stoi and stod', 'from_chars and to_chars', 'Splitting and trimming', 'std::regex basics', 'Character classification'],
          quiz: [
            ['Why prefer std::from_chars to std::stoi?', 'No exceptions or allocations, locale independent, and it reports how far it parsed.'],
            ['What does stoi("12abc") return?', '12; it stops at the first non-digit.'],
          ],
          prereqs: ['std::string and string_view'],
        },
        {
          title: 'Streams, files and formatting',
          description: 'ifstream and ofstream, reading lines with getline, stringstream for parsing, stream state and error checking, std::format for type-safe formatting and std::print in C++23 as the modern replacement for iostream output.',
          concepts: ['ifstream and ofstream', 'getline and stringstream', 'Stream state and failure', 'std::format syntax', 'std::print'],
          quiz: [
            ['How do you read a file line by line?', 'while (std::getline(in, line)) { ... }'],
            ['What does std::format("{:>8.2f}", x) produce?', 'x as a fixed-point number with two decimals, right-aligned in 8 characters.'],
          ],
          prereqs: ['std::string and string_view'],
        },
        {
          title: 'Exceptions: throw, try and catch',
          description: 'Throwing objects derived from std::exception, catching by const reference, the standard exception hierarchy, stack unwinding and destructors, and rethrowing with throw; to preserve the original.',
          concepts: ['Throwing and catching by reference', 'Standard exception hierarchy', 'Stack unwinding', 'Rethrowing', 'Exceptions in constructors'],
          quiz: [
            ['Why catch by const reference?', 'To avoid slicing and copying the exception object.'],
            ['What happens to locals when an exception propagates?', 'Their destructors run during unwinding.'],
          ],
          prereqs: ['RAII and deterministic destruction'],
        },
        {
          title: 'Exception safety and noexcept',
          description: 'The basic, strong and no-throw guarantees, why destructors and move operations should be noexcept, how vector chooses copy over move when a move may throw, and designing functions so partial failure leaves state valid.',
          concepts: ['Basic, strong and nothrow guarantees', 'noexcept on moves and destructors', 'vector and noexcept moves', 'Copy-and-swap for strong guarantee', 'std::terminate'],
          quiz: [
            ['Why mark a move constructor noexcept?', 'So std::vector can move elements on reallocation instead of copying.'],
            ['What happens when a noexcept function throws?', 'std::terminate is called.'],
          ],
          prereqs: ['Exceptions: throw, try and catch'],
        },
        {
          title: 'Error codes, optional and expected',
          description: 'When exceptions are the wrong tool: returning std::optional for absent values, std::error_code for system errors, and C++23 std::expected<T, E> that carries a value or an error in one type.',
          concepts: ['optional for absence', 'std::error_code', 'std::expected', 'Choosing exceptions versus return values', 'Monadic operations on optional and expected'],
          quiz: [
            ['What does std::expected<int, std::string> hold?', 'Either an int or a std::string error.'],
            ['When are exceptions a poor fit?', 'Expected, frequent failures on hot paths, or code compiled with exceptions disabled.'],
          ],
          prereqs: ['Utilities: pair, tuple, optional and variant'],
        },
        {
          title: 'Assertions and static_assert',
          description: 'assert for runtime invariants stripped in release builds, static_assert for compile-time checks on types and constants, [[assume]] and contracts as they arrive, and where validation belongs instead of assertions.',
          concepts: ['assert and NDEBUG', 'static_assert', 'Invariants versus input validation', 'Assumptions and contracts', 'Failing fast'],
          quiz: [
            ['When should you use static_assert?', 'To check compile-time facts such as sizeof or type traits.'],
            ['Why not use assert to validate user input?', 'Assertions vanish in release builds.'],
          ],
        },
      ],
    },
    {
      title: 'Modules, Build and Package Management',
      topics: [
        {
          title: 'Headers, the ODR and linking',
          description: 'Include guards and #pragma once, the one-definition rule and inline variables, forward declarations to cut compile times, static versus shared libraries, and reading undefined-reference linker errors.',
          concepts: ['Include guards', 'One definition rule and inline', 'Forward declarations', 'Static and shared libraries', 'Linker error diagnosis'],
          quiz: [
            ['Why does defining a non-inline function in a header cause a link error?', 'Every translation unit defines it, violating the one-definition rule.'],
            ['What does inline on a variable allow?', 'Defining it in a header included from many files.'],
          ],
          prereqs: ['Compilation model and compiler flags'],
        },
        {
          title: 'C++20 modules',
          description: 'Named modules that replace textual inclusion: export declarations, module partitions, import std, compiler and CMake support, and why modules cut build times and stop macro leakage.',
          concepts: ['export and import', 'Module partitions', 'import std', 'Modules and CMake', 'Mixing headers and modules'],
          quiz: [
            ['What does a module hide from importers?', 'Everything not marked export, including macros.'],
            ['Which CMake version added first-class module support?', 'CMake 3.28.'],
          ],
          prereqs: ['Headers, the ODR and linking'],
        },
        {
          title: 'CMake for C++ projects',
          description: 'Targets with sources, include directories and compile features, PUBLIC and PRIVATE propagation, presets, tests with CTest, and structuring a repository with libraries, executables and tests.',
          concepts: ['Targets and compile features', 'PUBLIC versus PRIVATE usage', 'CMake presets', 'CTest integration', 'Repository layout'],
          quiz: [
            ['What does target_compile_features(lib PUBLIC cxx_std_20) do?', 'Requires C++20 for the target and everything that links it.'],
            ['Why prefer target_include_directories over include_directories?', 'It scopes the setting to a target and propagates it correctly.'],
          ],
          prereqs: ['Installing a compiler and CMake'],
        },
        {
          title: 'vcpkg, Conan and dependencies',
          description: 'Fetching third-party libraries reproducibly: vcpkg manifests and Conan recipes integrated with CMake, versions and lock files, FetchContent for small dependencies, and building in CI from a clean machine.',
          concepts: ['vcpkg manifest mode', 'Conan profiles and recipes', 'FetchContent', 'Version pinning', 'CI builds from scratch'],
          quiz: [
            ['What does vcpkg.json declare?', 'The dependencies a project needs, installed at configure time.'],
            ['When is FetchContent enough?', 'For small header-only or CMake-based libraries built from source.'],
          ],
          prereqs: ['CMake for C++ projects'],
        },
      ],
    },
    {
      title: 'Concurrency and Multithreading',
      topics: [
        {
          title: 'std::thread and jthread',
          description: 'Launching threads with callables and arguments, join versus detach, C++20 jthread that joins automatically and supports stop tokens, thread_local storage and hardware_concurrency.',
          concepts: ['Starting threads with callables', 'join and detach', 'jthread and stop tokens', 'thread_local', 'Passing references with std::ref'],
          quiz: [
            ['What happens if a std::thread is destroyed while joinable?', 'std::terminate is called.'],
            ['What does jthread add?', 'Automatic join in its destructor and cooperative cancellation via stop_token.'],
          ],
          prereqs: ['Lambdas and captures'],
        },
        {
          title: 'Mutexes and lock guards',
          description: 'Data races and why they are undefined behaviour, std::mutex with lock_guard and unique_lock, scoped_lock for several mutexes without deadlock, shared_mutex for readers, and keeping critical sections small.',
          concepts: ['Data races as UB', 'lock_guard and unique_lock', 'scoped_lock and deadlock avoidance', 'shared_mutex', 'Critical section design'],
          quiz: [
            ['Why use lock_guard instead of calling lock and unlock?', 'RAII guarantees unlock on every exit path, including exceptions.'],
            ['How does scoped_lock avoid deadlock?', 'It acquires all given mutexes with a deadlock-avoiding algorithm.'],
          ],
          prereqs: ['std::thread and jthread'],
        },
        {
          title: 'Condition variables and producer-consumer',
          description: 'Waiting for a state change without spinning: condition_variable with a predicate to handle spurious wakeups, notify_one versus notify_all, and a thread-safe bounded queue as the building block for pipelines.',
          concepts: ['condition_variable wait with predicate', 'Spurious wakeups', 'notify_one versus notify_all', 'Thread-safe queue', 'Shutdown signalling'],
          quiz: [
            ['Why pass a predicate to cv.wait?', 'It re-checks the condition after each wakeup, handling spurious wakeups.'],
            ['Must the mutex be held when calling notify?', 'No, but the shared state change must happen under the lock.'],
          ],
          prereqs: ['Mutexes and lock guards'],
        },
        {
          title: 'Atomics and the memory model',
          description: 'std::atomic for lock-free counters and flags, compare_exchange loops, memory orders from relaxed to seq_cst, acquire-release pairs, and why most code should use the default ordering.',
          concepts: ['std::atomic operations', 'compare_exchange loops', 'Memory orders', 'Acquire-release pairs', 'Lock-free versus wait-free'],
          quiz: [
            ['Is std::atomic<int> counter; counter++ a data race?', 'No, the increment is atomic.'],
            ['What does memory_order_relaxed guarantee?', 'Atomicity only, with no ordering relative to other memory operations.'],
          ],
          prereqs: ['Mutexes and lock guards'],
        },
        {
          title: 'async, futures and parallel algorithms',
          description: 'std::async and futures for returning results from background work, promise for hand-off, packaged_task, the launch policy trap, and execution policies that parallelise standard algorithms.',
          concepts: ['std::async and launch policies', 'future and shared_future', 'promise and packaged_task', 'Execution policies', 'Exceptions across threads'],
          quiz: [
            ['Why can std::async run synchronously?', 'The default policy lets the runtime defer the call; pass std::launch::async to force a thread.'],
            ['What does std::sort(std::execution::par, ...) do?', 'Sorts using multiple threads when the implementation supports it.'],
          ],
          prereqs: ['std::thread and jthread'],
        },
        {
          title: 'Coroutines',
          description: 'C++20 coroutines as a language mechanism: co_await, co_yield and co_return, the promise_type and awaitable protocol, writing a generator, and why libraries like cppcoro and std::generator in C++23 supply the usable pieces.',
          concepts: ['co_await, co_yield and co_return', 'promise_type', 'Awaitables', 'Writing a generator', 'std::generator in C++23'],
          quiz: [
            ['What makes a function a coroutine?', 'Using co_await, co_yield or co_return in its body.'],
            ['Does the standard provide an async runtime for coroutines?', 'No, only the mechanism; std::generator arrived in C++23.'],
          ],
          prereqs: ['async, futures and parallel algorithms'],
        },
      ],
    },
    {
      title: 'Modern C++ and Performance',
      topics: [
        {
          title: 'C++11 and C++14 essentials',
          description: 'The features that reset the language: auto, range-for, nullptr, enum class, uniform initialisation, lambdas, smart pointers, move semantics, generic lambdas and make_unique, and the older idioms they replace.',
          concepts: ['nullptr and enum class', 'Uniform initialisation', 'C++14 generic lambdas and return deduction', 'make_unique and make_shared', 'Idioms replaced by C++11'],
          quiz: [
            ['Why prefer enum class to enum?', 'Scoped names and no implicit conversion to int.'],
            ['Which C++14 feature lets a lambda take auto parameters?', 'Generic lambdas.'],
          ],
          prereqs: ['Lambdas and captures'],
        },
        {
          title: 'C++17 essentials',
          description: 'Structured bindings, if constexpr, inline variables, std::optional, variant and string_view, std::filesystem, class template argument deduction, and parallel algorithms.',
          concepts: ['Structured bindings in practice', 'inline variables', 'std::filesystem', 'Guaranteed copy elision', 'Nested namespaces and other syntax'],
          quiz: [
            ['What does std::filesystem::path handle for you?', 'Portable path joining, extension queries and directory iteration.'],
            ['What does guaranteed copy elision mean for factory functions?', 'Returning a prvalue constructs the object directly in the caller with no copy or move.'],
          ],
          prereqs: ['C++11 and C++14 essentials'],
        },
        {
          title: 'C++20 essentials',
          description: 'Concepts, ranges, coroutines and modules as the big four, plus the spaceship operator, designated initialisers, std::span, std::format, consteval and constinit, and jthread.',
          concepts: ['The big four of C++20', 'Designated initialisers', 'std::span', 'Spaceship operator in practice', 'Feature availability by compiler'],
          quiz: [
            ['What does std::span<int> represent?', 'A non-owning view over a contiguous sequence with a size.'],
            ['What does Point{.x = 1, .y = 2} use?', 'Designated initialisers.'],
          ],
          prereqs: ['C++17 essentials'],
        },
        {
          title: 'C++23 additions',
          description: 'std::expected, std::print and println, deducing this, std::mdspan for multidimensional views, std::generator, flat_map and flat_set, and if consteval, with notes on compiler support.',
          concepts: ['std::print and println', 'Deducing this', 'std::mdspan', 'flat_map and flat_set', 'if consteval'],
          quiz: [
            ['What problem does deducing this solve?', 'Writing one member function that works for const, non-const and rvalue objects without duplication.'],
            ['What does std::println("{}", x) do?', 'Formats x with std::format rules and prints it with a newline.'],
          ],
          prereqs: ['C++20 essentials'],
        },
        {
          title: 'Move semantics in depth and copy elision',
          description: 'Value categories (lvalue, prvalue, xvalue), when the compiler moves automatically, return value optimisation and why std::move on a return is a pessimisation, forwarding references and perfect forwarding.',
          concepts: ['Value categories', 'RVO and NRVO', 'std::move on return', 'Forwarding references', 'Pass by value and move idiom'],
          quiz: [
            ['Why is return std::move(local); wrong?', 'It disables named return value optimisation and forces a move.'],
            ['What is T&& in template<class T> void f(T&&)?', 'A forwarding reference, not an rvalue reference.'],
          ],
          prereqs: ['Copy and move semantics'],
        },
        {
          title: 'Cache-friendly design and allocation strategy',
          description: 'Contiguous data beats pointer chasing: struct-of-arrays layouts, avoiding per-element allocation, reserve, small buffer optimisation, polymorphic memory resources and arena allocators for hot paths.',
          concepts: ['Cache lines and locality', 'Struct of arrays versus array of structs', 'Reducing allocations', 'PMR and arena allocators', 'False sharing in threads'],
          quiz: [
            ['Why is std::vector<Point> faster to scan than std::vector<std::unique_ptr<Point>>?', 'Elements are contiguous, so the cache prefetches them.'],
            ['What does std::pmr::monotonic_buffer_resource do?', 'Hands out memory from a buffer and frees everything at once.'],
          ],
          prereqs: ['Sequence containers'],
        },
        {
          title: 'Profiling, benchmarking and reading assembly',
          description: 'Measuring first with perf, Instruments or VTune, microbenchmarks with Google Benchmark and the pitfalls of dead-code elimination, and using Compiler Explorer to see what the optimiser did to your code.',
          concepts: ['Sampling profilers', 'Google Benchmark', 'Preventing optimisation in benchmarks', 'Compiler Explorer', 'Optimisation flags and LTO'],
          quiz: [
            ['Why can a benchmark report zero time?', 'The optimiser removed the unused result; use benchmark::DoNotOptimize.'],
            ['What does -O2 -flto add over -O2?', 'Cross-translation-unit inlining and optimisation at link time.'],
          ],
          prereqs: ['Cache-friendly design and allocation strategy'],
        },
      ],
    },
    {
      title: 'Testing, Debugging and Security',
      topics: [
        {
          title: 'Unit testing with GoogleTest and Catch2',
          description: 'Writing test cases and assertions, fixtures and parameterised tests, running with CTest, mocking interfaces with GoogleMock, and structuring code so logic is testable without I/O.',
          concepts: ['TEST and assertions', 'Fixtures and parameterised tests', 'GoogleMock basics', 'CTest integration for tests', 'Testable design'],
          quiz: [
            ['Difference between EXPECT_EQ and ASSERT_EQ?', 'ASSERT aborts the test on failure; EXPECT records it and continues.'],
            ['What does a Catch2 SECTION do?', 'Runs the enclosing test case once per section with fresh setup.'],
          ],
          prereqs: ['CMake for C++ projects'],
        },
        {
          title: 'Debugging with gdb and lldb',
          description: 'Breakpoints and stepping, printing STL containers with pretty printers, backtraces through templates and lambdas, watchpoints, core dumps, and debugging optimised builds.',
          concepts: ['Breakpoints and stepping through', 'Pretty printing containers', 'Backtraces in templated code', 'Watchpoints and core dumps', 'Debugging optimised builds'],
          quiz: [
            ['Why do variables show as optimised out?', 'The optimiser removed or kept them in registers; use -O0 -g or -Og for debugging.'],
            ['What command prints the stack in gdb?', 'bt'],
          ],
          prereqs: ['Compilation model and compiler flags'],
        },
        {
          title: 'Sanitizers, static analysis and fuzzing',
          description: 'AddressSanitizer, UndefinedBehaviorSanitizer and ThreadSanitizer builds in CI, clang-tidy and cppcheck for static findings, and libFuzzer harnesses for parsers and decoders.',
          concepts: ['AddressSanitizer and UBSan builds', 'ThreadSanitizer for data races', 'Static analysis in CI', 'libFuzzer harnesses', 'Valgrind for unmodified binaries'],
          quiz: [
            ['Which sanitizer reports a use-after-free?', 'AddressSanitizer.'],
            ['What does a fuzz target function receive?', 'A byte buffer and its length, generated by the fuzzer.'],
          ],
          prereqs: ['Debugging with gdb and lldb'],
        },
        {
          title: 'Undefined behaviour and lifetime bugs',
          description: 'Dangling references from temporaries, iterator invalidation, signed overflow, out-of-bounds access, uninitialised reads, and how the optimiser exploits UB to produce code that seems impossible.',
          concepts: ['Dangling references and temporaries', 'Iterator invalidation bugs', 'Signed overflow and shifts', 'Uninitialised reads', 'Optimiser consequences'],
          quiz: [
            ['Is int x = INT_MAX + 1; defined?', 'No, signed overflow is undefined behaviour.'],
            ['What does const auto& r = getVector()[0]; risk?', 'Dangling: the temporary vector is destroyed at the end of the statement.'],
          ],
          prereqs: ['Sequence containers'],
        },
        {
          title: 'Secure coding in C++',
          description: 'Bounds-checked access with at and span, avoiding C-style buffers, integer overflow checks, validating untrusted input, hardened builds with _GLIBCXX_ASSERTIONS and stack protectors, and the C++ Core Guidelines.',
          concepts: ['Bounds-checked access', 'Replacing C buffers with span and string_view', 'Integer overflow checks', 'Hardening flags', 'Core Guidelines and GSL'],
          quiz: [
            ['What does vector::at do differently from operator[]?', 'It throws std::out_of_range instead of causing UB.'],
            ['What does -D_GLIBCXX_ASSERTIONS enable?', 'Runtime checks inside libstdc++ containers and iterators.'],
          ],
          prereqs: ['Undefined behaviour and lifetime bugs'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: std::vector clone',
          description: 'Implement a Vector<T> with capacity growth, placement new and manual destruction, strong exception safety on push_back, move-aware reallocation, iterators that work with standard algorithms, and a GoogleTest suite.',
          concepts: ['Raw storage and placement new', 'Growth and reallocation with moves', 'Exception-safe push_back', 'Iterator support', 'Testing against std::vector'],
          quiz: [
            ['Why allocate raw bytes instead of new T[n]?', 'To construct elements only when added and destroy only those that exist.'],
            ['When must reallocation copy instead of move?', 'When T\'s move constructor is not noexcept.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: thread pool and job scheduler',
          description: 'Build a fixed-size thread pool with a thread-safe task queue, futures for results, graceful shutdown with jthread and stop tokens, task priorities, and a benchmark against std::async.',
          concepts: ['Worker threads and task queue', 'Returning futures from submit', 'Graceful shutdown', 'Priorities and dependencies', 'Benchmarking throughput'],
          quiz: [
            ['How does submit return a result?', 'Wrap the callable in a packaged_task and return its future.'],
            ['Why use stop_token for shutdown?', 'Workers can check it and exit cleanly without a special poison task.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: HTTP server',
          description: 'Write an HTTP/1.1 server with non-blocking sockets and epoll or Asio, a safe request parser, routing, static files and keep-alive, RAII wrappers for every OS handle, and load tests under sanitizers.',
          concepts: ['Socket RAII wrappers', 'Event loop with epoll or Asio', 'Request parsing and routing', 'Keep-alive and timeouts', 'Load testing under sanitizers'],
          quiz: [
            ['Why wrap file descriptors in a class?', 'So they close on every exit path, including exceptions.'],
            ['What must the parser reject?', 'Oversized headers, malformed request lines and paths that escape the document root.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: expression evaluator',
          description: 'Build a calculator that tokenises input, parses with precedence climbing into a variant-based AST, evaluates with std::visit, supports variables and functions, reports errors with positions, and has fuzz and unit tests.',
          concepts: ['Tokeniser with string_view', 'Precedence climbing parser', 'variant-based AST', 'Evaluation with visit', 'Error reporting and fuzzing'],
          quiz: [
            ['Why represent the AST with std::variant?', 'A closed set of node types with value semantics and no virtual dispatch.'],
            ['How does precedence climbing handle 1 + 2 * 3?', 'It parses the right operand with a minimum precedence so * binds tighter.'],
          ],
          style: 'project',
        },
        {
          title: 'Competitive programming in C++',
          description: 'Why C++ dominates contests: fast I/O with sync_with_stdio(false), bits/stdc++.h and typedefs, STL tricks such as priority_queue and lower_bound, avoiding TLE with the right complexity, and debugging with assertions.',
          concepts: ['Fast input and output', 'Contest template and typedefs', 'STL tools for contests', 'Complexity budgeting', 'Common pitfalls: overflow and recursion depth'],
          quiz: [
            ['What does std::ios::sync_with_stdio(false) do?', 'Unlinks C++ streams from C stdio, making cin and cout much faster.'],
            ['Which container gives a max-heap by default?', 'std::priority_queue.'],
          ],
        },
        {
          title: 'C++ interview questions',
          description: 'The questions that keep coming up: RAII, smart pointer differences, virtual destructors, the rule of five, std::move, templates versus virtual functions, vector versus list, and undefined behaviour examples.',
          concepts: ['Memory and ownership questions', 'OOP and virtual dispatch questions', 'Template and STL questions', 'Concurrency questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['When would you choose shared_ptr over unique_ptr?', 'Only when ownership is genuinely shared and lifetime cannot be tied to one owner.'],
            ['What is the diamond problem?', 'Two bases sharing a common base; solved with virtual inheritance.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in C++',
          description: 'Solving problems fast: unordered_map and set for lookups, sorting with custom comparators, two pointers and sliding windows, priority queues, string building without quadratic concatenation, and reasoning about STL complexity aloud.',
          concepts: ['Choosing the right container', 'Custom comparators', 'Two pointers and sliding windows', 'Heaps and priority queues', 'STL complexity guarantees'],
          quiz: [
            ['What is the complexity of unordered_map lookup?', 'Average O(1), worst case O(n).'],
            ['How do you sort by a struct field?', 'std::sort with a lambda comparator or ranges::sort with a projection.'],
          ],
        },
      ],
    },
  ],
})
