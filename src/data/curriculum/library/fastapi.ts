import { defineTrack } from '../define'

export const fastapi = defineTrack({
  id: 'track-fastapi',
  title: 'FastAPI',
  description: 'FastAPI from the first path operation to a production service: Pydantic v2 validation, dependency injection, async endpoints, routers and layered structure, SQLAlchemy and Alembic, OAuth2 and JWT auth, background tasks, WebSockets, testing, OpenAPI customisation and deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '⚡',
  tags: ['fastapi', 'python', 'backend', 'async', 'pydantic', 'sqlalchemy', 'openapi', 'rest'],
  languages: ['Python'],
  explainMode: 'concept',
  code: { label: 'Python with FastAPI', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python'],
  style: 'code',
  categories: [
    {
      title: 'Path Operations and Parameters',
      description: 'The request side of FastAPI: how URL, query and body data become typed Python arguments.',
      topics: [
        {
          title: 'Installing FastAPI and running with uvicorn',
          description: 'Installing fastapi with the standard extras, creating the FastAPI app object, serving it with uvicorn --reload, and what the generated /docs and /redoc pages show. FastAPI is an ASGI app built on Starlette, which explains where its features come from.',
          concepts: ['fastapi[standard] and uvicorn', 'The FastAPI app object', 'Interactive docs at /docs and /redoc', 'Starlette underneath FastAPI'],
          quiz: [
            ['Which command runs main.py with auto-reload?', 'uvicorn main:app --reload (or fastapi dev main.py).'],
            ['What generates the /docs page?', 'The OpenAPI schema FastAPI builds from your path operations and models.'],
          ],
        },
        {
          title: 'Path operations and path parameters',
          description: 'Decorators like @app.get and @app.post register path operations; path parameters declared with type hints are converted and validated, fixed paths must be declared before parameterised ones, Enum parameters restrict values, and Path() adds numeric constraints.',
          concepts: ['HTTP method decorators', 'Typed path parameters', 'Route declaration order', 'Enum path parameters', 'Path() constraints'],
          quiz: [
            ['What does GET /items/abc return when item_id is typed int?', 'A 422 with a validation error explaining the int parse failure.'],
            ['Why declare /users/me before /users/{user_id}?', 'Routes match in order, so "me" would otherwise be captured as a user_id.'],
          ],
          prereqs: ['Installing FastAPI and running with uvicorn'],
        },
        {
          title: 'Query parameters and validation',
          description: 'Function parameters that are not in the path become query parameters; defaults make them optional, list types accept repeated keys, and Annotated with Query() adds constraints like ge, max_length and regex plus metadata for the docs.',
          concepts: ['Query parameters from function arguments', 'Optional and default values', 'List query parameters', 'Annotated and Query() constraints'],
          quiz: [
            ['How do you make a query parameter required with no default?', 'Declare it without a default, or use Query() with no default under Annotated.'],
            ['What does ?tag=a&tag=b bind to?', 'A parameter typed list[str] receives ["a", "b"].'],
          ],
          prereqs: ['Path operations and path parameters'],
        },
        {
          title: 'Request bodies with Pydantic models',
          description: 'A parameter typed as a Pydantic model is read from the JSON body and validated; several models produce a keyed body, Body(embed=True) wraps a single one, and singular values need Body() to avoid being treated as query parameters.',
          concepts: ['Model parameters as JSON bodies', 'Multiple body parameters', 'Body(embed=True)', 'Mixing path, query and body'],
          quiz: [
            ['How does FastAPI decide a parameter is a body?', 'Its type is a Pydantic model (or it is declared with Body()).'],
            ['What happens with an invalid JSON body?', 'A 422 response listing each failing field under detail.'],
          ],
          prereqs: ['Query parameters and validation'],
        },
      ],
    },
    {
      title: 'Pydantic v2 Models',
      topics: [
        {
          title: 'BaseModel, Field and model configuration',
          description: 'Pydantic v2 models declare typed fields with defaults and Field() constraints, coerce or reject input in strict mode, and expose model_dump, model_dump_json and model_validate. ConfigDict controls extras, aliases and from_attributes.',
          concepts: ['Typed fields and defaults', 'Field() constraints and metadata', 'model_dump and model_validate', 'ConfigDict options'],
          quiz: [
            ['What does model_validate({"id": "5"}) do for an int field?', 'Coerces "5" to 5 in lax mode; strict mode raises.'],
            ['What does extra="forbid" change?', 'Unknown keys in the input cause a validation error instead of being ignored.'],
          ],
        },
        {
          title: 'Validators and computed fields',
          description: 'field_validator for one field with mode before or after, model_validator for rules across fields, raising ValueError to produce a clean 422, and computed_field for derived values that appear in output.',
          concepts: ['field_validator modes', 'model_validator for cross-field rules', 'Raising ValueError in validators', 'computed_field'],
          quiz: [
            ['When does a mode="before" validator run?', 'On the raw input before type coercion.'],
            ['How do you validate that end is after start?', 'A model_validator(mode="after") that compares self.start and self.end.'],
          ],
          prereqs: ['BaseModel, Field and model configuration'],
        },
        {
          title: 'Nested models, unions and discriminated unions',
          description: 'Models containing lists of models, Optional and union fields, Literal for fixed values, and discriminated unions with a discriminator field so Pydantic picks the right variant quickly and the OpenAPI schema shows oneOf.',
          concepts: ['Nested and list fields', 'Optional and union fields', 'Literal types', 'Discriminated unions'],
          quiz: [
            ['Why use a discriminator on a union of models?', 'Validation picks the variant by one field instead of trying each in turn, with clearer errors.'],
            ['What does Literal["card", "bank"] enforce?', 'The value must be exactly one of those strings.'],
          ],
          prereqs: ['BaseModel, Field and model configuration'],
        },
        {
          title: 'Response models and serialisation',
          description: 'response_model or the return annotation filters and validates output, separate Create, Update and Read schemas stop clients writing protected fields, response_model_exclude_unset supports PATCH semantics, and from_attributes reads ORM objects.',
          concepts: ['response_model and return annotations', 'Separate input and output schemas', 'exclude_unset and partial updates', 'from_attributes for ORM objects'],
          quiz: [
            ['Why return a UserRead model rather than the ORM user?', 'It strips fields like hashed_password and documents the exact shape.'],
            ['What does model_dump(exclude_unset=True) give for a PATCH body?', 'Only the fields the client actually sent.'],
          ],
          prereqs: ['Nested models, unions and discriminated unions'],
        },
      ],
    },
    {
      title: 'Responses, Errors and Uploads',
      topics: [
        {
          title: 'Status codes and response classes',
          description: 'Setting status_code on the decorator, returning JSONResponse, HTMLResponse, RedirectResponse, FileResponse or StreamingResponse directly, and setting headers and cookies through a Response parameter without giving up response_model.',
          concepts: ['status_code on the decorator', 'Response classes', 'Setting headers and cookies', 'StreamingResponse for large output'],
          quiz: [
            ['What status should a successful POST that creates a resource return?', '201 Created, via status_code=status.HTTP_201_CREATED.'],
            ['Does returning JSONResponse directly apply response_model?', 'No, the response bypasses serialisation and validation.'],
          ],
        },
        {
          title: 'HTTPException and custom exception handlers',
          description: 'Raising HTTPException with status, detail and headers, overriding the RequestValidationError handler to change the 422 shape, mapping domain exceptions to responses with @app.exception_handler, and keeping error bodies consistent.',
          concepts: ['Raising HTTPException', 'Custom RequestValidationError handler', 'Domain exceptions to responses', 'Consistent error envelopes'],
          quiz: [
            ['What does HTTPException(status_code=404, detail="Not found") produce?', 'A 404 JSON response {"detail": "Not found"}.'],
            ['How do you turn a NotFoundError from the service layer into a 404?', 'Register an exception_handler for that class that returns a JSONResponse.'],
          ],
          prereqs: ['Status codes and response classes'],
        },
        {
          title: 'Form data and file uploads',
          description: 'Form() for URL-encoded fields, File() and UploadFile for multipart uploads (which need python-multipart), reading uploads in chunks instead of memory, validating content type and size, and saving to disk or object storage.',
          concepts: ['Form() fields', 'UploadFile and File()', 'Streaming uploads in chunks', 'Validating type and size'],
          quiz: [
            ['Why can you not mix Form and JSON body in one operation?', 'The request body has one content type: multipart or JSON, not both.'],
            ['What advantage does UploadFile have over bytes?', 'It spools to disk beyond a threshold, so large files do not fill memory.'],
          ],
          prereqs: ['Status codes and response classes'],
        },
        {
          title: 'Headers, cookies and the Request object',
          description: 'Header() and Cookie() parameters with automatic underscore-to-hyphen conversion, the raw Request for client host, URL and body, request.state for per-request data set by middleware, and url_for to build links.',
          concepts: ['Header() and Cookie() parameters', 'The Request object', 'request.state', 'url_for and building links'],
          quiz: [
            ['How does a parameter named user_agent map to a header?', 'FastAPI converts underscores to hyphens: User-Agent.'],
            ['When do you need the raw Request?', 'For the client address, raw body, or values set on request.state.'],
          ],
        },
      ],
    },
    {
      title: 'Dependency Injection and Settings',
      topics: [
        {
          title: 'Depends fundamentals',
          description: 'Depends() declares a callable whose result is injected; dependencies can take their own parameters, be classes, depend on other dependencies, and are cached once per request so shared sub-dependencies run once.',
          concepts: ['Depends() with functions', 'Class-based dependencies', 'Sub-dependency trees', 'Per-request dependency caching'],
          quiz: [
            ['How does FastAPI know what a dependency needs?', 'It inspects the dependency signature and resolves its parameters like a path operation.'],
            ['How do you disable caching of one dependency?', 'Depends(fn, use_cache=False).'],
          ],
          prereqs: ['Query parameters and validation'],
        },
        {
          title: 'Dependencies with yield',
          description: 'A generator dependency runs code before yield to set up and after yield to tear down, which is how database sessions and clients are opened and closed per request; exceptions from the endpoint reach the dependency for rollback.',
          concepts: ['Setup and teardown around yield', 'Session-per-request pattern', 'Handling exceptions after yield', 'Ordering of nested yield dependencies'],
          quiz: [
            ['When does the code after yield run?', 'After the response is generated, or when the endpoint raises.'],
            ['How does a session dependency roll back on error?', 'Wrap yield in try/except, call session.rollback(), then re-raise.'],
          ],
          prereqs: ['Depends fundamentals'],
        },
        {
          title: 'Router-level and global dependencies',
          description: 'dependencies=[Depends(...)] on a path operation, an APIRouter or the app runs checks like authentication without returning values, and app.dependency_overrides swaps implementations for tests or environments.',
          concepts: ['dependencies list on decorators', 'Router and app-wide dependencies', 'dependency_overrides mapping'],
          quiz: [
            ['What is the point of a dependency that returns nothing?', 'Side effects such as verifying a token or rate limiting before the endpoint runs.'],
            ['Where would you require auth on every route of a router?', 'APIRouter(dependencies=[Depends(get_current_user)]).'],
          ],
          prereqs: ['Depends fundamentals'],
        },
        {
          title: 'Settings with pydantic-settings',
          description: 'BaseSettings reads typed configuration from environment variables and .env files, validates it at startup, and a cached get_settings dependency lets endpoints and tests receive settings without global imports.',
          concepts: ['BaseSettings and env files', 'Typed, validated configuration', 'lru_cache settings dependency', 'Overriding settings in tests'],
          quiz: [
            ['What happens if a required setting is missing from the environment?', 'Instantiating Settings raises a ValidationError at startup.'],
            ['Why wrap get_settings in lru_cache?', 'To parse the environment once and reuse the same object.'],
          ],
          prereqs: ['Depends fundamentals'],
        },
      ],
    },
    {
      title: 'Async, Lifespan and Background Work',
      topics: [
        {
          title: 'async def versus def endpoints',
          description: 'async def endpoints run on the event loop and must only await non-blocking calls; plain def endpoints run in a threadpool so blocking libraries are safe. A blocking call inside async def stalls every request on the worker.',
          concepts: ['Event loop versus threadpool execution', 'Blocking calls inside async def', 'run_in_threadpool', 'Choosing async or sync per endpoint'],
          quiz: [
            ['What happens if you call time.sleep(5) in an async endpoint?', 'The whole event loop blocks for five seconds, stalling all requests.'],
            ['Is a sync SQLAlchemy session safe in a def endpoint?', 'Yes, FastAPI runs def endpoints in a threadpool.'],
          ],
        },
        {
          title: 'Async HTTP and database clients',
          description: 'httpx.AsyncClient for outbound calls, asyncpg or aiosqlite drivers behind async SQLAlchemy, creating one shared client or pool at startup instead of per request, and bounding concurrency with semaphores.',
          concepts: ['httpx.AsyncClient usage', 'Async database drivers', 'Shared clients and pools', 'Bounding concurrency'],
          quiz: [
            ['Why not create an httpx.AsyncClient per request?', 'Connection pools would never be reused, adding TLS handshakes to every call.'],
            ['Which driver does SQLAlchemy use for async PostgreSQL?', 'asyncpg, via the postgresql+asyncpg URL.'],
          ],
          prereqs: ['async def versus def endpoints'],
        },
        {
          title: 'Lifespan events and application state',
          description: 'The lifespan async context manager runs startup code before serving and cleanup after shutdown, replacing on_event; app.state holds shared resources like pools and clients that dependencies read from request.app.state.',
          concepts: ['lifespan context manager', 'Startup and shutdown ordering', 'app.state for shared resources', 'Reading state from dependencies'],
          quiz: [
            ['Where do you open a database pool?', 'Before yield in the lifespan function, closing it after yield.'],
            ['Why is @app.on_event("startup") discouraged?', 'It is deprecated in favour of the lifespan parameter.'],
          ],
          prereqs: ['Async HTTP and database clients'],
        },
        {
          title: 'Background tasks',
          description: 'BackgroundTasks runs a function after the response is sent, ideal for emails and notifications; it runs in the same process, so long or critical jobs belong in a queue such as Celery, arq or Dramatiq with retries.',
          concepts: ['BackgroundTasks parameter', 'Runs after the response', 'Limits of in-process tasks', 'Handing off to a task queue'],
          quiz: [
            ['When does a BackgroundTasks function run?', 'After the response has been sent to the client.'],
            ['Why not use BackgroundTasks for a 10-minute report?', 'It ties up the worker and is lost if the process restarts; use a queue.'],
          ],
          prereqs: ['async def versus def endpoints'],
        },
      ],
    },
    {
      title: 'Project Structure, Middleware and WebSockets',
      topics: [
        {
          title: 'APIRouter and project layout',
          description: 'Splitting endpoints into APIRouter modules with prefix and tags, include_router in main, and a layered layout of routers, schemas, services and repositories so business logic is testable without HTTP.',
          concepts: ['APIRouter prefix and tags', 'include_router composition', 'Routers, services, repositories layers', 'Keeping endpoints thin'],
          quiz: [
            ['What does APIRouter(prefix="/users", tags=["users"]) give?', 'All its routes start with /users and are grouped under users in the docs.'],
            ['Why keep logic out of endpoint functions?', 'Services can be unit-tested and reused by CLI or workers without a request.'],
          ],
          prereqs: ['Path operations and path parameters'],
        },
        {
          title: 'Middleware and CORS',
          description: 'Function middleware with @app.middleware("http") for timing and request ids, CORSMiddleware with explicit origins and credentials rules, GZipMiddleware and TrustedHostMiddleware, and how middleware order wraps the app.',
          concepts: ['HTTP middleware functions', 'CORSMiddleware configuration', 'GZip and TrustedHost middleware', 'Middleware ordering'],
          quiz: [
            ['Why does allow_origins=["*"] fail with allow_credentials=True?', 'Browsers reject wildcard origins on credentialed requests.'],
            ['Which middleware added last runs first?', 'The last added is outermost, so it sees the request first.'],
          ],
        },
        {
          title: 'Static files, templates and sub-applications',
          description: 'Mounting StaticFiles for assets, rendering HTML with Jinja2Templates and TemplateResponse, and mounting a separate ASGI app or legacy WSGI app under a path with app.mount.',
          concepts: ['StaticFiles mounts', 'Jinja2Templates rendering', 'Mounting sub-applications', 'WSGIMiddleware for legacy apps'],
          quiz: [
            ['What does app.mount("/static", StaticFiles(directory="static")) do?', 'Serves files from ./static under /static.'],
            ['Does a mounted app appear in the main OpenAPI schema?', 'No, mounted apps have their own routing and docs.'],
          ],
        },
        {
          title: 'WebSockets',
          description: '@app.websocket endpoints accept a connection, loop on receive_text or receive_json, handle WebSocketDisconnect, and use a connection manager to broadcast; dependencies still work, so tokens can be checked before accept.',
          concepts: ['WebSocket accept and receive loop', 'WebSocketDisconnect handling', 'Connection manager for broadcast', 'Authenticating WebSocket connections'],
          quiz: [
            ['How do you reject an unauthenticated WebSocket?', 'Validate the token in a dependency and close with code 1008 before accepting.'],
            ['What is raised when the client disconnects?', 'WebSocketDisconnect, which the receive loop should catch.'],
          ],
          prereqs: ['async def versus def endpoints', 'Depends fundamentals'],
        },
      ],
    },
    {
      title: 'Databases with SQLAlchemy and SQLModel',
      description: 'Persisting data from FastAPI. SQL itself lives in track-sql; this covers the integration.',
      topics: [
        {
          title: 'SQLAlchemy 2.0 setup and session dependency',
          description: 'A create_engine with a URL from settings, sessionmaker, DeclarativeBase models using Mapped and mapped_column, and a get_db yield dependency that provides a session per request and closes it afterwards.',
          concepts: ['Engine and sessionmaker', 'Mapped and mapped_column models', 'get_db yield dependency', 'Session scope per request'],
          quiz: [
            ['What does expire_on_commit=False avoid?', 'Lazy reloads of attributes after commit, which matter when returning objects from endpoints.'],
            ['Why one session per request?', 'It scopes a unit of work and connection to the request and releases it reliably.'],
          ],
          prereqs: ['Dependencies with yield'],
        },
        {
          title: 'SQLModel',
          description: 'SQLModel merges Pydantic and SQLAlchemy: classes with table=True are tables, base classes without it are schemas, Relationship links rows, and select() queries run through the session, at the cost of some SQLAlchemy flexibility.',
          concepts: ['table=True versus schema classes', 'Sharing a base for schemas and tables', 'Relationship in SQLModel', 'Trade-offs versus plain SQLAlchemy'],
          quiz: [
            ['Why define HeroBase, Hero(table=True) and HeroCreate?', 'To share fields while keeping the table model separate from input schemas.'],
            ['What does session.exec(select(Hero)).all() return?', 'A list of Hero instances.'],
          ],
          prereqs: ['SQLAlchemy 2.0 setup and session dependency'],
        },
        {
          title: 'CRUD patterns and relationship loading',
          description: 'Create with add, commit and refresh; read with select and scalars; update by mutating and committing; delete; offset and limit pagination; and selectinload or joinedload to avoid N+1 when serialising relationships.',
          concepts: ['add, commit and refresh', 'select with where and scalars', 'Offset and limit pagination', 'selectinload and joinedload'],
          quiz: [
            ['Why call session.refresh(obj) after commit?', 'To load database-generated values such as the id and defaults.'],
            ['What loads a list of posts with their authors in two queries?', 'select(Post).options(selectinload(Post.author)).'],
          ],
          prereqs: ['SQLAlchemy 2.0 setup and session dependency'],
        },
        {
          title: 'Async SQLAlchemy',
          description: 'create_async_engine with asyncpg, async_sessionmaker and AsyncSession, awaiting execute and commit, and why lazy loading raises MissingGreenlet in async code, so relationships must be eagerly loaded.',
          concepts: ['create_async_engine and AsyncSession', 'Awaiting execute and commit', 'MissingGreenlet and lazy loading', 'Eager loading in async sessions'],
          quiz: [
            ['Why does post.comments raise in an async session?', 'Lazy loading needs implicit I/O, which async sessions forbid.'],
            ['What replaces sessionmaker for async?', 'async_sessionmaker.'],
          ],
          prereqs: ['CRUD patterns and relationship loading', 'Async HTTP and database clients'],
        },
        {
          title: 'Alembic migrations',
          description: 'alembic init, pointing env.py at the metadata and settings URL, autogenerate diffs with their blind spots, upgrade and downgrade, and running migrations as a release step rather than create_all at startup.',
          concepts: ['alembic init and env.py', 'Autogenerate and its limits', 'upgrade and downgrade', 'Migrations as a release step'],
          quiz: [
            ['What does autogenerate miss?', 'Renames, some type changes and server defaults; review every generated file.'],
            ['Why not call Base.metadata.create_all in production?', 'It creates missing tables but never alters existing ones.'],
          ],
          prereqs: ['SQLAlchemy 2.0 setup and session dependency'],
        },
      ],
    },
    {
      title: 'Authentication and Security',
      description: 'Vulnerability classes are covered in track-web-security; here it is the FastAPI mechanics.',
      topics: [
        {
          title: 'OAuth2 password flow',
          description: 'OAuth2PasswordBearer declares where the token is obtained and reads the Authorization header; OAuth2PasswordRequestForm parses the login form; the token endpoint verifies credentials and returns a bearer token that Swagger UI can use.',
          concepts: ['OAuth2PasswordBearer', 'OAuth2PasswordRequestForm', 'The token endpoint', 'Authorize button in Swagger UI'],
          quiz: [
            ['What does OAuth2PasswordBearer(tokenUrl="token") do at runtime?', 'Reads the Bearer token from the Authorization header or returns 401.'],
            ['What content type does the login form send?', 'application/x-www-form-urlencoded with username and password fields.'],
          ],
          prereqs: ['Depends fundamentals'],
        },
        {
          title: 'Password hashing and JWT tokens',
          description: 'Hashing passwords with bcrypt or argon2 through pwdlib or passlib, creating JWTs with PyJWT including sub and exp claims, decoding and validating them, and a get_current_user dependency that loads the user or raises 401.',
          concepts: ['Hashing and verifying passwords', 'Creating JWTs with claims', 'Decoding and validating tokens', 'get_current_user dependency'],
          quiz: [
            ['Why include exp in a JWT?', 'So stolen tokens expire; decode rejects expired tokens.'],
            ['Which header should a 401 include?', 'WWW-Authenticate: Bearer.'],
          ],
          prereqs: ['OAuth2 password flow'],
        },
        {
          title: 'Scopes, roles and refresh tokens',
          description: 'SecurityScopes and Security() to require scopes per endpoint, role checks built as dependencies, short-lived access tokens with refresh token rotation, and revocation lists when logout must be immediate.',
          concepts: ['SecurityScopes and Security()', 'Role dependencies', 'Refresh token rotation', 'Token revocation strategies'],
          quiz: [
            ['How does a dependency read the scopes an endpoint requires?', 'Through a SecurityScopes parameter.'],
            ['Why rotate refresh tokens?', 'A reused old refresh token reveals theft and can invalidate the family.'],
          ],
          prereqs: ['Password hashing and JWT tokens'],
        },
        {
          title: 'API keys, HTTP auth and rate limiting',
          description: 'APIKeyHeader and APIKeyQuery for service clients, HTTPBearer and HTTPBasic helpers, cookie-based sessions for browser clients with CSRF in mind, and rate limiting with slowapi or a Redis counter dependency.',
          concepts: ['APIKeyHeader dependencies', 'HTTPBearer and HTTPBasic', 'Cookie sessions for browsers', 'Rate limiting with slowapi'],
          quiz: [
            ['Why prefer API keys in headers over query strings?', 'Query strings end up in logs and browser history.'],
            ['What does HTTPBasic give your dependency?', 'HTTPBasicCredentials with username and password.'],
          ],
          prereqs: ['OAuth2 password flow'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'TestClient basics',
          description: 'TestClient wraps the app with httpx so tests call endpoints synchronously without a server; asserting status codes and JSON, sending query parameters, headers and bodies, and organising tests with pytest fixtures.',
          concepts: ['TestClient(app) requests', 'Asserting status and JSON', 'Sending headers and bodies', 'pytest fixtures for the client'],
          quiz: [
            ['Does TestClient need uvicorn running?', 'No, it calls the ASGI app in-process.'],
            ['How do you send JSON in a test?', 'client.post("/items", json={...}).'],
          ],
        },
        {
          title: 'Overriding dependencies in tests',
          description: 'app.dependency_overrides replaces get_db, get_settings or get_current_user with test versions: a SQLite or transactional test database, fake settings and a fixed user, cleared after each test to avoid leaks.',
          concepts: ['Swapping get_db for a test database', 'Fake current user', 'Test settings override', 'Clearing overrides after tests'],
          quiz: [
            ['How do you skip real auth in a test?', 'app.dependency_overrides[get_current_user] = lambda: test_user.'],
            ['Why clear dependency_overrides in a fixture teardown?', 'Otherwise overrides leak into other tests.'],
          ],
          prereqs: ['TestClient basics', 'Router-level and global dependencies'],
        },
        {
          title: 'Async tests with httpx and pytest-asyncio',
          description: 'httpx.AsyncClient with ASGITransport to test async endpoints on a real event loop, pytest-asyncio or anyio markers, running lifespan in tests with asgi-lifespan, and async fixtures for sessions.',
          concepts: ['AsyncClient with ASGITransport', 'pytest-asyncio markers', 'Running lifespan in tests', 'Async fixtures'],
          quiz: [
            ['Why use AsyncClient instead of TestClient?', 'To run async fixtures and endpoints on one event loop, such as an async database session.'],
            ['Does ASGITransport trigger lifespan events?', 'No, use asgi-lifespan LifespanManager if startup code is needed.'],
          ],
          prereqs: ['TestClient basics'],
        },
        {
          title: 'Testing auth, WebSockets and validation errors',
          description: 'Fixtures that log in and return headers, checking 401 and 403 paths, client.websocket_connect for socket tests, and asserting the shape of 422 responses so API contracts stay stable.',
          concepts: ['Authenticated client fixtures', 'Asserting 401 and 403', 'websocket_connect tests', 'Asserting 422 error shapes'],
          quiz: [
            ['How do you test a WebSocket endpoint?', 'with client.websocket_connect("/ws") as ws: ws.send_text(...); ws.receive_text().'],
            ['What does a validation error response contain?', 'A detail list with loc, msg and type for each failure.'],
          ],
          prereqs: ['Overriding dependencies in tests'],
        },
      ],
    },
    {
      title: 'OpenAPI, Performance and Deployment',
      topics: [
        {
          title: 'OpenAPI customisation',
          description: 'Tags with descriptions, summary and description on operations, the responses dict for documented error codes, examples on models and parameters, operation ids for generated clients, and overriding app.openapi for global tweaks.',
          concepts: ['Tags metadata and operation summaries', 'Documenting responses per status', 'Examples in schemas', 'operation_id and client generation', 'Custom openapi() override'],
          quiz: [
            ['How do you document that an endpoint may return 404?', 'responses={404: {"model": ErrorOut, "description": "Not found"}} on the decorator.'],
            ['Why set operation_id explicitly?', 'Generated client method names become stable and readable.'],
          ],
        },
        {
          title: 'API versioning and deprecation',
          description: 'Versioning by router prefix (/v1, /v2) or separate mounted apps, sharing services across versions, deprecated=True to mark operations in docs, and include_in_schema=False for internal routes. Versioning strategy itself is discussed in track-rest-api.',
          concepts: ['Version prefixes per router', 'Shared services across versions', 'deprecated flag', 'Hiding routes from the schema'],
          quiz: [
            ['What does deprecated=True do?', 'Marks the operation as deprecated in OpenAPI and the docs UI without removing it.'],
            ['How do you keep /internal/metrics out of the docs?', 'include_in_schema=False.'],
          ],
          prereqs: ['APIRouter and project layout'],
        },
        {
          title: 'Performance tuning',
          description: 'Where FastAPI time goes: Pydantic validation of large responses, JSON encoding (ORJSONResponse), connection pool sizes, uvloop and httptools, caching with Redis, and profiling with py-spy under load from locust or k6.',
          concepts: ['ORJSONResponse and encoding cost', 'Validation cost of large responses', 'Pool sizes and concurrency', 'uvloop and httptools', 'Load testing and profiling'],
          quiz: [
            ['Why can response_model slow down a big list endpoint?', 'Every item is validated and re-serialised; consider returning a Response with pre-serialised bytes.'],
            ['What does uvloop change?', 'It replaces the default event loop with a faster libuv-based implementation.'],
          ],
          prereqs: ['async def versus def endpoints'],
        },
        {
          title: 'Serving with uvicorn and gunicorn',
          description: 'uvicorn with --workers for multiple processes, gunicorn managing UvicornWorker processes, --proxy-headers and --forwarded-allow-ips behind a load balancer, root_path when mounted under a prefix, and graceful shutdown.',
          concepts: ['uvicorn workers', 'gunicorn with UvicornWorker', 'Proxy headers and forwarded IPs', 'root_path behind a prefix', 'Graceful shutdown'],
          quiz: [
            ['Why set --proxy-headers?', 'So request.client and the scheme reflect the real client, not the load balancer.'],
            ['What does root_path fix?', 'Docs and generated URLs when the app is served under /api by a proxy.'],
          ],
          prereqs: ['Lifespan events and application state'],
        },
        {
          title: 'Docker and cloud deployment',
          description: 'A slim multi-stage Dockerfile with a non-root user, dependency layer caching, a HEALTHCHECK against /health, configuration through environment variables, migrations before rollout, and deploying to a container platform. Docker basics live in track-docker.',
          concepts: ['Multi-stage Dockerfile', 'Non-root user and health checks', 'Twelve-factor configuration', 'Migrations before rollout', 'Container platforms'],
          quiz: [
            ['Why copy requirements before the source in a Dockerfile?', 'So the dependency layer is cached until requirements change.'],
            ['Where should the database URL come from in a container?', 'An environment variable read by Settings, never baked into the image.'],
          ],
          prereqs: ['Serving with uvicorn and gunicorn', 'Alembic migrations'],
        },
        {
          title: 'Logging and observability',
          description: 'Configuring uvicorn and app loggers together, a request-id middleware that tags every log line, structured JSON logs with structlog, OpenTelemetry auto-instrumentation for traces, and Prometheus metrics via an instrumentator.',
          concepts: ['Uvicorn and application logging config', 'Request-id middleware', 'Structured logs with structlog', 'OpenTelemetry instrumentation', 'Prometheus metrics endpoint'],
          quiz: [
            ['Why propagate a request id?', 'To correlate all log lines and downstream calls of one request.'],
            ['What does opentelemetry-instrumentation-fastapi add?', 'A span per request with route, status and timing, exported to a tracing backend.'],
          ],
          prereqs: ['Middleware and CORS'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: task management API',
          description: 'Build a multi-user task API: SQLAlchemy models for users, projects and tasks, JWT auth with refresh tokens, per-user data isolation in the service layer, filtering and pagination, Alembic migrations, and a test suite with dependency overrides.',
          concepts: ['Models, schemas and migrations', 'Auth with access and refresh tokens', 'Scoped queries per user', 'Tests with overridden dependencies'],
          quiz: [
            ['Where do you enforce that users only see their tasks?', 'In the service or repository query, filtered by the current user id.'],
            ['Why separate TaskCreate from TaskRead?', 'Clients must not set owner_id or timestamps; output includes them.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: real-time chat with WebSockets',
          description: 'Build rooms with WebSocket connections, token authentication before accept, a connection manager for broadcast, message persistence, Redis pub/sub so multiple workers share rooms, and rate limiting per connection.',
          concepts: ['Room and message models', 'Authenticated WebSocket connections', 'Broadcast manager', 'Redis pub/sub across workers', 'Per-connection rate limits'],
          quiz: [
            ['Why is an in-memory connection manager not enough in production?', 'Each worker process has its own memory; Redis pub/sub links them.'],
            ['How do you handle a client that stops reading?', 'Send with a timeout and drop the connection when it stalls.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: file processing service',
          description: 'Build an upload API that streams files to object storage, enqueues processing to a worker (Celery or arq), exposes job status endpoints, sends completion webhooks with retries, and documents everything in OpenAPI.',
          concepts: ['Streaming uploads to storage', 'Job queue and worker', 'Status endpoints and polling', 'Outbound webhooks with retries'],
          quiz: [
            ['Why return 202 Accepted from the upload endpoint?', 'Processing is asynchronous; the client polls a status URL.'],
            ['How do you keep webhook deliveries idempotent for receivers?', 'Send a stable event id they can deduplicate on.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: production-ready service template',
          description: 'Assemble a reusable starter: layered structure, settings, async SQLAlchemy, Alembic, auth, structured logging with request ids, OpenTelemetry, health and readiness endpoints, Dockerfile, CI with tests and lint, and a deploy to a container platform.',
          concepts: ['Layered template layout', 'Observability wired in', 'Health and readiness endpoints', 'CI pipeline and container deploy'],
          quiz: [
            ['What is the difference between liveness and readiness?', 'Liveness says the process is alive; readiness says it can serve traffic, such as the database being reachable.'],
            ['What should CI fail on besides tests?', 'Lint, type checks and an Alembic check that models match migrations.'],
          ],
          style: 'project',
        },
        {
          title: 'FastAPI interview questions',
          description: 'The questions that recur: async def versus def, how Depends works and caches, Pydantic v2 validation flow, why response_model matters, OAuth2 password flow, lifespan versus on_event, and FastAPI versus Django and Flask trade-offs.',
          concepts: ['Async model questions', 'Dependency injection questions', 'Validation and schema questions', 'Framework comparison questions'],
          quiz: [
            ['Explain what happens when a sync def endpoint is called.', 'FastAPI runs it in a threadpool so it does not block the event loop.'],
            ['Why does FastAPI generate OpenAPI automatically?', 'Type hints and Pydantic models fully describe parameters and bodies.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live-coding a FastAPI endpoint',
          description: 'Practising the timed task: define Pydantic schemas, write a CRUD router backed by a session dependency, add auth with a dependency, handle 404 and 409 cleanly, and prove it with TestClient tests, all within an hour.',
          concepts: ['Schema-first design under time', 'Router with session dependency', 'Error paths and status codes', 'Quick TestClient coverage'],
          quiz: [
            ['What do you write first in a timed FastAPI task?', 'The schemas and a failing TestClient test for the endpoint.'],
            ['How do you show dependency injection knowledge quickly?', 'Use Depends for the session and current user rather than globals.'],
          ],
        },
      ],
    },
  ],
})
