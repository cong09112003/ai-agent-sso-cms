---
name: refactor-frontend
description: Refactor frontend code in this CMS while preserving behavior and compatibility, for example extracting repeated page or form logic into base-hook overrides or kit components, cleaning up a module, removing dead code, or renaming carefully. It respects the mixin base-hook contracts (useListBase/useSaveBase/useBasicForm), route keys referenced across modules, and shared component props. Use when the user asks to clean up, restructure, or deduplicate code.
argument-hint: "<code or area to refactor>"
---

# Refactor safely

Target: $ARGUMENTS

## 1. Map the blast radius
- List the public surface you might touch: exported components and their props, hook return values, `mixinFuncs` function names, route keys (`routes.<key>` is used across modules), `apiConfig` keys, redux action types, and message ids (auto-generated from the **file path**, so moving or renaming a file changes its ids and orphans the translations in `vi.json`/`en.json`).
- `Grep` every usage of each item you plan to change. Write down which callers must change.

## 2. Lock in the current behavior
- If the logic is pure (utils, reducers, mapping functions), add characterization tests first and run them with `node .claude/scripts/run-tests.js <path>`.
- For UI-only code, write down a short manual checklist (what the page does now) that the user can re-check.

## 3. Refactor in small, reviewable steps
- Keep the diff focused. Don't mix the refactor with feature changes or a mass Prettier reformat; most files aren't Prettier-clean, so reformat only the lines you touch.
- Preserve contracts:
  - base hooks: add functions to `centralizedHandler` and call them via `mixinFuncs`; don't rename existing ones
  - kit components: add optional props only
  - route keys, `apiConfig` keys, and action types stay the same unless every reference is updated in the same change
- Moving a file: update its imports, and point out to the user that its react-intl ids change, so they should run `npm run i18n` and move the existing translations in `vi.json`.
- Don't delete code that looks dead (commented-out menu groups, unused routes) without confirming with the user; some of it is parked on purpose.
- Known quirks you shouldn't silently "fix" during a refactor, because fixing them changes behavior: `permissions` (plural) route keys that are currently ignored, the no-op 401 interceptor, and `routes.DeviceListPage` references in `modules/customer`. Report them as separate findings instead.

## 4. Validate
- ESLint hook clean for every touched file; characterization tests still pass.
- `npm run build:dev` from `source/` (it catches broken imports, aliases, and route references).
- Re-check the callers found in step 1.

## Done when
- [ ] Behavior is unchanged (tests green, manual checklist provided for UI).
- [ ] All references to changed names are updated; the build passes.
- [ ] The summary lists what moved or renamed, any i18n id changes, and any quirks found but deliberately left alone.
