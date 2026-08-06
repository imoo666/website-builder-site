# Website Builder Site

Generated React, TypeScript, and Vite website managed by the AI Website Builder.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm ci:build
pnpm deploy
```

`ci:build` is the Cloudflare Workers Builds command. It validates the source, builds `dist`, and writes the deployed Git commit to `dist/__version.json`.

For an uncommitted local checkout, provide an explicit version:

```bash
BUILD_COMMIT_SHA=local-test pnpm ci:build
```

## Cloudflare Workers Builds

Configure the generated website repository with:

```text
Build command: pnpm ci:build
Deploy command: npx wrangler deploy
Root directory: /
```

The Worker name is defined in `wrangler.jsonc`. Change it before the first deployment if the default name is already in use.

## AI Write Boundary

The AI may only modify:

```text
src/**
public/**
```

It must not modify package metadata, lockfiles, build scripts, or Cloudflare configuration.
