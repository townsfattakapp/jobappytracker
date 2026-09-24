import { CurriculumTrack } from '../../types';

export const tracksqlCurriculum: CurriculumTrack = {
  id: 'track-sql',
  title: `SQL, PostgreSQL and MySQL`,
  description: `Master relational databases.`,
  prerequisites: [],
  levels: [
    {
      id: 'lvl-nwkwypfmc',
      name: 'All Levels',
      categories: [
        {
          id: 'cat-4iwihngtm',
          title: `SQL Fundamentals`,
          modules: [
            {
              id: 'mod-dqv9380ti',
              title: 'Concepts & Implementation',
              topics: [
                  {
                    id: 'top-oiipo9skf',
                    title: `What is SQL?`,
                    subtopics: [
                      {
                      id: 'sub-775rrrtuu',
                      title: 'Theory & Fundamentals',
                      tasks: [
                        { id: 'tsk-ikh6r2z8l', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: 'tsk-ms9n0wrhs', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                      ],
                      questions: [
  {
      id: 'q-8hnp7kbba',
      title: `What exactly is SQL?`,
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
                    id: 'top-nom24p4oi',
                    title: `Why use SQL?`,
                    subtopics: [
                      {
                      id: 'sub-313bkbijy',
                      title: 'Theory & Fundamentals',
                      tasks: [
                        { id: 'tsk-bpdnbtmkx', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: 'tsk-ef5h1oqwt', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                      ],
                      questions: [
  {
      id: 'q-7asjj3hiq',
      title: `Where is SQL used?`,
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
                    id: 'top-v8l9crqem',
                    title: `History and Ecosystem`,
                    subtopics: [
                      {
                      id: 'sub-ddjtfopew',
                      title: 'Theory & Fundamentals',
                      tasks: [
                        { id: 'tsk-amj3437qp', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                        { id: 'tsk-xut7y78m8', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                      ],
                      questions: [
  {
      id: 'q-etuxbk8ej',
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
                  id: 'top-m09gk2qcp',
                  title: `Relational database fundamentals`,
                  subtopics: [
                    {
                    id: 'sub-lmm652oyd',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-x0b093azh', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-hoafhspdj', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-iu5cvtuyc',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-hq1wkc89p', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-e6ps1w2di', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-a0mb7924k',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-pqz5i58k4', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-7f1is96tu',
                  title: `Tables`,
                  subtopics: [
                    {
                    id: 'sub-izi413ndj',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-u46xcsdzr', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-85u7e9y2k', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ichabu6pt',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-7l5ll8dis', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-vpc7snosj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-dysmw6mh7',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-dw95t898f', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ecpsublcj',
                  title: `Schemas`,
                  subtopics: [
                    {
                    id: 'sub-ynllrztpf',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-98snrd8yz', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-zfc090xqa', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-phyqtsdpt',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-qh7rbyamf', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dhlqadxdv', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-zf3lvamut',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-61sc99x88', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-pjtsmeob0',
                  title: `Types`,
                  subtopics: [
                    {
                    id: 'sub-if2me7pjw',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-syr6nnbg7', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-d9q6iramo', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-4gly9zfrn',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-05bqfot59', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-v423knngx', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-pxa7328wy',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-edeahvfq9', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-8hn1s2m27',
                  title: `Keys`,
                  subtopics: [
                    {
                    id: 'sub-mbj2swiiq',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-dn6ffe25q', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-k395w1svq', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-byci738z6',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-msjwiqo1i', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nmb1v12dl', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-b3f9ded1m',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-elowqajft', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-w1er9jetj',
                  title: `Constraints`,
                  subtopics: [
                    {
                    id: 'sub-ee0hudib1',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-u88ufh01k', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-7yxtj7u8k', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-t80pld0jq',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-vyrsbxv9l', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-m37u4pr9u', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-k4drfsj88',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-3oozywm7y', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-9u0ngz6b8',
          title: `CRUD Operations`,
          modules: [
            {
              id: 'mod-izbijuufs',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-7lcv59n56',
                  title: `SELECT`,
                  subtopics: [
                    {
                    id: 'sub-98t6og4it',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-j45l0ypt8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ypa8r3euw', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-bo3n3nwbp',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-rzto8qp6k', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-b585gdjnj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-b6ki04avc',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ndd1z2f6e', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ubj9klf83',
                  title: `INSERT`,
                  subtopics: [
                    {
                    id: 'sub-1g2nu5xsx',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ble8sz4dd', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-fo1c41jcc', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-q4f6qtpmz',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ml401ftub', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-7ala9qba5', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-gnllmqcmn',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-lkpu4f3vo', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-xmj79x84j',
                  title: `UPDATE`,
                  subtopics: [
                    {
                    id: 'sub-9jfo0oyia',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-7ip6exqtf', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-s8bqca5v4', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-um3bzkon4',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ftd9xs1mi', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-htdb2r8dk', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-79j7qm4tc',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-uk6y3kiyy', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-8fuzhz2oj',
                  title: `DELETE`,
                  subtopics: [
                    {
                    id: 'sub-wsbbo9be1',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-l2y9waw67', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ko3vo3r3l', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ft5jfwihm',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-iwqdiwhgj', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3va36bfhq', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-6goyveind',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-qqcp065gl', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-neg92yf8u',
                  title: `WHERE`,
                  subtopics: [
                    {
                    id: 'sub-ce5cx2ymw',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-1rgemxc5m', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-r90kamkjq', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-kekget4jz',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-bm4dky9bs', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0mavk0cyw', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-n51rhb44q',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-8ul90kmyu', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-kuswzc068',
                  title: `ORDER BY`,
                  subtopics: [
                    {
                    id: 'sub-i9jw6ldgs',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-nilst32qu', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3gq9638r0', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-iuh9lixwr',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-42b3aq7co', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-e7zyo5vw1', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-uzhf2an49',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-rv6la3sps', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-gbrlg8jr5',
                  title: `GROUP BY`,
                  subtopics: [
                    {
                    id: 'sub-48ag2eb5v',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-2khl4124x', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jy9rf2lco', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-uojq048uf',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-2torw606u', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-qmhhc36n9', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-28sh83efx',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-063an796z', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-d326a8tr1',
                  title: `HAVING`,
                  subtopics: [
                    {
                    id: 'sub-3cpnxd4mi',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-03rhdmxk9', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9n2cs42ys', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-lrnmgsx7x',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-wkl08s028', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-tp61dab6d', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-6kq28vtcc',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-xppmxjlvr', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-zn8h6fqr7',
          title: `Joins and Advanced Queries`,
          modules: [
            {
              id: 'mod-ykxh2p5mw',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-t7febyyin',
                  title: `INNER JOIN`,
                  subtopics: [
                    {
                    id: 'sub-nnnmkntry',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-x3f43464s', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-uluoj2gan', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-3nfy618qi',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-6y79wz3pc', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-w1yv5b1nk', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-dehodqm4c',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ptj74tj0u', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-2ylkwa90t',
                  title: `LEFT JOIN`,
                  subtopics: [
                    {
                    id: 'sub-wrv4r6sjf',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-pmboatj4p', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ie8c6cah0', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-xi8pd9x8p',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-87fpwz48c', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dtyhf6cwa', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ba1u54zbu',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-5dk4cgz1d', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-lags5bxs4',
                  title: `RIGHT JOIN`,
                  subtopics: [
                    {
                    id: 'sub-att9p6eoq',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-thn755t1v', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6gkr3ociz', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-9emfiv0jx',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-supku7w23', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-pbpl4btnj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-o3to35f3d',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-u2t44p7ih', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-twmh6xvfi',
                  title: `FULL JOIN`,
                  subtopics: [
                    {
                    id: 'sub-35h1c04j6',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-e7k550eqh', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dkuyso56i', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-vnrjt0k2s',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-h10l22j9t', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0hctow5ll', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-lyt7bx5au',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-0tjqwuul9', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-cq7eigjrp',
                  title: `Subqueries`,
                  subtopics: [
                    {
                    id: 'sub-lo35xoi7n',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-f640p25oj', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gcripujnu', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-lsmozadgd',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-le31yh84o', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-i4e2bidh2', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-72g3rkwad',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-utlwffhgw', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-knxvhebnb',
                  title: `CTEs`,
                  subtopics: [
                    {
                    id: 'sub-kxge5we9w',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-3q6hp93z8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3sy8p9vzb', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-80gqpadeb',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-4oz803ao3', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dmtqckbc0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-44eqt1tjx',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-pxyfjmljb', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-nny7fq2m7',
                  title: `Window functions`,
                  subtopics: [
                    {
                    id: 'sub-havr5bwzo',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ldtlcy7f2', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nsck09hdr', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ehvtpx4xo',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-qqz13c01u', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gypc7jc20', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-a3g4yp00d',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-h702v7tzp', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-iyipppr26',
          title: `Database Architecture`,
          modules: [
            {
              id: 'mod-dlmam9usb',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-o310911j5',
                  title: `Schema design`,
                  subtopics: [
                    {
                    id: 'sub-73fntm70o',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-qoxiik89u', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3ncg3xmjc', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ohur8m9uc',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-1acowjk7i', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-uy1e493ee', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-1ydtg91yb',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-tkw1zejo6', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-z9vudokey',
                  title: `Relationships`,
                  subtopics: [
                    {
                    id: 'sub-ftobpveen',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-d4u72ewxq', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-qpzrosskv', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-8st5gode7',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ksfeevitc', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jvprencph', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-bdkaxkinz',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-flwhae3i1', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-7ri8oyfmn',
                  title: `Normalization`,
                  subtopics: [
                    {
                    id: 'sub-01pcluqiu',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-mrruk2udo', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-of8576es2', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-u9yezo28m',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-v67ppbbdh', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-644esa4p9', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-br0g23otp',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-rcc6dpq8c', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-flqlv1lg9',
                  title: `Indexes`,
                  subtopics: [
                    {
                    id: 'sub-b8zx54t10',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-px5qkqkfu', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-g15f53sid', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-otcz58wwi',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-um29xsp5d', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3e33cfmzm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-bpueqjfx3',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-zt1p6g14r', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-9bv02qzpt',
                  title: `Query execution plans`,
                  subtopics: [
                    {
                    id: 'sub-4bd50gwed',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-6od4mehcx', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-fhtiv0ind', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-iw42dbqlv',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-rymqgi163', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gqer7a1qj', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-fv0z8jlp1',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ij255x8do', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-i6gcfcpoc',
          title: `Transactions`,
          modules: [
            {
              id: 'mod-cgf487zsh',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-us78w4x0h',
                  title: `Transactions`,
                  subtopics: [
                    {
                    id: 'sub-273nlvo7f',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-eyma49ucq', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ewl35h1lf', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-008gqvgv3',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-kehptlwsf', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-hqotdkvpg', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-w5vyxd8ab',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-86981q9xs', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-28m5ze6mj',
                  title: `ACID`,
                  subtopics: [
                    {
                    id: 'sub-caul2hntu',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-bxo0fcbt6', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gxo5o4kah', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-lqb7o3c9q',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-v0k6cuibk', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-p7lc1n1r0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-vskcr5xmo',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-bw71ws6xc', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-cpwmkcgu6',
                  title: `Isolation levels`,
                  subtopics: [
                    {
                    id: 'sub-bd4gfqbj8',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-oj0oblhdb', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-5zw2506th', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-1cch6h7u3',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-oo0dqmw3p', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-n90khqhxa', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-pv9zf7xvq',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-shiw7h63r', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-a5umg6yfv',
                  title: `Locking`,
                  subtopics: [
                    {
                    id: 'sub-9i36t0b28',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-mq31d08hj', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-n8tpv80sh', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-tz38wfg8t',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-tt3dp6ppw', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-n364o7jlk', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ci1d2ipwf',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-fr8auhqr4', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-302vzsv1w',
                  title: `Deadlocks`,
                  subtopics: [
                    {
                    id: 'sub-f5lgdme48',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ff6fdq5xo', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6dtorw8j0', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-yvk10ynmk',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-lrrq4dak7', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-plctxvhud', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-x7ithckip',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ybcka3jr0', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-afp40inpf',
                  title: `Concurrency`,
                  subtopics: [
                    {
                    id: 'sub-orq6q63n7',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-pkq7o111m', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-b74s4mvxa', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-6tsg1byav',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-amv2vsph7', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nj16wkcy6', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-as1kjfe01',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-8lgmbei00', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-pom3agdju',
          title: `Advanced Features`,
          modules: [
            {
              id: 'mod-wr0z0jq68',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-95k2rxrsr',
                  title: `Views`,
                  subtopics: [
                    {
                    id: 'sub-9zzmb23do',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-lhuk9gi4r', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-kfx4krmdx', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-nqncsgd7q',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-tqb6hiyt9', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-spy7hx4sm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-n5a6do3p8',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-nj4u8qtzc', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-998cl10ht',
                  title: `Triggers`,
                  subtopics: [
                    {
                    id: 'sub-znli3blzz',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-tgzhyiez1', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-wacaduotz', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-3jv14ut3f',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-1hlpjmzqe', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-31nl3a44c', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-yeytm8icn',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-s48ouoo1h', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-lz9cxxcfr',
                  title: `Stored procedures`,
                  subtopics: [
                    {
                    id: 'sub-t75sda7h2',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-jrvmdi5v8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nep4z3s4p', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-hkoivigxc',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-kzd500x3p', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-c12pzhv1m', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-nmu7ksjdk',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-lk383ztr1', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-twomymquy',
                  title: `Migrations`,
                  subtopics: [
                    {
                    id: 'sub-jdzte06dz',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-gwo0larck', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6g3ku6ago', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-n8attz9dj',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-wdf9mbn4c', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dvhhjeb8h', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-s8mpapioj',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-nw6cy3v6p', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-mxyyxu9fj',
                  title: `Schema evolution`,
                  subtopics: [
                    {
                    id: 'sub-33gutisqy',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-hibkpguyk', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-23ebhmce0', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-5g29217fq',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-hvuiechsh', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-b4d8uheop', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-iukh0x05b',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-v65c3bcng', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-jagompugo',
          title: `Specific Databases`,
          modules: [
            {
              id: 'mod-iqbttv2wn',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-yl4k3xv7b',
                  title: `PostgreSQL-specific features`,
                  subtopics: [
                    {
                    id: 'sub-32u22i9yt',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-c0wibgi6i', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-wrqksewyv', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-57xk84st5',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-3tbihpztg', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-d2mq7nejk', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-6lt3oymch',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-j3q6nutxo', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-udptmflx6',
                  title: `MySQL-specific features`,
                  subtopics: [
                    {
                    id: 'sub-xvae65xaf',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-xbs5xsgll', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-weun7qvza', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-uhsmfxlyn',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-r6oikd8bj', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-rv0bp95r9', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-t0ucfm0y5',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-lgq5icytx', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-l5gf7tabl',
                  title: `Partitioning`,
                  subtopics: [
                    {
                    id: 'sub-y019y1ygf',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-9a9up9725', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-cjdnkse0g', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-2o2m1fey4',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-p1eplybyy', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-g0za5ga1c', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-l7eiydx81',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ve814frsu', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-zezj11uja',
                  title: `Replication`,
                  subtopics: [
                    {
                    id: 'sub-bmbqwfndt',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-fve5ynrl9', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-usi44ho83', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-cu2smcbvl',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-2o6ji8lhp', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9xbb3w1r7', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-q0b0eqzu2',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-z5wof02hv', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-peka5vawl',
                  title: `High availability`,
                  subtopics: [
                    {
                    id: 'sub-5cf8wh2rp',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-b5kqicd3a', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-lmkg8qzvu', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-fu7b7mnbk',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-jkrunx7wp', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-4i6f8d5va', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ic8yc47sq',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ookugzv54', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-5ty52iv38',
          title: `Administration`,
          modules: [
            {
              id: 'mod-n6m1wbekj',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-2hd1y616w',
                  title: `Backup`,
                  subtopics: [
                    {
                    id: 'sub-bxx039xom',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-3eqmdawdq', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-tcbldm3h3', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-fpdkk3foy',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-dscxwyes3', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-orsi3sm1p', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-nv5ec97g7',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-3f9o6pxxh', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-uktyq1and',
                  title: `Recovery`,
                  subtopics: [
                    {
                    id: 'sub-r9c3lpsfw',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-aqg2lnvom', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-hxwnbv5ar', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-o8sk40gi2',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-qbwg986k6', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-b1xqcgbi0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-1129d5qce',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ui8u905uo', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-zahztbss3',
                  title: `Pooling`,
                  subtopics: [
                    {
                    id: 'sub-biudngupi',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-a1ij75s00', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-r0mg2ueh9', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-9bhbc3lyb',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-n21kq3f4e', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-rjtklm549', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-7qnsztnvl',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-qghnjensl', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-8qm5o46i4',
                  title: `Security`,
                  subtopics: [
                    {
                    id: 'sub-wgunva5if',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-9fiwkfte3', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-a279m8ima', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-8dg22xnlj',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-1hafzksrd', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-md3uzfcoy', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-rtbo9pun4',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1of1na6zy', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-xlf6l28o0',
                  title: `Query optimization`,
                  subtopics: [
                    {
                    id: 'sub-zciifjb62',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-lyxq7d827', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nkz1pwbo6', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-mt82q67j1',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-6q7roq4a9', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-algec844l', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-n2ll9f489',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-zbmo6yidu', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-39p7socg4',
                  title: `Practical database projects`,
                  subtopics: [
                    {
                    id: 'sub-pct9t74ib',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-iqpymtpjv', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jqc1v4aw9', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-bvb1a1q16',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-zjx3bmqxj', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-uu040honw', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-00t2t7yzp',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-uazsy4dfe', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
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
