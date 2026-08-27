---
title: Toolbar
description: Navigation toolbar with first, previous, next, last, and page indicator controls
---

# Toolbar

`Toolbar` is a ready-made navigation bar for PageFlip books.

## Import

```tsx
import { Toolbar } from '@pageflip/theme';
```

## Usage

```tsx
import { PageFlip, usePageFlipControls, usePageFlipState } from '@pageflip/react';
import { Toolbar } from '@pageflip/theme';
import { useState } from 'react';
import '@pageflip/theme';

export function BookWithToolbar() {
  const [instance, setInstance] = useState(null);
  const controls = usePageFlipControls(instance);
  const state = usePageFlipState(instance);

  return (
    <div style={{ position: 'relative', height: 600 }}>
      <PageFlip ref={setInstance} width={800} height={600} size="stretch">
        <div>Page 1</div>
        <div>Page 2</div>
        <div>Page 3</div>
      </PageFlip>

      {state.pageCount > 0 ? (
        <Toolbar
          controls={controls}
          currentPage={state.currentPage}
          pageCount={state.pageCount}
          position="bottom"
        />
      ) : null}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `controls` | `PageFlipControls` | Yes | - |
| `currentPage` | `number` | Yes | - |
| `pageCount` | `number` | Yes | - |
| `position` | `'top' \| 'bottom'` | No | `'bottom'` |
| `showPageIndicator` | `boolean` | No | `true` |
| `renderPageIndicator` | `(current: number, total: number) => React.ReactNode` | No | - |
| `className` | `string` | No | - |
| `style` | `React.CSSProperties` | No | - |
| `testId` | `string` | No | `'pageflip-toolbar'` |

## Features

- First, previous, next, and last navigation
- Built-in disabled states for bounds
- Optional default page indicator
- Custom indicator rendering via `renderPageIndicator`
- Top or bottom placement

## CSS variables

- `--pf-toolbar-height`
- `--pf-toolbar-bg`
- `--pf-toolbar-border`
- `--pf-space-md`
- `--pf-space-xs`
- `--pf-zoom-btn-size`
- `--pf-color-text`
- `--pf-radius-md`
- `--pf-transition-fast`
- `--pf-page-indicator-gap`
- `--pf-page-indicator-size`
- `--pf-page-indicator-color`
- `--pf-page-indicator-active-color`
- `--pf-text-sm`
- `--pf-text-xs`
- `--pf-color-text-muted`
- `--pf-z-dropdown`

## Parts

None. Style it with `className`, `style`, and theme tokens.

## Accessibility

- Uses `role="toolbar"`
- Includes labels for first, previous, next, and last actions
- Marks disabled controls with `disabled` and `aria-disabled`
- Marks the current page dot with `aria-current="page"`

## Related

- [PageIndicator](/components/page-indicator)
- [PageFlipProvider](/components/pageflip-provider)
