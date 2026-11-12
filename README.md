# Uriyya Music Player

![GitHub License](https://img.shields.io/github/license/bhbarquero-dev/uriyya-music-player)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/bhbarquero-dev/uriyya-music-player/ci.yml)

Uriyya Music Player is a desktop music player built with React + TypeScript and packaged with Tauri. It provides a lightweight UI for playing local audio files and demonstrates integration between a modern web frontend and native desktop capabilities.

## Features
- Plays local `.mp3` and `.wav` files.
- Loads playlists from `.txt` and `.alb` files (one absolute file path per line).
- Edits the loaded playlist: reorder by drag and drop, add songs from the library, remove songs, and save back to the same file.
- Flags playlist entries whose file is missing on disk.
- Browses and searches a library directory, remembered across launches.
- Fades out on stop and when switching songs.
- Click-to-seek progress bar with elapsed and remaining time.

The user interface is in Spanish.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `P` | Play the selected song, or the first song if none is selected |
| `Space` | Pause |
| `S` | Stop with fade-out |
| `↑` / `↓` | Select the previous / next song |
| `←` / `→` | Seek backward / forward 5% (with the progress bar focused) |

Shortcuts are ignored while typing in a text field.

## Download
Installers for Windows, macOS (Intel build), and Linux are published on the [Releases](https://github.com/bhbarquero-dev/uriyya-music-player/releases) page.

## Prerequisites
- [Node.js](https://nodejs.org/) LTS
- pnpm, enabled through Corepack (`corepack enable`); the version is pinned in `package.json`
- Rust and the platform dependencies listed in the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Quick Start (Development)
1. Install dependencies:

	```bash
	pnpm install
	```

2. Run the Tauri dev environment (this starts the frontend dev server and opens the desktop window):

	```bash
	pnpm tauri dev
	```

The Tauri config expects the frontend dev server at `http://localhost:1420` for development.

## Build (Production)
1. Build the native desktop application with Tauri:

	```bash
	pnpm tauri build
	```

The final bundles and installers will be created under the Tauri build output for your platform.

## Testing
Run unit tests with Vitest:

```bash
pnpm test
```

Run the same local validation sequence used by CI:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm build
pnpm tauri build --debug --no-bundle
```

Run end-to-end tests with Playwright:

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install chromium

# Run e2e tests
pnpm run test:e2e

# Run e2e tests in UI mode (interactive)
pnpm run test:e2e:ui
```

See the [e2e/README.md](e2e/README.md) for more details about e2e testing.

## Project Structure (high level)
- `src/` — React app source (components, hooks, logic)
- `src-tauri/` — Tauri/Rust configuration and native code
- `test/` — unit and component tests
- `e2e/` — end-to-end tests with Playwright
- `docs/` — product rules and architecture

## Documentation
- [Product constitution](docs/constitution.md) — scope and global rules
- Domain rules: [playback](docs/domain/playback.md), [playlist](docs/domain/playlist.md), [library](docs/domain/library.md), [persistence](docs/domain/persistence.md)
- [Architecture](docs/architecture.md) — layers, boundaries, and native permissions

## Notes & Troubleshooting
- If Tauri commands fail, ensure the Rust toolchain is installed and up to date.
- If the app can't connect in dev mode, verify the frontend dev server URL and port (configured in `src-tauri/tauri.conf.json`).

## Contributing
Contributions are welcome — please follow the contribution guidelines in [CONTRIBUTING.md](CONTRIBUTING.md). The document describes the development flow, testing practices, and the pull request process.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
