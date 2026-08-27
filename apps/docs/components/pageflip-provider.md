---
title: PageFlipProvider
description: React context provider for sharing PageFlip instance, controls, and state
---

# PageFlipProvider

`PageFlipProvider` shares the active PageFlip instance, derived controls, and reactive state through React context.

## Import

```tsx
import {
  PageFlipProvider,
  usePageFlipContext,
  usePageFlipControls,
  usePageFlipInstance,
  usePageFlipState,
} from '@pageflip/theme';
```

## Usage

```tsx
import { PageFlip } from '@pageflip/react';
import {
  PageFlipProvider,
  Toolbar,
  usePageFlipControls,
  usePageFlipState,
} from '@pageflip/theme';
import { useState } from 'react';

function ReaderShell() {
  const [instance, setInstance] = useState(null);

  return (
    <PageFlipProvider instance={instance}>
      <PageFlip ref={setInstance} width={800} height={600}>
        <div>Page 1</div>
        <div>Page 2</div>
      </PageFlip>
      <ReaderToolbar />
    </PageFlipProvider>
  );
}

function ReaderToolbar() {
  const controls = usePageFlipControls();
  const state = usePageFlipState();

  if (!controls || !state) return null;

  return (
    <Toolbar
      controls={controls}
      currentPage={state.currentPage}
      pageCount={state.pageCount}
    />
  );
}
```

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `instance` | `PageFlipInstance \| null` | Yes | - |
| `children` | `React.ReactNode` | Yes | - |

## Exposed hooks

- `usePageFlipContext()`
- `usePageFlipInstance()`
- `usePageFlipControls()`
- `usePageFlipState()`

## Features

- Converts an instance into shared controls and state
- Subscribes to `flip`, `statechange`, `orientationchange`, and `update`
- Useful for toolbars, overlays, side panels, and portals
- Throws early when hooks are used outside the provider

## CSS variables

None.

## Parts

None. This is a context utility.

## Accessibility

The provider itself does not render UI. Accessibility depends on the child components that consume its state.
