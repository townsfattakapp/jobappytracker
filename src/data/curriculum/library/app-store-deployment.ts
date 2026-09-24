import { defineTrack } from '../define'

export const appStoreDeployment = defineTrack({
  id: 'track-app-store-deployment',
  title: 'App Store and Play Store Deployment',
  description: 'Getting an app from a build to users and keeping it there: identifiers and versioning, certificates, provisioning profiles and keystores, store listings and privacy forms, review guidelines and rejections, TestFlight and Play testing tracks, staged rollouts, in-app purchases, analytics, Fastlane and CI automation, over-the-air updates and hotfix management.',
  family: 'Mobile Development',
  kind: 'tooling',
  icon: '🚀',
  tags: ['mobile', 'app store', 'play store', 'fastlane', 'testflight', 'signing', 'release management', 'ci', 'codepush', 'eas'],
  languages: ['Bash', 'YAML'],
  explainMode: 'concept',
  code: { label: 'shell and YAML (Fastlane, CI)', id: 'bash', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'App Identity and Build Configuration',
      description: 'The names, numbers and variants that stores use to tell your builds apart.',
      topics: [
        {
          title: 'App identifiers and bundle configuration',
          description: 'The applicationId on Android and the bundle identifier on iOS are permanent once published: how they are registered in the developer portals, why suffixes give debug builds their own identity, and how a wrong id blocks an upload.',
          concepts: ['applicationId and bundle identifier', 'Registering ids in the developer portals', 'Debug and staging id suffixes', 'Package name and namespace on Android'],
          quiz: [
            ['Can you change the applicationId after publishing?', 'No; a different id is a different app and users cannot update to it.'],
            ['Why give debug builds a .debug suffix?', 'So they install alongside the production app and use separate push and OAuth registrations.'],
          ],
        },
        {
          title: 'Versioning and build numbers',
          description: 'versionName and CFBundleShortVersionString are what users see; versionCode and CFBundleVersion must strictly increase per upload, so a monotonically increasing build number generated from CI, not by hand, avoids rejected uploads.',
          concepts: ['User-facing version versus build number', 'Monotonic build numbers from CI', 'Semantic versioning for apps', 'Version code per ABI split'],
          quiz: [
            ['What happens if you upload a build with an equal versionCode?', 'Play rejects it; every upload needs a higher versionCode.'],
            ['What is CFBundleVersion?', 'The iOS build number, which must be unique per version string within a train.'],
          ],
          prereqs: ['App identifiers and bundle configuration'],
        },
        {
          title: 'Build variants, flavours and schemes',
          description: 'Android build types and product flavours and Xcode schemes and configurations produce debug, staging and release builds from one codebase with different endpoints, ids and signing, keeping release-only settings out of everyday builds.',
          concepts: ['Build types and product flavours', 'Xcode schemes and configurations', 'Per-variant endpoints and ids', 'Release-only settings'],
          quiz: [
            ['What does a product flavour change that a build type does not?', 'Product identity such as applicationId, resources and features; build types change debuggability and signing.'],
            ['How does an Xcode scheme pick a configuration?', 'Each scheme action, such as Run or Archive, is mapped to a configuration like Debug or Release.'],
          ],
          prereqs: ['Versioning and build numbers'],
        },
        {
          title: 'Environment configuration and secrets in builds',
          description: 'Endpoints, feature flags and API keys flow into builds through BuildConfig fields, xcconfig files, dart-define and .env files, sourced from CI secrets rather than committed files, and never baked into a release with a staging value.',
          concepts: ['BuildConfig and xcconfig', 'dart-define and .env handling', 'CI secrets as the source', 'Guarding against staging leaks'],
          quiz: [
            ['Why keep the keystore password out of gradle.properties in git?', 'Committed secrets leak through history and forks; CI should inject them.'],
            ['How does a Flutter build receive an endpoint?', 'With --dart-define=API_URL=... read via String.fromEnvironment.'],
          ],
          prereqs: ['Build variants, flavours and schemes'],
        },
      ],
    },
    {
      title: 'Signing',
      topics: [
        {
          title: 'iOS certificates and provisioning profiles',
          description: 'A distribution certificate proves the team, an App ID declares capabilities, and a provisioning profile ties them together with allowed devices; expired or mismatched pieces produce the errors every iOS developer eventually meets.',
          concepts: ['Development versus distribution certificates', 'App IDs and capabilities', 'Provisioning profile types', 'Diagnosing signing errors'],
          quiz: [
            ['Which profile type does App Store submission use?', 'An App Store distribution profile.'],
            ['What is inside a provisioning profile?', 'The App ID, certificate references, entitlements and, for ad hoc or development, device UDIDs.'],
          ],
          prereqs: ['App identifiers and bundle configuration'],
        },
        {
          title: 'Fastlane match and shared signing',
          description: 'match stores encrypted certificates and profiles in a git repository or cloud bucket so every developer and CI machine uses the same identity, replacing per-machine certificates that expire and break builds unpredictably.',
          concepts: ['match repository and encryption', 'Readonly mode on CI', 'Renewing and nuking certificates', 'Automatic signing versus match'],
          quiz: [
            ['Why run match with readonly on CI?', 'So CI never creates new certificates and only installs what exists.'],
            ['What does match nuke do?', 'Revokes all certificates and profiles of a type so they can be regenerated cleanly.'],
          ],
          prereqs: ['iOS certificates and provisioning profiles'],
        },
        {
          title: 'Android keystores and upload keys',
          description: 'A keystore holds the key that signs the app; losing it once meant losing the app, so the upload key signs what you send to Play while Play holds the app signing key, and keystore files and passwords need backups outside the repo.',
          concepts: ['keytool and keystore creation', 'Upload key versus app signing key', 'Signing configs in Gradle', 'Backing up keystores safely'],
          quiz: [
            ['What command generates a keystore?', 'keytool -genkeypair with a keystore path, alias and key algorithm.'],
            ['What can you do if you lose the upload key?', 'Request an upload key reset in Play Console with a new key, since Play holds the app signing key.'],
          ],
          prereqs: ['App identifiers and bundle configuration'],
        },
        {
          title: 'Play App Signing',
          description: 'Google holds the app signing key and re-signs every App Bundle for distribution, enabling split APKs and key upgrades; enrolment is required for new apps, and the certificate fingerprint matters for API restrictions and App Links.',
          concepts: ['Enrolling in Play App Signing', 'Signing key upgrade', 'App signing certificate fingerprint', 'Deriving APKs from the bundle'],
          quiz: [
            ['Which SHA-256 fingerprint goes in assetlinks.json?', 'The app signing certificate from Play Console, not the upload key.'],
            ['Why is Play App Signing required for App Bundles?', 'Play must sign the per-device APKs it generates from the bundle.'],
          ],
          prereqs: ['Android keystores and upload keys'],
        },
        {
          title: 'Entitlements and capabilities',
          description: 'Push notifications, associated domains, app groups, Sign in with Apple and background modes must be enabled on the App ID and appear in the entitlements file, and a mismatch between the two fails installation or the feature silently.',
          concepts: ['Entitlements file and App ID parity', 'Push notification certificates and keys', 'Associated domains for links', 'App groups and extensions'],
          quiz: [
            ['What does an APNs auth key replace?', 'Per-app push certificates that expire yearly; one key serves all apps of the team.'],
            ['Why would Universal Links stop working after a signing change?', 'The associated-domains entitlement was missing from the new profile.'],
          ],
          prereqs: ['iOS certificates and provisioning profiles'],
        },
      ],
    },
    {
      title: 'Store Presence and Privacy',
      topics: [
        {
          title: 'Store listings and assets',
          description: 'Titles, subtitles and descriptions with the keyword limits each store enforces, icon requirements, screenshot sizes per device class, preview videos and feature graphics, all of which can be tested and updated without a new binary.',
          concepts: ['Title, subtitle and keyword fields', 'Icon specifications', 'Screenshot sizes per device class', 'Preview videos and feature graphics'],
          quiz: [
            ['How long can an App Store title be?', '30 characters.'],
            ['Which iOS screenshot sizes are required?', 'At least the 6.9 inch and 6.5 inch iPhone sets, plus iPad if the app supports it.'],
          ],
        },
        {
          title: 'Localising the listing and store experiments',
          description: 'Localised metadata and screenshots lift conversion in each market; Play store listing experiments A/B test icons and screenshots, and custom store listings target countries or install sources with different messaging.',
          concepts: ['Localised metadata per market', 'Play store listing experiments', 'Custom store listings', 'Measuring conversion in Play and App Store Connect'],
          quiz: [
            ['What can a Play listing experiment test?', 'Icons, screenshots, feature graphics and descriptions against a control.'],
            ['What is a custom store listing?', 'A variant of the listing shown to users in chosen countries or arriving from a chosen URL.'],
          ],
          prereqs: ['Store listings and assets'],
        },
        {
          title: 'Privacy policies and account deletion',
          description: 'Both stores require a public privacy policy URL that describes real collection, and apps with account creation must offer in-app account deletion; missing or mismatched policies are among the most common reasons a submission stalls.',
          concepts: ['Writing an accurate privacy policy', 'Policy URL requirements', 'In-app account deletion', 'Children and age-gating rules'],
          quiz: [
            ['Does an app that offers sign-up need account deletion?', 'Yes, both Apple and Google require it in the app or a linked flow.'],
            ['Where must the privacy policy be visible?', 'In the store listing and inside the app.'],
          ],
        },
        {
          title: 'App privacy labels and the Play data safety form',
          description: 'The App Store nutrition label and the Play data safety section declare each data type collected, its purpose and whether it is linked or used for tracking, including data collected by SDKs, and must match the privacy manifest.',
          concepts: ['Data types and purposes', 'Linked and tracking declarations', 'Including SDK-collected data', 'Keeping declarations in sync'],
          quiz: [
            ['Who is responsible for data an analytics SDK collects?', 'The app developer, who must declare it.'],
            ['What happens if the data safety form is missing at deadline?', 'Updates are rejected until it is completed.'],
          ],
          prereqs: ['Privacy policies and account deletion'],
        },
        {
          title: 'Content ratings and export compliance',
          description: 'The IARC questionnaire on Play and the age rating questions in App Store Connect determine the rating shown in each region, and the encryption export question decides whether an app needs documentation, with the standard exemption for HTTPS.',
          concepts: ['IARC questionnaire', 'App Store age ratings', 'Export compliance and encryption', 'Regional availability'],
          quiz: [
            ['Does using only HTTPS require export documentation?', 'No, standard encryption qualifies for the exemption; set ITSAppUsesNonExemptEncryption to false.'],
            ['What is IARC?', 'The International Age Rating Coalition questionnaire that produces regional ratings on Play.'],
          ],
        },
      ],
    },
    {
      title: 'Review and Policy',
      topics: [
        {
          title: 'App Store Review Guidelines',
          description: 'The rules App Review applies: completeness, accurate metadata, minimum functionality, business model rules for digital goods, login requirements such as Sign in with Apple, and design expectations, with the review typically taking one to two days.',
          concepts: ['Safety, performance and business sections', 'Digital goods and in-app purchase rules', 'Sign in with Apple requirement', 'Metadata accuracy'],
          quiz: [
            ['When must an app offer Sign in with Apple?', 'When it offers third-party social login such as Google or Facebook.'],
            ['Can an app sell an ebook with a credit card form?', 'No, digital content consumed in the app must use in-app purchase.'],
          ],
          prereqs: ['Store listings and assets'],
        },
        {
          title: 'Common App Store rejections and how to avoid them',
          description: 'Crashes on launch, incomplete demo accounts, placeholder content, missing purpose strings, broken links, mismatched screenshots and requests for unneeded permissions cause most rejections, and each has a checklist item that prevents it.',
          concepts: ['Demo account and review notes', 'Purpose strings and permissions', 'Placeholder and beta content', 'Responding in Resolution Center', 'Appeals and expedited review'],
          quiz: [
            ['What should the review notes include for a login app?', 'A working demo account and steps to reach every gated feature.'],
            ['What is the fastest response to a metadata rejection?', 'Fix the metadata in App Store Connect and resubmit without a new binary.'],
          ],
          prereqs: ['App Store Review Guidelines'],
        },
        {
          title: 'Google Play policies and requirements',
          description: 'Target API level deadlines, sensitive permission declarations for SMS, location and accessibility, the families policy, deceptive behaviour rules, and Play Billing for digital goods, enforced by automated and manual review with escalating penalties.',
          concepts: ['Target API level requirements', 'Sensitive permission declarations', 'Families and content policies', 'Play Billing requirement', 'Policy violation notices'],
          quiz: [
            ['What is the target API deadline rule?', 'New apps and updates must target an API level within one year of the latest Android release.'],
            ['Which permission needs a declaration form on Play?', 'Background location, SMS and call log, all files access and accessibility services, among others.'],
          ],
          prereqs: ['Store listings and assets'],
        },
        {
          title: 'Developer accounts and verification',
          description: 'Organisation accounts need a D-U-N-S number on Apple and identity or organisation verification on Google, new personal Play accounts must run a closed test with 12 testers for 14 days, and account ownership decides who can ship.',
          concepts: ['Individual versus organisation accounts', 'D-U-N-S and identity verification', 'Play closed testing requirement for new accounts', 'Roles, permissions and account ownership'],
          quiz: [
            ['What must a new personal Play developer account do before production?', 'Run a closed test with at least 12 testers opted in for 14 continuous days.'],
            ['Why should the developer account not belong to one employee?', 'Leaving employees lock the team out of publishing and payouts.'],
          ],
        },
      ],
    },
    {
      title: 'Testing Tracks and Rollouts',
      topics: [
        {
          title: 'TestFlight distribution',
          description: 'Uploading builds for internal testers on the team and up to 10,000 external testers via public links, the beta review that external builds go through, 90-day expiry, and collecting crashes and screenshots with tester feedback.',
          concepts: ['Internal and external tester groups', 'Beta App Review', 'Public links and build expiry', 'Tester feedback and crash collection'],
          quiz: [
            ['How long does a TestFlight build stay installable?', '90 days.'],
            ['Do internal TestFlight builds need beta review?', 'No, only builds for external testers.'],
          ],
          prereqs: ['iOS certificates and provisioning profiles'],
        },
        {
          title: 'Play internal, closed and open testing',
          description: 'Internal testing reaches 100 testers within minutes without review, closed tracks target email lists or Google Groups, open testing lets anyone opt in from the listing, and promotion moves the same build up the tracks to production.',
          concepts: ['Internal testing track', 'Closed tracks and tester lists', 'Open testing and opt-in', 'Promoting builds between tracks'],
          quiz: [
            ['Which Play track skips review delays?', 'Internal testing.'],
            ['Can a closed-test build be promoted to production unchanged?', 'Yes, the same artifact is promoted, so no rebuild is needed.'],
          ],
          prereqs: ['Play App Signing'],
        },
        {
          title: 'Staged rollouts and phased release',
          description: 'Play staged rollouts release to a chosen percentage that you raise or halt, and App Store phased release moves through seven days automatically with pause, so crashes hit a small slice first and vitals decide whether to continue.',
          concepts: ['Percentage rollouts on Play', 'Phased release on the App Store', 'Halting and resuming', 'Rollout criteria from vitals'],
          quiz: [
            ['What happens when you halt a staged rollout?', 'No new users receive the build; those who already updated keep it.'],
            ['What percentage does App Store phased release start at?', '1 per cent on day one, reaching 100 per cent on day seven.'],
          ],
          prereqs: ['Play internal, closed and open testing', 'TestFlight distribution'],
        },
        {
          title: 'Feature flags and remote config',
          description: 'Shipping code dark behind flags decouples deploy from release: Firebase Remote Config, LaunchDarkly or a home-grown flag service turn features on per segment, kill a broken feature without a store update, and support gradual exposure.',
          concepts: ['Deploy versus release', 'Remote Config and flag services', 'Kill switches', 'Flag cleanup discipline'],
          quiz: [
            ['Why is a kill switch essential for mobile?', 'A store update takes hours or days to reach users; a flag flips instantly.'],
            ['What is the risk of never removing old flags?', 'Dead branches multiply, tests combine badly and behaviour becomes hard to reason about.'],
          ],
          prereqs: ['Staged rollouts and phased release'],
        },
        {
          title: 'Forcing and encouraging updates',
          description: 'Play In-App Updates offer immediate and flexible flows inside the app, iOS has no equivalent so a minimum-version check against a remote endpoint drives a prompt, and both need a policy for how old a version may run.',
          concepts: ['Play In-App Updates immediate and flexible', 'Minimum version checks', 'Update prompts on iOS', 'Deprecation policy for old versions'],
          quiz: [
            ['What is a flexible in-app update?', 'A background download with the user choosing when to restart, unlike the blocking immediate flow.'],
            ['How do you force an update on iOS?', 'Compare the running version against a remote minimum and block with a link to the App Store.'],
          ],
          prereqs: ['Feature flags and remote config'],
        },
      ],
    },
    {
      title: 'Monetisation and Measurement',
      topics: [
        {
          title: 'In-app purchase setup with StoreKit 2 and Play Billing',
          description: 'Creating products in App Store Connect and Play Console, loading them with StoreKit 2 and the Play Billing Library, handling purchase flows and pending states, and testing with sandbox accounts and license testers before anything goes live.',
          concepts: ['Product types: consumable, non-consumable, subscription', 'StoreKit 2 purchase flow', 'Play Billing Library flow', 'Sandbox and license testers', 'Restoring purchases'],
          quiz: [
            ['Which purchase must always be restorable?', 'Non-consumables and subscriptions.'],
            ['What is a pending purchase on Play?', 'A transaction awaiting completion, such as cash payment at a store, that must not be granted yet.'],
          ],
          prereqs: ['Google Play policies and requirements', 'App Store Review Guidelines'],
        },
        {
          title: 'Subscriptions and server-side validation',
          description: 'Subscription groups, introductory offers and grace periods, verifying receipts and purchase tokens on your server, and handling App Store Server Notifications and Real-time Developer Notifications for renewals, refunds and cancellations.',
          concepts: ['Subscription groups and offers', 'Server-side receipt and token verification', 'App Store Server Notifications and RTDN', 'Grace periods and billing retry', 'RevenueCat as an alternative'],
          quiz: [
            ['Why validate purchases on the server?', 'The client can be modified to claim entitlements it did not buy.'],
            ['What does a grace period do?', 'Keeps access while a failed renewal payment is retried.'],
          ],
          prereqs: ['In-app purchase setup with StoreKit 2 and Play Billing'],
        },
        {
          title: 'App analytics and store metrics',
          description: 'App Store Connect analytics and Play Console statistics show impressions, conversion, installs, retention and revenue per country and version, while Firebase or Amplitude event analytics trace what users do after install.',
          concepts: ['Impressions and conversion rates', 'Installs, uninstalls and retention', 'Event analytics in the app', 'Attribution and campaign links'],
          quiz: [
            ['What is store conversion rate?', 'Installs divided by listing views or impressions.'],
            ['Why track retention by version?', 'To catch a release that drives users away before it reaches everyone.'],
          ],
          prereqs: ['Localising the listing and store experiments'],
        },
        {
          title: 'Crash reporting and vitals after release',
          description: 'Crashlytics or Sentry with uploaded dSYMs and mapping files show readable stacks minutes after a rollout starts, and Android vitals and Xcode Organizer report crash rates, ANRs and hangs that gate whether a rollout continues.',
          concepts: ['dSYM and mapping upload in the pipeline', 'Crash-free rate per version', 'Android vitals and Xcode Organizer', 'Alerts on new crash clusters'],
          quiz: [
            ['What breaks if dSYMs are not uploaded?', 'Crash stacks show memory addresses instead of symbol names.'],
            ['Which vitals metric can reduce Play visibility?', 'User-perceived crash rate above 1.09 per cent or ANR rate above 0.47 per cent.'],
          ],
          prereqs: ['Staged rollouts and phased release'],
        },
      ],
    },
    {
      title: 'Automation and Release Management',
      topics: [
        {
          title: 'Fastlane for building and uploading',
          description: 'gym and gradle produce signed artifacts, pilot and upload_to_testflight push to TestFlight, deliver and supply update metadata and upload to the App Store and Play, and an App Store Connect API key replaces interactive Apple logins.',
          concepts: ['gym and gradle actions', 'pilot and upload_to_testflight', 'deliver and supply', 'App Store Connect API keys', 'Lanes for beta and release'],
          quiz: [
            ['What does supply upload?', 'Android APKs or bundles plus listing metadata and screenshots to Play Console.'],
            ['Why use an App Store Connect API key on CI?', 'It avoids two-factor prompts tied to a personal Apple ID.'],
          ],
          prereqs: ['Fastlane match and shared signing', 'Android keystores and upload keys'],
        },
        {
          title: 'GitHub Actions pipelines for release',
          description: 'Tag-triggered workflows that check out, install match certificates or decode a keystore from secrets, bump build numbers, build, upload to a testing track and post the changelog, with concurrency guards so two releases never race.',
          concepts: ['Tag and branch triggers', 'Decoding keystores from secrets', 'Build number bumps in CI', 'Concurrency and environment protection'],
          quiz: [
            ['How do you get a keystore file into a GitHub Actions job?', 'Store it base64-encoded in a secret and decode it to a file at runtime.'],
            ['What is a GitHub environment used for in releases?', 'Required reviewers and protected secrets for the production upload step.'],
          ],
          prereqs: ['Fastlane for building and uploading'],
        },
        {
          title: 'EAS Build and Submit for Expo and React Native',
          description: 'Expo Application Services build iOS and Android binaries in the cloud with managed credentials, submit them to both stores, and use build profiles for development, preview and production, so a React Native team can ship without a local Mac.',
          concepts: ['eas.json build profiles', 'Managed credentials', 'eas submit to both stores', 'Internal distribution builds'],
          quiz: [
            ['What does a preview build profile produce?', 'An internal distribution binary installable on test devices without the stores.'],
            ['Where do EAS credentials live?', 'On Expo servers, or locally via credentials.json if you opt out.'],
          ],
          prereqs: ['Fastlane for building and uploading'],
        },
        {
          title: 'Over-the-air updates with CodePush and EAS Update',
          description: 'JavaScript bundles and assets can update without a store release through EAS Update or CodePush, within the store rule that behaviour must not change materially, with runtime versions and rollbacks keeping native and JS compatible.',
          concepts: ['What OTA can and cannot change', 'Runtime versions and compatibility', 'Channels and branches', 'Rollback of a bad update', 'Store policy limits on OTA'],
          quiz: [
            ['Can an OTA update add a native module?', 'No, native code needs a store release; OTA covers JS and assets only.'],
            ['What is a runtime version in EAS Update?', 'A label pinning which native build an update is compatible with.'],
          ],
          prereqs: ['EAS Build and Submit for Expo and React Native'],
        },
        {
          title: 'Release trains and branching',
          description: 'A fixed cadence such as a two-week train with a cut date, a release branch that only takes fixes, a changelog and release notes for both stores, and a release captain role, so features never hold the train and releases stop being events.',
          concepts: ['Release cadence and cut dates', 'Release branches and cherry-picks', 'Changelogs and store release notes', 'Release captain rotation'],
          quiz: [
            ['What is the benefit of a fixed release train?', 'Predictability: features that miss the cut wait for the next train instead of delaying this one.'],
            ['Where do release notes for Play come from in an automated pipeline?', 'Files under fastlane/metadata/android/<locale>/changelogs named by versionCode.'],
          ],
          prereqs: ['GitHub Actions pipelines for release'],
        },
        {
          title: 'Hotfixes and expedited review',
          description: 'When a bad build reaches users: halt the rollout, flip kill switches, branch from the release tag, ship a minimal fix with a bumped build number, request expedited App Review with a justification, and write the post-mortem.',
          concepts: ['Halt first, then fix', 'Minimal hotfix branches', 'Requesting expedited review', 'Post-mortems and prevention'],
          quiz: [
            ['Can you roll back an App Store release to the previous version?', 'No; you must ship a new version, which is why halting phased release and kill switches matter.'],
            ['What justifies an expedited review request?', 'A critical bug or security issue affecting many users, explained specifically in the request.'],
          ],
          prereqs: ['Release trains and branching', 'Feature flags and remote config'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: ship an app to TestFlight and Play internal testing',
          description: 'Take any small app through the real pipeline: register ids, set up match and an upload keystore, configure variants, write a Fastfile with beta lanes, upload to TestFlight and Play internal testing, and invite a tester who installs it.',
          concepts: ['Register identifiers and signing', 'Configure variants and versioning', 'Write beta lanes', 'Distribute to a tester'],
          quiz: [
            ['What proves the project is done?', 'A tester installs the build from TestFlight and from the Play internal testing link.'],
            ['Which lane action uploads to TestFlight?', 'pilot or upload_to_testflight.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: release pipeline with staged rollout and hotfix drill',
          description: 'Build a tag-triggered GitHub Actions workflow that bumps build numbers, builds both platforms, uploads dSYMs and mapping files, starts a 10 per cent staged rollout, and then rehearse a hotfix from the release tag through expedited review.',
          concepts: ['Automate the release workflow', 'Wire crash symbol uploads', 'Start and monitor a rollout', 'Run the hotfix drill'],
          quiz: [
            ['What must the workflow do before building?', 'Increment the build number and install signing credentials.'],
            ['What is the first step of the hotfix drill?', 'Halt the staged rollout.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: store-ready listing and compliance pack',
          description: 'Prepare a complete submission for a real or sample app: localised listing in two languages, screenshots per device class, privacy policy, App Store privacy labels and Play data safety answers, content ratings, and a review notes document with a demo account.',
          concepts: ['Write and localise the listing', 'Produce screenshot sets', 'Complete privacy and rating forms', 'Prepare review notes'],
          quiz: [
            ['What must the review notes contain?', 'A demo account, how to reach gated features and any hardware or region caveats.'],
            ['How many languages should the listing cover here?', 'Two, with screenshots localised for each.'],
          ],
          style: 'project',
        },
        {
          title: 'Deployment interview questions',
          description: 'Explaining the signing model on both platforms, why build numbers must increase, how you would run a safe rollout, what OTA updates may change, common rejection causes, and how you handled a broken release in production.',
          concepts: ['Signing model explanations', 'Rollout strategy questions', 'Policy and rejection questions', 'Incident walkthroughs'],
          quiz: [
            ['A release crashes for 2 per cent of users at 10 per cent rollout. What do you do?', 'Halt the rollout, flip any flag covering the feature, hotfix from the release tag and resume with a new build.'],
            ['Why can Play App Signing be safer than holding your own key?', 'Google secures the app signing key and can rotate it; a lost self-held key used to mean a new app.'],
          ],
          style: 'reading',
        },
        {
          title: 'Release pipeline design exercises',
          description: 'Practising the whiteboard version: sketch a pipeline from pull request to production for a React Native app with OTA, list the secrets it needs and where they live, and decide a rollout and rollback plan for a payments feature.',
          concepts: ['Sketching pull request to production', 'Enumerating secrets and their storage', 'Planning rollout and rollback', 'Choosing OTA versus store release'],
          quiz: [
            ['Which secrets does an iOS release job need?', 'match repository access and passphrase, an App Store Connect API key and any service credentials.'],
            ['Should a payments change ship via OTA?', 'Usually not; it deserves a store release with staged rollout and feature flag, since OTA rollback is limited to the JS layer.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
