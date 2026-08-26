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
