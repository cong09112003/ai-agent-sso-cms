---
name: api-integration
description: Add or modify backend API integrations in this CMS, covering endpoint declarations in src/constants/apiConfig.js, calls through useFetch / useListBase / useSaveBase / redux-saga processAction, header and token handling in src/services/api.js, response mapping, file uploads, and error handling. Use when wiring a new endpoint, changing payloads or params, or debugging request and response handling.
argument-hint: "<endpoint(s) or integration change>"
---

# API integration

Change: $ARGUMENTS

Follow `.claude/rules/api-integration.md`. Don't touch `src/services/api.js` unless the change genuinely concerns every request, and ask the user before changing global auth or interceptor behavior.

## Steps
1. **Collect the contract.** Get the method, path, path and query params, request body, response shape (`{ result, data }`? paged `content`/`totalElements`?), and permission code. If the user hasn't given them, ask. Check whether a similar entity in `apiConfig.js` already follows the same backend pattern.
2. **Declare the endpoint** under its entity group in `apiConfig.js`, with the standard names (`getList`, `getById`, `create`, `update`, `delete`, `changeStatus`, `autocomplete`):
   ```js
   getById: { baseURL: `${apiUrl}v1/<entity>/get/:id`, method: 'GET', headers: baseHeader, permissionCode: '<CODE>' },
   ```
   - For uploads use `{ path: ..., method: 'POST', headers: multipartFormHeader }`, with `path` rather than `baseURL`.
   - For media hosts use `AppConstants.mediaRootUrl` (which comes from `REACT_APP_API_MEDIA`).
3. **Call it** with the lightest option that fits:
   - list or detail pages: `useListBase` / `useSaveBase` (they find the endpoints by name)
   - one-off calls in a component: `const { execute, loading } = useFetch(apiConfig.x.y)`, then `execute({ data, params, pathParams: { id }, onCompleted, onError })`
   - load on mount: `useFetch(apiConfig.x.y, { immediate: true, mappingData: (res) => res.data })`
   - state shared across pages: an action plus a saga using `processAction(apiConfig.x.y, payload)`, triggered with `useFetchAction`
4. **Per-app token endpoints:** pass `isProjectToken` to `useListBase`, or `authorization: \`Bearer ${token}\`` in the config passed to `useFetch` (spread a copy, don't mutate `apiConfig`).
5. **Handle the outcomes:**
   - success: notify (`useNotification`) and refresh the data (`mixinFuncs.getList()`, `executeGet`)
   - error: show the backend `message`, or a mapped `ErrorCode[code].message` from `@constants/errorCodes`, with a Vietnamese fallback; set `loading` back
   - form submits: return the response to `useBasicForm`'s callback so field errors are mapped onto the inputs
6. **Don't** log responses that contain user data or tokens, hardcode hosts, or build URLs by string concatenation outside `apiConfig`.

## Validate
- ESLint hook is clean, and `npm run build:dev` succeeds when you added imports.
- If you added a mapping or transformation function, unit-test it with `node .claude/scripts/run-tests.js` and a mocked `@services/api` (see `/write-tests`).
- Tell the user which backend endpoints and permission codes the change assumes, so they can confirm them against the API.

## Done when
- [ ] Each endpoint is declared once in `apiConfig.js` with method, headers, and `permissionCode` where applicable.
- [ ] Loading, error, and success paths are handled visibly.
- [ ] No direct axios/fetch calls or new axios instances in feature code.
