---
title: React API
description: Complete API reference for @pageflip/react
---

# React API (`@pageflip/react`)

## PageFlip Component

Main React component for page flip books.

```tsx
import { PageFlip } from '@pageflip/react';
import '@pageflip/theme';

<PageFlip
  width={800}
  height={600}
  onFlip={(e) => console.log(e.pageIndex)}
>
  <div>Page 1</div>
  <div>Page 2</div>
</PageFlip>
```

### Props

```typescript
interface PageFlipProps<TPageData = unknown>
  extends Omit<PageFlipConfig, 'width' | 'height'> {
  width: number;
  height: number;
  children?: React.ReactNode;
  pages?: PageData<TPageData>[];
  images?: string[];
  onInit?: (instance: PageFlipInstance) => void;
  onUpdate?: (instance: PageFlipInstance) => void;
  onFlip?: (event: FlipEvent) => void;
  onChangeState?: (event: StateChangeEvent) => void;
  onChangeOrientation?: (event: OrientationChangeEvent) => void;
  onError?: (error: Error) => void;
  ref?: React.Ref<PageFlipInstance>;
  className?: string;
  style?: React.CSSProperties;
}
```

### Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `width` | `number` | Yes | - | Page width in pixels |
| `height` | `number` | Yes | - | Page height in pixels |
| `size` | `'fixed' \| 'stretch'` | No | `'fixed'` | Layout mode |
| `flippingTime` | `number` | No | `1000` | Flip duration (ms) |
| `drawShadow` | `boolean` | No | `true` | Enable shadows |
| `maxShadowOpacity` | `number` | No | `0.5` | Shadow intensity (0-1) |
| `showCover` | `boolean` | No | `false` | Show first/last as cover |
| `usePortrait` | `boolean` | No | `true` | Prefer portrait |
| `renderer` | `'auto' \| 'canvas2d' \| 'webgl'` | No | `'auto'` | Renderer selection |
| `onFlip` | `(e) => void` | No | - | Flip callback |
| `onChangeState` | `(e) => void` | No | - | State change callback |
| `onChangeOrientation` | `(e) => void` | No | - | Orientation change callback |
| `onInit` | `(instance) => void` | No | - | Initialization callback |
| `onError` | `(error) => void` | No | - | Error callback |
| `ref` | `React.Ref<PageFlipInstance>` | No | - | Forwarded ref |

---

## Hooks

### usePageFlip

Creates and manages a PageFlip instance.

```tsx
import { usePageFlip } from '@pageflip/react';

const { instance, ref, loading, error, reload } = usePageFlip({
  width: 800,
  height: 600,
  onFlip: (e) => console.log(e.pageIndex),
});

return <div ref={ref} />;
```

### Return Value

```typescript
interface UsePageFlipReturn {
  instance: PageFlipInstance | null;
  ref: React.RefObject<HTMLDivElement>;
  loading: boolean;
  error: Error | null;
  reload: (config?: Partial<PageFlipConfig>) => Promise<void>;
}
```

---

### usePageFlipControls

Navigation controls for PageFlip instance.

```tsx
import { usePageFlipControls } from '@pageflip/react';

const controls = usePageFlipControls(instance);

<button onClick={controls.next}>Next</button>
<button onClick={controls.prev}>Prev</button>
<button onClick={() => controls.goTo(5)}>Go to page 5</button>
```

### Controls Interface

```typescript
interface PageFlipControls {
  flipNext: (corner?: FlipCorner) => Promise<void>;
  flipPrev: (corner?: FlipCorner) => Promise<void>;
  flipTo: (pageIndex: number, corner?: FlipCorner) => Promise<void>;
  goTo: (pageIndex: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  getCurrentPage: () => number;
  getPageCount: () => number;
  getOrientation: () => PageOrientation;
  getState: () => FlipState;
}
```

---

### usePageFlipState

Reactive state subscription.

```tsx
import { usePageFlipState } from '@pageflip/react';

const { currentPage, pageCount, orientation, state, isFlipping, bounds } = usePageFlipState(instance);
```

### State Interface

```typescript
interface PageFlipState {
  currentPage: number;
  pageCount: number;
  orientation: PageOrientation;
  state: FlipState;
  isFlipping: boolean;
  bounds: Rect | null;
}
```

---

### usePageFlipEvents

Typed event subscriptions.

```tsx
import { usePageFlipEvents } from '@pageflip/react';

usePageFlipEvents(instance, {
  onFlip: (e) => analytics.track('page_flip', { page: e.pageIndex }),
  onChangeState: (e) => console.log('State:', e.state),
  onChangeOrientation: (e) => console.log('Orientation:', e.orientation),
  onInit: (instance) => console.log('Ready'),
  onUpdate: (instance) => console.log('Updated'),
  onError: (error) => console.error(error),
});
```

### Event Handlers

```typescript
interface PageFlipEventHandlers {
  onFlip?: (event: FlipEvent) => void;
  onChangeState?: (event: StateChangeEvent) => void;
  onChangeOrientation?: (event: OrientationChangeEvent) => void;
  onInit?: (instance: PageFlipInstance) => void;
  onUpdate?: (instance: PageFlipInstance) => void;
  onError?: (error: Error) => void;
}
```

---

## SSR Support

PageFlip is SSR-safe. Use `next/dynamic` for Next.js:

```tsx
// Next.js App Router
'use client';

import dynamic from 'next/dynamic';
import '@pageflip/theme';

const PageFlip = dynamic(() => import('@pageflip/react').then(m => m.PageFlip), {
  ssr: false,
});

export default function Book() {
  return <PageFlip width={800} height={600}><div>Page 1</div></PageFlip>;
}
```

### Why SSR-safe?

- No `window` access during render
- Dynamic import of `@pageflip/core` only on client
- `usePageFlip` returns `null` instance on server
- Hydration-safe with `isClient` state

---

## TypeScript Generics

Type your page data:

```tsx
interface MyPageData {
  id: string;
  title: string;
  content: React.ReactNode;
}

const { instance } = usePageFlip<MyPageData>({
  width: 800,
  height: 600,
  pages: [
    { id: '1', title: 'Page 1', content: <Page1 /> },
  ],
});
```
