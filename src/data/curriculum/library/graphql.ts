import { defineTrack } from '../define'

export const graphql = defineTrack({
  id: 'track-graphql',
  title: 'GraphQL',
  description: 'GraphQL servers and clients in TypeScript: the schema definition language, queries, mutations and subscriptions, resolvers and context, the N+1 problem and DataLoader, schema design and Relay pagination, auth, error handling, federation, persisted queries and caching, Apollo and urql clients, testing and security limits.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '◈',
  tags: ['graphql', 'typescript', 'apollo', 'dataloader', 'federation', 'relay', 'urql', 'api'],
  languages: ['TypeScript'],
  explainMode: 'node',
  code: { label: 'TypeScript with GraphQL', id: 'typescript', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-rest-api'],
  style: 'code',
  categories: [
    {
      title: 'Foundations',
      description: 'What GraphQL changes about API design and how a server is stood up.',
      topics: [
        {
          title: 'GraphQL compared with REST',
          description: 'A typed schema, client-specified field selection in one request and a single endpoint replace resource URLs and fixed payloads; what that buys (no over- or under-fetching) and what it costs (caching, complexity control, tooling).',
          concepts: ['Client-specified selection', 'Single endpoint and POST', 'Typed schema as the contract', 'Trade-offs against REST', 'When GraphQL is the wrong tool'],
          quiz: [
            ['What problem does field selection solve?', 'Over-fetching and under-fetching: clients get exactly the fields they ask for in one round trip.'],
            ['Why is HTTP caching harder with GraphQL?', 'Most requests are POSTs to one URL, so URL-based caches cannot key on them.'],
          ],
        },
        {
          title: 'Setting up a server with Apollo Server or Yoga',
          description: 'Installing graphql and @apollo/server or graphql-yoga, defining typeDefs and resolvers, mounting on Express or a standalone listener, and enabling the explorer in development.',
          concepts: ['Installing graphql and a server library', 'typeDefs and resolvers wiring', 'startStandaloneServer versus Express middleware', 'Yoga and the envelop plugin system', 'Development explorer'],
          quiz: [
            ['Which package provides the reference execution engine?', 'graphql (graphql-js), used by every server library.'],
            ['What does makeExecutableSchema do?', 'Combines typeDefs and resolvers into a GraphQLSchema object.'],
          ],
          prereqs: ['GraphQL compared with REST'],
        },
        {
          title: 'Operations, documents and introspection',
          description: 'A request carries a document, an operation name and variables; the server validates it against the schema before executing; introspection lets tools discover the schema and should be restricted in production.',
          concepts: ['Request shape: query, operationName, variables', 'Parse, validate, execute phases', 'Introspection queries', 'GET versus POST for operations', 'Restricting introspection in production'],
          quiz: [
            ['What happens if a document references a field that does not exist?', 'Validation fails and the response contains errors with no data.'],
            ['Which field starts an introspection query?', '__schema (or __type).'],
          ],
          prereqs: ['Setting up a server with Apollo Server or Yoga'],
        },
        {
          title: 'Tooling: GraphiQL, Code Generator and ESLint',
          description: 'GraphiQL and Apollo Sandbox for exploring, GraphQL Code Generator for typed resolvers and operations, the ESLint plugin for schema and operation rules, and VS Code extensions that validate documents against the schema.',
          concepts: ['GraphiQL and Apollo Sandbox', 'GraphQL Code Generator config', 'graphql-eslint rules', 'Editor schema validation'],
          quiz: [
            ['What does GraphQL Code Generator produce for a server?', 'TypeScript types for resolvers, arguments and the schema.'],
            ['Why lint operations against the schema?', 'To catch removed or misspelled fields before runtime.'],
          ],
          prereqs: ['Setting up a server with Apollo Server or Yoga'],
        },
      ],
    },
    {
      title: 'Schema Definition Language',
      topics: [
        {
          title: 'Scalars, object types and fields',
          description: 'The five built-in scalars (Int, Float, String, Boolean, ID), object types with typed fields, the root Query type as the entry point, and describing fields with docstrings.',
          concepts: ['Built-in scalars and ID', 'Object types and fields', 'The Query root type', 'Field descriptions'],
          quiz: [
            ['Is ID serialised as a string?', 'Yes, ID is always serialised as a string even if stored as a number.'],
            ['What makes a type the entry point of a schema?', 'Being declared as the query, mutation or subscription root.'],
          ],
        },
        {
          title: 'Non-null and list modifiers',
          description: 'Bang and brackets compose: [String!]! versus [String]!, how null propagates up to the nearest nullable parent when a non-null field fails, and why that shapes nullability decisions.',
          concepts: ['! and nullability', 'Lists and nested modifiers', 'Null propagation on errors', 'Nullable by default reasoning'],
          quiz: [
            ['What does [String!]! mean?', 'A non-null list whose items are non-null strings.'],
            ['What happens when a non-null field errors?', 'Null bubbles up to the nearest nullable ancestor, possibly nulling the whole response.'],
          ],
          prereqs: ['Scalars, object types and fields'],
        },
        {
          title: 'Enums, input types and arguments',
          description: 'Enums for fixed sets, input object types for structured arguments (separate from output types), default argument values, and argument validation at the schema layer.',
          concepts: ['Enum definitions and serialisation', 'Input types versus object types', 'Arguments and default values', 'Required arguments'],
          quiz: [
            ['Can an object type be used as an argument?', 'No; arguments must use input types, scalars or enums.'],
            ['How are enum values serialised over the wire?', 'As strings matching the enum value names.'],
          ],
          prereqs: ['Scalars, object types and fields'],
        },
        {
          title: 'Interfaces and unions',
          description: 'Interfaces share fields across types, unions group unrelated types; clients select with inline fragments and __typename, and the server needs resolveType or isTypeOf to identify the concrete type.',
          concepts: ['Interface definition and implementation', 'Union definition', 'Inline fragments and __typename', '__resolveType and isTypeOf', 'Choosing interface versus union'],
          quiz: [
            ['How does a client query a union of Book and Movie?', 'With inline fragments: ... on Book { title } ... on Movie { runtime }.'],
            ['What must the server provide for interface types?', 'A __resolveType resolver (or isTypeOf per type).'],
          ],
          prereqs: ['Enums, input types and arguments'],
        },
        {
          title: 'Custom scalars',
          description: 'Defining DateTime, JSON or Money scalars with serialize, parseValue and parseLiteral, using graphql-scalars for common ones, and what validation a scalar should and should not do.',
          concepts: ['scalar declaration', 'serialize, parseValue and parseLiteral', 'graphql-scalars library', 'Validation inside scalars'],
          quiz: [
            ['Difference between parseValue and parseLiteral?', 'parseValue handles variables; parseLiteral handles inline values in the document AST.'],
            ['Why not model DateTime as String?', 'A scalar validates format and gives clients a typed contract.'],
          ],
          prereqs: ['Scalars, object types and fields'],
        },
        {
          title: 'Directives and descriptions',
          description: 'Built-in @include, @skip and @deprecated, schema directives that annotate types and fields for auth or transformation, and descriptions that become documentation in every tool.',
          concepts: ['@include and @skip', '@deprecated with reason', 'Custom schema directives', 'Descriptions as documentation', '@specifiedBy for scalars'],
          quiz: [
            ['How does a client conditionally include a field?', 'field @include(if: $flag).'],
            ['What tools do with @deprecated?', 'Show warnings and hide the field in explorers and generated docs.'],
          ],
          prereqs: ['Scalars, object types and fields'],
        },
      ],
    },
    {
      title: 'Operations',
      topics: [
        {
          title: 'Queries, selection sets and aliases',
          description: 'Reading data by walking the graph from root fields through nested selection sets, aliases to request the same field twice with different arguments, and how the response mirrors the query shape.',
          concepts: ['Root fields and nesting', 'Arguments on any field', 'Aliases', 'Response shape mirroring'],
          quiz: [
            ['Why use an alias?', 'To request the same field twice with different arguments or rename it in the result.'],
            ['Can arguments appear on nested fields?', 'Yes, any field can declare arguments.'],
          ],
        },
        {
          title: 'Variables and fragments',
          description: 'Typed variables instead of string interpolation, default values, named fragments for reusable selections colocated with components, and fragment spreads across operations.',
          concepts: ['Declaring and typing variables', 'Default variable values', 'Named fragments and spreads', 'Fragment colocation'],
          quiz: [
            ['Why never interpolate values into a query string?', 'Injection risk and no caching; variables are typed and safe.'],
            ['What must a fragment declare?', 'The type it applies to: fragment UserFields on User { ... }.'],
          ],
          prereqs: ['Queries, selection sets and aliases'],
        },
        {
          title: 'Mutations and their design',
          description: 'Mutations run root fields serially, take a single input argument by convention, return a payload with the changed object, and are named as verbs (createOrder, not orderCreate) on a consistent pattern.',
          concepts: ['Serial execution of mutation fields', 'Single input argument convention', 'Returning the affected object', 'Verb naming', 'Idempotent mutations'],
          quiz: [
            ['Are top-level mutation fields executed in parallel?', 'No, serially in document order.'],
            ['Why return the updated object from a mutation?', 'So clients can update their cache without a second query.'],
          ],
          prereqs: ['Variables and fragments'],
        },
        {
          title: 'Subscriptions',
          description: 'Long-lived operations that push events over WebSockets (graphql-ws) or SSE, the PubSub abstraction on the server, filtering per subscriber, and why Redis PubSub is needed across instances.',
          concepts: ['subscribe resolvers and async iterators', 'graphql-ws transport', 'SSE alternative', 'PubSub and Redis for scale-out', 'Filtering with withFilter'],
          quiz: [
            ['What does a subscription resolver return?', 'An AsyncIterator that yields events.'],
            ['Why is in-memory PubSub insufficient in production?', 'Events published on one instance never reach subscribers on another.'],
          ],
          prereqs: ['Mutations and their design'],
        },
        {
          title: 'Operation naming and documents',
          description: 'Naming every operation for logs, tracing and persisted queries, one operation per document, and organising .graphql files per feature with fragments alongside the components that use them.',
          concepts: ['Named operations', 'One operation per document', 'Organising .graphql files', 'Operations in logs and traces'],
          quiz: [
            ['Why name operations?', 'Names appear in server logs, metrics and traces and are required for persisted queries.'],
            ['Where should a fragment live?', 'Next to the component that renders those fields.'],
          ],
          prereqs: ['Variables and fragments'],
        },
      ],
    },
    {
      title: 'Resolvers and Execution',
      topics: [
        {
          title: 'Resolver functions and default resolvers',
          description: 'A resolver receives (parent, args, context, info) and returns a value or promise; fields without resolvers fall back to reading the property from parent, so most object fields need none.',
          concepts: ['The four resolver arguments', 'Default property resolver', 'Returning promises', 'Resolver maps and typing'],
          quiz: [
            ['What is the first argument of a resolver?', 'The parent value returned by the enclosing field.'],
            ['Do you need a resolver for every field?', 'No, the default resolver reads parent[fieldName].'],
          ],
        },
        {
          title: 'The context object',
          description: 'A per-request object built once and passed to every resolver, holding the authenticated user, data sources, loaders and a request id; it must be created per request so caches never leak across users.',
          concepts: ['Building context per request', 'User and auth in context', 'Data sources and loaders in context', 'Typing the context'],
          quiz: [
            ['Why is context created per request?', 'DataLoader caches and user identity must not leak between requests.'],
            ['What should context not contain?', 'Business logic; it carries dependencies and request state.'],
          ],
          prereqs: ['Resolver functions and default resolvers'],
        },
        {
          title: 'Execution model and resolver chains',
          description: 'Execution walks the selection set breadth-first per level, resolving sibling fields concurrently and child fields after their parent resolves; understanding this explains where database calls happen and how many.',
          concepts: ['Level-by-level execution', 'Sibling concurrency', 'Parent-to-child data flow', 'The info argument and lookahead'],
          quiz: [
            ['When does a child field resolver run?', 'After its parent resolver has returned.'],
            ['What is info used for?', 'Inspecting the requested selection to optimise fetching (lookahead).'],
          ],
          prereqs: ['Resolver functions and default resolvers'],
        },
        {
          title: 'The N+1 problem',
          description: 'A list of 50 posts each resolving author fires 50 author queries, because resolvers are independent; recognising the pattern in query logs and understanding why naive joins do not fix it for a graph.',
          concepts: ['How nested lists multiply queries', 'Spotting N+1 in logs', 'Why per-resolver joins fail', 'Cost across nesting levels'],
          quiz: [
            ['How many queries does posts { author { name } } run naively for 50 posts?', '51: one for posts, one per author.'],
            ['Why does the problem grow with nesting?', 'Each level multiplies by the number of parents.'],
          ],
          prereqs: ['Execution model and resolver chains'],
        },
        {
          title: 'DataLoader batching and caching',
          description: 'DataLoader collects keys requested in one tick, calls a batch function once, and caches per request; writing batch functions that return results in key order and handling missing keys.',
          concepts: ['Batch function contract', 'Per-request loader instances', 'Key ordering and missing keys', 'Priming and clearing the cache', 'Loaders for one-to-many'],
          quiz: [
            ['What must a batch function return?', 'An array the same length and order as the keys, with null or Error for misses.'],
            ['Why create loaders in context rather than module scope?', 'A shared cache would serve one user\'s data to another.'],
          ],
          prereqs: ['The N+1 problem'],
        },
        {
          title: 'Resolver-level authorization',
          description: 'Checking permissions inside resolvers or via wrappers, returning null versus throwing for forbidden fields, and centralising rules in a service layer so REST and GraphQL share them.',
          concepts: ['Checks in resolvers', 'Null versus error for forbidden data', 'Wrapper functions for auth', 'Shared authorization service'],
          quiz: [
            ['Should a forbidden field return null or an error?', 'Depends on the design: null hides existence; an error tells the client why.'],
            ['Why put rules in a service layer?', 'Both GraphQL and other transports enforce the same rules and they are unit-testable.'],
          ],
          prereqs: ['The context object'],
        },
      ],
    },
    {
      title: 'Schema Design',
      style: 'design',
      topics: [
        {
          title: 'Schema-first versus code-first',
          description: 'Writing SDL and mapping resolvers, or generating the schema from code with Pothos, Nexus or TypeGraphQL; how each keeps types in sync and which suits a team.',
          concepts: ['SDL-first workflow', 'Pothos and Nexus builders', 'TypeGraphQL decorators', 'Keeping types in sync', 'Team fit'],
          quiz: [
            ['What is the main benefit of code-first?', 'Schema and resolver types come from one source, so they cannot drift.'],
            ['What does schema-first make easier?', 'Reviewing the API contract as a readable document.'],
          ],
        },
        {
          title: 'Designing for clients and nullability',
          description: 'Model the graph around client use cases rather than tables, make fields nullable unless guaranteed, and avoid generic types that force clients to guess.',
          concepts: ['Client use cases drive types', 'Nullable unless guaranteed', 'Avoid mirroring database tables', 'Specific types over generic ones'],
          quiz: [
            ['Why default to nullable fields?', 'A failing non-null field nulls its parent; nullable fields degrade gracefully.'],
            ['What is wrong with exposing a JSON scalar for everything?', 'Clients lose typing, tooling and documentation.'],
          ],
          prereqs: ['Schema-first versus code-first'],
        },
        {
          title: 'Relay connections and pagination',
          description: 'The Connection spec: edges with cursors and nodes, pageInfo with hasNextPage and endCursor, first/after and last/before arguments, and implementing opaque cursors over keyset queries.',
          concepts: ['Connection, Edge and PageInfo types', 'first/after and last/before', 'Opaque cursors', 'Keyset queries behind cursors', 'totalCount decisions'],
          quiz: [
            ['What does pageInfo.endCursor provide?', 'The cursor to pass as after for the next page.'],
            ['Why base64-encode cursors?', 'To keep them opaque so clients do not depend on their format.'],
          ],
          prereqs: ['Designing for clients and nullability'],
        },
        {
          title: 'Mutation payloads and errors as data',
          description: 'Returning a payload type with the result and a userErrors list (or a union of Success and error types) so expected failures are typed and selectable, while unexpected failures use the errors array.',
          concepts: ['Payload types', 'userErrors lists', 'Result unions per mutation', 'Expected versus unexpected errors'],
          quiz: [
            ['Why model validation errors in the schema?', 'Clients get typed, field-level errors they can render, not free-text messages.'],
            ['What should still go in the top-level errors array?', 'Unexpected failures such as crashes or auth errors.'],
          ],
          prereqs: ['Designing for clients and nullability'],
        },
        {
          title: 'Schema evolution and deprecation',
          description: 'Additive changes are safe; removing or changing types breaks clients; @deprecated with usage tracking, schema registries and breaking-change checks in CI keep a versionless API healthy.',
          concepts: ['Additive versus breaking changes', '@deprecated and field usage tracking', 'Schema registry and checks', 'Removing fields safely'],
          quiz: [
            ['Why does GraphQL rarely version the whole API?', 'Clients pick fields, so new fields can be added and old ones deprecated in place.'],
            ['How do you know a deprecated field is safe to delete?', 'Usage metrics show no clients request it.'],
          ],
          prereqs: ['Schema-first versus code-first'],
        },
      ],
    },
    {
      title: 'Authentication, Authorization and Errors',
      description: 'Token formats and OAuth flows live in track-rest-api; this is the GraphQL integration.',
      topics: [
        {
          title: 'Authentication in context',
          description: 'Verifying a bearer token or session in the context factory, attaching the user, letting unauthenticated requests through for public fields, and rejecting at the resolver rather than the transport.',
          concepts: ['Token verification in context factory', 'Anonymous versus authenticated context', 'Public fields', 'WebSocket connection auth'],
          quiz: [
            ['Why not reject unauthenticated requests before execution?', 'Some fields are public; the schema decides per field.'],
            ['How is a subscription connection authenticated?', 'Through connectionParams on connect with graphql-ws.'],
          ],
        },
        {
          title: 'Authorization patterns',
          description: 'Schema directives like @auth(requires: ADMIN), graphql-shield rule trees, and plain checks in resolvers; how to combine them and keep object-level checks close to data access.',
          concepts: ['@auth schema directives', 'graphql-shield rules', 'Object-level checks near data', 'Field-level masking', 'Combining approaches'],
          quiz: [
            ['What does a schema directive approach make visible?', 'Permissions in the SDL, readable by everyone.'],
            ['Where must object ownership be checked?', 'Where the object is loaded, using the caller from context.'],
          ],
          prereqs: ['Authentication in context'],
        },
        {
          title: 'Error handling and partial data',
          description: 'GraphQLError with extensions.code, partial responses with both data and errors, masking internal errors, and formatting errors consistently with a formatError hook.',
          concepts: ['GraphQLError and extensions', 'Partial data with errors', 'Masking internal errors', 'formatError hooks', 'Error paths'],
          quiz: [
            ['Can a response contain both data and errors?', 'Yes; failed fields are null and listed in errors with a path.'],
            ['Why mask unexpected errors?', 'Stack traces and internals must not reach clients.'],
          ],
          prereqs: ['Authentication in context'],
        },
        {
          title: 'Input validation',
          description: 'Schema types catch shape errors, but ranges, formats and cross-field rules need validation in resolvers or with zod or class-validator, returning typed userErrors.',
          concepts: ['Schema-level validation limits', 'zod schemas for inputs', 'Cross-field rules', 'Returning validation as userErrors'],
          quiz: [
            ['What does the schema validate for free?', 'Types, required fields and enum membership.'],
            ['Where does "endDate after startDate" get checked?', 'In the resolver or a validation layer, not the schema.'],
          ],
          prereqs: ['Error handling and partial data'],
        },
      ],
    },
    {
      title: 'Federation, Caching and Security',
      topics: [
        {
          title: 'Apollo Federation',
          description: 'Subgraphs own parts of the graph and extend entities with @key; the router composes a supergraph and plans queries across services; entity resolution via _entities and reference resolvers.',
          concepts: ['Subgraphs and the supergraph', '@key and entities', 'Reference resolvers', 'Query planning in the router', 'Composition checks'],
          quiz: [
            ['What does @key declare?', 'The fields that uniquely identify an entity so other subgraphs can reference it.'],
            ['What resolves an entity referenced from another subgraph?', 'The __resolveReference resolver in the owning subgraph.'],
          ],
        },
        {
          title: 'Schema stitching versus federation',
          description: 'Stitching merges schemas in a gateway with delegation; federation pushes ownership into subgraphs with a spec; trade-offs in coupling, tooling and team autonomy.',
          concepts: ['Stitching and delegation', 'Federation ownership model', 'Coupling and autonomy', 'Migration between approaches'],
          quiz: [
            ['Where does the merge logic live in stitching?', 'In the gateway, which knows every underlying schema.'],
            ['Why do larger organisations prefer federation?', 'Teams own their subgraph and composition is checked centrally.'],
          ],
          prereqs: ['Apollo Federation'],
        },
        {
          title: 'Persisted queries and APQ',
          description: 'Sending a hash instead of the document to cut bandwidth and enable GET caching, automatic persisted queries negotiated at runtime, and safelisted persisted queries that block arbitrary operations.',
          concepts: ['Automatic persisted queries flow', 'Safelisting operations at build time', 'GET requests and CDN caching', 'Blocking unknown operations'],
          quiz: [
            ['What does APQ send first?', 'The hash; if the server does not know it, the client retries with the full document.'],
            ['How does safelisting improve security?', 'Only operations known at build time are executed.'],
          ],
        },
        {
          title: 'Response caching and cache hints',
          description: 'Per-field @cacheControl hints combined into a response max-age, full-response caches in the server or CDN, and entity-level caching in clients; what is safe to cache per user versus publicly.',
          concepts: ['@cacheControl hints', 'Computed response max-age', 'Full-response cache plugins', 'Public versus private scope', 'CDN caching with GET'],
          quiz: [
            ['How is the response max-age determined from hints?', 'The minimum across all fields in the response.'],
            ['What does scope: PRIVATE do?', 'Marks the response cacheable only per user.'],
          ],
          prereqs: ['Persisted queries and APQ'],
        },
        {
          title: 'Security: depth, complexity and batching limits',
          description: 'Rejecting deeply nested or expensive queries with depth limits and cost analysis, limiting batched operations and aliases, disabling introspection in production, and timeouts per operation.',
          concepts: ['Depth limiting', 'Query cost analysis', 'Alias and batch limits', 'Introspection off in production', 'Operation timeouts'],
          quiz: [
            ['Why is a depth limit not enough?', 'A shallow query over big lists can still be expensive; cost analysis accounts for list sizes.'],
            ['What attack does alias limiting address?', 'Repeating an expensive field thousands of times under different aliases.'],
          ],
        },
      ],
    },
    {
      title: 'Clients',
      topics: [
        {
          title: 'Apollo Client queries and the normalised cache',
          description: 'useQuery with loading and error states, the InMemoryCache normalising objects by __typename and id, fetch policies, and type policies for custom keys and pagination merging.',
          concepts: ['ApolloProvider and useQuery', 'Cache normalisation by typename and id', 'Fetch policies', 'Type policies and keyFields', 'Field policies for pagination'],
          quiz: [
            ['Why must queries include id?', 'The cache normalises objects by __typename and id; without it entries cannot be shared or updated.'],
            ['What does fetchPolicy: "cache-and-network" do?', 'Returns cached data immediately and refreshes from the network.'],
          ],
        },
        {
          title: 'Apollo Client mutations and cache updates',
          description: 'useMutation, automatic cache updates for returned objects with ids, manual update functions and cache.modify for lists, optimistic responses, and refetchQueries as the blunt tool.',
          concepts: ['useMutation and result handling', 'Automatic updates by id', 'update and cache.modify for lists', 'Optimistic responses', 'refetchQueries trade-offs'],
          quiz: [
            ['Why does adding an item need a manual cache update?', 'The cache cannot know which list the new object belongs to.'],
            ['What does an optimistic response do?', 'Updates the UI immediately and rolls back if the mutation fails.'],
          ],
          prereqs: ['Apollo Client queries and the normalised cache'],
        },
        {
          title: 'urql and exchanges',
          description: 'A smaller client built around an exchange pipeline (cache, fetch, auth, retry), document caching by default with Graphcache as the normalised option, and when it beats Apollo.',
          concepts: ['Client and exchange pipeline', 'Document cache versus Graphcache', 'authExchange for token refresh', 'retryExchange', 'Choosing urql or Apollo'],
          quiz: [
            ['How does urql\'s default cache invalidate?', 'By __typename: a mutation returning a type invalidates queries containing it.'],
            ['What is an exchange?', 'A middleware step in the operation pipeline, like fetch or caching.'],
          ],
        },
        {
          title: 'Typed operations with Code Generator',
          description: 'Generating TypeScript types and hooks from operations, the client preset with TypedDocumentNode, fragment masking, and running codegen in watch mode and CI.',
          concepts: ['Client preset and TypedDocumentNode', 'Generated hooks', 'Fragment masking', 'Codegen in CI'],
          quiz: [
            ['What does TypedDocumentNode carry?', 'The result and variable types attached to the document.'],
            ['What is fragment masking?', 'Components can only read fields from fragments they declared.'],
          ],
          prereqs: ['Apollo Client queries and the normalised cache'],
        },
      ],
    },
    {
      title: 'Testing and Operations',
      topics: [
        {
          title: 'Unit testing resolvers',
          description: 'Calling resolver functions directly with fake parent, args and context, testing DataLoader batch functions, and asserting on thrown GraphQLErrors.',
          concepts: ['Calling resolvers directly', 'Fake context and loaders', 'Testing batch functions', 'Asserting error codes'],
          quiz: [
            ['What do you pass as the third argument when unit testing a resolver?', 'A fake context with the user and stubbed data sources.'],
            ['How do you test a batch function\'s ordering guarantee?', 'Pass shuffled keys and assert results align with the keys array.'],
          ],
        },
        {
          title: 'Integration testing with executeOperation',
          description: 'Running operations against the real schema with server.executeOperation or a Yoga fetch, seeding a test database, and checking both data and errors in responses.',
          concepts: ['executeOperation and contextValue', 'Yoga fetch-based tests', 'Seeding and cleanup', 'Asserting data and errors', 'Testing subscriptions'],
          quiz: [
            ['Why test through executeOperation rather than HTTP?', 'It exercises parsing, validation and resolvers without network overhead.'],
            ['How do you supply an authenticated user?', 'Pass it in contextValue.'],
          ],
          prereqs: ['Unit testing resolvers'],
        },
        {
          title: 'Schema checks and operation safety',
          description: 'Comparing the proposed schema against production usage to flag breaking changes, validating client operations against the schema in CI, and gating deploys on both.',
          concepts: ['Breaking change detection', 'Operation validation in client CI', 'Schema registry workflow', 'Gating deploys'],
          quiz: [
            ['What does a schema check compare?', 'The new schema against the current one and recent operation usage.'],
            ['Why validate client operations in the client repo?', 'A field removal fails the client build before it fails users.'],
          ],
          prereqs: ['Integration testing with executeOperation'],
        },
        {
          title: 'Observability and tracing',
          description: 'Logging operation names and durations, per-resolver traces with Apollo usage reporting or OpenTelemetry, field-level metrics, and alerting on error rates per operation.',
          concepts: ['Operation-level logging', 'Resolver traces', 'Field usage metrics', 'Error rates per operation', 'Slow resolver detection'],
          quiz: [
            ['Why trace at the resolver level?', 'A slow operation is usually one slow resolver hidden inside it.'],
            ['Which metric shows a field is safe to remove?', 'Field usage over a window with zero requests.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: bookshelf API with DataLoader',
          description: 'A GraphQL API for books, authors and reviews on Postgres: SDL schema, resolvers with DataLoader, Relay connections, mutation payloads with userErrors, JWT context auth and integration tests.',
          concepts: ['Schema and resolver scaffolding', 'Loaders for authors and reviews', 'Connections with cursors', 'Mutation payloads', 'executeOperation test suite'],
          quiz: [
            ['Which query proves DataLoader works?', 'books { author { name } } running two queries regardless of book count.'],
            ['What should createReview return on a bad rating?', 'A payload with userErrors, not a thrown error.'],
          ],
        },
        {
          title: 'Project: live dashboard with subscriptions',
          description: 'Metrics pushed to a React dashboard: subscriptions over graphql-ws with Redis PubSub, filtered per tenant, Apollo Client cache updates from subscription data and reconnect handling.',
          concepts: ['PubSub with Redis', 'Filtered subscriptions', 'graphql-ws server and client', 'Cache updates from events', 'Reconnect and backoff'],
          quiz: [
            ['How do you stop tenant A receiving tenant B events?', 'withFilter comparing the event tenant with the subscriber context.'],
            ['What happens to a subscription when the socket drops?', 'The client reconnects and resubscribes; missed events are lost unless replayed.'],
          ],
        },
        {
          title: 'Project: federated commerce graph',
          description: 'Products, inventory and reviews as three subgraphs with @key entities composed by the Apollo Router; add a field from inventory onto Product, run composition checks in CI and trace a query plan.',
          concepts: ['Three subgraphs with entities', 'Router composition', 'Extending an entity across subgraphs', 'Composition checks in CI', 'Reading query plans'],
          quiz: [
            ['How does the reviews subgraph add reviews to Product?', 'It declares Product with @key(fields: "id") and adds the reviews field.'],
            ['What happens when two subgraphs define conflicting fields?', 'Composition fails and the CI check blocks the deploy.'],
          ],
        },
        {
          title: 'Project: hardened public GraphQL API',
          description: 'Take the bookshelf API public: persisted query safelist, depth and cost limits, introspection off, response cache hints, rate limits per client, and k6 load tests.',
          concepts: ['Safelisted persisted queries', 'Depth and cost limits', 'Cache hints and CDN GET', 'Client rate limits', 'Load test thresholds'],
          quiz: [
            ['How do you let a public client run only approved queries?', 'A safelist of persisted query hashes; unknown documents are rejected.'],
            ['Why can GET be used for safelisted queries?', 'The hash and variables fit in the URL, making CDN caching possible.'],
          ],
        },
        {
          title: 'GraphQL interview questions',
          description: 'What interviewers ask: GraphQL versus REST, N+1 and DataLoader, nullability, mutation design, subscriptions transport, caching challenges, federation, and security limits.',
          concepts: ['Fundamentals questions', 'Performance questions', 'Schema design questions', 'Security questions'],
          quiz: [
            ['Explain DataLoader in two sentences.', 'It batches key lookups made in one tick into a single fetch and caches results per request, removing N+1 queries.'],
            ['Why are most fields nullable in well-designed schemas?', 'So a single failing field does not null out the whole response.'],
          ],
          style: 'reading',
        },
        {
          title: 'GraphQL schema design exercises',
          description: 'Design a schema for a social feed, a marketplace or a booking system in 30 minutes: entities, connections, mutations with payloads, auth boundaries and evolution strategy.',
          concepts: ['Structuring a schema answer', 'Entities and connections', 'Mutations and payloads', 'Auth and evolution considerations'],
          quiz: [
            ['How should you present pagination in a design answer?', 'Relay connections with cursors and pageInfo, and why.'],
            ['What shows evolution thinking?', 'Nullable fields, @deprecated plans and additive changes.'],
          ],
          style: 'design',
        },
      ],
    },
  ],
})
