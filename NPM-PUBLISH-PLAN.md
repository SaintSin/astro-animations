# NPM Publishing Plan — astro-animations

Reference: [docs.astro.build — Publish to npm](https://docs.astro.build/en/reference/publish-to-npm/)

---

## Step 0 — Remove the nested `.git` folder

`packages/astro-animations/` was initialised as its own git repo. This means
the root repo currently treats it as a submodule and ignores its contents.
Removing the inner `.git` folder hands control back to the root repo.

Both `.gitignore` files already exclude `node_modules/`, `dist/`, `.astro/`,
and `.DS_Store`, so only source files will be tracked after this change.

```bash
rm -rf packages/astro-animations/.git
```

Then verify git sees the right files before committing:

```bash
git status
```

- [x] Delete `packages/astro-animations/.git/`
- [x] Run `git status` and confirm only source files appear
- [ ] Commit the package source to the root repo

---

## Step 1 — Configure workspaces in `pnpm-workspace.yaml`

The project uses pnpm. Workspaces are declared in `pnpm-workspace.yaml` rather
than in `package.json`. This tells pnpm about the `packages/` directory and
enables local testing of the package before publishing.

Add to `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
```

Then run `pnpm install` from the root to link the workspace.

- [x] Add `packages` entry to `pnpm-workspace.yaml`
- [x] Run `pnpm install` to link workspace

---

## Step 2 — Flesh out the package `package.json`

`packages/astro-animations/package.json` is missing several fields that npm
and the Astro integrations library require.

Fields to add/update:

- `name` — consider a scoped name, e.g. `@stjohn/astro-animations`
- `description` — what the package does
- `author` — name and optionally URL/email
- `license` — e.g. `MIT`
- `repository` — link to the GitHub repo
- `homepage` — link to docs or demo
- `keywords` — must include `astro-component` for Astro integrations library discoverability

- [x] Decide on the package name (unscoped: `astro-animations`)
- [x] Update all metadata fields
- [x] Verify `exports` and `files` are correct

---

## Step 3 — Replace placeholder with real components

The current `src/MyComponent.astro` is a template placeholder. The actual
animation components need to live in `packages/astro-animations/src/`.

- [x] Identify which components from `src/` should be part of the package
- [x] Copy/move those components into `packages/astro-animations/src/`
- [x] Update `packages/astro-animations/index.ts` to export them correctly
- [x] Use named exports so users can import selectively

---

## Step 4 — Set up a demo/test project

The existing root Astro project can serve as the demo. It should import from
the package name (e.g. `astro-animations`) rather than a relative path, so
the test mirrors real-world usage.

- [x] Confirm the root project imports from `astro-animations` (not `../../packages/...`)
- [x] Add fixture pages that test each exported component — `index.astro` covers all 7 types, stagger, repeat, reduced-motion, and ScrollEffect; Playwright targets these directly
- [x] Verify `astro dev` and `astro build` work correctly end-to-end

---

## Step 5 — Create an npm account and log in

Required before publishing.

- [x] Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one
- [x] Run `npm login` in the terminal and authenticate
- [x] If using a scoped package name, decide whether it will be public or private

---

## Step 6 — Publish

- [x] Do a dry run first: `npm publish --dry-run` from `packages/astro-animations/`
- [x] Review the list of files that will be published
- [x] Publish: `npm publish` from `packages/astro-animations/`
- [x] Verify the package appears at [npmjs.com/package/astro-animations](https://www.npmjs.com/package/astro-animations)
- [x] Installed and confirmed working in a separate project

---

## Step 7 — List in Astro integrations library (optional)

The [Astro integrations library](https://astro.build/integrations/) automatically
indexes packages with Astro-related keywords weekly. No action needed beyond
ensuring the keywords are correct (Step 2).

- [x] Confirm `astro-component` is in `keywords`
- [ ] Wait for the weekly index to pick it up

---

## Step 8 — Add tests (post-publish)

Not required to publish, but worth adding once the package is live and stable.

### 8a — Extract bundled script into separate modules

All JS is currently inlined in `astro-animations.astro`. Vite processes
`<script>` tags and handles imports, so the logic can be split into `.ts` files
and imported — the output bundle stays identical.

Proposed structure:

```text
packages/astro-animations/src/lib/
├── constants.ts   # DEFAULTS, INTENSITY_PRESETS, EASING_MAP, resolveIntensity, intensityToRotate
├── parse.ts       # parseAnimateConfig, parseStaggerConfig
├── apply.ts       # applyAnimationProperties, clearAnimationProperties, promoteElement
└── observer.ts    # getOrCreateObserver, setupStaggerGroup, initInViewAnimations, destroyInViewAnimations
```

`astro-animations.astro` becomes:

```astro
<script>
  import { initAnimations, destroyAnimations } from './lib/observer.ts';

  document.addEventListener('astro:page-load', initAnimations);
  document.addEventListener('astro:before-swap', destroyAnimations);
  initAnimations();
</script>
```

- [x] Create `packages/astro-animations/src/lib/` directory
- [x] Split bundled script into the four modules above
- [x] Update `astro-animations.astro` `<script>` to import from lib
- [x] Verify `pnpm dev` and `pnpm build` still work

### 8b — Unit tests (Vitest)

`constants.ts` and `parse.ts` are pure functions with no DOM dependency —
ideal for Vitest without a browser or jsdom.

Good unit test candidates:

- `resolveIntensity` — numeric clamping (0–1), named preset lookup, unknown → fallback
- `intensityToRotate` — named presets return correct degrees, numeric scaling
- `parseAnimateConfig` — valid/invalid types return null, direction fallback,
  duration/delay parsing, easing validation, intensity variants, repeat logic
- `parseStaggerConfig` — absent attribute returns null, from values, duration fallback

`apply.ts` and `observer.ts` require a DOM — use jsdom (built into Vitest).

Setup:

```bash
pnpm add -D vitest --filter astro-animations
```

Add to `packages/astro-animations/package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [x] Install Vitest in the package workspace
- [x] Write unit tests for `resolveIntensity` and `intensityToRotate`
- [x] Write unit tests for `parseAnimateConfig`
- [x] Write unit tests for `parseStaggerConfig`
- [x] Write DOM tests for `applyAnimationProperties` (jsdom)

### 8c — End-to-end tests (Playwright)

Use the demo site as the test fixture. Playwright can scroll the page and
assert that `is-animating` classes are applied and CSS properties are set.

Good e2e test candidates:

- Each animation type triggers `.is-animating` on viewport entry
- `repeat="every"` re-animates on re-entry
- `data-stagger` delays children sequentially
- `prefers-reduced-motion` disables all animations (emulate via Playwright)
- ScrollEffect elements have `animation-timeline` applied (CSS-only, check computed styles)

Setup:

```bash
pnpm add -D @playwright/test          # at root
pnpm exec playwright install chromium # minimal browser install
```

Add to root `package.json`:

```json
"scripts": {
  "test:e2e": "playwright test"
}
```

- [x] Install Playwright at the root
- [x] Add fixture pages to demo site (one element per animation type)
- [x] Write scroll-trigger test for each animation type
- [x] Write reduced-motion test
- [x] Write stagger ordering test
- [x] Add a `test:e2e` script to root `package.json`

---

## Notes

- Astro natively supports `.astro`, `.ts`, `.jsx`, and `.css` — no build step needed before publishing.
- The nested `.git` issue is covered in Step 0 — remove it before doing anything else.
- Publishing with pnpm: use `pnpm publish` from `packages/astro-animations/` rather than `npm publish`.
