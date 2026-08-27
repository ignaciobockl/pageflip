---
title: Core API
description: Complete API reference for @pageflip/core
---

# Core API (`@pageflip/core`)

## PageFlip Class

Main entry point for the page flip engine.

```typescript
import { PageFlip } from '@pageflip/core';

const book = new PageFlip(container, config);
```

### Constructor

```typescript
new PageFlip(container: HTMLElement, config: PageFlipConfig): PageFlipInstance
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `container` | `HTMLElement` | Yes | Container element for the flip book |
| `config` | `PageFlipConfig` | Yes | Configuration options |

### Configuration (`PageFlipConfig`)

```typescript
interface PageFlipConfig {
  // Dimensions
  width: number;
  height: number;
  size?: 'fixed' | 'stretch';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // Flip behavior
  flippingTime?: number;           // ms, default: 1000
  drawShadow?: boolean;            // default: true
  maxShadowOpacity?: number;       // 0-1, default: 0.5
  showCover?: boolean;             // default: false
  usePortrait?: boolean;           // default: true
  mobileScrollSupport?: boolean;   // default: true
  swipeDistance?: number;          // px, default: 30
  clickEventForward?: boolean;     // default: true
  disableFlipByClick?: boolean;    // default: false
  showPageCorners?: boolean;       // default: true

  // Renderer
  renderer?: 'auto' | 'canvas2d' | 'webgl';
  rendererOptions?: RendererOptions;

  // Accessibility
  ariaLabel?: string;
  ariaLabelPrev?: string;
  ariaLabelNext?: string;
}
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
| `updateFromHtml(elements)` | `Promise<void>` | Update from HTML elements |
| `updateFromImages(urls)` | `Promise<void>` | Update from image URLs |
| `setRenderer(id)` | `Promise<void>` | Switch renderer |
| `getRenderer()` | `IRenderer` | Get current renderer |
| `destroy()` | `void` | Cleanup all resources |
| `updateConfig(config)` | `void` | Update configuration |

### Properties (Readonly)

| Property | Type | Description |
|----------|------|-------------|
| `pageCount` | `number` | Total pages |
| `currentPageIndex` | `number` | Current page (0-based) |
| `orientation` | `'portrait' \| 'landscape'` | Current orientation |
| `state` | `FlipState` | Current flip state |
| `bounds` | `Rect` | Current bounds |

### Events (EventTarget)

```typescript
book.addEventListener('flip', (e) => console.log(e.pageIndex));
book.addEventListener('statechange', (e) => console.log(e.state));
book.addEventListener('orientationchange', (e) => console.log(e.orientation));
book.addEventListener('update', (e) => console.log(e));
book.addEventListener('init', (e) => console.log('Initialized'));
book.addEventListener('error', (e) => console.error(e.error));
```

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `flip` | `FlipEvent` | Page flipped |
| `statechange` | `StateChangeEvent` | State changed |
| `orientationchange` | `OrientationChangeEvent` | Orientation changed |
| `update` | `PageFlipInstance` | Pages/layout updated |
| `init` | `PageFlipInstance` | Initialization complete |
| `error` | `Error` | Error occurred |

---

## FlipEngine

Pure math engine for flip calculations.

```typescript
import { FlipEngine, calculateFoldCurve, calculateShadowParams } from '@pageflip/core/engine';
```

### Functions

| Function | Description |
|----------|-------------|
| `calculateFoldCurve(rect, corner, progress, angle)` | Calculate bezier curve for fold |
| `calculateFoldAngle(rect, corner, point)` | Calculate fold angle from pointer |
| `calculateFoldProgress(angle)` | Normalize angle to 0-1 |
| `calculateShadowParams(progress, rect, lightAngle, maxOpacity)` | Dynamic shadow parameters |
| `calculatePageEdgeShadow(rect, isFolded, progress)` | Page edge shadow |
| `calculateCreaseShadow(progress, rect)` | Inner crease shadow |
| `lerpPoint(a, b, t)` | Linear interpolation |

---

## LayoutCalculator

Responsive layout calculations.

```typescript
import { LayoutCalculator, OrientationManager } from '@pageflip/core/layout';
```

### LayoutCalculator

```typescript
const calculator = new LayoutCalculator({ minWidth: 300, maxWidth: 1200 });

const layout = calculator.calculate(containerRect, config);
```

Returns `LayoutResult` with: `pageWidth`, `pageHeight`, `scale`, `offsetX`, `offsetY`, `orientation`, `pageRect`.

### OrientationManager

```typescript
const orientation = new OrientationManager(calculator);
orientation.setPortraitPreference(true);
orientation.onOrientationChange((e) => console.log(e.orientation));
```

---

## InputManager

Unified input handling.

```typescript
import { InputManager } from '@pageflip/core/input';
```

```typescript
const input = new InputManager({
  pageRect: layout.pageRect,
  cornerSize: 48,
  clickToFlip: true,
  swipeDistance: 30,
  enableKeyboard: true,
  enableWheelZoom: false,
});

input.onInput((event) => {
  switch (event.type) {
    case 'dragStart': handleDragStart(event); break;
    case 'dragMove': handleDragMove(event); break;
    case 'dragEnd': handleDragEnd(event); break;
    case 'swipe': handleSwipe(event); break;
    case 'keyAction': handleKeyAction(event); break;
    case 'wheelZoom': handleWheelZoom(event); break;
  }
});
```

---

## PageManager

Page lifecycle management.

```typescript
import { PageManager } from '@pageflip/core/page';
```

```typescript
const manager = new PageManager({
  maxCacheSize: 50,
  lazyLoad: true,
  preloadAdjacent: true,
  imageLoadTimeout: 10000,
});

await manager.loadFromHtml(elements);
await manager.loadFromImages(urls);
await manager.updateFromHtml(newElements);

manager.setCurrentPage(currentIndex);
await manager.ensurePageLoaded(index);
```

---

## RendererFactory

Renderer management with auto-detection.

```typescript
import { RendererFactory } from '@pageflip/core/renderers';
```

```typescript
const renderer = await RendererFactory.create('auto', canvas, options);
// Tries: webgpu -> webgl -> canvas2d
```

---

## Constants

All magic numbers centralized:

```typescript
import {
  DEFAULT_FLIPPING_TIME,
  DEFAULT_MAX_SHADOW_OPACITY,
  DEFAULT_PAGE_CORNER_SIZE,
  ARIA_LABELS,
  KEYBOARD_SHORTCUTS,
  CSS_CLASSES,
  DATA_ATTRS,
} from '@pageflip/core/constants';
```

---

## Types

```typescript
import type {
  PageFlipConfig,
  PageFlipInstance,
  PageData,
  PageSource,
  FlipEvent,
  StateChangeEvent,
  OrientationChangeEvent,
  PageDensity,
  PageOrientation,
  FlipCorner,
  FlipDirection,
  FlipState,
  IRenderer,
  RendererCapabilities,
  RenderFrame,
  RenderPage,
  Point,
  Rect,
  Size,
} from '@pageflip/core/types';
```
