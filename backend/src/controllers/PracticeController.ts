import { Request, Response } from 'express'
import { PracticeQuestion } from '../models/PracticeQuestion'
import { PracticeRecord } from '../models/PracticeRecord'
import { Topic } from '../models/Topic'
import { Chapter } from '../models/Chapter'
import { KimiService } from '../services/KimiService'
import { Op } from 'sequelize'

export class PracticeController {
  /**
   * 获取练习题目
   */
  static async getPracticeQuestions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { 
        topic_id, 
        difficulty, 
        question_type,
        page = 1, 
        pageSize = 10,
        generate = false 
      } = req.query

      // 构建查询条件
      const whereCondition: any = {}
      if (topic_id) whereCondition.topic_id = topic_id
      if (difficulty) whereCondition.difficulty = difficulty
      if (question_type) whereCondition.question_type = question_type

      // 如果需要生成新题目或数据库中题目不足
      let shouldGenerate = generate === 'true'
      
      if (!shouldGenerate) {
        const existingCount = await PracticeQuestion.count({ where: whereCondition })
        shouldGenerate = existingCount < Number(pageSize)
      }

      if (shouldGenerate && topic_id) {
        // 获取知识点信息
        const topic = await Topic.findOne({
          where: { id: topic_id, is_active: true },
          include: [
            {
              model: Chapter,
              as: 'chapter',
              attributes: ['id', 'name', 'grade']
            }
          ]
        })

        if (topic) {
          try {
            // 使用Kimi API生成题目
            const generatedQuestions = await KimiService.generatePracticeQuestions(
              topic.name,
              difficulty as string || '基础',
              Math.max(Number(pageSize), 5)
            )

            // 保存生成的题目
            await Promise.all(
              generatedQuestions.map(async (q) => {
                // 检查是否已存在相似题目
                const existing = await PracticeQuestion.findOne({
                  where: {
                    topic_id: topic_id,
                    question_text: { [Op.like]: `%${q.question_text.substring(0, 20)}%` }
                  }
                })

                if (!existing) {
                  return await PracticeQuestion.create({
                    topic_id: Number(topic_id),
                    question_text: q.question_text,
                    question_type: q.question_type,
                    difficulty: q.difficulty,
                    options: q.options ? JSON.stringify(q.options) : null,
                    correct_answer: q.correct_answer,
                    solution: q.solution,
                    usage_count: 0,
                    correct_rate: 0
                  })
                }
                return null
              })
            )

            console.log(`成功为知识点 ${topic.name} 生成练习题目`)
          } catch (error) {
            console.error('生成练习题目失败:', error)
            // 继续使用现有题目，不阻断流程
          }
        }
      }

      // 查询题目
      const offset = (Number(page) - 1) * Number(pageSize)
      const { count, rows: questions } = await PracticeQuestion.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Topic,
            as: 'topic',
            include: [
              {
                model: Chapter,
                as: 'chapter',
                attributes: ['id', 'name', 'grade']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: Number(pageSize),
        offset: offset
      })

      // 解析选项JSON并隐藏答案
      const questionsForClient = questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        difficulty: q.difficulty,
        options: q.options ? JSON.parse(q.options) : null,
        usage_count: q.usage_count,
        correct_rate: q.correct_rate,
        topic: q.topic
      }))

      res.json({
        message: '获取练习题目成功',
        data: questionsForClient,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: count,
          totalPages: Math.ceil(count / Number(pageSize))
        }
      })

    } catch (error: any) {
      console.error('获取练习题目失败:', error)
      res.status(500).json({ message: '获取练习题目失败' })
    }
  }

  /**
   * 提交练习答案
   */
  static async submitPracticeAnswer(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { question_id, user_answer, time_spent = 0 } = req.body

      // 获取题目信息
      const question = await PracticeQuestion.findByPk(question_id)
      if (!question) {
        return res.status(404).json({ message: '题目不存在' })
      }

      // 判断答案是否正确
      const isCorrect = question.correct_answer.toLowerCase().trim() === 
                       user_answer.toLowerCase().trim()

      // 查找是否已有练习记录
      let practiceRecord = await PracticeRecord.findOne({
        where: {
          user_id: userId,
          question_id: question_id
        }
      })

      if (practiceRecord) {
        // 更新已有记录
        await practiceRecord.update({
          user_answer: user_answer,
          is_correct: isCorrect,
          time_spent: time_spent,
          attempt_count: practiceRecord.attempt_count + 1
        })
      } else {
        // 创建新记录
        practiceRecord = await PracticeRecord.create({
          user_id: userId,
          question_id: question_id,
          user_answer: user_answer,
          is_correct: isCorrect,
          time_spent: time_spent,
          attempt_count: 1
        })
      }

      // 更新题目统计
      await this.updateQuestionStats(question_id)

      res.json({
        message: '答案提交成功',
        data: {
          question_id: question_id,
          is_correct: isCorrect,
          correct_answer: question.correct_answer,
          solution: question.solution,
          attempt_count: practiceRecord.attempt_count
        }
      })

    } catch (error: any) {
      console.error('提交练习答案失败:', error)
      res.status(500).json({ message: '提交练习答案失败' })
    }
  }

  /**
   * 获取错题本
   */
  static async getMistakes(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { page = 1, pageSize = 10 } = req.query
      const offset = (Number(page) - 1) * Number(pageSize)

      const { count, rows: mistakes } = await PracticeRecord.findAndCountAll({
        where: {
          user_id: userId,
          is_correct: false
        },
        include: [
          {
            model: PracticeQuestion,
            as: 'question',
            include: [
              {
                model: Topic,
                as: 'topic',
                include: [
                  {
                    model: Chapter,
                    as: 'chapter',
                    attributes: ['id', 'name', 'grade']
                  }
                ]
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: Number(pageSize),
        offset: offset
      })

      // 解析选项JSON
      const mistakesWithParsedOptions = mistakes.map(m => ({
        ...m.toJSON(),
        question: {
          ...m.question?.toJSON(),
          options: m.question?.options ? JSON.parse(m.question.options) : null
        }
      }))

      res.json({
        message: '获取错题本成功',
        data: mistakesWithParsedOptions,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: count,
          totalPages: Math.ceil(count / Number(pageSize))
        }
      })

    } catch (error: any) {
      console.error('获取错题本失败:', error)
      res.status(500).json({ message: '获取错题本失败' })
    }
  }

  /**
   * 获取练习统计
   */
  static async getPracticeStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      // 总练习次数
      const totalPractices = await PracticeRecord.count({
        where: { user_id: userId }
      })

      // 正确次数
      const correctCount = await PracticeRecord.count({
        where: { user_id: userId, is_correct: true }
      })

      // 错误次数
      const incorrectCount = totalPractices - correctCount

      // 正确率
      const correctRate = totalPractices > 0 ? 
        ((correctCount / totalPractices) * 100).toFixed(1) : '0'

      // 按知识点统计
      const topicStats = await PracticeRecord.findAll({
        where: { user_id: userId },
        include: [
          {
            model: PracticeQuestion,
            as: 'question',
            include: [
              {
                model: Topic,
                as: 'topic',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        attributes: ['is_correct']
      })

      // 统计各知识点的练习情况
      const topicStatsMap = new Map()
      topicStats.forEach(record => {
        const topicName = record.question?.topic?.name
        if (topicName) {
          if (!topicStatsMap.has(topicName)) {
            topicStatsMap.set(topicName, { total: 0, correct: 0 })
          }
          const stats = topicStatsMap.get(topicName)
          stats.total++
          if (record.is_correct) stats.correct++
        }
      })

      const topicStatistics = Array.from(topicStatsMap.entries()).map(([name, stats]) => ({
        topic_name: name,
        total_count: stats.total,
        correct_count: stats.correct,
        correct_rate: ((stats.correct / stats.total) * 100).toFixed(1)
      }))

      res.json({
        message: '获取练习统计成功',
        data: {
          total_practices: totalPractices,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          correct_rate: correctRate,
          topic_statistics: topicStatistics
        }
      })

    } catch (error: any) {
      console.error('获取练习统计失败:', error)
      res.status(500).json({ message: '获取练习统计失败' })
    }
  }

  /**
   * 更新题目统计信息
   */
  private static async updateQuestionStats(questionId: number) {
    try {
      const records = await PracticeRecord.findAll({
        where: { question_id: questionId }
      })

      const usageCount = records.length
      const correctCount = records.filter(r => r.is_correct).length
      const correctRate = usageCount > 0 ? 
        ((correctCount / usageCount) * 100) : 0

      await PracticeQuestion.update(
        {
          usage_count: usageCount,
          correct_rate: correctRate
        },
        {
          where: { id: questionId }
        }
      )
    } catch (error) {
      console.error('更新题目统计失败:', error)
    }
  }
}