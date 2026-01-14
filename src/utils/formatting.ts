export const formatTime = (secs: number | null): string => {
    if (secs === null || !isFinite(secs)) return "--:--";
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, "0")}`;
};

export const getFileName = (path: string): string => {
    return path.split(/[\\\/]/).pop() || path;
};
