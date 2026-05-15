# RTK — Token-Optimized CLI

**rtk** is a CLI proxy that filters and compresses command outputs, saving 60-90% tokens.

## Rule

Always prefix shell commands with `rtk`:

```bash
# Instead of:              Use:
git status                 rtk git status
git log -10                rtk git log -10
cargo test                 rtk cargo test
docker ps                  rtk docker ps
kubectl get pods           rtk kubectl pods
```

## Meta commands (use directly)

```bash
rtk gain              # Token savings dashboard
rtk gain --history    # Per-command savings history
rtk discover          # Find missed rtk opportunities
rtk proxy <cmd>       # Run raw (no filtering) but track usage
```

# Project Guidelines

## Code Style

- Use TypeScript strict typing. Avoid `any`; prefer `unknown` plus type guards when needed.
- Type all component props, function parameters, and return values.
- Follow import order from [refactoring-plans/DEVELOPMENT_STANDARDS.md](../refactoring-plans/DEVELOPMENT_STANDARDS.md):
  1. React/Next
  2. Third-party libs
  3. Internal `@elzatona/*`
  4. Relative components
  5. Relative utilities
  6. Type-only imports last (`import type ...`)
- Use path conventions from [refactoring-plans/FILE_PATH_CONVENTIONS.md](../refactoring-plans/FILE_PATH_CONVENTIONS.md):
  - Cross-lib imports via `@elzatona/*`
  - In-app imports via `@/`
  - Do not use deep relative cross-package imports
- Keep components reasonably sized and split responsibilities early. If a file is growing large, refactor into smaller units following [refactoring-plans/DEVELOPMENT_STANDARDS.md](../refactoring-plans/DEVELOPMENT_STANDARDS.md).

## Architecture

- This is an Nx monorepo with two primary apps:
  - [apps/website](../apps/website): Next.js App Router
  - [apps/admin](../apps/admin): Next.js admin app (separate runtime and port)
- Shared logic should live in libs, not duplicated in apps:
  - UI: [libs/common-ui](../libs/common-ui)
  - Hooks: [libs/hooks](../libs/hooks)
  - Context: [libs/contexts](../libs/contexts)
  - Types: [libs/types](../libs/types)
  - Utilities: [libs/utilities](../libs/utilities)
  - Database abstractions: [libs/database](../libs/database)
- For feature work, start from [features/README.md](../features/README.md) and align with each feature's spec/BDD/TDD/test-design docs.

## Build and Test

- Preferred package manager for commands in this repo: `npm`.
- Core commands:
  - Install: `npm install`
  - Website dev: `npm run dev` (port 3000)
  - Admin dev: `npm run dev:admin` (port 3001)
  - Build check: `npm run build:check`
  - Lint: `npm run lint` or `npm run lint:all`
  - Typecheck: `npm run type-check`
  - Unit/integration tests: `npm run test` or targeted scripts in [package.json](../package.json)
  - E2E: `npm run test:e2e` (Playwright, config in [tests/config/playwright.config.ts](../tests/config/playwright.config.ts))
- Most test scripts run with constrained memory/workers by design. Preserve existing flags unless intentionally tuning performance.
- Use environment setup docs before running app/test commands: [docs/flows/environment-setup.md](../docs/flows/environment-setup.md).

## Low-Resource AI Workflow

- This repository is frequently developed on 8GB RAM machines. Prefer low-memory workflows by default.
- Before heavy analysis, use focused queries and narrow file scopes. Avoid broad full-repo scans unless explicitly requested.
- Prefer low-memory scripts when available:
  - `npm run dev:low-ram`
  - `npm run dev:low-ram:admin`
  - `npm run check:low-ram`
  - `npm run sonar:light`
  - `npm run sonar:quick`
  - `npm run sonar:report:blockers`
- During issue fixing, run report-first Sonar flow:
  1. `npm run sonar:report:blockers`
  2. fix listed files/issues
  3. `npm run sonar:report:new-code`
  4. run `npm run sonar:light` only when needed
- For local dev and tests, keep workers low and preserve existing memory limits in package scripts.
- Do not run multiple heavyweight processes in parallel (for example: full Sonar scan + E2E + multiple dev servers).
- Do not require Java/Sonar extensions in editor for routine coding; prefer on-demand CLI scans.
- If memory pressure is high, prioritize these commands:
  - `npm run cleanup:build-cache`
  - `npm run system:memory`

## Conventions

- Keep unit/integration tests co-located with source files; keep E2E in [tests/e2e](../tests/e2e). See [docs/testing/TEST_ORGANIZATION.md](../docs/testing/TEST_ORGANIZATION.md).
- Before finalizing substantial code changes, run at least:
  - `npm run lint`
  - `npm run type-check`
  - relevant test command(s)
- Respect security pipeline rules in [docs/SECURITY.md](../docs/SECURITY.md) and [docs/flows/ci-cd-pipeline.md](../docs/flows/ci-cd-pipeline.md):
  - Never commit secrets
  - Do not bypass verification hooks unless explicitly requested
  - Validate/sanitize user input on API and UI paths
- Keep changes scoped. Do not refactor unrelated areas unless requested.
- If introducing new behavior, update or add tests and keep docs in sync when behavior/specs change.

## Key References

- Root overview: [README.md](../README.md)
- Documentation index: [docs/README.md](../docs/README.md)
- Project structure: [docs/structure.md](../docs/structure.md)
- Development standards: [refactoring-plans/DEVELOPMENT_STANDARDS.md](../refactoring-plans/DEVELOPMENT_STANDARDS.md)
- Feature index/spec workflow: [features/README.md](../features/README.md)
