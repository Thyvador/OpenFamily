# Contributing to OpenFamily

Thank you for helping improve OpenFamily, an open-source, self-hosted family organizer.

## Before You Start

- Check existing issues and pull requests before starting work.
- For significant changes, open an issue or discussion first so the approach can be agreed on.
- Do not include secrets, private configuration, generated credentials, or personal data in commits.
- Report security vulnerabilities privately as described in [SECURITY.md](SECURITY.md), not in a public issue.

## Development Setup

Requirements:

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 16 for local server development, or Docker

Install dependencies for all workspaces:

```bash
npm run install:all
```

For a local development environment:

```bash
cp .env.example .env
# Edit .env with local PostgreSQL and application settings.
npm run dev
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:3001`.

## Project Structure

- `client/`: React, TypeScript, Vite, and PWA frontend
- `server/`: Express API, PostgreSQL access, authentication, and integrations
- `shared/`: Shared TypeScript types and constants
- `.github/workflows/`: CI, release, and packaging workflows

Keep changes focused. Update translations for user-visible text, preserve server-side authorization, and keep the demo mock API aligned with API behavior when changing frontend API calls.

## Validation

Run relevant checks before opening a pull request:

```bash
npm run build:shared
npm run build:server
npm run build:client
```

For API, Docker, or database changes, also run:

```bash
npm run smoke:api
```

CI additionally checks public-safe content and audits production dependencies. Run these locally when relevant:

```bash
node scripts/check-public-safe.mjs
node scripts/audit-ci.mjs
```

Include validation results in the pull request description. If a check cannot be run, explain why.

## Branches and Pull Requests

- Create focused branches from `main`.
- Keep pull requests small enough to review.
- Explain the problem, solution, user-visible impact, and any migration or deployment considerations.
- Add or update tests and documentation when behavior changes.
- Include screenshots or short recordings for meaningful UI changes.
- Confirm that CI passes before requesting review.
- Do not commit build output, local `.env` files, or dependency installation artifacts unless explicitly required.

## Commit Messages

Use Conventional Commits:

```text
<type>(<scope>): <imperative summary>
```

Examples from project history:

```text
feat(recipes): add recipe pagination
fix(i18n): translate recipe filter labels
docs(readme): explain published images
build(deps): bump nodemailer
chore(release): 1.7.1
```

Use these types:

- `feat`: new user-facing capability
- `fix`: bug or regression correction
- `docs`: documentation-only change
- `refactor`: behavior-preserving code restructuring
- `perf`: performance improvement
- `test`: tests or test infrastructure
- `build`: dependencies or build system changes
- `ci`: continuous integration or delivery changes
- `chore`: maintenance work, releases, or repository housekeeping

Available scopes should identify affected area. Existing scopes include:

- `ai`: AI providers and recipe refinement
- `android`: Android or Capacitor packaging
- `auth`: authentication and registration
- `budget`: budget and Kakeibo features
- `calendar`: appointments and calendar integrations
- `categories`: family-customizable categories
- `data`: import, export, and portable data format
- `deps`: dependency updates
- `docker`: Docker and Compose configuration
- `family`: family members, invitations, and permissions
- `i18n`: translations and localization
- `integrations`: external service integrations
- `meals`: meal planning
- `notifications`: push and in-app notifications
- `planning`: weekly planning
- `posts`: family posts and shared feed
- `recipes`: recipes and recipe integrations
- `security`: security controls or fixes
- `server`: backend changes without a narrower scope
- `shopping`: shopping lists and store mode
- `tasks`: tasks and recurring tasks
- `ui`: shared frontend components or visual system
- `client`: frontend changes without a narrower scope

Use a scope only when it adds useful context. Omit it for repository-wide changes:

```text
docs: clarify contribution workflow
```

Keep the summary concise, written in the imperative mood, and avoid ending it with a period. Use the commit body when context or motivation is not obvious. Breaking changes must include `!` after type/scope or a `BREAKING CHANGE:` footer.

## License

By contributing, you agree that your contributions are provided under the project's AGPL-3.0 license.
