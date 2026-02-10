# PandaMotion Lite — Implementation Plan

A lightweight, zero-dependency animation system for Astro using only modern CSS and the Intersection Observer API. Designed as a portable component for use across Astro projects.

---

## Source Analysis

The full PandaMotion system (in `AstroAnimations/packages/demo`) relies on the `motion` library for three core capabilities:

| Capability | Motion API used | Lite replacement |
|---|---|---|
| Scroll-triggered entrance animations | `inView()` + `animate()` | Intersection Observer + CSS `@keyframes` |
| Scroll-linked effects (JS path) | `scroll()` + `animate()` | CSS `animation-timeline: view()` (already exists in source) |
| Physics spring easing | `spring()` | Open Props `--ease-spring-{1-5}` via `linear()` — `spring` maps to `spring-3` |

---

## What Carries Forward (as-is or near-identical)

- **CSS Scroll Timeline effects** — the existing `_scroll-timeline.css` handles parallax, fade, scale, rotate, blur, and horizontal effects with zero JS. Carry forward directly.
- **Data-attribute API** — the `data-animate`, `data-animate-*`, `data-scroll-effect`, `data-scroll-css` conventions remain unchanged.
- **Easing presets** — all 36 easings work natively. The 35 CSS-compatible easings (cubic-bezier tuples and `linear()` strings) carry forward directly. Motion's physics `spring` is aliased to Open Props' `--ease-spring-3` (`linear()` approximation), giving full easing parity with zero runtime cost.
- **Reduced motion support** — CSS `@media (prefers-reduced-motion: reduce)` rules carry forward.
- **Astro View Transitions lifecycle** — `astro:page-load` / `astro:before-swap` hooks remain the same.

## What Changes

| Feature | Full version | Lite version |
|---|---|---|
| Entrance trigger | Motion `inView()` | `IntersectionObserver` |
| Entrance animation | Motion `animate()` (WAAPI) | CSS `@keyframes` + class toggle |
| Stagger timing | JS delay calculation | `--stagger-index` CSS custom property + `nth-child` delay calc |
| Scroll-linked (JS fallback) | Motion `scroll()` | **Dropped** — CSS Scroll Timeline only, no JS fallback |
| Physics `spring` easing | Motion `spring()` | Aliased to Open Props `--ease-spring-3` (`linear()` approximation) |
| Keyframe registry (JS) | `registry.ts` factories | CSS `@keyframes` rules per animation type/direction |

---

## Feature Parity Matrix

| Feature | Full | Lite | Notes |
|---|---|---|---|
| **Animation types** | | | |
| fade | Yes | Yes | |
| slide (up/down/left/right) | Yes | Yes | |
| bounce | Yes | Yes | Multi-step keyframes |
| zoom | Yes | Yes | |
| flip (up/down/left/right) | Yes | Yes | 3D transforms with perspective |
| fold (up/down/left/right) | Yes | Yes | 3D transforms with transform-origin |
| roll | Yes | Yes | Combined translate + rotate |
| **Intensity** | | | |
| subtle / normal / strong | Yes | Yes | Via CSS custom properties |
| Numeric (0–1) | Yes | Partial | Predefined steps only (0.05, 0.15, 0.3) unless inline `style` used |
| **Easing** | | | |
| 35 CSS-native easings | Yes | Yes | cubic-bezier + `linear()` |
| Physics `spring` | Yes | Yes | Aliased to Open Props `--ease-spring-3` (`linear()` approximation) |
| **Timing** | | | |
| Custom duration | Yes | Yes | `--animate-duration` custom property |
| Custom delay | Yes | Yes | `--animate-delay` custom property |
| **Stagger** | Yes | Yes | CSS `calc()` with `--stagger-index` |
| **Repeat (every scroll)** | Yes | Yes | Observer re-entry removes/re-adds class |
| **Scroll-linked effects** | | | |
| CSS Scroll Timeline | Yes | Yes | Identical implementation |
| JS fallback for older browsers | Yes | No | CSS-only; graceful degradation (no animation) |
| **Accessibility** | | | |
| `prefers-reduced-motion` | Yes | Yes | |
| **Progressive enhancement** | Yes | Yes | Content visible without JS via CSS initial state |
| **View Transitions compat** | Yes | Yes | Same lifecycle hooks |

---

## Package Structure

```
src/
├── components/
│   └── animation/
│       ├── Animate.astro            # Declarative entrance animation wrapper
│       └── ScrollEffect.astro       # Declarative scroll-linked effect wrapper
├── scripts/
│   └── animations/
│       ├── init.ts                  # Entry point: observer setup, lifecycle hooks
│       ├── observer.ts              # IntersectionObserver logic (entrance + stagger + repeat)
│       └── constants.ts             # Easing map, intensity presets, defaults
├── styles/
│   └── animations/
│       ├── _animate-base.css        # Initial hidden states, will-change, perspective
│       ├── _animate-keyframes.css   # All @keyframes for 7 types × directions
│       ├── _animate-utilities.css   # Utility classes: durations, delays, easings, intensities
│       ├── _scroll-timeline.css     # CSS Scroll Timeline effects (carried forward)
│       └── _reduced-motion.css      # prefers-reduced-motion overrides
└── types/
    └── animations.ts                # TypeScript interfaces (AnimationType, direction, easing, etc.)
```

### Integration into other Astro projects

The `components/animation/`, `scripts/animations/`, `styles/animations/`, and `types/animations.ts` directories form the portable unit. To use in another project:

1. Copy these four directories into `src/`
2. Import `animations/init` as a `<script>` in the base layout
3. Import the animation CSS files into the global stylesheet
4. Use `<Animate>` / `<ScrollEffect>` components or data attributes directly

> Future consideration: publish as an Astro integration or npm package. The file structure supports this — the animation directories can be extracted to a package root with minimal changes.

---

## Implementation Steps

### Phase 1 — Foundation

1. **Types** (`types/animations.ts`)
   - Define `AnimationType`, `AnimateDirection`, `AnimateEasing`, `IntensityPreset`, `AnimateRepeat`, `ScrollEffectType`
   - Define component prop interfaces (`AnimateProps`, `ScrollEffectProps`)
   - Carry forward from shared package; `spring` remains a valid easing name (aliased to `spring-3`)

2. **Constants** (`scripts/animations/constants.ts`)
   - `EASING_MAP` — all 36 easings: 35 CSS-native values + `spring` aliased to `spring-3`'s `linear()` value
   - Reference Open Props custom properties (`--ease-spring-{1-5}`, `--ease-bounce-{1-5}`, etc.) where available via postcss-jit-props
   - `INTENSITY_PRESETS` — subtle (0.05), normal (0.15), strong (0.3)
   - `DEFAULTS` — type, direction, duration, delay, easing, intensity, threshold, repeat

3. **CSS Keyframes** (`styles/animations/_animate-keyframes.css`)
   - Define `@keyframes` for every animation type and direction combination:
     - `fade-in`
     - `slide-in-up`, `slide-in-down`, `slide-in-left`, `slide-in-right`
     - `bounce-in-up`, `bounce-in-down`, `bounce-in-left`, `bounce-in-right`
     - `zoom-in`
     - `flip-in-up`, `flip-in-down`, `flip-in-left`, `flip-in-right`
     - `fold-in-up`, `fold-in-down`, `fold-in-left`, `fold-in-right`
     - `roll-in`
   - Use CSS custom properties (`--animate-intensity`, `--animate-rotate`) for intensity-driven values

4. **Base styles** (`styles/animations/_animate-base.css`)
   - Initial hidden state: `[data-animate] { opacity: 0; }` (behind `[data-animate-ready]` guard)
   - `will-change: opacity, transform` on animated elements
   - `perspective: 1000px` on flip/fold containers
   - `.is-animating` class applies the resolved `animation` shorthand
   - CSS custom property defaults: `--animate-duration: 700ms`, `--animate-delay: 0ms`, `--animate-easing: var(--ease-out-3)`

5. **Utility styles** (`styles/animations/_animate-utilities.css`)
   - Easing custom properties (mapping `data-animate-easing` values to `--animate-easing`)
   - Intensity levels via attribute selectors
   - Duration/delay via inline `style` custom properties (set by components or data attributes)

6. **Reduced motion** (`styles/animations/_reduced-motion.css`)
   - Force `opacity: 1`, `transform: none`, `animation: none`, `transition: none`

### Phase 2 — Intersection Observer Runtime

7. **Observer** (`scripts/animations/observer.ts`)
   - Create a single `IntersectionObserver` instance (threshold from `data-animate-threshold` or default 0.2)
   - On intersect: add `.is-animating` class, which triggers the CSS animation
   - Handle `data-animate-repeat="every"`: on leave, remove `.is-animating` so it re-triggers on next entry
   - Handle stagger groups:
     - Find parent elements with `data-animate-stagger`
     - For each child `[data-animate]`, set `--stagger-index` (0, 1, 2, ...)
     - Stagger delay = `var(--stagger-index) * var(--stagger-interval)`
     - Set `--stagger-interval` from `data-animate-stagger` value (in ms)
   - On animation: set computed values as CSS custom properties on the element:
     - `--animate-duration` from `data-animate-duration`
     - `--animate-delay` from `data-animate-delay`
     - `--animate-easing` from easing map lookup of `data-animate-easing`
     - `--animate-intensity` from intensity resolution of `data-animate-intensity`

8. **Init** (`scripts/animations/init.ts`)
   - Check `prefers-reduced-motion` — if reduced, set all `[data-animate]` to visible, skip observer
   - Check CSS Scroll Timeline support — strip `data-scroll-css` if unsupported (graceful degradation, no JS fallback)
   - Set `data-animate-ready` on `<body>`
   - Call observer setup
   - Hook into `astro:page-load` for View Transitions re-init
   - Hook into `astro:before-swap` for cleanup (disconnect observer)

### Phase 3 — Astro Components

9. **`<Animate>` component** (`components/animation/Animate.astro`)
   - Props: `type`, `as`, `direction`, `duration`, `delay`, `easing`, `intensity`, `opacity`, `repeat`, `threshold`, `class`
   - Renders a dynamic HTML element with corresponding `data-animate-*` attributes
   - Sets `--animate-duration`, `--animate-delay` as inline style custom properties
   - Validates `easing` against known values at build time

10. **`<ScrollEffect>` component** (`components/animation/ScrollEffect.astro`)
    - Props: `type`, `as`, `speed`, `axis`, `class`
    - Always renders with `data-scroll-css` (CSS-only, no JS path)
    - Sets `--scroll-speed` as inline custom property

### Phase 4 — Scroll Timeline CSS

11. **Scroll Timeline styles** (`styles/animations/_scroll-timeline.css`)
    - Carry forward from source with minor cleanup
    - 6 keyframe animations: parallax, fade, scale, rotate, blur, horizontal
    - Driven by `--scroll-speed` custom property

### Phase 5 — Demo Page & Integration

12. **Update `index.astro`** as a demo/showcase page
    - Demonstrate all 7 animation types
    - Demonstrate directions, intensities, easings
    - Demonstrate stagger groups
    - Demonstrate repeat-on-scroll
    - Demonstrate CSS Scroll Timeline effects
    - Demonstrate `<Animate>` and `<ScrollEffect>` component usage

13. **Wire up in layout**
    - Import `@scripts/animations/init` in `BaseLayout.astro`
    - Import animation CSS in `style.css` via CSS layers

---

## What Is Intentionally Excluded

| Feature | Reason |
|---|---|
| JS scroll-linked fallback | Adds complexity; CSS Scroll Timeline has broad support (Chrome 115+, Firefox 110+, Safari 18+); older browsers simply get no scroll effect |
| Arbitrary numeric intensity (0–1) | CSS keyframes can't be parameterized at runtime without JS generating styles; use preset levels or inline style overrides |
| Shared package / monorepo structure | Lite is self-contained; no need for a separate shared types package |
| Editor package | Out of scope for lite version |

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Intersection Observer | 51+ | 55+ | 12.1+ | 15+ |
| CSS `@keyframes` | 43+ | 16+ | 9+ | 12+ |
| CSS custom properties | 49+ | 31+ | 9.1+ | 15+ |
| `animation-timeline: view()` | 115+ | 110+ | 18+ | 115+ |
| CSS `linear()` easing | 113+ | 112+ | 17.2+ | 113+ |
| 3D transforms (flip/fold) | 36+ | 16+ | 9+ | 12+ |

The entrance animations (Phases 1–3) work in all modern browsers. Scroll Timeline effects (Phase 4) require newer browsers but degrade gracefully — elements simply remain static.

---

## Key Design Decisions

1. **CSS animations over WAAPI** — CSS `@keyframes` with class toggling is simpler, more portable, and requires no JS animation engine. The trade-off is less runtime flexibility, which is acceptable for a "lite" system.

2. **Single IntersectionObserver with threshold groups** — Elements with different `threshold` values get separate observer instances (grouped). This keeps the code simple while supporting per-element configuration.

3. **CSS custom properties for configuration** — Duration, delay, easing, and intensity are set as custom properties on elements. This allows CSS keyframes to reference them without generating dynamic stylesheets.

4. **No JS scroll fallback** — CSS Scroll Timeline support is now broad enough that a JS fallback adds unjustified complexity for a lite package. Unsupported browsers see static content.

5. **Portable by directory copy** — No build plugins, Astro integrations, or package registry required. Copy four directories and two import lines. This can be elevated to a proper package later.
