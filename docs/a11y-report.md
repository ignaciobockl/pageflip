# Lighthouse Baseline — Accesibilidad

> Reporte baseline generado con Chrome DevTools MCP (`lighthouse_audit`).
> Fecha: 2026-08-29 · Blanco: `apps/playground` · Modo: `snapshot` · Dispositivo: `desktop`

## Scores

| Categoría | Score |
|---|---|
| Accessibility | 96 |
| Best Practices | 100 |
| SEO | 60 |
| Agentic Browsing | 50 |

Audits: 29 pasados, 4 fallados. Timing: ~1634ms.

## Fallos

### 1. `target-size` — Touch targets do not have sufficient size or spacing (a11y)

Botones `.pf-page-indicator__dot` miden 8x12px (15 elementos afectados):
- `Go to page 1/2/3` (PageIndicator + Toolbar)
- `Next page`, `Page 1/2/3`

**Causa:** `packages/theme/src/tokens.css:73` `--pf-page-indicator-size: 8px`.
**Requisito:** WCAG 2.1 AA exige ≥24x24px (o 24px de espacio).
**Impacto:** único motivo del 96 en vez de 100.

### 2. `meta-description` — Document does not have a meta description (SEO)

Falta `<meta name="description">` en `apps/playground/index.html`.

### 3. `robots-txt` — robots.txt is not valid (SEO)

No existe `robots.txt` servido por el sitio.

### 4. `llms-txt` — llms.txt does not follow recommendations (SEO/Agentic)

No existe `llms.txt` (recomendaciones de indexing para LLMs).

## Elementos accesibles verificados (a11y tree)

- `PageFlip Playground` — banner con heading "PageFlip™ Playground", combobox de layout, toggle de tema
- `Interactive Demo` — región con `group` de libro (roledescription="book") + controles Prev/1/6/Next
- `External Controls` — controles ← Prev / 1 / 3 / Next → / First / Last + estado (orientación landscape, estado idle)
- `Component Library` — Toolbar, PageIndicator, ZoomControls (con live region "100% zoom"), FullscreenToggle
- `contentinfo` — copyright + link "View on GitHub"

## Evaluación de MCPs externos de accesibilidad

Opción evaluada: **no instalar MCP externo en esta fase.**

| Opción | Paquete (npm) | Estado |
|---|---|---|
| Chrome DevTools MCP (integrado) | — | Ya disponible en el entorno; `lighthouse_audit` ejecuta axe-core (regla `target-size` de Deque) y da cobertura a11y/SEO/Best Practices |
| `accessibility-mcp` (paul-vd) | `accessibility-mcp@2.1.7` | Alternativa si se requiere axe-core standalone fuera del entorno Chrome DevTools |
| `lighthouse-mcp` | `lighthouse-mcp@0.1.15` | Wrapper de Lighthouse; redundante con el MCP integrado |

**Decisión:** el MCP integrado cubre la cobertura axe-core necesaria (verificado: detectó `target-size`). Se reevaluará si se necesita CI automatizado con pa11y/axe dedicado.

## Historial

| Fecha | Accessibility | Best Practices | SEO | Agentic | Notas |
|---|---|---|---|---|---|
| 2026-08-29 | 96 | 100 | 60 | 50 | Baseline (4 fallos) |

## Referencias

- `packages/theme/src/tokens.css:73`
- `apps/playground/index.html`
- `apps/playground/public/robots.txt`
- `apps/playground/public/llms.txt`
