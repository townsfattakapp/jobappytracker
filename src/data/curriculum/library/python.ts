import { defineTrack } from '../define'

export const python = defineTrack({
  id: 'track-python',
  title: 'Python',
  description: 'Python from the first virtual environment to idiomatic, tested, packaged code: syntax, collections, generators, decorators, typing, asyncio, testing, NumPy and Pandas, backend and automation work, and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🐍',
  tags: ['python', 'scripting', 'automation', 'backend', 'data', 'asyncio', 'pytest'],
  languages: ['Python'],
  explainMode: 'concept',
  code: { label: 'Python', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A working, reproducible setup before the first line of real code.',
      topics: [
        {
          title: 'Installing Python and virtual environments',
          description: 'Why every project gets its own interpreter and dependency set, how venv and pyenv create one, and how to activate, inspect and delete it without breaking the system Python.',
          concepts: ['Interpreters and versions', 'Creating and activating a venv', 'pyenv for multiple versions', 'Inspecting what is installed'],
          quiz: [
            ['Why use a virtual environment?', 'To isolate each project\'s dependencies so versions do not clash.'],
            ['Which command creates one with the standard library?', 'python -m venv .venv'],
            ['What does activating a venv change?', 'PATH, so python and pip point at the environment\'s copies.'],
          ],
        },
        {
          title: 'pip and package management',
          description: 'Installing, pinning, upgrading and removing packages with pip, reading requirements files, and where installed packages actually live on disk.',
          concepts: ['pip install, upgrade and uninstall', 'requirements.txt and pinning', 'pip freeze and reproducibility', 'Site-packages and import resolution'],
          quiz: [
            ['What does pip freeze output?', 'Every installed package with its exact version, one per line.'],
            ['Difference between == and >= in a requirement?', '== pins an exact version; >= allows that version or newer.'],
          ],
          prereqs: ['Installing Python and virtual environments'],
        },
        {
          title: 'Project layout and pyproject.toml',
          description: 'The modern single-file project configuration: metadata, dependencies and tool settings in pyproject.toml, and a src layout that avoids accidental imports.',
          concepts: ['pyproject.toml sections', 'src layout versus flat layout', 'Editable installs', 'Tool configuration in one file'],
          quiz: [
            ['Why prefer a src layout?', 'Tests import the installed package, not the working directory, catching packaging mistakes.'],
            ['What does pip install -e . do?', 'Installs the project in editable mode so code changes apply without reinstalling.'],
          ],
          prereqs: ['pip and package management'],
        },
        {
          title: 'The REPL, scripts and modules',
          description: 'Running code three ways: interactively in the REPL, as a script with python file.py, and as a module with python -m, and what __name__ == "__main__" guards.',
          concepts: ['Using the REPL for experiments', 'Running scripts', 'python -m and module execution', 'The __main__ guard'],
          quiz: [
            ['When is __name__ equal to "__main__"?', 'When the file is run directly, not when it is imported.'],
            ['What does python -m json.tool do?', 'Runs the json.tool module as a script to pretty-print JSON.'],
          ],
        },
        {
          title: 'Linters, formatters and editors',
          description: 'Letting tools enforce style: ruff for linting, black or ruff format for formatting, and editor integration so problems appear as you type.',
          concepts: ['ruff rules and auto-fix', 'Formatting with black or ruff format', 'Pre-commit hooks', 'Editor setup'],
          quiz: [
            ['What is the point of an auto-formatter?', 'It removes style debates and diffs by producing one canonical layout.'],
            ['What does a pre-commit hook do?', 'Runs checks automatically before each commit.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'Indentation, statements and comments',
          description: 'How Python uses indentation instead of braces, what counts as a statement, line continuation rules, and docstrings versus comments.',
          concepts: ['Blocks by indentation', 'Statements and line continuation', 'Comments and docstrings', 'PEP 8 essentials'],
          quiz: [
            ['What error does mixing tabs and spaces cause?', 'TabError or IndentationError.'],
            ['Where does a docstring go?', 'As the first statement of a module, class or function.'],
          ],
        },
        {
          title: 'Variables, names and dynamic typing',
          description: 'Names bind to objects rather than boxes holding values; how assignment, rebinding and identity work, and why type() and id() reveal the model.',
          concepts: ['Names bind to objects', 'Dynamic typing', 'Identity with is and id()', 'Multiple and augmented assignment'],
          quiz: [
            ['Does a = b copy b?', 'No. Both names now refer to the same object.'],
            ['Difference between == and is?', '== compares values; is compares identity.'],
          ],
        },
        {
          title: 'Numbers and arithmetic',
          description: 'int with arbitrary precision, float with IEEE rounding, complex, the division operators, and Decimal and Fraction when exactness matters.',
          concepts: ['int, float and complex', 'True division, floor division and modulo', 'Floating-point surprises', 'Decimal and Fraction'],
          quiz: [
            ['What is 7 // -2?', '-4, because floor division rounds toward negative infinity.'],
            ['Why is 0.1 + 0.2 != 0.3?', 'Binary floating point cannot represent those decimals exactly.'],
          ],
        },
        {
          title: 'Strings and f-strings',
          description: 'Immutable text: literals, escapes, concatenation, indexing and slicing, and f-strings with format specifiers for clean output.',
          concepts: ['String literals and escapes', 'Indexing and slicing', 'f-strings and format specs', 'Immutability consequences'],
          quiz: [
            ['What does f"{x:.2f}" do?', 'Formats x as a float with two decimals.'],
            ['What does "abc"[::-1] return?', '"cba".'],
          ],
        },
        {
          title: 'Booleans, truthiness and comparisons',
          description: 'Which values are falsy, how and/or/not short-circuit and return operands, and chained comparisons like 0 < x < 10.',
          concepts: ['Falsy values', 'Short-circuit and, or, not', 'Chained comparisons', 'bool() conversions'],
          quiz: [
            ['What does "" or "default" evaluate to?', '"default", because or returns the first truthy operand.'],
            ['Is an empty list truthy?', 'No, empty containers are falsy.'],
          ],
        },
        {
          title: 'Operators and expressions',
          description: 'Precedence, the walrus operator for assignment inside expressions, membership and identity tests, and the conditional expression.',
          concepts: ['Operator precedence', 'Walrus operator :=', 'in and not in', 'Conditional expression'],
          quiz: [
            ['What does (n := len(items)) > 3 do?', 'Assigns len(items) to n and compares it in one expression.'],
            ['What is the precedence of not versus and?', 'not binds tighter than and, which binds tighter than or.'],
          ],
        },
      ],
    },
    {
      title: 'Control Flow and Functions',
      topics: [
        {
          title: 'Conditions and loops',
          description: 'if/elif/else, while and for loops, break, continue and the loop else clause, plus the match statement for structural pattern matching.',
          concepts: ['if, elif, else', 'for and while', 'break, continue and loop else', 'match statement basics'],
          quiz: [
            ['When does a for loop\'s else run?', 'When the loop finishes without hitting break.'],
            ['What does match x: case [a, b]: match?', 'A sequence of exactly two items.'],
          ],
        },
        {
          title: 'range, enumerate and zip',
          description: 'Idiomatic iteration helpers that replace index arithmetic: range for counts, enumerate for index plus value, zip for parallel sequences, reversed and sorted for order.',
          concepts: ['range and lazy sequences', 'enumerate with start', 'zip and strict zip', 'reversed and sorted in loops'],
          quiz: [
            ['What does enumerate(items, start=1) yield?', 'Pairs of (1, first), (2, second), and so on.'],
            ['What happens when zip gets sequences of different lengths?', 'It stops at the shortest unless strict=True raises.'],
          ],
          prereqs: ['Conditions and loops'],
        },
        {
          title: 'Defining functions and scope',
          description: 'def, return, default values, the LEGB scope rule, and why mutable default arguments are a classic bug.',
          concepts: ['def and return', 'Default arguments and the mutable default trap', 'LEGB scope lookup', 'global and nonlocal'],
          quiz: [
            ['Why is def f(items=[]) dangerous?', 'The list is created once and shared across calls.'],
            ['What does nonlocal do?', 'Lets a nested function rebind a variable of the enclosing function.'],
          ],
        },
        {
          title: 'Arguments: positional, keyword, *args and **kwargs',
          description: 'How calls bind arguments, keyword-only and positional-only parameters, and packing and unpacking with * and ** on both sides of a call.',
          concepts: ['Positional and keyword arguments', '*args and **kwargs', 'Keyword-only and positional-only markers', 'Unpacking in calls'],
          quiz: [
            ['What does def f(a, /, b, *, c) enforce?', 'a positional-only, c keyword-only, b either.'],
            ['What does f(*[1, 2]) do?', 'Passes 1 and 2 as separate positional arguments.'],
          ],
          prereqs: ['Defining functions and scope'],
        },
        {
          title: 'Lambdas and higher-order functions',
          description: 'Anonymous single-expression functions, passing functions as values, map, filter and sorted with key, and when a comprehension reads better.',
          concepts: ['lambda expressions', 'Functions as first-class values', 'map, filter and key functions', 'When to avoid lambda'],
          quiz: [
            ['Can a lambda contain statements?', 'No, only a single expression.'],
            ['How do you sort dicts by a field?', 'sorted(rows, key=lambda r: r["age"]).'],
          ],
        },
        {
          title: 'Recursion in Python',
          description: 'Writing recursive functions, the recursion limit, memoisation with functools.lru_cache, and converting recursion to iteration when depth is a problem.',
          concepts: ['Base and recursive cases', 'The recursion limit', 'lru_cache memoisation', 'Recursion to iteration'],
          quiz: [
            ['What is the default recursion limit?', 'Around 1000 frames.'],
            ['What does @lru_cache change?', 'Repeated calls with the same arguments return cached results.'],
          ],
        },
      ],
    },
    {
      title: 'Collections and Data Structures',
      topics: [
        {
          title: 'Lists and slicing',
          description: 'The workhorse mutable sequence: append, extend, insert, pop, slicing with steps, copying versus aliasing, and the cost of operations at each end.',
          concepts: ['List methods', 'Slicing and step slices', 'Shallow copies and aliasing', 'Time complexity of list operations'],
          quiz: [
            ['What is the cost of list.insert(0, x)?', 'O(n), because every element shifts.'],
            ['Does b = a[:] copy nested lists?', 'No, it is a shallow copy; inner lists are shared.'],
          ],
        },
        {
          title: 'Tuples and unpacking',
          description: 'Immutable sequences as records, tuple unpacking with starred targets, swapping variables, and returning multiple values from functions.',
          concepts: ['Tuple literals and immutability', 'Unpacking and starred targets', 'Swapping and multiple returns', 'Tuples as dict keys'],
          quiz: [
            ['What does a, *rest = [1, 2, 3] give?', 'a = 1, rest = [2, 3].'],
            ['Why can a tuple be a dict key?', 'It is hashable if all its items are.'],
          ],
        },
        {
          title: 'Dictionaries',
          description: 'Hash maps with insertion order: get and setdefault, iteration over items, dictionary views, merging with |, and the cost model.',
          concepts: ['Creating and accessing', 'get, setdefault and pop', 'Views and iteration', 'Merging and comprehension'],
          quiz: [
            ['What does d.get(k, default) avoid?', 'A KeyError when k is missing.'],
            ['Are dicts ordered?', 'Yes, by insertion since Python 3.7.'],
          ],
        },
        {
          title: 'Sets',
          description: 'Unordered collections of unique hashable items for membership tests and set algebra: union, intersection, difference and frozenset.',
          concepts: ['Set literals and membership', 'Union, intersection, difference', 'frozenset', 'Deduplicating while keeping order'],
          quiz: [
            ['Average cost of x in a set?', 'O(1).'],
            ['How do you dedupe a list but keep order?', 'list(dict.fromkeys(items)).'],
          ],
        },
        {
          title: 'Comprehensions',
          description: 'List, set and dict comprehensions with conditions and nesting, why they beat map/filter for readability, and when a plain loop is clearer.',
          concepts: ['List comprehensions', 'Set and dict comprehensions', 'Nested and conditional comprehensions', 'Readability limits'],
          quiz: [
            ['Write a dict of word lengths.', '{w: len(w) for w in words}'],
            ['Do comprehensions leak their loop variable?', 'No, they have their own scope in Python 3.'],
          ],
          prereqs: ['Lists and slicing', 'Dictionaries'],
        },
        {
          title: 'The collections module',
          description: 'Specialised containers that remove boilerplate: deque for O(1) ends, Counter for tallies, defaultdict for grouping, namedtuple and ChainMap.',
          concepts: ['deque', 'Counter and most_common', 'defaultdict for grouping', 'namedtuple and ChainMap'],
          quiz: [
            ['When use deque over list?', 'When you push or pop from the left frequently.'],
            ['What does Counter("banana").most_common(1) return?', '[("a", 3)].'],
          ],
        },
        {
          title: 'Sorting and key functions',
          description: 'sorted and list.sort, stability, key functions, sorting by multiple fields, reverse order and operator.itemgetter and attrgetter.',
          concepts: ['sorted versus sort', 'Stable sorting', 'Key functions and multi-field sorts', 'itemgetter and attrgetter'],
          quiz: [
            ['How do you sort by age descending then name ascending?', 'Sort by name, then stable-sort by -age, or use a key tuple (-age, name).'],
            ['Is Python\'s sort stable?', 'Yes, Timsort preserves equal elements\' order.'],
          ],
        },
      ],
    },
    {
      title: 'Strings and Text Processing',
      topics: [
        {
          title: 'String methods',
          description: 'The everyday toolkit: split and join, strip, replace, find, startswith, case methods, and why joining beats repeated concatenation.',
          concepts: ['split and join', 'strip, replace and find', 'Case and predicate methods', 'Concatenation cost'],
          quiz: [
            ['Why is "".join(parts) preferred over += in a loop?', 'It builds the result once instead of copying on every step.'],
            ['What does "a,b,,c".split(",") return?', '["a", "b", "", "c"].'],
          ],
        },
        {
          title: 'Formatting and alignment',
          description: 'Format specifications for width, alignment, padding, thousands separators, percentages and dates, in f-strings and str.format.',
          concepts: ['Width and alignment', 'Numeric formats and separators', 'Date and time formatting', 'Template strings'],
          quiz: [
            ['How do you right-align in 10 columns?', 'f"{value:>10}"'],
            ['Format 1234567 with commas.', 'f"{1234567:,}" gives 1,234,567.'],
          ],
        },
        {
          title: 'Encodings, bytes and Unicode',
          description: 'str is Unicode text and bytes is raw data; encode and decode, UTF-8 by default, and the errors that appear when files or sockets mix them up.',
          concepts: ['str versus bytes', 'encode and decode', 'UTF-8 and errors handling', 'Reading files with the right encoding'],
          quiz: [
            ['What does "é".encode("utf-8") produce?', 'b"\\xc3\\xa9", two bytes.'],
            ['What raises UnicodeDecodeError?', 'Decoding bytes with an encoding that does not match them.'],
          ],
        },
        {
          title: 'Regular expressions with re',
          description: 'Patterns, groups, re.search versus re.match versus re.findall, compiled patterns, raw strings and substitutions with re.sub.',
          concepts: ['Pattern syntax and raw strings', 'search, match, findall', 'Groups and named groups', 're.sub and compiled patterns'],
          quiz: [
            ['Difference between re.match and re.search?', 'match anchors at the start; search scans the whole string.'],
            ['Why use r"\\d+"?', 'Raw strings stop Python from interpreting backslashes.'],
          ],
        },
        {
          title: 'Parsing structured text',
          description: 'Reading and writing CSV with the csv module, JSON with json, simple line-oriented parsing, and the pitfalls of quoting and delimiters.',
          concepts: ['csv.reader and DictReader', 'json.loads and json.dumps', 'Line-oriented parsing', 'Quoting and delimiter pitfalls'],
          quiz: [
            ['Why use csv instead of split(",")?', 'It handles quoted fields that contain commas and newlines.'],
            ['What does json.dumps(obj, indent=2) do?', 'Serialises with pretty-printed indentation.'],
          ],
        },
      ],
    },
    {
      title: 'Errors, Exceptions and Logging',
      topics: [
        {
          title: 'Exceptions and tracebacks',
          description: 'How raising unwinds the stack, reading a traceback from the bottom up, the built-in exception hierarchy and choosing the right class to raise.',
          concepts: ['Raising and unwinding', 'Reading tracebacks', 'The exception hierarchy', 'Choosing an exception class'],
          quiz: [
            ['Where is the actual error in a traceback?', 'At the bottom; frames above show the call path.'],
            ['Is KeyError a subclass of LookupError?', 'Yes, along with IndexError.'],
          ],
        },
        {
          title: 'try, except, else and finally',
          description: 'Handling errors precisely: catching specific classes, else for the success path, finally for cleanup, exception chaining with from, and re-raising.',
          concepts: ['Catching specific exceptions', 'else and finally', 'Chaining with raise from', 'Re-raising and bare except dangers'],
          quiz: [
            ['When does the else block run?', 'Only if the try block raised nothing.'],
            ['Why avoid bare except?', 'It swallows KeyboardInterrupt and SystemExit and hides bugs.'],
          ],
          prereqs: ['Exceptions and tracebacks'],
        },
        {
          title: 'Custom exceptions',
          description: 'Designing an exception hierarchy for a library or app, adding fields for context, and keeping error messages actionable.',
          concepts: ['Subclassing Exception', 'A base class per package', 'Carrying context fields', 'Actionable messages'],
          quiz: [
            ['Why define a package base exception?', 'Callers can catch everything from your package in one clause.'],
            ['Should custom exceptions override __init__?', 'Only when they need extra fields; call super().__init__(message).'],
          ],
        },
        {
          title: 'Assertions and defensive code',
          description: 'assert for invariants during development, why it is stripped with -O, validating inputs at boundaries, and EAFP versus LBYL styles.',
          concepts: ['assert and -O', 'Validate at boundaries', 'EAFP versus LBYL', 'Failing fast'],
          quiz: [
            ['Why not use assert for input validation?', 'Assertions are removed when Python runs with -O.'],
            ['What does EAFP stand for?', 'Easier to ask forgiveness than permission: try it and catch the exception.'],
          ],
        },
        {
          title: 'Logging',
          description: 'The logging module instead of print: loggers, levels, handlers, formatters, configuration for libraries versus applications, and structured logs.',
          concepts: ['Loggers, handlers and formatters', 'Levels and when to use them', 'Library versus application configuration', 'Structured logging'],
          quiz: [
            ['Why getLogger(__name__)?', 'It names loggers after modules so output can be filtered per module.'],
            ['Which level is hidden by default?', 'DEBUG (and INFO) under the default WARNING threshold.'],
          ],
        },
      ],
    },
    {
      title: 'Iterators, Generators and Decorators',
      topics: [
        {
          title: 'The iterator protocol',
          description: 'What for actually calls: iter() and next(), StopIteration, iterables versus iterators, and writing a class that supports iteration.',
          concepts: ['iter and next', 'Iterable versus iterator', 'StopIteration', 'Custom __iter__ and __next__'],
          quiz: [
            ['Is a list an iterator?', 'No, it is an iterable; iter(list) returns an iterator.'],
            ['What does next(it, default) do?', 'Returns default instead of raising when exhausted.'],
          ],
        },
        {
          title: 'Generators and yield',
          description: 'Functions that pause and resume: lazy pipelines that process huge data with constant memory, send and close, and yield from for delegation.',
          concepts: ['yield and lazy evaluation', 'Generator state and exhaustion', 'send and close', 'yield from'],
          quiz: [
            ['What happens when a generator function is called?', 'Nothing runs; a generator object is returned.'],
            ['Why are generators memory friendly?', 'They produce one item at a time instead of building a list.'],
          ],
          prereqs: ['The iterator protocol'],
        },
        {
          title: 'Generator expressions and itertools',
          description: 'Lazy comprehensions, and itertools building blocks: chain, islice, groupby, product, combinations, accumulate and pairwise.',
          concepts: ['Generator expressions', 'chain, islice and takewhile', 'groupby and its sorted-input rule', 'Combinatorics helpers'],
          quiz: [
            ['What is the gotcha with itertools.groupby?', 'It groups consecutive keys only, so sort first.'],
            ['sum(x*x for x in range(10)): list or generator?', 'A generator expression, evaluated lazily.'],
          ],
          prereqs: ['Generators and yield'],
        },
        {
          title: 'Closures and functools',
          description: 'Inner functions that capture variables, the late-binding trap in loops, partial application, and functools.wraps and reduce.',
          concepts: ['Closures and captured variables', 'Late binding in loops', 'functools.partial', 'functools.wraps and reduce'],
          quiz: [
            ['Why do lambdas in a loop all see the last value?', 'They capture the variable, not its value at creation.'],
            ['What does partial(pow, 2) create?', 'A function computing 2 ** x.'],
          ],
        },
        {
          title: 'Decorators',
          description: 'Functions that wrap functions: timing, caching, retry and access checks, decorators with arguments, class decorators, and preserving metadata with wraps.',
          concepts: ['Wrapping a function', 'Decorators with arguments', 'functools.wraps', 'Class and stacked decorators'],
          quiz: [
            ['What does @deco above def f mean?', 'f = deco(f).'],
            ['Why use functools.wraps?', 'To keep the wrapped function\'s name, docstring and signature.'],
          ],
          prereqs: ['Closures and functools'],
        },
        {
          title: 'Context managers and with',
          description: 'Guaranteed setup and teardown: __enter__ and __exit__, contextlib.contextmanager, ExitStack, and writing managers for files, locks and timers.',
          concepts: ['__enter__ and __exit__', 'contextlib.contextmanager', 'Handling exceptions in __exit__', 'ExitStack and nesting'],
          quiz: [
            ['What guarantees a file is closed after with open(...)?', '__exit__ runs even if the block raises.'],
            ['What should __exit__ return to suppress an exception?', 'True.'],
          ],
        },
      ],
    },
    {
      title: 'Modules, Packages and I/O',
      topics: [
        {
          title: 'Modules and imports',
          description: 'How import finds and caches modules, absolute versus relative imports, sys.path, circular-import symptoms and fixes, and import side effects.',
          concepts: ['Import mechanics and sys.modules', 'Absolute and relative imports', 'Circular imports', 'Import side effects'],
          quiz: [
            ['Is a module executed on every import?', 'No, only the first time; later imports reuse sys.modules.'],
            ['What is a typical fix for a circular import?', 'Move the import inside the function or restructure modules.'],
          ],
        },
        {
          title: 'Packages and __init__',
          description: 'Directories as packages, what __init__.py does, exposing a public API, __all__, and namespace packages.',
          concepts: ['Package directories', 'Role of __init__.py', 'Public API and __all__', 'Namespace packages'],
          quiz: [
            ['What does from pkg import * export?', 'Names listed in __all__, or all public names if it is absent.'],
            ['Do packages need __init__.py?', 'Regular packages do; namespace packages do not.'],
          ],
          prereqs: ['Modules and imports'],
        },
        {
          title: 'Standard library tour',
          description: 'The modules every Python developer should know by name: os, sys, pathlib, datetime, time, math, random, json, collections, itertools, functools, subprocess.',
          concepts: ['os, sys and subprocess', 'datetime and zoneinfo', 'math, random and statistics', 'Finding the right module'],
          quiz: [
            ['How do you get an aware UTC now?', 'datetime.now(timezone.utc).'],
            ['Which module runs external commands safely?', 'subprocess, with a list of arguments.'],
          ],
        },
        {
          title: 'File handling with pathlib',
          description: 'Reading and writing text and binary files, encodings and newlines, pathlib.Path for joining, globbing and metadata, and atomic writes.',
          concepts: ['open modes and encodings', 'Path joining and globbing', 'Reading large files line by line', 'Atomic writes and temp files'],
          quiz: [
            ['What does Path("a") / "b.txt" give?', 'Path("a/b.txt") on POSIX, with the right separator on Windows.'],
            ['How do you iterate a big file without loading it?', 'for line in open(path): reads lazily.'],
          ],
        },
        {
          title: 'JSON, CSV and configuration files',
          description: 'Serialising Python objects to JSON and back, custom encoders, CSV round trips with headers, and reading TOML, YAML and .env configuration.',
          concepts: ['json dump and load', 'Custom JSON encoders', 'CSV with headers', 'TOML, YAML and env files'],
          quiz: [
            ['Can json.dumps serialise a datetime?', 'Not by default; pass default= or convert to a string.'],
            ['Which config format does pyproject use?', 'TOML.'],
          ],
        },
        {
          title: 'Command-line programs with argparse',
          description: 'Building a CLI: positional and optional arguments, subcommands, help text, exit codes, and reading from stdin and pipes.',
          concepts: ['ArgumentParser basics', 'Subcommands', 'Exit codes and stderr', 'Reading stdin'],
          quiz: [
            ['How do you make an argument required?', 'Positional arguments are required; use required=True for options.'],
            ['Where should error messages go?', 'stderr, with a non-zero exit code.'],
          ],
        },
      ],
    },
    {
      title: 'Object-Oriented and Idiomatic Python',
      topics: [
        {
          title: 'Classes and instances',
          description: '__init__, self, instance versus class attributes, methods, and how attribute lookup walks the instance, class and bases.',
          concepts: ['__init__ and self', 'Instance versus class attributes', 'Methods, classmethods and staticmethods', 'Attribute lookup order'],
          quiz: [
            ['What is self?', 'The instance the method is called on, passed automatically.'],
            ['When use @classmethod?', 'For alternative constructors or class-level behaviour.'],
          ],
        },
        {
          title: 'Dunder methods and protocols',
          description: 'Making objects feel native: __repr__ and __str__, __eq__ and __hash__, __len__, __getitem__, comparison and arithmetic operators.',
          concepts: ['__repr__ and __str__', '__eq__ and __hash__ contract', 'Container protocols', 'Operator overloading'],
          quiz: [
            ['If you define __eq__, what happens to __hash__?', 'It becomes None unless you define it too.'],
            ['What should __repr__ aim for?', 'An unambiguous string, ideally valid code to recreate the object.'],
          ],
          prereqs: ['Classes and instances'],
        },
        {
          title: 'Inheritance and composition',
          description: 'Subclassing and super(), method resolution order with multiple inheritance and mixins, and preferring composition for has-a relationships.',
          concepts: ['super() and overriding', 'MRO and mixins', 'Composition over inheritance', 'Abstract base classes'],
          quiz: [
            ['What does super().__init__() do in a subclass?', 'Runs the parent initialiser according to the MRO.'],
            ['How do you see the MRO?', 'Cls.__mro__ or Cls.mro().'],
          ],
          prereqs: ['Classes and instances'],
        },
        {
          title: 'Properties, slots and descriptors',
          description: 'Computed attributes with @property, validation in setters, __slots__ for memory, and how descriptors underpin properties and methods.',
          concepts: ['@property getters and setters', 'Validation on assignment', '__slots__', 'Descriptor basics'],
          quiz: [
            ['Why use @property instead of get_x()?', 'Callers use attribute syntax; you can add logic later without changing them.'],
            ['What does __slots__ save?', 'Per-instance __dict__ memory and it blocks new attributes.'],
          ],
        },
        {
          title: 'Dataclasses',
          description: 'Declarative classes with generated __init__, __repr__ and __eq__, defaults and field(default_factory), frozen and ordered variants, and post-init validation.',
          concepts: ['@dataclass basics', 'field and default_factory', 'frozen and order', '__post_init__ and asdict'],
          quiz: [
            ['Why default_factory=list?', 'A plain list default would be shared across instances.'],
            ['What does frozen=True give you?', 'Immutable instances that are hashable.'],
          ],
        },
        {
          title: 'Type hints and mypy',
          description: 'Annotating functions and variables, Optional, Union and generics, TypedDict and Protocol, and running mypy or pyright to catch bugs before runtime.',
          concepts: ['Basic annotations', 'Optional, Union and generics', 'TypedDict and Protocol', 'Running mypy'],
          quiz: [
            ['Do type hints change runtime behaviour?', 'No, they are ignored at runtime unless a tool reads them.'],
            ['What is list[int] | None?', 'Either a list of ints or None.'],
          ],
        },
        {
          title: 'Enums and named tuples',
          description: 'Enum, IntEnum, Flag and auto() for fixed sets of values, and typing.NamedTuple for lightweight immutable records.',
          concepts: ['Enum and auto()', 'IntEnum and Flag', 'Iterating and looking up members', 'typing.NamedTuple'],
          quiz: [
            ['How do you get an Enum member from its value?', 'Color(1).'],
            ['Difference between Enum and IntEnum?', 'IntEnum members compare equal to ints.'],
          ],
        },
        {
          title: 'Duck typing and abstract base classes',
          description: 'Relying on behaviour instead of type, when to use collections.abc and abc.ABC, and how Protocol enables static duck typing.',
          concepts: ['Duck typing in practice', 'collections.abc interfaces', 'abc.ABC and abstractmethod', 'Protocol for static checks'],
          quiz: [
            ['What does isinstance(x, collections.abc.Iterable) check?', 'Whether x defines __iter__.'],
            ['Can you instantiate a class with an abstract method?', 'No, TypeError.'],
          ],
          prereqs: ['Inheritance and composition'],
        },
      ],
    },
    {
      title: 'Memory, Performance and Concurrency',
      topics: [
        {
          title: 'Memory model: references, mutability and copying',
          description: 'Reference counting and garbage collection, mutable versus immutable objects, shallow and deep copies, interning, and why default arguments and aliasing bite.',
          concepts: ['Reference counting and gc', 'Mutable versus immutable', 'copy and deepcopy', 'Aliasing bugs'],
          quiz: [
            ['When is an object freed?', 'When its reference count hits zero, or the cycle collector finds it.'],
            ['Does deepcopy copy nested objects?', 'Yes, recursively.'],
          ],
        },
        {
          title: 'The GIL and choosing a concurrency model',
          description: 'Why threads do not speed up CPU-bound Python, where the GIL releases (I/O, C extensions), and picking threads, processes or asyncio per workload.',
          concepts: ['What the GIL locks', 'CPU-bound versus I/O-bound', 'Choosing threads, processes or asyncio', 'Free-threaded builds'],
          quiz: [
            ['Do threads speed up pure-Python number crunching?', 'No, the GIL serialises bytecode execution.'],
            ['Which model suits thousands of network calls?', 'asyncio.'],
          ],
        },
        {
          title: 'Threads and thread pools',
          description: 'threading.Thread, locks and races, queue.Queue for producer-consumer, and concurrent.futures.ThreadPoolExecutor for I/O parallelism.',
          concepts: ['Starting and joining threads', 'Locks and race conditions', 'queue.Queue', 'ThreadPoolExecutor'],
          quiz: [
            ['What protects a shared counter across threads?', 'A Lock around the read-modify-write.'],
            ['What does executor.map return?', 'Results in submission order, lazily.'],
          ],
          prereqs: ['The GIL and choosing a concurrency model'],
        },
        {
          title: 'Multiprocessing',
          description: 'Running CPU-bound work on multiple cores with ProcessPoolExecutor and multiprocessing, pickling constraints, and sharing results.',
          concepts: ['ProcessPoolExecutor', 'Pickling arguments and results', 'Pool.map and chunking', 'Start methods and the __main__ guard'],
          quiz: [
            ['Why must worker functions be importable?', 'Processes pickle the function by reference to run it.'],
            ['Why is the __main__ guard needed on Windows?', 'Child processes re-import the script.'],
          ],
          prereqs: ['The GIL and choosing a concurrency model'],
        },
        {
          title: 'Asyncio fundamentals',
          description: 'Coroutines, the event loop, await, gather and create_task, timeouts and cancellation, and why blocking calls freeze everything.',
          concepts: ['async def and await', 'The event loop', 'gather and create_task', 'Timeouts and cancellation'],
          quiz: [
            ['What happens if you call time.sleep inside a coroutine?', 'The whole event loop blocks.'],
            ['Difference between gather and create_task?', 'gather awaits a group; create_task schedules and returns a handle.'],
          ],
          prereqs: ['The GIL and choosing a concurrency model'],
        },
        {
          title: 'Async I/O in practice',
          description: 'HTTP with httpx or aiohttp, async database drivers, semaphores for rate limits, async generators and context managers, and running sync code in threads.',
          concepts: ['httpx AsyncClient', 'Semaphores and rate limiting', 'Async generators and context managers', 'asyncio.to_thread'],
          quiz: [
            ['How do you limit concurrent requests to 10?', 'Wrap each call in an asyncio.Semaphore(10).'],
            ['How do you call a blocking function from async code?', 'await asyncio.to_thread(fn).'],
          ],
          prereqs: ['Asyncio fundamentals'],
        },
        {
          title: 'Profiling and optimisation',
          description: 'Measuring before guessing: timeit, cProfile and py-spy, algorithmic fixes first, then built-ins, caching, generators, and when to reach for NumPy or C extensions.',
          concepts: ['timeit and cProfile', 'Reading a profile', 'Built-ins and vectorisation', 'When to use compiled code'],
          quiz: [
            ['What should you do before optimising?', 'Profile to find the actual hotspot.'],
            ['Why are built-ins like sum faster than a loop?', 'They run in C without per-iteration bytecode.'],
          ],
        },
      ],
    },
    {
      title: 'Testing, Quality and Packaging',
      topics: [
        {
          title: 'pytest basics',
          description: 'Writing test functions with plain asserts, test discovery, running subsets, reading failures, and organising tests beside the code.',
          concepts: ['Test functions and asserts', 'Discovery and naming', 'Running and filtering tests', 'Reading assertion output'],
          quiz: [
            ['How does pytest find tests?', 'Files named test_*.py or *_test.py with functions starting with test.'],
            ['How do you run one test?', 'pytest path/test_file.py::test_name'],
          ],
        },
        {
          title: 'Fixtures and parametrisation',
          description: 'Reusable setup with fixtures and scopes, conftest.py, tmp_path and monkeypatch, and parametrize for table-driven tests.',
          concepts: ['Fixtures and scopes', 'conftest.py', 'tmp_path and monkeypatch', 'parametrize'],
          quiz: [
            ['What does a fixture with scope="session" do?', 'It is created once for the whole run.'],
            ['Why parametrize?', 'One test body runs against many inputs with clear reports.'],
          ],
          prereqs: ['pytest basics'],
        },
        {
          title: 'Mocking and testing side effects',
          description: 'unittest.mock and pytest-mock: patching where the name is looked up, asserting calls, faking time and HTTP, and avoiding over-mocking.',
          concepts: ['patch and where to patch', 'MagicMock and call assertions', 'Faking time and network', 'Over-mocking smells'],
          quiz: [
            ['Where do you patch a function?', 'Where it is looked up (the importing module), not where it is defined.'],
            ['What does mock.assert_called_once_with check?', 'Exactly one call with those arguments.'],
          ],
          prereqs: ['Fixtures and parametrisation'],
        },
        {
          title: 'Debugging with pdb and breakpoints',
          description: 'breakpoint(), stepping and inspecting frames, post-mortem debugging, conditional breakpoints, and debugging inside pytest.',
          concepts: ['breakpoint() and pdb commands', 'Post-mortem debugging', 'Conditional breakpoints', 'Debugging tests'],
          quiz: [
            ['What does breakpoint() call by default?', 'pdb.set_trace().'],
            ['Which pdb command steps into a call?', 's (step).'],
          ],
        },
        {
          title: 'Code quality: ruff, black and mypy in CI',
          description: 'A quality gate that runs the same everywhere: lint, format check, type check and tests in CI, with coverage thresholds.',
          concepts: ['Lint and format in CI', 'Type checking in CI', 'Coverage and thresholds', 'Fast feedback loops'],
          quiz: [
            ['Why run the formatter in check mode in CI?', 'To fail the build if code is not formatted, without modifying it.'],
            ['What does pytest --cov report?', 'Line coverage per file.'],
          ],
        },
        {
          title: 'Packaging and publishing',
          description: 'Building wheels and sdists with build, versioning, entry points for CLIs, publishing to PyPI or a private index with twine or a CI workflow.',
          concepts: ['Wheels and sdists', 'Versioning and entry points', 'Publishing with twine', 'Private indexes'],
          quiz: [
            ['What is a wheel?', 'A prebuilt distribution that installs without running setup code.'],
            ['How does a package expose a CLI command?', 'Through a project.scripts entry point.'],
          ],
          prereqs: ['Project layout and pyproject.toml'],
        },
        {
          title: 'Dependency locking and security basics',
          description: 'Reproducible installs with lock files (uv, pip-tools, Poetry), auditing for vulnerable packages, and avoiding pickle, eval and shell injection.',
          concepts: ['Lock files and reproducibility', 'pip-audit and updates', 'Dangerous APIs: pickle, eval, shell=True', 'Secrets and environment variables'],
          quiz: [
            ['Why never unpickle untrusted data?', 'Pickle can execute arbitrary code on load.'],
            ['Why avoid subprocess with shell=True on user input?', 'It enables shell injection.'],
          ],
        },
      ],
    },
    {
      title: 'Data and Scientific Python',
      style: 'practice',
      topics: [
        {
          title: 'NumPy arrays',
          description: 'ndarrays as the foundation of numeric Python: shapes and dtypes, vectorised arithmetic, broadcasting, indexing and why loops over arrays are slow.',
          concepts: ['Creating arrays and dtypes', 'Vectorised operations', 'Broadcasting', 'Boolean and fancy indexing'],
          quiz: [
            ['What does broadcasting do?', 'Stretches smaller arrays across larger ones for element-wise operations.'],
            ['Why avoid Python loops over arrays?', 'Vectorised ops run in C and are orders of magnitude faster.'],
          ],
        },
        {
          title: 'Pandas DataFrames',
          description: 'Tabular data with labelled axes: loading, selecting with loc and iloc, filtering, groupby aggregation, joins and handling missing values.',
          concepts: ['Series and DataFrame', 'loc, iloc and filtering', 'groupby and aggregation', 'merge, concat and missing values'],
          quiz: [
            ['Difference between loc and iloc?', 'loc uses labels; iloc uses positions.'],
            ['How do you drop rows with NaN?', 'df.dropna().'],
          ],
          prereqs: ['NumPy arrays'],
        },
        {
          title: 'Reading and writing data files',
          description: 'CSV, Excel, Parquet and JSON with pandas, dtype control, chunked reading for large files, and choosing Parquet for speed and size.',
          concepts: ['read_csv options and dtypes', 'Excel and JSON', 'Parquet and compression', 'Chunked reading'],
          quiz: [
            ['Why prefer Parquet over CSV for large data?', 'Columnar, compressed and typed, so faster and smaller.'],
            ['How do you read a huge CSV in pieces?', 'pd.read_csv(path, chunksize=n).'],
          ],
        },
        {
          title: 'Quick plots with matplotlib',
          description: 'Line, bar, scatter and histogram plots, labels and legends, subplots, saving figures, and plotting straight from a DataFrame.',
          concepts: ['Figure and axes', 'Common chart types', 'Labels, legends and subplots', 'DataFrame.plot'],
          quiz: [
            ['What does plt.subplots(1, 2) return?', 'A figure and an array of two axes.'],
            ['How do you save a figure?', 'fig.savefig("out.png", dpi=150).'],
          ],
        },
        {
          title: 'Jupyter notebooks',
          description: 'Interactive computing: cells and kernels, magics, keeping notebooks reproducible, and moving stable code into modules.',
          concepts: ['Cells, kernels and execution order', 'Magics and shell commands', 'Reproducibility habits', 'From notebook to module'],
          quiz: [
            ['What is the classic notebook bug?', 'Out-of-order execution leaving stale state.'],
            ['What does %timeit do?', 'Times a statement over many runs.'],
          ],
        },
      ],
    },
    {
      title: 'Backend and Automation Applications',
      style: 'practice',
      topics: [
        {
          title: 'HTTP clients with requests and httpx',
          description: 'Calling APIs: methods, headers, query parameters, JSON bodies, timeouts, retries, sessions and handling errors and pagination.',
          concepts: ['GET, POST and headers', 'Timeouts and retries', 'Sessions and connection reuse', 'Pagination and error handling'],
          quiz: [
            ['Why always set a timeout?', 'Without one a hung server blocks your program forever.'],
            ['What does response.raise_for_status() do?', 'Raises for 4xx and 5xx responses.'],
          ],
        },
        {
          title: 'A small web API with FastAPI',
          description: 'Path operations, Pydantic models for validation, dependency injection, automatic docs, and running with uvicorn.',
          concepts: ['Path operations and parameters', 'Pydantic request and response models', 'Dependencies', 'Running and docs'],
          quiz: [
            ['What validates the request body in FastAPI?', 'A Pydantic model declared as a parameter.'],
            ['Where are the interactive docs?', '/docs (Swagger UI) and /redoc.'],
          ],
        },
        {
          title: 'Scripting and automation',
          description: 'Automating files, folders and processes: shutil and pathlib, subprocess pipelines, environment variables, scheduling with cron or schedule, and idempotent scripts.',
          concepts: ['File and folder automation', 'subprocess pipelines', 'Environment and configuration', 'Idempotent, rerunnable scripts'],
          quiz: [
            ['What does shutil.copytree do?', 'Copies a whole directory tree.'],
            ['Why make scripts idempotent?', 'Re-running after a failure must not duplicate or corrupt work.'],
          ],
        },
        {
          title: 'Databases with sqlite3 and SQLAlchemy',
          description: 'Parameterised queries with sqlite3, transactions, and SQLAlchemy Core and ORM for models, sessions and migrations with Alembic.',
          concepts: ['sqlite3 and parameterised queries', 'Transactions and context managers', 'SQLAlchemy models and sessions', 'Alembic migrations'],
          quiz: [
            ['Why use ? placeholders instead of f-strings in SQL?', 'To prevent SQL injection and handle quoting.'],
            ['What does a SQLAlchemy session represent?', 'A unit of work with an identity map and a transaction.'],
          ],
        },
        {
          title: 'Task queues and background jobs',
          description: 'Moving slow work off the request path with Celery or RQ, brokers like Redis, retries, idempotent tasks and monitoring.',
          concepts: ['Why background jobs', 'Celery or RQ basics', 'Retries and idempotency', 'Monitoring queues'],
          quiz: [
            ['What does a broker do?', 'Holds queued tasks until a worker picks them up.'],
            ['Why must tasks be idempotent?', 'Retries may run the same task twice.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: command-line task manager',
          description: 'Build a todo CLI with argparse subcommands, JSON storage in the user home, list filtering and pytest coverage, then package it with an entry point.',
          concepts: ['Design the commands and storage', 'Implement add, list, done, remove', 'Test with tmp_path fixtures', 'Package with an entry point'],
          quiz: [
            ['Where should user data live?', 'A per-user directory such as ~/.taskcli, not the working directory.'],
            ['How do you test file-writing code?', 'Point it at a tmp_path fixture.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: web scraper with a report',
          description: 'Fetch pages politely with httpx, parse with BeautifulSoup, store results in SQLite, and produce a CSV and a matplotlib chart, respecting robots.txt.',
          concepts: ['Fetch with rate limiting', 'Parse and normalise records', 'Store and deduplicate', 'Report as CSV and chart'],
          quiz: [
            ['How do you avoid hammering a site?', 'Delay between requests and respect robots.txt.'],
            ['Why store raw HTML too?', 'To re-parse later without refetching.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: REST API with tests and Docker',
          description: 'A FastAPI service with SQLAlchemy models, Alembic migrations, pytest integration tests against a test database, and a multi-stage Dockerfile.',
          concepts: ['Model the domain and endpoints', 'Migrations and settings', 'Integration tests', 'Containerise and run'],
          quiz: [
            ['Why a multi-stage Dockerfile?', 'A slim runtime image without build tools.'],
            ['How do integration tests get a clean database?', 'Create it per test session and roll back per test.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: data cleaning pipeline',
          description: 'Load messy CSVs with pandas, fix types, dedupe, handle missing values, validate with assertions, and write Parquet plus a summary report, all rerunnable.',
          concepts: ['Profile the raw data', 'Clean and validate', 'Write typed outputs', 'Make it rerunnable'],
          quiz: [
            ['What makes a pipeline rerunnable?', 'Deterministic steps that overwrite outputs and never depend on prior state.'],
            ['Why validate after cleaning?', 'To fail loudly when assumptions break instead of producing wrong data.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: async web crawler',
          description: 'Crawl a site concurrently with asyncio and httpx, bound concurrency with a semaphore, track visited URLs, handle errors and timeouts, and export a link graph.',
          concepts: ['Frontier and visited set', 'Bounded concurrency', 'Error handling and retries', 'Export and analyse'],
          quiz: [
            ['How do you stop revisiting pages?', 'Normalise URLs and keep a visited set.'],
            ['Why bound concurrency?', 'To respect the server and avoid exhausting sockets.'],
          ],
          style: 'project',
        },
        {
          title: 'Python interview questions',
          description: 'The questions that keep coming up: mutability and default args, GIL, generators versus lists, decorators, copy semantics, dunder methods and how Python compares to other languages.',
          concepts: ['Language model questions', 'Concurrency questions', 'OOP and protocol questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Explain why a mutable default argument is shared.', 'Defaults are evaluated once at definition time.'],
            ['What is the difference between a list and a generator?', 'A list stores all items; a generator produces them lazily.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Python',
          description: 'Solving problems fast in Python: reading input, collections tricks, sorting with keys, heapq and bisect, string building, and avoiding hidden O(n) operations.',
          concepts: ['Fast input and output', 'heapq and bisect', 'Idiomatic helpers for interviews', 'Hidden complexity traps'],
          quiz: [
            ['What is the cost of x in list?', 'O(n); use a set for O(1).'],
            ['How do you get the k smallest items?', 'heapq.nsmallest(k, items).'],
          ],
        },
      ],
    },
  ],
})
