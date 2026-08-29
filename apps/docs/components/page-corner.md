---
title: PageCorner
description: Draggable corner handle for manual page turn interactions
---

# PageCorner

`PageCorner` is a visual and interactive drag handle for page turning.

## Import

```tsx
import { PageCorner } from '@pageflip/theme';
```

## Usage

```tsx
import { PageCorner } from '@pageflip/theme';

<PageCorner
  corner="top-right"
  onDragStart={(corner, point) => console.log('start', corner, point)}
  onDragMove={(point) => console.log('move', point)}
  onDragEnd={(corner) => console.log('end', corner)}
/>
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `corner` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | Yes | - |
| `visible` | `boolean` | No | `true` |
| `onDragStart` | `(corner: 'top' \| 'bottom', point: { x: number; y: number }) => void` | No | - |
| `onDragMove` | `(point: { x: number; y: number }) => void` | No | - |
| `onDragEnd` | `(corner: 'top' \| 'bottom') => void` | No | - |
| `className` | `string` | No | - |
| `style` | `React.CSSProperties` | No | - |
| `testId` | `string` | No | `` `pageflip-corner-${corner}` `` |

## Features

- Supports mouse and touch dragging
- Exposes normalized corner events
- Can be hidden completely with `visible={false}`
- Applies a dragging visual state while active

## CSS variables

- `--pf-page-corner-size`
- `--pf-radius-full`
- `--pf-page-corner-bg`
- `--pf-page-corner-border`
- `--pf-page-corner-shadow`
- `--pf-page-corner-color`
- `--pf-transition-fast`

## Parts

None.

## Accessibility

- Provides an `aria-label` that describes drag direction
- Exposes `aria-grabbed` while dragging
- Uses `touch-action: none` to make drag interactions predictable
