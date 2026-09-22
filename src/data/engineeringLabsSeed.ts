import type { EngineeringLab } from '../types'

export const engineeringLabsSeed: EngineeringLab[] = [
  {
    id: 'lab-eng-101',
    ticketId: 'ENG-101',
    title: 'Codebase Onboarding & Architecture Exploration',
    difficulty: 'Beginner',
    scenario: 'You just joined the team. Your first task is to clone the main repository, understand the directory structure, and trace how a user login request flows from the React frontend to the Node.js API.',
    requirements: [
      'Identify the main entry point of the React application.',
      'Locate the API route for user authentication.',
      'Trace the authentication flow through the service layer to the database.'
    ],
    acceptanceCriteria: [
      'Provide a short summary of the frontend architecture.',
      'List the file paths involved in the login flow.',
      'Identify which database table stores user credentials.'
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    estDurationMinutes: 30,
    status: 'Open'
  },
  {
    id: 'lab-eng-102',
    title: 'Reproduce and Fix Checkout Bug',
    ticketId: 'ENG-102',
    difficulty: 'Intermediate',
    scenario: 'Users are reporting that occasionally the checkout cart total is off by a few cents. You need to investigate the pricing calculation service.',
    requirements: [
      'Locate the `calculateTotal` function in the services directory.',
      'Write a failing test case that reproduces the floating point error.',
      'Fix the function to use precise integer arithmetic or a library like decimal.js.'
    ],
    acceptanceCriteria: [
      'Root cause analysis is documented.',
      'Failing test case is provided.',
      'Solution code is implemented.'
    ],
    techStack: ['TypeScript', 'Jest'],
    estDurationMinutes: 30,
    status: 'Open'
  },
  {
    id: 'lab-eng-103',
    title: 'Implement Rate Limiting Middleware',
    ticketId: 'ENG-103',
    difficulty: 'Advanced',
    scenario: 'Our public API is being hammered by a single IP address. We need to implement a Redis-based rate limiter middleware in our Express app.',
    requirements: [
      'Design a sliding window rate limiter.',
      'Implement the Express middleware.',
      'Return 429 Too Many Requests when limits are exceeded.'
    ],
    acceptanceCriteria: [
      'Middleware intercepts requests correctly.',
      'Redis is used for distributed counting.',
      'Headers (X-RateLimit-Limit, X-RateLimit-Remaining) are set.'
    ],
    techStack: ['Node.js', 'Express', 'Redis'],
    estDurationMinutes: 45,
    status: 'Open'
  },
  {
    id: 'lab-eng-104',
    title: 'Database Indexing & Query Optimization',
    ticketId: 'ENG-104',
    difficulty: 'Intermediate',
    scenario: 'The admin dashboard is timing out when loading the recent transactions list. The query is doing a full table scan on a table with 10 million rows.',
    requirements: [
      'Analyze the SQL query used in the dashboard.',
      'Identify the missing index.',
      'Write the SQL migration script to add the index safely without locking the table.'
    ],
    acceptanceCriteria: [
      'EXPLAIN ANALYZE output is understood.',
      'CREATE INDEX CONCURRENTLY command is provided.',
      'Query time drops below 50ms.'
    ],
    techStack: ['PostgreSQL', 'SQL'],
    estDurationMinutes: 30,
    status: 'Open'
  }
]
