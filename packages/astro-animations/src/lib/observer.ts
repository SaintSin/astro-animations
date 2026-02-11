import {
  applyAnimationProperties,
  clearAnimationProperties,
  listenForAnimationEnd,
  promoteElement,
} from './apply.ts';
import { parseAnimateConfig, parseStaggerConfig } from './parse.ts';

const allObservers: IntersectionObserver[] = [];
const thresholdCache = new Map<number, IntersectionObserver>();
let repeatElements = new Set<HTMLElement>();
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
          if (!repeatElements.has(el)) observer.unobserve(el);
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

function setupStaggerGroup(
  parent: HTMLElement,
  staggerCfg: ReturnType<typeof parseStaggerConfig>,
): void {
  if (!staggerCfg) return;
  const children = Array.from(
    parent.querySelectorAll<HTMLElement>(':scope > [data-animate]'),
  );
  if (children.length === 0) return;

  let indices: number[];
  if (staggerCfg.from === 'last') {
    indices = children.map((_, i) => children.length - 1 - i);
  } else if (staggerCfg.from === 'center') {
    const center = (children.length - 1) / 2;
    indices = children.map((_, i) => Math.abs(i - center));
  } else {
    indices = children.map((_, i) => i);
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const config = parseAnimateConfig(child);
    if (!config) continue;
    applyAnimationProperties(child, config, indices[i] * staggerCfg.duration);
  }

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

function initInViewAnimations(): void {
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

  const allAnimated = document.querySelectorAll<HTMLElement>('[data-animate]');
  for (const el of allAnimated) {
    if (staggerChildSet.has(el)) continue;
    const config = parseAnimateConfig(el);
    if (!config) continue;
    applyAnimationProperties(el, config);
    if (config.repeat === 'every') repeatElements.add(el);
    getOrCreateObserver(config.threshold).observe(el);
  }
}

function destroyInViewAnimations(): void {
  for (const observer of allObservers) observer.disconnect();
  allObservers.length = 0;
  thresholdCache.clear();
  repeatElements = new Set();
  animatedElements = new Set();
  const allAnimated = document.querySelectorAll<HTMLElement>('[data-animate]');
  for (const el of allAnimated) {
    el.classList.remove('is-animating');
    clearAnimationProperties(el);
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initAnimations(): void {
  if (document.body.hasAttribute('data-animate-ready')) return;

  if (prefersReducedMotion()) {
    const animated = document.querySelectorAll<HTMLElement>('[data-animate]');
    for (const el of animated) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
    return;
  }

  initInViewAnimations();
  document.body.setAttribute('data-animate-ready', '');
}

export function destroyAnimations(): void {
  destroyInViewAnimations();
  document.body.removeAttribute('data-animate-ready');
}
