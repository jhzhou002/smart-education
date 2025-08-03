import { Request, Response } from 'express'
import { LearningPlan } from '../models/LearningPlan'
import { LearningTask } from '../models/LearningTask'
import { Assessment } from '../models/Assessment'
import { Chapter } from '../models/Chapter'
import { Topic } from '../models/Topic'
import { User } from '../models/User'
import { KimiService } from '../services/KimiService'
import { Op } from 'sequelize'

export class LearningController {
  /**
   * 生成学习计划
   */
  static async generateLearningPlan(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { target_score, focus_chapters } = req.body

      // 获取用户信息
      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(404).json({ message: '用户不存在' })
      }

      // 分析用户的测评历史，找出薄弱章节
      const assessments = await Assessment.findAll({
        where: {
          user_id: userId,
          completed_at: { [Op.ne]: null }
        },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade']
          }
        ],
        order: [['completed_at', 'DESC']],
        limit: 10
      })

      // 找出分数较低的章节
      const weakChapters = assessments
        .filter(a => a.score < 70)
        .map(a => a.chapter?.name)
        .filter(name => name)

      // 使用焦点章节或薄弱章节
      const chaptersToFocus = focus_chapters || weakChapters.slice(0, 3)

      if (chaptersToFocus.length === 0) {
        // 如果没有薄弱章节，获取用户年级的所有章节
        const allChapters = await Chapter.findAll({
          where: { grade: user.grade, is_active: true },
          attributes: ['name'],
          limit: 3
        })
        chaptersToFocus.push(...allChapters.map(c => c.name))
      }

      // 使用Kimi API生成学习计划
      const planContent = await KimiService.generateLearningPlan(
        user.name,
        user.grade,
        chaptersToFocus,
        target_score
      )

      // 创建学习计划记录
      const learningPlan = await LearningPlan.create({
        user_id: userId,
        title: `${user.name}的个性化数学学习计划`,
        description: planContent,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        target_score: target_score,
        status: 'active'
      })

      // 为重点章节创建学习任务
      const tasks = await Promise.all(
        chaptersToFocus.map(async (chapterName, index) => {
          const chapter = await Chapter.findOne({
            where: { name: chapterName, is_active: true }
          })

          if (chapter) {
            return await LearningTask.create({
              plan_id: learningPlan.id,
              chapter_id: chapter.id,
              title: `掌握${chapterName}`,
              description: `系统学习和练习${chapterName}相关知识点`,
              target_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000), // 每周一个任务
              estimated_time: 10, // 10小时
              status: 'pending',
              priority: index === 0 ? 'high' : 'medium'
            })
          }
          return null
        })
      )

      const validTasks = tasks.filter(task => task !== null)

      res.status(201).json({
        message: '学习计划生成成功',
        data: {
          plan: {
            id: learningPlan.id,
            title: learningPlan.title,
            description: learningPlan.description,
            start_date: learningPlan.start_date,
            end_date: learningPlan.end_date,
            target_score: learningPlan.target_score,
            status: learningPlan.status
          },
          tasks: validTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            target_date: task.target_date,
            estimated_time: task.estimated_time,
            status: task.status,
            priority: task.priority
          })),
          focus_chapters: chaptersToFocus
        }
      })

    } catch (error: any) {
      console.error('生成学习计划失败:', error)
      res.status(500).json({ 
        message: '生成学习计划失败', 
        details: error.message 
      })
    }
  }

  /**
   * 获取学习计划列表
   */
  static async getLearningPlans(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const plans = await LearningPlan.findAll({
        where: { user_id: userId },
        include: [
          {
            model: LearningTask,
            as: 'tasks',
            include: [
              {
                model: Chapter,
                as: 'chapter',
                attributes: ['id', 'name', 'grade']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      })

      res.json({
        message: '获取学习计划成功',
        data: plans
      })

    } catch (error: any) {
      console.error('获取学习计划失败:', error)
      res.status(500).json({ message: '获取学习计划失败' })
    }
  }

  /**
   * 获取学习计划详情
   */
  static async getLearningPlan(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { id } = req.params

      const plan = await LearningPlan.findOne({
        where: { id: id, user_id: userId },
        include: [
          {
            model: LearningTask,
            as: 'tasks',
            include: [
              {
                model: Chapter,
                as: 'chapter',
                attributes: ['id', 'name', 'grade', 'description']
              },
              {
                model: Topic,
                as: 'topic',
                attributes: ['id', 'name', 'description', 'difficulty']
              }
            ],
            order: [['target_date', 'ASC']]
          }
        ]
      })

      if (!plan) {
        return res.status(404).json({ message: '学习计划不存在' })
      }

      res.json({
        message: '获取学习计划详情成功',
        data: plan
      })

    } catch (error: any) {
      console.error('获取学习计划详情失败:', error)
      res.status(500).json({ message: '获取学习计划详情失败' })
    }
  }

  /**
   * 更新学习任务状态
   */
  static async updateTaskStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { task_id, status } = req.body

      // 验证任务归属
      const task = await LearningTask.findOne({
        where: { id: task_id },
        include: [
          {
            model: LearningPlan,
            as: 'plan',
            where: { user_id: userId }
          }
        ]
      })

      if (!task) {
        return res.status(404).json({ message: '学习任务不存在或无权限' })
      }

      // 更新任务状态
      const updateData: any = { status }
      if (status === 'completed') {
        updateData.completed_at = new Date()
      }

      await task.update(updateData)

      res.json({
        message: '任务状态更新成功',
        data: {
          task_id: task.id,
          status: status,
          completed_at: updateData.completed_at
        }
      })

    } catch (error: any) {
      console.error('更新任务状态失败:', error)
      res.status(500).json({ message: '更新任务状态失败' })
    }
  }

  /**
   * 获取学习进度统计
   */
  static async getLearningProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      // 获取活跃的学习计划
      const activePlan = await LearningPlan.findOne({
        where: { user_id: userId, status: 'active' },
        include: [
          {
            model: LearningTask,
            as: 'tasks'
          }
        ]
      })

      if (!activePlan) {
        return res.json({
          message: '暂无活跃的学习计划',
          data: {
            has_active_plan: false,
            total_tasks: 0,
            completed_tasks: 0,
            progress_rate: 0
          }
        })
      }

      const tasks = activePlan.tasks || []
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(t => t.status === 'completed').length
      const progressRate = totalTasks > 0 ? 
        ((completedTasks / totalTasks) * 100).toFixed(1) : '0'

      // 获取最近的测评成绩
      const recentAssessments = await Assessment.findAll({
        where: {
          user_id: userId,
          completed_at: { [Op.ne]: null }
        },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name']
          }
        ],
        order: [['completed_at', 'DESC']],
        limit: 5
      })

      // 计算平均分
      const averageScore = recentAssessments.length > 0 ?
        (recentAssessments.reduce((sum, a) => sum + a.score, 0) / recentAssessments.length).toFixed(1) :
        '0'

      res.json({
        message: '获取学习进度成功',
        data: {
          has_active_plan: true,
          plan: {
            id: activePlan.id,
            title: activePlan.title,
            start_date: activePlan.start_date,
            end_date: activePlan.end_date,
            target_score: activePlan.target_score
          },
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
          pending_tasks: tasks.filter(t => t.status === 'pending').length,
          progress_rate: progressRate,
          recent_assessments: recentAssessments.map(a => ({
            chapter_name: a.chapter?.name,
            score: a.score,
            completed_at: a.completed_at
          })),
          average_score: averageScore
        }
      })

    } catch (error: any) {
      console.error('获取学习进度失败:', error)
      res.status(500).json({ message: '获取学习进度失败' })
    }
  }

  /**
   * 分析学习数据并生成建议
   */
  static async generateProgressAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      // 获取用户信息
      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(404).json({ message: '用户不存在' })
      }

      // 获取测评历史
      const assessments = await Assessment.findAll({
        where: {
          user_id: userId,
          completed_at: { [Op.ne]: null }
        },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['name']
          }
        ],
        order: [['completed_at', 'DESC']],
        limit: 10
      })

      // 获取练习记录
      const practiceRecords = await require('../models/PracticeRecord').PracticeRecord.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 50
      })

      // 使用Kimi API生成分析报告
      const analysisReport = await KimiService.analyzeProgress(
        user.name,
        assessments,
        practiceRecords
      )

      res.json({
        message: '学习进度分析生成成功',
        data: {
          analysis_report: analysisReport,
          generated_at: new Date()
        }
      })

    } catch (error: any) {
      console.error('生成学习进度分析失败:', error)
      res.status(500).json({ 
        message: '生成学习进度分析失败', 
        details: error.message 
      })
    }
  }
}