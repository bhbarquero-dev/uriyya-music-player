import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const supportDir = path.dirname(fileURLToPath(import.meta.url));

/** Raíz del repositorio. */
export const repoRoot = path.resolve(supportDir, "..", "..");

/** Raíz de la suite de WebDriver. */
export const e2eTauriDir = path.join(repoRoot, "e2e-tauri");

/** Carpeta de fixtures generados (ignorada por git). */
export const fixturesDir = path.join(e2eTauriDir, "fixtures");

/** Biblioteca de música de prueba que la app va a escanear. */
export const libraryFixtureDir = path.join(fixturesDir, "library");

/** Drivers nativos descargados (ignorada por git). */
export const driversDir = path.join(e2eTauriDir, ".drivers");

/**
 * El nombre del binario sale de `package.name` en src-tauri/Cargo.toml.
 * El typo "tuari" es el nombre real del crate, no una errata de este archivo.
 */
const BINARY_NAME = "uriyya-music-player-tuari";

/**
 * Ruta del binario de depuración que lanza tauri-driver.
 * Falla con un mensaje accionable si todavía no se compiló, en vez de dejar
 * que WebDriver muera con un error opaco al crear la sesión.
 */
export function appBinary() {
    const fileName = process.platform === "win32" ? `${BINARY_NAME}.exe` : BINARY_NAME;
    const binary = path.join(repoRoot, "src-tauri", "target", "debug", fileName);

    if (!existsSync(binary)) {
        throw new Error(
            `No se encontró el binario de depuración en ${binary}.\n` +
            `Compilalo primero con: pnpm test:e2e:tauri:build`
        );
    }

    return binary;
}
