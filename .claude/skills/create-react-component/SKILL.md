---
name: create-react-component
description: Create or extend a React component in this CMS, choosing between a feature-local component (src/modules/<feature>), an app-shared one (src/components/common), or the generic CMS kit (src/components/cms, exported from @components/cms), with Ant Design 5, SCSS modules, react-intl text, and backward-compatible props. Use when a UI piece is needed that isn't a whole page or form.
argument-hint: "<component purpose>"
---

# Create or extend a component

Component: $ARGUMENTS

## 1. Check that it doesn't already exist
- Look in `src/components/cms/index.js`, `src/components/common/`, and the Ant Design 5 component list. Most needs (tables, modals, tooltips, tags, tabs, uploads) are already covered by an Ant Design component or a kit wrapper.
- If a similar component exists, extend it with an **optional** prop instead of copying it.

## 2. Decide where it lives
| Used by | Location | Rules |
|---|---|---|
| one feature | `src/modules/<feature>/<Name>.js` | free to use app hooks and redux |
| several features, app-specific | `src/components/common/...` | may use app hooks (`@hooks/*`) |
| generic, any CMS screen | `src/components/cms/...` + export from `components/cms/index.js` | no direct app hooks: inject `useFetch` / `useValidatePermission` through props (see `.claude/rules/shared-cms-components.md`) |

Don't promote a component to shared until there is a second real consumer.

## 3. Write it
- Function component, default export, PascalCase file. Destructure props, giving defaults to optional props.
- Keep data fetching out of presentational components: take the data and callbacks as props, or take an `apiConfig` plus an injected `useFetch` the way `AutoCompleteField` does.
- Text: `defineMessages` / `FormattedMessage` with Vietnamese defaults. No hardcoded English UI text.
- Styles: a co-located `<Name>.module.scss` (`import styles from './<Name>.module.scss'`) using variables and mixins from `src/assets/scss`; `classnames` for conditional classes.
- Accessibility: semantic Ant Design controls (`Button`, `Link`), labels on inputs, `aria-label` or a tooltip on icon-only buttons, and keyboard reachability for anything clickable.
- Effects: list dependencies deliberately (the lint rule is off), and clean up listeners and timers.
- Lists: a stable `key` taken from the data.

## 4. Validate
- ESLint hook is clean, and `npm run build:dev` succeeds if you added a new export to `components/cms/index.js`.
- If you changed an existing shared component, grep every usage and confirm that the call sites still work with the defaults.
- For non-trivial logic, add a test (`/write-tests`). Wrap renders in `IntlProvider`, and stub `matchMedia` for Ant Design grid components.

## Done when
- [ ] No duplicate of an existing kit or Ant Design component.
- [ ] Placed at the right level; kit components are decoupled from app hooks.
- [ ] Existing call sites are unaffected (additive props only).
- [ ] i18n, styling, and accessibility conventions are followed.
