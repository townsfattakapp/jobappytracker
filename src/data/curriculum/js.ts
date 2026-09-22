import { CurriculumTrack } from '../../types';

export const trackjsCurriculum: CurriculumTrack = {
  id: 'track-js',
  title: `JavaScript and TypeScript`,
  description: `Master web programming languages.`,
  prerequisites: [],
  levels: [
    {
      id: 'lvl-xoih0wyq7',
      name: 'All Levels',
      categories: [
        {
          id: 'cat-1y4ckbdf7',
          title: `JS Fundamentals`,
          modules: [
            {
              id: 'mod-cmmorqtbq',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-mnivimi0o',
                  title: `JavaScript runtime`,
                  subtopics: [
                    {
                    id: 'sub-n9uwxvxlc',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-rx8udi7do', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-8oankda8z', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ],
                    questions: [
{
    id: 'q-44dyfx0ir',
    title: `How does a browser work?`,
    difficulty: 'Intermediate',
    type: 'Conceptual',
    estDurationMinutes: 15,
    beginnerExplanation: `A browser downloads web files (HTML, CSS, JS) and paints them onto your screen.`,
    detailedExplanation: `The browser architecture consists of a User Interface, Browser Engine, Rendering Engine, Networking, JavaScript Engine, UI Backend, and Data Persistence. It parses HTML into a DOM tree, CSS into a CSSOM tree, combines them into a Render Tree, calculates layout, and paints pixels to the screen.`,
    interviewAnswer: `A browser fetches resources via HTTP/S, parses HTML into a DOM tree and CSS into a CSSOM tree. It combines these into a Render Tree, performs layout calculations to determine element geometry, and finally paints the pixels to the screen. JavaScript is executed by a separate engine (like V8) which can modify the DOM/CSSOM.`
  },
{
    id: 'q-qvum0dkr8',
    title: `What is the JavaScript call stack?`,
    difficulty: 'Intermediate',
    type: 'Conceptual',
    estDurationMinutes: 15,
    beginnerExplanation: `It is a list that keeps track of what function is currently running in your code.`,
    detailedExplanation: `The call stack is a LIFO (Last In, First Out) data structure used by the JavaScript engine to keep track of function execution. When a function is invoked, an execution context is pushed onto the stack. When it returns, it is popped off.`,
    interviewAnswer: `The JavaScript call stack is a LIFO data structure that tracks function execution contexts. Since JS is single-threaded, it has one call stack. When a script calls a function, the engine adds it to the stack. If that function calls another, it is added on top. When a function finishes, it is popped off the stack.`
  },
{
    id: 'q-a4z1vipme',
    title: `What is the event loop?`,
    difficulty: 'Intermediate',
    type: 'Conceptual',
    estDurationMinutes: 15,
    beginnerExplanation: `The event loop is a traffic controller that allows JavaScript to do multiple things without freezing the browser.`,
    detailedExplanation: `The Event Loop continuously checks if the call stack is empty. If it is, it looks at the microtask queue (Promises) and the macrotask queue (setTimeout, DOM events). Microtasks are processed before the next macrotask.`,
    interviewAnswer: `The Event Loop is the mechanism that allows JavaScript to perform non-blocking asynchronous operations despite being single-threaded. It constantly monitors the call stack and the callback queues. If the call stack is empty, it pushes tasks from the microtask queue (e.g., Promise callbacks) first, followed by the macrotask queue (e.g., setTimeout).`
  }
                    ]
                  },
{
                    id: 'sub-z4ra4ulxy',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-eznp652ut', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-tbnyqzck1', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-xxkenojf4',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-eeu1g8li3', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-kmslx8vzk',
                  title: `Browser execution`,
                  subtopics: [
                    {
                    id: 'sub-w2jcsg537',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-81ly6tzav', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-eru04xc4e', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-i1bchgzg8',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-g2xnytdwz', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-x7ogkyk8u', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-lzl3oomyj',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-reytm8ep8', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-qly6vae2r',
                  title: `Variables and types`,
                  subtopics: [
                    {
                    id: 'sub-qx9cs4w4f',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-7pjy4odgl', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9r8sl0hzl', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-9i819weuo',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ltd9498r0', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-75c5jgxel', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-d7ogaymc9',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-woemhpqpt', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-grk09y3r9',
                  title: `Operators and type coercion`,
                  subtopics: [
                    {
                    id: 'sub-fdxqjs8pz',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-fhd3nvpmo', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-fsj44lqop', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-u8sn2wk0y',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-0zbh5hzmi', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-secg0do9t', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-u11v0w0je',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-lcl0db0po', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-7clzcmucv',
                  title: `Conditions and loops`,
                  subtopics: [
                    {
                    id: 'sub-mh2dc0r0d',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-lounhd9i4', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jskuay1gj', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-6ifibgplc',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-2dbg91k7i', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-40zcr1glw', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-93z0o0em0',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-qayqsbeed', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-an3s8q3w0',
                  title: `Functions and callbacks`,
                  subtopics: [
                    {
                    id: 'sub-i0brw1k0a',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-u4a8em7su', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-h9wyi8lx2', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-vueoljdf3',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-2ubna1n80', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-on4hszwok', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-dz6w3je4o',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-2ob3r1owc', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-kxur29dzi',
          title: `Scope and Context`,
          modules: [
            {
              id: 'mod-6nheelr44',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-2kdky98oh',
                  title: `Scope and hoisting`,
                  subtopics: [
                    {
                    id: 'sub-gbq1im0cr',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-1qn2zntp2', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-sad4plrry', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-rzoqkeok0',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-w3o92b3ol', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-c4u98emq8', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-4ldogdx7m',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-nokk01e88', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-66xysxgt7',
                  title: `Closures`,
                  subtopics: [
                    {
                    id: 'sub-uu4q6pi07',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-cecf5cse0', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dt62i1y3t', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-iv1hx67yg',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-9raymyprk', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-7aoi5lxhg', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-knq1wf1nb',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-e33ezlrr3', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-3pqrm0fvs',
                  title: `Lexical environment`,
                  subtopics: [
                    {
                    id: 'sub-bz5y5wcva',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-8u42unig0', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-krvaz5452', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-6jiccqtff',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-tjnhnonr8', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-l868aof1q', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-wh67xtvb1',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-fi7x6twwf', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-7gxaqlrrd',
                  title: `this keyword`,
                  subtopics: [
                    {
                    id: 'sub-4vbb4njte',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-z8r7bt2i6', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-bl9x929e2', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-9xp1u95og',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-k57y73tzr', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nsqtejmq0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ffg4ruhbd',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-dl82n32qz', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-jt4uxs6gw',
                  title: `call, apply, bind`,
                  subtopics: [
                    {
                    id: 'sub-e35orkp0s',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ka53tijrb', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dvdva76w3', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-253fhnqge',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-yicghpnnp', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-xqh2g4y9l', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-tdjq7f234',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-z0dsw76qh', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-06wxt45te',
                  title: `Arrow functions`,
                  subtopics: [
                    {
                    id: 'sub-pv10gob4x',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-knszz2s0t', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-4gkc5c1dt', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-5afsi1vjg',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-84mkjl9fc', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ex3ez93v9', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-qfxbue9li',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-8hoyf92jw', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-50avaqmg8',
          title: `Objects and DOM`,
          modules: [
            {
              id: 'mod-v8f67ftwe',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-ax5l9ltk5',
                  title: `Objects`,
                  subtopics: [
                    {
                    id: 'sub-a5k0c0cqu',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-jhujp4a0f', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-oge9l55uv', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-y5ct5fwx1',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-gcdxhu8dv', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-79tkuqjsb', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-7ui819es6',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-m47hcxom6', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-42ypmpeje',
                  title: `Arrays`,
                  subtopics: [
                    {
                    id: 'sub-xmyqcnj5w',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ryqcui35s', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0e8f1ffe4', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-1zd1vc6y1',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-hstqlpf1z', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ba1wyqqmf', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-tbx0v2di2',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ryw7glyc6', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-641diemjd',
                  title: `Prototypes`,
                  subtopics: [
                    {
                    id: 'sub-mrobmzidh',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-sxisplilz', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-g9knrwdey', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-plj316uia',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-cejd8njki', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-o6du4bnov', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-l6t0w7o97',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-bix6gvauj', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-3e9a4agyg',
                  title: `Classes`,
                  subtopics: [
                    {
                    id: 'sub-v266e5iq9',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-747tvhapb', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6uqu8yz69', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-bn6ut0ar4',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-r2v94b4y5', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-b0gv3n0k1', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-qnq63luxq',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-o1tsvhbtt', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-zf7sj5qvv',
                  title: `DOM manipulation`,
                  subtopics: [
                    {
                    id: 'sub-s4h192qqq',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-2ulmxmci8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ycw38an7d', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-yjjf4tinz',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-43vakf2dc', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-qo8rvr8d3', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-v28uo31q2',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-noy0qbjpl', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-8gh48gc19',
                  title: `Events`,
                  subtopics: [
                    {
                    id: 'sub-pwvtt2gqa',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-qvanbk629', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dxkmfwdas', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-el69ep6ad',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-azo6tmrof', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-kzvq1gkms', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-18z8wukhl',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-x6ch3p0s9', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-m7x9hbe16',
                  title: `Browser APIs`,
                  subtopics: [
                    {
                    id: 'sub-wuupgi9rl',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-zq7cbc2kq', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-w10wstuw2', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-v12y0ro7k',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-3alf6nsj1', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ex8ktmhn3', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-y8z4zk93l',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-dpnm6niaj', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-m1usmdfv8',
                  title: `Browser storage`,
                  subtopics: [
                    {
                    id: 'sub-w3n8gm08o',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-ldhldaiob', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-gaixxx7d1', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-qjq933hwp',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-kgelaqm50', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-edc4nxzqf', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-p4cactd9q',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-7d08cclhu', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ytlce29ge',
                  title: `Cookies and security`,
                  subtopics: [
                    {
                    id: 'sub-7ck2flzsi',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-a6o9jxdut', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-dg398ipd8', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-7yiu20qq6',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ef8f6hksm', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-04aqk1ucl', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-hl5vxn2rx',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-fkgp9em67', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-o0jf2bg5u',
          title: `Asynchronous JS`,
          modules: [
            {
              id: 'mod-sb9ygk3z9',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-he7yjudnu',
                  title: `Call stack`,
                  subtopics: [
                    {
                    id: 'sub-xjv76ri55',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-w8dy4z6ux', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-89sjqbj8i', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-umjyn1ida',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-cljgp5x1s', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-xmf2znz39', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-6g8seppkl',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-pxucihhbj', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-dqh8x39a5',
                  title: `Event loop`,
                  subtopics: [
                    {
                    id: 'sub-8s3g1leb1',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-g8s78ixn8', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6n9071t8x', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-xh7f0ukj9',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-rptncm4hg', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-kavxwkxdc', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-7yemc0k59',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-z1los8aju', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-h7yry5ezf',
                  title: `Tasks and microtasks`,
                  subtopics: [
                    {
                    id: 'sub-qtjcl00sb',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-zup7a24b6', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-k24bwlet6', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ck07carma',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-m76916g9c', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-w094wuq7q', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-hozfi0v35',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-na24ntd9e', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-73i76jzco',
                  title: `Promises`,
                  subtopics: [
                    {
                    id: 'sub-v8xhqsa3m',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-4v1hrnw54', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-3bjvxqa2a', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-dyg5wt2d6',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-02xc61kcn', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-38lfisaa0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-tdf9tma11',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-dqgu3vaqy', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-wrbyiwn9v',
                  title: `async/await`,
                  subtopics: [
                    {
                    id: 'sub-c022k0ero',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-fny6jpi2z', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ueqtzw2af', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-sppmwhzvt',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-2uynwjnbr', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-js5afjf7f', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ok4t7elyq',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1bw1fp8e1', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-38rz23nxh',
                  title: `Fetch`,
                  subtopics: [
                    {
                    id: 'sub-di80fcrgp',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-0lcfiea4u', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-21bhnluyx', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-yj7k19ibj',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-1ig8s4k93', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9ayuzb2z3', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-8n6gcnik5',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-w7js2epsx', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-x5118h7mu',
                  title: `HTTP requests`,
                  subtopics: [
                    {
                    id: 'sub-eijyck8bo',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-wb2ptf8qf', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9zlbs3v1e', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-41duglufs',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-awr8pyd9b', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0ukskb8xp', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-nmc4y2v34',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-jx6sdaw9l', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ndhooqvm4',
                  title: `Error handling`,
                  subtopics: [
                    {
                    id: 'sub-5lqaq5qjs',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-njmuamfi5', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-74m78qxf5', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-c6djxu5or',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-7gfp1kvv3', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-mf8zdkquh', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-3rhndyv9o',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-q82p61sdt', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-zt7kh7fhu',
          title: `Advanced JS`,
          modules: [
            {
              id: 'mod-fktfelni6',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-rz8inimfr',
                  title: `Modules`,
                  subtopics: [
                    {
                    id: 'sub-iw3ybco0v',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-f90ijclb3', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jzn5sugdx', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-l91fklc9u',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-wxe3idlls', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-tmc0tsvjx', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-76tx5eac2',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-adpt05651', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-luqm8wu7g',
                  title: `Package management`,
                  subtopics: [
                    {
                    id: 'sub-njj83ggo4',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-bq0ipkci7', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-omcroilrt', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-3pzgfgiiw',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-gflvirb1x', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-24rfa49kg', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-55fn4nnxo',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ia67svll5', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-1gqulmp0v',
                  title: `Iterators and generators`,
                  subtopics: [
                    {
                    id: 'sub-fruoq7u48',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-dtjrzlv5u', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-khgi2elft', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-glxgbc1zl',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-mnerd2n3j', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-69bsrisnm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ktzqpeui5',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-4bi3fkcxa', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-a41mp2a7r',
                  title: `Functional programming`,
                  subtopics: [
                    {
                    id: 'sub-8rnt1lf5x',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-189vyqfwi', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-pinjbpdky', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-ekmgmmc7j',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-7bhxcc9cf', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-av2qo5l14', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-4lr1r4fv2',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-o0df17syh', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-fjlydyefs',
                  title: `Memory management`,
                  subtopics: [
                    {
                    id: 'sub-9osuzhqgr',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-vwsqt2x4h', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-d4b4l0qp0', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-rk3d9nzna',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-jsz2sevux', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-k2q7zfeop', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-abr6v41vr',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-txnb8r8gi', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-nysqv75yj',
                  title: `Performance`,
                  subtopics: [
                    {
                    id: 'sub-zf6j0q2mk',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-i9hhhcax7', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6bjqojihl', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-pzax6cx11',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-6lmz3wi29', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6b3dhu1rv', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-defj21c1w',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-j22rg5aui', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-nfkxg82kg',
                  title: `Testing`,
                  subtopics: [
                    {
                    id: 'sub-7zbn7e6xa',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-7fyvmlbo0', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-c5mmyqr6u', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-fu047cejf',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-fj630ct7c', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-w2pg9i806', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-68ova42ni',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-cv0fma6lo', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-6g7mz69j0',
          title: `TypeScript Basics`,
          modules: [
            {
              id: 'mod-ob93qzauy',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-lent0m4xm',
                  title: `TypeScript setup`,
                  subtopics: [
                    {
                    id: 'sub-rud5ni6nj',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-o479h437v', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-61704s7j5', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-a1ayvuh0j',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-g2n2n2j4o', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-sqph98jaq', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-ivdr4650d',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-izrj1e1pz', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-0w2p0yets',
                  title: `Types and strict mode`,
                  subtopics: [
                    {
                    id: 'sub-sa4xt2edo',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-4nqj9uklq', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-sppj8akt4', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-f25767ozh',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-teow0f0sq', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jq9s2eddm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-hfx0gxe7d',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-t88vqy6zu', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-wa0i47ksm',
                  title: `Interfaces`,
                  subtopics: [
                    {
                    id: 'sub-gitd7fuyb',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-q3k2xq08b', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-hcvscoy9z', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-nkhdbvwur',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-4tl64ydbv', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-lzyen7169', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-u6gdzfnbr',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-w31dhlcne', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-lfspl6m8w',
                  title: `Aliases`,
                  subtopics: [
                    {
                    id: 'sub-t1j21i5p5',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-jnpesrywc', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-j6grflsuq', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-y23d7czfr',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-bs73w6kef', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-nmu1ao79j', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-h9ohff43d',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-rlfhcc9om', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-cajlre1d9',
                  title: `Unions and intersections`,
                  subtopics: [
                    {
                    id: 'sub-lokhxobfj',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-sggfflfzp', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-9qh2bbijs', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-xhmrds6j6',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-dxz4b3lze', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-mj1xz4utw', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-xtxzxzn3l',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-r2gzq5nep', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                }
              ]
            }
          ]
        },
{
          id: 'cat-ng9fax9ra',
          title: `Advanced TypeScript`,
          modules: [
            {
              id: 'mod-0o52aup7f',
              title: 'Concepts & Implementation',
              topics: [
                {
                  id: 'top-5cgijnnlt',
                  title: `Generics`,
                  subtopics: [
                    {
                    id: 'sub-7eho2ugp5',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-jw5mucdnz', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-219suij9u', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-asgnl7jc2',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-t6f24xkth', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ey3ujqzkm', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-bgnue3aso',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-ev2sloyct', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-kw4wifesp',
                  title: `Narrowing and type guards`,
                  subtopics: [
                    {
                    id: 'sub-cmxu7s6tr',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-205okau44', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ct16bbcxh', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-xd3jks0zw',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-hugcrdsmg', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-t144y3xp2', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-hofk1uc5s',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-m9184oo16', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-0a6bmyql8',
                  title: `Utility types`,
                  subtopics: [
                    {
                    id: 'sub-a81f0wplo',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-pl5251eic', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-38ri262bz', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-aolwz4hpt',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-jpmu97oyf', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-wes8y5ei0', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-l5hp39um3',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-9spztqc7x', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-li3ze5spq',
                  title: `Mapped types`,
                  subtopics: [
                    {
                    id: 'sub-b7r0zaro4',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-h51mlcts2', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-0ezqr8s0y', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-9f0je5d0l',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-4hk10y94b', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-90lvb6lis', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-rlkxo1pib',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-3ev6bgz0u', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ylo6tcc0w',
                  title: `Conditional types`,
                  subtopics: [
                    {
                    id: 'sub-dqko3x7rv',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-izr35q4y0', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-ifrbbbg1b', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-7o64xbs8u',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-ct33ywdfk', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-sygdpm1z2', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-pyo39o9f0',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-nrxkigtdj', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-8mmky6p4x',
                  title: `Type-safe APIs`,
                  subtopics: [
                    {
                    id: 'sub-f0xi4vvpu',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-srqftpd2y', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-hc7t7i0sf', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-0laq9t7ig',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-t5vf5zr5h', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-s2d4w05e7', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-im3mtctyk',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-rpm2qtd0a', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
                    ]
                  }
                  ]
                },
{
                  id: 'top-ot00c4o1f',
                  title: `Advanced TS architecture`,
                  subtopics: [
                    {
                    id: 'sub-kakgdg6rm',
                    title: 'Theory & Fundamentals',
                    tasks: [
                      { id: 'tsk-bk4d1zwua', title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-jeub6967h', title: 'Review Notes', type: 'Revision', estDurationMinutes: 15 }
                    ]
                  },
{
                    id: 'sub-145r2siwh',
                    title: 'Implementation & Examples',
                    tasks: [
                      { id: 'tsk-gju0qosif', title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: 'tsk-6w627gr2y', title: 'Write Code Snippets', type: 'Practice', estDurationMinutes: 45 }
                    ]
                  },
{
                    id: 'sub-nxe5ibwyh',
                    title: 'Practice & Edge Cases',
                    tasks: [
                      { id: 'tsk-1hb2fngs3', title: 'Solve Problems', type: 'Practice', estDurationMinutes: 60 }
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
