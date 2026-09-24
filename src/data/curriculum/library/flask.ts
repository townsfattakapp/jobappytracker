import { defineTrack } from '../define'

export const flask = defineTrack({
  id: 'track-flask',
  title: 'Flask',
  description: 'Flask the way production apps use it: the application factory and blueprints, routing and the request object, Jinja templates, WTForms, Flask-SQLAlchemy with migrations, sessions and Flask-Login, JSON APIs with marshmallow and JWT, configuration, extensions, testing and deployment with gunicorn and Docker.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🧪',
  tags: ['flask', 'python', 'backend', 'jinja', 'sqlalchemy', 'wtforms', 'rest', 'web'],
  languages: ['Python'],
  explainMode: 'concept',
  code: { label: 'Python with Flask', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python'],
  style: 'code',
  categories: [
    {
      title: 'App Factory, Blueprints and Contexts',
      description: 'The structure a Flask app needs before it grows past one file.',
      topics: [
        {
          title: 'Installing Flask and the first app',
          description: 'Installing Flask into a virtual environment, the Flask(__name__) object and what __name__ tells it, running with flask --app run and debug mode, and the pieces Flask is built on: Werkzeug for WSGI and routing, Jinja for templates.',
          concepts: ['Flask(__name__) and import name', 'flask run and the --app option', 'Debug mode and the reloader', 'Werkzeug and Jinja underneath'],
          quiz: [
            ['Why does Flask need __name__?', 'To locate the package root for templates, static files and the instance folder.'],
            ['Why is debug mode unsafe in production?', 'The interactive debugger allows arbitrary code execution from the browser.'],
          ],
        },
        {
          title: 'The application factory pattern',
          description: 'A create_app(config) function builds and returns the app instead of a module-level global, so tests can build isolated apps with different config and extensions initialise against the app they are given.',
          concepts: ['create_app function', 'Config passed into the factory', 'Registering extensions inside the factory', 'Why globals break tests'],
          quiz: [
            ['How does flask run find a factory?', 'flask --app package run calls create_app() automatically if it exists.'],
            ['Why does a module-level app = Flask(...) hurt testing?', 'Every test shares one configured app; you cannot vary config per test.'],
          ],
          prereqs: ['Installing Flask and the first app'],
        },
        {
          title: 'Blueprints',
          description: 'Blueprint objects group routes, templates, static files and error handlers for one feature; register_blueprint with url_prefix mounts them, and endpoint names become blueprint.view for url_for.',
          concepts: ['Creating a Blueprint', 'register_blueprint and url_prefix', 'Blueprint templates and static folders', 'Endpoint naming with url_for'],
          quiz: [
            ['What does url_for("auth.login") refer to?', 'The login view registered on the blueprint named auth.'],
            ['Can a blueprint be registered twice?', 'Yes, with different url_prefix and name values.'],
          ],
          prereqs: ['The application factory pattern'],
        },
        {
          title: 'Application and request contexts',
          description: 'current_app, g, request and session are context-local proxies that only work inside an application or request context; why "working outside of application context" appears in scripts and threads, and how app.app_context() fixes it.',
          concepts: ['current_app and g proxies', 'Request context lifetime', 'app.app_context() in scripts', 'Contexts in background threads'],
          quiz: [
            ['What is g for?', 'Per-request storage such as the current user or a database connection.'],
            ['Why does current_app fail in a Celery task?', 'No application context is active; push one with app.app_context().'],
          ],
          prereqs: ['The application factory pattern'],
        },
      ],
    },
    {
      title: 'Routing, Requests and Responses',
      topics: [
        {
          title: 'Routing and URL variables',
          description: '@app.route and @bp.route with variable rules and converters (int, float, path, uuid), the methods list, url_for building URLs from endpoint names and arguments, strict_slashes behaviour and redirects.',
          concepts: ['Route decorators and converters', 'Restricting methods', 'url_for and query arguments', 'Trailing slash rules'],
          quiz: [
            ['What does url_for("show", id=3, page=2) return if page is not a rule variable?', '/show/3?page=2, extra arguments become the query string.'],
            ['What is returned when a route is hit with an unlisted method?', '405 Method Not Allowed.'],
          ],
          prereqs: ['Blueprints'],
        },
        {
          title: 'The request object',
          description: 'request.args for the query string, request.form for form fields, request.get_json for JSON bodies, request.files for uploads, headers and cookies, and the MultiDict behaviour behind getlist and get with type conversion.',
          concepts: ['args, form and get_json', 'MultiDict, get and getlist', 'files, headers and cookies', 'Method and content-type checks'],
          quiz: [
            ['What does request.args.get("page", 1, type=int) do?', 'Returns the page value converted to int, or 1 if absent.'],
            ['What does get_json() return when the content type is not JSON?', 'None by default, or a 415 if force=False and silent=False on newer versions.'],
          ],
          prereqs: ['Routing and URL variables'],
        },
        {
          title: 'Building responses',
          description: 'What a view can return: a string, a dict that becomes JSON, a (body, status, headers) tuple, or a Response from make_response; jsonify and redirect helpers, setting cookies and headers, and streaming generators.',
          concepts: ['Return value conversion rules', 'jsonify and dict returns', 'make_response and headers', 'Streaming responses'],
          quiz: [
            ['What does returning {"ok": True} from a view produce?', 'A JSON response with application/json content type.'],
            ['How do you return a 201 with a Location header?', 'return body, 201, {"Location": url}.'],
          ],
          prereqs: ['The request object'],
        },
        {
          title: 'Error handling',
          description: 'abort(404) raises a Werkzeug HTTPException; @app.errorhandler registers handlers per status or exception class, JSON error responses for API blueprints, custom exception classes with codes, and logging unexpected errors.',
          concepts: ['abort and HTTPException', 'errorhandler by status or class', 'JSON error responses', 'Custom application exceptions'],
          quiz: [
            ['What does @app.errorhandler(404) receive?', 'The NotFound exception instance.'],
            ['Can a blueprint have its own error handlers?', 'Yes, with bp.errorhandler for errors raised inside its routes.'],
          ],
          prereqs: ['Building responses'],
        },
        {
          title: 'Request hooks and g',
          description: 'before_request for auth or connection setup, after_request to add headers to every response, teardown_request and teardown_appcontext for cleanup even on errors, and g as the per-request bag those hooks share.',
          concepts: ['before_request hooks', 'after_request headers', 'teardown hooks and cleanup', 'Sharing data through g'],
          quiz: [
            ['What happens if before_request returns a response?', 'The view is skipped and that response is sent.'],
            ['When does teardown_appcontext run?', 'When the app context pops, even if the request raised.'],
          ],
          prereqs: ['Application and request contexts'],
        },
      ],
    },
    {
      title: 'Templates with Jinja',
      topics: [
        {
          title: 'Jinja templating',
          description: 'render_template loads files from the templates folder, variables and expressions, filters like length and default, if and for blocks, loop variables, and autoescaping that turns user input into safe HTML.',
          concepts: ['render_template and context', 'Expressions and filters', 'if and for with loop variables', 'Autoescaping and the safe filter'],
          quiz: [
            ['Where does Flask look for templates by default?', 'A templates folder next to the module or package.'],
            ['Is {{ user.bio }} escaped?', 'Yes, autoescaping is on for .html templates.'],
          ],
        },
        {
          title: 'Template inheritance and macros',
          description: 'A base layout with blocks, child templates that extend it, include for partials, and macros with import to reuse form field rendering across pages.',
          concepts: ['extends and blocks', 'include for partials', 'Macros and import', 'super() inside blocks'],
          quiz: [
            ['What does {% block content %}{% endblock %} do in a base template?', 'Defines a slot child templates can fill.'],
            ['How do you reuse a field renderer across templates?', 'Define a macro in a file and import it.'],
          ],
          prereqs: ['Jinja templating'],
        },
        {
          title: 'Context processors and custom filters',
          description: 'context_processor injects values like the current user into every template, template_filter registers custom filters, template_global registers helpers, and url_for is already available in templates.',
          concepts: ['context_processor', 'template_filter registration', 'template_global helpers', 'Built-in template globals'],
          quiz: [
            ['What must a context processor return?', 'A dict merged into every template context.'],
            ['How do you format dates consistently across templates?', 'Register a template_filter such as datefmt.'],
          ],
          prereqs: ['Jinja templating'],
        },
        {
          title: 'Static files and flashed messages',
          description: 'Serving CSS and JS from the static folder with url_for("static", filename=...), cache busting, flash() to queue a one-time message across a redirect, and get_flashed_messages with categories in the layout.',
          concepts: ['url_for static', 'Cache busting static assets', 'flash and categories', 'Rendering flashed messages'],
          quiz: [
            ['Where are flashed messages stored between requests?', 'In the session cookie until the next request reads them.'],
            ['Why use url_for("static", ...) instead of /static/...?', 'It honours the app or blueprint static URL and any prefix the app runs under.'],
          ],
          prereqs: ['Template inheritance and macros'],
        },
      ],
    },
    {
      title: 'Forms with WTForms',
      topics: [
        {
          title: 'Flask-WTF forms',
          description: 'FlaskForm classes declare fields and validators; validate_on_submit checks POST plus validation, errors render next to fields, and the hidden CSRF token that Flask-WTF adds and checks on every submission.',
          concepts: ['FlaskForm fields and validators', 'validate_on_submit', 'Rendering fields and errors', 'CSRF tokens from Flask-WTF'],
          quiz: [
            ['What does validate_on_submit() check?', 'That the request is a POST (or PUT/PATCH/DELETE) and the form validates.'],
            ['What is needed for the CSRF token to work?', 'A configured SECRET_KEY and form.hidden_tag() or form.csrf_token in the template.'],
          ],
          prereqs: ['Building responses', 'Template inheritance and macros'],
        },
        {
          title: 'Custom validation and file uploads',
          description: 'Inline validate_<field> methods, reusable validator callables raising ValidationError, FileField with FileRequired and FileAllowed, secure_filename before saving, and MAX_CONTENT_LENGTH to reject oversized uploads.',
          concepts: ['validate_<field> methods', 'Reusable validator callables', 'FileField and FileAllowed', 'secure_filename and size limits'],
          quiz: [
            ['Why call secure_filename on an upload name?', 'It strips path separators and unsafe characters so files cannot escape the upload folder.'],
            ['What happens when a request exceeds MAX_CONTENT_LENGTH?', 'Flask raises RequestEntityTooLarge, a 413.'],
          ],
          prereqs: ['Flask-WTF forms'],
        },
        {
          title: 'Edit forms and dynamic choices',
          description: 'Prefilling a form from a model with obj=, writing fields back with populate_obj, SelectField choices set at request time from the database, and coercing select values to integers.',
          concepts: ['Prefilling with obj=', 'populate_obj on save', 'SelectField with runtime choices', 'coerce for select values'],
          quiz: [
            ['Why set form.category.choices inside the view?', 'Choices from the database change; class-level choices are evaluated once at import.'],
            ['What does form.populate_obj(post) do?', 'Copies each form field value onto the matching attribute of post.'],
          ],
          prereqs: ['Flask-WTF forms'],
        },
      ],
    },
    {
      title: 'Databases with Flask-SQLAlchemy',
      description: 'Persisting data. SQL itself belongs to track-sql; here it is the Flask integration and session lifecycle.',
      topics: [
        {
          title: 'Flask-SQLAlchemy setup and models',
          description: 'Creating the SQLAlchemy extension, init_app inside the factory, SQLALCHEMY_DATABASE_URI, db.Model classes with Mapped and mapped_column, and db.create_all inside an app context for early development.',
          concepts: ['SQLAlchemy() and init_app', 'SQLALCHEMY_DATABASE_URI', 'db.Model with Mapped columns', 'create_all in an app context'],
          quiz: [
            ['Why does db.create_all() need an app context?', 'The extension reads the engine from current_app config.'],
            ['Where does Flask-SQLAlchemy keep the session?', 'A scoped session tied to the app context, removed at teardown.'],
          ],
          prereqs: ['The application factory pattern'],
        },
        {
          title: 'Queries and relationships',
          description: 'db.session.execute(db.select(Model)) with scalars, db.get_or_404 and db.first_or_404 shortcuts, relationship with back_populates, foreign keys, and how lazy loading triggers extra queries during template rendering.',
          concepts: ['db.select and scalars', 'get_or_404 and first_or_404', 'relationship and back_populates', 'Lazy loading in templates'],
          quiz: [
            ['What does db.get_or_404(Post, id) do?', 'Returns the post by primary key or aborts with 404.'],
            ['Why can a template loop over posts fire many queries?', 'Accessing post.author lazily loads each author; eager-load instead.'],
          ],
          prereqs: ['Flask-SQLAlchemy setup and models'],
        },
        {
          title: 'Sessions, transactions and pagination',
          description: 'db.session.add and commit, rollback on failure, the session removed automatically at request end, db.paginate for page objects with items and links, and selectinload to fix N+1 on list pages.',
          concepts: ['add, commit and rollback', 'Session removal at teardown', 'db.paginate and page objects', 'selectinload for list pages'],
          quiz: [
            ['What does db.paginate(select, page=2, per_page=20) return?', 'A Pagination object with items, total, pages and iter_pages.'],
            ['Why wrap commit in try/except with rollback?', 'A failed flush leaves the session in an unusable state until rollback.'],
          ],
          prereqs: ['Queries and relationships'],
        },
        {
          title: 'Flask-Migrate',
          description: 'Flask-Migrate wraps Alembic: flask db init, migrate to autogenerate a script from model changes, upgrade and downgrade, reviewing generated scripts because autogenerate misses renames, and running upgrade during deployment.',
          concepts: ['flask db init and migrate', 'Reviewing autogenerated scripts', 'upgrade and downgrade', 'Migrations in deployment'],
          quiz: [
            ['What does flask db migrate do?', 'Compares models to the database and writes a new migration script.'],
            ['Why review an autogenerated migration?', 'Renamed columns appear as drop and add, losing data.'],
          ],
          prereqs: ['Flask-SQLAlchemy setup and models'],
        },
        {
          title: 'Flask shell and CLI commands',
          description: 'flask shell with a shell_context_processor that preloads db and models, and custom commands with @app.cli.command using click options for seeding data, imports and maintenance jobs.',
          concepts: ['flask shell and shell_context_processor', 'app.cli.command with click', 'Seed and maintenance commands', 'Commands on blueprints'],
          quiz: [
            ['How do you avoid importing models in every flask shell session?', 'Return them from a shell_context_processor.'],
            ['Which library powers Flask CLI options?', 'Click.'],
          ],
          prereqs: ['Flask-SQLAlchemy setup and models'],
        },
      ],
    },
    {
      title: 'Sessions, Authentication and Security',
      description: 'Vulnerability classes are covered in track-web-security; this is the Flask machinery.',
      topics: [
        {
          title: 'Cookies and the session',
          description: 'The default session is a signed cookie: readable by the client but tamper-proof through SECRET_KEY. Setting and clearing keys, permanent sessions with a lifetime, cookie flags, and Flask-Session for server-side storage.',
          concepts: ['Signed cookie sessions', 'SECRET_KEY and tamper protection', 'Permanent sessions and lifetime', 'Server-side sessions with Flask-Session'],
          quiz: [
            ['Can a user read what is in the Flask session?', 'Yes, it is base64-encoded and signed, not encrypted.'],
            ['What breaks if SECRET_KEY changes?', 'Every existing session and CSRF token becomes invalid.'],
          ],
          prereqs: ['Request hooks and g'],
        },
        {
          title: 'Flask-Login',
          description: 'LoginManager with a user_loader that fetches the user by id, UserMixin on the model, login_user and logout_user, login_required guarding views, current_user in templates, and remember-me cookies.',
          concepts: ['LoginManager and user_loader', 'UserMixin properties', 'login_user and logout_user', 'login_required and current_user', 'Remember-me cookies'],
          quiz: [
            ['What does the user_loader callback receive?', 'The user id stored in the session, as a string.'],
            ['Where does login_required redirect anonymous users?', 'To login_manager.login_view with a next parameter.'],
          ],
          prereqs: ['Cookies and the session', 'Queries and relationships'],
        },
        {
          title: 'Registration and password handling',
          description: 'generate_password_hash and check_password_hash from werkzeug.security, a registration form with unique-email validation, email confirmation and password reset links signed with itsdangerous timed tokens.',
          concepts: ['Hashing with werkzeug.security', 'Unique email validation', 'Timed tokens with itsdangerous', 'Confirmation and reset flows'],
          quiz: [
            ['What does generate_password_hash store?', 'The algorithm, salt and hash in one string.'],
            ['Why do reset tokens expire?', 'A leaked link should stop working after a short window.'],
          ],
          prereqs: ['Flask-Login'],
        },
        {
          title: 'Roles and authorization',
          description: 'A role column or roles table, a decorator that checks current_user before the view, ownership checks so users edit only their own rows, and 403 responses; larger apps may reach for Flask-Principal.',
          concepts: ['Role data on the user model', 'Role-checking decorators', 'Ownership checks per resource', 'Returning 403 correctly'],
          quiz: [
            ['Where should an admin_required decorator sit relative to login_required?', 'Below it, so login runs first.'],
            ['Why check ownership in the view rather than hiding links?', 'Anyone can craft the URL; hiding links is not authorization.'],
          ],
          prereqs: ['Flask-Login'],
        },
        {
          title: 'Security hardening for Flask',
          description: 'CSRFProtect for all POST forms, SESSION_COOKIE_SECURE, HttpOnly and SameSite flags, security headers with Flask-Talisman, escaping in templates and Markup, and never trusting request data in file paths or SQL.',
          concepts: ['CSRFProtect app-wide', 'Secure session cookie flags', 'Headers with Flask-Talisman', 'Escaping and Markup'],
          quiz: [
            ['How do JavaScript requests pass the CSRF token with CSRFProtect?', 'In the X-CSRFToken header, read from a meta tag or csrf_token().'],
            ['What does SESSION_COOKIE_SAMESITE="Lax" prevent?', 'The session cookie being sent on cross-site POST requests.'],
          ],
          prereqs: ['Cookies and the session'],
        },
      ],
    },
    {
      title: 'REST APIs with Flask',
      description: 'JSON endpoints in Flask. API design and HTTP semantics live in track-rest-api.',
      topics: [
        {
          title: 'JSON APIs with blueprints and MethodView',
          description: 'An API blueprint under /api returning JSON with proper status codes, MethodView classes mapping get, post, put and delete to one resource, add_url_rule registration, and JSON error handlers scoped to the blueprint.',
          concepts: ['API blueprint conventions', 'MethodView classes', 'add_url_rule for views', 'Blueprint-scoped JSON errors'],
          quiz: [
            ['How is a MethodView registered?', 'bp.add_url_rule("/items/<int:id>", view_func=ItemAPI.as_view("item")).'],
            ['Why keep API error handlers on the blueprint?', 'HTML pages and JSON clients need different error formats.'],
          ],
          prereqs: ['Error handling'],
        },
        {
          title: 'Serialisation and validation with marshmallow',
          description: 'marshmallow Schema classes with fields, load to validate input and dump to serialise models, ValidationError to 400 responses, Nested schemas, and Flask-Marshmallow with SQLAlchemyAutoSchema for less boilerplate.',
          concepts: ['Schema fields, load and dump', 'ValidationError handling', 'Nested schemas', 'SQLAlchemyAutoSchema'],
          quiz: [
            ['What does schema.load(data) return on success?', 'A validated dict (or object with post_load).'],
            ['How do you exclude a hashed password from output?', 'Mark the field load_only=True.'],
          ],
          prereqs: ['JSON APIs with blueprints and MethodView'],
        },
        {
          title: 'Token authentication for APIs',
          description: 'Flask-JWT-Extended for access and refresh tokens with jwt_required and get_jwt_identity, or Flask-HTTPAuth HTTPTokenAuth with a verify_token callback, and why cookie sessions are awkward for non-browser clients.',
          concepts: ['Flask-JWT-Extended tokens', 'jwt_required and identity', 'Flask-HTTPAuth verify_token', 'Sessions versus tokens for APIs'],
          quiz: [
            ['What does create_access_token(identity=user.id) return?', 'A signed JWT string the client sends as a Bearer token.'],
            ['Why use a refresh token?', 'Access tokens stay short-lived while users stay logged in.'],
          ],
          prereqs: ['JSON APIs with blueprints and MethodView'],
        },
        {
          title: 'OpenAPI with flask-smorest',
          description: 'flask-smorest builds on marshmallow to declare request and response schemas on views, generates an OpenAPI document and Swagger UI, and standardises pagination and error responses.',
          concepts: ['Blueprint from flask-smorest', 'arguments and response decorators', 'Generated OpenAPI and Swagger UI', 'Standard error responses'],
          quiz: [
            ['What does @bp.arguments(ItemSchema) do?', 'Validates the request body and passes the loaded data to the view.'],
            ['Where does flask-smorest serve the docs?', 'At the OPENAPI_SWAGGER_UI_PATH configured, commonly /swagger-ui.'],
          ],
          prereqs: ['Serialisation and validation with marshmallow'],
        },
        {
          title: 'CORS, rate limiting and pagination envelopes',
          description: 'Flask-CORS for browser clients with explicit origins, Flask-Limiter for per-client rate limits keyed by IP or token, and a consistent pagination envelope with page, per_page, total and next links.',
          concepts: ['Flask-CORS configuration', 'Flask-Limiter rules', 'Pagination envelope design', 'Link headers versus body links'],
          quiz: [
            ['How do you limit a route to 10 requests per minute?', '@limiter.limit("10/minute") on the view.'],
            ['Why include total and next in a list response?', 'Clients can render paging controls without extra requests.'],
          ],
          prereqs: ['JSON APIs with blueprints and MethodView'],
        },
      ],
    },
    {
      title: 'Configuration, Extensions and Structure',
      topics: [
        {
          title: 'Configuration',
          description: 'app.config as a dict, config classes per environment loaded with from_object, from_prefixed_env reading FLASK_ prefixed variables, the instance folder for secrets outside version control, and choosing config in the factory.',
          concepts: ['Config classes per environment', 'from_object and from_prefixed_env', 'The instance folder', 'Selecting config in the factory'],
          quiz: [
            ['What does from_prefixed_env() load?', 'Every FLASK_ prefixed environment variable into app.config, parsing JSON values.'],
            ['Why keep production secrets in the instance folder or env?', 'They stay out of the repository.'],
          ],
          prereqs: ['The application factory pattern'],
        },
        {
          title: 'Flask extensions and the init_app pattern',
          description: 'Extensions are created once at module level and bound in the factory with init_app, which is what makes multiple apps and testing possible; common ones: Flask-Mail, Flask-Caching, Flask-Limiter, Flask-Login.',
          concepts: ['Module-level extension objects', 'init_app binding', 'Flask-Mail setup', 'Flask-Caching backends'],
          quiz: [
            ['Why create extensions outside create_app?', 'Blueprints and models import them without importing the app.'],
            ['What does cache.cached(timeout=60) on a view do?', 'Stores the rendered response for 60 seconds per URL.'],
          ],
          prereqs: ['The application factory pattern'],
        },
        {
          title: 'Logging and background jobs',
          description: 'app.logger and dictConfig before the app is created, logging request ids, and running slow work outside the request with Celery or RQ, where each task pushes an app context to use extensions.',
          concepts: ['app.logger and dictConfig', 'Request-scoped log context', 'Celery with an app context', 'RQ for simpler queues'],
          quiz: [
            ['Why configure logging before creating the app?', 'Flask adds a default handler if none exists, causing duplicate output.'],
            ['How does a Celery task use Flask-SQLAlchemy?', 'Wrap the task in app.app_context() or subclass Task to push it.'],
          ],
          prereqs: ['Application and request contexts'],
        },
        {
          title: 'Project layout for larger apps',
          description: 'A package with a factory, one blueprint package per feature holding views, forms and templates, a models module, a services layer for logic, and import order that avoids circular imports between blueprints and models.',
          concepts: ['Package and factory layout', 'Blueprint packages per feature', 'Services layer', 'Avoiding circular imports'],
          quiz: [
            ['Why import blueprints inside create_app?', 'It avoids circular imports since blueprints import extensions and models.'],
            ['Where should business rules live?', 'In service functions the views call, so they are testable without HTTP.'],
          ],
          prereqs: ['Blueprints'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'Testing with the test client',
          description: 'pytest fixtures that build an app from the factory with TESTING config and a client from app.test_client(), making requests, and reading response.status_code, response.data and response.json.',
          concepts: ['App and client fixtures', 'TESTING configuration', 'Requests through test_client', 'Reading response data and JSON'],
          quiz: [
            ['What does TESTING=True change?', 'Exceptions propagate instead of being turned into 500 pages.'],
            ['How do you follow a redirect in a test?', 'client.get(url, follow_redirects=True).'],
          ],
          prereqs: ['The application factory pattern'],
        },
        {
          title: 'Test database and factories',
          description: 'An in-memory SQLite or a dedicated test database, create_all before and drop_all after each test or a transaction rolled back per test, and factory_boy factories for realistic rows.',
          concepts: ['In-memory test database', 'create_all and drop_all per test', 'Transaction rollback pattern', 'factory_boy with SQLAlchemy'],
          quiz: [
            ['Why can SQLite in tests hide bugs?', 'It lacks PostgreSQL features such as strict types and some constraints.'],
            ['What is faster than create_all per test?', 'Begin a transaction per test and roll it back.'],
          ],
          prereqs: ['Testing with the test client', 'Flask-SQLAlchemy setup and models'],
        },
        {
          title: 'Testing auth and forms',
          description: 'Logging in through a helper or by setting the session with session_transaction, disabling CSRF in tests with WTF_CSRF_ENABLED=False, posting form data, and asserting flashed messages and redirects.',
          concepts: ['Login helpers in tests', 'session_transaction', 'Disabling CSRF in tests', 'Asserting flashes and redirects'],
          quiz: [
            ['How do you set a session key before a request?', 'with client.session_transaction() as sess: sess["user_id"] = 1.'],
            ['Why disable CSRF in tests?', 'Tests post forms directly without rendering the token.'],
          ],
          prereqs: ['Testing with the test client', 'Flask-Login'],
        },
        {
          title: 'CLI runner, mocking and coverage',
          description: 'app.test_cli_runner to invoke custom commands, mocking mail and HTTP calls with monkeypatch or responses, and measuring coverage with pytest-cov to find untested branches.',
          concepts: ['test_cli_runner', 'Mocking mail and HTTP', 'pytest-cov reports', 'Testing error handlers'],
          quiz: [
            ['How do you test a flask CLI command?', 'runner.invoke(args=["seed"]) and assert on result.output.'],
            ['What does Flask-Mail do when TESTING is on?', 'It suppresses sending; record_messages captures outgoing mail.'],
          ],
          prereqs: ['Testing with the test client'],
        },
      ],
    },
    {
      title: 'Deployment',
      topics: [
        {
          title: 'Serving with gunicorn or waitress',
          description: 'Flask ships a development server only; gunicorn runs the WSGI app with several workers on Linux, waitress is the pure-Python choice on Windows, and the factory is referenced as "package:create_app()".',
          concepts: ['Why the dev server is not for production', 'gunicorn workers and binding', 'waitress on Windows', 'Pointing servers at a factory'],
          quiz: [
            ['How do you tell gunicorn to use a factory?', 'gunicorn "myapp:create_app()".'],
            ['What is a sensible default worker count?', 'Around 2 x CPU cores + 1.'],
          ],
          prereqs: ['The application factory pattern'],
        },
        {
          title: 'Reverse proxies and ProxyFix',
          description: 'nginx in front for TLS, static files and buffering, X-Forwarded headers that Werkzeug ProxyFix reads so url_for and request.remote_addr are correct, and serving static assets from nginx or WhiteNoise.',
          concepts: ['nginx in front of gunicorn', 'ProxyFix and forwarded headers', 'Correct scheme and client address', 'Static files via nginx or WhiteNoise'],
          quiz: [
            ['Why does url_for generate http:// links behind TLS?', 'The proxy terminates TLS; ProxyFix must read X-Forwarded-Proto.'],
            ['What risk does trusting X-Forwarded-For carry?', 'Clients can spoof it unless the proxy overwrites it; set x_for=1 for one hop.'],
          ],
          prereqs: ['Serving with gunicorn or waitress'],
        },
        {
          title: 'Docker and environment configuration',
          description: 'A Dockerfile that installs dependencies then copies code, configuration through environment variables, secrets from the platform, flask db upgrade as a release step, and a health endpoint. Docker basics are in track-docker.',
          concepts: ['Dockerfile for a Flask app', 'Environment-driven config', 'Migrations at release', 'Health endpoint'],
          quiz: [
            ['Where should SECRET_KEY come from in a container?', 'An environment variable or secret store, not the image.'],
            ['Why run flask db upgrade before starting new containers?', 'New code expects the new schema.'],
          ],
          prereqs: ['Serving with gunicorn or waitress', 'Flask-Migrate'],
        },
        {
          title: 'Async views, caching and scaling',
          description: 'async def views run on an event loop per request via asgiref but the server is still WSGI and threads, so heavy async work fits Quart or FastAPI better; scaling Flask means more workers, Redis caching and moving jobs off the request path.',
          concepts: ['async views and asgiref', 'Limits of async under WSGI', 'Redis caching with Flask-Caching', 'Horizontal scaling and stateless workers'],
          quiz: [
            ['Does async def in Flask give FastAPI-like concurrency?', 'No, each request still occupies a worker thread.'],
            ['Why must workers be stateless to scale?', 'Any worker may serve the next request, so state must live in a shared store.'],
          ],
          prereqs: ['Serving with gunicorn or waitress'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: blog with accounts',
          description: 'Build a blog with the factory and blueprints: registration and login with Flask-Login, posts with Markdown and slugs, comments, WTForms with CSRF, Flask-SQLAlchemy models with migrations, pagination and a test suite.',
          concepts: ['Factory, blueprints and config', 'Auth blueprint with Flask-Login', 'Posts and comments with forms', 'Migrations and pagination', 'Tests for auth and CRUD'],
          quiz: [
            ['How do you keep the post list to a fixed number of queries?', 'selectinload the author relationship and paginate.'],
            ['Where does the current user come from in templates?', 'current_user injected by Flask-Login.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: bookmark manager REST API',
          description: 'Build a JSON API with marshmallow schemas, JWT authentication, per-user bookmarks with tags and search, pagination envelopes, rate limiting, OpenAPI docs via flask-smorest, and tests for every status code path.',
          concepts: ['Schemas and validation', 'JWT-protected resources', 'Search, tags and pagination', 'OpenAPI documentation', 'Status-code test matrix'],
          quiz: [
            ['What should a POST with invalid JSON return?', '400 with the marshmallow error messages.'],
            ['How do you scope bookmarks to the caller?', 'Filter by get_jwt_identity() in the query.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: URL shortener with analytics',
          description: 'Build a shortener: base62 codes, redirect endpoint with click logging in a background job, a dashboard with Jinja and cached statistics, custom aliases with validation, and rate limiting on creation.',
          concepts: ['Short code generation', 'Redirect view and click tracking', 'Background job for analytics', 'Cached dashboard stats'],
          quiz: [
            ['Why record clicks in a background job?', 'The redirect must be fast; logging can lag.'],
            ['Which status code should the redirect use?', '302 or 307 for temporary, 301 if permanent caching is acceptable.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: deploy a Flask app to production',
          description: 'Take an app live: environment config, gunicorn behind nginx with ProxyFix, PostgreSQL and flask db upgrade at release, Docker image, health endpoint, logging to stdout, Flask-Talisman headers, and a CI pipeline running tests.',
          concepts: ['Production config and secrets', 'gunicorn, nginx and ProxyFix', 'Container build and release step', 'Headers, logging and CI'],
          quiz: [
            ['What proves the proxy setup is correct?', 'url_for returns https links and request.remote_addr is the real client.'],
            ['What should the CI pipeline run?', 'Lint, tests with coverage, and a migration check.'],
          ],
          style: 'project',
        },
        {
          title: 'Flask interview questions',
          description: 'The recurring questions: application versus request context, why the factory pattern, blueprints versus Django apps, signed cookie sessions, how Flask-Login works, WSGI and gunicorn, and Flask versus FastAPI versus Django.',
          concepts: ['Context and proxy questions', 'Structure and extension questions', 'Session and auth questions', 'Framework comparison answers'],
          quiz: [
            ['Explain g versus session.', 'g lasts one request in memory; session persists across requests in a signed cookie.'],
            ['Why is Flask called a microframework?', 'It ships routing, requests and templates only; databases and auth come from extensions.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live-coding a Flask feature',
          description: 'Practising the timed task: add a model and migration, a blueprint with a form or JSON endpoint, validation and error handling, and tests with the client, keeping the factory pattern intact.',
          concepts: ['Scoping the feature', 'Model, migration and blueprint', 'Validation and errors', 'Client tests to finish'],
          quiz: [
            ['What do you set up first in a timed Flask task?', 'A test fixture building the app from the factory with a test database.'],
            ['How do you show context knowledge under pressure?', 'Use g and current_app correctly and push an app context in scripts.'],
          ],
        },
      ],
    },
  ],
})
