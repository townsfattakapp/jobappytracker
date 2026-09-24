import { defineTrack } from '../define'

export const flutter = defineTrack({
  id: 'track-flutter',
  title: 'Flutter',
  description: 'Building Android and iOS apps from one Dart codebase: widgets and constraints, navigation with go_router, Provider, Riverpod and Bloc, dio and JSON, local storage, Firebase Auth, push notifications, platform channels, animations, testing, performance and store releases.',
  family: 'Mobile Development',
  kind: 'framework',
  icon: '🐦',
  tags: ['flutter', 'dart', 'mobile', 'android', 'ios', 'cross-platform', 'riverpod', 'bloc'],
  languages: ['Dart'],
  explainMode: 'concept',
  code: { label: 'Dart with Flutter', id: 'dart', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-dart'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started with Flutter',
      description: 'The toolchain, the project skeleton and the Dart features Flutter code leans on every day.',
      topics: [
        {
          title: 'Dart essentials for Flutter code',
          description: 'A fast recap of the Dart features Flutter code uses on every screen: named and required parameters, const constructors, null safety, cascades, async/await and Futures, and collection-if and spread inside widget lists. Deep coverage lives in the Dart track.',
          concepts: ['Named and required parameters', 'const constructors and canonicalisation', 'Null safety in widget code', 'Collection if and spread in children', 'Futures and async/await recap'],
          quiz: [
            ['Why mark a widget constructor const?', 'Identical const widgets share one instance and are skipped during rebuilds, saving work.'],
            ['What does the ? in String? name mean?', 'The variable is nullable and must be checked or handled before use.'],
            ['How do you conditionally include a widget in a children list?', 'With collection if: [if (isLoggedIn) ProfileTile()].'],
          ],
        },
        {
          title: 'Installing the Flutter SDK and flutter doctor',
          description: 'Installing the SDK, Android Studio or Xcode toolchains and an emulator or simulator, and reading flutter doctor output to fix licence, path and toolchain gaps before they block the first build.',
          concepts: ['SDK channels and versions', 'flutter doctor diagnostics', 'Emulators and simulators', 'Editor plugins for Flutter'],
          quiz: [
            ['What does flutter doctor check?', 'Installed SDK, Android and iOS toolchains, connected devices and editor plugins.'],
            ['Which channel should production apps use?', 'stable.'],
          ],
        },
        {
          title: 'Project structure and pubspec.yaml',
          description: 'What flutter create generates: lib/main.dart, the android and ios host projects, test/, and pubspec.yaml where dependencies, assets and fonts are declared. Knowing which folders are yours and which are generated avoids editing the wrong thing.',
          concepts: ['lib, test and host project folders', 'pubspec.yaml dependencies and assets', 'Declaring fonts and images', 'runApp and the root widget'],
          quiz: [
            ['Where do you register an image so Image.asset can load it?', 'Under flutter: assets: in pubspec.yaml.'],
            ['What does runApp do?', 'Inflates the given widget and attaches it to the screen as the root of the tree.'],
          ],
          prereqs: ['Installing the Flutter SDK and flutter doctor'],
        },
        {
          title: 'Hot reload, hot restart and the dev loop',
          description: 'How hot reload injects updated code into the running Dart VM while keeping state, when a hot restart is required (changed main, static fields, enum values), and the run, debug and log commands you use hundreds of times a day.',
          concepts: ['Hot reload versus hot restart', 'What hot reload cannot update', 'flutter run and device selection', 'Reading logs with debugPrint'],
          quiz: [
            ['Does hot reload re-run main()?', 'No; it re-runs build() with the new code and keeps state. Hot restart re-runs main.'],
            ['Why did a changed initState not take effect after hot reload?', 'initState runs only when the State is created; hot reload keeps the existing State object.'],
          ],
          prereqs: ['Project structure and pubspec.yaml'],
        },
        {
          title: 'Packages, pub.dev and versioning',
          description: 'Adding packages with flutter pub add, caret version constraints, the pubspec.lock file, dev dependencies, and how to judge a pub.dev package by its score, maintenance and platform support.',
          concepts: ['flutter pub add and get', 'Caret constraints and pubspec.lock', 'Dependencies versus dev_dependencies', 'Evaluating a pub.dev package'],
          quiz: [
            ['What does ^1.2.3 allow?', 'Any version >= 1.2.3 and < 2.0.0.'],
            ['Should pubspec.lock be committed for an app?', 'Yes, so every build uses the same resolved versions.'],
          ],
          prereqs: ['Project structure and pubspec.yaml'],
        },
      ],
    },
    {
      title: 'Widgets and Composition',
      description: 'Everything on screen is a widget; the tree, the element tree and the render tree explain why.',
      topics: [
        {
          title: 'StatelessWidget and the build method',
          description: 'A widget is an immutable description; build returns a subtree from its fields. How the framework calls build, why widgets are cheap to recreate, and how to split a screen into small stateless widgets instead of helper methods.',
          concepts: ['Widgets as immutable descriptions', 'build and the widget tree', 'Widget, Element and RenderObject trees', 'Extracting widgets versus helper methods'],
          quiz: [
            ['Why are widget classes immutable?', 'They are descriptions; the framework diffs new descriptions against the element tree and updates only what changed.'],
            ['Why prefer a small widget class over a _buildHeader() method?', 'A widget class gets its own element, can be const, and rebuilds independently.'],
          ],
          prereqs: ['Dart essentials for Flutter code'],
        },
        {
          title: 'StatefulWidget and the State lifecycle',
          description: 'How State persists across rebuilds, the order of createState, initState, didChangeDependencies, build, didUpdateWidget and dispose, and why controllers and subscriptions are created in initState and released in dispose.',
          concepts: ['createState and State persistence', 'initState and dispose', 'didUpdateWidget and didChangeDependencies', 'setState and marking dirty', 'mounted checks after async work'],
          quiz: [
            ['What does setState actually do?', 'Runs the callback, marks the element dirty and schedules a rebuild on the next frame.'],
            ['Where should a TextEditingController be disposed?', 'In dispose() of the State that owns it.'],
            ['Why check mounted after an await?', 'The widget may have been removed; calling setState then throws.'],
          ],
          prereqs: ['StatelessWidget and the build method'],
        },
        {
          title: 'Keys and widget identity',
          description: 'How the framework matches old and new widgets by type and key, why reordering stateful children without keys swaps their state, and when to use ValueKey, ObjectKey, UniqueKey or a GlobalKey.',
          concepts: ['Element matching by type and key', 'ValueKey and ObjectKey in lists', 'GlobalKey and its costs', 'State loss when swapping children'],
          quiz: [
            ['When does a reordered list of stateful tiles lose state?', 'When children have no keys, so elements are matched by position and keep the wrong state.'],
            ['What is a GlobalKey used for?', 'Accessing a State or its context from elsewhere, such as FormState; it is expensive and should be rare.'],
          ],
          prereqs: ['StatefulWidget and the State lifecycle'],
        },
        {
          title: 'BuildContext and InheritedWidget',
          description: 'BuildContext is the element behind a widget; of(context) lookups such as Theme.of and MediaQuery.of walk up the tree to the nearest InheritedWidget and register a dependency so the widget rebuilds when that value changes.',
          concepts: ['BuildContext as the element', 'of(context) lookups', 'InheritedWidget and updateShouldNotify', 'Builder to get a fresh context'],
          quiz: [
            ['Why does Scaffold.of(context) fail inside the widget that created the Scaffold?', 'The context is above the Scaffold in the tree; wrap the caller in a Builder.'],
            ['What does dependOnInheritedWidgetOfExactType register?', 'A dependency so the calling widget rebuilds when the inherited widget changes.'],
          ],
          prereqs: ['StatelessWidget and the build method'],
        },
      ],
    },
    {
      title: 'Layout and Responsive UI',
      description: 'Constraints go down, sizes go up, parent sets position.',
      topics: [
        {
          title: 'The constraints model',
          description: 'The one rule behind every layout error: constraints go down, sizes go up, the parent sets the position. Tight versus loose constraints, unbounded height errors inside Column, and how SizedBox, ConstrainedBox and Expanded change what a child is told.',
          concepts: ['Constraints down, sizes up', 'Tight versus loose constraints', 'Unbounded constraints errors', 'SizedBox and ConstrainedBox', 'Reading layout errors in the console'],
          quiz: [
            ['Why does a ListView inside a Column throw?', 'Column gives unbounded height and ListView wants to fill it; wrap the ListView in Expanded.'],
            ['What size does a Container with no child and no constraints take?', 'As large as its parent allows.'],
          ],
          prereqs: ['StatelessWidget and the build method'],
        },
        {
          title: 'Row, Column and Flex',
          description: 'Laying out along one axis: main and cross axis alignment, Expanded and Flexible with flex factors, Spacer, and how overflow stripes appear when children exceed the available space.',
          concepts: ['Main and cross axis alignment', 'Expanded, Flexible and flex factors', 'Spacer and mainAxisSize', 'Fixing overflow stripes'],
          quiz: [
            ['Difference between Expanded and Flexible?', 'Expanded forces the child to fill its share; Flexible lets it be smaller.'],
            ['What does MainAxisSize.min do on a Column?', 'The Column shrinks to fit its children instead of filling available height.'],
          ],
          prereqs: ['The constraints model'],
        },
        {
          title: 'Stack, Positioned and Align',
          description: 'Overlapping children with Stack, absolute placement with Positioned, fractional placement with Align and FractionallySizedBox, and the aspect-ratio and clipping widgets that finish a card or banner.',
          concepts: ['Stack fit and clipping', 'Positioned offsets', 'Align and Alignment values', 'AspectRatio and ClipRRect'],
          quiz: [
            ['How big is a Stack with only Positioned children?', 'As large as its constraints allow, because Positioned children do not contribute a size.'],
            ['What does Alignment(0, 0) mean?', 'The centre; the coordinates run from -1 to 1 on each axis.'],
          ],
          prereqs: ['The constraints model'],
        },
        {
          title: 'Scrolling: ListView, GridView and slivers',
          description: 'Lazy building with ListView.builder and GridView.builder, separators, scroll controllers, and CustomScrollView with SliverAppBar and SliverList for collapsing headers and mixed content that must scroll as one.',
          concepts: ['ListView.builder and lazy items', 'GridView delegates', 'ScrollController and scroll position', 'CustomScrollView and slivers', 'SliverAppBar collapsing headers'],
          quiz: [
            ['Why use ListView.builder over ListView(children: [...])?', 'It builds only visible items, so long lists stay cheap.'],
            ['What is a sliver?', 'A scrollable area piece that lays out lazily inside a CustomScrollView viewport.'],
          ],
          prereqs: ['Row, Column and Flex'],
        },
        {
          title: 'Responsive and adaptive layouts',
          description: 'Reacting to screen size and platform: MediaQuery for size, padding and text scale, LayoutBuilder for parent constraints, breakpoints for phone, tablet and desktop, SafeArea, OrientationBuilder and platform-adaptive widgets.',
          concepts: ['MediaQuery size and text scale', 'LayoutBuilder breakpoints', 'SafeArea and system insets', 'Orientation handling', 'Adaptive Material and Cupertino widgets'],
          quiz: [
            ['MediaQuery or LayoutBuilder for a card that changes layout by its own width?', 'LayoutBuilder, because it gives the constraints of the parent, not the whole screen.'],
            ['What does SafeArea pad against?', 'Notches, status bars and home indicators reported by MediaQuery padding.'],
          ],
          prereqs: ['The constraints model'],
        },
        {
          title: 'Theming with Material 3',
          description: 'ThemeData, ColorScheme.fromSeed, text themes, component themes, dark mode with themeMode, and reading theme values through Theme.of so styling changes in one place propagate across the app.',
          concepts: ['ThemeData and ColorScheme.fromSeed', 'TextTheme and typography', 'Component themes', 'Light and dark ThemeMode', 'ThemeExtension for custom tokens'],
          quiz: [
            ['How do you enable Material 3?', 'useMaterial3: true in ThemeData (the default since Flutter 3.16).'],
            ['How does an app follow the system dark mode setting?', 'Provide theme and darkTheme and set themeMode: ThemeMode.system.'],
          ],
          prereqs: ['BuildContext and InheritedWidget'],
        },
      ],
    },
    {
      title: 'Navigation and Routing',
      topics: [
        {
          title: 'Navigator and named routes',
          description: 'The Navigator stack: push and pop with MaterialPageRoute, returning results from a screen, named routes in MaterialApp, and passing arguments. Enough for simple apps and the base the declarative router builds on.',
          concepts: ['Navigator.push and pop', 'Returning a result from a route', 'Named routes and onGenerateRoute', 'Passing arguments to routes'],
          quiz: [
            ['How does a screen return a value to the one that pushed it?', 'Navigator.pop(context, value); the push Future completes with it.'],
            ['What happens when you pop the last route?', 'On Android the app is backgrounded; use canPop or maybePop to guard.'],
          ],
          prereqs: ['StatefulWidget and the State lifecycle'],
        },
        {
          title: 'Navigator 2.0 and the Router API',
          description: 'The declarative model: Router, RouterDelegate, RouteInformationParser and a Pages list rebuilt from app state. Why it exists (deep links, web URLs, back button on nested stacks) and why most apps use a package instead of writing it by hand.',
          concepts: ['Router and RouterDelegate', 'RouteInformationParser', 'Pages list as app state', 'Back button handling with PopScope'],
          quiz: [
            ['What does Navigator 2.0 add over push and pop?', 'A declarative pages list driven by state, plus URL and deep link parsing.'],
            ['Which widget replaced WillPopScope?', 'PopScope, with canPop and onPopInvokedWithResult.'],
          ],
          prereqs: ['Navigator and named routes'],
        },
        {
          title: 'go_router in practice',
          description: 'Declaring a GoRouter with path parameters, nested routes, ShellRoute and StatefulShellRoute for bottom navigation, redirects for auth guards, and go versus push semantics.',
          concepts: ['GoRoute paths and parameters', 'ShellRoute and bottom navigation', 'Redirects and auth guards', 'go versus push', 'Typed routes with go_router_builder'],
          quiz: [
            ['Difference between context.go and context.push?', 'go replaces the stack to match the location; push adds a page on top.'],
            ['How do you protect routes behind login?', 'A redirect callback that returns the login path when the user is signed out.'],
          ],
          prereqs: ['Navigator 2.0 and the Router API'],
        },
        {
          title: 'Deep links and app links',
          description: 'Opening a specific screen from a URL: Android App Links and iOS Universal Links, the intent filters and associated domains they require, and how the router turns the incoming path into a page stack.',
          concepts: ['Android intent filters', 'iOS associated domains', 'Verifying domain ownership', 'Handling links in the router'],
          quiz: [
            ['What file must a domain host for Android App Links?', '/.well-known/assetlinks.json.'],
            ['Why verify domain ownership?', 'So the OS opens the app directly instead of asking the user which app to use.'],
          ],
          prereqs: ['go_router in practice'],
        },
      ],
    },
    {
      title: 'State Management',
      description: 'Where state lives, who owns it, and how widgets learn that it changed.',
      topics: [
        {
          title: 'Ephemeral state, app state and lifting state up',
          description: 'Separating widget-local state (a toggle, a text field) from shared app state (cart, session), lifting state to the nearest common ancestor, and passing callbacks down. The judgement that decides whether a package is needed at all.',
          concepts: ['Ephemeral versus app state', 'Lifting state to a common ancestor', 'Callbacks down, events up', 'ValueNotifier and ValueListenableBuilder'],
          quiz: [
            ['Should the selected tab of a BottomNavigationBar be app state?', 'Usually not; it is ephemeral and can live in the State of the screen.'],
            ['What does ValueListenableBuilder do?', 'Rebuilds only its builder subtree when the ValueNotifier changes.'],
          ],
          prereqs: ['StatefulWidget and the State lifecycle'],
        },
        {
          title: 'Provider and ChangeNotifier',
          description: 'Publishing a ChangeNotifier through ChangeNotifierProvider, reading it with context.watch, context.read and Consumer, and choosing select to rebuild only when one field changes.',
          concepts: ['ChangeNotifier and notifyListeners', 'ChangeNotifierProvider placement', 'watch, read and select', 'Consumer for scoped rebuilds', 'MultiProvider composition'],
          quiz: [
            ['When should you use context.read instead of context.watch?', 'In callbacks such as onPressed, where you do not want to subscribe to rebuilds.'],
            ['What does context.select((Cart c) => c.count) do?', 'Rebuilds the widget only when count changes, not on every notifyListeners.'],
          ],
          prereqs: ['BuildContext and InheritedWidget', 'Ephemeral state, app state and lifting state up'],
        },
        {
          title: 'Riverpod providers and notifiers',
          description: 'Compile-safe providers outside the widget tree: Provider, StateProvider, NotifierProvider and AsyncNotifierProvider, ref.watch and ref.read in ConsumerWidget, autoDispose and family modifiers, and the riverpod_generator annotations.',
          concepts: ['ProviderScope and ref', 'Notifier and AsyncNotifier', 'ConsumerWidget and ref.watch', 'autoDispose and family', 'Code generation with @riverpod'],
          quiz: [
            ['Why does Riverpod not need BuildContext to read a provider?', 'Providers are global declarations resolved through a ProviderScope container, not the widget tree.'],
            ['What does .family let you do?', 'Create a provider parameterised by an argument, such as userProvider(id).'],
          ],
          prereqs: ['Provider and ChangeNotifier'],
        },
        {
          title: 'Bloc and Cubit',
          description: 'Event-driven state: a Cubit exposes methods that emit new states, a Bloc maps an event stream to states; BlocProvider, BlocBuilder, BlocListener and BlocConsumer wire them to widgets, and immutable state classes with Equatable make transitions testable.',
          concepts: ['Cubit emit and Bloc events', 'BlocProvider and BlocBuilder', 'BlocListener for side effects', 'Immutable states with Equatable', 'Testing with bloc_test'],
          quiz: [
            ['Cubit or Bloc for a simple counter?', 'Cubit; Bloc adds events, which pay off when transitions must be traced or transformed.'],
            ['What is BlocListener for?', 'One-off side effects such as navigation or snackbars, without rebuilding the UI.'],
          ],
          prereqs: ['Ephemeral state, app state and lifting state up'],
        },
        {
          title: 'Choosing a state management approach',
          description: 'A comparison by team size, testability, boilerplate and async handling: setState for local state, Provider for small apps, Riverpod for compile-time safety and async, Bloc for strict event tracing. Mixing them is fine when the boundaries are clear.',
          concepts: ['Trade-offs by app size', 'Async loading, error and data states', 'Testability of each approach', 'Migrating between approaches'],
          quiz: [
            ['Which approach models loading, data and error states out of the box?', 'Riverpod AsyncValue, or a Bloc state class with those variants.'],
            ['Is it wrong to use setState in an app that uses Riverpod?', 'No; ephemeral widget state still belongs in setState.'],
          ],
          prereqs: ['Riverpod providers and notifiers', 'Bloc and Cubit'],
        },
      ],
    },
    {
      title: 'Forms and User Input',
      topics: [
        {
          title: 'Form, TextFormField and validation',
          description: 'Grouping fields in a Form with a GlobalKey<FormState>, validator callbacks that return an error string or null, autovalidateMode, and saving or resetting all fields at once on submit.',
          concepts: ['Form and FormState key', 'validator callbacks', 'AutovalidateMode choices', 'save, reset and onSaved'],
          quiz: [
            ['What does a validator return for a valid value?', 'null.'],
            ['How do you validate every field on submit?', '_formKey.currentState!.validate() returns true when all validators pass.'],
          ],
          prereqs: ['Keys and widget identity'],
        },
        {
          title: 'Text controllers, focus and keyboards',
          description: 'TextEditingController for reading and setting text, FocusNode to move focus and dismiss the keyboard, keyboard types and input actions, and input formatters that restrict characters as the user types.',
          concepts: ['TextEditingController lifecycle', 'FocusNode and requestFocus', 'Keyboard type and TextInputAction', 'TextInputFormatter'],
          quiz: [
            ['How do you dismiss the keyboard?', 'FocusScope.of(context).unfocus() or FocusManager.instance.primaryFocus?.unfocus().'],
            ['How do you allow digits only?', 'inputFormatters: [FilteringTextInputFormatter.digitsOnly].'],
          ],
          prereqs: ['Form, TextFormField and validation'],
        },
        {
          title: 'Selection widgets, dialogs and sheets',
          description: 'Checkboxes, switches, radios, dropdowns, date and time pickers, and collecting input through showDialog and showModalBottomSheet that return a Future with the chosen value.',
          concepts: ['Checkbox, Switch and Radio', 'DropdownButtonFormField', 'Date and time pickers', 'Dialogs and bottom sheets returning values'],
          quiz: [
            ['How does a dialog hand a result back?', 'Navigator.pop(context, value) inside the dialog; showDialog resolves with it.'],
            ['What does showDatePicker return?', 'A Future<DateTime?> that is null if the user cancels.'],
          ],
          prereqs: ['Form, TextFormField and validation'],
        },
      ],
    },
    {
      title: 'Networking and Data',
      topics: [
        {
          title: 'HTTP with http and dio',
          description: 'Calling REST APIs with the http package and with dio for interceptors, base URLs, timeouts, headers and cancellation; where to put the client so it is created once and injected.',
          concepts: ['http.get and post', 'dio BaseOptions and interceptors', 'Timeouts and CancelToken', 'Auth headers via interceptor', 'One client per app'],
          quiz: [
            ['Why choose dio over http?', 'Interceptors, base options, form data, download progress and cancellation out of the box.'],
            ['Where do you attach a bearer token to every request?', 'In a dio Interceptor onRequest hook.'],
          ],
          prereqs: ['Dart essentials for Flutter code'],
        },
        {
          title: 'JSON serialisation and model classes',
          description: 'Turning response maps into typed models: hand-written fromJson and toJson, generated code with json_serializable, immutable models with freezed, and handling nullable and nested fields safely.',
          concepts: ['fromJson and toJson by hand', 'json_serializable and build_runner', 'freezed data classes', 'Nullable and nested fields', 'Enums and custom converters'],
          quiz: [
            ['Which command generates the .g.dart files?', 'dart run build_runner build --delete-conflicting-outputs.'],
            ['What does freezed add over json_serializable?', 'Immutable classes with copyWith, equality and union types.'],
          ],
          prereqs: ['HTTP with http and dio'],
        },
        {
          title: 'FutureBuilder, StreamBuilder and async UI',
          description: 'Rendering loading, error and data states from a Future or Stream, why the future must be created outside build, and when a state-management async value is cleaner than a builder.',
          concepts: ['FutureBuilder and ConnectionState', 'Creating the future in initState', 'StreamBuilder and snapshots', 'Loading, error and empty states'],
          quiz: [
            ['Why not call fetchUser() directly inside FutureBuilder(future: ...)?', 'Every rebuild would start a new request; create it once in initState or a provider.'],
            ['What does snapshot.hasError tell you?', 'The future or stream produced an error you must render.'],
          ],
          prereqs: ['JSON serialisation and model classes'],
        },
        {
          title: 'Repositories, error handling and caching',
          description: 'A repository layer that hides dio and storage from widgets, mapping exceptions to domain errors, retry and backoff for flaky networks, and simple caching with an in-memory map or a local database.',
          concepts: ['Repository pattern', 'Mapping exceptions to failures', 'Retry with backoff', 'Cache-first and network-first strategies', 'Connectivity awareness'],
          quiz: [
            ['Why put network calls behind a repository?', 'Widgets and state classes depend on an interface, so caching and tests can swap the implementation.'],
            ['What is a cache-first strategy?', 'Return cached data immediately, then refresh from the network and update.'],
          ],
          prereqs: ['FutureBuilder, StreamBuilder and async UI'],
        },
      ],
    },
    {
      title: 'Local Storage and Authentication',
      topics: [
        {
          title: 'shared_preferences for settings',
          description: 'Storing small key-value settings such as theme choice and onboarding flags, the async getInstance pattern, and why it is unsuitable for lists, secrets or anything large.',
          concepts: ['getInstance and typed getters', 'Settings and flags use case', 'Limits and what not to store', 'Wrapping it in a settings service'],
          quiz: [
            ['Is shared_preferences encrypted?', 'No; use flutter_secure_storage for secrets.'],
            ['What storage does it use on Android and iOS?', 'SharedPreferences on Android and NSUserDefaults on iOS.'],
          ],
          prereqs: ['Repositories, error handling and caching'],
        },
        {
          title: 'SQLite with sqflite and drift',
          description: 'A relational store on device: opening a database, schema creation and versioned migrations in onUpgrade, parameterised queries, transactions, and drift as a typed query layer when raw SQL gets unwieldy. SQL itself is covered in the SQL track.',
          concepts: ['openDatabase and onCreate', 'Versioned migrations with onUpgrade', 'Parameterised queries and transactions', 'drift tables and DAOs'],
          quiz: [
            ['When does onUpgrade run?', 'When the database version passed to openDatabase is higher than the stored one.'],
            ['Why use parameterised queries?', 'They prevent SQL injection and handle escaping.'],
          ],
          prereqs: ['Repositories, error handling and caching'],
        },
        {
          title: 'Hive and Isar for object storage',
          description: 'NoSQL boxes for fast local objects: Hive type adapters and boxes, Isar collections with indexes, queries and watchers, and choosing between them and SQLite based on relations and query needs.',
          concepts: ['Hive boxes and TypeAdapters', 'Isar collections and indexes', 'Reactive watch queries', 'Choosing SQLite versus object store'],
          quiz: [
            ['When does SQLite beat Hive?', 'When data is relational and needs joins or complex queries.'],
            ['What does an Isar watcher give you?', 'A Stream that emits when the matching data changes.'],
          ],
          prereqs: ['SQLite with sqflite and drift'],
        },
        {
          title: 'Firebase Authentication',
          description: 'Adding Firebase with flutterfire configure, email and password sign-up, Google sign-in, listening to authStateChanges to switch between login and home, and handling verification, password reset and error codes.',
          concepts: ['flutterfire configure setup', 'Email and password flows', 'Google sign-in provider', 'authStateChanges stream', 'FirebaseAuthException codes'],
          quiz: [
            ['How do you show the home screen only when signed in?', 'Listen to FirebaseAuth.instance.authStateChanges() and route on the user being non-null.'],
            ['What does flutterfire configure generate?', 'firebase_options.dart with per-platform config.'],
          ],
          prereqs: ['go_router in practice'],
        },
        {
          title: 'Custom auth with tokens and secure storage',
          description: 'Talking to your own backend: login returns access and refresh tokens, store them with flutter_secure_storage, attach them through a dio interceptor, refresh on 401 without duplicate refreshes, and clear everything on logout.',
          concepts: ['Access and refresh tokens', 'flutter_secure_storage', 'Refresh on 401 interceptor', 'Single-flight token refresh', 'Logout and session cleanup'],
          quiz: [
            ['Where should tokens be stored?', 'flutter_secure_storage, which uses Keystore on Android and Keychain on iOS.'],
            ['Why guard refresh with a single in-flight future?', 'Parallel 401s would otherwise trigger several refreshes and invalidate each other.'],
          ],
          prereqs: ['HTTP with http and dio', 'shared_preferences for settings'],
        },
      ],
    },
    {
      title: 'Platform Integration and Notifications',
      topics: [
        {
          title: 'Platform channels',
          description: 'Calling native code when no plugin exists: MethodChannel with a name, invokeMethod arguments and results, the Kotlin and Swift handlers on the other side, EventChannel for streams, and the codec limits on what can cross.',
          concepts: ['MethodChannel and invokeMethod', 'Native handlers in Kotlin and Swift', 'EventChannel streams', 'StandardMessageCodec types', 'Pigeon for typed channels'],
          quiz: [
            ['What happens if the native side has no handler for a method?', 'invokeMethod throws MissingPluginException.'],
            ['On which thread do channel handlers run natively?', 'The platform main thread.'],
          ],
          prereqs: ['Dart essentials for Flutter code'],
        },
        {
          title: 'Using and writing plugins',
          description: 'How federated plugins split into a platform interface and per-platform packages, reading a plugin\'s setup steps for Android and iOS, and scaffolding your own plugin with flutter create --template=plugin.',
          concepts: ['Plugin versus package', 'Federated plugin structure', 'Per-platform setup steps', 'Creating a plugin template'],
          quiz: [
            ['Difference between a Dart package and a plugin?', 'A plugin contains platform-specific native code; a package is pure Dart.'],
            ['Why are plugins federated?', 'So each platform implementation can be maintained and versioned separately.'],
          ],
          prereqs: ['Platform channels'],
        },
        {
          title: 'Local notifications',
          description: 'Scheduling and showing notifications from the device with flutter_local_notifications: initialisation per platform, notification channels on Android, permission requests on iOS and Android 13+, scheduled and repeating notifications with time zones.',
          concepts: ['Initialisation and platform settings', 'Android notification channels', 'Runtime notification permission', 'Scheduled notifications with timezone', 'Handling notification taps'],
          quiz: [
            ['Why does Android 8+ require a channel?', 'Users control importance and sound per channel; notifications without one are dropped.'],
            ['Which permission is needed on Android 13+?', 'POST_NOTIFICATIONS, requested at runtime.'],
          ],
          prereqs: ['Using and writing plugins'],
        },
        {
          title: 'Push notifications with Firebase Cloud Messaging',
          description: 'Device tokens, foreground versus background message handling, the top-level background handler on Android, APNs setup for iOS, and sending data versus notification payloads from your server.',
          concepts: ['FCM tokens and refresh', 'Foreground versus background messages', 'Top-level background handler', 'APNs keys for iOS', 'Notification versus data payloads'],
          quiz: [
            ['Why must the background handler be a top-level function?', 'It runs in a separate isolate, so it cannot be a closure or method.'],
            ['What is needed before FCM works on iOS?', 'An APNs key uploaded to Firebase and push capability enabled in Xcode.'],
          ],
          prereqs: ['Local notifications', 'Firebase Authentication'],
        },
        {
          title: 'Camera, location and permissions',
          description: 'Device features through plugins: permission_handler for runtime permissions and rationale, image_picker and camera, geolocator for position streams, and the manifest and Info.plist entries each one needs.',
          concepts: ['permission_handler flow', 'image_picker and camera', 'geolocator position streams', 'Manifest and Info.plist entries', 'Graceful denial handling'],
          quiz: [
            ['What happens if Info.plist lacks NSCameraUsageDescription?', 'iOS terminates the app when it accesses the camera.'],
            ['What should the app do when a permission is permanently denied?', 'Explain why and offer openAppSettings().'],
          ],
          prereqs: ['Using and writing plugins'],
        },
      ],
    },
    {
      title: 'Animations and Accessibility',
      topics: [
        {
          title: 'Implicit animations',
          description: 'AnimatedContainer, AnimatedOpacity, AnimatedSwitcher and TweenAnimationBuilder animate between values whenever a property changes, with a duration and curve; the fastest way to make state changes feel physical.',
          concepts: ['AnimatedContainer and AnimatedOpacity', 'AnimatedSwitcher transitions', 'TweenAnimationBuilder', 'Durations and Curves'],
          quiz: [
            ['What triggers an implicit animation?', 'A rebuild with a different value for the animated property.'],
            ['Why does AnimatedSwitcher need keys on its children?', 'To know that the child changed, otherwise same-type widgets are treated as the same.'],
          ],
          prereqs: ['StatefulWidget and the State lifecycle'],
        },
        {
          title: 'Explicit animations with AnimationController',
          description: 'Full control: AnimationController with a TickerProvider, Tween and CurvedAnimation, AnimatedBuilder to rebuild only the animated subtree, staggered animations with Intervals, and disposing controllers.',
          concepts: ['AnimationController and vsync', 'Tween and CurvedAnimation', 'AnimatedBuilder and child optimisation', 'Staggered intervals', 'Disposing controllers'],
          quiz: [
            ['What does SingleTickerProviderStateMixin provide?', 'A Ticker that fires each frame while the widget is visible.'],
            ['Why pass a child to AnimatedBuilder?', 'The child is built once and reused, so only the animated wrapper rebuilds.'],
          ],
          prereqs: ['Implicit animations'],
        },
        {
          title: 'Hero and page transitions',
          description: 'Hero widgets that fly an image between screens with matching tags, custom PageRouteBuilder transitions, and go_router CustomTransitionPage, plus the Material motion package for shared-axis and fade-through patterns.',
          concepts: ['Hero tags and flight', 'PageRouteBuilder transitions', 'CustomTransitionPage in go_router', 'Material motion patterns'],
          quiz: [
            ['What must match for a Hero animation to run?', 'The tag on both screens, with exactly one Hero per tag per screen.'],
            ['Where do you define a fade transition for a go_router route?', 'In pageBuilder returning a CustomTransitionPage.'],
          ],
          prereqs: ['Explicit animations with AnimationController', 'go_router in practice'],
        },
        {
          title: 'Accessibility with Semantics',
          description: 'How TalkBack and VoiceOver read the semantics tree, adding labels with Semantics and semanticLabel, minimum tap targets, respecting text scaling and reduced motion, contrast, and checking with the accessibility inspector.',
          concepts: ['Semantics tree and labels', 'ExcludeSemantics and MergeSemantics', 'Tap target size and contrast', 'Text scaling and reduced motion', 'Testing with screen readers'],
          quiz: [
            ['How do you give an icon button a screen-reader name?', 'Set the tooltip or wrap it in Semantics(label: ...).'],
            ['What is the minimum recommended tap target?', '48 by 48 logical pixels.'],
          ],
          prereqs: ['Responsive and adaptive layouts'],
        },
      ],
    },
    {
      title: 'Testing and Performance',
      topics: [
        {
          title: 'Unit testing Dart logic',
          description: 'Testing models, repositories and notifiers with package:test: group and setUp, matchers, testing async code and streams, and mocking dependencies with mocktail so tests never touch the network.',
          concepts: ['test, group and matchers', 'Testing Futures and Streams', 'Mocking with mocktail', 'Testing notifiers and blocs'],
          quiz: [
            ['How do you assert a stream emits values in order?', 'expect(stream, emitsInOrder([1, 2, 3])).'],
            ['Why mock the repository in a notifier test?', 'To control responses and avoid real network or storage.'],
          ],
          prereqs: ['Repositories, error handling and caching'],
        },
        {
          title: 'Widget tests',
          description: 'Pumping a widget with WidgetTester, finding widgets by text, type and key, tapping and entering text, pump versus pumpAndSettle, and wrapping the widget under test with MaterialApp and providers.',
          concepts: ['testWidgets and pumpWidget', 'Finders by text, type and key', 'tap, enterText and drag', 'pump versus pumpAndSettle', 'Wrapping with MaterialApp and providers'],
          quiz: [
            ['Why does pumpAndSettle time out?', 'An animation or ticker never finishes, such as a CircularProgressIndicator.'],
            ['How do you find a widget by key?', 'find.byKey(const Key("submit")).'],
          ],
          prereqs: ['Unit testing Dart logic'],
        },
        {
          title: 'Integration tests',
          description: 'End-to-end tests on a real device or emulator with integration_test: driving full flows, waiting for network stubs, running on Firebase Test Lab or device farms, and keeping them few and stable.',
          concepts: ['integration_test setup', 'Driving full user flows', 'Stubbing the backend', 'Running on device farms'],
          quiz: [
            ['How are integration tests run?', 'flutter test integration_test on a connected device or emulator.'],
            ['Why keep integration tests few?', 'They are slow and flaky compared with widget tests, so cover only critical flows.'],
          ],
          prereqs: ['Widget tests'],
        },
        {
          title: 'Rebuild performance',
          description: 'Why apps jank: rebuilding large subtrees, non-const widgets, work inside build, and lists without builders. Using const, splitting widgets, RepaintBoundary, and caching images and computed values to keep build cheap.',
          concepts: ['Cost of rebuilding subtrees', 'const and widget splitting', 'RepaintBoundary', 'Avoiding work in build', 'Isolates for heavy computation'],
          quiz: [
            ['Why is a JSON parse in build a problem?', 'build can run every frame; heavy work should happen once, ideally in an isolate with compute().'],
            ['What does RepaintBoundary do?', 'Gives a subtree its own layer so repaints do not spread to siblings.'],
          ],
          prereqs: ['Keys and widget identity'],
        },
        {
          title: 'Profiling with DevTools',
          description: 'Running in profile mode, the performance overlay, the frame chart for UI and raster threads, the widget rebuild counter, the memory view for leaks, and the network tab for slow requests.',
          concepts: ['Profile mode versus debug mode', 'Frame chart and jank frames', 'Widget rebuild stats', 'Memory and leak hunting', 'Network and logging views'],
          quiz: [
            ['Why not profile in debug mode?', 'Debug builds use a JIT and extra checks, so timings are not representative.'],
            ['Which thread is slow if the raster bar is red?', 'The GPU (raster) thread, often from shaders, clips or large images.'],
          ],
          prereqs: ['Rebuild performance'],
        },
      ],
    },
    {
      title: 'Building and Releasing',
      topics: [
        {
          title: 'Android builds and signing',
          description: 'Generating an upload keystore, key.properties and the signingConfig in build.gradle, building an app bundle with flutter build appbundle, minSdk and targetSdk, and shrinking with R8.',
          concepts: ['Upload keystore and key.properties', 'signingConfigs in build.gradle', 'App bundle versus APK', 'minSdk and targetSdk', 'R8 shrinking and keep rules'],
          quiz: [
            ['Which artifact does Google Play require?', 'An Android App Bundle (.aab).'],
            ['What happens if you lose the upload key?', 'You must request an upload key reset from Play Console; Play App Signing keeps the app key safe.'],
          ],
          prereqs: ['Hot reload, hot restart and the dev loop'],
        },
        {
          title: 'iOS builds, certificates and provisioning',
          description: 'Bundle identifiers, development and distribution certificates, provisioning profiles, automatic signing in Xcode, flutter build ipa, and CocoaPods issues that stop iOS builds.',
          concepts: ['Bundle id and Apple Developer account', 'Certificates and provisioning profiles', 'Automatic signing in Xcode', 'flutter build ipa', 'CocoaPods and Podfile issues'],
          quiz: [
            ['Can you build an iOS release on Windows?', 'No; an iOS build needs Xcode on macOS or a macOS CI runner.'],
            ['What does a provisioning profile bind together?', 'An app id, certificates and, for development, device UDIDs.'],
          ],
          prereqs: ['Android builds and signing'],
        },
        {
          title: 'Flavors and environment configuration',
          description: 'Separate dev, staging and production builds with different bundle ids, icons and API URLs: Android product flavors, iOS schemes, --dart-define values, and keeping secrets out of the repository.',
          concepts: ['Android product flavors', 'iOS schemes and configurations', '--dart-define and String.fromEnvironment', 'Per-flavor Firebase config', 'Keeping secrets out of git'],
          quiz: [
            ['How does Dart read a --dart-define value?', 'const String.fromEnvironment("API_URL").'],
            ['Why give staging a different bundle id?', 'So it installs alongside production and uses its own push and auth config.'],
          ],
          prereqs: ['iOS builds, certificates and provisioning'],
        },
        {
          title: 'Store submission and CI/CD',
          description: 'Play Console tracks (internal, closed, open, production), TestFlight and App Store review, listing assets and privacy declarations, and automating builds with fastlane, Codemagic or GitHub Actions.',
          concepts: ['Play Console release tracks', 'TestFlight and App Review', 'Privacy manifests and data safety forms', 'fastlane lanes', 'CI pipelines for both platforms'],
          quiz: [
            ['What is the internal testing track for?', 'Fast distribution to up to 100 testers without review delays.'],
            ['What is the most common App Review rejection for new apps?', 'Incomplete information or crashes; provide test accounts and review notes.'],
          ],
          prereqs: ['Flavors and environment configuration'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Apps that exercise the whole track, then the questions hiring teams ask.',
      topics: [
        {
          title: 'Project: notes app with offline sync',
          description: 'A notes app that works offline with Isar or sqflite, syncs to a REST backend when connectivity returns, resolves conflicts with updated-at timestamps, and uses Riverpod for state and go_router for navigation.',
          concepts: ['Model notes and local schema', 'Build list and editor screens', 'Sync queue and conflict rules', 'Connectivity-aware repository', 'Test the sync logic'],
          quiz: [
            ['How do you detect that a note changed on both sides?', 'Compare server and local updated-at timestamps against the last synced version.'],
            ['Where does the sync queue live?', 'In local storage, so pending changes survive restarts.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: weather app',
          description: 'Fetch current and hourly weather for the device location with dio and a public weather API, cache the last response, animate condition icons, adapt the layout to phone and tablet, and handle denied location permission gracefully.',
          concepts: ['Location permission and geolocator', 'Weather API client and models', 'Cache and offline fallback', 'Animated condition UI', 'Responsive layout'],
          quiz: [
            ['What should the app show when location is denied?', 'A city search fallback and a way to open settings.'],
            ['Why cache the last response?', 'To show data instantly on launch and when offline.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce catalogue with cart',
          description: 'A product catalogue with a paginated grid, search and filters, product detail with Hero image, a cart persisted locally with Bloc, checkout form validation, and Firebase Auth for accounts.',
          concepts: ['Paginated product grid', 'Detail screen with Hero', 'Cart Bloc and persistence', 'Checkout form and validation', 'Auth-gated routes'],
          quiz: [
            ['How do you load the next page as the user scrolls?', 'Listen to the ScrollController and fetch when near maxScrollExtent.'],
            ['Why persist the cart locally?', 'So it survives app restarts and works before login.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: habit tracker with notifications',
          description: 'Track daily habits with streaks, schedule local reminders per habit with time zones, show a monthly heatmap, persist with drift, and write widget tests for the streak logic and reminder scheduling.',
          concepts: ['Habit and completion schema', 'Streak calculation', 'Scheduled reminders per habit', 'Monthly heatmap widget', 'Widget and unit tests'],
          quiz: [
            ['How do you keep a reminder correct across daylight saving changes?', 'Schedule with a zoned time using the timezone package.'],
            ['Where should streak calculation live so it can be tested?', 'In pure Dart logic outside widgets.'],
          ],
          style: 'project',
        },
        {
          title: 'Flutter interview questions',
          description: 'The questions that keep coming up: widget, element and render trees, StatelessWidget versus StatefulWidget, keys, BuildContext, const, the constraints model, isolates and the main thread, and how Flutter renders without native widgets.',
          concepts: ['Tree and rendering questions', 'State and lifecycle questions', 'Constraints and layout questions', 'State management comparison questions', 'Explaining performance decisions'],
          quiz: [
            ['How does Flutter draw its UI?', 'It paints every pixel itself through Skia or Impeller rather than using platform widgets.'],
            ['When does the framework create a new State object?', 'When a StatefulWidget of a different type or key appears at that position.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live coding a Flutter screen',
          description: 'Building a list-detail screen from an API in an interview: sketch the widget tree first, pick state management quickly, handle loading and error states, use builders for lists, and talk through trade-offs while typing.',
          concepts: ['Sketching the widget tree first', 'Choosing state handling under time pressure', 'Loading and error states first', 'Talking through trade-offs'],
          quiz: [
            ['What should you show before any data arrives?', 'A loading indicator, then an error state with retry if the request fails.'],
            ['Which list widget do you reach for and why?', 'ListView.builder, because it is lazy and handles any length.'],
          ],
        },
      ],
    },
  ],
})
