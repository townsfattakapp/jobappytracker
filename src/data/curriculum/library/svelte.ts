import { defineTrack } from '../define'

export const svelte = defineTrack({
  id: 'track-svelte',
  title: 'Svelte and SvelteKit',
  description: 'Svelte 5 with runes, snippets, transitions and actions, then SvelteKit for routing, layouts, load functions, form actions, server endpoints, rendering modes, authentication, testing and deployment, ending in real projects and interview practice.',
  family: 'Frontend & Web',
  kind: 'framework',
  icon: '🔥',
  tags: ['svelte', 'sveltekit', 'runes', 'typescript', 'frontend', 'ssr', 'vite'],
  languages: ['TypeScript'],
  explainMode: 'react',
  code: { label: 'TypeScript with Svelte', id: 'typescript', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-js'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started',
      description: 'Creating a project and reading a .svelte file before touching reactivity.',
      topics: [
        {
          title: 'Creating a project with sv create',
          description: 'npx sv create scaffolds a SvelteKit or minimal Svelte app on Vite with TypeScript, ESLint, Prettier, Vitest and Playwright as opt-in add-ons; knowing what each generated file does saves guesswork later.',
          concepts: ['npx sv create and add-ons', 'Vite dev server and HMR', 'svelte.config.js and vite.config.ts', 'The sv CLI for adding tooling'],
          quiz: [
            ['Which command scaffolds a new Svelte project?', 'npx sv create my-app.'],
            ['What does svelte.config.js configure?', 'The Svelte compiler and SvelteKit options such as the adapter and preprocessors.'],
          ],
        },
        {
          title: 'Anatomy of a .svelte file',
          description: 'A component is a script block, markup and a style block; the compiler turns it into imperative DOM code at build time, which is why Svelte ships no virtual DOM and small bundles.',
          concepts: ['script, markup and style blocks', 'Compile-time components', 'lang="ts" in script', 'Expressions in markup'],
          quiz: [
            ['Where does Svelte do most of its work?', 'At compile time, generating DOM update code.'],
            ['How do you enable TypeScript in a component?', '<script lang="ts">.'],
          ],
          prereqs: ['Creating a project with sv create'],
        },
        {
          title: 'Svelte 5 versus Svelte 4 and legacy mode',
          description: 'Svelte 5 replaces implicit reactivity ($: and top-level let) with explicit runes, replaces on:click with onclick and slots with snippets, and keeps a legacy mode so older components still compile during migration.',
          concepts: ['Runes replace $: and let', 'Event attributes replace on: directives', 'Snippets replace slots', 'Runes mode versus legacy mode', 'The sv migrate tool'],
          quiz: [
            ['What triggers runes mode in a component?', 'Using any rune such as $state or $props.'],
            ['How do you migrate a Svelte 4 codebase?', 'npx sv migrate svelte-5, then fix the remaining warnings.'],
          ],
          prereqs: ['Anatomy of a .svelte file'],
        },
      ],
    },
    {
      title: 'Runes and Reactivity',
      description: 'The explicit reactivity primitives that drive Svelte 5.',
      topics: [
        {
          title: '$state and deep reactivity',
          description: '$state declares reactive variables; objects and arrays become deeply reactive proxies so pushing to an array or setting a nested field updates the DOM, and $state.raw opts out for large immutable data.',
          concepts: ['$state for primitives', 'Deep reactive proxies', '$state.raw for immutable values', '$state.snapshot for plain copies', 'Reactive class fields'],
          quiz: [
            ['Does items.push(x) update the UI when items is $state([])?', 'Yes, arrays declared with $state are deeply reactive proxies.'],
            ['When would you use $state.raw?', 'For large objects replaced wholesale where per-property tracking is wasted.'],
          ],
          prereqs: ['Anatomy of a .svelte file'],
        },
        {
          title: '$derived and $derived.by',
          description: '$derived computes a value from other reactive state, recalculating lazily and only when dependencies change; $derived.by takes a function body for multi-statement derivations, and derived values must not be assigned.',
          concepts: ['$derived expressions', '$derived.by for complex logic', 'Dependency tracking at read time', 'Avoiding derived writes'],
          quiz: [
            ['When does a $derived value recompute?', 'On read, after any dependency it accessed has changed.'],
            ['Why not compute totals inside $effect and store them in $state?', 'It causes extra renders and stale reads; $derived is synchronous and glitch-free.'],
          ],
          prereqs: ['$state and deep reactivity'],
        },
        {
          title: '$effect, $effect.pre and cleanup',
          description: '$effect runs after the DOM updates whenever the reactive values it read change, returns a cleanup function, and $effect.pre runs before DOM updates; untrack excludes reads from tracking, and effects are for syncing with the outside world, not deriving state.',
          concepts: ['$effect timing and dependencies', 'Returning a cleanup function', '$effect.pre before DOM updates', 'untrack to skip dependencies', 'Effects versus derived values'],
          quiz: [
            ['When does the cleanup returned from $effect run?', 'Before the effect reruns and when the component is destroyed.'],
            ['Are dependencies of an $effect declared explicitly?', 'No, they are tracked from what the effect reads synchronously.'],
          ],
          prereqs: ['$derived and $derived.by'],
        },
        {
          title: '$props and $bindable',
          description: 'Components receive props by destructuring $props() with defaults and rest spreads, TypeScript types them through the destructuring pattern, and $bindable marks a prop the parent may bind to with bind:.',
          concepts: ['Destructuring $props with defaults', 'Typing props', 'Rest props and spreading', '$bindable two-way props', 'children as a prop'],
          quiz: [
            ['How do you give a prop a default value?', 'let { size = "md" } = $props().'],
            ['What does $bindable() enable?', 'The parent can use bind:propName so writes in the child flow back up.'],
          ],
          prereqs: ['$state and deep reactivity'],
        },
        {
          title: 'How signals power Svelte reactivity',
          description: 'Runes compile to fine-grained signals: each $state is a source, $derived a memo, $effect a subscriber, and updates are batched into a microtask, so only the DOM nodes that read a value are touched; $inspect helps watch changes during development.',
          concepts: ['Sources, deriveds and effects', 'Fine-grained DOM updates', 'Batched updates and await tick', '$inspect for debugging'],
          quiz: [
            ['What does tick() resolve?', 'A promise that settles after pending state changes have been applied to the DOM.'],
            ['What does $inspect(value) do in production?', 'Nothing; it is stripped from production builds.'],
          ],
          prereqs: ['$effect, $effect.pre and cleanup'],
        },
      ],
    },
    {
      title: 'Components and Templates',
      description: 'Template logic, events, snippets, bindings, lifecycle and styling.',
      topics: [
        {
          title: 'Template logic: {#if}, {#each}, {#await} and {#key}',
          description: 'Control flow lives in the markup: {#if} with {:else if}, {#each} with a keyed expression and {:else}, {#await} for promises with pending and catch branches, and {#key} to recreate a block when a value changes.',
          concepts: ['{#if} and {:else if}', 'Keyed {#each} blocks', '{#await} with then and catch', '{#key} to force remounts'],
          quiz: [
            ['Why add a key to an {#each} block?', 'So items are matched by identity and moved rather than recreated or mixed up.'],
            ['How does {#key value} behave?', 'It destroys and recreates its contents whenever value changes.'],
          ],
          prereqs: ['$state and deep reactivity'],
        },
        {
          title: 'Events and callback props',
          description: 'DOM events are plain attributes such as onclick={handler}; components communicate upward through callback props instead of createEventDispatcher, and event modifiers become ordinary JavaScript in the handler.',
          concepts: ['onclick and other event attributes', 'Callback props for child to parent', 'preventDefault in handlers', 'Event delegation and bubbling notes'],
          quiz: [
            ['How does a child notify a parent in Svelte 5?', 'It calls a callback prop such as onselect(item).'],
            ['What replaced on:click|preventDefault?', 'onclick={(e) => { e.preventDefault(); ... }}.'],
          ],
          prereqs: ['$props and $bindable'],
        },
        {
          title: 'Snippets and {@render}',
          description: 'Snippets are reusable chunks of markup with parameters defined by {#snippet name(args)} and rendered with {@render name(args)}; passed as props they replace slots, and children is the implicit snippet for wrapped content.',
          concepts: ['{#snippet} definitions', '{@render} with arguments', 'Snippets as props', 'The children snippet', 'Typing snippets with Snippet'],
          quiz: [
            ['How does a component render whatever was placed between its tags?', '{@render children?.()}.'],
            ['Can a snippet take parameters?', 'Yes, {#snippet row(item)} and {@render row(item)}.'],
          ],
          prereqs: ['Events and callback props'],
        },
        {
          title: 'Bindings: bind:value, bind:group and bind:this',
          description: 'bind: keeps inputs and state in sync in both directions: value for text and select, checked and group for checkboxes and radios, files for uploads, this for element references and dimension bindings such as clientWidth.',
          concepts: ['bind:value on inputs and selects', 'bind:checked and bind:group', 'bind:this for element refs', 'Dimension and media bindings', 'Binding component props'],
          quiz: [
            ['How do you collect selected radio buttons into one variable?', 'bind:group={selected} on each radio.'],
            ['What does bind:this give you?', 'A reference to the DOM element or component instance.'],
          ],
          prereqs: ['$state and deep reactivity'],
        },
        {
          title: 'Lifecycle: onMount, tick and effects',
          description: 'onMount runs once in the browser after the component is in the DOM and can return a cleanup, tick awaits pending DOM updates, and $effect covers most cases that beforeUpdate and afterUpdate used to handle.',
          concepts: ['onMount and its cleanup', 'onDestroy', 'tick after state changes', 'Replacing beforeUpdate and afterUpdate'],
          quiz: [
            ['Does onMount run during server-side rendering?', 'No, only in the browser.'],
            ['How do you measure an element right after it renders?', 'Await tick() after the state change, or read it inside an $effect.'],
          ],
          prereqs: ['$effect, $effect.pre and cleanup'],
        },
        {
          title: 'Styling: scoped CSS, :global and class directives',
          description: 'Styles in a component are scoped by a generated class, :global() escapes scoping, class={{ active }} and class:name toggle classes, style: sets inline properties, and CSS custom properties pass theme values into children.',
          concepts: ['Scoped styles by hashed class', ':global() escapes', 'Conditional classes', 'style: directive', 'CSS custom properties on components'],
          quiz: [
            ['Why does a selector for a child component element not apply?', 'Scoping only covers markup in the same file; use :global() or pass a class.'],
            ['How do you toggle a class based on state?', 'class:active={isActive} or class={{ active: isActive }}.'],
          ],
          prereqs: ['Anatomy of a .svelte file'],
        },
      ],
    },
    {
      title: 'Shared State and Stores',
      description: 'State that lives outside a single component.',
      topics: [
        {
          title: 'Shared state in .svelte.ts modules',
          description: 'Runes work in .svelte.js and .svelte.ts files, so a module can export $state objects or functions that close over them; exported state must be an object or accessed through functions because primitives cannot be reassigned across modules.',
          concepts: ['Runes in .svelte.ts files', 'Exporting reactive objects', 'Getter functions for primitives', 'Server versus client module state'],
          quiz: [
            ['Why can a module not export a bare $state primitive for others to reassign?', 'Imports are read-only bindings; export an object or a function instead.'],
            ['What is the danger of module-level state on the server?', 'It is shared across requests and users.'],
          ],
          prereqs: ['$state and deep reactivity'],
        },
        {
          title: 'Context with setContext and getContext',
          description: 'Context passes values down the component tree without prop drilling: setContext in a parent during initialisation, getContext in any descendant, typically holding a reactive object created with $state.',
          concepts: ['setContext during init', 'getContext in descendants', 'Reactive objects in context', 'Typed context keys'],
          quiz: [
            ['When must setContext be called?', 'During component initialisation, not inside an event handler or effect.'],
            ['How do you make context values reactive?', 'Store a $state object and read its properties.'],
          ],
          prereqs: ['Shared state in .svelte.ts modules'],
        },
        {
          title: 'Stores: writable, readable and derived',
          description: 'svelte/store still ships writable, readable and derived stores with subscribe, and the $store prefix auto-subscribes in components; they remain useful for streams and libraries, while runes cover most component state.',
          concepts: ['writable and readable stores', 'derived stores', 'The $store auto-subscription', 'Custom stores with methods', 'Stores versus runes'],
          quiz: [
            ['What does $count do in a component?', 'Subscribes to the count store and unsubscribes on destroy.'],
            ['When do stores still make sense in Svelte 5?', 'For async or event streams and interop with libraries built on the store contract.'],
          ],
          prereqs: ['Shared state in .svelte.ts modules'],
        },
      ],
    },
    {
      title: 'Motion and Actions',
      description: 'Built-in transitions and animations, plus actions for direct DOM integration.',
      topics: [
        {
          title: 'Transitions: fade, fly, slide and custom',
          description: 'transition:, in: and out: directives animate elements entering and leaving; svelte/transition ships fade, fly, slide, scale, blur and draw, easing functions tune them, and a custom transition returns css or tick functions.',
          concepts: ['transition:, in: and out:', 'Built-in transition functions', 'Easing from svelte/easing', 'Custom transition functions', 'Local versus global transitions'],
          quiz: [
            ['What does transition:fly={{ y: 20 }} do?', 'Animates the element in and out along a 20px vertical offset.'],
            ['How does a custom transition define its animation?', 'By returning an object with duration and a css or tick function.'],
          ],
          prereqs: ['Template logic: {#if}, {#each}, {#await} and {#key}'],
        },
        {
          title: 'Animations with animate:flip and crossfade',
          description: 'animate:flip smoothly moves keyed {#each} items when they reorder using the FLIP technique, and crossfade pairs send and receive transitions so an item appears to move between two lists.',
          concepts: ['animate:flip on keyed lists', 'The FLIP technique', 'crossfade send and receive', 'Combining transitions and animations'],
          quiz: [
            ['What requirement does animate:flip have?', 'It must be on the direct child of a keyed {#each} block.'],
            ['What does crossfade return?', 'A pair of send and receive transition functions.'],
          ],
          prereqs: ['Transitions: fade, fly, slide and custom'],
        },
        {
          title: 'Motion: Tween and Spring',
          description: 'svelte/motion provides Tween and Spring classes whose target is set and whose current value animates towards it, driving smooth counters, gauges and drag interactions from reactive state.',
          concepts: ['Tween with duration and easing', 'Spring with stiffness and damping', 'Tween.of and Spring.of', 'Animating numbers and objects'],
          quiz: [
            ['How do you animate a number towards a new value?', 'Create new Tween(0) and set tween.target = value; read tween.current.'],
            ['Difference between a tween and a spring?', 'A tween runs for a fixed duration; a spring settles based on physics parameters.'],
          ],
          prereqs: ['Transitions: fade, fly, slide and custom'],
        },
        {
          title: 'Actions with use:',
          description: 'An action is a function that receives a DOM node and parameters when the element mounts; using $effect inside it handles updates and cleanup, which makes actions the way to integrate tooltips, click-outside, focus traps and third-party widgets.',
          concepts: ['Action function signature', 'Parameters and updates', 'Cleanup on unmount', 'Wrapping third-party libraries', 'Typing actions with Action'],
          quiz: [
            ['What does use:clickOutside={handler} do?', 'Calls the clickOutside action with the element and handler when it mounts.'],
            ['How does an action clean up listeners?', 'Return a destroy function or use $effect and return cleanup from it.'],
          ],
          prereqs: ['Bindings: bind:value, bind:group and bind:this'],
        },
      ],
    },
    {
      title: 'SvelteKit Routing and Layouts',
      description: 'Filesystem routing, layouts, navigation and error handling.',
      topics: [
        {
          title: 'Project structure and filesystem routing',
          description: 'SvelteKit maps folders under src/routes to URLs: +page.svelte renders a page, +layout.svelte wraps children, +server.ts answers requests, and src/lib holds shared code importable as $lib.',
          concepts: ['src/routes and +page.svelte', 'The + file conventions', '$lib alias', 'app.html and the shell'],
          quiz: [
            ['Which file renders /about?', 'src/routes/about/+page.svelte.'],
            ['What does $lib resolve to?', 'src/lib.'],
          ],
          prereqs: ['Creating a project with sv create'],
        },
        {
          title: 'Layouts, layout groups and resets',
          description: 'A +layout.svelte renders {@render children()} around every page beneath it, (group) folders share a layout without affecting the URL, and +page@.svelte resets to a named ancestor layout.',
          concepts: ['Nested layouts', 'Route groups in parentheses', 'Layout resets with @', 'Layout data inheritance'],
          quiz: [
            ['Does a folder named (marketing) appear in the URL?', 'No, groups only organise layouts.'],
            ['What does +page@(app).svelte do?', 'Renders the page inside the (app) layout, skipping layouts below it.'],
          ],
          prereqs: ['Project structure and filesystem routing'],
        },
        {
          title: 'Dynamic, rest and optional parameters',
          description: 'Folders named [slug] capture one segment, [...rest] captures several, [[optional]] may be absent, and param matchers in src/params validate segments so invalid values fall through to a 404.',
          concepts: ['[param] segments', '[...rest] parameters', '[[optional]] segments', 'Param matchers', 'Route priority rules'],
          quiz: [
            ['How do you restrict [id] to digits?', 'Create src/params/integer.ts with a match function and name the folder [id=integer].'],
            ['What does params.rest contain for /docs/a/b?', 'The string a/b.'],
          ],
          prereqs: ['Project structure and filesystem routing'],
        },
        {
          title: 'Navigation, preloading and page state',
          description: 'Plain anchors trigger client-side navigation, goto navigates programmatically, data-sveltekit-preload-data fetches code and data on hover, and the page object from $app/state exposes url, params and data reactively.',
          concepts: ['Client-side navigation with anchors', 'goto and invalidation', 'data-sveltekit-preload-data', 'page from $app/state', 'beforeNavigate and afterNavigate'],
          quiz: [
            ['How do you read the current URL reactively?', 'import { page } from "$app/state" and use page.url.'],
            ['What does data-sveltekit-preload-data="hover" do?', 'Starts loading the target route and its data when the link is hovered.'],
          ],
          prereqs: ['Dynamic, rest and optional parameters'],
        },
        {
          title: 'Error pages, error() and redirect()',
          description: '+error.svelte renders the nearest error boundary with status and message, error(404, "Not found") throws an expected error from load or actions, and redirect(303, "/login") stops execution and sends the user elsewhere.',
          concepts: ['+error.svelte boundaries', 'error() with status and message', 'redirect() semantics', 'Expected versus unexpected errors', 'handleError hook'],
          quiz: [
            ['Why must redirect() not be inside a try/catch?', 'It throws to signal the redirect; catching it swallows the navigation.'],
            ['What does an unexpected error show in production?', 'A generic 500 message; details are logged, not sent to the client.'],
          ],
          prereqs: ['Layouts, layout groups and resets'],
        },
      ],
    },
    {
      title: 'Loading Data',
      description: 'How data reaches pages on the server and in the browser.',
      topics: [
        {
          title: 'Universal load in +page.ts',
          description: 'A load function in +page.ts or +layout.ts runs on the server for the first request and in the browser afterwards, receives params, url and a fetch that works in both places, and its return becomes the data prop.',
          concepts: ['load in +page.ts', 'The load fetch wrapper', 'params and url arguments', 'The data prop and typing with PageData'],
          quiz: [
            ['Where does a universal load run on client-side navigation?', 'In the browser.'],
            ['Why use the fetch passed to load instead of global fetch?', 'It handles relative URLs on the server, forwards cookies to same-origin routes and inlines responses for hydration.'],
          ],
          prereqs: ['Project structure and filesystem routing'],
        },
        {
          title: 'Server load in +page.server.ts',
          description: 'A load in +page.server.ts runs only on the server, so it can read databases, private env variables and cookies; it must return serialisable data, and the split between universal and server load is a security boundary.',
          concepts: ['Server-only load', 'cookies and locals access', 'Serialisation limits with devalue', 'Choosing universal or server load'],
          quiz: [
            ['Can a server load return a class instance?', 'No, only values devalue can serialise such as plain objects, Dates, Maps and Sets.'],
            ['Where should a database query live?', 'In +page.server.ts, never in a universal load.'],
          ],
          prereqs: ['Universal load in +page.ts'],
        },
        {
          title: 'Data flow: parent, depends and invalidate',
          description: 'Layout data merges into page data, await parent() reads it inside a child load, depends("app:key") registers a custom dependency, and invalidate or invalidateAll reruns loads after mutations.',
          concepts: ['Layout data merging', 'await parent() ordering', 'depends and invalidate', 'invalidateAll after mutations', 'Avoiding waterfalls'],
          quiz: [
            ['When does a load rerun automatically?', 'When params, url or a fetched URL or dependency it used is invalidated.'],
            ['Why avoid awaiting parent() before independent fetches?', 'It serialises requests into a waterfall; fetch first, then await parent.'],
          ],
          prereqs: ['Server load in +page.server.ts'],
        },
        {
          title: 'Streaming promises from load',
          description: 'Returning an unawaited promise from a server load streams it to the page while the shell renders immediately; {#await} shows a placeholder, which keeps slow queries from blocking navigation.',
          concepts: ['Returning nested promises', '{#await} for streamed data', 'Error handling in streamed data', 'When streaming hurts'],
          quiz: [
            ['What must be true for a promise to stream?', 'It is nested in the returned object, not a top-level property, and the platform supports streaming.'],
            ['What happens if a streamed promise rejects?', 'The {#await} catch branch renders; unhandled rejections must be caught.'],
          ],
          prereqs: ['Data flow: parent, depends and invalidate'],
        },
      ],
    },
    {
      title: 'Forms and Data Mutation',
      description: 'Sending data back to the server with progressive enhancement.',
      topics: [
        {
          title: 'Form actions: default and named',
          description: 'export const actions in +page.server.ts handles POST submissions; the default action or named actions selected with ?/name read FormData from the request and return data exposed to the page as the form prop.',
          concepts: ['actions in +page.server.ts', 'Named actions with ?/name', 'Reading FormData', 'The form prop'],
          quiz: [
            ['How does a form target the login action?', '<form method="POST" action="?/login">.'],
            ['Do actions work without JavaScript?', 'Yes, they respond to a normal POST and re-render the page.'],
          ],
          prereqs: ['Server load in +page.server.ts'],
        },
        {
          title: 'Progressive enhancement with use:enhance',
          description: 'use:enhance from $app/forms submits the form with fetch, updates the form prop, reruns loads and resets the form without a full reload, and a custom callback adds loading state, optimistic UI or applyAction control.',
          concepts: ['use:enhance basics', 'Custom submit callbacks', 'applyAction and update', 'Optimistic UI patterns'],
          quiz: [
            ['What does use:enhance do after a successful action?', 'Updates form, invalidates data and resets the form unless told otherwise.'],
            ['How do you show a pending state?', 'Set a flag in the enhance callback and clear it in the returned function.'],
          ],
          prereqs: ['Form actions: default and named'],
        },
        {
          title: 'Validation and fail()',
          description: 'Validate on the server, return fail(400, { errors, values }) to re-render with messages and preserved input, and use a schema library such as Zod for consistent rules, optionally through Superforms.',
          concepts: ['fail() with status and data', 'Preserving submitted values', 'Schema validation with Zod', 'Superforms overview'],
          quiz: [
            ['What does fail(400, data) return to the page?', 'The data as the form prop with a 400 status, without redirecting.'],
            ['Why validate on the server even with client checks?', 'Client checks can be bypassed; the server is the source of truth.'],
          ],
          prereqs: ['Progressive enhancement with use:enhance'],
        },
        {
          title: 'Client-side forms with bind and derived state',
          description: 'For interactive forms that never leave the page, bind:value on $state fields, $derived validity and a disabled submit keep the UI honest, and the same state can be posted with fetch or handed to a form action later.',
          concepts: ['Form state with $state', 'Derived validation messages', 'Controlled submit buttons', 'Combining client state with actions'],
          quiz: [
            ['How do you disable submit until the form is valid?', 'disabled={!isValid} where isValid is a $derived expression.'],
            ['Why prefer form actions over fetch for simple CRUD?', 'They work without JavaScript and integrate with load invalidation.'],
          ],
          prereqs: ['Bindings: bind:value, bind:group and bind:this', 'Validation and fail()'],
        },
      ],
    },
    {
      title: 'Server Endpoints, Hooks and Rendering',
      description: 'API routes, request hooks, rendering modes and deployment targets.',
      topics: [
        {
          title: 'API routes with +server.ts',
          description: 'Exporting GET, POST, PUT, PATCH or DELETE from +server.ts creates an endpoint returning a Response; json() builds JSON responses, and RequestHandler types the event with params, request, cookies and locals.',
          concepts: ['HTTP method exports', 'json() and Response', 'RequestHandler typing', 'Content negotiation and status codes'],
          quiz: [
            ['How do you return JSON from GET?', 'return json({ items }) from @sveltejs/kit.'],
            ['What happens when a page and a +server.ts share a folder?', 'The server handler answers non-page requests based on Accept and method.'],
          ],
          prereqs: ['Project structure and filesystem routing'],
        },
        {
          title: 'Hooks: handle, locals and sequence',
          description: 'src/hooks.server.ts exports handle({ event, resolve }) which runs on every request to read cookies, populate event.locals and modify the response; sequence composes hooks and handleFetch rewrites server-side fetches.',
          concepts: ['handle and resolve', 'event.locals and app.d.ts', 'sequence for multiple hooks', 'handleFetch', 'Client hooks and init'],
          quiz: [
            ['Where do you put the current user for loads to read?', 'On event.locals inside handle, typed in app.d.ts.'],
            ['What does resolve(event) return?', 'The rendered Response for the request.'],
          ],
          prereqs: ['API routes with +server.ts'],
        },
        {
          title: 'Rendering modes: SSR, CSR and prerendering',
          description: 'Page options control rendering per route: ssr = false makes a client-only page, csr = false ships no JavaScript, prerender = true builds HTML at build time, and entries lists dynamic routes to prerender.',
          concepts: ['export const ssr and csr', 'prerender and entries', 'trailingSlash option', 'Choosing a mode per route'],
          quiz: [
            ['How do you make a whole app a static site?', 'Set prerender = true in the root layout and use adapter-static.'],
            ['What breaks with ssr = true if code touches window at import time?', 'The server render crashes; guard with browser from $app/environment.'],
          ],
          prereqs: ['Universal load in +page.ts'],
        },
        {
          title: 'Adapters and environment variables',
          description: 'Adapters turn the build into a deployable for Node, static hosts, Vercel, Netlify or Cloudflare, and $env modules expose variables with static or dynamic values, where only PUBLIC_ prefixed ones may reach the browser.',
          concepts: ['adapter-auto, node and static', 'Platform adapters', '$env/static versus $env/dynamic', 'PUBLIC_ prefix rule', 'Build-time versus runtime config'],
          quiz: [
            ['Why does importing $env/static/private in a component fail?', 'Private env modules are blocked from client-side code.'],
            ['When would you use $env/dynamic/private?', 'When values are set at runtime on the host rather than at build time.'],
          ],
          prereqs: ['Rendering modes: SSR, CSR and prerendering'],
        },
      ],
    },
    {
      title: 'Authentication and Deployment',
      description: 'Sessions, protected routes and shipping to production.',
      topics: [
        {
          title: 'Sessions with cookies and locals',
          description: 'A sign-in action verifies credentials, stores a session id in an httpOnly, secure, SameSite cookie, and the handle hook looks the session up on each request and sets event.locals.user for loads and actions.',
          concepts: ['Session cookies and attributes', 'Session lookup in handle', 'Sign-out and expiry', 'Password hashing on the server'],
          quiz: [
            ['Why set httpOnly on the session cookie?', 'Scripts cannot read it, so XSS cannot steal the session.'],
            ['Which cookies.set option is mandatory in SvelteKit?', 'path, usually "/".'],
          ],
          prereqs: ['Hooks: handle, locals and sequence', 'Form actions: default and named'],
        },
        {
          title: 'Protecting routes in layouts and loads',
          description: 'A +layout.server.ts under a protected group checks locals.user and redirects to sign-in; because layout loads can be skipped on client navigation, actions and endpoints must check authorisation too.',
          concepts: ['Layout server load guards', 'Redirect to sign-in with return URL', 'Checking authorisation in actions', 'Why client checks are not enough'],
          quiz: [
            ['Where does a redirect for unauthenticated users go?', 'In a server load or handle hook, throwing redirect(303, "/login").'],
            ['Is a layout load guard sufficient on its own?', 'No, loads can be reused or skipped; guard actions and endpoints as well.'],
          ],
          prereqs: ['Sessions with cookies and locals'],
        },
        {
          title: 'OAuth and Auth.js integration',
          description: 'Delegating sign-in to Google or GitHub through OAuth with PKCE and state, or using Auth.js for SvelteKit which supplies providers, callbacks and a session in locals, while still owning users and roles in your database.',
          concepts: ['OAuth flow with state and PKCE', 'Auth.js providers and callbacks', 'Linking accounts to local users', 'Roles and session data'],
          quiz: [
            ['What does the state parameter prevent in OAuth?', 'Cross-site request forgery on the callback.'],
            ['Where does Auth.js expose the session on the server?', 'Through event.locals.auth() in loads and hooks.'],
          ],
          prereqs: ['Sessions with cookies and locals'],
        },
        {
          title: 'Deploying to Node, Vercel and static hosts',
          description: 'Building with the right adapter, running the Node output with environment variables and a reverse proxy, deploying to Vercel or Cloudflare with their adapters, and serving prerendered output from a CDN.',
          concepts: ['adapter-node builds and ORIGIN', 'Vercel and Cloudflare deploys', 'Static hosting with fallback page', 'Health checks and logs'],
          quiz: [
            ['Why set ORIGIN when running adapter-node behind a proxy?', 'So form actions and redirects use the public URL and CSRF checks pass.'],
            ['What is the fallback option in adapter-static for?', 'An SPA fallback page for routes that were not prerendered.'],
          ],
          prereqs: ['Adapters and environment variables'],
        },
      ],
    },
    {
      title: 'Testing',
      description: 'Unit, component and end-to-end tests for Svelte apps.',
      topics: [
        {
          title: 'Unit tests with Vitest',
          description: 'Vitest runs alongside Vite with the same config; pure logic in .ts and .svelte.ts modules is tested directly, and runes in .svelte.test.ts files let tests exercise reactive state with $effect.root.',
          concepts: ['Vitest setup from sv add', 'Testing .svelte.ts logic', '$effect.root in tests', 'Mocking modules with vi.mock'],
          quiz: [
            ['Why name a test file counter.svelte.test.ts?', 'So runes are compiled inside the test file.'],
            ['How do you flush effects in a test?', 'Wrap in $effect.root and call flushSync().'],
          ],
          prereqs: ['Shared state in .svelte.ts modules'],
        },
        {
          title: 'Component tests with Testing Library and browser mode',
          description: 'Render components with @testing-library/svelte or vitest-browser-svelte, query by role and text, fire user events and assert on the DOM; browser mode runs in a real browser so bindings and transitions behave truthfully.',
          concepts: ['render and screen queries', 'User interactions in tests', 'Testing props and callbacks', 'vitest-browser-svelte and Playwright provider'],
          quiz: [
            ['How do you pass props when rendering in a test?', 'render(Component, { props: { name: "Ada" } }).'],
            ['Why prefer browser mode for components with transitions?', 'jsdom lacks real layout and animation APIs.'],
          ],
          prereqs: ['Unit tests with Vitest'],
        },
        {
          title: 'End-to-end tests with Playwright',
          description: 'Playwright starts the preview server, drives a real browser through pages and form actions, and asserts navigation, cookies and rendered data; it is the layer that proves load functions, actions and hooks work together.',
          concepts: ['playwright.config webServer', 'Locators and web-first assertions', 'Testing form actions end-to-end', 'Auth state reuse with storageState'],
          quiz: [
            ['How does Playwright get a running app?', 'The webServer option builds and previews the app before tests.'],
            ['Why test form actions in Playwright rather than unit tests?', 'They span the server, cookies and navigation, which only a browser test covers.'],
          ],
          prereqs: ['Component tests with Testing Library and browser mode'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Complete applications that exercise Svelte and SvelteKit, then interview practice.',
      topics: [
        {
          title: 'Project: markdown notes app',
          description: 'Build a notes app with rune-based state in a .svelte.ts store, a keyed list with flip animations, live markdown preview, tag filtering and localStorage persistence; it must restore notes after a reload and search instantly.',
          concepts: ['Model notes with $state', 'Editor with bind:value and preview', 'Keyed list with animations', 'Persist with an $effect'],
          quiz: [
            ['How do you persist notes automatically?', 'An $effect that writes $state.snapshot(notes) to localStorage.'],
            ['Why key the notes list?', 'So animations and DOM reuse follow each note as the list reorders.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: blog with SvelteKit and prerendering',
          description: 'A content site with markdown posts loaded in server load functions, dynamic [slug] routes, an RSS endpoint in +server.ts, prerendered pages via adapter-static and Lighthouse scores above 95.',
          concepts: ['Posts from markdown with mdsvex', 'Slug routes and error pages', 'RSS feed endpoint', 'Prerender and deploy statically'],
          quiz: [
            ['How does SvelteKit know which slug pages to prerender?', 'By crawling links or from the entries option.'],
            ['Which file serves /rss.xml?', 'src/routes/rss.xml/+server.ts.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: full-stack app with auth and form actions',
          description: 'A task tracker with SQLite via Drizzle, session cookies in hooks, protected layouts, form actions with use:enhance and validation, an optimistic toggle, streaming of a slow stats query and Playwright coverage of sign-in and CRUD.',
          concepts: ['Database and schema with Drizzle', 'Session auth in hooks', 'Actions with validation and enhance', 'Streamed stats and e2e tests'],
          quiz: [
            ['Where is the current user resolved?', 'In the handle hook, stored on event.locals.'],
            ['How do you keep the UI responsive during a slow stats query?', 'Return it as a nested promise and render with {#await}.'],
          ],
          style: 'project',
        },
        {
          title: 'Svelte and SvelteKit interview questions',
          description: 'The questions that keep coming up: how the compiler avoids a virtual DOM, runes versus stores, $derived versus $effect, universal versus server load, form actions versus fetch, and rendering mode trade-offs.',
          concepts: ['Compiler and reactivity questions', 'Data loading and rendering questions', 'Comparisons with React and Vue', 'Explaining trade-offs aloud'],
          quiz: [
            ['Why does Svelte have no virtual DOM?', 'The compiler emits code that updates exactly the DOM nodes each piece of state affects.'],
            ['When does load run on the server only?', 'When it lives in +page.server.ts or +layout.server.ts.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live coding in Svelte interviews',
          description: 'Practising typical tasks: a searchable list with $derived, a modal with transitions and a focus-trap action, a form action with validation, and a route with a load function, explaining each choice while typing.',
          concepts: ['Searchable list kata', 'Modal with action and transition', 'Form action kata', 'Talking through data flow'],
          quiz: [
            ['What do you reach for to filter a list from an input?', 'bind:value on the input and a $derived filtered array.'],
            ['How do you show a server validation error?', 'Return fail(400, { error }) and render form?.error.'],
          ],
        },
      ],
    },
  ],
})
