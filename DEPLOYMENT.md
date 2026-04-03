# Deployment Setup

This repo now supports two long-lived deployment stages through Alchemy:

- `testing` branch -> Alchemy stage `testing` -> QA environment
- `main` branch -> Alchemy stage `prod` -> production environment

## What Was Automated

- Stage-aware Alchemy deployments through `packages/infra/alchemy.run.ts`
- Shared Alchemy state store for CI/CD via `CloudflareStateStore`
- Pull request CI check in [`.github/workflows/ci.yml`](C:\Users\Jojo\Desktop\Projects\uni-perks\.github\workflows\ci.yml)
- Branch deploy workflow in [`.github/workflows/deploy.yml`](C:\Users\Jojo\Desktop\Projects\uni-perks\.github\workflows\deploy.yml)

## Branches

Create the long-lived QA branch from `main`:

```bash
git checkout main
git pull origin main
git branch testing
git push -u origin testing
```

Keep `main` as the production branch.

## GitHub Branch Protection

Set these rules in GitHub:

### `main`

- Require a pull request before merging
- Require at least 1 approval
- Dismiss stale approvals
- Require status checks to pass
- Require branches to be up to date
- Block force pushes
- Block deletion

Recommended required check:

- `Typecheck`

### `testing`

- Require a pull request before merging
- Require at least 1 approval
- Require status checks to pass
- Block force pushes
- Block deletion

Recommended required check:

- `Typecheck`

## GitHub Environments

Create two GitHub Environments:

- `testing`
- `production`

The deploy workflow already maps:

- branch `testing` -> GitHub Environment `testing` -> stage `testing`
- branch `main` -> GitHub Environment `production` -> stage `prod`

## Required Environment Secrets

Add these secrets to both GitHub Environments unless noted otherwise:

- `ALCHEMY_PASSWORD`
- `ALCHEMY_STATE_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_EMAIL`
- `NEXT_PUBLIC_SERVER_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `CORS_ORIGIN`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `TURNSTILE_SECRET`
- `TURNSTILE_ENABLED`
- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `WEB_DOMAIN`
- `SERVER_DOMAIN`

Recommended values:

### `testing`

- `NEXT_PUBLIC_SERVER_URL=https://qa-api.your-domain.com`
- `NEXT_PUBLIC_SITE_URL=https://qa.your-domain.com`
- `CORS_ORIGIN=https://qa.your-domain.com`
- `BETTER_AUTH_URL=https://qa-api.your-domain.com`
- `TURNSTILE_ENABLED=true`
- `WEB_DOMAIN=qa.your-domain.com`
- `SERVER_DOMAIN=qa-api.your-domain.com`

### `production`

- `NEXT_PUBLIC_SERVER_URL=https://api.your-domain.com`
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- `CORS_ORIGIN=https://your-domain.com`
- `BETTER_AUTH_URL=https://api.your-domain.com`
- `TURNSTILE_ENABLED=true`
- `WEB_DOMAIN=your-domain.com`
- `SERVER_DOMAIN=api.your-domain.com`

## Separate D1, KV, And R2

Alchemy creates separate resources per stage automatically because the same resource IDs are deployed under different stage scopes.

That means these are isolated by stage:

- D1 database: `database`
- KV namespace: `kv-cache`
- R2 bucket: `images`

Examples:

- `testing` stage creates QA resources
- `prod` stage creates production resources

Bootstrap them once:

```bash
bun run deploy:testing
bun run deploy:prod
```

After those first deployments, Cloudflare will have separate D1, KV, and R2 resources for each stage.

## Safe Rollout Order

1. Push the `testing` branch.
2. Create the `testing` and `production` GitHub Environments.
3. Add all secrets to both environments.
4. Configure branch protection.
5. Merge this setup to `testing`.
6. Let GitHub Actions deploy stage `testing`.
7. Verify QA URLs and data isolation.
8. Promote `testing` to `main`.
9. Let GitHub Actions deploy stage `prod`.

## Verification Checklist

- A push to `testing` deploys only the QA environment
- A push to `main` deploys only production
- QA writes land only in QA D1
- QA uploads land only in QA R2
- QA cache/session data lands only in QA KV
- `qa` web calls `qa-api`
- production web calls production API

## Notes

- The GitHub CLI is not installed in this environment, so branch protection was not automated here.
- Custom domains are optional in code but strongly recommended. If `WEB_DOMAIN` and `SERVER_DOMAIN` are empty, Cloudflare will keep the `workers.dev` URLs.
