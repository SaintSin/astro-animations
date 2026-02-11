import { describe, expect, it } from 'vitest';
import { DEFAULTS } from '../src/lib/constants.ts';
import { parseAnimateConfig, parseStaggerConfig } from '../src/lib/parse.ts';

/** Helper: create a div with dataset properties set from a camelCase map. */
function makeEl(dataset: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div');
  for (const [key, val] of Object.entries(dataset)) {
    el.dataset[key] = val;
  }
  return el;
}

// ---------------------------------------------------------------------------
// parseAnimateConfig
// ---------------------------------------------------------------------------

describe('parseAnimateConfig', () => {
  it('returns null when data-animate is absent', () => {
    expect(parseAnimateConfig(document.createElement('div'))).toBeNull();
  });

  it('returns null for an unrecognised animation type', () => {
    expect(parseAnimateConfig(makeEl({ animate: 'spin' }))).toBeNull();
    expect(parseAnimateConfig(makeEl({ animate: '' }))).toBeNull();
  });

  it('returns a config object for each valid animation type', () => {
    for (const type of [
      'fade',
      'slide',
      'bounce',
      'zoom',
      'flip',
      'fold',
      'roll',
    ]) {
      const config = parseAnimateConfig(makeEl({ animate: type }));
      expect(config).not.toBeNull();
      expect(config?.type).toBe(type);
    }
  });

  it('falls back to default direction when not specified', () => {
    const config = parseAnimateConfig(makeEl({ animate: 'slide' }));
    expect(config?.direction).toBe(DEFAULTS.direction);
  });

  it('uses a valid direction', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      const config = parseAnimateConfig(
        makeEl({ animate: 'slide', animateDirection: dir }),
      );
      expect(config?.direction).toBe(dir);
    }
  });

  it('falls back to default direction for an invalid direction', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'slide', animateDirection: 'diagonal' }),
    );
    expect(config?.direction).toBe(DEFAULTS.direction);
  });

  it('parses duration in milliseconds', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateDuration: '600' }),
    );
    expect(config?.duration).toBe(600);
  });

  it('falls back to default duration when not specified', () => {
    const config = parseAnimateConfig(makeEl({ animate: 'fade' }));
    expect(config?.duration).toBe(DEFAULTS.duration);
  });

  it('parses delay in milliseconds', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateDelay: '200' }),
    );
    expect(config?.delay).toBe(200);
  });

  it('falls back to default delay when not specified', () => {
    const config = parseAnimateConfig(makeEl({ animate: 'fade' }));
    expect(config?.delay).toBe(DEFAULTS.delay);
  });

  it('validates a known easing preset', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateEasing: 'spring' }),
    );
    expect(config?.easing).toBe('spring');
  });

  it('falls back to default easing for unknown easing name', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateEasing: 'magic' }),
    );
    expect(config?.easing).toBe(DEFAULTS.easing);
  });

  it('accepts named intensity presets', () => {
    for (const preset of ['subtle', 'normal', 'strong']) {
      const config = parseAnimateConfig(
        makeEl({ animate: 'fade', animateIntensity: preset }),
      );
      expect(config?.intensity).toBe(preset);
    }
  });

  it('accepts a valid numeric intensity (0–1)', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateIntensity: '0.25' }),
    );
    expect(config?.intensity).toBe(0.25);
  });

  it('ignores out-of-range numeric intensity and falls back to default', () => {
    const over = parseAnimateConfig(
      makeEl({ animate: 'fade', animateIntensity: '1.5' }),
    );
    expect(over?.intensity).toBe(DEFAULTS.intensity);
    const under = parseAnimateConfig(
      makeEl({ animate: 'fade', animateIntensity: '-0.1' }),
    );
    expect(under?.intensity).toBe(DEFAULTS.intensity);
  });

  it('defaults opacity to the default startOpacity', () => {
    const config = parseAnimateConfig(makeEl({ animate: 'fade' }));
    expect(config?.startOpacity).toBe(DEFAULTS.startOpacity);
  });

  it('parses a custom startOpacity', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateOpacity: '0.3' }),
    );
    expect(config?.startOpacity).toBe(0.3);
  });

  it('defaults repeat to "once"', () => {
    const config = parseAnimateConfig(makeEl({ animate: 'fade' }));
    expect(config?.repeat).toBe('once');
  });

  it('accepts repeat="every"', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateRepeat: 'every' }),
    );
    expect(config?.repeat).toBe('every');
  });

  it('treats any non-"every" repeat value as "once"', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateRepeat: 'always' }),
    );
    expect(config?.repeat).toBe('once');
  });

  it('parses threshold', () => {
    const config = parseAnimateConfig(
      makeEl({ animate: 'fade', animateThreshold: '0.5' }),
    );
    expect(config?.threshold).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// parseStaggerConfig
// ---------------------------------------------------------------------------

describe('parseStaggerConfig', () => {
  it('returns null when data-animate-stagger is absent', () => {
    expect(parseStaggerConfig(document.createElement('div'))).toBeNull();
  });

  it('returns a config when data-animate-stagger is present', () => {
    const config = parseStaggerConfig(makeEl({ animateStagger: '100' }));
    expect(config).not.toBeNull();
  });

  it('parses stagger duration', () => {
    const config = parseStaggerConfig(makeEl({ animateStagger: '150' }));
    expect(config?.duration).toBe(150);
  });

  it('falls back to 100ms when stagger value is empty', () => {
    const config = parseStaggerConfig(makeEl({ animateStagger: '' }));
    expect(config?.duration).toBe(100);
  });

  it('accepts from="first"', () => {
    const config = parseStaggerConfig(
      makeEl({ animateStagger: '100', animateStaggerFrom: 'first' }),
    );
    expect(config?.from).toBe('first');
  });

  it('accepts from="last"', () => {
    const config = parseStaggerConfig(
      makeEl({ animateStagger: '100', animateStaggerFrom: 'last' }),
    );
    expect(config?.from).toBe('last');
  });

  it('accepts from="center"', () => {
    const config = parseStaggerConfig(
      makeEl({ animateStagger: '100', animateStaggerFrom: 'center' }),
    );
    expect(config?.from).toBe('center');
  });

  it('falls back to "first" for an invalid from value', () => {
    const config = parseStaggerConfig(
      makeEl({ animateStagger: '100', animateStaggerFrom: 'random' }),
    );
    expect(config?.from).toBe('first');
  });
});
