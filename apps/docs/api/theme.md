---
title: Theme API
description: Complete API reference for @pageflip/theme
---

# Theme API (`@pageflip/theme`)

## Design Tokens (CSS Variables)

Import the CSS file to enable all design tokens:

```typescript
import '@pageflip/theme';
// or
import '@pageflip/theme/tokens.css';
```

### Color System

```css
:root {
  /* Base */
  --pf-color-bg: #ffffff;
  --pf-color-bg-secondary: #f8f9fa;
  --pf-color-bg-tertiary: #e9ecef;

  /* Text */
  --pf-color-text: #1a1a2e;
  --pf-color-text-secondary: #495057;
  --pf-color-text-muted: #6c757d;
  --pf-color-text-inverse: #ffffff;

  /* Primary */
  --pf-color-primary: #3b82f6;
  --pf-color-primary-hover: #2563eb;
  --pf-color-primary-light: #dbeafe;

  /* Border */
  --pf-color-border: #e2e8f0;
  --pf-color-border-strong: #cbd5e1;

  /* Shadows */
  --pf-color-shadow: rgba(0, 0, 0, 0.15);
  --pf-color-shadow-strong: rgba(0, 0, 0, 0.25);

  /* Semantic */
  --pf-color-success: #22c55e;
  --pf-color-warning: #f59e0b;
  --pf-color-error: #ef4444;
}

[data-theme="dark"] {
  --pf-color-bg: #0f0f1a;
  --pf-color-bg-secondary: #1a1a2e;
  --pf-color-text: #f1f5f9;
  --pf-color-text-muted: #94a3b8;
  --pf-color-primary: #60a5fa;
  /* ... more dark values */
}
```

### Spacing

```css
--pf-space-xs: 0.25rem;   /* 4px */
--pf-space-sm: 0.5rem;    /* 8px */
--pf-space-md: 1rem;      /* 16px */
--pf-space-lg: 1.5rem;    /* 24px */
--pf-space-xl: 2rem;      /* 32px */
```

### Border Radius

```css
--pf-radius-sm: 0.25rem;   /* 4px */
--pf-radius-md: 0.5rem;    /* 8px */
--pf-radius-lg: 1rem;      /* 16px */
--pf-radius-full: 9999px;
```

### Shadows

```css
--pf-shadow-sm: 0 1px 2px var(--pf-color-shadow);
--pf-shadow-md: 0 4px 6px var(--pf-color-shadow);
--pf-shadow-lg: 0 10px 15px var(--pf-color-shadow);
--pf-shadow-flip: 0 20px 40px var(--pf-color-shadow-strong);
--pf-shadow-focus: 0 0 0 3px var(--pf-color-shadow-focus);
```

### Transitions

```css
--pf-transition-fast: 100ms ease;
--pf-transition-base: 200ms ease;
--pf-transition-slow: 300ms ease;
--pf-transition-flip: 1000ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Z-Index

```css
--pf-z-dropdown: 100;
--pf-z-modal: 400;
--pf-z-tooltip: 600;
--pf-z-page-flip: 1000;
```

### Page Flip Specific

```css
--pf-page-corner-size: 48px;
--pf-page-corner-color: var(--pf-color-primary);
--pf-toolbar-height: 56px;
--pf-page-indicator-gap: 8px;
--pf-page-indicator-size: 8px;
```

### Dark Mode

Automatic via `prefers-color-scheme` or manual via `[data-theme="dark"]`:

```css
@media (prefers-color-scheme: dark) {
  :root { /* dark values */ }
}

/* Or manual */
[data-theme="dark"] { /* dark values */ }
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --pf-transition-fast: 0ms;
    --pf-transition-base: 0ms;
    --pf-transition-flip: 0ms;
  }
}
```

### High Contrast

```css
@media (prefers-contrast: high) {
  :root {
    --pf-color-border: var(--pf-color-text);
  }
}
```

---

## Tailwind v4 Preset

```typescript
// tailwind.config.ts
import pageflipPreset from '@pageflip/theme/tailwind.config';

export default {
  presets: [pageflipPreset],
  // ...
};
```

### Available Utilities

```html
<!-- Colors -->
<div class="bg-pf-bg text-pf-text border-pf-border">
<div class="bg-pf-primary hover:bg-pf-primary-hover">
<div class="text-pf-text-muted">

<!-- Spacing -->
<div class="p-pf-md gap-pf-lg">

<!-- Radius -->
<div class="rounded-pf-md rounded-pf-lg">

<!-- Shadows -->
<div class="shadow-pf-md shadow-pf-flip shadow-pf-focus">

<!-- Transitions -->
<div class="transition-pf-base transition-pf-flip">

<!-- Z-Index -->
<div class="z-pf-dropdown z-pf-modal z-pf-toast">
```

### Dark Mode Strategy

```javascript
// tailwind.config.ts
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  // ...
};
```

Use `<html data-theme="dark">` or `<body data-theme="dark">` for manual toggle.

---

## Components

### Toolbar

```tsx
import { Toolbar } from '@pageflip/theme';

<Toolbar
  position="bottom"
  controls={controls}
  currentPage={state.currentPage}
  pageCount={state.pageCount}
/>
```

### PageIndicator

```tsx
import { PageIndicator } from '@pageflip/theme';

<PageIndicator
  current={currentPage}
  total={pageCount}
  onPageClick={goTo}
  maxDots={10}
  showNumbers={false}
/>
```

### ZoomControls

```tsx
import { ZoomControls } from '@pageflip/theme';

<ZoomControls
  level={1.5}
  minZoom={0.25}
  maxZoom={5}
  step={0.25}
  onZoomIn={zoomIn}
  onZoomOut={zoomOut}
  onReset={resetZoom}
/>
```

### FullscreenToggle

```tsx
import { FullscreenToggle } from '@pageflip/theme';

<FullscreenToggle
  isFullscreen={false}
  onToggle={toggleFullscreen}
/>
```

### PageCorner

```tsx
import { PageCorner } from '@pageflip/theme';

<PageCorner
  corner="top-right"
  onDragStart={handleDragStart}
  onDragMove={handleDragMove}
  onDragEnd={handleDragEnd}
/>
```

### LoadingSpinner

```tsx
import { LoadingSpinner } from '@pageflip/theme';

<LoadingSpinner size="lg" color="var(--pf-color-primary)" />
```

### KeyboardShortcuts

```tsx
import { KeyboardShortcuts } from '@pageflip/theme';

<KeyboardShortcuts
  enabled={true}
  controls={controls}
  customKeys={{
    'n': () => controls.next(),
    'p': () => controls.prev(),
  }}
/>
```

### PageFlipProvider

```tsx
import { PageFlipProvider, usePageFlipControls } from '@pageflip/theme';

<PageFlipProvider instance={instance}>
  <MyComponent />
</PageFlipProvider>

// In nested component
const controls = usePageFlipControls();
```
