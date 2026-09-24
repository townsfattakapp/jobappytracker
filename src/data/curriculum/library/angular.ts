import { defineTrack } from '../define'

export const angular = defineTrack({
  id: 'track-angular',
  title: 'Angular',
  description: 'Modern Angular with standalone components, signals, built-in control flow, dependency injection, RxJS and HttpClient, routing, forms, change detection and zoneless apps, NgRx, testing and server-side rendering, ending in real projects and interview practice.',
  family: 'Frontend & Web',
  kind: 'framework',
  icon: '🅰️',
  tags: ['angular', 'typescript', 'signals', 'rxjs', 'ngrx', 'frontend', 'ssr'],
  languages: ['TypeScript'],
  explainMode: 'react',
  code: { label: 'TypeScript with Angular', id: 'typescript', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-js'],
  style: 'code',
  categories: [
    {
      title: 'CLI and Project Structure',
      description: 'The Angular CLI generates, serves, builds and tests the app; knowing what it produced is the first step.',
      topics: [
        {
          title: 'Installing the Angular CLI and creating a project',
          description: 'Installing @angular/cli globally, running ng new with the options that matter (routing, style language, SSR), and what ng serve, ng generate and ng build do so the CLI becomes a daily tool rather than a mystery.',
          concepts: ['Installing @angular/cli and ng new', 'ng serve and live reload', 'ng generate schematics', 'ng build and the dist folder'],
          quiz: [
            ['Which command scaffolds a component in a folder?', 'ng generate component name (or ng g c name).'],
            ['What does ng serve do?', 'Builds the app in memory, serves it on localhost:4200 and rebuilds on file changes.'],
          ],
        },
        {
          title: 'Project structure and configuration files',
          description: 'What angular.json, tsconfig.json, main.ts and app.config.ts control: build targets, TypeScript strictness, the bootstrapApplication call and the providers array that replaced NgModule imports in standalone apps.',
          concepts: ['angular.json build targets', 'main.ts and bootstrapApplication', 'app.config.ts providers', 'tsconfig strict and template checks'],
          quiz: [
            ['Where do app-wide providers such as the router go in a standalone app?', 'In the providers array of app.config.ts passed to bootstrapApplication.'],
            ['What does strictTemplates enable?', 'Full type checking of bindings inside templates.'],
          ],
          prereqs: ['Installing the Angular CLI and creating a project'],
        },
        {
          title: 'Environments, assets and the build pipeline',
          description: 'Environment file replacement per build configuration, the public folder for static assets, production optimisations (minification, tree shaking) and how budgets in angular.json stop the bundle growing unnoticed.',
          concepts: ['Build configurations and fileReplacements', 'Static assets and the public folder', 'Production optimisation flags', 'Size budgets'],
          quiz: [
            ['How does ng build --configuration production pick the environment?', 'Through fileReplacements in angular.json that swap environment.ts for the production file.'],
            ['What happens when a budget is exceeded?', 'The build warns or fails depending on the warning and error thresholds.'],
          ],
          prereqs: ['Project structure and configuration files'],
        },
      ],
    },
    {
      title: 'Components and Templates',
      description: 'Standalone components, template syntax and the built-in control flow blocks.',
      topics: [
        {
          title: 'Standalone components',
          description: 'A component is a class with a @Component decorator holding a selector, template and styles; standalone components import what they use directly, so no NgModule is needed and lazy loading works per component.',
          concepts: ['The @Component decorator', 'selector, template and styles', 'The imports array', 'Composing components in templates'],
          quiz: [
            ['How does a standalone component use another component?', 'By listing it in its imports array.'],
            ['Is standalone the default in current Angular?', 'Yes, since v19 components are standalone unless standalone: false is set.'],
          ],
          prereqs: ['Project structure and configuration files'],
        },
        {
          title: 'Template syntax and bindings',
          description: 'Interpolation with {{ }}, property binding with [prop], attribute, class and style bindings, event binding with (event) and $event, and the @let block for naming template values.',
          concepts: ['Interpolation', 'Property and attribute binding', 'Class and style binding', 'Event binding and $event', '@let declarations'],
          quiz: [
            ['Difference between [disabled] and [attr.aria-label]?', '[disabled] sets the DOM property; attr. sets the HTML attribute.'],
            ['How do you add a class conditionally?', '[class.active]="isActive".'],
          ],
          prereqs: ['Standalone components'],
        },
        {
          title: 'Built-in control flow: @if, @for and @switch',
          description: 'The block syntax that replaced *ngIf and *ngFor: @if with @else, @for with a mandatory track expression and @empty, @switch with @case, and why track matters for DOM reuse and performance.',
          concepts: ['@if and @else blocks', '@for with track', '@empty and $index variables', '@switch and @case', 'Migrating from *ngIf and *ngFor'],
          quiz: [
            ['Why is track required in @for?', 'So Angular can identify items and reuse DOM nodes instead of recreating them.'],
            ['What does @for (item of items; track item.id) { } @empty { } render when items is empty?', 'The @empty block.'],
          ],
          prereqs: ['Template syntax and bindings'],
        },
        {
          title: 'Component styles and view encapsulation',
          description: 'Per-component stylesheets, the Emulated encapsulation that scopes CSS with generated attributes, ShadowDom and None modes, the :host selector and why ::ng-deep is a last resort.',
          concepts: ['Emulated encapsulation', 'ShadowDom and None modes', ':host and :host-context', 'Global styles versus component styles'],
          quiz: [
            ['How does Emulated encapsulation scope styles?', 'It adds unique attributes to elements and rewrites selectors to match them.'],
            ['What does :host target?', 'The element the component is attached to.'],
          ],
          prereqs: ['Standalone components'],
        },
        {
          title: 'Content projection with ng-content',
          description: 'Passing markup into a component: single-slot and multi-slot projection with the select attribute, ngProjectAs, and ng-template with ngTemplateOutlet when the parent must control rendering.',
          concepts: ['Single-slot projection', 'Multi-slot projection with select', 'ngProjectAs', 'ng-template and ngTemplateOutlet'],
          quiz: [
            ['How do you project only header elements into one slot?', '<ng-content select="[header]"> or select="app-header".'],
            ['When would you use ngTemplateOutlet instead of ng-content?', 'When the component must decide when or how many times to render the passed template.'],
          ],
          prereqs: ['Standalone components'],
        },
      ],
    },
    {
      title: 'Signals, Inputs and Outputs',
      description: 'Reactive state and component communication with the signal APIs.',
      topics: [
        {
          title: 'signal, computed and effect',
          description: 'Signals are values with change notification: signal() holds writable state, computed() derives lazily and memoises, effect() runs side effects when dependencies change, and untracked() reads without subscribing.',
          concepts: ['Writable signals: set and update', 'computed derivations', 'effect and injection context', 'untracked reads', 'linkedSignal for resettable state'],
          quiz: [
            ['How do you change a signal holding an array by appending?', 'items.update(list => [...list, item]).'],
            ['When does a computed recalculate?', 'Lazily, on the next read after one of its dependencies changed.'],
            ['Where can effect() be created?', 'In an injection context such as a constructor or field initialiser.'],
          ],
          prereqs: ['Standalone components'],
        },
        {
          title: 'Signal inputs and model inputs',
          description: 'input() and input.required() declare component inputs as read-only signals with optional transforms; model() creates a two-way bindable input that the child can also write, replacing the @Input/@Output pair for simple values.',
          concepts: ['input() and input.required()', 'Input transforms and aliases', 'model() for two-way binding', 'Reading inputs in computed'],
          quiz: [
            ['What does input.required<string>() do at compile time?', 'Makes the template fail to compile when the input is not bound.'],
            ['How does a parent bind to a model input named value?', '[(value)]="parentSignalOrField".'],
          ],
          prereqs: ['signal, computed and effect'],
        },
        {
          title: 'Outputs and custom events',
          description: 'Emitting events to a parent with output(), typed payloads, outputFromObservable for RxJS-backed events, and listening with (eventName) in the parent template.',
          concepts: ['output() and emit', 'Typed event payloads', 'outputFromObservable', 'Listening in the parent'],
          quiz: [
            ['How do you declare an output that emits a number?', 'selected = output<number>().'],
            ['How does a parent handle the event?', '(selected)="onSelected($event)".'],
          ],
          prereqs: ['Signal inputs and model inputs'],
        },
        {
          title: 'Signal queries and lifecycle hooks',
          description: 'viewChild(), viewChildren() and contentChild() return signals pointing at elements or components; ngOnInit, ngOnChanges and ngOnDestroy still mark the lifecycle, while afterNextRender runs DOM code safely once rendering has finished.',
          concepts: ['viewChild and viewChildren signals', 'contentChild for projected content', 'ngOnInit and ngOnDestroy', 'afterNextRender for DOM access', 'DestroyRef cleanup'],
          quiz: [
            ['Why prefer afterNextRender over ngAfterViewInit for measuring the DOM?', 'It runs only in the browser after rendering, which is safe under SSR.'],
            ['What does viewChild.required(ElementRef) guarantee?', 'The query resolves or Angular throws, so no undefined checks are needed.'],
          ],
          prereqs: ['signal, computed and effect'],
        },
      ],
    },
    {
      title: 'Dependency Injection and Services',
      description: 'How Angular builds and shares objects, and how services hold state and logic outside components.',
      topics: [
        {
          title: 'Injectors and providedIn root',
          description: 'The injector tree: environment injectors created at bootstrap and by routes, element injectors per component, and @Injectable({ providedIn: "root" }) which makes a tree-shakable singleton without registering it anywhere.',
          concepts: ['Environment and element injectors', 'providedIn root singletons', 'Component-level providers', 'Resolution order and scope'],
          quiz: [
            ['What does providedIn: "root" mean?', 'One instance app-wide, created on first injection and tree-shaken if unused.'],
            ['What happens if a component lists a service in its own providers?', 'Each component instance gets its own service instance.'],
          ],
        },
        {
          title: 'The inject() function',
          description: 'inject(Token) resolves dependencies inside an injection context, replacing constructor parameters; it works in field initialisers, functional guards and factories, and runInInjectionContext enables it elsewhere.',
          concepts: ['inject() in field initialisers', 'Injection context rules', 'Optional and self flags', 'runInInjectionContext'],
          quiz: [
            ['Where does inject() throw?', 'Outside an injection context, for example in a method called later or a setTimeout callback.'],
            ['How do you inject a possibly missing dependency?', 'inject(Token, { optional: true }) which returns null when absent.'],
          ],
          prereqs: ['Injectors and providedIn root'],
        },
        {
          title: 'InjectionToken and provider recipes',
          description: 'Providing non-class values with InjectionToken, and the four provider shapes useClass, useValue, useFactory and useExisting; multi providers collect several values under one token.',
          concepts: ['InjectionToken for config values', 'useClass and useExisting', 'useValue and useFactory', 'Multi providers'],
          quiz: [
            ['How do you provide an API base URL?', 'Create an InjectionToken<string> and provide it with useValue.'],
            ['What does multi: true do?', 'Collects every provider for the token into an array.'],
          ],
          prereqs: ['The inject() function'],
        },
        {
          title: 'Services as shared state',
          description: 'A root service holding signals is the simplest state container: components inject it, read computed views and call methods that update state, keeping components thin and testable.',
          concepts: ['State in root services', 'Exposing readonly signals', 'Mutation through methods', 'Component to service boundaries'],
          quiz: [
            ['Why expose asReadonly() signals from a service?', 'So components can read state but only the service can change it.'],
            ['Where should HTTP calls live?', 'In services, not components.'],
          ],
          prereqs: ['Injectors and providedIn root', 'signal, computed and effect'],
        },
      ],
    },
    {
      title: 'RxJS and HttpClient',
      description: 'Streams for events and HTTP, and how they interoperate with signals.',
      topics: [
        {
          title: 'Observables, subjects and subscriptions',
          description: 'An Observable is a lazy push stream; subscribing starts it and returns a Subscription that must be cleaned up. Subject, BehaviorSubject and ReplaySubject multicast values and hold or replay state.',
          concepts: ['Observable lifecycle and laziness', 'Subscribe and unsubscribe', 'Subject variants', 'Hot versus cold streams'],
          quiz: [
            ['Difference between Subject and BehaviorSubject?', 'BehaviorSubject holds a current value and emits it to new subscribers.'],
            ['What leaks if you forget to unsubscribe from an interval?', 'The timer keeps running and holding references after the component is gone.'],
          ],
        },
        {
          title: 'Core operators: map, filter, switchMap and debounceTime',
          description: 'Transforming streams with pipe(): map and filter for values, switchMap, mergeMap, concatMap and exhaustMap for nested requests with different cancellation rules, debounceTime and distinctUntilChanged for input handling.',
          concepts: ['pipe, map and filter', 'switchMap versus mergeMap', 'concatMap and exhaustMap', 'debounceTime and distinctUntilChanged', 'catchError and retry'],
          quiz: [
            ['Which flattening operator cancels the previous inner request?', 'switchMap.'],
            ['Which operator ignores new clicks while a save is in flight?', 'exhaustMap.'],
          ],
          prereqs: ['Observables, subjects and subscriptions'],
        },
        {
          title: 'HttpClient requests',
          description: 'provideHttpClient() with withFetch(), typed get, post, put and delete calls, HttpParams and HttpHeaders, response typing with observe and responseType, and handling HttpErrorResponse.',
          concepts: ['provideHttpClient and withFetch', 'Typed requests with generics', 'HttpParams and headers', 'HttpErrorResponse handling'],
          quiz: [
            ['How do you type a GET response?', 'http.get<User[]>(url).'],
            ['How do you read status and headers, not just the body?', 'Pass { observe: "response" }.'],
          ],
          prereqs: ['Core operators: map, filter, switchMap and debounceTime', 'Services as shared state'],
        },
        {
          title: 'Functional interceptors',
          description: 'HttpInterceptorFn receives the request and a next handler; interceptors registered with withInterceptors() add auth headers, log, retry or map errors, and run in the order provided.',
          concepts: ['HttpInterceptorFn signature', 'Cloning immutable requests', 'Auth header injection', 'Interceptor ordering and error mapping'],
          quiz: [
            ['Why must you call req.clone()?', 'HttpRequest is immutable; clone creates a modified copy.'],
            ['How are interceptors registered?', 'provideHttpClient(withInterceptors([fn1, fn2])).'],
          ],
          prereqs: ['HttpClient requests'],
        },
        {
          title: 'Signals and RxJS interop',
          description: 'toSignal() turns an Observable into a signal with an initial value and auto-unsubscribe, toObservable() goes the other way, AsyncPipe subscribes in templates, and takeUntilDestroyed ties manual subscriptions to component lifetime.',
          concepts: ['toSignal with initialValue', 'toObservable for effects', 'AsyncPipe in templates', 'takeUntilDestroyed', 'Choosing signals or streams'],
          quiz: [
            ['What does toSignal do on component destroy?', 'Unsubscribes automatically.'],
            ['When is RxJS a better fit than signals?', 'For time-based or event streams needing debounce, cancellation or combination.'],
          ],
          prereqs: ['signal, computed and effect', 'Observables, subjects and subscriptions'],
        },
      ],
    },
    {
      title: 'Routing',
      description: 'Client-side navigation, lazy loading and protecting routes.',
      topics: [
        {
          title: 'Routes, RouterOutlet and navigation',
          description: 'provideRouter(routes) registers a Routes array; RouterOutlet renders the matched component, routerLink and routerLinkActive build links, and Router.navigate and navigateByUrl move programmatically.',
          concepts: ['Routes array and provideRouter', 'RouterOutlet placement', 'routerLink and routerLinkActive', 'Programmatic navigation', 'Wildcard and redirect routes'],
          quiz: [
            ['How do you define a 404 route?', '{ path: "**", component: NotFoundComponent } as the last route.'],
            ['What does pathMatch: "full" change on a redirect?', 'The empty path matches only the whole URL, not every prefix.'],
          ],
          prereqs: ['Standalone components'],
        },
        {
          title: 'Route parameters, lazy loading and input binding',
          description: 'Dynamic segments like :id, reading them through ActivatedRoute or directly as component inputs with withComponentInputBinding(), and loadComponent or loadChildren to split routes into lazily loaded chunks.',
          concepts: ['Path and query parameters', 'withComponentInputBinding', 'loadComponent for lazy routes', 'loadChildren and route files'],
          quiz: [
            ['How does a component receive :id as an input?', 'Declare id = input<string>() and enable withComponentInputBinding() on the router.'],
            ['What does loadComponent produce at build time?', 'A separate chunk loaded on first navigation to that route.'],
          ],
          prereqs: ['Routes, RouterOutlet and navigation'],
        },
        {
          title: 'Functional guards',
          description: 'CanActivateFn, CanMatchFn and CanDeactivateFn are plain functions that use inject() to reach services and return a boolean, UrlTree or Observable; they protect routes, redirect unauthenticated users and warn about unsaved changes.',
          concepts: ['CanActivateFn and redirects with UrlTree', 'CanMatchFn for lazy routes', 'CanDeactivateFn for unsaved changes', 'Guards returning observables'],
          quiz: [
            ['How does a guard redirect to login?', 'Return inject(Router).createUrlTree(["/login"]).'],
            ['Why prefer canMatch over canActivate for a lazy route?', 'A failed canMatch skips downloading the chunk and lets later routes match.'],
          ],
          prereqs: ['Route parameters, lazy loading and input binding', 'The inject() function'],
        },
        {
          title: 'Resolvers, nested routes and route data',
          description: 'ResolveFn fetches data before a route activates and exposes it through the data property, children arrays create nested outlets and layouts, and static data carries titles and flags per route.',
          concepts: ['ResolveFn and resolved data', 'Child routes and nested outlets', 'Static route data and titles', 'Named outlets'],
          quiz: [
            ['What is the trade-off of resolvers?', 'No partial UI: navigation waits until the data arrives.'],
            ['How do you set the browser tab title per route?', 'The title property on the route, applied by the TitleStrategy.'],
          ],
          prereqs: ['Route parameters, lazy loading and input binding'],
        },
      ],
    },
    {
      title: 'Forms',
      description: 'Two approaches to forms and how validation fits each.',
      topics: [
        {
          title: 'Template-driven forms with ngModel',
          description: 'FormsModule and [(ngModel)] bind inputs to component fields, the name attribute registers controls with the parent NgForm, and validation attributes drive the valid, touched and dirty states.',
          concepts: ['FormsModule and NgForm', 'ngModel two-way binding', 'Control states: touched, dirty, valid', 'Submitting with ngSubmit'],
          quiz: [
            ['Why does an ngModel inside a form need a name attribute?', 'So NgForm can register the control under that key.'],
            ['When is template-driven a good fit?', 'Small, simple forms with little dynamic logic.'],
          ],
          prereqs: ['Template syntax and bindings'],
        },
        {
          title: 'Reactive forms: FormControl, FormGroup and FormBuilder',
          description: 'ReactiveFormsModule keeps the form model in the class: FormControl, FormGroup and FormBuilder build it, [formGroup] and formControlName connect the template, and valueChanges exposes updates as a stream.',
          concepts: ['FormControl and FormGroup', 'FormBuilder and nonNullable', 'formControlName bindings', 'valueChanges and statusChanges', 'setValue versus patchValue'],
          quiz: [
            ['Difference between setValue and patchValue?', 'setValue needs every field; patchValue accepts a subset.'],
            ['What does fb.nonNullable.group do?', 'Creates controls whose reset() returns the initial value rather than null.'],
          ],
          prereqs: ['Template-driven forms with ngModel'],
        },
        {
          title: 'Validation and custom validators',
          description: 'Built-in Validators such as required, minLength and pattern, writing ValidatorFn and AsyncValidatorFn, cross-field validation on a group, and showing errors only after interaction.',
          concepts: ['Built-in Validators', 'Custom ValidatorFn', 'Async validators', 'Cross-field group validators', 'Displaying errors'],
          quiz: [
            ['What does a validator return when the control is valid?', 'null.'],
            ['Where does a password-match validator go?', 'On the FormGroup so it can read both controls.'],
          ],
          prereqs: ['Reactive forms: FormControl, FormGroup and FormBuilder'],
        },
        {
          title: 'Typed forms and FormArray',
          description: 'Reactive forms infer types from their controls so value and get() are typed, FormArray manages repeating rows added and removed at runtime, and FormRecord handles dynamic keys.',
          concepts: ['Typed form values', 'FormArray for dynamic rows', 'FormRecord for dynamic keys', 'Typed access with get'],
          quiz: [
            ['How do you add a row to a FormArray?', 'array.push(fb.group({...})).'],
            ['Why did typed forms introduce null into value types?', 'Because reset() sets controls to null unless they are nonNullable.'],
          ],
          prereqs: ['Validation and custom validators'],
        },
      ],
    },
    {
      title: 'Pipes and Directives',
      description: 'Reusable template transformations and behaviours.',
      topics: [
        {
          title: 'Built-in pipes',
          description: 'DatePipe, CurrencyPipe, DecimalPipe, UpperCasePipe, JsonPipe and AsyncPipe format values in templates; each takes arguments after a colon and respects the configured locale.',
          concepts: ['date and number formatting', 'currency and locale data', 'json pipe for debugging', 'Chaining pipes with arguments'],
          quiz: [
            ['How do you format a date as 12 Mar 2025?', '{{ value | date:"d MMM y" }}.'],
            ['Why does currency need locale data registered?', 'Formatting symbols and separators come from the locale.'],
          ],
          prereqs: ['Template syntax and bindings'],
        },
        {
          title: 'Custom pipes and purity',
          description: 'A @Pipe class with a transform method; pure pipes rerun only when the input reference changes, so impure pipes that filter arrays each cycle become a performance trap.',
          concepts: ['@Pipe and transform', 'Pure versus impure pipes', 'Pipes for arrays and immutability', 'Testing a pipe'],
          quiz: [
            ['When does a pure pipe rerun?', 'When its input value or reference changes.'],
            ['Why is an impure filter pipe costly?', 'It runs on every change detection cycle.'],
          ],
          prereqs: ['Built-in pipes'],
        },
        {
          title: 'Attribute directives',
          description: 'A @Directive attached by selector to change element behaviour: the host metadata binds properties and listeners, inputs configure it, and ElementRef or Renderer2 touch the DOM safely.',
          concepts: ['@Directive and selectors', 'host bindings and listeners', 'Directive inputs', 'Renderer2 for safe DOM changes'],
          quiz: [
            ['How does a directive react to mouseenter?', 'host: { "(mouseenter)": "onEnter()" } in the decorator.'],
            ['Why use Renderer2 instead of nativeElement.style?', 'It works under SSR and other non-DOM platforms.'],
          ],
          prereqs: ['Standalone components'],
        },
        {
          title: 'Structural directives and host directives',
          description: 'Structural directives take a TemplateRef and a ViewContainerRef to create or destroy embedded views, and hostDirectives compose existing directives onto a component without touching the template.',
          concepts: ['TemplateRef and ViewContainerRef', 'Creating embedded views', 'The asterisk shorthand', 'hostDirectives composition'],
          quiz: [
            ['What does the asterisk in *appUnless expand to?', 'An ng-template wrapping the element with the directive applied.'],
            ['What does hostDirectives let a component do?', 'Apply directives to its own host element and expose their inputs.'],
          ],
          prereqs: ['Attribute directives'],
        },
      ],
    },
    {
      title: 'Change Detection, Performance and SSR',
      description: 'How Angular decides what to re-render, and how to make it fast and render on the server.',
      topics: [
        {
          title: 'Zone.js and default change detection',
          description: 'Zone.js patches browser APIs so Angular knows when async work finished, then checks the whole component tree top-down; understanding this explains both the convenience and the wasted work of the default strategy.',
          concepts: ['How Zone.js triggers checks', 'Top-down tree checks', 'ExpressionChangedAfterItHasBeenChecked', 'Running outside the zone'],
          quiz: [
            ['What triggers change detection by default?', 'Any async event patched by Zone.js such as clicks, timers and XHR completion.'],
            ['Why does ngZone.runOutsideAngular help with scroll handlers?', 'Frequent events stop triggering full tree checks.'],
          ],
          prereqs: ['Standalone components'],
        },
        {
          title: 'OnPush and signal-driven updates',
          description: 'ChangeDetectionStrategy.OnPush checks a component only when an input reference changes, an event fires inside it or a signal it reads changes, which makes immutable data and signals the natural fit.',
          concepts: ['OnPush rules', 'Immutable inputs', 'Signals marking components dirty', 'markForCheck and detectChanges'],
          quiz: [
            ['Does mutating an array in place update an OnPush child bound to it?', 'No, the reference is unchanged; create a new array.'],
            ['How do signals interact with OnPush?', 'Reading a signal in the template marks that component for check when it changes.'],
          ],
          prereqs: ['Zone.js and default change detection', 'signal, computed and effect'],
        },
        {
          title: 'Zoneless Angular',
          description: 'provideZonelessChangeDetection() removes Zone.js: updates come from signals, template events and markForCheck only, cutting bundle size and startup work but requiring signal-based state and care with third-party code.',
          concepts: ['provideZonelessChangeDetection', 'What still triggers rendering', 'Removing zone.js from polyfills', 'Migrating a zoned app'],
          quiz: [
            ['What no longer triggers change detection in zoneless mode?', 'Plain setTimeout or promise callbacks that mutate non-signal fields.'],
            ['Which state primitive makes zoneless practical?', 'Signals.'],
          ],
          prereqs: ['OnPush and signal-driven updates'],
        },
        {
          title: 'Deferrable views with @defer',
          description: '@defer lazily loads the components inside it as a separate chunk with triggers such as on viewport, on idle, on interaction or when a condition, and @placeholder, @loading and @error blocks shape what users see meanwhile.',
          concepts: ['@defer triggers', '@placeholder, @loading and @error', 'prefetch triggers', 'Which components are eligible'],
          quiz: [
            ['What must be true for a component inside @defer to be split out?', 'It must be standalone and not referenced elsewhere in the same template outside the block.'],
            ['What does @defer (on viewport) do?', 'Loads and renders the block when its placeholder scrolls into view.'],
          ],
          prereqs: ['Route parameters, lazy loading and input binding'],
        },
        {
          title: 'Server-side rendering and hydration',
          description: 'ng add @angular/ssr renders routes on the server for faster first paint and SEO; provideClientHydration reuses the server DOM instead of re-rendering, event replay captures early clicks, and incremental hydration hydrates @defer blocks on demand.',
          concepts: ['Adding @angular/ssr', 'Server routes and render modes', 'Client hydration and event replay', 'Incremental hydration', 'Browser-only code guards'],
          quiz: [
            ['Why can window be undefined in a component?', 'The code also runs on the server; guard with isPlatformBrowser or afterNextRender.'],
            ['What does withEventReplay() do?', 'Records user events before hydration and replays them afterwards.'],
          ],
          prereqs: ['Deferrable views with @defer'],
        },
      ],
    },
    {
      title: 'State Management',
      description: 'From a service with signals to NgRx when the app needs it.',
      topics: [
        {
          title: 'Choosing a state approach',
          description: 'Most apps need only signals in services and server state caching; global stores earn their place when many features share state, need time-travel debugging or strict event logs. Knowing the signs avoids over-engineering.',
          concepts: ['Local versus shared state', 'Server state versus client state', 'When a store pays off', 'Keeping state close to use'],
          quiz: [
            ['What is the simplest shared state in Angular?', 'A root-provided service exposing signals.'],
            ['Name a sign that a store is warranted.', 'Many unrelated features read and write the same state with complex transitions.'],
          ],
          prereqs: ['Services as shared state'],
        },
        {
          title: 'NgRx Store: actions, reducers, selectors and effects',
          description: 'The Redux pattern in Angular: createAction and createActionGroup describe events, createReducer with on() computes new state, createSelector memoises reads, and createEffect handles side effects such as HTTP calls.',
          concepts: ['Actions and action groups', 'Reducers with on()', 'Memoised selectors', 'Effects for side effects', 'provideStore and provideEffects'],
          quiz: [
            ['Why must reducers be pure?', 'So state changes are predictable and replayable.'],
            ['Where does an HTTP call belong in NgRx?', 'In an effect that maps the response to a success or failure action.'],
          ],
          prereqs: ['Choosing a state approach', 'Core operators: map, filter, switchMap and debounceTime'],
        },
        {
          title: 'NgRx SignalStore',
          description: 'signalStore composes withState, withComputed, withMethods and withHooks into a signal-based store; patchState updates state immutably, rxMethod bridges streams, and the entity plugin manages collections.',
          concepts: ['signalStore and withState', 'withComputed and withMethods', 'patchState updates', 'rxMethod for streams', 'withEntities for collections'],
          quiz: [
            ['How do you update state in a SignalStore?', 'patchState(store, { loading: true }) or with an updater function.'],
            ['What does withEntities add?', 'Entity map helpers such as addEntity, updateEntity and selectors.'],
          ],
          prereqs: ['NgRx Store: actions, reducers, selectors and effects'],
        },
      ],
    },
    {
      title: 'Testing',
      description: 'Unit, component and end-to-end testing for Angular apps.',
      topics: [
        {
          title: 'TestBed and unit tests with Jasmine',
          description: 'TestBed configures a testing module with imports and providers, Jasmine describes specs with describe, it and expect, and ng test runs them; the same TestBed setup works under the Vitest runner in newer CLIs.',
          concepts: ['describe, it and expect', 'TestBed.configureTestingModule', 'Karma versus Vitest runners', 'Testing pure services'],
          quiz: [
            ['How do you get a service inside a test?', 'TestBed.inject(ServiceClass).'],
            ['What replaced Karma as the CLI default runner?', 'Vitest through the @angular/build unit-test builder.'],
          ],
          prereqs: ['Services as shared state'],
        },
        {
          title: 'Component tests with fixtures and harnesses',
          description: 'TestBed.createComponent returns a ComponentFixture; detectChanges renders, fixture.debugElement queries the DOM, setInput sets signal inputs, and CDK component harnesses give stable APIs for Material components.',
          concepts: ['ComponentFixture and detectChanges', 'Querying with By.css', 'fixture.componentRef.setInput', 'CDK component harnesses', 'Testing outputs'],
          quiz: [
            ['How do you set a signal input in a test?', 'fixture.componentRef.setInput("name", value) then detectChanges().'],
            ['Why use harnesses for Material components?', 'They hide DOM structure so tests survive library updates.'],
          ],
          prereqs: ['TestBed and unit tests with Jasmine'],
        },
        {
          title: 'Testing HTTP and async code',
          description: 'provideHttpClientTesting with HttpTestingController lets tests expect requests and flush responses, while fakeAsync and tick control timers and observable timing without real waiting.',
          concepts: ['HttpTestingController expectOne', 'Flushing responses and errors', 'fakeAsync and tick', 'Verifying no outstanding requests'],
          quiz: [
            ['How do you answer a pending GET in a test?', 'httpTesting.expectOne(url).flush(body).'],
            ['What does httpTesting.verify() check?', 'That no unexpected requests were made.'],
          ],
          prereqs: ['Component tests with fixtures and harnesses', 'HttpClient requests'],
        },
        {
          title: 'Jest, Cypress and Playwright',
          description: 'Jest with jest-preset-angular for teams standardised on it, Cypress component and end-to-end tests with retrying commands, and Playwright for cross-browser flows; each fits a different position in the pyramid.',
          concepts: ['jest-preset-angular setup', 'Cypress end-to-end flows', 'Cypress component testing', 'Playwright for cross-browser runs'],
          quiz: [
            ['What does Cypress retry automatically?', 'Queries and assertions until they pass or time out.'],
            ['Why keep end-to-end suites small?', 'They are slow and brittle compared with unit and component tests.'],
          ],
          prereqs: ['Component tests with fixtures and harnesses'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Complete applications that exercise the whole stack, then the questions interviewers ask.',
      topics: [
        {
          title: 'Project: task board with signals',
          description: 'Build a kanban-style board with standalone components, signal-based state in a service, drag and drop via the CDK, persistence to localStorage and OnPush throughout; it must survive a reload and keep column order.',
          concepts: ['Model columns and cards as signals', 'Build board and card components', 'Add CDK drag and drop', 'Persist and restore state'],
          quiz: [
            ['Where does the board state live?', 'In a root service exposing signals and update methods.'],
            ['Why OnPush for card components?', 'Cards re-render only when their input reference changes.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: product catalogue with routing and HttpClient',
          description: 'A catalogue backed by a public JSON API: lazy-loaded feature routes, list and detail pages with component input binding, search with debounced RxJS, an auth interceptor, functional guards and a typed reactive checkout form.',
          concepts: ['Lazy feature routes and layout', 'Search with debounceTime and switchMap', 'Interceptor and guard', 'Typed checkout form with validation'],
          quiz: [
            ['How is the detail route id delivered to the component?', 'As a signal input via withComponentInputBinding.'],
            ['Which operator implements search-as-you-type?', 'debounceTime with distinctUntilChanged and switchMap.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: dashboard with NgRx SignalStore and SSR',
          description: 'An admin dashboard with a SignalStore per feature, entity collections, charts loaded in @defer blocks, server-side rendering with hydration, and a Playwright suite covering login and a data edit flow.',
          concepts: ['SignalStore with entities', 'Deferred chart widgets', 'SSR with hydration checks', 'Playwright login and edit tests'],
          quiz: [
            ['Why put charts in @defer?', 'The chart library loads only when the widget is visible.'],
            ['What breaks under SSR without guards?', 'Code touching window or document during server rendering.'],
          ],
          style: 'project',
        },
        {
          title: 'Angular interview questions',
          description: 'The questions that keep coming up: signals versus RxJS, OnPush and zoneless, DI scopes, standalone versus modules, lazy loading, template-driven versus reactive forms, and how change detection actually runs.',
          concepts: ['Reactivity and change detection questions', 'DI and architecture questions', 'Forms and routing questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['When would you still use RxJS in a signals app?', 'For event streams that need debouncing, cancellation or combination.'],
            ['What does providedIn: "root" give you?', 'A tree-shakable app-wide singleton.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live coding in Angular interviews',
          description: 'Practising the tasks interviewers set: build a searchable list from an API, write a custom validator, implement a guard, convert a component to OnPush, and explain each decision while typing.',
          concepts: ['Scaffolding fast with the CLI', 'API list with search', 'Validator and guard katas', 'Talking through decisions'],
          quiz: [
            ['What do you set up first in a live task?', 'A standalone component with a typed signal state and the HTTP call in a service.'],
            ['How do you show loading and error states quickly?', 'Signals for status plus @if blocks in the template.'],
          ],
        },
      ],
    },
  ],
})
