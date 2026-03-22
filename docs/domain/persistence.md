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

## What Is Not Persisted Today

- The currently selected song.
- The currently playing song.
- Playback position, duration, or active playback state.
- The current playlist path across app restarts.
- Library scan results and sidebar search query.
- Temporary UI state such as compact sidebar mode.

## Failure Handling

- Library-path persistence failures are intentionally non-blocking.
- Playlist load and save failures are surfaced to callers, which log and handle them at the UI boundary.

## Related Code

- `src/logic/UserSettingsStore.ts`
- `src/components/sidebar/Sidebar.tsx`
- `src/logic/FileService.ts`
- `src/hooks/useMusicPlayer.ts`
- `test/logic/UserSettingsStore.test.ts`
- `test/hooks/useMusicPlayer.persistence.test.ts`