import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fixturesDir, libraryFixtureDir } from "./paths.js";

const SAMPLE_RATE = 8000;
const DURATION_SECONDS = 0.5;
const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;

/**
 * Construye un WAV PCM válido de silencio, sin dependencias ni binarios
 * versionados en el repositorio.
 *
 * Se usa WAV y no MP3 porque ambos están soportados por la app
 * (src/logic/audioFormats.ts) pero WAV no depende de códecs adicionales
 * en el runner de Linux.
 */
function buildSilentWav() {
    const bytesPerSample = BITS_PER_SAMPLE / 8;
    const dataSize = Math.round(SAMPLE_RATE * DURATION_SECONDS) * CHANNELS * bytesPerSample;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write("RIFF", 0, "ascii");
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write("WAVE", 8, "ascii");

    buffer.write("fmt ", 12, "ascii");
    buffer.writeUInt32LE(16, 16); // tamaño del bloque fmt
    buffer.writeUInt16LE(1, 20); // formato PCM
    buffer.writeUInt16LE(CHANNELS, 22);
    buffer.writeUInt32LE(SAMPLE_RATE, 24);
    buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * bytesPerSample, 28); // byte rate
    buffer.writeUInt16LE(CHANNELS * bytesPerSample, 32); // block align
    buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);

    buffer.write("data", 36, "ascii");
    buffer.writeUInt32LE(dataSize, 40);
    // El resto queda en ceros: silencio.

    return buffer;
}

/**
 * Nombres esperados en la barra lateral, ya ordenados como los ordena
 * scanLibraryAudioFiles (Intl.Collator "es", numeric).
 *
 * Cubren a propósito: espacios y guiones en el nombre, caracteres no ASCII
 * (que tienen que sobrevivir el viaje por IPC) y un archivo en un
 * subdirectorio (que ejercita el escaneo recursivo).
 */
export const EXPECTED_LIBRARY_SONGS = [
    "01 - test-tone.wav",
    "02 - otra canción.wav",
    "03 - anidada.wav",
];

/**
 * Regenera desde cero la biblioteca de prueba que la app va a escanear.
 * Devuelve la ruta absoluta de la carpeta raíz.
 */
export function createLibraryFixture() {
    rmSync(fixturesDir, { recursive: true, force: true });

    const nestedDir = path.join(libraryFixtureDir, "subcarpeta");
    mkdirSync(nestedDir, { recursive: true });

    const audio = buildSilentWav();
    writeFileSync(path.join(libraryFixtureDir, "01 - test-tone.wav"), audio);
    writeFileSync(path.join(libraryFixtureDir, "02 - otra canción.wav"), audio);
    writeFileSync(path.join(nestedDir, "03 - anidada.wav"), audio);

    // No es audio: el escaneo tiene que ignorarlo.
    writeFileSync(path.join(libraryFixtureDir, "notas.txt"), "no soy una canción\n");

    return libraryFixtureDir;
}
