---
name: commit-feature
description: Commit a finished feature or fix with the team's message format "[DEV][FE] <short English summary>". Use when the user says a feature is done, asks to commit, or asks to "create a task" for the completed work. Stages only the files of that feature, shows the message, and commits after confirmation. Never pushes unless asked.
argument-hint: "[optional summary or files]"
---

# Commit a finished feature

Input: $ARGUMENTS (an optional summary of the work or a list of files).

## 1. Collect the change
- Run `git status --short`, `git diff`, and `git diff --cached`. Note the current branch.
- If the branch is `dev` or `main`, stop. Suggest a feature branch (`feature/<kebab-name>`); pushing to those branches triggers a deploy.
- Decide which files belong to this feature. Leave unrelated changes unstaged and tell the user about them.
- Never stage env files, `*.ovpn`, keys, logs, `build/`, or `node_modules`.

## 2. Write the message
- The format is `[DEV][FE] <summary>`. Example: `[DEV][FE] add role list page with search and paging`.
- Write the summary in English, lowercase, and in the imperative mood ("add", "fix", "update", "remove"). Keep it under 72 characters total, with no trailing period.
- Describe what changed for the user or the feature, not the file names.
- Use one line. Add a body (a blank line, then 1–3 short `- ` bullets) only when the change touches several areas.
- End the message with the attribution line from the session's instructions, if one is set.

## 3. Commit
- Show the user the message and the list of staged files, and ask them to confirm.
- After they confirm, run `git add <files>`, then `git commit -m "<message>"`. Use a heredoc when the message has a body.
- The pre-commit hook runs `npm run lint` on all of `src/`, then `git add .`, which can pull in unrelated `source/` files. After the commit, run `git show --stat HEAD`. If unrelated files got in, tell the user; don't amend without asking.
- If the hook fails, fix the lint **errors** in the feature's files and create the commit again. Never use `--no-verify`.

## 4. Report
- Report the commit hash, the message, and the files.
- Push only when the user asks (`git push -u origin <branch>`), then remind them to open a PR into `dev`.
