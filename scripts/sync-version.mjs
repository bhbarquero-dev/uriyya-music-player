// Copies the app version from package.json (the source of truth) into the Rust
// manifest and its lockfile. tauri.conf.json and the UI read package.json directly.
import { readFileSync, writeFileSync } from "node:fs";

const resolve = (relativePath) => new URL(`../${relativePath}`, import.meta.url);
const read = (relativePath) => readFileSync(resolve(relativePath), "utf8");

function replaceVersion(relativePath, pattern, version) {
    const content = read(relativePath);
    if (!pattern.test(content)) {
        throw new Error(`Could not find the app version in ${relativePath}`);
    }

    const updated = content.replace(pattern, `$1${version}$3`);
    if (updated === content) return false;

    writeFileSync(resolve(relativePath), updated);
    return true;
}

const { version } = JSON.parse(read("package.json"));
const crateName = read("src-tauri/Cargo.toml").match(/^\[package\]\r?\nname = "([^"]+)"/m)?.[1];

if (!crateName) {
    throw new Error("Could not read the crate name from src-tauri/Cargo.toml");
}

const escapedCrateName = crateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const packageEntry = new RegExp(`(name = "${escapedCrateName}"\\r?\\nversion = ")([^"]+)(")`);

const updatedFiles = ["src-tauri/Cargo.toml", "src-tauri/Cargo.lock"].filter((relativePath) =>
    replaceVersion(relativePath, packageEntry, version),
);

if (updatedFiles.length > 0) {
    console.log(`Synced version ${version} into ${updatedFiles.join(", ")}`);
}
