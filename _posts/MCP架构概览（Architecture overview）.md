# 架构概览（Architecture overview）

这份概览介绍了 **模型上下文协议（Model Context Protocol，MCP）** 的范围、核心概念，并通过一个示例说明每个核心概念。

由于 MCP SDK 已经对许多底层细节进行了抽象，因此大多数开发者可能会发现，**数据层协议（Data Layer Protocol）** 部分最有用。这一部分主要讨论 MCP Server 如何向 AI 应用程序提供上下文。

有关具体的实现细节，请参考针对不同编程语言提供的 **语言特定 SDK（language-specific SDK）**。

------

## 范围（Scope）

Model Context Protocol 包含以下几个项目：

- **MCP Specification（MCP 规范）**：定义 MCP 的规范，并规定客户端和服务器的实现要求。
- **MCP SDKs（MCP SDK）**：针对不同编程语言提供的 SDK，实现 MCP 协议。
- **MCP Development Tools（MCP 开发工具）**：用于开发 MCP Server 和 MCP Client 的工具，包括 MCP Inspector。
- **MCP Reference Server Implementations（MCP 参考服务器实现）**：MCP Server 的参考实现。

> **注意：**
>
> MCP 只关注**上下文交换协议本身**，并不规定 AI 应用程序应该如何使用 LLM，也不规定 AI 应用程序应该如何管理所提供的上下文。

------

# MCP 的核心概念（Concepts of MCP）

## 参与者（Participants）

MCP 采用 **客户端-服务器（Client-Server）架构**。

一个 MCP Host（即 AI 应用程序，例如 Claude Code 或 Claude Desktop）可以与一个或多个 MCP Server 建立连接。

MCP Host 会针对每一个 MCP Server 创建一个独立的 **MCP Client**。

每个 MCP Client 都会维护与其对应 MCP Server 的专用连接。

通常情况下：

- 使用 **STDIO Transport** 的本地 MCP Server 只服务于一个 MCP Client。
- 使用 **Streamable HTTP Transport** 的远程 MCP Server 通常可以同时服务多个 MCP Client。

MCP 架构中的三个核心参与者是：

### MCP Host

**MCP Host** 是负责协调和管理一个或多个 MCP Client 的 AI 应用程序。

例如：

- Claude Code
- Claude Desktop
- Visual Studio Code

### MCP Client

**MCP Client** 是一个负责维护与 MCP Server 连接的组件。

它从 MCP Server 获取上下文，然后将这些上下文提供给 MCP Host 使用。

### MCP Server

**MCP Server** 是一个向 MCP Client 提供上下文的程序。

------

### 举例

例如，**Visual Studio Code** 可以作为一个 MCP Host。

当 Visual Studio Code 与一个 MCP Server（例如 Sentry MCP Server）建立连接时，Visual Studio Code 运行时会创建一个 MCP Client 对象，用于维护与 Sentry MCP Server 的连接。

之后，当 Visual Studio Code 再连接另一个 MCP Server，例如本地文件系统 MCP Server 时，Visual Studio Code 运行时会再创建一个新的 MCP Client 对象，用于维护与该 MCP Server 的连接。

也就是说：

```text
                    MCP Host
                （AI 应用程序）
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    MCP Client 1   MCP Client 2   MCP Client 3
        │              │              │
        ▼              ▼              ▼
   MCP Server A    MCP Server B    MCP Server C
     本地文件         本地数据库        远程服务
```

每一个 MCP Client 都与对应的 MCP Server 建立独立连接。

------

### MCP Server 是什么？

需要特别注意：

**MCP Server 指的是提供上下文数据的程序，而不是它所在的位置。**

MCP Server 可以：

- 在本地运行
- 在远程服务器上运行

例如：

当 Claude Desktop 启动文件系统 MCP Server 时，因为它使用的是 **STDIO Transport**，所以这个 MCP Server 会运行在与 Claude Desktop 相同的机器上。

这种通常被称为：

> **Local MCP Server（本地 MCP Server）**

而官方 Sentry MCP Server 运行在 Sentry 平台上，并使用 **Streamable HTTP Transport**。

这种通常被称为：

> **Remote MCP Server（远程 MCP Server）**

------

# MCP 的层次结构（Layers）

MCP 由两个层组成：

1. **Data Layer（数据层）**
2. **Transport Layer（传输层）**

可以理解为：

```text
┌─────────────────────────────┐
│      Transport Layer        │
│         传输层               │
│                             │
│  负责连接、通信、认证等       │
│                             │
│   ┌─────────────────────┐   │
│   │     Data Layer      │   │
│   │       数据层         │   │
│   │                     │   │
│   │     JSON-RPC 2.0    │   │
│   │   Tools / Resources │   │
│   │   Prompts / Events  │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```

数据层是**内层**，传输层是**外层**。

------

## 数据层（Data Layer）

数据层实现的是基于 **JSON-RPC 2.0** 的通信协议，用于定义消息的结构和语义。

数据层主要包含：

### 1. Discovery（能力发现）

允许 Client 查询 Server 支持的：

- MCP 协议版本
- 能力（Capabilities）
- 身份信息（Identity）

通过：

```text
server/discover
```

请求完成。

### 2. Server Features（服务器功能）

Server 可以向 Client 提供：

- **Tools（工具）**：供 AI 执行操作
- **Resources（资源）**：提供上下文数据
- **Prompts（提示词）**：提供交互模板

### 3. Client Features（客户端功能）

允许 Server 向用户请求额外输入。

其中 Sampling 功能在 `2026-07-28` 协议版本中已经被标记为 **Deprecated（弃用）**。

### 4. Utility Features（实用功能）

提供其他能力，例如：

- 实时通知
- 长时间运行操作的进度跟踪

------

# 传输层（Transport Layer）

传输层负责管理 Client 和 Server 之间的通信通道以及身份认证。

它主要处理：

- 建立连接
- 消息分帧
- 安全通信
- 身份认证

MCP 支持两种传输机制：

### STDIO Transport

使用标准输入/输出流，在同一台机器上的本地进程之间直接通信。

优点是：

- 性能好
- 没有网络开销

因此非常适合本地 MCP Server。

### Streamable HTTP Transport

使用 HTTP POST 在 Client 和 Server 之间传递消息。

同时可以选择使用 **Server-Sent Events（SSE）** 实现流式能力。

这种方式适合：

- 远程 MCP Server
- 网络环境下的 Client-Server 通信

同时支持标准的 HTTP 身份认证方式，例如：

- Bearer Token
- API Key
- 自定义 Header

MCP 推荐使用 **OAuth** 获取认证 Token。

------

# 数据层协议（Data Layer Protocol）

MCP 的核心之一，就是定义 **MCP Client 和 MCP Server 之间的数据结构和语义**。

其中最重要的部分是 MCP 的 **Primitives（原语）**。

它定义了 MCP Server 可以向 AI 应用提供哪些上下文，以及 AI 应用可以执行哪些操作。

MCP 使用：

> **JSON-RPC 2.0**

作为底层 RPC 协议。

Client 和 Server 可以互相发送：

- Request（请求）
- Response（响应）
- Notification（通知）

如果某个消息不需要返回结果，则可以使用 Notification。

------

# 无状态与能力发现（Statelessness and Discovery）

MCP 是一种**无状态协议（Stateless Protocol）**。

也就是说：

> 每一个请求都包含处理该请求所需要的信息，Server 不需要依赖之前请求中的状态。

每个请求都会在 `_meta` 字段中携带：

- 协议版本
- 与当前请求相关的能力（Capabilities）

Client 通常也会在其中标识自己的身份信息。

Server 可以通过必须实现的：

```text
server/discover
```

请求来公布自己支持的：

- 协议版本
- 能力
- 身份信息

Client 可以在发送其他请求之前先进行 Discovery。

------

# MCP 原语（Primitives）

这是 MCP 中非常重要的概念。

**Primitive（原语）** 定义了 Client 和 Server 可以向对方提供什么能力。

MCP Server 可以暴露三个核心原语：

### 1. Tools（工具）

可以执行的函数。

AI 应用可以调用这些工具执行实际操作，例如：

- 文件操作
- API 调用
- 数据库查询

### 2. Resources（资源）

向 AI 应用提供上下文信息的数据源，例如：

- 文件内容
- 数据库记录
- API 响应

### 3. Prompts（提示词）

可以重复使用的模板，用于帮助组织与语言模型之间的交互。

例如：

- System Prompt
- Few-shot 示例

------

每一种 Primitive 通常都有对应的方法用于：

```text
*/list
*/get
```

以及某些情况下的：

```text
tools/call
```

例如 Client 可以先调用：

```text
tools/list
```

获取 Server 所提供的所有工具，然后再选择需要的工具执行。

------

# 一个数据库 MCP Server 的例子

假设有一个 MCP Server 专门负责提供数据库相关的上下文。

它可以同时提供：

```text
Tools
  └── 用于查询数据库

Resources
  └── 数据库 Schema

Prompts
  └── 用于指导 AI 如何使用数据库工具的 Few-shot 示例
```

这样 AI 就可以：

1. 通过 Resources 了解数据库结构
2. 通过 Tools 执行数据库查询
3. 通过 Prompts 获得如何使用这些工具的指导

------

# Client 可以提供的 Primitive

MCP 不仅允许 Server 向 Client 提供 Primitive，Client 也可以向 Server 提供一些 Primitive。

其中包括：

### Elicitation（信息请求）

允许 MCP Server 向用户请求额外信息。

例如：

```text
MCP Server：
“你确定要删除这个数据库吗？”

用户：
“确定”
```

Server 可以通过：

```text
elicitation/create
```

请求用户输入或确认。

------

### Sampling（已弃用）

Sampling 允许 MCP Server 请求 Client 所连接的 AI 应用调用语言模型生成内容。

这种机制的目的之一，是让 MCP Server 可以使用语言模型，而不需要直接集成某个特定的 LLM SDK。

不过从 `2026-07-28` 协议版本开始：

> **Sampling 已被弃用（Deprecated）。**

新的实现应该直接集成 LLM Provider API。

------

### Logging（已弃用）

Logging 允许 Server 向 Client 发送日志信息，用于：

- 调试
- 监控

新的实现建议：

- STDIO Transport：输出到 `stderr`
- 或使用 OpenTelemetry

------

# Notifications（通知）

MCP 支持实时通知。

例如：

当 MCP Server 的工具发生变化时：

```text
新增工具
删除工具
修改工具
工具暂时不可用
```

Server 可以向 Client 发送通知。

Client 收到通知之后，就可以重新执行：

```text
tools/list
```

获取最新的工具列表。

需要注意：

**通知是可选订阅的（Opt-in）。**

Client 需要主动订阅自己关心的通知类型。

------

# MCP 工作流程示例

整个过程可以简单理解为：

```text
             AI Application
                   │
                   ▼
              MCP Client
                   │
                   │ 1. Discovery
                   ▼
              MCP Server
                   │
                   │ 2. 返回能力
                   ▼
              MCP Client
                   │
                   │ 3. tools/list
                   ▼
              MCP Server
                   │
                   │ 4. 返回工具列表
                   ▼
              MCP Client
                   │
                   │ 5. tools/call
                   ▼
              MCP Server
                   │
                   │ 6. 执行工具
                   ▼
              MCP Client
                   │
                   ▼
              AI Application
```

也就是说，典型流程是：

**① 发现 Server → ② 获取工具 → ③ 调用工具 → ④ 获取结果**

------

# Tool Discovery（工具发现）

Client 可以通过：

```text
tools/list
```

请求获取 Server 上可用的工具。

返回的每一个 Tool 通常包含：

### name

工具名称。

例如：

```text
calculator_arithmetic
```

这是工具的唯一标识。

### title

供用户阅读的工具名称。

例如：

```text
Calculator
```

### description

描述工具的作用以及什么时候应该使用它。

### inputSchema

定义工具所需要的输入参数。

例如：

```json
{
  "type": "object",
  "properties": {
    "expression": {
      "type": "string"
    }
  },
  "required": ["expression"]
}
```

这样 Client 就可以知道：

```text
这个工具需要一个 expression 参数
```

------

# Tool Execution（工具执行）

Client 获取工具列表之后，就可以使用：

```text
tools/call
```

执行工具。

例如：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "weather_current",
    "arguments": {
      "location": "San Francisco",
      "units": "imperial"
    }
  }
}
```

这里：

```text
name
```

必须与 `tools/list` 返回的工具名称完全一致。

例如：

```text
weather_current
```

不能随意写成：

```text
weather
```

------

# Tool Execution Response（工具执行响应）

工具执行之后，Server 返回结果。

例如：

```json
{
  "resultType": "complete",
  "content": [
    {
      "type": "text",
      "text": "Current weather in San Francisco..."
    }
  ]
}
```

其中：

```text
content
```

是一个数组。

因此工具返回的数据可以支持多种内容类型，例如：

- 文本
- 图片
- Resource
- 其他结构化内容

------

# MCP 在 AI 应用中的工作方式

当 LLM 决定在对话过程中调用某个工具时：

```text
LLM
 │
 │ 决定调用工具
 ▼
AI Application
 │
 │ 找到对应 MCP Client
 ▼
MCP Client
 │
 │ tools/call
 ▼
MCP Server
 │
 │ 执行实际操作
 ▼
Tool Result
 │
 ▼
MCP Client
 │
 ▼
AI Application
 │
 ▼
LLM
```

因此 MCP 的核心价值之一就是：

> **让 LLM 能够通过标准协议访问外部数据和执行外部操作。**

------

# Real-time Updates（实时更新）

MCP 支持 Server 主动向 Client 发送变化通知。

例如：

```text
MCP Server
    │
    │ 工具列表发生变化
    ▼
Notification
    │
    ▼
MCP Client
    │
    │ tools/list
    ▼
获取最新工具列表
```

通知不需要 Response。

因为它属于 JSON-RPC 2.0 的 Notification，所以消息中没有：

```json
"id": ...
```

------

# 通知机制的主要特点

### 1. 不需要响应

Notification 没有 `id` 字段，因此不需要 Client 返回响应。

### 2. 主动订阅

只有 Client 主动订阅某种通知后，Server 才会发送对应通知。

### 3. Subscription ID

每个通知都会带有：

```text
subscriptionId
```

用于标识该通知属于哪个订阅。

### 4. 事件驱动

Server 根据自身状态变化决定什么时候发送通知。

### 5. Best Effort

MCP 不保证每一个 Notification 都一定能够发送或接收成功。

特别是在 Transport 重新连接的情况下，Client 仍然应该通过轮询等方式确保数据的新鲜度。

------

# 为什么 Notifications 很重要？

通知机制主要解决以下问题：

### 动态环境

Server 上的工具可能动态增加或减少。

### 提高效率

Client 不需要一直轮询 Server。

Server 有变化时主动通知即可。

### 保持一致性

Client 可以及时获得 Server 当前最新的能力。

### 实时协作

AI 应用可以根据 Server 状态变化动态调整自己的能力。

------

# 总结：MCP 到底是什么？

可以把 MCP 简单理解成：

> **AI 世界里的“标准化外部能力接口协议”。**

它主要解决：

```text
AI
 │
 ▼
MCP Client
 │
 ├──── MCP Server ──── 文件系统
 │
 ├──── MCP Server ──── 数据库
 │
 ├──── MCP Server ──── GitHub
 │
 ├──── MCP Server ──── Sentry
 │
 └──── MCP Server ──── 其他 API
```

其中：

| 概念            | 简单理解                           |
| --------------- | ---------------------------------- |
| MCP Host        | AI 应用，例如 Claude Code、VS Code |
| MCP Client      | Host 中负责连接 MCP Server 的组件  |
| MCP Server      | 提供外部数据/能力的程序            |
| Tools           | AI 可以执行的操作                  |
| Resources       | AI 可以读取的上下文数据            |
| Prompts         | 可复用的提示词模板                 |
| Elicitation     | Server 向用户请求额外信息          |
| Transport       | Client 和 Server 如何通信          |
| STDIO           | 本地进程通信                       |
| Streamable HTTP | 基于 HTTP 的远程通信               |
| JSON-RPC 2.0    | MCP 底层的数据交换格式             |
| Discovery       | 查询 Server 支持什么能力           |
| Notification    | Server 主动通知 Client 发生变化    |

最核心的一句话是：

**MCP = 规定 AI 应用如何标准化地发现、访问和调用外部能力的一套协议。**