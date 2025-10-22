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

The backend boots on [http://localhost:4000](http://localhost:4000) and currently exposes a health-check endpoint. The frontend runs on [http://localhost:5173](http://localhost:5173) and demonstrates Tailwind CSS + DaisyUI wiring with a simple live deals dashboard.

### Scripts

Common scripts are defined at the package level and can be run from the repo root thanks to pnpm filters:

| Command                                      | Description                                                    |
| -------------------------------------------- | -------------------------------------------------------------- |
| `pnpm build`                                 | Builds every package in dependency order.                      |
| `pnpm lint`                                  | Runs ESLint with the shared configuration across all packages. |
| `pnpm format`                                | Formats source files with Prettier in each package.            |
| `pnpm test`                                  | Invokes the `test` script for every workspace package.         |
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

## Next steps

- Flesh out backend routing, persistence, and deal ingestion.
- Connect the frontend dashboard to the API endpoints.
- Expand automated tests in both packages.

Happy hacking!
