import fs from 'node:fs';
import { build } from 'esbuild';

const outdir = 'scratch/marketing-gen';
fs.mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: {
    curriculum: 'src/data/curriculum/index.ts',
    paths: 'src/data/careerPaths.ts',
  },
  outdir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  logLevel: 'silent',
});

const { allCurriculums } = await import(`../${outdir}/curriculum.js`);
const { careerPaths } = await import(`../${outdir}/paths.js`);

const tracks = allCurriculums.map((t) => {
  let topics = 0;
  let mins = 0;
  for (const l of t.levels || []) {
    for (const c of l.categories || []) {
      for (const m of c.modules || []) {
        for (const top of m.topics || []) {
          topics++;
          mins += top.estimatedMinutes || ((top.subtopics?.length || 1) * 15);
        }
      }
    }
  }
  return {
    id: t.id,
    title: t.title,
    family: t.family,
    icon: t.icon || '📘',
    topics,
    hours: Math.round(mins / 60),
    tags: (t.tags || []).slice(0, 5),
  };
});

const domains = [
  {
    id: 'all',
    name: 'All Disciplines',
    icon: '✨',
    description: 'Explore the full catalog of 157 engineering and computing tracks.',
  },
  {
    id: 'ai-genai',
    name: 'AI & GenAI',
    family: 'AI & Generative AI',
    icon: '🤖',
    description: 'From LLM architecture and RAG to AI agents, MLOps, and vector search.',
  },
  {
    id: 'backend',
    name: 'Backend & Systems',
    family: 'Backend Frameworks',
    icon: '⚙️',
    description: 'Production backend systems with Spring Boot, Node.js, FastAPI, Go, and gRPC.',
  },
  {
    id: 'frontend',
    name: 'Frontend & Web',
    family: 'Frontend & Web',
    icon: '🎨',
    description: 'Modern web development with React 19, Next.js, TypeScript, Vue, and a11y.',
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    family: 'Cloud, DevOps & Platform',
    icon: '☁️',
    description: 'Container orchestration, AWS, Kubernetes, Terraform IaC, and CI/CD pipelines.',
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    family: 'Mobile Development',
    icon: '📱',
    description: 'Native and cross-platform apps with Flutter, React Native, Swift, and Kotlin.',
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    family: 'Data',
    icon: '📊',
    description: 'End-to-end data systems with Spark, Kafka, Airflow, dbt, Pandas, and Power BI.',
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    family: 'Cybersecurity',
    icon: '🛡️',
    description: 'AppSec, cloud security, penetration testing, threat modeling, and zero trust.',
  },
  {
    id: 'interviews',
    name: 'SWE & Interviews',
    family: 'Interviews & CS',
    icon: '🧩',
    description: 'DSA, High-Level System Design (HLD), Low-Level Design (LLD), and CS core.',
  },
  {
    id: 'languages',
    name: 'Languages',
    family: 'Programming Languages',
    icon: '💻',
    description: 'In-depth language mastery in Java, Python, Go, C++, Rust, TypeScript, and SQL.',
  },
];

const popularTrackIds = new Set([
  'track-dsa',
  'track-hld',
  'track-lld',
  'track-llms',
  'track-rag',
  'track-ai-agents',
  'track-prompt-engineering',
  'track-react',
  'track-node',
  'track-spring-boot',
  'track-fastapi',
  'track-go-backend',
  'track-docker',
  'track-kubernetes',
  'track-aws',
  'track-flutter',
  'track-react-native',
  'track-android',
  'track-ios',
  'track-spark',
  'track-airflow',
  'track-pandas',
  'track-power-bi',
  'track-web-security',
  'track-security-foundations',
  'track-python',
  'track-java',
  'track-js',
  'track-cpp',
  'track-rust',
  'track-operating-systems',
  'track-computer-networks',
]);

const marketingTracks = tracks.map((t) => ({
  ...t,
  popular: popularTrackIds.has(t.id),
}));

const marketingPaths = careerPaths.map((p) => ({
  id: p.id,
  title: p.title,
  family: p.family,
  icon: p.icon,
  description: p.description,
  roles: p.roles || [],
  trackCount: p.tracks.length,
  languages: p.languages || [],
}));

const fileContent = `// Auto-generated marketing curriculum overview
export const MARKETING_STATS = {
  tracksCount: '150+',
  domainsCount: '12',
  careerPathsCount: '20',
  topicsCount: '7,000+',
  tasksCount: '34,000+',
  languagesCount: '15+',
}

export interface MarketingDomain {
  id: string
  name: string
  icon: string
  family?: string
  description: string
}

export interface MarketingTrack {
  id: string
  title: string
  family: string
  icon: string
  topics: number
  hours: number
  tags: string[]
  popular: boolean
}

export interface MarketingCareerPath {
  id: string
  title: string
  family: string
  icon: string
  description: string
  roles: string[]
  trackCount: number
  languages: string[]
}

export const MARKETING_DOMAINS: MarketingDomain[] = ${JSON.stringify(domains, null, 2)}

export const MARKETING_TRACKS: MarketingTrack[] = ${JSON.stringify(marketingTracks, null, 2)}

export const MARKETING_CAREER_PATHS: MarketingCareerPath[] = ${JSON.stringify(marketingPaths, null, 2)}
`;

fs.writeFileSync('src/data/marketingCurriculum.ts', fileContent, 'utf-8');
console.log('Successfully generated src/data/marketingCurriculum.ts');
