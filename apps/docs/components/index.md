---
title: Components
description: Reusable UI components and context helpers from @pageflip/theme
---

# Components

`@pageflip/theme` ships reusable React UI for navigation, status, zoom, fullscreen, drag affordances, loading states, keyboard navigation, and shared context.

## Installation

```bash
bun add @pageflip/theme @pageflip/react
```

```tsx
import '@pageflip/theme';
```

## Included components

- [Toolbar](/components/toolbar)
- [PageIndicator](/components/page-indicator)
- [ZoomControls](/components/zoom-controls)
- [FullscreenToggle](/components/fullscreen-toggle)
- [PageCorner](/components/page-corner)
- [LoadingSpinner](/components/loading-spinner)
- [KeyboardShortcuts](/components/keyboard-shortcuts)
- [PageFlipProvider](/components/pageflip-provider)

## When to use them

- Use **Toolbar** for ready-made navigation.
- Use **PageIndicator** when you want standalone page selection.
- Use **ZoomControls** and **FullscreenToggle** for reading UIs.
- Use **PageCorner** for explicit drag handles.
- Use **LoadingSpinner** during async initialization.
- Use **KeyboardShortcuts** for global keyboard navigation.
- Use **PageFlipProvider** to share instance, controls, and state across nested components.
