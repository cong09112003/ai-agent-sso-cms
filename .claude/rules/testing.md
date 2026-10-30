---
paths:
  - "source/src/**/*.test.js"
  - "source/src/setupTests.js"
---

# Testing

- Stack: Jest 27 through `react-scripts test` (CRA 5), React Testing Library 14, `@testing-library/user-event` 14, and `@testing-library/jest-dom` (loaded in `src/setupTests.js`). There are no E2E tools (Cypress/Playwright) and no MSW.
- **Run tests with `node .claude/scripts/run-tests.js [path|-t name]`** (from the repo root). Plain `npm test` cannot resolve the `@` aliases, because they exist only in craco's webpack config. `src/App.test.js` fails for that reason, and it is also the stale CRA placeholder that looks for a "learn react" link.
- `.babelrc` is **not** applied under Jest (CRA's babel-jest ignores it), so `babel-plugin-react-intl-auto` doesn't run in tests. `defineMessages({ k: 'text' })` then yields raw strings instead of `{ id, defaultMessage }`. Any code that calls `intl.formatMessage` on those messages will throw "An `id` must be provided". This means:
  - Test pure logic first: `src/utils`, `store/utils.js` (`createReducer`, `createAction`), and reducers and selectors.
  - Render components inside `<IntlProvider locale="vi" onError={() => {}}>`. Components that use auto-id messages may need `jest.mock` for the message module, or are better covered by testing their hooks or helpers.
  - Components that use `useSelector`/`useDispatch` need a `<Provider store={...}>`. Build a small store with `createStore(rootReducer)` and no saga middleware rather than importing `@store` (which starts sagas). Components that use routing need a `<MemoryRouter>`.
- Mock the network at `@services/api` (`jest.mock('@services/api', () => ({ sendRequest: jest.fn() }))`), never real endpoints. Return the backend shape: `{ data: { result: true, data: ... } }`.
- Put test files next to the code as `<name>.test.js`. Name tests by behavior. Use RTL queries by role or label (`getByRole`, `getByLabelText`) rather than CSS classes, because class names are hashed outside `dev`.
- Ant Design components need `window.matchMedia`, which jsdom lacks. If a test touches responsive components (`Row`/`Col`, `Table`, `Select`), stub it in the test file:
  ```js
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  ```
