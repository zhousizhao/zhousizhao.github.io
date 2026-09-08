---
title: "CMake 常用指令速查与模块化构建实践"
date: 2026-09-08 16:30:00 +0800
categories: 技术栈扩展
tags: [CMake, 技术栈扩展]
excerpt: "CMAKE学习记录"
---
## CMAKE学习

### 库文件链接与作用域

在 CMake 中，库链接主要针对预编译的动态库（如 `libcjson.so`）或静态库，而不是直接链接源文件。

### 链接作用域关键字

- `PRIVATE`：仅对当前目标自身生效，依赖项不继承。
- `PUBLIC`：当前目标生效，并向依赖当前目标的对象传递。
- `INTERFACE`：当前目标不生效，仅传递给依赖当前目标的对象。

### 核心命令对比与实践

```cmake
# 配置库文件搜索路径（历史遗留用法）
link_directories(
    ${CMAKE_SOURCE_DIR}/lib/glibc/libdrm${CMAKE_SOURCE_DIR}/lib/glibc/libcjson
)

# 现代 CMake 推荐：目标维度精准链接
target_link_libraries(${PROJECT_NAME}
    PRIVATE
        lvgl::drivers # 引入由 add_subdirectory 导入定义的 ALIAS/IMPORTED 目标
        pthread       # 从系统/默认路径查找
        drm
        cjson
)

```

> **注意**：
> * `target_link_libraries` 中在 `PRIVATE` 后列出的所有依赖项都会受到该作用域约束。
> * `pthread`、`drm`、`cjson` 会优先从 CMake 默认系统路径及指定的搜索路径下查找。
> 
> 

| 命令 | 作用类型 | 作用域 | 依赖关系处理 |
| --- | --- | --- | --- |
| `link_directories` | 库文件搜索路径配置 | 全局（当前目录及子目录后续所有目标） | 无依赖处理能力，仅提供全局搜索路径 |
| `target_link_libraries` | 库文件链接（含路径关联） | 目标专属（仅指定的单个或多个目标） | 支持目标依赖传递，自动关联库的编译配置与头文件路径 |

现代 CMake 强烈推荐优先使用 `target_link_libraries`，避免污染全局构建环境。

## 批量收集多个目录下的源文件

### CMake 中的实现方案

当工程目录下包含多层驱动或模块时，可通过 `file(GLOB ...)` 批量收集源文件：

```cmake
set(LV_DRIVERS_DIR_NAME "lv_drivers")

file(GLOB LV_DRIVERS_SRCS
    ${LVGL_DIR}/${LV_DRIVERS_DIR_NAME}/*.c
    ${LVGL_DIR}/${LV_DRIVERS_DIR_NAME}/wayland/*.c
    ${LVGL_DIR}/${LV_DRIVERS_DIR_NAME}/indev/*.c
    ${LVGL_DIR}/${LV_DRIVERS_DIR_NAME}/gtkdrv/*.c
    ${LVGL_DIR}/${LV_DRIVERS_DIR_NAME}/display/*.c
)

# 追加到项目源文件列表（PROJECT_SRCS 为用户自定义变量）
list(APPEND PROJECT_SRCS ${LV_DRIVERS_SRCS})

```

### Makefile (.mk) 片段的对照方案

在部分传统工程（如早期的 `lv_drivers.mk`）中，通常采用 Makefile 片段配合 `wildcard` 通配符展开函数：

```makefile
LV_DRIVERS_DIR_NAME ?= lv_drivers

CSRCS += $(wildcard $(LVGL_DIR)/$(LV_DRIVERS_DIR_NAME)/*.c)
CSRCS += $(wildcard $(LVGL_DIR)/$(LV_DRIVERS_DIR_NAME)/wayland/*.c)
CSRCS += $(wildcard $(LVGL_DIR)/$(LV_DRIVERS_DIR_NAME)/indev/*.c)
CSRCS += $(wildcard $(LVGL_DIR)/$(LV_DRIVERS_DIR_NAME)/gtkdrv/*.c)
CSRCS += $(wildcard $(LVGL_DIR)/$(LV_DRIVERS_DIR_NAME)/display/*.c)

```

> `wildcard` 会查找匹配 `*.c` 后缀的所有文件，并返回对应的完整路径列表（例如 `./third_party/lvgl/lv_drivers/display/lv_display_ili9341.c`）。

## 库探测：find_package

`find_package` 用于在系统或 SDK 中探测指定依赖库，并将其配置导出为 CMake 变量或目标：

```cmake
find_package(SDL2)
find_package(SDL2_image)

include_directories(${SDL2_INCLUDE_DIRS}${SDL2_IMAGE_INCLUDE_DIRS})

```

常见导出变量说明：

| 导出变量 | 作用说明 |
| --- | --- |
| `<PKG>_INCLUDE_DIRS` | 头文件搜索路径（供 `include_directories` 或 `target_include_directories` 使用） |
| `<PKG>_LIBRARIES` | 二进制库文件列表（供 `target_link_libraries` 使用） |
| `<PKG>_FOUND` | 布尔值，用于判断该库是否成功探测到 |
| `<PKG>_VERSION` | 探测到的库版本号 |

## 多模块集成：add_subdirectory

`add_subdirectory` 将子目录的构建逻辑整合到主工程中，实现模块解耦与独立维护。

**主工程 `CMakeLists.txt`：**

```cmake
add_subdirectory(c_interface)

# 必须显式链接子目录生成的静态库，否则主工程无法解析符号
target_link_libraries(${PROJECT_NAME} PRIVATE AIchat-c-interface)

```

**子目录 `c_interface/CMakeLists.txt`：**

```cmake
# 编译 C Wrapper 静态库
add_library(AIchat-c-interface STATIC
    AIchat_c_interface.cc
)

# 链接核心库依赖
target_link_libraries(AIchat-c-interface PRIVATE AIChatCore)

```

主工程执行 `add_subdirectory(c_interface)` 后，CMake 会进入子目录构建 `AIchat-c-interface` 目标。但仅引入子目录并不代表主程序可以直接调用接口，主工程必须显式执行 `target_link_libraries` 链接该目标。

## 交叉编译关键配置：CMAKE_SYSROOT

`CMAKE_SYSROOT` 指定了交叉编译的目标系统根目录（System Root）。它指示编译器与链接器：放弃使用宿主机的头文件与动态库，转而使用指定的嵌入式根文件系统路径寻找目标依赖。

```cmake
# 交叉编译配置示例
set(CMAKE_SYSROOT "${TOOLCHAIN_DIR}/arm-none-linux-gnueabihf/libc")

```
