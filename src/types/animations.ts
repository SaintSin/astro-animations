/** The 7 animation types */
export type AnimationType =
  | 'fade'
  | 'slide'
  | 'bounce'
  | 'zoom'
  | 'flip'
  | 'fold'
  | 'roll';

/** Direction for directional animations */
export type AnimateDirection = 'up' | 'down' | 'left' | 'right';

/** Easing presets — Open Props curated set.
 *  "spring" is aliased to "spring-3" (linear() approximation). */
export type AnimateEasing =
  | 'ease-1'
  | 'ease-2'
  | 'ease-3'
  | 'ease-4'
  | 'ease-5'
  | 'ease-in-1'
  | 'ease-in-2'
  | 'ease-in-3'
  | 'ease-in-4'
  | 'ease-in-5'
  | 'ease-out-1'
  | 'ease-out-2'
  | 'ease-out-3'
  | 'ease-out-4'
  | 'ease-out-5'
  | 'ease-in-out-1'
  | 'ease-in-out-2'
  | 'ease-in-out-3'
  | 'ease-in-out-4'
  | 'ease-in-out-5'
  | 'elastic-out-1'
  | 'elastic-out-2'
  | 'elastic-out-3'
  | 'elastic-out-4'
  | 'elastic-out-5'
  | 'elastic-in-1'
  | 'elastic-in-2'
  | 'elastic-in-3'
  | 'elastic-in-4'
  | 'elastic-in-5'
  | 'bounce-1'
  | 'bounce-2'
  | 'bounce-3'
  | 'bounce-4'
  | 'bounce-5'
  | 'spring-1'
  | 'spring-2'
  | 'spring-3'
  | 'spring-4'
  | 'spring-5'
  | 'spring';

/** Named intensity presets */
export type IntensityPreset = 'subtle' | 'normal' | 'strong';

/** Transform intensity: a named preset or a 0–1 numeric value */
export type AnimateIntensity = IntensityPreset | number;

/** Repeat behavior */
export type AnimateRepeat = 'once' | 'every';

/** Parsed configuration from data attributes */
export interface AnimateConfig {
  type: AnimationType;
  direction: AnimateDirection;
  duration: number;
  delay: number;
  easing: AnimateEasing;
  intensity: AnimateIntensity;
  startOpacity: number;
  repeat: AnimateRepeat;
  threshold: number;
}

/** Stagger configuration for parent containers */
export interface StaggerConfig {
  duration: number;
  from: 'first' | 'last' | 'center';
}

/** Scroll-linked effect types */
export type ScrollEffectType =
  | 'parallax'
  | 'fade'
  | 'scale'
  | 'rotate'
  | 'blur'
  | 'horizontal';

/** Parsed scroll effect configuration */
export interface ScrollEffectConfig {
  type: ScrollEffectType;
  speed: number;
  axis: 'x' | 'y';
}
