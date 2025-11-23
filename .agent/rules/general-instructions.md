---
trigger: always_on
---

# Uriyya Music Player Development Guidelines

* Be sucintt.

## Important Reminders
* 🤝 Exercise full agency to push back on mistakes. Flag issues early, ask questions if unsure of direction instead of choosing randomly
* 🤲 Don't flatter me. Give me honest feedback even if I don't want to hear it
* 🛤️ No shortcuts or direction changes without permission. Ask with❓emoji when changing course
* ❓ If you need to ask me a list of questions, show me the list and then start asking one question at a time

* Start any response with an emoji as START_CHARACTER. By default is the 🍀 emoji.
* Always request comfirmation before change a test.
* Always check for posibles documentation updates when changing code behavior.

## Test-Driven Development (TDD)

### Test Structure
- Tests located in `/tests` directory
  - `/tests/unit/`: Unit tests for components and hooks
  - `/tests/e2e/`: End-to-end tests with Playwright
  - `/tests/utils/`: Test utilities and mocks

### Testing Tools
- Jest + React Testing Library for components
- Playwright for E2E testing
- Custom test utilities in `tests/utils/`

### TDD Workflow
1. Write test first
2. Run test to see it fail
3. Write minimum code to pass test
4. Refactor while keeping tests green

### Component Testing Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render with default props', () => {
    render(<ComponentName {...defaultProps} />);
    // Assertions
  });

  it('should handle user interactions', () => {
    const onAction = jest.fn();
    render(<ComponentName onAction={onAction} />);
    // Trigger actions and verify
  });
});
```

## Project Architecture

This is an Electron-based music player built with React, TypeScript, and Vite. The application follows a main/renderer process architecture:

- `src/main/`: Electron main process code
  - `main.ts`: Window management and app lifecycle
  - `preload.ts`: Bridge between main and renderer processes
- `src/renderer/`: React-based UI components
  - Components follow a modular structure in `components/`
  - Styles are organized in `styles/` with CSS modules

## Key Development Patterns

### Electron Integration
- Use `@electron/remote` for renderer-to-main process communication
- Main window is frameless (`frame: false`) with custom window controls
- Window controls are platform-aware (Windows/macOS/Linux)

### Component Structure
- Separation of concerns:
  - Component Props interface in `types/`
  - Business logic in custom hooks
  - Pure UI components with props
  - Utility functions in `utils/`

Example structure:
```
src/
├── components/
│   └── Player/
│       ├── index.tsx         # Main component
│       ├── VolumeControl.tsx # Sub-component
│       └── ProgressBar.tsx   # Sub-component
├── hooks/
│   └── useAudioPlayer.ts    # Business logic
├── types/
│   └── player.ts            # Type definitions
└── utils/
    └── time.ts             # Shared utilities
```

- Components are pure functions of their props
- Business logic isolated in custom hooks
- Clear interfaces for testing
- Shared utilities for common functions

### Component Pattern
```typescript
// types/component.ts
export interface ComponentProps {
  value: string;
  onChange: (value: string) => void;
}

// hooks/useComponentLogic.ts
export function useComponentLogic(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  // Business logic here
  return { value, setValue };
}

// components/Component/index.tsx
export const Component: FC<ComponentProps> = ({ value, onChange }) => {
  // Only UI logic here
  return (
    <div>
      <input value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
};
```

## Build System

- Vite-based build configuration with Electron Forge
- Three separate Vite configs:
  - `vite.main.config.ts`: Main process
  - `vite.preload.config.ts`: Preload scripts
  - `vite.renderer.config.ts`: Renderer process

### Common Commands
- `pnpm start`: Development mode
- `pnpm make`: Build distributables
- `pnpm lint`: Run ESLint checks

## Code Style

### Commit Messages
- Follow Conventional Commits standard
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### File Organization
- One component per file
- Styles in separate CSS files
- Type definitions in `.d.ts` files
- Config files in root directory

## Critical Patterns to Follow

1. Window Controls:
```typescript
// Always check platform for UI customization
const [platform] = useState<'win32' | 'darwin' | 'linux'>('win32');
useEffect(() => {
    const nodePlatform = require('@electron/remote').process.platform;
    setPlatform(nodePlatform);
}, []);
```

2. Electron Security:
- Never enable nodeIntegration without contextIsolation
- Use preload scripts for secure IPC
- Validate all input from renderer process

3. CSS Structure:
```css
.component-name {
    /* Use CSS custom properties for theming */
    background-color: var(--background-elevated);
    /* Use grid/flex for layouts */
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
}
```

