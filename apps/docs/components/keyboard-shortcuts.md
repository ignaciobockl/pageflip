---
title: KeyboardShortcuts
description: Global keyboard navigation layer for PageFlip controls
---

# KeyboardShortcuts

`KeyboardShortcuts` registers document-level keyboard handlers for a PageFlip instance.

## Import

```tsx
import { KeyboardShortcuts } from '@pageflip/theme';
```

## Usage

```tsx
import { KeyboardShortcuts } from '@pageflip/theme';

<KeyboardShortcuts
  controls={controls}
  customKeys={{
    n: () => void controls.next(),
    p: () => void controls.prev(),
  }}
/>
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `controls` | `PageFlipControls` | No | - |
| `enabled` | `boolean` | No | `true` |
| `customKeys` | `Record<string, () => void>` | No | `{}` |
| `testId` | `string` | No | `'pageflip-keyboard-shortcuts'` |

## Default shortcuts

| Shortcut | Action |
|----------|--------|
| `ArrowRight` | Next page |
| `ArrowLeft` | Previous page |
| `Space` | Next page |
| `Shift + Space` | Previous page |
| `Home` | First page |
| `End` | Last page |

## Features

- Global navigation shortcuts
- Ignores `input`, `textarea`, and `contenteditable`
- Supports custom key mappings
- Can be toggled on and off with `enabled`

## CSS variables

None.

## Parts

None. This is a non-visual helper component.

## Accessibility

- Avoids hijacking typing inside form fields
- Enables keyboard-only navigation
- Renders an `aria-hidden` placeholder node only
