import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

// GitHub Pages 部署时由 CI 自动注入 BASE_PATH：
// - 仓库名为 <用户名>.github.io 时，站点 URL 是 https://<用户名>.github.io/，base 为 "/"
// - 其他仓库名时，站点 URL 是 https://<用户名>.github.io/<仓库名>/，base 为 "/<仓库名>/"
// 本地开发默认 "/"，如需本地模拟子路径部署可自行设置该环境变量
const base = process.env.BASE_PATH || "/";

export default defineUserConfig({
  base,

  // GitHub Pages 无 SPA fallback：history 路由下直接访问/刷新子路径会 404，
  // 改用 hash 路由（URL 形如 /#/md/xxx），路由跳转永远命中真实存在的 index.html
  routerMode: "hash",

  lang: "zh-CN",
  title: "caps 的博客",
  description: "Java 后端 / AI Agent 工程 · Spring AI · Google ADK · 技术博客与简历",

  theme,
});
