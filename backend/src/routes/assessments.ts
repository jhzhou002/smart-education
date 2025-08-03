import { Router } from 'express'
import { AssessmentController } from '../controllers/AssessmentController'
import { authenticateToken } from '../middleware/auth'
import { validate, startAssessmentSchema } from '../middleware/validation'

const router = Router()

// 所有测评路由都需要认证
router.use(authenticateToken)

// 开始测评
router.post('/start', validate(startAssessmentSchema), AssessmentController.startAssessment)

// 提交答案
router.post('/submit-answer', AssessmentController.submitAnswer)

// 完成测评
router.post('/complete', AssessmentController.completeAssessment)

// 获取测评历史
router.get('/history', AssessmentController.getAssessmentHistory)

// 获取测评详情
router.get('/:id', AssessmentController.getAssessmentDetail)

export default router