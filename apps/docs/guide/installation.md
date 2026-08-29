---
title: Installation
description: Detailed installation instructions for each framework
---

# Installation

## React Projects

### Bun (Recommended)

```bash
bun add @pageflip/react @pageflip/theme
```

### npm

```bash
npm install @pageflip/react @pageflip/theme
```

### pnpm

```bash
pnpm add @pageflip/react @pageflip/theme
```

### Yarn

```bash
yarn add @pageflip/react @pageflip/theme
```

### Peer Dependencies

Ensure you have React 18.2+ installed:

```bash
bun add react@18 react-dom@18
```

### TypeScript

PageFlip includes TypeScript definitions. Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

## Vanilla JavaScript

### Core Engine Only

```bash
bun add @pageflip/core @pageflip/theme
```

### With Theme (Recommended)

```bash
bun add @pageflip/core @pageflip/theme
```

The theme package provides CSS variables and optional Tailwind v4 preset.

## Web Components

### Standalone

```bash
bun add @pageflip/web-component @pageflip/theme
```

### With Framework

Works with any framework or vanilla HTML:

```html
<!-- HTML -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@pageflip/web-component"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pageflip/theme">

<page-flip-book width="800" height="600">
  <div slot="pages">
    <div slot="page-0">Page 1</div>
    <div slot="page-1">Page 2</div>
  </div>
</page-flip-book>
```

## Next.js (App Router)

```bash
bun add @pageflip/react @pageflip/theme
```

```tsx
// app/book/page.tsx
'use client';

import dynamic from 'next/dynamic';
import '@pageflip/theme';

const PageFlip = dynamic(() => import('@pageflip/react').then(m => m.PageFlip), {
  ssr: false,
});

export default function BookPage() {
  return (
    <PageFlip width={800} height={600}>
      <div>Page 1</div>
      <div>Page 2</div>
    </PageFlip>
  );
}
```

## Vite

```bash
bun add @pageflip/react @pageflip/theme
# or
bun add @pageflip/core @pageflip/theme
```

```tsx
// main.tsx
import '@pageflip/theme';
```

## CDN (No Build)

```html
<!-- Development -->
<script type="module">
  import '@pageflip/web-component';
  import '@pageflip/theme';
</script>

<!-- Or with specific version -->
<script type="module">
  import '@pageflip/web-component@1.0.0';
  import '@pageflip/theme@1.0.0';
</script>
```

## Versioning

PageFlip uses [Semantic Versioning](https://semver.org/):

| Version | Meaning |
|---------|---------|
| `1.x.x` | Stable, production-ready |
| `0.x.x` | Pre-release, breaking changes possible |

Always pin to major version in production:

```json
"@pageflip/react": "^1.0.0"
```

## Verifying Installation

```tsx
import { PageFlip } from '@pageflip/react';
import '@pageflip/theme';

// Check if types are resolved
const book = <PageFlip width={800} height={600} />;
// TypeScript should autocomplete props
```

If TypeScript complains about missing types, ensure:
1. `"moduleResolution": "bundler"` in tsconfig.json
2. `@pageflip/*` packages are in `node_modules`
3. Restart TypeScript server in your editor
