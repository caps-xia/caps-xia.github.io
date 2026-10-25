import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/md/resume",
  {
    text: "AI 工程",
    icon: "robot",
    link: "/md/ai-engineering/",
  },
  {
    text: "后端实战",
    icon: "screwdriver-wrench",
    link: "/md/backend/",
  },
  {
    text: "JVM 与性能优化",
    icon: "microchip",
    link: "/md/jvm/",
  },
]);
