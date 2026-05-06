# Troubleshooting: Admin UI Changes "Skipped" in Production

This document provides a reference for an issue where UI changes in the Admin application were successfully verified locally but failed to appear in the production environment (`https://elzatona-web.com/admin`).

## Issue Description

Changes made to the Content Management interface (specifically row alignment and modal positioning) were confirmed in local development and pushed to a PR branch, but after triggering a manual deployment, the live site remained on the old version.

## Root Cause Discovery

### 1. Silent Build Failures on Vercel

Upon investigation using the Vercel CLI (`vercel ls`), it was discovered that many recent deployments were in an **Error** state. However, the GitHub Action workflow (`manual-deploy-parallel.yml`) was incorrectly reporting **Success** because it was only tracking the triggering of the deployment, not the remote build outcome.

### 2. Destructive Workflow Patching

The primary cause of the build failures was a "patching" step in the GitHub workflow that was intended to prepare the repository for Vercel.

- **The specific bug**: The script was deleting internal workspace dependencies (like `@elzatona/common-ui`) from the `apps/admin/package.json` file before uploading to Vercel.
- **The consequence**: Since Next.js was configured to use `transpilePackages` for these libraries, it required the source code to be present and correctly linked via `pnpm`. By deleting the dependencies, the `pnpm install` on Vercel skipped linking those libraries, causing the `next build` command to fail with "module not found" errors.

## The Solution

### UI Fixes

1.  **Row Alignment**: Standardized all rows (Cards, Categories, Topics) to use `ml-auto` on the badge containers, ensuring consistent text-left/badge-right layout.
2.  **Modal Synergy**: Keeping the admin navbar visible when editing questions to provide a visual anchor for the modal's top offset.

### Deployment Fixes

1.  **Stop Manual Patching**: Removed the steps in `manual-deploy-parallel.yml` that deleted internal dependencies or modified `package.json` on the fly.
2.  **Native Monorepo Support**: Switched the Vercel build command to `pnpm --filter admin build`. This allows Vercel's native `pnpm` workspace support to handle the library linking automatically.
3.  **Syncing Vercel Settings**: Updated the workflow to explicitly set the `outputDirectory` to `apps/admin/.next` during the project configuration step.

## Lessons Learned

- **Avoid Destructive Edits**: Do not delete dependencies or rename critical configuration files (like `nx.json`) in the CI pipeline unless absolutely necessary.
- **Trust the Package Manager**: Modern tools like `pnpm` and deployment platforms like Vercel have native support for monorepos that is more reliable than manual scripting.
- **Monitor the Target**: Always check the logs of the actual deployment platform (Vercel) when changes appear to be skipped, as the CI pipeline (GitHub) may not always have the full picture.
