import { defineTrack } from '../define'

export const aspnetCore = defineTrack({
  id: 'track-aspnet-core',
  title: 'ASP.NET Core',
  description: 'ASP.NET Core as a production stack: the host and middleware pipeline, minimal APIs and controllers, dependency injection, configuration and options, model binding and validation, EF Core, Identity, JWT and policy authorization, logging, health checks, caching, background services, SignalR, testing with xUnit and WebApplicationFactory, performance and deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🟣',
  tags: ['aspnet', 'dotnet', 'csharp', 'backend', 'ef-core', 'signalr', 'identity', 'rest'],
  languages: ['C#'],
  explainMode: 'concept',
  code: { label: 'C# with ASP.NET Core', id: 'csharp', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-csharp'],
  style: 'code',
  categories: [
    {
      title: 'Hosting and the Middleware Pipeline',
      description: 'How an ASP.NET Core process starts, listens and routes a request through middleware to an endpoint.',
      topics: [
        {
          title: 'Creating a project with the .NET SDK',
          description: 'dotnet new webapi or web, the top-level Program.cs with WebApplication.CreateBuilder, the csproj and target framework, dotnet run and dotnet watch, and launchSettings.json profiles that set ports and environment for local runs.',
          concepts: ['dotnet new templates', 'Program.cs and WebApplication.CreateBuilder', 'dotnet run and dotnet watch', 'launchSettings.json profiles'],
          quiz: [
            ['What does WebApplication.CreateBuilder(args) set up?', 'Configuration, logging, DI and Kestrel defaults with command-line args applied.'],
            ['Does launchSettings.json affect production?', 'No, it is used only by dotnet run and IDE launches.'],
          ],
        },
        {
          title: 'The host and Kestrel',
          description: 'The generic host runs Kestrel as the cross-platform web server; configuring URLs and ports, the HTTPS development certificate, Kestrel limits, and running behind IIS, nginx or a load balancer with forwarded headers.',
          concepts: ['Generic host and hosted lifetime', 'Kestrel endpoints and URLs', 'Development HTTPS certificate', 'Reverse proxies and ForwardedHeaders'],
          quiz: [
            ['How do you change the listening port without code?', 'ASPNETCORE_URLS=http://+:8080 or the --urls argument.'],
            ['Why call UseForwardedHeaders behind a proxy?', 'So the scheme and client IP come from X-Forwarded headers instead of the proxy.'],
          ],
          prereqs: ['Creating a project with the .NET SDK'],
        },
        {
          title: 'The middleware pipeline',
          description: 'Middleware components form a chain built with app.Use, app.Run and app.Map; the order determines behaviour, so UseAuthentication must precede UseAuthorization, and a component can short-circuit. Writing middleware as a class with InvokeAsync.',
          concepts: ['Use, Run and Map', 'Why middleware order matters', 'Short-circuiting the pipeline', 'Custom middleware classes'],
          quiz: [
            ['What happens if UseAuthorization comes before UseAuthentication?', 'Authorization sees an unauthenticated user and denies protected endpoints.'],
            ['What does app.Run register?', 'Terminal middleware that does not call the next component.'],
          ],
          prereqs: ['The host and Kestrel'],
        },
        {
          title: 'Endpoint routing',
          description: 'Route templates with parameters and constraints, how endpoint routing matches once and lets later middleware read the endpoint, MapGroup for shared prefixes and filters, and link generation with LinkGenerator.',
          concepts: ['Route templates and constraints', 'Endpoint metadata', 'MapGroup prefixes', 'LinkGenerator'],
          quiz: [
            ['What does {id:int} enforce?', 'The segment must parse as an integer or the route does not match.'],
            ['Why do UseRouting and UseEndpoints exist?', 'Routing matches early so middleware between them can inspect the chosen endpoint.'],
          ],
          prereqs: ['The middleware pipeline'],
        },
        {
          title: 'Environments and startup behaviour',
          description: 'ASPNETCORE_ENVIRONMENT selects Development, Staging or Production; IWebHostEnvironment checks in code, appsettings.{Environment}.json overrides, the developer exception page in Development, and HSTS and HTTPS redirection outside it.',
          concepts: ['ASPNETCORE_ENVIRONMENT', 'IWebHostEnvironment checks', 'Per-environment appsettings', 'Development-only middleware'],
          quiz: [
            ['What does app.Environment.IsDevelopment() gate typically?', 'The developer exception page and Swagger UI.'],
            ['Which file wins: appsettings.json or appsettings.Production.json?', 'The environment file, because it is loaded later.'],
          ],
          prereqs: ['Creating a project with the .NET SDK'],
        },
      ],
    },
    {
      title: 'Minimal APIs and Controllers',
      description: 'Two ways to define endpoints; HTTP semantics and API design are in track-rest-api.',
      topics: [
        {
          title: 'Minimal APIs',
          description: 'MapGet, MapPost and friends take lambdas whose parameters bind from route, query, body and DI; TypedResults return typed responses that document themselves, route groups share prefixes and filters, and handlers can be static methods.',
          concepts: ['MapGet and MapPost handlers', 'Parameter binding sources', 'TypedResults and Results', 'Route groups and organisation'],
          quiz: [
            ['How does a minimal API decide a parameter comes from the body?', 'Complex types bind from JSON body unless attributed or a known DI service.'],
            ['Why prefer TypedResults over Results?', 'Return types are declared, so OpenAPI metadata and tests are precise.'],
          ],
          prereqs: ['Endpoint routing'],
        },
        {
          title: 'Controllers and ActionResult',
          description: 'ControllerBase with [ApiController] and attribute routing, ActionResult<T> for typed success with alternative status results, Ok, NotFound, CreatedAtAction helpers, and [ProducesResponseType] for documentation.',
          concepts: ['[ApiController] behaviours', 'Attribute routing on actions', 'ActionResult<T> and helper results', 'ProducesResponseType metadata'],
          quiz: [
            ['What does [ApiController] add?', 'Automatic 400 on invalid ModelState, binding source inference and ProblemDetails errors.'],
            ['What does CreatedAtAction return?', '201 with a Location header pointing at the named action.'],
          ],
          prereqs: ['Endpoint routing'],
        },
        {
          title: 'Model binding and validation',
          description: '[FromRoute], [FromQuery], [FromBody], [FromHeader] and [FromForm] sources, DataAnnotations such as [Required] and [Range], ModelState in controllers, FluentValidation for complex rules, and validation filters for minimal APIs.',
          concepts: ['Binding source attributes', 'DataAnnotations validation', 'ModelState and automatic 400', 'FluentValidation', 'Validation in minimal APIs'],
          quiz: [
            ['When is ModelState.IsValid false?', 'When a DataAnnotation or binding conversion failed for the bound model.'],
            ['Do minimal APIs validate DataAnnotations automatically?', 'Not before .NET 10; use an endpoint filter or FluentValidation.'],
          ],
          prereqs: ['Minimal APIs', 'Controllers and ActionResult'],
        },
        {
          title: 'Filters and endpoint filters',
          description: 'Action, result and exception filters wrap controller actions with ordered before and after hooks; IEndpointFilter does the same for minimal APIs via AddEndpointFilter, useful for validation, logging and cross-cutting checks.',
          concepts: ['Action and exception filters', 'Filter ordering and scopes', 'IEndpointFilter', 'AddEndpointFilter on groups'],
          quiz: [
            ['How does an endpoint filter continue the pipeline?', 'By awaiting next(context) and returning its result.'],
            ['Where is a filter applied to every route in a group?', 'group.AddEndpointFilter<T>() on the RouteGroupBuilder.'],
          ],
          prereqs: ['Model binding and validation'],
        },
        {
          title: 'OpenAPI and API versioning',
          description: 'Generating an OpenAPI document with Microsoft.AspNetCore.OpenApi or Swashbuckle, Swagger UI or Scalar for exploration, describing responses and examples, and versioning routes with Asp.Versioning by URL segment or header.',
          concepts: ['AddOpenApi and MapOpenApi', 'Swagger UI and Scalar', 'Describing responses and examples', 'Asp.Versioning strategies'],
          quiz: [
            ['What does WithOpenApi or Produces add to a minimal endpoint?', 'Response and parameter metadata for the generated document.'],
            ['How does Asp.Versioning read the version?', 'From a configured reader: URL segment, query string, header or media type.'],
          ],
          prereqs: ['Minimal APIs'],
        },
      ],
    },
    {
      title: 'Dependency Injection and Configuration',
      topics: [
        {
          title: 'The DI container and lifetimes',
          description: 'Services registered on builder.Services are resolved by constructor injection; Transient, Scoped and Singleton lifetimes, the scope per request, and the captive dependency bug of a singleton holding a scoped service.',
          concepts: ['Constructor injection', 'Transient, Scoped and Singleton', 'Request scopes', 'Captive dependency validation'],
          quiz: [
            ['What lifetime should a DbContext have?', 'Scoped, one per request.'],
            ['What does ValidateScopes catch in Development?', 'A scoped service being resolved from the root or captured by a singleton.'],
          ],
          prereqs: ['The middleware pipeline'],
        },
        {
          title: 'Registering services',
          description: 'Interfaces to implementations, open generics, multiple implementations resolved as IEnumerable<T>, keyed services with [FromKeyedServices], factory registrations, and IServiceScopeFactory for creating scopes in background code.',
          concepts: ['Interface to implementation registration', 'Open generic registrations', 'Keyed services', 'Factory registrations', 'IServiceScopeFactory'],
          quiz: [
            ['How do you inject one of several INotifier implementations by name?', 'Register with AddKeyedScoped and inject with [FromKeyedServices("email")].'],
            ['Why create a scope in a BackgroundService?', 'Scoped services cannot be injected into a singleton hosted service.'],
          ],
          prereqs: ['The DI container and lifetimes'],
        },
        {
          title: 'Configuration providers',
          description: 'IConfiguration merges appsettings.json, environment-specific files, user secrets in Development, environment variables with double-underscore separators, and command-line args, with later providers overriding earlier ones.',
          concepts: ['Provider order and overrides', 'User secrets in Development', 'Environment variable naming', 'GetSection and binding'],
          quiz: [
            ['How is ConnectionStrings:Default set via an environment variable?', 'ConnectionStrings__Default with a double underscore.'],
            ['Where does dotnet user-secrets store values?', 'In a JSON file under the user profile, outside the repository.'],
          ],
          prereqs: ['Environments and startup behaviour'],
        },
        {
          title: 'The options pattern',
          description: 'Binding a configuration section to a class with Configure<T>, IOptions for singletons, IOptionsSnapshot for per-request reloads, IOptionsMonitor for change notifications, and ValidateDataAnnotations with ValidateOnStart to fail fast.',
          concepts: ['Configure<T> binding', 'IOptions, IOptionsSnapshot, IOptionsMonitor', 'Options validation on start', 'Named options'],
          quiz: [
            ['Which options interface reflects appsettings changes without restart?', 'IOptionsSnapshot per request or IOptionsMonitor for live changes.'],
            ['What does ValidateOnStart do?', 'Runs validation during host startup so bad config stops the process.'],
          ],
          prereqs: ['Configuration providers'],
        },
        {
          title: 'HttpClientFactory and typed clients',
          description: 'AddHttpClient avoids socket exhaustion by pooling handlers; named and typed clients configure base addresses and headers, and AddStandardResilienceHandler adds retries, timeouts and circuit breakers from Microsoft.Extensions.Http.Resilience.',
          concepts: ['Why not new HttpClient per request', 'Named and typed clients', 'Handler lifetime and DNS', 'Standard resilience handler'],
          quiz: [
            ['What problem does IHttpClientFactory solve?', 'Socket exhaustion and stale DNS from creating or holding HttpClient instances.'],
            ['What does a typed client look like?', 'A class taking HttpClient in its constructor, registered with AddHttpClient<T>().'],
          ],
          prereqs: ['Registering services'],
        },
      ],
    },
    {
      title: 'Entity Framework Core',
      description: 'Data access with EF Core. SQL itself is in track-sql; here it is the ORM.',
      topics: [
        {
          title: 'DbContext and entity configuration',
          description: 'A DbContext with DbSet properties registered via AddDbContext, conventions that infer keys and tables, and the Fluent API in OnModelCreating or IEntityTypeConfiguration classes for names, lengths, indexes and constraints.',
          concepts: ['DbContext and DbSet', 'AddDbContext and providers', 'Conventions versus Fluent API', 'IEntityTypeConfiguration classes'],
          quiz: [
            ['How does EF Core pick the primary key by convention?', 'A property named Id or <Type>Id.'],
            ['Why put configuration in IEntityTypeConfiguration classes?', 'OnModelCreating stays small and each entity owns its mapping.'],
          ],
          prereqs: ['The DI container and lifetimes'],
        },
        {
          title: 'EF Core migrations',
          description: 'dotnet ef migrations add generates C# migration classes from model changes; database update applies them, idempotent SQL scripts suit CI, Migrate() at startup is risky with many instances, and a design-time factory helps tooling.',
          concepts: ['dotnet ef migrations add', 'database update versus SQL scripts', 'Migrate() at startup trade-offs', 'Design-time DbContext factory'],
          quiz: [
            ['What does dotnet ef migrations script --idempotent produce?', 'SQL that applies only missing migrations, safe to rerun.'],
            ['Why avoid Migrate() at startup with several replicas?', 'Instances race to apply the same migration.'],
          ],
          prereqs: ['DbContext and entity configuration'],
        },
        {
          title: 'Relationships',
          description: 'One-to-many with navigation and foreign key properties, one-to-one with a dependent, many-to-many with an implicit or explicit join entity, cascade delete behaviours, owned types for value objects, and required versus optional relationships.',
          concepts: ['One-to-many navigations', 'One-to-one dependents', 'Many-to-many join entities', 'Cascade delete behaviour', 'Owned types'],
          quiz: [
            ['How does EF Core map many-to-many without a join class?', 'It creates a shadow join table from the two collection navigations.'],
            ['What does DeleteBehavior.Restrict do?', 'Prevents deleting a principal while dependents exist.'],
          ],
          prereqs: ['DbContext and entity configuration'],
        },
        {
          title: 'Querying with LINQ',
          description: 'IQueryable builds SQL lazily until enumerated; Where, OrderBy and Select translate to SQL, Include and ThenInclude load relations, projections to DTOs avoid over-fetching, AsNoTracking speeds reads, and split queries avoid cartesian explosion.',
          concepts: ['IQueryable deferred execution', 'Include and ThenInclude', 'Projecting to DTOs', 'AsNoTracking reads', 'AsSplitQuery'],
          quiz: [
            ['What happens with a method EF Core cannot translate?', 'An InvalidOperationException at runtime unless evaluation is moved client-side.'],
            ['When use AsNoTracking?', 'Read-only queries, to skip change tracking overhead.'],
          ],
          prereqs: ['Relationships'],
        },
        {
          title: 'Change tracking and saving',
          description: 'The tracker records entity states; SaveChanges writes them in one transaction; Attach and Update for disconnected entities, concurrency tokens with DbUpdateConcurrencyException, explicit transactions, and ExecuteUpdate and ExecuteDelete for bulk operations.',
          concepts: ['Entity states', 'SaveChanges and transactions', 'Disconnected updates', 'Concurrency tokens', 'ExecuteUpdate and ExecuteDelete'],
          quiz: [
            ['What does a [Timestamp] or IsRowVersion() column do?', 'Adds a concurrency check so stale updates throw DbUpdateConcurrencyException.'],
            ['Does ExecuteDeleteAsync load entities?', 'No, it issues a single DELETE statement.'],
          ],
          prereqs: ['Querying with LINQ'],
        },
        {
          title: 'EF Core performance and raw SQL',
          description: 'Logging generated SQL, indexes in configuration, compiled queries for hot paths, DbContext pooling, connection resiliency with retries, and FromSql or SqlQuery with parameters when LINQ cannot express the query.',
          concepts: ['Logging generated SQL', 'Indexes in model configuration', 'Compiled queries and context pooling', 'EnableRetryOnFailure', 'FromSql with parameters'],
          quiz: [
            ['Why is FromSql($"... {name}") safe from injection?', 'The interpolated value becomes a parameter, not string concatenation.'],
            ['What does AddDbContextPool change?', 'Context instances are reset and reused instead of created per request.'],
          ],
          prereqs: ['Querying with LINQ'],
        },
      ],
    },
    {
      title: 'Authentication and Authorization',
      description: 'Vulnerability classes are in track-web-security; this is the ASP.NET Core machinery.',
      topics: [
        {
          title: 'Authentication schemes and ClaimsPrincipal',
          description: 'AddAuthentication registers schemes with handlers that turn cookies or tokens into a ClaimsPrincipal on HttpContext.User; default schemes, challenge and forbid behaviour, and cookie authentication for browser apps.',
          concepts: ['Schemes and handlers', 'ClaimsPrincipal and claims', 'Default, challenge and forbid schemes', 'Cookie authentication'],
          quiz: [
            ['What does UseAuthentication actually do?', 'Runs the default scheme handler to populate HttpContext.User.'],
            ['What is the difference between a 401 and 403 here?', '401 is a challenge for missing auth; 403 is forbid for an authenticated but unauthorised user.'],
          ],
          prereqs: ['The middleware pipeline'],
        },
        {
          title: 'ASP.NET Core Identity',
          description: 'IdentityDbContext with users and roles, UserManager and SignInManager for registration, password policy and lockout, MapIdentityApi endpoints for token or cookie flows, roles and claims, and customising the user entity.',
          concepts: ['IdentityDbContext and IdentityUser', 'UserManager and SignInManager', 'Password policy and lockout', 'MapIdentityApi endpoints', 'Roles and user claims'],
          quiz: [
            ['What does MapIdentityApi<TUser>() expose?', 'Register, login, refresh, confirm email and related endpoints.'],
            ['How are passwords stored by Identity?', 'Hashed with PBKDF2 through IPasswordHasher.'],
          ],
          prereqs: ['Authentication schemes and ClaimsPrincipal', 'DbContext and entity configuration'],
        },
        {
          title: 'JWT bearer authentication',
          description: 'AddJwtBearer with TokenValidationParameters for issuer, audience, lifetime and signing key, issuing tokens with JwtSecurityTokenHandler or JsonWebTokenHandler, refresh token storage and rotation, and key management outside source code.',
          concepts: ['AddJwtBearer configuration', 'TokenValidationParameters', 'Issuing access tokens', 'Refresh tokens and rotation', 'Signing key management'],
          quiz: [
            ['Where does JWT bearer read the token?', 'The Authorization header with the Bearer prefix.'],
            ['Why validate the audience?', 'A token issued for another API must not be accepted by this one.'],
          ],
          prereqs: ['Authentication schemes and ClaimsPrincipal'],
        },
        {
          title: 'Authorization policies and requirements',
          description: '[Authorize] and RequireAuthorization on endpoints, role and claim policies with AddPolicy, custom IAuthorizationRequirement and handlers, resource-based authorization with IAuthorizationService, and a fallback policy that secures everything by default.',
          concepts: ['Authorize attribute and RequireAuthorization', 'Role and claim policies', 'Requirements and handlers', 'Resource-based authorization', 'Fallback policy'],
          quiz: [
            ['How do you check that a user owns the document being edited?', 'Call IAuthorizationService.AuthorizeAsync(user, document, policy) with a resource handler.'],
            ['What does a FallbackPolicy do?', 'Applies to every endpoint without explicit authorization metadata.'],
          ],
          prereqs: ['JWT bearer authentication'],
        },
        {
          title: 'External login and OpenID Connect',
          description: 'Delegating login to Google, GitHub or an OpenID Connect provider such as Microsoft Entra, Auth0 or Keycloak with AddOpenIdConnect, the authorization code flow with PKCE, mapping external claims, and the backend-for-frontend pattern for SPAs.',
          concepts: ['OAuth provider handlers', 'AddOpenIdConnect setup', 'Authorization code with PKCE', 'Claim mapping', 'Backend-for-frontend pattern'],
          quiz: [
            ['Why is the BFF pattern used with SPAs?', 'Tokens stay server-side in a cookie session rather than in browser storage.'],
            ['What does PKCE protect against?', 'Authorization code interception on public clients.'],
          ],
          prereqs: ['Authentication schemes and ClaimsPrincipal'],
        },
      ],
    },
    {
      title: 'Logging, Health and Diagnostics',
      topics: [
        {
          title: 'Logging with ILogger',
          description: 'ILogger<T> categories and levels, structured message templates with named placeholders, configuring providers and filters in appsettings, Serilog for sinks and enrichment, and LoggerMessage source generators for hot paths.',
          concepts: ['ILogger<T> and categories', 'Structured message templates', 'Log level filters in configuration', 'Serilog sinks and enrichment', 'LoggerMessage source generator'],
          quiz: [
            ['Why write LogInformation("User {UserId} logged in", id) instead of interpolation?', 'The placeholder becomes a structured property and the template is not reformatted per call.'],
            ['Where do you silence noisy EF Core logs?', 'Logging:LogLevel:Microsoft.EntityFrameworkCore in appsettings.'],
          ],
          prereqs: ['Configuration providers'],
        },
        {
          title: 'Health checks',
          description: 'AddHealthChecks with database, Redis and custom checks, MapHealthChecks endpoints, separating liveness from readiness with tags, and returning detailed JSON for dashboards while keeping the probe endpoint cheap.',
          concepts: ['AddHealthChecks and MapHealthChecks', 'Database and dependency checks', 'Liveness versus readiness tags', 'Health response formatting'],
          quiz: [
            ['What status does a Degraded check produce by default?', '200 with the status Degraded in the body.'],
            ['Why keep a liveness probe free of dependency checks?', 'A slow database should not make the orchestrator restart healthy processes.'],
          ],
          prereqs: ['Registering services'],
        },
        {
          title: 'Error handling and ProblemDetails',
          description: 'UseExceptionHandler and IExceptionHandler to map exceptions to responses, AddProblemDetails for RFC 7807 bodies, status code pages, the developer exception page in Development, and never leaking stack traces in Production.',
          concepts: ['UseExceptionHandler middleware', 'IExceptionHandler implementations', 'AddProblemDetails', 'Status code pages', 'Developer exception page'],
          quiz: [
            ['What does an IExceptionHandler return to indicate it handled the error?', 'true from TryHandleAsync after writing the response.'],
            ['What content type does ProblemDetails use?', 'application/problem+json.'],
          ],
          prereqs: ['The middleware pipeline'],
        },
        {
          title: 'Observability with OpenTelemetry',
          description: 'AddOpenTelemetry with ASP.NET Core, HttpClient and EF Core instrumentation, Activity for custom spans, meters for metrics, the OTLP exporter to a collector, and the .NET Aspire dashboard for local traces and logs.',
          concepts: ['OpenTelemetry tracing setup', 'Activity and custom spans', 'Metrics with Meter', 'OTLP exporter', 'Aspire dashboard locally'],
          quiz: [
            ['What does AddAspNetCoreInstrumentation record?', 'A span per request with route, status code and duration.'],
            ['How do you correlate logs with a trace?', 'Include the TraceId from Activity.Current in log scopes.'],
          ],
          prereqs: ['Logging with ILogger'],
        },
      ],
    },
    {
      title: 'Caching, Background Services and SignalR',
      topics: [
        {
          title: 'In-memory and distributed caching',
          description: 'IMemoryCache for per-process data with expirations and size limits, IDistributedCache backed by Redis for shared data across instances, HybridCache combining both with stampede protection, and serialisation costs.',
          concepts: ['IMemoryCache and expiration', 'IDistributedCache with Redis', 'HybridCache', 'Cache stampede protection', 'Serialisation cost'],
          quiz: [
            ['Why is IMemoryCache insufficient behind a load balancer?', 'Each instance has its own cache, so values diverge.'],
            ['What does HybridCache GetOrCreateAsync add over IDistributedCache?', 'A local layer, stampede protection and built-in serialisation.'],
          ],
          prereqs: ['Registering services'],
        },
        {
          title: 'Output caching and response caching',
          description: 'Output caching middleware stores responses server-side with policies, VaryByQuery and tags for eviction; response caching sets Cache-Control headers for clients and proxies. Choosing each and invalidating by tag.',
          concepts: ['AddOutputCache and policies', 'VaryByQuery and VaryByHeader', 'Tag-based eviction', 'Cache-Control headers'],
          quiz: [
            ['Where does output caching store responses?', 'Server-side, in memory or Redis, independent of client headers.'],
            ['How do you evict cached product pages after an update?', 'IOutputCacheStore.EvictByTagAsync("products").'],
          ],
          prereqs: ['In-memory and distributed caching'],
        },
        {
          title: 'Background services',
          description: 'BackgroundService with ExecuteAsync and a CancellationToken, PeriodicTimer loops, creating scopes to use scoped services, System.Threading.Channels for in-process queues, and graceful shutdown timeouts.',
          concepts: ['BackgroundService and ExecuteAsync', 'PeriodicTimer loops', 'Scopes inside hosted services', 'Channels as work queues', 'Graceful shutdown'],
          quiz: [
            ['What happens if ExecuteAsync throws?', 'By default the host stops; catch and log inside the loop.'],
            ['How does a request hand work to a background service?', 'Write to a bounded Channel the service reads from.'],
          ],
          prereqs: ['Registering services'],
        },
        {
          title: 'SignalR hubs',
          description: 'Hub classes with methods clients call, Clients.All, Caller, Group and User targets, MapHub registration, the JavaScript and .NET clients with automatic reconnect, and requiring authentication on hubs.',
          concepts: ['Hub methods and Clients targets', 'MapHub and transports', 'Groups and user targeting', 'JavaScript client and reconnect', 'Authorizing hubs'],
          quiz: [
            ['How do you send to one user across all their connections?', 'Clients.User(userId).SendAsync(...).'],
            ['Which transports does SignalR negotiate?', 'WebSockets, Server-Sent Events and long polling.'],
          ],
          prereqs: ['Authorization policies and requirements'],
        },
        {
          title: 'SignalR scaling and streaming',
          description: 'A Redis backplane or Azure SignalR Service so messages reach clients on every instance, strongly typed hubs with an interface, server-to-client streaming with IAsyncEnumerable, and sending from outside hubs through IHubContext.',
          concepts: ['Redis backplane', 'Azure SignalR Service', 'Strongly typed hubs', 'Streaming with IAsyncEnumerable', 'IHubContext from services'],
          quiz: [
            ['Why is a backplane needed with two instances?', 'A message sent on one instance must reach clients connected to the other.'],
            ['How does a background service push to clients?', 'Inject IHubContext<THub> and call Clients.'],
          ],
          prereqs: ['SignalR hubs'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'Unit testing with xUnit',
          description: '[Fact] and [Theory] with InlineData, mocking dependencies with NSubstitute or Moq, testing services and handlers in isolation, FluentAssertions for readable assertions, and testing minimal API handlers as static methods.',
          concepts: ['Fact and Theory tests', 'Mocking with NSubstitute or Moq', 'Testing services in isolation', 'FluentAssertions', 'Testing static handlers'],
          quiz: [
            ['What does [Theory] with [InlineData] do?', 'Runs the same test body for each data row.'],
            ['Why make minimal API handlers static methods?', 'They can be unit-tested directly without the host.'],
          ],
        },
        {
          title: 'Integration tests with WebApplicationFactory',
          description: 'Microsoft.AspNetCore.Mvc.Testing boots the real app in memory with a TestServer; CreateClient for requests, WithWebHostBuilder to replace services and configuration, and IClassFixture to share one factory per class.',
          concepts: ['WebApplicationFactory<Program>', 'CreateClient requests', 'Replacing services in ConfigureServices', 'Sharing the factory via IClassFixture'],
          quiz: [
            ['Why does the test project reference Program?', 'WebApplicationFactory<Program> needs the entry point type; add a partial Program class if top-level statements hide it.'],
            ['How do you swap the real email sender in tests?', 'In ConfigureTestServices, remove the registration and add a fake.'],
          ],
          prereqs: ['Unit testing with xUnit', 'The DI container and lifetimes'],
        },
        {
          title: 'Testing with databases',
          description: 'Why the EF InMemory provider hides relational bugs, SQLite in-memory as a cheap relational option, Testcontainers to run real PostgreSQL or SQL Server in Docker, and Respawn to reset data between tests.',
          concepts: ['Pitfalls of the InMemory provider', 'SQLite in-memory', 'Testcontainers for real databases', 'Resetting data with Respawn'],
          quiz: [
            ['What does the InMemory provider not enforce?', 'Foreign keys, constraints and SQL translation.'],
            ['Why keep a SQLite in-memory connection open?', 'The database disappears when the connection closes.'],
          ],
          prereqs: ['Integration tests with WebApplicationFactory', 'EF Core migrations'],
        },
        {
          title: 'Testing authentication and authorization',
          description: 'A test authentication handler that sets claims from headers, generating real JWTs with the test signing key, asserting 401 and 403 paths, and verifying ProblemDetails bodies for validation errors.',
          concepts: ['Test authentication handler', 'Issuing test JWTs', 'Asserting 401 and 403', 'Verifying ProblemDetails responses'],
          quiz: [
            ['How does a test handler pretend to be an admin?', 'It returns an AuthenticationTicket with a role claim.'],
            ['Why test the 403 path explicitly?', 'To prove policies deny authenticated users without the right claims.'],
          ],
          prereqs: ['Integration tests with WebApplicationFactory', 'Authorization policies and requirements'],
        },
      ],
    },
    {
      title: 'Performance and Deployment',
      topics: [
        {
          title: 'Performance fundamentals',
          description: 'Async all the way to keep threads free, avoiding sync-over-async deadlocks and thread-pool starvation, response compression, Kestrel request limits, minimising allocations on hot paths, and measuring with BenchmarkDotNet and dotnet-counters.',
          concepts: ['Async end to end', 'Thread-pool starvation', 'Response compression', 'Kestrel limits', 'BenchmarkDotNet and dotnet-counters'],
          quiz: [
            ['Why is .Result on a Task dangerous in a request?', 'It blocks a thread-pool thread and can starve or deadlock the pool.'],
            ['What does dotnet-counters show?', 'Live runtime metrics such as GC, thread-pool queue length and request rate.'],
          ],
          prereqs: ['The middleware pipeline'],
        },
        {
          title: 'Rate limiting and resilience',
          description: 'The built-in rate limiter middleware with fixed window, sliding window, token bucket and concurrency policies, partitioning by user or IP, 429 responses, and outbound resilience with Polly pipelines.',
          concepts: ['AddRateLimiter policies', 'Partitioning by client', 'Rejection status and headers', 'Polly resilience pipelines'],
          quiz: [
            ['Which algorithm allows short bursts while enforcing an average?', 'Token bucket.'],
            ['How is a policy applied to one endpoint group?', 'group.RequireRateLimiting("policyName").'],
          ],
          prereqs: ['HttpClientFactory and typed clients'],
        },
        {
          title: 'Publishing and Docker',
          description: 'dotnet publish with framework-dependent or self-contained output, ReadyToRun and trimming trade-offs, the official SDK and runtime images in a multi-stage Dockerfile, chiseled images, non-root users and the port conventions. Docker basics live in track-docker.',
          concepts: ['dotnet publish modes', 'ReadyToRun and trimming', 'Multi-stage Dockerfile with official images', 'Chiseled and non-root images', 'ASPNETCORE_HTTP_PORTS'],
          quiz: [
            ['Why use the sdk image only in the build stage?', 'The runtime image is far smaller and has no compiler.'],
            ['What port does the aspnet image listen on by default in .NET 8?', '8080, via ASPNETCORE_HTTP_PORTS.'],
          ],
          prereqs: ['Environments and startup behaviour'],
        },
        {
          title: 'Deploying to Azure and Linux',
          description: 'Azure App Service and Container Apps deployment, environment variables and Key Vault references, health probes, running on Linux with systemd behind nginx, and zero-downtime rollouts with EF migrations applied as a release step. Azure itself is covered in track-azure.',
          concepts: ['App Service and Container Apps', 'Key Vault references', 'systemd and nginx on Linux', 'Migrations as a release step', 'Rolling deployments'],
          quiz: [
            ['How does App Service know the app is healthy?', 'A configured health check path returning 200.'],
            ['Why run migrations before swapping traffic?', 'The new code expects the new schema.'],
          ],
          prereqs: ['Publishing and Docker', 'Health checks'],
        },
        {
          title: 'Production hardening',
          description: 'Data Protection key storage shared across instances, HTTPS redirection and HSTS, forwarded headers configured for the proxy, CORS with explicit origins, secrets from Key Vault or environment, and disabling detailed errors and Swagger outside Development.',
          concepts: ['Data Protection key ring', 'HSTS and HTTPS redirection', 'CORS policies', 'Secrets in production', 'Disabling development features'],
          quiz: [
            ['Why persist Data Protection keys to shared storage?', 'Cookies and tokens encrypted by one instance must be readable by others and after restarts.'],
            ['What happens to antiforgery tokens after a redeploy with ephemeral keys?', 'They become invalid, causing 400 errors on forms.'],
          ],
          prereqs: ['Deploying to Azure and Linux'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: task tracker API with Identity',
          description: 'Build a minimal API with EF Core models for users, projects and tasks, Identity with JWT tokens, policies so members see only their projects, validation with FluentValidation, ProblemDetails errors, OpenAPI docs and integration tests with Testcontainers.',
          concepts: ['Entities, DbContext and migrations', 'Identity and JWT setup', 'Ownership policies', 'Validation and ProblemDetails', 'Integration test suite'],
          quiz: [
            ['Where is project membership enforced?', 'A resource-based authorization handler used by every project endpoint.'],
            ['Why Testcontainers over the InMemory provider here?', 'The tests exercise real constraints and SQL.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce order service',
          description: 'Build controllers for catalogue, cart and checkout: EF Core relationships, concurrency tokens on stock, a transaction around order creation, output caching for the catalogue, a background service processing order emails from a Channel, and health checks.',
          concepts: ['Catalogue and order model', 'Checkout with concurrency control', 'Output-cached catalogue', 'Order processing background service', 'Health and readiness endpoints'],
          quiz: [
            ['How do you prevent overselling under concurrent checkouts?', 'A row version on stock plus retry on DbUpdateConcurrencyException.'],
            ['When must the catalogue cache be evicted?', 'On product updates, via tag-based eviction.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: real-time collaboration board',
          description: 'Build a Kanban board with SignalR: hubs for board updates, groups per board, JWT-authenticated connections, optimistic updates reconciled from the server, a Redis backplane for two instances, and a JavaScript client with reconnect.',
          concepts: ['Board and card persistence', 'Hub with per-board groups', 'Authenticated connections', 'Backplane across instances', 'Client reconnect handling'],
          quiz: [
            ['How do clients avoid seeing updates for other boards?', 'Each connection joins a group named for its board.'],
            ['What must the client do after reconnect?', 'Rejoin groups and fetch state it may have missed.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: containerised deployment with observability',
          description: 'Ship an existing service: multi-stage Dockerfile, configuration through environment and Key Vault, OpenTelemetry traces and metrics to a collector, Serilog JSON logs, health probes, rate limiting, migrations in a release job, and a CI pipeline to a container platform.',
          concepts: ['Image build and configuration', 'Telemetry export', 'Probes and rate limits', 'Release job with migrations', 'CI pipeline to a platform'],
          quiz: [
            ['What does the readiness probe check?', 'Database and cache connectivity, so traffic waits until dependencies are reachable.'],
            ['Why emit JSON logs?', 'Log platforms parse fields for search and correlation with traces.'],
          ],
          style: 'project',
        },
        {
          title: 'ASP.NET Core interview questions',
          description: 'The recurring questions: middleware order, DI lifetimes and captive dependencies, minimal APIs versus controllers, IQueryable versus IEnumerable, tracking versus AsNoTracking, authentication versus authorization, IOptions variants, and async pitfalls.',
          concepts: ['Pipeline and DI questions', 'EF Core questions', 'Auth and security questions', 'Async and performance questions'],
          quiz: [
            ['Explain scoped versus singleton lifetimes.', 'Scoped creates one instance per request scope; singleton one for the process lifetime.'],
            ['Why is IQueryable different from IEnumerable in EF Core?', 'IQueryable composes an expression translated to SQL; IEnumerable runs the rest in memory.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live-coding an ASP.NET Core endpoint',
          description: 'Practising the timed task: add an entity and migration, a minimal API group with validation and ProblemDetails, an authorization policy, and an integration test with WebApplicationFactory, within an hour and with clean async code.',
          concepts: ['Scoping the endpoint quickly', 'Entity, migration and route group', 'Validation and error responses', 'Integration test to finish'],
          quiz: [
            ['What do you write first in a timed task?', 'The entity and DbContext change, then a failing integration test.'],
            ['How do you show DI knowledge under pressure?', 'Inject services with correct lifetimes rather than newing them up.'],
          ],
        },
      ],
    },
  ],
})
