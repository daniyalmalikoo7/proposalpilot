# Aesthetic Direction System — Tunable Design Philosophy

This skill replaces static "one-size-fits-all" design rules with a context-aware direction system. Every Phase 2 agent reads the project profile and adapts its output accordingly.

Inspired by Anthropic's frontend-design (bold aesthetic direction), taste-skill (tunable dials), and Apple HIG (platform-appropriate design). Exceeds all three by combining aesthetic philosophy with tunability inside a gated pipeline for EXISTING apps.

## Project Profile Parameters

Set during Phase 1 (/design) by the Design System Architect. Stored in `docs/design/04a-aesthetic-direction.md`. Referenced by every Phase 2 agent.

### APP_TYPE (what the app IS)
- **saas-dashboard** — Data-dense, utilitarian, productivity-focused. Users spend hours here.
- **marketing-site** — Impression-driven, brand-forward, conversion-optimized. Users visit briefly.
- **editorial** — Content-first, reading-optimized, typographically rich. Long-form consumption.
- **e-commerce** — Product-focused, trust-building, transaction-enabling. Purchase-driven.
- **admin-panel** — Internal tool, efficiency-maximized, information-dense. Power users.
- **creative-portfolio** — Expression-driven, visually distinctive, memorable. Showcase.

### VISUAL_TONE (how the app FEELS)
- **clinical-minimal** — Precise, restrained, Swiss-design inspired. Maximum clarity, minimum ornament. Near-white backgrounds, monochromatic accents, geometric sans-serif, tight grid.
- **warm-refined** — Approachable yet polished. Soft shadows, warm neutrals, rounded forms, comfortable spacing. The "friendly professional" — inviting without being casual.
- **bold-editorial** — Magazine-inspired. Strong typographic hierarchy, dramatic contrast, intentional asymmetry, editorial whitespace. Typography carries the personality.
- **playful-friendly** — Energetic, rounded, colorful. Soft gradients (if earned), bouncy animations, friendly illustrations, generous border-radius. Approachable and fun.
- **luxury-premium** — Elevated, spacious, restrained color. Deep backgrounds, gold/silver accents, serif display fonts, cinematic motion, generous negative space.
- **industrial-utilitarian** — Raw, functional, monospace. Exposed structure, harsh borders, high contrast, minimal decoration. The tool IS the interface.

### MOTION_LEVEL (how much the app MOVES)
- **static** — No animations. Pure function. Appropriate for admin panels, data tools, accessibility-first contexts.
- **subtle** — Opacity transitions only. Fade in/out for state changes. 150ms max. No transform animations.
- **standard** — Fade + translate for page transitions. Hover scale on buttons. Skeleton shimmer. Spring physics for interactive elements. 250ms typical.
- **expressive** — Standard + staggered list reveals, shared layout animations (tab indicators, card expand), scroll-triggered reveals, parallax backgrounds.
- **cinematic** — Expressive + full-page scroll sequences, magnetic cursor effects, 3D transforms, complex orchestrated animations. Reserved for portfolios and marketing.

### DENSITY (how PACKED the app is)
- **spacious** — Generous whitespace. Large touch targets. One primary action per viewport. Luxury feel. Line-height 1.7+, padding 24-32px on cards, gap-8 between sections.
- **balanced** — Standard spacing. 8px grid, line-height 1.5-1.6, padding 16-24px, gap-6 between sections. Appropriate for most apps.
- **compact** — Reduced spacing for power users. Line-height 1.4, padding 12-16px, gap-4. More information per viewport. Still readable.
- **dense** — Maximum information density. Line-height 1.3, padding 8-12px, gap-2-3. Data tables, admin panels, monitoring dashboards. Every pixel earns its space.

### BRAND_PERSONALITY (2-3 adjectives, user-provided)
Free-form. Examples: "professional, trustworthy, modern" / "playful, innovative, bold" / "calm, focused, minimal."
These adjectives guide typography selection, color temperature, and motion character.

## How profiles map to design decisions

### Typography by profile
| APP_TYPE × VISUAL_TONE | Display font | Body font | Weight range |
|------------------------|-------------|-----------|--------------|
| saas-dashboard × clinical-minimal | Inter/Geist (geometric sans) | Same | 400-600 |
| marketing-site × bold-editorial | Distinctive serif or display face | Clean sans | 300-800 |
| editorial × warm-refined | Elegant serif (Lora, Playfair) | Readable sans (Source Sans) | 400-700 |
| e-commerce × playful-friendly | Rounded sans (Nunito, Quicksand) | Same | 400-700 |
| admin-panel × industrial-utilitarian | Monospace (JetBrains Mono, Fira Code) | System sans | 400-500 |
| creative-portfolio × luxury-premium | Striking display (Cormorant, Abril) | Thin sans | 200-700 |

### Color strategy by profile
| VISUAL_TONE | Background | Accent strategy | Neutrals |
|-------------|-----------|-----------------|----------|
| clinical-minimal | Near-white (#fafafa) or deep navy (#0a0f1a) | Single accent, <10% surface area | Cool grays |
| warm-refined | Warm white (#faf8f5) or warm dark (#1a1614) | Warm accent (amber, terracotta, sage) | Warm grays/beige |
| bold-editorial | Pure contrast (near-white + near-black) | Bold primary for typography highlights | Minimal gray, prefer contrast |
| playful-friendly | Soft pastels or bright white | Multiple friendly colors, 15-20% surface area | Warm light grays |
| luxury-premium | Deep (#0a0a0a) or cream (#f5f0e8) | Metallic or jewel-tone accent, <5% surface area | Sophisticated neutrals |
| industrial-utilitarian | Paper (#f4f4f0) or terminal (#0d1117) | Functional only (red=error, green=success) | Raw grays |

### Anti-slop rules by APP_TYPE
| Pattern | saas-dashboard | marketing-site | editorial | e-commerce | admin-panel | creative-portfolio |
|---------|---------------|----------------|-----------|------------|-------------|-------------------|
| Centered hero | ❌ BANNED | ⚠️ Only with distinctive asset | ❌ BANNED | ⚠️ Product hero OK | ❌ BANNED | ✅ Allowed if artful |
| Gradient buttons | ❌ BANNED | ❌ BANNED | ❌ BANNED | ❌ BANNED | ❌ BANNED | ⚠️ If intentional |
| Card grid (identical) | ❌ Use data tables | ⚠️ Vary sizes | ❌ Use list layout | ✅ Product grid OK | ❌ Use dense lists | ❌ Use masonry/bento |
| Emoji as icons | ❌ BANNED | ❌ BANNED | ❌ BANNED | ❌ BANNED | ❌ BANNED | ❌ BANNED |
| Shadow on everything | ❌ Elevation hierarchy | ⚠️ Sparse, dramatic | ❌ Use borders/rules | ⚠️ Product cards OK | ❌ Use borders | ⚠️ If intentional |
| Generic skeleton | ❌ Match layout shape | ❌ Match layout shape | ❌ Match layout shape | ❌ Match layout shape | ❌ Match layout shape | ❌ Match layout shape |

## Quality bar

Aesthetic direction is complete when:
- Project profile has all 5 parameters set with justification for each choice
- Typography, color, spacing, and motion decisions trace back to the profile
- Anti-slop rules are applied conditionally based on APP_TYPE
- The direction is consistent — no contradictions (e.g., luxury-premium with dense density without explicit justification)
- A design lead would read the direction and say "this is intentional and appropriate for this app"
