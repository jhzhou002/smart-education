import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import { initDatabase } from './config/init-database'

// 加载环境变量
config()

const app = express()
const PORT = process.env.PORT || 8000

// 中间件配置
app.use(helmet()) // 安全头
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁，请稍后再试'
})
app.use('/api', limiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 路由
import authRoutes from './routes/auth'
import chaptersRoutes from './routes/chapters'
import assessmentRoutes from './routes/assessments'
import practiceRoutes from './routes/practice'
import learningRoutes from './routes/learning'

app.use('/api/auth', authRoutes)
app.use('/api/chapters', chaptersRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/practice', practiceRoutes)
app.use('/api/learning', learningRoutes)

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ message: '接口不存在' })
})

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message 
  })
})

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase()
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`)
      console.log(`环境: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

export default app