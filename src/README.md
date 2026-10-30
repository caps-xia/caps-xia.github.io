---
home: true
icon: home
title: 主页
heroImage: /logo.svg
bgImage: https://theme-hope-assets.vuejs.press/bg/6-light.svg
bgImageDark: https://theme-hope-assets.vuejs.press/bg/6-dark.svg
bgImageStyle:
  background-attachment: fixed
heroText: caps
tagline: Java 后端 / AI Agent 工程 · Spring AI · Google ADK · google/adk-java contributor
actions:
  - text: 个人简历 👣
    link: ./md/resume.html
    type: primary

  - text: 技术文章 📖
    link: ./md/vibe-coding-comet-mvp.html

  - text: GitHub 💐
    link: https://github.com/caps-xia

highlights:
  - header: 上游贡献 · google/adk-java
    description: 从生产环境的深度使用出发，向上游提交问题与修复——5 个 issue、2 个 PR，修复已随 v1.12.0 正式发版
    features:
      - title: 工具 schema 转换丢失 enum/items
        icon: puzzle-piece
        details: 枚举参数退化为自由文本。最小复现 + 双版本实测，24h 被官方认领；修复 PR 经两轮 review 合并，随 v1.12.0 发版。
        link: https://github.com/google/adk-java/issues/1609

      - title: 流式回复标点启发式误判
        icon: language
        details: 中文回复以。！？结尾被判为未完成，永不落会话。官方采纳本人方案修复落地，本人以生产复现验证后关闭。
        link: https://github.com/google/adk-java/issues/1608

      - title: reasoning_content 被静默丢弃
        icon: lightbulb
        details: 反编译实证官方桥对思考内容零引用。提交 Feature Request 与设计方案，团队评审中。
        link: https://github.com/google/adk-java/issues/1616

      - title: 客户端断开不取消模型流
        icon: plug-circle-xmark
        details: 断开后模型后台空烧 token 且无取消 API。获社区独立确认与修复 PR；本人完成生产环境验证并被引用至评审材料。
        link: https://github.com/google/adk-java/issues/1618

copyright: false
footer: |-
  <div class="content">© 2026 caps (caps-xia) · Built with VuePress</div>
---

## 技术文章

- **AI 工程**（[系列目录](./md/ai-engineering/index.html)）
  - [我在 google/adk-java 的十天：从生产事故到 v1.12.0 发版](./md/ai-engineering/adk-java-contribution-story.html)
  - [思考模型的复读陷阱：三层守护算法的设计与实现](./md/ai-engineering/reasoning-loop-guards.html)
  - [用户关了页面，模型还在烧钱：流式取消的完整方案](./md/ai-engineering/stream-cancellation.html)
  - [需求工作流 Native vs Classic 全对比](./md/ai-engineering/ai-workflow-native-vs-classic.html) · [Vibe Coding 跑通 MVP 实战](./md/ai-engineering/vibe-coding-comet-mvp.html)
- **后端实战**（[系列目录](./md/backend/index.html)）
  - 数据库死锁排查 · Kafka 消费积压治理 · Druid 线程泄漏 · ThreadLocal 推演 · 慢 SQL 优化 · 数据割接方法论
- **JVM 与性能优化**（[系列目录](./md/jvm/index.html)）

## 关于我

7 年 Java 后端研发，当前聚焦 **AI Agent 工程化**：基于 Spring AI + Google ADK 的企业级智能体工作台设计与生产落地——多智能体编排、流式工程、上下文治理、工具调用治理。

最近在做的事：把生产中反复踩到的流式/网关问题反哺给 [google/adk-java](https://github.com/google/adk-java) 上游（见上方贡献墙，修复已随 [v1.12.0](https://github.com/google/adk-java/releases/tag/v1.12.0) 发版），并把通用解法沉淀为开源工具库。

::: tip 本站导航

- [个人简历](./md/resume.html) · [后端实战系列](./md/backend/index.html) · [JVM 系列](./md/jvm/index.html) · [AI 工程系列](./md/ai-engineering/index.html)
- 上游 issue/PR 均可点击验证

:::
