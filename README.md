# 门户网站前端项目

基于 Vue 3 + TypeScript + Vite + Pinia 构建的企业门户网站前端项目。

## How to Run

### 本地开发

```bash
cd frontend-portal
npm install
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
docker-compose up --build -d
```

访问 http://localhost:8081

## Services

| 服务 | 端口 | 说明 |
|------|------|------|
| frontend-portal | 8081 | 门户网站前端 |

## 测试账号

本项目为纯前端项目，无需登录账号。

## 题目内容

帮我初始化一个门户网站的前端项目，使用的技术栈是 Vue 3, TypeScript, Vite, Pinia。

---

## 技术栈

- Vue 3.4 - 渐进式 JavaScript 框架
- TypeScript 5.4 - 类型安全
- Vite 5.2 - 下一代前端构建工具
- Pinia 2.1 - Vue 状态管理
- Vue Router 4.3 - 官方路由
- Element Plus 2.6 - UI 组件库
- Axios 1.6 - HTTP 客户端
- Sass - CSS 预处理器

## 项目结构

```
frontend-portal/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   ├── components/        # 公共组件
│   │   ├── common/        # 通用组件
│   │   └── layout/        # 布局组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型
│   ├── views/             # 页面视图
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── Dockerfile             # Docker 构建文件
├── nginx.conf             # Nginx 配置
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript 配置
└── vite.config.ts         # Vite 配置
```

## 功能模块

- 首页 - Banner轮播、特色服务、新闻动态、产品展示
- 关于我们 - 公司简介、发展历程、团队介绍
- 新闻中心 - 新闻列表、分类筛选、详情页
- 产品服务 - 产品展示、分类筛选、详情弹窗
- 联系我们 - 联系信息、在线留言表单

## 开发命令

```bash
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览生产构建
npm run type-check  # 类型校验（vue-tsc）
npm run lint        # 代码检查（ESLint，只检查不修改）
npm run lint:fix    # 代码检查并自动修复可修复项
npm run check       # 完整检查流程：类型校验 + 代码检查
```

## 代码检查流程

本地检查与上线前检查（CI）使用同一套标准，提交流程：

```bash
cd frontend-portal
npm ci          # 按 lockfile 干净安装依赖（与 CI 一致）
npm run check   # 依次执行类型校验、代码检查
```

- 流程中任何一步失败即中断，终端会显示失败步骤的名称与具体错误（文件、行号、规则），修复后重新执行 `npm run check` 即可。
- 上线前检查由 GitHub Actions（`.github/workflows/ci.yml`）在 push 到 main 及 Pull Request 时自动执行：检出代码 → 安装 Node.js（缓存 npm 依赖）→ `npm ci` → `npm run type-check` → `npm run lint`，与本地命令完全一致；失败的任务可直接在 Actions 页面重试。
- ESLint 配置见 `frontend-portal/.eslintrc.cjs`，忽略目录见 `frontend-portal/.eslintignore`。
