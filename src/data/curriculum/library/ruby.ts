import { defineTrack } from '../define'

export const ruby = defineTrack({
  id: 'track-ruby',
  title: 'Ruby',
  description: 'Ruby the way Rubyists write it: everything is an object, blocks, procs and lambdas, Enumerable, modules and mixins, metaprogramming, gems and Bundler, RSpec and Minitest, concurrency with threads, Ractors and Fibers, a Rails overview, buildable projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '💎',
  tags: ['ruby', 'scripting', 'backend', 'rspec', 'bundler', 'rails', 'metaprogramming'],
  languages: ['Ruby'],
  explainMode: 'concept',
  code: { label: 'Ruby', id: 'ruby', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A version-managed Ruby, an interactive console and a project skeleton with Bundler.',
      topics: [
        {
          title: 'Installing Ruby with a version manager',
          description: 'Why projects pin a Ruby version, installing with rbenv, asdf or mise, the .ruby-version file, and checking ruby -v and gem env before anything else.',
          concepts: ['rbenv, asdf and mise', '.ruby-version files', 'ruby -v and gem env', 'Multiple Rubies side by side'],
          quiz: [
            ['What does a .ruby-version file do?', 'Tells the version manager which Ruby to activate in that directory.'],
            ['Why avoid the system Ruby on macOS?', 'It is old, needs sudo for gems and may be removed by OS updates.'],
          ],
        },
        {
          title: 'irb, ruby and the standard tools',
          description: 'Running scripts with ruby file.rb, experimenting in irb with autocompletion, ruby -e one-liners, ri for documentation, and the shebang line for executable scripts.',
          concepts: ['Running scripts and ruby -e', 'irb sessions', 'ri and documentation', 'Shebang and executable scripts'],
          quiz: [
            ['How do you look up Array#each_slice offline?', 'ri Array#each_slice'],
            ['What does ruby -ne \'puts $_ if /error/\' do?', 'Loops over stdin lines and prints those matching /error/.'],
          ],
          prereqs: ['Installing Ruby with a version manager'],
        },
        {
          title: 'Gems, Bundler and the Gemfile',
          description: 'RubyGems as the package registry, gem install versus a Gemfile, Bundler resolving and locking versions in Gemfile.lock, groups, and bundle exec to run inside the bundle.',
          concepts: ['gem install and gem list', 'Gemfile and Gemfile.lock', 'bundle install and update', 'Gemfile groups', 'bundle exec'],
          quiz: [
            ['Why run bundle exec rspec instead of rspec?', 'It loads the exact gem versions from Gemfile.lock.'],
            ['Should Gemfile.lock be committed?', 'Yes for applications; libraries usually do not.'],
            ['What does gem "rails", "~> 7.1" allow?', 'Any 7.x version at or above 7.1 but below 8.0.'],
          ],
          prereqs: ['Installing Ruby with a version manager'],
        },
        {
          title: 'RuboCop and editor setup',
          description: 'RuboCop enforces the community style guide and finds bugs, .rubocop.yml configuration, auto-correct, and editor integration through the Ruby LSP.',
          concepts: ['RuboCop cops and .rubocop.yml', 'Auto-correct with -a and -A', 'Ruby style guide conventions', 'Ruby LSP in the editor'],
          quiz: [
            ['What does rubocop -a do?', 'Applies safe auto-corrections.'],
            ['What indentation does the style guide mandate?', 'Two spaces.'],
          ],
        },
      ],
    },
    {
      title: 'Syntax and Objects',
      topics: [
        {
          title: 'Everything is an object',
          description: 'Numbers, nil, true and classes are all objects that receive messages; method calls with and without parentheses, the receiver and self, and why 1 + 2 is 1.+(2).',
          concepts: ['Objects and messages', 'self and implicit receiver', 'Optional parentheses', 'Operators as methods', 'Object#inspect and puts versus p'],
          quiz: [
            ['What is nil.class?', 'NilClass'],
            ['Difference between puts and p?', 'puts prints to_s; p prints inspect and returns the object.'],
          ],
        },
        {
          title: 'Variables, constants and naming',
          description: 'Local, instance (@), class (@@) and global ($) variables, constants that warn on reassignment, snake_case and CamelCase conventions, and predicate and bang method names.',
          concepts: ['Local and instance variables', 'Constants and reassignment warnings', 'Naming conventions', 'Predicate ? and bang ! methods'],
          quiz: [
            ['What does a method ending in ! usually signal?', 'A dangerous or mutating variant of a non-bang method.'],
            ['What does an unassigned instance variable return?', 'nil.'],
          ],
          prereqs: ['Everything is an object'],
        },
        {
          title: 'Numbers, symbols and truthiness',
          description: 'Integer with arbitrary precision, Float, Rational and BigDecimal for exactness, symbols as immutable identifiers, and the rule that only nil and false are falsy.',
          concepts: ['Integer, Float and Rational', 'BigDecimal for money', 'Symbols versus strings', 'Only nil and false are falsy'],
          quiz: [
            ['Is 0 truthy in Ruby?', 'Yes, only nil and false are falsy.'],
            ['What is 7 / 2?', '3, integer division; 7.0 / 2 gives 3.5.'],
          ],
        },
        {
          title: 'Operators, ranges and safe navigation',
          description: 'Arithmetic and comparison, the spaceship <=>, ||= for memoisation, ranges with .. and ..., the safe navigation operator &., and how everything is an expression with a value.',
          concepts: ['Spaceship <=> and Comparable', '||= and &&=', 'Ranges and endless ranges', 'Safe navigation &.', 'Everything is an expression'],
          quiz: [
            ['What does @cache ||= compute do?', 'Assigns compute only if @cache is nil or false.'],
            ['What does (1...5).to_a give?', '[1, 2, 3, 4]'],
          ],
          prereqs: ['Numbers, symbols and truthiness'],
        },
        {
          title: 'Conditions, case and loops',
          description: 'if, unless and modifier forms, case/when with === matching on classes, ranges and regexes, case/in pattern matching, while and until, and why each beats for.',
          concepts: ['if, unless and modifiers', 'case/when and ===', 'case/in pattern matching', 'while, until and loop', 'each instead of for'],
          quiz: [
            ['What does when 1..10 use to match?', 'Range#===, which checks inclusion.'],
            ['What does case {name: "a"} in {name: String => n} bind?', 'n = "a"'],
          ],
          prereqs: ['Operators, ranges and safe navigation'],
        },
      ],
    },
    {
      title: 'Methods, Blocks and Closures',
      topics: [
        {
          title: 'Defining methods and arguments',
          description: 'def with implicit return of the last expression, default, keyword and splat arguments, the double splat for options, and method visibility with private and protected.',
          concepts: ['Implicit return values', 'Positional, default and splat arguments', 'Keyword arguments and double splat', 'private and protected', 'Endless method definitions'],
          quiz: [
            ['What does def greet(name:, greeting: "Hi") require?', 'The name keyword; greeting is optional.'],
            ['Can a private method be called with an explicit receiver?', 'Only with self as the receiver (since Ruby 2.7).'],
          ],
        },
        {
          title: 'Blocks, yield and block_given?',
          description: 'Passing a block with do...end or braces, yield to call it, block_given? to make blocks optional, and how blocks make iteration and resource handling idiomatic.',
          concepts: ['do...end versus braces', 'yield and block parameters', 'block_given?', 'Blocks for resource handling', 'Explicit &block parameter'],
          quiz: [
            ['What does yield 1, 2 pass to |a, b|?', 'a = 1, b = 2.'],
            ['Why does File.open with a block close the file?', 'The method ensures close runs after yield returns or raises.'],
          ],
          prereqs: ['Defining methods and arguments'],
        },
        {
          title: 'Procs and lambdas',
          description: 'Proc.new and lambda as callable objects, the differences in argument strictness and return behaviour, the -> stabby syntax, call and the .() shorthand, and Symbol#to_proc.',
          concepts: ['Proc versus lambda', 'Stabby lambda syntax', 'Arity and return semantics', 'Symbol#to_proc and &:name', 'Currying'],
          quiz: [
            ['What does return inside a proc do?', 'Returns from the enclosing method, not just the proc.'],
            ['What does map(&:upcase) expand to?', 'map { |x| x.upcase }'],
          ],
          prereqs: ['Blocks, yield and block_given?'],
        },
        {
          title: 'Closures and scope',
          description: 'Blocks and lambdas capture the surrounding variables by reference, scope gates at def, class and module, binding objects, and the counter-generator pattern.',
          concepts: ['Capturing outer variables', 'Scope gates', 'Binding objects', 'Closures as generators'],
          quiz: [
            ['Can a def body see a local variable defined outside it?', 'No, def is a scope gate.'],
            ['What is a Binding?', 'An object capturing the variables and self at a point, usable with eval or ERB.'],
          ],
          prereqs: ['Procs and lambdas'],
        },
        {
          title: 'Method objects and functional composition',
          description: 'Turning methods into objects with method(:name), composing callables with >> and <<, then and tap for pipelines, and passing methods where blocks are expected.',
          concepts: ['method(:name) objects', 'Composition with >> and <<', 'then and tap', 'Passing methods as blocks'],
          quiz: [
            ['What does f >> g produce?', 'A callable that applies f then g.'],
            ['Difference between tap and then?', 'tap yields and returns the receiver; then returns the block result.'],
          ],
          prereqs: ['Procs and lambdas'],
        },
      ],
    },
    {
      title: 'Collections and Enumerable',
      topics: [
        {
          title: 'Arrays',
          description: 'Creating, indexing with negative offsets and ranges, push, pop, shift and unshift, flatten, compact, zip and the mutating versus non-mutating method pairs.',
          concepts: ['Indexing and slicing arrays', 'push, pop, shift and unshift', 'flatten, compact and zip', 'Bang versus non-bang methods', 'Array multiplication and %w'],
          quiz: [
            ['What does [1, 2, 3][-1] return?', '3'],
            ['What does %w[a b c] create?', '["a", "b", "c"]'],
          ],
        },
        {
          title: 'Hashes',
          description: 'Symbol keys and the shorthand syntax, fetch with defaults versus [] returning nil, default values and default procs, iteration order, and transform_values and dig.',
          concepts: ['Hash literals and symbol keys', 'fetch versus []', 'Default values and Hash.new blocks', 'dig and transform_values', 'Hash ordering'],
          quiz: [
            ['What does h.fetch(:x) do when :x is missing?', 'Raises KeyError, unlike h[:x] which returns nil.'],
            ['What is the classic bug with Hash.new([])?', 'Every key shares the same array; use Hash.new { |h, k| h[k] = [] }.'],
          ],
        },
        {
          title: 'Enumerable in depth',
          description: 'Including Enumerable by defining each, then map, select, reject, reduce, each_with_object, group_by, partition, sort_by, min_by, sum, tally and each_slice.',
          concepts: ['Defining each to get Enumerable', 'map, select and reject', 'reduce and each_with_object', 'group_by, partition and tally', 'sort_by, min_by and max_by'],
          quiz: [
            ['What does %w[a b a].tally return?', '{"a" => 2, "b" => 1}'],
            ['What must a class define to include Enumerable?', 'each.'],
          ],
          prereqs: ['Arrays', 'Hashes'],
        },
        {
          title: 'Lazy enumerators and Enumerator',
          description: 'External enumerators with next, Enumerator.new for custom sequences, lazy chains that process infinite ranges, and each_with_index and with_index chaining.',
          concepts: ['Enumerator objects and next', 'Enumerator.new with yielder', 'Lazy enumerators', 'with_index and with_object'],
          quiz: [
            ['What does (1..Float::INFINITY).lazy.map { _1 * 2 }.first(3) give?', '[2, 4, 6]'],
            ['What does an enumerator raise when exhausted by next?', 'StopIteration.'],
          ],
          prereqs: ['Enumerable in depth'],
        },
        {
          title: 'Sets, Structs and Data',
          description: 'Set for uniqueness and set algebra, Struct for quick value-like classes with accessors, Data.define for immutable value objects, and Comparable for ordering.',
          concepts: ['Set operations', 'Struct classes', 'Data.define immutable values', 'Comparable mixin'],
          quiz: [
            ['How does Data differ from Struct?', 'Data instances are immutable and take keyword or positional arguments with no setters.'],
            ['What does including Comparable and defining <=> give you?', '<, <=, ==, >, >=, between? and clamp.'],
          ],
        },
      ],
    },
    {
      title: 'Strings, Text and I/O',
      topics: [
        {
          title: 'Strings and interpolation',
          description: 'Single versus double quotes, interpolation with #{}, heredocs with <<~ for indentation stripping, frozen string literals, and mutation with << versus +=.',
          concepts: ['Quotes and interpolation', 'Squiggly heredocs', 'frozen_string_literal magic comment', '<< versus += for building strings'],
          quiz: [
            ['What does # frozen_string_literal: true do?', 'Makes every string literal in the file frozen.'],
            ['Why prefer << over += in a loop?', '<< mutates in place; += allocates a new string each time.'],
          ],
        },
        {
          title: 'String methods and formatting',
          description: 'split, strip, gsub, sub, start_with?, center and ljust, format and % for padded output, and encoding methods for bytes and UTF-8.',
          concepts: ['split, strip and gsub', 'format and % operator', 'Padding and alignment', 'Encodings and force_encoding', 'Unicode-aware methods'],
          quiz: [
            ['What does "a-b-c".split("-", 2) return?', '["a", "b-c"]'],
            ['What does format("%05.2f", 3.14159) give?', '"03.14"'],
          ],
          prereqs: ['Strings and interpolation'],
        },
        {
          title: 'Regular expressions',
          description: 'Regexp literals and =~, match and MatchData, named captures binding local variables, gsub with hashes and blocks, scan, and the special variables $~ and $1.',
          concepts: ['=~ and match?', 'MatchData and named captures', 'gsub with blocks and hashes', 'scan', 'Regexp options and interpolation'],
          quiz: [
            ['What does /(?<year>\\d{4})/ =~ "in 2024" set?', 'A local variable year = "2024".'],
            ['Why use match? instead of =~ in conditions?', 'It returns a boolean without setting $~, so it is faster.'],
          ],
        },
        {
          title: 'Files, directories and IO',
          description: 'File.read, File.write, File.foreach for streaming, File.open with blocks, Dir.glob, Pathname, FileUtils, STDIN and ARGF for scripts.',
          concepts: ['File.read, write and foreach', 'Dir.glob and Pathname', 'FileUtils', 'ARGF and STDIN'],
          quiz: [
            ['How do you process a huge file line by line?', 'File.foreach(path) { |line| ... }'],
            ['What does ARGF read?', 'Files named in ARGV, or STDIN when none are given.'],
          ],
        },
        {
          title: 'JSON, YAML and CSV',
          description: 'JSON.parse with symbolize_names and JSON.generate, YAML.safe_load for configuration, the CSV library with headers and converters, and ERB for templating text.',
          concepts: ['JSON.parse and generate', 'YAML.safe_load', 'CSV with headers and converters', 'ERB templates'],
          quiz: [
            ['Why use YAML.safe_load instead of YAML.load?', 'load can instantiate arbitrary objects from untrusted input.'],
            ['What does CSV.foreach(path, headers: true) yield?', 'CSV::Row objects addressable by column name.'],
          ],
        },
      ],
    },
    {
      title: 'Errors and Exceptions',
      topics: [
        {
          title: 'raise, rescue, ensure and retry',
          description: 'Raising with a class and message, rescue clauses ordered by specificity, ensure for cleanup, retry for transient failures, and method-level rescue without begin.',
          concepts: ['raise and exception classes', 'rescue ordering', 'ensure', 'retry with a counter', 'Method-level rescue'],
          quiz: [
            ['What does a bare rescue catch?', 'StandardError and its subclasses, not Exception.'],
            ['Why not rescue Exception?', 'It swallows Interrupt, NoMemoryError and SystemExit.'],
          ],
        },
        {
          title: 'Custom exception hierarchies',
          description: 'Subclassing StandardError, a base error per gem or app, adding data to exceptions, the cause chain, and raise versus fail conventions.',
          concepts: ['Subclassing StandardError', 'Base error per library', 'Exceptions carrying data', 'Exception#cause'],
          quiz: [
            ['What does Exception#cause hold?', 'The exception being handled when the new one was raised.'],
            ['Why give a gem its own error base class?', 'Users can rescue everything from the gem in one clause.'],
          ],
          prereqs: ['raise, rescue, ensure and retry'],
        },
        {
          title: 'catch, throw and control flow alternatives',
          description: 'catch and throw for non-error unwinding, why exceptions are slow for control flow, returning nil or result objects, and the safe navigation idiom.',
          concepts: ['catch and throw', 'Exceptions versus control flow', 'Result objects', 'nil-returning conventions'],
          quiz: [
            ['Is throw the same as raise?', 'No, throw unwinds to a matching catch without an exception.'],
            ['What do Integer("x") and Integer("x", exception: false) do?', 'The first raises ArgumentError; the second returns nil.'],
          ],
        },
        {
          title: 'Debugging with debug and pry',
          description: 'The debug gem with binding.break, stepping and inspecting, pry for a richer console, pp and inspect, warnings with -w, and reading backtraces.',
          concepts: ['binding.break and stepping', 'pry sessions', 'pp and inspect', 'ruby -w warnings', 'Reading backtraces'],
          quiz: [
            ['Which line starts the debugger in Ruby 3.1+?', 'binding.break (or the alias binding.b).'],
            ['Where is the error in a Ruby backtrace?', 'The first line; frames below show the call path.'],
          ],
        },
      ],
    },
    {
      title: 'Classes, Modules and Metaprogramming',
      topics: [
        {
          title: 'Classes, initialize and attr accessors',
          description: 'Defining classes with initialize, attr_reader, attr_writer and attr_accessor generating methods, to_s and inspect, and class methods with self.',
          concepts: ['initialize and new', 'attr_reader, attr_writer, attr_accessor', 'to_s and inspect', 'Class methods with self.', 'Equality with == and eql?'],
          quiz: [
            ['What does attr_accessor :name generate?', 'name and name= methods over @name.'],
            ['Why define eql? and hash together?', 'Hash keys and uniq rely on both agreeing.'],
          ],
        },
        {
          title: 'Inheritance and super',
          description: 'Single inheritance with <, super with and without arguments, overriding, the ancestors chain and Object and BasicObject at the top.',
          concepts: ['Subclassing with <', 'super with and without parentheses', 'Method overriding', 'ancestors and superclass'],
          quiz: [
            ['Difference between super and super()?', 'super passes the same arguments; super() passes none.'],
            ['What is at the top of every ancestors chain?', 'BasicObject.'],
          ],
          prereqs: ['Classes, initialize and attr accessors'],
        },
        {
          title: 'Modules as namespaces and mixins',
          description: 'Modules grouping constants and methods, include for instance methods, extend for singleton methods, prepend for wrapping, module_function, and where each lands in ancestors.',
          concepts: ['Modules as namespaces', 'include, extend and prepend', 'Mixins and method lookup', 'module_function', 'self.included hooks'],
          quiz: [
            ['Where does prepend place the module in ancestors?', 'Before the class, so its methods run first.'],
            ['What does extend do?', 'Adds the module methods to one object\'s singleton class.'],
          ],
          prereqs: ['Inheritance and super'],
        },
        {
          title: 'Method lookup and the singleton class',
          description: 'How Ruby resolves a message through the singleton class, prepended modules, the class, included modules and superclasses, then method_missing, plus define_method on the fly.',
          concepts: ['Singleton classes', 'Method resolution order', 'method_missing and respond_to_missing?', 'define_method'],
          quiz: [
            ['What must accompany method_missing?', 'respond_to_missing? so respond_to? stays truthful.'],
            ['What is def obj.greet defining?', 'A singleton method on that one object.'],
          ],
          prereqs: ['Modules as namespaces and mixins'],
        },
        {
          title: 'Metaprogramming techniques',
          description: 'send and public_send, instance_variable_get, class_eval and instance_eval, Module.new and Class.new, hooks like inherited and method_added, and the risks of too much magic.',
          concepts: ['send and public_send', 'class_eval and instance_eval', 'Dynamic classes with Class.new', 'Hook methods', 'Keeping magic discoverable'],
          quiz: [
            ['Difference between send and public_send?', 'send can call private methods; public_send cannot.'],
            ['What does class_eval with a block change?', 'self becomes the class, so def adds instance methods.'],
          ],
          prereqs: ['Method lookup and the singleton class'],
        },
        {
          title: 'Refinements, freeze and object identity',
          description: 'Scoped monkey patching with refine and using, freezing objects and constants, dup versus clone, object_id and equal?, and why Comparable and Enumerable are the idiomatic reuse.',
          concepts: ['Refinements versus monkey patching', 'freeze and frozen?', 'dup versus clone', 'equal?, ==, eql?'],
          quiz: [
            ['Why prefer a refinement over reopening String?', 'It applies only where using is called, not globally.'],
            ['Does clone copy frozen state?', 'Yes; dup does not.'],
          ],
        },
        {
          title: 'Duck typing and designing small objects',
          description: 'Relying on respond_to? rather than class checks, small objects with one responsibility, value objects, composition with delegation via Forwardable and SimpleDelegator.',
          concepts: ['Duck typing with respond_to?', 'Single-responsibility objects', 'Value objects', 'Forwardable and SimpleDelegator'],
          quiz: [
            ['What does def_delegators :@list, :size, :each do?', 'Forwards size and each to @list.'],
            ['Why avoid is_a? checks in Ruby?', 'They defeat duck typing and block substitutes such as test doubles.'],
          ],
          prereqs: ['Modules as namespaces and mixins'],
        },
      ],
    },
    {
      title: 'Memory and Concurrency',
      topics: [
        {
          title: 'Object allocation and garbage collection',
          description: 'Every literal and string allocates, the generational GC and compaction, ObjectSpace for counting, GC.stat, and reducing allocations with symbols, frozen literals and in-place methods.',
          concepts: ['Allocation costs', 'Generational GC and compaction', 'GC.stat and ObjectSpace', 'Reducing allocations'],
          quiz: [
            ['Are symbols garbage collected?', 'Dynamically created ones are, since Ruby 2.2.'],
            ['Which method counts live objects per class?', 'ObjectSpace.count_objects or each_object.'],
          ],
        },
        {
          title: 'Threads, the GVL and Mutex',
          description: 'Thread.new and join, the Global VM Lock allowing one thread to run Ruby code at a time, I/O releasing the lock, Mutex and Queue for coordination, and thread-safety pitfalls.',
          concepts: ['Thread.new and join', 'The Global VM Lock', 'Mutex and synchronize', 'Thread-safe Queue', 'Race conditions in Ruby'],
          quiz: [
            ['Do threads speed up CPU-bound Ruby code?', 'No, the GVL serialises Ruby execution; they help I/O-bound work.'],
            ['Is Hash thread-safe in CRuby?', 'Not guaranteed; guard writes with a Mutex.'],
          ],
        },
        {
          title: 'Fibers and the Fiber scheduler',
          description: 'Fibers as cooperative coroutines with resume and yield, how Enumerator uses them, and the Fiber scheduler interface behind async gems for non-blocking I/O.',
          concepts: ['Fiber.new, resume and yield', 'Fibers behind Enumerator', 'Fiber scheduler interface', 'The async gem'],
          quiz: [
            ['Who decides when a fiber pauses?', 'The fiber itself, by yielding; scheduling is cooperative.'],
            ['What does a Fiber scheduler enable?', 'Blocking I/O calls switch fibers instead of blocking the thread.'],
          ],
          prereqs: ['Threads, the GVL and Mutex'],
        },
        {
          title: 'Ractors and processes',
          description: 'Ractors for true parallelism with isolated object spaces and message passing, shareable objects, and fork with Process.wait for the traditional multi-process model.',
          concepts: ['Ractor.new and messaging', 'Shareable objects', 'fork and Process.wait', 'Choosing threads, Ractors or processes'],
          quiz: [
            ['Can a Ractor read a mutable global object?', 'No, only shareable (frozen or special) objects cross Ractors.'],
            ['Why do Puma and Sidekiq use processes and threads?', 'Processes give parallelism; threads overlap I/O cheaply.'],
          ],
          prereqs: ['Threads, the GVL and Mutex'],
        },
      ],
    },
    {
      title: 'Testing, Quality and Packaging',
      topics: [
        {
          title: 'Minitest',
          description: 'The standard library test framework: test classes and assertions, spec-style describe blocks, setup and teardown, and running with rake test or ruby -Itest.',
          concepts: ['Minitest::Test and assertions', 'Spec-style syntax', 'setup and teardown', 'Running with rake test'],
          quiz: [
            ['How does Minitest find tests?', 'Methods starting with test_ in Minitest::Test subclasses.'],
            ['What does assert_raises(KeyError) { ... } check?', 'The block raises KeyError.'],
          ],
        },
        {
          title: 'RSpec fundamentals',
          description: 'describe, context and it, expect with matchers, let and let! for lazy fixtures, before hooks, subject, and organising spec files to mirror lib.',
          concepts: ['describe, context and it', 'expect and matchers', 'let, let! and subject', 'before and after hooks', 'Spec file layout'],
          quiz: [
            ['Difference between let and let!?', 'let is lazy; let! runs before each example.'],
            ['Which matcher checks a block raises?', 'expect { }.to raise_error(ErrorClass)'],
          ],
        },
        {
          title: 'Doubles, stubs and shared examples',
          description: 'instance_double for verified doubles, allow and expect for stubs and message expectations, shared examples for duck-typed contracts, and avoiding over-mocking.',
          concepts: ['instance_double and verified doubles', 'allow versus expect', 'Shared examples', 'Over-mocking smells'],
          quiz: [
            ['Why prefer instance_double over double?', 'It fails if you stub a method the real class does not have.'],
            ['What does expect(mailer).to receive(:deliver).once assert?', 'deliver is called exactly once during the example.'],
          ],
          prereqs: ['RSpec fundamentals'],
        },
        {
          title: 'Rake tasks and project layout',
          description: 'lib and bin directories, require_relative versus $LOAD_PATH, Rakefile tasks with dependencies, and a default task that runs tests and RuboCop.',
          concepts: ['lib, bin and test layout', 'require and $LOAD_PATH', 'Rake tasks and dependencies', 'Default task'],
          quiz: [
            ['Difference between require and require_relative?', 'require searches $LOAD_PATH; require_relative resolves from the current file.'],
            ['How do you list Rake tasks?', 'rake -T'],
          ],
        },
        {
          title: 'Building and publishing a gem',
          description: 'The gemspec with files, dependencies and executables, semantic versioning, gem build and gem push, and testing the gem against several Ruby versions in CI.',
          concepts: ['Writing a gemspec', 'Versioning a gem', 'gem build and gem push', 'CI across Ruby versions'],
          quiz: [
            ['Where do runtime dependencies go?', 'add_dependency in the gemspec, not the Gemfile.'],
            ['What does bundle gem name generate?', 'A gem skeleton with gemspec, lib, tests and Rakefile.'],
          ],
          prereqs: ['Rake tasks and project layout'],
        },
        {
          title: 'Performance and profiling',
          description: 'benchmark-ips for comparisons, stackprof and memory_profiler, YJIT, avoiding allocation in hot loops, and the cost of method_missing and string building.',
          concepts: ['benchmark-ips', 'stackprof and memory_profiler', 'Enabling YJIT', 'Allocation in hot loops'],
          quiz: [
            ['Why benchmark-ips over Benchmark.measure?', 'It reports iterations per second with statistical error.'],
            ['How do you enable YJIT?', 'ruby --yjit or RUBY_YJIT_ENABLE=1.'],
          ],
        },
        {
          title: 'Security in Ruby code',
          description: 'Never eval or send user input, safe YAML and Marshal handling, avoiding shell injection with system arrays, bundler-audit for vulnerable gems, and secure random tokens.',
          concepts: ['eval, send and user input', 'Marshal and YAML risks', 'system with argument arrays', 'bundler-audit', 'SecureRandom'],
          quiz: [
            ['Why call system("ls", dir) instead of system("ls #{dir}")?', 'The array form skips the shell, preventing injection.'],
            ['What does bundler-audit check?', 'Gemfile.lock against a database of known vulnerable versions.'],
          ],
        },
      ],
    },
    {
      title: 'Rails Overview',
      description: 'How Ruby powers the web through Rails; the full framework has its own track (Ruby on Rails).',
      style: 'practice',
      topics: [
        {
          title: 'Rails structure and conventions',
          description: 'rails new, the MVC folders, convention over configuration, generators, the development server, and how naming links models, tables, controllers and views.',
          concepts: ['rails new and folder layout', 'Convention over configuration', 'Generators', 'bin/rails server and console'],
          quiz: [
            ['What table does a Post model map to?', 'posts'],
            ['Which command opens a console with the app loaded?', 'bin/rails console'],
          ],
        },
        {
          title: 'Routing, controllers and views',
          description: 'resources routes, RESTful controller actions, strong parameters, ERB views and partials, and the flow from request to rendered HTML.',
          concepts: ['resources and RESTful routes', 'Controller actions', 'Strong parameters', 'ERB views and partials'],
          quiz: [
            ['What do strong parameters protect against?', 'Mass assignment of unexpected attributes.'],
            ['What does resources :posts generate?', 'Seven RESTful routes for index, show, new, create, edit, update and destroy.'],
          ],
          prereqs: ['Rails structure and conventions'],
        },
        {
          title: 'Active Record essentials',
          description: 'Models backed by tables, migrations, validations, associations like has_many and belongs_to, query methods, and includes against N+1.',
          concepts: ['Migrations', 'Validations', 'Associations', 'Query interface and includes'],
          quiz: [
            ['What does Post.includes(:author) prevent?', 'N+1 queries when reading each post\'s author.'],
            ['When do validations run?', 'On save, create and update, before the SQL is issued.'],
          ],
          prereqs: ['Routing, controllers and views'],
        },
        {
          title: 'Jobs, mailers and testing at a glance',
          description: 'Active Job with Sidekiq or Solid Queue, Action Mailer, and the Rails test stack with fixtures and system tests; each is covered fully in the Rails track.',
          concepts: ['Active Job', 'Action Mailer', 'Rails testing stack'],
          quiz: [
            ['Why perform_later instead of perform_now?', 'It queues the job so the request returns immediately.'],
            ['What do system tests drive?', 'A real browser through Capybara.'],
          ],
          prereqs: ['Active Record essentials'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: log analyser CLI',
          description: 'Build a gem-structured command that streams log files, parses lines with regexes into Structs, aggregates counts per status and path with Enumerable, prints a table, and ships with RSpec tests.',
          concepts: ['Structure the gem and executable', 'Parse lines into Structs', 'Aggregate with group_by and tally', 'Format a table', 'Test the parser and reporter'],
          quiz: [
            ['How do you stream a multi-gigabyte log?', 'File.foreach, which yields one line at a time.'],
            ['Where do executables go in a gem?', 'The exe or bin directory, listed in the gemspec.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: text adventure engine',
          description: 'Model rooms, items and commands with small objects and modules, parse player input, persist game state as YAML, and let scenarios be defined in a Ruby DSL using instance_eval.',
          concepts: ['Design rooms and items as objects', 'Command parser', 'YAML save files', 'Scenario DSL with instance_eval', 'Minitest coverage'],
          quiz: [
            ['How does instance_eval enable a DSL?', 'The block runs with self set to the builder, so bare method calls configure it.'],
            ['Why YAML.safe_load for saves?', 'Save files could be edited to instantiate dangerous objects.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: concurrent web fetcher',
          description: 'Fetch a list of URLs with a bounded thread pool and Queue, time each request, retry failures with backoff, write results to CSV, and compare against a Fiber-based async version.',
          concepts: ['Thread pool with Queue', 'Retries with backoff', 'Collect results safely', 'CSV output', 'Async comparison'],
          quiz: [
            ['How do you bound concurrency with plain threads?', 'Start N worker threads that pop jobs from a shared Queue.'],
            ['Why does threading help here despite the GVL?', 'Network waits release the GVL.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: Sinatra JSON API',
          description: 'A small Sinatra service with routes, a SQLite database through Sequel, JSON responses, token authentication, rack-test specs and a Rakefile for migrations.',
          concepts: ['Sinatra routes and JSON', 'Sequel models and migrations', 'Token authentication', 'rack-test specs', 'Rake migration tasks'],
          quiz: [
            ['What does rack-test give you?', 'Methods like get and post that call the app without a server.'],
            ['Why Sinatra for this project?', 'It exposes Rack directly with minimal structure, making the request cycle visible.'],
          ],
          style: 'project',
        },
        {
          title: 'Ruby interview questions',
          description: 'The questions that recur: blocks versus procs versus lambdas, include versus extend, symbols versus strings, method lookup, the GVL, duck typing, and how Ruby compares with Python and JavaScript.',
          concepts: ['Closures questions', 'Object model questions', 'Concurrency questions', 'Idiom and style questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Proc or lambda: which checks arity?', 'Lambdas raise on wrong argument counts; procs fill with nil.'],
            ['Where does include place a module?', 'Above the class in ancestors, below prepended modules.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in Ruby',
          description: 'Solving problems fast: reading STDIN with gets and readlines, Hash.new(0) counters, sort_by and min_by, each_cons and each_slice, and the hidden cost of include? on arrays.',
          concepts: ['Fast input with gets and readlines', 'Hash.new(0) counters', 'each_cons and each_slice', 'Sorting idioms', 'Hidden complexity in Array#include?'],
          quiz: [
            ['How do you count characters in one line?', 'str.chars.tally'],
            ['What is the cost of array.include?', 'O(n); use a Set or Hash for O(1).'],
          ],
        },
      ],
    },
  ],
})
