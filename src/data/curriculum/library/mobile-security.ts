import { defineTrack } from '../define'

export const mobileSecurity = defineTrack({
  id: 'track-mobile-security',
  title: 'Mobile Security',
  description: 'Securing Android and iOS apps end to end: the mobile threat model and OWASP Mobile Top 10, Keychain and Keystore storage, biometrics and token handling, TLS and pinning, deep link and intent hardening, obfuscation and integrity checks, secrets and privacy manifests, SDK risk, MobSF and Frida testing, and incident response.',
  family: 'Mobile Development',
  kind: 'domain',
  icon: '🔐',
  tags: ['mobile', 'security', 'owasp', 'keychain', 'keystore', 'certificate pinning', 'biometrics', 'mobsf', 'privacy'],
  languages: ['Kotlin', 'Swift', 'Dart', 'TypeScript'],
  explainMode: 'security',
  code: { label: 'the platform language or shell, whichever fits', id: 'bash', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Threat Model and Attack Surface',
      description: 'Who attacks a mobile app, what they can reach, and the standard list of ways apps fail.',
      topics: [
        {
          title: 'The mobile threat model',
          description: 'A phone is an attacker-controlled device: the binary can be decompiled, storage read on a rooted device, traffic intercepted with a proxy, and the user may be the adversary, so the server must never trust the client and secrets cannot hide in the app.',
          concepts: ['Attacker owns the device', 'Never trust the client', 'Assets and data classification', 'Lost or stolen device scenarios', 'Malicious apps on the same device'],
          quiz: [
            ['Why can the app binary not be trusted to keep a secret?', 'Anyone can download, decompile and read it; obfuscation only slows them.'],
            ['What is the most common realistic threat to an average app?', 'A stolen or shared device with data left readable, and network interception on public Wi-Fi.'],
          ],
        },
        {
          title: 'OWASP Mobile Top 10',
          description: 'The 2024 list, from improper credential usage and supply chain risks through insecure communication, inadequate privacy controls, binary protections, misconfiguration, insecure storage and insufficient cryptography, as a checklist for every release.',
          concepts: ['M1 improper credential usage', 'M2 supply chain and M3 authentication', 'M4 input validation and M5 communication', 'M6 privacy and M7 binary protection', 'M8 misconfiguration, M9 storage, M10 cryptography'],
          quiz: [
            ['What is M1 in the 2024 Mobile Top 10?', 'Improper credential usage, such as hard-coded or badly stored credentials.'],
            ['Which entry covers weak or home-made encryption?', 'M10, insufficient cryptography.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'The attacker toolkit: decompilers, proxies and hooks',
          description: 'What a tester or attacker does in the first hour: unpack an APK with apktool and read it in jadx, inspect an IPA with class-dump or Hopper, route traffic through Burp or mitmproxy, and hook functions at runtime with Frida.',
          concepts: ['apktool and jadx', 'IPA inspection with class-dump and Hopper', 'Intercepting proxies', 'Frida and objection hooks'],
          quiz: [
            ['What does jadx produce from an APK?', 'Readable Java source decompiled from the DEX bytecode.'],
            ['What does Frida let an attacker do?', 'Inject JavaScript to hook and modify functions in the running app.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'MASVS and the mobile security testing guide',
          description: 'The OWASP Mobile Application Security Verification Standard defines levels of control for storage, crypto, auth, network, platform, code and resilience, and the MASTG gives the test procedures, so teams can pick a target level and audit against it.',
          concepts: ['MASVS control groups', 'Choosing a verification level', 'MASTG test cases', 'Mapping requirements to tickets'],
          quiz: [
            ['What does MASVS-RESILIENCE cover?', 'Anti-tampering, anti-reversing and runtime protections.'],
            ['Which apps need resilience controls?', 'Those handling high-value data or actions, such as banking and payments, beyond the baseline.'],
          ],
          prereqs: ['OWASP Mobile Top 10'],
        },
      ],
    },
    {
      title: 'Secure Storage',
      topics: [
        {
          title: 'iOS Keychain',
          description: 'Storing secrets in the Keychain with the right accessibility class, why kSecAttrAccessibleWhenUnlockedThisDeviceOnly stops backup and extraction, access control with biometrics, and the sharing rules across app groups.',
          concepts: ['Keychain item classes and attributes', 'Accessibility classes and ThisDeviceOnly', 'Access control with biometry', 'Keychain sharing via access groups'],
          quiz: [
            ['Which accessibility class prevents an item from being restored to another device?', 'Any ThisDeviceOnly class, such as WhenUnlockedThisDeviceOnly.'],
            ['Is the Keychain encrypted when the phone is locked?', 'Yes for WhenUnlocked classes; the key is discarded until the device is unlocked.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'Android Keystore and encrypted preferences',
          description: 'Generating keys in the hardware-backed Keystore so the key material never leaves the secure element, using them to encrypt files and preferences, and the migration story now that EncryptedSharedPreferences is deprecated.',
          concepts: ['Hardware-backed key generation', 'StrongBox and attestation', 'Encrypting files and preferences with Keystore keys', 'User-authentication-bound keys', 'Migrating off EncryptedSharedPreferences'],
          quiz: [
            ['Can an app export a Keystore private key?', 'No, operations are performed inside the Keystore and the key material is not exportable.'],
            ['What does setUserAuthenticationRequired do?', 'Makes the key usable only after the user authenticates with biometrics or credentials.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'Database and file encryption',
          description: 'When a local SQLite database holds sensitive rows, SQLCipher or Realm encryption with a Keystore- or Keychain-held key protects it at rest, and file protection classes on iOS decide whether a file is readable while locked.',
          concepts: ['SQLCipher with a stored key', 'iOS Data Protection classes', 'Choosing what to encrypt', 'Key rotation for local data'],
          quiz: [
            ['Where should the SQLCipher key come from?', 'Generated on device and stored in Keychain or wrapped by a Keystore key, never hard-coded.'],
            ['What does NSFileProtectionComplete mean?', 'The file is inaccessible while the device is locked.'],
          ],
          prereqs: ['iOS Keychain', 'Android Keystore and encrypted preferences'],
        },
        {
          title: 'Data leaks: backups, logs, clipboard and screenshots',
          description: 'Sensitive data escapes through channels developers forget: adb backup and cloud backups, verbose logs, the shared clipboard, task switcher screenshots and keyboard caches, each with a platform switch to close it.',
          concepts: ['allowBackup and backup rules', 'Redacting logs in release builds', 'Clipboard hygiene', 'Task switcher snapshots and FLAG_SECURE', 'Keyboard autocorrect caches'],
          quiz: [
            ['How do you stop a screen appearing in the recent apps view on Android?', 'Set FLAG_SECURE on the window.'],
            ['Why disable logging of request bodies in release?', 'Logs are readable via logcat or crash reports and often contain tokens and personal data.'],
          ],
          prereqs: ['Database and file encryption'],
        },
      ],
    },
    {
      title: 'Authentication and Sessions',
      topics: [
        {
          title: 'OAuth 2.0 with PKCE for mobile',
          description: 'Public clients cannot hold a client secret, so the authorization code flow with PKCE proves the token request came from the app that started it, and a system browser via AppAuth or ASWebAuthenticationSession keeps credentials away from the app.',
          concepts: ['Public clients and PKCE', 'AppAuth and ASWebAuthenticationSession', 'Redirect URIs and app links', 'Why embedded WebViews are discouraged'],
          quiz: [
            ['What does PKCE protect against?', 'Authorization code interception, since the token exchange needs the original code verifier.'],
            ['Why use the system browser rather than a WebView for login?', 'The app cannot read the credentials and the user gets browser session and password manager support.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'Biometrics done right',
          description: 'BiometricPrompt and LocalAuthentication return a boolean that a hook can flip, so real protection binds a Keystore or Keychain key to biometric authentication and decrypts the token only after a successful prompt.',
          concepts: ['BiometricPrompt and LocalAuthentication', 'Crypto-bound biometric keys', 'Fallback to device credential', 'Biometric enrolment changes'],
          quiz: [
            ['Why is if (authenticated) unlock() weak?', 'Frida can hook the callback; the secret should be decryptable only with a biometric-bound key.'],
            ['What happens to a biometric-bound key when a new fingerprint is enrolled?', 'With invalidatedByBiometricEnrollment the key is invalidated and must be recreated after re-login.'],
          ],
          prereqs: ['iOS Keychain', 'Android Keystore and encrypted preferences'],
        },
        {
          title: 'Token handling and refresh',
          description: 'Short-lived access tokens in memory, refresh tokens in secure storage with rotation and reuse detection, and a single refresh path that queues concurrent requests so a burst of 401s does not trigger a stampede of refreshes.',
          concepts: ['Access tokens in memory only', 'Refresh token rotation', 'Reuse detection', 'Single-flight refresh on 401', 'Token binding to device'],
          quiz: [
            ['Why keep the access token out of persistent storage?', 'It is short-lived and a memory-only copy limits exposure on a compromised device.'],
            ['What is refresh token reuse detection?', 'The server revokes the whole token family when an already-rotated refresh token is presented.'],
          ],
          prereqs: ['OAuth 2.0 with PKCE for mobile'],
        },
        {
          title: 'Session management and logout',
          description: 'Server-side session revocation, clearing caches, cookies and secure storage on logout, timing out idle sessions for sensitive apps, and handling a device wipe or remote sign-out from another device.',
          concepts: ['Server-side revocation', 'Clearing local state on logout', 'Idle and absolute timeouts', 'Remote sign-out of devices'],
          quiz: [
            ['Why is deleting the local token not enough for logout?', 'A copied token still works until the server revokes it.'],
            ['What should a banking app do after five minutes in the background?', 'Require re-authentication before showing account data.'],
          ],
          prereqs: ['Token handling and refresh'],
        },
        {
          title: 'Passkeys and WebAuthn on mobile',
          description: 'Passkeys replace passwords with device-bound public key credentials synced through iCloud Keychain or Google Password Manager, resisting phishing because the credential is tied to the relying party origin or app link.',
          concepts: ['Public key credentials', 'Credential Manager and AuthenticationServices', 'Relying party and associated domains', 'Migrating users from passwords'],
          quiz: [
            ['Why are passkeys phishing-resistant?', 'The credential only signs for the registered origin, so a look-alike site gets nothing.'],
            ['Which iOS framework creates a passkey?', 'AuthenticationServices with ASAuthorizationPlatformPublicKeyCredentialProvider.'],
          ],
          prereqs: ['OAuth 2.0 with PKCE for mobile'],
        },
      ],
    },
    {
      title: 'Network Security',
      topics: [
        {
          title: 'TLS, ATS and network security config',
          description: 'App Transport Security on iOS and the Android network security configuration enforce HTTPS, block cleartext, and let you scope trusted CAs and debug-only overrides, so a misconfigured exception does not ship to production.',
          concepts: ['App Transport Security rules', 'Android network_security_config', 'Blocking cleartext traffic', 'Debug-only trust anchors', 'TLS versions and cipher hygiene'],
          quiz: [
            ['What does usesCleartextTraffic=false do?', 'Makes the platform refuse plain HTTP connections from the app.'],
            ['How do you allow a proxy CA only in debug builds?', 'Put the user CA trust anchor under debug-overrides in the network security config.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'Certificate pinning and its risks',
          description: 'Pinning the public key or SPKI hash of your backend certificate defeats rogue CAs and user-installed proxies, but a rotated certificate without a backup pin bricks the app, so pin to the intermediate or key with expiry and a kill switch.',
          concepts: ['Public key versus certificate pins', 'OkHttp CertificatePinner and NSURLSession delegates', 'Backup pins and expiry', 'Pinning failure recovery', 'When pinning is not worth it'],
          quiz: [
            ['Why pin the SPKI hash rather than the leaf certificate?', 'The key can survive certificate renewals so rotation does not break the app.'],
            ['What is the classic pinning outage?', 'Renewing the certificate with a new key while older app versions still pin the old one.'],
          ],
          prereqs: ['TLS, ATS and network security config'],
        },
        {
          title: 'Request signing and replay protection',
          description: 'Beyond TLS: signing requests with a device-held key, nonces and timestamps that the server checks, and idempotency keys so an intercepted or retried payment request cannot be replayed to double-charge.',
          concepts: ['HMAC and asymmetric request signing', 'Nonces and timestamp windows', 'Idempotency keys', 'Device-bound keys with attestation'],
          quiz: [
            ['What stops a captured signed request being sent again?', 'A nonce or timestamp the server rejects on reuse or after a short window.'],
            ['What is an idempotency key?', 'A client-generated id the server uses to return the same result for a repeated request.'],
          ],
          prereqs: ['Certificate pinning and its risks'],
        },
        {
          title: 'WebView security',
          description: 'WebViews are browsers inside the app: JavaScript bridges expose native methods to any loaded page, file access and mixed content widen the surface, so restrict origins, disable what you do not need and never load untrusted content with a bridge attached.',
          concepts: ['JavaScript interfaces and message handlers', 'Restricting origins and navigation', 'Disabling file and content access', 'WKWebView versus SFSafariViewController'],
          quiz: [
            ['What is the danger of addJavascriptInterface?', 'Any page loaded in that WebView can call the exposed native methods.'],
            ['When should you use SFSafariViewController instead of WKWebView?', 'For third-party web content, since it is isolated from the app and shares Safari cookies safely.'],
          ],
          prereqs: ['TLS, ATS and network security config'],
        },
      ],
    },
    {
      title: 'Input, Links and Inter-app Communication',
      topics: [
        {
          title: 'Input validation and injection in apps',
          description: 'SQL injection into local databases through string-built queries, JavaScript injection into WebViews, path traversal in file names from the server, and format string issues, and why parameterised queries and allow-lists close them.',
          concepts: ['Parameterised local queries', 'Sanitising content for WebViews', 'Path traversal in file names', 'Server-side validation as the real gate'],
          quiz: [
            ['Can SQL injection happen in an offline app?', 'Yes, any query built from user or server strings against SQLite can be manipulated.'],
            ['Why validate on the server even when the app validates?', 'The app can be modified or bypassed entirely with a crafted request.'],
          ],
          prereqs: ['OWASP Mobile Top 10'],
        },
        {
          title: 'Deep links: App Links and Universal Links',
          description: 'Custom URL schemes can be claimed by any app, so verified App Links and Universal Links tie a domain to your app through hosted association files, and the app must still treat every incoming URL parameter as untrusted input.',
          concepts: ['Custom schemes versus verified links', 'assetlinks.json and apple-app-site-association', 'Validating deep link parameters', 'Deep links into authenticated screens'],
          quiz: [
            ['Why is a custom URL scheme insecure for login callbacks?', 'Another app can register the same scheme and receive the authorization code.'],
            ['What file verifies an Android App Link?', '/.well-known/assetlinks.json on the domain.'],
          ],
          prereqs: ['Input validation and injection in apps'],
        },
        {
          title: 'Android intents and exported components',
          description: 'Exported activities, services and receivers are callable by any app, intent redirection lets a malicious app borrow your permissions, and mutable PendingIntents can be hijacked, so export nothing by default and validate every incoming intent.',
          concepts: ['android:exported and permissions', 'Intent redirection attacks', 'Immutable PendingIntents', 'Broadcast receivers and content providers'],
          quiz: [
            ['What changed for exported components in Android 12?', 'Every component with an intent filter must declare android:exported explicitly.'],
            ['Why prefer FLAG_IMMUTABLE for a PendingIntent?', 'A mutable one lets the receiving app change the intent and act with your app identity.'],
          ],
          prereqs: ['Deep links: App Links and Universal Links'],
        },
        {
          title: 'Clipboard, pasteboard and share targets',
          description: 'Anything on the clipboard is readable by other apps for a time, iOS shows paste notifications, sensitive values should expire or be marked, and share sheet and receive-share handlers need the same validation as any external input.',
          concepts: ['Clipboard read exposure', 'Sensitive clipboard flags and expiry', 'Handling shared content safely', 'Universal clipboard implications'],
          quiz: [
            ['How do you mark a copied one-time code as sensitive on Android?', 'Add the EXTRA_IS_SENSITIVE flag to the ClipData description.'],
            ['Why validate files received via the share sheet?', 'A malicious app can share crafted files that exploit parsers.'],
          ],
          prereqs: ['Android intents and exported components'],
        },
        {
          title: 'Tapjacking and overlay attacks',
          description: 'A malicious overlay can sit over your buttons so the user taps something they cannot see; filterTouchesWhenObscured and the Android 12 untrusted-touch block mitigate it, and sensitive screens should refuse input under an overlay.',
          concepts: ['Overlay permission abuse', 'filterTouchesWhenObscured', 'Untrusted touch blocking', 'Protecting consent and payment screens'],
          quiz: [
            ['What does filterTouchesWhenObscured do?', 'Discards touches delivered while another window covers the view.'],
            ['Which screens most need overlay protection?', 'Permission grants, payment confirmations and PIN entry.'],
          ],
          prereqs: ['Android intents and exported components'],
        },
      ],
    },
    {
      title: 'Code Protection and Integrity',
      topics: [
        {
          title: 'Obfuscation with R8, ProGuard and Swift stripping',
          description: 'Renaming classes and stripping symbols raises the cost of reverse engineering without preventing it; R8 rules must keep reflection targets, and mapping files must be uploaded so crash reports stay readable.',
          concepts: ['R8 shrinking and renaming', 'Keep rules for reflection and serialisation', 'Symbol stripping and dSYM handling', 'String encryption and its limits', 'Mapping files for crash reports'],
          quiz: [
            ['Does R8 make an APK safe to embed a secret in?', 'No, strings and logic remain recoverable; it only slows an attacker.'],
            ['Why upload mapping.txt to the crash reporter?', 'So obfuscated stack traces are de-obfuscated into readable class and method names.'],
          ],
          prereqs: ['The attacker toolkit: decompilers, proxies and hooks'],
        },
        {
          title: 'App integrity: Play Integrity API and App Attest',
          description: 'Server-verified attestations that a request came from your unmodified app on a genuine device: the Play Integrity verdict and App Attest assertions let the backend refuse traffic from tampered builds or emulator farms.',
          concepts: ['Play Integrity verdicts', 'App Attest key generation and assertions', 'Server-side verification', 'Handling failures without locking out users'],
          quiz: [
            ['What does a MEETS_STRONG_INTEGRITY verdict indicate?', 'A hardware-backed, unmodified device with a genuine build of the app from Play.'],
            ['Why verify attestation on the server rather than in the app?', 'Client-side checks can be hooked; the server holds the decision.'],
          ],
          prereqs: ['Request signing and replay protection'],
        },
        {
          title: 'Root and jailbreak detection and its limits',
          description: 'Checking for su binaries, Magisk, Cydia or writable system paths finds casual roots, but tools like Magisk Hide and Frida bypass checks in minutes, so detection is a signal for risk scoring, not a security boundary.',
          concepts: ['Common root and jailbreak indicators', 'Bypass tools and hiding', 'Risk scoring rather than blocking', 'Communicating restrictions to users'],
          quiz: [
            ['Should a rooted device be blocked outright?', 'Usually not; degrade sensitive features or raise server-side risk, since blocking is trivially bypassed and punishes power users.'],
            ['Name one jailbreak indicator on iOS.', 'The ability to open cydia:// or write outside the sandbox.'],
          ],
          prereqs: ['The attacker toolkit: decompilers, proxies and hooks'],
        },
        {
          title: 'Anti-debugging and runtime hook detection',
          description: 'Detecting attached debuggers, Frida server ports and injected libraries, checking code signatures and installer package, and the arms race this becomes, with the practical goal of raising effort and detecting mass abuse rather than stopping an expert.',
          concepts: ['Debugger detection', 'Frida and injected library checks', 'Signature and installer verification', 'Commercial RASP tools', 'Cost versus benefit of resilience'],
          quiz: [
            ['What is RASP?', 'Runtime application self-protection: in-app detection of debugging, hooking and tampering.'],
            ['What is the realistic goal of runtime protections?', 'Raising attacker cost and detecting abuse at scale, not making the app unbreakable.'],
          ],
          prereqs: ['Root and jailbreak detection and its limits'],
        },
      ],
    },
    {
      title: 'Secrets, Permissions and Privacy',
      topics: [
        {
          title: 'Secrets in apps',
          description: 'API keys in the bundle are public: strings in resources, BuildConfig, Info.plist and JavaScript bundles are all extractable, so third-party keys must be restricted by bundle id or app attestation, and privileged calls must go through your own backend.',
          concepts: ['Everything in the bundle is public', 'Restricting keys by package and signature', 'Proxying privileged APIs via a backend', 'Keeping secrets out of source control', 'Rotating leaked keys'],
          quiz: [
            ['Is a Google Maps key in the manifest a leak?', 'It is public by design; restrict it to your package name and signing certificate.'],
            ['Where does a payment provider secret key belong?', 'On your server only; the app receives short-lived client tokens.'],
          ],
          prereqs: ['Obfuscation with R8, ProGuard and Swift stripping'],
        },
        {
          title: 'Runtime permissions and purpose strings',
          description: 'Requesting the narrowest permission at the moment of need, explaining why in the purpose string or rationale, handling denial gracefully, and the scoped alternatives such as the photo picker that avoid asking at all.',
          concepts: ['Requesting in context', 'Purpose strings and rationale dialogs', 'Handling denial and do not ask again', 'Scoped alternatives: photo picker and Storage Access Framework'],
          quiz: [
            ['What happens if an iOS purpose string is missing?', 'The app crashes on access and App Review rejects it.'],
            ['How do you avoid asking for storage permission to pick a photo?', 'Use the system photo picker, which returns the chosen items without a permission.'],
          ],
          prereqs: ['The mobile threat model'],
        },
        {
          title: 'Data minimisation and privacy manifests',
          description: 'Collecting only what a feature needs, declaring collected data and required-reason API use in the iOS privacy manifest, matching the Play data safety form, and designing retention and deletion so users can leave cleanly.',
          concepts: ['Collect only what the feature needs', 'PrivacyInfo.xcprivacy and required reason APIs', 'Play data safety declarations', 'Retention and account deletion'],
          quiz: [
            ['What is a required reason API?', 'An API such as file timestamps or user defaults whose use must be justified in the privacy manifest.'],
            ['Why must the data safety form match reality?', 'Mismatches are policy violations and can get the app removed.'],
          ],
          prereqs: ['Runtime permissions and purpose strings'],
        },
        {
          title: 'Third-party SDK risk and supply chain',
          description: 'Every SDK runs with your permissions and can exfiltrate data or ship a vulnerability: vet SDKs for data practices, pin versions, verify checksums, read privacy manifests of dependencies and remove what is not used.',
          concepts: ['SDKs inherit your permissions', 'Vetting SDK data practices', 'Dependency pinning and verification', 'Dependency scanning for known CVEs', 'SDK privacy manifests'],
          quiz: [
            ['Why is an analytics SDK a privacy risk?', 'It runs inside your process with your permissions and may collect identifiers you did not intend to share.'],
            ['What does Gradle dependency verification do?', 'Checks artifact checksums or signatures against a committed verification file.'],
          ],
          prereqs: ['Data minimisation and privacy manifests'],
        },
        {
          title: 'Cryptography choices in apps',
          description: 'Using platform-vetted primitives such as AES-GCM through Keystore, CryptoKit and Tink, generating keys rather than deriving from passwords unless with a proper KDF, never hand-rolling algorithms, and avoiding ECB, static IVs and MD5.',
          concepts: ['AES-GCM and authenticated encryption', 'CryptoKit and Tink', 'Key derivation with PBKDF2 or Argon2', 'Common mistakes: ECB, static IVs, MD5'],
          quiz: [
            ['Why is AES-GCM preferred over AES-CBC?', 'It authenticates the ciphertext so tampering is detected, and avoids padding oracle issues.'],
            ['Can an IV be reused with the same GCM key?', 'No, nonce reuse breaks GCM confidentiality and authentication.'],
          ],
          prereqs: ['Database and file encryption'],
        },
      ],
    },
    {
      title: 'Security Testing and Response',
      topics: [
        {
          title: 'Static analysis with MobSF and Semgrep',
          description: 'MobSF scans an APK or IPA for insecure configuration, hard-coded secrets, weak crypto and exported components, while Semgrep and Android Lint security rules run on source in CI, so findings appear before a pentester ever sees the build.',
          concepts: ['Running a MobSF scan', 'Reading and triaging MobSF findings', 'Semgrep rules for mobile', 'Android Lint security checks', 'Static analysis in the pipeline'],
          quiz: [
            ['What inputs does MobSF accept?', 'APK, IPA, AAB or source code archives.'],
            ['Why triage rather than fix every static finding?', 'Many are informational or false positives; effort should follow exploitability.'],
          ],
          prereqs: ['OWASP Mobile Top 10'],
        },
        {
          title: 'Dynamic analysis: proxies, Frida and objection',
          description: 'Testing the running app: routing traffic through mitmproxy or Burp, bypassing pinning with objection to inspect APIs, hooking storage and crypto calls with Frida, and inspecting what really lands in files and the Keychain.',
          concepts: ['Proxy setup on device and emulator', 'Pinning bypass for testing', 'Hooking with Frida scripts', 'Inspecting storage with objection', 'Instrumented testing on rooted devices'],
          quiz: [
            ['What does objection do?', 'Wraps Frida with ready-made commands for exploring an app, dumping storage and bypassing pinning.'],
            ['Why test with pinning bypassed?', 'To see the real API surface and verify that the server, not the app, enforces authorisation.'],
          ],
          prereqs: ['Static analysis with MobSF and Semgrep', 'Certificate pinning and its risks'],
        },
        {
          title: 'Security in code review and the SDLC',
          description: 'Threat modelling new features, a security checklist in pull request templates, dependency scanning on every build, pentests before major releases, and a bug bounty or disclosure policy so external findings reach you first.',
          concepts: ['Lightweight threat modelling per feature', 'Security review checklist', 'Dependency and secret scanning in CI', 'Pentest cadence and scope', 'Vulnerability disclosure policy'],
          quiz: [
            ['What four questions drive a lightweight threat model?', 'What are we building, what can go wrong, what will we do about it, did we do a good job.'],
            ['Why publish a security.txt or disclosure policy?', 'So researchers can report issues responsibly instead of publicly.'],
          ],
          prereqs: ['Static analysis with MobSF and Semgrep'],
        },
        {
          title: 'Incident response for apps',
          description: 'A shipped app cannot be recalled: remote kill switches and forced update checks, server-side key and token revocation, remote config to disable features, and a communication plan let you contain a leak while a fix works through store review.',
          concepts: ['Forced update and minimum version checks', 'Remote feature kill switches', 'Revoking keys and sessions server-side', 'Expedited review for security fixes', 'User and regulator notification'],
          quiz: [
            ['Why does every app need a minimum supported version check?', 'So a vulnerable build can be blocked from the server side while users update.'],
            ['What is the first action when an API key leaks from an app?', 'Rotate or restrict the key server-side; the app fix follows.'],
          ],
          prereqs: ['Security in code review and the SDLC'],
        },
        {
          title: 'Fraud, abuse and bot detection',
          description: 'Scripted clients, emulator farms and credential stuffing hit the API rather than the UI; rate limits, device attestation, behavioural signals and CAPTCHA fallbacks keep abuse economics unfavourable without punishing real users.',
          concepts: ['Rate limiting per device and account', 'Attestation as an abuse signal', 'Credential stuffing defences', 'Behavioural and velocity checks'],
          quiz: [
            ['Why combine attestation with rate limits?', 'Attestation raises the cost of fake clients; rate limits bound the damage from any that pass.'],
            ['What is credential stuffing?', 'Trying leaked username and password pairs at scale against your login endpoint.'],
          ],
          prereqs: ['App integrity: Play Integrity API and App Attest'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: harden a sample banking app',
          description: 'Take an intentionally vulnerable app such as an OWASP MASTG playground or a DIVA-style sample, find its storage, network, logging and intent flaws with MobSF and manual review, then fix each one and document before and after evidence.',
          concepts: ['Scan and enumerate the flaws', 'Fix storage and logging leaks', 'Fix network and intent issues', 'Write the remediation report'],
          quiz: [
            ['What evidence proves a storage fix worked?', 'Dumping the app sandbox after the fix shows the data encrypted or absent.'],
            ['Which flaw should be fixed first?', 'The one with the highest exploitability and impact, typically credentials or tokens stored in plaintext.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: secure login with biometrics and PKCE',
          description: 'Implement login for a real backend using the authorization code flow with PKCE in a system browser, store the refresh token behind a biometric-bound key, add single-flight refresh, secure logout, and verify with a proxy that nothing sensitive is logged or sent in the clear.',
          concepts: ['Implement the PKCE flow', 'Bind the token to biometrics', 'Add refresh and logout handling', 'Verify with a proxy and hooks'],
          quiz: [
            ['What should appear in the proxy when you refresh?', 'A single refresh request with the rotated refresh token, never the password.'],
            ['How do you prove the biometric binding works?', 'Hooking the success callback with Frida must not yield a usable token.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: security pipeline and privacy manifest',
          description: 'Add MobSF and Semgrep scans, secret scanning and dependency checks to CI, generate the iOS privacy manifest and Play data safety answers from a documented data inventory, and write the incident runbook with a forced-update switch.',
          concepts: ['Wire scanners into CI', 'Build the data inventory', 'Produce privacy declarations', 'Write the incident runbook'],
          quiz: [
            ['What should block a merge in this pipeline?', 'Leaked secrets, high-severity Semgrep findings and vulnerable dependencies.'],
            ['What goes in the data inventory?', 'Every data type collected, why, where it is stored, who receives it and how long it is kept.'],
          ],
          style: 'project',
        },
        {
          title: 'Mobile security interview questions',
          description: 'Explaining the threat model, where a token should live, how pinning fails, why root detection is a signal not a wall, the OWASP list from memory, and what you would do in the first hour after a key leak.',
          concepts: ['Threat model explanations', 'Storage and token questions', 'Network and pinning questions', 'Incident response scenarios'],
          quiz: [
            ['Where do you store a refresh token on Android?', 'Encrypted with a hardware-backed Keystore key, ideally bound to user authentication.'],
            ['An attacker bypassed your pinning. What did they gain?', 'Visibility of the API; if the server enforces authorisation and validation, nothing more.'],
          ],
          style: 'reading',
        },
        {
          title: 'Security review exercises',
          description: 'Practising live reviews: reading a manifest for exported components, spotting a hard-coded key in a diff, critiquing a login flow using a WebView and custom scheme, and designing storage for a health record feature.',
          concepts: ['Manifest and plist review', 'Spotting secrets in diffs', 'Critiquing an auth flow', 'Designing storage for sensitive data'],
          quiz: [
            ['What is wrong with a login WebView redirecting to myapp://callback?', 'The app can read the credentials and any app can claim the scheme to steal the code.'],
            ['What do you check first in an Android manifest?', 'Exported components, backup settings, cleartext traffic and permissions.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
