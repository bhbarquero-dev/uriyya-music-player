import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** Debe coincidir con `identifier` en src-tauri/tauri.conf.json. */
const IDENTIFIER = "com.bhbarquero-dev.uriyya-music-player-tauri";

/** Debe coincidir con SETTINGS_FILE_NAME en src/logic/TauriSettingsStore.ts. */
const SETTINGS_FILE_NAME = "settings.json";

/** Debe coincidir con LIBRARY_PATH_KEY en src/logic/TauriSettingsStore.ts. */
const LIBRARY_PATH_KEY = "library.path";

const BACKUP_SUFFIX = ".e2e-bak";

/**
 * Reproduce el directorio de configuración que resuelve Tauri en Rust
 * (`dirs::config_dir()` + identifier), que es donde tauri-plugin-store escribe
 * cuando se le pasa una ruta relativa.
 */
function appConfigDir() {
    if (process.platform === "win32") {
        const appData = process.env.APPDATA;
        if (!appData) {
            throw new Error("APPDATA no está definido; no se puede resolver el directorio de configuración.");
        }
        return path.join(appData, IDENTIFIER);
    }

    if (process.platform === "darwin") {
        return path.join(os.homedir(), "Library", "Application Support", IDENTIFIER);
    }

    const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
    return path.join(xdgConfigHome, IDENTIFIER);
}

function settingsFile() {
    return path.join(appConfigDir(), SETTINGS_FILE_NAME);
}

function backupFile() {
    return settingsFile() + BACKUP_SUFFIX;
}

/**
 * Deja en disco un settings.json que apunta a la biblioteca de prueba, para que
 * la app la cargue sola al arrancar.
 *
 * Esta prueba escribe en el directorio de configuración REAL del usuario: en
 * Windows no se puede redirigir por variable de entorno, porque Tauri resuelve
 * la ruta con SHGetKnownFolderPath e ignora %APPDATA%. Por eso se respalda el
 * archivo original antes de pisarlo y se restaura al terminar.
 */
export function seedSettings(libraryPath) {
    const settings = settingsFile();
    const backup = backupFile();

    mkdirSync(path.dirname(settings), { recursive: true });

    if (existsSync(settings)) {
        if (existsSync(backup)) {
            // Ya hay un respaldo de una corrida anterior que no llegó a restaurar:
            // el archivo actual es el sembrado por esa corrida, no el del usuario.
            // Se descarta sin tocar el respaldo, que es el original bueno.
            rmSync(settings, { force: true });
        } else {
            renameSync(settings, backup);
        }
    }

    writeFileSync(settings, JSON.stringify({ [LIBRARY_PATH_KEY]: libraryPath }, null, 2) + "\n");

    return settings;
}

/**
 * Borra el settings.json sembrado y restaura el del usuario si había uno.
 * Es idempotente: se puede llamar aunque seedSettings no haya llegado a correr.
 */
export function restoreSettings() {
    const settings = settingsFile();
    const backup = backupFile();

    rmSync(settings, { force: true });

    if (existsSync(backup)) {
        renameSync(backup, settings);
    }
}
