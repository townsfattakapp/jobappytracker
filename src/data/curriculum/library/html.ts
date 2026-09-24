import { defineTrack } from '../define'

export const html = defineTrack({
  id: 'track-html',
  title: 'HTML',
  description: 'HTML as a language rather than a formality: document structure, semantic elements, text, links, responsive images and media, tables, forms with built-in validation, metadata and SEO, embedding SVG and canvas, the DOM, templates and web components, validation habits, and projects.',
  family: 'Frontend & Web',
  kind: 'language',
  icon: '🧱',
  tags: ['html', 'semantics', 'forms', 'accessibility', 'seo', 'web components', 'frontend'],
  languages: ['HTML'],
  explainMode: 'concept',
  code: { label: 'HTML', id: 'html', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],
  style: 'code',
  categories: [
    {
      title: 'Documents and Structure',
      description: 'What a browser needs from a file before anything renders, and the rules the parser follows.',
      topics: [
        {
          title: 'Setting up an HTML project and the browser tools',
          description: 'A folder, an editor with Emmet, a live-reload server and the Elements panel of DevTools: enough to see every change instantly and inspect what the browser actually built from your markup.',
          concepts: ['Editor and Emmet abbreviations', 'Serving files with a local server', 'The Elements panel in DevTools', 'View source versus the live DOM'],
          quiz: [
            ['Why serve files over http://localhost instead of opening them with file://?', 'Many features such as fetch, modules and cookies are blocked or behave differently on file URLs.'],
            ['What does the Emmet abbreviation ul>li*3 expand to?', 'A ul containing three li elements.'],
          ],
        },
        {
          title: 'The anatomy of an HTML document',
          description: 'The doctype that switches on standards mode, the html root with a lang attribute, head for metadata and body for content, and what the browser silently inserts when you leave parts out.',
          concepts: ['The doctype and standards mode', 'html, head and body', 'The lang attribute', 'Implied elements the parser adds'],
          quiz: [
            ['What does <!DOCTYPE html> do?', 'Puts the browser in standards mode instead of quirks mode.'],
            ['What happens if you omit <head> and <body>?', 'The parser creates them anyway; they are implied.'],
            ['Why set lang on the html element?', 'It drives hyphenation, spell-check, font selection and screen-reader pronunciation.'],
          ],
          prereqs: ['Setting up an HTML project and the browser tools'],
        },
        {
          title: 'Elements, attributes and nesting rules',
          description: 'Tags, content and void elements, boolean and enumerated attributes, quoting rules, and the content model that decides which elements may legally live inside which.',
          concepts: ['Start tags, end tags and void elements', 'Attribute syntax and quoting', 'Boolean and enumerated attributes', 'Content models and permitted parents'],
          quiz: [
            ['Name three void elements.', 'img, br, input (also meta, link, hr).'],
            ['Is <p><div></div></p> valid?', 'No. p only allows phrasing content, so the parser closes the p before the div.'],
            ['What does disabled="false" do on an input?', 'Still disables it; boolean attributes are true whenever present.'],
          ],
          prereqs: ['The anatomy of an HTML document'],
        },
        {
          title: 'Character encoding, entities and whitespace',
          description: 'Declaring UTF-8 first in the head, when to use named and numeric entities such as &amp; and &#8212;, and how the parser collapses runs of whitespace so that layout does not depend on your indentation.',
          concepts: ['meta charset and UTF-8', 'Named and numeric character references', 'Escaping <, & and quotes', 'Whitespace collapsing'],
          quiz: [
            ['Which characters must always be escaped in text content?', '< and &.'],
            ['Where should <meta charset="utf-8"> appear?', 'Within the first 1024 bytes of the document, first in the head.'],
          ],
        },
      ],
    },
    {
      title: 'Text and Lists',
      topics: [
        {
          title: 'Headings and paragraphs',
          description: 'h1 to h6 as an outline for readers and assistive tech, p for blocks of prose, br and hr for the rare cases they fit, and why headings should never be chosen for their default font size.',
          concepts: ['h1 to h6 as structure not style', 'Paragraphs and line breaks', 'Thematic breaks with hr', 'Skipping heading levels'],
          quiz: [
            ['How many h1 elements should a page have?', 'Usually one, describing the page as a whole.'],
            ['When is br appropriate?', 'For line breaks that are part of the content, such as addresses or poems.'],
          ],
        },
        {
          title: 'Inline text semantics',
          description: 'strong and em for importance and stress versus b and i for typographic offset, mark, small, abbr with a title, time with a machine-readable datetime, and span as the meaningless fallback.',
          concepts: ['strong and em versus b and i', 'abbr, time and data', 'mark, small, sub and sup', 'span when nothing else fits'],
          quiz: [
            ['Difference between em and i?', 'em conveys stress emphasis; i marks text set off from prose such as a term or ship name.'],
            ['What does <time datetime="2026-09-23"> provide?', 'A machine-readable date for the human-readable text inside.'],
          ],
          prereqs: ['Headings and paragraphs'],
        },
        {
          title: 'Lists: ul, ol and dl',
          description: 'Unordered and ordered lists with start, reversed and type, nested lists placed inside li, and description lists for term and definition pairs such as glossaries and metadata.',
          concepts: ['ul and ol with start and reversed', 'Nesting lists correctly', 'dl, dt and dd', 'Lists for navigation and grouping'],
          quiz: [
            ['Where does a nested list go?', 'Inside the parent li, not directly inside the ul.'],
            ['What does <ol start="5"> do?', 'Numbering begins at 5.'],
            ['When is dl the right element?', 'For name-value groups like glossary terms or key-value metadata.'],
          ],
        },
        {
          title: 'Quotations, code and preformatted text',
          description: 'blockquote and q with cite, pre for whitespace-preserving blocks, code, kbd, samp and var for technical prose, and how to escape angle brackets inside code samples.',
          concepts: ['blockquote and q with cite', 'pre and preserved whitespace', 'code, kbd, samp and var', 'Escaping markup inside code'],
          quiz: [
            ['How do you show <div> literally inside a code element?', 'Write &lt;div&gt;.'],
            ['What does the cite attribute on blockquote hold?', 'A URL pointing to the source of the quotation.'],
          ],
        },
      ],
    },
    {
      title: 'Links and Navigation',
      topics: [
        {
          title: 'Anchors, hrefs and URL forms',
          description: 'The a element with absolute, root-relative and document-relative URLs, fragment links to ids, mailto and tel schemes, and how the base element changes resolution.',
          concepts: ['Absolute, root-relative and relative URLs', 'Fragment links to ids', 'mailto, tel and other schemes', 'The base element'],
          quiz: [
            ['What does href="/about" resolve to on https://example.com/blog/post?', 'https://example.com/about, because a leading slash is root-relative.'],
            ['How do you link to a section on the same page?', 'href="#section-id" targeting an element with that id.'],
          ],
        },
        {
          title: 'Link targets, rel and download',
          description: 'target="_blank" with rel="noopener" (now implied), rel values such as nofollow, external and alternate, the download attribute, and writing link text that makes sense out of context.',
          concepts: ['target and new windows', 'rel values and their meaning', 'The download attribute', 'Descriptive link text'],
          quiz: [
            ['Why was rel="noopener" recommended with target="_blank"?', 'It stops the new page accessing window.opener; modern browsers now imply it.'],
            ['What does rel="nofollow" tell search engines?', 'Do not pass ranking signal through this link.'],
          ],
          prereqs: ['Anchors, hrefs and URL forms'],
        },
        {
          title: 'Navigation landmarks and skip links',
          description: 'Wrapping primary navigation in nav, marking the current page with aria-current, and adding a skip link so keyboard users jump past repeated menus straight to main content.',
          concepts: ['The nav element and when to use it', 'aria-current="page"', 'Skip links to main', 'Breadcrumb markup'],
          quiz: [
            ['Should every group of links be a nav?', 'No, only major navigation blocks; a footer link list can be a plain list.'],
            ['What does a skip link target?', 'The main element or its id so keyboard users bypass the header.'],
          ],
          prereqs: ['Link targets, rel and download'],
        },
      ],
    },
    {
      title: 'Images and Media',
      topics: [
        {
          title: 'The img element and alt text',
          description: 'src, width and height to reserve space, alt that describes function rather than appearance, empty alt for decorative images, and formats such as JPEG, PNG, WebP, AVIF and SVG.',
          concepts: ['src, width and height', 'Writing useful alt text', 'Decorative images and alt=""', 'Choosing an image format'],
          quiz: [
            ['Why set width and height on img?', 'The browser reserves space before loading, avoiding layout shift.'],
            ['What alt should a purely decorative image have?', 'An empty alt attribute so screen readers skip it.'],
            ['Which format usually gives the smallest photos?', 'AVIF, then WebP, with JPEG as the fallback.'],
          ],
        },
        {
          title: 'Responsive images with srcset and sizes',
          description: 'Letting the browser choose among candidates: width descriptors with sizes for fluid images, density descriptors for fixed-size ones, and why sizes must reflect the CSS layout.',
          concepts: ['srcset with width descriptors', 'The sizes attribute', 'Density descriptors 1x and 2x', 'How the browser picks a candidate'],
          quiz: [
            ['What does sizes="(min-width: 60em) 30vw, 100vw" say?', 'The image is 30% of the viewport on wide screens, otherwise full width.'],
            ['When are density descriptors enough?', 'When the image renders at a fixed CSS size on every screen.'],
          ],
          prereqs: ['The img element and alt text'],
        },
        {
          title: 'Art direction with picture',
          description: 'The picture element with source media and type attributes for cropping differently per breakpoint or serving AVIF with a JPEG fallback, always ending in an img that carries the alt.',
          concepts: ['picture and source', 'media queries on source', 'Format fallbacks with type', 'The img child as fallback'],
          quiz: [
            ['Where does alt text go in a picture element?', 'On the img child; source has no alt.'],
            ['How does the browser choose among source elements?', 'The first one whose media and type match wins.'],
          ],
          prereqs: ['Responsive images with srcset and sizes'],
        },
        {
          title: 'Video and audio elements',
          description: 'video and audio with controls, multiple source formats, poster images, preload and autoplay rules (muted only), and track elements for captions and subtitles.',
          concepts: ['video and audio attributes', 'Multiple sources and codecs', 'Autoplay and muted policies', 'track for captions and subtitles'],
          quiz: [
            ['Why does autoplay often fail?', 'Browsers block autoplay with sound; add muted or wait for a user gesture.'],
            ['What file format do track captions use?', 'WebVTT (.vtt).'],
          ],
        },
        {
          title: 'Figures, captions and lazy loading',
          description: 'figure and figcaption for self-contained illustrations, loading="lazy" and decoding="async" on images below the fold, and fetchpriority for the hero image that matters most.',
          concepts: ['figure and figcaption', 'loading="lazy" and when not to use it', 'decoding="async"', 'fetchpriority="high"'],
          quiz: [
            ['Should the hero image be lazy loaded?', 'No, lazy loading delays it; use fetchpriority="high" instead.'],
            ['What goes in figcaption?', 'A caption or legend for the figure, before or after the content.'],
          ],
          prereqs: ['The img element and alt text'],
        },
      ],
    },
    {
      title: 'Tables',
      topics: [
        {
          title: 'Table structure: thead, tbody and tfoot',
          description: 'table, tr, th and td, grouping rows into head, body and foot so headers repeat when printing and styles target the right region, and why tables are for data not layout.',
          concepts: ['table, tr, th and td', 'thead, tbody and tfoot', 'Tables for data not layout', 'Sorting and scrolling considerations'],
          quiz: [
            ['What is the difference between th and td?', 'th is a header cell; td holds data.'],
            ['Why never use tables for page layout?', 'They break the reading order for assistive tech and do not adapt to small screens.'],
          ],
        },
        {
          title: 'Headers, scope and captions',
          description: 'caption for the table title, scope="col" and scope="row" so screen readers announce the right header with each cell, and headers/id pairing for complex tables.',
          concepts: ['caption as the table title', 'scope on header cells', 'headers and id for complex tables', 'Describing a table with aria-describedby'],
          quiz: [
            ['What does scope="row" on a th do?', 'Associates that header with every cell in its row.'],
            ['Where must caption appear?', 'As the first child of the table.'],
          ],
          prereqs: ['Table structure: thead, tbody and tfoot'],
        },
        {
          title: 'Spanning cells and column groups',
          description: 'colspan and rowspan for merged cells, colgroup and col for column-wide styling, and keeping row counts consistent so the table stays a rectangle.',
          concepts: ['colspan and rowspan', 'colgroup and col', 'Keeping the grid consistent', 'Empty cells and placeholders'],
          quiz: [
            ['What does colspan="2" do?', 'Makes the cell span two columns.'],
            ['What can you style with col?', 'Background, width, border and visibility of the whole column.'],
          ],
          prereqs: ['Headers, scope and captions'],
        },
      ],
    },
    {
      title: 'Forms and Inputs',
      description: 'Collecting input with markup that validates, autofills and reads correctly before any JavaScript is involved.',
      topics: [
        {
          title: 'The form element and submission',
          description: 'action and method, how GET encodes fields into the query string and POST into the body, enctype for files, the name attribute that decides what gets sent, and implicit submission with Enter.',
          concepts: ['action and method', 'GET versus POST encoding', 'The name attribute and submitted data', 'Implicit submission and submit buttons'],
          quiz: [
            ['Which fields are submitted?', 'Successful controls: those with a name that are not disabled.'],
            ['Which enctype is needed for file uploads?', 'multipart/form-data.'],
          ],
        },
        {
          title: 'Input types',
          description: 'text, email, url, tel, number, range, date, time, color, search, password, checkbox, radio, hidden and file: each changes the keyboard, the widget and the validation the browser applies for free.',
          concepts: ['Text-like types and mobile keyboards', 'number, range and steps', 'date, time and color pickers', 'checkbox, radio and hidden', 'inputmode as a hint'],
          quiz: [
            ['What does type="email" change?', 'Mobile keyboard layout and built-in format validation.'],
            ['How do radio buttons form a group?', 'They share the same name attribute.'],
            ['When use inputmode="numeric" instead of type="number"?', 'For digits that are not quantities, like card or postal codes, to keep a numeric keyboard without spinners.'],
          ],
          prereqs: ['The form element and submission'],
        },
        {
          title: 'Labels, fieldsets and legends',
          description: 'Explicit for/id and implicit wrapping labels that enlarge the click target and give controls an accessible name, fieldset and legend for grouping related controls such as radio sets.',
          concepts: ['label with for and id', 'Wrapping labels', 'fieldset and legend', 'Placeholder is not a label'],
          quiz: [
            ['Why is placeholder not a substitute for label?', 'It disappears on typing and is often skipped by assistive tech.'],
            ['What should wrap a group of radio buttons?', 'A fieldset with a legend naming the question.'],
          ],
          prereqs: ['Input types'],
        },
        {
          title: 'Validation attributes and the constraint API',
          description: 'required, minlength, maxlength, min, max, step and pattern give native validation with browser messages; novalidate turns it off, and the :valid and :invalid states plus setCustomValidity extend it.',
          concepts: ['required, min, max and step', 'pattern and regular expressions', 'novalidate and formnovalidate', ':valid, :invalid and setCustomValidity'],
          quiz: [
            ['What does pattern="[0-9]{4}" require?', 'Exactly four digits.'],
            ['When does the browser check constraints?', 'On submit, unless novalidate is set, and live for the :invalid pseudo-class.'],
            ['How do you show a custom error message?', 'Call setCustomValidity("message") on the control.'],
          ],
          prereqs: ['Input types'],
        },
        {
          title: 'select, datalist, textarea and buttons',
          description: 'select with option and optgroup, multiple selection, datalist for suggestions on a free-text input, textarea rows and wrap, and the three button types with type="button" as the safe default.',
          concepts: ['select, option and optgroup', 'datalist suggestions', 'textarea sizing', 'button types: submit, reset, button'],
          quiz: [
            ['What is the default type of a button inside a form?', 'submit.'],
            ['How does datalist attach to an input?', 'The input\'s list attribute references the datalist id.'],
          ],
          prereqs: ['Input types'],
        },
        {
          title: 'File uploads and autofill',
          description: 'input type="file" with accept and multiple, capture for cameras, and autocomplete tokens such as given-name, email and one-time-code that make browsers and password managers fill fields correctly.',
          concepts: ['type="file" with accept and multiple', 'capture for camera input', 'autocomplete tokens', 'Password manager compatibility'],
          quiz: [
            ['What does accept="image/*" do?', 'Filters the file picker to image types.'],
            ['Which autocomplete value is used for SMS codes?', 'one-time-code.'],
          ],
          prereqs: ['Labels, fieldsets and legends'],
        },
      ],
    },
    {
      title: 'Semantic Sectioning and Page Layout',
      topics: [
        {
          title: 'Landmark elements: header, main, footer, nav and aside',
          description: 'The five landmarks that let assistive technology jump around a page, exactly one main per page, and header and footer that mean something different inside an article than at the top level.',
          concepts: ['header and footer scoping', 'One main per page', 'aside for tangential content', 'Landmarks as navigation for screen readers'],
          quiz: [
            ['How many main elements may be visible on a page?', 'One.'],
            ['Is a header inside an article a page banner?', 'No, it is scoped to that article.'],
          ],
        },
        {
          title: 'article versus section versus div',
          description: 'article for self-contained pieces that make sense syndicated, section for thematic groups that deserve a heading, and div when you only need a styling or scripting hook.',
          concepts: ['article as a self-contained unit', 'section with its own heading', 'div as a neutral hook', 'Choosing between them'],
          quiz: [
            ['Should a section have a heading?', 'Yes, almost always; if it has none, div is probably right.'],
            ['Can article contain other articles?', 'Yes, such as comments inside a blog post.'],
          ],
          prereqs: ['Landmark elements: header, main, footer, nav and aside'],
        },
        {
          title: 'Heading hierarchy and the document outline',
          description: 'Why the promised outline algorithm was never implemented, so the visible heading levels are the outline, and how to check a page with a headings map before shipping.',
          concepts: ['Headings are the outline', 'Nesting levels under sections', 'Checking the headings map', 'hgroup for subtitles'],
          quiz: [
            ['Does an h1 inside a section become an h2 automatically?', 'No, browsers never implemented the outline algorithm.'],
            ['What does hgroup group?', 'A heading with its subtitle paragraphs.'],
          ],
          prereqs: ['article versus section versus div'],
        },
        {
          title: 'Global attributes: id, class, data-*, hidden, title and tabindex',
          description: 'Attributes any element accepts: unique ids, classes for styling hooks, data-* for custom values read via dataset, hidden, title tooltips, tabindex rules and contenteditable.',
          concepts: ['id uniqueness and fragments', 'class as a styling hook', 'data-* and dataset', 'hidden and its CSS interaction', 'tabindex 0, -1 and never positive'],
          quiz: [
            ['How do you read data-user-id in JavaScript?', 'element.dataset.userId.'],
            ['Why avoid positive tabindex values?', 'They break the natural focus order and are hard to maintain.'],
            ['What overrides the hidden attribute?', 'Any CSS display rule on the element.'],
          ],
        },
      ],
    },
    {
      title: 'Metadata, SEO and the Head',
      topics: [
        {
          title: 'Meta tags and the viewport',
          description: 'The viewport meta that makes mobile layouts work, theme-color, robots directives, http-equiv refresh and why most keywords-style meta tags are ignored.',
          concepts: ['The viewport meta tag', 'meta name="robots"', 'theme-color and color-scheme', 'Meta tags that no longer matter'],
          quiz: [
            ['What does width=device-width, initial-scale=1 do?', 'Sizes the layout viewport to the device and starts at 100% zoom.'],
            ['What does content="noindex" tell crawlers?', 'Do not include this page in search results.'],
          ],
        },
        {
          title: 'Title, description and canonical URLs',
          description: 'The title element as the tab label and search result headline, meta description as the snippet, and rel="canonical" to tell search engines which of several duplicate URLs is the original.',
          concepts: ['Writing a good title element', 'meta description', 'rel="canonical"', 'Duplicate content and query strings'],
          quiz: [
            ['Does meta description affect ranking?', 'Not directly; it affects the snippet and click-through rate.'],
            ['What does rel="canonical" prevent?', 'Ranking dilution across duplicate URLs of the same content.'],
          ],
          prereqs: ['Meta tags and the viewport'],
        },
        {
          title: 'Open Graph, Twitter cards and favicons',
          description: 'og:title, og:image and friends that control link previews in chat and social apps, Twitter card tags, and the modern favicon set: an SVG icon, a PNG fallback and the apple-touch-icon.',
          concepts: ['Open Graph properties', 'Twitter card meta tags', 'SVG and PNG favicons', 'apple-touch-icon and manifest icons'],
          quiz: [
            ['Which tag sets the preview image on shared links?', 'meta property="og:image".'],
            ['Why ship an SVG favicon?', 'It scales and can adapt to dark mode with embedded CSS.'],
          ],
        },
        {
          title: 'Structured data with JSON-LD',
          description: 'Embedding schema.org types such as Article, Product and FAQPage in a script type="application/ld+json" block so search engines can show rich results, and validating with the Rich Results test.',
          concepts: ['schema.org vocabulary', 'JSON-LD script blocks', 'Common types: Article, Product, Organization', 'Testing rich results'],
          quiz: [
            ['Where does JSON-LD go?', 'In a script type="application/ld+json" element, usually in the head.'],
            ['Why prefer JSON-LD over microdata?', 'It keeps structured data separate from markup and is recommended by Google.'],
          ],
          prereqs: ['Title, description and canonical URLs'],
        },
        {
          title: 'Linking stylesheets and scripts',
          description: 'link rel="stylesheet" and its render-blocking cost, script placement with defer, async and type="module", the difference between them, and resource hints like preconnect and preload.',
          concepts: ['link rel="stylesheet" and blocking', 'defer versus async', 'type="module" scripts', 'preconnect, preload and dns-prefetch'],
          quiz: [
            ['When does a deferred script run?', 'After parsing finishes, in document order, before DOMContentLoaded.'],
            ['Are module scripts deferred by default?', 'Yes.'],
            ['What does rel="preconnect" do?', 'Opens the DNS, TCP and TLS connection to an origin early.'],
          ],
        },
      ],
    },
    {
      title: 'Embedding, Graphics and Interactive Elements',
      topics: [
        {
          title: 'iframes and sandboxing',
          description: 'Embedding another document with iframe, the sandbox and allow attributes that restrict scripts, forms and permissions, loading="lazy", and why cross-origin frames cannot touch each other.',
          concepts: ['iframe src and srcdoc', 'The sandbox attribute', 'allow and permissions policy', 'Cross-origin isolation of frames'],
          quiz: [
            ['What does sandbox with no value do?', 'Applies every restriction: no scripts, forms, popups or same-origin access.'],
            ['How do you let a sandboxed frame run scripts?', 'sandbox="allow-scripts".'],
          ],
        },
        {
          title: 'Inline SVG',
          description: 'Writing vector graphics directly in the page: viewBox and coordinate systems, basic shapes and paths, styling with CSS, reusing symbols with use, and when an img src is better than inline.',
          concepts: ['viewBox and coordinates', 'Basic shapes and path', 'Styling SVG with CSS and currentColor', 'symbol and use for icon sets', 'Inline versus img versus background'],
          quiz: [
            ['What does viewBox="0 0 24 24" define?', 'The user coordinate system that scales to the rendered size.'],
            ['Why use fill="currentColor"?', 'The icon takes the surrounding text colour.'],
          ],
        },
        {
          title: 'Canvas basics',
          description: 'The canvas element as a bitmap drawn with JavaScript: getContext("2d"), paths, fills and strokes, text, images, and why canvas content is invisible to assistive technology unless you provide fallback.',
          concepts: ['Canvas sizing and devicePixelRatio', 'The 2D context and paths', 'Drawing text and images', 'Accessibility fallback content'],
          quiz: [
            ['Why set canvas width via attributes rather than CSS?', 'CSS scales the bitmap; attributes set its real resolution.'],
            ['When choose SVG over canvas?', 'For resolution-independent, styleable or accessible graphics with modest element counts.'],
          ],
          prereqs: ['Inline SVG'],
        },
        {
          title: 'details, summary and dialog',
          description: 'Native disclosure widgets with details and summary, the name attribute for exclusive accordions, and the dialog element with showModal, backdrop styling and form method="dialog".',
          concepts: ['details and summary', 'Exclusive accordions with name', 'dialog and showModal', 'form method="dialog"'],
          quiz: [
            ['Difference between dialog.show() and dialog.showModal()?', 'showModal traps focus and adds a backdrop; show does not.'],
            ['How do you open details by default?', 'Add the open attribute.'],
          ],
        },
      ],
    },
    {
      title: 'The DOM, Templates and Web Components',
      topics: [
        {
          title: 'How the parser builds the DOM',
          description: 'Tokenising and tree construction, error recovery that fixes unclosed tags, the difference between the source and the tree DevTools shows, and how scripts pause parsing.',
          concepts: ['Tokeniser and tree builder', 'Error recovery and implied end tags', 'Source versus DOM tree', 'Parser-blocking scripts'],
          quiz: [
            ['What does the parser do with an unclosed li?', 'Closes it automatically when the next li or the list ends.'],
            ['Why does a plain script tag block parsing?', 'It may call document.write, so the parser must wait for it.'],
          ],
        },
        {
          title: 'Querying and changing the DOM',
          description: 'Nodes versus elements, querySelector and querySelectorAll, reading and setting attributes, textContent versus innerHTML and its injection risk, and creating or removing elements.',
          concepts: ['Nodes, elements and NodeLists', 'querySelector and querySelectorAll', 'textContent versus innerHTML', 'Creating, inserting and removing elements'],
          quiz: [
            ['Why is innerHTML with user input dangerous?', 'It parses markup, enabling cross-site scripting.'],
            ['Is a querySelectorAll result live?', 'No, it is a static NodeList.'],
          ],
          prereqs: ['How the parser builds the DOM'],
        },
        {
          title: 'Events from HTML\'s point of view',
          description: 'Inline on* attributes versus addEventListener, bubbling and capture, the load and DOMContentLoaded events, and default actions such as link navigation and form submission that preventDefault stops.',
          concepts: ['Inline handlers versus addEventListener', 'Bubbling and capture', 'DOMContentLoaded versus load', 'Default actions and preventDefault'],
          quiz: [
            ['When does DOMContentLoaded fire?', 'When parsing finishes, before images and stylesheets are necessarily loaded.'],
            ['Why avoid onclick attributes?', 'They mix behaviour with markup and cannot attach multiple handlers cleanly.'],
          ],
          prereqs: ['Querying and changing the DOM'],
        },
        {
          title: 'The template and slot elements',
          description: 'template holds inert markup that is parsed but not rendered, cloned with content.cloneNode for repeated UI, and slot marks where light DOM children land inside a shadow tree.',
          concepts: ['Inert content in template', 'Cloning template content', 'Named and default slots', 'slot fallback content'],
          quiz: [
            ['Do images inside a template load?', 'No, template content is inert until cloned into the document.'],
            ['How do you clone a template?', 'template.content.cloneNode(true).'],
          ],
        },
        {
          title: 'Custom elements',
          description: 'Defining a class that extends HTMLElement, registering it with customElements.define, the connectedCallback and attributeChangedCallback lifecycle, and the required hyphen in the tag name.',
          concepts: ['customElements.define', 'Lifecycle callbacks', 'observedAttributes', 'Naming rules and upgrading'],
          quiz: [
            ['Why must a custom element name contain a hyphen?', 'To never clash with current or future built-in elements.'],
            ['When does connectedCallback run?', 'Each time the element is inserted into the document.'],
          ],
          prereqs: ['The template and slot elements'],
        },
        {
          title: 'Shadow DOM and encapsulation',
          description: 'attachShadow creates a scoped subtree whose styles do not leak in or out, open versus closed modes, ::part and CSS custom properties as the styling API, and declarative shadow DOM.',
          concepts: ['attachShadow and modes', 'Style scoping and leakage', '::part and custom properties as API', 'Declarative shadow DOM'],
          quiz: [
            ['Do page styles apply inside a shadow root?', 'No, except inherited properties and custom properties.'],
            ['What does the shadowrootmode attribute on template do?', 'Creates a shadow root at parse time without JavaScript.'],
          ],
          prereqs: ['Custom elements'],
        },
      ],
    },
    {
      title: 'Best Practices and Validation',
      topics: [
        {
          title: 'Validating markup',
          description: 'Running pages through the W3C Nu HTML Checker, reading its errors versus warnings, wiring html-validate or similar into CI, and the bugs invalid nesting causes across browsers.',
          concepts: ['The Nu HTML Checker', 'Errors versus warnings', 'Linting in CI', 'Bugs caused by invalid nesting'],
          quiz: [
            ['Why validate if browsers render invalid HTML anyway?', 'Error recovery differs between browsers and breaks styling, scripts and accessibility.'],
            ['What tool validates HTML from the command line?', 'html-validate, or vnu.jar from the W3C checker.'],
          ],
        },
        {
          title: 'Accessibility baked into markup',
          description: 'The accessibility you get for free from correct HTML: native controls, labels, alt, headings and landmarks, and the ARIA rule that you should use a native element before reaching for a role.',
          concepts: ['The first rule of ARIA', 'Native controls over div buttons', 'Accessible names from markup', 'Checking with the accessibility tree'],
          quiz: [
            ['What does a div with onclick lack compared to a button?', 'Keyboard focus, Enter and Space activation, and the button role.'],
            ['What is the first rule of ARIA?', 'Do not use ARIA if a native element already provides the semantics.'],
          ],
        },
        {
          title: 'HTML that loads fast',
          description: 'Ordering the head for early discovery, keeping critical CSS small, deferring scripts, setting image dimensions, lazy loading below the fold and avoiding deep DOM trees that slow style and layout.',
          concepts: ['Head ordering for early discovery', 'Image dimensions and lazy loading', 'Deferred and module scripts', 'DOM size and depth'],
          quiz: [
            ['What should come first in the head?', 'charset, viewport, title, then preconnects and critical CSS.'],
            ['Why does DOM size matter?', 'Style calculation and layout scale with the number of nodes.'],
          ],
          prereqs: ['Linking stylesheets and scripts'],
        },
        {
          title: 'Common mistakes and legacy HTML',
          description: 'Deprecated elements and attributes such as center, font and bgcolor, tables for layout, divs for everything, inline styles, missing alt and label, and how to modernise an old page.',
          concepts: ['Deprecated elements and attributes', 'Div soup and its fixes', 'Inline styles and presentational markup', 'Modernising legacy pages'],
          quiz: [
            ['What replaces the center element?', 'CSS: text-align or margin auto on a block.'],
            ['Why is div soup a problem?', 'It removes semantics, harms accessibility and makes styling brittle.'],
          ],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: semantic personal portfolio',
          description: 'Build a multi-page portfolio with correct landmarks, heading hierarchy, a nav with aria-current, responsive images via picture and srcset, Open Graph metadata and a validated, JavaScript-free contact form.',
          concepts: ['Plan the pages and outline', 'Mark up landmarks and navigation', 'Add responsive images and metadata', 'Validate and check headings'],
          quiz: [
            ['Which element wraps the site-wide navigation?', 'nav inside the top-level header.'],
            ['How do you show the current page in the nav?', 'aria-current="page" on that link.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: accessible registration form',
          description: 'A registration form with labels, fieldsets for grouped choices, the right input types and autocomplete tokens, native constraint validation with pattern and required, and a confirmation dialog element.',
          concepts: ['Choose input types and autocomplete', 'Group with fieldset and legend', 'Add constraints and error text', 'Confirm with dialog'],
          quiz: [
            ['Which autocomplete token fits a first-name field?', 'given-name.'],
            ['How do you stop the browser submitting invalid data?', 'Leave novalidate off and use required, pattern, min and max.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: data table report page',
          description: 'A report page with a captioned data table using thead, tbody, tfoot, scoped headers, colgroup styling and merged cells, plus a figure with an inline SVG chart and a print-friendly structure.',
          concepts: ['Structure the table and headers', 'Merge and group columns', 'Add an SVG figure', 'Check it with a screen reader'],
          quiz: [
            ['What tells a screen reader which header a cell belongs to?', 'scope on th, or headers and id on complex tables.'],
            ['What is tfoot for?', 'Summary rows such as totals, which stay separate from body rows.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: web component card library',
          description: 'A small set of custom elements: a product card with named slots, a disclosure widget built on details, and a modal built on dialog, styled through ::part and custom properties, with declarative shadow DOM for SSR.',
          concepts: ['Design the element APIs', 'Implement with template and slots', 'Expose styling hooks', 'Render declaratively'],
          quiz: [
            ['How does a consumer style an internal part?', 'Through ::part(name) when the element sets a part attribute.'],
            ['Why build on dialog and details instead of divs?', 'Focus, keyboard behaviour and semantics come for free.'],
          ],
          style: 'project',
        },
        {
          title: 'HTML interview questions',
          description: 'The questions that keep coming up: semantic elements and why they matter, block versus inline, defer versus async, srcset versus picture, data attributes, forms without JavaScript and the DOM versus source.',
          concepts: ['Semantics and accessibility questions', 'Loading and script questions', 'Forms and media questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['Explain the difference between section and article.', 'article is self-contained and reusable; section groups related content under a heading.'],
            ['When would you use picture instead of srcset?', 'For art direction or format fallbacks, not just resolution switching.'],
          ],
          style: 'reading',
        },
        {
          title: 'Whiteboard markup exercises',
          description: 'Practice writing markup by hand under time pressure: a card list, a pricing table, a login form and a navigation bar, choosing the right elements and defending each choice.',
          concepts: ['Card lists and headings', 'Pricing table markup', 'Login form markup', 'Explaining element choices'],
          quiz: [
            ['Which element should a clickable card use for its action?', 'An a element around the title, not a click handler on the div.'],
            ['What element should hold a password field\'s error?', 'A p or span referenced via aria-describedby on the input.'],
          ],
        },
      ],
    },
  ],
})
