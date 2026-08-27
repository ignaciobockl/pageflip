---
title: Theming Example
description: Customize PageFlip UI with CSS variables and dark mode tokens
---

# Theming Example

```tsx
import { PageFlip } from '@pageflip/react';
import { Toolbar } from '@pageflip/theme';
import '@pageflip/theme';
```

```css
:root {
  --pf-color-primary: #7c3aed;
  --pf-toolbar-bg: rgba(255, 255, 255, 0.92);
  --pf-toolbar-border: #ddd6fe;
  --pf-page-indicator-active-color: #7c3aed;
  --pf-page-corner-color: #7c3aed;
}

[data-theme='dark'] {
  --pf-color-bg: #0f172a;
  --pf-color-text: #e2e8f0;
  --pf-toolbar-bg: rgba(15, 23, 42, 0.92);
  --pf-toolbar-border: #334155;
}
```

## Common tokens to override

- `--pf-color-primary`
- `--pf-color-text`
- `--pf-color-bg`
- `--pf-toolbar-bg`
- `--pf-toolbar-border`
- `--pf-page-indicator-active-color`
- `--pf-page-corner-color`
