import {
  DEFAULTS,
  VALID_DIRECTIONS,
  VALID_EASINGS,
  VALID_INTENSITIES,
  VALID_TYPES,
} from './constants.ts';

export function parseAnimateConfig(el: HTMLElement) {
  const type = el.dataset.animate;
  if (!type || !VALID_TYPES.has(type)) return null;

  const dir = el.dataset.animateDirection;
  const easing = el.dataset.animateEasing;
  const rawIntensity = el.dataset.animateIntensity;
  const repeat = el.dataset.animateRepeat;

  let intensity: string | number = DEFAULTS.intensity;
  if (rawIntensity) {
    if (VALID_INTENSITIES.has(rawIntensity)) {
      intensity = rawIntensity;
    } else {
      const num = Number(rawIntensity);
      if (!Number.isNaN(num) && num >= 0 && num <= 1) {
        intensity = num;
      }
    }
  }

  return {
    type,
    direction: dir && VALID_DIRECTIONS.has(dir) ? dir : DEFAULTS.direction,
    duration: Number(el.dataset.animateDuration) || DEFAULTS.duration,
    delay: Number(el.dataset.animateDelay) || DEFAULTS.delay,
    easing: easing && VALID_EASINGS.has(easing) ? easing : DEFAULTS.easing,
    intensity,
    startOpacity:
      el.dataset.animateOpacity !== undefined
        ? Number(el.dataset.animateOpacity)
        : DEFAULTS.startOpacity,
    reverse: el.hasAttribute('data-animate-reverse'),
    repeat: repeat === 'every' ? 'every' : 'once',
    threshold: Number(el.dataset.animateThreshold) || DEFAULTS.threshold,
  };
}

export function parseStaggerConfig(el: HTMLElement) {
  const val = el.dataset.animateStagger;
  if (val === undefined) return null;
  const from = el.dataset.animateStaggerFrom;
  return {
    duration: Number(val) || 100,
    from: ['first', 'last', 'center'].includes(from ?? '') ? from : 'first',
  };
}
