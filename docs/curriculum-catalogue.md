# Curriculum catalogue

Track ids are fixed here so career paths, tests and content files agree. Files live in `src/data/curriculum/library/<id without track->.ts`.

## Core (existing, unchanged ids)
track-dsa, track-java, track-js, track-react, track-node, track-sql, track-hld, track-lld, track-cs, track-devops

## Programming Languages (family `Programming Languages`, kind `language`, explainMode `concept`, style `code`)
| id | title | code profile |
| --- | --- | --- |
| track-python | Python | python |
| track-c | C | c |
| track-cpp | C++ | cpp |
| track-rust | Rust | rust |
| track-go | Go | go |
| track-kotlin | Kotlin | kotlin |
| track-swift | Swift | swift |
| track-dart | Dart | dart |
| track-csharp | C# | csharp |
| track-php | PHP | php |
| track-ruby | Ruby | ruby |
| track-scala | Scala | scala |
| track-r | R | r |
| track-bash | Bash and Shell Scripting | bash |

## Backend Frameworks (family `Backend Frameworks`, kind `framework`)
| id | title | language / mode |
| --- | --- | --- |
| track-spring-boot | Spring Boot | Java, concept (covers Spring core, DI, config, REST, validation, testing, caching, messaging, observability, Docker, microservices, projects) |
| track-spring-security | Spring Security | Java, concept (auth, authz, JWT, OAuth2, method security, testing) |
| track-spring-data-jpa | Spring Data JPA and Hibernate | Java, concept (entities, relationships, queries, transactions, performance) |
| track-django | Django | Python, concept |
| track-fastapi | FastAPI | Python, concept |
| track-flask | Flask | Python, concept |
| track-aspnet-core | ASP.NET Core | C#, concept |
| track-laravel | Laravel | PHP, concept |
| track-nestjs | NestJS | TypeScript, node |
| track-rails | Ruby on Rails | Ruby, concept |
| track-go-backend | Go Backend Development | Go, concept |
| track-rest-api | REST API Engineering | language-agnostic (code omitted), concept |
| track-graphql | GraphQL | TypeScript, node |
| track-grpc | gRPC | Go, concept |
| track-microservices | Microservices | pseudo-code (plaintext), hld |

## AI & Generative AI (family `AI & Generative AI`, kind `domain`, mode `data`, code python, style `practice`)
track-ai-foundations "AI Engineering Foundations"; track-math-ai "Mathematics for AI" (mode math); track-python-ai "Python for Data, Analytics and AI" (mode data, style code); track-machine-learning "Machine Learning"; track-deep-learning "Deep Learning"; track-nlp "Natural Language Processing"; track-computer-vision "Computer Vision"; track-generative-ai "Generative AI"; track-llms "Large Language Models"; track-prompt-engineering "Prompt Engineering"; track-embeddings "Embeddings and Vector Search"; track-rag "Retrieval-Augmented Generation"; track-ai-agents "AI Agents and Agentic Workflows"; track-llm-apps "LLM Application Engineering"; track-llm-evals "LLM Evaluation and Testing"; track-ai-safety "AI Safety, Security and Privacy"; track-mlops "MLOps and LLMOps"; track-model-serving "Model Serving and Inference"; track-ai-infra "AI Infrastructure and Deployment"; track-ai-projects "AI Engineering Projects" (kind projects, style project)

## Data Science (family `Data Science`, kind `domain`, mode `data`, code python, style `practice`)
track-probability-statistics "Probability and Statistics" (mode math); track-numpy "NumPy" (style code); track-pandas "Pandas" (style code); track-data-cleaning "Data Cleaning"; track-eda "Exploratory Data Analysis"; track-data-visualization "Data Visualization"; track-feature-engineering "Feature Engineering"; track-experimentation "Experimentation and A/B Testing"; track-model-evaluation "Model Evaluation"; track-time-series "Time Series Fundamentals"; track-data-science-projects "Data Science Projects" (kind projects, style project)

Shared with AI: track-machine-learning, track-math-ai, track-python-ai.

## Data Analytics & BI (family `Data Analytics & BI`, kind `tooling` unless noted, mode `tool`, style `practice`)
track-excel "Excel and Spreadsheet Analytics" (code excel); track-sql-analytics "SQL for Analytics" (mode sql, code sql, style code); track-statistics-analysts "Statistics for Analysts" (kind domain, mode math); track-power-bi "Power BI" (code dax); track-tableau "Tableau" (code plaintext 'Tableau calculated fields'); track-dashboard-design "Dashboard Design" (kind domain); track-business-metrics "Business Metrics and KPIs" (kind domain); track-product-analytics "Product Analytics" (kind domain); track-marketing-analytics "Marketing Analytics" (kind domain); track-financial-analytics "Financial Analytics Fundamentals" (kind domain); track-analytics-projects "Analytics Projects" (kind projects, style project)

Shared: track-data-cleaning, track-eda, track-data-visualization, track-python-ai.

## Data Engineering (family `Data Engineering`, kind `domain`, mode `data` unless noted, code python, style `practice`)
track-advanced-sql "Advanced SQL" (mode sql, code sql, style code); track-python-data-engineering "Python for Data Engineering" (style code); track-data-warehousing "Data Warehousing" (mode sql); track-data-modeling "Data Modeling" (mode sql); track-etl-elt "ETL and ELT"; track-data-pipelines "Data Pipelines"; track-spark "Apache Spark" (style code); track-kafka "Apache Kafka" (style code); track-airflow "Apache Airflow" (style code); track-dbt "dbt" (mode sql, code sql, style code); track-batch-stream "Batch and Stream Processing"; track-cloud-data-platforms "Cloud Data Platforms" (mode devops); track-data-quality "Data Quality and Governance"; track-pipeline-monitoring "Pipeline Monitoring" (mode devops); track-data-engineering-projects "Data Engineering Projects" (kind projects, style project)

## Mobile Development (family `Mobile Development`)
track-flutter "Flutter" (framework, Dart, concept, prereq track-dart); track-android "Android Development" (framework, Kotlin, concept, prereq track-kotlin); track-ios "iOS Development with SwiftUI" (framework, Swift, concept, prereq track-swift); track-react-native "React Native" (framework, TypeScript, react); track-mobile-ux "Mobile UI/UX" (domain, concept, code omitted, style practice); track-mobile-testing "Mobile Testing" (domain, concept, style practice); track-mobile-security "Mobile Security" (domain, security); track-mobile-performance "Mobile Performance" (domain, concept, style practice); track-app-store-deployment "App Store and Play Store Deployment" (tooling, concept, style practice)

## Frontend & Web (family `Frontend & Web`)
track-html "HTML" (language, code html→ use id 'html'); track-css "CSS" (language, id 'css'); track-responsive-design "Responsive Web Design" (domain, css); track-web-accessibility "Web Accessibility" (domain, html); track-web-performance "Web Performance" (domain, typescript); track-vue "Vue" (framework, TypeScript with Vue, react mode); track-nuxt "Nuxt" (framework, react mode, prereq track-vue); track-angular "Angular" (framework, TypeScript, react mode); track-svelte "Svelte and SvelteKit" (framework, react mode); track-web-security "Web Security" (domain, security mode, javascript); track-frontend-testing "Frontend Testing" (domain, typescript); track-pwa "Progressive Web Apps" (domain, typescript); track-frontend-architecture "Frontend Architecture" (domain, typescript)

## Cloud, DevOps & Platform (family `Cloud, DevOps & Platform`, mode `devops`, code bash/yaml, style `practice`)
track-aws "AWS" (tooling); track-azure "Azure" (tooling); track-gcp "Google Cloud" (tooling); track-linux "Linux" (tooling); track-docker "Docker" (tooling); track-kubernetes "Kubernetes" (tooling); track-terraform "Terraform" (tooling, code HCL id 'hcl'); track-cicd "CI/CD" (domain); track-observability "Observability" (domain); track-sre "Site Reliability Engineering" (domain); track-platform-engineering "Platform Engineering" (domain); track-cloud-security "Cloud Security" (domain, mode security); track-networking "Networking" (domain, mode cs); track-infrastructure-automation "Infrastructure Automation" (domain)

## Cybersecurity (family `Cybersecurity`, kind `domain`, mode `security`, style `practice`)
track-security-foundations "Security Foundations"; track-linux-security "Linux and Operating System Security"; track-secure-coding "Secure Coding" (style code); track-iam "Identity and Access Management"; track-cryptography "Cryptography Fundamentals" (mode math for the maths parts is not needed; keep security); track-threat-modeling "Threat Modeling"; track-vulnerability-assessment "Vulnerability Assessment"; track-defensive-security "Defensive Security"; track-security-monitoring "Security Monitoring"; track-incident-response "Incident Response"; track-security-engineering "Security Engineering"

Shared: track-web-security, track-cloud-security, track-networking.

## Computer Science (family `Computer Science`, kind `domain`, mode `cs`, style `reading` for theory, `code` where algorithms are implemented)
track-discrete-math "Discrete Mathematics" (mode math); track-computer-organization "Computer Organization and Architecture"; track-digital-logic "Digital Logic"; track-operating-systems "Operating Systems"; track-computer-networks "Computer Networks"; track-dbms "Database Management Systems"; track-algorithms "Algorithms" (style code); track-compiler-design "Compiler Design"; track-distributed-systems "Distributed Systems"; track-software-engineering "Software Engineering"; track-plc "Programming Language Concepts"; track-parallel-computing "Parallel Computing" (style code); track-software-testing "Software Testing" (style code); track-computer-security "Computer Security" (mode security)

Existing track-cs stays as the compact interview-prep summary.
