import { defineTrack } from '../define'

export const mobileUx = defineTrack({
  id: 'track-mobile-ux',
  title: 'Mobile UI/UX',
  description: 'Designing mobile interfaces that feel native and hold up in the field: Material 3 and the Apple HIG, navigation and gestures, layouts from phones to foldables, theming, forms, feedback, accessibility, localisation, motion, offline states, Figma handoff and usability testing.',
  family: 'Mobile Development',
  kind: 'domain',
  icon: '📱',
  tags: ['mobile', 'ux', 'ui', 'material design', 'human interface guidelines', 'accessibility', 'figma', 'design systems'],
  explainMode: 'concept',
  supports: { project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Platform Design Languages',
      description: 'What each platform expects a native app to look and behave like, and how far a product can bend it.',
      topics: [
        {
          title: 'Material 3 foundations',
          description: 'How Material 3 builds a screen from colour roles, type scale, shape and elevation tokens, why dynamic colour derives a palette from the wallpaper, and how components such as top app bars, FABs and navigation bars are meant to be combined.',
          concepts: ['Colour roles and tonal palettes', 'Dynamic colour', 'Material type scale', 'Shape and elevation tokens', 'Core Material components'],
          quiz: [
            ['What is a colour role in Material 3?', 'A semantic slot such as primary or on-surface that maps to a tone from a palette, not a fixed hex value.'],
            ['What does dynamic colour do?', 'Generates the app palette from the user wallpaper on Android 12+.'],
            ['Which surface carries the primary action on a screen?', 'The floating action button.'],
          ],
        },
        {
          title: 'Apple Human Interface Guidelines',
          description: 'The HIG principles behind iOS design: clarity, deference and depth, system typography with SF, standard bars and sheets, safe areas, and why apps that respect platform conventions feel trustworthy and pass review with fewer notes.',
          concepts: ['Clarity, deference and depth', 'SF fonts and text styles', 'Navigation bars, tab bars and toolbars', 'Sheets and popovers', 'Safe areas and the home indicator'],
          quiz: [
            ['What is a safe area?', 'The region of the screen not covered by the notch, Dynamic Island, home indicator or system bars.'],
            ['Which font family does iOS use by default?', 'San Francisco (SF Pro), with SF Compact on watchOS.'],
          ],
        },
        {
          title: 'Platform conventions versus brand',
          description: 'Deciding when to follow each platform and when to unify: back navigation, share sheets, pull-to-refresh and switches behave differently on iOS and Android, and cross-platform apps that copy one platform onto the other feel foreign to half their users.',
          concepts: ['Platform-specific idioms', 'Unified versus adaptive design', 'Brand expression within system components', 'Cross-platform framework defaults'],
          quiz: [
            ['Why do iOS users expect a swipe-from-left-edge gesture?', 'It is the system back gesture in navigation stacks; blocking it breaks muscle memory.'],
            ['Name one control that looks different by platform.', 'The toggle switch, date picker or alert dialog.'],
          ],
          prereqs: ['Material 3 foundations', 'Apple Human Interface Guidelines'],
        },
        {
          title: 'Design tokens and component libraries',
          description: 'Expressing colour, spacing, radius and type as named tokens that flow from Figma variables into Compose, SwiftUI or Flutter themes, so a single change propagates and designers and engineers share one vocabulary.',
          concepts: ['Token tiers: primitive, semantic, component', 'Figma variables as the source of truth', 'Mapping tokens to platform themes', 'Component library governance'],
          quiz: [
            ['What is the difference between a primitive and a semantic token?', 'A primitive names a raw value (blue-500); a semantic token names its purpose (color-primary) and points at a primitive.'],
            ['Why keep component tokens separate?', 'So one component can be restyled without changing the global semantic palette.'],
          ],
          prereqs: ['Material 3 foundations'],
        },
      ],
    },
    {
      title: 'Navigation and Interaction',
      topics: [
        {
          title: 'Navigation patterns: tabs, drawers and stacks',
          description: 'Choosing a top-level structure: bottom tabs for three to five peer destinations, navigation drawers for many sections, and stacks for drill-down, plus why nested tab-in-tab layouts and hidden hamburger menus hurt discoverability.',
          concepts: ['Bottom navigation and tab bars', 'Navigation drawers and rails', 'Stack navigation and hierarchy', 'Choosing a structure by destination count'],
          quiz: [
            ['How many destinations suit a bottom navigation bar?', 'Three to five.'],
            ['When is a navigation rail preferred?', 'On tablets and landscape layouts where a bottom bar wastes width.'],
          ],
        },
        {
          title: 'Back behaviour and deep hierarchy',
          description: 'What the back button or gesture should do on each screen, how up differs from back on Android, predictive back animations, and restoring state after process death so a returning user lands where they left off.',
          concepts: ['Back versus up on Android', 'Predictive back gesture', 'Restoring navigation state', 'Deep link entry and synthetic back stacks'],
          quiz: [
            ['What does up do that back does not?', 'Up always moves to the logical parent inside the app; back follows the chronological history, possibly to another app.'],
            ['What is a synthetic back stack?', 'A parent chain built when entering via deep link so back behaves as if the user navigated there.'],
          ],
          prereqs: ['Navigation patterns: tabs, drawers and stacks'],
        },
        {
          title: 'Touch targets and thumb zones',
          description: 'Minimum 44pt or 48dp hit areas, spacing so neighbouring targets do not collide, and placing frequent actions where a thumb reaches on tall phones while keeping destructive actions out of accidental-tap zones.',
          concepts: ['Minimum target sizes', 'Padding hit areas beyond the visual', 'Thumb reach on large phones', 'Placing destructive actions safely'],
          quiz: [
            ['What is the minimum touch target on iOS and Android?', '44x44 pt on iOS and 48x48 dp on Android.'],
            ['Where is the hardest region to reach one-handed?', 'The top corners, especially the top-left for right-handed users.'],
          ],
        },
        {
          title: 'Gestures and discoverability',
          description: 'Swipe, long-press, pinch and drag give speed to experts but are invisible, so every gesture needs a visible alternative, a hint on first use, and must not fight system gestures at the screen edges.',
          concepts: ['Standard gesture vocabulary', 'Visible alternatives to gestures', 'Edge conflicts with system gestures', 'Teaching gestures without tutorials'],
          quiz: [
            ['Why should swipe-to-delete have a menu equivalent?', 'Swipes are undiscoverable and unavailable to some assistive technologies.'],
            ['Which screen edges are reserved by the OS?', 'Left and right edges for back on Android, bottom for home, top for notifications and Control Center.'],
          ],
          prereqs: ['Touch targets and thumb zones'],
        },
        {
          title: 'Sheets, dialogs and modality',
          description: 'When to interrupt: alerts for decisions that cannot wait, bottom sheets for contextual choices that keep the parent visible, and full-screen modals for tasks with their own flow, with clear dismissal and no dead ends.',
          concepts: ['Alerts and confirmation dialogs', 'Bottom sheets and action sheets', 'Full-screen modal tasks', 'Dismissal affordances'],
          quiz: [
            ['When is a bottom sheet better than a dialog?', 'When the choices relate to the visible content and the user benefits from seeing it behind the sheet.'],
            ['How should a destructive confirmation be labelled?', 'With the verb itself, such as Delete, not OK, and styled as destructive.'],
          ],
        },
      ],
    },
    {
      title: 'Layout, Typography and Theming',
      topics: [
        {
          title: 'Typography on small screens',
          description: 'Body sizes of 16 to 17 points, line heights around 1.4, limited type scales, and truncation and wrapping rules, because narrow columns and outdoor glare punish small or low-contrast text.',
          concepts: ['Readable body size and line height', 'A limited type scale', 'Truncation, wrapping and line limits', 'Numeric and tabular figures'],
          quiz: [
            ['What body text size is a sensible mobile default?', 'About 16 sp on Android and 17 pt on iOS.'],
            ['Why use tabular figures in a price list?', 'Digits share a width so columns align as values change.'],
          ],
        },
        {
          title: 'Spacing systems and grids',
          description: 'An 8-point spacing scale with 4-point exceptions, consistent screen margins, and column grids that survive different widths, giving rhythm to screens and making Figma-to-code translation predictable.',
          concepts: ['The 8-point scale', 'Screen margins and gutters', 'Vertical rhythm', 'Density and compact layouts'],
          quiz: [
            ['Why base spacing on 8 points?', 'It scales cleanly across common density buckets and keeps decisions few.'],
            ['What margin does Material recommend on compact phones?', '16 dp.'],
          ],
        },
        {
          title: 'Responsive and adaptive layouts',
          description: 'Window size classes (compact, medium, expanded) as breakpoints, list-detail and supporting-pane canonical layouts, and why rotating or resizing must never lose scroll position or typed input.',
          concepts: ['Window size classes', 'List-detail and supporting pane', 'Responsive versus adaptive', 'Preserving state on resize'],
          quiz: [
            ['What width starts the expanded size class?', '840 dp.'],
            ['What is a list-detail layout?', 'A two-pane layout showing a list beside the selected item, collapsing to one pane when compact.'],
          ],
          prereqs: ['Spacing systems and grids'],
        },
        {
          title: 'Foldables and large screens',
          description: 'Designing for hinges and postures: avoiding content under the fold, tabletop and book modes, continuity when unfolding, and tablet layouts that use the width rather than stretching a phone screen.',
          concepts: ['Fold and hinge awareness', 'Postures: tabletop and book', 'Continuity across unfold', 'Multi-window and split screen'],
          quiz: [
            ['What is app continuity on a foldable?', 'The app keeps its state and re-lays out smoothly when the device folds or unfolds.'],
            ['Why avoid placing controls on the hinge line?', 'Some devices have a physical gap or crease there that makes taps unreliable.'],
          ],
          prereqs: ['Responsive and adaptive layouts'],
        },
        {
          title: 'Dark mode and theming',
          description: 'Building light and dark themes from the same semantic tokens, using elevation overlays instead of shadows in dark mode, avoiding pure black and pure white, and honouring the system setting with an in-app override.',
          concepts: ['Semantic colours for both themes', 'Elevation in dark themes', 'Avoiding pure black and saturated colours', 'Following the system theme setting'],
          quiz: [
            ['How does Material show elevation in dark mode?', 'By lightening the surface with a tonal overlay instead of a shadow.'],
            ['Why not use pure black backgrounds by default?', 'Pure black causes harsh contrast and smearing on OLED during scrolls; a dark grey is easier on the eyes.'],
          ],
          prereqs: ['Design tokens and component libraries'],
        },
      ],
    },
    {
      title: 'Screens and Flows',
      topics: [
        {
          title: 'Onboarding flows',
          description: 'Getting to value fast: deferring sign-up until it is needed, asking for permissions in context with a pre-prompt, progressive disclosure instead of carousels, and measuring where new users drop out.',
          concepts: ['Deferred sign-up', 'Contextual permission requests', 'Progressive disclosure', 'Measuring onboarding drop-off'],
          quiz: [
            ['Why ask for notification permission later rather than at launch?', 'Users grant far more often once they see what the notifications are for; a denied prompt is hard to recover.'],
            ['What is a pre-permission prompt?', 'An in-app explanation shown before the system dialog so the user knows why to accept.'],
          ],
        },
        {
          title: 'Empty, loading and error states',
          description: 'Every list has four states: loading, empty, error and content. Skeleton screens set expectations, empty states teach the next action, and errors say what happened and offer a retry rather than a bare code.',
          concepts: ['Skeleton screens and placeholders', 'First-use empty states', 'Actionable error messages', 'Partial and stale content'],
          quiz: [
            ['What should an empty state contain?', 'A short explanation of why it is empty and a primary action to fill it.'],
            ['When is a spinner worse than a skeleton?', 'For content with known layout; a skeleton reduces perceived wait and layout shift.'],
          ],
        },
        {
          title: 'Forms and input on mobile',
          description: 'Reducing typing: correct keyboard types, autofill and one-time-code hints, inline validation on blur rather than on every keystroke, single-column layouts, and keeping the submit button visible above the keyboard.',
          concepts: ['Keyboard types and content hints', 'Autofill and OTP autofill', 'Inline validation timing', 'Keyboard avoidance and scrolling'],
          quiz: [
            ['Which keyboard should a phone number field show?', 'The phone keypad, via inputType phone or keyboardType phonePad.'],
            ['When should a field show its validation error?', 'After the user leaves the field or submits, not on every keystroke.'],
          ],
          prereqs: ['Touch targets and thumb zones'],
        },
        {
          title: 'Feedback: progress, errors and haptics',
          description: 'Confirming that a tap did something within 100 ms, choosing determinate progress when duration is known, snackbars and toasts for transient results, and using haptics sparingly so they carry meaning.',
          concepts: ['Immediate touch feedback', 'Determinate versus indeterminate progress', 'Snackbars, toasts and undo', 'Haptic patterns and restraint'],
          quiz: [
            ['How quickly must an interface respond to feel instant?', 'Within about 100 milliseconds.'],
            ['Why offer undo instead of a confirmation dialog?', 'It keeps the flow fast while still making the action reversible.'],
          ],
          prereqs: ['Empty, loading and error states'],
        },
        {
          title: 'Offline and low-connectivity UX',
          description: 'Designing for the train tunnel: cached content shown with an age indicator, optimistic updates with queued sync, clear offline banners, and retry with backoff that never blocks the whole app behind a spinner.',
          concepts: ['Cache-first display with freshness cues', 'Optimistic updates and queued actions', 'Offline indicators', 'Graceful degradation of features'],
          quiz: [
            ['What is an optimistic update?', 'Showing the result of an action immediately and syncing later, rolling back if the server rejects it.'],
            ['Why show a timestamp on cached data?', 'So the user can judge whether stale information is safe to act on.'],
          ],
          prereqs: ['Feedback: progress, errors and haptics'],
        },
      ],
    },
    {
      title: 'Accessibility and Localisation',
      topics: [
        {
          title: 'Screen readers: TalkBack and VoiceOver',
          description: 'How screen readers traverse a screen, why every meaningful element needs a label and role, grouping related items into one focusable unit, and announcing dynamic changes with live regions.',
          concepts: ['Content descriptions and labels', 'Roles, states and traits', 'Grouping and focus order', 'Live region announcements'],
          quiz: [
            ['What should an icon-only button have?', 'A concise accessibility label describing the action, such as Add to cart.'],
            ['How do you announce a toast to VoiceOver?', 'Post an accessibility announcement notification.'],
          ],
        },
        {
          title: 'Dynamic type and scalable layouts',
          description: 'Supporting user font scaling up to 200 per cent and beyond: using scalable units, letting containers grow, avoiding fixed heights, and testing at the largest accessibility sizes where many layouts break.',
          concepts: ['Scalable text units', 'Layouts that grow with text', 'Large content viewer and tooltips', 'Testing at accessibility sizes'],
          quiz: [
            ['Which unit scales with the user font setting on Android?', 'sp.'],
            ['Why avoid fixed-height rows?', 'Larger text clips or overlaps; rows should size to content.'],
          ],
          prereqs: ['Typography on small screens'],
        },
        {
          title: 'Colour contrast and non-colour cues',
          description: 'Meeting WCAG 4.5:1 for text and 3:1 for large text and UI components, checking both themes, and never using colour alone to signal state so colour-blind users and sunlight both get the message.',
          concepts: ['WCAG contrast ratios', 'Contrast in dark mode', 'Icons and text alongside colour', 'Colour-blind safe palettes'],
          quiz: [
            ['What contrast ratio does normal text need for WCAG AA?', '4.5 to 1.'],
            ['How do you indicate an error without relying on red?', 'Add an icon and a text message next to the field.'],
          ],
          prereqs: ['Dark mode and theming'],
        },
        {
          title: 'Localisation-ready design',
          description: 'Text expands 30 per cent in German and shrinks in Chinese, dates and numbers change format, and strings with placeholders need plural rules, so layouts must flex and copy must live in resource files from day one.',
          concepts: ['Text expansion allowances', 'Locale-aware dates, numbers and currency', 'Plurals and placeholders', 'Pseudo-localisation testing'],
          quiz: [
            ['How much can translated text expand?', 'Around 30 per cent, more for short strings like button labels.'],
            ['What is pseudo-localisation?', 'Replacing strings with lengthened, accented versions to reveal truncation and hard-coded text.'],
          ],
        },
        {
          title: 'RTL layouts and mirroring',
          description: 'Right-to-left languages mirror the layout direction, navigation and progress, but not clocks, media controls or logos; using start and end instead of left and right makes most screens flip correctly for free.',
          concepts: ['Start and end instead of left and right', 'What mirrors and what does not', 'Bidirectional text handling', 'Testing with forced RTL'],
          quiz: [
            ['Should a play button mirror in RTL?', 'No, media controls and time direction stay the same.'],
            ['How do you preview RTL without an Arabic locale?', 'Enable the force RTL developer option or set the layout direction in preview.'],
          ],
          prereqs: ['Localisation-ready design'],
        },
      ],
    },
    {
      title: 'Motion and Micro-interactions',
      topics: [
        {
          title: 'Motion principles and durations',
          description: 'Motion explains where things came from and went: enter and exit at 150 to 300 ms with standard easing, larger elements slower, and every animation earning its place by orienting the user rather than decorating.',
          concepts: ['Purposeful motion', 'Durations by element size', 'Easing curves', 'Choreography of multiple elements'],
          quiz: [
            ['How long should a typical enter transition take on mobile?', 'Roughly 200 to 300 milliseconds.'],
            ['What easing suits an element leaving the screen?', 'Accelerate easing, so it speeds up as it exits.'],
          ],
        },
        {
          title: 'Micro-interactions',
          description: 'Small responses to input such as a like button bounce, pull-to-refresh, toggles and progress checkmarks, built as trigger, rules, feedback and loop, and used to confirm actions and add character without slowing tasks.',
          concepts: ['Trigger, rules, feedback and loop', 'State change animations', 'Pull-to-refresh and gesture feedback', 'Lottie and vector animations'],
          quiz: [
            ['What are the four parts of a micro-interaction?', 'Trigger, rules, feedback and loops or modes.'],
            ['When should a micro-interaction be cut?', 'When it delays the next action or repeats so often it becomes noise.'],
          ],
          prereqs: ['Motion principles and durations'],
        },
        {
          title: 'Shared element and screen transitions',
          description: 'Container transforms and shared element transitions keep the tapped item continuous into the detail screen, while fade-through separates unrelated destinations, giving the user a spatial model of the app.',
          concepts: ['Container transform', 'Shared element transitions', 'Fade-through and shared axis', 'Transitions in navigation frameworks'],
          quiz: [
            ['What is a container transform?', 'A transition where the tapped element grows into the new screen container.'],
            ['Which pattern suits tabs at the same level?', 'Shared axis or fade-through, not a push.'],
          ],
          prereqs: ['Motion principles and durations'],
        },
        {
          title: 'Reduced motion and animation performance',
          description: 'Respecting the system reduce-motion setting by replacing large movement with fades, keeping animations on the GPU with transforms and opacity, and never animating layout properties that cause jank on low-end devices.',
          concepts: ['Honouring reduce motion', 'Transform and opacity only', 'Avoiding layout thrash in animation', 'Testing motion on low-end hardware'],
          quiz: [
            ['What should replace a parallax when reduce motion is on?', 'A cross-fade or no animation.'],
            ['Why are transform and opacity cheap to animate?', 'They can be composited on the GPU without re-layout or repaint.'],
          ],
          prereqs: ['Micro-interactions'],
        },
      ],
    },
    {
      title: 'Design Process and Handoff',
      topics: [
        {
          title: 'Figma for mobile: auto layout and variants',
          description: 'Building screens that behave like real views: auto layout for stacking and padding, constraints for different device sizes, component variants for states, and device frames with safe-area guides.',
          concepts: ['Auto layout and constraints', 'Component variants and properties', 'Device frames and safe-area guides', 'Styles and variables'],
          quiz: [
            ['What does auto layout give a Figma frame?', 'Flexbox-like stacking, spacing and hug or fill sizing that reflows when content changes.'],
            ['Why model button states as variants?', 'So default, pressed, disabled and loading stay in sync as one component.'],
          ],
          prereqs: ['Design tokens and component libraries'],
        },
        {
          title: 'Prototyping and interaction design',
          description: 'Linking screens into clickable prototypes with transitions, overlays and smart animate, then testing on a real phone via the Figma mobile app so gestures, reach and motion are judged in the hand rather than on a monitor.',
          concepts: ['Clickable flows and overlays', 'Smart animate', 'Testing prototypes on device', 'Fidelity: wireframe to high-fidelity'],
          quiz: [
            ['Why review a prototype on a phone rather than a desktop?', 'Reach, target size and motion feel completely different at real scale in the hand.'],
            ['What is smart animate?', 'A Figma transition that tweens matching layers between two frames.'],
          ],
          prereqs: ['Figma for mobile: auto layout and variants'],
        },
        {
          title: 'Design handoff and specs',
          description: 'Handing engineers what they need: redlines from Dev Mode, exported assets at required densities, named tokens instead of hex values, documented states and edge cases, and a shared definition of done.',
          concepts: ['Dev Mode and redlines', 'Asset export at multiple densities', 'Specifying states and edge cases', 'Handoff checklists'],
          quiz: [
            ['Which densities does Android need for a raster icon?', 'mdpi through xxxhdpi, or a single vector drawable instead.'],
            ['Why hand off token names rather than hex values?', 'Engineers map to the theme so both themes and future changes stay consistent.'],
          ],
          prereqs: ['Figma for mobile: auto layout and variants'],
        },
        {
          title: 'Usability testing on mobile',
          description: 'Running moderated and unmoderated sessions with five to eight participants, writing task-based scripts, recording screens and thumbs, and turning observations into severity-ranked findings that change the design.',
          concepts: ['Task-based test scripts', 'Moderated versus unmoderated sessions', 'Recording and observation', 'Severity-ranked findings'],
          quiz: [
            ['How many participants reveal most usability problems?', 'About five per round, repeated across iterations.'],
            ['What is the difference between task success and a satisfaction score?', 'Success measures whether the task was completed; satisfaction is the participant self-report, such as SUS.'],
          ],
          prereqs: ['Prototyping and interaction design'],
        },
        {
          title: 'Design QA and review',
          description: 'Checking the built app against the design across devices, themes and font sizes before release, logging visual bugs with screenshots and expected values, and keeping a UI checklist so regressions are caught early.',
          concepts: ['Cross-device visual review', 'Theme and font-size passes', 'Filing precise visual bugs', 'UI release checklist'],
          quiz: [
            ['What belongs in a visual bug report?', 'Device, OS version, theme, screenshot, expected versus actual and a link to the design.'],
            ['Why include large font sizes in design QA?', 'Most clipping and overlap defects only appear at accessibility text sizes.'],
          ],
          prereqs: ['Design handoff and specs', 'Dynamic type and scalable layouts'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: redesign a checkout flow',
          description: 'Take an existing three-step mobile checkout and redesign it in Figma: single-column forms with correct keyboards, autofill, inline validation, clear progress, an error state for declined payment, and a prototype tested with three people.',
          concepts: ['Audit the current flow', 'Design forms and states', 'Prototype and test', 'Document the handoff'],
          quiz: [
            ['What must the declined-payment state include?', 'What went wrong, the card kept for editing, and a retry or alternative payment action.'],
            ['How do you show progress through checkout?', 'A stepper or step count that also lets the user go back.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: adaptive news app for phone, tablet and foldable',
          description: 'Design a news reader with a compact single-pane layout, a medium and expanded list-detail layout, correct behaviour across fold postures, light and dark themes from one token set, and RTL support verified with pseudo-locale.',
          concepts: ['Define size-class layouts', 'Build the token set', 'Design fold and RTL behaviour', 'Review across configurations'],
          quiz: [
            ['What changes between compact and expanded layouts?', 'Compact shows one pane; expanded shows the article list beside the open article.'],
            ['Which elements should not mirror in RTL?', 'Media controls, clocks and brand logos.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: accessibility audit and fix plan',
          description: 'Audit a real app with TalkBack and VoiceOver at 200 per cent text: record every unlabelled control, focus-order problem, contrast failure and clipped layout, rate severity, and produce annotated Figma fixes for the top ten.',
          concepts: ['Run screen reader passes', 'Measure contrast and text scaling', 'Rate and prioritise findings', 'Design and document fixes'],
          quiz: [
            ['What is the first thing to check with a screen reader?', 'That every interactive element has a meaningful label and the focus order matches the visual order.'],
            ['How is severity usually rated?', 'By impact on task completion: blocker, major, minor and cosmetic.'],
          ],
          style: 'project',
        },
        {
          title: 'Mobile UX interview questions',
          description: 'Explaining design decisions aloud: platform differences, when to break a guideline, handling permissions, offline states, accessibility trade-offs, and critiquing a screen on the spot with structured reasoning.',
          concepts: ['Critiquing a screen live', 'Explaining platform trade-offs', 'Accessibility and inclusion questions', 'Justifying decisions with evidence'],
          quiz: [
            ['How would you critique a screen in an interview?', 'State the user goal, walk hierarchy, navigation, states and accessibility, then prioritise the issues.'],
            ['Why might you deliberately break a platform guideline?', 'When user research shows the standard pattern fails the specific task and the deviation is tested.'],
          ],
          style: 'reading',
        },
        {
          title: 'Portfolio and design challenge preparation',
          description: 'Presenting mobile case studies that show problem, constraints, iterations and measured outcomes, and handling take-home or whiteboard challenges by clarifying scope, sketching flows and states, and timeboxing polish.',
          concepts: ['Structuring a case study', 'Whiteboard flow sketching', 'Scoping a take-home challenge', 'Presenting outcomes and metrics'],
          quiz: [
            ['What makes a case study convincing?', 'A clear problem, the constraints, the iterations with reasons, and outcomes with numbers.'],
            ['What should you do first in a design challenge?', 'Clarify the user, the goal and the constraints before sketching.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
