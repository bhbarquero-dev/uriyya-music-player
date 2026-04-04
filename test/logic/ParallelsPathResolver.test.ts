import { describe, it, expect } from "vitest";
import {
    isParallelsPath,
    resolveParallelsPath,
    unresolveParallelsPath,
} from "../../src/logic/ParallelsPathResolver";

describe("ParallelsPathResolver", () => {
    describe("isParallelsPath", () => {
        it("detects a standard \\\\Mac\\Home path", () => {
            expect(isParallelsPath("\\\\Mac\\Home\\Music\\file.mp3")).toBe(true);
        });

        it("is case-insensitive on the prefix", () => {
            expect(isParallelsPath("\\\\mac\\home\\Music\\file.mp3")).toBe(true);
            expect(isParallelsPath("\\\\MAC\\HOME\\Music\\file.mp3")).toBe(true);
        });

        it("returns false for a native Mac path", () => {
            expect(isParallelsPath("/Users/uriyya/Music/file.mp3")).toBe(false);
        });

        it("returns false for a plain filename", () => {
            expect(isParallelsPath("file.mp3")).toBe(false);
        });

        it("returns false for a Windows absolute path", () => {
            expect(isParallelsPath("C:\\Users\\user\\Music\\file.mp3")).toBe(false);
        });
    });

    describe("resolveParallelsPath", () => {
        it("replaces \\\\Mac\\Home with homeDir and converts backslashes to forward slashes", () => {
            expect(
                resolveParallelsPath("\\\\Mac\\Home\\Music\\file.mp3", "/Users/uriyya")
            ).toBe("/Users/uriyya/Music/file.mp3");
        });

        it("handles nested subdirectories", () => {
            expect(
                resolveParallelsPath(
                    "\\\\Mac\\Home\\Music\\SubDir\\Another Dir\\file.mp3",
                    "/Users/uriyya"
                )
            ).toBe("/Users/uriyya/Music/SubDir/Another Dir/file.mp3");
        });

        it("strips a trailing slash from homeDir before joining", () => {
            expect(
                resolveParallelsPath("\\\\Mac\\Home\\Music\\file.mp3", "/Users/uriyya/")
            ).toBe("/Users/uriyya/Music/file.mp3");
        });
    });

    describe("unresolveParallelsPath", () => {
        it("replaces homeDir prefix with \\\\Mac\\Home and converts forward slashes to backslashes", () => {
            expect(
                unresolveParallelsPath("/Users/uriyya/Music/file.mp3", "/Users/uriyya")
            ).toBe("\\\\Mac\\Home\\Music\\file.mp3");
        });

        it("round-trips correctly with resolveParallelsPath", () => {
            const original = "\\\\Mac\\Home\\Music\\SubDir\\file.mp3";
            const homeDir = "/Users/uriyya";
            expect(
                unresolveParallelsPath(resolveParallelsPath(original, homeDir), homeDir)
            ).toBe(original);
        });
    });
});
