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
