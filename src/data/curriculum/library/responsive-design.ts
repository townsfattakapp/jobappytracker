import { defineTrack } from '../define'

export const responsiveDesign = defineTrack({
  id: 'track-responsive-design',
  title: 'Responsive Web Design',
  description: 'Building layouts that work from a 320px phone to an ultrawide monitor: the viewport, mobile-first thinking, fluid sizing, media and container queries, fluid type, responsive images, flexible grids, navigation and table patterns, touch input, device testing and print, finished with real projects.',
  family: 'Frontend & Web',
  kind: 'domain',
  icon: '📱',
  tags: ['responsive', 'mobile-first', 'media queries', 'container queries', 'fluid typography', 'layout', 'frontend'],
  languages: ['HTML', 'CSS'],
  explainMode: 'concept',
  code: { label: 'HTML and CSS', id: 'css', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-css'],
  style: 'practice',
  categories: [
    {
      title: 'Viewport and Mobile-First Foundations',
      description: 'Why a page renders the way it does on a phone, and the mindset that makes every later decision easier.',
      topics: [
        {
          title: 'The viewport and the viewport meta tag',
          description: 'Layout viewport versus visual viewport, why mobile browsers pretend to be 980px wide without the meta tag, and what width=device-width and initial-scale actually change.',
          concepts: ['Layout versus visual viewport', 'The 980px default and zooming out', 'width=device-width, initial-scale=1', 'Why never disable user scaling'],
          quiz: [
            ['What happens without the viewport meta tag on a phone?', 'The browser lays out at about 980px and shrinks the page to fit.'],
            ['Why is user-scalable=no harmful?', 'It blocks pinch zoom, which many users need to read text.'],
          ],
        },
        {
          title: 'Mobile-first versus desktop-first',
          description: 'Writing base styles for the smallest screen and adding complexity with min-width queries, versus starting wide and overriding downward, and why mobile-first produces less CSS and better priorities.',
          concepts: ['Base styles for the narrowest screen', 'Enhancing with min-width queries', 'Desktop-first and max-width overrides', 'Content priority on small screens'],
          quiz: [
            ['Which query type does mobile-first mostly use?', 'min-width (or width >=) queries.'],
            ['Why does mobile-first tend to produce less CSS?', 'Simple stacked layouts are the default and only additions are written for wider screens.'],
          ],
          prereqs: ['The viewport and the viewport meta tag'],
        },
        {
          title: 'Device pixels, CSS pixels and device pixel ratio',
          description: 'Why a 1080px-wide phone reports 360 CSS pixels, how devicePixelRatio drives image and font crispness, and what it means for choosing image sizes and hairline borders.',
          concepts: ['CSS pixels as a reference unit', 'devicePixelRatio', 'Consequences for images', 'Hairlines and sub-pixel rendering'],
          quiz: [
            ['A phone with 1170 physical pixels and DPR 3: how wide is the CSS viewport?', '390 CSS pixels.'],
            ['Why do 1x images look blurry on phones?', 'Each CSS pixel covers several device pixels, so the image is upscaled.'],
          ],
        },
        {
          title: 'Choosing breakpoints from content',
          description: 'Letting the content decide where layouts break instead of copying device sizes, resizing until something looks wrong, using em-based breakpoints and keeping the set small.',
          concepts: ['Content-driven breakpoints', 'Why device-based breakpoints age badly', 'em versus px breakpoints', 'Keeping the breakpoint set small'],
          quiz: [
            ['How do you find a breakpoint?', 'Widen the viewport until the layout stops working and break there.'],
            ['Why use em in media queries?', 'They scale with the user\'s font size so layouts hold when text is zoomed.'],
          ],
          prereqs: ['Mobile-first versus desktop-first'],
        },
      ],
    },
    {
      title: 'Fluid Layouts',
      topics: [
        {
          title: 'Percentages, max-width and fluid containers',
          description: 'Boxes that stretch and stop: percentage widths, max-width to cap line length, the centred container pattern with width: min(100% - 2rem, 70rem) and why fixed pixel widths break first.',
          concepts: ['Percentage widths', 'max-width caps', 'The min() container pattern', 'Why fixed widths break'],
          quiz: [
            ['What does width: min(100% - 2rem, 70rem) do?', 'Fills the viewport minus a gutter until it reaches 70rem, then stops.'],
            ['Why prefer max-width over width for containers?', 'The box can shrink on small screens without overflow.'],
          ],
        },
        {
          title: 'Intrinsic sizing and content-based layout',
          description: 'min-content, max-content and fit-content, flex and grid auto sizing that lets content define width, and Jen Simmons\'s intrinsic web design idea of layouts that adapt to content as well as viewport.',
          concepts: ['min-content and max-content in practice', 'fit-content for centred blocks', 'Auto tracks that size to content', 'Intrinsic design principles'],
          quiz: [
            ['What does width: fit-content do to a button-like block?', 'Makes it as wide as its content, up to the available space.'],
            ['Why is intrinsic sizing more robust than breakpoints?', 'It responds to the content and container, not just a viewport number.'],
          ],
          prereqs: ['Percentages, max-width and fluid containers'],
        },
        {
          title: 'Fluid media and aspect-ratio',
          description: 'max-width: 100% and height: auto so images and videos never overflow, aspect-ratio to reserve space for embeds and cards, and object-fit for cropping into fixed boxes.',
          concepts: ['max-width: 100% on media', 'aspect-ratio for embeds', 'object-fit and object-position', 'Responsive iframes'],
          quiz: [
            ['How do you make a YouTube iframe responsive?', 'width: 100% with aspect-ratio: 16 / 9.'],
            ['What does object-fit: cover do?', 'Fills the box while keeping the ratio, cropping the overflow.'],
          ],
        },
        {
          title: 'Preventing overflow and horizontal scroll',
          description: 'The usual culprits behind a page that scrolls sideways on phones: fixed widths, long words, 100vw with scrollbars, negative margins and images, and how to find and fix each.',
          concepts: ['Common overflow causes', 'overflow-wrap for long strings', '100vw and scrollbar width', 'Finding the offending element'],
          quiz: [
            ['Why can width: 100vw cause horizontal scroll?', 'It includes the vertical scrollbar width on desktop.'],
            ['How do you stop a long URL from breaking layout?', 'overflow-wrap: anywhere or word-break on the text.'],
          ],
          prereqs: ['Percentages, max-width and fluid containers'],
        },
      ],
    },
    {
      title: 'Media Queries',
      topics: [
        {
          title: 'Media query syntax and range notation',
          description: 'Media types and features, and, or and not logic, the modern range syntax (width >= 48em) and how a query applies to the whole viewport including scrollbars.',
          concepts: ['Types, features and logic', 'Range syntax', 'Combining queries', 'What width measures'],
          quiz: [
            ['Write a query for widths between 40em and 60em.', '@media (40em <= width <= 60em).'],
            ['Does the viewport width in a media query include the scrollbar?', 'Yes, on desktop browsers.'],
          ],
        },
        {
          title: 'Orientation, resolution and display features',
          description: 'orientation for landscape phones, resolution and min-resolution for high-density assets, display-mode for installed apps, and why orientation alone is a poor proxy for device type.',
          concepts: ['orientation queries', 'resolution and dppx', 'display-mode: standalone', 'Orientation is not device type'],
          quiz: [
            ['How do you target high-density screens?', '@media (min-resolution: 2dppx).'],
            ['When is display-mode: standalone true?', 'When the page runs as an installed PWA without browser chrome.'],
          ],
          prereqs: ['Media query syntax and range notation'],
        },
        {
          title: 'User preference queries',
          description: 'prefers-color-scheme, prefers-reduced-motion, prefers-contrast and forced-colors, responding to system settings so the interface respects what the user already chose.',
          concepts: ['prefers-color-scheme', 'prefers-reduced-motion', 'prefers-contrast and forced-colors', 'Testing preferences in DevTools'],
          quiz: [
            ['How do you emulate dark mode without changing the OS?', 'DevTools Rendering panel: emulate prefers-color-scheme.'],
            ['What does forced-colors: active indicate?', 'The user runs a high-contrast mode that overrides colours.'],
          ],
          prereqs: ['Media query syntax and range notation'],
        },
        {
          title: 'Organising media queries in a codebase',
          description: 'Queries next to the component versus grouped at the end, custom media with PostCSS, breakpoint tokens, and why nesting queries inside components keeps behaviour readable.',
          concepts: ['Co-locating queries with components', 'Breakpoint tokens', 'Custom media with PostCSS', 'Avoiding query sprawl'],
          quiz: [
            ['Can media queries use custom properties for the width?', 'No; use preprocessor variables or @custom-media.'],
            ['Why co-locate queries with components?', 'All behaviour of a component is readable in one place.'],
          ],
          prereqs: ['Media query syntax and range notation'],
        },
      ],
    },
    {
      title: 'Container Queries',
      topics: [
        {
          title: 'Containment and container-type',
          description: 'Declaring container-type: inline-size on a wrapper so children can query its width, why size containment is required and what it prevents, and naming containers.',
          concepts: ['container-type: inline-size', 'Why containment is needed', 'container-name', 'The container shorthand'],
          quiz: [
            ['Can an element query its own size?', 'No, it queries an ancestor container.'],
            ['Why not use container-type: size everywhere?', 'It removes height from the flow, collapsing content-sized boxes.'],
          ],
        },
        {
          title: 'Component-level responsive design',
          description: 'Writing a card, nav or table that rearranges based on the space it is given, so it works in a sidebar, a main column and a modal without extra classes.',
          concepts: ['One component, many contexts', 'Card that switches to horizontal', 'Replacing breakpoint modifier classes', 'Combining with media queries'],
          quiz: [
            ['When do you still need a media query?', 'For page-level layout and preferences; components use container queries.'],
            ['How does a card know it is in a sidebar?', 'It does not; it reacts to the container width being narrow.'],
          ],
          prereqs: ['Containment and container-type'],
        },
        {
          title: 'Container units and style queries',
          description: 'cqi, cqw and cqb for sizing relative to the container, fluid type inside components, and style queries that react to custom property values on the container.',
          concepts: ['cqi and cqb units', 'Fluid type per container', 'Style queries on custom properties', 'Browser support and fallbacks'],
          quiz: [
            ['What is 10cqi?', '10% of the container\'s inline size.'],
            ['What does @container style(--theme: dark) match?', 'Containers whose --theme custom property is dark.'],
          ],
          prereqs: ['Component-level responsive design'],
        },
      ],
    },
    {
      title: 'Responsive Typography',
      topics: [
        {
          title: 'Type scales and rem-based sizing',
          description: 'Modular scales with a ratio, sizing in rem so the user\'s font preference is respected, and stepping the scale per breakpoint before going fully fluid.',
          concepts: ['Modular type scales', 'rem and user font settings', 'Stepping scales at breakpoints', 'Heading hierarchy that survives resizing'],
          quiz: [
            ['Why not set font-size in px on the root?', 'It overrides the user\'s chosen browser font size.'],
            ['What is a modular scale?', 'A set of sizes derived by multiplying a base by a fixed ratio.'],
          ],
        },
        {
          title: 'Fluid type with clamp',
          description: 'Interpolating font size between a minimum and maximum across a viewport range using clamp with a vw term plus rem, generating the formula, and the zoom accessibility trap of pure vw.',
          concepts: ['The clamp formula', 'Calculating the vw slope', 'Adding rem to keep zoom working', 'Fluid type generators'],
          quiz: [
            ['Why include a rem term with vw in clamp?', 'Pure vw ignores browser zoom, failing the 200% text resize requirement.'],
            ['What does clamp(1rem, 0.5rem + 2vw, 1.5rem) do at 1000px?', '0.5rem + 20px = 28px, capped by 1.5rem = 24px.'],
          ],
          prereqs: ['Type scales and rem-based sizing'],
        },
        {
          title: 'Measure, line-height and reading comfort',
          description: 'Keeping lines to roughly 45 to 75 characters with max-width in ch, adjusting line-height as text grows, and text-wrap: balance and pretty for headings.',
          concepts: ['Measure and max-width in ch', 'Line-height across sizes', 'text-wrap: balance and pretty', 'Reading comfort on small screens'],
          quiz: [
            ['What does max-width: 65ch approximate?', 'About 65 characters per line.'],
            ['Should line-height be larger for body or headings?', 'Body text; large headings need tighter line-height.'],
          ],
        },
        {
          title: 'Fluid spacing scales',
          description: 'Applying the same clamp technique to margins, padding and gaps so spacing grows with the screen, and using custom properties for a spacing scale shared across components.',
          concepts: ['Spacing tokens as custom properties', 'Fluid space with clamp', 'Space pairs for sections', 'Consistent gutters'],
          quiz: [
            ['Why make spacing fluid too?', 'Fixed spacing looks cramped on wide screens and bloated on phones.'],
            ['Where should a spacing scale be defined?', 'Custom properties on :root used by every component.'],
          ],
          prereqs: ['Fluid type with clamp'],
        },
      ],
    },
    {
      title: 'Responsive Images',
      topics: [
        {
          title: 'srcset and sizes matched to layout',
          description: 'Choosing width descriptors that cover real rendered sizes, writing a sizes attribute that mirrors the CSS layout at each breakpoint, and verifying the browser choice in the Network panel.',
          concepts: ['Picking candidate widths', 'Writing sizes from the layout', 'Verifying which image loaded', 'Common sizes mistakes'],
          quiz: [
            ['What happens if sizes is omitted with width descriptors?', 'The browser assumes 100vw and downloads oversized images.'],
            ['Where do you check which candidate was chosen?', 'The Network panel or the img currentSrc property.'],
          ],
        },
        {
          title: 'Art direction with picture and media',
          description: 'Serving a tight crop on phones and a wide crop on desktop with picture and media attributes, keeping the focal point visible, and combining with format fallbacks.',
          concepts: ['Cropping per breakpoint', 'Focal point preservation', 'Combining media and type sources', 'When art direction is worth it'],
          quiz: [
            ['How does picture differ from srcset alone?', 'You choose the image per breakpoint; srcset lets the browser choose by size.'],
            ['Can source elements carry sizes and srcset?', 'Yes, each source has its own srcset and sizes.'],
          ],
          prereqs: ['srcset and sizes matched to layout'],
        },
        {
          title: 'Background images and image-set',
          description: 'Responsive backgrounds with background-size, media queries and image-set for density and format, and why content images should be img and not CSS backgrounds.',
          concepts: ['background-size and position', 'image-set for density and format', 'Swapping backgrounds per breakpoint', 'Content versus decoration'],
          quiz: [
            ['What does image-set provide?', 'Multiple background candidates by resolution or format.'],
            ['Why not put the hero photo in a CSS background?', 'It cannot have alt text and loads later than a preloaded img.'],
          ],
        },
        {
          title: 'Image CDNs and modern formats',
          description: 'Generating sizes and formats on the fly with an image CDN or build step, AVIF and WebP with fallbacks, and lazy loading and decoding hints for images below the fold.',
          concepts: ['On-the-fly resizing with a CDN', 'AVIF and WebP with fallbacks', 'Lazy loading below the fold', 'Build-time image pipelines'],
          quiz: [
            ['What does an image CDN URL parameter like w=800 do?', 'Resizes the image on the server before delivery.'],
            ['Why should the hero image not be lazy loaded?', 'It is visible immediately and lazy loading delays its discovery.'],
          ],
          prereqs: ['srcset and sizes matched to layout'],
        },
      ],
    },
    {
      title: 'Flexible Grids and Layout Patterns',
      topics: [
        {
          title: 'Auto-fit grids without media queries',
          description: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr)) as the workhorse responsive grid, why the inner min() prevents overflow on narrow screens, and controlling the maximum column count.',
          concepts: ['auto-fit with minmax', 'The inner min() guard', 'Capping column count', 'Gap and alignment in fluid grids'],
          quiz: [
            ['Why wrap the minimum in min(100%, 18rem)?', 'So a viewport narrower than 18rem still gets one full-width column.'],
            ['How do you limit a fluid grid to three columns?', 'Set max-width on the grid or use a calc-based minimum.'],
          ],
        },
        {
          title: 'Flex-based wrapping layouts',
          description: 'flex-wrap with flex-basis and flex-grow for rows that reflow, the switcher pattern that flips from row to column at a container width using a single calc, and gap for consistent spacing.',
          concepts: ['flex-wrap and flex-basis', 'The switcher pattern', 'The cluster pattern', 'Gap in wrapping flex rows'],
          quiz: [
            ['How does the switcher decide to stack?', 'flex-basis: calc((threshold - 100%) * 999) flips between 0 and full width.'],
            ['When choose flex over grid for a responsive row?', 'When items are content-sized and one-dimensional.'],
          ],
        },
        {
          title: 'Sidebar, holy grail and page-level layouts',
          description: 'Composing a page with grid-template-areas that change per breakpoint, the sidebar pattern that collapses when the main column gets too narrow, and full-bleed sections inside a centred layout.',
          concepts: ['grid-template-areas per breakpoint', 'The sidebar pattern', 'Full-bleed sections', 'Sticky sidebars'],
          quiz: [
            ['How do you reorder page regions per breakpoint?', 'Redefine grid-template-areas inside the media query.'],
            ['How do you make a section span the full viewport inside a centred container?', 'A grid with named breakout columns or negative margins with calc.'],
          ],
          prereqs: ['Auto-fit grids without media queries'],
        },
        {
          title: 'Layout primitives and composition',
          description: 'Reusable layout components such as stack, center, cover and grid from Every Layout, so pages are composed from a handful of tested primitives rather than bespoke CSS per page.',
          concepts: ['The stack primitive', 'Center and cover primitives', 'Composing primitives', 'Exposing size via custom properties'],
          quiz: [
            ['What does the stack primitive do?', 'Adds consistent vertical space between siblings with the owl selector.'],
            ['Why build layout primitives?', 'They encode responsive behaviour once and are reused everywhere.'],
          ],
          prereqs: ['Flex-based wrapping layouts'],
        },
      ],
    },
    {
      title: 'Navigation and Components Across Breakpoints',
      topics: [
        {
          title: 'Navigation patterns',
          description: 'Horizontal nav that collapses into a hamburger, priority-plus that hides overflow items in a menu, bottom tab bars on phones, and how to keep each accessible with proper buttons and focus.',
          concepts: ['Hamburger and disclosure menus', 'Priority-plus navigation', 'Bottom tab bars', 'Accessible toggles and focus'],
          quiz: [
            ['What element should the hamburger toggle be?', 'A button with aria-expanded and aria-controls.'],
            ['What is priority-plus navigation?', 'Show as many items as fit and move the rest into a more menu.'],
          ],
        },
        {
          title: 'Off-canvas drawers and overlays',
          description: 'Sliding panels for navigation and filters, using dialog or inert for focus trapping, transform-based animation, and locking body scroll without breaking iOS.',
          concepts: ['Drawer structure and transform animation', 'dialog and inert for focus', 'Scroll locking', 'Closing on Escape and backdrop'],
          quiz: [
            ['How do you keep focus inside an open drawer?', 'Use dialog.showModal() or set inert on the rest of the page.'],
            ['Why animate with transform instead of left?', 'It is composited and does not trigger layout.'],
          ],
          prereqs: ['Navigation patterns'],
        },
        {
          title: 'Cards, modals and forms at every width',
          description: 'Cards that switch between vertical and horizontal, modals that become full-screen sheets on phones, and form layouts that stack labels and inputs when space runs out.',
          concepts: ['Card orientation switching', 'Modal to bottom sheet', 'Stacking form fields', 'Button rows that wrap'],
          quiz: [
            ['How should a modal behave on a small phone?', 'Become a full-screen or bottom sheet instead of a floating box.'],
            ['How do you stack labels above inputs only when narrow?', 'A container query or flex-wrap on the field row.'],
          ],
        },
        {
          title: 'Sticky headers, safe areas and the address bar',
          description: 'Sticky headers that shrink on scroll, env(safe-area-inset-*) for notches and home indicators, dynamic viewport units and the address bar problem on mobile browsers.',
          concepts: ['Sticky headers that condense', 'env(safe-area-inset-*)', 'dvh, svh and lvh', 'viewport-fit=cover'],
          quiz: [
            ['What does env(safe-area-inset-bottom) give you?', 'The height of the home indicator area to pad against.'],
            ['Why does 100vh overflow on mobile Safari?', 'It uses the largest viewport while the address bar is visible; use 100dvh.'],
          ],
        },
      ],
    },
    {
      title: 'Touch, Pointer and Input',
      topics: [
        {
          title: 'Touch targets and spacing',
          description: 'Minimum target sizes of about 44 by 44 CSS pixels, spacing between targets, enlarging hit areas with padding or pseudo-elements, and the WCAG target size criterion.',
          concepts: ['Minimum target size', 'Spacing between targets', 'Enlarging hit areas', 'WCAG target size criterion'],
          quiz: [
            ['What target size does Apple recommend?', '44 by 44 points.'],
            ['How do you enlarge a small icon\'s tap area?', 'Add padding or a pseudo-element without changing the visual size.'],
          ],
        },
        {
          title: 'hover, pointer and any-pointer queries',
          description: 'Detecting coarse versus fine pointers and whether hover is available, designing states that do not depend on hover, and handling devices that have both touch and mouse.',
          concepts: ['pointer: coarse and fine', 'hover: none', 'any-hover and any-pointer', 'Never hover-only interactions'],
          quiz: [
            ['Why can hover: hover be false on a laptop with a touchscreen?', 'It reports the primary input; use any-hover for any capable input.'],
            ['How do you show larger controls on touch devices?', '@media (pointer: coarse).'],
          ],
          prereqs: ['Touch targets and spacing'],
        },
        {
          title: 'Scrolling, gestures and scroll snap',
          description: 'Horizontal carousels with scroll-snap, overscroll-behavior to stop scroll chaining, touch-action to control browser gestures, and momentum scrolling in overflow containers.',
          concepts: ['scroll-snap-type and align', 'overscroll-behavior', 'touch-action', 'Momentum scrolling in containers'],
          quiz: [
            ['What does overscroll-behavior: contain do?', 'Stops scroll from chaining to the parent when the container hits its end.'],
            ['What does touch-action: pan-y allow?', 'Vertical panning only; horizontal gestures go to your code.'],
          ],
        },
      ],
    },
    {
      title: 'Responsive Tables and Data',
      topics: [
        {
          title: 'Scrolling table containers',
          description: 'Wrapping a wide table in an overflow-x: auto container with a visible scroll affordance, sticky first columns and headers, and keeping the container keyboard-focusable.',
          concepts: ['overflow-x wrappers', 'Scroll shadows as affordance', 'Sticky columns and headers', 'tabindex on scroll regions'],
          quiz: [
            ['Why give a scrollable table wrapper tabindex="0"?', 'Keyboard users can focus it and scroll with arrow keys.'],
            ['How do you keep the first column visible while scrolling?', 'position: sticky; left: 0 on those cells.'],
          ],
        },
        {
          title: 'Stacked and card-style tables',
          description: 'Turning each row into a card on narrow screens with display changes and data-label pseudo-content, the accessibility costs of changing display on table elements and the role="table" fix.',
          concepts: ['Row-to-card transformation', 'data-label and ::before', 'Restoring semantics with roles', 'Choosing columns to hide'],
          quiz: [
            ['What breaks when you set display: block on table cells?', 'Screen readers lose the table semantics unless roles are restored.'],
            ['How do you show column headers in a stacked row?', 'content: attr(data-label) on a ::before in each cell.'],
          ],
          prereqs: ['Scrolling table containers'],
        },
        {
          title: 'Responsive charts and data visuals',
          description: 'SVG charts that scale with viewBox, simplifying visuals on small screens, switching from charts to lists when there is no room, and responsive containers for charting libraries.',
          concepts: ['SVG viewBox scaling', 'Simplifying on small screens', 'Chart-to-list fallbacks', 'ResizeObserver for library charts'],
          quiz: [
            ['How does an SVG chart scale with its container?', 'Set viewBox and let width be 100% without fixed height.'],
            ['When should a chart become a table on mobile?', 'When axis labels and legend can no longer be read at that size.'],
          ],
        },
      ],
    },
    {
      title: 'Testing, Print and Delivery',
      topics: [
        {
          title: 'Device emulation and real device testing',
          description: 'DevTools device mode and its limits, remote debugging on real phones over USB, cloud device farms, and the bugs only real devices show: font rendering, address bars, touch latency.',
          concepts: ['Device mode and its limits', 'Remote debugging on phones', 'Cloud device labs', 'Bugs only real devices reveal'],
          quiz: [
            ['What does device mode not simulate?', 'Real touch latency, mobile browser chrome and font rendering.'],
            ['How do you inspect Safari on an iPhone?', 'Connect over USB and use Safari\'s Develop menu on a Mac.'],
          ],
        },
        {
          title: 'Cross-browser and progressive enhancement',
          description: 'Checking support on Can I Use and Baseline, layering enhancements with @supports, and testing in Safari, Firefox and Chromium because layout differences still exist.',
          concepts: ['Can I Use and Baseline', '@supports layering', 'Safari-specific quirks', 'Graceful degradation'],
          quiz: [
            ['What does Baseline "widely available" mean?', 'Supported across all major browsers for at least 30 months.'],
            ['Why test in Safari specifically?', 'It is the only engine on iOS and often lags or differs in layout details.'],
          ],
        },
        {
          title: 'Print stylesheets',
          description: 'A print media query that hides navigation, expands link URLs, avoids page breaks inside cards and tables, resets colours for ink, and how to preview print in DevTools.',
          concepts: ['@media print basics', 'Hiding chrome and expanding links', 'break-inside and page breaks', 'Previewing print in DevTools'],
          quiz: [
            ['How do you print a link\'s URL after its text?', 'a[href]::after { content: " (" attr(href) ")"; }'],
            ['How do you stop a card splitting across pages?', 'break-inside: avoid.'],
          ],
        },
        {
          title: 'Responsive delivery and performance on mobile',
          description: 'Slow networks and weak CPUs make mobile the performance floor: reducing CSS for small screens, conditional loading with media on link elements, and testing with throttling.',
          concepts: ['Mobile as the performance floor', 'Conditional stylesheet loading', 'CPU and network throttling', 'Avoiding hidden heavy content'],
          quiz: [
            ['Does a hidden desktop-only image still download on mobile?', 'Yes, if it is an img with display: none; use picture or lazy loading.'],
            ['What does media="print" on a link element do?', 'Loads the stylesheet without blocking rendering until printing.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: mobile-first news site',
          description: 'Build an article listing and reading page that stacks on phones and grows into a multi-column layout, with fluid type, art-directed hero images, priority-plus navigation and a print stylesheet.',
          concepts: ['Plan content priority', 'Build mobile layout first', 'Add breakpoints and image sources', 'Print and test on devices'],
          quiz: [
            ['What is the first layout you build?', 'The single-column mobile version.'],
            ['How does the hero change crop on desktop?', 'A picture element with a media-matched source.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: container-query component library',
          description: 'A set of cards, product tiles, stat panels and a nav bar that adapt to their container, demonstrated in a sidebar, a main column and a modal on a single page.',
          concepts: ['Define containers and names', 'Build adaptive cards', 'Adapt navigation by container', 'Demonstrate in multiple contexts'],
          quiz: [
            ['How do you prove the components are container-driven?', 'Show the same component behaving differently in narrow and wide slots on one screen.'],
            ['Which container-type do the wrappers use?', 'inline-size.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: responsive data dashboard',
          description: 'A dashboard with scrolling and stacked tables, SVG charts that scale, a collapsible sidebar, touch-friendly filters in a drawer and correct behaviour on a phone in landscape.',
          concepts: ['Layout regions with grid areas', 'Responsive tables', 'Scalable charts', 'Filter drawer and touch targets'],
          quiz: [
            ['How do wide tables behave on phones?', 'Scroll horizontally in a focusable wrapper or stack into cards.'],
            ['What size are the filter controls on touch devices?', 'At least 44px targets under pointer: coarse.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: e-commerce product page',
          description: 'A product page with an image gallery using scroll snap, a sticky buy box on desktop that becomes a bottom bar on mobile, size selectors with large targets and a responsive review section.',
          concepts: ['Gallery with scroll snap', 'Sticky buy box to bottom bar', 'Touch-friendly selectors', 'Reviews and related products grid'],
          quiz: [
            ['How does the buy box move to the bottom on phones?', 'Fixed positioning with safe-area padding under a media query.'],
            ['How does the gallery swipe on mobile?', 'overflow-x: auto with scroll-snap-type: x mandatory.'],
          ],
          style: 'project',
        },
        {
          title: 'Responsive design interview questions',
          description: 'The questions that keep coming up: mobile-first reasoning, srcset versus picture, container versus media queries, fluid type maths, dvh versus vh and how to prevent layout shift.',
          concepts: ['Viewport and breakpoint questions', 'Image and typography questions', 'Layout strategy questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Explain container queries in one sentence.', 'Components respond to the size of their parent container rather than the viewport.'],
            ['Why is mobile-first preferred?', 'It forces content priority and keeps base CSS simple, adding complexity only where there is space.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live responsive layout exercises',
          description: 'Timed exercises: make a fixed-width page fluid, add a breakpoint to a broken card grid, fix a horizontal scroll bug and convert a desktop nav to a phone menu while explaining each step.',
          concepts: ['Convert fixed to fluid', 'Fix a broken grid', 'Hunt an overflow bug', 'Collapse a navigation'],
          quiz: [
            ['First step when a page scrolls sideways on mobile?', 'Find the element wider than the viewport using outlines or a script.'],
            ['Fastest way to make a fixed 960px layout fluid?', 'Replace width with max-width and use percentages or fr for columns.'],
          ],
        },
      ],
    },
  ],
})
