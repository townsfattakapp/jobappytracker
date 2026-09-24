import { defineTrack } from '../define'

export const django = defineTrack({
  id: 'track-django',
  title: 'Django',
  description: 'Django as it is actually built: projects and apps, settings, URL routing, function and class-based views, templates, the ORM with migrations and query optimisation, forms, admin, auth, DRF APIs, signals, caching, async views, testing and production deployment.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🎸',
  tags: ['django', 'python', 'backend', 'orm', 'drf', 'rest', 'web'],
  languages: ['Python'],
  explainMode: 'concept',
  code: { label: 'Python with Django', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-python'],
  style: 'code',
  categories: [
    {
      title: 'Project Structure and Settings',
      description: 'How a Django project is laid out and configured before any feature is written.',
      topics: [
        {
          title: 'Installing Django and starting a project',
          description: 'Pinning a Django LTS release in a virtual environment, what django-admin startproject generates (manage.py, settings.py, urls.py, asgi.py, wsgi.py), and how runserver auto-reloads and serves the first page.',
          concepts: ['Choosing an LTS release', 'django-admin startproject layout', 'manage.py and runserver', 'asgi.py versus wsgi.py entry points'],
          quiz: [
            ['What does manage.py add over django-admin?', 'It sets DJANGO_SETTINGS_MODULE to your project settings before running commands.'],
            ['Which files does startproject create inside the package?', 'settings.py, urls.py, asgi.py, wsgi.py and __init__.py.'],
          ],
        },
        {
          title: 'Projects versus apps',
          description: 'A project is the configuration; apps are reusable units of models, views and templates. startapp layout, registering in INSTALLED_APPS, the AppConfig class, and how to split a domain into apps that do not import each other in circles.',
          concepts: ['startapp file layout', 'INSTALLED_APPS and AppConfig', 'One app per bounded feature', 'Avoiding circular app imports'],
          quiz: [
            ['Why must an app be in INSTALLED_APPS?', 'Django only discovers models, templates, static files and migrations of installed apps.'],
            ['Where do app-level startup hooks go?', 'AppConfig.ready() in apps.py.'],
          ],
          prereqs: ['Installing Django and starting a project'],
        },
        {
          title: 'The settings module',
          description: 'What the important settings do (DEBUG, ALLOWED_HOSTS, DATABASES, INSTALLED_APPS, MIDDLEWARE, TEMPLATES), splitting settings per environment, reading secrets from environment variables with django-environ, and accessing them through django.conf.settings.',
          concepts: ['Core settings and their effects', 'Split settings per environment', 'Environment variables and django-environ', 'django.conf.settings at runtime'],
          quiz: [
            ['What happens with DEBUG=True and an empty ALLOWED_HOSTS?', 'Localhost is allowed; with DEBUG=False every request returns 400 until hosts are listed.'],
            ['Why never commit SECRET_KEY?', 'It signs sessions, CSRF tokens and password reset links; leaking it lets attackers forge them.'],
          ],
          prereqs: ['Installing Django and starting a project'],
        },
        {
          title: 'The request-response cycle',
          description: 'The path a request takes: the WSGI or ASGI handler builds an HttpRequest, middleware runs in order, the URL resolver picks a view, the view returns an HttpResponse, and middleware runs again in reverse. Knowing this order explains most Django debugging.',
          concepts: ['Handler builds HttpRequest', 'Middleware in and out', 'URL resolver picks a view', 'HttpResponse back through the stack'],
          quiz: [
            ['In which order does response middleware run?', 'Reverse of the MIDDLEWARE list.'],
            ['What does the resolver do when no pattern matches?', 'Raises Resolver404, which becomes a 404 response.'],
          ],
          prereqs: ['Projects versus apps'],
        },
      ],
    },
    {
      title: 'URL Routing and Views',
      topics: [
        {
          title: 'URLconf and path converters',
          description: 'path() with converters (int, str, slug, uuid, path), re_path for regular expressions, include() to delegate to app URLconfs, app_name for namespaces, and writing a custom converter when the built-ins do not fit.',
          concepts: ['path() and built-in converters', 're_path and named groups', 'include() and app namespaces', 'Custom path converters'],
          quiz: [
            ['What does path("posts/<int:pk>/", view) pass to the view?', 'A keyword argument pk converted to int.'],
            ['Why set app_name in an app URLconf?', 'So names can be reversed as "blog:detail" without clashing across apps.'],
          ],
        },
        {
          title: 'Reverse resolution and named URLs',
          description: 'Never hard-coding paths: reverse() and reverse_lazy() in Python, the {% url %} tag in templates, redirect() with names, and get_absolute_url on models so links follow when routes change.',
          concepts: ['reverse() and reverse_lazy()', 'The url template tag', 'redirect() shortcuts', 'get_absolute_url on models'],
          quiz: [
            ['When do you need reverse_lazy instead of reverse?', 'At import time, such as a class attribute success_url, before the URLconf is loaded.'],
            ['What does redirect("blog:detail", pk=3) do?', 'Reverses the named URL with pk=3 and returns a 302 response.'],
          ],
          prereqs: ['URLconf and path converters'],
        },
        {
          title: 'Function-based views',
          description: 'A view is a function taking HttpRequest and returning HttpResponse. Reading request.GET, POST, FILES, META and user, returning HttpResponse subclasses and JsonResponse, the render and get_object_or_404 shortcuts, and require_http_methods decorators.',
          concepts: ['HttpRequest attributes', 'HttpResponse subclasses and JsonResponse', 'render and get_object_or_404', 'Method-restricting decorators'],
          quiz: [
            ['What does get_object_or_404(Post, pk=pk) raise when missing?', 'Http404, which Django turns into a 404 page.'],
            ['Is request.POST populated for a JSON body?', 'No, only for form-encoded or multipart bodies; read request.body instead.'],
          ],
          prereqs: ['The request-response cycle'],
        },
        {
          title: 'Class-based views and mixins',
          description: 'How View.as_view() creates the callable, dispatch routes by HTTP method to get/post handlers, mixins compose behaviour through the MRO, and the trade-off between class-based reuse and function-based readability.',
          concepts: ['as_view() and dispatch', 'get and post handlers', 'Mixins and method resolution order', 'Choosing CBV versus FBV'],
          quiz: [
            ['What does dispatch do?', 'Calls the method named after the lowercase HTTP verb, or returns 405.'],
            ['Where must LoginRequiredMixin appear in the bases?', 'Leftmost, so its dispatch runs before the view logic.'],
          ],
          prereqs: ['Function-based views'],
        },
        {
          title: 'Generic display and editing views',
          description: 'ListView, DetailView, CreateView, UpdateView and DeleteView: what each assumes about model, template name and context, and the hooks (get_queryset, get_context_data, form_valid, get_success_url) that customise them without rewriting.',
          concepts: ['ListView and DetailView defaults', 'Create, Update and Delete views', 'get_queryset and get_context_data', 'form_valid and success URLs'],
          quiz: [
            ['What template does DetailView look for by default?', '<app>/<model>_detail.html.'],
            ['Where do you attach the current user to a new object?', 'In form_valid, set form.instance.owner = self.request.user before calling super().'],
          ],
          prereqs: ['Class-based views and mixins'],
        },
      ],
    },
    {
      title: 'Templates and Static Files',
      topics: [
        {
          title: 'Django template language',
          description: 'Variables, dotted lookup order (dict, attribute, index), built-in filters and tags, autoescaping and why it protects against XSS, and how the TEMPLATES setting picks engines and loaders.',
          concepts: ['Variables and dotted lookup', 'Built-in filters and tags', 'Autoescaping and mark_safe', 'TEMPLATES engines and loaders'],
          quiz: [
            ['What does {{ user.name }} try first?', 'Dictionary lookup, then attribute, then list index, calling methods with no arguments.'],
            ['When is |safe dangerous?', 'When the value contains user input, because it disables escaping and enables XSS.'],
          ],
        },
        {
          title: 'Template inheritance and inclusion',
          description: 'A base template with named blocks, child templates that extend and override, include for fragments, and where templates live: app templates directories with APP_DIRS versus project-level DIRS and the override order.',
          concepts: ['extends and block', 'include and with', 'APP_DIRS versus DIRS lookup order', 'Overriding third-party templates'],
          quiz: [
            ['What does {{ block.super }} output?', 'The content of the parent block being overridden.'],
            ['Which wins: a project DIRS template or an app template with the same path?', 'DIRS, because the filesystem loader is listed first.'],
          ],
          prereqs: ['Django template language'],
        },
        {
          title: 'Custom template tags and filters',
          description: 'Registering filters and simple_tag or inclusion_tag functions in a templatetags package, loading them with {% load %}, and context processors that inject values into every template render.',
          concepts: ['The templatetags package', 'Custom filters', 'simple_tag and inclusion_tag', 'Context processors'],
          quiz: [
            ['Why must templatetags contain __init__.py?', 'Django imports it as a Python package to find the registered library.'],
            ['What does an inclusion_tag return?', 'A context dict rendered with its own template.'],
          ],
          prereqs: ['Template inheritance and inclusion'],
        },
        {
          title: 'Static files and media uploads',
          description: 'STATIC_URL and STATICFILES_DIRS for CSS and JS, the {% static %} tag, collectstatic gathering into STATIC_ROOT, and MEDIA_ROOT/MEDIA_URL for user uploads, which the dev server serves only with DEBUG on.',
          concepts: ['STATIC_URL and STATICFILES_DIRS', 'The static template tag', 'collectstatic and STATIC_ROOT', 'MEDIA_ROOT and serving uploads'],
          quiz: [
            ['Does runserver serve MEDIA files in production settings?', 'No, static and media serving in runserver is tied to DEBUG=True.'],
            ['What does collectstatic do?', 'Copies every static file from apps and STATICFILES_DIRS into STATIC_ROOT for the web server.'],
          ],
        },
      ],
    },
    {
      title: 'ORM: Models and Migrations',
      topics: [
        {
          title: 'Defining models and fields',
          description: 'Model classes mapping to tables: field types, null versus blank, default and choices, unique and db_index, the Meta class (ordering, verbose_name, indexes, constraints) and __str__ for the admin and shell.',
          concepts: ['Field types and options', 'null versus blank', 'choices and TextChoices', 'Meta: ordering, indexes, constraints'],
          quiz: [
            ['Difference between null=True and blank=True?', 'null allows NULL in the database; blank allows empty values in forms and validation.'],
            ['How do you enforce that price is non-negative in the database?', 'A CheckConstraint in Meta.constraints.'],
          ],
        },
        {
          title: 'Migrations',
          description: 'makemigrations diffs models against the migration history and writes operation files; migrate applies them and records the state in django_migrations. Dependencies, showmigrations, sqlmigrate, --fake and squashing old chains.',
          concepts: ['makemigrations and migrate', 'Migration files and operations', 'showmigrations and sqlmigrate', 'Faking and squashing migrations'],
          quiz: [
            ['Where does Django record which migrations ran?', 'The django_migrations table.'],
            ['What does --fake do?', 'Marks a migration as applied without running its SQL.'],
          ],
          prereqs: ['Defining models and fields'],
        },
        {
          title: 'Data migrations and risky schema changes',
          description: 'RunPython with apps.get_model for historical models, writing reverse functions, adding a NOT NULL column to a populated table in two steps, renaming fields safely, and why long-running migrations lock tables in production.',
          concepts: ['RunPython and historical models', 'Reversible data migrations', 'Adding non-null columns safely', 'Locks and long migrations'],
          quiz: [
            ['Why use apps.get_model inside RunPython instead of importing the model?', 'The historical model matches the schema at that migration point.'],
            ['How do you add a required column to a big table?', 'Add it nullable with a default, backfill, then alter to NOT NULL.'],
          ],
          prereqs: ['Migrations'],
        },
        {
          title: 'Model relationships',
          description: 'ForeignKey with on_delete choices, OneToOneField for extensions, ManyToManyField with a through model for extra columns, related_name and the reverse accessors Django generates.',
          concepts: ['ForeignKey and on_delete', 'OneToOneField extensions', 'ManyToManyField and through models', 'related_name and reverse managers'],
          quiz: [
            ['What does on_delete=models.PROTECT do?', 'Raises ProtectedError instead of deleting rows that are still referenced.'],
            ['What is the default reverse accessor for a ForeignKey from Comment to Post?', 'post.comment_set.'],
          ],
          prereqs: ['Defining models and fields'],
        },
        {
          title: 'Model inheritance and custom managers',
          description: 'Abstract base classes for shared fields, multi-table inheritance and its hidden join, proxy models for behaviour only, and custom Manager and QuerySet classes that name common filters like Post.objects.published().',
          concepts: ['Abstract base models', 'Multi-table and proxy models', 'Custom Manager classes', 'QuerySet.as_manager and chaining'],
          quiz: [
            ['Why prefer abstract over multi-table inheritance?', 'Abstract adds no extra table or join; multi-table joins on every query.'],
            ['How do you make custom queryset methods chainable?', 'Define them on a QuerySet subclass and expose it via as_manager().'],
          ],
          prereqs: ['Model relationships'],
        },
      ],
    },
    {
      title: 'ORM: Querying and Performance',
      topics: [
        {
          title: 'QuerySets and lazy evaluation',
          description: 'filter, exclude, get, order_by and slicing build SQL without running it; evaluation happens on iteration, len, list or bool. Result caching, exists() and count() versus len(), and iterator() for huge result sets.',
          concepts: ['filter, exclude and get', 'When a QuerySet hits the database', 'Result cache behaviour', 'exists, count and iterator'],
          quiz: [
            ['Does Post.objects.filter(published=True) run SQL?', 'No, not until it is iterated, sliced with a step, or evaluated.'],
            ['Why is if qs.exists() better than if qs?', 'exists() runs a cheap LIMIT 1 query instead of fetching all rows.'],
          ],
          prereqs: ['Model inheritance and custom managers'],
        },
        {
          title: 'Field lookups, Q and F expressions',
          description: 'Double-underscore lookups (icontains, gte, in, date, isnull) across relationships, Q objects for OR and NOT, and F expressions that reference columns for comparisons and atomic updates like stock=F("stock")-1.',
          concepts: ['Double-underscore lookups', 'Lookups across relationships', 'Q objects for OR and NOT', 'F expressions and atomic updates'],
          quiz: [
            ['How do you filter comments by post author name?', 'Comment.objects.filter(post__author__name="Ada").'],
            ['Why use F("views") + 1 instead of reading and saving?', 'The increment runs in SQL, avoiding a race between concurrent requests.'],
          ],
          prereqs: ['QuerySets and lazy evaluation'],
        },
        {
          title: 'Aggregation and annotation',
          description: 'aggregate for one summary row, annotate for per-object values with Count, Sum, Avg and Max, values() to group before annotating, conditional aggregates with Case/When, and Subquery with OuterRef for correlated lookups.',
          concepts: ['aggregate versus annotate', 'values() as GROUP BY', 'Case, When and conditional counts', 'Subquery and OuterRef'],
          quiz: [
            ['What does Post.objects.annotate(n=Count("comments")) add?', 'An n attribute on each post with its comment count.'],
            ['How do you annotate each author with their latest post date?', 'Subquery(Post.objects.filter(author=OuterRef("pk")).order_by("-created").values("created")[:1]).'],
          ],
          prereqs: ['Field lookups, Q and F expressions'],
        },
        {
          title: 'select_related and prefetch_related',
          description: 'The N+1 problem, select_related for single-valued relations via SQL JOIN, prefetch_related for many-valued relations via a second query, the Prefetch object to filter what is prefetched, and spotting the problem with django-debug-toolbar.',
          concepts: ['The N+1 query problem', 'select_related and JOINs', 'prefetch_related and Prefetch objects', 'Diagnosing with django-debug-toolbar'],
          quiz: [
            ['When must you use prefetch_related rather than select_related?', 'For ManyToMany and reverse ForeignKey relations.'],
            ['What happens if you filter a prefetched relation in a loop?', 'A new query per object; use a Prefetch with a filtered queryset instead.'],
          ],
          prereqs: ['QuerySets and lazy evaluation'],
        },
        {
          title: 'Transactions, locking and raw SQL',
          description: 'transaction.atomic as a decorator and context manager, savepoints on nesting, select_for_update to lock rows, on_commit hooks for side effects, bulk_create and update for fewer queries, and raw() or cursor when the ORM is not enough.',
          concepts: ['transaction.atomic and savepoints', 'select_for_update row locks', 'on_commit hooks', 'bulk_create and bulk_update', 'raw() and connection.cursor()'],
          quiz: [
            ['What happens to an atomic block when an exception escapes?', 'The transaction or savepoint is rolled back.'],
            ['Why run a Celery task in transaction.on_commit?', 'So the worker only sees data after the transaction actually commits.'],
          ],
          prereqs: ['QuerySets and lazy evaluation'],
        },
      ],
    },
    {
      title: 'Forms and Validation',
      topics: [
        {
          title: 'Django forms',
          description: 'Form classes declare fields and widgets; binding request.POST, is_valid() populating cleaned_data and errors, rendering with as_p or field-by-field, and the csrf_token tag every POST form needs.',
          concepts: ['Form fields and widgets', 'Bound versus unbound forms', 'is_valid and cleaned_data', 'Rendering forms and csrf_token'],
          quiz: [
            ['What does form.is_valid() do?', 'Runs field and form cleaning, fills cleaned_data, and collects errors.'],
            ['What does a POST without csrf_token get?', 'A 403 from CsrfViewMiddleware.'],
          ],
        },
        {
          title: 'ModelForm',
          description: 'Generating a form from a model with Meta.model and fields, overriding widgets and labels, save(commit=False) to set extra attributes before persisting, and editing an existing object by passing instance.',
          concepts: ['Meta.model and fields', 'Overriding widgets and labels', 'save(commit=False)', 'Editing with instance'],
          quiz: [
            ['Why is fields="__all__" discouraged?', 'New model fields become editable silently, which can expose data or allow tampering.'],
            ['What does save(commit=False) return?', 'An unsaved model instance you can modify before calling save().'],
          ],
          prereqs: ['Django forms', 'Defining models and fields'],
        },
        {
          title: 'Validation: clean methods and validators',
          description: 'The validation order: field validators, clean_<field> for one field, clean() for cross-field rules, ValidationError with codes and params, non-field errors, and model-level full_clean with validators on fields.',
          concepts: ['Validation order', 'clean_<field> and clean()', 'ValidationError codes and params', 'Model validators and full_clean'],
          quiz: [
            ['Where do you check that end_date is after start_date?', 'In the form clean() method, since it needs both fields.'],
            ['Does Model.save() run field validators?', 'No, only full_clean() or ModelForm validation does.'],
          ],
          prereqs: ['ModelForm'],
        },
        {
          title: 'Formsets and file uploads',
          description: 'formset_factory and inlineformset_factory for editing many rows at once, the management form and extra/max_num, FileField and ImageField with upload_to, request.FILES, and the storage backend that writes the file.',
          concepts: ['formset_factory and management form', 'Inline formsets', 'FileField, ImageField and upload_to', 'request.FILES and storage backends'],
          quiz: [
            ['Why does a formset POST fail with "ManagementForm data is missing"?', 'The hidden TOTAL_FORMS and INITIAL_FORMS inputs were not rendered.'],
            ['What must the form tag include for uploads?', 'enctype="multipart/form-data".'],
          ],
          prereqs: ['ModelForm'],
        },
      ],
    },
    {
      title: 'Admin, Authentication and Middleware',
      topics: [
        {
          title: 'The admin site',
          description: 'Registering models and customising ModelAdmin: list_display, list_filter, search_fields, fieldsets, readonly_fields, inlines for related rows, custom actions, and overriding get_queryset to avoid N+1 in list pages.',
          concepts: ['Registering models', 'ModelAdmin list options', 'Fieldsets and inlines', 'Custom admin actions', 'Optimising admin querysets'],
          quiz: [
            ['How do you show related rows on a parent edit page?', 'A TabularInline or StackedInline in the ModelAdmin inlines list.'],
            ['What does list_select_related do?', 'Adds select_related to the changelist query to avoid N+1 lookups.'],
          ],
          prereqs: ['Model relationships'],
        },
        {
          title: 'User model and authentication',
          description: 'django.contrib.auth: the User model, why a custom AbstractUser should be set as AUTH_USER_MODEL before the first migration, authenticate(), login() and logout(), and password hashing with PBKDF2 or argon2.',
          concepts: ['AbstractUser versus AbstractBaseUser', 'AUTH_USER_MODEL timing', 'authenticate, login and logout', 'Password hashers'],
          quiz: [
            ['Why set AUTH_USER_MODEL before the first migration?', 'Changing it later breaks foreign keys in existing migrations.'],
            ['What does login(request, user) do?', 'Stores the user id and backend in the session and rotates the session key.'],
          ],
          prereqs: ['Defining models and fields'],
        },
        {
          title: 'Auth views, login_required and permissions',
          description: 'Built-in LoginView, LogoutView and password reset views, login_required and LoginRequiredMixin, model permissions with add/change/delete/view, groups, permission_required and has_perm, and object-level checks with django-guardian.',
          concepts: ['Built-in auth views', 'login_required and LoginRequiredMixin', 'Model permissions and groups', 'permission_required and has_perm', 'Object-level permissions'],
          quiz: [
            ['Where does login_required send anonymous users?', 'To settings.LOGIN_URL with a next parameter.'],
            ['What permission string does user.has_perm check for editing Post in app blog?', '"blog.change_post".'],
          ],
          prereqs: ['User model and authentication'],
        },
        {
          title: 'Sessions and cookies',
          description: 'The session middleware stores a key in a cookie and data in a backend (database, cache, cached_db or signed cookies). request.session as a dict, expiry settings, and SESSION_COOKIE_SECURE and HttpOnly flags for production.',
          concepts: ['Session backends', 'request.session usage', 'Expiry and browser-length sessions', 'Secure and HttpOnly cookie flags'],
          quiz: [
            ['What is stored in the session cookie by default?', 'Only the session key; data lives server-side in the backend.'],
            ['Why is the signed_cookies backend risky for secrets?', 'Data is readable by the client, only tamper-proof, not encrypted.'],
          ],
        },
        {
          title: 'Middleware',
          description: 'Middleware wraps every request: the __call__ pattern with get_response, the order of MIDDLEWARE and why SecurityMiddleware is first and CsrfViewMiddleware precedes auth-dependent ones, process_view and process_exception hooks, and writing a request-timing middleware.',
          concepts: ['The get_response pattern', 'Why MIDDLEWARE order matters', 'process_view and process_exception', 'Writing custom middleware'],
          quiz: [
            ['What must SessionMiddleware precede?', 'AuthenticationMiddleware, which reads the session to set request.user.'],
            ['Can middleware short-circuit a request?', 'Yes, by returning an HttpResponse instead of calling get_response.'],
          ],
          prereqs: ['The request-response cycle'],
        },
        {
          title: 'Messages and email',
          description: 'The messages framework for one-time notices across a redirect, and sending email with send_mail and EmailMessage through configurable backends: console in development, SMTP or a provider API in production.',
          concepts: ['messages.add_message levels', 'Rendering messages in templates', 'send_mail and EmailMessage', 'Email backends per environment'],
          quiz: [
            ['How do messages survive a redirect?', 'They are stored in the session or a cookie until the next request renders them.'],
            ['Which EMAIL_BACKEND prints mail to the terminal?', 'django.core.mail.backends.console.EmailBackend.'],
          ],
          prereqs: ['Sessions and cookies'],
        },
      ],
    },
    {
      title: 'Django REST Framework',
      description: 'Building JSON APIs on Django. HTTP semantics and API design live in track-rest-api; this covers the DRF machinery.',
      topics: [
        {
          title: 'Serializers and ModelSerializer',
          description: 'Serializers convert model instances to primitives and validate incoming data: declared fields, ModelSerializer with Meta.fields, read_only and write_only, validate_<field> and validate(), and overriding create and update.',
          concepts: ['Serializer fields and Meta', 'read_only and write_only fields', 'Serializer validation hooks', 'Overriding create and update'],
          quiz: [
            ['What does serializer.is_valid(raise_exception=True) do on bad data?', 'Raises ValidationError, which DRF turns into a 400 with field errors.'],
            ['Where is serializer.validated_data available?', 'Only after is_valid() returns True.'],
          ],
          prereqs: ['Defining models and fields'],
        },
        {
          title: 'APIView, generic views and ViewSets',
          description: 'APIView with Request and Response objects, GenericAPIView plus mixins for the common CRUD shapes, ModelViewSet, DefaultRouter generating URL patterns, and @action for custom endpoints on a viewset.',
          concepts: ['APIView and Request objects', 'GenericAPIView and mixins', 'ModelViewSet and routers', 'Custom actions with @action'],
          quiz: [
            ['What URLs does DefaultRouter register for a ModelViewSet at "posts"?', 'posts/ for list and create, posts/<pk>/ for retrieve, update and destroy.'],
            ['What does @action(detail=True, methods=["post"]) create?', 'A sub-route on a single object such as posts/<pk>/publish/.'],
          ],
          prereqs: ['Serializers and ModelSerializer'],
        },
        {
          title: 'DRF authentication and permissions',
          description: 'Authentication classes (Session, Token, JWT via djangorestframework-simplejwt) set request.user; permission classes such as IsAuthenticated and IsAdminUser gate access; custom permissions implement has_permission and has_object_permission.',
          concepts: ['Authentication classes', 'JWT with simplejwt', 'Built-in permission classes', 'Custom object permissions'],
          quiz: [
            ['When does has_object_permission run?', 'When a view calls get_object(), so not on list or create.'],
            ['Why does SessionAuthentication enforce CSRF?', 'Because a logged-in browser could be made to send requests by another site.'],
          ],
          prereqs: ['APIView, generic views and ViewSets', 'Auth views, login_required and permissions'],
        },
        {
          title: 'Pagination, filtering and throttling',
          description: 'PageNumber, LimitOffset and Cursor pagination and when cursors beat offsets, django-filter FilterSet integration, SearchFilter and OrderingFilter, and throttle classes to rate-limit anonymous and authenticated clients.',
          concepts: ['Pagination classes', 'django-filter FilterSets', 'SearchFilter and OrderingFilter', 'Throttle classes and scopes'],
          quiz: [
            ['Why choose CursorPagination for a feed?', 'It stays stable when rows are inserted and avoids slow large OFFSETs.'],
            ['What does DEFAULT_THROTTLE_RATES "user": "1000/day" mean?', 'Each authenticated user may make 1000 requests per day before getting 429.'],
          ],
          prereqs: ['APIView, generic views and ViewSets'],
        },
        {
          title: 'Serializer relationships and nested writes',
          description: 'PrimaryKeyRelatedField, SlugRelatedField, StringRelatedField and nested serializers for reads; why nested writes need explicit create and update; and matching get_queryset with select_related and prefetch_related to the serializer shape.',
          concepts: ['Related field types', 'Nested serializers for reads', 'Implementing nested writes', 'Prefetching to match the serializer'],
          quiz: [
            ['Does ModelSerializer support writable nested serializers by default?', 'No, you must implement create and update yourself.'],
            ['How do you avoid N+1 when a serializer includes comments?', 'prefetch_related("comments") in the view queryset.'],
          ],
          prereqs: ['Serializers and ModelSerializer', 'select_related and prefetch_related'],
        },
        {
          title: 'OpenAPI schema, versioning and error handling',
          description: 'Generating an OpenAPI document with drf-spectacular and its Swagger UI, versioning schemes (URL path, header, namespace), renderer and parser classes, and a custom exception handler for a consistent error envelope.',
          concepts: ['drf-spectacular schema generation', 'Versioning schemes', 'Renderers and parsers', 'Custom exception handler'],
          quiz: [
            ['How do you document a custom action response in drf-spectacular?', 'The @extend_schema decorator with a responses mapping.'],
            ['Where is a custom exception handler registered?', 'REST_FRAMEWORK["EXCEPTION_HANDLER"] in settings.'],
          ],
          prereqs: ['APIView, generic views and ViewSets'],
        },
      ],
    },
    {
      title: 'Signals, Caching, Async and Tasks',
      topics: [
        {
          title: 'Signals',
          description: 'pre_save, post_save, post_delete and m2m_changed let code react to model events; connecting with @receiver in a signals module imported from AppConfig.ready(), and the pitfalls: hidden coupling, and bulk_create and update() never firing them.',
          concepts: ['Built-in model signals', 'Connecting receivers in ready()', 'Signals and bulk operations', 'When to avoid signals'],
          quiz: [
            ['Does QuerySet.update() send post_save?', 'No, only instance.save() does.'],
            ['Why import signals in AppConfig.ready()?', 'To guarantee receivers are connected once the app registry is loaded.'],
          ],
          prereqs: ['Projects versus apps', 'Model relationships'],
        },
        {
          title: 'Caching',
          description: 'The cache framework with Redis, memcached or locmem backends, the low-level cache.get/set API, per-view caching with cache_page, template fragment caching, and the hard part: choosing keys and invalidating on writes.',
          concepts: ['Cache backends and CACHES setting', 'Low-level cache API', 'cache_page and fragment caching', 'Key design and invalidation'],
          quiz: [
            ['What does cache.get_or_set(key, fn, 300) do?', 'Returns the cached value or computes, stores it for 300 seconds and returns it.'],
            ['Why is cache_page risky on pages with user-specific content?', 'One user\'s rendered page can be served to another.'],
          ],
        },
        {
          title: 'Async views and the async ORM',
          description: 'async def views served under ASGI, sync_to_async and async_to_sync for crossing boundaries, the async ORM methods (aget, acreate, async for on querysets), and why a blocking call inside an async view stalls the worker.',
          concepts: ['async def views under ASGI', 'sync_to_async and async_to_sync', 'Async ORM methods', 'Blocking calls in async code'],
          quiz: [
            ['What happens to an async view under WSGI?', 'Django runs it synchronously through async_to_sync, losing the benefit.'],
            ['How do you fetch one object asynchronously?', 'await Post.objects.aget(pk=1).'],
          ],
          prereqs: ['Function-based views', 'QuerySets and lazy evaluation'],
        },
        {
          title: 'Background tasks with Celery',
          description: 'Offloading slow work: a Celery app configured from settings, shared_task functions, Redis or RabbitMQ brokers, periodic jobs with beat, storing results, and triggering tasks in transaction.on_commit so workers never see uncommitted rows.',
          concepts: ['Celery app and shared_task', 'Brokers and result backends', 'Periodic tasks with beat', 'Passing ids, not instances', 'Retries and idempotent tasks'],
          quiz: [
            ['Why pass an object id to a task instead of the object?', 'Arguments are serialised as JSON and the worker should load fresh data.'],
            ['What does task.delay() do?', 'Sends the task message to the broker and returns an AsyncResult.'],
          ],
          prereqs: ['Transactions, locking and raw SQL'],
        },
        {
          title: 'Management commands',
          description: 'Custom manage.py commands in management/commands: BaseCommand with add_arguments and handle, self.stdout for output, exit codes via CommandError, and using them for cron jobs, imports and one-off maintenance.',
          concepts: ['BaseCommand and handle', 'add_arguments and options', 'stdout, style and CommandError', 'Commands as cron entry points'],
          quiz: [
            ['Where must a command file live to be discovered?', '<app>/management/commands/<name>.py.'],
            ['How do you signal failure from a command?', 'Raise CommandError, which prints the message and exits non-zero.'],
          ],
          prereqs: ['Projects versus apps'],
        },
      ],
    },
    {
      title: 'Testing',
      topics: [
        {
          title: 'TestCase and the test client',
          description: 'django.test.TestCase wraps each test in a transaction against a throwaway test database; the Client makes requests through the full stack; assertContains, assertRedirects and assertTemplateUsed check responses.',
          concepts: ['Test database and transactions', 'The test Client', 'Response assertions', 'TestCase versus TransactionTestCase'],
          quiz: [
            ['Why is TestCase faster than TransactionTestCase?', 'It rolls back a transaction per test instead of truncating tables.'],
            ['What does client.force_login(user) avoid?', 'Posting credentials to the login view in every test.'],
          ],
        },
        {
          title: 'Fixtures, factories and test data',
          description: 'setUpTestData for shared rows created once per class, JSON fixtures and their drawbacks, factory_boy factories with Faker for realistic objects, and keeping tests independent of ordering.',
          concepts: ['setUpTestData', 'JSON fixtures and loaddata', 'factory_boy and Faker', 'Independent, order-free tests'],
          quiz: [
            ['Why prefer factories over JSON fixtures?', 'They track model changes and build only what a test needs.'],
            ['When does setUpTestData run?', 'Once per TestCase class, with objects rolled back after the class.'],
          ],
          prereqs: ['TestCase and the test client'],
        },
        {
          title: 'pytest-django',
          description: 'Running Django tests with pytest: DJANGO_SETTINGS_MODULE in pytest.ini, the db and transactional_db marks, client, admin_client and settings fixtures, --reuse-db for speed, and parametrised tests.',
          concepts: ['pytest.ini and settings module', 'The db mark', 'client, admin_client and settings fixtures', 'reuse-db and parallel runs'],
          quiz: [
            ['What happens if a test touches the database without the db mark?', 'pytest-django raises an error blocking database access.'],
            ['What does the settings fixture let you do?', 'Override a setting for one test and restore it afterwards.'],
          ],
          prereqs: ['TestCase and the test client'],
        },
        {
          title: 'Testing APIs and query counts',
          description: 'APIClient and force_authenticate for DRF endpoints, asserting status codes and JSON bodies, assertNumQueries to catch N+1 regressions, testing permissions from several roles, and mocking outbound HTTP with responses or respx.',
          concepts: ['APIClient and force_authenticate', 'Asserting JSON responses', 'assertNumQueries', 'Mocking external services'],
          quiz: [
            ['What does assertNumQueries(2) fail on?', 'Any block that runs more or fewer than exactly two SQL queries.'],
            ['Why test an endpoint as an anonymous user too?', 'To prove the permission classes actually deny access.'],
          ],
          prereqs: ['pytest-django', 'DRF authentication and permissions'],
        },
      ],
    },
    {
      title: 'Security and Deployment',
      description: 'Shipping Django safely. Vulnerability classes are covered in track-web-security; here it is the Django-specific settings and infrastructure.',
      topics: [
        {
          title: 'Django security settings',
          description: 'What the built-ins protect against and how to turn them fully on: CsrfViewMiddleware, SECURE_SSL_REDIRECT and HSTS settings, X_FRAME_OPTIONS, secure cookie flags, a Content-Security-Policy via django-csp, and manage.py check --deploy.',
          concepts: ['CSRF protection in Django', 'SECURE_* and HSTS settings', 'Clickjacking and CSP headers', 'check --deploy'],
          quiz: [
            ['What does manage.py check --deploy report?', 'Insecure production settings such as DEBUG=True or missing SECURE_HSTS_SECONDS.'],
            ['How does a JavaScript client pass the CSRF token?', 'In the X-CSRFToken header read from the csrftoken cookie.'],
          ],
          prereqs: ['Middleware'],
        },
        {
          title: 'Production settings and logging',
          description: 'DEBUG off with ALLOWED_HOSTS set, secrets from the environment, DATABASE_URL parsing, the LOGGING dict with handlers for stdout and error reporting, and Sentry integration so exceptions are seen, not lost.',
          concepts: ['Production settings checklist', 'LOGGING dictConfig', 'Structured logs to stdout', 'Sentry error reporting'],
          quiz: [
            ['What does Django do with unhandled exceptions when DEBUG is False?', 'Returns a plain 500 and logs to django.request; ADMINS may be emailed.'],
            ['Why log to stdout in containers?', 'The platform collects stdout; files inside a container are lost.'],
          ],
          prereqs: ['The settings module'],
        },
        {
          title: 'Serving with gunicorn or uvicorn',
          description: 'gunicorn running the WSGI app with sync workers sized to CPUs, uvicorn workers for ASGI, timeouts and graceful restarts, why runserver is never for production, and putting nginx or a load balancer in front.',
          concepts: ['gunicorn workers and timeouts', 'uvicorn and ASGI workers', 'Reverse proxy in front', 'Why not runserver'],
          quiz: [
            ['How many gunicorn sync workers is a common starting point?', 'About 2 x CPU cores + 1.'],
            ['Which command serves the ASGI app with gunicorn?', 'gunicorn project.asgi:application -k uvicorn.workers.UvicornWorker.'],
          ],
          prereqs: ['Production settings and logging'],
        },
        {
          title: 'Static files, media and databases in production',
          description: 'collectstatic plus WhiteNoise for hashed static files, django-storages with S3 for media, PostgreSQL with psycopg, CONN_MAX_AGE and connection pooling, and running migrate before the new code takes traffic.',
          concepts: ['WhiteNoise and hashed static files', 'django-storages for media', 'PostgreSQL and CONN_MAX_AGE', 'Migrations in the release step'],
          quiz: [
            ['What does ManifestStaticFilesStorage change?', 'File names get content hashes so they can be cached forever.'],
            ['Why not store uploads on the app server disk?', 'Multiple instances and redeploys would lose or split the files.'],
          ],
          prereqs: ['Static files and media uploads'],
        },
        {
          title: 'Docker and deployment pipeline',
          description: 'A multi-stage Dockerfile that installs dependencies and runs collectstatic, compose with PostgreSQL and Redis for local parity, an entrypoint that waits for the database, health-check endpoints, and zero-downtime migration ordering. Docker itself is covered in track-docker.',
          concepts: ['Dockerfile for a Django app', 'Compose with Postgres and Redis', 'Entrypoint and migrate ordering', 'Health checks and rollbacks'],
          quiz: [
            ['Why run collectstatic in the image build?', 'So the image is immutable and static files are ready without a runtime step.'],
            ['What makes a migration safe for zero downtime?', 'Old code must keep working against the new schema during rollout.'],
          ],
          prereqs: ['Serving with gunicorn or uvicorn'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: blog with accounts and comments',
          description: 'Build a multi-user blog: custom user model, posts with slugs and tags, Markdown rendering, comments with moderation, class-based views, the admin configured for editors, and tests for permissions and N+1 counts.',
          concepts: ['Model users, posts, tags and comments', 'Views, templates and forms', 'Admin for editors', 'Tests with query-count checks'],
          quiz: [
            ['How do you keep post list pages to a fixed query count?', 'prefetch_related for tags and annotate for comment counts.'],
            ['Why a custom user model from day one?', 'Switching later requires painful migration surgery.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce API with DRF',
          description: 'Build a product catalogue and order API: ModelViewSets, JWT auth, django-filter search, cursor pagination, an order checkout inside transaction.atomic with select_for_update on stock, Celery for confirmation emails, and a drf-spectacular schema.',
          concepts: ['Catalogue and order models', 'ViewSets, filters and pagination', 'Checkout with locking', 'Async email via Celery', 'Schema and API tests'],
          quiz: [
            ['How do you prevent overselling stock under concurrency?', 'select_for_update the product rows inside atomic before decrementing.'],
            ['When should the email task be enqueued?', 'In transaction.on_commit after the order commits.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: SaaS dashboard with teams and billing',
          description: 'Build a multi-tenant app: organisations and memberships with role-based permissions, invitations by email, per-organisation data isolation enforced in querysets, Redis caching for dashboards, and a Stripe webhook handled idempotently.',
          concepts: ['Organisations, roles and invitations', 'Tenant scoping in managers', 'Cached dashboard queries', 'Idempotent webhook handling'],
          quiz: [
            ['Where should tenant filtering live?', 'In a custom manager or queryset method every view uses, not in each view.'],
            ['Why store processed webhook event ids?', 'Providers retry deliveries; duplicates must be ignored.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: production deployment of a Django service',
          description: 'Take an app to production: split settings, Dockerfile and compose, gunicorn behind nginx, WhiteNoise and S3 media, PostgreSQL with backups, migrations in the release step, Sentry, a health endpoint and a CI pipeline running tests and check --deploy.',
          concepts: ['Environment-driven settings', 'Container build and compose', 'Release step with migrations', 'Monitoring and backups'],
          quiz: [
            ['What should CI run besides tests?', 'makemigrations --check and manage.py check --deploy.'],
            ['Why keep a health endpoint cheap?', 'Load balancers poll it constantly; a database hit per poll adds load.'],
          ],
          style: 'project',
        },
        {
          title: 'Django interview questions',
          description: 'The recurring questions: request lifecycle and middleware order, select_related versus prefetch_related, how migrations work, CSRF in Django, signals versus explicit calls, the ORM lazy model, and FBV versus CBV trade-offs.',
          concepts: ['Lifecycle and middleware questions', 'ORM and performance questions', 'Security and auth questions', 'Design trade-off questions'],
          quiz: [
            ['Explain the difference between select_related and prefetch_related.', 'select_related JOINs single-valued relations; prefetch_related runs a second query for many-valued ones.'],
            ['Why is Django CSRF protection cookie plus token?', 'The attacker site cannot read the cookie, so it cannot supply the matching token.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live-coding a Django feature',
          description: 'Practising the typical take-home or pairing task: add a model with a migration, expose it in a view or DRF endpoint, write the form or serializer validation, and cover it with tests, all within an hour and with clean queries.',
          concepts: ['Scoping the feature quickly', 'Model, migration and endpoint', 'Validation and edge cases', 'Tests that prove it works'],
          quiz: [
            ['What do you write first in a timed task?', 'The model and migration, then a failing test for the endpoint.'],
            ['How do you show query awareness in a live task?', 'Use select_related or prefetch_related and mention assertNumQueries.'],
          ],
        },
      ],
    },
  ],
})
