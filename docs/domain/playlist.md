# Playlist

This document describes the current playlist loading and editing behavior implemented by the app.

## Purpose

A playlist is an ordered list of songs loaded from a text file. The user can navigate it, edit it in memory, and save it back to the same file.

## Playlist File Format

- Playlists are plain text files with a `.txt` or `.alb` extension.
- Each line holds one absolute path to an audio file.
- On load, lines are trimmed; blank lines and lines without a supported audio extension (`.mp3`, `.wav`) are discarded.
- Discarded lines are not kept in memory, so they are not written back when the playlist is saved.
- Encoding and Parallels path handling are described in [persistence.md](persistence.md).

## Loading

- A playlist is loaded through a file picker. Cancelling the picker leaves the current state unchanged.
- The playlist display name is the file name without its extension.
- Each path is checked on disk. Songs whose file is missing stay in the playlist marked as invalid.
- Loading a playlist replaces the previous one, clears the selection, and resets unsaved-change tracking.
- A playlist cannot be loaded or changed while a song is assigned to the player (playing or paused). Stop playback first.
- If loading fails, the error is shown to the user in a native error dialog.

## Selection

- A single click selects a song. A double click plays it.
- `ArrowDown` and `ArrowUp` move the selection and clamp at the ends of the list.
- The selected row is scrolled into view when the selection changes.
- Invalid songs can be selected but cannot be played. They are shown with a "file not found" indicator.

## Editing

- Songs can be reordered by dragging the row handle; dragging is restricted to the vertical axis.
- Songs can be added from the library at the end, at the start, or after the selected song. See [library.md](library.md).
- The song context menu (right click) offers:
  - **Remove from playlist**, disabled for the song currently assigned to the player.
  - **Show in file explorer**, disabled for invalid songs.
- When the selected song is removed, the selection moves to the song that takes its position, or to the new last song if it was the last one. Removing the only song clears the selection.
- All edits are in memory until the playlist is saved.

## Unsaved Changes

- The playlist has unsaved changes when its ordered list of paths differs from the list as loaded or last saved.
- An edit that restores the original order and contents clears the unsaved-changes state.
- Unsaved changes are indicated next to the playlist name.
- Changing the playlist or closing the window with unsaved changes opens a dialog with three choices:
  - **Save**: save the playlist, then continue.
  - **Discard**: continue without saving.
  - **Cancel**: stay in the current playlist.
- That dialog is currently the only way to save a playlist; there is no standalone save action.

## Related Code

- `src/hooks/usePlaylistState.ts`
- `src/hooks/useMusicPlayer.ts`
- `src/hooks/useFileLoader.ts`
- `src/logic/FileService.ts`
- `src/logic/PlaylistManager.ts`
- `src/logic/Song.ts`
- `src/components/songList/`
- `src/components/common/ConfirmDialog.tsx`
- `src/App.tsx`
- `test/hooks/usePlaylistState.test.ts`
- `test/logic/FileService.test.ts`
- `test/logic/PlaylistManager.test.ts`
- `test/components/songList/`
