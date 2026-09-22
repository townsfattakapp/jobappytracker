import { v4 as uuidv4 } from 'uuid'
import type { LearningTrack } from '../types'

export const learningTracksSeed: LearningTrack[] = [
  {
    id: uuidv4(),
    name: 'DSA and Competitive Programming',
    description: 'Master data structures and algorithms to ace coding interviews and write efficient code.',
    prerequisites: ['Basic programming knowledge in any language'],
    category: 'DSA',
    status: 'Active',
    order: 1,
    topics: [
      { id: uuidv4(), name: 'Arrays & Hashing', description: 'Basic data structures for constant time lookups', activities: [] },
      { id: uuidv4(), name: 'Two Pointers', description: 'Technique for solving array and string problems', activities: [] },
      { id: uuidv4(), name: 'Dynamic Programming', description: 'Optimization over plain recursion', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'Core Java, OOP and Collections',
    description: 'Deep dive into Java fundamentals, object-oriented principles, and the Collections framework.',
    prerequisites: [],
    category: 'Backend',
    status: 'Active',
    order: 2,
    topics: [
      { id: uuidv4(), name: 'OOP Concepts', description: 'Inheritance, Polymorphism, Encapsulation, Abstraction', activities: [] },
      { id: uuidv4(), name: 'Collections Framework', description: 'List, Set, Map interfaces and implementations', activities: [] },
      { id: uuidv4(), name: 'Multithreading', description: 'Concurrency and synchronization in Java', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'JavaScript and TypeScript',
    description: 'Learn modern JavaScript and add static typing with TypeScript.',
    prerequisites: ['Basic HTML/CSS'],
    category: 'Frontend',
    status: 'Active',
    order: 3,
    topics: [
      { id: uuidv4(), name: 'ES6+ Features', activities: [] },
      { id: uuidv4(), name: 'Asynchronous JS', activities: [] },
      { id: uuidv4(), name: 'TypeScript Fundamentals', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'React and Next.js',
    description: 'Build dynamic UIs with React and full-stack applications with Next.js.',
    prerequisites: ['JavaScript and TypeScript'],
    category: 'Frontend',
    status: 'Active',
    order: 4,
    topics: [
      { id: uuidv4(), name: 'React Hooks', activities: [] },
      { id: uuidv4(), name: 'State Management', activities: [] },
      { id: uuidv4(), name: 'Next.js App Router', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'Node.js and Backend Development',
    description: 'Create scalable APIs and backend services using Node.js and Express.',
    prerequisites: ['JavaScript'],
    category: 'Backend',
    status: 'Active',
    order: 5,
    topics: [
      { id: uuidv4(), name: 'Express APIs', activities: [] },
      { id: uuidv4(), name: 'Authentication & Authorization', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'SQL, PostgreSQL, MySQL',
    description: 'Relational database design, querying, and optimization.',
    prerequisites: [],
    category: 'Backend',
    status: 'Active',
    order: 6,
    topics: [
      { id: uuidv4(), name: 'Joins and Aggregations', activities: [] },
      { id: uuidv4(), name: 'Indexes and Performance', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'High-Level System Design (HLD)',
    description: 'Design scalable distributed systems and architectures.',
    prerequisites: ['Backend Development'],
    category: 'System Design',
    status: 'Active',
    order: 7,
    topics: [
      { id: uuidv4(), name: 'Microservices vs Monoliths', activities: [] },
      { id: uuidv4(), name: 'Caching and Load Balancing', activities: [] },
      { id: uuidv4(), name: 'Database Sharding', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'Low-Level System Design (LLD)',
    description: 'Design robust object-oriented systems and APIs.',
    prerequisites: ['OOP'],
    category: 'System Design',
    status: 'Active',
    order: 8,
    topics: [
      { id: uuidv4(), name: 'Design Patterns', activities: [] },
      { id: uuidv4(), name: 'SOLID Principles', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'CS Fundamentals (OS, DBMS, Networking)',
    description: 'Core computer science concepts often asked in interviews.',
    prerequisites: [],
    category: 'CS Fundamentals',
    status: 'Active',
    order: 9,
    topics: [
      { id: uuidv4(), name: 'Operating Systems', activities: [] },
      { id: uuidv4(), name: 'Computer Networks', activities: [] }
    ]
  },
  {
    id: uuidv4(),
    name: 'DevOps, CI/CD, Docker & Security',
    description: 'Deploy, secure, and maintain software applications in production.',
    prerequisites: ['Backend Development'],
    category: 'DevOps',
    status: 'Active',
    order: 10,
    topics: [
      { id: uuidv4(), name: 'Docker & Containers', activities: [] },
      { id: uuidv4(), name: 'CI/CD Pipelines', activities: [] }
    ]
  }
]
