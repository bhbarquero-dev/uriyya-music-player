# E2E Testing with Playwright

This directory contains the end-to-end (e2e) tests for Uriyya Music Player, written with Playwright.

## What Is Covered

The e2e tests validate the app's behavior in a real browser:

- **Arrow key navigation**: when moving between songs with ArrowUp/ArrowDown, the selected row stays visible inside the scrollable container.
- **Automatic scrolling**: the scroll position adjusts when the user navigates beyond the visible area.
- **List boundaries**: navigation behaves correctly when reaching the first and the last song.

## Requirements

- Node.js LTS
- pnpm (enabled with `corepack enable`)
- Playwright browsers installed

## Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium
```

## Running the Tests

### Headless mode (default)

```bash
pnpm run test:e2e
```

### UI mode (interactive)

```bash
pnpm run test:e2e:ui
```

### HTML report

After a run, an HTML report is generated:

```bash
pnpm exec playwright show-report
```

## Test Files

- `arrow-navigation.spec.ts`: arrow key navigation and scroll validation

## Important Notes

1. **Mock data**: the tests do not use real music files. They inject a mock song list into the page and validate navigation and scrolling against it.

2. **Frontend in a browser**: the tests run against the Vite dev server at `http://localhost:1420` (Playwright starts it automatically) using Chromium, not against the Tauri window, so native APIs are not available.

3. **CI/CD**: the tests run automatically in the GitHub Actions CI pipeline.

## Debugging

```bash
# Run in debug mode
pnpm exec playwright test --debug

# Run a specific test file
pnpm exec playwright test arrow-navigation

# Open the trace of a failed test
pnpm exec playwright show-trace trace.zip
```

## Adding New Tests

1. Create a new `.spec.ts` file in this directory
2. Import `test` and `expect` from `@playwright/test`
3. Write the test cases
4. Make sure the tests do not depend on real music files or Tauri APIs

## References

- [Playwright documentation](https://playwright.dev)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
