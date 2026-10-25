---
title: 个人简历
icon: laptop-code
order: 1
category:
  - 简历
---

# caps

7 年 Java 后端研发 · 求职意向：Java 后端 / AI 应用开发 · 期望城市：苏州

- GitHub：[caps-xia](https://github.com/caps-xia)（google/adk-java contributor，修复已随 v1.12.0 发版）
- 邮箱：caps_xia@163.com
- 技术博客：[caps-xia.github.io](https://caps-xia.github.io/)

## 个人优势

- **AI 工程落地**：从 AI 1.0 时代的代码评审机器人，到大模型时代的自研企业级智能体工作台（Spring AI 2.0 + Google ADK），具备多智能体编排、流式工程、上下文与幻觉治理的完整生产化经验，将线上排查从 15~30 分钟压缩到 3 分钟内；**Google ADK 官方 Java 实现贡献者**（修复已合并并随 v1.12.0 发版）。
- **架构与复用沉淀**：搭建大健康后端通用框架脚手架（Redis/MQ/S3/SSO/OpenAPI 鉴权）+ 策略模板/动态责任链/规则树三套框架，后续新项目开箱即用，并以 ArchUnit 将架构约束固化为守护测试。
- **云迁移与性能治理**：主导大健康平台从集团自建架构整体收敛至腾讯云；瓶颈接口 843ms → 39ms、吞吐 +2276%，活动页慢查询 40s+ → 2s 内。
- **团队影响力**：现任同欣大健康研发序列最高职级 T6（2025.08 晋升），技术委员会成员，带教 T5 转正 + T4 在培；推动组内 AI 编码工程化落地，对外输出系列工程实践文章。

> 详细版简历（含完整工作经历）面试时提供，本页为技术概要版。

## 专业技能

- **AI 应用开发**：Spring AI 2.0、Google ADK、MCP 协议、SSE 流式工程，智能体从设计到生产落地完整经验；Vibe Coding 工程化实践
- **后端框架**：Spring Boot、Spring Cloud、MyBatis-Plus
- **存储与中间件**：MySQL、Redis、RocketMQ
- **架构与治理**：六边形架构（端口-适配器）；策略模板、动态责任链、规则树；ArchUnit 架构守护；压测与慢 SQL 治理
- **上游贡献**：google/adk-java（issue #1608/1609/1616/1618、PR #1617 已合并 / #1620 评审中）、spring-ai（#7105）

## 开源贡献 · google/adk-java & spring-ai

| 类型 | 内容 | 状态 |
|---|---|---|
| Bug + 修复 | 工具 schema 转换静默丢弃 enum/items（[#1609](https://github.com/google/adk-java/issues/1609) → [PR #1617](https://github.com/google/adk-java/pull/1617)） | ✅ 已合并，随 [v1.12.0](https://github.com/google/adk-java/releases/tag/v1.12.0) 发版 |
| Bug + 修复 | 流式回复 ASCII 标点启发式误判，中文回复永不落会话（[#1608](https://github.com/google/adk-java/issues/1608) → [PR #1620](https://github.com/google/adk-java/pull/1620)） | 官方复现确认，评审中 |
| Feature | 官方桥静默丢弃 reasoning_content，反编译实证（[#1616](https://github.com/google/adk-java/issues/1616)） | 团队评审中 |
| Bug | 客户端断开不取消模型流，token 空烧（[#1618](https://github.com/google/adk-java/issues/1618)） | 社区修复 PR 评审中；本人完成生产验证 |
| Bug | 空 toolCall id → NPE（[spring-ai #7105](https://github.com/spring-projects/spring-ai/issues/7105)） | 已有贡献者接手，方案采纳自本报告 |

## 项目经验

### 企业级 AI 智能体工作台（排查智能体） ｜Owner，独立设计研发 2026.01 - 至今

**背景**：客服/运营反馈线上问题后，研发需人工查日志、读代码、核对生产库，单次 15~30 分钟；自研智能体让运营用一句口语描述现象，自动完成排查全链路，输出带证据的结构化根因报告。

**技术栈**：Java 17、Spring Boot 4、Spring AI 2.0、Google ADK、MCP、SSE、MyBatis-Plus、React 19

- 排查全链路：日志双渠道 + 生产库只读通道 + 多环境源码检索，SOP 化提示词驱动"话术路由 → 取日志 → 提线索 → 读源码 → 根因"全自动排查，**单次排查从人工 15~30 分钟降至 3 分钟内**；
- 多智能体工作台：4 个智能体，YAML 声明式定义 + 责任树装配，运行时热切换模型无服务空窗；
- 自研模型桥接层重建流式工具调用循环：双阈值熔断、思维链增量透传、同轮多工具并行执行、错误文案分级治理模型重发循环；
- 上下文治理：压缩摘要结转 → 超限透明翻篇 → 流式安全重试与非流式兜底；token 按会话计量；
- 300+ 单测 + ArchUnit 架构守护，线上真实事故均沉淀为回归测试。

### 大健康业务平台 ｜T6 资深研发 2024.07 - 至今

- 核心专项 PM/TM 交付（数据隔离专项零线上故障）；云原生统一迁移；
- 性能治理：7 个核心接口峰值 1000+ QPS 零错误，瓶颈接口 **843ms → 39ms、吞吐 +2276%**；活动页慢查询 **40s+ → 2s 内**；
- 平台化：后端通用框架 + 策略模板/动态责任链/规则树三套框架；ArchUnit 架构守护。

### 同程用车（聚合打车平台） ｜T5 高级开发 2023.04 - 2024.07

- 主导顺风车/快车双系统合一的 B 端整体重写（新旧双跑、逐步切流）；
- 分销开放平台 0→1：美团、首汽等分销商标准接入。

---
*完整简历与项目细节欢迎邮件交流：caps_xia@163.com*
