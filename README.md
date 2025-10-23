# FoodDealSniper Monorepo

A TypeScript-first full-stack workspace for the FoodDealSniper project. The repository is managed with pnpm workspaces and ships with consistent tooling so both the API and the web client share the same linting, formatting, and commit-time checks.

## Project layout

```
/
├── packages/
│   ├── backend/      # Express + TypeScript REST API skeleton
│   └── frontend/     # Vite + React + Tailwind CSS + DaisyUI client
├── .devcontainer/    # VS Code devcontainer definition powered by the Dockerfile
├── docker-compose.yml
├── Dockerfile
└── shared config     # ESLint, Prettier, Husky, tsconfig.base.json, etc.
```

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (install via `corepack enable` or `npm install -g pnpm`)
- Docker (optional, for containerised development)

## Getting started

```bash
# Install dependencies for every workspace package
corepack enable                 # enables pnpm if it is not already active
pnpm install

# Run both the API and the web client in watch mode
pnpm dev

# Or run individual packages
pnpm dev:backend
pnpm dev:frontend
```

The backend boots on [http://localhost:4000](http://localhost:4000) and exposes a REST API for deals, filters, user preferences, and saved searches, plus Server-Sent Events (SSE) for live deal notifications. The frontend runs on [http://localhost:5173](http://localhost:5173) and provides a full-featured UI with advanced search, filtering, sorting, live alerts, user preferences, and saved searches.

### Scripts

Common scripts are defined at the package level and can be run from the repo root thanks to pnpm filters:

| Command                                      | Description                                                    |
| -------------------------------------------- | -------------------------------------------------------------- |
| `pnpm build`                                 | Builds every package in dependency order.                      |
| `pnpm lint`                                  | Runs ESLint with the shared configuration across all packages. |
| `pnpm format`                                | Formats source files with Prettier in each package.            |
| `pnpm test`                                  | Invokes the `test` script for every workspace package.         |
| `pnpm test:e2e`                              | Runs Playwright end-to-end tests covering all user journeys.   |
| `pnpm test:e2e:ui`                           | Runs Playwright tests in interactive UI mode.                  |
| `pnpm --filter @fooddealsniper/backend lint` | Example of targeting a specific package.                       |

### Tooling highlights

- **TypeScript everywhere** – root `tsconfig.base.json` keeps compiler options consistent while each package extends it with its own build targets.
- **Shared linting & formatting** – `.eslintrc.cjs`, `.prettierrc.cjs`, and `.lintstagedrc.cjs` live at the workspace root so every package adheres to the same rules.
- **Commit hooks** – Husky + lint-staged run ESLint/Prettier on staged changes via the pre-commit hook. After cloning, install the hooks once with `pnpm prepare` (automatically runs on `pnpm install`).
- **Tailwind CSS + DaisyUI** – already configured in the Vite frontend with ready-made components so styling is consistent out of the box.

## Docker & devcontainers

For a reproducible environment you can rely on either Docker or VS Code devcontainers:

- **Docker** – `docker compose up --build` will create a single container using the root `Dockerfile`, install dependencies with pnpm, and start both backend and frontend services.
- **Devcontainer** – open the repository in VS Code and choose **“Reopen in Container”**. The `.devcontainer/devcontainer.json` file configures the same Dockerfile, installs dependencies, and exposes ports 4000 & 5173.

## Features

### Backend API

- **Deals API** (`/api/deals`) – Search, filter, and sort deals with support for text search, tags, cuisine, vendor, discount range, and expiration filters
- **Filter metadata** – Endpoints for available cuisines, vendors, and tags
- **User preferences** – Store and retrieve user notification preferences, preferred cuisines, and alert channels
- **Saved searches** – Save, retrieve, and delete search configurations
- **Live notifications** – Server-Sent Events (SSE) endpoint (`/api/events`) for real-time deal alerts

### Frontend Features

- **Advanced search** – Full-text search with tag support
- **Multi-faceted filtering** – Filter by cuisine, vendor, discount range, and expiration
- **Flexible sorting** – Sort by discount, expiration date, creation date, or title
- **Live alerts** – Real-time toast notifications for new deals using SSE
- **User preferences** – Modal for managing notification settings, preferred cuisines, discount thresholds, and alert channels
- **Saved searches** – Save, load, and delete search configurations with optional auto-notifications
- **Responsive UI** – Built with Tailwind CSS and DaisyUI for a modern, accessible interface

### End-to-End Tests

Comprehensive Playwright test suite covering:

- Search and filter functionality
- Saved searches workflow
- User preferences management
- Live alert system
- Complete user journeys from discovery to tracking

See `e2e/README.md` for detailed test documentation.

## Next steps

- Implement backend persistence (database)
- Add user authentication and authorization
- Integrate with real deal sources/scrapers
- Deploy to production environment

Happy hacking!
