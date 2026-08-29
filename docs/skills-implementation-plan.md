# Plan: Skills de skills.sh + Auditoría de cumplimiento

> Documento de planificación. La implementación se hará más adelante.
> Última auditoría del estado del código: 2026-08-29

## 1. Contexto

Monorepo `pageflip` (bun + turbo + changesets, paquetes `@pageflip/*`). Se instalarán 7 skills del directorio [skills.sh](https://www.skills.sh/) y se auditará el código actual contra cada uno.

Skills elegidos:

| Skill | Fuente | Installs |
|---|---|---|
| `vercel-react-best-practices` | vercel-labs/agent-skills | 674K |
| `vercel-composition-patterns` | vercel-labs/agent-skills | 311K |
| `turborepo` | vercel/turborepo | 66K |
| `frontend-design` | anthropics/skills | 833K |
| `tailwind-design-system` | wshobson/agents | 61K |
| `emil-design-eng` | emilkowalski/skills | 237K |
| `review-animations` | emilkowalski/skills | (pack de Emil) |

## 2. Instalación de skills

Ejecutar desde la raíz del monorepo:

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
npx skills add https://github.com/vercel/turborepo --skill turborepo
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/wshobson/agents --skill tailwind-design-system
npx skills add emilkowalski/skills --skill emil-design-eng
npx skills add emilkowalski/skills --skill review-animations
```

Notas:
- Instala `SKILL.md` vía `.opencode/` para que esté disponible entre sesiones.
- Los 7 pasan auditorías de seguridad (Agent Trust Hub / Socket / Snyk).
- Los skills se versionan en el repo (commit a `develop`), no solo instalación local.
- Opcional del pack de Emil (no incluidas por defecto): `animate`, `improve-animations`, `find-animation-opportunities`, `prototype`, `animation-vocabulary`, `apple-design`, `pick-ui-library`.

## 3. Auditoría de cumplimiento (estado actual)

Alcance completo: `packages/*`, `apps/docs`, `apps/playground`, `apps/benchmark`.

### 3.1 `turborepo` — INCUMPLE la regla principal (package tasks, no root tasks)

- ❌ `package.json:12` `build` encadena `bun run build:core && bun run build:react && bun run build:theme && bun run build:renderers && bun run build:wc` → **serial, mata la paralelización de turbo**. Debe ser `turbo run build`.
- ❌ `package.json:7` `dev` usa `&` en vez de `turbo run dev --parallel`.
- ❌ `package.json:21` `test` es `bun test` directo; `package.json:22` `test:coverage` igual → no pasan por `turbo.json:14-18`.
- ✅ Correcto en `turbo.json` (`dependsOn`, `outputs`, `cache`, `globalEnv`, package configurations).
- ⚠️ `apps/benchmark/package.json:6-11` usa placeholders `bun -e "console.log(...)"` → sin integración turbo real.

### 3.2 `vercel-react-best-practices`

- ❌ `packages/react/src/components/PageFlip.tsx:338` `console.log` olvidado.
- ⚠️ `PageFlip.tsx:404-408` y todo `Toolbar.tsx` usan estilos inline masivos (`style={{}}` en ~300 líneas) en vez de clases/tokens → re-renders y CSS difícil de optimizar.
- ✅ Bien: `handlersRef` (PageFlip.tsx:160-161), `useMemo` config (180), dynamic import de core (310), SSR-safe.

### 3.3 `vercel-composition-patterns`

- ⚠️ `forwardRef` en `PageFlip.tsx:116` y `Toolbar.tsx:51` — la skill recomienda quitarlo (React 19). Proyecto es React 18 → **diferir a fase React 19**.
- ⚠️ Booleans en config: `showCover`, `showPageCorners`, `mobileScrollSupport`, `showPageIndicator` → candidatos a refactor cuando existan 2-3+ estados.
- ✅ Bien: `PageFlipProvider` (context + `registerChild`/`unregisterChild`), `usePageFlipContext` con error claro.

### 3.4 `tailwind-design-system` (Tailwind v4 CSS-first)

- ❌ `packages/theme/tailwind.config.ts:9` es **config estilo v3** (`import type { Config }`). La skill exige v4: `@theme` en CSS, `@custom-variant`, `@utility`, OKLCH.
- ❌ Los componentes de `packages/theme/src/components/*` **no usan Tailwind**: todo inline styles + `var(--pf-*)`. El preset existe pero no se consume.
- ❌ No hay CVA (`class-variance-authority`) para variantes; `Toolbar.tsx` duplica estilos de 4 botones (~50 líneas c/u).
- ✅ Bien: `tokens.css` tiene jerarquía brand → semantic → component, dark mode, reduced-motion, high-contrast.

### 3.5 `frontend-design` (identidad visual)

- ⚠️ `apps/docs` es VitePress con contenido MD pero sin identidad visual propia.
- ⚠️ `apps/playground` es Vite + Storybook sin tema distintivo.
- ⚠️ Paleta genérica en `packages/theme/src/tokens.css:12` (`#3b82f6` azul, `system-ui`), colores hex en vez de OKLCH.
- ✅ Bien: dark mode, reduced motion, focus-visible, tokens semánticos.

### 3.6 `emil-design-eng` (motion/craft de UI) + `review-animations`

Filosofía: animación con propósito, `<300ms` en UI, `ease-out` para entradas (nunca `ease-in`), solo animar `transform`+`opacity`, botones con `scale(0.97)` en `:active`, `prefers-reduced-motion`.

- ⚠️ `packages/theme/src/tokens.css:113` `--pf-transition-flip: 1000ms cubic-bezier(0.4, 0, 0.2, 1)` → 1000ms supera el límite `<300ms` de la skill; `cubic-bezier(0.4,0,0.2,1)` es ease-in-out (en entradas debe ser ease-out).
- ⚠️ `tokens.css:110-112` `--pf-transition-fast: 100ms ease` / `base: 200ms ease` → usar curvas custom (ej. `cubic-bezier(0.23, 1, 0.32, 1)`), no `ease` por defecto.
- ⚠️ `packages/theme/src/components/Toolbar.tsx:139` `transition: "opacity var(--pf-transition-fast)"` → animar `opacity`+`transform`, y los botones no tienen `scale(0.97)` en `:active` (regla de press feedback).
- ⚠️ `packages/theme/src/tokens.css:154-157` animaciones `flip/fade/slide/scale` con easing por defecto → revisar timing/dirección de entrada.
- ✅ Bien: ya respeta `prefers-reduced-motion` (`tokens.css:215-225`) y `prefers-contrast` (`tokens.css:228`).

## 4. Plan de implementación (tickets)

| ID | Skill | Acción | Archivos | Prioridad |
|---|---|---|---|---|
| T-1 | turborepo | Cambiar root scripts a `turbo run build`, `turbo run dev --parallel`, `turbo run test`; eliminar encadenado `&&` | `package.json:7,12,21,22` | Alta |
| T-2 | turborepo | Definir tarea real de benchmark o registrarla en turbo.json | `apps/benchmark`, `turbo.json` | Media |
| T-3 | tailwind v4 | Migrar `tailwind.config.ts` → CSS-first `@theme` en `tokens.css`, OKLCH, `@custom-variant` dark | `packages/theme/src/tokens.css`, eliminar `tailwind.config.ts` | Alta |
| T-4 | tailwind v4 | Añadir CVA y refactorizar botones (Toolbar) a variantes | `packages/theme/src/components/Toolbar.tsx` | Media |
| T-5 | react-perf | Quitar `console.log`; extraer estilos inline a clases CSS/tokens | `packages/react/src/components/PageFlip.tsx:338` | Alta |
| T-6 | composition | Refactor a compound components + revisar booleans (post React 19) | `packages/react`, `packages/theme` | Baja (diferir) |
| T-7 | frontend-design | Definir identidad visual para `apps/docs` y `apps/playground` (paleta OKLCH, tipografía, motion) | `apps/docs`, `apps/playground` | Media |
| T-8 | emil-design-eng | Ajustar timing/curvas de tokens: `--pf-transition-flip` <300ms, curvas custom ease-out, botones con `scale(0.97)` en `:active` | `packages/theme/src/tokens.css`, `packages/theme/src/components/Toolbar.tsx` | Alta |
| T-9 | review-animations | Correr `review-animations` sobre `@pageflip/theme` y `@pageflip/react` y aplicar formato Before/After/Why a los hallazgos | `packages/theme`, `packages/react` | Media |

## 5. Criterios de aceptación

- `bun run build`, `bun run typecheck`, `bun test` verdes en root y por paquete.
- T-1 verificado: `turbo run build --dry` muestra tareas en paralelo.
- T-3: `packages/theme/src/tokens.css` contiene `@theme { ... }` con OKLCH; `tailwind.config.ts` eliminado.
- T-5: sin `console.log` (grep vacío), sin estilos inline en componentes.
- T-8: `--pf-transition-flip` <= 300ms con curva custom ease-out; botones con `:active scale(0.97)`; sin `transition: all`.
- T-9: reporte `review-animations` con tabla Before/After/Why generado y adjuntado al plan.
- Lint + typecheck en CI pasan.

## 6. Notas / decisiones

- `vercel-composition-patterns` se aplica en fase React 19, no bloquea el sprint actual.
- El preset Tailwind v4 debe **coexistir** con los tokens CSS existentes: los `var(--pf-*)` siguen siendo la fuente de verdad.
- `emil-design-eng` complementa (no reemplaza) `frontend-design` y `tailwind-design-system`: aporta motion/craft, no estética.
- La animación del flip (`--pf-transition-flip`) es core del producto, no solo decoración: T-8 debe preservar la sensación de realismo del volteo; validar en `apps/playground`.
- La implementación de estos tickets se coordinará con el flujo de ramas `develop`/`master` de `docs/publishing.md` (cambios a `develop`, release a `master`).

## 7. Referencias

- skills.sh: https://www.skills.sh/
- SKILL.md instalación: `npx skills add <owner>/<repo> --skill <nombre>`
- Skill Emil Kowalski (repo): https://github.com/emilkowalski/skill y https://github.com/emilkowalski/skills
- Sitio de Emil: https://emilkowal.ski/skill
- Config turbo actual: `turbo.json`
- Scripts root: `package.json`
