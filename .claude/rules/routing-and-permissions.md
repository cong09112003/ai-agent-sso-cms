---
paths:
  - "source/src/routes/**/*.js"
  - "source/src/modules/**/routes.js"
  - "source/src/constants/menuConfig.js"
  - "source/src/hooks/useValidatePermission.js"
  - "source/src/hooks/useAuth.js"
  - "source/src/components/cms/HasPermission.js"
---

# Routing, navigation, and access control

## Route entries
Each module's `routes.js` default-exports `{ routeKey: { path, component, auth, permission, separateCheck, pageOptions, layout } }`, and `src/routes/index.js` spreads them in. Keep `notFound` (`path: '*'`) as the last key.

- `auth`: `true` = logged-in users only, `false` = logged-out only (redirects to the first allowed menu item), `null` = both. Use `accessRouteTypeEnum` from `@constants` when comparing.
- `permission` (singular) is the only key `routes/routes.js` reads. Some existing entries use `permissions` (plural, for example in `modules/customer/routes.js`) and are therefore **not** checked. Use `permission` for new routes. Don't "fix" existing entries without confirming with the user, because fixing them changes who can open those pages.
- Permission values are compared against the codes in the JWT `authorities` claim (with the `ROLE_` prefix stripped). Prefer `apiConfig.x.y.permissionCode`. Some older routes pass `baseURL`s, which `validatePermission` matches as paths.
- `separateCheck: true` on a save page means `permission[0]` is required in create mode (`/:id` = `create`) and `permission[1]` in edit mode.
- `pageOptions` is passed to the page component (`objectName`, `listPageUrl`, `renderBreadcrumbs`).
- Route keys are referenced across modules as `routes.<key>.path` (via `import routes from '@routes'`). Renaming a key breaks those references, so grep before renaming.

## Navigation
- Build paths with `generatePath(routes.x.path, { id })` and navigate with `useNavigate()`. Don't concatenate path strings. List filters and paging live in the query string (`useQueryParams`); keep them when linking back to a list.
- New create links use `/<entity>/create`; `useSaveBase` switches into create mode when `params.id === 'create'`.

## Menu
- `src/constants/menuConfig.js` (`navMenuConfig`) is a two-level array. Each child has `key`, `path: routes.x.path`, and `permission: [apiConfig.x.getList.permissionCode]`. A group whose children are all filtered out is hidden. The first visible child is also the post-login landing page, so menu order matters.

## Authorization model (frontend side)
- `useAuth()` decodes the access token from localStorage with `jwt-decode` to get `permissionCodes`, and loads the profile through the `account/GET_PROFILE` saga. `isAuthenticated` means a profile has loaded.
- Frontend checks only hide UI. Treat them as UX, not security: the backend must enforce every permission.
- Hide or show actions with `<HasPermission requiredPermissions={[code]} useValidatePermission={useValidatePermission}>` or `mixinFuncs.hasPermission(...)`, not with ad-hoc checks of `profile.kind`.
