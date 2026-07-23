# AGENTS.md - OpenCode Agent Guide

This is a Next.js 16 + React 19 project for the Poets Crew UI (FastAPI + CrewAI backend).

## Quick Commands

| Task           | Command              |
| -------------- | -------------------- |
| Dev server     | `pnpm dev`           |
| Build          | `pnpm build`         |
| Start prod     | `pnpm start`         |
| Typecheck      | `pnpm typecheck`     |
| Lint           | `pnpm lint`          |
| Lint + fix     | `pnpm lint:fix`      |
| Format         | `pnpm format`        |
| Format check   | `pnpm format:check`  |
| All CI checks  | `pnpm check:all`     |
| Unit tests     | `pnpm test:run`      |
| E2E tests      | `pnpm test:e2e`      |
| Coverage       | `pnpm test:coverage` |
| Analyze bundle | `pnpm analyze`       |
| Commit         | `pnpm commit`        |

**Note**: `/tmp` is small (437M). If `pnpm install` fails with ENOSPC: `TMPDIR=/home/aldou/codes/ai/ui/.tmp pnpm install`

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, React Compiler, Rspack)
- **Language**: TypeScript 5 (strict)
- **Linting/Formatting**: oxlint + oxfmt (no ESLint/Prettier/Biome)
- **Styling**: Tailwind CSS v4 only — no inline styles, no CSS modules
- **Data**: TanStack Query 5 (server state), Zustand (light client state)
- **Validation**: Zod (env, schemas)
- **i18n**: next-intl (locale routing via `app/[locale]/`)
- **Icons**: lucide-react only
- **Forms**: react-hook-form + @hookform/resolvers (zod)
- **Testing**: vitest (unit), Playwright (e2e)
- **Package manager**: pnpm

## Architecture Patterns

### i18n (next-intl)

- Locale routing: `app/[locale]/`
- All user text in `src/messages/{locale}.json`
- Server components: `getTranslations()`, `getFormatter()` from `next-intl/server`
- Client components: `useTranslations()`, `useFormatter()` from `next-intl`
- Locales defined in `src/constants/i18n.ts`

### Environment

- Single source: `src/env.ts` (Zod + `@t3-oss/env-nextjs`)
- Client vars need `NEXT_PUBLIC_` prefix
- Import: `import { env } from "@/env"`

### Data Fetching

- All HTTP via `src/lib/api.ts` (`get`, `post`, `put`, `del`) — wraps `ky` with `env.NEXT_PUBLIC_API_URL`
- TanStack Query for all server state (`useQuery`, `useMutation`)
- Query keys: `src/constants/query-keys.ts` (`QUERY_KEYS.USERS`, etc.)
- Error handling: try/catch + Sonner toasts (`toast.error`, `toast.success`)

### State Management

- **Global client state**: Zustand stores in `src/stores/` (`useXStore` hooks)
- **Server state**: TanStack Query only (never duplicate in Zustand)
- **URL state**: searchParams for filters, pagination

### Components Structure

```
src/components/
  ui/          # Atomic (shadcn/ui) — kebab-case files
  widgets/     # Composed features — PascalCase files in kebab-case folders
  layouts/     # Page structure — PascalCase files
```

- Each folder has `index.ts` barrel export
- Widgets re-exported from `src/components/widgets/index.ts` → `@/widgets` alias

### Path Aliases (tsconfig + vitest.config.ts)

```ts
@/ui           → src/components/ui
@/widgets      → src/components/widgets
@/layouts      → src/components/layouts
@/hooks        → src/hooks
@/data         → src/data
@/schemas      → src/schemas
@/stores       → src/stores
@/constants    → src/constants
@/lib          → src/lib
@/providers    → src/providers
@/types        → src/types
@/utils        → src/utils
@/server       → src/server
```

### Import Order (manual — oxfmt doesn't sort)

1. React, Next.js
2. Third-party (TanStack, Zustand, Lucide)
3. Types, constants, schemas, config, env
4. i18n, assets, styles, lib
5. Providers, stores, hooks, data
6. Components (layouts, widgets, ui)
7. Tailwind import
8. Relative imports

## Key Conventions

| Rule       | Detail                                                      |
| ---------- | ----------------------------------------------------------- |
| `any` type | FORBIDDEN                                                   |
| Types      | `src/types/*.type.ts` (kebab-case), `Type` suffix           |
| Components | Widgets/layouts: PascalCase; UI: kebab-case                 |
| Hooks      | Files: `use-xxx.ts`; Functions: `useXxx`                    |
| Stores     | Files: `xxx.store.ts`; Hooks: `useXxxStore`                 |
| Constants  | SNAKE_CASE in `src/constants/`                              |
| Icons      | PascalCase + `Icon` suffix, from `lucide-react` only        |
| Formatting | oxfmt: double quotes, no trailing commas, 100 width         |
| Tailwind   | Use `cn()` (clsx + tailwind-merge), `cva()` for variants    |
| a11y       | All components must be accessible (ARIA, keyboard, figures) |

## Important Config Files

| File                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `src/env.ts`            | Env schema (Zod)                               |
| `src/config/site.ts`    | Branding, URLs, social, locales                |
| `src/config/seo.ts`     | SEO metadata                                   |
| `src/constants/i18n.ts` | Locale config                                  |
| `src/lib/api.ts`        | ky instance + helpers (external API)           |
| `src/app/robots.ts`     | robots.txt                                     |
| `src/app/sitemap.ts`    | Dynamic sitemap                                |
| `.oxlintrc.json`        | Lint rules                                     |
| `.oxfmtrc.json`         | Format rules                                   |
| `next.config.ts`        | Next.js config (Rspack, SVG via @svgr/webpack) |
| `vitest.config.ts`      | Test config (aliases must match tsconfig)      |

## Testing Patterns

- Unit tests: `src/**/__tests__/*.test.ts(x)` or `src/**/*.test.ts(x)`
- Mock env: `vi.mock("@/env", ...)` in test files
- Mock next-intl: `vi.mock("next-intl", () => ({ useTranslations: () => (k) => k }))`
- Mock ky: `vi.mock("ky", ...)` with `get/post/put/delete` returning `{ json: vi.fn() }`
- Hook tests: use `QueryClient` with `retryDelay: 0`, `gcTime: 0`
- Server component tests: mock `@/ui` and `@/widgets` barrels to avoid deep deps

## Known Gotchas

- **ky `prefixUrl` ignores URLs starting with `/`** — use `normalizeUrl()` helper in `src/lib/api.ts` to strip leading slashes
- **Vitest aliases**: must use array format `[{ find, replacement }]` with `@` catch-all LAST (object format breaks `@/ui`, `@/hooks` resolution)
- **Rspack** replaces Webpack — bundle analyzer may have issues
- **Server actions & route handlers**: use plain `ky` (not `@/lib/api` instance) for external API calls
- **Constants**: no barrel export in `src/constants/` — import directly: `@/constants/status`, `@/constants/api`
- **Tailwind in CSS**: requires `css.parser.tailwindDirectives: true` in oxlint config
- **No Prettier/Biome** — oxlint + oxfmt only

## Git Workflow

- Conventional Commits required (`feat:`, `fix:`, `refactor:`, etc.)
- `pnpm commit` for interactive commitizen
- Husky + lint-staged runs `oxlint --fix` + `oxfmt` on pre-commit
- CI runs `pnpm check:all` (typecheck + lint:ci)

## Related Files

- `CLAUDE.md` — Autonomous agent instructions (Ralph)
- `.tasks/prd.json` — Current PRD with user stories
- `.tasks/progress.txt` — Implementation log with learnings
