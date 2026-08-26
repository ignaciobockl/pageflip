# PageFlip

Monorepo for the PageFlip ecosystem.

## Workspace layout

- `apps/docs`
- `apps/playground`
- `apps/benchmark`
- `packages/core`
- `packages/react`
- `packages/theme`
- `packages/renderers`
- `packages/web-component`
- `tools/*`

## Core API

`@pageflip/core` exports:

- `FlipEngine`
- `RendererFactory`
- `PluginManager`
- engine math helpers from `packages/core/src/engine`
- shared constants from `packages/core/src/constants`
- public types from `packages/core/src/types`

## Page API

`@pageflip/core` includes `PageManager` for page lifecycle, lazy loading, cache eviction, and memory tracking.

### `PageManager`

```ts
import { PageManager } from "@pageflip/core";

const manager = new PageManager({
  maxCacheSize: 25,
  lazyLoad: true,
  preloadAdjacent: true,
  imageLoadTimeout: 10000,
  monitorMemory: true,
});

await manager.loadFromHtml(Array.from(document.querySelectorAll(".page")));
await manager.loadFromImages(["/pages/1.jpg", "/pages/2.jpg"]);
await manager.loadFromSources([
  { type: "html", content: document.createElement("div") },
  { type: "image", content: "/pages/3.jpg" },
  { type: "renderer", rendererId: "canvas2d", content: { page: 4 } },
]);

manager.setCurrentPage(1);
await manager.ensurePageLoaded(1);

const page = manager.getPage(1);
const pages = manager.getAllPages();
const count = manager.getPageCount();
const loaded = manager.isPageLoaded(1);
const status = manager.getPageLoadStatus(1);
const cache = manager.getCacheStats();
const memory = manager.getMemoryUsage();

manager.onMemoryPressure(() => {
  console.log("cache eviction triggered");
});

await manager.updateFromHtml(Array.from(document.querySelectorAll(".page")));
await manager.updateFromImages(["/pages/1-new.jpg"]);

manager.clear();
manager.destroy();
```

Main methods:

- `loadFromHtml(elements, densities?)`
- `loadFromImages(urls, densities?)`
- `loadFromSources(sources)`
- `updateFromHtml(elements)`
- `updateFromImages(urls)`
- `getPage(index)`
- `getAllPages()`
- `getPageCount()`
- `setCurrentPage(index)`
- `ensurePageLoaded(index)`
- `isPageLoaded(index)`
- `getPageLoadStatus(index)`
- `getCacheStats()`
- `getMemoryUsage()`
- `setConfig(config)`
- `onMemoryPressure(callback)`
- `clear()`
- `destroy()`

## Renderer API

`@pageflip/core` includes a Canvas 2D renderer and a renderer factory with automatic fallback selection.

### `Canvas2DRenderer`

```ts
import { Canvas2DRenderer } from "@pageflip/core";

const renderer = new Canvas2DRenderer({
  highDPI: true,
  drawShadow: true,
  maxShadowOpacity: 0.35,
  showPageCorners: true,
  cornerSize: 48,
  backgroundColor: "#ffffff",
});

await renderer.init(canvas, {
  highDPI: true,
  contextAttributes: { alpha: true },
});

renderer.resize(800, 600, window.devicePixelRatio || 1);
renderer.render(frame);

const config = renderer.getConfig();
renderer.setConfig({ drawShadow: false, backgroundColor: "transparent" });

renderer.destroy();
```

Config fields:

- `highDPI`
- `drawShadow`
- `maxShadowOpacity`
- `showPageCorners`
- `cornerSize`
- `backgroundColor`

Capabilities:

- `zoom: false`
- `pan: false`
- `hiDPI: true`
- `supportsVideo: true`
- `supportsPDF: false`
- `supportsPBR: false`

### `RendererFactory`

```ts
import { RendererFactory } from "@pageflip/core";

const renderer = await RendererFactory.create("auto", canvas, {
  highDPI: true,
});

const canvasRenderer = await RendererFactory.create("canvas2d", canvas);
const capabilities = await RendererFactory.getCapabilities("canvas2d");
```

`RendererFactory.create("auto", ...)` tries available renderers in priority order and falls back to `canvas2d` when advanced APIs are unavailable.

## Input API

`packages/core/src/input` includes pure handlers for unified input processing:

- `MouseHandler`
- `TouchHandler`
- `KeyboardHandler`
- `WheelHandler`
- `InputManager`

### Basic usage

```ts
import {
  InputManager,
  KeyboardHandler,
  MouseHandler,
  TouchHandler,
  WheelHandler,
} from "./packages/core/src/input";

const mouse = new MouseHandler();
const touch = new TouchHandler();
const keyboard = new KeyboardHandler();
const wheel = new WheelHandler();

const input = new InputManager({
  pageRect: { x: 0, y: 0, width: 800, height: 600 },
  cornerSize: 48,
  clickToFlip: true,
  swipeDistance: 30,
  dragThreshold: 5,
  enableKeyboard: true,
  enableWheelZoom: true,
  enableHorizontalScroll: true,
});

input.onInput((event) => {
  if (event.type === "keyAction" && event.keyboardAction === "next") {
    console.log("go to next page");
  }
});
```

### Mouse and touch helpers

```ts
const mouseResult = mouse.onMouseDown({ x: 12, y: 18 });
const touchResult = touch.onTouchStart([{ x: 12, y: 18, identifier: 1 }]);

if (mouseResult.corner || touchResult.corner) {
  console.log("corner interaction started");
}
```

### Keyboard shortcuts

```ts
const action = keyboard.getActionForKey("ArrowRight");

if (action === "next") {
  console.log("advance page");
}
```

### Wheel interactions

```ts
const result = wheel.onWheel({
  deltaX: 0,
  deltaY: 24,
  deltaMode: 0,
  ctrlKey: true,
  shiftKey: false,
  metaKey: false,
  preventDefault() {},
} as WheelEvent);

if (result.action === "zoom") {
  console.log(result.zoomDelta);
}
```

### `FlipEngine`

Constructor:

```ts
const engine = new FlipEngine(container, {
  width: 800,
  height: 600,
});
```

Main methods:

- `flipNext(corner?)`
- `flipPrev(corner?)`
- `flip(pageIndex, corner?)`
- `turnToPage(pageIndex)`
- `turnToNextPage()`
- `turnToPrevPage()`
- `loadFromHtml(elements)`
- `loadFromImages(urls)`
- `loadFromSources(sources)`
- `updateFromHtml(elements)`
- `updateFromImages(urls)`
- `setRenderer(rendererId)`
- `getRenderer()`
- `updateConfig(config)`
- `destroy()`

State getters:

- `pageCount`
- `currentPageIndex`
- `orientation`
- `state`
- `bounds`

## Layout Calculator API (`@pageflip/core/layout`)

### `LayoutCalculator`

```typescript
import { LayoutCalculator } from '@pageflip/core/layout';

const calculator = new LayoutCalculator({
  minWidth: 300,
  maxWidth: 1200,
  minHeight: 400,
  maxHeight: 1600,
});
```

#### `calculate(containerRect, config)`
Returns `LayoutResult` with:
- `pageWidth`, `pageHeight` - Page size in CSS pixels
- `scale` - Scale factor to fit container
- `offsetX`, `offsetY` - Centered position
- `orientation` - 'portrait' | 'landscape'
- `pageRect` - Page bounds in container coordinates
- `containerRect` - Original container bounds

#### `calculateFixed(containerRect, pageSize, usePortrait)`
Fixed size mode layout.

#### `calculateStretch(containerRect, constraints, usePortrait)`
Stretch/responsive mode layout.

#### `hitTestCorner(point, pageRect, cornerSize?)`
Returns `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null`

---

### `OrientationManager`

```typescript
import { OrientationManager } from '@pageflip/core/layout';

const orientation = new OrientationManager(layoutCalculator);
orientation.setPortraitPreference(true);
orientation.setOrientationLock('none'); // 'portrait' | 'landscape' | 'none'

orientation.onOrientationChange((event) => {
  console.log(event.orientation, event.previousOrientation, event.automatic);
});
```

---

### `Constraints` Utilities

```typescript
import { validateConstraints, clampSizeToConstraints } from '@pageflip/core/layout';

const constraints = validateConstraints({ minWidth: 300, maxWidth: 800 });
const clamped = clampSizeToConstraints({ width: 1000, height: 500 }, constraints);
```
