import { Request, Response } from 'express'
import { Chapter } from '../models/Chapter'
import { Topic } from '../models/Topic'

export class ChapterController {
  // 获取章节列表
  static async getChapters(req: Request, res: Response) {
    try {
      const { grade } = req.query

      const whereCondition: any = { is_active: true }
      if (grade) {
        whereCondition.grade = grade
      }

      const chapters = await Chapter.findAll({
        where: whereCondition,
        include: [
          {
            model: Topic,
            as: 'topics',
            where: { is_active: true },
            required: false,
            attributes: ['id', 'name', 'description', 'difficulty', 'order_index']
          }
        ],
        order: [['order_index', 'ASC'], [{ model: Topic, as: 'topics' }, 'order_index', 'ASC']]
      })

      res.json({
        message: '获取章节列表成功',
        data: chapters
      })
    } catch (error) {
      console.error('获取章节列表失败:', error)
      res.status(500).json({ message: '获取章节列表失败' })
    }
  }

  // 获取章节详情
  static async getChapter(req: Request, res: Response) {
    try {
      const { id } = req.params

      const chapter = await Chapter.findOne({
        where: { id, is_active: true },
        include: [
          {
            model: Topic,
            as: 'topics',
            where: { is_active: true },
            required: false,
            attributes: ['id', 'name', 'description', 'difficulty', 'order_index']
          }
        ]
      })

      if (!chapter) {
        return res.status(404).json({ message: '章节不存在' })
      }

      res.json({
        message: '获取章节详情成功',
        data: chapter
      })
    } catch (error) {
      console.error('获取章节详情失败:', error)
      res.status(500).json({ message: '获取章节详情失败' })
    }
  }

  // 获取知识点列表
  static async getTopics(req: Request, res: Response) {
    try {
      const { chapter_id, difficulty } = req.query

      const whereCondition: any = { is_active: true }
      if (chapter_id) {
        whereCondition.chapter_id = chapter_id
      }
      if (difficulty) {
        whereCondition.difficulty = difficulty
      }

      const topics = await Topic.findAll({
        where: whereCondition,
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade']
          }
        ],
        order: [['order_index', 'ASC']]
      })

      res.json({
        message: '获取知识点列表成功',
        data: topics
      })
    } catch (error) {
      console.error('获取知识点列表失败:', error)
      res.status(500).json({ message: '获取知识点列表失败' })
    }
  }

  // 获取知识点详情
  static async getTopic(req: Request, res: Response) {
    try {
      const { id } = req.params

      const topic = await Topic.findOne({
        where: { id, is_active: true },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade', 'description']
          }
        ]
      })

      if (!topic) {
        return res.status(404).json({ message: '知识点不存在' })
      }

      res.json({
        message: '获取知识点详情成功',
        data: topic
      })
    } catch (error) {
      console.error('获取知识点详情失败:', error)
      res.status(500).json({ message: '获取知识点详情失败' })
    }
  }
}