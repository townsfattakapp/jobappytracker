import { defineTrack } from '../define'

export const webSecurity = defineTrack({
  id: 'track-web-security',
  title: 'Web Security',
  description: 'Defensive web application security for frontend, backend and security learners: the browser security model, the OWASP Top 10, XSS, CSRF, authentication and sessions, authorisation, TLS and headers, input handling, supply chain, secrets, security testing on authorised lab targets, monitoring and a secure development lifecycle.',
  family: 'Frontend & Web',
  kind: 'domain',
  icon: '🛡️',
  tags: ['security', 'owasp', 'xss', 'csrf', 'authentication', 'csp', 'appsec', 'web'],
  languages: ['JavaScript', 'TypeScript'],
  explainMode: 'security',
  code: { label: 'JavaScript/TypeScript with HTTP examples', id: 'javascript', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-js'],
  style: 'practice',
  categories: [
    {
      title: 'The Browser Security Model',
      description: 'The rules browsers enforce, which every web attack either respects or tries to bypass.',
      topics: [
        {
          title: 'How web applications get attacked',
          description: 'Where the attack surface of a web app lies: every input, header, cookie and third-party script, the difference between the attacker controlling a request and controlling a victim browser, and why defence in depth beats a single control.',
          concepts: ['Attack surface of a web app', 'Attacker as client versus attacker as page', 'Trust boundaries', 'Defence in depth'],
          quiz: [
            ['Why is client-side validation not a security control?', 'The attacker controls the client and can send any request directly.'],
            ['What is a trust boundary?', 'A point where data moves from a less trusted to a more trusted context and must be validated.'],
          ],
        },
        {
          title: 'The same-origin policy',
          description: 'An origin is scheme plus host plus port; the same-origin policy stops a page reading responses, DOM or storage belonging to another origin, which is the foundation that keeps one site from stealing another users data in the same browser.',
          concepts: ['Origin: scheme, host and port', 'What SOP blocks and allows', 'Cross-origin embedding versus reading', 'postMessage and origin checks', 'window.opener isolation'],
          quiz: [
            ['Are https://app.example.com and https://example.com the same origin?', 'No, the host differs.'],
            ['What must a postMessage listener always check?', 'event.origin against an expected value.'],
          ],
          prereqs: ['How web applications get attacked'],
        },
        {
          title: 'CORS: preflights, credentials and misconfiguration',
          description: 'CORS lets a server relax the same-origin policy with Access-Control-Allow-Origin; preflight OPTIONS requests gate non-simple requests, credentials need an explicit origin, and reflecting any origin with credentials hands attackers authenticated API access.',
          concepts: ['Simple versus preflighted requests', 'Access-Control-Allow-Origin', 'Credentials and explicit origins', 'Origin reflection misconfiguration', 'CORS is not access control'],
          quiz: [
            ['Can Access-Control-Allow-Origin: * be combined with credentials?', 'No, browsers reject credentials with a wildcard origin.'],
            ['Does CORS stop a request from being sent?', 'No, it only stops the response from being read; state-changing simple requests still arrive.'],
          ],
          prereqs: ['The same-origin policy'],
        },
        {
          title: 'Cookies: Secure, HttpOnly and SameSite',
          description: 'Cookies are scoped by domain and path, not origin; Secure restricts them to HTTPS, HttpOnly hides them from scripts, SameSite controls cross-site sending, and __Host- prefixes lock down domain and path.',
          concepts: ['Cookie scope by domain and path', 'Secure and HttpOnly flags', 'SameSite Lax, Strict and None', '__Host- and __Secure- prefixes', 'Cookie size and expiry'],
          quiz: [
            ['What does SameSite=Lax send on cross-site navigation?', 'The cookie on top-level GET navigations, but not on cross-site POSTs or subresources.'],
            ['What does the __Host- prefix require?', 'Secure, no Domain attribute and Path=/.'],
          ],
          prereqs: ['The same-origin policy'],
        },
      ],
    },
    {
      title: 'OWASP Top 10',
      description: 'The categories that account for most real-world web vulnerabilities.',
      topics: [
        {
          title: 'Reading the OWASP Top 10',
          description: 'The OWASP Top 10 is a ranked awareness list of web risk categories; knowing how it is compiled, what each category covers and how it maps to ASVS and the Cheat Sheet Series turns it from a checklist into a study map.',
          concepts: ['What the Top 10 measures', 'Categories and their overlap', 'ASVS as the verification standard', 'OWASP Cheat Sheets as references'],
          quiz: [
            ['Is the Top 10 a compliance standard?', 'No, it is an awareness document; ASVS is the verification standard.'],
            ['Which category covers missing server-side permission checks?', 'Broken Access Control.'],
          ],
          prereqs: ['How web applications get attacked'],
        },
        {
          title: 'Injection: SQL, NoSQL and command',
          description: 'Injection happens when untrusted input is concatenated into a query or command; parameterised queries, ORM query builders, allowlisted identifiers and avoiding shell invocation remove the vulnerability class rather than filtering symptoms.',
          concepts: ['String concatenation into queries', 'Parameterised queries and prepared statements', 'NoSQL operator injection', 'Command injection and execFile', 'Allowlisting identifiers'],
          quiz: [
            ['Why does escaping quotes not fully prevent SQL injection?', 'Numeric contexts, identifiers and encoding tricks bypass it; parameters separate code from data.'],
            ['What makes { "$gt": "" } dangerous in a MongoDB login?', 'An object from JSON input becomes a query operator that matches any password.'],
          ],
          prereqs: ['Reading the OWASP Top 10'],
        },
        {
          title: 'Cryptographic failures',
          description: 'Sensitive data exposed through weak or missing cryptography: plaintext storage, MD5 or SHA-1 passwords, home-made encryption, hard-coded keys and HTTP transport; the fix is proven algorithms, correct modes and managed keys.',
          concepts: ['Data classification and what to protect', 'Password hashing versus encryption', 'AES-GCM and authenticated encryption', 'Key management and rotation', 'Randomness with crypto.randomBytes'],
          quiz: [
            ['Why is Math.random unsuitable for tokens?', 'It is not cryptographically secure and can be predicted.'],
            ['Should passwords be encrypted or hashed?', 'Hashed with a slow salted algorithm such as Argon2id or bcrypt.'],
          ],
          prereqs: ['Reading the OWASP Top 10'],
        },
        {
          title: 'Security misconfiguration',
          description: 'Debug modes in production, default credentials, verbose error pages, open cloud buckets, directory listing and permissive CORS are misconfigurations; hardening checklists, environment separation and automated config scanning catch them.',
          concepts: ['Debug and stack traces in production', 'Default accounts and sample apps', 'Directory listing and backups', 'Environment-specific configuration', 'Hardening checklists'],
          quiz: [
            ['What does an exposed stack trace give an attacker?', 'Framework versions, file paths and logic hints for targeted attacks.'],
            ['How do you keep dev-only settings out of production?', 'Separate config per environment and fail startup on unsafe values.'],
          ],
          prereqs: ['Reading the OWASP Top 10'],
        },
        {
          title: 'Server-side request forgery',
          description: 'SSRF tricks the server into fetching attacker-chosen URLs, reaching internal services, cloud metadata endpoints or localhost; defences allowlist destinations, resolve and check IPs, block private ranges and disable redirects.',
          concepts: ['How SSRF reaches internal networks', 'Cloud metadata endpoint risk', 'Allowlisting hosts and schemes', 'Blocking private IP ranges', 'Redirect and DNS rebinding pitfalls'],
          quiz: [
            ['Why is 169.254.169.254 a classic SSRF target?', 'It serves cloud instance metadata including credentials.'],
            ['Why check the resolved IP and not just the hostname?', 'A hostname can resolve to a private address or change after the check.'],
          ],
          prereqs: ['Reading the OWASP Top 10'],
        },
        {
          title: 'Insecure design and vulnerable components',
          description: 'Flaws baked into the design, such as unlimited password resets or business logic abuse, cannot be patched by code fixes; combined with outdated components, they require threat modelling, abuse cases and inventory of dependencies.',
          concepts: ['Business logic abuse', 'Abuse cases alongside use cases', 'Rate and quantity limits by design', 'Component inventory and end of life'],
          quiz: [
            ['Give an example of insecure design.', 'A discount code endpoint with no limit on attempts, allowing brute force of codes.'],
            ['Why is a component inventory a security control?', 'You cannot patch what you do not know you run.'],
          ],
          prereqs: ['Reading the OWASP Top 10'],
        },
      ],
    },
    {
      title: 'Cross-Site Scripting',
      description: 'Running attacker script in a victim browser, and the layered defences against it.',
      topics: [
        {
          title: 'Reflected, stored and DOM-based XSS',
          description: 'XSS injects script into a page: reflected from a request, stored from a database or generated by client code writing untrusted data to dangerous sinks like innerHTML; each variant has a different source but the same impact of full session control.',
          concepts: ['Reflected XSS from request data', 'Stored XSS from persisted data', 'DOM XSS sources and sinks', 'What XSS lets an attacker do'],
          quiz: [
            ['Name a DOM XSS sink.', 'element.innerHTML, document.write or eval.'],
            ['Why does HttpOnly not stop XSS damage?', 'Script can still act as the user in-page without reading the cookie.'],
          ],
          prereqs: ['The same-origin policy'],
        },
        {
          title: 'Contextual output encoding',
          description: 'Untrusted data must be encoded for the exact context it lands in: HTML body, attribute, JavaScript string, URL or CSS; framework templating auto-escapes HTML but not URLs like javascript: or attributes such as href built from input.',
          concepts: ['HTML entity encoding', 'Attribute and URL contexts', 'JavaScript string context', 'Framework auto-escaping and its gaps', 'javascript: and data: URLs'],
          quiz: [
            ['Does React escape a value placed in href?', 'It escapes characters but a javascript: URL still executes; validate the scheme.'],
            ['Which characters must HTML body encoding cover at minimum?', '&, <, >, " and the single quote.'],
          ],
          prereqs: ['Reflected, stored and DOM-based XSS'],
        },
        {
          title: 'Sanitising HTML with DOMPurify',
          description: 'When rich HTML must be rendered, sanitising with DOMPurify on an allowlist of tags and attributes is the only safe route; regex filters and denylists fail against mutation XSS and unusual parsers.',
          concepts: ['Allowlist sanitisation', 'DOMPurify configuration', 'Mutation XSS and parser differences', 'dangerouslySetInnerHTML with sanitised input'],
          quiz: [
            ['Why do denylist filters fail?', 'Attackers use encodings, unusual tags and parser quirks the list never anticipated.'],
            ['Where should sanitisation happen for rendered HTML?', 'As close to the render as possible, and again on the server if stored.'],
          ],
          prereqs: ['Contextual output encoding'],
        },
        {
          title: 'Content Security Policy',
          description: 'CSP tells the browser which sources may load scripts, styles and frames; a strict policy with nonces or hashes and strict-dynamic blocks injected inline script even when encoding fails, and report-only mode lets you roll it out safely.',
          concepts: ['script-src with nonces and hashes', 'strict-dynamic', 'Report-only rollout and reporting', 'Common bypasses: unsafe-inline and JSONP', 'frame-ancestors and object-src'],
          quiz: [
            ['What does a per-response nonce achieve?', 'Only script tags carrying that nonce run, so injected scripts are blocked.'],
            ['Why start with Content-Security-Policy-Report-Only?', 'Violations are reported without breaking the site while the policy is tuned.'],
          ],
          prereqs: ['Contextual output encoding'],
        },
        {
          title: 'Trusted Types and safe DOM APIs',
          description: 'Trusted Types make dangerous sinks accept only typed values created by a reviewed policy, turning DOM XSS into a compile-time and runtime error; pairing them with textContent, setAttribute and framework bindings removes most raw sinks.',
          concepts: ['require-trusted-types-for directive', 'Policies that create TrustedHTML', 'Preferring textContent and setAttribute', 'Auditing sinks with linters'],
          quiz: [
            ['What happens when innerHTML receives a plain string under Trusted Types?', 'The browser throws a TypeError and the assignment is blocked.'],
            ['Which API sets visible text safely?', 'element.textContent.'],
          ],
          prereqs: ['Content Security Policy'],
        },
      ],
    },
    {
      title: 'CSRF, Clickjacking and Redirects',
      description: 'Attacks that abuse the browser sending credentials or rendering pages it should not.',
      topics: [
        {
          title: 'How cross-site request forgery works',
          description: 'A malicious page makes the victim browser send a state-changing request to a site where the user is logged in; because cookies ride along automatically, the server cannot tell the forged request from a real one without extra proof.',
          concepts: ['Ambient authority of cookies', 'Forged forms and image requests', 'What CSRF can and cannot do', 'CSRF against JSON APIs'],
          quiz: [
            ['Why can a cross-site form submit but not read the response?', 'The same-origin policy blocks reading, but sending is allowed.'],
            ['Does CSRF work against an API authenticated with an Authorization header set by JavaScript?', 'No, the attacker page cannot add that header.'],
          ],
          prereqs: ['Cookies: Secure, HttpOnly and SameSite'],
        },
        {
          title: 'CSRF defences: tokens, SameSite and Origin checks',
          description: 'Synchroniser tokens tied to the session, signed double-submit cookies, SameSite=Lax or Strict cookies and verifying the Origin or Sec-Fetch-Site header each break CSRF; frameworks ship middleware, but it must be enabled and not bypassed for GET.',
          concepts: ['Synchroniser token pattern', 'Signed double-submit cookies', 'SameSite as a defence layer', 'Origin and Sec-Fetch-Site checks', 'Never mutating state on GET'],
          quiz: [
            ['Why must state changes never happen on GET?', 'Links and images can trigger GET cross-site with cookies attached.'],
            ['Is SameSite=Lax alone enough?', 'It blocks most cases but not same-site subdomains or top-level POST redirects; combine with tokens or Origin checks.'],
          ],
          prereqs: ['How cross-site request forgery works'],
        },
        {
          title: 'Clickjacking and frame protection',
          description: 'Clickjacking overlays an invisible iframe of the target site so a victim clicks a real button unknowingly; frame-ancestors in CSP and X-Frame-Options stop the page being framed, with frame-busting scripts as an unreliable fallback.',
          concepts: ['Invisible iframe overlays', 'frame-ancestors directive', 'X-Frame-Options DENY and SAMEORIGIN', 'Why frame-busting scripts fail', 'Legitimate embedding allowlists'],
          quiz: [
            ['Which header replaces X-Frame-Options in modern browsers?', 'Content-Security-Policy: frame-ancestors.'],
            ['Why can a frame-busting script be defeated?', 'Sandboxed iframes can block the script from navigating the top window.'],
          ],
          prereqs: ['Content Security Policy'],
        },
        {
          title: 'Open redirects and tabnabbing',
          description: 'An unvalidated redirect parameter lets phishing links start on a trusted domain, and target=_blank links once gave the opened page control of the opener; allowlisting redirect targets and rel=noopener close both.',
          concepts: ['Redirect parameters and phishing', 'Allowlisting and relative-path redirects', 'Reverse tabnabbing via window.opener', 'rel=noopener and noreferrer'],
          quiz: [
            ['How do you validate a post-login redirect?', 'Accept only relative paths or entries from an allowlist of internal routes.'],
            ['What could a tabnabbing page do?', 'Replace the original tab with a phishing page via window.opener.location.'],
          ],
          prereqs: ['How cross-site request forgery works'],
        },
      ],
    },
    {
      title: 'Authentication and Sessions',
      description: 'Proving who the user is and keeping that proof safe.',
      topics: [
        {
          title: 'Password storage with Argon2 and bcrypt',
          description: 'Passwords are stored as salted slow hashes so leaked databases resist cracking; Argon2id and bcrypt with tuned cost, unique salts, optional peppers and constant-time comparison are the standard, while length limits and breached-password checks improve policy.',
          concepts: ['Salted slow hashing', 'Argon2id versus bcrypt costs', 'Peppers and key storage', 'Constant-time comparison', 'Password policy and breach checks'],
          quiz: [
            ['Why is a fast hash like SHA-256 wrong for passwords?', 'GPUs compute billions per second, so leaked hashes crack quickly.'],
            ['What does a salt defeat?', 'Precomputed rainbow tables and cracking many hashes at once.'],
          ],
          prereqs: ['Cryptographic failures'],
        },
        {
          title: 'Server-side session management',
          description: 'A session id in a cookie maps to server state; ids must be random and long, regenerated after login to stop fixation, expired on idle and absolute timeouts, and invalidated on logout and password change.',
          concepts: ['Session id entropy', 'Regeneration after login', 'Idle and absolute timeouts', 'Logout and server-side invalidation', 'Session stores'],
          quiz: [
            ['What is session fixation?', 'An attacker sets a known session id before login and reuses it afterwards; regenerate ids on login.'],
            ['Where should the session cookie attributes come from?', 'Secure, HttpOnly, SameSite=Lax at least, with a __Host- prefix where possible.'],
          ],
          prereqs: ['Cookies: Secure, HttpOnly and SameSite'],
        },
        {
          title: 'JWTs and token-based authentication',
          description: 'JWTs carry signed claims the server can verify statelessly; pitfalls include accepting alg none, mixing HS256 and RS256 keys, storing tokens in localStorage, long lifetimes without revocation and trusting claims before verifying the signature.',
          concepts: ['Structure and signature verification', 'Algorithm confusion attacks', 'Short-lived access and refresh tokens', 'Storage: cookies versus localStorage', 'Revocation and rotation'],
          quiz: [
            ['Why is localStorage a poor place for tokens?', 'Any XSS can read it; HttpOnly cookies are invisible to scripts.'],
            ['What should a verifier pin?', 'The expected algorithm, issuer, audience and expiry.'],
          ],
          prereqs: ['Server-side session management'],
        },
        {
          title: 'OAuth 2.0 and OpenID Connect for web apps',
          description: 'OAuth delegates access and OIDC adds identity; the authorisation code flow with PKCE and a state parameter is the safe choice for browsers and SPAs, and the backend-for-frontend pattern keeps tokens out of the browser altogether.',
          concepts: ['Authorisation code flow', 'PKCE for public clients', 'state and nonce parameters', 'Backend-for-frontend pattern', 'Redirect URI validation'],
          quiz: [
            ['What does PKCE protect against?', 'Authorisation code interception by a malicious app or page.'],
            ['Why is the implicit flow deprecated?', 'Tokens land in the URL fragment where they leak via history and referrers.'],
          ],
          prereqs: ['JWTs and token-based authentication'],
        },
        {
          title: 'Multi-factor authentication and passkeys',
          description: 'TOTP codes, push approvals and hardware keys add a second factor; WebAuthn passkeys bind credentials to the origin so phishing cannot replay them, and recovery codes and enrolment flows need the same care as login.',
          concepts: ['TOTP with otplib', 'Phishing-resistant WebAuthn', 'Passkey registration and assertion', 'Recovery codes and enrolment', 'Step-up authentication'],
          quiz: [
            ['Why are passkeys phishing-resistant?', 'The credential is bound to the origin, so a lookalike domain cannot use it.'],
            ['What is step-up authentication?', 'Requiring a fresh or stronger factor before sensitive actions.'],
          ],
          prereqs: ['Password storage with Argon2 and bcrypt'],
        },
        {
          title: 'Brute force, credential stuffing and account recovery',
          description: 'Login, reset and signup endpoints attract automated abuse; rate limiting per account and IP, generic error messages to avoid enumeration, single-use expiring reset tokens and monitoring for stuffing patterns keep them safe.',
          concepts: ['Rate limiting and lockout trade-offs', 'Account enumeration in messages and timing', 'Password reset token design', 'Credential stuffing detection', 'CAPTCHA and proof of work'],
          quiz: [
            ['Why return the same message for unknown user and wrong password?', 'To stop attackers enumerating valid accounts.'],
            ['What properties must a reset token have?', 'Random, single-use, short-lived and bound to the account.'],
          ],
          prereqs: ['Server-side session management'],
        },
      ],
    },
    {
      title: 'Authorisation',
      description: 'Deciding what an authenticated user may do, and enforcing it on the server.',
      topics: [
        {
          title: 'Authorisation models: RBAC, ABAC and ownership',
          description: 'Role-based access assigns permissions to roles, attribute-based evaluates policies over user, resource and context, and ownership checks tie records to users; most apps combine them, and the model must be explicit to be testable.',
          concepts: ['Roles and permissions', 'Attribute and policy-based checks', 'Ownership and tenancy checks', 'Centralising policy code', 'Deny by default'],
          quiz: [
            ['What does deny by default mean in practice?', 'Every route requires an explicit allow rule; missing rules block access.'],
            ['Why centralise authorisation logic?', 'Scattered checks drift and get forgotten; one policy layer is auditable.'],
          ],
          prereqs: ['Server-side session management'],
        },
        {
          title: 'IDOR and privilege escalation',
          description: 'Insecure direct object references let a user change an id in a URL to reach another users data; horizontal escalation crosses users, vertical crosses roles, and both are fixed by checking ownership or permission on every object access.',
          concepts: ['Object references in URLs and bodies', 'Horizontal versus vertical escalation', 'Per-object permission checks', 'Unguessable ids are not authorisation'],
          quiz: [
            ['Does using UUIDs instead of integers fix IDOR?', 'No, ids leak in other places; the server must still authorise each access.'],
            ['Where must the ownership check happen?', 'In the server handler or data layer for every read and write.'],
          ],
          prereqs: ['Authorisation models: RBAC, ABAC and ownership'],
        },
        {
          title: 'Mass assignment and parameter tampering',
          description: 'Binding a request body straight onto a model lets attackers set fields like role or price; explicit allowlists of writable fields, schema validation and server-computed values prevent tampering with data the client should not control.',
          concepts: ['Binding request bodies to models', 'Allowlisting writable fields', 'Server-computed prices and totals', 'Hidden field and enum tampering'],
          quiz: [
            ['How does a user become admin through mass assignment?', 'By adding role: "admin" to a profile update the server blindly saves.'],
            ['Should the client send the order total?', 'No, the server recomputes it from prices it holds.'],
          ],
          prereqs: ['IDOR and privilege escalation'],
        },
        {
          title: 'Enforcing authorisation in middleware and APIs',
          description: 'Route middleware checks authentication and coarse roles, handlers check fine-grained object permissions, GraphQL resolvers and background jobs need the same checks, and tests assert that forbidden paths return 403.',
          concepts: ['Route-level middleware', 'Handler-level object checks', 'GraphQL and batch endpoint gaps', 'Testing forbidden access'],
          quiz: [
            ['Why is a middleware role check not enough?', 'It cannot know which specific object the handler will touch.'],
            ['What status should a denied but authenticated request return?', '403 Forbidden, or 404 when existence must be hidden.'],
          ],
          prereqs: ['Mass assignment and parameter tampering'],
        },
      ],
    },
    {
      title: 'Transport Security and Headers',
      description: 'Protecting data in transit and hardening browser behaviour with headers.',
      topics: [
        {
          title: 'TLS and HTTPS in practice',
          description: 'TLS gives confidentiality, integrity and server authentication through certificates and a handshake; modern configuration means TLS 1.2 or 1.3, automated certificates from Let us Encrypt, no mixed content and correct certificate validation in clients.',
          concepts: ['Handshake and certificates', 'TLS 1.3 and cipher configuration', 'Automated certificates with ACME', 'Mixed content', 'Certificate validation in clients'],
          quiz: [
            ['What does disabling certificate verification in a client do?', 'Allows any attacker on the path to impersonate the server.'],
            ['What is mixed content?', 'An HTTPS page loading resources over HTTP, which browsers block or downgrade.'],
          ],
          prereqs: ['Cryptographic failures'],
        },
        {
          title: 'HSTS and preload',
          description: 'Strict-Transport-Security makes browsers refuse plain HTTP for a domain after the first HTTPS visit, closing the downgrade window; includeSubDomains and the preload list extend it to first visits.',
          concepts: ['max-age and includeSubDomains', 'SSL stripping attacks', 'The preload list', 'Rollout and rollback caution'],
          quiz: [
            ['What attack does HSTS prevent?', 'SSL stripping, where a proxy keeps the victim on HTTP.'],
            ['Why is preloading hard to undo?', 'Browsers ship the list, so removal takes months.'],
          ],
          prereqs: ['TLS and HTTPS in practice'],
        },
        {
          title: 'Security headers',
          description: 'X-Content-Type-Options stops MIME sniffing, Referrer-Policy limits URL leakage, Permissions-Policy disables unused features, COOP and COEP isolate the process, and helmet sets sensible defaults in Node apps.',
          concepts: ['X-Content-Type-Options nosniff', 'Referrer-Policy', 'Permissions-Policy', 'COOP, COEP and CORP', 'Setting headers with helmet'],
          quiz: [
            ['What does nosniff prevent?', 'Browsers treating a non-script response as script based on content sniffing.'],
            ['Which policy keeps full URLs from leaking to third parties?', 'Referrer-Policy: strict-origin-when-cross-origin or stricter.'],
          ],
          prereqs: ['Content Security Policy'],
        },
        {
          title: 'Subresource Integrity and third-party scripts',
          description: 'Every third-party script runs with full page privileges; SRI hashes pin CDN files, CSP limits sources, tag managers need governance, and self-hosting critical dependencies removes an entire class of supply-chain compromise.',
          concepts: ['integrity attribute and crossorigin', 'Risk of tag managers and analytics', 'Self-hosting versus CDN', 'Sandboxed iframes for widgets'],
          quiz: [
            ['What happens when an SRI hash does not match?', 'The browser refuses to execute or apply the resource.'],
            ['Why can SRI not protect a script that loads other scripts?', 'Only the first file is hashed; later loads are unverified.'],
          ],
          prereqs: ['Security headers'],
        },
      ],
    },
    {
      title: 'Input Handling, Files and Data',
      description: 'Treating every input as hostile without breaking the application.',
      topics: [
        {
          title: 'Input validation with schemas',
          description: 'Validate structure, type, length and range at the boundary with a schema library such as Zod, prefer allowlists to denylists, canonicalise before checking, and remember validation reduces attack surface but never replaces output encoding.',
          concepts: ['Schema validation with Zod', 'Allowlists over denylists', 'Canonicalisation before checks', 'Length and range limits', 'Validation versus encoding'],
          quiz: [
            ['Why does validation not remove the need for output encoding?', 'Valid data can still be dangerous in a specific output context.'],
            ['What is canonicalisation?', 'Normalising input such as decoding and Unicode normalisation before validating it.'],
          ],
          prereqs: ['Injection: SQL, NoSQL and command'],
        },
        {
          title: 'Path traversal and file access',
          description: 'User-controlled file names with ../ segments escape the intended directory; resolving the path, checking it stays under the base directory, mapping ids to files and avoiding user-supplied names entirely close the hole.',
          concepts: ['Dot-dot segments and encodings', 'Resolving and prefix-checking paths', 'Mapping ids to stored files', 'Symlink and null byte pitfalls'],
          quiz: [
            ['How do you safely check a resolved path?', 'path.resolve(base, name) then verify it starts with base plus the separator.'],
            ['Why is decoding once not enough?', 'Double-encoded sequences like %252e decode again later; canonicalise fully first.'],
          ],
          prereqs: ['Input validation with schemas'],
        },
        {
          title: 'Secure file uploads',
          description: 'Uploads bring executable content, huge files and polyglots; enforce size limits, verify type by content not extension, generate new file names, store outside the web root or in object storage, and serve with a safe Content-Type and Content-Disposition.',
          concepts: ['Size limits and streaming', 'Type detection by magic bytes', 'Renaming and storing outside webroot', 'Image re-encoding and malware scanning', 'Safe download headers'],
          quiz: [
            ['Why check magic bytes rather than the extension?', 'Extensions and the client-provided MIME type are attacker-controlled.'],
            ['What header prevents an uploaded HTML file executing as a page?', 'Content-Disposition: attachment together with nosniff and a separate origin.'],
          ],
          prereqs: ['Path traversal and file access'],
        },
        {
          title: 'JavaScript-specific pitfalls: prototype pollution, ReDoS and eval',
          description: 'Merging untrusted JSON can set __proto__ and poison every object, catastrophic-backtracking regexes hang the event loop, and eval or new Function turn strings into code; safe merges, linear-time regex checks and body limits address each.',
          concepts: ['Prototype pollution through merges', 'Object.create(null) and hasOwn', 'ReDoS and catastrophic backtracking', 'eval, new Function and vm', 'Request body size limits'],
          quiz: [
            ['Which key in JSON triggers prototype pollution in naive merges?', '__proto__ (and constructor.prototype).'],
            ['Why does one bad regex take down a Node server?', 'The single-threaded event loop blocks while it backtracks.'],
          ],
          prereqs: ['Input validation with schemas'],
        },
      ],
    },
    {
      title: 'Supply Chain and Secrets',
      description: 'Trusting code you did not write, and keeping credentials out of it.',
      topics: [
        {
          title: 'Dependency vulnerabilities and updates',
          description: 'Most application code is dependencies; npm audit, Dependabot or Renovate, lockfiles and pinned versions surface and fix known CVEs, while transitive dependencies and unmaintained packages need review rather than blind upgrades.',
          concepts: ['npm audit and advisories', 'Lockfiles and pinning', 'Automated update bots', 'Transitive dependency risk', 'Triaging false positives'],
          quiz: [
            ['What does a lockfile guarantee?', 'Identical dependency trees across installs.'],
            ['Why is npm audit output not the whole story?', 'It only lists known advisories and includes unreachable code paths.'],
          ],
          prereqs: ['Insecure design and vulnerable components'],
        },
        {
          title: 'Supply-chain attacks and provenance',
          description: 'Typosquatting, maintainer account takeover, malicious install scripts and compromised build pipelines deliver malware through packages; ignore-scripts, provenance attestations, SBOMs and minimal permissions in CI limit the damage.',
          concepts: ['Typosquatting and dependency confusion', 'Install scripts and ignore-scripts', 'npm provenance and Sigstore', 'SBOM generation', 'Least privilege in CI'],
          quiz: [
            ['What is dependency confusion?', 'Publishing a public package with the same name as an internal one so installs pull the attacker version.'],
            ['What does provenance attestation prove?', 'That the package was built from a specific commit by a specific CI workflow.'],
          ],
          prereqs: ['Dependency vulnerabilities and updates'],
        },
        {
          title: 'Secrets management',
          description: 'API keys and database passwords belong in environment variables or a vault, never in code or git history; scanning with gitleaks, rotating regularly, scoping keys narrowly and revoking on leak are the working practices.',
          concepts: ['Environment variables and .env hygiene', 'Vaults and cloud secret managers', 'Scanning repositories with gitleaks', 'Rotation and revocation', 'Scoped and short-lived credentials'],
          quiz: [
            ['A key was committed and then removed in the next commit. Is it safe?', 'No, it remains in history; rotate it immediately.'],
            ['Why prefer short-lived credentials?', 'A leak has a small window of usefulness.'],
          ],
          prereqs: ['Dependency vulnerabilities and updates'],
        },
        {
          title: 'Secrets and the browser bundle',
          description: 'Anything in a frontend bundle is public: build-time environment variables, API keys and feature flags all ship to users, so only publishable keys belong there and privileged calls go through a backend that holds the real secret.',
          concepts: ['Public versus private keys', 'Build-time env exposure', 'Proxying privileged calls', 'Restricting publishable keys by origin'],
          quiz: [
            ['Is a VITE_ or NEXT_PUBLIC_ variable secret?', 'No, it is inlined into the client bundle.'],
            ['How do you call a paid API without exposing its key?', 'Through a backend route that adds the key server-side.'],
          ],
          prereqs: ['Secrets management'],
        },
      ],
    },
    {
      title: 'Security Testing on Authorised Targets',
      description: 'Finding vulnerabilities before attackers do, only on systems you are permitted to test.',
      topics: [
        {
          title: 'Rules of engagement and lab setup',
          description: 'Testing is legal only with explicit authorisation and scope; deliberately vulnerable apps such as OWASP Juice Shop and DVWA run locally in Docker give a safe target, and a written scope, notes and evidence make findings reproducible.',
          concepts: ['Authorisation and scope', 'Running Juice Shop and DVWA in Docker', 'Isolated lab networking', 'Note-taking and evidence'],
          quiz: [
            ['May you scan a site because it is public?', 'No, testing requires explicit permission from the owner.'],
            ['How do you start Juice Shop locally?', 'docker run -p 3000:3000 bkimminich/juice-shop.'],
          ],
          prereqs: ['Reading the OWASP Top 10'],
        },
        {
          title: 'Intercepting proxies: Burp Suite and ZAP',
          description: 'An intercepting proxy sits between browser and server so you can inspect and modify requests; Burp Repeater and Intruder and ZAP equivalents let you test one parameter at a time, and the site map reveals hidden endpoints.',
          concepts: ['Proxy setup and CA certificate', 'Repeater for manual testing', 'Intruder and fuzzing concepts', 'Site map and scope', 'Reading requests and responses'],
          quiz: [
            ['Why install the proxy CA certificate in the browser?', 'So HTTPS traffic can be decrypted and inspected by the proxy.'],
            ['What is Repeater for?', 'Resending a single edited request and comparing responses.'],
          ],
          prereqs: ['Rules of engagement and lab setup'],
        },
        {
          title: 'Dynamic scanning with ZAP in CI',
          description: 'DAST tools crawl and attack a running app; the ZAP baseline and full scans run against a staging deployment in CI, with authentication contexts, alert thresholds and triage rules that keep the signal useful.',
          concepts: ['ZAP baseline versus full scan', 'Authenticated scanning', 'Alert thresholds and fail rules', 'Triaging DAST findings'],
          quiz: [
            ['What does the ZAP baseline scan do?', 'Passively crawls and reports issues without active attacks.'],
            ['Why run DAST against staging rather than production?', 'Active scans mutate data and can degrade service.'],
          ],
          prereqs: ['Intercepting proxies: Burp Suite and ZAP'],
        },
        {
          title: 'Static analysis with Semgrep and CodeQL',
          description: 'SAST finds dangerous patterns in source: Semgrep rules, CodeQL taint tracking and eslint-plugin-security catch sinks, hard-coded secrets and unsafe APIs early, and custom rules encode your own guardrails.',
          concepts: ['Semgrep rules and registry', 'Taint tracking in CodeQL', 'eslint-plugin-security', 'Writing custom rules', 'Managing false positives'],
          quiz: [
            ['What is taint tracking?', 'Following untrusted data from a source to a dangerous sink through the code.'],
            ['Why keep SAST in pull request checks?', 'Findings are cheapest to fix before merge.'],
          ],
          prereqs: ['Rules of engagement and lab setup'],
        },
        {
          title: 'Security unit tests and abuse cases',
          description: 'Turn each vulnerability class into an automated test: forbidden access returns 403, encoded output stays inert, uploads reject polyglots and rate limits trigger; abuse cases written beside user stories keep security regressions out.',
          concepts: ['Tests for authorisation failures', 'Encoding and sanitisation tests', 'Abuse case authoring', 'Regression tests for fixed bugs'],
          quiz: [
            ['What should a test for IDOR assert?', 'A request for another users object returns 403 or 404, never the data.'],
            ['Why write a regression test after fixing a vulnerability?', 'To ensure refactors do not reintroduce it.'],
          ],
          prereqs: ['Static analysis with Semgrep and CodeQL'],
        },
      ],
    },
    {
      title: 'Monitoring and Secure Development Lifecycle',
      description: 'Detecting attacks and building security into how software is made.',
      topics: [
        {
          title: 'Security logging',
          description: 'Log authentication events, authorisation failures, input validation failures and admin actions with user, time and source; never log secrets or full card numbers, and neutralise newlines so attackers cannot forge log entries.',
          concepts: ['What events to log', 'What never to log', 'Log injection and neutralisation', 'Structured logs and correlation ids', 'Retention and access control'],
          quiz: [
            ['Why is a failed login an important log event?', 'Spikes reveal brute force and credential stuffing.'],
            ['What is log injection?', 'Input containing newlines or control characters that forges or hides log lines.'],
          ],
          prereqs: ['Brute force, credential stuffing and account recovery'],
        },
        {
          title: 'Detection, alerting and WAFs',
          description: 'Alerts on authorisation failure spikes, unusual geographies and error rate changes catch attacks in progress; a web application firewall filters known patterns but is a layer, not a fix, and needs tuning to avoid blocking users.',
          concepts: ['Alerting on attack signals', 'Rate anomalies and geo checks', 'WAF strengths and bypasses', 'Incident runbooks for web attacks'],
          quiz: [
            ['Can a WAF replace fixing an injection bug?', 'No, WAF rules are bypassable; fix the code and use the WAF as an extra layer.'],
            ['Name one signal worth alerting on.', 'A surge of 403 responses from one account or IP.'],
          ],
          prereqs: ['Security logging'],
        },
        {
          title: 'Threat modelling and secure design reviews',
          description: 'Threat modelling with STRIDE over a data-flow diagram finds design flaws before code exists; security requirements, code review checklists and security champions embed the practice into ordinary delivery.',
          concepts: ['Data-flow diagrams', 'STRIDE categories', 'Security requirements and acceptance criteria', 'Code review checklists', 'Security champions'],
          quiz: [
            ['What does the T in STRIDE stand for?', 'Tampering.'],
            ['When is the cheapest time to find a design flaw?', 'Before implementation, during design review.'],
          ],
          prereqs: ['Insecure design and vulnerable components'],
        },
        {
          title: 'Vulnerability disclosure and patching',
          description: 'A security.txt and disclosure policy tell researchers how to report; triage, fix, coordinated disclosure and patch timelines close issues responsibly, and bug bounty programmes scale external testing on clear terms.',
          concepts: ['security.txt and disclosure policy', 'Triage and severity with CVSS', 'Coordinated disclosure timelines', 'Bug bounty scope and rules'],
          quiz: [
            ['Where does security.txt live?', 'At /.well-known/security.txt.'],
            ['What is coordinated disclosure?', 'Reporter and vendor agree a fix window before details go public.'],
          ],
          prereqs: ['Threat modelling and secure design reviews'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Hands-on defensive projects on authorised targets, then interview practice.',
      topics: [
        {
          title: 'Project: Juice Shop assessment and fix report',
          description: 'Run OWASP Juice Shop locally, solve a set of challenges across XSS, injection, broken access control and auth using a proxy, then write a report for each finding with reproduction steps, severity, root cause and the code-level fix.',
          concepts: ['Set up the lab and proxy', 'Find and reproduce vulnerabilities', 'Rate severity and root cause', 'Write fixes and a report'],
          quiz: [
            ['What must every finding include?', 'Reproduction steps, impact, severity and a recommended fix.'],
            ['Why is Juice Shop an acceptable target?', 'It is intentionally vulnerable and run locally under your control.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: secure authentication service',
          description: 'Build a Node or Next.js auth service with Argon2id hashing, regenerated sessions in __Host- cookies, TOTP MFA, rate-limited login and reset, generic error messages, CSRF protection and tests proving each control.',
          concepts: ['Hashing and session design', 'MFA enrolment and verification', 'Rate limits and reset tokens', 'Security tests for each control'],
          quiz: [
            ['How do you prove session regeneration works?', 'A test that captures the id before login and asserts it changed after.'],
            ['Which cookie attributes does the session use?', 'Secure, HttpOnly, SameSite=Lax and the __Host- prefix.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CSP and headers rollout',
          description: 'Take an existing frontend, deploy a report-only CSP with nonces, collect violations to a reporting endpoint, remove inline scripts and eval, then enforce the policy plus HSTS and the other security headers without breaking the app.',
          concepts: ['Inventory scripts and inline code', 'Report-only policy and endpoint', 'Refactor to nonces', 'Enforce and verify headers'],
          quiz: [
            ['How do you know the policy is ready to enforce?', 'The report-only endpoint shows no violations from legitimate traffic.'],
            ['What tool checks the final headers?', 'securityheaders.com style scanners or curl -I.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: security pipeline in CI',
          description: 'Add dependency auditing, gitleaks secret scanning, Semgrep SAST and a ZAP baseline scan against a preview deployment to a GitHub Actions workflow, with thresholds that fail the build and a triage process for findings.',
          concepts: ['Audit and secret scanning jobs', 'Semgrep with custom rules', 'ZAP baseline against preview', 'Thresholds and triage workflow'],
          quiz: [
            ['Why run ZAP against a preview deployment?', 'It exercises the real app without touching production.'],
            ['How do you avoid alert fatigue?', 'Fail only on high severity and track suppressed findings with reasons.'],
          ],
          style: 'project',
        },
        {
          title: 'Web security interview questions',
          description: 'The questions that keep coming up: SOP versus CORS, XSS versus CSRF, cookies versus tokens, how CSP works, what a JWT verifier must check, IDOR examples, and how you would secure a login flow end to end.',
          concepts: ['Browser model questions', 'Vulnerability class comparisons', 'Auth and session design questions', 'Explaining defences aloud'],
          quiz: [
            ['One-line difference between XSS and CSRF?', 'XSS runs attacker script in the victim page; CSRF makes the victim browser send a forged request.'],
            ['What does CSP add beyond output encoding?', 'A second layer that blocks injected scripts even when encoding fails.'],
          ],
          style: 'reading',
        },
        {
          title: 'Secure code review exercise',
          description: 'Reviewing short Express, React and SQL snippets under time pressure to spot injection, missing authorisation, unsafe innerHTML, weak crypto and secret leaks, then explaining the fix the way an interviewer expects.',
          concepts: ['Spotting sinks and sources quickly', 'Authorisation gaps in handlers', 'Crypto and secret smells', 'Proposing minimal fixes'],
          quiz: [
            ['You see db.query("SELECT * FROM users WHERE id = " + id). What is the fix?', 'A parameterised query: db.query("... WHERE id = $1", [id]).'],
            ['A handler loads an order by id from the URL with no user check. What is the bug?', 'IDOR; check the order belongs to the authenticated user.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
