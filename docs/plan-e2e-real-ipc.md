# Plan: primera prueba E2E con IPC real de Tauri

> Revisión 3.
>
> - **Rev 2**: reescrito tras analizar el código y `.github/workflows/ci.yml`. Se elige un escenario distinto (auto-carga de biblioteca en vez de carga de playlist), se elimina la necesidad de mockear el diálogo nativo, y el job de CI pasa a ser un paso dentro del job `validate` existente.
> - **Rev 3**: contrastado contra el [ejemplo de CI oficial de Tauri](https://v2.tauri.app/develop/tests/webdriver/ci/). Se adopta `msedgedriver-tool` para Windows, se confirma que `webkit2gtk-4.1` + `webkit2gtk-driver` es la combinación soportada en Linux, y se agrega una fase 2 con matriz de sistemas operativos.
> - **Rev 4**: ejecutado. Ver "Estado de la implementación" abajo para lo que se construyó y en qué se desvió de lo planeado.

## Estado de la implementación

**Hecho y verde en Windows local.** `pnpm test:e2e:tauri` lanza el binario real, la app lee su `settings.json` y escanea el disco por IPC real, y el test verifica las tres canciones del fixture en la barra lateral. El `settings.json` del desarrollador se restaura correctamente tanto cuando la suite pasa como cuando falla (ambos casos verificados a mano).

**Pendiente de verificar: la corrida en CI (Linux).** No se puede validar localmente; necesita un push que dispare el workflow.

Desvíos respecto de lo planeado, y por qué:

1. **JavaScript ESM en vez de TypeScript + ts-node.** El proyecto es `"type": "module"` y ts-node bajo ESM agrega una capa de fricción que no aporta nada acá: el arnés no comparte tipos con `src/`, y `tsconfig.json` no incluye ni `e2e/` ni `e2e-tauri/` de todos modos. Menos piezas móviles.
2. **`msedgedriver` se descarga del CDN oficial de Microsoft, no vía `msedgedriver-tool`.** `support/edgeDriver.js` lee la versión del WebView2 Runtime del registro y baja el driver correspondiente, cacheado por versión en `.drivers/`. Misma automatización que propone la documentación de Tauri, sin ejecutar un binario de un repositorio personal de terceros sin releases. Se puede saltear con la variable de entorno `TAURI_NATIVE_DRIVER`.
3. **El fixture creció un poco respecto del plan**: tres `.wav` en vez de uno, uno con acentos (verifica que los nombres sobrevivan el viaje por IPC), uno en un subdirectorio (verifica el escaneo recursivo), más un `.txt` que el escaneo tiene que ignorar. El costo es nulo y la señal es bastante mejor.
4. **`pnpm-workspace.yaml`**: `edgedriver` y `geckodriver` (dependencias transitivas de `@wdio/cli`) quedan con los scripts de instalación deshabilitados de forma explícita. Sus postinstall descargan drivers de navegador que esta suite no usa, y sin declarar la decisión `pnpm install` falla.

El spike de `settings.json` que pedía este plan quedó confirmado: la ruta y el formato son los que se documentan más abajo.

## Contexto

`e2e/arrow-navigation.spec.ts` corre con Playwright contra `pnpm dev` en Chromium (`playwright.config.ts`, `baseURL: http://localhost:1420`), es decir, un navegador sin `window.__TAURI_INTERNALS__`: no hay puente IPC. Todo lo que toca `@tauri-apps/plugin-fs`, `plugin-dialog`, `plugin-store` o `@tauri-apps/api/path` está probado solo con mocks (`test/logic/FileService.test.ts`, `test/logic/TauriFileSystem.test.ts`, `test/logic/Library.test.ts`).

Observación adicional sobre la suite Playwright actual: sus tres tests construyen su propio DOM con `page.evaluate` (`injectMockPlaylist`) y luego hacen assert sobre ese mismo DOM inyectado, incluso la "navegación con flechas" está reimplementada en el helper `navigateWithArrow` en vez de disparar teclas reales. No ejercitan `SongList`/`SongRow` ni el handler de teclado de `App.tsx`. Es un problema aparte de este plan, pero conviene anotarlo: hoy el CI no tiene ninguna prueba que ejercite la aplicación real de punta a punta.

Objetivo de este plan: **una** prueba E2E, la más simple posible, que corra contra el binario real de Tauri (webview real) y ejercite IPC real, ejecutable localmente en Windows y en el CI de GitHub Actions. Las siguientes se agregan encima de esta infraestructura.

## Escenario elegido: auto-carga de la biblioteca al arrancar

`src/components/sidebar/library/Library.tsx:20-35` monta un `useEffect` que, sin ninguna interacción del usuario, ejecuta:

1. `Library.getPath()` (`src/logic/Library.ts:13`) → `TauriSettingsStore.getLibraryPath()` → `plugin:store|load` + `plugin:store|get` sobre `settings.json` en disco.
2. Si hay ruta, `Library.getSongs()` → `scanLibraryAudioFiles()` (`src/logic/LibraryScanner.ts:16`) → `plugin:fs|read_dir` por directorio + `plugin:path|join` por entrada.
3. Render de `<li class="sidebar-library-item">` con el nombre de cada archivo.

Por qué este escenario y no la carga de playlist:

- **Cero mocks.** No hay diálogo nativo en el camino, así que no hace falta parchear `window.__TAURI_INTERNALS__` ni exponer nada en `window` desde código de producción. El arnés de prueba solo escribe un archivo en disco antes de lanzar la app.
- **Cero interacción.** El escenario se dispara solo al montar; el test únicamente espera y hace assert. Menos superficie para flakiness mientras se valida que el stack (tauri-driver + WebKitWebDriver/msedgedriver) es estable.
- Ejercita tres plugins reales a la vez (`store`, `fs`, `path`), que es exactamente lo que los tests unitarios no pueden verificar.
- Tiene un modo de fallo limpio: `getLibraryPath()` traga cualquier error y devuelve `null` (`src/logic/TauriSettingsStore.ts:17-19`), con lo que la UI muestra "No hay biblioteca seleccionada". Si el IPC no funciona de verdad, el assert falla; no hay forma de que pase por accidente.

Fuera de alcance de esta primera prueba (ver "Siguientes iteraciones"): carga de `.alb`, diálogos nativos, reproducción de audio real, macOS.

## Piezas nuevas

### Dependencias

- `tauri-driver`: `cargo install tauri-driver --locked`. No es dependencia del proyecto, es un binario.
- devDependencies: `@wdio/cli`, `@wdio/local-runner`, `@wdio/mocha-framework`, `@wdio/spec-reporter`, `ts-node` (wdio compila `.ts` con ts-node).
- Driver nativo por plataforma:
  - **Windows**: `msedgedriver.exe`, versión igual al WebView2 Runtime instalado. En vez de descargarlo a mano, usar `msedgedriver-tool`, que es lo que recomienda el [ejemplo de CI oficial de Tauri](https://v2.tauri.app/develop/tests/webdriver/ci/): `cargo install --git https://github.com/chippers/msedgedriver-tool`, ejecutarlo, y agregar el directorio resultante al PATH. Detecta la versión de WebView2 instalada y baja el driver que corresponde. Sirve igual en local y en CI, y elimina el paso manual de "fijate qué versión tenés". Al ser una dependencia de git de un tercero (repo personal de un maintainer de Tauri, sin release en crates.io), **fijar un rev**: `--git ... --rev <sha>`.
  - **Linux**: `WebKitWebDriver`, del paquete apt `webkit2gtk-driver`. Además `xvfb` para entorno gráfico headless.
  - **macOS**: no soportado por `tauri-driver`. Se documenta; no hay forma de cubrirlo con esta herramienta.

### Estructura de archivos

```
e2e-tauri/
  wdio.conf.ts
  support/
    appBinary.ts        # resuelve la ruta del binario debug según plataforma
    fixtures.ts         # genera la carpeta de biblioteca + el .wav
    settingsSeed.ts     # backup / seed / restore de settings.json
  specs/
    library-autoload.spec.ts
  fixtures/             # generado, va a .gitignore
  tsconfig.json
```

`tsconfig.json` raíz incluye solo `["src", "test"]`, así que `pnpm exec tsc --noEmit` no toca `e2e-tauri/`, igual que hoy no toca `e2e/`. El tsconfig local es para ts-node.

### Fixture de biblioteca

`support/fixtures.ts` genera en tiempo de ejecución `e2e-tauri/fixtures/library/01 - test-tone.wav`: un WAV PCM 16-bit mono, 0.5 s de silencio (~44 KB), escrito byte a byte desde Node. Sin binarios versionados en el repo.

Se usa `.wav` y no `.mp3` porque ambos están soportados (`src/logic/audioFormats.ts:1`) y el WAV no depende de códecs de GStreamer en el runner de Linux. El nombre lleva espacios y guiones a propósito: pasa por `join` y por el `Intl.Collator` del scanner.

### Sembrado de `settings.json` — el punto delicado

`TauriSettingsStore` hace `load("settings.json")` (`src/logic/TauriSettingsStore.ts:3,8`), y `tauri-plugin-store` resuelve esa ruta relativa contra el *app config dir*, que Rust deriva del identifier `com.bhbarquero-dev.uriyya-music-player-tauri` (`src-tauri/tauri.conf.json`):

- Windows: `%APPDATA%\com.bhbarquero-dev.uriyya-music-player-tauri\settings.json`
- Linux: `${XDG_CONFIG_HOME:-$HOME/.config}/com.bhbarquero-dev.uriyya-music-player-tauri/settings.json`

Contenido a sembrar: `{"library.path":"<ruta absoluta a e2e-tauri/fixtures/library>"}`.

**Riesgo y mitigación:** correr esta prueba en la máquina de un desarrollador sobrescribe su `settings.json` real y le borra la biblioteca configurada. `settingsSeed.ts` debe, en este orden:

1. Si el archivo existe, moverlo a `settings.json.e2e-bak`.
2. Escribir el archivo de fixture.
3. Al terminar la suite —pase o falle— borrar el fixture y restaurar el backup si existe.

La restauración va en `onComplete` de `wdio.conf.ts` (y no solo en un `after` de mocha) para que también corra si la sesión revienta al arrancar. En Linux se puede reforzar seteando `XDG_CONFIG_HOME` a un directorio temporal antes de spawnear `tauri-driver` (la app hereda el env), pero en Windows eso no sirve: Tauri resuelve el config dir vía `SHGetKnownFolderPath`, que ignora `%APPDATA%`. Por eso el backup/restore es obligatorio en ambas plataformas y el override de env es solo un refuerzo opcional.

**Spike previo (5 min, antes de escribir el código):** abrir la app, elegir una biblioteca con el botón `+`, y confirmar en disco la ruta exacta y el formato JSON exacto que escribe el plugin. El plan asume `{"library.path":"..."}` plano; confirmarlo evita depurar a ciegas.

### Ruta del binario

El binario debug se llama según el `package.name` de `src-tauri/Cargo.toml:2`, que tiene el typo consolidado del repo: `uriyya-music-player-tuari`. Verificado en disco: `src-tauri/target/debug/uriyya-music-player-tuari.exe` en Windows; en Linux, el mismo nombre sin extensión. Con `--no-bundle` no se renombra a `productName`.

`appBinary.ts` resuelve `process.platform === 'win32' ? '...exe' : '...'` y **falla con un mensaje explícito** ("corré `pnpm test:e2e:tauri:build` primero") si el archivo no existe, en vez de dejar que wdio muera con un error opaco de sesión.

### `wdio.conf.ts`

- `onPrepare`: `spawn('tauri-driver', ['--port', '4444'])` (más `--native-driver` en Windows si se pasa por env). Guardar el proceso; matarlo en `onComplete` y también en `process.on('exit')` para no dejar el driver colgado si se aborta la corrida.
- `onPrepare` (antes del spawn): generar fixtures y sembrar `settings.json`. **Tiene que ser acá, no en un `before` de mocha**: cuando corre el `before` de mocha la app ya arrancó y el `useEffect` de `Library.tsx` ya leyó el store.
- `capabilities: [{ 'tauri:options': { application: appBinary() } }]`, `hostname: '127.0.0.1'`, `port: 4444`, `path: '/'`.
- `framework: 'mocha'`, `mochaOpts.timeout: 60000`, `waitforTimeout: 15000`, `maxInstances: 1`.
- `reporters: ['spec']`.

### El spec

`specs/library-autoload.spec.ts`, un solo test:

1. Esperar `.app-container` (la app montó).
2. `$('.sidebar-selected-item-text')` existe y su texto es `library` — confirma que `plugin:store|get` devolvió la ruta sembrada.
3. Esperar a que desaparezca `Buscando canciones...` y que `$$('.sidebar-library-item')` tenga al menos un elemento cuyo texto sea `01 - test-tone.wav` — confirma que `plugin:fs|read_dir` + `plugin:path|join` leyeron el disco real.

Assert negativo implícito: si el IPC falla, la UI renderiza `No hay biblioteca seleccionada` y el paso 2 falla por timeout.

### Scripts de npm

```json
"test:e2e:tauri:build": "pnpm tauri build --debug --no-bundle",
"test:e2e:tauri": "wdio run e2e-tauri/wdio.conf.ts"
```

Deliberadamente **sin** `pretest:e2e:tauri`: en CI el binario ya se construyó en el paso anterior del job y no queremos reconstruir el frontend. Localmente se documenta correr el build una vez y después iterar solo con `test:e2e:tauri`.

## CI

### Fase 1: Linux, como pasos dentro de `validate`

Va como pasos dentro del job `validate` existente (`.github/workflows/ci.yml`), después de `Verify Tauri build (debug mode)`, que es justamente el paso que produce el binario que la prueba necesita. Así se reutiliza el build de Rust, el cache de `Swatinem/rust-cache` y el `pnpm install` que ya están en ese job; el costo incremental es solo la instalación de `tauri-driver` y de los paquetes apt.

Cambios concretos:

1. En el paso `Install system dependencies` (`awalsh128/cache-apt-pkgs-action`), agregar `webkit2gtk-driver` y `xvfb` a `packages`, y bumpear `version: 1.0` → `1.1` para invalidar el cache de apt. Son exactamente los dos paquetes extra que agrega el ejemplo oficial de Tauri sobre las dependencias normales de compilación.
2. Nuevo paso `Install tauri-driver`: `cargo install tauri-driver --locked`. `Swatinem/rust-cache` cachea `~/.cargo/bin` (opción `cache-bin`, activa por defecto), así que solo compila la primera vez; presupuestar ~1 min en frío. La versión de `tauri-driver` es independiente de la versión de Tauri del proyecto, así que no hace falta pinearla contra `tauri 2.10.1`.
3. Nuevo paso `Run Tauri WebDriver E2E`: `xvfb-run -a pnpm test:e2e:tauri`, con `continue-on-error: true` en la primera iteración. (El ejemplo oficial usa `xvfb-run` pelado; `-a` elige un número de display libre automáticamente y evita colisiones, conviene mantenerlo.)
4. Nuevo paso de subida de logs de wdio con `if: always()`.

`continue-on-error: true` se quita —promoviendo la prueba a bloqueante— recién cuando haya al menos ~10 corridas verdes seguidas en PRs reales. Mientras tanto el paso da señal sin bloquear merges.

Notar que `paths-ignore` del workflow incluye `docs/**`, así que este documento por sí solo no dispara CI; el PR que agregue `e2e-tauri/` sí.

### Fase 2: agregar Windows (matriz)

**Sí vale la pena, pero después de que Linux esté verde.** Razones para hacerlo:

- `cd.yml` y `release.yml` publican para `macos-15`, `ubuntu-22.04` y `windows-latest`. macOS es incubrible con `tauri-driver`, así que una matriz Linux + Windows es la cobertura máxima alcanzable: 2 de 3 plataformas que efectivamente se distribuyen.
- No es redundancia. Linux corre WebKitGTK y Windows corre WebView2 (Chromium): son motores distintos de verdad. Un bug de la app en WebView2 no lo ve el job de Linux, y viceversa. Además Windows es la plataforma de desarrollo diaria.
- El ejemplo oficial de Tauri usa exactamente esa matriz (`[ubuntu-latest, windows-latest]`) con `fail-fast: false`.

Razones para **no** hacerlo en la primera iteración: `tauri-driver` está declarado experimental, y arrancar depurando dos stacks de driver a la vez multiplica el trabajo de diagnóstico. Además Windows necesita su propio job completo (checkout, node, rust, `pnpm install`, build debug de Rust) porque no puede colgarse de `validate`, que es Linux.

La migración cuando llegue el momento: sacar los pasos de la fase 1 de `validate` y crear un job `webdriver-e2e` con `strategy.matrix.platform: [ubuntu-22.04, windows-latest]` y `fail-fast: false`, siguiendo el ejemplo oficial. Se paga un build debug de Rust extra en Linux (cacheado por `rust-cache`), a cambio de un job con nombre propio en el PR y reporte por plataforma. `ubuntu-22.04` y no `ubuntu-latest` para que la plataforma probada sea la misma que la que se publica en `cd.yml`.

## Riesgos y qué validar antes de comprometerse

1. **`tauri-driver` + `WebKitWebDriver` en `ubuntu-22.04` con webkit2gtk-4.1.** Sigue siendo el riesgo principal —`tauri-driver` está declarado experimental por el propio proyecto Tauri— pero baja bastante: el ejemplo oficial usa `libwebkit2gtk-4.1-dev` + `webkit2gtk-driver` y funciona. La diferencia es que ellos corren en `ubuntu-latest` (24.04) y nosotros en `ubuntu-22.04`, para igualar lo que publica `cd.yml`. Validar con un spike en una rama antes de dar el plan por bueno; si falla ahí, probar `ubuntu-24.04` antes de descartar el approach, ya que esa es la combinación documentada.
2. **Sobrescritura del `settings.json` real** del desarrollador (ver mitigación arriba). Es el riesgo con más impacto directo sobre el usuario, y no lo cubre ninguna guía oficial porque es específico de esta app.
3. **Windows: versión de `msedgedriver` vs WebView2.** Era el segundo riesgo del plan; `msedgedriver-tool` lo resuelve resolviendo la versión automáticamente. Riesgo residual: es una dependencia de git de un repo personal, sin releases ni crates.io. Mitigación: fijar `--rev` a un commit concreto y revisarlo al actualizar.
4. **Vigencia de la imagen `ubuntu-22.04`** en GitHub Actions: verificar que siga disponible. Si está por retirarse, la migración afecta también a `cd.yml` y `release.yml`, que la usan; es una decisión más amplia que este plan.
5. **Tiempo de arranque** del binario real, bastante mayor que jsdom o Chromium headless: de ahí los timeouts holgados en `wdio.conf.ts`.
6. **macOS sin cobertura**, por límite de `tauri-driver`. Es la única de las tres plataformas publicadas que queda sin prueba E2E real.

## Siguientes iteraciones (no ahora)

- **Carga de playlist `.alb`**: click en "abrir playlist" con un stub que intercepte *solo* `plugin:dialog|open` y deje pasar el resto. Verificado contra `@tauri-apps/api@2.11.1`: el despacho es `window.__TAURI_INTERNALS__.invoke(cmd, args, options)` (`node_modules/@tauri-apps/api/core.js:202`) y el comando exacto es `plugin:dialog|open` (`plugin-dialog/dist-js/index.js:85`), así que envolver `__TAURI_INTERNALS__.invoke` desde `browser.execute()` antes del click es viable. Nota: `TauriFileSystem` usa `readFile` (`plugin:fs|read_file`), no `readTextFile` — la revisión 1 de este plan decía lo contrario. Assert de más valor: la fila renderiza **sin** la clase `invalid` (`src/components/songList/SongRow.tsx:22,51`), lo que prueba que `plugin:fs|exists` real devolvió `true`.
- **Reproducción real**: doble click en la fila y assert de `document.querySelector('audio').duration > 0`, que valida el protocolo `asset://`. En Linux headless depende de plugins de GStreamer; dejarlo para después de que el stack básico sea estable.
- **Job de Windows** (ver "Fase 2" arriba).
- **Rehacer los specs de Playwright** para que ejerciten la app real en vez de DOM inyectado, o migrarlos a esta suite.
- macOS, si aparece soporte en `tauri-driver`.

## Criterio de éxito

- `pnpm test:e2e:tauri` corre en Windows local y en el job `validate` del CI.
- Lanza el binario real de Tauri, la app lee `settings.json` y escanea una carpeta real vía IPC real, y el test verifica que la canción del fixture aparece en la barra lateral.
- No se mockea nada: ni `fs`, ni `store`, ni `path`, ni el diálogo. El único arnés es un archivo sembrado en disco antes del arranque.
- El `settings.json` del desarrollador queda intacto después de correr la suite, incluso si la suite falla.
