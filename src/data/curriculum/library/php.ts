import { defineTrack } from '../define'

export const php = defineTrack({
  id: 'track-php',
  title: 'PHP',
  description: 'Modern PHP 8 for web backends: strict types, enums, attributes and match, Composer and PSR autoloading, sessions and forms, PDO with prepared statements, XSS, CSRF and injection defences, PHPUnit, a Laravel overview, buildable projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🐘',
  tags: ['php', 'web', 'backend', 'composer', 'pdo', 'phpunit', 'laravel'],
  languages: ['PHP'],
  explainMode: 'concept',
  code: { label: 'PHP', id: 'php', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A current PHP interpreter, Composer and the built-in server, so every example runs locally.',
      topics: [
        {
          title: 'Installing PHP 8 and the CLI',
          description: 'Installing a current PHP with the extensions web work needs (mbstring, pdo, curl, intl), checking php -v and php -m, php.ini settings that matter, and the difference between CLI and web SAPIs.',
          concepts: ['Installing PHP and extensions', 'php -v, php -m and php -i', 'php.ini and error_reporting', 'CLI versus web SAPI'],
          quiz: [
            ['How do you list loaded extensions?', 'php -m'],
            ['Which setting should be on in development and off in production?', 'display_errors'],
            ['What does the CLI SAPI never have?', 'Superglobals populated by an HTTP request such as $_GET and $_POST.'],
          ],
        },
        {
          title: 'The built-in server and running scripts',
          description: 'Running php file.php, reading arguments from $argv, serving a directory with php -S localhost:8000 for development, and using a router script for clean URLs.',
          concepts: ['Running scripts and $argv', 'php -S development server', 'Router scripts', 'Reading STDIN'],
          quiz: [
            ['Is php -S suitable for production?', 'No, it is single-threaded and meant for development only.'],
            ['What is $argv[0]?', 'The script name.'],
          ],
          prereqs: ['Installing PHP 8 and the CLI'],
        },
        {
          title: 'Composer and autoloading',
          description: 'Composer manages dependencies through composer.json and composer.lock, generates a PSR-4 autoloader so classes load by namespace, and separates require from require-dev.',
          concepts: ['composer.json and composer.lock', 'composer require and update', 'PSR-4 autoload mapping', 'vendor/autoload.php', 'require versus require-dev'],
          quiz: [
            ['Should composer.lock be committed?', 'Yes for applications, so every install resolves the same versions.'],
            ['What does "App\\\\": "src/" in autoload psr-4 mean?', 'Classes in the App namespace live under src/ mirroring the namespace path.'],
            ['Difference between composer install and composer update?', 'install obeys the lock file; update resolves new versions and rewrites it.'],
          ],
          prereqs: ['Installing PHP 8 and the CLI'],
        },
        {
          title: 'PSR standards and coding style',
          description: 'What the PHP-FIG PSRs standardise: PSR-1 and PSR-12 coding style, PSR-4 autoloading, PSR-3 logging, PSR-7 and PSR-15 HTTP, and enforcing style with PHP CS Fixer or PHP_CodeSniffer.',
          concepts: ['PSR-1 and PSR-12 style', 'PSR-3 logger interface', 'PSR-7 and PSR-15 HTTP interfaces', 'PHP CS Fixer and PHP_CodeSniffer'],
          quiz: [
            ['Which PSR defines the LoggerInterface?', 'PSR-3'],
            ['Why code against PSR-7 request objects?', 'Any compliant framework or library can interoperate.'],
          ],
        },
        {
          title: 'Static analysis with PHPStan and Psalm',
          description: 'PHP is dynamically typed, so PHPStan or Psalm catch type mistakes before runtime; levels, baseline files, phpdoc generics like array<int, User>, and running analysis in CI.',
          concepts: ['PHPStan levels', 'Baseline files', 'phpdoc array shapes and generics', 'Analysis in CI'],
          quiz: [
            ['What is a baseline file for?', 'Recording existing errors so only new ones fail the build.'],
            ['What does @param list<string> $names express?', 'A zero-indexed sequential array of strings.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Program Structure',
      topics: [
        {
          title: 'PHP tags, statements and strict types',
          description: 'How <?php starts code, why files with only PHP omit the closing tag, statements and semicolons, comments, and declare(strict_types=1) to stop silent scalar coercion.',
          concepts: ['Opening tag and omitted closing tag', 'Statements and comments', 'declare(strict_types=1)', 'echo, print and output'],
          quiz: [
            ['Why omit the closing ?> tag?', 'Trailing whitespace after it is sent as output and can break headers.'],
            ['What does strict_types=1 change?', 'Scalar type declarations are enforced for calls made from that file instead of coerced.'],
          ],
        },
        {
          title: 'Variables, scalars and type juggling',
          description: 'Dollar-prefixed variables, int, float, string, bool and null, how loose comparison converts types, the saner comparisons of PHP 8, and casting explicitly.',
          concepts: ['Variables and assignment', 'Scalar types and null', 'Type juggling and PHP 8 comparisons', 'Explicit casts', 'var_dump and gettype'],
          quiz: [
            ['What is 0 == "a" in PHP 8?', 'false; PHP 8 compares a number to a non-numeric string as strings.'],
            ['What does (int) "12abc" give?', '12'],
          ],
          prereqs: ['PHP tags, statements and strict types'],
        },
        {
          title: 'Constants and enums',
          description: 'const and define for constants, class constants, and PHP 8.1 enums: pure and backed enums, cases, methods, interfaces on enums, and from and tryFrom for parsing values.',
          concepts: ['const and define', 'Class constants and final', 'Pure and backed enums', 'Enum methods and interfaces', 'from and tryFrom'],
          quiz: [
            ['What does Status::tryFrom("x") return when no case matches?', 'null, whereas from throws ValueError.'],
            ['Can enum cases have state?', 'No, cases are singletons without properties.'],
          ],
        },
        {
          title: 'Operators and expressions',
          description: 'Arithmetic and string concatenation with a dot, strict === versus loose ==, the spaceship <=>, null coalescing ?? and ??=, nullsafe ?->, and the ternary and its short form.',
          concepts: ['Concatenation and arithmetic', '=== versus ==', 'Spaceship operator', 'Null coalescing and nullsafe operators', 'Ternary and short ternary'],
          quiz: [
            ['What does $user?->address?->city give when $user is null?', 'null, without an error.'],
            ['What does 1 <=> 2 return?', '-1'],
          ],
          prereqs: ['Variables, scalars and type juggling'],
        },
        {
          title: 'Conditions, match and loops',
          description: 'if/elseif/else, switch with its loose comparison, the strict match expression that returns a value and throws on no match, for, foreach with keys and references, while and do-while.',
          concepts: ['if and elseif', 'switch versus match', 'foreach with keys and references', 'for, while and do-while', 'break and continue with levels'],
          quiz: [
            ['How does match differ from switch?', 'match uses strict comparison, returns a value and throws UnhandledMatchError when nothing matches.'],
            ['What bug follows foreach ($a as &$v)?', 'The reference to the last element persists unless you unset($v).'],
          ],
          prereqs: ['Operators and expressions'],
        },
      ],
    },
    {
      title: 'Functions',
      topics: [
        {
          title: 'Defining functions and type declarations',
          description: 'Parameters and return types, nullable and union types, default values, named arguments, variadics with ..., and passing by reference.',
          concepts: ['Parameter and return types', 'Nullable and union types', 'Default values and named arguments', 'Variadics and spread', 'Pass by reference'],
          quiz: [
            ['What does function f(?int $x): void accept?', 'An int or null.'],
            ['How do you call f(b: 2, a: 1)?', 'With named arguments in any order.'],
          ],
        },
        {
          title: 'Closures, arrow functions and callables',
          description: 'Anonymous functions capturing with use, arrow functions that capture by value automatically, the callable type and first-class callable syntax, and Closure::fromCallable and bind.',
          concepts: ['Anonymous functions and use', 'Arrow functions', 'callable and first-class callable syntax', 'Closure binding'],
          quiz: [
            ['How does an arrow function capture variables?', 'By value, automatically, from the enclosing scope.'],
            ['What does strlen(...) produce?', 'A Closure wrapping strlen (first-class callable syntax).'],
          ],
          prereqs: ['Defining functions and type declarations'],
        },
        {
          title: 'Higher-order array functions',
          description: 'array_map, array_filter, array_reduce, usort with callbacks, array_walk, and why preserving keys matters when filtering.',
          concepts: ['array_map and array_filter', 'array_reduce', 'usort and uasort', 'Key preservation pitfalls'],
          quiz: [
            ['Does array_filter reindex the array?', 'No, it keeps keys; use array_values to reindex.'],
            ['What does array_map return when given two arrays?', 'An array of results with elements paired by position.'],
          ],
          prereqs: ['Closures, arrow functions and callables'],
        },
        {
          title: 'Scope, static variables and recursion',
          description: 'Function scope with no access to outer variables unless imported, static locals that persist between calls, the global keyword and why to avoid it, and recursion limits.',
          concepts: ['Function scope', 'static local variables', 'global and why to avoid it', 'Recursive functions'],
          quiz: [
            ['Can a function read a variable defined outside it?', 'Not without global or a closure use clause.'],
            ['What does a static local variable do?', 'Keeps its value across calls to the same function.'],
          ],
        },
      ],
    },
    {
      title: 'Arrays and Data Structures',
      topics: [
        {
          title: 'Arrays as ordered maps',
          description: 'A PHP array is an ordered hash map that serves as list, dictionary and stack; integer and string keys, nested arrays, short syntax and destructuring.',
          concepts: ['Indexed and associative arrays', 'Nested arrays', 'Array destructuring', 'Key casting rules'],
          quiz: [
            ['What key does "1" become in an array?', 'The integer 1.'],
            ['What does [$a, $b] = [1, 2]; do?', 'Destructures into $a = 1 and $b = 2.'],
          ],
        },
        {
          title: 'Array functions toolbox',
          description: 'Counting, searching, slicing and merging: count, in_array, array_search, array_slice, array_splice, array_merge versus the + operator, array_keys, array_column and array_unique.',
          concepts: ['in_array and array_search', 'array_slice and array_splice', 'array_merge versus +', 'array_column and array_combine', 'array_unique and array_flip'],
          quiz: [
            ['Why pass true as the third argument to in_array?', 'Strict comparison avoids matches like "abc" == 0 surprises.'],
            ['Difference between array_merge and + for string keys?', 'array_merge lets the right side overwrite; + keeps the left side.'],
          ],
          prereqs: ['Arrays as ordered maps'],
        },
        {
          title: 'Sorting arrays',
          description: 'sort, rsort, asort, ksort and their u-variants, sort flags, stability since PHP 8, and multi-key sorting with the spaceship operator.',
          concepts: ['sort, asort and ksort', 'Sort flags', 'Multi-key sorting with <=>', 'Stable sorting'],
          quiz: [
            ['Which function sorts by value but keeps keys?', 'asort'],
            ['Is sort stable in PHP 8?', 'Yes.'],
          ],
          prereqs: ['Array functions toolbox'],
        },
        {
          title: 'SPL data structures and iterators',
          description: 'SplStack, SplQueue, SplObjectStorage, ArrayObject and the Iterator, IteratorAggregate and Countable interfaces that let objects work with foreach and count.',
          concepts: ['SplStack and SplQueue', 'SplObjectStorage', 'Iterator and IteratorAggregate', 'Countable and ArrayAccess'],
          quiz: [
            ['What must a class implement to work with foreach?', 'Iterator or IteratorAggregate.'],
            ['What does SplObjectStorage key on?', 'Object identity.'],
          ],
        },
        {
          title: 'Generators and lazy iteration',
          description: 'Functions with yield produce values one at a time, yield with keys, yield from delegation, sending values in, and processing large files or result sets in constant memory.',
          concepts: ['yield and Generator objects', 'yield key => value', 'yield from', 'Generators for large datasets'],
          quiz: [
            ['Can you rewind a generator after iterating?', 'No, it throws an exception once past the first yield.'],
            ['Why use a generator to read a large CSV?', 'Only one row is in memory at a time.'],
          ],
        },
      ],
    },
    {
      title: 'Strings and Text Processing',
      topics: [
        {
          title: 'String literals and interpolation',
          description: 'Single versus double quotes, escape sequences, interpolating variables and expressions with braces, heredoc and nowdoc, and sprintf and number_format.',
          concepts: ['Single versus double quotes', 'Interpolation and braces', 'Heredoc and nowdoc', 'sprintf and number_format'],
          quiz: [
            ['Does \'Hello $name\' interpolate?', 'No, single quotes are literal.'],
            ['Difference between heredoc and nowdoc?', 'Heredoc interpolates; nowdoc (<<<\'EOT\') does not.'],
          ],
        },
        {
          title: 'String functions and multibyte text',
          description: 'strlen, substr, strpos, str_contains, str_replace, trim, explode and implode, and why mbstring functions like mb_strlen are required for UTF-8 text.',
          concepts: ['Search and replace functions', 'explode and implode', 'trim and case functions', 'mb_* functions for UTF-8', 'str_contains, str_starts_with, str_ends_with'],
          quiz: [
            ['What does strlen("é") return?', '2, because it counts bytes; mb_strlen returns 1.'],
            ['What does strpos return when not found?', 'false, so compare with === false.'],
          ],
          prereqs: ['String literals and interpolation'],
        },
        {
          title: 'Regular expressions with PCRE',
          description: 'preg_match, preg_match_all, preg_replace and preg_split, delimiters and modifiers, named groups, preg_replace_callback and the u modifier for Unicode.',
          concepts: ['preg_match and preg_match_all', 'Delimiters and modifiers', 'Named groups', 'preg_replace_callback', 'preg_quote'],
          quiz: [
            ['What does the u modifier do?', 'Treats pattern and subject as UTF-8.'],
            ['Why use preg_quote?', 'To escape user input placed inside a pattern.'],
          ],
        },
        {
          title: 'Dates and times',
          description: 'DateTimeImmutable over DateTime, DateTimeZone, formatting and parsing with format and createFromFormat, DateInterval and DatePeriod arithmetic, and storing UTC.',
          concepts: ['DateTimeImmutable versus DateTime', 'Formatting and createFromFormat', 'Time zones', 'DateInterval and DatePeriod'],
          quiz: [
            ['Why prefer DateTimeImmutable?', 'modify() returns a new object instead of mutating a shared one.'],
            ['Which format character gives a four-digit year?', 'Y'],
          ],
        },
        {
          title: 'JSON and serialisation',
          description: 'json_encode and json_decode with flags like JSON_THROW_ON_ERROR, objects versus associative arrays, JsonSerializable, and why unserialize on untrusted input is dangerous.',
          concepts: ['json_encode flags', 'json_decode to arrays or objects', 'JsonSerializable', 'serialize and its risks'],
          quiz: [
            ['How do you get an array instead of stdClass from json_decode?', 'Pass true as the second argument.'],
            ['Why avoid unserialize on user input?', 'It can instantiate arbitrary classes and trigger object injection.'],
          ],
        },
      ],
    },
    {
      title: 'Errors and Exceptions',
      topics: [
        {
          title: 'Errors, warnings and the Error hierarchy',
          description: 'Notices, warnings and fatal errors, how PHP 8 turned many into thrown Error objects, TypeError and ValueError, error_reporting and converting warnings with set_error_handler.',
          concepts: ['Error levels and error_reporting', 'Throwable, Error and Exception', 'TypeError and ValueError', 'set_error_handler'],
          quiz: [
            ['What is the common parent of Error and Exception?', 'Throwable.'],
            ['What does calling a method on null throw in PHP 8?', 'An Error.'],
          ],
        },
        {
          title: 'try, catch, finally and custom exceptions',
          description: 'Catching specific classes, multiple types with |, finally for cleanup, chaining with the previous argument, and designing a small exception hierarchy per module.',
          concepts: ['Catching specific exceptions', 'Multi-catch with |', 'finally', 'Exception chaining with previous', 'Domain exception classes'],
          quiz: [
            ['How do you catch two types in one block?', 'catch (TypeError | ValueError $e)'],
            ['Why pass $previous when rethrowing?', 'To keep the original cause in the chain for debugging.'],
          ],
          prereqs: ['Errors, warnings and the Error hierarchy'],
        },
        {
          title: 'Logging with PSR-3 and Monolog',
          description: 'Logging to files, stderr and services with Monolog, log levels, context arrays, handlers and processors, and never logging secrets or full request bodies.',
          concepts: ['LoggerInterface levels', 'Monolog handlers and processors', 'Context arrays', 'What not to log'],
          quiz: [
            ['What does the context array in $logger->info("User {id}", ["id" => 5]) do?', 'Fills placeholders and attaches structured data.'],
            ['Which level for a caught but recoverable failure?', 'warning or error depending on impact.'],
          ],
        },
        {
          title: 'Debugging with Xdebug and var_dump',
          description: 'var_dump, print_r and dd-style helpers, step debugging with Xdebug in the editor, breakpoints in web requests, and reading stack traces in error pages.',
          concepts: ['var_dump and print_r', 'Xdebug setup and breakpoints', 'Debugging web requests', 'Reading stack traces'],
          quiz: [
            ['What environment variable or cookie triggers an Xdebug session?', 'XDEBUG_SESSION (as a cookie, GET parameter or env var).'],
            ['Difference between var_dump and print_r?', 'var_dump shows types and lengths; print_r prints a readable structure.'],
          ],
        },
      ],
    },
    {
      title: 'Object-Oriented PHP',
      topics: [
        {
          title: 'Classes, properties and constructors',
          description: 'Typed properties, visibility, constructor property promotion, readonly properties and classes, static members, and the new in initialisers feature.',
          concepts: ['Typed properties and visibility', 'Constructor property promotion', 'readonly properties', 'Static properties and methods', 'Named constructors'],
          quiz: [
            ['What does public function __construct(private int $id) {} do?', 'Declares and assigns a private property in one step.'],
            ['Can a readonly property be reassigned?', 'No, only initialised once from inside the class.'],
          ],
        },
        {
          title: 'Inheritance, abstract classes and interfaces',
          description: 'extends and parent::, abstract methods, final, interfaces and constants in interfaces, instanceof, and covariant return and contravariant parameter types.',
          concepts: ['extends and parent::', 'Abstract classes', 'Interfaces and instanceof', 'final classes and methods', 'Covariance and contravariance'],
          quiz: [
            ['Can a class implement several interfaces?', 'Yes, but extend only one class.'],
            ['What does covariant return mean?', 'A child method may return a narrower type than the parent declares.'],
          ],
          prereqs: ['Classes, properties and constructors'],
        },
        {
          title: 'Traits',
          description: 'Horizontal reuse by mixing methods into classes, abstract and static members in traits, resolving conflicts with insteadof and as, and when a trait hides a design problem.',
          concepts: ['Declaring and using traits', 'Conflict resolution with insteadof', 'Abstract methods in traits', 'Traits versus composition'],
          quiz: [
            ['What happens when two traits define the same method?', 'A fatal error unless resolved with insteadof.'],
            ['Can a trait have properties?', 'Yes, and they are copied into each using class.'],
          ],
          prereqs: ['Inheritance, abstract classes and interfaces'],
        },
        {
          title: 'Magic methods and object behaviour',
          description: '__get, __set and __call for dynamic behaviour, __toString, __invoke, __clone for deep copies, and why objects are passed by handle rather than copied.',
          concepts: ['__get, __set and __call', '__toString and __invoke', '__clone and deep copies', 'Object handles and assignment'],
          quiz: [
            ['Does $b = $a copy an object?', 'No, both variables hold a handle to the same object.'],
            ['When is __call invoked?', 'When an inaccessible or undefined method is called.'],
          ],
        },
        {
          title: 'Namespaces and autoloaded classes',
          description: 'Declaring namespaces, use imports and aliases, fully qualified names, functions and constants in namespaces, and how PSR-4 maps a namespace to a file path.',
          concepts: ['namespace and use', 'Aliases and grouped imports', 'Fully qualified names', 'Namespace to path mapping'],
          quiz: [
            ['What does a leading backslash in \\strlen do?', 'Forces the global function, skipping namespace lookup.'],
            ['Where must the namespace declaration appear?', 'Before any other code except declare.'],
          ],
          prereqs: ['Composer and autoloading'],
        },
        {
          title: 'Attributes and reflection',
          description: 'PHP 8 attributes as structured metadata on classes, methods and properties, reading them with the Reflection API, and how frameworks use them for routing and validation.',
          concepts: ['Declaring attributes', 'Attribute targets and repeatable', 'ReflectionClass and getAttributes', 'Framework uses of attributes'],
          quiz: [
            ['How do you mark a class as an attribute?', 'Apply #[Attribute] to it.'],
            ['How do you read attributes at runtime?', 'ReflectionClass or ReflectionMethod getAttributes(), then newInstance().'],
          ],
        },
        {
          title: 'Dependency injection and interfaces in practice',
          description: 'Passing collaborators through constructors, coding to interfaces, a minimal PSR-11 container, and why static calls and global state make code hard to test.',
          concepts: ['Constructor injection', 'Program to interfaces', 'PSR-11 containers', 'Avoiding static and global state'],
          quiz: [
            ['Why inject a Clock interface rather than call time()?', 'Tests can control the current time.'],
            ['What does PSR-11 define?', 'ContainerInterface with get and has.'],
          ],
          prereqs: ['Inheritance, abstract classes and interfaces'],
        },
      ],
    },
    {
      title: 'Web Requests, Sessions and Forms',
      style: 'practice',
      topics: [
        {
          title: 'The request lifecycle and superglobals',
          description: 'How a web server hands a request to PHP-FPM, $_GET, $_POST, $_SERVER and $_FILES, headers with header(), status codes, and why nothing may be output before headers.',
          concepts: ['PHP-FPM and the request lifecycle', '$_GET, $_POST and $_SERVER', 'Sending headers and status codes', 'Reading raw input with php://input'],
          quiz: [
            ['Why does "headers already sent" happen?', 'Output was emitted before header() was called.'],
            ['Where is a JSON request body read from?', 'file_get_contents("php://input")'],
          ],
        },
        {
          title: 'Handling forms and validation',
          description: 'Reading POST data, the post-redirect-get pattern, filter_var and filter_input for validation, sanitising versus validating, and re-populating forms with errors.',
          concepts: ['Post-redirect-get', 'filter_var and filter_input', 'Validation versus sanitisation', 'Re-populating forms with errors'],
          quiz: [
            ['Why redirect after a successful POST?', 'Refreshing the page will not resubmit the form.'],
            ['What does filter_var($e, FILTER_VALIDATE_EMAIL) return on failure?', 'false'],
          ],
          prereqs: ['The request lifecycle and superglobals'],
        },
        {
          title: 'Sessions and cookies',
          description: 'session_start and $_SESSION, session storage and lifetime, cookie flags (HttpOnly, Secure, SameSite), regenerating the id on login, and remember-me tokens.',
          concepts: ['session_start and $_SESSION', 'Cookie flags', 'session_regenerate_id on login', 'Session storage handlers', 'Remember-me tokens'],
          quiz: [
            ['Why regenerate the session id after login?', 'To prevent session fixation.'],
            ['What does the HttpOnly flag do?', 'Stops JavaScript from reading the cookie.'],
          ],
          prereqs: ['The request lifecycle and superglobals'],
        },
        {
          title: 'File uploads',
          description: '$_FILES structure, validating size and MIME type with finfo, moving files with move_uploaded_file, storing outside the web root, and upload limits in php.ini.',
          concepts: ['$_FILES and error codes', 'MIME checks with finfo', 'move_uploaded_file', 'Storage outside the web root', 'upload_max_filesize and post_max_size'],
          quiz: [
            ['Why not trust $_FILES["f"]["type"]?', 'It is supplied by the client and can be faked.'],
            ['Where should uploaded files be stored?', 'Outside the document root, served through a controlled script.'],
          ],
          prereqs: ['Handling forms and validation'],
        },
        {
          title: 'Templating and output escaping',
          description: 'Separating logic from HTML, alternative syntax for templates, htmlspecialchars with ENT_QUOTES and UTF-8, escaping contexts (HTML, attribute, JS, URL), and Twig as a safer default.',
          concepts: ['Alternative syntax in templates', 'htmlspecialchars and contexts', 'Escaping for attributes, JS and URLs', 'Twig auto-escaping'],
          quiz: [
            ['What is the correct call to escape HTML text?', 'htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, "UTF-8")'],
            ['Does htmlspecialchars make a value safe inside a script tag?', 'No, JavaScript context needs JSON encoding with the right flags.'],
          ],
        },
      ],
    },
    {
      title: 'Databases with PDO',
      topics: [
        {
          title: 'Connecting with PDO',
          description: 'DSNs for MySQL, PostgreSQL and SQLite, PDO options like ERRMODE_EXCEPTION and default fetch mode, persistent connections, and keeping credentials in the environment.',
          concepts: ['DSN strings', 'PDO::ATTR_ERRMODE and fetch mode', 'Connection options', 'Credentials from the environment'],
          quiz: [
            ['Why set PDO::ERRMODE_EXCEPTION?', 'Failures throw PDOException instead of silently returning false.'],
            ['What DSN connects to a local SQLite file?', 'sqlite:/path/to/db.sqlite'],
          ],
        },
        {
          title: 'Prepared statements and binding',
          description: 'prepare and execute with named or positional placeholders, bindValue types, why prepared statements prevent SQL injection, and the cases placeholders cannot cover such as identifiers and IN lists.',
          concepts: ['prepare and execute', 'Named and positional placeholders', 'bindValue and parameter types', 'Placeholders and IN lists', 'Emulated versus native prepares'],
          quiz: [
            ['Can a placeholder stand in for a table name?', 'No, identifiers must be whitelisted in code.'],
            ['How do you bind a list for IN (...)?', 'Generate one placeholder per value.'],
          ],
          prereqs: ['Connecting with PDO'],
        },
        {
          title: 'Fetching results and transactions',
          description: 'fetch, fetchAll and fetchColumn with FETCH_ASSOC and FETCH_CLASS, iterating large result sets, lastInsertId, and beginTransaction, commit and rollBack around multi-statement work.',
          concepts: ['fetch modes', 'Streaming large results', 'lastInsertId', 'Transactions and rollback'],
          quiz: [
            ['What does PDO::FETCH_CLASS do?', 'Hydrates each row into an instance of the given class.'],
            ['When must you call rollBack?', 'In the catch block when any statement in the transaction fails.'],
          ],
          prereqs: ['Prepared statements and binding'],
        },
        {
          title: 'Repositories and migrations',
          description: 'Wrapping queries in repository classes, mapping rows to typed objects, versioned schema migrations with Phinx or Doctrine Migrations, and seeding; SQL itself lives in the SQL track.',
          concepts: ['Repository classes', 'Row to object mapping', 'Migration tools', 'Seed data'],
          quiz: [
            ['Why put queries in a repository?', 'Callers depend on an interface, so storage can be swapped and tested.'],
            ['What does a migration tool track?', 'Which schema versions have been applied to each database.'],
          ],
          prereqs: ['Fetching results and transactions'],
        },
      ],
    },
    {
      title: 'Security',
      topics: [
        {
          title: 'Cross-site scripting defences',
          description: 'How XSS happens when untrusted data reaches HTML, attributes, scripts or URLs unescaped, context-aware escaping, Content Security Policy headers, and safe handling of rich text.',
          concepts: ['Reflected, stored and DOM XSS', 'Context-aware escaping', 'Content Security Policy', 'Sanitising rich text'],
          quiz: [
            ['What is the primary XSS defence?', 'Escape output for the exact context it is inserted into.'],
            ['What does a CSP header do?', 'Restricts which scripts and resources the browser may run.'],
          ],
          prereqs: ['Templating and output escaping'],
        },
        {
          title: 'CSRF protection',
          description: 'Why a browser sends cookies on cross-site requests, synchroniser tokens in forms, SameSite cookies, checking Origin headers, and making state changes POST-only.',
          concepts: ['How CSRF works', 'Synchroniser tokens', 'SameSite cookies', 'Origin checks and POST-only changes'],
          quiz: [
            ['Where does a CSRF token live?', 'In the session and as a hidden form field, compared on submit.'],
            ['Does SameSite=Lax block all CSRF?', 'No, top-level GET navigations still send the cookie.'],
          ],
          prereqs: ['Sessions and cookies'],
        },
        {
          title: 'Injection beyond SQL',
          description: 'Command injection through exec and shell_exec, path traversal in file paths, LDAP and header injection, escapeshellarg, realpath checks and allow-lists.',
          concepts: ['Command injection and escapeshellarg', 'Path traversal and realpath', 'Header injection', 'Allow-lists over deny-lists'],
          quiz: [
            ['How do you safely pass user input to a shell command?', 'Wrap it with escapeshellarg, or avoid the shell entirely.'],
            ['How do you stop ../ in a file name?', 'Resolve with realpath and confirm it stays under the allowed directory.'],
          ],
          prereqs: ['Prepared statements and binding'],
        },
        {
          title: 'Password hashing and authentication',
          description: 'password_hash with bcrypt or Argon2id, password_verify and password_needs_rehash, rate limiting logins, secure random tokens with random_bytes, and timing-safe comparison.',
          concepts: ['password_hash and password_verify', 'password_needs_rehash', 'random_bytes and bin2hex', 'hash_equals', 'Login rate limiting'],
          quiz: [
            ['Why not store a SHA-256 of the password?', 'It is fast to brute force and unsalted; password_hash adds salt and cost.'],
            ['Why use hash_equals for tokens?', 'It compares in constant time, defeating timing attacks.'],
          ],
        },
        {
          title: 'Configuration and deployment hardening',
          description: 'Secrets in environment variables, disabling display_errors and expose_php in production, open_basedir, keeping vendor and .env outside the web root, and HTTPS everywhere.',
          concepts: ['Environment variables for secrets', 'Production php.ini settings', 'Web root layout', 'HTTPS and secure headers'],
          quiz: [
            ['Which folder should be the web root?', 'A public/ folder containing only index.php and assets.'],
            ['Why disable expose_php?', 'It stops the PHP version from leaking in headers.'],
          ],
        },
      ],
    },
    {
      title: 'Testing and Quality',
      topics: [
        {
          title: 'PHPUnit basics',
          description: 'Test classes and methods, assertions, phpunit.xml configuration, running a filtered subset, and reading failures with diffs.',
          concepts: ['Test cases and assertions', 'phpunit.xml configuration', 'Running and filtering tests', 'Reading failure output'],
          quiz: [
            ['How does PHPUnit find test methods?', 'Public methods prefixed with test or marked with the Test attribute.'],
            ['How do you run one test class?', 'vendor/bin/phpunit --filter UserTest'],
          ],
        },
        {
          title: 'Data providers, fixtures and mocks',
          description: 'Table-driven tests with data providers, setUp and tearDown, mocking interfaces with createMock and expectations, and testing exceptions with expectException.',
          concepts: ['Data providers', 'setUp and tearDown', 'createMock and expectations', 'expectException'],
          quiz: [
            ['What does a data provider return?', 'An array or iterable of argument sets, one per test run.'],
            ['What does $mock->expects($this->once()) verify?', 'The method is called exactly once.'],
          ],
          prereqs: ['PHPUnit basics'],
        },
        {
          title: 'Testing database and HTTP code',
          description: 'Integration tests against SQLite in memory, transactions rolled back per test, testing handlers through PSR-7 requests, and separating fast unit suites from slower integration suites.',
          concepts: ['In-memory SQLite for tests', 'Rollback per test', 'Testing through PSR-7 requests', 'Unit versus integration suites'],
          quiz: [
            ['Why wrap each test in a transaction?', 'Rolling back restores a clean database quickly.'],
            ['How do you test a handler without a web server?', 'Build a PSR-7 ServerRequest and call the handler directly.'],
          ],
          prereqs: ['Data providers, fixtures and mocks'],
        },
        {
          title: 'Performance and OPcache',
          description: 'How OPcache removes recompilation, preloading, profiling with Xdebug or Blackfire, avoiding N+1 queries, caching with APCu or Redis, and the PHP 8 JIT in perspective.',
          concepts: ['OPcache and preloading', 'Profiling requests', 'N+1 queries and caching', 'APCu and Redis', 'JIT expectations'],
          quiz: [
            ['What does OPcache store?', 'Compiled opcodes so scripts are not re-parsed on each request.'],
            ['Does the JIT speed up typical web apps much?', 'Little; they are I/O-bound, so JIT helps CPU-heavy code more.'],
          ],
        },
      ],
    },
    {
      title: 'Laravel Overview',
      description: 'How the most common PHP framework organises an application; the full framework has its own track (Laravel).',
      style: 'practice',
      topics: [
        {
          title: 'Laravel project structure and Artisan',
          description: 'Creating an app with the installer or Composer, the app, routes, config and resources folders, .env configuration, and Artisan commands for generating code and serving.',
          concepts: ['Creating a Laravel project', 'Folder layout', '.env and config', 'Artisan commands'],
          quiz: [
            ['Which command creates a controller?', 'php artisan make:controller NameController'],
            ['Where do environment-specific values live?', 'In .env, read through config files.'],
          ],
        },
        {
          title: 'Routing, controllers and Blade',
          description: 'Defining routes with parameters and middleware, controllers and route model binding, and Blade templates with layouts, components and automatic escaping.',
          concepts: ['Route definitions and parameters', 'Controllers and route model binding', 'Blade layouts and components', 'Blade escaping'],
          quiz: [
            ['What does {{ $x }} do in Blade?', 'Outputs $x with HTML escaping; {!! !!} skips escaping.'],
            ['What is route model binding?', 'Resolving a route parameter into a model instance automatically.'],
          ],
          prereqs: ['Laravel project structure and Artisan'],
        },
        {
          title: 'Eloquent ORM essentials',
          description: 'Models mapped to tables, migrations and factories, relationships like hasMany and belongsTo, eager loading with with() against N+1, and the query builder.',
          concepts: ['Models and migrations', 'Relationships', 'Eager loading', 'Query builder'],
          quiz: [
            ['How do you avoid N+1 when listing posts with authors?', 'Post::with("author")->get()'],
            ['What does a factory do?', 'Generates model instances with fake data for tests and seeds.'],
          ],
          prereqs: ['Routing, controllers and Blade'],
        },
        {
          title: 'Validation, auth and queues at a glance',
          description: 'Form requests and validation rules, built-in authentication scaffolding and middleware, and queued jobs for slow work; each is covered in depth in the Laravel track.',
          concepts: ['Form request validation', 'Authentication middleware', 'Queued jobs'],
          quiz: [
            ['What does a FormRequest class do?', 'Authorises and validates the request before the controller runs.'],
            ['Why push email sending to a queue?', 'The response returns immediately while a worker sends it.'],
          ],
          prereqs: ['Routing, controllers and Blade'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: CLI link checker',
          description: 'Build a Composer-packaged command that reads URLs from a file or STDIN, fetches them concurrently with curl_multi, reports status codes and redirects, and exits non-zero on failures, with PHPUnit tests.',
          concepts: ['Set up the Composer package', 'Parse input and options', 'Fetch with curl_multi', 'Report and exit codes', 'Test the parser and reporter'],
          quiz: [
            ['How does a Composer package expose a command?', 'Through the bin entry in composer.json.'],
            ['What exit code signals failure?', 'Any non-zero value.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: guestbook with sessions and PDO',
          description: 'A small site with a form that validates input, stores entries via prepared statements in SQLite, paginates them, escapes output, protects against CSRF and keeps a login session for moderation.',
          concepts: ['Design the schema and migrations', 'Form handling with PRG', 'Store and paginate with PDO', 'CSRF and escaping', 'Moderator login'],
          quiz: [
            ['Where does the CSRF token get verified?', 'On every POST before touching the database.'],
            ['How do you paginate with PDO?', 'LIMIT and OFFSET bound as integers.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: JSON REST API with routing',
          description: 'A dependency-free API with a front controller, a router, PSR-style request and response objects, a repository over PDO, token authentication, and integration tests.',
          concepts: ['Front controller and router', 'Request and response objects', 'Repository and validation', 'Token authentication', 'Integration tests'],
          quiz: [
            ['What is a front controller?', 'A single index.php that receives every request and dispatches it.'],
            ['Which header carries a bearer token?', 'Authorization: Bearer <token>'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CSV import pipeline',
          description: 'Stream a large CSV with a generator, validate and normalise rows, upsert into a database in batched transactions, report rejects to a file, and make the job rerunnable.',
          concepts: ['Stream rows with generators', 'Validate and normalise', 'Batched transactional upserts', 'Reject reporting', 'Idempotent reruns'],
          quiz: [
            ['Why batch inserts inside transactions?', 'Fewer commits make imports many times faster.'],
            ['What makes the import idempotent?', 'Upserting on a natural key so reruns do not duplicate rows.'],
          ],
          style: 'project',
        },
        {
          title: 'PHP interview questions',
          description: 'The recurring questions: == versus ===, arrays as hash maps, references versus handles, traits versus interfaces, prepared statements, session security, generators, and what PHP 8 changed.',
          concepts: ['Language semantics questions', 'OOP design questions', 'Security questions', 'PHP 8 feature questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['How are objects passed to functions?', 'By handle: the function sees the same object, though the variable itself is copied.'],
            ['What is the difference between include and require?', 'require raises a fatal error when the file is missing; include only warns.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in PHP',
          description: 'Solving problems fast in PHP: reading STDIN, array functions as building blocks, SplPriorityQueue, string building, sorting with callbacks, and the traps of copy-on-write arrays.',
          concepts: ['Reading STDIN quickly', 'SplPriorityQueue and SplMinHeap', 'Sorting with callbacks in interviews', 'Copy-on-write arrays', 'Common complexity traps'],
          quiz: [
            ['Is in_array O(1)?', 'No, O(n); use array keys with isset for O(1) lookups.'],
            ['What does array_key_exists do that isset does not?', 'Returns true for keys whose value is null.'],
          ],
        },
      ],
    },
  ],
})
