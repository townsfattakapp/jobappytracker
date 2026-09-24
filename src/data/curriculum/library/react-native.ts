import { defineTrack } from '../define'

export const reactNative = defineTrack({
  id: 'track-react-native',
  title: 'React Native',
  description: 'Native iOS and Android apps from one TypeScript React codebase: Expo and bare workflows, core components and flexbox, React Navigation and Expo Router, state and data fetching, storage, the new architecture and native modules, notifications, Reanimated and gestures, performance, Jest and Detox, EAS builds and store release.',
  family: 'Mobile Development',
  kind: 'framework',
  icon: '📱',
  tags: ['react-native', 'expo', 'typescript', 'mobile', 'react', 'reanimated', 'eas', 'cross-platform'],
  languages: ['TypeScript'],
  explainMode: 'react',
  code: { label: 'TypeScript with React Native', id: 'typescript', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-react'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started',
      description: 'How React Native renders native views, and the two ways to set up a project.',
      topics: [
        {
          title: 'How React Native works',
          description: 'React reconciles a tree of host components that map to real UIView and android.view instances rather than DOM nodes; JavaScript runs on Hermes in its own thread and talks to native through JSI. Knowing the threads explains most performance and threading behaviour.',
          concepts: ['Host components map to native views', 'JavaScript thread versus UI thread', 'Hermes engine', 'JSI and the native boundary', 'Differences from React DOM'],
          quiz: [
            ['Why can you not use a div in React Native?', 'There is no DOM; View, Text and Image map to native platform views.'],
            ['Which thread runs your JavaScript?', 'A dedicated JS thread; layout and drawing happen on native threads.'],
          ],
        },
        {
          title: 'Expo versus the bare workflow',
          description: 'Expo provides a managed toolchain, SDK modules, Expo Go for instant testing and EAS services; the bare workflow exposes the ios and android folders directly. Since prebuild and config plugins, most native customisation no longer requires leaving Expo.',
          concepts: ['Managed workflow and Expo SDK', 'Bare workflow and native folders', 'Expo Go limitations', 'Prebuild and continuous native generation', 'Choosing for a new project'],
          quiz: [
            ['When does Expo Go stop being enough?', 'As soon as the app needs a native module not bundled in Expo Go; switch to a development build.'],
            ['Is Expo only for simple apps?', 'No; prebuild and config plugins let Expo projects include any native code.'],
          ],
          prereqs: ['How React Native works'],
        },
        {
          title: 'Project setup and the development build',
          description: 'Creating a project with create-expo-app and TypeScript, running on simulators, emulators and devices, Metro bundler and its cache, development builds with expo-dev-client, and the folder layout of a typical app.',
          concepts: ['create-expo-app with TypeScript', 'Running on simulator, emulator and device', 'Metro bundler and cache resets', 'expo-dev-client development builds', 'Project folder layout'],
          quiz: [
            ['What is a development build?', 'Your own app binary with expo-dev-client, so custom native modules work while keeping fast refresh.'],
            ['How do you clear a stale Metro cache?', 'npx expo start --clear.'],
          ],
          prereqs: ['Expo versus the bare workflow'],
        },
        {
          title: 'Debugging tools',
          description: 'React Native DevTools for breakpoints, console and the React profiler, the in-app dev menu, element inspector, network inspection, logging with adb logcat and the Xcode console, and reading red box errors.',
          concepts: ['React Native DevTools', 'Dev menu and element inspector', 'Network inspection', 'Native logs with logcat and Xcode', 'Reading red box stack traces'],
          quiz: [
            ['How do you open the dev menu on a device?', 'Shake the device or press m in the Expo terminal.'],
            ['Where do native crashes show up?', 'In adb logcat or the Xcode console, not the JS console.'],
          ],
          prereqs: ['Project setup and the development build'],
        },
      ],
    },
    {
      title: 'Core Components and Styling',
      topics: [
        {
          title: 'View, Text, Image and Pressable',
          description: 'The building blocks: View as the container, Text as the only place text may appear, Image with source objects and sizing rules, Pressable with press states and hit slop, and why nesting Text inside View without Text throws.',
          concepts: ['View and Text rules', 'Image sources and sizing', 'Pressable states and hitSlop', 'ActivityIndicator and Switch', 'expo-image for caching'],
          quiz: [
            ['Why does a remote Image render at zero size?', 'Remote images have no intrinsic size; set width and height explicitly.'],
            ['Can a string be placed directly inside a View?', 'No; text must be wrapped in a Text component.'],
          ],
          prereqs: ['How React Native works'],
        },
        {
          title: 'StyleSheet and the styling model',
          description: 'Styles are JavaScript objects with a CSS-like subset: no cascade except within Text, density-independent units, StyleSheet.create for validation, style arrays for composition, and theming through context or libraries.',
          concepts: ['StyleSheet.create and validation', 'Density-independent units', 'No inheritance except Text', 'Style arrays and conditional styles', 'Theming approaches'],
          quiz: [
            ['Do child Views inherit color from a parent?', 'No; only nested Text inherits text styles.'],
            ['What does [styles.base, active && styles.active] do?', 'Merges styles left to right and ignores falsy entries.'],
          ],
          prereqs: ['View, Text, Image and Pressable'],
        },
        {
          title: 'Flexbox layout',
          description: 'Yoga implements flexbox with column as the default direction: flex as a grow factor, justifyContent and alignItems, gap, absolute positioning, percentage sizes, and the differences from web flexbox that trip people up.',
          concepts: ['Column default direction', 'flex grow and shrink', 'justifyContent and alignItems', 'gap and absolute positioning', 'Differences from web flexbox'],
          quiz: [
            ['What does flex: 1 mean in React Native?', 'Grow to fill the available space along the parent\'s main axis.'],
            ['Why does a horizontal row not scroll?', 'Views clip by default; use a ScrollView with horizontal or allow wrapping.'],
          ],
          prereqs: ['StyleSheet and the styling model'],
        },
        {
          title: 'Lists with FlatList and FlashList',
          description: 'ScrollView renders everything; FlatList virtualises with renderItem and keyExtractor, headers, separators, pull-to-refresh and onEndReached for paging; FlashList recycles cells for smoother scrolling on long lists.',
          concepts: ['ScrollView versus FlatList', 'renderItem and keyExtractor', 'Headers, separators and refreshing', 'onEndReached paging', 'FlashList recycling'],
          quiz: [
            ['Why is keyExtractor important?', 'Stable keys let the list reuse rows and keep state correct on updates.'],
            ['What does FlashList need that FlatList does not?', 'An estimatedItemSize (or auto-measured sizes in newer versions) for its recycling layout.'],
          ],
          prereqs: ['Flexbox layout'],
        },
        {
          title: 'Text input, keyboard and forms',
          description: 'TextInput props for keyboard type, return key and secure entry, controlled versus uncontrolled inputs, KeyboardAvoidingView and dismissing the keyboard, and building forms with React Hook Form and Zod validation.',
          concepts: ['TextInput props', 'Controlled inputs', 'KeyboardAvoidingView', 'Dismissing the keyboard', 'React Hook Form with Zod'],
          quiz: [
            ['Why does KeyboardAvoidingView behave differently per platform?', 'iOS needs behavior="padding"; Android usually handles it through windowSoftInputMode.'],
            ['How do you dismiss the keyboard on tap outside?', 'Keyboard.dismiss() from a Pressable wrapper or ScrollView keyboardShouldPersistTaps.'],
          ],
          prereqs: ['View, Text, Image and Pressable'],
        },
        {
          title: 'Safe areas, dimensions and responsive UI',
          description: 'react-native-safe-area-context for notches and home indicators, useWindowDimensions for size-based layouts, orientation changes, PixelRatio for images, and breakpoints for tablets.',
          concepts: ['SafeAreaProvider and insets', 'useWindowDimensions', 'Orientation handling', 'PixelRatio and image assets', 'Tablet breakpoints'],
          quiz: [
            ['Why useSafeAreaInsets instead of SafeAreaView?', 'Insets can be applied as padding anywhere, including inside scroll views and headers.'],
            ['What does useWindowDimensions trigger?', 'A re-render when the window size or orientation changes.'],
          ],
          prereqs: ['Flexbox layout'],
        },
        {
          title: 'Accessibility in React Native',
          description: 'accessibilityLabel, role and state props that feed VoiceOver and TalkBack, grouping with accessible, focus order, large text and reduced motion via AccessibilityInfo, and testing with screen readers on both platforms.',
          concepts: ['accessibilityLabel and role', 'accessibilityState and hints', 'Grouping with accessible', 'AccessibilityInfo settings', 'Screen reader testing'],
          quiz: [
            ['What does accessible={true} on a View do?', 'Groups its children into one focusable element for screen readers.'],
            ['How do you check whether reduce motion is on?', 'AccessibilityInfo.isReduceMotionEnabled().'],
          ],
          prereqs: ['View, Text, Image and Pressable'],
        },
      ],
    },
    {
      title: 'Navigation',
      topics: [
        {
          title: 'React Navigation stacks and typed params',
          description: 'The native stack navigator with screens and options, typing the param list so navigate and route.params are checked, header configuration, and the difference between navigate, push and goBack.',
          concepts: ['NavigationContainer and native stack', 'Typed ParamList', 'Screen options and headers', 'navigate versus push', 'Passing and reading params'],
          quiz: [
            ['How do you type useNavigation for a stack?', 'NativeStackNavigationProp<RootStackParamList> or a declared global ReactNavigation namespace.'],
            ['Difference between navigate and push?', 'navigate reuses an existing screen of that name if present; push always adds a new one.'],
          ],
          prereqs: ['View, Text, Image and Pressable'],
        },
        {
          title: 'Tabs, drawers and nested navigators',
          description: 'Bottom tabs and drawers, nesting stacks inside tabs so each tab keeps history, hiding the tab bar on inner screens, modal presentation, and navigating across nested navigators.',
          concepts: ['Bottom tabs and drawer', 'Stacks inside tabs', 'Modal presentation', 'Hiding tab bar on nested screens', 'Cross-navigator navigation'],
          quiz: [
            ['Where does a stack go in a tabbed app?', 'Inside each tab, so each keeps its own history.'],
            ['How do you present a screen as a modal?', 'Set presentation: "modal" in the stack screen options.'],
          ],
          prereqs: ['React Navigation stacks and typed params'],
        },
        {
          title: 'Expo Router file-based routing',
          description: 'Routes from the app directory: layouts with _layout.tsx, groups in parentheses, dynamic segments in brackets, typed routes, Link and router.push, and shared layouts for tabs and stacks.',
          concepts: ['app directory and file routes', '_layout.tsx and route groups', 'Dynamic segments', 'Link and router API', 'Typed routes'],
          quiz: [
            ['What does app/(tabs)/index.tsx map to?', 'The root route, with the tabs group not appearing in the URL.'],
            ['How do you read a dynamic segment?', 'useLocalSearchParams() in the [id].tsx screen.'],
          ],
          prereqs: ['Tabs, drawers and nested navigators'],
        },
        {
          title: 'Deep links and auth flows',
          description: 'Linking configuration and universal or app links, opening a screen from a URL, protecting routes with an auth state and redirects, and structuring the navigator so login and app screens swap cleanly without back-navigation leaks.',
          concepts: ['Linking configuration', 'Universal and app links setup', 'Auth-conditional navigators', 'Redirects in Expo Router', 'Handling links on cold start'],
          quiz: [
            ['How do you prevent going back to the login screen after sign-in?', 'Render different navigators based on auth state instead of navigating away from login.'],
            ['How do you test a deep link on iOS simulator?', 'xcrun simctl openurl booted "myapp://item/3".'],
          ],
          prereqs: ['Expo Router file-based routing'],
        },
      ],
    },
    {
      title: 'State Management and Data',
      topics: [
        {
          title: 'Local state, context and lifting state',
          description: 'useState and useReducer for screen state, lifting shared state to a parent, context for app-wide values such as theme and session, and why context is a poor fit for frequently changing data. React basics themselves are in the React track.',
          concepts: ['useState and useReducer on mobile', 'Lifting shared state', 'Context for session and theme', 'Context re-render costs'],
          quiz: [
            ['Why not put the whole app state in one context?', 'Every consumer re-renders on any change.'],
            ['Where does session state belong?', 'In a small context or store read by the navigator and API client.'],
          ],
          prereqs: ['React Navigation stacks and typed params'],
        },
        {
          title: 'Zustand and Redux Toolkit',
          description: 'Zustand stores with selectors and persistence middleware, Redux Toolkit slices and RTK Query, choosing between them by team size and tooling needs, and keeping server data out of client stores.',
          concepts: ['Zustand create and selectors', 'Persist middleware', 'Redux Toolkit slices', 'RTK Query overview', 'Client versus server state'],
          quiz: [
            ['Why use selectors with Zustand?', 'Components re-render only when the selected slice changes.'],
            ['When does Redux Toolkit pay off over Zustand?', 'Large teams needing strict patterns, devtools time travel and middleware.'],
          ],
          prereqs: ['Local state, context and lifting state'],
        },
        {
          title: 'Data fetching with TanStack Query',
          description: 'useQuery and useMutation with keys, caching and stale times, refetch on focus and reconnect through the app state and NetInfo hooks, optimistic updates, infinite queries for paging, and offline persistence.',
          concepts: ['useQuery keys and stale time', 'useMutation and invalidation', 'Refetch on focus and reconnect', 'useInfiniteQuery', 'Persisting the cache offline'],
          quiz: [
            ['How does refetch on focus work in React Native?', 'Hook AppState changes into focusManager so foregrounding triggers refetches.'],
            ['What does invalidateQueries do after a mutation?', 'Marks matching queries stale so they refetch.'],
          ],
          prereqs: ['Zustand and Redux Toolkit'],
        },
        {
          title: 'REST calls, errors and networking',
          description: 'fetch and axios with base URLs, interceptors for auth headers and token refresh, timeouts and AbortController, mapping HTTP errors to messages, and NetInfo for connectivity. REST design is in the REST API track.',
          concepts: ['fetch versus axios', 'Auth interceptors and refresh', 'Timeouts with AbortController', 'Error mapping', 'NetInfo connectivity'],
          quiz: [
            ['Does fetch reject on a 500 response?', 'No; check response.ok yourself.'],
            ['Why use a single-flight token refresh?', 'Parallel 401s would otherwise trigger multiple refreshes and invalidate each other.'],
          ],
          prereqs: ['Data fetching with TanStack Query'],
        },
        {
          title: 'Storage: AsyncStorage, MMKV, SecureStore and SQLite',
          description: 'AsyncStorage for simple key-value, MMKV for fast synchronous storage, expo-secure-store for tokens in Keychain and Keystore, and expo-sqlite or WatermelonDB for relational offline data.',
          concepts: ['AsyncStorage basics', 'MMKV synchronous storage', 'SecureStore for secrets', 'expo-sqlite queries', 'Choosing a store'],
          quiz: [
            ['Where should an auth token live?', 'expo-secure-store, which uses Keychain and Keystore.'],
            ['Why prefer MMKV over AsyncStorage?', 'It is synchronous and far faster, so reads do not need a loading state.'],
          ],
          prereqs: ['REST calls, errors and networking'],
        },
      ],
    },
    {
      title: 'Native Modules and Platform APIs',
      topics: [
        {
          title: 'The new architecture: Fabric, TurboModules and JSI',
          description: 'JSI replaces the asynchronous JSON bridge with direct synchronous access, Fabric renders with a C++ shadow tree, TurboModules lazy-load native modules with typed codegen, and bridgeless mode is now the default.',
          concepts: ['JSI direct calls', 'Fabric renderer and shadow tree', 'TurboModules and codegen', 'Bridgeless mode', 'Migration and library compatibility'],
          quiz: [
            ['What problem did the old bridge have?', 'Every call was serialised to JSON and queued asynchronously, causing latency and jank.'],
            ['What does codegen generate?', 'Native interfaces from TypeScript specs so modules are type-checked on both sides.'],
          ],
          prereqs: ['How React Native works'],
        },
        {
          title: 'Writing native modules with Expo Modules API',
          description: 'Creating a local module with Swift and Kotlin definitions, exposing functions, async functions and events, typed records, and native views; the Expo Modules API removes most boilerplate of a raw TurboModule.',
          concepts: ['Module definition in Swift and Kotlin', 'Functions and AsyncFunctions', 'Events to JavaScript', 'Native views from modules', 'Local modules versus packages'],
          quiz: [
            ['How do you create a local module?', 'npx create-expo-module --local, then implement the Swift and Kotlin files.'],
            ['How does a module send events?', 'Declare Events("onChange") and call sendEvent from native.'],
          ],
          prereqs: ['The new architecture: Fabric, TurboModules and JSI'],
        },
        {
          title: 'Platform-specific code',
          description: 'Platform.OS and Platform.select, .ios.tsx and .android.tsx file extensions, platform-specific styling such as shadows versus elevation, native-feeling components per platform, and testing both.',
          concepts: ['Platform.OS and Platform.select', 'Platform file extensions', 'Shadows versus elevation', 'Platform-adaptive components', 'Web target considerations'],
          quiz: [
            ['How does Metro pick Button.ios.tsx?', 'By platform extension when importing ./Button.'],
            ['How do shadows differ between platforms?', 'iOS uses shadow props; Android uses elevation (boxShadow is unified in newer versions).'],
          ],
          prereqs: ['StyleSheet and the styling model'],
        },
        {
          title: 'Permissions and device APIs',
          description: 'Requesting permissions with Expo modules and their status states, camera and image picking, location with foreground and background modes, contacts and calendar, and the Info.plist and manifest entries each needs.',
          concepts: ['Permission status flow', 'expo-camera and expo-image-picker', 'expo-location modes', 'Info.plist and manifest entries', 'Handling denied permissions'],
          quiz: [
            ['What does a permission status of "denied" with canAskAgain false mean?', 'The user must enable it in system settings; offer Linking.openSettings().'],
            ['Where do usage descriptions go in an Expo project?', 'In app.json under ios.infoPlist or via the module\'s config plugin.'],
          ],
          prereqs: ['Writing native modules with Expo Modules API'],
        },
        {
          title: 'Config plugins and prebuild',
          description: 'app.json and app.config.ts drive native configuration; config plugins modify Info.plist, entitlements, Gradle and manifests during prebuild so native projects stay generated rather than hand-edited.',
          concepts: ['app.config.ts', 'Built-in plugin options', 'Writing a config plugin', 'Prebuild and clean regeneration', 'When to eject'],
          quiz: [
            ['Why avoid editing the ios folder by hand in a prebuild project?', 'Prebuild regenerates it and discards manual edits; use a config plugin.'],
            ['When does prebuild run?', 'Before a native build, locally with npx expo prebuild or automatically on EAS.'],
          ],
          prereqs: ['Permissions and device APIs'],
        },
      ],
    },
    {
      title: 'Notifications and Background Work',
      topics: [
        {
          title: 'Push notifications with Expo Notifications',
          description: 'Expo push tokens versus device tokens, registering with APNs and FCM through EAS credentials, sending through the Expo push service or directly, permission requests, and handling notifications in foreground and background.',
          concepts: ['Expo push tokens', 'APNs and FCM credentials', 'Expo push service', 'Foreground handlers', 'Notification response listeners'],
          quiz: [
            ['Do push notifications work in Expo Go?', 'Not on Android since SDK 53; use a development build.'],
            ['How do you react to a notification tap?', 'addNotificationResponseReceivedListener and the last response on cold start.'],
          ],
          prereqs: ['Config plugins and prebuild'],
        },
        {
          title: 'Local and scheduled notifications',
          description: 'Scheduling with date, time interval and calendar triggers, Android channels and importance, categories with action buttons, cancelling and listing scheduled notifications, and badge counts.',
          concepts: ['Notification triggers', 'Android channels', 'Categories and actions', 'Cancelling scheduled notifications', 'Badge management'],
          quiz: [
            ['Why create an Android notification channel?', 'Android 8+ drops notifications without one, and users control importance per channel.'],
            ['How do you schedule a daily reminder?', 'A calendar trigger with hour, minute and repeats true.'],
          ],
          prereqs: ['Push notifications with Expo Notifications'],
        },
        {
          title: 'Background tasks and app state',
          description: 'AppState for foreground and background transitions, expo-task-manager with background fetch and location tasks, OS limits on background execution, and designing sync so it works when the app is next opened.',
          concepts: ['AppState listeners', 'expo-task-manager tasks', 'Background fetch limits', 'Background location', 'Sync-on-open design'],
          quiz: [
            ['How reliable is background fetch?', 'Opportunistic; the OS decides when, so it must not be the only sync path.'],
            ['What runs when a background task fires?', 'A task registered with TaskManager.defineTask at the module top level.'],
          ],
          prereqs: ['Local and scheduled notifications'],
        },
      ],
    },
    {
      title: 'Animations and Gestures',
      topics: [
        {
          title: 'Reanimated fundamentals',
          description: 'Shared values live on the UI thread, worklets run there without crossing to JS, useAnimatedStyle derives styles from shared values, and runOnJS bridges back when needed. This is why Reanimated stays smooth while the JS thread is busy.',
          concepts: ['useSharedValue', 'Worklets on the UI thread', 'useAnimatedStyle', 'runOnJS and runOnUI', 'Animated components'],
          quiz: [
            ['Why is Reanimated smoother than the old Animated API with useNativeDriver false?', 'Animations run on the UI thread as worklets, so JS thread stalls do not drop frames.'],
            ['When do you need runOnJS?', 'To call a normal JavaScript function such as setState from a worklet.'],
          ],
          prereqs: ['StyleSheet and the styling model'],
        },
        {
          title: 'Timing, spring and layout animations',
          description: 'withTiming and withSpring with easing and callbacks, withSequence and withRepeat, entering and exiting animations, and layout transitions that animate list reorders automatically.',
          concepts: ['withTiming and withSpring', 'withSequence and withRepeat', 'Entering and exiting animations', 'Layout transitions', 'Animation callbacks'],
          quiz: [
            ['How do you animate a list item being removed?', 'Add an exiting animation such as FadeOut to the Animated.View.'],
            ['What does withSpring(1, { damping: 15 }) control?', 'The bounciness; higher damping settles faster.'],
          ],
          prereqs: ['Reanimated fundamentals'],
        },
        {
          title: 'Gesture Handler',
          description: 'The Gesture API: Gesture.Pan, Tap and Pinch with onBegin, onUpdate and onEnd worklets, composing with Simultaneous, Race and Exclusive, GestureDetector, and coordinating gestures with scroll views.',
          concepts: ['GestureDetector and Gesture.Pan', 'Gesture callbacks as worklets', 'Simultaneous, Race and Exclusive', 'Gestures inside scroll views', 'Haptic feedback on gesture events'],
          quiz: [
            ['Why must GestureHandlerRootView wrap the app?', 'Gesture Handler needs a native root to intercept touches.'],
            ['How do you let a pan and a pinch work together?', 'Gesture.Simultaneous(pan, pinch).'],
          ],
          prereqs: ['Reanimated fundamentals'],
        },
        {
          title: 'Building interactions',
          description: 'Combining gestures and Reanimated into real components: a bottom sheet with snap points, swipe-to-delete rows, a draggable card with spring return, and skeleton and pull-to-refresh effects, with interpolation for derived values.',
          concepts: ['Bottom sheet with snap points', 'Swipe-to-delete rows', 'Draggable card with spring return', 'interpolate and Extrapolation', 'Skeleton loaders'],
          quiz: [
            ['How do you map a drag distance to opacity?', 'interpolate(translateY.value, [0, 200], [1, 0], Extrapolation.CLAMP).'],
            ['What snaps a sheet to the nearest point?', 'On release, choose the closest snap point and withSpring to it.'],
          ],
          prereqs: ['Timing, spring and layout animations', 'Gesture Handler'],
        },
      ],
    },
    {
      title: 'Performance',
      topics: [
        {
          title: 'Re-renders and memoisation',
          description: 'Finding wasted renders with the React profiler, React.memo for list rows, useCallback and useMemo where they pay off, avoiding inline objects in props, and selectors so stores do not re-render whole screens.',
          concepts: ['Profiling renders', 'React.memo for rows', 'useCallback and useMemo trade-offs', 'Inline object and style pitfalls', 'Store selectors'],
          quiz: [
            ['Why does style={{ padding: 8 }} defeat React.memo?', 'A new object each render changes the prop identity.'],
            ['Should everything be wrapped in useMemo?', 'No; memoise only when profiling shows a cost, since memoisation has its own overhead.'],
          ],
          prereqs: ['Lists with FlatList and FlashList'],
        },
        {
          title: 'List performance',
          description: 'Tuning FlatList with getItemLayout, windowSize, initialNumToRender and removeClippedSubviews, keeping rows shallow and memoised, image sizing, and when FlashList or a native list is the fix.',
          concepts: ['getItemLayout', 'windowSize and initialNumToRender', 'Memoised rows', 'Image sizing in rows', 'FlashList migration'],
          quiz: [
            ['What does getItemLayout enable?', 'Skipping measurement so scrollToIndex and layout are instant for fixed-height rows.'],
            ['What causes blank areas while scrolling fast?', 'Rows rendering slower than the scroll; reduce row cost or increase windowSize.'],
          ],
          prereqs: ['Re-renders and memoisation'],
        },
        {
          title: 'Hermes, startup and bundle size',
          description: 'Hermes precompiles JavaScript to bytecode for fast startup and low memory, measuring time to interactive, lazy requires and code splitting with dynamic imports, and shrinking assets and dependencies.',
          concepts: ['Hermes bytecode', 'Measuring startup time', 'Lazy and inline requires', 'Dependency and asset audits', 'Source maps for Hermes'],
          quiz: [
            ['Why does Hermes improve startup?', 'Bytecode is precompiled at build time, so the app does not parse and compile JS on launch.'],
            ['How do you see what is in the bundle?', 'Analyse the Metro bundle with a source map explorer.'],
          ],
          prereqs: ['How React Native works'],
        },
        {
          title: 'Threads, profiling and jank',
          description: 'JS FPS versus UI FPS in the perf monitor, why heavy JS blocks touches and animations, InteractionManager and deferring work, native profiling with Instruments and Android Profiler, and moving work to Reanimated worklets or native.',
          concepts: ['Perf monitor JS and UI FPS', 'JS thread blocking symptoms', 'InteractionManager and deferring', 'Native profilers', 'Moving work off the JS thread'],
          quiz: [
            ['What does a dropped JS FPS with steady UI FPS mean?', 'JavaScript is busy; touches and JS-driven animations will lag while native animations continue.'],
            ['How do you profile a native hang?', 'Instruments Time Profiler on iOS or the Android Studio profiler.'],
          ],
          prereqs: ['Hermes, startup and bundle size', 'Reanimated fundamentals'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'Jest and React Native Testing Library',
          description: 'The jest-expo preset, rendering components with render, querying by text, role and testID, firing press and change events, async findBy queries, and testing hooks with renderHook.',
          concepts: ['jest-expo preset', 'render and screen queries', 'fireEvent and userEvent', 'findBy and waitFor', 'renderHook for hooks'],
          quiz: [
            ['How do you find a button in a test?', 'screen.getByRole("button", { name: "Save" }) or getByText.'],
            ['Why prefer findBy over getBy after an async action?', 'findBy waits for the element to appear instead of failing immediately.'],
          ],
          prereqs: ['Text input, keyboard and forms'],
        },
        {
          title: 'Mocking native modules and network',
          description: 'jest.mock for native modules that cannot run on the JVM, setup files for common mocks, Mock Service Worker for network responses, mocking navigation, and testing components that use TanStack Query.',
          concepts: ['jest.mock for native modules', 'Setup files and preset mocks', 'MSW for network', 'Mocking navigation hooks', 'Query client wrappers in tests'],
          quiz: [
            ['Why mock native modules in Jest?', 'Jest runs in Node without native code, so real modules throw.'],
            ['How do you render a component that uses useQuery?', 'Wrap it in a QueryClientProvider with retries disabled.'],
          ],
          prereqs: ['Jest and React Native Testing Library'],
        },
        {
          title: 'End-to-end tests with Detox and Maestro',
          description: 'Detox drives the real app on simulators with synchronisation to avoid flakiness; Maestro uses YAML flows for quick coverage. Configuring builds, writing a login flow, and running E2E in CI.',
          concepts: ['Detox configuration and builds', 'Detox matchers and actions', 'Maestro YAML flows', 'Choosing Detox versus Maestro', 'E2E in CI'],
          quiz: [
            ['What makes Detox less flaky than raw UI automation?', 'It waits for the app to be idle before each action.'],
            ['When is Maestro a better fit?', 'Fast, low-maintenance flows without a build integration.'],
          ],
          prereqs: ['Mocking native modules and network'],
        },
      ],
    },
    {
      title: 'Builds and Release',
      topics: [
        {
          title: 'EAS Build',
          description: 'Cloud builds for iOS and Android from eas.json profiles, managed credentials for signing, development, preview and production profiles, internal distribution, and building locally with eas build --local.',
          concepts: ['eas.json build profiles', 'Managed credentials', 'Internal distribution builds', 'Local builds', 'Build caching and cost'],
          quiz: [
            ['Can you build iOS on Windows with EAS?', 'Yes; the build runs on EAS macOS workers.'],
            ['What is a preview profile for?', 'Internal builds testers install directly without the stores.'],
          ],
          prereqs: ['Config plugins and prebuild'],
        },
        {
          title: 'EAS Update and over-the-air updates',
          description: 'Publishing JavaScript and asset updates to a channel without a store release, runtime versions that gate compatibility, rollbacks, and what cannot be changed over the air.',
          concepts: ['Channels and branches', 'Runtime version policy', 'Publishing and rollbacks', 'What OTA cannot change', 'Store policy compliance'],
          quiz: [
            ['Can an OTA update add a native module?', 'No; native changes need a new build with a new runtime version.'],
            ['What does the runtime version do?', 'Ensures an update is only delivered to builds with compatible native code.'],
          ],
          prereqs: ['EAS Build'],
        },
        {
          title: 'App configuration, environments and secrets',
          description: 'app.config.ts reading environment variables, EAS environment variables and secrets, per-environment bundle identifiers, icons and API URLs, and keeping secrets out of the JS bundle.',
          concepts: ['app.config.ts environments', 'EAS environment variables', 'Per-environment identifiers and icons', 'EXPO_PUBLIC_ variables', 'Secrets stay server-side'],
          quiz: [
            ['Are EXPO_PUBLIC_ variables secret?', 'No; they are inlined into the bundle and visible to anyone.'],
            ['How do you give staging a different app icon?', 'Branch on an environment variable in app.config.ts.'],
          ],
          prereqs: ['EAS Build'],
        },
        {
          title: 'Store submission and release management',
          description: 'EAS Submit to TestFlight and Play tracks, version and build number management with autoIncrement, App Review and Play policy requirements, privacy declarations, staged rollouts, and crash reporting with Sentry.',
          concepts: ['EAS Submit', 'Version and build autoIncrement', 'Review and policy requirements', 'Privacy declarations', 'Crash reporting with Sentry'],
          quiz: [
            ['What does eas submit need for iOS?', 'App Store Connect credentials or an API key and an existing app record.'],
            ['Why upload source maps to Sentry?', 'So minified Hermes stack traces map back to your TypeScript.'],
          ],
          prereqs: ['EAS Update and over-the-air updates', 'App configuration, environments and secrets'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Apps that exercise the whole track, then the questions hiring teams ask.',
      topics: [
        {
          title: 'Project: notes app with offline sync',
          description: 'A notes app with expo-sqlite as the source of truth, TanStack Query mutations queued offline and replayed on reconnect, conflict resolution by updated-at, Expo Router navigation, and tests for the sync queue.',
          concepts: ['SQLite schema and repository', 'List and editor screens', 'Offline mutation queue', 'Conflict resolution', 'Sync queue tests'],
          quiz: [
            ['How do you detect reconnect?', 'NetInfo or onlineManager from TanStack Query.'],
            ['Why persist the mutation queue?', 'So pending changes survive app restarts.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: weather app',
          description: 'Current and hourly weather for the device location with expo-location and a weather API through TanStack Query, cached last result, Reanimated condition animations, a tablet layout, and graceful permission denial.',
          concepts: ['Location permission flow', 'Weather queries and caching', 'Animated condition UI', 'Responsive layout', 'Denied permission fallback'],
          quiz: [
            ['What shows when location is denied?', 'City search plus a link to settings.'],
            ['How do you show cached data instantly?', 'Persist the query cache and render while refetching.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce catalogue with cart',
          description: 'A product grid with FlashList and infinite queries, search with debounce, product detail with shared-element style transitions, a cart in Zustand with MMKV persistence, checkout form validation, and Detox tests for checkout.',
          concepts: ['Paged product grid', 'Debounced search', 'Detail transitions', 'Cart store with persistence', 'Checkout form and E2E test'],
          quiz: [
            ['How do you load more products on scroll?', 'onEndReached calling fetchNextPage.'],
            ['Where does the cart persist?', 'Zustand persist middleware backed by MMKV.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: habit tracker with notifications',
          description: 'Daily habits with streaks, per-habit scheduled local notifications, a monthly heatmap, SQLite persistence, background-safe reminder rescheduling on app open, and unit tests for streak logic.',
          concepts: ['Habit and completion schema', 'Streak calculation', 'Scheduled reminders', 'Heatmap component', 'Streak tests'],
          quiz: [
            ['Why reschedule reminders on app open?', 'Scheduled notifications can be cleared by reinstalls or OS limits.'],
            ['Where does streak logic live?', 'In a pure TypeScript module testable with Jest.'],
          ],
          style: 'project',
        },
        {
          title: 'React Native interview questions',
          description: 'The questions that keep coming up: how React Native renders, JS versus UI thread, the new architecture, Expo versus bare, FlatList internals, Reanimated worklets, OTA updates and store rules, and why an app janks.',
          concepts: ['Architecture questions', 'Threading and performance questions', 'Navigation and state questions', 'Expo and tooling questions', 'Release and OTA questions'],
          quiz: [
            ['What does the new architecture change for developers?', 'Synchronous native access via JSI, faster rendering with Fabric and typed native modules.'],
            ['Why do animations stutter when a large list updates?', 'The JS thread is busy rendering; move animations to the UI thread with Reanimated.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live coding a React Native screen',
          description: 'Building a list-detail screen from an API in an interview: type the data, fetch with useQuery, render with FlatList and memoised rows, navigate with typed params, handle loading and error states, and explain testing.',
          concepts: ['Type the API data first', 'useQuery with loading and error', 'FlatList with memoised rows', 'Typed navigation to detail', 'Explaining tests'],
          quiz: [
            ['Which list component do you reach for?', 'FlatList, with keyExtractor and a memoised row.'],
            ['What do you show before data arrives?', 'A loading indicator, then an error state with retry if it fails.'],
          ],
        },
      ],
    },
  ],
})
