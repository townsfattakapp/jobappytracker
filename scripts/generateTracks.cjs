const fs = require('fs');
const path = require('path');

const catalogue = fs.readFileSync('docs/curriculum-catalogue.md', 'utf8');
const lines = catalogue.split('\n');

const missingIds = [
  'tableau', 'dashboard-design', 'spark', 'data-engineering-projects', 'web-performance', 'vue', 'nuxt', 'frontend-testing', 'pwa', 'frontend-architecture', 'gcp', 'linux', 'docker', 'kubernetes', 'terraform', 'observability', 'sre', 'platform-engineering', 'cloud-security', 'networking', 'infrastructure-automation', 'secure-coding', 'iam', 'cryptography', 'threat-modeling', 'vulnerability-assessment', 'defensive-security', 'security-monitoring', 'incident-response', 'security-engineering', 'computer-organization', 'digital-logic', 'operating-systems', 'computer-networks', 'dbms', 'algorithms', 'compiler-design', 'distributed-systems', 'software-engineering', 'plc', 'parallel-computing', 'software-testing', 'computer-security'
];

let currentFamily = '';
const tracksData = [];

for (const line of lines) {
  if (line.startsWith('## ')) {
    const match = line.match(/## (.*?) \(family `(.*?)`/);
    if (match) {
      currentFamily = match[2];
    }
  }
  
  if (line.includes('| track-') || line.includes('track-')) {
    const ids = line.match(/track-[a-z0-9\-]+/g) || [];
    for (const trackId of ids) {
      const bareId = trackId.replace('track-', '');
      if (missingIds.includes(bareId)) {
        tracksData.push({
          id: trackId,
          bareId,
          title: bareId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          family: currentFamily || 'Computer Science'
        });
      }
    }
  }
}

function generateTrackContent(track) {
  const title = track.title;
  let codeMode = 'plaintext';
  let explainMode = 'concept';
  
  if (track.family.includes('Data')) {
    codeMode = 'python'; explainMode = 'data';
  } else if (track.family.includes('Web')) {
    codeMode = 'typescript'; explainMode = 'react';
  } else if (track.family.includes('Cloud') || track.family.includes('DevOps')) {
    codeMode = 'bash'; explainMode = 'devops';
  } else if (track.family.includes('Security')) {
    codeMode = 'bash'; explainMode = 'security';
  } else if (track.family.includes('Science')) {
    codeMode = 'cpp'; explainMode = 'cs';
  }
  
  const generateCategory = (catIndex, titlePrefix) => {
    const topics = [];
    for (let i = 1; i <= 5; i++) {
      const prereqs = i > 1 ? [`${titlePrefix} topic ${i - 1} for ${title}`] : [];
      topics.push(`
        {
          title: '${titlePrefix} topic ${i} for ${title}',
          description: 'A comprehensive exploration of ${titlePrefix.toLowerCase()} concepts in ${title}, focusing on practical implementation and best practices for part ${i}.',
          concepts: [
            'Understanding ${titlePrefix.toLowerCase()} fundamentals part ${i}',
            'Applying ${title} techniques in practice part ${catIndex}-${i}',
            'Advanced usage patterns and performance part ${catIndex}-${i}'
          ],
          quiz: [
            ['What is the primary purpose of this concept in ${title} part ${catIndex}-${i}?', 'To solve specific architectural or structural problems efficiently.'],
            ['When should you avoid using this pattern part ${catIndex}-${i}?', 'When it introduces unnecessary complexity without measurable benefits.']
          ],
          prereqs: ${JSON.stringify(prereqs)}
        }`);
    }
    return `
    {
      title: '${titlePrefix} Concepts in ${title}',
      description: 'Master the core ${titlePrefix.toLowerCase()} ideas and workflows used by professionals.',
      topics: [${topics.join(',')}]
    }`;
  };

  const categories = [
    generateCategory(1, 'Foundational'),
    generateCategory(2, 'Intermediate'),
    generateCategory(3, 'Advanced'),
    generateCategory(4, 'Architecture'),
    generateCategory(5, 'Real-World')
  ];

  return `import { defineTrack } from '../define'

export const ${track.bareId.replace(/-([a-z])/g, g => g[1].toUpperCase())} = defineTrack({
  id: '${track.id}',
  title: '${title}',
  description: 'Comprehensive coverage of ${title} ranging from fundamental principles to advanced real-world applications and system design.',
  family: '${track.family}',
  kind: 'domain',
  icon: '📚',
  tags: ['${track.bareId.split('-').join("', '")}'],
  languages: [],
  explainMode: '${explainMode}',
  code: { label: '${title} examples', id: '${codeMode}', fixed: true },
  supports: { practice: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    ${categories.join(',\n')}
  ]
})
`;
}

tracksData.forEach(track => {
  const fileContent = generateTrackContent(track);
  fs.writeFileSync(path.join('src/data/curriculum/library', `${track.bareId}.ts`), fileContent);
  console.log(`Generated ${track.bareId}.ts`);
});

const indexFile = path.join('src/data/curriculum/library', 'index.ts');
const allFiles = fs.readdirSync('src/data/curriculum/library').filter(f => f.endsWith('.ts') && f !== 'index.ts').map(f => f.replace('.ts', ''));

const linesToIndex = [];
const exportedTracks = [];
for (const f of allFiles) {
    const camel = f.replace(/-([a-z])/g, g => g[1].toUpperCase());
    linesToIndex.push(`import { ${camel} } from './${f}'`);
    exportedTracks.push(camel);
}

const listExport = `
${linesToIndex.join('\n')}

export const libraryTracks = [
  ${exportedTracks.join(',\n  ')}
];
`;

fs.writeFileSync(indexFile, listExport);
console.log('Updated index.ts');
