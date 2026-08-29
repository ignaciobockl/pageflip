---
title: ZoomControls
description: Zoom in, zoom out, and reset controls with optional level display
---

# ZoomControls

`ZoomControls` is a UI helper for external zoom state.

## Import

```tsx
import { ZoomControls } from '@pageflip/theme';
```

## Usage

```tsx
import { ZoomControls } from '@pageflip/theme';
import { useState } from 'react';

export function ReaderZoom() {
  const [zoom, setZoom] = useState(1);

  return (
    <ZoomControls
      level={zoom}
      minZoom={0.5}
      maxZoom={2}
      step={0.25}
      onZoomIn={() => setZoom((value) => Math.min(value + 0.25, 2))}
      onZoomOut={() => setZoom((value) => Math.max(value - 0.25, 0.5))}
      onReset={() => setZoom(1)}
    />
  );
}
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `level` | `number` | Yes | - |
| `onZoomIn` | `() => void` | Yes | - |
| `onZoomOut` | `() => void` | Yes | - |
| `onReset` | `() => void` | Yes | - |
| `minZoom` | `number` | No | `0.25` |
| `maxZoom` | `number` | No | `5` |
| `step` | `number` | No | `0.25` |
| `showLevel` | `boolean` | No | `true` |
| `className` | `string` | No | - |
| `style` | `React.CSSProperties` | No | - |
| `testId` | `string` | No | `'pageflip-zoom-controls'` |

## Features

- Zoom in and zoom out actions
- Reset to `100%`
- Optional percentage display
- Disabled state at configured min and max bounds

## CSS variables

- `--pf-space-xs`
- `--pf-space-sm`
- `--pf-color-bg`
- `--pf-color-border`
- `--pf-color-text`
- `--pf-radius-md`
- `--pf-radius-sm`
- `--pf-zoom-btn-size`
- `--pf-transition-fast`
- `--pf-text-sm`
- `--pf-font-mono`

## Parts

None.

## Accessibility

- Root control is labeled with `aria-label="Zoom controls"`
- Buttons expose `Zoom out`, `Zoom in`, and `Reset zoom`
- Level text uses `aria-live="polite"`
- Disabled buttons set `disabled` and `aria-disabled`
