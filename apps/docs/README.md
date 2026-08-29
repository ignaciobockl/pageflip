# Docs

VitePress site for the PageFlip monorepo.

## Scripts

```bash
bun run --filter=./apps/docs dev
bun run --filter=./apps/docs build
bun run --filter=./apps/docs preview
bun run --filter=./apps/docs lint
```

## Writing guide

### Content structure

- `index.md`: homepage
- `guide/`: onboarding and conceptual documentation
- `api/`: package-level API reference
- `components/`: `@pageflip/theme` component docs
- `examples/`: practical integration examples
- `migration/`: migration and upgrade guides
- `changelog.md`: release notes for the docs site

### Writing conventions

- Use short, descriptive frontmatter with `title` and `description`.
- Prefer sentence case headings.
- Keep examples runnable and aligned with package names from the monorepo.
- Link internally with absolute VitePress paths such as `/guide/getting-started`.
- Update navigation-relevant pages when adding new sections.

### New page checklist

1. Create the Markdown file under the correct section.
2. Add frontmatter.
3. Link the page from the nearest section index.
4. Update `apps/docs/.vitepress/config.mts` if the page belongs in nav or sidebar.
5. Run docs lint and build.

## Deployment

The docs app is a standard VitePress static site.

### Local production check

```bash
bun run --filter=./apps/docs build
bun run --filter=./apps/docs preview
```

Build output is generated in the VitePress default output directory and can be deployed to any static hosting provider.

### Recommended release flow

1. Merge documentation changes into the target branch.
2. Add a changeset when the docs package should be versioned.
3. Validate `build` and `lint`.
4. Publish the generated static output through the repository release pipeline.

## Personalization

### Site configuration

Main site metadata, nav, sidebar, social links, edit links, and Vite aliases live in:

```text
apps/docs/.vitepress/config.mts
```

### Theme customization

Customize the VitePress theme entry and site styles here:

```text
apps/docs/.vitepress/theme/index.ts
apps/docs/.vitepress/theme/custom.css
```

### Common customizations

- Update hero content in `apps/docs/index.md`.
- Add or reorder navigation items in `.vitepress/config.mts`.
- Extend colors, layout, and component styles in `custom.css`.
- Update package links and examples when new workspace packages are added.
