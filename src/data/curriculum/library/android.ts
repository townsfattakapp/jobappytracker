import { defineTrack } from '../define'

export const android = defineTrack({
  id: 'track-android',
  title: 'Android Development',
  description: 'Modern Android in Kotlin: app components and the activity lifecycle, Jetpack Compose UI, Compose Navigation, ViewModels and unidirectional data flow, coroutines and Flow, Room and DataStore, Retrofit, Hilt, WorkManager, notifications, testing, profiling, security and Play Store releases.',
  family: 'Mobile Development',
  kind: 'framework',
  icon: '🤖',
  tags: ['android', 'kotlin', 'jetpack-compose', 'mobile', 'room', 'hilt', 'coroutines', 'play-store'],
  languages: ['Kotlin'],
  explainMode: 'concept',
  code: { label: 'Kotlin with Android', id: 'kotlin', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-kotlin'],
  style: 'code',
  categories: [
    {
      title: 'Android Platform and Project Setup',
      description: 'How an Android app is assembled, launched and kept alive by the operating system.',
      topics: [
        {
          title: 'Kotlin features Android code relies on',
          description: 'A quick recap of the Kotlin that appears in every Android file: data classes and sealed interfaces for UI state, lambdas with receivers and trailing lambdas, scope functions, extension functions, and suspend functions. The Kotlin track covers each in depth.',
          concepts: ['Data classes and sealed interfaces for state', 'Trailing lambdas and lambdas with receivers', 'Scope functions in Android code', 'Extension functions on Context and View', 'suspend functions recap'],
          quiz: [
            ['Why model UI state as a sealed interface?', 'A when over it is exhaustive, so every Loading, Success and Error case is handled.'],
            ['What makes Column { Text("hi") } valid syntax?', 'The last parameter is a lambda, so it can be written outside the parentheses.'],
          ],
        },
        {
          title: 'Android Studio, Gradle and version catalogs',
          description: 'The build system that turns Kotlin into an APK: the Gradle wrapper, project versus module build files, the Kotlin DSL, the libs.versions.toml version catalog, Gradle sync, and reading build errors.',
          concepts: ['Gradle wrapper and sync', 'Project and module build files', 'libs.versions.toml version catalog', 'Build types and dependencies block', 'Emulator and device setup'],
          quiz: [
            ['Where do dependency versions live in a modern project?', 'In gradle/libs.versions.toml, referenced as libs.xxx in build files.'],
            ['What does compileSdk control?', 'The API level the code is compiled against; targetSdk controls runtime behaviour compatibility.'],
          ],
        },
        {
          title: 'App components and the manifest',
          description: 'The four component types (Activity, Service, BroadcastReceiver, ContentProvider), how AndroidManifest.xml declares them with intent filters and permissions, and how the system instantiates them on demand rather than through a main function.',
          concepts: ['Activities, services, receivers and providers', 'Manifest declarations and intent filters', 'Launcher activity and exported flag', 'Application class and process start'],
          quiz: [
            ['What makes an activity appear in the launcher?', 'An intent filter with action MAIN and category LAUNCHER.'],
            ['Why must exported be declared on components with intent filters?', 'Since Android 12 the system refuses to install apps that leave it implicit, to prevent accidental exposure.'],
          ],
          prereqs: ['Android Studio, Gradle and version catalogs'],
        },
        {
          title: 'Activity lifecycle and configuration changes',
          description: 'onCreate through onDestroy, what happens on rotation and locale change (the activity is recreated), how the back stack and task affinity work, and why state must survive both configuration change and process death.',
          concepts: ['Lifecycle callbacks in order', 'Recreation on configuration change', 'Back stack and tasks', 'onSaveInstanceState', 'Process death'],
          quiz: [
            ['Which callback runs when the app goes to the background but is still visible?', 'onPause; onStop follows when it is fully hidden.'],
            ['Why does rotating the phone lose a plain field in the activity?', 'The activity is destroyed and recreated; only saved state or a ViewModel survives.'],
          ],
          prereqs: ['App components and the manifest'],
        },
        {
          title: 'Intents and inter-app communication',
          description: 'Explicit intents to start your own components, implicit intents resolved by the system (share, dial, view URL), extras and parcelables, intent filters that let other apps open yours, and PendingIntent for deferred actions.',
          concepts: ['Explicit versus implicit intents', 'Extras and Parcelize', 'Resolving implicit intents safely', 'PendingIntent and its flags'],
          quiz: [
            ['How do you open a web page in the browser?', 'Intent(Intent.ACTION_VIEW, Uri.parse(url)) and startActivity.'],
            ['Why is FLAG_IMMUTABLE recommended for PendingIntent?', 'It stops other apps from altering the wrapped intent before it fires.'],
          ],
          prereqs: ['App components and the manifest'],
        },
      ],
    },
    {
      title: 'Jetpack Compose Fundamentals',
      description: 'Declarative UI: describe what the screen looks like for a given state and let the runtime recompose.',
      topics: [
        {
          title: 'Composable functions and recomposition',
          description: 'A @Composable function emits UI into the composition; when state it reads changes the runtime re-runs only that function. Preview annotations, slot APIs with composable lambdas, and why composables must be fast and idempotent.',
          concepts: ['@Composable and the composition', 'Recomposition scope', 'Slot APIs with composable lambdas', '@Preview and tooling', 'Idempotent and side-effect-free composables'],
          quiz: [
            ['What triggers recomposition?', 'A change to a State object read during composition.'],
            ['Why must a composable not launch a coroutine directly in its body?', 'The body may run many times; use LaunchedEffect or a scope so the work runs once.'],
          ],
          prereqs: ['Kotlin features Android code relies on'],
        },
        {
          title: 'State: remember, mutableStateOf and hoisting',
          description: 'remember keeps a value across recompositions, mutableStateOf makes reads observable, rememberSaveable survives recreation, and state hoisting moves state to the caller so composables stay stateless and reusable.',
          concepts: ['remember and mutableStateOf', 'rememberSaveable and Saver', 'State hoisting pattern', 'Stateless versus stateful composables', 'Delegated by syntax'],
          quiz: [
            ['What is the difference between remember and rememberSaveable?', 'rememberSaveable also survives configuration change and process death via a Bundle.'],
            ['What does hoisting a TextField value achieve?', 'The caller owns the value and onValueChange, so it can validate, save and test it.'],
          ],
          prereqs: ['Composable functions and recomposition'],
        },
        {
          title: 'Layouts and Modifiers',
          description: 'Column, Row and Box, arrangement and alignment, the Modifier chain where order matters (padding before background versus after), weight, fillMaxWidth, and the single-pass constraints model that makes Compose layout fast.',
          concepts: ['Column, Row and Box', 'Arrangement and Alignment', 'Modifier order semantics', 'weight and size modifiers', 'Constraints and single-pass measurement'],
          quiz: [
            ['What does Modifier.padding(8.dp).background(Red) draw?', 'A red box inside the padding; swap the order to colour the padding too.'],
            ['How do two children share a Row equally?', 'Give each Modifier.weight(1f).'],
          ],
          prereqs: ['Composable functions and recomposition'],
        },
        {
          title: 'Material 3 theming in Compose',
          description: 'MaterialTheme with a ColorScheme, Typography and Shapes, dynamic colour from the wallpaper on Android 12+, dark theme, and reading theme values from composables so components stay consistent.',
          concepts: ['MaterialTheme and ColorScheme', 'Dynamic colour on Android 12+', 'Typography and Shapes', 'Dark theme switching', 'Custom design tokens with CompositionLocal'],
          quiz: [
            ['How do you get the wallpaper-based palette?', 'dynamicLightColorScheme(context) or dynamicDarkColorScheme when Build.VERSION.SDK_INT >= 31.'],
            ['How does a composable read the primary colour?', 'MaterialTheme.colorScheme.primary.'],
          ],
          prereqs: ['Layouts and Modifiers'],
        },
        {
          title: 'Lists with LazyColumn and LazyVerticalGrid',
          description: 'Lazy layouts compose only visible items: items with stable keys, contentType, sticky headers, LazyVerticalGrid, list state for scroll position and scroll-to, and why keys stop item state from jumping between rows.',
          concepts: ['LazyColumn items and keys', 'contentType and reuse', 'Sticky headers', 'LazyVerticalGrid cells', 'LazyListState and scrolling'],
          quiz: [
            ['Why give items a key?', 'So recomposition and item state follow the data when the list is reordered or filtered.'],
            ['What does rememberLazyListState let you do?', 'Read and control scroll position, such as animateScrollToItem.'],
          ],
          prereqs: ['Layouts and Modifiers'],
        },
        {
          title: 'Side effects and effect handlers',
          description: 'Running non-UI work from composables safely: LaunchedEffect keyed to inputs, DisposableEffect for cleanup, rememberCoroutineScope for event handlers, SideEffect, derivedStateOf for computed state, and snapshotFlow to observe state as a Flow.',
          concepts: ['LaunchedEffect and keys', 'DisposableEffect cleanup', 'rememberCoroutineScope for callbacks', 'derivedStateOf', 'snapshotFlow'],
          quiz: [
            ['When does LaunchedEffect(userId) restart?', 'When userId changes; the previous coroutine is cancelled.'],
            ['Why use derivedStateOf for showButton = listState.firstVisibleItemIndex > 0?', 'It recomposes readers only when the Boolean flips, not on every scroll pixel.'],
          ],
          prereqs: ['State: remember, mutableStateOf and hoisting'],
        },
      ],
    },
    {
      title: 'Navigation and Screens',
      topics: [
        {
          title: 'Compose Navigation and type-safe routes',
          description: 'NavHost with a NavController, routes defined as @Serializable classes and objects, passing arguments through route objects, popUpTo and launchSingleTop behaviour, and keeping the NavController out of screen composables.',
          concepts: ['NavHost and NavController', '@Serializable route classes', 'Arguments via route objects', 'popUpTo and launchSingleTop', 'Navigation callbacks instead of NavController'],
          quiz: [
            ['How do you avoid a duplicate screen when tapping a bottom tab twice?', 'navigate with launchSingleTop = true.'],
            ['How are typed arguments read on the destination?', 'backStackEntry.toRoute<Detail>().'],
          ],
          prereqs: ['Composable functions and recomposition'],
        },
        {
          title: 'Nested graphs and bottom navigation',
          description: 'Grouping screens into nested graphs per feature, a NavigationBar whose tabs each own a back stack, saveState and restoreState on tab switches, and hoisting the Scaffold so the bar persists across destinations.',
          concepts: ['Nested navigation graphs', 'NavigationBar with saved back stacks', 'currentBackStackEntryAsState', 'Scaffold hoisting across screens'],
          quiz: [
            ['What do saveState and restoreState do on tab switch?', 'Keep each tab\'s back stack and scroll position so returning restores where the user was.'],
            ['Why hoist the Scaffold above the NavHost?', 'So the bottom bar and top bar are not rebuilt or animated on every navigation.'],
          ],
          prereqs: ['Compose Navigation and type-safe routes'],
        },
        {
          title: 'Dialogs, bottom sheets and back handling',
          description: 'AlertDialog and ModalBottomSheet as composables driven by state, dialog destinations in the graph, BackHandler to intercept the back gesture, and predictive back on Android 14+.',
          concepts: ['AlertDialog driven by state', 'ModalBottomSheet and sheet state', 'Dialog destinations', 'BackHandler', 'Predictive back gesture'],
          quiz: [
            ['How do you show a dialog in Compose?', 'Hold a Boolean in state and call AlertDialog when it is true; onDismissRequest sets it false.'],
            ['What does BackHandler(enabled) do?', 'Intercepts the back press while enabled is true, letting the app close a sheet instead of leaving.'],
          ],
          prereqs: ['Compose Navigation and type-safe routes'],
        },
        {
          title: 'Deep links and App Links',
          description: 'Opening a destination from a URL: navDeepLink on a composable destination, intent filters with autoVerify, the assetlinks.json file that proves domain ownership, and testing links with adb.',
          concepts: ['navDeepLink on destinations', 'Intent filters with autoVerify', 'assetlinks.json verification', 'Testing links with adb'],
          quiz: [
            ['Which adb command opens a deep link?', 'adb shell am start -a android.intent.action.VIEW -d "https://example.com/item/3".'],
            ['What breaks if assetlinks.json is missing?', 'Links open the disambiguation dialog or browser instead of the app.'],
          ],
          prereqs: ['Nested graphs and bottom navigation'],
        },
      ],
    },
    {
      title: 'Architecture and State Holders',
      description: 'UI layer, domain layer, data layer, and the state that flows between them.',
      topics: [
        {
          title: 'ViewModel and lifecycle scope',
          description: 'ViewModel outlives activity recreation and is cleared when the screen finally leaves the back stack. Obtaining one with viewModel() or hiltViewModel(), scoping to a navigation graph, and what must not be stored in it (Context, Views).',
          concepts: ['ViewModel survival across recreation', 'viewModel() and hiltViewModel()', 'Scoping to a nav graph', 'onCleared', 'No Context in ViewModels'],
          quiz: [
            ['When is a ViewModel cleared?', 'When its owner is finished for good, such as the screen being popped, not on rotation.'],
            ['Why not keep an Activity reference in a ViewModel?', 'The activity is recreated; the reference leaks the old one.'],
          ],
          prereqs: ['Activity lifecycle and configuration changes', 'State: remember, mutableStateOf and hoisting'],
        },
        {
          title: 'UI state and unidirectional data flow',
          description: 'A single UiState data class or sealed interface exposed as StateFlow, events sent up as function calls, loading and error modelled explicitly, and one-off effects (snackbars, navigation) kept out of persistent state.',
          concepts: ['UiState as a data class', 'StateFlow exposure with update', 'Events up, state down', 'One-off effects versus state', 'Immutable collections in state'],
          quiz: [
            ['Why expose StateFlow rather than MutableStateFlow?', 'So the UI cannot mutate state; only the ViewModel does through its methods.'],
            ['How should a one-time navigation be modelled?', 'As a consumed event or channel, not a persistent field that would fire again on recomposition.'],
          ],
          prereqs: ['ViewModel and lifecycle scope'],
        },
        {
          title: 'SavedStateHandle and surviving process death',
          description: 'The system may kill a backgrounded app and later restore it; SavedStateHandle in a ViewModel keeps small state and navigation arguments through that, and getStateFlow ties it to the UI state.',
          concepts: ['Process death versus recreation', 'SavedStateHandle in ViewModel', 'Navigation arguments from SavedStateHandle', 'Testing process death with adb'],
          quiz: [
            ['Does a ViewModel survive process death?', 'No; only SavedStateHandle contents, which are written to the saved Bundle, are restored.'],
            ['How do you simulate process death?', 'Background the app and run adb shell am kill <package>, then reopen it.'],
          ],
          prereqs: ['UI state and unidirectional data flow'],
        },
        {
          title: 'Repositories, data sources and use cases',
          description: 'Layering the app: repositories combine remote and local sources behind one interface, optional use cases hold reusable business rules, and the UI depends on interfaces so implementations can be swapped in tests.',
          concepts: ['Repository interface and implementation', 'Remote and local data sources', 'Use cases for business rules', 'Offline-first single source of truth', 'Module boundaries'],
          quiz: [
            ['What is the single source of truth in an offline-first app?', 'The local database; the network only updates it and the UI observes it.'],
            ['When is a use case class worth it?', 'When logic is reused across ViewModels or is complex enough to test on its own.'],
          ],
          prereqs: ['UI state and unidirectional data flow'],
        },
      ],
    },
    {
      title: 'Coroutines and Flow in Android',
      topics: [
        {
          title: 'Coroutine scopes and dispatchers on Android',
          description: 'viewModelScope and lifecycleScope cancel work automatically, Dispatchers.Main for UI, IO for blocking calls and Default for CPU work, withContext to switch, and why main-safe suspend functions belong in the data layer.',
          concepts: ['viewModelScope and lifecycleScope', 'Main, IO and Default dispatchers', 'withContext switching', 'Main-safe suspend functions', 'Structured concurrency and cancellation'],
          quiz: [
            ['Where should a Retrofit call switch to Dispatchers.IO?', 'It does not need to; Retrofit suspend functions are already main-safe. Room is too.'],
            ['What happens to viewModelScope jobs when the ViewModel is cleared?', 'They are cancelled.'],
          ],
          prereqs: ['ViewModel and lifecycle scope'],
        },
        {
          title: 'Collecting Flow safely in the UI',
          description: 'collectAsStateWithLifecycle in Compose stops collection when the app is backgrounded, repeatOnLifecycle for non-Compose code, stateIn with WhileSubscribed(5000) for shared upstream flows, and avoiding leaks from collecting in the wrong scope.',
          concepts: ['collectAsStateWithLifecycle', 'repeatOnLifecycle', 'stateIn and WhileSubscribed', 'Lifecycle-aware collection pitfalls'],
          quiz: [
            ['Why WhileSubscribed(5000)?', 'The upstream keeps running for five seconds after the last collector, surviving rotation without restarting.'],
            ['What is wrong with collectAsState for a repository flow?', 'It keeps collecting while the app is in the background, wasting work.'],
          ],
          prereqs: ['Coroutine scopes and dispatchers on Android'],
        },
        {
          title: 'Flow operators, StateFlow and SharedFlow',
          description: 'Cold flows from Room and callbacks, map, filter, combine and flatMapLatest for search-as-you-type, debounce, and the hot StateFlow versus SharedFlow choice for state versus events.',
          concepts: ['Cold flows and callbackFlow', 'combine and flatMapLatest', 'debounce and distinctUntilChanged', 'StateFlow versus SharedFlow', 'Channels for one-off events'],
          quiz: [
            ['Which operator restarts a search when the query changes?', 'flatMapLatest, which cancels the previous inner flow.'],
            ['Why is SharedFlow risky for navigation events?', 'Without a subscriber at emit time the event is dropped unless replay or a Channel is used.'],
          ],
          prereqs: ['Collecting Flow safely in the UI'],
        },
        {
          title: 'Error handling and cancellation in coroutines',
          description: 'try/catch around suspend calls, catch on flows, CancellationException must be rethrown, SupervisorJob for independent children, CoroutineExceptionHandler, and timeouts with withTimeout.',
          concepts: ['try/catch versus Flow catch', 'Never swallow CancellationException', 'SupervisorJob and supervisorScope', 'CoroutineExceptionHandler', 'withTimeout'],
          quiz: [
            ['Why is catch (e: Exception) in a coroutine dangerous?', 'It catches CancellationException and stops cancellation from propagating.'],
            ['What does Flow.catch handle?', 'Exceptions from upstream operators only, not from the collector.'],
          ],
          prereqs: ['Flow operators, StateFlow and SharedFlow'],
        },
      ],
    },
    {
      title: 'Persistence',
      topics: [
        {
          title: 'Room entities, DAOs and the database',
          description: 'Room compiles SQL at build time: @Entity tables, @Dao interfaces with suspend and Flow queries, @Database with the version, KSP for code generation, and why queries returning Flow drive reactive UI for free. SQL syntax is in the SQL track.',
          concepts: ['@Entity and primary keys', '@Dao suspend and Flow queries', '@Database and KSP', 'Type converters', 'Room database as singleton'],
          quiz: [
            ['What does a @Query returning Flow<List<Item>> do?', 'Emits a new list whenever the underlying tables change.'],
            ['Why does Room reject a query on the main thread?', 'To prevent jank; use suspend functions or Flow.'],
          ],
          prereqs: ['Repositories, data sources and use cases'],
        },
        {
          title: 'Room migrations and relations',
          description: 'Changing the schema without losing data: Migration objects with SQL, auto-migrations with @AutoMigration, exporting schemas for tests, and modelling one-to-many and many-to-many relations with @Relation and junction tables.',
          concepts: ['Manual Migration objects', 'AutoMigration and schema export', 'Testing migrations', '@Relation and @Embedded', 'Junction tables and indices'],
          quiz: [
            ['What happens on a version bump with no migration?', 'Room throws unless fallbackToDestructiveMigration is set, which wipes the data.'],
            ['Where does @Relation put the child list?', 'In a separate data class that embeds the parent and holds the children.'],
          ],
          prereqs: ['Room entities, DAOs and the database'],
        },
        {
          title: 'DataStore for preferences and typed data',
          description: 'The replacement for SharedPreferences: Preferences DataStore with typed keys and a Flow of values, Proto DataStore for structured data, transactional edits with edit, and the single-instance rule per file.',
          concepts: ['Preferences DataStore keys', 'Reading as Flow', 'edit for atomic updates', 'Proto DataStore', 'One instance per file'],
          quiz: [
            ['Why prefer DataStore over SharedPreferences?', 'Asynchronous, transactional and safe from main-thread blocking and lost updates.'],
            ['How do you read a preference once in a suspend function?', 'dataStore.data.first()[KEY].'],
          ],
          prereqs: ['Coroutine scopes and dispatchers on Android'],
        },
        {
          title: 'Files, scoped storage and the photo picker',
          description: 'App-private files in filesDir and cacheDir, scoped storage rules since Android 10, MediaStore for shared media, the system photo picker that needs no permission, and Storage Access Framework for arbitrary documents.',
          concepts: ['filesDir and cacheDir', 'Scoped storage rules', 'MediaStore queries', 'Photo picker contract', 'Storage Access Framework'],
          quiz: [
            ['Does the photo picker need READ_MEDIA_IMAGES?', 'No; it returns URIs the user chose without any permission.'],
            ['Where should downloaded cache files go?', 'cacheDir, which the system may clear when space is low.'],
          ],
          prereqs: ['Intents and inter-app communication'],
        },
      ],
    },
    {
      title: 'Networking',
      topics: [
        {
          title: 'Retrofit and OkHttp',
          description: 'Declaring an API as a Kotlin interface with suspend functions, the converter factory, OkHttpClient with interceptors for auth headers, logging and timeouts, and one client instance shared across the app.',
          concepts: ['Retrofit interface and annotations', 'Suspend functions and Response', 'OkHttp interceptors', 'Timeouts and connection pooling', 'Authenticator for token refresh'],
          quiz: [
            ['Difference between returning Item and Response<Item>?', 'Response gives status and headers and does not throw on 4xx or 5xx.'],
            ['What is an OkHttp Authenticator for?', 'Reacting to 401 by refreshing the token and retrying the request.'],
          ],
          prereqs: ['Coroutine scopes and dispatchers on Android'],
        },
        {
          title: 'JSON with kotlinx.serialization and Moshi',
          description: '@Serializable data classes, default values and nullability for missing fields, ignoreUnknownKeys, custom serialisers for dates, and Moshi with KSP as the alternative; mapping DTOs to domain models at the boundary.',
          concepts: ['@Serializable and Json config', 'Defaults for missing fields', 'Custom serialisers', 'Moshi with codegen', 'DTO to domain mapping'],
          quiz: [
            ['What happens when the API adds a field your class lacks?', 'Parsing fails unless ignoreUnknownKeys = true.'],
            ['Why keep DTOs separate from domain models?', 'API shape changes stop at the mapper instead of rippling through the UI.'],
          ],
          prereqs: ['Retrofit and OkHttp'],
        },
        {
          title: 'Result handling, retries and Paging 3',
          description: 'Wrapping calls in a Result or sealed type, mapping HttpException and IOException to user messages, retry with exponential backoff, and Paging 3 with PagingSource, Pager and LazyPagingItems for infinite lists.',
          concepts: ['Result wrappers and error mapping', 'Retry with exponential backoff', 'PagingSource and Pager', 'LazyPagingItems in Compose', 'RemoteMediator for offline paging'],
          quiz: [
            ['What does PagingSource.load return?', 'LoadResult.Page with data and prev and next keys, or LoadResult.Error.'],
            ['How does Compose render paged data?', 'collectAsLazyPagingItems and items(pagingItems) in a LazyColumn.'],
          ],
          prereqs: ['JSON with kotlinx.serialization and Moshi', 'Lists with LazyColumn and LazyVerticalGrid'],
        },
        {
          title: 'Image loading with Coil',
          description: 'AsyncImage for network images with placeholders, crossfade and error states, memory and disk caching, sizing requests to the target to save memory, and preloading for lists.',
          concepts: ['AsyncImage and ImageRequest', 'Placeholders and error fallbacks', 'Memory and disk cache', 'Request sizing and downsampling', 'ImageLoader configuration'],
          quiz: [
            ['Why does Coil downsample images?', 'To decode at the displayed size and avoid OutOfMemoryError from full-resolution bitmaps.'],
            ['How do you share one OkHttp client with Coil?', 'Build an ImageLoader with a custom OkHttp call factory.'],
          ],
          prereqs: ['Retrofit and OkHttp'],
        },
      ],
    },
    {
      title: 'Dependency Injection with Hilt',
      topics: [
        {
          title: 'Hilt setup and constructor injection',
          description: 'Why DI matters for testability, the @HiltAndroidApp application, @AndroidEntryPoint on activities, @Inject constructors, and how Hilt generates components tied to Android lifecycles.',
          concepts: ['Why dependency injection', '@HiltAndroidApp and @AndroidEntryPoint', '@Inject constructors', 'Generated component hierarchy'],
          quiz: [
            ['What does @AndroidEntryPoint do?', 'Generates a base class so Hilt can inject fields into the activity or fragment.'],
            ['When can Hilt inject a class without a module?', 'When it has an @Inject constructor whose parameters Hilt can also provide.'],
          ],
          prereqs: ['Repositories, data sources and use cases'],
        },
        {
          title: 'Modules, bindings and scopes',
          description: '@Module with @Provides for third-party types such as Retrofit and Room, @Binds for interface-to-implementation, @Singleton and ViewModelScoped, qualifiers for multiple bindings of one type, and where each module is installed.',
          concepts: ['@Provides for external types', '@Binds for interfaces', '@Singleton and other scopes', 'Qualifiers', '@InstallIn components'],
          quiz: [
            ['@Provides or @Binds for a repository interface?', '@Binds, which is cheaper and only needs an abstract function.'],
            ['How do you inject two different OkHttpClients?', 'Define a @Qualifier annotation for each and apply it at the provider and injection site.'],
          ],
          prereqs: ['Hilt setup and constructor injection'],
        },
        {
          title: 'Hilt with ViewModels and tests',
          description: '@HiltViewModel with @Inject constructors and hiltViewModel() in Compose, injecting SavedStateHandle, and swapping bindings in tests with @HiltAndroidTest, @UninstallModules and test modules.',
          concepts: ['@HiltViewModel and hiltViewModel()', 'Injecting SavedStateHandle', '@HiltAndroidTest setup', 'Replacing modules in tests'],
          quiz: [
            ['How does a ViewModel get SavedStateHandle with Hilt?', 'Declare it as a constructor parameter; Hilt provides it automatically.'],
            ['What does @UninstallModules do?', 'Removes a production module in a test so a test module can provide fakes.'],
          ],
          prereqs: ['Modules, bindings and scopes', 'SavedStateHandle and surviving process death'],
        },
      ],
    },
    {
      title: 'Background Work and System Integration',
      topics: [
        {
          title: 'WorkManager',
          description: 'Deferrable guaranteed work that survives restarts: OneTimeWorkRequest and PeriodicWorkRequest, constraints such as network and charging, CoroutineWorker, chaining and unique work, and observing progress with WorkInfo.',
          concepts: ['CoroutineWorker doWork', 'Constraints and backoff', 'Periodic work limits', 'Chaining and unique work', 'WorkInfo observation'],
          quiz: [
            ['What is the minimum period for PeriodicWorkRequest?', '15 minutes.'],
            ['When should you not use WorkManager?', 'For work that must run at an exact time or immediately while the app is open.'],
          ],
          prereqs: ['Coroutine scopes and dispatchers on Android'],
        },
        {
          title: 'Services and background execution limits',
          description: 'Foreground services with a persistent notification and a declared type, why plain background services are killed on Android 8+, Doze and app standby buckets, and picking WorkManager versus a foreground service versus AlarmManager.',
          concepts: ['Foreground services and types', 'Background execution limits', 'Doze and standby buckets', 'Exact alarms and permissions', 'Choosing the right background API'],
          quiz: [
            ['What must a foreground service show?', 'A notification, within a few seconds of starting.'],
            ['Which permission does an exact alarm require on Android 13+?', 'SCHEDULE_EXACT_ALARM or USE_EXACT_ALARM, depending on the use case.'],
          ],
          prereqs: ['WorkManager'],
        },
        {
          title: 'Runtime permissions',
          description: 'Requesting dangerous permissions with rememberLauncherForActivityResult and RequestPermission, showing a rationale when shouldShowRequestPermissionRationale is true, handling permanent denial, and one-time and approximate location grants.',
          concepts: ['Normal versus dangerous permissions', 'Permission launcher in Compose', 'Rationale flow', 'Permanent denial and settings', 'Approximate and one-time grants'],
          quiz: [
            ['How do you know a permission was permanently denied?', 'The request returns denied and shouldShowRequestPermissionRationale is false.'],
            ['Which permission covers notifications on Android 13+?', 'POST_NOTIFICATIONS.'],
          ],
          prereqs: ['Side effects and effect handlers'],
        },
        {
          title: 'Notifications and Firebase Cloud Messaging',
          description: 'Notification channels and importance, NotificationCompat builders with actions and PendingIntents, grouped and progress notifications, and FCM with FirebaseMessagingService for push, tokens and data payloads.',
          concepts: ['Channels and importance', 'NotificationCompat.Builder', 'Actions and PendingIntents', 'FirebaseMessagingService', 'Token refresh and data payloads'],
          quiz: [
            ['What happens if you post a notification without a channel on Android 8+?', 'It is dropped and a warning is logged.'],
            ['When does onMessageReceived run for a notification payload?', 'Only when the app is in the foreground; otherwise the system shows it directly.'],
          ],
          prereqs: ['Runtime permissions', 'Services and background execution limits'],
        },
        {
          title: 'Sharing, activity results and FileProvider',
          description: 'ActivityResultContracts for picking files, taking photos and returning results without request codes, FileProvider URIs to share app-private files safely, share sheets, and receiving shared content from other apps.',
          concepts: ['ActivityResultContracts', 'TakePicture and GetContent', 'FileProvider and content URIs', 'Share sheet intents', 'Receiving ACTION_SEND'],
          quiz: [
            ['Why can you not pass a file:// URI to another app?', 'Android 7+ throws FileUriExposedException; use a FileProvider content URI.'],
            ['Where is the FileProvider path configuration declared?', 'In an XML resource referenced from the manifest provider entry.'],
          ],
          prereqs: ['Intents and inter-app communication'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'Unit tests with JUnit and MockK',
          description: 'Fast JVM tests for ViewModels, repositories and use cases: JUnit 4 and 5, MockK mocks and relaxed mocks, verifying calls, fakes versus mocks, and Truth or kotlin.test assertions.',
          concepts: ['JVM test source set', 'MockK every and verify', 'Fakes versus mocks', 'Assertion libraries', 'Testing use cases'],
          quiz: [
            ['When is a fake better than a mock?', 'For repositories with behaviour, where an in-memory implementation reads clearer than stubbing each call.'],
            ['What does coEvery do?', 'Stubs a suspend function in MockK.'],
          ],
          prereqs: ['Repositories, data sources and use cases'],
        },
        {
          title: 'Testing coroutines and Flow',
          description: 'runTest with virtual time, a TestDispatcher injected into ViewModels through a Main dispatcher rule, advanceUntilIdle, and Turbine for asserting emissions from StateFlow and cold flows.',
          concepts: ['runTest and virtual time', 'Main dispatcher rule', 'StandardTestDispatcher versus Unconfined', 'Turbine for Flow assertions', 'Testing StateFlow with WhileSubscribed'],
          quiz: [
            ['Why does a ViewModel test crash with "Module with the Main dispatcher had failed"?', 'Dispatchers.Main is unavailable on the JVM; replace it with a TestDispatcher in a rule.'],
            ['How do you assert the next emission with Turbine?', 'flow.test { assertEquals(expected, awaitItem()) }.'],
          ],
          prereqs: ['Unit tests with JUnit and MockK', 'Flow operators, StateFlow and SharedFlow'],
        },
        {
          title: 'Compose UI tests',
          description: 'createComposeRule to set content, finding nodes by text, tag and semantics, performing clicks and text input, asserting state, waiting for idle, and using testTag to make nodes findable.',
          concepts: ['createComposeRule and setContent', 'onNodeWithText and onNodeWithTag', 'performClick and performTextInput', 'assertIsDisplayed and assertions', 'Semantics and testTag'],
          quiz: [
            ['How do you find a button without visible text?', 'Add Modifier.testTag("save") and use onNodeWithTag.'],
            ['Where do Compose UI tests run?', 'On a device or emulator as instrumented tests, or on the JVM with Robolectric.'],
          ],
          prereqs: ['Lists with LazyColumn and LazyVerticalGrid'],
        },
        {
          title: 'Instrumented tests and Hilt test runner',
          description: 'androidTest tests on a device: Room with an in-memory database, HiltTestApplication and a custom runner, Espresso intents for legacy screens, and running suites on Gradle Managed Devices or Firebase Test Lab.',
          concepts: ['androidTest source set', 'In-memory Room tests', 'Hilt custom test runner', 'Espresso essentials', 'Gradle Managed Devices'],
          quiz: [
            ['How do you test a DAO without touching real data?', 'Room.inMemoryDatabaseBuilder in the test.'],
            ['What does a custom AndroidJUnitRunner do for Hilt?', 'Replaces the Application with HiltTestApplication so tests can inject.'],
          ],
          prereqs: ['Compose UI tests', 'Hilt with ViewModels and tests'],
        },
      ],
    },
    {
      title: 'Performance and Security',
      topics: [
        {
          title: 'Recomposition performance',
          description: 'Why screens jank: unstable parameters forcing recomposition, lambdas that allocate, reading state too high in the tree, and missing keys. Stability, strong skipping, deferring reads with lambdas, and the Layout Inspector recomposition counts.',
          concepts: ['Stable and immutable types', 'Strong skipping mode', 'Deferring state reads', 'Recomposition counts in Layout Inspector', 'Compose compiler reports'],
          quiz: [
            ['Why does passing a List<Item> cause recomposition even when unchanged?', 'List is not stable, so Compose cannot skip; use an immutable collection or annotate.'],
            ['How do you avoid recomposing a parent on every scroll?', 'Pass a lambda that reads scroll state so the read happens in the child or in layout.'],
          ],
          prereqs: ['Side effects and effect handlers'],
        },
        {
          title: 'Profiling, benchmarks and Baseline Profiles',
          description: 'Android Studio Profiler for CPU, memory and network, systrace through Perfetto, Macrobenchmark for startup and scroll metrics, and Baseline Profiles that precompile hot paths to cut startup time.',
          concepts: ['CPU and memory profiler', 'Perfetto traces', 'Macrobenchmark startup metrics', 'Baseline Profiles generation', 'Release builds for measurement'],
          quiz: [
            ['Why measure performance on a release build?', 'Debug builds disable optimisations and add instrumentation, so timings are misleading.'],
            ['What does a Baseline Profile change?', 'ART precompiles the listed methods at install, reducing JIT work on first launch.'],
          ],
          prereqs: ['Recomposition performance'],
        },
        {
          title: 'App startup, ANRs and memory leaks',
          description: 'Cold, warm and hot starts, App Startup library for initialisers, ANRs from blocking the main thread over five seconds, StrictMode to catch disk and network on main, and LeakCanary for leaked activities and contexts.',
          concepts: ['Cold, warm and hot start', 'App Startup initialisers', 'ANR causes and detection', 'StrictMode policies', 'LeakCanary'],
          quiz: [
            ['What causes an ANR?', 'The main thread blocked for about five seconds while an input event or broadcast waits.'],
            ['What is the most common Android memory leak?', 'A destroyed Activity kept alive by a static field, singleton or long-lived callback.'],
          ],
          prereqs: ['Profiling, benchmarks and Baseline Profiles'],
        },
        {
          title: 'Security basics',
          description: 'Protecting secrets and data: EncryptedSharedPreferences and the Android Keystore, network security config to block cleartext and pin certificates, R8 obfuscation, avoiding secrets in the APK, and validating inputs to exported components.',
          concepts: ['Android Keystore and EncryptedSharedPreferences', 'Network security config', 'Certificate pinning trade-offs', 'R8 obfuscation limits', 'Exported component hardening'],
          quiz: [
            ['Does R8 obfuscation hide API keys?', 'No; strings stay in the binary. Keep secrets on a server.'],
            ['How do you block cleartext HTTP?', 'cleartextTrafficPermitted="false" in the network security config, which is the default on API 28+.'],
          ],
          prereqs: ['Retrofit and OkHttp'],
        },
      ],
    },
    {
      title: 'Release and Operations',
      topics: [
        {
          title: 'Build variants and configuration',
          description: 'Debug and release build types, product flavors for dev, staging and production with different applicationId suffixes and API URLs, BuildConfig fields, and keeping keys out of source control with local properties.',
          concepts: ['Build types and flavors', 'applicationIdSuffix per flavor', 'BuildConfig fields', 'Secrets outside version control', 'Resource overrides per flavor'],
          quiz: [
            ['How does the app read a per-flavor API URL?', 'BuildConfig.API_URL defined with buildConfigField in the flavor block.'],
            ['Why give staging a different applicationId?', 'So it installs next to production and uses separate data and push config.'],
          ],
          prereqs: ['Android Studio, Gradle and version catalogs'],
        },
        {
          title: 'Signing and app bundles',
          description: 'Generating an upload keystore, signingConfigs in Gradle, Play App Signing where Google holds the app signing key, building an Android App Bundle, and versionCode and versionName rules for updates.',
          concepts: ['Upload keystore', 'signingConfigs in Gradle', 'Play App Signing', 'App bundle and dynamic delivery', 'versionCode rules'],
          quiz: [
            ['Why does Play accept only bundles?', 'Google generates optimised APKs per device configuration, cutting download size.'],
            ['What must change for Play to accept an update?', 'A higher versionCode.'],
          ],
          prereqs: ['Build variants and configuration'],
        },
        {
          title: 'Play Console release process',
          description: 'Creating the app listing, internal and closed testing tracks, the pre-launch report, staged rollouts with halt and resume, data safety and target API requirements, and responding to policy reviews.',
          concepts: ['Testing tracks', 'Pre-launch report', 'Staged rollout and halting', 'Data safety form', 'Target API level policy'],
          quiz: [
            ['What does a staged rollout let you do?', 'Release to a percentage of users and halt if crashes rise.'],
            ['Why does Play reject an old targetSdk?', 'New apps and updates must target a recent API level for security and privacy behaviour.'],
          ],
          prereqs: ['Signing and app bundles'],
        },
        {
          title: 'Crash reporting and CI/CD',
          description: 'Firebase Crashlytics with uploaded mapping files for readable stack traces, Play Vitals for ANR and crash rates, and pipelines with GitHub Actions or fastlane that run tests, build the bundle and upload to a track.',
          concepts: ['Crashlytics and mapping files', 'Android vitals thresholds', 'GitHub Actions for Android', 'fastlane supply upload', 'Automated versioning'],
          quiz: [
            ['Why upload the R8 mapping file?', 'So obfuscated crash traces are deobfuscated in Crashlytics and Play.'],
            ['What does a bad ANR rate in vitals affect?', 'Play visibility and store listing warnings.'],
          ],
          prereqs: ['Play Console release process'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Apps that put the whole stack together, then the questions hiring teams ask.',
      topics: [
        {
          title: 'Project: notes app with offline sync',
          description: 'A notes app with Room as the single source of truth, a Retrofit backend, WorkManager sync when online, conflict resolution by updated-at, Hilt wiring, a Compose list and editor, and tests for the sync logic.',
          concepts: ['Room schema and DAO', 'Compose list and editor screens', 'WorkManager sync worker', 'Conflict resolution rules', 'Repository tests with fakes'],
          quiz: [
            ['Why is Room the source of truth?', 'The UI reads one place; the network only updates it, so offline and online paths are identical.'],
            ['How do you avoid uploading the same note twice?', 'Mark rows dirty and clear the flag only after the server acknowledges.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: weather app',
          description: 'Fetch current and forecast weather for the device location with Retrofit, request location permission with rationale, cache the last result in DataStore, render with Material 3 dynamic colour and animated icons, and handle errors with retry.',
          concepts: ['Location permission flow', 'Weather API client', 'DataStore cache', 'Dynamic-colour UI with animations', 'Error and retry states'],
          quiz: [
            ['What should the screen show when location is denied?', 'A search-by-city fallback and a link to settings.'],
            ['Why cache the last forecast?', 'Instant content on launch and something to show offline.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce catalogue with cart',
          description: 'A product grid with Paging 3, search with debounce and flatMapLatest, a detail screen with shared element transitions, a cart persisted in Room, checkout form validation, and Compose UI tests for the cart.',
          concepts: ['Paged product grid', 'Debounced search flow', 'Detail with shared transitions', 'Cart in Room', 'Checkout validation and UI tests'],
          quiz: [
            ['How do you keep the cart total consistent?', 'Compute it from the Room Flow rather than storing it separately.'],
            ['Which operator handles search as the user types?', 'debounce then flatMapLatest.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: habit tracker with notifications',
          description: 'Daily habits with streaks, reminders scheduled with AlarmManager or WorkManager, notification channels and actions to mark done, a monthly heatmap, Proto DataStore for settings, and unit tests for streak logic.',
          concepts: ['Habit and completion entities', 'Streak calculation', 'Reminder scheduling', 'Notification actions', 'Heatmap composable'],
          quiz: [
            ['How does a notification action mark a habit done?', 'A PendingIntent to a BroadcastReceiver or service that updates Room.'],
            ['Why keep streak logic in a pure Kotlin class?', 'It can be unit-tested on the JVM without Android.'],
          ],
          style: 'project',
        },
        {
          title: 'Android interview questions',
          description: 'The questions that keep coming up: activity lifecycle and process death, ViewModel versus SavedStateHandle, recomposition and stability, StateFlow versus SharedFlow, Room threading, WorkManager versus services, and why Hilt.',
          concepts: ['Lifecycle and state questions', 'Compose internals questions', 'Coroutines and Flow questions', 'Architecture trade-off questions', 'Background work questions'],
          quiz: [
            ['What survives rotation, and what survives process death?', 'ViewModel survives rotation; only saved state (SavedStateHandle, rememberSaveable) survives process death.'],
            ['Why is LazyColumn preferred over Column with many children?', 'It composes only visible items.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live coding an Android screen',
          description: 'Building a list-detail feature in an interview: define UiState first, write the ViewModel with StateFlow, sketch the composables, add loading and error states, then talk through testing and what you would add with more time.',
          concepts: ['Start from UiState', 'ViewModel before UI', 'Loading and error paths', 'Explaining test strategy'],
          quiz: [
            ['What do you write first?', 'The UiState and the ViewModel API, so the UI has something to render.'],
            ['How do you show that you know lifecycle?', 'Collect with collectAsStateWithLifecycle and mention process death.'],
          ],
        },
      ],
    },
  ],
})
