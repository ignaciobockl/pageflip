---
title: FullscreenToggle
description: Button for entering and exiting fullscreen mode
---

# FullscreenToggle

`FullscreenToggle` renders a button when the Fullscreen API is available.

## Import

```tsx
import { FullscreenToggle } from '@pageflip/theme';
```

## Usage

```tsx
import { FullscreenToggle } from '@pageflip/theme';
import { useState } from 'react';

export function ReaderFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <FullscreenToggle
      isFullscreen={isFullscreen}
      onToggle={() => setIsFullscreen((value) => !value)}
    />
  );
}
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `isFullscreen` | `boolean` | Yes | - |
| `onToggle` | `() => void` | Yes | - |
| `target` | `HTMLElement \| null` | No | `document.documentElement` |
| `className` | `string` | No | - |
| `style` | `React.CSSProperties` | No | - |
| `testId` | `string` | No | `'pageflip-fullscreen-toggle'` |

## Features

- Enter and exit icon states
- Automatic capability detection
- Returns `null` when fullscreen is unsupported
- Works with any controlled fullscreen state

## CSS variables

- `--pf-fullscreen-btn-size`
- `--pf-color-text`
- `--pf-radius-md`
- `--pf-transition-fast`

## Parts

None.

## Accessibility

- Uses descriptive labels for enter and exit states
- Exposes `aria-pressed` to reflect active fullscreen mode
- Hides itself automatically on unsupported browsers
