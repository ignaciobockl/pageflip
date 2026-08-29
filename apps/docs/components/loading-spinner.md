---
title: LoadingSpinner
description: Small accessible loading indicator for PageFlip UIs
---

# LoadingSpinner

`LoadingSpinner` is a lightweight animated loading indicator.

## Import

```tsx
import { LoadingSpinner } from '@pageflip/theme';
```

## Usage

```tsx
import { LoadingSpinner } from '@pageflip/theme';

<LoadingSpinner size="md" color="var(--pf-color-primary)" />
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` |
| `color` | `string` | No | `var(--pf-color-primary)` |
| `className` | `string` | No | - |
| `style` | `React.CSSProperties` | No | - |
| `testId` | `string` | No | `'pageflip-loading-spinner'` |

## Features

- Three size presets
- Customizable accent color
- Inline usage for loading states and placeholders
- Includes built-in keyframes

## Size presets

| Size | Width / Height | Border |
|------|----------------|--------|
| `sm` | `16px` | `2px` |
| `md` | `24px` | `3px` |
| `lg` | `32px` | `4px` |

## CSS variables

- `--pf-color-primary`
- `--pf-color-border`

## Parts

None.

## Accessibility

- Uses `aria-label="Loading"`
- Announces status with `aria-live="polite"`
- Exposes `aria-busy="true"`
- Includes hidden `Loading...` text for assistive tech
