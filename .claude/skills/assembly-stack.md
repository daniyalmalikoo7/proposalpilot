# Assembly Stack — UI Uplift Edition

Assembly-first: use existing tools before building custom. The 4-step assembly test:
1. Does a Shadcn/ui component exist? → Use it
2. Does a well-maintained library solve this? → Use it
3. Does an MCP tool or CLI handle this? → Use it
4. Only then → build custom

## Component library

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| Shadcn/ui | latest | Component replacement target. Accessible, composable, token-friendly. | `npx shadcn-ui@latest init` then `npx shadcn-ui@latest add [component]` |
| Radix UI | latest | Unstyled primitives underlying Shadcn. Use directly for custom components. | via Shadcn or `npm install @radix-ui/react-[component]` |
| Lucide React | ^0.400 | Icon system. Consistent, tree-shakeable. | `npm install lucide-react` |

## Styling

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Tailwind CSS | v4 | Utility-first CSS with design token integration | Token system lives in tailwind.config.ts |
| tailwind-merge | latest | Merge Tailwind classes without conflicts | Used via cn() utility |
| clsx | latest | Conditional class composition | Used via cn() utility |
| class-variance-authority | latest | Component variant system | For typed component variants |

## Animation

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Framer Motion | ^11 | Production animation library | Spring physics, AnimatePresence, layout animations |
| Motion (lite) | latest | Lightweight alternative if bundle size is critical | Subset of Framer Motion API |

## Premium patterns (optional — for above-and-beyond polish)

| Tool | Purpose | When to use |
|------|---------|------------|
| Magic UI | Pre-built animated components | Landing pages, marketing sections |
| Origin UI | Polished component variants | Dashboard elements, data display |
| Aceternity UI | Scroll-based animations | Hero sections, feature showcases |

## Audit & validation tools

| Tool | Purpose | How it's used |
|------|---------|--------------|
| Playwright MCP | Browser automation for crawling, screenshotting, interaction testing | Phase 0 crawling, Phase 3 regression testing |
| Chrome MCP | Alternative browser automation via Chrome extension | javascript_tool for computed style extraction |
| Lighthouse CI | Performance, accessibility, best practices, SEO scoring | Phase 0 baseline, Phase 3 comparison |
| axe-core | WCAG 2.1 AA automated accessibility testing | Phase 0 baseline, Phase 3 validation |
| pixelmatch | Pixel-level image comparison | Phase 3 visual regression detection |

## Design token tools (optional — for advanced token pipelines)

| Tool | Purpose | When to use |
|------|---------|------------|
| Style Dictionary | Token format transformation (Tailwind, CSS, iOS, Android) | Multi-platform design systems |
| Tokens Studio | Figma-to-code token sync | Teams with Figma design workflow |

## MCP configurations

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"]
    }
  }
}
```

## The assembly test for UI uplift

When an agent needs to implement a component:
1. **Shadcn?** Does `npx shadcn-ui@latest add [name]` work? → Use it, configure with tokens
2. **Radix?** Does a Radix primitive exist? → Use it, add styling with Tailwind tokens
3. **Existing?** Does the app already have a working version? → Improve it with tokens + states
4. **Custom?** None of the above → Build from spec using tokens, all states, responsive

When an agent needs a tool:
1. **Built-in?** tsc, eslint, next build → Use it
2. **npm?** Lighthouse, axe-core, Playwright → Install and use
3. **MCP?** Playwright MCP, Chrome MCP → Configure and use
4. **Custom script?** → Only for computed style extraction (JS injection)

## Quality bar

Assembly stack is correctly applied when:
- Shadcn components used where available (not custom-built equivalents)
- Framer Motion used for animation (not raw CSS @keyframes for interactive elements)
- Lighthouse and axe-core used for measurement (not subjective assessment)
- Design tokens live in Tailwind config (not scattered across component files)
