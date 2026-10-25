---
title: 一条五表 JOIN 的慢 SQL：1400 万行表上的条件陷阱
date: 2021-04-13
icon: table-list
category:
  - 后端实战
tag:
  - MySQL
  - SQL 优化
  - 排查复盘
headerDepth: 3
---

> 用户中心的定时同步 SQL 跑得越来越慢，贴出来的 SQL 一看：五张百万到千万级的表 LEFT JOIN，WHERE 条件里五个时间范围**用 OR 串着**。这条 SQL 是一个很好的反面教材——不是写错了，是"看起来对"的写法把优化器逼进了死角。

## 场景

定时任务按天增量同步用户数据：找出过去一天内"任何一张相关表"有变更的用户，涉及五张表：

```text
uc_user          14,513,638 行（一千四百万）
uc_user_ext      10,199,302 行（一千万）
uc_user_signature / avatar / nickname 若干万级
```

原 SQL 的骨架：

```sql
SELECT u.user_id, u.mobile_phone, ...
FROM uc_user u
LEFT JOIN uc_user_ext e       ON u.user_id = e.user_id
LEFT JOIN uc_user_signature s ON u.user_id = s.user_id
LEFT JOIN uc_user_avatar a    ON u.user_id = a.user_id AND a.avatar_size = 'small'
LEFT JOIN uc_user_nickname n  ON u.user_id = n.user_id
WHERE u.gmt_modified >= '...' AND u.gmt_modified < '...'
   OR e.gmt_modified >= '...' AND e.gmt_modified < '...'
   OR s.gmt_modified >= '...' AND s.gmt_modified < '...'
   OR a.gmt_modified >= '...' AND a.gmt_modified < '...'
   OR n.gmt_modified >= '...' AND n.gmt_modified < '...';
```

## 为什么慢

两个叠加的陷阱：

1. **OR 打碎了索引路径**：五个时间条件用 OR 连接，意味着"任一表命中即入选"。优化器无法选定单一驱动表的索引范围扫描，只能退化为接近全表扫描 + JOIN 缓冲的执行计划；
2. **LEFT JOIN 的语义放大**：即使主表只有少量变更，LEFT JOIN 仍要为每个候选行去探其余四张表——行数在 JOIN 过程中被逐层放大。

## 修复思路

把"五表 OR"改写为**五次单表索引扫描 + UNION 去重**：

```sql
SELECT DISTINCT user_id FROM (
    SELECT user_id FROM uc_user          WHERE gmt_modified >= ... AND gmt_modified < ...
    UNION
    SELECT user_id FROM uc_user_ext      WHERE gmt_modified >= ... AND gmt_modified < ...
    UNION
    SELECT user_id FROM uc_user_signature WHERE gmt_modified >= ... AND gmt_modified < ...
    /* avatar / nickname 同理 */
) t;
```

每个子查询都能走各自 `gmt_modified` 的索引，毫秒级返回；拿到 user_id 集合后再回主表取详情数据（这次五表 JOIN 面的是几百个 id，而不是千万行的候选池）。

**核心转变：从"一条大 SQL 硬算"变成"索引先圈定小集合，再取详情"。**

## 复盘

- `OR` 连接跨表条件是索引杀手——**每一个分支都要能独立走索引**，否则整段退化；
- 大表 JOIN 前，先用索引把候选集缩到最小，JOIN 的行数决定成本；
- `EXPLAIN` 不是仪式：看 type（是否 ALL）、看 key（用了哪个索引）、看 rows（预估扫描量），三眼定案。
