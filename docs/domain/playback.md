# Playback

This document describes the current playback behavior implemented by the app.

## Purpose

Playback manages which song is actively sounding, which song is selected in the playlist, and the timing state exposed to the UI.

## Core Model

- `selectedSong` is the song highlighted for navigation and user intent.
- `playingSong` is the song currently assigned to the active audio channel.
- `isPlaying` indicates active playback.
- `isStopping` indicates that a fade-out stop is in progress.

## Invariants

- The player must not start playback for a song marked as invalid.
- Calling play on the same song while it is already playing is a no-op.
- Pausing stops active playback but keeps `playingSong` assigned and preserves `currentTime` and `duration`.
- Stopping clears `playingSong`, clears timing state, and sets `isStopping` while the fade-out completes.
- When playback ends naturally, `playingSong` becomes `null`, `isPlaying` becomes `false`, and timing resets.
- Timing state resets to `currentTime = 0` and `duration = null` after stop or natural end.

## User-Visible Rules

- `playSong(song)` selects the song and starts playback if the song is valid.
- `playCurrentSelected()` behaves as follows:
  - if playback is already active, do nothing
  - else if a song is selected, try to play that song
  - else if the playlist has songs, try to play the first song in the playlist
- `pause()` pauses playback without clearing the current song reference.
- `stop()` stops playback with fade-out, resets timing, and leaves the player in a non-playing state.
- `selectNextInList()` and `selectPreviousInList()` move selection within playlist bounds and clamp at the ends.
- When the current song ends naturally and there is a next song, the next song becomes selected but does not auto-play.
- When the current song is the last song, natural end stops playback with no wraparound.

## Transitions Between Songs

- The player uses two audio channels so one song can fade out while another starts.
- Starting a song while another is playing starts the new song immediately at full volume and fades the previous one out.
- Fade-outs, including the one used by `stop()`, last 6 seconds.
- While a stop fade-out is in progress the player shows a "stopping" state instead of a song name.
- If the audio element reports an error on the active channel, playback state is cleared and the error is logged.

## Seeking

- Clicking the progress bar seeks to the clicked position, as a fraction of the song duration.
- With the progress bar focused, `ArrowRight` and `ArrowLeft` seek forward and backward by 5% of the duration.
- Seeking is a no-op while the duration is unknown, which includes when no song is loaded.
- The player shows elapsed time and remaining time; remaining time is blank while the duration is unknown.

## Required Keyboard Shortcuts

- Pressing `P` must attempt to play the currently selected song.
- If no song is selected, pressing `P` must attempt to play the first song in the playlist.
- If playback is already active, pressing `P` must do nothing and must not restart or switch the current song.
- Pressing `S` must stop playback using fade-out rather than an abrupt cut.
- Pressing `Space` must pause playback.
- Pressing `ArrowDown` or `ArrowUp` must move the selection to the next or previous song in the playlist.
- Playback and navigation shortcuts must be ignored while focus is inside a text input or textarea.

## Edge Cases

- An empty playlist cannot produce a selection through next or previous navigation.
- If the first playlist song is invalid, `playCurrentSelected()` does not start playback.
- Rapidly switching songs should leave the latest requested song as `playingSong`.
- If a new song starts while the previous one is still fading out, the new song must remain the active playback state.

## Related Code

- `src/hooks/useMusicPlayer.ts`
- `src/hooks/useAudioPlayback.ts`
- `src/hooks/usePlaylistState.ts`
- `src/logic/AudioManager.ts`
- `src/logic/Channel.ts`
- `src/components/player/ProgressBar.tsx`
- `src/App.tsx`
- `test/hooks/useMusicPlayer.test.ts`
- `test/hooks/useMusicPlayer.time.test.ts`