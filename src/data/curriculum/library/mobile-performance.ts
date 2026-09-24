import { defineTrack } from '../define'

export const mobilePerformance = defineTrack({
  id: 'track-mobile-performance',
  title: 'Mobile Performance',
  description: 'Making apps start fast, scroll smoothly and stay lean on Android, iOS, Flutter and React Native: budgets and metrics, profiling with Android Studio Profiler, Instruments, Flutter DevTools and Flipper, startup and rendering work, images, memory leaks, network efficiency, background and battery, app size, offline sync and production monitoring.',
  family: 'Mobile Development',
  kind: 'domain',
  icon: '⚡',
  tags: ['mobile', 'performance', 'profiling', 'startup', 'jank', 'memory', 'battery', 'app size', 'monitoring'],
  languages: ['Kotlin', 'Swift', 'Dart', 'TypeScript'],
  explainMode: 'concept',
  code: { label: 'the platform language (Kotlin, Swift, Dart or TypeScript)', id: 'plaintext', fixed: true },
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Budgets and Metrics',
      description: 'You cannot improve what you do not measure; these are the numbers that define fast on a phone.',
      topics: [
        {
          title: 'Performance budgets',
          description: 'Setting numeric limits per release for cold start, frame drops, memory, download size and battery, agreed with product, enforced in CI and tracked in production, so performance is a requirement rather than a cleanup phase.',
          concepts: ['Choosing budget metrics', 'Baselines from real users', 'Budgets as CI gates', 'Revisiting budgets per release'],
          quiz: [
            ['Why set a budget before optimising?', 'It defines done and stops both premature optimisation and silent regressions.'],
            ['Where do baseline numbers come from?', 'Field data from Android vitals, MetricKit or Firebase Performance, not a developer phone.'],
          ],
        },
        {
          title: 'Startup metrics: cold, warm and hot',
          description: 'Cold start creates the process, warm reuses it, hot resumes an activity; time to initial display and time to full display are the numbers Android reports, and iOS pre-main plus main-to-first-frame is the equivalent, with 500 ms as a good cold target.',
          concepts: ['Cold, warm and hot start', 'Time to initial and full display', 'iOS pre-main time', 'Reading startup in vitals and MetricKit'],
          quiz: [
            ['What is the difference between TTID and TTFD?', 'TTID is when the first frame draws; TTFD is when the app reports content is fully loaded.'],
            ['Which iOS flag prints pre-main time?', 'DYLD_PRINT_STATISTICS, or the App Launch template in Instruments.'],
          ],
          prereqs: ['Performance budgets'],
        },
        {
          title: 'Frame rate, jank and frame timing',
          description: 'A 60 Hz screen gives 16.7 ms per frame and 120 Hz gives 8.3 ms; a frame that misses is jank, and platforms report slow and frozen frames, so the goal is a consistent frame budget rather than average FPS.',
          concepts: ['Frame budgets at 60 and 120 Hz', 'Slow and frozen frames', 'Jank versus average FPS', 'Frame timing APIs'],
          quiz: [
            ['How long does a frame have at 120 Hz?', 'About 8.3 milliseconds.'],
            ['What does Android call a frame over 700 ms?', 'A frozen frame.'],
          ],
          prereqs: ['Performance budgets'],
        },
        {
          title: 'Memory metrics and pressure',
          description: 'PSS, RSS and the Java or Swift heap tell different stories; memory warnings and low-memory kills come from the OS, and high memory raises the chance the app is evicted in the background, turning the next open into a cold start.',
          concepts: ['PSS, RSS and heap size', 'Memory warnings and low-memory kills', 'Background eviction cost', 'Reading memory in profilers'],
          quiz: [
            ['Why does high memory hurt startup?', 'The OS kills large background apps first, forcing more cold starts.'],
            ['What does didReceiveMemoryWarning ask you to do?', 'Release caches and reconstructible data immediately.'],
          ],
          prereqs: ['Performance budgets'],
        },
        {
          title: 'Battery and app size as metrics',
          description: 'Battery drain comes from radios, CPU wakeups, GPS and screen, measured with Battery Historian and Xcode energy gauges; download and install size affect conversion, and both belong in the budget alongside speed.',
          concepts: ['Sources of battery drain', 'Battery Historian and energy gauges', 'Download versus install size', 'Size and install conversion'],
          quiz: [
            ['Which component often dominates battery drain in apps?', 'The cellular radio kept awake by frequent small network requests.'],
            ['Why does download size matter for growth?', 'Larger apps see lower install completion, especially on cellular and in emerging markets.'],
          ],
          prereqs: ['Performance budgets'],
        },
      ],
    },
    {
      title: 'Profiling Tools',
      topics: [
        {
          title: 'Android Studio Profiler',
          description: 'CPU, memory, network and energy profilers in one window: sampling and tracing the CPU to find hot methods, recording heap dumps and allocation tracking, and reading the network timeline to correlate requests with UI stalls.',
          concepts: ['CPU sampling versus tracing', 'Heap dumps and allocation tracking', 'Network and energy timelines', 'Profiling release-like builds'],
          quiz: [
            ['Why profile a release build with debuggable enabled rather than a debug build?', 'Debug builds skip R8 and use different code paths, so numbers do not match what users see.'],
            ['What does the flame chart show?', 'Call stacks over time with width proportional to time spent.'],
          ],
          prereqs: ['Startup metrics: cold, warm and hot'],
        },
        {
          title: 'Xcode Instruments',
          description: 'Time Profiler for CPU hotspots, Allocations and Leaks for memory, Core Animation and Animation Hitches for rendering, App Launch for startup, and Network and Energy Log, each recording a trace you can filter to your own frames.',
          concepts: ['Time Profiler and call trees', 'Allocations and Leaks instruments', 'Animation Hitches instrument', 'App Launch template', 'Signposts for custom intervals'],
          quiz: [
            ['What is a hitch in Instruments?', 'A frame that was delivered later than its expected display time.'],
            ['What do os_signpost intervals give you?', 'Named regions in the Instruments timeline for your own code paths.'],
          ],
          prereqs: ['Startup metrics: cold, warm and hot'],
        },
        {
          title: 'Flutter DevTools',
          description: 'The performance view shows the UI and raster thread per frame, the CPU profiler samples Dart code, the memory view tracks Dart and native allocations, and the widget rebuild counter reveals which build methods run far too often.',
          concepts: ['UI versus raster thread timing', 'Frame chart and jank markers', 'Widget rebuild stats', 'Dart memory and allocation view', 'Profile mode builds'],
          quiz: [
            ['Why must Flutter performance be measured in profile mode?', 'Debug mode uses a JIT and extra checks that make timings meaningless.'],
            ['What does a long raster thread frame suggest?', 'Expensive painting such as shaders, large images or saveLayer calls, not Dart logic.'],
          ],
          prereqs: ['Frame rate, jank and frame timing'],
        },
        {
          title: 'Flipper and React Native DevTools',
          description: 'Inspecting a React Native app at runtime: the React DevTools profiler for wasted renders, network and layout plugins, Hermes sampling profiles, and the performance monitor overlay showing JS and UI frame rates side by side.',
          concepts: ['React DevTools profiler for re-renders', 'Hermes sampling profiler', 'JS versus UI thread frame rate', 'Network inspection plugins'],
          quiz: [
            ['What does a JS frame rate of 10 with UI at 60 mean?', 'The JavaScript thread is blocked while native rendering is fine; the app feels unresponsive to touches.'],
            ['Where do you see which components re-rendered and why?', 'The React DevTools profiler with the record why each component rendered option.'],
          ],
          prereqs: ['Frame rate, jank and frame timing'],
        },
        {
          title: 'System traces with Perfetto',
          description: 'A system-wide trace shows CPU scheduling, binder calls, your own trace sections and the render pipeline across processes, so a stall can be attributed to your code, the GPU, a locked mutex or another app hogging the cores.',
          concepts: ['Recording a Perfetto trace', 'Custom trace sections', 'Reading scheduling and thread states', 'Attributing stalls to a cause'],
          quiz: [
            ['What does Trace.beginSection add?', 'A named slice on your thread in the system trace.'],
            ['Why use a system trace instead of the CPU profiler?', 'It shows time spent waiting on other threads, the kernel and the GPU, not only your code.'],
          ],
          prereqs: ['Android Studio Profiler'],
        },
        {
          title: 'Benchmarking with Macrobenchmark and XCTest metrics',
          description: 'Repeatable measurements in code: Jetpack Macrobenchmark drives startup and scroll on a device and reports frame and timing percentiles, and XCTest measure blocks with clock, memory and CPU metrics fail when a baseline slips.',
          concepts: ['Macrobenchmark startup and scroll modes', 'Compilation modes and warmups', 'XCTest measure with metrics', 'Baselines and thresholds in benchmarks'],
          quiz: [
            ['Why run several iterations in a benchmark?', 'To report percentiles and smooth out thermal and scheduling noise.'],
            ['Which compilation mode mimics a fresh install on Android?', 'CompilationMode.None, or Partial with a baseline profile for the realistic case.'],
          ],
          prereqs: ['Android Studio Profiler', 'Xcode Instruments'],
        },
      ],
    },
    {
      title: 'Startup Optimisation',
      topics: [
        {
          title: 'Lazy initialisation and deferred work',
          description: 'Application onCreate and AppDelegate do too much: content providers and SDK initialisers run before the first frame, so defer analytics, feature flags and caches until after first draw, initialise lazily and measure each initialiser.',
          concepts: ['Measuring each initialiser', 'App Startup library and deferred SDKs', 'Lazy singletons', 'Work after first frame'],
          quiz: [
            ['How do SDKs slow startup without a line of your code?', 'They auto-initialise through content providers in the manifest before onCreate runs.'],
            ['What does the AndroidX App Startup library provide?', 'A single content provider that initialises components in order and lazily on demand.'],
          ],
          prereqs: ['Startup metrics: cold, warm and hot'],
        },
        {
          title: 'Baseline Profiles and ahead-of-time compilation',
          description: 'Android baseline profiles ship a list of hot methods so ART compiles them at install instead of interpreting them on first runs, cutting startup by up to 30 per cent; iOS is already AOT, so its wins come from dylib count and static linking.',
          concepts: ['Generating baseline profiles', 'ART JIT versus AOT tiers', 'Startup profiles for DEX layout', 'Reducing dynamic libraries on iOS'],
          quiz: [
            ['How is a baseline profile generated?', 'By running a Macrobenchmark that records the critical user journeys.'],
            ['Why do many dynamic frameworks slow iOS launch?', 'Each dylib adds loading, rebasing and binding work before main runs.'],
          ],
          prereqs: ['Lazy initialisation and deferred work'],
        },
        {
          title: 'Dependency injection and startup cost',
          description: 'Eager DI graphs, reflection-based frameworks and huge object graphs built at launch add hundreds of milliseconds; scope components to screens, prefer compile-time DI and construct expensive services on first use.',
          concepts: ['Eager versus lazy bindings', 'Compile-time DI cost', 'Scoping to screens', 'Measuring graph construction'],
          quiz: [
            ['Why is Dagger or Hilt cheaper at runtime than a reflection container?', 'The graph is generated at compile time, so no classpath scanning happens at launch.'],
            ['What is a symptom of an eager graph?', 'Services for screens the user never opened are constructed during startup.'],
          ],
          prereqs: ['Lazy initialisation and deferred work'],
        },
        {
          title: 'Splash screens and first frame',
          description: 'The system splash on Android 12 and the iOS launch storyboard show instantly; a second custom splash only delays real content, so the first screen should render with cached data and reveal network content as it arrives.',
          concepts: ['SplashScreen API and launch storyboards', 'Avoiding double splash screens', 'First screen from cache', 'Keeping the splash while data loads'],
          quiz: [
            ['When should setKeepOnScreenCondition hold the splash?', 'Only while data essential to the first frame loads, never for analytics or ads.'],
            ['Why is a branded second splash harmful?', 'It adds time before content with no benefit and users perceive the app as slow.'],
          ],
          prereqs: ['Lazy initialisation and deferred work'],
        },
      ],
    },
    {
      title: 'Rendering and Lists',
      topics: [
        {
          title: 'The rendering pipeline',
          description: 'Measure, layout and draw on Android, layout and display in UIKit, the Compose and SwiftUI recomposition and body-evaluation models, and the Flutter build, layout and paint phases, so you know which phase a profiler is blaming.',
          concepts: ['Measure, layout and draw phases', 'Recomposition and SwiftUI body evaluation', 'Flutter build, layout and paint', 'Main thread versus render thread'],
          quiz: [
            ['Which thread does Android use to issue GPU commands?', 'RenderThread, separate from the main thread.'],
            ['What triggers a Flutter widget rebuild?', 'setState, a changed InheritedWidget or a parent rebuilding with new configuration.'],
          ],
          prereqs: ['Frame rate, jank and frame timing'],
        },
        {
          title: 'List performance and view recycling',
          description: 'RecyclerView, LazyColumn, UITableView and List, ListView.builder and FlatList all recycle rows; item keys, stable ids, fixed sizes and cheap bind methods keep scrolling smooth, while nested scrolling and per-row inflation destroy it.',
          concepts: ['View recycling and stable keys', 'Cheap item binding', 'Fixed sizes and prefetch', 'FlatList windowing props', 'Avoiding nested scroll containers'],
          quiz: [
            ['Why give LazyColumn items a key?', 'So reordering or insertion reuses state and avoids recomposing every row.'],
            ['What does getItemLayout do in FlatList?', 'Lets the list skip measuring rows so it can jump and render without layout passes.'],
          ],
          prereqs: ['The rendering pipeline'],
        },
        {
          title: 'Overdraw and layout depth',
          description: 'Painting the same pixel several times and nesting layouts deep both cost frame time; the overdraw debug overlay, Layout Inspector and flat layouts such as ConstraintLayout reduce it, and Flutter RepaintBoundary isolates expensive paints.',
          concepts: ['Overdraw debug overlay', 'Flattening view hierarchies', 'Removing redundant backgrounds', 'RepaintBoundary in Flutter'],
          quiz: [
            ['What colour marks 4x overdraw in the Android overlay?', 'Dark red.'],
            ['When does RepaintBoundary help?', 'When a small animating widget would otherwise cause a large parent to repaint every frame.'],
          ],
          prereqs: ['The rendering pipeline'],
        },
        {
          title: 'Compose recomposition and stability',
          description: 'Compose skips composables whose parameters are stable and unchanged; unstable types such as List or classes from other modules force recomposition, so immutable models, @Stable annotations, lambdas remembered, and derivedStateOf keep the tree cheap.',
          concepts: ['Skippable and restartable composables', 'Stable and immutable types', 'Layout Inspector recomposition counts', 'derivedStateOf and deferred reads', 'Compose compiler metrics'],
          quiz: [
            ['Why is a kotlin List parameter unstable?', 'The compiler cannot prove it is immutable, so it assumes it may change and recomposes.'],
            ['What does deferring a state read into a lambda achieve?', 'Only the layout or draw phase re-runs instead of recomposing the whole composable.'],
          ],
          prereqs: ['The rendering pipeline'],
        },
        {
          title: 'React Native re-renders and the new architecture',
          description: 'Every re-render crosses from JS to native layout: memoising components and callbacks, moving animations to the UI thread with Reanimated, and adopting the new architecture with JSI and Fabric remove the bridge serialisation that causes stutter.',
          concepts: ['memo, useMemo and useCallback', 'Reanimated worklets on the UI thread', 'JSI, Fabric and TurboModules', 'Avoiding inline styles and objects'],
          quiz: [
            ['Why did the old bridge cause jank?', 'Every interaction serialised JSON across an async queue between JS and native.'],
            ['Where does a Reanimated worklet run?', 'On the UI thread, so animations continue even when JS is busy.'],
          ],
          prereqs: ['The rendering pipeline'],
        },
      ],
    },
    {
      title: 'Images, Memory and Network',
      topics: [
        {
          title: 'Image loading and caching libraries',
          description: 'Coil, Glide, Kingfisher, SDWebImage and cached_network_image decode off the main thread, downsample to the target size, and keep memory and disk caches, so the wrong call, such as decoding a full-size bitmap yourself, is the usual bug.',
          concepts: ['Decode off the main thread', 'Downsampling to target size', 'Memory and disk cache layers', 'Placeholders and crossfades', 'Cancelling loads on recycle'],
          quiz: [
            ['How much memory does a 4000x3000 bitmap use undownsampled?', 'About 48 MB at 4 bytes per pixel.'],
            ['Why does Coil cancel a request when the view is recycled?', 'To avoid wasted decoding and showing the wrong image in a reused row.'],
          ],
          prereqs: ['List performance and view recycling'],
        },
        {
          title: 'Image formats and sizing',
          description: 'Serving WebP or AVIF instead of PNG and JPEG cuts bytes by a third or more, requesting the size the screen needs from a CDN avoids decoding megapixels for a thumbnail, and vector assets replace density buckets for icons.',
          concepts: ['WebP and AVIF', 'CDN resizing parameters', 'Vector drawables and SF Symbols', 'Density buckets for raster assets'],
          quiz: [
            ['Why request a 200 px thumbnail from the CDN rather than resizing on device?', 'It saves bandwidth, decode time and memory on every load.'],
            ['Which format does Android support for lossy and lossless with alpha?', 'WebP.'],
          ],
          prereqs: ['Image loading and caching libraries'],
        },
        {
          title: 'Finding memory leaks',
          description: 'Leaked activities, view controllers and listeners keep whole view trees alive; LeakCanary flags retained objects automatically, the Instruments Leaks and Memory Graph Debugger show retain cycles, and Flutter DevTools tracks growing instance counts.',
          concepts: ['LeakCanary retained object reports', 'Memory Graph Debugger and retain cycles', 'Common leak sources: listeners, closures, statics', 'Weak references and lifecycle scoping', 'Flutter instance tracking'],
          quiz: [
            ['What does LeakCanary watch by default?', 'Destroyed activities, fragments, views and view models to see if they are still reachable.'],
            ['What is the usual cause of a Swift retain cycle?', 'A closure capturing self strongly while self holds the closure.'],
          ],
          prereqs: ['Memory metrics and pressure'],
        },
        {
          title: 'Allocation churn and garbage collection',
          description: 'Allocating objects inside draw, bind or scroll callbacks triggers frequent GC pauses on Android and ARC overhead on iOS; object pools, avoiding boxing, and pre-computing formatting keep hot paths allocation-free.',
          concepts: ['Allocations in hot paths', 'GC pauses and jank', 'Autoboxing and hidden allocations', 'Pooling and reuse'],
          quiz: [
            ['Why is creating a Paint inside onDraw a problem?', 'It allocates every frame and forces garbage collection that drops frames.'],
            ['What does the Allocation Tracker show?', 'Every allocation during a recording with its call stack and count.'],
          ],
          prereqs: ['Finding memory leaks'],
        },
        {
          title: 'HTTP caching and conditional requests',
          description: 'OkHttp and URLCache honour Cache-Control, ETag and Last-Modified so repeat requests return from disk or as 304s, which needs the server to set the headers and the client to size the cache and avoid cache-busting query strings.',
          concepts: ['Cache-Control and max-age', 'ETag and If-None-Match', 'OkHttp cache and URLCache', 'Stale-while-revalidate patterns'],
          quiz: [
            ['What does a 304 response save?', 'The body transfer; the client reuses its cached copy.'],
            ['Why does a timestamp query parameter break caching?', 'Every request has a different URL, so nothing matches the cache.'],
          ],
          prereqs: ['Battery and app size as metrics'],
        },
        {
          title: 'Batching, compression and payload design',
          description: 'Fewer, larger requests keep the radio asleep longer: combining calls, gzip or Brotli responses, protobuf for chatty APIs, pagination with sensible page sizes, and HTTP/2 multiplexing over one connection.',
          concepts: ['Request batching and radio state', 'gzip and Brotli', 'Protobuf versus JSON', 'Pagination and page sizes', 'HTTP/2 connection reuse'],
          quiz: [
            ['Why do many small requests cost more battery than one large one?', 'Each wakes the radio, which stays in a high-power state for seconds afterwards.'],
            ['What does HTTP/2 change for a mobile client?', 'Many requests share one connection with multiplexing and header compression.'],
          ],
          prereqs: ['HTTP caching and conditional requests'],
        },
      ],
    },
    {
      title: 'Background Work and Battery',
      topics: [
        {
          title: 'Background work with WorkManager and BGTaskScheduler',
          description: 'Deferrable work such as uploads and sync belongs in WorkManager and BGTaskScheduler, which batch jobs, respect constraints like charging and unmetered network, and survive process death, instead of services and timers that the OS kills.',
          concepts: ['WorkManager constraints and chaining', 'BGAppRefreshTask and BGProcessingTask', 'Expedited and foreground work', 'Retry and backoff policies'],
          quiz: [
            ['Why can an iOS background refresh task not be scheduled for an exact time?', 'The system decides when to run it based on usage patterns and battery.'],
            ['Which constraint avoids uploading a large file on cellular?', 'NetworkType.UNMETERED in WorkManager.'],
          ],
          prereqs: ['Battery and app size as metrics'],
        },
        {
          title: 'Doze, App Standby and iOS background limits',
          description: 'Android Doze and App Standby buckets throttle network and alarms for idle apps, and iOS suspends apps seconds after backgrounding; designing for these windows avoids both battery drain and features that silently stop working.',
          concepts: ['Doze maintenance windows', 'App Standby buckets', 'iOS suspension and background modes', 'Push-driven wakeups'],
          quiz: [
            ['What decides an app standby bucket?', 'How recently and how often the user used the app.'],
            ['How does an iOS app get work done when backgrounded?', 'Through background modes such as fetch, processing, audio, location or a silent push.'],
          ],
          prereqs: ['Background work with WorkManager and BGTaskScheduler'],
        },
        {
          title: 'Location and sensor efficiency',
          description: 'Continuous GPS is the fastest way to drain a battery: use fused location with balanced accuracy, batch updates, geofences and significant-change monitoring, and stop listening the moment the screen that needs it goes away.',
          concepts: ['Fused location and accuracy modes', 'Batching and significant-change updates', 'Geofencing instead of polling', 'Stopping sensors with lifecycle'],
          quiz: [
            ['What is significant-change location monitoring?', 'An iOS mode that wakes the app only when the device moves roughly 500 metres.'],
            ['Why unregister a sensor listener in onPause?', 'Sensors keep sampling and draining battery even when the screen is not visible.'],
          ],
          prereqs: ['Doze, App Standby and iOS background limits'],
        },
        {
          title: 'Wake locks, alarms and push',
          description: 'Wake locks and exact alarms keep the CPU awake and are restricted on recent Android versions; push notifications via FCM and APNs let the server wake the app only when there is something to do, replacing polling entirely.',
          concepts: ['Partial wake lock costs', 'Exact versus inexact alarms', 'FCM and APNs as wakeup signals', 'Replacing polling with push'],
          quiz: [
            ['Why does Android 14 restrict exact alarms?', 'They defeat batching and wake the device at arbitrary times.'],
            ['What is a silent push?', 'A notification with content-available that wakes the app briefly without alerting the user.'],
          ],
          prereqs: ['Doze, App Standby and iOS background limits'],
        },
      ],
    },
    {
      title: 'App Size, Sync and Production Monitoring',
      topics: [
        {
          title: 'App size reduction with R8, App Bundles and app thinning',
          description: 'R8 shrinks code and resources, Android App Bundles deliver only the ABI, density and language a device needs, and iOS app thinning and on-demand resources do the same, while Flutter tree shaking and Hermes bytecode trim cross-platform builds.',
          concepts: ['R8 code and resource shrinking', 'App Bundles and split delivery', 'iOS app thinning and on-demand resources', 'Flutter tree shaking and split-debug-info', 'Hermes bytecode'],
          quiz: [
            ['How does an App Bundle cut download size?', 'Play generates per-device APKs with only the needed ABI, density and language splits.'],
            ['What does --split-debug-info do in Flutter?', 'Moves symbols out of the app into separate files, shrinking the binary.'],
          ],
          prereqs: ['Battery and app size as metrics'],
        },
        {
          title: 'Auditing what is in the binary',
          description: 'The APK Analyzer and the App Store size report show which libraries, native binaries, fonts and images make up the app; unused ABIs, duplicated assets and bloated SDKs are usually the biggest wins.',
          concepts: ['APK Analyzer and size reports', 'Native library ABIs', 'Assets and font duplication', 'SDK size accounting'],
          quiz: [
            ['What is often the largest single item in an APK?', 'Native libraries, especially when all four ABIs are bundled.'],
            ['How do you check download size before release?', 'Upload to a testing track and read the size report, or use bundletool get-size.'],
          ],
          prereqs: ['App size reduction with R8, App Bundles and app thinning'],
        },
        {
          title: 'Offline-first sync performance',
          description: 'Syncing efficiently means pulling deltas since a cursor, pushing queued changes in batches, resolving conflicts deterministically, and writing to the local database in transactions off the main thread so the UI reads from cache without stalling.',
          concepts: ['Delta sync with cursors', 'Queued writes and batching', 'Conflict resolution strategies', 'Transactional writes off the main thread', 'Room and Core Data change observation'],
          quiz: [
            ['Why sync with a cursor instead of a full fetch?', 'Only rows changed since the last sync are transferred and written.'],
            ['Why write sync results in one transaction?', 'One commit means one change notification and no half-updated screens.'],
          ],
          prereqs: ['Batching, compression and payload design'],
        },
        {
          title: 'Firebase Performance Monitoring',
          description: 'Automatic traces for app start, screen rendering and HTTP requests plus custom traces and metrics from real users, segmented by device, country and version, giving the field data that budgets are set against.',
          concepts: ['Automatic start and network traces', 'Custom traces and metrics', 'Segmenting by device and version', 'Alerting on regressions'],
          quiz: [
            ['What does a Firebase screen trace report?', 'Slow and frozen frame percentages for each screen.'],
            ['Why segment performance data by device tier?', 'A median across all devices hides that low-end phones are unusable.'],
          ],
          prereqs: ['Performance budgets'],
        },
        {
          title: 'Crash, ANR and hang monitoring',
          description: 'Crashlytics, Sentry, Android vitals and MetricKit report crashes, ANRs, hangs and excessive wakeups from production; symbolicated stacks, breadcrumbs and per-version crash-free rates show where to look and whether a release made things worse.',
          concepts: ['Crash-free users and sessions', 'ANR and hang reports', 'Symbolication and mapping upload', 'Breadcrumbs and custom keys', 'Android vitals thresholds'],
          quiz: [
            ['What ANR rate does Play flag as bad behaviour?', 'Above 0.47 per cent of daily sessions user-perceived ANR.'],
            ['What does MetricKit deliver?', 'Daily aggregated diagnostics and metrics such as hangs, crashes, launch time and battery from real devices.'],
          ],
          prereqs: ['Firebase Performance Monitoring'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: cut cold start in half',
          description: 'Profile the cold start of an existing app with the App Launch template or Macrobenchmark, list every initialiser and its cost, defer or lazy-load the non-essential ones, add a baseline profile or trim dylibs, and prove the improvement with before and after benchmarks.',
          concepts: ['Record the baseline trace', 'Attribute time to initialisers', 'Defer and lazy-load', 'Benchmark the result'],
          quiz: [
            ['What must the before and after comparison hold constant?', 'Device, build type, compilation mode and number of iterations.'],
            ['Which initialisers are safe to defer?', 'Anything not needed for the first frame, such as analytics, crash reporting extras and feature flags with cached defaults.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: smooth a janky feed',
          description: 'Take an image-heavy scrolling feed that drops frames, use the frame profiler and rebuild counters to find the causes, fix image sizing, recycling, allocation churn and recomposition, and add a scroll benchmark that guards the fix.',
          concepts: ['Measure frames while scrolling', 'Fix images and recycling', 'Remove hot-path allocations', 'Add a scroll benchmark'],
          quiz: [
            ['What is the first suspect for jank in an image feed?', 'Full-size images decoded on the main thread or held undownsampled in memory.'],
            ['What number proves the fix?', 'The 90th or 99th percentile frame time under the frame budget in the benchmark.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: shrink the app and the battery bill',
          description: 'Audit the binary with APK Analyzer or the App Store size report, remove unused ABIs and assets, enable shrinking and split delivery, then move polling to WorkManager or push, and compare download size and Battery Historian output before and after.',
          concepts: ['Audit the binary composition', 'Enable shrinking and splits', 'Replace polling with scheduled or push work', 'Measure size and battery'],
          quiz: [
            ['What size reduction should splits alone deliver?', 'Often 20 to 40 per cent, depending on native libraries and densities.'],
            ['How do you show battery improvement?', 'Compare wakeups and radio active time in Battery Historian over the same scenario.'],
          ],
          style: 'project',
        },
        {
          title: 'Mobile performance interview questions',
          description: 'Talking through a slow app: how you would find the cause of a slow start or a stuttering list, what the frame budget is, how caching and batching save battery, which numbers you watch in production and a time you fixed a regression.',
          concepts: ['Diagnosing a slow start aloud', 'Explaining frame budgets', 'Network and battery trade-offs', 'Production metrics you watch'],
          quiz: [
            ['Users say the app is slow to open. What do you do first?', 'Check field startup metrics by version and device, then profile a cold start on a representative low-end device.'],
            ['Why is average FPS a poor metric?', 'It hides occasional long frames, which are what users perceive as stutter.'],
          ],
          style: 'reading',
        },
        {
          title: 'Performance review exercises',
          description: 'Practising with real artefacts: reading a flame chart to name the hot method, spotting the allocation in an onDraw snippet, critiquing a list adapter that loads images synchronously, and proposing a budget for a given app.',
          concepts: ['Reading a flame chart', 'Spotting hot-path mistakes in code', 'Critiquing a list implementation', 'Proposing a budget'],
          quiz: [
            ['A flame chart shows JSON parsing at the top of the main thread during scroll. What is the fix?', 'Parse off the main thread and cache the parsed models.'],
            ['What is wrong with loading a bitmap with BitmapFactory in onBindViewHolder?', 'It decodes on the main thread for every bound row, blocking the frame.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
