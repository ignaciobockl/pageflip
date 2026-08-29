---
title: Getting Started
description: Learn how to install and use PageFlip in your project
---

# Getting Started

## Prerequisites

- Node.js 18.18+ (LTS)
- Package manager: **bun** (recommended), npm, or pnpm
- React 18.2+ (for React wrapper)

## Installation

### React Projects

```bash
# Using bun (recommended)
bun add @pageflip/react @pageflip/theme

# Using npm
npm install @pageflip/react @pageflip/theme

# Using pnpm
pnpm add @pageflip/react @pageflip/theme
```

### Vanilla JS / Other Frameworks

```bash
bun add @pageflip/core @pageflip/theme
```

### Web Components

```bash
bun add @pageflip/web-component @pageflip/theme
```

## Quick Start

### React

```tsx
import { PageFlip } from '@pageflip/react';
import '@pageflip/theme';

function Book() {
  return (
    <PageFlip width={800} height={600} onFlip={(e) => console.log(e.pageIndex)}>
      <div className="page">Page 1 Content</div>
      <div className="page">Page 2 Content</div>
      <div className="page">Page 3 Content</div>
    </PageFlip>
  );
}
```

### Vanilla JS

```typescript
import { PageFlip } from '@pageflip/core';
import '@pageflip/theme';

const book = new PageFlip(document.getElementById('book')!, {
  width: 800,
  height: 600,
  size: 'stretch',
});

book.loadFromHtml([
  document.getElementById('page-1')!,
  document.getElementById('page-2')!,
]);

book.on('flip', (e) => console.log(`Flipped to page ${e.pageIndex}`));
```

### Web Components (HTML)

```html
<script type="module">
  import '@pageflip/web-component';
  import '@pageflip/theme';
</script>

<page-flip-book width="800" height="600" size="stretch">
  <div slot="pages">
    <div slot="page-0">Page 1</div>
    <div slot="page-1">Page 2</div>
  </div>
</page-flip-book>
```

## Next Steps

- [Installation Guide](/guide/installation) - Detailed installation for each framework
- [Quick Start](/guide/quick-start) - Build your first flip book in 5 minutes
- [Core Concepts](/guide/core-concepts) - Understand the architecture
