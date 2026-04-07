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

**Prerequisites:** Node.js 18+, npm 9+, Docker (for the backend)

```sh
# 1. Start the backend (from the mymealprep-backend directory)
docker compose up

# 2. Set up environment variables
cp .env.example .env

# 3. Install dependencies and start the dev server
npm install
npm run dev        # http://localhost:5173
```

## Environment Setup

Copy `.env.example` to `.env` before running the dev server:

```sh
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | API base path. The dev server proxies this to `http://localhost:8080`. |

The Vite dev server proxies all `/api/v1/*` requests to the backend on `http://localhost:8080`, so no CORS configuration is needed in development.

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

## Authentication

The app uses JWT-based authentication. Tokens are stored in `localStorage` and automatically attached to every API request.

1. **Register** at `/register` — creates an account and logs you in
2. **Login** at `/login` — authenticates and redirects to `/plan`
3. **Token lifetime** — 7 days; the app redirects to `/login` automatically on expiry
4. **Logout** — clears the token from `localStorage` and returns to `/login`

All routes except `/login` and `/register` require authentication. Unauthenticated requests to protected routes are redirected to `/login?redirect=<path>` and the original destination is restored after login.

## Project Structure

```
src/
├── api/           # HTTP client, API types, and mapper layer
├── components/    # Shared UI components
├── views/         # Route-level page components (incl. LoginView, RegisterView)
├── stores/        # Pinia stores (state + actions)
├── services/      # Data service layer
├── utils/         # Pure business logic (no framework dependencies)
├── types/         # Shared TypeScript interfaces
└── router/        # Vue Router configuration + auth guards
```

## Architecture

Each layer imports only from layers below it:

```
Views / Components  →  Stores  →  Services  →  API client  →  Backend
                              ↘  Utils     ↗
```

The `src/api/` layer handles the HTTP contract with the backend: typed `fetch` wrapper (`client.ts`), raw API response types (`types.ts`), and mapper functions that convert backend shapes to UI types (`mappers/`).

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

Unit tests cover all Pinia stores, services, mappers, and pure utility functions. Service calls are mocked with `vi.mock`; API client calls are mocked with `vi.mock('@/api/client')`.

E2E tests require both the frontend dev server (port 5173) and the backend (port 8080) to be running:

```sh
# Terminal 1 — backend
cd ../mymealprep-backend && docker compose up

# Terminal 2 — frontend
npm run dev

# Terminal 3 — run E2E tests
npm run test:e2e
```

`globalSetup` registers a fresh test user and seeds 3 recipes before the suite runs. Auth state is saved to `e2e/.auth/` (gitignored). The `auth` project runs without any stored session; the `authenticated` project reuses the saved session for plan and grocery tests.
