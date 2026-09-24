import { defineTrack } from '../define'

export const springSecurity = defineTrack({
  id: 'track-spring-security',
  title: 'Spring Security',
  description: 'Spring Security 6 explained from the servlet filter chain outward: authentication providers and UserDetailsService, password hashing, form and basic login, roles and method security, CSRF and CORS, sessions, JWT resource servers, OAuth2 login and clients, testing, and the misconfigurations that ship to production.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🔐',
  tags: ['spring security', 'spring', 'java', 'authentication', 'authorization', 'jwt', 'oauth2', 'oidc'],
  languages: ['Java'],
  explainMode: 'concept',
  code: { label: 'Java with Spring Boot', id: 'java', fixed: true },
  supports: { coding: true, labs: true, project: true },
  prerequisites: ['track-spring-boot'],
  style: 'code',
  categories: [
    {
      title: 'The Filter Chain',
      description: 'Every request passes through the same chain; understanding it explains every 401, 403 and redirect.',
      topics: [
        {
          title: 'DelegatingFilterProxy and FilterChainProxy',
          description: 'How Spring Security hooks into the servlet container with one registered filter that delegates to a bean, then to the first SecurityFilterChain whose matcher accepts the request.',
          concepts: ['Servlet filters versus Spring beans', 'DelegatingFilterProxy bridge', 'FilterChainProxy selection', 'Multiple SecurityFilterChain beans'],
          quiz: [
            ['Why is DelegatingFilterProxy needed?', 'The servlet container knows nothing about Spring beans, so it delegates to one by name.'],
            ['How is the chain chosen when several are defined?', 'By @Order; the first chain whose securityMatcher matches the request is used.'],
          ],
        },
        {
          title: 'The default filters in order',
          description: 'What SecurityContextHolderFilter, CsrfFilter, LogoutFilter, the authentication filters, ExceptionTranslationFilter and AuthorizationFilter each do, and why their order is fixed.',
          concepts: ['Filter order and responsibilities', 'ExceptionTranslationFilter', 'AuthorizationFilter at the end', 'Printing the active chain'],
          quiz: [
            ['Which filter turns AccessDeniedException into a 401 or 403?', 'ExceptionTranslationFilter.'],
            ['How can you list the filters in effect?', 'Set logging for org.springframework.security to DEBUG or TRACE at startup.'],
          ],
          prereqs: ['DelegatingFilterProxy and FilterChainProxy'],
        },
        {
          title: 'SecurityContext and SecurityContextHolder',
          description: 'Where the current Authentication lives, the ThreadLocal strategy and why it breaks across threads, reading the principal in controllers with @AuthenticationPrincipal, and propagation to @Async work.',
          concepts: ['Authentication object anatomy', 'ThreadLocal holder strategy', '@AuthenticationPrincipal and Principal injection', 'Propagation to child threads'],
          quiz: [
            ['What are the three parts of an Authentication?', 'Principal, credentials and granted authorities.'],
            ['Why is the context empty inside an @Async method?', 'The ThreadLocal is not copied unless a DelegatingSecurityContext executor is used.'],
          ],
          prereqs: ['The default filters in order'],
        },
        {
          title: 'Configuring a SecurityFilterChain',
          description: 'The HttpSecurity lambda DSL: securityMatcher for scope, authorizeHttpRequests for rules, enabling login mechanisms, and why the bean replaces the removed WebSecurityConfigurerAdapter.',
          concepts: ['HttpSecurity lambda DSL', 'securityMatcher scoping', 'Rule ordering and anyRequest', 'WebSecurityCustomizer for static resources'],
          quiz: [
            ['What replaced WebSecurityConfigurerAdapter?', 'A SecurityFilterChain @Bean.'],
            ['What is wrong with anyRequest().permitAll() before requestMatchers("/admin")?', 'The first match wins, so /admin is open.'],
          ],
          prereqs: ['The default filters in order'],
        },
        {
          title: 'Writing a custom filter',
          description: 'Extending OncePerRequestFilter, inserting it with addFilterBefore or addFilterAfter relative to a known filter, and avoiding the double-registration that happens when a filter is also a @Component.',
          concepts: ['OncePerRequestFilter', 'addFilterBefore and addFilterAfter', 'Avoiding container double registration', 'Setting the SecurityContext from a filter'],
          quiz: [
            ['Why does a @Component filter run twice?', 'Boot registers it with the servlet container and the security chain adds it again.'],
            ['How do you stop Boot registering a filter bean globally?', 'Expose a FilterRegistrationBean with setEnabled(false).'],
          ],
          prereqs: ['Configuring a SecurityFilterChain'],
        },
      ],
    },
    {
      title: 'Authentication',
      description: 'Proving who the caller is.',
      topics: [
        {
          title: 'AuthenticationManager and ProviderManager',
          description: 'The interface that verifies credentials, the ProviderManager that tries each AuthenticationProvider in turn, and how the result is stored as an authenticated Authentication.',
          concepts: ['AuthenticationManager contract', 'ProviderManager iteration', 'AuthenticationProvider supports()', 'Parent managers and fallbacks'],
          quiz: [
            ['What happens if no provider supports the token type?', 'ProviderException; the request is rejected.'],
            ['When does ProviderManager stop trying providers?', 'On the first non-null result or an AuthenticationException.'],
          ],
        },
        {
          title: 'UserDetailsService and DaoAuthenticationProvider',
          description: 'Loading a user by username from your database, returning UserDetails with password hash and authorities, and how DaoAuthenticationProvider compares the submitted password with the encoder.',
          concepts: ['Implementing UserDetailsService', 'UserDetails and account flags', 'DaoAuthenticationProvider flow', 'InMemoryUserDetailsManager for demos'],
          quiz: [
            ['What does UserDetailsService return for an unknown user?', 'It throws UsernameNotFoundException.'],
            ['What do the account flags on UserDetails control?', 'Locked, expired, disabled and credentials-expired checks before the password check.'],
          ],
          prereqs: ['AuthenticationManager and ProviderManager'],
        },
        {
          title: 'Password hashing and PasswordEncoder',
          description: 'BCrypt, Argon2 and SCrypt as slow salted hashes, the DelegatingPasswordEncoder id prefix that lets you migrate algorithms, and upgrading hashes on successful login.',
          concepts: ['Why slow hashes resist brute force', 'DelegatingPasswordEncoder id prefixes', 'BCrypt cost factor', 'Argon2 and SCrypt parameters', 'Upgrading hashes on login'],
          quiz: [
            ['What does {bcrypt} at the start of a stored hash mean?', 'DelegatingPasswordEncoder uses the bcrypt encoder for that value.'],
            ['What does upgradeEncoding do?', 'Signals the stored hash should be re-encoded with the current algorithm.'],
          ],
          prereqs: ['UserDetailsService and DaoAuthenticationProvider'],
        },
        {
          title: 'Form login',
          description: 'UsernamePasswordAuthenticationFilter, the generated login page and a custom one, success and failure handlers, saved requests and redirects, and logout with session invalidation.',
          concepts: ['formLogin configuration', 'Custom login page', 'Success and failure handlers', 'Logout handling'],
          quiz: [
            ['Where does a user go after a successful login?', 'The originally requested URL, or the default success URL.'],
            ['What does logout do by default?', 'Invalidates the session, clears the context and deletes the JSESSIONID cookie.'],
          ],
          prereqs: ['UserDetailsService and DaoAuthenticationProvider'],
        },
        {
          title: 'HTTP Basic and API keys',
          description: 'BasicAuthenticationFilter decoding the Authorization header, why Basic is only acceptable over TLS, and implementing API-key authentication with a custom filter and provider.',
          concepts: ['httpBasic and the WWW-Authenticate challenge', 'Basic only over TLS', 'API key filter and provider', 'Entry points for API clients'],
          quiz: [
            ['What does the Authorization header contain for Basic?', 'Base64 of username:password, not encrypted.'],
            ['Why return 401 instead of redirecting for API clients?', 'A JSON client cannot follow a login page.'],
          ],
          prereqs: ['AuthenticationManager and ProviderManager'],
        },
        {
          title: 'Custom authentication providers and events',
          description: 'Writing an AuthenticationProvider for LDAP-like or one-time-code schemes, publishing AuthenticationSuccessEvent and failure events, and lockout counters built from them.',
          concepts: ['Custom AuthenticationProvider', 'Authentication events', 'Account lockout from failures', 'LDAP authentication option'],
          quiz: [
            ['Which event fires on a bad password?', 'AuthenticationFailureBadCredentialsEvent.'],
            ['How do events reach your code?', 'An @EventListener method on any bean.'],
          ],
          prereqs: ['AuthenticationManager and ProviderManager'],
        },
        {
          title: 'Remember-me and persistent logins',
          description: 'Hash-based versus persistent-token remember-me, the cookie and its risks, and why a remembered login is treated as weaker than a fresh one for sensitive actions.',
          concepts: ['Hash-based remember-me', 'PersistentTokenRepository', 'Remembered versus fully authenticated', 'Cookie security attributes'],
          quiz: [
            ['What does fullyAuthenticated() require?', 'A login in this session, not a remember-me cookie.'],
            ['Why prefer the persistent-token approach?', 'Tokens can be revoked server-side and rotated per use.'],
          ],
          prereqs: ['Form login'],
        },
      ],
    },
    {
      title: 'Authorization',
      description: 'Deciding what an authenticated caller may do.',
      topics: [
        {
          title: 'Roles, authorities and GrantedAuthority',
          description: 'Authorities as plain strings, the ROLE_ prefix convention behind hasRole, storing authorities per user or via groups, and why fine-grained permissions age better than roles alone.',
          concepts: ['GrantedAuthority strings', 'ROLE_ prefix convention', 'Permissions versus roles', 'Loading authorities from the database'],
          quiz: [
            ['Are hasRole("ADMIN") and hasAuthority("ROLE_ADMIN") equivalent?', 'Yes.'],
            ['Why avoid checking roles in business code?', 'Roles change; check a permission the role grants instead.'],
          ],
        },
        {
          title: 'URL authorization with authorizeHttpRequests',
          description: 'requestMatchers for paths and methods, permitAll, authenticated, hasRole and access with a custom AuthorizationManager, and how matchers interact with servlet path handling and MVC patterns.',
          concepts: ['requestMatchers by path and method', 'Built-in access rules', 'Custom AuthorizationManager', 'Matcher pitfalls with multiple servlets'],
          quiz: [
            ['What does denyAll() protect against?', 'Forgotten endpoints; nothing unlisted is reachable.'],
            ['Why can requestMatchers("/api/**") fail at startup in a mixed app?', 'With several servlets, ambiguous patterns must be built with PathPatternRequestMatcher or MvcRequestMatcher explicitly.'],
          ],
          prereqs: ['Roles, authorities and GrantedAuthority'],
        },
        {
          title: 'Method security with @PreAuthorize',
          description: '@EnableMethodSecurity, expressions that see method arguments and the return value, @PostAuthorize, @PreFilter and @PostFilter, and where the proxy boundary hides checks.',
          concepts: ['@EnableMethodSecurity', 'SpEL with method arguments', '@PostAuthorize on return values', '@PreFilter and @PostFilter', 'Proxy boundary and self-invocation'],
          quiz: [
            ['How do you reference a method argument in @PreAuthorize?', 'By name, for example #orderId, when parameter names are compiled in.'],
            ['Does @PreAuthorize work on a private method?', 'No, only on calls that pass through the proxy.'],
          ],
          prereqs: ['Roles, authorities and GrantedAuthority'],
        },
        {
          title: 'Custom permission evaluators and domain checks',
          description: 'hasPermission with a PermissionEvaluator that consults ownership, calling a bean from SpEL with @beanName.check(...), and keeping authorization logic testable.',
          concepts: ['PermissionEvaluator', 'Calling beans from SpEL', 'Ownership checks', 'Testable authorization services'],
          quiz: [
            ['What does hasPermission(#id, "Order", "read") call?', 'PermissionEvaluator.hasPermission(auth, id, "Order", "read").'],
            ['Why move checks into a bean method?', 'It can be unit-tested and reused outside SpEL.'],
          ],
          prereqs: ['Method security with @PreAuthorize'],
        },
        {
          title: 'Role hierarchies',
          description: 'Declaring that ADMIN implies USER with a RoleHierarchy bean so rules stay short, and how the hierarchy is applied in both URL and method security.',
          concepts: ['RoleHierarchy bean', 'Hierarchy in URL rules', 'Hierarchy in method security', 'When hierarchies mislead'],
          quiz: [
            ['What does ROLE_ADMIN > ROLE_USER declare?', 'Every admin also has the user role.'],
            ['Is the hierarchy applied automatically to @PreAuthorize?', 'Yes when the RoleHierarchy bean is present in Spring Security 6.'],
          ],
          prereqs: ['Roles, authorities and GrantedAuthority'],
        },
        {
          title: 'Access denied and entry points',
          description: 'AuthenticationEntryPoint for unauthenticated callers, AccessDeniedHandler for denied ones, and returning JSON error bodies instead of redirects for APIs.',
          concepts: ['AuthenticationEntryPoint', 'AccessDeniedHandler', 'JSON error responses', 'Per-chain handlers'],
          quiz: [
            ['Which handler runs for an anonymous user hitting a protected URL?', 'The AuthenticationEntryPoint, producing a 401 or redirect.'],
            ['Which runs for a logged-in user without the role?', 'The AccessDeniedHandler, producing a 403.'],
          ],
          prereqs: ['URL authorization with authorizeHttpRequests'],
        },
      ],
    },
    {
      title: 'CSRF, CORS and Sessions',
      description: 'Browser-specific threats and the state behind a login.',
      topics: [
        {
          title: 'CSRF protection',
          description: 'Why a browser sends cookies with cross-site requests, how the synchronizer token pattern stops it, the deferred token loading in Security 6 and when a stateless API can disable it.',
          concepts: ['Cross-site request forgery mechanics', 'Synchronizer token pattern', 'Deferred CSRF tokens in Security 6', 'When disabling CSRF is safe'],
          quiz: [
            ['Which requests does CsrfFilter check?', 'State-changing methods: POST, PUT, PATCH and DELETE.'],
            ['Is CSRF a risk for a bearer-token API with no cookies?', 'No, the browser does not attach the token automatically.'],
          ],
        },
        {
          title: 'CSRF tokens for single-page apps',
          description: 'CookieCsrfTokenRepository with a readable XSRF-TOKEN cookie, the X-XSRF-TOKEN header convention, and the XorCsrfTokenRequestAttributeHandler that defends against BREACH.',
          concepts: ['CookieCsrfTokenRepository', 'XSRF-TOKEN cookie and header', 'BREACH and token masking', 'Forcing token generation on GET'],
          quiz: [
            ['Why must the CSRF cookie not be HttpOnly?', 'JavaScript has to read it to send the header.'],
            ['What does XorCsrfTokenRequestAttributeHandler do?', 'Masks the token per request so compression attacks cannot recover it.'],
          ],
          prereqs: ['CSRF protection'],
        },
        {
          title: 'CORS with Spring Security',
          description: 'Preflight requests hitting the filter chain before controllers, a CorsConfigurationSource bean the CorsFilter uses, allowed origins versus patterns, and credentials rules.',
          concepts: ['Preflight and the filter chain', 'CorsConfigurationSource bean', 'allowCredentials constraints', 'Origin patterns'],
          quiz: [
            ['Why does @CrossOrigin fail when security is on?', 'The preflight is rejected by the filter chain before reaching the controller.'],
            ['Can allowedOrigins be * with credentials?', 'No, the browser refuses; use allowedOriginPatterns or explicit origins.'],
          ],
          prereqs: ['CSRF protection'],
        },
        {
          title: 'Session management and fixation',
          description: 'SessionCreationPolicy options, session fixation protection by changing the id on login, concurrent session limits, and invalidating sessions on logout.',
          concepts: ['SessionCreationPolicy', 'Session fixation protection', 'Concurrent session control', 'HttpSessionEventPublisher'],
          quiz: [
            ['What does session fixation protection do by default?', 'Changes the session id on authentication.'],
            ['What is needed for maximumSessions to work?', 'An HttpSessionEventPublisher bean so expired sessions are tracked.'],
          ],
          prereqs: ['CSRF protection'],
        },
        {
          title: 'Distributed sessions with Spring Session',
          description: 'Storing sessions in Redis or JDBC so any instance can serve a logged-in user, cookie configuration, and the trade-off against stateless tokens.',
          concepts: ['Spring Session with Redis', 'Session cookie attributes', 'Sticky sessions versus shared store', 'Stateless versus stateful choice'],
          quiz: [
            ['What does Spring Session replace?', 'The servlet container HttpSession with a store-backed one.'],
            ['Why set SameSite on the session cookie?', 'It limits cross-site sending and adds CSRF defence in depth.'],
          ],
          prereqs: ['Session management and fixation'],
        },
        {
          title: 'Security headers',
          description: 'The headers Spring adds by default: Cache-Control, X-Content-Type-Options, HSTS, X-Frame-Options; configuring a Content-Security-Policy and when to relax frame options.',
          concepts: ['Default header set', 'HSTS configuration', 'Content-Security-Policy', 'Frame options and clickjacking'],
          quiz: [
            ['What does X-Frame-Options: DENY prevent?', 'Clickjacking by embedding the page in a frame.'],
            ['Does Spring send HSTS over plain HTTP?', 'No, only on secure requests.'],
          ],
        },
      ],
    },
    {
      title: 'JWT and Resource Servers',
      description: 'Token-based security for APIs.',
      topics: [
        {
          title: 'JWT structure and signature verification',
          description: 'Header, claims and signature, HS256 versus RS256 and ES256, the exp, iss and aud claims that must be checked, and why the alg header must never be trusted.',
          concepts: ['Header, payload and signature', 'Symmetric versus asymmetric signing', 'Registered claims to validate', 'alg none and key confusion attacks'],
          quiz: [
            ['Which claims should a resource server always validate?', 'Signature, exp, iss and aud (or a matching audience validator).'],
            ['Why is RS256 preferred across services?', 'Services need only the public key, so no shared secret is distributed.'],
          ],
        },
        {
          title: 'Configuring a JWT resource server',
          description: 'oauth2ResourceServer().jwt() with an issuer-uri or jwk-set-uri, how NimbusJwtDecoder fetches and caches keys, and validating audience with a custom OAuth2TokenValidator.',
          concepts: ['issuer-uri and JWKS discovery', 'NimbusJwtDecoder', 'Custom OAuth2TokenValidator', 'Clock skew tolerance'],
          quiz: [
            ['What does spring.security.oauth2.resourceserver.jwt.issuer-uri trigger at startup?', 'Discovery of the JWKS endpoint from the issuer metadata.'],
            ['How do you reject tokens for another audience?', 'Add a JwtClaimValidator on aud to the decoder.'],
          ],
          prereqs: ['JWT structure and signature verification'],
        },
        {
          title: 'Mapping claims to authorities',
          description: 'JwtAuthenticationConverter and JwtGrantedAuthoritiesConverter, reading scope versus roles claims, the SCOPE_ prefix, and building a custom principal object from claims.',
          concepts: ['JwtAuthenticationConverter', 'scope versus custom roles claims', 'SCOPE_ prefix handling', 'Custom principal from claims'],
          quiz: [
            ['What authority does scope "read" become by default?', 'SCOPE_read.'],
            ['How do you use a "roles" array claim instead?', 'Configure JwtGrantedAuthoritiesConverter with that claim name and prefix.'],
          ],
          prereqs: ['Configuring a JWT resource server'],
        },
        {
          title: 'Issuing tokens yourself',
          description: 'Signing JWTs with Nimbus or JwtEncoder for a first-party API, short-lived access tokens with refresh tokens, key rotation with kid, and why an authorization server is the better long-term answer.',
          concepts: ['JwtEncoder and signing keys', 'Access and refresh token lifetimes', 'Key rotation with kid', 'Revocation strategies'],
          quiz: [
            ['Why keep access tokens short-lived?', 'A stolen token expires quickly; refresh tokens can be revoked.'],
            ['How does a verifier pick the right key after rotation?', 'By the kid header matched against the JWKS.'],
          ],
          prereqs: ['Configuring a JWT resource server'],
        },
        {
          title: 'Opaque tokens and introspection',
          description: 'When tokens are references rather than self-contained, calling the introspection endpoint per request, caching results, and comparing latency and revocation trade-offs against JWTs.',
          concepts: ['Opaque token introspection', 'Introspection caching', 'Revocation versus self-containment', 'Choosing opaque or JWT'],
          quiz: [
            ['What does introspection return?', 'Whether the token is active plus its claims.'],
            ['Main cost of opaque tokens?', 'A network call to the authorization server per request.'],
          ],
          prereqs: ['Configuring a JWT resource server'],
        },
      ],
    },
    {
      title: 'OAuth2 Client and Login',
      description: 'Delegating login and calling third-party APIs on behalf of users.',
      topics: [
        {
          title: 'OAuth2 roles and the authorization code flow',
          description: 'Resource owner, client, authorization server and resource server; the redirect-based authorization code flow with PKCE, and why implicit and password grants are gone.',
          concepts: ['The four OAuth2 roles', 'Authorization code flow steps', 'PKCE', 'Deprecated grants'],
          quiz: [
            ['What does PKCE protect against?', 'Authorization code interception by a malicious app.'],
            ['Which grant should a browser SPA use?', 'Authorization code with PKCE.'],
          ],
        },
        {
          title: 'OpenID Connect login with oauth2Login',
          description: 'ID tokens on top of OAuth2, the built-in provider registrations, scopes and the userinfo endpoint, and the OidcUser principal you receive after login.',
          concepts: ['OIDC ID token', 'Provider registrations', 'Scopes and userinfo', 'OidcUser principal'],
          quiz: [
            ['What does an ID token prove?', 'Who the user is; the access token is for calling APIs.'],
            ['Which built-in providers need only client id and secret?', 'Google, GitHub, Facebook and Okta.'],
          ],
          prereqs: ['OAuth2 roles and the authorization code flow'],
        },
        {
          title: 'Mapping external identities to local users',
          description: 'An OAuth2UserService or OidcUserService that finds or creates a local account, assigns authorities from your database, and links several providers to one user.',
          concepts: ['Custom OidcUserService', 'Find-or-create local account', 'Authorities from local roles', 'Linking providers by verified email'],
          quiz: [
            ['Where do you hook to create a local user on first login?', 'A custom OAuth2UserService or OidcUserService bean.'],
            ['Why link accounts only on a verified email?', 'Unverified emails let an attacker claim another user\'s account.'],
          ],
          prereqs: ['OpenID Connect login with oauth2Login'],
        },
        {
          title: 'Calling APIs as an OAuth2 client',
          description: 'oauth2Client with OAuth2AuthorizedClientManager to obtain and refresh access tokens, client credentials for service-to-service calls, and attaching tokens to RestClient or WebClient.',
          concepts: ['OAuth2AuthorizedClientManager', 'Client credentials grant', 'Token refresh handling', 'Attaching tokens to HTTP clients'],
          quiz: [
            ['Which grant suits a nightly job with no user?', 'Client credentials.'],
            ['Who refreshes an expired access token?', 'The OAuth2AuthorizedClientManager using the stored refresh token.'],
          ],
          prereqs: ['OAuth2 roles and the authorization code flow'],
        },
        {
          title: 'Spring Authorization Server',
          description: 'Running your own issuer: registered clients, token settings, the consent page, JWK source, and when a hosted identity provider is the wiser choice.',
          concepts: ['RegisteredClient configuration', 'Token and client settings', 'JWKSource and key publication', 'Build versus hosted provider'],
          quiz: [
            ['What endpoints does Spring Authorization Server expose?', 'Authorization, token, JWKS, introspection, revocation and OIDC discovery.'],
            ['When should you not run your own?', 'When you lack the capacity to operate, patch and audit an identity system.'],
          ],
          prereqs: ['Calling APIs as an OAuth2 client'],
        },
      ],
    },
    {
      title: 'Testing Security',
      description: 'Proving the rules do what you think.',
      topics: [
        {
          title: '@WithMockUser and @WithUserDetails',
          description: 'Populating the SecurityContext for a test method with a fake user or one loaded through your UserDetailsService, and testing method security without HTTP.',
          concepts: ['@WithMockUser roles and authorities', '@WithUserDetails', 'Custom @WithSecurityContext factories', 'Method security in unit tests'],
          quiz: [
            ['Does @WithMockUser call your UserDetailsService?', 'No, it builds a fake user directly; @WithUserDetails does.'],
            ['Which annotation enables security in a @WebMvcTest?', 'Spring Security is auto-configured; add @Import of your security config if it is not scanned.'],
          ],
        },
        {
          title: 'MockMvc security post-processors',
          description: 'user(), jwt(), oauth2Login() and csrf() from SecurityMockMvcRequestPostProcessors to shape each request, and asserting redirects, 401s and 403s precisely.',
          concepts: ['with(user()) and with(jwt())', 'oauth2Login() post-processor', 'Sending CSRF tokens in tests', 'Asserting status and redirects'],
          quiz: [
            ['Why does a POST in a test return 403 with a logged-in user?', 'The CSRF token is missing; add with(csrf()).'],
            ['How do you test a JWT with custom authorities?', 'with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_read"))).'],
          ],
          prereqs: ['@WithMockUser and @WithUserDetails'],
        },
        {
          title: 'Integration tests against a real issuer',
          description: 'Running Keycloak or a mock OIDC server in Testcontainers, obtaining real tokens in tests, and verifying JWKS discovery and audience validation end to end.',
          concepts: ['Keycloak in Testcontainers', 'Fetching tokens in tests', 'Overriding issuer-uri per test', 'Testing expired and tampered tokens'],
          quiz: [
            ['Why test with a real issuer at least once?', 'Discovery, key fetching and claim mapping are only exercised with real tokens.'],
            ['How do you point the resource server at the container?', '@DynamicPropertySource setting the issuer-uri to the container URL.'],
          ],
          prereqs: ['MockMvc security post-processors'],
        },
        {
          title: 'Security regression tests',
          description: 'A test per rule that asserts anonymous, wrong-role and right-role outcomes, parameterised over endpoints, so a rule reordering fails the build rather than a pentest.',
          concepts: ['Three-outcome test pattern', 'Parameterised endpoint matrix', 'Catching rule reordering', 'Testing denyAll coverage'],
          quiz: [
            ['What three cases does each protected endpoint need?', 'Anonymous gets 401, wrong role gets 403, right role succeeds.'],
            ['How do you catch a new endpoint that was never secured?', 'A default denyAll rule plus a test that hits every mapping.'],
          ],
          prereqs: ['MockMvc security post-processors'],
        },
      ],
    },
    {
      title: 'Common Misconfigurations',
      description: 'The mistakes that show up in audits, and how to spot them in review.',
      topics: [
        {
          title: 'Rule ordering and overly broad permitAll',
          description: 'anyRequest before specific rules, permitAll on /api/** for a health check, and pattern mismatches such as /admin versus /admin/ that open more than intended.',
          concepts: ['First-match rule evaluation', 'Over-broad wildcards', 'Trailing slash and case mismatches', 'Reviewing rules as a table'],
          quiz: [
            ['Why is permitAll on "/actuator/**" dangerous?', 'It exposes env, heapdump and other sensitive endpoints.'],
            ['What does a missing anyRequest rule mean in Security 6?', 'Unmatched requests are denied, which is safe but surprising.'],
          ],
        },
        {
          title: 'Disabling CSRF or CORS carelessly',
          description: 'csrf().disable() copied into a session-based app, allowedOriginPatterns("*") with credentials, and the difference between a secure API and one that merely works in the demo.',
          concepts: ['CSRF disabled with sessions', 'Wildcard origins with credentials', 'Copy-paste configuration risks', 'Deciding per chain'],
          quiz: [
            ['When is csrf().disable() acceptable?', 'For stateless endpoints that carry no browser-attached credentials.'],
            ['What is the risk of allowCredentials with a wildcard pattern?', 'Any site can make authenticated requests with the user\'s cookies.'],
          ],
          prereqs: ['Rule ordering and overly broad permitAll'],
        },
        {
          title: 'Weak secrets and token handling',
          description: 'Short HS256 keys, secrets in application.yml, long-lived tokens in localStorage, missing audience checks, and logging Authorization headers.',
          concepts: ['HS256 key length', 'Secrets outside the repository', 'Token storage in browsers', 'Audience and issuer checks', 'Redacting headers in logs'],
          quiz: [
            ['Minimum key size for HS256?', '256 bits.'],
            ['Why is a token accepted by two services a problem?', 'A token stolen from one can be replayed against the other without an audience check.'],
          ],
        },
        {
          title: 'Trusting the wrong source of truth',
          description: 'Authorization decided from client-supplied ids or roles, mass assignment of a role field, and object-level checks skipped because the URL was protected.',
          concepts: ['Client-controlled identifiers', 'Mass assignment of privileged fields', 'Object-level authorization', 'Server-side identity only'],
          quiz: [
            ['What is broken object-level authorization?', 'Accessing another user\'s resource by changing an id in the request.'],
            ['How do you prevent a user setting role=ADMIN in a signup body?', 'Bind to a DTO without the field and set roles server-side.'],
          ],
        },
        {
          title: 'Proxies, HTTPS and forwarded headers',
          description: 'requiresSecure loops behind a TLS-terminating proxy, trusting X-Forwarded-For from anyone, and secure cookie flags that never get set because the app thinks it is on HTTP.',
          concepts: ['Forwarded header strategy', 'Redirect loops behind proxies', 'Trusting X-Forwarded-For', 'Secure and SameSite cookie flags'],
          quiz: [
            ['Why does requiresSecure loop behind a load balancer?', 'The app sees HTTP and redirects to HTTPS, which the proxy again forwards as HTTP.'],
            ['Should X-Forwarded-For be trusted from any client?', 'No, only when set by your own proxy that strips client-supplied values.'],
          ],
        },
        {
          title: 'Security auditing and dependency hygiene',
          description: 'Reading the debug filter listing, a checklist for reviews, keeping Spring Security patched, and scanning dependencies for known CVEs in CI.',
          concepts: ['Startup security debug output', 'Review checklist', 'Patch cadence', 'Dependency vulnerability scanning'],
          quiz: [
            ['What does spring.security debug logging show at startup?', 'The filter chains and their filters in order.'],
            ['Which tool flags vulnerable dependencies in a Maven build?', 'OWASP Dependency-Check or a similar SCA scanner.'],
          ],
          prereqs: ['Rule ordering and overly broad permitAll'],
        },
      ],
    },
    {
      title: 'Projects',
      description: 'Security work that mirrors real product requirements.',
      style: 'project',
      topics: [
        {
          title: 'Project: username and password API with JWT',
          description: 'Registration with BCrypt, login issuing short-lived access and refresh tokens, refresh rotation with revocation, role-based endpoints, ProblemDetail errors and a full security test matrix.',
          concepts: ['Registration and hashing', 'Token issuing and rotation', 'Revocation store', 'Role-protected endpoints', 'Security test matrix'],
          quiz: [
            ['How do you detect a reused refresh token?', 'Each refresh rotates the token; reuse of an old one revokes the family.'],
            ['Where does the signing key live?', 'In an environment variable or secret store, never in the repository.'],
          ],
        },
        {
          title: 'Project: social login with account linking',
          description: 'oauth2Login with Google and GitHub, a local user table, linking providers by verified email, an admin role assigned from the database and a profile page that shows linked identities.',
          concepts: ['Configure two providers', 'Local user creation', 'Provider linking rules', 'Database-driven authorities', 'Profile and unlink flow'],
          quiz: [
            ['What must happen before linking a second provider?', 'The user is already logged in, or the provider email is verified and matches.'],
            ['Where are authorities assigned?', 'In the custom user service from the local roles table.'],
          ],
        },
        {
          title: 'Project: multi-tenant resource server',
          description: 'A resource server accepting JWTs from two issuers with tenant claims, tenant-scoped authorization on every query, per-tenant rate limits and tests using Keycloak in Testcontainers.',
          concepts: ['Multi-issuer JwtDecoder', 'Tenant claim extraction', 'Tenant-scoped queries', 'Per-tenant limits', 'Container-backed tests'],
          quiz: [
            ['How do you pick the decoder per token?', 'A JwtIssuerAuthenticationManagerResolver keyed by issuer.'],
            ['What stops tenant A reading tenant B data?', 'Every repository query filters by the tenant from the token, never from the request.'],
          ],
        },
      ],
    },
  ],
})
