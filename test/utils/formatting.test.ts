import { describe, it, expect } from "vitest";
import { formatTime, getFileName } from "../../src/utils/formatting";

describe("formatTime", () => {
    it("should format 0 seconds as 0:00", () => {
        expect(formatTime(0)).toBe("0:00");
    });

    it("should format 65 seconds as 1:05", () => {
        expect(formatTime(65)).toBe("1:05");
    });

    it("should format single digit seconds with leading zero", () => {
        expect(formatTime(61)).toBe("1:01");
    });

    it("should show --:-- for null", () => {
        expect(formatTime(null)).toBe("--:--");
    });

    it("should show --:-- for Infinity", () => {
        expect(formatTime(Infinity)).toBe("--:--");
    });

    it("should show --:-- for NaN", () => {
        expect(formatTime(NaN)).toBe("--:--");
    });
});

describe("getFileName", () => {
    it("should extract filename from windows path", () => {
        expect(getFileName("C:\\Music\\song.mp3")).toBe("song.mp3");
    });

    it("should extract filename from unix path", () => {
        expect(getFileName("/home/user/music.mp3")).toBe("music.mp3");
    });

    it("should handle plain filename", () => {
        expect(getFileName("song.mp3")).toBe("song.mp3");
    });

    it("should handle mixed path separators", () => {
        expect(getFileName("C:/Music\\Audio/track.mp3")).toBe("track.mp3");
    });
});
