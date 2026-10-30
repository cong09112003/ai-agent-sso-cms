---
name: write-tests
description: Write and run unit and integration tests for this CMS with the stack that is actually installed (Jest 27 via react-scripts, React Testing Library 14, user-event 14, jest-dom), using the alias-aware runner node .claude/scripts/run-tests.js. Covers utils, redux helpers, reducers and selectors, hooks, and components with IntlProvider, redux Provider, and MemoryRouter wrappers. Use when adding tests, raising coverage, or reproducing a bug as a failing test.
argument-hint: "<file, module, or behavior to test>"
---

# Write tests

Target: $ARGUMENTS

Read `.claude/rules/testing.md` first. It explains why `npm test` fails here and what does not work under Jest (no craco aliases, no `.babelrc` react-intl auto-ids).

## 1. Choose what to test (highest value first)
1. Pure functions: `src/utils/index.js` (`validatePermission`, `orderNumber`, `removePathParams`, `ensureArray`, `translateKeys`), and `src/store/utils.js` (`createAction`, `createReducer` including `storage` persistence).
2. Reducers and selectors in `src/store/reducers`, `src/selectors`.
3. Mapping and override functions extracted from pages, and hooks with clear inputs and outputs (`renderHook` from `@testing-library/react`).
4. Components: render with wrappers and assert user-visible behavior.

Don't snapshot whole pages. Don't test Ant Design internals.

## 2. Write the test
- File: `<name>.test.js` next to the code under test. Import through the `@` aliases (the runner maps them).
- Wrappers, as needed:
  ```js
  import { IntlProvider } from 'react-intl';
  import { MemoryRouter } from 'react-router-dom';
  import { Provider } from 'react-redux';
  import { createStore } from 'redux';
  import rootReducer from '@store/reducers';

  const renderWithProviders = (ui, { route = '/', store = createStore(rootReducer) } = {}) =>
      render(
          <Provider store={store}>
              <IntlProvider locale="vi" onError={() => {}}>
                  <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
              </IntlProvider>
          </Provider>,
      );
  ```
  Don't import `@store` itself, because it starts the saga middleware.
- Network: `jest.mock('@services/api', () => ({ sendRequest: jest.fn() }))`, and have it return `Promise.resolve({ data: { result: true, data: {...} } })`.
- localStorage-based code: seed with `window.localStorage.setItem(storageKeys.X, JSON.stringify(value))` and clear in `afterEach`.
- Ant Design grid, table, or select: stub `window.matchMedia` (snippet in the testing rule).
- Query by role, label, or text; interact with `userEvent.setup()`; assert with jest-dom matchers.
- If a component throws "An `id` must be provided to format a message", the cause is the missing auto-id plugin under Jest. Test the component's logic separately, or mock the module that defines its messages.

## 3. Run
```
node .claude/scripts/run-tests.js src/utils            # a folder
node .claude/scripts/run-tests.js src/utils/index.test.js
node .claude/scripts/run-tests.js -t "validatePermission"
node .claude/scripts/run-tests.js --coverage
```
`src/App.test.js` is a known-broken CRA placeholder. Leave it alone unless the user asks, and exclude it by passing a path.

## Done when
- [ ] New tests pass with the runner; failures are reported with their output, not hidden.
- [ ] Tests cover the happy path, edge cases (empty, null, permission denied), and the error path.
- [ ] No real network calls, no dependence on test order, and localStorage and mocks are reset between tests.
- [ ] No production code was changed just to make it testable, unless the user agreed.
