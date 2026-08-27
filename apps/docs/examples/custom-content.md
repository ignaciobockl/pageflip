---
title: Custom Content Example
description: Mix rich HTML page layouts with PageFlip navigation
---

# Custom Content Example

```tsx
import { PageFlip } from '@pageflip/react';

export function MagazineBook() {
  return (
    <PageFlip width={900} height={640} size="stretch" showCover>
      <article className="page cover">
        <h1>Autumn Issue</h1>
      </article>

      <article className="page spread">
        <header>
          <h2>Feature Story</h2>
        </header>
        <img alt="Mountains at sunrise" src="/images/feature.jpg" />
        <p>Use any React-rendered HTML inside each page.</p>
      </article>

      <article className="page notes">
        <blockquote>Custom layouts, forms, images, and components all work.</blockquote>
      </article>
    </PageFlip>
  );
}
```

## Ideas

- Magazine spreads
- Product catalogs
- Story books
- Interactive training manuals
