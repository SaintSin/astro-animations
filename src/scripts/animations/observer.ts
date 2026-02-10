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

/** Inline style properties set by JS — cleared on destroy */
const ANIMATION_PROPS = [
  '--animate-duration',
  '--animate-delay',
  '--animate-easing',
  '--animate-start-opacity',
  '--animate-translate',
  '--animate-scale',
  '--animate-rotate',
  'will-change',
] as const;

// ---------------------------------------------------------------------------
// will-change lifecycle
// ---------------------------------------------------------------------------

/** Promote element to compositor layer just before animation starts */
function promoteElement(el: HTMLElement): void {
  el.style.willChange = 'opacity, transform';
}

/**
 * Clear will-change after animation finishes to release compositor memory.
 * Uses a one-shot listener so it fires exactly once per animation cycle.
 */
function listenForAnimationEnd(el: HTMLElement): void {
  el.addEventListener(
    'animationend',
    () => {
      el.style.willChange = '';
    },
    { once: true },
  );
}

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

/** Remove inline CSS custom properties from an element */
function clearAnimationProperties(el: HTMLElement): void {
  for (const prop of ANIMATION_PROPS) {
    el.style.removeProperty(prop);
  }
}

// ---------------------------------------------------------------------------
// Observer management
//
// Using Set (not WeakSet) for element tracking so we can clear on destroy.
// All references are released explicitly in destroyInViewAnimations()
// which runs on every View Transition swap.
// ---------------------------------------------------------------------------

/** All observer instances — disconnected and released on destroy */
const allObservers: IntersectionObserver[] = [];

/** Threshold-keyed cache for solo element observers */
const thresholdCache = new Map<number, IntersectionObserver>();

/** Track which elements use repeat="every" */
let repeatElements = new Set<HTMLElement>();

/** Track elements that have already animated (for once-only) */
let animatedElements = new Set<HTMLElement>();

function getOrCreateObserver(threshold: number): IntersectionObserver {
  const existing = thresholdCache.get(threshold);
  if (existing) return existing;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          if (animatedElements.has(el) && !repeatElements.has(el)) continue;

          promoteElement(el);
          el.classList.add('is-animating');
          listenForAnimationEnd(el);
          animatedElements.add(el);

          if (!repeatElements.has(el)) {
            observer.unobserve(el);
          }
        } else if (repeatElements.has(el)) {
          el.classList.remove('is-animating');
        }
      }
    },
    { threshold },
  );

  thresholdCache.set(threshold, observer);
  allObservers.push(observer);
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

  // Observe the parent — when it enters, animate all children.
  // The callback closes over `children`; disconnect() in destroy
  // releases the observer so the closure and DOM refs are GC'd.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          for (const child of children) {
            promoteElement(child);
            child.classList.add('is-animating');
            listenForAnimationEnd(child);
            animatedElements.add(child);
          }
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(parent);
  allObservers.push(observer);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initInViewAnimations(): void {
  // -- Pass 1: stagger groups ------------------------------------------------
  const staggerParents = document.querySelectorAll<HTMLElement>(
    '[data-animate-stagger]',
  );
  const staggerChildSet = new Set<HTMLElement>();

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

    applyAnimationProperties(el, config);

    if (config.repeat === 'every') {
      repeatElements.add(el);
    }

    const observer = getOrCreateObserver(config.threshold);
    observer.observe(el);
  }
}

export function destroyInViewAnimations(): void {
  // Disconnect all observers — releases element refs held in callbacks
  for (const observer of allObservers) {
    observer.disconnect();
  }
  allObservers.length = 0;
  thresholdCache.clear();

  // Release DOM references held in tracking sets
  repeatElements = new Set();
  animatedElements = new Set();

  // Clear animation state and inline custom properties
  const allAnimated = document.querySelectorAll<HTMLElement>('[data-animate]');
  for (const el of allAnimated) {
    el.classList.remove('is-animating');
    clearAnimationProperties(el);
  }
}
