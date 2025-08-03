import { Request, Response } from 'express'
import { Assessment } from '../models/Assessment'
import { AssessmentQuestion } from '../models/AssessmentQuestion'
import { Chapter } from '../models/Chapter'
import { Topic } from '../models/Topic'
import { KimiService } from '../services/KimiService'

export class AssessmentController {
  /**
   * 开始测评 - 生成题目
   */
  static async startAssessment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { chapter_id, question_count = 10 } = req.body

      // 获取章节信息和知识点
      const chapter = await Chapter.findOne({
        where: { id: chapter_id, is_active: true },
        include: [
          {
            model: Topic,
            as: 'topics',
            where: { is_active: true },
            attributes: ['id', 'name', 'description', 'difficulty']
          }
        ]
      })

      if (!chapter) {
        return res.status(404).json({ message: '章节不存在' })
      }

      if (!chapter.topics || chapter.topics.length === 0) {
        return res.status(400).json({ message: '该章节暂无可用知识点' })
      }

      // 创建测评记录
      const assessment = await Assessment.create({
        user_id: userId,
        chapter_id: chapter_id,
        total_questions: question_count,
        correct_answers: 0,
        score: 0,
        time_spent: 0,
        completed_at: null
      })

      // 使用Kimi API生成题目
      const topicNames = chapter.topics.map(topic => topic.name)
      const generatedQuestions = await KimiService.generateAssessmentQuestions(
        chapter.name,
        topicNames,
        chapter.grade,
        question_count
      )

      // 保存生成的题目
      const questions = await Promise.all(
        generatedQuestions.map(async (q, index) => {
          return await AssessmentQuestion.create({
            assessment_id: assessment.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options ? JSON.stringify(q.options) : null,
            correct_answer: q.correct_answer,
            user_answer: null,
            is_correct: false,
            solution: q.solution,
            difficulty: q.difficulty,
            knowledge_points: JSON.stringify(q.knowledge_points),
            order_index: index + 1
          })
        })
      )

      // 返回测评信息和题目（不包含正确答案）
      const questionsForClient = questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options ? JSON.parse(q.options) : null,
        order_index: q.order_index
      }))

      res.status(201).json({
        message: '测评开始成功',
        data: {
          assessment_id: assessment.id,
          chapter: {
            id: chapter.id,
            name: chapter.name,
            description: chapter.description,
            grade: chapter.grade
          },
          total_questions: question_count,
          questions: questionsForClient
        }
      })

    } catch (error: any) {
      console.error('开始测评失败:', error)
      res.status(500).json({ 
        message: '开始测评失败', 
        details: error.message 
      })
    }
  }

  /**
   * 提交答案
   */
  static async submitAnswer(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { assessment_id, question_id, user_answer } = req.body

      // 验证测评归属
      const assessment = await Assessment.findOne({
        where: { id: assessment_id, user_id: userId }
      })

      if (!assessment) {
        return res.status(404).json({ message: '测评不存在或无权限' })
      }

      if (assessment.completed_at) {
        return res.status(400).json({ message: '测评已完成，无法修改答案' })
      }

      // 查找题目并更新答案
      const question = await AssessmentQuestion.findOne({
        where: { id: question_id, assessment_id: assessment_id }
      })

      if (!question) {
        return res.status(404).json({ message: '题目不存在' })
      }

      // 判断答案是否正确
      const isCorrect = question.correct_answer.toLowerCase().trim() === 
                       user_answer.toLowerCase().trim()

      // 更新题目答案
      await question.update({
        user_answer: user_answer,
        is_correct: isCorrect
      })

      res.json({
        message: '答案提交成功',
        data: {
          question_id: question.id,
          is_correct: isCorrect
        }
      })

    } catch (error: any) {
      console.error('提交答案失败:', error)
      res.status(500).json({ message: '提交答案失败' })
    }
  }

  /**
   * 完成测评
   */
  static async completeAssessment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { assessment_id, time_spent } = req.body

      // 验证测评归属
      const assessment = await Assessment.findOne({
        where: { id: assessment_id, user_id: userId },
        include: [
          {
            model: AssessmentQuestion,
            as: 'questions',
            attributes: ['id', 'question_text', 'question_type', 'correct_answer', 'user_answer', 'is_correct', 'solution']
          },
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'description', 'grade']
          }
        ]
      })

      if (!assessment) {
        return res.status(404).json({ message: '测评不存在或无权限' })
      }

      if (assessment.completed_at) {
        return res.status(400).json({ message: '测评已完成' })
      }

      // 计算成绩
      const questions = assessment.questions || []
      const correctAnswers = questions.filter(q => q.is_correct).length
      const totalQuestions = questions.length
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

      // 更新测评结果
      await assessment.update({
        correct_answers: correctAnswers,
        score: score,
        time_spent: time_spent,
        completed_at: new Date()
      })

      res.json({
        message: '测评完成',
        data: {
          assessment_id: assessment.id,
          chapter: assessment.chapter,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score: score,
          time_spent: time_spent,
          questions: questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            correct_answer: q.correct_answer,
            user_answer: q.user_answer,
            is_correct: q.is_correct,
            solution: q.solution
          }))
        }
      })

    } catch (error: any) {
      console.error('完成测评失败:', error)
      res.status(500).json({ message: '完成测评失败' })
    }
  }

  /**
   * 获取测评历史
   */
  static async getAssessmentHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { page = 1, pageSize = 10 } = req.query
      const offset = (Number(page) - 1) * Number(pageSize)

      const { count, rows: assessments } = await Assessment.findAndCountAll({
        where: { 
          user_id: userId,
          completed_at: { [require('sequelize').Op.ne]: null }
        },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'description', 'grade']
          }
        ],
        order: [['completed_at', 'DESC']],
        limit: Number(pageSize),
        offset: offset,
        attributes: ['id', 'total_questions', 'correct_answers', 'score', 'time_spent', 'completed_at']
      })

      res.json({
        message: '获取测评历史成功',
        data: assessments,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: count,
          totalPages: Math.ceil(count / Number(pageSize))
        }
      })

    } catch (error: any) {
      console.error('获取测评历史失败:', error)
      res.status(500).json({ message: '获取测评历史失败' })
    }
  }

  /**
   * 获取测评详情
   */
  static async getAssessmentDetail(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { id } = req.params

      const assessment = await Assessment.findOne({
        where: { id: id, user_id: userId },
        include: [
          {
            model: AssessmentQuestion,
            as: 'questions',
            attributes: ['id', 'question_text', 'question_type', 'options', 'correct_answer', 'user_answer', 'is_correct', 'solution', 'order_index'],
            order: [['order_index', 'ASC']]
          },
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'description', 'grade']
          }
        ]
      })

      if (!assessment) {
        return res.status(404).json({ message: '测评不存在或无权限' })
      }

      // 解析选项JSON
      const questionsWithParsedOptions = assessment.questions?.map(q => ({
        ...q.toJSON(),
        options: q.options ? JSON.parse(q.options) : null
      }))

      res.json({
        message: '获取测评详情成功',
        data: {
          ...assessment.toJSON(),
          questions: questionsWithParsedOptions
        }
      })

    } catch (error: any) {
      console.error('获取测评详情失败:', error)
      res.status(500).json({ message: '获取测评详情失败' })
    }
  }
}