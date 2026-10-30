---
paths:
  - "source/src/constants/apiConfig.js"
  - "source/src/services/**/*.js"
  - "source/src/hooks/useFetch*.js"
  - "source/src/hooks/useListBase.js"
  - "source/src/hooks/useSaveBase.js"
  - "source/src/store/sagas/**/*.js"
---

# API integration

## Declaring endpoints
- Every endpoint is an entry in `src/constants/apiConfig.js`, grouped by entity:
  ```js
  getList: { baseURL: `${apiUrl}v1/customer/list`, method: 'GET', headers: baseHeader, permissionCode: 'CUS_L' },
  ```
  - `apiUrl` comes from `REACT_APP_API` and already ends with `/`, so paths start with `v1/...` and no leading slash.
  - Path params are written `:id`; `sendRequest` substitutes them from `pathParams`.
  - Use `multipartFormHeader` plus `path` (not `baseURL`) for uploads. `sendRequest` posts those with a `FormData`, using plain `axios` and not the interceptor-backed instance.
  - Add `permissionCode` when the backend gates the endpoint. Menu entries, `HasPermission`, and `useListBase` action buttons read it.
- Never hardcode hosts or full URLs in components. Media URLs go through `AppConstants.mediaRootUrl` / `contentRootUrl` in `@constants`.
- Name CRUD entries `getList`, `getById`, `create`, `update`, `delete`, `changeStatus`, `autocomplete`. `useListBase`/`useSaveBase` look them up by these names.

## Making requests
- Inside components, use `useFetch(apiConfig.entity.action, { immediate, params, pathParams, mappingData })`. Don't call `axios` or `fetch` directly, and don't create new axios instances: `src/services/api.js` already attaches `Authorization: Bearer <token>` and `X-Client-Type: WEB`.
- Header overrides: `ignoreAuth: true` skips the token, `authorization: '...'` replaces the header (used for Basic auth at login and for per-app tokens), and `params.token` sends a one-off bearer token.
- Response contract: success is `{ result: true, data }` or `statusCode === 200`. List data is paged as `data.content` / `data.totalElements`. `useFetch` throws internally (and returns the error) when neither is present; `account.loginBasic` and `permission.export` are hardcoded exceptions.
- Error bodies carry a `code` such as `ERROR-ACCOUNT-APP-ROLE-0001`. Messages for known codes live in `src/constants/errorCodes.js`. Field-level validation errors come back as `data.data = [{ field, message }]`, and `useBasicForm`'s `handleCallBackAfterSubmitForm` maps them onto the form.
- The 401 interceptor in `api.js` currently does nothing (its logout is commented out). Session expiry is detected in `ValidateAccess` when the tab regains focus. Don't assume a global 401 redirect exists.

## Loading, empty, and error states
- Use the `loading` from `useFetch`/`useListBase`/`useSaveBase` for `BaseTable loading`, `Button loading`, or `<Loading show />`. Use `useFetchAction.LOADING_TYPE.APP` only for blocking, app-wide work such as fetching the profile.
- Report failures to the user with `useNotification()` (`notification({ type: 'error', message })`) or `showErrorMessage` from `@services/notifyService`. Don't let an error fail silently, and don't use `console.log` as error handling.
- Empty lists are handled by `BaseTable` (Ant Design empty state). Custom views must render an explicit empty state.
