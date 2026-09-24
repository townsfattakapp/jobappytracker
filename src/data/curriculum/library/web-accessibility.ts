import { defineTrack } from '../define'

export const webAccessibility = defineTrack({
  id: 'track-web-accessibility',
  title: 'Web Accessibility',
  description: 'Building interfaces everyone can use: WCAG and the laws behind it, semantic HTML and ARIA, keyboard and focus management, screen reader testing, contrast and visual design, accessible forms and components, motion and media, auditing with axe and Lighthouse, and accessibility in single-page apps.',
  family: 'Frontend & Web',
  kind: 'domain',
  icon: '♿',
  tags: ['accessibility', 'a11y', 'wcag', 'aria', 'screen readers', 'keyboard', 'inclusive design'],
  languages: ['HTML', 'CSS', 'JavaScript'],
  explainMode: 'concept',
  code: { label: 'HTML, CSS and JavaScript', id: 'html', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-html'],
  style: 'practice',
  categories: [
    {
      title: 'Why Accessibility and the Law',
      description: 'Who is affected, what the standards say and which laws make them enforceable.',
      topics: [
        {
          title: 'Who accessibility is for',
          description: 'Permanent, temporary and situational disabilities across vision, hearing, motor and cognition, the assistive technologies people use, and why accessible products are better for everyone including search engines and power users.',
          concepts: ['Permanent, temporary and situational disability', 'Vision, hearing, motor and cognitive needs', 'Assistive technology landscape', 'The curb-cut effect'],
          quiz: [
            ['What is a situational disability?', 'A context that limits ability, like bright sunlight or holding a baby.'],
            ['Roughly what share of people report a disability?', 'About one in six worldwide, per the WHO.'],
          ],
        },
        {
          title: 'WCAG: versions, levels and success criteria',
          description: 'How the Web Content Accessibility Guidelines are organised into principles, guidelines and testable success criteria at levels A, AA and AAA, what changed in 2.1 and 2.2, and why AA is the usual target.',
          concepts: ['Principles, guidelines and success criteria', 'Levels A, AA and AAA', 'What 2.1 and 2.2 added', 'Reading a success criterion and its techniques'],
          quiz: [
            ['Which WCAG level do most laws and contracts require?', 'AA.'],
            ['Name a criterion added in WCAG 2.2.', 'Focus Not Obscured, Target Size (Minimum), or Dragging Movements.'],
          ],
          prereqs: ['Who accessibility is for'],
        },
        {
          title: 'ADA, Section 508, EN 301 549 and the European Accessibility Act',
          description: 'The legal frameworks that reference WCAG: the ADA and its web rulings and Title II rule in the US, Section 508 for federal procurement, EN 301 549 and the European Accessibility Act in the EU, and what a lawsuit or complaint looks like.',
          concepts: ['ADA and web litigation', 'Section 508 and VPATs', 'EN 301 549 and the EAA', 'Other national laws and deadlines'],
          quiz: [
            ['What standard does Section 508 incorporate?', 'WCAG 2.0 level AA.'],
            ['When did the European Accessibility Act start applying to products and services?', 'June 2025.'],
          ],
          prereqs: ['WCAG: versions, levels and success criteria'],
        },
        {
          title: 'The POUR principles',
          description: 'Perceivable, Operable, Understandable and Robust as a mental model: every WCAG criterion answers one of these, and the four questions are a quick review checklist for any design.',
          concepts: ['Perceivable', 'Operable', 'Understandable', 'Robust', 'POUR as a review checklist'],
          quiz: [
            ['Which principle does keyboard operability fall under?', 'Operable.'],
            ['What does Robust require?', 'Content works with current and future assistive technologies, typically through valid semantics.'],
          ],
          prereqs: ['WCAG: versions, levels and success criteria'],
        },
      ],
    },
    {
      title: 'Semantic HTML as the Foundation',
      topics: [
        {
          title: 'Landmarks and heading structure',
          description: 'How screen reader users navigate by landmarks and headings instead of reading linearly, why one main and a logical h1 to h6 outline matter more than any ARIA, and how to review a page\'s structure.',
          concepts: ['Navigating by landmark and heading', 'Landmark elements and their roles', 'Heading outline review', 'Labelling repeated landmarks'],
          quiz: [
            ['How do you tell two nav landmarks apart?', 'Give each an aria-label such as Primary and Footer.'],
            ['What is the most common way screen reader users find content?', 'Jumping between headings.'],
          ],
        },
        {
          title: 'Buttons, links and native controls',
          description: 'Links go somewhere, buttons do something, and both come with focus, keyboard activation and roles for free; why div onclick fails every one of those, and how to style native controls instead of replacing them.',
          concepts: ['Link versus button semantics', 'What native controls provide', 'The div-with-onclick problem', 'Styling native controls'],
          quiz: [
            ['A control that opens a menu: link or button?', 'Button; it does something rather than navigating.'],
            ['Which keys activate a native button?', 'Enter and Space.'],
          ],
          prereqs: ['Landmarks and heading structure'],
        },
        {
          title: 'Accessible names and descriptions',
          description: 'How the accessible name is computed from aria-labelledby, aria-label, native labels, content and title in that order, why visible labels should match the name, and aria-describedby for extra help text.',
          concepts: ['The accessible name computation order', 'aria-labelledby and aria-label', 'Name from content', 'aria-describedby for descriptions', 'Label in name'],
          quiz: [
            ['Which wins: aria-label or aria-labelledby?', 'aria-labelledby.'],
            ['Why must the visible label be part of the accessible name?', 'Voice control users say what they see to activate a control.'],
          ],
          prereqs: ['Buttons, links and native controls'],
        },
        {
          title: 'Images, icons and the alt decision tree',
          description: 'Deciding whether an image is informative, decorative, functional or complex, writing alt that conveys the purpose, icon buttons that need a text alternative, and long descriptions for charts.',
          concepts: ['Informative, decorative, functional, complex', 'Alt for functional images', 'Icon-only buttons', 'Long descriptions for charts'],
          quiz: [
            ['What alt should a search icon inside a button have?', 'A name for the action, such as Search, not a description of the magnifier.'],
            ['How do you hide a decorative SVG?', 'aria-hidden="true" and focusable="false".'],
          ],
          prereqs: ['Accessible names and descriptions'],
        },
        {
          title: 'The accessibility tree',
          description: 'The parallel tree browsers expose to assistive technology, built from DOM semantics and ARIA, how display: none and aria-hidden prune it, and reading it in the DevTools Accessibility panel.',
          concepts: ['How the tree is derived from the DOM', 'What removes nodes from the tree', 'Inspecting nodes in DevTools', 'Role, name, state and value'],
          quiz: [
            ['Does visibility: hidden remove an element from the accessibility tree?', 'Yes, like display: none.'],
            ['What does the Accessibility panel show for a node?', 'Its computed role, name, description and states.'],
          ],
          prereqs: ['Accessible names and descriptions'],
        },
      ],
    },
    {
      title: 'ARIA',
      description: 'Adding semantics when HTML cannot express them, and knowing when to leave it out.',
      topics: [
        {
          title: 'ARIA roles',
          description: 'Widget, document structure, landmark and live region roles, how a role overrides native semantics, required child and parent roles, and the roles you should almost never need.',
          concepts: ['Widget and structure roles', 'Landmark roles', 'Roles that override native semantics', 'Required owned elements', 'Roles to avoid: application, presentation misuse'],
          quiz: [
            ['What does role="presentation" do?', 'Removes the element\'s native semantics from the tree.'],
            ['Which child role does role="listbox" require?', 'option.'],
          ],
        },
        {
          title: 'ARIA states and properties',
          description: 'aria-expanded, aria-pressed, aria-selected, aria-checked and aria-disabled for states, aria-controls and aria-haspopup for relationships, and keeping them synchronised with what the user sees.',
          concepts: ['Common state attributes', 'Relationship attributes', 'aria-disabled versus disabled', 'Keeping states in sync with the UI'],
          quiz: [
            ['What does aria-expanded="true" on a button mean?', 'The content it controls is currently shown.'],
            ['What does aria-disabled do that disabled does not?', 'Keeps the control focusable and in the tab order.'],
          ],
          prereqs: ['ARIA roles'],
        },
        {
          title: 'Live regions',
          description: 'aria-live polite and assertive, role="status" and role="alert", why the region must exist before the content changes, and using live regions sparingly for toasts, form results and loading states.',
          concepts: ['aria-live polite and assertive', 'role="status" and role="alert"', 'Region must exist before updates', 'aria-atomic and aria-relevant'],
          quiz: [
            ['Why does injecting a new aria-live element with text not announce?', 'The region must be in the DOM before its content changes.'],
            ['When is assertive appropriate?', 'For urgent errors that need immediate attention, rarely.'],
          ],
          prereqs: ['ARIA states and properties'],
        },
        {
          title: 'The rules of ARIA and when not to use it',
          description: 'The five rules: prefer native HTML, do not change native semantics, all widgets must be keyboard operable, never hide focusable elements, and interactive elements need accessible names, plus why bad ARIA is worse than none.',
          concepts: ['The five rules of ARIA use', 'No ARIA is better than bad ARIA', 'Redundant roles', 'aria-hidden on focusable elements'],
          quiz: [
            ['Is role="button" on a button element harmful?', 'Not harmful but redundant; native semantics already exist.'],
            ['What is wrong with aria-hidden="true" on a focusable link?', 'Keyboard users land on something screen readers cannot announce.'],
          ],
          prereqs: ['ARIA roles'],
        },
        {
          title: 'The ARIA Authoring Practices patterns',
          description: 'The APG as the reference for widget roles, keyboard interaction and states, how to read a pattern and apply it, and why its examples are patterns rather than production code.',
          concepts: ['Structure of an APG pattern', 'Keyboard interaction tables', 'Applying a pattern to a component', 'Limits of the APG examples'],
          quiz: [
            ['What does an APG pattern specify?', 'Roles, states, properties and expected keyboard behaviour for a widget.'],
            ['Are APG examples tested across all screen readers?', 'No, they are reference implementations that still need real AT testing.'],
          ],
          prereqs: ['The rules of ARIA and when not to use it'],
        },
      ],
    },
    {
      title: 'Keyboard Navigation and Focus Management',
      topics: [
        {
          title: 'Tab order and tabindex',
          description: 'The natural focus order following DOM order, tabindex="0" to add elements and "-1" for programmatic focus, why positive values are banned, and why visual order must match DOM order.',
          concepts: ['DOM order is focus order', 'tabindex 0 and -1', 'Why positive tabindex is banned', 'Visual versus DOM order mismatches'],
          quiz: [
            ['How do you make a custom widget container focusable without adding it to the tab order?', 'tabindex="-1".'],
            ['What breaks when CSS order differs from DOM order?', 'Focus jumps around the screen unpredictably.'],
          ],
        },
        {
          title: 'Visible focus styles',
          description: 'Never removing outlines without replacing them, :focus-visible for keyboard-only rings, contrast requirements for focus indicators and the WCAG 2.2 focus appearance and focus-not-obscured criteria.',
          concepts: ['Never outline: none without replacement', ':focus-visible rings', 'Focus indicator contrast', 'Focus not obscured by sticky elements'],
          quiz: [
            ['What contrast must a focus indicator have?', 'At least 3:1 against adjacent colours.'],
            ['What does Focus Not Obscured require?', 'The focused element is not fully hidden behind sticky headers or footers.'],
          ],
          prereqs: ['Tab order and tabindex'],
        },
        {
          title: 'Managing focus programmatically',
          description: 'Moving focus when dialogs open and close, after deleting an item, on route change and after async content loads, and returning focus to the trigger so users never lose their place.',
          concepts: ['Focus on open and return on close', 'Focus after deletion', 'Focus after async loads', 'Focus targets with tabindex -1'],
          quiz: [
            ['Where should focus go when a modal closes?', 'Back to the element that opened it.'],
            ['Where should focus go after deleting a list item?', 'To the next item or the list heading, not the body.'],
          ],
          prereqs: ['Tab order and tabindex'],
        },
        {
          title: 'Keyboard traps, shortcuts and roving tabindex',
          description: 'Making sure users can always leave a widget, single-key shortcut requirements, composite widgets that use arrow keys with one tab stop via roving tabindex or aria-activedescendant.',
          concepts: ['No keyboard trap', 'Character key shortcut rules', 'Roving tabindex', 'aria-activedescendant'],
          quiz: [
            ['What does roving tabindex achieve?', 'One tab stop for a group, with arrow keys moving between items.'],
            ['What does WCAG require for single-character shortcuts?', 'They can be turned off, remapped or are active only on focus.'],
          ],
          prereqs: ['Managing focus programmatically'],
        },
      ],
    },
    {
      title: 'Screen Readers and Assistive Technology Testing',
      topics: [
        {
          title: 'How screen readers work',
          description: 'Browse mode versus focus mode, the virtual buffer, reading by element type, how roles and names become speech, and why screen reader behaviour differs between browser pairings.',
          concepts: ['Browse and focus modes', 'The virtual buffer', 'Element lists and quick navigation', 'Browser and screen reader pairings'],
          quiz: [
            ['When does NVDA switch to focus mode?', 'When focus lands on a form control or application region.'],
            ['Why test with more than one screen reader?', 'Each pairing interprets semantics differently.'],
          ],
        },
        {
          title: 'NVDA and JAWS on Windows',
          description: 'Installing NVDA, the essential keys (Insert, H, D, F, Tab, arrow keys), the elements list, speech viewer for silent testing, and how JAWS differs in market share and behaviour.',
          concepts: ['NVDA setup and modifier key', 'Quick navigation keys', 'Speech viewer', 'JAWS differences'],
          quiz: [
            ['Which NVDA key jumps to the next heading?', 'H.'],
            ['What does the speech viewer do?', 'Shows spoken output as text so you can test without audio.'],
          ],
          prereqs: ['How screen readers work'],
        },
        {
          title: 'VoiceOver on macOS and iOS',
          description: 'Turning on VoiceOver, the VO modifier and rotor, navigating with swipes on iOS, and Safari-specific behaviour that makes it the mandatory test for Apple users.',
          concepts: ['VO keys and the rotor', 'iOS gestures', 'Safari pairing quirks', 'Testing on real iPhones'],
          quiz: [
            ['What is the rotor?', 'A menu of navigation types such as headings, links and landmarks.'],
            ['Which iOS gesture reads the next item?', 'Swipe right with one finger.'],
          ],
          prereqs: ['How screen readers work'],
        },
        {
          title: 'TalkBack and mobile accessibility',
          description: 'TalkBack on Android, mobile-specific criteria such as orientation and motion actuation, touch exploration, and how mobile web differs from native app accessibility.',
          concepts: ['TalkBack gestures', 'Touch exploration', 'Orientation and motion criteria', 'Mobile web versus native'],
          quiz: [
            ['What does WCAG say about locking orientation?', 'Do not restrict to one orientation unless essential.'],
            ['How do you activate an item in TalkBack?', 'Double tap anywhere after focusing it.'],
          ],
          prereqs: ['How screen readers work'],
        },
        {
          title: 'Magnifiers, switch access and voice control',
          description: 'Screen magnification and why layouts must survive 400% zoom, switch scanning through focusable elements, and voice control that clicks by visible label, each imposing its own design constraints.',
          concepts: ['Screen magnification and reflow', 'Switch access scanning', 'Voice control and visible labels', 'Designing for all input methods'],
          quiz: [
            ['Why must the visible text of a button appear in its accessible name?', 'Voice control users click by saying the visible label.'],
            ['Which layout property helps magnifier users?', 'Reflow to a single column at 320 CSS pixels wide.'],
          ],
        },
      ],
    },
    {
      title: 'Colour, Contrast and Visual Design',
      topics: [
        {
          title: 'Contrast ratios and how to measure them',
          description: 'The 4.5:1 and 3:1 thresholds for text and large text, 3:1 for UI components and graphics, measuring with DevTools and contrast checkers, and what APCA proposes for WCAG 3.',
          concepts: ['4.5:1 and 3:1 thresholds', 'Non-text contrast', 'Measuring contrast in DevTools', 'APCA and WCAG 3 direction'],
          quiz: [
            ['What contrast does normal body text need for AA?', '4.5:1.'],
            ['What counts as large text?', '18pt or 14pt bold, roughly 24px or 18.66px bold.'],
          ],
        },
        {
          title: 'Not relying on colour alone',
          description: 'Colour blindness types, why red and green error states need icons or text, links distinguishable from text without hover, charts with patterns and labels, and simulating deficiencies in DevTools.',
          concepts: ['Types of colour vision deficiency', 'Icons and text alongside colour', 'Distinguishable links', 'Simulating deficiencies'],
          quiz: [
            ['How do you indicate an invalid field without relying on red?', 'Add an icon and an error message associated with the field.'],
            ['How can a link be distinguished if it has no underline?', '3:1 contrast against surrounding text plus a non-colour cue on hover and focus.'],
          ],
          prereqs: ['Contrast ratios and how to measure them'],
        },
        {
          title: 'Text resizing, zoom and reflow',
          description: 'Supporting 200% text resize and 400% zoom without loss of content, reflow at 320px wide, avoiding fixed heights and viewport-only units, and text spacing overrides.',
          concepts: ['200% text resize', 'Reflow at 320 CSS pixels', 'Avoiding fixed heights', 'Text spacing criterion'],
          quiz: [
            ['What does the Reflow criterion require?', 'No two-dimensional scrolling at 320 CSS pixels wide for most content.'],
            ['Why do fixed heights fail text resize?', 'Enlarged text overflows or is clipped.'],
          ],
        },
        {
          title: 'Dark mode, high contrast and forced colors',
          description: 'Respecting prefers-color-scheme with adequate contrast in both themes, Windows High Contrast and forced-colors mode where system colours replace yours, and using system colour keywords.',
          concepts: ['Contrast in both themes', 'forced-colors mode', 'System colour keywords', 'Testing high contrast mode'],
          quiz: [
            ['What happens to background images in forced-colors mode?', 'Backgrounds are removed, so icons drawn with backgrounds disappear.'],
            ['How do you keep an outline visible in forced colours?', 'Use a transparent outline or border that the system recolours.'],
          ],
          prereqs: ['Contrast ratios and how to measure them'],
        },
      ],
    },
    {
      title: 'Forms and Error Messaging',
      topics: [
        {
          title: 'Labels, instructions and grouping',
          description: 'Every control gets a persistent visible label, instructions appear before the field, related controls are grouped with fieldset and legend, and required fields are marked in text as well as symbol.',
          concepts: ['Persistent visible labels', 'Instructions before input', 'Grouping with fieldset', 'Marking required fields'],
          quiz: [
            ['Why is a placeholder-only label a failure?', 'It vanishes on input and often lacks contrast.'],
            ['How should an asterisk for required be explained?', 'With a note at the top of the form and aria-required or required on the field.'],
          ],
        },
        {
          title: 'Error identification and suggestions',
          description: 'Telling users what went wrong in text, where and how to fix it, an error summary at the top with links to fields, and moving focus to the first error on submit.',
          concepts: ['Error text that says how to fix it', 'Error summary with links', 'Focus on first error', 'Inline versus summary timing'],
          quiz: [
            ['What must an error message include?', 'Which field failed and how to correct it.'],
            ['Where does focus go after a failed submit?', 'To the error summary or the first invalid field.'],
          ],
          prereqs: ['Labels, instructions and grouping'],
        },
        {
          title: 'Associating errors with aria-describedby and aria-invalid',
          description: 'Linking error text to its field with aria-describedby, flagging state with aria-invalid, announcing dynamic validation through live regions and avoiding announcement floods on every keystroke.',
          concepts: ['aria-describedby to error text', 'aria-invalid state', 'Announcing validation results', 'Validating on blur not keystroke'],
          quiz: [
            ['How does a screen reader learn a field\'s error?', 'The error element id is in the field\'s aria-describedby.'],
            ['Why not validate on every keystroke?', 'It floods announcements and errors before the user finishes.'],
          ],
          prereqs: ['Error identification and suggestions'],
        },
        {
          title: 'Input purpose, autocomplete and time limits',
          description: 'autocomplete tokens for the Identify Input Purpose criterion, session timeouts that warn and can be extended, redundant entry avoidance and accessible authentication without cognitive tests.',
          concepts: ['Identify Input Purpose', 'Timeout warnings and extensions', 'Redundant Entry', 'Accessible Authentication'],
          quiz: [
            ['Which attribute satisfies Identify Input Purpose?', 'autocomplete with the matching token.'],
            ['What does Accessible Authentication forbid?', 'Requiring a cognitive test like memorising a password without an alternative such as paste or passkeys.'],
          ],
          prereqs: ['Labels, instructions and grouping'],
        },
      ],
    },
    {
      title: 'Accessible Components',
      topics: [
        {
          title: 'Modals and dialogs',
          description: 'Using the dialog element with showModal, role="dialog" with aria-modal for custom versions, labelling with the heading, trapping focus, Escape to close and restoring focus to the trigger.',
          concepts: ['dialog element and showModal', 'aria-modal and aria-labelledby', 'Focus trapping and inert', 'Escape and focus return'],
          quiz: [
            ['What labels a dialog?', 'aria-labelledby pointing at its heading.'],
            ['How do you prevent interaction with the page behind a custom modal?', 'Set inert on the rest of the page or use showModal.'],
          ],
        },
        {
          title: 'Menus, menu buttons and disclosure navigation',
          description: 'Why most navigation dropdowns should be disclosure buttons rather than ARIA menus, the menu button pattern for action menus, arrow key handling and closing on Escape and outside click.',
          concepts: ['Disclosure navigation pattern', 'Menu button with role="menu"', 'Arrow key and typeahead handling', 'Closing behaviour'],
          quiz: [
            ['Should a site navigation dropdown use role="menu"?', 'Usually not; a button with aria-expanded controlling a list is simpler and more robust.'],
            ['Which keys move within a role="menu"?', 'Up and Down arrows, Home and End.'],
          ],
          prereqs: ['Modals and dialogs'],
        },
        {
          title: 'Tabs',
          description: 'tablist, tab and tabpanel roles, aria-selected and aria-controls, automatic versus manual activation with arrow keys, and one tab stop for the list with roving tabindex.',
          concepts: ['tablist, tab and tabpanel', 'aria-selected and aria-controls', 'Automatic versus manual activation', 'Arrow key navigation'],
          quiz: [
            ['How many tab stops should a tab list have?', 'One; arrows move between tabs.'],
            ['What links a tab to its panel?', 'aria-controls on the tab and aria-labelledby on the panel.'],
          ],
          prereqs: ['Menus, menu buttons and disclosure navigation'],
        },
        {
          title: 'Accordions, tooltips and toggletips',
          description: 'Accordion headers as buttons inside headings with aria-expanded, tooltips that appear on focus as well as hover and dismiss with Escape, and toggletips for click-revealed help.',
          concepts: ['Accordion header buttons', 'Tooltip on hover and focus', 'Dismissable and persistent content', 'Toggletips'],
          quiz: [
            ['Where does the button go in an accordion header?', 'Inside the heading element.'],
            ['What does Content on Hover or Focus require?', 'Hoverable, dismissable with Escape and persistent until dismissed.'],
          ],
        },
        {
          title: 'Comboboxes, custom selects and autocomplete',
          description: 'The combobox pattern with aria-expanded, aria-controls and aria-activedescendant, announcing result counts, why native select is often the best choice, and the risks of custom dropdowns.',
          concepts: ['combobox and listbox roles', 'aria-activedescendant in comboboxes', 'Announcing results counts', 'Native select first'],
          quiz: [
            ['How is the highlighted option announced without moving focus?', 'aria-activedescendant on the input points to the option id.'],
            ['When should you keep the native select?', 'Whenever the visual requirements do not force a custom one; it works everywhere.'],
          ],
          prereqs: ['Tabs'],
        },
      ],
    },
    {
      title: 'Motion and Media',
      topics: [
        {
          title: 'Reduced motion and vestibular disorders',
          description: 'Parallax, zooming and large movements can cause dizziness and nausea; honouring prefers-reduced-motion, replacing motion with fades and providing a site-level toggle.',
          concepts: ['Vestibular triggers', 'prefers-reduced-motion in CSS and JS', 'Replacing motion with opacity', 'Motion toggles in settings'],
          quiz: [
            ['Does reduced motion mean no animation?', 'No, it means avoiding large or vestibular-triggering movement; small fades are fine.'],
            ['How do you check the preference in JavaScript?', 'matchMedia("(prefers-reduced-motion: reduce)").matches.'],
          ],
        },
        {
          title: 'Flashing content and seizures',
          description: 'The three-flashes-per-second rule and the red flash threshold, auto-playing video and animated GIF risks, and tools like PEAT for testing content.',
          concepts: ['Three flashes per second', 'Red flash threshold', 'Autoplay and GIF risks', 'Testing with PEAT'],
          quiz: [
            ['What is the WCAG flash limit?', 'No more than three flashes in any one-second period.'],
            ['Should carousels autoplay?', 'Only with a pause control and no flashing transitions.'],
          ],
        },
        {
          title: 'Captions and transcripts',
          description: 'Closed captions for prerecorded and live video, the difference between captions and subtitles, transcripts for audio-only content, WebVTT authoring and quality standards.',
          concepts: ['Captions versus subtitles', 'Live captioning', 'Transcripts for audio', 'WebVTT authoring and quality'],
          quiz: [
            ['What must captions include beyond dialogue?', 'Relevant sounds and speaker identification.'],
            ['Which WCAG level requires captions for live video?', 'AA.'],
          ],
        },
        {
          title: 'Audio description and accessible media players',
          description: 'Describing visual information for blind viewers, extended audio description, and player controls that are keyboard operable, labelled and offer caption and speed settings.',
          concepts: ['Audio description tracks', 'Extended audio description', 'Keyboard-operable player controls', 'Caption and speed settings'],
          quiz: [
            ['What does audio description add?', 'Narration of important visual content between dialogue.'],
            ['Name two requirements of an accessible media player.', 'Keyboard-operable, labelled controls and caption support.'],
          ],
          prereqs: ['Captions and transcripts'],
        },
      ],
    },
    {
      title: 'Auditing and Tooling',
      topics: [
        {
          title: 'Automated testing with axe, Lighthouse and WAVE',
          description: 'What automated tools catch (roughly 30 to 40 percent of issues), running axe DevTools and Lighthouse, reading WAVE overlays, and understanding false positives and what needs a human.',
          concepts: ['What automation can and cannot find', 'axe DevTools workflow', 'Lighthouse accessibility audits', 'WAVE overlays'],
          quiz: [
            ['Roughly what share of WCAG issues can automated tools detect?', 'Around a third.'],
            ['Can a Lighthouse score of 100 mean a page is accessible?', 'No, it only means no automatically detectable failures.'],
          ],
        },
        {
          title: 'Manual audit methodology',
          description: 'A repeatable process: keyboard-only pass, screen reader pass, zoom and reflow pass, contrast checks, then mapping findings to WCAG criteria and severity so teams can prioritise.',
          concepts: ['Keyboard-only pass', 'Screen reader pass', 'Zoom and reflow pass', 'Mapping findings to criteria and severity'],
          quiz: [
            ['What is the first manual test to run?', 'Unplug the mouse and tab through the whole page.'],
            ['How do you rate a finding\'s severity?', 'By user impact and how many users are blocked, not by effort to fix.'],
          ],
          prereqs: ['Automated testing with axe, Lighthouse and WAVE'],
        },
        {
          title: 'Reports, VPATs and accessibility statements',
          description: 'Writing findings that developers can act on, producing an Accessibility Conformance Report using the VPAT template, and publishing an accessibility statement with contact routes.',
          concepts: ['Actionable findings', 'The VPAT template and ACR', 'Accessibility statements', 'Tracking remediation'],
          quiz: [
            ['What is a VPAT?', 'A template for reporting how a product conforms to accessibility standards.'],
            ['What should an accessibility statement include?', 'Conformance level, known issues and a way to report problems.'],
          ],
          prereqs: ['Manual audit methodology'],
        },
        {
          title: 'Accessibility checks in CI',
          description: 'axe-core with Playwright or Cypress, jest-axe for component tests, eslint-plugin-jsx-a11y for static checks, and failing builds on regressions without pretending it replaces manual testing.',
          concepts: ['axe-core in end-to-end tests', 'jest-axe for components', 'Linting with jsx-a11y', 'Failing builds on regressions'],
          quiz: [
            ['How do you run axe in Playwright?', 'Use @axe-core/playwright and assert no violations after rendering.'],
            ['What does eslint-plugin-jsx-a11y catch?', 'Static issues like images without alt or click handlers on non-interactive elements.'],
          ],
          prereqs: ['Automated testing with axe, Lighthouse and WAVE'],
        },
      ],
    },
    {
      title: 'Accessibility in Single-Page Apps',
      topics: [
        {
          title: 'Route changes and focus',
          description: 'Client-side navigation does not reload the page, so screen readers hear nothing; moving focus to the new heading or main, updating document.title and announcing the change.',
          concepts: ['Why route changes are silent', 'Focusing the new page heading', 'Updating document.title', 'Route announcers'],
          quiz: [
            ['Where should focus go after a client-side navigation?', 'The new page\'s h1 or main region.'],
            ['Why update document.title on navigation?', 'It is announced by screen readers and shown in the tab.'],
          ],
        },
        {
          title: 'Announcing async updates',
          description: 'Loading states, search results counts, toast notifications and form submissions announced through persistent live regions, with debouncing to avoid overwhelming users.',
          concepts: ['Persistent live region component', 'Announcing loading and completion', 'Results count announcements', 'Debouncing announcements'],
          quiz: [
            ['How do you announce that search results updated?', 'Write a summary like 12 results found into a polite live region.'],
            ['Why keep one global live region?', 'It exists before updates and avoids duplicated announcements.'],
          ],
          prereqs: ['Route changes and focus'],
        },
        {
          title: 'Accessible component libraries',
          description: 'Choosing headless or well-tested libraries such as Radix, React Aria or Headless UI, verifying their claims with a screen reader, and wrapping them so teams cannot skip labels.',
          concepts: ['Headless component libraries', 'Verifying library claims', 'Enforcing labels through props', 'Documenting accessibility in Storybook'],
          quiz: [
            ['Why prefer a headless library for complex widgets?', 'Keyboard and ARIA behaviour is handled while styling stays yours.'],
            ['How do you force developers to label a custom input?', 'Make the label prop required in TypeScript.'],
          ],
        },
        {
          title: 'inert, hidden content and virtualised lists',
          description: 'Using inert to disable background content, keeping off-screen menus out of the tab order, virtualised lists that hide items from assistive tech and how aria-setsize and aria-posinset help.',
          concepts: ['The inert attribute', 'Off-screen content and tab order', 'Virtualised lists and AT', 'aria-setsize and aria-posinset'],
          quiz: [
            ['What does inert do?', 'Removes the subtree from focus, hit-testing and the accessibility tree.'],
            ['Why do virtualised lists confuse screen readers?', 'Only visible rows exist in the DOM, so the list looks short.'],
          ],
          prereqs: ['Route changes and focus'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: remediate an inaccessible page',
          description: 'Take a deliberately broken page (div buttons, missing labels, colour-only errors, no focus styles) and fix every issue, documenting each against its WCAG criterion and verifying with NVDA or VoiceOver.',
          concepts: ['Audit and list failures', 'Fix semantics and labels', 'Fix focus and contrast', 'Verify with a screen reader'],
          quiz: [
            ['What tool do you run first on the broken page?', 'axe or Lighthouse for quick wins, then a keyboard pass.'],
            ['How do you prove a fix works?', 'Demonstrate it with a screen reader and keyboard, not just a clean axe run.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: accessible multi-step form',
          description: 'A checkout-style form with step indicators, grouped fields, inline and summary errors, autocomplete tokens, a timeout warning and focus management between steps, tested at 400% zoom.',
          concepts: ['Design steps and progress semantics', 'Group and label fields', 'Errors and focus management', 'Zoom and screen reader testing'],
          quiz: [
            ['How is progress announced between steps?', 'Move focus to the step heading which states step 2 of 4.'],
            ['Where do errors appear on submit?', 'In a focused summary linking to each field, plus inline messages.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: accessible component set',
          description: 'Build a modal, tabs, disclosure menu and combobox from the APG patterns with full keyboard support, ARIA states, reduced-motion handling and automated axe tests in CI.',
          concepts: ['Implement APG keyboard patterns', 'Wire ARIA states', 'Handle motion preferences', 'Add axe tests'],
          quiz: [
            ['Which key closes every one of these widgets?', 'Escape.'],
            ['What state does an open disclosure button carry?', 'aria-expanded="true".'],
          ],
          style: 'project',
        },
        {
          title: 'Project: SPA accessibility retrofit',
          description: 'Add route announcements and focus handling, a global live region, document titles and inert-based modals to an existing React or Vue app, then write an accessibility statement for it.',
          concepts: ['Route focus and titles', 'Global live region', 'Modal and inert handling', 'Write the statement'],
          quiz: [
            ['What is the minimal route change fix?', 'Update the title and move focus to the main heading.'],
            ['What goes into the accessibility statement?', 'Conformance target, known gaps, testing done and a contact for issues.'],
          ],
          style: 'project',
        },
        {
          title: 'Accessibility interview questions',
          description: 'The questions that keep coming up: WCAG levels, when to use ARIA, how to make a custom dropdown accessible, focus management in modals, contrast thresholds and how you test with screen readers.',
          concepts: ['Standards and legal questions', 'ARIA and semantics questions', 'Testing methodology questions', 'Explaining trade-offs aloud'],
          quiz: [
            ['How would you make a div-based button accessible?', 'Replace it with a button; failing that add role, tabindex and key handlers.'],
            ['What is the difference between aria-label and aria-labelledby?', 'aria-label is a string; aria-labelledby references other elements and takes precedence.'],
          ],
          style: 'reading',
        },
        {
          title: 'Live accessibility review exercises',
          description: 'Practice reviewing a screenshot or code sample in a few minutes: spot missing names, focus problems, contrast failures and ARIA misuse, and explain the fix and the criterion it satisfies.',
          concepts: ['Spotting missing names', 'Spotting focus problems', 'Spotting ARIA misuse', 'Citing the criterion'],
          quiz: [
            ['An icon button with no text: what do you flag?', 'Missing accessible name; add aria-label or visually hidden text.'],
            ['A modal you can tab out of: which criterion?', 'Focus management; not strictly a failure but the dialog pattern requires trapping.'],
          ],
        },
      ],
    },
  ],
})
