---
paths:
  - "source/src/hooks/**/*.js"
  - "source/src/store/**/*.js"
  - "source/src/selectors/**/*.js"
---

# Custom hooks and redux state

## Custom hooks (`src/hooks`)
- One hook per file, default export, `use` prefix, camelCase file name equal to the hook name.
- The "base" hooks (`useListBase`, `useSaveBase`, `useBasicForm`) use a mixin pattern. They build a `centralizedHandler` object of functions, pass it to `override(funcs)` for mutation, and then call everything through `mixinFuncs.*`. When you add behavior to a base hook:
  - add the new function to `centralizedHandler`
  - call it internally through `mixinFuncs.x` (not `x` directly) so pages can override it
  - keep existing function names and signatures, because dozens of pages override them
- `useFetch` returns `{ execute, data, loading, error, setData }`. `execute({ data, params, pathParams, onCompleted, onError })` resolves with the response body or the error. It does not throw, so check the result or use the callbacks.
- ESLint does not check exhaustive deps (the rule is off). Write dependency arrays deliberately. `useFetch`'s `execute` is memoized only on `apiConfig`, and `useListBase` passes a new object on every render, so don't put `execute` in an effect's dependencies unless you've checked that it is stable.

## Redux (`src/store`, `src/selectors`)
- The store uses plain `redux` + `redux-saga` with immer, not Redux Toolkit. Keep using the local helpers in `store/utils.js`:
  - `createAction('domain/NAME')` creates an action creator with a `.type` property; `createSuccessActionType`/`createFailureActionType` add the `_SUCCESS`/`_FAILURE` suffixes.
  - `createReducer({ reducerName, initialState, storage }, handlers)` gives you immer drafts. The optional `storage` key (`whiteList`/`blackList`) persists that slice to localStorage on every change.
  - `processAction(apiConfigEntry, action)` is the saga worker. It calls `sendRequest` and then the `onCompleted`/`onError` callbacks from the payload. It treats `!response.data.result` as an error.
- Each saga file default-exports an array of `takeLatest(...)` effects. `store/sagas/index.js` picks up every file automatically through `require.context`, so a new file needs no registration.
- Re-export new action modules from `store/actions/index.js` (`accountActions`, `appActions`, ...) and register new reducers in `store/reducers/index.js`.
- Components read state only through `reselect` selectors in `src/selectors`, never through `state.x.y` inline.
- Redux holds cross-page state only: the account profile, app loading flags, and cache. Page data (lists, details, form state) stays local, in `useFetch`/`useListBase` state or Ant Design `Form`. Don't move page data into redux.
- Call saga-backed actions from components with `useFetchAction(action, { loading })`. It dispatches loading flags (`REDUX` per-action or `APP` global overlay) and the `_SUCCESS`/`_FAILURE` actions for you.
