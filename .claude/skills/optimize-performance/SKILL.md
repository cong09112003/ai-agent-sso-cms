---
name: optimize-performance
description: Find and fix real frontend performance problems in this CMS, including unnecessary re-renders from base hooks and inline objects, repeated requests, heavy table renders, bundle size (eager route imports, duplicate date libraries, unused heavy deps), and slow builds. It measures before changing anything and keeps behavior identical. Use when a page is slow, laggy, or re-fetching, or when bundle size matters.
argument-hint: "<page, component, or 'bundle'>"
---

# Optimize performance

Target: $ARGUMENTS

## 1. Measure first
- **Runtime.** Ask the user what is slow (initial load, typing in a form, opening a list, switching tabs). If they can, have them record with the React DevTools Profiler ("Highlight updates") and check the Network tab for duplicate requests. Don't optimize without a concrete symptom.
- **Bundle.** `npm run build:dev` from `source/` prints gzip sizes per chunk. For a deeper breakdown, suggest `npx source-map-explorer 'build/static/js/*.js'` to the user (it downloads a package, so ask first; sourcemaps are on in `env/.dev`).

## 2. Known hotspots in this codebase
| Area | What to look for | Typical fix |
|---|---|---|
| `useListBase` / `useSaveBase` | They rebuild `mixinFuncs` and the `{ ...apiConfig.x }` objects on every render, so `useFetch`'s `execute` changes identity each render. | Don't put `execute`/`mixinFuncs` in effect deps; memoize only where a measured loop exists. Avoid changing the base hooks' contract. |
| Duplicate requests | `immediate: true` plus a manual `execute()` in an effect; effects with missing or unstable deps; `ValidateAccess` re-checking on tab focus (intended). | Remove the double trigger; stabilize the deps. |
| Tables | Column arrays and `render` functions recreated on each render in big tables; large `pageSize`. | Hoist static columns, `useMemo` the columns when the table is large, and keep server paging (`DEFAULT_TABLE_ITEM_SIZE`). |
| Forms | `useWatch` across many fields; heavy `onValuesChange`. | Watch specific fields; debounce remote autocomplete (`lodash/debounce`). |
| Routing / bundle | `src/routes/index.js` imports every page eagerly, giving one large chunk. `App` already wraps routes in `React.Suspense`. | Propose `React.lazy(() => import(...))` per module route. It's a structural change, so confirm with the user and verify that `routes.x.path` references still work. |
| Dependencies | `moment` (installed, unused, with dayjs as the real date library), `recharts`, `react-quill`, `yup` (installed, unused). Unused packages aren't bundled unless imported. | Don't import them. Mention removal as an option to the user; never edit `package.json` yourself. |
| Icons | Three icon libraries (`@ant-design/icons`, `@tabler/icons-react`, `react-icons`). | Use named imports from per-icon paths. Prefer `@ant-design/icons` for new code. |

## 3. Change safely
- One optimization at a time, keeping behavior identical (same requests, same UI).
- No new dependencies without approval.
- Re-measure after each change and report before and after (render count, request count, chunk size).

## Done when
- [ ] Each change is tied to a measured or clearly demonstrable problem.
- [ ] Before and after numbers (or a reasoned estimate, if the user can't profile) are reported.
- [ ] ESLint hook clean, `npm run build:dev` passes, and no behavior change.
