---
layout: post
project: device-lab
title: "Linux GDB：Core Dump 分析入门"
date: 2026-09-07
categories: Linux GDB
tags: [Linux, GDB, Debug]
---

# Linux GDB：Core Dump 分析入门

Core Dump 是 Linux 程序发生异常崩溃时保存的一份进程现场。

通过 GDB 可以分析：

- 程序为什么崩溃
- 崩溃发生在哪一行
- 当前调用栈
- 当前线程
- 局部变量
- 寄存器
- 内存状态

## 1. 开启 Core Dump

```bash
ulimit -c unlimited
```

查看：

```bash
ulimit -c
```

## 2. 使用 GDB 分析

```bash
gdb ./app core
```

进入 GDB 后：

```gdb
bt
```

查看调用栈。

## 3. 总结

以后可以继续研究：

- GDB 调试
- Core Dump
- 多线程崩溃
- 内存越界
- Segmentation Fault

