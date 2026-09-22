import type { SystemDesignExercise } from '../types'

export const systemDesignSeed: SystemDesignExercise[] = [
  {
    id: 'sd-design-a-url-shortener',
    title: 'Design a URL Shortener',
    type: 'HLD',
    difficulty: 'Easy',
    tags: ['Hashing', 'Database scaling', 'Caching'],
    status: 'Unattempted'
  },
  {
    id: 'sd-design-a-chat-application',
    title: 'Design a Chat Application',
    type: 'HLD',
    difficulty: 'Medium',
    tags: ['WebSockets', 'Real-time', 'Pub/Sub', 'Database sharding'],
    status: 'Unattempted'
  },
  {
    id: 'sd-design-an-e-commerce-platform',
    title: 'Design an E-commerce Platform',
    type: 'HLD',
    difficulty: 'Hard',
    tags: ['Microservices', 'Payment Gateway', 'Inventory', 'Caching'],
    status: 'Unattempted'
  },
  {
    id: 'sd-design-a-notification-system',
    title: 'Design a Notification System',
    type: 'HLD',
    difficulty: 'Medium',
    tags: ['Message Queues', 'Rate Limiting', 'Push Notifications'],
    status: 'Unattempted'
  },
  {
    id: 'sd-design-a-parking-lot',
    title: 'Design a Parking Lot',
    type: 'LLD',
    difficulty: 'Easy',
    tags: ['OOP', 'Design Patterns'],
    status: 'Unattempted'
  },
  {
    id: 'sd-design-an-elevator-system',
    title: 'Design an Elevator System',
    type: 'LLD',
    difficulty: 'Medium',
    tags: ['OOP', 'Concurrency', 'State Pattern'],
    status: 'Unattempted'
  },
  {
    id: 'sd-design-a-library-management-system',
    title: 'Design a Library Management System',
    type: 'LLD',
    difficulty: 'Easy',
    tags: ['OOP', 'Database Schema'],
    status: 'Unattempted'
  }
]
