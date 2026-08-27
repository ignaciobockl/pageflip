# Guía de Publicación en npm

> Monorepo `pageflip` — paquetes `@pageflip/*` gestionados con `changesets` + `bun`.

## 1. ¿Es gratis? ¿Puedo reservar el nombre?

**Sí, es gratis** para paquetes públicos. npm permite paquetes públicos ilimitados sin coste. Los paquetes privados sí requieren plan de pago (a partir de ~$7/mes).

**¿Se puede reservar el nombre sin publicar? No exactamente.** npm no tiene un botón de "reservar". Hay 2 formas de asegurarlo:

1.  **Opción recomendada (scope):** Crea la organización `@pageflip` en https://www.npmjs.com/org/create — una vez creada, nadie más puede publicar bajo `@pageflip/*`. Es gratis para orgs públicas. Verifica disponibilidad con:
    ```bash
    npm view @pageflip/core version
    # 404 = disponible (actualmente libre, verificado el 2026-08-26)
    npm view pageflip version
    # 404 = disponible
    ```

2.  **Opción placeholder:** Publica una versión `0.0.1` mínima con `npm publish --access public`. Esa versión bloquea el nombre para siempre (aunque luego publiques la versión real). Es lo que hacen la mayoría de proyectos.

> **Importante para scopes:** La primera vez que publicas `@pageflip/core` debes usar `--access public`, si no npm lo crea como privado y te pedirá pago. En este repo ya está configurado en `.changeset/config.json:7` (`"access": "public"`), así que `bunx changeset publish` lo hace automático.

Si no quieres publicar hoy pero temes que te quiten el nombre, crea la Org ahora. Te toma 2 minutos y no necesitas publicar código.

## 2. Requisitos previos

- Cuenta en https://www.npmjs.com/signup (verifica el email)
- Activar 2FA (recomendado): Perfil > Two-Factor Authentication > `Authorization and Publishing`
- Node + npm/bun instalados
- Estar logueado localmente:
  ```bash
  npm login
  npm whoami # debe mostrar tu usuario
  # con bun también vale:
  bunx npm login
  ```
- Haber creado la organización `@pageflip` si quieres asegurar el scope.

## 3. Estado actual del proyecto

- Root `package.json:4` tiene `"private": true` — correcto, no se publicará el monorepo.
- Paquetes publicables: `packages/core`, `packages/react`, `packages/theme`, `packages/renderers`, `packages/web-component` — cada uno con `package.json:2` `name: "@pageflip/*"`, `package.json:16` `files: ["dist"]` y `exports` correctos.
- Versión actual `0.0.0` en todos los paquetes — **no es publicable**, debe subirse a `0.1.0` o `1.0.0` antes del primer publish.
- Script de release ya configurado en `package.json:33`: `"release": "bun run build && bunx changeset publish"`

## 4. Flujo de publicación (con Changesets)

Este es el flujo oficial del repo. Úsalo siempre.

### 4.1 Crear el changeset (describe el cambio)

```bash
bunx changeset
# ? What kind of change? -> patch / minor / major
# Para primer release usa minor -> 0.1.0
# ? Summary -> ej: "feat: initial release"
```
Esto genera un archivo `.changeset/*.md`.

Haz commit de ese archivo:
```bash
git add .changeset/*.md
git commit -m "chore: changeset for initial release"
```

### 4.2 Versionar (bump de versiones)

```bash
bun run version
# equivale a: bunx changeset version && bun install
# Actualiza package.json de todos los paquetes y genera CHANGELOG.md
```

Revisa `git diff`, haz commit:
```bash
git add .
git commit -m "chore: version packages"
git push
```

### 4.3 Compilar y verificar

```bash
bun run build
# Verifica qué se va a publicar (debe incluir solo dist, README, LICENSE):
npm pack --dry-run --workspace=@pageflip/core
npm pack --dry-run --workspace=@pageflip/react
# o para todos:
bunx changeset status
```

### 4.4 Publicar

```bash
bun run release
# equivale a: bun run build && bunx changeset publish
# Alternativa manual:
# bunx changeset publish
```

Te pedirá el código OTP si tienes 2FA. Al terminar verás:

```
New tag: @pageflip/core@0.1.0
New tag: @pageflip/react@0.1.0
```

Verifica:
```bash
npm view @pageflip/core version
npm view @pageflip/react version
```

### 4.5 Crear el tag en Git

```bash
git push --follow-tags
# o crea release en GitHub a partir del tag
```

## 5. Publicación manual (sin changesets, solo para hotfix)

No recomendado, pero útil para entender qué pasa por debajo:

```bash
bun run build
cd packages/core
npm publish --access public
cd ../react
npm publish --access public
```

> Nunca uses `npm publish` desde la raíz, el root es `private`.

## 6. Automatizar con GitHub Actions (opcional)

Este repo usa `develop` para integración y `master` para producción. Solo `master` publica a npm.

Crea `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write # para provenance/OIDC
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: bunx changeset publish
          commit: "chore: version packages"
          title: "chore: version packages"
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Necesitas crear un `NPM_TOKEN` y guardarlo en GitHub > Settings > Secrets.

> **⚠️ Aviso npm (Ago 2026 / Ene 2027): `npm tokens that bypass 2FA are being restricted`**
> npm está eliminando los **Classic Tokens que se saltan el 2FA**.
> - **Ago 2026:** ya no se podrán crear tokens clásicos con bypass de 2FA y los existentes empezarán a expirar.
> - **Ene 2027:** `npm publish` con esos tokens fallará.
>
> **Recomendación para este repo:**
> 1.  No uses `Classic Token`. Crea un **Granular Access Token** en https://www.npmjs.com/settings/tokens -> `Generate New Token` -> `Granular` -> selecciona solo `Read and Write` sobre `@pageflip/*` (o `pageflip` si usas nombre sin scope) con expiración corta (30-90 días).
> 2.  **Opción ideal (Trusted Publishing / OIDC):** evita guardar tokens. En npmjs.com > tu paquete/org > `Trusted Publishers` conecta tu repo de GitHub (`ignaciobockl/pageflip`) y workflow `.github/workflows/release.yml`. En el workflow usa `permissions: id-token: write` y no necesitas `NPM_TOKEN` — npm verifica OIDC automáticamente y respeta 2FA sin token.
> 3.  Activa 2FA en `Authorization and Publishing` (npmjs.com > Settings > Two-Factor Authentication).

## 7. Buenas prácticas y errores comunes

| Problema | Solución |
|---|---|
| `402 Payment Required` | Falta `--access public` en el primer publish del scope |
| `E403 scope not found` | Crea la org `@pageflip` en npmjs.com primero |
| `You cannot publish over the previously published version` | Ya existe esa versión, usa `bunx changeset` para subir a la siguiente |
| `files` incluye `src` | Revisa `package.json:16` `files: ["dist"]` — solo se debe publicar `dist` |
| Olvidaste `build` | Siempre `bun run build` antes de `publish`, si no subes `dist` vacío |

## 8. Estrategia de ramas para este repo (`develop` / `master`)

> Tu repo: `develop` = integración (https://github.com/ignaciobockl/pageflip), `master` = producción. Ya tienes la org `@pageflip` reservada, no hay apuro por publicar.

**¿Subo código ahora aunque esté en desarrollo? Sí, a `develop`.**

- **Día a día:** trabaja en `feature/*` -> PR -> `develop`. Haz push frecuente a `develop` (CI hace `build + test`, no publica). Commit con conventional commits (`feat:`, `fix:`).
- **Versionado:** en `develop` o en la feature ejecuta `bunx changeset` para describir el cambio. Commitea el archivo `.changeset/*.md`. No ejecutes `bun run version` en `develop`.
- **Release a producción:** cuando `develop` esté estable, abre `PR: develop -> master`. Al mergear a `master`, el workflow de la sección 6 crea automáticamente un PR `chore: version packages` o publica directo si ya hay changesets. Solo `master` ejecuta `bun run release` / `bunx changeset publish`.
- **Primer publish:** mantén `0.0.0` en `develop` hasta el MVP. El primer bump a `0.1.0` ocurre en el primer merge a `master`.

**Bet a desde `develop` (opcional):**
Si quieres que testers prueben sin tocar `latest`:
```bash
bunx changeset pre enter next  # en develop
bun run version                # publica 0.1.0-next.0
npm install @pageflip/core@next
bunx changeset pre exit        # para volver a stable antes del merge a master
```

**Config actualizada:** `.changeset/config.json:8` ahora es `"baseBranch": "master"` (antes `main`). Protege `master` en GitHub: Settings > Branches > Require pull request from `develop` + Require status checks.

## 9. Checklist pre-publicación

- [ ] `npm whoami` ok (usuario `ignaciobockl`, dueño de org `pageflip`)
- [ ] Estás en `master` (no en `develop`) y `develop` ya mergeado
- [ ] `bunx changeset` creado y commiteado
- [ ] `bun run version` ejecutado (no queda ningún `0.0.0`)
- [ ] `bun run build` sin errores y `tsc --noEmit` ok
- [ ] `npm pack --dry-run` revisado
- [ ] `bun run release` ejecutado (solo desde `master`)
- [ ] `npm view @pageflip/core` muestra la nueva versión
- [ ] `git push --follow-tags` y GitHub Release creado

## 10. Referencias

- Docs npm publish: https://docs.npmjs.com/cli/v10/commands/npm-publish
- Changesets: https://github.com/changesets/changesets
- Config actual: `.changeset/config.json`
- Scripts: `package.json:32-33`
