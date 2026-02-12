import { describe, expect, it } from 'vitest';
import {
  INTENSITY_PRESETS,
  intensityToRotate,
  ROTATION_PRESETS,
  resolveIntensity,
} from '../src/lib/constants.ts';

describe('resolveIntensity', () => {
  it('returns a number within 0–1 unchanged', () => {
    expect(resolveIntensity(0.5)).toBe(0.5);
    expect(resolveIntensity(0)).toBe(0);
    expect(resolveIntensity(1)).toBe(1);
  });

  it('clamps values below 0 to 0', () => {
    expect(resolveIntensity(-0.1)).toBe(0);
    expect(resolveIntensity(-10)).toBe(0);
  });

  it('clamps values above 1 to 1', () => {
    expect(resolveIntensity(1.5)).toBe(1);
    expect(resolveIntensity(100)).toBe(1);
  });

  it('resolves "subtle" to its preset value', () => {
    expect(resolveIntensity('subtle')).toBe(INTENSITY_PRESETS.subtle);
  });

  it('resolves "normal" to its preset value', () => {
    expect(resolveIntensity('normal')).toBe(INTENSITY_PRESETS.normal);
  });

  it('resolves "strong" to its preset value', () => {
    expect(resolveIntensity('strong')).toBe(INTENSITY_PRESETS.strong);
  });

  it('falls back to "normal" for unknown string presets', () => {
    expect(resolveIntensity('unknown')).toBe(INTENSITY_PRESETS.normal);
    expect(resolveIntensity('')).toBe(INTENSITY_PRESETS.normal);
  });
});

describe('intensityToRotate', () => {
  it('returns correct degrees for named presets', () => {
    expect(intensityToRotate('subtle')).toBe(ROTATION_PRESETS.subtle);
    expect(intensityToRotate('normal')).toBe(ROTATION_PRESETS.normal);
    expect(intensityToRotate('strong')).toBe(ROTATION_PRESETS.strong);
  });

  it('falls back to "normal" degrees for unknown string', () => {
    expect(intensityToRotate('unknown')).toBe(ROTATION_PRESETS.normal);
  });

  it('scales numeric 0 to 0deg', () => {
    expect(intensityToRotate(0)).toBe(0);
  });

  it('scales numeric 1 to 180deg', () => {
    expect(intensityToRotate(1)).toBe(180);
  });

  it('scales numeric 0.5 to 90deg', () => {
    expect(intensityToRotate(0.5)).toBe(90);
  });

  it('clamps numbers above 1 to 180deg', () => {
    expect(intensityToRotate(2)).toBe(180);
  });

  it('clamps numbers below 0 to 0deg', () => {
    expect(intensityToRotate(-1)).toBe(0);
  });
});
