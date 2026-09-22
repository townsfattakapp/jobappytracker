import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '../src/data/curriculum');

function uuid(prefix) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// THE EXACT DATA DEFINED BY THE USER'S PROMPT
const trackDefinitions = {
  'track-dsa': {
    title: 'DSA and Competitive Programming',
    desc: 'Master Data Structures and Algorithms from basics to advanced competitive programming levels.',
    categories: {
      'Programming Foundations': ['Input/output', 'Variables and Data Types', 'Operators and Conditions', 'Loops and Nested Loops', 'Functions and Parameters', 'Return values', 'Arrays and Strings', 'Debugging and Dry runs', 'Edge cases'],
      'Complexity Analysis': ['Time Complexity', 'Space Complexity', 'Big O, Omega, Theta', 'Best/Average/Worst case', 'Loop analysis', 'Recursion analysis', 'Recurrence relations', 'Amortized analysis'],
      'Arrays': ['Array representation', 'Indexing and Traversal', 'Insertion and Deletion', 'Searching and Min/Max', 'Frequency counting', 'Reversal and Rotation', 'Merging and Sorted arrays', 'Prefix/Suffix sums', 'Two pointers', 'Sliding window', "Kadane's algorithm"],
      'Strings': ['Character operations', 'Traversal and Reversal', 'Palindrome and Anagrams', 'Frequency maps', 'Substrings and Subsequences', 'Pattern matching', 'String hashing', 'Sliding window', 'Two pointers'],
      'Hashing': ['Hash functions', 'Hash tables', 'Sets and Maps', 'Collisions', 'Frequency counting', 'Duplicate detection', 'Lookup optimization', 'Prefix-sum hashing'],
      'Sorting': ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort', 'Counting and Radix Sort', 'Stability and In-place'],
      'Searching': ['Linear search', 'Binary search', 'Lower/Upper bound', 'First/Last occurrence', 'Rotated arrays', 'Binary search on answers', 'Monotonic predicates'],
      'Linked Lists': ['Singly linked lists', 'Doubly linked lists', 'Circular linked lists', 'Traversal and Insertion', 'Deletion and Reversal', 'Cycle detection', 'Fast/slow pointers', 'Merging and Sorting'],
      'Stacks and Queues': ['Stack operations', 'Queue operations', 'Circular queue', 'Deque', 'Monotonic stack', 'Monotonic queue', 'Next greater element', 'Balanced brackets', 'Expression evaluation'],
      'Recursion and Backtracking': ['Call stack', 'Base cases', 'Recursion trees', 'Subsets and Permutations', 'Combinations', 'N-Queens', 'Sudoku', 'Constraint pruning'],
      'Trees': ['Binary trees', 'Traversals', 'Height and Depth', 'Diameter and Views', 'Balanced trees', 'Lowest common ancestor', 'Tree construction', 'Serialization', 'Tree DP'],
      'Binary Search Trees': ['BST properties', 'Search and Validation', 'Insertion and Deletion', 'Predecessor/Successor', 'Kth smallest', 'Balanced BST concepts'],
      'Heaps and Priority Queues': ['Min/max heaps', 'Heapify', 'Heap sort', 'Top K', 'K-way merge', 'Median of streams', 'Scheduling problems'],
      'Tries': ['Prefix trees', 'Insertion and Search', 'Deletion', 'Autocomplete', 'Prefix matching', 'Bitwise tries'],
      'Graphs': ['Graph representations', 'Directed/undirected graphs', 'Weighted graphs', 'BFS and DFS', 'Connected components', 'Cycle detection', 'Bipartite graphs', 'Topological sorting', 'Union-find', 'Shortest paths', 'Minimum spanning trees', 'Bridges and articulation points'],
      'Greedy Algorithms': ['Greedy choice property', 'Interval scheduling', 'Activity selection', 'Fractional knapsack', 'Huffman coding', 'Jump problems', 'Proof techniques'],
      'Dynamic Programming': ['Memoization and Tabulation', 'State design and Transitions', '1D/2D DP', 'Knapsack and Coin change', 'LIS and LCS', 'Edit distance', 'Grid and Interval DP', 'Tree and Bitmask DP'],
      'Bit Manipulation': ['Binary representation', 'Bitwise operators', 'Masks', 'Set/clear/toggle bits', 'XOR patterns', 'Subsets and Bit counting'],
      'Mathematics and Number Theory': ['GCD and LCM', 'Primes and Sieve', 'Modular arithmetic', 'Fast exponentiation', 'Combinatorics', 'Permutations and Combinations', 'Probability fundamentals'],
      'Advanced Data Structures': ['Segment trees', 'Lazy propagation', 'Fenwick trees', 'Sparse tables', 'Advanced graph algorithms', 'Advanced string matching', 'Sweep line'],
      'Interview Practice': ['Pattern recognition', 'Brute-force-to-optimized thinking', 'Dry runs', 'Complexity explanation', 'Timed contests', 'Mock interviews']
    }
  },
  'track-java': {
    title: 'Core Java, OOP and Collections',
    desc: 'Master Java programming language.',
    categories: {
      'Basics': ['Java installation', 'JDK, JRE, JVM', 'Compilation', 'Syntax', 'Variables and types', 'Operators', 'Control flow'],
      'Core Programming': ['Methods', 'Arrays', 'Strings', 'StringBuilder', 'Exceptions', 'Error handling'],
      'OOP Fundamentals': ['Classes and Objects', 'Constructors', 'Access modifiers', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Interfaces', 'Abstract classes', 'Composition'],
      'Project Structure': ['Packages', 'Modules', 'Java project organization', 'Generics', 'Type safety'],
      'Collections Framework': ['Collections overview', 'List', 'Set', 'Map', 'Queue and Deque', 'ArrayList and LinkedList', 'HashSet and TreeSet', 'HashMap and TreeMap', 'equals and hashCode', 'Comparable and Comparator'],
      'Advanced Features': ['Lambdas', 'Functional interfaces', 'Streams', 'Optional', 'File I/O', 'NIO', 'Serialization', 'Date/time APIs'],
      'Concurrency': ['Threads', 'Synchronization', 'Locks', 'Executors', 'Futures', 'CompletableFuture'],
      'Architecture': ['JVM memory', 'Garbage collection', 'Performance', 'Maven', 'Gradle', 'Testing and debugging', 'JDBC', 'SOLID principles', 'Design patterns']
    }
  },
  'track-js': {
    title: 'JavaScript and TypeScript',
    desc: 'Master web programming languages.',
    categories: {
      'JS Fundamentals': ['JavaScript runtime', 'Browser execution', 'Variables and types', 'Operators and type coercion', 'Conditions and loops', 'Functions and callbacks'],
      'Scope and Context': ['Scope and hoisting', 'Closures', 'Lexical environment', 'this keyword', 'call, apply, bind', 'Arrow functions'],
      'Objects and DOM': ['Objects', 'Arrays', 'Prototypes', 'Classes', 'DOM manipulation', 'Events', 'Browser APIs', 'Browser storage', 'Cookies and security'],
      'Asynchronous JS': ['Call stack', 'Event loop', 'Tasks and microtasks', 'Promises', 'async/await', 'Fetch', 'HTTP requests', 'Error handling'],
      'Advanced JS': ['Modules', 'Package management', 'Iterators and generators', 'Functional programming', 'Memory management', 'Performance', 'Testing'],
      'TypeScript Basics': ['TypeScript setup', 'Types and strict mode', 'Interfaces', 'Aliases', 'Unions and intersections'],
      'Advanced TypeScript': ['Generics', 'Narrowing and type guards', 'Utility types', 'Mapped types', 'Conditional types', 'Type-safe APIs', 'Advanced TS architecture']
    }
  },
  'track-react': {
    title: 'React and Next.js',
    desc: 'Master frontend development.',
    categories: {
      'Web Fundamentals': ['HTML', 'CSS', 'Responsive design', 'Accessibility'],
      'React Basics': ['JSX', 'Components', 'Props', 'Rendering', 'State', 'Events', 'Lists', 'Conditional rendering', 'Forms', 'Validation'],
      'Hooks and State': ['useState', 'useEffect', 'useRef', 'Context API', 'Custom hooks', 'Component composition', 'State management', 'Server-state caching'],
      'Advanced React': ['Routing and navigation', 'Data fetching', 'React rendering', 'Reconciliation', 'Performance', 'Testing', 'Error boundaries'],
      'Next.js Fundamentals': ['App Router', 'Routing conventions', 'Server Components', 'Client Components', 'Layouts', 'Loading states', 'Error handling'],
      'Next.js Advanced': ['Route handlers', 'Server actions', 'Data access', 'Caching', 'Revalidation', 'Rendering strategies', 'Authentication', 'Authorization', 'Database integration'],
      'Production': ['SEO', 'Metadata', 'Images', 'Performance', 'Deployment', 'Observability', 'Security', 'Production-grade projects']
    }
  },
  'track-node': {
    title: 'Node.js and Backend Development',
    desc: 'Master backend development with Node.',
    categories: {
      'Backend Basics': ['Backend architecture', 'HTTP fundamentals', 'Node.js runtime', 'Modules and npm'],
      'Node Core': ['Event loop', 'Asynchronous I/O', 'Streams', 'Buffers'],
      'Express APIs': ['Express/Fastify', 'Routing', 'Middleware', 'Request validation', 'Error handling', 'Logging', 'REST APIs', 'Pagination', 'Filtering', 'Versioning'],
      'Data and Security': ['SQL integration', 'Transactions', 'Data access', 'Authentication', 'Authorization', 'Sessions', 'JWT', 'OAuth', 'Password hashing', 'Secret management'],
      'Advanced Features': ['Uploads', 'Object storage', 'Email', 'Notifications', 'Redis', 'Caching', 'Queues', 'Background jobs', 'WebSockets', 'Real-time systems'],
      'Architecture': ['Rate limiting', 'API security', 'Abuse prevention', 'Testing', 'Documentation', 'Debugging', 'Modular monoliths', 'Microservices', 'Messaging'],
      'Production': ['Reliability', 'Scalability', 'Performance', 'Docker', 'CI/CD', 'Production deployment', 'End-to-end backend projects']
    }
  },
  'track-sql': {
    title: 'SQL, PostgreSQL and MySQL',
    desc: 'Master relational databases.',
    categories: {
      'SQL Fundamentals': ['Relational database fundamentals', 'Tables', 'Schemas', 'Types', 'Keys', 'Constraints'],
      'CRUD Operations': ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING'],
      'Joins and Advanced Queries': ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'Subqueries', 'CTEs', 'Window functions'],
      'Database Architecture': ['Schema design', 'Relationships', 'Normalization', 'Indexes', 'Query execution plans'],
      'Transactions': ['Transactions', 'ACID', 'Isolation levels', 'Locking', 'Deadlocks', 'Concurrency'],
      'Advanced Features': ['Views', 'Triggers', 'Stored procedures', 'Migrations', 'Schema evolution'],
      'Specific Databases': ['PostgreSQL-specific features', 'MySQL-specific features', 'Partitioning', 'Replication', 'High availability'],
      'Administration': ['Backup', 'Recovery', 'Pooling', 'Security', 'Query optimization', 'Practical database projects']
    }
  },
  'track-hld': {
    title: 'High-Level System Design (HLD)',
    desc: 'Master scalable system architectures.',
    categories: {
      'Fundamentals': ['Requirements and capacity estimation', 'Networking', 'DNS', 'HTTP', 'Reverse proxies', 'Load balancing', 'CDNs'],
      'Data and Storage': ['Caching', 'Cache invalidation', 'SQL/NoSQL selection', 'Data modeling', 'Replication', 'Partitioning', 'Sharding'],
      'Architecture Concepts': ['Consistency', 'Availability', 'CAP tradeoffs', 'Queues', 'Pub/sub', 'Event-driven systems', 'Object storage', 'Search'],
      'Reliability': ['Authentication', 'Authorization', 'Rate limiting', 'Observability', 'Reliability', 'Failure recovery', 'Multi-region systems', 'Scalability', 'Performance', 'Cost optimization'],
      'Case Studies Part 1': ['URL shortener design', 'Chat application design', 'News feed design', 'Notification system design'],
      'Case Studies Part 2': ['E-commerce design', 'Food delivery design', 'Video streaming design', 'Payment system design']
    }
  },
  'track-lld': {
    title: 'Low-Level System Design (LLD)',
    desc: 'Master object-oriented design and design patterns.',
    categories: {
      'OOD Fundamentals': ['OOP principles', 'SOLID', 'UML class diagrams', 'Sequence diagrams', 'State diagrams'],
      'Architecture': ['Interfaces', 'Composition', 'Cohesion and coupling', 'Domain modeling', 'Object responsibilities'],
      'Design Patterns': ['Creational design patterns', 'Structural design patterns', 'Behavioral design patterns'],
      'Advanced Concepts': ['Error handling', 'State machines', 'Concurrency', 'Thread safety', 'Clean architecture', 'Testability'],
      'Case Studies Part 1': ['Parking lot design', 'Elevator design', 'Library management design', 'Vending machine design', 'Splitwise design'],
      'Case Studies Part 2': ['Rate limiter design', 'Logging framework design', 'Cache design', 'Booking system design', 'Inventory management design']
    }
  },
  'track-cs': {
    title: 'CS Fundamentals',
    desc: 'Master OS, DBMS, and Networking.',
    categories: {
      'Operating Systems - Processes': ['Processes', 'Threads', 'Scheduling', 'Synchronization', 'Deadlocks'],
      'Operating Systems - Storage': ['Memory', 'Virtual memory', 'Paging', 'Filesystems', 'I/O', 'System calls'],
      'Computer Networks - Basics': ['OSI model', 'TCP/IP', 'IP addressing', 'Routing', 'TCP', 'UDP'],
      'Computer Networks - Web': ['DNS', 'HTTP', 'HTTPS', 'TLS', 'Sockets', 'Latency', 'Congestion', 'Network debugging'],
      'DBMS Internals': ['Storage engines', 'Indexes', 'Transactions', 'Isolation', 'Locking', 'Concurrency', 'Recovery', 'Query execution'],
      'Computer Architecture': ['CPU', 'Registers', 'Instructions', 'Memory hierarchy', 'Caches', 'Parallelism', 'Performance'],
      'Other Foundations': ['Compilers', 'Interpreters', 'Cryptography fundamentals', 'Security', 'Practical debugging']
    }
  },
  'track-devops': {
    title: 'DevOps, CI/CD, Docker and Security',
    desc: 'Master deployment and security.',
    categories: {
      'Foundations': ['Linux basics', 'Shell scripting', 'Git', 'Branching', 'Code review'],
      'CI/CD': ['Testing fundamentals', 'CI/CD fundamentals', 'GitHub Actions'],
      'Containers': ['Docker images', 'Containers', 'Dockerfiles', 'Docker Compose', 'Networking', 'Volumes', 'Container registries', 'Security'],
      'Infrastructure': ['Kubernetes fundamentals', 'Cloud computing', 'Infrastructure as code', 'Environment variables', 'Secrets management'],
      'Operations': ['Nginx', 'Reverse proxies', 'TLS', 'Monitoring', 'Logging', 'Metrics', 'Tracing', 'Alerts', 'Incident response', 'Reliability'],
      'Production': ['Backups', 'Disaster recovery', 'Deployment strategies', 'Rollback', 'OWASP', 'Application security', 'Dependency scanning', 'Vulnerability management', 'Performance engineering', 'Production projects']
    }
  }
};

for (const [trackId, def] of Object.entries(trackDefinitions)) {
  let catOut = [];
  
  for (const [catName, conceptsList] of Object.entries(def.categories)) {
    // Instead of completely generic Topic names, we'll map the exact concepts 
    // the user provided to "Topics", and then give them real logical subtopics (concepts).
    let modOut = [];
    
    // Group concepts by 2s or 3s to form Topics, or treat each item in the list as a Topic.
    // If we treat each item as a Topic, then the subtopics (concepts) can be "Theory", "Practice", "Common Mistakes".
    for (const topicName of conceptsList) {
      let subOut = [];
      
      subOut.push(`{
                    id: '${uuid('sub')}',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: '${uuid('tsk')}', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: '${uuid('tsk')}', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  }`);
      subOut.push(`{
                    id: '${uuid('sub')}',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: '${uuid('tsk')}', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: '${uuid('tsk')}', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  }`);
      subOut.push(`{
                    id: '${uuid('sub')}',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: '${uuid('tsk')}', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }`);

      modOut.push(`{
                  id: '${uuid('top')}',
                  title: \`${topicName}\`,
                  subtopics: [
                    ${subOut.join(',\n')}
                  ]
                }`);
    }
    
    catOut.push(`{
          id: '${uuid('cat')}',
          title: \`${catName}\`,
          modules: [
            {
              id: '${uuid('mod')}',
              title: 'Concepts & Implementation',
              topics: [
                ${modOut.join(',\n')}
              ]
            }
          ]
        }`);
  }

  const content = `import { CurriculumTrack } from '../../types';

export const ${trackId.replace('-', '')}Curriculum: CurriculumTrack = {
  id: '${trackId}',
  title: \`${def.title}\`,
  description: \`${def.desc}\`,
  prerequisites: [],
  levels: [
    {
      id: '${uuid('lvl')}',
      name: 'All Levels',
      categories: [
        ${catOut.join(',\n')}
      ]
    }
  ]
};
`;

  fs.writeFileSync(path.join(outDir, `${trackId.replace('track-', '')}.ts`), content);
}

// Generate index.ts
const indexContent = `import { CurriculumTrack } from '../../types'
${Object.keys(trackDefinitions).map(id => `import { ${id.replace('-', '')}Curriculum } from './${id.replace('track-', '')}'`).join('\n')}

export const allCurriculums: CurriculumTrack[] = [
  ${Object.keys(trackDefinitions).map(id => `${id.replace('-', '')}Curriculum`).join(',\n  ')}
]
`;

fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent);

console.log("Realistic and exact user curriculum seeded successfully.");
