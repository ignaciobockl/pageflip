---
title: Web Components API
description: Complete API reference for @pageflip/web-component
---

# Web Components API (`@pageflip/web-component`)

## Installation

```bash
bun add @pageflip/web-component @pageflip/theme
```

```html
<script type="module">
  import '@pageflip/web-component';
  import '@pageflip/theme';
</script>
```

---

## page-flip-book

Main custom element for page flip book.

```html
<page-flip-book
  width="800"
  height="600"
  size="stretch"
  flipping-time="1000"
  draw-shadow
  show-cover
  theme="auto"
  aria-label="My flip book">

  <!-- Pages -->
  <div slot="pages">
    <div slot="page-0">Page 1</div>
    <div slot="page-1">Page 2</div>
  </div>

  <!-- Toolbar -->
  <page-flip-toolbar slot="toolbar" position="bottom"></page-flip-toolbar>

  <!-- Page corners -->
  <page-flip-corner corner="top-left" slot="page-corner-top-left"></page-flip-corner>
  <page-flip-corner corner="top-right" slot="page-corner-top-right"></page-flip-corner>
  <page-flip-corner corner="bottom-left" slot="page-corner-bottom-left"></page-flip-corner>
  <page-flip-corner corner="bottom-right" slot="page-corner-bottom-right"></page-flip-corner>
</page-flip-book>
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | `800` | Page width |
| `height` | `number` | `600` | Page height |
| `size` | `'fixed' \| 'stretch'` | `'stretch'` | Layout mode |
| `flipping-time` | `number` | `1000` | Flip duration (ms) |
| `draw-shadow` | `boolean` | `true` | Enable shadows |
| `max-shadow-opacity` | `number` | `0.5` | Shadow opacity (0-1) |
| `show-cover` | `boolean` | `false` | Show cover pages |
| `use-portrait` | `boolean` | `true` | Prefer portrait |
| `mobile-scroll-support` | `boolean` | `true` | Mobile scroll |
| `swipe-distance` | `number` | `30` | Swipe threshold (px) |
| `click-event-forward` | `boolean` | `true` | Forward clicks |
| `disable-flip-by-click` | `boolean` | `false` | Disable click flip |
| `show-page-corners` | `boolean` | `true` | Show corners |
| `renderer` | `'auto' \| 'canvas2d' \| 'webgl'` | `'auto'` | Renderer |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme |
| `aria-label` | `string` | - | Book label |
| `aria-label-prev` | `string` | `'Previous page'` | Prev button label |
| `aria-label-next` | `string` | `'Next page'` | Next button label |

### Properties (JavaScript)

```javascript
const book = document.querySelector('page-flip-book');

book.width = 800;
book.height = 600;
book.size = 'stretch';
book.flippingTime = 1000;
book.drawShadow = true;
book.theme = 'dark';
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `flipNext(corner?)` | `Promise<void>` | Animate to next page |
| `flipPrev(corner?)` | `Promise<void>` | Animate to previous page |
| `flip(pageIndex, corner?)` | `Promise<void>` | Animate to specific page |
| `turnToPage(pageIndex)` | `Promise<void>` | Jump to page (no animation) |
| `turnToNextPage()` | `Promise<void>` | Jump to next page |
| `turnToPrevPage()` | `Promise<void>` | Jump to previous page |
| `loadFromHtml(elements)` | `Promise<void>` | Load from HTML elements |
| `loadFromImages(urls)` | `Promise<void>` | Load from image URLs |
| `loadFromSources(sources)` | `Promise<void>` | Load from mixed sources |
| `updateFromHtml(elements)` | `Promise<void>` | Update from HTML |
| `updateFromImages(urls)` | `Promise<void>` | Update from images |
| `setRenderer(id)` | `Promise<void>` | Switch renderer |
| `destroy()` | `void` | Cleanup |
| `updateConfig(config)` | `void` | Update config |

### Getters

```javascript
book.pageCount;        // number
book.currentPageIndex; // number
book.orientation;      // 'portrait' | 'landscape'
book.state;            // 'idle' | 'user_fold' | 'fold_corner' | 'flipping' | 'read'
book.bounds;           // DOMRect | null
```

### Events

All events bubble and are composed (cross Shadow DOM):

```javascript
book.addEventListener('flip', (e) => console.log(e.detail.pageIndex));
book.addEventListener('statechange', (e) => console.log(e.detail.state));
book.addEventListener('orientationchange', (e) => console.log(e.detail.orientation));
book.addEventListener('update', (e) => console.log(e.detail));
book.addEventListener('init', (e) => console.log('Initialized'));
book.addEventListener('error', (e) => console.error(e.detail));
```

| Event | Detail | Description |
|-------|--------|-------------|
| `flip` | `{ pageIndex, direction, corner }` | Page flipped |
| `statechange` | `{ state, previousState }` | State changed |
| `orientationchange` | `{ orientation, previousOrientation }` | Orientation changed |
| `update` | `PageFlipInstance` | Pages/layout updated |
| `init` | `PageFlipInstance` | Initialization complete |
| `error` | `Error` | Error occurred |

---

## page-flip-toolbar

Toolbar with navigation controls.

```html
<page-flip-toolbar
  position="bottom"
  slot="toolbar">

  <page-flip-prev-btn></page-flip-prev-btn>
  <page-flip-page-indicator></page-flip-page-indicator>
  <page-flip-next-btn></page-flip-next-btn>

</page-flip-toolbar>
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `position` | `'top' \| 'bottom'` | `'bottom'` | Toolbar position |
| `slot` | `'toolbar'` | Required | Slot name |

### CSS Parts

```css
page-flip-toolbar::part(start) { }
page-flip-toolbar::part(prev-btn) { }
page-flip-toolbar::part(next-btn) { }
page-flip-toolbar::part(center) { }
page-flip-toolbar::part(page-text) { }
page-flip-toolbar::part(dots) { }
page-flip-toolbar::part(end) { }
```

---

## page-flip-page-indicator

Standalone page indicator.

```html
<page-flip-page-indicator
  current="0"
  total="10"
  max-dots="10"
  show-numbers="false"
  slot="page-indicator">
</page-flip-page-indicator>
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `current` | `number` | `0` | Current page (0-based) |
| `total` | `number` | `1` | Total pages |
| `max-dots` | `number` | `10` | Max dots before ellipsis |
| `show-numbers` | `boolean` | `false` | Use select dropdown |

### Modes

**Dots mode** (default): Clickable dots with ellipsis
**Numbers mode** (`show-numbers`): Select dropdown

### CSS Parts

```css
page-flip-page-indicator::part(indicator) { }
page-flip-page-indicator::part(dots) { }
page-flip-page-indicator::part(select) { }
```

---

## page-flip-corner

Draggable corner for page flip.

```html
<page-flip-corner
  corner="top-right"
  slot="page-corner-top-right"
  visible="true">
</page-flip-corner>
```

### Attributes

| Attribute | Type | Values | Description |
|-----------|------|--------|-------------|
| `corner` | `string` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | Corner position |
| `visible` | `boolean` | `true` | Visibility |

### Events

```javascript
corner.addEventListener('dragStart', (e) => console.log(e.detail.corner, e.detail.point));
corner.addEventListener('dragMove', (e) => console.log(e.detail.point));
corner.addEventListener('dragEnd', (e) => console.log(e.detail.corner));
```

---

## page-flip-loading-spinner

```html
<page-flip-loading-spinner
  size="md"
  color="var(--pf-color-primary)">
</page-flip-loading-spinner>
```

### Attributes

| Attribute | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `size` | `string` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `color` | `string` | CSS color | `var(--pf-color-primary)` | Spinner color |

### Size Variants

| Size | Dimensions | Border |
|------|------------|--------|
| `sm` | 16px | 2px |
| `md` | 24px | 3px |
| `lg` | 32px | 4px |

---

## JavaScript Usage

```javascript
import '@pageflip/web-component';
import '@pageflip/theme';

// Programmatic usage
const book = document.querySelector('page-flip-book');

// Navigation
await book.flipNext();
await book.flipPrev();
await book.flip(5);
await book.turnToPage(3);

// Content
await book.loadFromHtml([...elements]);
await book.loadFromImages([...urls]);
await book.loadFromSources([...sources]);

// Config
book.updateConfig({ drawShadow: false, flippingTime: 500 });

// Renderer
await book.setRenderer('webgl');

// Cleanup
book.destroy();
```

---

## Framework Integration

### React

```tsx
import '@pageflip/web-component';
import '@pageflip/theme';

function Book() {
  return (
    <page-flip-book width={800} height={600}>
      <div slot="pages">
        <div slot="page-0">Page 1</div>
        <div slot="page-1">Page 2</div>
      </div>
    </page-flip-book>
  );
}
```

### Vue

```vue
<script setup>
import '@pageflip/web-component';
import '@pageflip/theme';
</script>

<template>
  <page-flip-book width="800" height="600">
    <div slot="pages">
      <div slot="page-0">Page 1</div>
      <div slot="page-1">Page 2</div>
    </div>
  </page-flip-book>
</template>
```

### Svelte

```svelte
<script>
  import '@pageflip/web-component';
  import '@pageflip/theme';
</script>

<page-flip-book width={800} height={600}>
  <div slot="pages">
    <div slot="page-0">Page 1</div>
    <div slot="page-1">Page 2</div>
  </div>
</page-flip-book>
```

### Angular

```typescript
// Import in main.ts or component
import '@pageflip/web-component';
import '@pageflip/theme';

// Add CUSTOM_ELEMENTS_SCHEMA to module
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

---

## SSR / Static Generation

All components are SSR-friendly:

- Declarative Shadow DOM support
- No hydration mismatch
- Works with Next.js, Astro, Nuxt, etc.

```html
<!-- Astro -->
<script type="module">
  import '@pageflip/web-component';
  import '@pageflip/theme';
</script>

<page-flip-book width="800" height="600">
  <div slot="pages">
    <div slot="page-0">Page 1</div>
  </div>
</page-flip-book>
```
