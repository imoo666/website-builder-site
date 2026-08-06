# Generated Website

## AI Write Scope

AI changes are limited to:

- `src/site/**`
- `public/generated/**`

## Read-Only Files

- `package.json`
- `pnpm-lock.yaml`
- `scripts/**`
- `config/**`
- `src/main.tsx`
- `src/platform/**`
- `wrangler.jsonc`
- Vite, TypeScript, lint, and test configuration

## Validation

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Do not install dependencies or execute arbitrary scripts.
