# Post-Publication Checklist

## Después del primer publish a npm

Este checklist es para completar después de que los paquetes `@pageflip/*` se hayan publicado exitosamente en npm.

---

## 1. ✅ Verificar packages en npm

```bash
npm view @pageflip/core version
npm view @pageflip/react version
npm view @pageflip/renderers version
# Deberían mostrar 0.1.0 o la versión publicada
```

**Marca cuando:** Todos los paquetes aparezcan en npm

---

## 2. ⏳ Configurar Trusted Publishing (OIDC)

**Por qué:** Evitar problemas con la deprecación de tokens clásicos (expires ene-2027)

**Dónde:** https://www.npmjs.com/settings/pageflip/member-roles

**Pasos:**
- [ ] Navega a Settings de la organización `@pageflip`
- [ ] Busca "Trusted publishers" o "Trusted publishing"
- [ ] Click "Add Trusted Publisher"
- [ ] Rellena:
  - Repository Owner: `ignaciobockl`
  - Repository Name: `pageflip`
  - Repository Ref: `refs/heads/master` (o `*`)
  - Workflow Filename: `.github/workflows/release.yml`
- [ ] Click "Add Trusted Publisher"

**Alternativa si no encuentras en org level:** Configura en cada paquete individual:
- https://www.npmjs.com/package/@pageflip/core/settings → Trusted Publishers
- (Repetir para react, theme, web-component, renderers*)

**Marca cuando:** Trusted Publisher agregado y confirmado

---

## 3. ⏳ Verificar 2FA en npm

**Dónde:** https://www.npmjs.com/settings/authentication

**Pasos:**
- [ ] Abre Settings → Two-Factor Authentication
- [ ] Confirma que está **Enabled**
- [ ] Selecciona "Authorization and Publishing" (no solo "Auth only")
- [ ] Si no está habilitado: sigue los pasos para agregar 2FA con tu app de autenticación

**Marca cuando:** 2FA confirmado como activo

---

## 4. ⏳ Prueba: Push a master para gatillar release.yml

**Por qué:** Verificar que el workflow publica correctamente con Trusted Publishing + 2FA

**Pasos:**
```bash
git log --oneline -1 develop  # anota el commit actual
git push origin develop       # asegúrate que develop esté pushed
git push origin develop:master  # o: git merge develop && git push origin master
```

**Qué debería pasar:**
- ✅ GitHub ejecuta `.github/workflows/release.yml`
- ✅ CI pasa (lint, tests, build)
- ✅ `bun run release` publica los paquetes
- ✅ No pidió `NPM_TOKEN` (eso significa que OIDC/Trusted Publishing funcionó)

**Marca cuando:** El workflow completó exitosamente

---

## 5. ⏳ Verificar provenance badge en npm

**Dónde:** https://www.npmjs.com/package/@pageflip/core

**Qué buscar:** Un badge o link que diga "Provenance" o "Published from GitHub"

**Marca cuando:** El badge aparece en la página del paquete

---

## 6. ⏳ Verificar que npm recogne los archivos correctos

**Por qué:** Asegurar que LICENSE + README se empaquetaron

**En tu máquina:**
```bash
npm pack --dry-run --workspace=@pageflip/core
npm pack --dry-run --workspace=@pageflip/react
# Busca en la salida que incluya:
#   README.md
#   LICENSE
#   dist/
```

O visualmente en npm.com:
- Abre https://www.npmjs.com/package/@pageflip/core
- Scroll down a la sección "Files"
- Deberías ver `LICENSE`, `README.md`, `dist/` listados

**Marca cuando:** LICENSE y README aparecen en los tarballs

---

## 7. ⏳ Documentar cambios finales (opcional)

Si necesitas hacer ajustes post-publish (cambios de README, LICENSE, etc.):

```bash
bunx changeset
# Describe qué cambió
bun run version
git push origin master  # gatilla nuevo publish
```

**Marca cuando:** Cambios publicados

---

## Notas

- **Trusted Publishing**: Si no logras encontrarlo en Settings de la org, busca en cada paquete individual después del primer publish
- **2FA**: Es requerido por npm para Trusted Publishing
- **Provenance**: Solo aparece si Trusted Publishing está correctamente configurado + 2FA activo
- **Cambios**: Cualquier futuro bump de versión simplemente hace `git push origin master` (el workflow maneja todo)

---

**Creado:** 2026-08-29
**Tipo:** Post-publication verification checklist
