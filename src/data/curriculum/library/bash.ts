import { defineTrack } from '../define'

export const bash = defineTrack({
  id: 'track-bash',
  title: 'Bash and Shell Scripting',
  description: 'Bash from the interactive shell to robust automation: the environment, quoting, conditionals and loops, functions, arrays, parameter expansion, grep, sed and awk, pipes and redirection, processes and signals, set -euo pipefail, cron, portable scripts, ShellCheck and bats, real automation projects and interview practice.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🐚',
  tags: ['bash', 'shell', 'linux', 'automation', 'devops', 'scripting', 'awk', 'sed'],
  languages: ['Bash'],
  explainMode: 'devops',
  code: { label: 'bash', id: 'bash', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'The Shell and Its Environment',
      description: 'What a shell actually does with a command line, and how to set one up for scripting.',
      topics: [
        {
          title: 'Shells, terminals and Bash versions',
          description: 'The difference between a terminal, a shell and Bash, checking bash --version, why macOS ships an old Bash and zsh by default, and running Bash on Windows through WSL or Git Bash.',
          concepts: ['Terminal versus shell', 'bash --version and BASH_VERSION', 'Bash on macOS, Linux and Windows', 'sh versus bash'],
          quiz: [
            ['How do you check which shell is running?', 'echo $0 or ps -p $$'],
            ['Why can a script work on Linux but fail on macOS?', 'macOS ships Bash 3.2, which lacks features like associative arrays.'],
          ],
        },
        {
          title: 'Command anatomy and the search path',
          description: 'How the shell splits a line into a command and arguments, builtins versus external programs, PATH lookup, type and which, aliases, and why hash caches locations.',
          concepts: ['Words, arguments and options', 'Builtins versus external commands', 'PATH lookup and type', 'Aliases versus functions'],
          quiz: [
            ['What does type cd report?', 'cd is a shell builtin.'],
            ['How does the shell find ls?', 'It searches each directory in PATH in order.'],
          ],
          prereqs: ['Shells, terminals and Bash versions'],
        },
        {
          title: 'Environment and startup files',
          description: 'Shell variables versus exported environment variables, .bashrc versus .bash_profile and login versus interactive shells, env and printenv, and how child processes inherit the environment.',
          concepts: ['export and inheritance', 'Login versus interactive shells', '.bashrc and .bash_profile', 'env, printenv and set'],
          quiz: [
            ['Does a variable set in a script change the parent shell?', 'No, a script runs in a child process.'],
            ['Which file runs for a non-login interactive shell?', '~/.bashrc'],
          ],
          prereqs: ['Command anatomy and the search path'],
        },
        {
          title: 'Writing and running a first script',
          description: 'The shebang line, chmod +x, running with ./script versus bash script versus source, the script search path, and choosing #!/usr/bin/env bash.',
          concepts: ['Shebang lines', 'chmod +x and execution', './script versus bash script versus source', 'Script location and PATH'],
          quiz: [
            ['What does #!/usr/bin/env bash do?', 'Runs the script with the first bash found in PATH.'],
            ['Difference between ./script.sh and source script.sh?', 'source runs it in the current shell so variables persist.'],
          ],
          prereqs: ['Environment and startup files'],
        },
        {
          title: 'Interactive productivity',
          description: 'History expansion and Ctrl-R search, readline shortcuts, tab completion, job control keys, and brace expansion for typing less, all of which carry over into scripts.',
          concepts: ['History and Ctrl-R', 'Readline keyboard shortcuts', 'Tab completion', 'Brace expansion'],
          quiz: [
            ['What does mkdir -p src/{lib,bin,test} create?', 'src/lib, src/bin and src/test.'],
            ['What does !! expand to?', 'The previous command.'],
          ],
        },
      ],
    },
    {
      title: 'Variables, Quoting and Expansion',
      topics: [
        {
          title: 'Variables and assignment',
          description: 'Assigning without spaces around =, reading with $var and ${var}, local versus global, readonly, declare flags, and the special variables $?, $$, $0 and $#.',
          concepts: ['Assignment syntax', '$var and ${var}', 'declare and readonly', 'Special variables $?, $$, $0, $#'],
          quiz: [
            ['Why does x = 5 fail?', 'The shell runs a command named x with arguments = and 5.'],
            ['What does $? hold?', 'The exit status of the last command.'],
          ],
        },
        {
          title: 'Quoting rules',
          description: 'Single quotes are literal, double quotes allow expansion but stop word splitting and globbing, backslash escapes, and why "$var" should be the default.',
          concepts: ['Single versus double quotes', 'Word splitting and globbing', 'Backslash escapes', 'Always quote "$var"', '$\'...\' ANSI-C quoting'],
          quiz: [
            ['What goes wrong with rm $file when file is "a b"?', 'It expands to two arguments, a and b.'],
            ['How do you include a literal single quote inside single quotes?', 'End the quote, add \\\', and reopen: \'it\'\\\'\'s\'.'],
          ],
          prereqs: ['Variables and assignment'],
        },
        {
          title: 'Parameter expansion',
          description: 'Defaults with ${var:-default} and ${var:=default}, errors with ${var:?msg}, substring and length, prefix and suffix removal with # and %, and substitution with //.',
          concepts: ['Default and required values', 'Length and substrings', 'Prefix and suffix removal', 'Pattern substitution', 'Case modification'],
          quiz: [
            ['What does ${path##*/} give?', 'The file name after the last slash.'],
            ['What does ${file%.txt} do?', 'Removes a trailing .txt.'],
          ],
          prereqs: ['Quoting rules'],
        },
        {
          title: 'Command substitution and arithmetic',
          description: '$(command) versus backticks, nesting, $(( )) integer arithmetic, let and (( )), and why floating point needs bc or awk.',
          concepts: ['$(command) substitution', '$(( )) arithmetic', '(( )) for conditions and counters', 'Floating point with bc or awk'],
          quiz: [
            ['What does $(( 7 / 2 )) give?', '3, integer division.'],
            ['Why prefer $( ) over backticks?', 'It nests cleanly and is easier to read.'],
          ],
          prereqs: ['Variables and assignment'],
        },
        {
          title: 'Globbing and pathname expansion',
          description: '*, ? and [...] patterns, hidden files, nullglob and failglob, extglob patterns, and why globs beat parsing ls output.',
          concepts: ['*, ? and bracket patterns', 'nullglob and failglob', 'extglob patterns', 'Globs instead of ls'],
          quiz: [
            ['What happens to *.log when no file matches?', 'It stays literal unless nullglob is set.'],
            ['Why never parse ls output in scripts?', 'File names with spaces or newlines break it; use globs.'],
          ],
          prereqs: ['Quoting rules'],
        },
      ],
    },
    {
      title: 'Conditionals, Loops and Functions',
      topics: [
        {
          title: 'Exit status and test expressions',
          description: 'Zero means success, [ ] versus [[ ]], string, numeric and file tests, && and || chaining, and pattern and regex matching inside [[ ]].',
          concepts: ['Zero is success', '[ ] versus [[ ]]', 'String, numeric and file tests', '&& and || chaining', 'Regex with =~ and BASH_REMATCH'],
          quiz: [
            ['What does [[ -f "$path" ]] test?', 'That path exists and is a regular file.'],
            ['Which operator compares integers?', '-eq, -lt, -gt and friends (or (( )) ).'],
          ],
        },
        {
          title: 'if, elif and case',
          description: 'if statements built on exit status, elif chains, case for pattern dispatch on strings and options, and the fallthrough operators ;& and ;;&.',
          concepts: ['if built on exit status', 'elif chains', 'case patterns', 'case fallthrough operators'],
          quiz: [
            ['What does case "$1" in -h|--help) match?', 'Either -h or --help.'],
            ['Does if need [ ]?', 'No, any command works: if grep -q x file; then'],
          ],
          prereqs: ['Exit status and test expressions'],
        },
        {
          title: 'for, while and until loops',
          description: 'for over lists and globs, C-style for, while read -r for line-by-line input, until, break and continue, and the subshell trap when piping into while.',
          concepts: ['for over words and globs', 'C-style for loops', 'while read -r line', 'break and continue', 'Pipes into while and subshells'],
          quiz: [
            ['Why use while IFS= read -r line?', 'IFS= keeps whitespace and -r keeps backslashes literal.'],
            ['Why is a counter unchanged after cat file | while read; do n=$((n+1)); done?', 'The loop ran in a subshell; use redirection instead.'],
          ],
          prereqs: ['if, elif and case'],
        },
        {
          title: 'Functions',
          description: 'Defining functions, positional parameters and $@, local variables, return codes versus printed output, and capturing results with command substitution.',
          concepts: ['Function syntax', 'Positional parameters and "$@"', 'local variables', 'Return codes versus output', 'Recursion in Bash'],
          quiz: [
            ['How does a function return a string?', 'By printing it and capturing with $(fn).'],
            ['What does return 3 do?', 'Sets the exit status of the function to 3.'],
          ],
          prereqs: ['Variables and assignment'],
        },
        {
          title: 'Parsing options with getopts',
          description: 'Handling -v and -o value flags with getopts, OPTARG and OPTIND, shift for remaining arguments, usage functions, and long options by hand or with getopt.',
          concepts: ['getopts loop', 'OPTARG and OPTIND', 'shift and remaining arguments', 'Usage messages', 'Long options'],
          quiz: [
            ['What does the string "vo:" mean in getopts?', '-v takes no argument; -o requires one.'],
            ['What does shift $((OPTIND - 1)) do?', 'Drops parsed options so $1 is the first positional argument.'],
          ],
          prereqs: ['Functions'],
        },
      ],
    },
    {
      title: 'Arrays and Data Handling',
      topics: [
        {
          title: 'Indexed arrays',
          description: 'Declaring, appending with +=, "${arr[@]}" versus "${arr[*]}", length and indices, slicing, and building arrays from globs and mapfile.',
          concepts: ['Declaring and appending', '"${arr[@]}" versus "${arr[*]}"', 'Length and indices', 'Slicing', 'mapfile and readarray'],
          quiz: [
            ['What does "${#arr[@]}" give?', 'The number of elements.'],
            ['How do you read lines of a file into an array?', 'mapfile -t lines < file'],
          ],
          prereqs: ['Quoting rules'],
        },
        {
          title: 'Associative arrays',
          description: 'declare -A for key-value maps in Bash 4+, setting and reading keys, iterating with "${!map[@]}", checking existence, and counting with them.',
          concepts: ['declare -A', 'Keys with "${!map[@]}"', 'Existence checks', 'Counting and grouping'],
          quiz: [
            ['How do you loop over keys?', 'for k in "${!map[@]}"; do'],
            ['Which Bash version introduced associative arrays?', '4.0'],
          ],
          prereqs: ['Indexed arrays'],
        },
        {
          title: 'IFS, word splitting and safe iteration',
          description: 'How IFS controls splitting, splitting a string into an array, iterating over file names safely with null delimiters, and find -print0 with xargs -0.',
          concepts: ['IFS and splitting', 'read -a into arrays', 'Null-delimited file lists', 'find -print0 and xargs -0'],
          quiz: [
            ['How do you split a:b:c into an array?', 'IFS=: read -r -a parts <<< "a:b:c"'],
            ['Why use -print0 with find?', 'File names can contain newlines; NUL cannot appear in a name.'],
          ],
          prereqs: ['Indexed arrays'],
        },
        {
          title: 'Here documents and here strings',
          description: 'Multi-line input with <<EOF, quoting the delimiter to prevent expansion, <<- for indented blocks, and <<< for feeding a single string.',
          concepts: ['<<EOF here documents', 'Quoted delimiters', '<<- and indentation', '<<< here strings'],
          quiz: [
            ['What does <<\'EOF\' change?', 'No expansion happens inside the document.'],
            ['What does cmd <<< "$var" do?', 'Feeds the value of var to cmd as stdin.'],
          ],
        },
      ],
    },
    {
      title: 'Text Processing',
      topics: [
        {
          title: 'grep and regular expressions',
          description: 'grep with basic, extended (-E) and fixed (-F) patterns, -i, -v, -c, -n, -r and -o, matching across files, and the regex features that differ between tools.',
          concepts: ['grep options', 'Basic versus extended regex', 'Fixed strings with -F', 'Recursive and only-matching', 'Anchors and classes'],
          quiz: [
            ['What does grep -c pattern file output?', 'The number of matching lines.'],
            ['What does -o do?', 'Prints only the matched parts, one per line.'],
          ],
        },
        {
          title: 'sed for stream editing',
          description: 'Substitution with s///, flags g and i, addresses by line or pattern, deleting and printing lines, in-place editing with -i and its macOS difference, and multiple expressions.',
          concepts: ['s/// and flags', 'Addresses and ranges', 'd, p and -n', 'In-place editing', 'Multiple expressions'],
          quiz: [
            ['What does sed -n \'/error/p\' do?', 'Prints only lines containing error.'],
            ['Why does sed -i fail differently on macOS?', 'BSD sed requires a backup suffix argument, for example -i \'\'.'],
          ],
          prereqs: ['grep and regular expressions'],
        },
        {
          title: 'awk for fields and reports',
          description: 'Field splitting with -F, $1 and NF, patterns and actions, BEGIN and END blocks, variables and arithmetic, associative arrays for grouping, and printf output.',
          concepts: ['Fields, -F and NF', 'Pattern-action rules', 'BEGIN and END', 'awk associative arrays', 'printf formatting'],
          quiz: [
            ['What does awk \'{ sum += $3 } END { print sum }\' compute?', 'The total of the third column.'],
            ['How do you sum bytes per IP from a log?', 'awk \'{ b[$1] += $10 } END { for (ip in b) print ip, b[ip] }\''],
          ],
          prereqs: ['grep and regular expressions'],
        },
        {
          title: 'cut, sort, uniq, tr and paste',
          description: 'Column extraction with cut, sort with keys and numeric order, uniq -c for counting after sort, tr for character translation, and paste and join for combining files.',
          concepts: ['cut -d and -f', 'sort -k, -n and -u', 'uniq -c after sort', 'tr and tr -d', 'paste and join'],
          quiz: [
            ['Why must uniq input be sorted?', 'uniq only collapses adjacent duplicates.'],
            ['How do you get the ten most common lines?', 'sort | uniq -c | sort -rn | head'],
          ],
        },
        {
          title: 'Working with JSON, CSV and dates',
          description: 'jq for querying and transforming JSON, handling CSV quoting limits in the shell and when to switch to Python, date formatting and arithmetic, and printf for aligned output.',
          concepts: ['jq filters and options', 'CSV limits in shell', 'date formats and arithmetic', 'printf alignment'],
          quiz: [
            ['What does jq -r \'.items[].name\' do?', 'Prints each item name as raw text without quotes.'],
            ['How do you print yesterday in ISO format on GNU date?', 'date -d yesterday +%F'],
          ],
        },
      ],
    },
    {
      title: 'Pipes, Redirection and Files',
      topics: [
        {
          title: 'Standard streams and redirection',
          description: 'stdin, stdout and stderr as file descriptors 0, 1 and 2, > and >>, 2>&1 ordering, /dev/null, and reading from files with <.',
          concepts: ['File descriptors 0, 1, 2', '> and >>', '2>&1 and ordering', '/dev/null', 'Input redirection'],
          quiz: [
            ['Difference between cmd 2>&1 >file and cmd >file 2>&1?', 'Only the second sends both streams to the file.'],
            ['How do you discard errors only?', 'cmd 2>/dev/null'],
          ],
        },
        {
          title: 'Pipelines and filters',
          description: 'Connecting stdout to stdin with |, exit status of a pipeline and PIPESTATUS, tee for branching, process substitution <( ), and composing small tools.',
          concepts: ['Pipelines and buffering', 'PIPESTATUS and pipefail', 'tee', 'Process substitution', 'Unix filter philosophy'],
          quiz: [
            ['What does diff <(sort a) <(sort b) do?', 'Compares the sorted outputs without temp files.'],
            ['What is the exit status of a pipeline by default?', 'The status of the last command.'],
          ],
          prereqs: ['Standard streams and redirection'],
        },
        {
          title: 'Files, directories and permissions',
          description: 'test operators for files, mkdir -p, cp, mv and rm safely, find with expressions and -exec, chmod and chown, symbolic links, and stat.',
          concepts: ['find expressions and -exec', 'Safe cp, mv and rm', 'chmod and chown', 'Symbolic links', 'stat and file metadata'],
          quiz: [
            ['What does find . -name "*.log" -mtime +7 -delete do?', 'Deletes log files modified more than seven days ago.'],
            ['What does chmod 755 grant?', 'rwx for owner, rx for group and others.'],
          ],
        },
        {
          title: 'Temporary files and cleanup with trap',
          description: 'mktemp for safe temp files and directories, trap on EXIT to clean up, handling INT and TERM, and avoiding predictable names and races.',
          concepts: ['mktemp files and directories', 'trap ... EXIT', 'INT and TERM handlers', 'Avoiding temp file races'],
          quiz: [
            ['How do you guarantee a temp directory is removed?', 'tmp=$(mktemp -d); trap \'rm -rf "$tmp"\' EXIT'],
            ['Why not use /tmp/myscript.tmp?', 'Predictable names allow symlink attacks and collisions.'],
          ],
          prereqs: ['Files, directories and permissions'],
        },
        {
          title: 'Reading input and prompting',
          description: 'read with prompts and silent mode, timeouts, reading from files by descriptor, select menus, and detecting whether stdin is a terminal.',
          concepts: ['read -p and -s', 'read -t timeouts', 'Custom file descriptors', 'select menus', '[[ -t 0 ]] terminal detection'],
          quiz: [
            ['How do you read a password without echo?', 'read -rs -p "Password: " pw'],
            ['What does [[ -t 1 ]] test?', 'Whether stdout is a terminal, useful for disabling colours in pipes.'],
          ],
        },
      ],
    },
    {
      title: 'Processes, Signals and Concurrency',
      topics: [
        {
          title: 'Processes, jobs and subshells',
          description: 'How the shell forks to run commands, foreground and background jobs with &, jobs, fg and bg, ( ) subshells versus { } groups, and $! for the last background PID.',
          concepts: ['fork and exec model', '& and job control', 'Subshells ( ) versus groups { }', '$! and wait'],
          quiz: [
            ['What does ( cd dir && make ) leave unchanged?', 'The current directory of the calling shell.'],
            ['What does wait do?', 'Blocks until background jobs finish and returns their status.'],
          ],
        },
        {
          title: 'Signals, kill and nohup',
          description: 'Common signals (INT, TERM, KILL, HUP), kill and pkill, why KILL cannot be trapped, nohup and disown for surviving logout, and timeout for bounded commands.',
          concepts: ['Signal names and numbers', 'kill, pkill and killall', 'nohup and disown', 'timeout command'],
          quiz: [
            ['Which signal does Ctrl-C send?', 'SIGINT'],
            ['Why prefer TERM over KILL?', 'TERM lets the process clean up; KILL cannot be handled.'],
          ],
          prereqs: ['Processes, jobs and subshells'],
        },
        {
          title: 'Parallel execution',
          description: 'Running jobs in the background and waiting, xargs -P for bounded parallelism, GNU parallel, collecting outputs without interleaving, and when parallelism does not help.',
          concepts: ['Background jobs and wait -n', 'xargs -P', 'GNU parallel', 'Avoiding interleaved output'],
          quiz: [
            ['How do you compress files four at a time?', 'printf \'%s\\0\' *.log | xargs -0 -P4 gzip'],
            ['What does wait -n do?', 'Waits for any one background job to finish.'],
          ],
          prereqs: ['Processes, jobs and subshells'],
        },
        {
          title: 'Inspecting the system',
          description: 'ps, top and htop, pgrep, lsof for open files and ports, df and du for disk, free and uptime, and reading /proc for process details.',
          concepts: ['ps and pgrep', 'lsof for files and ports', 'df, du and free', '/proc basics'],
          quiz: [
            ['How do you find which process listens on port 8080?', 'lsof -i :8080 (or ss -ltnp).'],
            ['What does du -sh * show?', 'Total size of each entry in the current directory.'],
          ],
        },
        {
          title: 'Locks and single-instance scripts',
          description: 'Preventing overlapping runs with flock, lock files and PID files, atomic mkdir locks, and handling stale locks after crashes.',
          concepts: ['flock', 'PID files', 'mkdir as an atomic lock', 'Stale lock handling'],
          quiz: [
            ['How do you make a cron script skip if already running?', 'flock -n /tmp/job.lock script.sh'],
            ['Why is mkdir usable as a lock?', 'It is atomic: only one caller can create the directory.'],
          ],
          prereqs: ['Signals, kill and nohup'],
        },
      ],
    },
    {
      title: 'Robust Scripts and Error Handling',
      topics: [
        {
          title: 'set -euo pipefail',
          description: 'What each flag does: exit on error, error on unset variables, and failing pipelines, the cases where -e does not fire, and handling expected failures explicitly.',
          concepts: ['set -e and its exceptions', 'set -u and default values', 'set -o pipefail', 'Handling expected failures'],
          quiz: [
            ['Does set -e stop on a failing command inside if?', 'No, commands tested by if, && or || are exempt.'],
            ['How do you allow one command to fail under set -e?', 'Append || true or test it explicitly.'],
          ],
          prereqs: ['Exit status and test expressions'],
        },
        {
          title: 'Error messages, exit codes and die functions',
          description: 'Writing errors to stderr, meaningful exit codes, a die helper, usage on bad input, and the conventions of 0, 1, 2 and 126 to 128+n.',
          concepts: ['Errors to stderr', 'Exit code conventions', 'die and usage helpers', 'exit versus return'],
          quiz: [
            ['What does exit status 127 mean?', 'Command not found.'],
            ['How do you print to stderr?', 'echo "msg" >&2'],
          ],
          prereqs: ['set -euo pipefail'],
        },
        {
          title: 'trap for errors and debugging',
          description: 'trap on ERR to report the failing line with LINENO and BASH_COMMAND, DEBUG traps, set -x with a PS4 that shows file and line, and bash -n for syntax checks.',
          concepts: ['trap ... ERR', 'LINENO and BASH_COMMAND', 'set -x and PS4', 'bash -n syntax check'],
          quiz: [
            ['How do you show line numbers in trace output?', 'export PS4=\'+ ${BASH_SOURCE}:${LINENO}: \'; set -x'],
            ['What does bash -n script.sh do?', 'Parses without executing to catch syntax errors.'],
          ],
          prereqs: ['set -euo pipefail'],
        },
        {
          title: 'Idempotent and rerunnable scripts',
          description: 'Making scripts safe to run twice: check before create, mkdir -p, atomic writes via temp file and mv, dry-run flags, and logging what changed.',
          concepts: ['Check before change', 'Atomic writes with mv', 'Dry-run flags', 'Logging changes'],
          quiz: [
            ['Why write to a temp file and mv?', 'mv within a file system is atomic, so readers never see a partial file.'],
            ['What does idempotent mean for a script?', 'Running it again produces the same state without duplicating work.'],
          ],
        },
        {
          title: 'Logging and notifications',
          description: 'A log function with timestamps and levels, logger for syslog, rotating log files, and sending alerts by mail or webhook when a job fails.',
          concepts: ['Timestamped log function', 'logger and syslog', 'Log rotation', 'Failure notifications'],
          quiz: [
            ['How do you write to syslog from a script?', 'logger -t myscript "message"'],
            ['Why timestamp log lines?', 'Cron and long jobs need to be correlated with other events.'],
          ],
        },
      ],
    },
    {
      title: 'Scheduling, Portability and Quality',
      topics: [
        {
          title: 'cron and crontab',
          description: 'crontab -e syntax with the five fields, the minimal cron environment and PATH, redirecting output, MAILTO, @reboot, and why cron jobs fail when they work in a terminal.',
          concepts: ['Crontab field syntax', 'Cron environment and PATH', 'Output redirection in cron', 'MAILTO and @reboot', 'Debugging failing cron jobs'],
          quiz: [
            ['What does 0 3 * * 1 mean?', 'At 03:00 every Monday.'],
            ['Why does a cron job not find a command that works in the shell?', 'Cron has a minimal PATH; use absolute paths or set PATH in the crontab.'],
          ],
        },
        {
          title: 'systemd timers and services',
          description: 'Unit files for oneshot services, timer units with OnCalendar, journalctl for logs, and choosing between cron and timers on modern Linux.',
          concepts: ['Service unit files', 'Timer units and OnCalendar', 'journalctl for logs', 'cron versus timers'],
          quiz: [
            ['How do you view logs for a timer-run service?', 'journalctl -u name.service'],
            ['What advantage do timers have over cron?', 'Logging, dependencies and catching up missed runs with Persistent=true.'],
          ],
          prereqs: ['cron and crontab'],
        },
        {
          title: 'Portable scripts and POSIX sh',
          description: 'Bashisms to avoid when targeting sh or dash, [ versus [[, echo versus printf, GNU versus BSD tool differences, and checking with dash or checkbashisms.',
          concepts: ['Common bashisms', 'printf over echo', 'GNU versus BSD utilities', 'Testing with dash'],
          quiz: [
            ['Why prefer printf to echo?', 'echo differs across shells for flags and escapes; printf is consistent.'],
            ['Is [[ available in POSIX sh?', 'No, use [ with quoted variables.'],
          ],
        },
        {
          title: 'ShellCheck and style',
          description: 'Running shellcheck locally and in CI, reading its codes, disabling specific warnings with justification, and a consistent style with shfmt.',
          concepts: ['Running shellcheck', 'Reading SC codes', 'Targeted disable directives', 'shfmt formatting'],
          quiz: [
            ['What does SC2086 warn about?', 'Unquoted variables that will undergo word splitting and globbing.'],
            ['How do you silence one warning on one line?', '# shellcheck disable=SC2086 above it, with a reason.'],
          ],
        },
        {
          title: 'Testing scripts with bats',
          description: 'Bats test files with @test blocks, run and $status and $output, setup and teardown, testing functions by sourcing, and running bats in CI.',
          concepts: ['@test blocks', 'run, $status and $output', 'setup and teardown', 'Sourcing functions for tests', 'bats in CI'],
          quiz: [
            ['What does run mycmd capture?', 'Exit status in $status and output in $output.'],
            ['How do you test a function without running the script?', 'Source the script with a guard so main does not execute.'],
          ],
        },
        {
          title: 'Script organisation and libraries',
          description: 'Sourcing shared function files, guarding against double sourcing, a main function called at the end, script directory detection with BASH_SOURCE, and packaging scripts with a Makefile.',
          concepts: ['source and library files', 'Double-source guards', 'main function pattern', 'BASH_SOURCE and script directory', 'Makefile install targets'],
          quiz: [
            ['How do you get the directory of the running script?', 'dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)'],
            ['Why put code in a main function?', 'Functions are defined before anything runs, and the script can be sourced for tests.'],
          ],
          prereqs: ['Functions'],
        },
        {
          title: 'Performance and security in scripts',
          description: 'Avoiding useless forks in loops, letting awk or sort do the heavy lifting, never eval-ing input, quoting to prevent injection, secrets outside arguments, and safe sudo use.',
          concepts: ['Fork cost in loops', 'Delegating to awk and sort', 'eval and injection', 'Secrets in environment not arguments', 'sudo and least privilege'],
          quiz: [
            ['Why is a loop calling grep per line slow?', 'Each iteration forks a process; one awk pass is far faster.'],
            ['Why keep secrets out of command arguments?', 'Arguments are visible to every user through ps.'],
          ],
        },
      ],
    },
    {
      title: 'Automation Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: backup and rotation script',
          description: 'Back up directories with tar or rsync into dated archives, keep the last N copies, verify checksums, log every run, lock against overlap, and schedule it with cron.',
          concepts: ['Archive with tar or rsync', 'Rotate old backups', 'Verify with sha256sum', 'Lock, log and schedule'],
          quiz: [
            ['How do you keep only the seven newest archives?', 'ls -1t | tail -n +8 | xargs -r rm, or find with -mtime.'],
            ['Why verify a backup?', 'A silent write error makes the backup useless on restore day.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: log analysis report',
          description: 'Parse web server logs with awk, compute top IPs, status distribution and hourly traffic, render a text or HTML report, and email it daily from cron.',
          concepts: ['Parse logs with awk', 'Aggregate and rank', 'Render a report', 'Deliver from cron'],
          quiz: [
            ['How do you count requests per hour?', 'Extract the hour field with awk and count into an associative array.'],
            ['Where should the report script log failures?', 'stderr, captured by cron redirection or MAILTO.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: developer environment bootstrapper',
          description: 'An idempotent script that installs packages, sets up dotfiles with symlinks, configures git, detects the OS, supports a dry-run flag and passes ShellCheck.',
          concepts: ['Detect OS and package manager', 'Idempotent installs', 'Dotfile symlinks', 'Dry-run and logging', 'ShellCheck clean'],
          quiz: [
            ['How do you skip an install that is already done?', 'Test with command -v before installing.'],
            ['Why symlink dotfiles instead of copying?', 'Edits stay in the repository automatically.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: deployment and health-check script',
          description: 'Deploy a build to a server over ssh and rsync, restart a service, poll a health endpoint with curl and a timeout, roll back on failure and notify a webhook.',
          concepts: ['rsync over ssh', 'Restart and health poll', 'Rollback on failure', 'Webhook notification', 'Exit codes for CI'],
          quiz: [
            ['How do you poll until healthy with a limit?', 'A loop with curl -fsS and a counter, sleeping between tries.'],
            ['Why keep the previous release directory?', 'Rollback is a symlink switch instead of a rebuild.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: parallel image or file processor',
          description: 'Process thousands of files with xargs -P or GNU parallel, skip already processed outputs, handle names with spaces safely, show progress, and summarise failures.',
          concepts: ['Null-safe file discovery', 'Bounded parallel processing', 'Skip completed work', 'Progress and failure summary'],
          quiz: [
            ['How do you pass file names with spaces to xargs safely?', 'find -print0 with xargs -0.'],
            ['How do you skip files already converted?', 'Test for the output file before processing.'],
          ],
          style: 'project',
        },
        {
          title: 'Shell scripting interview questions',
          description: 'The recurring questions: quoting and word splitting, [ versus [[, set -e caveats, pipes and subshells, exit codes, signals and trap, cron pitfalls, and when to switch to Python.',
          concepts: ['Quoting and expansion questions', 'Error handling questions', 'Process and signal questions', 'Tooling and portability questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['What is the difference between $@ and $*?', '"$@" keeps each argument separate; "$*" joins them into one word.'],
            ['When should a shell script become Python?', 'When it needs data structures, error handling or parsing beyond simple text.'],
          ],
          style: 'reading',
        },
        {
          title: 'Command-line challenges',
          description: 'Timed one-liner tasks interviewers ask: find the largest files, count unique visitors, replace text across files, find duplicate lines, and tail a log for errors.',
          concepts: ['Find and sort by size', 'Count unique values', 'Bulk find and replace', 'Detect duplicates', 'Follow logs with tail -f'],
          quiz: [
            ['How do you find the five largest files under a directory?', 'find . -type f -printf \'%s %p\\n\' | sort -rn | head -5'],
            ['How do you replace foo with bar in all .txt files?', 'grep -rl foo --include=*.txt . | xargs sed -i \'s/foo/bar/g\''],
          ],
        },
      ],
    },
  ],
})
