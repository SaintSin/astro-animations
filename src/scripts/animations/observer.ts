// scripts/animations/observer.ts
//
// IntersectionObserver-based scroll-triggered animations.
// Discovers [data-animate] elements, sets CSS custom properties
// for duration/delay/easing/intensity, and toggles .is-animating
// when elements enter the viewport.

import type {
  AnimateConfig,
  AnimateDirection,
  AnimateEasing,
  AnimateRepeat,
  AnimationType,
  IntensityPreset,
  StaggerConfig,
} from '../../types/animations';
import {
  DEFAULTS,
  EASING_MAP,
  INTENSITY_PRESETS,
  resolveIntensity,
  VALID_EASINGS,
} from './constants';

// ---------------------------------------------------------------------------
// Attribute parsing
// ---------------------------------------------------------------------------

const VALID_TYPES = new Set<string>([
  'fade',
  'slide',
  'bounce',
  'zoom',
  'flip',
  'fold',
  'roll',
]);
const VALID_DIRECTIONS = new Set<string>(['up', 'down', 'left', 'right']);
const VALID_INTENSITIES = new Set<string>(Object.keys(INTENSITY_PRESETS));

/** Per-preset rotation degrees, decoupled from the 0–1 scale */
const ROTATION_PRESETS: Record<string, number> = {
  subtle: 45,
  normal: 90,
  strong: 180,
};

function parseAnimateConfig(el: HTMLElement): AnimateConfig | null {
  const type = el.dataset.animate;
  if (!type || !VALID_TYPES.has(type)) return null;

  const dir = el.dataset.animateDirection;
  const easing = el.dataset.animateEasing;
  const rawIntensity = el.dataset.animateIntensity;
  const repeat = el.dataset.animateRepeat;

  let intensity: AnimateConfig['intensity'] = DEFAULTS.intensity;
  if (rawIntensity) {
    if (VALID_INTENSITIES.has(rawIntensity)) {
      intensity = rawIntensity as IntensityPreset;
    } else {
      const num = Number(rawIntensity);
      if (!Number.isNaN(num) && num >= 0 && num <= 1) {
        intensity = num;
      }
    }
  }

  return {
    type: type as AnimationType,
    direction: (dir && VALID_DIRECTIONS.has(dir)
      ? dir
      : DEFAULTS.direction) as AnimateDirection,
    duration: Number(el.dataset.animateDuration) || DEFAULTS.duration,
    delay: Number(el.dataset.animateDelay) || DEFAULTS.delay,
    easing: (easing && VALID_EASINGS.has(easing)
      ? easing
      : DEFAULTS.easing) as AnimateEasing,
    intensity,
    startOpacity:
      el.dataset.animateOpacity !== undefined
        ? Number(el.dataset.animateOpacity)
        : DEFAULTS.startOpacity,
    repeat: (repeat === 'every' ? 'every' : 'once') as AnimateRepeat,
    threshold: Number(el.dataset.animateThreshold) || DEFAULTS.threshold,
  };
}

function parseStaggerConfig(el: HTMLElement): StaggerConfig | null {
  const val = el.dataset.animateStagger;
  if (val === undefined) return null;

  const from = el.dataset.animateStaggerFrom;
  return {
    duration: Number(val) || 100,
    from: (['first', 'last', 'center'].includes(from ?? '')
      ? from
      : 'first') as StaggerConfig['from'],
  };
}

// ---------------------------------------------------------------------------
// CSS custom property helpers
// ---------------------------------------------------------------------------

function intensityToRotate(value: AnimateConfig['intensity']): number {
  if (typeof value === 'string') {
    return ROTATION_PRESETS[value] ?? ROTATION_PRESETS.normal;
  }
  return Math.max(0, Math.min(1, value)) * 180;
}

/** Set CSS custom properties on element to configure its animation */
function applyAnimationProperties(
  el: HTMLElement,
  config: AnimateConfig,
  extraDelay = 0,
): void {
  const style = el.style;
  const totalDelay = config.delay + extraDelay;

  style.setProperty('--animate-duration', `${config.duration}ms`);
  style.setProperty('--animate-delay', `${totalDelay}ms`);
  style.setProperty(
    '--animate-easing',
    EASING_MAP[config.easing] ?? EASING_MAP[DEFAULTS.easing],
  );
  style.setProperty('--animate-start-opacity', String(config.startOpacity));

  // Intensity-driven values
  const n = resolveIntensity(config.intensity);
  const translate = n * 100;
  const scale = 1 - n;
  const rotate = intensityToRotate(config.intensity);

  style.setProperty('--animate-translate', `${translate}vh`);
  style.setProperty('--animate-scale', String(scale));
  style.setProperty('--animate-rotate', `${rotate}deg`);
}

/** Remove animation state for re-triggering */
function resetAnimation(el: HTMLElement): void {
  el.classList.remove('is-animating');
}

// ---------------------------------------------------------------------------
// Observer management
// ---------------------------------------------------------------------------

/** Grouped observers by threshold value */
const observers = new Map<number, IntersectionObserver>();

/** Track which elements use repeat="every" */
const repeatElements = new WeakSet<HTMLElement>();

/** Track elements that have already animated (for once-only) */
const animatedElements = new WeakSet<HTMLElement>();

function getObserver(threshold: number): IntersectionObserver {
  const existing = observers.get(threshold);
  if (existing) return existing;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          // Skip if already animated and not a repeat element
          if (animatedElements.has(el) && !repeatElements.has(el)) continue;

          el.classList.add('is-animating');
          animatedElements.add(el);

          // For once-only, stop observing after animation
          if (!repeatElements.has(el)) {
            observer.unobserve(el);
          }
        } else if (repeatElements.has(el)) {
          // Re-hide for repeat elements when they leave
          resetAnimation(el);
        }
      }
    },
    { threshold },
  );

  observers.set(threshold, observer);
  return observer;
}

// ---------------------------------------------------------------------------
// Stagger groups
// ---------------------------------------------------------------------------

function setupStaggerGroup(
  parent: HTMLElement,
  staggerCfg: StaggerConfig,
): void {
  const children = Array.from(
    parent.querySelectorAll<HTMLElement>(':scope > [data-animate]'),
  );
  if (children.length === 0) return;

  // Determine child ordering
  let indices: number[];
  if (staggerCfg.from === 'last') {
    indices = children.map((_, i) => children.length - 1 - i);
  } else if (staggerCfg.from === 'center') {
    const center = (children.length - 1) / 2;
    indices = children.map((_, i) => Math.abs(i - center));
  } else {
    indices = children.map((_, i) => i);
  }

  // Configure each child
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const config = parseAnimateConfig(child);
    if (!config) continue;

    const staggerDelay = indices[i] * staggerCfg.duration;
    applyAnimationProperties(child, config, staggerDelay);
  }

  // Observe the parent — when it enters, animate all children
  const threshold = 0.1;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          for (const child of children) {
            child.classList.add('is-animating');
            animatedElements.add(child);
          }
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold },
  );

  observer.observe(parent);
  observers.set(-1 - observers.size, observer); // Store for cleanup with unique key
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initInViewAnimations(): void {
  // -- Pass 1: stagger groups ------------------------------------------------
  const staggerParents = document.querySelectorAll<HTMLElement>(
    '[data-animate-stagger]',
  );
  const staggerChildSet = new WeakSet<HTMLElement>();

  for (const parent of staggerParents) {
    const staggerCfg = parseStaggerConfig(parent);
    if (!staggerCfg) continue;
    setupStaggerGroup(parent, staggerCfg);
    for (const child of parent.querySelectorAll<HTMLElement>(
      ':scope > [data-animate]',
    )) {
      staggerChildSet.add(child);
    }
  }

  // -- Pass 2: solo elements (not in a stagger group) ------------------------
  const allAnimated = document.querySelectorAll<HTMLElement>('[data-animate]');

  for (const el of allAnimated) {
    if (staggerChildSet.has(el)) continue;

    const config = parseAnimateConfig(el);
    if (!config) continue;

    // Set CSS custom properties for this element's animation
    applyAnimationProperties(el, config);

    // Track repeat elements
    if (config.repeat === 'every') {
      repeatElements.add(el);
    }

    // Observe with the element's threshold
    const observer = getObserver(config.threshold);
    observer.observe(el);
  }
}

export function destroyInViewAnimations(): void {
  // Disconnect all observers
  for (const observer of observers.values()) {
    observer.disconnect();
  }
  observers.clear();

  // Clear animation state from all elements
  const allAnimated = document.querySelectorAll<HTMLElement>('[data-animate]');
  for (const el of allAnimated) {
    el.classList.remove('is-animating');
  }
}
