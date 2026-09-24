import { defineTrack } from '../define'

export const c = defineTrack({
  id: 'track-c',
  title: 'C Programming',
  description: 'C from the first compiled program to systems code you can trust: the toolchain, pointers and arrays, manual memory management, structs and hand-built data structures, stdio and POSIX I/O, pthreads and atomics, sanitizers, secure coding, and projects such as a shell, an HTTP server and a memory allocator.',
  family: 'Programming Languages',
  kind: 'language',
  icon: '🔧',
  tags: ['c', 'systems programming', 'pointers', 'memory management', 'posix', 'embedded', 'gcc', 'clang'],
  languages: ['C'],
  explainMode: 'concept',
  code: { label: 'C', id: 'c', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'A compiler, a build tool and a debugger before the first pointer.',
      topics: [
        {
          title: 'Installing a C toolchain',
          description: 'Getting gcc or clang (and MSVC or MinGW on Windows), checking the version, choosing a C standard, and understanding what the compiler, assembler and linker each contribute to an executable.',
          concepts: ['gcc, clang and MSVC', 'Verifying the installed compiler', 'Choosing a C standard with -std', 'Compiler, assembler and linker roles'],
          quiz: [
            ['Which flag selects the C17 standard in gcc?', '-std=c17'],
            ['What does the linker do?', 'Combines object files and libraries into one executable, resolving symbol references.'],
            ['Which tool on Windows provides gcc?', 'MinGW-w64 (or MSYS2), or use clang or MSVC.'],
          ],
        },
        {
          title: 'Compiling and linking from the command line',
          description: 'The four stages behind gcc main.c: preprocessing, compiling to assembly, assembling to object files and linking, plus the flags every build should use: -Wall -Wextra -g and an optimisation level.',
          concepts: ['Preprocess, compile, assemble, link', 'Object files and -c', 'Warnings with -Wall and -Wextra', 'Debug info and optimisation levels'],
          quiz: [
            ['What does gcc -c main.c produce?', 'main.o, an object file that is not yet linked.'],
            ['Why compile with -Wall -Wextra?', 'They surface bugs such as unused variables and implicit conversions that would otherwise compile silently.'],
            ['What does -g add?', 'Debug symbols so gdb can map machine code back to source lines.'],
          ],
          prereqs: ['Installing a C toolchain'],
        },
        {
          title: 'Make and Makefiles',
          description: 'Describing a build as targets, prerequisites and recipes so only changed files are recompiled; pattern rules, variables such as CC and CFLAGS, and automatic header dependency tracking with -MMD.',
          concepts: ['Targets, prerequisites and recipes', 'Pattern rules and automatic variables', 'CC, CFLAGS and LDFLAGS', 'Dependency generation with -MMD', 'Phony targets like clean'],
          quiz: [
            ['Why does make rebuild only some files?', 'It compares timestamps: a target is rebuilt only when a prerequisite is newer.'],
            ['What does $@ mean in a recipe?', 'The name of the target being built.'],
            ['Why declare clean as .PHONY?', 'So make runs it even if a file named clean exists.'],
          ],
          prereqs: ['Compiling and linking from the command line'],
        },
      ],
    },
    {
      title: 'Syntax, Types and Program Structure',
      topics: [
        {
          title: 'Anatomy of a C program',
          description: 'What main, #include <stdio.h>, function declarations and return codes each do, how execution starts and ends, and why a C file is a flat list of declarations rather than a class hierarchy.',
          concepts: ['main and its return value', 'Including headers', 'Declarations before use', 'Statements, blocks and semicolons', 'Comments and formatting conventions'],
          quiz: [
            ['What does return 0 from main signal?', 'Successful termination to the operating system.'],
            ['Why must a function be declared before it is called?', 'The compiler needs its signature to check arguments and generate a correct call.'],
          ],
        },
        {
          title: 'The preprocessor and macros',
          description: 'Textual substitution before compilation: #include, object-like and function-like #define, conditional compilation with #if and #ifdef, include guards, and the parenthesisation and double-evaluation traps of macros.',
          concepts: ['#include and search paths', 'Object-like and function-like macros', 'Conditional compilation', 'Include guards and #pragma once', 'Macro pitfalls and double evaluation'],
          quiz: [
            ['Why write #define SQUARE(x) ((x)*(x)) with all the parentheses?', 'So SQUARE(a+1) expands to ((a+1)*(a+1)) instead of a+1*a+1.'],
            ['What problem do include guards solve?', 'A header included twice would redefine its types and break compilation.'],
            ['What does gcc -E show?', 'The preprocessed source with macros expanded and headers pasted in.'],
          ],
          prereqs: ['Anatomy of a C program'],
        },
        {
          title: 'Integer and floating types',
          description: 'char, short, int, long, their unsigned forms and float, double and long double: implementation-defined sizes, sizeof, limits.h, and why stdint.h types like int32_t and size_t make intent and portability explicit.',
          concepts: ['Signed and unsigned integers', 'sizeof and implementation-defined sizes', 'stdint.h fixed-width types', 'size_t and ptrdiff_t', 'float and double precision'],
          quiz: [
            ['Is char signed or unsigned?', 'Implementation-defined; use signed char or unsigned char when it matters.'],
            ['Which type should hold a sizeof result or array index?', 'size_t.'],
            ['What is INT_MAX on a typical 32-bit int?', '2147483647.'],
          ],
        },
        {
          title: 'Storage classes, scope and lifetime',
          description: 'Where a variable lives and how long: block scope automatics on the stack, static storage for file-local and persistent values, extern for sharing across files, and why uninitialised automatics hold garbage.',
          concepts: ['Block and file scope', 'auto and static storage duration', 'static for internal linkage', 'extern declarations', 'Uninitialised variables'],
          quiz: [
            ['What does static mean on a file-scope function?', 'Internal linkage: the function is invisible to other translation units.'],
            ['What is the initial value of a static int with no initialiser?', 'Zero.'],
            ['What is the initial value of a local int with no initialiser?', 'Indeterminate; reading it is undefined behaviour.'],
          ],
          prereqs: ['Anatomy of a C program'],
        },
        {
          title: 'Conversions, promotions and casts',
          description: 'The implicit rules that turn char into int, mix signed with unsigned and truncate on assignment, the usual arithmetic conversions, and when an explicit cast is needed versus when it hides a bug.',
          concepts: ['Integer promotion', 'Usual arithmetic conversions', 'Signed to unsigned surprises', 'Narrowing on assignment', 'Explicit casts and when to avoid them'],
          quiz: [
            ['What is the result of -1 < 1u?', 'False, because -1 converts to a huge unsigned value.'],
            ['What type does the expression c1 + c2 have when both are char?', 'int, because of integer promotion.'],
          ],
          prereqs: ['Integer and floating types'],
        },
      ],
    },
    {
      title: 'Operators, Control Flow and Functions',
      topics: [
        {
          title: 'Arithmetic, bitwise and logical operators',
          description: 'Integer division and modulo with negatives, shifts and masks for flags, the difference between & and &&, precedence traps like a & b == c, and the compound assignment and increment forms.',
          concepts: ['Integer division and modulo', 'Bitwise AND, OR, XOR and NOT', 'Shifts and bit masks', 'Precedence traps', 'Compound assignment and increment'],
          quiz: [
            ['What is -7 / 2 in C?', '-3, because integer division truncates toward zero.'],
            ['How do you test whether bit 3 is set in flags?', 'flags & (1u << 3)'],
            ['Why is a & b == c usually wrong?', '== binds tighter than &, so it computes a & (b == c).'],
          ],
        },
        {
          title: 'Undefined behaviour and sequence points',
          description: 'Why C compilers may assume signed overflow, out-of-bounds access and uninitialised reads never happen, how that assumption produces baffling optimised code, and the modification-order rules that make i = i++ meaningless.',
          concepts: ['Undefined, unspecified and implementation-defined', 'Signed overflow', 'Sequence points and unsequenced writes', 'Optimiser consequences of UB', 'Detecting UB with -fsanitize=undefined'],
          quiz: [
            ['Is unsigned overflow undefined?', 'No, unsigned arithmetic wraps modulo 2^n; signed overflow is undefined.'],
            ['Why is i = i++ + 1 a problem?', 'i is modified twice without a sequence point, so the behaviour is undefined.'],
            ['Which flag makes the compiler report UB at runtime?', '-fsanitize=undefined'],
          ],
          prereqs: ['Arithmetic, bitwise and logical operators'],
        },
        {
          title: 'Conditions and switch',
          description: 'if/else chains, the integer-only nature of switch, fallthrough as both a feature and a bug, default placement, and why every non-zero value is true while assignment inside a condition is a classic typo.',
          concepts: ['if, else and truthiness of integers', 'switch on integers and enums', 'Fallthrough and break', 'The = versus == mistake', 'Ternary operator'],
          quiz: [
            ['Can switch dispatch on a string?', 'No, only integer types and enums.'],
            ['What happens when a case has no break?', 'Execution falls through into the next case.'],
          ],
        },
        {
          title: 'Loops and jumps',
          description: 'for, while and do-while, loop variables declared in the for header since C99, break and continue, and the legitimate uses of goto for error cleanup versus the spaghetti it is famous for.',
          concepts: ['for, while and do-while', 'Loop variable scope in C99', 'break and continue', 'goto for cleanup', 'Off-by-one errors'],
          quiz: [
            ['When does do-while run its body?', 'At least once, before the condition is checked.'],
            ['What is the common loop bound bug with arrays?', 'Using <= length instead of < length, reading one past the end.'],
          ],
          prereqs: ['Conditions and switch'],
        },
        {
          title: 'Functions, prototypes and the call stack',
          description: 'Declaring prototypes in headers, pass-by-value semantics that copy every argument, returning values, recursion, stack frames and why returning the address of a local variable is a bug.',
          concepts: ['Prototypes and definitions', 'Pass by value', 'Recursion and stack depth', 'Stack frames', 'Returning pointers to locals'],
          quiz: [
            ['How can a function modify a caller\'s variable?', 'The caller passes its address and the function writes through the pointer.'],
            ['Why is return &local wrong?', 'The local\'s stack frame is gone after return, so the pointer dangles.'],
            ['What does an empty parameter list () mean in old C?', 'Unspecified arguments; write (void) for no parameters.'],
          ],
        },
      ],
    },
    {
      title: 'Pointers and Arrays',
      topics: [
        {
          title: 'Pointer fundamentals',
          description: 'Addresses as values: declaring pointers, & and *, NULL, pointer types and why they matter, pointers to pointers, and reading declarations like int *const p from the inside out.',
          concepts: ['Address-of and dereference', 'NULL and null checks', 'Pointer types and void *', 'Pointers to pointers', 'const with pointers'],
          quiz: [
            ['What is the difference between const int *p and int *const p?', 'The first points to a constant int; the second is a constant pointer to a mutable int.'],
            ['What happens when you dereference NULL?', 'Undefined behaviour, usually a segmentation fault.'],
          ],
          prereqs: ['Functions, prototypes and the call stack'],
        },
        {
          title: 'Arrays and pointer decay',
          description: 'Fixed-size arrays laid out contiguously, how an array name decays to a pointer to its first element in most expressions, why a function cannot receive an array by value, and where sizeof stops working.',
          concepts: ['Array declaration and initialisation', 'Decay to pointer', 'sizeof on arrays versus pointers', 'Passing arrays with a length', 'Designated initialisers'],
          quiz: [
            ['What does sizeof(arr) / sizeof(arr[0]) give inside a function that received arr as a parameter?', 'Wrong answer: arr is a pointer there, so it divides the pointer size.'],
            ['Is a[i] the same as *(a + i)?', 'Yes, by definition.'],
          ],
          prereqs: ['Pointer fundamentals'],
        },
        {
          title: 'Pointer arithmetic and bounds',
          description: 'Adding integers to pointers moves by element size, subtracting pointers gives an element count, one-past-the-end is the only legal out-of-range pointer, and iterating with pointers versus indices.',
          concepts: ['Scaling by element size', 'Pointer subtraction and ptrdiff_t', 'One past the end', 'Comparing pointers', 'Iterating with pointers'],
          quiz: [
            ['If p is an int * and ints are 4 bytes, what does p + 1 add to the address?', '4 bytes.'],
            ['Is computing arr + len legal?', 'Yes, one past the end is allowed for comparison, but it must not be dereferenced.'],
          ],
          prereqs: ['Arrays and pointer decay'],
        },
        {
          title: 'Multidimensional arrays and arrays of pointers',
          description: 'Row-major 2D arrays, passing them to functions with the inner dimension fixed, the difference between int m[3][4] and int *rows[3], variable-length arrays, and building jagged arrays on the heap.',
          concepts: ['Row-major layout', 'Passing 2D arrays to functions', 'Array of pointers versus 2D array', 'Variable-length arrays', 'Jagged arrays on the heap'],
          quiz: [
            ['Where is m[1][0] stored relative to m[0][3] in int m[2][4]?', 'Immediately after it, because rows are contiguous.'],
            ['What must a function parameter know to index a 2D array?', 'All dimensions except the first.'],
          ],
          prereqs: ['Pointer arithmetic and bounds'],
        },
        {
          title: 'Function pointers and callbacks',
          description: 'Storing and calling functions through pointers, the declaration syntax and typedefs that tame it, passing comparators to qsort and bsearch, dispatch tables, and callbacks with a void * context argument.',
          concepts: ['Declaring function pointers', 'typedef for function pointer types', 'qsort and bsearch comparators', 'Dispatch tables', 'Callbacks with a context pointer'],
          quiz: [
            ['How do you declare a pointer to a function taking int and returning int?', 'int (*fp)(int);'],
            ['What must a qsort comparator return?', 'Negative, zero or positive depending on the order of the two elements.'],
          ],
          prereqs: ['Pointer fundamentals'],
        },
      ],
    },
    {
      title: 'Memory Management',
      topics: [
        {
          title: 'The stack and the heap',
          description: 'Automatic variables live in stack frames that vanish on return; heap memory lives until freed. Stack size limits, why large or dynamically sized buffers go on the heap, and how to picture a process address space.',
          concepts: ['Stack frames and automatic lifetime', 'Heap and dynamic lifetime', 'Stack size limits and overflow', 'Process address space layout', 'Static data segments'],
          quiz: [
            ['Why not declare int buf[10000000] inside a function?', 'It exceeds the default stack size and crashes.'],
            ['Which memory outlives the function that created it?', 'Heap allocations and static storage.'],
          ],
        },
        {
          title: 'malloc, calloc, realloc and free',
          description: 'Requesting bytes from the allocator, zero-initialisation with calloc, growing with realloc and its move semantics, checking for NULL, and the sizeof(*p) idiom that keeps allocation sizes correct.',
          concepts: ['malloc and sizeof idioms', 'calloc and zeroed memory', 'realloc and moved blocks', 'Checking for allocation failure', 'free and setting pointers to NULL'],
          quiz: [
            ['Why write p = malloc(n * sizeof *p)?', 'The size follows the pointee type automatically if the type changes.'],
            ['What is wrong with p = realloc(p, n)?', 'If realloc fails it returns NULL and the original block is leaked.'],
            ['Does malloc initialise memory?', 'No; calloc zeroes it.'],
          ],
          prereqs: ['The stack and the heap'],
        },
        {
          title: 'Memory bugs: leaks, double free and use after free',
          description: 'The bug classes that make C infamous, how each corrupts the heap or leaks, why they often appear far from the cause, and the discipline (single owner, free at one place, NULL after free) that prevents them.',
          concepts: ['Memory leaks', 'Double free', 'Use after free and dangling pointers', 'Heap corruption symptoms', 'Prevention discipline'],
          quiz: [
            ['What is a dangling pointer?', 'A pointer to memory that has been freed or whose lifetime ended.'],
            ['Why does a double free often crash later, not at the call?', 'It corrupts allocator metadata that a later malloc or free trips over.'],
          ],
          prereqs: ['malloc, calloc, realloc and free'],
        },
        {
          title: 'Ownership conventions in C APIs',
          description: 'Without a compiler enforcing ownership, C code documents it: who frees what, create/destroy function pairs, returning heap memory versus filling a caller buffer, and const to signal borrowed data.',
          concepts: ['Caller-owns versus callee-owns', 'create and destroy pairs', 'Caller-provided buffers', 'const as a borrow signal', 'Documenting ownership in headers'],
          quiz: [
            ['What does a function returning char * from malloc obligate the caller to do?', 'Free it.'],
            ['Why prefer a caller-provided buffer for small results?', 'No heap allocation and no ownership hand-off.'],
          ],
          prereqs: ['Memory bugs: leaks, double free and use after free'],
        },
        {
          title: 'Alignment, padding and struct layout',
          description: 'Why the compiler inserts padding between struct members, how member order changes sizeof, alignof and _Alignas in C11, and why unaligned access is undefined on some architectures.',
          concepts: ['Natural alignment rules', 'Padding between members', 'Reordering members to shrink structs', 'alignof and _Alignas', 'Packed structs and their costs'],
          quiz: [
            ['What is sizeof(struct { char c; int i; }) on a typical 64-bit system?', '8, because 3 bytes of padding follow c.'],
            ['How can you shrink a struct without removing fields?', 'Order members from largest to smallest alignment.'],
          ],
          prereqs: ['The stack and the heap'],
        },
      ],
    },
    {
      title: 'Structs, Unions and Data Structures',
      topics: [
        {
          title: 'Structs and typedef',
          description: 'Grouping fields into a value type, initialising with designated initialisers, copying by assignment, passing by pointer to avoid copies, the -> operator, and typedef to give the struct a clean name.',
          concepts: ['Declaring and initialising structs', 'Struct assignment copies', 'Pointer access with ->', 'typedef struct idiom', 'Nested structs'],
          quiz: [
            ['Does a = b copy the whole struct?', 'Yes, all members are copied by value.'],
            ['What does p->x mean?', '(*p).x, accessing member x through a pointer.'],
          ],
          prereqs: ['Alignment, padding and struct layout'],
        },
        {
          title: 'Unions, enums and bit-fields',
          description: 'Unions overlay members on the same bytes, enums name integer constants, and bit-fields pack flags: how tagged unions model variants safely, and where type punning through unions is allowed.',
          concepts: ['Union storage and active member', 'Tagged unions', 'enum constants and their type', 'Bit-fields', 'Type punning rules'],
          quiz: [
            ['How big is a union?', 'As big as its largest member, plus alignment padding.'],
            ['What is a tagged union?', 'A struct holding an enum tag plus a union, where the tag records which member is valid.'],
          ],
          prereqs: ['Structs and typedef'],
        },
        {
          title: 'Linked lists in C',
          description: 'Building singly and doubly linked lists from heap nodes, insertion and deletion with pointer-to-pointer tricks, traversal, freeing every node, and the intrusive list pattern used in kernels.',
          concepts: ['Node structs and self-reference', 'Insert and delete with pointer to pointer', 'Traversal and search', 'Freeing a list', 'Intrusive lists'],
          quiz: [
            ['Why use a struct node ** when deleting from a list?', 'It lets one code path update either the head or a previous node\'s next.'],
            ['What is an intrusive list?', 'The list link is embedded inside the data struct rather than wrapping it.'],
          ],
          prereqs: ['Structs and typedef', 'malloc, calloc, realloc and free'],
        },
        {
          title: 'Dynamic arrays and growth',
          description: 'A struct of pointer, length and capacity that doubles with realloc for amortised O(1) append, with bounds-checked access, shrink-to-fit, and why doubling beats growing by a constant.',
          concepts: ['Length and capacity', 'Amortised doubling with realloc', 'Bounds-checked access', 'Removing elements', 'Generic dynamic arrays with macros'],
          quiz: [
            ['Why double capacity rather than add 10?', 'Doubling gives amortised O(1) appends; constant growth makes appends O(n) overall.'],
            ['What must happen after realloc moves the block?', 'All pointers into the old block are invalid and must be recomputed.'],
          ],
          prereqs: ['malloc, calloc, realloc and free'],
        },
        {
          title: 'Hash tables in C',
          description: 'A hash function, an array of buckets, and either chaining or open addressing to resolve collisions; load factor and resizing, string keys with FNV-1a, and deletion with tombstones.',
          concepts: ['Hash functions for strings and integers', 'Separate chaining', 'Open addressing and probing', 'Load factor and resizing', 'Deletion and tombstones'],
          quiz: [
            ['What does load factor measure?', 'Entries divided by buckets; high values degrade lookup time.'],
            ['Why do open-addressing tables need tombstones?', 'Removing an entry outright would break probe chains passing through it.'],
          ],
          prereqs: ['Dynamic arrays and growth'],
        },
        {
          title: 'Opaque types and encapsulation',
          description: 'Hiding a struct definition behind an incomplete type in the header so callers use only the API: why this preserves ABI, the handle pattern, and how it gives C the information hiding OOP promises.',
          concepts: ['Incomplete types in headers', 'Handle pattern', 'ABI stability', 'Accessor functions', 'Static helpers in the .c file'],
          quiz: [
            ['Can a caller declare a struct stack s; when only struct stack; is in the header?', 'No, the size is unknown; they must use a pointer from a create function.'],
            ['What is the benefit of an opaque type for library authors?', 'Fields can change without recompiling callers.'],
          ],
          prereqs: ['Structs and typedef', 'Ownership conventions in C APIs'],
        },
      ],
    },
    {
      title: 'Strings and Text Processing',
      topics: [
        {
          title: 'C strings and string.h',
          description: 'A string is a char array ended by a null byte: string literals and their immutability, strlen versus sizeof, strcpy, strcat, strcmp and strtok, and why every one of them trusts the terminator.',
          concepts: ['Null terminator and strlen', 'String literals and read-only memory', 'strcpy, strcat and strcmp', 'strtok and its statefulness', 'strchr and strstr'],
          quiz: [
            ['How many bytes does "hello" occupy?', '6, including the null terminator.'],
            ['What does strcmp return when strings are equal?', '0.'],
            ['Why is modifying a string literal undefined?', 'Literals may live in read-only memory.'],
          ],
          prereqs: ['Arrays and pointer decay'],
        },
        {
          title: 'Safe string handling with bounded functions',
          description: 'Avoiding overflow by always passing a size: snprintf as the universal safe builder, the strncpy trap of no terminator, strlcpy and memcpy with explicit lengths, and tracking lengths explicitly instead of rescanning.',
          concepts: ['snprintf as a safe builder', 'The strncpy no-terminator trap', 'memcpy and memmove with lengths', 'Length-tracked string structs', 'Truncation detection'],
          quiz: [
            ['What does snprintf return?', 'The number of characters that would have been written, so a value >= size means truncation.'],
            ['When must memmove be used instead of memcpy?', 'When the source and destination overlap.'],
          ],
          prereqs: ['C strings and string.h'],
        },
        {
          title: 'Parsing numbers and characters',
          description: 'ctype.h classification and case conversion, strtol and strtod with their end-pointer and errno reporting, why atoi is unsafe, and tokenising input by hand without strtok.',
          concepts: ['ctype.h classification', 'strtol and end pointers', 'Detecting overflow with errno', 'Why atoi is unsafe', 'Manual tokenising'],
          quiz: [
            ['How does strtol report that no digits were found?', 'endptr equals the input pointer.'],
            ['Why pass (unsigned char)c to isdigit?', 'ctype functions require values in unsigned char range or EOF.'],
          ],
          prereqs: ['C strings and string.h'],
        },
        {
          title: 'printf and scanf formatting',
          description: 'Format specifiers and length modifiers, width and precision, the PRId64 macros for fixed-width types, and why scanf with %s is dangerous while fgets plus sscanf is the safer pattern.',
          concepts: ['Format specifiers and length modifiers', 'Width, precision and flags', 'PRId64 and portable formats', 'scanf hazards', 'fgets plus sscanf pattern'],
          quiz: [
            ['How do you print a size_t portably?', 'printf("%zu", n)'],
            ['Why is scanf("%s", buf) unsafe?', 'It has no length limit, so long input overflows buf.'],
          ],
          prereqs: ['C strings and string.h'],
        },
      ],
    },
    {
      title: 'Errors, Files and I/O',
      topics: [
        {
          title: 'Return codes and errno',
          description: 'C signals failure through return values: -1 or NULL plus a global errno, perror and strerror for messages, checking every call, and designing your own functions to return status separately from results.',
          concepts: ['Sentinel return values', 'errno and when it is set', 'perror and strerror', 'Check every call', 'Status codes versus out-parameters'],
          quiz: [
            ['Is errno reset to 0 on success?', 'No, only set on failure; clear it yourself before calls where you need to distinguish.'],
            ['What does fopen return on failure?', 'NULL, with errno set.'],
          ],
        },
        {
          title: 'Cleanup with goto and early return',
          description: 'Handling multiple resources without exceptions: the single-exit pattern with goto labels that unwind in reverse order, initialising pointers to NULL so cleanup is always safe, and keeping error paths tested.',
          concepts: ['Single-exit cleanup pattern', 'Reverse-order release', 'Initialising to NULL for safe cleanup', 'Early return for simple cases', 'Testing error paths'],
          quiz: [
            ['Why initialise every resource pointer to NULL at the top of a function?', 'So the cleanup label can free or close unconditionally.'],
            ['In what order should resources be released?', 'Reverse of acquisition.'],
          ],
          prereqs: ['Return codes and errno'],
        },
        {
          title: 'File I/O with stdio',
          description: 'FILE * streams: fopen modes, fgets for lines, fread and fwrite for blocks, fseek and ftell, buffering and fflush, and always checking fclose because writes can fail at the end.',
          concepts: ['fopen modes and FILE *', 'Line reading with fgets', 'fread and fwrite', 'fseek, ftell and rewind', 'Buffering, fflush and fclose'],
          quiz: [
            ['What does "a" mode do?', 'Opens for appending, creating the file if needed.'],
            ['How do you detect end of file versus an error after a read loop?', 'Check feof and ferror on the stream.'],
          ],
          prereqs: ['Return codes and errno'],
        },
        {
          title: 'Binary files and endianness',
          description: 'Writing structs directly is fast but non-portable: padding, endianness and type sizes differ. Serialising field by field with fixed-width types and explicit byte order, and reading headers safely.',
          concepts: ['Writing structs versus fields', 'Big-endian and little-endian', 'Byte-order conversion functions', 'Fixed-width types in file formats', 'Validating file headers'],
          quiz: [
            ['Why can a struct written with fwrite fail to load on another machine?', 'Different padding, endianness or type sizes.'],
            ['What does htonl do?', 'Converts a 32-bit value from host byte order to network (big-endian) order.'],
          ],
          prereqs: ['File I/O with stdio'],
        },
        {
          title: 'Command-line arguments and environment',
          description: 'argc and argv, parsing options with getopt, reading environment variables with getenv, exit codes and EXIT_FAILURE, and writing diagnostics to stderr so pipelines stay clean.',
          concepts: ['argc and argv', 'Parsing options with getopt', 'getenv and configuration', 'Exit codes and exit()', 'stdout versus stderr'],
          quiz: [
            ['What is argv[0]?', 'The program name as invoked.'],
            ['Where should error messages go?', 'stderr, so they do not pollute piped output.'],
          ],
          prereqs: ['Return codes and errno'],
        },
      ],
    },
    {
      title: 'Headers, Libraries and Build Systems',
      topics: [
        {
          title: 'Headers and translation units',
          description: 'Each .c file compiles alone; headers carry declarations shared between them. Declaration versus definition, the one-definition rule, extern variables, inline functions in headers and what to keep private with static.',
          concepts: ['Translation units', 'Declaration versus definition', 'One definition rule', 'extern globals', 'What belongs in a header'],
          quiz: [
            ['What happens if two .c files define int counter; and link together?', 'A duplicate symbol link error (or a tentative definition merge with older compilers).'],
            ['Where should a global variable be defined?', 'In exactly one .c file, with extern in the header.'],
          ],
          prereqs: ['The preprocessor and macros'],
        },
        {
          title: 'Static and shared libraries',
          description: 'Bundling object files into a .a archive linked at build time or a .so/.dll loaded at run time, -l and -L flags, link order, symbol visibility, and how the dynamic loader finds libraries.',
          concepts: ['Archives with ar', 'Shared objects and -fPIC', '-l, -L and link order', 'Runtime search paths', 'Symbol visibility'],
          quiz: [
            ['Why does the order of -l flags matter?', 'The linker resolves symbols left to right, so libraries must follow the objects that use them.'],
            ['What does -fPIC enable?', 'Position-independent code needed for shared libraries.'],
          ],
          prereqs: ['Headers and translation units'],
        },
        {
          title: 'CMake for C projects',
          description: 'Describing targets, sources, include directories and link dependencies in CMakeLists.txt, out-of-source builds, Debug and Release configurations, and finding system libraries with find_package.',
          concepts: ['CMakeLists.txt and targets', 'Out-of-source builds', 'Build types and flags', 'find_package and linking', 'Subdirectories and options'],
          quiz: [
            ['What does target_link_libraries do?', 'Links a target against libraries and propagates their usage requirements.'],
            ['Why build in a separate directory?', 'Keeps generated files out of the source tree and allows several configurations.'],
          ],
          prereqs: ['Make and Makefiles'],
        },
        {
          title: 'The C standard library map',
          description: 'Knowing what exists so you do not rewrite it: stdlib for memory and conversion, string, stdio, math, time, ctype, assert, limits, stdint, stdbool and errno, and which functions are traps.',
          concepts: ['stdlib.h utilities', 'math.h and linking with -lm', 'time.h and clocks', 'assert.h and NDEBUG', 'Functions to avoid'],
          quiz: [
            ['Why does calling sqrt fail to link on Linux?', 'The math library must be linked with -lm.'],
            ['What disables assert?', 'Defining NDEBUG before including assert.h.'],
          ],
        },
        {
          title: 'C standards and portability',
          description: 'What changed from C89 through C99, C11, C17 and C23 (mixed declarations, VLAs, _Generic, threads, nullptr, #embed), feature test macros for POSIX, and writing code that compiles cleanly on gcc, clang and MSVC.',
          concepts: ['C89 to C99 changes', 'C11 and C17 additions', 'C23 additions', 'Feature test macros', 'Portability across compilers'],
          quiz: [
            ['Which standard introduced declarations anywhere in a block?', 'C99.'],
            ['What does _POSIX_C_SOURCE control?', 'Which POSIX declarations the system headers expose.'],
          ],
        },
      ],
    },
    {
      title: 'Systems Programming and Concurrency',
      topics: [
        {
          title: 'Designing C APIs',
          description: 'Naming with a prefix, init and destroy pairs, returning status codes with out-parameters, const-correctness, avoiding hidden global state, and versioning headers so callers can depend on them.',
          concepts: ['Prefixes and namespacing', 'init and destroy symmetry', 'Status codes with out-parameters', 'const-correctness', 'Avoiding global state'],
          quiz: [
            ['Why prefix every public function with the library name?', 'C has no namespaces, so prefixes prevent symbol clashes.'],
            ['What does a const char * parameter promise?', 'The function will not modify the pointed-to string.'],
          ],
          prereqs: ['Opaque types and encapsulation'],
        },
        {
          title: 'Generic code with void pointers and macros',
          description: 'C has no templates, so generic containers pass void * with an element size, macros generate type-specific code, X macros keep enums and strings in sync, and _Generic dispatches on type.',
          concepts: ['void * and element size', 'Type-generating macros', 'X macros', '_Generic selection', 'Trade-offs of each approach'],
          quiz: [
            ['How does qsort sort any element type?', 'It takes a void * base, element size and a comparator callback.'],
            ['What does _Generic do?', 'Selects an expression at compile time based on the type of its controlling argument.'],
          ],
          prereqs: ['Function pointers and callbacks'],
        },
        {
          title: 'POSIX system calls',
          description: 'Below stdio: open, read, write and close with file descriptors, short reads and writes, stat, directory listing, and mmap for mapping files into memory; what a system call costs versus a library call.',
          concepts: ['File descriptors', 'open, read, write and close', 'Handling short reads', 'stat and directories', 'mmap basics'],
          quiz: [
            ['Why loop around read?', 'It may return fewer bytes than requested.'],
            ['What is the difference between fwrite and write?', 'fwrite buffers in user space; write is a system call on a file descriptor.'],
          ],
          prereqs: ['File I/O with stdio'],
        },
        {
          title: 'Signals and time',
          description: 'Registering handlers with sigaction, the tiny set of async-signal-safe functions, the volatile sig_atomic_t flag pattern, and measuring time with clock_gettime and monotonic clocks.',
          concepts: ['sigaction and handlers', 'Async-signal-safe functions', 'volatile sig_atomic_t flags', 'clock_gettime and monotonic time', 'Sleeping and timers'],
          quiz: [
            ['Why not call printf inside a signal handler?', 'It is not async-signal-safe and may deadlock or corrupt state.'],
            ['Which clock should measure elapsed time?', 'CLOCK_MONOTONIC, which is unaffected by wall-clock changes.'],
          ],
          prereqs: ['POSIX system calls'],
        },
        {
          title: 'Threads with pthreads',
          description: 'Creating threads with pthread_create, passing arguments through a struct, joining and detaching, thread-local storage, and why sharing stack variables with a thread that outlives the function is a bug.',
          concepts: ['pthread_create and argument structs', 'join and detach', 'Return values from threads', 'Thread-local storage', 'Lifetime of shared data'],
          quiz: [
            ['How do you pass several arguments to a thread?', 'Pack them in a struct and pass its address.'],
            ['What happens if you never join or detach a thread?', 'Its resources leak until the process exits.'],
          ],
          prereqs: ['Functions, prototypes and the call stack'],
        },
        {
          title: 'Mutexes and condition variables',
          description: 'Protecting shared state with pthread_mutex, spotting data races, waiting for a condition without spinning, the spurious-wakeup loop, and ordering locks to avoid deadlock.',
          concepts: ['Data races', 'pthread_mutex lock and unlock', 'Condition variable wait loop', 'Producer-consumer queue', 'Deadlock and lock ordering'],
          quiz: [
            ['Why wait on a condition variable inside a while loop?', 'Spurious wakeups and multiple waiters mean the condition may be false after waking.'],
            ['What causes deadlock with two mutexes?', 'Two threads acquiring them in opposite orders.'],
          ],
          prereqs: ['Threads with pthreads'],
        },
        {
          title: 'C11 atomics and memory ordering',
          description: 'stdatomic.h for lock-free counters and flags, why volatile is not a synchronisation tool, acquire and release semantics, and the cases where seq_cst is the only ordering you should use.',
          concepts: ['_Atomic types and operations', 'volatile is not atomic', 'Acquire and release ordering', 'Sequential consistency', 'Lock-free flags and counters'],
          quiz: [
            ['Is a plain int counter++ safe across threads?', 'No, it is a non-atomic read-modify-write and a data race.'],
            ['What does memory_order_release guarantee?', 'Writes before the release are visible to a thread that performs an acquire load of the same atomic.'],
          ],
          prereqs: ['Mutexes and condition variables'],
        },
        {
          title: 'Processes, pipes and IPC',
          description: 'fork to duplicate a process, exec to replace its image, wait to collect status, pipes and dup2 to connect stdout to stdin, and shared memory for higher-bandwidth inter-process communication.',
          concepts: ['fork and exec', 'wait and exit status', 'Pipes and dup2', 'Shared memory', 'Zombie and orphan processes'],
          quiz: [
            ['What does fork return in the child?', '0.'],
            ['Why close unused pipe ends?', 'Readers only see EOF once every write end is closed.'],
          ],
          prereqs: ['POSIX system calls'],
        },
      ],
    },
    {
      title: 'Testing, Debugging and Performance',
      topics: [
        {
          title: 'Unit testing in C',
          description: 'Structuring code so functions are testable, a minimal assert-based harness, frameworks such as Unity, CMocka and Check, running tests from make or ctest, and testing failure paths with injected allocators.',
          concepts: ['Minimal assert-based harness', 'Unity, CMocka and Check', 'Test targets in make and ctest', 'Injecting failures', 'Separating I/O from logic'],
          quiz: [
            ['Why keep parsing logic separate from file reading?', 'Pure functions on buffers are easy to test without files.'],
            ['How can you test out-of-memory handling?', 'Wrap malloc behind a function pointer that tests can make fail.'],
          ],
          prereqs: ['Make and Makefiles'],
        },
        {
          title: 'Debugging with gdb',
          description: 'Breakpoints, stepping, printing variables and structs, backtraces after a segfault, watchpoints for corrupted values, examining memory, and loading core dumps to debug crashes after the fact.',
          concepts: ['Breakpoints and stepping', 'Printing variables and memory', 'Backtraces and frames', 'Watchpoints', 'Core dumps'],
          quiz: [
            ['Which command shows the call stack after a crash?', 'bt (backtrace).'],
            ['What does a watchpoint do?', 'Stops execution whenever a variable or address changes.'],
          ],
          prereqs: ['Compiling and linking from the command line'],
        },
        {
          title: 'Sanitizers and Valgrind',
          description: 'AddressSanitizer for overflows and use-after-free, UndefinedBehaviorSanitizer, ThreadSanitizer for races, and Valgrind memcheck for leaks on unmodified binaries: what each catches and its cost.',
          concepts: ['AddressSanitizer', 'UndefinedBehaviorSanitizer', 'ThreadSanitizer', 'Valgrind memcheck', 'Reading sanitizer reports'],
          quiz: [
            ['Which flag enables AddressSanitizer?', '-fsanitize=address'],
            ['Can you combine ASan and TSan in one build?', 'No, they are incompatible; run separate builds.'],
          ],
          prereqs: ['Memory bugs: leaks, double free and use after free'],
        },
        {
          title: 'Profiling with perf and gprof',
          description: 'Measuring before optimising: sampling with perf, call-graph profiles with gprof, flame graphs, and separating hot loops from allocation overhead and I/O waits.',
          concepts: ['Sampling with perf', 'gprof and call graphs', 'Flame graphs', 'Hot loops versus allocation cost', 'Benchmark methodology'],
          quiz: [
            ['What does perf record collect?', 'Periodic samples of where the program is executing.'],
            ['Why benchmark with -O2 rather than -O0?', 'Unoptimised code has different hot spots and is not what ships.'],
          ],
        },
        {
          title: 'Cache-friendly data layout',
          description: 'Why memory access patterns dominate performance: cache lines, sequential versus random access, struct-of-arrays versus array-of-structs, false sharing between threads, and prefetch-friendly loops.',
          concepts: ['Cache lines and locality', 'Sequential versus pointer chasing', 'Struct of arrays', 'False sharing', 'Loop order for 2D arrays'],
          quiz: [
            ['Why is iterating a 2D array column by column slow?', 'It jumps a full row per step, missing cache on every access.'],
            ['What is false sharing?', 'Two threads writing different variables on the same cache line, forcing it to bounce between cores.'],
          ],
          prereqs: ['Multidimensional arrays and arrays of pointers'],
        },
        {
          title: 'Compiler optimisations, inline and restrict',
          description: 'What -O2 and -O3 do, inline as a hint, restrict to promise no aliasing, link-time optimisation, reading generated assembly with -S or Compiler Explorer, and why UB-free code optimises better.',
          concepts: ['Optimisation levels', 'inline and static inline', 'restrict and aliasing', 'Link-time optimisation', 'Reading assembly output'],
          quiz: [
            ['What does restrict promise the compiler?', 'That the pointer is the only way to access that memory in the scope.'],
            ['Does inline force inlining?', 'No, it is a hint; the optimiser decides.'],
          ],
          prereqs: ['Profiling with perf and gprof'],
        },
      ],
    },
    {
      title: 'Security',
      topics: [
        {
          title: 'Buffer overflows',
          description: 'How writing past an array corrupts adjacent variables and return addresses, stack smashing, the gets and strcpy culprits, and the defences: bounded functions, stack canaries, ASLR and non-executable stacks.',
          concepts: ['Stack smashing mechanics', 'Heap overflows', 'Dangerous functions to ban', 'Stack canaries and ASLR', 'Bounds checking discipline'],
          quiz: [
            ['Why was gets removed from C11?', 'It cannot limit input length, so it always allows overflow.'],
            ['What does a stack canary detect?', 'A write that overran a buffer and reached the saved return address.'],
          ],
          prereqs: ['Safe string handling with bounded functions'],
        },
        {
          title: 'Integer overflow and signed-unsigned pitfalls',
          description: 'Size calculations that wrap to small values, negative lengths becoming huge when converted to size_t, checked arithmetic with __builtin_add_overflow, and validating lengths before allocating or indexing.',
          concepts: ['Wraparound in size calculations', 'Negative to size_t conversion', 'Checked arithmetic builtins', 'Validating lengths before use', 'Time-of-check to time-of-use'],
          quiz: [
            ['What can go wrong with malloc(n * sizeof(T)) for user-supplied n?', 'The multiplication can wrap, allocating a tiny buffer that is then overflowed.'],
            ['What does __builtin_mul_overflow return?', 'True if the multiplication overflowed.'],
          ],
          prereqs: ['Conversions, promotions and casts'],
        },
        {
          title: 'Format strings and input validation',
          description: 'Why printf(user_input) lets attackers read and write memory, always using a literal format string, validating and bounding every external input, and treating file contents and network bytes as hostile.',
          concepts: ['Format string attacks', 'Literal format strings only', 'Validating external input', 'Treating file and network data as hostile', 'Fail closed'],
          quiz: [
            ['What is the safe way to print a user string?', 'printf("%s", input)'],
            ['Why validate a length field before using it?', 'A hostile file can claim a length far beyond the buffer.'],
          ],
          prereqs: ['printf and scanf formatting'],
        },
        {
          title: 'Hardening flags and fuzzing',
          description: 'Compiler defences (-fstack-protector, _FORTIFY_SOURCE, -D_GLIBCXX_ASSERTIONS, PIE, RELRO), warnings as errors, static analysis with clang-tidy and cppcheck, and coverage-guided fuzzing with libFuzzer or AFL.',
          concepts: ['Stack protector and FORTIFY_SOURCE', 'PIE and RELRO', 'Static analysis tools', 'Fuzzing with libFuzzer and AFL', 'CERT C guidelines'],
          quiz: [
            ['What does a fuzzer do?', 'Feeds mutated inputs to a program to find crashes and sanitizer reports.'],
            ['What does -D_FORTIFY_SOURCE=2 add?', 'Runtime bounds checks to common libc functions when sizes are known.'],
          ],
          prereqs: ['Sanitizers and Valgrind'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: Unix shell',
          description: 'Build a shell that reads a line, tokenises it, runs commands with fork and exec, supports pipes, redirection and background jobs, handles Ctrl-C without dying, and implements cd and exit as builtins.',
          concepts: ['Tokenise the command line', 'Fork, exec and wait', 'Pipes and redirection', 'Signal handling for the prompt', 'Builtins and job control'],
          quiz: [
            ['Why must cd be a builtin?', 'A child process cannot change the parent shell\'s working directory.'],
            ['How does a | b get wired up?', 'A pipe is created and dup2 connects a\'s stdout and b\'s stdin to it before exec.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: HTTP server with sockets',
          description: 'Write a static-file HTTP/1.0 server with socket, bind, listen and accept, parse request lines and headers safely, serve files with correct status codes and content types, and handle many clients with threads or poll.',
          concepts: ['Socket setup and accept loop', 'Parsing the request safely', 'Serving files and status codes', 'Concurrency with threads or poll', 'Load testing and hardening'],
          quiz: [
            ['What must you check when parsing the request path?', 'That it cannot escape the document root with .. segments.'],
            ['Why set SO_REUSEADDR?', 'So the server can rebind its port immediately after a restart.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: memory allocator',
          description: 'Implement malloc, free and realloc on top of sbrk or mmap with a free list, block headers, splitting and coalescing, alignment guarantees, and a test suite that compares against the system allocator.',
          concepts: ['Block headers and free list', 'Splitting and coalescing', 'Alignment guarantees', 'Growing the heap', 'Stress testing against libc'],
          quiz: [
            ['Why coalesce adjacent free blocks?', 'To fight fragmentation so large requests can be satisfied.'],
            ['What alignment must malloc guarantee?', 'Suitable for any fundamental type, typically 16 bytes on 64-bit.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: persistent key-value store',
          description: 'Build a command-line store that appends set and delete records to a log, rebuilds an in-memory hash table on start, compacts the log, and survives crashes mid-write thanks to checksums and fsync.',
          concepts: ['Append-only log format', 'Rebuilding the index on start', 'Compaction', 'Checksums and crash safety', 'CLI and tests'],
          quiz: [
            ['Why append instead of rewriting the file?', 'Appends are fast and crash-safe; a torn write only affects the last record.'],
            ['What does fsync guarantee?', 'Data is flushed to stable storage before it returns.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: JSON parser',
          description: 'Write a recursive-descent JSON parser producing a tagged-union value tree, with a tokenizer, UTF-8 string unescaping, number parsing, precise error positions, a serialiser back to text, and fuzz testing.',
          concepts: ['Tokenizer', 'Recursive descent over the grammar', 'Tagged union value tree', 'Escapes and UTF-8', 'Fuzzing and error reporting'],
          quiz: [
            ['How does the parser represent a JSON value that can be any type?', 'A struct with a type tag and a union of payloads.'],
            ['Why fuzz a parser?', 'Parsers handle untrusted input and are prime targets for crash bugs.'],
          ],
          style: 'project',
        },
        {
          title: 'C interview questions',
          description: 'The questions that keep coming up: pointers versus arrays, malloc versus calloc, stack versus heap, undefined behaviour, static and extern, struct padding, const placement, volatile, and how C compares to C++ and Rust.',
          concepts: ['Pointer and array questions', 'Memory management questions', 'Linkage and storage questions', 'Undefined behaviour questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['What does volatile mean?', 'The value may change outside the compiler\'s view, so every access must hit memory.'],
            ['What is the difference between malloc and calloc?', 'calloc zeroes the memory and takes count and size separately.'],
          ],
          style: 'reading',
        },
        {
          title: 'Coding interviews in C',
          description: 'Solving problems fast without a standard container library: hand-rolled stacks and queues, in-place array tricks, string reversal and two-pointer scans, bit manipulation, and managing memory without leaks under time pressure.',
          concepts: ['Array and string manipulation in place', 'Hand-rolled stacks and queues', 'Bit manipulation tricks', 'Linked list interview patterns', 'Leak-free interview code'],
          quiz: [
            ['How do you reverse a string in place?', 'Swap characters from both ends moving inward until they meet.'],
            ['How do you check whether n is a power of two?', 'n > 0 && (n & (n - 1)) == 0'],
          ],
        },
      ],
    },
  ],
})
