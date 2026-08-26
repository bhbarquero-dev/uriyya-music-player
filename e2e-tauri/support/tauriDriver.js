import { spawn } from "node:child_process";
import net from "node:net";

export const DRIVER_HOST = "127.0.0.1";
export const DRIVER_PORT = 4444;

let driverProcess = null;

function canConnect(host, port) {
    return new Promise((resolve) => {
        const socket = net.connect({ host, port });
        const done = (result) => {
            socket.destroy();
            resolve(result);
        };
        socket.once("connect", () => done(true));
        socket.once("error", () => done(false));
    });
}

async function waitForDriver(timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        if (await canConnect(DRIVER_HOST, DRIVER_PORT)) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(`tauri-driver no quedó escuchando en ${DRIVER_HOST}:${DRIVER_PORT} tras ${timeoutMs} ms.`);
}

/**
 * Levanta tauri-driver y espera a que acepte conexiones.
 *
 * `nativeDriver` solo se usa en Windows (msedgedriver). En Linux tauri-driver
 * encuentra WebKitWebDriver en el PATH por su cuenta.
 */
export async function startTauriDriver({ nativeDriver } = {}) {
    const args = ["--port", String(DRIVER_PORT)];
    if (nativeDriver) {
        args.push("--native-driver", nativeDriver);
    }

    driverProcess = spawn("tauri-driver", args, { stdio: "inherit" });

    driverProcess.on("error", (error) => {
        console.error(
            "[e2e-tauri] No se pudo ejecutar tauri-driver. ¿Está instalado?\n" +
            "  cargo install tauri-driver --locked\n",
            error
        );
    });

    // Red de seguridad: si el proceso de wdio muere sin pasar por onComplete,
    // igual no queda un tauri-driver colgado ocupando el puerto.
    process.once("exit", stopTauriDriver);

    await waitForDriver();
}

export function stopTauriDriver() {
    if (driverProcess && !driverProcess.killed) {
        driverProcess.kill();
    }
    driverProcess = null;
}
