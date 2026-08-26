import { EXPECTED_LIBRARY_SONGS } from "../support/fixtures.js";

/**
 * `sidebar-library-item` también lo usan los mensajes de estado de la barra
 * lateral ("Buscando canciones...", "No se encontraron archivos..."), así que
 * leer la lista una sola vez puede capturar un estado intermedio. Por eso el
 * test espera a que el contenido se estabilice en la lista esperada.
 */
async function readLibraryItems() {
    return $$(".sidebar-library-item").map((item) => item.getText());
}

describe("Biblioteca guardada", () => {
    it("se carga sola al arrancar leyendo el store y el disco por IPC real", async () => {
        await $(".app-container").waitForExist({ timeout: 30000 });

        // Si el IPC del store fallara, getLibraryPath() traga el error y devuelve
        // null, y la barra lateral mostraría "No hay biblioteca seleccionada".
        // Que aparezca el nombre de la carpeta prueba que plugin:store|get leyó
        // de verdad el settings.json del disco.
        const selectedLibrary = await $(".sidebar-selected-item-text");
        await selectedLibrary.waitForExist({ timeout: 30000 });
        await expect(selectedLibrary).toHaveText("library");

        // Y que aparezcan los archivos prueba que plugin:fs|read_dir y
        // plugin:path|join recorrieron el sistema de archivos real, incluido el
        // subdirectorio, respetando el orden del Intl.Collator del escáner.
        let lastSeen = [];
        await browser.waitUntil(
            async () => {
                lastSeen = await readLibraryItems();
                return JSON.stringify(lastSeen) === JSON.stringify(EXPECTED_LIBRARY_SONGS);
            },
            {
                timeout: 30000,
                timeoutMsg: `La biblioteca nunca mostró ${JSON.stringify(EXPECTED_LIBRARY_SONGS)}.`,
            }
        ).catch((error) => {
            throw new Error(`${error.message} Último contenido visible: ${JSON.stringify(lastSeen)}`);
        });

        // El .txt del fixture no es audio y no tiene que estar en la lista.
        expect(lastSeen).not.toContain("notas.txt");
    });
});
