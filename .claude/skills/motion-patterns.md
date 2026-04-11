# Motion Patterns — Purposeful Animation System

Every animation communicates. If you cannot state the purpose in one sentence, the animation does not ship.
Adapted from taste-skill motion framework. Universal (not dark-OLED-specific).

## Motion tokens

| Token | Value | Purpose |
|-------|-------|---------|
| duration-instant | 100ms | Micro-feedback (checkbox, toggle) |
| duration-fast | 150ms | Button hover/tap, small state changes |
| duration-normal | 250ms | Page transitions, modal open/close |
| duration-slow | 400ms | Complex sequences, first-paint animations |
| ease-out | cubic-bezier(0.16, 1, 0.3, 1) | Elements entering or settling |
| ease-in | cubic-bezier(0.7, 0, 1, 0.5) | Elements exiting (rare — prefer fade) |
| ease-in-out | cubic-bezier(0.65, 0, 0.35, 1) | Symmetric transitions |
| spring-snappy | { stiffness: 300, damping: 24, mass: 0.8 } | Button/interactive feedback |
| spring-gentle | { stiffness: 150, damping: 20, mass: 1 } | Layout shifts, resizing |
| spring-bouncy | { stiffness: 400, damping: 15, mass: 0.5 } | Playful elements (sparingly) |

## Patterns

### Page transition
Purpose: Confirm navigation occurred
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};
// duration: 250ms, ease-out
```

### List stagger
Purpose: Guide the eye through ordered content
```tsx
const containerVariants = {
  animate: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
};
```

### Modal overlay
Purpose: Focus attention, dim background
```tsx
// Overlay: opacity 0→0.5, duration 200ms
// Content: scale 0.96→1, opacity 0→1, spring-snappy
// Close: reverse, duration 150ms (exits are faster)
```

### Toast notification
Purpose: Alert without interrupting
```tsx
// Enter: translateX(100%)→0, spring-snappy
// Exit: opacity 1→0, translateX(0→20px), 150ms ease-in
// Auto-dismiss: 5000ms with progress bar animation
```

### Skeleton shimmer
Purpose: Indicate content loading
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
/* background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.08) 50%, transparent 75%) */
/* background-size: 200% 100%, animation: shimmer 1.5s infinite */
```

### Button feedback
Purpose: Confirm interactivity and activation
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

### Accordion expand
Purpose: Reveal content progressively
```tsx
// Height: 0→auto using AnimatePresence + motion.div
// Content: opacity 0→1, delay 50ms (appears after height settles)
// Duration: 250ms, ease-out
```

### Tab switch
Purpose: Show content relationship
```tsx
// Underline indicator: layoutId animation (shared layout)
// Content: crossfade, 150ms
// Direction-aware: slide left/right based on tab index change
```

## GPU acceleration rules

✅ ALWAYS animate (composited, no repaint):
- transform: translate, scale, rotate
- opacity
- filter: blur, brightness

❌ NEVER animate (triggers layout/paint):
- width, height, min-height, max-height
- top, right, bottom, left
- margin, padding
- border-width, border-radius (animate box-shadow instead)
- font-size, line-height

## Anti-patterns

- Linear easing on UI interactions — feels robotic
- Duration >500ms — users perceive as laggy
- Duration <80ms — too fast to register, wasted computation
- Animating all properties simultaneously — stagger opacity before movement
- React useState for hover animations — causes re-renders, use useMotionValue
- transform-origin not set for scale animations — defaults may surprise
- Missing AnimatePresence — exit animations won't run without it
- Infinite animations on primary content — distracting, reserve for loading indicators only

## Quality bar

Motion system is complete when:
- Every interactive element has hover + tap feedback
- Page transitions animate between routes
- Loading states use animated skeletons, not static text
- All animations use GPU-accelerated properties only
- No animation exceeds 400ms duration
- No linear easing on interaction animations
- Lighthouse performance not degraded after adding motion
