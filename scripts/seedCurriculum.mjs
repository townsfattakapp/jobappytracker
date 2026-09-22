import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '../src/data/curriculum');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function uuid(prefix) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTrack(id, title, desc, categoriesObj) {
  let catOut = [];
  
  for (const [catName, topics] of Object.entries(categoriesObj)) {
    let modOut = [];
    for (const [topicName, concepts] of Object.entries(topics)) {
      let subOut = [];
      for (const conceptName of concepts) {
        subOut.push(`{
                      id: '${uuid('sub')}',
                      title: \`${conceptName}\`,
                      tasks: [
                        { id: '${uuid('tsk')}', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: '${uuid('tsk')}', title: 'Practice Exercises', type: 'Practice', estDurationMinutes: 45 }
                      ]
                    }`);
      }
      
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
              title: 'Core Concepts',
              topics: [
                ${modOut.join(',\n')}
              ]
            }
          ]
        }`);
  }

  return `import { CurriculumTrack } from '../../types';

export const ${id.replace('-', '')}Curriculum: CurriculumTrack = {
  id: '${id}',
  title: \`${title}\`,
  description: \`${desc}\`,
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
}

const tracks = [
  {
    id: 'track-java',
    title: 'Core Java, OOP and Collections',
    desc: 'Master Java from basics to advanced patterns.',
    categories: {
      'Java Fundamentals': {
        'Introduction': ['Installation, JDK, JRE, JVM', 'Compilation and Execution'],
        'Syntax': ['Variables and Data Types', 'Operators', 'Control Flow'],
      },
      'Object Oriented Programming': {
        'Classes and Objects': ['Classes', 'Constructors', 'Access Modifiers'],
        'Pillars': ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
      },
      'Collections Framework': {
        'Lists': ['ArrayList', 'LinkedList'],
        'Sets and Maps': ['HashSet', 'TreeSet', 'HashMap', 'TreeMap'],
      },
      'Advanced Java': {
        'Concurrency': ['Threads', 'Synchronization', 'Executors'],
        'Features': ['Lambdas', 'Streams', 'Optional'],
      }
    }
  },
  {
    id: 'track-js',
    title: 'JavaScript and TypeScript',
    desc: 'Master web programming languages.',
    categories: {
      'JS Fundamentals': {
        'Runtime': ['Browser Execution', 'Event Loop'],
        'Syntax': ['Variables, Scope, Hoisting', 'Types and Coercion'],
      },
      'Objects and Functions': {
        'Functions': ['Closures', 'Arrow Functions', 'this, call, apply, bind'],
        'Objects': ['Prototypes', 'Classes', 'Modules'],
      },
      'Asynchronous JS': {
        'Promises': ['Promise API', 'async/await'],
        'Network': ['Fetch', 'HTTP Requests'],
      },
      'TypeScript': {
        'Basics': ['Setup', 'Types', 'Interfaces'],
        'Advanced': ['Generics', 'Utility Types', 'Type Guards'],
      }
    }
  },
  {
    id: 'track-react',
    title: 'React and Next.js',
    desc: 'Master frontend development.',
    categories: {
      'React Basics': {
        'Components': ['JSX', 'Props', 'Rendering'],
        'State': ['useState', 'Events', 'Forms'],
      },
      'Hooks and Context': {
        'Effects': ['useEffect', 'useRef'],
        'State Management': ['Context API', 'Custom Hooks'],
      },
      'Next.js Fundamentals': {
        'Routing': ['App Router', 'Server Components'],
        'Data': ['Route Handlers', 'Server Actions'],
      },
      'Advanced Next.js': {
        'Performance': ['Caching', 'Revalidation', 'Images'],
        'Production': ['Deployment', 'SEO', 'Security'],
      }
    }
  },
  {
    id: 'track-node',
    title: 'Node.js and Backend Development',
    desc: 'Master backend development.',
    categories: {
      'Node.js Core': {
        'Runtime': ['Modules', 'npm', 'Event Loop'],
        'I/O': ['Streams', 'Buffers', 'File System'],
      },
      'APIs with Express': {
        'Basics': ['Routing', 'Middleware'],
        'Advanced': ['Validation', 'Error Handling', 'REST Design'],
      },
      'Data and Security': {
        'Database': ['SQL Integration', 'Transactions'],
        'Auth': ['JWT', 'Sessions', 'OAuth'],
      },
      'Architecture': {
        'Scaling': ['Redis', 'WebSockets', 'Rate Limiting'],
        'Deployment': ['Docker', 'CI/CD'],
      }
    }
  },
  {
    id: 'track-sql',
    title: 'SQL, PostgreSQL and MySQL',
    desc: 'Master databases.',
    categories: {
      'SQL Basics': {
        'Tables': ['Schemas', 'Data Types', 'Constraints'],
        'Queries': ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'WHERE'],
      },
      'Joins and Aggregation': {
        'Joins': ['INNER', 'LEFT', 'RIGHT', 'FULL'],
        'Aggregation': ['GROUP BY', 'HAVING', 'Subqueries'],
      },
      'Advanced SQL': {
        'Functions': ['CTEs', 'Window Functions'],
        'Performance': ['Indexes', 'Execution Plans'],
      },
      'Administration': {
        'Transactions': ['ACID', 'Isolation Levels', 'Locks'],
        'Architecture': ['Replication', 'Backups', 'Views'],
      }
    }
  },
  {
    id: 'track-hld',
    title: 'High-Level System Design (HLD)',
    desc: 'Master scalable architectures.',
    categories: {
      'Core Concepts': {
        'Networking': ['DNS', 'HTTP', 'Proxies', 'Load Balancing'],
        'Storage': ['Caching', 'SQL vs NoSQL', 'Sharding'],
      },
      'System Components': {
        'Messaging': ['Queues', 'Pub/Sub'],
        'Reliability': ['Observability', 'Failure Recovery'],
      },
      'Case Studies Part 1': {
        'Standard': ['URL Shortener', 'Chat Application'],
        'Social': ['News Feed', 'Notification System'],
      },
      'Case Studies Part 2': {
        'Complex': ['E-commerce', 'Video Streaming', 'Payment System'],
      }
    }
  },
  {
    id: 'track-lld',
    title: 'Low-Level System Design (LLD)',
    desc: 'Master Object Oriented Design.',
    categories: {
      'OOD Principles': {
        'Basics': ['OOP', 'SOLID', 'UML'],
        'Advanced': ['Interfaces', 'Composition', 'Clean Architecture'],
      },
      'Design Patterns': {
        'Types': ['Creational', 'Structural', 'Behavioral'],
      },
      'Case Studies Part 1': {
        'Physical': ['Parking Lot', 'Elevator', 'Vending Machine'],
      },
      'Case Studies Part 2': {
        'Digital': ['Library Management', 'Splitwise', 'Rate Limiter', 'Cache'],
      }
    }
  },
  {
    id: 'track-cs',
    title: 'CS Fundamentals',
    desc: 'Master core computer science.',
    categories: {
      'Operating Systems': {
        'Compute': ['Processes', 'Threads', 'Scheduling'],
        'Storage': ['Memory', 'Virtual Memory', 'Filesystems'],
      },
      'Computer Networks': {
        'Protocols': ['OSI', 'TCP/IP', 'DNS', 'HTTP', 'HTTPS'],
      },
      'DBMS': {
        'Internals': ['Storage Engines', 'Transactions', 'Recovery'],
      },
      'Architecture': {
        'Hardware': ['CPU', 'Registers', 'Memory Hierarchy'],
      }
    }
  },
  {
    id: 'track-devops',
    title: 'DevOps, CI/CD, Docker and Security',
    desc: 'Master deployment.',
    categories: {
      'Linux and Git': {
        'Basics': ['Shell Scripting', 'Git Branching', 'Code Review'],
      },
      'Containers': {
        'Docker': ['Images', 'Containers', 'Dockerfiles', 'Docker Compose'],
        'Kubernetes': ['Fundamentals'],
      },
      'CI/CD and Cloud': {
        'Pipelines': ['GitHub Actions', 'Infrastructure as Code'],
        'Monitoring': ['Logging', 'Metrics', 'Tracing'],
      },
      'Security': {
        'AppSec': ['OWASP', 'Dependency Scanning', 'Secrets Management'],
      }
    }
  }
];

const dsaTrack = {
  id: 'track-dsa',
  title: 'DSA and Competitive Programming',
  desc: 'Master Data Structures and Algorithms.',
  categories: {
    'Programming Foundations': {'Basics': ['Input/output', 'Loops', 'Functions', 'Arrays']},
    'Complexity Analysis': {'Big O': ['Time Complexity', 'Space Complexity', 'Recurrence Relations']},
    'Arrays': {'Array Operations': ['Traversal', 'Prefix sums', 'Two pointers', 'Sliding window']},
    'Strings': {'String Operations': ['Traversal', 'Anagrams', 'Subsequences', 'Pattern matching']},
    'Hashing': {'Hash Tables': ['Hash functions', 'Sets', 'Maps', 'Collisions']},
    'Sorting': {'Algorithms': ['Bubble', 'Merge', 'Quick', 'Heap']},
    'Searching': {'Binary Search': ['Linear search', 'Lower bound', 'Rotated arrays']},
    'Linked Lists': {'Operations': ['Singly', 'Doubly', 'Reversal', 'Cycle detection']},
    'Stacks and Queues': {'Implementations': ['Stack', 'Queue', 'Monotonic stack']},
    'Recursion and Backtracking': {'Concepts': ['Call stack', 'Base cases', 'N-Queens']},
    'Trees': {'Binary Trees': ['Traversals', 'Lowest common ancestor', 'Views']},
    'Binary Search Trees': {'Properties': ['Search', 'Insertion', 'Deletion']},
    'Heaps and Priority Queues': {'Heaps': ['Min/max heaps', 'Heap sort', 'Top K']},
    'Tries': {'Prefix Trees': ['Insertion', 'Search', 'Autocomplete']},
    'Graphs': {'Graph Algorithms': ['BFS', 'DFS', 'Union-find', 'Shortest paths', 'MST']},
    'Greedy Algorithms': {'Greedy': ['Interval scheduling', 'Activity selection']},
    'Dynamic Programming': {'DP': ['Memoization', 'Tabulation', 'Knapsack', 'LCS']},
    'Bit Manipulation': {'Bits': ['Bitwise operators', 'Masks', 'XOR patterns']},
    'Mathematics and Number Theory': {'Math': ['GCD', 'LCM', 'Primes', 'Sieve']},
    'Advanced Data Structures': {'Advanced': ['Segment trees', 'Fenwick trees']},
    'Interview and Practice': {'Practice': ['Pattern recognition', 'Mock interviews']}
  }
};

tracks.push(dsaTrack);

for (const t of tracks) {
  const content = generateTrack(t.id, t.title, t.desc, t.categories);
  fs.writeFileSync(path.join(outDir, `${t.id.replace('track-', '')}.ts`), content);
}

const indexContent = `import { CurriculumTrack } from '../../types'
${tracks.map(t => `import { ${t.id.replace('-', '')}Curriculum } from './${t.id.replace('track-', '')}'`).join('\n')}

export const allCurriculums: CurriculumTrack[] = [
  ${tracks.map(t => `${t.id.replace('-', '')}Curriculum`).join(',\n  ')}
]
`;

fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent);

console.log("Curriculum seeded successfully.");
