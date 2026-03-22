# Uriyya Music Player Development Guidelines

* Be succinct.

## Communication
* Start responses with 🍀 emoji
* 🤝 Exercise full agency to push back on mistakes. Flag issues early and ask questions when unsure instead of guessing
* 🤲 Give honest feedback even if it's hard to hear
* Ask clarifying questions only when they unblock progress
* If critical information is missing, group the questions in a single message and do not guess
* ❓ If a tradeoff requires changing course, ask before doing it

## Repo Structure
* `src/components` contains UI components
* `src/hooks` contains reusable stateful coordination for the React app
* `src/logic` contains domain logic, services, and non-UI behavior
* `src/utils` and `src/abstractions` contain shared helpers and environment boundaries
* `src-tauri` contains native/Tauri code
* `test` contains unit and component tests mirroring the source areas they cover
* `e2e` contains Playwright end-to-end tests
* Keep code in the layer where it belongs; do not move it across layers without a concrete reason

## Change Rules
* Prefer the smallest change that fully solves the problem
* Before changing behavior, consult the relevant document under `docs/domain` and treat it as the source of truth unless the user explicitly overrides it
* Do not move code between components, hooks, and logic layers unless the current placement mixes responsibilities or creates duplication
* Do not add new dependencies unless existing platform APIs or repo utilities are insufficient; justify the addition
* When adding dependencies or using new capabilities from an existing dependency, prefer the newest compatible version; if the latest version would break compatibility, say so explicitly and use the newest safe version
* Update documentation only when behavior, commands, architecture, or workflow actually change
* If behavior changes or the implementation reveals that a domain rule is missing, outdated, or ambiguous, suggest updating the relevant document under `docs` before finishing the task
* Refactor only the code touched by the task unless a nearby design problem blocks the change

## Testing
* Favor TDD when behavior is changing: write a failing test, make it pass, then refactor
* **⚠️ CRITICAL: Always request confirmation before changing an existing test**
* You may add new tests for approved behavior changes
* If an existing test appears incorrect or obsolete, explain why before proposing a test change
* Place new unit and component tests under `test`, following the source area they cover
* Place new end-to-end tests under `e2e`

## Code Quality
* Apply SOLID and Clean Code through concrete decisions, not abstract slogans
* Favor small, focused units with one clear reason to change
* Extract logic when a unit mixes UI rendering, state coordination, and IO
* Keep components presentational when possible; move complex behavior to hooks or `src/logic`
* Use descriptive names that reveal intent and domain meaning
* Refactor duplication when it reduces maintenance cost; avoid abstractions before a second real need exists
* Handle errors explicitly and fail at the right boundary instead of silently swallowing problems
* Implement only what the current task needs

## Validation
* For TypeScript or React behavior changes, run `pnpm exec tsc --noEmit` and the relevant tests
* Run `pnpm test` before considering work complete when the change affects shared behavior or multiple components/hooks
* Run `pnpm test:e2e` when the change affects critical user flows such as navigation, playback, file loading, or persistence
* For Tauri or Rust changes, validate the affected Tauri build or command path as appropriate
* For documentation or GitHub configuration only changes, do not run the full suite unless commands or documented behavior changed

## Do Not
* Do not rename public files, exported symbols, or user-visible behavior without approval
* Do not reformat, reorder, or refactor unrelated code
* Do not add comments that only restate obvious code
* Do not silently ignore failures or replace them with vague TODOs
* Do not change unrelated tests as part of an implementation task

## Commits
* Use Conventional Commits style for commit messages