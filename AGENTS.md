# AGENTS.md — Duck Racing

## Dev Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # TypeScript compile + Vite build (tsc -b && vite build)
npm run lint         # ESLint (17 errors currently in codebase)
npm run preview      # Preview production build locally
npm run electron:dev # Run Electron with concurrent dev server
```

## Build Pipeline

1. `tsc -b` (TypeScript compile, strict mode)
2. `vite build` (outputs to `dist/`)
3. `electron-builder` (packages to `release/`)

## Architecture

- **React 19** UI in `src/components/` and `src/App.tsx`
- **Phaser 3** game engine in `src/phaser/` (scenes: Boot → Countdown → Race → Finish)
- **Zustand** state in `src/store/raceStore.ts`
- **Dexie.js** (IndexedDB) for audio storage in `src/dexie/audioDB.ts`
- **Electron** wrapper in `electron/` (main.js + preload.js)

Entry flow: SettingsScreen → BootScene → CountdownScene → RaceScene → FinishScene

## TypeScript Notes

- `tsconfig.app.json`: `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`
- No test framework installed (no jest/vitest)
- `noUnusedLocals: true`, `noUnusedParameters: true` enforced

## Lint Errors

17 ESLint errors exist in `CountdownScene.ts` and `RaceScene.ts` (`@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-unused-vars`). Build passes; lint does not.

## Electron

- `base: './'` in vite.config.ts for Electron compatibility
- `npm run electron:build` requires successful `npm run build` first
- Windows portable build: `npm run dist`
