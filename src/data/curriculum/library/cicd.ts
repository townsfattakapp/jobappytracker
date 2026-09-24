import { defineTrack } from '../define'

export const cicd = defineTrack({
  id: 'track-cicd',
  title: 'CI/CD',
  description: 'Continuous integration and delivery as engineers actually run it: pipeline anatomy, GitHub Actions in depth with GitLab CI and Jenkins for comparison, build, test and artifact stages, container image pipelines, security scanning, rolling, blue/green and canary deployments, GitOps, feature flags, versioning, pipeline performance and monorepos. Docker, Kubernetes and Terraform basics live in their own tracks.',
  family: 'Cloud, DevOps & Platform',
  kind: 'domain',
  icon: '🔁',
  tags: ['ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'gitops', 'argo cd', 'deployment', 'canary', 'feature flags', 'devops'],
  languages: ['Shell', 'YAML'],
  explainMode: 'devops',
  code: { label: 'shell, YAML, HCL or Dockerfile, whichever fits', id: 'bash', fixed: true },
  supports: { labs: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'CI Principles and Pipeline Anatomy',
      description: 'What a pipeline is for, what its stages are, and the working habits that make it pay off.',
      topics: [
        {
          title: 'Continuous integration principles',
          description: 'Why integrating to a shared mainline many times a day with an automated build and test on every push catches conflicts and regressions in minutes instead of weeks, and the discipline (small commits, green builds, fix-forward first) that makes it work.',
          concepts: ['Integrate small and often', 'Every push builds and tests', 'Keeping the mainline green', 'Fast feedback as the goal', 'CI versus CD versus continuous deployment'],
          quiz: [
            ['What is the difference between continuous delivery and continuous deployment?', 'Delivery keeps every build releasable with a manual release step; deployment releases every passing build automatically.'],
            ['What should happen first when the mainline build breaks?', 'Fixing or reverting it takes priority over new work.'],
            ['Why keep commits small in CI?', 'Small changes are easier to integrate, review and bisect when something fails.'],
          ],
        },
        {
          title: 'Anatomy of a pipeline',
          description: 'The stages almost every pipeline shares: checkout, dependency install, build, static checks, tests, packaging, publish and deploy, how they are ordered so cheap checks fail first, and how artifacts flow from one stage to the next.',
          concepts: ['Stages, jobs and steps', 'Fail-fast ordering of checks', 'Passing artifacts between stages', 'Triggers: push, PR, tag and schedule', 'Pipeline status as a merge gate'],
          quiz: [
            ['Why run linting before the test suite?', 'It is cheap and fails fast, so broken code never waits on slow tests.'],
            ['What connects a build stage to a deploy stage?', 'A published artifact (package or image) identified by version or digest.'],
          ],
          prereqs: ['Continuous integration principles'],
        },
        {
          title: 'Trunk-based development and branching for CI',
          description: 'How trunk-based development with short-lived branches and pull requests keeps integration continuous, why long-lived release branches multiply merge pain, and how branch protection rules enforce that only green, reviewed code lands.',
          concepts: ['Short-lived feature branches', 'Branch protection and required checks', 'Merge queues', 'Release branches versus tags', 'Git flow trade-offs'],
          quiz: [
            ['What does a merge queue solve?', 'It tests each PR against the latest main before merging so two green PRs cannot combine into a broken main.'],
            ['Why avoid long-lived branches with CI?', 'They defer integration, so conflicts and regressions accumulate.'],
          ],
          prereqs: ['Continuous integration principles'],
        },
        {
          title: 'Choosing a CI system',
          description: 'The trade-offs between hosted (GitHub Actions, GitLab CI, CircleCI, Buildkite) and self-managed (Jenkins, Tekton) systems: runner control, cost per minute, ecosystem, secrets handling and lock-in, and how to evaluate one against your repository layout and compliance needs.',
          concepts: ['Hosted versus self-managed runners', 'Pricing by minutes and concurrency', 'Plugin and marketplace ecosystems', 'Compliance and data residency needs'],
          quiz: [
            ['When does a self-hosted runner make sense?', 'When builds need special hardware, private network access or predictable cost at high volume.'],
            ['Name one risk of relying heavily on marketplace actions.', 'Supply chain risk from unpinned third-party code running with your secrets.'],
          ],
        },
      ],
    },
    {
      title: 'GitHub Actions',
      description: 'The most widely used hosted CI, from the first workflow file to reusable, cached, secure multi-job pipelines.',
      topics: [
        {
          title: 'Workflow files, triggers and events',
          description: 'How a YAML file under .github/workflows declares when it runs (push, pull_request, schedule, workflow_dispatch, release), how filters on branches, paths and tags narrow it, and how the github context exposes the event payload to steps.',
          concepts: ['on: push, pull_request and schedule', 'Branch, tag and path filters', 'workflow_dispatch inputs', 'The github and env contexts', 'Expressions with ${{ }}'],
          quiz: [
            ['Which trigger lets a person run a workflow manually with inputs?', 'workflow_dispatch.'],
            ['What is the difference between pull_request and pull_request_target?', 'pull_request_target runs in the base repo context with secrets, so it is dangerous with untrusted PR code.'],
            ['How do you skip a workflow when only docs change?', 'paths-ignore: ["docs/**"] on the trigger.'],
          ],
        },
        {
          title: 'Jobs, steps, runners and dependencies',
          description: 'How jobs run in parallel on fresh runners unless needs: orders them, how steps share a filesystem but not a shell, how outputs pass between steps and jobs, and how runs-on picks ubuntu, windows, macos or a labelled self-hosted machine.',
          concepts: ['Jobs run in parallel by default', 'needs: for job ordering', 'Step outputs and job outputs', 'runs-on and runner images', 'if: conditions and continue-on-error'],
          quiz: [
            ['Do two jobs in one workflow share a filesystem?', 'No, each job runs on a fresh runner; share via artifacts or outputs.'],
            ['How does a later job read a value from an earlier one?', 'Declare it in the earlier job outputs and read needs.<job>.outputs.<name>.'],
          ],
          prereqs: ['Workflow files, triggers and events'],
        },
        {
          title: 'Matrix builds',
          description: 'Running one job definition across combinations of versions, operating systems or shards with strategy.matrix, adding include and exclude entries for special cases, and using fail-fast and max-parallel to control cost and noise.',
          concepts: ['strategy.matrix axes', 'include and exclude entries', 'fail-fast and max-parallel', 'Sharding tests across matrix legs'],
          quiz: [
            ['What does fail-fast: true do?', 'Cancels remaining matrix jobs as soon as one fails.'],
            ['How many jobs does a matrix of 3 Node versions and 2 OSes create?', 'Six.'],
          ],
          prereqs: ['Jobs, steps, runners and dependencies'],
        },
        {
          title: 'Caching dependencies and build outputs',
          description: 'How actions/cache keys a tarball on a hash of lockfiles, why restore-keys give partial hits, what the 10 GB per-repo limit and eviction mean, and when setup-node or setup-python built-in caching is enough versus caching Docker layers or Gradle outputs.',
          concepts: ['Cache keys from lockfile hashes', 'restore-keys fallbacks', 'Cache scope and branch isolation', 'setup-* action built-in caching', 'Cache limits and eviction'],
          quiz: [
            ['Why hash the lockfile in the cache key?', 'So the cache invalidates exactly when dependencies change.'],
            ['Can a feature branch read a cache written by main?', 'Yes, caches from the default branch are readable by other branches.'],
          ],
          prereqs: ['Jobs, steps, runners and dependencies'],
        },
        {
          title: 'Secrets, variables and OIDC to cloud',
          description: 'Where repository, environment and organisation secrets live, how they are masked in logs, why fork PRs cannot read them, and how OIDC lets a job assume an AWS, Azure or GCP role with a short-lived token instead of storing long-lived keys.',
          concepts: ['Repository, environment and org secrets', 'Log masking and its limits', 'Secrets and forked pull requests', 'OIDC federation to cloud roles', 'Minimal GITHUB_TOKEN permissions'],
          quiz: [
            ['Why prefer OIDC over stored cloud keys?', 'Tokens are short-lived and scoped to the workflow, so nothing long-lived can leak.'],
            ['What claim usually restricts which repo can assume the cloud role?', 'The sub claim, e.g. repo:org/name:ref:refs/heads/main.'],
            ['What does permissions: contents: read at workflow level do?', 'Restricts GITHUB_TOKEN to read-only access unless a job raises it.'],
          ],
        },
        {
          title: 'Reusable workflows and composite actions',
          description: 'Two ways to stop copy-pasting YAML: reusable workflows called with workflow_call that run whole jobs with inputs and secrets, and composite actions that bundle steps, plus when to write a JavaScript or Docker action instead.',
          concepts: ['workflow_call inputs and secrets', 'Composite actions in action.yml', 'JavaScript and Docker actions', 'Versioning shared workflows by tag', 'Organisation-wide starter workflows'],
          quiz: [
            ['What is the key difference between a reusable workflow and a composite action?', 'A reusable workflow runs as jobs on its own runners; a composite action runs as steps inside the caller job.'],
            ['How do you pass a secret to a reusable workflow?', 'With secrets: inherit or an explicit secrets: block on the caller.'],
          ],
          prereqs: ['Jobs, steps, runners and dependencies'],
        },
        {
          title: 'Self-hosted runners and concurrency',
          description: 'Registering runners on your own VMs or Kubernetes (actions-runner-controller), labelling and grouping them, why ephemeral runners are safer than persistent ones, and using concurrency groups to cancel superseded runs and serialise deployments.',
          concepts: ['Registering and labelling runners', 'actions-runner-controller on Kubernetes', 'Ephemeral runners for isolation', 'concurrency groups and cancel-in-progress', 'Runner security with public repos'],
          quiz: [
            ['Why should self-hosted runners never serve public repositories?', 'Any fork PR could run arbitrary code on your infrastructure.'],
            ['What does cancel-in-progress: true in a concurrency group do?', 'Cancels an in-flight run for the same group when a new one starts.'],
          ],
          prereqs: ['Jobs, steps, runners and dependencies'],
        },
      ],
    },
    {
      title: 'GitLab CI and Jenkins',
      description: 'Enough of the two other big systems to read their pipelines, migrate between them and answer comparison questions.',
      topics: [
        {
          title: 'GitLab CI: stages, jobs and runners',
          description: 'How .gitlab-ci.yml declares stages and jobs, how rules: and only/except select when jobs run, how GitLab runners with executors (shell, docker, kubernetes) pick up jobs, and how artifacts, cache and needs: build a DAG pipeline.',
          concepts: ['.gitlab-ci.yml stages and jobs', 'rules: and workflow: conditions', 'Runner executors', 'DAG pipelines with needs:', 'include: and CI templates'],
          quiz: [
            ['What is the GitLab equivalent of a GitHub Actions reusable workflow?', 'include: with templates, or extends: for job inheritance.'],
            ['What does needs: change in a GitLab pipeline?', 'Jobs start as soon as their needed jobs finish instead of waiting for the whole previous stage.'],
          ],
          prereqs: ['Anatomy of a pipeline'],
        },
        {
          title: 'GitLab environments, review apps and Auto DevOps',
          description: 'How GitLab ties jobs to environments with deployment tracking and stop jobs, spins up per-merge-request review apps, protects production environments with approvals, and what Auto DevOps generates for you out of the box.',
          concepts: ['environment: and deployment tracking', 'Review apps per merge request', 'Protected environments and approvals', 'Auto DevOps defaults'],
          quiz: [
            ['What is a review app?', 'A temporary environment deployed for a merge request and torn down when it closes.'],
            ['How do you stop a review app automatically?', 'Define on_stop with a job that runs when the environment is stopped or the branch is deleted.'],
          ],
          prereqs: ['GitLab CI: stages, jobs and runners'],
        },
        {
          title: 'Jenkins: pipelines, agents and shared libraries',
          description: 'The controller-and-agent model, declarative versus scripted Jenkinsfile syntax, how stages, agents and post blocks work, how shared libraries centralise pipeline logic, and why plugin sprawl and controller upgrades are the main operational burden.',
          concepts: ['Controller and agent architecture', 'Declarative Jenkinsfile syntax', 'Shared libraries with vars/ and src/', 'Credentials binding', 'Plugin management and upgrades'],
          quiz: [
            ['Where does the Jenkinsfile live?', 'In the repository root, versioned with the code.'],
            ['What is a Jenkins shared library?', 'A Git repo of Groovy steps and classes that pipelines load with @Library.'],
            ['Declarative or scripted: which is recommended for most teams?', 'Declarative, for its fixed structure, validation and Blue Ocean support.'],
          ],
          prereqs: ['Anatomy of a pipeline'],
        },
      ],
    },
    {
      title: 'Build, Test and Artifacts',
      description: 'The stages that turn a commit into a verified, versioned, stored artifact.',
      topics: [
        {
          title: 'Build stages and reproducible builds',
          description: 'Making a build produce the same output from the same input: pinned toolchains, lockfiles, hermetic containers, deterministic timestamps and build metadata (commit SHA, build number) embedded so any artifact can be traced back to its source.',
          concepts: ['Pinned toolchains and lockfiles', 'Building inside a fixed container image', 'Embedding commit and build metadata', 'Deterministic output and SOURCE_DATE_EPOCH'],
          quiz: [
            ['Why embed the commit SHA in the artifact?', 'To trace any running version back to the exact source that built it.'],
            ['What is a hermetic build?', 'One that depends only on declared inputs, not on the host machine state.'],
          ],
          prereqs: ['Anatomy of a pipeline'],
        },
        {
          title: 'Test stages: unit, integration and end-to-end in CI',
          description: 'Layering tests so unit tests gate every push, integration tests run against service containers (Postgres, Redis via services: or Testcontainers), and slower end-to-end suites run on merge or nightly, with reports published as JUnit XML and coverage.',
          concepts: ['Test pyramid in pipeline terms', 'Service containers for integration tests', 'Testcontainers in CI', 'JUnit reports and coverage upload', 'Nightly and on-merge suites'],
          quiz: [
            ['How do you run Postgres for integration tests in GitHub Actions?', 'Declare it under services: in the job and connect on localhost.'],
            ['Why publish JUnit XML from CI?', 'The CI UI can annotate failures and track flaky or slow tests over time.'],
          ],
          prereqs: ['Build stages and reproducible builds'],
        },
        {
          title: 'Flaky tests and test quarantine',
          description: 'Why nondeterministic tests destroy trust in CI, how to detect them (rerun analysis, flake dashboards), the quarantine pattern that removes them from the merge gate without deleting them, and the usual root causes: shared state, timing, ordering and network.',
          concepts: ['Detecting flakes with rerun statistics', 'Quarantine versus deletion', 'Root causes: state, timing, order', 'Retry policies and their limits'],
          quiz: [
            ['Why is retrying failed tests automatically dangerous?', 'It hides real intermittent bugs and slows the pipeline.'],
            ['What is a test quarantine?', 'A separate non-blocking suite where known flaky tests run until fixed.'],
          ],
          prereqs: ['Test stages: unit, integration and end-to-end in CI'],
        },
        {
          title: 'Artifact management and registries',
          description: 'Storing build outputs in a versioned registry (Artifactory, Nexus, GitHub Packages, cloud artifact registries) rather than rebuilding per environment, retention and cleanup policies, immutability of released versions, and promoting one artifact through environments.',
          concepts: ['Build once, deploy many', 'Artifact registries: Artifactory, Nexus, GitHub Packages', 'Immutable versions and retention', 'Promotion between repositories', 'Proxying upstream package registries'],
          quiz: [
            ['Why build once and promote rather than rebuild per environment?', 'The bits tested in staging are exactly the bits shipped to production.'],
            ['What does a proxy repository in Nexus or Artifactory do?', 'Caches upstream packages so builds survive upstream outages and are auditable.'],
          ],
          prereqs: ['Build stages and reproducible builds'],
        },
        {
          title: 'Container image pipelines',
          description: 'Building images in CI with docker buildx or Kaniko, multi-stage Dockerfiles to keep runtime images small, layer caching via registry cache exports, tagging by commit SHA and semver, pinning deployments to digests, and multi-architecture builds. Dockerfile basics are in the Docker track.',
          concepts: ['buildx and BuildKit in CI', 'Registry-backed layer cache', 'Tagging by SHA and semver', 'Deploying by digest', 'Multi-arch builds with QEMU'],
          quiz: [
            ['Why deploy an image by digest rather than tag?', 'Tags are mutable; a digest pins the exact content.'],
            ['What does --cache-from type=registry give a CI build?', 'Layer reuse across runners by pulling cache from the registry.'],
            ['Why use Kaniko instead of docker build in Kubernetes runners?', 'It builds without a Docker daemon or privileged mode.'],
          ],
          prereqs: ['Artifact management and registries'],
        },
      ],
    },
    {
      title: 'Security in the Pipeline',
      description: 'Shifting scanning left and hardening the pipeline itself, which is now a prime attack target.',
      topics: [
        {
          title: 'SAST in the pipeline',
          description: 'Static analysis with Semgrep, CodeQL, SonarQube or Bandit on every pull request, tuning rule sets to cut noise, surfacing findings as PR annotations, and choosing between blocking and advisory severities so the gate is respected rather than bypassed.',
          concepts: ['Semgrep rules and CI integration', 'CodeQL code scanning', 'Blocking versus advisory findings', 'Baselines and suppressions'],
          quiz: [
            ['Why start SAST with a baseline?', 'So existing findings do not block every PR; only new findings fail the gate.'],
            ['What is the risk of making every SAST finding blocking?', 'Teams disable or bypass the scanner when noise blocks legitimate work.'],
          ],
          prereqs: ['Anatomy of a pipeline'],
        },
        {
          title: 'Dependency and licence scanning',
          description: 'Catching vulnerable or badly licensed third-party packages with Dependabot, Renovate, OSV-Scanner, Snyk or Trivy fs, automating upgrade pull requests, and handling the flood of alerts with severity thresholds, reachability and grouping.',
          concepts: ['Dependabot and Renovate upgrade PRs', 'OSV and CVE databases', 'Severity thresholds and reachability', 'Licence policy checks', 'Lockfile-based scanning'],
          quiz: [
            ['What does Renovate do that Dependabot does not, typically?', 'Richer grouping, scheduling and config for batching upgrades.'],
            ['Why scan the lockfile rather than the manifest?', 'The lockfile lists the exact transitive versions that actually ship.'],
          ],
          prereqs: ['SAST in the pipeline'],
        },
        {
          title: 'Container image scanning and SBOMs',
          description: 'Scanning built images with Trivy or Grype for OS and language package CVEs, generating a software bill of materials with Syft in SPDX or CycloneDX, failing on critical findings, and choosing minimal base images (distroless, Alpine, Chainguard) to shrink the attack surface.',
          concepts: ['Trivy and Grype image scans', 'SBOM generation with Syft', 'SPDX and CycloneDX formats', 'Minimal base images', 'Fail thresholds and ignore files'],
          quiz: [
            ['What is an SBOM used for after release?', 'Answering quickly whether a newly disclosed CVE affects a shipped image.'],
            ['Why do distroless images reduce findings?', 'They contain no shell or package manager, so far fewer packages carry CVEs.'],
          ],
          prereqs: ['Container image pipelines'],
        },
        {
          title: 'Supply chain security: signing and provenance',
          description: 'Signing images and artifacts with Sigstore cosign using keyless OIDC identities, attaching SLSA provenance attestations that record how and where the artifact was built, and verifying signatures at deploy time with admission policies.',
          concepts: ['cosign keyless signing', 'SLSA levels and provenance', 'Attestations attached to images', 'Verifying signatures at admission', 'Rekor transparency log'],
          quiz: [
            ['What does SLSA provenance record?', 'The builder, source, and build steps that produced an artifact.'],
            ['What does keyless signing use instead of a private key file?', 'A short-lived certificate tied to an OIDC identity, recorded in Rekor.'],
          ],
          prereqs: ['Container image scanning and SBOMs'],
        },
        {
          title: 'Hardening the pipeline itself',
          description: 'Treating the pipeline as production: least-privilege tokens, pinning actions to commit SHAs, avoiding script injection through untrusted inputs like PR titles, isolating fork builds, protecting the runner, and auditing who can change workflow files.',
          concepts: ['Pinning actions to SHAs', 'Script injection via untrusted inputs', 'Least-privilege job tokens', 'Fork and untrusted PR isolation', 'Protecting workflow files with CODEOWNERS'],
          quiz: [
            ['Why is run: echo "${{ github.event.pull_request.title }}" dangerous?', 'The title is interpolated into the shell, so a crafted title runs arbitrary commands.'],
            ['How do you stop a compromised action tag from affecting you?', 'Pin uses: to a full commit SHA and let Dependabot update it.'],
          ],
          prereqs: ['Secrets, variables and OIDC to cloud'],
        },
      ],
    },
    {
      title: 'Deployment Strategies and Environments',
      description: 'Getting the artifact into production safely, with a way back.',
      topics: [
        {
          title: 'Rolling deployments',
          description: 'Replacing instances a few at a time so capacity never drops to zero, how maxSurge and maxUnavailable tune the pace, why readiness checks gate each step, and the version-skew window where old and new code run side by side.',
          concepts: ['maxSurge and maxUnavailable', 'Readiness gating each batch', 'Version skew during rollout', 'Rolling back a rolling update'],
          quiz: [
            ['What must be true of your API during a rolling update?', 'Old and new versions must coexist, so changes must be backward compatible.'],
            ['What does maxUnavailable: 0 guarantee?', 'Capacity never drops below the desired count during the rollout.'],
          ],
          prereqs: ['Artifact management and registries'],
        },
        {
          title: 'Blue/green deployments',
          description: 'Running two full environments and switching traffic at the load balancer or DNS in one step, which gives instant rollback and no mixed versions at the cost of double capacity and careful handling of database and session state.',
          concepts: ['Two identical environments', 'Switching at load balancer or DNS', 'Instant rollback by switching back', 'Database and state pitfalls', 'Cost of double capacity'],
          quiz: [
            ['What is the main advantage of blue/green over rolling?', 'Instant, clean rollback and no period of mixed versions.'],
            ['Why is DNS a weak switch for blue/green?', 'Client and resolver caching means traffic moves slowly and unevenly.'],
          ],
          prereqs: ['Rolling deployments'],
        },
        {
          title: 'Canary releases and progressive delivery',
          description: 'Sending a small slice of traffic to the new version, comparing its error rate and latency against the baseline, and promoting or aborting automatically with Argo Rollouts or Flagger driven by Prometheus metrics.',
          concepts: ['Traffic splitting by weight or header', 'Metric-based analysis of the canary', 'Argo Rollouts and Flagger', 'Automatic promotion and abort', 'Canary versus A/B testing'],
          quiz: [
            ['What decides whether a canary is promoted?', 'Analysis of metrics such as error rate and latency against thresholds or the baseline.'],
            ['What infrastructure does a weighted canary usually need?', 'A load balancer, ingress or service mesh that can split traffic.'],
          ],
          prereqs: ['Rolling deployments'],
        },
        {
          title: 'Environments, gates and approvals',
          description: 'Modelling dev, staging and production as environments with their own secrets, protection rules, required reviewers and wait timers, so a deploy to production needs a human sign-off while lower environments deploy automatically.',
          concepts: ['Environment-scoped secrets and variables', 'Required reviewers and wait timers', 'Deployment branch restrictions', 'Promotion pipelines across environments', 'Audit trail of who approved what'],
          quiz: [
            ['How does GitHub Actions pause before production?', 'A protected environment with required reviewers halts the job until approval.'],
            ['Why give each environment its own secrets?', 'A leak or mistake in staging cannot reach production credentials.'],
          ],
          prereqs: ['Secrets, variables and OIDC to cloud'],
        },
        {
          title: 'Database migrations in deployments',
          description: 'Why schema changes are the hardest part of deploying: the expand-and-contract pattern for backward-compatible migrations, running migrations as a separate step or job before the app rolls out, and keeping rollback possible when data has changed.',
          concepts: ['Expand and contract pattern', 'Migrations as a pre-deploy job', 'Backward-compatible schema changes', 'Rollback with data changes', 'Migration tools: Flyway, Liquibase, Alembic'],
          quiz: [
            ['Why not rename a column in one deploy?', 'Old code still running would break; add the new column, migrate, switch code, then drop the old.'],
            ['Where should migrations run relative to the new app version?', 'Before it, and they must not break the old version still serving.'],
          ],
          prereqs: ['Rolling deployments'],
        },
        {
          title: 'Rollbacks and hotfix paths',
          description: 'Designing the way back before you need it: redeploying the previous artifact by version, automatic rollback on failed health checks, hotfix branches cut from the released tag, and the difference between rolling back code and rolling back a bad migration.',
          concepts: ['Redeploying the previous artifact', 'Automatic rollback on health failure', 'Hotfix branch from a release tag', 'Rollback versus roll-forward'],
          quiz: [
            ['What makes a rollback fast?', 'The previous artifact is still in the registry and deploying it is a normal pipeline run.'],
            ['When is roll-forward better than rollback?', 'When the fix is small and the previous version has its own problems or incompatible data.'],
          ],
          prereqs: ['Database migrations in deployments'],
        },
      ],
    },
    {
      title: 'GitOps, Feature Flags and Releases',
      description: 'Declarative delivery, decoupling deploy from release, and versioning what you ship.',
      topics: [
        {
          title: 'GitOps delivery with Argo CD and Flux',
          description: 'The GitOps model where a controller in the cluster continuously reconciles live state to manifests in a Git repo, so CI only updates a version in Git and the cluster pulls the change, giving an audit trail, drift detection and easy rollback via git revert.',
          concepts: ['Pull-based reconciliation loop', 'Argo CD applications and sync', 'Flux kustomizations and image automation', 'Drift detection and self-heal', 'Rollback with git revert'],
          quiz: [
            ['In GitOps, what does the CI pipeline do to deploy?', 'It commits the new image tag to the config repo; the controller applies it.'],
            ['What does Argo CD report when someone kubectl-edits a resource?', 'OutOfSync, and it can automatically revert to the Git state with self-heal.'],
          ],
          prereqs: ['Container image pipelines'],
        },
        {
          title: 'Feature flags and decoupling deploy from release',
          description: 'Shipping code dark behind a flag so deployment and release are separate decisions, targeting rules and percentage rollouts, kill switches for incidents, the OpenFeature standard and tools like LaunchDarkly, Unleash and Flagsmith, and cleaning up stale flags.',
          concepts: ['Deploy versus release', 'Targeting rules and percentage rollouts', 'Kill switches', 'OpenFeature and flag SDKs', 'Flag debt and cleanup'],
          quiz: [
            ['How does a feature flag reduce deployment risk?', 'Code ships disabled and is turned on gradually, so rollback is a flag flip.'],
            ['What is flag debt?', 'Stale flags left in code after a rollout is complete, adding complexity and risk.'],
          ],
          prereqs: ['Canary releases and progressive delivery'],
        },
        {
          title: 'Semantic versioning and release tagging',
          description: 'What major, minor and patch promise to consumers, how pre-release and build metadata work, why tags rather than branches mark releases, and how CI can derive the version from tags or from commit history.',
          concepts: ['MAJOR.MINOR.PATCH semantics', 'Pre-release and build metadata', 'Git tags as the release marker', 'Deriving versions in CI', 'CalVer as an alternative'],
          quiz: [
            ['What does a major version bump signal?', 'A breaking change for consumers.'],
            ['What is 2.1.0-rc.1?', 'A pre-release candidate that sorts before 2.1.0.'],
          ],
          prereqs: ['Trunk-based development and branching for CI'],
        },
        {
          title: 'Conventional commits and automated changelogs',
          description: 'Structuring commit messages as feat:, fix: and BREAKING CHANGE so tools like semantic-release, release-please or git-cliff can compute the next version, write the changelog and cut the GitHub release without a human editing files.',
          concepts: ['Conventional commit types', 'semantic-release and release-please', 'Changelog generation', 'Release PRs versus direct tagging', 'Enforcing message format with commitlint'],
          quiz: [
            ['Which commit prefix triggers a minor version bump?', 'feat:.'],
            ['How does release-please differ from semantic-release?', 'It opens a release PR you merge to cut the release instead of releasing directly from CI.'],
          ],
          prereqs: ['Semantic versioning and release tagging'],
        },
        {
          title: 'Publishing packages from CI',
          description: 'Releasing libraries to npm, PyPI, Maven Central or a private registry from a tag-triggered workflow, using trusted publishing (OIDC) where the registry supports it, provenance attestations, and dry runs to catch a broken publish before it is immutable.',
          concepts: ['Tag-triggered publish workflows', 'Trusted publishing with OIDC', 'npm and PyPI provenance', 'Dry-run publishes', 'Immutable published versions'],
          quiz: [
            ['What is PyPI trusted publishing?', 'PyPI accepts an OIDC token from a configured GitHub workflow instead of an API token.'],
            ['Why dry-run a publish?', 'Published versions cannot be replaced, so mistakes are permanent.'],
          ],
          prereqs: ['Conventional commits and automated changelogs'],
        },
      ],
    },
    {
      title: 'Pipeline Engineering',
      description: 'Making pipelines fast, testable and observable at scale.',
      topics: [
        {
          title: 'Pipeline performance and parallelism',
          description: 'Finding where the minutes go with per-step timings, then cutting them: parallel jobs, test sharding, dependency and layer caching, shallow clones, skipping unchanged work, bigger runners for hot paths, and cancelling superseded runs.',
          concepts: ['Measuring step durations', 'Test sharding and parallel jobs', 'Shallow and sparse checkouts', 'Skipping work via path filters', 'Larger runners for critical paths'],
          quiz: [
            ['What is the first step to speed up a slow pipeline?', 'Measure which steps take the time; usually one or two dominate.'],
            ['Why use fetch-depth: 1?', 'A shallow clone avoids downloading the whole history on every run.'],
          ],
          prereqs: ['Caching dependencies and build outputs'],
        },
        {
          title: 'Monorepo pipelines',
          description: 'Building only what changed in a repository with many packages: affected-graph tools (Nx, Turborepo, Bazel, Pants), path filters as a simpler first step, remote build caches, and one workflow that fans out into per-package jobs.',
          concepts: ['Affected detection from the dependency graph', 'Path filters as a first step', 'Remote build caches', 'Dynamic job fan-out', 'Ownership and CODEOWNERS per package'],
          quiz: [
            ['How does Nx decide which projects to test on a PR?', 'It compares the project graph against the base commit and finds affected projects.'],
            ['What is the weakness of path filters alone?', 'They do not understand dependencies, so a shared library change may not test its consumers.'],
          ],
          prereqs: ['Pipeline performance and parallelism'],
        },
        {
          title: 'Testing pipeline-as-code',
          description: 'Catching YAML mistakes before they hit main: actionlint and yamllint, running workflows locally with act, GitLab CI lint, Jenkins pipeline unit tests, and testing shared workflows in a sandbox repository before rolling them out.',
          concepts: ['actionlint and yamllint', 'Running workflows locally with act', 'Jenkins Pipeline Unit', 'Sandbox repos for shared workflows', 'Pipeline changes under code review'],
          quiz: [
            ['What does actionlint catch?', 'Syntax errors, unknown contexts, shell issues and invalid runner labels in workflow files.'],
            ['What limitation does act have?', 'It emulates runners in Docker, so macOS jobs and some services behave differently.'],
          ],
          prereqs: ['Reusable workflows and composite actions'],
        },
        {
          title: 'Pipeline observability and DORA metrics',
          description: 'Exporting pipeline durations, failure rates and queue times to dashboards, tracing long builds, and reporting the four DORA metrics (deployment frequency, lead time, change failure rate, time to restore) from pipeline and incident data to show whether delivery is improving.',
          concepts: ['Pipeline duration and failure dashboards', 'Queue time and runner utilisation', 'The four DORA metrics', 'Deriving lead time from commits and deploys', 'Using metrics without gaming them'],
          quiz: [
            ['Name the four DORA metrics.', 'Deployment frequency, lead time for changes, change failure rate and time to restore service.'],
            ['Why track runner queue time?', 'Long queues mean capacity, not code, is the bottleneck.'],
          ],
          prereqs: ['Pipeline performance and parallelism'],
        },
        {
          title: 'Ephemeral preview environments',
          description: 'Spinning up a full environment per pull request with its own URL so reviewers and QA can test the change, using namespaces on Kubernetes or platforms like Vercel, tearing it down on close, and seeding data so the preview is useful.',
          concepts: ['Per-PR environment lifecycle', 'Namespace-per-PR on Kubernetes', 'Dynamic URLs and wildcard DNS', 'Seeding test data', 'Cost controls and auto-teardown'],
          quiz: [
            ['What triggers preview environment teardown?', 'The pull request closing or merging.'],
            ['Why do previews need a wildcard DNS entry?', 'Each PR gets its own hostname without manual DNS changes.'],
          ],
          prereqs: ['GitOps delivery with Argo CD and Flux'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'End-to-end pipelines to build and the questions interviewers ask about them.',
      topics: [
        {
          title: 'Project: full GitHub Actions pipeline for a web service',
          description: 'Build a workflow for a containerised API that lints, runs unit tests with a Postgres service container, builds a multi-arch image with registry caching, scans it with Trivy, signs it with cosign, pushes it by digest and deploys to a staging environment via OIDC with a required approval for production.',
          concepts: ['Design the stages and job graph', 'Add test services and caching', 'Build, scan and sign the image', 'Deploy through environments with OIDC'],
          quiz: [
            ['Why split lint, test and build into separate jobs?', 'They run in parallel and failures point at one stage.'],
            ['How is the production job prevented from running without review?', 'A protected environment with required reviewers.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: GitOps delivery with canary rollouts',
          description: 'Set up a config repository watched by Argo CD, have CI bump the image tag with a commit, and deploy the service with an Argo Rollouts canary that promotes on a Prometheus error-rate query and aborts on failure, then demonstrate rollback with git revert.',
          concepts: ['Create the config repo and Argo CD app', 'Automate the tag bump from CI', 'Write the Rollout and analysis template', 'Break it and roll back'],
          quiz: [
            ['What does CI commit to the config repo?', 'Only the new image tag or digest, not the whole manifest.'],
            ['How do you prove the canary abort works?', 'Deploy a version that returns errors and watch analysis fail and traffic return to stable.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: monorepo pipeline with affected builds',
          description: 'Take a monorepo of three services and two shared libraries, wire up Nx or Turborepo affected detection, fan out per-package jobs dynamically, add a remote cache, and show that a change to one library tests only its consumers while a docs-only change runs nothing.',
          concepts: ['Set up the workspace and graph', 'Compute affected packages in CI', 'Fan out jobs dynamically', 'Add remote caching and measure'],
          quiz: [
            ['How do you generate the job list at runtime?', 'One job outputs a JSON list and a matrix job reads it with fromJSON.'],
            ['What should a docs-only change trigger?', 'Nothing beyond a quick lint, proving the filters work.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: automated releases with changelogs and package publishing',
          description: 'Adopt conventional commits enforced by commitlint, use release-please to open release PRs that bump versions and write the changelog, publish the package to npm or PyPI with trusted publishing on merge, and attach provenance and a GitHub release with the built artifacts.',
          concepts: ['Enforce commit conventions', 'Configure release-please', 'Publish with OIDC trusted publishing', 'Attach provenance and release notes'],
          quiz: [
            ['What happens when a release PR is merged?', 'A tag and GitHub release are created and the publish workflow runs.'],
            ['Where does the changelog text come from?', 'Commit messages grouped by conventional commit type since the last release.'],
          ],
          style: 'project',
        },
        {
          title: 'CI/CD design questions',
          description: 'How to answer design prompts like "design the delivery pipeline for a microservice platform": stages, gates, artifact flow, environments, deployment strategy, rollback, security scanning, and the trade-offs you would raise before choosing.',
          concepts: ['Walking through a pipeline design', 'Choosing a deployment strategy', 'Explaining rollback and safety nets', 'Discussing pipeline security', 'Trade-offs of GitOps'],
          quiz: [
            ['When would you choose blue/green over canary?', 'When traffic cannot be split or you need instant full rollback and can afford double capacity.'],
            ['What would you put between staging and production?', 'Automated smoke tests plus an approval gate, and a canary for the first slice of traffic.'],
          ],
          style: 'reading',
        },
        {
          title: 'CI/CD interview questions',
          description: 'The questions engineers get asked about delivery: CI versus CD, how caching works, why build once and promote, how to handle secrets, flaky tests, migrations, GitOps versus push deploys, and how DORA metrics are measured.',
          concepts: ['Definitions and principles questions', 'GitHub Actions specifics', 'Deployment strategy comparisons', 'Security and secrets questions', 'Metrics and improvement questions'],
          quiz: [
            ['What is the risk of running untrusted PR code with secrets?', 'The PR can exfiltrate secrets or tamper with the build.'],
            ['How does GitOps differ from a push-based deploy?', 'A controller pulls desired state from Git and reconciles, instead of CI pushing changes to the cluster.'],
            ['What is lead time for changes?', 'Time from a commit to that change running in production.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
