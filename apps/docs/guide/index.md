---
layout: home
hero:
  name: PageFlip™
  text: Modern page flip library
  tagline: Accessible, performant, zero-dependency flip book for React, Vanilla JS, and Web Components.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/ignaciobockl/pageflip
  features:
    - title: ⚡ Zero Dependencies
      details: Core engine has zero runtime dependencies. Only 12KB gzipped.
    - title: ♿ WCAG 2.1 AA
      details: Built-in accessibility: keyboard nav, ARIA, focus management, reduced motion.
    - title: 🎨 Themeable
      details: CSS variables + Tailwind v4 preset. Light/Dark mode out of the box.
    - title: ⚛️ React 18+ Ready
      details: Hooks-based API, SSR-safe, concurrent features support.
    - title: 🌐 Web Components
      details: Framework-agnostic `<page-flip-book>` custom element with Shadow DOM.
    - title: 📦 Modular Renderers
      details: Canvas 2D (MVP), WebGL (zoom/PDF), WebGPU (future). Lazy-loaded.
---

# What is PageFlip?

PageFlip is a modern, accessible, and performant page flip library that lets you create interactive flip book experiences. Built from the ground up with TypeScript, it replaces the abandoned `react-pageflip` with a modern architecture.

## Key Highlights

- **Canvas 2D Rendering**: Smooth 60fps page flip animations using pure Canvas 2D API
- **Responsive Layouts**: Fixed, stretch, and auto-size modes with orientation detection
- **Multiple Content Types**: HTML elements, images, and future renderer plugins (PDF, Video, RTF)
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support
- **Theme System**: CSS variables + Tailwind v4 preset with Light/Dark mode
- **Framework Support**: React 18+, Vanilla JS, Vue, Svelte, Solid, Web Components
- **Zero Runtime Deps**: Core is completely dependency-free

## Packages

| Package | Description |
|---------|-------------|
| `@pageflip/core` | Core engine (Canvas 2D, math, layout, input, plugins) |
| `@pageflip/react` | React 18+ wrapper with hooks (`usePageFlip`, `usePageFlipControls`, etc.) |
| `@pageflip/theme` | Design tokens, Tailwind v4 preset, UI components |
| `@pageflip/web-component` | Framework-agnostic `<page-flip-book>` custom element |
| `@pageflip/renderers` | Official renderers (PDF, Video, Image, RTF) - *coming soon* |

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 100+ |
| Firefox | 95+ |
| Safari | 15+ |
| Edge | 100+ |

Requires Canvas 2D API (universal support). WebGL renderer for zoom/PDF requires WebGL 2 (99% support).

## License

MIT © 2025 Ignacio Bockl — [PageFlip™](https://github.com/ignaciobockl/pageflip) is a trademark of Ignacio Bockl.
