---
title: Hooks Example
description: Build a custom reader with usePageFlip, usePageFlipControls, and usePageFlipState
---

# Hooks Example

```tsx
import {
  usePageFlip,
  usePageFlipControls,
  usePageFlipState,
} from '@pageflip/react';
import { LoadingSpinner, PageIndicator } from '@pageflip/theme';

export function HookDrivenReader() {
  const { error, instance, loading, ref } = usePageFlip({
    width: 800,
    height: 600,
    size: 'stretch',
  });
  const controls = usePageFlipControls(instance);
  const state = usePageFlipState(instance);

  return (
    <div>
      <div ref={ref}>
        <div>Page 1</div>
        <div>Page 2</div>
        <div>Page 3</div>
      </div>

      {loading ? <LoadingSpinner /> : null}
      {error ? <p>{error.message}</p> : null}

      <button onClick={() => void controls.prev()} type="button">
        Prev
      </button>
      <button onClick={() => void controls.next()} type="button">
        Next
      </button>

      <PageIndicator
        current={state.currentPage}
        total={state.pageCount}
        onPageClick={(pageIndex) => void controls.goTo(pageIndex)}
      />
    </div>
  );
}
```

## When to use hooks

- External controls
- Custom loading and error UIs
- Shared state across multiple components
