# Contributing to Uriyya Music Player

## Development Process

### Test-Driven Development (TDD)
We follow TDD practices in this project:

1. Write a test that fails
2. Write the minimum code to make the test pass
3. Refactor while keeping tests green

### Component Development Flow

1. **Planning**
   - Define component requirements
   - Identify props and state needed
   - Plan component structure

2. **Type Definitions**
```typescript
// types/component.ts
export interface ComponentProps {
  value: string;
  onChange: (value: string) => void;
}
```

3. **Test Writing**
```typescript
// components/Component/Component.test.tsx
describe('Component', () => {
  it('should render with initial value', () => {
    render(<Component value="test" onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });
});
```

4. **Implementation**
```typescript
// components/Component/index.tsx
export const Component: FC<ComponentProps> = ({ value, onChange }) => {

  return <input value={value} onChange={e => onChange(e.target.value)} />;
};
```

### Code Organization

#### Component Structure
```
components/
└── ComponentName/
    ├── index.tsx           # Main component
    ├── SubComponent.tsx    # Child components
    └── ComponentName.test.tsx # Co-located unit test
```

#### Business Logic
- Extract to custom hooks
- Keep components purely presentational
- Test hooks independently

#### Test Organization
- Unit tests should be co-located with the component they test (e.g., `Component.test.tsx` next to `index.tsx`).
- E2E tests and utilities are located in the `tests/` directory.

### Testing Guidelines

1. **Component Testing**
   - Test rendering
   - Test user interactions
   - Test prop changes
   - Test error states

2. **Hook Testing**
   - Test initialization
   - Test state changes
   - Test side effects
   - Mock external dependencies

3. **E2E Testing**
   - Test critical user paths
   - Test cross-window interactions
   - Test platform-specific features

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Follow commit message conventions
4. Request review from maintainers
5. Address review feedback

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
```
feat(player): add volume control

- Add volume slider component
- Implement volume change handler
- Add tests for volume control

Closes #123
```