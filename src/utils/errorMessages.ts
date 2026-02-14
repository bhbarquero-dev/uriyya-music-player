/**
 * Maps technical errors to user-friendly messages
 */

export interface UserError {
  title: string;
  message: string;
}

/**
 * Convert a technical error to a user-friendly error message
 */
export function getUserFriendlyError(error: unknown): UserError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();

  // File system errors
  if (errorLower.includes("permission denied") || errorLower.includes("eacces")) {
    return {
      title: "Permission Denied",
      message: "Unable to access the file. Please check file permissions.",
    };
  }

  if (errorLower.includes("not found") || errorLower.includes("enoent")) {
    return {
      title: "File Not Found",
      message: "The file could not be found. It may have been moved or deleted.",
    };
  }

  if (errorLower.includes("invalid song format") || errorLower.includes("only .mp3")) {
    return {
      title: "Unsupported Format",
      message: "Only MP3 files are supported. Please select a valid MP3 file.",
    };
  }

  // Audio playback errors
  if (errorLower.includes("decode") || errorLower.includes("codec")) {
    return {
      title: "Playback Error",
      message: "Unable to play this file. The audio format may be corrupted or unsupported.",
    };
  }

  if (errorLower.includes("network") || errorLower.includes("fetch")) {
    return {
      title: "Network Error",
      message: "Unable to load the audio file. Please check your connection.",
    };
  }

  // Playlist errors
  if (errorLower.includes("empty") || errorLower.includes("no songs")) {
    return {
      title: "Empty Playlist",
      message: "The playlist is empty. Please add songs to continue.",
    };
  }

  if (errorLower.includes("invalid playlist") || errorLower.includes("failed to load playlist")) {
    return {
      title: "Playlist Error",
      message: "Unable to load the playlist. The file may be corrupted or in an invalid format.",
    };
  }

  // Generic errors
  return {
    title: "Error",
    message: "An unexpected error occurred. Please try again.",
  };
}
