import { Router } from 'express'
import { ChapterController } from '../controllers/ChapterController'
import { optionalAuth } from '../middleware/auth'

const router = Router()

// 获取章节列表
router.get('/', optionalAuth, ChapterController.getChapters)

// 获取章节详情
router.get('/:id', optionalAuth, ChapterController.getChapter)

// 获取知识点列表
router.get('/:id/topics', optionalAuth, ChapterController.getTopics)

// 获取知识点详情
router.get('/topics/:id', optionalAuth, ChapterController.getTopic)

export default router