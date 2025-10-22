FROM mcr.microsoft.com/devcontainers/typescript-node:20

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

RUN corepack enable && pnpm install

COPY . .

EXPOSE 4000 5173

CMD ["pnpm", "dev"]
