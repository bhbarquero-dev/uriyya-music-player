import { createLibraryFixture } from "./support/fixtures.js";
import { ensureEdgeDriver } from "./support/edgeDriver.js";
import path from "node:path";
import { appBinary, e2eTauriDir } from "./support/paths.js";
import { restoreSettings, seedSettings } from "./support/settingsSeed.js";
import { DRIVER_HOST, DRIVER_PORT, startTauriDriver, stopTauriDriver } from "./support/tauriDriver.js";

export const config = {
    runner: "local",
    specs: ["./specs/**/*.e2e.js"],
    // Una sola ventana de la app a la vez: el estado vive en un archivo de
    // configuración compartido, así que las sesiones no pueden solaparse.
    maxInstances: 1,

    capabilities: [{
        "tauri:options": {
            application: appBinary(),
        },
    }],

    hostname: DRIVER_HOST,
    port: DRIVER_PORT,
    path: "/",

    logLevel: "warn",
    // Los logs quedan como artefacto del job de CI cuando algo falla.
    outputDir: path.join(e2eTauriDir, "logs"),
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: "mocha",
    reporters: ["spec"],
    mochaOpts: {
        ui: "bdd",
        // Arrancar el binario real es bastante más lento que jsdom o Chromium
        // headless, y en CI se suma el arranque en frío bajo xvfb.
        timeout: 60000,
    },

    /**
     * Todo el arnés vive acá y no en un hook de Mocha a propósito: para cuando
     * corre `before`, la app ya arrancó y el useEffect de Library.tsx ya leyó el
     * store. Sembrar después sería sembrar tarde.
     */
    onPrepare: async () => {
        const libraryPath = createLibraryFixture();
        seedSettings(libraryPath);

        const nativeDriver = process.platform === "win32" ? await ensureEdgeDriver() : undefined;
        await startTauriDriver({ nativeDriver });
    },

    /**
     * Corre pase o falle la suite, incluso si la sesión nunca llegó a abrirse.
     * Es lo que garantiza que el settings.json real del usuario vuelva a su lugar.
     */
    onComplete: () => {
        stopTauriDriver();
        restoreSettings();
    },
};
