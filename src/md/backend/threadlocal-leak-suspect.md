---
title: ThreadLocal 不 remove 会泄漏吗：一次怀疑引发的推演
date: 2021-05-01
icon: search
category:
  - 后端实战
tag:
  - Java
  - JVM
  - 排查复盘
headerDepth: 3
---

> 代码评审时看到一段让我很"方"的代码：`static final ThreadLocal` 持有一个 SAXReader，取用逻辑齐全，唯独没有 `remove()`。长跑在服务器上的服务，这个线程会不会越攒越多？这篇是当时推演的整理。

## 可疑点

```java
private final static ThreadLocal<SAXReader> saxReader = new ThreadLocal<>();

private SAXReader getReader() throws SAXException {
    SAXReader reader = saxReader.get();
    if (null == reader) {
        reader = new SAXReader();
        reader.setXMLReader(reader.getXMLReader());
        saxReader.set(reader);
    }
    return reader;
}
```

线程池里的线程是长命的，`ThreadLocal` 不 remove，value 是不是就一直被这个线程持有？如果每个请求都 new 出新的 reader set 进去，泄漏就近在眼前。

## 推演

先把引用链画清楚：**Thread → ThreadLocalMap → Entry（key 是 ThreadLocal 的弱引用，value 是强引用）**。

- key 是弱引用，GC 后会变 null——这是很多文章说"ThreadLocal 会泄漏"的由来；
- 但真正决定 value 能不能回收的，是**value 的强引用链还在不在**；
- 关键在于这段代码的用法：`get()` 时**只有为 null 才 set**——即每个线程全程只 set **一次**，之后一直复用同一个 reader。value 的引用是稳定的"每线程一个"，不是"每请求一个"。

结论：**这不是泄漏，是复用**。SAXReader 这种构建成本高的解析器，按线程缓存是合理的池化手法。真正会泄漏的形态是"每个请求 set 一个新对象、用完不 remove"——那样 value 会随请求线性累积。

## 验证手段（当时的计划）

怀疑不能靠嘴消——计划抓一次堆转储（heap dump）用 MAT 分析：

1. 按 DOMinator Tree 看 `ThreadLocal$ThreadLocalMap$Entry` 的数量与持有的 value 大小；
2. 确认 entry 数 ≈ 线程数（而不是 ≈ 请求数），即证清白。

## 复盘

- "ThreadLocal 用完要 remove"是重要但不完整的口诀——**先分清 value 的引用是随请求增长还是稳定复用**；
- 怀疑内存问题时，堆转储 + MAT 是唯一能"宣判"的工具，推理只是立案。
