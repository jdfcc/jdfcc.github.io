# 命令是如何工作的

**首先只需要记住一件事：OpenSpec 有两种命令，它们运行在两个不同的地方。**

- `openspec ...` 命令运行在你的**终端**中。（例如：`openspec init`。）
- `/opsx:...` 命令运行在你的 **AI 助手聊天窗口**中。（例如：`/opsx:propose`。）

如果你曾经把 `/opsx:propose` 输入终端，却发现什么都没有发生，那么原因就在这里：**你用错了 OpenSpec 的一半。**

斜杠命令不是终端命令。它们是你发送给 AI 编程助手的指令，就像你平时在聊天框中输入“添加一个登录表单”一样。

对于 OpenSpec 新用户来说，这个区别是最常见的卡点，所以一定要把它搞清楚。

------

## 两个部分

OpenSpec 可以理解为一个项目戴着两顶帽子。

### CLI（终端部分）

这是一个名为 `openspec` 的程序，你需要在 Shell 中安装并运行它。

它负责：

- 初始化项目
- 列出和验证变更
- 显示 Dashboard
- 归档已经完成的工作

这些命令可以在 iTerm、VS Code Terminal、PowerShell 等任何可以运行 `git` 或 `npm` 的终端中执行。

```bash
openspec init        # 在当前项目中初始化 OpenSpec
openspec list        # 查看当前正在进行的变更
openspec view        # 打开交互式 Dashboard
```

### 斜杠命令（聊天部分）

像 `/opsx:propose`、`/opsx:apply` 这样的短命令，需要输入到你的 **AI 助手聊天窗口**中。

这些命令告诉 AI 按照 OpenSpec 工作流来执行：

- 创建提案
- 编写规格说明
- 根据任务列表进行开发
- 完成后归档

你可以在 Claude Code、Cursor、Devin Desktop、Copilot 或其他 AI 编程助手的聊天窗口中输入这些命令。

```text
/opsx:propose add-dark-mode    （在 AI 聊天窗口中输入）
/opsx:apply                    （在 AI 聊天窗口中输入）
/opsx:archive                  （在 AI 聊天窗口中输入）
```

可以用下面这张图来理解：

```text
        你的终端                              你的 AI 助手聊天窗口
   ┌──────────────────────┐               ┌──────────────────────────────┐
   │  $ openspec init     │   安装        │  /opsx:propose add-dark-mode │
   │  $ openspec list     │  ──────────►  │  /opsx:apply                  │
   │  $ openspec view     │   命令        │  /opsx:archive                │
   └──────────────────────┘    & 技能     └──────────────────────────────┘
        在这里运行 openspec                  在这里运行 /opsx:*
```

注意图中的箭头。

在终端执行：

```bash
openspec init
```

实际上就是在你的 AI 工具中**安装斜杠命令**。

也就是说：

> **终端部分负责设置聊天部分。**

完成初始化之后，日常使用 OpenSpec 的主要操作都会发生在 AI 聊天窗口中。

------

## “如何启动交互模式？”

**OpenSpec 没有一个单独的“交互模式”需要启动。**

这个问题经常出现，所以这里直接给出明确答案：

你不需要进入某种特殊的 OpenSpec 模式。

你只需要像平时一样打开 AI 编程助手，然后在聊天窗口输入斜杠命令。

**斜杠命令本身就是进入 OpenSpec 工作流的方式。**

AI 助手会识别这个命令，加载对应的 OpenSpec Skill，然后开始按照 OpenSpec 的工作流程执行。

所以真正的操作步骤是：

1. 打开你的 AI 编程助手，例如 Claude Code、Cursor、Devin Desktop 等。
2. 在项目中打开它。
3. 在聊天窗口输入 `/opsx:propose`，就像输入普通问题一样。
4. 查看自动补全：
   - 如果 OpenSpec 已经安装，你应该能够看到 `/opsx:propose`
   - `/opsx:apply`
   - 以及其他 OpenSpec 命令

就这么简单。

**不需要切换模式、不需要启动 daemon，也不需要打开额外窗口。**

不过，终端里确实存在一个具有交互性质的命令：

```bash
openspec view
```

它会打开一个 Dashboard，用于浏览你的规格说明和变更。

但是需要注意：

> `openspec view` 只是查看器，并不是你用来提出需求和开发功能的地方。

真正的开发工作是通过聊天窗口中的斜杠命令完成的。

------

## 为什么要采用这种分离设计？

理解这一点很有价值，因为它解释了为什么 OpenSpec 可以支持 **30 多种 AI 工具**。

### CLI 是“发动机”

CLI 负责理解 OpenSpec 的规则，例如：

- 一个 change 文件夹应该是什么结构
- 哪些 artifact 相互依赖
- 如何将 Delta Spec 合并到正式规格中

这些规则在不同 AI 工具之间都是一样的。

### 斜杠命令是“方向盘”

而斜杠命令则根据不同 AI 工具有所不同。

例如：

- Claude Code 使用 commands
- Cursor 有自己的命令格式
- Devin Desktop 也有自己的格式
- 某些工具使用 skills

当你运行：

```bash
openspec init
```

OpenSpec 会根据你选择的 AI 工具生成对应格式的文件。

这样，无论你使用哪一种 AI 助手，相同的：

```text
/opsx:propose
```

意图都可以实现相同的 OpenSpec 工作流程。

### 这种设计的优势

最大的优势是：

> **你只需要学习一次 OpenSpec 工作流，就可以在不同 AI 工具之间使用。**

代价则是：

> **不同 AI 工具中的具体命令语法可能会略有不同。**

下面就是不同工具的命令形式。

------

# 不同工具中的斜杠命令语法

OpenSpec 的核心意图在所有工具中都是一样的。

不同之处主要在于你的 AI 工具加载的文件格式不同。

| 工具中的命令文件                | 输入方式                  | 示例工具                                                     |
| ------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `.../commands/opsx/<id>.*`      | `/opsx:propose`           | Claude Code、Gemini CLI、Crush                               |
| `.../opsx-<id>.*`               | `/opsx-propose`           | Cursor、GitHub Copilot（IDE）、Devin Desktop、Trae、Oh My Pi |
| `.amazonq/prompts/opsx-<id>.md` | `@opsx-propose`           | Amazon Q Developer                                           |
| 无命令文件，仅使用 Skills       | `/openspec-propose`       | CodeArts、ForgeCode、Hermes、Mistral Vibe、共享 `.agents`    |
| 无命令文件 — Kimi Code          | `/skill:openspec-propose` | Kimi Code                                                    |
| 无命令文件 — Codex CLI          | `$openspec-propose`       | Codex                                                        |

Devin 是唯一跨越两行的工具。

Devin Desktop 读取：

```text
.devin/workflows/
```

因此可以使用：

```text
/opsx-propose
```

而 **Devin Local 不支持这种方式**，因此在该 Agent 中应该使用：

```text
/openspec-propose
```

OpenSpec 写入：

```text
.devin/skills/
```

中的 Skills 在两者中都可以使用，这也是为什么它们会通过 Skill 名称相互引用。

所有工具的具体信息都列在 **How To Invoke** 中，该表是权威说明。

需要特别注意，有两行实际上并不是斜杠命令：

- Amazon Q 将文件加载到 Prompt Library 中，并通过 `@` 调用。
- 最后几行使用的是 **Skill 名称**，而不是 command ID。

例如：

```text
/opsx:apply
```

实际上对应的是：

```text
openspec-apply-change
```

这个 Skill。

如果不确定自己应该使用哪种命令，可以直接查看运行：

```bash
openspec init
```

时输出的 **Getting started** 信息。

它已经会告诉你当前工具注册的命令格式。

另外，对于支持斜杠命令的工具，也可以直接在聊天窗口输入 `/`，然后查看自动补全。

------

# 命令是如何安装到 AI 工具中的？

当你运行：

```bash
openspec init
```

或者：

```bash
openspec update
```

OpenSpec 会向项目中写入一些文件，让你的 AI 工具能够发现 OpenSpec 工作流。

根据你使用的工具和配置，这些文件可能是：

- Skills
- Commands
- 或者两者都有

### Skills

Skills 通常位于：

```text
.claude/skills/openspec-*/SKILL.md
```

它们是正在逐渐成为跨工具标准的一种形式。

通常是一个包含指令的文件夹，AI 助手可以自动发现它。

### Commands

Commands 通常位于：

```text
.cursor/commands/opsx-<id>.md
```

或者：

```text
.claude/commands/opsx/<id>.md
```

具体目录由不同 AI 工具决定。

这些属于较早期的、针对具体工具的斜杠命令文件。

Codex 不会生成 command 文件，而是使用：

```text
.agents/skills/openspec-*
```

### 你实际上不需要关心它们的区别

正常情况下，你只需要输入对应的斜杠命令，它就会工作。

不过，了解这些文件的存在，在出现问题时非常有帮助。

例如：

> 如果你的 OpenSpec 命令突然消失，通常意味着这些文件缺失或者已经过期。

此时可以运行：

```bash
openspec update
```

重新生成它们。

具体工具的文件路径可以参考 **Supported Tools**。

如果你想了解 Skills 如何替代早期的 Command-only 方案，可以参考 **Migration Guide**。

------

# 如何确认 OpenSpec 已经安装？

有几个快速检查方法，按照推荐速度排序：

### 1. 在 AI 聊天窗口中输入 `/`

输入：

```text
/opsx
```

然后查看自动补全。

如果出现：

```text
/opsx:propose
/opsx:apply
...
```

说明安装成功。

但是以下这些仅支持 Skills 的工具比较特殊：

- Codex
- Kimi Code
- CodeArts
- ForgeCode
- Hermes
- Mistral Vibe
- 共享 `.agents` 目标

在这些工具中，即使 OpenSpec 正常安装：

```text
/opsx
```

也不会自动补全。

此时应该使用前面表格中对应的 Skill 名称。

------

### 2. 查看文件

以 Claude Code 为例，检查：

```text
.claude/skills/
```

里面是否存在：

```text
openspec-*
```

文件夹。

其他工具则使用各自对应的目录。

具体路径可以查看 **Supported Tools**。

------

### 3. 重新执行安装配置

在项目根目录执行：

```bash
openspec update
```

它会根据当前配置的 AI 工具重新生成：

- Skill 文件
- Command 文件

------

### 4. 重启 AI 助手

很多 AI 工具只会在启动时扫描 Skills 和 Commands。

因此，如果刚刚执行完安装却看不到命令，可以：

> 关闭当前 AI 助手窗口，然后重新打开。

------

# 我到底有哪些命令？

默认情况下，OpenSpec 会安装一组**核心斜杠命令**：

### `/opsx:explore`

在真正确定要做什么之前，与 AI 一起探索和思考一个想法。

如果你还不确定需求应该怎么实现，这通常是一个很好的第一步。

------

### `/opsx:propose`

创建一个 change，并一次性生成所有规划相关的 artifact。

------

### `/opsx:apply`

开始实施 change，根据任务列表逐项完成开发。

------

### `/opsx:update`

修改 change 的规划 artifact，并保持它们之间的一致性。

------

### `/opsx:sync`

将 change 中更新的规格合并到主规格中。

通常这个过程会自动完成。

------

### `/opsx:archive`

完成一个 change，并将其归档。

------

## 推荐的基本工作流程

一个很好的默认流程是：

```text
explore
   ↓
propose
   ↓
apply
   ↓
archive
```

也就是说：

1. **explore**：先思考清楚
2. **propose**：制定方案
3. **apply**：开始开发
4. **archive**：完成并归档

官方的 **Explore First** 指南会进一步解释为什么推荐先进行 `explore`。

------

# 扩展命令集

除了默认的核心命令之外，还有一个**扩展命令集**，适合需要更细粒度控制的用户。

包括：

```text
/opsx:new
/opsx:continue
/opsx:ff
/opsx:verify
/opsx:bulk-archive
/opsx:onboard
```

可以通过：

```bash
openspec config profile
```

开启。

然后执行：

```bash
openspec update
```

应用配置。

------

## 新手推荐：`/opsx:onboard`

如果你完全不了解 OpenSpec：

```text
/opsx:onboard
```

是非常适合你的命令。

它会在你自己的代码库中带你完整走一遍 change 流程，并且解释每一步发生了什么。

可以把它理解为：

> **OpenSpec 的新手入门教程。**

如果想查看每个命令的详细说明，可以参考 **Commands**。

如果想了解不同情况下应该使用哪个命令，可以参考 **Workflows**。

------

# 一个完整的首次运行示例

把前面的内容全部串起来，可以得到完整流程。

注意下面特别标明了每一步是在什么地方执行。

```text
终端       $ npm install -g @fission-ai/openspec@latest

终端       $ cd your-project

终端       $ openspec init
              （将斜杠命令安装到你的 AI 工具中）

AI 聊天     /opsx:explore
              （可选：先与 AI 一起分析和思考需求）

AI 聊天     /opsx:propose add-dark-mode
              （AI 创建 proposal、spec、design、tasks）

AI 聊天     /opsx:apply
              （AI 开始开发，并逐项完成任务）

AI 聊天     /opsx:archive
              （change 合并到规格中并归档）
```

也就是说：

> **只需要在终端执行两步进行初始化。**

之后，日常工作主要都在 AI 聊天窗口中完成。

整个使用节奏就是：

```text
终端初始化
    ↓
AI Chat
    ↓
explore
    ↓
propose
    ↓
apply
    ↓
archive
```

------

# 相关文档

- **Getting Started**：完整的第一次 change 操作教程
- **Commands**：详细介绍每一个斜杠命令
- **CLI**：详细介绍所有终端命令
- **Supported Tools**：不同 AI 工具对应的命令语法和文件位置
- **FAQ**：常见问题快速解答
- **Troubleshooting**：命令无法显示时的解决方法