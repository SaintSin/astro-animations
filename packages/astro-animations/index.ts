// Do not write code directly here, instead use the `src` folder!
// Then, use this file to export everything you want your user to access.

export { default as Animate } from './src/Animate.astro';
export { default as AstroAnimations } from './src/astro-animations.astro';
export { default as ScrollEffect } from './src/ScrollEffect.astro';

export type {
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
} from './src/types/animations';
