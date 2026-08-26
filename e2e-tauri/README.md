# E2E con IPC real de Tauri (WebDriver)

Esta suite corre contra el **binario real** de la aplicación, con un webview real y el puente IPC de Tauri funcionando. Es distinta de `e2e/`, que usa Playwright contra el servidor de desarrollo de Vite en un Chromium normal, donde `window.__TAURI_INTERNALS__` no existe y todo el acceso a disco está mockeado.

No se mockea nada acá: ni `fs`, ni `store`, ni `path`. El único arnés es un archivo de configuración sembrado en disco antes de que arranque la aplicación.

## Qué prueba hoy

`specs/library-autoload.e2e.js` verifica la auto-carga de la biblioteca al arrancar:

1. Se siembra un `settings.json` con `library.path` apuntando a una biblioteca de prueba generada.
2. Se lanza la app. Al montar, `src/components/sidebar/library/Library.tsx` dispara la cadena real: `plugin:store|load` + `plugin:store|get` → `plugin:fs|read_dir` → `plugin:path|join`.
3. El test verifica que la barra lateral muestre el nombre de la biblioteca y las tres canciones del fixture, en el orden del `Intl.Collator` del escáner, ignorando el archivo que no es audio.

Si el IPC no funcionara de verdad, `getLibraryPath()` se traga el error y devuelve `null`, la barra lateral mostraría "No hay biblioteca seleccionada" y el test fallaría. No hay forma de que pase por accidente.

## Requisitos

- `tauri-driver`:
  ```bash
  cargo install tauri-driver --locked
  ```
- **Windows**: nada más. `support/edgeDriver.js` lee la versión del WebView2 Runtime instalado del registro y descarga el `msedgedriver` que le corresponde desde el CDN oficial de Microsoft, cacheándolo en `.drivers/<versión>/`. Para usar uno propio, definir `TAURI_NATIVE_DRIVER` con la ruta al ejecutable.
- **Linux**: `WebKitWebDriver` y un servidor gráfico:
  ```bash
  sudo apt-get install -y webkit2gtk-driver xvfb
  ```
- **macOS**: `tauri-driver` no lo soporta. Esta suite no corre en Mac.

## Ejecutar

```bash
pnpm test:e2e:tauri:build   # compila el binario de depuración (una vez, o tras cambiar el código)
pnpm test:e2e:tauri         # corre la suite
```

En Linux hay que envolver la segunda con `xvfb-run -a`, como hace el CI.

`test:e2e:tauri` no reconstruye a propósito: en CI el binario ya lo produjo el paso anterior del job, y localmente rehacer el build del frontend en cada iteración es tiempo perdido. Si cambiaste código de la app y no ves el cambio reflejado, te falta correr el build.

## Sobre tu `settings.json`

**Esta suite escribe en el directorio de configuración real de la aplicación**, el mismo que usa la app que tenés instalada:

- Windows: `%APPDATA%\com.bhbarquero-dev.uriyya-music-player-tauri\settings.json`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/com.bhbarquero-dev.uriyya-music-player-tauri/settings.json`

No se puede redirigir con variables de entorno en Windows, porque Tauri resuelve esa ruta con `SHGetKnownFolderPath` e ignora `%APPDATA%`. Por eso `support/settingsSeed.js` respalda tu archivo a `settings.json.e2e-bak` antes de pisarlo y lo restaura al terminar, desde `onComplete`, que corre pase o falle la suite.

Si alguna vez matás la corrida a la fuerza y tu biblioteca aparece cambiada, el original está en ese `.e2e-bak`: renombralo de vuelta a `settings.json`.

## Estructura

| Archivo | Rol |
| --- | --- |
| `wdio.conf.js` | Configuración de WebdriverIO y todo el arnés de arranque y limpieza |
| `support/paths.js` | Rutas del repositorio y resolución del binario de depuración |
| `support/fixtures.js` | Genera la biblioteca de prueba y los `.wav` de silencio |
| `support/settingsSeed.js` | Respalda, siembra y restaura el `settings.json` |
| `support/edgeDriver.js` | Resuelve el `msedgedriver` que coincide con el WebView2 (solo Windows) |
| `support/tauriDriver.js` | Levanta y baja `tauri-driver` |
| `specs/` | Los tests |

El sembrado va en `onPrepare` y no en un hook `before` de Mocha: para cuando corre `before`, la app ya arrancó y el `useEffect` de `Library.tsx` ya leyó el store. Sembrar ahí sería sembrar tarde.

`fixtures/`, `.drivers/` y `logs/` se generan y están ignorados por git.

## Agregar un test

El siguiente escenario de mayor valor es la carga de una playlist `.alb`, que cubre `plugin:fs|read_file` y `plugin:fs|exists` y, sobre todo, la validación real de archivos faltantes (la clase `invalid` en `SongRow`). Necesita interceptar el diálogo nativo, que no se puede automatizar: se envuelve `window.__TAURI_INTERNALS__.invoke` desde `browser.execute()` para atajar solo `plugin:dialog|open` y devolver una ruta fija, dejando todo el resto de los comandos yendo al backend real.

Ver `docs/plan-e2e-real-ipc.md` para el detalle y el resto de los escenarios evaluados.
