# ai-agent-sso-cms

Trang quản trị (CMS) cho hệ thống SSO: quản lý tài khoản, ứng dụng, cùng với vai trò, quyền và loại người dùng của từng ứng dụng. Giao diện mặc định bằng tiếng Việt.

## Công nghệ

| Thành phần | Thư viện |
|---|---|
| UI | React 18, Ant Design 5, Sass + CSS Modules |
| Build | Create React App 5 (`react-scripts`) qua craco 7 |
| Routing | React Router 6 |
| State | redux + redux-saga + reselect + immer |
| HTTP | axios (bọc trong `src/services/api.js`) |
| i18n | react-intl + `babel-plugin-react-intl-auto` (vi, en) |
| Test | Jest 27 + React Testing Library 14 |
| Chất lượng code | ESLint 8, Prettier 3, husky + lint-staged |

Dự án dùng JavaScript thuần (không có TypeScript).

## Yêu cầu

- Node.js >= 16 (Docker và CI dùng Node 18)
- npm
- Trên Windows: dùng Git Bash, vì các script `prebuild:*` gọi `rm -rf`

## Bắt đầu

Toàn bộ mã ứng dụng nằm trong thư mục `source/`.

```bash
cd source
npm ci          # postinstall sẽ cài git hooks (husky)
npm start       # chạy dev server với env/.dev
```

### Biến môi trường

Mỗi môi trường có một file trong `source/env/` (`.dev`, `.beta`, `.staging`), được nạp qua `env-cmd`. Các biến chính:

| Biến | Ý nghĩa |
|---|---|
| `REACT_APP_API` | URL gốc của API SSO (kết thúc bằng `/`) |
| `REACT_APP_API_MEDIA` | URL gốc của dịch vụ media |
| `REACT_APP_ENV` | Tên môi trường; được dùng trong tên khóa localStorage |
| `REACT_APP_APP_ID`, `REACT_APP_SECRET_ID` | Định danh của CMS với SSO |
| `REACT_APP_USERNAME`, `REACT_APP_PASSWORD` | Thông tin Basic auth dùng khi đăng nhập |
| `REACT_APP_USER_KINDS` | Mảng JSON các loại người dùng được phép đăng nhập |

`env/.local` và `env/.prod*` bị gitignore. Giá trị production **không commit vào repo**: điền theo mẫu [dev-ops/env/production.env.example](dev-ops/env/production.env.example), rồi lưu vào secret `APP_ENV_FILE` của environment `prod` trên GitHub. CI sẽ ghi nội dung đó ra `source/env/.production` trước khi build (xem phần Triển khai).

> ⚠️ Mọi biến `REACT_APP_*` đều được đóng gói vào bundle JavaScript và ai cũng xem được trên trình duyệt. Không đặt bí mật thật vào đây.

## Scripts

Chạy trong `source/`:

| Lệnh | Mô tả |
|---|---|
| `npm start` | Dev server (`env/.dev`) |
| `npm run build:dev` / `build:beta` / `build:staging` / `build:production` | Build ra `build/` với env tương ứng |
| `npm run lint` | ESLint `--fix` trên toàn bộ `src/` |
| `npm run format` | Prettier `--write` trên toàn bộ `src/` |
| `npm run i18n` | Trích xuất message react-intl vào `src/locales/en.json` |

### Chạy test

Không nên dùng `npm test`: lệnh này chạy ở chế độ watch, và Jest của CRA không hiểu các alias `@...`. Hãy dùng script bọc sẵn (chạy được từ thư mục gốc hoặc từ `source/`):

```bash
node .claude/scripts/run-tests.js                  # tất cả test
node .claude/scripts/run-tests.js src/utils        # theo đường dẫn
node .claude/scripts/run-tests.js -t "tên test"    # theo tên
node .claude/scripts/run-tests.js --coverage
```

File test đặt cạnh mã nguồn, đặt tên `<tên>.test.js`. `src/App.test.js` là file mẫu cũ của CRA và hiện đang lỗi.

## Cấu trúc thư mục

```
├── source/                 # Ứng dụng React
│   ├── env/                # File môi trường
│   ├── appServer.js        # Express server phục vụ build (cổng là placeholder {PORT})
│   ├── craco.config.js     # Alias @<thư mục>, CSS modules, .babelrc
│   └── src/
│       ├── modules/        # Màn hình theo chức năng (app, manager, user, customer, profile, login, main...)
│       ├── components/cms/ # Bộ component dùng chung (PageWrapper, ListPage, BaseTable, BaseForm, *Field...)
│       ├── components/common/
│       ├── hooks/          # useFetch, useListBase, useSaveBase, useBasicForm, useAuth...
│       ├── constants/      # apiConfig.js, menuConfig.js, hằng số
│       ├── routes/         # Bảng route và ValidateAccess (auth + phân quyền)
│       ├── services/       # api.js (axios), userService.js (token)
│       ├── store/          # redux actions / reducers / sagas
│       ├── selectors/
│       ├── locales/        # vi.json, en.json, commonMessage
│       ├── utils/
│       └── assets/         # SCSS toàn cục, ảnh, icon
├── dev-ops/                # deploy/ (script trên server), docker/ (nginx trong container), env/ (mẫu env prod), Jenkinsfile
├── .github/                # Workflow CI/CD và script gửi Telegram
├── Dockerfile
├── docker-compose.yaml
├── CLAUDE.md, .claude/     # Cấu hình Claude Code
```

## Quy ước phát triển

- **Import qua alias.** craco tự tạo alias `@<tên>` cho mọi thư mục cấp 1 trong `src/` (`@modules`, `@hooks`, `@constants`, `@components`, `@utils`...).
- **API.** Mỗi endpoint chỉ khai báo một lần trong `src/constants/apiConfig.js` (`baseURL`, `method`, `headers`, `permissionCode`) và được gọi qua `useFetch`, `useListBase`, `useSaveBase` hoặc saga. Không gọi axios hay fetch trực tiếp, không hardcode URL.
- **Trang danh sách / trang sửa.** Dùng `useListBase` / `useSaveBase` và tùy biến qua `override(funcs)`. Đường dẫn `/<entity>/create` là chế độ tạo mới.
- **Form.** Dùng Ant Design Form qua `BaseForm`, `useBasicForm` và các field trong `@components/cms`.
- **Route và phân quyền.** Mỗi module có file `routes.js` riêng, được gộp vào `src/routes/index.js` (route `notFound` phải nằm cuối cùng). Khai báo `auth` (`true` / `false` / `null`) và `permission` (số ít, là mảng mã quyền). Muốn hiện trên menu thì thêm vào `src/constants/menuConfig.js`.
- **Văn bản giao diện.** Viết tiếng Việt bằng `defineMessages` hoặc `<FormattedMessage defaultMessage="..." />`, không cần `id` (id được sinh tự động theo đường dẫn file).
- **Style code.** Thụt lề 4 dấu cách, dấu nháy đơn, có chấm phẩy, có dấu phẩy cuối, độ dài dòng tối đa 120. Phần lớn file hiện chưa được Prettier format, nên chỉ format những dòng mình sửa.

### Thêm một trang mới

1. Khai báo endpoint trong `apiConfig.js`.
2. Tạo `src/modules/<tên>/` với `index.js` (danh sách), `<Tên>SavePage.js`, `<Tên>Form.js` và `routes.js`. Có thể tham khảo `src/modules/customer/`.
3. Gộp routes của module vào `src/routes/index.js`, đặt trước `notFound`.
4. Thêm mục menu trong `menuConfig.js` nếu cần.

## Git hooks

- **pre-commit:** chạy `lint-staged` → `npm run lint` (sửa lỗi lint trên toàn bộ `src/`), sau đó `git add .`. Hook này sẽ **stage cả những thay đổi khác trong `source/`**, nên hãy kiểm tra `git status` trước khi commit.
- **commit-msg:** commitlint (conventional commits) đã được cấu hình nhưng đang bị comment.

## Triển khai (GitHub Actions → Docker trên server)

> Tài liệu đầy đủ về cấu trúc file, luồng chạy, rollback và xử lý sự cố: [docs/ci-cd.md](docs/ci-cd.md).

Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) deploy theo **GitHub Environment**:

| Sự kiện | Environment | File env khi build | Container mặc định |
|---|---|---|---|
| Merge / push vào `dev` | `dev` | `source/env/.dev` (đã có trong repo) | `ai-agent-sso-cms-dev` |
| Merge / push vào `main` | `prod` | `source/env/.production` (lấy từ secret `APP_ENV_FILE`) | `ai-agent-sso-cms-prod` |
| Chạy tay **Run workflow** | chọn `dev` hoặc `prod` | như trên | như trên |

Pipeline gồm các job (hiển thị riêng trên tab Actions):

```
Determine Deployment Target ─┬─ Lint ─ Build Docker Image ─┬─ Announce Build Result
Collect Git Commit Metadata ─┴─ Announce Deployment Start  └─ Deploy to Server ─ Announce Deployment Result
```

| Job | Việc làm |
|---|---|
| Determine Deployment Target | Chọn environment (`dev`/`prod`) và phiên bản Node từ `source/.nvmrc` |
| Collect Git Commit Metadata | Lấy SHA và message của commit cho thông báo |
| Announce Deployment Start | Gửi Telegram "bắt đầu build & deploy" |
| Lint | `npm ci` rồi ESLint (chỉ chặn khi có lỗi, không chặn warning) |
| Build Docker Image | Chuẩn bị file env (secret `APP_ENV_FILE` nếu có, không thì file đã commit), build image `<APP_NAME>:<sha>`, lưu thành artifact (giữ 1 ngày) |
| Announce Build Result | Báo build thành công/thất bại |
| Deploy to Server | Kết nối OpenVPN, đẩy image sang server qua SSH (không cần registry), chạy [dev-ops/deploy/remote-deploy.sh](dev-ops/deploy/remote-deploy.sh): thay container, chờ healthcheck, **tự rollback** về image cũ nếu bản mới lỗi, chỉ giữ 3 image gần nhất |
| Announce Deployment Result | Báo deploy/start thành công/thất bại, kèm tên container và port |

Job **Build Docker Image** và **Deploy to Server** đều gắn với environment, nên nếu `prod` bật Required reviewers thì mỗi lần deploy prod sẽ cần duyệt 2 lần (một lần trước build, một lần trước deploy).

Ứng dụng chạy tại `http://<server>:3000`. Trong container, nginx phục vụ bản build ở port 80, được map ra port 3000 của host.

### Nhiều phiên bản Node, nhiều source FE

Server **không cần cài Node hay nvm**. Node chỉ dùng ở bước build, bên trong image `node:<version>-alpine`. Container chạy thật chỉ có nginx. Mỗi source FE tự khai báo:

| Mỗi source FE | Ví dụ cho repo này |
|---|---|
| Phiên bản Node: file `source/.nvmrc` | `18` |
| Tên container: biến `APP_NAME` | `ai-agent-sso-cms-dev`, `ai-agent-sso-cms-prod` |
| Port trên host: biến `APP_PORT` | `3000` |

Muốn thêm một FE khác (ví dụ chạy Node 20, port 3001), chỉ cần copy `Dockerfile`, `.dockerignore`, `dev-ops/docker/`, `dev-ops/deploy/`, `.github/` sang repo đó, rồi đổi `.nvmrc`, `APP_NAME` và `APP_PORT`. Các container chạy độc lập với nhau trên cùng server.

Lệnh hữu ích trên server:

```bash
docker ps --filter label=fe-app                       # các FE đang chạy
docker logs -f ai-agent-sso-cms-dev                    # xem log
docker images ai-agent-sso-cms-dev                     # các bản đã deploy
```

### Cấu hình GitHub

**1. Tạo environments:** Settings → **Environments** → **New environment**, tạo `dev` và `prod`. Với `prod`, nên bật **Required reviewers** (phải có người duyệt mới được deploy) và đặt **Deployment branches** chỉ cho `main`.

**2. Repository secrets** (Settings → Secrets and variables → Actions → Repository secrets), dùng chung cho mọi environment:

| Secret | Giá trị |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token của bot |
| `TELEGRAM_CHAT_ID` | ID group nhận thông báo (có dấu `-` ở đầu) |

**3. Environment secrets** (Settings → Environments → `dev` / `prod` → Environment secrets), mỗi environment một bộ:

| Secret | Giá trị |
|---|---|
| `VPN_OVPN_BASE64` | File `.ovpn` mã hóa base64 trên một dòng: `base64 -w0 client.ovpn` (Linux/Git Bash) hoặc `[Convert]::ToBase64String([IO.File]::ReadAllBytes("client.ovpn"))` (PowerShell) |
| `OVPN_USERNAME`, `OVPN_PASSWORD` | Chỉ cần nếu VPN yêu cầu đăng nhập (`auth-user-pass`) |
| `SSH_HOST` | IP server (dev: `192.168.222.10`) |
| `SSH_USER` | User SSH, ví dụ `root` |
| `SSH_PASSWORD` | Mật khẩu SSH (hoặc dùng `SSH_PRIVATE_KEY`, khuyến nghị) |
| `SSH_PRIVATE_KEY` | Tùy chọn: private key; nếu có sẽ được dùng thay cho mật khẩu |
| `SSH_KNOWN_HOSTS` | Tùy chọn: kết quả `ssh-keyscan <host>`, để kiểm tra host key |
| `APP_ENV_FILE` | **Bắt buộc với `prod`**: toàn bộ nội dung file env production (theo mẫu `dev-ops/env/production.env.example`). Với `dev` thì để trống để dùng `source/env/.dev`. |

**4. Environment variables** (tab Variables của từng environment, đều là tùy chọn):

| Variable | Mặc định |
|---|---|
| `APP_PORT` | `3000` |
| `APP_NAME` | `ai-agent-sso-cms-<env>` |
| `BUILD_ENV` | `dev` với dev, `production` với prod |

Nếu `dev` và `prod` chạy chung một server, đặt `APP_PORT` khác nhau, ví dụ prod dùng `3100`.

> Repo nên để **private**: `source/env/.dev` có chứa thông tin đăng nhập `REACT_APP_*`.

### Chạy Docker ở local

```bash
docker build -t ai-agent-sso-cms .                     # context là thư mục gốc
docker run -d -p 3000:80 --name ai-agent-sso-cms ai-agent-sso-cms
```

`docker-compose.yaml` cũng build từ thư mục gốc. File này dùng network ngoài `devteria-network`, nên cần tạo network đó trước.

### Cách cũ

`dev-ops/Jenkinsfile` (deploy nhánh `dev` bằng pm2 và `appServer.js`) vẫn được giữ lại, nhưng không còn được dùng cho luồng GitHub Actions. `dev-ops/nginx.conf` là cấu hình reverse proxy mẫu cho host.

## Claude Code

Repo có sẵn cấu hình cho Claude Code:

- `CLAUDE.md`: tổng quan kiến trúc
- `.claude/rules/`: quy tắc theo từng vùng code
- `.claude/skills/`: các lệnh `/implement-feature`, `/implement-page`, `/implement-form`, `/api-integration`, `/create-react-component`, `/debug-frontend`, `/write-tests`, `/review-code`, `/optimize-performance`, `/refactor-frontend`
- `.claude/agents/`: `frontend-code-reviewer`, `frontend-test-engineer`
- `.claude/settings.json`: quyền, và hook chạy ESLint sau mỗi lần sửa file
