import { defineTrack } from '../define'

export const grpc = defineTrack({
  id: 'track-grpc',
  title: 'gRPC',
  description: 'gRPC services in Go with Protocol Buffers: messages, enums and schema evolution, service definitions and code generation with buf, unary and streaming RPCs, deadlines and cancellation, status codes and rich errors, interceptors, TLS and token auth, load balancing, gRPC-Web and grpc-gateway, observability, testing and performance.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '📡',
  tags: ['grpc', 'protobuf', 'go', 'http2', 'streaming', 'buf', 'microservices', 'grpc-gateway'],
  languages: ['Go'],
  explainMode: 'concept',
  code: { label: 'Go with gRPC (Protocol Buffers)', id: 'go', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-rest-api'],
  style: 'code',
  categories: [
    {
      title: 'Foundations',
      description: 'What gRPC is, why it sits on HTTP/2, and a first service running end to end.',
      topics: [
        {
          title: 'What gRPC is and when to use it',
          description: 'A contract-first RPC framework using Protocol Buffers over HTTP/2 with generated clients in many languages; strong for service-to-service calls, streaming and polyglot systems, weaker for browsers and public APIs where JSON over REST wins.',
          concepts: ['Contract-first RPC', 'Binary encoding and generated stubs', 'Service-to-service fit', 'Where REST still wins', 'gRPC versus GraphQL versus REST'],
          quiz: [
            ['Name two situations where gRPC beats REST.', 'High-throughput internal service calls and bidirectional streaming.'],
            ['Why is gRPC awkward for browsers?', 'Browsers cannot expose HTTP/2 framing and trailers, so a proxy such as gRPC-Web is needed.'],
          ],
        },
        {
          title: 'HTTP/2 as the transport',
          description: 'How gRPC maps calls onto HTTP/2 streams: one TCP connection multiplexes many RPCs, headers carry metadata, length-prefixed messages form the body, and trailers carry the status; this is why plain HTTP/1.1 proxies break gRPC.',
          concepts: ['Streams and multiplexing', 'Length-prefixed message framing', 'Headers, trailers and grpc-status', 'Proxies that break gRPC', 'Flow control windows'],
          quiz: [
            ['Where does the RPC status travel?', 'In HTTP/2 trailers as grpc-status and grpc-message.'],
            ['Why can many RPCs share one connection?', 'HTTP/2 multiplexes independent streams over a single TCP connection.'],
          ],
          prereqs: ['What gRPC is and when to use it'],
        },
        {
          title: 'Installing protoc, buf and the Go plugins',
          description: 'Setting up protoc or buf, protoc-gen-go and protoc-gen-go-grpc, go module layout for generated code, and the go_package option that decides import paths.',
          concepts: ['protoc versus buf CLI', 'protoc-gen-go and protoc-gen-go-grpc', 'go_package option', 'Where generated code lives', 'Version pinning of plugins'],
          quiz: [
            ['Which two plugins does Go need?', 'protoc-gen-go for messages and protoc-gen-go-grpc for services.'],
            ['What does option go_package control?', 'The Go import path and package name of the generated code.'],
          ],
          prereqs: ['What gRPC is and when to use it'],
        },
        {
          title: 'A first service end to end',
          description: 'Writing greeter.proto, generating code, implementing the server interface, registering it on a grpc.Server, dialing from a client with grpc.NewClient, and calling it with grpcurl.',
          concepts: ['Writing the .proto file', 'Implementing the generated server interface', 'grpc.NewServer and RegisterService', 'grpc.NewClient and stubs', 'grpcurl for manual calls'],
          quiz: [
            ['What must your server struct embed?', 'The generated UnimplementedGreeterServer for forward compatibility.'],
            ['What does grpcurl need to call a server without proto files?', 'Server reflection enabled.'],
          ],
          prereqs: ['Installing protoc, buf and the Go plugins'],
        },
      ],
    },
    {
      title: 'Protocol Buffers',
      description: 'The schema language and wire format behind every gRPC message.',
      topics: [
        {
          title: 'Messages, fields and scalar types',
          description: 'message blocks with typed fields, the scalar types (int32, int64, uint, sint, fixed, float, double, bool, string, bytes), proto3 defaults, and how each maps to Go types.',
          concepts: ['message syntax in proto3', 'Scalar types and their Go mapping', 'sint and fixed variants', 'Default values in proto3', 'string versus bytes'],
          quiz: [
            ['When should you use sint32 instead of int32?', 'For values that are often negative; sint uses zigzag encoding which keeps them small.'],
            ['What is the default of an unset string in proto3?', 'The empty string; there is no distinction from an explicitly set empty string.'],
          ],
        },
        {
          title: 'Field numbers and the wire format',
          description: 'Each field is encoded as a tag (number and wire type) followed by the value, numbers 1 to 15 cost one byte, unknown fields are preserved, and why numbers must never be reused.',
          concepts: ['Tags and wire types', 'Varint encoding', 'One-byte tags for 1 to 15', 'Unknown field preservation', 'Never reuse numbers'],
          quiz: [
            ['Why do field numbers, not names, matter on the wire?', 'Only numbers are encoded, so renaming a field is safe but renumbering breaks compatibility.'],
            ['What does a decoder do with an unknown field?', 'Keeps it so re-encoding preserves it.'],
          ],
          prereqs: ['Messages, fields and scalar types'],
        },
        {
          title: 'Enums and defaults',
          description: 'enum definitions with a required zero value, the UNSPECIFIED convention, allow_alias, and how unknown enum values arrive from newer senders.',
          concepts: ['Zero value must exist', 'UNSPECIFIED convention', 'allow_alias', 'Unknown enum values from newer peers'],
          quiz: [
            ['Why should the first enum value be UNSPECIFIED?', 'Zero is the default for unset fields, so it must not mean something real.'],
            ['What happens when a client receives an enum value it does not know?', 'It is kept as its integer value; Go exposes it as the raw number.'],
          ],
          prereqs: ['Messages, fields and scalar types'],
        },
        {
          title: 'Nested, repeated and map fields',
          description: 'Nested messages, repeated fields as lists with packed encoding, map fields and their key restrictions, and how Go represents each (slices, maps, pointers to nested structs).',
          concepts: ['Nested message types', 'repeated and packed encoding', 'map fields and key types', 'Go representation of each'],
          quiz: [
            ['Can a map key be a float or a message?', 'No; keys must be integral or string types.'],
            ['How is a repeated int32 encoded in proto3?', 'Packed: one tag followed by all values.'],
          ],
          prereqs: ['Messages, fields and scalar types'],
        },
        {
          title: 'oneof and optional',
          description: 'oneof for mutually exclusive fields with presence, proto3 optional for scalar presence tracking, and how Go generates interfaces for oneof and pointers for optional.',
          concepts: ['oneof semantics and presence', 'proto3 optional', 'Go oneof interface types', 'Pointers for optional scalars', 'Checking which field is set'],
          quiz: [
            ['What does setting a second field of a oneof do?', 'Clears the previously set field.'],
            ['How do you tell an unset optional int32 from zero in Go?', 'The generated field is a pointer; nil means unset.'],
          ],
          prereqs: ['Nested, repeated and map fields'],
        },
        {
          title: 'Well-known types',
          description: 'Timestamp, Duration, Empty, Any, Struct, wrappers and FieldMask from google/protobuf, and how to convert them in Go with timestamppb and durationpb.',
          concepts: ['Timestamp and Duration', 'Empty for no-argument RPCs', 'Any and type URLs', 'Struct and Value for JSON-like data', 'FieldMask for partial updates'],
          quiz: [
            ['How do you convert time.Time to a Timestamp in Go?', 'timestamppb.New(t).'],
            ['What is a FieldMask used for?', 'Listing which fields an update should touch.'],
          ],
          prereqs: ['Messages, fields and scalar types'],
        },
        {
          title: 'Schema evolution and compatibility rules',
          description: 'Safe changes (adding fields, renaming, adding enum values, converting between compatible types), unsafe ones (changing numbers or types, removing required semantics), reserved numbers and names, and buf breaking checks.',
          concepts: ['Safe and unsafe changes', 'reserved numbers and names', 'Compatible type conversions', 'buf breaking in CI', 'Deprecating fields'],
          quiz: [
            ['What must you do when deleting a field?', 'Reserve its number and name so they cannot be reused.'],
            ['Is changing int32 to int64 wire-compatible?', 'Yes, both are varints, though values may truncate on the older side.'],
          ],
          prereqs: ['Field numbers and the wire format'],
        },
      ],
    },
    {
      title: 'Service Definitions and Code Generation',
      topics: [
        {
          title: 'Defining services and RPCs',
          description: 'service blocks with rpc methods that take and return exactly one message each, the stream keyword for streaming, and request/response message naming conventions.',
          concepts: ['service and rpc syntax', 'One request and one response message', 'stream keyword placement', 'Request and Response naming conventions', 'Grouping RPCs per service'],
          quiz: [
            ['Can an RPC take two message types as arguments?', 'No; wrap them in one request message.'],
            ['Why give each RPC its own request message even if empty?', 'Fields can be added later without breaking the signature.'],
          ],
        },
        {
          title: 'Generated Go code: clients and servers',
          description: 'What protoc-gen-go-grpc emits: a client interface with methods per RPC, a server interface, the Unimplemented struct, registration functions and stream types; reading it avoids surprises.',
          concepts: ['Client interface and NewXClient', 'Server interface and Unimplemented struct', 'RegisterXServer', 'Generated stream types', 'Message getters and nil safety'],
          quiz: [
            ['Why do generated messages have Get methods?', 'They are nil-safe, so calling them on a nil message returns the default.'],
            ['What breaks if you do not embed the Unimplemented struct?', 'Adding an RPC to the proto stops your server compiling.'],
          ],
          prereqs: ['Defining services and RPCs'],
        },
        {
          title: 'buf: lint, breaking and generate',
          description: 'buf.yaml modules, buf lint with the standard style rules, buf breaking against the main branch, buf.gen.yaml templates for plugins, and the Buf Schema Registry for sharing protos.',
          concepts: ['buf.yaml and modules', 'buf lint rules', 'buf breaking against git', 'buf.gen.yaml plugin templates', 'Buf Schema Registry'],
          quiz: [
            ['What does buf breaking --against ".git#branch=main" do?', 'Compares the current protos with main and fails on incompatible changes.'],
            ['Why use buf over raw protoc?', 'Dependency management, linting, breaking-change checks and reproducible generation.'],
          ],
          prereqs: ['Generated Go code: clients and servers'],
        },
        {
          title: 'Packages, imports and options',
          description: 'proto packages as namespaces, importing other files and well-known types, versioned package names like shop.v1, and file and field options that tune generation.',
          concepts: ['package and namespacing', 'import paths and dependencies', 'Versioned packages like v1', 'File and field options', 'Directory layout mirroring packages'],
          quiz: [
            ['Why put a version in the package name?', 'A breaking change can ship as shop.v2 alongside v1.'],
            ['What is the fully qualified name of message Order in package shop.v1?', 'shop.v1.Order.'],
          ],
          prereqs: ['Defining services and RPCs'],
        },
      ],
    },
    {
      title: 'RPC Types',
      topics: [
        {
          title: 'Unary RPCs',
          description: 'The request-response call: server method signature with ctx and request, client call with ctx and options, and passing per-call options such as timeouts and metadata.',
          concepts: ['Server signature with context', 'Client call and CallOptions', 'Error return and status', 'Request validation before work'],
          quiz: [
            ['What does a unary server method return?', 'A response message and an error.'],
            ['Where do per-call settings like deadlines come from?', 'The context and CallOptions passed by the client.'],
          ],
        },
        {
          title: 'Server streaming',
          description: 'One request, many responses: the server calls stream.Send in a loop and returns to end the stream; the client calls Recv until io.EOF; use cases like tailing logs and paging large results.',
          concepts: ['stream.Send on the server', 'Recv until io.EOF', 'Ending the stream by returning', 'Backpressure on Send', 'Use cases for server streams'],
          quiz: [
            ['How does the client know the stream ended?', 'Recv returns io.EOF.'],
            ['What happens if Send blocks?', 'HTTP/2 flow control is applying backpressure; the client is not reading fast enough.'],
          ],
          prereqs: ['Unary RPCs'],
        },
        {
          title: 'Client streaming',
          description: 'Many requests, one response: the client Sends then calls CloseAndRecv; the server Recvs until io.EOF and returns via SendAndClose; useful for uploads and batched metrics.',
          concepts: ['Client Send and CloseAndRecv', 'Server Recv loop and SendAndClose', 'Half-close semantics', 'Use cases for client streams'],
          quiz: [
            ['How does the client signal it is done sending?', 'CloseAndRecv, which half-closes and waits for the response.'],
            ['What does the server return after the loop?', 'stream.SendAndClose(response).'],
          ],
          prereqs: ['Unary RPCs'],
        },
        {
          title: 'Bidirectional streaming and flow control',
          description: 'Independent send and receive streams, goroutines for concurrent reading and writing, the rule that Send and Recv are each safe from one goroutine at a time, and ending cleanly with CloseSend.',
          concepts: ['Independent send and receive', 'Goroutine per direction', 'Concurrency rules for Send and Recv', 'CloseSend and termination', 'Message ordering guarantees'],
          quiz: [
            ['Can two goroutines call Send on the same stream?', 'No; only one goroutine may Send at a time (and one may Recv).'],
            ['How does a bidi client end its side?', 'stream.CloseSend(), then keeps receiving until io.EOF.'],
          ],
          prereqs: ['Server streaming', 'Client streaming'],
        },
      ],
    },
    {
      title: 'Deadlines, Errors and Metadata',
      topics: [
        {
          title: 'Deadlines and cancellation',
          description: 'Clients set a deadline on the context that propagates across hops; servers check ctx.Err() and stop work; DEADLINE_EXCEEDED and CANCELED statuses, and why every RPC should have a deadline.',
          concepts: ['context.WithTimeout on calls', 'Deadline propagation across services', 'Checking ctx.Err() in servers', 'DEADLINE_EXCEEDED versus CANCELED', 'Default deadlines policy'],
          quiz: [
            ['What happens with no deadline?', 'A call can hang forever waiting on a stuck server.'],
            ['Does a deadline propagate to downstream gRPC calls?', 'Yes, if the server passes its ctx to the outgoing call.'],
          ],
        },
        {
          title: 'Status codes',
          description: 'The 17 canonical codes (OK, INVALID_ARGUMENT, NOT_FOUND, ALREADY_EXISTS, PERMISSION_DENIED, UNAUTHENTICATED, RESOURCE_EXHAUSTED, FAILED_PRECONDITION, UNAVAILABLE, INTERNAL and more), creating them with status.Error, and mapping domain errors consistently.',
          concepts: ['The canonical code set', 'status.Error and status.Errorf', 'status.FromError on the client', 'Mapping domain errors to codes', 'Which codes are retryable'],
          quiz: [
            ['Which code for a missing record?', 'NOT_FOUND.'],
            ['Which code says the caller is authenticated but not allowed?', 'PERMISSION_DENIED.'],
          ],
          prereqs: ['Deadlines and cancellation'],
        },
        {
          title: 'Rich error details',
          description: 'Attaching typed details (BadRequest field violations, RetryInfo, ErrorInfo) to a status with WithDetails, reading them on the client, and keeping messages free of secrets.',
          concepts: ['status.WithDetails', 'google.rpc error detail types', 'BadRequest field violations', 'Reading details on the client', 'Safe error messages'],
          quiz: [
            ['How do you attach field-level validation errors?', 'Add an errdetails.BadRequest with FieldViolations via st.WithDetails.'],
            ['Where does the client read details?', 'status.Convert(err).Details().'],
          ],
          prereqs: ['Status codes'],
        },
        {
          title: 'Metadata: headers and trailers',
          description: 'Key-value metadata sent as HTTP/2 headers (before the response) and trailers (after), setting it from clients with metadata.AppendToOutgoingContext, reading it in servers, and binary keys with the -bin suffix.',
          concepts: ['Outgoing metadata on the client', 'Incoming metadata on the server', 'Headers versus trailers', '-bin suffix for binary values', 'Reserved keys'],
          quiz: [
            ['How does a server send a trailer?', 'grpc.SetTrailer(ctx, md) before returning.'],
            ['Why does a key end with -bin?', 'The value is binary and will be base64-encoded on the wire.'],
          ],
          prereqs: ['Status codes'],
        },
        {
          title: 'Retries and hedging',
          description: 'Client-side retry policy via service config for safe, retryable codes, exponential backoff, hedging for latency, and the server-side pushback and idempotency conditions that make retries safe.',
          concepts: ['Service config retry policy', 'Retryable status codes', 'Backoff parameters', 'Hedging trade-offs', 'Idempotency and retry safety'],
          quiz: [
            ['Which codes are commonly retryable?', 'UNAVAILABLE, and sometimes RESOURCE_EXHAUSTED or DEADLINE_EXCEEDED for idempotent calls.'],
            ['Why is retrying INTERNAL risky?', 'The operation may have partially completed and is not known to be idempotent.'],
          ],
          prereqs: ['Status codes'],
        },
      ],
    },
    {
      title: 'Interceptors and Authentication',
      topics: [
        {
          title: 'Unary and stream interceptors',
          description: 'Middleware for gRPC: unary interceptors wrap a handler call, stream interceptors wrap the stream and can wrap ServerStream to observe messages; used for logging, auth, metrics and recovery.',
          concepts: ['UnaryServerInterceptor signature', 'StreamServerInterceptor and wrapped streams', 'Client-side interceptors', 'Recovery from panics', 'go-grpc-middleware helpers'],
          quiz: [
            ['What does a unary interceptor receive?', 'ctx, the request, UnaryServerInfo and the handler to call.'],
            ['How do you intercept messages on a stream?', 'Wrap grpc.ServerStream and override SendMsg and RecvMsg.'],
          ],
        },
        {
          title: 'Chaining interceptors',
          description: 'grpc.ChainUnaryInterceptor and ChainStreamInterceptor, execution order, and placing recovery first, then logging, auth, and metrics so failures are always observed.',
          concepts: ['ChainUnaryInterceptor', 'Order of execution', 'Recovery first', 'Per-method skipping'],
          quiz: [
            ['In ChainUnaryInterceptor(a, b), which runs first?', 'a, which calls b, which calls the handler.'],
            ['Why put recovery outermost?', 'So a panic in any later interceptor or the handler becomes an INTERNAL status instead of crashing.'],
          ],
          prereqs: ['Unary and stream interceptors'],
        },
        {
          title: 'TLS and mutual TLS',
          description: 'credentials.NewTLS for server certificates, client verification of the server, mutual TLS where clients present certificates, certificate rotation, and why insecure credentials are for local only.',
          concepts: ['Server TLS with credentials.NewTLS', 'Client verification and CA bundles', 'Mutual TLS setup', 'Certificate rotation', 'insecure.NewCredentials for local'],
          quiz: [
            ['What does mutual TLS add?', 'The server also verifies a client certificate, authenticating the caller.'],
            ['How does a client trust a private CA?', 'Load the CA certificate into the tls.Config RootCAs pool.'],
          ],
          prereqs: ['Unary and stream interceptors'],
        },
        {
          title: 'Token authentication with per-RPC credentials',
          description: 'Sending bearer tokens in metadata via credentials.PerRPCCredentials, requiring transport security for them, validating tokens in a server interceptor, and returning UNAUTHENTICATED.',
          concepts: ['PerRPCCredentials interface', 'RequireTransportSecurity', 'Validating tokens in an interceptor', 'UNAUTHENTICATED responses', 'OAuth and service account tokens'],
          quiz: [
            ['Which metadata key carries the bearer token?', 'authorization, with the value "Bearer <token>".'],
            ['Why should RequireTransportSecurity return true?', 'So tokens are never sent over plaintext connections.'],
          ],
          prereqs: ['TLS and mutual TLS'],
        },
        {
          title: 'Authorization in interceptors',
          description: 'Extracting the principal from a validated token or client certificate, per-method permission tables keyed by full method name, resource checks inside handlers, and PERMISSION_DENIED semantics.',
          concepts: ['Principal in context', 'Per-method permission tables', 'FullMethod from UnaryServerInfo', 'Resource-level checks in handlers', 'PERMISSION_DENIED usage'],
          quiz: [
            ['How does an interceptor know which RPC is being called?', 'info.FullMethod, such as /shop.v1.Orders/Cancel.'],
            ['Where must "can this caller cancel this order" be checked?', 'In the handler where the order is loaded.'],
          ],
          prereqs: ['Token authentication with per-RPC credentials'],
        },
      ],
    },
    {
      title: 'Connectivity, Load Balancing and Gateways',
      topics: [
        {
          title: 'Channels, connection states and keepalive',
          description: 'A ClientConn manages connections and reconnects, connectivity states from IDLE to READY to TRANSIENT_FAILURE, keepalive pings to detect dead peers, and server enforcement policies.',
          concepts: ['ClientConn lifecycle', 'Connectivity states', 'Keepalive parameters', 'Server enforcement policy', 'WaitForReady option'],
          quiz: [
            ['What does WaitForReady(true) change?', 'Calls block until the connection is READY instead of failing fast with UNAVAILABLE.'],
            ['Why can aggressive client keepalive get you disconnected?', 'The server enforcement policy rejects pings more frequent than it allows.'],
          ],
        },
        {
          title: 'Name resolution and client-side load balancing',
          description: 'Resolvers (dns, passthrough, xds) turn a target into addresses, pick_first versus round_robin balancers, why one long-lived connection defeats L4 balancing, and service config delivery.',
          concepts: ['Resolver schemes and targets', 'pick_first versus round_robin', 'Why L4 balancers pin traffic', 'Service config via resolver', 'xDS-based balancing'],
          quiz: [
            ['Why does a TCP load balancer balance gRPC poorly?', 'One long-lived HTTP/2 connection carries every RPC to a single backend.'],
            ['How do you enable round robin in Go?', 'grpc.WithDefaultServiceConfig with loadBalancingConfig round_robin and a resolver that returns multiple addresses.'],
          ],
          prereqs: ['Channels, connection states and keepalive'],
        },
        {
          title: 'Proxy load balancing and Kubernetes',
          description: 'L7 proxies (Envoy, Linkerd, nginx with grpc_pass) that balance per request, headless Services for client-side balancing in Kubernetes, and readiness so new pods receive traffic safely. Kubernetes itself lives in track-kubernetes.',
          concepts: ['Envoy and L7 gRPC balancing', 'Headless Services and DNS', 'Service mesh options', 'Readiness and connection draining'],
          quiz: [
            ['Why use a headless Service for gRPC?', 'Clients get every pod IP and can round-robin themselves.'],
            ['What does an L7 proxy do that an L4 one cannot?', 'Balance individual HTTP/2 streams across backends.'],
          ],
          prereqs: ['Name resolution and client-side load balancing'],
        },
        {
          title: 'gRPC-Web',
          description: 'A browser-compatible protocol variant with trailers in the body, requiring Envoy or the Go grpc-web wrapper, supporting unary and server streaming only, and generated TypeScript clients.',
          concepts: ['Why browsers need gRPC-Web', 'Envoy grpc_web filter or Go wrapper', 'Supported RPC types', 'TypeScript client generation', 'Connect as an alternative'],
          quiz: [
            ['Which streaming modes does gRPC-Web support?', 'Unary and server streaming only.'],
            ['What does the Connect protocol offer over gRPC-Web?', 'Plain HTTP semantics usable with curl and browsers without a proxy.'],
          ],
        },
        {
          title: 'grpc-gateway and REST transcoding',
          description: 'Annotating RPCs with google.api.http options so grpc-gateway generates a JSON reverse proxy, mapping paths and bodies, producing OpenAPI, and error translation from status codes to HTTP.',
          concepts: ['google.api.http annotations', 'Generated reverse proxy', 'Path and body mapping', 'OpenAPI generation', 'Status to HTTP mapping'],
          quiz: [
            ['What HTTP status does NOT_FOUND become in grpc-gateway?', '404.'],
            ['How do you expose CreateOrder as POST /v1/orders?', 'option (google.api.http) = { post: "/v1/orders" body: "*" }.'],
          ],
          prereqs: ['gRPC-Web'],
        },
      ],
    },
    {
      title: 'Observability, Testing and Performance',
      topics: [
        {
          title: 'Logging and metrics',
          description: 'Logging interceptors that record method, code and duration, Prometheus metrics via go-grpc-prometheus or OpenTelemetry, and the RED metrics per method. Observability tooling lives in track-observability.',
          concepts: ['Logging interceptor fields', 'Metrics per full method', 'Status code histograms', 'Stream message counters'],
          quiz: [
            ['Which three labels matter most on gRPC metrics?', 'Service, method and status code.'],
            ['Why log the status code rather than just errors?', 'Codes like NOT_FOUND are expected; code distributions show behaviour changes.'],
          ],
        },
        {
          title: 'Tracing with OpenTelemetry',
          description: 'otelgrpc stats handlers on client and server, trace context propagated in metadata, spans per RPC and per stream message, and exporting via OTLP.',
          concepts: ['otelgrpc stats handler', 'Context propagation in metadata', 'Spans per RPC', 'Exporting via OTLP'],
          quiz: [
            ['How does trace context travel between gRPC services?', 'As metadata entries injected and extracted by the otelgrpc handlers.'],
            ['Which option installs the server handler?', 'grpc.StatsHandler(otelgrpc.NewServerHandler()).'],
          ],
          prereqs: ['Logging and metrics'],
        },
        {
          title: 'Health checking and reflection',
          description: 'The standard grpc.health.v1 service for per-service status, wiring it to Kubernetes probes via grpc_health_probe or native gRPC probes, and server reflection for grpcurl and debugging.',
          concepts: ['grpc.health.v1 service', 'Setting per-service status', 'Kubernetes gRPC probes', 'Server reflection', 'Disabling reflection in production'],
          quiz: [
            ['What does the Health Check protocol return for an unknown service?', 'NOT_FOUND status.'],
            ['Why enable reflection?', 'Tools like grpcurl can discover services without the proto files.'],
          ],
        },
        {
          title: 'Testing with bufconn',
          description: 'Running a real gRPC server on an in-memory bufconn listener, dialing it from tests, table-driven RPC tests, and asserting status codes with status.Code.',
          concepts: ['bufconn listener setup', 'Dialing with a custom dialer', 'Table-driven RPC tests', 'Asserting status codes', 'Test lifecycle and cleanup'],
          quiz: [
            ['Why use bufconn instead of a TCP port?', 'No port conflicts, faster, and the full server stack still runs.'],
            ['How do you check an error is NOT_FOUND?', 'status.Code(err) == codes.NotFound.'],
          ],
        },
        {
          title: 'Testing streaming and mocks',
          description: 'Driving streaming RPCs in tests with goroutines and channels, generated mocks for client interfaces with mockgen, and fakes for downstream services.',
          concepts: ['Testing server streams', 'Testing bidi streams', 'mockgen for client interfaces', 'Fakes for downstream services'],
          quiz: [
            ['How do you test a server stream?', 'Call the RPC, Recv in a loop until io.EOF and assert the collected messages.'],
            ['Why mock the generated client interface?', 'Services that call downstream gRPC can be tested without a live server.'],
          ],
          prereqs: ['Testing with bufconn'],
        },
        {
          title: 'Performance tuning',
          description: 'Message size limits, compression with gzip, connection reuse and pooling, keepalive settings, streaming instead of large unary calls, and benchmarking with ghz.',
          concepts: ['MaxRecvMsgSize and MaxSendMsgSize', 'Compression and its cost', 'Connection reuse and channel pooling', 'Streaming for large payloads', 'Benchmarking with ghz'],
          quiz: [
            ['What is the default maximum receive message size?', '4 MB.'],
            ['When does compression hurt?', 'Small or already-compressed messages, where CPU cost outweighs savings.'],
          ],
          prereqs: ['Logging and metrics'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: inventory service with buf and bufconn tests',
          description: 'Build an inventory service: versioned protos linted with buf, unary CRUD RPCs with rich validation errors, deadlines, a logging interceptor, health checks, reflection and bufconn tests in CI with buf breaking.',
          concepts: ['Proto design and buf setup', 'CRUD RPCs and validation details', 'Interceptors and health', 'bufconn test suite', 'CI gate on breaking changes'],
          quiz: [
            ['Which error detail carries field problems?', 'BadRequest with FieldViolations.'],
            ['What should happen when a proto change breaks compatibility?', 'buf breaking fails the CI job.'],
          ],
        },
        {
          title: 'Project: log streaming with server and client streams',
          description: 'A log service where agents upload batches via client streaming and dashboards tail logs via server streaming with filters, handling backpressure, cancellation and reconnect.',
          concepts: ['Client stream ingestion', 'Server stream tailing with filters', 'Backpressure handling', 'Cancellation and reconnect', 'Metrics for stream health'],
          quiz: [
            ['How does the server learn a tailing client went away?', 'ctx.Done() fires and Send returns an error.'],
            ['What limits memory when a consumer is slow?', 'HTTP/2 flow control blocks Send until the client reads.'],
          ],
        },
        {
          title: 'Project: chat with bidirectional streaming and auth',
          description: 'A chat backend with bidi streams, mTLS between services, bearer tokens for users, per-room fan-out with goroutines, and a gRPC-Web or Connect front end.',
          concepts: ['Bidi stream protocol design', 'Token and mTLS auth', 'Room fan-out and goroutine safety', 'Browser access via gRPC-Web or Connect', 'Streaming tests'],
          quiz: [
            ['Why is a mutex needed around Send in fan-out?', 'Only one goroutine may call Send on a stream at a time.'],
            ['Why does the browser need gRPC-Web or Connect?', 'Browsers cannot speak native gRPC framing and trailers.'],
          ],
        },
        {
          title: 'Project: orders API exposed via grpc-gateway',
          description: 'An orders service with google.api.http annotations, a generated JSON gateway, OpenAPI output, consistent status-to-HTTP mapping, OpenTelemetry tracing across gateway and service, and load tests with ghz.',
          concepts: ['HTTP annotations on RPCs', 'Gateway and OpenAPI generation', 'Error mapping to HTTP', 'Tracing across gateway and service', 'ghz benchmarks'],
          quiz: [
            ['Where does the JSON body map to in a POST annotation?', 'The field named in body, or "*" for the whole request message.'],
            ['Which HTTP status does INVALID_ARGUMENT become?', '400.'],
          ],
        },
        {
          title: 'gRPC interview questions',
          description: 'What interviewers ask: gRPC versus REST, why HTTP/2, protobuf compatibility rules, streaming types, deadlines, status codes, load balancing pitfalls and browser support.',
          concepts: ['Fundamentals and transport questions', 'Protobuf evolution questions', 'Streaming and deadline questions', 'Load balancing questions'],
          quiz: [
            ['Explain why field numbers must never be reused.', 'Old data or peers encode by number; reuse silently misinterprets values.'],
            ['Why does gRPC need L7 load balancing?', 'One HTTP/2 connection carries many RPCs, so L4 balancers pin all of them to one backend.'],
          ],
          style: 'reading',
        },
        {
          title: 'gRPC API design exercises',
          description: 'Design the protos and RPCs for a payments service or a notification system: message evolution, streaming choices, error details, deadlines, auth and gateway exposure.',
          concepts: ['Structuring a proto design answer', 'Choosing RPC types', 'Error and deadline strategy', 'Auth and gateway decisions'],
          quiz: [
            ['When would you choose server streaming over pagination?', 'Long or unbounded result sets consumed incrementally, such as tailing events.'],
            ['What should every request message include from day one?', 'Nothing mandatory, but reserve room to add fields; avoid bare scalars as RPC inputs.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
