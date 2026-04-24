# Product Constitution

This document captures the current business rules of Uriyya Music Player as implemented today.

## Purpose

Uriyya Music Player is a desktop application for loading, browsing, and playing local audio files through playlists and a local library sidebar.

## Current Scope

- The app works with local audio files using `.mp3` and `.wav` extensions.
- The app loads playlists from `.txt` and `.alb` files.
- A loaded playlist can be navigated, edited in memory, and saved back to its file path.
- A library directory can be selected, scanned for audio files, and reused across launches.

## Global Invariants

- A `Song` must have a non-empty path with a supported audio extension.
- A playlist may contain songs that are known to be invalid on disk, but invalid songs must not start playback.
- Playlist selection and playback are separate concepts: a song may be selected without being actively playing.
- Loading a playlist sets the playlist contents, captures its display name and file path, clears the selected song, and resets unsaved-change tracking.
- Reordering, adding, inserting, or removing songs changes the in-memory playlist and may mark it as having unsaved changes.
- A playlist can only be saved when the app knows the source file path of the currently loaded playlist.
- When a song ends naturally, playback stops first; if there is another song in the playlist, that next song becomes selected but is not auto-played.
- Reading or writing the saved library path must not block the main UI flow if persistence fails.

## Out of Scope Today

- Shuffle, repeat, and queue management.
- Metadata editing or tag management.
- Restoring active playback, selected song, or playback position on app startup.
- Persisting temporary UI state such as search text.

## Related Code

- `src/hooks/useMusicPlayer.ts`
- `src/hooks/useAudioPlayback.ts`
- `src/hooks/usePlaylistState.ts`
- `src/logic/FileService.ts`
- `src/logic/UserSettingsStore.ts`