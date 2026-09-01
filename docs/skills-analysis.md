# Análisis del proyecto con Skills de skills.sh

> Auditoría aplicando las 7 skills instaladas (`npx skills add`).
> Fecha: 2026-08-29 · Rama: `feat/skills-plan` · Alcance: `packages/*`, `apps/*`, root config

## Skills instaladas

| Skill | Fuente |
|---|---|
| `vercel-react-best-practices` | vercel-labs/agent-skills |
| `vercel-composition-patterns` | vercel-labs/agent-skills |
| `turborepo` | vercel/turborepo |
| `frontend-design` | anthropics/skills |
| `tailwind-design-system` | wshobson/agents |
| `emil-design-eng` | emilkowalski/skills |
| `review-animations` | emilkowalski/skills |

## Resumen ejecutivo

| Skill | Verdict |
|---|---|
| turborepo | ❌ Root scripts seriales |
| vercel-react-best-practices | ❌ console.log + inline styles |
| vercel-composition-patterns | ⚠️ Booleans + forwardRef (diferir a React 19) |
| tailwind-design-system | ❌ Config v3, no v4 CSS-first |
| frontend-design | ⚠️ Sin identidad visual distintiva |
| emil-design-eng | ❌ Curvas/durations/press feedback |
| review-animations | ❌ BLOCK — flip easing + hover gating |

## Estado de ejecución

Tickets ejecutados en `feat/skills-plan`:

- [x] T-1 `build(turbo): delegate root scripts to turbo run` (`290533b`)
- [x] T-2 `feat(benchmark): add runnable core benchmark app` (`65570c4`)
- [x] T-3 `feat(theme): migrate Tailwind config to CSS-first entrypoint` (`24eec15`)
- [x] T-4 `feat(theme): add toolbar variants with cva` (`5e0fc7b`)
- [x] T-5 `perf(theme): extract toolbar styles and remove debug log` (`b6d5c78`)
- [x] T-6 `refactor(theme): add compositional indicator APIs` (`3ba01ac`)
- [x] T-7 `feat(docs): add editorial visual identity` (`c4e786c`)
- [x] T-8 `style(theme): tighten motion tokens and press feedback` (`e0c7092`)
- [ ] T-9 pendiente

---

## 1. `turborepo` — INCUMPLE reglas principales

### Package tasks vs root tasks

- ❌ `package.json:12` `build` encadena `bun run build:core && bun run build:react && bun run build:theme && bun run build:renderers && bun run build:wc` — **serial, mata la paralelización de turbo**. La skill exige root scripts que solo delegan: `"build": "turbo run build"`.
- ❌ `package.json:7` `dev` usa `&` manual + `--filter` repetidos en vez de `turbo run dev --parallel`.
- ❌ `package.json:21-22` `test` / `test:coverage` son `bun test` directo — **bypasean turbo** (no pasan por `turbo.json:14-18`).
- ❌ `package.json:13-17` `build:core`, `build:react`, etc. duplican `turbo run build --filter=@pageflip/core` en root — deberían ser solo `turbo run build`.

### Caching y outputs

- ✅ `turbo.json:3-30` usa `dependsOn: ["^build"]`, `outputs`, `cache`, `globalEnv` correctamente.
- ⚠️ `turbo.json:31` `globalEnv: ["NODE_ENV", "CI"]` ok, pero no hay `.env` en `inputs`.
- ⚠️ `apps/benchmark/package.json:6-11` usa placeholders `bun -e "console.log(...)"` — sin tarea real ni `outputs`.

---

## 2. `vercel-react-best-practices` — Hallazgos

### Crítico

- ❌ `console.log` en `packages/react/src/components/PageFlip.tsx:352` — código de depuración en producción (`console.log("[PageFlip] loading children:", childElements.length)`).

### Re-render

- ⚠️ `rerender-memo` — componentes del theme sin `React.memo`; el tree se reconstruye en cada render.
- ⚠️ `PageFlipProvider.tsx:99-108` `updateState` setea estado completo en cada flip → re-render de todo el subtree.
- ✅ `PageFlip.tsx:180` `memoizedConfig` con `useMemo` correcto.
- ✅ `PageFlip.tsx:170` usa updater functions funcionales (`setState(prev => ...)`).

### Estilos

- ⚠️ Estilos inline masivos — Toolbar.tsx (~14 `style={{}}`), ZoomControls (~6), PageIndicator (~7), FullscreenToggle, PageCorner (~3). Violación de maintainability + performance. Deben ir a clases/tokens.

### Correcto

- ✅ SSR-safe (`state.isClient`).
- ✅ Dynamic import de core (`PageFlip.tsx:310`).
- ✅ `handlersRef` para evitar stale closures (`PageFlip.tsx:160-161`).

---

## 3. `vercel-composition-patterns`

### Booleans en props (candidatos a composición)

- ❌ `PageFlipProps`: `showCover`, `showPageCorners`, `mobileScrollSupport`, `disableFlipByClick`, `clickEventForward`.
- ❌ `ToolbarProps`: `showPageIndicator`, `position`.
- ❌ `ZoomControls`: `showLevel`.

### forwardRef (React 19 — diferir)

⚠️ 6 componentes usan `forwardRef`; la skill recomienda quitarlo solo en React 19:
- `PageFlip.tsx:116`, `Toolbar.tsx:51`, `ZoomControls.tsx:51`, `FullscreenToggle.tsx:47`, `LoadingSpinner.tsx:33`, `PageCorner.tsx:48`.

### Variantes

- ⚠️ `LoadingSpinnerProps.size` (`sm|md|lg`) es variante correcta pero resuelta con `sizeStyles` record + inline styles en vez de CVA/clases.

### Correcto

- ✅ `PageFlipProvider` con context + `registerChild`/`unregisterChild` — buen compound pattern.
- ✅ `state-context-interface` bien definido (`PageFlipContextValue`).

---

## 4. `tailwind-design-system` — Config v3, no v4 CSS-first

- ❌ `packages/theme/tailwind.config.ts:9` — config estilo **v3** (`import type { Config }`). La skill exige:
  - `@theme { ... }` en CSS con tokens OKLCH.
  - `@custom-variant dark (&:where(.dark, .dark *))` en vez de `darkMode: ["class", ...]`.
  - `@import "tailwindcss"` en vez de `@tailwind base/components/utilities`.
- ❌ Colores hex, no OKLCH — `tokens.css:12` `#ffffff`, `#3b82f6`, etc.
- ❌ Los componentes `packages/theme/src/components/*` NO usan Tailwind — todo inline styles + `var(--pf-*)`. El preset existe pero no se consume.
- ❌ Sin CVA (`class-variance-authority`) para variantes; `Toolbar.tsx` duplica ~50 líneas de estilos de botón 4 veces.

---

## 5. `frontend-design` — Falta identidad visual distintiva

- ⚠️ `tokens.css` — paleta genérica: azul `#3b82f6`, `system-ui`, bordes `#e2e8f0`. Es el "template default" que la skill rechaza.
- ⚠️ `apps/docs` — VitePress puro sin identidad: sin token system de marca, tipografía distintiva ni signature element. El "hero" no es una tesis.
- ⚠️ `apps/playground` — funcional pero sin dirección estética opinada.
- ✅ Copywriting accesible (aria-labels descriptivos), dark mode, reduced motion, focus-visible bien implementados.

---

## 6. `emil-design-eng` — Hallazgos de motion

Formato requerido: tabla Before/After/Why.

| Before | After | Why |
|---|---|---|
| `--pf-transition-flip: 1000ms cubic-bezier(0.4,0,0.2,1)` (tokens.css:114) | `500ms` + custom ease-out | 1000ms supera el límite `<300ms` de UI; ease-in-out no es responsive al inicio |
| `--pf-transition-fast: 100ms ease` (tokens.css:111) | `cubic-bezier(0.23, 1, 0.32, 1)` | Curvas built-in demasiado débiles; falta punch |
| `--pf-transition-base: 200ms ease` (tokens.css:112) | custom curve | Idem |
| Botones sin `:active scale(0.97)` (Toolbar, ZoomControls, FullscreenToggle) | `transform: scale(0.97)` en `:active` | Botones deben sentirse responsive al press |
| `:hover { transform: scale(1.2) }` en dots (PageFlipToolbar.ts:255, PageFlipPageIndicator.ts:207) sin media query | `@media (hover: hover) and (pointer: fine)` | Touch dispara hover falso en tap |
| `FlipEngine.ts:801-804` easing cúbico inline (easeInOutCubic manual) | custom curve o spring | El flip core debe sentirse físico, no matemático-genérico |

Positivo: `prefers-reduced-motion` correcto (tokens.css:215-225), animaciones mayormente en `transform`/`opacity`/`background-color` (GPU-safe).

---

## 7. `review-animations` — Verdict: BLOCK

### Findings (tabla Before/After/Why)

Ver tabla de la sección 6. Puntos más graves:

1. **`ease-in-out` en el flip core** (`FlipEngine.ts:801-804`) — easeInOutCubic hace lento el inicio del volteo, el momento que el usuario más observa.
2. **`transition: background-color` + `opacity`** en toolbar/dots — ok GPU, pero `:hover scale(1.2)` sin gating touch.
3. **`transform: scale(1.1)` en `PageCorner.tsx:196`** al arrastrar — snap sin transición; el drag no usa velocity/momentum (falta damping + momentum dismissal).
4. **Falta `@starting-style`** para entradas (dropdowns/popovers no existen aún, pero el patrón no está).

### Verdict

- **BLOCK** — easing del flip core (feel-breaking), hover sin gating touch, press feedback ausente en botones.

---

## Hoja de ruta (tickets sugeridos)

| ID | Skill | Acción | Archivos | Prioridad | Estado |
|---|---|---|---|---|---|
| T-1 | turborepo | Root scripts a `turbo run build` / `turbo run dev` / `turbo run test` | `package.json:7,12,21,22`, `turbo.json` | Alta | Completado |
| T-2 | turborepo | Tarea real de benchmark + `outputs` | `apps/benchmark`, `apps/benchmark/turbo.json` | Media | Completado |
| T-3 | tailwind v4 | Migrar config → entrypoint CSS-first exportable | `packages/theme/src/tailwind.css`, `packages/theme/package.json` | Alta | Completado |
| T-4 | tailwind v4 | Añadir CVA y encapsular variantes del Toolbar | `packages/theme/src/components/Toolbar.tsx` | Media | Completado |
| T-5 | react-perf | Quitar `console.log`; extraer estilos inline a clases/tokens | `packages/react/src/components/PageFlip.tsx`, `packages/theme/src/tokens.css` | Alta | Completado |
| T-6 | composition | Añadir APIs composicionales explícitas manteniendo compatibilidad | `packages/theme/src/components/Toolbar.tsx`, `ZoomControls.tsx`, `PageIndicator.tsx` | Media | Completado |
| T-7 | frontend-design | Identidad visual para `apps/docs` y `apps/playground` | `apps/docs`, `apps/playground` | Media | Completado |
| T-8 | emil-design-eng | Ajustar motion tokens, hover gating y `:active scale(0.97)` | `packages/theme/src/tokens.css`, `packages/web-component/src/*`, `apps/playground/src/App.css` | Alta | Completado |
| T-9 | review-animations | Revisar easing del flip core + hover gating + drag momentum | `packages/core/src/engine/FlipEngine.ts`, `PageCorner.tsx` | Media | Pendiente |

## Referencias

- Skills instaladas en `.agents/skills/` (lock en `skills-lock.json`, commit `4460a24`).
- `tokens.css`: `packages/theme/src/tokens.css`
- Root scripts: `package.json`
- Turbo config: `turbo.json`
