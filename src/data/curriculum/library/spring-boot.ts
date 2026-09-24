import { defineTrack } from '../define'

export const springBoot = defineTrack({
  id: 'track-spring-boot',
  title: 'Spring Boot',
  description: 'Spring Boot 3 from the IoC container to production: dependency injection, starters and auto-configuration, profiles, REST controllers, validation and ProblemDetail errors, JPA and transactions, security, slice tests and Testcontainers, caching, messaging, Actuator and tracing, Docker, Spring Cloud, and four deployable projects.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🍃',
  tags: ['spring', 'spring boot', 'java', 'backend', 'rest', 'jpa', 'microservices', 'testcontainers'],
  languages: ['Java'],
  explainMode: 'concept',
  code: { label: 'Java with Spring Boot', id: 'java', fixed: true },
  supports: { coding: true, labs: true, project: true },
  prerequisites: ['track-java'],
  style: 'code',
  categories: [
    {
      title: 'Spring Fundamentals and Dependency Injection',
      description: 'What the container actually does before any Boot magic is layered on top.',
      topics: [
        {
          title: 'Inversion of control and the ApplicationContext',
          description: 'Why objects should receive their collaborators instead of constructing them, how the ApplicationContext builds a graph of beans from metadata, and what it means that Spring owns object lifecycles.',
          concepts: ['Inversion of control', 'BeanFactory versus ApplicationContext', 'Bean definitions and metadata', 'Container startup sequence'],
          quiz: [
            ['What does the ApplicationContext add over a plain BeanFactory?', 'Eager singleton creation, events, i18n, resource loading and AOP integration.'],
            ['Who calls new on a bean?', 'The container, based on bean definitions, not application code.'],
          ],
        },
        {
          title: 'Beans, stereotypes and component scanning',
          description: '@Component, @Service, @Repository and @Controller mark classes for discovery; how @ComponentScan picks a base package and why the main class location decides what Boot sees.',
          concepts: ['Stereotype annotations', 'Component scanning and base packages', 'Bean naming rules', 'Repository exception translation'],
          quiz: [
            ['Why place the @SpringBootApplication class in the root package?', 'Component scanning starts there, so sub-packages are found automatically.'],
            ['What extra does @Repository give beyond @Component?', 'Persistence exception translation into DataAccessException.'],
          ],
          prereqs: ['Inversion of control and the ApplicationContext'],
        },
        {
          title: 'Constructor, setter and field injection',
          description: 'How Spring resolves dependencies by type and then by name, why constructor injection makes beans immutable and testable, and how @Qualifier, @Primary and Optional handle ambiguity.',
          concepts: ['Constructor injection as the default', 'Why field injection hurts tests', 'Resolving by type then name', '@Qualifier and @Primary', 'Injecting collections and Optional'],
          quiz: [
            ['When can @Autowired be omitted on a constructor?', 'When the class has exactly one constructor.'],
            ['What happens with two beans of the same type and no qualifier?', 'NoUniqueBeanDefinitionException at startup.'],
          ],
          prereqs: ['Beans, stereotypes and component scanning'],
        },
        {
          title: 'Bean scopes and lifecycle callbacks',
          description: 'Singleton by default, prototype, request and session scopes, what a scoped proxy does when a singleton depends on a request bean, and @PostConstruct, @PreDestroy and InitializingBean hooks.',
          concepts: ['Singleton versus prototype scope', 'Web scopes and scoped proxies', '@PostConstruct and @PreDestroy', 'Lazy initialisation'],
          quiz: [
            ['Is a Spring singleton one per JVM?', 'No, one per ApplicationContext.'],
            ['How does a singleton get a fresh request-scoped bean each call?', 'Through a scoped proxy injected in its place.'],
          ],
          prereqs: ['Constructor, setter and field injection'],
        },
        {
          title: '@Configuration and @Bean methods',
          description: 'Declaring beans for classes you do not own, how CGLIB proxies make @Bean calls inside a @Configuration return the same singleton, and proxyBeanMethods=false for lite mode.',
          concepts: ['@Bean factory methods', 'Configuration class proxying', 'proxyBeanMethods and lite mode', 'Importing configurations'],
          quiz: [
            ['Why does calling a @Bean method twice return one instance?', 'The @Configuration class is subclassed by CGLIB to intercept the call.'],
            ['When would you use a @Bean instead of @Component?', 'For third-party classes or when construction needs logic.'],
          ],
          prereqs: ['Bean scopes and lifecycle callbacks'],
        },
        {
          title: 'Conditional beans and ordering',
          description: '@Conditional, @ConditionalOnProperty, @ConditionalOnMissingBean and @Profile decide whether a bean exists; @Order and @DependsOn shape ordering; this is the mechanism Boot auto-configuration is built on.',
          concepts: ['@ConditionalOnProperty and friends', '@ConditionalOnMissingBean as the override hook', '@Order and Ordered', '@DependsOn'],
          quiz: [
            ['How does a user-defined bean replace an auto-configured one?', 'The auto-configuration uses @ConditionalOnMissingBean, so the user bean wins.'],
            ['Does @Order affect injection of a single bean?', 'No, only the order of beans in injected lists.'],
          ],
          prereqs: ['@Configuration and @Bean methods'],
        },
        {
          title: 'AOP and proxies behind @Transactional',
          description: 'How Spring wraps beans in JDK or CGLIB proxies to add behaviour, why a self-invocation bypasses @Transactional, @Cacheable and @Async, and how to write an @Aspect for cross-cutting logging.',
          concepts: ['JDK versus CGLIB proxies', 'Advice, pointcut and join point', 'The self-invocation trap', 'Writing an @Aspect'],
          quiz: [
            ['Why does calling this.save() from another method in the same bean skip @Transactional?', 'The call does not go through the proxy that applies the transaction.'],
            ['Which proxy type does Boot use by default?', 'CGLIB class proxies, even when interfaces exist.'],
          ],
          prereqs: ['Conditional beans and ordering'],
        },
      ],
    },
    {
      title: 'Project Structure and Starters',
      description: 'What a generated Boot project contains and why it starts with zero XML.',
      topics: [
        {
          title: 'Creating a project with Spring Initializr',
          description: 'Generating a Boot 3 project with Java 17+, choosing Maven or Gradle, picking starters, and what the wrapper scripts, parent POM and generated main class give you.',
          concepts: ['Initializr options', 'Maven versus Gradle wrappers', 'Spring Boot parent and BOM', 'Java baseline and Jakarta namespace'],
          quiz: [
            ['What is the minimum Java for Spring Boot 3?', 'Java 17.'],
            ['Why did javax.* imports break in Boot 3?', 'Jakarta EE 9 moved packages to jakarta.*.'],
          ],
        },
        {
          title: 'Starters and dependency management',
          description: 'spring-boot-starter-web pulls in MVC, Jackson and Tomcat with matching versions; how the BOM pins versions, how to exclude a transitive dependency, and how to swap Tomcat for Jetty or Undertow.',
          concepts: ['What a starter bundles', 'Version alignment through the BOM', 'Excluding and swapping dependencies', 'Optional and test scopes'],
          quiz: [
            ['Why do you not write versions for starters?', 'The Spring Boot BOM manages them.'],
            ['How do you run on Jetty?', 'Exclude spring-boot-starter-tomcat and add spring-boot-starter-jetty.'],
          ],
          prereqs: ['Creating a project with Spring Initializr'],
        },
        {
          title: 'Auto-configuration and @SpringBootApplication',
          description: 'How AutoConfiguration.imports lists candidates, how conditions on classpath and beans decide what activates, and how to read the auto-configuration report to see why something did or did not happen.',
          concepts: ['@EnableAutoConfiguration mechanics', 'AutoConfiguration.imports', 'Reading the conditions report', 'Excluding an auto-configuration'],
          quiz: [
            ['How do you see which auto-configurations matched?', 'Run with --debug or open the /actuator/conditions endpoint.'],
            ['Which annotation combines configuration, scanning and auto-config?', '@SpringBootApplication.'],
          ],
          prereqs: ['Starters and dependency management'],
        },
        {
          title: 'Package layout and layering',
          description: 'Organising controllers, services, repositories and domain by feature or by layer, keeping the web layer free of entities, and why package-private classes and ArchUnit tests keep boundaries honest.',
          concepts: ['Package by feature versus by layer', 'Controller-service-repository roles', 'DTOs at the boundary', 'Enforcing boundaries with ArchUnit'],
          quiz: [
            ['Why not return JPA entities from controllers?', 'It leaks persistence details, risks lazy-loading errors and couples the API to the schema.'],
            ['What does package-by-feature improve?', 'Cohesion: everything about orders lives together and can be package-private.'],
          ],
        },
        {
          title: 'Running, packaging and the fat jar',
          description: 'mvn spring-boot:run versus java -jar, how the repackaged jar nests dependencies and boots with a custom launcher, layered jars for Docker, and the difference between jar and war packaging.',
          concepts: ['spring-boot:run and DevTools', 'The repackaged executable jar', 'Layered jar and jarmode tools', 'Jar versus war deployment'],
          quiz: [
            ['Why is a Boot jar not a normal jar?', 'It nests dependency jars and uses JarLauncher to load them.'],
            ['What do layered jars enable?', 'Docker layers that cache dependencies separately from application code.'],
          ],
          prereqs: ['Starters and dependency management'],
        },
        {
          title: 'Logging with Logback and SLF4J',
          description: 'Boot configures Logback behind SLF4J: setting levels per package, log groups, file output, logback-spring.xml, structured JSON logging and MDC for correlating one request across lines.',
          concepts: ['Levels per package in properties', 'logback-spring.xml and profiles', 'Structured JSON logging', 'MDC for request context'],
          quiz: [
            ['How do you set SQL logging for Hibernate only?', 'logging.level.org.hibernate.SQL=DEBUG'],
            ['What is MDC for?', 'Attaching per-thread context like a request id to every log line.'],
          ],
        },
      ],
    },
    {
      title: 'Configuration and Profiles',
      description: 'Externalising everything that differs between laptop, CI and production.',
      topics: [
        {
          title: 'application.properties and YAML',
          description: 'Where Boot reads configuration from and in what precedence: command line, environment variables, application-{profile}.yml, application.yml, and how relaxed binding maps SERVER_PORT to server.port.',
          concepts: ['Property source precedence', 'YAML multi-document files', 'Relaxed binding rules', 'Placeholders and defaults'],
          quiz: [
            ['Which wins: an environment variable or application.yml?', 'The environment variable.'],
            ['How does MY_APP_TIMEOUT map to a property?', 'my.app.timeout through relaxed binding.'],
          ],
        },
        {
          title: 'Type-safe settings with @ConfigurationProperties',
          description: 'Binding a prefix to a class or record with validation, nested groups, lists and durations, why it beats scattered @Value, and how the metadata processor gives IDE completion.',
          concepts: ['@ConfigurationProperties on records', 'Nested and list properties', 'Duration and DataSize conversion', 'Validating bound properties', '@Value for one-off values'],
          quiz: [
            ['How do you enable a @ConfigurationProperties class?', '@EnableConfigurationProperties or @ConfigurationPropertiesScan.'],
            ['What does spring-boot-configuration-processor produce?', 'Metadata JSON for IDE autocompletion of your properties.'],
          ],
          prereqs: ['application.properties and YAML'],
        },
        {
          title: 'Profiles for environments',
          description: 'Activating dev, test and prod profiles, profile-specific files and @Profile beans, profile groups, and why profiles should select configuration rather than branch business logic.',
          concepts: ['spring.profiles.active', 'Profile-specific property files', '@Profile on beans', 'Profile groups and defaults'],
          quiz: [
            ['What file loads for the prod profile?', 'application-prod.yml on top of application.yml.'],
            ['How do you activate several profiles at once?', 'spring.profiles.active=prod,eu or a profile group.'],
          ],
          prereqs: ['application.properties and YAML'],
        },
        {
          title: 'Secrets and external configuration',
          description: 'Keeping credentials out of the repository with environment variables, spring.config.import for files and config trees, mounted Kubernetes secrets, and Vault or cloud secret managers.',
          concepts: ['Environment variables for secrets', 'spring.config.import', 'Config trees from mounted volumes', 'Vault and cloud secret managers'],
          quiz: [
            ['What does spring.config.import=optional:file:./local.yml do?', 'Loads that file if present without failing when it is missing.'],
            ['How do Kubernetes secrets reach a Boot app without env vars?', 'As a config tree of files mounted into a directory.'],
          ],
          prereqs: ['Profiles for environments'],
        },
        {
          title: 'Startup customisation and command-line runners',
          description: 'SpringApplication options, banner and lazy init, CommandLineRunner and ApplicationRunner for work at startup, and lifecycle events such as ApplicationReadyEvent for warmups.',
          concepts: ['SpringApplicationBuilder options', 'CommandLineRunner and ApplicationRunner', 'Application lifecycle events', 'Graceful shutdown'],
          quiz: [
            ['When does ApplicationReadyEvent fire?', 'After the context is refreshed and runners have completed.'],
            ['What does server.shutdown=graceful change?', 'In-flight requests finish before the server stops.'],
          ],
        },
        {
          title: 'Embedded server tuning',
          description: 'Port, context path, thread pool sizes, connection and request timeouts, HTTP/2, compression and the difference between Tomcat threads and virtual threads in Boot 3.2+.',
          concepts: ['server.port and context path', 'Tomcat thread pool settings', 'Compression and HTTP/2', 'Virtual threads with spring.threads.virtual.enabled'],
          quiz: [
            ['What does spring.threads.virtual.enabled=true do?', 'Tomcat handles each request on a virtual thread.'],
            ['What is the default Tomcat max thread count?', '200.'],
          ],
        },
      ],
    },
    {
      title: 'Building REST APIs',
      description: 'Spring MVC for JSON APIs; HTTP semantics themselves live in track-rest-api.',
      topics: [
        {
          title: 'DispatcherServlet and the MVC request flow',
          description: 'The single front controller that maps a request to a handler, runs argument resolvers and converters, and renders through a view or message converter; knowing this explains every error page you will see.',
          concepts: ['Front controller pattern', 'HandlerMapping and HandlerAdapter', 'Argument resolvers and return handlers', 'Filters versus interceptors'],
          quiz: [
            ['Where does a filter run relative to the DispatcherServlet?', 'Before it, at the servlet container level.'],
            ['What turns a returned object into JSON?', 'An HttpMessageConverter, Jackson by default.'],
          ],
        },
        {
          title: '@RestController and request mapping',
          description: '@GetMapping, @PostMapping and friends, path variables, query parameters, headers, consumes and produces, and how ambiguous mappings fail at startup rather than at request time.',
          concepts: ['@RequestMapping shortcuts', '@PathVariable and @RequestParam', 'Consumes and produces negotiation', 'Ambiguous mapping errors'],
          quiz: [
            ['What does @RestController add to @Controller?', '@ResponseBody on every handler, so returns are written to the body.'],
            ['How do you make a query parameter optional?', 'required=false, a default value, or an Optional parameter.'],
          ],
          prereqs: ['DispatcherServlet and the MVC request flow'],
        },
        {
          title: 'Request and response bodies with Jackson',
          description: 'How @RequestBody deserialises JSON into records or classes, controlling names, nulls, dates and unknown fields, and why request and response DTOs should be separate from entities.',
          concepts: ['@RequestBody and @ResponseBody', 'Jackson annotations and naming strategy', 'Date and time serialisation', 'Ignoring unknown properties'],
          quiz: [
            ['What happens with an unknown JSON field by default in Boot?', 'It is ignored; FAIL_ON_UNKNOWN_PROPERTIES is off.'],
            ['How do you write dates as ISO strings?', 'spring.jackson.serialization.write-dates-as-timestamps=false.'],
          ],
          prereqs: ['@RestController and request mapping'],
        },
        {
          title: 'ResponseEntity, status codes and headers',
          description: 'Returning the right status and headers explicitly, 201 with a Location header on create, 204 for deletes, and @ResponseStatus versus building a ResponseEntity.',
          concepts: ['ResponseEntity builders', 'Created with Location header', '@ResponseStatus', 'Cache-Control and ETag headers'],
          quiz: [
            ['How do you build the Location URL for a new resource?', 'ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(id).'],
            ['What status should DELETE return with no body?', '204 No Content.'],
          ],
          prereqs: ['@RestController and request mapping'],
        },
        {
          title: 'File upload, download and streaming',
          description: 'MultipartFile uploads with size limits, streaming large downloads with StreamingResponseBody and Resource, and setting content type and disposition correctly.',
          concepts: ['MultipartFile and size limits', 'Streaming downloads', 'Content-Disposition headers', 'Server-sent events with SseEmitter'],
          quiz: [
            ['Which properties cap upload size?', 'spring.servlet.multipart.max-file-size and max-request-size.'],
            ['Why use StreamingResponseBody for big files?', 'It writes to the response without buffering everything in memory.'],
          ],
          prereqs: ['ResponseEntity, status codes and headers'],
        },
        {
          title: 'API documentation with springdoc-openapi',
          description: 'Generating an OpenAPI document and Swagger UI from controllers, enriching it with @Operation and @Schema, grouping APIs and keeping the spec in sync with validation annotations.',
          concepts: ['springdoc starter setup', '@Operation and @Schema annotations', 'Grouped OpenAPI definitions', 'Hiding internal endpoints'],
          quiz: [
            ['Where is the generated spec served?', '/v3/api-docs, with Swagger UI at /swagger-ui.html.'],
            ['Do validation annotations show in the spec?', 'Yes, @NotNull, @Size and similar become schema constraints.'],
          ],
          prereqs: ['Request and response bodies with Jackson'],
        },
        {
          title: 'Calling other services with RestClient and WebClient',
          description: 'Spring 6.1 RestClient for synchronous calls, WebClient for reactive ones, declarative @HttpExchange interfaces, and setting timeouts, error handlers and interceptors on the underlying client.',
          concepts: ['RestClient fluent API', 'WebClient for non-blocking calls', '@HttpExchange interface clients', 'Timeouts and error handling', 'RestTemplate in legacy code'],
          quiz: [
            ['Which client should new blocking code use?', 'RestClient; RestTemplate is in maintenance mode.'],
            ['What does an HTTP interface client need to run?', 'HttpServiceProxyFactory built on a RestClient or WebClient adapter.'],
          ],
          prereqs: ['Request and response bodies with Jackson'],
        },
      ],
    },
    {
      title: 'Validation and Error Handling',
      description: 'Rejecting bad input and reporting failures consistently.',
      topics: [
        {
          title: 'Bean Validation with @Valid',
          description: 'Jakarta Validation constraints on DTOs, @Valid on request bodies and @Validated on path parameters, nested and collection validation, and what MethodArgumentNotValidException carries.',
          concepts: ['Built-in constraint annotations', '@Valid versus @Validated', 'Nested and collection validation', 'Reading BindingResult errors'],
          quiz: [
            ['Which starter brings Hibernate Validator?', 'spring-boot-starter-validation.'],
            ['What is thrown when a @Valid body fails?', 'MethodArgumentNotValidException.'],
          ],
        },
        {
          title: 'Custom constraints and validation groups',
          description: 'Writing a @Constraint annotation with a ConstraintValidator, cross-field class-level checks, groups for create versus update, and injecting beans into validators.',
          concepts: ['Custom ConstraintValidator', 'Class-level cross-field constraints', 'Validation groups', 'Bean injection into validators'],
          quiz: [
            ['How do you validate that endDate is after startDate?', 'A class-level constraint whose validator sees both fields.'],
            ['Why use groups?', 'The same DTO can require an id on update but forbid it on create.'],
          ],
          prereqs: ['Bean Validation with @Valid'],
        },
        {
          title: '@ControllerAdvice and @ExceptionHandler',
          description: 'Centralising error translation: one advice class maps domain exceptions to statuses, orders handlers by specificity, and extends ResponseEntityExceptionHandler to cover the MVC built-in exceptions.',
          concepts: ['Global versus controller-local handlers', 'Exception hierarchy to status mapping', 'ResponseEntityExceptionHandler', 'Handler ordering and precedence'],
          quiz: [
            ['How is the handler chosen when several match?', 'The closest exception type in the hierarchy wins.'],
            ['Can @ExceptionHandler live inside a controller?', 'Yes, but it then applies to that controller only.'],
          ],
          prereqs: ['Bean Validation with @Valid'],
        },
        {
          title: 'RFC 9457 errors with ProblemDetail',
          description: 'Spring 6 ProblemDetail and ErrorResponse produce application/problem+json bodies with type, title, status, detail and instance; enabling it for built-in errors and adding validation field errors as extensions.',
          concepts: ['ProblemDetail fields', 'spring.mvc.problemdetails.enabled', 'ErrorResponseException', 'Extension properties for field errors'],
          quiz: [
            ['What media type does ProblemDetail use?', 'application/problem+json.'],
            ['How do you attach validation errors to a ProblemDetail?', 'setProperty("errors", list) as an extension member.'],
          ],
          prereqs: ['@ControllerAdvice and @ExceptionHandler'],
        },
        {
          title: 'Whitelabel error page and BasicErrorController',
          description: 'What Boot returns when nothing handles an error, why 404s from unknown paths never reach @ControllerAdvice unless configured, and customising or replacing the ErrorController.',
          concepts: ['BasicErrorController behaviour', 'server.error properties', 'Handling NoHandlerFoundException', 'Custom ErrorController'],
          quiz: [
            ['Why does a 404 bypass @ControllerAdvice by default?', 'No handler is found, so the error is forwarded to /error instead.'],
            ['Which property hides stack traces from error responses?', 'server.error.include-stacktrace=never.'],
          ],
          prereqs: ['@ControllerAdvice and @ExceptionHandler'],
        },
      ],
    },
    {
      title: 'Data Access and Transactions',
      description: 'Working overview of persistence in Boot; entity mapping and query tuning go deep in track-spring-data-jpa.',
      topics: [
        {
          title: 'DataSource, HikariCP and JdbcClient',
          description: 'How Boot builds a pooled DataSource from spring.datasource.*, sizing the Hikari pool, the H2 in-memory default, and JdbcClient or JdbcTemplate for plain SQL without JPA.',
          concepts: ['spring.datasource properties', 'HikariCP pool sizing', 'JdbcClient fluent queries', 'RowMapper and result handling'],
          quiz: [
            ['What is the default connection pool in Boot?', 'HikariCP.'],
            ['Why is a huge pool size harmful?', 'The database serialises on cores and I/O, so extra connections add contention.'],
          ],
        },
        {
          title: 'Spring Data JPA in a Boot project',
          description: 'Adding the starter, writing an @Entity and a JpaRepository, what ddl-auto does in each environment, and the open-in-view warning that Boot prints on startup and why you should turn it off.',
          concepts: ['spring-boot-starter-data-jpa setup', 'JpaRepository and derived queries', 'ddl-auto per environment', 'Open Session In View warning'],
          quiz: [
            ['What should ddl-auto be in production?', 'validate or none, with migrations managing the schema.'],
            ['What does spring.jpa.open-in-view=false change?', 'The persistence context closes when the service returns, not after rendering the response.'],
          ],
          prereqs: ['DataSource, HikariCP and JdbcClient'],
        },
        {
          title: 'Schema migrations with Flyway',
          description: 'Versioned SQL migrations that run on startup, naming conventions, the schema history table, repeatable migrations and why entities must match the migrated schema rather than generate it.',
          concepts: ['Versioned migration naming', 'flyway_schema_history', 'Repeatable migrations', 'Migrations in CI and tests'],
          quiz: [
            ['What file name runs first: V1__init.sql or V1_1__seed.sql?', 'V1__init.sql; 1.1 sorts after 1.'],
            ['Can a migration file be edited after release?', 'No, its checksum is stored and validation fails.'],
          ],
          prereqs: ['Spring Data JPA in a Boot project'],
        },
        {
          title: '@Transactional semantics',
          description: 'Where a transaction starts and commits, propagation REQUIRED versus REQUIRES_NEW, rollback on runtime exceptions only, readOnly hints, and putting the boundary on the service layer.',
          concepts: ['Transaction boundaries on services', 'Propagation levels', 'Rollback rules and checked exceptions', 'readOnly and timeout attributes'],
          quiz: [
            ['Does @Transactional roll back on a checked exception?', 'Not by default; add rollbackFor.'],
            ['What does REQUIRES_NEW do?', 'Suspends the current transaction and starts an independent one.'],
          ],
          prereqs: ['Spring Data JPA in a Boot project', 'AOP and proxies behind @Transactional'],
        },
        {
          title: 'Spring Data JDBC and other stores',
          description: 'When a simpler aggregate-oriented mapper beats JPA, Spring Data JDBC basics, and how the same repository idiom applies to MongoDB, Redis and Elasticsearch starters.',
          concepts: ['Spring Data JDBC aggregates', 'When JPA is overkill', 'MongoDB and Redis repositories', 'Choosing a store per use case'],
          quiz: [
            ['What does Spring Data JDBC not do that JPA does?', 'No lazy loading, dirty checking or caching; it loads and saves whole aggregates.'],
            ['Is a repository interface tied to one database technology?', 'No, the abstraction is shared; the store module supplies the implementation.'],
          ],
          prereqs: ['Spring Data JPA in a Boot project'],
        },
        {
          title: 'Mapping entities to DTOs',
          description: 'Keeping API shapes independent from tables with records and MapStruct, projections for read models, and avoiding lazy-loading failures by mapping inside the transaction.',
          concepts: ['Records as DTOs', 'MapStruct mappers', 'Interface and DTO projections', 'Mapping inside the transaction'],
          quiz: [
            ['Why map inside the service instead of the controller?', 'Lazy associations are still loadable there.'],
            ['What does MapStruct generate?', 'Compile-time mapper implementations with no reflection.'],
          ],
          prereqs: ['Spring Data JPA in a Boot project'],
        },
      ],
    },
    {
      title: 'Security Overview',
      description: 'Enough to secure an API correctly; the full filter chain and OAuth2 detail live in track-spring-security.',
      topics: [
        {
          title: 'Adding Spring Security to Boot',
          description: 'What the starter changes on day one: every endpoint locked, a generated password, CSRF enabled; and declaring a SecurityFilterChain bean with the lambda DSL to take control.',
          concepts: ['Default security auto-configuration', 'SecurityFilterChain bean', 'Lambda DSL configuration', 'Ordering of request matchers'],
          quiz: [
            ['What happens when you add the starter and do nothing else?', 'All endpoints need basic or form login with a generated password.'],
            ['Why does the order of requestMatchers matter?', 'The first matching rule wins, so anyRequest must come last.'],
          ],
        },
        {
          title: 'Users, passwords and roles',
          description: 'UserDetailsService backed by your user table, PasswordEncoder with BCrypt, and expressing authorization as roles and authorities on URLs and with @PreAuthorize on methods.',
          concepts: ['Database-backed UserDetailsService', 'BCrypt via DelegatingPasswordEncoder', 'hasRole versus hasAuthority', '@PreAuthorize basics'],
          quiz: [
            ['What prefix does hasRole("ADMIN") expect on the authority?', 'ROLE_ADMIN.'],
            ['Why must passwords be hashed with BCrypt rather than SHA-256?', 'BCrypt is slow and salted, resisting brute force.'],
          ],
          prereqs: ['Adding Spring Security to Boot'],
        },
        {
          title: 'Stateless APIs with JWT',
          description: 'Turning off sessions and CSRF for token APIs, validating bearer tokens with the OAuth2 resource server starter, mapping claims to authorities and keeping the signing key out of the code.',
          concepts: ['STATELESS session policy', 'oauth2ResourceServer with JWT', 'Claims to authorities mapping', 'Key management for signing'],
          quiz: [
            ['Why can CSRF be disabled for a pure bearer-token API?', 'Browsers do not attach the token automatically, so cross-site requests carry no credential.'],
            ['Which starter validates JWTs?', 'spring-boot-starter-oauth2-resource-server.'],
          ],
          prereqs: ['Users, passwords and roles'],
        },
        {
          title: 'OAuth2 login and social sign-in',
          description: 'The oauth2Login flow with Google or GitHub, registration properties, mapping the OIDC user to a local account, and when to run your own Spring Authorization Server.',
          concepts: ['oauth2Login configuration', 'Client registration properties', 'OidcUser to local user mapping', 'Spring Authorization Server'],
          quiz: [
            ['What does spring.security.oauth2.client.registration.google need?', 'client-id and client-secret; provider details are built in.'],
            ['Where does the user land after login?', 'The saved request URL or the default success URL.'],
          ],
          prereqs: ['Stateless APIs with JWT'],
        },
        {
          title: 'CORS, headers and secure defaults',
          description: 'Allowing a browser front end from another origin with a CorsConfigurationSource, the security headers Spring adds, HTTPS behind a proxy with forwarded headers, and locking down Actuator.',
          concepts: ['CorsConfigurationSource bean', 'Default security headers', 'Forwarded headers behind a proxy', 'Securing Actuator endpoints'],
          quiz: [
            ['Is @CrossOrigin enough when Spring Security is present?', 'No, configure cors() in the filter chain so preflights pass the filters.'],
            ['Which property makes Boot trust X-Forwarded-Proto?', 'server.forward-headers-strategy=framework or native.'],
          ],
          prereqs: ['Adding Spring Security to Boot'],
        },
      ],
    },
    {
      title: 'Testing',
      description: 'Fast unit tests, focused slices and real databases in containers.',
      topics: [
        {
          title: 'Unit testing services with JUnit 5 and Mockito',
          description: 'Testing business logic without a Spring context: constructor-injected fakes, @Mock and @InjectMocks, ArgumentCaptor, and AssertJ assertions that read like sentences.',
          concepts: ['Tests without a Spring context', 'Mockito stubs and verification', 'ArgumentCaptor', 'AssertJ fluent assertions'],
          quiz: [
            ['Why avoid @SpringBootTest for pure logic?', 'Context startup costs seconds and hides design problems.'],
            ['What does @ExtendWith(MockitoExtension.class) do?', 'Initialises @Mock fields and fails on unused stubs.'],
          ],
        },
        {
          title: '@WebMvcTest and MockMvc',
          description: 'Loading only the web layer to test routing, validation, serialisation and error handling with MockMvc, mocking the service with @MockitoBean, and asserting JSON with jsonPath.',
          concepts: ['Web slice scope', 'MockMvc request builders', 'jsonPath assertions', '@MockitoBean for collaborators'],
          quiz: [
            ['Which beans does @WebMvcTest load?', 'Controllers, advice, filters, converters and MVC config, not services or repositories.'],
            ['How do you assert a 400 with a field error?', 'andExpect(status().isBadRequest()) plus jsonPath on the error body.'],
          ],
          prereqs: ['Unit testing services with JUnit 5 and Mockito'],
        },
        {
          title: '@DataJpaTest and repository tests',
          description: 'A slice with entities, repositories and a transactional rollback per test, TestEntityManager for setup, and why the embedded H2 default can hide Postgres-specific bugs.',
          concepts: ['JPA slice configuration', 'TestEntityManager', 'Transaction rollback per test', 'Replacing the embedded database'],
          quiz: [
            ['Why does data from one @DataJpaTest not leak into the next?', 'Each test runs in a transaction that is rolled back.'],
            ['How do you stop the slice swapping in H2?', '@AutoConfigureTestDatabase(replace = NONE).'],
          ],
          prereqs: ['Unit testing services with JUnit 5 and Mockito'],
        },
        {
          title: 'Testcontainers with @ServiceConnection',
          description: 'Running a real PostgreSQL, Kafka or Redis in Docker for tests, letting Boot 3.1 wire the connection from the container, reusing containers across test classes and using them for local development.',
          concepts: ['Container lifecycle in tests', '@ServiceConnection wiring', 'Singleton container pattern', 'Testcontainers for local dev', '@DynamicPropertySource fallback'],
          quiz: [
            ['What does @ServiceConnection replace?', 'Manually setting datasource URL and credentials from the container.'],
            ['Why share one container across classes?', 'Startup takes seconds; a static singleton container is started once.'],
          ],
          prereqs: ['@DataJpaTest and repository tests'],
        },
        {
          title: '@SpringBootTest integration tests',
          description: 'Booting the full context on a random port, calling through TestRestTemplate or WebTestClient, context caching between tests, and keeping the number of distinct contexts small.',
          concepts: ['webEnvironment options', 'TestRestTemplate and WebTestClient', 'Context caching rules', 'Test profiles and properties'],
          quiz: [
            ['Why can adding @MockitoBean slow a suite?', 'It changes the context configuration, forcing a new context to start.'],
            ['How do you inject the random port?', '@LocalServerPort.'],
          ],
          prereqs: ['Testcontainers with @ServiceConnection'],
        },
        {
          title: 'Testing security rules',
          description: '@WithMockUser and the jwt() and csrf() post-processors to exercise authorization, verifying 401 versus 403, and running method-security tests without an HTTP layer.',
          concepts: ['@WithMockUser', 'SecurityMockMvcRequestPostProcessors', '401 versus 403 assertions', 'Method security tests'],
          quiz: [
            ['What does jwt().authorities(...) do in MockMvc?', 'Injects a JWT authentication without a real token.'],
            ['Which status means authenticated but not permitted?', '403 Forbidden.'],
          ],
          prereqs: ['@WebMvcTest and MockMvc'],
        },
        {
          title: 'Test data, fixtures and clock control',
          description: 'Builders and object mothers for readable setup, @Sql scripts, injecting a Clock bean so time can be fixed, and WireMock for stubbing downstream HTTP services.',
          concepts: ['Test data builders', '@Sql scripts', 'Injectable Clock', 'WireMock for HTTP stubs'],
          quiz: [
            ['Why inject java.time.Clock?', 'Tests can fix the time instead of depending on the wall clock.'],
            ['What does WireMock replace in tests?', 'A real downstream HTTP service, with canned responses.'],
          ],
          prereqs: ['@SpringBootTest integration tests'],
        },
      ],
    },
    {
      title: 'Caching, Messaging and Background Work',
      description: 'Doing less work per request and moving the rest off the request thread.',
      topics: [
        {
          title: 'Caching with @Cacheable',
          description: '@EnableCaching and the @Cacheable, @CachePut and @CacheEvict annotations, key expressions, conditional caching, and how the proxy-based cache interacts with self-invocation and exceptions.',
          concepts: ['Cache abstraction and CacheManager', 'Key and condition SpEL', '@CachePut versus @CacheEvict', 'Caching and the proxy boundary'],
          quiz: [
            ['What is cached by default when no key is given?', 'A key generated from all method parameters.'],
            ['Does @Cacheable cache a null result?', 'Yes unless unless="#result == null" is set.'],
          ],
          prereqs: ['AOP and proxies behind @Transactional'],
        },
        {
          title: 'Caffeine and Redis cache providers',
          description: 'Choosing an in-process Caffeine cache with size and TTL versus a shared Redis cache, serialisation of cached values, and per-cache configuration.',
          concepts: ['Caffeine spec strings', 'Redis cache configuration', 'Serialising cached values', 'Choosing local versus distributed'],
          quiz: [
            ['When does a local cache cause bugs?', 'With several instances, each holds stale data after another writes.'],
            ['How do you set a TTL for Redis caches?', 'spring.cache.redis.time-to-live.'],
          ],
          prereqs: ['Caching with @Cacheable'],
        },
        {
          title: 'HTTP caching and ETags',
          description: 'Letting clients cache responses with Cache-Control, conditional GET with ETag and If-None-Match returning 304, and ShallowEtagHeaderFilter versus computing versions yourself.',
          concepts: ['Cache-Control directives', 'ETag and 304 responses', 'ShallowEtagHeaderFilter', 'Last-Modified checks'],
          quiz: [
            ['What does ShallowEtagHeaderFilter save?', 'Bandwidth only; the response is still computed to hash it.'],
            ['Which helper returns 304 for you in a controller?', 'WebRequest.checkNotModified(etag).'],
          ],
        },
        {
          title: 'Application events',
          description: 'Publishing domain events with ApplicationEventPublisher, @EventListener, @TransactionalEventListener after commit, and why events decouple modules within one process.',
          concepts: ['ApplicationEventPublisher', '@EventListener methods', '@TransactionalEventListener phases', 'Conditional listeners'],
          quiz: [
            ['When does a @TransactionalEventListener run by default?', 'After the surrounding transaction commits.'],
            ['Are application events synchronous?', 'Yes unless the listener is @Async.'],
          ],
        },
        {
          title: '@Async and @Scheduled',
          description: '@EnableAsync with a configured executor, returning CompletableFuture, exception handling on async methods, cron and fixed-delay scheduling, and preventing duplicate runs across instances with ShedLock.',
          concepts: ['@EnableAsync and executors', 'CompletableFuture returns', 'AsyncUncaughtExceptionHandler', 'Cron and fixed-delay schedules', 'ShedLock for clustered jobs'],
          quiz: [
            ['Why does an @Async method on the same class run synchronously?', 'Self-invocation bypasses the proxy.'],
            ['What happens with @Scheduled on three replicas?', 'The job runs three times unless a lock like ShedLock coordinates them.'],
          ],
          prereqs: ['Application events'],
        },
        {
          title: 'Kafka with Spring Kafka',
          description: 'Producing with KafkaTemplate, consuming with @KafkaListener, consumer groups and partitions, JSON serialisation, error handling with retries and dead-letter topics, and testing with an embedded broker or Testcontainers.',
          concepts: ['KafkaTemplate producers', '@KafkaListener and consumer groups', 'JSON serializers', 'DefaultErrorHandler and dead-letter topics', 'Idempotent consumers'],
          quiz: [
            ['What decides which consumer gets a partition?', 'The consumer group; each partition goes to one consumer in the group.'],
            ['Why must consumers be idempotent?', 'At-least-once delivery can redeliver after a failure.'],
          ],
        },
        {
          title: 'RabbitMQ with Spring AMQP',
          description: 'Exchanges, queues and bindings declared as beans, RabbitTemplate and @RabbitListener, acknowledgement modes, and dead-letter exchanges for poison messages.',
          concepts: ['Exchange, queue and binding beans', '@RabbitListener', 'Manual versus auto acknowledgement', 'Dead-letter exchanges'],
          quiz: [
            ['What routes a message from an exchange to a queue?', 'A binding with a routing key.'],
            ['What happens to a rejected message without requeue?', 'It goes to the dead-letter exchange if one is configured, else it is dropped.'],
          ],
        },
      ],
    },
    {
      title: 'Observability and Operations',
      description: 'Knowing what a running service is doing without attaching a debugger.',
      topics: [
        {
          title: 'Actuator endpoints',
          description: 'health, info, metrics, env, loggers and threaddump; which are exposed by default, exposing more over HTTP safely, and changing a log level at runtime through the loggers endpoint.',
          concepts: ['Enabling and exposing endpoints', 'health and info', 'Runtime log levels', 'Securing Actuator with a separate port'],
          quiz: [
            ['Which endpoints are exposed over HTTP by default?', 'health only.'],
            ['How do you expose all endpoints?', 'management.endpoints.web.exposure.include=*'],
          ],
        },
        {
          title: 'Health indicators and Kubernetes probes',
          description: 'Built-in indicators for the database, disk and brokers, writing a HealthIndicator, and liveness versus readiness groups so Kubernetes restarts or stops routing to the right instance.',
          concepts: ['Built-in HealthIndicators', 'Custom HealthIndicator', 'Liveness and readiness groups', 'Showing health details'],
          quiz: [
            ['Why should a readiness probe not include a downstream service?', 'A slow dependency would take every instance out of rotation at once.'],
            ['Which property enables the probe endpoints?', 'management.endpoint.health.probes.enabled=true (automatic on Kubernetes).'],
          ],
          prereqs: ['Actuator endpoints'],
        },
        {
          title: 'Metrics with Micrometer and Prometheus',
          description: 'Micrometer as the metrics facade, the counters, timers and gauges Boot registers automatically, custom @Timed and MeterRegistry metrics, tags, and scraping /actuator/prometheus.',
          concepts: ['MeterRegistry and meter types', 'Automatic HTTP and JVM metrics', 'Custom metrics with tags', 'Prometheus scrape endpoint', 'Tag cardinality limits'],
          quiz: [
            ['What does a Timer record?', 'Count, total time and max, with optional percentiles.'],
            ['Why not tag a metric with user id?', 'Unbounded tag values explode the number of time series.'],
          ],
          prereqs: ['Actuator endpoints'],
        },
        {
          title: 'Distributed tracing with Micrometer Tracing',
          description: 'Trace and span ids propagated across HTTP and messaging calls, exporting to Zipkin or an OpenTelemetry collector, ids in log lines, and sampling to control cost.',
          concepts: ['Trace and span propagation', 'OpenTelemetry exporter setup', 'Trace ids in logs', 'Sampling probability'],
          quiz: [
            ['What replaced Spring Cloud Sleuth in Boot 3?', 'Micrometer Tracing.'],
            ['Which header carries W3C trace context?', 'traceparent.'],
          ],
          prereqs: ['Metrics with Micrometer and Prometheus'],
        },
        {
          title: 'Observation API and custom spans',
          description: 'One Observation produces both a metric and a span; instrumenting service methods with @Observed or ObservationRegistry, adding key-values, and the conventions for naming.',
          concepts: ['Observation lifecycle', '@Observed annotation', 'Low and high cardinality key-values', 'Naming conventions'],
          quiz: [
            ['What does one Observation produce?', 'A timer metric and a span, plus logs if configured.'],
            ['What is needed for @Observed to work?', 'An ObservedAspect bean and AOP on the classpath.'],
          ],
          prereqs: ['Distributed tracing with Micrometer Tracing'],
        },
        {
          title: 'Diagnosing production problems',
          description: 'Thread dumps for stuck request threads, heap dumps for leaks, reading Hikari pool metrics for connection starvation, slow query logs, and JFR recordings with minimal overhead.',
          concepts: ['Thread dump analysis', 'Heap dumps and leak suspects', 'Connection pool starvation', 'Java Flight Recorder'],
          quiz: [
            ['What does a pool of 10 with 10 active and pending threads indicate?', 'Connection starvation: requests wait for a connection.'],
            ['Which Actuator endpoint gives a heap dump?', '/actuator/heapdump.'],
          ],
          prereqs: ['Metrics with Micrometer and Prometheus'],
        },
      ],
    },
    {
      title: 'Docker and Deployment',
      description: 'Shipping the service; container concepts themselves belong to track-docker.',
      topics: [
        {
          title: 'Building images with buildpacks and Dockerfiles',
          description: 'spring-boot:build-image via Cloud Native Buildpacks with no Dockerfile, versus a multi-stage Dockerfile that extracts layered jar layers for better caching and a small JRE base image.',
          concepts: ['Cloud Native Buildpacks', 'Multi-stage Dockerfile', 'Layer extraction with jarmode', 'Choosing a base image'],
          quiz: [
            ['What command builds an OCI image without a Dockerfile?', './mvnw spring-boot:build-image'],
            ['Why extract layers instead of copying the fat jar?', 'Dependency layers are cached and only the application layer changes.'],
          ],
        },
        {
          title: 'JVM settings in containers',
          description: 'Container-aware heap sizing, MaxRAMPercentage, choosing a garbage collector, startup time versus peak throughput, and running as a non-root user.',
          concepts: ['MaxRAMPercentage and container limits', 'Garbage collector choice', 'CDS and startup time', 'Non-root container user'],
          quiz: [
            ['Why can a JVM be killed with the heap far below the container limit?', 'Metaspace, threads and off-heap memory also count toward the limit.'],
            ['What does the JVM use to size the heap in a container?', 'The cgroup memory limit, scaled by MaxRAMPercentage.'],
          ],
          prereqs: ['Building images with buildpacks and Dockerfiles'],
        },
        {
          title: 'Docker Compose for local development',
          description: 'spring-boot-docker-compose starts the database and broker from compose.yaml on application start, wires connections automatically, and how this relates to Testcontainers in tests.',
          concepts: ['spring-boot-docker-compose starter', 'compose.yaml services', 'Automatic connection details', 'Compose versus Testcontainers'],
          quiz: [
            ['When does Boot start compose services?', 'On application start in development, skipped in tests by default.'],
            ['How does Boot know the Postgres credentials from compose?', 'It reads the container labels and environment to build ConnectionDetails.'],
          ],
          prereqs: ['Building images with buildpacks and Dockerfiles'],
        },
        {
          title: 'Deploying to Kubernetes',
          description: 'A Deployment with resource limits, ConfigMaps and Secrets as environment or mounted files, liveness and readiness probes wired to Actuator, and graceful shutdown during rolling updates.',
          concepts: ['Deployment and Service manifests', 'ConfigMaps and Secrets', 'Probes wired to Actuator', 'Rolling updates and preStop'],
          quiz: [
            ['Why set terminationGracePeriodSeconds above the Boot shutdown timeout?', 'So in-flight requests finish before the pod is killed.'],
            ['Which Actuator path suits a liveness probe?', '/actuator/health/liveness.'],
          ],
          prereqs: ['Docker Compose for local development', 'Health indicators and Kubernetes probes'],
        },
        {
          title: 'GraalVM native images and CI pipelines',
          description: 'Compiling to a native executable with spring-boot:build-image and the native profile for millisecond startup, the reflection and proxy hints it needs, and a CI pipeline that tests, builds and pushes an image.',
          concepts: ['Native image trade-offs', 'Runtime hints and AOT processing', 'Pipeline stages for a Boot service', 'Image tagging and promotion'],
          quiz: [
            ['What is the main cost of a native image?', 'Long build times and restrictions on reflection and dynamic proxies.'],
            ['Where do AOT-generated classes go?', 'Into the build output during the process-aot phase.'],
          ],
          prereqs: ['Deploying to Kubernetes'],
        },
      ],
    },
    {
      title: 'Microservices with Spring Cloud',
      description: 'The Spring-specific tooling; architecture and trade-offs are in track-microservices.',
      topics: [
        {
          title: 'Spring Cloud release trains and when to use them',
          description: 'How Spring Cloud versions pair with Boot versions through the BOM, which projects are active versus maintenance, and the question to ask before splitting a working monolith.',
          concepts: ['Spring Cloud BOM alignment', 'Active versus maintenance projects', 'Modular monolith first', 'Spring Modulith'],
          quiz: [
            ['How do you get compatible Spring Cloud versions?', 'Import the spring-cloud-dependencies BOM matching your Boot release.'],
            ['What does Spring Modulith help with?', 'Enforcing and testing module boundaries inside a monolith.'],
          ],
        },
        {
          title: 'Centralised configuration with Spring Cloud Config',
          description: 'A config server backed by Git serving per-application and per-profile properties, clients importing it with spring.config.import, and refreshing values at runtime with @RefreshScope.',
          concepts: ['Config server with a Git backend', 'spring.config.import=configserver:', '@RefreshScope and refresh events', 'Encrypting values'],
          quiz: [
            ['Which beans see updated values after a refresh?', 'Those annotated with @RefreshScope and @ConfigurationProperties beans.'],
            ['What replaced bootstrap.yml for config clients?', 'spring.config.import in application.yml.'],
          ],
          prereqs: ['Spring Cloud release trains and when to use them'],
        },
        {
          title: 'Service discovery and load-balanced clients',
          description: 'Registering with Eureka or Consul, resolving names through Spring Cloud LoadBalancer, why Kubernetes DNS often makes a registry unnecessary, and @LoadBalanced RestClient builders.',
          concepts: ['Eureka server and clients', 'Spring Cloud LoadBalancer', 'Kubernetes services as discovery', '@LoadBalanced clients'],
          quiz: [
            ['Do you need Eureka on Kubernetes?', 'Usually not; Service DNS and kube-proxy provide discovery and balancing.'],
            ['What does @LoadBalanced do to a RestClient.Builder?', 'Adds an interceptor that resolves service names to instances.'],
          ],
          prereqs: ['Spring Cloud release trains and when to use them'],
        },
        {
          title: 'Spring Cloud Gateway',
          description: 'A reactive edge router with route predicates and filters for path rewriting, rate limiting, token relay and circuit breaking, and where it sits relative to an ingress controller.',
          concepts: ['Routes, predicates and filters', 'Rate limiting with Redis', 'TokenRelay filter', 'Gateway versus ingress'],
          quiz: [
            ['Why is Gateway built on WebFlux?', 'Non-blocking I/O suits a proxy that holds many concurrent connections.'],
            ['What does the TokenRelay filter do?', 'Forwards the caller\'s OAuth2 access token to the downstream service.'],
          ],
          prereqs: ['Service discovery and load-balanced clients'],
        },
        {
          title: 'Resilience4j circuit breakers and retries',
          description: 'Wrapping remote calls with time limiters, retries with backoff, circuit breakers and bulkheads via annotations or Spring Cloud CircuitBreaker, and exposing their state through Actuator.',
          concepts: ['@CircuitBreaker with fallback', '@Retry and backoff', '@TimeLimiter and @Bulkhead', 'Resilience4j Actuator metrics'],
          quiz: [
            ['What are the three circuit breaker states?', 'Closed, open and half-open.'],
            ['Why put a timeout before a retry?', 'Retrying a call that never completes just multiplies the hang.'],
          ],
          prereqs: ['Calling other services with RestClient and WebClient'],
        },
        {
          title: 'Event-driven services with Spring Cloud Stream',
          description: 'Functional producers and consumers bound to Kafka or RabbitMQ through binders, destination naming, consumer groups and partitions, and dead-letter handling without broker-specific code.',
          concepts: ['Binders and bindings', 'Supplier, Function and Consumer beans', 'Consumer groups and partitioning', 'Dead-letter configuration'],
          quiz: [
            ['How does Stream find the function to bind?', 'spring.cloud.function.definition names the bean.'],
            ['What does swapping the binder require?', 'A dependency change and binder properties, not code changes.'],
          ],
          prereqs: ['Kafka with Spring Kafka'],
        },
      ],
    },
    {
      title: 'Production-Grade Projects',
      description: 'Deployable services that exercise the whole track.',
      style: 'project',
      topics: [
        {
          title: 'Project: task management API',
          description: 'A REST API for projects and tasks with JWT login, role-based access, validation, ProblemDetail errors, Flyway migrations on PostgreSQL, paginated queries, OpenAPI docs and a Testcontainers suite.',
          concepts: ['Model users, projects and tasks', 'Secure with JWT and roles', 'Validate and report errors', 'Test with Testcontainers', 'Document and containerise'],
          quiz: [
            ['How do you stop a user reading another user\'s task?', 'Filter queries by the authenticated user and check ownership before writes.'],
            ['Why paginate the task list?', 'To bound response size and database work as data grows.'],
          ],
        },
        {
          title: 'Project: e-commerce order service',
          description: 'Orders and inventory with transactional checkout, optimistic locking on stock, order events published to Kafka after commit through an outbox table, @Scheduled cleanup, Caffeine caching for the catalogue and Actuator metrics.',
          concepts: ['Checkout as one transaction', 'Optimistic locking on stock', 'Outbox table and Kafka publisher', 'Cache the product catalogue', 'Metrics for orders and failures'],
          quiz: [
            ['Why write events to an outbox instead of publishing in the transaction?', 'A commit and a publish cannot be atomic; the outbox makes publishing reliable.'],
            ['What does @Version do on the stock row?', 'Rejects concurrent updates that would oversell.'],
          ],
        },
        {
          title: 'Project: notification service with RabbitMQ',
          description: 'A consumer that receives events from RabbitMQ, sends email and push notifications through pluggable senders, retries with backoff and dead-letters failures, tracks delivery status in a database and exposes health and metrics.',
          concepts: ['Queue and dead-letter topology', 'Pluggable sender strategy', 'Retry and backoff policy', 'Delivery status persistence', 'Health checks for the broker'],
          quiz: [
            ['How do you avoid sending the same email twice on redelivery?', 'Store a processed message id and skip duplicates.'],
            ['Where should a permanently failing message go?', 'A dead-letter queue for inspection.'],
          ],
        },
        {
          title: 'Project: microservices with gateway and tracing',
          description: 'Split a bookstore into catalogue, order and customer services behind Spring Cloud Gateway with JWT validation at the edge, Resilience4j between services, centralised config, Micrometer tracing to Zipkin and a Docker Compose stack.',
          concepts: ['Define service boundaries', 'Edge authentication in the gateway', 'Resilient inter-service calls', 'Trace requests end to end', 'Compose the full stack'],
          quiz: [
            ['How does a trace cross the service boundary?', 'The traceparent header is propagated by the instrumented clients.'],
            ['What happens when the catalogue service is down?', 'The circuit breaker opens and the order service returns a fallback.'],
          ],
        },
      ],
    },
  ],
})
