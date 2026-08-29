# AGENTS

## Overview

`pageflip` is a Bun-first Turborepo monorepo for a page-turning UI stack.

Main surfaces:

- `packages/core`: renderer-agnostic engine and math
- `packages/react`: React wrapper and hooks
- `packages/theme`: tokens, UI primitives, and design system assets
- `packages/web-component`: custom elements
- `packages/renderers`: renderer integrations
- `apps/playground`: interactive demo and verification surface
- `apps/docs`: VitePress documentation site
- `apps/benchmark`: internal benchmark app
- `tools/*`: shared repo configs

## Repo Rules

- Use `bun` only. Do not introduce `npm`, `pnpm`, or `yarn` commands into repo scripts.
- Keep dependency versions exact. Do not add `^` or `~`.
- Prefer root scripts that delegate to `turbo run ...`.
- Keep commits small and task-scoped.
- Follow Conventional Commits. Valid types are enforced by `commitlint.config.js`.
- Branching model:
  - `develop`: integration
  - `master`: production
- Release flow uses Changesets. Do not publish manually from the root package.

## Preferred Commands

Install:

```bash
bun install
```

Common tasks:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:coverage
```

Package-scoped examples:

```bash
bun run --filter=@pageflip/theme build
bun run --filter=@pageflip/playground dev
bun run --filter=@pageflip/benchmark test
```

## Design System Guidance

- Source of truth for design tokens: `packages/theme/src/tokens.css`
- Tailwind CSS-first entrypoint: `packages/theme/src/tailwind.css`
- If changing UI primitives, prefer token-driven styles over one-off values.
- Keep accessibility features intact: `prefers-reduced-motion`, focus-visible, dark mode, and semantic labels.

## AI Working Rules

- Read this file before editing code.
- Prefer the installed skills in `.agents/skills/` when relevant:
  - `turborepo`
  - `vercel-react-best-practices`
  - `vercel-composition-patterns`
  - `tailwind-design-system`
  - `frontend-design`
  - `emil-design-eng`
  - `review-animations`
- Do not make broad aesthetic changes unless the task explicitly asks for design work.
- For React/theme work, prefer minimal correct refactors over API churn.
- Preserve published behavior unless the task explicitly authorizes a breaking change.

## Caveman Rule

- Do **not** auto-install, auto-invoke, or default to `caveman`, `caveman-commit`, `caveman-review`, or related Caveman workflows.
- Use Caveman only when the user explicitly asks for it.
- If the user explicitly requests Caveman, repo conventions still win:
  - Bun-only
  - exact dependency versions
  - Conventional Commits
  - no destructive git operations
  - no bypassing project verification
- Caveman must never override the repo's own skills, design tokens, release flow, or commit policy.

## Verification Expectations

- Verify the smallest relevant surface after each change.
- Prefer package-level verification when a repo-wide run is known to be noisy.
- Current practical verification surfaces:
  - Theme/Web Component changes: package build
  - Playground UX/accessibility changes: `apps/playground`
  - Docs theme/content changes: `apps/docs`
  - Benchmark changes: `apps/benchmark`

## Known Repo Caveats

- `apps/docs/changelog.md` currently has malformed frontmatter and can break VitePress builds until fixed.
- `apps/playground/tsconfig.json` currently includes `vite.config.ts` outside `rootDir`, which can break `tsc` during playground build until corrected.
- Some component tests rely on a DOM-like environment and may need dedicated setup beyond plain `bun test`.
