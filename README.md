# astro-animations — development repo

Monorepo for the [`astro-animations`](https://www.npmjs.com/package/astro-animations) npm package.

The package lives in `packages/astro-animations/`. The root Astro project is the demo site that imports and showcases it.

---

## Repository structure

```text
/
├── packages/
│   └── astro-animations/   # The npm package
│       ├── src/
│       │   ├── Animate.astro
│       │   ├── ScrollEffect.astro
│       │   ├── astro-animations.astro
│       │   └── types/animations.ts
│       └── index.ts
├── src/                    # Demo site
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   ├── styles/
│   └── types/
├── pnpm-workspace.yaml
├── astro.config.mjs
└── package.json
```

---

## Getting started

```sh
pnpm install
pnpm dev
```

The demo site runs at `http://localhost:4321`.

---

## Commands

| Command | Action |
| :------ | :----- |
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Start demo site dev server |
| `pnpm build` | Build demo site to `./dist/` |
| `pnpm preview` | Preview production build |
| `pnpm check` | Biome format + lint |
| `pnpm type-check` | Run `astro check` |

---

## Working on the package

The root project imports the package via the workspace protocol (`workspace:*`), so changes to `packages/astro-animations/` are reflected immediately — no rebuild or reinstall needed.

```sh
# Publish a new version
cd packages/astro-animations
pnpm version patch   # or minor / major
pnpm publish
```

See [NPM-PUBLISH-PLAN.md](NPM-PUBLISH-PLAN.md) for the full publishing checklist.

---


## License

MIT — [StJohn Mackay](https://github.com/SaintSin)
