import { defineTrack } from '../define'

export const ios = defineTrack({
  id: 'track-ios',
  title: 'iOS Development with SwiftUI',
  description: 'Shipping iPhone and iPad apps in Swift: Xcode, SwiftUI views and layout, the Observation framework and environment, NavigationStack, SwiftData and Core Data, URLSession with async/await, actors, notifications, accessibility, animations, UIKit interop, XCTest, Instruments, Keychain and the App Store release workflow.',
  family: 'Mobile Development',
  kind: 'framework',
  icon: '🍎',
  tags: ['ios', 'swift', 'swiftui', 'mobile', 'xcode', 'swiftdata', 'app-store', 'concurrency'],
  languages: ['Swift'],
  explainMode: 'concept',
  code: { label: 'Swift with SwiftUI', id: 'swift', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-swift'],
  style: 'code',
  categories: [
    {
      title: 'Xcode and Project Setup',
      description: 'The tools and the app skeleton before the first view.',
      topics: [
        {
          title: 'Swift features SwiftUI code relies on',
          description: 'A fast recap of the Swift that fills every SwiftUI file: structs and value semantics, property wrappers, trailing closures and result builders, optionals and if let, protocols with associated types (some View), and async/await. The Swift track covers each in depth.',
          concepts: ['Structs and value semantics', 'Property wrappers as syntax', 'Trailing closures and result builders', 'some View and opaque types', 'async/await recap'],
          quiz: [
            ['Why is body declared as some View?', 'The concrete type is long and generic; some View hides it while keeping static typing.'],
            ['What makes VStack { Text("a") Text("b") } compile?', 'The @ViewBuilder result builder collects the expressions into a TupleView.'],
          ],
        },
        {
          title: 'Xcode projects, targets and schemes',
          description: 'Creating an app project, the difference between a project, target and scheme, build settings and Info.plist, simulators and running on a device, and adding dependencies with Swift Package Manager.',
          concepts: ['Project, target and scheme', 'Build settings and Info.plist', 'Simulators and device runs', 'Swift Package Manager dependencies', 'Xcode shortcuts and navigators'],
          quiz: [
            ['What is a scheme?', 'A named configuration of which target to build and how to run, test, profile and archive it.'],
            ['How do you add a third-party library?', 'File > Add Package Dependencies with the repository URL, then link the product to the target.'],
          ],
        },
        {
          title: 'App entry point and scenes',
          description: 'The @main App struct, WindowGroup and other Scene types, how SwiftUI creates the root view, the @UIApplicationDelegateAdaptor bridge for delegate callbacks, and where app-wide services get created.',
          concepts: ['@main and the App protocol', 'WindowGroup and Scene types', 'Root view and app-wide state', '@UIApplicationDelegateAdaptor'],
          quiz: [
            ['Where do you create a shared model container or API client?', 'As a property of the App struct, injected into the root view or environment.'],
            ['Why would a SwiftUI app still need an AppDelegate?', 'For push notification registration callbacks and some system integrations.'],
          ],
          prereqs: ['Xcode projects, targets and schemes'],
        },
        {
          title: 'Previews and the Canvas',
          description: 'The #Preview macro, previewing multiple states, devices, colour schemes and Dynamic Type sizes, injecting sample data and mock environment values, and using previews as the fastest UI dev loop.',
          concepts: ['#Preview macro', 'Multiple states per preview', 'Device, colour scheme and Dynamic Type variants', 'Sample data for previews', 'Interactive previews'],
          quiz: [
            ['How do you preview dark mode?', 'Apply .preferredColorScheme(.dark) in the preview or use the canvas variants control.'],
            ['Why keep sample data separate from production data?', 'Previews and tests can render deterministic content without networking.'],
          ],
          prereqs: ['App entry point and scenes'],
        },
      ],
    },
    {
      title: 'SwiftUI Views and Modifiers',
      description: 'Views are cheap value descriptions; the framework diffs them and updates the screen.',
      topics: [
        {
          title: 'Views as structs and the body property',
          description: 'A View is a struct whose body describes what to show; SwiftUI recreates these values freely and diffs them, so a view must be cheap and deterministic. Why views are not objects and why heavy work belongs elsewhere.',
          concepts: ['View protocol and body', 'Views as descriptions, not objects', 'When body is re-evaluated', 'Keeping body cheap'],
          quiz: [
            ['Does SwiftUI keep your view struct alive between renders?', 'No; it stores state separately and recreates the struct whenever it needs the body.'],
            ['Why not perform a network call inside body?', 'body may run many times; use .task or a model object.'],
          ],
          prereqs: ['Swift features SwiftUI code relies on'],
        },
        {
          title: 'Modifiers and modifier order',
          description: 'Each modifier wraps the view in a new view, so padding then background differs from background then padding. Building custom ViewModifiers, conditional modifiers, and reading the type of a modified view to understand the wrapping.',
          concepts: ['Modifiers wrap views', 'Order-dependent results', 'Custom ViewModifier and extensions', 'Conditional modifiers'],
          quiz: [
            ['What does Text("a").padding().background(.red) draw?', 'A red area including the padding, because background wraps the padded view.'],
            ['Why avoid an if-based conditional modifier that changes view type?', 'It changes view identity, resetting state and animations.'],
          ],
          prereqs: ['Views as structs and the body property'],
        },
        {
          title: 'Text, images, SF Symbols and buttons',
          description: 'Text with fonts, styles and Markdown, Image from assets and SF Symbols with rendering modes, Label, Button with roles and styles, and Link and ShareLink for system actions.',
          concepts: ['Text styling and Markdown', 'Image and SF Symbols', 'Label and button styles', 'Button roles', 'Link and ShareLink'],
          quiz: [
            ['How do you tint a multicolour SF Symbol?', 'Use .symbolRenderingMode(.palette) with foregroundStyle colours.'],
            ['What does a .destructive button role change?', 'Red styling and a different position in confirmation dialogs.'],
          ],
          prereqs: ['Modifiers and modifier order'],
        },
        {
          title: 'Custom views and ViewBuilder',
          description: 'Extracting reusable views with properties and @ViewBuilder closures for slots, generic views over content, preference keys for child-to-parent data, and the style protocols that let a component take many looks.',
          concepts: ['Extracting subviews', '@ViewBuilder slot parameters', 'Generic views over Content', 'PreferenceKey basics', 'Custom style protocols'],
          quiz: [
            ['How does a container accept arbitrary child views?', 'A generic parameter Content: View with a @ViewBuilder closure initialiser.'],
            ['What do preferences do?', 'Pass values up from children to ancestors, the reverse of the environment.'],
          ],
          prereqs: ['Modifiers and modifier order'],
        },
        {
          title: 'View identity and lifecycle',
          description: 'Structural identity from the view tree position versus explicit identity with id, why changing identity resets state and triggers onAppear, transitions on identity change, and onAppear, onDisappear and task as the lifecycle hooks.',
          concepts: ['Structural versus explicit identity', 'id modifier and state reset', 'onAppear and onDisappear', '.task lifecycle and cancellation'],
          quiz: [
            ['What happens when a view\'s id changes?', 'SwiftUI treats it as a new view: state is discarded and appearance animations run.'],
            ['When is a .task cancelled?', 'When the view disappears or its id changes.'],
          ],
          prereqs: ['Views as structs and the body property'],
        },
      ],
    },
    {
      title: 'Layout',
      description: 'Parents propose sizes, children choose, parents position.',
      topics: [
        {
          title: 'Stacks, spacing and alignment',
          description: 'HStack, VStack and ZStack with spacing and alignment, Spacer and Divider, alignment guides for lining up baselines and custom edges, and lazy stacks for long content.',
          concepts: ['HStack, VStack and ZStack', 'Spacer and Divider', 'Alignment guides', 'LazyVStack and LazyHStack'],
          quiz: [
            ['How do you push a view to the trailing edge?', 'Place a Spacer before it in an HStack.'],
            ['When should a VStack become a LazyVStack?', 'When it has many children inside a ScrollView so off-screen ones are not created.'],
          ],
          prereqs: ['Views as structs and the body property'],
        },
        {
          title: 'The layout process and frames',
          description: 'Parent proposes a size, child returns its size, parent places it. frame with fixed and min/max values, fixedSize, layoutPriority, and why a Text shrinks while an Image does not.',
          concepts: ['Proposal and response', 'frame with min, ideal and max', 'fixedSize', 'layoutPriority', 'Reading layout with the view debugger'],
          quiz: [
            ['What does .frame(maxWidth: .infinity) do?', 'Accepts any proposed width, so the view expands to fill.'],
            ['Why does fixedSize stop text truncating?', 'The view ignores the proposal and takes its ideal size.'],
          ],
          prereqs: ['Stacks, spacing and alignment'],
        },
        {
          title: 'Grids: LazyVGrid, LazyHGrid and Grid',
          description: 'Column definitions with GridItem fixed, flexible and adaptive sizing, section headers in lazy grids, and the eager Grid with GridRow for aligned tables of a few cells.',
          concepts: ['GridItem sizing modes', 'LazyVGrid with sections', 'Adaptive columns', 'Grid and GridRow'],
          quiz: [
            ['Which GridItem makes as many columns as fit?', '.adaptive(minimum:), which fills the width with equal columns.'],
            ['Grid or LazyVGrid for a settings-style table?', 'Grid, since it is small and needs aligned rows and columns.'],
          ],
          prereqs: ['The layout process and frames'],
        },
        {
          title: 'GeometryReader and safe areas',
          description: 'Reading available size and coordinates with GeometryReader, why it takes all offered space, the safe area and ignoresSafeArea, safeAreaInset for pinned bars, and the newer onGeometryChange and containerRelativeFrame options.',
          concepts: ['GeometryReader and GeometryProxy', 'Coordinate spaces', 'Safe area and ignoresSafeArea', 'safeAreaInset', 'containerRelativeFrame'],
          quiz: [
            ['Why did wrapping a view in GeometryReader change the layout?', 'GeometryReader is greedy and aligns its content to the top leading corner.'],
            ['How do you extend a background under the status bar?', 'Apply .ignoresSafeArea() to the background only.'],
          ],
          prereqs: ['The layout process and frames'],
        },
        {
          title: 'ScrollView and adaptive layouts',
          description: 'ScrollView with scroll targets and position, size classes for iPhone versus iPad, ViewThatFits for content that adapts, Dynamic Type-aware layouts, and landscape and multitasking handling.',
          concepts: ['ScrollView and scrollTargetBehavior', 'Horizontal and vertical size classes', 'ViewThatFits', 'Adapting to Dynamic Type', 'iPad multitasking sizes'],
          quiz: [
            ['How do you switch layouts between iPhone and iPad?', 'Read @Environment(\\.horizontalSizeClass) and branch on .compact versus .regular.'],
            ['What does ViewThatFits do?', 'Renders the first child that fits in the available space.'],
          ],
          prereqs: ['GeometryReader and safe areas'],
        },
      ],
    },
    {
      title: 'State Management and Data Flow',
      description: 'Source of truth, ownership, and how changes reach the screen.',
      topics: [
        {
          title: '@State and @Binding',
          description: '@State gives a view private storage that outlives struct recreation, @Binding shares read-write access with a child, $ produces a binding, and the rule that state should be owned as low in the tree as possible.',
          concepts: ['@State storage and ownership', '@Binding and the $ projection', 'Bindings for controls', 'Constant and derived bindings', 'Lowest owner rule'],
          quiz: [
            ['Why is @State marked private?', 'Only the owning view should initialise it; callers pass bindings instead.'],
            ['How do you create a Binding from two closures?', 'Binding(get: { ... }, set: { ... }).'],
          ],
          prereqs: ['View identity and lifecycle'],
        },
        {
          title: '@Observable models and @Bindable',
          description: 'The Observation framework: mark a class @Observable, store it with @State in the owner, pass it plainly to children, and use @Bindable for bindings. Views track only the properties they read, so updates are precise.',
          concepts: ['@Observable macro', 'Property-level tracking', 'Owning with @State', '@Bindable for bindings', 'Observable versus ObservableObject'],
          quiz: [
            ['Why do @Observable models cause fewer redraws than ObservableObject?', 'Views re-render only when a property they actually read changes, not on every objectWillChange.'],
            ['How does a child bind to an @Observable model\'s property?', 'Declare @Bindable var model and use $model.property.'],
          ],
          prereqs: ['@State and @Binding'],
        },
        {
          title: 'ObservableObject, @StateObject and @ObservedObject',
          description: 'The pre-iOS 17 model layer still found in most codebases: @Published properties, @StateObject for ownership versus @ObservedObject for injection, and the bugs that happen when the wrong one is used.',
          concepts: ['ObservableObject and @Published', '@StateObject versus @ObservedObject', 'objectWillChange semantics', 'Migrating to @Observable'],
          quiz: [
            ['What goes wrong with @ObservedObject var vm = ViewModel()?', 'The object is recreated on every render because the view does not own it; use @StateObject.'],
            ['Which is the modern replacement for ObservableObject?', 'The @Observable macro from the Observation framework.'],
          ],
          prereqs: ['@Observable models and @Bindable'],
        },
        {
          title: 'The environment',
          description: 'Values that flow down the tree: built-in keys such as colorScheme and dismiss, injecting @Observable models with .environment, custom EnvironmentKey values, and when environment beats passing parameters.',
          concepts: ['@Environment built-in values', 'Injecting observable models', 'Custom EnvironmentKey', 'dismiss and openURL actions', 'Environment versus parameters'],
          quiz: [
            ['How do you inject an @Observable model for the whole tree?', '.environment(model) at the root and @Environment(Model.self) in readers.'],
            ['What happens if a view reads an environment object that was never injected?', 'A runtime crash, so inject it in previews and tests too.'],
          ],
          prereqs: ['@Observable models and @Bindable'],
        },
        {
          title: 'App lifecycle and scene phase',
          description: 'Reacting to the app moving between active, inactive and background with @Environment(\\.scenePhase), saving state on background, restoring on launch, background time limits, and state restoration with SceneStorage.',
          concepts: ['ScenePhase transitions', 'Saving on background', 'Background execution limits', '@SceneStorage restoration', 'Launch and cold start work'],
          quiz: [
            ['When should unsaved data be persisted?', 'On the transition to .background or .inactive.'],
            ['How much time does an app get after entering the background?', 'A few seconds, extended only through a background task request.'],
          ],
          prereqs: ['App entry point and scenes', 'The environment'],
        },
      ],
    },
    {
      title: 'Navigation and Lists',
      topics: [
        {
          title: 'NavigationStack and navigationDestination',
          description: 'Stack navigation driven by a path array: NavigationLink with values, navigationDestination(for:) to map a type to a screen, programmatic push and pop by editing the path, and toolbar and title configuration.',
          concepts: ['NavigationStack and path binding', 'NavigationLink(value:)', 'navigationDestination(for:)', 'Programmatic push and pop', 'Toolbar and navigation titles'],
          quiz: [
            ['How do you pop to root?', 'Remove all elements from the path array.'],
            ['Why must destination types be Hashable?', 'Path elements are stored and compared as hashable values.'],
          ],
          prereqs: ['@State and @Binding'],
        },
        {
          title: 'TabView and NavigationSplitView',
          description: 'Top-level app structure: TabView with a selection binding and per-tab navigation stacks, NavigationSplitView for iPad and Mac sidebars with two or three columns, and preserving each tab\'s stack on switch.',
          concepts: ['TabView with selection', 'A NavigationStack per tab', 'NavigationSplitView columns', 'Sidebar selection and detail', 'Adapting split view on iPhone'],
          quiz: [
            ['Where does the NavigationStack go in a tabbed app?', 'Inside each tab, so each keeps its own history.'],
            ['How does NavigationSplitView behave on iPhone?', 'It collapses into a single stack.'],
          ],
          prereqs: ['NavigationStack and navigationDestination'],
        },
        {
          title: 'List, ForEach and editing',
          description: 'List with sections, ForEach over Identifiable data, swipe actions, delete and move with an EditButton, selection, list styles, refreshable for pull-to-refresh, and why identity matters for animations.',
          concepts: ['List and Section', 'ForEach with Identifiable', 'Swipe actions and onDelete', 'Selection and EditMode', 'refreshable'],
          quiz: [
            ['Why does ForEach require Identifiable or an id key path?', 'Stable identity lets SwiftUI animate insertions and removals and keep row state.'],
            ['How do you add pull-to-refresh?', 'Apply .refreshable { await reload() } to the List.'],
          ],
          prereqs: ['NavigationStack and navigationDestination'],
        },
        {
          title: 'Sheets, alerts, dialogs and search',
          description: 'Presenting with sheet(isPresented:) and sheet(item:), fullScreenCover, alerts and confirmationDialog with roles, presentation detents for half sheets, and searchable with suggestions and scopes.',
          concepts: ['sheet with isPresented and item', 'fullScreenCover', 'alert and confirmationDialog', 'Presentation detents', 'searchable and scopes'],
          quiz: [
            ['When use sheet(item:) over sheet(isPresented:)?', 'When the sheet needs the selected model; the item binding drives both presentation and content.'],
            ['How do you make a half-height sheet?', '.presentationDetents([.medium, .large]).'],
          ],
          prereqs: ['List, ForEach and editing'],
        },
      ],
    },
    {
      title: 'Persistence',
      topics: [
        {
          title: 'SwiftData models, container and @Query',
          description: 'Declaring persistent classes with @Model, creating a ModelContainer in the App, @Query to fetch live results into a view with sorting and filtering, and inserting and deleting through the ModelContext.',
          concepts: ['@Model classes', 'ModelContainer and modelContext', '@Query with sort and filter', 'Insert, delete and save', 'Previews with in-memory containers'],
          quiz: [
            ['How does a view get live results?', '@Query var items: [Item] re-renders when matching data changes.'],
            ['Is save() required after insert?', 'Autosave runs on the main context, but call save() for explicit control and error handling.'],
          ],
          prereqs: ['@Observable models and @Bindable'],
        },
        {
          title: 'SwiftData relationships, predicates and migrations',
          description: 'One-to-many relationships with delete rules, #Predicate for type-safe filters, FetchDescriptor for fetches outside views, versioned schemas with lightweight and custom migrations, and CloudKit sync considerations.',
          concepts: ['@Relationship and delete rules', '#Predicate filters', 'FetchDescriptor', 'VersionedSchema and migrations', 'CloudKit sync constraints'],
          quiz: [
            ['What does deleteRule: .cascade do?', 'Deleting the parent deletes its related children.'],
            ['Why must CloudKit-synced models have default values and optional relationships?', 'Records may arrive partially; CloudKit cannot enforce non-optional constraints.'],
          ],
          prereqs: ['SwiftData models, container and @Query'],
        },
        {
          title: 'Core Data overview',
          description: 'The older framework SwiftData is built on: NSPersistentContainer, managed object model and NSManagedObject subclasses, @FetchRequest in SwiftUI, background contexts, and when a project still needs Core Data instead of SwiftData.',
          concepts: ['NSPersistentContainer setup', 'Managed object model', '@FetchRequest', 'Background contexts', 'Core Data versus SwiftData'],
          quiz: [
            ['When would you still pick Core Data?', 'Supporting iOS 16 or earlier, or needing features like NSFetchedResultsController or batch operations.'],
            ['Why use a background context?', 'Heavy imports off the main thread; merge changes back to the view context.'],
          ],
          prereqs: ['SwiftData models, container and @Query'],
        },
        {
          title: 'UserDefaults, @AppStorage and files',
          description: 'Small preferences with UserDefaults and @AppStorage bindings, Codable JSON files in the documents directory, FileManager paths, caches versus documents, and what belongs in each store.',
          concepts: ['UserDefaults and @AppStorage', 'Codable to JSON files', 'FileManager directories', 'Caches versus Documents', 'Choosing the right store'],
          quiz: [
            ['Should a large array be stored in UserDefaults?', 'No; it is loaded whole at launch. Use a file or SwiftData.'],
            ['Which directory does iOS purge under storage pressure?', 'Caches.'],
          ],
          prereqs: ['@State and @Binding'],
        },
      ],
    },
    {
      title: 'Networking and Concurrency',
      topics: [
        {
          title: 'URLSession with async/await',
          description: 'Building URLRequests, data(for:) with async/await, checking HTTPURLResponse status codes, configuring sessions with timeouts and caching, uploading and downloading, and where the network layer sits in the architecture.',
          concepts: ['URLRequest and data(for:)', 'Status code checks', 'URLSessionConfiguration', 'Upload and download tasks', 'API client protocol'],
          quiz: [
            ['Does data(for:) throw on a 404?', 'No; it throws only on transport errors. Check the HTTPURLResponse statusCode yourself.'],
            ['Why put the API client behind a protocol?', 'Views and models can be tested with a fake that returns canned data.'],
          ],
          prereqs: ['Swift features SwiftUI code relies on'],
        },
        {
          title: 'Codable in practice',
          description: 'Decoding nested JSON into structs, CodingKeys for renamed fields, key and date decoding strategies, optional and defaulted fields, custom init(from:) for awkward payloads, and encoding for request bodies.',
          concepts: ['Nested Codable structs', 'CodingKeys and key strategies', 'Date decoding strategies', 'Custom init(from decoder:)', 'Encoding request bodies'],
          quiz: [
            ['How do you map snake_case JSON without CodingKeys?', 'decoder.keyDecodingStrategy = .convertFromSnakeCase.'],
            ['What happens when a non-optional field is missing?', 'Decoding throws keyNotFound.'],
          ],
          prereqs: ['URLSession with async/await'],
        },
        {
          title: 'Structured concurrency in apps',
          description: 'Task and the .task modifier tied to view lifetime, async let and TaskGroup for parallel requests, cooperative cancellation with Task.checkCancellation, and avoiding detached tasks that outlive their screen.',
          concepts: ['Task and the .task modifier', 'async let and TaskGroup', 'Cancellation checks', 'Task priorities', 'Avoiding Task.detached'],
          quiz: [
            ['How do you load two endpoints in parallel?', 'async let a = fetchA(); async let b = fetchB(); then await (a, b).'],
            ['What cancels a .task started by a view?', 'The view disappearing or its identity changing.'],
          ],
          prereqs: ['URLSession with async/await', 'View identity and lifecycle'],
        },
        {
          title: 'Actors, MainActor and Sendable',
          description: 'Protecting shared mutable state with actors, why UI models are @MainActor, Sendable checks under strict concurrency, and the compiler errors that appear when data crosses isolation boundaries.',
          concepts: ['actor isolation', '@MainActor for UI models', 'Sendable conformance', 'Strict concurrency diagnostics', 'nonisolated members'],
          quiz: [
            ['Why mark an @Observable view model @MainActor?', 'Its properties drive UI and must be mutated on the main thread.'],
            ['What does the compiler require to pass a class into a Task?', 'It must be Sendable, or the access must stay within one isolation domain.'],
          ],
          prereqs: ['Structured concurrency in apps'],
        },
        {
          title: 'Error handling, caching and AsyncImage',
          description: 'Typed error enums for the network layer, mapping to user-facing messages with retry, URLCache and ETag-based caching, offline fallback from the persistence layer, and AsyncImage with placeholder and phase handling.',
          concepts: ['Network error enum', 'Retry with backoff', 'URLCache and ETags', 'Offline fallback', 'AsyncImage phases'],
          quiz: [
            ['What does AsyncImage(url:) { phase in ... } give you?', 'empty, success(Image) and failure cases to render.'],
            ['Why is AsyncImage insufficient for large lists?', 'It has no memory cache control or downsampling; use a dedicated image loader.'],
          ],
          prereqs: ['Codable in practice'],
        },
      ],
    },
    {
      title: 'System Integration',
      topics: [
        {
          title: 'Local and push notifications',
          description: 'Requesting authorisation with UNUserNotificationCenter, scheduling local notifications with calendar and time-interval triggers, categories and actions, registering for APNs remote notifications, and handling taps through the delegate.',
          concepts: ['Authorisation request', 'Local notification triggers', 'Categories and actions', 'APNs registration and device token', 'UNUserNotificationCenterDelegate'],
          quiz: [
            ['Where do you receive the APNs device token?', 'In the AppDelegate didRegisterForRemoteNotificationsWithDeviceToken callback.'],
            ['How do you show a notification while the app is in the foreground?', 'Implement willPresent in the delegate and return .banner or .list.'],
          ],
          prereqs: ['App lifecycle and scene phase'],
        },
        {
          title: 'Accessibility',
          description: 'VoiceOver labels, values and hints, accessibility traits, grouping elements, Dynamic Type with scaled fonts, reduce motion and increased contrast settings, and testing with the Accessibility Inspector and VoiceOver.',
          concepts: ['accessibilityLabel, value and hint', 'Traits and element grouping', 'Dynamic Type and scaled metrics', 'Reduce Motion and contrast settings', 'Accessibility Inspector audit'],
          quiz: [
            ['What does a VoiceOver user hear for an unlabeled icon button?', 'The image name or "button", which is why every icon control needs a label.'],
            ['How do you respect Reduce Motion?', 'Read @Environment(\\.accessibilityReduceMotion) and disable or simplify animations.'],
          ],
          prereqs: ['Text, images, SF Symbols and buttons'],
        },
        {
          title: 'Integrating UIKit',
          description: 'UIViewRepresentable and UIViewControllerRepresentable with coordinators for delegates, UIHostingController to embed SwiftUI in UIKit apps, and choosing UIKit for text views, cameras, maps and other gaps.',
          concepts: ['UIViewRepresentable', 'Coordinator for delegates', 'UIViewControllerRepresentable', 'UIHostingController', 'When UIKit is still needed'],
          quiz: [
            ['What is the coordinator for?', 'An object that acts as the UIKit delegate and forwards events back into SwiftUI.'],
            ['When is updateUIView called?', 'Whenever the SwiftUI state the representable depends on changes.'],
          ],
          prereqs: ['Custom views and ViewBuilder'],
        },
        {
          title: 'Keychain and security',
          description: 'Storing tokens with Keychain Services and its access control flags, biometric unlock with LocalAuthentication, App Transport Security, keeping secrets out of the bundle, and protecting data with file protection classes.',
          concepts: ['Keychain Services and SecItem', 'Accessibility and access control flags', 'LocalAuthentication biometrics', 'App Transport Security', 'Data protection classes'],
          quiz: [
            ['Why not store a token in UserDefaults?', 'It is a plain plist readable from a backup; Keychain encrypts it.'],
            ['What does kSecAttrAccessibleWhenUnlockedThisDeviceOnly do?', 'Makes the item readable only while unlocked and excludes it from backups to other devices.'],
          ],
          prereqs: ['UserDefaults, @AppStorage and files'],
        },
        {
          title: 'Location, camera and photos',
          description: 'CoreLocation with authorisation levels and async updates, PhotosPicker for selecting images without permission, capturing with the camera through UIImagePickerController or AVFoundation, and the Info.plist usage strings each requires.',
          concepts: ['CLLocationManager authorisation', 'Async location updates', 'PhotosPicker', 'Camera capture options', 'Usage description keys'],
          quiz: [
            ['What happens without NSLocationWhenInUseUsageDescription?', 'The app crashes when requesting location.'],
            ['Does PhotosPicker require photo library permission?', 'No; the user picks in a system view and only chosen items are shared.'],
          ],
          prereqs: ['Integrating UIKit'],
        },
      ],
    },
    {
      title: 'Animations and Gestures',
      topics: [
        {
          title: 'Implicit and explicit animations',
          description: 'withAnimation for state-driven changes, the animation modifier bound to a value, spring and timing curves, and why animations only run when identity is stable and the change is animatable.',
          concepts: ['withAnimation', 'animation(_:value:)', 'Spring and timing curves', 'Animatable properties', 'Disabling animations'],
          quiz: [
            ['Why does an animation not play?', 'Often the view identity changed or the property is not animatable, such as a font weight.'],
            ['Which is preferred, animation(.default) without a value or with one?', 'With a value; the valueless form is deprecated and animates unintended changes.'],
          ],
          prereqs: ['View identity and lifecycle'],
        },
        {
          title: 'Transitions and matchedGeometryEffect',
          description: 'Insertion and removal transitions with .transition, asymmetric and combined transitions, matchedGeometryEffect for hero-style moves between states, and the zoom navigation transition in recent iOS.',
          concepts: ['transition on insert and remove', 'Asymmetric transitions', 'matchedGeometryEffect', 'Navigation zoom transition'],
          quiz: [
            ['Why does a transition not appear?', 'The insertion or removal was not inside withAnimation, or the container did not change identity.'],
            ['What does matchedGeometryEffect need?', 'A shared Namespace and the same id on the source and destination views.'],
          ],
          prereqs: ['Implicit and explicit animations'],
        },
        {
          title: 'Phase and keyframe animators and gestures',
          description: 'PhaseAnimator for multi-step sequences, KeyframeAnimator for timed tracks, DragGesture with @GestureState, gesture composition and priorities, and combining gestures with animation for interactive sheets and cards.',
          concepts: ['PhaseAnimator', 'KeyframeAnimator', 'DragGesture and @GestureState', 'Simultaneous and sequenced gestures', 'Interactive spring feedback'],
          quiz: [
            ['What does @GestureState do?', 'Stores transient gesture data that resets automatically when the gesture ends.'],
            ['When choose KeyframeAnimator over PhaseAnimator?', 'When several properties need independent timing tracks.'],
          ],
          prereqs: ['Transitions and matchedGeometryEffect'],
        },
      ],
    },
    {
      title: 'Testing and Performance',
      topics: [
        {
          title: 'Unit tests with XCTest and Swift Testing',
          description: 'A test target, XCTestCase with setUp and assertions, the newer Swift Testing @Test and #expect macros, parameterised tests, and structuring models so logic can be tested without views.',
          concepts: ['Test target and XCTestCase', 'XCTAssert family', '@Test and #expect', 'Parameterised tests', 'Testable architecture'],
          quiz: [
            ['What does #expect(x == 3) do on failure?', 'Records a failure showing both values without stopping the test.'],
            ['How do you import internal symbols into tests?', '@testable import ModuleName.'],
          ],
          prereqs: ['@Observable models and @Bindable'],
        },
        {
          title: 'Testing async code and mocking',
          description: 'async test functions, injecting fake API clients through protocols, URLProtocol stubs for URLSession, testing @MainActor models, and expectations for callback-based code.',
          concepts: ['async test functions', 'Protocol-based fakes', 'URLProtocol stubbing', 'Testing MainActor models', 'XCTestExpectation'],
          quiz: [
            ['How do you stub network responses without a mock client?', 'Register a URLProtocol subclass in a URLSessionConfiguration.'],
            ['Why inject the API client rather than use a singleton?', 'Tests can substitute a fake deterministically.'],
          ],
          prereqs: ['Unit tests with XCTest and Swift Testing', 'Actors, MainActor and Sendable'],
        },
        {
          title: 'UI tests with XCUITest',
          description: 'Launching the app with arguments, finding elements by accessibility identifiers, tapping and typing, waiting for existence, screenshots, and keeping UI tests few and stable.',
          concepts: ['XCUIApplication launch', 'Accessibility identifiers', 'Queries and waits', 'Launch arguments for test modes', 'Screenshot attachments'],
          quiz: [
            ['Why set accessibilityIdentifier on views?', 'UI tests can find elements reliably regardless of localised text.'],
            ['How do you wait for a slow element?', 'element.waitForExistence(timeout:).'],
          ],
          prereqs: ['Unit tests with XCTest and Swift Testing', 'Accessibility'],
        },
        {
          title: 'Instruments',
          description: 'Profiling a release build with Time Profiler for CPU, Allocations and Leaks for memory, the SwiftUI instrument for view body counts, Network and Hangs for stalls, and reading the call tree.',
          concepts: ['Time Profiler call tree', 'Allocations and Leaks', 'SwiftUI instrument', 'Hangs and Network', 'Profiling release builds'],
          quiz: [
            ['Which instrument shows how often a view body runs?', 'The SwiftUI instrument.'],
            ['What does a hang mean?', 'The main thread was blocked long enough for the UI to stop responding.'],
          ],
          prereqs: ['Structured concurrency in apps'],
        },
        {
          title: 'SwiftUI performance',
          description: 'Common causes of slow SwiftUI: expensive body computations, over-broad observation, AnyView erasure, non-lazy stacks, and identity churn. Diagnosing with Self._printChanges and fixing with smaller views and precise dependencies.',
          concepts: ['Self._printChanges', 'Splitting views to narrow updates', 'Avoiding AnyView', 'Lazy containers', 'Stable identity in lists'],
          quiz: [
            ['What does Self._printChanges() print?', 'Which state or property change caused the body to re-evaluate.'],
            ['Why avoid AnyView in lists?', 'It hides the view type so SwiftUI cannot diff efficiently.'],
          ],
          prereqs: ['Instruments'],
        },
      ],
    },
    {
      title: 'App Store Release',
      topics: [
        {
          title: 'Signing, certificates and capabilities',
          description: 'Apple Developer Program, bundle identifiers, development and distribution certificates, provisioning profiles, automatic signing, entitlements and capabilities such as push and app groups, and fixing common signing errors.',
          concepts: ['Bundle id and team', 'Certificates and profiles', 'Automatic signing', 'Entitlements and capabilities', 'Common signing errors'],
          quiz: [
            ['What does a provisioning profile bind together?', 'App id, certificate, entitlements and, for development, device UDIDs.'],
            ['Why does a push capability need an entitlement?', 'APNs registration fails unless the aps-environment entitlement is present.'],
          ],
          prereqs: ['Xcode projects, targets and schemes'],
        },
        {
          title: 'Archiving, App Store Connect and TestFlight',
          description: 'Archiving a release build, uploading with Xcode or Transporter, version and build numbers, App Store Connect records, TestFlight internal and external testing, and collecting tester feedback and crashes.',
          concepts: ['Archive and upload', 'Version and build numbers', 'App Store Connect app record', 'Internal and external TestFlight', 'Tester feedback and crash logs'],
          quiz: [
            ['What must increase for a new TestFlight upload of the same version?', 'The build number.'],
            ['Does external TestFlight require review?', 'Yes, a lighter beta review before testers can install.'],
          ],
          prereqs: ['Signing, certificates and capabilities'],
        },
        {
          title: 'App Review, privacy and the listing',
          description: 'App Review guidelines that cause rejections, privacy nutrition labels and the privacy manifest, required-reason APIs, screenshots and metadata, age rating, and responding to a rejection.',
          concepts: ['Common rejection reasons', 'Privacy nutrition labels', 'Privacy manifest and required-reason APIs', 'Screenshots and metadata', 'Responding to rejections'],
          quiz: [
            ['What is a privacy manifest?', 'A PrivacyInfo.xcprivacy file declaring data collected and reasons for using certain APIs.'],
            ['What should you include for reviewers when the app needs login?', 'A demo account and review notes.'],
          ],
          prereqs: ['Archiving, App Store Connect and TestFlight'],
        },
        {
          title: 'CI/CD and crash monitoring',
          description: 'Xcode Cloud workflows or fastlane match and gym on a CI runner, automated tests on each push, uploading to TestFlight from CI, and crash and hang monitoring with MetricKit and Xcode Organizer.',
          concepts: ['Xcode Cloud workflows', 'fastlane match and gym', 'Tests on every push', 'Automated TestFlight upload', 'MetricKit and Organizer crashes'],
          quiz: [
            ['What does fastlane match manage?', 'Certificates and profiles stored in a shared encrypted repository.'],
            ['Where do you see crash reports without a third-party SDK?', 'Xcode Organizer under Crashes.'],
          ],
          prereqs: ['App Review, privacy and the listing'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Apps that exercise the whole track, then the questions hiring teams ask.',
      topics: [
        {
          title: 'Project: notes app with iCloud sync',
          description: 'A notes app with SwiftData models synced through CloudKit, a NavigationSplitView list and editor, search, rich text formatting, conflict-tolerant models, and unit tests for the model logic.',
          concepts: ['SwiftData schema with CloudKit rules', 'Split view list and editor', 'Search and sorting', 'Handling sync conflicts', 'Model tests'],
          quiz: [
            ['What model constraints does CloudKit sync impose?', 'Optional relationships, default values and no unique constraints.'],
            ['Why keep formatting in an attributed string rather than HTML?', 'Native editing, accessibility and no parser.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: weather app',
          description: 'Current and hourly weather for the device location using CoreLocation and a weather API with async/await, cached last result, animated SF Symbol conditions, widgets via WidgetKit, and graceful permission denial.',
          concepts: ['Location authorisation', 'Weather API client and Codable', 'Cache and offline state', 'Animated condition symbols', 'Home screen widget'],
          quiz: [
            ['How does a widget get data?', 'A timeline provider fetches and returns entries the system renders.'],
            ['What should the app do when location is denied?', 'Offer city search and a link to Settings.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce catalogue with cart',
          description: 'A product grid with LazyVGrid and paging, search and filters, a detail view with matchedGeometryEffect, a cart persisted with SwiftData, checkout validation, and Keychain-stored auth tokens.',
          concepts: ['Paged product grid', 'Detail with matched geometry', 'Cart in SwiftData', 'Checkout form validation', 'Auth token in Keychain'],
          quiz: [
            ['How do you load the next page as the user scrolls?', 'Trigger a fetch in onAppear of the last few items.'],
            ['Why persist the cart?', 'It survives relaunch and works before login.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: habit tracker with notifications',
          description: 'Daily habits with streaks, per-habit local notification reminders with actions to mark done, a monthly heatmap, SwiftData persistence, and tests for streak logic.',
          concepts: ['Habit and completion models', 'Streak calculation', 'Scheduled reminders with actions', 'Heatmap view', 'Streak tests'],
          quiz: [
            ['How does a notification action mark a habit done?', 'The delegate receives the action identifier and updates the model.'],
            ['Where does streak logic live?', 'In a plain Swift type testable without UI.'],
          ],
          style: 'project',
        },
        {
          title: 'iOS interview questions',
          description: 'The questions that keep coming up: value versus reference semantics in views, @State versus @Observable versus environment, view identity, the layout algorithm, structured concurrency and actors, SwiftData versus Core Data, and memory management.',
          concepts: ['State and data flow questions', 'Layout and identity questions', 'Concurrency questions', 'Persistence questions', 'Memory and ARC questions'],
          quiz: [
            ['Why does SwiftUI use structs for views?', 'They are cheap value descriptions that can be recreated and diffed freely.'],
            ['What is the difference between @StateObject and @ObservedObject?', '@StateObject owns and creates the object once; @ObservedObject observes one owned elsewhere.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live coding a SwiftUI screen',
          description: 'Building a list-detail screen from an API in an interview: model first, an @Observable loader with loading and error states, NavigationStack, a List with async loading, and explaining what you would test.',
          concepts: ['Model and loader first', 'Loading and error states', 'NavigationStack list-detail', 'Explaining tests and trade-offs'],
          quiz: [
            ['What do you write before any view?', 'The Codable model and an @Observable loader with a state enum.'],
            ['How do you start the load?', 'A .task modifier on the list view.'],
          ],
        },
      ],
    },
  ],
})
