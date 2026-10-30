---
paths:
  - "source/src/components/**"
---

# Shared component kit (`src/components`)

- `components/cms` is the in-house kit that replaced the former private `@itz/react-cms-element` package. Every feature module depends on it, so treat its props as a public API:
  - Add new props as optional, with defaults that keep current behavior.
  - Don't rename or remove props, and don't change defaults. If a breaking change is unavoidable, grep every usage (`Grep "<TextField"` etc.) and update all of them in the same change.
- Export new shared components from `components/cms/index.js` so consumers import from `@components/cms`.
- Components in this kit must not import app hooks that bind to redux or routing (`useAuth`, `useFetch`, ...). The established pattern is to inject them as props: `AutoCompleteField useFetch={useFetch}`, `ActionBar`/`HasPermission useValidatePermission={...}`. Keep that decoupling.
- `components/cms/hooks` holds kit-internal hooks (`useFormField`, `useFilterStorage`). The `useFormField` hook in `src/hooks` is a separate app-level copy, so check which one a file imports before you edit it.
- `components/common` is for app-specific shared pieces that aren't part of the generic kit (`TextSelectedField`, `UploadZipProcessField`).
- The kit's own global styles are `components/cms/styles/common.scss`, imported by `components/cms/index.js`.
