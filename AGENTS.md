# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
- `yarn dev` - Start development server on http://localhost:3000
- `yarn build` - Production build
- `yarn start` - Start production server
- `yarn clean` - Clean `.next` directory

### Code Quality
- `yarn lint` - Check for lint errors
- `yarn lint:fix` - Auto-fix lint issues and format code
- `yarn lint:ci` - CI mode (no warnings allowed) + format check
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check formatting without modifying
- `yarn typecheck` - Run TypeScript type checking
- `yarn knip` - Analyze unused dependencies and files

### Bundle Analysis
- `yarn analyze` - Analyze bundle sizes and open report

### Git Commits
- `yarn commit` - Interactive commit with Conventional Commits format
- All commits MUST follow Conventional Commits specification (feat:, fix:, refactor:, etc.)

### System-Specific
- **IMPORTANT**: On this system, `/tmp` partition is small (437M). Use `TMPDIR=/home/aldou/codes/ai/ui/.tmp yarn install` if yarn install fails with ENOSPC errors

## Architecture Overview

### Tech Stack Core
- **Next.js 16** with App Router and React 19 (concurrent rendering, React Compiler enabled)
- **TypeScript 5** with strict mode
- **Tailwind CSS v4** for all styling (inline styles forbidden)
- **TanStack Query 5** for data fetching, caching, and server state
- **Zustand** for lightweight global client state
- **Zod** for runtime validation (env vars, schemas)
- **next-intl** for internationalization with locale-based routing
- **Yarn 4.12.0** as package manager

### Project Structure Philosophy
This is a **barrel export architecture** with strict naming conventions:
- Components organized by abstraction level: `ui` (atomic) → `widgets` (composed) → `layouts` (structural)
- Each directory exports via `index.ts` for clean imports using path aliases
- Configuration centralized in `src/config/`, `src/constants/`, and `src/env.ts`

### Key Architectural Patterns

#### Internationalization (i18n)
- Locale-based routing via `app/[locale]/`
- All user-facing text MUST come from `src/messages/{locale}.json` files
- No hardcoded strings in components
- Use `useTranslations()` in client components, `getTranslations()` in server components
- Supported locales defined in `src/constants/i18n.ts`
- Date/currency/number formatting via `next-intl`: `useFormatter()` (client) or `getFormatter()` (server)

#### Environment Variables
- `src/env.ts` is the single source of truth
- All env vars validated with Zod at runtime using `@t3-oss/env-nextjs`
- Must use `NEXT_PUBLIC_` prefix for client-accessible vars
- Access via `env.VARIABLE_NAME` after importing from `@/env`

#### Data Fetching & API Layer
- All HTTP requests through `src/lib/api.ts` using `get()`, `post()`, `put()`, `del()` helpers
- These wrap Axios with base URL from `env.NEXT_PUBLIC_API_URL`
- Use TanStack Query hooks (`useQuery`, `useMutation`) for all data operations
- Query keys follow pattern: `['resource-name']` or `['resource-name', id]`
- Handle errors with try/catch and provide user feedback via Sonner toasts

#### State Management
- **Global state**: Zustand stores in `src/stores/` (e.g., `counter.store.ts`)
- Store hooks named `useXStore` (e.g., `useCounterStore`)
- **Server state**: TanStack Query (never duplicate server data in Zustand)
- **URL state**: searchParams for filters, pagination, etc.

#### Component Organization
```
src/components/
  ├── ui/          # Atomic components (buttons, inputs) - mostly shadcn/ui, kebab-case files
  ├── widgets/     # Composed features (user-list, locale-switcher) - PascalCase files in kebab-case folders
  └── layouts/     # Page structure (Header, Footer) - PascalCase files
```
- Each widget folder has its own `index.ts` exporting the component
- `src/components/widgets/index.ts` re-exports all widgets for `@/widgets` alias

### Path Aliases & Import Patterns
Prefer short aliases with barrel exports:
```ts
import { Button, Input } from "@/ui";
import { UserList, LocaleSwitcher } from "@/widgets";
import { useUsers } from "@/hooks";
import { UserSchema } from "@/schemas";
```

Import order enforced by Prettier (see `.prettierrc`):
1. React, Next.js
2. Third-party (TanStack, Zustand, Lucide)
3. Types, constants, schemas, config, env
4. i18n, assets, styles, lib
5. Providers, stores, hooks, data
6. Components (components, layouts, widgets, ui)
7. Tailwind CSS import
8. Relative imports

### Styling Conventions
- Tailwind CSS v4 exclusively - NO inline styles, NO CSS modules
- Soft and pastel tones preferred for design
- Use utility classes for layout, spacing, alignment
- For complex variants, use `class-variance-authority` (cva)
- Combine classes with `tailwind-merge` via `cn()` utility

### Accessibility
- All components MUST comply with a11y standards
- Use appropriate ARIA attributes
- Wrap meaningful images in `<figure>` elements with captions
- Ensure keyboard navigation works

### TypeScript Conventions
- `any` type is FORBIDDEN
- All types in `src/types/` as `*.type.ts` files (kebab-case)
- Type names end with `Type` suffix (e.g., `UserType`, `SiteConfigType`)
- Use `interface` for object shapes, `type` for unions/compositions

### Naming Conventions Summary
| Item | Example | Style |
|------|---------|-------|
| Folders & files | `locale-switcher`, `query-client.ts` | kebab-case |
| Components (widgets/layouts) | `UserList.tsx` | PascalCase |
| UI components | `button.tsx` | kebab-case |
| Hooks (files) | `use-users.ts` | kebab-case |
| Hooks (functions) | `useUsers` | camelCase with `use` prefix |
| Data files | `user.data.ts` | kebab-case with `.data` suffix |
| Store files | `counter.store.ts` | kebab-case with `.store` suffix |
| Store hooks | `useCounterStore` | camelCase with `use` prefix + `Store` suffix |
| Icons | `ReactIcon` | PascalCase with `Icon` suffix |
| Types | `UserType` | PascalCase with `Type` suffix |
| Type files | `user.type.ts` | kebab-case with `.type` suffix |
| Constants | `DEFAULT_LOCALE` | SNAKE_CASE |

## Important Configuration Files

### Customization Entry Points (Search for `FIXME:`)
- `.env` - Runtime environment variables
- `src/env.ts` - Environment schema validation
- `src/config/site.ts` - Site branding, URLs, social links, locales
- `src/config/seo.ts` - SEO metadata (title, description, OG, Twitter)
- `src/constants/i18n.ts` - Locale configuration (supported languages, default)
- `src/lib/api.ts` - API base URL and auth token injection point
- `src/app/robots.ts` - Robots.txt for search engines
- `src/app/sitemap.ts` - Dynamic sitemap generation

### Key Files
- `src/i18n/request.ts` - next-intl configuration and message loading
- `src/providers/Providers.tsx` - App-wide provider composition (Theme, Intl, Query)
- `src/app/[locale]/layout.tsx` - Root layout with locale validation
- `.prettierrc` - Prettier config with import ordering
- `eslint.config.mjs` - ESLint 9 flat config
- `tsconfig.json` - TypeScript config with path aliases
- `next.config.ts` - Next.js config with SVG support via @svgr/webpack

## Development Workflow

### Cookies
- **Server**: Use `cookies()` from `next/headers` or `NextResponse.cookies.set` in route handlers/middleware
- **Client**: Use helper functions from `src/lib/cookie-client.ts`

### Helpers & Utilities
- **Formatting**: Use `next-intl` (`useFormatter()`/`getFormatter()`)
- **Slugs**: Use `@sindresorhus/slugify`
- **Common hooks**: `usehooks-ts` library (useLocalStorage, useMediaQuery, useDebounceValue, useOnClickOutside, useCopyToClipboard)

### Icons
- ALL icons from `lucide-react` library only
- Do not mix different icon libraries

### Git Hooks
- Husky + lint-staged configured for pre-commit
- Auto-runs ESLint fix and Prettier on staged files

## Code Quality Rules

### Core Principles (from .cursor/rules)
- Remove unnecessary imports and console.log before commits
- ESLint and Prettier rules fully enforced
- Prettier: `singleQuote: false`, `trailingComma: none`, `printWidth: 100`
- Functions must have single responsibility
- Each component folder MUST include `index.ts` exporting the component
- Shadcn/UI components under `components/ui` kept as-is (do not modify)
- Prop and variable names must be intent-driven (e.g., `onSubmit`, `isLoading`, `variant`)
- Domain-specific functions under `src/helpers`, reusable utilities under `src/utils`
- Constants in `src/constants`, never inside components
- Static/mock data in `src/data` with variable names ending in `Data`

### Best Practices
- Handle errors with try/catch and provide user feedback (toasts via Sonner)
- Custom hooks always start with `use`, live in `src/hooks/`, files in kebab-case
- TanStack Query for ALL server state (users, posts, etc.)
- Zustand for lightweight global UI state only
- All text from translation files, no hardcoded user-facing strings

## Notes
- Node.js 22+ required (specified in `package.json` engines)
- Package manager: Yarn 4.12.0 (using node_modules linker for compatibility)
- React Compiler enabled in Next.js config
- Google Analytics integration via `NEXT_PUBLIC_GA_ID` env var
- Bundle analyzer available for performance optimization
- SVG imports handled by @svgr/webpack (use as React components)
