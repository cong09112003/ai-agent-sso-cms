---
name: commit-feature
description: Suggest a commit message for a finished feature or fix in the team's format "[DEV][FE] <short English summary>". Use when the user says a feature is done, asks for a commit name/message, or asks to "create a task" for the completed work. Only prints the message; never stages, commits, or pushes.
argument-hint: "[optional summary or files]"
---

# Suggest a commit message

Input: $ARGUMENTS (an optional summary of the work or a list of files).

**Do not run `git add`, `git commit`, or `git push`.** The user commits by hand. Only read the state of the repo.

## 1. Read the change
- Run `git status --short`, `git diff`, and `git diff --cached` to see what changed.
- If unrelated changes are mixed in, list the files that belong to this feature so the user knows what to stage.

## 2. Write the message
- The format is `[DEV][FE] <summary>`. Example: `[DEV][FE] add role list page with search and paging`.
- Write the summary in English, lowercase, and in the imperative mood ("add", "fix", "update", "remove"). Keep it under 72 characters total, with no trailing period.
- Describe what changed for the user or the feature, not the file names.
- Keep it to one line.

## 3. Reply
- Reply with the message in a code block, and nothing more unless something needs a warning. Warn when:
  - the branch is `dev` or `main`, because pushing there triggers a deploy;
  - the change includes files that must not be committed, such as env files, `*.ovpn`, or keys.
