import { defineTrack } from '../define'

export const laravel = defineTrack({
  id: 'track-laravel',
  title: 'Laravel',
  description: 'Laravel from a fresh install to a deployed, tested application: routing, controllers, middleware, Blade, Eloquent and relationships, migrations, validation, Breeze and Sanctum auth, policies, queues, events, caching, API resources, PHPUnit and Pest, Artisan and deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🟥',
  tags: ['laravel', 'php', 'eloquent', 'blade', 'sanctum', 'queues', 'pest', 'backend'],
  languages: ['PHP'],
  explainMode: 'concept',
  code: { label: 'PHP with Laravel', id: 'php', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-php'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started',
      description: 'A running application and a mental model of how a request travels through it.',
      topics: [
        {
          title: 'Installing Laravel and the project skeleton',
          description: 'Creating an app with the laravel installer or composer create-project, what each top-level folder holds (app, routes, config, database, resources), and running it with php artisan serve or Sail.',
          concepts: ['Composer and the Laravel installer', 'Directory layout and where code lives', 'php artisan serve and Sail', 'Herd and local PHP versions'],
          quiz: [
            ['Which folder holds route definitions?', 'routes/, with web.php for browser routes and api.php for API routes.'],
            ['What does composer create-project laravel/laravel app do?', 'Downloads the skeleton, installs dependencies and generates the app key.'],
          ],
        },
        {
          title: 'Configuration and environment files',
          description: 'How .env values flow through config/*.php files into config() calls, why config is cached in production, and keeping secrets out of version control.',
          concepts: ['.env and env() at config time only', 'config() helper and dot notation', 'APP_KEY and encryption', 'config:cache and why env() then fails'],
          quiz: [
            ['Why should env() only be called inside config files?', 'After config:cache the .env file is not read, so env() returns null elsewhere.'],
            ['How do you read the database host in code?', 'config("database.connections.mysql.host").'],
          ],
          prereqs: ['Installing Laravel and the project skeleton'],
        },
        {
          title: 'The request lifecycle and service container',
          description: 'From public/index.php through the HTTP kernel, middleware, router and controller back to a Response, and how the container resolves classes by reflection so constructors can ask for dependencies.',
          concepts: ['public/index.php to kernel to router', 'Automatic constructor injection', 'Binding and resolving from the container', 'Singletons versus fresh instances'],
          quiz: [
            ['How does Laravel know what to pass to a controller constructor?', 'It reflects the type-hinted parameters and resolves each from the container.'],
            ['Difference between bind and singleton?', 'bind creates a new instance per resolve; singleton returns the same one.'],
          ],
          prereqs: ['Installing Laravel and the project skeleton'],
        },
        {
          title: 'Service providers and facades',
          description: 'Where bindings, event listeners and boot logic are registered, the register versus boot phases, and how facades proxy static calls to container-resolved services while staying testable.',
          concepts: ['register() versus boot()', 'AppServiceProvider as the default home', 'Deferred providers', 'How a facade resolves its accessor', 'Real-time facades'],
          quiz: [
            ['Why must you not resolve services inside register()?', 'Other providers may not have registered their bindings yet.'],
            ['Is Cache::get() a static method?', 'No, the facade forwards it to the cache manager resolved from the container.'],
          ],
          prereqs: ['The request lifecycle and service container'],
        },
      ],
    },
    {
      title: 'Routing, Controllers and Middleware',
      topics: [
        {
          title: 'Basic routing and route parameters',
          description: 'Registering routes per HTTP verb in routes/web.php, required and optional parameters, regex constraints with where, and how route caching changes what you may write in closures.',
          concepts: ['Route::get, post, match and any', 'Required and optional parameters', 'Constraints with where and whereNumber', 'Fallback routes'],
          quiz: [
            ['How do you make a parameter optional?', 'Add ? after its name and give the closure argument a default.'],
            ['Why does route:cache fail with closure routes?', 'Closures cannot be serialised; use controller actions instead.'],
          ],
        },
        {
          title: 'Named routes, groups and prefixes',
          description: 'Giving routes names so URLs are generated rather than hard-coded, and grouping routes to share middleware, prefixes, name prefixes and controllers.',
          concepts: ['name() and the route() helper', 'Group middleware and prefix', 'Name prefixes with as', 'Controller groups and subdomain routing'],
          quiz: [
            ['What does route("posts.show", $post) produce?', 'The URL for that named route with the post key substituted.'],
            ['Why prefer named routes over literal paths?', 'Changing a path in one place updates every link and redirect.'],
          ],
          prereqs: ['Basic routing and route parameters'],
        },
        {
          title: 'Controllers and resource controllers',
          description: 'Moving handlers out of route files into controller classes, the seven conventional resource actions, generating them with make:controller --resource, and single-action invokable controllers.',
          concepts: ['make:controller and action methods', 'Route::resource and the seven actions', 'only, except and apiResource', 'Invokable single-action controllers'],
          quiz: [
            ['Which actions does Route::apiResource omit?', 'create and edit, because APIs have no HTML forms.'],
            ['Name the seven resource actions.', 'index, create, store, show, edit, update, destroy.'],
          ],
          prereqs: ['Named routes, groups and prefixes'],
        },
        {
          title: 'Route model binding',
          description: 'Type-hinting an Eloquent model in a controller action so Laravel fetches it by id (or another column) and returns 404 automatically, plus scoped bindings for nested resources.',
          concepts: ['Implicit binding by type hint', 'Custom key with getRouteKeyName or {post:slug}', 'Scoped nested bindings', 'Explicit binding and missing() handlers'],
          quiz: [
            ['What happens when a bound model is not found?', 'A 404 response is returned before the action runs.'],
            ['How do you bind by slug instead of id?', 'Use {post:slug} in the route or override getRouteKeyName().'],
          ],
          prereqs: ['Controllers and resource controllers'],
        },
        {
          title: 'Middleware',
          description: 'Classes that run before or after a request to authenticate, throttle, transform or log; the global, group and route-specific layers; and passing parameters such as role names.',
          concepts: ['Writing a handle() with $next', 'Before versus after middleware', 'Registering in bootstrap/app.php', 'Middleware parameters', 'Terminable middleware'],
          quiz: [
            ['How does middleware pass control onward?', 'By returning $next($request).'],
            ['Where are middleware aliases registered in Laravel 11+?', 'In bootstrap/app.php via ->withMiddleware().'],
          ],
          prereqs: ['Basic routing and route parameters'],
        },
        {
          title: 'Requests, responses and redirects',
          description: 'Reading input, files, headers and cookies from the Request object, returning views, JSON, downloads and streamed responses, and redirecting with flashed data.',
          concepts: ['Request input, query and file access', 'Returning views and JSON', 'Downloads and streamed responses', 'Redirects with flash data', 'Response macros'],
          quiz: [
            ['What does $request->only(["name", "email"]) return?', 'An array containing just those two input keys.'],
            ['How do you redirect back with a message?', 'return back()->with("status", "Saved");'],
          ],
          prereqs: ['Controllers and resource controllers'],
        },
      ],
    },
    {
      title: 'Blade and the View Layer',
      topics: [
        {
          title: 'Blade templates and layouts',
          description: 'Blade compiles templates to plain PHP with directives like @if, @foreach and @include, escapes output with {{ }} by default, and shares page skeletons through layouts and sections.',
          concepts: ['Echoing and escaping with {{ }} and {!! !!}', 'Control directives and the $loop variable', '@extends, @section and @yield', '@include and view composers'],
          quiz: [
            ['What is the difference between {{ }} and {!! !!}?', '{{ }} HTML-escapes the value; {!! !!} outputs it raw.'],
            ['Which variable tells you the current index inside @foreach?', '$loop->index (or $loop->iteration for one-based).'],
          ],
        },
        {
          title: 'Blade components and slots',
          description: 'Reusable UI as class-based or anonymous components with attributes, default and named slots, and attribute bag merging so a button component can accept extra classes.',
          concepts: ['Anonymous versus class components', 'Props and the attribute bag', 'Default and named slots', 'Merging classes with $attributes->merge'],
          quiz: [
            ['How does <x-alert type="error"/> find its template?', 'resources/views/components/alert.blade.php, or a class in app/View/Components.'],
            ['What does {{ $slot }} render?', 'The content placed between the component\'s opening and closing tags.'],
          ],
          prereqs: ['Blade templates and layouts'],
        },
        {
          title: 'Forms, CSRF and old input',
          description: 'Why every state-changing form needs @csrf, spoofing PUT and DELETE with @method, repopulating fields with old() after a failed validation, and showing @error messages inline.',
          concepts: ['@csrf and the VerifyCsrfToken check', '@method for PUT, PATCH and DELETE', 'old() and error bag display', 'File upload forms with enctype'],
          quiz: [
            ['What error does a form without @csrf produce?', '419 Page Expired.'],
            ['How do you send a DELETE from an HTML form?', 'POST the form and add @method("DELETE").'],
          ],
          prereqs: ['Blade templates and layouts'],
        },
        {
          title: 'Asset bundling with Vite',
          description: 'How the @vite directive serves assets from the dev server in development and from a hashed manifest after npm run build, plus using Tailwind and Alpine in the default stack.',
          concepts: ['vite.config.js and the laravel plugin', 'The @vite directive', 'npm run dev versus build manifest', 'Tailwind and Alpine in the stack'],
          quiz: [
            ['What does npm run build write?', 'Hashed assets and a manifest in public/build.'],
            ['Why is the manifest needed in production?', 'It maps source file names to their hashed built file names.'],
          ],
        },
      ],
    },
    {
      title: 'Eloquent ORM',
      description: 'Active Record models, relationships and the query patterns that keep them fast.',
      topics: [
        {
          title: 'Models, tables and conventions',
          description: 'Each model maps to a snake_case plural table with an id, created_at and updated_at; how to override the table, key and timestamps; and how $fillable and $guarded protect against mass assignment.',
          concepts: ['make:model and naming conventions', 'Overriding $table, $primaryKey and timestamps', '$fillable versus $guarded', 'create, save, update and delete'],
          quiz: [
            ['What table does a model named BlogPost use by default?', 'blog_posts.'],
            ['What does the MassAssignmentException protect against?', 'Users setting columns they should not by adding fields to a request.'],
          ],
        },
        {
          title: 'Querying with the query builder',
          description: 'Building SQL fluently with where, orderBy, limit and aggregates, retrieving with get, first, find and pluck, chunking large result sets, and inspecting generated SQL with toSql or the query log.',
          concepts: ['where clauses and closures for grouping', 'get, first, find, findOrFail and pluck', 'Aggregates and selectRaw', 'chunk, lazy and cursor', 'Debugging with toSql and dd'],
          quiz: [
            ['Difference between find and findOrFail?', 'find returns null when missing; findOrFail throws ModelNotFoundException (404).'],
            ['When would you use lazy() instead of get()?', 'For huge tables, to iterate without loading every row into memory.'],
          ],
          prereqs: ['Models, tables and conventions'],
        },
        {
          title: 'One-to-one and one-to-many relationships',
          description: 'Defining hasOne, hasMany and belongsTo, the foreign-key naming Laravel assumes, and the difference between accessing a relationship as a property versus calling it as a query.',
          concepts: ['hasOne and belongsTo', 'hasMany and the inverse', 'Foreign key and local key overrides', 'Relationship property versus method', 'Creating related models with create and associate'],
          quiz: [
            ['What foreign key does hasMany on User assume on posts?', 'user_id.'],
            ['What does $user->posts() return compared with $user->posts?', 'posts() returns a query builder; posts returns the loaded Collection.'],
          ],
          prereqs: ['Querying with the query builder'],
        },
        {
          title: 'Many-to-many and pivot tables',
          description: 'belongsToMany over a pivot table, the alphabetical pivot naming convention, attach, detach and sync, and reading extra pivot columns with withPivot and withTimestamps.',
          concepts: ['belongsToMany and pivot naming', 'attach, detach and sync', 'withPivot and withTimestamps', 'Custom pivot models', 'hasManyThrough'],
          quiz: [
            ['What pivot table name does Laravel expect for Post and Tag?', 'post_tag, singular names in alphabetical order.'],
            ['What does sync([1, 2]) do?', 'Makes the pivot rows exactly ids 1 and 2, attaching and detaching as needed.'],
          ],
          prereqs: ['One-to-one and one-to-many relationships'],
        },
        {
          title: 'Polymorphic relationships',
          description: 'One comments or images table serving many parent models through morphTo, morphMany and morphToMany, the *_type and *_id columns, and morph maps that stop class names leaking into the database.',
          concepts: ['morphTo and morphMany', 'morphToMany for shared tags', 'The morph map', 'Querying polymorphic parents'],
          quiz: [
            ['Which two columns does a morphMany child table need?', 'commentable_type and commentable_id (or the chosen name).'],
            ['Why enforce a morph map?', 'So the type column stores short keys rather than fully qualified class names.'],
          ],
          prereqs: ['Many-to-many and pivot tables'],
        },
        {
          title: 'Eager loading and the N+1 problem',
          description: 'Why looping over posts and reading $post->author fires one query per post, how with(), load() and withCount() collapse that into two queries, and detecting lazy loads with preventLazyLoading.',
          concepts: ['Spotting N+1 in the query log', 'with() and nested eager loads', 'Constrained eager loads', 'withCount, withSum and exists', 'Model::preventLazyLoading'],
          quiz: [
            ['How many queries does Post::with("author")->get() run?', 'Two: one for posts and one for all their authors.'],
            ['What does preventLazyLoading do in development?', 'Throws an exception whenever a relationship is lazily loaded.'],
          ],
          prereqs: ['One-to-one and one-to-many relationships'],
        },
        {
          title: 'Accessors, mutators and casts',
          description: 'Transforming attributes on the way in and out with Attribute objects, and declaring casts so JSON columns become arrays, dates become Carbon instances and enums stay typed.',
          concepts: ['Attribute::make with get and set', 'The $casts array', 'Date, JSON and enum casts', 'Custom cast classes', 'Appending computed attributes'],
          quiz: [
            ['How do you cast a JSON column to an array?', 'Add "settings" => "array" to $casts (or casts()).'],
            ['What type does a datetime cast return?', 'An Illuminate\\Support\\Carbon instance.'],
          ],
          prereqs: ['Models, tables and conventions'],
        },
        {
          title: 'Scopes, soft deletes and model events',
          description: 'Reusable query fragments as local and global scopes, soft deleting rows with a deleted_at column while queries hide them, and hooking creating, saved and deleting events through observers.',
          concepts: ['Local scopes and the scope prefix', 'Global scopes and withoutGlobalScope', 'SoftDeletes, withTrashed and restore', 'Model events and observers', 'Collections returned by Eloquent'],
          quiz: [
            ['What does a scopePublished method get called as?', 'Post::published().'],
            ['How do you include soft-deleted rows in a query?', 'Chain withTrashed(); onlyTrashed() returns just the deleted ones.'],
          ],
          prereqs: ['Querying with the query builder'],
        },
      ],
    },
    {
      title: 'Database: Migrations and Seeders',
      topics: [
        {
          title: 'Writing migrations',
          description: 'Version-controlled schema changes with up and down methods, the Schema builder column types, and running, rolling back, resetting and squashing migrations with Artisan.',
          concepts: ['make:migration and naming', 'Schema::create and column types', 'migrate, rollback, fresh and refresh', 'Squashing with schema:dump'],
          quiz: [
            ['What does migrate:fresh do?', 'Drops every table and re-runs all migrations.'],
            ['Why write a down() method?', 'So a bad deploy can be rolled back with migrate:rollback.'],
          ],
        },
        {
          title: 'Schema changes and foreign keys',
          description: 'Altering existing tables with Schema::table, foreignId()->constrained() for referential integrity, cascading deletes, indexes and unique constraints, and the column-change caveats across drivers.',
          concepts: ['Schema::table and column modifiers', 'foreignId and constrained', 'cascadeOnDelete and nullOnDelete', 'Indexes and unique constraints', 'Renaming and dropping columns safely'],
          quiz: [
            ['What does $table->foreignId("user_id")->constrained() create?', 'An unsigned big integer column with a foreign key to users.id.'],
            ['Why add cascadeOnDelete?', 'So child rows are removed automatically when the parent is deleted.'],
          ],
          prereqs: ['Writing migrations'],
        },
        {
          title: 'Seeders and model factories',
          description: 'Factories describe how to build realistic fake models with Faker, states and relationship helpers, and seeders orchestrate them so a new developer or test suite gets a populated database in one command.',
          concepts: ['Factory definition() and Faker', 'States and sequences', 'has, for and relationship factories', 'DatabaseSeeder and db:seed'],
          quiz: [
            ['What does User::factory()->count(3)->has(Post::factory()->count(2))->create() build?', 'Three users each with two posts.'],
            ['How do you run only one seeder?', 'php artisan db:seed --class=PostSeeder.'],
          ],
          prereqs: ['Writing migrations'],
        },
        {
          title: 'Transactions and raw queries',
          description: 'Grouping writes with DB::transaction so partial failures roll back, deadlock retries, pessimistic locking, and dropping to parameterised raw SQL when the builder gets in the way.',
          concepts: ['DB::transaction and nesting', 'Retry attempts for deadlocks', 'lockForUpdate and sharedLock', 'DB::select with bindings', 'Multiple connections'],
          quiz: [
            ['What happens if the closure passed to DB::transaction throws?', 'The transaction is rolled back and the exception rethrown.'],
            ['Why use bindings in DB::select instead of string interpolation?', 'To prevent SQL injection.'],
          ],
          prereqs: ['Writing migrations'],
        },
      ],
    },
    {
      title: 'Validation',
      topics: [
        {
          title: 'Validating requests',
          description: 'Calling $request->validate() with rule strings or arrays, what happens on failure for HTML (redirect with errors) versus JSON (422 response), and the most-used built-in rules.',
          concepts: ['validate() and the rules array', 'Redirect versus 422 on failure', 'Common rules: required, email, unique, exists', 'Nested and array field rules', 'The Rule class for conditional rules'],
          quiz: [
            ['What status does failed validation return for a JSON request?', '422 Unprocessable Content with an errors object.'],
            ['How do you ignore the current row for a unique rule on update?', 'Rule::unique("users")->ignore($user->id).'],
          ],
        },
        {
          title: 'Form request classes',
          description: 'Moving rules and authorization into a FormRequest so controllers stay thin, using authorize() to gate the request, and preparing or transforming input before validation runs.',
          concepts: ['make:request and injection', 'rules() and authorize()', 'prepareForValidation', 'validated() and safe()'],
          quiz: [
            ['When does a FormRequest validate?', 'Before the controller action runs, as it is resolved from the container.'],
            ['What does $request->validated() return?', 'Only the input keys that had rules and passed.'],
          ],
          prereqs: ['Validating requests'],
        },
        {
          title: 'Custom rules and error messages',
          description: 'Writing rule objects with a validate method, closure rules for one-off checks, overriding messages and attribute names, and translating messages in lang files.',
          concepts: ['Rule objects and make:rule', 'Closure rules', 'Custom messages and attributes', 'Translation of validation messages'],
          quiz: [
            ['What method must a custom rule object implement?', 'validate(string $attribute, mixed $value, Closure $fail).'],
            ['How do you change the message for a specific field and rule?', 'Return ["email.required" => "..."] from messages().'],
          ],
          prereqs: ['Form request classes'],
        },
      ],
    },
    {
      title: 'Authentication and Authorization',
      topics: [
        {
          title: 'Laravel Breeze and session authentication',
          description: 'Installing Breeze for registration, login, logout and profile screens, how the session guard stores the user id in an encrypted cookie, and the auth middleware and Auth facade.',
          concepts: ['Installing Breeze and its stacks', 'Guards and the session driver', 'The auth middleware and redirects', 'Auth::user, attempt and logout', 'Remember me tokens'],
          quiz: [
            ['What does Auth::attempt($credentials) do?', 'Checks the credentials against the users provider and logs the user in if they match.'],
            ['Where is the logged-in user stored between requests?', 'The user id is kept in the session, referenced by the session cookie.'],
          ],
        },
        {
          title: 'Sanctum for API tokens and SPAs',
          description: 'Issuing personal access tokens with abilities for mobile clients, and cookie-based SPA authentication for first-party frontends, including the CSRF cookie handshake and stateful domains.',
          concepts: ['createToken and abilities', 'auth:sanctum middleware', 'SPA cookie flow and /sanctum/csrf-cookie', 'Stateful domains and CORS', 'Revoking tokens'],
          quiz: [
            ['How does an API client send a Sanctum token?', 'Authorization: Bearer <token> header.'],
            ['Why does the SPA flow not need tokens?', 'It reuses the session cookie because the SPA is a first-party stateful domain.'],
          ],
          prereqs: ['Laravel Breeze and session authentication'],
        },
        {
          title: 'Gates',
          description: 'Closure-based authorization checks registered in a service provider for actions that are not tied to a model, checked with Gate::allows, can() and the @can directive.',
          concepts: ['Gate::define with closures', 'allows, denies and authorize', '@can in Blade', 'Gate::before super-admin override'],
          quiz: [
            ['When would you choose a gate over a policy?', 'For actions not tied to a specific model, such as viewing an admin dashboard.'],
            ['What does Gate::before return to short-circuit every check?', 'true to allow everything (or null to fall through).'],
          ],
          prereqs: ['Laravel Breeze and session authentication'],
        },
        {
          title: 'Policies',
          description: 'A class per model with view, create, update and delete methods, auto-discovered by naming, and applied via $this->authorize() or authorizeResource so every controller action is checked.',
          concepts: ['make:policy --model', 'Policy auto-discovery', 'authorize() in controllers', 'authorizeResource for whole controllers', 'Policy responses with messages'],
          quiz: [
            ['What arguments does a policy update method receive?', 'The authenticated user and the model instance.'],
            ['What happens when authorize() fails?', 'An AuthorizationException becomes a 403 response.'],
          ],
          prereqs: ['Gates'],
        },
        {
          title: 'Password reset and email verification',
          description: 'The signed reset link flow with the password_reset_tokens table, MustVerifyEmail and the verified middleware, and throttling to stop abuse.',
          concepts: ['Password broker and reset tokens', 'MustVerifyEmail and the verified middleware', 'Signed URLs', 'Throttling auth routes'],
          quiz: [
            ['What makes a verification link tamper-proof?', 'It is a signed URL with an HMAC that expires.'],
            ['Which middleware blocks unverified users?', 'verified.'],
          ],
          prereqs: ['Laravel Breeze and session authentication'],
        },
      ],
    },
    {
      title: 'Queues, Events and Caching',
      topics: [
        {
          title: 'Queues and jobs',
          description: 'Pushing slow work such as email or PDF generation onto a queue backed by Redis or the database, running workers with queue:work, and serialising Eloquent models safely in job payloads.',
          concepts: ['make:job and ShouldQueue', 'Queue connections and drivers', 'queue:work and supervisor', 'SerializesModels and payloads', 'Delays, chains and batches'],
          quiz: [
            ['What does SerializesModels store in the payload?', 'The model class and key, re-fetched when the job runs.'],
            ['Why restart workers after a deploy?', 'Workers keep old code in memory until restarted (queue:restart).'],
          ],
        },
        {
          title: 'Job failures, retries and Horizon',
          description: 'Configuring tries, backoff and timeouts, what failed_jobs records and how queue:retry replays them, uniqueness and rate limiting middleware, and monitoring Redis queues with Horizon.',
          concepts: ['$tries, $backoff and $timeout', 'failed() hook and failed_jobs table', 'ShouldBeUnique and job middleware', 'Horizon dashboard and balancing'],
          quiz: [
            ['What happens after a job exceeds its tries?', 'It is recorded in failed_jobs and its failed() method runs.'],
            ['Which queue driver does Horizon require?', 'Redis.'],
          ],
          prereqs: ['Queues and jobs'],
        },
        {
          title: 'Events and listeners',
          description: 'Decoupling side effects by dispatching an event such as OrderShipped and letting listeners handle email, stock and analytics, with queued listeners and auto-discovery.',
          concepts: ['make:event and make:listener', 'Event::dispatch and listener discovery', 'Queued listeners', 'Event subscribers', 'Model events versus custom events'],
          quiz: [
            ['How do you make a listener run in the background?', 'Implement ShouldQueue on the listener.'],
            ['What is an event subscriber?', 'One class that registers handlers for several events.'],
          ],
        },
        {
          title: 'Notifications and mail',
          description: 'Mailables built with Blade or Markdown templates, and Notifications that fan out to mail, database, Slack or SMS channels, with Mailpit locally and queued sending in production.',
          concepts: ['Mailable classes and Markdown mail', 'Mail::to and queued mail', 'Notification channels', 'Database notifications', 'Previewing with Mailpit'],
          quiz: [
            ['Which method on a notification lists its channels?', 'via($notifiable).'],
            ['How do you send a mailable without blocking the request?', 'Mail::to($user)->queue($mailable).'],
          ],
          prereqs: ['Queues and jobs'],
        },
        {
          title: 'Caching',
          description: 'Storing expensive results in Redis or the file cache with Cache::remember, tagging and invalidation strategies, atomic locks, and the difference between caching data and caching config or routes.',
          concepts: ['Cache::remember and rememberForever', 'Stores and drivers', 'Cache tags and flushing', 'Atomic locks', 'Invalidation on model events'],
          quiz: [
            ['What does Cache::remember("key", 600, fn () => ...) do?', 'Returns the cached value, or runs the closure and stores the result for 600 seconds.'],
            ['Which store supports cache tags?', 'Redis (and Memcached), not the file or database store.'],
          ],
        },
        {
          title: 'Task scheduling',
          description: 'Defining cron-like schedules in routes/console.php, one server cron entry that runs schedule:run every minute, overlap prevention, and running jobs on one server only.',
          concepts: ['Schedule::command and Schedule::job', 'Frequency methods and timezones', 'withoutOverlapping and onOneServer', 'Output and failure hooks'],
          quiz: [
            ['What single cron line does Laravel need?', '* * * * * php /path/artisan schedule:run.'],
            ['Why use withoutOverlapping?', 'So a long-running task does not start again before the previous run finishes.'],
          ],
        },
      ],
    },
    {
      title: 'Building APIs',
      topics: [
        {
          title: 'API resources and collections',
          description: 'Transforming models into stable JSON shapes with JsonResource, conditional attributes and relationships with whenLoaded, resource collections, and paginated responses with links and meta.',
          concepts: ['make:resource and toArray', 'whenLoaded and conditional fields', 'Resource collections', 'Paginated resource responses', 'Wrapping and the data key'],
          quiz: [
            ['What does whenLoaded("author") prevent?', 'Accidentally lazy-loading the author relationship in the resource.'],
            ['What keys does a paginated resource response include?', 'data, links and meta.'],
          ],
        },
        {
          title: 'API routing, versioning and rate limiting',
          description: 'Registering api.php routes with the api middleware group, prefixing versions, defining rate limiters with RateLimiter::for keyed by user or IP, and the 429 responses they return.',
          concepts: ['routes/api.php and install:api', 'Version prefixes', 'RateLimiter::for and throttle middleware', 'Rate limit headers and 429'],
          quiz: [
            ['Which command adds api.php in Laravel 11+?', 'php artisan install:api.'],
            ['How do you limit an endpoint to 60 requests per minute per user?', 'Define a limiter with Limit::perMinute(60)->by($request->user()->id) and apply throttle:name.'],
          ],
          prereqs: ['API resources and collections'],
        },
        {
          title: 'Error handling and exception rendering',
          description: 'How the exception handler converts exceptions into HTML or JSON, customising rendering per exception class in bootstrap/app.php, reporting to logs or Sentry, and shaping consistent API error bodies.',
          concepts: ['withExceptions and render callbacks', 'HttpException and abort()', 'Reporting versus rendering', 'Consistent JSON error shape', 'dontReport and log levels'],
          quiz: [
            ['What does abort(403) do?', 'Throws an HttpException that renders as a 403 response.'],
            ['How does Laravel decide to render JSON instead of HTML?', 'The request expects JSON (Accept header or XHR).'],
          ],
          prereqs: ['API resources and collections'],
        },
        {
          title: 'File storage and uploads',
          description: 'The Storage facade over local, public and S3 disks, storing uploaded files with hashed names, validating size and mime type, generating temporary URLs, and streaming large downloads.',
          concepts: ['Disks and filesystems.php', 'Storing uploads with store and storeAs', 'Validating file uploads', 'Temporary signed URLs on S3', 'storage:link for public files'],
          quiz: [
            ['What does php artisan storage:link create?', 'A symlink from public/storage to storage/app/public.'],
            ['How do you validate an image upload?', 'Rules such as "image|max:2048|mimes:jpg,png".'],
          ],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'PHPUnit and Pest setup',
          description: 'The tests/Feature and tests/Unit split, phpunit.xml with an in-memory SQLite or separate test database, .env.testing, and Pest\'s function syntax and expectations on top of PHPUnit.',
          concepts: ['Feature versus Unit tests', 'phpunit.xml and .env.testing', 'Pest syntax and expect()', 'Running subsets with --filter', 'Parallel testing'],
          quiz: [
            ['What does the TestCase base class boot?', 'The full application, so facades and the container work in tests.'],
            ['How do you run only tests matching a name?', 'php artisan test --filter=PostTest.'],
          ],
        },
        {
          title: 'HTTP tests',
          description: 'Driving the app through the test client with get, post and json, asserting status, redirects, JSON structure and view data, and acting as a user with actingAs.',
          concepts: ['get, post, putJson and headers', 'assertStatus, assertRedirect, assertSee', 'assertJson and assertJsonPath', 'actingAs with guards', 'assertSessionHasErrors'],
          quiz: [
            ['How do you authenticate a test request?', '$this->actingAs($user)->get("/dashboard").'],
            ['Which assertion checks a nested JSON value?', 'assertJsonPath("data.0.title", "Hello").'],
          ],
          prereqs: ['PHPUnit and Pest setup'],
        },
        {
          title: 'Database testing with factories',
          description: 'RefreshDatabase to migrate once and wrap each test in a transaction, factories for arrange steps, and assertDatabaseHas, assertDatabaseCount and assertSoftDeleted for verification.',
          concepts: ['RefreshDatabase versus DatabaseTransactions', 'Factories in arrange steps', 'assertDatabaseHas and assertDatabaseMissing', 'assertModelExists and assertSoftDeleted'],
          quiz: [
            ['What does RefreshDatabase do after the first test?', 'Wraps each test in a transaction that is rolled back, so migrations run once.'],
            ['Why use factories rather than fixtures?', 'Each test declares just the data it needs, so tests stay independent and readable.'],
          ],
          prereqs: ['HTTP tests'],
        },
        {
          title: 'Mocking, fakes and queue assertions',
          description: 'Facade fakes for Queue, Mail, Event, Notification, Storage and Http that record calls instead of performing them, plus assertions like assertPushed and assertSent, and container mocking for services.',
          concepts: ['Queue::fake and assertPushed', 'Mail and Notification fakes', 'Event::fake and dispatched assertions', 'Http::fake with response maps', 'Storage::fake for uploads', 'Mocking bound services'],
          quiz: [
            ['What does Queue::fake() change?', 'Jobs are recorded rather than dispatched, so you can assert on them.'],
            ['How do you fake an external API call?', 'Http::fake(["api.example.com/*" => Http::response([...], 200)]).'],
          ],
          prereqs: ['HTTP tests'],
        },
      ],
    },
    {
      title: 'Artisan and Deployment',
      topics: [
        {
          title: 'Artisan commands and Tinker',
          description: 'The built-in commands you will run daily (make:*, migrate, route:list, cache and config commands), and Tinker as a REPL with the whole app booted for poking at models and services.',
          concepts: ['make:* generators', 'route:list, about and env', 'Cache, config, view and event clears', 'Tinker for live experiments'],
          quiz: [
            ['Which command shows every registered route with its middleware?', 'php artisan route:list.'],
            ['What does php artisan about show?', 'Environment, drivers, cache status and installed packages.'],
          ],
        },
        {
          title: 'Custom Artisan commands',
          description: 'Writing your own console commands with signatures for arguments and options, progress bars and prompts, and calling them from the scheduler or tests.',
          concepts: ['make:command and $signature', 'Arguments, options and defaults', 'Prompts, tables and progress bars', 'Calling commands from code and tests'],
          quiz: [
            ['How is an optional option declared in a signature?', 'report:send {--dry-run} or {--limit=10}.'],
            ['How do you run a command from a test?', '$this->artisan("report:send")->assertSuccessful().'],
          ],
          prereqs: ['Artisan commands and Tinker'],
        },
        {
          title: 'Optimising for production',
          description: 'The optimize command bundle (config, route, view and event caching), composer install --no-dev with an optimised autoloader, OPcache, and Octane for persistent workers when latency matters.',
          concepts: ['php artisan optimize and its parts', 'Composer optimised autoloader', 'OPcache settings', 'Octane with Swoole or FrankenPHP', 'Debug mode off and log channels'],
          quiz: [
            ['Why must APP_DEBUG be false in production?', 'Debug pages expose environment variables and stack traces.'],
            ['What does Octane change about the request lifecycle?', 'The app boots once and stays in memory across requests.'],
          ],
        },
        {
          title: 'Deploying with Forge, Docker or Sail',
          description: 'Zero-downtime deploys with symlinked releases, running migrations and queue:restart in a deploy script, Sail for local Docker, and a production Dockerfile with php-fpm behind nginx. Docker itself lives in track-docker.',
          concepts: ['Deploy script order', 'Forge and Envoyer releases', 'Sail for local development', 'php-fpm and nginx containers', 'Storage and permissions'],
          quiz: [
            ['Why run queue:restart during a deploy?', 'So workers pick up the new code instead of running stale classes.'],
            ['Which folders must be writable by the web server?', 'storage/ and bootstrap/cache/.'],
          ],
          prereqs: ['Optimising for production'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: blog with comments and admin panel',
          description: 'Build a blog with Breeze auth, posts with slugs and tags, threaded comments via polymorphic relationships, a policy-protected admin area, Markdown rendering and image uploads to a public disk.',
          concepts: ['Model posts, tags and comments', 'Breeze auth and policies', 'Blade components for the UI', 'Uploads and Markdown rendering', 'Feature tests for the admin'],
          quiz: [
            ['Which relationship type suits comments on posts and pages?', 'Polymorphic morphMany.'],
            ['How should admin routes be protected?', 'A middleware group plus policies on each action.'],
          ],
        },
        {
          title: 'Project: job board API with Sanctum',
          description: 'A JSON API for companies to post jobs and candidates to apply: Sanctum tokens with abilities, form requests, API resources with pagination, rate limiting, and a queued email on each application.',
          concepts: ['Design resources and endpoints', 'Token abilities per client', 'Resources, filters and pagination', 'Queued notifications', 'HTTP and queue tests'],
          quiz: [
            ['How do you stop a candidate token posting jobs?', 'Issue tokens with abilities and check tokenCan("jobs:create").'],
            ['Which class shapes the job JSON?', 'A JsonResource such as JobResource.'],
          ],
        },
        {
          title: 'Project: e-commerce store with checkout queue',
          description: 'A store with products, carts in the session, Stripe or Razorpay checkout via a webhook, orders processed by queued jobs with retries, stock decrements inside transactions, and Horizon monitoring.',
          concepts: ['Catalogue and cart models', 'Payment webhook handling', 'Order pipeline as chained jobs', 'Transactions and stock locking', 'Horizon and failure alerts'],
          quiz: [
            ['Why decrement stock inside a transaction with lockForUpdate?', 'To stop two concurrent orders overselling the same item.'],
            ['Why must the webhook handler be idempotent?', 'Payment providers retry deliveries, so the same event may arrive twice.'],
          ],
        },
        {
          title: 'Project: multi-tenant invoicing SaaS',
          description: 'Teams own customers and invoices; a global scope isolates tenants, invoices render to PDF in a queued job, a scheduler sends reminders, and Sanctum plus policies keep team data separate.',
          concepts: ['Tenant scoping with a global scope', 'Invoice and line item models', 'PDF generation in jobs', 'Scheduled reminder command', 'Tenant isolation tests'],
          quiz: [
            ['How does a global scope help tenancy?', 'Every query on scoped models automatically filters by the current team.'],
            ['Where does a daily reminder run from?', 'A scheduled Artisan command in routes/console.php.'],
          ],
        },
        {
          title: 'Laravel interview questions',
          description: 'The questions interviewers keep asking: container and facades, request lifecycle, middleware order, Eloquent N+1, mass assignment, queues versus events, and the reasons behind config caching.',
          concepts: ['Container and lifecycle questions', 'Eloquent and query questions', 'Queues, events and cache questions', 'Security questions: CSRF, mass assignment'],
          quiz: [
            ['Explain a facade in one sentence.', 'A static proxy that resolves a service from the container and forwards the call.'],
            ['How would you find and fix an N+1?', 'Watch the query log or preventLazyLoading, then eager load with with().'],
          ],
          style: 'reading',
        },
        {
          title: 'Laravel code review and design questions',
          description: 'Reviewing a controller that does too much, deciding between jobs, events and observers, designing policies for a role system, and sketching a queue-backed import with idempotency.',
          concepts: ['Thin controllers and actions', 'Choosing jobs, events or observers', 'Role and permission design', 'Idempotent import design'],
          quiz: [
            ['What belongs in a controller?', 'Validation delegation, authorization, calling a service or action, and returning a response.'],
            ['When is an observer the wrong choice?', 'When the side effect should be explicit and testable, or must not run on every save.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
