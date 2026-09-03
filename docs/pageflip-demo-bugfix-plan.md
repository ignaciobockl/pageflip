# Plan de Bugfix y Mejoras — `pageflip-demo`

## Contexto

El análisis de 37 bugs/mejoras fue realizado sobre el proyecto **`pageflip-demo`**
(`C:\Users\Ignacio Bockl\Desktop\pageflip-demo`), un demo separado (sin repositorio git)
que consume `@pageflip/*@0.1.1` desde npm. Este plan captura las decisiones de
implementación y la causa raíz verificada de cada item contra la API real del paquete.

> Nota: el monorepo `pageflip` ya tiene su propia superficie de demo sano en
> `apps/playground` (App.tsx + Storybook + e2e). La mayoría de los items de esta lista
> NO aplican al monorepo; aplican a `pageflip-demo`.

## Decisiones de diseño (confirmadas)

1. **Mantener `<React.StrictMode>`** en `pageflip-demo/src/main.tsx` y blindar los hooks
   con cleanup robusto (`isMountedRef`, cleanup de event listeners) en lugar de quitarlo.
2. **Migrar a la API declarativa de hooks** (`usePageFlip`, `usePageFlipState`,
   `usePageFlipControls`, `usePageFlipEvents`) en lugar del patrón roto
   `useRef + useEffect(() => setTotalPages(ref.getPageCount()), [])`.
3. **Crear la 6ª demo `ThemeDemo`** usando los componentes de `@pageflip/theme`.

## API real verificada (`@pageflip/*@0.1.1`)

- `PageFlip` (forwardRef) expone `ref` = instancia del engine (`useImperativeHandle`).
  Métodos/propiedades disponibles: `pageCount`, `currentPageIndex`, `flipNext(corner)`,
  `flipPrev(corner)`, `flip(pageIndex, corner)`, `updateConfig(config)`, `getPageCount()`.
- Eventos vía `CustomEvent.detail`:
  - `flip` → `{ pageIndex, direction, corner, timestamp }`
  - `statechange` → `{ state, ... }`
  - `orientationchange` → `{ orientation, ... }`
  - `init` → `instance`
  - `update` → `instance`
  - `error` → `Error`
- Hooks `@pageflip/react`: `usePageFlip`, `usePageFlipControls`, `usePageFlipState`,
  `usePageFlipEvents`.
- `@pageflip/theme`: `PageFlipProvider`, `Toolbar`, `PageIndicator`, `ZoomControls`,
  `FullscreenToggle`, `PageCorner`, `LoadingSpinner`, `KeyboardShortcuts`, y hooks de contexto.

### Causa raíz clave (corrige la lectura original de los bugs)

- **B-01 / B-04 (`totalPages = 0` / botones disabled)** no es "getPageCount retorna 0".
  El engine sí tiene `getPageCount()`. La causa real es de **timing**: el
  `useEffect(..., [])` lee `bookRef.current` antes de que `PageFlip` termine de crear el
  engine (y bajo StrictMode ocurre doble mount con cleanup).
- **B-06 (`e.data` vs `e.pageIndex`)** el bug NO está en los demos (los demos ya usan
  `e?.pageIndex`). El bug real está en `src/@types/pageflip__react.d.ts`, que declara
  `onFlip?: (event: { data: number }) => void` cuando el engine emite
  `detail: { pageIndex, direction, corner, timestamp }`.

## Índice de tareas

| ID | Alcance | Archivo(s) | Items resueltos |
|----|---------|------------|-----------------|
| T1 | StrictMode | `src/main.tsx` | B-01, B-02 |
| T2 | Tipos | `src/@types/pageflip__react.d.ts` | B-06, M-01, DT-05 |
| T3 | Contratos | `src/types/index.ts` | B-09, B-10 |
| T4 | Demo | `src/demos/BasicDemo.tsx` | B-01, B-04, B-06 |
| T5 | Demo | `src/demos/ImagesDemo.tsx` | B-07 |
| T6 | Demo | `src/demos/ConfigDemo.tsx` | B-03, B-08 |
| T7 | Demo | `src/demos/EventsDemo.tsx` | B-15 |
| T8 | Demo | `src/demos/HooksDemo.tsx` | B-14 |
| T9 | Componente | `src/components/BookControls.tsx` | B-04 |
| T10 | Limpieza | verificar archivos muertos | B-11, B-12 |
| T11 | App | `src/App.tsx` | B-10, M-06, M-07 |
| T12 | Limpieza | `src/components/EventLog.tsx` + todos | B-09, DT-04 |
| T13 | Demo | `src/demos/ThemeDemo.tsx` | B-13, M-04, M-05 |
| T14 | UX | varios | UX-01, UX-02, UX-07, UX-08, UX-10 |
| T15 | Deuda | varios | DT-01, DT-02, DT-03, DT-05 |

## Tareas detalladas

### Fase 1 — Fundamentos (desbloquea tipado y timing)

**T1 — `src/main.tsx` (B-01, B-02)**
Mantener `<React.StrictMode>`. No se modifica el montaje; la robustez ante el doble mount
se garantiza en Fase 2. Verificar que `usePageFlip` hace `destroy()` en cleanup
(confirmado en `dist/index.js`).

**T2 — `src/@types/pageflip__react.d.ts` (B-06, M-01, DT-05)**
Reescribir declarando la API real:
- `onFlip: (detail: { pageIndex; direction; corner; timestamp }) => void`.
- `FlipEngine` completo (`getPageCount()`, `pageCount`, `currentPageIndex`,
  `flip`/`flipNext`/`flipPrev`, `updateConfig`, `destroy`).
- `usePageFlip`, `usePageFlipControls`, `usePageFlipState`, `usePageFlipEvents`.
- Habilitar strict: quitar `[key: string]: any`, bajar `skipLibCheck`.

**T3 — `src/types/index.ts` (B-09, B-10)**
- `EventLogEntry.id` monotónico estable (helper/contador compartido) → resuelve B-09.
- Verificar `DemoConfig` = subconjunto de props reales de `PageFlip`.

### Fase 2 — Las 5 demos (bugs críticos/mayores)

**T4 — `BasicDemo.tsx` (B-01, B-04, B-06)**
Migrar a `usePageFlip` + `usePageFlipState` + `usePageFlipControls`. `totalPages` y
`currentPage` reactivos. `isFlipping` real pasa a `BookControls`.

**T5 — `ImagesDemo.tsx` (B-07)**
Usar `images={sampleImages}` (prop) y quitar los children `<img>`.

**T6 — `ConfigDemo.tsx` (B-03, B-08)**
Quitar `key={bookKey}` y el state `bookKey`. Usar `usePageFlip` + `updateConfig(config)`
en cambios de config (sin remount).

**T7 — `EventsDemo.tsx` (B-15)**
Agregar `onChangeState`, `onChangeOrientation`, `onUpdate`, `onError` vía
`usePageFlipEvents`. Sin bucle infinito.

**T8 — `HooksDemo.tsx` (B-14)**
Reescribir sin `<PageFlip>`: usar los 4 hooks y renderizar el contenedor con `ref`.

### Fase 3 — Componentes compartidos + App

**T9 — `BookControls.tsx` (B-04)**
Consumir `isFlipping` real (ya no `isFlipping={false}` hardcodeado). Lógica `disabled`
ya correcta.

**T10 — B-11, B-12**
Verificar archivos muertos (`PageFlipDemo.tsx`, `src/types.ts`). Ya no existen en el
árbol actual; confirmar y no-op.

**T11 — `App.tsx` (B-10, M-06, M-07)**
- `config = defaultConfig` (no state).
- Conectar `addGlobalEvent` o eliminarlo.
- Añadir `ErrorBoundary` envolviendo las demos.

**T12 — `EventLog.tsx` + limpieza (B-09, DT-04)**
`EventLog` usar `id` estable; quitar imports no usados en todos los archivos.

### Fase 4 — Arquitectura + UX + deuda

**T13 — `ThemeDemo.tsx` (B-13, M-04, M-05)**
`PageFlipProvider` + `Toolbar`, `PageIndicator`, `ZoomControls`, `FullscreenToggle`,
`PageCorner`, `LoadingSpinner`, `KeyboardShortcuts`. Agregar `'theme'` a `DemoType` y tabs.

**T14 — UX pasivos**
UX-01 (spinner loading), UX-02 (KeyboardShortcuts), UX-07 (light/dark `data-theme`),
UX-08 (PageIndicator como progreso), UX-10 (tooltips) — lo que no quede cubierto por T13.

**T15 — Deuda técnica**
- DT-01: forzar `renderer: "canvas2d"` por defecto (evitar warnings WebGL).
- DT-02: tipar refs como `React.RefObject<FlipEngine>`.
- DT-03: validar qué props de `DemoConfig` se pasan realmente a `<PageFlip>`.
- DT-05: habilitar strict tras T2.

## Orden de ejecución

1. T1–T3 (fundamentos).
2. T4–T8 (las 5 demos).
3. T9–T12 (componentes compartidos + App).
4. T13–T15 (ThemeDemo + UX + deuda).

## Verificación

- Después de cada fase: `bun run build` (tsc + vite build).
- Final: `bun run dev` sin errores de consola.

## Items originales cubiertos

- **Críticos**: B-01, B-02, B-03, B-04, B-05.
- **Mayores**: B-06, B-07, B-08, B-09, B-10.
- **Menores**: B-11, B-12, B-13, B-14, B-15.
- **Arquitectura**: M-01, M-04, M-05, M-06, M-07.
- **UX/Diseño**: UX-01, UX-02, UX-07, UX-08, UX-10 (el resto quedan documentados como
  opcionales/de bajo valor para este demo).
- **Deuda técnica**: DT-01, DT-02, DT-03, DT-04, DT-05.