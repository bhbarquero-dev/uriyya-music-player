const PARALLELS_HOME_PREFIX = "\\\\Mac\\Home";

export function isParallelsPath(path: string): boolean {
    const normalizedPath = path.toLowerCase();
    const normalizedPrefix = PARALLELS_HOME_PREFIX.toLowerCase();

    return (
        normalizedPath === normalizedPrefix ||
        normalizedPath.startsWith(normalizedPrefix + "\\")
    );
}

export function resolveParallelsPath(path: string, homeDir: string): string {
    if (!isParallelsPath(path)) {
        return path;
    }

    const base = homeDir.endsWith("/") ? homeDir.slice(0, -1) : homeDir;
    const tail = path.slice(PARALLELS_HOME_PREFIX.length).replace(/\\/g, "/");
    return base + tail;
}

export function unresolveParallelsPath(path: string, homeDir: string): string {
    const base = homeDir.endsWith("/") ? homeDir.slice(0, -1) : homeDir;

    if (path === base) {
        return PARALLELS_HOME_PREFIX;
    }

    if (!path.startsWith(base + "/")) {
        return path;
    }

    const tail = path.slice(base.length).replace(/\//g, "\\");
    return PARALLELS_HOME_PREFIX + tail;
}
