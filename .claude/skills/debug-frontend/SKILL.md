---
name: debug-frontend
description: Systematically investigate and fix a frontend bug in this CMS, such as a blank or redirecting page, a "not allowed" screen, a list not loading or not paging, a form not saving or not prefilling, missing translations, wrong permissions, or a login/session problem. It traces the request through apiConfig → useFetch/useListBase/useSaveBase → sendRequest, and routes → ValidateAccess → HasPermission. Use when the user reports broken behavior.
argument-hint: "<symptom / steps to reproduce>"
---

# Debug a frontend issue

Symptom: $ARGUMENTS

## 1. Pin down the symptom
Get the page URL or route, the user's role and permissions, the environment (`dev`/`beta`/`staging`), the exact steps, expected vs actual behavior, and any console or network error. If these are missing and can't be inferred, ask once, then proceed with the most likely path.

## 2. Locate the code path
- **Page → code**: find the route by its path in `src/modules/*/routes.js`; that gives you the component, its `apiConfig.<entity>`, and the base hook in use.
- **Request → code**: find the endpoint in `src/constants/apiConfig.js`, then its callers (`Grep "apiConfig.<entity>.<action>"`).

## 3. Check the usual suspects for this codebase
| Symptom | Check |
|---|---|
| Redirect to `/login` or `/` | `auth` flag of the route; `useAuth` (profile loaded? token in localStorage under the env-specific key?); `ValidateAccess.getRedirect`. |
| "Unauthorized" / not-allowed page | Route `permission` vs the JWT `authorities` codes (with `ROLE_` stripped); `separateCheck` index (0 = create, 1 = update); `permission` vs `permissions` typo (the plural is ignored). |
| Menu item missing or wrong landing page | `menuConfig.js` child `permission`; order of the items (the first visible child is the landing page). |
| List empty but the API returned data | Response shape vs `mappingData` (`data.content`/`totalElements`, `result === true`); `prepareGetListParams`; query params from the URL (`queryFilter`). |
| Request "fails" despite HTTP 200 | `useFetch` throws when `!data.result && data.statusCode !== 200`. Check the body shape. |
| Wrong token / 401 | `isProjectToken` / `authorization` override; `params.token`; the 401 interceptor does nothing, so check where a logout should happen. |
| Form not prefilled or not saving | `form.setFieldsValue` effect deps; `formId` matches `BaseForm id`; `prepareUpdateData` includes `id`; `handleSubmit` returns `mixinFuncs.handleSubmit(values)`. |
| Edit page treated as create (or the reverse) | URL param must be exactly `create`; `useSaveBase` reads `params.id`. |
| Stale data after an action | Missing `mixinFuncs.getList()` refresh; effect deps (exhaustive-deps lint is off, so look for stale closures). |
| Text shows an id or the wrong language | `defineMessages` auto-ids (file-path based, so a moved file means new ids); missing key in `vi.json`/`en.json`; `useLocale`. |
| Styles differ between envs | Class names are hashed outside `dev`, so a global selector that targets module class names breaks. |
| Works in dev, broken after build | Env var missing in `env/.<name>` (prints `undefined` in URLs); case-sensitive import paths (Linux CI vs Windows). |

## 4. Reproduce and verify
- Reason from the code first. If running the app helps, ask the user before starting `npm start` (it calls the real backend in `env/.dev`).
- When the bug is in pure logic (utils, reducers, mapping functions), write a failing test first with `node .claude/scripts/run-tests.js <path>`, then fix it.
- Add temporary `console.log` calls only if needed, and remove them before finishing.

## 5. Fix
- Make the smallest change that fixes the root cause, not just the symptom. Keep base-hook signatures intact.
- If the root cause is in a shared base hook or kit component, check the other callers for regressions (`Grep`).
- If the fix changes access control, such as correcting `permissions` → `permission`, explain the behavior change and get the user's confirmation.

## Done when
- [ ] The root cause is identified and explained in one or two sentences, with `file:line`.
- [ ] Fix applied; ESLint hook clean; a test added when the logic is testable; `npm run build:dev` passes if imports changed.
- [ ] Other affected callers checked, and remaining risks or manual verification steps listed for the user.
