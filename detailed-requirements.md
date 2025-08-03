# 高中生数学提分产品详细技术需求文档

## 一、项目概述

### 1.1 项目背景
基于Vue3 + Node.js + MySQL技术栈开发的高中数学AI辅导平台，通过Kimi AI模型实现个性化学习方案。

### 1.2 技术架构
- **前端**: Vue 3 + Composition API + Vite + Element Plus
- **后端**: Node.js + Express.js + TypeScript
- **数据库**: MySQL 8.0+
- **AI集成**: Kimi API
- **部署**: Docker + Nginx

### 1.3 数据库配置
```javascript
DB_CONFIG: {
  host: '8.153.77.15',
  user: 'connect',
  password: 'Zhjh0704.',
  database: 'smart_education',
  port: 3306,
  charset: 'utf8mb4',
  timezone: '+08:00'
}
```

## 二、数据库设计

### 2.1 用户表 (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  school VARCHAR(100),
  grade ENUM('高一', '高二', '高三') NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active'
);
```

### 2.2 知识点章节表 (chapters)
```sql
CREATE TABLE chapters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  grade ENUM('高一', '高二', '高三') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 知识点表 (topics)
```sql
CREATE TABLE topics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chapter_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty ENUM('基础', '中等', '困难') NOT NULL,
  order_index INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);
```

### 2.4 基础测试表 (assessments)
```sql
CREATE TABLE assessments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  time_spent INT NOT NULL, -- 秒
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);
```

### 2.5 测试题目表 (assessment_questions)
```sql
CREATE TABLE assessment_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assessment_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('单选', '多选', '填空', '解答') NOT NULL,
  options JSON, -- 选择题选项
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  kimi_question_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);
```

### 2.6 学习计划表 (learning_plans)
```sql
CREATE TABLE learning_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_score DECIMAL(5,2),
  status ENUM('active', 'completed', 'paused') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2.7 学习任务表 (learning_tasks)
```sql
CREATE TABLE learning_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_id INT NOT NULL,
  chapter_id INT NOT NULL,
  topic_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  estimated_time INT, -- 分钟
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (plan_id) REFERENCES learning_plans(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

### 2.8 练习题目表 (practice_questions)
```sql
CREATE TABLE practice_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  topic_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('单选', '多选', '填空', '解答') NOT NULL,
  difficulty ENUM('基础', '中等', '困难') NOT NULL,
  options JSON,
  correct_answer TEXT NOT NULL,
  solution TEXT,
  kimi_question_id VARCHAR(100),
  usage_count INT DEFAULT 0,
  correct_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

### 2.9 练习记录表 (practice_records)
```sql
CREATE TABLE practice_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_spent INT, -- 秒
  attempt_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES practice_questions(id)
);
```

### 2.10 学习进度表 (learning_progress)
```sql
CREATE TABLE learning_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  topic_id INT,
  mastery_level DECIMAL(5,2) DEFAULT 0, -- 掌握程度 0-100
  practice_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  last_practice TIMESTAMP NULL,
  weak_points JSON, -- 薄弱知识点
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  UNIQUE KEY unique_user_topic (user_id, topic_id)
);
```

## 三、API接口设计

### 3.1 用户认证模块

#### 3.1.1 用户注册
- **接口**: `POST /api/auth/register`
- **参数**:
```json
{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "name": "string",
  "school": "string",
  "grade": "高一|高二|高三"
}
```

#### 3.1.2 用户登录
- **接口**: `POST /api/auth/login`
- **参数**:
```json
{
  "email": "string",
  "password": "string"
}
```

#### 3.1.3 获取用户信息
- **接口**: `GET /api/auth/profile`
- **需要认证**: 是

### 3.2 基础测试模块

#### 3.2.1 获取章节列表
- **接口**: `GET /api/chapters`
- **参数**: `grade` (可选)

#### 3.2.2 开始基础测试
- **接口**: `POST /api/assessments/start`
- **参数**:
```json
{
  "chapter_id": "number",
  "question_count": "number"
}
```

#### 3.2.3 提交测试答案
- **接口**: `POST /api/assessments/submit`
- **参数**:
```json
{
  "assessment_id": "number",
  "answers": [
    {
      "question_id": "number",
      "answer": "string"
    }
  ]
}
```

### 3.3 学习计划模块

#### 3.3.1 生成学习计划
- **接口**: `POST /api/learning-plans/generate`
- **参数**:
```json
{
  "assessment_results": "array",
  "target_score": "number",
  "available_time": "number",
  "plan_duration": "number"
}
```

#### 3.3.2 获取学习计划
- **接口**: `GET /api/learning-plans/current`

#### 3.3.3 更新任务状态
- **接口**: `PUT /api/learning-tasks/:id/status`
- **参数**:
```json
{
  "status": "pending|in_progress|completed"
}
```

### 3.4 练习题目模块

#### 3.4.1 获取练习题目
- **接口**: `GET /api/practice/questions`
- **参数**: `topic_id`, `difficulty`, `count`

#### 3.4.2 提交练习答案
- **接口**: `POST /api/practice/submit`
- **参数**:
```json
{
  "question_id": "number",
  "answer": "string",
  "time_spent": "number"
}
```

### 3.5 Kimi API集成模块

#### 3.5.1 生成题目
- **接口**: `POST /api/kimi/generate-questions`
- **内部调用**: Kimi API `/math/questions`

#### 3.5.2 生成学习计划
- **接口**: `POST /api/kimi/generate-plan`
- **内部调用**: Kimi API `/math/learning-plan`

## 四、前端页面设计

### 4.1 页面结构
```
/
├── 登录注册页 (/auth)
│   ├── 登录 (/auth/login)
│   └── 注册 (/auth/register)
├── 主页 (/dashboard)
├── 基础测试 (/assessment)
│   ├── 章节选择 (/assessment/chapters)
│   ├── 测试进行 (/assessment/test/:id)
│   └── 测试结果 (/assessment/result/:id)
├── 学习计划 (/learning)
│   ├── 计划概览 (/learning/overview)
│   ├── 任务详情 (/learning/tasks/:id)
│   └── 计划调整 (/learning/adjust)
├── 练习中心 (/practice)
│   ├── 题目练习 (/practice/questions)
│   └── 错题本 (/practice/mistakes)
├── 学习进度 (/progress)
│   ├── 进度概览 (/progress/overview)
│   └── 详细分析 (/progress/analysis)
└── 个人中心 (/profile)
    ├── 个人信息 (/profile/info)
    └── 设置 (/profile/settings)
```

### 4.2 核心组件设计

#### 4.2.1 测试组件 (TestComponent)
- 题目展示
- 选项选择/答案输入
- 时间计时
- 进度显示
- 提交确认

#### 4.2.2 学习计划组件 (LearningPlanComponent)
- 计划时间轴
- 任务卡片
- 进度条
- 完成度统计

#### 4.2.3 练习题组件 (PracticeComponent)
- 题目显示
- 解析展示
- 收藏功能
- 难度标识

## 五、技术实现要点

### 5.1 前端技术栈
- **Vue 3**: Composition API + TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI库**: Element Plus
- **HTTP客户端**: Axios
- **图表**: ECharts
- **富文本**: MathJax (数学公式渲染)

### 5.2 后端技术栈
- **运行环境**: Node.js 18+
- **Web框架**: Express.js + TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT + bcrypt
- **API文档**: Swagger
- **日志**: Winston
- **缓存**: Redis (可选)

### 5.3 安全考虑
- JWT token认证
- 密码加密存储
- API接口限流
- 输入数据验证
- SQL注入防护
- XSS攻击防护

### 5.4 性能优化
- 前端代码分割
- 图片懒加载
- API响应缓存
- 数据库索引优化
- CDN静态资源

## 六、开发计划

### 阶段一：基础架构 (1-2周)
1. 项目初始化和环境搭建
2. 数据库设计和创建
3. 用户认证模块开发
4. 基础页面框架搭建

### 阶段二：核心功能 (2-3周)
1. 基础测试模块开发
2. Kimi API集成
3. 学习计划生成功能
4. 练习题目模块

### 阶段三：完善功能 (1-2周)
1. 学习进度追踪
2. 数据分析和可视化
3. 错题本功能
4. 用户体验优化

### 阶段四：测试部署 (1周)
1. 功能测试
2. 性能测试
3. 部署上线
4. 监控配置

## 七、部署配置

### 7.1 Docker配置
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]

# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### 7.2 Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/smart-education/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 八、测试策略

### 8.1 单元测试
- 前端组件测试 (Jest + Vue Test Utils)
- 后端API测试 (Jest + Supertest)
- 数据库模型测试

### 8.2 集成测试
- API接口测试
- 数据库连接测试
- 第三方服务集成测试

### 8.3 端到端测试
- 用户流程测试 (Cypress)
- 浏览器兼容性测试
- 移动端适配测试