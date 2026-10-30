---
paths:
  - "Dockerfile"
  - "docker-compose.yaml"
  - "dev-ops/**"
  - ".github/**"
  - ".dockerignore"
  - "source/.nvmrc"
  - "dev-ops/env/**"
  - "source/appServer.js"
  - "source/craco.config.js"
  - "source/package.json"
  - "source/env/.*"
  - "source/.husky/**"
---

# Build, environments, and deployment

- **Env files.** `source/env/.dev|.beta|.staging` hold `REACT_APP_API`, `REACT_APP_API_MEDIA`, `REACT_APP_ENV`, `REACT_APP_APP_ID`, `REACT_APP_SECRET_ID`, `REACT_APP_USERNAME`/`PASSWORD`, `REACT_APP_USER_KINDS` (a JSON array), and `GENERATE_SOURCEMAP`. `env/.local` and `env/.prod*` are gitignored. Scripts load the files with `env-cmd -f ./env/.<name>`. `REACT_APP_ENV` is part of the localStorage key names (`storageKeys` in `src/constants/index.js`), so changing it logs users out.
- **craco** (`craco.config.js`):
  - creates an `@<name>` webpack alias for every top-level entry in `src/`
  - enables CSS modules for `*.module.scss` with camelCase exports
  - hashes class names (`[hash:base64:5]`) everywhere except when `REACT_APP_ENV === 'dev'`
  - applies `.babelrc`, which adds the react-intl auto-id plugin, through `@jackwilsdon/craco-use-babelrc`

  None of this applies to Jest.
- **Build scripts.** The `prebuild:*` hooks clear `build/` with `rm -rf`, which needs a POSIX shell (Git Bash on Windows). `build:beta` has no prebuild hook. `prebuild:prod` never runs, because its name doesn't match `build:production`.
- **Production server.** `source/appServer.js` (Express plus compression) serves `build/` as an SPA. `const port = {PORT};` is a literal placeholder that Jenkins replaces with `sed`, so the file isn't valid JS until then (ESLint ignores it). Don't "fix" the placeholder.
- **Jenkins** (`dev-ops/Jenkinsfile`) only deploys branch `dev`. It runs `npm ci && npm run build:dev` in `source/`, copies the files to the dev host over SSH, and starts the app under pm2. Every Docker and CI path builds with the **dev** env.
- **Docker.**
  - The build context is the **repo root**. The `Dockerfile` builds with `node:${NODE_VERSION}-alpine` (CI passes `source/.nvmrc`; the default `ARG` must match it) and `npm run build:${BUILD_ENV}`, then serves `build/` from `nginx:1.27-alpine` on port 80, using `dev-ops/docker/nginx.conf` (SPA fallback, long cache for `/static/`, `no-cache` for `index.html`). It has a `HEALTHCHECK`.
  - `.dockerignore` excludes `node_modules`, `build`, `.git`, `.github`, `.claude`, and `*.ovpn`.
  - `dev-ops/nginx.conf` is a separate host reverse-proxy template whose `server_name` comes from another project.
- **GitHub Actions** (`.github/workflows/deploy.yml`; full flow documented in `docs/ci-cd.md`, keep it in sync). A push to `dev` deploys the GitHub Environment `dev`; a push to `main` deploys `prod`; a manual dispatch picks either one.
  - **Environment secrets** (per environment): `VPN_OVPN_BASE64` (the `.ovpn` file, base64-encoded), optional `OVPN_USERNAME`/`OVPN_PASSWORD`, `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD` or `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, and `APP_ENV_FILE`.
  - **Environment variables**: `APP_PORT` (default 3000), `APP_NAME` (default `ai-agent-sso-cms-<env>`), and `BUILD_ENV` (default `dev`/`production`).
  - **Repository secrets** shared by both environments: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
  - **Production env values are never committed.** `APP_ENV_FILE`, when set, is written to `source/env/.<BUILD_ENV>` before the build; prod requires it (template: `dev-ops/env/production.env.example`). Dev falls back to the committed `source/env/.dev`. Keep the template's keys in sync with `source/env/.dev` whenever you add an env var.

  Jobs (each shows as its own node in the Actions graph):
  1. `target` (Determine Deployment Target) and `metadata` (Collect Git Commit Metadata) compute the environment, Node version, and commit info as job outputs. `announce-start` notifies.
  2. `lint` (errors only), then `build`, which runs in the environment (reads `vars.*` and `APP_ENV_FILE`), builds the image, and uploads it as the `docker-image-<env>` artifact (retention 1 day). `announce-build` reports the lint and build results.
  3. `deploy` runs in the environment. It downloads the artifact, connects OpenVPN (`VPN_OVPN_BASE64` secret, decoded on the runner), sends the image over SSH (`dev-ops/deploy/ssh-cmd.sh` builds the ssh command: `sshpass`, or `SSH_PRIVATE_KEY`), and runs `dev-ops/deploy/remote-deploy.sh <app> <image> <port>`. That script replaces the container, waits for it to become healthy, rolls back on failure, and keeps the newest 3 images. `announce-deploy` reports the result.

  Job outputs must never carry secret values, because GitHub drops outputs that contain a secret. Both `build` and `deploy` use the environment, so a prod run with Required reviewers asks for approval twice.

  Every stage reports to Telegram through `.github/scripts/telegram-notify.sh`. All credentials are GitHub secrets; never write them into repo files. The server needs only Docker, because each frontend pins its Node version in its own image and uses its own host port (default `3000`; dev and prod need different ports if they share a server).
- `.gitattributes` forces LF for `*.sh`, `Dockerfile`, `*.conf`, and `*.yml`. Keep it that way, because CRLF breaks the scripts on Linux.
- **Git hooks.** husky is installed from `source/.husky`. The pre-commit hook runs `lint-staged`, whose `*.js` task runs `npm run lint`. That lints and fixes all of `src/`, then runs `git add .`, which stages unrelated changes under `source/`. Warn the user before committing when the working tree has other changes. The commitlint (conventional commits) hook is present but commented out.
- Changing `package.json`, lock files, craco/babel/eslint config, or deploy files is a user decision. Explain the change and ask first.
