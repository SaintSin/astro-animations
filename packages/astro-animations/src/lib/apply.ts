import {
  DEFAULTS,
  EASING_MAP,
  intensityToRotate,
  resolveIntensity,
} from './constants.ts';
import type { parseAnimateConfig } from './parse.ts';

export const ANIMATION_PROPS = [
  '--animate-duration',
  '--animate-delay',
  '--animate-easing',
  '--animate-start-opacity',
  '--animate-translate',
  '--animate-scale',
  '--animate-rotate',
  'will-change',
] as const;

export function promoteElement(el: HTMLElement): void {
  el.style.willChange = 'opacity, transform';
}

export function listenForAnimationEnd(el: HTMLElement): void {
  el.addEventListener(
    'animationend',
    () => {
      el.style.willChange = '';
    },
    { once: true },
  );
}

export function applyAnimationProperties(
  el: HTMLElement,
  config: ReturnType<typeof parseAnimateConfig>,
  extraDelay = 0,
): void {
  if (!config) return;
  const style = el.style;
  const totalDelay = config.delay + extraDelay;
  style.setProperty('--animate-duration', `${config.duration}ms`);
  style.setProperty('--animate-delay', `${totalDelay}ms`);
  style.setProperty(
    '--animate-easing',
    EASING_MAP[config.easing] ?? EASING_MAP[DEFAULTS.easing],
  );
  style.setProperty('--animate-start-opacity', String(config.startOpacity));
  const n = resolveIntensity(config.intensity);
  style.setProperty('--animate-translate', `${n * 100}vh`);
  style.setProperty('--animate-scale', String(1 - n));
  style.setProperty(
    '--animate-rotate',
    `${intensityToRotate(config.intensity)}deg`,
  );
}

export function clearAnimationProperties(el: HTMLElement): void {
  for (const prop of ANIMATION_PROPS) {
    el.style.removeProperty(prop);
  }
}
