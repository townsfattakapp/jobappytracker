import { defineTrack } from '../define'

export const goBackend = defineTrack({
  id: 'track-go-backend',
  title: 'Go Backend Development',
  description: 'Production HTTP services in Go: net/http and the 1.22 ServeMux, chi and Gin, handlers and middleware, JSON and validation, database/sql, sqlx, pgx and GORM, migrations, authentication, configuration, slog, graceful shutdown, concurrency patterns, httptest and table tests, observability, Docker and deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🐹',
  tags: ['go', 'golang', 'net/http', 'chi', 'gin', 'pgx', 'sqlc', 'backend', 'microservices'],
  languages: ['Go'],
  explainMode: 'concept',
  code: { label: 'Go', id: 'go', fixed: true },
  supports: { coding: true, project: true, labs: true },
  prerequisites: ['track-go'],
  style: 'code',
  categories: [
    {
      title: 'net/http Foundations',
      description: 'The standard library server is enough for most services; everything else builds on it.',
      topics: [
        {
          title: 'The net/http server model',
          description: 'http.Server accepts connections and runs each request in its own goroutine, so handlers must be safe for concurrent use; ListenAndServe versus a configured Server with read, write and idle timeouts that stop slow clients pinning resources.',
          concepts: ['One goroutine per request', 'http.Server fields and timeouts', 'ListenAndServe versus Server.Serve', 'Keep-alive and idle connections'],
          quiz: [
            ['Why set ReadHeaderTimeout on http.Server?', 'Without it a slow client can hold a connection open indefinitely (slowloris).'],
            ['Can two requests run a handler at the same time?', 'Yes, each request runs in its own goroutine, so shared state needs synchronisation.'],
          ],
        },
        {
          title: 'Handlers, HandlerFunc and ServeMux',
          description: 'The http.Handler interface with one method, HandlerFunc as the adapter that turns a function into a Handler, and ServeMux as the router that matches paths and dispatches; understanding these three explains every Go web framework.',
          concepts: ['The http.Handler interface', 'HandlerFunc adapter', 'http.NewServeMux and Handle', 'Handler composition and decorators'],
          quiz: [
            ['What is the signature of ServeHTTP?', 'ServeHTTP(w http.ResponseWriter, r *http.Request).'],
            ['What does http.HandlerFunc(f) do?', 'Converts a plain function with the right signature into a Handler.'],
          ],
          prereqs: ['The net/http server model'],
        },
        {
          title: 'Go 1.22 ServeMux patterns',
          description: 'The enhanced mux matches methods and path wildcards ("GET /users/{id}"), exposes r.PathValue, and has precedence rules for overlapping patterns, which removes the need for a third-party router in many services.',
          concepts: ['Method and path patterns', 'Wildcards and r.PathValue', 'Trailing slash and {$}', 'Precedence and conflict panics', 'Host-specific patterns'],
          quiz: [
            ['How do you read the id from "GET /users/{id}"?', 'r.PathValue("id").'],
            ['What happens when two patterns conflict ambiguously?', 'Registration panics at startup.'],
          ],
          prereqs: ['Handlers, HandlerFunc and ServeMux'],
        },
        {
          title: 'Request context and values',
          description: 'Every request carries a context.Context that is cancelled when the client disconnects; middleware stores per-request data (user, request id) with typed keys, and handlers pass ctx to every downstream call.',
          concepts: ['r.Context and client disconnects', 'context.WithValue and typed keys', 'Propagating ctx to database and HTTP calls', 'Deriving timeouts per request'],
          quiz: [
            ['Why use an unexported struct type as a context key?', 'To prevent collisions with keys from other packages.'],
            ['When is r.Context() cancelled?', 'When the client disconnects, the handler returns or the server shuts down.'],
          ],
          prereqs: ['Handlers, HandlerFunc and ServeMux'],
        },
        {
          title: 'Writing responses',
          description: 'Header order rules (set headers before WriteHeader, WriteHeader before Write), status codes, streaming with http.Flusher, serving files, and why writing after an error has been sent corrupts responses.',
          concepts: ['Header, WriteHeader, Write ordering', 'http.Error and status helpers', 'Streaming with Flusher', 'ServeFile and FileServer', 'Content-Length and chunked encoding'],
          quiz: [
            ['What happens if you set a header after calling Write?', 'It is silently ignored because headers were already sent.'],
            ['What does the superfluous WriteHeader warning mean?', 'WriteHeader was called twice; only the first status is sent.'],
          ],
          prereqs: ['Handlers, HandlerFunc and ServeMux'],
        },
      ],
    },
    {
      title: 'Routers and Middleware',
      topics: [
        {
          title: 'chi: routers, groups and URL params',
          description: 'chi is a lightweight router compatible with net/http Handler: Route groups, Mount for sub-routers, chi.URLParam, and its middleware package; it stays idiomatic because everything remains a Handler.',
          concepts: ['chi.NewRouter and method routes', 'Route, Group and Mount', 'chi.URLParam', 'chi middleware package', 'Walking routes for documentation'],
          quiz: [
            ['Why does chi work with any net/http middleware?', 'Its router and middleware use the standard Handler interface.'],
            ['What does r.Mount("/api", apiRouter) do?', 'Attaches a whole sub-router under a prefix.'],
          ],
        },
        {
          title: 'Gin: engine, groups and binding',
          description: 'Gin uses its own gin.Context instead of the standard signature, bundles JSON binding and validation, route groups and a recovery middleware; faster to write, less composable with plain Handlers.',
          concepts: ['gin.Default and gin.New', 'gin.Context and c.JSON', 'ShouldBindJSON and binding tags', 'Route groups and c.Param', 'Wrapping net/http handlers with gin.WrapH'],
          quiz: [
            ['What does c.ShouldBindJSON(&req) do on invalid input?', 'Returns an error you handle, unlike BindJSON which writes 400 for you.'],
            ['How do you reuse a standard http.Handler in Gin?', 'gin.WrapH(handler).'],
          ],
        },
        {
          title: 'Middleware as handler wrappers',
          description: 'A middleware is func(http.Handler) http.Handler; it runs code before and after calling next, can short-circuit, and chains compose outermost-first, which determines who sees what.',
          concepts: ['The func(Handler) Handler shape', 'Before and after next.ServeHTTP', 'Short-circuiting with early return', 'Chaining order and helpers', 'Wrapping ResponseWriter to capture status'],
          quiz: [
            ['In chain(logging, auth)(h), which runs first?', 'logging, then auth, then h.'],
            ['Why wrap the ResponseWriter in logging middleware?', 'To record the status code and bytes written, which the interface does not expose.'],
          ],
          prereqs: ['chi: routers, groups and URL params'],
        },
        {
          title: 'Common middleware: logging, recovery, CORS and request ids',
          description: 'The middleware every service needs: panic recovery that returns 500 instead of killing the goroutine, request logging with duration, CORS preflight handling, request ids for tracing, and timeouts.',
          concepts: ['Recover from panics per request', 'Request logging with duration', 'CORS and preflight', 'Request id generation and propagation', 'http.TimeoutHandler'],
          quiz: [
            ['What happens to a panic in a handler without recovery middleware?', 'net/http recovers it and logs, but the response is aborted mid-way.'],
            ['Which header carries a request id downstream?', 'Commonly X-Request-ID, forwarded in outgoing calls.'],
          ],
          prereqs: ['Middleware as handler wrappers'],
        },
      ],
    },
    {
      title: 'JSON, Validation and Errors',
      topics: [
        {
          title: 'Encoding and decoding JSON',
          description: 'encoding/json with struct tags for names and omitempty, pointer fields to distinguish absent from zero, custom MarshalJSON for types like money and time, and the cost of reflection-based encoding.',
          concepts: ['Struct tags and omitempty', 'Pointers for optional fields', 'Custom MarshalJSON and UnmarshalJSON', 'json.RawMessage for deferred parsing', 'Encoder and Decoder on streams'],
          quiz: [
            ['How do you tell a missing field from an explicit zero?', 'Use a pointer field; nil means absent.'],
            ['What does omitempty do with a zero-valued struct field?', 'Nothing; structs are never considered empty.'],
          ],
        },
        {
          title: 'Decoding request bodies safely',
          description: 'http.MaxBytesReader to cap body size, DisallowUnknownFields to reject typos, checking for trailing data, and mapping decode errors to precise 400 messages instead of leaking internals.',
          concepts: ['MaxBytesReader limits', 'DisallowUnknownFields', 'Detecting multiple JSON values', 'Mapping json errors to 400 messages', 'Closing the body'],
          quiz: [
            ['Why cap the request body size?', 'To stop a client sending gigabytes and exhausting memory.'],
            ['What error does DisallowUnknownFields produce?', 'json: unknown field "name".'],
          ],
          prereqs: ['Encoding and decoding JSON'],
        },
        {
          title: 'Validation with go-playground/validator',
          description: 'Struct tags like validate:"required,email,min=3", registering custom rules, translating errors into field-level messages, and keeping validation in the transport layer while domain invariants stay in the domain.',
          concepts: ['validate struct tags', 'Custom validation functions', 'Field-level error translation', 'Validation versus domain invariants', 'Validating nested structs and slices'],
          quiz: [
            ['What does validate:"required" reject for a string?', 'The empty string (the zero value).'],
            ['How do you validate each element of a slice?', 'validate:"dive,required".'],
          ],
          prereqs: ['Decoding request bodies safely'],
        },
        {
          title: 'Error handling in handlers',
          description: 'Handlers that return error to a small wrapper, sentinel and typed errors mapped to status codes with errors.Is and errors.As, wrapping with %w for context, and never exposing internal messages to clients.',
          concepts: ['Handlers returning error', 'errors.Is, errors.As and wrapping', 'Domain errors to status codes', 'Logging internals, returning safe messages'],
          quiz: [
            ['How do you check whether an error chain contains ErrNotFound?', 'errors.Is(err, ErrNotFound).'],
            ['Why wrap with fmt.Errorf("load user: %w", err)?', 'To add context while keeping the original error inspectable.'],
          ],
          prereqs: ['Validation with go-playground/validator'],
        },
        {
          title: 'Problem details and consistent error bodies',
          description: 'One error response shape for the whole service (RFC 9457 problem details, covered in track-rest-api), a helper that writes it, and a validation variant listing field errors.',
          concepts: ['Problem details struct', 'A writeError helper', 'Field errors for validation', 'Error codes clients can switch on'],
          quiz: [
            ['Which content type does a problem details response use?', 'application/problem+json.'],
            ['Why include a stable code alongside the message?', 'Clients branch on codes; messages change and are localised.'],
          ],
          prereqs: ['Error handling in handlers'],
        },
      ],
    },
    {
      title: 'Configuration, Logging and Layout',
      topics: [
        {
          title: 'Configuration from environment and flags',
          description: 'Reading config from environment variables with defaults and validation at startup (envconfig or hand-written), flags for local overrides, and a Config struct passed explicitly rather than global state.',
          concepts: ['os.Getenv and defaults', 'envconfig-style struct loading', 'Flags for local development', 'Fail fast on invalid config', 'Passing Config explicitly'],
          quiz: [
            ['Why validate configuration at startup?', 'A missing database URL should stop the process immediately, not fail on the first request.'],
            ['Why avoid a global config variable?', 'Explicit dependencies are testable and make hidden coupling visible.'],
          ],
        },
        {
          title: 'Structured logging with log/slog',
          description: 'The standard slog package with JSON and text handlers, levels, attributes and groups, and configuring a handler once in main so every package logs consistently.',
          concepts: ['slog handlers: Text and JSON', 'Levels and LevelVar', 'Attributes and groups', 'slog.With for child loggers', 'Replacing attributes and redaction'],
          quiz: [
            ['How do you switch to JSON output?', 'slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil))).'],
            ['What does logger.With("service", "api") return?', 'A child logger that adds that attribute to every record.'],
          ],
        },
        {
          title: 'Request-scoped loggers and correlation ids',
          description: 'Attaching a logger carrying request id, method and path to the context in middleware, retrieving it in handlers and repositories, and correlating with traces.',
          concepts: ['Logger in context', 'Request id attributes', 'Retrieving the logger in deep layers', 'Correlating logs with traces'],
          quiz: [
            ['Why put the logger in the context rather than a global?', 'Each request gets its own attributes without threading a parameter everywhere.'],
            ['What should a repository do if no logger is in the context?', 'Fall back to slog.Default().'],
          ],
          prereqs: ['Structured logging with log/slog'],
        },
        {
          title: 'Project layout and packages',
          description: 'cmd/ for binaries, internal/ for private packages, packages organised by domain rather than by layer, avoiding the util package, and wiring dependencies in main without a framework.',
          concepts: ['cmd and internal directories', 'Packages by domain not layer', 'Dependency wiring in main', 'Interfaces defined by consumers', 'Avoiding cyclic imports'],
          quiz: [
            ['What does internal/ enforce?', 'The compiler forbids imports from outside the parent module tree.'],
            ['Where should an interface be declared?', 'In the package that uses it, sized to what it needs.'],
          ],
          prereqs: ['Configuration from environment and flags'],
        },
      ],
    },
    {
      title: 'Database Access',
      description: 'Standard library first, then the libraries that reduce boilerplate. SQL itself lives in track-sql.',
      topics: [
        {
          title: 'database/sql and connection pools',
          description: 'sql.DB is a pool, not a connection: opening lazily, PingContext to verify, SetMaxOpenConns and SetConnMaxLifetime, and the driver registration pattern.',
          concepts: ['sql.Open and driver registration', 'The pool behind sql.DB', 'Max open, idle and lifetime settings', 'PingContext at startup'],
          quiz: [
            ['Does sql.Open connect to the database?', 'No, it validates arguments; connections are made lazily.'],
            ['Why set ConnMaxLifetime?', 'So connections are recycled before load balancers or servers drop them.'],
          ],
        },
        {
          title: 'Queries, scanning and NULL handling',
          description: 'QueryRowContext and QueryContext with placeholders, scanning into variables, closing rows, sql.NullString and pointers for nullable columns, and ErrNoRows.',
          concepts: ['QueryRow, Query and Exec', 'Placeholders per driver', 'rows.Next, Scan and Close', 'sql.Null types and pointers', 'sql.ErrNoRows'],
          quiz: [
            ['What happens if you forget rows.Close()?', 'The connection stays checked out until the rows are exhausted, leaking pool capacity.'],
            ['Which placeholder does PostgreSQL use?', '$1, $2 rather than ?.'],
          ],
          prereqs: ['database/sql and connection pools'],
        },
        {
          title: 'sqlx and sqlc',
          description: 'sqlx adds struct scanning and named queries to database/sql; sqlc generates type-safe Go from SQL files at build time, giving compile-time checks without an ORM.',
          concepts: ['sqlx Get, Select and StructScan', 'Named queries and NamedExec', 'sqlc queries and generated code', 'sqlc configuration and types', 'Choosing between them'],
          quiz: [
            ['What does sqlc generate from a query file?', 'Go functions and structs with typed parameters and results.'],
            ['What does db tags do in sqlx?', 'Map columns to struct fields.'],
          ],
          prereqs: ['Queries, scanning and NULL handling'],
        },
        {
          title: 'pgx for PostgreSQL',
          description: 'The native PostgreSQL driver and toolkit: pgxpool, binary protocol, COPY for bulk loads, LISTEN/NOTIFY, and the pgx interface versus using it through database/sql.',
          concepts: ['pgxpool and configuration', 'Native versus stdlib mode', 'CopyFrom for bulk inserts', 'LISTEN and NOTIFY', 'pgx types for arrays and JSONB'],
          quiz: [
            ['When use pgx natively rather than via database/sql?', 'For PostgreSQL-only features and better performance with binary encoding.'],
            ['What does CopyFrom do?', 'Streams rows with the COPY protocol, far faster than batched INSERTs.'],
          ],
          prereqs: ['database/sql and connection pools'],
        },
        {
          title: 'GORM',
          description: 'The mainstream ORM: model structs with conventions, AutoMigrate, associations and preloading, hooks, and the cost of hidden queries; when it speeds you up and when raw SQL is clearer.',
          concepts: ['gorm.Model and conventions', 'Create, First, Find and Where', 'Associations and Preload', 'Hooks and soft delete', 'When to avoid GORM'],
          quiz: [
            ['What does gorm.Model add?', 'ID, CreatedAt, UpdatedAt and DeletedAt fields.'],
            ['How do you avoid N+1 with GORM?', 'Preload("Orders") or Joins.'],
          ],
          prereqs: ['database/sql and connection pools'],
        },
        {
          title: 'Transactions and the repository pattern',
          description: 'BeginTx with isolation options, defer rollback with commit on success, passing the transaction through a context or an interface, and repository interfaces sized to what the service needs.',
          concepts: ['BeginTx and isolation levels', 'Defer rollback, commit last', 'Transaction in context pattern', 'Repository interfaces', 'Unit of work across repositories'],
          quiz: [
            ['Why defer tx.Rollback() immediately after BeginTx?', 'If a later return or panic happens, the transaction is not left open; Rollback after Commit is a no-op.'],
            ['How can two repository calls share one transaction?', 'Pass the tx (or a querier interface) through the context or as an argument.'],
          ],
          prereqs: ['Queries, scanning and NULL handling'],
        },
        {
          title: 'Migrations with golang-migrate and goose',
          description: 'Versioned SQL migration files with up and down, applying them from CI or a migrate subcommand rather than at startup, embedding with embed.FS, and handling failed migrations.',
          concepts: ['Migration file conventions', 'golang-migrate CLI and library', 'goose and Go migrations', 'Embedding with embed.FS', 'Dirty state recovery'],
          quiz: [
            ['What does a dirty migration state mean in golang-migrate?', 'A migration failed midway; fix and force the version before continuing.'],
            ['Why not run migrations on every app start?', 'Multiple replicas race, and a failed migration should fail the deploy explicitly.'],
          ],
          prereqs: ['database/sql and connection pools'],
        },
      ],
    },
    {
      title: 'Authentication and Security',
      topics: [
        {
          title: 'Password hashing and sessions',
          description: 'bcrypt or argon2id via golang.org/x/crypto, constant-time comparison, server-side sessions stored in Redis or the database with secure cookie flags, and session fixation and expiry.',
          concepts: ['bcrypt and argon2id', 'Session ids and stores', 'Secure cookie flags', 'Session rotation on login', 'gorilla/sessions or scs'],
          quiz: [
            ['Why is bcrypt slow on purpose?', 'The work factor makes brute-forcing stolen hashes expensive.'],
            ['Which cookie flags should a session cookie have?', 'HttpOnly, Secure and SameSite.'],
          ],
        },
        {
          title: 'JWT with golang-jwt',
          description: 'Signing and verifying tokens with HS256 or RS256, registered claims, validating expiry and issuer, key rotation with a kid header, and keeping access tokens short-lived.',
          concepts: ['Signing and parsing with claims', 'HS256 versus RS256', 'Validating exp, iss and aud', 'Key rotation with kid', 'Bearer token extraction'],
          quiz: [
            ['Why must you check the alg when parsing?', 'To reject tokens signed with a different or "none" algorithm.'],
            ['When would you pick RS256 over HS256?', 'When other services must verify tokens without holding the signing secret.'],
          ],
          prereqs: ['Password hashing and sessions'],
        },
        {
          title: 'Authorization middleware and roles',
          description: 'Middleware that loads the principal into context, route-level role checks, resource-level checks in the service layer, and returning 401 versus 403 correctly.',
          concepts: ['Principal in context', 'Role checks per route', 'Ownership checks in services', '401 versus 403', 'Scopes for API tokens'],
          quiz: [
            ['When should a handler return 403 instead of 401?', 'When the caller is authenticated but not permitted.'],
            ['Where should "can this user edit this order" live?', 'In the service layer, where the order is loaded.'],
          ],
          prereqs: ['JWT with golang-jwt'],
        },
        {
          title: 'Security headers, CSRF and rate limiting',
          description: 'Setting HSTS and content-type headers, CSRF tokens for cookie-authenticated forms, per-client rate limiting with golang.org/x/time/rate or a token bucket in Redis, and TLS termination choices.',
          concepts: ['Security headers middleware', 'CSRF with double-submit or gorilla/csrf', 'x/time/rate limiter per client', 'Distributed limits in Redis', 'TLS termination and autocert'],
          quiz: [
            ['Do bearer-token APIs need CSRF protection?', 'Not usually; browsers do not attach bearer tokens automatically.'],
            ['What does rate.NewLimiter(10, 20) allow?', '10 requests per second with bursts of 20.'],
          ],
          prereqs: ['Authorization middleware and roles'],
        },
      ],
    },
    {
      title: 'Concurrency in Services',
      description: 'Language-level goroutines and channels are in track-go; this is how they show up inside a server.',
      topics: [
        {
          title: 'Goroutines inside request handlers',
          description: 'Fanning out to several backends in parallel inside a handler, collecting results with channels or errgroup, and the rule that spawned goroutines must not outlive the request unless deliberately detached.',
          concepts: ['Fan-out within a handler', 'Collecting results safely', 'Goroutines outliving the request', 'Copying request data before detaching'],
          quiz: [
            ['What goes wrong if a goroutine writes to the ResponseWriter after the handler returns?', 'Data race and possibly a panic; the writer is no longer valid.'],
            ['Can a detached goroutine use r.Context()?', 'No, it is cancelled when the handler returns; use context.WithoutCancel or a new context.'],
          ],
        },
        {
          title: 'Context cancellation and timeouts',
          description: 'Deriving deadlines per operation, honouring ctx in database and HTTP calls, cleaning up when the client disconnects, and reporting 504 or 499-style outcomes.',
          concepts: ['context.WithTimeout per call', 'Checking ctx.Err()', 'Cancellation in DB and HTTP clients', 'Timeout budgets across hops', 'Reporting cancelled requests'],
          quiz: [
            ['What error does a cancelled query return?', 'context.Canceled or context.DeadlineExceeded wrapped by the driver.'],
            ['Why give downstream calls a shorter timeout than the handler?', 'So the handler can still respond before its own deadline.'],
          ],
          prereqs: ['Goroutines inside request handlers'],
        },
        {
          title: 'Worker pools and errgroup',
          description: 'Bounded concurrency with a fixed number of workers reading from a channel, errgroup.WithContext to cancel siblings on first error and SetLimit for bounds, and semaphores for shared resources.',
          concepts: ['Worker pool with channels', 'errgroup.WithContext', 'SetLimit for bounded parallelism', 'Semaphore with buffered channels', 'Collecting partial results'],
          quiz: [
            ['What happens in an errgroup when one goroutine returns an error?', 'The group context is cancelled and Wait returns the first error.'],
            ['How do you limit an errgroup to 5 concurrent tasks?', 'g.SetLimit(5).'],
          ],
          prereqs: ['Context cancellation and timeouts'],
        },
        {
          title: 'Background jobs and graceful shutdown',
          description: 'Catching SIGTERM with signal.NotifyContext, Server.Shutdown to drain in-flight requests, stopping background workers and closing pools in order, and readiness flipping before shutdown.',
          concepts: ['signal.NotifyContext', 'Server.Shutdown with a deadline', 'Stopping workers and closing resources', 'Readiness before shutdown', 'Ordering with WaitGroup'],
          quiz: [
            ['What does http.Server.Shutdown do?', 'Stops accepting connections and waits for active requests to finish or the context to expire.'],
            ['Why flip readiness to false before Shutdown?', 'So the load balancer stops sending new traffic while in-flight requests drain.'],
          ],
          prereqs: ['Context cancellation and timeouts'],
        },
        {
          title: 'Shared state, sync and the race detector',
          description: 'Protecting in-memory caches and counters with sync.Mutex and RWMutex, sync.Once for lazy init, atomic counters, and running tests with -race to catch data races before production does.',
          concepts: ['Mutex and RWMutex in handlers', 'sync.Once and lazy initialisation', 'atomic counters', 'go test -race', 'sync.Map and when it fits'],
          quiz: [
            ['Why is a plain map unsafe under concurrent writes?', 'Concurrent map writes cause a fatal runtime error.'],
            ['What does -race cost?', 'Roughly 2 to 10 times slower and more memory, so use it in tests and staging.'],
          ],
          prereqs: ['Goroutines inside request handlers'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'httptest recorders and servers',
          description: 'httptest.NewRecorder to call a handler directly and inspect status, headers and body, and httptest.NewServer for a real listener when testing clients or full middleware chains.',
          concepts: ['httptest.NewRecorder', 'httptest.NewRequest', 'httptest.NewServer for clients', 'Asserting JSON bodies'],
          quiz: [
            ['What does httptest.NewRecorder give you?', 'A ResponseWriter that records status, headers and body for assertions.'],
            ['When do you need NewServer rather than a recorder?', 'When testing an HTTP client or anything that needs a real URL.'],
          ],
        },
        {
          title: 'Table-driven handler tests',
          description: 'A slice of cases with name, request builder and expected status/body, run with t.Run subtests and t.Parallel, covering happy path, validation errors and auth failures in one readable test.',
          concepts: ['Case structs and t.Run', 't.Parallel and loop variables', 'Golden files for bodies', 'Helper functions with t.Helper'],
          quiz: [
            ['Why call t.Helper() in test helpers?', 'So failures report the caller\'s line rather than the helper\'s.'],
            ['What is a golden file?', 'A stored expected output compared against, updated with a flag when intentionally changed.'],
          ],
          prereqs: ['httptest recorders and servers'],
        },
        {
          title: 'Testing database code',
          description: 'Running a real PostgreSQL in tests with testcontainers-go or a docker-compose service, migrations in TestMain, per-test transactions or truncation, and why mocking SQL is rarely worth it.',
          concepts: ['testcontainers-go for Postgres', 'TestMain setup and teardown', 'Per-test isolation strategies', 'Build tags for integration tests', 'Why not mock SQL'],
          quiz: [
            ['How do you skip integration tests in a quick run?', 'A build tag or testing.Short() check.'],
            ['What does TestMain let you do?', 'Run setup once before all tests in a package and clean up after.'],
          ],
          prereqs: ['httptest recorders and servers'],
        },
        {
          title: 'Mocks, interfaces and testify',
          description: 'Hand-written fakes implementing small interfaces, generated mocks with mockery or gomock, testify assert and require, and keeping mocks at service boundaries rather than everywhere.',
          concepts: ['Hand-written fakes', 'mockery and gomock', 'testify assert versus require', 'Mocking at boundaries only', 'Fake clocks and ids'],
          quiz: [
            ['Difference between assert and require in testify?', 'require stops the test on failure; assert continues.'],
            ['Why prefer a fake over a mock for a repository?', 'A fake with a map behaves realistically and tests stay readable.'],
          ],
          prereqs: ['Table-driven handler tests'],
        },
      ],
    },
    {
      title: 'Observability and Deployment',
      description: 'Docker and cloud platforms in depth live in track-docker and track-observability.',
      topics: [
        {
          title: 'Metrics with the Prometheus client',
          description: 'Exposing /metrics with promhttp, counters and histograms for requests by route and status, the RED method, and cardinality discipline for labels.',
          concepts: ['promhttp handler', 'Counters, gauges and histograms', 'RED metrics per route', 'Label cardinality limits', 'Go runtime metrics'],
          quiz: [
            ['Why never label metrics with user ids?', 'Unbounded label values explode series cardinality and memory.'],
            ['Which metric type suits request latency?', 'A histogram with sensible buckets.'],
          ],
        },
        {
          title: 'Tracing with OpenTelemetry',
          description: 'otelhttp to instrument servers and clients, spans around database calls, context propagation across services, and exporting to an OTLP collector.',
          concepts: ['otelhttp handlers and transports', 'Manual spans and attributes', 'Propagation headers', 'OTLP exporter setup', 'Sampling decisions'],
          quiz: [
            ['How does a trace continue into a downstream service?', 'The client injects traceparent headers, which the server extracts.'],
            ['What does otelhttp.NewHandler add?', 'A server span per request with method, route and status attributes.'],
          ],
          prereqs: ['Metrics with the Prometheus client'],
        },
        {
          title: 'Health checks and pprof',
          description: 'Separate liveness and readiness endpoints that check dependencies, and net/http/pprof for CPU, heap and goroutine profiles on a private port when production misbehaves.',
          concepts: ['Liveness versus readiness handlers', 'Dependency checks with timeouts', 'net/http/pprof endpoints', 'Analysing profiles with go tool pprof', 'Goroutine leak detection'],
          quiz: [
            ['Why serve pprof on a separate port?', 'Profiles reveal internals and can load the server; keep them off the public listener.'],
            ['What should readiness check?', 'That dependencies like the database are reachable.'],
          ],
        },
        {
          title: 'Building binaries and Docker images',
          description: 'Static binaries with CGO_ENABLED=0, ldflags for version stamping, multi-stage Dockerfiles from a distroless or scratch base, and image size and startup time.',
          concepts: ['CGO_ENABLED=0 and static builds', 'ldflags -X for versions', 'Multi-stage Dockerfile', 'Distroless and scratch bases', 'Non-root user and read-only FS'],
          quiz: [
            ['Why does a scratch image work for Go?', 'The static binary has no runtime dependencies; add CA certs and tzdata if needed.'],
            ['How do you embed a version at build time?', 'go build -ldflags "-X main.version=1.2.3".'],
          ],
        },
        {
          title: 'Running in production',
          description: 'GOMAXPROCS and memory limits in containers, environment-driven config, structured logs to stdout, running behind a reverse proxy or load balancer, and zero-downtime rollouts.',
          concepts: ['GOMAXPROCS and GOMEMLIMIT in containers', 'Logs to stdout', 'Proxy headers and trusted proxies', 'Rolling deploys and readiness', 'Resource requests and limits'],
          quiz: [
            ['Why set GOMEMLIMIT in a container?', 'So the GC works within the cgroup limit instead of being OOM-killed.'],
            ['Which header carries the client IP behind a proxy?', 'X-Forwarded-For, trusted only from known proxies.'],
          ],
          prereqs: ['Building binaries and Docker images'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: URL shortener with Redis and PostgreSQL',
          description: 'Build a shortener with the 1.22 mux: create and resolve links, Redis cache in front of Postgres, click counting via a background worker, rate limiting, table-driven tests and a Docker image.',
          concepts: ['Handlers and routing', 'Cache-aside with Redis', 'Async click counting', 'Rate limiting per IP', 'Tests and Docker build'],
          quiz: [
            ['Where does the redirect lookup go first?', 'Redis, falling back to Postgres and backfilling the cache.'],
            ['Why count clicks asynchronously?', 'The redirect stays fast and a database hiccup does not break it.'],
          ],
        },
        {
          title: 'Project: bookings API with chi and sqlc',
          description: 'A room booking service: chi routes, sqlc-generated queries, transactions that prevent double booking, JWT auth, validator-based input checks, problem details errors and testcontainers integration tests.',
          concepts: ['Domain model and migrations', 'sqlc queries and transactions', 'Overlap prevention under concurrency', 'JWT-protected routes', 'Integration tests with Postgres'],
          quiz: [
            ['How do you prevent two overlapping bookings?', 'A transaction with a row lock or an exclusion constraint on the time range.'],
            ['Why generate queries with sqlc?', 'Compile-time checked SQL without hand-written scanning.'],
          ],
        },
        {
          title: 'Project: file processing service with worker pools',
          description: 'Uploads land in object storage, a worker pool processes them (resize, virus scan, metadata), progress is exposed over Server-Sent Events, and graceful shutdown finishes in-flight jobs.',
          concepts: ['Upload handling and storage', 'Bounded worker pool', 'Job status and SSE', 'Graceful shutdown of workers', 'Metrics for queue depth'],
          quiz: [
            ['How do you stream progress to the browser?', 'A handler that writes text/event-stream and flushes after each event.'],
            ['What happens to queued jobs on SIGTERM?', 'Stop accepting new ones, finish or checkpoint in-flight jobs, then exit.'],
          ],
        },
        {
          title: 'Project: observable Gin microservice',
          description: 'A product catalogue in Gin with GORM, OpenTelemetry tracing, Prometheus metrics, slog JSON logs with request ids, health probes, and a Kubernetes-ready distroless image.',
          concepts: ['Gin routes and binding', 'GORM models and preloading', 'Tracing, metrics and logs wired', 'Health endpoints', 'Distroless image and probes'],
          quiz: [
            ['Which three signals make the service observable?', 'Logs, metrics and traces, correlated by request and trace ids.'],
            ['Why does readiness differ from liveness for this service?', 'Readiness checks the database; liveness only that the process responds.'],
          ],
        },
        {
          title: 'Go backend interview questions',
          description: 'What interviewers ask: how net/http handles concurrency, context propagation, sql.DB pooling, middleware order, error wrapping, graceful shutdown and choosing GORM versus sqlc.',
          concepts: ['net/http and concurrency questions', 'Context and cancellation questions', 'Database access questions', 'Error handling questions'],
          quiz: [
            ['Explain why handlers must be goroutine-safe.', 'net/http runs each request in its own goroutine, so shared state is accessed concurrently.'],
            ['What is sql.DB?', 'A connection pool safe for concurrent use, not a single connection.'],
          ],
          style: 'reading',
        },
        {
          title: 'Go service design questions',
          description: 'Designing a rate limiter, structuring packages for a growing service, choosing sync versus async processing, handling partial failures in fan-out, and reviewing a handler with goroutine leaks.',
          concepts: ['Rate limiter design', 'Package structure decisions', 'Sync versus async processing', 'Spotting goroutine leaks'],
          quiz: [
            ['What signals a goroutine leak in a handler?', 'Goroutines blocked on channels nobody reads after the handler returned; goroutine counts climb in pprof.'],
            ['When should a request be handled asynchronously?', 'When the work takes longer than a client should wait or must survive client disconnects.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
