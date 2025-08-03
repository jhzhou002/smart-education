import { Router } from 'express'
import { PracticeController } from '../controllers/PracticeController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 所有练习路由都需要认证
router.use(authenticateToken)

// 获取练习题目
router.get('/questions', PracticeController.getPracticeQuestions)

// 提交练习答案
router.post('/submit-answer', PracticeController.submitPracticeAnswer)

// 获取错题本
router.get('/mistakes', PracticeController.getMistakes)

// 获取练习统计
router.get('/stats', PracticeController.getPracticeStats)

export default router