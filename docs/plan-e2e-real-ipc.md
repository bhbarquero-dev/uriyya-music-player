# Plan: E2E con IPC real de Tauri (carga de playlist + reproducción)

## Contexto

`e2e/arrow-navigation.spec.ts` corre con Playwright contra `pnpm dev` en Chromium normal (`playwright.config.ts`, `baseURL: http://localhost:1420`). Esto es un navegador sin `window.__TAURI__`: no hay puente IPC real. Todo lo que toca `@tauri-apps/plugin-fs`, `plugin-dialog` o `plugin-store` está probado solo con mocks (`test/logic/FileService.test.ts`, `test/logic/TauriFileSystem.test.ts`, `test/logic/Library.test.ts`).

Objetivo: agregar al menos una prueba E2E que corra contra el binario real de Tauri (webview real) y ejercite IPC real para el escenario "cargar playlist desde disco", que es el hueco identificado.

No cubre (fuera de alcance de este plan): automatizar el diálogo nativo de selección de archivo/carpeta (`plugin-dialog`), CI multiplataforma completo, pruebas de audio con hardware real de sonido.

## Por qué este escenario y no otro

Reproducción de audio real (decodificar mp3, medir tiempo) es frágil en CI headless y no aporta mucho sobre lo que ya cubre `useAudioPlayback.test.ts` con mocks de `HTMLAudioElement`. La parte que las pruebas unitarias **no pueden** verificar es si `readTextFile` / `exists` / lectura de settings realmente funcionan contra el sistema de archivos real a través del puente IPC de Tauri. Esa es la prueba de mayor valor con menor esfuerzo.

## Dependencias nuevas

- `tauri-driver` (crate de Rust, se instala con `cargo install tauri-driver`, no es dependencia de proyecto).
- `webdriverio` (`@wdio/cli`, `@wdio/mocha-framework`, `@wdio/local-runner`, `@wdio/spec-reporter`) como devDependencies.
- Driver nativo según plataforma:
  - Windows: `msedgedriver` (WebView2), debe coincidir versión con el WebView2 runtime instalado.
  - Linux: `WebKitWebDriver` (viene con `webkit2gtk-driver`).
  - macOS: no soportado oficialmente por `tauri-driver` a fecha de este plan — si CI es solo Windows/Linux, no bloquea.

## Pasos

### 1. Instalar y configurar tauri-driver

- `cargo install tauri-driver --locked`.
- En Windows, descargar `msedgedriver.exe` con versión igual al WebView2 instalado, dejarlo en PATH o pasar `--native-driver` a `tauri-driver`.
- Confirmar que `pnpm tauri build --debug` genera el binario en `src-tauri/target/debug/uriyya-music-player-tuari.exe` (nombre del binario según `src-tauri/Cargo.toml:2`).

### 2. Carpeta de pruebas separada

Crear `e2e-tauri/` (separado de `e2e/` de Playwright, que sigue apuntando al dev server):

```
e2e-tauri/
  wdio.conf.ts
  fixtures/
    sample-song.mp3       # clip corto real, pocos KB, silencio o tono
    sample-playlist.alb   # una línea con ruta absoluta a sample-song.mp3, generada en setup
  specs/
    load-playlist.spec.ts
```

`sample-playlist.alb` no puede tener ruta fija hardcodeada (la ruta absoluta cambia por máquina/CI). Generarlo en un hook `before` del spec, escribiendo la ruta absoluta real de `fixtures/sample-song.mp3` resuelta en tiempo de ejecución.

### 3. wdio.conf.ts

Configurar `capabilities` con `tauri:options.application` apuntando al binario compilado en debug, y `hostname/port` apuntando a `tauri-driver` levantado como `onPrepare`/`before` hook (patrón estándar documentado por Tauri: https://tauri.app/develop/tests/webdriver/example/webdriverio/). Puntos clave:

- `services` o hook manual que haga `spawn('tauri-driver')` antes de la suite y lo mate al terminar.
- `capabilities: [{ 'tauri:options': { application: '<ruta al binario debug>' } }]`.
- Un solo `framework: mocha` (o el que ya use el resto si se prefiere unificar), timeout generoso (arranque de webview real es más lento que jsdom).

### 4. Test: `load-playlist.spec.ts`

Escenario mínimo, sin tocar el diálogo nativo:

1. Antes del test, escribir `fixtures/sample-playlist.alb` con la ruta absoluta real a `sample-song.mp3`.
2. Lanzar la app (la hace `wdio` vía `tauri-driver` al iniciar sesión).
3. En vez de simular el click en "abrir playlist" + diálogo nativo (frágil), usar `browser.execute()` para invocar directamente el mismo flujo que dispara `FileService`/`useFileLoader` pero pasándole la ruta del fixture — si el código actual solo expone la carga vía diálogo (`open()` de `plugin-dialog`), evaluar una de estas dos vías:
   - (a) Exponer temporalmente en `window` (solo en build de test/debug, detrás de un flag) una función que reciba una ruta y dispare `loadPlaylist(path)` saltándose el diálogo. Mínimo cambio de producción, evitar si es posible.
   - (b) Mockear a nivel de WebView el plugin de diálogo antes de que la app arranque, inyectando vía `browser.execute()` un stub de `window.__TAURI_INTERNALS__` que intercepte solo la llamada de `dialog|open` y devuelva la ruta fija, dejando el resto de comandos (`fs|readTextFile`, `fs|exists`, `store|get`) yendo al backend real. Preferible: no toca código de producción, solo el arnés de prueba.
4. Esperar a que aparezca la fila de la canción en la UI (selector ya usado en `e2e/arrow-navigation.spec.ts`: `.song-row`).
5. Assert: el texto de la fila contiene `sample-song.mp3` — confirma que `readTextFile` (parseo del `.alb`) y `exists` (validación de que el archivo existe en disco) real de Tauri funcionaron, no un mock.

Assert opcional para ampliar cobertura de "reproducción" sin audio real:
6. Click en la fila, esperar evento `loadedmetadata` del `<audio>` real vía `browser.execute(() => document.querySelector('audio').duration)`, assert `duration > 0` — confirma que Tauri sirvió el archivo por el protocolo `asset://` real y el navegador decodificó audio real.

### 5. Script npm

Agregar a `package.json`:

```json
"test:e2e:tauri": "wdio run e2e-tauri/wdio.conf.ts"
```

Requiere haber corrido `pnpm tauri build --debug` (o un script previo `pretest:e2e:tauri` que lo haga) antes de ejecutar.

### 6. CI

- Nuevo job separado del `test:e2e` de Playwright (requiere entorno gráfico o `xvfb-run` en Linux, y WebView2 preinstalado en el runner Windows — normalmente ya está en `windows-latest` de GitHub Actions).
- Cachear `src-tauri/target/debug` entre corridas para no recompilar Rust en cada run si no cambió.
- Marcar el job como no bloqueante (`continue-on-error: true`) en una primera iteración, hasta confirmar estabilidad, luego promoverlo a bloqueante.

## Riesgos / puntos a validar antes de comprometerse

- Versión de `msedgedriver` desincronizada del WebView2 instalado rompe la conexión — validar en CI con un paso que imprima ambas versiones.
- Tiempo de arranque del binario real es notablemente más lento que jsdom/Chromium headless — vigilar timeouts default de wdio.
- El stub de `dialog|open` vía `window.__TAURI_INTERNALS__` depende de la forma interna en que `@tauri-apps/api` v2 despacha comandos; verificar contra la versión instalada (`@tauri-apps/api ^2.11.1`) antes de implementar, puede requerir ajuste si cambia entre versiones.
- macOS queda fuera: si el equipo desarrolla también en Mac, este job de CI no da cobertura ahí.

## Criterio de éxito

- `pnpm test:e2e:tauri` corre localmente (Windows) y en CI, lanza el binario real de Tauri, carga una playlist de un archivo real vía IPC real (sin mockear `fs`/`store`), y verifica que la canción aparece en la lista.
- El mock aplicado es únicamente al diálogo nativo de selección de archivo, nunca a `fs` ni `store`.
