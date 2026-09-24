-- Populate Career Paths from Application Data
-- Phase 2.4: Load career paths from data/careerPaths.ts

-- First, create a temporary table for the career paths data
CREATE TEMP TABLE career_paths_temp (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  family TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  languages TEXT[],
  roles TEXT[],
  tracks JSONB
);

-- Insert career paths data
-- AI Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-ai-engineer', 'AI Engineer', 'AI & Generative AI', '🤖',
 'Build products on top of models: Python, the maths that matters, ML and deep learning foundations, then LLM engineering, RAG, agents and MLOps.',
 ARRAY['Python'], ARRAY['AI Engineer', 'LLM Engineer', 'Applied ML Engineer'],
 '[{"trackId": "track-python", "priority": "High"}, {"trackId": "track-math-ai", "priority": "Medium"}, {"trackId": "track-machine-learning", "priority": "High"}, {"trackId": "track-deep-learning", "priority": "Medium"}, {"trackId": "track-llms", "priority": "High"}, {"trackId": "track-rag", "priority": "High"}, {"trackId": "track-ai-agents", "priority": "High"}, {"trackId": "track-mlops", "priority": "Medium"}, {"trackId": "track-ai-infra", "priority": "Low"}, {"trackId": "track-hld", "priority": "Low"}, {"trackId": "track-ai-projects", "priority": "High"}]');

-- Generative AI Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-genai-engineer', 'Generative AI Engineer', 'AI & Generative AI', '✨',
 'Ship LLM-powered features: prompting, structured outputs, retrieval, agents, evaluation and safety, with the Python and model background to back it up.',
 ARRAY['Python'], ARRAY['Generative AI Engineer', 'LLM Application Engineer'],
 '[{"trackId": "track-python-ai", "priority": "High"}, {"trackId": "track-llms", "priority": "High"}, {"trackId": "track-prompt-engineering", "priority": "High"}, {"trackId": "track-embeddings", "priority": "Medium"}, {"trackId": "track-rag", "priority": "High"}, {"trackId": "track-ai-agents", "priority": "High"}, {"trackId": "track-llm-apps", "priority": "High"}, {"trackId": "track-llm-evals", "priority": "Medium"}, {"trackId": "track-ai-safety", "priority": "Medium"}, {"trackId": "track-generative-ai", "priority": "Low"}, {"trackId": "track-ai-projects", "priority": "High"}]');

-- Machine Learning Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-ml-engineer', 'Machine Learning Engineer', 'AI & Generative AI', '🧪',
 'Train, evaluate and serve models in production: maths, ML, deep learning, feature engineering, evaluation, MLOps and serving.',
 ARRAY['Python'], ARRAY['Machine Learning Engineer', 'MLOps Engineer'],
 '[{"trackId": "track-python-ai", "priority": "High"}, {"trackId": "track-math-ai", "priority": "High"}, {"trackId": "track-machine-learning", "priority": "High"}, {"trackId": "track-feature-engineering", "priority": "Medium"}, {"trackId": "track-deep-learning", "priority": "High"}, {"trackId": "track-model-evaluation", "priority": "Medium"}, {"trackId": "track-mlops", "priority": "High"}, {"trackId": "track-model-serving", "priority": "Medium"}, {"trackId": "track-docker", "priority": "Low"}, {"trackId": "track-hld", "priority": "Low"}]');

-- Data Scientist path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-data-scientist', 'Data Scientist', 'Data Science', '📈',
 'From question to insight to model: Python, statistics, SQL, Pandas, EDA, machine learning, experimentation and communicating results.',
 ARRAY['Python', 'SQL'], ARRAY['Data Scientist', 'Applied Scientist'],
 '[{"trackId": "track-python-ai", "priority": "High"}, {"trackId": "track-probability-statistics", "priority": "High"}, {"trackId": "track-sql-analytics", "priority": "Medium"}, {"trackId": "track-pandas", "priority": "High"}, {"trackId": "track-data-cleaning", "priority": "Medium"}, {"trackId": "track-eda", "priority": "High"}, {"trackId": "track-data-visualization", "priority": "Medium"}, {"trackId": "track-machine-learning", "priority": "High"}, {"trackId": "track-model-evaluation", "priority": "Medium"}, {"trackId": "track-experimentation", "priority": "Medium"}, {"trackId": "track-data-science-projects", "priority": "High"}]');

-- Data Analyst path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-data-analyst', 'Data Analyst', 'Data Analytics & BI', '📊',
 'Excel, SQL, statistics and a BI tool, applied to real business questions and dashboards. No machine learning required.',
 ARRAY['SQL'], ARRAY['Data Analyst', 'Business Analyst', 'BI Analyst'],
 '[{"trackId": "track-excel", "priority": "High"}, {"trackId": "track-sql", "priority": "High"}, {"trackId": "track-sql-analytics", "priority": "High"}, {"trackId": "track-statistics-analysts", "priority": "Medium"}, {"trackId": "track-data-cleaning", "priority": "Medium"}, {"trackId": "track-data-visualization", "priority": "Medium"}, {"trackId": "track-power-bi", "priority": "High"}, {"trackId": "track-dashboard-design", "priority": "Medium"}, {"trackId": "track-business-metrics", "priority": "Medium"}, {"trackId": "track-analytics-projects", "priority": "High"}]');

-- Data Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-data-engineer', 'Data Engineer', 'Data Engineering', '🛠️',
 'Move and shape data reliably: Python, advanced SQL, data modelling, ETL/ELT, Spark, Airflow, dbt and cloud data platforms.',
 ARRAY['Python', 'SQL'], ARRAY['Data Engineer', 'Analytics Engineer'],
 '[{"trackId": "track-python-data-engineering", "priority": "High"}, {"trackId": "track-advanced-sql", "priority": "High"}, {"trackId": "track-data-modeling", "priority": "High"}, {"trackId": "track-data-warehousing", "priority": "Medium"}, {"trackId": "track-etl-elt", "priority": "High"}, {"trackId": "track-data-pipelines", "priority": "Medium"}, {"trackId": "track-spark", "priority": "Medium"}, {"trackId": "track-airflow", "priority": "Medium"}, {"trackId": "track-dbt", "priority": "Medium"}, {"trackId": "track-cloud-data-platforms", "priority": "Medium"}, {"trackId": "track-data-quality", "priority": "Low"}, {"trackId": "track-data-engineering-projects", "priority": "High"}]');

-- Java Backend Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-java-backend', 'Java Backend Developer', 'Backend Frameworks', '☕',
 'Java, Spring Boot, SQL and REST APIs with security, testing, system design and the DevOps to ship it.',
 ARRAY['Java'], ARRAY['Java Backend Developer', 'Spring Boot Developer'],
 '[{"trackId": "track-java", "priority": "High"}, {"trackId": "track-spring-boot", "priority": "High"}, {"trackId": "track-spring-data-jpa", "priority": "Medium"}, {"trackId": "track-sql", "priority": "High"}, {"trackId": "track-rest-api", "priority": "Medium"}, {"trackId": "track-spring-security", "priority": "Medium"}, {"trackId": "track-software-testing", "priority": "Low"}, {"trackId": "track-hld", "priority": "Medium"}, {"trackId": "track-devops", "priority": "Low"}, {"trackId": "track-dsa", "priority": "Medium"}]');

-- Python Backend Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-python-backend', 'Python Backend Developer', 'Backend Frameworks', '🐍',
 'Python with FastAPI or Django, SQL, REST design, security and deployment.',
 ARRAY['Python'], ARRAY['Python Backend Developer', 'Django Developer', 'FastAPI Developer'],
 '[{"trackId": "track-python", "priority": "High"}, {"trackId": "track-sql", "priority": "High"}, {"trackId": "track-rest-api", "priority": "Medium"}, {"trackId": "track-fastapi", "priority": "High"}, {"trackId": "track-django", "priority": "Medium"}, {"trackId": "track-web-security", "priority": "Medium"}, {"trackId": "track-docker", "priority": "Low"}, {"trackId": "track-hld", "priority": "Medium"}, {"trackId": "track-dsa", "priority": "Medium"}]');

-- Full-Stack Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-full-stack', 'Full-Stack Developer', 'Frontend & Web', '🧑‍💻',
 'JavaScript and TypeScript, React and Next.js, Node backend, SQL, testing, DevOps and system design.',
 ARRAY['TypeScript', 'JavaScript'], ARRAY['Full-Stack Developer', 'Software Engineer'],
 '[{"trackId": "track-js", "priority": "High"}, {"trackId": "track-react", "priority": "High"}, {"trackId": "track-node", "priority": "High"}, {"trackId": "track-sql", "priority": "Medium"}, {"trackId": "track-rest-api", "priority": "Medium"}, {"trackId": "track-frontend-testing", "priority": "Low"}, {"trackId": "track-devops", "priority": "Low"}, {"trackId": "track-hld", "priority": "Medium"}, {"trackId": "track-dsa", "priority": "Medium"}]');

-- Frontend Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-frontend', 'Frontend Developer', 'Frontend & Web', '🎨',
 'HTML, CSS, JavaScript and TypeScript, React and Next.js, accessibility, performance, testing and frontend architecture.',
 ARRAY['TypeScript', 'JavaScript'], ARRAY['Frontend Developer', 'UI Engineer'],
 '[{"trackId": "track-html", "priority": "Medium"}, {"trackId": "track-css", "priority": "High"}, {"trackId": "track-js", "priority": "High"}, {"trackId": "track-react", "priority": "High"}, {"trackId": "track-responsive-design", "priority": "Medium"}, {"trackId": "track-web-accessibility", "priority": "Medium"}, {"trackId": "track-web-performance", "priority": "Medium"}, {"trackId": "track-frontend-testing", "priority": "Medium"}, {"trackId": "track-frontend-architecture", "priority": "Low"}, {"trackId": "track-dsa", "priority": "Low"}]');

-- Mobile Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-mobile', 'Mobile Developer', 'Mobile Development', '📱',
 'Cross-platform mobile with Dart and Flutter, plus mobile UX, testing, performance and store deployment.',
 ARRAY['Dart'], ARRAY['Mobile Developer', 'Flutter Developer'],
 '[{"trackId": "track-dart", "priority": "High"}, {"trackId": "track-flutter", "priority": "High"}, {"trackId": "track-mobile-ux", "priority": "Medium"}, {"trackId": "track-rest-api", "priority": "Low"}, {"trackId": "track-mobile-testing", "priority": "Medium"}, {"trackId": "track-mobile-performance", "priority": "Low"}, {"trackId": "track-app-store-deployment", "priority": "Medium"}]');

-- Flutter Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-flutter', 'Flutter Developer', 'Mobile Development', '🐦',
 'Dart, Flutter, mobile architecture, API integration, testing and deployment to both stores.',
 ARRAY['Dart'], ARRAY['Flutter Developer'],
 '[{"trackId": "track-dart", "priority": "High"}, {"trackId": "track-flutter", "priority": "High"}, {"trackId": "track-rest-api", "priority": "Medium"}, {"trackId": "track-mobile-testing", "priority": "Medium"}, {"trackId": "track-app-store-deployment", "priority": "Medium"}]');

-- Android Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-android', 'Android Developer', 'Mobile Development', '🤖',
 'Kotlin and modern Android with Jetpack Compose, plus testing, security and Play Store release.',
 ARRAY['Kotlin'], ARRAY['Android Developer'],
 '[{"trackId": "track-kotlin", "priority": "High"}, {"trackId": "track-android", "priority": "High"}, {"trackId": "track-mobile-ux", "priority": "Medium"}, {"trackId": "track-mobile-testing", "priority": "Medium"}, {"trackId": "track-mobile-security", "priority": "Low"}, {"trackId": "track-app-store-deployment", "priority": "Medium"}]');

-- iOS Developer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-ios', 'iOS Developer', 'Mobile Development', '🍎',
 'Swift and SwiftUI, app architecture, persistence, networking, testing and App Store release.',
 ARRAY['Swift'], ARRAY['iOS Developer'],
 '[{"trackId": "track-swift", "priority": "High"}, {"trackId": "track-ios", "priority": "High"}, {"trackId": "track-mobile-ux", "priority": "Medium"}, {"trackId": "track-mobile-testing", "priority": "Medium"}, {"trackId": "track-app-store-deployment", "priority": "Medium"}]');

-- Cloud Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-cloud-engineer', 'Cloud Engineer', 'Cloud, DevOps & Platform', '☁️',
 'Linux, networking, one cloud provider in depth, Docker, Kubernetes, Terraform and cloud security.',
 ARRAY[], ARRAY['Cloud Engineer', 'Cloud Architect (junior)'],
 '[{"trackId": "track-linux", "priority": "High"}, {"trackId": "track-networking", "priority": "Medium"}, {"trackId": "track-aws", "priority": "High"}, {"trackId": "track-docker", "priority": "High"}, {"trackId": "track-kubernetes", "priority": "Medium"}, {"trackId": "track-terraform", "priority": "High"}, {"trackId": "track-cloud-security", "priority": "Medium"}, {"trackId": "track-observability", "priority": "Low"}]');

-- DevOps Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-devops-engineer', 'DevOps Engineer', 'Cloud, DevOps & Platform', '🚀',
 'CI/CD, containers, Kubernetes, infrastructure as code, observability and SRE practices.',
 ARRAY['Bash'], ARRAY['DevOps Engineer', 'Platform Engineer', 'SRE'],
 '[{"trackId": "track-linux", "priority": "High"}, {"trackId": "track-bash", "priority": "Medium"}, {"trackId": "track-docker", "priority": "High"}, {"trackId": "track-cicd", "priority": "High"}, {"trackId": "track-kubernetes", "priority": "High"}, {"trackId": "track-terraform", "priority": "Medium"}, {"trackId": "track-observability", "priority": "Medium"}, {"trackId": "track-sre", "priority": "Medium"}, {"trackId": "track-infrastructure-automation", "priority": "Low"}, {"trackId": "track-aws", "priority": "Low"}]');

-- Cybersecurity Engineer path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-cybersecurity', 'Cybersecurity Engineer', 'Cybersecurity', '🛡️',
 'Security foundations, networking, Linux security, web application security, IAM, cloud security, monitoring and incident response.',
 ARRAY[], ARRAY['Security Engineer', 'Security Analyst', 'AppSec Engineer'],
 '[{"trackId": "track-security-foundations", "priority": "High"}, {"trackId": "track-networking", "priority": "High"}, {"trackId": "track-linux-security", "priority": "High"}, {"trackId": "track-web-security", "priority": "High"}, {"trackId": "track-secure-coding", "priority": "Medium"}, {"trackId": "track-iam", "priority": "Medium"}, {"trackId": "track-cryptography", "priority": "Medium"}, {"trackId": "track-threat-modeling", "priority": "Medium"}, {"trackId": "track-cloud-security", "priority": "Medium"}, {"trackId": "track-vulnerability-assessment", "priority": "Medium"}, {"trackId": "track-security-monitoring", "priority": "Medium"}, {"trackId": "track-incident-response", "priority": "Low"}, {"trackId": "track-security-engineering", "priority": "Low"}]');

-- Computer Science Foundations path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-cs-foundations', 'Computer Science Foundations', 'Computer Science', '🎓',
 'A university-style core independent of any job: discrete maths, computer organisation, operating systems, networks, databases, algorithms and distributed systems.',
 ARRAY[], ARRAY['Student', 'Self-taught engineer filling gaps'],
 '[{"trackId": "track-discrete-math", "priority": "Medium"}, {"trackId": "track-computer-organization", "priority": "Medium"}, {"trackId": "track-operating-systems", "priority": "High"}, {"trackId": "track-computer-networks", "priority": "High"}, {"trackId": "track-dbms", "priority": "High"}, {"trackId": "track-algorithms", "priority": "High"}, {"trackId": "track-distributed-systems", "priority": "Medium"}, {"trackId": "track-software-engineering", "priority": "Low"}]');

-- Software Engineer Interview Preparation path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-swe-interviews', 'Software Engineer Interview Preparation', 'Software Engineering Interviews', '🎯',
 'The product-company loop: DSA, system design (HLD and LLD), CS fundamentals and mock interviews, in the language you code in.',
 ARRAY['Java', 'Python', 'JavaScript', 'C++'], ARRAY['SDE-1', 'SDE-2', 'Senior Software Engineer'],
 '[{"trackId": "track-dsa", "priority": "High"}, {"trackId": "track-hld", "priority": "High"}, {"trackId": "track-lld", "priority": "Medium"}, {"trackId": "track-cs", "priority": "Medium"}]');

-- Competitive Programming path
INSERT INTO career_paths_temp (id, title, family, icon, description, languages, roles, tracks) VALUES
('path-competitive-programming', 'Competitive Programming', 'Software Engineering Interviews', '🏁',
 'Algorithms and data structures at contest depth with C++ or Python, plus the theory behind them.',
 ARRAY['C++', 'Python'], ARRAY['Competitive programmer', 'Contest participant'],
 '[{"trackId": "track-cpp", "priority": "Medium"}, {"trackId": "track-dsa", "priority": "High"}, {"trackId": "track-algorithms", "priority": "High"}, {"trackId": "track-discrete-math", "priority": "Medium"}]');

-- Insert into main career_paths table
INSERT INTO career_paths (id, title, family, icon, description, languages, roles, tracks, source, status, version)
SELECT
  id,
  title,
  family,
  icon,
  description,
  languages,
  roles,
  tracks,
  'builtin',
  'published',
  1
FROM career_paths_temp;

-- Clean up temporary table
DROP TABLE career_paths_temp;

-- Log migration completion
INSERT INTO migration_log (migration_id, description, records_affected, status)
VALUES (
  '0004',
  'Populate career paths from application data',
  (SELECT COUNT(*) FROM career_paths WHERE source = 'builtin'),
  'COMPLETED'
);