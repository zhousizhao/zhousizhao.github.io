---
layout: project
name: Edge Vision
title: 基于 Rockchip NPU 的端侧视觉检测链路
stack: RKNN / YOLO / MIPI
icon: cpu
image: /assets/projects/edge-vision.svg
link: https://github.com/zhousizhao?tab=repositories
---

在资源受限的边缘设备上做视觉检测，难点不在模型能不能跑，而在整条链路能不能稳定地跑：传感器取流、前处理、推理、后处理，任何一段抖动都会直接体现在帧率上。

## 为什么做

云端推理的延迟和带宽成本在很多场景下不可接受。端侧 NPU 的算力已经足够支撑轻量级检测模型，缺的是一条可复用、可观测的工程链路。

## 方案取舍

模型侧选择 YOLO 系列的轻量变体，在精度和推理耗时之间取一个可接受的平衡点；工程侧把取流和推理解耦，前处理尽量下沉到硬件加速路径，避免 CPU 成为瓶颈。

## 当前状态

链路已经可以在目标设备上持续运行，后续会补充量化和多路并发的实验记录。
