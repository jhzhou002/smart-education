import { Router } from 'express'
import { DebugController } from '../controllers/DebugController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 所有调试路由都需要认证
router.use(authenticateToken)

// 生成练习题目（调试版本）
router.post('/generate-practice', DebugController.generatePracticeQuestions)

// 生成测评题目（调试版本）
router.post('/generate-assessment', DebugController.generateAssessmentQuestions)

// 获取API配置信息
router.get('/api-info', DebugController.getApiInfo)

export default router