---
name: implement-feature
description: Implement a frontend feature or change end-to-end in this SSO admin CMS (React 18 + Ant Design 5 + redux-saga, CRA/craco). Use for any feature request that touches more than one layer (endpoints, pages, forms, routes, menu, state). It plans against the existing module/base-hook architecture and hands off to implement-page, implement-form, api-integration, or create-react-component for the specific parts.
argument-hint: "<feature description>"
---

# Implement a feature

Feature request: $ARGUMENTS

## 1. Understand before writing
1. Restate the feature in one or two sentences and list the user-visible behavior: pages, actions, who may use them (permission codes), and success and error behavior.
2. Find the closest existing feature and use it as the template:
   - CRUD entity with a list page and an edit page: `src/modules/customer/` (smallest example) or `src/modules/user/`.
   - Tabs inside an app detail page: `src/modules/app/AppTabs/*`.
   - Modal-based editing: `src/modules/app/AppTabs/permission/PermissionModal.js`.
   Read its `routes.js`, its list page (`index.js`), its save page, and its form before you design anything.
3. Check what already exists. Grep `src/constants/apiConfig.js` for the entity, and `src/components/cms/index.js` and `src/hooks/` for helpers. Reuse them instead of adding new ones.
4. If the backend contract (endpoint paths, payload fields, permission codes) isn't known, ask the user. Don't invent endpoints.

## 2. Plan the change set
Write a short list of the files to add or change, in this order:
1. Endpoints in `apiConfig.js` → follow `/api-integration`.
2. Pages (list and save) plus `routes.js` and the spread in `src/routes/index.js` → follow `/implement-page`.
3. Forms → follow `/implement-form`.
4. Menu entry in `src/constants/menuConfig.js`, if the page should be reachable from the side menu.
5. Shared components, only when a second consumer actually exists → follow `/create-react-component`.
6. Redux, only for genuinely cross-page state. Page data stays in `useFetch`/`useListBase`.

For a change touching more than about five files, show the plan to the user before editing.

## 3. Implement
- Match the conventions of the template feature: file names, `defineMessages` with Vietnamese text, `@` aliases, 4-space indent, single quotes, semicolons.
- Edit only what the feature needs. Don't reformat untouched code: most files are not Prettier-clean, and reformatting buries the real diff.
- Handle the loading, empty, error, and success states (see `.claude/rules/api-integration.md`).
- Gate actions with permission codes the same way neighboring features do.

## 4. Validate
- The PostToolUse hook runs ESLint on every edited `src/**/*.js` file. Fix any errors it reports.
- Run `npm run build:dev` from `source/` when you added routes, imports, or new files. It catches broken imports and aliases that lint doesn't.
- When you added or changed pure logic, add or update a test and run `node .claude/scripts/run-tests.js <path>` (see `/write-tests`).
- If any user-visible text was added, tell the user they can run `npm run i18n` to refresh `src/locales/en.json`. Don't run it yourself without asking: it rewrites the locale file.

## Done when
- [ ] Every new page is reachable (route added, and a menu entry if intended) and is gated by `auth` and `permission`.
- [ ] No hardcoded URLs or env values; every endpoint lives in `apiConfig.js`.
- [ ] Loading and error feedback exists for every request.
- [ ] Lint is clean for the touched files and `npm run build:dev` succeeds (or you report why you couldn't run it).
- [ ] Summary for the user: files changed, how to reach the feature, and anything the backend must provide.
