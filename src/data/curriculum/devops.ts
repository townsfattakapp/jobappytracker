import { CurriculumTrack } from '../../types';

export const trackdevopsCurriculum: CurriculumTrack = {
  id: 'track-devops',
  title: `DevOps, CI/CD, Docker and Security`,
  description: `Master deployment and security.`,
  prerequisites: [],
  levels: [
    {
      id: 'lvl-lrys2c1yv',
      name: 'All Levels',
      categories: [
        {
          id: 'cat-07zb4aoi8',
          title: `Foundations`,
          modules: [
            {
              id: 'mod-xij9wr9g4',
              title: 'Concepts & Implementation',
              topics: [
                  {
                    id: 'top-da346k9dq',
                    title: `What is DevOps?`,
                    subtopics: [
                      {
                      id: 'sub-kyv3evj1u',
                      title: 'Theory & Fundamentals',
                      tasks: [
                        { id: 'tsk-w73u4wf22', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: 'tsk-4r8sdi3h6', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                      ],
                      questions: [
  {
      id: 'q-g8222ptt4',
      title: `What exactly is DevOps?`,
      difficulty: 'Beginner',
      type: 'Conceptual',
      estDurationMinutes: 15,
      beginnerExplanation: `It is a fundamental concept/tool in modern software engineering.`,
      detailedExplanation: `It is a fundamental concept/tool in modern software engineering.`,
      interviewAnswer: `It is a fundamental concept/tool in modern software engineering.`
  }
                      ]
                      }
                    ]
                  },
                  {
                    id: 'top-xa7ztnmpg',
                    title: `Why use DevOps?`,
                    subtopics: [
                      {
                      id: 'sub-c3wmqfzj1',
                      title: 'Theory & Fundamentals',
                      tasks: [
                        { id: 'tsk-c0kd2wqc8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: 'tsk-imbxjq6gs', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                      ],
                      questions: [
  {
      id: 'q-6pxdmpntb',
      title: `Where is DevOps used?`,
      difficulty: 'Beginner',
      type: 'Conceptual',
      estDurationMinutes: 15,
      beginnerExplanation: `In almost every modern tech stack and enterprise system.`,
      detailedExplanation: `In almost every modern tech stack and enterprise system.`,
      interviewAnswer: `In almost every modern tech stack and enterprise system.`
  }
                      ]
                      }
                    ]
                  },
                  {
                    id: 'top-fzak3cbzr',
                    title: `History and Ecosystem`,
                    subtopics: [
                      {
                      id: 'sub-k1w0ywvzv',
                      title: 'Theory & Fundamentals',
                      tasks: [
                        { id: 'tsk-e26btaxvh', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: 'tsk-hw22jurjv', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                      ],
                      questions: [
  {
      id: 'q-sj2g27xux',
      title: `How has it evolved?`,
      difficulty: 'Beginner',
      type: 'Conceptual',
      estDurationMinutes: 15,
      beginnerExplanation: `It has become more standardized, efficient, and easier to use over time.`,
      detailedExplanation: `It has become more standardized, efficient, and easier to use over time.`,
      interviewAnswer: `It has become more standardized, efficient, and easier to use over time.`
  }
                      ]
                      }
                    ]
                  },
                {
                  id: 'top-3j41z61gf',
                  title: `Linux basics`,
                  subtopics: [
                    {
                    id: 'sub-o2qtmunv0',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-373camwvy', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-qpb9ku2g2', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-w2hz85l49',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-85yzzhegd', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-7vx2siblm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-6278zebcn',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-xmh9zmtnv', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-25r17210o',
                  title: `Shell scripting`,
                  subtopics: [
                    {
                    id: 'sub-5pvwiuonm',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-6puvr5izt', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-f4ajhrerv', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-dnfnruoxc',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-rxj9dmjei', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-v0zvn3xie', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-4owz5luah',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ld8pazqi4', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-crzyyg5yf',
                  title: `Git`,
                  subtopics: [
                    {
                    id: 'sub-9ivvkr9f3',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-57gmp8rig', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-snafsu4k5', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-v8j371o04',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-rdrpp1u22', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-5csyvghaj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-u4nfi64xu',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-cyrpfax5r', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-xq9hv5jd3',
                  title: `Branching`,
                  subtopics: [
                    {
                    id: 'sub-ocuh8uofz',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-aou22jywx', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-4qpqaeivf', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-5csivaeuz',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-5ilvxpjlf', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-5x39wxq43', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-gv0es54ze',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-6c89wc5lv', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-it96izwqn',
                  title: `Code review`,
                  subtopics: [
                    {
                    id: 'sub-cyppxmg6i',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-gvjk0t59y', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-rsxs9y7g0', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-4017nx80f',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-mrytv3ch3', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-wzxip84ou', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ld2kjnjl7',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-r3v6edd8q', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-2956cn170',
          title: `CI/CD`,
          modules: [
            {
              id: 'mod-qxcj52l8g',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-8zrtcggfx',
                  title: `Testing fundamentals`,
                  subtopics: [
                    {
                    id: 'sub-0ra6v3fe9',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-894hoggbr', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-xsv5adyqb', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-4emv1qobo',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-xoqfosfxr', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-w4yy6y3w4', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-t70juowdj',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ktwxbjt4r', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-xyb61k5ys',
                  title: `CI/CD fundamentals`,
                  subtopics: [
                    {
                    id: 'sub-o66zl5khe',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-cjb6ur0zn', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-i1ugdynqt', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-hjrrt2tjk',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-op4diownv', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3uw3cbr5y', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-6z50y5nx0',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1a4n981fc', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-q2rm5akw1',
                  title: `GitHub Actions`,
                  subtopics: [
                    {
                    id: 'sub-m6edq0oqh',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-eecjw5qc4', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0k1collot', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-tmoa4qdny',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-hi7qxsq8a', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-j77oso5m2', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-8azhzyo0y',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-430lu28v9', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-gc4r3f24x',
          title: `Containers`,
          modules: [
            {
              id: 'mod-iql1ozhil',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-9i599ls29',
                  title: `Docker images`,
                  subtopics: [
                    {
                    id: 'sub-r57fp35my',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-l4bajxhtd', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-v2zp640wi', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ui9n31tyy',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-5jhbewpt9', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-qh0j3nmos', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-42s0utmc0',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-wtm3nmej9', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-9v59fm2p9',
                  title: `Containers`,
                  subtopics: [
                    {
                    id: 'sub-8cufv9ayk',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-3pd2m8mtp', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-rz3o39ew8', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ubvmu73l5',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-jiomnkqoa', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gbvwk8nxc', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-74i4wce6u',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-zjq6rc92n', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-czckdf23m',
                  title: `Dockerfiles`,
                  subtopics: [
                    {
                    id: 'sub-051xbyj73',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-6sw7gmtqg', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ccp6idu0q', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-vjzilylns',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-2pilve67j', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-f25a6uhve', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-4l6oixnio',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-bi5ieeer1', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-yd060hrsh',
                  title: `Docker Compose`,
                  subtopics: [
                    {
                    id: 'sub-avlw9x0tu',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-b7fjzcus8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-vtiesvinw', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-0jw2t7i3p',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ea9ktjj6n', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-kg4bstw4b', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-1einfw238',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-rgct6gj09', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-jyputey1z',
                  title: `Networking`,
                  subtopics: [
                    {
                    id: 'sub-mtnsrfebs',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-2u3np2rx3', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-puday5qm1', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ue375o7tb',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-wvfxkr0dz', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-lg36pryfc', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-3zwv1ommh',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-nztcp6ozf', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-3x22lwnxz',
                  title: `Volumes`,
                  subtopics: [
                    {
                    id: 'sub-h9skyt6n5',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-uykifjqm9', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-sk8nw75j1', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ytt3i3daj',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-5teeunw6c', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ju4vomxnb', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-pqxaq6zgp',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-pp4zm07rg', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-3i9sn5q5q',
                  title: `Container registries`,
                  subtopics: [
                    {
                    id: 'sub-4ddk6j2py',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-3n4cvwgnn', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-qggqzoz4f', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-sr5czlyak',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-6ld28facm', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-d7nv1f3up', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-90kpa3h67',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1zp37t282', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-v4n1s6vvd',
                  title: `Security`,
                  subtopics: [
                    {
                    id: 'sub-xxd5vvzhe',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-agybxjm2s', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-cu2jeag30', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-v0816bd39',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-1a0ze23c6', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-d2ygpuxdj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-zpuz40g85',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ohyksqjrt', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-32681unwt',
          title: `Infrastructure`,
          modules: [
            {
              id: 'mod-8w1rijlxh',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-vcls3ft2d',
                  title: `Kubernetes fundamentals`,
                  subtopics: [
                    {
                    id: 'sub-cli0mjzwi',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-yxwtjxuh5', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dc3ikl0ws', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-z89wcfsov',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-3s3zb05d8', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-5bjvjuwtg', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-8aok734d8',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1qb0w1e3o', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ub1g6u87t',
                  title: `Cloud computing`,
                  subtopics: [
                    {
                    id: 'sub-1qm83qiqd',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-k6fniup8w', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-p6jjr9hxt', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-andlvz0i9',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-3oaxywfzy', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-e5hvscjmt', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-1vp890wuj',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-7t1a2kldd', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-dzelxe9s9',
                  title: `Infrastructure as code`,
                  subtopics: [
                    {
                    id: 'sub-zxtgu3ez4',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-eu45s6xpy', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-7l8o4r0is', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-qwedppzqv',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-0re3y9qid', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-cqsttfihm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-dd0y4p3qh',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-bbneqnnp8', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-dzxbp10gv',
                  title: `Environment variables`,
                  subtopics: [
                    {
                    id: 'sub-8tvyvjo6n',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ja1uvpuqt', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-5mcpapm2c', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-t5t9tg5up',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-xds6hfy02', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-1h9zb41wu', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-lrzcnzvso',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-k8gzuppgk', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-cjwe9846r',
                  title: `Secrets management`,
                  subtopics: [
                    {
                    id: 'sub-bs6z07cfv',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-wxbeky2kz', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-f5uen2isl', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-bwsvbxqi1',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-41hexe7li', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-pf4uh4l7w', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-mfdy0v4eq',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-a23mz7fhm', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-uroqtmqou',
          title: `Operations`,
          modules: [
            {
              id: 'mod-a0kxv15sb',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-uz24d7sgp',
                  title: `Nginx`,
                  subtopics: [
                    {
                    id: 'sub-9rpakwqau',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-flasommo9', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-etnzbrzjh', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-g0bcb3wgb',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-sun6s6349', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-mwdznly9z', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ktmajbdfx',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1scmibjs0', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-dpg0dddqn',
                  title: `Reverse proxies`,
                  subtopics: [
                    {
                    id: 'sub-bla697lj3',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ye8u2oe39', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-lm4pgr0bx', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ocrjjj1hh',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-0obme2v5x', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-oexlrjz9g', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-xee8mnt4u',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ztl3dftob', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-daqp7vlxm',
                  title: `TLS`,
                  subtopics: [
                    {
                    id: 'sub-grett0xun',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-aisecwz5t', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-vki38bia8', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-vv01nsdar',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-zik23oa2p', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0ve7b4oil', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-wqis3cjxf',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-knenctbtf', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-cuwana0lr',
                  title: `Monitoring`,
                  subtopics: [
                    {
                    id: 'sub-qobc0aztn',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-i7yai21i7', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-b63xv4x1e', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-aio87xlnm',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ei3j8qixb', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-okdv8eqvf', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-n7tdf55o3',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-x1zpf4sqi', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-dj5pemjgv',
                  title: `Logging`,
                  subtopics: [
                    {
                    id: 'sub-r2rxcfvn5',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-41aea0wi0', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ebvmtieup', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-wgc242k64',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-gkjhkodom', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-mfb8a3i0m', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-n94cazu8l',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-byvxq60tl', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-6q1u76wl2',
                  title: `Metrics`,
                  subtopics: [
                    {
                    id: 'sub-fplktn99s',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-c44b5pkhm', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-yebz2doyy', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-6hqcynv6o',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ox4h8i5cp', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-1ds7359gy', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-pzf8c1o4f',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-gwgejy2wk', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-4iwo9fmjj',
                  title: `Tracing`,
                  subtopics: [
                    {
                    id: 'sub-bf6u1wzxl',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-o5l8vd2le', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6kuig0edb', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-f874eccbf',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-994rcnep0', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-z3ekiq78e', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-w9ipp6b43',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-emps7grka', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-nxgcxigag',
                  title: `Alerts`,
                  subtopics: [
                    {
                    id: 'sub-uugy4dypv',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ez8dixbsw', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-chhgt2blc', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-69x9v3usp',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-pz1xydo3r', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ja3eeepsj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-nna69i20f',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-l225f2bki', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-7wi355wtm',
                  title: `Incident response`,
                  subtopics: [
                    {
                    id: 'sub-k12lr18un',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ypvgqo8lx', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-04qq0xppc', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-l9p5pwqfo',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-dzmx65wkm', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-lqv2f3x1f', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-vpv7pv7ky',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-qoaamrjwj', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-fnw3pftsi',
                  title: `Reliability`,
                  subtopics: [
                    {
                    id: 'sub-80op4ltte',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-46byyu1fl', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-y0q4ds84z', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-91121ezja',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-viwfdpd30', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-arq3qer4c', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ylfpre1lc',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ukyedjca2', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-7kgu3ywyo',
          title: `Production`,
          modules: [
            {
              id: 'mod-64fcuo5s3',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-y6j9cl0af',
                  title: `Backups`,
                  subtopics: [
                    {
                    id: 'sub-9n282vniy',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-1ezb4leup', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-pfl1j4pae', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-o63dnnz14',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-47fskbn8e', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-72oz72wmz', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-fip0404e8',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-nmr9ker68', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-n6myor385',
                  title: `Disaster recovery`,
                  subtopics: [
                    {
                    id: 'sub-ceq5sn0v5',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-duxwoauig', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-vgio0hdv3', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-b7xuu9zs7',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-cv3bo9alq', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-f4id0wo34', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-keizem1ze',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-f4rft2q7b', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ysl437683',
                  title: `Deployment strategies`,
                  subtopics: [
                    {
                    id: 'sub-a6oeae9of',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-j8mkpllsj', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-d1wmliiu8', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-wlytntv8t',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-wswa7qbr4', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-yk5fend79', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-1hmwthmwe',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-954o1orm0', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-nfgyrzb5e',
                  title: `Rollback`,
                  subtopics: [
                    {
                    id: 'sub-2gbc0tmjx',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-1d3m11avu', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-aefdtn59h', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-kqwi4ugwc',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-xx1p9u7q6', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-87ervngl0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ig8f6p928',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-e2s1jnwkg', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-o2c9568l2',
                  title: `OWASP`,
                  subtopics: [
                    {
                    id: 'sub-7r946mvf3',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-meooytqri', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-sgktxkatn', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-99gbmuikq',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-h95yd30je', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9ubnto7r7', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-rn6eh5hud',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-m712dx7f5', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-3buflufep',
                  title: `Application security`,
                  subtopics: [
                    {
                    id: 'sub-eod6lnzif',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-lx4ir8fox', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-aetx8vgsz', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-axw5oqbex',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-fgmm4edck', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3cv8ip3u4', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-avsk4ztit',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-h6y1yflnr', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-7aalz7kp6',
                  title: `Dependency scanning`,
                  subtopics: [
                    {
                    id: 'sub-fe52ej8ki',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-cwwfzgqn1', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ih5f0eovm', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-i7ojwcqbr',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-nqpdvo685', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-cwbt0eea0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-m7b2gfz7s',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-fwdo7g9a5', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-x8rbel1h1',
                  title: `Vulnerability management`,
                  subtopics: [
                    {
                    id: 'sub-vlj7w4m5s',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-kixl661zq', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-13g4ye1aa', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-yzs25416k',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-mqnaihill', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-j5dlna022', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-y8wqqz028',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-a4gfdsqnr', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-m0gv2opei',
                  title: `Performance engineering`,
                  subtopics: [
                    {
                    id: 'sub-w7jd6vgml',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-68nc7c7fc', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gp4xg5p4p', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-6ailebxj2',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-np784xte9', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-z2gav00d5', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ro13n57yh',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ukz2pcdx4', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-51zr1wzat',
                  title: `Production projects`,
                  subtopics: [
                    {
                    id: 'sub-bkg05aynu',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-bki7c98rb', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3byyl0iik', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-kh0d9w1jh',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-kzystzss6', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-x6zcpyheo', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-8zb9un1oi',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-7zyzx5eor', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
