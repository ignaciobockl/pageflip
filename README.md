[![npm version](https://img.shields.io/npm/v/%40pageflip%2Freact?label=npm)](https://www.npmjs.com/package/@pageflip/react)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/ignaciobockl/pageflip/ci.yml?branch=main&label=CI)](https://github.com/ignaciobockl/pageflip/actions)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-ready-5B21B6)](https://www.w3.org/WAI/standards-guidelines/wcag/)

# PageFlip

PageFlip is a modern page-turning library for building flip books, catalogs, magazines, comics, and document viewers with a polished reading experience.

It ships as a small ecosystem of packages: a renderer-agnostic core, a React wrapper, Web Components, and an optional theme layer for production-ready UI.

- Framework-friendly: React, Web Components, or low-level engine usage
- TypeScript-first API surface
- SSR-safe React integration
- Accessible controls with keyboard-friendly interaction patterns
- Built for modern docs, product catalogs, readers, and digital publications

## Packages

| Package | Install when you need | Install |
| --- | --- | --- |
| `@pageflip/react` | A React app with the easiest integration path | `npm install @pageflip/react` |
| `@pageflip/web-component` | Framework-agnostic custom elements for any frontend stack | `npm install @pageflip/web-component` |
| `@pageflip/core` | Low-level engine access, custom integrations, or advanced control | `npm install @pageflip/core` |
| `@pageflip/theme` | Optional UI components, tokens, and styling primitives | `npm install @pageflip/theme` |
| `@pageflip/renderers` | Renderer-focused or advanced rendering integrations | `npm install @pageflip/renderers` |

## Quick Start

### React in 30 seconds

Install:

```bash
npm install @pageflip/react @pageflip/theme
```

Peer dependencies:

```bash
npm install react react-dom
```

Use:

```tsx
import { PageFlip } from "@pageflip/react";
import "@pageflip/theme/tokens.css";

export function App() {
  return (
    <PageFlip width={800} height={600} aria-label="Product catalog">
      <div>Cover</div>
      <div>Page 1</div>
      <div>Page 2</div>
      <div>Back cover</div>
    </PageFlip>
  );
}
```

Requirements:

- `react >= 18.2.0`
- `react-dom >= 18.2.0`
- Node.js `18.18+`

### Web Components in 30 seconds

Install:

```bash
npm install @pageflip/web-component @pageflip/theme
```

Use:

```html
<script type="module">
  import "@pageflip/web-component";
  import "@pageflip/theme/tokens.css";
</script>

<page-flip-book width="800" height="600" aria-label="Magazine preview">
  <div slot="pages">
    <article>Cover</article>
    <article>Article 1</article>
    <article>Article 2</article>
    <article>Back cover</article>
  </div>
</page-flip-book>
```

## Features

- 📖 Realistic page-turning interaction for books, magazines, and catalogs
- ⚛️ React 18+ wrapper with SSR-safe integration patterns
- 🧩 Web Components for framework-agnostic adoption
- 🎨 Optional theme package with tokens and ready-made UI primitives
- ♿ Accessibility-minded controls, keyboard interaction, and semantic markup support
- 🧠 TypeScript-first public APIs across the ecosystem
- 📱 Responsive layout and orientation-aware behavior
- 🔌 Extensible architecture for custom renderers and advanced integrations

## Documentation

- [Homepage](https://pageflip.dev)
- [Getting Started](https://pageflip.dev/guide/getting-started)
- [Installation](https://pageflip.dev/guide/installation)
- [Core API](https://pageflip.dev/api/core)
- [React API](https://pageflip.dev/api/react)
- [Web Components API](https://pageflip.dev/api/web-components)
- [Theme API](https://pageflip.dev/api/theme)
- [Examples](https://pageflip.dev/examples/)
- [Migration Guide](https://pageflip.dev/migration/from-react-pageflip)

## Compatibility

| Target | Support |
| --- | --- |
| Node.js | `18.18+` |
| React | `18.2+` |
| TypeScript | Included type definitions |
| Bundlers | npm, pnpm, Yarn, Bun, Vite, Next.js |
| Browsers | Modern evergreen browsers with Custom Elements and ES Modules support |
| SSR | Supported through `@pageflip/react` integration patterns |

## Package Manager

Works with npm, pnpm, yarn, bun. Recommended: bun `bun install` (fastest).
npm: `npm install` / pnpm: `pnpm install` / yarn: `yarn install`

## Contributing

- [Contributing Guide](./CONTRIBUTING.md)
- [Open an Issue](https://github.com/ignaciobockl/pageflip/issues)
- [Pull Requests](https://github.com/ignaciobockl/pageflip/pulls)
- [Repository](https://github.com/ignaciobockl/pageflip)

## License

MIT © Ignacio Bockl. See [LICENSE](./LICENSE).
