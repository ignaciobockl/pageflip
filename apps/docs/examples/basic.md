---
title: Basic Example
description: Smallest React setup for rendering a PageFlip book
---

# Basic Example

```tsx
import { PageFlip } from '@pageflip/react';
import '@pageflip/theme';

export function BasicBook() {
  return (
    <PageFlip width={800} height={600} size="stretch" showCover>
      <div className="page">Cover</div>
      <div className="page">Chapter 1</div>
      <div className="page">Chapter 2</div>
      <div className="page">Back cover</div>
    </PageFlip>
  );
}
```

## Highlights

- Uses declarative React children
- Works with fixed or stretch layouts
- Theme tokens come from `@pageflip/theme`
