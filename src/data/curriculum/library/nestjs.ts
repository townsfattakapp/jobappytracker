import { defineTrack } from '../define'

export const nestjs = defineTrack({
  id: 'track-nestjs',
  title: 'NestJS',
  description: 'Structured Node.js backends with NestJS: modules, controllers and providers, dependency injection, pipes, guards, interceptors and filters, configuration, TypeORM and Prisma, class-validator, Passport and JWT auth, GraphQL, WebSockets, microservice transports, testing and deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🐈',
  tags: ['nestjs', 'typescript', 'node', 'dependency-injection', 'typeorm', 'prisma', 'graphql', 'microservices'],
  languages: ['TypeScript'],
  explainMode: 'node',
  code: { label: 'TypeScript with NestJS', id: 'typescript', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-node'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started',
      description: 'A scaffolded app and the three building blocks every Nest application is made of.',
      topics: [
        {
          title: 'Installing the Nest CLI and scaffolding a project',
          description: 'Generating an app with nest new, what the CLI generators (nest g module, controller, service, resource) produce, and how nest start --watch compiles TypeScript with SWC or tsc.',
          concepts: ['nest new and package manager choice', 'nest generate and resource scaffolds', 'nest-cli.json and the build', 'Watch mode and debugging'],
          quiz: [
            ['What does nest g resource users create?', 'A module, controller, service, DTOs and entity for users, wired together.'],
            ['Which file tells the CLI where the source root is?', 'nest-cli.json.'],
          ],
        },
        {
          title: 'main.ts and the application bootstrap',
          description: 'NestFactory.create builds the DI container from the root module and returns an app you configure with global pipes, CORS and a prefix before listen; understanding this file is where every cross-cutting setup lives.',
          concepts: ['NestFactory.create and INestApplication', 'Global prefix and CORS', 'Choosing the Express or Fastify adapter', 'enableShutdownHooks and lifecycle events'],
          quiz: [
            ['Where do you register a global ValidationPipe?', 'In main.ts with app.useGlobalPipes(new ValidationPipe()).'],
            ['Which lifecycle hook runs when the app receives SIGTERM?', 'onModuleDestroy, beforeApplicationShutdown and onApplicationShutdown, if shutdown hooks are enabled.'],
          ],
          prereqs: ['Installing the Nest CLI and scaffolding a project'],
        },
        {
          title: 'Modules and the dependency graph',
          description: 'The @Module decorator declares controllers, providers, imports and exports; Nest builds a graph from the root module so a provider is only injectable where its module is imported and exported it.',
          concepts: ['@Module metadata fields', 'Feature modules and the root module', 'Exporting providers for other modules', 'Global modules', 'Shared module pattern'],
          quiz: [
            ['Why is a service undefined when injected in another module?', 'Its module did not export it, or the consuming module did not import that module.'],
            ['What does @Global() change?', 'The module\'s exports are available everywhere without importing it.'],
          ],
          prereqs: ['main.ts and the application bootstrap'],
        },
        {
          title: 'Controllers and route handlers',
          description: 'Classes decorated with @Controller map HTTP verbs to methods via @Get, @Post and friends, read parameters with @Param, @Query, @Body and @Headers, and set status codes and headers declaratively.',
          concepts: ['@Controller prefixes and @Get/@Post', 'Parameter decorators: Param, Query, Body', '@HttpCode, @Header and @Redirect', 'Route wildcards and versioning', 'Returning promises and observables'],
          quiz: [
            ['What status does a @Post handler return by default?', '201 Created.'],
            ['How do you read one path parameter?', '@Param("id") id: string.'],
          ],
          prereqs: ['Modules and the dependency graph'],
        },
      ],
    },
    {
      title: 'Providers and Dependency Injection',
      topics: [
        {
          title: 'Providers and @Injectable',
          description: 'Services are plain classes marked @Injectable so Nest can instantiate them and hand them to whoever asks; the decorator emits type metadata that the container reads to resolve constructor parameters.',
          concepts: ['@Injectable and emitDecoratorMetadata', 'Registering in a module\'s providers array', 'Services versus repositories versus helpers', 'Injecting one service into another'],
          quiz: [
            ['Why does DI need emitDecoratorMetadata in tsconfig?', 'So constructor parameter types are emitted for the container to read at runtime.'],
            ['What error appears when a dependency cannot be resolved?', 'Nest can\'t resolve dependencies of X (?, ...). Please make sure the argument at index n is available.'],
          ],
        },
        {
          title: 'Constructor injection and provider scopes',
          description: 'Providers are singletons by default; request scope creates one instance per request (useful for tenant context) at a performance cost, and transient scope gives each consumer its own instance.',
          concepts: ['Singleton scope by default', 'Scope.REQUEST and the REQUEST token', 'Scope.TRANSIENT', 'Scope bubbling to consumers', 'Durable providers for multi-tenancy'],
          quiz: [
            ['What happens when a singleton injects a request-scoped provider?', 'The singleton becomes request-scoped too, because scope bubbles up the chain.'],
            ['How do you access the current request in a request-scoped provider?', '@Inject(REQUEST) private request: Request.'],
          ],
          prereqs: ['Providers and @Injectable'],
        },
        {
          title: 'Custom providers: useValue, useFactory and useClass',
          description: 'Registering providers under string or symbol tokens with a fixed value, a factory that can inject other providers and be async, or a substitute class, which is how config objects, database clients and test doubles get wired.',
          concepts: ['Injection tokens and @Inject', 'useValue for constants and mocks', 'useFactory with inject array', 'useClass for swapping implementations', 'useExisting aliases'],
          quiz: [
            ['How do you inject a provider registered under a string token?', '@Inject("DATABASE_CONNECTION") private db: Db.'],
            ['Can a useFactory be async?', 'Yes, Nest awaits the returned promise before resolving dependants.'],
          ],
          prereqs: ['Providers and @Injectable'],
        },
        {
          title: 'Dynamic modules and forRoot patterns',
          description: 'Modules that accept options at import time (like TypeOrmModule.forRoot) by returning a DynamicModule from a static method, plus forRootAsync for options that depend on ConfigService, and the ConfigurableModuleBuilder.',
          concepts: ['Static forRoot returning DynamicModule', 'forRootAsync with useFactory', 'forFeature for per-module registration', 'ConfigurableModuleBuilder'],
          quiz: [
            ['Why does forRootAsync exist?', 'So module options can be built from injected providers such as ConfigService.'],
            ['What does a DynamicModule object contain?', 'module plus optional providers, imports, exports and controllers.'],
          ],
          prereqs: ['Custom providers: useValue, useFactory and useClass'],
        },
        {
          title: 'Circular dependencies and forwardRef',
          description: 'When two providers or modules import each other the container cannot order construction; forwardRef defers the reference, but the better fix is usually to extract the shared piece into a third module.',
          concepts: ['Detecting the circular dependency error', 'forwardRef on providers and modules', 'ModuleRef for lazy resolution', 'Refactoring to remove the cycle'],
          quiz: [
            ['What is the syntax to inject a provider through forwardRef?', '@Inject(forwardRef(() => OtherService)) private other: OtherService.'],
            ['Why prefer refactoring over forwardRef?', 'Cycles usually signal misplaced responsibilities and make modules hard to test in isolation.'],
          ],
          prereqs: ['Modules and the dependency graph'],
        },
      ],
    },
    {
      title: 'The Request Pipeline',
      description: 'The order Nest applies middleware, guards, interceptors, pipes and filters, and what each is for.',
      topics: [
        {
          title: 'Middleware in NestJS',
          description: 'Express-style functions or NestMiddleware classes applied via configure() in a module, running before guards for things like request logging, correlation ids and raw body capture.',
          concepts: ['NestMiddleware and configure()', 'Applying to routes and excluding paths', 'Functional middleware', 'Where middleware sits in the pipeline'],
          quiz: [
            ['Which runs first, middleware or guards?', 'Middleware.'],
            ['How do you apply middleware to all routes?', 'consumer.apply(LoggerMiddleware).forRoutes("*").'],
          ],
        },
        {
          title: 'Guards',
          description: 'Classes implementing CanActivate that decide from the ExecutionContext whether a handler runs, returning false to produce 403; guards are where authentication and authorization checks live and can read handler metadata via Reflector.',
          concepts: ['CanActivate and ExecutionContext', 'Reading metadata with Reflector', 'Controller, method and global guards', 'Guard execution order', 'Throwing versus returning false'],
          quiz: [
            ['What response does a guard returning false produce?', '403 Forbidden.'],
            ['How does a guard read the current handler?', 'context.getHandler(), and context.getClass() for the controller.'],
          ],
          prereqs: ['Middleware in NestJS'],
        },
        {
          title: 'Interceptors and RxJS',
          description: 'Interceptors wrap handler execution with an RxJS pipeline, letting you log timing, transform responses into an envelope, cache, or map errors; they see both before and after the handler runs.',
          concepts: ['NestInterceptor and CallHandler', 'Transforming responses with map', 'Timing and logging interceptors', 'Timeouts with timeout and catchError', 'Cache interceptor'],
          quiz: [
            ['What does next.handle() return?', 'An Observable of the handler\'s response stream.'],
            ['How do you set a per-route timeout?', 'An interceptor that pipes timeout(ms) and maps TimeoutError to RequestTimeoutException.'],
          ],
          prereqs: ['Guards'],
        },
        {
          title: 'Pipes and transformation',
          description: 'Pipes run on handler arguments to transform or validate them: ParseIntPipe turns "42" into 42 and rejects "abc" with 400, and custom PipeTransform classes handle anything else.',
          concepts: ['PipeTransform and ArgumentMetadata', 'ParseIntPipe, ParseUUIDPipe, ParseEnumPipe', 'DefaultValuePipe', 'Custom pipes and where to bind them'],
          quiz: [
            ['What does @Param("id", ParseIntPipe) do with "abc"?', 'Throws BadRequestException (400) before the handler runs.'],
            ['Where can a pipe be bound?', 'On a parameter, a method, a controller or globally.'],
          ],
          prereqs: ['Guards'],
        },
        {
          title: 'Exception filters and HttpException',
          description: 'Built-in HttpException subclasses map to status codes and a default JSON body; exception filters catch thrown errors to log them and shape the response, including unknown errors that would otherwise become bare 500s.',
          concepts: ['HttpException and its subclasses', 'ExceptionFilter and @Catch', 'ArgumentsHost and the platform response', 'Global filters and dependency injection', 'BaseExceptionFilter and unknown errors'],
          quiz: [
            ['What does throw new NotFoundException("No user") send?', '404 with {"statusCode":404,"message":"No user","error":"Not Found"}.'],
            ['How do you register a global filter that can inject services?', 'Provide it with the APP_FILTER token in a module.'],
          ],
          prereqs: ['Pipes and transformation'],
        },
      ],
    },
    {
      title: 'Validation, Serialisation and Configuration',
      topics: [
        {
          title: 'DTOs with class-validator and class-transformer',
          description: 'Request bodies become typed classes decorated with @IsString, @IsEmail, @Min and nested @ValidateNested, and class-transformer turns plain JSON into instances so the decorators can run.',
          concepts: ['DTO classes versus interfaces', 'Common validation decorators', 'Nested objects with @ValidateNested and @Type', 'Arrays and optional fields', 'Custom validation decorators'],
          quiz: [
            ['Why must DTOs be classes rather than interfaces?', 'Interfaces vanish at compile time; decorators need a runtime class.'],
            ['What is needed to validate a nested object?', '@ValidateNested() plus @Type(() => Child) so it is instantiated.'],
          ],
        },
        {
          title: 'Global ValidationPipe options',
          description: 'whitelist strips unknown fields, forbidNonWhitelisted rejects them, transform converts payloads and primitives to declared types, and the error factory shapes the 400 body; getting these right closes mass-assignment holes.',
          concepts: ['whitelist and forbidNonWhitelisted', 'transform and implicit conversion', 'PartialType and mapped types', 'Custom exceptionFactory', 'Validation groups'],
          quiz: [
            ['What does whitelist: true do?', 'Removes properties that have no validation decorator from the incoming object.'],
            ['What does PartialType(CreateUserDto) generate?', 'A DTO with every field optional but the same validators, used for updates.'],
          ],
          prereqs: ['DTOs with class-validator and class-transformer'],
        },
        {
          title: 'ConfigModule and environment validation',
          description: 'Loading .env files through ConfigModule, exposing typed values with ConfigService.get, namespaced config with registerAs, and validating variables at boot with Joi or class-validator so a missing secret fails fast.',
          concepts: ['ConfigModule.forRoot and isGlobal', 'ConfigService.get with types', 'registerAs namespaces', 'Boot-time schema validation with Joi', 'Per-environment files'],
          quiz: [
            ['Why validate environment variables at startup?', 'A missing or malformed value crashes immediately instead of failing on the first request.'],
            ['How do you read a nested namespaced value?', 'configService.get("database.host") after registerAs("database", ...).'],
          ],
        },
        {
          title: 'Serialisation with ClassSerializerInterceptor',
          description: 'Controlling response shape by returning class instances and letting @Exclude, @Expose and @Transform decide what leaves the server, so password hashes never appear in JSON.',
          concepts: ['ClassSerializerInterceptor', '@Exclude and @Expose', '@Transform for computed fields', 'Serialization groups', 'Returning entities versus response DTOs'],
          quiz: [
            ['How do you hide a password field in responses?', 'Decorate it with @Exclude() and enable ClassSerializerInterceptor.'],
            ['Does the serializer work on plain objects?', 'No, the handler must return class instances (or use plainToInstance).'],
          ],
          prereqs: ['DTOs with class-validator and class-transformer'],
        },
      ],
    },
    {
      title: 'Databases with TypeORM and Prisma',
      description: 'Two mainstream data layers; pick one per project. SQL itself lives in track-sql.',
      topics: [
        {
          title: 'TypeORM integration',
          description: 'TypeOrmModule.forRootAsync with connection options from ConfigService, forFeature to register entities per module, and injecting repositories with @InjectRepository.',
          concepts: ['TypeOrmModule.forRootAsync', 'forFeature and entity registration', '@InjectRepository and Repository<T>', 'synchronize and why it is dev-only', 'DataSource for raw access'],
          quiz: [
            ['Why is synchronize: true dangerous in production?', 'It alters tables automatically and can drop columns and data.'],
            ['How do you get a repository in a service?', '@InjectRepository(User) private users: Repository<User>.'],
          ],
        },
        {
          title: 'TypeORM entities, relations and repositories',
          description: 'Declaring columns and keys with decorators, OneToMany, ManyToOne and ManyToMany relations with join tables, and querying with find options, relations and the QueryBuilder for complex joins.',
          concepts: ['@Entity, @Column and @PrimaryGeneratedColumn', 'OneToMany, ManyToOne, ManyToMany', 'find options and relations', 'QueryBuilder joins and where', 'Eager versus lazy relations'],
          quiz: [
            ['How do you load posts with their author?', 'repo.find({ relations: { author: true } }) or a leftJoinAndSelect.'],
            ['What does @ManyToMany need in addition to the decorator?', '@JoinTable() on the owning side.'],
          ],
          prereqs: ['TypeORM integration'],
        },
        {
          title: 'Prisma integration',
          description: 'A PrismaService that extends PrismaClient and connects on module init, a schema.prisma describing models, the generated type-safe client, and the tradeoffs versus TypeORM (no decorators, explicit selects, great types).',
          concepts: ['schema.prisma and prisma generate', 'PrismaService with onModuleInit', 'Type-safe queries and select/include', 'Prisma versus TypeORM tradeoffs', 'Prisma Studio for inspection'],
          quiz: [
            ['What runs after editing schema.prisma?', 'prisma generate (and prisma migrate dev to apply changes).'],
            ['How does Prisma load a relation?', 'With include: { posts: true } on the query.'],
          ],
        },
        {
          title: 'Migrations with TypeORM and Prisma',
          description: 'Generating migrations from entity or schema diffs, reviewing the SQL before running it, running migrations in CI and deploy rather than at boot, and handling data migrations separately.',
          concepts: ['typeorm migration:generate and run', 'prisma migrate dev and deploy', 'Reviewing generated SQL', 'Data migrations as separate steps', 'Migrations in the deploy pipeline'],
          quiz: [
            ['Which Prisma command applies migrations in production?', 'prisma migrate deploy.'],
            ['Why not run migrations on app start?', 'Multiple instances may race, and a failed migration should stop the deploy, not the app.'],
          ],
          prereqs: ['TypeORM integration', 'Prisma integration'],
        },
        {
          title: 'Transactions and query performance',
          description: 'Wrapping multi-step writes in a transaction (QueryRunner or dataSource.transaction; prisma.$transaction), avoiding N+1 with joins or batched loads, indexing, and logging slow queries.',
          concepts: ['dataSource.transaction and QueryRunner', 'prisma.$transaction and interactive transactions', 'N+1 detection and batching', 'Pagination with take and skip versus cursors', 'Query logging and indexes'],
          quiz: [
            ['What must all repository calls inside a TypeORM transaction use?', 'The transactional EntityManager passed to the callback, not the injected repository.'],
            ['Why prefer cursor pagination for large tables?', 'OFFSET scans and discards rows; a cursor seeks directly with an index.'],
          ],
          prereqs: ['TypeORM entities, relations and repositories'],
        },
      ],
    },
    {
      title: 'Authentication and Authorization',
      topics: [
        {
          title: 'Passport and the local strategy',
          description: 'Wiring @nestjs/passport with a LocalStrategy whose validate() checks credentials against the users service using bcrypt or argon2, and an AuthGuard("local") on the login route.',
          concepts: ['PassportModule and PassportStrategy', 'LocalStrategy.validate', 'AuthGuard("local") on login', 'Password hashing with bcrypt or argon2', 'Attaching the user to the request'],
          quiz: [
            ['What does validate() return on success?', 'The user object, which Passport attaches as request.user.'],
            ['What happens when validate() returns null?', 'Passport throws UnauthorizedException (401).'],
          ],
        },
        {
          title: 'JWT authentication',
          description: 'Issuing signed access tokens with JwtModule after login, a JwtStrategy that extracts the bearer token and validates its signature and expiry, and a global JwtAuthGuard with a @Public decorator for exceptions.',
          concepts: ['JwtModule.registerAsync and secrets', 'JwtStrategy and ExtractJwt', 'Claims, expiry and clock skew', 'Global guard with a @Public decorator', 'Why not store tokens in localStorage'],
          quiz: [
            ['Where does JwtStrategy look for the token by default?', 'The Authorization: Bearer header via ExtractJwt.fromAuthHeaderAsBearerToken().'],
            ['How do you exempt one route from a global auth guard?', 'Set metadata with a @Public() decorator and have the guard check it via Reflector.'],
          ],
          prereqs: ['Passport and the local strategy'],
        },
        {
          title: 'Role-based guards and metadata',
          description: 'A @Roles decorator sets metadata, a RolesGuard reads it with Reflector and compares against request.user, and ownership checks go in services; this is Nest\'s idiom for authorization.',
          concepts: ['SetMetadata and custom decorators', 'RolesGuard with Reflector.getAllAndOverride', 'Ownership checks in services', 'Combining guards in order', 'CASL for fine-grained abilities'],
          quiz: [
            ['What does Reflector.getAllAndOverride do?', 'Reads metadata from the handler first, then the class, returning the first found.'],
            ['Why must RolesGuard run after the JWT guard?', 'It needs request.user, which the auth guard populates.'],
          ],
          prereqs: ['JWT authentication'],
        },
        {
          title: 'Refresh tokens, sessions and OAuth providers',
          description: 'Short-lived access tokens with rotating refresh tokens stored server-side, cookie-based sessions with express-session when that fits better, and social login via passport-google-oauth20 style strategies.',
          concepts: ['Refresh token rotation and revocation', 'httpOnly cookies for tokens', 'express-session and session guards', 'OAuth2 provider strategies', 'Logout and token invalidation'],
          quiz: [
            ['Why rotate refresh tokens?', 'A stolen refresh token becomes useless after its first use, and reuse can be detected.'],
            ['What cookie flags protect a token cookie?', 'httpOnly, Secure and SameSite.'],
          ],
          prereqs: ['JWT authentication'],
        },
      ],
    },
    {
      title: 'GraphQL and Real-time',
      description: 'GraphQL concepts themselves are covered in track-graphql; this category is the Nest wiring.',
      topics: [
        {
          title: 'GraphQL module: code-first and schema-first',
          description: 'GraphQLModule with the Apollo or Mercurius driver, code-first where @ObjectType and @Field decorators generate the schema, or schema-first where SDL files drive generated TypeScript types.',
          concepts: ['GraphQLModule.forRoot and drivers', 'Code-first with @ObjectType and @Field', 'Schema-first and definitions generation', 'autoSchemaFile and sorting', 'Playground and introspection settings'],
          quiz: [
            ['Which approach generates the .graphql schema from classes?', 'Code-first.'],
            ['What does autoSchemaFile: true do?', 'Generates the schema in memory instead of writing it to disk.'],
          ],
        },
        {
          title: 'Resolvers, arguments and DataLoader',
          description: '@Resolver classes with @Query, @Mutation, @Args and @ResolveField for nested fields, a per-request DataLoader to batch child lookups, and passing the request through context to guards.',
          concepts: ['@Resolver, @Query and @Mutation', '@Args and @InputType DTOs', '@ResolveField and @Parent', 'Request-scoped DataLoader', 'GqlExecutionContext in guards'],
          quiz: [
            ['How does a guard get the request in a GraphQL resolver?', 'GqlExecutionContext.create(context).getContext().req.'],
            ['Why must a DataLoader be request-scoped?', 'Its cache must not leak data between users or requests.'],
          ],
          prereqs: ['GraphQL module: code-first and schema-first'],
        },
        {
          title: 'WebSocket gateways',
          description: '@WebSocketGateway classes with Socket.IO or ws adapters, @SubscribeMessage handlers, the @WebSocketServer instance for broadcasting, and guards and pipes applied to socket messages.',
          concepts: ['@WebSocketGateway and adapters', '@SubscribeMessage and message bodies', '@WebSocketServer and broadcasting', 'Connection lifecycle hooks', 'Guards and exceptions on sockets'],
          quiz: [
            ['What does a handler return to reply to the sender only?', 'A WsResponse or plain value, which is emitted back to the emitting client.'],
            ['Which hooks track connect and disconnect?', 'OnGatewayConnection.handleConnection and OnGatewayDisconnect.handleDisconnect.'],
          ],
        },
        {
          title: 'Rooms, authentication and scaling sockets',
          description: 'Authenticating socket connections during the handshake, joining rooms per chat or tenant, and using the Redis adapter so events reach clients connected to other instances.',
          concepts: ['Handshake auth with tokens', 'Rooms and namespaces', 'Socket.IO Redis adapter', 'Custom IoAdapter', 'Rate limiting socket events'],
          quiz: [
            ['Why is a Redis adapter needed with multiple instances?', 'A broadcast only reaches sockets on the same process unless events are relayed through Redis.'],
            ['Where should a socket be authenticated?', 'In handleConnection or a custom adapter, using the handshake auth or cookies.'],
          ],
          prereqs: ['WebSocket gateways'],
        },
      ],
    },
    {
      title: 'Microservices and Background Work',
      topics: [
        {
          title: 'The microservices transport layer',
          description: 'NestFactory.createMicroservice and hybrid apps expose handlers over TCP, Redis, NATS, MQTT, RabbitMQ, Kafka or gRPC; ClientProxy sends messages to them, so services swap transports without touching business code.',
          concepts: ['createMicroservice and hybrid applications', 'Transport enum and options', 'ClientsModule and ClientProxy', 'Serialisation of messages', 'When a message broker beats HTTP'],
          quiz: [
            ['What is a hybrid application?', 'An HTTP app that also connects microservice listeners with connectMicroservice().'],
            ['Which class sends messages to another service?', 'ClientProxy, injected via ClientsModule.register.'],
          ],
        },
        {
          title: 'Message patterns and event patterns',
          description: '@MessagePattern handles request-response (send, which returns an Observable), @EventPattern handles fire-and-forget (emit); knowing which to use avoids blocking on work nobody waits for.',
          concepts: ['@MessagePattern and client.send', '@EventPattern and client.emit', 'Payload and Ctx decorators', 'Timeouts and error propagation', 'RpcException and filters'],
          quiz: [
            ['What does client.send() return?', 'A cold Observable; nothing is sent until it is subscribed or awaited via firstValueFrom.'],
            ['When is emit the right choice?', 'When the sender does not need a reply, such as publishing an OrderCreated event.'],
          ],
          prereqs: ['The microservices transport layer'],
        },
        {
          title: 'Kafka, RabbitMQ and Redis transports',
          description: 'Broker-specific behaviour: Kafka consumer groups and manual offset commits, RabbitMQ queues with acknowledgements and prefetch, Redis pub/sub without persistence, and picking one by delivery guarantee. Kafka itself lives in track-kafka.',
          concepts: ['Kafka consumer groups and partitions', 'RabbitMQ ack, noAck and prefetch', 'Redis pub/sub limitations', 'Delivery guarantees compared', 'Dead-letter handling'],
          quiz: [
            ['Why set noAck: false with RabbitMQ?', 'So a message is only removed after the handler acknowledges it.'],
            ['What does Redis transport lack compared with RabbitMQ?', 'Persistence and acknowledgements; messages are lost if no subscriber is listening.'],
          ],
          prereqs: ['Message patterns and event patterns'],
        },
        {
          title: 'Queues with BullMQ',
          description: '@nestjs/bullmq registers Redis-backed queues, producers add jobs with delays and retries, @Processor classes consume them in the same or a separate process, and Bull Board shows what is happening.',
          concepts: ['BullModule.forRoot and registerQueue', 'Adding jobs with options', '@Processor and WorkerHost', 'Retries, backoff and rate limits', 'Separate worker processes'],
          quiz: [
            ['How do you retry a failed job three times with exponential delay?', 'queue.add(name, data, { attempts: 3, backoff: { type: "exponential", delay: 1000 } }).'],
            ['Why run processors in a separate process?', 'Heavy jobs do not block the HTTP event loop.'],
          ],
        },
        {
          title: 'Scheduling, caching and in-process events',
          description: '@Cron and @Interval from @nestjs/schedule, CacheModule with a Redis store and the CacheInterceptor, and EventEmitterModule for decoupled in-process listeners.',
          concepts: ['@Cron, @Interval and @Timeout', 'CacheModule and cache-manager stores', 'CacheInterceptor and @CacheKey', 'EventEmitter2 and @OnEvent', 'Distributed locks for schedules'],
          quiz: [
            ['What problem do cron jobs have with several instances?', 'Each instance runs the job, so a lock or leader election is needed.'],
            ['How do you listen for an in-process event?', 'A method decorated with @OnEvent("order.created").'],
          ],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'Unit testing with Test.createTestingModule',
          description: 'Building a small module for the class under test, resolving it with module.get, and keeping tests fast by including only the providers the class needs.',
          concepts: ['Test.createTestingModule and compile', 'module.get and resolve', 'Jest configuration for Nest', 'Arrange, act, assert in services'],
          quiz: [
            ['Why use resolve() instead of get() for some providers?', 'Request- and transient-scoped providers need resolve().'],
            ['Which test runner does the CLI scaffold use?', 'Jest, with ts-jest or SWC.'],
          ],
        },
        {
          title: 'Mocking providers',
          description: 'Replacing repositories and external clients with useValue mocks or overrideProvider, jest.fn assertions, and getRepositoryToken for TypeORM repositories.',
          concepts: ['overrideProvider().useValue()', 'getRepositoryToken for TypeORM', 'jest.fn and mockResolvedValue', 'Mocking ConfigService and HttpService', 'Auto-mocking with useMocker'],
          quiz: [
            ['How do you inject a fake repository?', 'Provide { provide: getRepositoryToken(User), useValue: mockRepo }.'],
            ['What does overrideProvider do?', 'Swaps a provider in the testing module before compile().'],
          ],
          prereqs: ['Unit testing with Test.createTestingModule'],
        },
        {
          title: 'E2E tests with Supertest',
          description: 'Creating the full app in beforeAll, applying the same global pipes as main.ts, sending HTTP requests with supertest, and using a throwaway database or Testcontainers for real integration.',
          concepts: ['createNestApplication and init', 'Matching main.ts global setup', 'supertest request chains', 'Test database strategy', 'Cleaning up with app.close()'],
          quiz: [
            ['Why do e2e tests need the same global pipes as main.ts?', 'Otherwise validation and transformation behave differently from production.'],
            ['How do you assert a JSON body with supertest?', '.expect(200).expect((res) => expect(res.body.id).toBeDefined()).'],
          ],
          prereqs: ['Mocking providers'],
        },
        {
          title: 'Testing guards, pipes and interceptors',
          description: 'Instantiating pipeline classes directly with a mocked ExecutionContext, asserting thrown exceptions, and testing interceptors by subscribing to the returned Observable.',
          concepts: ['Mocking ExecutionContext', 'Testing pipes with transform()', 'Testing interceptor observables', 'Testing custom decorators'],
          quiz: [
            ['How do you test a pipe in isolation?', 'Call new ParsePipe().transform(value, metadata) and assert the result or thrown error.'],
            ['What does an interceptor test need to provide?', 'A fake CallHandler whose handle() returns of(value).'],
          ],
          prereqs: ['Unit testing with Test.createTestingModule'],
        },
      ],
    },
    {
      title: 'Production and Deployment',
      topics: [
        {
          title: 'Logging with Logger and Pino',
          description: 'The built-in Logger with contexts and levels, replacing it with nestjs-pino for structured JSON logs with request ids, and what to log at each level so production logs are searchable.',
          concepts: ['Built-in Logger and contexts', 'Log levels and bufferLogs', 'nestjs-pino and request correlation', 'Redacting secrets', 'Log shipping and formats'],
          quiz: [
            ['Why prefer JSON logs in production?', 'Log aggregators index fields, so filtering by requestId or userId is trivial.'],
            ['How do you use a custom logger during bootstrap?', 'NestFactory.create(AppModule, { bufferLogs: true }) then app.useLogger(app.get(Logger)).'],
          ],
        },
        {
          title: 'Health checks with Terminus',
          description: '@nestjs/terminus health controllers that ping the database, Redis, disk and memory, and how Kubernetes liveness and readiness probes consume them differently.',
          concepts: ['HealthCheckService and indicators', 'TypeOrm, Prisma and HTTP indicators', 'Liveness versus readiness', 'Custom health indicators'],
          quiz: [
            ['Difference between liveness and readiness?', 'Liveness restarts a stuck process; readiness removes it from load balancing until dependencies are healthy.'],
            ['What status does a failing check return?', '503 Service Unavailable with details per indicator.'],
          ],
        },
        {
          title: 'OpenAPI with @nestjs/swagger',
          description: 'Generating a spec from decorators (@ApiProperty, @ApiTags, @ApiResponse), the CLI plugin that infers DTO metadata, serving Swagger UI, and exporting the spec for client generation.',
          concepts: ['SwaggerModule.setup', '@ApiProperty and DTO metadata', 'CLI plugin for automatic metadata', '@ApiBearerAuth and security schemes', 'Exporting spec for clients'],
          quiz: [
            ['What does the swagger CLI plugin remove the need for?', 'Annotating every DTO property with @ApiProperty by hand.'],
            ['How do you document a JWT-protected route?', 'Add a bearer scheme in DocumentBuilder and @ApiBearerAuth() on the route.'],
          ],
        },
        {
          title: 'Performance: Fastify, compression and throttling',
          description: 'Switching to the Fastify adapter for throughput, compression and helmet middleware, the ThrottlerModule for rate limiting, and clustering or PM2 for multi-core use.',
          concepts: ['FastifyAdapter and its differences', 'helmet and compression', 'ThrottlerModule and ThrottlerGuard', 'Clustering and PM2', 'Profiling the event loop'],
          quiz: [
            ['What changes when switching to Fastify?', 'Request and reply objects differ, so Express-specific middleware must be replaced.'],
            ['How do you limit a route to 10 requests per minute?', '@Throttle({ default: { limit: 10, ttl: 60000 } }) with ThrottlerGuard applied.'],
          ],
        },
        {
          title: 'Building and deploying with Docker',
          description: 'nest build output in dist, a multi-stage Dockerfile that installs production dependencies only, environment injection, graceful shutdown on SIGTERM, and running behind a reverse proxy. Docker itself lives in track-docker.',
          concepts: ['nest build and dist layout', 'Multi-stage Dockerfile for Node', 'Graceful shutdown hooks', 'Trust proxy and forwarded headers', 'Container health and restart policy'],
          quiz: [
            ['Why enableShutdownHooks in containers?', 'So SIGTERM lets in-flight requests and connections close before exit.'],
            ['Which npm command installs without dev dependencies?', 'npm ci --omit=dev.'],
          ],
          prereqs: ['Logging with Logger and Pino'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: task management API with TypeORM and JWT',
          description: 'Build a multi-user task API: users, projects and tasks with TypeORM relations, JWT auth with refresh rotation, role guards, validated DTOs, Swagger docs, migrations and e2e tests against Postgres.',
          concepts: ['Model users, projects and tasks', 'Auth module with refresh tokens', 'Guards, DTOs and serialisation', 'Migrations and seed script', 'E2E suite with a test database'],
          quiz: [
            ['How do you stop a user reading another user\'s tasks?', 'Scope every query by the authenticated user id inside the service.'],
            ['Where should the Swagger spec be served?', 'A /docs route, disabled or protected in production.'],
          ],
        },
        {
          title: 'Project: real-time chat with WebSocket gateways',
          description: 'A chat service with authenticated Socket.IO connections, rooms per conversation, message persistence with Prisma, typing indicators, a Redis adapter for multiple instances and a REST endpoint for history.',
          concepts: ['Gateway with handshake auth', 'Rooms and message persistence', 'Redis adapter for scale-out', 'History endpoint with cursor pagination', 'Gateway tests with socket.io-client'],
          quiz: [
            ['How does a client join a conversation room?', 'A subscribed message handler calls client.join(roomId) after checking membership.'],
            ['Why paginate history with a cursor?', 'New messages keep arriving, so offsets would shift between pages.'],
          ],
        },
        {
          title: 'Project: order processing with microservices',
          description: 'An API gateway plus order, inventory and notification services talking over RabbitMQ or Kafka; events for OrderCreated and StockReserved, retries with dead-letter queues, and an outbox table for reliable publishing.',
          concepts: ['Gateway and service boundaries', 'Event patterns and message patterns', 'Outbox pattern for publishing', 'Dead-letter queues and retries', 'Contract tests between services'],
          quiz: [
            ['Why use an outbox table?', 'Writing the order and the event in one transaction guarantees the event is published even if the broker is down.'],
            ['What should the notification service use, send or emit?', 'emit; nobody waits for the email.'],
          ],
        },
        {
          title: 'Project: GraphQL API with Prisma',
          description: 'A code-first GraphQL API for a bookshelf app: types, queries, mutations, DataLoader for authors, JWT guards on resolvers, cursor pagination and subscriptions for new reviews.',
          concepts: ['Code-first types and inputs', 'Resolvers with DataLoader', 'Guards on resolvers', 'Relay-style pagination', 'Subscriptions with PubSub'],
          quiz: [
            ['What problem does DataLoader solve here?', 'Fetching each book\'s author in one batched query instead of one per book.'],
            ['Which context lets a guard read the GraphQL request?', 'GqlExecutionContext.'],
          ],
        },
        {
          title: 'NestJS interview questions',
          description: 'What interviewers ask: the request pipeline order, provider scopes, dynamic modules, guards versus middleware, why DTOs are classes, and how Nest differs from plain Express.',
          concepts: ['Pipeline order questions', 'DI and scope questions', 'Nest versus Express questions', 'Testing strategy questions'],
          quiz: [
            ['List the pipeline order.', 'Middleware, guards, interceptors (before), pipes, handler, interceptors (after), exception filters.'],
            ['When would you choose request scope?', 'For per-request context such as tenant or locale, accepting the instantiation cost.'],
          ],
          style: 'reading',
        },
        {
          title: 'NestJS architecture and design questions',
          description: 'Designing module boundaries for a growing app, deciding between a monolith with modules and microservices transports, structuring auth, and reviewing a service that mixes HTTP concerns with business logic.',
          concepts: ['Module boundary design', 'Monolith versus microservice transport', 'Layering controllers, services, repositories', 'Reviewing leaky abstractions'],
          quiz: [
            ['Why keep HTTP objects out of services?', 'Services can then be reused from GraphQL, WebSocket and microservice handlers and tested without HTTP.'],
            ['What signals a module should be split?', 'Unrelated providers, a growing imports list and teams stepping on each other.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
