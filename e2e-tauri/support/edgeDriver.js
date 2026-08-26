import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { driversDir } from "./paths.js";

const WEBVIEW2_CLIENT_GUID = "{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}";

const REGISTRY_KEYS = [
    `HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\EdgeUpdate\\Clients\\${WEBVIEW2_CLIENT_GUID}`,
    `HKCU\\Software\\Microsoft\\EdgeUpdate\\Clients\\${WEBVIEW2_CLIENT_GUID}`,
];

/**
 * Versión del WebView2 Runtime instalado. msedgedriver tiene que coincidir con
 * ella o la sesión de WebDriver no levanta.
 */
function installedWebView2Version() {
    for (const key of REGISTRY_KEYS) {
        try {
            const output = execFileSync("reg", ["query", key, "/v", "pv"], { encoding: "utf8" });
            const match = output.match(/pv\s+REG_SZ\s+([\d.]+)/);
            if (match) {
                return match[1];
            }
        } catch {
            // Esa variante del registro no existe; se prueba la siguiente.
        }
    }

    throw new Error(
        "No se pudo determinar la versión del WebView2 Runtime en el registro.\n" +
        "Instalá msedgedriver a mano y apuntá la variable de entorno TAURI_NATIVE_DRIVER a él."
    );
}

async function downloadDriver(version, targetDir) {
    const url = `https://msedgedriver.microsoft.com/${version}/edgedriver_win64.zip`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`No se pudo descargar msedgedriver ${version} desde ${url} (HTTP ${response.status}).`);
    }

    const zipPath = path.join(targetDir, "edgedriver_win64.zip");
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(zipPath, Buffer.from(await response.arrayBuffer()));

    execFileSync("powershell", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force`,
    ], { stdio: "inherit" });

    rmSync(zipPath, { force: true });
}

/**
 * Devuelve la ruta a un msedgedriver.exe que coincide con el WebView2 instalado,
 * descargándolo del CDN oficial de Microsoft si hace falta. Cachea por versión,
 * así que solo baja una vez por versión de runtime.
 *
 * Solo aplica en Windows: en Linux tauri-driver usa WebKitWebDriver, que viene
 * del paquete de sistema webkit2gtk-driver.
 */
export async function ensureEdgeDriver() {
    if (process.env.TAURI_NATIVE_DRIVER) {
        return process.env.TAURI_NATIVE_DRIVER;
    }

    const version = installedWebView2Version();
    const versionDir = path.join(driversDir, version);
    const driver = path.join(versionDir, "msedgedriver.exe");

    if (!existsSync(driver)) {
        console.log(`[e2e-tauri] Descargando msedgedriver ${version} (WebView2 instalado)...`);
        await downloadDriver(version, versionDir);
    }

    if (!existsSync(driver)) {
        throw new Error(`Se descargó el paquete pero no apareció msedgedriver.exe en ${versionDir}.`);
    }

    return driver;
}
