# Persistence

This document describes the current persistence behavior implemented by the app.

## Purpose

Persistence in the current app covers two separate concerns:

- remembering the selected library directory across launches
- saving the currently loaded playlist back to disk

## Persisted Settings

- The app stores the selected library directory under the key `library.path` in `settings.json`.
- On sidebar mount, the app reads `library.path` and restores it into UI state if the stored value is a string.
- If reading settings fails or the stored value is missing or not a string, the app behaves as if no library path was saved.
- If saving the library path fails, the error is swallowed so the UI flow is not blocked.

## Playlist File Persistence

- Loading a playlist stores three pieces of in-memory state:
  - playlist songs
  - playlist display name
  - playlist file path
- Saving the current playlist writes the current ordered song paths to the loaded playlist file path, one path per line.
- Saving is a no-op when there is no known playlist file path.
- A successful save clears the unsaved-changes flag.

## Parallels Path Resolution (Mac)

- Playlist files may contain Parallels Desktop VM paths of the form `\\Mac\Home\...`.
  These paths are relative to the user's Mac home directory as seen from a Windows VM running under Parallels.
- When loading a playlist, if a path of this form does not exist on disk, the app attempts to resolve it
  by replacing the `\\Mac\Home` prefix with the current user's home directory (via the OS path API).
- If the resolved path exists, the song is marked valid and uses the resolved path for playback.
  The original VM-style path is preserved internally for round-trip serialization.
- When saving, the app writes back the original VM-style paths so the file remains compatible with the Parallels environment.
- If the home directory is unavailable (e.g., the platform API fails), unresolved Parallels paths are
  silently marked invalid — no error is surfaced to the user.
- This behavior is Mac-only and applies only to the `\\Mac\Home` Parallels share.

## What Is Not Persisted Today

- The currently selected song.
- The currently playing song.
- Playback position, duration, or active playback state.
- The current playlist path across app restarts.
- Library scan results and sidebar search query.

## Failure Handling

- Library-path persistence failures are intentionally non-blocking.
- Playlist load and save failures are surfaced to callers, which log and handle them at the UI boundary.

## Related Code

- `src/logic/UserSettingsStore.ts`
- `src/components/sidebar/Sidebar.tsx`
- `src/logic/FileService.ts`
- `src/logic/ParallelsPathResolver.ts`
- `src/hooks/useMusicPlayer.ts`
- `test/logic/UserSettingsStore.test.ts`
- `test/hooks/useMusicPlayer.persistence.test.ts`
- `test/logic/ParallelsPathResolver.test.ts`
- `test/logic/FileService.parallels.test.ts`