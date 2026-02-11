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

- [ ] Delete `packages/astro-animations/.git/`
- [ ] Run `git status` and confirm only source files appear
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

- [ ] Decide on the package name (scoped or unscoped)
- [ ] Update all metadata fields
- [ ] Verify `exports` and `files` are correct

---

## Step 3 — Replace placeholder with real components

The current `src/MyComponent.astro` is a template placeholder. The actual
animation components need to live in `packages/astro-animations/src/`.

- [ ] Identify which components from `src/` should be part of the package
- [ ] Copy/move those components into `packages/astro-animations/src/`
- [ ] Update `packages/astro-animations/index.ts` to export them correctly
- [ ] Use named exports so users can import selectively

---

## Step 4 — Set up a demo/test project

The existing root Astro project can serve as the demo. It should import from
the package name (e.g. `astro-animations`) rather than a relative path, so
the test mirrors real-world usage.

- [ ] Confirm the root project imports from `astro-animations` (not `../../packages/...`)
- [ ] Add fixture pages that test each exported component
- [ ] Verify `astro dev` and `astro build` work correctly end-to-end

---

## Step 5 — Create an npm account and log in

Required before publishing.

- [ ] Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one
- [ ] Run `npm login` in the terminal and authenticate
- [ ] If using a scoped package name, decide whether it will be public or private

---

## Step 6 — Publish

- [ ] Do a dry run first: `npm publish --dry-run` from `packages/astro-animations/`
- [ ] Review the list of files that will be published
- [ ] Publish: `npm publish --access public` (required for scoped public packages)
- [ ] Verify the package appears at `https://www.npmjs.com/package/<your-package-name>`

---

## Step 7 — List in Astro integrations library (optional)

The [Astro integrations library](https://astro.build/integrations/) automatically
indexes packages with Astro-related keywords weekly. No action needed beyond
ensuring the keywords are correct (Step 2).

- [ ] Confirm `astro-component` is in `keywords`
- [ ] Wait for the weekly index to pick it up

---

## Notes

- Astro natively supports `.astro`, `.ts`, `.jsx`, and `.css` — no build step needed before publishing.
- The nested `.git` issue is covered in Step 0 — remove it before doing anything else.
