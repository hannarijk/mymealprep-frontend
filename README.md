# MyMealPrep

A weekly meal planning app for organizing breakfast and lunch/dinner recipes, generating grocery lists, and tracking meal history.

## Features

- **Plan** — Build a weekly or biweekly meal plan; add/remove recipes, browse suggestions based on what's not yet planned
- **Recipe library** — Search and paginate all recipes; quick-add to plan from the library
- **Grocery list** — Department-organized list with check off, add, and remove item actions
- **Meal history** — Browse past plans with one-click reuse
- **Recipe detail drawer** — Open full recipe details (image, ingredients, steps, tags) from any tab without losing context

## Tech Stack

- **Vue 3** + TypeScript + Vite
- **Pinia** — state management
- **Vue Router** — URL-based navigation (`/plan`, `/recipes`, `/grocery`, `/history`)
- **Tailwind CSS v4** — styling and transitions
- **lucide-vue-next** — icons
- **Vitest** + Vue Test Utils — unit tests
- **Playwright** — end-to-end tests

## Getting Started

**Prerequisites:** Node.js 18+, npm 9+

```sh
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run `vue-tsc` type checking |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run lint` | Lint with Oxlint + ESLint (auto-fix) |
| `npm run format` | Format with Prettier |

## Project Structure

```
src/
├── components/    # Shared UI components
├── views/         # Route-level page components
├── stores/        # Pinia stores (state + actions)
├── services/      # API service layer (currently mocked)
├── mocks/         # Dev-only data fixtures
├── utils/         # Pure business logic (no framework dependencies)
├── types/         # Shared TypeScript interfaces
└── router/        # Vue Router configuration
```

## Architecture

Each layer imports only from layers below it:

```
Views / Components  →  Stores  →  Services  →  Types
                              ↘  Utils     ↗
```

**Connecting to a real API:** All data fetching is isolated in `src/services/`. Replace the mock function bodies with real HTTP calls — no store or component changes required. Delete `src/mocks/` when the real API is connected.

## Testing

```sh
# Unit tests (stores and utilities)
npm run test:unit

# Single test file
npx vitest run src/__tests__/stores/mealPlanStore.spec.ts

# End-to-end (requires dev server running on port 5173)
npx playwright install    # first run only
npm run test:e2e
```

Unit tests cover all Pinia stores and pure utility functions. Service calls are mocked with `vi.mock`.
