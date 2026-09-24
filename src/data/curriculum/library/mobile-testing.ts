import { defineTrack } from '../define'

export const mobileTesting = defineTrack({
  id: 'track-mobile-testing',
  title: 'Mobile Testing',
  description: 'Testing mobile apps on Android, iOS, Flutter and React Native: the pyramid, unit tests for view models and async code, UI tests with Espresso, Compose, XCUITest, Flutter and Detox, snapshot tests, device farms, flaky test control, accessibility and performance checks, beta channels and CI with Fastlane, GitHub Actions and Bitrise.',
  family: 'Mobile Development',
  kind: 'domain',
  icon: '🧪',
  tags: ['mobile', 'testing', 'espresso', 'xcuitest', 'flutter', 'detox', 'snapshot testing', 'fastlane', 'ci'],
  languages: ['Kotlin', 'Swift', 'Dart', 'TypeScript'],
  explainMode: 'concept',
  code: { label: 'the platform language (Kotlin, Swift, Dart or TypeScript)', id: 'plaintext', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Testing Strategy for Mobile',
      description: 'Where each kind of test earns its keep on a platform where UI tests are slow and devices are many.',
      topics: [
        {
          title: 'The testing pyramid for mobile',
          description: 'Why mobile leans harder on the pyramid than the web: UI tests need an emulator and take seconds each, so logic moves into testable classes, integration tests cover the seams, and a thin end-to-end layer guards the critical flows.',
          concepts: ['Unit, integration and end-to-end layers', 'Cost of emulator-bound tests', 'Critical-path end-to-end coverage', 'Local versus instrumented tests'],
          quiz: [
            ['What separates a local test from an instrumented test on Android?', 'Local tests run on the JVM; instrumented tests run on a device or emulator with the Android framework.'],
            ['Why keep the end-to-end layer thin?', 'Each test is slow and flaky-prone, so only the flows that must never break belong there.'],
          ],
        },
        {
          title: 'Testable architecture: separating UI from logic',
          description: 'MVVM, MVI and Bloc exist partly so that business rules can be tested without rendering a screen: a view model exposing state is checked by a plain unit test, while the view becomes a thin mapping from state to widgets.',
          concepts: ['View model as the unit under test', 'Unidirectional data flow', 'Thin views and pure mappers', 'Repositories behind interfaces'],
          quiz: [
            ['What does a view model test assert?', 'That given inputs and fake dependencies, the emitted state and side effects are correct.'],
            ['Why avoid Android or UIKit types in a view model?', 'They force instrumented tests and hide the logic behind framework setup.'],
          ],
          prereqs: ['The testing pyramid for mobile'],
        },
        {
          title: 'Test doubles and dependency injection for tests',
          description: 'Fakes, stubs, mocks and spies and when each is honest: injecting a fake repository through Hilt, Koin, Swift initialisers or Provider overrides so tests control inputs, and why fakes usually beat mocks for readability.',
          concepts: ['Fake, stub, mock and spy', 'Constructor injection for testability', 'Hilt and Koin test modules', 'Overriding providers in Flutter and React Native', 'MockK, Mockito and Swift protocols'],
          quiz: [
            ['What is the difference between a fake and a mock?', 'A fake is a working lightweight implementation; a mock records calls and verifies interactions.'],
            ['How does Hilt swap a dependency in tests?', 'With @TestInstallIn or @UninstallModules and a replacement test module.'],
          ],
          prereqs: ['Testable architecture: separating UI from logic'],
        },
        {
          title: 'Test data, fixtures and builders',
          description: 'Building readable test inputs with factory functions and builder defaults, keeping fixtures small and named by intent, and sharing JSON response fixtures between unit and UI tests so one contract change is felt everywhere.',
          concepts: ['Factory functions with defaults', 'Named fixtures by scenario', 'Shared JSON response fixtures', 'Golden data for regression tests'],
          quiz: [
            ['Why use a builder with defaults for a test model?', 'Each test states only the fields that matter, keeping intent clear and updates cheap.'],
            ['Where should API response fixtures live?', 'In a shared test resources folder used by both network unit tests and UI tests.'],
          ],
        },
      ],
    },
    {
      title: 'Unit Testing',
      topics: [
        {
          title: 'Unit testing view models',
          description: 'Driving a view model with inputs and fake repositories, collecting emitted state with Turbine, XCTest expectations or Bloc test, and asserting on the sequence of states rather than a final snapshot.',
          concepts: ['Arrange, act, assert for view models', 'Collecting state flows with Turbine', 'XCTest expectations for async state', 'bloc_test and Riverpod container tests', 'Asserting state sequences'],
          quiz: [
            ['What does Turbine add to a StateFlow test?', 'A way to await and assert each emitted item in order with timeouts.'],
            ['Why assert on the sequence of states?', 'Loading, success and error transitions are part of the behaviour, not just the final value.'],
          ],
          prereqs: ['Test doubles and dependency injection for tests'],
        },
        {
          title: 'Testing coroutines, async and streams',
          description: 'Controlling asynchronous code: runTest with a TestDispatcher and Main dispatcher rule on Android, async XCTest with actors and continuations, fakeAsync and pump in Dart, and fake timers in Jest.',
          concepts: ['runTest and TestDispatcher', 'Replacing Dispatchers.Main', 'Async XCTest and MainActor', 'fakeAsync and pump in Dart', 'Jest fake timers'],
          quiz: [
            ['Why does a view model test need a Main dispatcher rule?', 'Dispatchers.Main is unavailable on the JVM, so it must be replaced with a test dispatcher.'],
            ['What does advanceUntilIdle do?', 'Runs all scheduled coroutine work on the test scheduler until nothing is pending.'],
          ],
          prereqs: ['Unit testing view models'],
        },
        {
          title: 'Testing time, clocks and randomness',
          description: 'Injecting a Clock, TimeProvider or Random source instead of calling the system directly so tests of expiry, debounce and retry backoff are deterministic and run instantly rather than sleeping.',
          concepts: ['Injecting a clock', 'Deterministic random sources', 'Testing debounce and backoff', 'Frozen time in fixtures'],
          quiz: [
            ['How do you test a five-minute token expiry without waiting?', 'Inject a fake clock and advance it past the expiry.'],
            ['Why is Thread.sleep in a test a smell?', 'It slows the suite and still races on slow CI machines.'],
          ],
          prereqs: ['Testing coroutines, async and streams'],
        },
        {
          title: 'Testing the network layer',
          description: 'Running the real HTTP client against a local fake server such as MockWebServer, a URLProtocol stub, or a mocked http Client in Dart, to check request shape, header handling, JSON parsing and error mapping without hitting production.',
          concepts: ['MockWebServer request assertions', 'URLProtocol stubs in Swift', 'MockClient in Dart and msw in React Native', 'Parsing and error-mapping tests', 'Timeout and retry behaviour'],
          quiz: [
            ['What does MockWebServer let you assert?', 'The exact request path, method, headers and body the client sent.'],
            ['Why test JSON parsing against recorded responses?', 'To catch schema drift and nullability mistakes before they crash users.'],
          ],
          prereqs: ['Test doubles and dependency injection for tests'],
        },
        {
          title: 'Testing persistence and migrations',
          description: 'Using in-memory Room, Core Data or SwiftData stores and sqflite_common_ffi to test DAOs and repositories quickly, and verifying schema migrations with exported schemas so an upgrade never wipes a user database.',
          concepts: ['In-memory Room and Core Data stores', 'sqflite tests with ffi', 'DAO and repository round-trips', 'Migration tests with exported schemas', 'Testing caching policies'],
          quiz: [
            ['What does MigrationTestHelper do in Room?', 'Creates a database at an old schema version and validates the migration to the new one.'],
            ['Why test with an in-memory database rather than mocks?', 'The real SQL and mapping are exercised, which is where bugs live.'],
          ],
          prereqs: ['Testing the network layer'],
        },
        {
          title: 'Mutation testing and coverage limits',
          description: 'Line coverage says which code ran, not whether assertions would catch a bug; mutation tools such as Pitest and muter flip operators to reveal weak tests, and coverage targets work only as a floor, not a goal.',
          concepts: ['Line versus branch coverage', 'Mutation testing with Pitest or muter', 'Coverage as a floor', 'Finding untested error paths'],
          quiz: [
            ['What does a surviving mutant mean?', 'A code change that no test detected, so the tests around it are weak.'],
            ['Can 100 per cent coverage still miss bugs?', 'Yes; coverage only proves the lines executed, not that outputs were checked.'],
          ],
        },
      ],
    },
    {
      title: 'UI Testing',
      topics: [
        {
          title: 'Espresso for Android views',
          description: 'Finding views with ViewMatchers, acting with ViewActions and asserting with ViewAssertions, why Espresso waits for the main thread and idling resources, and how to test RecyclerView items and intents.',
          concepts: ['onView, matchers, actions and assertions', 'Automatic main-thread synchronisation', 'IdlingResource for background work', 'RecyclerView actions', 'Intents testing with intended'],
          quiz: [
            ['Why does Espresso need an IdlingResource?', 'It only waits for the main looper; background work must signal when it is idle.'],
            ['Which class targets a list item in Espresso?', 'RecyclerViewActions.actionOnItemAtPosition.'],
          ],
          prereqs: ['The testing pyramid for mobile'],
        },
        {
          title: 'Compose UI testing',
          description: 'Using ComposeTestRule to set content, find nodes by text, tag or semantics, perform clicks and text input, and assert state, with the semantics tree as the contract between accessibility and tests.',
          concepts: ['createComposeRule and setContent', 'Finding nodes by semantics and test tags', 'Actions and assertions on nodes', 'Synchronisation with Compose clocks', 'Testing navigation with a NavHost'],
          quiz: [
            ['How do you find a composable without visible text?', 'Give it Modifier.testTag and use onNodeWithTag.'],
            ['What does the semantics tree share with accessibility?', 'The same labels and roles, so tagging for tests improves TalkBack support too.'],
          ],
          prereqs: ['Espresso for Android views'],
        },
        {
          title: 'XCUITest for iOS',
          description: 'Launching the app with XCUIApplication, querying elements by accessibility identifier, waiting with expectations, handling system alerts with interruption monitors, and passing launch arguments to seed test state.',
          concepts: ['XCUIApplication and launch arguments', 'Accessibility identifiers as locators', 'waitForExistence and expectations', 'Interruption monitors for alerts', 'Testing SwiftUI views'],
          quiz: [
            ['Why set accessibilityIdentifier instead of relying on labels?', 'Identifiers are stable across localisation and copy changes.'],
            ['How does a UI test seed a logged-in state?', 'Pass launch arguments or environment the app reads to configure itself.'],
          ],
          prereqs: ['The testing pyramid for mobile'],
        },
        {
          title: 'Flutter widget tests',
          description: 'Pumping a widget tree in a headless test with WidgetTester, finding widgets by type, key or text, tapping and entering text, and pumping frames to settle animations, all running on the Dart VM in milliseconds.',
          concepts: ['testWidgets and WidgetTester', 'Finders by key, type and text', 'pump versus pumpAndSettle', 'Providing dependencies to the tree', 'Testing scrolling and lists'],
          quiz: [
            ['What is the difference between pump and pumpAndSettle?', 'pump advances one frame; pumpAndSettle repeats until no frames are scheduled.'],
            ['Why are widget tests fast?', 'They run on the Dart VM with a fake binding, not on a device.'],
          ],
          prereqs: ['The testing pyramid for mobile'],
        },
        {
          title: 'Flutter integration tests',
          description: 'Running the full app on a device with integration_test, driving real platform channels and plugins, capturing screenshots, and running the same suite on Firebase Test Lab for cross-device coverage.',
          concepts: ['integration_test package setup', 'Running on device and emulator', 'Platform channel coverage', 'Screenshots and performance traces', 'Sharding integration suites'],
          quiz: [
            ['When is an integration test needed over a widget test?', 'When plugins, platform channels or real rendering matter.'],
            ['How do you run Flutter integration tests on many devices?', 'Build the test APK or XCTest bundle and submit it to Firebase Test Lab.'],
          ],
          prereqs: ['Flutter widget tests'],
        },
        {
          title: 'Detox for React Native',
          description: 'Grey-box end-to-end tests that synchronise with the React Native bridge, animations and network, using testID locators, device configurations and Jest as the runner, and why Detox is more stable than Appium for RN.',
          concepts: ['Detox configurations and builds', 'testID locators and matchers', 'Automatic synchronisation', 'Mocking network in Detox', 'Running on iOS simulator and Android emulator'],
          quiz: [
            ['What does grey-box mean for Detox?', 'It hooks into the app to wait for idle state instead of sleeping and guessing.'],
            ['How do you locate an element in Detox?', 'by.id with the component testID prop.'],
          ],
          prereqs: ['The testing pyramid for mobile'],
        },
        {
          title: 'Page objects and the robot pattern',
          description: 'Wrapping screen interactions in Robot or page object classes so tests read as user intent, locators live in one place, and a redesigned screen changes one file instead of fifty tests.',
          concepts: ['Robot classes per screen', 'Fluent test DSLs', 'Centralised locators', 'Sharing robots between flows'],
          quiz: [
            ['What goes in a page object?', 'Locators and actions for one screen, never assertions about business outcomes.'],
            ['Why do robots reduce flakiness?', 'Waits and retries are encoded once in the robot rather than copied inconsistently.'],
          ],
          prereqs: ['Compose UI testing', 'XCUITest for iOS'],
        },
        {
          title: 'Synchronisation and waiting in UI tests',
          description: 'Replacing sleeps with condition-based waits: idling resources, Compose waitUntil, XCTest expectations and Detox synchronisation, and disabling animations on test devices so timing does not depend on hardware.',
          concepts: ['Condition-based waits', 'Disabling animations on test devices', 'Timeouts as a last resort', 'Detecting slow screens with wait logs'],
          quiz: [
            ['Why disable animations on the test emulator?', 'Animations delay idle state and make timing vary across machines.'],
            ['What replaces sleep(2) in an XCUITest?', 'waitForExistence(timeout:) on the expected element.'],
          ],
          prereqs: ['Page objects and the robot pattern'],
        },
      ],
    },
    {
      title: 'Snapshot and Visual Testing',
      topics: [
        {
          title: 'Snapshot testing with Paparazzi and swift-snapshot-testing',
          description: 'Rendering a view to an image or text tree and comparing it to a recorded reference so unintended visual changes fail the build; Paparazzi renders Android layouts on the JVM, swift-snapshot-testing does the same in XCTest.',
          concepts: ['Recording and verifying references', 'Paparazzi on the JVM', 'swift-snapshot-testing strategies', 'Snapshotting multiple configurations'],
          quiz: [
            ['Why is Paparazzi faster than screenshot tests on an emulator?', 'It renders with the layout engine on the JVM without booting a device.'],
            ['What does a failing snapshot test produce?', 'A diff image showing reference, actual and the changed pixels.'],
          ],
          prereqs: ['The testing pyramid for mobile'],
        },
        {
          title: 'Flutter golden tests',
          description: 'matchesGoldenFile compares a widget render to a stored PNG; fonts, platform and device pixel ratio must be pinned so the golden matches on every machine, and updates are deliberate via --update-goldens.',
          concepts: ['matchesGoldenFile', 'Pinning fonts and pixel ratio', 'Updating goldens deliberately', 'Golden tests in CI containers'],
          quiz: [
            ['Why do golden tests fail between macOS and Linux?', 'Font rendering differs; load the same font in tests or run goldens on one platform.'],
            ['Which flag regenerates golden files?', 'flutter test --update-goldens.'],
          ],
          prereqs: ['Flutter widget tests'],
        },
        {
          title: 'Managing snapshot diffs and review',
          description: 'Keeping snapshots useful: reviewing diffs in pull requests, storing references with Git LFS, tolerating anti-aliasing noise with thresholds, and resisting the habit of blindly re-recording when a test goes red.',
          concepts: ['Diff review in pull requests', 'Git LFS for reference images', 'Pixel tolerance thresholds', 'Preventing blind re-recording'],
          quiz: [
            ['Why use Git LFS for snapshot images?', 'Binary references bloat the repository history otherwise.'],
            ['What should a reviewer check on a snapshot change?', 'That the visual change was intended and matches the design, not just that the test passes.'],
          ],
          prereqs: ['Snapshot testing with Paparazzi and swift-snapshot-testing'],
        },
        {
          title: 'Screenshot testing across themes and sizes',
          description: 'Generating screenshots per theme, font scale, locale and screen size with Roborazzi, Compose Preview screenshot tests or XCTest snapshots so accessibility and localisation regressions are visible without manual passes.',
          concepts: ['Roborazzi and preview screenshot tests', 'Parameterising theme and font scale', 'Locale and RTL screenshots', 'Screenshots as review artifacts'],
          quiz: [
            ['What does Roborazzi use to render?', 'Robolectric, so screenshots run on the JVM without an emulator.'],
            ['Why include a 200 per cent font-scale variant?', 'It exposes clipping and overlap that the default size hides.'],
          ],
          prereqs: ['Managing snapshot diffs and review'],
        },
      ],
    },
    {
      title: 'Devices, Emulators and Flakiness',
      topics: [
        {
          title: 'Emulators, simulators and real devices',
          description: 'What emulators and simulators can and cannot reproduce: architecture differences, camera and sensors, push and biometrics, and how to choose a small device matrix that covers OS versions and screen sizes that matter to your users.',
          concepts: ['Emulator versus simulator limits', 'Choosing a device matrix', 'Headless emulators in CI', 'Testing camera, biometrics and push'],
          quiz: [
            ['Which is closer to a real device, an Android emulator or an iOS simulator?', 'The Android emulator runs a real Android system image; the iOS simulator runs an x86 or arm64 build against macOS frameworks.'],
            ['How do you pick the device matrix?', 'From analytics on the OS versions and screen sizes that make up most of your users.'],
          ],
        },
        {
          title: 'Device farms: Firebase Test Lab, AWS Device Farm and BrowserStack',
          description: 'Running instrumented and XCUITest suites on racks of physical devices, receiving videos, logs and performance traces, and using Robo or monkey crawls for cheap coverage of screens no test touches.',
          concepts: ['Uploading test bundles', 'Reading videos, logs and traces', 'Robo crawls', 'Cost control and device selection'],
          quiz: [
            ['What is a Robo test?', 'An automated crawl in Firebase Test Lab that explores the app without written test cases.'],
            ['Why run on physical devices at all?', 'Vendor skins, GPUs and memory pressure produce bugs emulators never show.'],
          ],
          prereqs: ['Emulators, simulators and real devices'],
        },
        {
          title: 'Flaky test management',
          description: 'Tracking flakiness rate per test, quarantining unreliable tests out of the blocking suite, fixing root causes such as shared state and timing, and retrying only as a temporary measure with a deadline.',
          concepts: ['Measuring flake rate', 'Quarantine lanes', 'Root causes: shared state, timing, order', 'Retry policies with expiry'],
          quiz: [
            ['Why is auto-retry alone a bad fix?', 'It hides real intermittent bugs and doubles CI time.'],
            ['What is a quarantine lane?', 'A non-blocking job where flaky tests run until they are fixed or deleted.'],
          ],
          prereqs: ['Synchronisation and waiting in UI tests'],
        },
        {
          title: 'Test sharding and parallel execution',
          description: 'Splitting instrumented suites across emulators with Gradle sharding or Flank, parallel XCTest via test plans and multiple simulators, and balancing shards by historic duration to bring a 40-minute suite under ten.',
          concepts: ['Gradle and Flank sharding', 'Parallel simulators with test plans', 'Balancing shards by duration', 'Isolating state between shards'],
          quiz: [
            ['What does Flank do?', 'Shards Android and iOS tests across Firebase Test Lab devices and merges results.'],
            ['Why balance shards by duration rather than count?', 'A few slow tests otherwise leave one shard running long after the rest finish.'],
          ],
          prereqs: ['Device farms: Firebase Test Lab, AWS Device Farm and BrowserStack'],
        },
      ],
    },
    {
      title: 'Quality Beyond Correctness',
      topics: [
        {
          title: 'Accessibility testing',
          description: 'Automating the checks that can be automated: Espresso AccessibilityChecks, Compose semantics assertions, the Xcode Accessibility Inspector audit, and Flutter meetsGuideline, plus manual TalkBack and VoiceOver passes for the rest.',
          concepts: ['AccessibilityChecks in Espresso', 'Xcode Accessibility Inspector audits', 'Flutter meetsGuideline matchers', 'Manual screen reader passes'],
          quiz: [
            ['What does Flutter textContrastGuideline check?', 'That text meets the minimum contrast ratio against its background.'],
            ['Which problems need a manual screen reader pass?', 'Focus order, meaningful labels and announcement timing.'],
          ],
          prereqs: ['Compose UI testing'],
        },
        {
          title: 'Performance testing in the pipeline',
          description: 'Measuring startup, scroll jank and memory in tests with Jetpack Macrobenchmark, XCTest metrics and Flutter timeline traces, recording baselines, and failing a build when a regression exceeds the budget.',
          concepts: ['Macrobenchmark startup and scroll tests', 'XCTest performance metrics', 'Flutter timeline summaries', 'Baselines and regression budgets'],
          quiz: [
            ['What does XCTClockMetric measure?', 'Wall-clock time of the measured block across iterations.'],
            ['Why run performance tests on a fixed device?', 'Results vary by hardware, so comparisons need the same device and thermal state.'],
          ],
          prereqs: ['Device farms: Firebase Test Lab, AWS Device Farm and BrowserStack'],
        },
        {
          title: 'Monkey testing and crash hunting',
          description: 'Throwing random input at the app with the Android monkey tool, Robo crawls or iOS UI stress loops to find crashes, ANRs and memory growth that scripted tests never trigger, then converting each finding into a regression test.',
          concepts: ['adb monkey runs', 'Stress loops for memory growth', 'Triage of random-input crashes', 'Turning findings into regression tests'],
          quiz: [
            ['What command runs 5000 random events on Android?', 'adb shell monkey -p <package> -v 5000.'],
            ['What is an ANR?', 'Application Not Responding: the main thread blocked for about five seconds.'],
          ],
        },
        {
          title: 'Exploratory testing and bug reports',
          description: 'Structured manual sessions with charters and time boxes that find what automation cannot, and bug reports that reproduce: device, OS, build, steps, expected and actual, logs, video, and a severity that guides triage.',
          concepts: ['Session-based exploratory charters', 'Reproducible bug reports', 'Capturing logs and video', 'Severity and priority triage'],
          quiz: [
            ['What makes a bug report reproducible?', 'Exact build, device, steps and data that lead to the failure every time.'],
            ['What is a test charter?', 'A short mission for an exploratory session, such as stress the offline cart flow for 45 minutes.'],
          ],
        },
      ],
    },
    {
      title: 'Beta Testing and CI',
      topics: [
        {
          title: 'CI for mobile with GitHub Actions',
          description: 'Workflows on macOS and Linux runners that cache Gradle, CocoaPods and pub, start an emulator, run unit and UI tests, and upload reports and artifacts, with matrix jobs across OS versions and secrets for signing kept out of logs.',
          concepts: ['macOS and Linux runner choices', 'Caching Gradle, Pods and pub', 'Emulator startup in a workflow', 'Artifacts and test reports', 'Secrets and signing in CI'],
          quiz: [
            ['Why do iOS jobs need macOS runners?', 'Xcode and the simulator only run on macOS.'],
            ['Which action starts an Android emulator in GitHub Actions?', 'reactivecircus/android-emulator-runner.'],
          ],
          prereqs: ['Test sharding and parallel execution'],
        },
        {
          title: 'Fastlane lanes for testing and distribution',
          description: 'Scripting repeatable steps in a Fastfile: scan for XCTest runs, gradle tasks for Android, pilot for TestFlight uploads, and supply for Play, so local and CI runs use the same commands and reports.',
          concepts: ['Fastfile and lanes', 'scan and gradle actions', 'pilot and supply for beta uploads', 'Sharing lanes between CI and local'],
          quiz: [
            ['What does fastlane scan do?', 'Builds and runs the Xcode test suite with formatted output and reports.'],
            ['Why put test commands in a lane instead of the CI YAML?', 'Developers run the identical steps locally and the CI file stays small.'],
          ],
          prereqs: ['CI for mobile with GitHub Actions'],
        },
        {
          title: 'Bitrise and Codemagic pipelines',
          description: 'Mobile-focused CI services with preinstalled Xcode versions, device testing add-ons and workflow editors, when they beat generic CI, and how to keep the pipeline definition in the repository as YAML for review.',
          concepts: ['Bitrise workflows and steps', 'Codemagic for Flutter', 'Pinning Xcode versions', 'YAML pipelines in the repo'],
          quiz: [
            ['What advantage do mobile CI services offer?', 'Preconfigured Xcode and Android images, signing helpers and device testing built in.'],
            ['Why store the Bitrise workflow as bitrise.yml in the repository?', 'Changes are reviewed and versioned like code.'],
          ],
          prereqs: ['CI for mobile with GitHub Actions'],
        },
        {
          title: 'Beta testing with TestFlight and Play testing tracks',
          description: 'Distributing builds to internal and external testers, collecting crash logs and screenshots with feedback, Play internal, closed and open tracks, and using beta metrics to decide when a build is ready for release.',
          concepts: ['TestFlight internal and external groups', 'Play internal, closed and open tracks', 'Tester feedback and crash logs', 'Beta exit criteria'],
          quiz: [
            ['How many external TestFlight testers are allowed?', 'Up to 10,000.'],
            ['What is the Play internal testing track for?', 'Fast distribution to up to 100 testers without review delays.'],
          ],
          prereqs: ['Fastlane lanes for testing and distribution'],
        },
        {
          title: 'Release checklists and quality gates',
          description: 'Turning quality into a gate: green unit and UI suites, snapshot approvals, accessibility scans, performance budgets, crash-free rate from beta, and a manual smoke pass on the device matrix before any store submission.',
          concepts: ['Automated gate criteria', 'Smoke test on the device matrix', 'Crash-free rate thresholds', 'Sign-off and rollback plan'],
          quiz: [
            ['What crash-free rate is a common release threshold?', 'Around 99.5 per cent of sessions or better in beta.'],
            ['Why keep a manual smoke pass when everything is automated?', 'Automation checks what it was told to; humans notice the unexpected.'],
          ],
          prereqs: ['Beta testing with TestFlight and Play testing tracks'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: test suite for a shopping list app',
          description: 'Take a small list app on your platform and build the pyramid: view model unit tests with fakes, repository tests on an in-memory database, network tests against a fake server, three UI tests through a robot, and coverage reported in CI.',
          concepts: ['Refactor for injectable dependencies', 'Write the unit and repository tests', 'Add UI tests with a robot', 'Wire coverage into CI'],
          quiz: [
            ['Which layer should have the most tests here?', 'The view model and repository unit tests.'],
            ['What should the three UI tests cover?', 'Add an item, complete an item and the empty state.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: snapshot and accessibility guard',
          description: 'Add snapshot tests for every screen of an existing app across light and dark themes, 100 and 200 per cent font scale and one RTL locale, plus automated accessibility checks, and make the diffs reviewable in pull requests.',
          concepts: ['Parameterise the configurations', 'Record and store references', 'Add accessibility assertions', 'Publish diffs in pull requests'],
          quiz: [
            ['How many snapshot variants does one screen produce here?', 'Two themes times two font scales plus RTL: at least five.'],
            ['Where do the reference images live?', 'In the repository under Git LFS.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: mobile CI pipeline with beta delivery',
          description: 'Build a GitHub Actions or Bitrise pipeline that lints, runs unit tests on every pull request, runs sharded UI tests on Firebase Test Lab nightly, and ships a signed build to TestFlight or Play internal testing on merge via Fastlane.',
          concepts: ['Define pull request and nightly workflows', 'Shard the UI suite', 'Configure signing secrets', 'Automate the beta upload'],
          quiz: [
            ['Why split pull request and nightly jobs?', 'Fast feedback on every change; expensive device runs once a day.'],
            ['How are signing secrets provided?', 'Encrypted CI secrets injected as environment variables or match repository access.'],
          ],
          style: 'project',
        },
        {
          title: 'Mobile testing interview questions',
          description: 'The questions that come up: pyramid trade-offs on mobile, fakes versus mocks, testing coroutines and async, why UI tests flake and what you did about it, snapshot pitfalls, and how you gate a release.',
          concepts: ['Explaining test strategy trade-offs', 'Async and flakiness questions', 'Snapshot and UI test questions', 'Release quality questions'],
          quiz: [
            ['How would you cut a 45-minute UI suite?', 'Move logic to unit tests, shard across devices, quarantine flakes and run the full suite nightly.'],
            ['What is your first move on a flaky test?', 'Measure how often it fails and read its waits and shared state before retrying.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live testing exercises',
          description: 'Practising what interviews ask you to do on the spot: write a view model test from a description, design test cases for a login screen, sketch a CI pipeline, and review a flaky UI test and name its faults.',
          concepts: ['Writing a test from a spec', 'Enumerating cases for a screen', 'Whiteboarding a pipeline', 'Reviewing a flawed test'],
          quiz: [
            ['Name four test cases for a login screen.', 'Valid credentials, wrong password, empty fields, and network failure with retry.'],
            ['What faults do you look for in a flaky test?', 'Sleeps, shared mutable state, dependence on order or network, and missing waits.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
