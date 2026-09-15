---
title: Python安装与配置
date: 2022-09-08
updated: 2026-09-15
tags: [Python, Engineering]
categories: [Engineering]
language: zh-CN
description: 从解释器、虚拟环境到依赖管理，建立一个可检查、可重建的 Python 开发环境。
---

安装 Python 不只是让终端能输出一个版本号。真正需要确认的是：项目使用哪个解释器，依赖安装在哪里，以及换一台电脑后怎样重建环境。

> 这篇笔记保留原始发表日期，正文于 2026 年 9 月补全。命令采用 Python 3 与内置 `venv`；安装界面和可用版本请以官方文档为准。

<!-- more -->

## 1. 先确认解释器

Windows 可以通过 [Python 官方下载页](https://www.python.org/downloads/)获取安装方式，安装后打开一个新的 PowerShell 窗口：

```powershell
py --version
py -3 -c "import sys; print(sys.executable); print(sys.version)"
```

macOS / Linux 在终端检查：

```bash
python3 --version
python3 -c "import sys; print(sys.executable); print(sys.version)"
```

如果提示找不到命令，先确认 Python 已安装，再检查 PATH，最后重新打开终端。macOS 可以使用官方安装器；Linux 优先遵循发行版的安装说明。不要为了项目依赖覆盖系统 Python。

`sys.executable` 输出的路径比单纯的版本号更有用：同一台电脑可能同时有系统 Python、IDE 自带环境与项目虚拟环境。运行程序与安装依赖时，必须指向同一个解释器。

## 2. 为每个项目创建虚拟环境

虚拟环境把项目依赖与其他项目隔离。本文采用一个项目一个 `.venv` 的约定。[venv 官方文档](https://docs.python.org/3/library/venv.html)说明了创建、激活与直接使用解释器的方法。

Windows / PowerShell：

```powershell
mkdir python-demo
cd python-demo
py -3 -m venv .venv
# 不依赖 PowerShell 的脚本执行策略，直接使用环境内的解释器。
.\.venv\Scripts\python.exe -m pip --version
.\.venv\Scripts\python.exe -m pip install --upgrade pip
```

macOS / Linux：

```bash
mkdir -p python-demo
cd python-demo
python3 -m venv .venv
.venv/bin/python -m pip --version
.venv/bin/python -m pip install --upgrade pip
```

激活只是让终端更方便地找到这个解释器，并不是使用虚拟环境的必要条件。macOS / Linux 可执行 `source .venv/bin/activate`；PowerShell 可执行 `.\.venv\Scripts\Activate.ps1`。如果后者被策略拦截，继续使用上面的完整解释器路径即可，不必修改整台机器的安全策略。激活后输入 `deactivate` 可退出。

## 3. 安装依赖，并运行第一个程序

在项目中新建 `hello.py`：

```python
import sys
from pathlib import Path

print("Hello, Python!")
print("Interpreter:", sys.executable)
print("Project:", Path.cwd())
print("Virtual environment:", sys.prefix != sys.base_prefix)
```

Windows 运行 `.\.venv\Scripts\python.exe hello.py`，macOS / Linux 运行 `.venv/bin/python hello.py`。最后一项应为 `True`。

安装项目所需的库时，优先使用 `python -m pip`，而不是一个来源不明的裸 `pip` 命令。下面的命令假定已经激活虚拟环境；未激活时将 `python` 换成对应的完整路径。

```bash
python -m pip install requests
python -m pip check
python -m pip freeze > requirements.txt
```

`pip check` 检查已安装包的依赖关系；`pip freeze` 导出这个环境中的已安装版本。它方便重建，但不是跨操作系统、跨 Python 版本完全一致的保证，也不等同于具有哈希校验的完整锁文件。应另外记录 Python 版本和运行平台。

在另一个新环境中恢复：

```bash
python -m pip install -r requirements.txt
python -m pip check
```

尽量在干净的项目环境导出依赖，避免把不相关的包一起带进去。项目代码、依赖清单应进入版本控制；`.venv/` 与 `__pycache__/` 不应提交。

## 4. 让编辑器使用同一个环境

在 VS Code 或其他 IDE 中选择项目 `.venv` 内的解释器。不要只看状态栏显示的版本，再运行一次 `print(sys.executable)` 确认实际路径。

如果终端中能运行，但编辑器提示 `ModuleNotFoundError`，先比较两边的解释器路径，而不是反复安装同一个包。终端、运行按钮、调试配置、Notebook 内核也可能各自使用不同环境。

## 5. 常见问题排查

| 现象 | 优先检查 |
| --- | --- |
| 找不到 `python` 或 `py` | 是否安装、PATH 是否正确、是否重开终端 |
| 安装成功却无法导入 | `sys.executable` 与 `python -m pip --version` 是否指向同一环境 |
| Linux 创建环境时缺少 `venv` | 按发行版说明安装相应的 Python venv 组件 |
| 提示 externally-managed-environment | 给项目创建虚拟环境，不要强行覆盖系统包 |
| PowerShell 拒绝激活脚本 | 直接调用 `.venv\Scripts\python.exe` |
| 下载超时或证书错误 | 检查网络、代理与证书链，不要默认关闭 TLS 校验 |
| 找不到匹配的安装包 | 检查包是否支持当前 Python 版本、系统与处理器架构 |

## 6. 一个可维护的起点

```text
python-demo/
├── .venv/              # 本机环境，不提交
├── .gitignore
├── hello.py
├── requirements.txt
└── README.md           # 记录 Python 版本、安装与运行命令
```

判断环境是否配好，可以只问三个问题：我知道当前解释器在哪里吗？依赖是否属于这个项目？别人能否按 README 重建它？三个答案都清楚，后续排错会轻松很多。

## 参考资料

- [Python：虚拟环境 venv](https://docs.python.org/3/library/venv.html)
- [Python Packaging User Guide：安装包](https://packaging.python.org/en/latest/tutorials/installing-packages/)
- [pip freeze：能力与限制](https://pip.pypa.io/en/stable/cli/pip_freeze/)
- [Externally Managed Environments](https://packaging.python.org/en/latest/specifications/externally-managed-environments/)
