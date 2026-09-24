import { defineTrack } from '../define'

export const rails = defineTrack({
  id: 'track-rails',
  title: 'Ruby on Rails',
  description: 'Ruby on Rails the way it is written today: MVC and conventions, resourceful routing, Active Record models, migrations, associations and validations, ERB views with Hotwire and Turbo, forms, Devise or the built-in authentication, Pundit, Active Job, Action Mailer, API mode, Minitest and RSpec, security and Kamal deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🛤️',
  tags: ['rails', 'ruby', 'active-record', 'hotwire', 'turbo', 'devise', 'rspec', 'backend'],
  languages: ['Ruby'],
  explainMode: 'concept',
  code: { label: 'Ruby with Rails', id: 'ruby', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-ruby'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started',
      description: 'A generated app, the conventions it relies on, and the tools you use every day.',
      topics: [
        {
          title: 'Installing Rails and generating an app',
          description: 'Installing Ruby with a version manager, gem install rails, what rails new creates (Gemfile, config, app, db) and the flags that matter (--database, --api, --css, --skip-*), then booting with bin/rails server.',
          concepts: ['Ruby version managers and Bundler', 'rails new and its flags', 'Top-level folders and their roles', 'bin/rails server and bin/dev'],
          quiz: [
            ['What does bin/dev run compared with bin/rails server?', 'The Procfile.dev processes: the server plus CSS and JS watchers.'],
            ['Which flag creates a PostgreSQL-backed app?', 'rails new app --database=postgresql.'],
          ],
        },
        {
          title: 'Convention over configuration and MVC',
          description: 'Rails infers table names, file locations and route helpers from names so a Post model, posts table, PostsController and posts/ views need no wiring; understanding the inflections is what makes the magic predictable.',
          concepts: ['Naming conventions and inflections', 'Model, view, controller responsibilities', 'Autoloading with Zeitwerk', 'Where custom code goes: lib, concerns, services'],
          quiz: [
            ['What table does a Person model use?', 'people, via the inflector.'],
            ['Why must app/models/user_profile.rb define UserProfile?', 'Zeitwerk maps file paths to constant names and raises if they differ.'],
          ],
          prereqs: ['Installing Rails and generating an app'],
        },
        {
          title: 'The request cycle from Puma to the view',
          description: 'Puma accepts the request, the Rack middleware stack runs, the router matches a controller action, the action loads models and renders a view or redirects; knowing the stages tells you where to put logging, auth and caching.',
          concepts: ['Puma and the Rack interface', 'The middleware stack', 'Router to controller action dispatch', 'Rendering versus redirecting', 'Reading the development log'],
          quiz: [
            ['Which command lists the middleware stack?', 'bin/rails middleware.'],
            ['What does the log line "Completed 200 OK in 45ms (Views: 30ms | ActiveRecord: 8ms)" tell you?', 'Total time and how much went to rendering and database queries.'],
          ],
          prereqs: ['Convention over configuration and MVC'],
        },
        {
          title: 'Generators, bin/rails and the console',
          description: 'Scaffold, model, controller and migration generators, the bin/rails commands you reach for daily (db:migrate, routes, runner), and the console with sandbox mode for safe experiments against real data.',
          concepts: ['rails generate scaffold, model, controller', 'Destroying generated code', 'bin/rails routes, db and runner', 'Console, sandbox and reload!'],
          quiz: [
            ['What does bin/rails console --sandbox do?', 'Rolls back every database change when you exit.'],
            ['How do you undo a generator?', 'bin/rails destroy model Post.'],
          ],
          prereqs: ['Installing Rails and generating an app'],
        },
      ],
    },
    {
      title: 'Routing and Controllers',
      topics: [
        {
          title: 'Resourceful routing',
          description: 'resources :posts declares the seven RESTful routes and path helpers in one line; only, except, member and collection refine it, and bin/rails routes shows what was generated.',
          concepts: ['resources and the seven actions', 'Path and URL helpers', 'only, except, member and collection', 'resource for singular resources', 'root and redirect routes'],
          quiz: [
            ['Which helper does resources :posts create for the edit page?', 'edit_post_path(post).'],
            ['Difference between member and collection routes?', 'member routes act on one record (/posts/:id/publish); collection routes on the set (/posts/search).'],
          ],
        },
        {
          title: 'Nested resources, namespaces and constraints',
          description: 'Nesting comments under posts, admin namespaces that change both URL and controller module, shallow nesting to keep URLs short, and constraints for subdomains or formats.',
          concepts: ['Nested resources and shallow', 'namespace versus scope', 'Constraints and subdomains', 'Route globbing and defaults', 'Concerns in routes'],
          quiz: [
            ['What does namespace :admin do to the controller?', 'Expects Admin::PostsController in app/controllers/admin/.'],
            ['Why use shallow: true?', 'Only index, new and create stay nested; show, edit, update and destroy get short URLs.'],
          ],
          prereqs: ['Resourceful routing'],
        },
        {
          title: 'Controllers, params and strong parameters',
          description: 'Actions read params from the path, query and body, and must permit mass-assignable attributes explicitly with params.require(...).permit(...) or params.expect so a client cannot set admin: true.',
          concepts: ['Actions and instance variables', 'params from path, query and body', 'require, permit and expect', 'Nested attribute permitting', 'ActionController::Parameters behaviour'],
          quiz: [
            ['What raises ActiveModel::ForbiddenAttributesError?', 'Passing unpermitted params to create or update.'],
            ['How do you permit an array of tag ids?', 'params.require(:post).permit(:title, tag_ids: []).'],
          ],
          prereqs: ['Resourceful routing'],
        },
        {
          title: 'Filters, rendering and redirects',
          description: 'before_action for loading records and requiring login, render for views, JSON or status-only responses, redirect_to with status codes, and respond_to for multiple formats.',
          concepts: ['before_action and skip_before_action', 'render variants: view, json, status', 'redirect_to and status: :see_other', 'respond_to and formats', 'rescue_from for errors'],
          quiz: [
            ['Why does Turbo need redirect status 303 after a form POST?', 'So the follow-up request is a GET rather than replaying the POST.'],
            ['What does rescue_from ActiveRecord::RecordNotFound do?', 'Runs a handler (for example rendering 404) whenever that error escapes an action.'],
          ],
          prereqs: ['Controllers, params and strong parameters'],
        },
        {
          title: 'Sessions, cookies and flash',
          description: 'The encrypted cookie store keeps small session data client-side, signed and encrypted cookies protect values you set, and flash carries one-request messages across a redirect.',
          concepts: ['Cookie store versus database sessions', 'session hash and reset_session', 'Signed, encrypted and permanent cookies', 'flash and flash.now', 'Cookie size limits'],
          quiz: [
            ['When should you use flash.now instead of flash?', 'When rendering in the same request instead of redirecting.'],
            ['What is the cookie session size limit?', 'About 4 KB, so store ids rather than objects.'],
          ],
          prereqs: ['Filters, rendering and redirects'],
        },
      ],
    },
    {
      title: 'Active Record',
      description: 'Models, migrations, associations, validations and the query interface. SQL itself lives in track-sql.',
      topics: [
        {
          title: 'Models, tables and schema',
          description: 'A model class inherits ApplicationRecord and reads its columns from the schema at boot, so attributes need no declaration; annotate models, use the id and timestamp conventions, and inspect with Post.column_names.',
          concepts: ['ApplicationRecord and inheritance', 'Attributes read from the schema', 'Primary keys and timestamps', 'Enums and attribute API', 'Inspecting models in the console'],
          quiz: [
            ['Where do a model\'s attributes come from?', 'The database columns, read from the schema when the class loads.'],
            ['What does enum status: { draft: 0, published: 1 } add?', 'Predicates, scopes and bang methods like published? and published!.'],
          ],
        },
        {
          title: 'Migrations and schema.rb',
          description: 'Timestamped migration classes with reversible change methods, add_column, add_reference and add_index, running and rolling back with db:migrate, and why schema.rb (or structure.sql) is committed.',
          concepts: ['Generating and naming migrations', 'change, up and down', 'add_reference, foreign keys and indexes', 'db:migrate, rollback and db:prepare', 'schema.rb versus structure.sql'],
          quiz: [
            ['What does add_reference :comments, :post, foreign_key: true create?', 'A post_id column, an index and a foreign key constraint.'],
            ['Why commit schema.rb?', 'New environments load it with db:schema:load instead of replaying every migration.'],
          ],
          prereqs: ['Models, tables and schema'],
        },
        {
          title: 'CRUD and the query interface',
          description: 'Creating and saving with create, save and update, finding with find, find_by and where, chaining order, limit and pluck, and the difference between lazy relations and loaded arrays.',
          concepts: ['create, save, update and destroy', 'find, find_by and where', 'Chaining relations lazily', 'pluck, select and exists?', 'find_each for large tables'],
          quiz: [
            ['Difference between find and find_by?', 'find raises RecordNotFound; find_by returns nil.'],
            ['When does Post.where(published: true) hit the database?', 'When it is iterated, inspected or a terminal method like to_a or count is called.'],
          ],
          prereqs: ['Models, tables and schema'],
        },
        {
          title: 'Associations: belongs_to and has_many',
          description: 'Declaring the two sides of a one-to-many, the methods each generates, dependent options for cascading, inverse_of, and why belongs_to is required by default since Rails 5.',
          concepts: ['belongs_to and its presence requirement', 'has_many and generated methods', 'dependent: :destroy versus :delete_all', 'has_one and inverse_of', 'Building through the association'],
          quiz: [
            ['What does post.comments.build do?', 'Instantiates a comment with post_id set, unsaved.'],
            ['Why does belongs_to :user fail validation when user is nil?', 'belongs_to is required by default; add optional: true to allow it.'],
          ],
          prereqs: ['CRUD and the query interface'],
        },
        {
          title: 'has_many :through and polymorphic associations',
          description: 'Many-to-many with an explicit join model, has_and_belongs_to_many for the simplest case, and polymorphic belongs_to so comments can attach to posts or photos through *_type and *_id columns.',
          concepts: ['has_many :through with a join model', 'has_and_belongs_to_many tradeoffs', 'Polymorphic belongs_to', 'Self-referential associations', 'Source and class_name options'],
          quiz: [
            ['Why prefer has_many :through over habtm?', 'The join model can hold attributes, validations and callbacks.'],
            ['Which columns does a polymorphic association need?', 'commentable_type and commentable_id.'],
          ],
          prereqs: ['Associations: belongs_to and has_many'],
        },
        {
          title: 'Validations',
          description: 'Declarative validates rules run before save and populate errors, conditional validations with if and on, uniqueness validations and why they still need a database unique index, and custom validator classes.',
          concepts: ['validates and common validators', 'errors and full_messages', 'Conditional validations with on and if', 'Uniqueness and the race condition', 'Custom validators and validate methods'],
          quiz: [
            ['Why add a unique index alongside validates uniqueness?', 'Two concurrent requests can both pass the check; the index makes the database enforce it.'],
            ['What does save! do differently from save?', 'Raises ActiveRecord::RecordInvalid instead of returning false.'],
          ],
          prereqs: ['CRUD and the query interface'],
        },
        {
          title: 'Scopes and callbacks',
          description: 'Named scopes as chainable lambdas, default scopes and why they bite, and the callback lifecycle (before_validation, after_commit) with the discipline to keep callbacks for data integrity rather than side effects.',
          concepts: ['scope with lambdas and arguments', 'Default scopes and unscoped', 'Callback lifecycle order', 'after_commit for external effects', 'Callback pitfalls and alternatives'],
          quiz: [
            ['Why send email in after_commit rather than after_save?', 'after_save runs inside the transaction; a rollback would leave an email sent for a record that never existed.'],
            ['What does a scope return when its body returns nil?', 'An all relation, so chaining still works.'],
          ],
          prereqs: ['Validations'],
        },
        {
          title: 'Eager loading and query performance',
          description: 'Spotting N+1 queries in the log, choosing includes, preload or eager_load, counter caches for counts, strict_loading to catch lazy loads, and adding indexes that match your where and order clauses.',
          concepts: ['N+1 in the log', 'includes, preload and eager_load', 'counter_cache columns', 'strict_loading mode', 'Indexes that match queries', 'explain and the bullet gem'],
          quiz: [
            ['When does includes produce a JOIN?', 'When you also reference the association in where or order; otherwise it preloads separately.'],
            ['What does strict_loading do?', 'Raises when a lazily loaded association is accessed.'],
          ],
          prereqs: ['Associations: belongs_to and has_many'],
        },
      ],
    },
    {
      title: 'Views, Forms and Hotwire',
      topics: [
        {
          title: 'ERB views, layouts and partials',
          description: 'Templates that mix HTML and Ruby with <%= %>, the application layout with yield and content_for, and partials with locals and collections that render a list in one line.',
          concepts: ['ERB tags and escaping', 'Layouts, yield and content_for', 'Partials with locals', 'Collection rendering', 'Strict locals'],
          quiz: [
            ['What does render @posts do?', 'Renders the _post partial once per record with post as a local.'],
            ['Is output from <%= %> escaped?', 'Yes, unless marked html_safe or produced by helpers like sanitize.'],
          ],
        },
        {
          title: 'Helpers and the asset pipeline',
          description: 'View helpers (link_to, number_to_currency, time_ago_in_words) and custom helper modules, plus the modern asset setup: Propshaft for static assets and importmap or bundling for JavaScript and CSS.',
          concepts: ['Built-in view helpers', 'Custom helper modules', 'Propshaft and asset fingerprinting', 'importmap versus jsbundling', 'cssbundling and Tailwind'],
          quiz: [
            ['What does asset fingerprinting achieve?', 'Cache-busting: the file name changes when the content changes.'],
            ['When would you choose jsbundling over importmap?', 'When you need a build step for TypeScript, JSX or npm packages that are not ESM-ready.'],
          ],
          prereqs: ['ERB views, layouts and partials'],
        },
        {
          title: 'form_with and form builders',
          description: 'form_with model: infers the URL, method and field names, includes the CSRF token, repopulates values and displays errors; fields_for handles nested attributes, and custom builders standardise markup.',
          concepts: ['form_with model and url', 'Field helpers and labels', 'Displaying validation errors', 'fields_for and accepts_nested_attributes_for', 'Custom form builders'],
          quiz: [
            ['How does form_with know whether to POST or PATCH?', 'From whether the model is persisted.'],
            ['What does accepts_nested_attributes_for :items enable?', 'Saving child records from the parent form via items_attributes.'],
          ],
          prereqs: ['ERB views, layouts and partials'],
        },
        {
          title: 'Turbo Drive and Turbo Frames',
          description: 'Turbo Drive turns links and forms into fetch requests that swap the body without a full reload; Turbo Frames scope updates to a section of the page so inline edit and lazy-loaded panels need no JavaScript.',
          concepts: ['Turbo Drive navigation and caching', 'turbo_frame_tag and matching ids', 'Lazy-loaded frames with src', 'Breaking out with target _top', 'data-turbo attributes'],
          quiz: [
            ['What happens when a response lacks a frame matching the request?', 'Turbo shows an error and the frame stays empty; the response must contain the same frame id.'],
            ['How do you make a link navigate the whole page from inside a frame?', 'data: { turbo_frame: "_top" }.'],
          ],
          prereqs: ['form_with and form builders'],
        },
        {
          title: 'Turbo Streams and Action Cable',
          description: 'Turbo Stream responses append, replace or remove elements after a form submission, and broadcasts_to pushes the same streams over Action Cable so every viewer sees new comments live.',
          concepts: ['turbo_stream.replace and friends', 'Responding with format.turbo_stream', 'broadcasts_to on models', 'turbo_stream_from subscriptions', 'Action Cable adapters'],
          quiz: [
            ['What does a Turbo Stream response contain?', 'One or more <turbo-stream action="..." target="..."> elements with templates.'],
            ['Which Action Cable adapter is needed for multiple servers?', 'Redis (or Solid Cable), so broadcasts reach every process.'],
          ],
          prereqs: ['Turbo Drive and Turbo Frames'],
        },
        {
          title: 'Stimulus controllers',
          description: 'Small JavaScript controllers attached with data-controller, targets and values for state, actions for events, and the discipline of enhancing server-rendered HTML rather than owning it.',
          concepts: ['data-controller and lifecycle', 'Targets and values', 'Actions and event handling', 'Outlets between controllers', 'Progressive enhancement mindset'],
          quiz: [
            ['How is a click wired to a controller method?', 'data-action="click->dropdown#toggle".'],
            ['What does a value do?', 'Exposes a typed data attribute with a change callback.'],
          ],
          prereqs: ['Turbo Drive and Turbo Frames'],
        },
      ],
    },
    {
      title: 'Authentication and Authorization',
      topics: [
        {
          title: 'The built-in authentication generator',
          description: 'rails generate authentication (Rails 8) creates users, sessions, password resets and the Authentication concern on top of has_secure_password and bcrypt, giving a readable baseline you own.',
          concepts: ['has_secure_password and bcrypt', 'The generated Session model', 'Authentication concern and Current', 'Password reset with signed tokens', 'Rate limiting login attempts'],
          quiz: [
            ['What does has_secure_password add?', 'password and password_confirmation setters, an authenticate method and a password_digest column requirement.'],
            ['Where is the current user stored per request?', 'Current.session and Current.user via ActiveSupport::CurrentAttributes.'],
          ],
        },
        {
          title: 'Devise',
          description: 'The batteries-included gem: modules for registration, confirmation, recovery, lockout and trackable, generated views and routes, helpers like current_user and authenticate_user!, and customising controllers.',
          concepts: ['Installing and generating Devise', 'Modules and their columns', 'current_user and authenticate_user!', 'Customising views and controllers', 'Strong params for extra fields'],
          quiz: [
            ['Which Devise module emails a confirmation link?', 'confirmable.'],
            ['How do you permit a name field on sign-up?', 'devise_parameter_sanitizer.permit(:sign_up, keys: [:name]).'],
          ],
          prereqs: ['The built-in authentication generator'],
        },
        {
          title: 'Authorization with Pundit',
          description: 'A policy class per model with plain Ruby methods (update?, destroy?), authorize in controllers, policy_scope for index queries, and verify_authorized to catch actions you forgot.',
          concepts: ['Policy classes and methods', 'authorize and NotAuthorizedError', 'policy_scope and Scope classes', 'verify_authorized and verify_policy_scoped', 'Policies in views'],
          quiz: [
            ['What arguments does a Pundit policy receive?', 'The current user and the record.'],
            ['What does policy_scope(Post) return?', 'The relation filtered by PostPolicy::Scope#resolve.'],
          ],
          prereqs: ['The built-in authentication generator'],
        },
        {
          title: 'Session security and CSRF',
          description: 'protect_from_forgery and the authenticity token in every form, session fixation and reset_session on login, secure and same-site cookie flags, and where API clients differ. Generic web security lives in track-web-security.',
          concepts: ['Authenticity tokens and protect_from_forgery', 'reset_session on login', 'Cookie flags in production', 'CSRF handling for API endpoints', 'Session expiry'],
          quiz: [
            ['Why call reset_session at login?', 'To prevent session fixation by issuing a new session id.'],
            ['What error does a missing authenticity token raise?', 'ActionController::InvalidAuthenticityToken.'],
          ],
          prereqs: ['Devise'],
        },
      ],
    },
    {
      title: 'Background Jobs, Mail, Files and Caching',
      topics: [
        {
          title: 'Active Job',
          description: 'A common interface for background work: job classes with perform, perform_later with queues and delays, retry_on and discard_on, and GlobalID so models are passed by reference.',
          concepts: ['Job classes and perform_later', 'Queues, priorities and delays', 'retry_on and discard_on', 'GlobalID serialisation', 'Job callbacks and logging'],
          quiz: [
            ['What does retry_on Net::OpenTimeout, wait: :polynomially_longer do?', 'Retries that error with increasing delays before giving up.'],
            ['Why pass a record instead of its id to a job?', 'GlobalID serialises it and reloads it fresh when the job runs.'],
          ],
        },
        {
          title: 'Solid Queue and Sidekiq',
          description: 'Solid Queue runs jobs from the database with no Redis, while Sidekiq uses Redis threads for higher throughput; configuring workers, concurrency, recurring jobs and dashboards for each.',
          concepts: ['Solid Queue setup and workers', 'Sidekiq and Redis', 'Concurrency and queue weights', 'Recurring jobs', 'Mission Control and the Sidekiq web UI'],
          quiz: [
            ['Why choose Solid Queue over Sidekiq?', 'One less service to run; jobs live in the database with transactional enqueueing.'],
            ['What does Sidekiq need that Solid Queue does not?', 'A Redis server.'],
          ],
          prereqs: ['Active Job'],
        },
        {
          title: 'Action Mailer',
          description: 'Mailer classes with views for HTML and text, deliver_later through Active Job, previews in development, delivery methods (SMTP, Postmark, SES) and parameterised mailers.',
          concepts: ['Mailer classes and views', 'deliver_now versus deliver_later', 'Mailer previews', 'Delivery configuration per environment', 'Parameterised mailers and attachments'],
          quiz: [
            ['Where do you see a rendered email without sending it?', 'Mailer previews at /rails/mailers.'],
            ['Why prefer deliver_later?', 'The email is sent from a background job, keeping the request fast and retryable.'],
          ],
          prereqs: ['Active Job'],
        },
        {
          title: 'Active Storage',
          description: 'Attaching files with has_one_attached and has_many_attached, storing on disk or S3, direct uploads from the browser, image variants via image_processing, and validating content type and size.',
          concepts: ['has_one_attached and has_many_attached', 'Services: disk, S3, GCS', 'Direct uploads', 'Variants and previews', 'Validating attachments'],
          quiz: [
            ['What does user.avatar.variant(resize_to_limit: [200, 200]) do?', 'Generates and caches a resized version on first request.'],
            ['Why use direct uploads?', 'The browser sends the file straight to storage, so the app server is not tied up.'],
          ],
        },
        {
          title: 'Caching with Rails.cache and fragments',
          description: 'Fragment caching with cache helpers keyed by record cache_key_with_version, Russian doll nesting, low-level Rails.cache.fetch, and Solid Cache or Redis as the store.',
          concepts: ['Fragment caching and cache keys', 'Russian doll caching', 'Rails.cache.fetch', 'Solid Cache versus Redis', 'HTTP caching with fresh_when'],
          quiz: [
            ['How does a fragment cache invalidate when a post changes?', 'The key includes updated_at, so a new version produces a new key.'],
            ['What does fresh_when do?', 'Sets ETag and Last-Modified and returns 304 when the client copy is current.'],
          ],
        },
      ],
    },
    {
      title: 'API Mode',
      description: 'REST design itself lives in track-rest-api; this is how Rails serves JSON.',
      topics: [
        {
          title: 'Rails API-only applications',
          description: 'rails new --api trims the middleware and ActionController::API base class for JSON services, and how to add back CORS with rack-cors and JSON param parsing.',
          concepts: ['--api flag and ActionController::API', 'Trimmed middleware stack', 'rack-cors configuration', 'Error responses as JSON', 'Versioned namespaces'],
          quiz: [
            ['What does ActionController::API drop compared with Base?', 'View rendering, cookies, sessions and flash by default.'],
            ['Where do CORS origins get configured?', 'config/initializers/cors.rb with rack-cors.'],
          ],
        },
        {
          title: 'Serialising JSON with Jbuilder and serializers',
          description: 'Jbuilder templates that compose JSON views with partials, versus serializer objects (Alba, Blueprinter, ActiveModel::Serializers) that keep shape in Ruby, and avoiding to_json on whole models.',
          concepts: ['Jbuilder templates and partials', 'Serializer gems compared', 'as_json overrides and their limits', 'Pagination metadata in responses'],
          quiz: [
            ['Why avoid render json: @user?', 'It serialises every column, including sensitive ones, and couples clients to the schema.'],
            ['What does json.array! @posts, partial: "posts/post", as: :post do?', 'Renders each post through a Jbuilder partial.'],
          ],
          prereqs: ['Rails API-only applications'],
        },
        {
          title: 'Token authentication for APIs',
          description: 'authenticate_or_request_with_http_token, per-user API tokens with has_secure_token, JWT via a small gem, and why API endpoints skip CSRF but need rate limiting instead.',
          concepts: ['authenticate_with_http_token', 'has_secure_token', 'JWT issuance and verification', 'Skipping CSRF for token clients', 'Rate limiting with rate_limit or Rack::Attack'],
          quiz: [
            ['How does a client send a token to Rails?', 'Authorization: Bearer <token>, read with authenticate_with_http_token.'],
            ['What does has_secure_token generate?', 'A random 24-character token assigned before create.'],
          ],
          prereqs: ['Rails API-only applications'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'Minitest and fixtures',
          description: 'The default test stack: test classes with assertions, YAML fixtures loaded per test in transactions, parallel test workers, and bin/rails test with line-number targeting.',
          concepts: ['ActiveSupport::TestCase and assertions', 'YAML fixtures and references', 'Transactional tests and parallelism', 'Running single tests by line'],
          quiz: [
            ['How do you reference a fixture in a test?', 'users(:alice).'],
            ['How do fixtures reference each other?', 'By label: author: alice in posts.yml.'],
          ],
        },
        {
          title: 'RSpec and FactoryBot',
          description: 'rspec-rails specs with describe, let and expect, FactoryBot factories with traits and sequences replacing fixtures, Faker data, and shoulda-matchers for one-line validation and association specs.',
          concepts: ['rspec-rails setup and spec types', 'let, subject and before', 'FactoryBot factories and traits', 'shoulda-matchers', 'Database Cleaner needs'],
          quiz: [
            ['Difference between build and create in FactoryBot?', 'build instantiates without saving; create persists.'],
            ['What does it { is_expected.to validate_presence_of(:title) } test?', 'A presence validation using shoulda-matchers.'],
          ],
          prereqs: ['Minitest and fixtures'],
        },
        {
          title: 'Request and system tests',
          description: 'Request specs drive full HTTP through the router and controllers, while system tests run a real browser with Capybara and Selenium or Cuprite to check Turbo and Stimulus behaviour end to end.',
          concepts: ['Request specs and response assertions', 'System tests with Capybara', 'Headless browser drivers', 'Testing Turbo interactions', 'Screenshots on failure'],
          quiz: [
            ['When do you need a system test rather than a request test?', 'When JavaScript, Turbo or Stimulus behaviour must be verified in a browser.'],
            ['Which method logs a user in for request specs with Devise?', 'sign_in user from Devise::Test::IntegrationHelpers.'],
          ],
          prereqs: ['RSpec and FactoryBot'],
        },
        {
          title: 'Testing jobs, mailers and models',
          description: 'assert_enqueued_with and perform_enqueued_jobs for Active Job, ActionMailer::TestCase and deliveries, model specs for validations and scopes, and time travel helpers.',
          concepts: ['assert_enqueued_with and have_enqueued_job', 'perform_enqueued_jobs', 'Mailer assertions and deliveries', 'Model specs for scopes', 'travel_to and freeze_time'],
          quiz: [
            ['How do you test that a mailer was queued after create?', 'Wrap the action in assert_enqueued_emails 1 or expect { }.to have_enqueued_mail.'],
            ['What does travel_to do?', 'Stubs Time.now for the block so time-based logic is deterministic.'],
          ],
          prereqs: ['Minitest and fixtures'],
        },
      ],
    },
    {
      title: 'Security, Configuration and Deployment',
      topics: [
        {
          title: 'Rails security defaults',
          description: 'What Rails protects by default (HTML escaping, CSRF, SQL parameterisation, strong params, content security policy hooks) and the escape hatches that undo it: html_safe, raw, string interpolation in where and permit!.',
          concepts: ['Escaping and html_safe misuse', 'SQL injection via string conditions', 'permit! and mass assignment', 'Content Security Policy config', 'Brakeman scanning'],
          quiz: [
            ['What is wrong with where("name = \'#{params[:name]}\'")?', 'SQL injection; use where(name: params[:name]) or placeholders.'],
            ['What does Brakeman do?', 'Static analysis for Rails-specific vulnerabilities.'],
          ],
        },
        {
          title: 'Credentials and secrets',
          description: 'Encrypted credentials.yml.enc edited with bin/rails credentials:edit, per-environment credential files, the master key in RAILS_MASTER_KEY, and when plain environment variables are the better choice.',
          concepts: ['credentials:edit and the master key', 'Per-environment credentials', 'Reading Rails.application.credentials', 'ENV versus credentials', 'Rotating secrets'],
          quiz: [
            ['What must never be committed?', 'config/master.key (and per-environment keys).'],
            ['How do you read a nested credential?', 'Rails.application.credentials.dig(:aws, :access_key_id).'],
          ],
        },
        {
          title: 'Production configuration and logging',
          description: 'config/environments/production.rb settings for hosts, SSL, caching and eager loading, structured logs with tags and Lograge, and error tracking with Sentry or Honeybadger.',
          concepts: ['Production environment settings', 'config.hosts and force_ssl', 'Log tags and Lograge', 'Error tracking integration', 'Health check endpoint'],
          quiz: [
            ['What does config.hosts protect against?', 'DNS rebinding attacks by rejecting unknown Host headers.'],
            ['Which built-in route reports app health?', '/up, added by Rails 7.1.'],
          ],
        },
        {
          title: 'Deploying with Kamal',
          description: 'Kamal builds a Docker image, pushes it and runs it on your servers behind kamal-proxy with zero-downtime swaps, secrets from .kamal/secrets, and accessories for Postgres and Redis. Docker itself lives in track-docker.',
          concepts: ['config/deploy.yml', 'kamal setup and deploy', 'kamal-proxy and health checks', 'Secrets and env in Kamal', 'Accessories for databases'],
          quiz: [
            ['What does kamal deploy do in order?', 'Builds the image, pushes it, pulls on servers, starts the new container, waits for health and swaps traffic.'],
            ['Where do Kamal secrets come from?', '.kamal/secrets, usually reading from ENV or a password manager.'],
          ],
          prereqs: ['Production configuration and logging'],
        },
        {
          title: 'Performance and rate limiting',
          description: 'Profiling with rack-mini-profiler, the bullet gem for N+1 alerts, database connection pool sizing against Puma threads, and Rack::Attack or the rate_limit macro for throttling.',
          concepts: ['rack-mini-profiler', 'Connection pool and Puma threads', 'Rack::Attack throttles', 'rate_limit in controllers', 'Slow query and endpoint monitoring'],
          quiz: [
            ['How should the database pool size relate to Puma threads?', 'At least equal to the thread count per process.'],
            ['What does rate_limit to: 10, within: 1.minute do?', 'Limits the controller action to 10 requests per minute per IP by default.'],
          ],
          prereqs: ['Production configuration and logging'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      style: 'project',
      topics: [
        {
          title: 'Project: marketplace with Hotwire',
          description: 'Build a listings marketplace: sellers, listings with Active Storage images, Turbo Frame inline editing, Turbo Stream live bids, Stimulus for image previews, Pundit policies and system tests.',
          concepts: ['Model users, listings and bids', 'Image uploads with variants', 'Turbo Frames for inline edits', 'Live bids with Turbo Streams', 'System tests for the flow'],
          quiz: [
            ['How do all viewers see a new bid instantly?', 'The Bid model broadcasts_to the listing and the page subscribes with turbo_stream_from.'],
            ['Where should the bid amount validation live?', 'The Bid model, with a database constraint as backup.'],
          ],
        },
        {
          title: 'Project: helpdesk with jobs and mail',
          description: 'A ticketing system where emails become tickets via Action Mailbox, agents reply with Action Mailer, SLAs are enforced by scheduled jobs, and Solid Queue runs everything with retries.',
          concepts: ['Tickets, comments and assignments', 'Inbound mail with Action Mailbox', 'Outbound replies with Action Mailer', 'SLA jobs with Solid Queue', 'Job and mailer tests'],
          quiz: [
            ['What turns an inbound email into a ticket?', 'An Action Mailbox class that routes and parses the message.'],
            ['Why run SLA checks as recurring jobs?', 'They must run on a schedule regardless of user traffic.'],
          ],
        },
        {
          title: 'Project: JSON API for a mobile app',
          description: 'An API-only Rails app with versioned routes, token auth, Jbuilder or Alba serializers, cursor pagination, rack-cors, request specs and an OpenAPI document generated with rswag.',
          concepts: ['API-only setup and versioning', 'Token auth and rate limits', 'Serializers and pagination', 'OpenAPI with rswag', 'Request specs for every endpoint'],
          quiz: [
            ['Why version the API namespace?', 'Mobile clients cannot be forced to update, so old shapes must keep working.'],
            ['What does rswag generate?', 'An OpenAPI spec from request specs, plus Swagger UI.'],
          ],
        },
        {
          title: 'Project: multi-tenant SaaS with Pundit',
          description: 'Accounts with memberships and roles, tenant scoping through Current.account and default query scopes, Pundit policies per role, invitations by email, Kamal deployment with Postgres accessory.',
          concepts: ['Accounts, memberships and roles', 'Tenant scoping with Current', 'Role-based policies', 'Invitations and onboarding mail', 'Kamal deployment'],
          quiz: [
            ['How do you guarantee every query is tenant-scoped?', 'Query through Current.account associations rather than top-level models.'],
            ['Which Pundit feature filters index pages?', 'policy_scope.'],
          ],
        },
        {
          title: 'Rails interview questions',
          description: 'What interviewers ask: request lifecycle, strong params, N+1 and includes, callbacks versus service objects, Turbo versus SPA, Active Job adapters, and where business logic belongs.',
          concepts: ['MVC and lifecycle questions', 'Active Record and performance questions', 'Hotwire and frontend questions', 'Background job questions'],
          quiz: [
            ['Explain includes versus joins.', 'includes loads associations to avoid N+1; joins adds SQL JOINs for filtering without loading them.'],
            ['Why are fat models discouraged?', 'They accumulate unrelated logic; extract service objects or concerns per responsibility.'],
          ],
          style: 'reading',
        },
        {
          title: 'Rails code review and design questions',
          description: 'Reviewing a controller action that touches five models, splitting a callback chain into a service, designing a subscription billing schema, and choosing between Turbo and a JSON API for a feature.',
          concepts: ['Refactoring fat controllers', 'Callbacks to service objects', 'Schema design exercises', 'Choosing Hotwire or an API'],
          quiz: [
            ['What smells in an action with three saves and an email?', 'No transaction, and side effects mixed with persistence; wrap in a service with a transaction and after_commit.'],
            ['When is a separate JSON API justified?', 'When native mobile or third-party clients need the data.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
