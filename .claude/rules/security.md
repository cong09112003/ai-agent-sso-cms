# Frontend security (applies to all code changes)

What the code establishes about the frontend side:

- **Tokens.** The access and refresh tokens live in `localStorage` (`storageKeys.USER_ACCESS_TOKEN` / `USER_REFRESH_TOKEN`, read through `@services/userService`), and `sendRequest` attaches them as `Bearer`. Read and write them only through `userService`; never put them in URLs, logs, redux state that is persisted with `storage`, or error messages. `removeCacheToken()` is the logout cleanup. If you add new token or session keys, add them to that cleanup too.
- **Everything in `REACT_APP_*` is public.** CRA inlines those variables into the JS bundle. `env/.dev|.beta|.staging` currently contain `REACT_APP_USERNAME`/`REACT_APP_PASSWORD` (Basic-auth client credentials used at login) and `REACT_APP_SECRET_ID`, so those values ship to every browser. Never add real secrets as `REACT_APP_*`. Raise it with the user if a change needs a true secret on the client.
- **Env files.** Don't create or edit `source/env/*` files or print their values. Settings deny edits to them; ask the user to change them.
- **XSS.** No code uses `dangerouslySetInnerHTML` today. Keep it that way. Rendering through JSX/Ant Design escapes content. `react-quill` is installed but unused. If rich-text HTML ever has to be rendered, it must be sanitized with a vetted sanitizer, and adding one is a dependency decision for the user.
- **URLs and redirects.**
  - Navigate only to internal routes (`routes.x.path`). Don't redirect to a URL taken from the query string or the API without checking that it is same-origin or allowlisted.
  - For data-supplied links, keep the existing `window.open(url, '_blank', 'noopener,noreferrer')` pattern, or use `<a target="_blank" rel="noopener noreferrer">`. Reject `javascript:` URLs.
  - Encode values put into query strings (`encodeURIComponent` / `query-string`). Existing code that interpolates raw names, such as `?customerName=${record.name}`, is a pattern to avoid.
- **Logging.** Don't add `console.log` calls with API responses, profiles, tokens, or form values. Existing logs are leftovers, so don't copy them.
- **Authorization.** Permission checks in the UI (`HasPermission`, route `permission`, menu `permission`) only hide UI. Never treat them as protection, and never relax them to "make a page work" without saying so.
- **Transport.** API hosts come from `REACT_APP_API` / `REACT_APP_API_MEDIA` and are HTTPS in the committed env files. Don't hardcode `http://` hosts. `apiTenantUrl` in `@constants` is a leftover placeholder.
- **Dependencies.** Don't add packages without the user's approval (`npm install` requires confirmation in settings). Prefer what is already installed (`lodash`, `dayjs`, `query-string`, `classnames`). Run `npm audit` to report problems; don't run `npm audit fix` without the user's go-ahead.
