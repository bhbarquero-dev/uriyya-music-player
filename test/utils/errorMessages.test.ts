import { describe, it, expect } from "vitest";
import { getUserFriendlyError } from "../../src/utils/errorMessages";

describe("errorMessages", () => {
  describe("getUserFriendlyError", () => {
    it("should return permission denied message for EACCES error", () => {
      const error = new Error("EACCES: permission denied");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Permission Denied");
      expect(result.message).toContain("permission");
    });

    it("should return file not found message for ENOENT error", () => {
      const error = new Error("ENOENT: no such file or directory");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("File Not Found");
      expect(result.message).toContain("not be found");
    });

    it("should return unsupported format message for invalid song format", () => {
      const error = new Error("Invalid song format: song.txt. Only .mp3 files are supported.");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Unsupported Format");
      expect(result.message).toContain("MP3");
    });

    it("should return playback error for decode issues", () => {
      const error = new Error("Failed to decode audio");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Playback Error");
      expect(result.message).toContain("play");
    });

    it("should return network error for network issues", () => {
      const error = new Error("Network error occurred");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Network Error");
      expect(result.message).toContain("connection");
    });

    it("should return playlist error for playlist loading failures", () => {
      const error = new Error("Failed to load playlist");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Playlist Error");
      expect(result.message).toContain("playlist");
    });

    it("should return generic error for unknown errors", () => {
      const error = new Error("Some unknown error");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Error");
      expect(result.message).toContain("unexpected");
    });

    it("should handle non-Error objects", () => {
      const result = getUserFriendlyError("Some string error");

      expect(result.title).toBe("Error");
      expect(result.message).toContain("unexpected");
    });

    it("should handle case-insensitive error matching", () => {
      const error = new Error("PERMISSION DENIED");
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Permission Denied");
    });
  });
});
