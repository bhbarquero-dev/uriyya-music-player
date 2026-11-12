# Library

This document describes the current library behavior implemented by the app.

## Purpose

The library is a single directory of local audio files, shown in the sidebar, that the user can search and use as a source of songs for the loaded playlist.

## Selecting a Library

- The app has at most one library directory at a time.
- With no library selected, the sidebar shows a placeholder and an "add library" action that opens a directory picker.
- With a library selected, the sidebar shows the directory name and offers two actions: change the library (opens the directory picker again) and refresh the song list.
- Cancelling the directory picker leaves the current library unchanged.
- There is no action to remove the library; it can only be replaced.
- The selected directory is persisted and restored on the next launch. See [persistence.md](persistence.md).

## Scanning

- The library is scanned when the library path is restored or changed, and when the user refreshes it.
- The scan is recursive and collects files with a supported audio extension (`.mp3`, `.wav`).
- A directory that cannot be read is skipped; it does not fail the whole scan.
- Results are sorted by file name using Spanish collation that ignores case, accents, and punctuation and compares numbers numerically. Ties are broken by full path.
- Scan results are held in memory only and are not cached across launches.
- While scanning, the list shows a "searching" message. An empty result shows a "no `.mp3` or `.wav` files found" message.

## Search

- The search box is shown only when the library has at least one song.
- Search matches against the file name only, not the full path.
- Matching is a case-insensitive substring match after Unicode NFC normalization, so composed and decomposed forms of characters such as `ñ` match each other.
- Search is not accent-insensitive: `cancion` does not match `canción`.
- An empty or whitespace-only query shows every song.
- The query is not persisted.

## Adding Songs to the Playlist

Each library song has a context menu (right click):

- **Add at end** and **Add at start** are available only when a playlist is loaded.
- **Add after selected** is available only when a playlist song is selected; the new song is inserted immediately after it.
- **Show in file explorer** is always available.
- Adding a song does not change the current selection or playback.
- The same file can be added more than once; each entry is an independent playlist song.
- Added songs follow the playlist editing rules in [playlist.md](playlist.md), including unsaved-change tracking.

## Related Code

- `src/logic/Library.ts`
- `src/logic/LibraryScanner.ts`
- `src/logic/audioFormats.ts`
- `src/components/sidebar/library/Library.tsx`
- `src/components/sidebar/library/LibraryHeader.tsx`
- `src/components/sidebar/library/LibrarySearch.tsx`
- `src/components/sidebar/library/LibrarySongItem.tsx`
- `test/logic/Library.test.ts`
- `test/logic/LibraryScanner.test.ts`
- `test/components/sidebar/library/`
