# Architecture

This document describes how the code is organized today. Business rules live in [constitution.md](constitution.md) and `docs/domain`.

## Overview

The app is a React + TypeScript frontend running inside a Tauri 2 webview. All native capabilities come from Tauri plugins (`dialog`, `fs`, `store`, `opener`); the Rust side in `src-tauri/src` only registers those plugins and has no app-specific commands in use.

## Layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Components | `src/components` | Presentational UI: player header, sidebar/library, song list, shared dialogs and menus |
| Hooks | `src/hooks` | Stateful React coordination |
| Logic | `src/logic` | Domain classes, services, and Tauri adapters |
| Abstractions | `src/abstractions` | Interfaces for environment boundaries |
| Utils | `src/utils` | Pure formatting helpers |
| Native | `src-tauri` | Tauri configuration, capabilities, and the Rust entry point |

`src/App.tsx` is the composition root: it wires the hooks to the components, owns the global keyboard shortcuts, the unsaved-changes dialog, and the window close guard.

## Hooks

- `useMusicPlayer` is the coordinator. It composes the three hooks below and exposes one interface to `App`.
- `usePlaylistState` owns the in-memory playlist, the selection, and unsaved-change tracking.
- `useFileLoader` loads and saves playlist files through `FileService`.
- `useAudioPlayback` owns playback and timing state on top of `AudioManager`.

## Environment Boundaries

Interfaces in `src/abstractions` isolate platform APIs so logic can be tested without Tauri:

| Interface | Tauri adapter | Used by |
| --- | --- | --- |
| `FileDialog` | `TauriFileDialog` | `FileService`, `Library` |
| `FileSystem` | `TauriFileSystem` | `FileService` |
| `SettingsStore` | `TauriSettingsStore` | `Library` |

Some code calls Tauri APIs directly instead of going through an abstraction:

- `LibraryScanner` uses `readDir` and `join`.
- `Song.toMediaUrl()` uses `convertFileSrc`.
- `App.tsx` and `LibrarySongItem.tsx` use the `opener` plugin; `App.tsx` also uses the window API and the native message dialog.

## Audio

- `AudioManager` owns two `Channel` instances, each wrapping an `HTMLAudioElement`.
- Playing a song starts it on the inactive channel and fades out the previously active one, which then becomes inactive.
- Audio files are loaded through Tauri's asset protocol (`convertFileSrc`), not through the `fs` plugin.
- `useAudioPlayback` polls the active audio element every 250 ms for timing, and uses that poll as a fallback to detect the end of a song when the `ended` event does not fire.

## Native Permissions

Configured in `src-tauri/tauri.conf.json` and `src-tauri/capabilities/default.json`:

- The asset protocol is enabled with scope `**`, and the `fs` plugin allows read, read-dir, exists, and write-file on `**`. Playlists reference audio files by absolute path anywhere on disk, and the library can be any directory, so access is not limited to a fixed folder.
- `fs` write access is used only to save playlist files.
- `core:window:allow-destroy` is used by the window close guard after the unsaved-changes dialog.
- On macOS the app is not sandboxed (`src-tauri/entitlements.plist`).

## Import Aliases

Defined in `vite.config.ts` and `tsconfig.json`: `@logic`, `@components`, and `@abstractions`.

## Testing

- Unit and component tests run with Vitest and jsdom; they live under `test`, mirroring `src`.
- End-to-end tests run with Playwright against the Vite dev server in Chromium, without the Tauri runtime. See [e2e/README.md](../e2e/README.md).
