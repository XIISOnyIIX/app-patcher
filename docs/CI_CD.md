# CI/CD Guide

This document explains the Continuous Integration and Continuous Deployment setup for FoodDealSniper.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Branch Strategy](#branch-strategy)
- [Pull Request Process](#pull-request-process)
- [Deployment Pipeline](#deployment-pipeline)
- [Secrets Configuration](#secrets-configuration)
- [Badge Setup](#badge-setup)

## Overview

FoodDealSniper uses GitHub Actions for CI/CD automation. The workflows automatically:

- ✅ Lint and format code
- ✅ Run type checks
- ✅ Execute unit tests
- ✅ Run E2E tests
- ✅ Build production artifacts
- ✅ Build and push Docker images
- ✅ Deploy to production (on release)

## GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

#### Lint

- Runs ESLint on all packages
- Checks code formatting with Prettier
- Fails if code is not properly formatted

#### Type Check

- Validates TypeScript types in frontend
- Compiles backend TypeScript to verify types

#### Test

- Runs Jest unit tests for backend
- Runs Vitest tests for frontend
- Reports test results

#### Build

- Builds all packages for production
- Uploads build artifacts for inspection
- Ensures production builds succeed

#### E2E Tests

- Installs Playwright browsers
- Starts backend and frontend services
- Runs end-to-end integration tests
- Uploads test reports on failure

**Caching:**

- Uses pnpm store caching for faster installs
- Cache key based on `pnpm-lock.yaml` hash
- Significantly reduces workflow run time

### 2. Docker Workflow (`.github/workflows/docker.yml`)

Builds and pushes Docker images to GitHub Container Registry.

**Triggers:**

- Push to `main` branch
- Version tags (`v*`)
- Pull requests to `main` (build only, no push)

**Features:**

- Multi-platform builds (linux/amd64, linux/arm64)
- Multi-stage builds for optimization
- Automatic tagging based on git refs
- Docker layer caching for faster builds

**Image Tags:**

- `latest` - Latest commit on main
- `v1.2.3` - Semantic version tags
- `sha-abc123` - Git commit SHA
- `pr-42` - Pull request builds

## Branch Strategy

### Main Branches

- **`main`** - Production-ready code
  - Protected branch
  - Requires pull request reviews
  - All CI checks must pass
  - Automatic deployment to production

- **`develop`** - Integration branch
  - Latest development changes
  - Staging environment deployment
  - Feature branches merge here first

### Supporting Branches

- **`feature/*`** - New features
  - Branch from: `develop`
  - Merge to: `develop`
  - Naming: `feature/user-authentication`

- **`bugfix/*`** - Bug fixes
  - Branch from: `develop`
  - Merge to: `develop`
  - Naming: `bugfix/fix-login-error`

- **`hotfix/*`** - Production hotfixes
  - Branch from: `main`
  - Merge to: `main` and `develop`
  - Naming: `hotfix/critical-security-fix`

- **`release/*`** - Release preparation
  - Branch from: `develop`
  - Merge to: `main` and `develop`
  - Naming: `release/v1.2.0`

## Pull Request Process

### 1. Create Pull Request

```bash
# Create feature branch
git checkout -b feature/my-feature develop

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Create PR on GitHub
```

### 2. Automated Checks

When you create a PR, GitHub Actions automatically:

1. **Lint Check** - Validates code style
2. **Type Check** - Ensures TypeScript correctness
3. **Unit Tests** - Runs all test suites
4. **Build** - Verifies production builds
5. **E2E Tests** - Runs integration tests

All checks must pass before merging.

### 3. Code Review

- At least 1 approval required
- Address review comments
- Re-request review after changes

### 4. Merge

- Squash and merge recommended for feature branches
- Merge commit for release branches
- Delete branch after merge

## Deployment Pipeline

### Development Environment

**Trigger:** Push to `develop` branch

**Steps:**

1. Run CI workflow
2. Build Docker images
3. Push to development registry
4. Deploy to dev environment
5. Run smoke tests

### Staging Environment

**Trigger:** Create release branch

**Steps:**

1. Run CI workflow
2. Build Docker images
3. Push to staging registry
4. Deploy to staging environment
5. Run full E2E test suite
6. Manual approval required

### Production Environment

**Trigger:** Push to `main` or version tag

**Steps:**

1. Run CI workflow
2. Build production Docker images
3. Push to production registry
4. Create GitHub release
5. Deploy to production (Blue/Green)
6. Run health checks
7. Rollback on failure

### Manual Deployment

You can manually trigger deployments from GitHub Actions:

1. Go to Actions tab
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Select branch and environment
5. Click "Run workflow"

## Secrets Configuration

### Required Secrets

Configure in GitHub Repository Settings → Secrets and variables → Actions:

#### Container Registry

```
REGISTRY_USERNAME - GitHub username
REGISTRY_TOKEN - GitHub Personal Access Token with packages:write
```

#### Deployment

```
PRODUCTION_SERVER - Production server hostname
DEPLOY_KEY - SSH private key for deployment
```

#### Notifications

```
SLACK_WEBHOOK_URL - Slack webhook for notifications
DISCORD_WEBHOOK_URL - Discord webhook (optional)
```

#### Monitoring

```
SENTRY_DSN - Sentry error tracking DSN
SENTRY_AUTH_TOKEN - Sentry API token for releases
```

### Environment Variables

Configure in `.github/workflows/*.yml`:

```yaml
env:
  NODE_ENV: production
  PORT: 4000
  SCRAPER_RATE_LIMIT_REQUESTS: 10
```

## Badge Setup

Add status badges to your README:

```markdown
![CI](https://github.com/yourusername/fooddealsniper/workflows/CI/badge.svg)
![Docker](https://github.com/yourusername/fooddealsniper/workflows/Docker%20Build/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/yourusername/fooddealsniper)
```

## Workflow Customization

### Adjusting Node Version

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20' # Change version here
```

### Adding New Jobs

```yaml
jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        run: pnpm audit
```

### Conditional Execution

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: ./deploy.sh
```

### Matrix Builds

Test against multiple Node versions:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 21]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

## Troubleshooting

### Workflow Failing

**Check logs:**

1. Go to Actions tab
2. Click on failed workflow
3. Click on failed job
4. Expand failed step

**Common issues:**

- Cache corruption - Clear workflow cache
- Dependencies out of sync - Update `pnpm-lock.yaml`
- Environment mismatch - Check Node version
- Flaky tests - Add retries or fix test

### Docker Build Failing

**Debug locally:**

```bash
# Build using same Dockerfile
docker build -f Dockerfile.production -t test .

# Check build output
docker build --progress=plain -f Dockerfile.production -t test .
```

### E2E Tests Failing

**Run locally:**

```bash
# Install dependencies
pnpm install

# Start services
pnpm dev:backend &
pnpm dev:frontend &

# Run tests
pnpm test:e2e

# Debug mode
pnpm test:e2e --debug
```

## Performance Optimization

### Caching Strategy

```yaml
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

### Parallel Jobs

Run independent jobs in parallel:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  build:
    runs-on: ubuntu-latest
```

### Fail Fast

Stop other matrix jobs on first failure:

```yaml
strategy:
  fail-fast: true
  matrix:
    node-version: [18, 20]
```

## Notifications

### Slack Integration

Add to workflow:

```yaml
- name: Slack Notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'CI workflow completed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### GitHub Status Checks

Automatically posts status to PRs:

- ✅ All checks passed
- ❌ Some checks failed
- 🟡 Checks in progress

## Best Practices

### 1. Keep Workflows Fast

- Use caching aggressively
- Run jobs in parallel
- Only run necessary steps

### 2. Fail Fast

- Run linting before tests
- Run unit tests before E2E tests
- Stop on first critical failure

### 3. Clear Error Messages

- Use descriptive step names
- Add helpful error messages
- Link to documentation

### 4. Security

- Never commit secrets
- Use GitHub Secrets
- Rotate tokens regularly
- Review permissions

### 5. Monitoring

- Track workflow metrics
- Monitor build times
- Alert on failures
- Review regularly

## Advanced Features

### Reusable Workflows

Create `.github/workflows/deploy.yml`:

```yaml
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to ${{ inputs.environment }}"
```

Use in another workflow:

```yaml
jobs:
  deploy-staging:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
```

### Workflow Dispatch

Manual workflow triggers:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
```

### Artifacts

Upload build artifacts:

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: dist
    path: packages/*/dist
    retention-days: 7
```

Download in another job:

```yaml
- name: Download artifacts
  uses: actions/download-artifact@v4
  with:
    name: dist
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Marketplace Actions](https://github.com/marketplace?type=actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
