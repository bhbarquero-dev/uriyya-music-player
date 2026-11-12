# Maintainability Improvements

This document records the maintainability problems found in a review of the codebase (November 2026) and a concrete proposal to fix each one. It is a backlog, not a description of current behavior: business rules stay in [constitution.md](constitution.md) and `docs/domain`, and the current structure stays in [architecture.md](architecture.md).

Remove an item from this document when it is done.

## Summary

| # | Improvement | Impact | Effort | Changes behavior | Touches existing tests |
| --- | --- | --- | --- | --- | --- |
| 1 | [Finish the lint and formatting setup](#1-finish-the-lint-and-formatting-setup) | High | Low | No | Yes (mechanical) |
| 2 | [Single source of truth for the playlist](#2-single-source-of-truth-for-the-playlist) | High | Medium | Yes (fixes a bug) | Yes |
| 3 | [Route all Tauri calls through abstractions](#3-route-all-tauri-calls-through-abstractions) | Medium | Medium | No | Yes |
| 4 | [Make library state reactive](#4-make-library-state-reactive) | Medium | Medium | Small (error handling) | Yes |
| 5 | [Slim down `App.tsx`](#5-slim-down-apptsx) | Medium | Low | No | No |
| 6 | [Remove duplication and dead code](#6-remove-duplication-and-dead-code) | Low | Low | No | Mostly no |
| 7 | [Handle errors at one boundary](#7-handle-errors-at-one-boundary) | Medium | Low | Small (user-visible errors) | Yes |
| 8 | [Configuration and styles](#8-configuration-and-styles) | Low | Low to medium | No | No |
| 9 | [Tests](#9-tests) | Low | Low | No | Yes |

Recommended order: 1, 2, 7, 4, 3, 5, 6, 8, 9. Item 1 is cheap and guards every later refactor. Item 2 is the only one hiding a confirmed bug. Items 5 and 6 get easier once 3 and 4 are done.

Every item that touches an existing test needs explicit approval first (see `CLAUDE.md`, Testing).

---

## 1. Finish the lint and formatting setup

### Status

Partly done on branch `chore/add-biome-lint`:

- Biome is installed and configured in `biome.json`, lint only.
- `pnpm lint` exists and runs in CI before the type check.
- The React hooks rules (`useExhaustiveDependencies`, `useHookAtTopLevel`) are errors.
- All error-level findings are fixed or suppressed with a reason. Safe automatic fixes (`import type`, redundant regex escapes) are applied.

ESLint was the first choice and was ruled out: `typescript-eslint` requires `typescript <6.1.0`, and TypeScript 7 no longer exposes the JS API its parser uses (`require("typescript").createProgram` is `undefined` in 7.0.2).

### What is still open

**28 warnings and 5 infos remain.** They do not fail CI, which means they will be ignored and grow.

| Rule | Count | Where | Proposed fix |
| --- | --- | --- | --- |
| `style/noNonNullAssertion` | 14 | `test/components/songList/SongRow.test.tsx` (12), `SongList.test.tsx`, `test/logic/FileService.test.ts` | Replace `x!` with an assertion that fails with a clear message, for example a small `getRequired()` test helper, or turn the rule off for `test/**` if the team accepts `!` in tests |
| `suspicious/noExplicitAny` | 9 | `src/logic/AudioManager.ts`, `src/hooks/useAudioPlayback.ts`, 3 test files | In `src`, type the error as `unknown` (see item 7). In tests, type the mocks with `vitest-mock-extended`, which is already a dependency |
| `suspicious/noGlobalIsFinite` | 2 | `src/hooks/useAudioPlayback.ts`, `src/utils/formatting.ts` | Use `Number.isFinite`. Safe here because both values are already numbers, so there is no coercion to lose |
| `style/useTemplate` | 2 | `src/logic/ParallelsPathResolver.ts` | Template literals |
| `style/useNodejsImportProtocol` | 2 | `vite.config.ts`, `vitest.config.ts` | `import path from "node:path"` |
| `complexity/noUselessCatch` | 1 | `src/hooks/useMusicPlayer.ts` | Delete the `try/catch` (item 6) |
| `correctness/noUnusedVariables` | 1 | `src/hooks/useAudioPlayback.ts` | Resolved by item 7 |
| `complexity/noImportantStyles`, `style/noDescendingSpecificity` | 2 | `src/App.css` | Resolved by item 8 |

Once the count is zero, run lint in CI with `biome lint --error-on-warnings` so new warnings fail the build.

**Two suppressions should be removed by fixing the cause:**

- `src/components/common/ContextMenu.tsx`: `useKeyWithClickEvents` on the menu items. The context menu cannot be operated with the keyboard. Proposal: render items as `<button type="button" role="menuitem">` inside a `role="menu"` container, focus the first item on open, and handle `ArrowUp`, `ArrowDown`, `Enter`. This is a behavior change and needs a rule in `docs/domain`.
- `src/components/songList/SongList.tsx`: `useExhaustiveDependencies` on the scroll effect, where `selectedSong` is a trigger rather than a value the effect reads. This one is legitimate and can stay, but it disappears if the effect is rewritten to derive the selected row from `selectedSong` instead of from a ref.

**The `useButtonType` rule is off for `test/**` and `e2e/**`** because two existing tests render `<button>` without `type`. Add `type="button"` to those two fixtures and delete the override.

**Formatting is still inconsistent.** The formatter and import sorting are disabled so the lint PR stays reviewable. The code mixes 2 and 4 space indentation, single and double quotes, optional trailing semicolons, and CRLF with LF.

Proposal, as its own PR containing only mechanical changes:

1. Enable `formatter` in `biome.json` with the style most of `src` already uses: 4 spaces, double quotes, semicolons. `App.tsx`, `main.tsx` and `vite.config.ts` use 2 spaces today and would be the files that change most.
2. Enable `assist.actions.source.organizeImports`.
3. Add a `.gitattributes` with `* text=auto eol=lf` so line endings stop depending on each machine's `core.autocrlf`.
4. Run `pnpm exec biome check --write` once, commit the result alone, and list that commit in a `.git-blame-ignore-revs` file so `git blame` skips it.
5. Replace the CI step with `pnpm exec biome ci`, which checks lint, format and import order together.

**Import style is mixed.** The same module is imported through an alias in one file and a relative path in another:

- `src/hooks/*` use `@logic/...`.
- `src/logic/FileService.ts` uses `../abstractions/FileDialog`, while `src/logic/Library.ts` uses `@abstractions/FileDialog`.
- `src/components/sidebar/library/LibrarySongItem.tsx` uses `../../../utils/formatting`; there is no `@utils` alias.
- `src/App.tsx` uses `./hooks/...` and `./logic/...` next to `@components/...`.

Proposal: one rule, written in `CONTRIBUTING.md`: aliases across layers, relative paths inside the same folder. Add `@hooks` and `@utils` aliases. Enforce it with Biome's `style/noRestrictedImports` or `nursery/useImportRestrictions` if a suitable rule is available in the installed version.

---

## 2. Single source of truth for the playlist

### Problem

`src/hooks/usePlaylistState.ts` keeps the same information in three places and synchronizes them by hand:

| Data | React state | Ref mirror | `PlaylistManager` |
| --- | --- | --- | --- |
| Songs | `playlist` | `playlistRef` | `songs` |
| Selection | `selectedSong` | `selectedSongRef` | `currentIndex` |
| Saved baseline | `hasUnsavedChanges` (derived) | `originalPlaylistRef` | none |

Every mutation has to remember to update all of them. `applyPlaylistUpdate`, `setPlaylist`, `setSelectedSong`, `selectNext`, `selectPrevious` and `removeSong` each update a different subset.

### Confirmed bug (fixed)

Fixed on branch `chore/add-biome-lint` by giving `setPlaylist` a fresh `PlaylistManager`, with regression tests under "after loading another playlist" in `usePlaylistState.test.ts`. The fix is a patch: the three copies of the state described above are still there, so the proposal below still applies. The description is kept as the motivating example.

Before the fix, `setPlaylist` cleared the React selection but `PlaylistManager.setSongs` keeps the previous `currentIndex` unless the new list is empty. The domain rule in [domain/playlist.md](domain/playlist.md) says loading a playlist "clears the selection".

Reproduced with a throwaway test against `usePlaylistState`:

1. Load an 8 song playlist and select song 7 (index 6).
2. Load a 3 song playlist. `selectedSong` is `null`, as expected.
3. Press `ArrowDown` (`selectNext`): nothing is selected.
4. Press `ArrowUp` (`selectPrevious`) three times: nothing is selected. The fourth press selects the last song.

The manager is walking an index that points past the end of the new list. When the new playlist is at least as long as the old index, the visible symptom is different: `ArrowDown` jumps to the old position plus one instead of starting from the top.

A second, smaller inconsistency lives in the same code: on a freshly loaded playlist with no selection, `setSongs` sets `currentIndex` to `0`, so the first `ArrowDown` selects the **second** song. An existing test (`usePlaylistState.test.ts`, "should navigate to previous song") asserts this. Whether that is intended is a product decision; [domain/playlist.md](domain/playlist.md) does not say what `ArrowDown` does with no selection.

### Why it matters

The bug above is a direct consequence of the design. Any new playlist operation (multi-select, undo, shuffle) has to be written three times and can go wrong in the same way.

### Proposal

Make the playlist a pure, immutable value in `src/logic` and let the hook hold exactly one piece of state.

1. Decide and document in `docs/domain/playlist.md` what `ArrowDown` and `ArrowUp` do when nothing is selected (suggestion: select the first song, and the last song, respectively).
2. Write failing tests for the bug and for the rule decided in step 1.
3. Replace `PlaylistManager` with pure functions over a single state object:

   ```ts
   // src/logic/PlaylistState.ts
   export interface PlaylistState {
       readonly songs: readonly Song[];
       readonly selectedId: string | null;
       readonly savedPaths: readonly string[];
   }

   export const emptyPlaylist: PlaylistState;
   export function load(songs: Song[]): PlaylistState;          // clears selection, sets baseline
   export function select(s: PlaylistState, song: Song | null): PlaylistState;
   export function selectNext(s: PlaylistState): PlaylistState;
   export function selectPrevious(s: PlaylistState): PlaylistState;
   export function peekNext(s: PlaylistState): Song | null;
   export function add(s: PlaylistState, song: Song): PlaylistState;
   export function addAtStart(s: PlaylistState, song: Song): PlaylistState;
   export function insertAfter(s: PlaylistState, ref: Song, song: Song): PlaylistState;
   export function move(s: PlaylistState, from: number, to: number): PlaylistState;
   export function remove(s: PlaylistState, song: Song): PlaylistState;   // includes resolveSelectionAfterRemoval
   export function markSaved(s: PlaylistState): PlaylistState;
   export function hasUnsavedChanges(s: PlaylistState): boolean;          // derived, not stored
   ```

4. Reduce `usePlaylistState` to `useReducer` (or `useState` with functional updates) over `PlaylistState`. The refs disappear: functional updates always see the latest state, which is the only reason `playlistRef` and `selectedSongRef` exist today. `peekNextSong`, which is called from an audio event handler, reads from one ref updated in a single place.
5. Keep the hook's public return shape so `useMusicPlayer` and `App.tsx` do not change.

### Test impact

- `test/logic/PlaylistManager.test.ts` is replaced by tests of the pure functions. These need no `renderHook` or `act`.
- `test/hooks/usePlaylistState.test.ts` (681 lines for a 150 line hook) shrinks to a few wiring tests, because the rules move to the logic tests.
- Run `pnpm test:e2e`: `e2e/arrow-navigation.spec.ts` covers this flow.

---

## 3. Route all Tauri calls through abstractions

### Problem

`src/abstractions` exists so logic can be tested without Tauri, but several call sites bypass it. [architecture.md](architecture.md) already lists them:

| Call site | Direct Tauri API | Consequence |
| --- | --- | --- |
| `src/logic/LibraryScanner.ts` | `readDir`, `join` | Tests must `vi.mock` two Tauri modules instead of passing a fake |
| `src/logic/Song.ts` | `convertFileSrc` | A domain value object depends on the runtime; `test/setup.ts` mocks it globally for every test |
| `src/App.tsx` | `getCurrentWindow`, `message`, `revealItemInDir` | The composition root contains IO and a `try/catch` for "not running in Tauri" |
| `src/components/sidebar/library/LibrarySongItem.tsx` | `revealItemInDir` | A presentational component performs IO and logs its own errors |
| `src/logic/FileService.ts` | `homeDir` through a dynamic import default | Hidden dependency created inside the constructor |

`FileService` also builds its own dependencies when none are passed (`fileDialog ?? new TauriFileDialog()`), so the logic layer imports the Tauri adapters. `useFileLoader` then does `fileService ?? new FileService()`. The real wiring is spread across three files.

### Proposal

1. Extend `FileSystem` with `readDir(path)` and `join(...parts)` (or add a small `DirectoryReader` interface if `FileSystem` should stay file-only) and implement them in `TauriFileSystem`. `scanLibraryAudioFiles` takes the abstraction as a parameter; `Library` receives it in its constructor.
2. Add three small interfaces in `src/abstractions`, each with a Tauri adapter in `src/logic`:

   ```ts
   export interface FileRevealer { reveal(path: string): Promise<void>; }
   export interface UserNotifier { showError(title: string, detail: string): Promise<void>; }
   export interface AppWindow {
       onCloseRequested(handler: (preventClose: () => void) => void): Promise<() => void>;
       destroy(): Promise<void>;
   }
   ```

   The "not in a Tauri context" fallback currently in `App.tsx` moves into the `AppWindow` adapter.
3. Add `PathProvider { homeDir(): Promise<string | null> }` and pass it to `FileService` instead of the inline dynamic import.
4. Move `Song.toMediaUrl()` out of `Song`. `Channel` is the only caller; give `Channel` (through `AudioManager`) a `toMediaUrl: (path: string) => string` function. `Song` becomes a pure value object and the global mock in `test/setup.ts` can be deleted.
5. Make the constructor parameters of `FileService` required and build everything once in a composition module, for example `src/composition.ts`, used by `main.tsx`:

   ```ts
   export function createServices() {
       const fileSystem = new TauriFileSystem();
       const fileDialog = new TauriFileDialog();
       return {
           fileService: new FileService(fileDialog, fileSystem, new TauriPathProvider()),
           library: new Library(fileDialog, new TauriSettingsStore(), fileSystem),
           revealer: new TauriFileRevealer(),
           notifier: new TauriUserNotifier(),
           appWindow: new TauriAppWindow(),
       };
   }
   ```

   Pass the services to `App` as props or through one React context. `LibrarySongItem` receives an `onRevealInExplorer` callback like `SongRow` already does.
6. Update the "Environment Boundaries" section of `architecture.md` and delete its "calls Tauri APIs directly" list.

### Test impact

`test/logic/LibraryScanner.test.ts`, `Song.test.ts`, `FileService.test.ts` and `LibrarySongItem.test.tsx` change how they set up their doubles. Assertions should not need to change.

Do this incrementally, one row of the table per PR.

---

## 4. Make library state reactive

### Problem

`src/logic/Library.ts` holds mutable state (`path`) that React does not know about, and `src/components/sidebar/library/Library.tsx` reads it during render:

- `getPath()` looks like a getter but writes `this.path` as a side effect.
- The component calls `libraryStore.hasLibrary()` and `libraryStore.getName()` while rendering. This only shows the right value because a `setLibraryPath` call happens to follow each mutation and trigger a re-render. Nothing enforces that ordering.
- The component also keeps its own copy of the path in `libraryPath` state, so the path lives in two places.
- The scan logic is written twice: once in the effect and once in `handleLibraryRefresh`. The refresh version has no unmount guard.
- There is no error handling. `void loadStoredLibraryPath()` and `void loadLibrarySongs()` discard the promise, so a failing `getSongs()` becomes an unhandled rejection and the user sees an empty list with no explanation.
- The message "No se encontraron archivos .mp3 o .wav" hard codes the extensions that `SUPPORTED_AUDIO_EXTENSIONS` in `src/logic/audioFormats.ts` already defines.
- Naming: the class `Library`, the component `Library` and the prop `store` (aliased to `libraryStore`) collide, which is why the component imports the class as `LibraryStore`.

### Proposal

1. Make the logic class stateless about the current path. It becomes a service with explicit inputs:

   ```ts
   export class LibraryService {
       loadSavedPath(): Promise<string | null>;
       chooseAndSavePath(): Promise<string | null>;   // was add()
       scan(path: string): Promise<string[]>;         // was getSongs()
   }
   export function libraryName(path: string): string; // was getName(), uses getFileName
   ```

   This is a rename of exported symbols and needs approval (`CLAUDE.md`, Do Not).
2. Add `src/hooks/useLibrary.ts` that owns all the state:

   ```ts
   export function useLibrary(service: LibraryService): {
       path: string | null;
       name: string | null;
       songs: string[];
       status: "idle" | "scanning" | "error";
       error: string | null;
       choose(): Promise<void>;
       refresh(): Promise<void>;
   };
   ```

   One internal `scan(path)` function serves both the initial load and the refresh, with one cancellation guard.
3. `Library.tsx` becomes presentational: it calls `useLibrary`, keeps only `searchQuery` state, and renders an error row when `status === "error"`.
4. Build the "no files found" message from `SUPPORTED_AUDIO_EXTENSIONS`.
5. Add the error behavior to `docs/domain/library.md` before implementing it.

### Test impact

`test/components/sidebar/library/Library.test.tsx` and `test/logic/Library.test.ts` change. New tests for `useLibrary` go in `test/hooks/useLibrary.test.ts`.

---

## 5. Slim down `App.tsx`

### Problem

`src/App.tsx` is the composition root and also contains three unrelated behaviors plus duplicated error handling:

- The same `try { await loadPlaylist() } catch { console.error; await message(...) }` block appears three times: once in `handleLoadPlaylist` and twice in `handleChangePlaylist`.
- The global keyboard shortcuts (`P`, `Space`, `S`, arrows) are an inline effect.
- The window close guard is an inline effect with its own cancellation logic and two "latest value" refs (`hasUnsavedChangesRef`, `showUnsavedChangesDialogRef`).
- The unsaved-changes dialog state and its `onSave` / `onDiscard` wiring live next to the JSX.
- `handleRemoveSong` only forwards to `removeSong`.
- The component destructures 26 values from `useMusicPlayer`.

### Proposal

1. Keep one load handler and reuse it:

   ```ts
   const loadPlaylistOrReport = useCallback(async () => {
       try {
           await loadPlaylist();
       } catch (error) {
           await notifier.showError("Error al cargar la lista", String(error));
       }
   }, [loadPlaylist, notifier]);

   const handleChangePlaylist = useCallback(() => {
       if (playingSong !== null) return;
       if (hasUnsavedChanges) confirmUnsavedChanges(loadPlaylistOrReport);
       else void loadPlaylistOrReport();
   }, [playingSong, hasUnsavedChanges, confirmUnsavedChanges, loadPlaylistOrReport]);
   ```

2. Extract three hooks into `src/hooks`:
   - `useKeyboardShortcuts({ onPlay, onPause, onStop, onNext, onPrevious })`, including `isTypingInTextField`.
   - `useUnsavedChangesDialog({ save })`, returning `{ dialogProps, confirmUnsavedChanges }`.
   - `useWindowCloseGuard({ shouldBlock, onBlocked })`, built on the `AppWindow` abstraction from item 3.
3. Pass `removeSong` directly and delete `handleRemoveSong`.
4. Optionally have `useMusicPlayer` return grouped objects (`playback`, `playlist`, `timing`) so `App` passes groups to `Player` and `SongList` instead of 26 loose values. This changes the hook's return shape and its tests, so treat it as a separate decision.

No behavior changes. `e2e/arrow-navigation.spec.ts` covers the shortcuts; the unsaved-changes flow should be checked by hand or with `pnpm test:e2e`.

---

## 6. Remove duplication and dead code

Small, independent cleanups. Each can be its own commit.

| Problem | Where | Fix |
| --- | --- | --- |
| "File name from path" is implemented five times with slightly different regexes | `getFileName` in `src/utils/formatting.ts`; `Song.getDisplayName`; `Library.getName`; `filterSongs` in `Library.ts`; `selectAndReadPlaylist` in `FileService.ts` | Use `getFileName` everywhere. Add `getFileNameWithoutExtension` next to it for `FileService`. `getFileName` is a path helper, so move both to `src/utils/paths.ts` (rename needs approval) |
| `if (parallelsHomeDir) save(a, b, c) else save(a, b)` written twice | `useFileLoader.savePlaylist`, `useMusicPlayer.saveCurrentPlaylist` | The parameter is already optional. Call `savePlaylist(path, songs, parallelsHomeDir ?? undefined)` once |
| `useFileLoader` only forwards two calls to `FileService` | `src/hooks/useFileLoader.ts` | Delete the hook and let `useMusicPlayer` use the injected `FileService` directly. Its test file moves into the `useMusicPlayer` tests |
| `try { ... } catch (err) { throw err; }` | `useMusicPlayer.loadPlaylist` | Delete the `try/catch` |
| The "fade finished" sequence (pause, reset time, reset volume, notify, callback) is written twice | `Channel.startFadeOut` | Extract a private `finishFade(onComplete?)` |
| `isSupportedAudioFile` only calls `isSupportedAudioPath` | `src/logic/LibraryScanner.ts` | Use `isSupportedAudioPath` directly |
| Unexplained condition `entry.isDirectory \|\| (!entry.isFile && !isSupportedAudioFile(entry.name))` | `src/logic/LibraryScanner.ts` | Name it, for example `const mayBeDirectoryLink = !entry.isFile && !entry.isDirectory`, and add a comment on why such entries are traversed |
| `SongRow.displayName = "SongRow"` on a named function | `src/components/songList/SongRow.tsx` | Delete; React infers the name |
| Hand written UUID v4 generator | `src/logic/Song.ts` | Use `crypto.randomUUID()` if the Tauri webview origin is a secure context on every supported platform. If it is not, keep the function and add a comment saying so |
| Context menu wiring (position state, `createPortal`, close handler) duplicated | `SongRow.tsx`, `LibrarySongItem.tsx` | Extract `useContextMenu(items)` returning `{ onContextMenu, menu }`. Now that there are two real uses, the abstraction is justified |
| `SongContextMenu.tsx` exists but `SongRow` builds its menu inline | `src/components/songList/` | Nothing in `src` or `e2e` imports `SongContextMenu`; only its own test does. Use it from `SongRow` or delete it together with its test |
| `getAudioElement` and `duration` are returned by `useMusicPlayer` but `App` does not use them | `src/hooks/useMusicPlayer.ts` | Check the tests; remove whatever only the hook's own tests read |

---

## 7. Handle errors at one boundary

### Problem

`CLAUDE.md` asks to "handle errors explicitly and fail at the right boundary instead of silently swallowing problems". Today the same error is handled at several layers, or at none:

| Where | What happens |
| --- | --- |
| `FileService.selectAndReadPlaylist`, `savePlaylist` | `console.error` then rethrow. `App.tsx` logs the same error again and shows a dialog, so it is logged twice |
| `App.tsx` unsaved-changes dialog, `onSave` | `saveCurrentPlaylist()` is not wrapped. If the write fails, the dialog stays open, nothing is shown, and the promise rejection is unhandled. The user can lose edits by choosing Discard afterwards without knowing the save failed |
| `useAudioPlayback` polling | `try { tick() } catch (e) { // ignore }` hides any bug in the tick function |
| `AudioManagerEvents.onError` | The error is typed `any` and only logged. The user gets no feedback when a song fails to play; playback state just resets |
| `TauriSettingsStore` | Both methods catch everything. A failed save means the library silently is not remembered on next launch |
| `LibraryScanner` | Unreadable directories are skipped without a trace. This is deliberate, but the user cannot tell a partial scan from a complete one |
| `App.handleRevealInExplorer`, `LibrarySongItem` | `console.error` only |
| `FileService` existence checks | `.catch(() => false)` turns a permission error into "file not found" |

### Proposal

Adopt one rule and write it in `CONTRIBUTING.md`: logic throws, hooks pass errors through, and the UI boundary decides what the user sees. Logging happens once, at that boundary.

1. Remove the log-and-rethrow blocks from `FileService`.
2. Wrap `saveCurrentPlaylist()` in the dialog's `onSave`: on failure, keep the dialog open and show the error through the notifier. Add this to `docs/domain/playlist.md` under "Unsaved Changes" and cover it with a test.
3. Delete the `try/catch` around `tick` in `useAudioPlayback`. If it was added for a specific WebView failure, catch that specific case inside `createTimingTick` with a comment.
4. Type `onError` as `(channelId: AudioChannel, error: unknown) => void` and surface playback failures: expose a `playbackError` from `useAudioPlayback` and show it, or mark the song as invalid. This is a behavior change that belongs in `docs/domain/playback.md` first.
5. `TauriSettingsStore.saveLibraryPath` should let the error propagate, and `useLibrary` (item 4) should report it. `getLibraryPath` returning `null` on failure is reasonable, but log it once.
6. `scanLibraryAudioFiles` returns `{ files, skippedDirectories }` so the UI can show "N folders could not be read".
7. Route both "reveal in explorer" failures through the notifier.

---

## 8. Configuration and styles

### Aliases are declared three times

`tsconfig.json`, `vite.config.ts` and `vitest.config.ts` each declare `@logic`, `@components` and `@abstractions`. `architecture.md` only mentions two of the files. `tsconfig.json` also carries entries that `@components/*` already covers (`@components/player`, `@components/songList`, `@components/sidebar`), which point at folders with no index file.

Proposal:

1. Make `vitest.config.ts` extend the Vite config so plugins and aliases are declared once:

   ```ts
   import { defineConfig, mergeConfig } from "vitest/config";
   import viteConfig from "./vite.config";

   export default defineConfig(async (env) =>
       mergeConfig(await viteConfig(env), {
           test: { environment: "jsdom", globals: true, setupFiles: ["./test/setup.ts"], exclude: [...] },
       }),
   );
   ```

2. Check whether the installed Vite version can read aliases from `tsconfig.json` (`resolve.tsconfigPaths`). If it can, `tsconfig.json` becomes the only place and the `alias` block is deleted. Confirm against the Vite documentation for the installed version before relying on it.
3. Remove the three redundant `paths` entries.

### One 836 line stylesheet

`src/App.css` holds every style in the app, with 12 separate `@media (prefers-color-scheme: dark)` blocks scattered through it. Components also carry 8 inline `style={{ ... }}` objects (`SongRow.tsx`, `SongList.tsx`, among others), so a component's appearance is defined in two places.

Proposal:

1. Split by the sections the file already marks with comments, one file next to each component, imported by that component: `Player.css`, `Sidebar.css`, `Library.css`, `PlaylistBanner.css`, `SongList.css`, `ConfirmDialog.css`, `ContextMenu.css`. Keep `:root` variables and the scrollbar rules in `src/styles/base.css`.
2. Express dark mode only through CSS variables declared once in `base.css`. Most of the 12 dark blocks then disappear because the rules reference variables instead of redefining colors.
3. Move inline styles to classes (`.song-row--dragging`, `.song-title__icon-slot`, and so on). The hard coded `#ff3b30` in `SongRow.tsx` becomes a variable.
4. Fix the two CSS lint warnings on the way: the `!important` near line 639 and the descending specificity near line 621.

CSS Modules are not needed to get these benefits and would be a larger change.

This is a visual change with no test coverage. Compare screenshots in light and dark mode before and after.

### User-facing strings are scattered

Spanish UI strings are hard coded in components, in `App.tsx`, and in the logic layer (`"Listas de reproducción"` in `FileService`). Internationalization is not needed today. A single `src/strings.ts` module with named constants would still make wording changes a one-file edit and remove UI text from `src/logic`. Low priority.

---

## 9. Tests

- **Test files much larger than the code they cover.** `usePlaylistState.test.ts` is 681 lines for 150 lines of source, `useAudioPlayback.test.ts` is 589 for 228. The cause is that rules are tested through `renderHook` and `act`. Items 2 and 4 move rules into pure functions, where each case is three lines.
- **Slow environment setup.** Vitest reports that jsdom is created once per test file (33 times) and that this is close to half of the tracked run time. Its own suggestion is `pool: "vmThreads"` or `isolate: false`. Additionally, tests under `test/logic` and `test/utils` do not need a DOM: give them the `node` environment through Vitest projects or a per-file `// @vitest-environment node` comment. Measure before and after.
- **No coverage signal.** Add `@vitest/coverage-v8` and a `test:coverage` script. Report it in CI without a threshold at first; set a threshold once the number is known.
- **`any` and `!` in tests.** See the table in item 1.
- **Global mocks.** `test/setup.ts` mocks `@tauri-apps/api/core` for every test because of `Song.toMediaUrl`. Item 3 removes the need.
