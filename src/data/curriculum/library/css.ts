import { defineTrack } from '../define'

export const css = defineTrack({
  id: 'track-css',
  title: 'CSS',
  description: 'CSS from selectors and the cascade to grid, custom properties, animation, container queries and cascade layers, with the architecture choices (BEM, utility-first, CSS Modules, Sass) that keep stylesheets maintainable, plus projects and interview practice.',
  family: 'Frontend & Web',
  kind: 'language',
  icon: '🎨',
  tags: ['css', 'layout', 'flexbox', 'grid', 'animation', 'design systems', 'frontend'],
  languages: ['CSS'],
  explainMode: 'concept',
  code: { label: 'CSS', id: 'css', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-html'],
  style: 'code',
  categories: [
    {
      title: 'Getting Started and How CSS Works',
      description: 'Where styles come from, how the browser turns them into pixels, and how to see that happening.',
      topics: [
        {
          title: 'Adding CSS and reading the Styles panel',
          description: 'External stylesheets, style elements and inline style attributes, why external wins for caching and reuse, and using the DevTools Styles and Computed panels to see which rule actually applied and which lost.',
          concepts: ['External, embedded and inline CSS', 'The Styles panel and struck-through rules', 'The Computed panel', 'Editing styles live'],
          quiz: [
            ['Why prefer an external stylesheet?', 'It is cached across pages and keeps presentation out of the markup.'],
            ['What does a struck-through declaration in DevTools mean?', 'It was overridden by a rule with higher precedence.'],
          ],
        },
        {
          title: 'Rules, declarations and shorthand properties',
          description: 'Selector plus declaration block, property-value pairs, comments, how shorthand such as margin and background resets the longhands you did not mention, and why order inside a block matters.',
          concepts: ['Rule sets and declaration blocks', 'Shorthand versus longhand', 'Shorthand resetting omitted values', 'Comments and formatting conventions'],
          quiz: [
            ['What does margin: 0 auto set?', 'Top and bottom 0, left and right auto.'],
            ['What happens to background-color when you later write background: url(x.png)?', 'It resets to transparent, because the shorthand resets every longhand.'],
          ],
          prereqs: ['Adding CSS and reading the Styles panel'],
        },
        {
          title: 'How the browser applies styles',
          description: 'Parsing CSS into the CSSOM, matching selectors right to left, computing values, building the render tree and running layout and paint, and why that pipeline explains both performance and surprising results.',
          concepts: ['CSSOM and the render tree', 'Right-to-left selector matching', 'Specified, computed and used values', 'Style, layout and paint stages'],
          quiz: [
            ['In which direction does the browser match div p span?', 'From span outward: right to left.'],
            ['What is a computed value?', 'The value after inheritance and relative units are resolved, before layout.'],
          ],
          prereqs: ['Rules, declarations and shorthand properties'],
        },
        {
          title: 'Resets and normalisation',
          description: 'Browser default stylesheets differ; a reset removes them and a normaliser makes them consistent. What a modern minimal reset contains and why box-sizing and image rules belong in it.',
          concepts: ['User-agent stylesheets', 'Reset versus normalise', 'A modern minimal reset', 'Sensible defaults for images and forms'],
          quiz: [
            ['What is the difference between a reset and normalize.css?', 'A reset removes defaults; normalize keeps useful ones and evens out differences.'],
            ['Which rule almost every reset includes?', '*, *::before, *::after { box-sizing: border-box; }'],
          ],
        },
      ],
    },
    {
      title: 'Selectors and Specificity',
      topics: [
        {
          title: 'Type, class, id and universal selectors',
          description: 'The basic selectors and their costs: elements for defaults, classes for reusable styling, ids that are hard to override, the universal selector, and grouping selectors with commas.',
          concepts: ['Element and universal selectors', 'Class selectors and reuse', 'Why ids are avoided for styling', 'Selector lists with commas'],
          quiz: [
            ['Why avoid styling with ids?', 'Their high specificity makes overrides painful and they cannot be reused.'],
            ['What does .a.b match?', 'Elements with both classes a and b.'],
          ],
        },
        {
          title: 'Combinators',
          description: 'Descendant (space), child (>), next-sibling (+) and subsequent-sibling (~) combinators, what each can and cannot reach, and why deep descendant chains are fragile.',
          concepts: ['Descendant and child combinators', 'Adjacent and general sibling combinators', 'Fragility of deep chains', 'Combining with classes'],
          quiz: [
            ['What does ul > li match?', 'li elements that are direct children of a ul.'],
            ['What does h2 + p select?', 'A p immediately following an h2 as a sibling.'],
          ],
          prereqs: ['Type, class, id and universal selectors'],
        },
        {
          title: 'Attribute selectors',
          description: 'Matching on attribute presence and value with =, ~=, |=, ^=, $= and *=, case-insensitive matching with i, and practical uses such as styling links by protocol or inputs by type.',
          concepts: ['Presence and exact match', 'Prefix, suffix and substring matching', 'Case-insensitive flag', 'Styling inputs by type'],
          quiz: [
            ['What does a[href^="https"] match?', 'Links whose href starts with https.'],
            ['What does [data-state~="open"] mean?', 'The attribute value contains the space-separated word open.'],
          ],
          prereqs: ['Type, class, id and universal selectors'],
        },
        {
          title: 'Specificity calculation',
          description: 'The three-column score (ids, classes and attributes and pseudo-classes, elements and pseudo-elements), how ties fall to source order, why the universal selector scores zero and how to keep specificity flat.',
          concepts: ['The three specificity columns', 'Ties and source order', 'What scores zero', 'Keeping specificity flat'],
          quiz: [
            ['What is the specificity of nav ul li a.active?', '0,1,4.'],
            ['Which wins: .a .b or #c?', '#c, because one id beats any number of classes.'],
          ],
          prereqs: ['Combinators'],
        },
        {
          title: '!important and inline styles',
          description: 'Inline style attributes outrank any selector, !important outranks those, and the cascade reverses origin order for important declarations; when it is justified (utilities, overriding third-party CSS) and how to escape it.',
          concepts: ['Inline styles in the cascade', 'How !important reverses origins', 'Legitimate uses', 'Escaping an !important war'],
          quiz: [
            ['Can an inline style beat a stylesheet rule with !important?', 'Only if the inline style is also !important.'],
            ['Which wins between an author !important and a user !important declaration?', 'The user one.'],
          ],
          prereqs: ['Specificity calculation'],
        },
      ],
    },
    {
      title: 'Cascade, Inheritance and Values',
      topics: [
        {
          title: 'The cascade order',
          description: 'How conflicting declarations are resolved step by step: origin and importance, cascade layers, specificity, then source order, and why understanding the order removes most CSS surprises.',
          concepts: ['Origins: user agent, user, author', 'Importance and layers before specificity', 'Source order as the tiebreaker', 'Tracing a conflict in DevTools'],
          quiz: [
            ['What is checked before specificity in the cascade?', 'Origin and importance, then cascade layers.'],
            ['Two rules with equal specificity: which wins?', 'The one that appears later in source order.'],
          ],
        },
        {
          title: 'Inheritance and the reset keywords',
          description: 'Which properties inherit by default (text and font properties) and which do not (box properties), and the keywords inherit, initial, unset, revert and revert-layer for taking explicit control.',
          concepts: ['Inherited versus non-inherited properties', 'inherit and initial', 'unset and revert', 'revert-layer', 'The all shorthand'],
          quiz: [
            ['Does color inherit? Does border?', 'color inherits; border does not.'],
            ['What does unset do?', 'Acts as inherit for inherited properties and initial for the rest.'],
            ['What does all: revert do?', 'Rolls every property back to the user-agent or user value.'],
          ],
          prereqs: ['The cascade order'],
        },
        {
          title: 'Units: px, em, rem, percentages and viewport units',
          description: 'Absolute versus relative units, em compounding from the parent, rem tied to the root, percentages relative to a property-specific reference, and vw, vh, dvh, svh and lvh for viewport-relative sizing.',
          concepts: ['px and device pixels', 'em compounding and rem stability', 'What percentages are relative to', 'vw, vh and the dynamic viewport units'],
          quiz: [
            ['What is padding: 10% relative to?', 'The width of the containing block, even for top and bottom.'],
            ['Why prefer rem for font sizes?', 'It scales with the user\'s root font setting without compounding.'],
            ['What does dvh solve?', 'Mobile browser bars that shrink and grow the visible viewport.'],
          ],
        },
        {
          title: 'calc, min, max and clamp',
          description: 'Mixing units with calc, bounding values with min and max, fluid ranges with clamp, and where these functions replace media queries for sizing and spacing.',
          concepts: ['calc with mixed units', 'min and max', 'clamp for fluid ranges', 'Whitespace and division rules'],
          quiz: [
            ['What does clamp(1rem, 2.5vw, 2rem) produce?', 'A value that scales with the viewport but never below 1rem or above 2rem.'],
            ['Why does calc(100%-20px) fail?', 'Subtraction needs spaces around the operator.'],
          ],
          prereqs: ['Units: px, em, rem, percentages and viewport units'],
        },
      ],
    },
    {
      title: 'The Box Model and Display',
      topics: [
        {
          title: 'Content, padding, border and margin',
          description: 'The four boxes every element is drawn with, how width and height apply to the content box by default, and how outline differs from border by not taking space.',
          concepts: ['The four box areas', 'Width and height of the content box', 'Border and outline differences', 'Reading the box model diagram in DevTools'],
          quiz: [
            ['Does outline affect layout?', 'No, it is drawn outside the border without taking space.'],
            ['Total width of width: 200px; padding: 10px; border: 2px in content-box?', '224px.'],
          ],
        },
        {
          title: 'box-sizing and sizing keywords',
          description: 'content-box versus border-box, why border-box makes widths predictable, and intrinsic sizing keywords min-content, max-content and fit-content for boxes sized by their content.',
          concepts: ['content-box versus border-box', 'Setting border-box globally', 'min-content and max-content', 'fit-content'],
          quiz: [
            ['With border-box, what does width: 200px include?', 'Content, padding and border.'],
            ['What does width: max-content do?', 'Makes the box as wide as its content without wrapping.'],
          ],
          prereqs: ['Content, padding, border and margin'],
        },
        {
          title: 'Margin collapsing',
          description: 'Vertical margins between siblings, parent and first child, and empty blocks collapse into the larger one; what stops collapsing (padding, borders, flex and grid, BFCs) and how to avoid its surprises.',
          concepts: ['Sibling margin collapsing', 'Parent and child collapsing', 'What prevents collapsing', 'Block formatting contexts'],
          quiz: [
            ['Two stacked blocks with margin-bottom 20px and margin-top 30px: what is the gap?', '30px, the larger of the two.'],
            ['Do margins collapse inside a flex container?', 'No.'],
          ],
          prereqs: ['Content, padding, border and margin'],
        },
        {
          title: 'display, overflow and logical properties',
          description: 'block, inline, inline-block, none and contents, how overflow: hidden, auto and scroll clip or scroll content and create scroll containers, and logical properties such as margin-inline that follow writing direction.',
          concepts: ['block, inline and inline-block', 'display: none versus visibility: hidden', 'overflow values and scroll containers', 'Logical properties and writing modes'],
          quiz: [
            ['Can you set width on an inline element?', 'No; use inline-block or block.'],
            ['What does overflow: auto do?', 'Adds scrollbars only when content overflows.'],
            ['What is the logical equivalent of margin-left in a left-to-right document?', 'margin-inline-start.'],
          ],
        },
      ],
    },
    {
      title: 'Colour and Typography',
      topics: [
        {
          title: 'Colour formats: hex, rgb, hsl and oklch',
          description: 'Hex and rgb for legacy, hsl for intuitive hue and lightness tweaks, oklch for perceptually uniform palettes and wide-gamut displays, plus currentColor and color-mix.',
          concepts: ['Hex and rgb notation', 'hsl for tweaking hue and lightness', 'oklch and perceptual uniformity', 'currentColor and color-mix'],
          quiz: [
            ['Why does hsl make palettes easier?', 'Lightness and saturation can be adjusted without recalculating channels.'],
            ['What does color-mix(in oklch, red 30%, blue) produce?', 'A colour 30% red and 70% blue mixed in the oklch space.'],
          ],
        },
        {
          title: 'Opacity, backgrounds and gradients',
          description: 'Alpha channels versus the opacity property, multiple backgrounds and background-size, and linear, radial and conic gradients for decoration without images.',
          concepts: ['Alpha versus opacity', 'Multiple backgrounds and background-size', 'linear-gradient and radial-gradient', 'conic-gradient uses'],
          quiz: [
            ['Difference between rgb(0 0 0 / 0.5) and opacity: 0.5?', 'The alpha affects that colour only; opacity fades the whole element and its children.'],
            ['What does background-size: cover do?', 'Scales the image to fill the box, cropping as needed.'],
          ],
          prereqs: ['Colour formats: hex, rgb, hsl and oklch'],
        },
        {
          title: 'Web fonts and @font-face',
          description: 'Loading fonts with @font-face, WOFF2, font-display to control invisible text, preloading critical fonts, variable fonts and system font stacks as a fallback that costs nothing.',
          concepts: ['@font-face and WOFF2', 'font-display strategies', 'Preloading fonts', 'Variable fonts', 'System font stacks'],
          quiz: [
            ['What does font-display: swap do?', 'Shows fallback text immediately and swaps in the web font when it loads.'],
            ['Why use WOFF2?', 'It is the smallest widely supported font format.'],
          ],
        },
        {
          title: 'Font properties and line-height',
          description: 'font-family, size, weight, style and the font shorthand, unitless line-height and why it is safer, and letter-spacing and font features for polished typography.',
          concepts: ['font-family and fallbacks', 'Weight, style and the font shorthand', 'Unitless line-height', 'font-feature-settings and font-variant'],
          quiz: [
            ['Why use line-height: 1.5 instead of 1.5em?', 'Unitless values are inherited as a ratio and recomputed per element.'],
            ['What does font: italic 700 1rem/1.4 sans-serif set?', 'Style, weight, size, line-height and family in one declaration.'],
          ],
          prereqs: ['Web fonts and @font-face'],
        },
        {
          title: 'Text layout and overflow',
          description: 'text-align, text-decoration, text-transform, white-space and word-break for wrapping control, text-overflow: ellipsis and line-clamp for truncation, and hyphenation.',
          concepts: ['text-align and text-decoration', 'white-space and word-break', 'Truncating with ellipsis and line-clamp', 'Hyphenation and text-wrap: balance'],
          quiz: [
            ['What three properties make text-overflow: ellipsis work?', 'overflow: hidden, white-space: nowrap and text-overflow: ellipsis.'],
            ['What does overflow-wrap: anywhere do?', 'Allows breaking long unbreakable strings such as URLs.'],
          ],
        },
      ],
    },
    {
      title: 'Positioning and Stacking',
      topics: [
        {
          title: 'Normal flow and relative and absolute positioning',
          description: 'How blocks and inlines flow by default, relative offsets that keep the original space, absolute positioning relative to the nearest positioned ancestor, and inset shorthand.',
          concepts: ['Normal flow', 'position: relative', 'position: absolute and the containing block', 'inset and centering tricks'],
          quiz: [
            ['What does position: absolute position relative to?', 'The nearest ancestor with a position other than static.'],
            ['Does position: relative remove an element from flow?', 'No, its original space is preserved.'],
          ],
        },
        {
          title: 'Fixed and sticky positioning',
          description: 'fixed for elements pinned to the viewport, sticky for elements that scroll until a threshold then stick, what breaks sticky (overflow on ancestors) and how transforms create new containing blocks for fixed elements.',
          concepts: ['position: fixed and the viewport', 'position: sticky thresholds', 'Why sticky stops working', 'Transforms and containing blocks'],
          quiz: [
            ['Why might a sticky header not stick?', 'An ancestor has overflow hidden or auto, or the sticky element has no room to move.'],
            ['What happens to a fixed element inside a transformed parent?', 'It becomes positioned relative to that parent instead of the viewport.'],
          ],
          prereqs: ['Normal flow and relative and absolute positioning'],
        },
        {
          title: 'z-index and stacking contexts',
          description: 'Painting order, why z-index only works on positioned or flex and grid items, what creates a stacking context (opacity, transform, isolation) and why a high z-index cannot escape its context.',
          concepts: ['Painting order basics', 'When z-index applies', 'What creates a stacking context', 'isolation: isolate'],
          quiz: [
            ['Why does z-index: 9999 sometimes fail?', 'The element is trapped inside a parent stacking context with a lower z-index.'],
            ['Does opacity: 0.9 create a stacking context?', 'Yes, any opacity below 1 does.'],
          ],
          prereqs: ['Fixed and sticky positioning'],
        },
        {
          title: 'Floats and clearing',
          description: 'Floats for wrapping text around images, their legacy use for layout, the clearfix and display: flow-root, and why flexbox and grid replaced them for page structure.',
          concepts: ['float for text wrapping', 'clear and the clearfix', 'display: flow-root', 'Why floats are not for layout'],
          quiz: [
            ['What does display: flow-root do?', 'Creates a block formatting context so the parent contains its floats.'],
            ['What is float still good for?', 'Wrapping text around an image or pull quote.'],
          ],
        },
      ],
    },
    {
      title: 'Flexbox',
      topics: [
        {
          title: 'Flex containers and axes',
          description: 'display: flex, the main and cross axis set by flex-direction, how children become flex items, and the default behaviours (no wrap, stretch) that surprise beginners.',
          concepts: ['display: flex and flex items', 'flex-direction and the main axis', 'Default stretch and no-wrap', 'Inline-flex'],
          quiz: [
            ['What does flex-direction: column change?', 'The main axis becomes vertical.'],
            ['Why do flex items stretch to the same height by default?', 'align-items defaults to stretch.'],
          ],
        },
        {
          title: 'flex-grow, flex-shrink and flex-basis',
          description: 'How free space is distributed and removed, flex-basis as the starting size, the flex shorthand values 1, auto and none, and min-width: auto stopping items from shrinking.',
          concepts: ['flex-grow and free space', 'flex-shrink and overflow', 'flex-basis versus width', 'The flex shorthand and min-width: auto'],
          quiz: [
            ['What does flex: 1 expand to?', 'flex-grow 1, flex-shrink 1, flex-basis 0.'],
            ['Why does a flex item refuse to shrink below its content?', 'min-width defaults to auto; set min-width: 0.'],
          ],
          prereqs: ['Flex containers and axes'],
        },
        {
          title: 'Alignment, gap, wrapping and order',
          description: 'justify-content on the main axis, align-items and align-self on the cross axis, gap instead of margins, flex-wrap with align-content, margin auto for pushing items, and the accessibility cost of order.',
          concepts: ['justify-content and align-items', 'gap in flex layouts', 'flex-wrap and align-content', 'margin-left: auto tricks', 'order and reading sequence'],
          quiz: [
            ['How do you push one item to the far end?', 'Give it margin-left: auto (or margin-inline-start).'],
            ['When does align-content take effect?', 'Only with multiple lines, that is when wrapping occurs.'],
            ['Why is order risky?', 'It changes visual order but not tab or reading order.'],
          ],
          prereqs: ['flex-grow, flex-shrink and flex-basis'],
        },
      ],
    },
    {
      title: 'Grid',
      topics: [
        {
          title: 'Defining tracks with grid-template',
          description: 'display: grid, grid-template-columns and rows with fixed, fr and minmax tracks, repeat with auto-fill and auto-fit for responsive columns, and gap for gutters.',
          concepts: ['grid-template-columns and fr', 'minmax and repeat', 'auto-fill versus auto-fit', 'Row and column gap'],
          quiz: [
            ['What does repeat(auto-fit, minmax(200px, 1fr)) do?', 'Fits as many 200px-minimum columns as possible and stretches them.'],
            ['Difference between auto-fill and auto-fit?', 'auto-fit collapses empty tracks so items expand; auto-fill keeps them.'],
          ],
        },
        {
          title: 'Placing items with lines and areas',
          description: 'grid-column and grid-row with line numbers, negative lines and span, named lines, and grid-template-areas for an ASCII-art layout that reads like the page.',
          concepts: ['Line-based placement and span', 'Negative line numbers', 'Named lines', 'grid-template-areas'],
          quiz: [
            ['What does grid-column: 1 / -1 do?', 'Spans from the first line to the last, the full width.'],
            ['How do you leave a cell empty in grid-template-areas?', 'Use a period as the name.'],
          ],
          prereqs: ['Defining tracks with grid-template'],
        },
        {
          title: 'The implicit grid and auto placement',
          description: 'What happens to items beyond the defined tracks, grid-auto-rows and grid-auto-columns, grid-auto-flow with dense packing, and using auto rows for content-sized cards.',
          concepts: ['Implicit tracks', 'grid-auto-rows and columns', 'grid-auto-flow and dense', 'Content-sized implicit rows'],
          quiz: [
            ['What size are implicit rows by default?', 'auto, sized by their content.'],
            ['What does grid-auto-flow: dense do?', 'Backfills earlier holes with later items that fit.'],
          ],
          prereqs: ['Placing items with lines and areas'],
        },
        {
          title: 'Alignment in grid and subgrid',
          description: 'justify-items and align-items for cells, justify-content and align-content for the whole grid, place-* shorthands, and subgrid so nested grids share the parent tracks for aligned card content.',
          concepts: ['justify-items and align-items in grid', 'Aligning the whole grid', 'place-items and place-content', 'subgrid for nested alignment'],
          quiz: [
            ['How do you centre a single item in its cell?', 'place-self: center, or place-items: center on the grid.'],
            ['What problem does subgrid solve?', 'Aligning rows across sibling cards whose inner grids would otherwise be independent.'],
          ],
          prereqs: ['The implicit grid and auto placement'],
        },
      ],
    },
    {
      title: 'Custom Properties, Transitions, Animations and Transforms',
      topics: [
        {
          title: 'Custom properties and var()',
          description: 'Declaring --tokens on :root or any element, reading them with var() and a fallback, how they inherit and cascade like normal properties, and why they beat preprocessor variables at runtime.',
          concepts: ['Declaring and scoping custom properties', 'var() with fallbacks', 'Inheritance and runtime updates', 'Invalid at computed-value time'],
          quiz: [
            ['What does var(--gap, 1rem) do if --gap is undefined?', 'Uses 1rem as the fallback.'],
            ['Can JavaScript change a custom property?', 'Yes, with element.style.setProperty("--name", value).'],
          ],
        },
        {
          title: 'Theming with custom properties and color-scheme',
          description: 'Building light and dark themes by swapping token values under prefers-color-scheme or a data attribute, color-scheme for native controls, and @property for typed, animatable custom properties.',
          concepts: ['Token layers: primitives and semantics', 'Dark mode with prefers-color-scheme', 'The color-scheme property', '@property registration'],
          quiz: [
            ['What does color-scheme: light dark do?', 'Tells the browser to render form controls and scrollbars in either scheme.'],
            ['Why register a custom property with @property?', 'To give it a type, initial value and make it animatable.'],
          ],
          prereqs: ['Custom properties and var()'],
        },
        {
          title: 'Transitions',
          description: 'transition-property, duration, timing-function and delay, which properties can animate, why display cannot transition without tricks, and easing curves with cubic-bezier.',
          concepts: ['The transition shorthand', 'Animatable properties', 'Timing functions and cubic-bezier', 'Transitioning to auto and display'],
          quiz: [
            ['Why does transitioning height to auto not work?', 'auto is not interpolable; use grid-template-rows or interpolate-size.'],
            ['What does transition: all cost?', 'It watches every property and can trigger unintended animations.'],
          ],
        },
        {
          title: 'Keyframe animations',
          description: '@keyframes with percentages, animation-duration, iteration-count, direction and fill-mode, pausing with animation-play-state, and honouring prefers-reduced-motion.',
          concepts: ['@keyframes and the animation shorthand', 'iteration-count and direction', 'fill-mode', 'prefers-reduced-motion'],
          quiz: [
            ['What does animation-fill-mode: forwards do?', 'Keeps the final keyframe styles after the animation ends.'],
            ['How should you respect reduced motion?', 'Wrap or override animations inside @media (prefers-reduced-motion: reduce).'],
          ],
          prereqs: ['Transitions'],
        },
        {
          title: 'Transforms',
          description: 'translate, scale, rotate and skew in 2D, the individual transform properties, transform-origin, 3D transforms with perspective, and why transforms animate cheaply on the compositor.',
          concepts: ['translate, scale, rotate and skew', 'Individual transform properties', 'transform-origin', '3D transforms and perspective', 'Compositor-only animation'],
          quiz: [
            ['Why animate transform instead of left or top?', 'Transforms run on the compositor without layout or paint.'],
            ['What does transform-origin: top left change?', 'The point around which scale and rotate apply.'],
          ],
          prereqs: ['Transitions'],
        },
      ],
    },
    {
      title: 'Pseudo-classes, Pseudo-elements and Modern CSS',
      topics: [
        {
          title: 'State and structural pseudo-classes',
          description: ':hover, :focus, :focus-visible and :active, form states like :checked and :disabled, and structural selectors :first-child, :nth-child(an+b) and :not for targeting by position.',
          concepts: [':hover, :focus and :focus-visible', 'Form state pseudo-classes', ':nth-child and :nth-of-type', ':not and :empty'],
          quiz: [
            ['What does :nth-child(2n+1) select?', 'Odd-numbered children.'],
            ['Why prefer :focus-visible over :focus?', 'It shows focus rings for keyboard users without flashing them on every click.'],
          ],
        },
        {
          title: 'Pseudo-elements',
          description: '::before and ::after with content for decoration and icons, ::marker for list bullets, ::selection, ::placeholder, ::first-line and ::first-letter, and their limits.',
          concepts: ['::before and ::after with content', '::marker and ::selection', '::placeholder and ::first-letter', 'Limits of pseudo-elements'],
          quiz: [
            ['Why does ::before not render?', 'It needs a content declaration, even content: "".'],
            ['Can you style list bullets directly?', 'Yes, with ::marker.'],
          ],
          prereqs: ['State and structural pseudo-classes'],
        },
        {
          title: ':is, :where and :has',
          description: ':is for grouping without repetition, :where for the same with zero specificity, and :has as a parent and relational selector that finally lets CSS react to what an element contains.',
          concepts: [':is for grouping', ':where and zero specificity', ':has as a parent selector', 'Relational patterns with :has'],
          quiz: [
            ['What specificity does :where(.a, #b) add?', 'Zero.'],
            ['What does .card:has(img) match?', 'Cards that contain an image.'],
          ],
          prereqs: ['State and structural pseudo-classes'],
        },
        {
          title: 'Media and feature queries',
          description: '@media by width, orientation, hover, pointer and user preferences, range syntax with width >= 40em, and @supports for progressive enhancement when a feature may be missing.',
          concepts: ['@media features and range syntax', 'hover and pointer media features', 'User preference queries', '@supports feature queries'],
          quiz: [
            ['What does @media (width >= 40em) mean?', 'Viewport width of 40em or more; the modern range syntax.'],
            ['When do you use @supports?', 'To apply styles only where a property or selector is supported.'],
          ],
        },
        {
          title: 'Container queries',
          description: 'container-type and container-name on a parent, @container rules that respond to the component\'s own space rather than the viewport, container query units like cqi, and style queries.',
          concepts: ['container-type and containment', 'Naming containers', '@container size queries', 'cqi and cqw units', 'Style queries'],
          quiz: [
            ['What must the parent declare before @container works?', 'container-type: inline-size (or size).'],
            ['Why prefer container queries for components?', 'The same component adapts wherever it is placed, not just per viewport.'],
          ],
          prereqs: ['Media and feature queries'],
        },
        {
          title: 'Native nesting',
          description: 'Nesting rules inside rules, the & selector, nesting media queries inside components, how it differs from Sass nesting and how to keep nesting shallow.',
          concepts: ['Nesting syntax and &', 'Nesting at-rules', 'Differences from Sass', 'Keeping nesting shallow'],
          quiz: [
            ['What does & mean inside a nested rule?', 'The parent selector.'],
            ['How do you nest a state?', '.btn { &:hover { ... } }'],
          ],
          prereqs: [':is, :where and :has'],
        },
        {
          title: 'Cascade layers',
          description: '@layer to declare an explicit precedence order for resets, third-party, components and utilities, so later layers win regardless of specificity, and how unlayered styles rank above them.',
          concepts: ['Declaring layer order', 'Assigning rules to layers', 'Unlayered styles and precedence', 'Layering third-party CSS'],
          quiz: [
            ['Which layer wins: the first or last declared?', 'The last declared layer wins.'],
            ['Where do unlayered styles rank?', 'Above all layers for normal declarations.'],
          ],
          prereqs: ['The cascade order'],
        },
      ],
    },
    {
      title: 'Architecture and Tooling',
      topics: [
        {
          title: 'BEM naming',
          description: 'Block, element and modifier classes that keep specificity flat and make components portable, the naming rules, and what BEM does not solve.',
          concepts: ['Block, element, modifier', 'Flat specificity by design', 'Modifiers versus states', 'Where BEM falls short'],
          quiz: [
            ['Write a BEM class for a disabled button inside a card.', '.card__button--disabled'],
            ['Why does BEM avoid nesting selectors?', 'Single classes keep specificity flat and components portable.'],
          ],
        },
        {
          title: 'Utility-first CSS',
          description: 'Composing designs from small single-purpose classes as Tailwind does, design tokens as the constraint system, purging unused classes, and the trade-offs versus semantic class names.',
          concepts: ['Single-purpose utilities', 'Design tokens as constraints', 'Purging and build steps', 'Trade-offs versus semantic CSS'],
          quiz: [
            ['How does utility-first CSS stay small in production?', 'The build scans templates and only emits classes that are used.'],
            ['What is the main criticism of utility classes?', 'Long class lists in markup and duplication across components.'],
          ],
        },
        {
          title: 'CSS Modules and scoped styles',
          description: 'Locally scoped class names generated at build time, composing classes, how frameworks like Vue and Svelte scope styles, and when global styles are still needed.',
          concepts: ['Local class name hashing', 'Composition in modules', 'Framework scoped styles', 'Global escape hatches'],
          quiz: [
            ['How do CSS Modules avoid collisions?', 'Class names are rewritten to unique hashes at build time.'],
            ['How do you write a global rule in a CSS Module?', ':global(.selector).'],
          ],
        },
        {
          title: 'Sass and preprocessors',
          description: 'Variables, nesting, mixins, functions and partials in Sass, what native CSS now covers, and when a preprocessor still earns its build step.',
          concepts: ['Sass variables and partials', 'Mixins and functions', 'What native CSS replaced', 'Deciding whether you still need Sass'],
          quiz: [
            ['What native CSS feature replaced Sass variables for theming?', 'Custom properties, which work at runtime.'],
            ['What does @use do compared with @import?', 'Loads a module once with a namespace; @import is deprecated.'],
          ],
          prereqs: ['Native nesting'],
        },
        {
          title: 'PostCSS, Autoprefixer and Lightning CSS',
          description: 'Transforming CSS at build time: vendor prefixes from browserslist, syntax lowering for older browsers, minification and how bundlers wire these in.',
          concepts: ['PostCSS plugins', 'Autoprefixer and browserslist', 'Syntax lowering with Lightning CSS', 'Minification and source maps'],
          quiz: [
            ['What decides which prefixes Autoprefixer adds?', 'The browserslist targets configured for the project.'],
            ['What does Lightning CSS add over minification?', 'Transpiling modern syntax such as nesting for older browsers.'],
          ],
        },
        {
          title: 'Debugging layout problems',
          description: 'The DevTools flex and grid overlays, outline tricks to see boxes, finding the element that causes horizontal scroll, and diagnosing why a rule is not applying.',
          concepts: ['Flex and grid overlays', 'Outline everything trick', 'Finding horizontal overflow', 'Why is my rule not applying?'],
          quiz: [
            ['Quick way to find what overflows horizontally?', 'Outline every element or query for elements wider than the viewport.'],
            ['First check when a rule seems ignored?', 'Look in the Styles panel for it being struck through or the selector not matching.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: responsive landing page',
          description: 'Build a landing page with a grid-based hero, flex navigation, fluid type with clamp, a card grid using auto-fit, custom-property theming with a dark mode, and no horizontal scroll at any width.',
          concepts: ['Set up tokens and a reset', 'Lay out header and hero', 'Build the card grid', 'Add dark mode and polish'],
          quiz: [
            ['How do you get a responsive card grid without media queries?', 'grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)).'],
            ['Where do theme colours live?', 'In custom properties on :root, overridden in a dark scheme block.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CSS-only component kit',
          description: 'A set of components, buttons, toggles, tabs with :has, tooltips with ::after and accordions with details, using cascade layers for reset, base and components and documented in a style guide page.',
          concepts: ['Define layers and tokens', 'Build buttons and form controls', 'Tabs and accordions without JS', 'Document in a style guide'],
          quiz: [
            ['How can tabs work without JavaScript?', 'Radio inputs with :checked and :has, or details elements.'],
            ['Why put the reset in its own layer?', 'So component styles always beat it regardless of specificity.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: animated dashboard layout',
          description: 'A dashboard with a sticky sidebar, grid areas that reflow with container queries, animated cards using transforms and transitions, a reduced-motion fallback and a print stylesheet.',
          concepts: ['Grid areas and sticky sidebar', 'Container-query cards', 'Transitions and keyframe polish', 'Reduced motion and print'],
          quiz: [
            ['How do cards adapt to the sidebar collapsing?', 'Container queries on the card wrapper, not viewport media queries.'],
            ['What should the print stylesheet hide?', 'Navigation, sidebars and interactive controls.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: recreate a real site',
          description: 'Pick a well-known page and rebuild its layout pixel-close with semantic HTML and modern CSS, measuring with DevTools, then refactor with BEM or utilities and compare the two approaches.',
          concepts: ['Measure and plan the layout', 'Build with grid and flex', 'Match typography and spacing', 'Refactor and compare architectures'],
          quiz: [
            ['How do you measure spacing on a live site?', 'Inspect the element and read the box model panel.'],
            ['What is the first decision when rebuilding a layout?', 'Which regions are grid and which are flex, based on one or two dimensions.'],
          ],
          style: 'project',
        },
        {
          title: 'CSS interview questions',
          description: 'The questions that keep coming up: specificity puzzles, box-sizing, margin collapsing, flex versus grid, stacking contexts, rem versus em, centering and how the cascade resolves conflicts.',
          concepts: ['Specificity and cascade questions', 'Layout questions', 'Stacking and positioning questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Name three ways to centre a div.', 'Flex with justify and align centre, grid place-items centre, or absolute plus translate.'],
            ['When would you choose grid over flexbox?', 'For two-dimensional layouts where rows and columns must align.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live layout challenges',
          description: 'Timed exercises interviewers give: a holy grail layout, a responsive nav bar, a modal overlay, equal-height cards and a sticky footer, each built from a blank file while explaining choices.',
          concepts: ['Holy grail layout', 'Modal overlay and backdrop', 'Equal-height cards', 'Sticky footer'],
          quiz: [
            ['How do you keep a footer at the bottom of short pages?', 'A min-height: 100dvh grid or flex column with the main area growing.'],
            ['How do you get equal-height cards?', 'Put them in a flex row or grid; stretch is the default.'],
          ],
        },
      ],
    },
  ],
})
