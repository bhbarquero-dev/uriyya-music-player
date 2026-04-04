const PARALLELS_HOME_PREFIX = "\\\\Mac\\Home";

export function isParallelsPath(path: string): boolean {
    return path.toLowerCase().startsWith(PARALLELS_HOME_PREFIX.toLowerCase());
}

export function resolveParallelsPath(path: string, homeDir: string): string {
    const base = homeDir.endsWith("/") ? homeDir.slice(0, -1) : homeDir;
    const tail = path.slice(PARALLELS_HOME_PREFIX.length).replace(/\\/g, "/");
    return base + tail;
}

export function unresolveParallelsPath(path: string, homeDir: string): string {
    const base = homeDir.endsWith("/") ? homeDir.slice(0, -1) : homeDir;
    const tail = path.slice(base.length).replace(/\//g, "\\");
    return PARALLELS_HOME_PREFIX + tail;
}
