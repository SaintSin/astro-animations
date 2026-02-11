import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

test('body gets data-animate-ready after init', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-animate-ready');
});

test('in-viewport elements get is-animating on page load', async ({ page }) => {
  await page.goto('/');
  // The <h1> is at the top of the page — it should animate immediately
  const h1 = page.locator('h1[data-animate="fade"]');
  await expect(h1).toHaveClass(/is-animating/);
});

// ---------------------------------------------------------------------------
// Scroll-triggered animations
// ---------------------------------------------------------------------------

test('element gets is-animating after scrolling into view', async ({
  page,
}) => {
  await page.goto('/');
  // The roll element is well below the fold
  const rollEl = page.locator('[data-animate="roll"]').first();
  await rollEl.scrollIntoViewIfNeeded();
  await expect(rollEl).toHaveClass(/is-animating/);
});

test('all seven animation types animate when scrolled into view', async ({
  page,
}) => {
  await page.goto('/');
  for (const type of [
    'fade',
    'slide',
    'bounce',
    'zoom',
    'flip',
    'fold',
    'roll',
  ]) {
    const el = page.locator(`[data-animate="${type}"]`).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toHaveClass(/is-animating/, { timeout: 2000 });
  }
});

// ---------------------------------------------------------------------------
// Stagger
// ---------------------------------------------------------------------------

test('stagger children have sequentially increasing --animate-delay', async ({
  page,
}) => {
  await page.goto('/');
  const parent = page.locator('[data-animate-stagger]').first();
  const children = parent.locator(':scope > [data-animate]');

  const delays = await children.evaluateAll((els) =>
    els.map((el) => {
      const raw = (el as HTMLElement).style.getPropertyValue('--animate-delay');
      return Number.parseInt(raw, 10);
    }),
  );

  expect(delays.length).toBeGreaterThan(1);
  // Each delay should be >= the previous (stagger from first)
  for (let i = 1; i < delays.length; i++) {
    expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
  }
});

// ---------------------------------------------------------------------------
// repeat="every"
// ---------------------------------------------------------------------------

test('repeat=every element re-animates after leaving and re-entering viewport', async ({
  page,
}) => {
  await page.goto('/');
  const el = page.locator('[data-animate-repeat="every"]').first();

  // Scroll to it — should animate
  await el.scrollIntoViewIfNeeded();
  await expect(el).toHaveClass(/is-animating/);

  // Scroll far away to trigger exit
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // is-animating should have been removed on exit
  await expect(el).not.toHaveClass(/is-animating/);

  // Scroll back — should re-animate
  await el.scrollIntoViewIfNeeded();
  await expect(el).toHaveClass(/is-animating/);
});

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------

test('prefers-reduced-motion: body does not get data-animate-ready', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('body')).not.toHaveAttribute('data-animate-ready');
  await context.close();
});

test('prefers-reduced-motion: in-viewport elements get opacity:1 directly', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const h1 = page.locator('h1[data-animate="fade"]');
  const opacity = await h1.evaluate((el) => (el as HTMLElement).style.opacity);
  expect(opacity).toBe('1');
  await context.close();
});

// ---------------------------------------------------------------------------
// CSS Scroll Timeline (ScrollEffect)
// ---------------------------------------------------------------------------

test('ScrollEffect elements have data-scroll-effect attribute', async ({
  page,
}) => {
  await page.goto('/');
  const effects = page.locator('[data-scroll-effect]');
  const count = await effects.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(effects.nth(i)).toHaveAttribute('data-scroll-effect');
  }
});
