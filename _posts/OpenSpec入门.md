- # 快速入门

  本指南介绍安装并初始化 OpenSpec 后如何使用它。

  如果你需要安装说明，请参阅 [主 README](https://chatgpt.com/README.md#quick-start) 或 [安装指南](https://chatgpt.com/c/installation.md)。如果你是第一次接触整套文档，可以查看 [文档主页](https://chatgpt.com/c/README.md)，那里列出了所有文档的结构。

  > **这些命令应该在哪里输入？**
  >
  > 有两个地方，而把两者混淆是刚开始使用时最常见的问题。
  >
  > - `openspec ...` 命令（例如 `openspec init`）需要在**终端**中运行。
  > - `/opsx:...` 命令（例如 `/opsx:propose`）需要在你的 **AI 助手聊天窗口**中运行，也就是你平时让 AI 编写代码的那个输入框。
  >
  > 不需要启动什么单独的“交互模式”。你只需要在聊天中输入斜杠命令，AI 助手就会接管后续工作。
  >
  > 完整说明请参阅：[命令如何工作](https://chatgpt.com/c/how-commands-work.md)。

  ## 你的前五分钟

  下面是完整的工作流程，并标明每一步应该在哪里执行：

  ```text
  终端        $ npm install -g @fission-ai/openspec@latest
  终端        $ cd your-project && openspec init
  AI 聊天      /opsx:explore                    （可选：先思考清楚）
  AI 聊天      /opsx:propose add-dark-mode      （AI 起草方案；你进行审核）
  AI 聊天      /opsx:apply                      （AI 开始实现）
  AI 聊天      /opsx:archive                    （更新规范并归档变更）
  ```

  前两步是在终端中完成 OpenSpec 的初始化，之后主要就在 AI 聊天窗口中工作。

  本指南下面会详细解释每一步做什么，以及你会看到什么结果。

  **不想自己执行终端命令？**

  你可以把 [安装提示词](https://chatgpt.com/c/installation.md#install-with-your-ai-assistant) 复制给你的 AI 助手，它会自动处理上面的两条命令，然后告诉你创建了哪些内容。

  > **还不确定具体要做什么？可以先使用 `/opsx:explore`。**
  >
  > 它相当于一个没有风险的“思考伙伴”，会读取你的代码库、分析不同方案，并将模糊的想法逐渐整理成具体计划，而且此时还不会创建任何工件或代码。
  >
  > 当需求已经明确后，它会将工作交给 `/opsx:propose`。
  >
  > 对于使用 AI 编程助手来说，这是最值得养成的习惯之一，因为否则 AI 很可能会非常自信地实现一个错误的需求。
  >
  > 参阅：[Explore 指南](https://chatgpt.com/c/explore.md)。

  # OpenSpec 是如何工作的

  OpenSpec 的目标是帮助你和 AI 编程助手在真正编写代码之前，先对“到底要实现什么”达成一致。

  ## 默认快速流程（核心配置）

  ```text
  /opsx:explore ──► /opsx:propose ──► /opsx:apply ──► /opsx:sync ──► /opsx:archive
     （可选）
  ```

  当你还在思考要做什么时，可以从 `/opsx:explore` 开始。

  如果你已经非常清楚要做什么，也可以直接使用 `/opsx:propose`。

  `explore` 默认包含在核心配置中，因此你随时都可以使用。

  ## 扩展流程（自定义工作流）

  ```text
  /opsx:new ──► /opsx:ff 或 /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
  ```

  默认的全局配置文件是 `core`，其中包含：

  - `propose`
  - `explore`
  - `apply`
  - `update`
  - `sync`
  - `archive`

  你可以通过以下命令启用扩展工作流：

  ```bash
  openspec config profile
  ```

  然后执行：

  ```bash
  openspec update
  ```

  # OpenSpec 会创建什么

  执行：

  ```bash
  openspec init
  ```

  之后，你的项目会出现类似下面的目录结构：

  ```text
  openspec/
  ├── specs/              # 事实来源（系统当前的行为）
  │   └── <domain>/
  │       └── spec.md
  ├── changes/            # 提议中的更新（每个变更一个目录）
  │   └── <change-name>/
  │       ├── proposal.md
  │       ├── design.md
  │       ├── tasks.md
  │       └── specs/      # Delta 规范（发生了什么变化）
  │           └── <domain>/
  │               └── spec.md
  └── config.yaml         # 项目配置（可选）
  ```

  ## 两个核心目录

  ### `specs/`

  **事实来源（Source of Truth）**。

  这些规范描述系统**当前实际的行为**。

  它按照业务领域进行组织，例如：

  ```text
  specs/auth/
  specs/payments/
  ```

  ### `changes/`

  **计划中的修改**。

  每一个变更都会拥有自己的目录，并包含与该变更相关的全部工件。

  当一个变更完成之后，它对应的规范会合并到主 `specs/` 目录中。

  # 理解各种工件（Artifacts）

  每一个 change 目录都包含一些用于指导开发工作的工件：

  | 工件          | 用途                                           |
  | ------------- | ---------------------------------------------- |
  | `proposal.md` | “为什么做”和“做什么”——记录意图、范围和整体方案 |
  | `specs/`      | Delta 规范——展示新增、修改、删除的需求         |
  | `design.md`   | “怎么做”——记录技术方案和架构决策               |
  | `tasks.md`    | 实现清单——以复选框形式列出具体任务             |

  这些工件之间存在依赖关系：

  ```text
  proposal ──► specs ──► design ──► tasks ──► implement
     ▲           ▲          ▲                    │
     └───────────┴──────────┴────────────────────┘
              根据学习到的新信息不断更新
  ```

  在实现过程中，如果你发现新的信息，也可以随时返回去修改之前的工件。

  # Delta Spec 是如何工作的

  Delta Spec 是 OpenSpec 最核心的概念之一。

  它描述的是：

  > **相对于当前规范，系统发生了什么变化。**

  ## Delta Spec 的格式

  Delta Spec 使用不同的章节来表示变化类型：

  ```markdown
  # Auth 的 Delta
  
  ## ADDED Requirements
  
  ### Requirement: 双因素认证
  系统在登录时必须要求用户提供第二认证因素。
  
  #### Scenario: 需要 OTP
  - GIVEN 用户已经启用了双因素认证
  - WHEN 用户提交有效的登录凭证
  - THEN 系统显示 OTP 验证挑战
  
  ## MODIFIED Requirements
  
  ### Requirement: Session Timeout
  系统必须在 30 分钟无操作后使会话过期。
  （之前：60 分钟）
  
  #### Scenario: 空闲超时
  - GIVEN 用户已经登录
  - WHEN 连续 30 分钟没有任何操作
  - THEN 当前会话失效
  
  ## REMOVED Requirements
  
  ### Requirement: Remember Me
  （已废弃，改用双因素认证）
  ```

  这里有三个核心变化类型：

  - **ADDED**：新增需求
  - **MODIFIED**：修改现有需求
  - **REMOVED**：删除现有需求

  ## Archive 时会发生什么

  当你归档一个 change 时：

  1. **ADDED** 需求会追加到主规范中。
  2. **MODIFIED** 需求会替换主规范中原来的版本。
  3. **REMOVED** 需求会从主规范中删除。

  然后，这个 change 目录会被移动到：

  ```text
  openspec/changes/archive/
  ```

  这样可以保留完整的变更历史，方便审计和追踪。

  # 示例：完成你的第一个 Change

  下面以给一个应用增加“深色模式”为例。

  ## 1. 开始一个 Change（默认方式）

  ```text
  你：/opsx:propose add-dark-mode
  
  AI：
       Created openspec/changes/add-dark-mode/
       ✓ proposal.md — 为什么做、要修改什么
       ✓ specs/       — 需求和场景
       ✓ design.md    — 技术方案
       ✓ tasks.md     — 实现任务清单
       Ready for implementation!
  ```

  如果你启用了扩展工作流，也可以拆成两个步骤：

  ```text
  /opsx:new
  ```

  然后：

  ```text
  /opsx:ff
  ```

  或者使用：

  ```text
  /opsx:continue
  ```

  逐步完成。

  ## 2. 会创建什么

  ### `proposal.md`

  用于记录需求意图：

  ```markdown
  # Proposal: Add Dark Mode
  
  ## Intent
  用户希望增加深色模式，以减少夜间使用时的眼睛疲劳。
  
  ## Scope
  - 在设置中增加主题切换
  - 支持检测系统主题偏好
  - 使用 localStorage 保存用户选择
  
  ## Approach
  使用 CSS 自定义属性实现主题，
  并使用 React Context 管理状态。
  ```

  ### `specs/ui/spec.md`

  这是一个展示新需求的 Delta Spec：

  ```markdown
  # Delta for UI
  
  ## ADDED Requirements
  
  ### Requirement: Theme Selection
  系统必须允许用户在浅色主题和深色主题之间进行选择。
  
  #### Scenario: 手动切换
  - GIVEN 用户当前位于任意页面
  - WHEN 用户点击主题切换按钮
  - THEN 主题立即切换
  - AND 用户的选择会在不同会话之间保持
  
  #### Scenario: 系统主题偏好
  - GIVEN 用户没有保存主题偏好
  - WHEN 应用加载
  - THEN 使用系统当前首选的颜色主题
  ```

  ### `tasks.md`

  这是具体的实现任务清单：

  ```markdown
  # Tasks
  
  ## 1. 主题基础设施
  - [ ] 1.1 创建 ThemeContext，管理 light/dark 状态
  - [ ] 1.2 添加 CSS 自定义颜色属性
  - [ ] 1.3 实现 localStorage 持久化
  
  ## 2. UI 组件
  - [ ] 2.1 创建 ThemeToggle 组件
  - [ ] 2.2 将切换按钮添加到设置页面
  - [ ] 2.3 在 Header 中添加快速切换按钮
  
  ## 3. 样式
  - [ ] 3.1 定义深色主题颜色方案
  - [ ] 3.2 修改组件，使其使用 CSS 变量
  ```

  ## 3. 实现

  执行：

  ```text
  你：/opsx:apply
  
  AI：
       正在执行任务……
       ✓ 1.1 创建 ThemeContext，管理 light/dark 状态
       ✓ 1.2 在 globals.css 中添加 CSS 自定义属性
       ✓ 1.3 实现 localStorage 持久化
       ✓ 2.1 创建 ThemeToggle 组件
       ...
       所有任务完成！
  ```

  在实现过程中，如果发现原来的设计需要调整，可以直接修改对应工件，然后继续执行。

  ## 4. 归档

  执行：

  ```text
  /opsx:archive
  ```

  AI 会进行类似以下操作：

  ```text
  AI：正在归档 add-dark-mode……
  
       ✓ 将规范合并到 openspec/specs/ui/spec.md
       ✓ 移动到 openspec/changes/archive/2025-01-24-add-dark-mode/
       完成！可以开始下一个功能。
  ```

  此时，你的 Delta Spec 已经成为主规范的一部分，并记录了系统行为的变化过程。

  # 验证和审查

  你可以使用 CLI 查看和检查当前的变更。

  ## 查看当前所有 Change

  ```bash
  openspec list
  ```

  ## 查看某个 Change 的详细信息

  ```bash
  openspec show add-dark-mode
  ```

  ## 验证规范格式

  ```bash
  openspec validate add-dark-mode
  ```

  ## 打开交互式仪表盘

  ```bash
  openspec view
  ```

  # 下一步

  - **Explore First**（先探索）——使用 `/opsx:explore`，在真正开始之前先把想法梳理清楚
  - **Reviewing a Change**（审查 Change）——在 AI 开始编写代码之前，检查 AI 生成的计划
  - **Writing Good Specs**（编写高质量规范）——学习如何编写优秀的需求和场景
  - **Using OpenSpec in an Existing Project**（在已有项目中使用 OpenSpec）——如何在大型已有代码库中开始使用 OpenSpec
  - **Editing & Iterating on a Change**（编辑和迭代 Change）——修改工件、返回前面的步骤，以及处理手工修改
  - **Core Concepts at a Glance**（核心概念速览）——一页了解 OpenSpec 的完整思维模型
  - **Examples & Recipes**（示例与实践）——查看从开始到完成的真实变更案例
  - **Workflows**（工作流）——常见工作模式以及什么时候应该使用不同命令
  - **Commands**（命令）——所有斜杠命令的完整参考
  - **Concepts**（概念）——深入理解规范、变更和 Schema
  - **Customization**（自定义）——按照自己的方式配置 OpenSpec
  - **Stores**（存储，Beta）——如果规划需要跨仓库或跨团队，可以将其存放在独立仓库中
  - **FAQ / Troubleshooting**（常见问题 / 故障排除）——遇到问题时查看解决方案