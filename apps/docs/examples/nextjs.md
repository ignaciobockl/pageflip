---
title: Next.js Example
description: Client-only setup for Next.js App Router and SSR-safe imports
---

# Next.js Example

```tsx
'use client';

import dynamic from 'next/dynamic';
import '@pageflip/theme';

const PageFlip = dynamic(
  () => import('@pageflip/react').then((module) => module.PageFlip),
  { ssr: false },
);

export default function ReaderPage() {
  return (
    <PageFlip width={800} height={600} size="stretch">
      <div>Page 1</div>
      <div>Page 2</div>
    </PageFlip>
  );
}
```

## Notes

- Keep the reader in a client component
- Use dynamic import for the rendered book component
- Theme CSS can still be imported normally
