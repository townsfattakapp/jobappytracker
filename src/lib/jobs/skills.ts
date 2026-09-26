/**
 * Deterministic skill lexicon. Each entry is a canonical skill name with the
 * spellings that count as the same skill in job text. Used by ingestion to
 * extract skills from titles/descriptions and by matching to compare a
 * learner's skills with a listing. No model calls; pure string matching.
 */

export interface SkillDef {
  name: string
  aliases: string[]
  /** Curriculum track ids that teach this skill (optional, improves gap analysis). */
  trackIds?: string[]
}

export const SKILLS: SkillDef[] = [
  { name: 'Java', aliases: ['java', 'core java', 'java 8', 'java 11', 'java 17', 'java 21'], trackIds: ['track-java'] },
  { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring framework', 'spring'], trackIds: ['track-spring-boot'] },
  { name: 'Spring Security', aliases: ['spring security'], trackIds: ['track-spring-security'] },
  { name: 'Hibernate / JPA', aliases: ['hibernate', 'jpa', 'spring data jpa'], trackIds: ['track-spring-data-jpa'] },
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'ecmascript'], trackIds: ['track-js'] },
  { name: 'TypeScript', aliases: ['typescript', 'ts'], trackIds: ['track-js'] },
  { name: 'React', aliases: ['react', 'react.js', 'reactjs'], trackIds: ['track-react'] },
  { name: 'Next.js', aliases: ['next.js', 'nextjs', 'next js'], trackIds: ['track-react'] },
  { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node js', 'node'], trackIds: ['track-node'] },
  { name: 'Express', aliases: ['express', 'express.js', 'expressjs'], trackIds: ['track-node'] },
  { name: 'NestJS', aliases: ['nestjs', 'nest.js'], trackIds: ['track-nestjs'] },
  { name: 'Angular', aliases: ['angular', 'angularjs'], trackIds: ['track-angular'] },
  { name: 'Vue', aliases: ['vue', 'vue.js', 'vuejs', 'nuxt'], trackIds: ['track-vue'] },
  { name: 'HTML', aliases: ['html', 'html5'], trackIds: ['track-html'] },
  { name: 'CSS', aliases: ['css', 'css3', 'tailwind', 'sass', 'scss'], trackIds: ['track-css'] },
  { name: 'Python', aliases: ['python', 'python3'], trackIds: ['track-python'] },
  { name: 'Django', aliases: ['django'], trackIds: ['track-django'] },
  { name: 'FastAPI', aliases: ['fastapi'], trackIds: ['track-fastapi'] },
  { name: 'Flask', aliases: ['flask'], trackIds: ['track-flask'] },
  { name: 'Go', aliases: ['golang', 'go lang'], trackIds: ['track-go'] },
  { name: 'Rust', aliases: ['rust'], trackIds: ['track-rust'] },
  { name: 'C++', aliases: ['c++', 'cpp'], trackIds: ['track-cpp'] },
  { name: 'C#', aliases: ['c#', '.net', 'dotnet', 'asp.net'], trackIds: ['track-csharp', 'track-aspnet-core'] },
  { name: 'Kotlin', aliases: ['kotlin'], trackIds: ['track-kotlin', 'track-android'] },
  { name: 'Swift', aliases: ['swift', 'swiftui'], trackIds: ['track-swift', 'track-ios'] },
  { name: 'Android', aliases: ['android'], trackIds: ['track-android'] },
  { name: 'iOS', aliases: ['ios'], trackIds: ['track-ios'] },
  { name: 'Flutter', aliases: ['flutter', 'dart'], trackIds: ['track-flutter', 'track-dart'] },
  { name: 'React Native', aliases: ['react native', 'react-native'], trackIds: ['track-react-native'] },
  { name: 'SQL', aliases: ['sql', 'postgresql', 'postgres', 'mysql', 't-sql', 'pl/sql'], trackIds: ['track-sql'] },
  { name: 'NoSQL', aliases: ['mongodb', 'mongo', 'dynamodb', 'cassandra', 'nosql'], trackIds: ['track-dbms'] },
  { name: 'Redis', aliases: ['redis', 'memcached'], trackIds: ['track-hld'] },
  { name: 'Kafka', aliases: ['kafka', 'apache kafka'], trackIds: ['track-kafka'] },
  { name: 'RabbitMQ', aliases: ['rabbitmq', 'message queue', 'sqs'], trackIds: ['track-hld'] },
  { name: 'REST APIs', aliases: ['rest', 'rest api', 'restful', 'rest apis', 'http apis'], trackIds: ['track-rest-api'] },
  { name: 'GraphQL', aliases: ['graphql'], trackIds: ['track-graphql'] },
  { name: 'gRPC', aliases: ['grpc', 'protobuf'], trackIds: ['track-grpc'] },
  { name: 'Microservices', aliases: ['microservices', 'micro-services', 'service oriented'], trackIds: ['track-microservices'] },
  { name: 'System Design', aliases: ['system design', 'distributed systems', 'scalable systems', 'high availability'], trackIds: ['track-hld', 'track-distributed-systems'] },
  { name: 'Data Structures & Algorithms', aliases: ['data structures', 'algorithms', 'dsa', 'problem solving'], trackIds: ['track-dsa'] },
  { name: 'Docker', aliases: ['docker', 'containers', 'containerization'], trackIds: ['track-docker'] },
  { name: 'Kubernetes', aliases: ['kubernetes', 'k8s', 'eks', 'gke', 'aks'], trackIds: ['track-kubernetes'] },
  { name: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'], trackIds: ['track-aws'] },
  { name: 'Azure', aliases: ['azure', 'microsoft azure'], trackIds: ['track-azure'] },
  { name: 'GCP', aliases: ['gcp', 'google cloud'], trackIds: ['track-gcp'] },
  { name: 'Terraform', aliases: ['terraform', 'infrastructure as code', 'iac', 'pulumi'], trackIds: ['track-terraform'] },
  { name: 'CI/CD', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery', 'jenkins', 'github actions', 'gitlab ci'], trackIds: ['track-cicd'] },
  { name: 'Linux', aliases: ['linux', 'unix', 'bash', 'shell scripting'], trackIds: ['track-linux', 'track-bash'] },
  { name: 'Observability', aliases: ['observability', 'prometheus', 'grafana', 'datadog', 'monitoring'], trackIds: ['track-observability'] },
  { name: 'SRE', aliases: ['sre', 'site reliability', 'incident response', 'on-call'], trackIds: ['track-sre'] },
  { name: 'Git', aliases: ['git', 'version control'], trackIds: ['track-software-engineering'] },
  { name: 'Testing', aliases: ['unit testing', 'jest', 'junit', 'pytest', 'cypress', 'playwright', 'test automation', 'tdd'], trackIds: ['track-software-testing'] },
  { name: 'Pandas', aliases: ['pandas'], trackIds: ['track-pandas'] },
  { name: 'NumPy', aliases: ['numpy'], trackIds: ['track-numpy'] },
  { name: 'Machine Learning', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn'], trackIds: ['track-machine-learning'] },
  { name: 'Deep Learning', aliases: ['deep learning', 'pytorch', 'tensorflow', 'keras', 'neural networks'], trackIds: ['track-deep-learning'] },
  { name: 'NLP', aliases: ['nlp', 'natural language processing'], trackIds: ['track-nlp'] },
  { name: 'Computer Vision', aliases: ['computer vision', 'opencv'], trackIds: ['track-computer-vision'] },
  { name: 'LLMs', aliases: ['llm', 'llms', 'large language models', 'generative ai', 'genai', 'openai', 'langchain'], trackIds: ['track-llms', 'track-llm-apps'] },
  { name: 'RAG', aliases: ['rag', 'retrieval augmented', 'vector database', 'embeddings'], trackIds: ['track-rag', 'track-embeddings'] },
  { name: 'MLOps', aliases: ['mlops', 'model deployment', 'model serving', 'mlflow'], trackIds: ['track-mlops', 'track-model-serving'] },
  { name: 'Statistics', aliases: ['statistics', 'statistical analysis', 'probability', 'hypothesis testing', 'a/b testing'], trackIds: ['track-probability-statistics', 'track-statistics-analysts'] },
  { name: 'Data Visualization', aliases: ['data visualization', 'data visualisation', 'matplotlib', 'seaborn', 'plotly'], trackIds: ['track-data-visualization'] },
  { name: 'Power BI', aliases: ['power bi', 'powerbi'], trackIds: ['track-power-bi'] },
  { name: 'Tableau', aliases: ['tableau', 'looker'], trackIds: ['track-tableau'] },
  { name: 'Excel', aliases: ['excel', 'google sheets', 'spreadsheets'], trackIds: ['track-excel'] },
  { name: 'Spark', aliases: ['spark', 'pyspark', 'apache spark', 'databricks'], trackIds: ['track-spark'] },
  { name: 'Airflow', aliases: ['airflow', 'apache airflow'], trackIds: ['track-airflow'] },
  { name: 'dbt', aliases: ['dbt'], trackIds: ['track-dbt'] },
  { name: 'ETL', aliases: ['etl', 'elt', 'data pipelines', 'data pipeline'], trackIds: ['track-etl-elt', 'track-data-pipelines'] },
  { name: 'Data Warehousing', aliases: ['data warehouse', 'data warehousing', 'snowflake', 'bigquery', 'redshift'], trackIds: ['track-data-warehousing', 'track-cloud-data-platforms'] },
  { name: 'Data Modeling', aliases: ['data modeling', 'data modelling', 'dimensional modeling'], trackIds: ['track-data-modeling'] },
  { name: 'Application Security', aliases: ['application security', 'appsec', 'owasp', 'secure coding', 'penetration testing', 'pentest'], trackIds: ['track-web-security', 'track-secure-coding'] },
  { name: 'Network Security', aliases: ['network security', 'firewalls', 'siem', 'soc'], trackIds: ['track-security-monitoring', 'track-networking'] },
  { name: 'Cryptography', aliases: ['cryptography', 'encryption', 'pki'], trackIds: ['track-cryptography'] },
  { name: 'IAM', aliases: ['iam', 'identity and access', 'oauth', 'oidc', 'sso'], trackIds: ['track-iam'] },
  { name: 'Cloud Security', aliases: ['cloud security'], trackIds: ['track-cloud-security'] },
  { name: 'Threat Modeling', aliases: ['threat modeling', 'threat modelling', 'vulnerability assessment'], trackIds: ['track-threat-modeling', 'track-vulnerability-assessment'] },
  { name: 'Operating Systems', aliases: ['operating systems', 'os internals'], trackIds: ['track-operating-systems'] },
  { name: 'Computer Networks', aliases: ['computer networks', 'tcp/ip', 'networking'], trackIds: ['track-computer-networks'] },
  { name: 'DBMS', aliases: ['dbms', 'database design', 'database management'], trackIds: ['track-dbms'] },
  { name: 'Object-Oriented Design', aliases: ['oop', 'object oriented', 'object-oriented', 'design patterns', 'low level design', 'lld'], trackIds: ['track-lld'] },
  { name: 'Scala', aliases: ['scala'], trackIds: ['track-scala'] },
  { name: 'Ruby on Rails', aliases: ['ruby', 'rails', 'ruby on rails'], trackIds: ['track-ruby', 'track-rails'] },
  { name: 'PHP', aliases: ['php', 'laravel'], trackIds: ['track-php', 'track-laravel'] },
  { name: 'R', aliases: ['r programming', 'r language'], trackIds: ['track-r'] },
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Alias → canonical, longest aliases first so "spring boot" beats "spring". */
const ALIAS_INDEX: { alias: string; re: RegExp; def: SkillDef }[] = SKILLS.flatMap((def) =>
  [def.name, ...def.aliases].map((alias) => {
    const a = alias.toLowerCase()
    // Word boundaries fail around symbols like "c++" or ".net"; use lookarounds on non-word-ish chars instead.
    // "js" must not match inside "node.js"; "c++" must still match before a full stop.
    const re = new RegExp(`(?<![a-z0-9+#])(?<![a-z0-9]\\.)${escape(a)}(?![a-z0-9+#])(?!\\.[a-z0-9])`, 'i')
    return { alias: a, re, def }
  }),
).sort((x, y) => y.alias.length - x.alias.length)

/** Canonical skill names mentioned in the text, in first-occurrence order, without duplicates. */
export function extractSkills(text: string, limit = 25): string[] {
  const found = new Map<string, number>()
  for (const { re, def } of ALIAS_INDEX) {
    if (found.has(def.name)) continue
    const m = re.exec(text)
    if (m) found.set(def.name, m.index)
  }
  return Array.from(found.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([name]) => name)
}

/** Canonical form of a free-text skill (learner input or admin tag); returns the input trimmed when unknown. */
export function canonicalSkill(input: string): string {
  const s = input.trim()
  if (!s) return s
  const lower = s.toLowerCase()
  for (const def of SKILLS) if (def.name.toLowerCase() === lower || def.aliases.includes(lower)) return def.name
  return s
}

export function skillDef(name: string): SkillDef | undefined {
  const lower = name.trim().toLowerCase()
  return SKILLS.find((def) => def.name.toLowerCase() === lower || def.aliases.includes(lower))
}

/** True when two skill strings name the same canonical skill (or one contains the other for unknown skills). */
export function sameSkill(a: string, b: string): boolean {
  const ca = canonicalSkill(a).toLowerCase()
  const cb = canonicalSkill(b).toLowerCase()
  if (!ca || !cb) return false
  if (ca === cb) return true
  const known = Boolean(skillDef(a)) || Boolean(skillDef(b))
  if (known) return false
  return ca.length > 3 && cb.length > 3 && (ca.includes(cb) || cb.includes(ca))
}
