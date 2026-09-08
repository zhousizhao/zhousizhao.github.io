---
layout: project
name: Audio Pipeline
title: 低延迟音频采集、处理与回放的验证工具
stack: ALSA / Ring Buffer / Realtime
icon: waveform
image: /assets/projects/audio-pipeline.svg
link: https://github.com/zhousizhao?tab=repositories
---

一套用来验证音频链路延迟的小工具：采集、缓冲、处理、回放各阶段独立可测，方便定位"声音为什么慢了"这类问题。

## 为什么做

音频问题最麻烦的是现象和原因之间隔着好几层缓冲。与其每次临时写测试代码，不如把验证手段固化成一个工具。

## 方案取舍

基于 ALSA 直接控制采集和回放参数，环形缓冲连接各阶段，每个缓冲区的进出时间都可记录，延迟花在哪儿一目了然。

## 当前状态

基础链路可用，后续会加入自动化的延迟回归测试。
