# Changelog

## 2026-02-11 — Testing infrastructure

### Added

- **Vitest unit tests** (`packages/astro-animations/tests/`) — 54 tests across 3 files:
  - `constants.test.ts` — `resolveIntensity`, `intensityToRotate`
  - `parse.test.ts` — `parseAnimateConfig`, `parseStaggerConfig`
  - `apply.test.ts` — `applyAnimationProperties`, `clearAnimationProperties` (jsdom)
- **Playwright e2e tests** (`tests/animations.spec.ts`) — 9 tests covering all 7 animation types, stagger ordering, `repeat="every"` re-animation, `prefers-reduced-motion`, and ScrollEffect
- **Vitest config** (`packages/astro-animations/vitest.config.ts`) with `environment: 'jsdom'`
- **Playwright config** (`playwright.config.ts`) using `pnpm preview` as webServer

### Changed

- Extracted ~360-line inline script from `astro-animations.astro` into four focused modules:
  - `src/lib/constants.ts` — DEFAULTS, EASING_MAP, intensity/rotation presets and helpers
  - `src/lib/parse.ts` — `parseAnimateConfig`, `parseStaggerConfig`
  - `src/lib/apply.ts` — `applyAnimationProperties`, `clearAnimationProperties`, `promoteElement`
  - `src/lib/observer.ts` — IntersectionObserver orchestration, `initAnimations`, `destroyAnimations`
- `astro-animations.astro` script block reduced to 5 lines (imports from lib); output bundle unchanged at ~8.5 kB
- Test files located in `packages/astro-animations/tests/` (outside `src/`) so they are not included in the published npm package

### Updated READMEs

- `packages/astro-animations/README.md` — replaced placeholder with full API documentation (installation, `<AstroAnimations>`, `<Animate>`, `<ScrollEffect>`, data attributes, stagger, TypeScript exports, accessibility, browser support)
- `README.md` (root) — replaced generic starter template copy with monorepo description, correct directory structure, npm badge, and workflow notes

---

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
