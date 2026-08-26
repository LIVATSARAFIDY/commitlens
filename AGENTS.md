# AGENTS.md

## Stack
- Node ESM (`"type": "module"` in `package.json:15`). CLI `commitlens` via `commander@15`.
- TypeScript strict (`tsconfig.json:6` `strict: true`, `module/moduleResolution: NodeNext`, `target: ES2022`, `rootDir: src`, `outDir: dist`).

## Commands
- `npm run dev` — run via `tsx src/index.ts` (no build needed).
- `npm run build` — `tsc` to `dist/`; `npm start` runs `node dist/index.js`.
- No tests, lint, formatter, or CI configured — don't add run steps for them.
- No `opencode.json` / `.opencode/` — default behavior.

## Architecture
- Entrypoint: `src/index.ts:1` — shebang + `commander` setup; registers subcommands here.
- Commands: `src/commands/analyze.ts` — currently empty stub; wire new commands from `src/index.ts`.
- Core: `src/core/git/git.service.ts:1` (`GitService`) + `src/core/git/git.types.ts` — wraps `git` via `execFile` (`maxBuffer: 10MB`). All staged-change logic lives here.
- Single package, no monorepo. `dist/` is build output — never edit directly.

## Gotchas
- **ESM `.js` extensions required**: imports must use `.js` suffix even for `.ts` files (e.g., `src/core/git/git.service.ts:9` `from "./git.types.js"`). Required by `NodeNext`.
- **`README.md` is placeholder**: contains a `tsconfig` template, not project docs — trust `package.json`/`tsconfig.json`/`src/` as source of truth.
- **Binary**: `package.json:24` maps `commitlens` to `./dist/index.js`; `src/index.ts:1` shebang must stay. Requires `npm run build` before `npx commitlens` works from `dist`.
- **No `.gitignore`**: `dist/` and `node_modules/` are tracked-risk — avoid committing them.
