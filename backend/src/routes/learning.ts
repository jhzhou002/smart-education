import { Router } from 'express'
import { LearningController } from '../controllers/LearningController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 所有学习计划路由都需要认证
router.use(authenticateToken)

// 生成学习计划
router.post('/generate-plan', LearningController.generateLearningPlan)

// 获取学习计划列表
router.get('/plans', LearningController.getLearningPlans)

// 获取学习计划详情
router.get('/plans/:id', LearningController.getLearningPlan)

// 更新学习任务状态
router.put('/tasks/status', LearningController.updateTaskStatus)

// 获取学习进度
router.get('/progress', LearningController.getLearningProgress)

// 生成学习进度分析
router.post('/progress/analysis', LearningController.generateProgressAnalysis)

export default router