# jdfcc.github.io

这是我的个人博客仓库，最早基于 [qiubaiying/qiubaiying.github.io](https://github.com/qiubaiying/qiubaiying.github.io) 搭建，当前已经迁移为 **Astro 静态站点**。

站点地址：<https://jdfcc.github.io>

## 当前技术栈

- Astro 5
- TypeScript
- Astro Content Collections
- GitHub Pages
- GitHub Actions

## 项目结构

```text
.
├─ public/                 # 静态资源，构建时原样输出
│  ├─ assets/              # 文章引用的图片、音频等资源
│  └─ img/                 # 站点通用图片
├─ src/
│  ├─ components/          # 页面组件
│  ├─ content/
│  │  ├─ config.ts         # 文章 schema
│  │  └─ posts/            # Astro 实际读取的文章内容
│  ├─ layouts/             # 页面布局
│  ├─ lib/                 # 内容处理工具
│  ├─ pages/               # 路由页面
│  └─ styles/              # 全局样式
├─ _posts/                 # 旧文章源文件/待迁移文章
├─ scripts/
│  └─ migrate-posts.mjs    # 将 _posts 迁移到 src/content/posts
└─ .github/workflows/      # GitHub Pages 部署工作流
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

常用命令：

```bash
npm run dev          # 启动本地开发服务器
npm run build        # 生成静态站点到 dist/
npm run preview      # 本地预览构建结果
npm run check        # 执行 Astro 类型检查
npm run migrate-posts
```

## 内容组织方式

当前博客文章以 `src/content/posts/` 为构建输入，首页会按 tag 自动分区展示，文章页会生成目录、上下篇导航和固定 permalink。

相关实现位置：

- `src/content/config.ts`
- `src/lib/posts.ts`
- `src/pages/index.astro`
- `src/pages/[...permalink].astro`
- `src/layouts/PostLayout.astro`

## 从旧 `_posts` 迁移文章

仓库里仍然保留了旧的 `_posts/` 目录，用于兼容历史文章和批量迁移。

执行下面的命令后，脚本会把 `_posts/` 下的 Markdown 转换到 `src/content/posts/`：

```bash
npm run migrate-posts
```

迁移脚本位置：`scripts/migrate-posts.mjs`

迁移时会自动处理这些事情：

### 1. 自动补齐文章日期

脚本会优先按下面的顺序推断文章创建时间：

1. Frontmatter 中的 `created`
2. Frontmatter 中的 `date`
3. 文件名中的 `YYYY-MM-DD`
4. Git 首次提交时间
5. 文件系统时间

这样即使旧文章文件名没有日期，也能尽量推导出稳定的发布时间。

### 2. 自动生成规范化 frontmatter

迁移后会统一生成这些字段：

- `title`
- `created`
- `updated`
- `tags`
- `slug`
- `permalink`
- `description`

其中 `permalink` 默认格式为：

```text
/YYYY/MM/DD/slug/
```

### 3. 自动修正静态资源路径

很多旧文章是在 Typora 中编写的，图片经常写成：

```markdown
![image](assets/example.png)
![image](./assets/example.png)
```

这类相对路径在文章详情页下容易解析错位，所以迁移脚本会把它们改写为站点根路径：

```markdown
![image](/assets/example.png)
```

同样的规则也会处理 `img/` 目录，以及 HTML 中的 `img`、`audio`、`video`、`source` 等标签资源引用。

相关实现：

- `scripts/migrate-posts.mjs`
- `src/lib/rewriteAssetPaths.ts`

## 部署

当前仓库使用 GitHub Actions 构建并发布到 GitHub Pages。

工作流文件：`.github/workflows/jekyll-gh-pages.yml`

工作流会执行：

1. `npm ci`
2. `npm run build`
3. 上传 `dist/`
4. 部署到 GitHub Pages

## 说明

这个仓库已经不是原来的 Jekyll 结构，README 中旧版关于 Jekyll 自动改名和模板替换的说明不再适用于当前实现。现在的核心流程是：

- 在 Astro 中维护页面与布局
- 使用 `src/content/posts/` 作为文章数据源
- 通过迁移脚本兼容旧 `_posts/` 内容
- 通过 GitHub Actions 自动部署静态产物
