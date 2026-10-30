---
name: review-code
description: Review frontend changes in this CMS (the working-tree diff, a branch, or given files) for correctness, consistency with the project's base-hook, route, and apiConfig architecture, React pitfalls (stale closures, missing cleanup, unstable keys), loading and error handling, accessibility, i18n, and frontend security (tokens, REACT_APP_* exposure, XSS, redirects). Use before committing or when the user asks for a review.
argument-hint: "[files | branch | empty for the current diff]"
---

# Review frontend code

Scope: $ARGUMENTS (if empty, review `git diff` plus `git diff --cached`, and also list untracked files with `git status --short`).

For a large diff (more than about 15 files), delegate to the `frontend-code-reviewer` agent and summarize what it returns.

## 1. Gather context
- Read the full changed files, not just the hunks, plus the base hooks and kit components they call.
- Note the intent of the change (from the user, the commit message, or the code itself).

## 2. Check (report only real problems; quote `file:line`)
**Correctness**
- Base hooks: overrides set on `funcs.*` with the correct names; `mappingData` returns `{ data, total }` for lists; `prepareUpdateData` includes `id`.
- Routes: `permission` (singular), `separateCheck` index order, keys unique across modules, inserted before `notFound`. `generatePath` targets keys that exist.
- `apiConfig`: method, path params (`:id`), headers, `permissionCode`; no hardcoded hosts.
- Effects: dependency arrays (the lint rule is off), stale closures over `execute`/state, cleanup of listeners and timers, `setFieldsValue` effects.
- Lists: stable `key`/`rowKey`.
- Async: loading reset on error, double-submit guarded, no unhandled `execute()` results where an error matters.

**Consistency**
- `@` aliases, `@components/cms` kit usage, Ant Design over custom UI, `*.module.scss`, `defineMessages`/`FormattedMessage` with Vietnamese defaults, and naming that matches the module.
- No unrelated reformatting (most files are not Prettier-clean, so a mass reformat is noise in review).
- No new dependency, and no edits to `package.json`, lock files, or env files without a stated reason.

**Security**
- No tokens, credentials, or PII in logs, URLs, or persisted redux storage. No new secrets in `REACT_APP_*`.
- No `dangerouslySetInnerHTML` without sanitizing. External links use `noopener,noreferrer`. Redirect targets are internal. Query values are encoded.
- Permission checks not removed or loosened without saying so.

**Accessibility and UX**
- Labels on inputs, keyboard-reachable actions, icon buttons with a tooltip or `aria-label`.
- Visible loading, empty, and error states.

## 3. Verify mechanically
- `npx eslint <changed .js files>` from `source/` (errors must be zero; mention new warnings).
- `node .claude/scripts/run-tests.js` for affected test files, if any.
- `npm run build:dev` when imports or routes changed (ask the user first if the build is slow for them).

## 4. Report
Group findings by severity: **Blocking**, **Should fix**, and **Nit** (keep nits few). Give each one a `file:line`, the problem, why it matters, and a concrete fix. End with what you verified (lint, tests, build) and what you couldn't. Don't modify files during a review unless the user asks for fixes.
