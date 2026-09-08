---
layout: project
name: Device Lab
title: 面向设备调试的日志、状态和自动化脚本集合
stack: Linux / Shell / Diagnostics
icon: terminal
image: /assets/projects/device-lab.svg
link: https://github.com/zhousizhao?tab=repositories
---

设备端调试中反复用到的脚本集合：日志采集、服务状态巡检、核心转储分析，把重复劳动沉淀成一条命令。

## 为什么做

现场排查问题的时间很宝贵，"当时那条命令怎么写的"不应该成为瓶颈。把验证过的排查路径脚本化，下次直接跑。

## 方案取舍

全部使用设备上已有的工具链实现，不引入额外依赖；每个脚本只解决一类问题，通过组合覆盖完整排查流程。

## 当前状态

持续积累中，随着新的踩坑记录不断补充。
