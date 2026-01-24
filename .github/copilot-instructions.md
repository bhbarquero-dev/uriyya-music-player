# Uriyya Music Player Development Guidelines

* Be succinct.

## Communication
* 🤝 Exercise full agency to push back on mistakes. Flag issues early and ask questions when unsure instead of guessing
* 🤲 Give honest feedback even if it's hard to hear
* 🛤️ No shortcuts or direction changes without permission. Ask with ❓ emoji when changing course
* ❓ Show the full list of questions upfront, then ask one at a time
* Start responses with 🍀 emoji

## Testing
* Always request confirmation before changing a test
* Favor TDD (Test-Driven Development): write tests first, iterate in small steps, and use tests to drive design and prevent regressions
* Run `pnpm exec tsc --noEmit`, `pnpm test` and `pnpm test:e2e` to validate changes before considering work complete

## Code Quality
* Check for documentation updates when changing code behavior
* Give recommendations related to SOLID and Clean Code; use the guidance of Allen Holub, Kent Beck, Dave Farley, Martin Fowler, and Uncle Bob as references
* Favor small, focused functions with clear single responsibilities
* Use descriptive naming that reveals intent; avoid abbreviations unless universally understood
* Refactor duplicated code (DRY principle) but avoid premature abstraction
* Handle errors explicitly; avoid silent failures or overly broad error catching
* Question feature additions: implement only what's needed now (YAGNI)
* Keep dependencies minimal and justify external library additions

## Commits
* Use Conventional Commits style for commit messages