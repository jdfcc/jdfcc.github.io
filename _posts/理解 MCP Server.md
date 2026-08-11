# 理解 MCP Server

MCP Server 是一种通过标准化协议接口，向 AI 应用程序提供特定能力的程序。

常见的 MCP Server 包括：

- **文件系统 Server**：用于访问文档
- **数据库 Server**：用于查询数据
- **GitHub Server**：用于代码管理
- **Slack Server**：用于团队沟通
- **日历 Server**：用于日程安排

------

## MCP Server 的核心能力

MCP Server 主要通过三个构建模块提供功能：

| 能力                  | 说明                                                         | 示例                             | 控制方       |
| --------------------- | ------------------------------------------------------------ | -------------------------------- | ------------ |
| **Tools（工具）**     | LLM 可以主动调用的函数，并根据用户请求决定什么时候使用。可以写数据库、调用外部 API、修改文件或执行其他逻辑。 | 搜索航班、发送消息、创建日历事件 | **模型**     |
| **Resources（资源）** | 被动的数据源，为 AI 提供只读上下文，例如文件内容、数据库 Schema、API 文档等。 | 获取文档、访问知识库、读取日历   | **应用程序** |
| **Prompts（提示词）** | 预先定义好的指令模板，用来告诉模型如何使用特定的 Tools 和 Resources。 | 制定旅行计划、总结会议、起草邮件 | **用户**     |

这三个能力可以组合起来完成比较复杂的任务。

------

# 一、Tools（工具）

Tools 允许 AI 模型**执行实际操作**。

每个 Tool 都定义了一项具体操作，并规定输入和输出的数据类型。

模型根据当前上下文决定是否请求执行某个 Tool。

## Tools 如何工作

Tools 是由 Schema 定义的接口，LLM 可以调用这些接口。

MCP 使用 **JSON Schema** 对 Tool 的输入进行验证。

每个 Tool 通常只负责一个明确的操作，并定义清晰的：

- 输入参数
- 输出结果

某些 Tool 在真正执行之前可能需要用户确认，从而保证用户始终能够控制 AI 所执行的操作。

### 对应的 MCP 协议操作

| 方法         | 作用            | 返回结果                     |
| ------------ | --------------- | ---------------------------- |
| `tools/list` | 查询可用的 Tool | 包含 Schema 的 Tool 定义数组 |
| `tools/call` | 执行指定 Tool   | Tool 的执行结果              |

例如，一个搜索航班的 Tool 可以定义为：

```typescript
{
  name: "searchFlights",
  description: "搜索可用航班",
  inputSchema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "出发城市"
      },
      destination: {
        type: "string",
        description: "到达城市"
      },
      date: {
        type: "string",
        format: "date",
        description: "出行日期"
      }
    },
    required: ["origin", "destination", "date"]
  }
}
```

------

# 二、Tools 的实际例子：旅行预订

假设 AI 正在帮助用户制定旅行计划。

它可以调用多个 Tool。

### 1. 搜索航班

```text
searchFlights(
    origin: "NYC",
    destination: "Barcelona",
    date: "2024-06-15"
)
```

查询多家航空公司的航班，并返回结构化的航班信息。

### 2. 创建日历事件

```text
createCalendarEvent(
    title: "Barcelona Trip",
    startDate: "2024-06-15",
    endDate: "2024-06-22"
)
```

将旅行日期添加到用户的日历中。

### 3. 发送邮件

```text
sendEmail(
    to: "team@work.com",
    subject: "Out of Office",
    body: "..."
)
```

向同事发送自动的休假/离岗通知邮件。

------

# 三、Tools 的用户交互模型

Tools 属于**模型控制（model-controlled）**能力。

也就是说：

> AI 模型可以发现有哪些 Tool，并根据用户的请求自动决定是否调用。

但是 MCP 同时强调**人工监督**。

应用程序可以通过以下方式让用户保持控制权：

- 在 UI 中显示可用的 Tools，让用户决定某个 Tool 是否可以用于当前对话
- 每次执行 Tool 前弹出确认框
- 对一些安全操作设置预授权
- 记录 Tool 的执行日志以及执行结果

因此，并不是：

```text
AI 想做什么 → 直接执行
```

而可以是：

```text
AI 决定调用 Tool
        ↓
应用程序检查权限
        ↓
需要确认？
   ↙          ↘
 是            否
 ↓              ↓
用户确认       直接执行
        ↓
    MCP Server
```



------

# 四、Resources（资源）

Resources 用于向 AI 应用提供**结构化的上下文信息**。

与 Tools 不同，Resources 本身主要是**读取数据**，而不是执行操作。

例如：

- 文件
- API 数据
- 数据库
- 数据库 Schema
- API 文档



## Resources 如何工作

Resource 可以暴露来自各种数据源的信息。

AI 应用程序获取这些数据后，可以自行决定如何处理，例如：

- 只选择相关的数据
- 使用 Embedding 搜索相关内容
- 使用关键词搜索
- 直接将全部数据交给模型

每个 Resource 都具有一个唯一的 URI。

例如：

```text
file:///path/to/document.md
```

同时会声明自己的 MIME Type，以便应用程序正确处理数据。

------

# 五、两种 Resource

MCP 支持两种 Resource 发现方式。

## 1. Direct Resources

直接指向固定数据的 URI。

例如：

```text
calendar://events/2024
```

表示获取 2024 年的日历信息。

## 2. Resource Templates

动态 URI 模板，可以通过参数查询不同的数据。

例如：

```text
travel://activities/{city}/{category}
```

可以根据：

- 城市
- 类别

动态查询旅游活动。

例如：

```text
travel://activities/barcelona/museums
```

表示查询：

> 巴塞罗那的所有博物馆。

Resource Template 通常还包含：

- title
- description
- MIME Type

因此它们本身具有较好的可发现性和自描述能力。

------

# 六、Resources 的协议操作

| 方法                       | 作用                    | 返回结果                   |
| -------------------------- | ----------------------- | -------------------------- |
| `resources/list`           | 获取可用的直接 Resource | Resource 描述数组          |
| `resources/templates/list` | 获取 Resource Template  | Resource Template 定义数组 |
| `resources/read`           | 获取 Resource 内容      | Resource 数据及元数据      |
| `subscriptions/listen`     | 监听 Resource 变化      | 更新通知流                 |

如果 Client 希望监听某个 Resource 的变化，可以通过 `subscriptions/listen` 订阅。

当 Resource 发生变化时，Server 可以发送：

```text
notifications/resources/updated
```

通知 Client。

------

# 七、Resource 实际例子

继续使用旅行规划的例子。

AI 应用可以访问：

```text
calendar://events/2024
```

获取用户的日程。

```text
file:///Documents/Travel/passport.pdf
```

读取旅行相关的重要文件。

```text
trips://history/barcelona-2023
```

获取用户之前的巴塞罗那旅行记录。

AI 应用获取这些 Resources 后，可以自己决定如何处理。

例如：

```text
Calendar
    ↓
用户哪几天有空？

Travel Preferences
    ↓
用户喜欢什么航空公司？
喜欢什么酒店？

Previous Trips
    ↓
用户以前去过哪里？
喜欢哪些地方？
```

然后将这些信息提供给模型。

------

# 八、Resource Template

例如：

```json
{
  "uriTemplate": "weather://forecast/{city}/{date}",
  "name": "weather-forecast",
  "title": "Weather Forecast",
  "description": "获取指定城市和日期的天气预报",
  "mimeType": "application/json"
}
```

以及：

```json
{
  "uriTemplate": "travel://flights/{origin}/{destination}",
  "name": "flight-search",
  "title": "Flight Search",
  "description": "查询两个城市之间的可用航班",
  "mimeType": "application/json"
}
```

这样就可以进行动态查询。

例如：

```text
weather://forecast/Paris/2026-08-20
```

或者：

```text
travel://flights/NYC/Barcelona
```

------

# 九、参数补全（Parameter Completion）

动态 Resource 还支持参数补全。

例如用户输入：

```text
weather://forecast/Par
```

系统可以提示：

```text
Paris
Park City
```

又比如输入：

```text
flights://search/JFK
```

系统可以提示：

```text
JFK - John F. Kennedy International
```

这样用户就不需要准确记住参数的完整格式。

------

# 十、Resources 的用户交互模型

Resources 是由**应用程序驱动（application-driven）**的。

应用程序可以自由决定：

- 如何获取 Resource
- 如何处理 Resource
- 如何向用户展示 Resource

常见的交互方式包括：

- 类似文件夹的树形/列表结构
- 搜索和过滤
- 根据当前对话自动加入相关上下文
- AI 智能推荐
- 手动选择 Resource
- 批量选择多个 Resource

MCP 协议**不会强制规定 UI 应该长什么样**。

因此应用程序可以根据自己的需求设计 Resource Picker、预览功能、智能推荐等。

------

# 十一、Prompts（提示词）

Prompts 是**可以重复使用的模板**。

MCP Server 作者可以提供针对某个领域的参数化 Prompt，也可以通过 Prompt 告诉用户：

> 如何更好地使用这个 MCP Server。

------

# 十二、Prompts 如何工作

Prompt 是结构化模板，可以定义：

- 需要哪些输入
- 输入参数类型
- 交互方式
- 使用哪些 Resource
- 使用哪些 Tool

与 Resources 类似，Prompt 也支持参数补全。

但是一个非常重要的区别是：

> **Prompts 是用户控制的，需要用户主动调用，而不是模型自动触发。**



### Prompt 的协议操作

| 方法           | 作用             | 返回                   |
| -------------- | ---------------- | ---------------------- |
| `prompts/list` | 查询可用 Prompt  | Prompt 描述数组        |
| `prompts/get`  | 获取 Prompt 详情 | 完整 Prompt 定义及参数 |

------

# 十三、Prompt 示例

例如：

```text
Plan a vacation
```

可以定义成一个旅行规划模板：

```json
{
  "name": "plan-vacation",
  "title": "Plan a vacation",
  "description": "引导用户完成旅行规划",
  "arguments": [
    {
      "name": "destination",
      "type": "string",
      "required": true
    },
    {
      "name": "duration",
      "type": "number",
      "description": "旅行天数"
    },
    {
      "name": "budget",
      "type": "number",
      "required": false
    },
    {
      "name": "interests",
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  ]
}
```

用户不再需要自己写一大段自然语言，而是：

```text
选择：
Plan a vacation

输入：
目的地：Barcelona
旅行时间：7 天
预算：$3000
兴趣：
  - beaches
  - architecture
  - food
```

然后系统根据这个模板执行一致的工作流程。

------

# 十四、Prompt 的用户交互

Prompt 同样是**用户控制的**。

用户必须主动调用。

应用程序可以通过以下方式提供 Prompt：

### Slash Commands

例如：

```text
/plan-vacation
```

### Command Palette

通过命令面板搜索 Prompt。

### UI Button

例如提供：

```text
[Plan a Vacation]
```

按钮。

### Context Menu

根据当前上下文推荐相关 Prompt。

例如用户正在查看旅行信息时，可以自动显示：

```text
Plan a vacation
Search flights
Find hotels
```



------

# 十五、多个 MCP Server 协同工作

MCP 真正强大的地方在于：

> **多个 MCP Server 可以组合起来，通过统一接口共同完成复杂任务。**

例如，一个旅行 AI 应用可以连接三个 MCP Server：

```text
Travel Server
    ├── 航班
    ├── 酒店
    └── 行程

Weather Server
    └── 天气

Calendar / Email Server
    ├── 日历
    └── 邮件
```



------

# 十六、完整的多 Server 旅行规划流程

用户首先调用：

```text
plan-vacation
```

并提供：

```json
{
  "destination": "Barcelona",
  "departure_date": "2024-06-15",
  "return_date": "2024-06-22",
  "budget": 3000,
  "travelers": 2
}
```

------

### 第一步：选择 Resources

用户选择：

```text
calendar://my-calendar/June-2024
```

来自 Calendar Server。

```text
travel://preferences/europe
```

来自 Travel Server。

```text
travel://past-trips/Spain-2023
```

来自 Travel Server。

------

### 第二步：AI 读取上下文

AI 首先读取这些 Resources：

```text
日历
 ↓
判断用户什么时候有空

旅行偏好
 ↓
了解用户喜欢的航空公司、酒店类型

历史旅行
 ↓
了解用户以前喜欢哪些地方
```

------

### 第三步：调用 Tools

AI 根据这些上下文调用 Tools。

例如：

```text
searchFlights()
```

查询：

```text
NYC → Barcelona
```

然后：

```text
checkWeather()
```

查询旅行日期的天气。

------

### 第四步：执行预订相关操作

AI 获取信息之后，可以继续执行：

```text
bookHotel()
```

根据预算寻找酒店。

然后：

```text
createCalendarEvent()
```

把旅行加入用户日历。

最后：

```text
sendEmail()
```

发送旅行确认邮件。

必要的时候，这些操作需要用户确认。

------

# 十七、最终形成的完整架构

整个过程可以理解成：

```text
                    AI Application
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Travel Server  Weather Server  Calendar/Email
             │            │            │
        ┌────┴────┐       │       ┌────┴─────┐
        │         │       │       │          │
     Resources  Tools   Tools  Calendar    Email
        │         │       │       │          │
        └─────────┴───────┴───────┴──────────┘
                          │
                          ▼
                         AI
```

最终，用户只需要提出：

> **“帮我规划一次巴塞罗那旅行。”**

MCP 就可以让 AI：

```text
读取日历
   ↓
读取旅行偏好
   ↓
读取历史旅行记录
   ↓
查询航班
   ↓
查询天气
   ↓
搜索酒店
   ↓
用户确认
   ↓
预订酒店
   ↓
更新日历
   ↓
发送邮件
```

也就是说，**Resources 负责“给 AI 信息”，Tools 负责“让 AI 做事情”，Prompts 负责“告诉 AI 如何按照预定义流程工作”**。

这三个概念是理解 MCP Server 最重要的部分。