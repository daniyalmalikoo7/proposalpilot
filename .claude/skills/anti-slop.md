# Anti-AI-Slop — LLM Bias Countermeasures

AI coding agents have predictable design biases. This skill encodes countermeasures.
Every agent producing or reviewing UI code must apply these rules.

## The problem

LLMs trained on millions of websites converge on the statistical average of web design. The result is generic, unmemorable, and immediately recognizable as "AI-generated." The specific failure modes:

## Layout biases — BANNED patterns

### Centered hero with gradient text
The single most common LLM layout. Centered H1 + gradient text + centered subtitle + centered CTA button.
RULE: Centered hero sections are BANNED for application landing pages. Use split-screen (50/50), left-aligned content with right-aligned asset, or asymmetric whitespace.
EXCEPTION: Marketing pages for consumer products may use centered hero IF the photography/illustration is distinctive.

### Three-column icon grid
Icon + heading + paragraph × 3 in a row. Every AI-generated "features" section.
RULE: If showing features, use: bento grid with varied sizes, single-column with large illustrations, or progressive disclosure (show 1, reveal more).

### Gradient buttons
Linear-gradient backgrounds on CTAs. Immediately signals "generated."
RULE: Primary buttons use solid accent color. No gradients on interactive elements. Gradients are acceptable on decorative backgrounds only.

### Emoji as section headers
🚀 Performance! 🔒 Security! 💡 Innovation!
RULE: Never use emoji as structural design elements. Use the app's icon system (Lucide, Heroicons) consistently.

### Card grid with identical cards
3-4 cards, same height, same structure, same shadow. Zero visual hierarchy.
RULE: Use varied card sizes for visual hierarchy (featured card larger). Or use list layout with clear scan line. Cards are not the only container.

## Typography biases

### Giant hero text without hierarchy
64px hero heading with no supporting text hierarchy below it.
RULE: Hero headings need a clear typographic ladder: heading → subheading → body → action.

### Excessive bold
Making everything bold to seem "modern."
RULE: Maximum 2 font weights per text block. Heading: bold (700). Body: regular (400). Metadata: medium (500). That's it.

## Color biases

### Blue/purple gradients
The default "tech startup" palette. Indigo-to-purple gradient backgrounds.
RULE: If the app's accent is indigo/purple, use it as a solid color. Pair with neutral grays and intentional accent usage (<15% of surface area). No gradient backgrounds.

### Pure black on pure white
#000000 on #ffffff. Maximum contrast but harsh and dated.
RULE: Use near-black (#0a0f1a to #1a1a2e) and near-white (#f8fafc to #fafafa). Softer, more contemporary.

### Rainbow status colors without context
Red/yellow/green badges with no text labels.
RULE: Status colors ALWAYS have accompanying text or icon. "High" not just a red dot.

## Component biases

### Rounded corners everywhere at the same radius
Every element has rounded-lg. No hierarchy of roundness.
RULE: Establish a radius scale: buttons (8px), cards (12px), badges (full), inputs (6px), modals (16px). The scale creates subtle hierarchy.

### Shadow on everything
Every card, every button, every container has box-shadow.
RULE: Shadow indicates elevation. Only elevated elements get shadow: modals, dropdowns, popovers, sticky headers. Cards in a flat layout may use border instead of shadow.

### Generic placeholder illustrations
Undraw-style SVG illustrations on empty states.
RULE: Empty states use the app's icon system with a muted color + clear text + action CTA. If illustrations are used, they must be custom or match the app's visual language.

## Interaction biases

### Instant state changes
Click → immediate state swap. No transition, no feedback.
RULE: Every state change has a transition (150-250ms). See motion-patterns.md.

### Spinners for everything
Circular spinner for page loads, data fetches, form submissions.
RULE: Page loads → skeleton matching content shape. Inline fetches → skeleton in the affected area. Form submission → button loading state (spinner WITHIN the button + disabled). Global spinners are banned.

## How to use this skill

When generating or reviewing UI code:
1. Check the output against every banned pattern above
2. If a banned pattern is detected, apply the specified alternative
3. If unsure whether something is "slop," ask: "Would a design lead at Apple recognize this as generic?"
4. The goal is not maximally unique — it's intentional and considered

## Quality bar

UI code passes anti-slop review when:
- Zero banned layout patterns present
- Typography uses ≤2 weights with clear hierarchy
- Colors use semantic tokens with near-black/near-white, not pure extremes
- Status/state indicators have text/icon accompaniment, not color alone
- Shadows indicate elevation hierarchy, not blanket decoration
- Empty states and loading states are custom to the app, not generic
