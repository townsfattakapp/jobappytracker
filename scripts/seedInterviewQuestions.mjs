import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '../src/data/curriculum');

function uuid(prefix) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// 1. Internet & Networking Fundamentals
const networkingQuestions = [
  {
    title: 'What is the Internet?',
    type: 'Conceptual',
    beginnerExplanation: 'The Internet is a global network of interconnected computer networks that communicate using standardized protocols.',
    detailedExplanation: 'At its core, the Internet is a massive distributed network infrastructure. It uses the TCP/IP protocol suite to link billions of devices worldwide. It consists of physical hardware (cables, routers, switches) and logical protocols (IP addresses, routing tables) that allow data packets to be transmitted from any source node to any destination node.',
    interviewAnswer: 'The Internet is a globally connected network system that uses the TCP/IP protocol suite to transmit data between devices. It is a network of networks, linking private, public, academic, business, and government networks through electronic, wireless, and optical networking technologies.',
  },
  {
    title: 'How does the Internet work?',
    type: 'Conceptual',
    beginnerExplanation: 'Data is broken into tiny pieces called packets and sent through cables and routers until it reaches its destination.',
    detailedExplanation: 'When data is sent over the Internet, it is broken down into small packets by the TCP protocol. Each packet is labeled with the source and destination IP addresses. Routers read these IP addresses and forward the packets along the most efficient path. Once all packets arrive, TCP reassembles them into the original data.',
    interviewAnswer: 'The Internet works through a combination of packet switching and the TCP/IP protocol suite. Data is divided into packets, each stamped with source and destination IP addresses. Routers on the network inspect these packets and forward them closer to their destination. Upon arrival, the packets are reassembled.',
  },
  {
    title: 'What is an IP address?',
    type: 'Conceptual',
    beginnerExplanation: 'An IP address is like a home address for your computer on the Internet.',
    detailedExplanation: 'An Internet Protocol (IP) address is a numerical label assigned to each device connected to a computer network that uses the IP for communication. It serves two main functions: host or network interface identification and location addressing.',
    interviewAnswer: 'An IP address is a unique identifier for a device on a network. It operates at the Network Layer (Layer 3) of the OSI model and is used for routing packets from source to destination. There are two versions in use: IPv4 (32-bit) and IPv6 (128-bit).',
  },
  {
    title: 'What is TCP/IP?',
    type: 'Conceptual',
    beginnerExplanation: 'TCP/IP is the language computers use to talk to each other on the Internet.',
    detailedExplanation: 'Transmission Control Protocol/Internet Protocol is the foundational suite of communication protocols used to interconnect network devices. TCP provides reliable, ordered, and error-checked delivery of a stream of octets, while IP handles the addressing and routing of packets.',
    interviewAnswer: 'TCP/IP is the foundational communication protocol suite of the Internet. IP is responsible for routing and addressing packets across networks, while TCP ensures reliable, ordered, and error-checked delivery of those packets through mechanisms like the three-way handshake, sequence numbers, and acknowledgments.',
  },
  {
    title: 'What is DNS?',
    type: 'Conceptual',
    beginnerExplanation: 'DNS is the phonebook of the Internet. It translates human-readable domain names into IP addresses.',
    detailedExplanation: 'The Domain Name System (DNS) is a hierarchical and distributed naming system. When you type a URL, the browser queries a DNS resolver, which recursively queries Root, TLD, and Authoritative Name Servers to resolve the domain name into an IP address.',
    interviewAnswer: 'DNS stands for Domain Name System. It resolves human-readable domain names (like google.com) into machine-readable IP addresses. The resolution process involves querying a recursive resolver, which interacts with root servers, Top-Level Domain (TLD) servers, and authoritative name servers to find the corresponding IP.',
  },
  {
    title: 'What is the TCP three-way handshake?',
    type: 'Conceptual',
    beginnerExplanation: 'It is a greeting process where two computers establish a connection before sending data: "Hello?", "I hear you, hello back!", "Got it, let\'s talk!".',
    detailedExplanation: 'The TCP 3-way handshake is used to establish a reliable connection. Step 1: SYN (Client sends a SYN sequence number). Step 2: SYN-ACK (Server acknowledges the SYN and sends its own SYN). Step 3: ACK (Client acknowledges the server\'s SYN).',
    interviewAnswer: 'The TCP three-way handshake is the process used to establish a TCP connection. The client sends a SYN packet to initiate the connection. The server responds with a SYN-ACK packet to acknowledge the request. Finally, the client sends an ACK packet back to the server, establishing a reliable, full-duplex connection.',
  }
];

// 2. Browser & Web Fundamentals
const webQuestions = [
  {
    title: 'How does a browser work?',
    type: 'Conceptual',
    beginnerExplanation: 'A browser downloads web files (HTML, CSS, JS) and paints them onto your screen.',
    detailedExplanation: 'The browser architecture consists of a User Interface, Browser Engine, Rendering Engine, Networking, JavaScript Engine, UI Backend, and Data Persistence. It parses HTML into a DOM tree, CSS into a CSSOM tree, combines them into a Render Tree, calculates layout, and paints pixels to the screen.',
    interviewAnswer: 'A browser fetches resources via HTTP/S, parses HTML into a DOM tree and CSS into a CSSOM tree. It combines these into a Render Tree, performs layout calculations to determine element geometry, and finally paints the pixels to the screen. JavaScript is executed by a separate engine (like V8) which can modify the DOM/CSSOM.',
  },
  {
    title: 'What is the JavaScript call stack?',
    type: 'Conceptual',
    beginnerExplanation: 'It is a list that keeps track of what function is currently running in your code.',
    detailedExplanation: 'The call stack is a LIFO (Last In, First Out) data structure used by the JavaScript engine to keep track of function execution. When a function is invoked, an execution context is pushed onto the stack. When it returns, it is popped off.',
    interviewAnswer: 'The JavaScript call stack is a LIFO data structure that tracks function execution contexts. Since JS is single-threaded, it has one call stack. When a script calls a function, the engine adds it to the stack. If that function calls another, it is added on top. When a function finishes, it is popped off the stack.',
  },
  {
    title: 'What is the event loop?',
    type: 'Conceptual',
    beginnerExplanation: 'The event loop is a traffic controller that allows JavaScript to do multiple things without freezing the browser.',
    detailedExplanation: 'The Event Loop continuously checks if the call stack is empty. If it is, it looks at the microtask queue (Promises) and the macrotask queue (setTimeout, DOM events). Microtasks are processed before the next macrotask.',
    interviewAnswer: 'The Event Loop is the mechanism that allows JavaScript to perform non-blocking asynchronous operations despite being single-threaded. It constantly monitors the call stack and the callback queues. If the call stack is empty, it pushes tasks from the microtask queue (e.g., Promise callbacks) first, followed by the macrotask queue (e.g., setTimeout).',
  }
];

function generateQuestionDef(q) {
  return `{
    id: '${uuid('q')}',
    title: \`${q.title}\`,
    difficulty: 'Intermediate',
    type: '${q.type}',
    estDurationMinutes: 15,
    beginnerExplanation: \`${q.beginnerExplanation}\`,
    detailedExplanation: \`${q.detailedExplanation}\`,
    interviewAnswer: \`${q.interviewAnswer}\`
  }`;
}

const csFile = path.join(outDir, 'cs.ts');
const jsFile = path.join(outDir, 'js.ts');

if (fs.existsSync(csFile)) {
  let csContent = fs.readFileSync(csFile, 'utf8');
  // Find a good place to inject networking questions in cs.ts
  // Let's find "Computer Networks - Basics"
  const targetRegex = /(title: \`Computer Networks - Basics\`,[\s\S]*?tasks: \[[\s\S]*?\])/;
  
  if (targetRegex.test(csContent)) {
    const questionsBlock = `,\n                    questions: [\n${networkingQuestions.map(generateQuestionDef).join(',\n')}\n                    ]`;
    csContent = csContent.replace(targetRegex, `$1${questionsBlock}`);
    fs.writeFileSync(csFile, csContent);
    console.log('Seeded networking questions into cs.ts');
  } else {
    console.log('Could not find Computer Networks - Basics in cs.ts');
  }
}

if (fs.existsSync(jsFile)) {
  let jsContent = fs.readFileSync(jsFile, 'utf8');
  // Find "JS Fundamentals"
  const targetRegex = /(title: \`JS Fundamentals\`,[\s\S]*?tasks: \[[\s\S]*?\])/;
  
  if (targetRegex.test(jsContent)) {
    const questionsBlock = `,\n                    questions: [\n${webQuestions.map(generateQuestionDef).join(',\n')}\n                    ]`;
    jsContent = jsContent.replace(targetRegex, `$1${questionsBlock}`);
    fs.writeFileSync(jsFile, jsContent);
    console.log('Seeded web fundamentals questions into js.ts');
  } else {
    console.log('Could not find JS Fundamentals in js.ts');
  }
}
