# Backlog — Tareas Pendientes

> Registro de tareas pendientes del monorepo `pageflip`. Actualizado: 2026-08-29

## Pendientes — Accesibilidad y Lighthouse

### Contexto
- `README.md:4` declara cumplimiento WCAG 2.1 AA
- MCP Chrome DevTools integrado (entorno OpenCode): `lighthouse_audit` (Accessibility/SEO/Best Practices), `take_snapshot` (a11y tree), `list_console_messages`
- MCPs externos evaluados: `pa11y-mcp`, `accessibility-mcp` (paul-vd), `lighthouse-mcp`, `axe-devtools`

### Resultados del audit (2026-08-29, `apps/playground`, snapshot desktop)
| Categoría | Score |
|---|---|
| Accessibility | 96 |
| Best Practices | 100 |
| SEO | 60 |
| Agentic Browsing | 50 |

Fallos (4):
1. **`target-size` (a11y)** — botones `.pf-page-indicator__dot` miden 8x12px (15 elementos). Causa: `packages/theme/src/tokens.css:73` `--pf-page-indicator-size: 8px`. WCAG 2.1 AA exige ≥24x24px (o 24px de espacio). Único motivo del 96 en vez de 100.
2. **`meta-description` (SEO)** — falta `<meta name="description">` en `apps/playground/index.html`.
3. **`robots-txt` (SEO)** — no hay `robots.txt` válido.
4. **`llms-txt` (SEO)** — falta `llms.txt`.

### Tareas
- [ ] Fix `target-size`: subir dot a 24px de hit-area (min 24x24) manteniendo el 8px visual, p.ej. con `padding` + `background-clip`, o `::before` como área invisible. Verificar con `lighthouse_audit` hasta Accessibility 100
- [ ] Añadir `<meta name="description">` al `index.html` del playground
- [ ] Crear `robots.txt` (permitir/denegar crawlers)
- [ ] Crear `llms.txt` (recomendaciones de indexing para LLMs)
- [ ] Volcar reporte baseline completo a `docs/` (ej. `docs/a11y-report.md`) para comparación futura
- [ ] Evaluar e instalar un MCP de accesibilidad externo (pa11y-mcp o accessibility-mcp) si se requiere cobertura axe-core fuera del entorno Chrome DevTools
- [ ] Verificar que los tickets del plan de skills (T-3/T-4/T-7/T-8) no degraden los scores de accesibilidad

## Pendientes — Publicación Dual (npmjs + GitHub Packages)

### Contexto
- Paquetes ya publicados en npmjs.com como `@pageflip/*@0.1.1` (verificado con `npm view`)
- Sidebar `Packages` en https://github.com/ignaciobockl/pageflip sigue vacío porque es el registro de GitHub Packages (`npm.pkg.github.com`), no npmjs
- Scope `@pageflip` en GitHub está ocupado (usuario https://github.com/pageflip existe) -> no se puede publicar `@pageflip/*` a GitHub Packages bajo `ignaciobockl/pageflip` sin crear nueva org o renombrar scope

### Tareas
- [ ] **Crear `.npmrc` para GitHub Packages**
  - Archivo: `.npmrc`
  - Contenido: `@pageflip:registry=https://npm.pkg.github.com` (o `@ignaciobockl:registry=...` si se opta por duplicar con otro scope)
  - Auth: `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}`

- [ ] **Crear workflow `.github/workflows/publish-github.yml`**
  - Trigger: `on: push: branches: [master]` (igual que release a npmjs, pero separado)
  - Permisos: `contents: read, packages: write, id-token: write`
  - Steps: `setup-bun`, `bun install`, `bun run build`, `npm publish --registry=https://npm.pkg.github.com`
  - Alternativa dual: extender `.github/workflows/release.yml` para publicar a ambos registros con `registry-url` dual
  - Nota: si se mantiene scope `@pageflip`, el workflow fallará con `403` hasta que se resuelva el ownership de la org GitHub `pageflip` (ver opciones en `docs/publishing.md:8`). Decidir entre Opción 2 (`@ignaciobockl/*`) u Opción 3 (nueva org GitHub)

- [ ] **Actualizar `docs/publishing.md`**
  - Sección 6: añadir subsección `Publicación a GitHub Packages` con instrucciones diferenciadas npmjs vs GitHub
  - Sección 1/8: documentar limitación de scope y las 3 opciones (solo npmjs / duplicar con `@ignaciobockl` / mover a org GitHub nueva)
  - Añadir tabla comparativa de registros y comandos `npm view` vs sidebar

### Referencias
- `docs/publishing.md`
- `.changeset/config.json:8` (`baseBranch: master`)
- `packages/*/package.json:2` (scope actual `@pageflip/*`)
- Verificación: `npm view "@pageflip/core" -> 0.1.1` OK, `https://github.com/pageflip` ocupado

## Otros pendientes (para completar)
- [ ] Decidir estrategia final de scope para GitHub Packages y crear org si aplica
- [ ] Proteger `master` en GitHub (Require PR de `develop`)
