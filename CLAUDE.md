# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Type-check + build for production
npm run preview      # Preview production build (localhost:4173)
npm run type-check   # Type-check with vue-tsc
npm run test:unit    # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # Run oxlint + eslint (both with auto-fix)
npm run format       # Format with Prettier
```

To run a single unit test file:
```bash
npx vitest run src/__tests__/App.spec.ts
```

## Architecture

**Stack:** Vue 3 + TypeScript + Vite, Pinia (state), Vue Router (routing), Tailwind CSS v4

**Entry flow:** `index.html` → `src/main.ts` → registers Pinia + Vue Router → mounts `App.vue` to `#app`

**Path alias:** `@/*` maps to `./src/*`

**Linting:** Two-pass lint — Oxlint runs first (Rust-based, fast), ESLint runs second with oxlint integration to avoid duplicate rules. Prettier handles formatting separately (no semicolons, single quotes, 100-char line width).

**Testing:**
- Unit tests live in `src/__tests__/` using Vitest + Vue Test Utils, jsdom environment
- E2E tests live in `e2e/` using Playwright (Chromium, Firefox, WebKit); requires dev server running on 5173 (or uses preview server on 4173 in CI)
