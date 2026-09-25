// Auto-generated marketing curriculum overview
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

export const MARKETING_DOMAINS: MarketingDomain[] = [
  {
    "id": "all",
    "name": "All Disciplines",
    "icon": "✨",
    "description": "Explore the full catalog of 157 engineering and computing tracks."
  },
  {
    "id": "ai-genai",
    "name": "AI & GenAI",
    "family": "AI & Generative AI",
    "icon": "🤖",
    "description": "From LLM architecture and RAG to AI agents, MLOps, and vector search."
  },
  {
    "id": "backend",
    "name": "Backend & Systems",
    "family": "Backend Frameworks",
    "icon": "⚙️",
    "description": "Production backend systems with Spring Boot, Node.js, FastAPI, Go, and gRPC."
  },
  {
    "id": "frontend",
    "name": "Frontend & Web",
    "family": "Frontend & Web",
    "icon": "🎨",
    "description": "Modern web development with React 19, Next.js, TypeScript, Vue, and a11y."
  },
  {
    "id": "cloud-devops",
    "name": "Cloud & DevOps",
    "family": "Cloud, DevOps & Platform",
    "icon": "☁️",
    "description": "Container orchestration, AWS, Kubernetes, Terraform IaC, and CI/CD pipelines."
  },
  {
    "id": "mobile",
    "name": "Mobile Development",
    "family": "Mobile Development",
    "icon": "📱",
    "description": "Native and cross-platform apps with Flutter, React Native, Swift, and Kotlin."
  },
  {
    "id": "data",
    "name": "Data & Analytics",
    "family": "Data",
    "icon": "📊",
    "description": "End-to-end data systems with Spark, Kafka, Airflow, dbt, Pandas, and Power BI."
  },
  {
    "id": "security",
    "name": "Cybersecurity",
    "family": "Cybersecurity",
    "icon": "🛡️",
    "description": "AppSec, cloud security, penetration testing, threat modeling, and zero trust."
  },
  {
    "id": "interviews",
    "name": "SWE & Interviews",
    "family": "Interviews & CS",
    "icon": "🧩",
    "description": "DSA, High-Level System Design (HLD), Low-Level Design (LLD), and CS core."
  },
  {
    "id": "languages",
    "name": "Languages",
    "family": "Programming Languages",
    "icon": "💻",
    "description": "In-depth language mastery in Java, Python, Go, C++, Rust, TypeScript, and SQL."
  }
]

export const MARKETING_TRACKS: MarketingTrack[] = [
  {
    "id": "track-dsa",
    "title": "DSA and Competitive Programming",
    "family": "Software Engineering Interviews",
    "icon": "🧩",
    "topics": 172,
    "hours": 128,
    "tags": [
      "dsa",
      "algorithms",
      "data structures",
      "leetcode",
      "competitive programming"
    ],
    "popular": true
  },
  {
    "id": "track-java",
    "title": "Core Java, OOP and Collections",
    "family": "Programming Languages",
    "icon": "☕",
    "topics": 74,
    "hours": 54,
    "tags": [
      "java",
      "oop",
      "collections",
      "jvm",
      "concurrency"
    ],
    "popular": true
  },
  {
    "id": "track-js",
    "title": "JavaScript and TypeScript",
    "family": "Programming Languages",
    "icon": "🟨",
    "topics": 59,
    "hours": 43,
    "tags": [
      "javascript",
      "typescript",
      "es6",
      "async",
      "types"
    ],
    "popular": true
  },
  {
    "id": "track-react",
    "title": "React and Next.js",
    "family": "Frontend & Web",
    "icon": "⚛️",
    "topics": 63,
    "hours": 46,
    "tags": [
      "react",
      "next.js",
      "hooks",
      "frontend",
      "ssr"
    ],
    "popular": true
  },
  {
    "id": "track-node",
    "title": "Node.js and Backend Development",
    "family": "Backend Frameworks",
    "icon": "🟩",
    "topics": 63,
    "hours": 46,
    "tags": [
      "node.js",
      "express",
      "backend",
      "api",
      "rest"
    ],
    "popular": true
  },
  {
    "id": "track-sql",
    "title": "SQL, PostgreSQL and MySQL",
    "family": "Programming Languages",
    "icon": "🗄️",
    "topics": 56,
    "hours": 41,
    "tags": [
      "sql",
      "postgresql",
      "mysql",
      "database",
      "queries"
    ],
    "popular": false
  },
  {
    "id": "track-hld",
    "title": "High-Level System Design (HLD)",
    "family": "Software Engineering Interviews",
    "icon": "🏗️",
    "topics": 53,
    "hours": 38,
    "tags": [
      "system design",
      "hld",
      "architecture",
      "scalability",
      "distributed"
    ],
    "popular": true
  },
  {
    "id": "track-lld",
    "title": "Low-Level System Design (LLD)",
    "family": "Software Engineering Interviews",
    "icon": "📐",
    "topics": 50,
    "hours": 36,
    "tags": [
      "lld",
      "object-oriented design",
      "design patterns",
      "uml"
    ],
    "popular": true
  },
  {
    "id": "track-cs",
    "title": "CS Fundamentals",
    "family": "Computer Science",
    "icon": "🧠",
    "topics": 51,
    "hours": 37,
    "tags": [
      "operating systems",
      "networking",
      "dbms",
      "cs fundamentals"
    ],
    "popular": false
  },
  {
    "id": "track-devops",
    "title": "DevOps, CI/CD, Docker and Security",
    "family": "Cloud, DevOps & Platform",
    "icon": "🚀",
    "topics": 50,
    "hours": 36,
    "tags": [
      "devops",
      "ci/cd",
      "docker",
      "kubernetes",
      "security"
    ],
    "popular": false
  },
  {
    "id": "track-advanced-sql",
    "title": "Advanced SQL",
    "family": "Data Engineering",
    "icon": "🧮",
    "topics": 49,
    "hours": 52,
    "tags": [
      "sql",
      "postgresql",
      "window functions",
      "cte",
      "query planning"
    ],
    "popular": false
  },
  {
    "id": "track-ai-agents",
    "title": "AI Agents and Agentic Workflows",
    "family": "AI & Generative AI",
    "icon": "🤖",
    "topics": 47,
    "hours": 48,
    "tags": [
      "agents",
      "tool use",
      "langgraph",
      "mcp",
      "orchestration"
    ],
    "popular": true
  },
  {
    "id": "track-ai-foundations",
    "title": "AI Engineering Foundations",
    "family": "AI & Generative AI",
    "icon": "🧠",
    "topics": 48,
    "hours": 49,
    "tags": [
      "ai",
      "machine learning",
      "ai engineering",
      "evaluation",
      "mlops"
    ],
    "popular": false
  },
  {
    "id": "track-ai-infra",
    "title": "AI Infrastructure and Deployment",
    "family": "AI & Generative AI",
    "icon": "🏗️",
    "topics": 49,
    "hours": 49,
    "tags": [
      "ai infrastructure",
      "gpu",
      "cuda",
      "kubernetes",
      "kserve"
    ],
    "popular": false
  },
  {
    "id": "track-ai-projects",
    "title": "AI Engineering Projects",
    "family": "AI & Generative AI",
    "icon": "🧪",
    "topics": 28,
    "hours": 35,
    "tags": [
      "ai projects",
      "portfolio",
      "rag",
      "agents",
      "chatbot"
    ],
    "popular": false
  },
  {
    "id": "track-ai-safety",
    "title": "AI Safety, Security and Privacy",
    "family": "AI & Generative AI",
    "icon": "🛡️",
    "topics": 49,
    "hours": 50,
    "tags": [
      "ai safety",
      "llm security",
      "prompt injection",
      "privacy",
      "red teaming"
    ],
    "popular": false
  },
  {
    "id": "track-airflow",
    "title": "Apache Airflow",
    "family": "Data Engineering",
    "icon": "🌬️",
    "topics": 47,
    "hours": 47,
    "tags": [
      "airflow",
      "orchestration",
      "dags",
      "scheduling",
      "data-pipelines"
    ],
    "popular": true
  },
  {
    "id": "track-algorithms",
    "title": "Algorithms",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "algorithms"
    ],
    "popular": false
  },
  {
    "id": "track-analytics-projects",
    "title": "Analytics Projects",
    "family": "Data Analytics & BI",
    "icon": "🗂️",
    "topics": 31,
    "hours": 32,
    "tags": [
      "portfolio",
      "projects",
      "power bi",
      "tableau",
      "excel"
    ],
    "popular": false
  },
  {
    "id": "track-android",
    "title": "Android Development",
    "family": "Mobile Development",
    "icon": "🤖",
    "topics": 57,
    "hours": 69,
    "tags": [
      "android",
      "kotlin",
      "jetpack-compose",
      "mobile",
      "room"
    ],
    "popular": true
  },
  {
    "id": "track-angular",
    "title": "Angular",
    "family": "Frontend & Web",
    "icon": "🅰️",
    "topics": 50,
    "hours": 53,
    "tags": [
      "angular",
      "typescript",
      "signals",
      "rxjs",
      "ngrx"
    ],
    "popular": false
  },
  {
    "id": "track-app-store-deployment",
    "title": "App Store and Play Store Deployment",
    "family": "Mobile Development",
    "icon": "🚀",
    "topics": 38,
    "hours": 40,
    "tags": [
      "mobile",
      "app store",
      "play store",
      "fastlane",
      "testflight"
    ],
    "popular": false
  },
  {
    "id": "track-aspnet-core",
    "title": "ASP.NET Core",
    "family": "Backend Frameworks",
    "icon": "🟣",
    "topics": 50,
    "hours": 57,
    "tags": [
      "aspnet",
      "dotnet",
      "csharp",
      "backend",
      "ef-core"
    ],
    "popular": false
  },
  {
    "id": "track-aws",
    "title": "AWS",
    "family": "Cloud, DevOps & Platform",
    "icon": "☁️",
    "topics": 54,
    "hours": 68,
    "tags": [
      "aws",
      "cloud",
      "ec2",
      "s3",
      "lambda"
    ],
    "popular": true
  },
  {
    "id": "track-azure",
    "title": "Azure",
    "family": "Cloud, DevOps & Platform",
    "icon": "🔷",
    "topics": 53,
    "hours": 66,
    "tags": [
      "azure",
      "cloud",
      "entra-id",
      "app-service",
      "aks"
    ],
    "popular": false
  },
  {
    "id": "track-bash",
    "title": "Bash and Shell Scripting",
    "family": "Programming Languages",
    "icon": "🐚",
    "topics": 53,
    "hours": 59,
    "tags": [
      "bash",
      "shell",
      "linux",
      "automation",
      "devops"
    ],
    "popular": false
  },
  {
    "id": "track-batch-stream",
    "title": "Batch and Stream Processing",
    "family": "Data Engineering",
    "icon": "🌊",
    "topics": 42,
    "hours": 42,
    "tags": [
      "streaming",
      "batch",
      "flink",
      "spark",
      "kafka-streams"
    ],
    "popular": false
  },
  {
    "id": "track-business-metrics",
    "title": "Business Metrics and KPIs",
    "family": "Data Analytics & BI",
    "icon": "📈",
    "topics": 44,
    "hours": 44,
    "tags": [
      "kpi",
      "metrics",
      "business analytics",
      "unit economics",
      "retention"
    ],
    "popular": false
  },
  {
    "id": "track-c",
    "title": "C Programming",
    "family": "Programming Languages",
    "icon": "🔧",
    "topics": 68,
    "hours": 85,
    "tags": [
      "c",
      "systems programming",
      "pointers",
      "memory management",
      "posix"
    ],
    "popular": false
  },
  {
    "id": "track-cicd",
    "title": "CI/CD",
    "family": "Cloud, DevOps & Platform",
    "icon": "🔁",
    "topics": 46,
    "hours": 55,
    "tags": [
      "ci/cd",
      "github actions",
      "gitlab ci",
      "jenkins",
      "gitops"
    ],
    "popular": false
  },
  {
    "id": "track-cloud-data-platforms",
    "title": "Cloud Data Platforms",
    "family": "Data Engineering",
    "icon": "☁️",
    "topics": 45,
    "hours": 45,
    "tags": [
      "cloud",
      "aws",
      "gcp",
      "azure",
      "snowflake"
    ],
    "popular": false
  },
  {
    "id": "track-cloud-security",
    "title": "Cloud Security",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "cloud",
      "security"
    ],
    "popular": false
  },
  {
    "id": "track-compiler-design",
    "title": "Compiler Design",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "compiler",
      "design"
    ],
    "popular": false
  },
  {
    "id": "track-computer-networks",
    "title": "Computer Networks",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "computer",
      "networks"
    ],
    "popular": true
  },
  {
    "id": "track-computer-organization",
    "title": "Computer Organization",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "computer",
      "organization"
    ],
    "popular": false
  },
  {
    "id": "track-computer-security",
    "title": "Computer Security",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "computer",
      "security"
    ],
    "popular": false
  },
  {
    "id": "track-computer-vision",
    "title": "Computer Vision",
    "family": "AI & Generative AI",
    "icon": "👁️",
    "topics": 54,
    "hours": 55,
    "tags": [
      "computer-vision",
      "cnn",
      "object-detection",
      "segmentation",
      "yolo"
    ],
    "popular": false
  },
  {
    "id": "track-cpp",
    "title": "C++",
    "family": "Programming Languages",
    "icon": "⚙️",
    "topics": 70,
    "hours": 87,
    "tags": [
      "c++",
      "cpp",
      "systems programming",
      "stl",
      "templates"
    ],
    "popular": true
  },
  {
    "id": "track-cryptography",
    "title": "Cryptography",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "cryptography"
    ],
    "popular": false
  },
  {
    "id": "track-csharp",
    "title": "C#",
    "family": "Programming Languages",
    "icon": "🎯",
    "topics": 63,
    "hours": 73,
    "tags": [
      "csharp",
      "dotnet",
      "linq",
      "async",
      "oop"
    ],
    "popular": false
  },
  {
    "id": "track-css",
    "title": "CSS",
    "family": "Frontend & Web",
    "icon": "🎨",
    "topics": 57,
    "hours": 58,
    "tags": [
      "css",
      "layout",
      "flexbox",
      "grid",
      "animation"
    ],
    "popular": false
  },
  {
    "id": "track-dart",
    "title": "Dart",
    "family": "Programming Languages",
    "icon": "🎯",
    "topics": 65,
    "hours": 75,
    "tags": [
      "dart",
      "flutter",
      "mobile",
      "async",
      "streams"
    ],
    "popular": false
  },
  {
    "id": "track-dashboard-design",
    "title": "Dashboard Design",
    "family": "Data Analytics & BI",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "dashboard",
      "design"
    ],
    "popular": false
  },
  {
    "id": "track-data-cleaning",
    "title": "Data Cleaning",
    "family": "Data Science",
    "icon": "🧹",
    "topics": 43,
    "hours": 43,
    "tags": [
      "data cleaning",
      "data quality",
      "missing data",
      "validation",
      "pandas"
    ],
    "popular": false
  },
  {
    "id": "track-data-engineering-projects",
    "title": "Data Engineering Projects",
    "family": "Data Engineering",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "data",
      "engineering",
      "projects"
    ],
    "popular": false
  },
  {
    "id": "track-data-modeling",
    "title": "Data Modeling",
    "family": "Data Engineering",
    "icon": "📐",
    "topics": 43,
    "hours": 43,
    "tags": [
      "data modeling",
      "erd",
      "normalization",
      "dimensional modeling",
      "star schema"
    ],
    "popular": false
  },
  {
    "id": "track-data-pipelines",
    "title": "Data Pipelines",
    "family": "Data Engineering",
    "icon": "🛠️",
    "topics": 41,
    "hours": 41,
    "tags": [
      "data pipelines",
      "orchestration",
      "airflow",
      "dagster",
      "prefect"
    ],
    "popular": false
  },
  {
    "id": "track-data-quality",
    "title": "Data Quality and Governance",
    "family": "Data Engineering",
    "icon": "🛡️",
    "topics": 41,
    "hours": 41,
    "tags": [
      "data-quality",
      "governance",
      "great-expectations",
      "soda",
      "pandera"
    ],
    "popular": false
  },
  {
    "id": "track-data-science-projects",
    "title": "Data Science Projects",
    "family": "Data Science",
    "icon": "🧰",
    "topics": 32,
    "hours": 34,
    "tags": [
      "projects",
      "portfolio",
      "end-to-end",
      "pandas",
      "scikit-learn"
    ],
    "popular": false
  },
  {
    "id": "track-data-visualization",
    "title": "Data Visualization",
    "family": "Data Science",
    "icon": "📊",
    "topics": 52,
    "hours": 61,
    "tags": [
      "data visualization",
      "matplotlib",
      "seaborn",
      "plotly",
      "charts"
    ],
    "popular": false
  },
  {
    "id": "track-data-warehousing",
    "title": "Data Warehousing",
    "family": "Data Engineering",
    "icon": "🏛️",
    "topics": 41,
    "hours": 42,
    "tags": [
      "data warehouse",
      "olap",
      "kimball",
      "snowflake",
      "bigquery"
    ],
    "popular": false
  },
  {
    "id": "track-dbms",
    "title": "Dbms",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "dbms"
    ],
    "popular": false
  },
  {
    "id": "track-dbt",
    "title": "dbt",
    "family": "Data Engineering",
    "icon": "🧱",
    "topics": 43,
    "hours": 43,
    "tags": [
      "dbt",
      "sql",
      "analytics-engineering",
      "transformation",
      "warehouse"
    ],
    "popular": false
  },
  {
    "id": "track-deep-learning",
    "title": "Deep Learning",
    "family": "AI & Generative AI",
    "icon": "🧬",
    "topics": 56,
    "hours": 56,
    "tags": [
      "deep learning",
      "pytorch",
      "neural networks",
      "cnn",
      "transformers"
    ],
    "popular": false
  },
  {
    "id": "track-defensive-security",
    "title": "Defensive Security",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "defensive",
      "security"
    ],
    "popular": false
  },
  {
    "id": "track-digital-logic",
    "title": "Digital Logic",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "digital",
      "logic"
    ],
    "popular": false
  },
  {
    "id": "track-discrete-math",
    "title": "Discrete Mathematics",
    "family": "Computer Science",
    "icon": "🔢",
    "topics": 55,
    "hours": 63,
    "tags": [
      "discrete mathematics",
      "logic",
      "proofs",
      "combinatorics",
      "graph theory"
    ],
    "popular": false
  },
  {
    "id": "track-distributed-systems",
    "title": "Distributed Systems",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "distributed",
      "systems"
    ],
    "popular": false
  },
  {
    "id": "track-django",
    "title": "Django",
    "family": "Backend Frameworks",
    "icon": "🎸",
    "topics": 59,
    "hours": 60,
    "tags": [
      "django",
      "python",
      "backend",
      "orm",
      "drf"
    ],
    "popular": false
  },
  {
    "id": "track-docker",
    "title": "Docker",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "docker"
    ],
    "popular": true
  },
  {
    "id": "track-eda",
    "title": "Exploratory Data Analysis",
    "family": "Data Science",
    "icon": "🔍",
    "topics": 42,
    "hours": 42,
    "tags": [
      "eda",
      "exploratory analysis",
      "pandas",
      "seaborn",
      "notebooks"
    ],
    "popular": false
  },
  {
    "id": "track-embeddings",
    "title": "Embeddings and Vector Search",
    "family": "AI & Generative AI",
    "icon": "🧭",
    "topics": 48,
    "hours": 50,
    "tags": [
      "embeddings",
      "vector search",
      "faiss",
      "pgvector",
      "qdrant"
    ],
    "popular": false
  },
  {
    "id": "track-etl-elt",
    "title": "ETL and ELT",
    "family": "Data Engineering",
    "icon": "🔁",
    "topics": 41,
    "hours": 41,
    "tags": [
      "etl",
      "elt",
      "cdc",
      "incremental loads",
      "idempotency"
    ],
    "popular": false
  },
  {
    "id": "track-excel",
    "title": "Excel and Spreadsheet Analytics",
    "family": "Data Analytics & BI",
    "icon": "📊",
    "topics": 56,
    "hours": 64,
    "tags": [
      "excel",
      "spreadsheets",
      "pivot tables",
      "power query",
      "xlookup"
    ],
    "popular": false
  },
  {
    "id": "track-experimentation",
    "title": "Experimentation and A/B Testing",
    "family": "Data Science",
    "icon": "🧪",
    "topics": 50,
    "hours": 50,
    "tags": [
      "a/b testing",
      "experimentation",
      "causal inference",
      "statistics",
      "hypothesis testing"
    ],
    "popular": false
  },
  {
    "id": "track-fastapi",
    "title": "FastAPI",
    "family": "Backend Frameworks",
    "icon": "⚡",
    "topics": 49,
    "hours": 51,
    "tags": [
      "fastapi",
      "python",
      "backend",
      "async",
      "pydantic"
    ],
    "popular": true
  },
  {
    "id": "track-feature-engineering",
    "title": "Feature Engineering",
    "family": "Data Science",
    "icon": "🧱",
    "topics": 47,
    "hours": 47,
    "tags": [
      "feature engineering",
      "scikit-learn",
      "pandas",
      "encoding",
      "pipelines"
    ],
    "popular": false
  },
  {
    "id": "track-financial-analytics",
    "title": "Financial Analytics Fundamentals",
    "family": "Data Analytics & BI",
    "icon": "💹",
    "topics": 40,
    "hours": 40,
    "tags": [
      "financial analysis",
      "fp&a",
      "forecasting",
      "variance analysis",
      "saas metrics"
    ],
    "popular": false
  },
  {
    "id": "track-flask",
    "title": "Flask",
    "family": "Backend Frameworks",
    "icon": "🧪",
    "topics": 49,
    "hours": 50,
    "tags": [
      "flask",
      "python",
      "backend",
      "jinja",
      "sqlalchemy"
    ],
    "popular": false
  },
  {
    "id": "track-flutter",
    "title": "Flutter",
    "family": "Mobile Development",
    "icon": "🐦",
    "topics": 60,
    "hours": 68,
    "tags": [
      "flutter",
      "dart",
      "mobile",
      "android",
      "ios"
    ],
    "popular": true
  },
  {
    "id": "track-frontend-architecture",
    "title": "Frontend Architecture",
    "family": "Frontend & Web",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "frontend",
      "architecture"
    ],
    "popular": false
  },
  {
    "id": "track-frontend-testing",
    "title": "Frontend Testing",
    "family": "Frontend & Web",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "frontend",
      "testing"
    ],
    "popular": false
  },
  {
    "id": "track-gcp",
    "title": "Gcp",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "gcp"
    ],
    "popular": false
  },
  {
    "id": "track-generative-ai",
    "title": "Generative AI",
    "family": "AI & Generative AI",
    "icon": "🎨",
    "topics": 53,
    "hours": 54,
    "tags": [
      "generative-ai",
      "diffusion",
      "gan",
      "vae",
      "stable-diffusion"
    ],
    "popular": false
  },
  {
    "id": "track-go-backend",
    "title": "Go Backend Development",
    "family": "Backend Frameworks",
    "icon": "🐹",
    "topics": 49,
    "hours": 58,
    "tags": [
      "go",
      "golang",
      "net/http",
      "chi",
      "gin"
    ],
    "popular": true
  },
  {
    "id": "track-go",
    "title": "Go",
    "family": "Programming Languages",
    "icon": "🐹",
    "topics": 67,
    "hours": 77,
    "tags": [
      "go",
      "golang",
      "backend",
      "concurrency",
      "cloud-native"
    ],
    "popular": false
  },
  {
    "id": "track-graphql",
    "title": "GraphQL",
    "family": "Backend Frameworks",
    "icon": "◈",
    "topics": 49,
    "hours": 55,
    "tags": [
      "graphql",
      "typescript",
      "apollo",
      "dataloader",
      "federation"
    ],
    "popular": false
  },
  {
    "id": "track-grpc",
    "title": "gRPC",
    "family": "Backend Frameworks",
    "icon": "📡",
    "topics": 46,
    "hours": 55,
    "tags": [
      "grpc",
      "protobuf",
      "go",
      "http2",
      "streaming"
    ],
    "popular": false
  },
  {
    "id": "track-html",
    "title": "HTML",
    "family": "Frontend & Web",
    "icon": "🧱",
    "topics": 54,
    "hours": 55,
    "tags": [
      "html",
      "semantics",
      "forms",
      "accessibility",
      "seo"
    ],
    "popular": false
  },
  {
    "id": "track-iam",
    "title": "Iam",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "iam"
    ],
    "popular": false
  },
  {
    "id": "track-incident-response",
    "title": "Incident Response",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "incident",
      "response"
    ],
    "popular": false
  },
  {
    "id": "track-infrastructure-automation",
    "title": "Infrastructure Automation",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "infrastructure",
      "automation"
    ],
    "popular": false
  },
  {
    "id": "track-ios",
    "title": "iOS Development with SwiftUI",
    "family": "Mobile Development",
    "icon": "🍎",
    "topics": 55,
    "hours": 67,
    "tags": [
      "ios",
      "swift",
      "swiftui",
      "mobile",
      "xcode"
    ],
    "popular": true
  },
  {
    "id": "track-kafka",
    "title": "Apache Kafka",
    "family": "Data Engineering",
    "icon": "📨",
    "topics": 50,
    "hours": 50,
    "tags": [
      "kafka",
      "streaming",
      "event-driven",
      "messaging",
      "confluent"
    ],
    "popular": false
  },
  {
    "id": "track-kotlin",
    "title": "Kotlin",
    "family": "Programming Languages",
    "icon": "🟣",
    "topics": 65,
    "hours": 76,
    "tags": [
      "kotlin",
      "jvm",
      "android",
      "ktor",
      "coroutines"
    ],
    "popular": false
  },
  {
    "id": "track-kubernetes",
    "title": "Kubernetes",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "kubernetes"
    ],
    "popular": true
  },
  {
    "id": "track-laravel",
    "title": "Laravel",
    "family": "Backend Frameworks",
    "icon": "🟥",
    "topics": 58,
    "hours": 66,
    "tags": [
      "laravel",
      "php",
      "eloquent",
      "blade",
      "sanctum"
    ],
    "popular": false
  },
  {
    "id": "track-linux-security",
    "title": "Linux and Operating System Security",
    "family": "Cybersecurity",
    "icon": "🐧",
    "topics": 48,
    "hours": 59,
    "tags": [
      "linux",
      "hardening",
      "cis benchmark",
      "selinux",
      "apparmor"
    ],
    "popular": false
  },
  {
    "id": "track-linux",
    "title": "Linux",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "linux"
    ],
    "popular": false
  },
  {
    "id": "track-llm-apps",
    "title": "LLM Application Engineering",
    "family": "AI & Generative AI",
    "icon": "🛠️",
    "topics": 48,
    "hours": 48,
    "tags": [
      "llm apps",
      "structured outputs",
      "streaming",
      "guardrails",
      "observability"
    ],
    "popular": false
  },
  {
    "id": "track-llm-evals",
    "title": "LLM Evaluation and Testing",
    "family": "AI & Generative AI",
    "icon": "📏",
    "topics": 46,
    "hours": 47,
    "tags": [
      "evals",
      "llm as judge",
      "benchmarks",
      "promptfoo",
      "langfuse"
    ],
    "popular": false
  },
  {
    "id": "track-llms",
    "title": "Large Language Models",
    "family": "AI & Generative AI",
    "icon": "🧠",
    "topics": 54,
    "hours": 55,
    "tags": [
      "llm",
      "transformers",
      "attention",
      "rlhf",
      "tool-calling"
    ],
    "popular": true
  },
  {
    "id": "track-machine-learning",
    "title": "Machine Learning",
    "family": "AI & Generative AI",
    "icon": "🤖",
    "topics": 52,
    "hours": 52,
    "tags": [
      "machine learning",
      "scikit-learn",
      "regression",
      "classification",
      "clustering"
    ],
    "popular": false
  },
  {
    "id": "track-marketing-analytics",
    "title": "Marketing Analytics",
    "family": "Data Analytics & BI",
    "icon": "📣",
    "topics": 40,
    "hours": 40,
    "tags": [
      "marketing analytics",
      "attribution",
      "roas",
      "cac",
      "ga4"
    ],
    "popular": false
  },
  {
    "id": "track-math-ai",
    "title": "Mathematics for AI",
    "family": "AI & Generative AI",
    "icon": "∑",
    "topics": 48,
    "hours": 49,
    "tags": [
      "mathematics",
      "linear algebra",
      "calculus",
      "probability",
      "statistics"
    ],
    "popular": false
  },
  {
    "id": "track-microservices",
    "title": "Microservices",
    "family": "Backend Frameworks",
    "icon": "🧩",
    "topics": 59,
    "hours": 60,
    "tags": [
      "microservices",
      "distributed systems",
      "architecture",
      "ddd",
      "kafka"
    ],
    "popular": false
  },
  {
    "id": "track-mlops",
    "title": "MLOps and LLMOps",
    "family": "AI & Generative AI",
    "icon": "🔁",
    "topics": 51,
    "hours": 51,
    "tags": [
      "mlops",
      "llmops",
      "mlflow",
      "dvc",
      "feature store"
    ],
    "popular": false
  },
  {
    "id": "track-mobile-performance",
    "title": "Mobile Performance",
    "family": "Mobile Development",
    "icon": "⚡",
    "topics": 40,
    "hours": 43,
    "tags": [
      "mobile",
      "performance",
      "profiling",
      "startup",
      "jank"
    ],
    "popular": false
  },
  {
    "id": "track-mobile-security",
    "title": "Mobile Security",
    "family": "Mobile Development",
    "icon": "🔐",
    "topics": 41,
    "hours": 45,
    "tags": [
      "mobile",
      "security",
      "owasp",
      "keychain",
      "keystore"
    ],
    "popular": false
  },
  {
    "id": "track-mobile-testing",
    "title": "Mobile Testing",
    "family": "Mobile Development",
    "icon": "🧪",
    "topics": 40,
    "hours": 43,
    "tags": [
      "mobile",
      "testing",
      "espresso",
      "xcuitest",
      "flutter"
    ],
    "popular": false
  },
  {
    "id": "track-mobile-ux",
    "title": "Mobile UI/UX",
    "family": "Mobile Development",
    "icon": "📱",
    "topics": 38,
    "hours": 39,
    "tags": [
      "mobile",
      "ux",
      "ui",
      "material design",
      "human interface guidelines"
    ],
    "popular": false
  },
  {
    "id": "track-model-evaluation",
    "title": "Model Evaluation",
    "family": "Data Science",
    "icon": "📏",
    "topics": 48,
    "hours": 48,
    "tags": [
      "model evaluation",
      "metrics",
      "cross-validation",
      "roc-auc",
      "calibration"
    ],
    "popular": false
  },
  {
    "id": "track-model-serving",
    "title": "Model Serving and Inference",
    "family": "AI & Generative AI",
    "icon": "🚀",
    "topics": 47,
    "hours": 47,
    "tags": [
      "model serving",
      "inference",
      "vllm",
      "triton",
      "fastapi"
    ],
    "popular": false
  },
  {
    "id": "track-nestjs",
    "title": "NestJS",
    "family": "Backend Frameworks",
    "icon": "🐈",
    "topics": 51,
    "hours": 61,
    "tags": [
      "nestjs",
      "typescript",
      "node",
      "dependency-injection",
      "typeorm"
    ],
    "popular": false
  },
  {
    "id": "track-networking",
    "title": "Networking",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "networking"
    ],
    "popular": false
  },
  {
    "id": "track-nlp",
    "title": "Natural Language Processing",
    "family": "AI & Generative AI",
    "icon": "📝",
    "topics": 54,
    "hours": 55,
    "tags": [
      "nlp",
      "transformers",
      "bert",
      "tokenization",
      "hugging-face"
    ],
    "popular": false
  },
  {
    "id": "track-numpy",
    "title": "NumPy",
    "family": "Data Science",
    "icon": "🔢",
    "topics": 48,
    "hours": 48,
    "tags": [
      "numpy",
      "arrays",
      "vectorisation",
      "linear algebra",
      "broadcasting"
    ],
    "popular": false
  },
  {
    "id": "track-nuxt",
    "title": "Nuxt",
    "family": "Frontend & Web",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "nuxt"
    ],
    "popular": false
  },
  {
    "id": "track-observability",
    "title": "Observability",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "observability"
    ],
    "popular": false
  },
  {
    "id": "track-operating-systems",
    "title": "Operating Systems",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "operating",
      "systems"
    ],
    "popular": true
  },
  {
    "id": "track-pandas",
    "title": "Pandas",
    "family": "Data Science",
    "icon": "🐼",
    "topics": 49,
    "hours": 49,
    "tags": [
      "pandas",
      "dataframes",
      "data wrangling",
      "groupby",
      "time series"
    ],
    "popular": true
  },
  {
    "id": "track-parallel-computing",
    "title": "Parallel Computing",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "parallel",
      "computing"
    ],
    "popular": false
  },
  {
    "id": "track-php",
    "title": "PHP",
    "family": "Programming Languages",
    "icon": "🐘",
    "topics": 63,
    "hours": 69,
    "tags": [
      "php",
      "web",
      "backend",
      "composer",
      "pdo"
    ],
    "popular": false
  },
  {
    "id": "track-pipeline-monitoring",
    "title": "Pipeline Monitoring",
    "family": "Data Engineering",
    "icon": "📡",
    "topics": 40,
    "hours": 40,
    "tags": [
      "monitoring",
      "observability",
      "prometheus",
      "grafana",
      "alerting"
    ],
    "popular": false
  },
  {
    "id": "track-platform-engineering",
    "title": "Platform Engineering",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "platform",
      "engineering"
    ],
    "popular": false
  },
  {
    "id": "track-plc",
    "title": "Plc",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "plc"
    ],
    "popular": false
  },
  {
    "id": "track-power-bi",
    "title": "Power BI",
    "family": "Data Analytics & BI",
    "icon": "📈",
    "topics": 53,
    "hours": 59,
    "tags": [
      "power bi",
      "dax",
      "power query",
      "m",
      "data modelling"
    ],
    "popular": true
  },
  {
    "id": "track-probability-statistics",
    "title": "Probability and Statistics",
    "family": "Data Science",
    "icon": "🎲",
    "topics": 52,
    "hours": 52,
    "tags": [
      "statistics",
      "probability",
      "hypothesis testing",
      "distributions",
      "bayes"
    ],
    "popular": false
  },
  {
    "id": "track-product-analytics",
    "title": "Product Analytics",
    "family": "Data Analytics & BI",
    "icon": "🧭",
    "topics": 41,
    "hours": 41,
    "tags": [
      "product analytics",
      "event tracking",
      "retention",
      "funnels",
      "cohorts"
    ],
    "popular": false
  },
  {
    "id": "track-prompt-engineering",
    "title": "Prompt Engineering",
    "family": "AI & Generative AI",
    "icon": "💬",
    "topics": 51,
    "hours": 52,
    "tags": [
      "prompt-engineering",
      "llm",
      "few-shot",
      "chain-of-thought",
      "structured-output"
    ],
    "popular": true
  },
  {
    "id": "track-pwa",
    "title": "Pwa",
    "family": "Frontend & Web",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "pwa"
    ],
    "popular": false
  },
  {
    "id": "track-python-ai",
    "title": "Python for Data, Analytics and AI",
    "family": "AI & Generative AI",
    "icon": "📊",
    "topics": 63,
    "hours": 64,
    "tags": [
      "python",
      "numpy",
      "pandas",
      "matplotlib",
      "scikit-learn"
    ],
    "popular": false
  },
  {
    "id": "track-python-data-engineering",
    "title": "Python for Data Engineering",
    "family": "Data Engineering",
    "icon": "🐍",
    "topics": 46,
    "hours": 48,
    "tags": [
      "python",
      "data engineering",
      "pyarrow",
      "parquet",
      "polars"
    ],
    "popular": false
  },
  {
    "id": "track-python",
    "title": "Python",
    "family": "Programming Languages",
    "icon": "🐍",
    "topics": 85,
    "hours": 85,
    "tags": [
      "python",
      "scripting",
      "automation",
      "backend",
      "data"
    ],
    "popular": true
  },
  {
    "id": "track-r",
    "title": "R",
    "family": "Programming Languages",
    "icon": "📊",
    "topics": 56,
    "hours": 62,
    "tags": [
      "r",
      "tidyverse",
      "statistics",
      "data-analysis",
      "ggplot2"
    ],
    "popular": false
  },
  {
    "id": "track-rag",
    "title": "Retrieval-Augmented Generation",
    "family": "AI & Generative AI",
    "icon": "📚",
    "topics": 53,
    "hours": 53,
    "tags": [
      "rag",
      "retrieval",
      "chunking",
      "vector database",
      "reranking"
    ],
    "popular": true
  },
  {
    "id": "track-rails",
    "title": "Ruby on Rails",
    "family": "Backend Frameworks",
    "icon": "🛤️",
    "topics": 50,
    "hours": 61,
    "tags": [
      "rails",
      "ruby",
      "active-record",
      "hotwire",
      "turbo"
    ],
    "popular": false
  },
  {
    "id": "track-react-native",
    "title": "React Native",
    "family": "Mobile Development",
    "icon": "📱",
    "topics": 49,
    "hours": 61,
    "tags": [
      "react-native",
      "expo",
      "typescript",
      "mobile",
      "react"
    ],
    "popular": true
  },
  {
    "id": "track-responsive-design",
    "title": "Responsive Web Design",
    "family": "Frontend & Web",
    "icon": "📱",
    "topics": 47,
    "hours": 47,
    "tags": [
      "responsive",
      "mobile-first",
      "media queries",
      "container queries",
      "fluid typography"
    ],
    "popular": false
  },
  {
    "id": "track-rest-api",
    "title": "REST API Engineering",
    "family": "Backend Frameworks",
    "icon": "🔗",
    "topics": 54,
    "hours": 67,
    "tags": [
      "rest",
      "http",
      "api-design",
      "openapi",
      "oauth2"
    ],
    "popular": false
  },
  {
    "id": "track-ruby",
    "title": "Ruby",
    "family": "Programming Languages",
    "icon": "💎",
    "topics": 56,
    "hours": 62,
    "tags": [
      "ruby",
      "scripting",
      "backend",
      "rspec",
      "bundler"
    ],
    "popular": false
  },
  {
    "id": "track-rust",
    "title": "Rust",
    "family": "Programming Languages",
    "icon": "🦀",
    "topics": 70,
    "hours": 82,
    "tags": [
      "rust",
      "systems programming",
      "ownership",
      "borrow checker",
      "cargo"
    ],
    "popular": true
  },
  {
    "id": "track-scala",
    "title": "Scala",
    "family": "Programming Languages",
    "icon": "🔺",
    "topics": 60,
    "hours": 66,
    "tags": [
      "scala",
      "functional",
      "jvm",
      "sbt",
      "spark"
    ],
    "popular": false
  },
  {
    "id": "track-secure-coding",
    "title": "Secure Coding",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "secure",
      "coding"
    ],
    "popular": false
  },
  {
    "id": "track-security-engineering",
    "title": "Security Engineering",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "security",
      "engineering"
    ],
    "popular": false
  },
  {
    "id": "track-security-foundations",
    "title": "Security Foundations",
    "family": "Cybersecurity",
    "icon": "🛡️",
    "topics": 45,
    "hours": 54,
    "tags": [
      "security",
      "cia triad",
      "risk",
      "nist csf",
      "iso 27001"
    ],
    "popular": true
  },
  {
    "id": "track-security-monitoring",
    "title": "Security Monitoring",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "security",
      "monitoring"
    ],
    "popular": false
  },
  {
    "id": "track-software-engineering",
    "title": "Software Engineering",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "software",
      "engineering"
    ],
    "popular": false
  },
  {
    "id": "track-software-testing",
    "title": "Software Testing",
    "family": "Computer Science",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "software",
      "testing"
    ],
    "popular": false
  },
  {
    "id": "track-spark",
    "title": "Spark",
    "family": "Data Engineering",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "spark"
    ],
    "popular": true
  },
  {
    "id": "track-spring-boot",
    "title": "Spring Boot",
    "family": "Backend Frameworks",
    "icon": "🍃",
    "topics": 77,
    "hours": 80,
    "tags": [
      "spring",
      "spring boot",
      "java",
      "backend",
      "rest"
    ],
    "popular": true
  },
  {
    "id": "track-spring-data-jpa",
    "title": "Spring Data JPA and Hibernate",
    "family": "Backend Frameworks",
    "icon": "🗄️",
    "topics": 55,
    "hours": 57,
    "tags": [
      "spring data",
      "jpa",
      "hibernate",
      "java",
      "orm"
    ],
    "popular": false
  },
  {
    "id": "track-spring-security",
    "title": "Spring Security",
    "family": "Backend Frameworks",
    "icon": "🔐",
    "topics": 47,
    "hours": 49,
    "tags": [
      "spring security",
      "spring",
      "java",
      "authentication",
      "authorization"
    ],
    "popular": false
  },
  {
    "id": "track-sql-analytics",
    "title": "SQL for Analytics",
    "family": "Data Analytics & BI",
    "icon": "🧮",
    "topics": 45,
    "hours": 46,
    "tags": [
      "sql",
      "postgresql",
      "analytics",
      "window functions",
      "cohorts"
    ],
    "popular": false
  },
  {
    "id": "track-sre",
    "title": "Sre",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "sre"
    ],
    "popular": false
  },
  {
    "id": "track-statistics-analysts",
    "title": "Statistics for Analysts",
    "family": "Data Analytics & BI",
    "icon": "📐",
    "topics": 46,
    "hours": 47,
    "tags": [
      "statistics",
      "analytics",
      "hypothesis testing",
      "confidence intervals",
      "regression"
    ],
    "popular": false
  },
  {
    "id": "track-svelte",
    "title": "Svelte and SvelteKit",
    "family": "Frontend & Web",
    "icon": "🔥",
    "topics": 50,
    "hours": 54,
    "tags": [
      "svelte",
      "sveltekit",
      "runes",
      "typescript",
      "frontend"
    ],
    "popular": false
  },
  {
    "id": "track-swift",
    "title": "Swift",
    "family": "Programming Languages",
    "icon": "🦅",
    "topics": 65,
    "hours": 76,
    "tags": [
      "swift",
      "ios",
      "apple",
      "swiftui",
      "vapor"
    ],
    "popular": false
  },
  {
    "id": "track-tableau",
    "title": "Tableau",
    "family": "Data Analytics & BI",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "tableau"
    ],
    "popular": false
  },
  {
    "id": "track-terraform",
    "title": "Terraform",
    "family": "Cloud, DevOps & Platform",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "terraform"
    ],
    "popular": false
  },
  {
    "id": "track-threat-modeling",
    "title": "Threat Modeling",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "threat",
      "modeling"
    ],
    "popular": false
  },
  {
    "id": "track-time-series",
    "title": "Time Series Fundamentals",
    "family": "Data Science",
    "icon": "📈",
    "topics": 44,
    "hours": 44,
    "tags": [
      "time series",
      "forecasting",
      "arima",
      "seasonality",
      "statsmodels"
    ],
    "popular": false
  },
  {
    "id": "track-vue",
    "title": "Vue",
    "family": "Frontend & Web",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "vue"
    ],
    "popular": false
  },
  {
    "id": "track-vulnerability-assessment",
    "title": "Vulnerability Assessment",
    "family": "Cybersecurity",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "vulnerability",
      "assessment"
    ],
    "popular": false
  },
  {
    "id": "track-web-accessibility",
    "title": "Web Accessibility",
    "family": "Frontend & Web",
    "icon": "♿",
    "topics": 54,
    "hours": 55,
    "tags": [
      "accessibility",
      "a11y",
      "wcag",
      "aria",
      "screen readers"
    ],
    "popular": false
  },
  {
    "id": "track-web-performance",
    "title": "Web Performance",
    "family": "Frontend & Web",
    "icon": "📚",
    "topics": 25,
    "hours": 19,
    "tags": [
      "web",
      "performance"
    ],
    "popular": false
  },
  {
    "id": "track-web-security",
    "title": "Web Security",
    "family": "Frontend & Web",
    "icon": "🛡️",
    "topics": 56,
    "hours": 64,
    "tags": [
      "security",
      "owasp",
      "xss",
      "csrf",
      "authentication"
    ],
    "popular": true
  }
]

export const MARKETING_CAREER_PATHS: MarketingCareerPath[] = [
  {
    "id": "path-ai-engineer",
    "title": "AI Engineer",
    "family": "AI & Generative AI",
    "icon": "🤖",
    "description": "Build products on top of models: Python, the maths that matters, ML and deep learning foundations, then LLM engineering, RAG, agents and MLOps.",
    "roles": [
      "AI Engineer",
      "LLM Engineer",
      "Applied ML Engineer"
    ],
    "trackCount": 11,
    "languages": [
      "Python"
    ]
  },
  {
    "id": "path-genai-engineer",
    "title": "Generative AI Engineer",
    "family": "AI & Generative AI",
    "icon": "✨",
    "description": "Ship LLM-powered features: prompting, structured outputs, retrieval, agents, evaluation and safety, with the Python and model background to back it up.",
    "roles": [
      "Generative AI Engineer",
      "LLM Application Engineer"
    ],
    "trackCount": 11,
    "languages": [
      "Python"
    ]
  },
  {
    "id": "path-ml-engineer",
    "title": "Machine Learning Engineer",
    "family": "AI & Generative AI",
    "icon": "🧪",
    "description": "Train, evaluate and serve models in production: maths, ML, deep learning, feature engineering, evaluation, MLOps and serving.",
    "roles": [
      "Machine Learning Engineer",
      "MLOps Engineer"
    ],
    "trackCount": 10,
    "languages": [
      "Python"
    ]
  },
  {
    "id": "path-data-scientist",
    "title": "Data Scientist",
    "family": "Data Science",
    "icon": "📈",
    "description": "From question to insight to model: Python, statistics, SQL, Pandas, EDA, machine learning, experimentation and communicating results.",
    "roles": [
      "Data Scientist",
      "Applied Scientist"
    ],
    "trackCount": 11,
    "languages": [
      "Python",
      "SQL"
    ]
  },
  {
    "id": "path-data-analyst",
    "title": "Data Analyst",
    "family": "Data Analytics & BI",
    "icon": "📊",
    "description": "Excel, SQL, statistics and a BI tool, applied to real business questions and dashboards. No machine learning required.",
    "roles": [
      "Data Analyst",
      "Business Analyst",
      "BI Analyst"
    ],
    "trackCount": 10,
    "languages": [
      "SQL"
    ]
  },
  {
    "id": "path-data-engineer",
    "title": "Data Engineer",
    "family": "Data Engineering",
    "icon": "🛠️",
    "description": "Move and shape data reliably: Python, advanced SQL, data modelling, ETL/ELT, Spark, Airflow, dbt and cloud data platforms.",
    "roles": [
      "Data Engineer",
      "Analytics Engineer"
    ],
    "trackCount": 12,
    "languages": [
      "Python",
      "SQL"
    ]
  },
  {
    "id": "path-java-backend",
    "title": "Java Backend Developer",
    "family": "Backend Frameworks",
    "icon": "☕",
    "description": "Java, Spring Boot, SQL and REST APIs with security, testing, system design and the DevOps to ship it.",
    "roles": [
      "Java Backend Developer",
      "Spring Boot Developer"
    ],
    "trackCount": 10,
    "languages": [
      "Java"
    ]
  },
  {
    "id": "path-python-backend",
    "title": "Python Backend Developer",
    "family": "Backend Frameworks",
    "icon": "🐍",
    "description": "Python with FastAPI or Django, SQL, REST design, security and deployment.",
    "roles": [
      "Python Backend Developer",
      "Django Developer",
      "FastAPI Developer"
    ],
    "trackCount": 9,
    "languages": [
      "Python"
    ]
  },
  {
    "id": "path-full-stack",
    "title": "Full-Stack Developer",
    "family": "Frontend & Web",
    "icon": "🧑‍💻",
    "description": "JavaScript and TypeScript, React and Next.js, Node backend, SQL, testing, DevOps and system design.",
    "roles": [
      "Full-Stack Developer",
      "Software Engineer"
    ],
    "trackCount": 9,
    "languages": [
      "TypeScript",
      "JavaScript"
    ]
  },
  {
    "id": "path-frontend",
    "title": "Frontend Developer",
    "family": "Frontend & Web",
    "icon": "🎨",
    "description": "HTML, CSS, JavaScript and TypeScript, React and Next.js, accessibility, performance, testing and frontend architecture.",
    "roles": [
      "Frontend Developer",
      "UI Engineer"
    ],
    "trackCount": 10,
    "languages": [
      "TypeScript",
      "JavaScript"
    ]
  },
  {
    "id": "path-mobile",
    "title": "Mobile Developer",
    "family": "Mobile Development",
    "icon": "📱",
    "description": "Cross-platform mobile with Dart and Flutter, plus mobile UX, testing, performance and store deployment.",
    "roles": [
      "Mobile Developer",
      "Flutter Developer"
    ],
    "trackCount": 7,
    "languages": [
      "Dart"
    ]
  },
  {
    "id": "path-flutter",
    "title": "Flutter Developer",
    "family": "Mobile Development",
    "icon": "🐦",
    "description": "Dart, Flutter, mobile architecture, API integration, testing and deployment to both stores.",
    "roles": [
      "Flutter Developer"
    ],
    "trackCount": 5,
    "languages": [
      "Dart"
    ]
  },
  {
    "id": "path-android",
    "title": "Android Developer",
    "family": "Mobile Development",
    "icon": "🤖",
    "description": "Kotlin and modern Android with Jetpack Compose, plus testing, security and Play Store release.",
    "roles": [
      "Android Developer"
    ],
    "trackCount": 6,
    "languages": [
      "Kotlin"
    ]
  },
  {
    "id": "path-ios",
    "title": "iOS Developer",
    "family": "Mobile Development",
    "icon": "🍎",
    "description": "Swift and SwiftUI, app architecture, persistence, networking, testing and App Store release.",
    "roles": [
      "iOS Developer"
    ],
    "trackCount": 5,
    "languages": [
      "Swift"
    ]
  },
  {
    "id": "path-cloud-engineer",
    "title": "Cloud Engineer",
    "family": "Cloud, DevOps & Platform",
    "icon": "☁️",
    "description": "Linux, networking, one cloud provider in depth, Docker, Kubernetes, Terraform and cloud security.",
    "roles": [
      "Cloud Engineer",
      "Cloud Architect (junior)"
    ],
    "trackCount": 8,
    "languages": []
  },
  {
    "id": "path-devops-engineer",
    "title": "DevOps Engineer",
    "family": "Cloud, DevOps & Platform",
    "icon": "🚀",
    "description": "CI/CD, containers, Kubernetes, infrastructure as code, observability and SRE practices.",
    "roles": [
      "DevOps Engineer",
      "Platform Engineer",
      "SRE"
    ],
    "trackCount": 10,
    "languages": []
  },
  {
    "id": "path-cybersecurity",
    "title": "Cybersecurity Engineer",
    "family": "Cybersecurity",
    "icon": "🛡️",
    "description": "Security foundations, networking, Linux security, web application security, IAM, cloud security, monitoring and incident response.",
    "roles": [
      "Security Engineer",
      "Security Analyst",
      "AppSec Engineer"
    ],
    "trackCount": 13,
    "languages": []
  },
  {
    "id": "path-cs-foundations",
    "title": "Computer Science Foundations",
    "family": "Computer Science",
    "icon": "🎓",
    "description": "A university-style core independent of any job: discrete maths, computer organisation, operating systems, networks, databases, algorithms and distributed systems.",
    "roles": [
      "Student",
      "Self-taught engineer filling gaps"
    ],
    "trackCount": 8,
    "languages": []
  },
  {
    "id": "path-swe-interviews",
    "title": "Software Engineer Interview Preparation",
    "family": "Software Engineering Interviews",
    "icon": "🎯",
    "description": "The product-company loop: DSA, system design (HLD and LLD), CS fundamentals and mock interviews, in the language you code in.",
    "roles": [
      "SDE-1",
      "SDE-2",
      "Senior Software Engineer"
    ],
    "trackCount": 4,
    "languages": []
  },
  {
    "id": "path-competitive-programming",
    "title": "Competitive Programming",
    "family": "Software Engineering Interviews",
    "icon": "🏁",
    "description": "Algorithms and data structures at contest depth with C++ or Python, plus the theory behind them.",
    "roles": [
      "Competitive programmer",
      "Contest participant"
    ],
    "trackCount": 4,
    "languages": [
      "C++",
      "Python"
    ]
  }
]
