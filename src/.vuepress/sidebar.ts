import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "AI 工程",
      icon: "robot",
      prefix: "md/ai-engineering/",
      children: [
        "index.md",
        "adk-java-contribution-story.md",
        "reasoning-loop-guards.md",
        "stream-cancellation.md",
        "vibe-coding-comet-mvp.md",
        "ai-workflow-native-vs-classic.md",
      ],
    },
    {
      text: "后端实战",
      icon: "screwdriver-wrench",
      prefix: "md/backend/",
      children: [
        "columbo-ai-troubleshooter.md",
        "deadlock-order-push.md",
        "kafka-consumer-optimization.md",
        "druid-guard-thread-oom.md",
        "threadlocal-leak-suspect.md",
        "slow-sql-multi-join.md",
        "data-migration-thread-count.md",
        "migration-playbook.md",
        "index.md",
      ],
    },
    {
      text: "JVM 与性能优化",
      icon: "microchip",
      prefix: "md/jvm/",
      children: ["jvm-tuning-primer.md", "index.md"],
    },
  ],
});
