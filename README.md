# 智慧教育 - 高中数学AI辅导平台

一个基于Vue3 + Node.js + MySQL技术栈的高中数学AI辅导平台，通过Kimi AI模型实现个性化学习方案。

## 项目特性

- 🎯 **个性化学习** - 基于AI的个性化学习计划生成
- 📊 **基础检测** - 智能数学基础水平测试
- 🤖 **AI题目生成** - 集成Kimi API生成练习题目
- 📈 **学习进度追踪** - 详细的学习数据分析
- 💻 **现代化界面** - 基于Element Plus的响应式设计
- 🔐 **用户认证** - 完整的用户注册登录系统

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Element Plus** - Vue 3 组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **TypeScript** - 类型安全
- **Sequelize** - ORM数据库操作
- **MySQL** - 关系型数据库
- **JWT** - 用户认证

### 开发工具
- **ESLint** - 代码规范检查
- **Nodemon** - 开发时自动重启
- **Docker** - 容器化部署

## 快速开始

### 环境要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 数据库配置

1. 创建MySQL数据库 `smart_education`
2. 修改 `backend/.env` 文件中的数据库配置

### 启动项目

```bash
# 启动后端服务 (端口: 8000)
cd backend
npm run dev

# 启动前端服务 (端口: 3000)
cd frontend
npm run dev
```

### 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend
npm run build
```

## 项目结构

```
smart-education/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/              # API接口
│   │   ├── components/       # 组件
│   │   ├── stores/           # 状态管理
│   │   ├── types/            # TypeScript类型
│   │   ├── utils/            # 工具函数
│   │   └── views/            # 页面组件
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── services/         # 业务逻辑
│   │   └── utils/            # 工具函数
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # 文档
├── CLAUDE.md                 # Claude开发指南
├── detailed-requirements.md  # 详细需求文档
└── README.md
```

## API文档

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 章节管理
- `GET /api/chapters` - 获取章节列表
- `GET /api/chapters/:id` - 获取章节详情

### 基础测试
- `POST /api/assessments/start` - 开始测试
- `POST /api/assessments/submit` - 提交测试答案

### 学习计划
- `POST /api/learning-plans/generate` - 生成学习计划
- `GET /api/learning-plans/current` - 获取当前学习计划

## 开发说明

### 代码规范
- 使用ESLint进行代码检查
- 遵循TypeScript最佳实践
- 使用Prettier格式化代码

### 提交规范
- 使用语义化提交信息
- 提交前运行测试和代码检查

## 部署

### Docker部署
```bash
# 构建镜像
docker build -t smart-education .

# 运行容器
docker run -p 3000:3000 -p 8000:8000 smart-education
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！