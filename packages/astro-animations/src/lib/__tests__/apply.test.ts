import { describe, expect, it } from 'vitest';
import {
  applyAnimationProperties,
  clearAnimationProperties,
} from '../apply.ts';

/** Minimal config matching the shape returned by parseAnimateConfig. */
const baseConfig = {
  type: 'fade',
  direction: 'up',
  duration: 700,
  delay: 0,
  easing: 'ease-out-3',
  intensity: 'normal' as const,
  startOpacity: 0,
  repeat: 'once',
  threshold: 0.2,
};

describe('applyAnimationProperties', () => {
  it('sets --animate-duration', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig);
    expect(el.style.getPropertyValue('--animate-duration')).toBe('700ms');
  });

  it('sets --animate-delay', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig);
    expect(el.style.getPropertyValue('--animate-delay')).toBe('0ms');
  });

  it('adds extraDelay on top of config.delay', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, { ...baseConfig, delay: 100 }, 200);
    expect(el.style.getPropertyValue('--animate-delay')).toBe('300ms');
  });

  it('sets --animate-easing to the resolved cubic-bezier string', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig);
    // ease-out-3 maps to cubic-bezier(0, 0, 0.3, 1)
    expect(el.style.getPropertyValue('--animate-easing')).toBe(
      'cubic-bezier(0, 0, 0.3, 1)',
    );
  });

  it('sets --animate-start-opacity', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, { ...baseConfig, startOpacity: 0.5 });
    expect(el.style.getPropertyValue('--animate-start-opacity')).toBe('0.5');
  });

  it('sets --animate-translate based on intensity', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig); // normal → 0.15 → 15vh
    expect(el.style.getPropertyValue('--animate-translate')).toBe('15vh');
  });

  it('sets --animate-scale based on intensity', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig); // normal → 0.15 → scale = 0.85
    expect(el.style.getPropertyValue('--animate-scale')).toBe('0.85');
  });

  it('sets --animate-rotate based on intensity', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig); // normal → 90deg
    expect(el.style.getPropertyValue('--animate-rotate')).toBe('90deg');
  });

  it('does nothing when config is null', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, null);
    expect(el.style.getPropertyValue('--animate-duration')).toBe('');
  });
});

describe('clearAnimationProperties', () => {
  it('removes all CSS custom properties set by applyAnimationProperties', () => {
    const el = document.createElement('div');
    applyAnimationProperties(el, baseConfig);
    clearAnimationProperties(el);
    expect(el.style.getPropertyValue('--animate-duration')).toBe('');
    expect(el.style.getPropertyValue('--animate-delay')).toBe('');
    expect(el.style.getPropertyValue('--animate-easing')).toBe('');
    expect(el.style.getPropertyValue('--animate-start-opacity')).toBe('');
    expect(el.style.getPropertyValue('--animate-translate')).toBe('');
    expect(el.style.getPropertyValue('--animate-scale')).toBe('');
    expect(el.style.getPropertyValue('--animate-rotate')).toBe('');
  });

  it('is safe to call on an element with no properties set', () => {
    const el = document.createElement('div');
    expect(() => clearAnimationProperties(el)).not.toThrow();
  });
});
