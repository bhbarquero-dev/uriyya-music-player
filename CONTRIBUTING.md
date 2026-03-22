# Contributing to Uriyya Music Player

## Development Process

### Test-Driven Development (TDD)
We follow TDD practices in this project:

1. Write a test that fails
2. Write the minimum code to make the test pass
3. Refactor while keeping tests green

When working with existing tests, confirm before changing or removing them. Adding new tests for approved behavior changes is encouraged.

### Project Structure

- `src/components` contains UI components
- `src/hooks` contains reusable stateful coordination for the React app
- `src/logic` contains domain logic, services, and non-UI behavior
- `src/utils` and `src/abstractions` contain shared helpers and environment boundaries
- `src-tauri` contains native/Tauri code
- `test` contains unit and component tests mirroring the source areas they cover
- `e2e` contains Playwright end-to-end tests

Keep code in the layer where it belongs. Do not move code between layers unless the current placement is causing duplication or mixing responsibilities.

### Change Expectations

- Prefer the smallest change that fully solves the problem
- Keep components presentational when possible and move complex coordination to hooks or `src/logic`
- Avoid adding dependencies unless existing platform APIs or repo utilities are insufficient
- Update documentation only when behavior, commands, architecture, or workflow actually change
- Refactor only the code touched by the task unless a nearby design problem blocks the change

### Implementation Flow

1. **Planning**
   - Define the behavior to change
   - Identify the layer where the change belongs
   - Decide whether the change needs unit, integration, or e2e coverage

2. **Test Writing**
   - Add a failing test first when behavior is changing
   - Put unit and component tests under `test`, following the source area they cover
   - Put end-to-end tests under `e2e`

3. **Implementation**
   - Favor small, focused units with one clear reason to change
   - Extract logic when a unit mixes UI rendering, state coordination, and IO
   - Use descriptive names that reveal intent and domain meaning
   - Handle errors explicitly at the right boundary

### Code Organization

#### Business Logic
- Extract to custom hooks
- Keep components purely presentational
- Test hooks independently

#### Test Organization
- Unit and component tests live under `test/`
- Hook tests live under `test/hooks/`
- Logic and service tests live under `test/logic/`
- End-to-end tests live under `e2e/`

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
   - Test navigation, playback, file loading, and persistence flows when affected
   - Keep e2e coverage focused on behavior that matters across boundaries

### Validation

- For TypeScript or React behavior changes, run `pnpm exec tsc --noEmit` and the relevant tests
- Run `pnpm test` when the change affects shared behavior or multiple components/hooks
- Run `pnpm test:e2e` when the change affects critical user flows such as navigation, playback, file loading, or persistence
- For Tauri or Rust changes, validate the affected Tauri build or command path as appropriate
- For documentation or GitHub configuration only changes, do not run the full suite unless commands or documented behavior changed

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Follow commit message conventions
4. Request review from maintainers
5. Address review feedback

### Do Not

- Do not rename public files, exported symbols, or user-visible behavior without approval
- Do not reformat, reorder, or refactor unrelated code
- Do not add comments that only restate obvious code
- Do not silently ignore failures or replace them with vague TODOs
- Do not change unrelated tests as part of an implementation task

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