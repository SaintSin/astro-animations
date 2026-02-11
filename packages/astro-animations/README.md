# astro-animations

Lightweight, zero-dependency scroll-triggered animations and CSS scroll-linked effects for [Astro](https://astro.build).

- Animations trigger when elements enter the viewport (via `IntersectionObserver`)
- Scroll effects use the native CSS Scroll Timeline API — no JavaScript
- Fully typed with TypeScript
- Respects `prefers-reduced-motion` automatically

---

## Installation

```sh
npm install astro-animations
# or
pnpm add astro-animations
```

---

## Setup

Add `<AstroAnimations />` once in your base layout, just before `</body>`. This injects the required styles and initialisation script.

```astro
---
import { AstroAnimations } from 'astro-animations';
---

<!doctype html>
<html lang="en">
  <head>...</head>
  <body>
    <slot />
    <AstroAnimations />
  </body>
</html>
```

---

## Components

### `<Animate>`

Wraps any content and animates it when it scrolls into view.

```astro
---
import { Animate } from 'astro-animations';
---

<Animate type="fade">
  <p>This fades in when it enters the viewport.</p>
</Animate>

<Animate type="slide" direction="up" duration={600} easing="spring">
  <h2>Slides up with a spring easing.</h2>
</Animate>
```

#### Animate props

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `type` | `AnimationType` | — | **Required.** Animation type (see below) |
| `as` | `string` | `'div'` | HTML tag to render |
| `direction` | `AnimateDirection` | `'up'` | Direction for directional animations |
| `duration` | `number` | `400` | Duration in milliseconds |
| `delay` | `number` | `0` | Delay in milliseconds |
| `easing` | `AnimateEasing` | `'ease-3'` | Easing function (see below) |
| `intensity` | `AnimateIntensity` | `'normal'` | `'subtle'`, `'normal'`, `'strong'`, or `0`–`1` |
| `opacity` | `number` | `0` | Starting opacity (0–1) |
| `repeat` | `AnimateRepeat` | `'once'` | `'once'` or `'every'` (re-animates each time) |
| `threshold` | `number` | `0.1` | Intersection threshold (0–1) |
| `class` | `string` | — | Additional CSS class |

#### Animation types

| Value | Description |
| :---- | :---------- |
| `fade` | Fade in |
| `slide` | Slide in from a direction |
| `bounce` | Bounce in from a direction |
| `zoom` | Scale up from small |
| `flip` | 3D flip on an axis |
| `fold` | Fold open from flat |
| `roll` | Roll in with rotation |

#### Directions

`up` · `down` · `left` · `right`

Applies to `slide`, `bounce`, `flip`, `fold`, and `roll`.

#### Easing presets

From [Open Props](https://open-props.style/#easing):

`ease-1` through `ease-5` · `ease-in-1` through `ease-in-5` · `ease-out-1` through `ease-out-5` · `ease-in-out-1` through `ease-in-out-5` · `elastic-out-1` through `elastic-out-5` · `elastic-in-1` through `elastic-in-5` · `bounce-1` through `bounce-5` · `spring-1` through `spring-5` · `spring` (alias for `spring-3`)

---

### `<ScrollEffect>`

Applies a CSS Scroll Timeline effect that runs as the element moves through the viewport. No JavaScript involved.

```astro
---
import { ScrollEffect } from 'astro-animations';
---

<ScrollEffect type="parallax" speed={0.5}>
  <img src="/hero.jpg" alt="Hero" />
</ScrollEffect>

<ScrollEffect type="fade">
  <p>Fades in as you scroll.</p>
</ScrollEffect>
```

#### ScrollEffect props

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `type` | `ScrollEffectType` | — | **Required.** Effect type (see below) |
| `as` | `string` | `'div'` | HTML tag to render |
| `speed` | `number` | — | Speed/intensity multiplier |
| `class` | `string` | — | Additional CSS class |

#### Effect types

| Value | Description |
| :---- | :---------- |
| `parallax` | Vertical parallax offset |
| `fade` | Opacity tied to scroll position |
| `scale` | Scale tied to scroll position |
| `rotate` | Rotation tied to scroll position |
| `blur` | Blur tied to scroll position |
| `horizontal` | Horizontal translation on scroll |

> **Note:** Scroll effects require browser support for the CSS Scroll Timeline API. They have no JavaScript fallback in this Lite version. Unsupported browsers will simply see the element without the effect.

---

## Using data attributes directly

Both components are optional convenience wrappers. You can apply animations directly with `data-*` attributes on any element:

```html
<!-- Animate -->
<div data-animate="fade">...</div>
<div data-animate="slide" data-animate-direction="left" data-animate-duration="600">...</div>

<!-- Scroll effect -->
<div data-scroll-effect="parallax" data-scroll-css data-scroll-speed="0.5">...</div>
```

### Stagger children

Add `data-stagger` to a parent to stagger the animation of its direct children:

```html
<ul data-stagger>
  <li data-animate="fade">Item 1</li>
  <li data-animate="fade">Item 2</li>
  <li data-animate="fade">Item 3</li>
</ul>
```

| Attribute | Values | Description |
| :-------- | :----- | :---------- |
| `data-stagger` | — | Enables stagger on children |
| `data-stagger-duration` | ms (e.g. `100`) | Delay between each child |
| `data-stagger-from` | `first` · `last` · `center` | Where stagger originates |

---

## TypeScript

All types are exported:

```ts
import type {
  AnimateConfig,
  AnimateDirection,
  AnimateEasing,
  AnimateIntensity,
  AnimateRepeat,
  AnimationType,
  IntensityPreset,
  ScrollEffectConfig,
  ScrollEffectType,
  StaggerConfig,
} from 'astro-animations';
```

---

## Accessibility

All animations are automatically suppressed when the user has `prefers-reduced-motion: reduce` set in their OS settings.

---

## Browser support

| Feature | Support |
| :------ | :------ |
| Scroll-triggered animations (`IntersectionObserver`) | All modern browsers |
| CSS Scroll Timeline (`ScrollEffect`) | Chrome 115+, Safari 18+, Firefox 133+ |

---

## License

MIT — [StJohn Mackay](https://github.com/SaintSin)
