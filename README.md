# caps 的个人博客

基于 [VuePress 2](https://v2.vuepress.vuejs.org/zh/) + [vuepress-theme-hope](https://theme-hope.vuejs.press/zh/) 的个人博客 + 简历站点，已适配 GitHub Pages 自动部署。

## 本地开发

```bash
npm install          # 安装依赖
npm run docs:dev     # 启动本地开发服务器 http://localhost:8080
npm run docs:build   # 构建静态站点，输出到 src/.vuepress/dist
```

## 部署到 GitHub Pages

1. 在 GitHub 上创建仓库，两种命名方式任选其一：
   - **用户站点（推荐）**：仓库名为 `<你的用户名>.github.io`，访问地址为 `https://<你的用户名>.github.io/`
   - **项目站点**：任意仓库名（如 `blog`），访问地址为 `https://<你的用户名>.github.io/blog/`
2. 推送代码：

   ```bash
   git remote add origin git@github.com:<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

3. 在仓库的 **Settings → Pages** 中，将 **Source** 设置为 **GitHub Actions**（只需设置一次）。
4. 推送到 `main` 分支会自动触发 `.github/workflows/deploy.yml` 构建并部署；也可在 **Actions** 页面手动触发（`workflow_dispatch`）。

`base` 路径、站点地址（`hostname`）和导航栏的仓库链接均由 CI 根据仓库名**自动识别**，无需手动修改。

## 个性化修改清单

以下位置仍使用占位用户名 `caps`，请按需替换：

- `src/.vuepress/theme.ts` — `author`、`hostname`、`repo`（仅影响本地开发，CI 会自动覆盖 `hostname` 和 `repo`）
- `src/README.md` — 首页 tagline、"我的项目" 链接、页脚版权
- `src/md/resume.md` — 简历中的 Github 链接及个人信息
- `src/.vuepress/navbar.ts`、`src/.vuepress/sidebar.ts` — 导航与侧边栏菜单
- `src/.vuepress/public/logo.svg`、`logo.png` — 站点 Logo

## 目录结构

```
src/                     # 站点源码
├── .vuepress/           # VuePress 配置（config.ts / theme.ts / navbar.ts / sidebar.ts）
├── md/                  # 博客文章（resume.md 简历、dev-log/ 开发日志）
├── README.md            # 首页
└── slides.md            # 幻灯片页
.github/workflows/       # GitHub Pages 自动部署工作流
dev-ops/                 # 自建服务器 nginx 部署（已 gitignore，GitHub Pages 不需要）
```

## 许可

MIT
