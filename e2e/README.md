# E2E Testing with Playwright

Este directorio contiene las pruebas end-to-end (e2e) del Uriyya Music Player utilizando Playwright.

## Descripción

Las pruebas e2e validan el comportamiento de la aplicación en un navegador real, incluyendo:

- **Navegación con teclas de flecha**: Valida que al navegar entre canciones con ArrowUp/ArrowDown, el elemento seleccionado permanece visible en el viewport del contenedor con scroll.
- **Scroll automático**: Verifica que el scroll se ajusta automáticamente cuando el usuario navega más allá del área visible.
- **Límites de la lista**: Verifica que la navegación se comporta correctamente al llegar a la primera y a la última canción.

## Requisitos

- Node.js LTS
- pnpm (habilitado con `corepack enable`)
- Navegadores Playwright instalados

## Instalación

```bash
# Instalar dependencias
pnpm install

# Instalar navegadores de Playwright
pnpm exec playwright install chromium
```

## Ejecutar las pruebas

### Modo headless (por defecto)

```bash
pnpm run test:e2e
```

### Modo UI (interactivo)

```bash
pnpm run test:e2e:ui
```

### Ver el reporte HTML

Después de ejecutar las pruebas, se genera un reporte HTML:

```bash
pnpm exec playwright show-report
```

## Estructura de pruebas

- `arrow-navigation.spec.ts`: Pruebas de navegación con teclas de flecha y validación de scroll

## Notas importantes

1. **Datos simulados**: Las pruebas no usan archivos de música reales. Inyectan en la página una lista de canciones simulada y validan el comportamiento de navegación y scroll sobre ella.

2. **Frontend en navegador**: Las pruebas corren contra el servidor de desarrollo de Vite en `http://localhost:1420` (Playwright lo levanta automáticamente) usando Chromium, no contra la ventana de Tauri, por lo que las APIs nativas no están disponibles.

3. **CI/CD**: Las pruebas se ejecutan automáticamente en el pipeline de CI de GitHub Actions.

## Debugging

Para debugging de pruebas:

```bash
# Ejecutar en modo debug
pnpm exec playwright test --debug

# Ejecutar una prueba específica
pnpm exec playwright test arrow-navigation

# Ver el trace de una prueba fallida
pnpm exec playwright show-trace trace.zip
```

## Agregar nuevas pruebas

Para agregar nuevas pruebas e2e:

1. Crear un nuevo archivo `.spec.ts` en este directorio
2. Importar `test` y `expect` de `@playwright/test`
3. Escribir los test cases
4. Asegurarse de que las pruebas no dependan de archivos de música reales ni de APIs de Tauri

## Referencias

- [Documentación de Playwright](https://playwright.dev)
- [Best Practices de Playwright](https://playwright.dev/docs/best-practices)
