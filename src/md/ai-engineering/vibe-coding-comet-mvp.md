---
title: Vibe Coding 初体验：用 Comet 跑通 MVP 的工程实战与避坑指南
date: 2026-07-23
icon: pen-nib
category:
  - AI 工程
tag:
  - Vibe Coding
  - AI 工作流
headerDepth: 3
---

> 原文发表于[掘金](https://juejin.cn/post/7665539523289202688)，此处为个人存档。



> **前言**  
> 本文基于 Comet 官方文档与真实项目踩坑记录整理而成，旨在为 AI Coding 新人提供一份可复制的工程化实践指南。  
> **适用对象**：具备基本命令行操作能力的开发者。

---

### 目录

0. 是什么：三层职责模型
1. 安装与初始化
2. 五阶段流水线详解
3. 核心机制
4. 常见坑与处理方案
5. Q&A 速查
6. 实战时间线参考

---

### 1. 是什么：三层职责模型

Comet 不是第三套 AI 编程框架。把它想成一层**状态机**——它不写代码，但负责把 OpenSpec 的规格生命周期和 Superpowers 的执行纪律串成一条可恢复的自动化流水线。

| 层 | 负责什么 | 常见产物 |
| --- | --- | --- |
| **OpenSpec** | 做什么、为什么做、规格怎么归档 | `proposal.md`、`design.md`、`tasks.md`、`specs/` |
| **Superpowers** | 怎么设计、怎么计划、怎么 TDD、怎么审查 | Design Doc、Plan、测试、review、finish |
| **Comet** | 当前走到哪一步、谁接手、什么时候能推进 | `/comet`、`.comet.yaml`、guard、handoff、archive |

> OpenSpec 处理 WHAT。Superpowers 处理 HOW。Comet 将二者串联为五阶段自动化流水线。

#### Comet 解决的核心问题

* 让 AI 在复杂需求里**少靠记忆，多靠状态**
* **少靠提醒，多靠闸门**
* **少靠聊天记录，多靠可归档的工程证据**

---

### 2. 安装与初始化

#### 2.1 环境要求

```
Node.js 20+
npm/npx
Git
（v0.4.0+ 用 .mjs 脚本，不再强依赖 bash）
​
### 2.2 安装命令
​
```bash
# 查看当前版本
npm view @rpamis/comet version
​
# 全局安装
npm install -g @rpamis/comet
​
# 进入项目，初始化
cd your-project
comet init
```

#### 2.3 `comet init` 交互步骤

| 步骤 | 选择项 |
| --- | --- |
| 1. 选择 AI 平台 | Claude Code / Cursor / Codex / Copilot / Windsurf / Cline 等 33 个平台 |
| 2. 安装范围 | 项目级（Project）或全局（Global） |
| 3. Skill 语言 | 中文 / English |
| 4. 已有 skill 处理 | Overwrite（推荐覆盖，确保版本一致） |

#### 2.4 安装后必做：诊断

```
comet doctor    # 诊断三组 skill 是否被 Agent 宿主正确读取
comet status    # 查看当前状态
```

> 核心确认：当前项目里 Comet / OpenSpec / Superpowers 这三组 skill 是否都能被你的 Agent 宿主读取。不同平台的 skill 目录不一样（`.claude/`、`.cursor/`、`.codebuddy/` 等），项目级和全局安装也不一样。

#### 2.5 目录结构（分阶段创建）

`comet init` 只创建框架，具体产物由各阶段运行时生成。

**init 创建（框架 + 脚本）：**

```
your-project/
  .comet/
    config.yaml                    ← init 创建
  openspec/
    config.yaml                    ← init 创建
    changes/                       ← init 创建（空目录）
  docs/
    superpowers/
      specs/                       ← init 创建（空目录）
      plans/                       ← init 创建（空目录）
      reports/                     ← init 创建（空目录，部分版本选配）
  .claude/skills/                  ← init 创建（具体目录取决于平台）
    comet/scripts/
      comet-guard.mjs              ← 阶段守护
      comet-handoff.mjs            ← 上下文交接
      comet-archive.mjs            ← 归档闭环
      comet-state.mjs              ← 状态管理
      comet-yaml-validate.mjs      ← 配置校验
```

**第一次 `/comet`（即 `/comet-open`）运行时创建：**

```
openspec/changes/<change-name>/
  .openspec.yaml                   ← /comet-open 创建
  .comet.yaml                      ← /comet-open 创建（核心状态文件）
  proposal.md                      ← /comet-open 生成
  design.md                        ← /comet-open 生成
  tasks.md                         ← /comet-open 生成
  specs/<capability>/spec.md       ← /comet-open 生成
```

**后续阶段运行时创建：**

```
docs/superpowers/specs/<date>-<name>-design.md    ← /comet-design 生成
docs/superpowers/plans/<date>-<name>.md           ← /comet-build 生成
docs/superpowers/reports/<date>-<name>-verify.md  ← /comet-verify 生成
```

---

### 3. 五阶段流水线详解

#### 心智模型

```
open → design → build → verify → archive
  ↑       ↑       ↑        ↑        ↑
  guard   guard   guard    guard    guard
  校验    校验    校验     校验     校验
```

* `.comet.yaml` 是**唯一状态源**，记录 phase、verify\_result、各决策字段
* 每阶段之间靠 `comet-guard` 脚本校验产物，全过才放行
* 关键决策点必须人确认，Agent 不能自动选

#### 阶段依赖关系

五个阶段是**强顺序依赖**——前一个不完成，后一个进不去：

```
open ──guard──▶ design ──guard──▶ build ──guard──▶ verify ──guard──▶ archive
  │               │                 │                │                  │
  ▼               ▼                 ▼                ▼                  ▼
proposal.md    design doc        plan + 代码      验证报告          delta spec
design.md      (superpowers)     源码 + 测试      (superpowers)     合并归档
tasks.md
spec.md
```

##### 阶段间如何衔接：逐段桥接机制

| 阶段衔接 | 桥接方式 | 具体做了什么 | 谁干的 |
| --- | --- | --- | --- |
| open → design | `comet-handoff <name> design --write` | 读取 openspec 层的 proposal.md / design.md / spec.md，打包成 Superpowers 能理解的**设计上下文**（handoff\_context），写入 `.comet/handoff/design-context.json`。Agent 配合 brainstorming 技能逐轮澄清。 | comet-handoff 脚本 + brainstorming 技能 |
| design → build | `comet-handoff <name> build --write` | 读取 design doc（Superpowers 层），生成代码执行上下文。Agent 加载 writing-plans 技能，把 D1-Dn 决策翻译成 TDD 执行计划（plan）。可选 `context_compression: beta` 压缩上下文。 | comet-handoff 脚本 + writing-plans 技能 |
| build → verify | `comet-guard <name> build --apply` | 检查 tasks.md 全勾 + plan 全勾 + 测试全绿。通过后更新 `.comet.yaml` 的 `phase=verify`。Agent 加载 verification-before-completion / openspec-verify-change 技能。 | comet-guard 脚本 |
| verify → archive | `comet-guard <name> verify --apply` | 检查 verification\_report 存在 + branch\_status 已处理 + 规格合规。通过后更新 `phase=archive`。Agent 加载 comet-archive 技能，执行 delta spec 合并、移动 change 目录。 | comet-guard 脚本 + comet-archive 脚本 |

##### 产物分层与移交关系

```
OpenSpec 层（管 WHAT）              Superpowers 层（管 HOW）
─────────────────────              ───────────────────────
openspec/changes/<name>/           docs/superpowers/
  ├─ proposal.md                     ├─ specs/<date>-<name>-design.md
  ├─ design.md         comet-handoff ├─ plans/<date>-<name>.md
  ├─ tasks.md         ═══════════════▶├─ reports/<date>-<name>-verify.md
  └─ specs/<capability>/spec.md
```

关键理解：`comet-handoff` 是两层的**唯一桥接点**。OpenSpec 层的 design.md 写的是"概要技术决策"，Superpowers 层的 design doc 才是 Agent 在 build 阶段真正执行的"深度设计文档"。handoff 脚本负责把前者转译成后者，而不是简单复制。

| 阶段 | 前置依赖 | 依赖的具体产物 | guard 不通过会怎样 |
| --- | --- | --- | --- |
| open | 无 | 无（起点） | — |
| design | open 通过 | proposal.md + design.md + tasks.md + spec.md | guard 拦住，退回 open 补 |
| build | design 通过 | design doc（Superpowers 层）+ handoff 上下文已写入 | guard 拦住，退回 design 补 |
| verify | build 通过 | plan 全勾 + 测试全绿 + tasks.md 全勾 | guard 拦住，退回 build 修 |
| archive | verify 通过 | 验证报告存在 + branch\_status 已处理 | guard 拦住，退回 verify 修 |

> 回退是允许的（`comet-state transition`），但不能跳阶段——脚本硬拦。

#### 3.1 阶段 1：Open（/comet-open）— 搞清楚做什么

**入口：**

```
/comet 开发敏感数据接触留痕组件。
用户投诉号码泄露，怀疑在我方平台泄露。
排查后发现我方无异常操作，但全过程耗时过长、缺乏实时预警。
需求：后台业务人员接触到用户手机号等明文敏感数据时，
自动记录操作人、时间、数据标识及业务上下文；
记录不能阻塞正常业务流程；
记录数据不可篡改，支持事后审计与异常预警；
不改现有业务流程、权限模型、接口协议。
```

**产物：**

**proposal.md** — 定义范围（WHAT）：

| 真实标题 | 内容 |
| --- | --- |
| `## Why` | 什么场景驱动、要解决什么问题 |
| `## What Changes` | 具体改什么（底部以 `**非目标**` 标注 Non-Goals，明确不改什么） |
| `## Capabilities` | `New Capabilities` / `Modified Capabilities`（所影响的能力域） |
| `## Impact` | 影响面：新增模块、复用组件、数据库变更、配置项、接入方 |

**design.md** — 技术决策（HOW）：

| 真实标题 | 内容 |
| --- | --- |
| `## Context` | 背景、现有组件情况、技术约束 |
| `## Goals / Non-Goals` | 本变更的目标与非目标 |
| `## Decisions` | **D1~D10 编号的关键技术决策**（MUST/FORBIDDEN 嵌在决策描述中） |
| `## Risks / Trade-offs` | 风险点 + 缓解措施 |
| `## Migration Plan` | 接入方式、回滚方式、DDL 归属 |
| `## Open Questions` | 待澄清，OQ1/OQ2… 编号，已定的标"（已定）" |

**tasks.md** — 任务拆分（实现清单）：

| 真实结构 | 内容 |
| --- | --- |
| `# Tasks — <change-name>` | 总标题 |
| `## N. 标题`（计件分组） | 内部为 `- [x]` 复选框任务条目 |
| 末尾 `### 代码审查记录` | review 结果附在此处 |

**specs//spec.md** — 规格（验收标准）：

| 真实标题 | 内容 |
| --- | --- |
| `## ADDED Requirements` | 新增规格域 |
| `### Requirement: XXX` | 需求描述（MUST/MUST NOT） |
| `#### Scenario: XXX` | WHEN/THEN 场景（**并发、异常路径必须覆盖**） |

---

#### 3.2 阶段 2：Design（/comet-design）— 搞清楚怎么做

**脚本：**

```
comet-handoff <name> design --write    # 生成上下文交接（禁止手写摘要）
```

**过程：**

```
handoff → brainstorming 逐轮澄清、方案迭代 → 你确认方案 → 写 design doc → guard design→build
```

**产物：**

`docs/superpowers/specs/<date>-<name>-design.md`（`.comet.yaml` 的 `design_doc` 字段指向它）

同时更新 `openspec/changes/<name>/design.md`，追加 Context / Goals+Non-Goals / 编号决策 / Risks / Migration Plan / Open Questions。

> 注意：实际的 D1-Dn 编号决策本身就是硬约束载体，每一条决策里包含 MUST / FORBIDDEN 级别的约束，不需要额外写一坨独立的 MUST 清单。

---

#### 3.3 阶段 3：Build（/comet-build）— 写代码

**决策点（build 开始前必须人确认）：**

| 决策项 | 选项 | 建议 |
| --- | --- | --- |
| `isolation` | current / branch / worktree | 推荐 branch |
| `build_mode` | executing-plans / subagent-driven-development | 首次试点选 executing-plans |
| `tdd_mode` | TDD / direct | 复杂业务优先 TDD |
| `review_mode` | 按 task 审查 / 全部写完审查 | 按 task 更安全 |

**产物：**

`docs/superpowers/plans/<date>-<name>.md`（TDD 逐步执行稿）

**执行节奏：**

```
对每个 task：
  写失败测试 → 实现 → commit → tasks.md 打勾
全部 task 完成 → guard build→verify 校验：
  tasks 全勾 + plan 全勾 + 测试全通过
```

**关于 per-task commit：**

plan 的每个 task 都有 commit 步骤，guard 会检查这些步骤是否打勾。如果用了 bulk commit（一次提交多个 task），需要在 plan 里补勾。

---

#### 3.4 阶段 4：Verify（/comet-verify）— 验证

**产物：**

`docs/superpowers/reports/<date>-<name>-verify.md`（`.comet.yaml` 的 `verification_report` 字段指向它）

**脚本：**

```
comet-state scale          # 判定 light/full（根据文件数和任务数）
comet-state check          # 运行验证检查
```

**scale 判定：** 31 任务 + 49 文件以上 → full 模式；以下 → light 模式

**四大检查项：**

| 检查 | 回答的问题 |
| --- | --- |
| 目标测试 | 当前 task 对应行为是否跑通 |
| 全量测试 | 是否破坏已有功能 |
| 规格合规检查 | 是否满足 Scenario、Non-Goals、MUST/MUST NOT |
| OpenSpec verify | change 工件和规格生命周期是否一致 |

**验证失败处理：**

* CRITICAL 级别：必须修，连续 3 次后强制人介入
* 非 CRITICAL：人可选择接受偏差或回 build 重修

**分支处理：** 合并 / PR / 保留 / 丢弃（人决策）

---

#### 3.5 阶段 5：Archive（/comet-archive）— 归档

**脚本：**

```
comet-archive                        # 执行归档
comet-archive --dry-run              # 预览，不实际执行
```

**Archive Gate 清单：**

```
- tasks.md 全部完成
- Design Doc 和 plan 已关联
- 目标测试通过
- 全量测试通过，或明确说明无法运行的原因
- Scenario 与测试映射完成
- Non-Goals 没有被违反
- MUST / MUST NOT 没有被违反
- verification_report 存在
- branch_status 已处理
- /comet-verify 已通过
```

**归档动作：**

0. 按 delta 语义合并主 spec
1. 给 design doc / plan 打归档元数据
2. 把 change 从 `openspec/changes/<name>/` 移到 `openspec/changes/archive/<date>-<name>/`

**归档后保护：** `archived: true` 的 change 阻止继续修改。

---

### 4. 核心机制

#### 4.1 状态管理

`.comet.yaml` 是唯一状态源。以当前 archive 阶段为例：

```
# ── 工作流身份 ──
workflow: full                          # 工作流类型：full / hotfix / tweak
language: zh-CN                         # 技能语言

# ── 当前阶段 ──
phase: archive                          # 当前所处阶段：open → design → build → verify → archive
auto_transition: true                   # 阶段间自动交接（guard 通过后自动推进）

# ── build 阶段决策（build 开始时人确认的四选） ──
build_mode: executing-plans             # 构建模式：executing-plans / subagent-driven-development
tdd_mode: tdd                           # TDD 模式：tdd / direct
review_mode: standard                   # 审查模式：standard（按 task 审查）
isolation: branch                       # 隔离方式：branch / current / worktree
build_pause: null                       # 暂停点：null（无暂停）/ plan-ready（plan 完成后暂停等人确认）
subagent_dispatch: null                 # subagent 调度状态

# ── verify 阶段结果 ──
verify_mode: full                       # 验证模式：full / light（超过阈值自动 full）
verify_result: pass                     # 验证结果：pending / pass / fail
verification_report: docs/superpowers/reports/2026-07-23-xxx-verify.md  # 验证报告路径
verify_failures: 0                      # 验证失败次数（连续 3 次强制人介入）

# ── 分支状态 ──
branch_status: handled                  # 分支处理状态：pending / handled
bound_branch: null                      # 绑定的 git 分支
base_ref: c41b7b6...                    # git base commit

# ── 产物引用 ──
design_doc: docs/superpowers/specs/2026-07-17-xxx-design.md  # design 阶段的深度设计文档
plan: docs/superpowers/plans/2026-07-17-xxx.md               # build 阶段的 TDD 执行计划

# ── 上下文交接（OpenSpec → Superpowers 桥接） ──
context_compression: off                # 上下文压缩：off / beta（压缩可省 25-30% token）
handoff_context: openspec/changes/<name>/.comet/handoff/design-context.json  # 交接数据
handoff_hash: f5f57e84...              # 交接数据 SHA256（完整性校验）

# ── 归档 ──
archived: false                         # 是否已归档（true 后锁死，禁止修改）
archive_confirmation: null              # 归档确认状态
direct_override: null                   # 直接覆盖标记
created_at: 2026-07-15                  # change 创建日期
verified_at: 2026-07-23                 # 验证通过日期

# ── 运行实例 ──
run_id: 211932db-...                    # 当前运行实例 ID
classic_profile: full                   # profile 类型
classic_migration: 1                    # 迁移版本号
```

**状态写入规则：**

* 正常推进：`comet-guard <name> <phase> --apply`
* 失败回退：`comet-state transition`
* 禁止：`comet-state set phase` 手动跳阶段（脚本硬拦）

#### 4.2 Guard（阶段闸门）校验范围

**Guard 是什么？**

Guard（闸门/守护脚本）= 每个阶段出口的自动检查关卡。类比机场安检——不管你觉得自己多清白，安检机不响才能过。但安检机只查金属（语法），不查你的登机牌目的地对不对（语义）。

具体来说，Guard 脚本（`comet-guard.mjs`）在每个阶段结束时运行，检查当前阶段的产物是否齐全、是否达标：

```
阶段完成 → 人确认 → comet-guard <name> <phase> --apply
                        │
                        ├─ 检查产物存在？任务全勾？测试全绿？
                        │   全过 → 更新 .comet.yaml phase → 自动告知下一步技能
                        │
                        └─ 任一不通过 → [HARD STOP] 报缺少什么，退回当前阶段
```

**Guard 检查什么、不检查什么：**

| guard 检查 | 不检查 |
| --- | --- |
| 产物文件是否存在 | 产物文字是否与代码一致 |
| 任务是否全部打勾 | 实现方案是否最优 |
| 测试是否通过 | 代码风格是否符合规范 |
| 验证报告是否存在 | 验证结果是否完整覆盖所有场景 |

> 关键限制：Guard 是**语法检查**（文件存在、字段非空），不是**语义检查**（design.md 说的跟代码做的是不是同一件事）。语义一致性目前靠人。

#### 4.3 断点恢复

**原理：**

* 每次阶段切换，状态写入 `.comet.yaml`
* 下次会话输入 `/comet`，读取 `.comet.yaml` 判断当前 phase
* 不是靠聊天记录猜，而是精确读状态文件

**示例：**

```
.comet.yaml: phase=build, build_pause=plan-ready
← 下次 /comet 直接进 build 阶段，从 plan 未完成 task 继续
```

#### 4.4 上下文压缩（v0.4.0+ Beta）

`.comet.yaml` 中启用：

```
context_compression: beta
```

design → build 交接时，仅保留 Design Doc + SHA256 hash，token 降低 25-30%。

#### 4.5 产物三层分离

| 层 | 目录 | 内容 |
| --- | --- | --- |
| 流程产物 | `openspec/changes/<name>/` | proposal / design / tasks / spec |
| 工程产物 | `docs/superpowers/` | design doc / plan / report |
| 源码 | 项目源码目录 | 代码 + 测试 |

---

### 5. 常见坑与处理方案

#### 坑 1：Build 中途 Pivot 到新方向

**症状：** build 到一半发现方案 A 不行，切到方案 C，但 proposal / design.md / design doc 还停在方案 A。

**根因：** guard 不检查产物与代码的语义一致性。

**处理方案：**

```
1. 手动把 .comet.yaml 的 phase 拉回 design
   （或使用 comet-state transition 回退）

2. 更新三份文档：
   proposal.md   → 补充新方向的 Why、Scope、Non-Goals
   design.md     → 重写技术方案、MUST/MUST NOT
   design doc    → 同步修改

3. 重新走交接：
   /comet-design
   /comet-build

4. 如果 build 代码已经写了不少，plan 里加 banner 说明 pivot 历史
```

**预防措施：** design 阶段多花时间做方案对比，把 MUST / FORBIDDEN 写死，减少 build 阶段才发现方向错误。

---

#### 坑 2：Bulk Commit 导致 plan 步骤没打勾

**症状：** build 代码写完了，测试全绿，但 guard build→verify 报错——plan 里 per-task commit 步骤没打勾。

**根因：** 用了一次 bulk commit（如 `154e022`）提交了多个 task 的代码，plan 里每个 task 的 commit 步骤没有逐个标记完成。

**处理方案：**

```
1. 打开 plan 文件
2. 对照 git log，逐个 task 补勾 commit 步骤
3. git commit plan 文件本身（如 a578f2a）
4. 重新跑 guard
```

**预防措施：** 严格按 TDD 节奏逐 task 提交，每个 task 完成立刻 commit + plan 打勾。

---

#### 坑 3：归档时发现跨仓接入没完

**症状：** verify 全过了，走到 archive，但下游服务还没接入，不敢归档。

**根因：** 归档 = spec 变成"系统事实"，后续 AI 会把它当真相。下游没接完就归档，spec 与实际系统不一致。

**处理方案：**

```
选择「暂不归档」→ change 留在 openspec/changes/<name>/ 
→ 等下游接入完成 → 重新验证 → 归档
```

**注意：** 脚本没跑时 change 留在原处，不丢数据。

---

#### 坑 4：上下文满了怎么办

**症状：** 会话进行到一半，Agent 开始遗忘前面的细节。

**处理方案：**

```
1. 确认当前 phase → cat .comet.yaml | grep phase

2. 如果在 build：
   → 当前 task 做完
   → 确认 .comet.yaml 更新了 build_pause
   → 结束会话
   → 新会话 /comet → 自动从断点恢复

3. 如果在 design：
   → 确保 design doc 已写入文件
   → 启用 context_compression: beta
   → 交接完再进 build

4. 通用原则：
   → 任何阶段结束立刻让 guard 更新 .comet.yaml
   → 不要在一个会话跨两个阶段
```

**预防措施：**

* 利用五阶段天然分段，一次会话只做一个阶段
* design→build 交接时开启 context\_compression
* build 阶段开启 build\_pause，每个 task 都是可恢复点

---

#### 坑 5：归档后又需要修改

**症状：** 归档后 `archived: true` 锁死，发现需要改。

**处理方案：**

| 改动量 | 方案 |
| --- | --- |
| 单文件、不改架构 | `/comet-hotfix 描述改动` |
| 跨模块、改设计 | 开新 change，proposal 引用旧归档 change 作为背景 |

**新 change 的 proposal 写法：**

```
## Why
add-sensitive-data-access-audit（已归档）只记录了后台查看场景的敏感数据接触，
但合作方通过 API 拉取数据时同样需要纳入审计范围。

## What Changes
- 审计 SPI 增加合作方调用拦截点
- 留痕记录增加 caller_type 字段区分后台人员与合作方
- 不改变现有 SPI 接口签名
```

> 旧归档 change 此时不是限制，而是知识资产。

---

#### 坑 6：Proposal 没写 Non-Goals

**症状：** build 阶段 Agent 顺手重构了订单查询模块，因为你没说"不改这个"。

**预防措施：**

* proposal.md 的 Non-Goals 是必填项
* 用否定句写死边界：不改业务流程、不改权限模型、不改接口协议
* 写完了自己读一遍：Agent 看了这个，还有没有空间"自由发挥"？

---

#### 坑 7：Design 阶段用"尽量""建议"代替 MUST

**症状：** verify 阶段发现代码在当前请求线程里同步写留痕日志，导致接口超时，但 design 里只写了"建议异步记录"。

**根因：** "建议"不是约束，Agent 不受限。

**正确写法：**

```
- Audit write MUST be asynchronous and non-blocking.
- Synchronous audit write in the request thread is FORBIDDEN.
- In-memory audit buffer without persistence is FORBIDDEN.
```

**预防措施：** design.md 全部用 MUST / MUST NOT / FORBIDDEN，不用"尽量""建议""优化"。

---

#### 坑 8：Verify 失败后硬归档

**症状：** 测试没跑完或规格合规没过，仍然推进 archive。

**后果：** 错误规格一旦归档，后续所有 AI 把它当"项目真相"。

**处理方案：**

```
Verify 失败 → 让 Agent 回答：
  - 失败的是测试、规格合规、OpenSpec verify，还是分支收尾？
  - 失败对应哪个 Scenario？
  - 需要回 build 修，还是接受规格偏差？
  - 如果接受偏差，spec 是否要同步修改？
```

**预防措施：** Archive Gate 清单逐条打勾，少一条都不归档。

---

#### 坑 9：多个 Active Change 混在一起

**症状：** 项目里同时有 3 个 change，Agent 不知道该处理哪个。

**正确处理：**

```
当前有多个 OpenSpec change：
1. add-sensitive-data-access-audit
2. add-cooperation-audit-extension
3. refactor-order-query-api

请选择要继续哪个。
```

**预防措施：** 一次只开一个 active change。完成→归档后再开下一个。

---

#### 坑 10：.mjs 和 .sh 脚本版本混用

**症状：** guard/handoff 脚本执行报错，项目中同时存在 .sh 和 .mjs 版本。

**根因：** 装了 v0.3.x（.sh 主版本）又部分升级到 v0.4.0 beta（.mjs），两个版本混在一起。

**处理方案：**

```
comet update    # 统一到最新版本
comet doctor    # 确认三组 skill 都能正常读取
```

---

### 6. Q&A 速查

#### Q1：Comet 和直接手写 skill 有什么区别？

手写 skill 靠 Agent "记得做"，Comet 把"记得做"变成**状态机 + 脚本检查**。状态写入文件（`.comet.yaml`），恢复时不靠聊天记录猜，而是精确读文件。

适应场景：个人试点写 skill 没问题，团队长期使用选 Comet。

---

#### Q2：记忆是怎么做的？中间断了怎么恢复？

核心是 `.comet.yaml` 状态文件。每次阶段切换，guard 脚本更新 `phase` 字段。下次 `/comet` 读取 phase，判断该从哪继续。

不是靠聊天记录——是靠 yaml 文件精确判断。

---

#### Q3：guard / handoff / archive 脚本怎么生成的？

不是手写的。Comet npm 包内置编译好的 `.mjs` 文件，`comet init` 把它们复制到你项目的 skills 目录。你不需要创建、不需要修改。

---

#### Q4：什么时候用 full workflow，什么时候用 hotfix/tweak？

| 场景 | 入口 |
| --- | --- |
| 跨模块需求、审计/权限/敏感数据处理 | full `/comet` |
| 单点 bug，2-3 文件，不改架构 | `/comet-hotfix` |
| 文案、配置、注释、文档 | `/comet-tweak` |
| 改注释、拼写 | 直接改，不需要 Comet |

hotfix 若膨胀到 3 文件以上 / 涉及 schema / 公共 API，Comet 会自动要求升级 full workflow。

---

#### Q5：归档后又要改怎么办？

小修 → `/comet-hotfix`。大改 → 开新 change，proposal 引用旧归档 change 作为上下文。不要在归档后的 change 上直接改文件。

---

#### Q6：Guard 能检查所有问题吗？

不能。Guard 是**语法检查**（文件存在、字段非空、任务打勾），不是**语义检查**（design.md 写的跟代码做的是不是一回事）。语义一致性目前靠人在 verify 阶段审查。

---

#### Q7：多个项目用同一个 Comet 安装，状态会冲突吗？

不会。`.comet.yaml` 是项目级文件，每个项目有自己独立的 change 目录和状态。全局安装的只是 skill 定义，状态文件始终在项目内。

---

#### Q8：Windows 能用吗？

v0.4.0+ 可以。`.mjs` 版本不再依赖 bash，跨平台用 Node.js 执行。

---

### 7. 实战时间线参考

以下是一次完整的 Comet 实战流程，来自真实项目（hospital-admin-api-web）：

```
更早会话：
  open ✅  → design ✅  → build ✅（写完代码、53 测试绿）
                              │
                              ├─ 坑1：build 中途 pivot 到 Direction C
                              │       但 proposal/design.md/design doc 没跟着改

本会话：
  ① 产物对齐：5 个产物从 Direction A 拉齐到 Direction C
  ② build guard：plan 13 个 per-task Commit 步骤补勾
     → 提交 → guard ALL PASSED → verify
  ③ verify：scale=full → 7 项检查过 → 分支保留 → guard ALL PASSED
  ④ archive：选择「暂不归档」（跨仓接入未完）
```

**三个教训：**

0. **guard 不查产物-代码一致性** → pivot 后要自觉对齐产物
1. **plan 的 per-task commit 是真校验项** → 最好严格按 TDD 逐 task 提交
2. **Comet 是"谨慎优先"** → 每个阶段出口都有 guard + 决策点，慢但有据可查

---

### 附录：新手记住这 5 句就够了

0. Comet 不替代 OpenSpec 和 Superpowers——它是桥接二者的状态机。
1. OpenSpec 管 WHAT，Superpowers 管 HOW，Comet 管阶段、交接、守护和归档。
2. 装完先跑 `comet doctor`，确认 Agent 真能读到三组 skill。
3. 复杂需求从 `/comet <描述>` 开始，别绕过 open 直接手搓 change。
4. Archive 前看一眼验证证据——错误规格一归档，所有 AI 都把它当真相。

---

*首发于[掘金](https://juejin.cn/post/7665539523289202688)*
