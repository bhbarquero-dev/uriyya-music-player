# Uriyya Music Player

![GitHub License](https://img.shields.io/github/license/bhbarquero-dev/uriyya-music-player)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/bhbarquero-dev/uriyya-music-player/build.yml)

Uriyya Music Player is a desktop music player built with React + TypeScript and packaged with Tauri. It provides a lightweight UI for playing local audio files and demonstrates integration between a modern web frontend and native desktop capabilities.

## Prerequisites
- [Tauri](https://v2.tauri.app/start/prerequisites/) 
- pnpm

## Quick Start (Development)
1. Install dependencies:

	```bash
	pnpm install
	```

2. In a separate terminal, run the Tauri dev environment (this will open the desktop window and load the frontend):

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

## Project Structure (high level)
- `src/` — React app source (components, hooks, logic)
- `public/` — static assets
- `src-tauri/` — Tauri/Rust configuration and native code
- `test/` — unit tests

## Notes & Troubleshooting
- If Tauri commands fail, ensure the Rust toolchain is installed and up to date.
- If the app can't connect in dev mode, verify the frontend dev server URL and port (configured in `src-tauri/tauri.conf.json`).

## Contributing
Contributions are welcome — please follow the contribution guidelines in [CONTRIBUTING.md](CONTRIBUTING.md). The document describes the development flow, testing practices, and the pull request process.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
