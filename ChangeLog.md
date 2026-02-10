# Changelog

## 2025-02-10 — PandaMotion Lite: Initial Implementation

Implemented a lightweight, zero-dependency animation system for Astro based on the full PandaMotion system (AstroAnimations). Replaces the Motion library with CSS `@keyframes`, `IntersectionObserver`, and CSS Scroll Timeline.

### Added

- **7 animation types**: fade, slide, bounce, zoom, flip, fold, roll — all with CSS `@keyframes`
- **36 easing presets** from Open Props: cubic-bezier, spring, bounce, elastic — including `spring` alias for `spring-3`
- **IntersectionObserver runtime** (`scripts/animations/observer.ts`) — parses data attributes, sets CSS custom properties, toggles `.is-animating` class
- **Init script** (`scripts/animations/init.ts`) — reduced motion detection, View Transitions lifecycle hooks, double-init guard
- **CSS Scroll Timeline effects** — parallax, fade, scale, rotate, blur, horizontal (zero JS, carried forward from full version)
- **`<Animate>` component** — declarative wrapper with typed props for entrance animations
- **`<ScrollEffect>` component** — declarative wrapper for CSS scroll-linked effects (always CSS-only in Lite)
- **Intensity presets** — subtle, normal, strong (via CSS attribute selectors + JS custom properties for numeric values)
- **Stagger groups** — parent `data-animate-stagger` with configurable interval and `first`/`last`/`center` ordering
- **Repeat on scroll** — `data-animate-repeat="every"` re-animates on each viewport entry
- **Reduced motion support** — `prefers-reduced-motion` forces all elements visible, disables all animation
- **Progressive enhancement** — content visible without JS; `data-animate-ready` guard on `<body>`
- **Documentation page** (`pages/documentation.astro`) — full API reference with setup guide, attribute tables, component props, easing list, intensity levels, architecture overview, browser support, and comparison with full PandaMotion
- **Demo page** (`pages/index.astro`) — 9-section showcase of all features
- **Nav updated** — added Docs link to header navigation

### Architecture

```text
src/
  types/animations.ts                TypeScript interfaces
  scripts/animations/
    constants.ts                     Defaults, 36 easings, intensity presets
    observer.ts                      IntersectionObserver orchestration
    init.ts                          Entry point, lifecycle, reduced motion
  styles/animations/
    _animate-keyframes.css           19 @keyframes (7 types x directions)
    _animate-base.css                Hidden states, animation mapping, intensity
    _scroll-timeline.css             6 CSS Scroll Timeline effects
    _reduced-motion.css              prefers-reduced-motion overrides
  components/animation/
    Animate.astro                    Declarative entrance animation wrapper
    ScrollEffect.astro               Declarative scroll effect wrapper
```

### Memory Management & Observer Optimisations

- Replaced `WeakSet` with `Set` for element tracking — enables explicit clearing on View Transition destroy
- All observers stored in flat array, disconnected and released on destroy
- Inline CSS custom properties (`--animate-*`) cleared from elements on destroy
- Threshold-keyed observer cache cleared on destroy to release disconnected observer refs
- Stagger observer callbacks document their closure lifecycle (disconnect releases DOM refs for GC)

### Bundle

- JS: **2.82 kB** gzipped (zero external dependencies)
- CSS: ~4 kB across 4 files (layered via `@layer animations`)

### Intentionally Excluded

- JS scroll-linked fallback (CSS Scroll Timeline only; graceful degradation)
- Motion physics `spring()` (aliased to Open Props `--ease-spring-3` instead)
- Editor package
- Shared monorepo structure (Lite is self-contained)
