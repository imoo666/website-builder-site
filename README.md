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

The callback configuration is committed in `config/build-callback.json`, so Workers Builds
receives it without a separate dashboard step:

```text
BUILD_CALLBACK_URL=https://ai-website-builder-api.2779468693.workers.dev/api/build-events
BUILD_CALLBACK_SECRET=<same value configured as the API Worker secret>
```

The callback is advisory; the Builder still requires the deployed
`/__version.json` commit to exactly match the candidate commit before it marks
a change as published.

## AI Write Boundary

The AI may only modify:

```text
src/site/**
public/generated/**
```

It must not modify package metadata, lockfiles, build scripts, or Cloudflare configuration.
