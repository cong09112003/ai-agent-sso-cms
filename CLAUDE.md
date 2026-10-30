# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Admin CMS for an SSO backend: manages accounts, apps, and per-app roles, permissions, and user types. All application code lives in `source/`. The repo root holds deployment files and the Claude config (`.claude/`). Deployment is GitHub Actions (`.github/workflows/deploy.yml`): Docker image (Node version from `source/.nvmrc`, served by nginx), sent over VPN and SSH to the server on port 3000, with Telegram notifications. See `.claude/rules/build-and-deploy.md`. UI text defaults to **Vietnamese**. Node >= 16 is required (Docker and CI use Node 18).

**Stack (installed versions):**
- React 18.3 (`createRoot`, StrictMode), plain **JavaScript**: no TypeScript and no type-check step; `jsconfig.json` exists only for editor path aliases
- CRA 5 (`react-scripts` 5.0.1) through **craco 7**
- React Router 6.5 (`BrowserRouter`)
- Ant Design 5.21 with `@ant-design/icons`
- redux 4 + redux-saga 1.2 + reselect + immer (not Redux Toolkit)
- axios 1.15
- react-intl 6 with `babel-plugin-react-intl-auto`
- Sass and CSS modules
- dayjs
- Jest 27 + React Testing Library 14 (no E2E)
- ESLint 8 + Prettier 3 (no Stylelint)

`moment`, `yup`, `react-quill`, and `recharts` are installed but unused, so don't start using them.

## Commands

Run from `source/` unless noted:

- `npm start`: dev server, loads `env/.dev` via `env-cmd`. Note that this env points at the real dev backend.
- `npm run build:dev` / `build:beta` / `build:staging`: production build with the matching `env/.<name>`. `build:production` needs `env/.production`, which is gitignored. Use `build:dev` to check that imports, aliases, and routes resolve.
- `npm run lint`: `eslint "src/**/*.js" --fix` across **all** of `src/`. For a check-only run on specific files, use `npx eslint <files>`. The baseline is 0 errors and about 220 warnings.
- `npm run format`: Prettier `--write` on all of `src/`. About 120 of the 150 files are not Prettier-clean, so don't run it as part of unrelated work.
- **Tests: `node .claude/scripts/run-tests.js [path] [-t "name"] [--coverage]`** (works from the repo root or `source/`). Plain `npm test` runs in watch mode and can't resolve the `@` aliases. The only existing test, `src/App.test.js`, is a broken CRA placeholder.
- `npm run i18n`: extracts react-intl messages into `src/locales/en.json`. It rewrites that file, so ask before running it.

**Git hooks.** The pre-commit hook (husky in `source/.husky`, then lint-staged) runs `npm run lint` on all of `src/` and then `git add .`, which **stages unrelated changes under `source/`**. Check `git status` before committing. The commitlint hook is commented out.

## Source layout (`source/src`)

| Path | Responsibility |
|---|---|
| `modules/<feature>/` | Feature screens: `index.js` (list page), `*SavePage.js` (create/edit), `*Form.js`, and `routes.js`. Features: `app` (apps and their tabs: roles, permissions, user types, accounts, mobile config), `manager`, `user`, `customer`, `profile`, `login`, `entry`, `main` (layouts, header, sider). |
| `components/cms/` | In-house CMS kit (formerly the private `@itz/*` packages): `PageWrapper`, `ListPage`, `BaseTable`, `BaseForm`, the `*Field` inputs, `SearchForm`, `ActionBar`, `HasPermission`, `Loading`, error pages. Import it from `@components/cms`. |
| `components/common/` | App-specific shared components. |
| `hooks/` | `useFetch`, `useFetchAction`, `useListBase`, `useSaveBase`, `useBasicForm`, `useAuth`, `useValidatePermission`, `useTranslate`, `useNotification`, `useQueryParams`, and others. |
| `constants/` | `apiConfig.js` (every endpoint), `menuConfig.js` (side menu), `index.js` (`storageKeys`, `AppConstants`, statuses, date formats), `masterData.js`, `errorCodes.js`. |
| `routes/` | `index.js` (route map, with `notFound` last), `routes.js` (renders the routes), `ValidateAccess.js` (layout, auth redirect, and permission gate). |
| `services/` | `api.js` (`sendRequest` axios wrapper), `userService.js` (token storage), `notifyService.js`. |
| `store/`, `selectors/` | Redux actions, reducers, and sagas per domain (`account`, `app`, `cache`), plus reselect selectors. |
| `locales/` | `intl.js` (`commonMessage`), `vi.json`/`en.json`, `LanguageProvider`. |
| `utils/` | localStorage helpers, `validatePermission`, `orderNumber`, and other helpers. |
| `assets/` | Global SCSS (`variables`, `mixins`), images, icons. |

## Core conventions

- **Path aliases.** craco creates `@<name>` for every top-level entry in `src/` (`@modules`, `@hooks`, `@constants`, `@components`, `@utils`, ...). Always import through them. A new top-level folder gets an alias automatically.
- **Endpoints** are declared only in `src/constants/apiConfig.js` (`{ baseURL, method, headers, permissionCode }`, built from `REACT_APP_API`) and called through `useFetch` / `useListBase` / `useSaveBase` / saga `processAction`. Never call axios or fetch directly, and never hardcode hosts.
- **Pages use the mixin base hooks.** `useListBase` (list pages) and `useSaveBase` (create/edit pages, where `id === 'create'` means create mode) are customized by mutating `funcs` in `override`. Forms use `useBasicForm` with `BaseForm` and the kit's field components (Ant Design Form; no other form library).
- **Routes.** Each module's `routes.js` is spread into `src/routes/index.js`. A route has `auth` (`true`/`false`/`null`) and a `permission` array (singular key). Menu entries in `menuConfig.js` also need permission codes.
- **State.** Redux is only for cross-page state (profile, app loading, cache). Page data lives in hook or Ant Design Form state.
- **UI.** Use Ant Design and the CMS kit first, co-located `*.module.scss` files (class names are hashed outside `dev`), and Vietnamese text through `defineMessages` / `<FormattedMessage defaultMessage>` without manual ids (they are auto-generated from the file path).
- **Style.** 4-space indent, single quotes, semicolons, trailing commas, print width 120. `react/prop-types` and `react-hooks/exhaustive-deps` are **off**, so write effect dependencies deliberately.
- **Keep diffs minimal.** Match the surrounding file, don't reformat untouched code, and don't add dependencies or edit `package.json`, lock files, env files, or build and deploy config without the user's approval.

Detailed, path-specific guidance lives in `.claude/rules/`: components, shared kit, hooks and state, API integration, routing and permissions, forms, testing, security, and build and deploy. Workflows are available as skills: `/implement-feature`, `/implement-page`, `/implement-form`, `/api-integration`, `/create-react-component`, `/debug-frontend`, `/write-tests`, `/review-code`, `/optimize-performance`, `/refactor-frontend`.

## Known quirks (don't "fix" these silently; report them)

- Some route entries use `permissions` (plural), which `routes/routes.js` ignores. `modules/customer/routes.js` is one example.
- `modules/customer/index.js` navigates to `routes.DeviceListPage`, which doesn't exist.
- `useListBase` reads `storageKeys.USER_PROJECT_ACCESS_TOKEN`, but `storageKeys` doesn't define it.
- The 401 interceptor in `services/api.js` is a no-op. Session problems are caught when the tab regains focus (`ValidateAccess`).
