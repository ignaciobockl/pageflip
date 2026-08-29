---
title: Migrate from react-pageflip
description: Move from the abandoned react-pageflip package to the modern PageFlip stack
---

# Migrate from react-pageflip

PageFlip is designed as a modern replacement for `react-pageflip` with TypeScript-first packages, hooks, theming, accessibility, and web components.

## Install

```bash
npm uninstall react-pageflip
npm install @pageflip/react @pageflip/theme
```

## Basic component migration

### Before

```tsx
import HTMLFlipBook from 'react-pageflip';

<HTMLFlipBook width={300} height={500}>
  <div>Page 1</div>
  <div>Page 2</div>
</HTMLFlipBook>
```

### After

```tsx
import { PageFlip } from '@pageflip/react';
import '@pageflip/theme';

<PageFlip width={300} height={500}>
  <div>Page 1</div>
  <div>Page 2</div>
</PageFlip>
```

## Prop mapping

| react-pageflip | PageFlip |
|----------------|----------|
| `HTMLFlipBook` | `PageFlip` |
| `size="fixed"` | `size="fixed"` |
| `size="stretch"` | `size="stretch"` |
| `minWidth`, `maxWidth` | `minWidth`, `maxWidth` |
| `minHeight`, `maxHeight` | `minHeight`, `maxHeight` |
| `drawShadow` | `drawShadow` |
| `flippingTime` | `flippingTime` |
| `showCover` | `showCover` |
| `mobileScrollSupport` | `mobileScrollSupport` |
| `swipeDistance` | `swipeDistance` |
| `clickEventForward` | `clickEventForward` |
| `useMouseEvents` | Built into the engine |
| `maxShadowOpacity` | `maxShadowOpacity` |

## Event migration

### Before

```tsx
<HTMLFlipBook
  onFlip={(event) => console.log(event.data)}
  onChangeOrientation={(event) => console.log(event.data)}
  onChangeState={(event) => console.log(event.data)}
/>
```

### After

```tsx
<PageFlip
  onFlip={(event) => console.log(event.pageIndex)}
  onChangeOrientation={(event) => console.log(event.orientation)}
  onChangeState={(event) => console.log(event.state)}
/>
```

## Ref and imperative API

### Before

```tsx
const bookRef = useRef(null);

bookRef.current?.pageFlip().flipNext();
```

### After

```tsx
const [instance, setInstance] = useState(null);

<PageFlip ref={setInstance} width={800} height={600} />;

await instance?.flipNext();
```

## Prefer hooks for custom readers

```tsx
const { instance, ref, loading, error } = usePageFlip({
  width: 800,
  height: 600,
});

const controls = usePageFlipControls(instance);
const state = usePageFlipState(instance);
```

This replaces most manual ref plumbing and makes external toolbars straightforward.

## New capabilities after migration

- `@pageflip/theme` components like `Toolbar` and `PageIndicator`
- `PageFlipProvider` for shared context
- SSR-safe React integration for Next.js
- Web components via `@pageflip/web-component`
- Stronger TypeScript support across events and controls

## Migration checklist

- Replace `HTMLFlipBook` imports with `PageFlip`
- Update event handlers to use typed event payloads
- Replace `pageFlip()` wrapper access with the instance ref or hooks
- Add `@pageflip/theme` if you want built-in UI and tokens
- Verify styling with CSS variables instead of ad hoc overrides
