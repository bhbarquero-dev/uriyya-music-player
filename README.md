# Uriyya Music Player

A modern, cross-platform music player built with Electron, React, and TypeScript.

## Development

### Prerequisites
- Node.js (v18.x or higher)
- pnpm (v10.x or higher)
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/bhbarquero-dev/uriyya-music-player.git
cd uriyya-music-player

# Install dependencies
pnpm install

# Start development server
pnpm start
```

### Testing
This project follows Test-Driven Development (TDD) practices.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

### Project Structure
```
uriyya-music-player/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts       # Main entry point
│   │   └── preload.ts    # Preload scripts
│   ├── renderer/         # React UI components
│   │   ├── components/   # React components
│   │   ├── hooks/       # Custom React hooks
│   │   └── styles/      # CSS modules
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Shared utilities
├── tests/
│   ├── unit/            # Unit tests
│   ├── e2e/            # End-to-end tests
│   └── utils/          # Test utilities and mocks
└── ...config files
```

### Development Guidelines

#### Component Development
1. Start with types:
   - Define component props interface
   - Create necessary data models

2. Write tests:
   - Unit tests for components
   - Tests for custom hooks
   - Integration tests if needed

3. Implement:
   - Create pure UI components
   - Extract business logic to hooks
   - Add utility functions as needed

#### Testing Patterns
```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders successfully', () => {
    const props = {
      // ... test props
    };
    render(<ComponentName {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Build
```bash
# Create production build
pnpm make
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD)
4. Implement your changes
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.