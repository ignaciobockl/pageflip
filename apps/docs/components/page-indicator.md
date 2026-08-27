---
title: PageIndicator
description: Standalone page indicator with dot and select modes
---

# PageIndicator

`PageIndicator` provides standalone page navigation outside the main toolbar.

## Import

```tsx
import { PageIndicator } from '@pageflip/theme';
```

## Usage

```tsx
import { PageIndicator } from '@pageflip/theme';

<PageIndicator
  current={4}
  total={20}
  maxDots={7}
  onPageClick={(pageIndex) => void controls.goTo(pageIndex)}
/>
```

## Numbers mode

```tsx
<PageIndicator
  current={4}
  total={20}
  showNumbers
  onPageClick={(pageIndex) => void controls.goTo(pageIndex)}
/>
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `current` | `number` | Yes | - |
| `total` | `number` | Yes | - |
| `onPageClick` | `(pageIndex: number) => void` | Yes | - |
| `maxDots` | `number` | No | `10` |
| `showNumbers` | `boolean` | No | `false` |
| `className` | `string` | No | - |
| `style` | `React.CSSProperties` | No | - |
| `testId` | `string` | No | `'pageflip-page-indicator'` |

## Features

- Dot navigation for compact readers
- Select dropdown mode for large documents
- Ellipsis when the visible range is truncated
- First and last page shortcuts when needed

## CSS variables

- `--pf-page-indicator-gap`
- `--pf-page-indicator-size`
- `--pf-radius-full`
- `--pf-radius-md`
- `--pf-color-border`
- `--pf-color-bg`
- `--pf-color-text`
- `--pf-color-text-muted`
- `--pf-page-indicator-color`
- `--pf-page-indicator-active-color`
- `--pf-transition-fast`
- `--pf-space-xs`
- `--pf-space-sm`
- `--pf-text-sm`
- `--pf-text-xs`

## Parts

None. Style it with `className`, `style`, and CSS variables.

## Accessibility

- Uses `nav` semantics
- Announces current position with `aria-label`
- Marks the active page with `aria-current="page"`
- Uses `aria-label="Select page"` in numbers mode
